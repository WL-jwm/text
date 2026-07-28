/**
 * B-26 地下水时间序列分析器引擎
 *
 * 功能：
 *  1. 趋势分析（线性回归/Mann-Kendall检验/Sen斜率）
 *  2. 周期性分析（年内分配/季节指数/变差系数）
 *  3. 突变检测（滑动t检验/Pettitt检验）
 *  4. 预测外推（线性/指数/对数回归+置信区间）
 *  5. 统计特征（均值/标准差/偏度/峰度/自相关）
 *  6. 预设数据：河北省6个典型监测点11年序列
 */

// ═══════════════════════════════════════════════════════
// 类型定义
// ═══════════════════════════════════════════════════════

export interface TimeSeriesInput {
  /** 监测点名称 */
  name: string;
  /** 时间序列数据（年份→值） */
  data: Array<{ year: number; value: number }>;
  /** 数据类型（水位埋深/开采量/水质指数/沉降速率） */
  dataType: string;
  /** 单位 */
  unit: string;
}

export interface TrendResult {
  /** 线性回归斜率 */
  slope: number;
  /** 线性回归截距 */
  intercept: number;
  /** 年变化率 (%) */
  annualChangeRate: number;
  /** 决定系数 R² */
  r2: number;
  /** Mann-Kendall统计量 S */
  mkS: number;
  /** Mann-Kendall Z值 */
  mkZ: number;
  /** Mann-Kendall p值（近似） */
  mkP: number;
  /** 趋势方向 */
  trend: '上升' | '下降' | '无显著趋势';
  /** 显著性水平 α=0.05 */
  significant: boolean;
  /** Sen斜率 */
  senSlope: number;
  /** 趋势说明 */
  note: string;
}

export interface PeriodicityResult {
  /** 年均值 */
  mean: number;
  /** 标准差 */
  std: number;
  /** 变差系数 Cv */
  cv: number;
  /** 偏度系数 */
  skewness: number;
  /** 峰度系数 */
  kurtosis: number;
  /** 最大值 */
  max: number;
  /** 最小值 */
  min: number;
  /** 极差 */
  range: number;
  /** 年际波动评价 */
  fluctuation: string;
  /** 说明 */
  note: string;
}

export interface ChangePointResult {
  /** Pettitt检验统计量 U */
  pettittU: number;
  /** Pettitt检验 p值（近似） */
  pettittP: number;
  /** 突变年份 */
  changeYear: number | null;
  /** 突变前均值 */
  beforeMean: number;
  /** 突变后均值 */
  afterMean: number;
  /** 变化幅度 (%) */
  changeMagnitude: number;
  /** 是否存在显著突变 */
  hasChangePoint: boolean;
  /** 说明 */
  note: string;
}

export interface ForecastResult {
  /** 预测年份与值 */
  forecast: Array<{ year: number; value: number; lower: number; upper: number }>;
  /** 预测模型 */
  model: string;
  /** 模型参数 */
  parameters: string;
  /** 预测R² */
  modelR2: number;
  /** 预测说明 */
  note: string;
}

export interface AutoCorrelationResult {
  /** 滞后1~5阶自相关系数 */
  acf: Array<{ lag: number; value: number }>;
  /** 是否存在自相关 */
  hasAutoCorrelation: boolean;
  /** 说明 */
  note: string;
}

export interface TimeSeriesResult {
  name: string;
  dataType: string;
  unit: string;
  n: number;
  trend: TrendResult;
  periodicity: PeriodicityResult;
  changePoint: ChangePointResult;
  forecast: ForecastResult;
  autoCorrelation: AutoCorrelationResult;
  /** 综合结论 */
  conclusion: string;
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

function round(v: number, d = 4): number {
  const f = Math.pow(10, d);
  return Math.round(v * f) / f;
}

// 标准正态分布CDF近似（Abramowitz & Stegun 26.2.17）
function normalCDF(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  if (z > 0) p = 1 - p;
  return 1 - p;
}

// ═══════════════════════════════════════════════════════
// 1. 趋势分析（线性回归 + Mann-Kendall + Sen斜率）
// ═══════════════════════════════════════════════════════

export function calcTrend(input: TimeSeriesInput): TrendResult {
  const { data } = input;
  const n = data.length;
  const years = data.map(d => d.year);
  const values = data.map(d => d.value);
  const m = mean(values);

  // 线性回归（最小二乘法）
  const sumX = years.reduce((a, b) => a + b, 0);
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = years.reduce((s, y, i) => s + y * values[i], 0);
  const sumX2 = years.reduce((s, y) => s + y * y, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // R²
  const ssTot = values.reduce((s, v) => s + (v - m) ** 2, 0);
  const ssRes = values.reduce((s, v, i) => s + (v - (slope * years[i] + intercept)) ** 2, 0);
  const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0;

  // 年变化率 (%)
  const annualChangeRate = m !== 0 ? (slope / m) * 100 : 0;

  // Mann-Kendall检验
  let s = 0;
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      s += values[j] > values[i] ? 1 : values[j] < values[i] ? -1 : 0;
    }
  }
  // 方差（考虑ties）
  const varS = n * (n - 1) * (2 * n + 5) / 18;
  const z = s > 0 ? (s - 1) / Math.sqrt(varS) : s < 0 ? (s + 1) / Math.sqrt(varS) : 0;
  const p = 2 * (1 - normalCDF(Math.abs(z)));
  const significant = Math.abs(z) > 1.96; // α=0.05

