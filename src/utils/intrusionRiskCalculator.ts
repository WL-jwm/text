/**
 * B-13 咸水入侵风险评价引擎
 *
 * 功能：
 *  1. 氯离子变化率计算（年变化量+累积变化量）
 *  2. 咸淡水界面推进速度计算（达西+密度修正）
 *  3. 入侵风险等级判定（Cl⁻浓度+界面深度+开采强度）
 *  4. 入侵预测模型（线性/指数外推）
 *  5. 海水入侵类型识别（成片入侵/舌状入侵/越流入侵）
 *  6. 防治措施建议
 */

// ═══════════════════════════════════════════════════════
// 类型定义
// ═══════════════════════════════════════════════════════

export type IntrusionType = '成片入侵' | '舌状入侵' | '越流入侵' | '潜水入侵' | '正常';

export type RiskLevel = '低风险' | '中风险' | '高风险' | '严重';

export interface ChlorideInput {
  /** 监测井名称 */
  wellName: string;
  /** 初始Cl⁻浓度 (mg/L) */
  initialCl: number;
  /** 当前Cl⁻浓度 (mg/L) */
  currentCl: number;
  /** 间隔年数 */
  years: number;
  /** 地下水类型 */
  waterType: '孔隙水' | '岩溶水' | '裂隙水';
  /** 距离海岸线 (km) */
  distanceToCoast: number;
}

export interface ChlorideResult {
  wellName: string;
  initialCl: number;
  currentCl: number;
  /** Cl⁻变化量 (mg/L) */
  deltaCl: number;
  /** Cl⁻变化率 (mg/L/a) */
  rateCl: number;
  /** Cl⁻变化幅度 (%) */
  changePercent: number;
  /** Cl⁻超标倍数 (相对250mg/L III类标准) */
  exceedRatio: number | null;
  riskLevel: RiskLevel;
  intrusionType: IntrusionType;
  /** 距海岸距离 (km) */
  distanceToCoast: number;
  description: string;
  color: string;
}

export interface InterfaceInput {
  /** 初始界面深度 (m) */
  initialDepth: number;
  /** 当前界面深度 (m) */
  currentDepth: number;
  /** 间隔年数 */
  years: number;
  /** 含水层类型 */
  aquiferType: '浅层' | '中深层' | '深层';
  /** 含水层渗透系数 (m/d) */
  K: number;
  /** 含水层有效孔隙度 */
  ne: number;
  /** 淡水位标高 (m) */
  freshwaterHead: number;
  /** 海水密度 (kg/m³) */
  seawaterDensity: number;
  /** 淡水密度 (kg/m³) */
  freshwaterDensity: number;
}

export interface InterfaceResult {
  /** 初始界面深度 (m) */
  initialDepth: number;
  /** 当前界面深度 (m) */
  currentDepth: number;
  /** 界面变化量 (m) — 正值=下移, 负值=上升 */
  deltaDepth: number;
  /** 界面变化速率 (m/a) */
  rateDepth: number;
  /** 界面深度理论值 (Ghyben-Herzberg) (m) */
  ghDepth: number;
  /** 咸水楔坡度 (m/m) */
  wedgeSlope: number;
  riskLevel: RiskLevel;
  description: string;
  color: string;
}

export interface RiskEvaluation {
  /** 综合风险评分 (0-100) */
  totalScore: number;
  riskLevel: RiskLevel;
  intrusionType: IntrusionType;
  /** 各维度评分 */
  dimensions: Array<{
    name: string;
    score: number;
    weight: number;
    description: string;
  }>;
  /** 建议措施 */
  suggestions: string[];
  color: string;
}

/** 预测数据点 */
export interface PredictPoint {
  year: number;
  clValue: number;
  isPredicted: boolean;
}

// ═══════════════════════════════════════════════════════
// 常量
// ═══════════════════════════════════════════════════════

