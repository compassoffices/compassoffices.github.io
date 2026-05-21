// Compass Offices One-Pager Builder
// https://github.com/compassoffices/compassoffices.github.io

// ── LOADED CARD PANEL ─────────────────────────────────────
function updateLoadedCardPanel(p){
  const panel = document.getElementById('loaded-card-panel');
  if(!panel) return;
  const r = v => (v && typeof v==='object' && !Array.isArray(v)) ? (v[LANG]||v.en||Object.values(v)[0]||'') : (v||'');
  const name = r(p.name);
  const city = r(p.city);
  const floor = r(p.floor);
  const addr = r(p.address);

  document.getElementById('loaded-card-name').textContent = name;

  const meta = document.getElementById('loaded-card-meta');
  const parts = [city, floor].filter(Boolean);
  meta.innerHTML = parts.map(t=>`<span style="background:var(--bg);border:1px solid var(--bd);border-radius:20px;padding:2px 8px;font-size:10px;font-weight:600;color:var(--mid)">${t}</span>`).join('') +
    (addr ? `<span style="color:var(--xlt);font-size:10px">${addr}</span>` : '');

  // Mini spec pills
  const sp = p.specs||{};
  const specList = [
    sp.structure||p.structure, sp.completion||p.completion,
    sp.floor_area||p.floor_area, sp.ceiling||p.ceiling,
  ].map(v=>r(v)).filter(Boolean).slice(0,4);
  document.getElementById('loaded-card-specs').innerHTML = specList.map(s=>
    `<span style="background:#F7F7F7;border:1px solid #ECECEC;border-radius:4px;padding:2px 7px;font-size:10px;color:var(--mid)">${s}</span>`
  ).join('');

  // Update label per language
  const labels = {en:'Loaded',  'zh-hant':'已載入', 'zh-hans':'已加载', ja:'読込済'};
  const lbl = panel.querySelector('[data-i18n-loaded-label]');
  if(lbl) lbl.textContent = labels[LANG]||'Loaded';

  panel.style.display = 'block';
}

function clearLoadedCard(){
  LAST_LOCATION = null;
  const panel = document.getElementById('loaded-card-panel');
  if(panel) panel.style.display = 'none';
  document.getElementById('json-search').value = '';
  // Reset all fields
  ['n-main','addr','floor','city','purl','custom-title','matterport'].forEach(id=>{
    const el=document.getElementById(id);if(el)el.value='';
  });
  [...document.querySelectorAll('.spec-rich-editor')].forEach(el=>el.innerHTML='');
  const cbe=document.getElementById('custom-body-editor');if(cbe)cbe.innerHTML='';
  S.rows=[];S.photos=[null,null,null];S.floorplan=null;S.partnerLogo=null;
  TRANSPORT=[];
  renderRows();renderPhotoSlots();renderFloorplanCard();renderLogoCard();renderTransport();
  showStatus('Card cleared.','s-info');
  gen();
}

// ══════════════════════════════════════════════════════════
//  DOWNLOAD JPG — html2canvas, pixel-perfect, no browser chrome
//  Saves 2 files: name-p1.jpg + name-p2.jpg
// ══════════════════════════════════════════════════════════

// Convert an external URL → data URL via fetch (avoids tainted canvas)
// ══════════════════════════════════════════════════════════
//  DOWNLOAD JPG — pixel-perfect, handles CORS images
// ══════════════════════════════════════════════════════════

// Fetch a URL and return a data URL. Returns null if impossible.
async function urlToDataURL(src){
  if(!src||src.startsWith('data:')||src.startsWith('blob:')) return src;
  // 1. Try fetch with CORS
  try{
    const r=await fetch(src,{mode:'cors',credentials:'omit'});
    if(!r.ok) throw new Error('status '+r.status);
    const blob=await r.blob();
    return await new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>res(fr.result);fr.onerror=rej;fr.readAsDataURL(blob);});
  }catch(e1){
    // 2. Try no-cors fetch → opaque blob (works for images that allow embedding)
    try{
      const r=await fetch(src,{mode:'no-cors',credentials:'omit'});
      const blob=await r.blob();
      if(blob.size===0) throw new Error('empty blob');
      return await new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>res(fr.result);fr.onerror=rej;fr.readAsDataURL(blob);});
    }catch(e2){
      // 3. Try Image with crossOrigin (works if server sends CORS headers)
      try{
        return await new Promise((res,rej)=>{
          const img=new Image();img.crossOrigin='anonymous';
          img.onload=()=>{try{const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;c.getContext('2d').drawImage(img,0,0);res(c.toDataURL('image/png'));}catch(e){rej(e);}};
          img.onerror=rej;img.src=src+(src.includes('?')?'&':'?')+'_t='+Date.now();
        });
      }catch(e3){
        return null; // truly blocked
      }
    }
  }
}

// Fetch SVG URL and return inline SVG text string. Returns null on failure.
async function fetchSVGInline(src){
  try{
    const r=await fetch(src,{mode:'cors',credentials:'omit'});
    if(!r.ok) throw new Error();
    const text=await r.text();
    if(text.trim().startsWith('<svg')||text.includes('<svg')) return text.trim();
    return null;
  }catch(e){ return null; }
}

// ── EXPORT FILENAME HELPER ────────────────────────────────
// Prefers EN name regardless of current language, falls back to current
// ══════════════════════════════════════════════════════════
//  PDF QUEUE — combine multiple locations into one PDF
// ══════════════════════════════════════════════════════════
let PDF_QUEUE = []; // [{name, thumb, cv1DataUrl, cv2DataUrl, state}]

// Capture full current app state so queue items can be re-edited
function buildStateSnapshot(){
  saveLangData(LANG); // ensure current lang is flushed
  const langs_snap = {};
  LANG_KEYS.forEach(lc=>{
    const ld=LANG_DATA[lc];if(!ld)return;
    langs_snap[lc]={
      fields:{...ld.fields},
      richFields:{...ld.richFields},
      customBody:ld.customBody||'',
      transport:ld.transport.map(t=>({...t})),
      rows:JSON.parse(JSON.stringify(S.rows)),          // S.rows is global — same for all langs
      benefits:ld.benefits.map(b=>({...b})),
      amenities:[...ld.amenities],
      benPos:ld.benPos,customPos:ld.customPos,
      benefits_title:BENEFITS_TITLE[lc]||'',
      deposit_note:DEPOSIT_NOTE[lc]||'',
    };
  });
  return {
    langs:langs_snap,
    benefits_pos:BENEFITS_POS,custom_pos:CUSTOM_POS,
    show_specs:SHOW_SPECS,hidden_specs:[...HIDDEN_SPECS],
    logo_separator:LOGO_SEP,
    pricing_cols:PRICING_COLS.map(col=>({key:col.key,on:col.on,custom:!!col.custom,labels:{...col.labels}})),
    amenities:AMENITY_ICONS.map(a=>a.on),
    benefits_on:BENEFITS.filter(b=>b.on).map(b=>b.id),
    photos:S.photos.map(p=>p&&!p.startsWith('data:')?p:(p?'__local__':null)),
    photos_data:S.photos.map(p=>p&&p.startsWith('data:')?p:null),
    floorplan_url:S.floorplan&&!S.floorplan.startsWith('data:')?S.floorplan:'',
    floorplan_data:S.floorplan&&S.floorplan.startsWith('data:')?S.floorplan:null,
    partner_logo_url:S.partnerLogo&&!S.partnerLogo.startsWith('data:')?S.partnerLogo:'',
    icon_overrides:window.ICON_OVERRIDES?{...window.ICON_OVERRIDES}:{},
    fp_plans:FP_PLANS.map(p=>({url:p.url,label:p.label})),
    fp_page2_same:FP_PAGE2_SAME,fp_page1_idx:FP_PAGE1_IDX,fp_page2_idx:FP_PAGE2_IDX,fp_base_url:FP_BASE_URL,fp_data_url:FP_DATA_URL,fp_highlights_manual:Array.from(FP_HIGHLIGHTS_MANUAL),
    office_lookup_region:AX_REGION,office_lookup_centre:AUS_CENTRE_FILTER,aus_selected:Array.from(AUS_SELECTED),aus_fp_auto_added:Array.from(_AUS_FP_AUTO_ADDED),
    deposit_note_on:DEPOSIT_NOTE_ON,base_discount_on:BASE_DISCOUNT_ON,base_discount:AUS_DISCOUNT,fp_use_3d:FP_USE_3D,fp_use_local:FP_USE_LOCAL,fp_p2_custom_url:FP_P2_CUSTOM_URL||null,fp_annotations:JSON.parse(JSON.stringify(FP_ANNOTATIONS)),compass_on:COMPASS_ON,compass_angle:COMPASS_ANGLE,client_name:CLIENT_NAME||'',company_name:COMPANY_NAME||'',
    benefits_title:{...BENEFITS_TITLE},
    deposit_note:{...DEPOSIT_NOTE},
    _lang:LANG,
  };
}

function restoreStateSnapshot(state){
  if(!state) return;

  // ── 1. Restore per-lang LANG_DATA directly (snapshot uses LANG_DATA format) ──
  if(state.langs){
    LANG_KEYS.forEach(lc=>{
      const ld=state.langs[lc];
      if(!ld) return;
      LANG_DATA[lc]={
        fields:     {...(ld.fields||{})},
        richFields: {...(ld.richFields||{})},
        customBody: ld.customBody||'',
        transport:  (ld.transport||[]).map(t=>({id:_trId(),iconId:t.iconId||'tr_metro',text:t.text||''})),
        rows:       JSON.parse(JSON.stringify(ld.rows||[])),
        benefits:   (ld.benefits||[]).map(b=>({...b})),
        amenities:  [...(ld.amenities||AMENITY_ICONS.map(()=>true))],
        benPos:     ld.benPos||'auto',
        customPos:  ld.customPos||'below',
      };
      BENEFITS_TITLE[lc]=ld.benefits_title||'';
      DEPOSIT_NOTE[lc]  =ld.deposit_note  ||'';
    });
  }

  // S.rows is global (not per-lang) but is stored in each lang's snapshot for
  // convenience. loadLangData() intentionally skips restoring it, so we must
  // restore S.rows here explicitly before renderRows() is called below.
  const _rSnap = state.langs && (state.langs[LANG] || state.langs['en'] || state.langs[Object.keys(state.langs)[0]]);
  if(_rSnap?.rows) S.rows = JSON.parse(JSON.stringify(_rSnap.rows));

  // ── 2. Restore global layout/display state ─────────────────────────────────
  if(state.benefits_pos)       setBenPos(state.benefits_pos);
  if(state.custom_pos)         setCustomPos(state.custom_pos);
  if(state.show_specs===false) { SHOW_SPECS=false; } else { SHOW_SPECS=true; }
  if(state.hidden_specs)       { HIDDEN_SPECS.clear(); state.hidden_specs.forEach(id=>HIDDEN_SPECS.add(id)); }
  if(state.logo_separator)     setSep(state.logo_separator);
  if(state.icon_overrides)     { window.ICON_OVERRIDES={...state.icon_overrides}; }

  // ── 3. Restore pricing columns ─────────────────────────────────────────────
  if(state.pricing_cols){
    // Drop any current custom columns first
    PRICING_COLS = PRICING_COLS.filter(c => !c.custom);
    state.pricing_cols.forEach(sc=>{
      const col=PRICING_COLS.find(c=>c.key===sc.key);
      if(col){
        col.on = sc.on;
        col.labels = {...sc.labels};
      } else if(sc.custom || !PRICING_COLS_BUILTIN.includes(sc.key)){
        PRICING_COLS.push({
          key: sc.key,
          on: sc.on!==false,
          custom: true,
          labels: {'en':'','zh-hant':'','zh-hans':'','ja':'', ...(sc.labels||{})},
        });
      }
    });
  }

  // ── 4. Restore amenity icons ───────────────────────────────────────────────
  if(state.amenities) AMENITY_ICONS.forEach((a,i)=>{ a.on=state.amenities[i]??true; });

  // ── 5. Restore benefits on/off ─────────────────────────────────────────────
  if(state.benefits_on) BENEFITS.forEach(b=>{ b.on=state.benefits_on.includes(b.id); });

  // ── 6. Restore photos ─────────────────────────────────────────────────────
  if(state.photos) state.photos.forEach((u,i)=>{
    S.photos[i]=(u&&u!=='__local__')?u:null;
  });
  if(state.photos_data) state.photos_data.forEach((d,i)=>{ if(d) S.photos[i]=d; });

  // ── 7. Restore partner logo ────────────────────────────────────────────────
  S.partnerLogo=state.partner_logo_url||null;

  // ── 8. Restore floorplan ───────────────────────────────────────────────────
  if(state.fp_plans&&state.fp_plans.length){
    FP_PLANS=state.fp_plans.map(p=>({url:p.url,label:p.label}));
    FP_PAGE2_SAME=state.fp_page2_same!==false;
    FP_PAGE1_IDX=state.fp_page1_idx!==undefined?state.fp_page1_idx:-2;
    FP_PAGE2_IDX=state.fp_page2_idx!==undefined?state.fp_page2_idx:0;
    FP_BASE_URL=state.fp_base_url||'';
    FP_DATA_URL=state.fp_data_url||'';
    S.floorplan=FP_PLANS[0]?.url||null;
  } else if(state.floorplan_url){
    S.floorplan=state.floorplan_url;
    FP_PLANS=[{url:state.floorplan_url,label:'master'}];
    FP_BASE_URL=state.floorplan_url.replace(/[^/]+\.(jpg|jpeg|png)$/i,'');
  }
  if(state.floorplan_data){
    S.floorplan=state.floorplan_data;
    if(FP_PLANS.length) FP_PLANS[0].url=state.floorplan_data;
    else FP_PLANS=[{url:state.floorplan_data,label:'Master'}];
  }

  // ── 9. Load current lang into DOM and re-render everything ─────────────────
  const bTitleInp=document.getElementById('benefits-title-input');
  if(bTitleInp) bTitleInp.value=BENEFITS_TITLE[LANG]||'';
  if(state.deposit_note && typeof state.deposit_note === 'object') Object.assign(DEPOSIT_NOTE,state.deposit_note);
  syncDepositNoteInput();
  // Restore the on/off toggles + discount value
  if(typeof state.deposit_note_on === 'boolean'){
    DEPOSIT_NOTE_ON = state.deposit_note_on;
    const btn = document.getElementById('deposit-note-toggle');
    if(btn) btn.classList.toggle('on', DEPOSIT_NOTE_ON);
    const inp = document.getElementById('deposit-note-input');
    if(inp){ inp.style.opacity = DEPOSIT_NOTE_ON ? '1' : '.4'; inp.disabled = !DEPOSIT_NOTE_ON; }
  }
  if(typeof state.base_discount_on === 'boolean'){
    BASE_DISCOUNT_ON = state.base_discount_on;
    const btn = document.getElementById('base-discount-toggle');
    if(btn) btn.classList.toggle('on', BASE_DISCOUNT_ON);
    const inp = document.getElementById('aus-discount');
    if(inp){ inp.style.opacity = BASE_DISCOUNT_ON ? '1' : '.4'; inp.disabled = !BASE_DISCOUNT_ON; }
  }
  if(typeof state.base_discount === 'number'){
    AUS_DISCOUNT = state.base_discount;
    const inp = document.getElementById('aus-discount');
    if(inp) inp.value = AUS_DISCOUNT;
  }
  // Restore 2D/3D floor-plan choice (probe re-runs when master loads)
  if(typeof state.fp_use_3d === 'boolean') FP_USE_3D = state.fp_use_3d;
  if(typeof state.fp_use_local === 'boolean') FP_USE_LOCAL = state.fp_use_local;
  if(state.fp_p2_custom_url !== undefined){ FP_P2_CUSTOM_URL = state.fp_p2_custom_url||null; if(typeof renderFpP2Slot==='function') renderFpP2Slot(); }
  if(state.fp_annotations) FP_ANNOTATIONS = state.fp_annotations;
  if(typeof state.compass_on === 'boolean'){ COMPASS_ON = state.compass_on; }
  if(typeof state.compass_angle === 'number'){ COMPASS_ANGLE = Math.round(((state.compass_angle%360)+360)%360); }
  if(typeof _renderCompassControl === 'function') _renderCompassControl();
  if(typeof state.client_name === 'string'){
    CLIENT_NAME = state.client_name;
    const el = document.getElementById('client-name'); if(el) el.value = CLIENT_NAME;
    if(typeof _stripUpdatePreview==='function') _stripUpdatePreview();
  }
  if(typeof state.company_name === 'string'){
    COMPANY_NAME = state.company_name;
    const el = document.getElementById('company-name'); if(el) el.value = COMPANY_NAME;
  }
  // Restore manual highlight set + refetch polygon data
  FP_HIGHLIGHTS_MANUAL = new Set(Array.isArray(state.fp_highlights_manual) ? state.fp_highlights_manual : []);
  // Restore auto-added FP rooms set so uncheck-to-remove sync works after
  // queue re-edit. _AUS_FP_AUTO_ADDED is const so clear + repopulate.
  _AUS_FP_AUTO_ADDED.clear();
  if(Array.isArray(state.aus_fp_auto_added)){
    state.aus_fp_auto_added.forEach(r => _AUS_FP_AUTO_ADDED.add(r));
  }
  // ── Restore Office Lookup region + centre filter + selection ──
  // AUS_SELECTED holds the office IDs whose pricing rows are on the slide.
  // It must travel with the snapshot so a re-edit shows the same checkboxes
  // ticked. Capture the saved IDs into a local now — they get applied
  // EITHER after the new region's CSV fetches (different-region branch)
  // OR synchronously when the region is already loaded (same-region branch).
  const _savedSel = Array.isArray(state.aus_selected) ? state.aus_selected : [];
  if(state.office_lookup_region){
    if(AX_REGIONS_LOADED && AX_REGIONS[state.office_lookup_region] && state.office_lookup_region !== AX_REGION){
      setAxRegion(state.office_lookup_region, /*skipReset=*/true, /*skipPreset=*/true).then(()=>{
        AUS_CENTRE_FILTER = state.office_lookup_centre || '';
        AUS_SELECTED = new Set(_savedSel);
        renderCentreChips();
        renderAusLookup();
      });
    } else {
      AX_REGION = state.office_lookup_region;
      AUS_CENTRE_FILTER = state.office_lookup_centre || '';
      AUS_SELECTED = new Set(_savedSel);
      renderRegionChips();
      renderCentreChips();
      // Missing before — same-region path never re-rendered the office
      // table, so the previously-checked boxes from another proposal could
      // stay visible. Now the table always re-renders against AUS_SELECTED.
      renderAusLookup();
    }
  } else {
    // No region in snapshot — clear any stale selection from the prior card.
    AUS_SELECTED.clear();
    renderAusLookup();
  }
  FP_MASTER_DATA = null;
  FP_HAS_3D = false; // FP_USE_3D persists from the restore above (line ~5488)
  if(typeof _renderFp3DToggle === 'function') _renderFp3DToggle();
  FP_HIGHLIGHT_RENDER_URL = null;
  FP_HIGHLIGHT_LAST_KEY = null;
  FP_DATA_LAST_FETCHED_BASE = '';
  // Sync the inputs to current values
  const _bInp=document.getElementById('fp-base-url');if(_bInp)_bInp.value=FP_BASE_URL;
  const _dInp=document.getElementById('fp-data-url');if(_dInp)_dInp.value=FP_DATA_URL;
  if(fpEffectiveDataUrl()) tryFetchFpData(true, true); else updateFpDataStatusUI();
  loadLangData(LANG);
  renderPhotoSlots();
  renderLogoCard();
  renderFpList();
  setFpPage2Same(FP_PAGE2_SAME);
  renderPricingColSettings();
  renderRows();
  renderAmenities();
  gen();
}

function toggleQueuePanel(){
  const panel=document.getElementById('queue-panel');
  if(!panel) return;
  const visible=panel.style.display==='flex';
  panel.style.display=visible?'none':'flex';
  // Rotate the chevron via the wrapper's panel-open class (CSS handles it)
  document.getElementById('queue-split')?.classList.toggle('panel-open', !visible);
}

function updateQueueBadge(){
  const badge=document.getElementById('queue-count');
  const split=document.getElementById('queue-split');
  if(!badge||!split) return;
  const n=PDF_QUEUE.length;
  badge.textContent=n;
  badge.style.display=n>0?'block':'none';
  // Toggle the active state on the wrapper — CSS handles colour, border,
  // background, and the orange divider between the two halves.
  split.classList.toggle('has-items', n>0);
}

