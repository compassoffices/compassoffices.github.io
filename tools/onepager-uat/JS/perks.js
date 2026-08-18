// Compass Offices One-Pager Builder
// https://github.com/compassoffices/compassoffices.github.io

// ══════════════════════════════════════════════════════════════════════════
//  PERKS PAGE — fixed marketing page injected before Let's Talk in every PDF
//  Body = 794 - 76 = 718px │ Top = 445px (62%) │ Bottom = 273px (38%)
// ══════════════════════════════════════════════════════════════════════════

const PERKS_I18N = {
  'en': {
    eyebrow:        'BEYOND THE WORKSPACE',
    title:          'Perks that Boost\nYour Happiness',
    desc:           'Our exclusive perks and partnerships deliver discounts, complimentary access, and curated gifts on gyms, restaurants, hotels, and storage — enhancing your wellbeing inside and outside the office.',
    cats:           ['FITNESS', 'FOOD & BEVERAGE', 'LIFESTYLE', 'STORAGE'],
    perks_cta:      'View Our Perks →',
    perks_site:     'compassoffices.com/client-perks',
    events_eyebrow: 'NETWORK. SHARE. GROW.',
    events_title:   'Events & Community',
    events_desc:    'Bringing together diverse professionals for networking, knowledge sharing, and collaboration across all Compass Offices locations.',
    events_cta:     'Explore Our Events →',
    events_site:    'compassoffices.com/events',
    tagline:        'FLEXIBLE. CONNECTED. HUMAN CENTRIC.',
    a_great_place:  'A Great Place to Work',
  },
  'zh-hant': {
    eyebrow:        '工作空間以外',
    title:          '提升您幸福感\n的專屬特權',
    desc:           '我們獨家的優惠與合作夥伴，為您提供健身房、餐廳、酒店及儲存等各方面的折扣、免費使用及精心策劃的禮品——全面提升您的健康與生產力。',
    cats:           ['健康與養生', '飲食', '生活方式', '儲存服務'],
    perks_cta:      '查看專屬特權 →',
    perks_site:     'compassoffices.com/client-perks',
    events_eyebrow: '聯繫。分享。成長。',
    events_title:   '活動與社群',
    events_desc:    '匯聚各行各業的專業人士，共同參與交流、知識分享及協作活動。',
    events_cta:     '瀏覽我們的活動 →',
    events_site:    'compassoffices.com/events',
    tagline:        '靈活。互聯。以人為本。',
    a_great_place:  '優質工作好去處',
  },
  'zh-hans': {
    eyebrow:        '工作空间以外',
    title:          '提升您幸福感\n的专属特权',
    desc:           '我们独家的优惠与合作伙伴，为您提供健身房、餐厅、酒店及储存等各方面的折扣、免费使用及精心策划的礼品——全面提升您的健康与生产力。',
    cats:           ['健康与养生', '饮食', '生活方式', '存储服务'],
    perks_cta:      '查看专属特权 →',
    perks_site:     'compassoffices.com/client-perks',
    events_eyebrow: '联系。分享。成长。',
    events_title:   '活动与社群',
    events_desc:    '汇聚各行各业的专业人士，共同参与交流、知识分享及协作活动。',
    events_cta:     '浏览我们的活动 →',
    events_site:    'compassoffices.com/events',
    tagline:        '灵活。互联。以人为本。',
    a_great_place:  '优质工作好去处',
  },
  'ja': {
    eyebrow:        'ワークスペースを超えて',
    title:          '幸せを高める\n特典',
    desc:           '独自のパークスとパートナーシップにより、ジム、レストラン、ホテル、ストレージなどの割引や無料アクセス、厳選されたギフトをお届けします。',
    cats:           ['フィットネス', 'フード&ビバレッジ', 'ライフスタイル', 'ストレージ'],
    perks_cta:      '特典を見る →',
    perks_site:     'compassoffices.com/client-perks',
    events_eyebrow: 'つながる。共有する。成長する。',
    events_title:   'イベント&コミュニティ',
    events_desc:    '多様な専門家が集まり、ネットワーキング、知識共有、コラボレーションを行います。',
    events_cta:     'イベントを見る →',
    events_site:    'compassoffices.com/events',
    tagline:        'フレキシブル。コネクテッド。人中心。',
    a_great_place:  'A Great Place to Work',
  },
};

