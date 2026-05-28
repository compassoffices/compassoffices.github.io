// Compass Offices One-Pager Builder
// https://github.com/compassoffices/compassoffices.github.io

let LANG = 'en';
let CLIENT_NAME = '';  // contact person name — auto-fills email To field
let COMPANY_NAME = ''; // client company name — used in filenames, email, proposal header

// ══════════════════════════════════════════════════════════
//  PER-LANGUAGE FORM DATA STORE
//  Each language tab has independent form content.
//  On switch: save current lang → load new lang.
// ══════════════════════════════════════════════════════════
const LANG_KEYS = ['en','zh-hant','zh-hans','ja'];
const TEXT_FIELD_IDS = ['n-main','addr','floor','city','purl','custom-title','matterport'];
const RICH_FIELD_IDS = ['s-struct','s-comp','s-ceil','s-fa','s-ca','s-oa','s-el',
                        's-ac','s-net','s-fac','s-hrs','s-park'];

// Storage: one entry per language
const LANG_DATA = {};
LANG_KEYS.forEach(lc => { LANG_DATA[lc] = null; }); // null = never saved

function saveLangData(lc){
  const data = {
    fields: {},
    richFields: {},
    customBody: document.getElementById('custom-body-editor')?.innerHTML || '',
    transport: TRANSPORT.map(t => ({id:t.id, iconId:t.iconId, text:t.text})),
    // NOTE: S.rows is intentionally NOT saved per-language.
    // Pricing rows are global and persist across all language switches.
    benefits: BENEFITS.map(b => ({...b})),
    amenities: AMENITY_ICONS.map(a => a.on),
    benPos: BENEFITS_POS,
    customPos: CUSTOM_POS,
  };
  TEXT_FIELD_IDS.forEach(id => {
    const el = document.getElementById(id);
    if(el) data.fields[id] = el.value || '';
  });
  RICH_FIELD_IDS.forEach(id => {
    const el = document.getElementById(id);
    if(el) data.richFields[id] = el.innerHTML || '';
  });
  LANG_DATA[lc] = data;
}

function loadLangData(lc){
  const data = LANG_DATA[lc];
  if(!data) return false; // nothing saved yet for this lang

  // Restore text fields
  TEXT_FIELD_IDS.forEach(id => {
    const el = document.getElementById(id);
    if(el && data.fields[id] !== undefined) el.value = data.fields[id];
  });
  // Restore rich spec fields
  RICH_FIELD_IDS.forEach(id => {
    const el = document.getElementById(id);
    if(el && data.richFields[id] !== undefined) el.innerHTML = data.richFields[id];
  });
  // Restore custom body
  const cbe = document.getElementById('custom-body-editor');
  if(cbe && data.customBody !== undefined) cbe.innerHTML = data.customBody;

  // Restore transport
  if(data.transport) {
    TRANSPORT = data.transport.map(t => ({...t}));
    renderTransport();
  }
  // NOTE: S.rows is intentionally NOT restored from per-language data.
  // Pricing rows are global — they persist across all language switches.
  // (Rows are only set via direct actions: add/remove row, JSON import, snapshot restore)
  // Restore benefits
  if(data.benefits) {
    BENEFITS = data.benefits.map(b => ({...b}));
    renderBenefits();
  }
  // Restore amenity toggles
  if(data.amenities) {
    AMENITY_ICONS.forEach((a,i) => { if(data.amenities[i] !== undefined) a.on = data.amenities[i]; });
    renderAmenities();
  }
  // Restore layout positions
  if(data.benPos) setBenPos(data.benPos);
  if(data.customPos) setCustomPos(data.customPos);

  return true;
}

function clearLangFields(){
  TEXT_FIELD_IDS.forEach(id => {
    const el = document.getElementById(id);
    if(el) el.value = '';
  });
  RICH_FIELD_IDS.forEach(id => {
    const el = document.getElementById(id);
    if(el) el.innerHTML = '';
  });
  const cbe = document.getElementById('custom-body-editor');
  if(cbe) cbe.innerHTML = '';
  TRANSPORT = [];
  S.rows = [];
  renderTransport();
  renderRows();
}

