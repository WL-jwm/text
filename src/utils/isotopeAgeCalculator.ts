/**
 * B-20 地下水同位素年龄估算引擎
 *
 * 功能：
 *  1. ³H放射性衰变年龄（活塞流模型/指数模型）
 *  2. ¹⁴C年龄校正（δ¹³C校正/稀释校正）
 *  3. ⁴He累积年龄
 *  4. 补给温度/高程估算（δ²H-δ¹⁸O关系）
 *  5. 预设监测点数据（河北平原8组）
 */

// ═══════════════════════════════════════════════════════
// 物理常数
// ═══════════════════════════════════════════════════════

/** ³H半衰期 (a) */
const HALF_LIFE_3H = 12.32;
/** ³H衰变常数 (1/a) */
const LAMBDA_3H = Math.LN2 / HALF_LIFE_3H;
/** ¹⁴C半衰期 (a) — Libby半衰期 */
const HALF_LIFE_14C = 5730;
/** ¹⁴C衰变常数 (1/a) */
const LAMBDA_14C = Math.LN2 / HALF_LIFE_14C;
/** ⁴He累积速率 (cm³STP/kg·a) — 典型值 */
const HE4_ACCUM_RATE = 1e-8;

// ═══════════════════════════════════════════════════════
// 类型定义
// ═══════════════════════════════════════════════════════

export interface TritiumInput {
  /** 监测点名称 */
  name: string;
  /** 实测³H浓度 (TU) */
  measuredTU: number;
  /** 补给时初始³H浓度 (TU) */
  initialTU: number;
  /** 模型类型 */
  model: 'piston' | 'exponential';
  /** 指数模型平均周转时间 τ (a) — 仅指数模型使用 */
  turnoverTime?: number;
}

export interface TritiumResult {
  name: string;
  /** 表观年龄 */
  apparentAge: number;
  /** 模型类型 */
  model: string;
  /** 剩余³H比例 (%) */
  remainingFraction: number;
  /** 年龄分级 */
  ageGrade: '现代水(<10a)' | '次现代水(10~50a)' | '老水(50~1000a)' | '古水(>1000a)';
  /** 说明 */
  note: string;
}

export interface Carbon14Input {
  /** 监测点名称 */
  name: string;
  /** 实测¹⁴C含量 (pmc — percent modern carbon) */
  measuredPMC: number;
  /** 初始¹⁴C含量 A0 (pmc) */
  initialPMC: number;
  /** δ¹³C校正值 (‰) */
  delta13C: number;
  /** 补给区δ¹³C (‰) */
  rechargeDelta13C: number;
  /** 碳酸盐稀释比例 (0~1) */
  dilutionFactor: number;
}

export interface Carbon14Result {
  name: string;
  /** 未校正年龄 (a BP) */
  rawAge: number;
  /** δ¹³C校正后年龄 (a BP) */
  correctedAge: number;
  /** 稀释校正后年龄 (a BP) */
  dilutionCorrectedAge: number;
  /** 推荐年龄 (a BP) */
  recommendedAge: number;
  /** 年龄分级 */
  ageGrade: '现代碳' | '百年级' | '千年级' | '万年级';
  /** 说明 */
  note: string;
}

export interface Helium4Input {
  /** 监测点名称 */
  name: string;
  /** 实测⁴He浓度 (cm³STP/kg) */
  measuredHe4: number;
  /** 大气平衡⁴He背景值 (cm³STP/kg) */
  atmosphericHe4: number;
  /** 累积速率 (cm³STP/kg·a) */
  accumRate: number;
}

export interface Helium4Result {
  name: string;
  /** 过量⁴He (cm³STP/kg) */
  excessHe4: number;
  /** 估算年龄 */
  estimatedAge: number;
  /** 年龄分级 */
  ageGrade: '现代水' | '百年-千年' | '千年-万年' | '万年以上';
  /** 说明 */
  note: string;
}

export interface RechargeTempInput {
  /** 监测点名称 */
  name: string;
  /** 实测δ¹⁸O (‰ VSMOW) */
  delta18O: number;
  /** 实测δ²H (‰ VSMOW) */
  deltaD: number;
  /** 当地大气降水线 LMWL: δ²H = a×δ¹⁸O + b */
  lmwlSlope: number;
  lmwlIntercept: number;
  /** 氧同位素-温度关系斜率 (‰/°C) */
  d18OTempSlope: number;
  /** 高程效应梯度 (‰/100m) */
  elevationGradient: number;
  /** 参考站高程 */
  referenceElevation: number;
  /** 参考站δ¹⁸O */
  referenceDelta18O: number;
}

