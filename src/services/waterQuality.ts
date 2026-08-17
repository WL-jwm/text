/**
 * H-05 水质综合评价引擎
 * 基于 GB/T 14848-2017 水质分类 + 苏卡列夫分类 + 超标因子分析
 */

// ============ 数据模型 ============

/** 水质评价指标 */
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
export const INDICATOR_META: Record<WaterQualityIndicator, { label: string; unit: string; order: number }> = {
  pH: { label: 'pH', unit: '', order: 1 },
  TDS: { label: '溶解性总固体', unit: 'mg/L', order: 2 },
  totalHardness: { label: '总硬度(CaCO₃)', unit: 'mg/L', order: 3 },
  Cl: { label: '氯化物', unit: 'mg/L', order: 4 },
  SO4: { label: '硫酸盐', unit: 'mg/L', order: 5 },
  NO3: { label: '硝酸盐(以N计)', unit: 'mg/L', order: 6 },
  NO2: { label: '亚硝酸盐(以N计)', unit: 'mg/L', order: 7 },
  NH4: { label: '氨氮', unit: 'mg/L', order: 8 },
  F: { label: '氟化物', unit: 'mg/L', order: 9 },
  Fe: { label: '铁', unit: 'mg/L', order: 10 },
  Mn: { label: '锰', unit: 'mg/L', order: 11 },
  As: { label: '砷', unit: 'mg/L', order: 12 },
  Cr6: { label: '六价铬', unit: 'mg/L', order: 13 },
  Pb: { label: '铅', unit: 'mg/L', order: 14 },
  Cd: { label: '镉', unit: 'mg/L', order: 15 },
  Hg: { label: '汞', unit: 'mg/L', order: 16 },
  COD: { label: '耗氧量(CODₘₙ)', unit: 'mg/L', order: 17 },
  DO: { label: '溶解氧', unit: 'mg/L', order: 18 },
  totalBacteria: { label: '总大肠菌群', unit: 'CFU/100mL', order: 19 },
};

/**
 * GB/T 14848-2017 各项指标分类限值
 * 每项为 [Ⅰ类, Ⅱ类, Ⅲ类, Ⅳ类, Ⅴ类] 上限值
 * 特别说明: pH 为范围型，其他为上限型
 * 对于上限型：≤ 该值即为该类别
 * 对于范围型：在范围内即为该类别
 */
export const GB_T14848_2017_LIMITS: Record<WaterQualityIndicator, [number, number, number, number, number]> = {
  pH: [8.5, 8.5, 8.5, 9.0, 14.0],           // pH 用下限 6.5/6.5/6.5/5.5/— 单独处理
  TDS: [300, 500, 1000, 2000, 99999],
  totalHardness: [150, 300, 450, 650, 99999],
  Cl: [50, 150, 250, 350, 99999],
  SO4: [50, 150, 250, 350, 99999],
  NO3: [2.0, 5.0, 20.0, 30.0, 99999],
  NO2: [0.01, 0.10, 1.00, 4.80, 99999],
  NH4: [0.02, 0.10, 0.50, 1.50, 99999],
  F: [0.5, 1.0, 1.0, 2.0, 99999],
  Fe: [0.1, 0.2, 0.3, 2.0, 99999],
  Mn: [0.05, 0.05, 0.10, 1.50, 99999],
  As: [0.001, 0.001, 0.01, 0.05, 99999],
  Cr6: [0.005, 0.01, 0.05, 0.10, 99999],
  Pb: [0.005, 0.005, 0.01, 0.10, 99999],
  Cd: [0.0001, 0.001, 0.005, 0.01, 99999],
  Hg: [0.00005, 0.0001, 0.001, 0.002, 99999],
  COD: [1.0, 2.0, 3.0, 10.0, 99999],
  DO: [7.5, 6.0, 4.0, 3.0, 0],              // DO 为下限型，≥ 该值
  totalBacteria: [50, 100, 100, 1000, 99999],
};

/** 水质类别描述 */
export const WATER_CLASS_LABELS: Record<WaterQualityClass, { label: string; description: string; color: string }> = {
  1: { label: 'Ⅰ类', description: '优良', color: '#06b6d4' },
  2: { label: 'Ⅱ类', description: '良好', color: '#10b981' },
  3: { label: 'Ⅲ类', description: '较好', color: '#f59e0b' },
  4: { label: 'Ⅳ类', description: '较差', color: '#f97316' },
  5: { label: 'Ⅴ类', description: '极差', color: '#ef4444' },
};

// ============ 核心评价引擎 ============

/**
 * 单项指标评价（GB/T 14848-2017）
 * 纯函数，可测试
 */