// Primary = Cloudinary (stable, CORS-friendly, updatable by re-uploading the
// same public ID). Fallback = the original WordPress URLs, tried automatically
// if a Cloudinary asset hasn't been uploaded yet.
// Hosted in Cloudinary folder _CompassOffices/perks-and-event/ (uploaded 2026-08-07).
// To update an image later: re-upload in Cloudinary with the same name, then
// update the version number in _PERKS_CDN below (or ask for a code update).
const _PERKS_CDN = 'https://res.cloudinary.com/dutvfdhdp/image/upload/v1786082092/_CompassOffices/perks-and-event/';
const _PERKS_FALLBACK = {
  fitness:    'https://www.compassoffices.com/wp-content/uploads/2026/01/image-1080x450-87KB-2026-01-12T05-59-01-248Z.jpg',
  food:       'https://www.compassoffices.com/wp-content/uploads/2025/07/image-1080x450-126KB-2025-07-30T06-33-26-434Z.jpg',
  lifestyle:  'https://www.compassoffices.com/wp-content/uploads/2025/07/image-1080x450-80KB-2025-07-22T16-41-30-242Z.jpg',
  storage:    'https://www.compassoffices.com/wp-content/uploads/2026/03/redbox.jpg',
  events:     'https://www.compassoffices.com/wp-content/uploads/2025/08/image-1080x450-144KB-2025-08-12T05-47-39-785Z.jpg',
};
const _PERKS_IMGS = {
  fitness:    _PERKS_CDN + 'FITNESS.jpg',
  food:       _PERKS_CDN + 'FOOD_BEVERAGE.jpg',
  lifestyle:  _PERKS_CDN + 'LIFESTYLE.jpg',
  storage:    _PERKS_CDN + 'STORAGE.jpg',
  events:     _PERKS_CDN + 'Events.jpg',
  logo_white: 'https://res.cloudinary.com/dutvfdhdp/image/upload/v1779196609/_CompassOffices/compass-logo-white.svg',
};

const _PERKS_GPTW       = 'https://res.cloudinary.com/dutvfdhdp/image/upload/v1779459810/_CompassOffices/a-great-place-to-work.svg';
const _PERKS_PAGE_URL   = 'https://www.compassoffices.com/client-perks/';
const _PERKS_EVENTS_URL = 'https://www.compassoffices.com/events/';

// Pixel-perfect split — same values used on BOTH left and right panels
const _PH  = 76;           // header height
const _PB  = 794 - _PH;    // body height = 718px
const _PT  = Math.round(_PB * 0.62); // top section  = 445px
const _PBT = _PB - _PT;    // bottom section = 273px