function _queueItemMeta(st){
  if(!st) return '';
  const floor = (st.langs&&(st.langs.en||st.langs['zh-hant']))?.fields?.floor||'';
  const sel = (st.aus_selected||[]).length;
  const rows = (st.langs&&st.langs.en&&st.langs.en.rows||[]).length;
  const dot = '<span style="color:#ddd;font-size:9px;margin:0 1px;">·</span>';
  const parts = [];
  if(floor) parts.push('<span style="padding:1px 6px;background:var(--o);color:#fff;border-radius:10px;font-size:9.5px;font-weight:800;">'+floor+'</span>');
  if(sel)   parts.push('<span style="font-size:9.5px;color:var(--xlt);">'+sel+' office'+(sel!==1?'s':'')+'</span>');
  if(rows)  parts.push('<span style="font-size:9.5px;color:var(--xlt);">'+rows+' row'+(rows!==1?'s':'')+'</span>');
  return parts.join(dot);
}
function renderQueueList(){
  const list=document.getElementById('queue-list');
  const empty=document.getElementById('queue-empty');
  if(!list) return;
  if(!PDF_QUEUE.length){
    if(empty) empty.style.display='';
    list.innerHTML='';
    list.appendChild(empty||document.createElement('div'));
    return;
  }
  if(empty) empty.style.display='none';
  list.innerHTML=PDF_QUEUE.map((item,i)=>`
    <div style="display:flex;align-items:center;gap:8px;padding:6px 8px;background:var(--bg);border-radius:8px;border:1px solid var(--bd);">
      <img src="${item.thumb}" onclick="queueEditItem(${i})" title="Click to re-edit" style="width:72px;height:51px;object-fit:contain;border-radius:4px;background:#f0f0f0;flex-shrink:0;border:1.5px solid var(--bd);cursor:pointer;transition:border-color .15s;" onmouseover="this.style.borderColor='var(--o)'" onmouseout="this.style.borderColor='var(--bd)'">
      <div style="flex:1;min-width:0;">
        <div style="font-size:12px;font-weight:700;color:var(--drk);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${item.name}</div>
        <div style="display:flex;align-items:center;gap:4px;margin-top:2px;flex-wrap:wrap;">
          ${_queueItemMeta(item.state)}
        </div>
        <div style="display:flex;gap:4px;margin-top:4px;">
          <button onclick="queueEditItem(${i})" style="padding:2px 7px;font-size:10px;font-weight:600;font-family:inherit;border:1px solid var(--o);background:var(--olt);color:var(--o);border-radius:4px;cursor:pointer;">✎ Edit</button>
          <button onclick="queueUpdateItem(${i})" style="padding:2px 7px;font-size:10px;font-weight:600;font-family:inherit;border:1px solid var(--bd);background:var(--wh);color:var(--xlt);border-radius:4px;cursor:pointer;" title="Re-render with current slide state">↺ Update</button>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:4px;flex-shrink:0;">
        ${i>0?`<button onclick="queueMoveUp(${i})" style="width:20px;height:20px;border:1px solid var(--bd);border-radius:4px;background:var(--wh);cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--xlt);font-size:10px;" title="Move up">↑</button>`:'<div style="width:20px;height:20px;"></div>'}
        ${i<PDF_QUEUE.length-1?`<button onclick="queueMoveDown(${i})" style="width:20px;height:20px;border:1px solid var(--bd);border-radius:4px;background:var(--wh);cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--xlt);font-size:10px;" title="Move down">↓</button>`:'<div style="width:20px;height:20px;"></div>'}
      </div>
      <button onclick="removeFromQueue(${i})" style="width:22px;height:22px;border:none;background:transparent;color:var(--xlt);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;" onmouseover="this.style.color='#dc2626'" onmouseout="this.style.color='var(--xlt)'">×</button>
    </div>
  `).join('');
}

function queueMoveUp(i){if(i<=0)return;[PDF_QUEUE[i-1],PDF_QUEUE[i]]=[PDF_QUEUE[i],PDF_QUEUE[i-1]];renderQueueList();}
function queueMoveDown(i){if(i>=PDF_QUEUE.length-1)return;[PDF_QUEUE[i],PDF_QUEUE[i+1]]=[PDF_QUEUE[i+1],PDF_QUEUE[i]];renderQueueList();}
function removeFromQueue(i){PDF_QUEUE.splice(i,1);renderQueueList();updateQueueBadge();}
function clearQueue(){PDF_QUEUE=[];renderQueueList();updateQueueBadge();}

function restoreFromQueue(i){
  const item=PDF_QUEUE[i];if(!item?.state)return;
  restoreStateSnapshot(item.state);
  // Close panel and show status
  const panel=document.getElementById('queue-panel');
  if(panel) panel.style.display='none';
  showStatus(`Loaded "${item.name}" for editing. Re-add to queue when done.`,'s-ok');
}

// Load a queued item back into the editor for re-editing
function setQueueEditBar(show, idx){
  const bar=document.getElementById('queue-edit-bar');
  const lbl=document.getElementById('queue-edit-label');
  if(!bar) return;
  bar.style.display=show?'flex':'none';
  if(show&&idx>=0&&PDF_QUEUE[idx]){
    if(lbl) lbl.textContent=`Editing: ${PDF_QUEUE[idx].name}`;
  }
}

function queueEditItem(i){
  const item=PDF_QUEUE[i];if(!item||!item.state)return;
  const panel=document.getElementById('queue-panel');
  if(panel) panel.style.display='none';
  restoreStateSnapshot(item.state);
  PDF_QUEUE._editingIdx=i;
  setQueueEditBar(true,i);
  showStatus(`Editing "${item.name}" — make changes then click Update & Back.`,'s-ok');
}

async function queueUpdateCurrent(){
  const i=PDF_QUEUE._editingIdx;
  if(i===undefined||i===null||!PDF_QUEUE[i]) return;
  const btn=document.getElementById('queue-update-btn');
  const origHTML=btn?btn.innerHTML:'';
  if(btn){btn.innerHTML='<span style="display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .65s linear infinite;display:inline-block"></span>Updating…</span>';btn.disabled=true;}
  try{
    const item=PDF_QUEUE[i];
    const name=getExportName()||item.name;
    gen._captureMode=true;gen();gen._captureMode=false;
    // CRITICAL: wait for any in-flight highlight render to finish + all
    // <img> elements on both slides to load. Without this, capturing
    // immediately after a 2D→3D toggle freezes the stale 2D snapshot into
    // the queue — that's why a re-edited card kept printing as 2D in the
    // combined PDF even though the on-screen preview showed 3D.
    await _waitForCardReady();
    const cv1=await slideToCanvas('slide');
    const cv2=await slideToCanvas('slide2');
    PDF_QUEUE[i]={
      ...item,
      name,
      thumb:cv1?cv1.toDataURL('image/jpeg',0.5):item.thumb,
      cv1DataUrl:cv1?cv1.toDataURL('image/jpeg',0.92):item.cv1DataUrl,
      cv2DataUrl:cv2?cv2.toDataURL('image/jpeg',0.92):item.cv2DataUrl,
      state:buildStateSnapshot(),
    };
    PDF_QUEUE._editingIdx=null;
    setQueueEditBar(false,-1);
    renderQueueList();
    // Reopen queue panel
    const panel=document.getElementById('queue-panel');
    if(panel) panel.style.display='flex';
    showStatus(`"${name}" updated in queue.`,'s-ok');
    // Clear the form — consistent with the original + Queue flow.
    // State was already captured into PDF_QUEUE[i] above, so clearing
    // now is safe and leaves the user ready for the next proposal.
    _resetCardForNewProposal();
    gen();
  }catch(err){
    alert('Update failed: '+err.message);
  }finally{
    if(btn){btn.innerHTML=origHTML;btn.disabled=false;}
  }
}

function queueCancelEdit(){
  PDF_QUEUE._editingIdx=null;
  setQueueEditBar(false,-1);
  // Reopen the panel so user can see the queue
  const panel=document.getElementById('queue-panel');
  if(panel) panel.style.display='flex';
  // Clear the form — edits are discarded, user gets a clean slate
  // rather than being left holding the item they were just editing.
  _resetCardForNewProposal();
  gen();
  showStatus('Edit cancelled — form cleared for new proposal.','s-ok');
}

// Re-render and update an existing queue slot with current slide state
async function queueUpdateItem(i){
  const item=PDF_QUEUE[i];if(!item)return;
  const btn=document.querySelector(`[onclick="queueUpdateItem(${i})"]`);
  const origTxt=btn?btn.textContent:'';
  if(btn){btn.textContent='…';btn.disabled=true;}
  try{
    const name=getExportName()||item.name;
    gen._captureMode=true;gen();gen._captureMode=false;
    // Same wait-for-render gate as queueUpdateCurrent — see comment there.
    await _waitForCardReady();
    const cv1=await slideToCanvas('slide');
    const cv2=await slideToCanvas('slide2');
    PDF_QUEUE[i]={
      ...item,
      name,
      thumb:cv1?cv1.toDataURL('image/jpeg',0.5):item.thumb,
      cv1DataUrl:cv1?cv1.toDataURL('image/jpeg',0.92):item.cv1DataUrl,
      cv2DataUrl:cv2?cv2.toDataURL('image/jpeg',0.92):item.cv2DataUrl,
      state:buildStateSnapshot(),
    };
    renderQueueList();
    showStatus(`"${name}" updated in queue.`,'s-ok');
  }catch(err){
    alert('Update failed: '+err.message);
  }finally{
    if(btn){btn.textContent=origTxt;btn.disabled=false;}
  }
}

// ── New-proposal reset ──
// After + Queue succeeds (or when user wants to start over), wipe all
// per-card state so the form is blank for the next proposal. KEEPS the
// app-level context the user expects to carry across proposals:
//   • current UI language
//   • Office Lookup region + centre filter (workflow within same region)
//   • PDF_QUEUE (the items just saved)
//   • PRICING_COLS (region preset stays applied)
//   • AUS_DISCOUNT, DEPOSIT_NOTE_ON, BASE_DISCOUNT_ON (user settings)
//   • Library cards (LIB_CARDS) — those are user assets, not per-proposal
//
// CLEARS: form fields (all 4 langs), pricing rows, photos, partner logo,
// floor plan + room highlights, benefits list, transport lines, custom
// info block, deposit-note custom text, AUS selection, hidden specs,
// custom-block position. Resets amenity toggles to factory defaults.
// New Card button — prompts the user then resets the form.
// Separate from _resetCardForNewProposal (which auto-fires after + Queue)
// because here we need explicit confirmation before throwing away work.
function newCard(){
  if(!confirm('Start a new card?\n\nThe current form will be cleared. Queued items are kept.')) return;
  _resetCardForNewProposal();
  showStatus('Form cleared — ready for a new card.','s-ok');
}

function _resetCardForNewProposal(){
  // Per-card model
  S.photos = [null,null,null,null,null,null];
  S.floorplan = null;
  S.partnerLogo = null;
  S.rows = [];
  // Per-language data — wipe everything; loadLangData/saveLangData will
  // repopulate from blank inputs as the user types.
  Object.keys(LANG_DATA).forEach(lc => { delete LANG_DATA[lc]; });
  // Side panels
  BENEFITS = [];
  TRANSPORT = [];
  BENEFITS_TITLE   = {'en':'','zh-hant':'','zh-hans':'','ja':''};
  DEPOSIT_NOTE     = {'en':'','zh-hant':'','zh-hans':'','ja':''};
  // Floor plan
  FP_PLANS = [];
  FP_PAGE2_SAME = true;
  FP_PAGE1_IDX = -1;
  FP_PAGE2_IDX = -1;
  FP_BASE_URL = '';
  FP_DATA_URL = '';
  FP_MASTER_DATA = null;
  FP_HAS_3D = false; FP_USE_3D = false; FP_USE_LOCAL = false; FP_P2_CUSTOM_URL = null; FP_ANNOTATIONS = {}; if(typeof renderFpP2Slot==='function') renderFpP2Slot();
  if(typeof _renderFp3DToggle === 'function') _renderFp3DToggle();
  COMPASS_ON = false; COMPASS_ANGLE = 0;
  if(typeof _renderCompassControl === 'function') _renderCompassControl();
  CLIENT_NAME = '';
  const _cnEl = document.getElementById('client-name'); if(_cnEl) _cnEl.value = '';
  COMPANY_NAME = '';
  const _coEl = document.getElementById('company-name'); if(_coEl) _coEl.value = '';
  FP_HIGHLIGHTS_MANUAL.clear();
  FP_HIGHLIGHT_RENDER_URL = null;
  FP_HIGHLIGHT_LAST_KEY = null;
  FP_HIGHLIGHT_PENDING_KEY = null;
  if(typeof _AUS_FP_AUTO_ADDED !== 'undefined') _AUS_FP_AUTO_ADDED.clear();
  // Layout / spec visibility
  HIDDEN_SPECS.clear();
  CUSTOM_POS = 'below';
  SHOW_SPECS = true;
  // Amenity toggles back to factory defaults
  AMENITY_ICONS.forEach((a,i) => { a.on = _AMENITY_DEFAULT_ON[i]; });
  // Office Lookup selection — checkboxes uncheck (region/centre stay)
  AUS_SELECTED.clear();
  // Queue-edit state (in case user was mid-edit)
  PDF_QUEUE._editingIdx = null;
  if(typeof setQueueEditBar === 'function') setQueueEditBar(false, -1);
  // DOM input fields — text inputs and rich editors
  TEXT_FIELD_IDS.forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
  RICH_FIELD_IDS.forEach(id => { const el = document.getElementById(id); if(el) el.innerHTML = ''; });
  // Misc inputs that aren't in the above lists
  const _clear = (id, isHtml) => {
    const el = document.getElementById(id);
    if(!el) return;
    if(isHtml) el.innerHTML = ''; else el.value = '';
  };
  _clear('custom-body-editor', true);
  _clear('deposit-note-input');
  _clear('benefits-title-input');
  _clear('fp-room-input');
  _clear('fp-base-url');
  _clear('fp-data-url');
  _clear('aus-search');
  // Re-render every UI piece so the cleared state appears
  if(typeof renderPhotoSlots === 'function') renderPhotoSlots();
  if(typeof renderLogoCard === 'function') renderLogoCard();
  if(typeof renderFloorplanCard === 'function') renderFloorplanCard();
  if(typeof renderRows === 'function') renderRows();
  if(typeof renderTransport === 'function') renderTransport();
  if(typeof renderBenefits === 'function') renderBenefits();
  if(typeof renderAmenities === 'function') renderAmenities();
  if(typeof renderFpList === 'function') renderFpList();
  if(typeof renderPrFpChips === 'function') renderPrFpChips();
  if(typeof syncDepositNoteInput === 'function') syncDepositNoteInput();
  if(typeof renderAusLookup === 'function') renderAusLookup();
  gen();
}

async function addToQueue(){
  const btn=document.getElementById('queue-btn');
  const origHTML=btn?btn.innerHTML:'';
  if(btn){btn.innerHTML='<span style="display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;border:2px solid rgba(0,0,0,.2);border-top-color:var(--o);border-radius:50%;animation:spin .65s linear infinite;display:inline-block"></span>Adding…</span>';btn.disabled=true;}
  try{
    const name=getExportName()||'Location';
    gen._captureMode=true;gen();gen._captureMode=false;
    // If highlight mode is active and a render is pending, wait for it to
    // complete so the captured JPEG includes the highlights. Cap at 8s.
    if(FP_MASTER_DATA && (FP_HIGHLIGHT_RENDERING || FP_HIGHLIGHT_PENDING_KEY)){
      const t0 = Date.now();
      while((FP_HIGHLIGHT_RENDERING || FP_HIGHLIGHT_PENDING_KEY) && (Date.now()-t0) < 8000){
        await new Promise(r => setTimeout(r, 150));
      }
      // gen() once more so the slide picks up the freshly rendered URL
      gen._captureMode=true;gen();gen._captureMode=false;
      // Tiny wait for browser to repaint with the new <img src>
      await new Promise(r => setTimeout(r, 80));
    }
    const cv1=await slideToCanvas('slide');
    const cv2=await slideToCanvas('slide2');
    const thumb=cv1?cv1.toDataURL('image/jpeg',0.5):'';
    const cv1Data=cv1?cv1.toDataURL('image/jpeg',0.92):'';
    const cv2Data=cv2?cv2.toDataURL('image/jpeg',0.92):'';
    const state=buildStateSnapshot();
    PDF_QUEUE.push({name,thumb,cv1DataUrl:cv1Data,cv2DataUrl:cv2Data,state});
    renderQueueList();
    updateQueueBadge();
    // Show panel
    const panel=document.getElementById('queue-panel');
    if(panel) panel.style.display='flex';
    // Clear the form so the next + Queue starts from a blank proposal.
    // Region/centre/queue/library stay; everything per-card wipes.
    _resetCardForNewProposal();
    const n = PDF_QUEUE.length;
    showStatus(ui('queue_added_cleared').replace('{name}', name).replace('{n}', n), 's-ok');
  }catch(err){
    console.error('Queue error:',err);
    alert('Failed to add to queue: '+err.message);
  }finally{
    if(btn){btn.innerHTML=origHTML;btn.disabled=false;}
  }
}

async function exportQueuePDF(){
  // Route through the print system for proper selectable-text PDFs.
  // (The old jsPDF.addImage path produced raster-only PDFs.)
  return printQueue();
}

// Legacy raster path — kept for reference. Produces image-only PDF.
// Call from console as exportQueuePDF_image() if ever needed.
async function exportQueuePDF_image(){
  if(!PDF_QUEUE.length){alert('Queue is empty — add some locations first.');return;}
  const exportBtn=document.getElementById('queue-export-btn');
  const origHTML=exportBtn?exportBtn.innerHTML:'';
  if(exportBtn){exportBtn.innerHTML='Exporting…';exportBtn.disabled=true;}
  try{
    const {jsPDF}=window.jspdf;
    const pdf=new jsPDF({orientation:'landscape',unit:'mm',format:'a4'});
    PDF_QUEUE.forEach((item,qi)=>{
      if(item.cv1DataUrl){
        if(qi>0) pdf.addPage();
        pdf.addImage(item.cv1DataUrl,'JPEG',0,0,297,210);
      }
      if(item.cv2DataUrl){
        pdf.addPage();
        pdf.addImage(item.cv2DataUrl,'JPEG',0,0,297,210);
      }
    });
    const filename = getExportName();
    pdf.save(filename+'.pdf');
    showStatus(`Exported ${PDF_QUEUE.length} location${PDF_QUEUE.length!==1?'s':''} (${PDF_QUEUE.length*2} pages) as PDF.`,'s-ok');
  }catch(err){
    console.error('Export queue error:',err);
    alert('Export failed: '+err.message);
  }finally{
    if(exportBtn){exportBtn.innerHTML=origHTML;exportBtn.disabled=false;}
  }
}

// ══════════════════════════════════════════════════════════════════════════
//  STAFF PROFILE — Page 3 "Let's talk" contact slide
//  Stored in localStorage so the user sets it once per browser.
//  Completely independent of proposal data.
// ══════════════════════════════════════════════════════════════════════════
const PROFILE_KEY = 'co_staff_profile';
let STAFF_PROFILE = null;
let _profilePhotoDataUrl = null; // temp storage while modal is open

function loadStaffProfile(){
  try { STAFF_PROFILE = JSON.parse(localStorage.getItem(PROFILE_KEY)) || null; }
  catch { STAFF_PROFILE = null; }
  renderProfileBtn();
  renderContactPage();
  // Show first-time banner if no profile and not dismissed this session
  if(!STAFF_PROFILE && !sessionStorage.getItem('profile_banner_dismissed')){
    const b = document.getElementById('profile-setup-banner');
    if(b) b.style.display = 'flex';
  }
}

function saveStaffProfile(p){
  STAFF_PROFILE = p;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  renderProfileBtn();
  renderContactPage();
}

function _profileReady(){
  if(!STAFF_PROFILE || !STAFF_PROFILE.showContactPage) return false;
  const p = STAFF_PROFILE;
  // Page shows if there's ANY content — social links alone count
  // (supports Compass-default profile with no personal name)
  const soc = p.social || {};
  const hasSocial  = Object.values(soc).some(v => v && String(v).trim());
  const hasPersonal = !!(p.firstName || p.lastName || p.phone || p.email);
  return hasSocial || hasPersonal;
}

