/*
  BulkMockupsFiller.jsx
  ExtendScript (Photoshop) — ScriptUI окно с вкладками: Inputs / Settings / Outputs / About
  Каркас интерфейса и базовые модели данных. Логика будет добавляться в следующих задачах.
*/

#target photoshop
#targetengine BulkMockupsFiller

// Глобальная модель пресета (минимальный набор, будет расширяться)
var BMF_DEFAULT_PRESET = {
  mockupsPath: '',
  mockupsIncludeSubfolders: true,
  designsPath: '',
  designsIncludeSubfolders: true,
  outputPath: '',
  targetLayerName: 'Design',
  resizeMode: 'fit', // none|fill|fit|stretch|custom
  customScale: 100,
  alignX: 'center', // left|center|right
  alignY: 'middle', // top|middle|bottom
  exportPSD: true,
  exportJPG: true,
  jpgQuality: 12,
  exportWEBP: true,
  webpQuality: 100,
  outputStructure: 'filetype', // filetype|design|none
  namePatternLeft: 'Design Name',
  namePatternRight: 'Mockup Name',
  namePrefix: '',
  nameSuffix: '',
  layerMode: 'multiple', // single|multiple
  imageAdvance: 'next', // same|next
  language: '', // '' = авто по $.locale, 'ru' | 'en'
  exportMode: 'normal' // normal | groups
};

// Текущее состояние
var bmfState = deepClone(BMF_DEFAULT_PRESET);

// Простая утилита глубокого клонирования для примитивов/простых объектов
function deepClone(o) {
  return app ? (o && o.toSource ? eval(o.toSource()) : JSON.parse(JSON.stringify(o))) : JSON.parse(JSON.stringify(o));
}

// Создание UI
// I18N
var BMF_I18N = {
  en: {
    title: 'Bulk Mockups Filler 12',
    tabs: { inputs: 'Inputs', settings: 'Settings', outputs: 'Outputs', about: 'About' },
    panels: {
      mockups: 'Mockups Location', designs: 'Designs Location', output: 'Output Location',
      layerSelection: 'Layer Selection', resizing: 'Resizing', align: 'Align',
      outputStructure: 'Output Structure', fileName: 'File Name', saveOptions: 'Save Options'
    },
    desc: {
      mockups: 'Provide source template folder to start.',
      designs: 'Provide source image folder to begin.',
      output: 'Select a destination folder to save your file.',
      example: 'example: /Output/JPG/DesignName/',
      saveForWeb: 'Save for Web is used for JPG/WEBP'
    },
    includeSub: 'Include Subfolder',
    buttons: { browse: 'Browse', run: 'Run', save: 'Save', load: 'Load', reset: 'Reset', cancel: 'Cancel',
      help: 'Help', contact: 'Contact', free: 'Free Mockups', changelog: 'Changelog', support: 'Support', more: 'More Plugin', check: 'Check for Updates' },
    settings: {
      byName: 'By Name', name: 'Name:', layerCount: 'Layer Count:', single: 'Single Layer', multiple: 'Multiple Layer',
      imageSource: 'Image Source:', same: 'Same Image', next: 'Next Image',
      none: 'None', fill: 'Fill', fit: 'Fit', stretch: 'Stretch', custom: 'Custom', percent: '%',
      horizontal: 'Horizontal', vertical: 'Vertical', left: 'Left', center: 'Center', right: 'Right', top: 'Top', middle: 'Middle', bottom: 'Bottom'
    },
    outputs: { fileTypeFolder: 'File Type Folder', designsName: 'Designs Name', none: 'None', designName: 'Design Name', mockupName: 'Mockup Name', prefix: 'Prefix', suffix: 'Suffix', psd: 'PSD', jpg: 'JPG', webp: 'WEBP', exportMode: 'Export Mode', normal: 'Normal', byGroups: 'By Groups' },
    aboutText: 'Bulk Mockups Filler — speed up mockup creation by batch design replacement.',
    language: 'Language:'
  },
  ru: {
    title: 'Bulk Mockups Filler 12',
    tabs: { inputs: 'Inputs', settings: 'Settings', outputs: 'Outputs', about: 'About' },
    panels: {
      mockups: 'Местоположение макетов', designs: 'Местоположение дизайнов', output: 'Папка вывода',
      layerSelection: 'Выбор слоя', resizing: 'Ресайзинг', align: 'Выравнивание',
      outputStructure: 'Структура вывода', fileName: 'Имя файла', saveOptions: 'Параметры сохранения'
    },
    desc: {
      mockups: 'Укажите папку с макетами для старта.',
      designs: 'Укажите папку с изображениями.',
      output: 'Выберите папку для сохранения результатов.',
      example: 'пример: /Output/JPG/DesignName/',
      saveForWeb: 'Save for Web используется для JPG/WEBP'
    },
    includeSub: 'Включая подпапки',
    buttons: { browse: 'Browse', run: 'Run', save: 'Save', load: 'Load', reset: 'Reset', cancel: 'Cancel',
      help: 'Help', contact: 'Contact', free: 'Free Mockups', changelog: 'Changelog', support: 'Support', more: 'More Plugin', check: 'Check for Updates' },
    settings: {
      byName: 'По имени', name: 'Имя:', layerCount: 'Количество слоёв:', single: 'Один слой', multiple: 'Несколько слоёв',
      imageSource: 'Источник изображений:', same: 'Одно изображение', next: 'Следующее изображение',
      none: 'Нет', fill: 'Заполнить', fit: 'Вписать', stretch: 'Растянуть', custom: 'Произвольно', percent: '%',
      horizontal: 'По горизонтали', vertical: 'По вертикали', left: 'Слева', center: 'Центр', right: 'Справа', top: 'Сверху', middle: 'Середина', bottom: 'Снизу'
    },
    outputs: { fileTypeFolder: 'Папка по типу', designsName: 'Имя дизайна', none: 'Нет', designName: 'Имя дизайна', mockupName: 'Имя макета', prefix: 'Префикс', suffix: 'Суффикс', psd: 'PSD', jpg: 'JPG', webp: 'WEBP', exportMode: 'Режим экспорта', normal: 'Обычный', byGroups: 'По группам' },
    aboutText: 'Bulk Mockups Filler — ускорение создания мокапов путем пакетной замены дизайнов.',
    language: 'Язык:'
  }
};

