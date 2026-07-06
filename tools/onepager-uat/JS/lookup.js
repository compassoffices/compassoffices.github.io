// Compass Offices One-Pager Builder
// https://github.com/compassoffices/compassoffices.github.io

let AUS_OFFICES = {}; // always loaded from Google Sheet
let AUS_DISCOUNT = 30;       // Base Discount %
let BASE_DISCOUNT_ON = true; // toggle: apply Base Discount in ausCalc
let DEPOSIT_NOTE_ON  = true; // toggle: render deposit/tax note below pricing
let HOUSE_RULES_ON   = true; // toggle: render clickable House Rules link in slide footer
const HOUSE_RULES_URL_BASE = 'https://www.compassoffices.com/house-rules/';
const AUS_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRd-V3Vpc_MDnb2D40okL0DMH9nz3CWNyC1RZUx1qXTw9AbCIiGr5_LvgKHLe42txC2LHh3ABiGsATv/pub?gid=0&single=true&output=csv';
let _AUS_MONTHS = []; // detected month columns e.g. ['May-2026','Jun-2026',...]
let _AUS_MONTH_FILTER = ''; // selected month filter e.g. 'Jun-2026'
function _rebuildMonthFilter(){
  const sel=document.getElementById('aus-month-filter');
  if(!sel) return;
  const cur=sel.value;
  sel.innerHTML='<option value="">Any month available</option>'
    +(_AUS_MONTHS.map(m=>`<option value="${m}"${m===cur?' selected':''}>${m}</option>`).join(''));
}
function _rebuildViewFilters(){
  const views=new Set(), vtypes=new Set();
  Object.values(AUS_OFFICES).forEach(o=>{
    if(o.v&&o.v!=='nan') views.add(o.v);
    if(o.vt&&o.vt!=='nan') vtypes.add(o.vt);
  });
  const vSel=document.getElementById('aus-view-filter');
  const vtSel=document.getElementById('aus-vtype-filter');
  if(vSel){const cur=vSel.value;vSel.innerHTML='<option value="">All Views</option>'+[...views].sort().map(v=>`<option value="${v}"${v===cur?' selected':''}>${v}</option>`).join('');}
  if(vtSel){const cur=vtSel.value;vtSel.innerHTML='<option value="">All Types</option>'+[...vtypes].sort().map(v=>`<option value="${v}"${v===cur?' selected':''}>${v}</option>`).join('');}
}

// Auto-fetch from Google Sheet on load
async function ausFetchSheet(url){
  if(!url) return false;
  const badge=document.getElementById('aus-source-badge');
  const bar=document.getElementById('aus-loading-bar');
  const list=document.getElementById('aus-office-list');
  // ── Show loading state ──
  // Slim orange progress bar slides above the office list, and the list
  // body shows a translated "Loading offices…" message. Both give the
  // user immediate feedback that the region click registered.
  if(badge){badge.textContent='Loading…';badge.style.background='#fff3e0';badge.style.color='#e65100';}
  if(bar) bar.classList.add('on');
  if(list){
    list.innerHTML=`<div style="padding:28px 16px;text-align:center;color:var(--xlt);font-size:12px;line-height:1.55;">
      <span style="display:inline-block;width:18px;height:18px;border:2px solid rgba(255,102,0,.25);border-top-color:var(--o);border-radius:50%;animation:spin .65s linear infinite;margin-bottom:8px;"></span>
      <div style="font-weight:600;color:var(--mid);">${ui('lookup_loading')}</div>
    </div>`;
  }
  const cacheKey = 'co_aus_csv_'+btoa(url).slice(0,32);
  try{
    const r=await fetch(url,{cache:'no-cache'});
    if(!r.ok) throw new Error('HTTP '+r.status);
    const text=await r.text();
    // Cache successful CSV for offline fallback
    try{ localStorage.setItem(cacheKey, text); localStorage.setItem(cacheKey+'_ts', Date.now()); }catch(e){}
    // Reset offices for the new region (otherwise stale entries linger)
    AUS_OFFICES = {};
    const count=ausParseAndApplyCSV(text);
    if(count>0){
      if(badge){badge.textContent=`Live ● (${count})`;badge.style.background='#e8f5e9';badge.style.color='#2e7d32';}
      _rebuildMonthFilter();
      _rebuildViewFilters();
      // If this region has exactly one centre AND no filter is already
      // restored from a saved card, auto-pick it via ausSetCentre — that
      // populates the filter, renders the chip in "on" state, and triggers
      // the matching library-card auto-load. Otherwise just render normally;
      // applyLocationData's saved filter restore (if any) runs after this
      // returns and will set its own state.
      const uniqueCentres = [...new Set(Object.values(AUS_OFFICES).map(o=>o.c).filter(Boolean))];
      if(uniqueCentres.length === 1 && !AUS_CENTRE_FILTER){
        ausSetCentre(uniqueCentres[0]);
      } else {
        renderCentreChips();
        renderAusLookup();
      }
      if(bar) bar.classList.remove('on');
      return true;
    }
    throw new Error('No valid data');
  }catch(e){
    console.warn('AUS sheet fetch failed:',e.message);
    // Try offline cache before giving up
    try{
      const cached = localStorage.getItem(cacheKey);
      const cachedTs = parseInt(localStorage.getItem(cacheKey+'_ts')||'0');
      if(cached){
        AUS_OFFICES = {};
        const count = ausParseAndApplyCSV(cached);
        if(count>0){
          const ageH = Math.round((Date.now()-cachedTs)/3600000);
          const ageStr = ageH<1?'<1h ago':ageH<24?`${ageH}h ago`:`${Math.round(ageH/24)}d ago`;
          if(badge){badge.textContent=`Cached ● (${count}) · ${ageStr}`;badge.style.background='#fff3e0';badge.style.color='#e65100';}
          if(bar) bar.classList.remove('on');
          showStatus(`No internet — showing cached office data (${ageStr})`,'s-info');
          renderCentreChips(); renderAusLookup();
          return true;
        }
      }
    }catch(ce){}
    if(badge){badge.textContent='Offline';badge.style.background='#fce4ec';badge.style.color='#c62828';}
    if(bar) bar.classList.remove('on');
    if(list){
      list.innerHTML=`<div style="padding:24px 16px;text-align:center;color:#c62828;font-size:12px;line-height:1.55;">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="opacity:.7;margin-bottom:6px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <div style="font-weight:600;">${ui('lookup_load_failed')}</div>
        <div style="font-size:10.5px;color:var(--xlt);margin-top:3px;">No internet and no cached data available</div>
      </div>`;
    }
    return false;
  }
}