const L = {
  en:{name:'Name',addr:'Address',struct:'Structure',comp:'Completion',ceil:'Ceiling Height',fa:'Floor Area',ca:'Common Area',el:'Elevators',ac:'AC System',net:'Network',fac:'Facilities',hrs:'Access Hours',park:'Parking',benefits:'Benefits'},
  'zh-hant':{name:'名稱',addr:'地址',struct:'結構',comp:'竣工',ceil:'天花板高度',fa:'樓面面積',ca:'公共區域',el:'電梯',ac:'空調系統',net:'網絡環境',fac:'公共設施',hrs:'使用時間',park:'停車場',benefits:'使用優點'},
  'zh-hans':{name:'名称',addr:'地址',struct:'结构',comp:'竣工',ceil:'天花板高度',fa:'楼面面积',ca:'公共区域',el:'电梯',ac:'空调系统',net:'网络环境',fac:'公共设施',hrs:'使用时间',park:'停车场',benefits:'使用优点'},
  ja:{name:'名称',addr:'住所',struct:'構造',comp:'竣工年月',ceil:'天井高',fa:'基準階面積',ca:'共用部面積',el:'エレベーター',ac:'空調',net:'ネット環境',fac:'共用部概要',hrs:'使用時間',park:'駐車場',benefits:'ご利用のメリット'},
};
const SL = {
  en:{struct:'Structure',comp:'Completion',area_fa:'Floor Area',area_ca:'Common Area',ceiling:'Ceiling',oa:'OA Floor',ac:'AC',net:'Network',lifts:'Lifts',hrs:'Access Hours',fac:'Facilities',park:'Parking',transport:'Transport',amenities:'Amenities',specs:'Building Specs'},
  'zh-hant':{struct:'結構',comp:'竣工',area_fa:'樓面面積',area_ca:'公共區域',ceiling:'天花高度',oa:'OA地板',ac:'空調',net:'網絡',lifts:'電梯',hrs:'使用時間',fac:'公共設施',park:'停車場',transport:'交通',amenities:'設施優點',specs:'樓宇設施概要'},
  'zh-hans':{struct:'结构',comp:'竣工',area_fa:'楼面面积',area_ca:'公共区域',ceiling:'天花高度',oa:'OA地板',ac:'空调',net:'网络',lifts:'电梯',hrs:'使用时间',fac:'公共设施',park:'停车场',transport:'交通',amenities:'设施优点',specs:'楼宇设施概要'},
  ja:{struct:'構造',comp:'竣工年月',area_fa:'基準階面積',area_ca:'共用部面積',ceiling:'天井高',oa:'OAフロア',ac:'空調',net:'ネット環境',lifts:'EV台数',hrs:'使用時間',fac:'共用部概要',park:'駐車場',transport:'アクセス',amenities:'設備概要',specs:'ビル・設備概要'},
};
function sl(k){return(SL[LANG]||SL.en)[k]||k;}
function l(k){return(L[LANG]||L.en)[k]||k;}