// ── Profile modal ──────────────────────────────────────────────────────────
function openProfileModal(){
  const modal = document.getElementById('profile-modal');
  if(!modal) return;
  // Populate fields from saved profile
  const p = STAFF_PROFILE || {};
  const set = (id, v) => { const el = document.getElementById(id); if(el) el.value = v||''; };
  set('pf-firstname', p.firstName);
  set('pf-lastname',  p.lastName);
  set('pf-title',     p.title);
  set('pf-phone',     p.phone);
  set('pf-email',     p.email);
  set('pf-linkedin',  p.social?.linkedin  !== undefined ? p.social.linkedin  : _DEFAULT_SOCIAL.linkedin);
  set('pf-wechat',    p.social?.wechat    !== undefined ? p.social.wechat    : _DEFAULT_SOCIAL.wechat);
  set('pf-whatsapp',  p.social?.whatsapp  !== undefined ? p.social.whatsapp  : _DEFAULT_SOCIAL.whatsapp);
  set('pf-instagram', p.social?.instagram !== undefined ? p.social.instagram : _DEFAULT_SOCIAL.instagram);
  set('pf-facebook',  p.social?.facebook  !== undefined ? p.social.facebook  : _DEFAULT_SOCIAL.facebook);
  // Photo
  _profilePhotoDataUrl = p.photo || null;
  _updateProfilePhotoUI(_profilePhotoDataUrl);
  // Show contact page toggle
  const tog = document.getElementById('pf-show-toggle');
  const show = p.showContactPage !== false; // default true
  if(tog) tog.classList.toggle('on', show);
  // Render live preview inside modal
  previewContactPage();
  modal.style.display = 'flex';
}

function closeProfileModal(){
  const modal = document.getElementById('profile-modal');
  if(modal) modal.style.display = 'none';
  _profilePhotoDataUrl = null;
}

function clearProfileFromModal(){
  // Clear personal fields
  ['pf-firstname','pf-lastname','pf-title','pf-phone','pf-email'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.value='';
  });
  // Clear photo
  _profilePhotoDataUrl = null;
  _updateProfilePhotoUI(null);
  // Reset social to Compass defaults
  Object.entries(_DEFAULT_SOCIAL).forEach(([key,val])=>{
    const el=document.getElementById('pf-'+key); if(el) el.value=val;
  });
  // Always keep toggle ON
  const tog=document.getElementById('pf-show-toggle');
  if(tog) tog.classList.add('on');
  previewContactPage();
}

function toggleProfileShow(){
  const tog = document.getElementById('pf-show-toggle');
  if(tog){ tog.classList.toggle('on'); previewContactPage(); }
}

function onProfilePhotoUpload(e){
  const file = e.target.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = async ev => {
    _profilePhotoDataUrl = await _compressPhoto(ev.target.result, 400, 0.90);
    _updateProfilePhotoUI(_profilePhotoDataUrl);
    previewContactPage();
  };
  reader.readAsDataURL(file);
  e.target.value = '';
}

function clearProfilePhoto(){
  _profilePhotoDataUrl = null;
  _updateProfilePhotoUI(null);
  previewContactPage();
}

function _updateProfilePhotoUI(dataUrl){
  const img  = document.getElementById('profile-photo-preview');
  const ph   = document.getElementById('profile-photo-placeholder');
  const clr  = document.getElementById('profile-photo-clear');
  if(dataUrl){
    if(img)  { img.src = dataUrl; img.style.display = 'block'; }
    if(ph)   ph.style.display   = 'none';
    if(clr)  clr.style.display  = 'inline';
  } else {
    if(img)  img.style.display  = 'none';
    if(ph)   ph.style.display   = 'flex';
    if(clr)  clr.style.display  = 'none';
  }
}

function saveProfileFromModal(){
  const g = id => (document.getElementById(id)?.value||'').trim();
  const firstName = g('pf-firstname');
  const lastName  = g('pf-lastname');
  const title     = g('pf-title');
  const phone     = g('pf-phone');
  const email     = g('pf-email');
  const social    = {
    linkedin:  g('pf-linkedin'),
    wechat:    g('pf-wechat'),
    whatsapp:  g('pf-whatsapp'),
    instagram: g('pf-instagram'),
    facebook:  g('pf-facebook'),
  };
  const tog       = document.getElementById('pf-show-toggle');
  const showContactPage = tog ? tog.classList.contains('on') : true;

  if(!firstName && !lastName && !phone && !email && !Object.values(social).some(v=>v&&v.trim())){
    alert('Please fill in at least one field.'); return;
  }

  saveStaffProfile({ firstName, lastName, title, phone, email, social,
    photo: _profilePhotoDataUrl || null, showContactPage });
  closeProfileModal();
  showStatus('Contact profile saved — "Let\'s talk" page ready!', 's-ok');
}

// ── Live preview inside modal (updates as user types) ──────────────────────
function previewContactPage(){
  const el = document.getElementById('profile-preview-slide');
  if(!el) return;
  const g = id => (document.getElementById(id)?.value||'').trim();
  const tog = document.getElementById('pf-show-toggle');
  const tempProfile = {
    firstName: g('pf-firstname'), lastName: g('pf-lastname'),
    title: g('pf-title'), phone: g('pf-phone'), email: g('pf-email'),
    photo: _profilePhotoDataUrl, showContactPage: tog ? tog.classList.contains('on') : true,
    social: {
      linkedin:  g('pf-linkedin'),  wechat:   g('pf-wechat'),
      whatsapp:  g('pf-whatsapp'),  instagram:g('pf-instagram'),
      facebook:  g('pf-facebook'),
    },
  };
  el.innerHTML = _buildContactSlideInner(tempProfile);
}

// ── Build contact page HTML ────────────────────────────────────────────────
const _CONTACT_HEADINGS = {
  'en': "Let's talk", 'zh-hant': '立即聯繫',
  'zh-hans': '立即联系', 'ja': 'お問い合わせ',
};

// Social platform icons — Cloudinary hosted, print-safe
const _SOC_ICONS = {
  linkedin:  'https://res.cloudinary.com/dutvfdhdp/image/upload/v1779197482/_CompassOffices/social-icon-linkedin.svg',
  wechat:    'https://res.cloudinary.com/dutvfdhdp/image/upload/v1779197482/_CompassOffices/social-icon-wechat.svg',
  whatsapp:  'https://res.cloudinary.com/dutvfdhdp/image/upload/v1779197482/_CompassOffices/social-icon-whatsapp.svg',
  instagram: 'https://res.cloudinary.com/dutvfdhdp/image/upload/v1779197482/_CompassOffices/social-icon-instagram.svg',
  facebook:  'https://res.cloudinary.com/dutvfdhdp/image/upload/v1779197482/_CompassOffices/social-icon-facebook.svg',
};

// Cloudinary-hosted assets for the contact slide
const _CO_LOGO_URL_CT  = 'https://res.cloudinary.com/dutvfdhdp/image/upload/v1779196609/_CompassOffices/compass-logo-white.svg';
const _CO_ELEM_URL_CT  = 'https://res.cloudinary.com/dutvfdhdp/image/upload/v1779196609/_CompassOffices/compass-element.svg';

// Default social values — Compass Offices official accounts
// Pre-filled when a user opens profile for the first time.
const _DEFAULT_SOCIAL = {
  instagram: '@compassoffices',
  facebook:  'https://www.facebook.com/compassoffices/',
  linkedin:  'https://www.linkedin.com/company/compass-offices/',
  wechat:    'compassoffices',
  whatsapp:  '+85296856961',
};

function _buildContactSlideInner(profile){
  const { firstName='', lastName='', title='', phone='', email='', photo=null, social={} } = profile || {};
  const heading = _CONTACT_HEADINGS[LANG] || "Let's talk";

  // Only show photo if one has been uploaded — no empty circle placeholder
  const photoEl = photo
    ? `<img class="ct-photo" src="${photo}" alt="">`
    : '';

  // Social row — only show entries that have a value
  const socEntries = Object.entries(_SOC_ICONS)
    .filter(([key]) => social && social[key] && String(social[key]).trim())
    .map(([key]) => `<span class="ct-soc-item">
      <img src="${_SOC_ICONS[key]}" class="ct-soc-icon" alt="${key}">
      <span class="ct-soc-handle">${String(social[key]).replace(/^https?:\/\/(www\.)?/i,'').replace(/\/$/,'')}</span>
    </span>`).join('');
  const socialRow = socEntries ? `<div class="ct-social">${socEntries}</div>` : '';

  return `
    <!-- Single large Compass "A" element — positioned right-center as per brand guidelines -->
    <img class="ct-bg-element" src="${_CO_ELEM_URL_CT}" alt="">
    <!-- Compass Offices white logo -->
    <div class="ct-logo"><img src="${_CO_LOGO_URL_CT}" alt="Compass Offices"></div>
    <div class="ct-heading">${heading}</div>
    <div class="ct-bottom">
      <div class="ct-divider"></div>
      <div class="ct-row">
        <div class="ct-person">
          ${photoEl}
          <div>
            <div class="ct-name">
              <span class="ct-fname">${firstName}</span>${lastName ? ` <span>${lastName}</span>` : ''}
            </div>
            ${title ? `<div class="ct-job">${title}</div>` : ''}
          </div>
        </div>
        <div class="ct-contact">
          ${phone ? `<div class="ct-phone">${phone}</div>` : ''}
          ${email ? `<div class="ct-email">${email}</div>` : ''}
        </div>
      </div>
      ${socialRow}
    </div>`;
}

function buildContactPageHtml(){
  // Returns a full .contact-slide div for use in the print window.
  // Includes inline print overrides so it fits exactly like .slide/.slide2.
  if(!_profileReady()) return '';
  return `<div class="contact-slide" style="width:1122px!important;height:794px!important;aspect-ratio:unset!important;border-radius:0!important;box-shadow:none!important;border:none!important;">${_buildContactSlideInner(STAFF_PROFILE)}</div>`;
}

// ── Render Page 3 in the app preview ──────────────────────────────────────
function renderContactPage(){
  const slide3  = document.getElementById('slide3');
  const meta3   = document.getElementById('page3-meta');
  const wrap3   = document.getElementById('page3-wrap');
  const hintP   = document.getElementById('print-hint-p');
  const ready   = _profileReady();
  if(slide3) slide3.innerHTML = ready ? _buildContactSlideInner(STAFF_PROFILE) : '';
  if(meta3)  meta3.style.display  = ready ? '' : 'none';
  if(wrap3)  wrap3.style.display  = ready ? '' : 'none';
  // Update print hint text
  if(hintP){
    const hintSpan = hintP.querySelector('[data-i18n="print_hint"]');
    if(hintSpan) hintSpan.textContent = ready
      ? 'Print / Save PDF → prints 3 pages (incl. Let\'s talk) · A4 Landscape · margins: None'
      : (ui('print_hint') || 'Print / Save PDF → prints both pages · A4 Landscape · margins: None');
  }
  renderProfileBtn();
}

function renderProfileBtn(){
  const btn = document.getElementById('profile-btn');
  if(!btn) return;
  const p = STAFF_PROFILE;
  if(p && p.photo){
    btn.innerHTML = `<img src="${p.photo}" alt="${p.firstName||''}">`;
    btn.classList.add('has-photo');
    btn.classList.remove('setup-pulse');
  } else if(p && (p.firstName || p.lastName)){
    const initials = ((p.firstName||'')[0]||(p.lastName||'')[0]||'?').toUpperCase();
    btn.innerHTML = `<span style="font-size:9px;font-weight:900;color:var(--o);letter-spacing:0;">${initials}</span>`;
    btn.classList.remove('has-photo','setup-pulse');
  } else {
    btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--xlt)"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
    btn.classList.remove('has-photo');
    btn.classList.add('setup-pulse');
  }
}
// ══════════════════════════════════════════════════════════
let _ausViewFilter = '';
let _ausVTypeFilter = '';

function ausSetCentre(centre){
  // Clear floor/office search whenever centre changes — prevents stale floor filter persisting
  const searchInp = document.getElementById('aus-search');
  if(searchInp && searchInp.value) searchInp.value = '';

  AUS_CENTRE_FILTER=centre;
  // Re-render dynamic centre chips so the new "on" state is reflected
  renderCentreChips();

  if(centre){
    const matches=ausLibCardsForCentre(centre);
    if(matches.length){
      // Auto-load the first floor — user can switch via floor chips below.
      // Skip if that floor's card is already loaded (would wipe edits).
      const currentFloor = ausGetCurrentLoadedFloor();
      const firstFloorRaw = matches[0].l.floor || matches[0].l.langs?.en?.floor || '';
      const firstFloorNum = (firstFloorRaw.match(/(\d+)/) || [])[1] || '';
      if(firstFloorNum && firstFloorNum.replace(/^0+/,'') !== (currentFloor||'')){
        _ausLoadCard(matches[0].i);
        // Also pre-filter the office list to this floor so the user
        // immediately sees only the first floor's offices, not all mixed.
        const searchInp = document.getElementById('aus-search');
        if(searchInp) searchInp.value = firstFloorNum;
      }
    }
    // Render lookup + show all floor chips so user can switch
    renderAusLookup();
    renderAusLibSuggestions(centre);
  } else {
    // All centres selected → clear suggestion bar
    const bar=document.getElementById('aus-lib-suggest');
    if(bar) bar.style.display='none';
    renderAusLookup();
  }
}

function ausSetViewFilter(v){ _ausViewFilter=v; renderAusLookup(); }

function ausCalc(marketPrice, discount){
  // BASE_DISCOUNT_ON toggle: when off, market price flows through unchanged
  // (no discount in Monthly Rent, no /12 in Average Price math beyond what
  // the original 10/12 ratio applies). The Office Lookup table and the
  // ausAddToRows result both go through here, so flipping the toggle
  // updates everything at once.
  const eff = BASE_DISCOUNT_ON ? (discount || 0) : 0;
  const monthly = Math.round(marketPrice * (1 - eff/100));
  const avg = Math.round(monthly * 10/12);
  return {monthly, avg};
}

// Mini month-availability dot strip — shows up to 4 upcoming months as
// coloured dots so users can instantly see when an office becomes free.
//   ● green      Y = Vacant (available now)
//   ● orange     O = Occupied (has end date, will become available)
//   ● blue-grey  N = NDD not due (long-term occupied / no notice filed)
//   ● red        S = Suspended (not available)
//   ● light grey '' = no data
// Only rendered when _AUS_MONTHS has data (i.e. the sheet has month columns).
function ausMonthDots(o){
  if(!_AUS_MONTHS || !_AUS_MONTHS.length) return '';
  const months = _AUS_MONTHS.slice(0, 4);
  const ms = o.months || {};
  const colourMap = {
    'Y': '#388e3c',  // green   — vacant
    'O': '#f57c00',  // orange  — occupied, has end date
    'N': '#90a4ae',  // blue-grey — NDD not due / long-term occupied
    'S': '#e57373',  // red     — suspended
  };
  const labelMap = {
    'Y': 'Vacant',
    'O': 'Occupied',
    'N': 'NDD not due',
    'S': 'Suspended',
  };
  const dots = months.map(m => {
    const v = (ms[m] || '').toUpperCase();
    const color = colourMap[v] || '#e0e0e0';
    const abbr  = m.replace(/-\d{4}$/, '').slice(0, 3); // "May-2026" → "May"
    const tip   = `${m}: ${labelMap[v] || 'No data'}`;
    return `<span style="display:inline-flex;flex-direction:column;align-items:center;gap:1px;" title="${tip}">
      <span style="width:7px;height:7px;border-radius:50%;background:${color};display:block;flex-shrink:0;"></span>
      <span style="font-size:6.5px;color:#aaa;line-height:1;letter-spacing:0;">${abbr}</span>
    </span>`;
  }).join('');
  return `<div style="display:flex;align-items:flex-end;gap:3px;margin-top:4px;">${dots}</div>`;
}

function ausAvailLabel(o){
  const av=o.av||'', ce=o.ce||'', firstY=o.firstY||'', firstO=o.firstO||'';
  if(av==='Y') return `<span style="color:#388e3c;font-weight:700;">${firstY||'Vacant'}</span>`;
  if(av==='O') return `<span style="color:#f57c00;font-weight:700;">${firstO||('Occ'+(ce?' →'+ce.slice(0,7):''))}</span>`;
  return '<span style="color:#999;">N/A</span>';
}

let _ausLookupRendering=false;
let _ausLoadingCard=false;
function _ausLoadCard(idx){
  // Load a lib card without triggering AUS centre re-filter
  _ausLoadingCard=true;
  loadFromLib(idx);
  _ausLoadingCard=false;
}

