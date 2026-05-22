// Compass Offices One-Pager Builder
// https://github.com/compassoffices/compassoffices.github.io

function _validateImportedJson(p){
  if(!p || typeof p !== 'object') throw new Error('File is not a valid JSON object');
  // Must have at least one recognisable field
  const knownKeys = ['langs','name','address','rows','photos','floor','pricing_cols','fp_plans','office_lookup_region'];
  const hasKnown = knownKeys.some(k => k in p);
  if(!hasKnown) throw new Error('File does not appear to be a Compass Offices proposal');
  return true;
}
function loadJsonFiles(e){
  const files=Array.from(e.target.files).filter(f=>f.name.endsWith('.json'));
  if(!files.length)return;
  _ingestFiles(files);e.target.value='';
}
function _ingestFiles(files){
  const lib=getLib();let done=0,ok=0;
  files.forEach(file=>{
    const reader=new FileReader();
    reader.onload=ev=>{
      try{
        const data=JSON.parse(ev.target.result);
        // Derive the effective name: prefer explicit name field, fall back to
        // queue item names. This handles "queue-session" saves where the form
        // was empty (cleared after + Queue) but the queue contains real work.
        const explicitName = typeof data.name==='object' ? data.name.en : (data.name||'');
        const queueNames = Array.isArray(data.queue)
          ? data.queue.map(i => i.state?.langs?.en?.name || i.name || '').filter(Boolean)
          : [];
        const effectiveName = explicitName || queueNames.join(' + ');
        if(!effectiveName) throw new Error('Missing name');
        // Normalise the name field so library dedup and display work correctly
        if(!explicitName && queueNames.length) data.name = effectiveName;
        data._source='local';  // mark as locally inserted
        data._filename=file.name;
        const n=typeof data.name==='object'?data.name.en:data.name;
        // Deduplicate on name + floor together — same building different floor = different entry
        const floor=data.floor||data.langs?.en?.floor||'';
        const idx=lib.findIndex(l=>{
          const a=typeof l.name==='object'?l.name.en:l.name;
          const lFloor=l.floor||l.langs?.en?.floor||'';
          return a===n&&lFloor===floor;
        });
        if(idx>=0)lib[idx]=data;else lib.push(data);ok++;
      }catch(err){console.warn(file.name,err.message);}
      if(++done===files.length){saveLib(lib);showStatus(`${ok} of ${files.length} file${files.length>1?'s':''} loaded — library has ${lib.length} location${lib.length!==1?'s':''}.`,'s-ok');updateLibStatus();renderJsonDropdown(lib,document.getElementById('json-search').value);showJsonDropdown();}
    };
    reader.readAsText(file);
  });
}
async function reloadLibFromServer(){
  const btn=document.getElementById('lib-reload-btn');const svg=btn?.querySelector('svg');
  if(svg)svg.style.animation='spin .7s linear infinite';
  try{
    if(location.protocol==='file:'){showStatus('Reload only works when hosted on a server.','s-info');return;}
    const base=location.href.replace(/\/[^\/]*$/,'/');
    const idxRes=await fetch(base+'json/index.json',{cache:'no-cache'});
    if(!idxRes.ok){showStatus('No json/index.json found on server.','s-err');return;}
    const index=await idxRes.json();
    if(!Array.isArray(index)||!index.length){showStatus('json/index.json is empty.','s-info');return;}
    const lib=getLib();let added=0,updated=0;
    await Promise.all(index.map(async fn=>{
      try{const r=await fetch(base+'json/'+fn,{cache:'no-cache'});if(!r.ok)return;const data=await r.json();if(!data.name)return;const getName=d=>typeof d.name==='object'?(d.name.en||Object.values(d.name)[0]):d.name;const getFloor=d=>d.floor||d.langs?.en?.floor||'';const idx2=lib.findIndex(l=>getName(l)===getName(data)&&getFloor(l)===getFloor(data));if(idx2>=0){lib[idx2]=data;updated++;}else{lib.push(data);added++;}}catch{}
    }));
    saveLib(lib);renderJsonDropdown(lib,document.getElementById('json-search')?.value||'');updateLibStatus();showStatus('Reloaded — '+added+' new, '+updated+' updated.','s-ok');
  }catch(e){showStatus('Reload failed: '+e.message,'s-err');}
  finally{if(svg)svg.style.animation='';}
}
function clearJsonLib(){
  if(!confirm('Clear all saved locations from the library?'))return;
  localStorage.removeItem(LIB_KEY);
  _libCityFilter='';
  renderJsonDropdown([]);
  updateLibStatus();
  showStatus('Library cleared. Reloading from server…','s-info');
  // Auto-reload from server after clearing
  setTimeout(()=>reloadLibFromServer(),300);
}
function filterJsonLib(q){const lib=getLib();renderJsonDropdown(lib,q);showJsonDropdown();}