function buildPerksPageHtml(lang) {
  try {
  const t  = PERKS_I18N[lang] || PERKS_I18N['en'];
  const im = _PERKS_IMGS;
  const ff = "font-family:'Hanken Grotesk','Noto Sans TC','Noto Sans JP',sans-serif;";
  const fmtTitle = s => s.replace(/\n/g, '<br>');

  // Image cell with category label overlay
  const imgCell = (src, label, fbKey) => {
    const fb = fbKey && _PERKS_FALLBACK[fbKey] ? _PERKS_FALLBACK[fbKey] : '';
    const onerr = fb
      ? `if(!this.dataset.fb){this.dataset.fb=1;this.src='${fb}';}else{this.style.display='none';}`
      : `this.style.display='none';`;
    return `<div style="position:relative;overflow:hidden;background:#222;">
       <img src="${src}" style="width:100%;height:100%;object-fit:cover;display:block;" onerror="${onerr}">
       <div style="position:absolute;bottom:0;left:0;right:0;padding:9px 14px;background:rgba(0,0,0,.52);">
         <span style="${ff}color:#fff;font-size:12px;font-weight:700;letter-spacing:.08em;">${label}</span>
       </div>
     </div>`;
  };

  // Orange line + small caps eyebrow
  const eyebrow = txt =>
    `<div style="display:flex;align-items:center;gap:10px;margin-bottom:11px;">
       <div style="width:26px;height:2.5px;background:#FF6600;flex-shrink:0;"></div>
       <span style="${ff}color:#FF6600;font-size:11px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;">${txt}</span>
     </div>`;

  // Compact pill button — wraps to natural width, not stretched
  const pillBtn = (href, label) =>
    `<div style="display:inline-block;">
       <a href="${href}" target="_blank"
          style="${ff}background:#FF6600;color:#fff;font-size:11px;font-weight:700;
                 letter-spacing:.06em;padding:9px 22px;border-radius:20px;
                 display:inline-block;text-decoration:none;white-space:nowrap;">${label}</a>
     </div>`;

  const cats = t.cats;

  return `
<div style="width:1122px;height:794px;${ff}display:flex;flex-direction:column;
     overflow:hidden;background:#fff;
     -webkit-print-color-adjust:exact;print-color-adjust:exact;">

  <!-- BLACK HEADER ${_PH}px -->
  <div style="background:#111;height:${_PH}px;display:flex;align-items:center;
       padding:0 34px;justify-content:space-between;flex-shrink:0;">
    <img src="${im.logo_white}" style="height:28px;object-fit:contain;">
    <div style="border:1.5px solid rgba(255,102,0,.7);color:#FF6600;
         font-size:13px;font-weight:700;letter-spacing:.1em;padding:5px 14px;border-radius:2px;">
      ${t.tagline}
    </div>
    <img src="${_PERKS_GPTW}" style="height:20px;object-fit:contain;">
  </div>

  <!-- BODY ${_PB}px -->
  <div style="height:${_PB}px;display:flex;">

    <!-- LEFT WHITE PANEL -->
    <div style="width:416px;flex-shrink:0;background:#fff;display:flex;flex-direction:column;
         border-right:1.5px solid #e8e0d8;">

      <!-- TOP ${_PT}px — Perks -->
      <div style="height:${_PT}px;padding:30px 30px 26px 32px;
           display:flex;flex-direction:column;justify-content:center;
           border-bottom:3px solid #e8e0d8;box-sizing:border-box;overflow:hidden;">
        ${eyebrow(t.eyebrow)}
        <div style="font-size:28px;font-weight:800;line-height:1.1;color:#111;margin-bottom:12px;">
          ${fmtTitle(t.title)}
        </div>
        <div style="font-size:12px;color:#999;line-height:1.7;margin-bottom:18px;">${t.desc}</div>
        ${pillBtn(_PERKS_PAGE_URL, t.perks_cta)}
        <div style="font-size:10px;color:#ccc;margin-top:7px;">${t.perks_site}</div>
      </div>

      <!-- BOTTOM ${_PBT}px — Events -->
      <div style="height:${_PBT}px;padding:22px 30px 22px 32px;
           display:flex;flex-direction:column;justify-content:center;
           box-sizing:border-box;overflow:hidden;">
        ${eyebrow(t.events_eyebrow)}
        <div style="font-size:26px;font-weight:800;line-height:1.1;color:#111;margin-bottom:10px;">
          ${t.events_title}
        </div>
        <div style="font-size:12px;color:#999;line-height:1.65;margin-bottom:14px;">${t.events_desc}</div>
        ${pillBtn(_PERKS_EVENTS_URL, t.events_cta)}
        <div style="font-size:10px;color:#ccc;margin-top:7px;">${t.events_site}</div>
      </div>
    </div>

    <!-- RIGHT IMAGE PANEL -->
    <div style="flex:1;display:flex;flex-direction:column;gap:2px;background:#ccc;">

      <!-- 2×2 grid — ${_PT}px matches left top -->
      <div style="height:${_PT}px;display:grid;
           grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;
           gap:2px;flex-shrink:0;">
        ${imgCell(im.fitness,   cats[0], 'fitness')}
        ${imgCell(im.food,      cats[1], 'food')}
        ${imgCell(im.lifestyle, cats[2], 'lifestyle')}
        ${imgCell(im.storage,   cats[3], 'storage')}
      </div>

      <!-- Events banner — ${_PBT}px matches left bottom -->
      <div style="height:${_PBT}px;position:relative;overflow:hidden;background:#222;flex-shrink:0;">
        <img src="${im.events}" style="width:100%;height:100%;object-fit:cover;
             object-position:center 30%;display:block;"
             onerror="if(!this.dataset.fb){this.dataset.fb=1;this.src='${_PERKS_FALLBACK.events}';}else{this.style.display='none';}">
        <div style="position:absolute;inset:0;background:rgba(0,0,0,.22);"></div>
        <div style="position:absolute;bottom:14px;left:16px;display:flex;align-items:center;gap:10px;">
          <div style="width:22px;height:2.5px;background:#FF6600;"></div>
          <span style="${ff}color:#fff;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;">
            ${t.events_title}
          </span>
        </div>
      </div>
    </div>

  </div>
</div>`;
  } catch(e) {
    console.error('[Perks page] render error:', e);
    return ''; // return empty string — print continues without perks page
  }
}