const UI = {
  en:{tab_loc:'Location',tab_specs:'Specs',tab_price:'Pricing',tab_media:'Media',lbl_company_name:'Proposal For',hint_company_name:'Used in filename, PDF export & email — not shown on slides',lbl_client_name:'Client Name',hint_client_name:'For email template — not shown on slides',sec_name_loc:'Name & Location',lbl_city:'City',lbl_floor:'Floor / Unit',sec_transport:'Transport Access',note_transport:'Add lines, pick icon, edit text. Displayed in 2-column grid on slide.',btn_add_transport:'Add Transport Line',lbl_purl:'Page URL (footer)',note_specs:'Auto-filled when you Fetch. Edit any field freely.',sec_bldg:'Building Details',lbl_oa:'OA Floor',sec_pricing:'Pricing Rows',btn_add_pricing:'+ Add Pricing Row',sec_amenities:'Amenities',note_amenities:'Toggle which icons appear in the amenity grid.',note_benefits:'Toggle on/off · Click text to edit · Add your own lines.',btn_add_benefit:'Add Benefit',sec_logos:'Header Logos',lbl_co_logo:'Compass Offices Logo',lbl_always_shown:'(always shown)',lbl_sep:'Logo Separator',lbl_partner_logo:'Partner / Building Logo',btn_upload_partner:'Upload partner logo',hint_partner:'Shown beside Compass Offices logo',sec_photos:'Location Photos',btn_upload_photos:'Upload photos (max 3)',hint_photos:'1st = hero · 2nd & 3rd = thumbnails',sec_floorplan:'Floor Plan',btn_upload_fp:'Upload floor plan',hint_fp:'Any size — fits inside rounded box',btn_generate:'Refresh Preview',btn_print:'Print / Save PDF',btn_new_card:'Start a New Proposal',tt_new_card:'Clear the form and start a new proposal (queued items are kept)',btn_save_card:'Save Proposal',tt_save_card:'Save this proposal — downloads a .json file you can re-import anytime via Insert Saved Proposal in the Location Library',tt_chrome:'Tip — for the most stable experience, we recommend using Google Chrome. A few features (PDF print, file uploads, sharing) may behave differently in Safari or Firefox.',lookup_pick_region:'Pick a region above to load offices',lookup_pick_region_hint:'Then choose a centre to filter further',lookup_loading:'Loading offices…',lookup_load_failed:'Could not load offices for this region',lookup_multifloor_hint:'Multiple floors available — click a floor button below to filter',queue_added_cleared:'✓ "{name}" added to queue ({n}) — form cleared for the next proposal',ios_tip_title:'Hide the URL &amp; date in your PDF',ios_tip_step1:'Tap <b>Print / Save PDF</b> below',ios_tip_step2:'<b>Pinch-zoom</b> the page preview to expand it',ios_tip_step3:'Tap the menu icon (• • •) at the top',ios_tip_step4:'Turn off <b>Headers and Footers</b>',ios_tip_footer:'iOS remembers this — once is enough.',ios_tip_dismiss:"Got it, don't show again",fp_3d_label:'View',fp_3d_hint:'3D variant detected',fp_3d_2d_tt:'Standard 2D floor plan',fp_3d_3d_tt:'3D-styled floor plan (same layout, different rendering)',compass_label:'Compass',compass_hint:'Bottom-left of floor plan on page 2',tt_queue_add:'Add this card to the queue — combine multiple locations into one PDF or email',tt_queue_open:'Open the queue panel',btn_download_pdf:'↓ JPG',btn_print_short:'Print',lbl_page1:'Page 1 — Overview',lbl_page2:'Page 2 — Floor Plan & Amenities',empty_hint1:'Select a location from the library or fill the form',empty_hint2:'Or fill the form — preview updates automatically',empty_p2:'Floor Plan + Amenities',empty_p2_hint:'Generates when you click Generate',print_hint:'Print / Save PDF → prints both pages · A4 Landscape · margins: None',lbl_choose_icon:'Choose Icon',sec_library:'Location Library',lib_search_ph:'Type to search locations…',btn_add_files:'Insert Saved Proposal',lib_empty:'No proposals yet — click Insert Saved Proposal to load a .json file',lib_count:n=>`${n} location${n!==1?'s':''} loaded`,pr_row:'Pricing Row',pr_seats:'Office',pr_type:'Suite Type',pr_rent:'Max Workstations',pr_workstation:'Workstation',pr_sqm:'Size',pr_market:'Market Price',pr_mgmt:'Monthly Rent',pr_init:'12-Month Commitment',pr_init_hint:'(rich text — select text then B or ●)',pr_avail:'Average Price',pr_availability:'Availability',pr_seat_ph:'1–17',pr_type_ph:'Window / Aisle',pr_rent_ph:'HK$4,000/desk',pr_mgmt_ph:'HK$500/desk',pr_init_ph:'3 months deposit',pr_avail_ph:'Immediate',sec_custom:'Custom Info Block',note_custom:'Shown below Transport on the slide.',lbl_custom_title:'Section Title',lbl_custom_body:'Content',custom_title_default:'Overview',sec_col_settings:'Column Settings',sec_p2_photos:'Page 2 Photos',hint_p2_photos:'Optional · replaces page 2 photos · leave empty to reuse page 1',lbl_cpos_below:'Transport → Custom',lbl_cpos_above:'Custom → Transport',sec_fp_room:'Floor Plan Room #',btn_add_plan:'+ Add Plan',hint_fp_room:'Type a room number → adds it to Floor Plan. Shows as collage when multiple.',ph_fp_room:'e.g. 2412 or master',pr_office:'Office',custom_body_default:'Available from 1 month. Flexible terms and customisable spaces beyond those listed.',profile_heading:'My Contact Profile',profile_fname:'First Name',profile_lname:'Last Name',profile_job_title:'Job Title',profile_phone:'Phone',profile_email:'Email',profile_save:'Save Profile',profile_clear:'Clear Profile',profile_photo_hint:'Click to upload your photo',profile_contact_toggle:'Include contact page in PDF exports',fp_p2_same:'Both pages same',fp_p2_diff:'Page 2 different',fp_p2_upload:'Upload floor plan for Page 2',fp_p2_set:'Page 2 floor plan set',fp_edit_room_title:'Edit Room Layout',aus_base_discount:'Base Discount',aus_add_to_rows:'Add Selected to Rows',aus_clear_sel:'Clear selection',aus_loading_regions:'Loading regions…',queue_export_all:'Export All PDF',queue_clear:'Clear',mob_proposal_details:'Proposal Details',mob_actions:'Actions',autosave_banner_text:'Unsaved proposal found — last saved',autosave_restore:'Restore',autosave_dismiss:'Dismiss',btn_auto_updates:'Auto-updates as you type',lib_clear_library:'Clear library',aus_mf_btn:'⊕ Multi-floor',aus_mf_hint:'Switching floors keeps your selections. Select rooms from each floor, then tap ⚡ Combined Proposal.',aus_mf_combined:'⚡ Combined Proposal',aus_mf_separate:'Keep Separate',aus_mf_floors:'offices',aus_mf_ready:'Combined ready — click + Queue to add.',aus_mf_rendering:'Preparing floor plans…'},
  'zh-hant':{tab_loc:'位置',tab_specs:'規格',tab_price:'定價',tab_media:'媒體',lbl_company_name:'提案對象（公司）',hint_company_name:'用於檔案名稱、PDF 及電郵，不顯示在投影片上',lbl_client_name:'客戶姓名',hint_client_name:'僅用於電郵範本，不顯示在投影片上',sec_name_loc:'名稱與位置',lbl_city:'城市',lbl_floor:'樓層 / 單位',sec_transport:'交通資訊',note_transport:'新增路線、選擇圖示、編輯文字。',btn_add_transport:'新增交通路線',lbl_purl:'頁面網址（頁尾）',note_specs:'獲取後自動填寫。可自由編輯任何欄位。',sec_bldg:'大廈詳情',lbl_oa:'OA 地板',sec_pricing:'定價行',btn_add_pricing:'+ 新增定價行',sec_amenities:'設施',note_amenities:'切換哪些圖示顯示在設施網格中。',note_benefits:'開啟/關閉 · 點擊文字編輯。',btn_add_benefit:'新增優點',sec_logos:'標題標誌',lbl_co_logo:'Compass Offices 標誌',lbl_always_shown:'（始終顯示）',lbl_sep:'標誌分隔符',lbl_partner_logo:'合作夥伴 / 大廈標誌',btn_upload_partner:'上傳合作夥伴標誌',hint_partner:'顯示在 Compass Offices 標誌旁邊',sec_photos:'位置照片',btn_upload_photos:'上傳照片（最多 3 張）',hint_photos:'第1張＝主圖 · 第2、3張＝縮圖',sec_floorplan:'平面圖',btn_upload_fp:'上傳平面圖',hint_fp:'任何尺寸',btn_generate:'重新整理預覽',btn_print:'列印 / 儲存 PDF',btn_new_card:'開始新提案',tt_new_card:'清空表單並開始新提案（佇列項目保留）',btn_save_card:'儲存提案',tt_save_card:'儲存此提案 — 下載 .json 檔案，可隨時透過位置庫的「插入已儲存的提案」重新匯入',tt_chrome:'小貼士 — 為獲得最穩定的使用體驗，建議使用 Google Chrome。部分功能（PDF 列印、檔案上傳、分享）在 Safari 或 Firefox 上的表現可能略有不同。',lookup_pick_region:'請於上方選擇地區以載入辦公室',lookup_pick_region_hint:'然後選擇中心進一步篩選',lookup_loading:'正在載入辦公室資料…',lookup_load_failed:'此地區的辦公室資料載入失敗',lookup_multifloor_hint:'此中心設有多個樓層 — 點按下方樓層按鈕以篩選',queue_added_cleared:'✓「{name}」已加入佇列（共 {n} 項）— 已清空表單，可建立新方案',ios_tip_title:'隱藏 PDF 中的網址與日期',ios_tip_step1:'點按下方<b>「列印 / 儲存 PDF」</b>',ios_tip_step2:'用雙指<b>放大</b>頁面預覽縮圖',ios_tip_step3:'點按上方選單 (• • •)',ios_tip_step4:'關閉<b>「頁首與頁尾」</b>',ios_tip_footer:'iOS 會記住此設定 — 只需操作一次。',ios_tip_dismiss:'知道了，不再顯示',fp_3d_label:'視圖',fp_3d_hint:'已偵測到 3D 版本',fp_3d_2d_tt:'標準 2D 平面圖',fp_3d_3d_tt:'3D 風格平面圖（相同佈局，不同呈現方式）',compass_label:'指北針',compass_hint:'顯示於第 2 頁平面圖左下角',tt_queue_add:'將此名片加入佇列 — 可把多個地點合併到同一份 PDF 或電郵',tt_queue_open:'開啟佇列面板',btn_download_pdf:'↓ JPG',btn_print_short:'列印',lbl_page1:'第 1 頁 — 概覽',lbl_page2:'第 2 頁 — 平面圖及設施',empty_hint1:'從位置庫選擇或填寫表單',empty_hint2:'或填寫表單 — 預覽自動更新',empty_p2:'平面圖 + 設施',empty_p2_hint:'點擊生成後即可顯示',print_hint:'列印 / 儲存 PDF → 列印兩頁 · A4 橫向 · 邊距：無',lbl_choose_icon:'選擇圖示',sec_library:'位置庫',lib_search_ph:'輸入以搜尋位置…',btn_add_files:'插入已儲存的提案',lib_empty:'尚無位置',lib_count:n=>`已載入 ${n} 個位置`,pr_row:'定價行',pr_seats:'辦公室',pr_type:'套房類型',pr_rent:'最大工位',pr_workstation:'辦公桌',pr_sqm:'面积',pr_market:'市場價',pr_mgmt:'月租',pr_init:'12個月承諾',pr_init_hint:'（富文本）',pr_avail:'平均價格',pr_availability:'供應情況',pr_seat_ph:'1–17',pr_type_ph:'窗口 / 走廊',pr_rent_ph:'HK$4,000/席',pr_mgmt_ph:'HK$500/席',pr_init_ph:'3個月保證金',pr_avail_ph:'即時入駐',sec_custom:'自訂資訊',note_custom:'顯示在幻燈片交通資訊下方。',lbl_custom_title:'區塊標題',lbl_custom_body:'內容',custom_title_default:'招募概要',sec_col_settings:'欄位設定',sec_p2_photos:'第2頁照片',hint_p2_photos:'選填 · 取代第2頁照片 · 留空則沿用第1頁',lbl_cpos_below:'交通 → 自訂',lbl_cpos_above:'自訂 → 交通',sec_fp_room:'平面圖房號',btn_add_plan:'+ 新增平面圖',hint_fp_room:'輸入房號 → 加入平面圖。多張時自動合圖。',ph_fp_room:'例如 2412 或 master',pr_office:'辦公室',custom_body_default:'最短1個月起，靈活租用。',profile_heading:'我的聯絡資料',profile_fname:'名字',profile_lname:'姓氏',profile_job_title:'職位',profile_phone:'電話',profile_email:'電郵',profile_save:'儲存資料',profile_clear:'清除資料',profile_photo_hint:'點擊上傳照片',profile_contact_toggle:'在 PDF 中加入聯絡頁面',fp_p2_same:'兩頁相同',fp_p2_diff:'第 2 頁不同',fp_p2_upload:'上傳第 2 頁平面圖',fp_p2_set:'第 2 頁平面圖已設定',fp_edit_room_title:'編輯房間佈局',aus_base_discount:'基本折扣',aus_add_to_rows:'加入已選至定價行',aus_clear_sel:'清除選擇',aus_loading_regions:'正在載入地區…',queue_export_all:'匯出全部 PDF',queue_clear:'清除',mob_proposal_details:'提案詳情',mob_actions:'操作',autosave_banner_text:'找到未儲存的提案 — 最後儲存於',autosave_restore:'還原',autosave_dismiss:'關閉',btn_auto_updates:'輸入時自動更新',lib_clear_library:'清除庫',aus_mf_btn:'⊕ 多層提案',aus_mf_hint:'切換樓層不會清除選擇。從每個樓層選擇房間，然後點擊 ⚡ 合併提案。',aus_mf_combined:'⚡ 合併提案',aus_mf_separate:'分開提案',aus_mf_floors:'個辦公室',aus_mf_ready:'已準備合併 — 點擊 + Queue 加入佇列。',aus_mf_rendering:'正在準備平面圖…'},
  'zh-hans':{tab_loc:'位置',tab_specs:'规格',tab_price:'定价',tab_media:'媒体',lbl_company_name:'提案对象（公司）',hint_company_name:'用于文件名称、PDF 及邮件，不显示在幻灯片上',lbl_client_name:'客户姓名',hint_client_name:'仅用于邮件模板，不显示在幻灯片上',sec_name_loc:'名称与位置',lbl_city:'城市',lbl_floor:'楼层 / 单位',sec_transport:'交通信息',note_transport:'添加路线、选择图标、编辑文字。',btn_add_transport:'添加交通路线',lbl_purl:'页面网址（页脚）',note_specs:'获取后自动填写。可自由编辑任何字段。',sec_bldg:'大厦详情',lbl_oa:'OA 地板',sec_pricing:'定价行',btn_add_pricing:'+ 添加定价行',sec_amenities:'设施',note_amenities:'切换哪些图标显示在设施网格中。',note_benefits:'开启/关闭 · 点击文字编辑。',btn_add_benefit:'添加优点',sec_logos:'标题标志',lbl_co_logo:'Compass Offices 标志',lbl_always_shown:'（始终显示）',lbl_sep:'标志分隔符',lbl_partner_logo:'合作伙伴 / 大厦标志',btn_upload_partner:'上传合作伙伴标志',hint_partner:'显示在 Compass Offices 标志旁边',sec_photos:'位置照片',btn_upload_photos:'上传照片（最多 3 张）',hint_photos:'第1张＝主图 · 第2、3张＝缩略图',sec_floorplan:'平面图',btn_upload_fp:'上传平面图',hint_fp:'任何尺寸',btn_generate:'刷新预览',btn_print:'打印 / 保存 PDF',btn_new_card:'开始新提案',tt_new_card:'清空表单并开始新提案（队列项目保留）',btn_save_card:'保存提案',tt_save_card:'保存此提案 — 下载 .json 文件，可随时通过位置库的「插入已保存的提案」重新导入',tt_chrome:'小贴士 — 为获得最稳定的使用体验，建议使用 Google Chrome。部分功能（PDF 打印、文件上传、分享）在 Safari 或 Firefox 上的表现可能略有不同。',lookup_pick_region:'请在上方选择地区以加载办公室',lookup_pick_region_hint:'然后选择中心进一步筛选',lookup_loading:'正在加载办公室数据…',lookup_load_failed:'该地区的办公室数据加载失败',lookup_multifloor_hint:'该中心设有多个楼层 — 点按下方楼层按钮进行筛选',queue_added_cleared:'✓「{name}」已加入队列（共 {n} 项）— 已清空表单，可创建新方案',ios_tip_title:'隐藏 PDF 中的网址与日期',ios_tip_step1:'点按下方<b>「打印 / 保存 PDF」</b>',ios_tip_step2:'用双指<b>放大</b>页面预览缩图',ios_tip_step3:'点按上方菜单 (• • •)',ios_tip_step4:'关闭<b>「页眉与页脚」</b>',ios_tip_footer:'iOS 会记住此设置 — 只需操作一次。',ios_tip_dismiss:'知道了，不再显示',fp_3d_label:'视图',fp_3d_hint:'已检测到 3D 版本',fp_3d_2d_tt:'标准 2D 平面图',fp_3d_3d_tt:'3D 风格平面图（相同布局，不同呈现方式）',compass_label:'指北针',compass_hint:'显示于第 2 页平面图左下角',tt_queue_add:'将此名片加入队列 — 可把多个地点合并到同一份 PDF 或邮件',tt_queue_open:'打开队列面板',btn_download_pdf:'↓ JPG',btn_print_short:'打印',lbl_page1:'第 1 页 — 概览',lbl_page2:'第 2 页 — 平面图及设施',empty_hint1:'从位置库选择或填写表单',empty_hint2:'或填写表单 — 预览自动更新',empty_p2:'平面图 + 设施',empty_p2_hint:'点击生成后即可显示',print_hint:'打印 / 保存 PDF → 打印两页 · A4 横向 · 页边距：无',lbl_choose_icon:'选择图标',sec_library:'位置库',lib_search_ph:'输入以搜索位置…',btn_add_files:'插入已保存的提案',lib_empty:'暂无位置',lib_count:n=>`已加载 ${n} 个位置`,pr_row:'定价行',pr_seats:'办公室',pr_type:'套房类型',pr_rent:'最大工位',pr_workstation:'工位',pr_sqm:'面積',pr_market:'市场价',pr_mgmt:'月租',pr_init:'12个月承诺',pr_init_hint:'（富文本）',pr_avail:'平均价格',pr_availability:'空置情况',pr_seat_ph:'1–17',pr_type_ph:'窗口 / 走廊',pr_rent_ph:'HK$4,000/席',pr_mgmt_ph:'HK$500/席',pr_init_ph:'3个月押金',pr_avail_ph:'即时入驻',sec_custom:'自定义信息',note_custom:'显示在幻灯片交通信息下方。',lbl_custom_title:'区块标题',lbl_custom_body:'内容',custom_title_default:'招募概要',sec_col_settings:'列设置',sec_p2_photos:'第2页照片',hint_p2_photos:'选填 · 替换第2页照片 · 留空则沿用第1页',lbl_cpos_below:'交通 → 自定义',lbl_cpos_above:'自定义 → 交通',sec_fp_room:'平面图房号',btn_add_plan:'+ 添加平面图',hint_fp_room:'输入房号 → 加入平面图。多张时自动拼图。',ph_fp_room:'例如 2412 或 master',pr_office:'办公空间',custom_body_default:'最短1个月起，灵活租用。',profile_heading:'我的联系资料',profile_fname:'名字',profile_lname:'姓氏',profile_job_title:'职位',profile_phone:'电话',profile_email:'邮笱',profile_save:'保存资料',profile_clear:'清除资料',profile_photo_hint:'点击上传照片',profile_contact_toggle:'在 PDF 中加入联系页面',fp_p2_same:'两页相同',fp_p2_diff:'第 2 页不同',fp_p2_upload:'上传第 2 页平面图',fp_p2_set:'第 2 页平面图已设置',fp_edit_room_title:'编辑房间布局',aus_base_discount:'基本折扣',aus_add_to_rows:'添加所选至定价行',aus_clear_sel:'清除选择',aus_loading_regions:'正在加载地区…',queue_export_all:'导出全部 PDF',queue_clear:'清除',mob_proposal_details:'提案详情',mob_actions:'操作',autosave_banner_text:'发现未保存的提案 — 最后保存于',autosave_restore:'还原',autosave_dismiss:'关闭',btn_auto_updates:'输入时自動更新',lib_clear_library:'清除库',aus_mf_btn:'⊕ 多层提案',aus_mf_hint:'切换楼层不会清除选择。从每个楼层选择房间，然后点击 ⚡ 合并提案。',aus_mf_combined:'⚡ 合并提案',aus_mf_separate:'分开提案',aus_mf_floors:'个办公室',aus_mf_ready:'已准备合并 — 点击 + Queue 加入队列。',aus_mf_rendering:'正在准备平面图…'},
  ja:{tab_loc:'所在地',tab_specs:'仕様',tab_price:'料金',tab_media:'メディア',lbl_company_name:'提案先（会社名）',hint_company_name:'ファイル名・PDF・メールに使用 — スライドには表示されません',lbl_client_name:'顧客名',hint_client_name:'メールテンプレート用 — スライドには表示されません',sec_name_loc:'名称と所在地',lbl_city:'都市',lbl_floor:'階 / 号室',sec_transport:'交通アクセス',note_transport:'路線を追加し、アイコンを選択してテキストを編集。',btn_add_transport:'交通路線を追加',lbl_purl:'ページURL（フッター）',note_specs:'取得後に自動入力されます。',sec_bldg:'ビル詳細',lbl_oa:'OAフロア',sec_pricing:'料金行',btn_add_pricing:'+ 料金行を追加',sec_amenities:'設備',note_amenities:'設備グリッドに表示するアイコンを切り替えます。',note_benefits:'オン/オフ切替 · テキストをクリックして編集。',btn_add_benefit:'特典を追加',sec_logos:'ヘッダーロゴ',lbl_co_logo:'Compass Offices ロゴ',lbl_always_shown:'（常に表示）',lbl_sep:'ロゴ区切り',lbl_partner_logo:'パートナー / ビルロゴ',btn_upload_partner:'パートナーロゴをアップロード',hint_partner:'Compass Officesロゴの横に表示',sec_photos:'所在地写真',btn_upload_photos:'写真をアップロード（最大3枚）',hint_photos:'1枚目＝メイン · 2・3枚目＝サムネイル',sec_floorplan:'間取り図',btn_upload_fp:'間取り図をアップロード',hint_fp:'サイズ不問',btn_generate:'プレビュー更新',btn_print:'印刷 / PDF保存',btn_new_card:'新規提案を開始',tt_new_card:'フォームをクリアして新しい提案を開始します（キューは保持されます）',btn_save_card:'提案を保存',tt_save_card:'この提案を保存 — .json ファイルをダウンロード。位置ライブラリの「保存済み提案を挿入」からいつでも再インポートできます',tt_chrome:'ヒント — 最も安定した動作のため、Google Chrome のご利用をおすすめします。PDF 印刷・ファイルアップロード・共有などの一部機能は、Safari や Firefox では挙動が異なる場合があります。',lookup_pick_region:'上のリージョンを選択するとオフィス一覧が読み込まれます',lookup_pick_region_hint:'続いてセンターを選択して絞り込めます',lookup_loading:'オフィスを読み込んでいます…',lookup_load_failed:'このリージョンのオフィス情報を読み込めませんでした',lookup_multifloor_hint:'このセンターには複数の階があります — 下の階ボタンをクリックして絞り込めます',queue_added_cleared:'✓「{name}」をキューに追加しました（計 {n} 件）— フォームをクリアし、新規提案の準備完了',ios_tip_title:'PDF から URL と日付を消す方法',ios_tip_step1:'下の<b>「印刷 / PDF として保存」</b>をタップ',ios_tip_step2:'ページのプレビューを<b>ピンチで拡大</b>',ios_tip_step3:'上のメニュー (• • •) をタップ',ios_tip_step4:'<b>「ヘッダとフッタ」</b>をオフ',ios_tip_footer:'iOS はこの設定を記憶します（1 回で OK）。',ios_tip_dismiss:'了解、次回から表示しない',fp_3d_label:'表示',fp_3d_hint:'3D バリアントを検出',fp_3d_2d_tt:'通常の 2D 平面図',fp_3d_3d_tt:'3D 風の平面図（同じレイアウト、異なる描写）',compass_label:'コンパス',compass_hint:'第 2 ページ平面図の左下に表示',tt_queue_add:'このカードをキューに追加 — 複数拠点を1つの PDF やメールにまとめられます',tt_queue_open:'キューパネルを開く',btn_download_pdf:'↓ JPG',btn_print_short:'印刷',lbl_page1:'第1ページ — 概要',lbl_page2:'第2ページ — 間取り図・設備',empty_hint1:'ライブラリから選択またはフォームを入力',empty_hint2:'またはフォームを入力 — プレビューは自動更新されます',empty_p2:'間取り図 + 設備',empty_p2_hint:'生成をクリックすると表示されます',print_hint:'印刷 / PDF保存 → 両ページを印刷 · A4横向き · 余白：なし',lbl_choose_icon:'アイコンを選択',sec_library:'ロケーションライブラリ',lib_search_ph:'ロケーションを検索…',btn_add_files:'保存済み提案を挿入',lib_empty:'まだありません',lib_count:n=>`${n}件のロケーションを読み込み済み`,pr_row:'料金行',pr_seats:'オフィス',pr_type:'スイートタイプ',pr_rent:'最大席数',pr_workstation:'ワークステーション',pr_sqm:'面積',pr_market:'市場価格',pr_mgmt:'月額賃料',pr_init:'12ヶ月コミット',pr_init_hint:'（リッチテキスト）',pr_avail:'平均価格',pr_availability:'空室状況',pr_seat_ph:'1〜17',pr_type_ph:'窓側 / 通路側',pr_rent_ph:'¥100,000/席',pr_mgmt_ph:'¥10,000/席',pr_init_ph:'3ヶ月分保証金',pr_avail_ph:'即時入居可',sec_custom:'カスタム情報',note_custom:'スライドの交通アクセス下に表示されます。',lbl_custom_title:'セクションタイトル',lbl_custom_body:'内容',custom_title_default:'募集概要',sec_col_settings:'列設定',sec_p2_photos:'2ページ目写真',hint_p2_photos:'任意 · 2ページ目の写真を上書き · 空欄なら1ページ目を流用',lbl_cpos_below:'交通 → カスタム',lbl_cpos_above:'カスタム → 交通',sec_fp_room:'間取り図 部屋番号',btn_add_plan:'+ 追加',hint_fp_room:'部屋番号を入力 → 間取り図に追加。複数時は自動コラージュ。',ph_fp_room:'例: 2412 または master',pr_office:'オフィス',custom_body_default:'最短1ヶ月からの短期利用、掲載区画以外もご案内可能。',profile_heading:'マイ連絡先プロフィール',profile_fname:'名前',profile_lname:'苗字',profile_job_title:'役職',profile_phone:'電話',profile_email:'メール',profile_save:'プロフィールを保存',profile_clear:'プロフィールをクリア',profile_photo_hint:'写真をアップロード',profile_contact_toggle:'PDFに連絡先ページを含める',fp_p2_same:'両ページ同じ',fp_p2_diff:'第2ページを変える',fp_p2_upload:'第2ページの間取り図をアップロード',fp_p2_set:'第2ページの間取り図を設定済み',fp_edit_room_title:'部屋レイアウトを編集',aus_base_discount:'基本割引',aus_add_to_rows:'選択を行に追加',aus_clear_sel:'選択をクリア',aus_loading_regions:'地域を読み込み中…',queue_export_all:'全PDF書き出し',queue_clear:'クリア',mob_proposal_details:'提案詳細',mob_actions:'アクション',autosave_banner_text:'未保存の提案が見つかりました — 最終保存',autosave_restore:'復元',autosave_dismiss:'閉じる',btn_auto_updates:'入力中に自動更新',lib_clear_library:'ライブラリをクリア',aus_mf_btn:'⊕ マルチフロア',aus_mf_hint:'フロアを切り替えても選択は保持されます。各フロアから部屋を選び、⚡ まとめて提案をタップしてください。',aus_mf_combined:'⚡ まとめて提案',aus_mf_separate:'個別提案',aus_mf_floors:'件',aus_mf_ready:'まとめ準備完了 — + Queue をクリックして追加。',aus_mf_rendering:'間取り図を準備中…'},
};
function ui(k){return(UI[LANG]||UI.en)[k]||(UI.en[k])||k;}