export const RISK_LEVELS: Record<RiskLevel, { color: string; bgColor: string }> = {
  '低风险': { color: '#10b981', bgColor: 'bg-emerald-500/15' },
  '中风险': { color: '#f59e0b', bgColor: 'bg-amber-500/15' },
  '高风险': { color: '#f97316', bgColor: 'bg-orange-500/15' },
  '严重': { color: '#ef4444', bgColor: 'bg-red-500/15' },
};

/** 海水密度 (kg/m³) */
export const SEAWATER_DENSITY = 1025;
/** 淡水密度 (kg/m³) */
export const FRESHWATER_DENSITY = 1000;
/** Cl⁻ III类标准限值 (mg/L) */
export const CL_STANDARD_III = 250;
/** Cl⁻ 海水入侵预警值 (mg/L) */
export const CL_ALERT = 100;
/** Cl⁻ 严重入侵阈值 (mg/L) */
export const CL_SEVERE = 500;

// ═══════════════════════════════════════════════════════
// 核心函数
// ═══════════════════════════════════════════════════════

/**
 * 氯离子变化分析
 */
export function calcChlorideChange(input: ChlorideInput): ChlorideResult {
  const deltaCl = input.currentCl - input.initialCl;
  const rateCl = input.years > 0 ? deltaCl / input.years : 0;
  const changePercent = input.initialCl > 0 ? (deltaCl / input.initialCl) * 100 : 0;
  const exceedRatio = input.currentCl > CL_STANDARD_III ? input.currentCl / CL_STANDARD_III : null;

  // 风险等级判定
  let riskLevel: RiskLevel;
  let intrusionType: IntrusionType;
  let description: string;
  let color: string;

  if (input.currentCl >= CL_SEVERE) {
    riskLevel = '严重';
    color = '#ef4444';
    description = `Cl⁻严重超标(${exceedRatio?.toFixed(2)}×标准)，成片入侵风险极高`;
    intrusionType = '成片入侵';
  } else if (input.currentCl >= CL_STANDARD_III) {
    riskLevel = '高风险';
    color = '#f97316';
    description = `Cl⁻超标(${exceedRatio?.toFixed(2)}×标准)，需加强监测`;
    intrusionType = input.distanceToCoast < 10 ? '舌状入侵' : '越流入侵';
  } else if (input.currentCl >= CL_ALERT) {
    riskLevel = '中风险';
    color = '#f59e0b';
    description = `Cl⁻偏高(${input.currentCl}mg/L)，接近III类标准`;
    intrusionType = input.distanceToCoast < 20 ? '舌状入侵' : '越流入侵';
  } else if (rateCl > 2) {
    riskLevel = '中风险';
    color = '#f59e0b';
    description = `Cl⁻年均增长${rateCl.toFixed(1)}mg/L，呈上升趋势`;
    intrusionType = '潜水入侵';
  } else {
    riskLevel = '低风险';
    color = '#10b981';
    description = 'Cl⁻浓度稳定，无明显入侵迹象';
    intrusionType = '正常';
  }

  return {
    wellName: input.wellName, initialCl: input.initialCl,
    currentCl: input.currentCl, deltaCl, rateCl: round(rateCl, 1),
    changePercent: round(changePercent, 1), exceedRatio: exceedRatio ? round(exceedRatio, 2) : null,
    riskLevel, intrusionType, distanceToCoast: input.distanceToCoast, description, color,
  };
}

/**
 * 咸淡水界面分析（Ghyben-Herzberg公式）
 *
 * z = (ρf / (ρs - ρf)) × hf
 * 其中：
 *   z — 界面深度 (m)
 *   ρf — 淡水密度 (kg/m³)
 *   ρs — 海水密度 (kg/m³)
 *   hf — 淡水位标高 (m)
 *
 * 简化：z ≈ 40 × hf (当ρs=1025, ρf=1000)
 */
