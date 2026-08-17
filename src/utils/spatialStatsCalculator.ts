/**
 * B-29 地下水空间统计分析引擎
 *
 * 功能：
 *  1. 全局Moran's I 计算（空间自相关程度：聚集/随机/离散）
 *  2. 局部Moran's I / LISA（热点/冷点识别）
 *  3. 半变异函数拟合（球状/指数/高斯模型，块金/基台/变程）
 *  4. 克里金插值精度评估（交叉验证RMSE/MAE/ME）
 *  5. 预设数据：河北省6个区域空间监测网格
 */

// ═══════════════════════════════════════════════════════
// 类型定义
// ═══════════════════════════════════════════════════════

export interface SpatialPoint {
  /** 点名称 */
  name: string;
  /** X坐标 (km) */
  x: number;
  /** Y坐标 (km) */
  y: number;
  /** 属性值 */
  value: number;
}

export interface MoranIInput {
  /** 空间点集 */
  points: SpatialPoint[];
  /** 空间权重矩阵类型 */
  weightType: 'inverse' | 'distance' | 'binary';
  /** 二值矩阵的距离阈值 (km) */
  distanceBand: number;
}

export interface MoranIResult {
  /** 全局Moran's I */
  moranI: number;
  /** 期望值 E[I] = -1/(n-1) */
  expectedI: number;
  /** 方差 Var[I] */
  variance: number;
  /** Z得分 */
  zScore: number;
  /** p值（近似） */
  pValue: number;
  /** 空间分布模式 */
  pattern: '聚集' | '随机' | '离散';
  /** 显著性 */
  significant: boolean;
  /** 说明 */
  note: string;
}

export interface LocalMoranResult {
  /** 点名称 */
  name: string;
  /** 局部Moran's I_i */
  localI: number;
  /** Z_i 得分 */
  zScore: number;
  /** 象限分类（HH/LL/HL/LH） */
  quadrant: string;
  /** 是否显著 */
  significant: boolean;
  /** 点坐标 */
  x: number;
  y: number;
  /** 值 */
  value: number;
}

export interface VariogramInput {
  /** 空间点集 */
  points: SpatialPoint[];
  /** 模型类型 */
  model: 'spherical' | 'exponential' | 'gaussian';
  /** 滞后组数 */
  lagCount: number;
}

export interface VariogramPoint {
  /** 滞后距离 */
  lag: number;
  /** 实验半变异值 */
  gamma: number;
  /** 点对数 */
  pairs: number;
}

export interface VariogramResult {
  /** 实验半变异函数点 */
  experimental: VariogramPoint[];
  /** 块金值 C0 */
  nugget: number;
  /** 基台值 C0+C */
  sill: number;
  /** 结构方差 C */
  structureVariance: number;
  /** 变程 a (km) */
  range: number;
  /** 块金效应比 C0/(C0+C) */
  nuggetRatio: number;
  /** 空间自相关强度评价 */
  spatialCorrelation: string;
  /** 拟合模型 */
  model: string;
  /** 理论半变异函数值 */
  theoretical: Array<{ lag: number; gamma: number }>;
  /** 说明 */
  note: string;
}

export interface CrossValidationResult {
  /** 交叉验证点 */
  points: Array<{ name: string; actual: number; predicted: number; error: number; stdError: number }>;
  /** 平均误差 ME */
  me: number;
  /** 均方根误差 RMSE */
  rmse: number;
  /** 平均绝对误差 MAE */
  mae: number;
  /** 标准化均方根误差 */
  standardizedRMSE: number;
  /** 插值精度等级 */
  accuracy: string;
  /** 说明 */
  note: string;
}

// ═══════════════════════════════════════════════════════
// 辅助函数
// ═══════════════════════════════════════════════════════

