/**
 * 水质数据挖掘 — 内部工具（自 dataMiningCalculator 拆分）
 */
import type { WaterQualitySample } from './dataMiningTypes';

export function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function std(arr: number[]): number {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1));
}

export function euclideanDist(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) {
    s += (a[i] - b[i]) ** 2;
  }
  return Math.sqrt(s);
}

/** Jacobi方法求实对称矩阵特征值和特征向量 */
export function jacobiEigen(matrix: number[][], maxIter = 100, tol = 1e-10): {
  eigenvalues: number[];
  eigenvectors: number[][];
} {
  const n = matrix.length;
  // 复制矩阵
  const A = matrix.map(row => [...row]);
  const V: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
  );

  for (let iter = 0; iter < maxIter; iter++) {
    // 找最大非对角元素
    let maxVal = 0;
    let p = 0, q = 0;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (Math.abs(A[i][j]) > maxVal) {
          maxVal = Math.abs(A[i][j]);
          p = i;
          q = j;
        }
      }
    }
    if (maxVal < tol) break;

    const app = A[p][p];
    const aqq = A[q][q];
    const apq = A[p][q];

    const theta = (aqq - app) / (2 * apq);
    let t: number;
    if (Math.abs(theta) > 1e10) {
      t = 0.5 / theta;
    } else {
      t = Math.sign(theta) / (Math.abs(theta) + Math.sqrt(theta ** 2 + 1));
    }

    const c = 1 / Math.sqrt(t * t + 1);
    const s = t * c;

    // 更新A
    for (let i = 0; i < n; i++) {
      const aip = A[i][p];
      const aiq = A[i][q];
      A[i][p] = c * aip - s * aiq;
      A[i][q] = s * aip + c * aiq;
    }
    for (let j = 0; j < n; j++) {
      const apj = A[p][j];
      const aqj = A[q][j];
      A[p][j] = c * apj - s * aqj;
      A[q][j] = s * apj + c * aqj;
    }

    // 更新V
    for (let i = 0; i < n; i++) {
      const vip = V[i][p];
      const viq = V[i][q];
      V[i][p] = c * vip - s * viq;
      V[i][q] = s * vip + c * viq;
    }
  }

  const eigenvalues = A.map((row, i) => row[i]);
  return { eigenvalues, eigenvectors: V };
}

// ═══════════════════════════════════════════════════════════════
// 1. K-Means 聚类分析
// ═══════════════════════════════════════════════════════════════

export const FEATURE_KEYS: (keyof WaterQualitySample)[] = [
  'pH', 'totalHardness', 'tds', 'chloride', 'sulfate',
  'bicarbonate', 'sodium', 'calcium', 'magnesium', 'iron', 'fluoride', 'nitrate', 'ammonia',
];

export const FEATURE_NAMES = ['pH', '总硬度', '矿化度', 'Cl⁻', 'SO₄²⁻', 'HCO₃⁻', 'Na⁺', 'Ca²⁺', 'Mg²⁺', 'Fe', 'F⁻', 'NO₃⁻', 'NH₄⁺'];

export function standardize(samples: WaterQualitySample[]): number[][] {
  const data = samples.map(s => FEATURE_KEYS.map(k => s[k] as number));
  const colMeans = FEATURE_KEYS.map((_, i) => mean(data.map(row => row[i])));
  const colStds = FEATURE_KEYS.map((_, i) => std(data.map(row => row[i])));
  return data.map(row => row.map((v, i) => (colStds[i] > 0 ? (v - colMeans[i]) / colStds[i] : 0)));
}

export function classifyWaterType(s: { avgPH: number; avgTDS: number; avgChloride: number; avgSulfate: number; avgHardness: number }): string {
  const { avgTDS, avgChloride, avgSulfate, avgHardness } = s;
  if (avgTDS < 500) {
    if (avgHardness > 200) return '低矿化度硬水';
    return '低矿化度淡水';
  }
  if (avgTDS < 1000) {
    if (avgChloride > 150) return '中矿化度氯化物型';
    if (avgSulfate > 150) return '中矿化度硫酸盐型';
    return '中矿化度重碳酸盐型';
  }
  if (avgTDS < 3000) {
    if (avgChloride > avgSulfate) return '高矿化度氯化物型';
    return '高矿化度硫酸盐型';
  }
  return '极高矿化度咸水';
}

export function classifyQualityGrade(s: { avgPH: number; avgTDS: number; avgNitrate: number; avgFluoride: number; avgHardness: number }): string {
  const { avgPH, avgTDS, avgNitrate, avgFluoride, avgHardness } = s;
  let score = 0;
  if (avgPH < 6.5 || avgPH > 8.5) score += 2;
  else if (avgPH < 6.8 || avgPH > 8.2) score += 1;
  if (avgTDS > 1000) score += 2;
  else if (avgTDS > 500) score += 1;
  if (avgNitrate > 20) score += 2;
  else if (avgNitrate > 10) score += 1;
  if (avgFluoride > 1.0) score += 2;
  else if (avgFluoride > 0.5) score += 1;
  if (avgHardness > 450) score += 2;
  else if (avgHardness > 300) score += 1;
  if (score <= 1) return 'Ⅰ类（优良）';
  if (score <= 3) return 'Ⅱ类（良好）';
  if (score <= 5) return 'Ⅲ类（较好）';
  if (score <= 7) return 'Ⅳ类（较差）';
  return 'Ⅴ类（极差）';
}

export function sampleToTransaction(s: WaterQualitySample): string[] {
  const items: string[] = [];
  if (s.pH < 6.5) items.push('偏酸性pH');
  else if (s.pH > 8.5) items.push('偏碱性pH');
  else items.push('中性pH');

  if (s.tds > 1000) items.push('高矿化度');
  else if (s.tds > 500) items.push('中矿化度');
  else items.push('低矿化度');

  if (s.totalHardness > 450) items.push('高硬度');
  else if (s.totalHardness > 150) items.push('中硬度');
  else items.push('低硬度');

  if (s.chloride > 250) items.push('高氯');
  else if (s.chloride > 100) items.push('中氯');

  if (s.sulfate > 250) items.push('高硫酸盐');
  else if (s.sulfate > 100) items.push('中硫酸盐');

  if (s.nitrate > 20) items.push('高硝酸盐');
  else if (s.nitrate > 10) items.push('中硝酸盐');

  if (s.fluoride > 1.0) items.push('高氟');
  else if (s.fluoride > 0.5) items.push('中氟');

  if (s.iron > 0.3) items.push('高铁');
  if (s.ammonia > 0.5) items.push('高氨氮');

  if (s.bicarbonate > s.chloride && s.bicarbonate > s.sulfate) items.push('HCO₃⁻主导');
  else if (s.chloride > s.sulfate) items.push('Cl⁻主导');
  else items.push('SO₄²⁻主导');

  return items;
}
