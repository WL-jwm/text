/**
 * 水质评价计算 — 核心算法
 *  pH指数 / 因子分类评价 / 样本综合评价 / 苏卡列夫水化学分类
 */

import type { EvaluationFactor, FactorResult, SampleResult, SukalovInput, SukalovResult } from './waterQualityTypes';
import { parseLimit, parseLimitValue } from './waterQualityUtils';

export function calcPhIndex(pHi: number): { Pi: number; className: string; classNum: number } {
  const _pHsd = 6.5;
  const _pHsu = 8.5;

  if (pHi >= 6.5 && pHi <= 8.5) {
    return { Pi: 0, className: 'I', classNum: 1 };
  }
  if (pHi < 6.5) {
    // 判定超出III类的程度
    if (pHi < 5.5) return { Pi: (7.0 - pHi) / (7.0 - 5.5), className: 'V', classNum: 5 };
    if (pHi < 6.5) return { Pi: (7.0 - pHi) / (7.0 - 6.5), className: 'IV', classNum: 4 };
  }
  if (pHi > 8.5) {
    if (pHi > 9) return { Pi: (pHi - 7.0) / (9 - 7.0), className: 'V', classNum: 5 };
    return { Pi: (pHi - 7.0) / (8.5 - 7.0), className: 'IV', classNum: 4 };
  }

  return { Pi: 0, className: 'I', classNum: 1 };
}

// ═══════════════════════════════════════════════════════
// 单因子标准指数法
// ═══════════════════════════════════════════════════════

/**
 * 判定单因子类别
 * 根据监测值对照 I~V 类标准限值，返回最差类别
 */

export function classifyFactor(
  valueStr: string,
  factor: EvaluationFactor
): FactorResult {
  const trimmed = valueStr.trim();

  // 处理未检出
  const ndMatch = trimmed.match(/未检出[<(]?([\d.]+)?[)>]?/);
  const isND = trimmed.includes('未检出') || trimmed === '<' || trimmed === 'ND';
  const detectionLimit = ndMatch ? parseFloat(ndMatch[1]) : undefined;

  if (isND) {
    // 未检出 → 以检出限50%参与计算
    const dl = detectionLimit ?? 0;
    const stdIII = parseLimitValue(factor.III);
    if (!stdIII) {
      return {
        name: factor.name, unit: factor.unit, value: trimmed,
        numericValue: null, isND: true, detectionLimit: dl,
        standardIII: null,
        Pi: `未检出 ${dl > 0 ? dl.toFixed(4) : ''}`,
        isExceeded: false, className: 'I', classNum: 1,
      };
    }
    const halfDl = dl / 2;
    const pi = stdIII > 0 ? halfDl / stdIII : 0;
    const piStr = pi > 0 ? (halfDl * stdIII > 0 ? `${(pi * 100).toFixed(0)}%` : '<1%') : '<1%';
    return {
      name: factor.name, unit: factor.unit, value: trimmed,
      numericValue: null, isND: true, detectionLimit: dl,
      standardIII: stdIII,
      Pi: piStr,
      isExceeded: false, className: 'I', classNum: 1,
    };
  }

  // 处理数值型监测值
  const numMatch = trimmed.match(/^<?\s*([\d.]+)\s*$/);
  const numericValue = numMatch ? parseFloat(numMatch[1]) : null;

  if (numericValue === null) {
    return {
      name: factor.name, unit: factor.unit, value: trimmed,
      numericValue: null, isND: false,
      standardIII: null,
      Pi: '无法计算', isExceeded: false, className: '-', classNum: 0,
    };
  }

  // pH 特殊处理
  if (factor.name.includes('pH')) {
    const phResult = calcPhIndex(numericValue);
    const exceeded = phResult.classNum > 3;
    return {
      name: factor.name, unit: factor.unit, value: trimmed,
      numericValue, isND: false,
      standardIII: 7.0,
      Pi: phResult.Pi.toFixed(2),
      isExceeded: exceeded, className: phResult.className, classNum: phResult.classNum,
    };
  }

  // 通用因子：遍历各类标准，找到最差类别
  const classes = ['I', 'II', 'III', 'IV', 'V'] as const;
  let className = 'I';
  let classNum = 1;
  const stdIII = parseLimitValue(factor.III);

  for (const cls of classes) {
    const limitStr = factor[cls];
    const range = parseLimit(limitStr);

    if (!range) {
      // 非数值型（如"无"/"有"）
      if (cls === 'V' && trimmed === limitStr) {
        className = 'V';
        classNum = 5;
      }
      continue;
    }

    // 判断是否超过该类限值
    let exceeded = false;
    if (range.inclusive && isFinite(range.high)) {
      exceeded = numericValue > range.high;
    } else if (!range.inclusive && isFinite(range.low)) {
      exceeded = numericValue > range.low;
    }

    if (exceeded) {
      // 超过当前类限值 → 进入下一类
      const nextIdx = classes.indexOf(cls) + 1;
      if (nextIdx < classes.length) {
        className = classes[nextIdx];
        classNum = nextIdx + 1;
      } else {
        // 超出V类限值仍为V类（无更高类别）
        className = 'V';
        classNum = 5;
      }
    } else {
      // 未超过当前类限值 → 此即为最终类别，停止遍历
      break;
    }
  }

  // 标准 Pi 计算
  let Pi: string;
  if (stdIII !== null && stdIII > 0) {
    const pi = numericValue / stdIII;
    Pi = pi.toFixed(2);
  } else {
    Pi = '-';
  }

  const isExceeded = classNum > 3;

  return {
    name: factor.name, unit: factor.unit, value: trimmed,
    numericValue, isND: false,
    standardIII: stdIII,
    Pi, isExceeded, className, classNum,
  };
}

