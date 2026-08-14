/* ================= GAME ENGINE (third-person, MECCHA-style) ================= */
let scene, camera, renderer, clock;
let camYaw = 0, camPitch = -0.30;
let avatar = null, avYawCur = 0, walkPhase = 0, moveAmt = 0;
const keys = {};
const giftMeshes = {};
const moveVec = { x:0, y:0 };

function makeGiftMesh(){
  const g = new THREE.Group();
  const boxMat = new THREE.MeshLambertMaterial({ color: 0xFF6600, emissive: 0x571f00 });
  const ribMat = new THREE.MeshLambertMaterial({ color: 0xFFF3EB });
  const s = 0.34;
  const box = new THREE.Mesh(new THREE.BoxGeometry(s, s*0.72, s), boxMat);
  const lid = new THREE.Mesh(new THREE.BoxGeometry(s*1.12, s*0.16, s*1.12), boxMat);
  lid.position.y = s*0.44;
  const r1 = new THREE.Mesh(new THREE.BoxGeometry(s*0.16, s*0.9, s*1.14), ribMat);
  const r2 = new THREE.Mesh(new THREE.BoxGeometry(s*1.14, s*0.9, s*0.16), ribMat);
  r1.position.y = r2.position.y = s*0.04;
  g.add(box, lid, r1, r2);
  const cv = document.createElement("canvas"); cv.width = cv.height = 128;
  const ctx = cv.getContext("2d");
  const grad = ctx.createRadialGradient(64,64,6,64,64,64);
  grad.addColorStop(0,"rgba(255,150,50,.85)"); grad.addColorStop(1,"rgba(255,102,0,0)");
  ctx.fillStyle = grad; ctx.fillRect(0,0,128,128);
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map:new THREE.CanvasTexture(cv), transparent:true, depthWrite:false, blending:THREE.AdditiveBlending }));
  spr.scale.set(1.5,1.5,1.5);
  g.add(spr);
  return g;
}

function syncGiftMeshes(){
  if (!scene) return;
  for (const [id,g] of Object.entries(gifts)){
    if (g && !g.claimedBy && g.pos && !giftMeshes[id]){
      const m = makeGiftMesh();
      m.position.set(g.pos.x, g.pos.y + 0.25, g.pos.z);
      m.userData.giftId = id;
      m.userData.baseY = g.pos.y + 0.25;
      scene.add(m); giftMeshes[id] = m;
    }
    if (g && g.claimedBy && giftMeshes[id]){
      scene.remove(giftMeshes[id]); delete giftMeshes[id];
    }
  }
  for (const id of Object.keys(giftMeshes)){
    if (!gifts[id]){ scene.remove(giftMeshes[id]); delete giftMeshes[id]; }
  }
}

function initEngine(){
  const canvas = $("c3d");
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias:true }); }
  catch(e){ engineFail("WebGL unavailable"); return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.06;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0C1526);
  scene.fog = new THREE.Fog(0x27334F, 30, 95);
  camera = new THREE.PerspectiveCamera(62, 1, 0.05, 320);
  clock = new THREE.Clock();

  try { covBuildWorld(scene); }
  catch(err){
    console.error(err);
    $("ltext").textContent = "Could not build the space: " + (err && err.message ? err.message : err);
    return;
  }

  avatar = covBuildAvatar();
  scene.add(avatar.g);

  const L = LAYOUT;
  let sx = L.origin[0] + L.gw*L.cell/2, sz = L.origin[1] + L.gh*L.cell/2;
  if (L.tree){
    for (const off of [[2.2,0],[0,2.2],[-2.2,0],[0,-2.2],[1.6,1.6]]){
      if (!covPosBlocked(L.tree[0]+off[0], L.tree[1]+off[1])){
        sx = L.tree[0]+off[0]; sz = L.tree[1]+off[1];
        camYaw = Math.atan2(sx - L.tree[0], sz - L.tree[1]);
        break;
      }
    }
  }
  avatar.g.position.set(sx, 0, sz);
  avYawCur = camYaw + Math.PI;
  avatar.g.rotation.y = avYawCur;
  db.ref("game/config/spawn").once("value").then(s => {
    const sp = s.val();
    if (sp){ avatar.g.position.set(sp.x, 0, sp.z); camYaw = (sp.yaw || 0) + Math.PI; }
  }).catch(()=>{});

  $("load3d").style.display = "none";
  syncGiftMeshes();
  window.addEventListener("resize", sizeCanvas);
  sizeCanvas();
  bindControls(canvas);
  animate();
  setTimeout(()=>{ const h=$("help3d"); if(h){ h.style.opacity="0"; h.style.transition="opacity 1s"; } }, 9000);
}

function sizeCanvas(){
  if (!renderer) return;
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w/h; camera.updateProjectionMatrix();
}

