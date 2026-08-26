/**
 * 水质评价计算 — 类型定义
 */

export interface EvaluationFactor {
  name: string;
  unit: string;
  I: string;
  II: string;
  III: string;
  IV: string;
  V: string;
  type: string;
}


export interface LimitRange {
  low: number;
  high: number;
  inclusive: boolean;
}

/** 单因子评价结果 */

export interface FactorResult {
  name: string;
  unit: string;
  /** 监测值（原始） */
  value: string;
  /** 监测值（数值），未检出时为 null */
  numericValue: number | null;
  /** 是否未检出 */
  isND: boolean;
  /** 检出限 */
  detectionLimit?: number;
  /** III类标准限值（数值型） */
  standardIII: number | null;
  /** 标准指数 Pi */
  Pi: string;
  /** 是否超标 */
  isExceeded: boolean;
  /** 评定类别 */
  className: string;
  /** 类别数字 */
  classNum: number;
}

/** 单个水样评价结果 */

export interface SampleResult {
  sampleName: string;
  /** 综合评定类别（取最差类别） */
  overallClass: string;
  overallClassNum: number;
  /** 各因子评价结果 */
  factors: FactorResult[];
  /** 超标因子数量 */
  exceededCount: number;
  /** 超标因子列表 */
  exceededFactors: string[];
}

/** 苏卡列夫分类结果 */

export interface SukalovResult {
  /** 水化学类型 如 "HCO₃-Ca·Mg" */
  type: string;
  /** 阴离子优势排序 */
  anions: string[];
  /** 阳离子优势排序 */
  cations: string[];
  /** 各离子百分比 */
  anionPercentages: Record<string, number>;
  cationPercentages: Record<string, number>;
  /** 苏卡列夫分区号 */
  zone: number;
}

// ═══════════════════════════════════════════════════════
// 标准限值解析
// ═══════════════════════════════════════════════════════

/**
 * 解析标准限值字符串为数值区间
 * 支持格式：
 *   "≤150"     → { low: -Infinity, high: 150, inclusive: true }
 *   ">650"     → { low: 650, high: Infinity, inclusive: false }
 *   "6.5~8.5"  → { low: 6.5, high: 8.5, inclusive: true }
 *   "无"       → null（感官指标，不能数值化）
 */

export interface SukalovInput {
  /** 各离子浓度 (mg/L) */
  HCO3: number;   // 重碳酸根
  SO4: number;    // 硫酸根
  Cl: number;     // 氯离子
  Ca: number;     // 钙
  Mg: number;     // 镁
  Na: number;     // 钠
  /** 总阳离子当量浓度（用于校验） */
  totalCation?: number;
}

/** 离子摩尔质量 (g/mol) */
