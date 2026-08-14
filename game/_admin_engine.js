/* ---- Festive world placement ---- */
let scene, camera, renderer, clock;
let yaw = 0, pitch = 0, walkY = 1.55;
const keys = {};
const spotMarkers = {}; // spotKey -> mesh

/*@ENGINE*/

function init3D(){
  const canvas = $("c3d");
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias:true }); }
  catch(e){ $("mp-status").textContent = "WebGL unavailable in this browser."; return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0C1526);
  scene.fog = new THREE.Fog(0x27334F, 28, 90);
  camera = new THREE.PerspectiveCamera(72, 1, 0.05, 320);
  camera.rotation.order = "YXZ";
  clock = new THREE.Clock();
  covBuildWorld(scene);
  const L = LAYOUT;
  camera.position.set(L.tree ? L.tree[0]+2.2 : L.origin[0]+L.gw*L.cell/2, walkY,
                      L.tree ? L.tree[1]+2.2 : L.origin[1]+L.gh*L.cell/2);
  $("mp-status").textContent = "Ready — drag to look, WASD to walk (walls don't block you here), click surfaces to place spots.";
  syncSpotMarkers();

  const sizeCanvas = () => {
    const w = canvas.clientWidth || canvas.parentElement.clientWidth, h = 480;
    renderer.setSize(w, h, false);
    camera.aspect = w/h; camera.updateProjectionMatrix();
  };
  window.addEventListener("resize", sizeCanvas); sizeCanvas();

  let lookId = null, lx = 0, ly = 0, moved = 0;
  canvas.addEventListener("pointerdown", e => { lookId = e.pointerId; lx = e.clientX; ly = e.clientY; moved = 0; });
  canvas.addEventListener("pointermove", e => {
    if (e.pointerId !== lookId) return;
    const dx = e.clientX-lx, dy = e.clientY-ly;
    moved += Math.abs(dx)+Math.abs(dy);
    yaw -= dx*0.0038; pitch -= dy*0.0032;
    pitch = Math.max(-1.35, Math.min(1.35, pitch));
    lx = e.clientX; ly = e.clientY;
  });
  const up = e => { if (e.pointerId !== lookId) return; if (moved < 8) clickPlace(e, canvas); lookId = null; };
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", up);
  window.addEventListener("keydown", e => { if (document.activeElement === document.body) keys[e.code] = true; });
  window.addEventListener("keyup",   e => keys[e.code] = false);
  animate();
}

function clickPlace(e, canvas){
  const r = canvas.getBoundingClientRect();
  const ndc = new THREE.Vector2(((e.clientX-r.left)/r.width)*2-1, -((e.clientY-r.top)/r.height)*2+1);
  const rc = new THREE.Raycaster();
  rc.setFromCamera(ndc, camera);
  const markerHits = rc.intersectObjects(Object.values(spotMarkers), false);
  if (markerHits.length){ db.ref("game/spots/"+markerHits[0].object.userData.spotKey).remove(); return; }
  const hits = rc.intersectObjects(covPickables, false);
  if (!hits.length) return;
  const p = hits[0].point;
  db.ref("game/spots").push({ pos:{ x:p.x, y:Math.max(0, p.y), z:p.z }, at: Date.now() });
  $("mp-status").textContent = "Spot saved.";
}

function syncSpotMarkers(){
  if (!scene) return;
  for (const [k,s] of Object.entries(spots)){
    if (!spotMarkers[k]){
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 10),
        new THREE.MeshBasicMaterial({ color: 0x999999 }));
      m.position.set(s.pos.x, s.pos.y + 0.15, s.pos.z);
      m.userData.spotKey = k;
      scene.add(m); spotMarkers[k] = m;
    }
  }
  for (const k of Object.keys(spotMarkers)){
    if (!spots[k]){ scene.remove(spotMarkers[k]); delete spotMarkers[k]; }
  }
}

function animate(){
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.1);
  const t = performance.now()/1000;
  let fwd = 0, str = 0;
  if (keys["KeyW"] || keys["ArrowUp"]) fwd += 1;
  if (keys["KeyS"] || keys["ArrowDown"]) fwd -= 1;
  if (keys["KeyA"] || keys["ArrowLeft"]) str -= 1;
  if (keys["KeyD"] || keys["ArrowRight"]) str += 1;
  const speed = (keys["ShiftLeft"] || keys["ShiftRight"]) ? 5 : 2.8;
  if (fwd || str){
    const len = Math.hypot(fwd, str) || 1;
    const sin = Math.sin(yaw), cos = Math.cos(yaw);
    camera.position.x += (( -sin*fwd ) + ( cos*str )) / len * speed * dt;
    camera.position.z += (( -cos*fwd ) + ( -sin*str )) / len * speed * dt;
  }
  camera.position.y = walkY;
  camera.rotation.set(pitch, yaw, 0);
  covAnimateWorld(t, dt);
  renderer.render(scene, camera);
}