function getLangCode() {
  if (bmfState.language && (bmfState.language === 'ru' || bmfState.language === 'en')) return bmfState.language;
  return (String($.locale || '').toLowerCase().indexOf('ru') === 0) ? 'ru' : 'en';
}
function t(path) {
  var lang = BMF_I18N[getLangCode()];
  var parts = path.split('.');
  var cur = lang;
  for (var i = 0; i < parts.length; i++) cur = cur[parts[i]];
  return cur;
}

function createUI() {
  var win = new Window('palette', t('title'), undefined, {
    resizeable: true
  });

  win.alignChildren = 'fill';

  // Tabs
  var tabs = win.add('tabbedpanel');
  tabs.alignChildren = 'fill';
  tabs.preferredSize = [600, 380];
  win.minimumSize = [560, 340];

  var tabInputs = tabs.add('tab', undefined, t('tabs.inputs'));
  var tabSettings = tabs.add('tab', undefined, t('tabs.settings'));
  var tabOutputs = tabs.add('tab', undefined, t('tabs.outputs'));
  var tabAbout = tabs.add('tab', undefined, t('tabs.about'));

  // ========== Inputs ==========
  (function buildInputs(parent) {
    parent.orientation = 'column';
    parent.alignChildren = 'fill';

    var grpMockups = parent.add('panel', undefined, t('panels.mockups'));
    grpMockups.alignChildren = 'left';
    grpMockups.margins = 10;
    var rowM1 = grpMockups.add('group');
    rowM1.add('statictext', undefined, t('desc.mockups'));
    var btnBrowseMockups = rowM1.add('button', undefined, t('buttons.browse'));
    var rowM2 = grpMockups.add('group');
    var cbMockupsSub = rowM2.add('checkbox', undefined, t('includeSub'));
    cbMockupsSub.value = !!bmfState.mockupsIncludeSubfolders;

    var grpDesigns = parent.add('panel', undefined, t('panels.designs'));
    grpDesigns.alignChildren = 'left';
    grpDesigns.margins = 10;
    var rowD1 = grpDesigns.add('group');
    rowD1.add('statictext', undefined, t('desc.designs'));
    var btnBrowseDesigns = rowD1.add('button', undefined, t('buttons.browse'));
    var rowD2 = grpDesigns.add('group');
    var cbDesignsSub = rowD2.add('checkbox', undefined, t('includeSub'));
    cbDesignsSub.value = !!bmfState.designsIncludeSubfolders;

    var grpOutput = parent.add('panel', undefined, t('panels.output'));
    grpOutput.alignChildren = 'left';
    grpOutput.margins = 10;
    var rowO1 = grpOutput.add('group');
    rowO1.add('statictext', undefined, t('desc.output'));
    var btnBrowseOutput = rowO1.add('button', undefined, t('buttons.browse'));

    // Мини‑лог внизу вкладки
    var miniLog = parent.add('edittext', undefined, '', { multiline: true, readonly: true, scrolling: true });
    miniLog.preferredSize.height = 80;

    // Обработчики выбора папок — заглушки, сохраняем только путь в state
    btnBrowseMockups.onClick = function () {
      var f = Folder.selectDialog('Select mockups folder');
      if (f) bmfState.mockupsPath = f.fsName;
    };
    btnBrowseDesigns.onClick = function () {
      var f2 = Folder.selectDialog('Select designs folder');
      if (f2) bmfState.designsPath = f2.fsName;
    };
    btnBrowseOutput.onClick = function () {
      var f3 = Folder.selectDialog('Select output folder');
      if (f3) bmfState.outputPath = f3.fsName;
    };

    cbMockupsSub.onClick = function () { bmfState.mockupsIncludeSubfolders = cbMockupsSub.value; };
    cbDesignsSub.onClick = function () { bmfState.designsIncludeSubfolders = cbDesignsSub.value; };
  })(tabInputs);

  // ========== Settings ==========
  (function buildSettings(parent) {
    parent.orientation = 'column';
    parent.alignChildren = 'fill';

    var panelLayer = parent.add('panel', undefined, t('panels.layerSelection'));
    panelLayer.alignChildren = 'left';
    var row1 = panelLayer.add('group');
    var rbByName = row1.add('radiobutton', undefined, t('settings.byName'));
    rbByName.value = true;
    var nameGrp = panelLayer.add('group');
    nameGrp.add('statictext', undefined, t('settings.name'));
    var etName = nameGrp.add('edittext', undefined, bmfState.targetLayerName);
    etName.characters = 20;

    var modeRow = panelLayer.add('group');
    modeRow.add('statictext', undefined, t('settings.layerCount'));
    var rbSingle = modeRow.add('radiobutton', undefined, t('settings.single'));
    var rbMultiple = modeRow.add('radiobutton', undefined, t('settings.multiple'));
    rbMultiple.value = (bmfState.layerMode === 'multiple');

    var imageRow = panelLayer.add('group');
    imageRow.add('statictext', undefined, t('settings.imageSource'));
    var rbSame = imageRow.add('radiobutton', undefined, t('settings.same'));
    var rbNext = imageRow.add('radiobutton', undefined, t('settings.next'));
    rbNext.value = (bmfState.imageAdvance === 'next');

    var panelResize = parent.add('panel', undefined, t('panels.resizing'));
    panelResize.alignChildren = 'left';
    var rRow = panelResize.add('group');
    var rbNone = rRow.add('radiobutton', undefined, t('settings.none'));
    var rbFill = rRow.add('radiobutton', undefined, t('settings.fill'));
    var rbFit = rRow.add('radiobutton', undefined, t('settings.fit'));
    var rbStretch = rRow.add('radiobutton', undefined, t('settings.stretch'));
    var rbCustom = rRow.add('radiobutton', undefined, t('settings.custom'));
    rbFit.value = true;
    var scaleGrp = panelResize.add('group');
    var etScale = scaleGrp.add('edittext', undefined, bmfState.customScale);
    etScale.characters = 4;
    scaleGrp.add('statictext', undefined, t('settings.percent'));

    var panelAlign = parent.add('panel', undefined, t('panels.align'));
    panelAlign.alignChildren = 'left';
    var aRow1 = panelAlign.add('group');
    aRow1.add('statictext', undefined, t('settings.horizontal'));
    var ddHX = aRow1.add('dropdownlist', undefined, [t('settings.left'), t('settings.center'), t('settings.right')]);
    ddHX.selection = 1;
    var aRow2 = panelAlign.add('group');
    aRow2.add('statictext', undefined, t('settings.vertical'));
    var ddVY = aRow2.add('dropdownlist', undefined, [t('settings.top'), t('settings.middle'), t('settings.bottom')]);
    ddVY.selection = 1;

    etName.onChanging = function () { bmfState.targetLayerName = etName.text; };
    rbSingle.onClick = function () { bmfState.layerMode = 'single'; };
    rbMultiple.onClick = function () { bmfState.layerMode = 'multiple'; };
    rbSame.onClick = function () { bmfState.imageAdvance = 'same'; };
    rbNext.onClick = function () { bmfState.imageAdvance = 'next'; };
    rbNone.onClick = function () { bmfState.resizeMode = 'none'; };
    rbFill.onClick = function () { bmfState.resizeMode = 'fill'; };
    rbFit.onClick = function () { bmfState.resizeMode = 'fit'; };
    rbStretch.onClick = function () { bmfState.resizeMode = 'stretch'; };
    rbCustom.onClick = function () { bmfState.resizeMode = 'custom'; };
    etScale.onChanging = function () { bmfState.customScale = parseInt(etScale.text, 10) || 100; };
    ddHX.onChange = function () { bmfState.alignX = ['left','center','right'][ddHX.selection.index]; };
    ddVY.onChange = function () { bmfState.alignY = ['top','middle','bottom'][ddVY.selection.index]; };
  })(tabSettings);

  // ========== Outputs ==========
  (function buildOutputs(parent) {
    parent.orientation = 'column';
    parent.alignChildren = 'fill';

    var panelStruct = parent.add('panel', undefined, t('panels.outputStructure'));
    panelStruct.alignChildren = 'left';
    var sRow = panelStruct.add('group');
    var ddStruct = sRow.add('dropdownlist', undefined, [t('outputs.fileTypeFolder'), t('outputs.designsName'), t('outputs.none')]);
    ddStruct.selection = 0;
    // поясняющий пример
    var example = panelStruct.add('statictext', undefined, t('desc.example'));

    var panelName = parent.add('panel', undefined, t('panels.fileName'));
    panelName.alignChildren = 'left';
    var nRow1 = panelName.add('group');
    var ddLeft = nRow1.add('dropdownlist', undefined, [t('outputs.designName'), t('outputs.mockupName')]);
    var ddRight = nRow1.add('dropdownlist', undefined, [t('outputs.mockupName'), t('outputs.designName')]);
    ddLeft.selection = 0; ddRight.selection = 0;
    var nRow2 = panelName.add('group');
    nRow2.add('statictext', undefined, t('outputs.prefix'));
    var etPrefix = nRow2.add('edittext', undefined, ''); etPrefix.characters = 12;
    nRow2.add('statictext', undefined, t('outputs.suffix'));
    var etSuffix = nRow2.add('edittext', undefined, ''); etSuffix.characters = 12;

    var panelSave = parent.add('panel', undefined, t('panels.saveOptions'));
    panelSave.alignChildren = 'left';
    var sRow1 = panelSave.add('group');
    var cbPSD = sRow1.add('checkbox', undefined, t('outputs.psd')); cbPSD.value = true;
    var cbJPG = sRow1.add('checkbox', undefined, t('outputs.jpg')); cbJPG.value = true;
    var etJQ = sRow1.add('edittext', undefined, '12'); etJQ.characters = 3;
    var cbWEBP = sRow1.add('checkbox', undefined, t('outputs.webp')); cbWEBP.value = true;
    var etWQ = sRow1.add('edittext', undefined, '100'); etWQ.characters = 4;
    var hint = panelSave.add('statictext', undefined, t('desc.saveForWeb'));

    var panelMode = parent.add('panel', undefined, t('outputs.exportMode'));
    panelMode.alignChildren = 'left';
    var mRow = panelMode.add('group');
    var rbNormal = mRow.add('radiobutton', undefined, t('outputs.normal'));
    var rbGroups = mRow.add('radiobutton', undefined, t('outputs.byGroups'));
    rbNormal.value = (bmfState.exportMode === 'normal');
    rbGroups.value = (bmfState.exportMode === 'groups');

    ddStruct.onChange = function () { bmfState.outputStructure = ['filetype','design','none'][ddStruct.selection.index]; };
    ddLeft.onChange = function () { bmfState.namePatternLeft = ddLeft.selection.text; };
    ddRight.onChange = function () { bmfState.namePatternRight = ddRight.selection.text; };
    etPrefix.onChanging = function () { bmfState.namePrefix = etPrefix.text; };
    etSuffix.onChanging = function () { bmfState.nameSuffix = etSuffix.text; };
    cbPSD.onClick = function () { bmfState.exportPSD = cbPSD.value; };
    cbJPG.onClick = function () { bmfState.exportJPG = cbJPG.value; };
    cbWEBP.onClick = function () { bmfState.exportWEBP = cbWEBP.value; };
    etJQ.onChanging = function () { bmfState.jpgQuality = Math.max(0, Math.min(12, parseInt(etJQ.text, 10) || 12)); };
    etWQ.onChanging = function () { bmfState.webpQuality = Math.max(0, Math.min(100, parseInt(etWQ.text, 10) || 100)); };
    rbNormal.onClick = function(){ bmfState.exportMode = 'normal'; };
    rbGroups.onClick = function(){ bmfState.exportMode = 'groups'; };
  })(tabOutputs);

  // ========== About ==========
  (function buildAbout(parent) {
    parent.orientation = 'column';
    parent.alignChildren = 'left';
    var txt = parent.add('statictext', undefined, t('aboutText'), { multiline: true });
    txt.preferredSize.width = 520;

    var row = parent.add('group');
    var btnHelp = row.add('button', undefined, t('buttons.help'));
    var btnContact = row.add('button', undefined, t('buttons.contact'));
    var btnFree = row.add('button', undefined, t('buttons.free'));
    var btnChangelog = row.add('button', undefined, t('buttons.changelog'));
    var btnSupport = row.add('button', undefined, t('buttons.support'));
    var btnMore = row.add('button', undefined, t('buttons.more'));
    var btnCheck = row.add('button', undefined, t('buttons.check'));

    var langRow = parent.add('group');
    langRow.add('statictext', undefined, t('language'));
    var langDd = langRow.add('dropdownlist', undefined, ['Русский', 'English']);
    langDd.selection = (getLangCode() === 'ru') ? 0 : 1;
    langDd.onChange = function(){
      bmfState.language = (langDd.selection.index === 0) ? 'ru' : 'en';
      try { win.close(); } catch (e) {}
      $.global.BMF_WIN = createUI();
      $.global.BMF_WIN.center();
      $.global.BMF_WIN.show();
    };

    function stub(name){ alert(name + ': ссылка будет добавлена позже'); }
    btnHelp.onClick = function(){ stub('Help'); };
    btnContact.onClick = function(){ stub('Contact'); };
    btnFree.onClick = function(){ stub('Free Mockups'); };
    btnChangelog.onClick = function(){ stub('Changelog'); };
    btnSupport.onClick = function(){ stub('Support'); };
    btnMore.onClick = function(){ stub('More Plugin'); };
    btnCheck.onClick = function(){ stub('Check for Updates'); };
  })(tabAbout);

  // Нижняя панель: кнопки и прогресс
  var bottom = win.add('group');
  bottom.alignChildren = 'left';
  var btnRun = bottom.add('button', undefined, t('buttons.run'));
  var btnSave = bottom.add('button', undefined, t('buttons.save'));
  var btnLoad = bottom.add('button', undefined, t('buttons.load'));
  var btnReset = bottom.add('button', undefined, t('buttons.reset'));
  var btnCancel = bottom.add('button', undefined, t('buttons.cancel'));
  var prog = bottom.add('progressbar', undefined, 0, 100);
  prog.preferredSize.width = 200;
  var logBox = win.add('edittext', undefined, '', { multiline: true, readonly: true, scrolling: true });
  logBox.preferredSize.height = 100;

  // Заглушки обработчиков — только изменение состояния/закрытие окна
  btnRun.onClick = function () {
    try {
      runBatch(bmfState, prog, function(msg){ appendLog(logBox, msg); });
      // Закрыть окно после успешного завершения
      win.close(1);
    } catch (e) {
      appendLog(logBox, 'Error: ' + e);
      alert('Error: ' + e);
    }
  };
  btnSave.onClick = function () {
    try {
      savePresetDialog();
    } catch (e) { alert('Preset save error: ' + e); }
  };
  btnLoad.onClick = function () {
    try {
      loadPresetDialog();
    } catch (e) { alert('Preset load error: ' + e); }
  };
  btnReset.onClick = function () {
    bmfState = deepClone(BMF_DEFAULT_PRESET);
    alert('UI reset to defaults');
  };
  btnCancel.onClick = function () { win.close(); };

  win.onResizing = win.onResize = function () {
    win.layout.resize();
  };

  return win;
}

