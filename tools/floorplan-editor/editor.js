// ════════════════════════════════════════════════════════════════
// REFS
// ════════════════════════════════════════════════════════════════
const canvas       = document.getElementById('canvas');
const ctx          = canvas.getContext('2d');
const cvwrap       = document.getElementById('cvwrap');
const statusEl     = document.getElementById('statusText');
const penHint      = document.getElementById('penHint');
const cdot         = document.getElementById('cdot');
const snapDot      = document.getElementById('snapDot');
const snapH        = document.getElementById('snapH');
const snapV        = document.getElementById('snapV');
const anchorRing   = document.getElementById('anchorRing');
const snapBadge    = document.getElementById('snapBadge');
const pinchHint    = document.getElementById('pinchHint');

// ════════════════════════════════════════════════════════════════
// STATE
// ════════════════════════════════════════════════════════════════
let uploadedImage=null, pdfDoc=null;
let eraseFills=[], colorFills=[], selectionRect=null;
let penPoints=[], penMode='';
let currentTool='drag';
let isDrawing=false, startX, startY, currentRect=null;
let isDragging=false, dragSX, dragSY, dragSOX, dragSOY;
let imageOffsetX=0, imageOffsetY=0;
let viewZoom=0.7;
let anchorImgX=null, anchorImgY=null;
let fillOpacity=0.4;
let activeFillColor='#ef4444';
let undoStack=[], redoStack=[];
let snapEnabled=true;
let edgeData=null, edgeImgW=0, edgeImgH=0;
const SNAP_R=18;
let logicalW=800, logicalH=800;

// pinch tracking
let pinchStartDist=0, pinchStartZoom=0;
let pinchStartCX=0, pinchStartCY=0;
let lastTouchX=0, lastTouchY=0;

// ════════════════════════════════════════════════════════════════
// MOBILE PANEL
// ════════════════════════════════════════════════════════════════
function openPanel(){
  document.getElementById('sidePanel').classList.add('open');
  document.getElementById('panelOverlay').classList.add('open');
  document.getElementById('panelOverlay').style.display='block';
}
function closePanel(){
  document.getElementById('sidePanel').classList.remove('open');
  document.getElementById('panelOverlay').classList.remove('open');
  setTimeout(()=>{ if(!document.getElementById('panelOverlay').classList.contains('open'))
    document.getElementById('panelOverlay').style.display='none'; }, 260);
}

// Mobile upload button visibility — handled purely by CSS .hide-mob,
// but we still need to toggle the JS-controlled mobUploadBtn
function checkMobile(){
  const mob = window.innerWidth <= 640;
  const btn = document.getElementById('mobUploadBtn');
  if(btn) btn.style.display = mob ? 'inline-flex' : 'none';
}
window.addEventListener('resize', checkMobile);
checkMobile();

// ════════════════════════════════════════════════════════════════
// HIGH-RES CANVAS
// ════════════════════════════════════════════════════════════════
function currentPixelSize(){
  const sel = document.getElementById('canvasSize');
  if(sel.value === 'file'){
    // Use uploaded image's native size if available
    if(uploadedImage) return [uploadedImage.width, uploadedImage.height];
    return [4000, 4000]; // fallback before upload
  }
  if(sel.value === 'custom'){
    const w = Math.max(100, Math.min(8000, parseInt(document.getElementById('customW').value)||4000));
    const h = Math.max(100, Math.min(8000, parseInt(document.getElementById('customH').value)||4000));
    return [w, h];
  }
  return sel.value.split('x').map(Number);
}

// Called after an image loads — if "Match File" is selected, resize canvas to match.
// Also updates the option label to show detected dimensions.
function applyFileSizeIfSelected(){
  if(!uploadedImage) return;
  const iw = uploadedImage.width, ih = uploadedImage.height;
  const label = `Match File (${iw}×${ih})`;
  // Update both select option labels
  ['canvasSize','canvasSizeMob'].forEach(id=>{
    const sel = document.getElementById(id); if(!sel) return;
    const opt = sel.querySelector('option[value="file"]');
    if(opt) opt.textContent = label;
    // If currently set to "file", resize the canvas now
    if(sel.value === 'file'){
      initCanvas(iw, ih); redrawCanvas();
    }
  });
}

function applyCustomSize(){
  const w = Math.max(100, Math.min(8000, parseInt(document.getElementById('customW').value)||4000));
  const h = Math.max(100, Math.min(8000, parseInt(document.getElementById('customH').value)||4000));
  // keep mob inputs in sync
  const mw = document.getElementById('customWMob');
  const mh = document.getElementById('customHMob');
  if(mw) mw.value = w;
  if(mh) mh.value = h;
  initCanvas(w, h); redrawCanvas();
  setStatus(`Canvas: ${w}×${h}px`);
}
function initCanvas(pw,ph){
  canvas.width=pw; canvas.height=ph; fitCanvasCSS(pw,ph);
}
function fitCanvasCSS(pw,ph){
  // Use cvwrap's actual rendered size — defer one frame if not laid out yet
  const wr = cvwrap.getBoundingClientRect();
  if(wr.width===0||wr.height===0){
    requestAnimationFrame(()=>fitCanvasCSS(pw,ph)); return;
  }
  const pad = 0.94;
  const avW = wr.width  * pad;
  const avH = wr.height * pad;
  const ratio = pw/ph;
  let cw,ch;
  if(avW/avH > ratio){ ch=avH; cw=ch*ratio; }
  else               { cw=avW; ch=cw/ratio; }
  // clamp so it never exceeds viewport
  cw = Math.min(cw, wr.width  - 8);
  ch = Math.min(ch, wr.height - 8);
  logicalW=cw; logicalH=ch;
  canvas.style.width  = cw+'px';
  canvas.style.height = ch+'px';
}

// Debounced resize — avoids thrashing during mobile browser chrome show/hide
let _resizeTimer=null;
function onResize(){
  clearTimeout(_resizeTimer);
  _resizeTimer = setTimeout(()=>{
    const[pw,ph]=currentPixelSize();
    fitCanvasCSS(pw,ph);
    placeAnchorRing();
    applyZoom();
  }, 80);
}
window.addEventListener('resize', onResize);
// Also listen to visualViewport for mobile (handles browser chrome appearing)
if(window.visualViewport){
  window.visualViewport.addEventListener('resize', onResize);
}

// Sync canvas size selects and handle custom / file options
document.getElementById('canvasSize').addEventListener('change',e=>{
  const v = e.target.value;
  document.getElementById('canvasSizeMob').value = v;
  showCustomInputs(v === 'custom');
  if(v === 'file') { applyFileSizeIfSelected(); }
  else if(v !== 'custom') applyCanvasSize();
});
document.getElementById('canvasSizeMob').addEventListener('change',e=>{
  const v = e.target.value;
  document.getElementById('canvasSize').value = v;
  showCustomInputs(v === 'custom');
  if(v === 'file') { applyFileSizeIfSelected(); }
  else if(v !== 'custom') applyCanvasSize();
});
// sync custom W/H between desktop and mobile inputs
['customW','customH'].forEach(id=>{
  const el = document.getElementById(id);
  if(!el) return;
  el.addEventListener('change',()=>{
    const mId = id + 'Mob';
    const m = document.getElementById(mId);
    if(m) m.value = el.value;
  });
});
['customWMob','customHMob'].forEach(id=>{
  const el = document.getElementById(id);
  if(!el) return;
  el.addEventListener('change',()=>{
    const dId = id.replace('Mob','');
    const d = document.getElementById(dId);
    if(d) d.value = el.value;
  });
});
function showCustomInputs(show){
  const d = document.getElementById('customSizeDesk');
  const m = document.getElementById('customSizeMob');
  if(d) d.style.display = show ? 'flex' : 'none';
  if(m) m.style.display = show ? 'flex' : 'none';
}
function applyCanvasSize(){
  const[pw,ph]=currentPixelSize();
  initCanvas(pw,ph); redrawCanvas();
  setStatus(t('statusCanvas',pw,ph));
}

// ════════════════════════════════════════════════════════════════
// PALETTE
// ════════════════════════════════════════════════════════════════
const palette=['#ef4444','#22c55e','#ff6600'];
function buildPalette(){
  ['swatchRowDesk','colorGridMob'].forEach(rowId=>{
    const row=document.getElementById(rowId); if(!row) return;
    row.innerHTML='';
    palette.forEach(hex=>{
      const s=document.createElement('div');
      s.className='sw';
      s.style.background=hex;
      s.onclick=()=>{ activeFillColor=hex; selSwatch(s); };
      row.appendChild(s);
    });
    row.children[0].classList.add('sel');
  });
}
function selSwatch(el){ document.querySelectorAll('.sw').forEach(s=>s.classList.remove('sel')); el.classList.add('sel'); }
buildPalette();

function pickCustomColor(){
  const v=document.getElementById('customColorMob').value;
  activeFillColor=v;
  document.querySelectorAll('.sw').forEach(s=>s.classList.remove('sel'));
  setStatus(t('statusCustomColour',v));
}

// Undo only the last colour fill (leaves erase fills, crop, etc. untouched)
function undoColour(){
  if(!colorFills.length){ setStatus(t('statusNoColourUndo')); return; }
  saveState();
  colorFills.pop();
  redrawCanvas();
  setStatus(t('statusColourRemoved',colorFills.length));
}

// Clear only colour fills — keeps erase fills, crop mask, image position intact
function clearColours(){
  if(!colorFills.length){ setStatus(t('statusNoColourClear')); return; }
  saveState();
  colorFills=[];
  redrawCanvas();
  setStatus(t('statusColourCleared'));
}

// Sync opacity sliders
function syncSliders(srcId, destId, valId1, valId2, transform, onchange){
  document.getElementById(srcId).addEventListener('input',e=>{
    document.getElementById(destId).value=e.target.value;
    const v=transform(e.target.value);
    if(valId1) document.getElementById(valId1).textContent=v;
    if(valId2) document.getElementById(valId2).textContent=v;
    onchange(e.target.value);
  });
}

// Opacity
['opacitySliderDesk','opacitySliderMob'].forEach(id=>{
  document.getElementById(id).addEventListener('input',e=>{
    const other=id==='opacitySliderDesk'?'opacitySliderMob':'opacitySliderDesk';
    document.getElementById(other).value=e.target.value;
    fillOpacity=e.target.value/100;
    document.getElementById('opacityValDesk').textContent=e.target.value+'%';
    document.getElementById('opacityValMob').textContent=e.target.value+'%';
    colorFills.forEach(f=>{f.opacity=fillOpacity;}); redrawCanvas();
  });
});

// Helper to wire up paired sliders (desktop ↔ panel)
function wirePair(deskId,mobId,valDeskId,valMobId,fmt,cb){
  [deskId,mobId].forEach(id=>{
    document.getElementById(id).addEventListener('input',e=>{
      const other=id===deskId?mobId:deskId;
      if(document.getElementById(other)) document.getElementById(other).value=e.target.value;
      const v=fmt(e.target.value);
      if(valDeskId) document.getElementById(valDeskId).textContent=v;
      if(valMobId)  document.getElementById(valMobId).textContent=v;
      cb(e.target.value);
    });
  });
}
wirePair('rotationSlider','rotSliderMob','rotationValue','rotValMob',v=>v*90+'°',v=>{ saveState(); updateOffsetForAnchor(); redrawCanvas(); });
wirePair('scaleSlider','scaleSliderMob','scaleValue','scaleValMob',v=>Math.round(v*100)+'%',v=>{ saveState(); updateOffsetForAnchor(); redrawCanvas(); });
wirePair('xSlider','xSliderMob','xOffVal','xValMob',v=>v,v=>{ imageOffsetX=+v; redrawCanvas(); });
wirePair('ySlider','ySliderMob','yOffVal','yValMob',v=>v,v=>{ imageOffsetY=+v; redrawCanvas(); });
wirePair('zoomSlider','zoomSliderMob','zoomValue','zoomValMob',v=>Math.round(v*100)+'%',v=>{ viewZoom=+v; applyZoom(); });

