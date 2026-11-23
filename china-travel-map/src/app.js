(function () {
  'use strict';

  const DATA = window.__CHINA_SEASON_DATA__;
  const MAP = DATA.map;
  const CITIES = MAP.cities;
  const SPOTS = DATA.spots;
  const SPOT_BY_ID = new Map(SPOTS.map(s => [s.id, s]));
  const CITY_BY_ADCODE = new Map(CITIES.map(c => [c.a, c]));

  const $ = (sel, root = document) => root.querySelector(sel);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const pad2 = n => String(n).padStart(2, '0');
  const SVGNS = 'http://www.w3.org/2000/svg';

  const MONTHS = [
    {
      name: '一月', en: 'JANUARY', season: '隆冬', headline: '雪国与暖海', seal: '岁暮天寒',
      poem: '千里冰封，万里雪飘', accent: '#9dd8e6', accent2: '#5fa9c4',
      hud: '冰雪、暖海与越冬候鸟',
      copy: '北国冰封，南国暖阳。冰雪与暖海，是这个国家冬天的一体两面。三月再来的春天，先在海南与滇南落脚。',
      keywords: ['冰雪', '暖冬', '候鸟']
    },
    {
      name: '二月', en: 'FEBRUARY', season: '早春', headline: '春从西南来', seal: '东风解冻',
      poem: '律回岁晚冰霜少，春到人间草木知', accent: '#e9c584', accent2: '#c79a57',
      hud: '油菜花从西南点亮春天',
      copy: '罗平的油菜花先醒，元阳的梯田接住天光。当北方还在等雪化，西南山谷已经悄悄入春。',
      keywords: ['油菜花', '梯田', '早春']
    },
    {
      name: '三月', en: 'MARCH', season: '仲春', headline: '花事初盛', seal: '桃始华',
      poem: '桃之夭夭，灼灼其华', accent: '#f1a8b7', accent2: '#c77f8f',
      hud: '桃花、樱花与油菜花同框',
      copy: '桃花、樱花、油菜花同时上线，江南与藏东南进入一年中最柔软的时刻。风一过，山河都在落花瓣。',
      keywords: ['桃花', '樱花', '油菜花']
    },
    {
      name: '四月', en: 'APRIL', season: '暮春', headline: '山花烂漫', seal: '春和景明',
      poem: '人间四月芳菲尽，山寺桃花始盛开', accent: '#eb9ba9', accent2: '#c47786',
      hud: '牡丹压轴，春色抵达顶点',
      copy: '杏花沟的野杏开过雪线，洛阳牡丹压轴。春天在这一月抵达顶点，然后准备把山河交给夏天。',
      keywords: ['牡丹', '杏花', '春山']
    },
    {
      name: '五月', en: 'MAY', season: '初夏', headline: '山水初绿', seal: '万物并秀',
      poem: '绿树阴浓夏日长，楼台倒影入池塘', accent: '#9bcf9f', accent2: '#6ea374',
      hud: '山色初绿，水量渐丰',
      copy: '山色初绿，水量渐丰。武陵源、武夷山与漓江，都在等一场初夏的雨，把自己洗成最浓的绿。',
      keywords: ['新绿', '峡谷', '烟雨']
    },
    {
      name: '六月', en: 'JUNE', season: '初夏', headline: '草原将绿', seal: '夏木成阴',
      poem: '晴日暖风生麦气，绿阴幽草胜花时', accent: '#78cba3', accent2: '#4e9f77',
      hud: '草原返青，独库将启',
      copy: '草原返青，湖水转蓝，独库公路即将通车。中国最舒服的远行季，从六月正式开场。',
      keywords: ['草原', '湖泊', '公路']
    },
    {
      name: '七月', en: 'JULY', season: '盛夏', headline: '向凉而行', seal: '盛夏流金',
      poem: '携杖来追柳外凉，画桥南畔倚胡床', accent: '#61c8b1', accent2: '#3a9a86',
      hud: '去高原与草原寻找二十度',
      copy: '把夏天交给高原与草原：青海湖、呼伦贝尔、伊犁，平均气温只有二十度，风吹过来都是凉的。',
      keywords: ['高原', '花海', '避暑']
    },
    {
      name: '八月', en: 'AUGUST', season: '盛夏', headline: '山海清凉', seal: '夏山如碧',
      poem: '山光忽西落，池月渐东上', accent: '#82d6b2', accent2: '#53a987',
      hud: '丰水瀑布与清凉海岸',
      copy: '丰水期的瀑布最壮观，海边的风正好。向北避暑，或向西南看水，盛夏也有两种解法。',
      keywords: ['瀑布', '海岸', '清凉']
    },
    {
      name: '九月', en: 'SEPTEMBER', season: '初秋', headline: '第一抹黄', seal: '一叶知秋',
      poem: '自古逢秋悲寂寥，我言秋日胜春朝', accent: '#e8c469', accent2: '#bd9641',
      hud: '北疆的第一抹秋色',
      copy: '第一抹秋色从北疆开始，喀纳斯与禾木进入一年中最短的黄金期。秋天来得很快，值得追。',
      keywords: ['秋色', '白桦', '金色']
    },
    {
      name: '十月', en: 'OCTOBER', season: '深秋', headline: '层林尽染', seal: '霜染山河',
      poem: '停车坐爱枫林晚，霜叶红于二月花', accent: '#efa25c', accent2: '#bf7434',
      hud: '层林尽染的黄金月份',
      copy: '层林尽染的十月：九寨沟、香山、额济纳、塔川，各自抵达颜值巅峰。这是一年里最慷慨的调色盘。',
      keywords: ['彩林', '胡杨', '红叶']
    },
    {
      name: '十一月', en: 'NOVEMBER', season: '暮秋', headline: '银杏与晒秋', seal: '橙黄橘绿',
      poem: '一年好景君须记，最是橙黄橘绿时', accent: '#db9161', accent2: '#a9663c',
      hud: '银杏、晒秋与冬樱花',
      copy: '银杏落满村落，晒秋铺满山墙。南方的秋天来得慢，却最浓；而冬樱已经在云南的山谷里酝酿。',
      keywords: ['银杏', '晒秋', '古村']
    },
    {
      name: '十二月', en: 'DECEMBER', season: '初冬', headline: '雪落山河', seal: '围炉听雪',
      poem: '晚来天欲雪，能饮一杯无', accent: '#a6d8e5', accent2: '#6aa9ba',
      hud: '雪国、冬樱与暖海',
      copy: '雪落北国，冬樱盛开。去雪乡看雪，去无量山看春天提前发生，或者飞去三亚，把冬天过成夏天。',
      keywords: ['初雪', '冬樱', '暖海']
    }
  ];

  const LIVE_MONTHS = [
    { headline: '向南避寒', copy: '北国干冷，岭南、海南与滇南进入避寒窗口；云贵高原昼暖夜凉，晒太阳要趁中午。', keywords: ['避寒', '干爽', '暖阳'] },
    { headline: '早春微凉', copy: '南方湿冷渐退，华南与滇南先回暖；北方仍在供暖季里等春天，江南时晴时雨。', keywords: ['回温', '干爽', '早春'] },
    { headline: '江南回暖', copy: '江南与华中气温回升，华南开始潮湿，云南与四川盆地春意最浓，北方昼夜温差仍大。', keywords: ['回暖', '湿润', '春花'] },
    { headline: '春和景明', copy: '华东、华中进入一年中最温润的时段，华南湿热渐起，青藏高原风大干爽、日照很强。', keywords: ['温润', '少雨', '春光'] },
    { headline: '最舒适月份', copy: '华东、华北与东北南部体感最佳；华南进入前汛期，西北昼夜温差大，高原午后偏晒。', keywords: ['舒适', '干爽', '初夏'] },
    { headline: '梅雨与初夏', copy: '北方初夏干爽，江南进入梅雨，华南闷热多雨；青藏与云贵高原凉爽，是避暑的前站。', keywords: ['梅雨', '避暑', '高原'] },
    { headline: '向凉而行', copy: '避暑去高原与北方：昆明、西宁、呼和浩特体感舒适；华东华中湿热，华南进入台风季。', keywords: ['避暑', '高原', '干爽'] },
    { headline: '避暑正当时', copy: '北方和云贵高原最舒服，长江中下游仍在闷热中，华南多雨；海岛与高海拔目的地更宜久住。', keywords: ['清凉', '高原', '海风'] },
    { headline: '秋高气爽', copy: '秋高气爽从北方开始，华东渐入佳境，华南仍偏热；西北昼夜温差拉大，早添衣。', keywords: ['秋爽', '干爽', '温差'] },
    { headline: '黄金舒适月', copy: '全国舒适窗口最广的月份之一：华东华中干爽，北方转凉，华南也开始变得宜人。', keywords: ['黄金月', '干爽', '秋高气爽'] },
    { headline: '南方正好', copy: '南方进入最舒服的深秋，北方已冷，华南沿海仍温暖；江南银杏与薄雾一起到来。', keywords: ['深秋', '温润', '南方'] },
    { headline: '向南过冬', copy: '避寒去海南、滇南与闽南；北方干冷，江南湿冷，云贵高原白天温暖、夜里寒凉。', keywords: ['避寒', '暖冬', '干冷'] }
  ];

  const CAPITALS = [
    { n: '北京', o: [116.4074, 39.9042], major: true },
    { n: '天津', o: [117.2008, 39.0842], major: true },
    { n: '上海', o: [121.4737, 31.2304], major: true },
    { n: '重庆', o: [106.5516, 29.5630], major: true },
    { n: '广州', o: [113.2644, 23.1291] },
    { n: '成都', o: [104.0665, 30.5728] },
    { n: '武汉', o: [114.3054, 30.5931] },
    { n: '西安', o: [108.9398, 34.3416] },
    { n: '南京', o: [118.7969, 32.0603] },
    { n: '杭州', o: [120.1551, 30.2741] },
    { n: '合肥', o: [117.2272, 31.8206] },
    { n: '济南', o: [117.1201, 36.6512] },
    { n: '郑州', o: [113.6254, 34.7466] },
    { n: '长沙', o: [112.9388, 28.2282] },
    { n: '南昌', o: [115.8582, 28.6829] },
    { n: '福州', o: [119.2965, 26.0745] },
    { n: '台北', o: [121.5654, 25.0330] },
    { n: '石家庄', o: [114.5149, 38.0428] },
    { n: '太原', o: [112.5489, 37.8706] },
    { n: '呼和浩特', o: [111.7492, 40.8426] },
    { n: '沈阳', o: [123.4315, 41.8057] },
    { n: '长春', o: [125.3235, 43.8171] },
    { n: '哈尔滨', o: [126.5349, 45.8038] },
    { n: '南宁', o: [108.3669, 22.8170] },
    { n: '海口', o: [110.1983, 20.0440] },
    { n: '贵阳', o: [106.6302, 26.6477] },
    { n: '昆明', o: [102.8329, 24.8801] },
    { n: '拉萨', o: [91.1409, 29.6456] },
    { n: '兰州', o: [103.8343, 36.0611] },
    { n: '西宁', o: [101.7782, 36.6171] },
    { n: '银川', o: [106.2309, 38.4872] },
    { n: '乌鲁木齐', o: [87.6168, 43.8256] },
    { n: '香港', o: [114.1694, 22.3193], major: true },
    { n: '澳门', o: [113.5439, 22.1987], major: true }
  ];

  const CAP_OFFSETS = {
    '北京': [12, -16], '天津': [14, 10], '石家庄': [10, -13],
    '太原': [-30, 8], '呼和浩特': [10, -12],
    '沈阳': [10, -12], '长春': [10, -12], '哈尔滨': [12, -12],
    '上海': [16, 10], '南京': [-34, -12], '杭州': [14, 30], '合肥': [-34, 12],
    '福州': [12, 14], '南昌': [12, 18], '济南': [12, -14], '郑州': [-14, 18],
    '武汉': [12, 16], '长沙': [-22, 18], '广州': [-14, 18], '南宁': [-30, 12],
    '海口': [14, 12], '成都': [-30, -10], '重庆': [12, 10], '贵阳': [-30, 10],
    '昆明': [-30, 10], '拉萨': [-30, 8], '西安': [-30, -10], '兰州': [-30, -6],
    '西宁': [-30, -4], '银川': [12, -12], '乌鲁木齐': [-30, -10], '台北': [14, 8],
    '香港': [14, 8], '澳门': [-30, 16]
  };

  const MONTH_RANK = Array.from({ length: 13 }, () => []);
  for (let m = 1; m <= 12; m++) {
    MONTH_RANK[m] = SPOTS.slice().sort((a, b) => b.s[m - 1] - a.s[m - 1] || a.n.localeCompare(b.n, 'zh'));
  }

  CITIES.forEach(c => {
    c.spots = [];
    c.score = new Array(13).fill(0);
    c.el = null;
    c.bbox = null;
  });
  SPOTS.forEach(s => {
    const c = CITY_BY_ADCODE.get(s.a);
    s.cityRef = c;
    if (!c) return;
    c.spots.push(s);
    for (let m = 1; m <= 12; m++) c.score[m] = Math.max(c.score[m], s.s[m - 1]);
  });
  CITIES.forEach(c => c.spots.sort((a, b) => b.s[3] - a.s[3] || a.n.localeCompare(b.n, 'zh')));

  // monthly aggregates from the 24 half-month climate normals
  CITIES.forEach(c => {
    const cl = c.cl;
    if (!cl || !cl.hs || cl.hs.length !== 24) { c.cl = null; return; }
    const avg2 = arr => Array.from({ length: 12 }, (_, m) => (arr[m * 2] + arr[m * 2 + 1]) / 2);
    const rawScores = avg2(cl.hs);
    cl.msf = rawScores.map(v => Math.round(v * 10) / 10);
    cl.ms = rawScores.map(v => Math.round(v));
    cl.mt = avg2(cl.ht).map(v => Math.round(v * 10) / 10);
    cl.mapp = avg2(cl.ha).map(v => Math.round(v * 10) / 10);
    cl.mrh = avg2(cl.hr).map(v => Math.round(v));
    cl.mwet = avg2(cl.hw).map(v => Math.round(v));
    cl.mtx = avg2(cl.htx).map(v => Math.round(v * 10) / 10);
    cl.mtn = avg2(cl.htn).map(v => Math.round(v * 10) / 10);
  });

  const CITY_RANK = Array.from({ length: 13 }, () => []);
  for (let m = 1; m <= 12; m++) {
    CITY_RANK[m] = CITIES.filter(c => c.cl)
      .sort((a, b) => b.cl.msf[m - 1] - a.cl.msf[m - 1] || a.n.localeCompare(b.n, 'zh'));
  }

  const COST_RANK = CITIES.filter(c => c.cost)
    .sort((a, b) => a.cost.i - b.cost.i || a.n.localeCompare(b.n, 'zh'));

  const COST_STOPS = [
    [50, [45, 78, 84]],
    [65, [72, 117, 111]],
    [80, [139, 158, 113]],
    [92, [193, 165, 94]],
    [105, [219, 131, 85]],
    [120, [226, 92, 66]],
    [135, [239, 78, 68]]
  ];
  const COST_PALETTE = Array.from({ length: 86 }, (_, k) => {
    const s = 50 + k;
    for (let i = 1; i < COST_STOPS.length; i++) {
      const [b, cb] = COST_STOPS[i];
      const [a, ca] = COST_STOPS[i - 1];
      if (s <= b) return mix(ca, cb, (s - a) / (b - a));
    }
    return COST_STOPS[COST_STOPS.length - 1][1];
  });

  function costColor(index) {
    return COST_PALETTE[clamp(Math.round(index) - 50, 0, 85)];
  }

  const COMFORT_STOPS = [
    [0, [31, 54, 66]],
    [35, [39, 75, 84]],
    [55, [64, 112, 100]],
    [70, [126, 150, 108]],
    [82, [187, 178, 112]],
    [92, [226, 197, 126]],
    [100, [246, 221, 168]]
  ];
  const COMFORT_PALETTE = Array.from({ length: 101 }, (_, s) => {
    for (let i = 1; i < COMFORT_STOPS.length; i++) {
      const [b, cb] = COMFORT_STOPS[i];
      const [a, ca] = COMFORT_STOPS[i - 1];
      if (s <= b) {
        const t = (s - a) / (b - a);
        return mix(ca, cb, t);
      }
    }
    return COMFORT_STOPS[COMFORT_STOPS.length - 1][1];
  });

  function comfortColor(score) {
    return COMFORT_PALETTE[clamp(Math.round(score), 0, 100)];
  }


  const state = {
    month: 4,
    mode: 'travel',
    hoverSpot: null,
    hoverCity: null,
    focusedCity: null,
    selected: null,
    selectedCity: null,
    auto: false,
    autoTimer: 0,
    view: { x: 0, y: 0, k: 1 },
    dragging: false,
    moved: 0,
    pointer: { x: 0, y: 0, downX: 0, downY: 0, startX: 0, startY: 0, id: null },
    size: { w: 0, h: 0 },
    scale: 1,
    ox: 0,
    oy: 0,
    ready: false,
    cityEls: false,
    capitalEls: false,
    capitalBoxes: [],
    spotBoxes: [],
    markerItems: [],
    reserved: [],
    viewAnim: 0,
    lastHoverCheck: 0,
    lastOverlay: 0
  };

  const stage = $('#mapStage');
  const mapSvg = $('#mapSvg');
  const mapViewport = $('#mapViewport');
  const cityLayer = $('#cityLayer');
  const capitalLayer = $('#capitalLayer');
  const markerLayer = $('#markerLayer');
  const graticule = $('#graticule');
  const detailDialog = $('#detailDialog');
  const cityDialog = $('#cityDialog');
  const mapTip = $('#mapTip');
  const modeButtons = Array.from(document.querySelectorAll('.mode-btn'));

  let accentRgb = [235, 155, 169];

  /* ---------------- color helpers ---------------- */
  function hexToRgb(hex) {
    const h = hex.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }

  function rgbToHex(rgb) {
    return '#' + rgb.map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');
  }

  function rgba(rgb, a) {
    return 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + a + ')';
  }

  function mix(a, b, t) {
    return [
      Math.round(a[0] + (b[0] - a[0]) * t),
      Math.round(a[1] + (b[1] - a[1]) * t),
      Math.round(a[2] + (b[2] - a[2]) * t)
    ];
  }

  function lighten(rgb, t) {
    return mix(rgb, [255, 247, 226], t);
  }

  function hslToRgb(h, s, l) {
    h = ((h % 360) + 360) % 360 / 360;
    s /= 100;
    l /= 100;
    if (s === 0) {
      const v = Math.round(l * 255);
      return [v, v, v];
    }
    const q = l < .5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hue = t => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    return [Math.round(hue(h + 1 / 3) * 255), Math.round(hue(h) * 255), Math.round(hue(h - 1 / 3) * 255)];
  }

  function initBaseColors() {
    CITIES.forEach(c => {
      const seed = Math.sin((c.a + 37) * 12.9898) * 43758.5453;
      const h1 = seed - Math.floor(seed);
      const h2 = Math.sin((c.a + 113) * 78.233) * 12345.678;
      const h3 = h2 - Math.floor(h2);
      const hue = 155 + (h1 - .5) * 50;
      const sat = 20 + h3 * 14;
      const light = 23 + h3 * 8.5;
      c.baseRgb = hslToRgb(hue, sat, light);
    });
  }

  function svgEl(tag, attrs, parent) {
    const el = document.createElementNS(SVGNS, tag);
    if (attrs) {
      for (const k in attrs) el.setAttribute(k, attrs[k]);
    }
    if (parent) parent.appendChild(el);
    return el;
  }

  /* ---------------- projection ---------------- */
  const D2R = Math.PI / 180;
  const PHI1 = 25 * D2R;
  const PHI2 = 47 * D2R;
  const PHI0 = 35 * D2R;
  const LAM0 = 105 * D2R;
  const N = (Math.sin(PHI1) + Math.sin(PHI2)) / 2;
  const C = Math.cos(PHI1) * Math.cos(PHI1) + 2 * N * Math.sin(PHI1);
  const RHO0 = Math.sqrt(C - 2 * N * Math.sin(PHI0)) / N;

  function albers(lon, lat) {
    const phi = lat * D2R;
    const lam = lon * D2R;
    const rho = Math.sqrt(Math.max(0, C - 2 * N * Math.sin(phi))) / N;
    const theta = N * (lam - LAM0);
    return [rho * Math.sin(theta), RHO0 - rho * Math.cos(theta)];
  }

  function ensureCityEls() {
    if (state.cityEls) return;
    const frag = document.createDocumentFragment();
    CITIES.forEach(c => {
      const p = svgEl('path', { class: 'map-city' });
      p.setAttribute('data-a', c.a);
      c.el = p;
      frag.appendChild(p);
    });
    cityLayer.appendChild(frag);
    state.cityEls = true;
  }

  function buildCapitalEls() {
    if (state.capitalEls) return;
    const frag = document.createDocumentFragment();
    CAPITALS.forEach(cap => {
      const g = svgEl('g', { class: 'capital' + (cap.major ? ' is-municipality' : '') });
      cap.line = svgEl('line', { class: 'capital-leader' }, g);
      cap.dot = svgEl('circle', { class: 'capital-dot', r: 2.2 }, g);
      cap.label = svgEl('text', { class: 'capital-label', 'dominant-baseline': 'central' }, g);
      cap.label.textContent = cap.n;
      cap.el = g;
      frag.appendChild(g);
    });
    capitalLayer.appendChild(frag);
    state.capitalEls = true;
  }

  function buildGraticule() {
    let d = '';
    for (let lon = 75; lon <= 135; lon += 10) {
      for (let lat = 17; lat <= 54; lat += 2) {
        const q = albers(lon, lat);
        const x = state.ox + q[0] * state.scale;
        const y = state.oy - q[1] * state.scale;
        d += (lat === 17 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1);
      }
    }
    for (let lat = 20; lat <= 50; lat += 10) {
      for (let lon = 73; lon <= 135; lon += 2) {
        const q = albers(lon, lat);
        const x = state.ox + q[0] * state.scale;
        const y = state.oy - q[1] * state.scale;
        d += (lon === 73 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1);
      }
    }
    graticule.setAttribute('d', d);
  }

  function buildSouthSea() {
    const rings = MAP.jd;
    if (!rings || !rings.length) return;
    let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;
    rings.forEach(r => r.forEach(p => {
      minLon = Math.min(minLon, p[0]); maxLon = Math.max(maxLon, p[0]);
      minLat = Math.min(minLat, p[1]); maxLat = Math.max(maxLat, p[1]);
    }));
    const vw = 100, vh = 140, pad = 10;
    const s = Math.min((vw - pad * 2) / Math.max(.001, maxLon - minLon), (vh - pad * 2) / Math.max(.001, maxLat - minLat));
    const ox = (vw - (maxLon - minLon) * s) / 2 - minLon * s;
    const oy = (vh - (maxLat - minLat) * s) / 2 + maxLat * s;
    let d = '';
    rings.forEach(r => {
      if (r.length < 3) return;
      r.forEach((p, i) => {
        const x = ox + p[0] * s;
        const y = oy - p[1] * s;
        d += (i === 0 ? 'M' : 'L') + x.toFixed(2) + ' ' + y.toFixed(2);
      });
      d += 'Z';
    });
    const path = $('#southSeaPath');
    if (path) path.setAttribute('d', d);
  }

  function buildGeometry() {
    const w = state.size.w;
    const h = state.size.h;
    if (!w || !h) return;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    CITIES.forEach(c => {
      c.proj = [];
      c.g.forEach(ring => {
        const out = new Array(ring.length);
        for (let i = 0; i < ring.length; i++) {
          const p = albers(ring[i][0], ring[i][1]);
          out[i] = p;
          if (p[0] < minX) minX = p[0];
          if (p[0] > maxX) maxX = p[0];
          if (p[1] < minY) minY = p[1];
          if (p[1] > maxY) maxY = p[1];
        }
        c.proj.push(out);
      });
    });

    const bw = Math.max(.0001, maxX - minX);
    const bh = Math.max(.0001, maxY - minY);
    const padX = Math.max(24, w * .055);
    const padTop = Math.max(58, h * .105);
    const padBottom = Math.max(58, h * .09);
    const availW = Math.max(50, w - padX * 2);
    const availH = Math.max(50, h - padTop - padBottom);
    const scale = Math.min(availW / bw, availH / bh);
    const ox = (w - bw * scale) / 2 - minX * scale;
    const oy = (h - bh * scale) / 2 + maxY * scale;
    state.scale = scale;
    state.ox = ox;
    state.oy = oy;

    CITIES.forEach(c => {
      let d = '';
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      c.proj.forEach(ring => {
        for (let i = 0; i < ring.length; i++) {
          const sx = ox + ring[i][0] * scale;
          const sy = oy - ring[i][1] * scale;
          d += (i === 0 ? 'M' : 'L') + sx.toFixed(1) + ' ' + sy.toFixed(1);
          if (sx < x0) x0 = sx;
          if (sx > x1) x1 = sx;
          if (sy < y0) y0 = sy;
          if (sy > y1) y1 = sy;
        }
        d += 'Z';
      });
      c.d = d;
      c.bbox = { x0, y0, x1, y1 };
      if (c.el) c.el.setAttribute('d', d);
    });

    SPOTS.forEach(s => {
      const q = albers(s.o[0], s.o[1]);
      s.base = [ox + q[0] * scale, oy - q[1] * scale];
    });
    CAPITALS.forEach(cap => {
      const q = albers(cap.o[0], cap.o[1]);
      cap.base = [ox + q[0] * scale, oy - q[1] * scale];
    });

    buildGraticule();
    buildSouthSea();
  }

  /* ---------------- map sizing ---------------- */
  function resizeMap(force = false) {
    const rect = stage.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    if (!force && state.ready && w === state.size.w && h === state.size.h) return;

    state.size = { w, h };
    mapSvg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    ensureCityEls();
    buildGeometry();
    state.view = { x: 0, y: 0, k: 1 };
    applyMonthColors();
    buildMarkers();
    state.ready = true;
    state.reserved = reservedBoxes();
    applyView();
  }

  /* ---------------- city colors ---------------- */
  const TRAVEL_IDLE = [20, 33, 31];
  const TRAVEL_LOW = [49, 88, 78];

  function applyMonthColors() {
    const m = state.month;
    const live = state.mode === 'live';
    const cost = state.mode === 'cost';
    CITIES.forEach(c => {
      if (!c.el) return;
      let rgb;
      let hot = false;
      if (cost) {
        const idx = c.cost ? c.cost.i : 80;
        rgb = costColor(idx);
        hot = idx >= 105;
      } else if (live) {
        const score = c.cl ? c.cl.msf[m - 1] : 45;
        rgb = comfortColor(score);
        hot = score >= 88;
      } else {
        const score = Number(c.score[m]) || 0;
        if (score >= 70) {
          const t = Math.pow(clamp((score - 70) / 29, 0, 1), .92);
          rgb = mix(TRAVEL_LOW, accentRgb, t);
          if (score >= 94) rgb = lighten(rgb, .16);
          else if (score >= 86) rgb = lighten(rgb, .06);
          hot = score >= 88;
        } else {
          rgb = TRAVEL_IDLE;
        }
      }
      c.el.style.fill = rgba(rgb, .97);
      c.el.classList.toggle('is-hot', hot);
    });
  }

  function setFocusedCity(city) {
    if (state.focusedCity === city) return;
    if (state.focusedCity && state.focusedCity.el) state.focusedCity.el.classList.remove('is-focus');
    state.focusedCity = city || null;
    if (city && city.el) city.el.classList.add('is-focus');
  }

  /* ---------------- screen overlay ---------------- */
  function screenOf(base) {
    if (!base) return [-9999, -9999];
    const v = state.view;
    return [base[0] * v.k + v.x, base[1] * v.k + v.y];
  }

  function currentTop() {
    return MONTH_RANK[state.month].slice(0, 12);
  }

  function currentCityTop() {
    return CITY_RANK[state.month].slice(0, 12);
  }

  function currentCostTop() {
    return COST_RANK.filter(c => c.cost.src === 'm').slice(0, 12);
  }

  function currentActive() {
    return SPOTS.filter(s => s.s[state.month - 1] >= 88)
      .sort((a, b) => b.s[state.month - 1] - a.s[state.month - 1]);
  }

  function reservedBoxes() {
    const sr = stage.getBoundingClientRect();
    const sel = ['.map-hud', '.map-tools', '.map-legend', '.south-sea', '.map-note'];
    const out = [];
    sel.forEach(selName => {
      const el = $(selName);
      if (!el) return;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') return;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return;
      out.push({ x: r.left - sr.left - 4, y: r.top - sr.top - 4, w: r.width + 8, h: r.height + 8 });
    });
    return out;
  }

  function boxHit(a, b, pad = 2) {
    return a.x < b.x + b.w + pad && a.x + a.w + pad > b.x && a.y < b.y + b.h + pad && a.y + a.h + pad > b.y;
  }

  function updateCapitals() {
    const { w, h } = state.size;
    if (!w || !h) return;
    const font = w < 560 ? 7.5 : w < 1000 ? 8.8 : 9.6;
    const reserved = state.reserved;
    const placed = (state.spotBoxes || []).slice();
    const capPlaced = [];
    state.capitalBoxes = [];

    const cityArr = CAPITALS.filter(c => c.base);
    cityArr.forEach(cap => {
      const [x, y] = screenOf(cap.base);
      cap.dot.setAttribute('cx', x.toFixed(1));
      cap.dot.setAttribute('cy', y.toFixed(1));
      cap.label.style.fontSize = font + 'px';
    });

    cityArr.forEach(cap => {
      const [x, y] = screenOf(cap.base);
      if (x < -40 || y < -40 || x > w + 40 || y > h + 40) {
        cap.el.style.display = 'none';
        return;
      }
      cap.el.style.display = '';
      const labelW = cap.n.length * font * 1.04 + 4;
      const labelH = font + 5;
      const manual = CAP_OFFSETS[cap.n] || [12, 10];
      const candidates = [
        manual, [12, -10], [12, 10], [-12, -10], [-12, 10],
        [18, 0], [-18, 0], [0, -17], [0, 17],
        [32, -20], [32, 20], [-32, -20], [-32, 20],
        [46, 0], [-46, 0], [0, -30], [0, 30],
        [44, -30], [44, 30], [-44, -30], [-44, 30]
      ];
      const findBox = blockers => {
        for (const [dx, dy] of candidates) {
          const cx = x + dx;
          const cy = y + dy;
          const box = { x: cx - labelW / 2, y: cy - labelH / 2, w: labelW, h: labelH };
          if (box.x < 4 || box.y < 4 || box.x + box.w > w - 4 || box.y + box.h > h - 4) continue;
          if (reserved.some(r => boxHit(box, r, 1))) continue;
          if (blockers.some(r => boxHit(box, r, 3))) continue;
          return { box, cx, cy };
        }
        return null;
      };
      let chosen = findBox(placed);
      // If the map is very dense, let a capital label sit above a scenic label
      // rather than disappear; the capital layer is painted on top.
      if (!chosen) chosen = findBox(capPlaced);
      if (!chosen) {
        cap.line.style.display = 'none';
        cap.label.style.display = 'none';
        return;
      }
      placed.push(chosen.box);
      capPlaced.push(chosen.box);
      state.capitalBoxes.push(chosen.box);
      cap.label.style.display = '';
      const dist = Math.abs(chosen.cx - x) + Math.abs(chosen.cy - y);
      if (dist < 4) {
        cap.line.style.display = 'none';
      } else {
        cap.line.style.display = '';
        cap.line.setAttribute('x1', x.toFixed(1));
        cap.line.setAttribute('y1', y.toFixed(1));
        cap.line.setAttribute('x2', chosen.cx.toFixed(1));
        cap.line.setAttribute('y2', chosen.cy.toFixed(1));
      }
      cap.label.setAttribute('x', chosen.cx.toFixed(1));
      cap.label.setAttribute('y', chosen.cy.toFixed(1));
    });
  }

  function buildMarkers() {
    markerLayer.replaceChildren();
    state.markerItems = [];
    state.spotBoxes = [];
    if (!state.size.w || state.mode !== 'travel') return;

    const top = currentTop();
    const topIds = new Set(top.map(s => s.id));
    let active = currentActive();
    if (state.selected && !active.some(s => s.id === state.selected.id)) active = active.concat([state.selected]);
    active = active.slice().sort((a, b) => (topIds.has(a.id) ? 1 : 0) - (topIds.has(b.id) ? 1 : 0) || b.s[state.month - 1] - a.s[state.month - 1]);

    active.forEach((s, idx) => {
      if (!s.base) return;
      const isTop = topIds.has(s.id);
      const g = svgEl('g', { class: 'spot-marker' + (isTop ? ' is-top' : '') }, markerLayer);
      let pulse = null;
      let ring = null;
      if (isTop) {
        pulse = svgEl('circle', { class: 'spot-pulse', r: 7 }, g);
        pulse.style.animationDelay = (-(idx % 12) * .21) + 's';
        ring = svgEl('circle', { class: 'spot-ring', r: 5.4 }, g);
      }
      const dot = svgEl('circle', { class: 'spot-dot', r: isTop ? 3.1 : 2.1 }, g);
      let label = null, bg = null, nameEl = null, scoreEl = null;
      if (isTop) {
        label = svgEl('g', { class: 'spot-label' }, g);
        bg = svgEl('rect', { class: 'spot-label-bg', rx: 3 }, label);
        nameEl = svgEl('text', { class: 'spot-label-text', 'dominant-baseline': 'central' }, label);
        scoreEl = svgEl('text', { class: 'spot-label-score', 'dominant-baseline': 'central' }, label);
      }
      state.markerItems.push({ s, g, pulse, ring, dot, label, bg, nameEl, scoreEl, top: isTop, topRank: isTop ? top.findIndex(t => t.id === s.id) : -1 });
    });
  }

  function updateMarkers() {
    const { w, h } = state.size;
    if (!w || !h || state.mode !== 'travel') return;
    const m = state.month;
    const top = currentTop();
    const topIds = new Set(top.map(s => s.id));
    const labelLimit = state.view.k < 1.45 ? 6 : 12;
    const reserved = state.reserved;
    const placed = reserved.slice();
    const spotBoxes = [];
    const selectedId = state.selected ? state.selected.id : null;
    const hoverId = state.hoverSpot ? state.hoverSpot.id : null;

    state.markerItems.forEach((item, index) => {
      const [x, y] = screenOf(item.s.base);
      if (x < -30 || y < -30 || x > w + 30 || y > h + 30) {
        item.g.style.display = 'none';
        return;
      }
      item.g.style.display = '';
      item.g.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')');
      item.g.classList.toggle('is-hover', item.s.id === hoverId);
      item.g.classList.toggle('is-selected', item.s.id === selectedId);
      if (!item.label) return;

      const force = item.s.id === hoverId || item.s.id === selectedId;
      if (item.topRank >= labelLimit && !force) {
        item.label.style.display = 'none';
        return;
      }

      const score = item.s.s[m - 1];
      const raw = item.s.n.length > 11 ? item.s.n.slice(0, 10) + '…' : item.s.n;
      const labelFont = w < 560 ? 9.2 : 10.5;
      const tw = raw.length * labelFont * 1.02;
      const bw = tw + 30;
      const bh = labelFont + 9;
      const candidates = [
        [10, -9.5], [-bw - 10, -9.5], [-bw / 2, -bh - 9],
        [-bw / 2, 9], [10, 8], [-bw - 10, 8]
      ];
      let box = null;
      for (const c of candidates) {
        const r = { x: x + c[0], y: y + c[1], w: bw, h: bh };
        if (r.x < 4 || r.y < 4 || r.x + r.w > w - 4 || r.y + r.h > h - 4) continue;
        if (placed.some(q => boxHit(r, q, 2))) continue;
        box = r;
        break;
      }
      if (!box && force) box = { x: x + 10, y: y - 9.5, w: bw, h: bh };
      if (!box) {
        item.label.style.display = 'none';
        return;
      }
      placed.push(box);
      spotBoxes.push(box);
      item.label.style.display = '';
      item.label.setAttribute('transform', 'translate(' + (box.x - x).toFixed(1) + ' ' + (box.y - y).toFixed(1) + ')');
      item.bg.setAttribute('width', bw.toFixed(1));
      item.bg.setAttribute('height', bh);
      item.nameEl.style.fontSize = labelFont + 'px';
      item.nameEl.textContent = raw;
      item.nameEl.setAttribute('x', 7);
      item.nameEl.setAttribute('y', bh / 2);
      item.scoreEl.style.fontSize = Math.max(7, labelFont - 2.5) + 'px';
      item.scoreEl.textContent = score;
      item.scoreEl.setAttribute('x', bw - 7);
      item.scoreEl.setAttribute('y', bh / 2);
    });
    state.spotBoxes = spotBoxes;
  }

  function updateOverlay() {
    if (!state.ready) return;
    const city = state.hoverCity || (state.selected && state.selected.cityRef) || state.selectedCity || null;
    setFocusedCity(city);
    updateMarkers();
    updateCapitals();
  }

  /* ---------------- view / gestures ---------------- */
  function applyView() {
    const v = state.view;
    mapViewport.setAttribute('transform', 'translate(' + v.x.toFixed(2) + ' ' + v.y.toFixed(2) + ') scale(' + v.k.toFixed(4) + ')');
    updateOverlay();
  }

  function clampView() {
    const { w, h } = state.size;
    const v = state.view;
    const mx = Math.max(18, w * .06);
    const my = Math.max(18, h * .06);
    v.x = clamp(v.x, w * (1 - v.k) - mx, mx);
    v.y = clamp(v.y, h * (1 - v.k) - my, my);
  }

  function zoomBy(factor, cx, cy) {
    cancelAnimationFrame(state.viewAnim);
    const v = state.view;
    const k0 = v.k;
    const k1 = clamp(k0 * factor, 1, 5);
    if (Math.abs(k1 - k0) < .001) return;
    v.x = cx - (cx - v.x) * (k1 / k0);
    v.y = cy - (cy - v.y) * (k1 / k0);
    v.k = k1;
    clampView();
    applyView();
  }

  function animateView(to, dur = 620) {
    cancelAnimationFrame(state.viewAnim);
    const from = { x: state.view.x, y: state.view.y, k: state.view.k };
    const t0 = performance.now();
    const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const step = now => {
      const t = clamp((now - t0) / dur, 0, 1);
      const e = ease(t);
      state.view.x = from.x + (to.x - from.x) * e;
      state.view.y = from.y + (to.y - from.y) * e;
      state.view.k = from.k + (to.k - from.k) * e;
      clampView();
      applyView();
      if (t < 1) state.viewAnim = requestAnimationFrame(step);
    };
    state.viewAnim = requestAnimationFrame(step);
  }

  function flyToSpot(s) {
    if (!s.base) return;
    const k = Math.max(3.1, Math.min(4.3, state.view.k * 2.6));
    const to = {
      k,
      x: state.size.w / 2 - s.base[0] * k,
      y: state.size.h * .54 - s.base[1] * k
    };
    const mx = Math.max(18, state.size.w * .06);
    const my = Math.max(18, state.size.h * .06);
    to.x = clamp(to.x, state.size.w * (1 - k) - mx, mx);
    to.y = clamp(to.y, state.size.h * (1 - k) - my, my);
    animateView(to, 650);
  }

  function mapPoint(e) {
    const rect = mapSvg.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
  }

  mapSvg.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    cancelAnimationFrame(state.viewAnim);
    state.dragging = true;
    state.moved = 0;
    state.pointer.id = e.pointerId;
    state.pointer.downX = e.clientX;
    state.pointer.downY = e.clientY;
    state.pointer.startX = state.view.x;
    state.pointer.startY = state.view.y;
    mapSvg.setPointerCapture(e.pointerId);
    mapSvg.classList.add('is-dragging');
    hideTip();
  });

  mapSvg.addEventListener('pointermove', e => {
    if (state.dragging) {
      const dx = e.clientX - state.pointer.downX;
      const dy = e.clientY - state.pointer.downY;
      state.moved = Math.max(state.moved, Math.abs(dx) + Math.abs(dy));
      state.view.x = state.pointer.startX + dx;
      state.view.y = state.pointer.startY + dy;
      clampView();
      applyView();
      return;
    }
    const now = performance.now();
    if (now - state.lastHoverCheck < 15) return;
    state.lastHoverCheck = now;
    updateHover(e.clientX, e.clientY);
  });

  mapSvg.addEventListener('pointerup', e => {
    if (!state.dragging) return;
    state.dragging = false;
    mapSvg.classList.remove('is-dragging');
    if (mapSvg.hasPointerCapture(e.pointerId)) mapSvg.releasePointerCapture(e.pointerId);
    if (state.moved < 6) {
      const [x, y] = mapPoint(e);
      handleMapClick(x, y);
    }
  });

  mapSvg.addEventListener('pointercancel', () => {
    state.dragging = false;
    mapSvg.classList.remove('is-dragging');
  });

  mapSvg.addEventListener('pointerleave', () => {
    if (state.dragging) return;
    state.hoverCity = null;
    state.hoverSpot = null;
    hideTip();
    mapSvg.style.cursor = 'grab';
    updateOverlay();
  });

  mapSvg.addEventListener('wheel', e => {
    e.preventDefault();
    const [x, y] = mapPoint(e);
    const factor = Math.exp(-e.deltaY * .0014);
    zoomBy(factor, x, y);
  }, { passive: false });

  /* ---------------- hit testing ---------------- */
  function pointInRing(px, py, ring) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = ring[i][0], yi = ring[i][1];
      const xj = ring[j][0], yj = ring[j][1];
      if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) inside = !inside;
    }
    return inside;
  }

  function pointInCity(px, py, city) {
    let inside = false;
    for (const ring of city.proj) {
      if (pointInRing(px, py, ring)) inside = !inside;
    }
    return inside;
  }

  function findSpotAt(x, y) {
    if (state.mode !== 'travel') return null;
    const top = currentTop();
    let best = null;
    let bestD = 14 * 14;
    top.forEach(s => {
      const p = screenOf(s.base);
      const dx = p[0] - x, dy = p[1] - y;
      const d = dx * dx + dy * dy;
      if (d < bestD) { bestD = d; best = s; }
    });
    if (best) return best;
    const active = currentActive();
    bestD = 10 * 10;
    active.forEach(s => {
      const p = screenOf(s.base);
      const dx = p[0] - x, dy = p[1] - y;
      const d = dx * dx + dy * dy;
      if (d < bestD) { bestD = d; best = s; }
    });
    return best;
  }

  function findCityAt(x, y) {
    const v = state.view;
    const bx = (x - v.x) / v.k;
    const by = (y - v.y) / v.k;
    const px = (bx - state.ox) / state.scale;
    const py = (state.oy - by) / state.scale;
    for (let i = CITIES.length - 1; i >= 0; i--) {
      const c = CITIES[i];
      if (!c.bbox) continue;
      if (bx < c.bbox.x0 || bx > c.bbox.x1 || by < c.bbox.y0 || by > c.bbox.y1) continue;
      if (pointInCity(px, py, c)) return c;
    }
    return null;
  }

  function updateHover(clientX, clientY) {
    const rect = mapSvg.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    state.pointer.x = x;
    state.pointer.y = y;

    if (state.mode === 'live' || state.mode === 'cost') {
      const c = findCityAt(x, y);
      if (state.hoverCity !== c || state.hoverSpot) {
        state.hoverCity = c;
        state.hoverSpot = null;
        updateOverlay();
      }
      if (c) {
        mapSvg.style.cursor = 'pointer';
        showCityTip(c, x, y);
      } else {
        mapSvg.style.cursor = 'grab';
        hideTip();
      }
      return;
    }

    const s = findSpotAt(x, y);
    if (s) {
      if (state.hoverSpot !== s) {
        state.hoverSpot = s;
        state.hoverCity = s.cityRef || null;
        updateOverlay();
      }
      mapSvg.style.cursor = 'pointer';
      showSpotTip(s, x, y);
      return;
    }
    const c = findCityAt(x, y);
    if (state.hoverSpot || state.hoverCity !== c) {
      state.hoverCity = c;
      state.hoverSpot = null;
      updateOverlay();
    }
    if (c) {
      mapSvg.style.cursor = 'pointer';
      showCityTip(c, x, y);
    } else {
      mapSvg.style.cursor = 'grab';
      hideTip();
    }
  }

  function showSpotTip(s, x, y) {
    const m = state.month;
    const score = s.s[m - 1];
    mapTip.innerHTML = `<div class="tip-kicker">${spotLoc(s)}</div>
      <div class="tip-title">${s.n}</div>
      <div class="tip-desc">${s.d}</div>
      <div class="tip-score"><strong>${score}</strong><span>本月推荐指数</span></div>
      <div class="tip-tags">${s.tags.map(t => `<i>${t}</i>`).join('')}</div>
      <div class="tip-hint">点击查看全年时序</div>`;
    positionTip(x, y);
  }

  function showCityTip(c, x, y) {
    const m = state.month;
    if (state.mode === 'cost' && c.cost) {
      const k = c.cost;
      mapTip.innerHTML = `<div class="tip-kicker">${c.p} · 非住房消费</div>
        <div class="tip-title">${c.n}</div>
        <div class="tip-score"><strong>${k.i}</strong><span>上海 = 100</span></div>
        <div class="tip-desc">食品 ${k.f} · 餐饮 ${k.d} · 交通 ${k.t} · 水电 ${k.u}</div>
        <div class="tip-hint">${k.src === 'm' ? 'Numbeo 实测' : '省级消费水平估算'} · 点击查看消费明细</div>`;
      positionTip(x, y);
      return;
    }
    if (state.mode === 'live' && c.cl) {
      const score = c.cl.ms[m - 1];
      mapTip.innerHTML = `<div class="tip-kicker">${c.p} · 体感舒适度</div>
        <div class="tip-title">${c.n}</div>
        <div class="tip-score"><strong>${score}</strong><span>本月宜居指数</span></div>
        <div class="tip-desc">均温 ${c.cl.mt[m - 1]}° · 湿度 ${c.cl.mrh[m - 1]}% · 体感 ${c.cl.mapp[m - 1]}°</div>
        <div class="tip-hint">最宜居：${c.cl.bt}<br>点击查看全年半月时序</div>`;
      positionTip(x, y);
      return;
    }
    const hits = c.spots.filter(s => s.s[m - 1] >= 70)
      .sort((a, b) => b.s[m - 1] - a.s[m - 1]).slice(0, 3);
    let extra = '';
    if (hits.length) {
      extra = `<ul class="tip-city-list">${hits.map(s =>
        `<li><span>${s.n}</span><b>${s.s[m - 1]}</b></li>`).join('')}</ul><div class="tip-hint">点击城市查看最高分风景</div>`;
    } else {
      extra = `<div class="tip-hint">本月没有入选的高光风景，拖动月份看看</div>`;
    }
    mapTip.innerHTML = `<div class="tip-kicker">${c.p} · 城市与地区</div>
      <div class="tip-title">${c.n}</div>${extra}`;
    positionTip(x, y);
  }

  function positionTip(x, y) {
    mapTip.classList.add('is-on');
    const w = state.size.w;
    const h = state.size.h;
    const tw = mapTip.offsetWidth;
    const th = mapTip.offsetHeight;
    let left = x + 16;
    let top = y + 14;
    if (left + tw > w - 10) left = x - tw - 16;
    if (top + th > h - 10) top = y - th - 12;
    mapTip.style.left = clamp(left, 8, w - tw - 8) + 'px';
    mapTip.style.top = clamp(top, 8, h - th - 8) + 'px';
  }

  function hideTip() {
    mapTip.classList.remove('is-on');
  }

  function handleMapClick(x, y) {
    if (state.mode === 'live' || state.mode === 'cost') {
      const city = findCityAt(x, y);
      if (city) openCity(city);
      return;
    }
    const s = findSpotAt(x, y);
    if (s) { openSpot(s.id); return; }
    const c = findCityAt(x, y);
    if (!c) return;
    const hits = c.spots.filter(s2 => s2.s[state.month - 1] >= 70)
      .sort((a, b) => b.s[state.month - 1] - a.s[state.month - 1]);
    if (hits.length) {
      openSpot(hits[0].id);
    } else {
      toast(`「${c.n}」本月没有入选的高光风景，拖动月份再试试`);
    }
  }

  /* ---------------- DOM: month & list ---------------- */
  const els = {
    monthNum: $('#monthNum'), monthEn: $('#monthEn'), monthCn: $('#monthCn'), monthSeason: $('#monthSeason'),
    monthHeadline: $('#monthHeadline'), monthPoem: $('#monthPoem'), monthCopy: $('#monthCopy'),
    monthSeal: $('#monthSeal'), keywordRow: $('#keywordRow'), bestList: $('#bestList'), bestCount: $('#bestCount'),
    bestTitle: $('#bestTitle'), bestUnit: $('#bestUnit'),
    headerSeason: $('#headerSeason'), mapMonthCn: $('#mapMonthCn'), mapHudCopy: $('#mapHudCopy'),
    mapTitleSuffix: $('#mapTitleSuffix'), mapEyebrow: $('#mapEyebrow'), legendTitleText: $('#legendTitleText'),
    legendHighlight: $('#legendHighlight'), legendHeatLabel: $('#legendHeatLabel'),
    mapWatermark: $('#mapWatermark'), sliderMonth: $('#sliderMonth'), sliderSeason: $('#sliderSeason'),
    sliderFill: $('#sliderFill'), sliderThumb: $('#sliderThumb'), monthRange: $('#monthRange'),
    monthLabels: $('#monthLabels'), liveRegion: $('#liveRegion')
  };

  function buildStaticUI() {
    $('#statCities').textContent = CITIES.length;
    $('#statSpots').textContent = SPOTS.length;
    els.monthLabels.innerHTML = MONTHS.map((m, i) =>
      `<span class="${i % 3 === 0 ? 'is-season' : ''}" data-m="${i + 1}">${i + 1}月</span>`
    ).join('');

    els.monthRange.addEventListener('input', e => {
      stopAuto();
      setMonth(Number(e.target.value));
    });

    document.querySelectorAll('.month-labels span').forEach(el => {
      el.style.cursor = 'pointer';
      el.style.pointerEvents = 'auto';
      el.addEventListener('click', () => { stopAuto(); setMonth(Number(el.dataset.m)); });
    });

    $('#playBtn').addEventListener('click', toggleAuto);
    modeButtons.forEach(btn => btn.addEventListener('click', () => setMode(btn.dataset.mode)));
    $('#zoomIn').addEventListener('click', () => zoomBy(1.45, state.size.w / 2, state.size.h / 2));
    $('#zoomOut').addEventListener('click', () => zoomBy(1 / 1.45, state.size.w / 2, state.size.h / 2));
    $('#zoomReset').addEventListener('click', () => {
      animateView({ x: 0, y: 0, k: 1 }, 500);
    });
  }

  function setMonth(m, opts = {}) {
    m = clamp(Math.round(m), 1, 12);
    state.month = m;
    const meta = MONTHS[m - 1];
    const liveMeta = LIVE_MONTHS[m - 1];
    const live = state.mode === 'live';
    const cost = state.mode === 'cost';
    accentRgb = hexToRgb(meta.accent);

    const root = document.documentElement.style;
    root.setProperty('--accent', meta.accent);
    root.setProperty('--accent-rgb', accentRgb.join(','));
    root.setProperty('--accent-2', meta.accent2);

    if (cost) {
      els.monthNum.textContent = '¥';
      els.monthEn.textContent = 'COST';
      els.monthCn.textContent = '生活成本';
      els.monthSeason.textContent = '年度';
      els.monthHeadline.textContent = '非住房消费价格';
      els.monthPoem.textContent = '以普通消费篮子衡量，上海 = 100';
      els.monthCopy.textContent = '综合食品杂货、在外用餐、交通、水电与日用品，剔除房租与房价。12 个城市有 Numbeo 实测，其余为邻近或省会估算。';
      els.monthSeal.textContent = '上海基准';
      els.headerSeason.textContent = '生活成本 · 年度';
      els.mapMonthCn.textContent = '生活成本';
      els.mapTitleSuffix.textContent = '指数';
      els.mapHudCopy.textContent = '上海 = 100 · 暖色越高';
      els.mapWatermark.textContent = '成本';
      els.mapEyebrow.textContent = 'COST OF LIVING · SHANGHAI = 100';
      els.bestTitle.textContent = '生活成本实测';
      els.bestUnit.textContent = '城';
      els.keywordRow.innerHTML = ['食品', '交通', '日用品'].map(k => `<span class="keyword">${k}</span>`).join('');
      els.monthRange.setAttribute('aria-label', '生活成本为年度指数，不随月份变化');
      renderList();
      applyMonthColors();
      buildMarkers();
      updateOverlay();
      if (cityDialog.open && state.selectedCity) renderCity(state.selectedCity);
      if (!opts.silent) {
        const top = currentCostTop();
        els.liveRegion.textContent = '生活成本指数，上海等于一百。低成本参考：' +
          top.slice(0, 6).map(c => `${c.n}${c.cost.i}`).join('、') + '。';
      }
      return;
    }

    els.monthNum.textContent = pad2(m);
    els.monthEn.textContent = meta.en;
    els.monthCn.textContent = meta.name;
    els.monthSeason.textContent = meta.season;
    els.monthHeadline.textContent = live ? liveMeta.headline : meta.headline;
    els.monthPoem.textContent = meta.poem;
    els.monthCopy.textContent = live ? liveMeta.copy : meta.copy;
    els.monthSeal.textContent = meta.seal;
    els.headerSeason.textContent = meta.name + ' · ' + meta.season;
    els.mapMonthCn.textContent = meta.name;
    els.mapTitleSuffix.textContent = '的中国';
    els.mapWatermark.textContent = meta.name;
    els.sliderMonth.textContent = pad2(m);
    els.sliderSeason.textContent = meta.season;
    els.keywordRow.innerHTML = (live ? liveMeta.keywords : meta.keywords)
      .map(k => `<span class="keyword">${k}</span>`).join('');

    if (live) {
      const top = CITY_RANK[m];
      const good = top.filter(c => c.cl.ms[m - 1] >= 80).length;
      els.mapHudCopy.textContent = `${good} 城体感舒适 · ${top[0].n} ${top[0].cl.ms[m - 1]}`;
      els.mapEyebrow.textContent = 'LIVABILITY ATLAS · COMFORT INDEX';
      els.bestTitle.textContent = '本月宜居城市';
      els.bestUnit.textContent = '城';
      els.monthRange.setAttribute('aria-label', '选择月份，查看各城市体感舒适度');
    } else {
      els.mapHudCopy.textContent = meta.hud;
      els.mapEyebrow.textContent = 'Seasonal atlas · 35°N 105°E';
      els.bestTitle.textContent = '本月最美';
      els.bestUnit.textContent = '处';
      els.monthRange.setAttribute('aria-label', '选择月份，查看中国各地当季最美风景');
    }

    const pct = (m - 1) / 11 * 100;
    els.sliderFill.style.width = pct + '%';
    els.sliderThumb.style.left = pct + '%';
    els.monthRange.value = String(m);
    els.monthRange.setAttribute('aria-valuetext', meta.name + '，' + meta.season);
    document.querySelectorAll('.month-labels span').forEach(el => {
      el.classList.toggle('is-now', Number(el.dataset.m) === m);
    });

    renderList();
    applyMonthColors();
    buildMarkers();
    updateOverlay();

    if (detailDialog.open && state.selected) {
      renderDetail(state.selected.id);
    }
    if (cityDialog.open && state.selectedCity) {
      renderCity(state.selectedCity);
    }
    if (!opts.silent) {
      if (live) {
        const top = CITY_RANK[m].slice(0, 6);
        els.liveRegion.textContent = `${meta.name}，${meta.season}。本月宜居城市：` +
          top.map(c => `${c.n}${c.cl.ms[m - 1]}分`).join('、') + '。';
      } else {
        const top = currentTop();
        els.liveRegion.textContent = `${meta.name}，${meta.season}。本月推荐 ${top.length} 处风景：` +
          top.map(s => s.n).join('、') + '。';
      }
    }
  }

  function spotLoc(s) {
    return s.area === s.p ? s.p : s.p + ' · ' + s.area;
  }

  function comfortLabel(score) {
    if (score >= 90) return '极舒适';
    if (score >= 80) return '舒适';
    if (score >= 68) return '尚舒适';
    if (score >= 55) return '一般';
    return '偏难熬';
  }

  function renderList() {
    const m = state.month;
    if (state.mode === 'cost') {
      const top = currentCostTop();
      els.bestCount.textContent = top.length;
      els.bestList.innerHTML = top.map((c, i) => {
        const active = state.selectedCity && state.selectedCity.a === c.a ? ' is-selected' : '';
        return `<button class="spot-card${active}" style="--i:${i}" data-city="${c.a}" type="button">
          <span class="spot-rank">${pad2(i + 1)}</span>
          <span class="spot-main">
            <span class="spot-name">${c.n}</span>
            <span class="spot-meta">${c.p} · 食品 ${c.cost.f} · 餐饮 ${c.cost.d}<em>${c.cost.src === 'm' ? '实测' : '估算'}</em></span>
          </span>
          <span class="spot-score">${c.cost.i}<small>指数</small></span>
        </button>`;
      }).join('');

      els.bestList.querySelectorAll('.spot-card').forEach(card => {
        const city = CITY_BY_ADCODE.get(Number(card.dataset.city));
        card.addEventListener('click', () => openCity(city));
        card.addEventListener('pointerenter', () => {
          state.hoverCity = city;
          state.hoverSpot = null;
          card.classList.add('is-hover');
          updateOverlay();
        });
        card.addEventListener('pointerleave', () => {
          if (state.hoverCity === city) state.hoverCity = null;
          card.classList.remove('is-hover');
          updateOverlay();
        });
      });
      els.bestList.scrollTop = 0;
      return;
    }

    if (state.mode === 'live') {
      const top = currentCityTop();
      els.bestCount.textContent = top.length;
      els.bestList.innerHTML = top.map((c, i) => {
        const active = state.selectedCity && state.selectedCity.a === c.a ? ' is-selected' : '';
        const score = c.cl.ms[m - 1];
        return `<button class="spot-card${active}" style="--i:${i}" data-city="${c.a}" type="button">
          <span class="spot-rank">${pad2(i + 1)}</span>
          <span class="spot-main">
            <span class="spot-name">${c.n}</span>
            <span class="spot-meta">${c.p} · 均温 ${c.cl.mt[m - 1]}° · 湿度 ${c.cl.mrh[m - 1]}%<em>${comfortLabel(score)}</em></span>
          </span>
          <span class="spot-score">${score}<small>宜居</small></span>
        </button>`;
      }).join('');

      els.bestList.querySelectorAll('.spot-card').forEach(card => {
        const city = CITY_BY_ADCODE.get(Number(card.dataset.city));
        card.addEventListener('click', () => openCity(city));
        card.addEventListener('pointerenter', () => {
          state.hoverCity = city;
          state.hoverSpot = null;
          card.classList.add('is-hover');
          updateOverlay();
        });
        card.addEventListener('pointerleave', () => {
          if (state.hoverCity === city) state.hoverCity = null;
          card.classList.remove('is-hover');
          updateOverlay();
        });
      });
      els.bestList.scrollTop = 0;
      return;
    }

    const top = currentTop();
    els.bestCount.textContent = top.length;
    els.bestList.innerHTML = top.map((s, i) => {
      const active = state.selected && state.selected.id === s.id ? ' is-selected' : '';
      const tags = s.tags && s.tags.length ? `<em>${s.tags[0]}</em>` : '';
      return `<button class="spot-card${active}" style="--i:${i}" data-spot="${s.id}" type="button">
        <span class="spot-rank">${pad2(i + 1)}</span>
        <span class="spot-main">
          <span class="spot-name">${s.n}</span>
          <span class="spot-meta">${spotLoc(s)}${tags}</span>
        </span>
        <span class="spot-score">${s.s[m - 1]}<small>推荐</small></span>
      </button>`;
    }).join('');

    els.bestList.querySelectorAll('.spot-card').forEach(card => {
      const id = card.dataset.spot;
      const s = SPOT_BY_ID.get(id);
      card.addEventListener('click', () => openSpot(id));
      card.addEventListener('pointerenter', () => {
        state.hoverSpot = s;
        state.hoverCity = s.cityRef || null;
        card.classList.add('is-hover');
        updateOverlay();
      });
      card.addEventListener('pointerleave', () => {
        if (state.hoverSpot === s) state.hoverSpot = null;
        card.classList.remove('is-hover');
        updateOverlay();
      });
    });
    els.bestList.scrollTop = 0;
  }

  /* ---------------- mode & city climate ---------------- */
  function applyModeUI() {
    const live = state.mode === 'live';
    const cost = state.mode === 'cost';
    const travel = state.mode === 'travel';
    document.body.classList.toggle('mode-travel', travel);
    document.body.classList.toggle('mode-live', live);
    document.body.classList.toggle('mode-cost', cost);
    modeButtons.forEach(btn => {
      const on = btn.dataset.mode === state.mode;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    els.legendTitleText.textContent = cost ? '城市分域 · 非住房消费' : live ? '城市分域 · 体感舒适度' : '城市分域 · 当月推荐';
    els.legendHighlight.textContent = cost ? '暖色越亮 = 成本越高' : live ? '暖色越亮 = 越宜居' : '未推荐地区统一底色';
    els.legendHeatLabel.textContent = cost ? '生活成本' : live ? '体感舒适' : '推荐热度';
  }

  function setMode(mode) {
    if (mode !== 'travel' && mode !== 'live' && mode !== 'cost') return;
    if (mode === state.mode) return;
    closeDetail();
    closeCity();
    state.mode = mode;
    state.hoverSpot = null;
    state.hoverCity = null;
    hideTip();
    applyModeUI();
    setMonth(state.month, { silent: true });
  }

  function climateSummary(c) {
    const cl = c.cl;
    const jan = { t: cl.mt[0], a: cl.mapp[0], r: cl.mrh[0] };
    const jul = { t: cl.mt[6], a: cl.mapp[6], r: cl.mrh[6] };
    const parts = [`最舒适的窗口是 ${cl.bt}。`];
    if (jul.a >= 30) parts.push(`7月体感约 ${jul.a}°、湿度 ${jul.r}%，${jul.r >= 75 ? '闷热' : '炎热'}。`);
    else if (jul.a >= 26) parts.push(`7月体感约 ${jul.a}°、湿度 ${jul.r}%，偏热。`);
    else if (jul.a <= 18) parts.push(`7月体感约 ${jul.a}°，凉爽。`);
    else parts.push(`7月体感约 ${jul.a}°，温和。`);
    if (jan.a <= 5) parts.push(`1月体感约 ${jan.a}°、湿度 ${jan.r}%，${jan.r >= 65 ? '湿冷' : '干冷'}。`);
    else if (jan.a <= 12) parts.push(`1月体感约 ${jan.a}°，偏冷。`);
    else if (jan.a >= 22) parts.push(`1月体感约 ${jan.a}°，温暖偏热。`);
    else if (jan.a >= 18) parts.push(`1月体感约 ${jan.a}°，温暖。`);
    else parts.push(`1月体感约 ${jan.a}°，温和。`);
    if (cl.el && cl.el >= 1500) parts.push(`海拔约 ${cl.el} 米，昼夜温差明显。`);
    return parts.join('');
  }

  function renderComfortChart(city) {
    const cl = city.cl;
    const current = state.month - 1;
    const box = $('#comfortChart');
    if (!box) return;
    let html = '';
    for (let m = 0; m < 12; m++) {
      const s1 = cl.hs[m * 2], s2 = cl.hs[m * 2 + 1];
      const c1 = rgbToHex(comfortColor(s1));
      const c2 = rgbToHex(comfortColor(s2));
      html += `<div class="comfort-month${m === current ? ' is-now' : ''}">
        <div class="comfort-bars">
          <i class="comfort-bar" style="height:${Math.max(2, s1)}%;--c:${c1}" title="${m + 1}月上 · ${s1}分"></i>
          <i class="comfort-bar" style="height:${Math.max(2, s2)}%;--c:${c2}" title="${m + 1}月下 · ${s2}分"></i>
        </div>
        <span>${m + 1}</span>
      </div>`;
    }
    box.innerHTML = html;
    box.querySelectorAll('.comfort-month').forEach((el, i) => {
      el.style.cursor = 'pointer';
      el.addEventListener('click', () => setMonth(i + 1));
    });
  }

  function renderTempChart(city) {
    const cl = city.cl;
    const box = $('#tempChart');
    if (!box) return;
    const W = 620, H = 160, L = 30, R = 12, T = 12, B = 25;
    const lo = -12, hi = 39;
    const x = m => L + m / 11 * (W - L - R);
    const y = t => T + (hi - clamp(t, lo, hi)) / (hi - lo) * (H - T - B);
    const current = state.month - 1;
    let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${city.n}全年月均气温与体感温度">`;
    svg += `<rect class="temp-now" x="${(x(current) - 16).toFixed(1)}" y="${T}" width="32" height="${H - T - B}" rx="4"/>`;
    [-10, 0, 10, 20, 30].forEach(t => {
      const yy = y(t);
      svg += `<line class="temp-grid" x1="${L}" y1="${yy.toFixed(1)}" x2="${W - R}" y2="${yy.toFixed(1)}"/>`;
      svg += `<text class="temp-grid-label" x="${L - 6}" y="${(yy + 2.5).toFixed(1)}" text-anchor="end">${t}°</text>`;
    });
    let top = '', bottom = '', line = '', appLine = '';
    for (let m = 0; m < 12; m++) {
      const mx = cl.mtx[m], mn = cl.mtn[m], mean = cl.mt[m];
      top += `${m === 0 ? 'M' : 'L'}${x(m).toFixed(1)} ${y(mx).toFixed(1)}`;
      bottom = `L${x(11 - m).toFixed(1)} ${y(cl.mtn[11 - m]).toFixed(1)}` + bottom;
      line += `${m === 0 ? 'M' : 'L'}${x(m).toFixed(1)} ${y(mean).toFixed(1)}`;
      appLine += `${m === 0 ? 'M' : 'L'}${x(m).toFixed(1)} ${y(cl.mapp[m]).toFixed(1)}`;
    }
    svg += `<path class="temp-band" d="${top}${bottom}Z"/>`;
    svg += `<path class="temp-line" d="${line}"/>`;
    svg += `<path class="temp-app-line" d="${appLine}"/>`;
    for (let m = 0; m < 12; m++) {
      const mean = cl.mt[m], app = cl.mapp[m];
      svg += `<circle class="temp-dot" cx="${x(m).toFixed(1)}" cy="${y(mean).toFixed(1)}" r="2.5"><title>${m + 1}月：均温 ${mean}°，体感 ${app}°</title></circle>`;
      svg += `<text class="temp-month-label" x="${x(m).toFixed(1)}" y="${H - 7}">${m + 1}</text>`;
    }
    svg += '</svg>';
    box.innerHTML = svg;
  }

  function renderCity(city) {
    if (!city || !city.cl) return;
    const cl = city.cl;
    const jan = { t: cl.mt[0], a: cl.mapp[0], r: cl.mrh[0] };
    const jul = { t: cl.mt[6], a: cl.mapp[6], r: cl.mrh[6] };
    $('#cityName').textContent = city.n;
    $('#cityKicker').textContent = state.mode === 'cost'
      ? 'LIVABILITY & COST · 1991—2020 CLIMATE NORMALS'
      : 'LIVABILITY · 1991—2020 CLIMATE NORMALS';
    $('#cityMeta').textContent = `${city.p} · 海拔 ${cl.el == null ? '—' : cl.el}m · 1991—2020 气候常年值${city.clNear ? ' · 邻近站参考' : ''}`;
    $('#cityScore').textContent = cl.bs;
    $('#cityBest').textContent = cl.bt;
    $('#citySummary').textContent = climateSummary(city);
    $('#cityStats').innerHTML = `
      <div class="city-stat"><span>一月</span><strong>${jan.t}°</strong><small>体感 ${jan.a}° · 湿度 ${jan.r}%</small></div>
      <div class="city-stat"><span>七月</span><strong>${jul.t}°</strong><small>体感 ${jul.a}° · 湿度 ${jul.r}%</small></div>
      <div class="city-stat"><span>海拔</span><strong>${cl.el == null ? '—' : cl.el}<small style="display:inline;font-size:9px"> m</small></strong><small>气候站参考高度</small></div>`;
    const cost = city.cost;
    $('#costBlock').style.display = cost ? '' : 'none';
    if (cost) {
      $('#cityCost').textContent = cost.i;
      $('#cityFood').textContent = cost.f;
      $('#cityDining').textContent = cost.d;
      $('#cityTransport').textContent = cost.t;
      $('#cityUtilities').textContent = cost.u;
      $('#cityDaily').textContent = cost.g;
      $('#cityCostNote').textContent = cost.src === 'm'
        ? 'Numbeo 实测 · 住房与房租不计入'
        : '省级消费水平估算 · 住房与房租不计入';
    }
    renderComfortChart(city);
    renderTempChart(city);
    $('#cityTravelBtn').style.display = city.spots && city.spots.length ? '' : 'none';
    $('#cityTravelBtn').dataset.city = String(city.a);
    updateSelectedCards();
  }

  function openCity(city) {
    if (!city || !city.cl) {
      toast('该城市暂缺气候常年值');
      return;
    }
    closeDetail();
    state.selectedCity = city;
    state.hoverCity = city;
    state.hoverSpot = null;
    updateOverlay();
    renderCity(city);
    if (!cityDialog.open) {
      if (typeof cityDialog.showModal === 'function') cityDialog.showModal();
      else cityDialog.setAttribute('open', '');
      document.body.style.overflow = 'hidden';
    }
    const close = $('#cityClose');
    if (close) close.focus({ preventScroll: true });
  }

  function closeCity() {
    if (cityDialog.open && typeof cityDialog.close === 'function') cityDialog.close();
    else cityDialog.removeAttribute('open');
    document.body.style.overflow = '';
    state.selectedCity = null;
    state.hoverCity = null;
    hideTip();
    updateSelectedCards();
    updateOverlay();
  }

  $('#cityClose').addEventListener('click', closeCity);
  $('#cityClose2').addEventListener('click', closeCity);
  cityDialog.addEventListener('click', e => {
    if (e.target === cityDialog) closeCity();
  });
  cityDialog.addEventListener('cancel', e => {
    e.preventDefault();
    closeCity();
  });
  $('#cityTravelBtn').addEventListener('click', e => {
    const city = CITY_BY_ADCODE.get(Number(e.currentTarget.dataset.city));
    if (!city) return;
    closeCity();
    setMode('travel');
    const best = city.spots.slice().sort((a, b) => b.s[state.month - 1] - a.s[state.month - 1])[0];
    if (best) setTimeout(() => openSpot(best.id), 160);
    else toast(`「${city.n}」暂无收录的旅行风景`);
  });

  /* ---------------- detail ---------------- */
  function artPalette() {
    const base = [6, 17, 14];
    return [
      rgbToHex(mix([8, 25, 21], accentRgb, .34)),
      '#05100d',
      '#e6c387',
      rgbToHex(mix(base, accentRgb, .58)),
      rgbToHex(mix(base, accentRgb, .42)),
      rgbToHex(mix(base, accentRgb, .28)),
      rgbToHex(mix(base, accentRgb, .14))
    ];
  }

  function openSpot(id) {
    const s = SPOT_BY_ID.get(id);
    if (!s) return;
    if (cityDialog.open) closeCity();
    state.selected = s;
    state.hoverSpot = s;
    state.hoverCity = s.cityRef || null;
    updateOverlay();
    renderDetail(id);
    if (!detailDialog.open) {
      if (typeof detailDialog.showModal === 'function') detailDialog.showModal();
      else detailDialog.setAttribute('open', '');
      document.body.style.overflow = 'hidden';
    }
    const close = $('#detailClose');
    if (close) close.focus({ preventScroll: true });
    updateSelectedCards();
  }

  function updateSelectedCards() {
    document.querySelectorAll('.spot-card').forEach(card => {
      if (card.dataset.city != null) {
        card.classList.toggle('is-selected', !!state.selectedCity && Number(card.dataset.city) === state.selectedCity.a);
      } else {
        card.classList.toggle('is-selected', !!state.selected && card.dataset.spot === state.selected.id);
      }
    });
  }

  function renderDetail(id) {
    const s = SPOT_BY_ID.get(id);
    if (!s) return;
    const m = state.month;
    const meta = MONTHS[m - 1];
    const score = s.s[m - 1];
    const rank = MONTH_RANK[m].findIndex(x => x.id === s.id) + 1;
    const art = artPalette();
    const artEl = $('#detailArt');
    artEl.style.setProperty('--sky1', art[0]);
    artEl.style.setProperty('--sky2', art[1]);
    artEl.style.setProperty('--sun', art[2]);
    artEl.style.setProperty('--m1', art[3]);
    artEl.style.setProperty('--m2', art[4]);
    artEl.style.setProperty('--m3', art[5]);
    artEl.style.setProperty('--m4', art[6]);

    const loc = spotLoc(s);
    $('#detailName').textContent = s.n;
    $('#artName').textContent = s.n;
    $('#detailLoc').textContent = loc;
    $('#artMeta').textContent = loc;
    $('#artKicker').textContent = meta.name + ' · ' + meta.headline;
    $('#detailKicker').textContent = meta.name + ' · ' + (score >= 90 ? '极佳观赏期' : score >= 80 ? '推荐前往' : score >= 65 ? '平季可游' : '非最佳时节');
    $('#detailDesc').textContent = s.d;
    $('#detailBest').innerHTML = '最佳时段 <b>' + s.b + '</b>';
    $('#detailScore').textContent = score;
    $('#detailRank').textContent = 'No.' + rank;
    $('#chartMonth').textContent = '此刻 · ' + meta.name;
    $('#detailTags').innerHTML = s.tags.map(t => `<span>${t}</span>`).join('');

    $('#miniChart').innerHTML = s.s.map((v, i) => {
      const mm = i + 1;
      const h = Math.max(3, v / 100 * 100);
      const cls = ['chart-bar', mm === m ? 'is-now' : '', v >= 90 ? 'is-peak' : ''].filter(Boolean).join(' ');
      return `<button class="${cls}" type="button" data-m="${mm}" title="${mm}月 · ${v}分" aria-label="${mm}月，${v}分">
        <i style="height:${h}%"></i><span>${mm}</span>
      </button>`;
    }).join('');
    $('#miniChart').querySelectorAll('.chart-bar').forEach(btn => {
      btn.addEventListener('click', () => {
        setMonth(Number(btn.dataset.m));
        renderDetail(s.id);
      });
    });
    $('#locateBtn').dataset.spot = s.id;
  }

  function closeDetail() {
    if (detailDialog.open && typeof detailDialog.close === 'function') detailDialog.close();
    else detailDialog.removeAttribute('open');
    document.body.style.overflow = '';
    state.selected = null;
    state.hoverSpot = null;
    state.hoverCity = null;
    hideTip();
    updateSelectedCards();
    updateOverlay();
  }

  $('#detailClose').addEventListener('click', closeDetail);
  $('#detailClose2').addEventListener('click', closeDetail);
  detailDialog.addEventListener('click', e => {
    if (e.target === detailDialog) closeDetail();
  });
  detailDialog.addEventListener('cancel', e => {
    e.preventDefault();
    closeDetail();
  });
  $('#locateBtn').addEventListener('click', e => {
    const s = SPOT_BY_ID.get(e.currentTarget.dataset.spot);
    if (!s) return;
    closeDetail();
    setTimeout(() => {
      flyToSpot(s);
      state.hoverSpot = s;
      state.hoverCity = s.cityRef || null;
      updateOverlay();
      toast(`已定位 · ${s.n}`);
    }, 80);
  });

  /* ---------------- auto tour ---------------- */
  function toggleAuto() {
    if (state.auto) stopAuto();
    else startAuto();
  }
  function startAuto() {
    state.auto = true;
    $('#playBtn').classList.add('is-on');
    $('#playBtn').setAttribute('aria-pressed', 'true');
    $('#playLabel').textContent = '巡游中';
    $('#playIcon').innerHTML = '<rect x="7" y="5" width="3.5" height="14" rx="1"/><rect x="13.5" y="5" width="3.5" height="14" rx="1"/>';
    state.autoTimer = setInterval(() => {
      setMonth(state.month === 12 ? 1 : state.month + 1);
    }, 2400);
  }
  function stopAuto() {
    state.auto = false;
    clearInterval(state.autoTimer);
    state.autoTimer = 0;
    $('#playBtn').classList.remove('is-on');
    $('#playBtn').setAttribute('aria-pressed', 'false');
    $('#playLabel').textContent = '四季巡游';
    $('#playIcon').innerHTML = '<path d="M8 5.2v13.6L19 12z"/>';
  }

  /* ---------------- toast ---------------- */
  let toastTimer = 0;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-on'), 2200);
  }

  /* ---------------- init ---------------- */
  function init() {
    initBaseColors();
    buildStaticUI();
    buildCapitalEls();
    const params = new URLSearchParams(window.location.search || window.location.hash.replace(/^#/, ''));
    const qMode = params.get('mode');
    if (qMode === 'live' || qMode === 'travel' || qMode === 'cost') state.mode = qMode;
    applyModeUI();
    const qMonth = Number(params.get('month'));
    setMonth(qMonth >= 1 && qMonth <= 12 ? qMonth : 4, { silent: true });
    resizeMap(true);

    const qSpot = params.get('spot');
    if (qSpot && SPOT_BY_ID.has(qSpot)) {
      setTimeout(() => openSpot(qSpot), 220);
    }
    const qCity = Number(params.get('city'));
    if (qCity && CITY_BY_ADCODE.has(qCity)) {
      setTimeout(() => openCity(CITY_BY_ADCODE.get(qCity)), 260);
    }

    let resizeTimer = 0;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => resizeMap(false), 90);
    };
    if (window.ResizeObserver) {
      new ResizeObserver(onResize).observe(stage);
    } else {
      window.addEventListener('resize', onResize);
    }
    window.addEventListener('orientationchange', onResize);

    document.addEventListener('keydown', e => {
      if (detailDialog.open || cityDialog.open) return;
      if (/^(INPUT|BUTTON|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
      if (e.key === 'ArrowRight') { stopAuto(); setMonth(state.month === 12 ? 1 : state.month + 1); }
      if (e.key === 'ArrowLeft') { stopAuto(); setMonth(state.month === 1 ? 12 : state.month - 1); }
      if (e.key === ' ') { e.preventDefault(); toggleAuto(); }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
