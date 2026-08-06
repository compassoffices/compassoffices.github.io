// ══════════════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════════════
(async function(){
  await loadCoIcons();
  initBenefits(LANG);
  renderBenefits();
  renderAmenities();
  renderRows();
  renderPricingColSettings();
  renderPhotoSlots();
  renderFpList();
  renderLogoCard();
  renderFloorplanCard();
  applyI18n();
  renderJsonDropdown(getLib());
  updateLibStatus();
  initLibDragDrop();
  renderAusLookup();
  // Auto-fetch AUS sheet if URL is saved
  if(AUS_SHEET_URL) ausFetchSheet(AUS_SHEET_URL);

  // On every page load: clear server library cards and reload fresh from server.
  // This ensures the latest JSON cards are always shown.
  // Locally-inserted cards (_source:'local') are preserved.
  if(location.protocol!=='file:'){
    try{
      // Remove only server-sourced cards, keep locally inserted ones
      const lib=getLib();
      const localOnly=lib.filter(l=>l._source==='local');
      saveLib(localOnly);
      renderJsonDropdown(localOnly);
      updateLibStatus();
      // Now reload all from server fresh
      await reloadLibFromServer();
    } catch(e){
      console.warn('Init library reload failed:', e);
    }
  }

  // Add default transport lines with text
  addTransport('MTR Central Station — direct access','tr_metro');
  addTransport('Central Ferry Piers — 3 min walk','tr_ferry');
  // Save initial EN state so switching back to EN restores it
  // (done after a short delay so all DOM is ready)
  setTimeout(()=>saveLangData('en'), 100);

  // Click-to-edit specs
  document.querySelectorAll('.spec-rich-editor').forEach(el=>{
    el.addEventListener('focus',()=>{
      if(!el.textContent.trim()&&!el.innerHTML.trim()){el.innerHTML='';}
    });
  });

  // Keyboard shortcut: Ctrl/Cmd+P → print
  document.addEventListener('keydown',e=>{
    if((e.ctrlKey||e.metaKey)&&e.key==='p'){e.preventDefault();printSlide();}
  });

  // Mobile init
  if(window.innerWidth<=768){
    const preview=document.querySelector('.preview');
    if(preview)preview.classList.add('mob-hidden');
    setTimeout(()=>{ mobOpenTab('loc'); setTimeout(gen,300); },100);
  }

  gen();
  // Ensure photo slots reflect current S.photos state after full render
  setTimeout(renderPhotoSlots, 50);
})();


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
  S.rows=[];S.photos=[null,null,null,null,null,null];S.floorplan=null;S.partnerLogo=null;EXTRA_MASTERS=[];renderExtraMasters();
  TRANSPORT=[];
  renderRows();renderPhotoSlots();renderFloorplanCard();renderLogoCard();renderTransport();
  showStatus('Card cleared.','s-info');
  gen();
}

