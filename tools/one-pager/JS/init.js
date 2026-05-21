// Compass Offices One-Pager Builder
// https://github.com/compassoffices/compassoffices.github.io

// Boot sequence — loads LAST after all other JS files

(async function(){
  await loadCoIcons();
  initBenefits(LANG);
  renderBenefits();
  renderAmenities();
  renderRows();
  renderPricingColSettings();
  syncDepositNoteInput();
  renderPhotoSlots();
  renderFpList();
  renderLogoCard();
  renderFloorplanCard();
  applyI18n();
  renderJsonDropdown(getLib());
  updateLibStatus();
  initLibDragDrop();
  renderAusLookup();
  renderContactPage(); // update "Let's talk" heading for new language
  // Auto-fetch the region index (master sheet) → populates region chips →
  // loads the first region (or the saved region if one was restored).
  fetchAxRegions();

  // Load staff profile from localStorage — sets up Page 3 "Let's talk"
  loadStaffProfile();
  _autosaveCheck(); if(typeof _mobUpdateLang==="function") _mobUpdateLang(); if(typeof _stripInit==="function") _stripInit(); if(typeof _stripUpdatePreview==="function") _stripUpdatePreview();

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
})();

