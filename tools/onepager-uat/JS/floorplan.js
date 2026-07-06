// ── Room ID → filename slug ────────────────────────────────────────────────
// Handles three naming patterns:
//   Simple:  "15-85"                → "15-85"   (unchanged, file is 15-85.png)
//   Plain C: "15-85 - C"            → "15-85"   (strip suffix, reuses base image)
//   Complex: "15-85 - C (90,93,95)" → "1585_-_C_90_93_95" (Cloudinary slug)
// Convert a data.json `file` value to a URL-safe path.
// "15-85.png"                → "15-85.png"            (unchanged)
// "1585 - C (90,93,95).png" → "1585_-_C_90_93_95.png" (sanitized)
function _fpSanitizeFile(file){
  if(!file) return file;
  const dot=file.lastIndexOf('.');
  if(dot<0) return typeof _fpRoomSlug==='function'?_fpRoomSlug(file):file;
  return (typeof _fpRoomSlug==='function'?_fpRoomSlug(file.slice(0,dot)):file.slice(0,dot))+file.slice(dot);
}

function _fpRoomSlug(oid){
  const s=String(oid||'').trim();
  if(!s) return s;
  // Complex combined room: " - C (...)" pattern → full underscore slug
  if(/\s*-\s*C\s*\(/i.test(s)){
    return s
      .replace(/[()]/g,'')            // strip parentheses
      .replace(/,/g,'_')              // commas → underscores
      .replace(/\s+/g,'_')            // spaces → underscores
      .replace(/(\d)-(\d)/g,'$1$2')   // digit-hyphen-digit: 15-85→1585
      .replace(/_+/g,'_')             // collapse doubles
      .replace(/^_|_$/g,'');          // trim
  }
  // Simple / plain "- C" room: strip optional "- C" suffix (existing behaviour)
  return s.replace(/\s*-\s*C$/i,'').trim();
}

// Compass Offices One-Pager Builder
// https://github.com/compassoffices/compassoffices.github.io

const S={photos:[null,null,null,null,null,null],floorplan:null,partnerLogo:null,rows:[]};
// floorplans: array of {url, label} — index 0 is master (same as S.floorplan for compat)
// fp_page2_same: true = page 2 shows same as page 1 (default)
// fp_base_url: the common prefix URL for room# pattern
let FP_PLANS = [];         // [{url:'...master.jpg', label:'Master'}, {url:'...2412.jpg', label:'2412'}]
let FP_PAGE2_SAME = true;  // true = page2 shows same plans as page1
let FP_PAGE1_IDX = -1;     // -1 = collage (all plans), 0+ = specific plan index
let FP_PAGE2_IDX = -1;     // -1 = collage (all plans), 0+ = specific plan index
let FP_BASE_URL = '';       // e.g. https://compassoffices.com/uploads/2026/03/floorplan_lg1-24-
let FP_DATA_URL = '';       // Full URL to the polygon JSON, e.g. https://…/data.json (may live at a different path than the images)

// ══════════════════════════════════════════════════════════
//  HIGHLIGHT MODE (NEW)
//  When a polygon JSON ({base}data.json) exists on Cloudinary, the floor
//  plan switches from "image collage of separate room PNGs" to "single
//  master PNG with selected rooms highlighted via colored polygons".
//
//  Data flow:
//    setFpBaseUrl(v) -> tryFetchFpData() -> fetches {base}data.json
//      success -> FP_MASTER_DATA = parsed JSON; gen() triggers ensureHighlightRender
//      failure -> FP_MASTER_DATA = null; legacy image-collage mode stays
//
//  Active highlights = (pricing row "office" #s) ∪ FP_HIGHLIGHTS_MANUAL
//  intersected with rooms that actually exist in FP_MASTER_DATA.rooms.
//
//  Rendering is done on an offscreen canvas at the master's native
//  resolution, then output as a PNG data URL that replaces the floor plan
//  <img> src. Result: highlights are baked into a single image, so PDF,
//  print, queue snapshots — every export path — captures them correctly.
// ══════════════════════════════════════════════════════════
let FP_MASTER_DATA = null;          // parsed data.json { version, level, master, rooms[] } or null
let FP_USE_LOCAL   = false;         // use S.floorplan for BOTH pages even if FP_MASTER_DATA exists
let FP_P2_CUSTOM_URL = null;        // dedicated page 2 floor plan image (independent of S.floorplan)
let FP_HIGHLIGHTS_MANUAL = new Set(); // displayLabels added via the Room # input (NOT in pricing)
let FP_HIGHLIGHT_RENDER_URL = null; // current rendered data URL (used as the <img> src on slide)
let FP_HIGHLIGHT_LAST_KEY = null;   // cache key currently in FP_HIGHLIGHT_RENDER_URL
let FP_HIGHLIGHT_PENDING_KEY = null;// next render to do
let FP_HIGHLIGHT_RENDERING = false; // mutex while a render is in flight

// ── 3D floor plan variant ───────────────────────────────
// User uploads a same-dimension 3D-styled master image (e.g. `master-3d.png`)
// alongside `master.png` on Cloudinary. When detected, a [2D | 3D] toggle
// appears under Floor Plan Room # and the highlight overlay renders on top
// of whichever variant is selected. Polygon coords are absolute pixels, so
// the 2D and 3D images MUST be the same width × height — the probe verifies
// this and disables the toggle if they don't match.
let FP_HAS_3D = false;  // probe result: 3D variant exists AND matches dimensions
let FP_USE_3D = false;  // user choice: render the 3D variant on slide

// ── Compass overlay ────────────────────────────────────────────────────────
// A small compass-rose icon shown in the bottom-left corner of the page 2
// floor plan. User can toggle it on/off and drag-rotate it to point true
// north for the building's orientation. Angle 0° = N pointing up (top of
// the image), clockwise positive.
const COMPASS_IMG_URL = 'https://res.cloudinary.com/dutvfdhdp/image/upload/v1776536457/CompassOffices/compass-symbol-icon.png';
let COMPASS_ON    = false; // whether the compass is shown on page 2
let COMPASS_ANGLE = 0;     // rotation in degrees (0 = N up, clockwise)
const FP_HIGHLIGHT_CACHE = {};      // key -> data URL (per-session cache)
let FP_DATA_STATUS = 'idle';        // 'idle' | 'fetching' | 'ok' | 'error'
let FP_DATA_LAST_FETCHED_BASE = ''; // de-dupe fetches when same base URL
let FP_HIGHLIGHT_LAST_ERROR = '';   // last bake error message (shown in status UI)

// Default highlight colour when room has no fillColor (Compass orange).
const FP_DEFAULT_HIGHLIGHT_COLOR = '#FF6600';
let LOGO_SEP='x';
let HIDDEN_SPECS=new Set();
let SHOW_SPECS=true;
let BENEFITS_POS='auto';
let CUSTOM_POS='below';

// ── AUS OFFICE DATA ─────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════
//  FLOOR PLAN ROOM LAYOUT EDITOR
//  MS-Paint-style canvas tool for annotating individual room floor plans.
//  Boxes (labeled zones) + walls (partition lines) drawn on the room image.
//  Annotated image saved per-room in FP_ANNOTATIONS and shown on Page 1.
//  Page 2 master floor plan is completely untouched.
// ══════════════════════════════════════════════════════════════════════════
let FP_ANNOTATIONS = {};          // { [roomId]: { shapes:[], imageDataUrl:'' } }
const FPE_W = 1000, FPE_H = 707; // canvas logical size (A4-ish landscape ratio)
let _fpe = null;                  // editor runtime state (null when closed)


// ── Furniture stamp constants ─────────────────────────────────────────────
// Bounding boxes for hit detection (width, height in canvas px)
const FPE_STAMP_BOUNDS  = { wall_seg:[160,16], door:[72,72], table_chair:[80,100] };
const FPE_STAMP_LABELS  = { wall_seg:'Wall', door:'Door', table_chair:'Table + Chair' };

// Draw a wall segment centered at origin (FPE canvas: 1000×707)
function _fpeDrWall(ctx,sel){
  const w=160,h=16;
  if(sel){ctx.shadowColor='#FF6600';ctx.shadowBlur=14;}
  ctx.fillStyle='#1e1e1e'; ctx.fillRect(-w/2,-h/2,w,h);
  ctx.strokeStyle='rgba(255,255,255,.12)'; ctx.lineWidth=0.8;
  ctx.strokeRect(-w/2,-h/2,w,h); ctx.shadowBlur=0;
}
// Draw an architectural door symbol centered at origin
function _fpeDrDoor(ctx,sel){
  const s=72,jam=10;
  if(sel){ctx.shadowColor='#FF6600';ctx.shadowBlur=14;}
  ctx.strokeStyle='#1e1e1e'; ctx.lineWidth=2.5; ctx.lineCap='square';
  // Hinge jamb
  ctx.beginPath(); ctx.moveTo(-s/2,-jam); ctx.lineTo(-s/2,0); ctx.stroke();
  // Far jamb
  ctx.beginPath(); ctx.moveTo(s/2,-jam);  ctx.lineTo(s/2,0);  ctx.stroke();
  // Door panel (hinge→open position)
  ctx.beginPath(); ctx.moveTo(-s/2,0); ctx.lineTo(-s/2,-s); ctx.stroke();
  // Swing arc (dashed)
  ctx.beginPath(); ctx.arc(-s/2,0,s,-Math.PI/2,0);
  ctx.setLineDash([6,4]); ctx.lineWidth=1.8; ctx.strokeStyle='#666'; ctx.stroke();
  ctx.setLineDash([]); ctx.shadowBlur=0;
}
// Draw a table + chair symbol centered at origin
function _fpeDrTable(ctx,sel){
  const tw=80,th=55,chw=65,chh=18,gap=5;
  if(sel){ctx.shadowColor='#FF6600';ctx.shadowBlur=14;}
  ctx.strokeStyle='#1e1e1e'; ctx.lineWidth=2;
  // Chair seat
  ctx.fillStyle='#e8e4db';
  ctx.fillRect(-chw/2,-th/2-gap-chh,chw,chh); ctx.strokeRect(-chw/2,-th/2-gap-chh,chw,chh);
  // Chair back arc
  ctx.beginPath(); ctx.arc(0,-th/2-gap-chh,chw/2,Math.PI,0); ctx.stroke();
  // Table (rounded rect)
  ctx.fillStyle='#f2ede3'; const r=5;
  ctx.beginPath();
  ctx.moveTo(-tw/2+r,-th/2); ctx.arcTo(tw/2,-th/2,tw/2,th/2,r);
  ctx.arcTo(tw/2,th/2,-tw/2,th/2,r); ctx.arcTo(-tw/2,th/2,-tw/2,-th/2,r);
  ctx.arcTo(-tw/2,-th/2,tw/2,-th/2,r); ctx.closePath();
  ctx.fill(); ctx.stroke(); ctx.shadowBlur=0;
}

function openFpEditor(oid){
  _fpe = {
    roomId: oid, mode: 'box', color: '#FF6600', fontSize: 13,
    shapes: JSON.parse(JSON.stringify(FP_ANNOTATIONS[oid]?.shapes || [])),
    stampMode: null, history: [], selected: -1,
    dragging: false, startX: 0, startY: 0,
    draft: null, pendingLabel: false,
    canvas: null, ctx: null, bgImg: null, bgTainted: false,
  };
  const modal = document.getElementById('fp-editor-modal');
  if(!modal) return;
  modal.style.display = 'flex';
  const title = document.getElementById('fpe-title');
  if(title) title.textContent = `${typeof ui==='function'?ui('fp_edit_room_title'):'Edit Room Layout'} — ${oid}`;
  _fpeSetMode('box', true);
  document.querySelectorAll('.fpe-swatch').forEach((s,i)=>s.classList.toggle('on',i===0));
  _fpe.color = '#FF6600';
  const li = document.getElementById('fpe-label-inp');
  if(li){ li.value=''; li.placeholder='Box label (type after drawing)…'; }
  document.getElementById('fpe-delete-btn').disabled = true;
  _fpeStatus(`Room ${oid} · drag to draw boxes · Apply saves to Page 1`);
  document.addEventListener('keydown', _fpeGlobalKey);
  _fpeInitCanvas();
}

function closeFpEditor(){
  document.removeEventListener('keydown', _fpeGlobalKey);
  const modal = document.getElementById('fp-editor-modal');
  if(modal) modal.style.display = 'none';
  _fpe = null;
}

async function _fpeInitCanvas(){
  const canvas = document.getElementById('fpe-canvas');
  if(!canvas || !_fpe) return;
  _fpe.canvas = canvas; _fpe.ctx = canvas.getContext('2d');
  canvas.width = FPE_W; canvas.height = FPE_H;
  canvas.onmousedown = _fpeMouseDown;
  canvas.onmousemove = e => { _fpeUpdateCursor(e); _fpeMouseMove(e); };
  canvas.onmouseup   = _fpeMouseUp;
  canvas.ondblclick  = _fpeDblClick;
  const url = _fpeGetRoomUrl(_fpe.roomId);
  if(url) await _fpeLoadBg(url);
  else _fpeStatus(`No image found for room ${_fpe.roomId} — annotating on blank canvas`);
  _fpeRender();
}

function _fpeGetRoomUrl(oid){
  const plan = FP_PLANS.find(p=>p.label===oid && !/(master)/i.test(p.label));
  if(plan?.url) return plan.url;
  if(FP_BASE_URL){ return FP_BASE_URL+_fpRoomSlug(oid)+'.png'; }
  if(typeof getActiveHighlightRooms==='function' && FP_BASE_URL){
    const h=getActiveHighlightRooms().find(r=>r.displayLabel===oid);
    if(h) return FP_BASE_URL+(h.file||h.displayLabel+'.png');
  }
  return null;
}

function _fpeLoadBg(url){
  return new Promise(resolve=>{
    if(!_fpe) return resolve();
    const img=new Image(); img.crossOrigin='anonymous';
    img.onload=()=>{ if(_fpe) _fpe.bgImg=img; resolve(); };
    img.onerror=()=>{
      const img2=new Image();
      img2.onload=()=>{ if(_fpe){ _fpe.bgImg=img2; _fpe.bgTainted=true; } resolve(); };
      img2.onerror=()=>resolve();
      img2.src=url;
    };
    img.src=url;
  });
}

function _fpeRender(){
  if(!_fpe?.ctx) return;
  const {ctx}=_fpe, W=FPE_W, H=FPE_H;
  ctx.clearRect(0,0,W,H);
  if(_fpe.bgImg){
    // Draw with object-fit:contain inside an inset area (28px margin each side)
    const PAD=28;
    const iw=_fpe.bgImg.width, ih=_fpe.bgImg.height;
    const scale=Math.min((W-PAD*2)/iw, (H-PAD*2)/ih);
    const dw=iw*scale, dh=ih*scale;
    const dx=(W-dw)/2, dy=(H-dh)/2;
    ctx.fillStyle='#ffffff'; ctx.fillRect(0,0,W,H);   // white background + margin
    ctx.drawImage(_fpe.bgImg, dx, dy, dw, dh);         // centred, no stretch
  } else {
    ctx.fillStyle='#f0f0f0'; ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#999'; ctx.font='bold 15px sans-serif';
    ctx.textAlign='center'; ctx.fillText('Room image loading…',W/2,H/2);
  }
  _fpe.shapes.forEach((s,i)=>_fpeDrawShape(ctx,s,i===_fpe.selected));
  if(_fpe.draft) _fpeDrawShape(ctx,_fpe.draft,false,true);
}

function _fpeDrawShape(ctx,s,selected,isDraft){
  ctx.save();
  if(s.type==='box'){
    const {x,y,w,h}=s;
    ctx.globalAlpha=isDraft?0.1:(selected?0.22:0.18);
    ctx.fillStyle=s.color; ctx.fillRect(x,y,w,h);
    ctx.globalAlpha=1;
    ctx.strokeStyle=s.color; ctx.lineWidth=selected?2.5:1.8;
    ctx.setLineDash(isDraft?[8,4]:[]); ctx.strokeRect(x,y,w,h); ctx.setLineDash([]);
    if(s.label&&!isDraft){
      const fs=s.fontSize||_fpe?.fontSize||13;
      ctx.font=`bold ${fs}px Arial,sans-serif`;
      ctx.textAlign='center'; ctx.textBaseline='middle';
      const tw=ctx.measureText(s.label).width, pad=6;
      const lx=x+w/2, ly=y+h/2;
      ctx.globalAlpha=0.88; ctx.fillStyle=s.color;
      _fpeRRect(ctx,lx-tw/2-pad,ly-fs/2-3,tw+pad*2,fs+6,4); ctx.fill();
      ctx.globalAlpha=1; ctx.fillStyle='#fff'; ctx.fillText(s.label,lx,ly);
    }
    if(selected){
      ctx.fillStyle=s.color;
      [[0,0],[1,0],[0,1],[1,1]].forEach(([xi,yi])=>{
        ctx.beginPath(); ctx.arc(x+xi*w,y+yi*h,5,0,Math.PI*2); ctx.fill();
      });
    }
  } else if(s.type==='wall'){
    ctx.strokeStyle=s.color; ctx.lineWidth=selected?5:3.5; ctx.lineCap='round';
    ctx.setLineDash(isDraft?[8,4]:[]);
    ctx.beginPath(); ctx.moveTo(s.x1,s.y1); ctx.lineTo(s.x2,s.y2); ctx.stroke();
    ctx.setLineDash([]);
    if(selected){
      ctx.fillStyle=s.color;
      [[s.x1,s.y1],[s.x2,s.y2]].forEach(([px,py])=>{
        ctx.beginPath(); ctx.arc(px,py,6,0,Math.PI*2); ctx.fill();
      });
    }
  } else if(s.type==='stamp'){
    ctx.translate(s.cx,s.cy); ctx.rotate(s.r||0);
    if(s.stamp==='wall_seg')    _fpeDrWall(ctx,selected);
    else if(s.stamp==='door')   _fpeDrDoor(ctx,selected);
    else if(s.stamp==='table_chair') _fpeDrTable(ctx,selected);
    if(selected){
      const [bw,bh]=FPE_STAMP_BOUNDS[s.stamp]||[80,80];
      ctx.shadowBlur=0; ctx.fillStyle='#FF6600';
      [[-bw/2,-bh/2],[bw/2,-bh/2],[-bw/2,bh/2],[bw/2,bh/2]].forEach(([px,py])=>{
        ctx.beginPath(); ctx.arc(px,py,5,0,Math.PI*2); ctx.fill();
      });
    }
  }
  ctx.restore();
}

function _fpeRRect(ctx,x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r);
  ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
  ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r);
  ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r); ctx.closePath();
}

