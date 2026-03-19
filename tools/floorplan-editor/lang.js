// ════════════════════════════════════════════════════════════════
// LANGUAGE STRINGS — English & Japanese
// ════════════════════════════════════════════════════════════════
const LANG = {
  en: {
    // Page
    pageTitle: 'Floorplan Editor',
    // Topbar
    appTitle: 'Floorplan Editor',
    uploadFloorplan: 'Upload Floorplan',
    floorplans: 'Floorplans',
    langBtn: 'JP',
    // Canvas size options
    matchFile: 'Match File',
    size4kWide: '4000×2000 (Wide)',
    sizeCustom: 'Custom…',
    apply: 'Apply',
    // Side panel
    settings: 'Settings',
    canvasSize: 'Canvas Size',
    tools: 'Tools',
    // Tool names
    toolPan: 'Pan / Move',
    toolEraseBox: 'Erase Box',
    toolErasePen: 'Erase Pen',
    toolColorBox: 'Color Box',
    toolColorPen: 'Color Pen',
    toolCrop: 'Crop',
    toolWand: 'Magic Wand',
    toolRotate: 'Rotate Region',
    toolAnchor: 'Set Anchor',
    toolResetAnchor: 'Reset Anchor',
    toolSnap: 'Edge Snap',
    // Fill colour
    fillColour: 'Fill Colour',
    custom: 'Custom',
    opacity: 'Opacity',
    undoColour: '↶ Undo Colour',
    clearColours: 'Clear Colours',
    // Image controls
    imageControls: 'Image Controls',
    rotate: 'Rotate',
    scale: 'Scale',
    fitToCrop: 'Fit to Crop Region',
    xPos: 'X Position',
    yPos: 'Y Position',
    // Zoom
    viewZoom: 'View Zoom',
    zoom: 'Zoom',
    zoomMinus: '− Zoom',
    zoomPlus: '+ Zoom',
    // History
    history: 'History',
    undo: '↶ Undo',
    redo: '↷ Redo',
    // Bottom
    clearAll: 'Clear All',
    downloadJPG: 'Download JPG',
    // Toolbar labels
    pan: 'Pan',
    eraseBox: 'Erase Box',
    erasePen: 'Erase Pen',
    colorBox: 'Color Box',
    colorPen: 'Color Pen',
    crop: 'Crop',
    snap: 'Snap',
    rotateShort: 'Rotate',
    anchor: 'Anchor',
    reset: 'Reset',
    fitCropShort: 'Fit Crop',
    // Ctrlbar
    labelRotate: 'Rotate',
    labelScale: 'Scale',
    labelZoom: 'Zoom',
    labelOpacity: 'Opacity',
    // Hints
    penHint: 'Tap to add points · Double-tap to close',
    pinchHint: 'Pinch to zoom',
    snapBadge: '· Snap ON',
    // Rotate panel
    rotateRegion: 'Rotate Region',
    angle: 'Angle',
    nudge: 'Nudge',
    presets: 'Presets',
    rotateHint: 'Draw a box on the canvas to select a region, then drag the <strong style="color:var(--accent)">orange handle</strong> to rotate. Move the <strong style="color:white">white pivot dot</strong> to change the centre.',
    cancelRotate: '✕ Cancel',
    applyRotation: '✔ Apply Rotation',
    // Wand panel
    magicWand: 'Magic Wand',
    preview: 'Preview',
    selectedPixels: 'Selected pixels',
    tolerance: 'Tolerance',
    selectionMode: 'Selection Mode',
    wandNew: 'New',
    wandAdd: '+ Add',
    wandSub: '− Sub',
    wandHintClick: '<strong style="color:var(--text2);">Click</strong> — select one area',
    wandHintDrag: '<strong style="color:var(--text2);">Drag</strong> — select all similar colours in box',
    wandHintShift: '<strong style="color:var(--text2);">Shift+click/drag</strong> — add to selection',
    wandHintAlt: '<strong style="color:var(--text2);">Alt+click/drag</strong> — remove from selection',
    wandApplyLabel: 'Apply',
    fillColor: 'Fill Color',
    erase: 'Erase',
    setCropMask: 'Set Crop Mask',
    cancelClearSelection: '✕ Cancel / Clear Selection',
    // Placeholder
    phW: 'W', phH: 'H', phWidth: 'Width', phHeight: 'Height',
    // Custom size
    customW: 'W', customH: 'H',
    // Status messages (used in JS)
    statusUpload: 'Upload a floorplan to start',
    statusNothingUndo: 'Nothing to undo',
    statusNothingRedo: 'Nothing to redo',
    statusUndone: 'Undone',
    statusRedone: 'Redone',
    statusCleared: 'Canvas cleared — fills removed, original image restored',
    statusSnapOn: 'Edge snap ON',
    statusSnapOff: 'Edge snap OFF',
    statusAnchorReset: 'Anchor reset — scale and rotate now pivot at canvas centre',
    statusAnchorPinned: 'Anchor pinned — next scale/rotate will pivot around this point',
    statusNoColourUndo: 'No colour fills to undo',
    statusNoColourClear: 'No colour fills to clear',
    statusColourCleared: 'All colour fills cleared',
    statusWandNoArea: 'No area found — try clicking inside the floorplan',
    statusFitCrop: 'Fitted to crop region — use Scale slider to fine-tune',
    statusWandCrop: 'Wand crop mask applied',
    statusPrepDownload: 'Preparing download…',
    statusRotateHint: 'Drag the orange handle to rotate · ✔ Apply when done',
    statusUploading: (w, h) => `Loaded ${w}×${h}px`,
    statusPDF: (n, w, h) => `PDF p${n}: ${w}×${h}`,
    statusDownloaded: (w, h) => `Downloaded ${w}×${h}px JPG`,
    statusCanvas: (w, h) => `Canvas: ${w}×${h}px`,
    statusRotated: (a) => `Rotation applied (${a}°)`,
    statusEraseBox: (n) => `Erase box (${n})`,
    statusColourFill: (n) => `Color fill (${n})`,
    statusCropApplied: 'Crop mask applied',
    statusEraseBoxShort: 'Erase box',
    statusColourAdded: 'Color fill added',
    statusCropShort: 'Crop applied',
    statusColourRemoved: (n) => `Colour fill removed (${n} remaining)`,
    statusCustomColour: (v) => `Custom colour: ${v}`,
    statusWandApply: (a) => `Wand ${a} applied`,
    wandModeLabels: { new: 'SINGLE', add: '+ ADD', sub: '− REMOVE' },
    penStatus: (mode, pts, snapped) => `${mode==='erase'?'Erase':'Color'} pen: ${pts} pts${snapped?' [snap]':''}`,
  },

  ja: {
    pageTitle: 'フロアプラン エディター',
    appTitle: 'フロアプラン エディター',
    uploadFloorplan: 'フロアプランをアップロード',
    floorplans: 'フロアプラン',
    langBtn: 'EN',
    matchFile: 'ファイルに合わせる',
    size4kWide: '4000×2000（ワイド）',
    sizeCustom: 'カスタム…',
    apply: '適用',
    settings: '設定',
    canvasSize: 'キャンバスサイズ',
    tools: 'ツール',
    toolPan: 'パン / 移動',
    toolEraseBox: '消しゴムボックス',
    toolErasePen: '消しゴムペン',
    toolColorBox: 'カラーボックス',
    toolColorPen: 'カラーペン',
    toolCrop: 'クロップ',
    toolWand: 'マジックワンド',
    toolRotate: '領域を回転',
    toolAnchor: 'アンカーを設定',
    toolResetAnchor: 'アンカーをリセット',
    toolSnap: 'エッジスナップ',
    fillColour: '塗りつぶしカラー',
    custom: 'カスタム',
    opacity: '不透明度',
    undoColour: '↶ カラーを元に戻す',
    clearColours: 'カラーをクリア',
    imageControls: '画像コントロール',
    rotate: '回転',
    scale: 'スケール',
    fitToCrop: 'クロップ領域に合わせる',
    xPos: 'X 位置',
    yPos: 'Y 位置',
    viewZoom: '表示ズーム',
    zoom: 'ズーム',
    zoomMinus: '− ズーム',
    zoomPlus: '+ ズーム',
    history: '履歴',
    undo: '↶ 元に戻す',
    redo: '↷ やり直す',
    clearAll: 'すべてクリア',
    downloadJPG: 'JPGをダウンロード',
    pan: 'パン',
    eraseBox: '消しゴムB',
    erasePen: '消しゴムP',
    colorBox: 'カラーB',
    colorPen: 'カラーP',
    crop: 'クロップ',
    snap: 'スナップ',
    rotateShort: '回転',
    anchor: 'アンカー',
    reset: 'リセット',
    fitCropShort: 'クロップ合わせ',
    labelRotate: '回転',
    labelScale: 'スケール',
    labelZoom: 'ズーム',
    labelOpacity: '不透明度',
    penHint: 'タップでポイント追加 · ダブルタップで閉じる',
    pinchHint: 'ピンチでズーム',
    snapBadge: '· スナップ オン',
    rotateRegion: '領域を回転',
    angle: '角度',
    nudge: '微調整',
    presets: 'プリセット',
    rotateHint: 'キャンバス上でボックスを描いて領域を選択し、<strong style="color:var(--accent)">オレンジのハンドル</strong>をドラッグして回転させます。<strong style="color:white">白いピボット点</strong>を移動して中心を変更できます。',
    cancelRotate: '✕ キャンセル',
    applyRotation: '✔ 回転を適用',
    magicWand: 'マジックワンド',
    preview: 'プレビュー',
    selectedPixels: '選択ピクセル数',
    tolerance: '許容値',
    selectionMode: '選択モード',
    wandNew: '新規',
    wandAdd: '＋ 追加',
    wandSub: '－ 削除',
    wandHintClick: '<strong style="color:var(--text2);">クリック</strong> — 1つのエリアを選択',
    wandHintDrag: '<strong style="color:var(--text2);">ドラッグ</strong> — ボックス内の類似色をすべて選択',
    wandHintShift: '<strong style="color:var(--text2);">Shift+クリック/ドラッグ</strong> — 選択に追加',
    wandHintAlt: '<strong style="color:var(--text2);">Alt+クリック/ドラッグ</strong> — 選択から削除',
    wandApplyLabel: '適用',
    fillColor: '色を塗りつぶす',
    erase: '消去',
    setCropMask: 'クロップマスクを設定',
    cancelClearSelection: '✕ キャンセル / 選択をクリア',
    phW: '幅', phH: '高さ', phWidth: '幅', phHeight: '高さ',
    customW: '幅', customH: '高さ',
    statusUpload: 'フロアプランをアップロードして開始',
    statusNothingUndo: '元に戻す操作はありません',
    statusNothingRedo: 'やり直す操作はありません',
    statusUndone: '元に戻しました',
    statusRedone: 'やり直しました',
    statusCleared: 'キャンバスをクリア — 塗りつぶし削除、元の画像を復元',
    statusSnapOn: 'エッジスナップ オン',
    statusSnapOff: 'エッジスナップ オフ',
    statusAnchorReset: 'アンカーをリセット — スケール・回転の中心がキャンバス中央に戻りました',
    statusAnchorPinned: 'アンカーを固定 — 次のスケール/回転はこの点を中心に行われます',
    statusNoColourUndo: '元に戻すカラー塗りつぶしはありません',
    statusNoColourClear: 'クリアするカラー塗りつぶしはありません',
    statusColourCleared: 'すべてのカラー塗りつぶしをクリアしました',
    statusWandNoArea: 'エリアが見つかりません — フロアプランの内側をクリックしてください',
    statusFitCrop: 'クロップ領域に合わせました — スケールスライダーで微調整できます',
    statusWandCrop: 'ワンドのクロップマスクを適用しました',
    statusPrepDownload: 'ダウンロードを準備中…',
    statusRotateHint: 'オレンジのハンドルをドラッグして回転 · ✔ 完了したら適用',
    statusUploading: (w, h) => `読み込み完了 ${w}×${h}px`,
    statusPDF: (n, w, h) => `PDF ${n}ページ: ${w}×${h}`,
    statusDownloaded: (w, h) => `${w}×${h}px JPGをダウンロードしました`,
    statusCanvas: (w, h) => `キャンバス: ${w}×${h}px`,
    statusRotated: (a) => `回転を適用しました (${a}°)`,
    statusEraseBox: (n) => `消しゴムボックス (${n})`,
    statusColourFill: (n) => `カラー塗りつぶし (${n})`,
    statusCropApplied: 'クロップマスクを適用しました',
    statusEraseBoxShort: '消しゴムボックス',
    statusColourAdded: 'カラー塗りつぶしを追加しました',
    statusCropShort: 'クロップを適用しました',
    statusColourRemoved: (n) => `カラー塗りつぶしを削除しました (残り ${n})`,
    statusCustomColour: (v) => `カスタムカラー: ${v}`,
    statusWandApply: (a) => `ワンド（${a==='fill'?'塗りつぶし':a==='erase'?'消去':'クロップ'}）を適用しました`,
    wandModeLabels: { new: 'シングル', add: '＋ 追加', sub: '－ 削除' },
    penStatus: (mode, pts, snapped) => `${mode==='erase'?'消去':'カラー'}ペン: ${pts}点${snapped?' [スナップ]':''}`,
  }
};