// Запуск UI (singleton через $.global, чтобы окно не закрывалось при завершении скрипта)
try {
  if (!$.global.BMF_WIN || !($.global.BMF_WIN instanceof Window)) {
    $.global.BMF_WIN = createUI();
  }
  var bmfWin = $.global.BMF_WIN;
  bmfWin.center();
  bmfWin.show();
} catch (e) {
  alert('UI init error: ' + e);
}

// ================= Batch Engine (минимальная связка, без экспорта) =================
#include "lib/fs-utils.jsxinc"
#include "lib/ps-utils.jsxinc"

function runBatch(preset, progressBar, logger) {
  if (!preset.mockupsPath || !preset.designsPath || !preset.outputPath) {
    throw new Error('Specify mockups, designs and output folders in Inputs tab.');
  }

  var mockups = scanFiles(preset.mockupsPath, ['psd', 'psb'], !!preset.mockupsIncludeSubfolders);
  var designs = scanFiles(preset.designsPath, ['psd','psb','png','jpg','jpeg','tif','tiff'], !!preset.designsIncludeSubfolders);
  if (mockups.length === 0) throw new Error('No mockups found.');
  if (designs.length === 0) throw new Error('No designs found.');

  var total = mockups.length * (preset.imageAdvance === 'same' ? 1 : designs.length);
  if (progressBar) { progressBar.maxvalue = total; progressBar.value = 0; }

  var designIndex = 0;
  for (var i = 0; i < mockups.length; i++) {
    var mockFile = mockups[i];
    var doc = app.open(mockFile);
    if (logger) logger('Opened mockup: ' + mockFile.name);
    try {
      var targets = findSmartObjectsByName(doc, preset.targetLayerName);
      if (targets.length === 0) {
        if (logger) logger('No target layers in ' + mockFile.name);
        // нет целевых слоёв — пропускаем
      } else {
        if (preset.imageAdvance === 'same') designIndex = 0; // один дизайн на все макеты
        for (var d = 0; d < designs.length; d++) {
          var designFile = designs[designIndex % designs.length];
          if (logger) logger('Applying design: ' + File(designFile).name);
          for (var t = 0; t < targets.length; t++) {
            replaceSmartObjectContent(targets[t], designFile, preset.resizeMode, { x: preset.alignX, y: preset.alignY }, preset.customScale);
            if (preset.layerMode === 'single') break; // только первый найденный слой
          }
          designIndex++;
          if (preset.imageAdvance === 'same') break; // один дизайн на макет
          // Экспорт будет добавлен на этапе exporters
          if (logger) logger('Exporting result...');
          if (preset.exportMode === 'groups') {
            exportByGroups(doc, preset, stripExt(mockFile.name), stripExt(File(designFile).name));
          } else {
            exportAllRequested(doc, preset, stripExt(mockFile.name), stripExt(File(designFile).name));
          }
          if (progressBar) progressBar.value++;
        }
      }
    } finally {
      // Закрыть без сохранения исходника
      doc.close(SaveOptions.DONOTSAVECHANGES);
    }
  }
}