function removeLocalGroup(){
  let lib=getLib();
  lib=lib.filter(l=>l._source!=='local');
  saveLib(lib);
  renderJsonDropdown(lib,document.getElementById('json-search')?.value||'');
  updateLibStatus();
  showStatus('Inserted cards removed.','s-info');
}

// ── DRAG AND DROP for JSON files onto the library section ─────────────────
function initLibDragDrop(){
  const wrap=document.getElementById('lib-drop-zone');
  if(!wrap) return;
  ['dragenter','dragover'].forEach(ev=>wrap.addEventListener(ev,e=>{
    e.preventDefault();e.stopPropagation();
    wrap.classList.add('lib-drop-active');
  }));
  ['dragleave','dragend','drop'].forEach(ev=>wrap.addEventListener(ev,e=>{
    wrap.classList.remove('lib-drop-active');
  }));
  wrap.addEventListener('drop',e=>{
    e.preventDefault();e.stopPropagation();
    const files=Array.from(e.dataTransfer.files).filter(f=>f.name.endsWith('.json'));
    if(!files.length){showStatus('Drop JSON files here.','s-info');return;}
    _ingestFiles(files);
  });
}
function toggleSearchClear(val){
  const btn=document.getElementById('search-clear-btn');
  if(!btn)return;
  btn.style.display=val?'flex':'none';
}
function clearJsonSearch(){
  const inp=document.getElementById('json-search');
  if(inp){inp.value='';inp.focus();}
  toggleSearchClear('');
  filterJsonLib('');
}
let _libCityFilter='';
function renderJsonDropdown(lib,q=''){
  const dd=document.getElementById('json-dropdown');
  if(!dd) return;

  const filterItem=l=>{
    const name=(typeof l.name==='object'?(l.name.en||Object.values(l.name)[0]):l.name||'').toLowerCase();
    const city=(l.city||'').toLowerCase();
    const matchQ=!q||name.includes(q.toLowerCase())||city.includes(q.toLowerCase());
    const matchCity=!_libCityFilter||city===_libCityFilter.toLowerCase();
    return matchQ&&matchCity;
  };

  const buildCard=(l,realIdx)=>{
    const displayName=typeof l.name==='object'?(l.name[LANG]||l.name.en||Object.values(l.name)[0]):l.name;
    const slug=(typeof l.name==='object'?(l.name.en||Object.values(l.name)[0]):(l.name||'location')).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    const floorFromSlug=(slug.match(/_([^_]+)$/) || [])[1]||'';
    const floorRaw=l.floor||l.langs?.en?.floor||floorFromSlug||'';
    const floorDisplay=floorRaw.replace(/^(\d+)[Ff].*$/,'$1F').replace(/^([A-Z0-9-]+[Ff]).*$/,'$1')||floorRaw;
    const isLocal=l._source==='local';
    return`<div class="json-opt" onmousedown="loadFromLib(${realIdx})">
      <div style="display:flex;align-items:center;gap:6px;flex:1;min-width:0;overflow:hidden;">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;color:${isLocal?'var(--o)':'currentColor'}"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <div style="flex:1;min-width:0;overflow:hidden;">
          <div style="display:flex;align-items:center;gap:5px;overflow:hidden;">
            <span style="font-weight:600;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;">${displayName}</span>
            ${floorDisplay?`<span style="flex-shrink:0;font-size:10px;font-weight:700;color:var(--o);background:var(--olt);border:1px solid var(--o);border-radius:4px;padding:1px 5px;line-height:1.4;">${floorDisplay}</span>`:''}
            ${l.city?`<span class="json-city">${l.city}</span>`:''}
          </div>
          ${isLocal&&l._filename?`<div style="font-size:10px;color:var(--xlt);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:1px;">${l._filename}</div>`:''}
        </div>
      </div>
    </div>`;
  };

  const buildGroupHeader=(label,icon,count,key,color)=>{
    const collapsed=_libGroupCollapsed[key];
    return`<div style="display:flex;align-items:center;justify-content:space-between;padding:5px 10px 3px;background:var(--bg);border-bottom:1px solid var(--bd);position:sticky;top:0;z-index:2;">
      <div style="display:flex;align-items:center;gap:5px;">
        ${icon}
        <span style="font-size:9.5px;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:${color};">${label}</span>
        <span style="font-size:9.5px;color:var(--xlt);font-weight:500;">(${count})</span>
      </div>
      <button onmousedown="event.preventDefault();_libGroupCollapsed['${key}']=!_libGroupCollapsed['${key}'];renderJsonDropdown(getLib(),document.getElementById('json-search')?.value||'')"
        style="border:none;background:transparent;cursor:pointer;color:var(--xlt);font-size:11px;padding:2px 5px;border-radius:3px;font-family:inherit;">${collapsed?'▶':'▼'}</button>
    </div>`;
  };

  const serverItems=lib.map((l,i)=>({l,i})).filter(({l})=>l._source!=='local'&&filterItem(l));
  const localItems=lib.map((l,i)=>({l,i})).filter(({l})=>l._source==='local'&&filterItem(l));

  if(!serverItems.length&&!localItems.length){
    dd.innerHTML=`<div class="json-opt" style="color:var(--xlt);cursor:default;font-size:12px;">${lib.length?'No matches':'No locations yet — upload JSON files or drag & drop them here'}</div>`;
    renderCityChips(lib);return;
  }

  let html='<div style="display:flex;align-items:center;justify-content:flex-end;padding:4px 8px 2px;border-bottom:1px solid var(--bd);background:var(--bg);position:sticky;top:0;z-index:3;">'
    +'<button onmousedown="event.preventDefault();hideJsonDropdown()" style="border:none;background:transparent;cursor:pointer;color:var(--xlt);font-size:13px;padding:2px 4px;border-radius:4px;line-height:1;display:flex;align-items:center;gap:3px;font-family:inherit;font-weight:600;" onmouseover="this.style.color=\'var(--drk)\'" onmouseout="this.style.color=\'var(--xlt)\'">'
    +'<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Close'
    +'</button></div>';

  // ── Saved Proposals (locally-inserted) first — most immediately relevant ──
  if(localItems.length){
    const icon=`<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color:var(--o)"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;
    html+=buildGroupHeader('Saved Proposals',icon,localItems.length,'local','var(--o)');
    if(!_libGroupCollapsed.local) html+=localItems.map(({l,i})=>buildCard(l,i)).join('');
    html+=`<div style="padding:5px 10px 7px;border-top:1px solid var(--bd);background:var(--bg);">
      <button onmousedown="event.preventDefault();removeLocalGroup()" style="width:100%;padding:4px;border:1px solid var(--bd);border-radius:5px;background:transparent;color:var(--xlt);font-size:11px;font-weight:600;font-family:inherit;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:4px;" onmouseover="this.style.borderColor='#dc2626';this.style.color='#dc2626'" onmouseout="this.style.borderColor='var(--bd)';this.style.color='var(--xlt)'">
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        Remove saved proposals
      </button>
    </div>`;
  }

  // ── Server Library second ──
  if(serverItems.length){
    const icon=`<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`;
    html+=buildGroupHeader('Server Library',icon,serverItems.length,'server','var(--mid)');
    if(!_libGroupCollapsed.server) html+=serverItems.map(({l,i})=>buildCard(l,i)).join('');
  }

  dd.innerHTML=html;
  renderCityChips(lib);
}
function renderCityChips(lib){
  const el=document.getElementById('lib-city-chips');if(!el)return;
  const cities=[...new Set(lib.map(l=>(l.city||'').trim()).filter(Boolean))].sort();
  if(cities.length<=1){el.style.display='none';return;}
  el.style.display='flex';
  el.innerHTML=cities.map(city=>`<button class="lib-city-chip${_libCityFilter===city?' on':''}" onclick="setLibCityFilter('${city.replace(/'/g,"\\'")}')">${city}</button>`).join('');
}
function setLibCityFilter(city){_libCityFilter=(_libCityFilter===city)?'':city;const lib=getLib();renderJsonDropdown(lib,document.getElementById('json-search').value);showJsonDropdown();}
function showCityDropdown(q){filterCityDropdown(q);document.getElementById('city-dropdown').classList.add('open');}
function hideCityDropdown(){document.getElementById('city-dropdown').classList.remove('open');}
function filterCityDropdown(q){
  const dd=document.getElementById('city-dropdown');if(!dd)return;
  const filtered=CO_CITIES.filter(c=>!q||c.toLowerCase().includes(q.toLowerCase()));
  dd.innerHTML=filtered.map(city=>`<div class="city-opt" onmousedown="selectCity('${city}')">${city}</div>`).join('')||'<div class="city-opt" style="color:var(--xlt);cursor:default">No matches</div>';
}
function selectCity(city){const inp=document.getElementById('city');if(inp)inp.value=city;hideCityDropdown();gen();}
let _cityFocusIdx=-1;
function cityKeyNav(e){
  const dd=document.getElementById('city-dropdown');const opts=dd?.querySelectorAll('.city-opt')||[];
  if(e.key==='ArrowDown'){e.preventDefault();_cityFocusIdx=Math.min(_cityFocusIdx+1,opts.length-1);opts.forEach((o,i)=>o.classList.toggle('focused',i===_cityFocusIdx));}
  else if(e.key==='ArrowUp'){e.preventDefault();_cityFocusIdx=Math.max(_cityFocusIdx-1,0);opts.forEach((o,i)=>o.classList.toggle('focused',i===_cityFocusIdx));}
  else if(e.key==='Enter'&&_cityFocusIdx>=0){e.preventDefault();opts[_cityFocusIdx]?.dispatchEvent(new MouseEvent('mousedown'));}
  else if(e.key==='Escape'){hideCityDropdown();}
  else{_cityFocusIdx=-1;}
}
function showJsonDropdown(){
  const lib=getLib();
  renderJsonDropdown(lib,document.getElementById('json-search').value);
  document.getElementById('json-dropdown').classList.add('open');
  // Close when clicking outside
  setTimeout(()=>{
    document.removeEventListener('pointerdown',_hideDropdownOutside);
    document.addEventListener('pointerdown',_hideDropdownOutside);
  },50);
}
function hideJsonDropdown(){
  document.getElementById('json-dropdown').classList.remove('open');
  document.removeEventListener('pointerdown',_hideDropdownOutside);
}
function _hideDropdownOutside(e){
  const dd=document.getElementById('json-dropdown');
  const wrap=document.getElementById('json-search')?.closest('.json-search-wrap');
  if(!dd||!wrap) return;
  if(!dd.contains(e.target)&&!wrap.contains(e.target)){
    hideJsonDropdown();
  }
}
let LAST_LOCATION=null;
function loadFromLib(idx){
  const lib=getLib();const p=lib[idx];if(!p)return;
  try{ _validateImportedJson(p); }catch(ve){
    showStatus(`Import failed: ${ve.message}`,'s-warn'); return;
  }
  LAST_LOCATION=p;applyLocationData(p);
  const displayName=typeof p.name==='object'?(p.name.en||Object.values(p.name)[0]):p.name;
  document.getElementById('json-search').value=displayName;
  hideJsonDropdown();showStatus(`"${displayName}" loaded from library.`,'s-ok');updateLoadedCardPanel(p);gen();
  // Auto-sync AUS Office Lookup if it's an AUS centre (skip if called from _ausLoadCard to prevent loops)
  if(!_ausLoadingCard){
    const matchedCentre = ausCentreForCardName(displayName, p);
    if(matchedCentre){
      AUS_CENTRE_FILTER = matchedCentre;
      // Clear any previous floor filter when switching centres via library
      const si=document.getElementById('aus-search');
      if(si) si.value='';
      renderCentreChips(); // re-renders chips with the new "on" state
      // Use setTimeout to defer renderAusLookup so loadFromLib completes first
      setTimeout(()=>renderAusLookup(), 0);
    }
  }
  // ── Queue file loaded → auto Start a New Proposal ────────────────────────
  // The user's work is now in the queue panel. Reset the form to a blank slate
  // so they're ready to build the next proposal.
  // Single-proposal files: leave the form filled so the user can view/edit.
  if(Array.isArray(p.queue) && p.queue.length && !_ausLoadingCard){
    if(typeof _resetCardForNewProposal === 'function') _resetCardForNewProposal();
  }
}
function applyLocationData(p){
  const r=v=>{if(v&&typeof v==='object'&&!Array.isArray(v)){return v[LANG]||v.en||v['zh-hant']||v['zh-hans']||v.ja||'';}return v||'';};

  // ── If the JSON has per-language data (new format), load all langs ────────
  if(p.langs && typeof p.langs === 'object'){
    LANG_KEYS.forEach(lc => {
      const ld = p.langs[lc];
      if(!ld) return;
      // Build a LANG_DATA-compatible object
      const langEntry = {
        fields: {
          'n-main':       ld.name        || '',
          'addr':         ld.address     || '',
          'floor':        ld.floor       || '',
          'city':         ld.city        || '',
          'purl':         ld.page_url    || '',
          'matterport':   ld.virtual_tour || ld.matterport || '',
          'custom-title': ld.custom_title|| '',
        },
        richFields: {
          's-struct': (ld.specs?.structure    || ''),
          's-comp':   (ld.specs?.completion   || ''),
          's-ceil':   (ld.specs?.ceiling      || ''),
          's-fa':     (ld.specs?.floor_area   || ''),
          's-ca':     (ld.specs?.common_area  || ''),
          's-oa':     (ld.specs?.oa           || ''),
          's-el':     (ld.specs?.elevators    || ''),
          's-ac':     (ld.specs?.ac           || ''),
          's-net':    (ld.specs?.network      || ''),
          's-fac':    (ld.specs?.facilities   || ''),
          's-hrs':    (ld.specs?.hours        || ''),
          's-park':   (ld.specs?.parking      || ''),
        },
        customBody: ld.custom_body || '',
        transport: (ld.transport||[]).map((t,i)=>({id:_trId(),iconId:t.iconId||'tr_metro',text:t.text||''})),
        rows: (ld.pricing||[]).map(row=>{
          // Preserve all keys (including custom_X) — strip any stale id from
          // saved data and assign a fresh runtime id.
          const {id, ...rest} = row;
          return {
            id: Date.now()+Math.random(),
            seats: rest.seats || '',
            type:  rest.type  || '',
            rent:  rest.rent  || '',
            mgmt:  rest.mgmt  || '',
            init:  rest.init  || '',
            avail: rest.avail || '',
            ...rest,
          };
        }),
        benefits: (ld.benefits||[]).map(b=>({...b})),
        // benefits_title handled globally below
        amenities: AMENITY_ICONS.map(a=> p.amenities ? p.amenities.includes(a.id) : a.on),
        benPos: p.benefits_pos || BENEFITS_POS,
        customPos: p.custom_pos || CUSTOM_POS,
      };
      // If benefits not per-lang, copy current
      if(!ld.benefits && p.benefits_on){
        langEntry.benefits = BENEFITS.map(b=>({...b, on:p.benefits_on.includes(b.id)}));
      }
      LANG_DATA[lc] = langEntry;
    });
    // Load per-lang benefits titles
    LANG_KEYS.forEach(lc=>{
      const ld2=p.langs[lc];
      if(ld2&&ld2.benefits_title!==undefined) BENEFITS_TITLE[lc]=ld2.benefits_title||'';
      if(ld2&&ld2.deposit_note!==undefined)   DEPOSIT_NOTE[lc]  =ld2.deposit_note||'';
    });
    const bTitleInp=document.getElementById('benefits-title-input');
    if(bTitleInp) bTitleInp.value=BENEFITS_TITLE[LANG]||'';
    // Load the current language's data into the UI
    loadLangData(LANG);
  } else {
    // ── Legacy single-lang format — load as before ─────────────────────────
    const sv=(id,v)=>{const val=r(v);if(val){const el=document.getElementById(id);if(el)el.value=val;}};
    sv('n-main',p.name);sv('addr',p.address);sv('floor',p.floor);sv('purl',p.page_url||p.url||'');
    sv('matterport',p.virtual_tour||p.matterport||'');
    const cityVal=r(p.city);
    if(cityVal){const inp=document.getElementById('city');if(inp)inp.value=cityVal;}
    const trRaw=p.transport||[p.transport1,p.transport2].filter(Boolean);
    const trArr=Array.isArray(trRaw)?trRaw:(trRaw[LANG]||trRaw.en||trRaw.ja||[]);
    if(trArr.length){initTransport(trArr);renderTransport();}
    const sp=p.specs||{};
    const svr=(id,v)=>{const val=r(v);if(val){const el=document.getElementById(id);if(el){if(SPEC_RICH_IDS.includes(id))el.innerHTML=val;else el.value=val;}}};
    svr('s-struct',sp.structure||p.structure);svr('s-comp',sp.completion||p.completion);svr('s-ceil',sp.ceiling||p.ceiling);
    svr('s-fa',sp.floor_area||p.floor_area);svr('s-ca',sp.common_area||p.common_area);svr('s-oa',sp.oa||p.oa);
    svr('s-el',sp.elevators||p.elevators);svr('s-ac',sp.ac||p.ac);svr('s-net',sp.network||p.network);
    svr('s-fac',sp.facilities||p.facilities);svr('s-hrs',sp.hours||p.hours);svr('s-park',sp.parking||p.parking);
    sv('custom-title',p.custom_title);
    const customBodyVal=r(p.custom_body);
    if(customBodyVal){const cbe=document.getElementById('custom-body-editor');if(cbe)cbe.innerHTML=customBodyVal;const cbh=document.getElementById('custom-body');if(cbh)cbh.value=customBodyVal;}
    if(p.pricing?.length){
      S.rows=[];
      p.pricing.filter(row=>row.seats||row.rent).forEach(row=>{
        addRow(r(row.seats)||'',r(row.type)||'',r(row.rent)||'',r(row.mgmt)||'',r(row.init)||'',r(row.avail||row.available)||'');
        // Copy any custom column values into the newly-added row (last entry)
        const last = S.rows[S.rows.length-1];
        Object.entries(row).forEach(([k,v])=>{
          if(['id','seats','type','rent','mgmt','init','avail','available'].includes(k)) return;
          last[k] = r(v) || '';
        });
      });
    }
  }
  if(p.partner_logo_url){S.partnerLogo=p.partner_logo_url;renderLogoCard();}
  if(p.logo_separator&&['x','bar','none'].includes(p.logo_separator)){setSep(p.logo_separator);}
  if(p.amenities){AMENITY_ICONS.forEach(a=>{a.on=p.amenities.includes(a.id);});renderAmenities();}
  if(p.benefits_on){BENEFITS.forEach(b=>{b.on=p.benefits_on.includes(b.id);});renderBenefits();}
  if(p.photos?.length){S.photos=[null,null,null,null,null,null];p.photos.slice(0,6).forEach((url,i)=>{S.photos[i]=url;});renderPhotoSlots();}
  if(p.fp_plans&&Array.isArray(p.fp_plans)&&p.fp_plans.length){
    FP_PLANS=p.fp_plans.filter(p=>p.url).map(p=>({url:p.url,label:p.label||''}));
    FP_PAGE2_SAME=p.fp_page2_same!==false;
    FP_PAGE1_IDX=p.fp_page1_idx!==undefined?p.fp_page1_idx:-2;
    FP_PAGE2_IDX=p.fp_page2_idx!==undefined?p.fp_page2_idx:0;
    FP_BASE_URL=p.fp_base_url||'';
    FP_DATA_URL=p.fp_data_url||'';
    S.floorplan=FP_PLANS[0]?.url||null;
    const bInp=document.getElementById('fp-base-url');if(bInp)bInp.value=FP_BASE_URL;
    const dInp=document.getElementById('fp-data-url');if(dInp)dInp.value=FP_DATA_URL;
    setFpPage2Same(FP_PAGE2_SAME);
    renderFpList();
    // Restore manual highlight additions
    FP_HIGHLIGHTS_MANUAL = new Set(Array.isArray(p.fp_highlights_manual) ? p.fp_highlights_manual : []);
    // ── Restore Office Lookup region + centre filter ──
    // If the region differs from what's currently loaded, fetch the region's
    // CSV (assuming the master sheet has already been loaded). Otherwise
    // just re-apply the centre filter to the current data.
    // _savedSel mirrors restoreStateSnapshot — captured up front, applied
    // in whichever branch fires so the office checkboxes always reflect
    // the card's selection regardless of fetch timing.
    const _savedSel = Array.isArray(p.aus_selected) ? p.aus_selected : [];
    if(p.office_lookup_region){
      if(AX_REGIONS_LOADED && AX_REGIONS[p.office_lookup_region] && p.office_lookup_region !== AX_REGION){
        setAxRegion(p.office_lookup_region, /*skipReset=*/true, /*skipPreset=*/true).then(()=>{
          AUS_CENTRE_FILTER = p.office_lookup_centre || '';
          AUS_SELECTED = new Set(_savedSel);
          renderCentreChips();
          renderAusLookup();
        });
      } else {
        AX_REGION = p.office_lookup_region;
        AUS_CENTRE_FILTER = p.office_lookup_centre || '';
        AUS_SELECTED = new Set(_savedSel);
        renderRegionChips();
        renderCentreChips();
        renderAusLookup();
      }
    } else {
      AUS_SELECTED.clear();
      renderAusLookup();
    }
    // Reset highlight state and re-fetch polygon data for the new base
    FP_MASTER_DATA = null;
    FP_HAS_3D = false;
    if(typeof _renderFp3DToggle === 'function') _renderFp3DToggle();
    FP_HIGHLIGHT_RENDER_URL = null;
    FP_HIGHLIGHT_LAST_KEY = null;
    FP_DATA_LAST_FETCHED_BASE = '';
    if(fpEffectiveDataUrl()) tryFetchFpData(true, true);
    else updateFpDataStatusUI();
  } else if(p.floorplan_url){
    S.floorplan=p.floorplan_url;
    FP_PLANS=[{url:p.floorplan_url,label:'master'}];
    FP_BASE_URL=p.floorplan_url.replace(/[^/]+\.(jpg|jpeg|png)$/i,'');
    renderFpList();
  }
  // ── Restore all layout settings ──
  if(p.benefits_pos)setBenPos(p.benefits_pos);
  if(p.benefits_title&&typeof p.benefits_title==='object'){Object.assign(BENEFITS_TITLE,p.benefits_title);const bi=document.getElementById('benefits-title-input');if(bi)bi.value=BENEFITS_TITLE[LANG]||'';}
  if(p.deposit_note&&typeof p.deposit_note==='object'){Object.assign(DEPOSIT_NOTE,p.deposit_note);}
  syncDepositNoteInput();
  // Restore the two on/off toggles + the discount value
  if(typeof p.deposit_note_on === 'boolean'){
    DEPOSIT_NOTE_ON = p.deposit_note_on;
    const btn = document.getElementById('deposit-note-toggle');
    if(btn) btn.classList.toggle('on', DEPOSIT_NOTE_ON);
    const inp = document.getElementById('deposit-note-input');
    if(inp){ inp.style.opacity = DEPOSIT_NOTE_ON ? '1' : '.4'; inp.disabled = !DEPOSIT_NOTE_ON; }
  }
  if(typeof p.base_discount_on === 'boolean'){
    BASE_DISCOUNT_ON = p.base_discount_on;
    const btn = document.getElementById('base-discount-toggle');
    if(btn) btn.classList.toggle('on', BASE_DISCOUNT_ON);
    const inp = document.getElementById('aus-discount');
    if(inp){ inp.style.opacity = BASE_DISCOUNT_ON ? '1' : '.4'; inp.disabled = !BASE_DISCOUNT_ON; }
  }
  if(typeof p.base_discount === 'number'){
    AUS_DISCOUNT = p.base_discount;
    const inp = document.getElementById('aus-discount');
    if(inp) inp.value = AUS_DISCOUNT;
  }
  // Restore the 2D/3D floor-plan preference. The probe fires later when
  // FP_MASTER_DATA loads — if the 3D file is missing, _renderFp3DToggle
  // auto-flips this back to false. If present, the slide renders with
  // the user's saved choice.
  if(typeof p.fp_use_3d === 'boolean') FP_USE_3D = p.fp_use_3d;
  if(typeof p.fp_use_local === 'boolean') FP_USE_LOCAL = p.fp_use_local;
  if(p.fp_p2_custom_url !== undefined){ FP_P2_CUSTOM_URL = p.fp_p2_custom_url||null; if(typeof renderFpP2Slot==='function') renderFpP2Slot(); }
  if(p.fp_annotations) FP_ANNOTATIONS = p.fp_annotations; else FP_ANNOTATIONS = {};
  if(typeof p.compass_on === 'boolean'){ COMPASS_ON = p.compass_on; }
  if(typeof p.compass_angle === 'number'){ COMPASS_ANGLE = Math.round(((p.compass_angle%360)+360)%360); }
  if(typeof _renderCompassControl === 'function') _renderCompassControl();
  if(typeof p.client_name === 'string'){
    CLIENT_NAME = p.client_name;
    const el = document.getElementById('client-name'); if(el) el.value = CLIENT_NAME;
  }
  if(typeof p.company_name === 'string'){
    COMPANY_NAME = p.company_name;
    const el = document.getElementById('company-name'); if(el) el.value = COMPANY_NAME;
  }
  if(p.custom_pos)setCustomPos(p.custom_pos);
  if(p.show_specs===false&&SHOW_SPECS)toggleShowSpecs();
  else if(p.show_specs===true&&!SHOW_SPECS)toggleShowSpecs();
  if(p.hidden_specs&&Array.isArray(p.hidden_specs)){
    // Clear all first, then apply saved set
    HIDDEN_SPECS.clear();
    p.hidden_specs.forEach(id=>{
      HIDDEN_SPECS.add(id);
      const field=document.getElementById(id)?.closest('.field');
      if(field)field.classList.add('spec-field-hidden');
      document.querySelectorAll(`.spec-hide-btn[onclick*="'${id}'"]`).forEach(btn=>{
        btn.title='Show on slide';btn.style.color='var(--o)';
        btn.innerHTML='<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> show';
      });
    });
  }
  if(p.pricing_cols&&Array.isArray(p.pricing_cols)){
    // Strip any existing custom columns first so loads are deterministic.
    PRICING_COLS = PRICING_COLS.filter(c => !c.custom);
    p.pricing_cols.forEach(pc=>{
      const col = PRICING_COLS.find(c=>c.key===pc.key);
      if(col){
        // Existing built-in column → update on/labels
        col.on = pc.on!==false;
        if(pc.labels && typeof pc.labels==='object') Object.assign(col.labels, pc.labels);
        else if(pc.label) col.labels[LANG] = pc.label;
      } else if(pc.custom || !PRICING_COLS_BUILTIN.includes(pc.key)){
        // Custom column from saved JSON → re-create it
        PRICING_COLS.push({
          key: pc.key,
          on: pc.on!==false,
          custom: true,
          labels: pc.labels && typeof pc.labels==='object'
            ? {'en':'','zh-hant':'','zh-hans':'','ja':'', ...pc.labels}
            : {'en': pc.label||'Column','zh-hant':'','zh-hans':'','ja':''},
        });
      }
    });
    renderPricingColSettings();
  }
  if(p.icon_overrides&&typeof p.icon_overrides==='object'){window.ICON_OVERRIDES={...p.icon_overrides};}
  // ── Restore PDF queue from saved card ─────────────────────────────────────
  // Saved queues carry only {name, thumb, state} per item; cv1/cv2 are
  // regenerated lazily at export time by the text-PDF re-render path.
  //
  // TWO GUARDS:
  // 1. Skip if the saved queue is empty — an empty array here would WIPE the
  //    user's current in-memory queue (the original bug: a library card saved
  //    with no queue items had `queue: []` baked in, and picking an office in
  //    Office Lookup auto-loaded that card and erased everything queued).
  // 2. Skip if this load is an Office Lookup auto-load (the `_ausLoadingCard`
  //    flag). When a user picks an office mid-workflow they want the office's
  //    template data, not whoever's stale queue was saved with that card.
  // Explicit clicks (Save Card → re-import; library panel click) without the
  // auto-load flag still restore a populated queue, so the round-trip works.
  const _isAutoLoad = (typeof _ausLoadingCard !== 'undefined') && _ausLoadingCard;
  if(Array.isArray(p.queue) && p.queue.length && !_isAutoLoad){
    PDF_QUEUE = p.queue.map(item => ({
      name: item.name || '',
      thumb: item.thumb || '',
      cv1DataUrl: '',   // re-rendered at PDF export
      cv2DataUrl: '',
      state: item.state || {},
    }));
    updateQueueBadge();
    renderQueueList();
    // Queue-session save: form is empty but queue has the real work.
    // Auto-open the queue panel so the user immediately sees their proposals,
    // and show a clear status so they know what was restored.
    if(p._queue_session || !p.name){
      const panel = document.getElementById('queue-panel');
      if(panel) panel.style.display = 'flex';
      const n = PDF_QUEUE.length;
      showStatus(
        `Loaded ${n} queued proposal${n!==1?'s':''} — click any thumbnail to re-edit, or ${typeof ui==='function'?ui('queue_export_all'):'Export All PDF'} to print.`,
        's-ok'
      );
    }
  }
  // Save the loaded data into current lang slot so it persists on lang switch
  saveLangData(LANG);
  // Auto-switch layout: if loaded card has specs, switch to Classic; if none, stay/go Auto
  setTimeout(()=>{ if(BENEFITS_POS==='auto') onSpecInput(); }, 50);
}