// ════════════════════════════════════════════════════════════════
// ZOOM
// ════════════════════════════════════════════════════════════════
function applyZoom(){
  const pct=Math.round(viewZoom*100)+'%';
  ['zoomValue','zoomValMob'].forEach(id=>{ const el=document.getElementById(id); if(el) el.textContent=pct; });
  document.getElementById('zoomBadge').textContent=pct;
  ['zoomSlider','zoomSliderMob'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=viewZoom; });
  if(anchorImgX!==null){
    const{cx,cy}=imageToCanvas(anchorImgX,anchorImgY);
    const sx=cx/canvas.width*logicalW, sy=cy/canvas.height*logicalH;
    canvas.style.transformOrigin=`${sx}px ${sy}px`;
  } else { canvas.style.transformOrigin='center center'; }
  canvas.style.transform=`scale(${viewZoom})`;
}
function changeZoom(d){
  viewZoom=d===0?1:Math.max(0.1,Math.min(3,viewZoom+d)); applyZoom();
}

// Mouse wheel
cvwrap.addEventListener('wheel',e=>{
  e.preventDefault();
  viewZoom=Math.max(0.1,Math.min(3,viewZoom+(e.deltaY>0?-0.08:0.08))); applyZoom();
},{passive:false});

// ════════════════════════════════════════════════════════════════
// ANCHOR
// ════════════════════════════════════════════════════════════════
function resetAnchor(){
  anchorImgX=anchorImgY=null; anchorRing.style.display='none';
  canvas.style.transformOrigin='center center'; applyZoom();
  ['anchorBtn','pAnchorBtn'].forEach(id=>{ const el=document.getElementById(id); if(el) el.classList.remove('active'); });
  setStatus(t('statusAnchorReset'));
}
function placeAnchorRing(){
  if(anchorImgX===null){anchorRing.style.display='none';return;}
  const{cx,cy}=imageToCanvas(anchorImgX,anchorImgY);
  const cr=canvas.getBoundingClientRect(),wr=cvwrap.getBoundingClientRect();
  anchorRing.style.display='block';
  anchorRing.style.left=(cr.left-wr.left)+(cx/canvas.width*cr.width)+'px';
  anchorRing.style.top =(cr.top -wr.top )+(cy/canvas.height*cr.height)+'px';
}

// ════════════════════════════════════════════════════════════════
// EDGE SNAP
// ════════════════════════════════════════════════════════════════
function buildEdgeMap(img){
  const MAX=2500; let w=img.width,h=img.height;
  if(w>MAX||h>MAX){const s=MAX/Math.max(w,h);w=Math.round(w*s);h=Math.round(h*s);}
  const oc=document.createElement('canvas');oc.width=w;oc.height=h;
  const ox=oc.getContext('2d'); ox.drawImage(img,0,0,w,h);
  const px=ox.getImageData(0,0,w,h).data;
  const gray=new Float32Array(w*h);
  for(let i=0;i<w*h;i++) gray[i]=(px[i*4]*.299+px[i*4+1]*.587+px[i*4+2]*.114)/255;
  const mag=new Float32Array(w*h);
  for(let y=1;y<h-1;y++) for(let x=1;x<w-1;x++){
    const tl=gray[(y-1)*w+x-1],tc=gray[(y-1)*w+x],tr=gray[(y-1)*w+x+1];
    const ml=gray[y*w+x-1],mr=gray[y*w+x+1];
    const bl=gray[(y+1)*w+x-1],bc=gray[(y+1)*w+x],br=gray[(y+1)*w+x+1];
    const gx=-tl-2*ml-bl+tr+2*mr+br, gy=-tl-2*tc-tr+bl+2*bc+br;
    mag[y*w+x]=Math.sqrt(gx*gx+gy*gy);
  }
  edgeData=mag;edgeImgW=w;edgeImgH=h;
  setStatus(`Edge map ready (${w}×${h}) — snap active`);
}
function snapToEdge(ix,iy){
  if(!edgeData||!snapEnabled) return{x:ix,y:iy,snapped:false};
  const sx=edgeImgW/(uploadedImage?uploadedImage.width:edgeImgW);
  const sy=edgeImgH/(uploadedImage?uploadedImage.height:edgeImgH);
  const ex=(ix+(uploadedImage?uploadedImage.width/2:0))*sx;
  const ey=(iy+(uploadedImage?uploadedImage.height/2:0))*sy;
  const r=Math.round(SNAP_R*sx);
  const x0=Math.max(1,Math.round(ex)-r),x1=Math.min(edgeImgW-2,Math.round(ex)+r);
  const y0=Math.max(1,Math.round(ey)-r),y1=Math.min(edgeImgH-2,Math.round(ey)+r);
  let bm=-1,bx=ex,by=ey;
  for(let py=y0;py<=y1;py++) for(let px=x0;px<=x1;px++){
    const m=edgeData[py*edgeImgW+px]; if(m>bm){bm=m;bx=px;by=py;}
  }
  if(bm<0.08) return{x:ix,y:iy,snapped:false};
  return{x:bx/sx-(uploadedImage?uploadedImage.width/2:0), y:by/sy-(uploadedImage?uploadedImage.height/2:0), snapped:true};
}
function toggleSnap(){
  snapEnabled=!snapEnabled;
  ['snapBtn','pSnapBtn','mSnapBtn'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.classList.toggle('snap-on',snapEnabled);
  });
  snapBadge.style.display=snapEnabled?'block':'none';
  if(snapBadge) snapBadge.textContent=t('snapBadge');
  if(snapEnabled&&uploadedImage&&!edgeData) buildEdgeMap(uploadedImage);
  setStatus(snapEnabled?t('statusSnapOn'):t('statusSnapOff'));
}
function showSnapInd(snapped,sx,sy){
  if(!snapEnabled||!snapped){snapDot.style.display='none';snapH.style.display='none';snapV.style.display='none';return;}
  snapDot.style.display='block';snapDot.style.left=sx+'px';snapDot.style.top=sy+'px';
  snapH.style.display='block';snapH.style.top=sy+'px';
  snapV.style.display='block';snapV.style.left=sx+'px';
}
function hideSnapInd(){ snapDot.style.display='none';snapH.style.display='none';snapV.style.display='none'; }

// ════════════════════════════════════════════════════════════════
// TOOLS
// ════════════════════════════════════════════════════════════════
const TOOL_BTN_MAP={
  drag:      ['dragBtn','pDragBtn','mDragBtn'],
  rectangle: ['rectangleBtn','pRectBtn','mRectBtn'],
  erasePen:  ['erasePenBtn','pErasePenBtn','mErasePenBtn'],
  color:     ['colorBtn','pColorBtn','mColorBtn'],
  pen:       ['penBtn','pPenBtn','mPenBtn'],
  selection: ['selectionBtn','pSelBtn','mSelBtn'],
  anchor:    ['anchorBtn','pAnchorBtn'],
  rotateSel: ['rotateSelBtn','pRotateSelBtn','mRotateSelBtn'],
  wand:      ['wandBtn','pWandBtn','mWandBtn']
};
function setTool(t){
  if((currentTool==='pen'||currentTool==='erasePen')&&t!==currentTool) cancelPen(true);
  currentTool=t;
  Object.values(TOOL_BTN_MAP).flat().forEach(id=>{const el=document.getElementById(id);if(el) el.classList.remove('active');});
  if(TOOL_BTN_MAP[t]) TOOL_BTN_MAP[t].forEach(id=>{const el=document.getElementById(id);if(el) el.classList.add('active');});
  const cur={drag:'grab',rectangle:'crosshair',erasePen:'crosshair',color:'cell',pen:'crosshair',selection:'crosshair',anchor:'crosshair',rotateSel:'crosshair',wand:'crosshair'};
  canvas.style.cursor=cur[t]||'default';
  // cancel rotate if leaving the tool
  if(t!=='rotateSel') cancelRotate(true);
  // close wand panel if leaving wand, open if entering
  if(t!=='wand') wandClose();
  if(t==='wand') openWandPanel();
  const isPen=t==='pen'||t==='erasePen';
  penHint.style.display=isPen?'block':'none';
  ['closePenBtnDesk','mClosePenBtn'].forEach(id=>{const el=document.getElementById(id);if(el) el.style.display='none';});
  ['cancelPenBtnDesk','mCancelPenBtn'].forEach(id=>{const el=document.getElementById(id);if(el) el.style.display=isPen?'inline-flex':'none';});
  if(t==='pen') penMode='color';
  if(t==='erasePen') penMode='erase';
}