function appendLog(logEdit, msg){
  try {
    var now = new Date();
    var line = '[' + now.toTimeString().split(' ')[0] + '] ' + msg + '\n';
    logEdit.text += line;
  } catch (e) {}
}

function stripExt(name){
  var i = name.lastIndexOf('.');
  return i>-1 ? name.substring(0,i) : name;
}

// ================= Exporters =================
function exportAllRequested(doc, preset, mockupName, designName) {
  var baseName = buildOutputName(preset, mockupName, designName);
  var outDir = buildOutputDir(preset, preset.outputPath, preset.outputStructure, preset.exportJPG ? 'JPG' : (preset.exportWEBP ? 'WEBP' : 'PSD'), designName);
  var outFolder = new Folder(outDir);
  if (!outFolder.exists) outFolder.create();

  if (preset.exportPSD) {
    var psdFile = new File(joinPath(outDir, baseName + '.psd'));
    var saveOpts = new PhotoshopSaveOptions();
    doc.saveAs(psdFile, saveOpts, true, Extension.LOWERCASE);
  }
  if (preset.exportJPG) {
    var jpg = new File(joinPath(outDir, baseName + '.jpg'));
    var opt = new ExportOptionsSaveForWeb();
    opt.format = SaveDocumentType.JPEG;
    opt.includeProfile = false; opt.interlaced = false; opt.optimized = true;
    opt.quality = Math.max(0, Math.min(100, Math.round((preset.jpgQuality / 12) * 100)));
    doc.exportDocument(jpg, ExportType.SAVEFORWEB, opt);
  }
  if (preset.exportWEBP) {
    // Попытка через Save for Web, если доступен WEBP (в новых версиях есть)
    try {
      var webp = new File(joinPath(outDir, baseName + '.webp'));
      var optw = new ExportOptionsSaveForWeb();
      optw.format = SaveDocumentType.WEBP;
      optw.includeProfile = false; optw.interlaced = false; optw.optimized = true;
      optw.quality = Math.max(0, Math.min(100, preset.webpQuality));
      doc.exportDocument(webp, ExportType.SAVEFORWEB, optw);
    } catch (e) {
      // graceful fallback: пропускаем WEBP
    }
  }
}

