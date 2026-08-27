/* ============ SKP LOUNGE WORLD ENGINE (shared, inlined into both pages) ============ */
/* Loads the SketchUp lounge (lounge.glb), builds the photo-matched furniture set,
   provides BVH collision + ground raycasts, and the festive avatar.
   Exposes: covLoadWorld, covBuildLoungeSet, covBuildTree, covBuildAvatar, covBlobShadow,
            covColliders, covGroundY, covRayBlocked, covCamDist, covPickables */

let covColliders = [];
let covPickables = [];
const _covRay = new THREE.Raycaster();
_covRay.firstHitOnly = true;
const _covO = new THREE.Vector3(), _covD = new THREE.Vector3();

if (window.MeshBVHLib){
  THREE.BufferGeometry.prototype.computeBoundsTree = MeshBVHLib.computeBoundsTree;
  THREE.BufferGeometry.prototype.disposeBoundsTree = MeshBVHLib.disposeBoundsTree;
  THREE.Mesh.prototype.raycast = MeshBVHLib.acceleratedRaycast;
}

function covAddCollider(mesh){
  if (window.MeshBVHLib && mesh.geometry && !mesh.geometry.boundsTree){
    try { mesh.geometry.computeBoundsTree(); } catch(e){}
  }
  covColliders.push(mesh);
}

function covGroundY(x, z, fromY){
  _covO.set(x, fromY, z); _covD.set(0, -1, 0);
  _covRay.set(_covO, _covD); _covRay.far = fromY + 3;
  const h = _covRay.intersectObjects(covColliders, false);
  return h.length ? h[0].point.y : null;
}
function covRayBlocked(px, py, pz, dx, dz, far){
  const len = Math.hypot(dx, dz) || 1;
  _covO.set(px, py, pz); _covD.set(dx/len, 0, dz/len);
  _covRay.set(_covO, _covD); _covRay.far = far;
  return _covRay.intersectObjects(covColliders, false).length > 0;
}
function covCamDist(target, dir, want){
  _covRay.set(target, dir); _covRay.far = want;
  const h = _covRay.intersectObjects(covColliders, false);
  return h.length ? Math.max(0.12, h[0].distance - 0.06) : want;
}

function covLoadWorld(scene, url, onProgress, onDone, onError){
  const loader = new THREE.GLTFLoader();
  const draco = new THREE.DRACOLoader();
  draco.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");
  loader.setDRACOLoader(draco);
  loader.load(url, gltf => {
    const world = gltf.scene;
    world.traverse(o => {
      if (o.isMesh){
        if (o.material){
          o.material.side = THREE.FrontSide;
          if (o.material.map) o.material.map.anisotropy = 4;
        }
        covAddCollider(o);
      }
    });
    scene.add(world);
    onDone(world);
  }, xhr => { if (xhr.total) onProgress(xhr.loaded / xhr.total); }, onError);
}