// ══════════════════════════════════════════════════════════
//  REGION INDEX (NEW)
//  A master Google Sheet lists which regions are available and where each
//  region's Availability Report CSV lives. Loaded once at startup; lets the
//  user switch between Kuala Lumpur / Sydney / Melbourne / AUS / etc.
//  without recompiling. Each region's CSV has the same column shape (the
//  existing ausParseAndApplyCSV auto-finds the header row, so the "ignore
//  the first 3 title rows, header on row 4" requirement is already handled).
// ══════════════════════════════════════════════════════════
// Strip a region-name prefix from a centre value. Examples:
//   "AUS - 141 Walker Street" → "141 Walker Street"
//   "Sydney - 1 Bligh"        → "1 Bligh"
//   "KL - Suria KLCC"         → "Suria KLCC"
//   "141 Walker Street"       → "141 Walker Street" (no change)
// Matches either the current region's name (from the master sheet) OR a
// short uppercase abbreviation (AUS / SYD / KL / etc.).
function stripRegionPrefix(s){
  if(!s) return '';
  let out = String(s);
  if(AX_REGION){
    const escaped = AX_REGION.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out.replace(new RegExp(`^${escaped}\\s*-\\s*`, 'i'), '');
  }
  out = out.replace(/^[A-Z]{2,5}\s*-\s*/, '');
  return out.trim();
}

const AX_DATA_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTuKjM9sngPtFmP-qPV8a1MobnTDepaOhH849LE2rPtJKYOWvUa3IW0g33dym0rkUQHkUiWWf5QnJXo/pub?output=csv';
let AX_REGIONS = {};      // {regionName: csvUrl}
let AX_REGION  = '';      // currently-selected region (e.g. "AUS", "Sydney")
let AX_REGIONS_LOADED = false;

// Fetch the master sheet and populate AX_REGIONS, then render region chips.
async function fetchAxRegions(){
  try{
    const r = await fetch(AX_DATA_URL, {cache:'no-cache'});
    if(!r.ok) throw new Error('HTTP '+r.status);
    const text = await r.text();
    AX_REGIONS = parseAxRegionsCsv(text);
    AX_REGIONS_LOADED = Object.keys(AX_REGIONS).length > 0;
    if(!AX_REGIONS_LOADED) throw new Error('No regions found in master sheet');
    renderRegionChips();
    // If a region was restored from a saved card, load its data.
    // Otherwise leave AX_REGION unset — the region chip row is visible and
    // the user actively picks one. The office list stays empty until then.
    if(AX_REGION && AX_REGIONS[AX_REGION]){
      // Card already restored its pricing_cols — don't let the preset
      // override them.
      setAxRegion(AX_REGION, /*skipReset=*/true, /*skipPreset=*/true);
    }
    // No else-branch any more: deliberately do not auto-pick the first
    // region. renderAusLookup shows a "pick a region" hint in this state.
    renderAusLookup();
    return true;
  } catch(err){
    console.warn('AX region index fetch failed:', err.message);
    // Graceful fallback: stay with whatever's loaded (could be nothing).
    const badge = document.getElementById('aus-source-badge');
    if(badge){ badge.textContent='Region index offline'; badge.style.background='#fce4ec'; badge.style.color='#c62828'; }
    return false;
  }
}