function _fpeXY(e){
  const r=_fpe.canvas.getBoundingClientRect();
  return{x:((e.clientX-r.left)/r.width)*FPE_W, y:((e.clientY-r.top)/r.height)*FPE_H};
}
function _fpeUpdateCursor(e){
  if(!_fpe?.canvas) return;
  const {x,y}=_fpeXY(e);
  const hit=_fpeFindShape(x,y);
  _fpe.canvas.style.cursor = hit>=0 ? 'move' : 'crosshair';
}
function _fpeMouseDown(e){
  if(!_fpe) return;
  const {x,y}=_fpeXY(e), hit=_fpeFindShape(x,y);
  // ── Stamp mode: click places a furniture stamp ─────────────────────────
  if(_fpe.stampMode && hit<0){
    _fpe.history.push(JSON.parse(JSON.stringify(_fpe.shapes)));
    _fpe.shapes.push({type:'stamp',stamp:_fpe.stampMode,cx:x,cy:y,r:0,color:_fpe.color});
    _fpe.selected=_fpe.shapes.length-1;
    document.getElementById('fpe-delete-btn').disabled=false;
    _fpeUpdateRotateBtn(); _fpeRender();
    _fpeStatus(`${FPE_STAMP_LABELS[_fpe.stampMode]} placed — drag to move · R to rotate`);
    return;
  }
  if(hit>=0){
    // Select existing shape AND prepare for potential drag-to-move
    _fpe.selected=hit; _fpe.dragging=false; _fpe.moving=false;
    _fpe.moveReady=true;           // will become a move if mouse moves enough
    _fpe.moveAnchorX=x; _fpe.moveAnchorY=y;
    _fpe.moveShapeStart=JSON.parse(JSON.stringify(_fpe.shapes[hit]));
    document.getElementById('fpe-delete-btn').disabled=false;
    const inp=document.getElementById('fpe-label-inp');
    if(inp) inp.value=_fpe.shapes[hit].type==='box'?(_fpe.shapes[hit].label||''):'';
    // Sync font size control to selected box
    if(_fpe.shapes[hit].type==='box'){
      const fs=_fpe.shapes[hit].fontSize||_fpe.fontSize||13;
      _fpe.fontSize=fs;
      const fi=document.getElementById('fpe-font-size'); if(fi) fi.value=fs;
    }
    _fpeUpdateRotateBtn(); _fpeRender(); return;
  }
  // No shape hit — start drawing a new shape
  _fpe.selected=-1; _fpe.moveReady=false; _fpe.moving=false;
  document.getElementById('fpe-delete-btn').disabled=true;
  _fpe.dragging=true; _fpe.startX=x; _fpe.startY=y; _fpe.draft=null;
}
function _fpeMouseMove(e){
  if(!_fpe) return;
  const {x,y}=_fpeXY(e);
  // ── Move mode: drag selected shape ──────────────────────────────
  if(_fpe.moveReady||_fpe.moving){
    const dx=x-_fpe.moveAnchorX, dy=y-_fpe.moveAnchorY;
    if(!_fpe.moving && Math.hypot(dx,dy)<5) return; // threshold — ignore tiny jitter
    if(!_fpe.moving){
      // First significant movement — commit to move mode
      _fpe.moving=true;
      _fpe.history.push(JSON.parse(JSON.stringify(_fpe.shapes))); // undo snapshot
    }
    const orig=_fpe.moveShapeStart, s=_fpe.shapes[_fpe.selected];
    if(!s) return;
    if(s.type==='box'){ s.x=orig.x+dx; s.y=orig.y+dy; }
    else if(s.type==='stamp'){ s.cx=orig.cx+dx; s.cy=orig.cy+dy; }
    else { s.x1=orig.x1+dx; s.y1=orig.y1+dy; s.x2=orig.x2+dx; s.y2=orig.y2+dy; }
    _fpeRender(); return;
  }
  // ── Draw mode: show draft shape ──────────────────────────────────
  if(!_fpe.dragging) return;
  _fpe.draft=_fpe.mode==='box'
    ?{type:'box',x:_fpe.startX,y:_fpe.startY,w:x-_fpe.startX,h:y-_fpe.startY,color:_fpe.color,label:''}
    :{type:'wall',x1:_fpe.startX,y1:_fpe.startY,x2:x,y2:y,color:_fpe.color};
  _fpeRender();
}
function _fpeMouseUp(e){
  if(!_fpe) return;
  // ── End move ────────────────────────────────────────────────────
  if(_fpe.moveReady||_fpe.moving){
    _fpe.moveReady=false; _fpe.moving=false;
    _fpeStatus(`Room ${_fpe.roomId} · drag shapes to move · Apply saves to Page 1`);
    _fpeRender(); return;
  }
  // ── End draw ────────────────────────────────────────────────────
  if(!_fpe.dragging) return;
  _fpe.dragging=false;
  const s=_fpe.draft; _fpe.draft=null; if(!s) return;
  const sz=s.type==='box'?Math.abs(s.w)+Math.abs(s.h):Math.hypot(s.x2-s.x1,s.y2-s.y1);
  if(sz<12){ _fpeRender(); return; }
  if(s.type==='box'){ s.x=Math.min(s.x,s.x+s.w); s.y=Math.min(s.y,s.y+s.h); s.w=Math.abs(s.w); s.h=Math.abs(s.h); s.fontSize=_fpe.fontSize||13; }
  _fpe.history.push(JSON.parse(JSON.stringify(_fpe.shapes)));
  _fpe.shapes.push(s); _fpe.selected=_fpe.shapes.length-1;
  document.getElementById('fpe-delete-btn').disabled=false;
  if(s.type==='box'){
    _fpe.pendingLabel=true;
    const inp=document.getElementById('fpe-label-inp');
    if(inp){ inp.value=''; inp.focus(); inp.placeholder='Type label, press Enter…'; }
    _fpeStatus('Name this zone — type a label then press Enter');
  }
  _fpeRender();
}
function _fpeDblClick(e){
  if(!_fpe) return;
  const {x,y}=_fpeXY(e), hit=_fpeFindShape(x,y);
  if(hit>=0&&_fpe.shapes[hit].type==='box'){
    _fpe.selected=hit; document.getElementById('fpe-delete-btn').disabled=false;
    const inp=document.getElementById('fpe-label-inp');
    if(inp){ inp.value=_fpe.shapes[hit].label||''; inp.focus(); inp.select(); }
    _fpeStatus('Edit the label — press Enter to confirm'); _fpeRender();
  }
}
function _fpeFindShape(x,y){
  for(let i=_fpe.shapes.length-1;i>=0;i--){
    const s=_fpe.shapes[i];
    if(s.type==='box'&&x>=s.x&&x<=s.x+s.w&&y>=s.y&&y<=s.y+s.h) return i;
    if(s.type==='wall'){
      const {x1,y1,x2,y2}=s, dx=x2-x1, dy=y2-y1, l2=dx*dx+dy*dy;
      const t=l2?Math.max(0,Math.min(1,((x-x1)*dx+(y-y1)*dy)/l2)):0;
      if(Math.hypot(x-(x1+t*dx),y-(y1+t*dy))<8) return i;
    }
    if(s.type==='stamp'){
      const [bw,bh]=FPE_STAMP_BOUNDS[s.stamp]||[80,80];
      const a=s.r||0, cos=Math.cos(-a), sin=Math.sin(-a);
      const dx=x-s.cx, dy=y-s.cy;
      const lx=cos*dx-sin*dy, ly=sin*dx+cos*dy;
      if(Math.abs(lx)<=bw/2+10 && Math.abs(ly)<=bh/2+10) return i;
    }
  }
  return -1;
}
function _fpeOnLabelInput(val){ if(_fpe&&_fpe.selected>=0&&_fpe.shapes[_fpe.selected]?.type==='box'){_fpe.shapes[_fpe.selected].label=val; _fpeRender();} }
function _fpeLabelKey(e){ if(e.key==='Enter'){e.preventDefault(); _fpe.pendingLabel=false; document.getElementById('fpe-label-inp').placeholder='Box label (type after drawing)…'; _fpeStatus(`Room ${_fpe.roomId} · drag to draw · Apply saves to Page 1`);} }
function _fpeGlobalKey(e){
  if(!_fpe) return;
  if(document.activeElement?.id==='fpe-label-inp') return;
  if(e.key==='Delete'||e.key==='Backspace') _fpeDeleteSelected();
  if(e.key==='r'||e.key==='R') _fpeRotateSelected();
  if(e.key==='Escape'){
    _fpe.selected=-1; _fpe.stampMode=null;
    document.getElementById('fpe-delete-btn').disabled=true;
    _fpeUpdateRotateBtn();
    ['wall_seg','door','table_chair'].forEach(k=>{document.getElementById(`fpe-stamp-${k}`)?.classList.remove('on');});
    _fpeRender();
  }
}
function _fpeSetFontSize(val){
  if(!_fpe) return;
  const fs = Math.max(8, Math.min(36, parseInt(val)||13));
  _fpe.fontSize = fs;
  const inp = document.getElementById('fpe-font-size');
  if(inp) inp.value = fs;
  // Apply to selected box immediately
  if(_fpe.selected>=0 && _fpe.shapes[_fpe.selected]?.type==='box'){
    _fpe.shapes[_fpe.selected].fontSize = fs;
    _fpeRender();
  }
}
function _fpeFontStep(delta){
  if(!_fpe) return;
  _fpeSetFontSize((_fpe.fontSize||13)+delta);
}
function _fpeSetMode(mode,init){
  if(_fpe){ _fpe.mode=mode; if(!init) _fpe.stampMode=null; }
  document.getElementById('fpe-btn-box')?.classList.toggle('on',mode==='box');
  document.getElementById('fpe-btn-wall')?.classList.toggle('on',mode==='wall');
  ['wall_seg','door','table_chair'].forEach(k=>{document.getElementById(`fpe-stamp-${k}`)?.classList.remove('on');});
  const inp=document.getElementById('fpe-label-inp'); if(inp)inp.style.opacity=mode==='box'?'1':'0.35';
}
function _fpeSetColor(color,el){ if(!_fpe)return; _fpe.color=color; document.querySelectorAll('.fpe-swatch').forEach(s=>s.classList.remove('on')); if(el)el.classList.add('on'); if(_fpe.selected>=0){_fpe.history.push(JSON.parse(JSON.stringify(_fpe.shapes)));_fpe.shapes[_fpe.selected].color=color;_fpeRender();} }
function _fpeDeleteSelected(){ if(!_fpe||_fpe.selected<0)return; _fpe.history.push(JSON.parse(JSON.stringify(_fpe.shapes))); _fpe.shapes.splice(_fpe.selected,1); _fpe.selected=-1; document.getElementById('fpe-delete-btn').disabled=true; document.getElementById('fpe-label-inp').value=''; _fpeUpdateRotateBtn(); _fpeRender();_fpeStatus('Shape deleted'); }
function _fpeUndo(){ if(!_fpe||!_fpe.history.length)return; _fpe.shapes=_fpe.history.pop(); _fpe.selected=-1; document.getElementById('fpe-delete-btn').disabled=true; _fpeRender();_fpeStatus('Undo'); }
function _fpeReset(){ if(!_fpe)return; if(_fpe.shapes.length&&!confirm(`Clear all annotations for room ${_fpe.roomId}?`))return; _fpe.history.push(JSON.parse(JSON.stringify(_fpe.shapes))); _fpe.shapes=[];_fpe.selected=-1; document.getElementById('fpe-delete-btn').disabled=true; document.getElementById('fpe-label-inp').value=''; delete FP_ANNOTATIONS[_fpe.roomId]; _fpeRender();_fpeStatus('Annotations cleared — room restored to original image'); }
function _fpeStatus(msg){const el=document.getElementById('fpe-status');if(el)el.textContent=msg;}

