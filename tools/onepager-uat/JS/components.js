// Compass Offices One-Pager Builder
// https://github.com/compassoffices/compassoffices.github.io

let CO_ICONS=[];
async function loadCoIcons(){
  try{
    const base=location.href.replace(/[^/]*$/,'');
    const res=await fetch(base+'icon/icons.json',{cache:'no-cache'});
    if(!res.ok)throw new Error('not found');
    CO_ICONS=await res.json();
  }catch(e){console.warn('CO icons not loaded:',e.message);}
}

function renderIcHtml(id,cls=''){
  if(!id)return'';
  const override=window.ICON_OVERRIDES?.[id];
  const resolvedId=override||id;
  if(resolvedId.startsWith('co_')){
    const ico=CO_ICONS.find(c=>c.id===resolvedId);
    if(!ico)return'';
    return`<img src="${ico.url}" class="co-icon-img${cls?' '+cls:''}" alt="${ico.label}">`;
  }
  return IC[resolvedId]||IC[id]||'';
}

const IC={
  concierge:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  lounge:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2"/><path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H6v-2a2 2 0 0 0-4 0z"/><line x1="6" y1="18" x2="6" y2="22"/><line x1="18" y1="18" x2="18" y2="22"/></svg>`,
  drinks:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>`,
  flexible:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  deposit:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`,
  furniture:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>`,
  utilities:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>`,
  access24:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  phonebooth:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.14 13.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.05 3h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 10.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 18l.02-1.08z"/></svg>`,
  parking:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/></svg>`,
  norestore:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
  security:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  tr_metro:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="16" rx="2"/><path d="M4 11h16M12 3v8"/><circle cx="8.5" cy="17.5" r="1.5"/><circle cx="15.5" cy="17.5" r="1.5"/><line x1="8.5" y1="19" x2="6" y2="22"/><line x1="15.5" y1="19" x2="18" y2="22"/></svg>`,
  tr_train:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="14" rx="2"/><path d="M16 14v2M8 14v2M2 10h20"/><circle cx="8" cy="17" r="1"/><circle cx="16" cy="17" r="1"/></svg>`,
  tr_bus:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6M3 6h18l1 8H2L3 6z"/><path d="M3 6V4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>`,
  tr_walk:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4" r="1.5"/><path d="m9 8 1 5 2-2 2 4"/><path d="m14.5 8-1.5 3H9"/><path d="m10 16-1 4M14 16l1 4"/></svg>`,
  tr_ferry:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20a2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1"/><path d="M4 17H2l2-9h16l1.5 7H18"/><path d="M8 12V8m4 4V7m4 5V9"/></svg>`,
  tr_car:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14l4 4v6a2 2 0 0 1-2 2h-2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>`,
  tr_airport:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 4s-2 1-3.5 2.5L11 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>`,
};

const TR_IC_LIST=[
  {id:'tr_metro',label:'Metro'},{id:'tr_train',label:'Train'},{id:'tr_bus',label:'Bus'},
  {id:'tr_walk',label:'Walk'},{id:'tr_ferry',label:'Ferry'},{id:'tr_car',label:'Car'},
  {id:'tr_airport',label:'Airport'},
];

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
// Snapshot the default 'on' state of each amenity so the new-proposal reset
// can restore them after a + Queue clears the rest of the form.
const _AMENITY_DEFAULT_ON = AMENITY_ICONS.map(a => a.on);
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

// ══════════════════════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════════════════════