function dist(p1: SpatialPoint, p2: SpatialPoint): number {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

function mean(arr: number[]): number {
  return arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

function round(v: number, d = 4): number {
  const f = Math.pow(10, d);
  return Math.round(v * f) / f;
}

// 标准正态CDF
function normalCDF(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  if (z > 0) p = 1 - p;
  return 1 - p;
}

// ═══════════════════════════════════════════════════════
// 1. 全局Moran's I
// ═══════════════════════════════════════════════════════

export function calcMoranI(input: MoranIInput): MoranIResult {
  const { points, weightType, distanceBand } = input;
  const n = points.length;
  const values = points.map(p => p.value);
  const m = mean(values);

  // 构建空间权重矩阵
  const W: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  let sumW = 0;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const d = dist(points[i], points[j]);
      if (weightType === 'inverse') {
        W[i][j] = d > 0 ? 1 / d : 0;
      } else if (weightType === 'distance') {
        W[i][j] = d > 0 ? 1 / (d * d) : 0;
      } else {
        W[i][j] = d <= distanceBand ? 1 : 0;
      }
      sumW += W[i][j];
    }
  }

  // Moran's I = (n / S0) × ΣΣ wij(xi - x̄)(xj - x̄) / Σ(xi - x̄)²
  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < n; i++) {
    denominator += (values[i] - m) ** 2;
    for (let j = 0; j < n; j++) {
      numerator += W[i][j] * (values[i] - m) * (values[j] - m);
    }
  }

  const moranI = sumW > 0 && denominator > 0 ? (n / sumW) * (numerator / denominator) : 0;
  const expectedI = -1 / (n - 1);

  // 方差近似（正态假设下）
  const s1 = 2 * sumW; // 简化
  const s2 = 4 * (sumW ** 2) / n; // 简化
  const variance = (n * n * s1 - n * s2 + 3 * sumW * sumW) / (sumW * sumW * (n * n - 1)) - expectedI * expectedI;
  const zScore = variance > 0 ? (moranI - expectedI) / Math.sqrt(variance) : 0;
  const pValue = Math.min(1, Math.max(0, 2 * (1 - normalCDF(Math.abs(zScore))))); // clamp [0,1] 防浮点越界
  const significant = Math.abs(zScore) > 1.96;

  let pattern: '聚集' | '随机' | '离散';
  if (significant && moranI > expectedI) pattern = '聚集';
  else if (significant && moranI < expectedI) pattern = '离散';
  else pattern = '随机';

  const note = `全局Moran's I=${round(moranI, 4)}，E[I]=${round(expectedI, 4)}，Z=${round(zScore, 3)}，p=${round(pValue, 4)}。`
    + ` 空间分布模式：${pattern}（${significant ? 'α=0.05显著' : '不显著'}）。`
    + (pattern === '聚集' ? ' 高值和低值在空间上呈聚集分布，存在空间自相关。' : pattern === '离散' ? ' 高低值交替分布，存在空间负相关。' : ' 空间分布随机，无显著自相关。');

  return {
    moranI: round(moranI, 4),
    expectedI: round(expectedI, 4),
    variance: round(variance, 6),
    zScore: round(zScore, 3),
    pValue: round(pValue, 4),
    pattern, significant, note,
  };
}

// ═══════════════════════════════════════════════════════
// 2. 局部Moran's I (LISA)
// ═══════════════════════════════════════════════════════

export function calcLocalMoran(input: MoranIInput): LocalMoranResult[] {
  const { points, weightType, distanceBand } = input;
  const n = points.length;
  const values = points.map(p => p.value);
  const m = mean(values);
  const s2 = values.reduce((sum, v) => sum + (v - m) ** 2, 0) / n;

  const results: LocalMoranResult[] = [];

  for (let i = 0; i < n; i++) {
    let wiSum = 0;
    let weightedVal = 0;
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const d = dist(points[i], points[j]);
      let w = 0;
      if (weightType === 'inverse') w = d > 0 ? 1 / d : 0;
      else if (weightType === 'distance') w = d > 0 ? 1 / (d * d) : 0;
      else w = d <= distanceBand ? 1 : 0;
      wiSum += w;
      weightedVal += w * (values[j] - m);
    }
    const localI = s2 > 0 && wiSum > 0 ? (values[i] - m) * weightedVal / s2 : 0;
    const varianceI = s2 > 0 ? wiSum * wiSum / (2 * n) : 0;
    const zScore = varianceI > 0 ? localI / Math.sqrt(varianceI) : 0;
    const significant = Math.abs(zScore) > 1.96;

    // 象限分类
    const zi = values[i] > m ? 1 : -1; // 自身高/低
    const lagZi = weightedVal > 0 ? 1 : -1; // 邻居高/低
    let quadrant: string;
    if (zi > 0 && lagZi > 0) quadrant = 'HH（高-高聚集）';
    else if (zi < 0 && lagZi < 0) quadrant = 'LL（低-低聚集）';
    else if (zi > 0 && lagZi < 0) quadrant = 'HL（高-低异常）';
    else quadrant = 'LH（低-高异常）';

    results.push({
      name: points[i].name,
      localI: round(localI, 4),
      zScore: round(zScore, 3),
      quadrant, significant,
      x: points[i].x, y: points[i].y, value: points[i].value,
    });
  }

  return results;
}