/**
 * 评价一个水样的全部因子
 * @param sampleName 水样名称
 * @param values 各因子的监测值 Map: { 因子名: 监测值字符串 }
 * @param factors 标准因子列表
 */

export function classifySample(
  sampleName: string,
  values: Record<string, string>,
  factors: EvaluationFactor[]
): SampleResult {
  const results: FactorResult[] = [];
  let worstClassNum = 0;
  let worstClass = 'I';
  const exceededFactors: string[] = [];

  for (const factor of factors) {
    const val = values[factor.name];
    if (val === undefined) continue; // 用户未输入的因子跳过

    const result = classifyFactor(val, factor);
    results.push(result);

    if (result.classNum > worstClassNum) {
      worstClassNum = result.classNum;
      worstClass = result.className;
    }
    if (result.isExceeded) {
      exceededFactors.push(factor.name);
    }
  }

  return {
    sampleName,
    overallClass: worstClass,
    overallClassNum: worstClassNum,
    factors: results,
    exceededCount: exceededFactors.length,
    exceededFactors,
  };
}

// ═══════════════════════════════════════════════════════
// 苏卡列夫分类
// ═══════════════════════════════════════════════════════

/** 苏卡列夫分类输入参数 */

const MOLAR_MASS: Record<string, number> = {
  HCO3: 61.017,
  SO4: 96.06,
  Cl: 35.453,
  Ca: 40.078,
  Mg: 24.305,
  Na: 22.990,
};

/** 离子化合价 */

const VALENCE: Record<string, number> = {
  HCO3: 1,
  SO4: 2,
  Cl: 1,
  Ca: 2,
  Mg: 2,
  Na: 1,
};

/**
 * 苏卡列夫水化学分类
 *
 * 计算步骤：
 * 1. 浓度 → 毫当量/升 (meq/L)
 * 2. 按阴阳离子分别计算毫克当量百分比 (%ep)
 * 3. 阴离子中 >25% 的离子按含量排序 → 水类型
 * 4. 阳离子中 >25% 的离子按含量排序 → 水亚型
 * 5. 根据优势离子组合确定分区号
 */

