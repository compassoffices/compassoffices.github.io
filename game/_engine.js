/* ============ SHARED FESTIVE WORLD BUILDER (inlined into both pages) ============ */
/* Requires: THREE (r128), LAYOUT (layout.js). Exposes: covBuildWorld(scene),
   covWallAt(x,z), covPosBlocked(x,z), covPickables (array for raycasting surfaces),
   covAnimateWorld(t, dt)  — call each frame for snow + twinkle. */

let covPickables = [];
let _covSnow = null, _covLights = [];
const _covL = typeof LAYOUT !== "undefined" ? LAYOUT : null;
let _covBits = null;

function covWallAt(x, z){
  const L = _covL; if (!L) return false;
  const xi = Math.floor((x - L.origin[0]) / L.cell), zi = Math.floor((z - L.origin[1]) / L.cell);
  if (xi < 0 || zi < 0 || xi >= L.gw || zi >= L.gh) return true;
  const idx = zi * L.gw + xi;
  return ((_covBits[idx >> 3] >> (7 - (idx & 7))) & 1) === 1;
}
function covPosBlocked(x, z){
  const r = 0.28, q = r * 0.71;
  return covWallAt(x+r,z) || covWallAt(x-r,z) || covWallAt(x,z+r) || covWallAt(x,z-r) ||
         covWallAt(x+q,z+q) || covWallAt(x-q,z+q) || covWallAt(x+q,z-q) || covWallAt(x-q,z-q);
}

function _covInstanced(scene, rects, mat, y0, h, pickable){
  if (!rects.length) return null;
  const m = new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1), mat, rects.length);
  const M = new THREE.Matrix4();
  for (let i = 0; i < rects.length; i++){
    const r = rects[i];
    M.makeScale(r[2], h, r[3]);
    M.setPosition(r[0] + r[2]/2, y0 + h/2, r[1] + r[3]/2);
    m.setMatrixAt(i, M);
  }
  m.instanceMatrix.needsUpdate = true;
  scene.add(m);
  if (pickable) covPickables.push(m);
  return m;
}