// ═══════════════════════════════════════════════════════
// 3. 半变异函数拟合
// ═══════════════════════════════════════════════════════

export function calcVariogram(input: VariogramInput): VariogramResult {
  const { points, model, lagCount } = input;
  const n = points.length;

  // 计算所有点对的距离和半变异值
  const pairs: Array<{ d: number; gamma: number }> = [];
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = dist(points[i], points[j]);
      const gamma = 0.5 * (points[i].value - points[j].value) ** 2;
      pairs.push({ d, gamma });
    }
  }

  // 最大距离
  const maxDist = Math.max(...pairs.map(p => p.d));
  const lagSize = maxDist / lagCount;

  // 分组计算实验半变异函数
  const experimental: VariogramPoint[] = [];
  for (let lag = 0; lag < lagCount; lag++) {
    const lower = lag * lagSize;
    const upper = (lag + 1) * lagSize;
    const lagPairs = pairs.filter(p => p.d >= lower && p.d < upper);
    if (lagPairs.length > 0) {
      experimental.push({
        lag: round((lower + upper) / 2, 2),
        gamma: round(mean(lagPairs.map(p => p.gamma)), 4),
        pairs: lagPairs.length,
      });
    }
  }

  // 拟合模型（最小二乘近似）
  const obsGamma = experimental.map(e => e.gamma);
  const _obsLag = experimental.map(e => e.lag);
  const maxGamma = Math.max(...obsGamma);
  const minGamma = Math.min(...obsGamma.filter(g => g > 0));

  // 估算参数
  const nugget = Math.max(0, minGamma * 0.3);
  const sill = maxGamma;
  const structureVariance = sill - nugget;

  // 变程估算：半变异函数达到基台95%时的距离
  const targetGamma = nugget + 0.95 * structureVariance;
  let range = maxDist * 0.5;
  for (const e of experimental) {
    if (e.gamma >= targetGamma) { range = e.lag; break; }
  }

  const nuggetRatio = sill > 0 ? nugget / sill : 0;

  let spatialCorrelation: string;
  if (nuggetRatio < 0.25) spatialCorrelation = '强空间自相关';
  else if (nuggetRatio < 0.5) spatialCorrelation = '中等空间自相关';
  else if (nuggetRatio < 0.75) spatialCorrelation = '弱空间自相关';
  else spatialCorrelation = '极弱空间自相关';

  // 理论模型曲线
  const modelNames = { spherical: '球状模型', exponential: '指数模型', gaussian: '高斯模型' };
  const theoretical: Array<{ lag: number; gamma: number }> = [];
  for (let h = 0; h <= maxDist; h += maxDist / 50) {
    let gamma: number;
    const hr = h / range;
    if (model === 'spherical') {
      gamma = h >= range ? sill : nugget + structureVariance * (1.5 * hr - 0.5 * hr * hr * hr);
    } else if (model === 'exponential') {
      gamma = nugget + structureVariance * (1 - Math.exp(-3 * hr));
    } else {
      gamma = nugget + structureVariance * (1 - Math.exp(-3 * hr * hr));
    }
    theoretical.push({ lag: round(h, 2), gamma: round(gamma, 4) });
  }

  const note = `${modelNames[model]}拟合：块金C0=${round(nugget, 4)}，基台=${round(sill, 4)}，变程a=${round(range, 2)}km。`
    + ` 块金效应比=${round(nuggetRatio, 3)}（${spatialCorrelation}）。`
    + (nuggetRatio < 0.5 ? ' 空间结构明显，适合克里金插值。' : ' 空间结构弱，插值效果有限，需增加采样密度。');

  return {
    experimental, nugget: round(nugget, 4), sill: round(sill, 4),
    structureVariance: round(structureVariance, 4), range: round(range, 2),
    nuggetRatio: round(nuggetRatio, 3), spatialCorrelation,
    model: modelNames[model], theoretical, note,
  };
}