export function evaluateSingleIndicator(
  indicator: WaterQualityIndicator,
  value: number,
): SingleIndicatorResult {
  const meta = INDICATOR_META[indicator];
  const limits = GB_T14848_2017_LIMITS[indicator];
  const class3Limit = limits[2];

  let wqClass: WaterQualityClass;

  if (indicator === 'pH') {
    // pH 特殊处理：范围型
    // pH 为范围型指标：6.5-8.5 属良好（Ⅰ类），边缘范围 5.5-6.5 或 8.5-9.0 属Ⅳ类，其余Ⅴ类
    if (value >= 6.5 && value <= 8.5) wqClass = 1;
    else if ((value >= 5.5 && value < 6.5) || (value > 8.5 && value <= 9.0)) wqClass = 4;
    else wqClass = 5;
  } else if (indicator === 'DO') {
    // DO 为下限型
    if (value >= limits[0]) wqClass = 1;
    else if (value >= limits[1]) wqClass = 2;
    else if (value >= limits[2]) wqClass = 3;
    else if (value >= limits[3]) wqClass = 4;
    else wqClass = 5;
  } else {
    // 上限型：≤ 该值即为该类别
    if (value <= limits[0]) wqClass = 1;
    else if (value <= limits[1]) wqClass = 2;
    else if (value <= limits[2]) wqClass = 3;
    else if (value <= limits[3]) wqClass = 4;
    else wqClass = 5;
  }

  const isExceeded = wqClass >= 4;
  const exceedRatio = isExceeded && class3Limit > 0
    ? parseFloat((value / class3Limit).toFixed(2))
    : 0;

  return {
    indicator,
    label: meta.label,
    value,
    unit: meta.unit,
    class: wqClass,
    isExceeded,
    exceedRatio,
    class3Limit,
  };
}

/**
 * 综合评价（取最差单项）
 * 纯函数，可测试
 */
export function comprehensiveAssessment(
  stationId: string,
  stationName: string,
  city: string,
  indicatorValues: Partial<Record<WaterQualityIndicator, number>>,
  sulin?: SulinClassification,
  anionEq?: Record<string, number>,
  cationEq?: Record<string, number>,
): WaterQualityAssessment {
  const indicators: SingleIndicatorResult[] = [];

  for (const [indicator, value] of Object.entries(indicatorValues)) {
    if (value === undefined) continue;
    indicators.push(evaluateSingleIndicator(indicator as WaterQualityIndicator, value));
  }

  // 空指标值 → 返回默认评价（无数据时不判定为差类）
  if (indicators.length === 0) {
    return {
      stationId,
      stationName,
      city,
      assessmentDate: new Date().toISOString().split('T')[0],
      indicators: [],
      comprehensiveClass: 1,
      comprehensiveLabel: '无数据',
      exceededFactors: [],
      exceededCount: 0,
      sulin,
      anionEq,
      cationEq,
      TDS: 0,
      totalHardness: 0,
      hydrochemicalType: sulin?.fullName,
    };
  }

  // 综合类别 = 最差单项
  const worstClass = Math.max(...indicators.map(i => i.class)) as WaterQualityClass;
  const exceeded = indicators.filter(i => i.isExceeded);

  // 提取 TDS 和总硬度
  const tdsVal = indicatorValues.TDS ?? 0;
  const hardVal = indicatorValues.totalHardness ?? 0;

  return {
    stationId,
    stationName,
    city,
    assessmentDate: new Date().toISOString().split('T')[0],
    indicators,
    comprehensiveClass: worstClass,
    comprehensiveLabel: WATER_CLASS_LABELS[worstClass]?.description ?? '未知',
    exceededFactors: exceeded,
    exceededCount: exceeded.length,
    sulin,
    anionEq,
    cationEq,
    TDS: tdsVal,
    totalHardness: hardVal,
    hydrochemicalType: sulin?.fullName,
  };
}

// ============ 苏卡列夫分类 ============

/**
 * 计算离子当量浓度（meq/L）
 * 纯函数，可测试
 */
export function calcIonEq(mgL: number, valency: number, molarMass: number): number {
  return parseFloat(((mgL * valency) / molarMass).toFixed(4));
}

/** 常见离子的当量换算 */
export const ION_CONVERSION: Record<string, { valency: number; molarMass: number }> = {
  HCO3: { valency: 1, molarMass: 61.02 },
  SO4: { valency: 2, molarMass: 96.06 },
  Cl: { valency: 1, molarMass: 35.45 },
  Ca: { valency: 2, molarMass: 40.08 },
  Mg: { valency: 2, molarMass: 24.31 },
  Na: { valency: 1, molarMass: 22.99 },
  K: { valency: 1, molarMass: 39.10 },
};

/**
 * 苏卡列夫分类（基于主要阴/阳离子当量比例）
 * 某离子当量占比 > 25% 即参与命名
 * 纯函数，可测试
 */
