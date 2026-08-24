/**
 * 土壤盐渍化计算 — 核心算法
 *  盐分分级 / 盐分类型 / 淋洗需水 / 改良年限 / 临界深度 / 综合评价 / 预设区批量 / 汇总
 */

import type { SalinizationInput, SaltGradeResult, SaltTypeResult, LeachingResult, ReclamationResult, CriticalDepthResult, SalinizationResult } from './soilSalinizationTypes';
import { SALT_GRADE_STANDARDS, PH_GRADE_STANDARDS, getTextureParam, PRESET_ZONES } from './soilSalinizationPresets';

export function evalSaltGrades(input: SalinizationInput): SaltGradeResult[] {
  const results: SaltGradeResult[] = [];

  // 全盐量分级
  const saltGrade = SALT_GRADE_STANDARDS.find(s => input.totalSalt <= s.saltMax) ?? SALT_GRADE_STANDARDS[SALT_GRADE_STANDARDS.length - 1];
  results.push({
    indicator: '全盐量',
    value: input.totalSalt,
    unit: 'g/kg',
    grade: saltGrade.grade,
    description: saltGrade.description,
    color: saltGrade.color,
  });

  // EC_e 分级
  const ecGrade = SALT_GRADE_STANDARDS.find(s => input.ecE <= s.ecMax) ?? SALT_GRADE_STANDARDS[SALT_GRADE_STANDARDS.length - 1];
  results.push({
    indicator: '电导率EC_e',
    value: input.ecE,
    unit: 'dS/m',
    grade: ecGrade.grade,
    description: ecGrade.description,
    color: ecGrade.color,
  });

  // pH 碱化分级
  const phGrade = PH_GRADE_STANDARDS.find(s => input.ph >= s.phMin && input.ph < s.phMax) ?? PH_GRADE_STANDARDS[PH_GRADE_STANDARDS.length - 1];
  results.push({
    indicator: 'pH碱化',
    value: input.ph,
    unit: '',
    grade: phGrade.grade,
    description: phGrade.description,
    color: phGrade.color,
  });

  return results;
}

/**
 * 综合盐渍化等级判定
 */

export function calcOverallGrade(grades: SaltGradeResult[]): string {
  const gradeOrder = ['无盐渍化', '轻度盐渍化', '中度盐渍化', '重度盐渍化', '极重度盐渍化'];
  const phOrder = ['非碱化', '轻度碱化', '中度碱化', '重度碱化'];

  let maxIdx = 0;
  for (const g of grades) {
    const saltIdx = gradeOrder.indexOf(g.grade);
    const phIdx = phOrder.indexOf(g.grade);
    const idx = Math.max(saltIdx >= 0 ? saltIdx : 0, phIdx >= 0 ? phIdx : 0);
    if (idx > maxIdx) maxIdx = idx;
  }
  // 综合等级取盐分和碱化的较高者
  if (maxIdx <= 0) return '无盐渍化';
  if (maxIdx === 1) return '轻度盐渍化';
  if (maxIdx === 2) return '中度盐渍化';
  if (maxIdx === 3) return '重度盐渍化';
  return '极重度盐渍化';
}

/**
 * 盐分类型判定（阴离子当量比法）
 */

