// 地图空间数据模块
// 数据来源: 河北省地下水系统区划(1999) + 水源地公报(2024) + 专业地理坐标
// 版本: v1.0 | 坐标系: WGS84

/** 地图标注点 */
export interface MapMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: 'system' | 'spring' | 'geothermal' | 'saline' | 'waterSource' | 'monitoring' | 'mine';
  type: string;
  description: string;
  detail?: Record<string, string>;
}

/** 系统区划面（简化矩形近似边界） */
export interface MapZone {
  id: string;
  code: string;
  name: string;
  center: [number, number];
  bounds: [[number, number], [number, number]]; // [[south, west], [north, east]]
  color: string;
  fillColor: string;
  info: string;
}

/** 地图图层配置 */
export interface MapLayerConfig {
  key: string;
  label: string;
  icon: string;
  color: string;
  categories: string[];
}

/** 图层配置 */
export const mapLayerConfigs: MapLayerConfig[] = [
  { key: 'systemZoning', label: '系统区划', icon: 'Layers', color: '#3b82f6', categories: ['system'] },
  { key: 'springDomains', label: '泉域分布', icon: 'Droplets', color: '#10b981', categories: ['spring'] },
  { key: 'geothermal', label: '地热田', icon: 'Flame', color: '#ef4444', categories: ['geothermal'] },
  { key: 'salineWater', label: '咸水分布', icon: 'Waves', color: '#f59e0b', categories: ['saline'] },
  { key: 'waterSource', label: '水源地', icon: 'GlassWater', color: '#06b6d4', categories: ['waterSource'] },
  { key: 'mine', label: '矿区水文', icon: 'HardHat', color: '#8b5cf6', categories: ['mine'] },
];

/** 系统区划面 */
export const mapZones: MapZone[] = [
  { id: 'z1', code: 'I', name: '内陆河地下水系统区', center: [41.5, 114.3], bounds: [[41.0, 113.0], [42.4, 116.5]], color: '#3b82f6', fillColor: 'rgba(59,130,246,0.12)', info: '面积10,922km² | 坝上高原封闭内陆盆地' },
  { id: 'z2', code: 'II', name: '辽河-大凌河地下水系统区', center: [42.2, 119.5], bounds: [[41.5, 118.5], [42.8, 120.5]], color: '#6366f1', fillColor: 'rgba(99,102,241,0.10)', info: '省内部未完全闭合' },
  { id: 'z3', code: 'III', name: '潮白蓟运河地下水系统区', center: [40.5, 117.0], bounds: [[39.5, 116.0], [41.3, 118.0]], color: '#8b5cf6', fillColor: 'rgba(139,92,246,0.10)', info: '面积19,419km² | 含4个子区' },
  { id: 'z4', code: 'IV', name: '滦河地下水系统区', center: [40.0, 118.2], bounds: [[39.0, 117.0], [41.8, 119.5]], color: '#06b6d4', fillColor: 'rgba(6,182,212,0.10)', info: '面积41,949km² | 基本完整系统' },
  { id: 'z5', code: 'V', name: '冀东沿海诸河地下水系统区', center: [39.5, 119.2], bounds: [[38.8, 118.2], [40.0, 120.0]], color: '#14b8a6', fillColor: 'rgba(20,184,166,0.10)', info: '面积3,348km² | 独立入海小河' },
  { id: 'z6', code: 'VI', name: '永定河地下水系统区', center: [40.3, 115.0], bounds: [[39.5, 113.5], [41.3, 116.5]], color: '#f59e0b', fillColor: 'rgba(245,158,11,0.10)', info: '面积21,258km² | 含3大盆地' },
  { id: 'z7', code: 'VII', name: '大清河地下水系统区', center: [39.0, 114.8], bounds: [[38.0, 113.5], [40.3, 116.3]], color: '#22c55e', fillColor: 'rgba(34,197,94,0.10)', info: '面积27,937km² | 涞源/威州泉域' },
  { id: 'z8', code: 'VIII', name: '子牙河地下水系统区', center: [37.8, 114.8], bounds: [[36.5, 113.5], [39.5, 116.3]], color: '#ec4899', fillColor: 'rgba(236,72,153,0.10)', info: '面积32,326km² | 含百泉/黑龙洞泉域' },
  { id: 'z9', code: 'IX', name: '漳卫河地下水系统区', center: [36.4, 114.2], bounds: [[35.8, 113.0], [37.5, 115.5]], color: '#f43f5e', fillColor: 'rgba(244,63,94,0.10)', info: '含东风湖/珍珠泉泉域' },
  { id: 'z10', code: 'X', name: '古黄河地下水系统区', center: [37.7, 115.8], bounds: [[36.8, 115.0], [38.5, 117.0]], color: '#a855f7', fillColor: 'rgba(168,85,247,0.10)', info: '面积11,067km² | 咸水区广布' },
];

