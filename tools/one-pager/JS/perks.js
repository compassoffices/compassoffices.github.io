// Compass Offices One-Pager Builder
// https://github.com/compassoffices/compassoffices.github.io

// ══════════════════════════════════════════════════════════════════════════
//  PERKS PAGE — fixed marketing page injected before Let's Talk in every PDF
//  Body height = 794 - 76 (header) = 718px
//  Top split  = 718 × 0.62 = 445px  (perks section)
//  Bottom split = 718 × 0.38 = 273px (events section)
//  Both left panel and right panel use identical pixel values → pixel-perfect
// ══════════════════════════════════════════════════════════════════════════

const PERKS_I18N = {
  'en': {
    eyebrow:        'BEYOND THE WORKSPACE',
    title:          'Perks that Boost\nYour Happiness',
    desc:           'Our exclusive perks and partnerships deliver discounts, complimentary access, and curated gifts on gyms, restaurants, hotels, and storage — enhancing your wellbeing inside and outside the office.',
    perks_cta:      'View Our Perks →',
    events_eyebrow: 'NETWORK. SHARE. GROW.',
    events_title:   'Events &\nCommunity',
    events_desc:    'Bringing together diverse professionals for networking, knowledge sharing, and collaboration across all Compass Offices locations.',
    events_cta:     'Explore Our Events →',
    site:           'compassoffices.com/events',
    tagline:        'FLEXIBLE. CONNECTED. HUMAN CENTRIC.',
    a_great_place:  'A Great Place to Work',
  },
  'zh-hant': {
    eyebrow:        '工作空間以外',
    title:          '提升您幸福感\n的專屬特權',
    desc:           '我們獨家的優惠與合作夥伴，為您提供健身房、餐廳、酒店及儲存等各方面的折扣、免費使用及精心策劃的禮品——全面提升您的健康與生產力。',
    perks_cta:      '查看專屬特權 →',
    events_eyebrow: '聯繫。分享。成長。',
    events_title:   '活動與\n社群',
    events_desc:    '匯聚各行各業的專業人士，共同參與交流、知識分享及協作活動。',
    events_cta:     '瀏覽我們的活動 →',
    site:           'compassoffices.com/events',
    tagline:        '靈活。互聯。以人為本。',
    a_great_place:  '優質工作好去處',
  },
  'zh-hans': {
    eyebrow:        '工作空间以外',
    title:          '提升您幸福感\n的专属特权',
    desc:           '我们独家的优惠与合作伙伴，为您提供健身房、餐厅、酒店及储存等各方面的折扣、免费使用及精心策划的礼品——全面提升您的健康与生产力。',
    perks_cta:      '查看专属特权 →',
    events_eyebrow: '联系。分享。成长。',
    events_title:   '活动与\n社群',
    events_desc:    '汇聚各行各业的专业人士，共同参与交流、知识分享及协作活动。',
    events_cta:     '浏览我们的活动 →',
    site:           'compassoffices.com/events',
    tagline:        '灵活。互联。以人为本。',
    a_great_place:  '优质工作好去处',
  },
  'ja': {
    eyebrow:        'ワークスペースを超えて',
    title:          '幸せを高める\n特典',
    desc:           '独自のパークスとパートナーシップにより、ジム、レストラン、ホテル、ストレージなどの割引や無料アクセス、厳選されたギフトをお届けします。',
    perks_cta:      '特典を見る →',
    events_eyebrow: 'つながる。共有する。成長する。',
    events_title:   'イベント&\nコミュニティ',
    events_desc:    '多様な専門家が集まり、ネットワーキング、知識共有、コラボレーションを行います。',
    events_cta:     'イベントを見る →',
    site:           'compassoffices.com/events',
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
  qr:         'https://api.qrserver.com/v1/create-qr-code/?size=64x64&data=https%3A%2F%2Fwww.compassoffices.com%2Fevents%2F&bgcolor=ffffff&color=111111',
};

const _PERKS_PAGE_URL   = 'https://www.compassoffices.com/client-perks/';
const _PERKS_EVENTS_URL = 'https://www.compassoffices.com/events/';

// Body height constants (px) — used on BOTH left and right panels
// so the horizontal divider is pixel-perfect aligned.
const _PERKS_HDR_H  = 76;   // header height
const _PERKS_BODY_H = 794 - _PERKS_HDR_H;          // 718px
const _PERKS_TOP_H  = Math.round(_PERKS_BODY_H * 0.62); // 445px
const _PERKS_BOT_H  = _PERKS_BODY_H - _PERKS_TOP_H;    // 273px

function buildPerksPageHtml(lang) {
  const t  = PERKS_I18N[lang] || PERKS_I18N['en'];
  const im = _PERKS_IMGS;
  const ff = "font-family:'Hanken Grotesk','Noto Sans TC','Noto Sans JP',sans-serif;";
  const fmtTitle = s => s.replace(/\n/g,'<br>');

  const imgCell = (src, label) =>
    `<div style="position:relative;overflow:hidden;background:#222;">
       <img src="${src}" style="width:100%;height:100%;object-fit:cover;display:block;" crossorigin="anonymous">
       <div style="position:absolute;bottom:0;left:0;right:0;padding:9px 14px;background:rgba(0,0,0,.52);">
         <span style="${ff}color:#fff;font-size:12px;font-weight:700;letter-spacing:.09em;">${label}</span>
       </div>
     </div>`;

  const eyebrow = txt =>
    `<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
       <div style="width:26px;height:2.5px;background:#FF6600;flex-shrink:0;"></div>
       <span style="${ff}color:#FF6600;font-size:11px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;">${txt}</span>
     </div>`;

  const ctaBtn = (href, label) =>
    `<a href="${href}" target="_blank"
        style="${ff}background:#FF6600;color:#fff;font-size:11px;font-weight:700;
               letter-spacing:.07em;padding:8px 16px;border-radius:3px;
               display:inline-block;text-decoration:none;">${label}</a>`;

  // Image labels (cats[0..3])
  const cats = t.cats || ['FITNESS','FOOD & BEVERAGE','LIFESTYLE','STORAGE'];

  return `
<div style="width:1122px;height:794px;${ff}display:flex;flex-direction:column;
     overflow:hidden;background:#fff;
     -webkit-print-color-adjust:exact;print-color-adjust:exact;">

  <!-- BLACK HEADER — ${_PERKS_HDR_H}px -->
  <div style="background:#111;height:${_PERKS_HDR_H}px;display:flex;align-items:center;
       padding:0 34px;justify-content:space-between;flex-shrink:0;">
    <img src="${im.logo_white}" style="height:28px;object-fit:contain;" crossorigin="anonymous">
    <div style="border:1.5px solid rgba(255,102,0,.7);color:#FF6600;
         font-size:13px;font-weight:700;letter-spacing:.1em;padding:5px 14px;border-radius:2px;">
      ${t.tagline}
    </div>
    <span style="color:rgba(255,255,255,.5);font-size:13px;font-style:italic;">${t.a_great_place}</span>
  </div>

  <!-- BODY — ${_PERKS_BODY_H}px total -->
  <div style="height:${_PERKS_BODY_H}px;display:flex;">

    <!-- ── LEFT WHITE PANEL (37%) ──────────────────────────────────── -->
    <div style="width:416px;flex-shrink:0;background:#fff;display:flex;flex-direction:column;
         border-right:1.5px solid #e8e0d8;">

      <!-- TOP ${_PERKS_TOP_H}px — Perks -->
      <div style="height:${_PERKS_TOP_H}px;padding:30px 30px 24px 32px;
           display:flex;flex-direction:column;justify-content:center;
           border-bottom:3px solid #e8e0d8;box-sizing:border-box;overflow:hidden;">
        ${eyebrow(t.eyebrow)}
        <div style="font-size:28px;font-weight:800;line-height:1.1;color:#111;margin-bottom:12px;">
          ${fmtTitle(t.title)}
        </div>
        <div style="font-size:12px;color:#999;line-height:1.7;margin-bottom:18px;">${t.desc}</div>
        ${ctaBtn(_PERKS_PAGE_URL, t.perks_cta)}
      </div>

      <!-- BOTTOM ${_PERKS_BOT_H}px — Events -->
      <div style="height:${_PERKS_BOT_H}px;padding:22px 30px 22px 32px;
           display:flex;flex-direction:column;justify-content:center;
           box-sizing:border-box;overflow:hidden;">
        ${eyebrow(t.events_eyebrow)}
        <div style="font-size:26px;font-weight:800;line-height:1.1;color:#111;margin-bottom:10px;">
          ${fmtTitle(t.events_title)}
        </div>
        <div style="font-size:12px;color:#999;line-height:1.65;margin-bottom:14px;">${t.events_desc}</div>
        <div style="display:flex;align-items:center;gap:14px;">
          <div style="background:#fff;border:1px solid #eee;border-radius:4px;padding:4px;flex-shrink:0;">
            <img src="${im.qr}" width="52" height="52" style="display:block;border-radius:2px;" crossorigin="anonymous">
          </div>
          <div>
            ${ctaBtn(_PERKS_EVENTS_URL, t.events_cta)}
            <div style="color:#ccc;font-size:10px;margin-top:6px;">${t.site}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── RIGHT IMAGE PANEL (63%) ─────────────────────────────────── -->
    <div style="flex:1;display:flex;flex-direction:column;gap:2px;background:#ccc;">

      <!-- 2×2 grid — exactly ${_PERKS_TOP_H}px, same as left top -->
      <div style="height:${_PERKS_TOP_H}px;display:grid;
           grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;
           gap:2px;flex-shrink:0;">
        ${imgCell(im.fitness,   cats[0])}
        ${imgCell(im.food,      cats[1])}
        ${imgCell(im.lifestyle, cats[2])}
        ${imgCell(im.storage,   cats[3])}
      </div>

      <!-- Event banner — exactly ${_PERKS_BOT_H}px, same as left bottom -->
      <div style="height:${_PERKS_BOT_H}px;position:relative;overflow:hidden;background:#222;flex-shrink:0;">
        <img src="${im.events}" style="width:100%;height:100%;object-fit:cover;
             object-position:center 30%;display:block;" crossorigin="anonymous">
        <div style="position:absolute;inset:0;background:rgba(0,0,0,.22);"></div>
        <div style="position:absolute;bottom:14px;left:16px;display:flex;align-items:center;gap:10px;">
          <div style="width:22px;height:2.5px;background:#FF6600;"></div>
          <span style="${ff}color:#fff;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;">
            ${t.events_title.replace(/\n/g,' ')}
          </span>
        </div>
      </div>
    </div>

  </div>
</div>`;
}