document.addEventListener('keydown',e=>{
  if(['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName)) return;
  const km={h:'drag',r:'rectangle',e:'erasePen',c:'color',p:'pen',s:'selection',a:'anchor',t:'rotateSel',w:'wand'};
  if(e.key.toLowerCase()==='n'){toggleSnap();return;}
  if(km[e.key.toLowerCase()]) setTool(km[e.key.toLowerCase()]);
  if((e.ctrlKey||e.metaKey)&&e.key==='z'){e.preventDefault();undo();}
  if((e.ctrlKey||e.metaKey)&&e.key==='y'){e.preventDefault();redo();}
  if(e.key==='Escape') cancelPen();
  if(e.key==='Enter'&&penPoints.length>=3) closePen();
});

// ════════════════════════════════════════════════════════════════
// FILE UPLOAD — both inputs point here
// ════════════════════════════════════════════════════════════════
function handleFile(file){
  if(!file) return;
  undoStack=[];redoStack=[];
  uploadedImage=null;eraseFills=[];colorFills=[];selectionRect=null;
  edgeData=null;imageOffsetX=0;imageOffsetY=0;
  ['xSlider','xSliderMob'].forEach(id=>{const el=document.getElementById(id);if(el) el.value=0;});
  ['ySlider','ySliderMob'].forEach(id=>{const el=document.getElementById(id);if(el) el.value=0;});
  ['xOffVal','xValMob','yOffVal','yValMob'].forEach(id=>{const el=document.getElementById(id);if(el) el.textContent='0';});

  const reader=new FileReader();
  if(file.type==='application/pdf'){
    reader.onload=ev=>{
      pdfjsLib.getDocument(new Uint8Array(ev.target.result)).promise.then(pdf=>{
        pdfDoc=pdf;
        ['pdfPage','pdfPageMob'].forEach(selId=>{
          const sel=document.getElementById(selId); if(!sel) return;
          sel.innerHTML='';
          for(let i=1;i<=pdf.numPages;i++){const o=document.createElement('option');o.value=i;o.textContent=`Page ${i}`;sel.appendChild(o);}
        });
        document.getElementById('pageSelector').style.display='flex';
        document.getElementById('pageSelectorMob').style.display='block';
        loadPdfPage(1);
      });
    };
    reader.readAsArrayBuffer(file);
  } else {
    reader.onload=ev=>{
      const img=new Image();
      img.onload=()=>{
        uploadedImage=img;
        // Store the original — used by clearAll to restore
        _origImageDataUrl = ev.target.result;
        _currentImageDataUrl = ev.target.result;
        if(snapEnabled) buildEdgeMap(img);
        applyFileSizeIfSelected();
        redrawCanvas(); saveState(true); // include image in first state
        setStatus(t('statusUploading',img.width,img.height));
      };
      img.src=ev.target.result;
    };
    reader.readAsDataURL(file);
  }
}
document.getElementById('fileInput').addEventListener('change',e=>handleFile(e.target.files[0]));
document.getElementById('fileInputMob').addEventListener('change',e=>handleFile(e.target.files[0]));
['pdfPage','pdfPageMob'].forEach(id=>{
  const el=document.getElementById(id); if(!el) return;
  el.addEventListener('change',e=>{ eraseFills=[];colorFills=[];selectionRect=null;edgeData=null;loadPdfPage(+e.target.value); });
});
function loadPdfPage(n){
  pdfDoc.getPage(n).then(page=>{
    const vp=page.getViewport({scale:6});
    const tc=document.createElement('canvas');tc.width=vp.width;tc.height=vp.height;
    page.render({canvasContext:tc.getContext('2d'),viewport:vp}).promise.then(()=>{
      uploadedImage=new Image();
      uploadedImage.onload=()=>{
        const dataUrl = tc.toDataURL('image/png',1);
        _origImageDataUrl = dataUrl;
        _currentImageDataUrl = dataUrl;
        edgeData=null; if(snapEnabled) buildEdgeMap(uploadedImage);
        applyFileSizeIfSelected();
        redrawCanvas(); saveState(true); setStatus(t('statusPDF',n,uploadedImage.width,uploadedImage.height));
      };
      uploadedImage.src=tc.toDataURL('image/png',1);
    });
  });
}

// ════════════════════════════════════════════════════════════════
// HISTORY
// ════════════════════════════════════════════════════════════════
// ── Snapshot includes uploadedImage when it was modified (wand/rotate)
// Other operations pass includeImage=false — image ref is preserved by walking back.
let _origImageDataUrl = null;    // first image loaded — used by clearAll to restore
let _currentImageDataUrl = null; // tracks what's currently in uploadedImage

function imgToDataUrl(img){
  if(!img) return null;
  const tc=document.createElement('canvas');
  tc.width=img.width; tc.height=img.height;
  tc.getContext('2d').drawImage(img,0,0);
  return tc.toDataURL('image/png',1);
}

function snapState(includeImage){
  const sc=+document.getElementById('scaleSlider').value||0.8;
  const rot=+document.getElementById('rotationSlider').value||0;
  return{
    ef:JSON.parse(JSON.stringify(eraseFills)),
    cf:JSON.parse(JSON.stringify(colorFills)),
    sel:selectionRect?{...selectionRect}:null,
    ox:imageOffsetX, oy:imageOffsetY, sc, rot,
    aix:anchorImgX, aiy:anchorImgY,
    imgData: includeImage ? imgToDataUrl(uploadedImage) : null
  };
}

function saveState(includeImage){
  undoStack.push(snapState(includeImage||false));
  if(undoStack.length>40) undoStack.shift();
  redoStack=[];
}

// Walk the undo stack backwards to find the most recent saved image
function findImageInStack(stack){
  for(let i=stack.length-1;i>=0;i--){
    if(stack[i].imgData) return stack[i].imgData;
  }
  return _origImageDataUrl;
}

function restoreState(s, stackForImage){
  eraseFills=JSON.parse(JSON.stringify(s.ef));
  colorFills=JSON.parse(JSON.stringify(s.cf));
  selectionRect=s.sel?{...s.sel}:null;
  imageOffsetX=s.ox; imageOffsetY=s.oy;
  anchorImgX=s.aix; anchorImgY=s.aiy;
  ['xSlider','xSliderMob'].forEach(id=>{const el=document.getElementById(id);if(el) el.value=s.ox;});
  ['xOffVal','xValMob'].forEach(id=>{const el=document.getElementById(id);if(el) el.textContent=Math.round(s.ox);});
  ['ySlider','ySliderMob'].forEach(id=>{const el=document.getElementById(id);if(el) el.value=s.oy;});
  ['yOffVal','yValMob'].forEach(id=>{const el=document.getElementById(id);if(el) el.textContent=Math.round(s.oy);});
  ['scaleSlider','scaleSliderMob'].forEach(id=>{const el=document.getElementById(id);if(el) el.value=s.sc;});
  ['scaleValue','scaleValMob'].forEach(id=>{const el=document.getElementById(id);if(el) el.textContent=Math.round(s.sc*100)+'%';});
  ['rotationSlider','rotSliderMob'].forEach(id=>{const el=document.getElementById(id);if(el) el.value=s.rot;});
  ['rotationValue','rotValMob'].forEach(id=>{const el=document.getElementById(id);if(el) el.textContent=s.rot*90+'°';});

  // Restore image: use this state's imgData, or walk stack to find most recent
  const targetUrl = s.imgData || (stackForImage ? findImageInStack(stackForImage) : _origImageDataUrl);
  if(targetUrl && targetUrl !== _currentImageDataUrl){
    const img=new Image();
    img.onload=()=>{
      uploadedImage=img; _currentImageDataUrl=targetUrl;
      edgeData=null; if(snapEnabled) buildEdgeMap(img);
      placeAnchorRing(); applyZoom(); redrawCanvas(); updateFitCropBtn();
    };
    img.src=targetUrl;
  } else {
    placeAnchorRing(); applyZoom(); redrawCanvas(); updateFitCropBtn();
  }
}

function undo(){
  if(!undoStack.length){setStatus(t('statusNothingUndo'));return;}
  // Save current state to redo stack (without image — we resolve on restore)
  redoStack.push(snapState(false));
  const s=undoStack.pop();
  // For undo: the image to show is either in s.imgData (if that state had a bake)
  // or the most recent imgData in what remains of undoStack
  restoreState(s, undoStack);
  setStatus(t('statusUndone'));
}
function redo(){
  if(!redoStack.length){setStatus(t('statusNothingRedo'));return;}
  undoStack.push(snapState(false));
  const s=redoStack.pop();
  // For redo: image is in s.imgData, or walk the full undo stack (now including the pushed state)
  restoreState(s, undoStack);
  setStatus(t('statusRedone'));
}

// ════════════════════════════════════════════════════════════════
// COORD HELPERS
// ════════════════════════════════════════════════════════════════
function getMouse(e){
  const r=canvas.getBoundingClientRect();
  return{cx:(e.clientX-r.left)*(canvas.width/r.width), cy:(e.clientY-r.top)*(canvas.height/r.height)};
}
function toImage(cx,cy){
  const rot=+document.getElementById('rotationSlider').value*90*Math.PI/180;
  const sc=+document.getElementById('scaleSlider').value;
  const rx=cx-(canvas.width/2+imageOffsetX), ry=cy-(canvas.height/2+imageOffsetY);
  const cos=Math.cos(-rot),sin=Math.sin(-rot),inv=1/sc;
  return{x:(rx*cos-ry*sin)*inv, y:(rx*sin+ry*cos)*inv};
}
function imageToCanvas(ix,iy){
  const rot=+document.getElementById('rotationSlider').value*90*Math.PI/180;
  const sc=+document.getElementById('scaleSlider').value;
  const cos=Math.cos(rot),sin=Math.sin(rot);
  return{cx:(ix*cos-iy*sin)*sc+canvas.width/2+imageOffsetX, cy:(ix*sin+iy*cos)*sc+canvas.height/2+imageOffsetY};
}
function canvasToScreen(cx,cy){
  const cr=canvas.getBoundingClientRect(),wr=cvwrap.getBoundingClientRect();
  return{sx:(cr.left-wr.left)+(cx/canvas.width*cr.width), sy:(cr.top-wr.top)+(cy/canvas.height*cr.height)};
}

// ════════════════════════════════════════════════════════════════
// PEN
// ════════════════════════════════════════════════════════════════
function cancelPen(silent){
  penPoints=[];
  if(!silent){
    penHint.style.display='none';
    ['cancelPenBtnDesk','mCancelPenBtn'].forEach(id=>{const el=document.getElementById(id);if(el) el.style.display='none';});
    ['closePenBtnDesk','mClosePenBtn'].forEach(id=>{const el=document.getElementById(id);if(el) el.style.display='none';});
  }
  hideSnapInd();redrawCanvas();
}
function closePen(){
  if(penPoints.length<3) return;
  saveState();
  if(penMode==='erase') eraseFills.push({type:'polygon',points:[...penPoints]});
  else colorFills.push({type:'polygon',points:[...penPoints],fill:activeFillColor==='ERASE'?'#ffffff':activeFillColor,opacity:fillOpacity});
  penPoints=[];
  ['closePenBtnDesk','mClosePenBtn'].forEach(id=>{const el=document.getElementById(id);if(el) el.style.display='none';});
  hideSnapInd();redrawCanvas();
  setStatus(penMode==='erase'?'Erase polygon done':`Color polygon added`);
}

// ════════════════════════════════════════════════════════════════
// MOUSE EVENTS
// ════════════════════════════════════════════════════════════════
canvas.addEventListener('mousedown',e=>{
  if(!uploadedImage) return;
  const{cx,cy}=getMouse(e); let ip=toImage(cx,cy);
  if(currentTool==='anchor'){
    saveState();
    anchorImgX=ip.x; anchorImgY=ip.y;
    placeAnchorRing(); applyZoom(); setTool('drag');
    ['anchorBtn','pAnchorBtn'].forEach(id=>{const el=document.getElementById(id);if(el) el.classList.remove('active');});
    setStatus(t('statusAnchorPinned'));
    return;
  }
  if(['rectangle','selection','color','rotateSel'].includes(currentTool)){
    // snap start point for ALL box tools
    const s=snapToEdge(ip.x,ip.y); ip={x:s.x,y:s.y};
    saveState();startX=ip.x;startY=ip.y;currentRect={x:ip.x,y:ip.y,width:0,height:0};isDrawing=true;
  } else if(currentTool==='drag'){
    isDragging=true;dragSX=cx;dragSY=cy;dragSOX=imageOffsetX;dragSOY=imageOffsetY;canvas.style.cursor='grabbing';
  } else if(currentTool==='pen'||currentTool==='erasePen'){
    const s=snapToEdge(ip.x,ip.y);penPoints.push({x:s.x,y:s.y});
    redrawCanvas();drawPenPrev(cx,cy);
    const vis=penPoints.length>=3?'inline-flex':'none';
    ['closePenBtnDesk','mClosePenBtn'].forEach(id=>{const el=document.getElementById(id);if(el) el.style.display=vis;});
    setStatus(t('penStatus',penMode,penPoints.length,s.snapped));
  }
});

canvas.addEventListener('mousemove',e=>{
  const{cx,cy}=getMouse(e); let ip=toImage(cx,cy);
  const isDrawTool=['rectangle','selection','color','rotateSel','pen','erasePen'].includes(currentTool);
  const isPen=currentTool==='pen'||currentTool==='erasePen';

  // Show cursor dot for all drawing tools
  if(isDrawTool && currentTool!=='drag'){
    cdot.style.display='block';
    const r=canvas.getBoundingClientRect();
    cdot.style.left=e.clientX-r.left+'px';cdot.style.top=e.clientY-r.top+'px';
  } else { cdot.style.display='none'; }

  // Snap hover indicator for ALL draw tools when not actively drawing
  if(isDrawTool && !isDrawing && !isDragging){
    const s=snapToEdge(ip.x,ip.y);
    if(s.snapped){const cc=imageToCanvas(s.x,s.y);const{sx,sy}=canvasToScreen(cc.cx,cc.cy);showSnapInd(true,sx,sy);}
    else hideSnapInd();
  }

  if(isDrawing&&['rectangle','selection','color','rotateSel'].includes(currentTool)){
    // snap end point for ALL box tools
    const s=snapToEdge(ip.x,ip.y); ip={x:s.x,y:s.y};
    if(s.snapped){const cc=imageToCanvas(s.x,s.y);const{sx,sy}=canvasToScreen(cc.cx,cc.cy);showSnapInd(true,sx,sy);}
    currentRect.width=ip.x-startX;currentRect.height=ip.y-startY;
    redrawCanvas();
    const rot=+document.getElementById('rotationSlider').value*90*Math.PI/180;
    const sc=+document.getElementById('scaleSlider').value;
    ctx.save();ctx.translate(canvas.width/2+imageOffsetX,canvas.height/2+imageOffsetY);ctx.rotate(rot);ctx.scale(sc,sc);
    if(currentTool==='rotateSel'){
      ctx.strokeStyle='rgba(255,102,0,.9)';ctx.setLineDash([8/sc,4/sc]);ctx.lineWidth=2/sc;
      ctx.fillStyle='rgba(255,102,0,.07)';
      ctx.fillRect(currentRect.x,currentRect.y,currentRect.width,currentRect.height);
      ctx.strokeRect(currentRect.x,currentRect.y,currentRect.width,currentRect.height);ctx.setLineDash([]);
    } else if(currentTool==='color'){
      ctx.globalAlpha=fillOpacity;ctx.fillStyle=activeFillColor==='ERASE'?'#fff':activeFillColor;
      ctx.fillRect(currentRect.x,currentRect.y,currentRect.width,currentRect.height);
      ctx.globalAlpha=1;ctx.strokeStyle=activeFillColor==='ERASE'?'#aaa':activeFillColor;ctx.lineWidth=2/sc;
      ctx.strokeRect(currentRect.x,currentRect.y,currentRect.width,currentRect.height);
    } else if(currentTool==='selection'){
      ctx.fillStyle='rgba(96,165,250,.15)';ctx.fillRect(currentRect.x,currentRect.y,currentRect.width,currentRect.height);
      ctx.strokeStyle='#60a5fa';ctx.setLineDash([8/sc,4/sc]);ctx.lineWidth=2/sc;
      ctx.strokeRect(currentRect.x,currentRect.y,currentRect.width,currentRect.height);ctx.setLineDash([]);
    } else {
      ctx.fillStyle='rgba(255,255,255,.7)';ctx.fillRect(currentRect.x,currentRect.y,currentRect.width,currentRect.height);
      ctx.strokeStyle='rgba(248,113,113,.7)';ctx.setLineDash([6/sc,3/sc]);ctx.lineWidth=2/sc;
      ctx.strokeRect(currentRect.x,currentRect.y,currentRect.width,currentRect.height);ctx.setLineDash([]);
    }
    ctx.restore();
  } else if(isDragging&&currentTool==='drag'){
    imageOffsetX=dragSOX+(cx-dragSX);imageOffsetY=dragSOY+(cy-dragSY);
    ['xSlider','xSliderMob'].forEach(id=>{const el=document.getElementById(id);if(el) el.value=imageOffsetX;});
    ['xOffVal','xValMob'].forEach(id=>{const el=document.getElementById(id);if(el) el.textContent=Math.round(imageOffsetX);});
    ['ySlider','ySliderMob'].forEach(id=>{const el=document.getElementById(id);if(el) el.value=imageOffsetY;});
    ['yOffVal','yValMob'].forEach(id=>{const el=document.getElementById(id);if(el) el.textContent=Math.round(imageOffsetY);});
    placeAnchorRing();redrawCanvas();
  } else if(isPen&&penPoints.length>0){ redrawCanvas();drawPenPrev(cx,cy); }
});

canvas.addEventListener('mouseup',e=>{
  if(currentTool==='drag'){isDragging=false;canvas.style.cursor='grab';return;}
  if(!isDrawing) return; isDrawing=false;
  const w=Math.abs(currentRect.width),h=Math.abs(currentRect.height);
  if(w<4||h<4){currentRect=null;return;}
  const nx=Math.min(startX,startX+currentRect.width),ny=Math.min(startY,startY+currentRect.height);
  if(currentTool==='rectangle') eraseFills.push({type:'rect',x:nx,y:ny,width:w,height:h});
  else if(currentTool==='selection'){ selectionRect={x:nx,y:ny,width:w,height:h}; updateFitCropBtn(); }
  else if(currentTool==='color') colorFills.push({type:'rect',x:nx,y:ny,width:w,height:h,fill:activeFillColor==='ERASE'?'#fff':activeFillColor,opacity:fillOpacity});
  else if(currentTool==='rotateSel'){
    // show rotate widget — don't push to history yet
    redoStack=[];undoStack.pop(); // undo the premature saveState
    currentRect=null; redrawCanvas();
    showRotWidget({x:nx,y:ny,w,h});
    setStatus(t('statusRotateHint'));
    return;
  }
  currentRect=null;redrawCanvas();
  setStatus(currentTool==='rectangle'?`Erase box (${eraseFills.length})`:currentTool==='selection'?'Crop mask applied':`Color fill (${colorFills.length})`);
});

canvas.addEventListener('mouseleave',()=>{ if(isDragging) isDragging=false; cdot.style.display='none'; hideSnapInd(); });
canvas.addEventListener('dblclick',()=>{ if((currentTool==='pen'||currentTool==='erasePen')&&penPoints.length>=3) closePen(); });

// ════════════════════════════════════════════════════════════════
// TOUCH EVENTS — pan, pinch-zoom, tap-to-draw
// ════════════════════════════════════════════════════════════════
function getTouchPos(t){ return getMouse({clientX:t.clientX,clientY:t.clientY}); }

canvas.addEventListener('touchstart',e=>{
  e.preventDefault();
  if(!uploadedImage) return;

  if(e.touches.length===2){
    // pinch start
    const t0=e.touches[0],t1=e.touches[1];
    pinchStartDist=Math.hypot(t1.clientX-t0.clientX,t1.clientY-t0.clientY);
    pinchStartZoom=viewZoom;
    // centre of pinch in canvas coords
    const mx=(t0.clientX+t1.clientX)/2,my=(t0.clientY+t1.clientY)/2;
    const cr=canvas.getBoundingClientRect(),wr=cvwrap.getBoundingClientRect();
    pinchStartCX=mx-wr.left; pinchStartCY=my-wr.top;
    isDragging=false; isDrawing=false;
    pinchHint.style.display='block';
    setTimeout(()=>pinchHint.style.display='none',1500);
    return;
  }

  if(e.touches.length===1){
    const t=e.touches[0];
    const{cx,cy}=getTouchPos(t);
    let ip=toImage(cx,cy);

    if(currentTool==='anchor'){
      saveState(); anchorImgX=ip.x; anchorImgY=ip.y;
      placeAnchorRing(); applyZoom(); setTool('drag');
      setStatus(t('statusAnchorPinned'));
      return;
    }
    if(currentTool==='drag'){
      isDragging=true;dragSX=cx;dragSY=cy;dragSOX=imageOffsetX;dragSOY=imageOffsetY;
    } else if(['rectangle','selection','color','rotateSel'].includes(currentTool)){
      // snap start point for ALL box tools on touch
      const s=snapToEdge(ip.x,ip.y); ip={x:s.x,y:s.y};
      saveState();startX=ip.x;startY=ip.y;currentRect={x:ip.x,y:ip.y,width:0,height:0};isDrawing=true;
    } else if(currentTool==='pen'||currentTool==='erasePen'){
      const s=snapToEdge(ip.x,ip.y);penPoints.push({x:s.x,y:s.y});
      redrawCanvas();drawPenPrev(cx,cy);
      const vis=penPoints.length>=3?'inline-flex':'none';
      ['closePenBtnDesk','mClosePenBtn'].forEach(id=>{const el=document.getElementById(id);if(el) el.style.display=vis;});
      setStatus(t('penStatus',penMode,penPoints.length,s.snapped));
    }
    lastTouchX=cx; lastTouchY=cy;
  }
},{passive:false});

canvas.addEventListener('touchmove',e=>{
  e.preventDefault();

  if(e.touches.length===2){
    // pinch zoom
    const t0=e.touches[0],t1=e.touches[1];
    const dist=Math.hypot(t1.clientX-t0.clientX,t1.clientY-t0.clientY);
    viewZoom=Math.max(0.1,Math.min(3,pinchStartZoom*(dist/pinchStartDist)));
    // set transform-origin to pinch centre
    canvas.style.transformOrigin=`${pinchStartCX}px ${pinchStartCY}px`;
    canvas.style.transform=`scale(${viewZoom})`;
    ['zoomSlider','zoomSliderMob'].forEach(id=>{const el=document.getElementById(id);if(el) el.value=viewZoom;});
    ['zoomValue','zoomValMob'].forEach(id=>{const el=document.getElementById(id);if(el) el.textContent=Math.round(viewZoom*100)+'%';});
    document.getElementById('zoomBadge').textContent=Math.round(viewZoom*100)+'%';
    return;
  }

  if(e.touches.length===1){
    const t=e.touches[0];
    const{cx,cy}=getTouchPos(t);
    let ip=toImage(cx,cy);

    if(isDragging&&currentTool==='drag'){
      imageOffsetX=dragSOX+(cx-dragSX); imageOffsetY=dragSOY+(cy-dragSY);
      ['xSlider','xSliderMob'].forEach(id=>{const el=document.getElementById(id);if(el) el.value=imageOffsetX;});
      ['xOffVal','xValMob'].forEach(id=>{const el=document.getElementById(id);if(el) el.textContent=Math.round(imageOffsetX);});
      ['ySlider','ySliderMob'].forEach(id=>{const el=document.getElementById(id);if(el) el.value=imageOffsetY;});
      ['yOffVal','yValMob'].forEach(id=>{const el=document.getElementById(id);if(el) el.textContent=Math.round(imageOffsetY);});
      placeAnchorRing(); redrawCanvas();
    } else if(isDrawing&&['rectangle','selection','color','rotateSel'].includes(currentTool)){
      // snap end point for ALL box tools on touch
      const s=snapToEdge(ip.x,ip.y); ip={x:s.x,y:s.y};
      currentRect.width=ip.x-startX; currentRect.height=ip.y-startY; redrawCanvas();
      // preview stroke
      const rot=+document.getElementById('rotationSlider').value*90*Math.PI/180;
      const sc=+document.getElementById('scaleSlider').value;
      ctx.save();ctx.translate(canvas.width/2+imageOffsetX,canvas.height/2+imageOffsetY);ctx.rotate(rot);ctx.scale(sc,sc);
      if(currentTool==='color'){
        ctx.globalAlpha=fillOpacity;ctx.fillStyle=activeFillColor==='ERASE'?'#fff':activeFillColor;
        ctx.fillRect(currentRect.x,currentRect.y,currentRect.width,currentRect.height);ctx.globalAlpha=1;
      } else if(currentTool==='selection'){
        ctx.fillStyle='rgba(96,165,250,.15)';ctx.fillRect(currentRect.x,currentRect.y,currentRect.width,currentRect.height);
        ctx.strokeStyle='#60a5fa';ctx.setLineDash([8/sc,4/sc]);ctx.lineWidth=2/sc;
        ctx.strokeRect(currentRect.x,currentRect.y,currentRect.width,currentRect.height);ctx.setLineDash([]);
      } else if(currentTool==='rotateSel'){
        ctx.strokeStyle='rgba(255,102,0,.9)';ctx.setLineDash([8/sc,4/sc]);ctx.lineWidth=2/sc;
        ctx.fillStyle='rgba(255,102,0,.07)';
        ctx.fillRect(currentRect.x,currentRect.y,currentRect.width,currentRect.height);
        ctx.strokeRect(currentRect.x,currentRect.y,currentRect.width,currentRect.height);ctx.setLineDash([]);
      } else {
        ctx.fillStyle='rgba(255,255,255,.7)';ctx.fillRect(currentRect.x,currentRect.y,currentRect.width,currentRect.height);
      }
      ctx.restore();
    } else if((currentTool==='pen'||currentTool==='erasePen')&&penPoints.length>0){
      redrawCanvas(); drawPenPrev(cx,cy);
    }
    lastTouchX=cx; lastTouchY=cy;
  }
},{passive:false});

canvas.addEventListener('touchend',e=>{
  e.preventDefault();
  if(e.touches.length===0){
    // finalize draw on touch end (same as mouseup)
    if(currentTool==='drag'){ isDragging=false; return; }
    if(isDrawing){
      isDrawing=false;
      if(currentRect){
        const w=Math.abs(currentRect.width),h=Math.abs(currentRect.height);
        if(w>=6&&h>=6){
          const nx=Math.min(startX,startX+currentRect.width),ny=Math.min(startY,startY+currentRect.height);
          if(currentTool==='rectangle') eraseFills.push({type:'rect',x:nx,y:ny,width:w,height:h});
          else if(currentTool==='selection'){ selectionRect={x:nx,y:ny,width:w,height:h}; updateFitCropBtn(); }
          else if(currentTool==='color') colorFills.push({type:'rect',x:nx,y:ny,width:w,height:h,fill:activeFillColor==='ERASE'?'#fff':activeFillColor,opacity:fillOpacity});
          else if(currentTool==='rotateSel'){
            redoStack=[];undoStack.pop();
            currentRect=null; redrawCanvas();
            showRotWidget({x:nx,y:ny,w,h});
            setStatus(t('statusRotateHint'));
            return;
          }
          setStatus(currentTool==='rectangle'?`Erase box`:currentTool==='selection'?'Crop applied':`Color fill added`);
        }
        currentRect=null; redrawCanvas();
      }
    }
  }
},{passive:false});

// Double-tap to close pen on mobile
let lastTap=0;
canvas.addEventListener('touchend',e=>{
  if(e.changedTouches.length===1){
    const now=Date.now();
    if(now-lastTap<300&&(currentTool==='pen'||currentTool==='erasePen')&&penPoints.length>=3) closePen();
    lastTap=now;
  }
},{passive:false});

// ════════════════════════════════════════════════════════════════
// PEN PREVIEW
// ════════════════════════════════════════════════════════════════
function drawPenPrev(mcx,mcy){
  if(!penPoints.length) return;
  const rot=+document.getElementById('rotationSlider').value*90*Math.PI/180;
  const sc=+document.getElementById('scaleSlider').value;
  let im=toImage(mcx,mcy);
  const sn=snapToEdge(im.x,im.y);
  if(sn.snapped){im={x:sn.x,y:sn.y};const cc=imageToCanvas(sn.x,sn.y);const{sx,sy}=canvasToScreen(cc.cx,cc.cy);showSnapInd(true,sx,sy);}
  else hideSnapInd();
  ctx.save();ctx.translate(canvas.width/2+imageOffsetX,canvas.height/2+imageOffsetY);ctx.rotate(rot);ctx.scale(sc,sc);
  const isErase=penMode==='erase';
  if(penPoints.length>=2){
    ctx.globalAlpha=isErase?.45:fillOpacity*.5;ctx.fillStyle=isErase?'#fff':activeFillColor==='ERASE'?'#fff':activeFillColor;
    ctx.beginPath();ctx.moveTo(penPoints[0].x,penPoints[0].y);
    penPoints.forEach(p=>ctx.lineTo(p.x,p.y));ctx.lineTo(im.x,im.y);ctx.closePath();ctx.fill();ctx.globalAlpha=1;
  }
  ctx.strokeStyle=isErase?'rgba(248,113,113,.8)':activeFillColor==='ERASE'?'#aaa':activeFillColor;
  ctx.lineWidth=2/sc;ctx.setLineDash([6/sc,3/sc]);
  ctx.beginPath();ctx.moveTo(penPoints[0].x,penPoints[0].y);
  penPoints.slice(1).forEach(p=>ctx.lineTo(p.x,p.y));ctx.lineTo(im.x,im.y);ctx.stroke();ctx.setLineDash([]);
  penPoints.forEach((p,i)=>{
    ctx.beginPath();ctx.arc(p.x,p.y,5/sc,0,Math.PI*2);
    ctx.fillStyle=i===0?'#34d399':'white';ctx.fill();ctx.strokeStyle='#111';ctx.lineWidth=1.5/sc;ctx.stroke();
  });
  ctx.restore();
}

// ════════════════════════════════════════════════════════════════
// RENDER
// ════════════════════════════════════════════════════════════════
function drawGrid(){
  const step=Math.round(canvas.width/30);
  ctx.strokeStyle='rgba(0,0,0,0.04)';ctx.lineWidth=1;
  for(let x=0;x<=canvas.width;x+=step){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,canvas.height);ctx.stroke();}
  for(let y=0;y<=canvas.height;y+=step){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(canvas.width,y);ctx.stroke();}
}
function xform(g,c){
  const rot = +document.getElementById('rotationSlider').value * 90 * Math.PI / 180;
  const sc  = +document.getElementById('scaleSlider').value;

  if(anchorImgX !== null){
    // Pivot scale & rotation around the anchor point in image-space.
    // The anchor pixel stays fixed on screen while scale/rotation changes.
    //
    // Standard transform:  canvasPos = translate(centre+offset) · rotate · scale · imagePos
    // We want:             canvasPos_of_anchor = fixed screen point
    //
    // Achieve this by:
    // 1. Translate so anchor maps to canvas centre
    // 2. Rotate
    // 3. Scale
    // (The imageOffsetX/Y then shifts the whole thing so anchor's canvas pos
    //  stays consistent with the slider values.)
    //
    // We recompute imageOffset so that the anchor pixel stays at the same
    // canvas position it was at before the scale/rotation changed.
    // This is handled by the slider wirePair callbacks calling updateOffsetForAnchor().

    g.translate(c.width/2 + imageOffsetX, c.height/2 + imageOffsetY);
    g.rotate(rot);
    g.scale(sc, sc);
  } else {
    g.translate(c.width/2 + imageOffsetX, c.height/2 + imageOffsetY);
    g.rotate(rot);
    g.scale(sc, sc);
  }
}

// Called when scale or rotation slider changes and an anchor is set.
// Recomputes imageOffset so the anchor point stays fixed on the canvas.
function updateOffsetForAnchor(){
  if(anchorImgX === null) return;
  const rot = +document.getElementById('rotationSlider').value * 90 * Math.PI / 180;
  const sc  = +document.getElementById('scaleSlider').value;
  // We want: anchorCanvasPos = canvasCentre (i.e. offset keeps anchor centred)
  // After xform: canvasPos = (imgPt rotated) * sc + canvasCentre + offset
  // For anchor: anchorCanvas = (anchorImg rotated) * sc + canvasCentre + offset
  // We fix anchorCanvas to a constant point — the position it had when anchor was set.
  // That constant = (anchorImg rotated_at_set_time) * sc_at_set + canvasCentre + offset_at_set
  // Simplest: keep anchor at canvas centre (offset = -(anchor rotated * sc))
  const cos = Math.cos(rot), sin = Math.sin(rot);
  const rx = anchorImgX * cos - anchorImgY * sin;
  const ry = anchorImgX * sin + anchorImgY * cos;
  imageOffsetX = -rx * sc;
  imageOffsetY = -ry * sc;
  // Sync sliders + displays
  ['xSlider','xSliderMob'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=imageOffsetX; });
  ['ySlider','ySliderMob'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=imageOffsetY; });
  ['xOffVal','xValMob'].forEach(id=>{ const el=document.getElementById(id); if(el) el.textContent=Math.round(imageOffsetX); });
  ['yOffVal','yValMob'].forEach(id=>{ const el=document.getElementById(id); if(el) el.textContent=Math.round(imageOffsetY); });
  placeAnchorRing();
}
function drawShape(g,f,fill){
  g.fillStyle=fill;
  if(f.type==='rect') g.fillRect(f.x,f.y,f.width,f.height);
  else if(f.type==='polygon'&&f.points.length>=3){
    g.beginPath();g.moveTo(f.points[0].x,f.points[0].y);
    f.points.slice(1).forEach(p=>g.lineTo(p.x,p.y));g.closePath();g.fill();
  }
}
function redrawCanvas(forDL,g2,c2){
  const g=forDL?g2:ctx,c=forDL?c2:canvas;
  g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
  g.clearRect(0,0,c.width,c.height);g.fillStyle='white';g.fillRect(0,0,c.width,c.height);
  if(uploadedImage){g.save();xform(g,c);g.drawImage(uploadedImage,-uploadedImage.width/2,-uploadedImage.height/2);g.restore();}
  if(selectionRect){
    g.save();xform(g,c);g.fillStyle='white';const L=100000;
    g.beginPath();g.rect(-L,-L,L*2,L*2);g.rect(selectionRect.x,selectionRect.y,selectionRect.width,selectionRect.height);
    g.fill('evenodd');g.restore();
  }
  colorFills.forEach(f=>{
    g.save(); xform(g,c);
    g.globalAlpha=f.opacity;
    drawShape(g,f,f.fill);
    g.globalAlpha=1;
    g.restore();
  });
  eraseFills.forEach(f=>{
    g.save(); xform(g,c);
    drawShape(g,f,'white');
    g.restore();
  });
  if(!forDL){drawGrid();placeAnchorRing();if(rotRegion) updateRotWidget();}
}

