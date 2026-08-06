// ══════════════════════════════════════════════════════════
//  PRINT — Cross-browser fix (Safari, Firefox, Chrome, Edge)
//  Replace the existing printSlide() function with this one.
// ══════════════════════════════════════════════════════════
function printSlide(){
  // Ensure preview is up to date
  gen();

  const page1El = document.getElementById('slide');
  const page2El = document.getElementById('slide2');

  if(!page1El){
    alert('Slide not found. Please generate a preview first.');
    return;
  }

  const printFs = '16px';

  // Grab CSS — skip cross-origin (Google Fonts) which throw CORS errors
  // Also strip @media rules that hide mobile elements
  const allCss = Array.from(document.styleSheets)
    .flatMap(ss=>{
      try{
        return Array.from(ss.cssRules).flatMap(r=>{
          if(r.media && r.conditionText && (
            r.conditionText.includes('max-width:768px') ||
            r.conditionText.includes('max-width: 768px')
          )) return [];
          return [r.cssText];
        });
      } catch{ return []; }
    }).join('\n');

  // Open print window synchronously (must be in same call stack as user gesture)
  const w = window.open('','_blank');
  if(!w){
    alert('Pop-ups are blocked. Please allow pop-ups for this site and try again.');
    return;
  }

  // Temporarily show preview if hidden on mobile
  const preview = document.querySelector('.preview');
  const prevDisplay = preview ? preview.style.display : '';
  if(preview) preview.style.display = 'block';

  const page1Html = page1El.outerHTML;
  const page2Html = page2El ? page2El.outerHTML : '';

  if(preview) preview.style.display = prevDisplay;

  // Detect Safari (desktop + iOS) — needs extra timing + hint
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    || /iPad|iPhone|iPod/.test(navigator.userAgent);

  w.document.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=1122">
<title>Compass Offices — One-Pager</title>
<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@300;400;500;600;700;800&family=Noto+Sans+JP:wght@300;400;500;700&family=Noto+Sans+TC:wght@300;400;500;700&display=swap" rel="stylesheet">
<style>
${allCss}

/* ── Cross-browser print reset ── */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
  color-adjust: exact !important;
}

