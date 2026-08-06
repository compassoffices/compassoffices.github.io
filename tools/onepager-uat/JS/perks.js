// ══════════════════════════════════════════════════════════
//  TRANSPORT
// ══════════════════════════════════════════════════════════
const CO_CITIES=['Hong Kong','Singapore','Tokyo','Osaka','Manila','Kuala Lumpur','Melbourne','Sydney','Ho Chi Minh City','Jakarta','Bangkok','Seoul','Taipei','Shanghai','Beijing','Shenzhen','Guangzhou','Chengdu','Dubai','Mumbai'].sort();

let TRANSPORT=[];
let _trIdSeq=0; // guaranteed unique even within same millisecond
function _trId(){ return 'tr_'+(++_trIdSeq)+'_'+Date.now(); }
function initTransport(lines){
  TRANSPORT=(lines||[]).map((l,i)=>({id:_trId(),iconId:l.iconId||'tr_metro',text:typeof l==='string'?l:(l.text||'')}));
}
function addTransport(text='',iconId='tr_metro'){
  TRANSPORT.push({id:_trId(),iconId,text});
  renderTransport();
  setTimeout(()=>{const eds=document.querySelectorAll('#tr-list .tr-rich-editor');if(eds.length)eds[eds.length-1].focus();},40);
}
function delTransport(id){TRANSPORT=TRANSPORT.filter(t=>t.id!==id);renderTransport();}
function renderTransport(){
  const list=document.getElementById('tr-list');if(!list)return;
  list.innerHTML=TRANSPORT.map(t=>{
    const iconSvg=(renderIcHtml(t.iconId)||IC[t.iconId]||'')||IC.tr_metro;
    const eid='tr-ed-'+t.id;
    return`<div class="tr-row" style="flex-direction:column;align-items:stretch;gap:5px;padding:8px 10px;">
      <div style="display:flex;align-items:center;gap:6px;">
        <button class="tr-ico-btn" onpointerdown="event.stopPropagation();openTrPicker('${t.id}',this)">${iconSvg}</button>
        <div class="tr-rich-mini">
          <button class="spec-rb" onmousedown="event.preventDefault();trRichOp('bold','${eid}')"><b>B</b></button>
          <button class="spec-rb orange" onmousedown="event.preventDefault();trRichOp('orange','${eid}')">●</button>
          <button class="spec-rb" onmousedown="event.preventDefault();trRichOp('black','${eid}')" style="color:#333">●</button>
          <button class="spec-rb" onmousedown="event.preventDefault();trRichOp('small','${eid}')" style="color:var(--lt)">S↓</button>
          <button class="spec-rb" onmousedown="event.preventDefault();trRichOp('clear','${eid}')">✕</button>
        </div>
        <button class="tr-del" onclick="delTransport('${t.id}')"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
      </div>
      <div class="tr-rich-editor" id="${eid}" contenteditable="true" data-tr-id="${t.id}" oninput="updateTrHtml('${t.id}',this);genDebounced(500);" placeholder="e.g. MTR Central — 2 min walk">${t.text||''}</div>
    </div>`;
  }).join('');
}
function updateTrHtml(id,el){const t=TRANSPORT.find(t=>t.id===id);if(t){let h=(el.innerHTML||'').trim();if(h==='<br>')h='';t.text=h;}}
function updateTr(id,val){const t=TRANSPORT.find(t=>t.id===id);if(t)t.text=val;}
function trRichOp(cmd,editorId){
  const el=document.getElementById(editorId);if(!el)return;el.focus();
  if(cmd==='bold')document.execCommand('bold',false,null);
  else if(cmd==='orange')document.execCommand('foreColor',false,'#FF6600');
  else if(cmd==='black')document.execCommand('foreColor',false,'#333333');
  else if(cmd==='clear')document.execCommand('removeFormat',false,null);
  else if(cmd==='small'){const sel=window.getSelection();if(sel&&sel.rangeCount&&!sel.isCollapsed){const range=sel.getRangeAt(0);const small=document.createElement('small');try{range.surroundContents(small);}catch(e){const frag=range.extractContents();small.appendChild(frag);range.insertNode(small);}}}
  updateTrHtml(el.dataset.trId,el);gen();
}