function _ausLoadCardAndFilter(idx, floorNum){
  // Load lib card AND filter AUS office list to that floor's offices
  _ausLoadCard(idx);
  if(floorNum){
    const searchInp = document.getElementById('aus-search');
    if(searchInp){
      searchInp.value = floorNum;
    }
  }
  // Defer so loadFromLib completes first, then refresh both the office list
  // and the floor-chip bar (the chip for the just-loaded floor should turn
  // solid to indicate it's the active card).
  setTimeout(()=>{
    renderAusLookup();
    if(AUS_CENTRE_FILTER) renderAusLibSuggestions(AUS_CENTRE_FILTER);
  }, 0);
}
function renderAusLookup(){
  if(_ausLookupRendering) return;
  _ausLookupRendering=true;
  const list=document.getElementById('aus-office-list');
  if(!list) return;
  const search=(document.getElementById('aus-search')?.value||'').toLowerCase();
  const disc=AUS_DISCOUNT;

  const entries = Object.entries(AUS_OFFICES).filter(([oid,o])=>{
    if(AUS_CENTRE_FILTER && o.c !== AUS_CENTRE_FILTER) return false;
    if(AUS_AVAIL_FILTER && o.av !== AUS_AVAIL_FILTER) return false;
    if(_AUS_MONTH_FILTER){
      const ms=o.months||{};
      const v=ms[_AUS_MONTH_FILTER]||'';
      if(v!=='Y'&&v!=='O') return false;
    }
    if(_ausViewFilter && o.v !== _ausViewFilter) return false;
    if(_ausVTypeFilter && o.vt !== _ausVTypeFilter) return false;
    // WS range
    const wsMin=parseInt(document.getElementById('aus-ws-min')?.value)||0;
    const wsMax=parseInt(document.getElementById('aus-ws-max')?.value)||999;
    if(o.w && (o.w < wsMin || o.w > wsMax)) return false;
    // Sqm range
    const sqMin=parseFloat(document.getElementById('aus-sq-min')?.value)||0;
    const sqMax=parseFloat(document.getElementById('aus-sq-max')?.value)||99999;
    if(o.sq && (o.sq < sqMin || o.sq > sqMax)) return false;
    // Office ID uses startsWith so "17" matches 1702, 1703... but NOT 517.
    // Centre name, view type, and suite type use includes() for flexible word search.
    if(search && !o.oid.toLowerCase().startsWith(search) && !o.c.toLowerCase().includes(search) && !(o.vt||'').toLowerCase().includes(search) && !(o.v||'').toLowerCase().includes(search)) return false;
    return true;
  });

  document.getElementById('aus-count').textContent = `${entries.length} offices`;
  renderAusLibSuggestions(AUS_CENTRE_FILTER);

  if(!entries.length){
    // Distinguish "no region picked yet" from "region picked but filters
    // exclude everything" — the right next action differs.
    if(!AX_REGION){
      list.innerHTML=`<div style="padding:24px 16px;text-align:center;color:var(--xlt);font-size:12px;line-height:1.55;">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="opacity:.55;margin-bottom:6px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <div style="font-weight:600;color:var(--mid);margin-bottom:2px;">${ui('lookup_pick_region')}</div>
        <div style="font-size:10.5px;">${ui('lookup_pick_region_hint')}</div>
      </div>`;
    } else {
      list.innerHTML='<div style="padding:16px;text-align:center;color:var(--xlt);font-size:12px;">No offices match filters</div>';
    }
  } else {
    // ── Sort: selected offices float to top (sorted by office number),
    //         unselected follow in their original order.
    const selEntries = entries
      .filter(([key]) => AUS_SELECTED.has(key))
      .sort(([,a],[,b]) => a.oid.localeCompare(b.oid, undefined, {numeric:true}));
    const unselEntries = entries
      .filter(([key]) => !AUS_SELECTED.has(key));

    // Row builder — shared between sticky selected section and scrollable list
    const buildRow = ([key,o]) => {
      const oid = o.oid; // raw office# for display/FP (key is composite)
      const sel = AUS_SELECTED.has(key);
      const {monthly,avg} = ausCalc(o.mp,disc);
      return `<tr onclick="ausToggle('${key.replace(/'/g,"\\'")}')"
        style="cursor:pointer;border-bottom:1px solid var(--bd);background:${sel?'var(--olt)':'var(--wh)'};transition:background .1s;"
        onmouseover="if(!${sel})this.style.background='#fafafa'"
        onmouseout="if(!${sel})this.style.background='var(--wh)'">
        <td style="padding:5px 8px;text-align:center;">
          <div style="width:16px;height:16px;border-radius:4px;border:2px solid ${sel?'var(--o)':'var(--bd)'};background:${sel?'var(--o)':'transparent'};display:flex;align-items:center;justify-content:center;margin:0 auto;">
            ${sel?'<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5"><polyline points="20 6 9 17 4 12"/></svg>':''}
          </div>
        </td>
        <td style="padding:5px 8px;font-weight:700;color:var(--drk);">${oid}
          <div style="font-size:9px;color:var(--xlt);font-weight:500;">${o.vt}·${o.v}</div>
          ${ausMonthDots(o)}
          ${sel?`<div style="margin-top:3px;"><button class="fpe-row-btn${FP_ANNOTATIONS[oid]?.imageDataUrl?' edited':''}"
            onclick="event.stopPropagation();openFpEditor('${oid.replace(/'/g,"\\'")}')"
            title="Annotate this room's floor plan — shows on Page 1"
            >${FP_ANNOTATIONS[oid]?.imageDataUrl?'Re-edit':'Edit Layout'}</button></div>`:''}
        </td>
        <td style="padding:5px 8px;text-align:center;">${o.w}</td>
        <td style="padding:5px 8px;text-align:center;color:var(--xlt);">${o.sq}${o.unit&&o.unit!==(window._AUS_SQ_UNIT||'')?`<span style="font-size:9px;opacity:.7;"> ${o.unit.replace(/\.\s+/g,'.').replace(/sq\./i,'Sq.')}</span>`:''}</td>
        <td style="padding:5px 8px;text-align:right;color:var(--xlt);">$${o.mp.toLocaleString()}</td>
        <td style="padding:5px 8px;text-align:right;font-weight:700;color:var(--o);">$${monthly.toLocaleString()}</td>
        <td style="padding:5px 8px;text-align:right;font-weight:700;color:var(--o);">$${avg.toLocaleString()}</td>
        <td style="padding:5px 8px;">${ausAvailLabel(o)}</td>
      </tr>`;
    };

    const sqUnitLabel = window._AUS_SQ_UNIT || 'Sqm';
    const tableHeader = `
      <thead style="position:sticky;top:0;background:var(--bg);z-index:1;">
        <tr style="border-bottom:1.5px solid var(--bd);">
          <th style="padding:5px 8px;text-align:left;font-weight:700;color:var(--xlt);font-size:10px;text-transform:uppercase;letter-spacing:.04em;width:28px;"></th>
          <th style="padding:5px 8px;text-align:left;font-weight:700;color:var(--xlt);font-size:10px;text-transform:uppercase;letter-spacing:.04em;">Office #</th>
          <th style="padding:5px 8px;text-align:center;font-weight:700;color:var(--xlt);font-size:10px;text-transform:uppercase;letter-spacing:.04em;">WS</th>
          <th style="padding:5px 8px;text-align:center;font-weight:700;color:var(--xlt);font-size:10px;text-transform:uppercase;letter-spacing:.04em;">${sqUnitLabel}</th>
          <th style="padding:5px 8px;text-align:right;font-weight:700;color:var(--xlt);font-size:10px;text-transform:uppercase;letter-spacing:.04em;">Market</th>
          <th style="padding:5px 8px;text-align:right;font-weight:700;color:var(--o);font-size:10px;text-transform:uppercase;letter-spacing:.04em;">Monthly</th>
          <th style="padding:5px 8px;text-align:right;font-weight:700;color:var(--o);font-size:10px;text-transform:uppercase;letter-spacing:.04em;">Avg(12M)</th>
          <th style="padding:5px 8px;text-align:left;font-weight:700;color:var(--xlt);font-size:10px;text-transform:uppercase;letter-spacing:.04em;">Avail</th>
        </tr>
      </thead>`;

    // ── Sticky selected section (always visible above the scroll) ──────────
    const sticky = document.getElementById('aus-selected-sticky');
    if(sticky){
      if(selEntries.length){
        sticky.style.display = 'block';
        sticky.innerHTML = `
          <table style="width:100%;border-collapse:collapse;font-size:11.5px;">
            ${tableHeader}
            <tbody>${selEntries.map(buildRow).join('')}</tbody>
          </table>
          <div class="aus-sticky-count">${selEntries.length} selected</div>`;
      } else {
        sticky.style.display = 'none';
        sticky.innerHTML = '';
      }
    }

    // ── Scrollable unselected section ──────────────────────────────────────
    list.innerHTML=`<table style="width:100%;border-collapse:collapse;font-size:11.5px;">
      ${unselEntries.length ? tableHeader : ''}
      <tbody>
        ${unselEntries.map(buildRow).join('')}
      </tbody>
    </table>`;
  }

  // Update selection bar
  const bar=document.getElementById('aus-selection-bar');
  const selCnt=document.getElementById('aus-sel-count');
  if(bar){bar.style.display=AUS_SELECTED.size?'flex':'none';}
  if(selCnt){selCnt.textContent=`${AUS_SELECTED.size} office${AUS_SELECTED.size!==1?'s':''} selected`;}
  _ausLookupRendering=false;
}


// Find a library card matching a centre + floor number combination.
// Used by ausToggle to auto-switch cards when the user clicks an office on
// a different floor than the one currently loaded.
function ausFindLibCardByFloor(centre, floorNum){
  if(!centre || !floorNum) return null;
  const matches = ausLibCardsForCentre(centre);
  const target = String(floorNum).replace(/^0+/, '');
  for(const m of matches){
    const l = m.l;
    const name = typeof l.name==='object' ? (l.name.en||Object.values(l.name)[0]) : (l.name||'');
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    const floorFromSlug = (slug.match(/_([^_]+)$/) || [])[1] || '';
    const floorRaw = l.floor || l.langs?.en?.floor || floorFromSlug || '';
    const cardFloorNum = (floorRaw.match(/(\d+)/) || [])[1] || '';
    if(cardFloorNum && cardFloorNum.replace(/^0+/, '') === target) return m;
  }
  return null;
}

// Return the floor digits of the currently loaded card, or null.
function ausGetCurrentLoadedFloor(){
  const floorField = document.getElementById('floor')?.value || '';
  const m = floorField.match(/(\d+)/);
  return m ? m[1].replace(/^0+/, '') : null;
}

// Push an Office Lookup office's room number into Floor Plan Room # so the
// user doesn't have to type it. Mode-aware:
//   • Highlight mode (FP_MASTER_DATA loaded) → fpHighlightAdd, which also
//     bakes the polygon into the master image. Silently fails if the room
//     isn't in the polygon JSON.
//   • Legacy collage mode (FP_BASE_URL set, no polygon data) → push a
//     {url,label} entry into FP_PLANS, same shape "+ Add Plan" produces.
//   • Neither configured → no-op (no chip mechanism is wired up yet).
//
// Rooms successfully auto-added are recorded in _AUS_FP_AUTO_ADDED so the
// reverse action (uncheck office, remove pricing row) can sync-remove them
// later WITHOUT touching entries the user typed in manually.
const _AUS_FP_AUTO_ADDED = new Set(); // keyed by stripped office # (e.g. "1801")
function _ausAddOfficeToFp(oid){
  if(!oid) return false;
  const room = String(oid).replace(/\s*-\s*C$/i, '').trim();
  if(!room) return false;
  if(FP_MASTER_DATA){
    // Highlight mode — must check existence BEFORE calling fpHighlightAdd
    // (which itself dedupes silently), so we only mark as auto on a true
    // new addition. If the room was already highlighted (e.g. user typed
    // it manually first), don't mark as auto — they own it.
    const found = fpFindRoom(room);
    if(!found) return false; // room not in polygon JSON
    if(FP_HIGHLIGHTS_MANUAL.has(found.displayLabel)) return false;
    const ok = fpHighlightAdd(room);   // chip render + gen() handled inside
    if(ok) _AUS_FP_AUTO_ADDED.add(room);
    return ok;
  }
  if(!FP_BASE_URL) return false;
  const url = FP_BASE_URL + room + '.png';
  const label = oid;
  if(FP_PLANS.some(p => p.url === url || p.label === label)) return false;
  FP_PLANS.push({url, label});
  _AUS_FP_AUTO_ADDED.add(room);
  if(FP_PLANS.length === 1) S.floorplan = url;
  applyFpSmartDefaults();
  renderFpList();
  renderPrFpChips();
  gen();
  return true;
}

// Reverse of _ausAddOfficeToFp. Only removes rooms we actually auto-added
// — user-typed entries (never tracked in the auto set) are left alone.
function _ausRemoveOfficeFromFp(oid){
  if(!oid) return;
  const room = String(oid).replace(/\s*-\s*C$/i, '').trim();
  if(!room || !_AUS_FP_AUTO_ADDED.has(room)) return;
  _AUS_FP_AUTO_ADDED.delete(room);
  if(FP_MASTER_DATA){
    const found = fpFindRoom(room);
    if(found) fpHighlightRemove(found.displayLabel); // chip render + gen() inside
    return;
  }
  if(!FP_BASE_URL) return;
  const url = FP_BASE_URL + room + '.png';
  const idx = FP_PLANS.findIndex(p => p.url === url || p.label === oid || p.label === room);
  if(idx < 0) return;
  FP_PLANS.splice(idx, 1);
  if(typeof FP_PAGE1_IDX !== 'undefined' && FP_PAGE1_IDX >= FP_PLANS.length) FP_PAGE1_IDX = -1;
  if(typeof FP_PAGE2_IDX !== 'undefined' && FP_PAGE2_IDX >= FP_PLANS.length) FP_PAGE2_IDX = 0;
  S.floorplan = FP_PLANS.length > 0 ? FP_PLANS[0].url : null;
  applyFpSmartDefaults();
  renderFpList();
  renderPrFpChips();
  gen();
}

function ausToggle(key){
  // key is composite "centre||rawOid". Extract the raw office number for
  // floor-plan sync and pricing-row matching (which store only the raw number).
  const _entryO = AUS_OFFICES[key];
  const oid = _entryO?.oid || key.split('||').pop() || key;
  const wasSelected = AUS_SELECTED.has(key);
  if(wasSelected){
    AUS_SELECTED.delete(key);
    _ausRemoveOfficeFromFp(oid);
    const before = S.rows.length;
    S.rows = S.rows.filter(r => String(r.seats) !== String(oid));
    if(S.rows.length < before){ renderRows(); gen(); }
  } else {
    AUS_SELECTED.add(key);
    _ausAddOfficeToFp(oid);
    if(FP_MASTER_DATA || FP_BASE_URL){
      [700, 2000, 4500].forEach(ms => setTimeout(() => {
        if(AUS_SELECTED.has(key)) ensureHighlightRender();
      }, ms));
    }
    if(!AUS_CENTRE_FILTER){
      const o = AUS_OFFICES[key];
      if(o && o.c){
        AUS_CENTRE_FILTER = o.c;
        renderCentreChips();
        renderAusLibSuggestions(o.c);
      }
    }
  }
  // ── Auto-apply floor filter when checking a room ──────────────────────
  // Mirrors exactly what the floor buttons do: set aus-search to the floor
  // number so only rooms on that floor are shown.
  // Only triggers on SELECT (not deselect), and only if search is empty or
  // already a floor number (avoids clobbering a text search).
  if(!wasSelected){
    const cleanOid2 = oid.replace(/\s*-\s*C$/i,'').trim();
    const fm2 = cleanOid2.match(/^(\d{1,2})\d{2}$/) || cleanOid2.match(/^(\d{1,2})/);
    const floorNum2 = fm2 ? fm2[1].replace(/^0+/,'') : null;
    if(floorNum2){
      const searchInp = document.getElementById('aus-search');
      const curSearch = (searchInp?.value||'').trim();
      if(searchInp && (curSearch==='' || /^\d{1,2}$/.test(curSearch))){
        searchInp.value = floorNum2;
      }
    }
  }
  // ── Auto-load matching library card by floor ──
  // When user clicks an office (newly selecting it) and a centre filter is
  // active, detect the floor from the first 1-2 digits of the office ID and
  // switch to the library card for that floor — but only if it differs from
  // the currently loaded card (otherwise we'd wipe user edits unnecessarily).
  if(!wasSelected && AUS_CENTRE_FILTER){
    // Office IDs like "1718" (level 17, room 18) or "2101" (level 21, room 01).
    // The level is the leading 1-2 digits, except some centres prefix "P" etc.
    const cleanOid = oid.replace(/\s*-\s*C$/i, '').trim();
    const fm = cleanOid.match(/^(\d{1,2})\d{2}$/) || cleanOid.match(/^(\d{1,2})/);
    const officeFloor = fm ? fm[1].replace(/^0+/, '') : null;
    const currentFloor = ausGetCurrentLoadedFloor();
    if(officeFloor && officeFloor !== currentFloor){
      const match = ausFindLibCardByFloor(AUS_CENTRE_FILTER, officeFloor);
      if(match){
        // Preserve the current selection through the card swap
        const savedSelection = new Set(AUS_SELECTED);
        _ausLoadCard(match.i);
        AUS_SELECTED = savedSelection;
        showStatus(`Switched to ${match.l.name?.en || match.l.name || 'matching card'} (Level ${officeFloor})`, 's-ok');
      }
    }
  }
  renderAusLookup();
  _ausUpdateAddBtnPulse();
}


// ── Add-to-rows pulse reminder ────────────────────────────────────────────
// Pulses when offices are selected but not yet added to pricing rows.
// Clears on click (ausAddToRows) or when selection becomes empty.
function _ausUpdateAddBtnPulse(){
  const btn = document.getElementById('aus-add-btn');
  if(!btn) return;
  btn.classList.toggle('aus-add-pending', AUS_SELECTED.size > 0);
}

// ── Discount live-sync for lookup-added rows ──────────────────────────────
// Called whenever AUS_DISCOUNT or BASE_DISCOUNT_ON changes. Recalculates
// mgmt (monthly) + avail (avg/status) + init for every row that carries a
// stored raw market price (_mp), then re-renders so the inline inputs and
// expanded fields show the new values immediately.
function _syncRowPrices(){
  let changed = false;
  S.rows.forEach(r => {
    if(r._mp == null || r._mp <= 0) return;  // only rows from lookup
    const cur = r._currency || 'A$';
    const {monthly, avg} = ausCalc(r._mp, AUS_DISCOUNT);
    r.mgmt  = `${cur}${monthly.toLocaleString()}`;
    if(r._isAus){
      // AUS format: avail = avg price, init = commitment string
      r.avail = `${cur}${avg.toLocaleString()}`;
      r.init  = `16.6% Saving - 2 Months Free on 12! | Avg ${cur}${avg.toLocaleString()}`;
    }
    changed = true;
  });
  if(changed){ renderRows(); gen(); }
}
function ausAddToRows(){
  if(!AUS_SELECTED.size){showStatus('Select at least one office first.','s-info');return;}
  const disc=AUS_DISCOUNT;
  const preset = getRegionPreset();
  const currency = preset.currency || 'A$';
  const isAus = preset.style === 'aus';
  // ── Auto-enable the columns this data lands in ──
  // The Availability Report has 7 fields. Whatever this region's preset
  // hides by default (init/type for simple, sqm/market everywhere), the
  // user toggled-off state would have silently swallowed the data — so
  // the "Monthly Rent missing" symptom. We don't override the user's
  // sqm/market preference (those stay opt-in via Column Settings) but we
  // DO ensure the columns that are essential to this region's view come
  // back on if they were off.
  const requiredCols = isAus
    ? ['seats','type','rent','mgmt','init','avail']
    : ['seats','rent','mgmt','avail'];
  let colsChanged = false;
  requiredCols.forEach(key => {
    const c = PRICING_COLS.find(x => x.key === key);
    if(c && !c.on){ c.on = true; colsChanged = true; }
  });
  if(colsChanged && typeof renderPricingColSettings === 'function') renderPricingColSettings();
  // De-dupe against rows already showing this office #, so the
  // selections-stay-ticked UX doesn't create duplicates on re-click.
  const existing = new Set((S.rows||[]).map(r => String(r.seats||'')));
  let added = 0;
  AUS_SELECTED.forEach(key=>{
    const o=AUS_OFFICES[key];if(!o)return;
    const oid=o.oid;  // raw office number for display / row `seats` field
    if(existing.has(String(oid))) return;
    const {monthly,avg}=ausCalc(o.mp,disc);
    // ── Populate ALL 8 built-in columns, regardless of region style ──
    // This is the key fix: every Availability Report field gets a slot,
    // even if the column is currently toggled off. Turning it on later
    // surfaces the data — no more silent loss when columns are hidden.
    //
    //   seats   ← Office #             type    ← View Type (Partial/Restricted/…)
    //   sqm     ← Net Office Size      rent    ← Workstation count
    //   market  ← Market Price (raw)   mgmt    ← Monthly Rent (discounted)
    //   init    ← AUS commitment text  avail   ← Avg Price (AUS) / Status (simple)
    const marketStr  = (typeof o.mp === 'number' && o.mp > 0) ? `${currency}${o.mp.toLocaleString()}` : '';
    const monthlyStr = `${currency}${monthly.toLocaleString()}`;
    const avgStr     = `${currency}${avg.toLocaleString()}`;
    // Append size unit (Sq.m / Sq.ft) so the pricing row cell is self-contained
    const _sqUnit = (o.unit||'').replace(/\.\s+/g,'.').replace(/sq\./i,'Sq.') || (window._AUS_SQ_UNIT||'');
    const sqmStr  = (o.sq != null && o.sq !== '')
      ? (String(o.sq) + (_sqUnit ? ' '+_sqUnit : ''))
      : '';
    const initStr    = isAus
      ? `16.6% Saving - 2 Months Free on 12! | Avg ${currency}${avg.toLocaleString()}`
      : '';
    const availStr = isAus
      ? avgStr  // AUS view: 'avail' column = Average Price
      : ((o.av === 'Y') ? 'NOW'
        : (o.firstY ? o.firstY
        : (o.firstO ? 'On request' : '—')));  // Simple view: 'avail' = status
    S.rows.push({
      id:     Date.now() + Math.random(),
      seats:  oid,
      type:   o.vt || '',
      sqm:    sqmStr,
      rent:   String(o.w || ''),
      market: marketStr,
      mgmt:   monthlyStr,
      init:   initStr,
      avail:  availStr,
      collapsed: true,   // auto-collapsed — tap to expand and edit
      // Internal fields for live discount sync (not shown on slide)
      _mp:       o.mp,   // raw market price for ausCalc recalculation
      _currency: currency,
      _isAus:    isAus,
    });
    added++;
    _ausAddOfficeToFp(oid);
  });
  renderRows();
  gen();
  if(added){
    showStatus(`Added ${added} office${added!==1?'s':''} to pricing rows${(FP_MASTER_DATA||FP_BASE_URL)?' and floor plan':''}. Selections stay ticked — uncheck or click × on a row to remove.`,'s-ok');

    // Flash the newly added rows so user sees where they landed
    requestAnimationFrame(()=>{
      const allRows = document.querySelectorAll('#pr-rows .pr-row');
      // The last `added` rows are the new ones
      const newRows = Array.from(allRows).slice(-added);
      newRows.forEach(el => {
        el.classList.remove('pr-row-new'); // reset if re-added
        void el.offsetWidth;              // force reflow so animation restarts
        el.classList.add('pr-row-new');
        // Clean up class after animation so it doesn't persist in snapshots
        el.addEventListener('animationend', ()=>el.classList.remove('pr-row-new'), {once:true});
      });

      // Scroll the .panels container so the first new row is visible
      const firstNew = newRows[0];
      const panels   = document.querySelector('.panels');
      if(firstNew && panels){
        const rowTop    = firstNew.getBoundingClientRect().top;
        const panelsTop = panels.getBoundingClientRect().top;
        const offset    = rowTop - panelsTop + panels.scrollTop - 16; // 16px breathing room
        panels.scrollTo({top: offset, behavior:'smooth'});
      }
    });
  } else {
    showStatus('All selected offices are already in the pricing rows.','s-info');
  }
  renderAusLookup();
}