// ════════════════════════════════════════════════════════════════
// FIT TO CROP
// Computes the scale + offset so the cropped region fills the canvas
// perfectly, then animates there smoothly.
// ════════════════════════════════════════════════════════════════
function updateFitCropBtn(){
  const show = !!selectionRect;
  ['fitCropBtn','fitCropBtnMob'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.style.display=show?'inline-flex':'none';
  });
}

function fitToCrop(){
  if(!selectionRect||!uploadedImage) return;
  saveState();

  const {x,y,width:sw,height:sh} = selectionRect;
  const rot = +document.getElementById('rotationSlider').value*90*Math.PI/180;

  // We need to find scale + offset so that after xform the selection
  // corners map to the canvas edges.
  // The selection is in image-space. After xform:
  //   canvas_px = (img_pt * sc) rotated + canvasCentre + offset
  // We want the selection to fill the canvas with a small 3% padding.
  const [pw,ph] = currentPixelSize();
  const pad = 0.97; // 3% padding on each side

  // Selection centre in image-space
  const scx = x + sw/2;
  const scy = y + sh/2;

  // The selection's bounding box in canvas-space after rotation (at sc=1, offset=0):
  // rotate the four corners and find axis-aligned bounding box
  const cos = Math.cos(rot), sin = Math.sin(rot);
  function rotPt(ix,iy){ return { rx:ix*cos-iy*sin, ry:ix*sin+iy*cos }; }
  const corners = [
    rotPt(x,     y),
    rotPt(x+sw,  y),
    rotPt(x,     y+sh),
    rotPt(x+sw,  y+sh)
  ];
  const minRX = Math.min(...corners.map(c=>c.rx));
  const maxRX = Math.max(...corners.map(c=>c.rx));
  const minRY = Math.min(...corners.map(c=>c.ry));
  const maxRY = Math.max(...corners.map(c=>c.ry));
  const bbW = maxRX - minRX; // bounding box width at sc=1
  const bbH = maxRY - minRY;

  // Scale so bounding box fits the canvas
  const scaleX = (pw * pad) / bbW;
  const scaleY = (ph * pad) / bbH;
  const newSc  = Math.min(scaleX, scaleY);

  // Offset so the selection centre maps to the canvas centre
  const centreRot = rotPt(scx, scy);
  const newOX = -centreRot.rx * newSc;
  const newOY = -centreRot.ry * newSc;

  // Clamp scale to slider range
  const clampedSc = Math.max(0.1, Math.min(10, newSc));

  // Apply — animate with small RAF loop for smoothness
  const startSc  = +document.getElementById('scaleSlider').value;
  const startOX  = imageOffsetX;
  const startOY  = imageOffsetY;
  const duration = 320;
  const t0       = performance.now();

  function ease(t){ return t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2; } // easeInOut

  function step(now){
    const t = Math.min(1, (now-t0)/duration);
    const e = ease(t);
    const sc  = startSc + (clampedSc - startSc) * e;
    const ox  = startOX + (newOX     - startOX) * e;
    const oy  = startOY + (newOY     - startOY) * e;

    imageOffsetX = ox; imageOffsetY = oy;
    ['xSlider','xSliderMob'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=ox; });
    ['ySlider','ySliderMob'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=oy; });
    ['xOffVal','xValMob'].forEach(id=>{ const el=document.getElementById(id); if(el) el.textContent=Math.round(ox); });
    ['yOffVal','yValMob'].forEach(id=>{ const el=document.getElementById(id); if(el) el.textContent=Math.round(oy); });

    ['scaleSlider','scaleSliderMob'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=sc; });
    ['scaleValue','scaleValMob'].forEach(id=>{ const el=document.getElementById(id); if(el) el.textContent=Math.round(sc*100)+'%'; });

    redrawCanvas();

    if(t<1) requestAnimationFrame(step);
    else setStatus(t('statusFitCrop'));
  }
  requestAnimationFrame(step);
}