export function calcInterfaceAnalysis(input: InterfaceInput): InterfaceResult {
  const deltaDepth = input.currentDepth - input.initialDepth;
  const rateDepth = input.years > 0 ? deltaDepth / input.years : 0;

  // Ghyben-Herzberg理论界面深度
  const densityRatio = input.freshwaterDensity / (input.seawaterDensity - input.freshwaterDensity);
  const ghDepth = densityRatio * input.freshwaterHead;

  // 咸水楔坡度 (m/m) — 基于达西流和密度差
  const wedgeSlope = input.freshwaterHead > 0 && input.K > 0
    ? round((input.freshwaterDensity * input.freshwaterHead) / ((input.seawaterDensity - input.freshwaterDensity) * input.K * 100), 4)
    : 0;

  // 风险判定
  let riskLevel: RiskLevel;
  let description: string;
  let color: string;

  if (deltaDepth > 0 && rateDepth > 2) {
    riskLevel = '严重';
    color = '#ef4444';
    description = `界面快速下移(${rateDepth.toFixed(1)}m/a)，深层咸水入侵严重`;
  } else if (deltaDepth > 0 && rateDepth > 0.5) {
    riskLevel = '高风险';
    color = '#f97316';
    description = `界面持续下移(${rateDepth.toFixed(1)}m/a)，需控制开采量`;
  } else if (deltaDepth > 0) {
    riskLevel = '中风险';
    color = '#f59e0b';
    description = `界面缓慢下移(${rateDepth.toFixed(1)}m/a)，需关注趋势`;
  } else if (deltaDepth < 0) {
    riskLevel = '低风险';
    color = '#10b981';
    description = `界面回升${Math.abs(deltaDepth)}m(${Math.abs(rateDepth).toFixed(1)}m/a)，压采成效显著`;
  } else {
    riskLevel = '低风险';
    color = '#10b981';
    description = '界面稳定，无明显变化';
  }

  return {
    initialDepth: input.initialDepth, currentDepth: input.currentDepth,
    deltaDepth, rateDepth: round(rateDepth, 2),
    ghDepth: round(ghDepth, 1), wedgeSlope,
    riskLevel, description, color,
  };
}

/**
 * 综合风险评价
 */