function ausParseAndApplyCSV(text){
  // Split into rows, handling quoted commas
  const parseCSVLine=line=>{const r=[];let cur='',inQ=false;for(let i=0;i<line.length;i++){const ch=line[i];if(ch==='"'){inQ=!inQ;}else if(ch===','&&!inQ){r.push(cur.trim());cur='';}else{cur+=ch;}}r.push(cur.trim());return r;};
  const rows=text.split(/\r?\n/).map(parseCSVLine);

  // Find header row — must contain 'Office' or 'Centre'
  let hi=-1;
  for(let i=0;i<Math.min(8,rows.length);i++){
    if(rows[i].some(h=>/^(office|centre)$/i.test(h.trim()))){hi=i;break;}
  }
  if(hi<0) return 0;

  const headers=rows[hi].map(h=>h.trim());
  const ci=k=>headers.findIndex(h=>h.toLowerCase()===k.toLowerCase());
  const ciContains=k=>headers.findIndex(h=>h.toLowerCase().includes(k.toLowerCase()));

  const cCol=ciContains('centre'), oCol=ci('office')||ciContains('office');
  const vtCol=ciContains('view type'), vCol=ci('view');
  const wCol=ciContains('maximum config'), sqCol=ciContains('net office size');
  const unitCol=ci('unit')>=0?ci('unit'):ciContains('sq unit')>=0?ciContains('sq unit'):ciContains('size unit');
  const mpCol=ciContains('market price');
  const ceCol=ciContains('contract end');
  const termCol=ciContains('terminated');

  // Detect month columns dynamically — pattern: "May-2026", "Jun-2026", "2026-05-01" etc.
  const monthColIdxs=[];
  const monthColLabels=[];
  const monthRe=/^([A-Za-z]{3})-(\d{4})$|^(\d{4})-(\d{2})-(\d{2})/;
  const shortMonths=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  headers.forEach((h,i)=>{
    const m=h.match(monthRe);
    if(m){
      monthColIdxs.push(i);
      // Normalise to "Mon-YYYY" label
      if(m[1]&&m[2]){
        monthColLabels.push(m[1]+'-'+m[2]);
      } else if(m[3]&&m[4]){
        const mo=parseInt(m[4])-1;
        monthColLabels.push(shortMonths[mo]+'-'+m[3]);
      }
    }
  });

  let count=0;
  for(let i=hi+1;i<rows.length;i++){
    const row=rows[i];
    if(row.length<4) continue;
    const raw_centre=stripRegionPrefix((cCol>=0?row[cCol]:''));
    const oid=(oCol>=0?row[oCol]:'').trim();
    // Skip rows without an office ID (legend rows at the bottom of the sheet
    // — "Y - Vacant", "O - Occupied", etc. — have no oid).
    // Previously this also required a digit in the centre name, which
    // accidentally filtered out valid centres like "AIA Tower", "China Building",
    // "Arthaland Century Pacific Tower" — anything outside AUS basically.
    if(!oid||!raw_centre) continue;
    // Defence-in-depth: also skip if the stripped centre looks like a legend
    // code ("Y - Vacant", "N - NDD not due", etc. — single-letter prefix).
    if(/^[YONS]\s*-\s*/i.test(raw_centre)) continue;
    const mp=parseFloat((mpCol>=0?row[mpCol]:'').replace(/[^\d.]/g,''))||0;
    if(!mp) continue;

    // Build month availability map {Mon-YYYY: 'Y'|'O'|'N'|'S'}
    const monthMap={};
    let firstY='', firstO='';
    monthColIdxs.forEach((ci2,mi)=>{
      const v=(row[ci2]||'').trim().toUpperCase();
      const lbl=monthColLabels[mi];
      if(lbl) monthMap[lbl]=v;
      if(v==='Y'&&!firstY) firstY=lbl;
      if((v==='Y'||v==='O')&&!firstO) firstO=lbl;
    });

    // Determine overall availability status
    const av=firstY?'Y':(firstO?'O':'N');

    AUS_OFFICES[raw_centre+'||'+oid]={
      oid,          // raw office number for display/FP/row matching
      c:raw_centre,
      vt:(vtCol>=0?row[vtCol]:'').trim(),
      v:(vCol>=0&&vCol!==vtCol?row[vCol]:'').trim(),
      w:Math.round(parseFloat((wCol>=0?row[wCol]:'')||'0'))||0,
      sq:parseFloat((sqCol>=0?row[sqCol]:'')||'0')||0,
      unit:(unitCol>=0?row[unitCol]:'').trim(),  // e.g. "Sq. m" or "Sq. ft"
      mp, av,
      ce:(ceCol>=0?row[ceCol]:'').trim(),
      months:monthMap,   // {May-2026:'Y', Jun-2026:'O', ...}
      firstY,            // first month with Y (vacant)
      firstO,            // first month with Y or O
    };
    count++;
  }

  // Store available months globally for filter UI
  if(monthColLabels.length){
    window._AUS_MONTHS=monthColLabels;
    _rebuildMonthFilter();
  }

  // Detect predominant size unit (Sq. m / Sq. ft) from loaded offices
  const unitCounts={};
  Object.values(AUS_OFFICES).forEach(o=>{
    if(o.unit){ unitCounts[o.unit]=(unitCounts[o.unit]||0)+1; }
  });
  const topUnit = Object.entries(unitCounts).sort((a,b)=>b[1]-a[1])[0]?.[0]||'';
  // Normalise: "Sq. m" → "Sq.m", "Sq. ft" → "Sq.ft", fallback "Size"
  window._AUS_SQ_UNIT = topUnit
    ? topUnit.replace(/\.\s+/g,'.').replace(/sq\./i,'Sq.')
    : 'Size';

  return count;
}




// ── Office Lookup ↔ Library Sync ─────────────────────────────────────────────
// Centres come from whichever region's data is currently loaded.
function getLoadedCentreNames(){
  const set = new Set();
  Object.values(AUS_OFFICES).forEach(o => { if(o.c) set.add(o.c); });
  return [...set];
}

function ausCentreForCardName(cardName, cardObj){
  if(!cardName && !cardObj) return '';
  // Build the set of strings to try matching: the card's display name plus
  // every language's address. This lets a card named "Bank of Dongguan
  // Tower" still resolve to the centre "136 Des Voeux Road Central" via
  // its address.
  const candidates = [];
  if(cardName) candidates.push(cardName);
  if(cardObj) candidates.push(..._libCardAddrVariants(cardObj));
  return getLoadedCentreNames().find(c =>
    candidates.some(text => centresMatch(c, text))
  ) || '';
}

// ── Centre-name normaliser & fuzzy matcher ─────────────────────────────────
// Goal: a centre name from the availability sheet (e.g. "PHL - Arthaland
// Century Pacific Tower" → stripped to "Arthaland Century Pacific Tower")
// should be able to match a library card named just "Arthaland", or
// "Arthaland 15F", or the full "Arthaland Century Pacific Tower 15F".
//
// Algorithm:
//   1. Normalise both names: lowercase, strip non-word chars, split into words.
//   2. Drop generic "filler" words ("tower", "building", "centre", "street"…)
//      so the discriminative tokens remain ("arthaland", "141", "walker"…).
//   3. The shorter list must be fully contained in the longer list.
// This handles both directions ("Arthaland" library → centre "Arthaland …")
// and ("Arthaland …" library → centre "Arthaland"). The filler list keeps
// "one"/"two" as significant so "Lee Garden One" ≠ "Lee Garden Two".
const _CENTRE_FILLER_WORDS = new Set([
  'tower','towers','building','buildings','bldg',
  'centre','center','ctr',
  'plaza','plazas',
  'street','st',
  'road','rd',
  'avenue','ave','av',
  'place','pl',
  'square','sq',
  'park','parks',
  'house','hall','court',
  'the','of','on','at','in','and','for','de','la','el','del',
  'annex','annexe',
]);