export function evalSaltType(input: SalinizationInput): SaltTypeResult {
  const totalAnion = input.chloride + input.sulfate + input.bicarbonate + input.carbonate;
  const clSo4Ratio = input.sulfate > 0 ? input.chloride / input.sulfate : Infinity;
  const hco3Ratio = (input.chloride + input.sulfate) > 0 ? input.bicarbonate / (input.chloride + input.sulfate) : Infinity;

  // 钠吸附比 SAR = Na⁺ / sqrt((Ca²⁺ + Mg²⁺) / 2)
  const catSum = input.calcium + input.magnesium;
  const sar = catSum > 0 ? input.sodium / Math.sqrt(catSum / 2) : 0;

  // ESP 估算 (经验公式: ESP ≈ 100 × (-0.0126 + 0.01475 × SAR))
  const esp = Math.max(0, Math.min(100, Math.round(((-0.0126 + 0.01475 * sar) * 100) * 10) / 10));

  // 主要盐分类型判定
  let primaryType: string;
  let secondaryType: string;

  // 氯化物/硫酸盐型判定（Cl⁻/SO₄²⁻当量比）
  if (clSo4Ratio >= 4) {
    primaryType = '氯化物型';
    secondaryType = hco3Ratio > 1 ? '苏打-氯化物型' : '氯化物型';
  } else if (clSo4Ratio >= 1) {
    primaryType = '硫酸盐-氯化物型';
    secondaryType = hco3Ratio > 1 ? '苏打-硫酸盐-氯化物型' : '硫酸盐-氯化物型';
  } else if (clSo4Ratio >= 0.25) {
    primaryType = '氯化物-硫酸盐型';
    secondaryType = hco3Ratio > 1 ? '苏打-氯化物-硫酸盐型' : '氯化物-硫酸盐型';
  } else {
    primaryType = '硫酸盐型';
    secondaryType = hco3Ratio > 1 ? '苏打-硫酸盐型' : '硫酸盐型';
  }

  // 碱化修正
  if (input.ph >= 9.0 || hco3Ratio > 1) {
    primaryType = '苏打型';
    secondaryType = `pH=${input.ph.toFixed(1)}, HCO₃⁻/(Cl⁻+SO₄²⁻)=${hco3Ratio.toFixed(2)}`;
  }

  const note = `Cl⁻/SO₄²⁻=${clSo4Ratio.toFixed(2)}, SAR=${sar.toFixed(1)}, ESP≈${esp}%。`
    + ` 主要阴离子占比: Cl⁻${totalAnion > 0 ? Math.round(input.chloride / totalAnion * 100) : 0}%, `
    + `SO₄²⁻${totalAnion > 0 ? Math.round(input.sulfate / totalAnion * 100) : 0}%, `
    + `HCO₃⁻${totalAnion > 0 ? Math.round(input.bicarbonate / totalAnion * 100) : 0}%。`
    + (esp > 15 ? ' 碱化严重，需施用改良剂（石膏等）。' : esp > 5 ? ' 轻度碱化，注意监测。' : ' 无明显碱化。');

  return {
    primaryType,
    secondaryType,
    clSo4Ratio: Math.round(clSo4Ratio * 100) / 100,
    hco3Ratio: Math.round(hco3Ratio * 100) / 100,
    sar: Math.round(sar * 10) / 10,
    esp,
    note,
  };
}

/**
 * 淋洗需水量计算（FAO方法）
 * LR = EC_dw / (EC_e × 5)
 * 总灌水量 = ET / (1 - LR)
 * 淋洗需水量 = LR × 总灌水量
 */

export function calcLeaching(input: SalinizationInput): LeachingResult {
  const { ecE, irrigationEC: ecDw, cropThreshold: ecT } = input;

  // FAO 淋洗需水量比例
  const lr = ecDw > 0 && ecE > 0 ? ecDw / (ecE * 5) : 0;
  const lrClamped = Math.min(0.7, Math.max(0, lr));

  // 总灌水量系数（1/(1-LR)），假设净需水量为 600mm
  const netWater = 600; // mm/季
  const totalIrrigationFactor = lrClamped < 1 ? 1 / (1 - lrClamped) : 1;
  const totalIrrigation = netWater * totalIrrigationFactor; // mm
  const leachingVolume = Math.round(totalIrrigation * lrClamped * 10); // m³/ha (1mm = 10 m³/ha)

  // 排盐量估算: 排水中盐分 = 淋洗水量 × 排水EC × 0.64 (转换系数)
  const drainageEC = ecE * 5; // 排水EC ≈ 5 × EC_e (稳态)
  const saltRemoval = Math.round(leachingVolume * drainageEC * 0.064 * 10) / 10; // t/ha

  // 淋洗后预期 EC_e
  const projectedEC = ecT > 0 ? Math.max(0, ecT * 0.8) : ecE * 0.7;

  let suggestion: string;
  if (lrClamped < 0.1) {
    suggestion = '淋洗需水量低，常规灌溉即可维持盐分平衡。';
  } else if (lrClamped < 0.2) {
    suggestion = `淋洗需水量适中(LR=${(lrClamped * 100).toFixed(0)}%)，需在灌溉计划中增加${leachingVolume}m³/ha淋洗水量。`;
  } else if (lrClamped < 0.4) {
    suggestion = `淋洗需水量较高(LR=${(lrClamped * 100).toFixed(0)}%)，需配合排水系统，增加${leachingVolume}m³/ha淋洗水量。`;
  } else {
    suggestion = `淋洗需水量极高(LR=${(lrClamped * 100).toFixed(0)}%)，必须建设完善的排水系统，考虑种植耐盐作物过渡改良。`;
  }

  return {
    lr: Math.round(lrClamped * 1000) / 1000,
    totalIrrigationFactor: Math.round(totalIrrigationFactor * 100) / 100,
    leachingVolume,
    saltRemoval,
    projectedEC: Math.round(projectedEC * 100) / 100,
    suggestion,
  };
}