function buildOutputName(preset, mockupName, designName) {
  var left = (preset.namePatternLeft === 'Design Name') ? designName : mockupName;
  var right = (preset.namePatternRight === 'Mockup Name') ? mockupName : designName;
  var core = left + ' ' + right;
  if (preset.namePrefix) core = preset.namePrefix + core;
  if (preset.nameSuffix) core = core + preset.nameSuffix;
  return safeName(core);
}

function buildOutputDir(preset, base, structure, primaryType, designName) {
  if (structure === 'filetype') return joinPath(base, primaryType);
  if (structure === 'design') return joinPath(base, safeName(designName));
  return base;
}

function exportByGroups(doc, preset, mockupName, designName) {
  // Сохраняем текущую видимость верхнеуровневых групп
  var groups = [];
  for (var i = 0; i < doc.layers.length; i++) {
    var lyr = doc.layers[i];
    if (lyr.typename === 'LayerSet') groups.push(lyr);
  }
  if (groups.length === 0) { exportAllRequested(doc, preset, mockupName, designName); return; }

  var saved = [];
  for (var g = 0; g < groups.length; g++) saved[g] = groups[g].visible;

  for (var k = 0; k < groups.length; k++) {
    // Показать только одну группу
    for (var h = 0; h < groups.length; h++) groups[h].visible = false;
    groups[k].visible = true;

    var groupName = stripExt(groups[k].name);
    var originalSuffix = preset.nameSuffix;
    preset.nameSuffix = (originalSuffix || '') + ('_' + safeName(groupName));
    exportAllRequested(doc, preset, mockupName, designName);
    preset.nameSuffix = originalSuffix; // вернуть
  }

  // Восстановить видимость
  for (var r = 0; r < groups.length; r++) groups[r].visible = saved[r];
}

// ================= Presets IO =================
function savePresetDialog() {
  var f = File.saveDialog('Save preset JSON', 'JSON:*.json');
  if (!f) return;
  writeJSON(f.fsName, bmfState);
}

function loadPresetDialog() {
  var f = File.openDialog('Load preset JSON', 'JSON:*.json');
  if (!f) return;
  var data = readJSON(f.fsName);
  if (data) { bmfState = data; alert('Preset loaded'); }
}