function _normalizeCentreWords(s){
  return String(s||'').toLowerCase()
    // Strip apostrophes / possessive markers BEFORE splitting so "Queen's"
    // collapses to "queens" (one token) and matches "Queens" exactly.
    // Covers: straight apostrophe, curly ' and ', modifier-letter apostrophe.
    .replace(/['\u2018\u2019\u02bc]/g,'')
    .replace(/[_\-\.\/]/g,' ')
    .replace(/[^\w\s\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]+/g,' ')
    .replace(/\s+/g,' ')
    .trim()
    .split(' ')
    .filter(Boolean);
}

function _significantCentreWords(words){
  const sig = words.filter(w => {
    if(_CENTRE_FILLER_WORDS.has(w)) return false;
    // Floor-suffix tokens — "18f", "21fl", "5flr" — are per-floor labels,
    // not building discriminators. Treat as filler so e.g. "BGC 18F" library
    // matches "BGC Corporate Center" centre.
    if(/^\d+f(l(r)?)?$/i.test(w)) return false;
    return true;
  });
  return sig.length ? sig : words;  // fallback: all words filler → use all
}

// Returns true if centreName and libName refer to the same building.
function centresMatch(centreName, libName){
  if(!centreName || !libName) return false;
  const cSig = _significantCentreWords(_normalizeCentreWords(centreName));
  const lSig = _significantCentreWords(_normalizeCentreWords(libName));
  if(!cSig.length || !lSig.length) return false;
  // Shorter side must be fully contained in longer side (word-level)
  const [shorter, longer] = cSig.length <= lSig.length ? [cSig, lSig] : [lSig, cSig];
  return shorter.every(w => longer.includes(w));
}

// ── Library-card field extractors ──────────────────────────────────────────
// Saved library cards (the raw JSON from downloadCurrentJSON) store fields
// at `langs[lc].address`, `langs[lc].city`, `langs[lc].name`. The live
// in-memory LANG_DATA structure uses `langs[lc].fields.addr` instead. These
// helpers try both shapes so the matcher works on either.
function _libCardLangVal(ld, savedKey, liveKey){
  if(!ld) return '';
  if(ld[savedKey]) return ld[savedKey];
  if(ld.fields && ld.fields[liveKey]) return ld.fields[liveKey];
  return '';
}
function _libCardAddrVariants(l){
  const out = [];
  if(l && l.langs && typeof l.langs === 'object'){
    Object.values(l.langs).forEach(ld => {
      const addr = _libCardLangVal(ld, 'address', 'addr');
      if(addr) out.push(addr);
    });
  }
  // Top-level fallback (very old/hand-edited cards)
  if(l && l.address) out.push(l.address);
  return out;
}
function _libCardRegionHints(l){
  const hints = new Set();
  if(l && l.office_lookup_region) hints.add(l.office_lookup_region);
  if(l && l.city) hints.add(l.city);
  if(l && l.langs && typeof l.langs === 'object'){
    Object.values(l.langs).forEach(ld => {
      const city = _libCardLangVal(ld, 'city', 'city');
      if(city) hints.add(city);
    });
  }
  return hints;
}
function _libCardNameVariants(l){
  if(!l) return [];
  if(typeof l.name === 'object' && l.name){
    return Object.values(l.name).filter(Boolean);
  }
  if(l.name) return [l.name];
  return [];
}

function ausLibCardsForCentre(centre){
  if(!centre) return [];
  const lib = getLib();
  return lib.map((l,i)=>({l,i})).filter(({l})=>{
    // ── Region scoping ──
    // A library card saved in Hong Kong shouldn't be returned when the
    // user has Kuala Lumpur loaded just because the building names share
    // a word ("AIA Tower" ↔ "Menara AIA Sentral"). Collect every region
    // hint the card carries (office_lookup_region + each language's city);
    // if the active region matches NONE of them, skip the card. Cards
    // with no region info at all fall through to the name match for
    // backward compat with legacy/hand-edited libraries.
    if(AX_REGION){
      const hints = _libCardRegionHints(l);
      if(hints.size && !hints.has(AX_REGION)) return false;
    }

    // ── Name match ──
    const names = _libCardNameVariants(l);
    if(names.some(name => centresMatch(centre, name))) return true;

    // ── Address match (fallback) ──
    // The availability sheet's centre name is sometimes a street address
    // ("136 Des Voeux Road Central") while the library card is named after
    // the building tenant ("Bank of Dongguan Tower"). When name match fails,
    // try the card's address fields — every language's address. If the
    // centre's words appear in any address, treat it as the same building.
    const addrs = _libCardAddrVariants(l);
    return addrs.some(addr => centresMatch(centre, addr));
  });
}

function renderAusLibSuggestions(centre){
  const bar = document.getElementById('aus-lib-suggest');
  if(!bar) return;
  const matches = ausLibCardsForCentre(centre);
  if(!matches.length || !centre){ bar.style.display='none'; return; }

  const getFloor=({l})=>{
    const name=typeof l.name==='object'?(l.name.en||Object.values(l.name)[0]):l.name;
    const slug=name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    const floorFromSlug=(slug.match(/_([^_]+)$/) || [])[1]||'';
    const floorRaw=l.floor||l.langs?.en?.floor||floorFromSlug||'';
    return floorRaw.replace(/^(\d+)[Ff].*$/,'$1F')||floorRaw;
  };

  bar.style.display='';

  // Single match → show a pre-selected chip, user clicks to confirm (no auto-load to prevent loops)
  if(matches.length===1){
    const {l,i}=matches[0];
    const name=typeof l.name==='object'?(l.name.en||Object.values(l.name)[0]):l.name;
    const floor=getFloor({l});
    bar.innerHTML='<span style="font-size:9.5px;font-weight:700;color:var(--xlt);text-transform:uppercase;letter-spacing:.05em;white-space:nowrap;">Load card:</span>'
      +`<button onmousedown="event.preventDefault();_ausLoadCard(${i})" style="padding:2px 10px;border:1.5px solid var(--o);border-radius:20px;background:var(--o);color:#fff;font-size:11.5px;font-weight:800;font-family:inherit;cursor:pointer;white-space:nowrap;">${floor||name.split(' ').slice(0,2).join(' ')}</button>`;
    return;
  }

  // Multiple matches → prompt user to pick a floor; highlight the one
  // that's currently loaded so the user sees which floor's card is active.
  const activeFloor = (typeof ausGetCurrentLoadedFloor === 'function')
    ? (ausGetCurrentLoadedFloor() || '')
    : '';
  bar.innerHTML='<span style="font-size:9.5px;font-weight:700;color:var(--o);white-space:nowrap;">Select floor:</span>'
    +matches.map(({l,i})=>{
      const floor=getFloor({l});
      // Extract numeric floor for office # filtering (e.g. "21F" → "21")
      const floorNum=(floor.match(/^(\d+)[Ff]/)||[])[1]||'';
      const isActive = floorNum && floorNum.replace(/^0+/,'') === activeFloor;
      const bg = isActive ? 'var(--o)' : 'var(--olt)';
      const fg = isActive ? '#fff' : 'var(--o)';
      const cls = isActive ? 'floor-btn-active' : '';
      return `<button class="${cls}" onmousedown="event.preventDefault();_ausLoadCardAndFilter(${i},'${floorNum}')" style="padding:2px 10px;border:1.5px solid var(--o);border-radius:20px;background:${bg};color:${fg};font-size:11.5px;font-weight:800;font-family:inherit;cursor:pointer;white-space:nowrap;">${floor||'?F'}</button>`;
    }).join('');
}

// ══════════════════════════════════════════════════════════
//  EMAIL TEMPLATE
// ══════════════════════════════════════════════════════════

// Returns array of location data objects — from queue if queued, else current slide
// Returns array of location data objects — from queue if queued, else current slide
// Language is driven by EMAIL_LANG (which defaults to the current UI language).
let EMAIL_LANG = ''; // '' = follow current UI LANG, otherwise a specific lang key
function getEmailLang(){ return EMAIL_LANG || LANG; }

const EMAIL_LANG_LABELS = {'en':'EN','zh-hant':'繁體','zh-hans':'简体','ja':'日本語'};

// ── EMAIL TEMPLATE I18N ────────────────────────────────────
// All the body strings inside the email template — greeting,
// section labels, button text, sign-off — in 4 languages.
// `getEmailI18n()` returns the right dict for the currently-
// selected email language (not the UI language).
const EMAIL_I18N = {
  'en': {
    proposal_label:   'Office Proposal',
    multi_count:      n => `${n} locations included in this proposal`,
    hello:            name => `Hello <strong>${name||'there'}</strong>,`,
    thank_you:        city => `Thank you for your interest in <strong>Compass Offices</strong>${city?', '+city:''}. I hope this email finds you well.`,
    pleased_share:    company => `I am pleased to share the proposal${company?' for <strong>'+company+'</strong>':''} for your review. Compass Offices offers a range of benefits to meet your business needs, including:`,
    pricing_label:    'Pricing',
    virtual_tour:     n => n>1 ? 'Virtual Tours' : 'Virtual Tour',
    tour_n:           i => `Tour ${i} →`,
    view_tour:        'View Virtual Tour →',
    view_location:    'View Location Page →',
    questions:        'If you have any questions or would like to discuss further, please do not hesitate to reach out directly. I am available by mobile or email and would be happy to speak with you.',
    look_forward:     'I look forward to the opportunity to assist you further.',
    best_regards:     'Best regards,',
    company_suffix:   'Compass Offices',
    default_benefits: [
      '24/7 access to private offices and lounge areas',
      'Fully furnished with high-speed Wi-Fi, unlimited tea, coffee &amp; filtered water',
      'Office amenities — photocopying, printing, air conditioning &amp; daily cleaning',
      'Professional business address, mail handling &amp; friendly centre team',
      'Secure building with concierge, end-of-trip facilities &amp; utilities included',
      'Monthly credits for meeting rooms and printing',
    ],
    pt_hello:         name => `Hello ${name||'[Client Name]'},`,
    pt_thank_you:     'Thank you for your interest in Compass Offices. I hope this email finds you well.',
    pt_pleased_share: company => `I am pleased to share the proposal${company?' for '+company:''} for your review.`,
    pt_pricing:       'PRICING',
    pt_tour:          n => n>1 ? 'VIRTUAL TOURS' : 'VIRTUAL TOUR',
    pt_tour_n:        i => `Tour ${i}: `,
    pt_loc_page:      'Location page: ',
    pt_questions:     "Please don't hesitate to reach out if you have any questions.",
    pt_best_regards:  'Best regards,',
    subject_company:  c => `Your Compass Offices Proposal – ${c}`,
    subject_name:     n => `Your Compass Offices Proposal – ${n}`,
  },
  'zh-hant': {
    proposal_label:   '辦公空間方案',
    multi_count:      n => `本方案包含 ${n} 個地點`,
    hello:            name => `<strong>${name||'敬啟者'}</strong> 您好，`,
    thank_you:        city => `感謝您對 <strong>Compass Offices</strong>${city?'（'+city+'）':''} 的興趣。`,
    pleased_share:    company => `謹此呈上${company?'為 <strong>'+company+'</strong> 準備的':''}辦公空間方案供您參考。Compass Offices 提供多項契合貴司業務需求的優勢，包括：`,
    pricing_label:    '定價',
    virtual_tour:     n => '線上虛擬參觀',
    tour_n:           i => `參觀路線 ${i} →`,
    view_tour:        '查看虛擬參觀 →',
    view_location:    '查看地點頁面 →',
    questions:        '如有任何疑問或希望進一步討論，歡迎隨時透過電話或電郵直接與我聯絡，我將樂意為您解答。',
    look_forward:     '期待有機會為您提供更多協助。',
    best_regards:     '此致',
    company_suffix:   'Compass Offices',
    default_benefits: [
      '24/7 全天候進出私人辦公室及休憩區',
      '配備齊全 — 高速 Wi-Fi、無限暢飲茶水咖啡、過濾水',
      '辦公設備齊全 — 影印、打印、冷氣、每日清潔',
      '專業商業地址、收件服務及親切的中心團隊',
      '保安完善的大廈，配備禮賓、淋浴設施，水電費全包',
      '每月會議室及打印額度',
    ],
    pt_hello:         name => `${name||'[客戶姓名]'} 您好，`,
    pt_thank_you:     '感謝您對 Compass Offices 的興趣。',
    pt_pleased_share: company => `謹此呈上${company?'為 '+company+' 準備的':''}方案供您參考。`,
    pt_pricing:       '定價',
    pt_tour:          n => '虛擬參觀',
    pt_tour_n:        i => `參觀路線 ${i}：`,
    pt_loc_page:      '地點頁面：',
    pt_questions:     '如有任何疑問，歡迎隨時與我聯絡。',
    pt_best_regards:  '此致',
    subject_company:  c => `Compass Offices 辦公方案 – ${c}`,
    subject_name:     n => `Compass Offices 辦公方案 – ${n}`,
  },
  'zh-hans': {
    proposal_label:   '办公空间方案',
    multi_count:      n => `本方案包含 ${n} 个地点`,
    hello:            name => `<strong>${name||'敬启者'}</strong> 您好，`,
    thank_you:        city => `感谢您对 <strong>Compass Offices</strong>${city?'（'+city+'）':''} 的关注。`,
    pleased_share:    company => `谨此呈上${company?'为 <strong>'+company+'</strong> 准备的':''}办公空间方案供您参考。Compass Offices 提供多项契合贵司业务需求的优势，包括：`,
    pricing_label:    '定价',
    virtual_tour:     n => '在线虚拟参观',
    tour_n:           i => `参观线路 ${i} →`,
    view_tour:        '查看虚拟参观 →',
    view_location:    '查看地点页面 →',
    questions:        '如有任何疑问或希望进一步沟通，欢迎随时通过电话或邮件直接与我联系，我将很乐意为您解答。',
    look_forward:     '期待有机会为您提供更多协助。',
    best_regards:     '此致',
    company_suffix:   'Compass Offices',
    default_benefits: [
      '24/7 全天候自由出入私人办公室及休息区',
      '配备齐全 — 高速 Wi-Fi、无限畅饮茶水咖啡、过滤水',
      '办公设备齐全 — 复印、打印、空调、每日清洁',
      '专业商业地址、收件服务及亲切的中心团队',
      '安保完善的大厦，配备礼宾、淋浴设施，水电费全含',
      '每月会议室及打印额度',
    ],
    pt_hello:         name => `${name||'[客户姓名]'} 您好，`,
    pt_thank_you:     '感谢您对 Compass Offices 的关注。',
    pt_pleased_share: company => `谨此呈上${company?'为 '+company+' 准备的':''}方案供您参考。`,
    pt_pricing:       '定价',
    pt_tour:          n => '虚拟参观',
    pt_tour_n:        i => `参观线路 ${i}：`,
    pt_loc_page:      '地点页面：',
    pt_questions:     '如有任何疑问，欢迎随时与我联系。',
    pt_best_regards:  '此致',
    subject_company:  c => `Compass Offices 办公方案 – ${c}`,
    subject_name:     n => `Compass Offices 办公方案 – ${n}`,
  },
  'ja': {
    proposal_label:   'オフィスご提案',
    multi_count:      n => `本提案には ${n} 拠点が含まれます`,
    hello:            name => `<strong>${name||'ご担当者'}</strong>さま`,
    thank_you:        city => `いつもお世話になっております。株式会社Compass Officesでございます。`,
    pleased_share:    company => `ご検討いただくために、提案書を共有させていただきます。コンパスオフィスは、お客様のビジネスニーズを満たすために、以下のような様々なメリットをご提供いたします。`,
    pricing_label:    '料金',
    virtual_tour:     n => 'バーチャル内見',
    tour_n:           i => `内見 ${i} →`,
    view_tour:        'バーチャル内見を見る →',
    view_location:    '拠点ページを見る →',
    questions:        'ご不明な点などございましたら、お気軽にご連絡ください。',
    look_forward:     '引き続きよろしくお願いいたします。',
    best_regards:     '',
    company_suffix:   'Compass Offices',
    default_benefits: [
      'コンシェルジュスタッフが常駐（英語対応可能）',
      'ラウンジ・会議室など共有部利用で利用面積２倍',
      'コーヒー・ドリンクアメニティ・冷蔵庫・電子レンジ付',
      '月・年単位での契約期間設定可、保証会社不要',
      '保証金3か月分　退去時全額返金',
      '初期内装工事不要、オフィス家具完備',
      '空調、水道光熱費、Free WiFi、清掃費用込',
      '24時間アクセス可・駐車場・喫煙場所有',
      '退去時原状回復原則不要、クリーニング費用のみ',
    ],
    pt_hello:         name => `${name||'[お客様名]'}さま`,
    pt_thank_you:     'いつもお世話になっております。株式会社Compass Officesでございます。',
    pt_pleased_share: company => 'ご検討いただくために、提案書をお送りいたします。コンパスオフィスは、お客様のビジネスニーズを満たすために、以下のような様々なメリットをご提供いたします。',
    pt_pricing:       '料金',
    pt_tour:          n => 'バーチャル内見',
    pt_tour_n:        i => `内見 ${i}：`,
    pt_loc_page:      '拠点ページ：',
    pt_questions:     'ご不明な点などございましたら、お気軽にご連絡ください。',
    pt_best_regards:  '',
    subject_company:  c => `Compass Offices オフィスご提案 – ${c}`,
    subject_name:     n => `Compass Offices オフィスご提案 – ${n}`,
  },
};
function getEmailI18n(){ return EMAIL_I18N[getEmailLang()] || EMAIL_I18N.en; }
// CJK font stack so 繁體/简体/日本語 emails render with proper system fonts
// in Apple Mail, Gmail web, Outlook etc. instead of falling back to Arial's
// limited CJK glyphs.
//
// IMPORTANT: use SINGLE quotes around font names inside the CSS value.
// These strings get interpolated into `style="font-family:${FF}"` inline
// attributes, and any inner double-quotes would close the style attribute
// prematurely — breaking every CSS rule that follows it (color, weight,
// size, ...), which is why non-English banners were rendering with dark
// text falling back to the page's body color. CSS happily accepts either
// quote style for font-family names, so single quotes are equivalent.
function _emailFontStack(lc){
  switch(lc){
    case 'zh-hant': return "'PingFang TC','Microsoft JhengHei','Heiti TC','Helvetica Neue',Arial,sans-serif";
    case 'zh-hans': return "'PingFang SC','Microsoft YaHei','Hiragino Sans GB','Helvetica Neue',Arial,sans-serif";
    case 'ja':      return "'Hiragino Kaku Gothic ProN','Hiragino Sans','Yu Gothic Medium',Meiryo,Arial,sans-serif";
    default:        return 'Arial,sans-serif';
  }
}

function renderEmailLangChips(){
  const el = document.getElementById('email-lang-chips');
  if(!el) return;
  const active = getEmailLang();
  el.innerHTML = LANG_KEYS.map(lc => {
    const isOn = lc === active;
    return `<button onclick="setEmailLang('${lc}')" style="padding:3px 10px;border:1.5px solid ${isOn?'var(--o)':'var(--bd)'};background:${isOn?'var(--o)':'transparent'};color:${isOn?'#fff':'var(--mid)'};border-radius:99px;font-size:10.5px;font-weight:700;font-family:inherit;cursor:pointer;white-space:nowrap;">${EMAIL_LANG_LABELS[lc]||lc.toUpperCase()}</button>`;
  }).join('');
}

function setEmailLang(lc){
  EMAIL_LANG = lc || '';
  renderEmailLangChips();
  updateEmailPreview();
}

function _emailGetLocations(){
  const emailLang = getEmailLang();
  if(PDF_QUEUE && PDF_QUEUE.length > 0){
    return PDF_QUEUE.map(item=>{
      const st = item.state || {};
      const langs = st.langs || {};
      // Use the email language, falling back to en, then any available lang
      const langData = langs[emailLang] || langs['en'] || langs[Object.keys(langs)[0]] || {};
      const fields = langData.fields || {};
      const rows = langData.rows || [];
      const benefits = (langData.benefits || []).filter(b=>b.on&&b.text);
      const mRaw = fields['matterport'] || '';
      // Deposit note: pull from queue snapshot's per-lang object if present, else default
      let depositNote = '';
      if(st.deposit_note && typeof st.deposit_note === 'object'){
        depositNote = st.deposit_note[emailLang] || st.deposit_note['en'] || '';
      }
      if(!depositNote && langData.deposit_note) depositNote = langData.deposit_note;
      if(!depositNote) depositNote = _depositNoteDefaultFor(emailLang);
      // Respect the deposit-terms toggle: snapshots carry their own flag,
      // fall back to the live global if not saved.
      const noteOn = (typeof st.deposit_note_on === 'boolean') ? st.deposit_note_on : DEPOSIT_NOTE_ON;
      if(!noteOn) depositNote = '';
      return {
        name:    [fields['n-main']||'', fields['floor']||''].filter(Boolean).join(' '),
        locName: fields['n-main'] || item.name || 'Compass Offices',
        floor:   fields['floor'] || '',
        city:    fields['city'] || '',
        addr:    fields['addr'] || '',
        pageUrl: fields['purl'] || '',
        tours:   mRaw.split(',').map(u=>u.trim()).filter(Boolean),
        rows,
        benefits,
        depositNote,
      };
    });
  }
  // Fallback: current slide state — for current card we need the user's per-lang LANG_DATA
  // If they're previewing a non-current language, save current first then read the saved lang
  if(emailLang !== LANG){
    // Save the current language's input values into LANG_DATA so we read fresh data
    if(typeof saveLangData === 'function') saveLangData(LANG);
    const ld = LANG_DATA[emailLang] || {};
    const fields = ld.fields || {};
    const rows = ld.rows || [];
    const benefits = (ld.benefits || []).filter(b=>b.on&&b.text);
    const mRaw = fields['matterport'] || '';
    let depositNote = '';
    if(typeof DEPOSIT_NOTE === 'object') depositNote = DEPOSIT_NOTE[emailLang] || '';
    if(!depositNote) depositNote = _depositNoteDefaultFor(emailLang);
    if(!DEPOSIT_NOTE_ON) depositNote = '';
    return [{
      name:    [fields['n-main']||'', fields['floor']||''].filter(Boolean).join(' '),
      locName: fields['n-main'] || 'Compass Offices',
      floor:   fields['floor'] || '',
      city:    fields['city'] || '',
      addr:    fields['addr'] || '',
      pageUrl: fields['purl'] || '',
      tours:   mRaw.split(',').map(u=>u.trim()).filter(Boolean),
      rows,
      benefits,
      depositNote,
    }];
  }
  // Same language as UI → read live from DOM
  const mRaw = document.getElementById('matterport')?.value.trim() || '';
  return [{
    name:    [document.getElementById('n-main')?.value.trim()||'', document.getElementById('floor')?.value.trim()||''].filter(Boolean).join(' '),
    locName: document.getElementById('n-main')?.value.trim() || 'Compass Offices',
    floor:   document.getElementById('floor')?.value.trim() || '',
    city:    document.getElementById('city')?.value.trim() || '',
    addr:    document.getElementById('addr')?.value.trim() || '',
    pageUrl: document.getElementById('purl')?.value.trim() || '',
    tours:   mRaw.split(',').map(u=>u.trim()).filter(Boolean),
    rows:    S.rows || [],
    benefits:(LANG_DATA[LANG]?.benefits||BENEFITS||[]).filter(b=>b.on&&b.text),
    depositNote: DEPOSIT_NOTE_ON ? getDepositNote() : '',
  }];
}

function emailSelectAll(btn){
  const preview = document.getElementById('email-preview');
  if(!preview) return;

  // Visually select all content in the preview (creates the blue highlight)
  try {
    const range = document.createRange();
    range.selectNodeContents(preview);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  } catch(e) {}

  // Also copy to clipboard using the selected content
  try { document.execCommand('copy'); } catch(e) {}

  // Show instruction hint
  const hint = document.getElementById('email-copy-hint');
  if(hint){
    hint.textContent = '✓ Selected & copied — paste into your email (Ctrl+V / ⌘V)';
    hint.style.color = '#388e3c';
    hint.style.fontWeight = '600';
    setTimeout(()=>{
      hint.textContent = '';
      hint.style.color = '#888';
      hint.style.fontWeight = 'normal';
    }, 4000);
  }

  // Scroll email preview into view
  const scrollArea = preview.closest('[style*="overflow-y:auto"]');
  if(scrollArea) scrollArea.scrollTop = 0;
}

function openEmailModal(){
  const modal = document.getElementById('email-modal');
  if(!modal) return;
  modal.style.display = 'flex';
  // Default email language to current UI language on each open
  EMAIL_LANG = LANG;
  renderEmailLangChips();
  // Auto-populate "To" field from the Client Name saved with this card,
  // but only if the field is currently blank (don't overwrite what user typed).
  const toEl = document.getElementById('email-to-name');
  if(toEl && !toEl.value.trim() && CLIENT_NAME) toEl.value = CLIENT_NAME;
  const companyEl = document.getElementById('email-company');
  if(companyEl && !companyEl.value.trim() && COMPANY_NAME) companyEl.value = COMPANY_NAME;
  // Auto-populate "From (Your Name)" from staff profile — no need to re-type
  // a name that's already saved in the contact profile.
  const fromEl = document.getElementById('email-from-name');
  if(fromEl && !fromEl.value.trim() && STAFF_PROFILE){
    const fullName = [STAFF_PROFILE.firstName, STAFF_PROFILE.lastName].filter(Boolean).join(' ');
    if(fullName) fromEl.value = fullName;
  }
  // Show queue status in modal subtitle
  const subtitle = modal.querySelector('[data-email-subtitle]');
  if(subtitle){
    const qCount = PDF_QUEUE && PDF_QUEUE.length;
    subtitle.textContent = qCount > 1
      ? `Covering ${qCount} queued locations — edit fields then copy`
      : 'Branded proposal email — copy HTML or open in mail client';
  }
  updateEmailPreview();
  modal.addEventListener('click', function handler(e){
    if(e.target === modal){ closeEmailModal(); modal.removeEventListener('click', handler); }
  });
}

function closeEmailModal(){
  const modal = document.getElementById('email-modal');
  if(modal) modal.style.display = 'none';
}

function updateEmailPreview(){
  const preview = document.getElementById('email-preview');
  if(!preview) return;
  const toName    = document.getElementById('email-to-name')?.value.trim()   || 'there';
  const fromName  = document.getElementById('email-from-name')?.value.trim() || '[Your Name]';
  const company   = document.getElementById('email-company')?.value.trim()   || '';
  preview.innerHTML = buildEmailHTML(toName, fromName, company);
}

function buildEmailHTML(toName, fromName, company){
  const locations = _emailGetLocations();
  const isMulti = locations.length > 1;
  const firstLoc = locations[0] || {};
  const lc = getEmailLang();
  const T = getEmailI18n();
  const FF = _emailFontStack(lc); // Font family stack for this language

  // Build per-location sections
  const locationSections = locations.map((loc, li)=>{
    const hasPricing = loc.rows && loc.rows.length > 0;
    const activeCols = PRICING_COLS.filter(col=>col.on);

    const pricingHTML = hasPricing ? `
<table class="em-pricing-stack" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;font-size:13px;margin:16px 0;">
  <thead><tr style="background:#fff3eb;border-bottom:2px solid #FF6600;">
    ${activeCols.map(col=>`<th style="padding:10px 14px;text-align:left;color:#FF6600;font-weight:700;font-family:${FF};white-space:nowrap;font-size:12px;border-bottom:2px solid #FF6600;">${getPricingColLabel(col.key)}</th>`).join('')}
  </tr></thead>
  <tbody>
    ${loc.rows.map((r,ri)=>`<tr style="background:${ri%2===0?'#ffffff':'#fff9f5'};">
      ${activeCols.map(col=>{
        const v=(r[col.key]||'').replace(/<[^>]+>/g,'');
        const isPrice=col.key==='mgmt'||col.key==='avail'||col.key==='market';
        const label=getPricingColLabel(col.key).replace(/"/g,'&quot;');
        return `<td data-label="${label}" style="padding:9px 14px;border-bottom:1px solid #f2e8e3;font-family:${FF};font-size:13px;${isPrice?'color:#FF6600;font-weight:700;':''}">${v}</td>`;
      }).join('')}
    </tr>`).join('')}
  </tbody>
</table>` : '';

    // Deposit note line: appears just under the pricing table when pricing exists.
    const depositHTML = (hasPricing && loc.depositNote) ? `
<p style="margin:6px 0 0;font-family:${FF};font-size:11.5px;color:#888;font-style:italic;line-height:1.5;">${loc.depositNote}</p>` : '';

    const toursHTML = loc.tours&&loc.tours.length ? `
<table class="em-tours" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0 8px;">
  <tr><td>
    <p style="margin:0 0 12px;font-family:${FF};font-size:13px;font-weight:700;color:#333;">${T.virtual_tour(loc.tours.length)}</p>
    ${loc.tours.map((url,i)=>`<a href="${url}" target="_blank" class="em-btn-tour" style="display:inline-block;margin:0 8px 8px 0;padding:10px 24px;border:2px solid #FF6600;background:#ffffff;color:#FF6600;font-family:${FF};font-size:13px;font-weight:700;text-decoration:none;">${loc.tours.length>1?T.tour_n(i+1):T.view_tour}</a>`).join('')}
  </td></tr>
</table>` : '';

    const pageBtn = loc.pageUrl ? `
<table class="em-pagebtn" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:12px 0;">
  <tr><td><a href="${loc.pageUrl}" target="_blank" class="em-btn-page" style="display:inline-block;padding:10px 24px;border:2px solid #FF6600;color:#FF6600;font-family:${FF};font-size:13px;font-weight:700;text-decoration:none;">${T.view_location}</a></td></tr>
</table>` : '';

    // Location divider header (multi-location only)
    const locHeader = isMulti ? `
<tr><td class="em-loc-header" style="padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="background:#fff3ec;border-left:4px solid #FF6600;padding:14px 20px;${li>0?'border-top:2px solid #ffe4d0;':''}">
        <span style="font-family:${FF};font-size:15px;font-weight:800;color:#FF6600;">${loc.locName}</span>
        ${loc.floor?`<span style="display:inline-block;margin-left:8px;border:1.5px solid #FF6600;color:#FF6600;font-family:${FF};font-size:11px;font-weight:700;padding:1px 7px;border-radius:3px;">${loc.floor}</span>`:''}
        ${loc.city||loc.addr?`<div style="font-family:${FF};font-size:12px;color:#999;margin-top:3px;">${[loc.addr,loc.city].filter(Boolean).join(' · ')}</div>`:''}
      </td>
    </tr>
  </table>
</td></tr>` : '';

    return `${locHeader}
<tr><td class="em-loc-body" style="padding:${li>0?'0 36px 28px':'0 36px 28px'};${li===0&&!isMulti?'padding-top:0;':'padding-top:20px;'}">
  ${hasPricing?`<p style="margin:0 0 6px;font-family:${FF};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#FF6600;">${T.pricing_label}</p>${pricingHTML}${depositHTML}`:''}
  ${toursHTML}${pageBtn}
</td></tr>`;
  }).join('');

  // Benefits (from first location, shown once)
  const bens = firstLoc.benefits||[];
  const bensHTML = bens.length
    ? bens.map(b=>`<li style="margin:5px 0;font-family:${FF};font-size:13.5px;color:#444;line-height:1.6;">${b.text}</li>`).join('')
    : T.default_benefits.map(t=>`<li style="margin:5px 0;font-family:${FF};font-size:13.5px;color:#444;line-height:1.6;">${t}</li>`).join('');

  const locTitle = isMulti
    ? locations.map(l=>l.locName+(l.floor?' '+l.floor:'')).join(' · ')
    : [firstLoc.locName, firstLoc.floor].filter(Boolean).join(' – ');

  return `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="${lc}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>Compass Offices Proposal</title>
<style type="text/css">
  /* Mobile email-client styles. Major clients (Apple Mail, Gmail web,
     Outlook 2016+) respect these. Older Outlook + Gmail mobile-app
     fall back to the inline styles, which are already fluid-friendly. */
  body{margin:0!important;padding:0!important;-webkit-text-size-adjust:100%;}
  .em-outer{padding:32px 0;}
  .em-shell{width:600px;max-width:600px;}
  .em-pad{padding:24px 36px;}
  .em-pad-body{padding:0 36px 28px;}
  .em-greet{padding:28px 36px 8px;}
  .em-foot-pad{padding:0 36px 32px;}
  .em-banner{padding:22px 36px;}
  .em-banner-title{font-size:20px;line-height:1.25;}
  .em-loc-pad{padding:14px 20px;}
  @media screen and (max-width: 600px){
    .em-outer{padding:0!important;}
    .em-shell{width:100%!important;max-width:100%!important;}
    .em-pad{padding:16px 18px!important;}
    .em-pad-body{padding:0 18px 22px!important;}
    .em-greet{padding:18px 18px 4px!important;}
    .em-foot-pad{padding:0 18px 22px!important;}
    .em-banner{padding:16px 18px!important;}
    .em-banner-title{font-size:17px!important;}
    .em-loc-pad{padding:11px 14px!important;}
    .em-btn-tour, .em-btn-page{
      display:block!important;
      box-sizing:border-box;
      width:100%!important;
      margin:0 0 8px 0!important;
      text-align:center;
      padding:11px 16px!important;
    }
    .em-pricing-stack tr{display:block;border-bottom:1px solid #f2e8e3;padding:8px 0;}
    .em-pricing-stack td{display:block;padding:3px 12px!important;border:none!important;font-size:12.5px!important;white-space:normal!important;}
    .em-pricing-stack td::before{
      content:attr(data-label);
      font-weight:700;color:#999;text-transform:uppercase;
      font-size:9.5px;letter-spacing:.04em;display:block;margin-bottom:1px;
    }
    .em-pricing-stack thead{display:none;}
  }
</style>
</head>
<body style="margin:0;padding:0;background:#fef8f4;font-family:${FF};-webkit-text-size-adjust:100%;">
<table class="em-outer" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fef8f4;padding:32px 0;">
<tr><td align="center">
<table class="em-shell" width="600" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;max-width:600px;width:100%;">

  <!-- Orange top accent bar -->
  <tr>
    <td style="background:#FF6600;height:4px;font-size:0;line-height:0;">&nbsp;</td>
  </tr>

  <!-- PROPOSAL HEADER — white background, dark text, orange accent (no white-on-orange) -->
  <tr>
    <td class="em-banner" style="background:#ffffff;padding:26px 36px 22px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="border-left:4px solid #FF6600;padding-left:16px;">
          <p style="margin:0 0 5px;font-family:${FF};font-size:10.5px;font-weight:700;color:#FF6600;text-transform:uppercase;letter-spacing:.1em;">${T.proposal_label}</p>
          <p class="em-banner-title" style="margin:0;font-family:${FF};font-size:22px;font-weight:800;color:#1a1a1a;line-height:1.25;">${locTitle}</p>
          ${!isMulti&&firstLoc.addr?`<p style="margin:6px 0 0;font-family:${FF};font-size:12px;color:#888;line-height:1.4;">${firstLoc.addr}</p>`:''}
          ${isMulti?`<p style="margin:6px 0 0;font-family:${FF};font-size:12px;color:#888;">${T.multi_count(locations.length)}</p>`:''}
        </td>
      </tr></table>
    </td>
  </tr>
  <tr><td style="padding:0 36px;"><div style="height:1px;background:#f0e8e0;font-size:0;line-height:0;">&nbsp;</div></td></tr>

  <!-- GREETING & BENEFITS -->
  <tr>
    <td class="em-greet" style="padding:28px 36px 8px;">
      <p style="margin:0 0 16px;font-family:${FF};font-size:15px;color:#1a1a1a;">${T.hello(toName)}</p>
      <p style="margin:0 0 16px;font-family:${FF};font-size:13.5px;color:#555;line-height:1.65;">${T.thank_you(firstLoc.city&&!isMulti ? firstLoc.city : '')}</p>
      <p style="margin:0 0 14px;font-family:${FF};font-size:13.5px;color:#555;line-height:1.65;">${T.pleased_share(company)}</p>
      <ul style="margin:0 0 8px;padding-left:20px;">${bensHTML}</ul>
    </td>
  </tr>

  <!-- LOCATION SECTIONS (pricing, tours) -->
  ${locationSections}

  <!-- DIVIDER -->
  <tr><td style="padding:0 36px;"><hr style="border:none;border-top:1px solid #eee;margin:4px 0 20px;"></td></tr>

  <!-- SIGN-OFF -->
  <tr>
    <td class="em-foot-pad" style="padding:0 36px 32px;">
      <p style="margin:0 0 12px;font-family:${FF};font-size:13.5px;color:#555;line-height:1.65;">${T.questions}</p>
      <p style="margin:0 0 18px;font-family:${FF};font-size:13.5px;color:#555;line-height:1.65;">${T.look_forward}</p>
      <p style="margin:0;font-family:${FF};font-size:13.5px;color:#1a1a1a;line-height:1.7;">${T.best_regards}<br>
        <strong style="font-size:15px;color:#FF6600;">${fromName||'[Your Name]'}</strong><br>
        <span style="font-size:12px;color:#888;">${T.company_suffix}</span>
      </p>
    </td>
  </tr>

</table>
</td></tr></table>
</body></html>`;}


function emailCopyHTML(btn){
  // Use select() + execCommand — works everywhere without HTTPS requirement
  const toName   = document.getElementById('email-to-name')?.value.trim()   || 'there';
  const fromName = document.getElementById('email-from-name')?.value.trim() || '[Your Name]';
  const company  = document.getElementById('email-company')?.value.trim()   || '';
  const html = buildEmailHTML(toName, fromName, company);
  const ta = document.createElement('textarea');
  ta.value = html;
  ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
  document.body.appendChild(ta);
  ta.select();
  ta.setSelectionRange(0, ta.value.length);
  const ok = document.execCommand('copy');
  document.body.removeChild(ta);
  if(btn){
    const orig = btn.innerHTML;
    btn.innerHTML = ok ? '✓ Copied!' : '✗ Try Cmd+C';
    btn.style.background = ok ? '#388e3c' : '#c62828';
    setTimeout(()=>{ btn.innerHTML=orig; btn.style.background='#FF6600'; }, 2500);
  }
}

function buildEmailPlainText(toName, fromName, company){
  // Build locations list: queue items if any, else current slide
  const locations = _emailGetLocations();
  const T = getEmailI18n();
  const subject = company
    ? T.subject_company(company)
    : T.subject_name(locations[0]?.name || 'Compass Offices');

  let body = `Subject: ${subject}\n\n`;
  body += `${T.pt_hello(toName)}\n\n`;
  body += `${T.pt_thank_you}\n\n`;
  body += `${T.pt_pleased_share(company)}\n\n`;

  locations.forEach((loc, li)=>{
    if(locations.length > 1) body += `\n${'═'.repeat(50)}\n${loc.name}\n${'═'.repeat(50)}\n`;

    if(loc.rows && loc.rows.length){
      const activeCols = PRICING_COLS.filter(c=>c.on);
      body += `\n${T.pt_pricing}\n${'─'.repeat(40)}\n`;
      loc.rows.forEach(r=>{
        const parts = activeCols.map(col=>{ const v=(r[col.key]||'').replace(/<[^>]+>/g,''); return v?`${getPricingColLabel(col.key)}: ${v}`:''; }).filter(Boolean);
        body += parts.join(' | ') + '\n';
      });
    }
    if(loc.tours && loc.tours.length){
      body += `\n${T.pt_tour(loc.tours.length)}\n`;
      loc.tours.forEach((u,i)=>{ body += (loc.tours.length>1 ? T.pt_tour_n(i+1) : '') + u + '\n'; });
    }
    if(loc.pageUrl) body += `\n${T.pt_loc_page}${loc.pageUrl}\n`;
  });

  body += `\n${'─'.repeat(40)}\n`;
  body += `${T.pt_questions}\n\n${T.pt_best_regards}\n${fromName||'[Your Name]'}\nCompass Offices`;
  return body;
}

function getExportName(){
  const today = new Date();
  const dateStr = today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0')+'-'+String(today.getDate()).padStart(2,'0');
  // If company name is set, use it as the primary identifier (+ date)
  if(COMPANY_NAME && COMPANY_NAME.trim()){
    const safe = COMPANY_NAME.trim().replace(/[^\w\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]+/g,'-').replace(/^-|-$/g,'');
    return safe ? `${safe}_${dateStr}` : dateStr;
  }
  const enName = LANG_DATA['en']?.fields?.['n-main'] || '';
  const curName = document.getElementById('n-main')?.value || '';
  let raw = enName || curName;
  if(!raw && PDF_QUEUE && PDF_QUEUE.length){
    const names = PDF_QUEUE.map(i => {
      return i.state?.langs?.en?.name || i.state?.langs?.['zh-hant']?.name || i.name || '';
    }).filter(Boolean);
    if(names.length === 1) raw = names[0];
    else if(names.length === 2) raw = names.join('+');
    else if(names.length > 2) raw = `${names[0]}+${names.length - 1}more`;
  }
  raw = raw || 'proposal';
  const safe = raw.toLowerCase().replace(/[^\w\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]+/g,'-').replace(/^-|-$/g,'') || 'proposal';
  return `${safe}_${dateStr}`;
}


async function slideToCanvas(elId){
  const el=document.getElementById(elId);if(!el)return document.createElement('canvas');

  // 1. Make the preview container visible (mobile hides it behind tabs)
  const preview=document.querySelector('.preview');
  const sidebar=document.querySelector('.sidebar');
  const prevPreviewD=preview?preview.style.display:'';
  const prevPreviewV=preview?preview.style.visibility:'';
  if(preview){preview.style.display='block';preview.style.visibility='visible';}

  // 2. Force the slide to exact output dimensions
  const prevW=el.style.width,prevH=el.style.height,prevAR=el.style.aspectRatio;
  const prevPos=el.style.position,prevLeft=el.style.left,prevTop=el.style.top;
  el.style.width='1122px';el.style.height='794px';el.style.aspectRatio='unset';
  // On mobile, ensure it's not clipped by viewport
  el.style.position='fixed';el.style.left='-9999px';el.style.top='0';

  // 3. Re-run gen() with captureMode so font scales at 1122px (not mobile viewport)
  gen._captureMode = true;
  gen();
  gen._captureMode = false;

  // 4. Wait for layout + fonts to settle (longer on mobile)
  // Three rAF passes ensure flex containers fully compute child sizes after position:fixed
  const isIOS2=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  await new Promise(r=>setTimeout(r,isIOS2?400:80));
  await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>requestAnimationFrame(r))));

// ── Step 0: Pre-render .sl-fp-collage grids to a single canvas ──────────────
  // html2canvas cannot reliably render CSS grid children with object-fit:contain.
  // We composite each collage into a canvas image BEFORE running html2canvas.
  const collageRestores=[];
  const collageEls=Array.from(el.querySelectorAll('.sl-fp-collage'));
  for(const collage of collageEls){
    const rect=collage.getBoundingClientRect();
    const cw=Math.round(rect.width)||collage.offsetWidth||collage.parentElement?.offsetWidth||400;
    const ch=Math.round(rect.height)||collage.offsetHeight||collage.parentElement?.offsetHeight||300;
    if(!cw||!ch) continue;

    const imgs=Array.from(collage.querySelectorAll('img'));
    if(!imgs.length) continue;

    // Load all images, cross-origin safe (data URLs already applied in Step 2 below,
    // but we need to load them now — use current src which may still be external)
    const loadImg=src=>new Promise(res=>{
      if(!src){res(null);return;}
      const i=new Image();
      i.crossOrigin='anonymous';
      i.onload=()=>res(i);
      i.onerror=()=>{
        // Try without CORS
        const i2=new Image();
        i2.onload=()=>res(i2);
        i2.onerror=()=>res(null);
        i2.src=src;
      };
      i.src=src;
    });

    const n=imgs.length;
    const cols=n===2?2:n===3?3:n<=4?2:3;
    const rows=Math.ceil(n/cols);
    const cellW=Math.floor(cw/cols);
    const cellH=Math.floor(ch/rows);
    const scale=2;
    const cv=document.createElement('canvas');
    cv.width=cw*scale;cv.height=ch*scale;
    const ctx=cv.getContext('2d');
    ctx.fillStyle='#ffffff';ctx.fillRect(0,0,cv.width,cv.height);

    // Load all and draw
    const loaded=await Promise.all(imgs.map(img=>loadImg(img.src||img.getAttribute('src')||'')));
    loaded.forEach((image,pi)=>{
      if(!image) return;
      const col=pi%cols;
      const row=Math.floor(pi/cols);
      const dx=col*cellW*scale;
      const dy=row*cellH*scale;
      const dw=cellW*scale;
      const dh=cellH*scale;
      // object-fit:contain — scale preserving aspect ratio to fit cell
      const sc=Math.min(dw/image.naturalWidth,dh/image.naturalHeight);
      const sw=image.naturalWidth*sc;
      const sh=image.naturalHeight*sc;
      ctx.fillStyle='#ffffff';ctx.fillRect(dx,dy,dw,dh);
      ctx.drawImage(image,dx+(dw-sw)/2,dy+(dh-sh)/2,sw,sh);
    });

    // Replace collage div with an img
    const dataUrl=cv.toDataURL('image/png');
    const replacement=document.createElement('img');
    replacement.src=dataUrl;
    replacement.style.cssText=`width:${cw}px;height:${ch}px;display:block;object-fit:contain;`;
    collage.parentNode.replaceChild(replacement,collage);
    collageRestores.push(()=>replacement.parentNode&&replacement.parentNode.replaceChild(collage,replacement));
  }

  // ── Step 1: Build a Map of src → dataURL for ALL images in this slide ──
  const dataURLMap=new Map();
  const svgInlineMap=new Map(); // for SVG imgs: src → inline SVG text

  const allImgs=Array.from(el.querySelectorAll('img'));
  await Promise.all(allImgs.map(async img=>{
    const src=img.getAttribute('src')||img.src||'';
    if(!src||src.startsWith('data:')||src.startsWith('blob:')) return;
    if(dataURLMap.has(src)) return;

    // For SVG files, try to inline them (avoids all CORS issues)
    if(src.toLowerCase().includes('.svg')){
      const svgText=await fetchSVGInline(src);
      if(svgText){svgInlineMap.set(src,svgText);dataURLMap.set(src,'SVG_INLINE');return;}
    }
    const du=await urlToDataURL(src);
    dataURLMap.set(src,du||null);
  }));

  // ── Step 2: Apply data URLs to original DOM so fixObjectFit works correctly ──
  const origSrcs=new Map();
  allImgs.forEach(img=>{
    const src=img.getAttribute('src')||'';
    if(!src||src.startsWith('data:')||src.startsWith('blob:')) return;
    const du=dataURLMap.get(src);
    origSrcs.set(img,src);
    if(du&&du!=='SVG_INLINE') img.src=du;
    // SVG inlines and nulls handled in onclone
  });
  await new Promise(r=>requestAnimationFrame(r)); // let browser update

  // ── Step 3: Fix object-fit images (now srcs are data URLs, no taint) ──
  // html2canvas ignores object-fit CSS. We replace each cover/contain img
  // with a pre-drawn canvas so the export looks identical to the browser.
  const fitRestores=[];
  allImgs.forEach(img=>{
    if(!img.complete||img.naturalWidth===0) return;
    const cs=window.getComputedStyle(img);
    const fit=cs.objectFit;
    if(fit!=='cover'&&fit!=='contain') return;

    // getBoundingClientRect is more reliable than offsetWidth when slide is position:fixed
    const rect=img.getBoundingClientRect();
    const w=Math.round(rect.width)||img.offsetWidth||img.parentElement?.offsetWidth||100;
    const h=Math.round(rect.height)||img.offsetHeight||img.parentElement?.offsetHeight||100;
    if(!w||!h) return;

    const c2=document.createElement('canvas');
    c2.width=w*2;c2.height=h*2;
    c2.style.cssText=`width:${w}px;height:${h}px;display:block;flex-shrink:0;`;
    const ctx=c2.getContext('2d');
    const iw=img.naturalWidth,ih=img.naturalHeight;

    if(fit==='cover'){
      const sc=Math.max(w/iw,h/ih);
      const sw=w/sc,sh=h/sc,sx=(iw-sw)/2,sy=(ih-sh)/2;
      ctx.drawImage(img,sx,sy,sw,sh,0,0,w*2,h*2);
    } else { // contain
      const sc=Math.min(w/iw,h/ih);
      const dw=iw*sc*2,dh=ih*sc*2;
      ctx.fillStyle='#ffffff';ctx.fillRect(0,0,w*2,h*2);
      ctx.drawImage(img,0,0,iw,ih,(w*2-dw)/2,(h*2-dh)/2,dw,dh);
    }
    img.parentNode.replaceChild(c2,img);
    fitRestores.push(()=>c2.parentNode&&c2.parentNode.replaceChild(img,c2));
  });

  // ── Step 4: html2canvas with onclone to patch the clone's images ──
  const canvas=await html2canvas(el,{
    scale:2, useCORS:true, allowTaint:true,
    backgroundColor:'#ffffff', width:1122, height:794,
    logging:false, imageTimeout:15000,
    onclone:(clonedDoc,clonedEl)=>{
      // Build a reverse map: originalURL → origImg (for fast lookup)
      const srcToOrig = new Map();
      allImgs.forEach(i=>{ const s=origSrcs.get(i); if(s) srcToOrig.set(s,i); });

      clonedEl.querySelectorAll('img').forEach(clonedImg=>{
        const clonedSrc = clonedImg.getAttribute('src')||'';

        // If already a data URL — we successfully converted it in Step 2.
        // html2canvas clone will have that data URL, nothing to do.
        if(clonedSrc.startsWith('data:')||clonedSrc.startsWith('blob:')||!clonedSrc) return;

        // clonedSrc is still an external URL — means conversion was SVG_INLINE or null.
        // Find the matching original img by original URL.
        const origImg = srcToOrig.get(clonedSrc);
        const du = dataURLMap.get(clonedSrc);

        if(du==='SVG_INLINE'){
          const svgText = svgInlineMap.get(clonedSrc)||'';
          if(svgText){
            const ow = origImg ? (origImg.offsetWidth||origImg.clientWidth||16) : 16;
            const oh = origImg ? (origImg.offsetHeight||origImg.clientHeight||16) : 16;
            const wrapper = clonedDoc.createElement('div');
            wrapper.innerHTML = svgText;
            const svgEl = wrapper.firstElementChild;
            if(svgEl){
              if(origImg) svgEl.style.cssText = origImg.style.cssText;
              svgEl.style.display='block';
              svgEl.style.flexShrink='0';
              svgEl.setAttribute('width', ow);
              svgEl.setAttribute('height', oh);
              svgEl.style.width = ow+'px';
              svgEl.style.height = oh+'px';
              clonedImg.parentNode.replaceChild(svgEl, clonedImg);
            }
          } else {
            clonedImg.style.visibility='hidden';
          }
        } else if(du){
          // A data URL we have but didn't apply in Step 2 (shouldn't happen, but safe fallback)
          clonedImg.setAttribute('src', du);
          clonedImg.removeAttribute('onerror');
          if(origImg){
            const ow=origImg.offsetWidth||origImg.clientWidth;
            const oh=origImg.offsetHeight||origImg.clientHeight;
            if(ow) clonedImg.style.width=ow+'px';
            if(oh) clonedImg.style.height=oh+'px';
          }
        } else {
          // Truly unresolvable — hide it
          clonedImg.style.visibility='hidden';
        }
      });
    }
  });

  // ── Step 5: Restore everything ──
  collageRestores.forEach(fn=>fn());
  fitRestores.forEach(fn=>fn());
  allImgs.forEach(img=>{ const orig=origSrcs.get(img); if(orig) img.src=orig; });
  el.style.width=prevW;el.style.height=prevH;el.style.aspectRatio=prevAR;
  el.style.position=prevPos;el.style.left=prevLeft;el.style.top=prevTop;
  if(preview){preview.style.display=prevPreviewD;preview.style.visibility=prevPreviewV;}
  // Re-render preview at normal (mobile-appropriate) size
  gen();

  return canvas;
}