export function sukalovClassification(input: SukalovInput): SukalovResult {
  // 1. 浓度 → 毫当量浓度 (meq/L)
  const meq: Record<string, number> = {};
  for (const ion of ['HCO3', 'SO4', 'Cl', 'Ca', 'Mg', 'Na']) {
    const conc = input[ion] ?? 0;
    const mm = MOLAR_MASS[ion];
    const val = VALENCE[ion];
    meq[ion] = conc / mm * val;
  }

  // 2. 百分当量 (%ep)
  const anionTotal = meq.HCO3 + meq.SO4 + meq.Cl;
  const cationTotal = meq.Ca + meq.Mg + meq.Na;

  const anionPct: Record<string, number> = {
    HCO3: anionTotal > 0 ? (meq.HCO3 / anionTotal) * 100 : 0,
    SO4: anionTotal > 0 ? (meq.SO4 / anionTotal) * 100 : 0,
    Cl: anionTotal > 0 ? (meq.Cl / anionTotal) * 100 : 0,
  };

  const cationPct: Record<string, number> = {
    Ca: cationTotal > 0 ? (meq.Ca / cationTotal) * 100 : 0,
    Mg: cationTotal > 0 ? (meq.Mg / cationTotal) * 100 : 0,
    Na: cationTotal > 0 ? (meq.Na / cationTotal) * 100 : 0,
  };

  // 3. >25% 的离子排序
  const THRESHOLD = 25;
  const sortedAnions = Object.entries(anionPct)
    .filter(([, pct]) => pct > THRESHOLD)
    .sort((a, b) => b[1] - a[1])
    .map(([ion]) => ion);

  const sortedCations = Object.entries(cationPct)
    .filter(([, pct]) => pct > THRESHOLD)
    .sort((a, b) => b[1] - a[1])
    .map(([ion]) => ion);

  // 4. 水化学类型字符串
  const ionSymbolMap: Record<string, string> = {
    HCO3: 'HCO₃', SO4: 'SO₄', Cl: 'Cl',
    Ca: 'Ca', Mg: 'Mg', Na: 'Na',
  };

  const anionStr = sortedAnions.map(a => ionSymbolMap[a]).join('·') || '未知';
  const cationStr = sortedCations.map(c => ionSymbolMap[c]).join('·') || '未知';
  const typeStr = `${anionStr}-${cationStr}`;

  // 5. 分区号（1~49）
  // 行=阴离子优势序号(1=HCO₃,2=SO₄,3=Cl,4=SO₄·Cl,5=HCO₃·SO₄,6=HCO₃·Cl,7=HCO₃·SO₄·Cl)
  // 列=阳离子优势序号
  const anionKey = sortedAnions.join('+');
  const cationKey = sortedCations.join('+');

  const anionRowMap: Record<string, number> = {
    'HCO3': 1, 'SO4': 2, 'Cl': 3,
    'SO4+Cl': 4, 'Cl+SO4': 4,
    'HCO3+SO4': 5, 'SO4+HCO3': 5,
    'HCO3+Cl': 6, 'Cl+HCO3': 6,
    'HCO3+SO4+Cl': 7, 'HCO3+Cl+SO4': 7,
    'SO4+HCO3+Cl': 7, 'Cl+HCO3+SO4': 7,
    'Cl+SO4+HCO3': 7, 'SO4+Cl+HCO3': 7,
  };
  const cationColMap: Record<string, number> = {
    'Ca': 1, 'Mg': 2, 'Na': 3,
    'Ca+Mg': 4, 'Mg+Ca': 4,
    'Ca+Na': 5, 'Na+Ca': 5,
    'Mg+Na': 6, 'Na+Mg': 6,
    'Ca+Mg+Na': 7, 'Ca+Na+Mg': 7,
    'Mg+Ca+Na': 7, 'Mg+Na+Ca': 7,
    'Na+Ca+Mg': 7, 'Na+Mg+Ca': 7,
  };

  const row = anionRowMap[anionKey] ?? 0;
  const col = cationColMap[cationKey] ?? 0;
  const zone = row > 0 && col > 0 ? (row - 1) * 7 + col : 0;

  return {
    type: typeStr,
    anions: sortedAnions,
    cations: sortedCations,
    anionPercentages: anionPct,
    cationPercentages: cationPct,
    zone,
  };
}

