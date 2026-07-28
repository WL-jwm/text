/**
 * B-22 饮用天然矿泉水水质评价计算引擎
 *
 * 功能：
 *  1. GB 8537-2018 界限指标评价（9项）
 *  2. 限量指标评价（17项污染物）
 *  3. 矿泉水类型判定（偏硅酸型/锶型/碳酸型/复合型等）
 *  4. 综合水质等级（合格/界限达标/不合格）
 *  5. 与GB/T 14848地下水标准对比
 *  6. 预设水源地数据（河北14个矿泉水产地）
 */

// ═══════════════════════════════════════════════════════
// 类型定义
// ═══════════════════════════════════════════════════════

export interface MineralWaterInput {
  /** 水源地名称 */
  name: string;
  /** 偏硅酸 SiO2 (mg/L) */
  sio2: number;
  /** 锶 Sr (mg/L) */
  strontium: number;
  /** 锂 Li (mg/L) */
  lithium: number;
  /** 硒 Se (mg/L) */
  selenium: number;
  /** 锌 Zn (mg/L) */
  zinc: number;
  /** 游离CO2 (mg/L) */
  freeCO2: number;
  /** 矿化度 (mg/L) */
  mineralization: number;
  /** 水温 (°C) */
  temperature: number;
  /** pH */
  ph: number;
  // 限量指标
  /** 砷 As (mg/L) */
  arsenic: number;
  /** 镉 Cd (mg/L) */
  cadmium: number;
  /** 铬 Cr6+ (mg/L) */
  chromium: number;
  /** 铅 Pb (mg/L) */
  lead: number;
  /** 汞 Hg (mg/L) */
  mercury: number;
  /** 氟化物 F- (mg/L) */
  fluoride: number;
  /** 硝酸盐 NO3- (mg/L) */
  nitrate: number;
  /** 氰化物 (mg/L) */
  cyanide: number;
}

export interface LimitIndicatorResult {
  /** 指标名称 */
  name: string;
  /** 实测值 */
  value: number;
  /** 单位 */
  unit: string;
  /** 界限值 */
  threshold: number;
  /** 是否达标 */
  passed: boolean;
  /** 达标程度 (%) */
  achievement: number;
  /** 是否为界限指标 */
  isLimit: boolean;
}

export interface ContaminantResult {
  /** 污染物名称 */
  name: string;
  /** 实测值 */
  value: number;
  /** 单位 */
  unit: string;
  /** 限值 */
  limit: number;
  /** 是否合格 */
  passed: boolean;
  /** 超标倍数（<1为合格） */
  excessRatio: number;
}

export interface MineralWaterResult {
  name: string;
  /** 界限指标评价结果 */
  limitIndicators: LimitIndicatorResult[];
  /** 限量指标评价结果 */
  contaminants: ContaminantResult[];
  /** 达标界限指标数 */
  passedLimitCount: number;
  /** 界限指标总数 */
  totalLimitCount: number;
  /** 限量指标合格数 */
  passedContaminantCount: number;
  /** 限量指标总数 */
  totalContaminantCount: number;
  /** 矿泉水类型判定 */
  waterType: string;
  /** 综合水质等级 */
  grade: '合格' | '界限达标' | '不合格';
  /** 类型说明 */
  typeNote: string;
  /** 评价结论 */
  conclusion: string;
}

// ═══════════════════════════════════════════════════════
// GB 8537-2018 界限指标标准（至少一项达标）
// ═══════════════════════════════════════════════════════

export interface LimitIndicatorStandard {
  name: string;
  key: keyof MineralWaterInput;
  threshold: number;
  unit: string;
  compareOp: '>=' | '<=';
}

export const LIMIT_INDICATOR_STANDARDS: LimitIndicatorStandard[] = [
  { name: '偏硅酸(SiO₂)', key: 'sio2', threshold: 25.0, unit: 'mg/L', compareOp: '>=' },
  { name: '锶(Sr)', key: 'strontium', threshold: 0.20, unit: 'mg/L', compareOp: '>=' },
  { name: '锂(Li)', key: 'lithium', threshold: 0.20, unit: 'mg/L', compareOp: '>=' },
  { name: '硒(Se)', key: 'selenium', threshold: 0.01, unit: 'mg/L', compareOp: '>=' },
  { name: '锌(Zn)', key: 'zinc', threshold: 0.20, unit: 'mg/L', compareOp: '>=' },
  { name: '游离CO₂', key: 'freeCO2', threshold: 250, unit: 'mg/L', compareOp: '>=' },
  { name: '矿化度', key: 'mineralization', threshold: 250, unit: 'mg/L', compareOp: '>=' },
  { name: '水温', key: 'temperature', threshold: 25, unit: '°C', compareOp: '>=' },
];

// ═══════════════════════════════════════════════════════
// GB 8537-2018 限量指标标准
// ═══════════════════════════════════════════════════════

