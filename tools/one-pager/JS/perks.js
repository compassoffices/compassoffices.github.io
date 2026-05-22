// Compass Offices One-Pager Builder
// https://github.com/compassoffices/compassoffices.github.io

// ══════════════════════════════════════════════════════════════════════════
//  PERKS PAGE — fixed marketing page injected before Let's Talk in every PDF
//  Two-column: black header + white left panel (62/38 split) + image right
// ══════════════════════════════════════════════════════════════════════════

const PERKS_I18N = {
  'en': {
    eyebrow:        'BEYOND THE WORKSPACE',
    title:          'Perks that Boost\nYour Happiness',
    desc:           'Our exclusive perks and partnerships deliver discounts, complimentary access, and curated gifts on gyms, restaurants, hotels, and storage — enhancing your wellbeing inside and outside the office.',
    cats:           ['FITNESS', 'FOOD & BEVERAGE', 'LIFESTYLE', 'STORAGE'],
    events_eyebrow: 'NETWORK. SHARE. GROW.',
    events_title:   'Events &\nCommunity',
    events_desc:    'Bringing together diverse professionals for networking, knowledge sharing, and collaboration across all Compass Offices locations.',
    cta:            'Explore Our Events →',
    site:           'compassoffices.com/events',
    tagline:        'FLEXIBLE. CONNECTED. HUMAN CENTRIC.',
    a_great_place:  'A Great Place to Work',
  },
  'zh-hant': {
    eyebrow:        '工作空間以外',
    title:          '提升您幸福感\n的專屬特權',
    desc:           '我們獨家的優惠與合作夥伴，為您提供健身房、餐廳、酒店及儲存等各方面的折扣、免費使用及精心策劃的禮品——全面提升您的健康與生產力。',
    cats:           ['健身', '餐飲', '生活方式', '儲存服務'],
    events_eyebrow: '聯繫。分享。成長。',
    events_title:   '活動與\n社群',
    events_desc:    '匯聚各行各業的專業人士，共同參與交流、知識分享及協作活動。',
    cta:            '瀏覽我們的活動 →',
    site:           'compassoffices.com/events',
    tagline:        '靈活。互聯。以人為本。',
    a_great_place:  '優質工作好去處',
  },
  'zh-hans': {
    eyebrow:        '工作空间以外',
    title:          '提升您幸福感\n的专属特权',
    desc:           '我们独家的优惠与合作伙伴，为您提供健身房、餐厅、酒店及储存等各方面的折扣、免费使用及精心策划的礼品——全面提升您的健康与生产力。',
    cats:           ['健身', '餐饮', '生活方式', '储存服务'],
    events_eyebrow: '联系。分享。成长。',
    events_title:   '活动与\n社群',
    events_desc:    '汇聚各行各业的专业人士，共同参与交流、知识分享及协作活动。',
    cta:            '浏览我们的活动 →',
    site:           'compassoffices.com/events',
    tagline:        '灵活。互联。以人为本。',
    a_great_place:  '优质工作好去处',
  },
  'ja': {
    eyebrow:        'ワークスペースを超えて',
    title:          '幸せを高める\n特典',
    desc:           '独自のパークスとパートナーシップにより、ジム、レストラン、ホテル、ストレージなどの割引や無料アクセス、厳選されたギフトをお届けします。',
    cats:           ['フィットネス', 'フード&ビバレッジ', 'ライフスタイル', 'ストレージ'],
    events_eyebrow: 'つながる。共有する。成長する。',
    events_title:   'イベント&\nコミュニティ',
    events_desc:    '多様な専門家が集まり、ネットワーキング、知識共有、コラボレーションを行います。',
    cta:            'イベントを見る →',
    site:           'compassoffices.com/events',
    tagline:        'フレキシブル。コネクテッド。人中心。',
    a_great_place:  'A Great Place to Work',
  },
};

const _PERKS_IMGS = {
  fitness:   'https://www.compassoffices.com/wp-content/uploads/2026/01/image-1080x450-87KB-2026-01-12T05-59-01-248Z.jpg',
  food:      'https://www.compassoffices.com/wp-content/uploads/2025/07/image-1080x450-126KB-2025-07-30T06-33-26-434Z.jpg',
  lifestyle: 'https://www.compassoffices.com/wp-content/uploads/2025/07/image-1080x450-80KB-2025-07-22T16-41-30-242Z.jpg',
  storage:   'https://www.compassoffices.com/wp-content/uploads/2026/03/redbox.jpg',
  events:    'https://www.compassoffices.com/wp-content/uploads/2025/08/image-1080x450-144KB-2025-08-12T05-47-39-785Z.jpg',
  logo_white:'https://res.cloudinary.com/dutvfdhdp/image/upload/v1779196609/_CompassOffices/compass-logo-white.svg',
  qr:        'https://api.qrserver.com/v1/create-qr-code/?size=64x64&data=https%3A%2F%2Fwww.compassoffices.com%2Fevents%2F&bgcolor=ffffff&color=111111',
};

const _PERKS_EVENTS_URL = 'https://www.compassoffices.com/events/';