function applyI18n(){
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    if(el.dataset.i18n==='sec_library') return;
    el.textContent=ui(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n="sec_library"]').forEach(el=>{
    const svg=el.querySelector('svg');el.textContent=ui('sec_library');if(svg)el.prepend(svg);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{
    el.placeholder=ui(el.dataset.i18nPlaceholder);
  });
  // Translated hover tooltips — set BOTH:
  //   • data-tooltip → renders our custom CSS tooltip (instant, styled,
  //     larger, multi-line, branded). See the [data-tooltip] CSS below.
  //   • aria-label   → so screen readers announce the same text.
  // We deliberately do NOT set the native `title` attribute, since the
  // browser's slow grey OS tooltip would otherwise show on top of (or
  // after) the custom one and clash visually.
  document.querySelectorAll('[data-i18n-title]').forEach(el=>{
    const txt = ui(el.dataset.i18nTitle);
    el.setAttribute('data-tooltip', txt);
    el.setAttribute('aria-label', txt);
  });
  const ph={
    'n-main':{en:'China Building','zh-hant':'華人行','zh-hans':'华人行',ja:'所在地名'},
    'addr':{en:"29 Queen's Road Central",'zh-hant':'中環皇后大道中29號','zh-hans':'中环皇后大道中29号',ja:'〒100-0000 東京都千代田区'},
    'floor':{en:'18-19F','zh-hant':'18-19樓','zh-hans':'18-19层',ja:'18-19F'},
    'purl':{en:'https://www.compassoffices.com/locations/…','zh-hant':'https://www.compassoffices.com/locations/…','zh-hans':'https://www.compassoffices.com/locations/…',ja:'https://www.compassoffices.com/locations/…'},
    's-struct':{en:'Steel frame, seismic isolation','zh-hant':'鋼結構，隔震','zh-hans':'钢结构，隔震',ja:'鉄骨造・免震構造'},
    's-comp':{en:'2025','zh-hant':'2025','zh-hans':'2025',ja:'2025年'},
    's-ceil':{en:'2.9m','zh-hant':'2.9米','zh-hans':'2.9米',ja:'2.9m'},
    's-fa':{en:'390 tsubo','zh-hant':'390坪','zh-hans':'390坪',ja:'390坪'},
    's-ca':{en:'60 tsubo','zh-hant':'60坪','zh-hans':'60坪',ja:'60坪'},
    's-oa':{en:'100mm','zh-hant':'100mm','zh-hans':'100mm',ja:'100mm'},
    's-el':{en:'3','zh-hant':'3','zh-hans':'3',ja:'3基'},
    's-ac':{en:'Block AC, weekdays 9:00–18:00','zh-hant':'中央空調，平日9:00–18:00','zh-hans':'中央空调，平日9:00–18:00',ja:'個別空調、平日9:00〜18:00'},
    's-net':{en:'Free Wi-Fi, dedicated line','zh-hant':'免費Wi-Fi，專線','zh-hans':'免费Wi-Fi，专线',ja:'フリーWi-Fi・専用回線'},
    's-fac':{en:'Lounge, 2 meeting rooms','zh-hant':'休息室，2間會議室','zh-hans':'休息室，2间会议室',ja:'ラウンジ・会議室2室'},
    's-hrs':{en:'24/7','zh-hant':'全天候','zh-hans':'全天候',ja:'24時間'},
    's-park':{en:'Available','zh-hant':'有','zh-hans':'有',ja:'有'},
    'custom-title':{en:'Overview','zh-hant':'招募概要','zh-hans':'招募概要',ja:'募集概要'},
  };
  Object.entries(ph).forEach(([id,texts])=>{
    const el=document.getElementById(id);if(!el)return;
    const val=texts[LANG]||texts.en;
    if(SPEC_RICH_IDS.includes(id))el.setAttribute('placeholder',val);
    else el.placeholder=val;
  });
  const cbEditor=document.getElementById('custom-body-editor');
  if(cbEditor)cbEditor.setAttribute('placeholder',ui('custom_body_default'));
  updateLibStatus();
}

