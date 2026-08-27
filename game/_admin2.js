function init3D(){
  const canvas = $("c3d");
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias:true }); }
  catch(e){ $("mp-status").textContent = "WebGL unavailable in this browser."; return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x14110E);
  camera = new THREE.PerspectiveCamera(60, 1, 0.01, 80);
  camera.rotation.order = "YXZ";
  clock = new THREE.Clock();
  scene.add(new THREE.HemisphereLight(0xfff3e2, 0x4a4038, 1.15));
  const dl = new THREE.DirectionalLight(0xffeed4, 0.55);
  dl.position.set(6, 12, 4); scene.add(dl);

  covLoadWorld(scene, "lounge.glb",
    p => { $("mp-status").textContent = "Loading the lounge… " + Math.round(p*100) + "%"; },
    () => {
      db.ref("game/config/loungeSet").once("value").then(s => {
        const ls = s.val() || { x: 0, z: 0, yaw: 0 };
        loungeSetGroup = covBuildLoungeSet(scene, ls);
        covBuildTree(scene, ls.x + 2.6, ls.z - 2.3, 0.5);
        worldReady = true;
        camera.position.set(2.5, 1.6, 2.5);
        yaw = 2.4;
        $("mp-status").textContent = "Ready — drag to look, WASD to fly, click any surface to place a hiding spot.";
        syncSpotMarkers();
        animate();
      }).catch(() => {
        loungeSetGroup = covBuildLoungeSet(scene, {x:0,z:0,yaw:0});
        covBuildTree(scene, 2.6, -2.3, 0.5);
        worldReady = true;
        camera.position.set(2.5, 1.6, 2.5); yaw = 2.4;
        syncSpotMarkers(); animate();
        $("mp-status").textContent = "Ready (offline set position).";
      });
    },
    err => { console.error(err); $("mp-status").textContent = "Model failed to load — is lounge.glb next to this file?"; });

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
    pitch = Math.max(-1.4, Math.min(1.4, pitch));
    lx = e.clientX; ly = e.clientY;
  });
  const up = e => { if (e.pointerId !== lookId) return; if (moved < 8) clickPlace(e, canvas); lookId = null; };
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", up);
  window.addEventListener("keydown", e => { if (document.activeElement === document.body) keys[e.code] = true; });
  window.addEventListener("keyup",   e => keys[e.code] = false);
}

$("btn-spawn").onclick = () => {
  if (!camera) return;
  db.ref("game/config/spawn").set({ x:camera.position.x, y:0, z:camera.position.z, yaw:yaw });
  $("mp-status").textContent = "Player start saved — tiny hunters now begin at this spot, facing this way.";
};
$("btn-set").onclick = () => {
  if (!camera) return;
  db.ref("game/config/loungeSet").set({ x:camera.position.x, z:camera.position.z, yaw:yaw });
  $("mp-status").textContent = "Lounge furniture set position saved — reload this page to see it in the new spot.";
};

function clickPlace(e, canvas){
  if (!worldReady) return;
  const r = canvas.getBoundingClientRect();
  const ndc = new THREE.Vector2(((e.clientX-r.left)/r.width)*2-1, -((e.clientY-r.top)/r.height)*2+1);
  const rc = new THREE.Raycaster();
  rc.setFromCamera(ndc, camera);
  const markerHits = rc.intersectObjects(Object.values(spotMarkers), false);
  if (markerHits.length){ db.ref("game/spots/"+markerHits[0].object.userData.spotKey).remove(); return; }
  const hits = rc.intersectObjects(covColliders, false);
  if (!hits.length) return;
  const p = hits[0].point;
  db.ref("game/spots").push({ pos:{ x:p.x, y:Math.max(0, p.y), z:p.z }, at: Date.now() });
  $("mp-status").textContent = "Spot saved (" + p.x.toFixed(1) + ", " + p.y.toFixed(2) + ", " + p.z.toFixed(1) + ").";
}

function syncSpotMarkers(){
  if (!scene) return;
  for (const [k,s] of Object.entries(spots)){
    if (!spotMarkers[k]){
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 9),
        new THREE.MeshBasicMaterial({ color: 0xFF6600 }));
      m.position.set(s.pos.x, s.pos.y + 0.04, s.pos.z);
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
  let fwd = 0, str = 0, up2 = 0;
  if (keys["KeyW"] || keys["ArrowUp"]) fwd += 1;
  if (keys["KeyS"] || keys["ArrowDown"]) fwd -= 1;
  if (keys["KeyA"] || keys["ArrowLeft"]) str -= 1;
  if (keys["KeyD"] || keys["ArrowRight"]) str += 1;
  if (keys["KeyE"]) up2 += 1;
  if (keys["KeyQ"]) up2 -= 1;
  const speed = (keys["ShiftLeft"] || keys["ShiftRight"]) ? 4 : 1.5;
  if (fwd || str || up2){
    const len = Math.hypot(fwd, str) || 1;
    const sin = Math.sin(yaw), cos = Math.cos(yaw);
    camera.position.x += (( -sin*fwd ) + ( cos*str )) / len * speed * dt;
    camera.position.z += (( -cos*fwd ) + ( -sin*str )) / len * speed * dt;
    camera.position.y += up2 * speed * 0.7 * dt;
    camera.position.y = Math.max(0.05, Math.min(2.6, camera.position.y));
  }
  camera.rotation.set(pitch, yaw, 0);
  renderer.render(scene, camera);
}
