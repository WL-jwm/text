/**
 * B-27 地下水背景值统计分析引擎
 *
 * 功能：
 *  1. 背景值确定（均值±2σ法 / 格鲁布斯检验法 / 迭代2σ法）
 *  2. 分区背景值对比（t检验/变异系数/差异度）
 *  3. 超标因子统计评价（超标率/超标倍数/最大超标比/污染指数）
 *  4. 背景值趋势变化检测（多年数据线性回归+变化率）
 *  5. 预设数据：河北省6个分区10项因子背景值序列
 */

// ═══════════════════════════════════════════════════════
// 类型定义
// ═══════════════════════════════════════════════════════

export interface BackgroundValueInput {
  /** 分区/采样点名称 */
  name: string;
  /** 因子名称 */
  factor: string;
  /** 单位 */
  unit: string;
  /** 样本数据 */
  samples: number[];
  /** 标准限值 (mg/L) */
  standard: number;
}

export interface BackgroundValueResult {
  name: string;
  factor: string;
  unit: string;
  n: number;
  /** 均值 */
  mean: number;
  /** 标准差 */
  std: number;
  /** 变异系数 Cv */
  cv: number;
  /** 最小值 */
  min: number;
  /** 最大值 */
  max: number;
  /** 中位数 */
  median: number;
  /** 偏度 */
  skewness: number;
  /** 峰度 */
  kurtosis: number;
  /** 方法1：均值±2σ法背景值范围 */
  mean2SigmaRange: [number, number];
  /** 方法2：格鲁布斯检验法（剔除异常值后的背景值范围） */
  grubbsRange: [number, number];
  /** 格鲁布斯剔除的异常值数量 */
  grubbsRemoved: number;
  /** 方法3：迭代2σ法（迭代剔除后的背景值范围） */
  iterative2SigmaRange: [number, number];
  /** 迭代2σ剔除的异常值数量 */
  iterativeRemoved: number;
  /** 推荐背景值范围（三种方法综合） */
  recommendedRange: [number, number];
  /** 推荐方法 */
  recommendedMethod: string;
  /** 分布检验结论 */
  distributionNote: string;
  /** 评价说明 */
  note: string;
}

export interface ZoneCompareResult {
  /** 因子名称 */
  factor: string;
  /** 各分区统计 */
  zones: Array<{
    name: string;
    mean: number;
    std: number;
    cv: number;
    n: number;
  }>;
  /** 分区间最大差异倍数 */
  maxRatio: number;
  /** 变异系数加权平均（区间内变异） */
  avgCv: number;
  /** 分区间变异（各分区均值的标准差/总均值） */
  betweenZoneCv: number;
  /** 差异显著性（F检验近似） */
  significantDiff: boolean;
  /** 分区差异评价 */
  evaluation: string;
}

export interface ExceedanceResult {
  /** 因子名称 */
  factor: string;
  /** 标准限值 */
  standard: number;
  /** 样本数 */
  n: number;
  /** 超标样本数 */
  exceedCount: number;
  /** 超标率 (%) */
  exceedRate: number;
  /** 平均超标倍数 */
  avgExceedMultiple: number;
  /** 最大超标倍数 */
  maxExceedMultiple: number;
  /** 最大实测值 */
  maxValue: number;
  /** 污染指数 PI (均值/标准) */
  pollutionIndex: number;
  /** 超标等级 */
  grade: string;
  /** 评价 */
  note: string;
}

export interface TrendDetectionResult {
  /** 因子名称 */
  factor: string;
  /** 年份序列 */
  years: number[];
  /** 各年背景值（均值） */
  yearlyMeans: number[];
  /** 线性回归斜率 */
  slope: number;
  /** 年变化率 (%) */
  annualChangeRate: number;
  /** R² */
  r2: number;
  /** 趋势方向 */
  trend: '上升' | '下降' | '无显著趋势';
  /** 是否发生背景值偏移 */
  backgroundShift: boolean;
  /** 说明 */
  note: string;
}

// ═══════════════════════════════════════════════════════
// 辅助函数
// ═══════════════════════════════════════════════════════

function mean(arr: number[]): number {
  return arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

function std(arr: number[]): number {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1));
}