/* ---------- canvas material textures (matched to the real photos) ---------- */
function covCanvasTex(size, draw){
  const cv = document.createElement("canvas"); cv.width = cv.height = size;
  draw(cv.getContext("2d"), size);
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
function covRugTexture(){
  // black block-checker on cream, like the real rug: offset vertical bars
  return covCanvasTex(256, (ctx, S) => {
    ctx.fillStyle = "#EFEAE0"; ctx.fillRect(0, 0, S, S);
    const cw = S/8, ch = S/4;             // bars are taller than wide
    for (let r = 0; r < 4; r++){
      for (let c = 0; c < 8; c++){
        if ((r + c) % 2 === 0){
          ctx.fillStyle = "#141414";
          ctx.fillRect(c*cw + 1.5, r*ch + 2, cw - 3, ch - 4);
        }
      }
    }
  });
}
function covCaneTexture(){
  // woven rattan cane
  return covCanvasTex(128, (ctx, S) => {
    ctx.fillStyle = "#CBA96F"; ctx.fillRect(0, 0, S, S);
    ctx.strokeStyle = "rgba(140,105,55,.55)"; ctx.lineWidth = 1.4;
    for (let i = -S; i < S*2; i += 6){
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + S, S); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(i + S, 0); ctx.lineTo(i, S); ctx.stroke();
    }
    ctx.fillStyle = "rgba(70,50,25,.5)";
    for (let y = 3; y < S; y += 6) for (let x = 3; x < S; x += 6) ctx.fillRect(x, y, 1.6, 1.6);
  });
}
function covLinenTexture(){
  return covCanvasTex(128, (ctx, S) => {
    ctx.fillStyle = "#D9D2C2"; ctx.fillRect(0, 0, S, S);
    for (let i = 0; i < 1400; i++){
      ctx.fillStyle = (i % 2) ? "rgba(255,255,255,.06)" : "rgba(110,100,80,.07)";
      ctx.fillRect(Math.random()*S, Math.random()*S, 1.4, 1);
    }
  });
}

