/**
 * B-23 土壤盐渍化评价计算引擎
 *
 * 功能：
 *  1. 盐分分级评价（全盐量/电导率EC/pH三指标，5级分类）
 *  2. 盐分类型判定（氯化物/硫酸盐/碳酸盐/混合型，按阴离子当量比）
 *  3. 淋洗需水量计算（FAO方法 LR = EC_dw / (EC_e × 5)）
 *  4. 改良效果预测（脱盐率/排盐量/改良年限）
 *  5. 地下水临界深度判断
 *  6. 预设数据：河北平原8个盐渍化分区土壤参数
 */

// ═══════════════════════════════════════════════════════
// 类型定义
// ═══════════════════════════════════════════════════════

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

export const SALT_GRADE_STANDARDS: SaltGradeStandard[] = [
  { grade: '无盐渍化', description: '土壤无盐渍化，作物生长正常', color: 'emerald', saltMax: 1.0, ecMax: 2.0 },
  { grade: '轻度盐渍化', description: '轻微影响作物生长，耐盐作物可正常生长', color: 'cyan', saltMax: 2.0, ecMax: 4.0 },
  { grade: '中度盐渍化', description: '明显影响作物生长，需选耐盐品种', color: 'amber', saltMax: 4.0, ecMax: 8.0 },
  { grade: '重度盐渍化', description: '严重影响作物生长，仅耐盐植物可存活', color: 'orange', saltMax: 6.0, ecMax: 16.0 },
  { grade: '极重度盐渍化', description: '盐荒地或盐结壳，基本无作物生长', color: 'red', saltMax: Infinity, ecMax: Infinity },
];

// pH 碱化分级
export interface pHGradeStandard {
  grade: string;
  description: string;
  color: string;
  phMin: number;
  phMax: number;
}

export const PH_GRADE_STANDARDS: pHGradeStandard[] = [
  { grade: '非碱化', description: 'pH正常，无碱化问题', color: 'emerald', phMin: 0, phMax: 8.5 },
  { grade: '轻度碱化', description: 'pH略偏高，轻微碱化', color: 'amber', phMin: 8.5, phMax: 9.0 },
  { grade: '中度碱化', description: 'pH偏高，明显碱化，影响养分吸收', color: 'orange', phMin: 9.0, phMax: 9.5 },
  { grade: '重度碱化', description: 'pH过高，严重碱化，需改良', color: 'red', phMin: 9.5, phMax: Infinity },
];

// ═══════════════════════════════════════════════════════
// 土壤质地毛细参数
// ═══════════════════════════════════════════════════════

export interface TextureCapillaryParam {
  texture: string;
  /** 毛细水强烈上升高度 (m) */
  capillaryRise: number;
  /** 临界深度附加系数 (m) */
  criticalExtra: number;
  /** 渗透系数建议 (m/d) */
  permeability: number;
}

export const TEXTURE_PARAMS: TextureCapillaryParam[] = [
  { texture: '砂土', capillaryRise: 1.0, criticalExtra: 0.3, permeability: 1.5 },
  { texture: '砂壤', capillaryRise: 1.5, criticalExtra: 0.5, permeability: 0.8 },
  { texture: '轻壤', capillaryRise: 2.0, criticalExtra: 0.7, permeability: 0.5 },
  { texture: '中壤', capillaryRise: 2.5, criticalExtra: 0.8, permeability: 0.3 },
  { texture: '重壤', capillaryRise: 3.0, criticalExtra: 1.0, permeability: 0.15 },
  { texture: '黏土', capillaryRise: 3.5, criticalExtra: 1.2, permeability: 0.08 },
];

function getTextureParam(texture: string): TextureCapillaryParam {
  const found = TEXTURE_PARAMS.find(t => t.texture === texture);
  return found ?? TEXTURE_PARAMS[3]; // 默认中壤
}

// ═══════════════════════════════════════════════════════
// 预设数据：河北平原8个盐渍化分区
// ═══════════════════════════════════════════════════════