// ── HELPERS ──────────────────────────────────────────────
const SPEC_RICH_IDS=['s-struct','s-comp','s-ceil','s-fa','s-ca','s-oa','s-el','s-ac','s-net','s-fac','s-hrs','s-park'];
const g=id=>{
  const el=document.getElementById(id);if(!el)return'';
  if(SPEC_RICH_IDS.includes(id)){let html=(el.innerHTML||'').trim();if(html==='<br>'||html==='')return'';html=html.replace(/<div><br><\/div>/gi,' ').replace(/<div>([\s\S]*?)<\/div>/gi,' $1');html=html.replace(/^<br>|<br>$/gi,'').trim();return html;}
  return(el.value||'').trim();
};
function onSpecInput(){
  // Auto-switch: if user types spec content while on Auto, switch to Classic
  if(BENEFITS_POS==='auto'){
    // Check if any spec field now has content
    const hasSpecContent = SPEC_RICH_IDS.some(id=>{
      if(HIDDEN_SPECS.has(id)) return false;
      const el=document.getElementById(id);
      if(!el) return false;
      const text=(el.innerHTML||'').replace(/<[^>]*>/g,'').replace(/&nbsp;/g,' ').trim();
      return text.length > 0;
    });
    if(hasSpecContent) setBenPos('right'); // silently switch to Classic
  }
  genDebounced(500);
}

function checkAutoLayout(){
  // Called after hiding/showing specs — if all specs hidden or empty and on Classic, switch back to Auto
  if(BENEFITS_POS==='right'){
    const hasVisibleSpec = SPEC_RICH_IDS.some(id=>{
      if(HIDDEN_SPECS.has(id)) return false;
      const el=document.getElementById(id);
      if(!el) return false;
      const text=(el.innerHTML||'').replace(/<[^>]*>/g,'').replace(/&nbsp;/g,' ').trim();
      return text.length > 0;
    });
    if(!hasVisibleSpec) setBenPos('auto');
  }
}

// ══════════════════════════════════════════════════════════
//  GENERATE SLIDES
// ══════════════════════════════════════════════════════════