// Current language — default English
let currentLang = 'en';

// Get a string for the current language
function t(key, ...args) {
  const s = LANG[currentLang][key];
  if (typeof s === 'function') return s(...args);
  return s ?? LANG['en'][key] ?? key;
}

// Apply all translations to the DOM
function applyLang(lang) {
  currentLang = lang;
  const L = LANG[lang];

  // Helper to safely set text
  const setText = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
  const setHTML = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
  const setAll  = (sel, text) => document.querySelectorAll(sel).forEach(el => el.textContent = text);
  const setAttr = (id, attr, val) => { const el = document.getElementById(id); if (el) el.setAttribute(attr, val); };
  const setAllAttr = (sel, attr, val) => document.querySelectorAll(sel).forEach(el => el.setAttribute(attr, val));

  // Page
  document.title = L.pageTitle;
  document.documentElement.lang = lang;

  // Language button
  // Update the single language switch button
  const langBtn = document.getElementById('langSwitchBtnDesk');
  if(langBtn) langBtn.textContent = L.langBtn;

  // App title
  setAll('h1', L.appTitle);

  // Upload / download buttons
  document.querySelectorAll('.upload-label').forEach(el => el.textContent = L.uploadFloorplan);
  document.querySelectorAll('.floorplans-label').forEach(el => el.textContent = L.floorplans);

  // Canvas size select options
  ['canvasSize','canvasSizeMob'].forEach(id => {
    const sel = document.getElementById(id); if (!sel) return;
    sel.querySelector('option[value="file"]').textContent = L.matchFile;
    sel.querySelector('option[value="4000x2000"]').textContent = L.size4kWide;
    sel.querySelector('option[value="custom"]').textContent = L.sizeCustom;
  });
  document.querySelectorAll('.apply-label').forEach(el => el.textContent = L.apply);

  // Side panel
  setAll('.panel-settings-title', L.settings);
  setAll('.sec-label-canvas', L.canvasSize);
  setAll('.sec-label-tools', L.tools);

  // Tool buttons — using data-tool attribute
  const toolMap = {
    drag: L.toolPan, rectangle: L.toolEraseBox, erasePen: L.toolErasePen,
    color: L.toolColorBox, pen: L.toolColorPen, selection: L.toolCrop,
    wand: L.toolWand, rotateSel: L.toolRotate, anchor: L.toolAnchor,
    snap: L.toolSnap
  };
  Object.entries(toolMap).forEach(([tool, label]) => {
    document.querySelectorAll(`[data-tool-label="${tool}"]`).forEach(el => el.textContent = label);
  });
  document.querySelectorAll('[data-tool-label="resetAnchor"]').forEach(el => el.textContent = L.toolResetAnchor);

  // Toolbar short labels
  const shortMap = {
    drag: L.pan, rectangle: L.eraseBox, erasePen: L.erasePen,
    color: L.colorBox, pen: L.colorPen, selection: L.crop,
    snap: L.snap, rotateSel: L.rotateShort, anchor: L.anchor, reset: L.reset
  };
  Object.entries(shortMap).forEach(([tool, label]) => {
    document.querySelectorAll(`.tl[data-tl="${tool}"]`).forEach(el => el.textContent = label);
  });
  setAll('.tl[data-tl="fitcrop"]', L.fitCropShort);

  // Fill colour section
  setAll('.sec-label-fill', L.fillColour);
  setAll('.custom-colour-label', L.custom);
  setAll('.opacity-label', L.opacity);
  document.querySelectorAll('.undo-colour-btn').forEach(el => el.textContent = L.undoColour);
  document.querySelectorAll('.clear-colours-btn').forEach(el => el.textContent = L.clearColours);

  // Image controls
  setAll('.sec-label-image', L.imageControls);
  setAll('.label-rotate', L.labelRotate);
  setAll('.label-scale', L.labelScale);
  setAll('.label-zoom', L.labelZoom);
  setAll('.label-opacity', L.labelOpacity);
  setAll('.label-xpos', L.xPos);
  setAll('.label-ypos', L.yPos);
  document.querySelectorAll('.fit-crop-label').forEach(el => el.textContent = L.fitToCrop);

  // Zoom
  setAll('.sec-label-zoom', L.viewZoom);
  document.querySelectorAll('.zoom-minus-btn').forEach(el => el.textContent = L.zoomMinus);
  document.querySelectorAll('.zoom-plus-btn').forEach(el => el.textContent = L.zoomPlus);

  // History
  setAll('.sec-label-history', L.history);
  document.querySelectorAll('.undo-btn').forEach(el => el.textContent = L.undo);
  document.querySelectorAll('.redo-btn').forEach(el => el.textContent = L.redo);

  // Bottom bar
  document.querySelectorAll('.btn-lbl-clear').forEach(el => el.textContent = L.clearAll);
  document.querySelectorAll('.btn-lbl-dl').forEach(el => el.textContent = L.downloadJPG);

  // Overlays
  const penHintEl = document.getElementById('penHint');
  if (penHintEl) penHintEl.textContent = L.penHint;
  const pinchEl = document.getElementById('pinchHint');
  if (pinchEl) pinchEl.textContent = L.pinchHint;
  const snapBadgeEl = document.getElementById('snapBadge');
  if (snapBadgeEl) snapBadgeEl.textContent = L.snapBadge;

  // Status bar
  setText('statusText', L.statusUpload);

  // Rotate panel
  setAll('.rot-panel-title', L.rotateRegion);
  setAll('.rot-sec-angle', L.angle);
  setAll('.rot-sec-nudge', L.nudge);
  setAll('.rot-sec-presets', L.presets);
  setHTML('rotHintText', L.rotateHint);
  document.querySelectorAll('.rot-cancel-btn').forEach(el => el.textContent = L.cancelRotate);
  document.querySelectorAll('.rot-apply-btn').forEach(el => el.textContent = L.applyRotation);

  // Wand panel
  setAll('.wp-title-text', L.magicWand);
  setAll('.wp-label-preview', L.preview);
  setAll('.wp-label-pixels', L.selectedPixels);
  setAll('.wp-label-tolerance', L.tolerance);
  setAll('.wp-label-mode', L.selectionMode);
  setText('wandNewBtn', L.wandNew);
  setText('wandAddBtn', L.wandAdd);
  setText('wandSubBtn', L.wandSub);
  setHTML('wandHint', `${L.wandHintClick}<br>${L.wandHintDrag}<br>${L.wandHintShift}<br>${L.wandHintAlt}`);
  setAll('.wp-apply-label', L.wandApplyLabel);
  setText('wandFillBtn', L.fillColor);
  setText('wandEraseBtn', L.erase);
  setText('wandCropBtn', L.setCropMask);
  setText('wandCancelBtn', L.cancelClearSelection);

  // Custom size placeholders
  ['customW'].forEach(id => { const el = document.getElementById(id); if(el) el.placeholder = L.phW; });
  ['customH'].forEach(id => { const el = document.getElementById(id); if(el) el.placeholder = L.phH; });
  ['customWMob'].forEach(id => { const el = document.getElementById(id); if(el) el.placeholder = L.phWidth; });
  ['customHMob'].forEach(id => { const el = document.getElementById(id); if(el) el.placeholder = L.phHeight; });

  // Save to localStorage
  try { localStorage.setItem('floorplan-lang', lang); } catch(e) {}
}

function toggleLang() {
  applyLang(currentLang === 'en' ? 'ja' : 'en');
}

// Auto-apply saved language, default always English
(function() {
  let saved;
  try { saved = localStorage.getItem('floorplan-lang'); } catch(e) {}
  applyLang(saved || 'en');
})();