html {
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

body {
  background: #fff;
  overflow: visible;
}

/* ── Page wrapper: use PX not MM — Safari px layout is reliable ── */
/* 297mm = 1122px, 210mm = 794px at 96dpi */
.page-wrap {
  width: 1122px;
  height: 794px;
  max-width: 1122px;
  max-height: 794px;
  overflow: hidden;
  display: block;
  position: relative;
  background: #fff;
  page-break-after: always;
  break-after: page;
  -webkit-break-after: page;
  page-break-inside: avoid;
  break-inside: avoid;
  -webkit-break-inside: avoid;
}
.page-wrap:last-child {
  page-break-after: avoid;
  break-after: avoid;
  -webkit-break-after: avoid;
}
/* ── Inner clip: absolute px dimensions = hard Safari clip ── */
.page-clip {
  position: absolute;
  top: 0; left: 0;
  width: 1122px;
  height: 794px;
  overflow: hidden;
}

/* ── Slides: px dimensions so Safari cannot expand them ── */
.slide, .slide2 {
  --fs: ${printFs} !important;
  width: 1122px !important;
  height: 794px !important;
  max-width: 1122px !important;
  max-height: 794px !important;
  aspect-ratio: unset !important;
  border-radius: 0 !important;
  border: none !important;
  box-shadow: none !important;
  font-size: var(--fs) !important;
  overflow: hidden !important;
  display: grid !important;
  position: relative !important;
}
/* Prevent internal grid overflow in Safari */
.sl-body, .p2-body {
  overflow: hidden !important;
  max-height: 100% !important;
}
.sl-ph-stack, .p2-photos, .sl-specs, .sl-right, .p2-fp-area, .p2-right {
  overflow: hidden !important;
  min-height: 0 !important;
}
/* Ensure padding/border-radius inset is respected in print */
.slide, .slide2 { padding: 3px !important; }

/* ── @page: Chrome + Firefox fully respect this.
   Safari partially does — we add :first/:left/:right variants
   and -webkit- margin prefixes for maximum compatibility. ── */
@page {
  size: 297mm 210mm landscape;
  margin: 0 !important;
  padding: 0 !important;
  -webkit-margin-before: 0 !important;
  -webkit-margin-after: 0 !important;
  -webkit-margin-start: 0 !important;
  -webkit-margin-end: 0 !important;
  /* Suppress headers/footers where browser supports it */
  marks: none;
}
@page :first { size: 297mm 210mm landscape; margin: 0 !important; }
@page :left  { size: 297mm 210mm landscape; margin: 0 !important; }
@page :right { size: 297mm 210mm landscape; margin: 0 !important; }
@page :blank { size: 297mm 210mm landscape; margin: 0 !important; }

/* ── Screen preview ── */
@media screen {
  body {
    padding: 20px;
    background: #888;
    min-height: 100vh;
  }
  .page-wrap {
    margin: 0 auto 24px;
    box-shadow: 0 4px 20px rgba(0,0,0,.35);
  }
  .print-controls {
    position: fixed;
    bottom: 20px;
    right: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    z-index: 999;
    align-items: flex-end;
  }
  .print-btn {
    padding: 12px 24px;
    border: none;
    border-radius: 99px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    font-family: 'Hanken Grotesk', sans-serif;
    display: flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;
  }
  .print-btn-primary {
    background: #FF6600;
    color: #fff;
    box-shadow: 0 3px 12px rgba(255,102,0,.4);
  }
  .print-btn-secondary {
    background: #fff;
    color: #555;
    border: 1.5px solid #ddd;
  }
  .print-hint-box {
    background: #fffbe6;
    border: 2px solid #f0a500;
    border-radius: 10px;
    padding: 12px 16px;
    font-size: 12.5px;
    font-family: 'Hanken Grotesk', sans-serif;
    color: #5a3e00;
    max-width: 260px;
    line-height: 1.65;
    box-shadow: 0 3px 12px rgba(0,0,0,.18);
  }
  .print-hint-box b { color: #c44400; }
}

@media print {
  .print-controls { display: none !important; }
  html, body {
    padding: 0 !important;
    margin: 0 !important;
    background: #fff !important;
    width: 1122px !important;
  }
  .page-wrap {
    width: 1122px !important;
    height: 794px !important;
    max-height: 794px !important;
    margin: 0 !important;
    padding: 0 !important;
    box-shadow: none !important;
    overflow: hidden !important;
  }
  .page-clip {
    position: absolute !important;
    top: 0 !important; left: 0 !important;
    width: 1122px !important;
    height: 794px !important;
    overflow: hidden !important;
  }
  .slide, .slide2 {
    width: 1122px !important;
    height: 794px !important;
    max-height: 794px !important;
    overflow: hidden !important;
  }
}
</style>
</head>
<body>

<!-- Page 1 -->
<div class="page-wrap"><div class="page-clip">${page1Html}</div></div>

<!-- Page 2 -->
${page2Html ? `<div class="page-wrap"><div class="page-clip">${page2Html}</div></div>` : ''}

<!-- Floating controls (screen only) -->
<div class="print-controls">
  <button class="print-btn print-btn-secondary" onclick="window.close()">✕ Close</button>
  <button class="print-btn print-btn-primary" onclick="triggerPrint()">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
    Print / Save PDF
  </button>
</div>

\x3Cscript>
var isSafari = ${isSafari ? 'true' : 'false'};
var printed = false;

// Detect iOS/Firefox for timing only
var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

function triggerPrint(){
  var delay = (isSafari || isIOS) ? 800 : 200;
  setTimeout(function(){ window.print(); }, delay);
}

function autoPrint(){
  if(printed) return;
  printed = true;
  var delay = (isSafari || isIOS) ? 1200 : 400;
  setTimeout(function(){ window.print(); }, delay);
}

// Wait for fonts
if(document.fonts && document.fonts.ready){
  document.fonts.ready.then(function(){
    autoPrint();
  }).catch(function(){
    // Safari sometimes rejects — fall back to timeout
    setTimeout(autoPrint, isSafari ? 1500 : 600);
  });
} else {
  // Older browsers without document.fonts
  setTimeout(autoPrint, isSafari ? 1500 : 800);
}

// Absolute safety net — always print within 4s
setTimeout(function(){
  if(!printed){ printed = true; window.print(); }
}, 4000);
<\/script>

</body>
</html>`);

  w.document.close();
}


// ══════════════════════════════════════════════════════════
//  DOWNLOAD JSON — saves ALL 4 languages in one file
// ══════════════════════════════════════════════════════════
function downloadCurrentJSON(){
  // Save current lang first
  saveLangData(LANG);

  const r=v=>(v||'').trim();
  const slug=getExportName();
  const now=new Date();
  const ts=now.getFullYear().toString().slice(2)+String(now.getMonth()+1).padStart(2,'0')+String(now.getDate()).padStart(2,'0')+'-'+String(now.getHours()).padStart(2,'0')+String(now.getMinutes()).padStart(2,'0');

  // ── Build per-language content from LANG_DATA ─────────────
  // For each lang that has data, extract fields/transport/specs/pricing/benefits
  const langs_data = {};
  LANG_KEYS.forEach(lc => {
    const ld = LANG_DATA[lc];
    if(!ld) return; // never visited — skip
    langs_data[lc] = {
      // text fields
      name:     ld.fields['n-main']   || '',
      address:  ld.fields['addr']     || '',
      floor:    ld.fields['floor']    || '',
      city:     ld.fields['city']     || '',
      page_url: ld.fields['purl']     || '',
      virtual_tour: ld.fields['matterport'] || '',
      custom_title: ld.fields['custom-title'] || '',
      custom_body:  ld.customBody || '',
      // specs (rich html)
      specs: {
        structure:    ld.richFields['s-struct'] || '',
        completion:   ld.richFields['s-comp']   || '',
        ceiling:      ld.richFields['s-ceil']   || '',
        floor_area:   ld.richFields['s-fa']     || '',
        common_area:  ld.richFields['s-ca']     || '',
        oa:           ld.richFields['s-oa']     || '',
        elevators:    ld.richFields['s-el']     || '',
        ac:           ld.richFields['s-ac']     || '',
        network:      ld.richFields['s-net']    || '',
        facilities:   ld.richFields['s-fac']    || '',
        hours:        ld.richFields['s-hrs']    || '',
        parking:      ld.richFields['s-park']   || '',
      },
      // transport lines (with rich html text)
      transport: (ld.transport||[]).map(t=>({iconId:t.iconId, text:t.text})),
      // pricing rows
      pricing: (ld.rows||[]).map(row=>({seats:row.seats,type:row.type,rent:row.rent,mgmt:row.mgmt,init:row.init||'',avail:row.avail})),
      // benefits text per lang
      benefits: (ld.benefits||[]).map(b=>({id:b.id,on:b.on,text:b.text,iconId:b.iconId||null})),
      benefits_title: BENEFITS_TITLE[lc] || '',
    };
  });

  const data = {
    // ── Multi-language content ──
    langs: langs_data,
    // ── Fallback single-lang fields (current lang, for backwards compat) ──
    name:    g('n-main'), city: g('city'), floor: g('floor'),
    address: g('addr'),   page_url: g('purl'),
    virtual_tour: (document.getElementById('matterport')?.value||'').trim(),
    transport: TRANSPORT.map(t=>({iconId:t.iconId,text:t.text})),
    specs: {structure:g('s-struct'),completion:g('s-comp'),ceiling:g('s-ceil'),floor_area:g('s-fa'),common_area:g('s-ca'),oa:g('s-oa'),elevators:g('s-el'),ac:g('s-ac'),network:g('s-net'),facilities:g('s-fac'),hours:g('s-hrs'),parking:g('s-park')},
    pricing: S.rows.map(row=>({seats:row.seats,type:row.type,rent:row.rent,mgmt:row.mgmt,init:row.init||'',avail:row.avail})),
    amenities: AMENITY_ICONS.filter(a=>a.on).map(a=>a.id),
    benefits_on: BENEFITS.filter(b=>b.on).map(b=>b.id),
    custom_title: g('custom-title'),
    custom_body: (document.getElementById('custom-body-editor')?.innerHTML||'').trim(),
    // ── Layout settings (global, same across all langs) ──
    benefits_title: {...BENEFITS_TITLE},
    benefits_pos:  BENEFITS_POS,
    custom_pos:    CUSTOM_POS,
    show_specs:    SHOW_SPECS,
    hidden_specs:  [...HIDDEN_SPECS],
    logo_separator: LOGO_SEP,
    pricing_cols:  PRICING_COLS.map(col=>({key:col.key,on:col.on,labels:{...col.labels}})),
    // ── Media (global) ──
    partner_logo_url: (S.partnerLogo&&!S.partnerLogo.startsWith('data:'))?S.partnerLogo:'',
    photos: S.photos.map(p=>(p&&!p.startsWith('data:'))?_stripCb(p):null),
    floorplan_url: (S.floorplan&&!S.floorplan.startsWith('data:'))?_stripCb(S.floorplan):'',
    fp_plans: FP_PLANS.map(p=>({url:p.url&&!p.url.startsWith('data:')?_stripCb(p.url):'',label:p.label||''})),
    extra_masters: EXTRA_MASTERS.map(m=>({url:_stripCb(m.url),label:m.label||''})),
    fp_page2_same: FP_PAGE2_SAME,
    fp_page1_idx: FP_PAGE1_IDX,
    fp_page2_idx: FP_PAGE2_IDX,
    fp_base_url: FP_BASE_URL,
    icon_overrides: window.ICON_OVERRIDES||{},
  };

  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=(slug||'location')+'_'+ts+'.json';a.click();
}

// ══════════════════════════════════════════════════════════
//  RESPONSIVE FONT SIZE
// ══════════════════════════════════════════════════════════
function updateSlideFS(){
  const slideWrap=document.querySelector('.slide-wrap');
  if(!slideWrap)return;
  gen();
}
let _resizeTimer=null;
window.addEventListener('resize',()=>{clearTimeout(_resizeTimer);_resizeTimer=setTimeout(updateSlideFS,180);});

// ══════════════════════════════════════════════════════════
//  MOBILE
// ══════════════════════════════════════════════════════════
function toggleMobilePreview(){
  const preview=document.querySelector('.preview');
  const sidebar=document.querySelector('.sidebar');
  const btn=document.getElementById('mob-preview-btn');
  if(!preview)return;
  const isShowing=!preview.classList.contains('mob-hidden');
  if(isShowing){preview.classList.add('mob-hidden');sidebar.style.display='';if(btn){btn.classList.remove('showing');btn.textContent='View Preview';}}
  else{preview.classList.remove('mob-hidden');sidebar.style.display='none';if(btn){btn.classList.add('showing');btn.textContent='← Back to Edit';}}
}
function mobBackToEdit(){
  const preview=document.querySelector('.preview');
  const sidebar=document.querySelector('.sidebar');
  const bar=document.getElementById('mob-preview-bar');
  if(preview){preview.classList.add('mob-hidden');preview.style.display='';}
  if(sidebar)sidebar.style.display='';
  if(bar)bar.style.display='none';
  setMobTab('loc');
}
// setMobTab replaced by mobOpenTab/mobShowPreview

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
      rows:JSON.parse(JSON.stringify(ld.rows||[])),
      benefits:ld.benefits.map(b=>({...b})),
      amenities:[...ld.amenities],
      benPos:ld.benPos,customPos:ld.customPos,
      benefits_title:BENEFITS_TITLE[lc]||'',
    };
  });
  return {
    langs:langs_snap,
    benefits_pos:BENEFITS_POS,custom_pos:CUSTOM_POS,
    show_specs:SHOW_SPECS,hidden_specs:[...HIDDEN_SPECS],
    logo_separator:LOGO_SEP,
    pricing_cols:PRICING_COLS.map(col=>({key:col.key,on:col.on,labels:{...col.labels}})),
    amenities:AMENITY_ICONS.map(a=>a.on),
    benefits_on:BENEFITS.filter(b=>b.on).map(b=>b.id),
    photos:S.photos.map(p=>p&&!p.startsWith('data:')?p:(p?'__local__':null)),
    photos_data:S.photos.map(p=>p&&p.startsWith('data:')?p:null),
    floorplan_url:S.floorplan&&!S.floorplan.startsWith('data:')?S.floorplan:'',
    floorplan_data:S.floorplan&&S.floorplan.startsWith('data:')?S.floorplan:null,
    partner_logo_url:S.partnerLogo&&!S.partnerLogo.startsWith('data:')?S.partnerLogo:'',
    icon_overrides:window.ICON_OVERRIDES?{...window.ICON_OVERRIDES}:{},
    fp_plans:FP_PLANS.map(p=>({url:p.url,label:p.label})),
    fp_page2_same:FP_PAGE2_SAME,fp_page1_idx:FP_PAGE1_IDX,fp_page2_idx:FP_PAGE2_IDX,fp_base_url:FP_BASE_URL,
    extra_masters:EXTRA_MASTERS.map(m=>({...m})),
    benefits_title:{...BENEFITS_TITLE},
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
    });
  }

  // ── 2. Restore global layout/display state ─────────────────────────────────
  if(state.benefits_pos)       setBenPos(state.benefits_pos);
  if(state.custom_pos)         setCustomPos(state.custom_pos);
  if(state.show_specs===false) { SHOW_SPECS=false; } else { SHOW_SPECS=true; }
  if(state.hidden_specs)       { HIDDEN_SPECS.clear(); state.hidden_specs.forEach(id=>HIDDEN_SPECS.add(id)); }
  if(state.logo_separator)     setSep(state.logo_separator);
  if(state.icon_overrides)     { window.ICON_OVERRIDES={...state.icon_overrides}; }

  // ── 3. Restore pricing columns ─────────────────────────────────────────────
  if(state.pricing_cols) state.pricing_cols.forEach(sc=>{
    const col=PRICING_COLS.find(c=>c.key===sc.key);
    if(col){ col.on=sc.on; col.labels={...sc.labels}; }
  });

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
  EXTRA_MASTERS=(state.extra_masters||[]).map(m=>({...m}));renderExtraMasters();
  if(state.fp_plans&&state.fp_plans.length){
    FP_PLANS=state.fp_plans.map(p=>({url:p.url,label:p.label}));
    FP_PAGE2_SAME=state.fp_page2_same!==false;
    FP_PAGE1_IDX=state.fp_page1_idx!==undefined?state.fp_page1_idx:-2;
    FP_PAGE2_IDX=state.fp_page2_idx!==undefined?state.fp_page2_idx:0;
    FP_BASE_URL=state.fp_base_url||'';
    S.floorplan=FP_PLANS[0]?.url||null;
  } else if(state.floorplan_url){
    S.floorplan=state.floorplan_url;
    FP_PLANS=[{url:state.floorplan_url,label:'master'}];
    FP_BASE_URL=state.floorplan_url.replace(/[^/]+\.jpg$/i,'');
  }
  if(state.floorplan_data){
    S.floorplan=state.floorplan_data;
    if(FP_PLANS.length) FP_PLANS[0].url=state.floorplan_data;
    else FP_PLANS=[{url:state.floorplan_data,label:'Master'}];
  }

  // ── 9. Load current lang into DOM and re-render everything ─────────────────
  const bTitleInp=document.getElementById('benefits-title-input');
  if(bTitleInp) bTitleInp.value=BENEFITS_TITLE[LANG]||'';
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
}

function updateQueueBadge(){
  const badge=document.getElementById('queue-count');
  const btn=document.getElementById('queue-btn');
  if(!badge||!btn) return;
  const n=PDF_QUEUE.length;
  badge.textContent=n;
  badge.style.display=n>0?'block':'none';
  btn.style.borderColor=n>0?'var(--o)':'var(--bd)';
  btn.style.color=n>0?'var(--o)':'var(--mid)';
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
        <div style="display:flex;gap:4px;margin-top:3px;">
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

async function addToQueue(){
  const btn=document.getElementById('queue-btn');
  const origHTML=btn?btn.innerHTML:'';
  if(btn){btn.innerHTML='<span style="display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;border:2px solid rgba(0,0,0,.2);border-top-color:var(--o);border-radius:50%;animation:spin .65s linear infinite;display:inline-block"></span>Adding…</span>';btn.disabled=true;}
  try{
    const name=getExportName()||'Location';
    gen._captureMode=true;gen();gen._captureMode=false;
    const cv1=await slideToCanvas('slide');
    const cv2=await slideToCanvas('slide2');
    const thumb=cv1?cv1.toDataURL('image/jpeg',0.5):'';
    const cv1Data=cv1?cv1.toDataURL('image/jpeg',0.92):'';
    const cv2Data=cv2?cv2.toDataURL('image/jpeg',0.92):'';
    const extraDataUrls=await captureExtraMasterPages(0.92);
    const state=buildStateSnapshot();
    PDF_QUEUE.push({name,thumb,cv1DataUrl:cv1Data,cv2DataUrl:cv2Data,extraDataUrls,state});
    renderQueueList();
    updateQueueBadge();
    // Show panel
    const panel=document.getElementById('queue-panel');
    if(panel) panel.style.display='flex';
    showStatus(`"${name}" added to queue (${PDF_QUEUE.length} item${PDF_QUEUE.length!==1?'s':''})`, 's-ok');
  }catch(err){
    console.error('Queue error:',err);
    alert('Failed to add to queue: '+err.message);
  }finally{
    if(btn){btn.innerHTML=origHTML;btn.disabled=false;}
  }
}

async function exportQueuePDF(){
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
      (item.extraDataUrls||[]).forEach(du=>{pdf.addPage();pdf.addImage(du,'JPEG',0,0,297,210);});
    });
    const filename=PDF_QUEUE.map(i=>i.name).join('-').slice(0,60)||'queue';
    pdf.save(filename+'.pdf');
    showStatus(`Exported ${PDF_QUEUE.length} location${PDF_QUEUE.length!==1?'s':''} (${PDF_QUEUE.length*2} pages) as PDF.`,'s-ok');
  }catch(err){
    console.error('Export queue error:',err);
    alert('Export failed: '+err.message);
  }finally{
    if(exportBtn){exportBtn.innerHTML=origHTML;exportBtn.disabled=false;}
  }
}

// ══════════════════════════════════════════════════════════
//  EMAIL TEMPLATE
// ══════════════════════════════════════════════════════════

// Returns array of location data objects — from queue if queued, else current slide
function _emailGetLocations(){
  if(PDF_QUEUE && PDF_QUEUE.length > 0){
    return PDF_QUEUE.map(item=>{
      const st = item.state || {};
      const langs = st.langs || {};
      const enData = langs['en'] || langs[Object.keys(langs)[0]] || {};
      const fields = enData.fields || {};
      const rows = enData.rows || [];
      const benefits = (enData.benefits || []).filter(b=>b.on&&b.text);
      const mRaw = fields['matterport'] || '';
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
      };
    });
  }
  // Fallback: current slide state
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

  const LOGO_URL = 'https://mcusercontent.com/129a8274b9209d36e9ea65b85/images/36e8b04d-71c6-03ee-2bee-d3346bb299d8.png';

  // Build per-location sections
  const locationSections = locations.map((loc, li)=>{
    const hasPricing = loc.rows && loc.rows.length > 0;
    const activeCols = PRICING_COLS.filter(col=>col.on);

    const pricingHTML = hasPricing ? `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;font-size:13px;margin:16px 0;">
  <thead><tr style="background:#FF6600;">
    ${activeCols.map(col=>`<th style="padding:10px 14px;text-align:left;color:#ffffff;font-weight:700;font-family:Arial,sans-serif;white-space:nowrap;font-size:12px;">${getPricingColLabel(col.key)}</th>`).join('')}
  </tr></thead>
  <tbody>
    ${loc.rows.map((r,ri)=>`<tr style="background:${ri%2===0?'#ffffff':'#fff9f5'};">
      ${activeCols.map(col=>{
        const v=(r[col.key]||'').replace(/<[^>]+>/g,'');
        const isPrice=col.key==='mgmt'||col.key==='avail';
        return `<td style="padding:9px 14px;border-bottom:1px solid #f2e8e3;font-family:Arial,sans-serif;font-size:13px;${isPrice?'color:#FF6600;font-weight:700;':''}">${v}</td>`;
      }).join('')}
    </tr>`).join('')}
  </tbody>
</table>` : '';

    const toursHTML = loc.tours&&loc.tours.length ? `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0 8px;">
  <tr><td>
    <p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#333;">Virtual Tour${loc.tours.length>1?'s':''}</p>
    ${loc.tours.map((url,i)=>`<a href="${url}" target="_blank" style="display:inline-block;margin:0 8px 8px 0;padding:10px 24px;background:#FF6600;color:#ffffff;font-family:Arial,sans-serif;font-size:13px;font-weight:700;text-decoration:none;">${loc.tours.length>1?`Tour ${i+1} →`:'View Virtual Tour →'}</a>`).join('')}
  </td></tr>
</table>` : '';

    const pageBtn = loc.pageUrl ? `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:12px 0;">
  <tr><td><a href="${loc.pageUrl}" target="_blank" style="display:inline-block;padding:10px 24px;border:2px solid #FF6600;color:#FF6600;font-family:Arial,sans-serif;font-size:13px;font-weight:700;text-decoration:none;">View Location Page →</a></td></tr>
</table>` : '';

    // Location divider header (multi-location only)
    const locHeader = isMulti ? `
<tr><td style="padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="background:#fff3ec;border-left:4px solid #FF6600;padding:14px 20px;${li>0?'border-top:2px solid #ffe4d0;':''}">
        <span style="font-family:Arial,sans-serif;font-size:15px;font-weight:800;color:#FF6600;">${loc.locName}</span>
        ${loc.floor?`<span style="display:inline-block;margin-left:8px;background:#FF6600;color:#fff;font-family:Arial,sans-serif;font-size:11px;font-weight:700;padding:2px 8px;">${loc.floor}</span>`:''}
        ${loc.city||loc.addr?`<div style="font-family:Arial,sans-serif;font-size:12px;color:#999;margin-top:3px;">${[loc.addr,loc.city].filter(Boolean).join(' · ')}</div>`:''}
      </td>
    </tr>
  </table>
</td></tr>` : '';

    return `${locHeader}
<tr><td style="padding:${li>0?'0 36px 28px':'0 36px 28px'};${li===0&&!isMulti?'padding-top:0;':'padding-top:20px;'}">
  ${hasPricing?`<p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#FF6600;">Pricing</p>${pricingHTML}`:''}
  ${toursHTML}${pageBtn}
</td></tr>`;
  }).join('');

  // Benefits (from first location, shown once)
  const bens = firstLoc.benefits||[];
  const bensHTML = bens.length ? bens.map(b=>`<li style="margin:5px 0;font-family:Arial,sans-serif;font-size:13.5px;color:#444;line-height:1.6;">${b.text}</li>`).join('')
    : `<li style="margin:5px 0;font-family:Arial,sans-serif;font-size:13.5px;color:#444;line-height:1.6;">24/7 access to private offices and lounge areas</li>
       <li style="margin:5px 0;font-family:Arial,sans-serif;font-size:13.5px;color:#444;line-height:1.6;">Fully furnished with high-speed Wi-Fi, unlimited tea, coffee &amp; filtered water</li>
       <li style="margin:5px 0;font-family:Arial,sans-serif;font-size:13.5px;color:#444;line-height:1.6;">Office amenities — photocopying, printing, air conditioning &amp; daily cleaning</li>
       <li style="margin:5px 0;font-family:Arial,sans-serif;font-size:13.5px;color:#444;line-height:1.6;">Professional business address, mail handling &amp; friendly centre team</li>
       <li style="margin:5px 0;font-family:Arial,sans-serif;font-size:13.5px;color:#444;line-height:1.6;">Secure building with concierge, end-of-trip facilities &amp; utilities included</li>
       <li style="margin:5px 0;font-family:Arial,sans-serif;font-size:13.5px;color:#444;line-height:1.6;">Monthly credits for meeting rooms and printing</li>`;

  const locTitle = isMulti
    ? locations.map(l=>l.locName+(l.floor?' '+l.floor:'')).join(' · ')
    : [firstLoc.locName, firstLoc.floor].filter(Boolean).join(' – ');

  return `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>Compass Offices Proposal</title>
</head>
<body style="margin:0;padding:0;background:#f0f0f0;-webkit-text-size-adjust:100%;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0f0f0;padding:32px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;max-width:600px;width:100%;">

  <!-- LOGO HEADER — white background -->
  <tr>
    <td style="background:#ffffff;padding:24px 36px 20px;border-bottom:3px solid #FF6600;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td><img src="${LOGO_URL}" alt="Compass Offices" height="36" style="display:block;height:36px;max-width:200px;" border="0"></td>
        ${firstLoc.city&&!isMulti?`<td align="right"><span style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:#FF6600;letter-spacing:.1em;text-transform:uppercase;">${firstLoc.city}</span></td>`:''}
      </tr></table>
    </td>
  </tr>

  <!-- ORANGE LOCATION BANNER -->
  <tr>
    <td style="background:#FF6600;padding:22px 36px;">
      <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:rgba(255,255,255,0.75);text-transform:uppercase;letter-spacing:.08em;">Office Proposal</p>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:20px;font-weight:800;color:#ffffff;line-height:1.25;">${locTitle}</p>
      ${!isMulti&&firstLoc.addr?`<p style="margin:6px 0 0;font-family:Arial,sans-serif;font-size:12px;color:rgba(255,255,255,0.8);">${firstLoc.addr}</p>`:''}
      ${isMulti?`<p style="margin:8px 0 0;font-family:Arial,sans-serif;font-size:12px;color:rgba(255,255,255,0.8);">${locations.length} locations included in this proposal</p>`:''}
    </td>
  </tr>

  <!-- GREETING & BENEFITS -->
  <tr>
    <td style="padding:28px 36px 8px;">
      <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;color:#1a1a1a;">Hello <strong>${toName||'there'}</strong>,</p>
      <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:13.5px;color:#555;line-height:1.65;">Thank you for your interest in <strong>Compass Offices</strong>${firstLoc.city&&!isMulti?`, ${firstLoc.city}`:''}. I hope this email finds you well.</p>
      <p style="margin:0 0 14px;font-family:Arial,sans-serif;font-size:13.5px;color:#555;line-height:1.65;">I am pleased to share the proposal${company?` for <strong>${company}</strong>`:''} for your review. Compass Offices offers a range of benefits to meet your business needs, including:</p>
      <ul style="margin:0 0 8px;padding-left:20px;">${bensHTML}</ul>
    </td>
  </tr>

  <!-- LOCATION SECTIONS (pricing, tours) -->
  ${locationSections}

  <!-- DIVIDER -->
  <tr><td style="padding:0 36px;"><hr style="border:none;border-top:1px solid #eee;margin:4px 0 20px;"></td></tr>

  <!-- SIGN-OFF -->
  <tr>
    <td style="padding:0 36px 32px;">
      <p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:13.5px;color:#555;line-height:1.65;">If you have any questions or would like to discuss further, please do not hesitate to reach out directly. I am available by mobile or email and would be happy to speak with you.</p>
      <p style="margin:0 0 18px;font-family:Arial,sans-serif;font-size:13.5px;color:#555;line-height:1.65;">I look forward to the opportunity to assist you further.</p>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:13.5px;color:#1a1a1a;line-height:1.7;">Best regards,<br>
        <strong style="font-size:15px;color:#FF6600;">${fromName||'[Your Name]'}</strong><br>
        <span style="font-size:12px;color:#888;">Compass Offices</span>
      </p>
    </td>
  </tr>

  <!-- FOOTER -->
  <tr>
    <td style="background:#f7f7f7;padding:20px 36px;border-top:1px solid #eeeeee;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td><img src="${LOGO_URL}" alt="Compass Offices" height="22" style="display:block;height:22px;opacity:0.5;" border="0"></td>
        <td align="right"><a href="https://www.compassoffices.com" style="font-family:Arial,sans-serif;font-size:11px;color:#aaaaaa;text-decoration:none;">compassoffices.com</a></td>
      </tr></table>
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

function emailOpenMailto(){
  // Show plain text in a pre-selected textarea inside the modal — reliable for all email clients
  const toName   = document.getElementById('email-to-name')?.value.trim()   || '';
  const fromName = document.getElementById('email-from-name')?.value.trim() || '[Your Name]';
  const company  = document.getElementById('email-company')?.value.trim()   || '';
  const plain = buildEmailPlainText(toName, fromName, company);

  // Replace preview with selectable textarea
  const preview = document.getElementById('email-preview');
  if(!preview) return;

  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'background:#fff;border-radius:10px;overflow:hidden;';
  wrapper.innerHTML = `
    <div style="background:#f0f0f0;padding:10px 14px;font-size:12px;color:#666;font-weight:600;display:flex;align-items:center;justify-content:space-between;">
      <span>Plain text — <strong>Select all &amp; copy</strong>, then paste into your email</span>
      <button onclick="
        const ta=this.closest('div').nextElementSibling;
        ta.select();ta.setSelectionRange(0,ta.value.length);
        document.execCommand('copy');
        this.textContent='✓ Copied!';
        setTimeout(()=>this.textContent='Copy all',2000);
      " style="border:none;background:#FF6600;color:#fff;border-radius:5px;padding:4px 10px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;">Copy all</button>
    </div>
    <textarea readonly style="width:100%;height:360px;border:none;outline:none;padding:14px;font-family:monospace;font-size:12px;line-height:1.6;resize:none;color:#333;box-sizing:border-box;">${plain.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</textarea>`;
  preview.innerHTML = '';
  preview.appendChild(wrapper);

  // Auto-select the textarea
  const ta = wrapper.querySelector('textarea');
  setTimeout(()=>{ ta.focus(); ta.select(); ta.setSelectionRange(0,ta.value.length); }, 50);
}

function buildEmailPlainText(toName, fromName, company){
  // Build locations list: queue items if any, else current slide
  const locations = _emailGetLocations();
  const subject = company
    ? `Your Compass Offices Proposal – ${company}`
    : `Your Compass Offices Proposal – ${(locations[0]?.name||'Compass Offices')}`;

  let body = `Subject: ${subject}\n\n`;
  body += `Hello ${toName||'[Client Name]'},\n\n`;
  body += `Thank you for your interest in Compass Offices. I hope this email finds you well.\n\n`;
  body += `I am pleased to share the proposal${company?` for ${company}`:''} for your review.\n\n`;

  locations.forEach((loc, li)=>{
    if(locations.length > 1) body += `\n${'═'.repeat(50)}\n${loc.name}\n${'═'.repeat(50)}\n`;

    if(loc.rows && loc.rows.length){
      const activeCols = PRICING_COLS.filter(c=>c.on);
      body += `\nPRICING\n${'─'.repeat(40)}\n`;
      loc.rows.forEach(r=>{
        const parts = activeCols.map(col=>{ const v=(r[col.key]||'').replace(/<[^>]+>/g,''); return v?`${getPricingColLabel(col.key)}: ${v}`:''; }).filter(Boolean);
        body += parts.join(' | ') + '\n';
      });
    }
    if(loc.tours && loc.tours.length){
      body += `\nVIRTUAL TOUR${loc.tours.length>1?'S':''}\n`;
      loc.tours.forEach((u,i)=>{ body += (loc.tours.length>1?`Tour ${i+1}: `:'')+u+'\n'; });
    }
    if(loc.pageUrl) body += `\nLocation page: ${loc.pageUrl}\n`;
  });

  body += `\n${'─'.repeat(40)}\n`;
  body += `Please don't hesitate to reach out if you have any questions.\n\nBest regards,\n${fromName||'[Your Name]'}\nCompass Offices`;
  return body;
}

async function slideToCanvas(elId){
  const el=document.getElementById(elId);
  if(!el) return document.createElement('canvas');

  const preview=document.querySelector('.preview');
  const prevPreviewD=preview?preview.style.display:'';
  const prevPreviewV=preview?preview.style.visibility:'';
  if(preview){preview.style.display='block';preview.style.visibility='visible';}

  const prevW=el.style.width,prevH=el.style.height,prevAR=el.style.aspectRatio;
  const prevPos=el.style.position,prevLeft=el.style.left,prevTop=el.style.top;
  el.style.width='1122px';el.style.height='794px';el.style.aspectRatio='unset';
  el.style.position='fixed';el.style.left='-9999px';el.style.top='0';
  gen();

  const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  await new Promise(r=>setTimeout(r,isIOS?300:80));
  await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));

  // ── Step 0: Pre-render collage grids to canvas ──────────────────────────────
  const collageRestores=[];
  for(const collage of Array.from(el.querySelectorAll('.sl-fp-collage'))){
    const rect=collage.getBoundingClientRect();
    const cw=Math.round(rect.width)||collage.offsetWidth||400;
    const ch=Math.round(rect.height)||collage.offsetHeight||300;
    if(!cw||!ch) continue;
    const imgs=Array.from(collage.querySelectorAll('img'));
    if(!imgs.length) continue;
    const n=imgs.length;
    const cols=n===2?2:n===3?3:n<=4?2:3;
    const rows=Math.ceil(n/cols);
    const cellW=Math.floor(cw/cols),cellH=Math.floor(ch/rows);
    const scale=2;
    const cv=document.createElement('canvas');
    cv.width=cw*scale;cv.height=ch*scale;
    const ctx=cv.getContext('2d');
    ctx.fillStyle='#fff';ctx.fillRect(0,0,cv.width,cv.height);
    const loadImg=src=>new Promise(res=>{if(!src){res(null);return;}const i=new Image();i.crossOrigin='anonymous';i.onload=()=>res(i);i.onerror=()=>{const i2=new Image();i2.onload=()=>res(i2);i2.onerror=()=>res(null);i2.src=src;};i.src=src;});
    const loaded=await Promise.all(imgs.map(img=>loadImg(img.src||'')));
    loaded.forEach((image,pi)=>{
      if(!image)return;
      const col=pi%cols,row=Math.floor(pi/cols);
      const dx=col*cellW*scale,dy=row*cellH*scale,dw=cellW*scale,dh=cellH*scale;
      const sc=Math.min(dw/image.naturalWidth,dh/image.naturalHeight);
      const sw=image.naturalWidth*sc,sh=image.naturalHeight*sc;
      ctx.fillStyle='#fff';ctx.fillRect(dx,dy,dw,dh);
      ctx.drawImage(image,dx+(dw-sw)/2,dy+(dh-sh)/2,sw,sh);
    });
    const replacement=document.createElement('img');
    replacement.src=cv.toDataURL('image/png');
    replacement.style.cssText=`width:${cw}px;height:${ch}px;display:block;object-fit:contain;`;
    collage.parentNode.replaceChild(replacement,collage);
    collageRestores.push(()=>replacement.parentNode&&replacement.parentNode.replaceChild(collage,replacement));
  }

  // ── Step 1: Build image data-URL map ────────────────────────────────────────
  const dataURLMap=new Map();
  const allImgs=Array.from(el.querySelectorAll('img'));
  const origSrcs=new Map();
  allImgs.forEach(img=>{if(img.src&&!img.src.startsWith('data:'))origSrcs.set(img,img.src);});

  await Promise.all([...origSrcs.entries()].map(([img,src])=>new Promise(res=>{
    const t=new Image();t.crossOrigin='anonymous';
    t.onload=()=>{const cv=document.createElement('canvas');cv.width=t.naturalWidth;cv.height=t.naturalHeight;cv.getContext('2d').drawImage(t,0,0);try{dataURLMap.set(src,cv.toDataURL('image/jpeg',0.95));}catch(e){}res();};
    t.onerror=()=>res();t.src=src;
  })));

  // ── Step 2: Apply data URLs ──────────────────────────────────────────────────
  allImgs.forEach(img=>{const du=dataURLMap.get(img.src);if(du)img.src=du;});

  // ── Step 3: Fix object-fit ───────────────────────────────────────────────────
  const fitRestores=[];
  allImgs.forEach(img=>{
    if(!img.complete||img.naturalWidth===0)return;
    const cs=getComputedStyle(img);
    const fit=cs.objectFit;
    if(fit!=='cover'&&fit!=='contain')return;
    const r=img.getBoundingClientRect();
    if(!r.width||!r.height)return;
    const cv=document.createElement('canvas');
    cv.width=Math.round(r.width);cv.height=Math.round(r.height);
    const ctx=cv.getContext('2d');
    const iw=img.naturalWidth,ih=img.naturalHeight;
    let sx=0,sy=0,sw=iw,sh=ih,dw=cv.width,dh=cv.height;
    if(fit==='cover'){const s=Math.max(dw/iw,dh/ih);sw=dw/s;sh=dh/s;sx=(iw-sw)/2;sy=(ih-sh)/2;}
    else{const s=Math.min(dw/iw,dh/ih);const rw=iw*s,rh=ih*s;ctx.fillStyle='#fff';ctx.fillRect(0,0,dw,dh);sx=0;sy=0;sw=iw;sh=ih;dw=rw;dh=rh;const ox=(cv.width-rw)/2,oy=(cv.height-rh)/2;ctx.drawImage(img,sx,sy,sw,sh,ox,oy,dw,dh);const du=cv.toDataURL('image/jpeg',0.95);const origSrc=img.src;const origStyle=img.style.cssText;img.src=du;img.style.objectFit='fill';fitRestores.push(()=>{img.src=origSrc;img.style.cssText=origStyle;});return;}
    ctx.drawImage(img,sx,sy,sw,sh,0,0,cv.width,cv.height);
    const du=cv.toDataURL('image/jpeg',0.95);
    const origSrc=img.src,origStyle=img.style.cssText;
    img.src=du;img.style.objectFit='fill';
    fitRestores.push(()=>{img.src=origSrc;img.style.cssText=origStyle;});
  });

  // ── Step 4: html2canvas ──────────────────────────────────────────────────────
  let canvas;
  try{
    canvas=await html2canvas(el,{
      scale:isIOS?1.5:2,useCORS:true,allowTaint:false,backgroundColor:'#fff',
      width:1122,height:794,windowWidth:1122,windowHeight:794,
      onclone:(doc)=>{
        const cloneEl=doc.getElementById(elId);
        if(cloneEl){cloneEl.style.position='static';cloneEl.style.left='0';cloneEl.style.top='0';}
      }
    });
  }catch(e){console.error('html2canvas error:',e);canvas=document.createElement('canvas');}

  // ── Step 5: Restore ──────────────────────────────────────────────────────────
  collageRestores.forEach(fn=>fn());
  fitRestores.forEach(fn=>fn());
  allImgs.forEach(img=>{const orig=origSrcs.get(img);if(orig)img.src=orig;});
  el.style.width=prevW;el.style.height=prevH;el.style.aspectRatio=prevAR;
  el.style.position=prevPos;el.style.left=prevLeft;el.style.top=prevTop;
  if(preview){preview.style.display=prevPreviewD;preview.style.visibility=prevPreviewV;}
  gen();
  return canvas;
}