// ════════════════════════════════════════════════════════════════
// CLEAR / DOWNLOAD
// ════════════════════════════════════════════════════════════════
function clearAll(){
  saveState(true); // save including current image before clearing
  eraseFills=[];colorFills=[];selectionRect=null;penPoints=[];
  // Restore the original uploaded image (before any wand/rotate modifications)
  if(_origImageDataUrl && _origImageDataUrl !== _currentImageDataUrl){
    const img=new Image();
    img.onload=()=>{
      uploadedImage=img; _currentImageDataUrl=_origImageDataUrl;
      edgeData=null; if(snapEnabled) buildEdgeMap(img);
      redrawCanvas(); updateFitCropBtn();
    };
    img.src=_origImageDataUrl;
  } else {
    redrawCanvas(); updateFitCropBtn();
  }
  setStatus(t('statusCleared'));
}
function downloadImage(){
  if(!uploadedImage){alert(t('statusUploading')?t('statusUploading'):'Upload a floorplan first');return;}
  const[pw,ph]=currentPixelSize();
  const dc=document.createElement('canvas');dc.width=pw;dc.height=ph;
  const dctx=dc.getContext('2d');dctx.imageSmoothingEnabled=true;dctx.imageSmoothingQuality='high';
  redrawCanvas(true,dctx,dc);
  setStatus(t('statusPrepDownload'));
  dc.toBlob(b=>{
    const u=URL.createObjectURL(b),a=document.createElement('a');
    a.href=u;a.download=`floorplan_${pw}x${ph}.jpg`;
    document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(u);
    setStatus(t('statusDownloaded',pw,ph));
  },'image/jpeg',.97);
}
function setStatus(msg){ statusEl.textContent=msg; }