/**
 * 改良效果预测
 */

export function calcReclamation(input: SalinizationInput): ReclamationResult {
  const initialSalt = input.totalSalt;
  const targetSalt = 1.5; // 改良目标：降至轻度以下

  // 年脱盐率取决于质地和排水条件
  const texParam = getTextureParam(input.soilTexture);
  const baseRate = 0.15; // 基础年脱盐率15%
  const textureFactor = 1.5 / (texParam.capillaryRise); // 质地修正
  const gwFactor = input.gwDepth < 2 ? 0.5 : input.gwDepth < 3 ? 0.8 : 1.0; // 地下水埋深修正

  const annualRate = Math.min(0.5, baseRate * textureFactor * gwFactor);
  const annualDesalinationRate = Math.round(annualRate * 1000) / 10;

  // 改良年限计算（指数衰减模型）
  // S(t) = S0 × (1-r)^t → t = ln(target/S0) / ln(1-r)
  const ratio = targetSalt / initialSalt;
  let years: number;
  if (ratio >= 1) {
    years = 0;
  } else if (annualRate <= 0 || annualRate >= 1) {
    years = 99;
  } else {
    years = Math.ceil(Math.log(ratio) / Math.log(1 - annualRate));
  }
  years = Math.max(1, Math.min(20, years));

  // 年排盐量（假设耕作层0-40cm，容重1.4 g/cm³）
  const soilWeight = 0.4 * 10000 * 1.4; // t/ha (0.4m × 10000m² × 1.4t/m³)
  const annualSaltRemoval = Math.round(soilWeight * initialSalt * annualRate * 10) / 10; // t/ha
  const totalSaltRemoval = Math.round(soilWeight * (initialSalt - targetSalt) * 10) / 10;

  let difficulty: string;
  if (years <= 2) difficulty = '容易';
  else if (years <= 5) difficulty = '中等';
  else if (years <= 10) difficulty = '困难';
  else difficulty = '极困难';

  const suggestion = `预计${years}年可将全盐量从${initialSalt.toFixed(1)}g/kg降至${targetSalt.toFixed(1)}g/kg。`
    + ` 年均脱盐率${annualDesalinationRate}%，年排盐量${annualSaltRemoval}t/ha。`
    + (difficulty === '极困难' ? ' 建议采取工程+生物+化学综合改良措施。' : '');

  return {
    initialSalt,
    targetSalt,
    annualDesalinationRate,
    reclamationYears: years,
    annualSaltRemoval,
    totalSaltRemoval,
    difficulty,
    suggestion,
  };
}

/**
 * 地下水临界深度判断
 */