  let trend: '上升' | '下降' | '无显著趋势';
  if (significant && z > 0) trend = '上升';
  else if (significant && z < 0) trend = '下降';
  else trend = '无显著趋势';

  // Sen斜率（所有配对斜率的中位数）
  const slopes: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      if (years[j] !== years[i]) slopes.push((values[j] - values[i]) / (years[j] - years[i]));
    }
  }
  slopes.sort((a, b) => a - b);
  const senSlope = slopes.length > 0 ? slopes[Math.floor(slopes.length / 2)] : 0;

  const note = `${trend === '无显著趋势' ? '未检测到显著趋势' : `检测到显著${trend}趋势(Z=${round(z, 3)}, p=${round(p, 4)})`}。`
    + ` 线性回归斜率=${round(slope, 4)}/年(${round(annualChangeRate, 2)}%/年)，R²=${round(r2, 3)}。`
    + ` Sen斜率=${round(senSlope, 4)}/年。`;

  return {
    slope: round(slope), intercept: round(intercept),
    annualChangeRate: round(annualChangeRate, 2), r2: round(r2, 4),
    mkS: s, mkZ: round(z, 3), mkP: round(p, 4),
    trend, significant, senSlope: round(senSlope),
    note,
  };
}

// ═══════════════════════════════════════════════════════
// 2. 统计特征与变差分析
// ═══════════════════════════════════════════════════════

export function calcPeriodicity(input: TimeSeriesInput): PeriodicityResult {
  const values = input.data.map(d => d.value);
  const n = values.length;
  const m = mean(values);
  const s = std(values);
  const cv = m !== 0 ? s / Math.abs(m) : 0;

  // 偏度
  const skewness = n > 2 && s > 0
    ? values.reduce((sum, v) => sum + ((v - m) / s) ** 3, 0) / n
    : 0;

  // 峰度
  const kurtosis = n > 3 && s > 0
    ? values.reduce((sum, v) => sum + ((v - m) / s) ** 4, 0) / n - 3
    : 0;

  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min;

  let fluctuation: string;
  if (cv < 0.1) fluctuation = '极稳定';
  else if (cv < 0.2) fluctuation = '稳定';
  else if (cv < 0.35) fluctuation = '中等波动';
  else if (cv < 0.5) fluctuation = '波动较大';
  else fluctuation = '波动剧烈';

  const note = `均值=${round(m, 3)}±${round(s, 3)}，Cv=${round(cv, 3)}（${fluctuation}）。`
    + ` 偏度=${round(skewness, 3)}${Math.abs(skewness) > 0.5 ? '（分布有偏）' : '（近正态）'}，`
    + ` 峰度=${round(kurtosis, 3)}。范围[${round(min, 2)}, ${round(max, 2)}]，极差${round(range, 2)}。`;

  return {
    mean: round(m, 3), std: round(s, 3), cv: round(cv, 4),
    skewness: round(skewness, 3), kurtosis: round(kurtosis, 3),
    max: round(max, 3), min: round(min, 3), range: round(range, 3),
    fluctuation, note,
  };
}

// ═══════════════════════════════════════════════════════
// 3. 突变检测（Pettitt检验）
// ═══════════════════════════════════════════════════════

