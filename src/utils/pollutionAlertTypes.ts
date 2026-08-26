/**
 * 污染预警引擎 — 类型定义
 */

export type AlertLevel = '安全' | '关注' | '预警' | '警告' | '严重';

/** 预警等级元数据 */

export interface AlertLevelMeta {
  level: AlertLevel;
  color: string;
  bgColor: string;
  icon: string;
  description: string;
}

/** 预警阈值配置 */

export interface AlertThresholds {
  /** 关注阈值 (Pi > 此值进入"关注") */
  caution: number;
  /** 预警阈值 (Pi > 此值进入"预警") */
  warning: number;
  /** 警告阈值 (Pi > 此值进入"警告") */
  alert: number;
  /** 严重阈值 (Pi > 此值进入"严重") */
  severe: number;
}

/** 单因子预警结果 */

export interface FactorAlertResult {
  name: string;
  unit: string;
  value: number | null;
  standardIII: number | null;
  /** 标准指数 Pi（数值型） */
  Pi: number | null;
  /** 超标倍数（相对于III类） */
  exceedanceRatio: number | null;
  /** 预警等级 */
  level: AlertLevel;
  /** 预警等级数字（越大越严重） */
  levelNum: number;
  /** 所属类型 */
  type: string;
}

/** 水样综合预警结果 */

export interface SampleAlertResult {
  sampleName: string;
  /** 综合预警等级 */
  level: AlertLevel;
  levelNum: number;
  /** 综合污染指数（等标污染指数法） */
  pollutionIndex: number;
  /** 各因子预警结果 */
  factors: FactorAlertResult[];
  /** 超标因子数 */
  exceededCount: number;
  /** 最大超标因子 */
  maxFactor: FactorAlertResult | null;
  /** 超标因子列表 */
  exceededFactors: string[];
}

/** 区域风险评分 */

export interface RegionRiskResult {
  region: string;
  /** 区域名称 */
  area: string;
  /** 风险评分 0-100 */
  riskScore: number;
  /** 风险等级 */
  riskLevel: AlertLevel;
  riskLevelNum: number;
  /** 主要风险因子 */
  primaryRisks: string[];
  /** 风险描述 */
  description: string;
}

/** 区域输入数据（用于区域风险评分） */

export interface RegionInput {
  region: string;
  area: string;
  /** 各因子超标率 0-1 */
  fluorideRate: number;
  hardnessRate: number;
  nitrateRate: number;
  ironManganeseRate: number;
  ammoniaNitrogenRate: number;
  tdsRate: number;
}

/** 预警摘要统计 */

export interface AlertSummary {
  totalSamples: number;
  safeCount: number;
  cautionCount: number;
  warningCount: number;
  alertCount: number;
  severeCount: number;
  /** 总体预警等级（取最差） */
  overallLevel: AlertLevel;
  overallLevelNum: number;
  /** 超标率 */
  exceededRate: number;
  /** 最常见超标因子 */
  topExceededFactors: string[];
}

/** 趋势数据点 */

export interface TrendPoint {
  period: string;
  value: number;
}

// ═══════════════════════════════════════════════════════
// 常量与预设
// ═══════════════════════════════════════════════════════

/** 预警等级元数据表 */
