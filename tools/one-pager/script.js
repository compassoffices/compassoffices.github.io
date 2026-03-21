// ══════════════════════════════════════════════════════════
//  LANGUAGE CONFIG
// ══════════════════════════════════════════════════════════
let LANG = 'en';

/* Per-language field labels for the sidebar */
const L = {
  en: {
    name:'Name',addr:'Address',tr1:'Transport Line 1',tr2:'Transport Line 2',
    struct:'Structure',comp:'Completion',ceil:'Ceiling Height',
    fa:'Floor Area',ca:'Common Area',el:'Elevators',ac:'AC System',
    net:'Network',fac:'Facilities',hrs:'Access Hours',park:'Parking',
    benefits:'Benefits — ご利用のメリット',
  },
  'zh-hant':{
    name:'名稱',addr:'地址',tr1:'交通路線 1',tr2:'交通路線 2',
    struct:'結構',comp:'竣工',ceil:'天花板高度',
    fa:'樓面面積',ca:'公共區域',el:'電梯',ac:'空調系統',
    net:'網絡環境',fac:'公共設施',hrs:'使用時間',park:'停車場',
    benefits:'使用優點',
  },
  'zh-hans':{
    name:'名称',addr:'地址',tr1:'交通路线 1',tr2:'交通路线 2',
    struct:'结构',comp:'竣工',ceil:'天花板高度',
    fa:'楼面面积',ca:'公共区域',el:'电梯',ac:'空调系统',
    net:'网络环境',fac:'公共设施',hrs:'使用时间',park:'停车场',
    benefits:'使用优点',
  },
  ja:{
    name:'名称',addr:'住所',tr1:'交通アクセス 1',tr2:'交通アクセス 2',
    struct:'構造',comp:'竣工年月',ceil:'天井高',
    fa:'基準階面積',ca:'共用部面積',el:'エレベーター',ac:'空調',
    net:'ネット環境',fac:'共用部概要',hrs:'使用時間',park:'駐車場',
    benefits:'ご利用のメリット',
  },
};

/* Spec table row labels per language */
const SL = {
  en:        {struct:'Structure',comp:'Completion',area:'Area',ceiling:'Ceiling / OA',
              ac:'AC',net:'Network',lifts:'Lifts / Hours',fac:'Facilities',park:'Parking',
              transport:'Transport',amenities:'Amenities',specs:'Building Specs'},
  'zh-hant': {struct:'結構',comp:'竣工',area:'面積',ceiling:'天花高度 / OA',
              ac:'空調',net:'網絡',lifts:'電梯 / 使用時間',fac:'公共設施',park:'停車場',
              transport:'交通',amenities:'設施優點',specs:'樓宇設施概要'},
  'zh-hans': {struct:'结构',comp:'竣工',area:'面积',ceiling:'天花高度 / OA',
              ac:'空调',net:'网络',lifts:'电梯 / 使用时间',fac:'公共设施',park:'停车场',
              transport:'交通',amenities:'设施优点',specs:'楼宇设施概要'},
  ja:        {struct:'構造',comp:'竣工年月',area:'面積',ceiling:'天井高 / OA',
              ac:'空調',net:'ネット環境',lifts:'EV / 使用時間',fac:'共用部概要',park:'駐車場',
              transport:'アクセス',amenities:'設備概要',specs:'ビル・設備概要'},
};

function sl(k){ return (SL[LANG]||SL.en)[k]||k; }
function l(k){  return (L[LANG]||L.en)[k]||k; }