// ══════════════ OPTIONAL DETAIL PAGES — builders (1122×794 landscape) ══════════════
const _DP_T={
  'en':{vo:'Virtual Office Packages',mr:'Meeting Room Pricing',it:'IT & Telecommunications',mo:'/month',int:'Internal Clients',ext:'External Clients',room:'Room',p30:'Per 30 mins',pday:'Per day',avail:'Meeting rooms at this centre',lvl:'Level'},
  'zh-hant':{vo:'虛擬辦公室方案',mr:'會議室價目',it:'IT 與電訊服務',mo:'/月',int:'內部客戶',ext:'外部客戶',room:'會議室',p30:'每 30 分鐘',pday:'每天',avail:'本中心會議室',lvl:'樓層'},
  'zh-hans':{vo:'虚拟办公室方案',mr:'会议室价目',it:'IT 与电信服务',mo:'/月',int:'内部客户',ext:'外部客户',room:'会议室',p30:'每 30 分钟',pday:'每天',avail:'本中心会议室',lvl:'楼层'},
  'ja':{vo:'バーチャルオフィスプラン',mr:'会議室料金',it:'IT＆通信サービス',mo:'/月',int:'ご入居のお客様',ext:'外部のお客様',room:'会議室',p30:'30分あたり',pday:'1日あたり',avail:'当センターの会議室',lvl:'フロア'},
};
function _dpT(k){ return (_DP_T[LANG]||_DP_T['en'])[k]||_DP_T['en'][k]||k; }
const _DPF="font-family:'Hanken Grotesk','Noto Sans TC','Noto Sans JP',sans-serif;";
function _dpPage(title,inner){
  const nm=document.getElementById('n-main')?.value.trim()||'';
  const fl=(typeof combineFloorLabel==='function')?combineFloorLabel(document.getElementById('floor')?.value.trim()||''):'';
  return `<div style="${_DPF}width:1122px;height:794px;background:#fff;overflow:hidden;display:flex;flex-direction:column;">
    <div style="display:flex;align-items:center;padding:24px 40px 12px;flex-shrink:0;">
      <div style="width:34px;height:4px;background:#FF6600;margin-right:14px;"></div>
      <div style="font-size:25px;font-weight:800;color:#1A1A1A;">${title}</div>
      <div style="margin-left:auto;font-size:12.5px;color:#8A8A8A;font-weight:600;">${nm}${fl?' · '+fl:''}</div>
    </div>
    <div style="flex:1;min-height:0;padding:4px 40px 22px;overflow:hidden;">${inner}</div>
  </div>`;
}
function _dpCur(){ return _VO_CUR[(voCurrentId().match(/^([a-z]{2})-/)||[])[1]]||''; }

