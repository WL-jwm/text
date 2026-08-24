/**
 * 土壤盐渍化计算 — 类型定义
 */

export interface SalinizationInput {
  /** 采样点/区域名称 */
  name: string;
  /** 全盐量 (g/kg) */
  totalSalt: number;
  /** 饱和泥浆电导率 EC_e (dS/m) */
  ecE: number;
  /** 土壤 pH */
  ph: number;
  /** 阴离子 Cl⁻ (cmol(+)/kg) */
  chloride: number;
  /** 阴离子 SO₄²⁻ (cmol(+)/kg) */
  sulfate: number;
  /** 阴离子 HCO₃⁻ (cmol(+)/kg) */
  bicarbonate: number;
  /** 阴离子 CO₃²⁻ (cmol(+)/kg) */
  carbonate: number;
  /** 阳离子 Na⁺ (cmol(+)/kg) */
  sodium: number;
  /** 阳离子 Ca²⁺ (cmol(+)/kg) */
  calcium: number;
  /** 阳离子 Mg²⁺ (cmol(+)/kg) */
  magnesium: number;
  /** 地下水矿化度 (g/L) */
  gwMineralization: number;
  /** 地下水埋深 (m) */
  gwDepth: number;
  /** 土壤质地 (砂土/砂壤/轻壤/中壤/重壤/黏土) */
  soilTexture: string;
  /** 灌溉水矿化度 EC_dw (dS/m) */
  irrigationEC: number;
  /** 目标作物耐盐阈值 EC_t (dS/m) */
  cropThreshold: number;
}


export interface SaltGradeResult {
  /** 指标名称 */
  indicator: string;
  /** 实测值 */
  value: number;
  /** 单位 */
  unit: string;
  /** 分级 */
  grade: string;
  /** 分级说明 */
  description: string;
  /** 颜色标识 */
  color: string;
}


export interface SaltTypeResult {
  /** 主要盐分类型 */
  primaryType: string;
  /** 次要盐分类型 */
  secondaryType: string;
  /** Cl⁻/SO₄²⁻ 当量比 */
  clSo4Ratio: number;
  /** HCO₃⁻/Cl⁻+SO₄²⁻ 当量比 */
  hco3Ratio: number;
  /** 钠吸附比 SAR */
  sar: number;
  /** 碱化度 ESP 估算 (%) */
  esp: number;
  /** 类型说明 */
  note: string;
}


export interface LeachingResult {
  /** 淋洗需水量比例 LR */
  lr: number;
  /** 总灌水量系数 (1+LR) */
  totalIrrigationFactor: number;
  /** 每公顷淋洗需水量 (m³/ha) */
  leachingVolume: number;
  /** 排盐量 (t/ha) */
  saltRemoval: number;
  /// 淋洗后预期 EC_e */
  projectedEC: number;
  /** 建议 */
  suggestion: string;
}


export interface ReclamationResult {
  /** 初始全盐量 (g/kg) */
  initialSalt: number;
  /** 目标全盐量 (g/kg) */
  targetSalt: number;
  /** 年脱盐率 (%) */
  annualDesalinationRate: number;
  /** 预计改良年限 */
  reclamationYears: number;
  /** 年排盐量 (t/ha) */
  annualSaltRemoval: number;
  /** 总排盐量 (t/ha) */
  totalSaltRemoval: number;
  /** 改良难度 */
  difficulty: string;
  /** 建议 */
  suggestion: string;
}


export interface CriticalDepthResult {
  /** 地下水埋深 (m) */
  gwDepth: number;
  /** 临界深度 (m) */
  criticalDepth: number;
  /** 安全深度 (m) */
  safeDepth: number;
  /** 毛细水上升高度 (m) */
  capillaryRise: number;
  /** 是否安全 */
  isSafe: boolean;
  /** 风险等级 */
  riskLevel: string;
  /** 建议 */
  suggestion: string;
}


export interface SalinizationResult {
  name: string;
  saltGrades: SaltGradeResult[];
  /** 综合盐渍化等级 */
  overallGrade: string;
  saltType: SaltTypeResult;
  leaching: LeachingResult;
  reclamation: ReclamationResult;
  criticalDepth: CriticalDepthResult;
  /** 综合评价结论 */
  conclusion: string;
}

// ═══════════════════════════════════════════════════════
// 盐分分级标准
// ═══════════════════════════════════════════════════════


export interface SaltGradeStandard {
  grade: string;
  description: string;
  color: string;
  /** 全盐量上限 (g/kg) */
  saltMax: number;
  /** EC_e 上限 (dS/m) */
  ecMax: number;
}


export interface pHGradeStandard {
  grade: string;
  description: string;
  color: string;
  phMin: number;
  phMax: number;
}


export interface TextureCapillaryParam {
  texture: string;
  /** 毛细水强烈上升高度 (m) */
  capillaryRise: number;
  /** 临界深度附加系数 (m) */
  criticalExtra: number;
  /** 渗透系数建议 (m/d) */
  permeability: number;
}