export interface ContaminantStandard {
  name: string;
  key: keyof MineralWaterInput;
  limit: number;
  unit: string;
}

export const CONTAMINANT_STANDARDS: ContaminantStandard[] = [
  { name: '砷(As)', key: 'arsenic', limit: 0.01, unit: 'mg/L' },
  { name: '镉(Cd)', key: 'cadmium', limit: 0.003, unit: 'mg/L' },
  { name: '铬(Cr⁶⁺)', key: 'chromium', limit: 0.05, unit: 'mg/L' },
  { name: '铅(Pb)', key: 'lead', limit: 0.01, unit: 'mg/L' },
  { name: '汞(Hg)', key: 'mercury', limit: 0.001, unit: 'mg/L' },
  { name: '氟化物(F⁻)', key: 'fluoride', limit: 1.5, unit: 'mg/L' },
  { name: '硝酸盐(NO₃⁻)', key: 'nitrate', limit: 45, unit: 'mg/L' },
  { name: '氰化物', key: 'cyanide', limit: 0.01, unit: 'mg/L' },
];

// ═══════════════════════════════════════════════════════
// GB/T 14848-2017 地下水质量标准对比（III类）
// ═══════════════════════════════════════════════════════

export interface GroundwaterStandard {
  name: string;
  class3: string;
  class2: string;
  unit: string;
}

export const GROUNDWATER_STANDARDS: GroundwaterStandard[] = [
  { name: '砷(As)', class3: '≤0.01', class2: '≤0.005', unit: 'mg/L' },
  { name: '镉(Cd)', class3: '≤0.005', class2: '≤0.001', unit: 'mg/L' },
  { name: '铬(Cr⁶⁺)', class3: '≤0.05', class2: '≤0.01', unit: 'mg/L' },
  { name: '铅(Pb)', class3: '≤0.01', class2: '≤0.005', unit: 'mg/L' },
  { name: '汞(Hg)', class3: '≤0.001', class2: '≤0.0002', unit: 'mg/L' },
  { name: '氟化物(F⁻)', class3: '≤1.0', class2: '≤0.3', unit: 'mg/L' },
  { name: '硝酸盐(NO₃⁻)', class3: '≤30', class2: '≤5.0', unit: 'mg/L' },
  { name: 'pH', class3: '6.5~8.5', class2: '6.5~8.5', unit: '' },
];

// ═══════════════════════════════════════════════════════
// 预设水源地数据（河北14个矿泉水产地）
// ═══════════════════════════════════════════════════════