// Parse the master CSV. Looks for the header row containing "Region" + "Data".
function parseAxRegionsCsv(text){
  const parseCSVLine = line => {
    const r=[]; let cur='', inQ=false;
    for(let i=0;i<line.length;i++){
      const ch=line[i];
      if(ch==='"'){ inQ=!inQ; }
      else if(ch===',' && !inQ){ r.push(cur.trim()); cur=''; }
      else { cur+=ch; }
    }
    r.push(cur.trim());
    return r;
  };
  const rows = text.split(/\r?\n/).map(parseCSVLine);
  // Find header row — should contain a cell matching "Region" (case-insensitive)
  let hi = -1;
  for(let i=0;i<Math.min(5, rows.length);i++){
    if(rows[i].some(h => /^region$/i.test(h.trim()))){ hi=i; break; }
  }
  if(hi < 0) return {};
  const headers = rows[hi].map(h => h.trim().toLowerCase());
  const regionCol = headers.indexOf('region');
  const dataCol   = headers.findIndex(h => h === 'data' || h.includes('url') || h.includes('csv'));
  if(regionCol < 0 || dataCol < 0) return {};
  const out = {};
  for(let i = hi + 1; i < rows.length; i++){
    const region = (rows[i][regionCol] || '').trim();
    const url    = (rows[i][dataCol]   || '').trim();
    if(region && url && /^https?:\/\//i.test(url)) out[region] = url;
  }
  return out;
}

// Switch active region. Fetches that region's CSV and repopulates the office
// list. Resets the centre sub-filter so users don't carry stale filter state
// across regions where the centre name doesn't exist.
async function setAxRegion(name, skipReset, skipPreset){
  if(!AX_REGIONS[name]) return false;
  const changed = AX_REGION !== name;
  AX_REGION = name;
  if(changed && !skipReset){
    AUS_CENTRE_FILTER = '';
    AUS_SELECTED.clear();
  }
  // Apply the region's column visibility defaults (AUS-style detailed view
  // vs simple 4-col view) and refresh the deposit/tax note placeholder.
  // Skipped during card restore so the saved card's pricing_cols win.
  if(changed && !skipPreset){
    applyRegionPreset(name);
    // Update the deposit-note input placeholder to reflect the new
    // region's default (existing user-set value, if any, is preserved).
    const noteInput = document.getElementById('deposit-note-input');
    // For Hong Kong: auto-fill all language slots with the HK deposit terms
    // if they're currently empty, so users see the text in the field and can
    // edit it. For other regions: just update the placeholder.
    if(name === 'Hong Kong'){
      ['en','zh-hant','zh-hans','ja'].forEach(lc => {
        if(!(DEPOSIT_NOTE[lc] || '').trim()){
          DEPOSIT_NOTE[lc] = _HK_DEPOSIT_NOTE[lc] || _HK_DEPOSIT_NOTE.en;
        }
      });
      if(noteInput) noteInput.value = DEPOSIT_NOTE[LANG] || '';
      syncDepositNoteInput();
    } else {
      if(noteInput) noteInput.placeholder = _depositNoteDefaultFor(LANG);
    }
  }
  renderRegionChips();
  const url = AX_REGIONS[name];
  const ok = await ausFetchSheet(url);
  return ok;
}

// Render the region chip row from AX_REGIONS.
function renderRegionChips(){
  const el = document.getElementById('aus-region-chips');
  if(!el) return;
  const names = Object.keys(AX_REGIONS);
  if(!names.length){
    el.innerHTML = `<span style="font-size:10.5px;color:var(--xlt);font-style:italic;">No regions available · check network</span>`;
    return;
  }
  el.innerHTML = names.map(n => {
    const isOn = n === AX_REGION;
    return `<button onclick="setAxRegion('${n.replace(/'/g,"\\'")}')" class="lib-city-chip${isOn?' on':''}" style="font-size:10.5px;padding:3px 10px;font-weight:700;">${n}</button>`;
  }).join('');
}

// Render the centre sub-filter chips dynamically from whatever centres are
// present in the currently-loaded region's offices.
// ── JS-positioned chip tooltip ────────────────────────────────────────────
// Used for the multi-floor hint on active centre chips. A real DOM div on
// document.body so no overflow:hidden container can ever clip it.
// getBoundingClientRect lets us clamp horizontally to stay on screen.
let _chipTipEl = null;
function showChipTooltip(chip, text){
  hideChipTooltip();
  const el = document.createElement('div');
  el.id = '_chip-tip';
  el.textContent = text;
  Object.assign(el.style, {
    position:'fixed', zIndex:'99999',
    background:'rgba(26,26,26,0.96)', color:'#fff',
    padding:'7px 11px', borderRadius:'6px',
    fontSize:'11.5px', fontWeight:'500', lineHeight:'1.45',
    maxWidth:'260px', whiteSpace:'normal', textAlign:'left',
    boxShadow:'0 6px 18px rgba(0,0,0,.22)',
    pointerEvents:'none', opacity:'0',
    transition:'opacity .12s ease-out',
    fontFamily:'inherit',
  });
  document.body.appendChild(el);
  _chipTipEl = el;

  // Position: above the chip, clamped within the viewport
  const r = chip.getBoundingClientRect();
  const tw = el.offsetWidth || 260;
  const th = el.offsetHeight || 40;
  const margin = 8; // gap from chip + screen edges
  const GAP = 10;   // space between chip and tooltip

  // Preferred: align left edge of tooltip to left edge of chip
  let left = r.left;
  // Clamp: don't go off right edge
  if(left + tw > window.innerWidth - margin) left = window.innerWidth - margin - tw;
  // Clamp: don't go off left edge
  if(left < margin) left = margin;

  const top = r.top - th - GAP;

  el.style.left = left + 'px';
  el.style.top  = top  + 'px';

  // Arrow: a small triangle pointing down toward the chip
  const arrow = document.createElement('div');
  // Arrow x: centre of chip, clamped inside tooltip box
  const arrowX = Math.max(8, Math.min(tw - 16, r.left + r.width/2 - left));
  Object.assign(arrow.style, {
    position:'absolute', bottom:'-5px',
    left: arrowX + 'px',
    width:'0', height:'0',
    borderLeft:'5px solid transparent',
    borderRight:'5px solid transparent',
    borderTop:'5px solid rgba(26,26,26,0.96)',
    pointerEvents:'none',
  });
  el.appendChild(arrow);

  // Fade in
  requestAnimationFrame(() => { el.style.opacity = '1'; });
}
function hideChipTooltip(){
  if(_chipTipEl){ _chipTipEl.remove(); _chipTipEl = null; }
}

function renderCentreChips(){
  hideChipTooltip(); // clean up any lingering tip if chips re-render mid-hover
  const el = document.getElementById('aus-centre-chips');
  if(!el) return;
  const centres = new Set();
  Object.values(AUS_OFFICES).forEach(o => { if(o.c) centres.add(o.c); });
  const list = [...centres].sort();
  if(!list.length){
    // No centres loaded — hide and clear filter
    el.style.display = 'none';
    AUS_CENTRE_FILTER = '';
    return;
  }
  el.style.display = 'flex';
  const shorten = c => c.replace(/\s+(Street|St|Road|Rd|Avenue|Ave|Place|Pl)$/i, '');

  // Returns a data-tooltip attribute string for a centre chip if that centre
  // has library cards on multiple floors. Shown only on the active chip — it
  // points the user toward the floor-number buttons rendered just below.
  const multiFloorTip = c => {
    if(AUS_CENTRE_FILTER !== c) return '';
    const cards = typeof ausLibCardsForCentre === 'function' ? ausLibCardsForCentre(c) : [];
    if(cards.length < 2) return '';
    const tip = ui('lookup_multifloor_hint');
    if(!tip) return '';
    const tipEsc = tip.replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    return ` onmouseenter="showChipTooltip(this,'${tipEsc}')" onmouseleave="hideChipTooltip()"`;
  };

  if(list.length === 1){
    // Single-centre region — show the chip anyway; no "All" chip needed.
    const c = list[0];
    AUS_CENTRE_FILTER = c;
    const tip = multiFloorTip(c);
    el.innerHTML = `<button onclick="ausSetCentre('${c.replace(/'/g,"\\'")}')" class="lib-city-chip on" style="font-size:10px;padding:2px 8px;"${tip}>${shorten(c)}</button>`;
    return;
  }
  // 2+ centres: if a previously-set filter no longer exists in this region's
  // data (e.g. switching from Sydney to KL), clear it so the chip row is sane.
  if(AUS_CENTRE_FILTER && !centres.has(AUS_CENTRE_FILTER)) AUS_CENTRE_FILTER = '';
  el.innerHTML =
    `<button onclick="ausSetCentre('')" class="lib-city-chip${AUS_CENTRE_FILTER===''?' on':''}" style="font-size:10px;padding:2px 8px;">All</button>` +
    list.map(c => {
      const tip = multiFloorTip(c);
      return `<button onclick="ausSetCentre('${c.replace(/'/g,"\\'")}')" class="lib-city-chip${AUS_CENTRE_FILTER===c?' on':''}" style="font-size:10px;padding:2px 8px;"${tip}>${shorten(c)}</button>`;
    }).join('');
}
let AUS_SELECTED = new Set(); // selected office IDs
let AUS_CENTRE_FILTER = '';   // active centre filter
let AUS_AVAIL_FILTER = '';    // 'Y'=vacant now, 'O'=occupied, ''=all
let AUS_LOADED_SOURCE = 'embedded'; // 'embedded' or 'sheet'

// ── BENEFITS SECTION TITLE ──────────────────────────────
// Per-language override. Empty = use default (Benefits / 使用優點 / etc.)
let BENEFITS_TITLE = {'en':'','zh-hant':'','zh-hans':'','ja':''};
function getBenefitsTitle(){
  const custom = BENEFITS_TITLE[LANG] || '';
  if(custom) return custom;
  return {en:'Benefits','zh-hant':'使用優點','zh-hans':'使用优点',ja:'ご利用のメリット'}[LANG]||'Benefits';
}

// ── DEPOSIT NOTE ─────────────────────────────────────────
// Per-language override. Empty = use language default.
// Shown below the pricing table on slide 1 + in the email.
const DEPOSIT_NOTE_DEFAULT = {
  'en':       'A 2-month deposit applies to contracts over 3 months, and a 1-month deposit for contracts under 3 months.',
  'zh-hant':  '合約超過 3 個月需 2 個月按金,3 個月以內合約需 1 個月按金。',
  'zh-hans':  '合约超过 3 个月需 2 个月押金,3 个月以内合约需 1 个月押金。',
  'ja':       '3ヶ月超の契約は2ヶ月分、3ヶ月以内の契約は1ヶ月分のデポジットが必要です。',
};
let DEPOSIT_NOTE = {'en':'','zh-hant':'','zh-hans':'','ja':''};

// ── REGION PRESETS ───────────────────────────────────────
// Per-region defaults for the pricing UI:
//   currency  : symbol prepended to monetary cells (Monthly Rent, Average Price)
//   style     : 'aus'    – 6-column detailed view + discount math + commitment text
//               'simple' – 4-column view (Office / Workstation / Monthly Rent / Availability)
//   taxLabel  : default footer note for 'simple' style (user can still override)
const REGION_PRESETS = {
  // Australian regions — detailed view, deposit-policy note
  'AUS':       {currency:'A$',  style:'aus'},
  'Sydney':    {currency:'A$',  style:'aus'},
  'Melbourne': {currency:'A$',  style:'aus'},
  // Asian regions — simple view, regional tax disclaimer
  'Hong Kong':        {currency:'HK$', style:'simple', taxLabel:'*Prices exclude government rates and management fees.'},
  'Singapore':        {currency:'S$',  style:'simple', taxLabel:'*Prices exclude GST.'},
  'Kuala Lumpur':     {currency:'RM',  style:'simple', taxLabel:'*Prices exclude SST.'},
  'Tokyo':            {currency:'¥',   style:'simple', taxLabel:'*Prices exclude consumption tax.'},
  'Osaka':            {currency:'¥',   style:'simple', taxLabel:'*Prices exclude consumption tax.'},
  'Hanoi':            {currency:'₫',   style:'simple', taxLabel:'*Prices exclude VAT.'},
  'Ho Chi Minh City': {currency:'₫',   style:'simple', taxLabel:'*Prices exclude VAT.'},
  'Manila':           {currency:'₱',   style:'simple', taxLabel:'*Prices exclude VAT.'},
};
function getRegionPreset(name){
  const r = name || AX_REGION;
  return REGION_PRESETS[r] || {currency:'HK$', style:'simple', taxLabel:'*Prices exclude VAT.'};
}
function getRegionCurrency(){ return getRegionPreset().currency || 'HK$'; }
function isAusStyleRegion(){ return getRegionPreset().style === 'aus'; }

// Region-aware deposit/tax note default — used when the user hasn't set
// their own DEPOSIT_NOTE[LANG]. AUS regions keep the deposit-policy text;
// simple regions show the tax disclaimer.
// Hong Kong deposit terms default text — all 4 languages
const _HK_DEPOSIT_NOTE = {
  'en':      '(The meeting room hourly credit applies only to the specified room (others charged at standard rates). The agreement includes Wi-Fi, café beverages, weekday cleaning, mail handling, standard furniture, utilities, management fees, government rates; Business Continuity Package is optional.)',
  'zh-hant': '（會議室每小時額度只適用於指定房間（其他房間按標準收費）。協議包含：Wi-Fi、咖啡/飲品、平日清潔、郵件處理、標準辦公傢具、水電費、管理費及政府差餉；業務連續性方案為可選項目。）',
  'zh-hans': '（会议室每小时额度仅适用于指定房间（其他房间按标准收费）。协议包含：Wi-Fi、咖啡/饮品、工作日清洁、邮件处理、标准办公家具、水电费、管理费及政府差饷；业务连续性方案为可选项目。）',
  'ja':      '（会議室のご利用時間枠は指定された部屋にのみ適用されます（その他は標準料金）。契約にはWi-Fi、コーヒー/ドリンク、平日清掃、郵便物対応、標準家具、光熱費、管理費、政府税が含まれます。業務継続プランはオプションです。）',
};

function _depositNoteDefaultFor(lang){
  // Hong Kong has its own specific deposit terms — only applies when HK is selected
  if(AX_REGION === 'Hong Kong') return _HK_DEPOSIT_NOTE[lang] || _HK_DEPOSIT_NOTE.en;
  const preset = getRegionPreset();
  if(preset.style === 'aus') return DEPOSIT_NOTE_DEFAULT[lang] || DEPOSIT_NOTE_DEFAULT.en;
  return preset.taxLabel || '*Prices exclude VAT.';
}

function getDepositNote(){
  const custom = (DEPOSIT_NOTE[LANG] || '').trim();
  return custom || _depositNoteDefaultFor(LANG);
}

// Toggle handlers for the two on/off switches in the Pricing tab.
// Both flags persist with the card JSON so re-loading restores the state.
function toggleDepositNote(){
  DEPOSIT_NOTE_ON = !DEPOSIT_NOTE_ON;
  const btn = document.getElementById('deposit-note-toggle');
  if(btn) btn.classList.toggle('on', DEPOSIT_NOTE_ON);
  // Dim the textarea + reset button when off, so it's visually clear that
  // the input has no effect on output right now.
  const inp = document.getElementById('deposit-note-input');
  if(inp){
    inp.style.opacity = DEPOSIT_NOTE_ON ? '1' : '.4';
    inp.disabled = !DEPOSIT_NOTE_ON;
  }
  gen();
}
// ── House Rules link ──────────────────────────────────────────────────────
// A clickable link in the slide footer to the public House Rules page. The
// page localises itself via ?lang= (zh-hant / zh-hans / ja); English uses the
// base URL. The on/off state persists with the card JSON, like the toggles above.
function houseRulesUrl(){
  return HOUSE_RULES_URL_BASE + (LANG && LANG !== 'en' ? '?lang=' + LANG : '');
}
function toggleHouseRules(){
  HOUSE_RULES_ON = !HOUSE_RULES_ON;
  const btn = document.getElementById('house-rules-toggle');
  if(btn) btn.classList.toggle('on', HOUSE_RULES_ON);
  gen();
}
function toggleBaseDiscount(){
  BASE_DISCOUNT_ON = !BASE_DISCOUNT_ON;
  const btn = document.getElementById('base-discount-toggle');
  if(btn) btn.classList.toggle('on', BASE_DISCOUNT_ON);
  // Recalculate any lookup-added rows with the new on/off state
  if(typeof _syncRowPrices === 'function') _syncRowPrices();
  const inp = document.getElementById('aus-discount');
  if(inp){
    inp.style.opacity = BASE_DISCOUNT_ON ? '1' : '.4';
    inp.disabled = !BASE_DISCOUNT_ON;
  }
  // Recompute the Office Lookup table (which uses ausCalc) and the slide
  if(typeof renderAusLookup === 'function') renderAusLookup();
  gen();
}

// ── PRICING COLUMN CONFIG ────────────────────────────────
// Each column: {key, on (visible), label (custom override)}
// Order in this array drives left-to-right order on the slide.
// 8 built-in keys map 1:1 to the Availability Report's 7 source fields
// plus a 'init' notes field:
//   seats  → Office #              type    → Suite/View Type
//   sqm    → Sqm (size)            rent    → Workstation count
//   market → Market Price (raw)    mgmt    → Monthly Rent (discounted)
//   init   → 12-Month Commitment   avail   → Avg Price (AUS) / Availability (simple)
let PRICING_COLS = [
  {key:'seats',  on:true,  labels:{'en':'','zh-hant':'','zh-hans':'','ja':''}},
  {key:'type',   on:true,  labels:{'en':'','zh-hant':'','zh-hans':'','ja':''}},
  {key:'sqm',    on:false, labels:{'en':'','zh-hant':'','zh-hans':'','ja':''}},
  {key:'rent',   on:true,  labels:{'en':'','zh-hant':'','zh-hans':'','ja':''}},
  {key:'market', on:false, labels:{'en':'','zh-hant':'','zh-hans':'','ja':''}},
  {key:'mgmt',   on:true,  labels:{'en':'','zh-hant':'','zh-hans':'','ja':''}},
  {key:'init',   on:true,  labels:{'en':'','zh-hant':'','zh-hans':'','ja':''}},
  {key:'avail',  on:true,  labels:{'en':'','zh-hant':'','zh-hans':'','ja':''}},
];
function getPricingColLabel(key){
  const col = PRICING_COLS.find(c=>c.key===key);
  if(!col) return key;
  // 1. If the user set an explicit label for the current language, use it.
  const lbl = col.labels && col.labels[LANG];
  if(lbl) return lbl;
  // 2. Built-in columns with no override → use the i18n string for the
  //    current language. This prevents a label the user typed only in
  //    zh-hant ("辦公桌") from leaking into the EN view via cross-language
  //    fallback.
  if(!col.custom){
    // Region-aware: AUS shows the discount-math labels ("Max Workstations",
    // "Average Price"); simple regions show the customer-facing ones
    // ("Workstation", "Availability"). Same column keys, different headers.
    if(!isAusStyleRegion()){
      if(key === 'rent')  return ui('pr_workstation');
      if(key === 'avail') return ui('pr_availability');
    }
    return ui('pr_'+key);
  }
  // 3. Custom column with no label in this language → fall back to any
  //    other language the user typed in, then to a generic "Column" string.
  const anyLbl = col.labels && Object.values(col.labels).find(v=>v);
  return anyLbl || 'Column';
}

// Built-in column keys — cannot be deleted
const PRICING_COLS_BUILTIN = ['seats','type','sqm','rent','market','mgmt','init','avail'];

// Generate a unique key for a new custom column (custom_1, custom_2, ...)
function generateCustomColKey(){
  let i = 1;
  while(PRICING_COLS.find(c => c.key === 'custom_'+i)) i++;
  return 'custom_'+i;
}

function addPricingCol(){
  const newKey = generateCustomColKey();
  PRICING_COLS.push({
    key: newKey,
    on: true,
    custom: true,
    labels: {'en':'New Column','zh-hant':'','zh-hans':'','ja':''},
  });
  renderPricingColSettings();
  renderRows();
  gen();
  _ausUpdateAddBtnPulse(); // selection may still be set, update button state
}

function removePricingCol(key){
  if(PRICING_COLS_BUILTIN.includes(key)) return; // Built-ins are never removed
  if(!confirm(`Remove "${getPricingColLabel(key)}" column? Values in this column will be lost.`)) return;
  PRICING_COLS = PRICING_COLS.filter(c => c.key !== key);
  // Strip values from every row
  S.rows.forEach(r => { delete r[key]; });
  renderPricingColSettings();
  renderRows();
  gen();
}

// Apply the active region's defaults to PRICING_COLS — visible columns
// only; custom user-added columns are left alone. Called when the user
// switches regions in the Office Lookup. Skipped during card restore
// (saved cards bring their own pricing_cols).
const _AUS_COLS_DEFAULT    = {seats:true, type:true,  rent:true, mgmt:true, init:true,  avail:true};
const _SIMPLE_COLS_DEFAULT = {seats:true, type:false, rent:true, mgmt:true, init:false, avail:true};
function applyRegionPreset(name){
  const preset = REGION_PRESETS[name];
  if(!preset) return;
  const colsTpl = preset.style === 'aus' ? _AUS_COLS_DEFAULT : _SIMPLE_COLS_DEFAULT;
  PRICING_COLS.forEach(col => { if(!col.custom) col.on = !!colsTpl[col.key]; });
  if(typeof renderPricingColSettings === 'function') renderPricingColSettings();
  if(typeof renderRows === 'function') renderRows();
  if(typeof gen === 'function') gen();
}
function renderPricingColSettings(){
  const el = document.getElementById('pricing-col-settings');
  if(!el) return;
  el.innerHTML = PRICING_COLS.map((col,i) => {
    const isCustom = !!col.custom;
    const builtinPlaceholder = !isCustom ? ui('pr_'+col.key) : 'Column name';
    const labelHint = !isCustom ? ui('pr_'+col.key).slice(0,6) : '✱';
    const btnStyle = 'width:20px;height:20px;border:1px solid var(--bd);border-radius:4px;background:var(--wh);color:var(--xlt);cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:10px;padding:0;';
    return `
    <div style="display:flex;align-items:center;gap:6px;padding:5px 0;border-bottom:1px solid var(--bd);">
      <button class="ben-toggle${col.on?' on':''}" onclick="togglePricingCol(${i})" style="flex-shrink:0;"></button>
      <span style="font-size:10px;color:${isCustom?'var(--o)':'var(--xlt)'};width:36px;flex-shrink:0;font-weight:${isCustom?'700':'500'};">${labelHint}</span>
      <input type="text" value="${(col.labels&&col.labels[LANG])||''}" placeholder="${builtinPlaceholder}"
        style="flex:1;border:1px solid var(--bd);border-radius:5px;padding:4px 8px;font-size:12px;font-family:inherit;outline:none;"
        oninput="PRICING_COLS[${i}].labels[LANG]=this.value;gen();renderRows();"
        onfocus="this.style.borderColor='var(--o)'" onblur="this.style.borderColor='var(--bd)'">
      <button onclick="moveCol(${i},-1)" title="Move up" style="${btnStyle}" onmouseover="this.style.borderColor='var(--o)';this.style.color='var(--o)'" onmouseout="this.style.borderColor='var(--bd)';this.style.color='var(--xlt)'">↑</button>
      <button onclick="moveCol(${i},1)"  title="Move down" style="${btnStyle}" onmouseover="this.style.borderColor='var(--o)';this.style.color='var(--o)'" onmouseout="this.style.borderColor='var(--bd)';this.style.color='var(--xlt)'">↓</button>
      ${isCustom?`<button onclick="removePricingCol('${col.key}')" title="Remove" style="${btnStyle}" onmouseover="this.style.borderColor='#DC2626';this.style.color='#DC2626'" onmouseout="this.style.borderColor='var(--bd)';this.style.color='var(--xlt)'"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>`:'<div style="width:20px;flex-shrink:0;"></div>'}
    </div>`;
  }).join('')
  + `
    <button onclick="addPricingCol()" style="width:100%;margin-top:8px;padding:8px;border:1px dashed var(--bd);border-radius:6px;background:transparent;color:var(--xlt);font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:6px;transition:all .15s;"
      onmouseover="this.style.borderColor='var(--o)';this.style.color='var(--o)'"
      onmouseout="this.style.borderColor='var(--bd)';this.style.color='var(--xlt)'">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      Add Custom Column
    </button>`;
}
function moveCol(i, dir){
  const target = i + dir;
  if(target < 0 || target >= PRICING_COLS.length) return;
  [PRICING_COLS[i], PRICING_COLS[target]] = [PRICING_COLS[target], PRICING_COLS[i]];
  renderPricingColSettings(); renderRows(); gen();
}
function togglePricingCol(i){
  PRICING_COLS[i].on = !PRICING_COLS[i].on;
  renderPricingColSettings();
  renderRows();
  gen();
}

// ── DEPOSIT NOTE UI HELPERS ──────────────────────────────
function syncDepositNoteInput(){
  // Refresh the textarea value + placeholder to match the active language.
  const el = document.getElementById('deposit-note-input');
  if(!el) return;
  el.value = DEPOSIT_NOTE[LANG] || '';
  el.placeholder = _depositNoteDefaultFor(LANG);
}
function resetDepositNote(){
  DEPOSIT_NOTE[LANG] = '';
  syncDepositNoteInput();
  gen();
}

function setBenPos(pos){
  BENEFITS_POS=pos;
  document.querySelectorAll('.ben-pos-btn').forEach(b=>b.classList.toggle('on',b.id==='bpos-'+pos));
  gen();
}
function toggleShowSpecs(){
  SHOW_SPECS=!SHOW_SPECS;
  const btn=document.getElementById('specs-master-toggle');
  const txt=document.getElementById('specs-master-txt');
  const icon=document.getElementById('specs-master-icon');
  if(btn){btn.style.background=SHOW_SPECS?'var(--olt)':'var(--bg)';btn.style.color=SHOW_SPECS?'var(--o)':'var(--xlt)';btn.style.borderColor=SHOW_SPECS?'var(--o)':'var(--bd)';}
  if(txt)txt.textContent=SHOW_SPECS?'Showing on slide':'Hidden from slide';
  if(icon)icon.innerHTML=SHOW_SPECS?'<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>':'<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
  const fields=document.querySelectorAll('#p-specs .field');
  fields.forEach(f=>{f.style.opacity=SHOW_SPECS?'':'0.35';f.style.pointerEvents=SHOW_SPECS?'':'none';});
  // Auto-switch layout: hiding all specs → back to Auto; showing specs with content → Classic
  if(!SHOW_SPECS && BENEFITS_POS==='right') setBenPos('auto');
  else if(SHOW_SPECS && BENEFITS_POS==='auto') { setTimeout(()=>{checkAutoLayout();},50); }
  gen();
}
function toggleSpecField(id,btn){
  if(HIDDEN_SPECS.has(id)){HIDDEN_SPECS.delete(id);}else{HIDDEN_SPECS.add(id);}
  const field=document.getElementById(id)?.closest('.field');
  if(field)field.classList.toggle('spec-field-hidden',HIDDEN_SPECS.has(id));
  document.querySelectorAll(`.spec-hide-btn[onclick*="'${id}'"]`).forEach(b=>{
    b.title=HIDDEN_SPECS.has(id)?'Show on slide':'Hide from slide';
    b.style.color=HIDDEN_SPECS.has(id)?'var(--o)':'';
    b.innerHTML=HIDDEN_SPECS.has(id)?'<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> show':'<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg> hide';
  });
  checkAutoLayout();
  gen();
}

let _genTimer=null;
function genDebounced(delay){clearTimeout(_genTimer);_genTimer=setTimeout(gen,delay||400);}
function setSep(v){LOGO_SEP=v;document.querySelectorAll('.sep-opt').forEach(b=>b.classList.remove('on'));document.getElementById('sep-'+v).classList.add('on');}

// ══════════════════════════════════════════════════════════
//  TABS
// ══════════════════════════════════════════════════════════
function openTab(n){
  ['loc','specs','price','media'].forEach(k=>{
    document.getElementById('p-'+k).classList.toggle('on',k===n);
    document.getElementById('t-'+k).classList.toggle('on',k===n);
  });
}

// ══════════════════════════════════════════════════════════
//  PRICING ROWS
// ══════════════════════════════════════════════════════════
