/*
  BulkMockupsFiller_UI.jsx
  Чистый интерфейс ScriptUI (без бизнес‑логики) для редактирования в онлайн‑инструментах.
*/

#target photoshop

var BMF_DEFAULT_PRESET = {
  targetLayerName: 'Design',
  resizeMode: 'fit',
  customScale: 100,
  alignX: 'center',
  alignY: 'middle',
  exportPSD: true,
  exportJPG: true,
  jpgQuality: 12,
  exportWEBP: true,
  webpQuality: 100,
  outputStructure: 'filetype',
  namePatternLeft: 'Design Name',
  namePatternRight: 'Mockup Name',
  namePrefix: '',
  nameSuffix: '',
  layerMode: 'multiple',
  imageAdvance: 'next',
  language: '',
  exportMode: 'normal'
};

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
  var preset = BMF_DEFAULT_PRESET; // локальный стейт только для превью
  var win = new Window('dialog', t('title'), undefined, { resizeable: true });
  win.alignChildren = 'fill';
  var tabs = win.add('tabbedpanel');
  tabs.alignChildren = 'fill';
  tabs.preferredSize = [600, 380];
  win.minimumSize = [560, 340];

  var tabInputs = tabs.add('tab', undefined, t('tabs.inputs'));
  var tabSettings = tabs.add('tab', undefined, t('tabs.settings'));
  var tabOutputs = tabs.add('tab', undefined, t('tabs.outputs'));
  var tabAbout = tabs.add('tab', undefined, t('tabs.about'));

  (function buildInputs(parent) {
    parent.orientation = 'column';
    parent.alignChildren = 'fill';

    var grpMockups = parent.add('panel', undefined, t('panels.mockups'));
    grpMockups.alignChildren = 'left';
    grpMockups.margins = 10;
    var rowM1 = grpMockups.add('group');
    rowM1.add('statictext', undefined, t('desc.mockups'));
    rowM1.add('button', undefined, t('buttons.browse'));
    var rowM2 = grpMockups.add('group');
    rowM2.add('checkbox', undefined, t('includeSub'));

    var grpDesigns = parent.add('panel', undefined, t('panels.designs'));
    grpDesigns.alignChildren = 'left';
    grpDesigns.margins = 10;
    var rowD1 = grpDesigns.add('group');
    rowD1.add('statictext', undefined, t('desc.designs'));
    rowD1.add('button', undefined, t('buttons.browse'));
    var rowD2 = grpDesigns.add('group');
    rowD2.add('checkbox', undefined, t('includeSub'));

    var grpOutput = parent.add('panel', undefined, t('panels.output'));
    grpOutput.alignChildren = 'left';
    grpOutput.margins = 10;
    var rowO1 = grpOutput.add('group');
    rowO1.add('statictext', undefined, t('desc.output'));
    rowO1.add('button', undefined, t('buttons.browse'));
  })(tabInputs);

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
    var etName = nameGrp.add('edittext', undefined, preset.targetLayerName);
    etName.characters = 20;

    var modeRow = panelLayer.add('group');
    modeRow.add('statictext', undefined, t('settings.layerCount'));
    modeRow.add('radiobutton', undefined, t('settings.single'));
    var rbMultiple = modeRow.add('radiobutton', undefined, t('settings.multiple'));
    rbMultiple.value = true;

    var imageRow = panelLayer.add('group');
    imageRow.add('statictext', undefined, t('settings.imageSource'));
    imageRow.add('radiobutton', undefined, t('settings.same'));
    var rbNext = imageRow.add('radiobutton', undefined, t('settings.next'));
    rbNext.value = true;

    var panelResize = parent.add('panel', undefined, t('panels.resizing'));
    panelResize.alignChildren = 'left';
    var rRow = panelResize.add('group');
    rRow.add('radiobutton', undefined, t('settings.none'));
    rRow.add('radiobutton', undefined, t('settings.fill'));
    var rbFit = rRow.add('radiobutton', undefined, t('settings.fit'));
    rRow.add('radiobutton', undefined, t('settings.stretch'));
    rRow.add('radiobutton', undefined, t('settings.custom'));
    rbFit.value = true;
    var scaleGrp = panelResize.add('group');
    var etScale = scaleGrp.add('edittext', undefined, preset.customScale);
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
  })(tabSettings);

  (function buildOutputs(parent) {
    parent.orientation = 'column';
    parent.alignChildren = 'fill';

    var panelStruct = parent.add('panel', undefined, t('panels.outputStructure'));
    panelStruct.alignChildren = 'left';
    var sRow = panelStruct.add('group');
    var ddStruct = sRow.add('dropdownlist', undefined, [t('outputs.fileTypeFolder'), t('outputs.designsName'), t('outputs.none')]);
    ddStruct.selection = 0;
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
    sRow1.add('checkbox', undefined, t('outputs.psd')).value = true;
    sRow1.add('checkbox', undefined, t('outputs.jpg')).value = true;
    sRow1.add('edittext', undefined, '12').characters = 3;
    sRow1.add('checkbox', undefined, t('outputs.webp')).value = true;
    sRow1.add('edittext', undefined, '100').characters = 4;
    panelSave.add('statictext', undefined, t('desc.saveForWeb'));

    var panelMode = parent.add('panel', undefined, t('outputs.exportMode'));
    panelMode.alignChildren = 'left';
    var mRow = panelMode.add('group');
    mRow.add('radiobutton', undefined, t('outputs.normal')).value = true;
    mRow.add('radiobutton', undefined, t('outputs.byGroups'));
  })(tabOutputs);

  (function buildAbout(parent) {
    parent.orientation = 'column';
    parent.alignChildren = 'left';
    var txt = parent.add('statictext', undefined, t('aboutText'), { multiline: true });
    txt.preferredSize.width = 520;
    var row = parent.add('group');
    row.add('button', undefined, t('buttons.help'));
    row.add('button', undefined, t('buttons.contact'));
    row.add('button', undefined, t('buttons.free'));
    row.add('button', undefined, t('buttons.changelog'));
    row.add('button', undefined, t('buttons.support'));
    row.add('button', undefined, t('buttons.more'));
    row.add('button', undefined, t('buttons.check'));
  })(tabAbout);

  var bottom = win.add('group');
  bottom.alignChildren = 'left';
  bottom.add('button', undefined, 'Run');
  bottom.add('button', undefined, 'Save');
  bottom.add('button', undefined, 'Load');
  bottom.add('button', undefined, 'Reset');
  bottom.add('button', undefined, 'Cancel');
  var prog = bottom.add('progressbar', undefined, 0, 100);
  prog.preferredSize.width = 200;
  win.add('edittext', undefined, '', { multiline: true, readonly: true, scrolling: true }).preferredSize.height = 100;

  return win;
}

var w = createUI();
w.center();
w.show();