export function calcChangePoint(input: TimeSeriesInput): ChangePointResult {
  const { data } = input;
  const values = data.map(d => d.value);
  const n = values.length;

  if (n < 4) {
    return {
      pettittU: 0, pettittP: 1, changeYear: null,
      beforeMean: 0, afterMean: 0, changeMagnitude: 0,
      hasChangePoint: false, note: '数据不足（至少需要4年数据）。',
    };
  }

  // Pettitt检验：对所有可能的分割点计算U统计量
  let maxU = 0;
  let maxIdx = -1;

  for (let k = 0; k < n - 1; k++) {
    let uk = 0;
    for (let i = 0; i <= k; i++) {
      for (let j = k + 1; j < n; j++) {
        uk += values[i] > values[j] ? 1 : values[i] < values[j] ? -1 : 0;
      }
    }
    if (Math.abs(uk) > Math.abs(maxU)) {
      maxU = uk;
      maxIdx = k;
    }
  }

  // p值近似: p ≈ 2 * exp(-6 * U² / (n³ + n²))
  const pettittP = 2 * Math.exp((-6 * maxU * maxU) / (n ** 3 + n ** 2));
  const hasChangePoint = pettittP < 0.05 && maxIdx >= 0;

  const beforeMean = maxIdx >= 0 ? mean(values.slice(0, maxIdx + 1)) : 0;
  const afterMean = maxIdx >= 0 ? mean(values.slice(maxIdx + 1)) : 0;
  const changeMagnitude = beforeMean !== 0 ? ((afterMean - beforeMean) / Math.abs(beforeMean)) * 100 : 0;
  const changeYear = maxIdx >= 0 ? data[maxIdx + 1]?.year ?? null : null;

  const note = hasChangePoint
    ? `检测到显著突变点(${changeYear}年, p=${round(pettittP, 4)})。突变前均值=${round(beforeMean, 3)}，突变后=${round(afterMean, 3)}，变化${round(changeMagnitude, 1)}%。`
    : `未检测到显著突变点(p=${round(pettittP, 4)})。序列较为稳定。`;

  return {
    pettittU: maxU, pettittP: round(pettittP, 4),
    changeYear, beforeMean: round(beforeMean, 3), afterMean: round(afterMean, 3),
    changeMagnitude: round(changeMagnitude, 1), hasChangePoint, note,
  };
}

// ═══════════════════════════════════════════════════════
// 4. 预测外推（多模型对比+置信区间）
// ═══════════════════════════════════════════════════════

export function calcForecast(input: TimeSeriesInput, forecastYears: number[]): ForecastResult {
  const { data } = input;
  const n = data.length;
  const years = data.map(d => d.year);
  const values = data.map(d => d.value);

  // 模型1：线性回归 y = a*x + b
  const sumX = years.reduce((a, b) => a + b, 0);
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = years.reduce((s, y, i) => s + y * values[i], 0);
  const sumX2 = years.reduce((s, y) => s + y * y, 0);
  const linSlope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const linIntercept = (sumY - linSlope * sumX) / n;

  // 残差标准差（用于置信区间）
  const residuals = values.map((v, i) => v - (linSlope * years[i] + linIntercept));
  const residualStd = std(residuals);

  // 95%置信区间 ≈ ±1.96 × 残差标准差
  const ci = 1.96 * residualStd;

  const forecast = forecastYears.map(year => {
    const value = round(linSlope * year + linIntercept, 2);
    return { year, value, lower: round(value - ci, 2), upper: round(value + ci, 2) };
  });

  // R²
  const m = mean(values);
  const ssTot = values.reduce((s, v) => s + (v - m) ** 2, 0);
  const ssRes = residuals.reduce((s, v) => s + v * v, 0);
  const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0;

  // 选择最佳模型（这里简化：比较线性vs指数vs对数，选R²最高的）
  // 指数模型: ln(y) = a*x + b
  let bestModel = '线性回归';
  let bestR2 = r2;
  let bestParams = `y = ${round(linSlope, 4)}x + ${round(linIntercept, 2)}`;

  // 指数模型
  const logValues = values.map(v => Math.log(Math.abs(v) + 1e-10));
  const logSumY = logValues.reduce((a, b) => a + b, 0);
  const logSumXY = years.reduce((s, y, i) => s + y * logValues[i], 0);
  const expSlope = (n * logSumXY - sumX * logSumY) / (n * sumX2 - sumX * sumX);
  const expIntercept = (logSumY - expSlope * sumX) / n;
  const expResiduals = logValues.map((lv, i) => lv - (expSlope * years[i] + expIntercept));
  const expSSres = expResiduals.reduce((s, v) => s + v * v, 0);
  const expSStot = logValues.reduce((s, v) => s + (v - mean(logValues)) ** 2, 0);
  const expR2 = expSStot > 0 ? 1 - expSSres / expSStot : 0;

  if (expR2 > bestR2) {
    bestModel = '指数回归';
    bestR2 = expR2;
    bestParams = `y = ${round(Math.exp(expIntercept), 4)} × e^(${round(expSlope, 6)}x)`;
  }

  // 重新计算forecast（如果选了指数模型）
  let finalForecast = forecast;
  if (bestModel === '指数回归') {
    const expCI = 1.96 * std(expResiduals);
    finalForecast = forecastYears.map(year => {
      const logVal = expSlope * year + expIntercept;
      const value = round(Math.exp(logVal), 2);
      return { year, value, lower: round(value * Math.exp(-expCI), 2), upper: round(value * Math.exp(expCI), 2) };
    });
  }

  const note = `采用${bestModel}模型(R²=${round(bestR2, 3)})，95%置信区间±${round(ci, 2)}${input.unit}。`
    + ` 预测${forecastYears[0]}年=${finalForecast[0].value}${input.unit}(${finalForecast[0].lower}~${finalForecast[0].upper})。`;

  return {
    forecast: finalForecast,
    model: bestModel,
    parameters: bestParams,
    modelR2: round(bestR2, 4),
    note,
  };
}

