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
// Redesigned website-style layouts: VO = three tier cards ("Everything in
// Gold, plus:"), MR = big rate cards + availability grid, IT = section cards
// auto-packed into two columns (usually a single page).
const _DP_T={
  'en':{vo:'Virtual Office Packages',mr:'Meeting Room Pricing',it:'IT & Telecommunications',mo:'/month',int:'Internal Clients',ext:'External Clients',room:'Room',p30:'Per 30 mins',pday:'Per day',avail:'Meeting rooms at this centre',lvl:'Level',from:'Start from',pop:'Popular',plus:'Everything in %s, plus:',only:'Rate specific to this centre'},
  'zh-hant':{vo:'虛擬辦公室方案',mr:'會議室價目',it:'IT 與電訊服務',mo:'/月',int:'內部客戶',ext:'外部客戶',room:'會議室',p30:'每 30 分鐘',pday:'每天',avail:'本中心會議室',lvl:'樓層',from:'低至',pop:'最受歡迎',plus:'包含 %s 全部服務，另加：',only:'本中心專屬價格'},
  'zh-hans':{vo:'虚拟办公室方案',mr:'会议室价目',it:'IT 与电信服务',mo:'/月',int:'内部客户',ext:'外部客户',room:'会议室',p30:'每 30 分钟',pday:'每天',avail:'本中心会议室',lvl:'楼层',from:'低至',pop:'最受欢迎',plus:'包含 %s 全部服务，另加：',only:'本中心专属价格'},
  'ja':{vo:'バーチャルオフィスプラン',mr:'会議室料金',it:'IT＆通信サービス',mo:'/月',int:'ご入居のお客様',ext:'外部のお客様',room:'会議室',p30:'30分あたり',pday:'1日あたり',avail:'当センターの会議室',lvl:'フロア',from:'料金',pop:'人気プラン',plus:'%s の全サービスに加えて：',only:'当センター専用料金'},
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
      <div style="margin-left:auto;font-size:12.5px;color:#888888;font-weight:600;">${nm}${fl?' · '+fl:''}</div>
    </div>
    <div style="flex:1;min-height:0;padding:6px 40px 24px;overflow:hidden;">${inner}</div>
  </div>`;
}
function _dpCur(){ return _VO_CUR[(voCurrentId().match(/^([a-z]{2})-/)||[])[1]]||''; }

// ── VO Packages — website-style tier cards ─────────────────────────────
function buildVoDetailPageHtml(){
  const id=voCurrentId();
  if(!id||!VO_PRICES||!VO_PRICES[id]||!DP.vo_features.length) return '';
  const p=VO_PRICES[id], cur=_dpCur();
  const set=_voMarketOf(id)==='Australia'?'australia':'default';
  let rows=DP.vo_features.filter(r=>(r.set||'default')===set);
  if(!rows.length) rows=DP.vo_features.filter(r=>(r.set||'default')==='default');
  const feats=rows.filter(r=>r.row_type==='feature');
  const notes=rows.filter(r=>r.row_type==='footnote');
  const has=v=>{v=String(v||'').trim();return v!==''&&v!=='—'&&v!=='-';};
  const val=v=>String(v||'').trim();
  const tiers=[
    {k:'gold',n:'Gold',price:p.gold},
    {k:'platinum',n:'Platinum',price:p.platinum,pop:true},
    {k:'diamond',n:'Diamond',price:p.diamond},
  ];
  const check='<span style="flex:0 0 auto;width:17px;height:17px;border-radius:50%;background:#FFF3EB;color:#FF6600;font-size:10.5px;font-weight:900;line-height:17px;text-align:center;margin-top:1px;">✓</span>';
  const dense=feats.length>14;
  const ifs=dense?10.5:12, igap=dense?7:11;
  const cards=tiers.map((t,ti)=>{
    const prev=ti>0?tiers[ti-1]:null;
    const fl=feats.filter(r=>has(r[t.k])&&(!prev||val(r[t.k])!==val(r[prev.k])));
    const items=fl.map(r=>{
      const v=val(r[t.k]);
      const extra=(v&&v!=='•')?` <b style="color:#FF6600;white-space:nowrap;">${v}</b>`:'';
      return `<div style="display:flex;margin-bottom:${igap}px;font-size:${ifs}px;line-height:1.5;color:#333333;">${check}<span style="flex:1;margin-left:9px;">${_dpL(r,'label')}${extra}</span></div>`;
    }).join('');
    return `<div style="flex:1;min-width:0;display:flex;flex-direction:column;background:${t.pop?'#FFF9F5':'#FFFFFF'};border:${t.pop?'2px solid #FF6600':'1px solid #E5E5E5'};border-radius:16px;padding:26px 28px 20px;position:relative;">
      ${t.pop?`<div style="position:absolute;top:20px;right:20px;border:1.5px solid #FF6600;color:#FF6600;font-size:10px;font-weight:800;letter-spacing:.06em;border-radius:999px;padding:3px 12px;text-transform:uppercase;">${_dpT('pop')}</div>`:''}
      <div style="font-size:20px;font-weight:800;color:#1A1A1A;">${t.n}</div>
      <div style="font-size:10.5px;font-weight:700;color:#888888;margin:10px 0 1px;">${_dpT('from')}</div>
      <div style="font-size:31px;font-weight:800;color:#1A1A1A;letter-spacing:-.01em;">${cur}${t.price||''}<span style="font-size:12px;font-weight:700;color:#888888;">${_dpT('mo')}</span></div>
      <div style="height:1px;background:${t.pop?'rgba(255,102,0,.25)':'#E5E5E5'};margin:15px 0;"></div>
      ${prev?`<div style="font-size:12px;font-weight:800;color:#1A1A1A;margin-bottom:11px;">${_dpT('plus').replace('%s',prev.n)}</div>`:''}
      <div style="flex:1;overflow:hidden;">${items}</div>
    </div>`;
  }).join('<div style="flex:0 0 22px;"></div>');
  let notesHtml='';
  if(notes.length){
    const txts=notes.map(n=>_dpL(n,'label')).filter(Boolean);
    const mid=Math.ceil(txts.length/2);
    const col=a=>`<div style="flex:1;min-width:0;">${a.map(x=>`<div style="margin-bottom:2px;">${x}</div>`).join('')}</div>`;
    notesHtml=`<div style="display:flex;flex-shrink:0;margin-top:16px;font-size:9px;color:#888888;line-height:1.55;">${col(txts.slice(0,mid))}<div style="flex:0 0 30px;"></div>${col(txts.slice(mid))}</div>`;
  }
  // Cards hug their content (equal height = tallest card, i.e. Gold), with
  // footnotes right below — no stretching to the bottom of the page.
  const inner=`<div style="display:flex;flex-direction:column;justify-content:center;height:100%;">
    <div style="display:flex;align-items:stretch;flex:0 0 auto;">${cards}</div>
    ${notesHtml}
  </div>`;
  return _dpPage(_dpT('vo'),inner);
}

// ── Meeting Rooms — rate cards + availability grid ─────────────────────
function buildMrPageHtml(){
  const id=voCurrentId(), mkt=_voMarketOf(id);
  if(!mkt||!DP.mr_prices.length) return '';
  const mine=DP.mr_prices.filter(r=>r.market===mkt&&(r.scope==='all'||r.scope===id));
  if(!mine.length) return '';
  const cur=_dpCur();
  let hasOwn=false;
  const fmt=v=>{v=String(v||'').trim();return v?(/^[\d,.]+$/.test(v)?cur+v:v):'—';};
  const card=client=>{
    const rows=mine.filter(r=>r.client===client);
    if(!rows.length) return '';
    return `<div style="flex:1;min-width:0;background:#FFFFFF;border:1px solid #E5E5E5;border-radius:14px;padding:20px 24px 8px;">
      <div style="display:flex;align-items:center;margin-bottom:2px;">
        <div style="width:22px;height:3px;background:#FF6600;margin-right:10px;"></div>
        <div style="font-size:15px;font-weight:800;color:#1A1A1A;">${client==='Internal'?_dpT('int'):_dpT('ext')}</div>
      </div>
      <div style="display:flex;padding:12px 0 7px;border-bottom:2px solid #1A1A1A;font-size:9px;font-weight:800;letter-spacing:.07em;color:#888888;text-transform:uppercase;">
        <div style="flex:1;">${_dpT('room')}</div>
        <div style="flex:0 0 118px;text-align:right;">${_dpT('p30')}</div>
        <div style="flex:0 0 128px;text-align:right;">${_dpT('pday')}</div>
      </div>`+
      rows.map(r=>{
        const own=r.scope!=='all'; if(own)hasOwn=true;
        return `<div style="display:flex;align-items:baseline;padding:13px 0;border-bottom:1px solid #F0F0F0;">
        <div style="flex:1;font-size:13px;font-weight:700;color:#333333;">${r.tier_en||''}${own?' <span style="font-size:8px;color:#FF6600;vertical-align:2px;">●</span>':''}</div>
        <div style="flex:0 0 118px;text-align:right;font-size:15px;font-weight:800;color:#FF6600;">${fmt(r.per_30_mins)}</div>
        <div style="flex:0 0 128px;text-align:right;font-size:15px;font-weight:800;color:#FF6600;">${fmt(r.per_day)}</div>
      </div>`;}).join('')+
    `</div>`;
  };
  const top=`<div style="display:flex;align-items:stretch;">${card('Internal')}<div style="flex:0 0 20px;"></div>${card('External')}</div>`;
  let mxHtml='';
  const mx=DP.mr_matrix.filter(r=>r.centre_id===id);
  if(mx.length){
    const tierRow=(DP.mr_tiers||[]).find(r=>r.market===mkt&&r.kind==='matrix');
    const nCols=Math.max(...mx.map(r=>{let n=0;for(let i=1;i<=6;i++)if((r['t'+i]||'')!=='')n=i;return n;}),
                         tierRow?[1,2,3,4,5,6].filter(i=>tierRow['t'+i]).length:0);
    const lbl=i=>tierRow?(_dpL(tierRow,'t'+i)||tierRow['t'+i]||('Room '+i)):('Room '+i);
    const cell=on=>on
      ?'<span style="display:inline-block;width:17px;height:17px;border-radius:50%;background:#EAF5EB;color:#57A05A;font-weight:900;font-size:10px;line-height:17px;text-align:center;">✓</span>'
      :'<span style="color:#BBBBBB;font-weight:700;">–</span>';
    mxHtml=`<div style="margin-top:18px;background:#FFFFFF;border:1px solid #E5E5E5;border-radius:14px;padding:18px 24px 10px;">
      <div style="display:flex;align-items:center;margin-bottom:2px;">
        <div style="width:22px;height:3px;background:#FF6600;margin-right:10px;"></div>
        <div style="font-size:13.5px;font-weight:800;color:#1A1A1A;">${_dpT('avail')}</div>
      </div>
      <div style="display:flex;padding:10px 0 6px;border-bottom:2px solid #1A1A1A;font-size:9px;font-weight:800;letter-spacing:.07em;color:#888888;text-transform:uppercase;">
        <div style="flex:0 0 90px;">${_dpT('lvl')}</div>`+
      Array.from({length:nCols},(_,i)=>`<div style="flex:1;text-align:center;">${lbl(i+1)}</div>`).join('')+`</div>`+
      mx.map(r=>`<div style="display:flex;align-items:center;padding:8px 0;border-bottom:1px solid #F0F0F0;">
        <div style="flex:0 0 90px;font-size:12px;font-weight:800;color:#333333;">${r.level||''}</div>`+
        Array.from({length:nCols},(_,i)=>`<div style="flex:1;text-align:center;">${cell((r['t'+(i+1)]||'')!=='')}</div>`).join('')+`</div>`).join('')+
    `</div>`;
  }
  const legend=hasOwn?`<div style="margin-top:10px;font-size:8.5px;color:#888888;"><span style="color:#FF6600;">●</span> ${_dpT('only')}</div>`:'';
  return _dpPage(_dpT('mr'),top+mxHtml+legend);
}

// ── IT & Telecom — section cards auto-packed into two columns ──────────
function _itSectionBlock(all,sk){
  const rows=all.filter(r=>r.section===sk).sort((a,b)=>(+a.sort||0)-(+b.sort||0));
  if(!rows.length) return '';
  const tiers=rows.filter(r=>r.row_type==='tier'), nT=tiers.length||1;
  const sec=rows.find(r=>r.row_type==='section');
  const cw=nT>1?80:100;
  let h=`<div style="border:1px solid #E5E5E5;border-radius:11px;overflow:hidden;margin-bottom:12px;background:#FFFFFF;">`;
  if(sec&&_dpL(sec,'label')) h+=`<div style="display:flex;align-items:center;background:#F5F5F5;border-bottom:1px solid #E5E5E5;padding:7px 12px;">
    <div style="width:16px;height:3px;background:#FF6600;margin-right:9px;flex:0 0 auto;"></div>
    <div style="font-size:11.5px;font-weight:800;color:#1A1A1A;">${_dpL(sec,'label')}</div></div>`;
  if(nT>1) h+=`<div style="display:flex;border-bottom:1px solid #E5E5E5;background:#FAFAFA;padding:0 12px;"><div style="flex:1;"></div>`+
    tiers.map(t=>`<div style="flex:0 0 ${cw}px;text-align:center;padding:5px 3px;border-left:1px solid #EFEFEF;">
      <div style="font-size:8.5px;font-weight:800;letter-spacing:.05em;color:#FF6600;">${String(t.note||'').toUpperCase()}</div>
      <div style="font-size:7px;font-weight:600;color:#888888;line-height:1.25;">${_dpL(t,'label')}</div></div>`).join('')+`</div>`;
  const body=rows.filter(r=>['group','bullet','option'].includes(r.row_type));
  let i=0, first=true;
  while(i<body.length){
    if(body[i].row_type!=='group'){i++;continue;}
    const g=body[i]; i++;
    const kids=[];
    while(i<body.length&&body[i].row_type!=='group'){kids.push(body[i]);i++;}
    if(!_dpL(g,'label')) continue;
    const bl=kids.filter(k=>k.row_type==='bullet'&&_dpL(k,'label'));
    const op=kids.filter(k=>k.row_type==='option'&&_dpL(k,'label'));
    const perB=bl.some(b=>b.price_a!=='');
    h+=`<div style="display:flex;${first?'':'border-top:1px solid #F0F0F0;'}padding:0 12px;">
      <div style="flex:0 0 104px;font-size:9px;font-weight:800;color:#1A1A1A;padding:5px 6px 5px 0;line-height:1.3;">${_dpL(g,'label')}</div>
      <div style="flex:1;min-width:0;padding:3px 0;">`+
      bl.map(b=>`<div style="font-size:8px;line-height:1.4;padding:1.4px 4px 1.4px 0;display:flex;color:#555555;"><span style="margin-right:4px;">•</span><span style="flex:1;">${_dpL(b,'label')}</span>${perB&&b.price_a?`<span style="color:#FF6600;font-weight:700;white-space:nowrap;">${b.price_a}</span>`:''}</div>`).join('')+`</div>`;
    if(!perB||g.price_a!==''){
      const vals=nT>1?[g.price_a,g.price_b,g.price_c].slice(0,nT):[g.price_a];
      h+=vals.map(v=>`<div style="flex:0 0 ${cw}px;display:flex;align-items:center;justify-content:center;font-size:8.8px;font-weight:800;color:#FF6600;text-align:center;border-left:1px solid #EFEFEF;padding:2px 3px;line-height:1.25;">${v||''}</div>`).join('');
    }
    h+=`</div>`;
    op.forEach(o=>{h+=`<div style="display:flex;background:#FAFAFA;border-top:1px solid #F0F0F0;padding:0 12px;">
      <div style="flex:1;font-size:8px;color:#555555;padding:3px 4px 3px 110px;">${_dpL(o,'label')}</div>
      <div style="flex:0 0 ${nT>1?nT*cw:cw}px;display:flex;align-items:center;justify-content:center;font-size:8.5px;font-weight:800;color:#FF6600;">${o.price_a||''}</div></div>`;});
    first=false;
  }
  h+=`</div>`;
  return h;
}
function buildItPagesHtml(){
  const mkt=_voMarketOf(voCurrentId());
  if(!mkt||!DP.it_packages.length) return [];
  const all=DP.it_packages.filter(r=>r.market===mkt);
  if(!all.length) return [];
  const ORDER=['wifi_banner','enterprise','standard','rack','telecom','bundle'];
  const blocks=ORDER.map(k=>_itSectionBlock(all,k)).filter(s=>s&&s.trim());
  if(!blocks.length) return [];
  // Measure each card at column width, then pack into 2 columns per page —
  // in most markets everything fits on ONE page instead of the old two.
  const COLW=506, COLH=692;
  let hs;
  try{
    const m=document.createElement('div');
    m.style.cssText='position:absolute;left:-99999px;top:0;width:'+COLW+'px;visibility:hidden;'+_DPF;
    document.body.appendChild(m);
    hs=blocks.map(b=>{m.innerHTML=b;const el=m.firstElementChild;return (el?el.getBoundingClientRect().height:COLH/2)+12;});
    m.remove();
  }catch(e){ hs=blocks.map(()=>COLH/2); }
  const pages=[]; let cols=[[],[]], ci=0, used=0;
  const flush=()=>{ if(cols[0].length||cols[1].length){pages.push(cols);cols=[[],[]];ci=0;used=0;} };
  blocks.forEach((b,i)=>{
    const h=Math.min(hs[i],COLH);
    if(used+h>COLH&&(cols[ci].length)){ if(ci===0){ci=1;used=0;} else flush(); }
    cols[ci].push(b); used+=h;
  });
  flush();
  const tot=pages.length;
  return pages.map((cs,pi)=>{
    const inner=`<div style="display:flex;height:100%;">
      <div style="flex:1;min-width:0;">${cs[0].join('')}</div>
      <div style="flex:0 0 26px;"></div>
      <div style="flex:1;min-width:0;">${cs[1].join('')}</div>
    </div>`;
    const suffix=tot>1?` <span style="font-size:14px;color:#888888;font-weight:700;">${pi+1}/${tot}</span>`:'';
    return _dpPage(_dpT('it')+suffix,inner);
  });
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
      const pages=_detailPagesInner();
      if(!pages.length){ box.innerHTML=''; return; }
      const labels=[];
      if(VO_DETAIL_ON&&buildVoDetailPageHtml()) labels.push(_dpT('vo'));
      if(MR_PAGE_ON&&buildMrPageHtml()) labels.push(_dpT('mr'));
      if(IT_PAGE_ON){const arr=buildItPagesHtml();arr.forEach((_,i)=>labels.push(_dpT('it')+(arr.length>1?` (${i+1}/${arr.length})`:'')));}
      box.innerHTML=pages.map((html,i)=>
        `<div class="pmeta" style="margin-top:24px"><span class="pmeta-lbl">Optional — ${labels[i]||''}</span><span style="font-size:11px;color:var(--xlt)">A4 Landscape · 297 × 210 mm</span></div>`+
        `<div class="slide-wrap"><div class="dp-slide"><div class="dp-fix">${html}</div></div></div>`
      ).join('');
      renderDetailPreviews._scale=()=>{
        box.querySelectorAll('.dp-slide').forEach(w=>{
          const f=w.firstElementChild; if(!f) return;
          const s=w.clientWidth/1122;
          if(s>0) f.style.transform='scale('+s+')';
        });
      };
      renderDetailPreviews._scale();
      setTimeout(renderDetailPreviews._scale,300);   // after fonts/layout settle
      if(!renderDetailPreviews._rs){
        window.addEventListener('resize',()=>{ if(renderDetailPreviews._scale) renderDetailPreviews._scale(); });
        renderDetailPreviews._rs=true;
      }
    }catch(e){ console.warn('[detail preview]',e); }
  }, 400);
}


// ══════════════ COVER PAGE — builder + live preview ══════════════
function buildCoverPageHtml(){
  if(typeof COVER_ON==='undefined'||!COVER_ON) return '';
  const url=coverUrl();
  if(!url) return '';
  const comp=(document.getElementById('company-name')?.value||'').trim();
  const cli=(document.getElementById('client-name')?.value||'').trim();
  const d=new Date();
  const dateStr=d.toLocaleDateString(LANG==='ja'?'ja-JP':(LANG&&LANG.startsWith('zh')?'zh-HK':'en-GB'),{year:'numeric',month:'long',day:'numeric'});
  const who=[comp,cli].filter(Boolean).join(' · ');
  let centre=(document.getElementById('n-main')?.value||'').trim();
  let fl=(typeof combineFloorLabel==='function')?combineFloorLabel(document.getElementById('floor')?.value.trim()||''):'';
  let city=(document.getElementById('city')?.value||'').trim();
  // Queue-aware: with multiple queued locations the cover represents the WHOLE
  // proposal — list the queued centres instead of just the currently loaded one.
  if(typeof PDF_QUEUE!=='undefined' && PDF_QUEUE.length>1){
    const names=PDF_QUEUE.map(it=>(it.name||it.state?.['n-main']||'').trim()).filter(Boolean);
    const cities=[...new Set(PDF_QUEUE.map(it=>(it.state?.city||'').trim()).filter(Boolean))];
    if(names.length){
      centre=names.slice(0,3).join(' · ')+(names.length>3?` · +${names.length-3} more`:'');
      fl='';
      city=cities.length===1?cities[0]:(cities.length>1?cities.join(' / '):city);
    }
  }
  const by=[(document.getElementById('pf-firstname')?.value||'').trim(),(document.getElementById('pf-lastname')?.value||'').trim()].filter(Boolean).join(' ');
  return `<div style="${_DPF}width:1122px;height:794px;position:relative;overflow:hidden;background:#fff;">
    <img src="${url}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;"
         onerror="if(!this._f1){this._f1=1;this.src='${url.replace(/\d+\.jpg$/,'.jpg')}';}else if(!this._f2){this._f2=1;this.src='${COVER_CDN}default.jpg';}">
    
    <div style="position:absolute;left:64px;top:40px;"><svg style="height:52px;width:auto;display:block;" class="vopl-bar-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 400"><path fill="#FF6600" d="M321.05,200c0,63.81-51.72,115.52-115.52,115.52s-115.53-51.71-115.53-115.52,51.72-115.53,115.53-115.53,115.52,51.72,115.52,115.53Z"/><polygon fill="#fff" points="207.5 195.58 232.27 240.03 263.79 240.03 207.5 139.14 149.17 240.03 181.8 240.03 207.5 195.58"/><path fill="#282828" d="M428.25,179.59c8.25,0,15.73-1.65,22.23-4.9l.64-.32v-13.24l-1.69.86c-6.05,3.08-12.74,4.65-19.88,4.65-8.32,0-15.27-2.49-20.65-7.4-5.35-4.88-8.06-11.06-8.06-18.36.06-7.31,2.78-13.39,8.1-18.1,5.35-4.74,12.32-7.14,20.71-7.14,7.16,0,13.85,1.27,19.87,3.78l1.61.67v-13.43l-.73-.29c-6.05-2.45-13.5-3.69-22.14-3.69-12.23,0-22.42,3.54-30.27,10.52-7.89,7.01-11.89,16.32-11.89,27.66s4.01,20.81,11.93,27.97c7.88,7.13,18.05,10.75,30.23,10.75Z"/><path fill="#282828" d="M507.71,102.69c-11.88,0-21.73,3.59-29.27,10.67-7.57,7.1-11.41,16.23-11.41,27.15s3.83,20.69,11.39,28.03c7.55,7.33,17.4,11.04,29.29,11.04s21.74-3.71,29.29-11.04c7.56-7.34,11.39-16.77,11.39-28.03s-3.84-20.04-11.4-27.15c-7.55-7.08-17.4-10.67-29.28-10.67ZM533.73,140.6c0,7.45-2.43,13.72-7.23,18.64-4.79,4.91-11.08,7.4-18.69,7.4s-13.91-2.49-18.69-7.4h0c-4.8-4.91-7.23-11.19-7.23-18.64s2.44-13.08,7.26-17.81c4.82-4.74,11.1-7.14,18.67-7.14s13.84,2.4,18.66,7.14c4.82,4.74,7.26,10.73,7.26,17.81Z"/><path fill="#282828" d="M614.61,160.27l-25.49-56.32h-20.19v74.37h14.11v-55.11c.48,1.08,1.04,2.35,1.67,3.81l23.32,51.3h13.01l22.82-51.25c.19-.37.69-1.46,1.51-3.3.1-.21.19-.42.28-.63v55.17h14.29v-74.37h-20.38l-24.95,56.32Z"/><path fill="#282828" d="M721.39,103.95h-34.56v74.37h14.66v-20.09h19.9c8.98,0,16.21-2.5,21.48-7.43,5.29-4.95,7.97-11.6,7.97-19.76s-2.68-14.8-7.98-19.72c-5.27-4.9-12.5-7.38-21.48-7.38ZM736.83,131.05c0,4.51-1.48,8.05-4.54,10.85-3.04,2.79-7.18,4.2-12.3,4.2h-18.5v-30.01h18.5c5.24,0,9.41,1.38,12.39,4.11,2.99,2.74,4.45,6.29,4.45,10.85Z"/><path fill="#282828" d="M788.45,103.95l-33.52,74.37h15.64l6.22-14.41h40.68l6.22,14.41h16.38l-33.51-74.37h-18.11ZM812.02,151.15h-29.77l14.84-34.62,14.93,34.62Z"/><path fill="#282828" d="M888.04,134.14l-6.59-1.26c-6.24-1.17-10.47-2.51-12.58-4-1.95-1.37-2.89-3.05-2.89-5.13,0-2.67,1.7-4.62,5.19-5.94,3.81-1.44,8.45-2.18,13.78-2.18,7.73,0,15.18,1.37,22.12,4.07l1.58.61v-13.34l-.79-.27c-7.82-2.67-15.53-4.03-22.92-4.03-9.56,0-17.57,1.81-23.82,5.38-6.45,3.69-9.72,9.27-9.72,16.59,0,5.16,1.95,9.75,5.81,13.65,3.81,3.85,10.11,6.55,18.71,8.03l7.14,1.26c5.55.99,9.48,2.3,11.67,3.89,2.05,1.49,3.05,3.35,3.05,5.68,0,2.85-1.64,5.06-5.02,6.75-3.6,1.8-8.32,2.71-14.04,2.71-9.54,0-18.24-2.1-25.88-6.25l-1.72-.93v13.85l.65.32c8.16,3.96,17.5,5.97,27.78,5.97,9.34,0,17.21-2.06,23.37-6.13,6.32-4.17,9.52-10.14,9.52-17.72,0-5.47-1.96-10.09-5.84-13.73-3.8-3.56-10.04-6.2-18.57-7.86Z"/><path fill="#282828" d="M984.16,142c-3.79-3.56-10.04-6.2-18.57-7.86l-6.59-1.26c-6.24-1.17-10.47-2.51-12.58-4-1.95-1.37-2.89-3.05-2.89-5.13,0-2.67,1.7-4.62,5.19-5.94,3.81-1.44,8.45-2.18,13.78-2.18,7.73,0,15.18,1.37,22.12,4.07l1.58.61v-13.34l-.79-.27c-7.82-2.67-15.53-4.03-22.92-4.03-9.56,0-17.57,1.81-23.82,5.38-6.45,3.69-9.72,9.27-9.72,16.59,0,5.16,1.95,9.75,5.81,13.65,3.81,3.85,10.11,6.55,18.71,8.03l7.14,1.26c5.55.99,9.48,2.3,11.67,3.89,2.05,1.49,3.05,3.35,3.05,5.68,0,2.85-1.64,5.06-5.02,6.75-3.6,1.8-8.32,2.71-14.04,2.71-9.54,0-18.24-2.1-25.88-6.25l-1.72-.93v13.85l.65.32c8.16,3.96,17.5,5.97,27.78,5.97,9.34,0,17.21-2.06,23.37-6.13,6.32-4.18,9.52-10.14,9.52-17.72,0-5.47-1.96-10.09-5.84-13.73Z"/><path fill="#282828" d="M426.86,220.41c-11.88,0-21.73,3.59-29.28,10.67-7.57,7.1-11.4,16.23-11.4,27.15s3.83,20.7,11.39,28.03c7.55,7.33,17.4,11.04,29.29,11.04s21.74-3.72,29.29-11.04c7.56-7.34,11.39-16.77,11.39-28.03s-3.84-20.04-11.41-27.15c-7.55-7.08-17.4-10.67-29.27-10.67ZM452.88,258.32c0,7.45-2.43,13.72-7.23,18.64-4.79,4.91-11.08,7.4-18.69,7.4s-13.91-2.49-18.69-7.39h0c-4.8-4.92-7.23-11.19-7.23-18.64s2.44-13.08,7.26-17.81c4.82-4.74,11.1-7.14,18.67-7.14s13.84,2.4,18.66,7.14c4.82,4.74,7.26,10.73,7.26,17.81Z"/><polygon fill="#282828" points="488.08 296.05 502.74 296.05 502.74 270.83 541.61 270.83 541.61 258.33 502.74 258.33 502.74 234.53 545.32 234.53 545.32 221.68 488.08 221.68 488.08 296.05"/><polygon fill="#282828" points="565.82 296.05 580.48 296.05 580.48 270.83 619.35 270.83 619.35 258.33 580.48 258.33 580.48 234.53 623.06 234.53 623.06 221.68 565.82 221.68 565.82 296.05"/><rect fill="#282828" x="644.62" y="221.68" width="14.66" height="74.37"/><path fill="#282828" d="M720.83,220.41c-12.23,0-22.42,3.54-30.27,10.52-7.89,7.01-11.89,16.32-11.89,27.66s4.01,20.81,11.93,27.97c7.88,7.13,18.06,10.75,30.23,10.75,8.25,0,15.73-1.65,22.23-4.9l.64-.32v-13.24l-1.69.86c-6.05,3.08-12.74,4.65-19.88,4.65-8.32,0-15.27-2.49-20.65-7.4-5.35-4.88-8.06-11.06-8.06-18.36.06-7.31,2.78-13.39,8.1-18.1,5.35-4.74,12.32-7.14,20.71-7.14,7.17,0,13.85,1.27,19.87,3.78l1.61.67v-13.43l-.73-.29c-6.05-2.45-13.5-3.69-22.14-3.69Z"/><polygon fill="#282828" points="782.9 264.53 825.1 264.53 825.1 252.48 782.9 252.48 782.9 234.08 826.96 234.08 826.96 221.68 768.24 221.68 768.24 296.05 827.89 296.05 827.89 283.64 782.9 283.64 782.9 264.53"/><path fill="#282828" d="M888.03,251.87l-6.59-1.26c-6.24-1.17-10.47-2.51-12.58-4-1.95-1.37-2.89-3.05-2.89-5.13,0-2.67,1.7-4.62,5.19-5.94,3.81-1.44,8.44-2.18,13.78-2.18,7.73,0,15.18,1.37,22.12,4.06l1.58.61v-13.34l-.79-.27c-7.82-2.67-15.53-4.03-22.92-4.03-9.56,0-17.57,1.81-23.82,5.38-6.45,3.69-9.72,9.27-9.72,16.59,0,5.16,1.95,9.75,5.81,13.65,3.81,3.85,10.11,6.56,18.71,8.03l7.14,1.26c5.55.99,9.48,2.3,11.67,3.89,2.05,1.49,3.04,3.35,3.04,5.68,0,2.85-1.64,5.06-5.02,6.75-3.6,1.8-8.32,2.71-14.04,2.71-9.53,0-18.24-2.1-25.88-6.25l-1.72-.93v13.85l.65.32c8.16,3.96,17.5,5.97,27.78,5.97,9.34,0,17.2-2.06,23.37-6.13,6.32-4.18,9.52-10.14,9.52-17.72,0-5.47-1.97-10.09-5.84-13.73-3.8-3.56-10.04-6.2-18.57-7.86Z"/></svg></div>
    <div style="position:absolute;left:64px;top:50%;transform:translateY(-46%);color:#1A1A1A;max-width:560px;">
      <div style="width:46px;height:4px;background:#FF6600;margin-bottom:18px;"></div>
      ${who?`<div style="font-size:12px;font-weight:800;letter-spacing:.26em;color:#8A8A8A;">PREPARED FOR</div>
      <div style="font-size:34px;font-weight:800;margin:8px 0 14px;line-height:1.18;">${who}</div>`:''}
      ${centre?`<div style="font-size:15px;font-weight:700;color:#3A3A3A;">${centre}${fl?' · '+fl:''}${city?' · '+city:''}</div>`:''}
      <div style="font-size:11px;color:#999;margin-top:12px;font-weight:600;">${by?`Prepared by ${by} · `:''}${dateStr}</div>
    </div>
  </div>`;
}
function renderCoverPreview(){
  clearTimeout(renderCoverPreview._t);
  renderCoverPreview._t=setTimeout(()=>{
    const box=document.getElementById('cover-preview');
    if(!box) return;
    try{
      const html=buildCoverPageHtml();
      if(!html){ box.innerHTML=''; return; }
      box.innerHTML=
        `<div class="pmeta" style="margin-bottom:0"><span class="pmeta-lbl">Cover</span><span style="font-size:11px;color:var(--xlt)">A4 Landscape · 297 × 210 mm</span></div>`+
        `<div class="slide-wrap" style="margin-bottom:24px"><div class="dp-slide"><div class="dp-fix">${html}</div></div></div>`;
      const w=box.querySelector('.dp-slide');
      const fit=()=>{const f=w&&w.firstElementChild;if(f&&w.clientWidth>0)f.style.transform='scale('+(w.clientWidth/1122)+')';};
      fit(); setTimeout(fit,300);
    }catch(e){ console.warn('[cover preview]',e); }
  },400);
}