function buildVoDetailPageHtml(){
  const id=voCurrentId();
  if(!id||!VO_PRICES||!VO_PRICES[id]||!DP.vo_features.length) return '';
  const p=VO_PRICES[id], cur=_dpCur();
  const set=_voMarketOf(id)==='Australia'?'australia':'default';
  let rows=DP.vo_features.filter(r=>(r.set||'default')===set);
  if(!rows.length) rows=DP.vo_features.filter(r=>(r.set||'default')==='default');
  const feats=rows.filter(r=>r.row_type==='feature'||r.row_type==='category');
  const notes=rows.filter(r=>r.row_type==='footnote');
  const fs=feats.length>22?9.5:(feats.length>16?10.5:11.5);
  const cell=v=>{
    v=String(v||'').trim();
    if(v==='•') return '<span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#FF6600;"></span>';
    if(v==='—'||v==='-'||v==='') return '<span style="color:#CCC;">—</span>';
    return `<b>${v}</b>`;
  };
  let t=`<table style="width:100%;border-collapse:collapse;font-size:${fs}px;">
    <tr><th style="text-align:left;padding:7px 8px;border-bottom:2.5px solid #1A1A1A;"></th>`+
    [['Gold',p.gold],['Platinum',p.platinum],['Diamond',p.diamond]].map(([n,pr])=>
      `<th style="width:150px;text-align:center;padding:7px 8px;border-bottom:2.5px solid #1A1A1A;">
        <div style="font-size:13px;font-weight:800;letter-spacing:.04em;">${n}</div>
        <div style="color:#FF6600;font-weight:800;font-size:13.5px;">${cur}${pr}<span style="font-size:9px;color:#999;font-weight:600;"> ${_dpT('mo')}</span></div>
      </th>`).join('')+`</tr>`;
  feats.forEach(r=>{
    if(r.row_type==='category'){
      t+=`<tr><td colspan="4" style="padding:8px 8px 4px;font-weight:800;font-size:${fs+0.5}px;color:#FF6600;border-bottom:1px solid #EEE;">${_dpL(r,'label')}</td></tr>`;
    }else{
      t+=`<tr><td style="padding:4px 8px;border-bottom:1px solid #F2F2F2;color:#444;">${_dpL(r,'label')}</td>`+
        ['gold','platinum','diamond'].map(k=>`<td style="text-align:center;border-bottom:1px solid #F2F2F2;">${cell(r[k])}</td>`).join('')+`</tr>`;
    }
  });
  t+=`</table>`;
  if(notes.length) t+=`<div style="margin-top:8px;font-size:8.5px;color:#999;line-height:1.5;">${notes.map(n=>_dpL(n,'label')).join('<br>')}</div>`;
  return _dpPage(_dpT('vo'),t);
}

function buildMrPageHtml(){
  const id=voCurrentId(), mkt=_voMarketOf(id);
  if(!mkt||!DP.mr_prices.length) return '';
  const mine=DP.mr_prices.filter(r=>r.market===mkt&&(r.scope==='all'||r.scope===id));
  if(!mine.length) return '';
  const tbl=client=>{
    const rows=mine.filter(r=>r.client===client);
    if(!rows.length) return '';
    return `<div style="flex:1;min-width:0;">
      <div style="font-size:14px;font-weight:800;margin:0 0 6px;">${client==='Internal'?_dpT('int'):_dpT('ext')}</div>
      <table style="width:100%;border-collapse:collapse;font-size:11px;">
        <tr><th style="text-align:left;padding:5px 6px;border-bottom:2px solid #1A1A1A;">${_dpT('room')}</th>
        <th style="text-align:right;padding:5px 6px;border-bottom:2px solid #1A1A1A;">${_dpT('p30')}</th>
        <th style="text-align:right;padding:5px 6px;border-bottom:2px solid #1A1A1A;">${_dpT('pday')}</th></tr>`+
      rows.map(r=>`<tr><td style="padding:4.5px 6px;border-bottom:1px solid #F0F0F0;">${r.tier_en||''}${r.scope!=='all'?' <span style="font-size:8.5px;color:#FF6600;">●</span>':''}</td>
        <td style="text-align:right;padding:4.5px 6px;border-bottom:1px solid #F0F0F0;color:#FF6600;font-weight:700;">${r.per_30_mins||'—'}</td>
        <td style="text-align:right;padding:4.5px 6px;border-bottom:1px solid #F0F0F0;color:#FF6600;font-weight:700;">${r.per_day||'—'}</td></tr>`).join('')+
      `</table></div>`;
  };
  let inner=`<div style="display:flex;gap:34px;">${tbl('Internal')}${tbl('External')}</div>`;
  // Availability matrix for THIS centre
  const mx=DP.mr_matrix.filter(r=>r.centre_id===id);
  if(mx.length){
    const tierRow=(DP.mr_tiers||[]).find(r=>r.market===mkt&&r.kind==='matrix');
    const nCols=Math.max(...mx.map(r=>{let n=0;for(let i=1;i<=6;i++)if((r['t'+i]||'')!=='')n=i;return n;}),
                         tierRow?[1,2,3,4,5,6].filter(i=>tierRow['t'+i]).length:0);
    const lbl=i=>tierRow?( _dpL(tierRow,'t'+i)||tierRow['t'+i]||('Room '+i)):('Room '+i);
    inner+=`<div style="margin-top:16px;">
      <div style="font-size:13px;font-weight:800;margin:0 0 6px;">${_dpT('avail')}</div>
      <table style="border-collapse:collapse;font-size:10.5px;">
        <tr><th style="text-align:left;padding:4px 10px 4px 0;border-bottom:2px solid #1A1A1A;">${_dpT('lvl')}</th>`+
      Array.from({length:nCols},(_,i)=>`<th style="padding:4px 12px;border-bottom:2px solid #1A1A1A;">${lbl(i+1)}</th>`).join('')+`</tr>`+
      mx.map(r=>`<tr><td style="padding:4px 10px 4px 0;border-bottom:1px solid #F0F0F0;font-weight:700;">${r.level||''}</td>`+
        Array.from({length:nCols},(_,i)=>`<td style="text-align:center;border-bottom:1px solid #F0F0F0;color:${(r['t'+(i+1)]||'')!==''?'#57A05A':'#E2E2E2'};font-weight:800;">${(r['t'+(i+1)]||'')!==''?'✓':'–'}</td>`).join('')+`</tr>`).join('')+
      `</table></div>`;
  }
  return _dpPage(_dpT('mr'),inner);
}

