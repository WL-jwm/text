/**
 * 水质数据挖掘 (G-06) — PCA 主成分分析算法
 * 拆分自 dataMiningAlgorithms.ts
 */

import type { PCAResult, WaterQualitySample } from './dataMiningTypes';
import { FEATURE_KEYS, FEATURE_NAMES, jacobiEigen, standardize } from './dataMiningUtils';
export function calcPCA(samples: WaterQualitySample[], nComponents?: number): PCAResult {
  const data = standardize(samples);
  const n = data.length;
  const dim = FEATURE_KEYS.length;
  const nComp = nComponents || Math.min(dim, Math.min(n, dim));

  // 协方差矩阵
  const cov: number[][] = Array.from({ length: dim }, () => new Array(dim).fill(0));
  for (let i = 0; i < dim; i++) {
    for (let j = 0; j < dim; j++) {
      let s = 0;
      for (let k = 0; k < n; k++) {
        s += data[k][i] * data[k][j];
      }
      cov[i][j] = s / (n - 1);
    }
  }

  // Jacobi求特征值和特征向量
  const { eigenvalues: allEigenvalues, eigenvectors } = jacobiEigen(cov, 200, 1e-10);

  // 按特征值降序排序
  const indices = allEigenvalues.map((_, i) => i).sort((a, b) => allEigenvalues[b] - allEigenvalues[a]);
  const sortedEigenvalues = indices.map(i => allEigenvalues[i]);
  const sortedEigenvectors = indices.map(i => eigenvectors.map(row => row[i]));

  const selectedEigenvalues = sortedEigenvalues.slice(0, nComp);
  const totalVar = sortedEigenvalues.reduce((a, b) => a + Math.max(0, b), 0);
  const explainedVarianceRatio = selectedEigenvalues.map(v => (v > 0 ? v / totalVar : 0));

  const cumulativeVariance: number[] = [];
  let cumSum = 0;
  for (const r of explainedVarianceRatio) {
    cumSum += r;
    cumulativeVariance.push(cumSum);
  }

  // 载荷矩阵 (dim × nComp)
  const loadings: number[][] = Array.from({ length: dim }, (_, i) =>
    sortedEigenvectors.slice(0, nComp).map(vec => vec[i])
  );

  // 得分矩阵 (n × nComp)
  const scores: number[][] = data.map(row =>
    sortedEigenvectors.slice(0, nComp).map(vec => {
      let s = 0;
      for (let i = 0; i < dim; i++) s += row[i] * vec[i];
      return s;
    })
  );

  // 主成分解释
  const componentInterpretation = Array.from({ length: nComp }, (_, c) => {
    const featureLoadings = loadings.map((row, i) => ({ name: FEATURE_NAMES[i], loading: row[c] }));
    const sorted = [...featureLoadings].sort((a, b) => Math.abs(b.loading) - Math.abs(a.loading));
    const topFeatures = sorted.slice(0, 3);
    const topNames = topFeatures.map(f => f.name).join('、');
    const interpretation = `主成分${c + 1}主要由${topNames}决定，方差贡献率${(explainedVarianceRatio[c] * 100).toFixed(1)}%`;
    return { component: `PC${c + 1}`, topFeatures, interpretation };
  });

  return {
    nComponents: nComp,
    eigenvalues: selectedEigenvalues,
    explainedVarianceRatio,
    cumulativeVariance,
    loadings,
    scores,
    featureNames: FEATURE_NAMES,
    componentInterpretation,
  };
}