/** 泉域标注点 */
export const springMarkers: MapMarker[] = [
  { id: 'sp1', name: '涞源泉', lat: 39.38, lng: 114.68, category: 'spring', type: '岩溶大泉', description: '大清河系统 | 排量曾达8m³/s，近年衰减', detail: { '所属系统': 'VII-大清河', '类型': '岩溶上升泉', '历史最大流量': '8m³/s' } },
  { id: 'sp2', name: '威州泉', lat: 38.35, lng: 114.05, category: 'spring', type: '岩溶大泉', description: '大清河系统 | 冶河排泄带', detail: { '所属系统': 'VII-大清河', '类型': '岩溶上升泉', '特点': '冶河排泄带集中出露' } },
  { id: 'sp3', name: '百泉', lat: 37.05, lng: 114.50, category: 'spring', type: '岩溶大泉', description: '子牙河系统 | 1986年干涸', detail: { '所属系统': 'VIII-子牙河', '类型': '岩溶上升泉群', '现状': '1986年干涸' } },
  { id: 'sp4', name: '黑龙洞泉', lat: 36.55, lng: 114.20, category: 'spring', type: '岩溶大泉', description: '子牙河系统 | 滏阳河源头', detail: { '所属系统': 'VIII-子牙河', '类型': '岩溶上升泉', '现状': '时有出流' } },
  { id: 'sp5', name: '东风湖泉', lat: 36.15, lng: 114.05, category: 'spring', type: '岩溶泉', description: '漳卫河系统 | 峰峰矿区', detail: { '所属系统': 'IX-漳卫河', '类型': '岩溶泉' } },
  { id: 'sp6', name: '珍珠泉', lat: 36.35, lng: 114.15, category: 'spring', type: '岩溶泉', description: '漳卫河系统 | 邯郸西部', detail: { '所属系统': 'IX-漳卫河', '类型': '岩溶泉' } },
  { id: 'sp7', name: '石门峪泉', lat: 40.15, lng: 114.85, category: 'spring', type: '岩溶泉', description: '永定河系统 | 蔚县盆地南缘', detail: { '所属系统': 'VI-永定河', '类型': '岩溶泉' } },
  { id: 'sp8', name: '一亩泉', lat: 38.82, lng: 115.55, category: 'spring', type: '孔隙泉', description: '大清河系统 | 保定地区历史名泉', detail: { '所属系统': 'VII-大清河', '类型': '孔隙溢出泉', '现状': '已干涸' } },
  { id: 'sp9', name: '神头泉', lat: 38.42, lng: 114.25, category: 'spring', type: '岩溶泉', description: '大清河系统 | 保定西部山区', detail: { '所属系统': 'VII-大清河', '类型': '岩溶泉' } },
  { id: 'sp10', name: '板城泉', lat: 40.85, lng: 118.15, category: 'spring', type: '岩溶泉', description: '滦河系统 | 承德北部', detail: { '所属系统': 'IV-滦河', '类型': '岩溶泉' } },
];

