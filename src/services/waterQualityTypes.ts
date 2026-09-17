/**
 * 水质评价服务 (G-11) — 类型定义
 * 拆分自 waterQuality.ts：水质指标/类别/舒卡列夫分类/评价结果
 */

export type WaterQualityIndicator =
  | 'pH' | 'TDS' | 'totalHardness' | 'Cl' | 'SO4' | 'NO3' | 'NO2'
  | 'NH4' | 'F' | 'Fe' | 'Mn' | 'As' | 'Cr6' | 'Pb' | 'Cd' | 'Hg'
  | 'COD' | 'DO' | 'totalBacteria';

/** 水质分类（GB/T 14848-2017） */
export type WaterQualityClass = 1 | 2 | 3 | 4 | 5;

/** 苏卡列夫阴离子分类 */
export type SulinAnionType = 'HCO₃' | 'SO₄' | 'Cl' | 'HCO₃·SO₄' | 'HCO₃·Cl' | 'SO₄·Cl' | 'HCO₃·SO₄·Cl';

/** 苏卡列夫阳离子分类 */
export type SulinCationType = 'Ca' | 'Mg' | 'Na' | 'Ca·Mg' | 'Ca·Na' | 'Mg·Na' | 'Ca·Mg·Na';

/** 苏卡列夫水化学类型 */
export interface SulinClassification {
  anionType: SulinAnionType;
  cationType: SulinCationType;
  fullName: string;
}

/** 单项指标评价结果 */
export interface SingleIndicatorResult {
  indicator: WaterQualityIndicator;
  label: string;
  /** 实测值 */
  value: number;
  /** 单位 */
  unit: string;
  /** 水质类别（1~5） */
  class: WaterQualityClass;
  /** 是否超标（>Ⅲ类） */
  isExceeded: boolean;
  /** 超标倍数 */
  exceedRatio: number;
  /** 对应Ⅲ类标准限值 */
  class3Limit: number;
  /** 备注 */
  note?: string;
}

/** 水质综合评价结果 */
export interface WaterQualityAssessment {
  /** 井/站点编号 */
  stationId: string;
  /** 井/站点名称 */
  stationName: string;
  /** 城市 */
  city: string;
  /** 评价时间 */
  assessmentDate: string;
  /** 所有单项指标评价 */
  indicators: SingleIndicatorResult[];
  /** 综合水质类别（取最差单项） */
  comprehensiveClass: WaterQualityClass;
  /** 综合水质等级描述 */
  comprehensiveLabel: string;
  /** 超标因子列表 */
  exceededFactors: SingleIndicatorResult[];
  /** 超标因子数 */
  exceededCount: number;
  /** 苏卡列夫分类 */
  sulin?: SulinClassification;
  /** 主要阴离子当量（meq/L） */
  anionEq?: Record<string, number>;
  /** 主要阳离子当量（meq/L） */
  cationEq?: Record<string, number>;
  /** 矿化度（mg/L） */
  TDS: number;
  /** 总硬度（mg/L CaCO₃） */
  totalHardness: number;
  /** 水化学类型描述 */
  hydrochemicalType?: string;
}

/** 水质评价统计汇总 */
export interface WaterQualitySummary {
  /** 参与评价的井数 */
  totalSites: number;
  /** 各水质类别数量 */
  classDistribution: Record<WaterQualityClass, number>;
  /** 超标井数（≥Ⅳ类） */
  exceededSites: number;
  /** 超标率 */
  exceedRate: number;
  /** 主要超标因子（按出现频率排序） */
  topFactors: { indicator: WaterQualityIndicator; label: string; count: number; rate: number }[];
  /** 苏卡列夫类型分布 */
  sulinDistribution: Record<string, number>;
}

/** 按城市水质统计 */
export interface CityWaterQualityStats {
  city: string;
  siteCount: number;
  classDistribution: Record<WaterQualityClass, number>;
  exceededSites: number;
  averageClass: number;
  mainFactors: string[];
}

// ============ GB/T 14848-2017 分类阈值 ============

/** 各指标元数据 */
