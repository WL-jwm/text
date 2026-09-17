/**
 * 水质评价服务 (G-11) — 评价算法
 * 拆分自 waterQuality.ts：单指标评价 / 综合评价 / 离子平衡 / 舒卡列夫分类
 */

import type {
  SingleIndicatorResult,
  SulinAnionType,
  SulinCationType,
  SulinClassification,
  WaterQualityAssessment,
  WaterQualityClass,
  WaterQualityIndicator,
} from './waterQualityTypes';
import {
  GB_T14848_2017_LIMITS,
  INDICATOR_META,
  ION_CONVERSION,
  WATER_CLASS_LABELS,
} from './waterQualityConstants';
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