async function downloadJPG(){
  gen();
  const btn=document.getElementById('pdf-btn');
  const origHTML=btn?btn.innerHTML:'';
  if(btn){btn.innerHTML='<span style="display:flex;align-items:center;gap:6px"><span style="width:12px;height:12px;border:2px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:spin .65s linear infinite;display:inline-block"></span> Generating…</span>';btn.disabled=true;}
  // ── Set button labels/actions based on device ────────────
  (function(){
    const isIOS2=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
    if(isIOS2){
      // iOS: PDF button becomes Share JPGs (no download API)
      const btn=document.getElementById('pdf-btn');
      const mBtn=document.getElementById('mob-pdf-btn');
      const lbl=document.getElementById('pdf-btn-label');
      const mLbl=document.getElementById('mob-pdf-btn-label');
      if(btn){btn.onclick=downloadJPG;btn.style.background='#1a1a1a';}
      if(mBtn){mBtn.onclick=downloadJPG;mBtn.style.background='#1a1a1a';}
      if(lbl)lbl.textContent='↑ Share';
      if(mLbl)mLbl.textContent='↑ Share';
      const tabLbl=document.getElementById('mob-tab-pdf-label');
      if(tabLbl)tabLbl.textContent='Share';
      const tabBtn=document.getElementById('mtab-print');
      if(tabBtn)tabBtn.onclick=downloadJPG;
    }
    // Remove stale btn_download_pdf i18n elements (now handled by #pdf-btn-label)
  })();
  const name=getExportName();


  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  const canShare = isIOS && navigator.share && navigator.canShare;

  try{
    // Render both slides
    const canvas1 = await slideToCanvas('slide');
    const canvas2 = await slideToCanvas('slide2');

    if(isIOS && navigator.share){
      // iOS: use Web Share API — opens native share sheet (Save to Photos, AirDrop, Messages…)
      // Convert canvases to Blobs
      const toBlob = (canvas) => new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.95));
      const [blob1, blob2] = await Promise.all([toBlob(canvas1), toBlob(canvas2)]);
      const file1 = new File([blob1], name+'-p1.jpg', {type:'image/jpeg'});
      const file2 = new File([blob2], name+'-p2.jpg', {type:'image/jpeg'});
      const shareData = {files:[file1,file2]};
      if(navigator.canShare && navigator.canShare(shareData)){
        await navigator.share(shareData);
      } else {
        // canShare failed — fallback to opening images in new tabs
        [canvas1,canvas2].forEach((cv,i)=>{
          const w=window.open('','_blank');
          if(w){ w.document.write('<img src="'+cv.toDataURL('image/jpeg',0.95)+'" style="max-width:100%">'); w.document.close(); }
        });
      }
    } else {
      // Desktop / Android: standard download
      const dl = (canvas, suffix) => {
        let jpgData;
        try{ jpgData=canvas.toDataURL('image/jpeg',0.95); }
        catch(e){
          const c2=document.createElement('canvas');c2.width=canvas.width;c2.height=canvas.height;
          c2.getContext('2d').drawImage(canvas,0,0);
          jpgData=c2.toDataURL('image/jpeg',0.95);
        }
        const a=document.createElement('a');
        a.href=jpgData;a.download=name+suffix+'.jpg';
        document.body.appendChild(a);a.click();document.body.removeChild(a);
      };
      dl(canvas1,'-p1');
      await new Promise(r=>setTimeout(r,400));
      dl(canvas2,'-p2');
    }
  }catch(err){
    console.error('JPG failed:',err);
    if(err.name==='AbortError') return; // user cancelled share — not an error
    alert('Export failed: '+err.message);
  }finally{
    if(btn){btn.innerHTML=origHTML;btn.disabled=false;}
  }
}
async function downloadPDF(){
  // Route through the browser's print system instead of jsPDF + html2canvas.
  // The print path renders the live DOM, so text stays as real PDF text
  // (selectable, copyable, searchable) and the smart layout adjustments —
  // the FEATURES density scale, font sizing, image cropping — all carry
  // through exactly as you see them on screen.
  //
  // printSlide() automatically routes to printQueue() when PDF_QUEUE.length > 0,
  // so this single delegation handles both single-card and queue cases.
  return printSlide();
}