// ── ICON PICKER SHARED RESET ─────────────────────────────
function resetPickerTabs(){
  // Always start with builtin tab visible, CO hidden
  const builtin=document.getElementById('ico-pack-builtin');
  const co=document.getElementById('ico-pack-co');
  if(builtin){builtin.style.display='';builtin.classList.add('on');}
  if(co){co.style.display='none';co.classList.remove('on');}
  document.querySelectorAll('.ico-pack-tab').forEach((t,i)=>t.classList.toggle('on',i===0));
}
// Populate the CO panel with correct handler for current mode
function buildCOPanel(){
  const co=document.getElementById('ico-pack-co');if(!co)return;
  co.innerHTML=(Array.isArray(CO_ICONS)?CO_ICONS:[]).map(ic=>
    `<div class="ico-opt" onpointerdown="event.stopPropagation();selectIconByMode('${ic.id}')" title="${ic.label}">` +
    `<img src="${ic.url}" class="co-icon-img" style="width:18px;height:18px;object-fit:contain" alt="${ic.label}">` +
    `<span>${ic.label.split(' ')[0].slice(0,8)}</span></div>`
  ).join('')||'<div style="padding:10px;font-size:11px;color:var(--xlt);text-align:center;grid-column:1/-1">No CO icons loaded</div>';
}

let _trPickerId=null;
function openTrPicker(id,btn){
  _pickerMode='tr';_trPickerId=id;_pickerBenIdx=null;_amenPickerIdx=null;
  if(document.getElementById('ico-picker').classList.contains('open')&&_trPickerId===id){closeIconPicker();return;}
  const picker=document.getElementById('ico-picker');
  const cur=(TRANSPORT.find(t=>t.id===id)||{}).iconId||'tr_metro';
  document.getElementById('ico-picker-grid').innerHTML=TR_IC_LIST.map(ic=>
    `<div class="ico-opt${cur===ic.id?' sel':''}" onpointerdown="event.stopPropagation();selectIconByMode('${ic.id}')">` +
    `<span style="width:16px;height:16px;display:flex;align-items:center;justify-content:center">${(renderIcHtml(ic.id)||IC[ic.id]||'')||''}</span>` +
    `<span>${ic.label}</span></div>`
  ).join('');
  buildCOPanel();
  resetPickerTabs();
  const r=btn.getBoundingClientRect();
  picker.style.top=(r.bottom+6)+'px';picker.style.left=Math.min(r.left,window.innerWidth-240)+'px';
  picker.classList.add('open');
  document.removeEventListener('pointerdown',outsidePickerClick);
  setTimeout(()=>document.addEventListener('pointerdown',outsidePickerClick),50);
}
function selectTrIcon(iconId){
  if(_trPickerId===null)return;
  const t=TRANSPORT.find(t=>t.id===_trPickerId);if(t)t.iconId=iconId;
  closeIconPicker();_trPickerId=null;renderTransport();gen();
}

// ══════════════════════════════════════════════════════════
//  AMENITIES
// ══════════════════════════════════════════════════════════
const AMENITY_ICONS=[
  {id:'concierge',on:true,en:'Concierge',tc:'禮賓',sc:'礼宾',ja:'コンシェルジュ'},
  {id:'lounge',on:true,en:'Lounge',tc:'休息室',sc:'休息室',ja:'ラウンジ'},
  {id:'drinks',on:true,en:'Drinks',tc:'飲品',sc:'饮品',ja:'ドリンク'},
  {id:'flexible',on:true,en:'Flexible',tc:'靈活',sc:'灵活',ja:'柔軟契約'},
  {id:'deposit',on:true,en:'Deposit',tc:'保證金',sc:'押金',ja:'保証金'},
  {id:'furniture',on:true,en:'Furnished',tc:'傢俱齊備',sc:'家具齐备',ja:'家具完備'},
  {id:'utilities',on:true,en:'Utilities',tc:'水電包含',sc:'水电包含',ja:'光熱費込'},
  {id:'access24',on:true,en:'24/7',tc:'全天候',sc:'全天候',ja:'24時間'},
  {id:'phonebooth',on:false,en:'Phone Booth',tc:'電話亭',sc:'电话亭',ja:'フォンブース'},
  {id:'parking',on:false,en:'Parking',tc:'停車場',sc:'停车场',ja:'駐車場'},
  {id:'norestore',on:true,en:'No Restore',tc:'免還原',sc:'免复原',ja:'原状回復不要'},
  {id:'security',on:false,en:'Security',tc:'保安',sc:'保安',ja:'セキュリティ'},
];
function amenLabel(a){const map={'zh-hant':'tc','zh-hans':'sc','ja':'ja'};return a[map[LANG]]||a.en;}
function renderAmenities(){
  document.getElementById('amen-grid').innerHTML=AMENITY_ICONS.map((a,i)=>`
    <div class="amen-item${a.on?' on':''}" style="position:relative;padding-right:22px">
      <div style="display:flex;align-items:center;gap:7px;flex:1" onclick="toggleAmenIcon(${i})">
        <span class="aico">${renderIcHtml(a.id)||''}</span><span>${amenLabel(a)}</span>
      </div>
      <button onpointerdown="event.stopPropagation();openAmenIconPicker(${i},this)" style="position:absolute;right:4px;top:50%;transform:translateY(-50%);border:none;background:transparent;cursor:pointer;padding:2px;color:var(--xlt);font-size:10px;">⚙</button>
    </div>`).join('');
}
function toggleAmenIcon(i){AMENITY_ICONS[i].on=!AMENITY_ICONS[i].on;renderAmenities();gen();}