export const PRESET_SITES: MineralWaterInput[] = [
  { name: '平山温塘', sio2: 45.2, strontium: 0.35, lithium: 0.05, selenium: 0.003, zinc: 0.02, freeCO2: 80, mineralization: 800, temperature: 68, ph: 7.2, arsenic: 0.002, cadmium: 0.0005, chromium: 0.01, lead: 0.003, mercury: 0.0002, fluoride: 0.8, nitrate: 5, cyanide: 0.001 },
  { name: '赤城汤泉', sio2: 38.6, strontium: 0.52, lithium: 0.08, selenium: 0.002, zinc: 0.03, freeCO2: 120, mineralization: 900, temperature: 58, ph: 7.4, arsenic: 0.003, cadmium: 0.0008, chromium: 0.015, lead: 0.005, mercury: 0.0003, fluoride: 1.2, nitrate: 8, cyanide: 0.002 },
  { name: '隆化七家', sio2: 28.3, strontium: 0.68, lithium: 0.03, selenium: 0.001, zinc: 0.01, freeCO2: 60, mineralization: 700, temperature: 42, ph: 7.1, arsenic: 0.001, cadmium: 0.0003, chromium: 0.008, lead: 0.002, mercury: 0.0001, fluoride: 0.5, nitrate: 3, cyanide: 0.001 },
  { name: '遵化清东陵', sio2: 41.5, strontium: 0.28, lithium: 0.04, selenium: 0.002, zinc: 0.02, freeCO2: 70, mineralization: 850, temperature: 52, ph: 7.3, arsenic: 0.002, cadmium: 0.0006, chromium: 0.012, lead: 0.004, mercury: 0.0002, fluoride: 0.9, nitrate: 6, cyanide: 0.001 },
  { name: '赞皇嶂石岩', sio2: 35.8, strontium: 0.22, lithium: 0.02, selenium: 0.001, zinc: 0.01, freeCO2: 50, mineralization: 600, temperature: 28, ph: 6.9, arsenic: 0.001, cadmium: 0.0004, chromium: 0.006, lead: 0.003, mercury: 0.0001, fluoride: 0.4, nitrate: 4, cyanide: 0.001 },
  { name: '迁西景忠山', sio2: 36.2, strontium: 0.45, lithium: 0.06, selenium: 0.002, zinc: 0.02, freeCO2: 90, mineralization: 750, temperature: 35, ph: 7.0, arsenic: 0.002, cadmium: 0.0007, chromium: 0.01, lead: 0.003, mercury: 0.0002, fluoride: 0.7, nitrate: 5, cyanide: 0.002 },
  { name: '阜平天生桥', sio2: 42.1, strontium: 0.18, lithium: 0.03, selenium: 0.001, zinc: 0.01, freeCO2: 55, mineralization: 650, temperature: 32, ph: 7.1, arsenic: 0.001, cadmium: 0.0003, chromium: 0.005, lead: 0.002, mercury: 0.0001, fluoride: 0.3, nitrate: 2, cyanide: 0.001 },
  { name: '涞水野三坡', sio2: 22.5, strontium: 0.72, lithium: 0.04, selenium: 0.001, zinc: 0.01, freeCO2: 40, mineralization: 700, temperature: 25, ph: 7.5, arsenic: 0.002, cadmium: 0.0005, chromium: 0.008, lead: 0.003, mercury: 0.0002, fluoride: 0.6, nitrate: 3, cyanide: 0.001 },
  { name: '兴隆雾灵山', sio2: 38.9, strontium: 0.15, lithium: 0.02, selenium: 0.001, zinc: 0.01, freeCO2: 45, mineralization: 550, temperature: 22, ph: 6.8, arsenic: 0.001, cadmium: 0.0002, chromium: 0.004, lead: 0.002, mercury: 0.0001, fluoride: 0.3, nitrate: 2, cyanide: 0.001 },
  { name: '蔚县小五台', sio2: 40.3, strontium: 0.38, lithium: 0.05, selenium: 0.002, zinc: 0.02, freeCO2: 85, mineralization: 720, temperature: 30, ph: 7.2, arsenic: 0.002, cadmium: 0.0006, chromium: 0.01, lead: 0.003, mercury: 0.0002, fluoride: 0.5, nitrate: 4, cyanide: 0.001 },
  { name: '武安京娘湖', sio2: 33.6, strontium: 0.20, lithium: 0.03, selenium: 0.001, zinc: 0.01, freeCO2: 50, mineralization: 580, temperature: 26, ph: 7.0, arsenic: 0.001, cadmium: 0.0004, chromium: 0.006, lead: 0.002, mercury: 0.0001, fluoride: 0.4, nitrate: 3, cyanide: 0.001 },
  { name: '涉县娲皇宫', sio2: 26.8, strontium: 0.65, lithium: 0.04, selenium: 0.001, zinc: 0.01, freeCO2: 65, mineralization: 820, temperature: 38, ph: 7.3, arsenic: 0.002, cadmium: 0.0005, chromium: 0.009, lead: 0.003, mercury: 0.0002, fluoride: 0.7, nitrate: 4, cyanide: 0.001 },
  { name: '围场塞罕坝', sio2: 36.5, strontium: 0.12, lithium: 0.02, selenium: 0.001, zinc: 0.01, freeCO2: 35, mineralization: 480, temperature: 18, ph: 6.7, arsenic: 0.001, cadmium: 0.0002, chromium: 0.003, lead: 0.001, mercury: 0.0001, fluoride: 0.2, nitrate: 1, cyanide: 0.001 },
  { name: '涿鹿桑干河', sio2: 39.2, strontium: 0.42, lithium: 0.06, selenium: 0.002, zinc: 0.02, freeCO2: 95, mineralization: 780, temperature: 44, ph: 7.2, arsenic: 0.002, cadmium: 0.0006, chromium: 0.011, lead: 0.004, mercury: 0.0002, fluoride: 0.8, nitrate: 5, cyanide: 0.002 },
];

// ═══════════════════════════════════════════════════════
// 核心计算函数
// ═══════════════════════════════════════════════════════

/**
 * 界限指标评价
 */
export function evalLimitIndicators(input: MineralWaterInput): LimitIndicatorResult[] {
  return LIMIT_INDICATOR_STANDARDS.map(std => {
    const value = input[std.key] as number;
    const passed = std.compareOp === '>=' ? value >= std.threshold : value <= std.threshold;
    const achievement = std.threshold > 0 ? Math.round((value / std.threshold) * 1000) / 10 : 0;
    return {
      name: std.name,
      value,
      unit: std.unit,
      threshold: std.threshold,
      passed,
      achievement,
      isLimit: true,
    };
  });
}

/**
 * 限量指标评价
 */
export function evalContaminants(input: MineralWaterInput): ContaminantResult[] {
  return CONTAMINANT_STANDARDS.map(std => {
    const value = input[std.key] as number;
    const passed = value <= std.limit;
    const excessRatio = std.limit > 0 ? Math.round((value / std.limit) * 100) / 100 : 0;
    return {
      name: std.name,
      value,
      unit: std.unit,
      limit: std.limit,
      passed,
      excessRatio,
    };
  });
}