export function classifySulin(
  ionMgL: Partial<Record<'HCO3' | 'SO4' | 'Cl' | 'Ca' | 'Mg' | 'Na' | 'K', number>>,
): SulinClassification {
  // 计算当量
  const eq: Record<string, number> = {};
  for (const [ion, mgL] of Object.entries(ionMgL)) {
    if (mgL === undefined) continue;
    const conv = ION_CONVERSION[ion];
    if (conv) {
      // K 并入 Na
      const key = ion === 'K' ? 'Na' : ion;
      eq[key] = (eq[key] ?? 0) + calcIonEq(mgL, conv.valency, conv.molarMass);
    }
  }

  // 阴离子（HCO3, SO4, Cl）
  const anionKeys = ['HCO3', 'SO4', 'Cl'] as const;
  const anionTotal = anionKeys.reduce((s, k) => s + (eq[k] ?? 0), 0);
  const anionTypes: string[] = [];
  if (anionTotal > 0) {
    for (const k of anionKeys) {
      if ((eq[k] ?? 0) / anionTotal > 0.25) {
        anionTypes.push(k);
      }
    }
  }
  const anionType = (anionTypes.length > 0 ? anionTypes.join('·') : 'HCO₃') as SulinAnionType;

  // 阳离子（Ca, Mg, Na）
  const cationKeys = ['Ca', 'Mg', 'Na'] as const;
  const cationTotal = cationKeys.reduce((s, k) => s + (eq[k] ?? 0), 0);
  const cationTypes: string[] = [];
  if (cationTotal > 0) {
    for (const k of cationKeys) {
      if ((eq[k] ?? 0) / cationTotal > 0.25) {
        cationTypes.push(k);
      }
    }
  }
  const cationType = (cationTypes.length > 0 ? cationTypes.join('·') : 'Ca') as SulinCationType;

  // Unicode 转换
  const anionUnicode = anionType
    .replace('HCO3', 'HCO₃')
    .replace('SO4', 'SO₄')
    .replace('Cl', 'Cl');
  const cationUnicode = cationType
    .replace('Ca', 'Ca')
    .replace('Mg', 'Mg')
    .replace('Na', 'Na');

  return {
    anionType: anionType as SulinAnionType,
    cationType: cationType as SulinCationType,
    fullName: `${cationUnicode}-${anionUnicode}型`,
  };
}

// ============ 统计汇总 ============

/**
 * 生成水质评价统计汇总
 * 纯函数，可测试
 */
export function buildWaterQualitySummary(
  assessments: WaterQualityAssessment[],
): WaterQualitySummary {
  const classDist: Record<WaterQualityClass, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const factorCount: Record<string, { label: string; count: number }> = {};
  const sulinDist: Record<string, number> = {};

  for (const a of assessments) {
    classDist[a.comprehensiveClass] = (classDist[a.comprehensiveClass] ?? 0) + 1;

    for (const f of a.exceededFactors) {
      if (!factorCount[f.indicator]) {
        factorCount[f.indicator] = { label: f.label, count: 0 };
      }
      factorCount[f.indicator].count++;
    }

    if (a.sulin) {
      sulinDist[a.sulin.fullName] = (sulinDist[a.sulin.fullName] ?? 0) + 1;
    }
  }

  const exceededSites = classDist[4] + classDist[5];
  const totalSites = assessments.length;

  const topFactors = Object.entries(factorCount)
    .map(([indicator, data]) => ({
      indicator: indicator as WaterQualityIndicator,
      label: data.label,
      count: data.count,
      rate: totalSites > 0 ? parseFloat(((data.count / totalSites) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalSites,
    classDistribution: classDist,
    exceededSites,
    exceedRate: totalSites > 0 ? parseFloat(((exceededSites / totalSites) * 100).toFixed(1)) : 0,
    topFactors,
    sulinDistribution: sulinDist,
  };
}

/**
 * 按城市统计水质
 * 纯函数，可测试
 */
export function buildCityWaterQualityStats(
  assessments: WaterQualityAssessment[],
): CityWaterQualityStats[] {
  const cityMap = new Map<string, WaterQualityAssessment[]>();

  for (const a of assessments) {
    const list = cityMap.get(a.city) ?? [];
    list.push(a);
    cityMap.set(a.city, list);
  }

  const results: CityWaterQualityStats[] = [];
  for (const [city, list] of cityMap) {
    const classDist: Record<WaterQualityClass, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const factors = new Set<string>();

    for (const a of list) {
      classDist[a.comprehensiveClass] = (classDist[a.comprehensiveClass] ?? 0) + 1;
      for (const f of a.exceededFactors) {
        factors.add(f.label);
      }
    }

    const exceeded = classDist[4] + classDist[5];
    const avgClass = parseFloat(
      (list.reduce((s, a) => s + a.comprehensiveClass, 0) / list.length).toFixed(1),
    );

    results.push({
      city,
      siteCount: list.length,
      classDistribution: classDist,
      exceededSites: exceeded,
      averageClass: avgClass,
      mainFactors: Array.from(factors).slice(0, 5),
    });
  }

  return results.sort((a, b) => b.exceededSites - a.exceededSites);
}

// ============ 水质等级转换工具 ============

/**
 * 获取水质等级颜色
 */
export function getClassColor(wqClass: WaterQualityClass): string {
  return WATER_CLASS_LABELS[wqClass]?.color ?? '#6b7280';
}

/**
 * 获取水质等级标签
 */
export function getClassLabel(wqClass: WaterQualityClass): string {
  return WATER_CLASS_LABELS[wqClass]?.label ?? '未知';
}

/**
 * 获取水质等级描述
 */
export function getClassDescription(wqClass: WaterQualityClass): string {
  return WATER_CLASS_LABELS[wqClass]?.description ?? '未知';
}