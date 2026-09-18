/**
 * 水质数据挖掘 (G-06) — K-Means 聚类算法
 * 拆分自 dataMiningAlgorithms.ts
 */

import type { KMeansResult, WaterQualitySample } from './dataMiningTypes';
import {
  classifyQualityGrade,
  classifyWaterType,
  euclideanDist,
  FEATURE_KEYS,
  mean,
  standardize,
} from './dataMiningUtils';
export function calcKMeans(samples: WaterQualitySample[], k = 3, maxIter = 100): KMeansResult {
  const data = standardize(samples);
  const n = data.length;

  // K-Means++ 初始化
  const centroids: number[][] = [];
  centroids.push([...data[Math.floor(Math.random() * n)]]);

  for (let c = 1; c < k; c++) {
    const distances = data.map(p => {
      let minDist = Infinity;
      for (const cen of centroids) {
        const d = euclideanDist(p, cen);
        if (d < minDist) minDist = d;
      }
      return minDist ** 2;
    });
    const totalDist = distances.reduce((a, b) => a + b, 0);
    if (totalDist === 0) {
      centroids.push([...data[Math.floor(Math.random() * n)]]);
    } else {
      let r = Math.random() * totalDist;
      let idx = 0;
      for (let i = 0; i < n; i++) {
        r -= distances[i];
        if (r <= 0) { idx = i; break; }
      }
      centroids.push([...data[idx]]);
    }
  }

  const labels = new Array(n).fill(0);
  let iterations = 0;

  for (let iter = 0; iter < maxIter; iter++) {
    iterations = iter + 1;
    let changed = false;

    // 分配
    for (let i = 0; i < n; i++) {
      let minDist = Infinity;
      let bestCluster = 0;
      for (let c = 0; c < k; c++) {
        const d = euclideanDist(data[i], centroids[c]);
        if (d < minDist) {
          minDist = d;
          bestCluster = c;
        }
      }
      if (labels[i] !== bestCluster) {
        labels[i] = bestCluster;
        changed = true;
      }
    }

    // 更新中心
    for (let c = 0; c < k; c++) {
      const clusterPoints = data.filter((_, i) => labels[i] === c);
      if (clusterPoints.length > 0) {
        centroids[c] = FEATURE_KEYS.map((_, j) => mean(clusterPoints.map(p => p[j])));
      }
    }

    if (!changed) break;
  }

  // 簇内平方和
  let inertia = 0;
  for (let i = 0; i < n; i++) {
    inertia += euclideanDist(data[i], centroids[labels[i]]) ** 2;
  }

  const clusterSizes = Array.from({ length: k }, (_, c) => labels.filter(l => l === c).length);

  // 簇特征摘要（用原始值）
  const clusterSummary = Array.from({ length: k }, (_, c) => {
    const clusterSamples = samples.filter((_, i) => labels[i] === c);
    const avgPH = mean(clusterSamples.map(s => s.pH));
    const avgTDS = mean(clusterSamples.map(s => s.tds));
    const avgHardness = mean(clusterSamples.map(s => s.totalHardness));
    const avgChloride = mean(clusterSamples.map(s => s.chloride));
    const avgSulfate = mean(clusterSamples.map(s => s.sulfate));
    const avgNitrate = mean(clusterSamples.map(s => s.nitrate));
    const avgFluoride = mean(clusterSamples.map(s => s.fluoride));
    return {
      clusterId: c,
      size: clusterSamples.length,
      avgPH,
      avgTDS,
      avgHardness,
      avgChloride,
      avgSulfate,
      avgNitrate,
      avgFluoride,
      waterType: classifyWaterType({ avgPH, avgTDS, avgChloride, avgSulfate, avgHardness }),
      qualityGrade: classifyQualityGrade({ avgPH, avgTDS, avgNitrate, avgFluoride, avgHardness }),
    };
  });

  return { centroids, labels, clusterSizes, inertia, iterations, clusterSummary };
}