// ════════════════════════════════════════════════════════════════
// ROTATE REGION TOOL
// ════════════════════════════════════════════════════════════════
/*
  Flow:
  1. User selects rotateSel tool → draws a rectangle on the canvas (reuses isDrawing/currentRect)
  2. On mouseup/touchend a widget appears:
     - dashed orange box showing the region
     - a drag handle they can spin freely
     - ±1/5/90° nudge buttons + a slider
     - pivot dot (draggable to move rotation centre)
  3. Apply → captures just that region into an offscreen canvas,
     rotates it around the pivot, composites back onto the main canvas
     as a new colorFill with type:'rotatedImage'.
  4. Cancel → dismisses widget.
*/

let rotRegion=null;       // {x,y,w,h} in image-space
let rotAngleDeg=0;        // current rotation angle in degrees
let rotPivotImgX=null;    // pivot in image-space (default = region centre)
let rotPivotImgY=null;
let rotDraggingHandle=false;
let rotHandleStartAngle=0;
let rotHandleStartDeg=0;
let rotDraggingPivot=false;

const rotWidget    = document.getElementById('rotWidget');
const rotSelBox    = document.getElementById('rotSelBox');
const rotPivotEl   = document.getElementById('rotPivot');
const rotHandleEl  = document.getElementById('rotHandle');
const rotHandleArm = document.getElementById('rotHandleArm');
const rotControls  = document.getElementById('rotControls');
const rotAngleDisp = document.getElementById('rotAngleDisplay');
const rotAngleSlid = document.getElementById('rotAngleSlider');
const HANDLE_DIST  = 60; // px from pivot to handle on screen

// Called whenever angle or region changes — repositions all overlay elements
function updateRotWidget(){
  if(!rotRegion) return;

  const cr = canvas.getBoundingClientRect();
  const wr = cvwrap.getBoundingClientRect();

  function imgToScreen(ix,iy){
    const cc=imageToCanvas(ix,iy);
    return {
      sx:(cr.left-wr.left)+(cc.cx/canvas.width*cr.width),
      sy:(cr.top -wr.top )+(cc.cy/canvas.height*cr.height)
    };
  }

  const {x,y,w,h}=rotRegion;
  const corners=[
    imgToScreen(x,y), imgToScreen(x+w,y),
    imgToScreen(x,y+h), imgToScreen(x+w,y+h)
  ];
  const minSX=Math.min(...corners.map(c=>c.sx));
  const minSY=Math.min(...corners.map(c=>c.sy));
  const maxSX=Math.max(...corners.map(c=>c.sx));
  const maxSY=Math.max(...corners.map(c=>c.sy));

  // dashed selection box overlay on canvas
  rotSelBox.style.left   = minSX+'px';
  rotSelBox.style.top    = minSY+'px';
  rotSelBox.style.width  = (maxSX-minSX)+'px';
  rotSelBox.style.height = (maxSY-minSY)+'px';

  // pivot dot
  const ps = imgToScreen(rotPivotImgX, rotPivotImgY);
  rotPivotEl.style.left = ps.sx+'px';
  rotPivotEl.style.top  = ps.sy+'px';

  // drag handle — HANDLE_DIST px above pivot, rotated by current angle
  const rad = rotAngleDeg * Math.PI / 180;
  const hx  = ps.sx + Math.sin(rad) * HANDLE_DIST;
  const hy  = ps.sy - Math.cos(rad) * HANDLE_DIST;
  rotHandleEl.style.left = hx+'px';
  rotHandleEl.style.top  = hy+'px';

  // arm line from pivot to handle
  rotHandleArm.style.left            = ps.sx+'px';
  rotHandleArm.style.top             = ps.sy+'px';
  rotHandleArm.style.height          = HANDLE_DIST+'px';
  rotHandleArm.style.transform       = `translateX(-50%) rotate(${rotAngleDeg}deg)`;
  rotHandleArm.style.transformOrigin = 'top center';

  // angle readout in the fixed panel
  rotAngleDisp.textContent = rotAngleDeg.toFixed(1)+'°';
  rotAngleSlid.value        = rotAngleDeg;
}

function showRotWidget(region){
  rotRegion    = region;
  rotAngleDeg  = 0;
  rotPivotImgX = region.x + region.w/2;
  rotPivotImgY = region.y + region.h/2;
  rotWidget.style.display = 'block';
  rotControls.classList.add('open');
  document.body.classList.add('rot-panel-open');
  updateRotWidget();
  redrawCanvas();
  drawRotPreview();
}

function cancelRotate(silent){
  rotRegion=null; rotAngleDeg=0;
  rotWidget.style.display='none';
  rotControls.classList.remove('open');
  document.body.classList.remove('rot-panel-open');
  if(!silent) redrawCanvas();
}

function setRotAngle(deg){
  rotAngleDeg=deg;
  updateRotWidget(); redrawCanvas(); drawRotPreview();
}

function nudgeRot(delta){
  rotAngleDeg = Math.max(-180, Math.min(180, rotAngleDeg+delta));
  updateRotWidget();
  redrawCanvas();
  drawRotPreview();
}

rotAngleSlid.addEventListener('input',e=>{
  rotAngleDeg=+e.target.value;
  updateRotWidget();
  redrawCanvas();
  drawRotPreview();
});

// Draw a live preview of the rotated region on the canvas (doesn't commit)
function drawRotPreview(){
  if(!rotRegion||!uploadedImage) return;
  const {x,y,w,h}=rotRegion;
  const rad=rotAngleDeg*Math.PI/180;
  const rot=+document.getElementById('rotationSlider').value*90*Math.PI/180;
  const sc =+document.getElementById('scaleSlider').value;

  // offscreen: extract the region from the image at native resolution
  const oc=document.createElement('canvas'); oc.width=w; oc.height=h;
  const ox=oc.getContext('2d');
  ox.drawImage(uploadedImage,
    uploadedImage.width/2+x, uploadedImage.height/2+y, w, h,
    0, 0, w, h);

  // draw onto main canvas with rotation around pivot
  ctx.save();
  // main image transform
  ctx.translate(canvas.width/2+imageOffsetX, canvas.height/2+imageOffsetY);
  ctx.rotate(rot); ctx.scale(sc,sc);
  // white out original region
  ctx.fillStyle='white'; ctx.fillRect(x,y,w,h);
  // rotate around pivot
  ctx.translate(rotPivotImgX, rotPivotImgY);
  ctx.rotate(rad);
  ctx.translate(-rotPivotImgX, -rotPivotImgY);
  ctx.drawImage(oc, x, y, w, h);
  ctx.restore();
}

// Apply: bake rotation directly into uploadedImage (no async, no white flash)
function applyRotate(){
  if(!rotRegion||!uploadedImage) return;
  const {x,y,w,h} = rotRegion;
  const rad        = rotAngleDeg * Math.PI / 180;
  const iw         = uploadedImage.width;
  const ih         = uploadedImage.height;

  // 1. Extract the region from the source image BEFORE anything changes
  const region = document.createElement('canvas');
  region.width = w; region.height = h;
  const rg = region.getContext('2d');
  rg.imageSmoothingEnabled = true;
  rg.imageSmoothingQuality = 'high';
  // image coords: centre is 0,0 in image-space, so pixel offset = iw/2 + x
  rg.drawImage(uploadedImage, iw/2 + x, ih/2 + y, w, h, 0, 0, w, h);

  // 2. Build a new full-size canvas = copy of uploadedImage
  const nc  = document.createElement('canvas');
  nc.width  = iw; nc.height = ih;
  const ng  = nc.getContext('2d');
  ng.imageSmoothingEnabled = true;
  ng.imageSmoothingQuality = 'high';
  ng.drawImage(uploadedImage, 0, 0);          // copy entire image

  // 3. White out the original region
  ng.fillStyle = 'white';
  ng.fillRect(iw/2 + x, ih/2 + y, w, h);

  // 4. Pivot is at (iw/2 + rotPivotImgX, ih/2 + rotPivotImgY) in pixel space
  const px = iw/2 + rotPivotImgX;
  const py = ih/2 + rotPivotImgY;
  ng.save();
  ng.translate(px, py);
  ng.rotate(rad);
  ng.translate(-px, -py);
  // draw region back at its original pixel position (rotated)
  ng.drawImage(region, iw/2 + x, ih/2 + y, w, h);
  ng.restore();

  // 5. Swap uploadedImage for the baked result
  saveState(true); // ← save BEFORE modifying (includes current image)
  const dataUrl = nc.toDataURL('image/png', 1);
  const newImg   = new Image();
  const prevAngle  = rotAngleDeg;
  newImg.onload = () => {
    uploadedImage = newImg;
    _currentImageDataUrl = dataUrl; // track for undo
    edgeData = null;
    cancelRotate(true);
    redrawCanvas();
    setStatus(t('statusRotated',prevAngle.toFixed(1)));
  };
  newImg.src = dataUrl;
}

// Handle drag on the rotate handle
rotHandleEl.addEventListener('mousedown',e=>{
  e.preventDefault(); e.stopPropagation();
  rotDraggingHandle=true;
  const wr=cvwrap.getBoundingClientRect();
  const ps=getRotPivotScreen();
  rotHandleStartAngle=Math.atan2(e.clientX-wr.left-ps.sx, -(e.clientY-wr.top-ps.sy))*180/Math.PI;
  rotHandleStartDeg=rotAngleDeg;
});
rotHandleEl.addEventListener('touchstart',e=>{
  e.stopPropagation();
  rotDraggingHandle=true;
  const t=e.touches[0], wr=cvwrap.getBoundingClientRect();
  const ps=getRotPivotScreen();
  rotHandleStartAngle=Math.atan2(t.clientX-wr.left-ps.sx, -(t.clientY-wr.top-ps.sy))*180/Math.PI;
  rotHandleStartDeg=rotAngleDeg;
},{passive:true});

// Draggable pivot
rotPivotEl.addEventListener('mousedown',e=>{
  e.preventDefault(); e.stopPropagation(); rotDraggingPivot=true;
});
rotPivotEl.addEventListener('touchstart',e=>{
  e.stopPropagation(); rotDraggingPivot=true;
},{passive:true});

function getRotPivotScreen(){
  const cr=canvas.getBoundingClientRect(), wr=cvwrap.getBoundingClientRect();
  const cc=imageToCanvas(rotPivotImgX,rotPivotImgY);
  return {
    sx:(cr.left-wr.left)+(cc.cx/canvas.width*cr.width),
    sy:(cr.top -wr.top )+(cc.cy/canvas.height*cr.height)
  };
}

// Global mousemove for handle + pivot drag
document.addEventListener('mousemove',e=>{
  if(rotDraggingHandle && rotRegion){
    const wr=cvwrap.getBoundingClientRect();
    const ps=getRotPivotScreen();
    const a=Math.atan2(e.clientX-wr.left-ps.sx, -(e.clientY-wr.top-ps.sy))*180/Math.PI;
    rotAngleDeg=rotHandleStartDeg+(a-rotHandleStartAngle);
    if(rotAngleDeg>180) rotAngleDeg-=360;
    if(rotAngleDeg<-180) rotAngleDeg+=360;
    updateRotWidget(); redrawCanvas(); drawRotPreview();
  }
  if(rotDraggingPivot && rotRegion){
    // convert mouse screen pos back to image coords
    const cr=canvas.getBoundingClientRect(), wr=cvwrap.getBoundingClientRect();
    const cx=(e.clientX-cr.left)*(canvas.width/cr.width);
    const cy=(e.clientY-cr.top)*(canvas.height/cr.height);
    const ip=toImage(cx,cy);
    rotPivotImgX=ip.x; rotPivotImgY=ip.y;
    updateRotWidget(); redrawCanvas(); drawRotPreview();
  }
});
document.addEventListener('mouseup',()=>{ rotDraggingHandle=false; rotDraggingPivot=false; });