function _fpeSetStamp(key){
  if(!_fpe) return;
  const same=_fpe.stampMode===key;
  _fpe.stampMode=same?null:key;
  if(!same){
    _fpe.mode='box'; // keep box as fallback draw mode
    document.getElementById('fpe-btn-box')?.classList.remove('on');
    document.getElementById('fpe-btn-wall')?.classList.remove('on');
    if(_fpe.canvas) _fpe.canvas.style.cursor='crosshair';
  } else {
    _fpeSetMode('box');
  }
  ['wall_seg','door','table_chair'].forEach(k=>{
    document.getElementById(`fpe-stamp-${k}`)?.classList.toggle('on',_fpe.stampMode===k);
  });
  _fpeStatus(_fpe.stampMode
    ?`Click to place a ${FPE_STAMP_LABELS[key]} — drag to move · R to rotate · click tool again to cancel`
    :`Room ${_fpe.roomId} · drag to draw boxes · Apply saves to Page 1`);
}
function _fpeRotateSelected(){
  if(!_fpe||_fpe.selected<0) return;
  const s=_fpe.shapes[_fpe.selected]; if(s?.type!=='stamp') return;
  _fpe.history.push(JSON.parse(JSON.stringify(_fpe.shapes)));
  s.r=(s.r||0)+Math.PI/4; _fpeRender();
}
function _fpeUpdateRotateBtn(){
  const btn=document.getElementById('fpe-rotate-btn'); if(!btn) return;
  btn.disabled=!(_fpe&&_fpe.selected>=0&&_fpe.shapes[_fpe.selected]?.type==='stamp');
}
function _fpeApply(){
  if(!_fpe)return;
  const oid=_fpe.roomId;
  if(!FP_ANNOTATIONS[oid])FP_ANNOTATIONS[oid]={};
  FP_ANNOTATIONS[oid].shapes=JSON.parse(JSON.stringify(_fpe.shapes));
  try{
    FP_ANNOTATIONS[oid].imageDataUrl=_fpe.canvas.toDataURL('image/jpeg',0.92);
    closeFpEditor(); gen(); renderAusLookup();
    showStatus(`Room ${oid} layout applied to Page 1`,'s-ok');
  }catch(err){
    FP_ANNOTATIONS[oid].imageDataUrl=null; closeFpEditor();
    showStatus('Annotation shapes saved, but the floor plan image couldn\'t be captured (browser security restriction). To export the annotated image, upload the room image via the Media tab first.','s-warn');
  }
}
