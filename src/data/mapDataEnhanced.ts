// ═══════════════════════════════════════════════════════════
// 地图增强数据模块 - 超采区多边形 / 城市资源分级 / 水质标注
// 数据来源: 河北省人民政府超采区通知(2022) | 水资源公报(2024)
// 坐标系: WGS84 | 边界为简化矩形近似
// ═══════════════════════════════════════════════════════════

import { cityGroundwater2024, cityWaterSupply2024 } from './resources-core';
import { cityBulletin2024 } from './resources-bulletin';

/** 城市边界矩形（简化，用于着色填充） */
export interface CityBounds {
  city: string;
  bounds: [[number, number], [number, number]]; // [[south, west], [north, east]]
  center: [number, number];
}

/** 河北各市简化边界 */
export const cityBounds: CityBounds[] = [
  { city: '石家庄', bounds: [[37.6, 113.7], [38.7, 115.6]], center: [38.04, 114.51] },
  { city: '唐山', bounds: [[39.0, 117.3], [40.4, 119.2]], center: [39.63, 118.18] },
  { city: '秦皇岛', bounds: [[39.5, 118.7], [40.6, 120.2]], center: [39.93, 119.60] },
  { city: '邯郸', bounds: [[36.0, 113.5], [37.2, 115.7]], center: [36.56, 114.47] },
  { city: '邢台', bounds: [[36.6, 113.8], [37.6, 115.5]], center: [37.06, 114.50] },
  { city: '保定', bounds: [[38.1, 114.5], [39.8, 116.2]], center: [38.87, 115.46] },
  { city: '张家口', bounds: [[39.6, 113.8], [41.6, 116.3]], center: [40.77, 114.88] },
  { city: '承德', bounds: [[40.2, 116.5], [42.4, 119.8]], center: [40.95, 117.96] },
  { city: '沧州', bounds: [[37.8, 116.0], [38.9, 117.9]], center: [38.31, 116.86] },
  { city: '廊坊', bounds: [[38.9, 116.2], [39.8, 117.4]], center: [39.52, 116.70] },
  { city: '衡水', bounds: [[37.3, 115.2], [38.3, 116.3]], center: [37.73, 115.68] },
];

/** 超采区多边形数据（矩形近似） */
export interface OverdraftPolygon {
  id: string;
  city: string;
  type: 'shallow-general' | 'deep-general' | 'deep-severe';
  label: string;
  bounds: [[number, number], [number, number]];
  color: string;
  fillColor: string;
  info: string;
}