// ── Full UI string translations ─────────────────────────
const UI = {
  en: {
    tab_loc:'📍 Location', tab_specs:'🏢 Specs', tab_price:'💰 Pricing', tab_media:'🖼 Media',
    sec_url:'Location URL', btn_fetch:'Fetch',
    lbl_url_hint:'Paste any compassoffices.com/locations/… URL and click Fetch',
    note_fetch:'Fetches the page directly — no API needed. Auto-fills name, address, transport & specs.',
    sec_name_loc:'Name & Location', lbl_city:'City', lbl_floor:'Floor / Unit',
    sec_transport:'Transport Access',
    note_transport:'Add lines, pick icon, edit text. Displayed in 2-column grid on slide.',
    btn_add_transport:'Add Transport Line', lbl_purl:'Page URL (footer)',
    note_specs:'Auto-filled when you Fetch. Edit any field freely.',
    sec_bldg:'Building Details', lbl_oa:'OA Floor',
    sec_pricing:'Pricing Rows', btn_add_pricing:'+ Add Pricing Row',
    sec_amenities:'Amenities', note_amenities:'Toggle which icons appear in the amenity grid.',
    note_benefits:'Toggle on/off · Click text to edit · Add your own lines.',
    btn_add_benefit:'Add Benefit',
    sec_logos:'Header Logos', lbl_co_logo:'Compass Offices Logo', lbl_always_shown:'(always shown)',
    lbl_sep:'Logo Separator', lbl_partner_logo:'Partner / Building Logo',
    btn_upload_partner:'Upload partner logo', hint_partner:'Shown beside Compass Offices logo with separator',
    sec_photos:'Location Photos', btn_upload_photos:'Upload photos (max 3)',
    hint_photos:'1st = hero · 2nd & 3rd = thumbnails',
    sec_floorplan:'Floor Plan', btn_upload_fp:'Upload floor plan',
    hint_fp:'Any size — fits inside rounded box',
    btn_generate:'Generate Preview', btn_print:'🖨 Print / Save PDF',
    lbl_page1:'Page 1 — Overview', lbl_page2:'Page 2 — Floor Plan & Amenities',
    empty_hint1:'Paste a URL and click Fetch', empty_hint2:'Or fill the form and click Generate',
    empty_p2:'Floor Plan + Amenities', empty_p2_hint:'Generates when you click Generate',
    print_hint:'🖨 Print / Save PDF → prints both pages · A4 Landscape · margins: None',
    lbl_choose_icon:'Choose Icon',
    sec_library:'📂 Location Library',
    lib_search_ph:'Type to search locations…',
    btn_add_files:'+ Files',
    lib_empty:'No locations yet — click + Files to upload JSON files',
    lib_count:n=>`${n} location${n!==1?'s':''} loaded`,
    pr_row:'Pricing Row', pr_seats:'Seats', pr_type:'Type',
    pr_rent:'Monthly Rent', pr_mgmt:'Mgmt Fee',
    pr_init:'Initial Cost', pr_init_hint:'(rich text — select text then B or 🟠)',
    pr_avail:'Available',
    pr_seat_ph:'1–17', pr_type_ph:'Window / Aisle',
    pr_rent_ph:'HK$4,000/desk', pr_mgmt_ph:'HK$500/desk',
    pr_init_ph:'3 months deposit', pr_avail_ph:'Immediate',
    sec_custom:'Custom Info Block', note_custom:'Shown below Transport on the slide. Edit the title and body freely.',
    lbl_custom_title:'Section Title', lbl_custom_body:'Content',
    custom_title_default:'Overview',
    custom_body_default:'Available from 1 month. Flexible terms and customisable spaces beyond those listed. We tailor our offering to your specific needs.',
  },
  'zh-hant': {
    tab_loc:'📍 位置', tab_specs:'🏢 規格', tab_price:'💰 定價', tab_media:'🖼 媒體',
    sec_url:'位置網址', btn_fetch:'獲取',
    lbl_url_hint:'貼上任何 compassoffices.com/locations/… 網址並點擊獲取',
    note_fetch:'直接獲取頁面，無需 API。自動填寫名稱、地址、交通及規格。',
    sec_name_loc:'名稱與位置', lbl_city:'城市', lbl_floor:'樓層 / 單位',
    sec_transport:'交通資訊',
    note_transport:'新增路線、選擇圖示、編輯文字。以兩欄網格顯示在幻燈片上。',
    btn_add_transport:'新增交通路線', lbl_purl:'頁面網址（頁尾）',
    note_specs:'獲取後自動填寫。可自由編輯任何欄位。',
    sec_bldg:'大廈詳情', lbl_oa:'OA 地板',
    sec_pricing:'定價行', btn_add_pricing:'+ 新增定價行',
    sec_amenities:'設施', note_amenities:'切換哪些圖示顯示在設施網格中。',
    note_benefits:'開啟/關閉 · 點擊文字編輯 · 新增自己的項目。',
    btn_add_benefit:'新增優點',
    sec_logos:'標題標誌', lbl_co_logo:'Compass Offices 標誌', lbl_always_shown:'（始終顯示）',
    lbl_sep:'標誌分隔符', lbl_partner_logo:'合作夥伴 / 大廈標誌',
    btn_upload_partner:'上傳合作夥伴標誌', hint_partner:'顯示在 Compass Offices 標誌旁邊',
    sec_photos:'位置照片', btn_upload_photos:'上傳照片（最多 3 張）',
    hint_photos:'第1張＝主圖 · 第2、3張＝縮圖',
    sec_floorplan:'平面圖', btn_upload_fp:'上傳平面圖',
    hint_fp:'任何尺寸 — 適合圓角框',
    btn_generate:'生成預覽', btn_print:'🖨 列印 / 儲存 PDF',
    lbl_page1:'第 1 頁 — 概覽', lbl_page2:'第 2 頁 — 平面圖及設施',
    empty_hint1:'貼上網址並點擊獲取', empty_hint2:'或填寫表格並點擊生成',
    empty_p2:'平面圖 + 設施', empty_p2_hint:'點擊生成後即可顯示',
    print_hint:'🖨 列印 / 儲存 PDF → 列印兩頁 · A4 橫向 · 邊距：無',
    lbl_choose_icon:'選擇圖示',
    sec_library:'📂 位置庫',
    lib_search_ph:'輸入以搜尋位置…',
    btn_add_files:'+ 新增檔案',
    lib_empty:'尚無位置 — 點擊 + 新增檔案上傳 JSON',
    lib_count:n=>`已載入 ${n} 個位置`,
    pr_row:'定價行', pr_seats:'席位', pr_type:'類型',
    pr_rent:'月租', pr_mgmt:'管理費',
    pr_init:'初始費用', pr_init_hint:'（富文本 — 選取文字後點 B 或 🟠）',
    pr_avail:'可入駐',
    pr_seat_ph:'1–17', pr_type_ph:'窗口 / 走廊',
    pr_rent_ph:'HK$4,000/席', pr_mgmt_ph:'HK$500/席',
    pr_init_ph:'3個月保證金', pr_avail_ph:'即時入駐',
    sec_custom:'自訂資訊', note_custom:'顯示在幻燈片交通資訊下方。可自由編輯標題和內容。',
    lbl_custom_title:'區塊標題', lbl_custom_body:'內容',
    custom_title_default:'招募概要',
    custom_body_default:'最短1個月起，靈活租用。除刊登區域外，亦可提供其他樓層，並根據客戶需求量身訂制方案。',
  },
  'zh-hans': {
    tab_loc:'📍 位置', tab_specs:'🏢 规格', tab_price:'💰 定价', tab_media:'🖼 媒体',
    sec_url:'位置网址', btn_fetch:'获取',
    lbl_url_hint:'粘贴任何 compassoffices.com/locations/… 网址并点击获取',
    note_fetch:'直接获取页面，无需 API。自动填写名称、地址、交通及规格。',
    sec_name_loc:'名称与位置', lbl_city:'城市', lbl_floor:'楼层 / 单位',
    sec_transport:'交通信息',
    note_transport:'添加路线、选择图标、编辑文字。在幻灯片上以两列网格显示。',
    btn_add_transport:'添加交通路线', lbl_purl:'页面网址（页脚）',
    note_specs:'获取后自动填写。可自由编辑任何字段。',
    sec_bldg:'大厦详情', lbl_oa:'OA 地板',
    sec_pricing:'定价行', btn_add_pricing:'+ 添加定价行',
    sec_amenities:'设施', note_amenities:'切换哪些图标显示在设施网格中。',
    note_benefits:'开启/关闭 · 点击文字编辑 · 添加自己的项目。',
    btn_add_benefit:'添加优点',
    sec_logos:'标题标志', lbl_co_logo:'Compass Offices 标志', lbl_always_shown:'（始终显示）',
    lbl_sep:'标志分隔符', lbl_partner_logo:'合作伙伴 / 大厦标志',
    btn_upload_partner:'上传合作伙伴标志', hint_partner:'显示在 Compass Offices 标志旁边',
    sec_photos:'位置照片', btn_upload_photos:'上传照片（最多 3 张）',
    hint_photos:'第1张＝主图 · 第2、3张＝缩略图',
    sec_floorplan:'平面图', btn_upload_fp:'上传平面图',
    hint_fp:'任何尺寸 — 适合圆角框',
    btn_generate:'生成预览', btn_print:'🖨 打印 / 保存 PDF',
    lbl_page1:'第 1 页 — 概览', lbl_page2:'第 2 页 — 平面图及设施',
    empty_hint1:'粘贴网址并点击获取', empty_hint2:'或填写表格并点击生成',
    empty_p2:'平面图 + 设施', empty_p2_hint:'点击生成后即可显示',
    print_hint:'🖨 打印 / 保存 PDF → 打印两页 · A4 横向 · 页边距：无',
    lbl_choose_icon:'选择图标',
    sec_library:'📂 位置库',
    lib_search_ph:'输入以搜索位置…',
    btn_add_files:'+ 添加文件',
    lib_empty:'暂无位置 — 点击 + 添加文件上传 JSON',
    lib_count:n=>`已加载 ${n} 个位置`,
    pr_row:'定价行', pr_seats:'席位', pr_type:'类型',
    pr_rent:'月租', pr_mgmt:'管理费',
    pr_init:'初始费用', pr_init_hint:'（富文本 — 选取文字后点 B 或 🟠）',
    pr_avail:'可入驻',
    pr_seat_ph:'1–17', pr_type_ph:'窗口 / 走廊',
    pr_rent_ph:'HK$4,000/席', pr_mgmt_ph:'HK$500/席',
    pr_init_ph:'3个月押金', pr_avail_ph:'即时入驻',
    sec_custom:'自定义信息', note_custom:'显示在幻灯片交通信息下方。可自由编辑标题和内容。',
    lbl_custom_title:'区块标题', lbl_custom_body:'内容',
    custom_title_default:'招募概要',
    custom_body_default:'最短1个月起，灵活租用。除刊登区域外，亦可提供其他楼层，并根据客户需求量身定制方案。',
  },
  ja: {
    tab_loc:'📍 所在地', tab_specs:'🏢 仕様', tab_price:'💰 料金', tab_media:'🖼 メディア',
    sec_url:'所在地URL', btn_fetch:'取得',
    lbl_url_hint:'compassoffices.com/locations/… のURLを貼り付けて取得をクリック',
    note_fetch:'ページを直接取得します（API不要）。名称・住所・交通・仕様を自動入力。',
    sec_name_loc:'名称と所在地', lbl_city:'都市', lbl_floor:'階 / 号室',
    sec_transport:'交通アクセス',
    note_transport:'路線を追加し、アイコンを選択してテキストを編集。スライドに2列グリッドで表示。',
    btn_add_transport:'交通路線を追加', lbl_purl:'ページURL（フッター）',
    note_specs:'取得後に自動入力されます。自由に編集できます。',
    sec_bldg:'ビル詳細', lbl_oa:'OAフロア',
    sec_pricing:'料金行', btn_add_pricing:'+ 料金行を追加',
    sec_amenities:'設備', note_amenities:'設備グリッドに表示するアイコンを切り替えます。',
    note_benefits:'オン/オフ切替 · テキストをクリックして編集 · 独自の項目を追加。',
    btn_add_benefit:'特典を追加',
    sec_logos:'ヘッダーロゴ', lbl_co_logo:'Compass Offices ロゴ', lbl_always_shown:'（常に表示）',
    lbl_sep:'ロゴ区切り', lbl_partner_logo:'パートナー / ビルロゴ',
    btn_upload_partner:'パートナーロゴをアップロード', hint_partner:'Compass Officesロゴの横に表示',
    sec_photos:'所在地写真', btn_upload_photos:'写真をアップロード（最大3枚）',
    hint_photos:'1枚目＝メイン · 2・3枚目＝サムネイル',
    sec_floorplan:'間取り図', btn_upload_fp:'間取り図をアップロード',
    hint_fp:'サイズ不問 — 角丸ボックスに収まります',
    btn_generate:'プレビュー生成', btn_print:'🖨 印刷 / PDF保存',
    lbl_page1:'第1ページ — 概要', lbl_page2:'第2ページ — 間取り図・設備',
    empty_hint1:'URLを貼り付けて取得をクリック', empty_hint2:'またはフォームを入力して生成をクリック',
    empty_p2:'間取り図 + 設備', empty_p2_hint:'生成をクリックすると表示されます',
    print_hint:'🖨 印刷 / PDF保存 → 両ページを印刷 · A4横向き · 余白：なし',
    lbl_choose_icon:'アイコンを選択',
    sec_library:'📂 ロケーションライブラリ',
    lib_search_ph:'ロケーションを検索…',
    btn_add_files:'+ ファイル追加',
    lib_empty:'まだありません — + ファイル追加でJSONをアップロード',
    lib_count:n=>`${n}件のロケーションを読み込み済み`,
    pr_row:'料金行', pr_seats:'席数', pr_type:'タイプ',
    pr_rent:'月額賃料', pr_mgmt:'共益管理費',
    pr_init:'初期費用', pr_init_hint:'（リッチテキスト — テキスト選択後 B または 🟠 をクリック）',
    pr_avail:'入居可能時期',
    pr_seat_ph:'1〜17', pr_type_ph:'窓側 / 通路側',
    pr_rent_ph:'¥100,000/席', pr_mgmt_ph:'¥10,000/席',
    pr_init_ph:'3ヶ月分保証金', pr_avail_ph:'即時入居可',
    sec_custom:'カスタム情報', note_custom:'スライドの交通アクセス下に表示されます。タイトルと内容を自由に編集できます。',
    lbl_custom_title:'セクションタイトル', lbl_custom_body:'内容',
    custom_title_default:'募集概要',
    custom_body_default:'最短1ヶ月からの短期利用、掲載区画以外もご案内可能。お客様ごとのご利用ニーズに合わせて区画をカスタマイズ、ご提案いたします。',
  },
};