// ══════════════════════════════════════════════════════════
//  BENEFITS
// ══════════════════════════════════════════════════════════
const BEN_DEFAULTS={
  en:[{id:'concierge',text:'Concierge staff on-site (English available)'},{id:'lounge',text:'Lounge & meeting rooms shared'},{id:'drinks',text:'Coffee, drinks, microwave & fridge included'},{id:'flexible',text:'Flexible contracts — monthly or annual'},{id:'deposit',text:'3-month deposit, fully refundable on exit'},{id:'furniture',text:'Fully furnished, no fit-out required'},{id:'utilities',text:'Utilities, Free Wi-Fi & cleaning included'},{id:'access24',text:'24-hour access available'},{id:'norestore',text:'No restoration required on exit'},{id:'phonebooth',text:'Private phone booths available',on:false},{id:'parking',text:'Parking available on-site',on:false},{id:'security',text:'Security card access included',on:false}],
  'zh-hant':[{id:'concierge',text:'禮賓服務員常駐（可英語溝通）'},{id:'lounge',text:'休息室及會議室共用，可利用面積增倍'},{id:'drinks',text:'咖啡、飲品、微波爐及冰箱'},{id:'flexible',text:'月度或年度合約，靈活選擇'},{id:'deposit',text:'保證金3個月，退租時全額退還'},{id:'furniture',text:'辦公傢俱完備，無需裝修'},{id:'utilities',text:'水電費、免費WiFi及清潔費全包'},{id:'access24',text:'24小時全天候出入'},{id:'norestore',text:'退租毋須還原，僅需清潔費'},{id:'phonebooth',text:'私人電話亭及會議室獨佔使用',on:false},{id:'parking',text:'大廈設有停車場',on:false},{id:'security',text:'安全卡進出及全天候大廈保安',on:false}],
  'zh-hans':[{id:'concierge',text:'礼宾服务员常驻（可英语沟通）'},{id:'lounge',text:'休息室及会议室共用，可利用面积增倍'},{id:'drinks',text:'咖啡、饮品、微波炉及冰箱'},{id:'flexible',text:'月度或年度合同，灵活选择'},{id:'deposit',text:'押金3个月，退租时全额退还'},{id:'furniture',text:'办公家具完备，无需装修'},{id:'utilities',text:'水电费、免费WiFi及清洁费全包'},{id:'access24',text:'24小时全天候出入'},{id:'norestore',text:'退租无需复原，仅需清洁费'},{id:'phonebooth',text:'私人电话亭及会议室独占使用',on:false},{id:'parking',text:'大厦设有停车场',on:false},{id:'security',text:'安全卡进出及全天候大厦保安',on:false}],
  ja:[{id:'concierge',text:'コンシェルジュスタッフが常駐（英語対応可能）'},{id:'lounge',text:'ラウンジ・会議室など共有部利用で利用面積２倍'},{id:'drinks',text:'コーヒー・ドリンクアメニティ・冷蔵庫・電子レンジ付'},{id:'flexible',text:'月・年単位での契約期間設定可、保証会社不要'},{id:'deposit',text:'保証金3か月分　退去時全額返金'},{id:'furniture',text:'初期内装工事不要、オフィス家具完備'},{id:'utilities',text:'空調、水道光熱費、Free WiFi、清掃費用込'},{id:'access24',text:'24時間アクセス可・駐車場・喫煙場所有'},{id:'norestore',text:'退去時原状回復原則不要、クリーニング費用のみ'},{id:'phonebooth',text:'フォンブース、会議室の占有利用可',on:false},{id:'parking',text:'駐車場有',on:false},{id:'security',text:'セキュリティカード付',on:false}],
};
let BENEFITS=[];
function initBenefits(lc){
  const defaults=BEN_DEFAULTS[lc]||BEN_DEFAULTS.en;
  BENEFITS=defaults.map((d,i)=>({id:d.id||('custom_'+i),on:d.on!==false,text:d.text}));
}
const TICK_SVG=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
const IC_LIST=[{id:'concierge',label:'Concierge'},{id:'lounge',label:'Lounge'},{id:'drinks',label:'Drinks'},{id:'flexible',label:'Flexible'},{id:'deposit',label:'Deposit'},{id:'furniture',label:'Furnished'},{id:'utilities',label:'Utilities'},{id:'access24',label:'24/7'},{id:'phonebooth',label:'Phone'},{id:'parking',label:'Parking'},{id:'norestore',label:'No Restore'},{id:'security',label:'Security'}];