/** 各市超采区多边形 */
export const overdraftPolygons: OverdraftPolygon[] = [
  // 石家庄 - 浅层一般超采区
  { id: 'od-sjz-shallow', city: '石家庄', type: 'shallow-general', label: '石家庄浅层一般超采区', bounds: [[37.7, 114.2], [38.5, 115.5]], color: '#f59e0b', fillColor: 'rgba(245,158,11,0.20)', info: '市区/藁城/栾城/正定/无极/深泽/晋州/新乐等' },
  // 唐山 - 浅层+深层
  { id: 'od-ts-shallow', city: '唐山', type: 'shallow-general', label: '唐山浅层一般超采区', bounds: [[39.2, 117.5], [39.9, 118.8]], color: '#f59e0b', fillColor: 'rgba(245,158,11,0.18)', info: '玉田/滦南/丰南/丰润/曹妃甸等' },
  { id: 'od-ts-deep', city: '唐山', type: 'deep-general', label: '唐山深层一般超采区', bounds: [[39.2, 117.5], [39.9, 118.8]], color: '#3b82f6', fillColor: 'rgba(59,130,246,0.18)', info: '与浅层基本重叠' },
  // 秦皇岛 - 浅层
  { id: 'od-qhd-shallow', city: '秦皇岛', type: 'shallow-general', label: '秦皇岛浅层一般超采区', bounds: [[39.6, 118.9], [40.2, 119.8]], color: '#f59e0b', fillColor: 'rgba(245,158,11,0.15)', info: '昌黎/抚宁/卢龙/青龙部分' },
  // 邯郸 - 浅层+深层
  { id: 'od-hd-shallow', city: '邯郸', type: 'shallow-general', label: '邯郸浅层一般超采区', bounds: [[36.2, 114.1], [37.0, 115.6]], color: '#f59e0b', fillColor: 'rgba(245,158,11,0.20)', info: '丛台/邯山/复兴/峰峰/武安/临漳/成安/大名等' },
  { id: 'od-hd-deep', city: '邯郸', type: 'deep-general', label: '邯郸深层一般超采区', bounds: [[36.2, 114.1], [37.0, 115.6]], color: '#3b82f6', fillColor: 'rgba(59,130,246,0.18)', info: '与浅层基本重叠' },
  // 邢台 - 浅层+深层
  { id: 'od-xt-shallow', city: '邢台', type: 'shallow-general', label: '邢台浅层一般超采区', bounds: [[36.7, 114.2], [37.4, 115.6]], color: '#f59e0b', fillColor: 'rgba(245,158,11,0.20)', info: '襄都/信都/任泽/南和/沙河/内丘/柏乡/隆尧等' },
  { id: 'od-xt-deep', city: '邢台', type: 'deep-general', label: '邢台深层一般超采区', bounds: [[36.7, 114.2], [37.4, 115.6]], color: '#3b82f6', fillColor: 'rgba(59,130,246,0.18)', info: '大范围重叠' },
  // 保定 - 浅层一般+深层严重
  { id: 'od-bd-shallow', city: '保定', type: 'shallow-general', label: '保定浅层一般超采区', bounds: [[38.2, 114.6], [39.2, 116.0]], color: '#f59e0b', fillColor: 'rgba(245,158,11,0.20)', info: '竞秀/莲池/满城/清苑/徐水/涿州/定州等' },
  { id: 'od-bd-deep', city: '保定', type: 'deep-severe', label: '保定深层严重超采区', bounds: [[38.3, 115.2], [38.9, 116.0]], color: '#ef4444', fillColor: 'rgba(239,68,68,0.25)', info: '蠡县/高阳/安新/容城/雄县/清苑部分' },
  // 张家口 - 浅层
  { id: 'od-zjk-shallow', city: '张家口', type: 'shallow-general', label: '张家口浅层一般超采区', bounds: [[40.1, 114.2], [40.9, 115.5]], color: '#f59e0b', fillColor: 'rgba(245,158,11,0.15)', info: '桥东/桥西/宣化/下花园/万全/怀安/怀来等' },
  // 承德 - 浅层
  { id: 'od-cd-shallow', city: '承德', type: 'shallow-general', label: '承德浅层一般超采区', bounds: [[40.4, 117.4], [41.3, 118.3]], color: '#f59e0b', fillColor: 'rgba(245,158,11,0.12)', info: '双桥/双滦/鹰手营子/承德县/兴隆/平泉等' },
  // 沧州 - 深层严重
  { id: 'od-cz-deep', city: '沧州', type: 'deep-severe', label: '沧州深层严重超采区', bounds: [[37.9, 116.0], [38.8, 117.8]], color: '#ef4444', fillColor: 'rgba(239,68,68,0.25)', info: '新华/运河/沧县/青县/东光/海兴/盐山/肃宁等' },
  // 廊坊 - 浅层一般+深层严重
  { id: 'od-lf-shallow', city: '廊坊', type: 'shallow-general', label: '廊坊浅层一般超采区', bounds: [[39.0, 116.3], [39.7, 117.3]], color: '#f59e0b', fillColor: 'rgba(245,158,11,0.20)', info: '安次/广阳/三河/霸州/固安/永清/香河/大城/文安等' },
  { id: 'od-lf-deep', city: '廊坊', type: 'deep-severe', label: '廊坊深层严重超采区', bounds: [[39.0, 116.3], [39.7, 117.3]], color: '#ef4444', fillColor: 'rgba(239,68,68,0.25)', info: '安次/广阳/霸州/固安/永清/大城/文安部分' },
  // 衡水 - 浅层一般+深层严重
  { id: 'od-hs-shallow', city: '衡水', type: 'shallow-general', label: '衡水浅层一般超采区', bounds: [[37.4, 115.3], [38.2, 116.2]], color: '#f59e0b', fillColor: 'rgba(245,158,11,0.20)', info: '桃城/冀州/枣强/武邑/武强/饶阳/安平等' },
  { id: 'od-hs-deep', city: '衡水', type: 'deep-severe', label: '衡水深层严重超采区', bounds: [[37.3, 115.2], [38.3, 116.3]], color: '#ef4444', fillColor: 'rgba(239,68,68,0.25)', info: '全市深层覆盖' },
];

/** 超采区类型图例 */
export const overdraftLegend = [
  { type: 'shallow-general' as const, label: '浅层一般超采区', color: '#f59e0b', fill: 'rgba(245,158,11,0.20)' },
  { type: 'deep-general' as const, label: '深层一般超采区', color: '#3b82f6', fill: 'rgba(59,130,246,0.20)' },
  { type: 'deep-severe' as const, label: '深层严重超采区', color: '#ef4444', fill: 'rgba(239,68,68,0.25)' },
];

/** 城市资源量分级数据 */
export interface CityResourceGrade {
  city: string;
  center: [number, number];
  groundResource: number; // 地下水资源量(亿m³)
  gwSupply: number; // 地下水供水量(亿m³)
  gwRatio: number; // 地下水供水占比(%)
  totalSupply: number; // 总供水量(亿m³)
  grade: 1 | 2 | 3 | 4 | 5; // 1=最丰富 5=最匮乏
}

/** 计算城市资源分级 */
function computeGrade(groundResource: number): 1 | 2 | 3 | 4 | 5 {
  if (groundResource >= 20) return 1;
  if (groundResource >= 15) return 2;
  if (groundResource >= 11) return 3;
  if (groundResource >= 8) return 4;
  return 5;
}

