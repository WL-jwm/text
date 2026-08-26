/**
 * 水化学计算 — 类型定义
 */

export interface IonInput {
  /** 钙离子 Ca²⁺ (mg/L) */
  Ca: number;
  /** 镁离子 Mg²⁺ (mg/L) */
  Mg: number;
  /** 钠钾离子 Na⁺+K⁺ (mg/L) */
  NaK: number;
  /** 重碳酸根 HCO₃⁻ (mg/L) */
  HCO3: number;
  /** 硫酸根 SO₄²⁻ (mg/L) */
  SO4: number;
  /** 氯离子 Cl⁻ (mg/L) */
  Cl: number;
  /** pH值 */
  pH?: number;
  /** 溶解性总固体 TDS (mg/L)，可选（可自动计算） */
  TDS?: number;
}

/** 离子毫摩尔浓度结果 */

export interface IonMmolResult {
  Ca: number;
  Mg: number;
  NaK: number;
  HCO3: number;
  SO4: number;
  Cl: number;
  /** 阳离子总毫摩尔 */
  totalCation: number;
  /** 阴离子总毫摩尔 */
  totalAnion: number;
}

/** 离子毫摩尔百分数 */

export interface IonPercentResult {
  Ca: number;
  Mg: number;
  NaK: number;
  HCO3: number;
  SO4: number;
  Cl: number;
}

/** 苏卡列夫分类结果 */

export interface SukaliefResult {
  /** 分类名称，如 "HCO₃-Ca型" */
  type: string;
  /** 阴离子组合 */
  anionType: string;
  /** 阳离子组合 */
  cationType: string;
  /** 水化学类型描述 */
  description: string;
  /** 典型分布区域 */
  typicalZone: string;
  /** 水质评价 */
  quality: string;
  /** 分类颜色 */
  color: string;
}

/** Piper三线图坐标 */

export interface PiperCoordinates {
  /** 阳离子三角形坐标 (0-100) */
  cation: { Ca: number; Mg: number; NaK: number };
  /** 阴离子三角形坐标 (0-100) */
  anion: { HCO3: number; SO4: number; Cl: number };
  /** 菱形坐标 (0-100) */
  diamond: { x: number; y: number };
}

/** 水化学评价结果 */

export interface HydrochemEvaluation {
  /** TDS评价 */
  tds: { value: number; level: string; color: string; description: string };
  /** 总硬度评价 */
  hardness: { value: number; level: string; color: string; description: string };
  /** 氯离子评价 */
  chloride: { value: number; level: string; color: string; description: string };
  /** 硫酸根评价 */
  sulfate: { value: number; level: string; color: string; description: string };
  /** pH评价 */
  pH: { value: number; level: string; color: string; description: string };
  /** 水化学类型 */
  waterType: string;
}

/** 完整分析结果 */

export interface HydrochemAnalysisResult {
  input: IonInput;
  mmol: IonMmolResult;
  percent: IonPercentResult;
  sukalief: SukaliefResult;
  piper: PiperCoordinates;
  evaluation: HydrochemEvaluation;
  /** 自动计算TDS */
  calculatedTDS: number;
}

// ═══════════════════════════════════════════════════════
// 常量：离子毫摩尔换算因子
// ═══════════════════════════════════════════════════════

/** 摩尔质量 (g/mol) */

export interface PresetSample {
  name: string;
  location: string;
  zone: string;
  input: IonInput;
}