export interface RechargeTempResult {
  name: string;
  /** 补给温度估算 (°C) */
  rechargeTemp: number;
  /** 补给高程估算 */
  rechargeElevation: number;
  /** 氘盈余 d-excess = δ²H - 8×δ¹⁸O (‰) */
  dExcess: number;
  /** 蒸发影响判断 */
  evaporationEffect: string;
  /** 水岩交换判断 */
  waterRockInteraction: string;
  /** 说明 */
  note: string;
}

// ═══════════════════════════════════════════════════════
// 预设监测点数据（河北平原8组）
// ═══════════════════════════════════════════════════════

export interface IsotopePreset {
  name: string;
  location: string;
  aquiferType: string;
  tritium: number;
  c14: number;
  delta13C: number;
  he4: number;
  delta18O: number;
  deltaD: number;
  depth: number;
  note: string;
}

export const PRESET_SITES: IsotopePreset[] = [
  { name: '石家庄浅层', location: '石家庄市区', aquiferType: '潜水', tritium: 15.2, c14: 85, delta13C: -12, he4: 5e-8, delta18O: -8.2, deltaD: -60, depth: 30, note: '现代水，大气降水补给' },
  { name: '保定浅层', location: '保定市区', aquiferType: '潜水', tritium: 12.5, c14: 78, delta13C: -11, he4: 8e-8, delta18O: -8.5, deltaD: -63, depth: 35, note: '现代水，山前补给' },
  { name: '衡水中层', location: '衡水市区', aquiferType: '承压水', tritium: 3.8, c14: 45, delta13C: -9, he4: 5e-7, delta18O: -9.1, deltaD: -68, depth: 150, note: '次现代-老水混合' },
  { name: '沧州深层', location: '沧州市区', aquiferType: '承压水', tritium: 0.5, c14: 15, delta13C: -6, he4: 2e-6, delta18O: -9.8, deltaD: -74, depth: 350, note: '古水，补给年龄千年级' },
  { name: '廊坊深层', location: '廊坊市区', aquiferType: '承压水', tritium: 0.3, c14: 8, delta13C: -5, he4: 3.5e-6, delta18O: -10.2, deltaD: -77, depth: 400, note: '古水，⁴He年龄万年级' },
  { name: '唐山岩溶水', location: '唐山市区', aquiferType: '岩溶水', tritium: 8.5, c14: 62, delta13C: -10, he4: 1.5e-7, delta18O: -8.8, deltaD: -65, depth: 120, note: '岩溶水，半现代' },
  { name: '邢台深层', location: '邢台市区', aquiferType: '承压水', tritium: 0.8, c14: 22, delta13C: -7, he4: 1.8e-6, delta18O: -9.5, deltaD: -71, depth: 300, note: '老水-古水过渡' },
  { name: '邯郸岩溶水', location: '邯郸峰峰', aquiferType: '岩溶水', tritium: 10.2, c14: 70, delta13C: -11, he4: 1e-7, delta18O: -8.6, deltaD: -62, depth: 80, note: '岩溶水，现代补给为主' },
];

// ═══════════════════════════════════════════════════════
// 核心计算函数
// ═══════════════════════════════════════════════════════

/**
 * ³H放射性衰变年龄
 *
 * 活塞流模型: t = -ln(C/C0) / λ
 * 指数模型: C/C0 = λ/(λ+1/τ) → t = τ (平均年龄)
 */
export function calcTritiumAge(input: TritiumInput): TritiumResult {
  const { measuredTU, initialTU, model } = input;

  let apparentAge: number;
  let modelLabel: string;
  let note: string = '';

  if (model === 'piston') {
    // 活塞流: t = -ln(C/C0) / λ
    const ratio = initialTU > 0 ? measuredTU / initialTU : 0;
    if (ratio <= 0 || ratio > 1) {
      apparentAge = 0;
      note = '³H浓度异常，可能存在现代水混合或测量误差';
    } else {
      apparentAge = -Math.log(ratio) / LAMBDA_3H;
    }
    modelLabel = '活塞流模型 (PFM)';
    note = note ?? `活塞流假设：水分子以活塞流方式运动，无混合。t = -ln(C/C₀)/λ`;
  } else {
    // 指数模型: 平均年龄 = τ
    apparentAge = input.turnoverTime ?? 0;
    modelLabel = '指数模型 (EMM)';
    const ratio = initialTU > 0 ? measuredTU / initialTU : 0;
    note = `指数模型假设完全混合，平均周转时间τ=${apparentAge}a。实测³H=${measuredTU}TU，初始³H=${initialTU}TU，C/C₀=${Math.round(ratio * 1000) / 1000}`;
  }

  const remainingFraction = initialTU > 0 ? (measuredTU / initialTU) * 100 : 0;

  let ageGrade: TritiumResult['ageGrade'];
  if (apparentAge < 10) ageGrade = '现代水(<10a)';
  else if (apparentAge < 50) ageGrade = '次现代水(10~50a)';
  else if (apparentAge < 1000) ageGrade = '老水(50~1000a)';
  else ageGrade = '古水(>1000a)';

  return {
    name: input.name,
    apparentAge: Math.round(apparentAge * 10) / 10,
    model: modelLabel,
    remainingFraction: Math.round(remainingFraction * 10) / 10,
    ageGrade,
    note,
  };
}