function ui(k){ return (UI[LANG]||UI.en)[k] || (UI.en[k]) || k; }

function applyI18n(){
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    el.textContent = ui(el.dataset.i18n);
  });
  // Handle data-i18n-placeholder attributes (for inputs/contenteditable)
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{
    el.placeholder = ui(el.dataset.i18nPlaceholder);
  });
  // Also update input placeholders via id map
  const ph = {
    'n-main': {en:'China Building','zh-hant':'華人行','zh-hans':'华人行',ja:'所在地名'},
    'addr':   {en:"29 Queen's Road Central, Central",'zh-hant':'中環皇后大道中29號','zh-hans':'中环皇后大道中29号',ja:'〒100-0000 東京都千代田区…'},
    'floor':  {en:'18-19F','zh-hant':'18-19樓','zh-hans':'18-19层',ja:'18-19F'},
    'purl':   {en:'https://www.compassoffices.com/locations/…','zh-hant':'https://www.compassoffices.com/locations/…','zh-hans':'https://www.compassoffices.com/locations/…',ja:'https://www.compassoffices.com/locations/…'},
    's-struct':{en:'Steel frame, seismic isolation','zh-hant':'鋼結構，隔震','zh-hans':'钢结构，隔震',ja:'鉄骨造・免震構造'},
    's-comp': {en:'2025','zh-hant':'2025','zh-hans':'2025',ja:'2025年'},
    's-ceil': {en:'2.9m','zh-hant':'2.9米','zh-hans':'2.9米',ja:'2.9m'},
    's-fa':   {en:'390 tsubo','zh-hant':'390坪','zh-hans':'390坪',ja:'390坪'},
    's-ca':   {en:'60 tsubo','zh-hant':'60坪','zh-hans':'60坪',ja:'60坪'},
    's-oa':   {en:'100mm','zh-hant':'100mm','zh-hans':'100mm',ja:'100mm'},
    's-el':   {en:'3','zh-hant':'3','zh-hans':'3',ja:'3基'},
    's-ac':   {en:'Block AC, weekdays 9:00–18:00','zh-hant':'中央空調，平日9:00–18:00','zh-hans':'中央空调，平日9:00–18:00',ja:'個別空調、平日9:00〜18:00'},
    's-net':  {en:'Free Wi-Fi, dedicated line','zh-hant':'免費Wi-Fi，專線','zh-hans':'免费Wi-Fi，专线',ja:'フリーWi-Fi・専用回線'},
    's-fac':  {en:'Lounge, 2 meeting rooms','zh-hant':'休息室，2間會議室','zh-hans':'休息室，2间会议室',ja:'ラウンジ・会議室2室'},
    's-hrs':  {en:'24/7','zh-hant':'全天候','zh-hans':'全天候',ja:'24時間'},
    's-park': {en:'Available','zh-hant':'有','zh-hans':'有',ja:'有'},
    'custom-title': {en:'Overview','zh-hant':'招募概要','zh-hans':'招募概要',ja:'募集概要'},
    'custom-body':  {en:'Available from 1 month...','zh-hant':'最短1個月起...','zh-hans':'最短1个月起...',ja:'最短1ヶ月からの短期利用...'},
  };
  Object.entries(ph).forEach(([id,texts])=>{
    const el=document.getElementById(id);
    if(el) el.placeholder = texts[LANG]||texts.en;
  });
  // Set custom-body-editor placeholder (contenteditable)
  const cbEditor = document.getElementById('custom-body-editor');
  if(cbEditor) cbEditor.setAttribute('placeholder', ui('custom_body_default'));
  // Update library status text
  updateLibStatus();
}

// Update the library count/hint text in current language
function updateLibStatus(){
  const el = document.getElementById('lib-status-txt');
  if(!el) return;
  const lib = getLib();
  el.textContent = lib.length
    ? (typeof ui('lib_count')==='function' ? ui('lib_count')(lib.length) : ui('lib_count'))
    : ui('lib_empty');
}

function setLang(lc){
  LANG = lc;
  document.querySelectorAll('.lbtn').forEach((b,i)=>
    b.classList.toggle('on',['en','zh-hant','zh-hans','ja'][i]===lc));

  // Apply all UI translations
  applyI18n();

  // Update sidebar field labels via L map
  const mp = {
    'lbl-name':'name','lbl-addr':'addr',
    'lbl-struct':'struct','lbl-comp':'comp','lbl-ceil':'ceil',
    'lbl-fa':'fa','lbl-ca':'ca','lbl-el':'el','lbl-ac':'ac',
    'lbl-net':'net','lbl-fac':'fac','lbl-hrs':'hrs','lbl-park':'park',
  };
  Object.entries(mp).forEach(([id,key])=>{
    const el=document.getElementById(id); if(el) el.textContent=l(key);
  });
  const bs=document.getElementById('lbl-benefits-section');
  if(bs) bs.textContent=l('benefits');

  // Reinit benefits with defaults for this language
  const prevBenefits = BENEFITS.slice();
  initBenefits(lc);
  BENEFITS.forEach(b=>{
    const prev = prevBenefits.find(p=>p.id===b.id);
    if(prev) b.on = prev.on;
  });
  renderBenefits();
  renderAmenities();
  renderRows();
  // Re-apply loaded location in new language
  if(LAST_LOCATION) applyLocationData(LAST_LOCATION);
  gen();
}

// ══════════════════════════════════════════════════════════
//  ICONS
// ══════════════════════════════════════════════════════════
const IC = {
  concierge: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  lounge:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2"/><path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H6v-2a2 2 0 0 0-4 0z"/><line x1="6" y1="18" x2="6" y2="22"/><line x1="18" y1="18" x2="18" y2="22"/></svg>`,
  drinks:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>`,
  flexible:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  deposit:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`,
  furniture: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>`,
  utilities: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>`,
  access24:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  phonebooth:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.14 13.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.05 3h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 10.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 18l.02-1.08z"/></svg>`,
  parking:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/></svg>`,
  norestore: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
  security:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  // Transport icons
  tr_metro:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="16" rx="2"/><path d="M4 11h16M12 3v8"/><circle cx="8.5" cy="17.5" r="1.5"/><circle cx="15.5" cy="17.5" r="1.5"/><line x1="8.5" y1="19" x2="6" y2="22"/><line x1="15.5" y1="19" x2="18" y2="22"/></svg>`,
  tr_train:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="14" rx="2"/><path d="M16 14v2M8 14v2M2 10h20"/><circle cx="8" cy="17" r="1"/><circle cx="16" cy="17" r="1"/></svg>`,
  tr_bus:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6M3 6h18l1 8H2L3 6z"/><path d="M3 6V4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>`,
  tr_walk:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4" r="1.5"/><path d="m9 8 1 5 2-2 2 4"/><path d="m14.5 8-1.5 3H9"/><path d="m10 16-1 4M14 16l1 4"/></svg>`,
  tr_ferry:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20a2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1"/><path d="M4 17H2l2-9h16l1.5 7H18"/><path d="M8 12V8m4 4V7m4 5V9"/></svg>`,
  tr_car:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14l4 4v6a2 2 0 0 1-2 2h-2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>`,
  tr_airport:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 4s-2 1-3.5 2.5L11 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>`,
};

// Transport icon choices for picker
const TR_IC_LIST = [
  {id:'tr_metro',   label:'Metro'},
  {id:'tr_train',   label:'Train'},
  {id:'tr_bus',     label:'Bus'},
  {id:'tr_walk',    label:'Walk'},
  {id:'tr_ferry',   label:'Ferry'},
  {id:'tr_car',     label:'Car'},
  {id:'tr_airport', label:'Airport'},
];

const TRANSIT = IC.tr_metro; // default for backward compat

// strip outer <svg> tag to use inline in .sl-merit
function icInner(id){
  const m=IC[id]?.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
  return m?m[1]:'';
}

// ══════════════════════════════════════════════════════════
//  TRANSPORT — editable list with icon picker
// ══════════════════════════════════════════════════════════
let TRANSPORT = [];

function initTransport(lines){
  // lines = array of {text, iconId} or just strings
  TRANSPORT = (lines||[]).map((l,i)=>({
    id: 'tr_'+Date.now()+'_'+i,
    iconId: l.iconId || 'tr_metro',
    text: typeof l==='string' ? l : (l.text||''),
  }));
}

function addTransport(text='', iconId='tr_metro'){
  TRANSPORT.push({id:'tr_'+Date.now(), iconId, text});
  renderTransport();
  // focus new input
  setTimeout(()=>{
    const inputs = document.querySelectorAll('#tr-list .tr-input');
    if(inputs.length) inputs[inputs.length-1].focus();
  }, 40);
}

function delTransport(id){ TRANSPORT=TRANSPORT.filter(t=>t.id!==id); renderTransport(); }