export function calcCriticalDepth(input: SalinizationInput): CriticalDepthResult {
  const texParam = getTextureParam(input.soilTexture);

  // 临界深度 = 毛细水强烈上升高度 + 安全超高
  const capillaryRise = texParam.capillaryRise;
  const criticalDepth = Math.round((capillaryRise + texParam.criticalExtra) * 100) / 100;
  const safeDepth = Math.round((criticalDepth + 0.5) * 100) / 100;

  const isSafe = input.gwDepth >= safeDepth;
  const inCritical = input.gwDepth >= criticalDepth && input.gwDepth < safeDepth;

  let riskLevel: string;
  let suggestion: string;

  if (isSafe) {
    riskLevel = '安全';
    suggestion = `地下水埋深${input.gwDepth}m ≥ 安全深度${safeDepth}m，盐渍化风险低。`;
  } else if (inCritical) {
    riskLevel = '临界';
    suggestion = `地下水埋深${input.gwDepth}m 处于临界区间[${criticalDepth}, ${safeDepth})m，需控制水位防止返盐。`;
  } else {
    riskLevel = '危险';
    suggestion = `地下水埋深${input.gwDepth}m < 临界深度${criticalDepth}m，毛细水可到达地表，盐渍化风险高，需排水降低水位。`;
  }

  return {
    gwDepth: input.gwDepth,
    criticalDepth,
    safeDepth,
    capillaryRise,
    isSafe,
    riskLevel,
    suggestion,
  };
}

/**
 * 综合评价
 */

export function calcSalinizationEvaluation(input: SalinizationInput): SalinizationResult {
  const saltGrades = evalSaltGrades(input);
  const overallGrade = calcOverallGrade(saltGrades);
  const saltType = evalSaltType(input);
  const leaching = calcLeaching(input);
  const reclamation = calcReclamation(input);
  const criticalDepth = calcCriticalDepth(input);

  const conclusion = `${input.name}综合评价：${overallGrade}，${saltType.primaryType}。`
    + ` 全盐量${input.totalSalt}g/kg，EC_e=${input.ecE}dS/m，pH=${input.ph}。`
    + ` 淋洗需水量比例LR=${(leaching.lr * 100).toFixed(0)}%，每公顷需淋洗${leaching.leachingVolume}m³。`
    + ` 改良难度${reclamation.difficulty}，预计${reclamation.reclamationYears}年。`
    + ` 地下水风险等级：${criticalDepth.riskLevel}。`;

  return {
    name: input.name,
    saltGrades,
    overallGrade,
    saltType,
    leaching,
    reclamation,
    criticalDepth,
    conclusion,
  };
}

/**
 * 批量计算预设分区
 */

export function calcAllPresetZones(): SalinizationResult[] {
  return PRESET_ZONES.map(z => calcSalinizationEvaluation(z));
}

/**
 * 汇总统计
 */

export function calcSalinizationSummary() {
  const results = calcAllPresetZones();
  const gradeCounts: Record<string, number> = {};
  results.forEach(r => {
    gradeCounts[r.overallGrade] = (gradeCounts[r.overallGrade] || 0) + 1;
  });

  const typeCounts: Record<string, number> = {};
  results.forEach(r => {
    typeCounts[r.saltType.primaryType] = (typeCounts[r.saltType.primaryType] || 0) + 1;
  });

  const avgSalt = PRESET_ZONES.reduce((s, z) => s + z.totalSalt, 0) / PRESET_ZONES.length;
  const avgEC = PRESET_ZONES.reduce((s, z) => s + z.ecE, 0) / PRESET_ZONES.length;
  const avgpH = PRESET_ZONES.reduce((s, z) => s + z.ph, 0) / PRESET_ZONES.length;
  const maxSalt = Math.max(...PRESET_ZONES.map(z => z.totalSalt));
  const avgLR = results.reduce((s, r) => s + r.leaching.lr, 0) / results.length;
  const avgYears = results.reduce((s, r) => s + r.reclamation.reclamationYears, 0) / results.length;

  return {
    zoneCount: PRESET_ZONES.length,
    gradeCounts,
    typeCounts,
    avgSalt: Math.round(avgSalt * 100) / 100,
    avgEC: Math.round(avgEC * 100) / 100,
    avgpH: Math.round(avgpH * 100) / 100,
    maxSalt,
    avgLR: Math.round(avgLR * 1000) / 1000,
    avgYears: Math.round(avgYears * 10) / 10,
    results,
  };
}