/**
 * ¹⁴C年龄校正
 *
 * 未校正: t = -ln(A/A0) / λ
 * δ¹³C校正: 校正初始A0
 * 稀释校正: 扣除碳酸盐稀释
 */
export function calcCarbon14Age(input: Carbon14Input): Carbon14Result {
  const { measuredPMC, initialPMC, delta13C, rechargeDelta13C, dilutionFactor } = input;

  // 未校正年龄
  const rawRatio = initialPMC > 0 ? measuredPMC / initialPMC : 0;
  const rawAge = rawRatio > 0 && rawRatio <= 1 ? -Math.log(rawRatio) / LAMBDA_14C : 0;

  // δ¹³C校正：调整初始A0
  // A0_corrected = A0 × (1 + δ¹³C_recharge) / (1 + δ¹³C_measured)
  // 简化的Pearson校正
  const d13CCorrection = (rechargeDelta13C - delta13C) * 0.5; // 校正因子
  const correctedInitialPMC = initialPMC * (1 + d13CCorrection / 1000);
  const correctedRatio = correctedInitialPMC > 0 ? measuredPMC / correctedInitialPMC : 0;
  const correctedAge = correctedRatio > 0 && correctedRatio <= 1 ? -Math.log(correctedRatio) / LAMBDA_14C : 0;

  // 稀释校正：扣除碳酸盐稀释效应
  // A_true = A_measured / (1 - dilutionFactor)
  const dilutionCorrectedPMC = dilutionFactor < 1 ? measuredPMC / (1 - dilutionFactor) : measuredPMC;
  const dilutionRatio = initialPMC > 0 ? dilutionCorrectedPMC / initialPMC : 0;
  const dilutionCorrectedAge = dilutionRatio > 0 && dilutionRatio <= 1 ? -Math.log(dilutionRatio) / LAMBDA_14C : 0;

  // 推荐年龄：取δ¹³C校正和稀释校正的平均
  const recommendedAge = (correctedAge + dilutionCorrectedAge) / 2;

  let ageGrade: Carbon14Result['ageGrade'];
  if (recommendedAge < 100) ageGrade = '现代碳';
  else if (recommendedAge < 1000) ageGrade = '百年级';
  else if (recommendedAge < 10000) ageGrade = '千年级';
  else ageGrade = '万年级';

  const note = `¹⁴C=${measuredPMC}pmc, A₀=${initialPMC}pmc, δ¹³C=${delta13C}‰。` +
    `δ¹³C校正量=${Math.round(d13CCorrection * 10) / 10}‰, 稀释系数=${Math.round(dilutionFactor * 100)}%。`;

  return {
    name: input.name,
    rawAge: Math.round(rawAge),
    correctedAge: Math.round(correctedAge),
    dilutionCorrectedAge: Math.round(dilutionCorrectedAge),
    recommendedAge: Math.round(recommendedAge),
    ageGrade,
    note,
  };
}

/**
 * ⁴He累积年龄
 * t = (He_measured - He_atmospheric) / accumRate
 */
export function calcHelium4Age(input: Helium4Input): Helium4Result {
  const excessHe4 = input.measuredHe4 - input.atmosphericHe4;
  const estimatedAge = input.accumRate > 0 ? excessHe4 / input.accumRate : 0;

  let ageGrade: Helium4Result['ageGrade'];
  if (estimatedAge < 100) ageGrade = '现代水';
  else if (estimatedAge < 1000) ageGrade = '百年-千年';
  else if (estimatedAge < 10000) ageGrade = '千年-万年';
  else ageGrade = '万年以上';

  const note = `⁴He过量=${excessHe4.toExponential(3)} cm³STP/kg, 累积速率=${input.accumRate.toExponential(3)} cm³STP/(kg·a)。` +
    `⁴He随含水层中U/Th衰变持续累积，是估算老水年龄的有效指标。`;

  return {
    name: input.name,
    excessHe4: excessHe4,
    estimatedAge: Math.round(estimatedAge),
    ageGrade,
    note,
  };
}

/**
 * 补给温度/高程估算
 * 利用δ¹⁸O与温度、高程的经验关系
 */