// ═══════════════════════════════════════════════════════
// 4. 克里金交叉验证
// ═══════════════════════════════════════════════════════

export function calcCrossValidation(points: SpatialPoint[]): CrossValidationResult {
  const n = points.length;
  const cvPoints: Array<{ name: string; actual: number; predicted: number; error: number; stdError: number }> = [];

  // 留一交叉验证（简化IDW插值）
  for (let i = 0; i < n; i++) {
    const testPoint = points[i];
    const trainPoints = points.filter((_, idx) => idx !== i);

    // IDW插值
    let weightedSum = 0;
    let weightSum = 0;
    for (const tp of trainPoints) {
      const d = dist(testPoint, tp);
      const w = d > 0 ? 1 / (d * d) : 0;
      weightedSum += w * tp.value;
      weightSum += w;
    }
    const predicted = weightSum > 0 ? weightedSum / weightSum : mean(trainPoints.map(p => p.value));
    const error = testPoint.value - predicted;
    const stdError = error;

    cvPoints.push({
      name: testPoint.name,
      actual: round(testPoint.value, 3),
      predicted: round(predicted, 3),
      error: round(error, 3),
      stdError: round(stdError, 3),
    });
  }

  const errors = cvPoints.map(p => p.error);
  const me = mean(errors);
  const rmse = Math.sqrt(mean(errors.map(e => e * e)));
  const mae = mean(errors.map(e => Math.abs(e)));
  const errorStd = std(errors);
  const standardizedRMSE = errorStd > 0 ? rmse / errorStd : 0;

  let accuracy: string;
  if (rmse < 0.1 * mean(points.map(p => p.value))) accuracy = '优';
  else if (rmse < 0.2 * mean(points.map(p => p.value))) accuracy = '良';
  else if (rmse < 0.3 * mean(points.map(p => p.value))) accuracy = '合格';
  else accuracy = '差';

  const note = `交叉验证(留一法)：ME=${round(me, 4)}，RMSE=${round(rmse, 4)}，MAE=${round(mae, 4)}。`
    + ` 插值精度等级：${accuracy}。`
    + (Math.abs(me) > 0.1 * mae ? ' 存在系统偏差，建议校正。' : ' 无明显系统偏差。');

  return { points: cvPoints, me: round(me, 4), rmse: round(rmse, 4), mae: round(mae, 4), standardizedRMSE: round(standardizedRMSE, 4), accuracy, note };
}

function std(arr: number[]): number {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1));
}

// ═══════════════════════════════════════════════════════
// 预设数据：河北省6个区域监测网格
// ═══════════════════════════════════════════════════════