function median(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const n = sorted.length;
  if (n === 0) return 0;
  if (n % 2 === 0) return (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
  return sorted[Math.floor(n / 2)];
}

function round(v: number, d = 4): number {
  const f = Math.pow(10, d);
  return Math.round(v * f) / f;
}

// 格鲁布斯检验临界值表 (α=0.05)
function grubbsCritical(n: number): number {
  if (n < 3) return 1.15;
  if (n <= 30) {
    // 近似公式: G_α ≈ 1.73 + 0.42×ln(n) (α=0.05 近似)
    return 1.73 + 0.42 * Math.log(n);
  }
  return 3.0; // 大样本保守值
}

// ═══════════════════════════════════════════════════════
// 1. 背景值确定
// ═══════════════════════════════════════════════════════

export function calcBackgroundValue(input: BackgroundValueInput): BackgroundValueResult {
  const { name, factor, unit, samples, standard } = input;
  const n = samples.length;
  const m = mean(samples);
  const s = std(samples);
  const cv = m !== 0 ? s / Math.abs(m) : 0;
  const minVal = Math.min(...samples);
  const maxVal = Math.max(...samples);
  const med = median(samples);

  // 偏度
  const skewness = n > 2 && s > 0
    ? samples.reduce((sum, v) => sum + ((v - m) / s) ** 3, 0) / n
    : 0;

  // 峰度
  const kurtosis = n > 3 && s > 0
    ? samples.reduce((sum, v) => sum + ((v - m) / s) ** 4, 0) / n - 3
    : 0;

  // 方法1：均值±2σ法
  const mean2SigmaRange: [number, number] = [
    Math.max(0, round(m - 2 * s, 3)),
    round(m + 2 * s, 3),
  ];

  // 方法2：格鲁布斯检验法
  const gCritical = grubbsCritical(n);
  const grubbsSamples = [...samples];
  let grubbsRemoved = 0;
  for (let iter = 0; iter < 5; iter++) {
    if (grubbsSamples.length < 3) break;
    const gm = mean(grubbsSamples);
    const gs = std(grubbsSamples);
    if (gs === 0) break;
    // 找最大偏离值
    let maxIdx = -1;
    let maxG = 0;
    for (let i = 0; i < grubbsSamples.length; i++) {
      const g = Math.abs(grubbsSamples[i] - gm) / gs;
      if (g > maxG) { maxG = g; maxIdx = i; }
    }
    if (maxG > gCritical) {
      grubbsSamples.splice(maxIdx, 1);
      grubbsRemoved++;
    } else {
      break;
    }
  }
  const grubbsM = mean(grubbsSamples);
  const grubbsS = std(grubbsSamples);
  const grubbsRange: [number, number] = [
    Math.max(0, round(grubbsM - 2 * grubbsS, 3)),
    round(grubbsM + 2 * grubbsS, 3),
  ];

  // 方法3：迭代2σ法
  let iterSamples = [...samples];
  let iterativeRemoved = 0;
  for (let iter = 0; iter < 10; iter++) {
    if (iterSamples.length < 3) break;
    const im = mean(iterSamples);
    const is = std(iterSamples);
    if (is === 0) break;
    const lower = im - 2 * is;
    const upper = im + 2 * is;
    const filtered = iterSamples.filter(v => v >= lower && v <= upper);
    if (filtered.length === iterSamples.length) break;
    iterativeRemoved += iterSamples.length - filtered.length;
    iterSamples = filtered;
  }
  const iterM = mean(iterSamples);
  const iterS = std(iterSamples);
  const iterative2SigmaRange: [number, number] = [
    Math.max(0, round(iterM - 2 * iterS, 3)),
    round(iterM + 2 * iterS, 3),
  ];

  // 推荐方法选择
  let recommendedRange: [number, number];
  let recommendedMethod: string;
  if (n >= 30) {
    recommendedRange = grubbsRange;
    recommendedMethod = '格鲁布斯检验法（样本量充足，剔除异常值后估计）';
  } else if (n >= 10) {
    recommendedRange = iterative2SigmaRange;
    recommendedMethod = '迭代2σ法（中等样本量，逐步剔除）';
  } else {
    recommendedRange = mean2SigmaRange;
    recommendedMethod = '均值±2σ法（样本量有限，直接估计）';
  }

  // 分布检验
  let distributionNote: string;
  if (Math.abs(skewness) < 0.5 && Math.abs(kurtosis) < 1.0) {
    distributionNote = '数据近似正态分布，均值±2σ法适用性较好。';
  } else if (Math.abs(skewness) > 1.0) {
    distributionNote = `数据${skewness > 0 ? '右偏' : '左偏'}明显(偏度=${round(skewness, 2)})，建议使用中位数或对数转换后估计。`;
  } else {
    distributionNote = `数据轻度有偏(偏度=${round(skewness, 2)})，格鲁布斯/迭代2σ法更为稳健。`;
  }

  const note = `${factor}背景值推荐范围: [${recommendedRange[0]}, ${recommendedRange[1]}] ${unit}（${recommendedMethod}）。`
    + ` 样本n=${n}，均值=${round(m, 3)}±${round(s, 3)}，Cv=${round(cv, 3)}。`
    + ` 格鲁布斯剔除${grubbsRemoved}个异常值，迭代2σ剔除${iterativeRemoved}个。`
    + ` 标准限值${standard}${unit}，${m > standard ? '均值超标' : '均值达标'}。`;

  return {
    name, factor, unit, n,
    mean: round(m, 3), std: round(s, 3), cv: round(cv, 4),
    min: round(minVal, 3), max: round(maxVal, 3), median: round(med, 3),
    skewness: round(skewness, 3), kurtosis: round(kurtosis, 3),
    mean2SigmaRange, grubbsRange, grubbsRemoved,
    iterative2SigmaRange, iterativeRemoved,
    recommendedRange, recommendedMethod,
    distributionNote, note,
  };
}

// ═══════════════════════════════════════════════════════
// 2. 分区背景值对比
// ═══════════════════════════════════════════════════════

export function calcZoneCompare(
  factor: string,
  zoneData: Array<{ name: string; samples: number[] }>,
): ZoneCompareResult {
  const zones = zoneData.map(z => {
    const m = mean(z.samples);
    const s = std(z.samples);
    return {
      name: z.name,
      mean: round(m, 3),
      std: round(s, 3),
      cv: round(m !== 0 ? s / Math.abs(m) : 0, 4),
      n: z.samples.length,
    };
  });

  const allMeans = zones.map(z => z.mean);
  const grandMean = mean(allMeans);
  const betweenStd = std(allMeans);
  const betweenZoneCv = grandMean !== 0 ? betweenStd / Math.abs(grandMean) : 0;
  const avgCv = mean(zones.map(z => z.cv));

  const maxMean = Math.max(...allMeans);
  const minMean = Math.min(...allMeans.filter(v => v > 0));
  const maxRatio = minMean > 0 ? maxMean / minMean : 0;

  // F检验近似（组间方差/组内方差）
  const withinVar = mean(zones.map(z => z.std ** 2));
  const betweenVar = betweenStd ** 2;
  const fRatio = withinVar > 0 ? betweenVar / withinVar : 0;
  const significantDiff = fRatio > 3.0; // 近似F>3认为差异显著

  let evaluation: string;
  if (maxRatio < 1.5) {
    evaluation = `各分区${factor}背景值差异小(最大比=${round(maxRatio, 2)})，区域均一性好。`;
  } else if (maxRatio < 3.0) {
    evaluation = `各分区${factor}背景值存在一定差异(最大比=${round(maxRatio, 2)})，反映区域水文地质条件变化。`;
  } else if (maxRatio < 5.0) {
    evaluation = `各分区${factor}背景值差异显著(最大比=${round(maxRatio, 2)})，需分区分级管理。`;
  } else {
    evaluation = `各分区${factor}背景值差异极大(最大比=${round(maxRatio, 2)})，强烈受局部因素控制。`;
  }

  if (significantDiff) {
    evaluation += ' 统计检验表明分区间差异显著。';
  }

  return {
    factor, zones, maxRatio: round(maxRatio, 2),
    avgCv: round(avgCv, 4), betweenZoneCv: round(betweenZoneCv, 4),
    significantDiff, evaluation,
  };
}

// ═══════════════════════════════════════════════════════
// 3. 超标因子统计评价
// ═══════════════════════════════════════════════════════

export function calcExceedance(factor: string, samples: number[], standard: number, unit: string): ExceedanceResult {
  const n = samples.length;
  const exceedSamples = samples.filter(v => v > standard);
  const exceedCount = exceedSamples.length;
  const exceedRate = n > 0 ? (exceedCount / n) * 100 : 0;

  const exceedMultiples = exceedSamples.map(v => v / standard);
  const avgExceedMultiple = exceedMultiples.length > 0 ? mean(exceedMultiples) : 0;
  const maxExceedMultiple = exceedMultiples.length > 0 ? Math.max(...exceedMultiples) : 0;
  const maxValue = Math.max(...samples);

  const m = mean(samples);
  const pollutionIndex = standard > 0 ? m / standard : 0;

  let grade: string;
  if (exceedRate === 0) grade = '无超标';
  else if (exceedRate < 5) grade = '轻微超标';
  else if (exceedRate < 20) grade = '轻度超标';
  else if (exceedRate < 50) grade = '中度超标';
  else grade = '重度超标';

  const note = `${factor}超标率=${round(exceedRate, 1)}%（${exceedCount}/${n}）。`
    + (exceedCount > 0
      ? ` 平均超标${round(avgExceedMultiple, 2)}倍，最大超标${round(maxExceedMultiple, 2)}倍（最大值${round(maxValue, 2)}${unit}）。`
      : ` 所有样本均低于标准限值${standard}${unit}。`)
    + ` 污染指数PI=${round(pollutionIndex, 3)}（PI>1表示均值超标）。`;

  return {
    factor, standard, n, exceedCount,
    exceedRate: round(exceedRate, 1),
    avgExceedMultiple: round(avgExceedMultiple, 2),
    maxExceedMultiple: round(maxExceedMultiple, 2),
    maxValue: round(maxValue, 3),
    pollutionIndex: round(pollutionIndex, 3),
    grade, note,
  };
}

// ═══════════════════════════════════════════════════════
// 4. 背景值趋势变化检测
// ═══════════════════════════════════════════════════════

export function calcTrendDetection(
  factor: string,
  yearlyData: Array<{ year: number; mean: number }>,
): TrendDetectionResult {
  const n = yearlyData.length;
  const years = yearlyData.map(d => d.year);
  const yearlyMeans = yearlyData.map(d => d.mean);
  const m = mean(yearlyMeans);

  // 线性回归
  const sumX = years.reduce((a, b) => a + b, 0);
  const sumY = yearlyMeans.reduce((a, b) => a + b, 0);
  const sumXY = years.reduce((s, y, i) => s + y * yearlyMeans[i], 0);
  const sumX2 = years.reduce((s, y) => s + y * y, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  const ssTot = yearlyMeans.reduce((s, v) => s + (v - m) ** 2, 0);
  const ssRes = yearlyMeans.reduce((s, v, i) => s + (v - (slope * years[i] + (sumY - slope * sumX) / n)) ** 2, 0);
  const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0;

  const annualChangeRate = m !== 0 ? (slope / m) * 100 : 0;

  // 背景值偏移判断：年变化率 > 2% 且 R² > 0.5
  const backgroundShift = Math.abs(annualChangeRate) > 2 && r2 > 0.5;

  let trend: '上升' | '下降' | '无显著趋势';
  if (backgroundShift && slope > 0) trend = '上升';
  else if (backgroundShift && slope < 0) trend = '下降';
  else trend = '无显著趋势';

  const note = `${factor}背景值${trend === '无显著趋势' ? '无显著变化' : `呈显著${trend}趋势`}。`
    + ` 年变化率=${round(annualChangeRate, 2)}%/年，R²=${round(r2, 3)}。`
    + (backgroundShift
      ? ' 背景值已发生偏移，可能受人类活动影响，建议更新背景值。'
      : ' 背景值稳定，可继续使用。');

  return {
    factor, years, yearlyMeans: yearlyMeans.map(v => round(v, 3)),
    slope: round(slope, 4), annualChangeRate: round(annualChangeRate, 2),
    r2: round(r2, 4), trend, backgroundShift, note,
  };
}

// ═══════════════════════════════════════════════════════
// 预设数据：河北省3个分区6项因子背景值
// ═══════════════════════════════════════════════════════

export const PRESET_FACTORS = ['TDS', '总硬度', 'Cl⁻', 'SO₄²⁻', 'F⁻', 'NO₃⁻'] as const;
export const PRESET_ZONES = ['山前平原', '中部平原', '滨海平原'] as const;

// 各分区各因子样本数据（模拟实测，mg/L）
export const PRESET_BACKGROUND_DATA: Record<string, Record<string, number[]>> = {
  '山前平原': {
    'TDS': [320, 350, 380, 410, 340, 360, 390, 420, 330, 370, 400, 360, 350, 380, 340, 360, 390, 350, 370, 410],
    '总硬度': [180, 200, 220, 240, 190, 210, 230, 200, 220, 250, 190, 210, 200, 230, 210, 220, 240, 200, 210, 220],
    'Cl⁻': [25, 30, 35, 40, 28, 32, 38, 42, 26, 34, 36, 30, 28, 35, 32, 38, 40, 30, 33, 36],
    'SO₄²⁻': [45, 55, 65, 70, 50, 58, 62, 68, 48, 55, 60, 52, 56, 64, 50, 58, 66, 54, 60, 62],
    'F⁻': [0.3, 0.4, 0.5, 0.6, 0.35, 0.45, 0.55, 0.4, 0.5, 0.6, 0.35, 0.45, 0.4, 0.5, 0.55, 0.4, 0.45, 0.5, 0.35, 0.5],
    'NO₃⁻': [2.0, 3.5, 5.0, 8.0, 3.0, 4.5, 6.0, 10.0, 2.5, 4.0, 5.5, 7.0, 3.5, 5.0, 6.5, 4.5, 5.5, 7.5, 3.0, 4.5],
  },
  '中部平原': {
    'TDS': [650, 750, 850, 950, 700, 800, 900, 1000, 680, 780, 880, 720, 820, 920, 760, 840, 880, 740, 860, 900],
    '总硬度': [350, 420, 480, 540, 380, 440, 500, 560, 360, 430, 490, 400, 460, 520, 390, 450, 510, 410, 470, 500],
    'Cl⁻': [80, 120, 160, 200, 100, 140, 180, 220, 90, 130, 170, 110, 150, 190, 100, 160, 200, 120, 170, 180],
    'SO₄²⁻': [120, 160, 200, 240, 140, 180, 220, 260, 130, 170, 210, 150, 190, 230, 160, 200, 240, 170, 210, 220],
    'F⁻': [0.5, 0.7, 0.9, 1.1, 0.6, 0.8, 1.0, 1.2, 0.55, 0.75, 0.95, 0.65, 0.85, 1.05, 0.7, 0.9, 1.1, 0.75, 0.95, 1.0],
    'NO₃⁻': [0.5, 1.0, 2.0, 3.5, 0.8, 1.5, 2.5, 4.0, 0.6, 1.2, 2.2, 0.9, 1.8, 3.0, 1.0, 2.0, 3.2, 1.3, 2.3, 2.8],
  },
  '滨海平原': {
    'TDS': [1200, 1500, 1800, 2200, 1300, 1600, 1900, 2500, 1400, 1700, 2000, 1450, 1750, 2100, 1550, 1850, 2300, 1650, 1950, 2150],
    '总硬度': [500, 600, 700, 850, 550, 650, 750, 900, 580, 680, 780, 600, 700, 820, 620, 720, 860, 640, 760, 800],
    'Cl⁻': [200, 300, 400, 550, 250, 350, 450, 600, 280, 380, 480, 320, 420, 520, 340, 440, 560, 360, 460, 500],
    'SO₄²⁻': [180, 250, 320, 400, 210, 280, 350, 420, 230, 300, 370, 250, 320, 390, 270, 340, 410, 290, 360, 380],
    'F⁻': [0.4, 0.6, 0.8, 1.0, 0.5, 0.7, 0.9, 1.1, 0.45, 0.65, 0.85, 0.55, 0.75, 0.95, 0.6, 0.8, 1.0, 0.65, 0.85, 0.9],
    'NO₃⁻': [0.2, 0.5, 1.0, 2.0, 0.3, 0.8, 1.5, 2.5, 0.4, 0.9, 1.2, 0.6, 1.0, 1.8, 0.5, 1.0, 2.2, 0.7, 1.3, 1.6],
  },
};

// 标准限值 (GB/T 14848-2017 Ⅲ类)
export const STANDARD_LIMITS: Record<string, { standard: number; unit: string }> = {
  'TDS': { standard: 1000, unit: 'mg/L' },
  '总硬度': { standard: 450, unit: 'mg/L' },
  'Cl⁻': { standard: 250, unit: 'mg/L' },
  'SO₄²⁻': { standard: 250, unit: 'mg/L' },
  'F⁻': { standard: 1.0, unit: 'mg/L' },
  'NO₃⁻': { standard: 20.0, unit: 'mg/L' },
};

// 多年趋势数据（2014-2024年各因子背景值均值）
export const PRESET_TREND_DATA: Record<string, Array<{ year: number; mean: number }>> = {
  'TDS': [
    { year: 2015, mean: 720 }, { year: 2016, mean: 735 }, { year: 2017, mean: 745 },
    { year: 2018, mean: 760 }, { year: 2019, mean: 750 }, { year: 2020, mean: 740 },
    { year: 2021, mean: 730 }, { year: 2022, mean: 720 }, { year: 2023, mean: 710 }, { year: 2024, mean: 700 },
  ],
  '总硬度': [
    { year: 2015, mean: 340 }, { year: 2016, mean: 345 }, { year: 2017, mean: 350 },
    { year: 2018, mean: 358 }, { year: 2019, mean: 355 }, { year: 2020, mean: 350 },
    { year: 2021, mean: 345 }, { year: 2022, mean: 340 }, { year: 2023, mean: 335 }, { year: 2024, mean: 330 },
  ],
  'Cl⁻': [
    { year: 2015, mean: 95 }, { year: 2016, mean: 98 }, { year: 2017, mean: 100 },
    { year: 2018, mean: 105 }, { year: 2019, mean: 102 }, { year: 2020, mean: 98 },
    { year: 2021, mean: 95 }, { year: 2022, mean: 92 }, { year: 2023, mean: 90 }, { year: 2024, mean: 88 },
  ],
  'NO₃⁻': [
    { year: 2015, mean: 4.5 }, { year: 2016, mean: 4.8 }, { year: 2017, mean: 5.2 },
    { year: 2018, mean: 5.8 }, { year: 2019, mean: 6.2 }, { year: 2020, mean: 6.5 },
    { year: 2021, mean: 6.8 }, { year: 2022, mean: 7.2 }, { year: 2023, mean: 7.5 }, { year: 2024, mean: 7.8 },
  ],
};

// ═══════════════════════════════════════════════════════
// 批量计算
// ═══════════════════════════════════════════════════════

export function calcAllZonesBackground(): BackgroundValueResult[] {
  const results: BackgroundValueResult[] = [];
  for (const zone of PRESET_ZONES) {
    for (const factor of PRESET_FACTORS) {
      const samples = PRESET_BACKGROUND_DATA[zone][factor];
      if (!samples) continue;
      const { standard, unit } = STANDARD_LIMITS[factor];
      results.push(calcBackgroundValue({
        name: zone, factor, unit, samples, standard,
      }));
    }
  }
  return results;
}

export function calcAllZoneCompare(): ZoneCompareResult[] {
  return PRESET_FACTORS.map(factor => {
    const zoneData = PRESET_ZONES.map(zone => ({
      name: zone,
      samples: PRESET_BACKGROUND_DATA[zone][factor] ?? [],
    }));
    return calcZoneCompare(factor, zoneData);
  });
}

export function calcAllExceedance(): ExceedanceResult[] {
  // 汇总各因子所有分区样本
  return PRESET_FACTORS.map(factor => {
    const allSamples: number[] = [];
    for (const zone of PRESET_ZONES) {
      const s = PRESET_BACKGROUND_DATA[zone][factor];
      if (s) allSamples.push(...s);
    }
    const { standard, unit } = STANDARD_LIMITS[factor];
    return calcExceedance(factor, allSamples, standard, unit);
  });
}

export function calcAllTrends(): TrendDetectionResult[] {
  return Object.entries(PRESET_TREND_DATA).map(([factor, data]) =>
    calcTrendDetection(factor, data),
  );
}
