// ══════════════════════════════════════════════════════════
//  GENERATE SLIDES
// ══════════════════════════════════════════════════════════
function gen(){
  const _captureMode = gen._captureMode || false;
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
  // pHdr now uses PRICING_COLS custom labels with i18n fallback
  const pHdr={seats:getPricingColLabel('seats'),type:getPricingColLabel('type'),rent:getPricingColLabel('rent'),mgmt:getPricingColLabel('mgmt'),init:getPricingColLabel('init'),avail:getPricingColLabel('avail')};
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
      <div class="sl-title">${name}${floor?` <span class="sl-floor-inline" style="font-size:calc(var(--fs)*0.82);vertical-align:middle;position:relative;top:-.05em">${floor}</span>`:''}</div>
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
  const bFScale = b => { const len=b.text.length; return len<=38?0.82:len<=50?0.74:len<=62?0.65:len<=75?0.58:0.52; };
  const meritsHTML=checked.length?`<div class="sl-merits-wrap"><div class="sl-merits-ttl">${bTitle}</div><ul class="sl-merits${bUseTwoCol?' two-col':''}">${checked.map(b=>`<li class="sl-merit"><span style="display:flex;align-items:flex-start;gap:calc(var(--fs)*0.28);overflow:hidden;min-width:0;width:100%">${getBenIconHtml(b)}<span style="font-size:calc(var(--fs)*${bFScale(b)});overflow:hidden;word-break:break-word;white-space:normal;line-height:1.25;">${b.text}</span></span></li>`).join('')}</ul></div>`:'';
  // Determine which floorplan(s) to show on each page
  const fpPh=`<div class="sl-fp-ph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width=".8" style="width:32%;opacity:.15;display:block;margin:0 auto 6px"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>Floor Plan</div>`;
  function buildFpHtml(pgIdx, showAll){
    const plans=FP_PLANS.length>0?FP_PLANS:(S.floorplan?[{url:S.floorplan,label:'Master'}]:[]);
    if(!plans.length) return fpPh;
    // pgIdx: -2 = rooms only (exclude master/index 0), -1 = all collage, 0+ = specific plan
    if(pgIdx===-2){
      // Rooms only — skip master (index 0)
      const rooms=plans.slice(1);
      if(!rooms.length) return buildFpHtml(0,false); // fallback to master if no rooms
      if(rooms.length===1) return`<img src="${rooms[0].url}" style="width:100%;height:100%;object-fit:contain;display:block;">`;
      const n=rooms.length;
      const cols=n===2?2:n===3?3:n<=4?2:3;
      const lastCol=(n%cols===0)?1:(cols-(n%cols)+1);
      return`<div class="sl-fp-collage" style="grid-template-columns:repeat(${cols},1fr)">${rooms.map((p,pi)=>`<img src="${p.url}" alt="${p.label}" style="${pi===rooms.length-1&&lastCol>1?'grid-column:span '+lastCol+';':''}">`).join('')}</div>`;
    }
    if(showAll||pgIdx===-1){
      if(plans.length===1) return`<img src="${plans[0].url}" style="width:100%;height:100%;object-fit:contain;display:block;">`;
      // Collage grid: 2→2col, 3→3col, 4→2×2, 5-6→3col
      const n=plans.length;
      const cols=n===2?2:n===3?3:n<=4?2:3;
      // Last item spans remaining columns if row isn't full
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
          ${checked.length?`<div class="sl-merits-ttl">${bTitle}</div><ul class="sl-merits" style="margin-top:calc(var(--fs)*0.1)">${checked.map(b=>`<li class="sl-merit"><span style="display:flex;align-items:center;gap:calc(var(--fs)*0.28);overflow:hidden;min-width:0;width:100%">${getBenIconHtml(b)}<span style="font-size:calc(var(--fs)*${bFScale(b)});overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${b.text}</span></span></li>`).join('')}</ul>`:''}
        </div>
      </div>
    </div>
    `:`
    <div class="sl-specs">
      <div class="sl-specs-inner">
        ${specRows.length?`<div class="sl-section ${(trLines.length||hasCustom||putBenInCentre)?'shrink':'grow'}"><div class="sl-sec">${sl('specs')}</div>${specGridHTML}</div>`:''}
        ${(()=>{const _tr=trLines.length?`<div class="sl-section shrink"><div class="sl-sec">${sl('transport')}</div><div class="sl-trans-grid" style="grid-template-columns:${trLines.length===1?'1fr':'1fr 1fr'}">${trLines.map(t=>{const trIconHtml=renderIcHtml(t.iconId)||IC[t.iconId]||IC.tr_metro;const trIsImg=trIconHtml.startsWith('<img');const trIconEl=trIsImg?trIconHtml.replace('co-icon-img','co-icon-img sl-ticon-img'):`<svg class="sl-ticon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${trIconHtml.match(/<svg[^>]*>([\s\S]*?)<\/svg>/)?.[1]||''}</svg>`;return`<div class="sl-trans">${trIconEl}<span class="sl-trans-txt">${t.text}</span></div>`;}).join('')}</div></div>`:'';const _cu=hasCustom?`<div class="sl-section shrink"><div class="sl-custom-block">${g('custom-title')?`<div class="sl-custom-title">${g('custom-title')}</div>`:''} ${(()=>{const el=document.getElementById('custom-body-editor');const html=(el?.innerHTML||'').trim();return html&&html!=='<br>'?`<div class="sl-custom-body">${html}</div>`:''})()}</div></div>`:'';return CUSTOM_POS==='above'?_cu+_tr:_tr+_cu;})()}
        ${putBenInCentre&&checked.length?`<div class="sl-section shrink"><div class="sl-merits-ttl">${bTitle}</div><ul class="sl-merits${bUseTwoCol?' two-col':''}">${checked.map(b=>`<li class="sl-merit"><span style="display:flex;align-items:center;gap:calc(var(--fs)*0.28);overflow:hidden;min-width:0;width:100%">${getBenIconHtml(b)}<span style="font-size:calc(var(--fs)*${bFScale(b)});overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${b.text}</span></span></li>`).join('')}</ul></div>`:''}
      </div>
    </div>
    <div class="sl-right">${fpHTML}${putBenInCentre?'':meritsHTML}</div>
    `}
  </div>
  <div class="sl-foot">
    ${S.rows.length?`<table class="sl-ptbl"><thead><tr>${activeCols.map(k=>`<th>${pHdr[k]}</th>`).join('')}</tr></thead><tbody>${S.rows.map(r=>`<tr>${activeCols.map(k=>{const v=r[k]||'';const isPrice=k==='rent'||k==='mgmt'||k==='avail';return isPrice?`<td class="acc">${v}</td>`:k==='init'?`<td class="init-cell">${v}</td>`:`<td>${v}</td>`;}).join('')}</tr>`).join('')}</tbody></table>`:`<p style="font-size:.65em;color:#CCC">Add pricing rows in the Pricing tab</p>`}
    ${purl?`<div class="sl-url">${purl}</div>`:''}
  </div>`;

  const page2El=document.getElementById('slide2');
  page2El.style.setProperty('--fs',fsVal);
  const noph2=(bg='#E8E8E8')=>`<div class="p2-noph" style="background:${bg}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width=".8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`;
  page2El.innerHTML=`
  ${topBarHTML(2)}
  <div class="p2-body">
    <div class="p2-fp-area">
      ${(FP_PLANS.length||S.floorplan)?buildFpHtml(fp2Idx,fp2All):`<div class="p2-fp-ph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width=".8" style="width:60px;height:60px;opacity:.18;display:block;"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg><span>Upload a floor plan in the Media tab</span></div>`}
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

