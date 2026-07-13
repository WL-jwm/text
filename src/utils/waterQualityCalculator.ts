/**
 * 水质评价计算引擎 (GB/T 14848-2017)
 *
 * 实现标准指数法（单因子评价法）和苏卡列夫分类：
 * - classifySample: 单因子标准指数法 → 评定水质类别
 * - sukalovClassification: 苏卡列夫水化学分类
 * - parseLimit: 解析标准限值字符串为数值区间
 */

// ═══════════════════════════════════════════════════════
// 类型定义
// ═══════════════════════════════════════════════════════

export interface EvaluationFactor {
  name: string;
  unit: string;
  I: string;
  II: string;
  III: string;
  IV: string;
  V: string;
  type: string;
}

export interface LimitRange {
  low: number;
  high: number;
  inclusive: boolean;
}

/** 单因子评价结果 */
export interface FactorResult {
  name: string;
  unit: string;
  /** 监测值（原始） */
  value: string;
  /** 监测值（数值），未检出时为 null */
  numericValue: number | null;
  /** 是否未检出 */
  isND: boolean;
  /** 检出限 */
  detectionLimit?: number;
  /** III类标准限值（数值型） */
  standardIII: number | null;
  /** 标准指数 Pi */
  Pi: string;
  /** 是否超标 */
  isExceeded: boolean;
  /** 评定类别 */
  className: string;
  /** 类别数字 */
  classNum: number;
}

/** 单个水样评价结果 */
export interface SampleResult {
  sampleName: string;
  /** 综合评定类别（取最差类别） */
  overallClass: string;
  overallClassNum: number;
  /** 各因子评价结果 */
  factors: FactorResult[];
  /** 超标因子数量 */
  exceededCount: number;
  /** 超标因子列表 */
  exceededFactors: string[];
}

/** 苏卡列夫分类结果 */
export interface SukalovResult {
  /** 水化学类型 如 "HCO₃-Ca·Mg" */
  type: string;
  /** 阴离子优势排序 */
  anions: string[];
  /** 阳离子优势排序 */
  cations: string[];
  /** 各离子百分比 */
  anionPercentages: Record<string, number>;
  cationPercentages: Record<string, number>;
  /** 苏卡列夫分区号 */
  zone: number;
}

// ═══════════════════════════════════════════════════════
// 标准限值解析
// ═══════════════════════════════════════════════════════

/**
 * 解析标准限值字符串为数值区间
 * 支持格式：
 *   "≤150"     → { low: -Infinity, high: 150, inclusive: true }
 *   ">650"     → { low: 650, high: Infinity, inclusive: false }
 *   "6.5~8.5"  → { low: 6.5, high: 8.5, inclusive: true }
 *   "无"       → null（感官指标，不能数值化）
 */
export function parseLimit(limitStr: string): LimitRange | null {
  const s = limitStr.trim();

  // "≤X" 格式
  const leMatch = s.match(/^≤(\d+\.?\d*)$/);
  if (leMatch) {
    return { low: -Infinity, high: parseFloat(leMatch[1]), inclusive: true };
  }

  // ">X" 格式
  const gtMatch = s.match(/^>(\d+\.?\d*)$/);
  if (gtMatch) {
    return { low: parseFloat(gtMatch[1]), high: Infinity, inclusive: false };
  }

  // "A~B" 范围格式
  const rangeMatch = s.match(/^([\d.]+)[~—]([\d.]+)$/);
  if (rangeMatch) {
    return { low: parseFloat(rangeMatch[1]), high: parseFloat(rangeMatch[2]), inclusive: true };
  }

  // "无" 或 "有" 等非数值
  return null;
}

/**
 * 解析限值为数值（取上限值）
 * 用于标准指数法 Pi 计算，取III类上限值作为分母
 */
export function parseLimitValue(limitStr: string): number | null {
  const range = parseLimit(limitStr);
  if (!range) return null;
  return isFinite(range.high) ? range.high : null;
}

// ═══════════════════════════════════════════════════════
// pH 标准指数法（特殊处理）
// ═══════════════════════════════════════════════════════

/**
 * pH 标准指数法
 * PpH = (7.0 - pHi) / (7.0 - pHsd)   当 pHi < 7.0
 * PpH = (pHi - 7.0) / (pHsu - 7.0)   当 pHi > 7.0
 * PpH = 0                              当 7.0 ≤ pHi ≤ pHsu 且 pHsd ≤ 7.0
 */
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
    if (range.inclusive && isFinite(range.high) && numericValue > range.high) {
      className = cls === 'I' ? 'II' : cls;
      classNum = cls === 'I' ? 2 : (classes.indexOf(cls) + 1);
    } else if (!range.inclusive && isFinite(range.low) && numericValue > range.low) {
      className = cls === 'I' ? 'II' : cls;
      classNum = cls === 'I' ? 2 : (classes.indexOf(cls) + 1);
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
export interface SukalovInput {
  /** 各离子浓度 (mg/L) */
  HCO3: number;   // 重碳酸根
  SO4: number;    // 硫酸根
  Cl: number;     // 氯离子
  Ca: number;     // 钙
  Mg: number;     // 镁
  Na: number;     // 钠
  /** 总阳离子当量浓度（用于校验） */
  totalCation?: number;
}

/** 离子摩尔质量 (g/mol) */
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
