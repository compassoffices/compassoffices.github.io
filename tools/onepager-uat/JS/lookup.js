// ══════════════════════════════════════════════════════════
//  AUS OFFICE LOOKUP
// ══════════════════════════════════════════════════════════
let _ausViewFilter = '';
let _ausVTypeFilter = '';

function ausSetCentre(centre){
  // Clear floor/office search whenever centre changes — prevents stale floor filter persisting
  const searchInp = document.getElementById('aus-search');
  if(searchInp && searchInp.value) searchInp.value = '';

  AUS_CENTRE_FILTER=centre;
  // Update chip UI
  document.querySelectorAll('[id^="aus-c-"]').forEach(b=>b.classList.remove('on'));
  const map={'':'aus-c-all','141 Walker Street':'aus-c-141','207 Kent Street':'aus-c-207','360 Collins Street':'aus-c-360','459 Collins Street':'aus-c-459','570 Bourke Street':'aus-c-570','9 Castlereagh':'aus-c-9c'};
  document.getElementById(map[centre]||'aus-c-all')?.classList.add('on');

  if(centre){
    // Try auto-loading floorplan data for this centre
    setTimeout(fpSheetTryAutoLoad, 300);
    const matches=ausLibCardsForCentre(centre);
    if(matches.length===1){
      // Only one floor → auto-load immediately, no extra click needed
      _ausLoadCard(matches[0].i);
      // Still render the lookup filtered to this centre after load
      setTimeout(()=>renderAusLookup(), 0);
      return;
    }
    // Multiple floors → render lookup + show floor selector strip
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
  const monthly = Math.round(marketPrice * (1 - discount/100));
  const avg = Math.round(monthly * 10/12);
  return {monthly, avg};
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
    // Defer so loadFromLib completes first
    setTimeout(()=>renderAusLookup(), 0);
  }
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
    // Office # uses startsWith so "16" matches 1601,1602... but NOT 1716
    if(search && !oid.toLowerCase().startsWith(search) && !o.c.toLowerCase().includes(search)) return false;
    return true;
  });

  document.getElementById('aus-count').textContent = `${entries.length} offices`;
  renderAusLibSuggestions(AUS_CENTRE_FILTER);

  if(!entries.length){
    list.innerHTML='<div style="padding:16px;text-align:center;color:var(--xlt);font-size:12px;">No offices match filters</div>';
  } else {
    list.innerHTML=`<table style="width:100%;border-collapse:collapse;font-size:11.5px;">
      <thead style="position:sticky;top:0;background:var(--bg);z-index:1;">
        <tr style="border-bottom:1.5px solid var(--bd);">
          <th style="padding:5px 8px;text-align:left;font-weight:700;color:var(--xlt);font-size:10px;text-transform:uppercase;letter-spacing:.04em;width:28px;"></th>
          <th style="padding:5px 8px;text-align:left;font-weight:700;color:var(--xlt);font-size:10px;text-transform:uppercase;letter-spacing:.04em;">Office #</th>

          <th style="padding:5px 8px;text-align:center;font-weight:700;color:var(--xlt);font-size:10px;text-transform:uppercase;letter-spacing:.04em;">WS</th>
          <th style="padding:5px 8px;text-align:center;font-weight:700;color:var(--xlt);font-size:10px;text-transform:uppercase;letter-spacing:.04em;">Sqm</th>
          <th style="padding:5px 8px;text-align:right;font-weight:700;color:var(--xlt);font-size:10px;text-transform:uppercase;letter-spacing:.04em;">Market</th>
          <th style="padding:5px 8px;text-align:right;font-weight:700;color:var(--o);font-size:10px;text-transform:uppercase;letter-spacing:.04em;">Monthly</th>
          <th style="padding:5px 8px;text-align:right;font-weight:700;color:var(--o);font-size:10px;text-transform:uppercase;letter-spacing:.04em;">Avg(12M)</th>
          <th style="padding:5px 8px;text-align:left;font-weight:700;color:var(--xlt);font-size:10px;text-transform:uppercase;letter-spacing:.04em;">Avail</th>
        </tr>
      </thead>
      <tbody>
      ${entries.map(([oid,o])=>{
        const sel=AUS_SELECTED.has(oid);
        const {monthly,avg}=ausCalc(o.mp,disc);
        return`<tr onclick="ausToggle('${oid.replace(/'/g,'\\\'')}')" style="cursor:pointer;border-bottom:1px solid var(--bd);background:${sel?'var(--olt)':'var(--wh)'};transition:background .1s;" onmouseover="this.style.background=this.style.background||'var(--bg)'" onmouseout="if(!${sel})this.style.background='var(--wh)'">
          <td style="padding:5px 8px;text-align:center;">
            <div style="width:16px;height:16px;border-radius:4px;border:2px solid ${sel?'var(--o)':'var(--bd)'};background:${sel?'var(--o)':'transparent'};display:flex;align-items:center;justify-content:center;margin:0 auto;">
              ${sel?'<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5"><polyline points="20 6 9 17 4 12"/></svg>':''}
            </div>
          </td>
          <td style="padding:4px 8px;font-weight:700;color:var(--drk);">
            <div style="display:flex;align-items:center;gap:7px;">
              ${FP_BASE_URL?`<img src="${FP_BASE_URL}${oid.replace(/\s*-\s*C$/i,'').trim()}.jpg" style="width:38px;height:28px;object-fit:contain;border-radius:3px;border:1px solid ${sel?'var(--o)':'var(--bd)'};background:#f8f8f8;flex-shrink:0;" onerror="this.style.display='none'">`:''}
              <div>${oid}<div style="font-size:9px;color:var(--xlt);font-weight:500;">${o.vt}·${o.v}</div></div>
            </div>
          </td>
          <td style="padding:5px 8px;text-align:center;">${o.w}</td>
          <td style="padding:5px 8px;text-align:center;color:var(--xlt);">${o.sq}</td>
          <td style="padding:5px 8px;text-align:right;color:var(--xlt);">$${o.mp.toLocaleString()}</td>
          <td style="padding:5px 8px;text-align:right;font-weight:700;color:var(--o);">$${monthly.toLocaleString()}</td>
          <td style="padding:5px 8px;text-align:right;font-weight:700;color:var(--o);">$${avg.toLocaleString()}</td>
          <td style="padding:5px 8px;">${ausAvailLabel(o)}</td>
        </tr>`;
      }).join('')}
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

function ausToggle(oid){
  if(AUS_SELECTED.has(oid)) AUS_SELECTED.delete(oid);
  else AUS_SELECTED.add(oid);
  renderAusLookup();
}

// ── MULTI-FLOOR EXTRA MASTER PAGES ────────────────────────────────────────────
function renderExtraMasters(){
  const el=document.getElementById('extra-masters');if(!el)return;
  if(!EXTRA_MASTERS.length){el.innerHTML='';el.style.display='none';return;}
  el.style.display='block';
  el.innerHTML='<div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:var(--o);margin:10px 0 6px;">⧉ Multi-Floor — extra PDF pages</div>'
    +EXTRA_MASTERS.map((m,i)=>`<span style="display:inline-flex;align-items:center;gap:5px;margin:0 6px 6px 0;padding:4px 9px;border:1.5px solid var(--o);border-radius:14px;background:var(--olt);font-size:11px;font-weight:700;color:var(--o);">${m.label}<button onclick="removeExtraMaster(${i})" style="border:none;background:transparent;color:var(--o);cursor:pointer;font-size:12px;line-height:1;padding:0;">✕</button></span>`).join('')
    +'<div class="note-txt">Each chip = one extra master floor-plan page appended to the PDF export.</div>';
}
function removeExtraMaster(i){EXTRA_MASTERS.splice(i,1);renderExtraMasters();showStatus('Extra floor page removed.','s-info');}

// Capture one slide2 page per extra master → array of JPEG dataURLs
async function captureExtraMasterPages(quality){
  if(!EXTRA_MASTERS.length) return [];
  const out=[];
  const _pSame=FP_PAGE2_SAME,_p2=FP_PAGE2_IDX,_plansLen=FP_PLANS.length;
  try{
    for(const m of EXTRA_MASTERS){
      FP_PLANS.push({url:m.url,label:m.label});
      FP_PAGE2_SAME=false;FP_PAGE2_IDX=FP_PLANS.length-1;
      gen._captureMode=true;gen();gen._captureMode=false;
      const cv=await slideToCanvas('slide2');
      if(cv) out.push(cv.toDataURL('image/jpeg',quality||0.92));
      FP_PLANS.pop();
    }
  }finally{
    FP_PLANS.length=_plansLen;FP_PAGE2_SAME=_pSame;FP_PAGE2_IDX=_p2;
    gen();
  }
  return out;
}

// ── IMAGE CACHE REFRESH ───────────────────────────────────────────────────────
function _cbust(u){
  if(!u||typeof u!=='string'||u.startsWith('data:')||u.startsWith('blob:'))return u;
  const clean=u.replace(/[?&]cb=\d+/g,'').replace(/\?&/,'?');
  return clean+(clean.includes('?')?'&':'?')+'cb='+Date.now();
}
function _stripCb(u){
  if(!u||typeof u!=='string')return u;
  return u.replace(/[?&]cb=\d+/g,'').replace(/\?&/,'?');
}
function refreshImageCache(){
  S.photos=S.photos.map(_cbust);
  if(S.partnerLogo)S.partnerLogo=_cbust(S.partnerLogo);
  if(S.floorplan)S.floorplan=_cbust(S.floorplan);
  FP_PLANS=FP_PLANS.map(p=>({...p,url:_cbust(p.url)}));
  EXTRA_MASTERS=EXTRA_MASTERS.map(m=>({...m,url:_cbust(m.url)}));
  renderPhotoSlots();
  if(typeof renderLogoCard==='function')renderLogoCard();
  if(typeof renderFpList==='function')renderFpList();
  renderExtraMasters();
  gen();
  showStatus('Image cache cleared — all images re-fetched fresh from Cloudinary/source.','s-ok');
}

function ausAddToRows(){
  if(!AUS_SELECTED.size){showStatus('Select at least one office first.','s-info');return;}
  const disc=AUS_DISCOUNT;
  AUS_SELECTED.forEach(oid=>{
    const o=AUS_OFFICES[oid];if(!o)return;
    const {monthly,avg}=ausCalc(o.mp,disc);
    const commitment=`16.6% Saving - 2 Months Free on 12! | Avg A$${avg.toLocaleString()}/ws`;
    // Add pricing row
    addRow(
      oid,                              // seats → Office #
      o.vt,                             // type  → Suite Type
      String(o.w),                      // rent  → Max Workstations
      `A$${monthly.toLocaleString()}`,  // mgmt  → Monthly Rent (plain text)
      commitment,                       // init  → 12-Month Commitment
      `A$${avg.toLocaleString()}`        // avail → Average Price (plain text)
    );
    // Also add to floor plan if base URL is set
    if(FP_BASE_URL){
      const room=oid.replace(/\s*-\s*C$/i,'').trim(); // strip "- C" suffix
      const url=FP_BASE_URL+room+'.jpg';
      const label=oid;
      const exists=FP_PLANS.some(p=>p.url===url||p.label===label);
      if(!exists){
        FP_PLANS.push({url,label});
        if(FP_PLANS.length===1) S.floorplan=url;
        applyFpSmartDefaults();
      }
    }
  });
  // ── Multi-floor: pull other floors' master plans as extra PDF pages ──
  let _newMasters=0;
  try{
    const curFloor=((document.getElementById('floor')?.value||'').match(/\d+/)||[])[0]||'';
    const selFloors=[...new Set([...AUS_SELECTED].map(o=>(String(o).match(/^(\d+)/)||[])[1]).filter(Boolean))];
    const others=selFloors.filter(f=>f!==curFloor);
    if(others.length&&AUS_CENTRE_FILTER){
      const cards=ausLibCardsForCentre(AUS_CENTRE_FILTER);
      others.forEach(fl=>{
        const hit=cards.find(({l})=>{
          const fv=typeof l.floor==='object'?(l.floor.en||Object.values(l.floor)[0]||''):(l.floor||'');
          return (String(fv).match(/\d+/)||[])[0]===fl;
        });
        const murl=hit?.l?.fp_plans?.[0]?.url;
        if(murl&&!EXTRA_MASTERS.some(m=>m.url===murl)){
          EXTRA_MASTERS.push({url:murl,label:'Level '+fl});_newMasters++;
        }
      });
      if(_newMasters) renderExtraMasters();
    }
  }catch(e){console.warn('multi-floor:',e);}
  if(FP_BASE_URL) renderFpList();
  renderPrFpChips();
  gen();
  showStatus(`Added ${AUS_SELECTED.size} office${AUS_SELECTED.size!==1?'s':''} to pricing rows${FP_BASE_URL?' and floor plan':''}.${_newMasters?` ⧉ ${_newMasters} extra floor master page${_newMasters>1?'s':''} will be added to the PDF.`:''}`,'s-ok');
  AUS_SELECTED.clear();
  renderAusLookup();
  document.getElementById('pr-rows')?.scrollIntoView({behavior:'smooth',block:'nearest'});
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
    const raw_centre=(cCol>=0?row[cCol]:'').replace(/AUS\s*-\s*/,'').trim();
    const oid=(oCol>=0?row[oCol]:'').trim();
    if(!oid||!raw_centre||!raw_centre.match(/\d/)) continue;
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

    AUS_OFFICES[oid]={
      c:raw_centre,
      vt:(vtCol>=0?row[vtCol]:'').trim(),
      v:(vCol>=0&&vCol!==vtCol?row[vCol]:'').trim(),
      w:Math.round(parseFloat((wCol>=0?row[wCol]:'')||'0'))||0,
      sq:parseFloat((sqCol>=0?row[sqCol]:'')||'0')||0,
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
  return count;
}




// ── AUS ↔ Library Sync ───────────────────────────────────────────────────────
const AUS_CENTRE_NAMES = [
  '141 Walker Street','207 Kent Street','360 Collins Street',
  '459 Collins Street','570 Bourke Street','9 Castlereagh'
];

function ausCentreForCardName(cardName){
  if(!cardName) return '';
  const n = cardName.toLowerCase();
  // Match if card name starts with at least the first 2 words of a centre
  return AUS_CENTRE_NAMES.find(c => {
    const prefix = c.toLowerCase().split(' ').slice(0,2).join(' ');
    return n.startsWith(prefix);
  }) || '';
}

function ausLibCardsForCentre(centre){
  if(!centre) return [];
  const lib = getLib();
  const prefix = centre.toLowerCase().split(' ').slice(0,2).join(' ');
  return lib.map((l,i)=>({l,i})).filter(({l})=>{
    const n = (typeof l.name==='object'?(l.name.en||''):l.name||'').toLowerCase();
    return n.startsWith(prefix);
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

  // Multiple matches → prompt user to pick a floor
  bar.innerHTML='<span style="font-size:9.5px;font-weight:700;color:var(--o);white-space:nowrap;">Select floor:</span>'
    +matches.map(({l,i})=>{
      const floor=getFloor({l});
      // Extract numeric floor for office # filtering (e.g. "21F" → "21")
      const floorNum=(floor.match(/^(\d+)[Ff]/)||[])[1]||'';
      return `<button onmousedown="event.preventDefault();_ausLoadCardAndFilter(${i},'${floorNum}')" style="padding:2px 10px;border:1.5px solid var(--o);border-radius:20px;background:var(--olt);color:var(--o);font-size:11.5px;font-weight:800;font-family:inherit;cursor:pointer;white-space:nowrap;">${floor||'?F'}</button>`;
    }).join('');
}

