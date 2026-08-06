// ══════════════════════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════════════════════
const S={photos:[null,null,null,null,null,null],floorplan:null,partnerLogo:null,rows:[]};
// floorplans: array of {url, label} — index 0 is master (same as S.floorplan for compat)
// fp_page2_same: true = page 2 shows same as page 1 (default)
// fp_base_url: the common prefix URL for room# pattern
let FP_PLANS = [];         // [{url:'...master.jpg', label:'Master'}, {url:'...2412.jpg', label:'2412'}]
let EXTRA_MASTERS = [];    // [{url, label}] — other floors' master plans → extra PDF pages
let FP_PAGE2_SAME = true;  // true = page2 shows same plans as page1
let FP_PAGE1_IDX = -1;     // -1 = collage (all plans), 0+ = specific plan index
let FP_PAGE2_IDX = -1;     // -1 = collage (all plans), 0+ = specific plan index
let FP_BASE_URL = '';       // e.g. https://compassoffices.com/uploads/2026/03/floorplan_lg1-24-
let LOGO_SEP='x';
let HIDDEN_SPECS=new Set();
let SHOW_SPECS=true;
let BENEFITS_POS='auto';
let CUSTOM_POS='below';

// ── AUS OFFICE DATA ─────────────────────────────────────
let AUS_OFFICES = {}; // always loaded from Google Sheet
let AUS_DISCOUNT = 30;       // Base Discount %
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
  if(badge){badge.textContent='Loading…';badge.style.background='#fff3e0';badge.style.color='#e65100';}
  try{
    const r=await fetch(url,{cache:'no-cache'});
    if(!r.ok) throw new Error('HTTP '+r.status);
    const text=await r.text();
    const count=ausParseAndApplyCSV(text);
    if(count>0){
      if(badge){badge.textContent=`Live ● (${count})`;badge.style.background='#e8f5e9';badge.style.color='#2e7d32';}
      _rebuildMonthFilter();
      _rebuildViewFilters();
      renderAusLookup();
      return true;
    }
    throw new Error('No valid data');
  }catch(e){
    console.warn('AUS sheet fetch failed:',e.message);
    if(badge){badge.textContent='Offline';badge.style.background='#fce4ec';badge.style.color='#c62828';}
    return false;
  }
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

// ── PRICING COLUMN CONFIG ────────────────────────────────
// Each column: {key, on (visible), label (custom override)}
let PRICING_COLS = [
  {key:'seats', on:true,  labels:{'en':'','zh-hant':'','zh-hans':'','ja':''}},
  {key:'type',  on:true,  labels:{'en':'','zh-hant':'','zh-hans':'','ja':''}},
  {key:'rent',  on:true,  labels:{'en':'','zh-hant':'','zh-hans':'','ja':''}},
  {key:'mgmt',  on:true,  labels:{'en':'','zh-hant':'','zh-hans':'','ja':''}},
  {key:'init',  on:true,  labels:{'en':'','zh-hant':'','zh-hans':'','ja':''}},
  {key:'avail', on:true,  labels:{'en':'','zh-hant':'','zh-hans':'','ja':''}},
];
function getPricingColLabel(key){
  const col = PRICING_COLS.find(c=>c.key===key);
  const lbl = col && col.labels && col.labels[LANG];
  return lbl ? lbl : ui('pr_'+key);
}
function renderPricingColSettings(){
  const el = document.getElementById('pricing-col-settings');
  if(!el) return;
  el.innerHTML = PRICING_COLS.map((col,i) => `
    <div style="display:flex;align-items:center;gap:6px;padding:5px 0;border-bottom:1px solid var(--bd);">
      <button class="ben-toggle${col.on?' on':''}" onclick="togglePricingCol(${i})" style="flex-shrink:0;"></button>
      <span style="font-size:10px;color:var(--xlt);width:36px;flex-shrink:0">${ui('pr_'+col.key).slice(0,6)}</span>
      <input type="text" value="${(col.labels&&col.labels[LANG])||''}" placeholder="${ui('pr_'+col.key)}"
        style="flex:1;border:1px solid var(--bd);border-radius:5px;padding:4px 8px;font-size:12px;font-family:inherit;outline:none;"
        oninput="PRICING_COLS[${i}].labels[LANG]=this.value;gen();renderRows();"
        onfocus="this.style.borderColor='var(--o)'" onblur="this.style.borderColor='var(--bd)'">
    </div>`).join('');
}
function togglePricingCol(i){
  PRICING_COLS[i].on = !PRICING_COLS[i].on;
  renderPricingColSettings();
  renderRows();
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