document.addEventListener('touchmove',e=>{
  if((rotDraggingHandle||rotDraggingPivot)&&e.touches.length===1){
    const t=e.touches[0];
    if(rotDraggingHandle && rotRegion){
      const wr=cvwrap.getBoundingClientRect();
      const ps=getRotPivotScreen();
      const a=Math.atan2(t.clientX-wr.left-ps.sx, -(t.clientY-wr.top-ps.sy))*180/Math.PI;
      rotAngleDeg=rotHandleStartDeg+(a-rotHandleStartAngle);
      if(rotAngleDeg>180) rotAngleDeg-=360;
      if(rotAngleDeg<-180) rotAngleDeg+=360;
      updateRotWidget(); redrawCanvas(); drawRotPreview();
    }
    if(rotDraggingPivot && rotRegion){
      const cr=canvas.getBoundingClientRect();
      const cx=(t.clientX-cr.left)*(canvas.width/cr.width);
      const cy=(t.clientY-cr.top)*(canvas.height/cr.height);
      const ip=toImage(cx,cy);
      rotPivotImgX=ip.x; rotPivotImgY=ip.y;
      updateRotWidget(); redrawCanvas(); drawRotPreview();
    }
  }
},{passive:true});
document.addEventListener('touchend',()=>{ rotDraggingHandle=false; rotDraggingPivot=false; });

// ════════════════════════════════════════════════════════════════
// MAGIC WAND — click or drag-box to smart-select, fixed right panel
// ════════════════════════════════════════════════════════════════
/*
  TWO WAYS TO SELECT:
  • Click  → flood-fill from that pixel (all connected similar-colour pixels)
  • Drag   → draw a box; ALL pixels inside the box whose colour is within
             tolerance of the AVERAGE colour of the box get selected

  MODES (buttons or keyboard modifiers):
  • New        — replace selection
  • + Add      — OR with existing  (Shift+)
  • − Subtract — AND NOT existing  (Alt+)

  APPLY:
  • Fill Color  — alpha-blend active colour onto selected pixels
  • Erase       — white out selected pixels
  • Set Crop    — crop mask = bounding box of selection
*/
let wandMask      = null;   // Uint8Array: 1=selected
let wandIW        = 0, wandIH = 0;
let wandLastImgX  = 0, wandLastImgY = 0;
let wandTolerance = 32;
let wandClickMode = 'new';  // 'new' | 'add' | 'sub'
let wandSrcCanvas = null;   // cached composite canvas
// Box-drag state
let wandDragging  = false;
let wandDragSX=0,wandDragSY=0; // start in image-space
let wandDragCurX=0,wandDragCurY=0;

const wandPanel      = document.getElementById('wandPanel');
const wandTolSlider  = document.getElementById('wandTol');
const wandTolVal     = document.getElementById('wandTolVal');
const wandPixCount   = document.getElementById('wandPixCount');
const wandOverlaySvg = document.getElementById('wandOverlaySvg');
const wandPathEl     = document.getElementById('wandPath');
const wandBoxRect    = document.getElementById('wandBoxPreview');
const wandPreviewCv  = document.getElementById('wandPreviewCanvas');
const wandPreviewCtx = wandPreviewCv.getContext('2d');

wandTolSlider.addEventListener('input',e=>{
  wandTolerance=+e.target.value;
  wandTolVal.textContent=e.target.value;
  if(uploadedImage&&wandSrcCanvas&&!wandDragging) rerunLastWand();
});

// ── Open / close panel ───────────────────────────────────────────
function openWandPanel(){
  wandPanel.classList.add('open');
  document.body.classList.add('wand-panel-open');
}
function wandClose(){
  wandPanel.classList.remove('open');
  document.body.classList.remove('wand-panel-open');
  wandMask=null; wandIW=0; wandIH=0; wandSrcCanvas=null;
  wandPathEl.setAttribute('d','');
  wandBoxRect.setAttribute('width','0');
  wandOverlaySvg.style.display='none';
  wandClickMode='new'; wandSetMode('new');
}

// ── Mode buttons ─────────────────────────────────────────────────
function wandSetMode(mode){
  wandClickMode=mode;
  ['wandNewBtn','wandAddBtn','wandSubBtn'].forEach(id=>{
    const el=document.getElementById(id); if(!el) return;
    const m=id==='wandAddBtn'?'add':id==='wandSubBtn'?'sub':'new';
    el.classList.toggle('active-mode', m===mode);
  });
}

// ── Composite canvas (image + colour fills rendered flat) ────────
function buildCompositeCanvas(){
  const iw=uploadedImage.width, ih=uploadedImage.height;
  const oc=document.createElement('canvas'); oc.width=iw; oc.height=ih;
  const og=oc.getContext('2d');
  og.drawImage(uploadedImage,0,0);
  colorFills.forEach(f=>{
    og.save(); og.globalAlpha=f.opacity; og.fillStyle=f.fill||'transparent';
    if(f.type==='rect') og.fillRect(iw/2+f.x,ih/2+f.y,f.width,f.height);
    else if(f.type==='polygon'&&f.points.length>=3){
      og.beginPath(); og.moveTo(iw/2+f.points[0].x,ih/2+f.points[0].y);
      f.points.slice(1).forEach(p=>og.lineTo(iw/2+p.x,ih/2+p.y));
      og.closePath(); og.fill();
    }
    og.restore();
  });
  return oc;
}

// ── Flood fill from a single seed pixel ─────────────────────────
function floodFill(srcCanvas,imgX,imgY,tol){
  const iw=srcCanvas.width, ih=srcCanvas.height;
  const px=srcCanvas.getContext('2d').getImageData(0,0,iw,ih).data;
  const seedX=Math.round(iw/2+imgX), seedY=Math.round(ih/2+imgY);
  if(seedX<0||seedY<0||seedX>=iw||seedY>=ih) return null;
  const si=(seedY*iw+seedX)*4;
  const sr=px[si],sg=px[si+1],sb=px[si+2];
  const tolSq=tol*tol*3;
  const mask=new Uint8Array(iw*ih);
  const queue=new Int32Array(iw*ih);
  let qH=0,qT=0;
  queue[qT++]=seedY*iw+seedX; mask[seedY*iw+seedX]=1;
  while(qH<qT){
    const pos=queue[qH++]; const fy=(pos/iw)|0, fx=pos%iw;
    const chk=(ni)=>{
      if(mask[ni]) return;
      const n=ni*4; const dr=px[n]-sr,dg=px[n+1]-sg,db=px[n+2]-sb;
      if(dr*dr+dg*dg+db*db<=tolSq){mask[ni]=1;queue[qT++]=ni;}
    };
    if(fx>0) chk(pos-1); if(fx<iw-1) chk(pos+1);
    if(fy>0) chk(pos-iw); if(fy<ih-1) chk(pos+iw);
  }
  return mask;
}

// ── Box select: pick all pixels inside box whose colour matches ──
// Samples the average colour in the box, then selects everything
// within the box that's within tolerance of that average.
function boxSelect(srcCanvas,imgX1,imgY1,imgX2,imgY2,tol){
  const iw=srcCanvas.width, ih=srcCanvas.height;
  const px=srcCanvas.getContext('2d').getImageData(0,0,iw,ih).data;
  // Convert image-space corners to pixel coords
  const px1=Math.max(0,Math.min(iw-1,Math.round(iw/2+Math.min(imgX1,imgX2))));
  const py1=Math.max(0,Math.min(ih-1,Math.round(ih/2+Math.min(imgY1,imgY2))));
  const px2=Math.max(0,Math.min(iw-1,Math.round(iw/2+Math.max(imgX1,imgX2))));
  const py2=Math.max(0,Math.min(ih-1,Math.round(ih/2+Math.max(imgY1,imgY2))));
  if(px2<=px1||py2<=py1) return null;

  // Sample up to 400 pixels to compute average colour in box
  const stepX=Math.max(1,Math.round((px2-px1)/20));
  const stepY=Math.max(1,Math.round((py2-py1)/20));
  let sumR=0,sumG=0,sumB=0,n=0;
  for(let y=py1;y<=py2;y+=stepY) for(let x=px1;x<=px2;x+=stepX){
    const i=(y*iw+x)*4; sumR+=px[i];sumG+=px[i+1];sumB+=px[i+2]; n++;
  }
  const avgR=sumR/n, avgG=sumG/n, avgB=sumB/n;
  const tolSq=tol*tol*3;

  // Select all pixels inside the box that match the average
  const mask=new Uint8Array(iw*ih);
  for(let y=py1;y<=py2;y++) for(let x=px1;x<=px2;x++){
    const i=(y*iw+x)*4;
    const dr=px[i]-avgR,dg=px[i+1]-avgG,db=px[i+2]-avgB;
    if(dr*dr+dg*dg+db*db<=tolSq) mask[y*iw+x]=1;
  }
  return mask;
}

// ── Merge new area into wandMask per mode ────────────────────────
function mergeIntoMask(newArea,mode){
  if(!newArea) return;
  if(mode==='new'||!wandMask){
    wandMask=newArea;
  } else if(mode==='add'){
    for(let i=0;i<wandMask.length;i++) if(newArea[i]) wandMask[i]=1;
  } else if(mode==='sub'){
    for(let i=0;i<wandMask.length;i++) if(newArea[i]) wandMask[i]=0;
  }
}

// ── Refresh overlay + panel after mask changes ───────────────────
function refreshWandUI(){
  if(!wandMask){wandPixCount.textContent='—';return;}
  let count=0; for(let i=0;i<wandMask.length;i++) if(wandMask[i]) count++;
  wandPixCount.textContent=count.toLocaleString()+' px';
  buildWandSvgPath(wandMask,wandIW,wandIH);
  buildWandPreview(wandMask,wandSrcCanvas);
  openWandPanel();
}

function rerunLastWand(){
  const newArea=floodFill(wandSrcCanvas,wandLastImgX,wandLastImgY,wandTolerance);
  if(newArea) wandMask=newArea;
  refreshWandUI();
}

// ── Marching-ants SVG path ────────────────────────────────────────
function buildWandSvgPath(mask,iw,ih){
  const rot=+document.getElementById('rotationSlider').value*90*Math.PI/180;
  const sc=+document.getElementById('scaleSlider').value;
  const cr=canvas.getBoundingClientRect(), wr=cvwrap.getBoundingClientRect();
  const cos=Math.cos(rot),sin=Math.sin(rot);
  function toScr(px2,py2){
    const ix=px2-iw/2, iy=py2-ih/2;
    const rx=ix*cos-iy*sin, ry=ix*sin+iy*cos;
    const ccx=rx*sc+canvas.width/2+imageOffsetX;
    const ccy=ry*sc+canvas.height/2+imageOffsetY;
    return[(cr.left-wr.left)+ccx/canvas.width*cr.width,
           (cr.top-wr.top)+ccy/canvas.height*cr.height];
  }
  const step=Math.max(1,Math.round(Math.max(iw,ih)/500));
  let d='';
  for(let y=0;y<ih;y+=step) for(let x=0;x<iw;x+=step){
    if(!mask[y*iw+x]) continue; const s=step;
    if(y===0||!mask[(y-1)*iw+x]){const[ax,ay]=toScr(x,y);const[bx,by]=toScr(x+s,y);d+=`M${ax.toFixed(1)},${ay.toFixed(1)}L${bx.toFixed(1)},${by.toFixed(1)}`;}
    if(y>=ih-s||!mask[(y+s)*iw+x]){const[ax,ay]=toScr(x,y+s);const[bx,by]=toScr(x+s,y+s);d+=`M${ax.toFixed(1)},${ay.toFixed(1)}L${bx.toFixed(1)},${by.toFixed(1)}`;}
    if(x===0||!mask[y*iw+x-1]){const[ax,ay]=toScr(x,y);const[bx,by]=toScr(x,y+s);d+=`M${ax.toFixed(1)},${ay.toFixed(1)}L${bx.toFixed(1)},${by.toFixed(1)}`;}
    if(x>=iw-s||!mask[y*iw+x+1]){const[ax,ay]=toScr(x+s,y);const[bx,by]=toScr(x+s,y+s);d+=`M${ax.toFixed(1)},${ay.toFixed(1)}L${bx.toFixed(1)},${by.toFixed(1)}`;}
  }
  wandPathEl.setAttribute('d',d||'');
  wandOverlaySvg.style.display='block';
}