function updateLibStatus(){
  const el=document.getElementById('lib-status-txt');if(!el)return;
  const lib=getLib();
  el.textContent=lib.length?(typeof ui('lib_count')==='function'?ui('lib_count')(lib.length):ui('lib_count')):ui('lib_empty');
}

function setLang(lc){
  if(lc === LANG) return; // no-op if same lang

  // 1. Save current language's form data before switching
  saveLangData(LANG);

  // 2. Switch language + sync URL so the page is shareable / refresh-safe
  LANG = lc;
  try{ history.replaceState(null,'','?lang='+lc); }catch(e){}
  document.querySelectorAll('.lbtn').forEach((b,i)=>b.classList.toggle('on',['en','zh-hant','zh-hans','ja'][i]===lc));

  // 3. Update sidebar labels
  applyI18n();
  const mp={'lbl-name':'name','lbl-addr':'addr','lbl-struct':'struct','lbl-comp':'comp','lbl-ceil':'ceil','lbl-fa':'fa','lbl-ca':'ca','lbl-el':'el','lbl-ac':'ac','lbl-net':'net','lbl-fac':'fac','lbl-hrs':'hrs','lbl-park':'park'};
  Object.entries(mp).forEach(([id,key])=>{const el=document.getElementById(id);if(el)el.textContent=l(key);});
  const bs=document.getElementById('lbl-benefits-section');if(bs)bs.textContent=l('benefits');

  // 4. Load this language's saved data, or init fresh defaults
  const hadSavedData = loadLangData(lc);
  if(!hadSavedData){
    // Fresh language — clear fields and init language defaults
    clearLangFields();
    initBenefits(lc);
    renderBenefits();
    renderAmenities();
    // Add default transport lines for this language
    const trDefaults={
      en:   [{iconId:'tr_metro',text:'MTR Central Station — direct access'},{iconId:'tr_ferry',text:'Central Ferry Piers — 3 min walk'}],
      'zh-hant':[{iconId:'tr_metro',text:'港鐵中環站 — 直達'},{iconId:'tr_ferry',text:'中環渡輪碼頭 — 步行3分鐘'}],
      'zh-hans':[{iconId:'tr_metro',text:'港铁中环站 — 直达'},{iconId:'tr_ferry',text:'中环渡轮码头 — 步行3分钟'}],
      ja:[{iconId:'tr_metro',text:'MTR中環駅 — 直結'},{iconId:'tr_ferry',text:'中環フェリーターミナル — 徒歩3分'}],
    };
    initTransport(trDefaults[lc]||trDefaults.en);
    renderTransport();
    S.rows = [];
    renderRows();
  }

  // Always re-render pricing col settings — placeholders + values change per language
  renderPricingColSettings();
  renderRows();
  // Update benefits title input to show current lang's value
  const bTitleInput=document.getElementById('benefits-title-input');
  if(bTitleInput) bTitleInput.value=BENEFITS_TITLE[lc]||'';
  // Update deposit note input to show current lang's value + correct placeholder
  syncDepositNoteInput();

  gen();
}

// ══════════════════════════════════════════════════════════
//  ICONS
// ══════════════════════════════════════════════════════════