export const PRESET_REGIONS: Array<{ name: string; points: SpatialPoint[] }> = [
  {
    name: '太行山前平原（水位埋深）',
    points: [
      { name: '保定', x: 115.5, y: 38.9, value: 22.5 },
      { name: '定州', x: 115.0, y: 38.5, value: 23.0 },
      { name: '石家庄', x: 114.5, y: 38.1, value: 23.5 },
      { name: '正定', x: 114.6, y: 38.2, value: 24.0 },
      { name: '栾城', x: 114.7, y: 37.9, value: 25.0 },
      { name: '邢台', x: 114.5, y: 37.1, value: 25.5 },
      { name: '邯郸', x: 114.5, y: 36.6, value: 26.0 },
      { name: '涿州', x: 115.8, y: 39.5, value: 20.5 },
      { name: '望都', x: 115.2, y: 38.7, value: 22.8 },
      { name: '赵县', x: 114.8, y: 37.8, value: 24.5 },
    ],
  },
  {
    name: '河北中部平原（TDS）',
    points: [
      { name: '衡水', x: 115.7, y: 37.7, value: 850 },
      { name: '武邑', x: 115.9, y: 37.8, value: 900 },
      { name: '深州', x: 115.6, y: 38.0, value: 780 },
      { name: '冀州', x: 115.6, y: 37.6, value: 920 },
      { name: '辛集', x: 115.3, y: 37.9, value: 750 },
      { name: '南宫', x: 115.4, y: 37.4, value: 820 },
      { name: '新河', x: 115.3, y: 37.5, value: 880 },
      { name: '景县', x: 116.3, y: 37.7, value: 950 },
      { name: '阜城', x: 116.1, y: 37.9, value: 870 },
      { name: '武强', x: 116.0, y: 38.1, value: 830 },
    ],
  },
  {
    name: '沧州滨海区（Cl⁻）',
    points: [
      { name: '沧州', x: 116.9, y: 38.3, value: 320 },
      { name: '青县', x: 116.8, y: 38.6, value: 280 },
      { name: '黄骅', x: 117.3, y: 38.4, value: 450 },
      { name: '海兴', x: 117.5, y: 38.2, value: 520 },
      { name: '盐山', x: 117.2, y: 38.1, value: 380 },
      { name: '孟村', x: 117.1, y: 38.1, value: 350 },
      { name: '南皮', x: 116.7, y: 38.0, value: 290 },
      { name: '东光', x: 116.5, y: 37.9, value: 250 },
      { name: '吴桥', x: 116.5, y: 37.7, value: 220 },
      { name: '泊头', x: 116.6, y: 38.1, value: 300 },
    ],
  },
  {
    name: '燕山山区（泉流量）',
    points: [
      { name: '承德', x: 117.9, y: 40.9, value: 0.85 },
      { name: '兴隆', x: 117.5, y: 40.4, value: 0.72 },
      { name: '宽城', x: 118.5, y: 40.6, value: 0.90 },
      { name: '平泉', x: 118.7, y: 41.0, value: 0.78 },
      { name: '滦平', x: 117.3, y: 40.9, value: 0.68 },
      { name: '丰宁', x: 116.6, y: 41.2, value: 0.55 },
      { name: '围场', x: 117.7, y: 41.9, value: 0.45 },
      { name: '隆化', x: 117.7, y: 41.3, value: 0.62 },
      { name: '承德县', x: 118.2, y: 40.8, value: 0.80 },
      { name: '滦县', x: 118.7, y: 39.8, value: 1.20 },
    ],
  },
  {
    name: '冀东平原（开采量）',
    points: [
      { name: '唐山', x: 118.2, y: 39.6, value: 12.5 },
      { name: '丰润', x: 118.1, y: 39.8, value: 8.5 },
      { name: '丰南', x: 118.1, y: 39.5, value: 10.2 },
      { name: '滦南', x: 118.7, y: 39.5, value: 9.8 },
      { name: '滦县', x: 118.7, y: 39.8, value: 7.5 },
      { name: '乐亭', x: 118.9, y: 39.4, value: 6.8 },
      { name: '遵化', x: 117.9, y: 40.2, value: 5.5 },
      { name: '迁西', x: 118.3, y: 40.1, value: 4.2 },
      { name: '玉田', x: 117.9, y: 39.9, value: 7.8 },
      { name: '唐海', x: 118.5, y: 39.3, value: 8.5 },
    ],
  },
  {
    name: '张家口坝上（水位埋深）',
    points: [
      { name: '张家口', x: 114.9, y: 40.8, value: 15.5 },
      { name: '张北', x: 114.7, y: 41.2, value: 12.0 },
      { name: '康保', x: 114.6, y: 41.9, value: 10.5 },
      { name: '沽源', x: 115.7, y: 41.7, value: 11.0 },
      { name: '尚义', x: 113.9, y: 41.1, value: 13.5 },
      { name: '万全', x: 114.7, y: 40.8, value: 16.0 },
      { name: '崇礼', x: 115.3, y: 40.9, value: 14.5 },
      { name: '赤城', x: 115.8, y: 40.9, value: 13.0 },
      { name: '怀安', x: 114.4, y: 40.7, value: 15.0 },
      { name: '阳原', x: 114.2, y: 40.1, value: 17.0 },
    ],
  },
];