/** 地热田标注点 */
export function geothermalMarkers(): MapMarker[] {
  return [
  { id: 'gt1', name: '雄县地热田', lat: 38.72, lng: 115.97, category: 'geothermal', type: '沉积盆地型', description: '牛驼镇凸起地热田 | 井口水温60~80°C', detail: { '类型': '沉积盆地传导型', '温度': '60~80°C', '热储层': '新近系馆陶组' } },
  { id: 'gt2', name: '牛驼镇地热田', lat: 39.10, lng: 116.15, category: 'geothermal', type: '沉积盆地型', description: '冀中坳陷 | 井口水温70~95°C', detail: { '类型': '沉积盆地传导型', '温度': '70~95°C', '热储层': '蓟县系雾迷山组' } },
  { id: 'gt3', name: '衡水地热田', lat: 37.73, lng: 115.68, category: 'geothermal', type: '沉积盆地型', description: '冀中坳陷南部 | 井口水温50~75°C', detail: { '类型': '沉积盆地传导型', '温度': '50~75°C', '热储层': '新近系馆陶组' } },
  { id: 'gt4', name: '沧州地热田', lat: 38.30, lng: 116.85, category: 'geothermal', type: '沉积盆地型', description: '黄骅坳陷 | 地热资源丰富', detail: { '类型': '沉积盆地传导型', '温度': '50~85°C', '热储层': '新近系+奥陶系' } },
  { id: 'gt5', name: '遵化地热田', lat: 40.18, lng: 117.95, category: 'geothermal', type: '隆起断裂型', description: '燕山南麓断裂带 | 温泉出露', detail: { '类型': '隆起断裂对流型', '温度': '40~70°C', '特点': '温泉出露' } },
  { id: 'gt6', name: '平山地热田', lat: 38.25, lng: 114.18, category: 'geothermal', type: '隆起断裂型', description: '太行山中段 | 温热水异常区', detail: { '类型': '隆起断裂对流型', '温度': '35~60°C' } },
  { id: 'gt7', name: '阳原地热田', lat: 40.10, lng: 114.15, category: 'geothermal', type: '山间盆地型', description: '蔚县-阳原盆地 | 温泉分布', detail: { '类型': '山间盆地型', '温度': '40~65°C' } },
  { id: 'gt8', name: '赤城地热田', lat: 40.90, lng: 115.80, category: 'geothermal', type: '隆起断裂型', description: '张家口北部 | 著名温泉疗养区', detail: { '类型': '隆起断裂对流型', '温度': '50~80°C', '特点': '著名温泉疗养区' } },
];
}

/** 咸水分布标注点（区域中心代表点） */
export const salineMarkers: MapMarker[] = [
  { id: 'sw1', name: '沧州滨海咸水区', lat: 38.30, lng: 117.00, category: 'saline', type: '滨海平原', description: '矿化度>5g/L | 面积约8000km²', detail: { '矿化度': '>5g/L', '面积': '~8,000km²', '分布': '沧州东部滨海' } },
  { id: 'sw2', name: '衡水-邢台咸水区', lat: 37.50, lng: 115.50, category: 'saline', type: '冲湖积平原', description: '矿化度2~5g/L | 咸淡水交错', detail: { '矿化度': '2~5g/L', '特点': '咸淡水交错分布' } },
  { id: 'sw3', name: '廊坊咸水区', lat: 39.10, lng: 116.50, category: 'saline', type: '冲积平原', description: '矿化度2~3g/L | 咸水体底界深', detail: { '矿化度': '2~3g/L', '特点': '咸水体底界100~200m' } },
  { id: 'sw4', name: '保定东部咸水区', lat: 38.60, lng: 115.80, category: 'saline', type: '冲积平原', description: '矿化度1~3g/L | 咸淡水过渡带', detail: { '矿化度': '1~3g/L', '特点': '咸淡水过渡带' } },
  { id: 'sw5', name: '唐山南部咸水区', lat: 39.30, lng: 118.20, category: 'saline', type: '滨海平原', description: '矿化度3~10g/L | 滨海盐碱化', detail: { '矿化度': '3~10g/L', '特点': '滨海盐碱化严重' } },
  { id: 'sw6', name: '邯郸东部咸水区', lat: 36.60, lng: 115.30, category: 'saline', type: '冲积平原', description: '矿化度2~5g/L | 黑龙港流域', detail: { '矿化度': '2~5g/L', '特点': '黑龙港流域' } },
];