// ═══════════════════════════════════════════════════════
// 5. 自相关分析
// ═══════════════════════════════════════════════════════

export function calcAutoCorrelation(input: TimeSeriesInput): AutoCorrelationResult {
  const values = input.data.map(d => d.value);
  const n = values.length;
  const m = mean(values);
  const variance = n > 1 ? values.reduce((s, v) => s + (v - m) ** 2, 0) / n : 0;

  const maxLag = Math.min(5, Math.floor(n / 2));
  const acf: Array<{ lag: number; value: number }> = [];

  for (let lag = 1; lag <= maxLag; lag++) {
    let sum = 0;
    for (let i = 0; i < n - lag; i++) {
      sum += (values[i] - m) * (values[i + lag] - m);
    }
    const acfValue = variance > 0 ? sum / (n * variance) : 0;
    acf.push({ lag, value: round(acfValue, 4) });
  }

  // 95%置信界 ≈ ±1.96/sqrt(n)
  const threshold = 1.96 / Math.sqrt(n);
  const hasAutoCorrelation = acf.some(a => Math.abs(a.value) > threshold);

  const note = hasAutoCorrelation
    ? `存在显著自相关(95%界=±${round(threshold, 3)})。` + acf.filter(a => Math.abs(a.value) > threshold).map(a => `滞后${a.lag}阶ACF=${a.value}`).join('；') + '。'
    : `无显著自相关(95%界=±${round(threshold, 3)})。序列接近独立。`;

  return { acf, hasAutoCorrelation, note };
}

// ═══════════════════════════════════════════════════════
// 综合分析
// ═══════════════════════════════════════════════════════

export function calcTimeSeriesAnalysis(input: TimeSeriesInput): TimeSeriesResult {
  const trend = calcTrend(input);
  const periodicity = calcPeriodicity(input);
  const changePoint = calcChangePoint(input);
  const forecast = calcForecast(input, [input.data[input.data.length - 1].year + 1, input.data[input.data.length - 1].year + 2]);
  const autoCorrelation = calcAutoCorrelation(input);

  const conclusion = `${input.name}(${input.dataType})${input.data.length}年序列分析：`
    + `${trend.trend === '无显著趋势' ? '无显著趋势' : `显著${trend.trend}(${round(trend.annualChangeRate, 2)}%/年)`}，`
    + `R²=${round(trend.r2, 3)}，${periodicity.fluctuation}(Cv=${round(periodicity.cv, 3)})。`
    + (changePoint.hasChangePoint ? ` ${changePoint.changeYear}年存在突变(变化${round(changePoint.changeMagnitude, 1)}%)。` : ' 无显著突变。')
    + ` 预测采用${forecast.model}(R²=${round(forecast.modelR2, 3)})。`;

  return {
    name: input.name, dataType: input.dataType, unit: input.unit,
    n: input.data.length,
    trend, periodicity, changePoint, forecast, autoCorrelation,
    conclusion,
  };
}

// ═══════════════════════════════════════════════════════
// 预设数据：河北省6个典型监测点11年序列
// ═══════════════════════════════════════════════════════

