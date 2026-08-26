/**
 * 空间统计分析 — 核心算法
 *  Moran I全局自相关 / LISA局部自相关 / 变异函数拟合 / 交叉验证(IDW留一)
 */

import type { SpatialPoint, MoranIInput, MoranIResult, LocalMoranResult, VariogramInput, VariogramPoint, VariogramResult, CrossValidationResult } from './spatialStatsTypes';
import { dist, mean, round, normalCDF, std } from './spatialStatsUtils';

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