/** 水源地标注点 */
export const waterSourceMarkers: MapMarker[] = [
  { id: 'ws1', name: '石津灌区水源地', lat: 38.04, lng: 114.51, category: 'waterSource', type: '孔隙水', description: '石家庄市主要供水水源地', detail: { '城市': '石家庄', '类型': '孔隙水', '供水规模': '大型' } },
  { id: 'ws2', name: '唐山市水源地', lat: 39.63, lng: 118.18, category: 'waterSource', type: '孔隙水/岩溶水', description: '唐山市集中供水水源地', detail: { '城市': '唐山', '类型': '孔隙水/岩溶水', '供水规模': '大型' } },
  { id: 'ws3', name: '保定市水源地', lat: 38.87, lng: 115.46, category: 'waterSource', type: '孔隙水', description: '保定市集中供水水源地', detail: { '城市': '保定', '类型': '孔隙水', '供水规模': '大型' } },
  { id: 'ws4', name: '邯郸市水源地', lat: 36.56, lng: 114.47, category: 'waterSource', type: '岩溶水', description: '峰峰黑龙洞泉域水源地', detail: { '城市': '邯郸', '类型': '岩溶水', '供水规模': '大型' } },
  { id: 'ws5', name: '沧州市水源地', lat: 38.31, lng: 116.86, category: 'waterSource', type: '深层孔隙水', description: '沧州市深层水水源地', detail: { '城市': '沧州', '类型': '深层孔隙水', '供水规模': '大型' } },
  { id: 'ws6', name: '张家口市水源地', lat: 40.77, lng: 114.88, category: 'waterSource', type: '孔隙水', description: '张家口市供水水源地', detail: { '城市': '张家口', '类型': '孔隙水', '供水规模': '中型' } },
  { id: 'ws7', name: '承德市水源地', lat: 40.95, lng: 117.96, category: 'waterSource', type: '孔隙水', description: '承德市供水水源地', detail: { '城市': '承德', '类型': '孔隙水', '供水规模': '中型' } },
  { id: 'ws8', name: '邢台市水源地', lat: 37.06, lng: 114.50, category: 'waterSource', type: '岩溶水/孔隙水', description: '百泉水源地', detail: { '城市': '邢台', '类型': '岩溶水/孔隙水', '供水规模': '大型' } },
  { id: 'ws9', name: '廊坊市水源地', lat: 39.52, lng: 116.70, category: 'waterSource', type: '深层孔隙水', description: '廊坊市深层水水源地', detail: { '城市': '廊坊', '类型': '深层孔隙水', '供水规模': '中型' } },
  { id: 'ws10', name: '衡水市水源地', lat: 37.73, lng: 115.68, category: 'waterSource', type: '深层孔隙水', description: '衡水市深层水水源地', detail: { '城市': '衡水', '类型': '深层孔隙水', '供水规模': '中型' } },
  { id: 'ws11', name: '秦皇岛市水源地', lat: 39.93, lng: 119.60, category: 'waterSource', type: '孔隙水', description: '秦皇岛市供水水源地', detail: { '城市': '秦皇岛', '类型': '孔隙水', '供水规模': '中型' } },
  { id: 'ws12', name: '张北水源地', lat: 41.15, lng: 114.75, category: 'waterSource', type: '孔隙裂隙水', description: '坝上高原水源地', detail: { '城市': '张北', '类型': '孔隙裂隙水', '供水规模': '小型' } },
];