function bindControls(canvas){
  window.addEventListener("keydown", e => keys[e.code] = true);
  window.addEventListener("keyup",   e => keys[e.code] = false);

  const stick = $("stick"), knob = $("stick-knob");
  let stickCX = 0, stickCY = 0;
  const stickCenter = () => {
    const r = stick.getBoundingClientRect();
    stickCX = r.left + r.width/2; stickCY = r.top + r.height/2;
  };

  let lookId = null, moveId = null, lx = 0, ly = 0, moved = 0;
  canvas.addEventListener("pointerdown", e => {
    const isTouch = e.pointerType === "touch";
    if (isTouch && moveId === null && e.clientX < window.innerWidth*0.45 && e.clientY > window.innerHeight*0.45){
      moveId = e.pointerId;
      stick.classList.add("on"); stickCenter();
      return;
    }
    if (lookId === null){ lookId = e.pointerId; lx = e.clientX; ly = e.clientY; moved = 0; }
  });
  canvas.addEventListener("pointermove", e => {
    if (e.pointerId === moveId){
      let dx = e.clientX - stickCX, dy = e.clientY - stickCY;
      const len = Math.hypot(dx,dy), max = 48;
      if (len > max){ dx = dx/len*max; dy = dy/len*max; }
      knob.style.transform = "translate("+dx+"px,"+dy+"px)";
      moveVec.x = dx/max; moveVec.y = dy/max;
      return;
    }
    if (e.pointerId === lookId){
      const dx = e.clientX - lx, dy = e.clientY - ly;
      moved += Math.abs(dx)+Math.abs(dy);
      camYaw   -= dx * 0.005;
      camPitch -= dy * 0.004;
      camPitch = Math.max(-1.05, Math.min(0.35, camPitch));
      lx = e.clientX; ly = e.clientY;
    }
  });
  const endPointer = e => {
    if (e.pointerId === moveId){
      moveId = null; moveVec.x = moveVec.y = 0;
      knob.style.transform = "translate(0,0)";
      stick.classList.remove("on");
      return;
    }
    if (e.pointerId === lookId){
      if (moved < 8) tapClaim(e.clientX, e.clientY);
      lookId = null;
    }
  };
  canvas.addEventListener("pointerup", endPointer);
  canvas.addEventListener("pointercancel", endPointer);
}

function tapClaim(cx, cy){
  if (!camera || !avatar) return;
  const ndc = new THREE.Vector2((cx/window.innerWidth)*2-1, -(cy/window.innerHeight)*2+1);
  const rc = new THREE.Raycaster();
  rc.setFromCamera(ndc, camera);
  const targets = [];
  Object.values(giftMeshes).forEach(g => g.traverse(o => { if (o.isMesh) targets.push(o); }));
  const hits = rc.intersectObjects(targets, false);
  if (!hits.length) return;
  let node = hits[0].object;
  while (node && !node.userData.giftId) node = node.parent;
  if (!node) return;
  if (avatar.g.position.distanceTo(node.position) > 5){
    toast("Walk closer to open that gift."); return;
  }
  attemptClaim(node.userData.giftId);
}

const _camDir = new THREE.Vector3(), _camTarget = new THREE.Vector3();
function lerpAngle(a, b, t){
  let d = (b - a) % (Math.PI*2);
  if (d > Math.PI) d -= Math.PI*2;
  if (d < -Math.PI) d += Math.PI*2;
  return a + d * t;
}

function animate(){
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.1);
  const t = performance.now()/1000;

  // --- input ---
  let fwd = 0, str = 0;
  if (keys["KeyW"] || keys["ArrowUp"]) fwd += 1;
  if (keys["KeyS"] || keys["ArrowDown"]) fwd -= 1;
  if (keys["KeyA"] || keys["ArrowLeft"]) str -= 1;
  if (keys["KeyD"] || keys["ArrowRight"]) str += 1;
  fwd += -moveVec.y; str += moveVec.x;
  const mag = Math.min(1, Math.hypot(fwd, str));
  const speed = ((keys["ShiftLeft"] || keys["ShiftRight"]) ? 4.4 : 2.6) * mag;

  // --- avatar movement (camera-relative) ---
  if (mag > 0.05){
    const len = Math.hypot(fwd, str) || 1;
    const fx = -Math.sin(camYaw), fz = -Math.cos(camYaw);   // camera forward on the ground
    const rx = -fz, rz = fx;                                 // camera right
    const dx = (fx*fwd + rx*str)/len * speed * dt;
    const dz = (fz*fwd + rz*str)/len * speed * dt;
    const p = avatar.g.position;
    if (!covPosBlocked(p.x + dx, p.z)) p.x += dx;
    if (!covPosBlocked(p.x, p.z + dz)) p.z += dz;
    avYawCur = lerpAngle(avYawCur, Math.atan2(dx, dz), 1 - Math.exp(-12*dt));
    avatar.g.rotation.y = avYawCur;
    walkPhase += dt * (5 + speed*1.6);
    moveAmt = Math.min(1, moveAmt + dt*6);
  } else {
    moveAmt = Math.max(0, moveAmt - dt*6);
  }
  const sw = Math.sin(walkPhase) * 0.55 * moveAmt;
  avatar.legL.rotation.x = sw;  avatar.legR.rotation.x = -sw;
  avatar.armL.rotation.x = -sw * 0.8; avatar.armR.rotation.x = sw * 0.8;
  avatar.g.position.y = Math.abs(Math.sin(walkPhase)) * 0.035 * moveAmt;

  // --- orbit camera with wall avoidance ---
  _camTarget.copy(avatar.g.position); _camTarget.y += 1.35;
  _camDir.set(Math.sin(camYaw)*Math.cos(camPitch), -Math.sin(camPitch), Math.cos(camYaw)*Math.cos(camPitch));
  let dist = 3.4;
  for (let s = 0.5; s <= 3.4; s += 0.25){
    const px = _camTarget.x + _camDir.x*s, py = _camTarget.y + _camDir.y*s, pz = _camTarget.z + _camDir.z*s;
    if (py < LAYOUT.wallH - 0.1 && covWallAt(px, pz)){ dist = Math.max(0.6, s - 0.3); break; }
  }
  camera.position.copy(_camTarget).addScaledVector(_camDir, dist);
  if (camera.position.y > LAYOUT.wallH - 0.15) camera.position.y = LAYOUT.wallH - 0.15;
  camera.lookAt(_camTarget);

  // --- gifts idle ---
  for (const m of Object.values(giftMeshes)){
    m.rotation.y = t*0.9;
    m.position.y = m.userData.baseY + Math.sin(t*1.7 + m.userData.baseY)*0.05;
  }
  covAnimateWorld(t, dt);
  renderer.render(scene, camera);
}