function buildItPagesHtml(){
  const mkt=_voMarketOf(voCurrentId());
  if(!mkt||!DP.it_packages.length) return [];
  const all=DP.it_packages.filter(r=>r.market===mkt);
  if(!all.length) return [];
  const secBlock=sk=>{
    const rows=all.filter(r=>r.section===sk).sort((a,b)=>(+a.sort||0)-(+b.sort||0));
    if(!rows.length) return '';
    const tiers=rows.filter(r=>r.row_type==='tier'), nT=tiers.length||1, cw=nT>1?95:170;
    const sec=rows.find(r=>r.row_type==='section');
    const tint=['#F5F8FC','#F4FAF5','#FEF8F0'];
    let h='';
    if(sec&&_dpL(sec,'label')) h+=`<div style="display:flex;background:#F7F7F7;border-top:2px solid #DDD;align-items:center;">
      <div style="flex:1;font-size:13.5px;font-weight:800;padding:6px 8px;">${_dpL(sec,'label')}</div></div>`;
    if(nT>1) h+=`<div style="display:flex;border-bottom:1px solid #E4E4E4;"><div style="flex:1;"></div>`+
      tiers.map((t,i)=>`<div style="flex:0 0 ${cw}px;text-align:center;padding:3px 2px;background:${tint[i]};font-size:8px;font-weight:700;line-height:1.25;">
        <div style="font-size:10px;font-weight:800;color:${['#4A78C2','#57A05A','#E8A33D'][i]};">${String(t.note||'').toUpperCase()}</div>${_dpL(t,'label')}</div>`).join('')+`</div>`;
    const body=rows.filter(r=>['group','bullet','option'].includes(r.row_type));
    let i=0;
    while(i<body.length){
      if(body[i].row_type!=='group'){i++;continue;}
      const g=body[i]; i++;
      const kids=[];
      while(i<body.length&&body[i].row_type!=='group'){kids.push(body[i]);i++;}
      if(!_dpL(g,'label')) continue;
      const bl=kids.filter(k=>k.row_type==='bullet'&&_dpL(k,'label'));
      const op=kids.filter(k=>k.row_type==='option'&&_dpL(k,'label'));
      const perB=bl.some(b=>b.price_a!=='');
      h+=`<div style="display:flex;border-top:1px solid #E4E4E4;">
        <div style="flex:0 0 130px;font-size:9.5px;font-weight:700;padding:4px 6px 4px 0;line-height:1.3;">${_dpL(g,'label')}</div>
        <div style="flex:1;min-width:0;padding:2px 0;">`+
        bl.map(b=>`<div style="font-size:8.2px;line-height:1.35;padding:1.2px 4px 1.2px 0;display:flex;gap:4px;"><span>•</span><span style="flex:1;">${_dpL(b,'label')}</span>${perB&&b.price_a?`<span style="color:#FF6600;font-weight:700;">${b.price_a}</span>`:''}</div>`).join('')+`</div>`;
      if(!perB||g.price_a!==''){
        const vals=nT>1?[g.price_a,g.price_b,g.price_c].slice(0,nT):[g.price_a];
        h+=vals.map((v,vi)=>`<div style="flex:0 0 ${cw}px;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#FF6600;text-align:center;border-left:1px solid #E4E4E4;background:${nT>1?tint[vi]:'#fff'};padding:2px;line-height:1.25;">${v||''}</div>`).join('');
      }
      h+=`</div>`;
      op.forEach(o=>{h+=`<div style="display:flex;background:#F5F5F5;border-top:1px solid #E4E4E4;">
        <div style="flex:1;font-size:8.2px;padding:2.5px 4px 2.5px 132px;">${_dpL(o,'label')}</div>
        <div style="flex:0 0 ${nT*cw}px;display:flex;align-items:center;justify-content:center;font-size:8.5px;font-weight:700;color:#FF6600;">${o.price_a||''}</div></div>`;});
    }
    return h+`<div style="border-bottom:2px solid #DDD;margin-bottom:8px;"></div>`;
  };
  const pageA=['wifi_banner','enterprise','standard'].map(secBlock).join('');
  const pageB=['rack','telecom','bundle'].map(secBlock).join('');
  const out=[];
  if(pageA.trim()) out.push(_dpPage(_dpT('it'),pageA));
  if(pageB.trim()) out.push(_dpPage(_dpT('it')+' <span style="font-size:14px;color:#999;">2/2</span>',pageB));
  return out;
}

