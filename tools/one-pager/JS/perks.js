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

const _PERKS_IMGS = {
  fitness:    'https://www.compassoffices.com/wp-content/uploads/2026/01/image-1080x450-87KB-2026-01-12T05-59-01-248Z.jpg',
  food:       'https://www.compassoffices.com/wp-content/uploads/2025/07/image-1080x450-126KB-2025-07-30T06-33-26-434Z.jpg',
  lifestyle:  'https://www.compassoffices.com/wp-content/uploads/2025/07/image-1080x450-80KB-2025-07-22T16-41-30-242Z.jpg',
  storage:    'https://www.compassoffices.com/wp-content/uploads/2026/03/redbox.jpg',
  events:     'https://www.compassoffices.com/wp-content/uploads/2025/08/image-1080x450-144KB-2025-08-12T05-47-39-785Z.jpg',
  logo_white: 'https://res.cloudinary.com/dutvfdhdp/image/upload/v1779196609/_CompassOffices/compass-logo-white.svg',
};

const _PERKS_PAGE_URL   = 'https://www.compassoffices.com/client-perks/';
const _PERKS_EVENTS_URL = 'https://www.compassoffices.com/events/';

// Pixel-perfect split — same values used on BOTH left and right panels
const _PH  = 76;           // header height
const _PB  = 794 - _PH;    // body height = 718px
const _PT  = Math.round(_PB * 0.62); // top section  = 445px
const _PBT = _PB - _PT;    // bottom section = 273px

function buildPerksPageHtml(lang) {
  const t  = PERKS_I18N[lang] || PERKS_I18N['en'];
  const im = _PERKS_IMGS;
  const ff = "font-family:'Hanken Grotesk','Noto Sans TC','Noto Sans JP',sans-serif;";
  const fmtTitle = s => s.replace(/\n/g, '<br>');

  // Image cell with category label overlay
  const imgCell = (src, label) =>
    `<div style="position:relative;overflow:hidden;background:#222;">
       <img src="${src}" style="width:100%;height:100%;object-fit:cover;display:block;" crossorigin="anonymous">
       <div style="position:absolute;bottom:0;left:0;right:0;padding:9px 14px;background:rgba(0,0,0,.52);">
         <span style="${ff}color:#fff;font-size:12px;font-weight:700;letter-spacing:.08em;">${label}</span>
       </div>
     </div>`;

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
    <img src="${im.logo_white}" style="height:28px;object-fit:contain;" crossorigin="anonymous">
    <div style="border:1.5px solid rgba(255,102,0,.7);color:#FF6600;
         font-size:13px;font-weight:700;letter-spacing:.1em;padding:5px 14px;border-radius:2px;">
      ${t.tagline}
    </div>
    <span style="color:rgba(255,255,255,.5);font-size:13px;font-style:italic;">${t.a_great_place}</span>
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
        ${imgCell(im.fitness,   cats[0])}
        ${imgCell(im.food,      cats[1])}
        ${imgCell(im.lifestyle, cats[2])}
        ${imgCell(im.storage,   cats[3])}
      </div>

      <!-- Events banner — ${_PBT}px matches left bottom -->
      <div style="height:${_PBT}px;position:relative;overflow:hidden;background:#222;flex-shrink:0;">
        <img src="${im.events}" style="width:100%;height:100%;object-fit:cover;
             object-position:center 30%;display:block;" crossorigin="anonymous">
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
}
