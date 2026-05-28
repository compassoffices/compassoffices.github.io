// Compass Offices One-Pager Builder
// https://github.com/compassoffices/compassoffices.github.io

function gen(){
  const _captureMode = gen._captureMode || false;
  // Keep highlight render in sync with current pricing rows + manual additions.
  // Cheap when nothing has changed (returns immediately due to cache key check).
  // Triggers async re-render when state has changed; calls gen() again on completion.
  if(typeof ensureHighlightRender === 'function') ensureHighlightRender();
  const name=g('n-main')||'Location Name';
  const addr=g('addr');const city=g('city')||'Hong Kong';const floor=g('floor');const purl=g('purl');
  const trLines=TRANSPORT.filter(t=>(t.text||"").replace(/<[^>]*>/g,"").trim());
  const mkPair=(k1,v1,k2,v2)=>{if(!v1&&!v2)return null;if(v1&&!v2)return{k:k1,v:v1,pair:false};if(!v1&&v2)return{k:k2,v:v2,pair:false};return{k:k1,v:v1,k2,v2,pair:true};};
  const specRows=!SHOW_SPECS?[]:[
    (!HIDDEN_SPECS.has('s-struct')&&g('s-struct'))&&{k:sl('struct'),v:g('s-struct'),pair:false},
    (!HIDDEN_SPECS.has('s-comp')&&g('s-comp'))&&{k:sl('comp'),v:g('s-comp'),pair:false},
    mkPair(HIDDEN_SPECS.has('s-fa')?'':sl('area_fa'),HIDDEN_SPECS.has('s-fa')?'':g('s-fa'),HIDDEN_SPECS.has('s-ca')?'':sl('area_ca'),HIDDEN_SPECS.has('s-ca')?'':g('s-ca')),
    mkPair(HIDDEN_SPECS.has('s-ceil')?'':sl('ceiling'),HIDDEN_SPECS.has('s-ceil')?'':g('s-ceil'),HIDDEN_SPECS.has('s-oa')?'':sl('oa'),HIDDEN_SPECS.has('s-oa')?'':g('s-oa')),
    (!HIDDEN_SPECS.has('s-ac')&&g('s-ac'))&&{k:sl('ac'),v:g('s-ac'),pair:false},
    (!HIDDEN_SPECS.has('s-net')&&g('s-net'))&&{k:sl('net'),v:g('s-net'),pair:false},
    mkPair(HIDDEN_SPECS.has('s-el')?'':sl('lifts'),HIDDEN_SPECS.has('s-el')?'':g('s-el'),HIDDEN_SPECS.has('s-hrs')?'':sl('hrs'),HIDDEN_SPECS.has('s-hrs')?'':g('s-hrs')),
    (!HIDDEN_SPECS.has('s-fac')&&g('s-fac'))&&{k:sl('fac'),v:g('s-fac'),pair:false},
    (!HIDDEN_SPECS.has('s-park')&&g('s-park'))&&{k:sl('park'),v:g('s-park'),pair:false},
  ].filter(Boolean);

  const checked=BENEFITS.filter(b=>b.on);
  const amenChecked=AMENITY_ICONS.filter(a=>a.on);
  const bTitle=getBenefitsTitle();
  // pHdr is built dynamically from PRICING_COLS so every column key
  // (built-in or custom) gets its right header. Previously hardcoded to
  // 6 keys, which silently broke new built-ins (sqm, market) + custom
  // columns by rendering `undefined` headers.
  const pHdr = {};
  PRICING_COLS.forEach(col => { pHdr[col.key] = getPricingColLabel(col.key); });
  // Active (visible) columns
  const activeCols=PRICING_COLS.filter(col=>col.on).map(col=>col.key);

  const nSpecs=specRows.length;const nPricing=S.rows.length;
  const stripTags=h=>(h||'').replace(/<[^>]*>/g,'');
  const estHeight=(s,cpl)=>{const textH=v=>{const raw=stripTags(v||'');const brs=((v||'').match(/<br\s*\/?>/gi)||[]).length;return Math.max(1,Math.ceil(raw.length/cpl)+brs);};let h=0.5+textH(s.v)+0.3;if(s.pair)h+=0.3+0.5+textH(s.v2)+0.3;return h;};
  const toSpan=(h,ncols)=>{if(ncols<=1)return 1;if(h<2.5)return 1;if(h<4.2)return 2;if(h<6.0)return 3;return 4;};
  const simulate=(ncols,cards)=>{const cplMap={1:50,2:32,3:22,4:16};const cpl=cplMap[ncols]||16;const withH=cards.map(s=>{const h=estHeight(s,cpl);const span=toSpan(h,ncols);return{...s,h,span};});const colH=new Array(ncols).fill(0);const placed=withH.map(s=>{const minH=Math.min(...colH);const col=colH.indexOf(minH);const row=colH[col];colH[col]+=s.span;return{...s,gridCol:col+1,gridRow:row+1};});const maxH=Math.max(...colH);const avgH=colH.reduce((a,b)=>a+b,0)/ncols;const imbalance=colH.reduce((a,b)=>a+Math.abs(b-avgH),0);const score=maxH*2+imbalance;return{placed,totalRows:maxH,score,cpl};};

  const hasExtra=trLines.length>0||amenChecked.length>0;
  const pressure=nPricing*1.4+(hasExtra?1:0);
  const minCols=nSpecs<=3?1:nSpecs<=5?(pressure>1?2:1):2;
  const maxCols=nSpecs<=3?2:nSpecs<=5?3:nSpecs<=8?4:4;
  const candidates=[];for(let nc=minCols;nc<=maxCols;nc++)candidates.push(nc);
  let best=null;
  for(const nc of candidates){const result=simulate(nc,specRows);const colPenalty=(nc-minCols)*1.5;const adjustedScore=result.score+colPenalty;if(!best||adjustedScore<best.adjustedScore){best={...result,cols:nc,adjustedScore};}}
  const cols=best.cols;const placed=best.placed;const totalRows=best.totalRows;
  const sizeKey=cols>=4?'xs':cols===3?'sm':cols===2?'md':'lg';
  const specGridHTML=specRows.length?`<div class="sl-specs-grid" data-size="${sizeKey}" style="grid-template-columns:repeat(${cols},1fr);grid-template-rows:repeat(${totalRows},auto)">${placed.map(s=>`<div class="sl-spec-card" style="grid-column:${s.gridCol};grid-row:${s.gridRow}${s.span>1?` / span ${s.span}`:''}">
    ${s.pair?`<div class="sl-spec-lbl">${s.k}</div><div class="sl-spec-val">${s.v}</div><div style="height:1px;background:#E8E8E8;margin:calc(var(--fs)*0.2) 0"></div><div class="sl-spec-lbl">${s.k2}</div><div class="sl-spec-val">${s.v2}</div>`:`<div class="sl-spec-lbl">${s.k}</div><div class="sl-spec-val">${s.v}</div>`}
  </div>`).join('')}</div>`:'';

  const fpFlex='1 1 0';
  const noph=(bg='#EEEEEE')=>`<div class="noph" style="background:${bg}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width=".8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`;
  const sepHtml=S.partnerLogo?(()=>{if(LOGO_SEP==='x')return`<span class="sl-logo-sep">×</span>`;if(LOGO_SEP==='bar')return`<span class="sl-logo-sep" style="font-size:.8em">|</span>`;return`<span style="width:.4em"></span>`;})():'';

  const slideWrap=document.querySelector('.slide-wrap');
  // In capture mode, always use 1122px so font scaling matches desktop Chrome/print
  const previewW=_captureMode ? 1122 : (slideWrap?slideWrap.offsetWidth:600);
  const rawFs=previewW/1122*16*1.5;
  const hasCustom=!!(g('custom-title')||(document.getElementById('custom-body-editor')?.innerHTML||'').trim().replace('<br>',''));
  const nBenOn=checked.length;const nAmenOn=amenChecked.length;const amenRowCount=Math.ceil(nAmenOn/4);
  const rightPressure=nBenOn*1.2+nPricing*1.8;
  const centrePressure=specRows.length*0.9+trLines.length*1.0+(hasCustom?1.5:0);
  const leftPressure=amenRowCount*1.8;
  const totalPressure=Math.max(rightPressure,centrePressure,leftPressure);
  const dScale=totalPressure<=6?1.10:totalPressure<=9?1.00:totalPressure<=12?0.92:totalPressure<=15?0.84:totalPressure<=18?0.76:totalPressure<=22?0.68:0.60;
  const fsNum=Math.max(8,Math.min(18,rawFs*dScale));const fsVal=fsNum.toFixed(1)+'px';

  const topBarHTML=(pg)=>`
  <div class="${pg===2?'p2-top':'sl-top'}">
    <div class="sl-logos">
      <div class="sl-cologo"><img src="https://www.compassoffices.com/wp-content/themes/compass-offices/assets/images/compassoffices-logo-web-all-in-one-2025_ob.svg" onerror="this.style.display='none';this.nextSibling.style.display='block'"><span class="sl-cologo-fb" style="display:none">COMPASS OFFICES</span></div>
      ${S.partnerLogo?`${sepHtml}<div class="sl-partner"><img src="${S.partnerLogo}"></div>`:''}
    </div>
    <div class="sl-title-block">
      <div class="sl-title">${name}${
        S._isMultiFloor && S._multiFloorNums && S._multiFloorNums.length>1
          ? ' '+S._multiFloorNums.map(f=>`<span class="sl-floor-inline" style="font-size:calc(var(--fs)*0.75);vertical-align:middle;position:relative;top:-.05em;margin-left:.18em">FL.${f}</span>`).join('')
          : floor?` <span class="sl-floor-inline" style="font-size:calc(var(--fs)*0.82);vertical-align:middle;position:relative;top:-.05em">${floor}</span>`:''
      }</div>
      ${addr?`<div class="sl-addr-row"><div class="sl-addr">${addr}</div></div>`:''}
    </div>
    <div class="sl-meta"><div class="sl-city">${city}</div></div>
  </div>`;

  const page1El=document.getElementById('slide');
  page1El.style.setProperty('--fs',fsVal);
  const amenRowHeight=amenRowCount*2.4*fsNum*0.264;const leftBodyMm=178;
  const photoFraction=Math.max(0.45,Math.min(0.80,(leftBodyMm-amenRowHeight-8)/leftBodyMm));
  const photoAreaFlex=amenChecked.length===0?'1 1 100%':`1 1 ${(photoFraction*100).toFixed(0)}%`;
  const centreHasCoreContent=specRows.length>0||trLines.length>0||hasCustom;
  const specsMissing=specRows.length===0;
  // Auto + no specs → 3-col new layout (photos | fp+transport+custom | benefits)
  // Auto + specs present → Classic (photos | specs+transport+custom | fp+benefits)
  // Centre → benefits forced to centre column
  const noSpecsMode=specsMissing&&BENEFITS_POS==='auto';
  const putBenInCentre=BENEFITS_POS==='centre'; // no longer triggered by noSpecsMode
  const bodyGrid=noSpecsMode?'30% 1fr':'24% 1fr 35%';

  // In Auto mode: 2-col layout when 5+ benefits (matches Transport 2-col grid)
  const bUseTwoCol = BENEFITS_POS==='auto' && checked.length>=5;
  // ── Density-aware sizing: shrinks font + gap as item count grows, so the
  //    last item never gets clipped by the container's overflow:hidden.
  //    In 2-col mode the "effective" row count is half the item count.
  const bEffCount = bUseTwoCol ? Math.ceil(checked.length/2) : checked.length;
  const bDensity = bEffCount<=5  ? 1.00
                : bEffCount<=7  ? 0.92
                : bEffCount<=9  ? 0.83
                : bEffCount<=11 ? 0.74
                : bEffCount<=13 ? 0.66
                :                 0.60;
  const bGapFs  = bEffCount<=5  ? 0.18
                : bEffCount<=7  ? 0.14
                : bEffCount<=9  ? 0.10
                : bEffCount<=11 ? 0.07
                : bEffCount<=13 ? 0.05
                :                 0.04;
  const bFScale = b => {
    const len = b.text.length;
    const base = len<=38?0.82:len<=50?0.74:len<=62?0.65:len<=75?0.58:0.52;
    return (base * bDensity).toFixed(3);
  };
  const bGapStyle = `gap:calc(var(--fs)*${bGapFs.toFixed(2)});`;
  const meritsHTML=checked.length?`<div class="sl-merits-wrap"><div class="sl-merits-ttl">${bTitle}</div><ul class="sl-merits${bUseTwoCol?' two-col':''}" style="${bGapStyle}">${checked.map(b=>`<li class="sl-merit"><span style="display:flex;align-items:flex-start;gap:calc(var(--fs)*0.28);overflow:hidden;min-width:0;width:100%">${getBenIconHtml(b)}<span style="font-size:calc(var(--fs)*${bFScale(b)});overflow:hidden;word-break:break-word;white-space:normal;line-height:1.25;">${b.text}</span></span></li>`).join('')}</ul></div>`:'';
  // Determine which floorplan(s) to show on each page
  const fpPh=`<div class="sl-fp-ph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width=".8" style="width:32%;opacity:.15;display:block;margin:0 auto 6px"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>Floor Plan</div>`;
  function buildFpHtml(pgIdx, showAll, forPage2 = false){
    // Dedicated Page 2 floor plan slot — completely independent of the
    // Cloudinary highlight system. Set via the Page 2 Floor Plan upload in Media tab.
    if(forPage2 && FP_P2_CUSTOM_URL){
      return `<img src="${FP_P2_CUSTOM_URL}" style="width:100%;height:100%;object-fit:contain;display:block;background:#fff;">`;
    }
    // ── Highlight mode — skipped when user has chosen to use their own upload ──
    if(FP_MASTER_DATA && !FP_USE_LOCAL){
      // Page 1 in "Page 2 different" mode (pgIdx === -2) → individual room
      // close-up collage. Uses {FP_BASE_URL}{room.file} for each highlighted
      // room (the extractor uploads these alongside master.png).
      if(pgIdx === -2){
        const highlights = getActiveHighlightRooms();
        if(highlights.length){
          const items = highlights.map(r => ({
            // Use per-room annotation if available (Page 1 only — Page 2 untouched)
            url: (FP_ANNOTATIONS[r.displayLabel]?.imageDataUrl)
                 || FP_BASE_URL + (r.file || (r.displayLabel + '.png')),
            label: r.displayLabel,
          }));
          if(items.length === 1){
            return `<img src="${items[0].url}" alt="${items[0].label}" style="width:100%;height:100%;object-fit:contain;display:block;background:#fff;">`;
          }
          const n = items.length;
          const cols = n===2?2:n===3?3:n<=4?2:3;
          const lastCol = (n%cols===0)?1:(cols-(n%cols)+1);
          return `<div class="sl-fp-collage" style="grid-template-columns:repeat(${cols},1fr)">${items.map((it,pi)=>`<img src="${it.url}" alt="${it.label}" style="${pi===n-1&&lastCol>1?'grid-column:span '+lastCol+';':''}">`).join('')}</div>`;
        }
        // No highlights → fall through to master display below
      }
      // All other modes → master with highlight polygons baked in
      const baked = FP_HIGHLIGHT_RENDER_URL;
      if(baked){
        return `<img src="${baked}" style="width:100%;height:100%;object-fit:contain;display:block;background:#fff;">`;
      }
      const masterUrl = getMasterImageUrl();
      return `<img src="${masterUrl}" style="width:100%;height:100%;object-fit:contain;display:block;background:#fff;">`;
    }
    // ── Legacy image-collage mode ──
    const plans=FP_PLANS.length>0?FP_PLANS:(S.floorplan?[{url:S.floorplan,label:'Master'}]:[]);
    if(!plans.length) return fpPh;
    // pgIdx: -2 = rooms only (exclude master/index 0), -1 = all collage, 0+ = specific plan
    if(pgIdx===-2){
      // Map each room plan — use annotation if available, otherwise original URL
      const rooms=plans.slice(1).map(p=>({
        ...p, url: FP_ANNOTATIONS[p.label]?.imageDataUrl || p.url,
      }));
      if(!rooms.length) return buildFpHtml(0,false);
      if(rooms.length===1) return`<img src="${rooms[0].url}" style="width:100%;height:100%;object-fit:contain;display:block;">`;
      const n=rooms.length;
      const cols=n===2?2:n===3?3:n<=4?2:3;
      const lastCol=(n%cols===0)?1:(cols-(n%cols)+1);
      return`<div class="sl-fp-collage" style="grid-template-columns:repeat(${cols},1fr)">${rooms.map((p,pi)=>`<img src="${p.url}" alt="${p.label}" style="${pi===rooms.length-1&&lastCol>1?'grid-column:span '+lastCol+';':''}">`).join('')}</div>`;
    }
    if(showAll||pgIdx===-1){
      if(plans.length===1) return`<img src="${plans[0].url}" style="width:100%;height:100%;object-fit:contain;display:block;">`;
      const n=plans.length;
      const cols=n===2?2:n===3?3:n<=4?2:3;
      const lastCol=(n%cols===0)?1:(cols-(n%cols)+1);
      return`<div class="sl-fp-collage" style="grid-template-columns:repeat(${cols},1fr)">${plans.map((p,pi)=>`<img src="${p.url}" alt="${p.label}" style="${pi===n-1&&lastCol>1?'grid-column:span '+lastCol+';':''}">`).join('')}</div>`;
    }
    const idx=Math.max(0,Math.min(pgIdx,plans.length-1));
    return`<img src="${plans[idx].url}" style="width:100%;height:100%;object-fit:contain;display:block;">`;
  }
  // pgIdx: -2 = rooms-only collage, -1 = all collage, 0+ = specific plan
  const fp1Idx = FP_PAGE2_SAME ? -1 : FP_PAGE1_IDX;
  const fp2Idx = FP_PAGE2_SAME ? -1 : FP_PAGE2_IDX;
  const fp1All = fp1Idx <= -1;  // any collage mode
  const fp2All = fp2Idx <= -1;
  const fpHTML=`<div class="sl-fp" style="flex:${fpFlex}">${buildFpHtml(fp1Idx,fp1All)}</div>`;

  page1El.innerHTML=`
  ${topBarHTML(1)}
  <div class="sl-body" style="grid-template-columns:${bodyGrid}">
    <div class="sl-photos">
      <div class="sl-ph-stack" style="flex:${photoAreaFlex}">
        <div class="sl-ph-cell">${S.photos[0]?`<img src="${S.photos[0]}">`:`${noph()}`}</div>
        <div class="sl-ph-cell">${S.photos[1]?`<img src="${S.photos[1]}">`:`${noph('#E0E0E0')}`}</div>
        <div class="sl-ph-cell">${S.photos[2]?`<img src="${S.photos[2]}">`:`${noph('#E8E8E8')}`}</div>
      </div>
      ${amenChecked.length?`<div class="sl-amen-below"><div class="sl-amen-below-grid">${amenChecked.map(a=>`<div class="sl-amen-cell">${renderIcHtml(a.id)||renderIcHtml("norestore")}<span>${amenLabel(a)}</span></div>`).join('')}</div></div>`:''}
    </div>
    ${noSpecsMode?`
    <div style="display:flex;flex-direction:column;overflow:hidden;grid-column:2 / span 2;">
      <!-- Top: Floor plan full width -->
      <div style="flex:0 0 55%;border-bottom:1px solid var(--bd);padding:calc(var(--fs)*0.5) calc(var(--fs)*0.8) calc(var(--fs)*0.3);overflow:hidden;">
        ${(FP_PLANS.length||S.floorplan)
          ?`<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;overflow:hidden;">${buildFpHtml(fp1Idx,fp1All)}</div>`
          :`<div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;border:2px dashed var(--bd);border-radius:8px;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width=".8" style="width:18%;opacity:.15;display:block;margin-bottom:calc(var(--fs)*0.4)"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg><span style="font-size:calc(var(--fs)*0.6);color:var(--xlt)">Floor Plan</span></div>`}
      </div>
      <!-- Bottom: Transport+Custom (left) | Benefits (right) -->
      <div style="flex:1 1 0;overflow:hidden;min-height:0;display:grid;grid-template-columns:1fr 1fr;">
        <div style="overflow:hidden;padding:calc(var(--fs)*0.4) calc(var(--fs)*0.65);display:flex;flex-direction:column;gap:calc(var(--fs)*0.22);border-right:1px solid var(--bd);">
          ${(()=>{const _nsTr=trLines.length?`<div style="flex-shrink:0;"><div class="sl-sec">${sl('transport')}</div><div class="sl-trans-grid" style="grid-template-columns:1fr">${trLines.map(t=>{const trIconHtml=renderIcHtml(t.iconId)||IC[t.iconId]||IC.tr_metro;const trIsImg=trIconHtml.startsWith('<img');const trIconEl=trIsImg?trIconHtml.replace('co-icon-img','co-icon-img sl-ticon-img'):`<svg class="sl-ticon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${trIconHtml.match(/<svg[^>]*>([\s\S]*?)<\/svg>/)?.[1]||''}</svg>`;return`<div class="sl-trans">${trIconEl}<span class="sl-trans-txt">${t.text}</span></div>`;}).join('')}</div></div>`:'';const _nsCu=hasCustom?`<div style="flex-shrink:0;">${g('custom-title')?`<div class="sl-custom-title">${g('custom-title')}</div>`:''} ${(()=>{const el=document.getElementById('custom-body-editor');const html=(el?.innerHTML||'').trim();return html&&html!=='<br>'?`<div class="sl-custom-body">${html}</div>`:''})()}</div>`:'';return CUSTOM_POS==='above'?_nsCu+_nsTr:_nsTr+_nsCu;})()}
        </div>
        <div style="overflow:hidden;padding:calc(var(--fs)*0.4) calc(var(--fs)*0.6);display:flex;flex-direction:column;">
          ${checked.length?`<div class="sl-merits-ttl">${bTitle}</div><ul class="sl-merits" style="margin-top:calc(var(--fs)*0.1);${bGapStyle}">${checked.map(b=>`<li class="sl-merit"><span style="display:flex;align-items:center;gap:calc(var(--fs)*0.28);overflow:hidden;min-width:0;width:100%">${getBenIconHtml(b)}<span style="font-size:calc(var(--fs)*${bFScale(b)});overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${b.text}</span></span></li>`).join('')}</ul>`:''}
        </div>
      </div>
    </div>
    `:`
    <div class="sl-specs">
      <div class="sl-specs-inner">
        ${specRows.length?`<div class="sl-section ${(trLines.length||hasCustom||putBenInCentre)?'shrink':'grow'}"><div class="sl-sec">${sl('specs')}</div>${specGridHTML}</div>`:''}
        ${(()=>{const _tr=trLines.length?`<div class="sl-section shrink"><div class="sl-sec">${sl('transport')}</div><div class="sl-trans-grid" style="grid-template-columns:${trLines.length===1?'1fr':'1fr 1fr'}">${trLines.map(t=>{const trIconHtml=renderIcHtml(t.iconId)||IC[t.iconId]||IC.tr_metro;const trIsImg=trIconHtml.startsWith('<img');const trIconEl=trIsImg?trIconHtml.replace('co-icon-img','co-icon-img sl-ticon-img'):`<svg class="sl-ticon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${trIconHtml.match(/<svg[^>]*>([\s\S]*?)<\/svg>/)?.[1]||''}</svg>`;return`<div class="sl-trans">${trIconEl}<span class="sl-trans-txt">${t.text}</span></div>`;}).join('')}</div></div>`:'';const _cu=hasCustom?`<div class="sl-section shrink"><div class="sl-custom-block">${g('custom-title')?`<div class="sl-custom-title">${g('custom-title')}</div>`:''} ${(()=>{const el=document.getElementById('custom-body-editor');const html=(el?.innerHTML||'').trim();return html&&html!=='<br>'?`<div class="sl-custom-body">${html}</div>`:''})()}</div></div>`:'';return CUSTOM_POS==='above'?_cu+_tr:_tr+_cu;})()}
        ${putBenInCentre&&checked.length?`<div class="sl-section shrink"><div class="sl-merits-ttl">${bTitle}</div><ul class="sl-merits${bUseTwoCol?' two-col':''}" style="${bGapStyle}">${checked.map(b=>`<li class="sl-merit"><span style="display:flex;align-items:center;gap:calc(var(--fs)*0.28);overflow:hidden;min-width:0;width:100%">${getBenIconHtml(b)}<span style="font-size:calc(var(--fs)*${bFScale(b)});overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${b.text}</span></span></li>`).join('')}</ul></div>`:''}
      </div>
    </div>
    <div class="sl-right">${fpHTML}${putBenInCentre?'':meritsHTML}</div>
    `}
  </div>
  <div class="sl-foot">
    ${S.rows.length?`<table class="sl-ptbl"><thead><tr>${activeCols.map(k=>`<th>${pHdr[k]}</th>`).join('')}</tr></thead><tbody>${S.rows.map(r=>`<tr>${activeCols.map(k=>{const v=r[k]||'';const isPrice=k==='rent'||k==='mgmt'||k==='avail'||k==='market';return isPrice?`<td class="acc">${v}</td>`:k==='init'?`<td class="init-cell">${v}</td>`:`<td>${v}</td>`;}).join('')}</tr>`).join('')}</tbody></table>`:`<p style="font-size:.65em;color:#CCC">Add pricing rows in the Pricing tab</p>`}
    ${S.rows.length && DEPOSIT_NOTE_ON && getDepositNote()?`<div class="sl-deposit-note">${getDepositNote()}</div>`:''}
    ${purl?`<div class="sl-url">${purl}</div>`:''}
  </div>`;

  const page2El=document.getElementById('slide2');
  page2El.style.setProperty('--fs',fsVal);

  // ── Multi-floor grid for Page 2 ────────────────────────────────────────
  // Shows each floor's plan with: pre-rendered highlight master (preferred),
  // OR matched uploaded FP_PLAN, OR dashed placeholder. Orange label bar per cell.
  const buildMultiFloorFpGrid=()=>{
    const floors=S._multiFloorNums||[];
    if(!floors.length) return buildFpHtml(fp2Idx,fp2All,true);
    const cols=floors.length<=3?floors.length:2;
    const phCell=(floor)=>`
      <div style="width:100%;height:100%;display:flex;flex-direction:column;
          align-items:center;justify-content:center;padding:10px;box-sizing:border-box;">
        <svg viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width=".8"
          style="width:28%;max-width:44px;opacity:.5;margin-bottom:calc(var(--fs)*0.35);">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/>
          <line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>
        </svg>
        <span style="font-size:calc(var(--fs)*0.52);color:#bbb;text-align:center;line-height:1.4;">
          FL.${floor}<br>Upload in Media tab
        </span>
      </div>`;
    return `<div style="display:grid;grid-template-columns:repeat(${cols},1fr);
        gap:3px;width:100%;height:100%;">
      ${floors.map(floor=>{
        // 1. Pre-rendered highlighted master for this floor
        const hlUrl=S._multiFloorFpUrls?.[floor];
        // 2. Uploaded FP_PLAN whose label matches this floor number
        const matchedFp=(typeof _detectFloorNum==='function')
          ?FP_PLANS.find(p=>_detectFloorNum(p.label)===floor&&p.url):null;
        const imgUrl=hlUrl||matchedFp?.url||null;
        // 3. Room IDs on this floor for label bar
        const floorRooms=(S.rows||[])
          .filter(r=>typeof _detectFloorNum==='function'&&_detectFloorNum(r.seats)===floor)
          .map(r=>r.seats).join(' · ');
        return `<div style="position:relative;overflow:hidden;background:#f5f5f5;
            border-radius:3px;border:1px solid #e8e8e8;box-sizing:border-box;">
          ${imgUrl
            ?`<img src="${imgUrl}" style="width:100%;height:100%;object-fit:contain;display:block;">`
            :phCell(floor)}
          <div style="position:absolute;bottom:0;left:0;right:0;
              background:rgba(255,102,0,.9);color:#fff;
              padding:3px 7px;display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:calc(var(--fs)*0.62);font-weight:800;letter-spacing:.04em;">FL.${floor}</span>
            ${floorRooms?`<span style="font-size:calc(var(--fs)*0.55);opacity:.9;">${floorRooms}</span>`:''}
          </div>
        </div>`;
      }).join('')}
    </div>`;
  };
  const noph2=(bg='#E8E8E8')=>`<div class="p2-noph" style="background:${bg}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width=".8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`;
  page2El.innerHTML=`
  ${topBarHTML(2)}
  <div class="p2-body">
    <div class="p2-fp-area">
      ${S._isMultiFloor&&S._multiFloorNums&&S._multiFloorNums.length>=2
        ?buildMultiFloorFpGrid()
        :(FP_PLANS.length||S.floorplan||FP_MASTER_DATA)?buildFpHtml(fp2Idx,fp2All,true):`<div class="p2-fp-ph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width=".8" style="width:60px;height:60px;opacity:.18;display:block;"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg><span>Upload a floor plan in the Media tab</span></div>`}
      ${COMPASS_ON ? `<div class="sl-compass"><img src="${COMPASS_IMG_URL}" alt="N" style="transform:rotate(${COMPASS_ANGLE}deg);transform-origin:center center;"><span class="sl-compass-dir">${_compassCardinal(COMPASS_ANGLE)}</span></div>` : ''}
    </div>
    <div class="p2-right">
            <div class="p2-photos">
        ${(()=>{const p2=[S.photos[3]||S.photos[0],S.photos[4]||S.photos[1],S.photos[5]||S.photos[2]];return p2.map((ph,i)=>'<div class="p2-ph-cell">'+(ph?'<img src="'+ph+'">':`${noph2(i===0?'#E8E8E8':i===1?'#DCDCDC':'#E4E4E4')}`)+'</div>').join('');})()}
      </div>
      ${amenChecked.length?`<div class="p2-amen"><div class="p2-amen-grid">${amenChecked.map(a=>`<div class="p2-amen-cell">${renderIcHtml(a.id)||renderIcHtml("norestore")}<span>${amenLabel(a)}</span></div>`).join('')}</div></div>`:''}
    </div>
  </div>
  ${purl?`<div class="p2-foot"><div class="p2-url">${purl}</div></div>`:''}`;
}

// ══════════════════════════════════════════════════════════
//  PRINT — Cross-browser fix (Safari, Firefox, Chrome, Edge)
//  Replace the existing printSlide() function with this one.
// ══════════════════════════════════════════════════════════

// Autosave is triggered via setInterval — see _autosaveSchedule below
// ══════════════════════════════════════════════════════════
//  PRINT QUEUE — Multi-location Print / Save PDF
//  Opens a new window with every queued slide (using pre-captured
//  JPEG data URLs from addToQueue) and auto-triggers the print dialog.
//  Mirrors printSlide()'s @page rules so each slide lands on its own
//  A4 landscape page with zero margin.
// ══════════════════════════════════════════════════════════
async function printQueue(){
  if(!PDF_QUEUE.length){alert('Queue is empty.');return;}

  // ── Open the print window NOW — synchronously while still inside the
  // user-tap call stack. iOS Safari blocks window.open() after any await.
  const _qw = window.open('','_blank');
  if(!_qw){
    alert('Pop-ups are blocked. Please allow pop-ups for this site and try again.');
    return;
  }
  // Show a loading state in the window while we render each card
  _qw.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Preparing PDF…</title>
  <style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#fff;color:#888;}
  .msg{text-align:center;}.spinner{width:36px;height:36px;border:3px solid #eee;border-top-color:#FF6600;border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 16px;}
  @keyframes spin{to{transform:rotate(360deg);}}</style></head>
  <body><div class="msg"><div class="spinner"></div><div id="prog">Preparing PDF…</div></div></body></html>`);
  _qw.document.close();

  // ── Text-PDF queue export ──
  // Instead of using pre-captured JPEGs (which produced image-only PDFs),
  // we re-render each queued card live, capture its HTML, and feed all the
  // captured HTML into a print window. Result: selectable, copyable text
  // throughout the queued PDF — every page is real DOM, not raster.
  showStatus(`Rendering ${PDF_QUEUE.length} card${PDF_QUEUE.length>1?'s':''} for PDF…`,'s-info');

  // Also update the Export All button itself so the user sees live progress
  // even if the status bar is out of view (queue panel scrolled down, etc.)
  const _expBtn = document.getElementById('queue-export-btn');
  const _expBtnOrig = _expBtn ? _expBtn.innerHTML : '';
  const _setExportProgress = (i, total) => {
    if(_expBtn) _expBtn.innerHTML = `⏳ ${i}/${total}`;
  };

  // Save current app state so we can restore it after we're done.
  const stash = buildStateSnapshot();

  const captured = [];
  let renderError = null;
  try {
    for(let i = 0; i < PDF_QUEUE.length; i++){
      const item = PDF_QUEUE[i];
      showStatus(`Rendering card ${i+1} of ${PDF_QUEUE.length}: ${item.name || ''}`,'s-info');
      _setExportProgress(i + 1, PDF_QUEUE.length);
      // Update the loading window progress text
      try{ const p=_qw.document.getElementById('prog'); if(p) p.textContent=`Rendering ${i+1} of ${PDF_QUEUE.length}…`; }catch(e){}
      restoreStateSnapshot(item.state);
      gen._captureMode = true;
      gen();
      gen._captureMode = false;
      // _waitForCardReady now includes Phase 0 (data.json fetch) + Phase 1
      // (highlight render) + Phase 2 (image load). All three must complete
      // before the capture so the floor plan is fully composited.
      await _waitForCardReady();
      // After all phases done, run gen() one final time so the slide's
      // <img> src reflects the freshly-baked FP_HIGHLIGHT_RENDER_URL.
      gen._captureMode = true;
      gen();
      gen._captureMode = false;
      // _waitForCardReady already ends with an 80ms Phase 3 settle tick;
      // no extra wait needed here — removing it saves 80ms × N cards.
      const page1El = document.getElementById('slide');
      const page2El = document.getElementById('slide2');
      if(page1El){
        captured.push({
          name: item.name || '',
          slide1: page1El.outerHTML,
          slide2: page2El ? page2El.outerHTML : '',
        });
      }
    }
  } catch(err){
    renderError = err;
    console.error('[Queue PDF] render error:', err);
  } finally {
    // Always restore original state
    try { restoreStateSnapshot(stash); gen(); } catch(e){ console.warn('Restore failed:', e); }
    if(_expBtn){ _expBtn.innerHTML = _expBtnOrig; }
  }

  if(renderError){
    showStatus('Queue render failed — see console for details.','s-err');
    alert('Failed to render queue: ' + (renderError.message || renderError));
    return;
  }
  if(!captured.length){
    showStatus('Nothing to print.','s-err');
    return;
  }

  showStatus(`Opening print preview — ${captured.length * 2} pages with selectable text…`,'s-ok');
  _openQueueTextPrintWindow(captured, _qw);
}

// Wait for the current card's slide to settle: highlight bake completes and
// every <img> on either slide finishes loading.
async function _waitForCardReady(){
  // Phase 0: wait for the data.json fetch to complete (FP_DATA_STATUS goes
  // from 'fetching' to 'ok' or 'error'). restoreStateSnapshot calls
  // tryFetchFpData as fire-and-forget; without this phase _waitForCardReady
  // would check FP_HIGHLIGHT_RENDERING while the network request is still
  // in flight (FP_HIGHLIGHT_RENDERING is not set until AFTER the fetch
  // completes and ensureHighlightRender runs). Result was printQueue
  // capturing a blank slide because it reached gen() before any floor plan
  // data arrived.
  if(typeof FP_DATA_STATUS !== 'undefined' && FP_DATA_STATUS === 'fetching'){
    const t0 = Date.now();
    while(FP_DATA_STATUS === 'fetching' && Date.now()-t0 < 8000){
      await new Promise(r => setTimeout(r, 100));
    }
  }
  // Phase 1: Wait for highlight render (if in highlight mode) up to 6s
  if(typeof FP_MASTER_DATA !== 'undefined' && FP_MASTER_DATA){
    const t0 = Date.now();
    while((FP_HIGHLIGHT_RENDERING || FP_HIGHLIGHT_PENDING_KEY) && Date.now()-t0 < 6000){
      await new Promise(r => setTimeout(r, 100));
    }
  }
  // Phase 2: Wait for all images to load (or fail) — bounded by 4s per image
  const imgs = document.querySelectorAll('#slide img, #slide2 img');
  await Promise.all(Array.from(imgs).map(img => {
    if(img.complete && (img.naturalWidth > 0 || (img.src||'').startsWith('data:'))) return Promise.resolve();
    return new Promise(resolve => {
      let done = false;
      const finish = () => { if(!done){ done = true; resolve(); } };
      img.addEventListener('load', finish, {once:true});
      img.addEventListener('error', finish, {once:true});
      setTimeout(finish, 4000);
    });
  }));
  // Phase 3: Tiny settling tick for layout
  await new Promise(r => setTimeout(r, 80));
}

// Open the print window with re-rendered slides — every page is live DOM,
// so the browser's Save-as-PDF preserves selectable text.
function _openQueueTextPrintWindow(captured, existingWindow){
  // Collect all CSS from the page; skip @media (max-width: 768px) rules that
  // would hide preview elements at print width.
  const allCss = Array.from(document.styleSheets).flatMap(ss => {
    try {
      return Array.from(ss.cssRules).flatMap(r => {
        if(r.media && r.conditionText && (
          r.conditionText.includes('max-width:768px') ||
          r.conditionText.includes('max-width: 768px')
        )) return [];
        return [r.cssText];
      });
    } catch { return []; }
  }).join('\n');

  // Use the pre-opened window if provided (iOS Safari: window.open must be
  // called synchronously from the tap handler, before any await). Otherwise
  // open a new one for direct calls.
  const w = existingWindow || window.open('','_blank');
  if(!w){ alert('Pop-ups are blocked. Please allow pop-ups for this site and try again.'); return; }

  const slugFilename = (PDF_QUEUE.map(i => i.name).filter(Boolean).join('-') || 'queue')
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff-]+/g,'-')
    .replace(/^-|-$/g,'')
    .slice(0,80) || 'compass-offices-queue';

  const contactHtml = buildContactPageHtml();
  const perksHtml = typeof buildPerksPageHtml==='function'
    ? buildPerksPageHtml(LANG)
    : '';
  const pagesHtml = captured.flatMap(c => {
    const arr = [`<div class="page-wrap"><div class="page-clip">${c.slide1}</div></div>`];
    if(c.slide2) arr.push(`<div class="page-wrap"><div class="page-clip">${c.slide2}</div></div>`);
    return arr;
  }).join('\n')
  + `\n<div class="page-wrap"><div class="page-clip">${perksHtml}</div></div>`
  + (contactHtml ? `\n<div class="page-wrap"><div class="page-clip">${contactHtml}</div></div>` : '');

  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    || /iPad|iPhone|iPod/.test(navigator.userAgent);

  const printFs = '16px';

  w.document.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=1122">
<title>${slugFilename}</title>
<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@300;400;500;600;700;800&family=Noto+Sans+JP:wght@300;400;500;700&family=Noto+Sans+TC:wght@300;400;500;700&display=swap" rel="stylesheet">
<style>
${allCss}
*, *::before, *::after { box-sizing:border-box; margin:0; padding:0; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; color-adjust:exact !important; }
html { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
body { background:#fff; overflow:visible; }
.page-wrap { width:1122px; height:794px; max-width:1122px; max-height:794px; overflow:hidden; display:block; position:relative; background:#fff; page-break-after:always; break-after:page; -webkit-break-after:page; page-break-inside:avoid; break-inside:avoid; -webkit-break-inside:avoid; }
.page-wrap:last-child { page-break-after:avoid; break-after:avoid; -webkit-break-after:avoid; }
.page-clip { position:absolute; top:0; left:0; width:1122px; height:794px; overflow:hidden; }
.slide, .slide2 { --fs: ${printFs} !important; width:1122px !important; height:794px !important; max-width:1122px !important; max-height:794px !important; aspect-ratio:unset !important; border-radius:0 !important; border:none !important; box-shadow:none !important; font-size:var(--fs) !important; overflow:hidden !important; display:grid !important; position:relative !important; padding:3px !important; }
.sl-body, .p2-body { overflow:hidden !important; max-height:100% !important; }
.sl-ph-stack, .p2-photos, .sl-specs, .sl-right, .p2-fp-area, .p2-right { overflow:hidden !important; min-height:0 !important; }
@page { size: 297mm 210mm landscape; margin:0 !important; padding:0 !important; -webkit-margin-before:0 !important; -webkit-margin-after:0 !important; -webkit-margin-start:0 !important; -webkit-margin-end:0 !important; marks:none; }
@page :first { size: 297mm 210mm landscape; margin:0 !important; }
@page :left  { size: 297mm 210mm landscape; margin:0 !important; }
@page :right { size: 297mm 210mm landscape; margin:0 !important; }
@page :blank { size: 297mm 210mm landscape; margin:0 !important; }
@media screen {
  body { padding:20px; background:#888; min-height:100vh; }
  .page-wrap { margin:0 auto 24px; box-shadow:0 4px 20px rgba(0,0,0,.35); }
  .print-controls { position:fixed; bottom:20px; right:20px; display:flex; flex-direction:column; gap:8px; z-index:999; align-items:flex-end; }
  .print-btn { padding:12px 24px; border:none; border-radius:99px; font-size:14px; font-weight:700; cursor:pointer; font-family:'Hanken Grotesk',sans-serif; display:flex; align-items:center; gap:8px; white-space:nowrap; }
  .print-btn-primary { background:#FF6600; color:#fff; box-shadow:0 3px 12px rgba(255,102,0,.4); }
  .print-btn-secondary { background:#fff; color:#555; border:1.5px solid #ddd; }
  .print-hint-box { background:#fffbe6; border:2px solid #f0a500; border-radius:10px; padding:12px 16px; font-size:12.5px; font-family:'Hanken Grotesk',sans-serif; color:#5a3e00; max-width:280px; line-height:1.65; box-shadow:0 3px 12px rgba(0,0,0,.18); }
  .print-hint-box b { color:#c44400; }
  ${_IOS_TIP_CSS}
}
@media print {
  .print-controls { display:none !important; }
  .ios-tip-box { display:none !important; }
  html, body { padding:0 !important; margin:0 !important; background:#fff !important; width:1122px !important; }
  .page-wrap { width:1122px !important; height:794px !important; max-height:794px !important; margin:0 !important; padding:0 !important; box-shadow:none !important; overflow:hidden !important; }
  .page-clip { position:absolute !important; top:0 !important; left:0 !important; width:1122px !important; height:794px !important; overflow:hidden !important; }
  .slide, .slide2 { width:1122px !important; height:794px !important; max-height:794px !important; overflow:hidden !important; }
}
</style>
</head>
<body>

${pagesHtml}

<div class="print-controls">
  ${_buildIosTipHtml()}
  <div class="print-hint-box">
    <b>${captured.length} location${captured.length>1?'s':''}</b> · ${captured.length*2}${contactHtml?' + 1 contact':''} pages ready.<br>
    In the print dialog, choose <b>Save as PDF</b> &amp; set <b>Margins: None</b>.<br>
    <span style="display:inline-block;margin-top:6px;padding:2px 8px;background:#FF6600;color:#fff;border-radius:99px;font-size:11px;font-weight:700;">✓ Selectable text</span>
  </div>
  <button class="print-btn print-btn-primary" onclick="window.print()">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
    Print / Save as PDF
  </button>
  <button class="print-btn print-btn-secondary" onclick="window.close()">Close</button>
</div>

<script>
  // Wait for images to load before auto-print
  (function(){
    const imgs = Array.from(document.images);
    if(!imgs.length) return setTimeout(() => window.focus(), 300);
    let done = 0;
    const onDone = () => { done++; if(done === imgs.length) setTimeout(() => window.focus(), 300); };
    imgs.forEach(img => {
      if(img.complete) onDone();
      else { img.addEventListener('load', onDone); img.addEventListener('error', onDone); }
    });
    setTimeout(() => window.focus(), 3000);
  })();
  ${_IOS_TIP_JS}
</${'script'}>
</body>
</html>`);
  w.document.close();
}


// ── iOS print tip ──
// When an iOS user prints, iOS PDFKit adds a URL + date overlay outside
// our @page margin. CSS can't suppress it. iOS 17+ has a hidden toggle
// (pinch-zoom preview → menu → Headers & Footers off) that the user can
// flip once and iOS remembers. This helper emits a translated 4-step
// guide inside the print window's hint area; a "Got it" button writes a
// flag to localStorage so the tip stops appearing after the first time.
function _isIOS(){
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}
function _iosTipDismissed(){
  try { return localStorage.getItem('ios_print_tip_dismissed') === '1'; }
  catch(e) { return false; }
}
function _buildIosTipHtml(){
  // Returns an empty string when the tip should not show: non-iOS, or
  // already dismissed. The current LANG drives the language.
  if(!_isIOS() || _iosTipDismissed()) return '';
  // Snapshot every string at template-build time so the print window
  // doesn't need access to the parent's ui() or LANG.
  const t = {
    title:   ui('ios_tip_title'),
    step1:   ui('ios_tip_step1'),
    step2:   ui('ios_tip_step2'),
    step3:   ui('ios_tip_step3'),
    step4:   ui('ios_tip_step4'),
    footer:  ui('ios_tip_footer'),
    dismiss: ui('ios_tip_dismiss'),
  };
  return `<div class="ios-tip-box">
    <div class="ios-tip-head">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6.27 6.27l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.03z"/></svg>
      <b>${t.title}</b>
    </div>
    <ol class="ios-tip-steps">
      <li>${t.step1}</li>
      <li>${t.step2}</li>
      <li>${t.step3}</li>
      <li>${t.step4}</li>
    </ol>
    <div class="ios-tip-foot">${t.footer}</div>
    <button class="ios-tip-dismiss" onclick="dismissIosTip()">${t.dismiss}</button>
  </div>`;
}
// CSS for the iOS tip — injected into both print templates.
const _IOS_TIP_CSS = `
.ios-tip-box{background:#fffbe6;border:2px solid #f0a500;border-radius:10px;padding:11px 14px;font-size:12px;font-family:'Hanken Grotesk','PingFang TC','PingFang SC','Hiragino Sans',sans-serif;color:#5a3e00;max-width:300px;line-height:1.55;box-shadow:0 3px 12px rgba(0,0,0,.18);margin-bottom:8px;}
.ios-tip-head{display:flex;align-items:center;gap:6px;margin-bottom:6px;}
.ios-tip-head b{color:#c44400;font-size:12.5px;}
.ios-tip-steps{margin:6px 0;padding-left:22px;}
.ios-tip-steps li{margin-bottom:3px;}
.ios-tip-steps b{color:#5a3e00;}
.ios-tip-foot{font-size:10.5px;color:#a8893a;margin-top:4px;font-style:italic;}
.ios-tip-dismiss{margin-top:9px;width:100%;padding:7px;background:transparent;border:1.5px solid #c44400;color:#c44400;border-radius:6px;font-size:11.5px;font-weight:700;cursor:pointer;font-family:inherit;transition:background .15s,color .15s;}
.ios-tip-dismiss:hover,.ios-tip-dismiss:active{background:#c44400;color:#fff;}
.ios-tip-box.hidden{display:none;}`;
// The dismiss handler — runs INSIDE the print window. Writes a flag to
// the OPENER'S localStorage (same origin since the popup inherits it),
// then hides the tip immediately so the user gets feedback. Wrapped in
// try/catch in case the opener has been closed in a weird browser state.
const _IOS_TIP_JS = `
function dismissIosTip(){
  try { window.opener && window.opener.localStorage.setItem('ios_print_tip_dismissed','1'); } catch(e){}
  try { localStorage.setItem('ios_print_tip_dismissed','1'); } catch(e){}
  var box = document.querySelector('.ios-tip-box');
  if(box) box.classList.add('hidden');
}`;

function printSlide(){
  // If queue has items, open a print preview that contains every queued
  // location's two pages — same behavior as Download PDF when the queue is in use.
  if(PDF_QUEUE.length) return printQueue();

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
<title>${getExportName()||'compass-offices-one-pager'}</title>
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
  ${_IOS_TIP_CSS}
}

@media print {
  .print-controls { display: none !important; }
  .ios-tip-box { display: none !important; }
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

<!-- Perks page — always before Let's Talk (skipped if perks.js not loaded) -->
${typeof buildPerksPageHtml==='function' ? `<div class="page-wrap"><div class="page-clip">${buildPerksPageHtml(LANG)}</div></div>` : ''}

<!-- Page 3 — Let's talk (contact page, only if staff profile is set) -->
${buildContactPageHtml() ? `<div class="page-wrap"><div class="page-clip">${buildContactPageHtml()}</div></div>` : ''}

<!-- Floating controls (screen only) -->
<div class="print-controls">
  ${_buildIosTipHtml()}
  <div class="print-hint-box">
    <b>1 location</b> · 2 pages ready.<br>
    In the print dialog, choose <b>Save as PDF</b> &amp; set <b>Margins: None</b>.<br>
    <span style="display:inline-block;margin-top:6px;padding:2px 8px;background:#FF6600;color:#fff;border-radius:99px;font-size:11px;font-weight:700;">✓ Selectable text</span>
  </div>
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

${_IOS_TIP_JS}

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
      deposit_note:   DEPOSIT_NOTE[lc]   || '',
    };
  });

  // Effective location name — falls back to queue item names when form is
  // empty (e.g. after + Queue auto-cleared the form). Without this the
  // saved JSON has name:"" which _ingestFiles rejects as "Missing name".
  const effectiveLocationName = g('n-main') ||
    (PDF_QUEUE.length
      ? PDF_QUEUE.map(i => i.state?.langs?.en?.name || i.name || '').filter(Boolean).join(' + ')
      : '');

  const data = {
    // ── Multi-language content ──
    langs: langs_data,
    // ── Fallback single-lang fields (current lang, for backwards compat) ──
    name: effectiveLocationName, city: g('city'), floor: g('floor'),
    address: g('addr'),   page_url: g('purl'),
    virtual_tour: (document.getElementById('matterport')?.value||'').trim(),
    transport: TRANSPORT.map(t=>({iconId:t.iconId,text:t.text})),
    specs: {structure:g('s-struct'),completion:g('s-comp'),ceiling:g('s-ceil'),floor_area:g('s-fa'),common_area:g('s-ca'),oa:g('s-oa'),elevators:g('s-el'),ac:g('s-ac'),network:g('s-net'),facilities:g('s-fac'),hours:g('s-hrs'),parking:g('s-park')},
    pricing: S.rows.map(row=>{
      // Save every key (including custom columns), strip the runtime id.
      const {id, ...rest} = row;
      // Ensure built-in keys always exist for backward compat with old loaders.
      return {
        seats: rest.seats || '',
        type:  rest.type  || '',
        rent:  rest.rent  || '',
        mgmt:  rest.mgmt  || '',
        init:  rest.init  || '',
        avail: rest.avail || '',
        ...rest, // overrides built-ins with row's real values + carries custom_X keys
      };
    }),
    amenities: AMENITY_ICONS.filter(a=>a.on).map(a=>a.id),
    benefits_on: BENEFITS.filter(b=>b.on).map(b=>b.id),
    custom_title: g('custom-title'),
    custom_body: (document.getElementById('custom-body-editor')?.innerHTML||'').trim(),
    // ── Layout settings (global, same across all langs) ──
    benefits_title: {...BENEFITS_TITLE},
    deposit_note:   {...DEPOSIT_NOTE},
    benefits_pos:  BENEFITS_POS,
    custom_pos:    CUSTOM_POS,
    show_specs:    SHOW_SPECS,
    hidden_specs:  [...HIDDEN_SPECS],
    logo_separator: LOGO_SEP,
    pricing_cols:  PRICING_COLS.map(col=>({key:col.key,on:col.on,custom:!!col.custom,labels:{...col.labels}})),
    // ── Media (global) ──
    partner_logo_url: (S.partnerLogo&&!S.partnerLogo.startsWith('data:'))?S.partnerLogo:'',
    photos: S.photos.map(p=>(p&&!p.startsWith('data:'))?p:'').filter(Boolean),
    floorplan_url: (S.floorplan&&!S.floorplan.startsWith('data:'))?S.floorplan:'',
    fp_plans: FP_PLANS.map(p=>({url:p.url&&!p.url.startsWith('data:')?p.url:'',label:p.label||''})),
    fp_page2_same: FP_PAGE2_SAME,
    fp_page1_idx: FP_PAGE1_IDX,
    fp_page2_idx: FP_PAGE2_IDX,
    fp_base_url: FP_BASE_URL,
    fp_data_url: FP_DATA_URL,
    fp_highlights_manual: Array.from(FP_HIGHLIGHTS_MANUAL),
    office_lookup_region: AX_REGION,
    office_lookup_centre: AUS_CENTRE_FILTER,
    aus_selected: Array.from(AUS_SELECTED),
    deposit_note_on: DEPOSIT_NOTE_ON,
    base_discount_on: BASE_DISCOUNT_ON,
    base_discount: AUS_DISCOUNT,
    fp_use_3d: FP_USE_3D,
    compass_on: COMPASS_ON,
    compass_angle: COMPASS_ANGLE,
    icon_overrides: window.ICON_OVERRIDES||{},
    // ── Queue-session flag ──────────────────────────────────────────────
    // Set when this JSON was saved while the form was empty (i.e. the user
    // completed all proposals via + Queue and is saving the session).
    // applyLocationData reads this to auto-open the queue panel on load.
    _queue_session: !g('n-main') && PDF_QUEUE.length > 0,
    client_name: CLIENT_NAME || '',
    company_name: COMPANY_NAME || '',
    fp_p2_custom_url: FP_P2_CUSTOM_URL || null,
    fp_annotations: JSON.parse(JSON.stringify(FP_ANNOTATIONS)),
    // ── PDF Queue ──────────────────────────────────────────
    // Save lightweight queue entries (name + thumb + state). The cv1/cv2
    // pre-captured JPEGs are skipped because the new text-PDF export path
    // re-renders each card live at export time anyway.
    queue: (PDF_QUEUE || []).map(item => ({
      name: item.name,
      thumb: item.thumb,
      state: item.state,
    })),
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
// Note: toggleMobilePreview() and mobBackToEdit() are defined
// in extensions.js (complete versions with tab state handling)
// ══════════════════════════════════════════════════════════
// setMobTab replaced by mobOpenTab/mobShowPreview

// ══════════════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════════════