async function downloadPDF(){
  const btn=document.getElementById('pdf-btn');
  const lbl=document.getElementById('pdf-btn-label');
  const origHTML=btn?btn.innerHTML:'';
  if(btn){btn.style.opacity='0.6';btn.disabled=true;}
  if(lbl) lbl.textContent='Generating…';
  try{
    gen._captureMode=true;gen();gen._captureMode=false;
    const cv1=await slideToCanvas('slide');
    const cv2=await slideToCanvas('slide2');
    const {jsPDF}=window.jspdf;
    const pdf=new jsPDF({orientation:'landscape',unit:'mm',format:'a4'});
    if(cv1) pdf.addImage(cv1.toDataURL('image/jpeg',0.95),'JPEG',0,0,297,210);
    if(cv2){pdf.addPage();pdf.addImage(cv2.toDataURL('image/jpeg',0.95),'JPEG',0,0,297,210);}
    const _extras=await captureExtraMasterPages(0.95);
    _extras.forEach(du=>{pdf.addPage();pdf.addImage(du,'JPEG',0,0,297,210);});
    pdf.save(getExportName()+'.pdf');
  }catch(err){console.error('PDF error:',err);alert('PDF export failed: '+err.message);}
  finally{
    gen();
    if(btn){btn.innerHTML=origHTML;btn.style.opacity='1';btn.disabled=false;}
    if(lbl) lbl.textContent='↓ PDF';
  }
}

