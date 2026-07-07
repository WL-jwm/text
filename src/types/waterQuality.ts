// ── 水质数据相关类型定义 ──

/** 水质趋势数据点 */
export interface WaterQualityTrendPoint {
  year: number;
  I2Percent: number;
  IIIPlusPercent: number;
  IVPercent: number;
  VPercent: number;
  monitoringWells: number;
  note: string;
}

/** 各市水质趋势数据点 */
export interface CityQualityTrendPoint {
  city: string;
  y2020: number;
  y2021: number;
  y2022: number;
  y2023: number;
  y2024: number;
  improvement: number;
}