/* ---------- the photo-matched lounge set ---------- */
function covBuildLoungeSet(scene, opts){
  const g = new THREE.Group();
  const BLACK = new THREE.MeshLambertMaterial({ color: 0x1A1918 });
  const CANE  = new THREE.MeshLambertMaterial({ map: covCaneTexture(), side: THREE.DoubleSide });
  const LINEN = new THREE.MeshLambertMaterial({ map: covLinenTexture() });
  const LINEN_D = new THREE.MeshLambertMaterial({ color: 0xCCC5B4 });
  const GLASS = new THREE.MeshLambertMaterial({ color: 0x0A0A0C, transparent: true, opacity: 0.92 });

  const box = (mat, x,y,z, sx,sy,sz, ry, rx) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), mat);
    m.scale.set(sx,sy,sz); m.position.set(x,y,z);
    if (ry) m.rotation.y = ry;
    if (rx) m.rotation.x = rx;
    g.add(m); return m;
  };
  const cyl = (mat, x,y,z, r,h) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,14), mat);
    m.position.set(x,y,z); g.add(m); return m;
  };

  // --- rug (2.4 x 3.4 m) ---
  const rugTex = covRugTexture();
  rugTex.repeat.set(1.7, 1.2);
  const rug = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.015, 2.4),
    new THREE.MeshLambertMaterial({ map: rugTex }));
  rug.position.y = 0.008; g.add(rug);

  // --- sofa (2.2m, cream linen, slim black legs) at -z side facing +z ---
  {
    const sz = -0.92;
    for (const lx of [-0.98, 0.98]) for (const lz2 of [sz-0.34, sz+0.34])
      cyl(BLACK, lx, 0.085, lz2, 0.014, 0.17);
    box(LINEN_D, 0, 0.24, sz, 2.2, 0.14, 0.92);                 // frame
    box(LINEN, -0.545, 0.37, sz+0.06, 1.06, 0.15, 0.8);         // seat cushions
    box(LINEN,  0.545, 0.37, sz+0.06, 1.06, 0.15, 0.8);
    box(LINEN, -0.545, 0.62, sz-0.36, 1.05, 0.42, 0.16, 0, -0.06); // back cushions
    box(LINEN,  0.545, 0.62, sz-0.36, 1.05, 0.42, 0.16, 0, -0.06);
    box(LINEN_D, -1.05, 0.5, sz, 0.1, 0.42, 0.9);               // slim arms
    box(LINEN_D,  1.05, 0.5, sz, 0.1, 0.42, 0.9);
  }

  // --- coffee table (1.2 x 0.6, black frame + smoked glass) ---
  {
    for (const lx of [-0.56, 0.56]) for (const lz2 of [-0.26, 0.26])
      box(BLACK, lx, 0.18, 0.1+lz2, 0.02, 0.36, 0.02);
    box(BLACK, 0, 0.355, 0.1, 1.2, 0.025, 0.6);                 // frame rim
    box(GLASS, 0, 0.373, 0.1, 1.14, 0.012, 0.54);               // glass top
    // props: blue vase, books, sculpture
    cyl(new THREE.MeshLambertMaterial({ color: 0x4A5B66 }), -0.3, 0.475, 0.05, 0.055, 0.19);
    cyl(new THREE.MeshLambertMaterial({ color: 0x4A5B66 }), -0.3, 0.59, 0.05, 0.025, 0.05);
    box(new THREE.MeshLambertMaterial({ color: 0xC8332C }), 0.12, 0.398, 0.13, 0.3, 0.025, 0.22, 0.12);
    box(new THREE.MeshLambertMaterial({ color: 0xEDE7DA }), 0.14, 0.42, 0.12, 0.26, 0.02, 0.19, -0.06);
    box(new THREE.MeshLambertMaterial({ color: 0xE8E2D4 }), 0.42, 0.41, 0.0, 0.06, 0.07, 0.05, 0.5);
  }

  // --- two Jeanneret-style cane armchairs facing the sofa ---
  function caneChair(px, pz, ry){
    const c = new THREE.Group();
    const add = (mat, x,y,z, sx,sy,sz, rz2, rx2) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), mat);
      m.scale.set(sx,sy,sz); m.position.set(x,y,z);
      if (rz2) m.rotation.z = rz2;
      if (rx2) m.rotation.x = rx2;
      c.add(m); return m;
    };
    // side frames: V front legs + slanted rear leg + armrest (x = ±0.27)
    for (const s of [-1, 1]){
      const x = s * 0.27;
      add(BLACK, x, 0.28, 0.10, 0.045, 0.6, 0.05, 0, 0.35);    // front leg of V (leans back)
      add(BLACK, x, 0.28, -0.05, 0.045, 0.6, 0.05, 0, -0.28);  // rear leg of V
      add(BLACK, x, 0.30, -0.28, 0.045, 0.62, 0.05, 0, 0.18);  // back support strut
      add(BLACK, x, 0.545, -0.02, 0.05, 0.045, 0.62, 0, 0);    // armrest
    }
    add(BLACK, 0, 0.33, 0.245, 0.55, 0.045, 0.05);             // front seat rail
    const seat = add(CANE, 0, 0.36, -0.01, 0.5, 0.03, 0.52, 0, -0.14);   // cane seat (tilts back)
    const back = add(CANE, 0, 0.62, -0.26, 0.5, 0.55, 0.03, 0, -0.32);   // cane back (leans)
    add(BLACK, 0, 0.86, -0.335, 0.55, 0.05, 0.05, 0, -0.32);   // back top rail
    c.position.set(px, 0, pz);
    c.rotation.y = ry;
    g.add(c);
  }
  caneChair(-0.6, 1.02, Math.PI + 0.28);
  caneChair( 0.62, 1.05, Math.PI - 0.28);

  g.position.set(opts.x || 0, opts.y || 0, opts.z || 0);
  g.rotation.y = opts.yaw || 0;
  g.updateMatrixWorld(true);
  scene.add(g);
  g.traverse(o => { if (o.isMesh){ covAddCollider(o); covPickables.push(o); } });
  return g;
}