function covBuildWorld(scene){
  const L = _covL;
  _covBits = Uint8Array.from(atob(L.collision), c => c.charCodeAt(0));
  covPickables = [];

  // ---- lighting ----
  scene.add(new THREE.HemisphereLight(0xfff3e0, 0x574838, 1.05));
  const dir = new THREE.DirectionalLight(0xffe9c9, 0.55);
  dir.position.set(30, 60, 15);
  scene.add(dir);

  // ---- materials ----
  const M_WALL = new THREE.MeshLambertMaterial({ color: 0xF7F2EA });
  const M_CORE = new THREE.MeshLambertMaterial({ color: 0xEAE3D7 });
  const M_WOOD = new THREE.MeshLambertMaterial({ color: 0xC59B66 });
  const M_CARP = new THREE.MeshLambertMaterial({ color: 0x9FA6B3 });
  const M_CEIL = new THREE.MeshLambertMaterial({ color: 0xF2EDE3, emissive: 0x35302a });
  const M_GLASS = new THREE.MeshLambertMaterial({ color: 0xA9CFEC, transparent: true, opacity: 0.25, depthWrite: false });

  // ---- architecture ----
  _covInstanced(scene, L.wood,   M_WOOD, -0.05, 0.05, true);
  _covInstanced(scene, L.carpet, M_CARP, -0.05, 0.05, true);
  _covInstanced(scene, L.walls,  M_WALL, 0, L.wallH, false);
  _covInstanced(scene, L.cores,  M_CORE, 0, L.wallH, false);
  _covInstanced(scene, L.windows, M_WALL, 0, 0.8, true);        // sill
  _covInstanced(scene, L.windows, M_GLASS, 0.8, 1.65, false);   // glass band
  _covInstanced(scene, L.windows, M_WALL, 2.45, 0.10, false);   // header
  const ceilRects = L.wood.concat(L.carpet, L.cores, L.windows);
  _covInstanced(scene, ceilRects, M_CEIL, L.wallH, 0.08, false);

  // ---- fairy lights along the window band ----
  const lightCols = [0xFF5A4E, 0xFFC94E, 0x59D98C];
  const pts = [[],[],[]];
  for (const r of L.windows){
    const horiz = r[2] >= r[3];
    const len = horiz ? r[2] : r[3];
    const n = Math.floor(len / 0.8);
    for (let i = 0; i < n; i++){
      const t = (i + 0.5) / n;
      const x = horiz ? r[0] + r[2]*t : r[0] + r[2]/2;
      const z = horiz ? r[1] + r[3]/2 : r[1] + r[3]*t;
      const ci = (((i + Math.floor(x + z)) % 3) + 3) % 3;
      pts[ci].push([x, 2.15 + Math.sin(i*1.3)*0.06, z]);
    }
  }
  _covLights = [];
  pts.forEach((arr, ci) => {
    if (!arr.length) return;
    const m = new THREE.InstancedMesh(new THREE.SphereGeometry(0.045, 6, 5),
      new THREE.MeshBasicMaterial({ color: lightCols[ci] }), arr.length);
    const M = new THREE.Matrix4();
    arr.forEach((p, i) => { M.makeTranslation(p[0], p[1], p[2]); m.setMatrixAt(i, M); });
    m.instanceMatrix.needsUpdate = true;
    scene.add(m); _covLights.push(m.material);
  });

  // ---- furniture (stylized blocks, colored by height) ----
  const fGroups = { sofa: [], desk: [], plant: [], low: [] };
  for (const f of L.furniture){
    const kind = f.h > 1.0 ? "plant" : (f.h > 0.75 ? "desk" : (f.h > 0.45 ? "sofa" : "low"));
    fGroups[kind].push(f);
  }
  const fMats = {
    sofa: new THREE.MeshLambertMaterial({ color: 0xD9CDB8 }),
    desk: new THREE.MeshLambertMaterial({ color: 0x8B6748 }),
    plant: new THREE.MeshLambertMaterial({ color: 0x4E7A4E }),
    low: new THREE.MeshLambertMaterial({ color: 0xB9AB94 })
  };
  for (const kind of Object.keys(fGroups)){
    const arr = fGroups[kind];
    if (!arr.length) continue;
    const m = new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1), fMats[kind], arr.length);
    const M = new THREE.Matrix4();
    arr.forEach((f, i) => {
      const w = Math.max(0.25, f.w*0.9), d = Math.max(0.25, f.d*0.9);
      M.makeScale(w, f.h, d);
      M.setPosition(f.x, f.h/2, f.z);
      m.setMatrixAt(i, M);
    });
    m.instanceMatrix.needsUpdate = true;
    scene.add(m);
    covPickables.push(m);
  }

  // ---- Christmas tree in the lounge ----
  if (L.tree){
    const g = new THREE.Group();
    const [tx, tz, tr] = L.tree;
    const s = Math.min(1, tr / 1.4);
    const green = new THREE.MeshLambertMaterial({ color: 0x1E5C36 });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.09*s, 0.12*s, 0.5, 8),
      new THREE.MeshLambertMaterial({ color: 0x6B4A2F }));
    trunk.position.y = 0.25; g.add(trunk);
    [[1.05, 1.15, 0.95], [0.8, 1.0, 1.6], [0.52, 0.85, 2.2]].forEach(c => {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(c[0]*s, c[1]*s, 10), green);
      cone.position.y = c[2]*s; g.add(cone);
    });
    const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.16*s),
      new THREE.MeshBasicMaterial({ color: 0xFFD75E }));
    star.position.y = 2.75*s; g.add(star);
    const baubleCols = [0xFF5A4E, 0xFFC94E, 0x6EC1FF, 0xFF8FB0];
    for (let i = 0; i < 34; i++){
      const lvl = Math.random();
      const rad = (1.0 - lvl*0.55) * s * (0.55 + Math.random()*0.35);
      const ang = Math.random()*Math.PI*2;
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.05*s, 6, 5),
        new THREE.MeshBasicMaterial({ color: baubleCols[i % 4] }));
      b.position.set(Math.cos(ang)*rad, (0.6 + lvl*1.7)*s, Math.sin(ang)*rad);
      g.add(b);
    }
    for (let i = 0; i < 6; i++){
      const ang = i / 6 * Math.PI * 2;
      const bx = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.2, 0.28),
        new THREE.MeshLambertMaterial({ color: baubleCols[i % 4] }));
      bx.position.set(Math.cos(ang)*0.75*s, 0.1, Math.sin(ang)*0.75*s);
      bx.rotation.y = ang;
      g.add(bx);
    }
    g.position.set(tx, 0, tz);
    scene.add(g);
  }

  // ---- outside: sky, ground, skyline, moon, snow ----
  const cx = L.origin[0] + L.gw*L.cell/2, cz = L.origin[1] + L.gh*L.cell/2;
  const sky = new THREE.Mesh(new THREE.SphereGeometry(140, 20, 12), (() => {
    const geo = null;
    const mat = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false });
    return mat;
  })());
  {
    const pos = sky.geometry.attributes.position;
    const cols = new Float32Array(pos.count * 3);
    const top = new THREE.Color(0x0C1526), hor = new THREE.Color(0x3E5378);
    for (let i = 0; i < pos.count; i++){
      const t = Math.max(0, Math.min(1, pos.getY(i)/140 * 0.5 + 0.5));
      const c = hor.clone().lerp(top, t);
      cols[i*3] = c.r; cols[i*3+1] = c.g; cols[i*3+2] = c.b;
    }
    sky.geometry.setAttribute("color", new THREE.BufferAttribute(cols, 3));
    sky.position.set(cx, 0, cz);
    scene.add(sky);
  }
  const ground = new THREE.Mesh(new THREE.CircleGeometry(140, 24),
    new THREE.MeshBasicMaterial({ color: 0x1B2740 }));
  ground.rotation.x = -Math.PI/2; ground.position.set(cx, -0.4, cz);
  scene.add(ground);

  const skyMat = new THREE.MeshLambertMaterial({ color: 0x223252, emissive: 0x101a30 });
  const towers = new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1), skyMat, 42);
  {
    const M = new THREE.Matrix4();
    for (let i = 0; i < 42; i++){
      const ang = i/42 * Math.PI*2 + (i%3)*0.05;
      const rad = 55 + (i*37 % 30);
      const w = 5 + (i*13 % 8), h = 14 + (i*29 % 34);
      M.makeScale(w, h, w);
      M.setPosition(cx + Math.cos(ang)*rad, h/2 - 0.4, cz + Math.sin(ang)*rad);
      towers.setMatrixAt(i, M);
    }
    towers.instanceMatrix.needsUpdate = true;
    scene.add(towers);
  }
  const moonCv = document.createElement("canvas"); moonCv.width = moonCv.height = 128;
  const mctx = moonCv.getContext("2d");
  const mg = mctx.createRadialGradient(64,64,18,64,64,64);
  mg.addColorStop(0, "rgba(255,248,225,1)"); mg.addColorStop(0.35, "rgba(255,244,210,.75)"); mg.addColorStop(1, "rgba(255,244,210,0)");
  mctx.fillStyle = mg; mctx.fillRect(0,0,128,128);
  const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(moonCv), transparent: true, fog: false }));
  moon.scale.set(26,26,1);
  moon.position.set(cx + 60, 55, cz - 70);
  scene.add(moon);

  // snow (outside the footprint)
  {
    const N = 1500;
    const posArr = new Float32Array(N*3);
    const halfW = L.gw*L.cell/2, halfH = L.gh*L.cell/2;
    const rMin = Math.hypot(halfW, halfH) * 0.55;
    for (let i = 0; i < N; i++){
      const ang = Math.random()*Math.PI*2;
      const rad = rMin + Math.random()*45;
      posArr[i*3]   = cx + Math.cos(ang)*rad;
      posArr[i*3+1] = Math.random()*22;
      posArr[i*3+2] = cz + Math.sin(ang)*rad;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(posArr, 3));
    _covSnow = new THREE.Points(geo, new THREE.PointsMaterial({
      color: 0xFFFFFF, size: 0.14, transparent: true, opacity: 0.85, fog: false }));
    scene.add(_covSnow);
  }
}

function covAnimateWorld(t, dt){
  if (_covSnow){
    const p = _covSnow.geometry.attributes.position;
    for (let i = 0; i < p.count; i++){
      let y = p.getY(i) - dt * (1.1 + (i % 5) * 0.18);
      if (y < -0.4) y = 22;
      p.setY(i, y);
      p.setX(i, p.getX(i) + Math.sin(t*0.8 + i)*dt*0.15);
    }
    p.needsUpdate = true;
  }
}