export const PRESET_ZONES: SalinizationInput[] = [
  {
    name: '沧州滨海区', totalSalt: 5.2, ecE: 14.5, ph: 8.2,
    chloride: 6.8, sulfate: 3.2, bicarbonate: 0.5, carbonate: 0,
    sodium: 7.5, calcium: 1.8, magnesium: 1.2,
    gwMineralization: 8.5, gwDepth: 1.2, soilTexture: '中壤',
    irrigationEC: 1.2, cropThreshold: 4.0,
  },
  {
    name: '唐山南部区', totalSalt: 3.8, ecE: 10.2, ph: 8.4,
    chloride: 4.5, sulfate: 2.8, bicarbonate: 0.6, carbonate: 0,
    sodium: 5.2, calcium: 1.5, magnesium: 1.0,
    gwMineralization: 5.2, gwDepth: 1.8, soilTexture: '轻壤',
    irrigationEC: 0.8, cropThreshold: 4.0,
  },
  {
    name: '衡水西北区', totalSalt: 2.5, ecE: 6.8, ph: 8.6,
    chloride: 2.0, sulfate: 3.5, bicarbonate: 0.8, carbonate: 0,
    sodium: 3.8, calcium: 1.2, magnesium: 1.3,
    gwMineralization: 3.2, gwDepth: 2.5, soilTexture: '中壤',
    irrigationEC: 1.0, cropThreshold: 4.0,
  },
  {
    name: '邢台东部区', totalSalt: 1.8, ecE: 4.5, ph: 8.5,
    chloride: 1.2, sulfate: 2.5, bicarbonate: 0.9, carbonate: 0,
    sodium: 2.5, calcium: 1.0, magnesium: 1.1,
    gwMineralization: 2.5, gwDepth: 3.0, soilTexture: '轻壤',
    irrigationEC: 0.7, cropThreshold: 4.0,
  },
  {
    name: '邯郸东部区', totalSalt: 1.5, ecE: 3.8, ph: 8.7,
    chloride: 0.8, sulfate: 2.2, bicarbonate: 1.0, carbonate: 0.1,
    sodium: 2.0, calcium: 0.9, magnesium: 1.2,
    gwMineralization: 2.0, gwDepth: 3.5, soilTexture: '砂壤',
    irrigationEC: 0.6, cropThreshold: 4.0,
  },
  {
    name: '廊坊南部区', totalSalt: 2.2, ecE: 5.5, ph: 8.3,
    chloride: 1.8, sulfate: 2.8, bicarbonate: 0.7, carbonate: 0,
    sodium: 3.2, calcium: 1.1, magnesium: 1.0,
    gwMineralization: 2.8, gwDepth: 2.8, soilTexture: '中壤',
    irrigationEC: 0.9, cropThreshold: 4.0,
  },
  {
    name: '保定东部区', totalSalt: 1.2, ecE: 3.2, ph: 8.4,
    chloride: 0.6, sulfate: 1.8, bicarbonate: 0.8, carbonate: 0,
    sodium: 1.5, calcium: 0.8, magnesium: 0.9,
    gwMineralization: 1.8, gwDepth: 4.0, soilTexture: '砂壤',
    irrigationEC: 0.5, cropThreshold: 4.0,
  },
  {
    name: '沧州内陆区', totalSalt: 3.5, ecE: 9.0, ph: 8.5,
    chloride: 3.8, sulfate: 3.0, bicarbonate: 0.6, carbonate: 0,
    sodium: 4.5, calcium: 1.4, magnesium: 1.5,
    gwMineralization: 4.5, gwDepth: 1.5, soilTexture: '重壤',
    irrigationEC: 1.1, cropThreshold: 4.0,
  },
];

// ═══════════════════════════════════════════════════════
// 核心计算函数
// ═══════════════════════════════════════════════════════

/**
 * 盐分分级评价
 */
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