// ── Update drag-box preview rect on SVG overlay ──────────────────
function updateWandBoxSvg(ix1,iy1,ix2,iy2){
  const rot=+document.getElementById('rotationSlider').value*90*Math.PI/180;
  const sc=+document.getElementById('scaleSlider').value;
  const cr=canvas.getBoundingClientRect(), wr=cvwrap.getBoundingClientRect();
  const cos=Math.cos(rot),sin=Math.sin(rot);
  function toScr(px2,py2){
    const ix=px2, iy=py2;
    const rx=ix*cos-iy*sin, ry=ix*sin+iy*cos;
    const ccx=rx*sc+canvas.width/2+imageOffsetX;
    const ccy=ry*sc+canvas.height/2+imageOffsetY;
    return[(cr.left-wr.left)+ccx/canvas.width*cr.width,
           (cr.top-wr.top)+ccy/canvas.height*cr.height];
  }
  const[sx1,sy1]=toScr(ix1,iy1);
  const[sx2,sy2]=toScr(ix2,iy2);
  wandBoxRect.setAttribute('x',Math.min(sx1,sx2));
  wandBoxRect.setAttribute('y',Math.min(sy1,sy2));
  wandBoxRect.setAttribute('width',Math.abs(sx2-sx1));
  wandBoxRect.setAttribute('height',Math.abs(sy2-sy1));
  wandOverlaySvg.style.display='block';
}

// ── Preview thumbnail ─────────────────────────────────────────────
function buildWandPreview(mask,srcCanvas){
  if(!srcCanvas) return;
  const iw=srcCanvas.width, ih=srcCanvas.height;
  let x0=iw,y0=ih,x1=0,y1=0;
  for(let i=0;i<mask.length;i++) if(mask[i]){const x=i%iw,y=(i/iw)|0;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
  if(x1<=x0||y1<=y0){wandPreviewCtx.clearRect(0,0,220,76);return;}
  const PW=220,PH=76;
  wandPreviewCv.width=PW;wandPreviewCv.height=PH;
  wandPreviewCtx.clearRect(0,0,PW,PH);
  for(let ty=0;ty<PH;ty+=8)for(let tx=0;tx<PW;tx+=8){wandPreviewCtx.fillStyle=(((tx+ty)/8)&1)?'#2a2a2a':'#1a1a1a';wandPreviewCtx.fillRect(tx,ty,8,8);}
  const bw=x1-x0+1,bh=y1-y0+1;
  const ratio=Math.min((PW-4)/bw,(PH-4)/bh);
  const dw=Math.round(bw*ratio),dh=Math.round(bh*ratio);
  const dx=Math.round((PW-dw)/2),dy=Math.round((PH-dh)/2);
  wandPreviewCtx.globalAlpha=0.2;wandPreviewCtx.drawImage(srcCanvas,x0,y0,bw,bh,dx,dy,dw,dh);wandPreviewCtx.globalAlpha=1;
  const mc=document.createElement('canvas');mc.width=dw;mc.height=dh;const mg=mc.getContext('2d');
  const mid=mg.createImageData(dw,dh);const md=mid.data;
  for(let py=0;py<dh;py++)for(let px2=0;px2<dw;px2++){const sx=x0+Math.min(bw-1,Math.round(px2/ratio));const sy=y0+Math.min(bh-1,Math.round(py/ratio));if(mask[sy*iw+sx])md[(py*dw+px2)*4+3]=255;}
  mg.putImageData(mid,0,0);
  const tmp=document.createElement('canvas');tmp.width=dw;tmp.height=dh;const tg=tmp.getContext('2d');
  tg.drawImage(srcCanvas,x0,y0,bw,bh,0,0,dw,dh);tg.globalCompositeOperation='destination-in';tg.drawImage(mc,0,0);
  wandPreviewCtx.drawImage(tmp,dx,dy);
  const tc=document.createElement('canvas');tc.width=dw;tc.height=dh;const tg2=tc.getContext('2d');
  tg2.fillStyle='rgba(96,165,250,0.3)';tg2.fillRect(0,0,dw,dh);tg2.globalCompositeOperation='destination-in';tg2.drawImage(mc,0,0);
  wandPreviewCtx.drawImage(tc,dx,dy);
}

// ── Apply ─────────────────────────────────────────────────────────
function wandApply(action){
  if(!wandMask||!uploadedImage) return;
  const iw=wandIW, ih=wandIH;
  if(action==='fill'||action==='erase'){
    saveState(true); // ← save current image BEFORE baking wand into it
    const nc=document.createElement('canvas');nc.width=iw;nc.height=ih;
    const ng=nc.getContext('2d');ng.drawImage(uploadedImage,0,0);
    const existing=ng.getImageData(0,0,iw,ih).data;
    const id2=ng.createImageData(iw,ih);const d2=id2.data;
    let cr2,cg2,cb2,ca2;
    if(action==='erase'){cr2=255;cg2=255;cb2=255;ca2=255;}
    else{const col=hexToRgb(activeFillColor==='ERASE'?'#ffffff':activeFillColor);cr2=col.r;cg2=col.g;cb2=col.b;ca2=Math.round(fillOpacity*255);}
    for(let i=0;i<wandMask.length;i++){
      const pi=i*4;
      if(wandMask[i]){
        if(action==='erase'){d2[pi]=255;d2[pi+1]=255;d2[pi+2]=255;d2[pi+3]=255;}
        else{const a=ca2/255;d2[pi]=Math.round(existing[pi]*(1-a)+cr2*a);d2[pi+1]=Math.round(existing[pi+1]*(1-a)+cg2*a);d2[pi+2]=Math.round(existing[pi+2]*(1-a)+cb2*a);d2[pi+3]=255;}
      }else{d2[pi]=existing[pi];d2[pi+1]=existing[pi+1];d2[pi+2]=existing[pi+2];d2[pi+3]=existing[pi+3];}
    }
    ng.putImageData(id2,0,0);
    const dataUrl=nc.toDataURL('image/png',1);
    const newImg=new Image();
    newImg.onload=()=>{
      uploadedImage=newImg;
      _currentImageDataUrl=dataUrl; // track the new image
      edgeData=null;wandClose();redrawCanvas();setStatus(t('statusWandApply',action));
    };
    newImg.src=dataUrl;
  } else if(action==='crop'){
    saveState(false);
    let x0=iw,y0=ih,x1=0,y1=0;
    for(let y=0;y<ih;y++)for(let x=0;x<iw;x++){if(wandMask[y*iw+x]){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}}
    selectionRect={x:x0-iw/2,y:y0-ih/2,width:x1-x0+1,height:y1-y0+1};
    updateFitCropBtn();wandClose();redrawCanvas();setStatus(t('statusWandCrop'));
  }
}

function hexToRgb(hex){
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return{r,g,b};
}

// ── Mouse handlers ────────────────────────────────────────────────
canvas.addEventListener('mousedown',e=>{
  if(currentTool!=='wand'||!uploadedImage) return;
  e.stopPropagation();
  const{cx,cy}=getMouse(e); const ip=toImage(cx,cy);
  // Rebuild composite if needed
  if(!wandSrcCanvas||wandIW!==uploadedImage.width||wandIH!==uploadedImage.height){
    wandSrcCanvas=buildCompositeCanvas();
    wandIW=uploadedImage.width; wandIH=uploadedImage.height;
  }
  let mode=wandClickMode;
  if(e.shiftKey) mode='add';
  else if(e.altKey) mode='sub';
  else if(!wandMask) mode='new';
  wandDragging=true;
  wandDragSX=ip.x; wandDragSY=ip.y;
  wandDragCurX=ip.x; wandDragCurY=ip.y;
  // Show box immediately
  updateWandBoxSvg(ip.x,ip.y,ip.x,ip.y);
  canvas._wandMode=mode;
},{capture:true});

canvas.addEventListener('mousemove',e=>{
  if(currentTool!=='wand'||!wandDragging) return;
  const{cx,cy}=getMouse(e); const ip=toImage(cx,cy);
  wandDragCurX=ip.x; wandDragCurY=ip.y;
  updateWandBoxSvg(wandDragSX,wandDragSY,ip.x,ip.y);
},{capture:true});

canvas.addEventListener('mouseup',e=>{
  if(currentTool!=='wand'||!uploadedImage) return;
  e.stopPropagation();
  if(!wandDragging) return;
  wandDragging=false;
  // Hide box preview
  wandBoxRect.setAttribute('width','0');
  const{cx,cy}=getMouse(e); const ip=toImage(cx,cy);
  const mode=canvas._wandMode||wandClickMode;
  const dx=Math.abs(ip.x-wandDragSX), dy=Math.abs(ip.y-wandDragSY);
  const threshold=5; // pixels in image-space — below this = click
  let newArea;
  if(dx<threshold&&dy<threshold){
    // CLICK: flood fill from seed
    wandLastImgX=ip.x; wandLastImgY=ip.y;
    newArea=floodFill(wandSrcCanvas,ip.x,ip.y,wandTolerance);
  } else {
    // DRAG: box select all matching colours in box
    newArea=boxSelect(wandSrcCanvas,wandDragSX,wandDragSY,ip.x,ip.y,wandTolerance);
  }
  mergeIntoMask(newArea,mode);
  refreshWandUI();
},{capture:true});

// Touch support
let wandTouchDragging=false;
canvas.addEventListener('touchstart',e=>{
  if(currentTool!=='wand'||!uploadedImage||e.touches.length!==1) return;
  const t=e.touches[0]; const{cx,cy}=getMouse({clientX:t.clientX,clientY:t.clientY}); const ip=toImage(cx,cy);
  if(!wandSrcCanvas||wandIW!==uploadedImage.width||wandIH!==uploadedImage.height){
    wandSrcCanvas=buildCompositeCanvas(); wandIW=uploadedImage.width; wandIH=uploadedImage.height;
  }
  wandTouchDragging=true;
  wandDragSX=ip.x; wandDragSY=ip.y; wandDragCurX=ip.x; wandDragCurY=ip.y;
  updateWandBoxSvg(ip.x,ip.y,ip.x,ip.y);
  canvas._wandMode=wandMask?wandClickMode:'new';
},{capture:true,passive:true});

canvas.addEventListener('touchmove',e=>{
  if(currentTool!=='wand'||!wandTouchDragging||e.touches.length!==1) return;
  const t=e.touches[0]; const{cx,cy}=getMouse({clientX:t.clientX,clientY:t.clientY}); const ip=toImage(cx,cy);
  wandDragCurX=ip.x; wandDragCurY=ip.y;
  updateWandBoxSvg(wandDragSX,wandDragSY,ip.x,ip.y);
},{capture:true,passive:true});

canvas.addEventListener('touchend',e=>{
  if(currentTool!=='wand'||!uploadedImage||!wandTouchDragging) return;
  wandTouchDragging=false;
  wandBoxRect.setAttribute('width','0');
  const t=e.changedTouches[0]; const{cx,cy}=getMouse({clientX:t.clientX,clientY:t.clientY}); const ip=toImage(cx,cy);
  const mode=canvas._wandMode||wandClickMode;
  const dx=Math.abs(ip.x-wandDragSX), dy=Math.abs(ip.y-wandDragSY);
  let newArea;
  if(dx<8&&dy<8){ wandLastImgX=ip.x; wandLastImgY=ip.y; newArea=floodFill(wandSrcCanvas,ip.x,ip.y,wandTolerance); }
  else { newArea=boxSelect(wandSrcCanvas,wandDragSX,wandDragSY,ip.x,ip.y,wandTolerance); }
  mergeIntoMask(newArea,mode);
  refreshWandUI();
},{capture:true,passive:true});
// ════════════════════════════════════════════════════════════════
// INIT
// ════════════════════════════════════════════════════════════════
(function init(){
  const[pw,ph]=currentPixelSize();
  initCanvas(pw,ph);
  setTool('drag');
  applyZoom();
  // snap is ON by default — activate all button states + badge
  ['snapBtn','pSnapBtn','mSnapBtn'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.classList.add('snap-on');
  });
  snapBadge.style.display='block';
  requestAnimationFrame(()=>{ fitCanvasCSS(pw,ph); applyZoom(); });
})();