function renderTransport(){
  const list = document.getElementById('tr-list');
  if(!list) return;
  list.innerHTML = TRANSPORT.map((t)=>{
    const iconSvg = IC[t.iconId] || IC.tr_metro;
    const safe = (t.text||'').replace(/"/g,'&quot;');
    return `
    <div class="tr-row">
      <button class="tr-ico-btn" onclick="openTrPicker('${t.id}',this)" title="Change icon">${iconSvg}</button>
      <input class="tr-input" type="text" value="${safe}"
             oninput="updateTr('${t.id}',this.value)"
             placeholder="e.g. MTR Central — 2 min walk">
      <button class="tr-del" onclick="delTransport('${t.id}')">
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>`;
  }).join('');
}

function updateTr(id, val){ const t=TRANSPORT.find(t=>t.id===id); if(t) t.text=val; }

// Transport icon picker (reuses the same popover, different list)
let _trPickerId = null;

function openTrPicker(id, btn){
  if(_trPickerId===id && document.getElementById('ico-picker').classList.contains('open')){
    closeIconPicker(); return;
  }
  _trPickerId = id;
  _pickerBenIdx = null; // clear benefit picker state

  const picker = document.getElementById('ico-picker');
  const cur = (TRANSPORT.find(t=>t.id===id)||{}).iconId||'tr_metro';

  document.getElementById('ico-picker-grid').innerHTML = TR_IC_LIST.map(ic=>`
    <div class="ico-opt${cur===ic.id?' sel':''}" onclick="selectTrIcon('${ic.id}')">
      <span style="width:16px;height:16px;display:flex;align-items:center;justify-content:center">
        ${IC[ic.id]||''}
      </span>
      <span>${ic.label}</span>
    </div>`).join('');

  const r = btn.getBoundingClientRect();
  picker.style.top  = (r.bottom + 6) + 'px';
  picker.style.left = Math.min(r.left, window.innerWidth - 240) + 'px';
  picker.classList.add('open');
  setTimeout(()=>document.addEventListener('click', outsidePickerClick, {once:true}), 20);
}

function selectTrIcon(iconId){
  if(_trPickerId===null) return;
  const t = TRANSPORT.find(t=>t.id===_trPickerId);
  if(t) t.iconId = iconId;
  closeIconPicker();
  _trPickerId = null;
  renderTransport();
}



// ══════════════════════════════════════════════════════════
//  AMENITY DATA — labels per language
// ══════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════
//  AMENITIES — icon grid only (separate from Benefits)
// ══════════════════════════════════════════════════════════
const AMENITY_ICONS = [
  {id:'concierge', on:true,  en:'Concierge', tc:'禮賓',     sc:'礼宾',     ja:'コンシェルジュ'},
  {id:'lounge',    on:true,  en:'Lounge',    tc:'休息室',   sc:'休息室',   ja:'ラウンジ'},
  {id:'drinks',    on:true,  en:'Drinks',    tc:'飲品',     sc:'饮品',     ja:'ドリンク'},
  {id:'flexible',  on:true,  en:'Flexible',  tc:'靈活',     sc:'灵活',     ja:'柔軟契約'},
  {id:'deposit',   on:true,  en:'Deposit',   tc:'保證金',   sc:'押金',     ja:'保証金'},
  {id:'furniture', on:true,  en:'Furnished', tc:'傢俱齊備', sc:'家具齐备', ja:'家具完備'},
  {id:'utilities', on:true,  en:'Utilities', tc:'水電包含', sc:'水电包含', ja:'光熱費込'},
  {id:'access24',  on:true,  en:'24/7',      tc:'全天候',   sc:'全天候',   ja:'24時間'},
  {id:'phonebooth',on:false, en:'Phone Booth',tc:'電話亭',  sc:'电话亭',   ja:'フォンブース'},
  {id:'parking',   on:false, en:'Parking',   tc:'停車場',   sc:'停车场',   ja:'駐車場'},
  {id:'norestore', on:true,  en:'No Restore',tc:'免還原',   sc:'免复原',   ja:'原状回復不要'},
  {id:'security',  on:false, en:'Security',  tc:'保安',     sc:'保安',     ja:'セキュリティ'},
];

function amenLabel(a){
  const map = {'zh-hant':'tc','zh-hans':'sc','ja':'ja'};
  return a[map[LANG]] || a.en;
}

function renderAmenities(){
  document.getElementById('amen-grid').innerHTML = AMENITY_ICONS.map((a,i)=>`
    <div class="amen-item${a.on?' on':''}" onclick="toggleAmenIcon(${i})">
      <span class="aico">${IC[a.id]||''}</span>
      <span>${amenLabel(a)}</span>
    </div>`).join('');
}
function toggleAmenIcon(i){ AMENITY_ICONS[i].on=!AMENITY_ICONS[i].on; renderAmenities(); }

// ══════════════════════════════════════════════════════════
//  BENEFITS — editable list, togglable, per-language defaults
// ══════════════════════════════════════════════════════════

// Default text per language for each benefit
const BEN_DEFAULTS = {
  en:[
    {id:'concierge', text:'Concierge staff on-site (English available)'},
    {id:'lounge',    text:'Lounge & meeting rooms shared'},
    {id:'drinks',    text:'Coffee, drinks, microwave & fridge included'},
    {id:'flexible',  text:'Flexible contracts — monthly or annual'},
    {id:'deposit',   text:'3-month deposit, fully refundable on exit'},
    {id:'furniture', text:'Fully furnished, no fit-out required'},
    {id:'utilities', text:'Utilities, Free Wi-Fi & cleaning included'},
    {id:'access24',  text:'24-hour access available'},
    {id:'norestore', text:'No restoration required on exit'},
    {id:'phonebooth',text:'Private phone booths available', on:false},
    {id:'parking',   text:'Parking available on-site', on:false},
    {id:'security',  text:'Security card access included', on:false},
  ],
  'zh-hant':[
    {id:'concierge', text:'禮賓服務員常駐（可英語溝通）'},
    {id:'lounge',    text:'休息室及會議室共用，可利用面積增倍'},
    {id:'drinks',    text:'咖啡、飲品、微波爐及冰箱'},
    {id:'flexible',  text:'月度或年度合約，靈活選擇'},
    {id:'deposit',   text:'保證金3個月，退租時全額退還'},
    {id:'furniture', text:'辦公傢俱完備，無需裝修'},
    {id:'utilities', text:'水電費、免費WiFi及清潔費全包'},
    {id:'access24',  text:'24小時全天候出入'},
    {id:'norestore', text:'退租毋須還原，僅需清潔費'},
    {id:'phonebooth',text:'私人電話亭及會議室獨佔使用', on:false},
    {id:'parking',   text:'大廈設有停車場', on:false},
    {id:'security',  text:'安全卡進出及全天候大廈保安', on:false},
  ],
  'zh-hans':[
    {id:'concierge', text:'礼宾服务员常驻（可英语沟通）'},
    {id:'lounge',    text:'休息室及会议室共用，可利用面积增倍'},
    {id:'drinks',    text:'咖啡、饮品、微波炉及冰箱'},
    {id:'flexible',  text:'月度或年度合同，灵活选择'},
    {id:'deposit',   text:'押金3个月，退租时全额退还'},
    {id:'furniture', text:'办公家具完备，无需装修'},
    {id:'utilities', text:'水电费、免费WiFi及清洁费全包'},
    {id:'access24',  text:'24小时全天候出入'},
    {id:'norestore', text:'退租无需复原，仅需清洁费'},
    {id:'phonebooth',text:'私人电话亭及会议室独占使用', on:false},
    {id:'parking',   text:'大厦设有停车场', on:false},
    {id:'security',  text:'安全卡进出及全天候大厦保安', on:false},
  ],
  ja:[
    {id:'concierge', text:'コンシェルジュスタッフが常駐（英語対応可能）'},
    {id:'lounge',    text:'ラウンジ・会議室など共有部利用で利用面積２倍'},
    {id:'drinks',    text:'コーヒー・ドリンクアメニティ・冷蔵庫・電子レンジ付'},
    {id:'flexible',  text:'月・年単位での契約期間設定可、保証会社不要'},
    {id:'deposit',   text:'保証金3か月分　退去時全額返金'},
    {id:'furniture', text:'初期内装工事不要、オフィス家具完備'},
    {id:'utilities', text:'空調、水道光熱費、Free WiFi、清掃費用込'},
    {id:'access24',  text:'24時間アクセス可・駐車場・喫煙場所有'},
    {id:'norestore', text:'退去時原状回復原則不要、クリーニング費用のみ'},
    {id:'phonebooth',text:'フォンブース、会議室の占有利用可', on:false},
    {id:'parking',   text:'駐車場有', on:false},
    {id:'security',  text:'セキュリティカード付', on:false},
  ],
};

// Working list — starts from defaults, user can edit/add/delete
let BENEFITS = [];

function initBenefits(lc){
  const defaults = BEN_DEFAULTS[lc] || BEN_DEFAULTS.en;
  BENEFITS = defaults.map((d,i)=>({
    id: d.id||('custom_'+i),
    on: d.on !== false,   // default on unless explicitly false
    text: d.text,
  }));
}

// Default tick SVG — used when no icon is assigned
const TICK_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

// Full icon list available in picker
const IC_LIST = [
  {id:'concierge', label:'Concierge'},
  {id:'lounge',    label:'Lounge'},
  {id:'drinks',    label:'Drinks'},
  {id:'flexible',  label:'Flexible'},
  {id:'deposit',   label:'Deposit'},
  {id:'furniture', label:'Furnished'},
  {id:'utilities', label:'Utilities'},
  {id:'access24',  label:'24/7'},
  {id:'phonebooth',label:'Phone'},
  {id:'parking',   label:'Parking'},
  {id:'norestore', label:'No Restore'},
  {id:'security',  label:'Security'},
];

function getBenIcon(b){
  const id = b.iconId !== undefined ? b.iconId : b.id;
  return (id && IC[id]) ? IC[id] : TICK_SVG;
}

function renderBenefits(){
  const list = document.getElementById('ben-list');
  if(!list) return;
  list.innerHTML = BENEFITS.map((b,i)=>{
    const safeText = (b.text||'').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    return `
    <div class="ben-row${b.on?' on':''}">
      <button class="ben-toggle${b.on?' on':''}" onclick="toggleBen(${i})"></button>
      <button class="ben-ico-btn" onclick="openIconPicker(${i},this)" title="Change icon">
        ${getBenIcon(b)}
      </button>
      <input class="ben-input" type="text" value="${safeText}"
             oninput="BENEFITS[${i}].text=this.value"
             placeholder="Type benefit text…">
      <button class="ben-del" onclick="delBenefit(${i})">
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>`;
  }).join('');
}

// ── ICON PICKER ──────────────────────────────────────────
let _pickerBenIdx = null;

function openIconPicker(i, btn){
  if(_pickerBenIdx === i && document.getElementById('ico-picker').classList.contains('open')){
    closeIconPicker(); return;
  }
  _pickerBenIdx = i;
  const picker = document.getElementById('ico-picker');
  const curId  = BENEFITS[i].iconId !== undefined ? BENEFITS[i].iconId : BENEFITS[i].id;

  document.getElementById('ico-picker-grid').innerHTML =
    [{id:'_tick', label:'Default ✓'}, ...IC_LIST].map(ic=>`
      <div class="ico-opt${curId===ic.id||(!curId&&ic.id==='_tick')?' sel':''}"
           onclick="selectBenIcon('${ic.id}')">
        <span style="width:16px;height:16px;display:flex;align-items:center;justify-content:center">
          ${ic.id==='_tick' ? TICK_SVG : IC[ic.id]||TICK_SVG}
        </span>
        <span>${ic.label}</span>
      </div>`).join('');

  const r = btn.getBoundingClientRect();
  picker.style.top  = (r.bottom + 6) + 'px';
  picker.style.left = Math.min(r.left, window.innerWidth - 240) + 'px';
  picker.classList.add('open');
  setTimeout(()=>document.addEventListener('click', outsidePickerClick, {once:true}), 20);
}

function outsidePickerClick(e){
  const p = document.getElementById('ico-picker');
  if(p && !p.contains(e.target)){ closeIconPicker(); }
  else setTimeout(()=>document.addEventListener('click', outsidePickerClick, {once:true}), 20);
}

function selectBenIcon(iconId){
  if(_pickerBenIdx === null) return;
  BENEFITS[_pickerBenIdx].iconId = (iconId === '_tick') ? null : iconId;
  closeIconPicker();
  renderBenefits();
}

function closeIconPicker(){
  const p = document.getElementById('ico-picker');
  if(p) p.classList.remove('open');
  _pickerBenIdx = null;
  _trPickerId = null;
}

function toggleBen(i){
  BENEFITS[i].on = !BENEFITS[i].on;
  renderBenefits();
}

function delBenefit(i){
  BENEFITS.splice(i,1);
  renderBenefits();
}

function addBenefit(){
  BENEFITS.push({id:'custom_'+Date.now(), on:true, text:''});
  renderBenefits();
  // focus the new input
  setTimeout(()=>{
    const inputs = document.querySelectorAll('#ben-list .ben-input');
    if(inputs.length) inputs[inputs.length-1].focus();
  }, 50);
}

// icon lookup for benefits (falls back to checkmark)
const IC_IDS = ['concierge','lounge','drinks','flexible','deposit','furniture',
                'utilities','access24','phonebooth','parking','norestore','security'];

// ══════════════════════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════════════════════
const S={photos:[],floorplan:null,partnerLogo:null,rows:[]};
let LOGO_SEP = 'x'; // 'x' | 'bar' | 'none'

function setSep(v){
  LOGO_SEP = v;
  document.querySelectorAll('.sep-opt').forEach(b=>b.classList.remove('on'));
  document.getElementById('sep-'+v).classList.add('on');
}

// ══════════════════════════════════════════════════════════
//  TABS
// ══════════════════════════════════════════════════════════
function openTab(n){
  ['loc','specs','price','media'].forEach(k=>{
    document.getElementById('p-'+k).classList.toggle('on',k===n);
    document.getElementById('t-'+k).classList.toggle('on',k===n);
  });
}

// ══════════════════════════════════════════════════════════
//  (amenities replaced by editable BENEFITS list above)
// ══════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════
//  PRICING ROWS
// ══════════════════════════════════════════════════════════
function addRow(seats='',type='',rent='',mgmt='',init='',avail=''){
  S.rows.push({id:Date.now()+Math.random(),seats,type,rent,mgmt,init,avail});
  renderRows();
}
function delRow(id){S.rows=S.rows.filter(r=>r.id!==id);renderRows();}
function upd(id,f,v){const r=S.rows.find(r=>r.id===id);if(r)r[f]=v;}
function updHtml(id,f,el){const r=S.rows.find(r=>r.id===id);if(r)r[f]=el.innerHTML;}

// Rich text commands for Initial Cost editor
function richCmd(cmd, editorId){
  const el=document.getElementById(editorId);
  if(!el)return;
  el.focus();
  if(cmd==='bold'){
    document.execCommand('bold',false,null);
  } else if(cmd==='orange'){
    const sel=window.getSelection();
    if(sel&&sel.rangeCount) document.execCommand('foreColor',false,'#FF6600');
  } else if(cmd==='black'){
    const sel=window.getSelection();
    if(sel&&sel.rangeCount) document.execCommand('foreColor',false,'#333333');
  } else if(cmd==='clear'){
    document.execCommand('removeFormat',false,null);
  }
  // Update stored HTML
  const rid=el.dataset.rowId;
  const r=S.rows.find(r=>String(r.id)===rid);
  if(r) r.init=el.innerHTML;
}

function renderRows(){
  const c=document.getElementById('pr-rows');
  if(!S.rows.length){c.innerHTML=`<p class="note-txt" style="margin-bottom:10px">No rows yet.</p>`;return;}
  c.innerHTML=S.rows.map(r=>{
    const eid=`rich-${r.id}`;
    return `
    <div class="pr-row">
      <div class="pr-head">
        <span class="pr-lbl">${ui('pr_row')}</span>
        <button class="del-btn" onclick="delRow(${r.id})">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="frow">
        <div class="field"><label class="fl">${ui('pr_seats')}</label>
          <input type="text" value="${r.seats}" onchange="upd(${r.id},'seats',this.value)" placeholder="${ui('pr_seat_ph')}"></div>
        <div class="field"><label class="fl">${ui('pr_type')}</label>
          <input type="text" value="${r.type}" onchange="upd(${r.id},'type',this.value)" placeholder="${ui('pr_type_ph')}"></div>
      </div>
      <div class="frow">
        <div class="field"><label class="fl">${ui('pr_rent')}</label>
          <input type="text" value="${r.rent}" onchange="upd(${r.id},'rent',this.value)" placeholder="${ui('pr_rent_ph')}"></div>
        <div class="field"><label class="fl">${ui('pr_mgmt')}</label>
          <input type="text" value="${r.mgmt}" onchange="upd(${r.id},'mgmt',this.value)" placeholder="${ui('pr_mgmt_ph')}"></div>
      </div>
      <div class="frow">
        <div class="field">
          <label class="fl">${ui('pr_init')} <span style="font-weight:400;color:var(--xlt);text-transform:none">${ui('pr_init_hint')}</span></label>
          <div class="rich-wrap">
            <div class="rich-toolbar">
              <button class="rich-btn" onmousedown="event.preventDefault();richCmd('bold','${eid}')"><b>B</b></button>
              <button class="rich-btn orange" onmousedown="event.preventDefault();richCmd('orange','${eid}')">● Orange</button>
              <button class="rich-btn" onmousedown="event.preventDefault();richCmd('black','${eid}')" style="color:#333">● Black</button>
              <button class="rich-btn" onmousedown="event.preventDefault();richCmd('clear','${eid}')" title="Clear all formatting">✕ Clear</button>
            </div>
            <div class="rich-editor" id="${eid}" contenteditable="true"
                 data-row-id="${r.id}"
                 oninput="updHtml(${r.id},'init',this)"
                 placeholder="${ui('pr_init_ph')}">${r.init||''}</div>
          </div>
        </div>
        <div class="field"><label class="fl">${ui('pr_avail')}</label>
          <input type="text" value="${r.avail}" onchange="upd(${r.id},'avail',this.value)" placeholder="${ui('pr_avail_ph')}"></div>
      </div>
    </div>`;
  }).join('');
}

// ══════════════════════════════════════════════════════════
//  MEDIA UPLOADS
// ══════════════════════════════════════════════════════════
function onPhotos(e){
  const files=Array.from(e.target.files).slice(0,3);S.photos=[];
  const c=document.getElementById('ph-thumbs');c.innerHTML='';
  files.forEach((f,i)=>{
    const r=new FileReader();
    r.onload=ev=>{
      S.photos[i]=ev.target.result;
      const d=document.createElement('div');d.className='thumb';
      d.innerHTML=`<img src="${ev.target.result}"><button class="trm" onclick="rmPhoto(${i})">✕</button>`;
      c.appendChild(d);
    };
    r.readAsDataURL(f);
  });
}
function rmPhoto(i){S.photos.splice(i,1);document.querySelectorAll('#ph-thumbs .thumb')[i]?.remove();}

function onFloorplan(e){
  const f=e.target.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=ev=>{
    S.floorplan=ev.target.result;
    document.getElementById('fp-prev').innerHTML=
      `<img src="${ev.target.result}" style="max-width:100%;max-height:110px;border-radius:8px;border:1px solid var(--bd);">`;
  };
  r.readAsDataURL(f);
}

function onPartnerLogo(e){
  const f=e.target.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=ev=>{
    S.partnerLogo=ev.target.result;
    document.getElementById('pl-prev').innerHTML=
      `<img src="${ev.target.result}" style="max-height:44px;border-radius:6px;border:1px solid var(--bd);">`;
  };
  r.readAsDataURL(f);
}


function showStatus(m,t){
  document.getElementById('fetch-status').innerHTML=`<div class="smsg ${t}">${m}</div>`;
}

// ══════════════════════════════════════════════════════════
//  JSON LOCATION LIBRARY
// ══════════════════════════════════════════════════════════
const LIB_KEY = 'co_location_library';

// Load library from localStorage
function getLib(){ try{ return JSON.parse(localStorage.getItem(LIB_KEY)||'[]'); }catch{ return []; } }
function saveLib(lib){ localStorage.setItem(LIB_KEY, JSON.stringify(lib)); }

// Upload JSON files → add to library
function loadJsonFiles(e){
  const files = Array.from(e.target.files).filter(f=>f.name.endsWith('.json'));
  if(!files.length) return;
  _ingestFiles(files);
  e.target.value = '';
}

// Core ingestion — used by both file upload and folder drop
function _ingestFiles(files){
  const lib = getLib();
  let done = 0, ok = 0;
  files.forEach(file=>{
    const reader = new FileReader();
    reader.onload = ev=>{
      try{
        const data = JSON.parse(ev.target.result);
        if(!data.name) throw new Error('Missing name');
        const n = typeof data.name==='object'?data.name.en:data.name;
        const idx = lib.findIndex(l=>{ const a=typeof l.name==='object'?l.name.en:l.name; return a===n; });
        if(idx>=0) lib[idx]=data; else lib.push(data);
        ok++;
      }catch(err){ console.warn(file.name, err.message); }
      if(++done===files.length){
        saveLib(lib);
        showStatus(`✅ ${ok} of ${files.length} file${files.length>1?'s':''} loaded — library has ${lib.length} location${lib.length!==1?'s':''}.`, 's-ok');
        updateLibStatus();
        renderJsonDropdown(lib, document.getElementById('json-search').value);
      }
    };
    reader.readAsText(file);
  });
}


function clearJsonLib(){
  if(!confirm('Clear all saved locations from the library?')) return;
  localStorage.removeItem(LIB_KEY);
  renderJsonDropdown([], '');
  updateLibStatus();
  showStatus('Library cleared.','s-info');
}

// Filter the dropdown by search query
function filterJsonLib(q){
  const lib = getLib();
  renderJsonDropdown(lib, q);
  showJsonDropdown();
}

function renderJsonDropdown(lib, q=''){
  const dd = document.getElementById('json-dropdown');
  const filtered = lib.filter(l=>
    !q || l.name.toLowerCase().includes(q.toLowerCase()) ||
    (l.city||'').toLowerCase().includes(q.toLowerCase())
  );
  if(!filtered.length){
    dd.innerHTML = `<div class="json-opt" style="color:var(--xlt);cursor:default">
      ${lib.length ? 'No matches' : 'No saved locations — upload JSON files below'}
    </div>`;
  } else {
  dd.innerHTML = filtered.map((l,i)=>{
      const displayName = typeof l.name==='object' ? (l.name[LANG]||l.name.en||Object.values(l.name)[0]) : l.name;
      return `
      <div class="json-opt" onmousedown="loadFromLib(${lib.indexOf(l)})">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        ${displayName}
        <span class="json-city">${l.city||''}</span>
      </div>`;
    }).join('');
  }
}

function showJsonDropdown(){
  const lib = getLib();
  renderJsonDropdown(lib, document.getElementById('json-search').value);
  document.getElementById('json-dropdown').classList.add('open');
}
function hideJsonDropdown(){
  document.getElementById('json-dropdown').classList.remove('open');
}

let LAST_LOCATION = null; // tracks last loaded JSON location

function loadFromLib(idx){
  const lib = getLib();
  const p = lib[idx];
  if(!p) return;
  LAST_LOCATION = p;
  applyLocationData(p);
  document.getElementById('json-search').value = typeof p.name==='object' ? (p.name.en||Object.values(p.name)[0]) : p.name;
  hideJsonDropdown();
  showStatus(`✅ "${typeof p.name==='object'?(p.name.en||Object.values(p.name)[0]):p.name}" loaded from library.`,'s-ok');
  gen();
}

// Core function: fill all fields from a data object
function applyLocationData(p){
  // Resolve a field — if it's a {en,zh-hant,zh-hans,ja} object pick current lang, else use as-is
  const r = v => {
    if(v && typeof v === 'object' && !Array.isArray(v)){
      return v[LANG] || v.en || v['zh-hant'] || v['zh-hans'] || v.ja || '';
    }
    return v || '';
  };

  const sv=(id,v)=>{const val=r(v);if(val){const el=document.getElementById(id);if(el)el.value=val;}};
  sv('n-main', p.name);
  sv('addr',   p.address);
  sv('floor',  p.floor);
  sv('purl',   p.page_url||p.url||'');

  // City — plain string only (city names are universal)
  const cityVal = r(p.city);
  if(cityVal){
    const sel=document.getElementById('city');
    for(const o of sel.options) if(o.text.toLowerCase()===cityVal.toLowerCase()){sel.value=o.value;break;}
  }

  // Transport — supports {en:[…], ja:[…]} OR a plain array
  const trRaw = p.transport || [p.transport1, p.transport2].filter(Boolean);
  const trArr = Array.isArray(trRaw) ? trRaw : (trRaw[LANG] || trRaw.en || trRaw.ja || []);
  if(trArr.length){ initTransport(trArr); renderTransport(); }

  // Specs — each value can be a plain string or {en,zh-hant,zh-hans,ja}
  const sp = p.specs||{};
  sv('s-struct', sp.structure   || p.structure);
  sv('s-comp',   sp.completion  || p.completion);
  sv('s-ceil',   sp.ceiling     || p.ceiling);
  sv('s-fa',     sp.floor_area  || p.floor_area);
  sv('s-ca',     sp.common_area || p.common_area);
  sv('s-oa',     sp.oa          || p.oa);
  sv('s-el',     sp.elevators   || p.elevators);
  sv('s-ac',     sp.ac          || p.ac);
  sv('s-net',    sp.network     || p.network);
  sv('s-fac',    sp.facilities  || p.facilities);
  sv('s-hrs',    sp.hours       || p.hours);
  sv('s-park',   sp.parking     || p.parking);

  // Custom info block — supports multilingual strings
  sv('custom-title', p.custom_title);
  const customBodyVal = r(p.custom_body);
  if(customBodyVal){
    const cbe = document.getElementById('custom-body-editor');
    if(cbe) cbe.innerHTML = customBodyVal;
    const cbh = document.getElementById('custom-body');
    if(cbh) cbh.value = customBodyVal;
  }

  // Pricing — each row field supports multilingual too
  if(p.pricing?.length){
    S.rows=[];
    p.pricing.filter(row=>row.seats||row.rent).forEach(row=>
      addRow(r(row.seats)||'', r(row.type)||'', r(row.rent)||'',
             r(row.mgmt)||'',  r(row.init)||'', r(row.avail||row.available)||'')
    );
  }

  // Partner logo from URL
  if(p.partner_logo_url){
    showStatus('Loading partner logo…','s-info');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = ()=>{
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      canvas.getContext('2d').drawImage(img,0,0);
      S.partnerLogo = canvas.toDataURL();
      document.getElementById('pl-prev').innerHTML =
        `<img src="${S.partnerLogo}" style="max-height:44px;border-radius:6px;border:1px solid var(--bd);">`;
      gen();
    };
    img.onerror = ()=>{
      // Fallback: use URL directly (works if CORS allows it)
      S.partnerLogo = p.partner_logo_url;
      document.getElementById('pl-prev').innerHTML =
        `<img src="${S.partnerLogo}" style="max-height:44px;border-radius:6px;border:1px solid var(--bd);" onerror="this.style.opacity='.3'">`;
      gen();
    };
    img.src = p.partner_logo_url;
  }

  // Logo separator
  if(p.logo_separator && ['x','bar','none'].includes(p.logo_separator)){
    setSep(p.logo_separator);
  }

  // Amenity icons toggle
  if(p.amenities){
    AMENITY_ICONS.forEach(a=>{ a.on = p.amenities.includes(a.id); });
    renderAmenities();
  }

  // Benefits on/off
  if(p.benefits_on){
    BENEFITS.forEach(b=>{ b.on = p.benefits_on.includes(b.id); });
    renderBenefits();
  }
}

// ══════════════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════════════
const g=id=>(document.getElementById(id)||{}).value||'';

// ══════════════════════════════════════════════════════════
//  GENERATE SLIDES  — Page 1 + Page 2
// ══════════════════════════════════════════════════════════
function gen(){
  const name   = g('n-main')||'Location Name';
  const addr   = g('addr');
  const city   = g('city')||'Hong Kong';
  const floor  = g('floor');
  const purl   = g('purl');
  const trLines= TRANSPORT.filter(t=>t.text.trim());

  const specRows=[
    g('s-struct') && {k:sl('struct'), v:g('s-struct')},
    g('s-comp')   && {k:sl('comp'),   v:g('s-comp')},
    (g('s-fa')||g('s-ca')) && {k:sl('area'), v:[g('s-fa'),g('s-ca')].filter(Boolean).join(' · ')},
    (g('s-ceil')||g('s-oa')) && {k:sl('ceiling'), v:[g('s-ceil'),g('s-oa')].filter(Boolean).join(' · ')},
    g('s-ac')     && {k:sl('ac'),    v:g('s-ac')},
    g('s-net')    && {k:sl('net'),   v:g('s-net')},
    (g('s-el')||g('s-hrs')) && {k:sl('lifts'), v:[g('s-el'),g('s-hrs')].filter(Boolean).join(' · ')},
    g('s-fac')    && {k:sl('fac'),   v:g('s-fac')},
    g('s-park')   && {k:sl('park'),  v:g('s-park')},
  ].filter(Boolean);

  const checked     = BENEFITS.filter(b=>b.on);
  const amenChecked = AMENITY_ICONS.filter(a=>a.on);
  const bTitle = {en:'Benefits','zh-hant':'使用優點','zh-hans':'使用优点',ja:'ご利用のメリット'}[LANG]||'Benefits';
  const pHdr = {
    en:        {seats:'Seats',type:'Type',rent:'Monthly Rent',mgmt:'Mgmt Fee',init:'Initial Cost',avail:'Available'},
    'zh-hant': {seats:'席位',type:'類型',rent:'月租',mgmt:'管理費',init:'初始費用',avail:'可入駐'},
    'zh-hans': {seats:'席位',type:'类型',rent:'月租',mgmt:'管理费',init:'初始费用',avail:'可入驻'},
    ja:        {seats:'席数',type:'タイプ',rent:'月額賃料',mgmt:'共益管理費',init:'初期費用',avail:'入居可能時期'},
  }[LANG]||{seats:'Seats',type:'Type',rent:'Monthly Rent',mgmt:'Mgmt Fee',init:'Initial Cost',avail:'Available'};

  const nSpecs   = specRows.length;
  const nPricing = S.rows.length;

  // Smart spec columns
  const hasExtra = trLines.length>0||amenChecked.length>0;
  let cols, sizeKey;
  if      (nSpecs<=3 && nPricing===0)             {cols=1;sizeKey='lg';}
  else if (nSpecs<=4 && nPricing<=1 && !hasExtra) {cols=1;sizeKey='lg';}
  else if (nSpecs<=5 && nPricing<=1)              {cols=2;sizeKey='md';}
  else if (nSpecs<=6 && nPricing<=2)              {cols=2;sizeKey='md';}
  else if (nSpecs<=6 && nPricing<=3)              {cols=3;sizeKey='sm';}
  else if (nSpecs<=8 && nPricing<=2)              {cols=3;sizeKey='sm';}
  else                                             {cols=4;sizeKey='xs';}

  const specGridHTML = specRows.length ? `
    <div class="sl-specs-grid" data-size="${sizeKey}"
         style="grid-template-columns:repeat(${cols},1fr)">
      ${specRows.map(s=>`
        <div class="sl-spec-card">
          <div class="sl-spec-lbl">${s.k}</div>
          <div class="sl-spec-val">${s.v}</div>
        </div>`).join('')}
    </div>` : '';

  const fpFlex = nPricing>=3?'0 0 32%':nPricing>=1?'0 0 38%':'0 0 44%';

  const noph=(bg='#EEEEEE')=>`<div class="noph" style="background:${bg}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width=".8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`;

  const sepHtml = S.partnerLogo ? (()=>{
    if(LOGO_SEP==='x')   return `<span class="sl-logo-sep">×</span>`;
    if(LOGO_SEP==='bar') return `<span class="sl-logo-sep" style="font-size:.8em">|</span>`;
    return `<span style="width:.4em"></span>`;
  })() : '';

  // ── Calculate --fs ──────────────────────────────────────
  // A4 at 96dpi = 1122px wide. We want ~16px real text at A4.
  // Preview slide width drives the scale.
  const slideWrap = document.querySelector('.slide-wrap');
  const previewW  = slideWrap ? slideWrap.offsetWidth : 600;
  // Scale: 16px is for 1122px. At 600px preview → 16*600/1122 = 8.6px
  // That's too small. Add a boost: the preview should look "like A4" not tiny.
  // Multiply by 1.5 to compensate for the preview being smaller than real A4
  const rawFs = previewW / 1122 * 16 * 1.5;
  // Density: fewer items → scale up more (sparse layouts use bigger text)
  const total = nSpecs+(nPricing*2)+trLines.length+checked.length+amenChecked.length;
  const dScale = total<=8?1.1 : total<=15?1.0 : total<=22?0.9 : 0.82;
  const fsNum  = Math.max(10, Math.min(18, rawFs * dScale));
  const fsVal  = fsNum.toFixed(1)+'px';

  // ── Build shared top bar HTML (reused for both pages) ──
  const topBarHTML=(pg)=>`
  <div class="${pg===2?'p2-top':'sl-top'}">
    <div class="sl-logos">
      <div class="sl-cologo">
        <img src="https://www.compassoffices.com/wp-content/themes/compass-offices/assets/images/compassoffices-logo-web-all-in-one-2025_ob.svg"
             onerror="this.style.display='none';this.nextSibling.style.display='block'">
        <span class="sl-cologo-fb" style="display:none">COMPASS OFFICES</span>
      </div>
      ${S.partnerLogo?`${sepHtml}<div class="sl-partner"><img src="${S.partnerLogo}"></div>`:''}
    </div>
    <div class="sl-title-block">
      <div class="sl-title">
        ${name}${floor?` <span class="sl-floor-inline" style="font-size:calc(var(--fs)*0.82);vertical-align:middle;position:relative;top:-.05em">${floor}</span>`:''}
      </div>
      ${addr?`<div class="sl-addr-row"><div class="sl-addr">${addr}</div></div>`:''}
    </div>
    <div class="sl-meta"><div class="sl-city">${city}</div></div>
  </div>`;

  // ══════════════════════════════
  //  PAGE 1
  // ══════════════════════════════
  const page1El = document.getElementById('slide');
  page1El.style.setProperty('--fs', fsVal);

  // Smart: how many amenity rows do we need at 4-per-row?
  const amenRows = Math.ceil(amenChecked.length / 4);
  // If many amenities, reduce photo area slightly
  const photoAreaFlex = amenRows >= 3 ? '1 1 55%' : amenRows === 2 ? '1 1 62%' : '1 1 70%';

  page1El.innerHTML = `
  ${topBarHTML(1)}

  <div class="sl-body">

    <!-- LEFT: 3 equal stacked photos + amenity icon grid -->
    <div class="sl-photos">
      <div class="sl-ph-stack" style="flex:${photoAreaFlex}">
        <div class="sl-ph-cell">
          ${S.photos[0]?`<img src="${S.photos[0]}">`:`${noph()}`}
        </div>
        <div class="sl-ph-cell">
          ${S.photos[1]?`<img src="${S.photos[1]}">`:`${noph('#E0E0E0')}`}
        </div>
        <div class="sl-ph-cell">
          ${S.photos[2]?`<img src="${S.photos[2]}">`:`${noph('#E8E8E8')}`}
        </div>
      </div>
      ${amenChecked.length?`
      <div class="sl-amen-below">
        <div class="sl-amen-below-grid">
          ${amenChecked.map(a=>`
            <div class="sl-amen-cell" title="${amenLabel(a)}">
              ${IC[a.id]||IC.norestore}
              <span>${amenLabel(a).split(' ')[0].slice(0,7)}</span>
            </div>`).join('')}
        </div>
      </div>`:''}
    </div>

    <!-- CENTRE: Specs + transport only -->
    <div class="sl-specs">
      <div class="sl-specs-inner">
        ${specRows.length?`
        <div class="sl-section ${trLines.length?'shrink':'grow'}">
          <div class="sl-sec">${sl('specs')}</div>
          ${specGridHTML}
        </div>`:''}
        ${trLines.length?`
        <div class="sl-section shrink">
          <div class="sl-sec">${sl('transport')}</div>
          <div class="sl-trans-grid" style="grid-template-columns:${trLines.length===1?'1fr':'1fr 1fr'}">
            ${trLines.map(t=>{
              const iconInner=(IC[t.iconId]||IC.tr_metro).match(/<svg[^>]*>([\s\S]*?)<\/svg>/)?.[1]||'';
              return `<div class="sl-trans">
                <svg class="sl-ticon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${iconInner}</svg>
                <span class="sl-trans-txt">${t.text}</span>
              </div>`;
            }).join('')}
          </div>
        </div>`:''}
        ${(g('custom-title')||(document.getElementById('custom-body-editor')?.innerHTML||'').trim())?`
        <div class="sl-section shrink">
          <div class="sl-custom-block">
            ${g('custom-title')?`<div class="sl-custom-title">${g('custom-title')}</div>`:''}
            ${(()=>{const el=document.getElementById('custom-body-editor');const html=(el?.innerHTML||'').trim();return html&&html!=='<br>'?`<div class="sl-custom-body">${html}</div>`:''})()}
          </div>
        </div>`:''}
      </div>
    </div>

    <!-- RIGHT: Floor plan + Benefits below -->
    <div class="sl-right">
      <div class="sl-fp" style="flex:${fpFlex}">
        ${S.floorplan
          ?`<img src="${S.floorplan}" style="width:100%;height:100%;object-fit:contain;display:block;">`
          :`<div class="sl-fp-ph">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width=".8"
                  style="width:32%;opacity:.15;display:block;margin:0 auto 6px">
               <rect x="3" y="3" width="18" height="18" rx="2"/>
               <line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/>
               <line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>
             </svg>
             Floor Plan
           </div>`}
      </div>
      ${checked.length?`
      <div class="sl-merits-wrap">
        <div class="sl-merits-ttl">${bTitle}</div>
        <ul class="sl-merits">
          ${checked.map(b=>{
            const inner=getBenIcon(b).match(/<svg[^>]*>([\s\S]*?)<\/svg>/)?.[1]||'';
            // Scale font down for longer text — keep to single line
            // Base 0.82em. At ~40 chars starts shrinking. At 80+ chars hits min 0.52em.
            const len = b.text.length;
            const fScale = len <= 38 ? 0.82
                         : len <= 50 ? 0.74
                         : len <= 62 ? 0.65
                         : len <= 75 ? 0.58
                         : 0.52;
            return `<li class="sl-merit">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>
              <span style="font-size:calc(var(--fs)*${fScale})">${b.text}</span>
            </li>`;
          }).join('')}
        </ul>
      </div>`:'' }
    </div>

  </div>

  <!-- FOOTER: Pricing -->
  <div class="sl-foot">
    ${S.rows.length?`
    <table class="sl-ptbl">
      <thead><tr>
        <th>${pHdr.seats}</th><th>${pHdr.type}</th><th>${pHdr.rent}</th>
        <th>${pHdr.mgmt}</th><th>${pHdr.init}</th><th>${pHdr.avail}</th>
      </tr></thead>
      <tbody>${S.rows.map(r=>`<tr>
        <td>${r.seats}</td><td>${r.type}</td><td class="acc">${r.rent}</td>
        <td>${r.mgmt}</td><td class="init-cell">${r.init||''}</td><td>${r.avail}</td>
      </tr>`).join('')}</tbody>
    </table>`
    :`<p style="font-size:.65em;color:#CCC">Add pricing rows in the Pricing tab</p>`}
    ${purl?`<div class="sl-url">${purl}</div>`:''}
  </div>`;

  // ══════════════════════════════
  //  PAGE 2 — floor plan + photos + amenities
  // ══════════════════════════════
  const page2El = document.getElementById('slide2');
  page2El.style.setProperty('--fs', fsVal);

  const noph2=(bg='#E8E8E8')=>`<div class="p2-noph" style="background:${bg}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width=".8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`;

  page2El.innerHTML = `
  ${topBarHTML(2)}
  <div class="p2-body">

    <!-- Floor plan — large, left -->
    <div class="p2-fp-area">
      ${S.floorplan
        ?`<img class="p2-fp" src="${S.floorplan}">`
        :`<div class="p2-fp-ph">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width=".8"
                 style="width:60px;height:60px;opacity:.18;display:block;">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/>
              <line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>
            </svg>
            <span>Upload a floor plan in the Media tab</span>
          </div>`}
    </div>

    <!-- Right: 3 photos stacked + amenity icons -->
    <div class="p2-right">
      <div class="p2-photos">
        <div class="p2-ph-cell">
          ${S.photos[0]?`<img src="${S.photos[0]}">`:`${noph2()}`}
        </div>
        <div class="p2-ph-cell">
          ${S.photos[1]?`<img src="${S.photos[1]}">`:`${noph2('#DCDCDC')}`}
        </div>
        <div class="p2-ph-cell">
          ${S.photos[2]?`<img src="${S.photos[2]}">`:`${noph2('#E4E4E4')}`}
        </div>
      </div>
      ${amenChecked.length?`
      <div class="p2-amen">
        <div class="p2-amen-grid">
          ${amenChecked.map(a=>`
            <div class="p2-amen-cell" title="${amenLabel(a)}">
              ${IC[a.id]||IC.norestore}
              <span>${amenLabel(a).split(' ')[0].slice(0,7)}</span>
            </div>`).join('')}
        </div>
      </div>`:''}
    </div>

  </div>
  ${purl?`<div class="p2-foot"><div class="p2-url">${purl}</div></div>`:''}`;
}


// ══════════════════════════════════════════════════════════
//  PRINT
// ══════════════════════════════════════════════════════════
function printSlide(){
  const styles  = document.querySelector('style').textContent;
  const page1El = document.getElementById('slide');
  const page2El = document.getElementById('slide2');
  // Calculate print --fs based on full A4 width (1122px at 96dpi)
  const previewW = document.querySelector('.slide-wrap')?.offsetWidth || 620;
  // Same formula as gen() but for full 1122px width, no preview boost
  const printFs = Math.max(13, Math.min(19, 16 * 1122 / previewW)).toFixed(1) + 'px';

  const w = window.open('','_blank');
  w.document.write(`<!DOCTYPE html><html><head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@300;400;500;600;700;800&family=Noto+Sans+JP:wght@300;400;500;700&family=Noto+Sans+TC:wght@300;400;500;700&display=swap" rel="stylesheet">
<style>
@page{ size:A4 landscape; margin:0; }
*,*::before,*::after{ box-sizing:border-box; margin:0; padding:0; }
html,body{ width:297mm; }
/* Each slide = exactly one A4 page */
.page-wrap{
  width:297mm; height:210mm;
  overflow:hidden;
  page-break-after:always;
  break-after:page;
}
.page-wrap:last-child{ page-break-after:avoid; break-after:avoid; }
.slide,.slide2{
  --fs:${printFs}!important;
  width:297mm!important; height:210mm!important;
  aspect-ratio:unset!important; border-radius:0!important;
  border:none!important; box-shadow:none!important;
  font-size:var(--fs)!important;
}
${styles}
</style>
</head><body>
<div class="page-wrap">
  <div class="slide">${page1El.innerHTML}</div>
</div>
<div class="page-wrap">
  <div class="slide2">${page2El.innerHTML}</div>
</div>
</body></html>`);
  w.document.close();
  w.onload = ()=> setTimeout(()=> w.print(), 900);
}

// ══════════════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════════════
function updateSlideFS(){
  const wrap = document.querySelector('.slide-wrap');
  if(!wrap) return;
  const w = wrap.offsetWidth;
  // Target: 16px at A4 full width (1122px). Preview is narrower so we boost x1.5
  // so it looks proportionally right on screen, not tiny.
  const fs = Math.max(10, Math.min(18, w / 1122 * 16 * 1.5));
  const val = fs.toFixed(1)+'px';
  const s1 = document.getElementById('slide');
  const s2 = document.getElementById('slide2');
  if(s1) s1.style.setProperty('--fs', val);
  if(s2) s2.style.setProperty('--fs', val);
}
window.addEventListener('resize', updateSlideFS);
updateSlideFS();

initBenefits('en');
renderBenefits();
renderAmenities();
renderRows();
applyI18n();
renderJsonDropdown(getLib());
updateLibStatus();
// Auto-load from json/ folder if hosted on a server
(async()=>{
  try{
    const base = location.href.replace(/[^/]*$/, '');
    if(location.protocol==='file:') return; // skip for local file usage
    const idxRes = await fetch(base+'json/index.json',{cache:'no-cache'});
    if(!idxRes.ok) return;
    const index = await idxRes.json();
    if(!Array.isArray(index)||!index.length) return;
    const lib = getLib();
    let changed = false;
    await Promise.all(index.map(async fn=>{
      try{
        const r = await fetch(base+'json/'+fn,{cache:'no-cache'});
        if(!r.ok) return;
        const data = await r.json();
        if(!data.name) return;
        const n = typeof data.name==='object'?data.name.en:data.name;
        const i = lib.findIndex(l=>{ const a=typeof l.name==='object'?l.name.en:l.name; return a===n; });
        if(i>=0) lib[i]=data; else lib.push(data);
        changed = true;
      }catch{}
    }));
    if(changed){ saveLib(lib); renderJsonDropdown(lib,''); updateLibStatus(); }
  }catch{}
})();
addTransport('MTR Central Station — direct access','tr_metro');
addTransport('Central Ferry Piers — 3 min walk','tr_ferry');