// Enabled detail pages as inner-page HTML strings (print + mobile use this)
function _detailPagesInner(){
  const out=[];
  try{
    if(VO_DETAIL_ON){const x=buildVoDetailPageHtml(); if(x)out.push(x);}
    if(MR_PAGE_ON){const x=buildMrPageHtml(); if(x)out.push(x);}
    if(IT_PAGE_ON){buildItPagesHtml().forEach(x=>out.push(x));}
  }catch(e){console.warn('[detail pages]',e);}
  return out;
}
function _detailPagesHtml(){
  return _detailPagesInner().map(x=>`<div class="page-wrap"><div class="page-clip">${x}</div></div>`).join('\n');
}


// ══════════════ DETAIL PAGES — LIVE PREVIEW ══════════════
// Renders the enabled detail pages under the proposal preview, exactly like
// the multi-floor extra pages (same pmeta label + slide-wrap sizing).
function renderDetailPreviews(){
  clearTimeout(renderDetailPreviews._t);
  renderDetailPreviews._t=setTimeout(()=>{
    const box=document.getElementById('detail-preview');
    if(!box) return;
    try{
      const names=[];
      if(VO_DETAIL_ON) names.push(_dpT('vo'));
      if(MR_PAGE_ON) names.push(_dpT('mr'));
      if(IT_PAGE_ON) names.push(_dpT('it'));
      const pages=_detailPagesInner();
      if(!pages.length){ box.innerHTML=''; return; }
      // label per page (IT contributes 2 pages)
      const labels=[];
      if(VO_DETAIL_ON&&buildVoDetailPageHtml()) labels.push(_dpT('vo'));
      if(MR_PAGE_ON&&buildMrPageHtml()) labels.push(_dpT('mr'));
      if(IT_PAGE_ON) buildItPagesHtml().forEach((_,i)=>labels.push(_dpT('it')+(i?' (2/2)':'')));
      box.innerHTML=pages.map((html,i)=>
        `<div class="pmeta" style="margin-top:24px"><span class="pmeta-lbl">Optional — ${labels[i]||''}</span><span style="font-size:11px;color:var(--xlt)">A4 Landscape · 297 × 210 mm</span></div><div class="slide-wrap">${html}</div>`
      ).join('');
    }catch(e){ console.warn('[detail preview]',e); box.innerHTML=''; }
  }, 500);
}
