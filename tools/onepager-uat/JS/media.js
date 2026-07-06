// Compass Offices One-Pager Builder
// https://github.com/compassoffices/compassoffices.github.io

function phSlotClick(i){document.getElementById('ph-inp-'+i)?.click();}
// ── Photo compression ──────────────────────────────────────────────────────
// Resize + re-encode uploaded images before storing them as data URLs.
// A 4K iPhone photo is ~4–8MB as a data URL; after compression it's 150–400KB
// with no visible quality loss at A4 print size. Smaller data URLs mean:
//   • Faster canvas captures for queue/print
//   • Much smaller saved JSON files
//   • Faster slideToCanvas (fewer bytes for the browser to decode)
//
// maxSide: longest dimension cap in pixels
// quality: JPEG quality 0–1 (0.82 = excellent/imperceptible loss at A4)
// Returns a Promise<string> that resolves to the compressed data URL.
// Falls back to the original if anything goes wrong (e.g. SVG/GIF input).
async function _compressPhoto(dataUrl, maxSide = 1600, quality = 0.82){
  return new Promise(resolve => {
    // Skip compression for very small inputs or non-photo formats
    if(!dataUrl || !dataUrl.startsWith('data:image')) return resolve(dataUrl);
    const img = new Image();
    img.onload = () => {
      const origW = img.naturalWidth, origH = img.naturalHeight;
      // Already small enough — keep original to avoid a re-encode penalty
      if(origW <= maxSide && origH <= maxSide) return resolve(dataUrl);
      const scale = maxSide / Math.max(origW, origH);
      const w = Math.round(origW * scale);
      const h = Math.round(origH * scale);
      try {
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        const compressed = c.toDataURL('image/jpeg', quality);
        // Safety: if something went wrong and result is larger, keep original
        resolve(compressed.length < dataUrl.length ? compressed : dataUrl);
      } catch(e) {
        resolve(dataUrl); // tainted canvas etc. — keep original
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

function onPhotoSlot(i,e){
  const file=e.target.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=async ev=>{
    const orig=ev.target.result;
    const compressed=await _compressPhoto(orig,1600,0.82);
    S.photos[i]=compressed;
    renderPhotoSlots();gen();
    // Brief status showing original vs compressed size
    const origKB=Math.round(orig.length*0.75/1024);
    const newKB=Math.round(compressed.length*0.75/1024);
    if(origKB>newKB) showStatus(`Photo compressed: ${origKB}KB → ${newKB}KB`,'s-ok');
  };
  reader.readAsDataURL(file);e.target.value='';
}
function rmPhotoSlot(i){S.photos[i]=null;renderPhotoSlots();gen();}
function renderPhotoSlots(){
  for(let i=0;i<6;i++){
    const img=document.getElementById('ph-img-'+i);
    const empty=document.getElementById('ph-slot-empty-'+i);
    const rm=document.getElementById('ph-rm-'+i);
    const slot=document.getElementById('ph-slot-'+i);
    if(!img)continue;
    const src=S.photos[i];
    if(src){img.src=src;img.style.display='block';if(empty)empty.style.display='none';if(rm)rm.style.display='flex';if(slot)slot.classList.add('has-photo');}
    else{img.src='';img.style.display='none';if(empty)empty.style.display='';if(rm)rm.style.display='none';if(slot)slot.classList.remove('has-photo');}
  }
}
function mcToggleUrl(key){
  const row=document.getElementById('mc-'+key+'-url-row');
  const btn=document.querySelector(`[onclick*="mcToggleUrl('${key}')"]`);
  if(!row)return;
  const isOpen=row.classList.toggle('open');
  if(btn)btn.classList.toggle('on',isOpen);
  if(isOpen){const inp=document.getElementById('mc-'+key+'-url-input');if(inp)setTimeout(()=>inp.focus(),50);}
}
function mcApplyUrl(key){
  const inp=document.getElementById('mc-'+key+'-url-input');if(!inp)return;
  const url=inp.value.trim();if(!url)return;
  if(key==='logo'){S.partnerLogo=url;renderLogoCard();gen();}
  else if(key==='fp'){
    // Legacy single-URL apply — goes to plan 0
    if(FP_PLANS.length===0) FP_PLANS.push({url,label:'master'});
    else FP_PLANS[0]={url,label:'master'};
    S.floorplan=url;
    // Auto-extract base URL
    FP_BASE_URL=url.replace(/[^/]+\.(jpg|jpeg|png)$/i,'');
    const bInp=document.getElementById('fp-base-url');if(bInp)bInp.value=FP_BASE_URL;
    renderFpList();gen();
  }
  else if(key.startsWith('ph')){
    const i=parseInt(key.replace('ph',''));
    // Compress data-URL photos; external http URLs are left as-is (they
    // won't be stored in the JSON anyway, just referenced).
    if(url.startsWith('data:')){
      _compressPhoto(url,1600,0.82).then(c=>{S.photos[i]=c;renderPhotoSlots();gen();});
    } else {
      S.photos[i]=url;renderPhotoSlots();gen();
    }
  }
  const row=document.getElementById('mc-'+key+'-url-row');if(row)row.classList.remove('open');inp.value='';
}
function renderLogoCard(){
  const img=document.getElementById('mc-logo-img');const empty=document.getElementById('mc-logo-empty');const rm=document.getElementById('mc-logo-rm');const prev=document.getElementById('mc-logo-preview');
  if(!img)return;
  if(S.partnerLogo){img.src=S.partnerLogo;img.style.display='block';if(empty)empty.style.display='none';if(rm)rm.style.display='flex';if(prev)prev.style.cursor='default';if(prev)prev.onclick=null;}
  else{img.src='';img.style.display='none';if(empty)empty.style.display='';if(rm)rm.style.display='none';if(prev)prev.style.cursor='pointer';if(prev)prev.onclick=()=>document.getElementById('pl-up').click();}
}
// ── Page 2 custom floor plan slot ─────────────────────────────────────────
// Completely separate from S.floorplan / the Cloudinary highlight system.
// Uploaded here → shown only on page 2. Page 1 keeps the library highlights.

async function onFpP2Upload(e){
  const file = e.target.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = async ev => {
    const orig = ev.target.result;
    const compressed = await _compressPhoto(orig, 2400, 0.88);
    FP_P2_CUSTOM_URL = compressed;
    const origKB = Math.round(orig.length * 0.75 / 1024);
    const newKB  = Math.round(compressed.length * 0.75 / 1024);
    renderFpP2Slot();
    gen();
    if(origKB > newKB) showStatus(`Page 2 floor plan: ${origKB}KB → ${newKB}KB`, 's-ok');
  };
  reader.readAsDataURL(file);
  e.target.value = '';
}

function clearFpP2(){
  FP_P2_CUSTOM_URL = null;
  renderFpP2Slot();
  gen();
}

function renderFpP2Slot(){
  const empty  = document.getElementById('fp-p2-empty');
  const filled = document.getElementById('fp-p2-filled');
  const thumb  = document.getElementById('fp-p2-thumb');
  if(!empty || !filled) return;
  if(FP_P2_CUSTOM_URL){
    empty.style.display  = 'none';
    filled.style.display = 'flex';
    if(thumb) thumb.src  = FP_P2_CUSTOM_URL;
  } else {
    empty.style.display  = 'flex';
    filled.style.display = 'none';
  }
}

// setFpUseLocal kept for backward-compat with older saved JSON files
// (fp_use_local field) — no longer exposed in UI.
function setFpUseLocal(v){ FP_USE_LOCAL = !!v; gen(); }

function renderFloorplanCard(){
  // Legacy compat: sync S.floorplan from FP_PLANS[0]
  S.floorplan = FP_PLANS.length > 0 ? FP_PLANS[0].url : null;
  renderFpList();
}
function rmFloorplan(){FP_PLANS=[];S.floorplan=null;renderFpList();gen();}
function onFloorplan(e){
  const f=e.target.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=async ev=>{
    // Floor plans need more detail than photos (room numbers, labels)
    // so use a higher maxSide and quality.
    const orig=ev.target.result;
    const compressed=await _compressPhoto(orig,2400,0.88);
    S.floorplan=compressed;
    FP_PLANS=[{url:compressed,label:'Master'}];
    renderFpList();
    gen();
    const origKB=Math.round(orig.length*0.75/1024);
    const newKB=Math.round(compressed.length*0.75/1024);
    if(origKB>newKB) showStatus(`Floor plan compressed: ${origKB}KB → ${newKB}KB`,'s-ok');
  };
  r.readAsDataURL(f);
}

// ── MULTI-FLOORPLAN SYSTEM ────────────────────────────────
// Setter functions — needed because let variables can't be assigned from inline onclick attributes
function setFpP1(i){FP_PAGE1_IDX=i;renderFpList();gen();}
function setFpP2(i){FP_PAGE2_IDX=i;renderFpList();gen();}
let _fpDataDebounceT = null;
function setFpBaseUrl(v){
  // ── Normalize: handle the common mistake of pasting the full master.png
  // URL into the Base URL field. We want a directory prefix, so if the
  // pasted URL ends with .png/.jpg/.jpeg, strip that filename off.
  // Without this, the tool would build URLs like ".../master.pngmaster.png".
  const m = v && v.match(/^(.+\/)([^\/]+\.(?:png|jpe?g))(\?.*)?$/i);
  if(m){
    v = m[1];
    // Reflect the normalized value in the input field, but deferred so we
    // don't yank the cursor while the user is still typing/pasting.
    const inp = document.getElementById('fp-base-url');
    if(inp && inp.value !== v){
      setTimeout(() => { if(document.activeElement !== inp) inp.value = v; }, 80);
    }
  }
  FP_BASE_URL=v;
  // Auto-create a "Master" plan as FP_PLANS[0] when user enters a Base URL.
  // This means the master image appears in the preview immediately without
  // the user needing to type "master" in the room # input.
  if(v){
    const masterUrl = v + 'master.png';
    if(!FP_PLANS.length){
      FP_PLANS.push({url: masterUrl, label: 'Master'});
      S.floorplan = masterUrl;
    } else if(!FP_PLANS[0].url || /master\.(png|jpe?g)$/i.test(FP_PLANS[0].url)){
      // Empty slot, or it already pointed at a master image → update in place
      FP_PLANS[0] = {url: masterUrl, label: 'Master'};
      S.floorplan = masterUrl;
    }
  }
  renderFpList();
  renderPrFpChips();
  gen();
  // Base URL change can also trigger a fetch IF user hasn't set a separate
  // Data URL — old behavior of "{base}data.json" stays as a convenience.
  clearTimeout(_fpDataDebounceT);
  _fpDataDebounceT = setTimeout(()=>{ if(!FP_DATA_URL) tryFetchFpData(); }, 600);
}
function setFpDataUrl(v){
  FP_DATA_URL = v;
  clearTimeout(_fpDataDebounceT);
  _fpDataDebounceT = setTimeout(()=>tryFetchFpData(true), 500);
}

// ── Pricing tab → Floor Plan Room # shortcut ──────────────────────────────
// Mirrors the Media tab but provides a quick-add from the Pricing context
function prAddFpPlan(roomVal){
  // Live-update: if base URL is set and room typed, update the last plan or add new
  // Just refresh chips for visual feedback
  renderPrFpChips();
}

function prAddFpPlanBtn(){
  const inp=document.getElementById('pr-fp-room');
  if(!inp) return;
  const room=inp.value.trim();
  if(!room) return;
  // When the user types a room manually here, treat it as user-owned —
  // drop it from the auto-tracked set so unchecking the office in Office
  // Lookup won't sweep this entry away.
  const stripped = room.replace(/\s*-\s*C$/i,'').trim();
  if(stripped) _AUS_FP_AUTO_ADDED.delete(stripped);
  // ── Highlight mode: add to manual highlights and bake into master ──
  if(FP_MASTER_DATA){
    const ok = fpHighlightAdd(room);
    if(!ok){
      // Room not found in polygon data — show a hint without alerting
      const status = document.getElementById('fp-data-status');
      if(status){
        const prev = status.innerHTML;
        status.innerHTML = `<span style="color:#dc2626;font-weight:600;">⚠ Room "${room}" is not in the polygon data (data.json). Check the room number.</span>`;
        setTimeout(()=>{ updateFpDataStatusUI(); }, 3500);
      }
    }
    inp.value='';
    return;
  }
  // ── Legacy image-collage mode: append individual room PNG ──
  const base=FP_BASE_URL;
  if(!base){
    alert('Set the Base URL in the Media → Floor Plan section first.');
    return;
  }
  const url=base+(room.toLowerCase()==='master'?room:_fpRoomSlug(room))+'.png';
  const label=room.toLowerCase()==='master'?'Master':room;
  const exists=FP_PLANS.some(p=>p.label===label||p.url===url);
  if(!exists){
    FP_PLANS.push({url,label});
    if(FP_PLANS.length===1) S.floorplan=url;
    applyFpSmartDefaults();
    renderFpList();
    gen();
  }
  inp.value='';
  renderPrFpChips();
}

function renderPrFpChips(){
  const chips=document.getElementById('pr-fp-chips');
  if(!chips) return;

  // ── Highlight mode: show currently-highlighted rooms (all manual) ──
  if(FP_MASTER_DATA){
    const manualIds = new Set();
    FP_HIGHLIGHTS_MANUAL.forEach(id => {
      const m = fpFindRoom(id);
      if(m) manualIds.add(m.displayLabel);
    });
    const allIds = [...manualIds].sort();
    // Master chip ALWAYS first — non-removable, indicates master plan is the base layer
    const masterChip = `
      <div style="display:flex;align-items:center;gap:4px;padding:2px 8px 2px 6px;border-radius:20px;background:var(--drk);border:1px solid var(--drk);font-size:11px;color:#fff;font-weight:700;" title="Master floor plan — always shown as the base layer">
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/></svg>
        <span>Master</span>
      </div>`;
    if(!allIds.length){
      chips.innerHTML = masterChip + `<span style="font-size:10.5px;color:var(--xlt);font-style:italic;margin-left:6px;">No rooms highlighted yet · type a room # above and click "+ Add Plan".</span>`;
    } else {
      chips.innerHTML = masterChip + allIds.map(id => {
        const room = fpFindRoom(id);
        const colour = (room && room.fillColor) || '#FF6600';
        return `
          <div style="display:flex;align-items:center;gap:3px;padding:2px 8px 2px 6px;border-radius:20px;background:var(--olt);border:1px solid var(--o);font-size:11px;color:var(--o);font-weight:600;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${colour};border:1px solid rgba(0,0,0,.1);"></span>
            <span>${id}</span>
            <button onclick="fpHighlightRemove('${id.replace(/'/g,"\\'")}')" style="border:none;background:transparent;color:var(--o);cursor:pointer;padding:0;line-height:1;font-size:12px;margin-left:1px;" title="Remove">×</button>
          </div>
        `;
      }).join('');
    }
    const inp=document.getElementById('pr-fp-room');
    if(inp) inp.placeholder = `e.g. ${FP_MASTER_DATA.rooms[0]?.displayLabel||'2412'} (type room # to highlight)`;
    return;
  }

  // ── Legacy image-collage mode: show FP_PLANS ──
  chips.innerHTML=FP_PLANS.map((fp,i)=>`
    <div style="display:flex;align-items:center;gap:3px;padding:2px 8px 2px 6px;border-radius:20px;background:var(--olt);border:1px solid var(--o);font-size:11px;color:var(--o);font-weight:600;">
      ${fp.url&&!fp.url.startsWith('data:')?`<img src="${fp.url}" style="width:16px;height:12px;object-fit:contain;border-radius:2px;background:#fff;">`:''}
      <span>${i===0?'Master':fp.label||'Plan '+(i+1)}</span>
      <button onclick="delFpPlan(${i});renderPrFpChips();" style="border:none;background:transparent;color:var(--o);cursor:pointer;padding:0;line-height:1;font-size:12px;margin-left:1px;">×</button>
    </div>
  `).join('');
  const inp=document.getElementById('pr-fp-room');
  if(inp) inp.placeholder=FP_PLANS.length===0?'master (first = master plan)':`e.g. ${FP_PLANS.length+2400} (add more rooms)`;
}

// ══════════════════════════════════════════════════════════
//  HIGHLIGHT MODE — implementation
// ══════════════════════════════════════════════════════════

// Convert "#FF6600" or "#F60" → {r,g,b}. Falls back to brand orange.
function fpHexToRgb(hex){
  if(!hex) return {r:255,g:102,b:0};
  const s = hex.length===4 ? '#'+hex[1]+hex[1]+hex[2]+hex[2]+hex[3]+hex[3] : hex;
  const r=parseInt(s.slice(1,3),16),g=parseInt(s.slice(3,5),16),b=parseInt(s.slice(5,7),16);
  if(isNaN(r)||isNaN(g)||isNaN(b)) return {r:255,g:102,b:0};
  return {r,g,b};
}

// Find a room in FP_MASTER_DATA that matches a given pricing/manual label.
// Accepts the displayLabel directly ("2717"), the short label ("17"),
// and tolerates whitespace + an optional "- C" suffix that AUS uses.
function fpFindRoom(needle){
  if(!FP_MASTER_DATA || !needle) return null;
  const raw=String(needle).trim(); if(!raw) return null;
  const rooms=FP_MASTER_DATA.rooms||[];
  // Variants to try, most-specific first:
  //  raw       "15-85 - C (90,93,95)"  exact AUS office ID
  //  noHyphen  "1585 - C (90,93,95)"   remove digit-hyphen-digit → matches data.json displayLabel
  //  stripC    "15-85"                 strip "- C …" → base room fallback
  //  stripCnh  "1585"                  noHyphen version of stripC
  //  slug      "1585_-_C_90_93_95"     underscore slug
  const noHyphen = raw.replace(/(\d)-(\d)/g,'$1$2');
  const stripC   = raw.replace(/\s*-\s*C\b.*/i,'').trim();
  const stripCnh = noHyphen.replace(/\s*-\s*C\b.*/i,'').trim();
  const slug     = typeof _fpRoomSlug==='function' ? _fpRoomSlug(raw) : raw;
  const variants = [raw,noHyphen,slug,stripC,stripCnh].filter((v,i,a)=>v&&a.indexOf(v)===i);
  for(const n of variants){
    const found = rooms.find(r=>r.displayLabel===n)
               || rooms.find(r=>r.label===n)
               || rooms.find(r=>String(r.displayLabel).toLowerCase()===n.toLowerCase());
    if(found) return found;
  }
  return null;
}

// Collect every room that should currently be highlighted.
// Returns a sorted array of {displayLabel, polygon, fillColor, ...}.
// Highlights are MANUAL only — driven by the Floor Plan Room # input in
// the Pricing tab. Pricing row office numbers no longer auto-highlight
// (would surprise users into seeing rooms they didn't ask for).
function getActiveHighlightRooms(){
  if(!FP_MASTER_DATA) return [];
  const seen = new Set(), out = [];
  FP_HIGHLIGHTS_MANUAL.forEach(id => {
    const room = fpFindRoom(id);
    if(room && !seen.has(room.displayLabel)){
      seen.add(room.displayLabel);
      out.push(room);
    }
  });
  return out.sort((a,b)=>String(a.displayLabel).localeCompare(String(b.displayLabel)));
}

// Cache key — same set of rooms with same colours → same rendered image.
function fpHighlightCacheKey(rooms){
  if(!FP_MASTER_DATA) return '';
  const masterUrl = getMasterImageUrl();
  return masterUrl + '|' + rooms.map(r => r.displayLabel + ':' + (r.fillColor||'')).join(',');
}

// Load a cross-origin image robustly for canvas drawing.
// Strategy 1 (preferred): fetch the bytes → blob → data URL → img.
//   The data URL is treated as same-origin, so the canvas isn't tainted and
//   toDataURL works. Most reliable for Cloudinary which serves images with
//   CORS headers — fetch() can read the bytes even when img+crossOrigin
//   sometimes can't paint to canvas due to subtle header mismatches.
// Strategy 2 (fallback): traditional img + crossOrigin='anonymous'.
//   Used only if Strategy 1 fails for some reason (e.g. fetch blocked).
async function fpLoadImage(url){
  try {
    const resp = await fetch(url, {mode:'cors', credentials:'omit', cache:'no-cache'});
    if(!resp.ok) throw new Error('HTTP '+resp.status+' '+resp.statusText);
    const blob = await resp.blob();
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error || new Error('FileReader failed'));
      reader.readAsDataURL(blob);
    });
    return await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload  = () => resolve(img);
      img.onerror = () => reject(new Error('Image decode failed from data URL'));
      img.src = dataUrl;
    });
  } catch (fetchErr) {
    console.warn('[Floor plan] fetch+blob image load failed, trying img+crossOrigin fallback:', fetchErr.message);
    return await new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload  = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image (both strategies): '+url+' — original error: '+fetchErr.message));
      img.src = url;
    });
  }
}

