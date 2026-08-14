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

function _covInstanced(scene, rects, mat, y0, h, pickable, colors, blendWhite){
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
  if (colors && m.setColorAt){
    const c = new THREE.Color(), w = new THREE.Color(0xffffff);
    for (let i = 0; i < rects.length; i++){
      c.set("#" + (colors[i] || "F5F0E8"));
      if (blendWhite) c.lerp(w, blendWhite);
      m.setColorAt(i, c);
    }
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }
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

  // ---- procedural materials, styled after the real space photos ----
  function canvasTex(size, draw){
    const cv = document.createElement("canvas"); cv.width = cv.height = size;
    draw(cv.getContext("2d"), size);
    const t = new THREE.CanvasTexture(cv);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  }
  const oakTones = ["#DDBE93","#D0AE82","#E4C79E","#D6B58A","#CCA97B"];
  const texHerring = canvasTex(256, (ctx, S) => {
    ctx.fillStyle = "#D5B58B"; ctx.fillRect(0, 0, S, S);
    const u = S/8;
    for (let i = -10; i < 20; i++){
      for (let j = -2; j < 10; j++){
        ctx.save();
        ctx.translate(i*u, j*u*2 + (((i%2)+2)%2)*u);
        ctx.rotate(Math.PI/4);
        ctx.fillStyle = oakTones[((i*7 + j*13) % 5 + 5) % 5];
        ctx.fillRect(0, 0, u*2.83, u*0.71);
        ctx.strokeStyle = "rgba(120,90,60,.3)"; ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, u*2.83, u*0.71);
        ctx.restore();
      }
    }
  });
  const texCarpet = canvasTex(128, (ctx, S) => {
    const t2 = S/2;
    for (const q of [[0,0,"#72767B"],[t2,0,"#797D82"],[0,t2,"#7C8085"],[t2,t2,"#6F7378"]]){
      ctx.fillStyle = q[2]; ctx.fillRect(q[0], q[1], t2, t2);
    }
    for (let i = 0; i < 450; i++){
      ctx.fillStyle = (i % 2) ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.07)";
      ctx.fillRect(Math.random()*S, Math.random()*S, 1.5, 1.5);
    }
  });
  const texCheck = canvasTex(128, (ctx, S) => {
    const q = S/4;
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++){
      ctx.fillStyle = (i+j) % 2 ? "#161616" : "#F2EEE6";
      ctx.fillRect(i*q, j*q, q, q);
    }
  });

  function zoneFloor(rects, tex, worldPerTile, y){
    const n = rects.length;
    const pos = new Float32Array(n*18), nor = new Float32Array(n*18), uvA = new Float32Array(n*12);
    for (let i = 0; i < n; i++){
      const r = rects[i];
      const x0 = r[0], z0 = r[1], x1 = r[0]+r[2], z1 = r[1]+r[3];
      const P = [x0,z0, x0,z1, x1,z1, x0,z0, x1,z1, x1,z0];
      for (let k = 0; k < 6; k++){
        pos[i*18+k*3] = P[k*2]; pos[i*18+k*3+1] = y; pos[i*18+k*3+2] = P[k*2+1];
        nor[i*18+k*3+1] = 1;
        uvA[i*12+k*2] = P[k*2]/worldPerTile; uvA[i*12+k*2+1] = P[k*2+1]/worldPerTile;
      }
    }
    const G = new THREE.BufferGeometry();
    G.setAttribute("position", new THREE.BufferAttribute(pos,3));
    G.setAttribute("normal", new THREE.BufferAttribute(nor,3));
    G.setAttribute("uv", new THREE.BufferAttribute(uvA,2));
    const mesh = new THREE.Mesh(G, new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide }));
    scene.add(mesh); covPickables.push(mesh);
  }

  // ---- architecture ----
  const M_TINT = new THREE.MeshLambertMaterial({ color: 0xffffff });
  _covInstanced(scene, L.wood,   M_WOOD, -0.05, 0.05, true);   // underlay slabs
  _covInstanced(scene, L.carpet, M_CARP, -0.05, 0.05, true);
  zoneFloor(L.wood, texHerring, 1.9, 0.012);                   // herringbone oak
  zoneFloor(L.carpet, texCarpet, 1.0, 0.012);                  // carpet tiles
  // walls: white where the scan reads light; walnut/marble tones keep their sampled color
  let wallCols = null;
  if (L.wallC){
    wallCols = L.wallC.map(hx => {
      const c = new THREE.Color("#" + (hx || "F4F1EA"));
      const lum = 0.299*c.r + 0.587*c.g + 0.114*c.b;
      return lum > 0.42 ? "F4F1EA" : hx;
    });
  }
  _covInstanced(scene, L.walls,  wallCols ? M_TINT : M_WALL, 0, L.wallH, false, wallCols, 0.12);
  _covInstanced(scene, L.cores,  M_CORE, 0, L.wallH, false);
  _covInstanced(scene, L.windows, M_WALL, 0, 0.8, true);        // sill
  _covInstanced(scene, L.windows, M_GLASS, 0.8, 1.65, false);   // glass band
  _covInstanced(scene, L.windows, M_WALL, 2.45, 0.10, false);   // header
  const ceilRects = L.wood.concat(L.carpet, L.cores, L.windows);
  _covInstanced(scene, ceilRects, M_CEIL, L.wallH, 0.08, false);

  // recessed LED panels over office (carpet) areas — like the real ceiling grid
  {
    const panels = [];
    for (const r of L.carpet){
      if (r[2] < 1.2 || r[3] < 1.2) continue;
      const nx = Math.max(1, Math.round(r[2]/2.8)), nz = Math.max(1, Math.round(r[3]/2.8));
      for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++)
        panels.push([r[0] + r[2]*(i+.5)/nx, r[1] + r[3]*(j+.5)/nz]);
    }
    if (panels.length){
      const m = new THREE.InstancedMesh(new THREE.BoxGeometry(.6,.02,.6),
        new THREE.MeshBasicMaterial({ color: 0xFFF6E2 }), panels.length);
      const M = new THREE.Matrix4();
      panels.forEach((p,i) => { M.makeTranslation(p[0], L.wallH-.05, p[1]); m.setMatrixAt(i,M); });
      m.instanceMatrix.needsUpdate = true;
      scene.add(m);
    }
  }

  // checkered rug under the main lounge sofa (like the real one)
  {
    const inWood = (x,z) => L.wood.some(r => x >= r[0] && x <= r[0]+r[2] && z >= r[1] && z <= r[1]+r[3]);
    let best = null;
    for (const f of L.furniture)
      if (f.t === "sofa" && inWood(f.x, f.z) && (!best || f.w*f.d > best.w*best.d)) best = f;
    if (best){
      const rw = Math.max(best.w, best.d) + 1.8, rd = Math.min(best.w, best.d) + 2.4;
      const tex2 = texCheck.clone(); tex2.needsUpdate = true;
      tex2.wrapS = tex2.wrapT = THREE.RepeatWrapping;
      tex2.repeat.set(rw/1.5, rd/1.5);
      const rug = new THREE.Mesh(new THREE.PlaneGeometry(rw, rd),
        new THREE.MeshLambertMaterial({ map: tex2 }));
      rug.rotation.set(-Math.PI/2, 0, (best.w >= best.d) ? 0 : Math.PI/2);
      rug.position.set(best.x, 0.025, best.z + 0.4);
      scene.add(rug);
    }
  }

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

  // ---- furniture: real parametric shapes, merged into one vertex-colored mesh ----
  const _parts = [];
  const _boxG = new THREE.BoxGeometry(1,1,1).toNonIndexed();
  const _cylG = new THREE.CylinderGeometry(0.5,0.5,1,10).toNonIndexed();
  const _sphG = new THREE.SphereGeometry(0.5,9,7).toNonIndexed();
  function shade(base, mult){
    const c = base.clone();
    c.r = Math.min(1, c.r*mult); c.g = Math.min(1, c.g*mult); c.b = Math.min(1, c.b*mult);
    return c;
  }
  const DARK = new THREE.Color(0x39352F), METAL = new THREE.Color(0x55524C),
        SCREEN = new THREE.Color(0x1B1B1F), POT = new THREE.Color(0x7A7268),
        LEAF1 = new THREE.Color(0x3F6B3F), LEAF2 = new THREE.Color(0x548550);

  function addItem(f, builder){
    const local = [];
    const lp = (geo,color,px,py,pz,sx,sy,sz,ry) =>
      local.push({geo,color,px,py,pz,sx,sy,sz,ry:ry||0});
    const LW = Math.max(f.w, f.d), LD = Math.min(f.w, f.d);
    builder(lp, LW, LD, f);
    let a = (f.w >= f.d) ? 0 : Math.PI/2;                 // long axis
    if (a === 0 && f.o === 2) a = Math.PI;                // flip so back faces the wall
    if (a === Math.PI/2 && f.o === 0) a = -Math.PI/2;
    const rot = new THREE.Matrix4().makeRotationY(a);
    const trans = new THREE.Matrix4().makeTranslation(f.x, 0, f.z);
    for (const p of local){
      const m = new THREE.Matrix4().compose(
        new THREE.Vector3(p.px, p.py, p.pz),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(0, p.ry, 0)),
        new THREE.Vector3(p.sx, p.sy, p.sz));
      m.premultiply(rot).premultiply(trans);
      _parts.push({ geo: p.geo, matrix: m, color: p.color });
    }
  }

  const RATTAN = new THREE.Color(0xC8A36B), CHAIRBLACK = new THREE.Color(0x232326),
        OAKTOP = new THREE.Color(0xD8B98E);
  const B = {
    sofa(lp, LW, LD, f){
      // cream sofa on thin black legs (like the lounge sofas)
      const c = new THREE.Color(f.c ? "#"+f.c : 0xDDD5C4);
      for (const sx of [-1,1]) for (const sz of [-1,1])
        lp(_boxG, CHAIRBLACK, sx*(LW/2-.1), .06, sz*(LD*.42-.06), .05, .12, .05);
      lp(_boxG, c, 0, .27, LD*.03, LW, .30, LD*.85);                        // base
      lp(_boxG, shade(c,.94), 0, .62, -LD/2+.09, LW, .42, .17);             // backrest
      lp(_boxG, shade(c,.92), -(LW/2-.09), .38, 0, .17, .52, LD*.85);       // arms
      lp(_boxG, shade(c,.92),  (LW/2-.09), .38, 0, .17, .52, LD*.85);
      const n = Math.max(1, Math.round(LW/.75));
      const cw = (LW-.4)/n;
      for (let i=0;i<n;i++)
        lp(_boxG, shade(c,1.07), -(LW-.4)/2 + cw*(i+.5), .485, LD*.05, cw*.92, .13, LD*.8-.14);
    },
    chair(lp, LW, LD, f){
      const c = new THREE.Color(f.c ? "#"+f.c : 0xD8CFC0);
      const lum = 0.299*c.r + 0.587*c.g + 0.114*c.b;
      const W = Math.min(LW,.8), D = Math.min(LD,.8);
      if (lum < 0.40){
        // black-frame rattan armchair (like the Jeanneret-style chairs)
        for (const sx of [-1,1]) for (const sz of [-1,1])
          lp(_boxG, CHAIRBLACK, sx*(W/2-.04), .2, sz*(D/2-.04), .05, .4, .05);
        lp(_boxG, RATTAN, 0, .40, 0, W-.06, .05, D-.06);                    // woven seat
        lp(_boxG, RATTAN, 0, .68, -D/2+.05, W-.08, .5, .04, 0);             // woven back
        lp(_boxG, CHAIRBLACK, -(W/2-.03), .55, 0, .04, .04, D-.05);         // arms
        lp(_boxG, CHAIRBLACK,  (W/2-.03), .55, 0, .04, .04, D-.05);
      } else {
        // upholstered tub chair (cafe style)
        lp(_cylG, c, 0, .25, 0, W*.95, .42, D*.95);
        lp(_boxG, shade(c,.93), 0, .55, -D*.3, W*.85, .35, .12);
        lp(_cylG, CHAIRBLACK, 0, .02, 0, W*.5, .04, D*.5);
      }
    },
    desk(lp, LW, LD, f){
      // light oak top, slim black legs, black mesh task chair (like the offices)
      const base = new THREE.Color(f.c ? "#"+f.c : 0xD8B98E);
      const c = base.clone().lerp(OAKTOP, .55);
      const topD = Math.min(LD, .8), tz = -(LD-topD)/2;
      lp(_boxG, c, 0, .725, tz, LW, .05, topD);
      for (const sx of [-1,1]) for (const sz of [-1,1])
        lp(_boxG, CHAIRBLACK, sx*(LW/2-.06), .35, tz+sz*(topD/2-.06), .045, .70, .045);
      if (f.h > 1.0){
        lp(_boxG, SCREEN, 0, 1.05, tz-topD*.18, .52, .32, .03);
        lp(_boxG, CHAIRBLACK, 0, .84, tz-topD*.16, .07, .16, .05);
      }
      const cz = tz + topD/2 + .3;
      lp(_boxG, CHAIRBLACK, 0, .46, cz, .45, .06, .43);                      // seat
      lp(_boxG, new THREE.Color(0x3A3A40), 0, .74, cz+.2, .43, .5, .05);     // mesh back
      lp(_cylG, CHAIRBLACK, 0, .23, cz, .1, .42, .1);
      lp(_cylG, CHAIRBLACK, 0, .02, cz, .46, .04, .46);
    },
    table(lp, LW, LD, f){
      const c = new THREE.Color(f.c ? "#"+f.c : 0xB9AB94);
      if (Math.abs(LW-LD) < .3){
        lp(_cylG, c, 0, .42, 0, LD, .045, LD);
        lp(_cylG, DARK, 0, .21, 0, .09, .38, .09);
        lp(_cylG, DARK, 0, .025, 0, .42, .05, .42);
      } else {
        lp(_boxG, c, 0, .42, 0, LW, .045, LD);
        for (const sx of [-1,1]) for (const sz of [-1,1])
          lp(_boxG, DARK, sx*(LW/2-.06), .2, sz*(LD/2-.06), .05, .4, .05);
      }
    },
    plant(lp, LW, LD, f){
      const s = Math.max(.3, Math.min(LW, LD));
      lp(_cylG, POT, 0, .17, 0, s*.55, .34, s*.55);
      lp(_sphG, LEAF1, 0, .72, 0, s*1.05, s*.95, s*1.05);
      lp(_sphG, LEAF2, s*.12, 1.02, -s*.08, s*.8, s*.75, s*.8);
      lp(_sphG, LEAF1, -s*.1, 1.28, s*.05, s*.55, s*.55, s*.55);
    },
    cabinet(lp, LW, LD, f){
      const c = new THREE.Color(f.c ? "#"+f.c : 0xA99C8A);
      lp(_boxG, c, 0, f.h/2, 0, LW, f.h, LD);
      lp(_boxG, shade(c,.8), 0, f.h+.015, 0, LW+.04, .03, LD+.04);
      lp(_boxG, shade(c,.75), 0, f.h*.5, LD/2+.005, LW*.94, f.h*.86, .01);  // door seam face
    }
  };
  for (const f of L.furniture) addItem(f, B[f.t] || B.cabinet);

  // window frames: mullions + transom (dark bronze)
  {
    const FRAME = new THREE.Color(0x3E3A36);
    for (const r of L.windows){
      const horiz = r[2] >= r[3];
      const len = horiz ? r[2] : r[3];
      const cxr = r[0] + r[2]/2, czr = r[1] + r[3]/2;
      const n = Math.max(1, Math.round(len/1.2));
      for (let i = 0; i <= n; i++){
        const t = i/n;
        const x = horiz ? r[0] + r[2]*t : cxr;
        const z = horiz ? czr : r[1] + r[3]*t;
        _parts.push({ geo:_boxG, color: FRAME, matrix: new THREE.Matrix4()
          .compose(new THREE.Vector3(x, 1.625, z), new THREE.Quaternion(),
                   new THREE.Vector3(horiz?.06:Math.max(r[2],.08), 1.65, horiz?Math.max(r[3],.08):.06)) });
      }
      _parts.push({ geo:_boxG, color: FRAME, matrix: new THREE.Matrix4()
        .compose(new THREE.Vector3(cxr, 2.0, czr), new THREE.Quaternion(),
                 new THREE.Vector3(horiz?r[2]:Math.max(r[2],.09), .05, horiz?Math.max(r[3],.09):r[3])) });
    }
  }
  // skirting along interior walls
  if (L.wallC){
    for (let i = 0; i < L.walls.length; i++){
      const r = L.walls[i];
      const c = shade(new THREE.Color("#"+(L.wallC[i]||"AAA49A")), .55);
      _parts.push({ geo:_boxG, color: c, matrix: new THREE.Matrix4()
        .compose(new THREE.Vector3(r[0]+r[2]/2, .05, r[1]+r[3]/2), new THREE.Quaternion(),
                 new THREE.Vector3(r[2]+.03, .10, r[3]+.03)) });
    }
  }

  // merge everything into ONE mesh with vertex colors
  {
    let total = 0;
    const geos = [];
    for (const p of _parts){
      const g = p.geo.clone(); g.applyMatrix4(p.matrix);
      geos.push([g, p.color]); total += g.attributes.position.count;
    }
    const pos = new Float32Array(total*3), nor = new Float32Array(total*3), col = new Float32Array(total*3);
    let o = 0;
    for (const [g, cc] of geos){
      const nv = g.attributes.position.count;
      pos.set(g.attributes.position.array, o*3);
      nor.set(g.attributes.normal.array, o*3);
      for (let i = 0; i < nv; i++){
        col[(o+i)*3] = cc.r; col[(o+i)*3+1] = cc.g; col[(o+i)*3+2] = cc.b;
      }
      o += nv;
    }
    const G = new THREE.BufferGeometry();
    G.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    G.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
    G.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const mesh = new THREE.Mesh(G, new THREE.MeshLambertMaterial({ vertexColors: true }));
    scene.add(mesh);
    covPickables.push(mesh);
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