export function calcRechargeTemp(input: RechargeTempInput): RechargeTempResult {
  const { delta18O, deltaD, lmwlSlope, lmwlIntercept, d18OTempSlope, elevationGradient, referenceElevation, referenceDelta18O } = input;

  // 氘盈余
  const dExcess = deltaD - 8 * delta18O;

  // 补给温度估算（基于δ¹⁸O-温度关系）
  // 假设参考温度对应的δ¹⁸O为参考值
  // ΔT = (δ¹⁸O_measured - δ¹⁸O_ref) / slope
  const delta18ODiff = delta18O - referenceDelta18O;
  const tempDiff = d18OTempSlope !== 0 ? delta18ODiff / d18OTempSlope : 0;
  // 参考温度假设为当地年均温12°C
  const referenceTemp = 12;
  const rechargeTemp = referenceTemp + tempDiff;

  // 补给高程估算
  // Δh = (δ¹⁸O_measured - δ¹⁸O_ref) / gradient × 100
  const elevationDiff = elevationGradient !== 0 ? (delta18ODiff / elevationGradient) * 100 : 0;
  const rechargeElevation = referenceElevation + elevationDiff;

  // 蒸发影响判断
  let evaporationEffect: string;
  if (dExcess > 12) {
    evaporationEffect = '低蒸发（d-excess>12‰），快速入渗补给';
  } else if (dExcess > 8) {
    evaporationEffect = '中等蒸发（8~12‰），经历一定蒸发';
  } else {
    evaporationEffect = '高蒸发（d-excess<8‰），受蒸发影响显著';
  }

  // 水岩交换判断
  let waterRockInteraction: string;
  if (delta18O > -6) {
    waterRockInteraction = 'δ¹⁸O偏正，可能存在水岩交换（高温地热水或长期滞留）';
  } else if (delta18O < -11) {
    waterRockInteraction = 'δ¹⁸O偏负，高海拔或寒冷气候补给';
  } else {
    waterRockInteraction = 'δ¹⁸O正常范围，以大气降水补给为主';
  }

  // LMWL偏离
  const lmwlPredictedD = lmwlSlope * delta18O + lmwlIntercept;
  const lmwlDeviation = deltaD - lmwlPredictedD;
  const note = `δ¹⁸O=${delta18O}‰, δ²H=${deltaD}‰, d-excess=${Math.round(dExcess * 10) / 10}‰。` +
    `LMWL偏离=${Math.round(lmwlDeviation * 10) / 10}‰。` +
    `${evaporationEffect}。`;

  return {
    name: input.name,
    rechargeTemp: Math.round(rechargeTemp * 10) / 10,
    rechargeElevation: Math.round(rechargeElevation),
    dExcess: Math.round(dExcess * 10) / 10,
    evaporationEffect,
    waterRockInteraction,
    note,
  };
}

/**
 * 批量计算预设监测点
 */
export function calcAllPresetSites() {
  return PRESET_SITES.map(s => {
    const tritiumResult = calcTritiumAge({
      name: s.name, measuredTU: s.tritium, initialTU: 20, model: 'piston',
    });
    const c14Result = calcCarbon14Age({
      name: s.name, measuredPMC: s.c14, initialPMC: 100,
      delta13C: s.delta13C, rechargeDelta13C: -13, dilutionFactor: 0.15,
    });
    const he4Result = calcHelium4Age({
      name: s.name, measuredHe4: s.he4, atmosphericHe4: 4e-8, accumRate: HE4_ACCUM_RATE,
    });
    const tempResult = calcRechargeTemp({
      name: s.name, delta18O: s.delta18O, deltaD: s.deltaD,
      lmwlSlope: 7.8, lmwlIntercept: 9,
      d18OTempSlope: 0.3, elevationGradient: -0.25,
      referenceElevation: 50, referenceDelta18O: -8.0,
    });
    return { site: s, tritiumResult, c14Result, he4Result, tempResult };
  });
}

/**
 * 汇总统计
 */
export function calcIsotopeSummary() {
  const results = calcAllPresetSites();
  const modernCount = results.filter(r => r.tritiumResult.ageGrade === '现代水(<10a)').length;
  const paleoCount = results.filter(r => r.c14Result.ageGrade === '千年级' || r.c14Result.ageGrade === '万年级').length;
  const avgC14Age = results.reduce((s, r) => s + r.c14Result.recommendedAge, 0) / results.length;
  const avgRechargeTemp = results.reduce((s, r) => s + r.tempResult.rechargeTemp, 0) / results.length;
  const avgDExcess = results.reduce((s, r) => s + r.tempResult.dExcess, 0) / results.length;
  const maxAge = Math.max(...results.map(r => r.he4Result.estimatedAge));

  return {
    siteCount: results.length,
    modernCount,
    paleoCount,
    avgC14Age: Math.round(avgC14Age),
    avgRechargeTemp: Math.round(avgRechargeTemp * 10) / 10,
    avgDExcess: Math.round(avgDExcess * 10) / 10,
    maxAge,
  };
}