/** 矿区水文标注点 */
export const mineMarkers: MapMarker[] = [
  { id: 'mn1', name: '开滦矿区', lat: 39.63, lng: 118.35, category: 'mine', type: '煤矿', description: '唐山 | 华北最大煤矿之一', detail: { '类型': '石炭二叠纪煤矿', '位置': '唐山', '排水量': '较大' } },
  { id: 'mn2', name: '峰峰矿区', lat: 36.42, lng: 114.20, category: 'mine', type: '煤矿', description: '邯郸 | 黑龙洞泉域', detail: { '类型': '石炭二叠纪煤矿', '位置': '邯郸', '排水量': '中等' } },
  { id: 'mn3', name: '邯邢矿区', lat: 36.60, lng: 114.30, category: 'mine', type: '铁矿', description: '邯郸-邢台 | 接触交代型铁矿', detail: { '类型': '接触交代型铁矿', '位置': '邯郸-邢台', '排水量': '中等' } },
  { id: 'mn4', name: '蔚县矿区', lat: 39.90, lng: 114.55, category: 'mine', type: '煤矿', description: '张家口 | 蔚县盆地', detail: { '类型': '侏罗纪煤矿', '位置': '张家口', '排水量': '中等' } },
  { id: 'mn5', name: '兴隆矿区', lat: 40.42, lng: 117.50, category: 'mine', type: '煤矿', description: '承德 | 兴隆-鹰手营子', detail: { '类型': '石炭二叠纪煤矿', '位置': '承德', '排水量': '较小' } },
  { id: 'mn6', name: '井陉矿区', lat: 38.08, lng: 114.13, category: 'mine', type: '煤矿', description: '石家庄 | 闭坑矿区', detail: { '类型': '石炭二叠纪煤矿', '位置': '石家庄', '现状': '已闭坑' } },
  { id: 'mn7', name: '武安-涉县铁矿区', lat: 36.70, lng: 114.00, category: 'mine', type: '铁矿', description: '邯郸 | 矽卡岩型磁铁矿', detail: { '类型': '矽卡岩型铁矿', '位置': '邯郸', '排水量': '较大' } },
  { id: 'mn8', name: '遵化-迁西铁矿区', lat: 40.18, lng: 118.10, category: 'mine', type: '铁矿', description: '唐山 | 冀东沉积变质型铁矿', detail: { '类型': '沉积变质型铁矿(BIF)', '位置': '唐山', '排水量': '中等' } },
];

/** 全部标注点合集 (函数形式避免模块级spread导致TDZ) */
export function allMarkers(): MapMarker[] {
  return [
    ...springMarkers,
    ...geothermalMarkers(),
    ...salineMarkers,
    ...waterSourceMarkers,
    ...mineMarkers,
  ];
}

/** 河北省简化边界坐标 (WGS84) */
export const hebeiBoundary: [number, number][] = [
  [40.55, 115.80], [40.90, 116.20], [41.10, 117.00], [41.35, 117.60],
  [41.20, 118.30], [40.70, 118.80], [40.35, 119.20], [40.00, 119.60],
  [39.70, 119.80], [39.45, 119.60], [39.30, 119.10], [39.00, 118.70],
  [38.70, 118.50], [38.30, 118.20], [37.90, 117.90], [37.50, 117.60],
  [37.00, 117.30], [36.60, 117.00], [36.30, 116.50], [36.10, 116.00],
  [36.20, 115.50], [36.50, 115.00], [36.80, 114.60], [37.10, 114.30],
  [37.40, 113.80], [37.80, 113.50], [38.20, 113.50], [38.50, 113.80],
  [38.90, 114.00], [39.30, 114.30], [39.70, 114.50], [40.00, 114.70],
  [40.20, 115.00], [40.45, 115.40], [40.55, 115.80],
];

/** 城市中心坐标 */
export const cityCenters = [
  { name: '全省', lat: 38.50, lng: 115.50, zoom: 7.5 },
  { name: '石家庄', lat: 38.04, lng: 114.51, zoom: 10 },
  { name: '唐山', lat: 39.63, lng: 118.18, zoom: 10 },
  { name: '保定', lat: 38.87, lng: 115.46, zoom: 10 },
  { name: '邯郸', lat: 36.56, lng: 114.47, zoom: 10 },
  { name: '沧州', lat: 38.31, lng: 116.86, zoom: 10 },
  { name: '张家口', lat: 40.77, lng: 114.88, zoom: 9 },
  { name: '承德', lat: 40.95, lng: 117.96, zoom: 9 },
  { name: '廊坊', lat: 39.52, lng: 116.70, zoom: 10 },
  { name: '衡水', lat: 37.73, lng: 115.68, zoom: 10 },
  { name: '邢台', lat: 37.06, lng: 114.50, zoom: 10 },
  { name: '秦皇岛', lat: 39.93, lng: 119.60, zoom: 10 },
];

/** 获取某图层所有标注点 */
export function getMarkersByCategory(category: string): MapMarker[] {
  return allMarkers().filter(m => m.category === category);
}

/** 获取当前可见标注点 */
export function getVisibleMarkers(visibleLayers: Set<string>): MapMarker[] {
  return allMarkers().filter(m => visibleLayers.has(m.category));
}
