/**
 * 水质数据挖掘 (G-06) — 异常检测算法
 * 拆分自 dataMiningAlgorithms.ts
 */

import type { AnomalyResult, WaterQualitySample } from './dataMiningTypes';
import { FEATURE_KEYS, FEATURE_NAMES, jacobiEigen, mean, std } from './dataMiningUtils';
export function calcAnomalies(samples: WaterQualitySample[]): AnomalyResult[] {
  const n = samples.length;
  const dim = FEATURE_KEYS.length;

  // 计算均值和标准差
  const data = samples.map(s => FEATURE_KEYS.map(k => s[k] as number));
  const colMeans = FEATURE_KEYS.map((_, i) => mean(data.map(row => row[i])));
  const colStds = FEATURE_KEYS.map((_, i) => std(data.map(row => row[i])));

  // 标准化数据
  const standardized = data.map(row => row.map((v, i) => (colStds[i] > 0 ? (v - colMeans[i]) / colStds[i] : 0)));

  // 协方差矩阵
  const cov: number[][] = Array.from({ length: dim }, () => new Array(dim).fill(0));
  for (let i = 0; i < dim; i++) {
    for (let j = 0; j < dim; j++) {
      let s = 0;
      for (let k = 0; k < n; k++) {
        s += standardized[k][i] * standardized[k][j];
      }
      cov[i][j] = s / (n - 1);
    }
  }

  // 协方差矩阵的逆（用Jacobi特征分解）
  const { eigenvalues, eigenvectors } = jacobiEigen(cov, 200, 1e-10);

  // 构建逆矩阵: V * diag(1/λ) * V^T
  const invCov: number[][] = Array.from({ length: dim }, () => new Array(dim).fill(0));
  for (let i = 0; i < dim; i++) {
    for (let j = 0; j < dim; j++) {
      let s = 0;
      for (let k = 0; k < dim; k++) {
        if (Math.abs(eigenvalues[k]) > 1e-10) {
          s += eigenvectors[i][k] * (1 / eigenvalues[k]) * eigenvectors[j][k];
        }
      }
      invCov[i][j] = s;
    }
  }

  // 卡方分布临界值 (自由度=dim, α=0.05)
  // 近似公式: χ²(p, 0.05) ≈ p + sqrt(2p) * 1.6449 + (2/3)(1.6449² - 1)
  const chiSquareCritical = dim + Math.sqrt(2 * dim) * 1.6449 + (2 / 3) * (1.6449 ** 2 - 1);

  const results: AnomalyResult[] = samples.map((sample, idx) => {
    // Mahalanobis距离
    const diff = standardized[idx];
    let mahal = 0;
    for (let i = 0; i < dim; i++) {
      for (let j = 0; j < dim; j++) {
        mahal += diff[i] * invCov[i][j] * diff[j];
      }
    }
    mahal = Math.sqrt(Math.max(0, mahal));

    // 检测异常指标 (|z-score| > 2)
    const anomalousFeatures: { feature: string; value: number; mean: number; std: number; zScore: number }[] = [];
    for (let i = 0; i < dim; i++) {
      const zScore = colStds[i] > 0 ? (data[idx][i] - colMeans[i]) / colStds[i] : 0;
      if (Math.abs(zScore) > 2) {
        anomalousFeatures.push({
          feature: FEATURE_NAMES[i],
          value: data[idx][i],
          mean: colMeans[i],
          std: colStds[i],
          zScore,
        });
      }
    }

    const isAnomaly = mahal > Math.sqrt(chiSquareCritical) || anomalousFeatures.length >= 2;

    let anomalyLevel: 'normal' | 'mild' | 'moderate' | 'severe' = 'normal';
    if (isAnomaly) {
      if (mahal > Math.sqrt(chiSquareCritical) * 1.5 || anomalousFeatures.length >= 4) {
        anomalyLevel = 'severe';
      } else if (mahal > Math.sqrt(chiSquareCritical) * 1.2 || anomalousFeatures.length >= 3) {
        anomalyLevel = 'moderate';
      } else {
        anomalyLevel = 'mild';
      }
    }

    return {
      sampleId: sample.id,
      location: sample.location,
      mahalanobisDist: mahal,
      isAnomaly,
      anomalousFeatures,
      anomalyLevel,
    };
  });

  return results.sort((a, b) => b.mahalanobisDist - a.mahalanobisDist);
}