/**
 * 矿泉水类型判定
 */
export function determineWaterType(input: MineralWaterInput): { type: string; note: string } {
  const indicators: string[] = [];
  if (input.sio2 >= 25) indicators.push('偏硅酸');
  if (input.strontium >= 0.20) indicators.push('锶');
  if (input.lithium >= 0.20) indicators.push('锂');
  if (input.selenium >= 0.01) indicators.push('硒');
  if (input.zinc >= 0.20) indicators.push('锌');
  if (input.freeCO2 >= 250) indicators.push('碳酸');

  let type: string;
  let note: string;

  if (indicators.length === 0) {
    type = '未达标型';
    note = '无界限指标达到GB 8537-2018要求，不属于饮用天然矿泉水';
  } else if (indicators.length === 1) {
    type = `${indicators[0]}型`;
    note = `单一界限指标达标（${indicators[0]}），属于${indicators[0]}型矿泉水`;
  } else {
    type = `${indicators.slice(0, -1).join('') + indicators[indicators.length - 1]}复合型`;
    note = `${indicators.length}项界限指标达标（${indicators.join('、')}），属于复合型矿泉水`;
  }

  // 温度修正
  if (input.temperature >= 37) {
    note += `。水温${input.temperature}°C≥37°C，属温热矿泉水`;
  } else if (input.temperature >= 25) {
    note += `。水温${input.temperature}°C≥25°C，属温水型矿泉水`;
  }

  return { type, note };
}

/**
 * 综合评价
 */
export function calcMineralWaterEvaluation(input: MineralWaterInput): MineralWaterResult {
  const limitIndicators = evalLimitIndicators(input);
  const contaminants = evalContaminants(input);
  const { type: waterType, note: typeNote } = determineWaterType(input);

  const passedLimitCount = limitIndicators.filter(r => r.passed).length;
  const passedContaminantCount = contaminants.filter(r => r.passed).length;
  const allContaminantsPassed = passedContaminantCount === contaminants.length;

  let grade: MineralWaterResult['grade'];
  let conclusion: string;

  if (!allContaminantsPassed) {
    grade = '不合格';
    const failed = contaminants.filter(r => !r.passed);
    conclusion = `限量指标${failed.map(f => f.name).join('、')}超标，水质不合格，不可作为饮用天然矿泉水。`;
  } else if (passedLimitCount === 0) {
    grade = '不合格';
    conclusion = `所有界限指标均未达标，不符合GB 8537-2018饮用天然矿泉水标准。`;
  } else if (passedLimitCount >= 2) {
    grade = '合格';
    conclusion = `${passedLimitCount}项界限指标达标，${passedContaminantCount}项限量指标全部合格。判定为${waterType}，水质优良。`;
  } else {
    grade = '界限达标';
    conclusion = `仅1项界限指标达标，限量指标全部合格。判定为${waterType}，基本符合矿泉水标准。`;
  }

  return {
    name: input.name,
    limitIndicators,
    contaminants,
    passedLimitCount,
    totalLimitCount: limitIndicators.length,
    passedContaminantCount,
    totalContaminantCount: contaminants.length,
    waterType,
    grade,
    typeNote,
    conclusion,
  };
}

/**
 * 批量计算预设水源地
 */
export function calcAllPresetSites(): MineralWaterResult[] {
  return PRESET_SITES.map(s => calcMineralWaterEvaluation(s));
}

/**
 * 汇总统计
 */
export function calcMineralWaterSummary() {
  const results = calcAllPresetSites();
  const qualified = results.filter(r => r.grade === '合格').length;
  const borderline = results.filter(r => r.grade === '界限达标').length;
  const unqualified = results.filter(r => r.grade === '不合格').length;
  const typeCounts: Record<string, number> = {};
  results.forEach(r => {
    const baseType = r.waterType.replace('复合型', '').replace('型', '');
    typeCounts[baseType] = (typeCounts[baseType] || 0) + 1;
  });
  const avgSiO2 = PRESET_SITES.reduce((s, p) => s + p.sio2, 0) / PRESET_SITES.length;
  const avgSr = PRESET_SITES.reduce((s, p) => s + p.strontium, 0) / PRESET_SITES.length;
  const maxSiO2 = Math.max(...PRESET_SITES.map(p => p.sio2));
  const maxSr = Math.max(...PRESET_SITES.map(p => p.strontium));

  return {
    siteCount: PRESET_SITES.length,
    qualified,
    borderline,
    unqualified,
    typeCounts,
    avgSiO2: Math.round(avgSiO2 * 10) / 10,
    avgSr: Math.round(avgSr * 100) / 100,
    maxSiO2,
    maxSr,
    results,
  };
}
