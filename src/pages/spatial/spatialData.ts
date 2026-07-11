// ═══════════════════════════════════════════════════════════════
// 空间分析数据定义（基于平台已有数据集推导）
// ═══════════════════════════════════════════════════════════════

export interface CitySpatialPoint {
  city: string;
  lng: number;
  lat: number;
  waterLevel: number;     // 水位埋深(m)
  quality: number;        // 水质指数(1-5)
  extraction: number;     // 开采量(亿m³)
  gradient: number;       // 地温梯度(C/100m)
  subsidence: number;     // 沉降速率(mm/a)
  wellCount: number;      // 监测井数
}

/** 11个地级市空间特征数据 */
export const SPATIAL_DATA: CitySpatialPoint[] = [
  { city: '石家庄', lng: 114.502, lat: 38.045, waterLevel: 32, quality: 3.8, extraction: 18.5, gradient: 3.2, subsidence: 45, wellCount: 280 },
  { city: '唐山', lng: 118.175, lat: 39.629, waterLevel: 15, quality: 3.2, extraction: 12.3, gradient: 3.0, subsidence: 30, wellCount: 195 },
  { city: '秦皇岛', lng: 119.586, lat: 39.942, waterLevel: 8, quality: 2.5, extraction: 4.2, gradient: 2.8, subsidence: 5, wellCount: 85 },
  { city: '邯郸', lng: 114.490, lat: 36.612, waterLevel: 28, quality: 3.5, extraction: 14.8, gradient: 3.5, subsidence: 38, wellCount: 210 },
  { city: '邢台', lng: 114.508, lat: 37.068, waterLevel: 35, quality: 4.0, extraction: 16.2, gradient: 3.3, subsidence: 52, wellCount: 175 },
  { city: '保定', lng: 115.464, lat: 38.873, waterLevel: 25, quality: 3.0, extraction: 20.1, gradient: 3.1, subsidence: 28, wellCount: 245 },
  { city: '张家口', lng: 114.884, lat: 40.824, waterLevel: 12, quality: 2.0, extraction: 3.5, gradient: 2.5, subsidence: 3, wellCount: 65 },
  { city: '承德', lng: 117.939, lat: 40.976, waterLevel: 6, quality: 1.8, extraction: 2.8, gradient: 2.3, subsidence: 2, wellCount: 55 },
  { city: '沧州', lng: 116.857, lat: 38.306, waterLevel: 18, quality: 4.2, extraction: 8.6, gradient: 4.0, subsidence: 65, wellCount: 160 },
  { city: '廊坊', lng: 116.683, lat: 39.509, waterLevel: 22, quality: 3.6, extraction: 7.2, gradient: 3.8, subsidence: 35, wellCount: 130 },
  { city: '衡水', lng: 115.665, lat: 37.735, waterLevel: 40, quality: 4.3, extraction: 11.5, gradient: 3.6, subsidence: 58, wellCount: 145 },
];

/** 分区类型 */
export type ZoneGroup = '山前平原' | '中部平原' | '滨海平原' | '山区';

/** 分区定义 */
export const ZONE_DEFS: Record<ZoneGroup, { cities: string[]; color: string; desc: string }> = {
  '山前平原': { cities: ['石家庄', '保定', '邯郸', '邢台'], color: '#22c55e', desc: '水位埋深较大，开采强度高，超采漏斗发育' },
  '中部平原': { cities: ['衡水', '廊坊'], color: '#f59e0b', desc: '过渡带，水位中等，沉降速率较快' },
  '滨海平原': { cities: ['沧州', '唐山', '秦皇岛'], color: '#3b82f6', desc: '水位较浅但水质差，地热资源丰富' },
  '山区': { cities: ['张家口', '承德'], color: '#8b5cf6', desc: '基岩裂隙水为主，水质优良，地热梯度低' },
};

export function getZone(city: string): ZoneGroup {
  for (const [zone, def] of Object.entries(ZONE_DEFS)) {
    if (def.cities.includes(city)) return zone as ZoneGroup;
  }
  return '山前平原';
}