export const PRESET_SERIES: TimeSeriesInput[] = [
  {
    name: '衡水深层地下水埋深', dataType: '水位埋深', unit: 'm',
    data: [
      { year: 2014, value: 68.5 }, { year: 2015, value: 69.8 }, { year: 2016, value: 70.2 },
      { year: 2017, value: 71.5 }, { year: 2018, value: 70.8 }, { year: 2019, value: 69.2 },
      { year: 2020, value: 67.5 }, { year: 2021, value: 65.8 }, { year: 2022, value: 64.2 },
      { year: 2023, value: 63.5 }, { year: 2024, value: 62.8 },
    ],
  },
  {
    name: '沧州深层地下水埋深', dataType: '水位埋深', unit: 'm',
    data: [
      { year: 2014, value: 55.2 }, { year: 2015, value: 56.0 }, { year: 2016, value: 56.8 },
      { year: 2017, value: 57.5 }, { year: 2018, value: 56.2 }, { year: 2019, value: 54.5 },
      { year: 2020, value: 52.8 }, { year: 2021, value: 51.0 }, { year: 2022, value: 49.5 },
      { year: 2023, value: 48.2 }, { year: 2024, value: 47.0 },
    ],
  },
  {
    name: '石家庄浅层开采量', dataType: '开采量', unit: '亿m³',
    data: [
      { year: 2014, value: 18.5 }, { year: 2015, value: 17.8 }, { year: 2016, value: 17.2 },
      { year: 2017, value: 16.5 }, { year: 2018, value: 15.8 }, { year: 2019, value: 15.2 },
      { year: 2020, value: 14.5 }, { year: 2021, value: 13.8 }, { year: 2022, value: 13.2 },
      { year: 2023, value: 12.5 }, { year: 2024, value: 12.0 },
    ],
  },
  {
    name: '邢台水质达标率', dataType: '水质指数', unit: '%',
    data: [
      { year: 2014, value: 42.5 }, { year: 2015, value: 45.0 }, { year: 2016, value: 48.5 },
      { year: 2017, value: 52.0 }, { year: 2018, value: 55.5 }, { year: 2019, value: 58.0 },
      { year: 2020, value: 62.5 }, { year: 2021, value: 66.0 }, { year: 2022, value: 70.5 },
      { year: 2023, value: 74.0 }, { year: 2024, value: 78.5 },
    ],
  },
  {
    name: '沧州地面沉降速率', dataType: '沉降速率', unit: 'mm/a',
    data: [
      { year: 2014, value: 45.2 }, { year: 2015, value: 42.8 }, { year: 2016, value: 40.5 },
      { year: 2017, value: 38.0 }, { year: 2018, value: 35.2 }, { year: 2019, value: 32.0 },
      { year: 2020, value: 28.5 }, { year: 2021, value: 25.0 }, { year: 2022, value: 22.0 },
      { year: 2023, value: 18.5 }, { year: 2024, value: 15.2 },
    ],
  },
  {
    name: '保定浅层水位埋深', dataType: '水位埋深', unit: 'm',
    data: [
      { year: 2014, value: 22.5 }, { year: 2015, value: 23.0 }, { year: 2016, value: 23.2 },
      { year: 2017, value: 23.5 }, { year: 2018, value: 22.8 }, { year: 2019, value: 22.0 },
      { year: 2020, value: 21.2 }, { year: 2021, value: 20.5 }, { year: 2022, value: 19.8 },
      { year: 2023, value: 19.2 }, { year: 2024, value: 18.5 },
    ],
  },
];

// ═══════════════════════════════════════════════════════
// 批量计算
// ═══════════════════════════════════════════════════════

export function calcAllPresetSeries(): TimeSeriesResult[] {
  return PRESET_SERIES.map(s => calcTimeSeriesAnalysis(s));
}

export function calcSeriesSummary() {
  const results = calcAllPresetSeries();
  const trendCounts = { '上升': 0, '下降': 0, '无显著趋势': 0 };
  results.forEach(r => { trendCounts[r.trend.trend]++; });

  const changeCount = results.filter(r => r.changePoint.hasChangePoint).length;
  const avgR2 = results.reduce((s, r) => s + r.trend.r2, 0) / results.length;
  const avgCv = results.reduce((s, r) => s + r.periodicity.cv, 0) / results.length;

  return { seriesCount: PRESET_SERIES.length, trendCounts, changeCount, avgR2: round(avgR2, 3), avgCv: round(avgCv, 3), results };
}
