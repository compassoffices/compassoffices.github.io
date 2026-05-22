// Compass Offices One-Pager Builder
// https://github.com/compassoffices/compassoffices.github.io

// ══════════════════════════════════════════════════════════════════════════
//  PERKS PAGE — fixed marketing page injected before Let's Talk in every PDF
//  Design: black header + two-column white layout (left: text, right: images)
//  Shown only in print/PDF — never in the live canvas.
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
    cta:            'Book a Tour →',
    site:           'compassoffices.com',
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
    cta:            '預約參觀 →',
    site:           'compassoffices.com',
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
    cta:            '预约参观 →',
    site:           'compassoffices.com',
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
    cta:            'ツアーを予約 →',
    site:           'compassoffices.com',
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
  qr:        'https://api.qrserver.com/v1/create-qr-code/?size=64x64&data=https%3A%2F%2Fwww.compassoffices.com%2Fbook-a-tour%2F%3FpreferredLocation%3DHong%2520Kong&bgcolor=ffffff&color=111111',
};

function buildPerksPageHtml(lang) {
  const t = PERKS_I18N[lang] || PERKS_I18N['en'];
  const i = _PERKS_IMGS;

  // Title line breaks: \n → <br>
  const fmtTitle = str => str.replace(/\n/g, '<br>');

  // Inline image cell — image + dark overlay + label at bottom
  const imgCell = (src, label) => `
    <div style="position:relative;overflow:hidden;background:#222;">
      <img src="${src}" style="width:100%;height:100%;object-fit:cover;display:block;"
           crossorigin="anonymous">
      <div style="position:absolute;bottom:0;left:0;right:0;padding:9px 14px;background:rgba(0,0,0,.52);">
        <span style="color:#fff;font-size:12px;font-weight:700;letter-spacing:.09em;font-family:'Hanken Grotesk','Noto Sans TC','Noto Sans JP',sans-serif;">${label}</span>
      </div>
    </div>`;

  // Shared eyebrow row
  const eyebrow = txt => `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
      <div style="width:26px;height:2.5px;background:#FF6600;flex-shrink:0;"></div>
      <span style="color:#FF6600;font-size:11px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;font-family:'Hanken Grotesk','Noto Sans TC','Noto Sans JP',sans-serif;">${txt}</span>
    </div>`;

  return `
<div style="width:1122px;height:794px;display:flex;flex-direction:column;font-family:'Hanken Grotesk','Noto Sans TC','Noto Sans JP',sans-serif;overflow:hidden;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact;">

  <!-- ── BLACK HEADER ────────────────────────────────────────────────── -->
  <div style="background:#111;height:76px;display:flex;align-items:center;padding:0 34px;justify-content:space-between;flex-shrink:0;">
    <img src="${i.logo_white}" style="height:28px;object-fit:contain;" crossorigin="anonymous">
    <div style="border:1.5px solid rgba(255,102,0,.7);color:#FF6600;font-size:9px;font-weight:700;letter-spacing:.1em;padding:4px 11px;border-radius:2px;">
      ${t.tagline}
    </div>
    <span style="color:rgba(255,255,255,.38);font-size:10px;font-style:italic;">${t.a_great_place}</span>
  </div>

  <!-- ── BODY ────────────────────────────────────────────────────────── -->
  <div style="flex:1;display:flex;min-height:0;">

    <!-- LEFT WHITE PANEL (37%) -->
    <div style="width:416px;flex-shrink:0;background:#fff;display:flex;flex-direction:column;border-right:1.5px solid #f0ece8;">

      <!-- TOP SECTION: Perks -->
      <div style="flex:1;padding:28px 28px 22px 32px;display:flex;flex-direction:column;justify-content:center;border-bottom:1.5px solid #f0ece8;">
        ${eyebrow(t.eyebrow)}
        <div style="font-size:28px;font-weight:800;line-height:1.1;color:#111;margin-bottom:13px;">${fmtTitle(t.title)}</div>
        <div style="font-size:12px;color:#999;line-height:1.72;margin-bottom:18px;">${t.desc}</div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${t.cats.map(c => `
          <div style="display:flex;align-items:center;gap:11px;">
            <div style="width:5px;height:5px;border-radius:50%;background:#FF6600;flex-shrink:0;"></div>
            <span style="font-size:12.5px;font-weight:700;letter-spacing:.07em;color:#333;">${c}</span>
          </div>`).join('')}
        </div>
      </div>

      <!-- BOTTOM SECTION: Events -->
      <div style="flex:1;padding:22px 28px 24px 32px;display:flex;flex-direction:column;justify-content:center;">
        ${eyebrow(t.events_eyebrow)}
        <div style="font-size:28px;font-weight:800;line-height:1.1;color:#111;margin-bottom:12px;">${fmtTitle(t.events_title)}</div>
        <div style="font-size:12px;color:#999;line-height:1.7;margin-bottom:18px;">${t.events_desc}</div>
        <!-- QR + CTA -->
        <div style="display:flex;align-items:center;gap:14px;">
          <div style="background:#fff;border:1px solid #eee;border-radius:4px;padding:4px;flex-shrink:0;">
            <img src="${i.qr}" width="56" height="56" style="display:block;border-radius:2px;" crossorigin="anonymous">
          </div>
          <div>
            <div style="background:#FF6600;color:#fff;font-size:11px;font-weight:700;letter-spacing:.07em;padding:8px 16px;border-radius:3px;display:inline-block;">${t.cta}</div>
            <div style="color:#ccc;font-size:10px;margin-top:6px;">${t.site}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- RIGHT IMAGE PANEL (63%) -->
    <div style="flex:1;display:flex;flex-direction:column;gap:2px;background:#ccc;">

      <!-- 2×2 perk image grid (62% of body height) -->
      <div style="height:62%;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:2px;flex-shrink:0;">
        ${imgCell(i.fitness,   t.cats[0])}
        ${imgCell(i.food,      t.cats[1])}
        ${imgCell(i.lifestyle, t.cats[2])}
        ${imgCell(i.storage,   t.cats[3])}
      </div>

      <!-- Events community photo banner (38% of body height) -->
      <div style="flex:1;position:relative;overflow:hidden;background:#222;">
        <img src="${i.events}" style="width:100%;height:100%;object-fit:cover;object-position:center 30%;display:block;"
             crossorigin="anonymous">
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