async function downloadJPG(){
  gen._captureMode=true;gen();gen._captureMode=false;
  const btn=document.getElementById('pdf-btn');
  const lbl=document.getElementById('pdf-btn-label');
  if(lbl) lbl.textContent='Saving…';
  try{
    const cv1=await slideToCanvas('slide');
    const cv2=await slideToCanvas('slide2');
    const name=getExportName();
    if(navigator.share&&navigator.canShare&&cv1&&cv2){
      const toFile=(cv,n)=>new Promise(res=>{cv.toBlob(b=>res(new File([b],n,{type:'image/jpeg'})),'image/jpeg',0.93);});
      try{
        const files=[await toFile(cv1,name+'_p1.jpg'),await toFile(cv2,name+'_p2.jpg')];
        if(navigator.canShare({files})){await navigator.share({files,title:name});return;}
      }catch{}
    }
    // Desktop download
    const a=document.createElement('a');
    if(cv1){a.href=cv1.toDataURL('image/jpeg',0.93);a.download=name+'_p1.jpg';a.click();}
    await new Promise(r=>setTimeout(r,400));
    if(cv2){a.href=cv2.toDataURL('image/jpeg',0.93);a.download=name+'_p2.jpg';a.click();}
  }catch(err){console.error('JPG error:',err);}
  finally{ gen(); if(lbl) lbl.textContent='↓ PDF'; }
}


function getExportName(){
  // Prefer EN name for export filename
  const enData = LANG_DATA['en'];
  const enName = enData?.fields?.['n-main'] || '';
  if(enName) return enName.replace(/[^a-zA-Z0-9一-鿿぀-ヿ]+/g,'-').replace(/^-|-$/g,'');
  const name = document.getElementById('n-main')?.value.trim() || 'compass-offices';
  return name.replace(/[^a-zA-Z0-9一-鿿぀-ヿ]+/g,'-').replace(/^-|-$/g,'');
}