function getBenIconHtml(b){
  const id=b.iconId!==undefined?b.iconId:b.id;
  const html=renderIcHtml(id);
  if(!html)return`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
  if(html.startsWith('<img'))return html;
  const inner=html.match(/<svg[^>]*>([\s\S]*?)<\/svg>/)?.[1]||'';
  return`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
}
function getBenIcon(b){
  const id=b.iconId!==undefined?b.iconId:b.id;
  return(id&&(renderIcHtml(id)||IC[id]||''))?(renderIcHtml(id)||IC[id]||''):TICK_SVG;
}
function renderBenefits(){
  const list=document.getElementById('ben-list');if(!list)return;
  list.innerHTML=BENEFITS.map((b,i)=>{
    const safeText=(b.text||'').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    return`<div class="ben-row${b.on?' on':''}">
      <button class="ben-toggle${b.on?' on':''}" onclick="toggleBen(${i})"></button>
      <button class="ben-ico-btn" onpointerdown="event.stopPropagation();openIconPicker(${i},this)">${getBenIcon(b)}</button>
      <input class="ben-input" type="text" value="${safeText}" oninput="BENEFITS[${i}].text=this.value;genDebounced(500);" placeholder="Type benefit text…">
      <button class="ben-del" onclick="delBenefit(${i})"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
    </div>`;
  }).join('');
}