// Effective Data URL — explicit FP_DATA_URL wins; fall back to {base}data.json
// so users who keep everything in one folder don't need to fill both fields.
function fpEffectiveDataUrl(){
  if(FP_DATA_URL) return FP_DATA_URL;
  if(FP_BASE_URL) return FP_BASE_URL + 'data.json';
  return '';
}

// The directory containing the JSON — used as the base for the master image,
// since the extractor outputs master.png alongside data.json.
function fpDataDir(){
  const u = fpEffectiveDataUrl();
  if(!u) return '';
  const i = u.lastIndexOf('/');
  return i >= 0 ? u.substring(0, i+1) : '';
}

// Resolve the master image URL. On Cloudinary, JSON files live under
// /raw/upload/ but PNG images live under /image/upload/ — so we MUST use
// FP_BASE_URL (the image base) for the master, NOT the JSON's directory.
// If master.file in the JSON is an absolute URL we use it verbatim.
// Fall back to the JSON's directory only when no image base is set at all
// (unusual; mainly for self-hosted setups where both live in one folder).
function _getMasterImageUrl2D(){
  const f = FP_MASTER_DATA?.master?.file || 'master.png';
  if(/^https?:\/\//i.test(f)) return f;
  return (FP_BASE_URL || fpDataDir()) + f;
}
function getMasterImageUrl(){
  // Apply the 3D variant when the user has toggled it on AND the probe has
  // confirmed a same-dimension file is available. Otherwise return the
  // canonical 2D URL unchanged.
  const url = _getMasterImageUrl2D();
  return (FP_USE_3D && FP_HAS_3D) ? _master3dUrl(url) : url;
}

// Insert `-3d` before the file extension. Works for any extension and any
// path (relative or absolute, query-string-free): `master.png` →
// `master-3d.png`, `https://cdn/.../plan.jpg` → `https://cdn/.../plan-3d.jpg`.
function _master3dUrl(url){
  return url.replace(/(\.[a-z]+)$/i, '-3d$1');
}

// Probe whether a 3D variant exists at the expected URL AND has the same
// pixel dimensions as the 2D master (polygons are absolute pixel coords —
// different dimensions would misalign every highlight). Called whenever
// FP_MASTER_DATA loads (or fails). Updates FP_HAS_3D and re-renders the
// toggle UI; auto-clears FP_USE_3D when 3D is no longer available so a
// stale saved-state can't show a missing file.
async function _probeFp3D(){
  FP_HAS_3D = false;
  if(!FP_MASTER_DATA){ _renderFp3DToggle(); return false; }
  const url2d = _getMasterImageUrl2D();
  const url3d = _master3dUrl(url2d);
  // Same URL means filename doesn't have an extension we can rewrite — skip.
  if(url2d === url3d){ _renderFp3DToggle(); return false; }
  try{
    const [img2d, img3d] = await Promise.all([
      fpLoadImage(url2d).catch(() => null),
      fpLoadImage(url3d).catch(() => null),
    ]);
    if(!img2d || !img3d){
      FP_HAS_3D = false;
    } else if(img2d.naturalWidth !== img3d.naturalWidth ||
              img2d.naturalHeight !== img3d.naturalHeight){
      console.warn(
        `[Floor plan] 3D variant dimensions mismatch — 2D is `+
        `${img2d.naturalWidth}×${img2d.naturalHeight}, 3D is `+
        `${img3d.naturalWidth}×${img3d.naturalHeight}. Toggle disabled.`);
      FP_HAS_3D = false;
    } else {
      FP_HAS_3D = true;
    }
  } catch(e){
    FP_HAS_3D = false;
  }
  // ── Auto-fallback ──
  // Probe has finished. If the user's saved FP_USE_3D was true but the 3D
  // file is missing or mismatched, silently flip back to 2D and invalidate
  // the highlight cache so the next render uses the 2D background.
  // CRITICAL: this auto-flip lives HERE, not in _renderFp3DToggle, so that
  // calling _renderFp3DToggle during the transient "probe in flight" state
  // (right after FP_MASTER_DATA is nulled, before the new fetch resolves)
  // doesn't accidentally clobber the user's restored preference.
  if(!FP_HAS_3D && FP_USE_3D){
    FP_USE_3D = false;
    FP_HIGHLIGHT_LAST_KEY = null;
    FP_HIGHLIGHT_RENDER_URL = null;
    if(typeof gen === 'function') gen();
  }
  _renderFp3DToggle();
  return FP_HAS_3D;
}

// Set the 2D/3D mode. Invalidates the cached highlight render so the next
// gen() pulls the new background and overlays the polygons fresh on top.
function setFp3D(use3d){
  use3d = !!use3d;
  if(FP_USE_3D === use3d) return;
  FP_USE_3D = use3d;
  document.getElementById('fp-3d-btn-2d')?.classList.toggle('active', !FP_USE_3D);
  document.getElementById('fp-3d-btn-3d')?.classList.toggle('active',  FP_USE_3D);
  // Invalidate every highlight cache key so a new render fires with the
  // 3D background. Without this the slide would keep the stale 2D blob.
  FP_HIGHLIGHT_LAST_KEY = null;
  FP_HIGHLIGHT_RENDER_URL = null;
  Object.keys(FP_HIGHLIGHT_CACHE).forEach(k => delete FP_HIGHLIGHT_CACHE[k]);
  if(typeof ensureHighlightRender === 'function') ensureHighlightRender();
  gen();
}

// Pure UI render — show/hide the toggle row and reflect current state.
// Called from invalidation paths and from _probeFp3D. Does NOT mutate
// FP_USE_3D; the actual auto-fallback decision belongs to _probeFp3D
// (which knows the probe finished). Calling this during a probe-pending
// window simply hides the toggle until the probe resolves.
function _renderFp3DToggle(){
  const wrap = document.getElementById('fp-3d-toggle-wrap');
  if(!wrap) return;
  wrap.style.display = FP_HAS_3D ? 'inline-flex' : 'none';
  document.getElementById('fp-3d-btn-2d')?.classList.toggle('active', !FP_USE_3D);
  document.getElementById('fp-3d-btn-3d')?.classList.toggle('active',  FP_USE_3D);
}

// ── Compass controls ──────────────────────────────────────────────────────

function toggleCompass(){
  COMPASS_ON = !COMPASS_ON;
  _renderCompassControl();
  gen();
}

// Set rotation angle (clamped to 0–359, clockwise from north).
function setCompassAngle(deg){
  COMPASS_ANGLE = Math.round(((deg % 360) + 360) % 360);
  _renderCompassControl();
  gen();
}

// Convert a heading angle to the nearest compass cardinal label.
function _compassCardinal(deg){
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE',
                'S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

// Sync every piece of the compass control UI to current state.
function _renderCompassControl(){
  const btn  = document.getElementById('compass-toggle-btn');
  const ctrl = document.getElementById('compass-angle-control');
  const img  = document.getElementById('compass-preview-img');
  const disp = document.getElementById('compass-angle-display');
  const card = document.getElementById('compass-direction-label');
  if(btn)  btn.classList.toggle('on', COMPASS_ON);
  if(ctrl) ctrl.style.display = COMPASS_ON ? 'flex' : 'none';
  // MUST combine translate(-50%,-50%) with rotate so the icon stays
  // centred in the dial circle. Setting rotate alone overwrites the
  // translate and kicks the image out of alignment.
  if(img)  img.style.transform = `translate(-50%,-50%) rotate(${COMPASS_ANGLE}deg)`;
  if(disp) disp.textContent = `${COMPASS_ANGLE}°`;
  if(card) card.textContent = _compassCardinal(COMPASS_ANGLE);
}

// ── Drag-to-rotate dial ───────────────────────────────────────────────────
// The small compass preview image is the drag handle. Mousedown/touchstart
// starts tracking; angle is computed from the vector between the pointer
// and the centre of the dial circle, using atan2(dx, -dy) so that "up"
// = 0° = north and clockwise = positive.
let _compassDragging = false;

function compassDragStart(e){
  e.preventDefault();
  _compassDragging = true;
  _compassDragUpdate(e.touches ? e.touches[0] : e);
  const moveH = ev => {
    if(!_compassDragging) return;
    ev.preventDefault();
    _compassDragUpdate(ev.touches ? ev.touches[0] : ev);
  };
  const upH = () => {
    _compassDragging = false;
    document.removeEventListener('mousemove', moveH);
    document.removeEventListener('mouseup',   upH);
    document.removeEventListener('touchmove', moveH);
    document.removeEventListener('touchend',  upH);
  };
  document.addEventListener('mousemove', moveH);
  document.addEventListener('mouseup',   upH);
  document.addEventListener('touchmove', moveH, {passive:false});
  document.addEventListener('touchend',  upH);
}

function _compassDragUpdate(e){
  const dial = document.getElementById('compass-dial');
  if(!dial) return;
  const r = dial.getBoundingClientRect();
  const cx = r.left + r.width  / 2;
  const cy = r.top  + r.height / 2;
  const dx = (e.clientX !== undefined ? e.clientX : e.pageX) - cx;
  const dy = (e.clientY !== undefined ? e.clientY : e.pageY) - cy;
  // atan2(dx, -dy): 0° at top, +ve clockwise — matches compass convention
  const raw = Math.atan2(dx, -dy) * 180 / Math.PI;
  setCompassAngle(raw);
}

// Keyboard handler for the compass dial.
// Arrow keys rotate by 1°; Shift+Arrow by 15°; Home resets to 0°.
function compassKeyDown(e){
  const step = e.shiftKey ? 15 : 1;
  if(e.key === 'ArrowRight' || e.key === 'ArrowUp'){
    e.preventDefault(); setCompassAngle(COMPASS_ANGLE + step);
  } else if(e.key === 'ArrowLeft' || e.key === 'ArrowDown'){
    e.preventDefault(); setCompassAngle(COMPASS_ANGLE - step);
  } else if(e.key === 'Home'){
    e.preventDefault(); setCompassAngle(0);
  }
}

// Core renderer: draw the master, then overlay each highlighted polygon.
async function renderHighlightedMaster(rooms){
  if(!FP_MASTER_DATA) return null;
  const masterUrl = getMasterImageUrl();
  const img = await fpLoadImage(masterUrl);
  const cv = document.createElement('canvas');
  cv.width = img.naturalWidth;
  cv.height = img.naturalHeight;
  const ctx = cv.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const lineWidth = Math.max(2, img.naturalWidth * 0.002);
  rooms.forEach(room => {
    let hasPath = false;
    if(room.polygon && room.polygon.length >= 3){
      ctx.beginPath();
      ctx.moveTo(room.polygon[0].x, room.polygon[0].y);
      for(let i=0; i<room.polygon.length; i++){
        const A = room.polygon[i];
        const B = room.polygon[(i+1) % room.polygon.length];
        if(A.hOut){
          ctx.bezierCurveTo(A.x+A.hOut[0], A.y+A.hOut[1],
                            B.x+(B.hIn?B.hIn[0]:-A.hOut[0]*0.4), B.y+(B.hIn?B.hIn[1]:-A.hOut[1]*0.4),
                            B.x, B.y);
        } else {
          ctx.lineTo(B.x, B.y);
        }
      }
      ctx.closePath();
      hasPath = true;
    } else if(room.rect){
      ctx.beginPath();
      ctx.rect(room.rect.x1, room.rect.y1, room.rect.x2-room.rect.x1, room.rect.y2-room.rect.y1);
      hasPath = true;
    }
    if(!hasPath) return;
    const {r,g,b} = fpHexToRgb(room.fillColor || FP_DEFAULT_HIGHLIGHT_COLOR);
    ctx.fillStyle   = `rgba(${r},${g},${b},0.45)`;  ctx.fill();
    ctx.strokeStyle = `rgba(${r},${g},${b},1)`;
    ctx.lineWidth   = lineWidth;
    ctx.stroke();
  });
  return cv.toDataURL('image/png');
}

// Main entry — call from anywhere that mutates highlight inputs.
// Returns immediately; if a render is needed it kicks off async and
// re-calls gen() when ready (so the slide updates with the new URL).
function ensureHighlightRender(){
  if(!FP_MASTER_DATA){
    FP_HIGHLIGHT_RENDER_URL = null;
    FP_HIGHLIGHT_LAST_KEY = null;
    return;
  }
  const rooms = getActiveHighlightRooms();
  if(!rooms.length){
    // No highlights → master shown without overlay (handled in buildFpHtml)
    FP_HIGHLIGHT_RENDER_URL = null;
    FP_HIGHLIGHT_LAST_KEY = null;
    return;
  }
  const key = fpHighlightCacheKey(rooms);
  if(key === FP_HIGHLIGHT_LAST_KEY) return;
  if(FP_HIGHLIGHT_CACHE[key]){
    FP_HIGHLIGHT_RENDER_URL = FP_HIGHLIGHT_CACHE[key];
    FP_HIGHLIGHT_LAST_KEY = key;
    return;
  }
  FP_HIGHLIGHT_PENDING_KEY = key;
  if(FP_HIGHLIGHT_RENDERING) return; // will pick up pending on completion
  fpStartRender(rooms);
}

async function fpStartRender(initialRooms){
  FP_HIGHLIGHT_RENDERING = true;
  let safety = 0;
  while(FP_HIGHLIGHT_PENDING_KEY && safety < 8){
    safety++;
    const targetKey = FP_HIGHLIGHT_PENDING_KEY;
    const rooms = (safety === 1) ? initialRooms : getActiveHighlightRooms();
    try{
      const url = await renderHighlightedMaster(rooms);
      FP_HIGHLIGHT_CACHE[targetKey] = url;
      if(FP_HIGHLIGHT_PENDING_KEY === targetKey){
        FP_HIGHLIGHT_RENDER_URL = url;
        FP_HIGHLIGHT_LAST_KEY = targetKey;
        FP_HIGHLIGHT_PENDING_KEY = null;
        FP_HIGHLIGHT_LAST_ERROR = '';
        gen();
      }
    } catch(err){
      console.warn('Floor plan highlight render failed:', err);
      FP_HIGHLIGHT_PENDING_KEY = null;
      FP_HIGHLIGHT_LAST_ERROR = err.message || String(err);
      updateFpDataStatusUI();
      break;
    }
  }
  FP_HIGHLIGHT_RENDERING = false;
}

// Fetch the polygon JSON. Uses FP_DATA_URL when set, else falls back to
// {base}data.json. On success → activates highlight mode. On failure
// (404, CORS, malformed) → silent fallback to legacy image-collage mode.
//   force=true: bypass the dedupe check (used by the Reload button + card load).
//   fromLoad=true: don't auto-set Page 2 different (saved card carries the
//                  user's prior preference; don't overwrite it).
async function tryFetchFpData(force, fromLoad){
  const url = fpEffectiveDataUrl();
  if(!url){
    FP_MASTER_DATA = null;
    FP_HAS_3D = false;
    if(typeof _renderFp3DToggle === 'function') _renderFp3DToggle();
    FP_DATA_STATUS = 'idle';
    FP_DATA_LAST_FETCHED_BASE = '';
    FP_HIGHLIGHT_RENDER_URL = null;
    FP_HIGHLIGHT_LAST_KEY = null;
    updateFpDataStatusUI();
    return;
  }
  if(!force && url === FP_DATA_LAST_FETCHED_BASE && FP_DATA_STATUS === 'ok') return;
  const wasInHighlightMode = !!FP_MASTER_DATA;
  FP_DATA_LAST_FETCHED_BASE = url;
  FP_DATA_STATUS = 'fetching';
  updateFpDataStatusUI();
  try{
    const resp = await fetch(url, {mode:'cors', credentials:'omit', cache:'no-cache'});
    if(!resp.ok) throw new Error('HTTP '+resp.status);
    const data = await resp.json();
    if(!data || !Array.isArray(data.rooms)) throw new Error('Malformed JSON (missing rooms[])');
    FP_MASTER_DATA = data;
    FP_DATA_STATUS = 'ok';
    FP_HIGHLIGHT_LAST_KEY = null;
    FP_HIGHLIGHT_LAST_ERROR = '';
    Object.keys(FP_HIGHLIGHT_CACHE).forEach(k => delete FP_HIGHLIGHT_CACHE[k]);
    // Fire-and-forget probe for the 3D variant. Updates FP_HAS_3D + the
    // toggle UI when it completes (async, doesn't block the render).
    _probeFp3D();
    // ── On FIRST entry to highlight mode for this session/card, default to
    // "Page 2 different" so page 1 shows room close-ups and page 2 shows
    // the master with highlights. Skip when loading a saved card so the
    // user's saved toggle preference is preserved.
    if(!wasInHighlightMode && !fromLoad){
      FP_PAGE2_SAME = false;
      FP_PAGE1_IDX = -2;
      FP_PAGE2_IDX = 0;
      document.getElementById('fp-p2-same')?.classList.remove('on');
      document.getElementById('fp-p2-diff')?.classList.add('on');
    }
    updateFpDataStatusUI();
    // Now that polygon data is available, repaint the Floor Plan Room #
    // chip strip. Without this, a re-edit from + Queue keeps the chips
    // empty: FP_HIGHLIGHTS_MANUAL was already restored, but renderPrFpChips
    // ran earlier while FP_MASTER_DATA was still null and fell through to
    // the collage-mode branch (showing nothing because FP_PLANS had only
    // the auto-Master entry).
    if(typeof renderPrFpChips === 'function') renderPrFpChips();
    ensureHighlightRender();
    gen();
  } catch(err){
    FP_MASTER_DATA = null;
    FP_HAS_3D = false;
    if(typeof _renderFp3DToggle === 'function') _renderFp3DToggle();
    FP_DATA_STATUS = 'error';
    FP_HIGHLIGHT_RENDER_URL = null;
    FP_HIGHLIGHT_LAST_KEY = null;
    updateFpDataStatusUI();
    console.info('[Floor plan] No polygon data at', url, '(falling back to image mode)');
    gen();
  }
}

function updateFpDataStatusUI(){
  const el = document.getElementById('fp-data-status');
  if(!el) return;
  const url = fpEffectiveDataUrl();
  const shortUrl = url ? url.length > 60 ? '…'+url.slice(-58) : url : '';
  if(FP_DATA_STATUS === 'fetching'){
    el.innerHTML = `<span style="color:var(--o);font-weight:600;">⟳ Fetching ${shortUrl}…</span>`;
  } else if(FP_DATA_STATUS === 'ok' && FP_MASTER_DATA){
    const n = (FP_MASTER_DATA.rooms || []).length;
    const lvl = FP_MASTER_DATA.level ? ' · Level '+FP_MASTER_DATA.level : '';
    const masterUrl = getMasterImageUrl() || '(no image base)';
    const errLine = FP_HIGHLIGHT_LAST_ERROR
      ? `<div style="margin-top:3px;padding:4px 7px;background:#fef2f2;border:1px solid #fecaca;border-radius:4px;color:#991b1b;font-size:10px;line-height:1.4;"><b>Master image failed to load:</b> ${FP_HIGHLIGHT_LAST_ERROR.slice(0,140)}<br><span style="color:#7f1d1d;">Check that <code style="background:#fff;border:1px solid #fecaca;padding:0 3px;">${masterUrl}</code> is publicly accessible on Cloudinary.</span></div>`
      : '';
    el.innerHTML = `<span style="display:inline-block;padding:1px 7px;background:#FF6600;color:#fff;border-radius:99px;font-size:9.5px;font-weight:700;">✓ HIGHLIGHT MODE</span> ${n} rooms${lvl} loaded · master from <code style="background:#f5f5f5;border:1px solid var(--bd);border-radius:3px;padding:0 4px;font-family:monospace;font-size:9.5px;">${masterUrl}</code>${errLine}`;
  } else if(FP_DATA_STATUS === 'error'){
    el.innerHTML = `<span style="color:var(--xlt);">No polygon JSON at <code style="background:#f5f5f5;border:1px solid var(--bd);border-radius:3px;padding:0 4px;font-family:monospace;font-size:9.5px;">${shortUrl}</code> &middot; using legacy image-collage mode.</span>`;
  } else {
    el.innerHTML = `Room images are PNG: <code style="background:#f5f5f5;border:1px solid var(--bd);border-radius:3px;padding:0 4px;font-family:monospace;font-size:9.5px;">{base}{room#}.png</code> &middot; paste the data.json URL above to enable highlight mode`;
  }
}

// Manual highlight management (room # input in Pricing tab)
function fpHighlightAdd(roomVal){
  if(!FP_MASTER_DATA) return false;
  const room = fpFindRoom(roomVal);
  if(!room) return false;
  FP_HIGHLIGHTS_MANUAL.add(room.displayLabel);
  ensureHighlightRender();
  renderPrFpChips();
  gen();
  return true;
}
function fpHighlightRemove(displayLabel){
  FP_HIGHLIGHTS_MANUAL.delete(displayLabel);
  // displayLabel is typically the same as the user-facing room # used
  // when auto-adding; clear it from the auto set so re-adding later
  // tracks correctly.
  _AUS_FP_AUTO_ADDED.delete(displayLabel);
  ensureHighlightRender();
  renderPrFpChips();
  gen();
}

function setFpPage2Same(same){
  FP_PAGE2_SAME=same;
  document.getElementById('fp-p2-same')?.classList.toggle('on',same);
  document.getElementById('fp-p2-diff')?.classList.toggle('on',!same);
  // When switching to "Page 2 different" while in highlight mode, set up the
  // sensible pairing: page 1 = individual room close-ups, page 2 = master
  // with highlights overlaid. (In "Both pages same" mode both pages just
  // show the master+highlights.)
  if(!same && FP_MASTER_DATA){
    FP_PAGE1_IDX = -2; // rooms-only collage
    FP_PAGE2_IDX = 0;  // master (with highlights baked in)
  }
  renderFpList();gen();
}

function addFpPlan(){
  FP_PLANS.push({url:'',label:FP_PLANS.length===0?'master':''});
  applyFpSmartDefaults();
  renderFpList();
}

function delFpPlan(i){
  // Clean up the auto-tracked set — same logic as fpHighlightRemove
  const removed = FP_PLANS[i];
  if(removed && removed.label){
    const r = _fpRoomSlug(String(removed.label));
    if(r) _AUS_FP_AUTO_ADDED.delete(r);
  }
  FP_PLANS.splice(i,1);
  if(FP_PAGE1_IDX>=FP_PLANS.length) FP_PAGE1_IDX=-1;
  if(FP_PAGE2_IDX>=FP_PLANS.length) FP_PAGE2_IDX=0;
  S.floorplan=FP_PLANS.length>0?FP_PLANS[0].url:null;
  applyFpSmartDefaults();
  renderFpList();gen();
}

// Smart defaults: when 2+ plans → page2 different, p1=collage(-1), p2=master(0)
// When 1 plan → both same
function applyFpSmartDefaults(){
  // In highlight mode, FP_PLANS only carries the auto-Master entry; the
  // "Both pages same" / "Page 2 different" choice is user-driven via the
  // toggle, and page contents come from FP_MASTER_DATA (not FP_PLANS).
  // Skip the legacy index-rewriting so the toggle isn't fought back.
  if(FP_MASTER_DATA) return;
  if(FP_PLANS.length>=2){
    if(FP_PAGE2_SAME){
      // Auto-switch to page2 different with smart assignment
      FP_PAGE2_SAME=false;
      FP_PAGE1_IDX=-2; // rooms-only collage on page 1 (excludes master)
      FP_PAGE2_IDX=0;  // master on page 2
      document.getElementById('fp-p2-same')?.classList.remove('on');
      document.getElementById('fp-p2-diff')?.classList.add('on');
    }
  } else {
    // Back to both same when only 1 plan
    if(!FP_PAGE2_SAME){
      FP_PAGE2_SAME=true;
      FP_PAGE1_IDX=-1;
      FP_PAGE2_IDX=-1;
      document.getElementById('fp-p2-same')?.classList.add('on');
      document.getElementById('fp-p2-diff')?.classList.remove('on');
    }
  }
}

function updateFpUrl(i){
  const roomInp=document.getElementById('fp-room-'+i);
  const urlInp=document.getElementById('fp-url-'+i);
  if(!roomInp||!urlInp) return;
  const room=roomInp.value.trim();
  if(room){
    // Base URL ends with the separator e.g. "…/floorplan_lg1-24-"
    // Fall back to deriving from plan 0's URL if base not set
    let base=FP_BASE_URL;
    if(!base&&FP_PLANS[0]?.url){
      const m=FP_PLANS[0].url.match(/^(.+[-_])[^-_]+\.(jpg|jpeg|png)$/i);
      base=m?m[1]:'';
    }
    if(base){
      FP_PLANS[i].url=base+(room.toLowerCase()==='master'?room:_fpRoomSlug(room))+'.png';
      FP_PLANS[i].label=room;
      urlInp.value=FP_PLANS[i].url;
    }
  } else {
    FP_PLANS[i].url=urlInp.value.trim();
    const fname=FP_PLANS[i].url.split('/').pop().replace(/\.(jpg|jpeg|png)$/i,'');
    FP_PLANS[i].label=fname||FP_PLANS[i].label;
  }
  if(i===0) S.floorplan=FP_PLANS[0].url||null;
  // If this plan just got a URL and we now have 2+ populated plans, apply smart defaults
  const populated=FP_PLANS.filter(p=>p.url).length;
  if(populated>=2) applyFpSmartDefaults();
  // Don't call renderFpList here — it destroys focus on Tab
  // Only update the thumbnail preview inline
  const thumb=document.querySelector(`#fp-list .fp-thumb-${i}`);
  if(thumb&&FP_PLANS[i].url) thumb.src=FP_PLANS[i].url;
  gen();
}

function updateFpUrlDirect(i){
  const urlInp=document.getElementById('fp-url-'+i);
  const roomInp=document.getElementById('fp-room-'+i);
  if(!urlInp) return;
  const url=urlInp.value.trim();
  FP_PLANS[i].url=url;
  if(!url){if(i===0)S.floorplan=null;gen();return;}
  // Detect base: split at the last - or _ before the filename
  // Matches: …/floorplan_lg1-24-master.png → base=…/floorplan_lg1-24-  room=master
  //          …/LG1-1234.png                → base=…/LG1-               room=1234
  //          …/floorplan-2412.png          → base=…/floorplan-          room=2412
  // (also accepts legacy .jpg / .jpeg for backwards compat)
  const baseMatch=url.match(/^(.+[-_])([^-_/]+)\.(jpg|jpeg|png)$/i);
  if(baseMatch){
    const base=baseMatch[1];
    const room=baseMatch[2];
    FP_PLANS[i].label=room.toLowerCase()==='master'?'Master':room;
    if(roomInp) roomInp.value=room;
    if(!FP_BASE_URL||i===0){
      FP_BASE_URL=base;
      const bInp=document.getElementById('fp-base-url');
      if(bInp) bInp.value=FP_BASE_URL;
      // Trigger polygon data auto-fetch when base url changes
      tryFetchFpData();
    }
  } else {
    FP_PLANS[i].label=url.split('/').pop().replace(/\.(jpg|jpeg|png)$/i,'')||('Plan '+(i+1));
    if(roomInp) roomInp.value='';
  }
  if(i===0) S.floorplan=FP_PLANS[0].url||null;
  // Don't call renderFpList — only update thumbnail inline to preserve focus
  const thumb=document.querySelector(`#fp-list .fp-thumb-${i}`);
  if(thumb&&url) thumb.src=url;
  gen();
}

function onFpUpload(i,e){
  const file=e.target.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=ev=>{
    if(!FP_PLANS[i]) return;
    FP_PLANS[i].url=ev.target.result;
    FP_PLANS[i].label=file.name.replace(/\.[^.]+$/,'')||('Plan '+(i+1));
    if(i===0) S.floorplan=ev.target.result;
    // Clear room input since this is an uploaded file, not a URL
    const roomInp=document.getElementById('fp-room-'+i);
    const urlInp=document.getElementById('fp-url-'+i);
    if(roomInp) roomInp.value='';
    if(urlInp) urlInp.value='';
    renderFpList();gen();
  };
  reader.readAsDataURL(file);
  e.target.value=''; // allow re-uploading same file
}

function renderFpList(){
  const list=document.getElementById('fp-list');if(!list)return;
  const bInp=document.getElementById('fp-base-url');
  if(bInp&&FP_BASE_URL) bInp.value=FP_BASE_URL;
  renderPrFpChips(); // keep pricing tab chips in sync

  // ── Plan cards ────────────────────────────────────────────
  list.innerHTML=FP_PLANS.map((fp,i)=>`
    <div style="border:1.5px solid var(--bd);border-radius:8px;padding:8px 10px;background:var(--wh);">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
        ${fp.url?`<img src="${fp.url}" class="fp-thumb-${i}" style="width:36px;height:28px;object-fit:contain;border-radius:4px;border:1px solid var(--bd);background:#f5f5f5;flex-shrink:0;">`
          :`<div class="fp-thumb-${i}" style="width:36px;height:28px;border-radius:4px;border:1px solid var(--bd);background:#f0f0f0;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/></svg></div>`}
        <span style="font-size:11px;font-weight:700;color:var(--o);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${i===0?'Master':fp.label||'Plan '+(i+1)}</span>
        <button onclick="delFpPlan(${i})" style="width:20px;height:20px;border:none;background:transparent;color:var(--xlt);cursor:pointer;display:flex;align-items:center;justify-content:center;border-radius:4px;flex-shrink:0;" onmouseover="this.style.color='#dc2626'" onmouseout="this.style.color='var(--xlt)'">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div style="display:flex;gap:5px;margin-bottom:5px;align-items:center;">
        <span style="font-size:10px;color:var(--xlt);white-space:nowrap;font-weight:600;">Room #</span>
        <input id="fp-room-${i}" type="text" value="${fp.label==='Master'?'master':(fp.label||'')}"
          placeholder="${i===0?'master':'e.g. 2412'}"
          style="width:90px;flex-shrink:0;border:1px solid var(--bd);border-radius:5px;padding:3px 7px;font-size:12px;font-family:inherit;outline:none;"
          oninput="updateFpUrl(${i})"
          oninput="updateFpUrl(${i})"
          onfocus="this.style.borderColor='var(--o)'" onblur="renderFpList();">
        <input type="file" id="fp-up-${i}" accept="image/*" style="display:none" onchange="onFpUpload(${i},event)">
        <label for="fp-up-${i}" class="mc-upload-btn" style="font-size:10px;padding:3px 7px;cursor:pointer;flex-shrink:0;">↑ Upload</label>
      </div>
      <input id="fp-url-${i}" type="url" value="${fp.url&&!fp.url.startsWith('data:')?fp.url:''}"
        placeholder="https://…/floorplan.png"
        style="width:100%;box-sizing:border-box;border:1px solid var(--bd);border-radius:5px;padding:3px 8px;font-size:11px;font-family:inherit;outline:none;"
        oninput="updateFpUrlDirect(${i})"
        onchange="updateFpUrlDirect(${i})"
        onfocus="this.style.borderColor='var(--o)'" onblur="this.style.borderColor='var(--bd)'">
  `).join('');

  // ── Page assignment selector — always visible when plans exist ──────────
  const sel=document.getElementById('fp-page-sel');
  if(sel){
    if(FP_PLANS.length>0){
      const collageIcon=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:1px;width:100%;height:100%;background:#e8e8e8;border-radius:2px;overflow:hidden;">${FP_PLANS.slice(0,4).map(p=>`<div style="background:#fff;display:flex;align-items:center;justify-content:center;overflow:hidden;">${p.url?`<img src="${p.url}" style="width:100%;height:100%;object-fit:contain;">`:''}</div>`).join('')}</div>`;
      const roomsIcon=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:1px;width:100%;height:100%;background:#e8e8e8;border-radius:2px;overflow:hidden;">${FP_PLANS.slice(1,5).map(p=>`<div style="background:#fff;display:flex;align-items:center;justify-content:center;overflow:hidden;">${p.url?`<img src="${p.url}" style="width:100%;height:100%;object-fit:contain;">`:''}</div>`).join('')}</div>`;
      const makeThumb=(label,planIdx,current,fn)=>{
        const active=current===planIdx;
        const isRooms=planIdx===-2;
        const isAll=planIdx===-1;
        const fp=(!isAll&&!isRooms)?FP_PLANS[planIdx]:null;
        const thumb=isRooms?roomsIcon:isAll?collageIcon
          :(fp?.url?`<img src="${fp.url}" style="width:100%;height:100%;object-fit:contain;display:block;">`
          :`<div style="width:100%;height:100%;background:#f0f0f0;display:flex;align-items:center;justify-content:center;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/></svg></div>`);
        return`<div onclick="${fn}(${planIdx})" style="cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;flex-shrink:0;">
          <div style="width:52px;height:38px;border-radius:5px;border:2px solid ${active?'var(--o)':'var(--bd)'};overflow:hidden;background:#fff;position:relative;transition:border-color .15s;">
            ${thumb}
            ${active?`<div style="position:absolute;bottom:2px;right:2px;width:12px;height:12px;border-radius:50%;background:var(--o);display:flex;align-items:center;justify-content:center;"><svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5"><polyline points="20 6 9 17 4 12"/></svg></div>`:''}
          </div>
          <span style="font-size:9.5px;font-weight:${active?'700':'500'};color:${active?'var(--o)':'var(--xlt)'};max-width:52px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:center;">${label}</span>
        </div>`;
      };
      const thumbRow=(label,current,fn)=>`
        <div style="margin-bottom:8px;">
          <div style="font-size:9.5px;font-weight:700;color:var(--xlt);text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px;">${label}</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            ${makeThumb('Rooms',-2,current,fn)}
            ${makeThumb('All',-1,current,fn)}
            ${FP_PLANS.map((fp,pi)=>makeThumb(pi===0?'Master':(fp.label||'Plan '+(pi+1)),pi,current,fn)).join('')}
          </div>
        </div>`;
      sel.style.display='';
      sel.innerHTML=thumbRow('PAGE 1 SHOWS',FP_PAGE1_IDX,'setFpP1')+thumbRow('PAGE 2 SHOWS',FP_PAGE2_IDX,'setFpP2');
    } else {
      sel.style.display='none';
    }
  }
}
function rmPartnerLogo(){S.partnerLogo=null;renderLogoCard();gen();}
function onPartnerLogo(e){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{S.partnerLogo=ev.target.result;renderLogoCard();gen();};r.readAsDataURL(f);}
function showStatus(m,t){document.getElementById('fetch-status').innerHTML=`<div class="smsg ${t}">${m}</div>`;}

// ══════════════════════════════════════════════════════════
//  JSON LOCATION LIBRARY
// ══════════════════════════════════════════════════════════
const LIB_KEY='co_location_library';
let _libGroupCollapsed={server:false,local:false}; // track collapsed groups
function getLib(){try{return JSON.parse(localStorage.getItem(LIB_KEY)||'[]');}catch{return[];}}
function saveLib(lib){localStorage.setItem(LIB_KEY,JSON.stringify(lib));}