/* ---------- Christmas tree + wrapped gifts (full size = giant to a tiny player) ---------- */
function covBuildTree(scene, x, z, yaw){
  const g = new THREE.Group();
  const green = new THREE.MeshLambertMaterial({ color: 0x1E5C36 });
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.4, 8),
    new THREE.MeshLambertMaterial({ color: 0x6B4A2F }));
  trunk.position.y = 0.2; g.add(trunk);
  [[0.8, 0.9, 0.75], [0.62, 0.8, 1.25], [0.4, 0.7, 1.72]].forEach(c => {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(c[0], c[1], 12), green);
    cone.position.y = c[2]; g.add(cone);
  });
  const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.12),
    new THREE.MeshBasicMaterial({ color: 0xFFD75E }));
  star.position.y = 2.16; g.add(star);
  const cols = [0xFF5A4E, 0xFFC94E, 0x6EC1FF, 0xFF8FB0];
  for (let i = 0; i < 26; i++){
    const lvl = (i % 13) / 13;
    const rad = (0.78 - lvl * 0.42) * (0.75 + ((i*7)%4)*0.08);
    const ang = i * 2.39996;
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.038, 6, 5),
      new THREE.MeshBasicMaterial({ color: cols[i % 4] }));
    b.position.set(Math.cos(ang)*rad, 0.5 + lvl*1.3, Math.sin(ang)*rad);
    g.add(b);
  }
  for (let i = 0; i < 5; i++){
    const ang = i / 5 * Math.PI * 2 + 0.5;
    const bx = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.16, 0.22),
      new THREE.MeshLambertMaterial({ color: cols[i % 4] }));
    bx.position.set(Math.cos(ang)*0.6, 0.08, Math.sin(ang)*0.6);
    bx.rotation.y = ang;
    g.add(bx);
  }
  g.position.set(x, 0, z); g.rotation.y = yaw || 0;
  g.updateMatrixWorld(true);
  scene.add(g);
  g.traverse(o => { if (o.isMesh) covAddCollider(o); });
  return g;
}

/* ---------- festive third-person avatar (~1.6m, scale it down outside) ---------- */
function covBuildAvatar(){
  const g = new THREE.Group();
  const M = c => new THREE.MeshLambertMaterial({ color: c });
  const skin = M(0xE8BE9C), suit = M(0x2E3440), shirt = M(0xF2EFE8),
        scarf = M(0xFF6600), hatR = M(0xC0392B), hatW = M(0xF5F2EC), shoe = M(0x1C1C1C);
  const mk = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x,y,z); g.add(m); return m; };
  const legG = new THREE.BoxGeometry(.13,.5,.16); legG.translate(0,-.25,0);
  const armG = new THREE.BoxGeometry(.1,.44,.12); armG.translate(0,-.22,0);
  const legL = mk(legG, suit, -.09, .52, 0);
  const legR = mk(legG.clone(), suit, .09, .52, 0);
  mk(new THREE.BoxGeometry(.14,.05,.24), shoe, -.09, .025, .03);
  mk(new THREE.BoxGeometry(.14,.05,.24), shoe, .09, .025, .03);
  mk(new THREE.BoxGeometry(.36,.52,.22), suit, 0, .78, 0);
  mk(new THREE.BoxGeometry(.3,.22,.23), shirt, 0, .9, .002);
  mk(new THREE.BoxGeometry(.34,.09,.25), scarf, 0, 1.02, 0);
  const armL = mk(armG, suit, -.24, .99, 0);
  const armR = mk(armG.clone(), suit, .24, .99, 0);
  mk(new THREE.SphereGeometry(.15,10,8), skin, 0, 1.22, 0);
  mk(new THREE.CylinderGeometry(.155,.155,.05,10), hatW, 0, 1.32, 0);
  const cone = mk(new THREE.ConeGeometry(.14,.24,10), hatR, 0, 1.44, 0);
  cone.rotation.x = .18;
  mk(new THREE.SphereGeometry(.05,6,5), hatW, 0, 1.56, .045);
  return { g, legL, legR, armL, armR };
}

function covBlobShadow(){
  const cv = document.createElement("canvas"); cv.width = cv.height = 64;
  const ctx = cv.getContext("2d");
  const grad = ctx.createRadialGradient(32,32,4,32,32,30);
  grad.addColorStop(0, "rgba(0,0,0,.42)"); grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad; ctx.fillRect(0,0,64,64);
  const tex = new THREE.CanvasTexture(cv);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1,1),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI/2;
  return m;
}