// Legacy raster-PDF path kept for reference / fallback. Not wired to any
// button. To use: call downloadPDF_image() from the console. Produces a
// large image-only PDF where text is NOT selectable.
async function downloadPDF_image(){
  gen();
  const btn=document.getElementById('pdf-btn');
  const origHTML=btn?btn.innerHTML:'';
  if(btn){btn.innerHTML='<span style="display:flex;align-items:center;gap:6px"><span style="width:12px;height:12px;border:2px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:spin .65s linear infinite;display:inline-block"></span> Building PDF…</span>';btn.disabled=true;}

  const name = getExportName();

  try{
    const {jsPDF}=window.jspdf;
    const pdf=new jsPDF({orientation:'landscape',unit:'mm',format:'a4'});
    const cv1 = await slideToCanvas('slide');
    if(cv1) pdf.addImage(cv1.toDataURL('image/jpeg',0.92),'JPEG',0,0,297,210);
    const cv2 = await slideToCanvas('slide2');
    if(cv2){pdf.addPage();pdf.addImage(cv2.toDataURL('image/jpeg',0.92),'JPEG',0,0,297,210);}
    pdf.save(name+'.pdf');
  }catch(err){
    console.error('PDF failed:',err);
    alert('PDF failed: '+err.message);
  }finally{
    if(btn){btn.innerHTML=origHTML;btn.disabled=false;}
  }
}


// ── CUSTOM INFO BLOCK POSITION ───────────────────────────
function setCustomPos(pos){
  CUSTOM_POS=pos;
  document.getElementById('cpos-below')?.classList.toggle('on',pos==='below');
  document.getElementById('cpos-above')?.classList.toggle('on',pos==='above');
  gen();
}

const TRANSIT = IC.tr_metro; // backward compat alias

function icInner(id){
  const m=(renderIcHtml(id)||IC[id]||'')?.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
  return m?m[1]:'';
}

const ALL_ICONS_LIST = [...IC_LIST]; // CO icons appended after load

// ── DOWNLOAD LIB INDEX ───────────────────────────────────
function downloadLibIndex(){
  const lib=getLib();
  if(!lib.length){showStatus('Library is empty — upload JSON files first.','s-err');return;}
  const index=lib.map(p=>{
    const n=typeof p.name==='object'?(p.name.en||Object.values(p.name)[0]):(p.name||'location');
    return n.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')+'.json';
  });
  const blob=new Blob([JSON.stringify(index,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='index.json';a.click();
  URL.revokeObjectURL(a.href);
  showStatus('index.json downloaded — upload it to your json/ folder on the server.','s-ok');
}

// ── LEGACY PHOTO UPLOAD ──────────────────────────────────
function onPhotos(e){
  const files=Array.from(e.target.files).slice(0,3);
  files.forEach((f,i)=>{
    const r=new FileReader();
    r.onload=ev=>{S.photos[i]=ev.target.result;renderPhotoSlots();gen();};
    r.readAsDataURL(f);
  });
}
function rmPhoto(i){rmPhotoSlot(i);}

// ── CLICK-TO-EDIT: click any slide region → jump to tab & field ──
document.addEventListener('click',e=>{
  const el=e.target.closest('[data-edit]');
  if(!el)return;
  if(!el.closest('#slide,#slide2'))return;
  const[tab,fieldId]=(el.dataset.edit||'').split(':');
  if(!tab)return;
  openTab(tab);
  const panel=document.getElementById('p-'+tab);
  if(panel)panel.scrollTop=0;
  if(fieldId){
    setTimeout(()=>{
      const target=document.getElementById(fieldId);
      if(!target)return;
      target.scrollIntoView({behavior:'smooth',block:'center'});
      const flashEl=target.closest('.field')||target;
      flashEl.classList.remove('edit-flash');
      void flashEl.offsetWidth;
      flashEl.classList.add('edit-flash');
      if(target.tagName==='INPUT'||target.tagName==='TEXTAREA'||target.contentEditable==='true'){
        setTimeout(()=>target.focus(),300);
      }
    },120);
  }
});

// ── RICH EDITOR: controlled Enter key & clean paste ──────
document.addEventListener('keydown',e=>{
  const el=e.target;
  if(!el.isContentEditable)return;
  if(e.key==='Enter'&&!e.shiftKey){
    e.preventDefault();
    const sel=window.getSelection();
    if(!sel||!sel.rangeCount)return;
    const range=sel.getRangeAt(0);
    range.deleteContents();
    const br=document.createElement('br');
    range.insertNode(br);
    if(!br.nextSibling||(br.nextSibling.nodeType===3&&br.nextSibling.textContent==='')){
      const trail=document.createElement('br');
      br.parentNode.insertBefore(trail,br.nextSibling);
    }
    range.setStartAfter(br);range.collapse(true);
    sel.removeAllRanges();sel.addRange(range);
    if(typeof gen==='function')gen();
  }
});

document.addEventListener('paste',e=>{
  const el=e.target;
  if(!el.isContentEditable)return;
  e.preventDefault();
  const text=(e.clipboardData||window.clipboardData).getData('text/plain');
  if(!text)return;
  const sel=window.getSelection();
  if(!sel||!sel.rangeCount)return;
  const range=sel.getRangeAt(0);
  range.deleteContents();
  const lines=text.split(/\r?\n/);
  const frag=document.createDocumentFragment();
  lines.forEach((line,i)=>{if(i>0)frag.appendChild(document.createElement('br'));if(line)frag.appendChild(document.createTextNode(line));});
  range.insertNode(frag);range.collapse(false);
  sel.removeAllRanges();sel.addRange(range);
  if(el.classList.contains('tr-rich-editor')&&el.dataset.trId){updateTrHtml(el.dataset.trId,el);}
  if(typeof gen==='function')gen();
});

// ── MOBILE APP LOGIC ─────────────────────────────────────
function isMobile(){return window.innerWidth<=768;}
let _mobCurrentTab='loc';

function mobOpenTab(name){
  if(!isMobile())return;
  _mobCurrentTab=name;
  document.querySelectorAll('.mob-tab').forEach(b=>{
    b.classList.toggle('on',b.id==='mtab-'+name&&name!=='print');
  });
  document.querySelector('.sidebar').style.display='';
  document.querySelector('.preview').classList.add('mob-hidden');
  const fab=document.getElementById('mob-fab');
  if(fab)fab.style.display='flex';
  const bar=document.getElementById('mob-preview-bar');
  if(bar)bar.style.display='none';
  openTab(name);
}

function mobShowPreview(){
  if(!isMobile())return;
  gen();
  document.querySelector('.sidebar').style.display='none';
  document.querySelector('.preview').classList.remove('mob-hidden');
  const fab=document.getElementById('mob-fab');
  if(fab)fab.style.display='none';
  const bar=document.getElementById('mob-preview-bar');
  if(bar)bar.style.display='flex';
}

function mobBackToEdit(){
  document.querySelector('.sidebar').style.display='';
  document.querySelector('.preview').classList.add('mob-hidden');
  const fab=document.getElementById('mob-fab');
  if(fab)fab.style.display='flex';
  const bar=document.getElementById('mob-preview-bar');
  if(bar)bar.style.display='none';
  document.querySelectorAll('.mob-tab').forEach(b=>{
    b.classList.toggle('on',b.id==='mtab-'+_mobCurrentTab);
  });
}

window.addEventListener('resize',()=>{
  if(!isMobile()){
    document.querySelector('.sidebar').style.display='';
    document.querySelector('.preview').classList.remove('mob-hidden');
  } else {
    mobOpenTab(_mobCurrentTab);
  }
});


// ══════════════════════════════════════════════════════════════════════════
//  AUTOSAVE — saves proposal every 30s via setInterval.
//  Only saves when there's meaningful content (name, rows, or photos).
//  On page load, only shows restore banner if saved state has real content.
// ══════════════════════════════════════════════════════════════════════════
const _AS_KEY = 'co_proposal_autosave';

function _autosaveHasMeaningfulContent(){
  // Check if the current state is worth saving
  const hasName   = !!(COMPANY_NAME || CLIENT_NAME ||
    (LANG_DATA['en']?.fields?.['n-main']) ||
    document.getElementById('n-main')?.value?.trim());
  const hasRows   = S.rows && S.rows.length > 0;
  const hasPhotos = S.photos && S.photos.some(p => p);
  return hasName || hasRows || hasPhotos;
}

function _autosaveNow(){
  try{
    if(!_autosaveHasMeaningfulContent()) return; // don't save blank states
    const state = buildStateSnapshot();
    const lite = JSON.parse(JSON.stringify(state));
    delete lite.photos_data;
    lite._as_ts = Date.now();
    localStorage.setItem(_AS_KEY, JSON.stringify(lite));
    const el = document.getElementById('autosave-indicator');
    if(el){ el.classList.add('show'); clearTimeout(el._t); el._t=setTimeout(()=>el.classList.remove('show'),2200); }
  }catch(e){ /* quota exceeded or private browsing */ }
}

// Run autosave every 30 seconds — no need to hook gen()
setInterval(_autosaveNow, 30000);

function _autosaveCheck(){
  try{
    const raw = localStorage.getItem(_AS_KEY);
    if(!raw) return;
    const state = JSON.parse(raw);
    const ts = state._as_ts;
    if(!ts) return;
    // Only show restore banner if saved state has real content
    const hasContent = !!(
      state.company_name || state.client_name ||
      (state.langs?.en?.fields?.['n-main']) ||
      (state.langs?.en?.rows?.length > 0)
    );
    if(!hasContent) return;
    const mins = Math.round((Date.now()-ts)/60000);
    const label = mins<1?'just now': mins<60?`${mins} min ago`: mins<1440?`${Math.round(mins/60)}h ago`:'yesterday';
    const timeEl = document.getElementById('autosave-time');
    const banner = document.getElementById('autosave-banner');
    if(timeEl) timeEl.textContent = label;
    if(banner) banner.style.display = 'flex';
  }catch(e){}
}

function _autosaveRestore(){
  try{
    const raw = localStorage.getItem(_AS_KEY);
    if(!raw) return;
    const state = JSON.parse(raw);
    delete state._as_ts;
    restoreStateSnapshot(state);
    document.getElementById('autosave-banner').style.display='none';
    showStatus('Proposal restored from autosave','s-ok');
  }catch(e){
    showStatus('Could not restore — autosave data may be corrupted','s-warn');
  }
}

function _autosaveDismiss(){
  localStorage.removeItem(_AS_KEY);
  document.getElementById('autosave-banner').style.display='none';
}

// ── Keyboard shortcuts ────────────────────────────────────────────────────
// Cmd/Ctrl+S  → save JSON   Cmd/Ctrl+P → print/PDF   Cmd/Ctrl+Enter → gen()
document.addEventListener('keydown', e => {
  const tag = document.activeElement?.tagName?.toUpperCase();
  const inText = tag==='INPUT'||tag==='TEXTAREA'||document.activeElement?.isContentEditable;
  const ctrl = e.ctrlKey||e.metaKey;
  if(ctrl && e.key==='s'){ e.preventDefault(); if(typeof downloadCurrentJSON==='function') downloadCurrentJSON(); showStatus('Proposal saved ↓','s-ok'); }
  if(ctrl && e.key==='p'){ e.preventDefault(); if(typeof printSlide==='function') printSlide(); }
  if(ctrl && e.key==='Enter' && !inText){ e.preventDefault(); if(typeof gen==='function') gen(); }
});

// ── Drag-to-reorder pricing rows ─────────────────────────────────────────
let _dragRowIdx = null;
function _rowDragStart(e, idx){
  _dragRowIdx = idx;
  e.currentTarget.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}
function _rowDragOver(e, idx){
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  const midY = rect.top + rect.height/2;
  el.classList.remove('drag-over-top','drag-over-bot');
  el.classList.add(e.clientY < midY ? 'drag-over-top' : 'drag-over-bot');
}
function _rowDragLeave(e){
  e.currentTarget.classList.remove('drag-over-top','drag-over-bot');
}
function _rowDrop(e, idx){
  e.preventDefault();
  if(_dragRowIdx===null||_dragRowIdx===idx) return;
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  const insertBefore = e.clientY < rect.top + rect.height/2;
  const moved = S.rows.splice(_dragRowIdx, 1)[0];
  const target = insertBefore ? idx : idx;
  const insertIdx = _dragRowIdx < idx
    ? (insertBefore ? idx-1 : idx)
    : (insertBefore ? idx : idx+1);
  S.rows.splice(Math.max(0, insertIdx), 0, moved);
  _dragRowIdx = null;
  renderRows(); gen();
}
function _rowDragEnd(e){
  _dragRowIdx = null;
  document.querySelectorAll('.pr-row').forEach(r=>r.classList.remove('dragging','drag-over-top','drag-over-bot'));
}

// ── Mobile More Drawer ───────────────────────────────────────────────────
function openMobMore(){
  document.getElementById('mob-more-overlay')?.classList.add('open');
  document.getElementById('mob-more-drawer')?.classList.add('open');
  _mobSyncDrawerLang();
  // Populate proposal inputs from current globals
  const dco = document.getElementById('mob-co-input');
  const dcl = document.getElementById('mob-cl-input');
  if(dco) dco.value = COMPANY_NAME||'';
  if(dcl) dcl.value = CLIENT_NAME||'';
}
// Sync proposal field changes from drawer → globals → main strip inputs
function _mobPropSync(field, val){
  if(field==='co'){
    COMPANY_NAME = val;
    const el = document.getElementById('company-name');
    if(el) el.value = val;
  } else {
    CLIENT_NAME = val;
    const el = document.getElementById('client-name');
    if(el) el.value = val;
  }
  if(typeof _stripUpdatePreview==='function') _stripUpdatePreview();
  if(typeof gen==='function') clearTimeout(window._genTimer), window._genTimer=setTimeout(gen,800);
}
function closeMobMore(){
  document.getElementById('mob-more-overlay')?.classList.remove('open');
  document.getElementById('mob-more-drawer')?.classList.remove('open');
}
function _mobSyncDrawerLang(){
  const map = {'en':'mob-d-en','zh-hant':'mob-d-hant','zh-hans':'mob-d-hans','ja':'mob-d-ja'};
  Object.entries(map).forEach(([lc,id])=>{
    document.getElementById(id)?.classList.toggle('on', lc===LANG);
  });
}
function _mobUpdateLang(){
  // Sync drawer lang buttons + close drawer after language change
  _mobSyncDrawerLang();
  closeMobMore();
}

// ── Preview tab active state ──────────────────────────────────────────────
// When the user taps Preview tab, highlight it; when they go back, restore
const _origToggleMobilePreview = typeof toggleMobilePreview === 'function' ? toggleMobilePreview : null;
function toggleMobilePreview(){
  const preview = document.querySelector('.preview');
  const sidebar = document.querySelector('.sidebar');
  const btn = document.getElementById('mob-preview-btn');
  const tab = document.getElementById('mtab-preview');
  const isShowing = preview && !preview.classList.contains('mob-hidden');
  if(isShowing){
    preview?.classList.add('mob-hidden');
    if(sidebar) sidebar.style.display='';
    if(btn){ btn.classList.remove('showing'); btn.textContent='View Preview'; }
    if(tab) tab.classList.remove('on');
  } else {
    preview?.classList.remove('mob-hidden');
    if(sidebar) sidebar.style.display='none';
    if(btn){ btn.classList.add('showing'); btn.textContent='← Back to Edit'; }
    if(tab) tab.classList.add('on');
  }
}

// ── Collapsible proposal strip (mobile) ──────────────────────────────────
const _STRIP_KEY = 'co_strip_collapsed';
let _stripCollapsed = false;

function _stripInit(){
  // Only applies on mobile
  if(window.innerWidth > 768) return;
  _stripCollapsed = localStorage.getItem(_STRIP_KEY) === '1';
  _stripApply(false); // no animation on init
}

function _stripToggle(){
  if(window.innerWidth > 768) return;
  _stripCollapsed = !_stripCollapsed;
  try{ localStorage.setItem(_STRIP_KEY, _stripCollapsed ? '1' : '0'); }catch(e){}
  _stripApply(true);
}

function _stripApply(animate){
  const fields  = document.getElementById('strip-fields');
  const summary = document.getElementById('strip-summary');
  const toggle  = document.getElementById('strip-toggle');
  if(!fields) return;

  if(!animate) fields.style.transition = 'none';

  if(_stripCollapsed){
    // Measure current height then collapse to 0
    fields.style.maxHeight = fields.scrollHeight + 'px';
    requestAnimationFrame(()=>{
      if(!animate) fields.style.transition = 'none';
      fields.classList.add('collapsed');
      if(summary){ summary.style.display = 'block'; _stripUpdatePreview(); }
      if(toggle)  toggle.classList.add('collapsed');
    });
  } else {
    fields.style.maxHeight = fields.scrollHeight + 'px';
    fields.classList.remove('collapsed');
    if(summary) summary.style.display = 'none';
    if(toggle)  toggle.classList.remove('collapsed');
    // After animation, let it be auto height
    setTimeout(()=>{ fields.style.maxHeight = ''; }, animate ? 250 : 0);
  }

  if(!animate){
    requestAnimationFrame(()=>{ fields.style.transition = ''; });
  }
}

function _stripUpdatePreview(){
  const co = (document.getElementById('company-name')?.value||'').trim();
  const cl = (document.getElementById('client-name')?.value||'').trim();
  const summary = document.getElementById('strip-summary');
  if(!summary) return;
  if(!co && !cl){
    summary.innerHTML = '';
  } else {
    const parts = [co,cl].filter(Boolean);
    summary.innerHTML =
      '<span style="color:var(--xlt);font-size:11px;margin-right:5px;">For</span>' +
      parts.map(p=>`<strong style="color:var(--drk);font-size:12px;">${p}</strong>`)
           .join('<span style="color:var(--bd);margin:0 5px;">·</span>');
  }
  // Also sync drawer inputs if drawer exists
  const dco = document.getElementById('mob-co-input');
  const dcl = document.getElementById('mob-cl-input');
  if(dco) dco.value = co;
  if(dcl) dcl.value = cl;
}