/** 分级颜色映射 */
export const gradeColors: Record<number, string> = {
  1: '#10b981', // 丰富 - 绿
  2: '#22d3ee', // 较丰富 - 青
  3: '#3b82f6', // 中等 - 蓝
  4: '#f59e0b', // 较少 - 橙
  5: '#ef4444', // 匮乏 - 红
};

/** 分级标签 */
export const gradeLabels: Record<number, string> = {
  1: '丰富(≥20亿m³)',
  2: '较丰富(15~20)',
  3: '中等(11~15)',
  4: '较少(8~11)',
  5: '匮乏(<8)',
};

/** 城市中心坐标映射 */
const cityCenterMap: Record<string, [number, number]> = {
  '石家庄': [38.04, 114.51],
  '唐山': [39.63, 118.18],
  '秦皇岛': [39.93, 119.60],
  '邯郸': [36.56, 114.47],
  '邢台': [37.06, 114.50],
  '保定': [38.87, 115.46],
  '张家口': [40.77, 114.88],
  '承德': [40.95, 117.96],
  '沧州': [38.31, 116.86],
  '廊坊': [39.52, 116.70],
  '衡水': [37.73, 115.68],
};

/** 生成城市资源量分级数据 */
export function getCityResourceGrades(): CityResourceGrade[] {
  return cityGroundwater2024
    .filter(c => cityCenterMap[c.city])
    .map(c => {
      const supply = cityWaterSupply2024.find(s => s.city === c.city);
      return {
        city: c.city,
        center: cityCenterMap[c.city],
        groundResource: c.ground,
        gwSupply: supply?.gwSupply ?? 0,
        gwRatio: supply?.gwRatio ?? 0,
        totalSupply: supply?.totalSupply ?? 0,
        grade: computeGrade(c.ground),
      };
    });
}

/** 城市聚合数据卡片信息（点击城市标注时弹出） */
export interface CityAggregatedInfo {
  city: string;
  center: [number, number];
  /** 水资源量 */
  groundResource: number;
  surfaceResource: number;
  totalResource: number;
  /** 供水 */
  gwSupply: number;
  totalSupply: number;
  gwRatio: number;
  /** 公报 */
  precipitation: number;
  /** 超采类型 */
  shallowType: string;
  deepType: string;
  /** 漏斗 */
  hasCone: boolean;
  coneInfo: string;
}

/** 获取城市聚合数据 */
export function getCityAggregatedInfo(cityName: string): CityAggregatedInfo | null {
  const gw = cityGroundwater2024.find(c => c.city === cityName);
  const supply = cityWaterSupply2024.find(s => s.city === cityName);
  const bulletin = cityBulletin2024.find(b => b.city === cityName + '市' || b.city === cityName);
  const center = cityCenterMap[cityName];
  if (!center) return null;

  // 超采类型
  const overdraftCity = [
    { city: '石家庄', shallowType: '一般超采区', deepType: '无' },
    { city: '唐山', shallowType: '一般超采区', deepType: '一般超采区' },
    { city: '秦皇岛', shallowType: '一般超采区', deepType: '无' },
    { city: '邯郸', shallowType: '一般超采区', deepType: '一般超采区' },
    { city: '邢台', shallowType: '一般超采区', deepType: '一般超采区' },
    { city: '保定', shallowType: '一般超采区', deepType: '严重超采区' },
    { city: '张家口', shallowType: '一般超采区', deepType: '无' },
    { city: '承德', shallowType: '一般超采区', deepType: '无' },
    { city: '沧州', shallowType: '无', deepType: '严重超采区' },
    { city: '廊坊', shallowType: '一般超采区', deepType: '严重超采区' },
    { city: '衡水', shallowType: '一般超采区', deepType: '严重超采区' },
  ].find(c => c.city === cityName);

  // 漏斗
  const coneMap: Record<string, string> = {
    '保定': '高蠡肃饶浅层漏斗(2236km²)/雄县固安浅层漏斗(281km²)',
    '邢台': '宁柏隆浅层漏斗(1493km²)/隆尧浅层漏斗(15km²)',
    '沧州': '深层漏斗已消散(历史最大~1000km²)',
    '廊坊': '霸州文安深层漏斗已消散',
    '衡水': '景县故城深层漏斗已消散',
  };

  return {
    city: cityName,
    center,
    groundResource: gw?.ground ?? 0,
    surfaceResource: gw?.surface ?? 0,
    totalResource: gw?.total ?? 0,
    gwSupply: supply?.gwSupply ?? 0,
    totalSupply: supply?.totalSupply ?? 0,
    gwRatio: supply?.gwRatio ?? 0,
    precipitation: bulletin?.precipitation ?? 0,
    shallowType: overdraftCity?.shallowType ?? '-',
    deepType: overdraftCity?.deepType ?? '-',
    hasCone: !!coneMap[cityName],
    coneInfo: coneMap[cityName] ?? '',
  };
}
