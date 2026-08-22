/**
 * 水质数据挖掘 — 四大算法（自 dataMiningCalculator 拆分）
 */
import type {
  WaterQualitySample, KMeansResult, PCAResult,
  AssociationRule, AnomalyResult,
} from './dataMiningTypes';
import {
  mean, std, euclideanDist, jacobiEigen,
  FEATURE_KEYS, FEATURE_NAMES, standardize,
  classifyWaterType, classifyQualityGrade,
  sampleToTransaction,
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

// ═══════════════════════════════════════════════════════════════
// 2. 主成分分析 (PCA)
// ═══════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════
// 3. 关联规则挖掘 (简化Apriori)
// ═══════════════════════════════════════════════════════════════

interface Itemset {
  items: string[];
  count: number;
}

/** 将水质样本离散化为事务项集 */


export function calcAssociationRules(samples: WaterQualitySample[], minSupport = 0.1, minConfidence = 0.5): AssociationRule[] {
  const transactions = samples.map(sampleToTransaction);
  const n = transactions.length;
  const minSupportCount = Math.ceil(minSupport * n);

  // 生成1-项集
  const allItems = new Set<string>();
  transactions.forEach(t => t.forEach(item => allItems.add(item)));

  // 频繁1-项集
  let frequentItemsets: Itemset[] = [];
  const level1: Itemset[] = [];
  for (const item of allItems) {
    const count = transactions.filter(t => t.includes(item)).length;
    if (count >= minSupportCount) {
      level1.push({ items: [item], count });
    }
  }
  frequentItemsets = [...level1];

  // 生成2-项集
  const level2: Itemset[] = [];
  for (let i = 0; i < level1.length; i++) {
    for (let j = i + 1; j < level1.length; j++) {
      const pair = [level1[i].items[0], level1[j].items[0]].sort();
      const count = transactions.filter(t => pair.every(item => t.includes(item))).length;
      if (count >= minSupportCount) {
        level2.push({ items: pair, count });
      }
    }
  }
  frequentItemsets = frequentItemsets.concat(level2);

  // 生成3-项集
  const level3: Itemset[] = [];
  for (let i = 0; i < level2.length; i++) {
    for (let j = i + 1; j < level2.length; j++) {
      const a = level2[i].items;
      const b = level2[j].items;
      // 检查是否可以合并(前n-1项相同)
      if (a[0] === b[0] && a[1] !== b[1]) {
        const triple = [a[0], a[1], b[1]].sort();
        const count = transactions.filter(t => triple.every(item => t.includes(item))).length;
        if (count >= minSupportCount && !level3.some(l => l.items.join(',') === triple.join(','))) {
          level3.push({ items: triple, count });
        }
      }
    }
  }
  frequentItemsets = frequentItemsets.concat(level3);

  // 生成关联规则
  const rules: AssociationRule[] = [];
  for (const itemset of frequentItemsets) {
    if (itemset.items.length < 2) continue;
    const support = itemset.count / n;

    // 生成所有可能的前项→后项
    for (let mask = 1; mask < (1 << itemset.items.length) - 1; mask++) {
      const antecedent: string[] = [];
      const consequent: string[] = [];
      for (let bit = 0; bit < itemset.items.length; bit++) {
        if (mask & (1 << bit)) antecedent.push(itemset.items[bit]);
        else consequent.push(itemset.items[bit]);
      }

      const antecedentCount = transactions.filter(t => antecedent.every(item => t.includes(item))).length;
      if (antecedentCount === 0) continue;

      const confidence = itemset.count / antecedentCount;
      if (confidence < minConfidence) continue;

      // 提升度 = 置信度 / 后项支持度
      const consequentCount = transactions.filter(t => consequent.every(item => t.includes(item))).length;
      const consequentSupport = consequentCount / n;
      const lift = consequentSupport > 0 ? confidence / consequentSupport : 0;

      rules.push({
        antecedent,
        consequent,
        support,
        confidence,
        lift,
        description: `${antecedent.join(' + ')} → ${consequent.join(' + ')}`,
      });
    }
  }

  // 按提升度降序排序
  rules.sort((a, b) => b.lift - a.lift);
  return rules.slice(0, 20);
}

// ═══════════════════════════════════════════════════════════════
// 4. 异常值检测
// ═══════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════
// 预设数据集 — 河北省6区域地下水水质样本
// ═══════════════════════════════════════════════════════════════