// ── ICON PICKER ──────────────────────────────────────────
let _pickerBenIdx=null,_pickerMode='ben';
function openIconPicker(i,btn){
  _pickerMode='ben';_pickerBenIdx=i;_amenPickerIdx=null;_trPickerId=null;
  if(document.getElementById('ico-picker').classList.contains('open')){closeIconPicker();return;}
  const picker=document.getElementById('ico-picker');
  const curId=BENEFITS[i].iconId!==undefined?BENEFITS[i].iconId:BENEFITS[i].id;
  document.getElementById('ico-picker-grid').innerHTML=[{id:'_tick',label:'Default ✓'},...IC_LIST].map(ic=>
    `<div class="ico-opt${curId===ic.id||(!curId&&ic.id==='_tick')?' sel':''}" onpointerdown="event.stopPropagation();selectIconByMode('${ic.id}')">` +
    `<span style="width:18px;height:18px;display:flex;align-items:center;justify-content:center">${ic.id==='_tick'?TICK_SVG:(renderIcHtml(ic.id)||IC[ic.id]||'')||TICK_SVG}</span>` +
    `<span>${ic.label}</span></div>`
  ).join('');
  buildCOPanel();
  resetPickerTabs();
  const r=btn.getBoundingClientRect();
  picker.style.top=(r.bottom+6)+'px';picker.style.left=Math.min(r.left,window.innerWidth-240)+'px';
  picker.classList.add('open');
  document.removeEventListener('pointerdown',outsidePickerClick);
  setTimeout(()=>document.addEventListener('pointerdown',outsidePickerClick),50);
}
function outsidePickerClick(e){
  const p=document.getElementById('ico-picker');
  if(p&&!p.contains(e.target)&&!e.target.closest('.ben-ico-btn,.tr-ico-btn,.ico-picker')){
    closeIconPicker();
    document.removeEventListener('pointerdown',outsidePickerClick);
  }
}
function selectBenIcon(iconId){
  if(_pickerBenIdx===null)return;
  BENEFITS[_pickerBenIdx].iconId=(iconId==='_tick')?null:iconId;
  closeIconPicker();renderBenefits();gen();
}
function switchIcoPack(pack,btn){
  document.querySelectorAll('.ico-pack-tab').forEach(b=>b.classList.remove('on'));
  if(btn)btn.classList.add('on');
  const builtin=document.getElementById('ico-pack-builtin');const co=document.getElementById('ico-pack-co');
  if(pack==='builtin'){
    builtin.style.display='';builtin.classList.add('on');
    co.style.display='none';co.classList.remove('on');
  } else {
    builtin.style.display='none';builtin.classList.remove('on');
    co.style.display='grid';co.classList.add('on');
    buildCOPanel(); // always rebuild with correct selectIconByMode handler
  }
}
function selectIconByMode(iconId){
  if(_pickerMode==='tr') selectTrIcon(iconId);
  else if(_pickerMode==='amen') selectAmenIcon(iconId);
  else selectBenIcon(iconId);
}
function selectAmenIcon(iconId){
  if(_amenPickerIdx===null)return;
  if(!window.ICON_OVERRIDES)window.ICON_OVERRIDES={};
  if(iconId==='_reset'){
    delete window.ICON_OVERRIDES[AMENITY_ICONS[_amenPickerIdx].id];
  } else {
    window.ICON_OVERRIDES[AMENITY_ICONS[_amenPickerIdx].id]=iconId;
  }
  closeIconPicker();_amenPickerIdx=null;renderAmenities();gen();
}
let _amenPickerIdx=null;
function openAmenIconPicker(i,btn){
  _pickerMode='amen';_amenPickerIdx=i;_pickerBenIdx=null;_trPickerId=null;
  if(document.getElementById('ico-picker').classList.contains('open')){closeIconPicker();return;}
  const picker=document.getElementById('ico-picker');
  const curId=window.ICON_OVERRIDES?.[AMENITY_ICONS[i].id]||AMENITY_ICONS[i].id;
  document.getElementById('ico-picker-grid').innerHTML=[{id:'_reset',label:'Default'},...IC_LIST].map(ic=>
    `<div class="ico-opt${curId===ic.id||(!window.ICON_OVERRIDES?.[AMENITY_ICONS[i].id]&&ic.id==='_reset')?' sel':''}" onpointerdown="event.stopPropagation();selectIconByMode('${ic.id}')">` +
    `<span style="width:16px;height:16px;display:flex;align-items:center;justify-content:center">${ic.id==='_reset'?TICK_SVG:renderIcHtml(ic.id)||IC[ic.id]||''}</span>` +
    `<span>${ic.label}</span></div>`
  ).join('');
  buildCOPanel();
  resetPickerTabs();
  const r=btn.getBoundingClientRect();
  picker.style.top=(r.bottom+6)+'px';picker.style.left=Math.min(r.left,window.innerWidth-300)+'px';
  picker.classList.add('open');
  document.removeEventListener('pointerdown',outsidePickerClick);
  setTimeout(()=>document.addEventListener('pointerdown',outsidePickerClick),50);
}
function closeIconPicker(){
  const p=document.getElementById('ico-picker');
  if(p)p.classList.remove('open');
  _pickerBenIdx=null;_trPickerId=null;_amenPickerIdx=null;
  document.removeEventListener('pointerdown',outsidePickerClick);
}
function toggleBen(i){BENEFITS[i].on=!BENEFITS[i].on;renderBenefits();gen();}
function delBenefit(i){BENEFITS.splice(i,1);renderBenefits();}
function addBenefit(){BENEFITS.push({id:'custom_'+Date.now(),on:true,text:''});renderBenefits();setTimeout(()=>{const inputs=document.querySelectorAll('#ben-list .ben-input');if(inputs.length)inputs[inputs.length-1].focus();},50);}