export function calcRiskEvaluation(
  clResult: ChlorideResult,
  ifResult: InterfaceResult,
): RiskEvaluation {
  // Cl⁻维度评分 (0-40)
  let clScore = 0;
  if (clResult.currentCl >= CL_SEVERE) clScore = 40;
  else if (clResult.currentCl >= CL_STANDARD_III) clScore = 30 + (clResult.currentCl - CL_STANDARD_III) / (CL_SEVERE - CL_STANDARD_III) * 10;
  else if (clResult.currentCl >= CL_ALERT) clScore = 15 + (clResult.currentCl - CL_ALERT) / (CL_STANDARD_III - CL_ALERT) * 15;
  else clScore = clResult.currentCl / CL_ALERT * 15;

  // 界面变化评分 (0-30)
  let ifScore = 0;
  const absRate = Math.abs(ifResult.rateDepth);
  if (ifResult.deltaDepth > 0) {
    if (absRate > 2) ifScore = 30;
    else if (absRate > 0.5) ifScore = 20 + (absRate - 0.5) / 1.5 * 10;
    else ifScore = absRate / 0.5 * 20;
  } else {
    ifScore = Math.min(10, absRate * 5);
  }

  // 变化趋势评分 (0-15)
  const trendScore = clResult.rateCl > 5 ? 15 : clResult.rateCl > 2 ? 10 : clResult.rateCl > 0.5 ? 5 : 0;

  // 距离海岸评分 (0-15)
  const distScore = clResult.distanceToCoast < 5 ? 15 : clResult.distanceToCoast < 15 ? 10 : clResult.distanceToCoast < 30 ? 5 : 0;

  const totalScore = Math.min(100, Math.round(clScore + ifScore + trendScore + distScore));

  let riskLevel: RiskLevel;
  let color: string;
  if (totalScore >= 75) { riskLevel = '严重'; color = '#ef4444'; }
  else if (totalScore >= 50) { riskLevel = '高风险'; color = '#f97316'; }
  else if (totalScore >= 25) { riskLevel = '中风险'; color = '#f59e0b'; }
  else { riskLevel = '低风险'; color = '#10b981'; }

  // 入侵类型判定
  const intrusionType: IntrusionType = clResult.intrusionType;

  // 建议措施
  const suggestions: string[] = [];
  if (clResult.currentCl >= CL_STANDARD_III) suggestions.push('控制该区域地下水开采量，减少咸水锥进');
  if (ifResult.deltaDepth > 1) suggestions.push('实施地下水回灌工程，抬升界面深度');
  if (clResult.rateCl > 2) suggestions.push('加密监测频率(季度→月度)，建立预警机制');
  if (clResult.distanceToCoast < 10) suggestions.push('建设地下帷幕/防渗墙，阻断海水入侵通道');
  if (riskLevel === '严重') suggestions.push('建议实施限采+替代水源方案（南水北调/地表水）');
  if (suggestions.length === 0) suggestions.push('维持现有管理措施，定期监测');

  return {
    totalScore, riskLevel, intrusionType,
    dimensions: [
      { name: 'Cl⁻浓度', score: round(clScore, 1), weight: 0.40, description: `${clResult.currentCl}mg/L，${clResult.riskLevel}` },
      { name: '界面变化', score: round(ifScore, 1), weight: 0.30, description: `${ifResult.deltaDepth > 0 ? '下移' : '回升'}${Math.abs(ifResult.deltaDepth)}m` },
      { name: '变化趋势', score: trendScore, weight: 0.15, description: `年均变化${Math.abs(clResult.rateCl).toFixed(1)}mg/L` },
      { name: '距海岸线', score: distScore, weight: 0.15, description: `${clResult.distanceToCoast}km` },
    ],
    suggestions, color,
  };
}

/**
 * 预测Cl⁻浓度变化
 */
export function predictChloride(
  initialCl: number,
  rateCl: number,
  yearsForward: number,
  startYear: number,
): PredictPoint[] {
  const points: PredictPoint[] = [];
  for (let i = 0; i <= yearsForward; i++) {
    const year = startYear + i;
    points.push({
      year,
      clValue: round(initialCl + rateCl * (year - startYear), 1),
      isPredicted: i > 0,
    });
  }
  return points;
}

// ═══════════════════════════════════════════════════════
// 预设数据
// ═══════════════════════════════════════════════════════

export const PRESET_MONITORING_WELLS: ChlorideInput[] = [
  { wellName: '沧州-沿海-01', initialCl: 85, currentCl: 320, years: 5, waterType: '孔隙水', distanceToCoast: 5 },
  { wellName: '沧州-沿海-02', initialCl: 120, currentCl: 480, years: 5, waterType: '孔隙水', distanceToCoast: 8 },
  { wellName: '唐山-丰南-01', initialCl: 60, currentCl: 145, years: 3, waterType: '孔隙水', distanceToCoast: 12 },
  { wellName: '唐山-丰南-02', initialCl: 45, currentCl: 95, years: 3, waterType: '孔隙水', distanceToCoast: 18 },
  { wellName: '沧州-黄骅-01', initialCl: 200, currentCl: 680, years: 5, waterType: '孔隙水', distanceToCoast: 3 },
  { wellName: '沧州-黄骅-02', initialCl: 150, currentCl: 350, years: 4, waterType: '孔隙水', distanceToCoast: 6 },
  { wellName: '衡水-阜城-01', initialCl: 35, currentCl: 68, years: 5, waterType: '孔隙水', distanceToCoast: 35 },
  { wellName: '邢台-临西-01', initialCl: 28, currentCl: 52, years: 3, waterType: '孔隙水', distanceToCoast: 45 },
];

function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