function buildPerksPageHtml(lang) {
  const t = PERKS_I18N[lang] || PERKS_I18N['en'];
  const i = _PERKS_IMGS;
  const fmtTitle = str => str.replace(/\n/g, '<br>');

  const imgCell = (src, label) => `
    <div style="position:relative;overflow:hidden;background:#222;">
      <img src="${src}" style="width:100%;height:100%;object-fit:cover;display:block;" crossorigin="anonymous">
      <div style="position:absolute;bottom:0;left:0;right:0;padding:9px 14px;background:rgba(0,0,0,.52);">
        <span style="color:#fff;font-size:12px;font-weight:700;letter-spacing:.09em;font-family:'Hanken Grotesk','Noto Sans TC','Noto Sans JP',sans-serif;">${label}</span>
      </div>
    </div>`;

  const eyebrow = txt => `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
      <div style="width:26px;height:2.5px;background:#FF6600;flex-shrink:0;"></div>
      <span style="color:#FF6600;font-size:11px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;font-family:'Hanken Grotesk','Noto Sans TC','Noto Sans JP',sans-serif;">${txt}</span>
    </div>`;

  return `
<div style="width:1122px;height:794px;display:flex;flex-direction:column;font-family:'Hanken Grotesk','Noto Sans TC','Noto Sans JP',sans-serif;overflow:hidden;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact;">

  <!-- BLACK HEADER -->
  <div style="background:#111;height:76px;display:flex;align-items:center;padding:0 34px;justify-content:space-between;flex-shrink:0;">
    <img src="${i.logo_white}" style="height:28px;object-fit:contain;" crossorigin="anonymous">
    <div style="border:1.5px solid rgba(255,102,0,.7);color:#FF6600;font-size:13px;font-weight:700;letter-spacing:.1em;padding:5px 14px;border-radius:2px;">
      ${t.tagline}
    </div>
    <span style="color:rgba(255,255,255,.5);font-size:13px;font-style:italic;">${t.a_great_place}</span>
  </div>

  <!-- BODY: two columns -->
  <div style="flex:1;display:flex;min-height:0;">

    <!-- LEFT WHITE PANEL (37%) — split 62/38 to align with right panel -->
    <div style="width:416px;flex-shrink:0;background:#fff;display:flex;flex-direction:column;border-right:1.5px solid #f0ece8;">

      <!-- TOP (62%) — Perks section -->
      <div style="flex:62;padding:28px 28px 20px 32px;display:flex;flex-direction:column;justify-content:center;border-bottom:1.5px solid #f0ece8;min-height:0;overflow:hidden;">
        ${eyebrow(t.eyebrow)}
        <div style="font-size:28px;font-weight:800;line-height:1.1;color:#111;margin-bottom:12px;">${fmtTitle(t.title)}</div>
        <div style="font-size:12px;color:#999;line-height:1.7;margin-bottom:16px;">${t.desc}</div>
        <div style="display:flex;flex-direction:column;gap:9px;">
          ${t.cats.map(c => `
          <div style="display:flex;align-items:center;gap:11px;">
            <div style="width:5px;height:5px;border-radius:50%;background:#FF6600;flex-shrink:0;"></div>
            <span style="font-size:12.5px;font-weight:700;letter-spacing:.07em;color:#333;">${c}</span>
          </div>`).join('')}
        </div>
      </div>

      <!-- BOTTOM (38%) — Events section -->
      <div style="flex:38;padding:20px 28px 22px 32px;display:flex;flex-direction:column;justify-content:center;min-height:0;overflow:hidden;">
        ${eyebrow(t.events_eyebrow)}
        <div style="font-size:28px;font-weight:800;line-height:1.1;color:#111;margin-bottom:10px;">${fmtTitle(t.events_title)}</div>
        <div style="font-size:12px;color:#999;line-height:1.68;margin-bottom:16px;">${t.events_desc}</div>
        <div style="display:flex;align-items:center;gap:14px;">
          <div style="background:#fff;border:1px solid #eee;border-radius:4px;padding:4px;flex-shrink:0;">
            <img src="${i.qr}" width="56" height="56" style="display:block;border-radius:2px;" crossorigin="anonymous">
          </div>
          <div>
            <a href="${_PERKS_EVENTS_URL}" target="_blank"
               style="background:#FF6600;color:#fff;font-size:11px;font-weight:700;letter-spacing:.07em;padding:8px 16px;border-radius:3px;display:inline-block;text-decoration:none;font-family:'Hanken Grotesk','Noto Sans TC','Noto Sans JP',sans-serif;">${t.cta}</a>
            <div style="color:#ccc;font-size:10px;margin-top:6px;">${t.site}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- RIGHT IMAGE PANEL (63%) -->
    <div style="flex:1;display:flex;flex-direction:column;gap:2px;background:#ccc;">

      <!-- 2×2 grid (62% of body = aligns with left divider) -->
      <div style="flex:62;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:2px;flex-shrink:0;min-height:0;">
        ${imgCell(i.fitness,   t.cats[0])}
        ${imgCell(i.food,      t.cats[1])}
        ${imgCell(i.lifestyle, t.cats[2])}
        ${imgCell(i.storage,   t.cats[3])}
      </div>

      <!-- Events banner (38% of body = aligns with left bottom section) -->
      <div style="flex:38;position:relative;overflow:hidden;background:#222;min-height:0;">
        <img src="${i.events}" style="width:100%;height:100%;object-fit:cover;object-position:center 30%;display:block;" crossorigin="anonymous">
        <div style="position:absolute;inset:0;background:rgba(0,0,0,.22);"></div>
        <div style="position:absolute;bottom:14px;left:16px;display:flex;align-items:center;gap:10px;">
          <div style="width:22px;height:2.5px;background:#FF6600;"></div>
          <span style="color:#fff;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;">${t.events_title.replace(/\n/g,' ')}</span>
        </div>
      </div>
    </div>

  </div>
</div>`;
}
