/**
 * B-30 地下水数据挖掘评价器引擎
 *
 * 四大分析模块：
 *  1. K-Means 聚类分析 — 监测井水质特征自动分组
 *  2. 主成分分析(PCA) — 多指标降维+贡献率
 *  3. 关联规则挖掘 — 水质指标间频繁项集与置信度
 *  4. 异常值检测 — Mahalanobis距离+箱线图法
 *
 * 算法均为纯JS实现，无第三方依赖
 */

// ═══════════════════════════════════════════════════════════════
// 类型定义
// ═══════════════════════════════════════════════════════════════

export interface WaterQualitySample {
  id: string;
  location: string;
  /** pH值 */
  pH: number;
  /** 总硬度 mg/L */
  totalHardness: number;
  /** 矿化度 mg/L */
  tds: number;
  /** 氯离子 mg/L */
  chloride: number;
  /** 硫酸根 mg/L */
  sulfate: number;
  /** 重碳酸根 mg/L */
  bicarbonate: number;
  /** 钠离子 mg/L */
  sodium: number;
  /** 钙离子 mg/L */
  calcium: number;
  /** 镁离子 mg/L */
  magnesium: number;
  /** 铁离子 mg/L */
  iron: number;
  /** 氟离子 mg/L */
  fluoride: number;
  /** 硝酸盐 mg/L */
  nitrate: number;
  /** 氨氮 mg/L */
  ammonia: number;
}

export interface KMeansResult {
  /** 聚类中心 */
  centroids: number[][];
  /** 每个样本的聚类标签 */
  labels: number[];
  /** 每簇样本数 */
  clusterSizes: number[];
  /** 簇内平方和 */
  inertia: number;
  /** 迭代次数 */
  iterations: number;
  /** 簇特征摘要 */
  clusterSummary: {
    clusterId: number;
    size: number;
    avgPH: number;
    avgTDS: number;
    avgHardness: number;
    avgChloride: number;
    avgSulfate: number;
    avgNitrate: number;
    avgFluoride: number;
    /** 水质类型判定 */
    waterType: string;
    /** 水质等级 */
    qualityGrade: string;
  }[];
}

export interface PCAResult {
  /** 主成分数量 */
  nComponents: number;
  /** 特征值 */
  eigenvalues: number[];
  /** 方差贡献率 */
  explainedVarianceRatio: number[];
  /** 累计贡献率 */
  cumulativeVariance: number[];
  /** 主成分载荷矩阵 */
  loadings: number[][];
  /** 主成分得分 */
  scores: number[][];
  /** 指标名称 */
  featureNames: string[];
  /** 主成分解释 */
  componentInterpretation: { component: string; topFeatures: { name: string; loading: number }[]; interpretation: string }[];
}

export interface AssociationRule {
  /** 前项 */
  antecedent: string[];
  /** 后项 */
  consequent: string[];
  /** 支持度 */
  support: number;
  /** 置信度 */
  confidence: number;
  /** 提升度 */
  lift: number;
  /** 规则描述 */
  description: string;
}

export interface AnomalyResult {
  /** 样本ID */
  sampleId: string;
  /** 位置 */
  location: string;
  /** Mahalanobis距离 */
  mahalanobisDist: number;
  /** 是否异常 */
  isAnomaly: boolean;
  /** 异常指标 */
  anomalousFeatures: { feature: string; value: number; mean: number; std: number; zScore: number }[];
  /** 异常等级 */
  anomalyLevel: 'normal' | 'mild' | 'moderate' | 'severe';
}

// ═══════════════════════════════════════════════════════════════
// 数学工具函数
// ═══════════════════════════════════════════════════════════════

function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function std(arr: number[]): number {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1));
}

function euclideanDist(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) {
    s += (a[i] - b[i]) ** 2;
  }
  return Math.sqrt(s);
}

/** Jacobi方法求实对称矩阵特征值和特征向量 */
function jacobiEigen(matrix: number[][], maxIter = 100, tol = 1e-10): {
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

const FEATURE_KEYS: (keyof WaterQualitySample)[] = [
  'pH', 'totalHardness', 'tds', 'chloride', 'sulfate',
  'bicarbonate', 'sodium', 'calcium', 'magnesium', 'iron', 'fluoride', 'nitrate', 'ammonia',
];

const FEATURE_NAMES = ['pH', '总硬度', '矿化度', 'Cl⁻', 'SO₄²⁻', 'HCO₃⁻', 'Na⁺', 'Ca²⁺', 'Mg²⁺', 'Fe', 'F⁻', 'NO₃⁻', 'NH₄⁺'];

function standardize(samples: WaterQualitySample[]): number[][] {
  const data = samples.map(s => FEATURE_KEYS.map(k => s[k] as number));
  const colMeans = FEATURE_KEYS.map((_, i) => mean(data.map(row => row[i])));
  const colStds = FEATURE_KEYS.map((_, i) => std(data.map(row => row[i])));
  return data.map(row => row.map((v, i) => (colStds[i] > 0 ? (v - colMeans[i]) / colStds[i] : 0)));
}

function classifyWaterType(s: { avgPH: number; avgTDS: number; avgChloride: number; avgSulfate: number; avgHardness: number }): string {
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

function classifyQualityGrade(s: { avgPH: number; avgTDS: number; avgNitrate: number; avgFluoride: number; avgHardness: number }): string {
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
function sampleToTransaction(s: WaterQualitySample): string[] {
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

export const PRESET_DATASETS: { name: string; description: string; samples: WaterQualitySample[] }[] = [
  {
    name: '太行山前平原区',
    description: '石家庄-保定-邢台山前冲洪积扇，浅层地下水，总体水质良好',
    samples: [
      { id: 'SJZ-01', location: '石家庄正定', pH: 7.2, totalHardness: 320, tds: 480, chloride: 85, sulfate: 120, bicarbonate: 280, sodium: 45, calcium: 88, magnesium: 25, iron: 0.15, fluoride: 0.3, nitrate: 8.5, ammonia: 0.05 },
      { id: 'SJZ-02', location: '石家庄鹿泉', pH: 7.5, totalHardness: 350, tds: 520, chloride: 95, sulfate: 135, bicarbonate: 310, sodium: 52, calcium: 95, magnesium: 28, iron: 0.18, fluoride: 0.35, nitrate: 12.0, ammonia: 0.08 },
      { id: 'BD-01', location: '保定满城', pH: 7.3, totalHardness: 300, tds: 450, chloride: 75, sulfate: 110, bicarbonate: 265, sodium: 40, calcium: 82, magnesium: 22, iron: 0.12, fluoride: 0.25, nitrate: 7.2, ammonia: 0.03 },
      { id: 'BD-02', location: '保定徐水', pH: 7.4, totalHardness: 330, tds: 490, chloride: 88, sulfate: 125, bicarbonate: 290, sodium: 48, calcium: 90, magnesium: 26, iron: 0.16, fluoride: 0.32, nitrate: 9.8, ammonia: 0.06 },
      { id: 'XT-01', location: '邢台沙河', pH: 7.1, totalHardness: 310, tds: 470, chloride: 80, sulfate: 118, bicarbonate: 275, sodium: 43, calcium: 85, magnesium: 24, iron: 0.14, fluoride: 0.28, nitrate: 8.0, ammonia: 0.04 },
      { id: 'XT-02', location: '邢台临城', pH: 7.6, totalHardness: 360, tds: 540, chloride: 100, sulfate: 140, bicarbonate: 320, sodium: 55, calcium: 98, magnesium: 30, iron: 0.20, fluoride: 0.38, nitrate: 13.5, ammonia: 0.10 },
      { id: 'HD-01', location: '邯郸武安', pH: 7.2, totalHardness: 340, tds: 510, chloride: 92, sulfate: 130, bicarbonate: 300, sodium: 50, calcium: 92, magnesium: 27, iron: 0.17, fluoride: 0.33, nitrate: 10.5, ammonia: 0.07 },
      { id: 'HD-02', location: '邯郸涉县', pH: 7.4, totalHardness: 325, tds: 485, chloride: 82, sulfate: 122, bicarbonate: 285, sodium: 46, calcium: 88, magnesium: 25, iron: 0.15, fluoride: 0.30, nitrate: 9.0, ammonia: 0.05 },
      { id: 'SJZ-03', location: '石家庄栾城', pH: 7.3, totalHardness: 345, tds: 505, chloride: 90, sulfate: 128, bicarbonate: 295, sodium: 49, calcium: 94, magnesium: 27, iron: 0.16, fluoride: 0.31, nitrate: 9.5, ammonia: 0.06 },
      { id: 'BD-03', location: '保定定州', pH: 7.5, totalHardness: 355, tds: 525, chloride: 96, sulfate: 138, bicarbonate: 305, sodium: 53, calcium: 96, magnesium: 29, iron: 0.19, fluoride: 0.36, nitrate: 11.5, ammonia: 0.09 },
    ],
  },
  {
    name: '中部冲积平原区',
    description: '衡水-沧州中部平原，深层地下水为主，矿化度偏高',
    samples: [
      { id: 'HS-01', location: '衡水桃城', pH: 7.8, totalHardness: 480, tds: 880, chloride: 220, sulfate: 180, bicarbonate: 350, sodium: 180, calcium: 110, magnesium: 45, iron: 0.35, fluoride: 0.8, nitrate: 5.5, ammonia: 0.15 },
      { id: 'HS-02', location: '衡水冀州', pH: 8.0, totalHardness: 520, tds: 950, chloride: 250, sulfate: 200, bicarbonate: 370, sodium: 200, calcium: 120, magnesium: 50, iron: 0.40, fluoride: 0.9, nitrate: 4.2, ammonia: 0.20 },
      { id: 'CZ-01', location: '沧州运河区', pH: 8.2, totalHardness: 580, tds: 1200, chloride: 320, sulfate: 240, bicarbonate: 400, sodium: 280, calcium: 130, magnesium: 58, iron: 0.50, fluoride: 1.2, nitrate: 3.0, ammonia: 0.25 },
      { id: 'CZ-02', location: '沧州青县', pH: 8.1, totalHardness: 550, tds: 1100, chloride: 290, sulfate: 220, bicarbonate: 380, sodium: 250, calcium: 125, magnesium: 55, iron: 0.45, fluoride: 1.1, nitrate: 3.5, ammonia: 0.22 },
      { id: 'HS-03', location: '衡水枣强', pH: 7.9, totalHardness: 500, tds: 920, chloride: 240, sulfate: 190, bicarbonate: 360, sodium: 190, calcium: 115, magnesium: 48, iron: 0.38, fluoride: 0.85, nitrate: 4.8, ammonia: 0.18 },
      { id: 'CZ-03', location: '沧州献县', pH: 8.3, totalHardness: 600, tds: 1250, chloride: 340, sulfate: 250, bicarbonate: 410, sodium: 300, calcium: 135, magnesium: 60, iron: 0.55, fluoride: 1.3, nitrate: 2.5, ammonia: 0.28 },
      { id: 'HS-04', location: '衡水武邑', pH: 7.7, totalHardness: 470, tds: 850, chloride: 210, sulfate: 170, bicarbonate: 340, sodium: 170, calcium: 105, magnesium: 42, iron: 0.32, fluoride: 0.75, nitrate: 6.0, ammonia: 0.14 },
      { id: 'CZ-04', location: '沧州河间', pH: 8.0, totalHardness: 540, tds: 1050, chloride: 280, sulfate: 210, bicarbonate: 375, sodium: 230, calcium: 122, magnesium: 53, iron: 0.42, fluoride: 1.0, nitrate: 3.8, ammonia: 0.21 },
      { id: 'HS-05', location: '衡水深州', pH: 7.8, totalHardness: 490, tds: 890, chloride: 225, sulfate: 185, bicarbonate: 355, sodium: 185, calcium: 112, magnesium: 46, iron: 0.36, fluoride: 0.82, nitrate: 5.2, ammonia: 0.16 },
      { id: 'CZ-05', location: '沧州任丘', pH: 8.1, totalHardness: 560, tds: 1150, chloride: 310, sulfate: 230, bicarbonate: 390, sodium: 265, calcium: 128, magnesium: 56, iron: 0.48, fluoride: 1.15, nitrate: 3.2, ammonia: 0.24 },
    ],
  },
  {
    name: '滨海平原区',
    description: '唐山-秦皇岛滨海地带，咸水入侵影响显著',
    samples: [
      { id: 'TS-01', location: '唐山丰南', pH: 7.5, totalHardness: 680, tds: 1800, chloride: 520, sulfate: 320, bicarbonate: 380, sodium: 450, calcium: 150, magnesium: 75, iron: 0.65, fluoride: 1.5, nitrate: 2.0, ammonia: 0.35 },
      { id: 'TS-02', location: '唐山滦南', pH: 7.6, totalHardness: 650, tds: 1700, chloride: 490, sulfate: 300, bicarbonate: 370, sodium: 420, calcium: 145, magnesium: 70, iron: 0.60, fluoride: 1.4, nitrate: 2.5, ammonia: 0.32 },
      { id: 'QHD-01', location: '秦皇岛昌黎', pH: 7.4, totalHardness: 520, tds: 980, chloride: 280, sulfate: 200, bicarbonate: 340, sodium: 220, calcium: 118, magnesium: 52, iron: 0.42, fluoride: 0.95, nitrate: 4.5, ammonia: 0.20 },
      { id: 'TS-03', location: '唐山海港', pH: 7.3, totalHardness: 720, tds: 2100, chloride: 620, sulfate: 360, bicarbonate: 400, sodium: 520, calcium: 160, magnesium: 82, iron: 0.70, fluoride: 1.7, nitrate: 1.5, ammonia: 0.40 },
      { id: 'QHD-02', location: '秦皇岛抚宁', pH: 7.2, totalHardness: 480, tds: 850, chloride: 230, sulfate: 180, bicarbonate: 320, sodium: 180, calcium: 108, magnesium: 48, iron: 0.35, fluoride: 0.75, nitrate: 6.5, ammonia: 0.16 },
      { id: 'TS-04', location: '唐山乐亭', pH: 7.5, totalHardness: 690, tds: 1850, chloride: 540, sulfate: 330, bicarbonate: 385, sodium: 460, calcium: 152, magnesium: 78, iron: 0.68, fluoride: 1.55, nitrate: 1.8, ammonia: 0.36 },
      { id: 'QHD-03', location: '秦皇岛卢龙', pH: 7.3, totalHardness: 510, tds: 920, chloride: 260, sulfate: 195, bicarbonate: 330, sodium: 210, calcium: 115, magnesium: 50, iron: 0.38, fluoride: 0.88, nitrate: 5.0, ammonia: 0.18 },
      { id: 'TS-05', location: '唐山曹妃甸', pH: 7.4, totalHardness: 750, tds: 2200, chloride: 650, sulfate: 380, bicarbonate: 410, sodium: 540, calcium: 165, magnesium: 85, iron: 0.72, fluoride: 1.8, nitrate: 1.2, ammonia: 0.42 },
      { id: 'QHD-04', location: '秦皇岛青龙', pH: 7.1, totalHardness: 460, tds: 820, chloride: 210, sulfate: 170, bicarbonate: 310, sodium: 165, calcium: 102, magnesium: 45, iron: 0.30, fluoride: 0.70, nitrate: 7.0, ammonia: 0.14 },
      { id: 'TS-06', location: '唐山迁安', pH: 7.2, totalHardness: 500, tds: 900, chloride: 240, sulfate: 190, bicarbonate: 325, sodium: 195, calcium: 112, magnesium: 50, iron: 0.36, fluoride: 0.82, nitrate: 5.5, ammonia: 0.17 },
    ],
  },
  {
    name: '坝上高原区',
    description: '张家口-承德坝上地区，高原内陆盆地地下水',
    samples: [
      { id: 'ZJK-01', location: '张北', pH: 7.8, totalHardness: 280, tds: 380, chloride: 55, sulfate: 90, bicarbonate: 230, sodium: 35, calcium: 72, magnesium: 20, iron: 0.08, fluoride: 0.20, nitrate: 5.5, ammonia: 0.02 },
      { id: 'ZJK-02', location: '康保', pH: 8.0, totalHardness: 260, tds: 360, chloride: 48, sulfate: 85, bicarbonate: 220, sodium: 32, calcium: 68, magnesium: 18, iron: 0.06, fluoride: 0.18, nitrate: 4.8, ammonia: 0.02 },
      { id: 'CD-01', location: '丰宁', pH: 7.6, totalHardness: 300, tds: 420, chloride: 62, sulfate: 100, bicarbonate: 250, sodium: 38, calcium: 78, magnesium: 22, iron: 0.10, fluoride: 0.22, nitrate: 6.2, ammonia: 0.03 },
      { id: 'ZJK-03', location: '沽源', pH: 7.9, totalHardness: 270, tds: 370, chloride: 52, sulfate: 88, bicarbonate: 225, sodium: 34, calcium: 70, magnesium: 19, iron: 0.07, fluoride: 0.19, nitrate: 5.0, ammonia: 0.02 },
      { id: 'CD-02', location: '围场', pH: 7.7, totalHardness: 290, tds: 400, chloride: 58, sulfate: 95, bicarbonate: 240, sodium: 36, calcium: 75, magnesium: 21, iron: 0.09, fluoride: 0.21, nitrate: 5.8, ammonia: 0.03 },
      { id: 'ZJK-04', location: '尚义', pH: 8.1, totalHardness: 250, tds: 350, chloride: 45, sulfate: 80, bicarbonate: 215, sodium: 30, calcium: 65, magnesium: 17, iron: 0.05, fluoride: 0.17, nitrate: 4.5, ammonia: 0.01 },
      { id: 'CD-03', location: '宽城', pH: 7.5, totalHardness: 310, tds: 430, chloride: 65, sulfate: 105, bicarbonate: 255, sodium: 40, calcium: 80, magnesium: 23, iron: 0.11, fluoride: 0.23, nitrate: 6.5, ammonia: 0.03 },
      { id: 'ZJK-05', location: '赤城', pH: 7.4, totalHardness: 320, tds: 440, chloride: 68, sulfate: 108, bicarbonate: 260, sodium: 42, calcium: 82, magnesium: 24, iron: 0.12, fluoride: 0.24, nitrate: 6.8, ammonia: 0.04 },
      { id: 'CD-04', location: '平泉', pH: 7.6, totalHardness: 295, tds: 410, chloride: 60, sulfate: 98, bicarbonate: 245, sodium: 37, calcium: 76, magnesium: 21, iron: 0.09, fluoride: 0.20, nitrate: 5.5, ammonia: 0.02 },
      { id: 'ZJK-06', location: '崇礼', pH: 7.8, totalHardness: 285, tds: 390, chloride: 56, sulfate: 92, bicarbonate: 235, sodium: 36, calcium: 74, magnesium: 20, iron: 0.08, fluoride: 0.21, nitrate: 5.2, ammonia: 0.02 },
    ],
  },
  {
    name: '燕山丘陵区',
    description: '承德-张家口燕山山地丘陵，基岩裂隙水',
    samples: [
      { id: 'CD-05', location: '承德市区', pH: 7.3, totalHardness: 350, tds: 480, chloride: 70, sulfate: 130, bicarbonate: 270, sodium: 42, calcium: 90, magnesium: 28, iron: 0.18, fluoride: 0.30, nitrate: 8.2, ammonia: 0.05 },
      { id: 'ZJK-07', location: '怀来', pH: 7.5, totalHardness: 380, tds: 520, chloride: 82, sulfate: 145, bicarbonate: 290, sodium: 48, calcium: 98, magnesium: 32, iron: 0.22, fluoride: 0.35, nitrate: 10.5, ammonia: 0.07 },
      { id: 'CD-06', location: '兴隆', pH: 7.2, totalHardness: 340, tds: 470, chloride: 68, sulfate: 125, bicarbonate: 265, sodium: 40, calcium: 88, magnesium: 26, iron: 0.16, fluoride: 0.28, nitrate: 7.8, ammonia: 0.04 },
      { id: 'ZJK-08', location: '涿鹿', pH: 7.4, totalHardness: 360, tds: 490, chloride: 75, sulfate: 135, bicarbonate: 278, sodium: 44, calcium: 92, magnesium: 30, iron: 0.19, fluoride: 0.32, nitrate: 9.0, ammonia: 0.06 },
      { id: 'CD-07', location: '滦平', pH: 7.3, totalHardness: 345, tds: 475, chloride: 72, sulfate: 128, bicarbonate: 270, sodium: 43, calcium: 89, magnesium: 27, iron: 0.17, fluoride: 0.29, nitrate: 8.5, ammonia: 0.05 },
      { id: 'ZJK-09', location: '蔚县', pH: 7.6, totalHardness: 390, tds: 530, chloride: 85, sulfate: 150, bicarbonate: 295, sodium: 50, calcium: 100, magnesium: 33, iron: 0.23, fluoride: 0.36, nitrate: 11.0, ammonia: 0.08 },
      { id: 'CD-08', location: '隆化', pH: 7.1, totalHardness: 330, tds: 460, chloride: 65, sulfate: 120, bicarbonate: 260, sodium: 38, calcium: 86, magnesium: 25, iron: 0.15, fluoride: 0.27, nitrate: 7.5, ammonia: 0.04 },
      { id: 'ZJK-10', location: '阳原', pH: 7.5, totalHardness: 370, tds: 505, chloride: 78, sulfate: 140, bicarbonate: 282, sodium: 46, calcium: 95, magnesium: 31, iron: 0.20, fluoride: 0.33, nitrate: 9.5, ammonia: 0.06 },
      { id: 'CD-09', location: '承德双桥', pH: 7.4, totalHardness: 355, tds: 485, chloride: 74, sulfate: 132, bicarbonate: 275, sodium: 44, calcium: 91, magnesium: 29, iron: 0.18, fluoride: 0.31, nitrate: 8.8, ammonia: 0.05 },
      { id: 'ZJK-11', location: '宣化', pH: 7.2, totalHardness: 365, tds: 495, chloride: 76, sulfate: 138, bicarbonate: 280, sodium: 45, calcium: 93, magnesium: 30, iron: 0.19, fluoride: 0.32, nitrate: 9.2, ammonia: 0.06 },
    ],
  },
  {
    name: '黑龙港流域',
    description: '邢台-邯郸-衡水交界，典型缺水地区，水质复杂',
    samples: [
      { id: 'XT-03', location: '邢台平乡', pH: 7.9, totalHardness: 560, tds: 1100, chloride: 310, sulfate: 250, bicarbonate: 360, sodium: 280, calcium: 130, magnesium: 55, iron: 0.48, fluoride: 1.1, nitrate: 3.8, ammonia: 0.25 },
      { id: 'HD-03', location: '邯郸大名', pH: 8.0, totalHardness: 590, tds: 1180, chloride: 340, sulfate: 270, bicarbonate: 380, sodium: 310, calcium: 138, magnesium: 58, iron: 0.52, fluoride: 1.2, nitrate: 3.2, ammonia: 0.28 },
      { id: 'HS-06', location: '衡水故城', pH: 7.8, totalHardness: 530, tds: 1020, chloride: 290, sulfate: 230, bicarbonate: 350, sodium: 250, calcium: 122, magnesium: 52, iron: 0.44, fluoride: 1.0, nitrate: 4.2, ammonia: 0.22 },
      { id: 'XT-04', location: '邢台广宗', pH: 7.7, totalHardness: 510, tds: 980, chloride: 275, sulfate: 220, bicarbonate: 345, sodium: 240, calcium: 118, magnesium: 50, iron: 0.42, fluoride: 0.95, nitrate: 4.5, ammonia: 0.20 },
      { id: 'HD-04', location: '邯郸魏县', pH: 8.1, totalHardness: 600, tds: 1200, chloride: 350, sulfate: 280, bicarbonate: 390, sodium: 320, calcium: 140, magnesium: 60, iron: 0.55, fluoride: 1.25, nitrate: 3.0, ammonia: 0.30 },
      { id: 'XT-05', location: '邢台威县', pH: 7.6, totalHardness: 520, tds: 1000, chloride: 285, sulfate: 225, bicarbonate: 348, sodium: 245, calcium: 120, magnesium: 51, iron: 0.43, fluoride: 0.98, nitrate: 4.0, ammonia: 0.21 },
      { id: 'HS-07', location: '衡水景县', pH: 7.9, totalHardness: 540, tds: 1050, chloride: 300, sulfate: 240, bicarbonate: 355, sodium: 260, calcium: 125, magnesium: 53, iron: 0.45, fluoride: 1.05, nitrate: 3.6, ammonia: 0.23 },
      { id: 'HD-05', location: '邯郸馆陶', pH: 8.2, totalHardness: 610, tds: 1250, chloride: 360, sulfate: 290, bicarbonate: 395, sodium: 330, calcium: 142, magnesium: 62, iron: 0.58, fluoride: 1.3, nitrate: 2.8, ammonia: 0.32 },
      { id: 'XT-06', location: '邢台清河', pH: 7.8, totalHardness: 550, tds: 1080, chloride: 305, sulfate: 245, bicarbonate: 358, sodium: 270, calcium: 128, magnesium: 54, iron: 0.46, fluoride: 1.08, nitrate: 3.5, ammonia: 0.24 },
      { id: 'HD-06', location: '邯郸丘县', pH: 7.7, totalHardness: 525, tds: 1010, chloride: 288, sulfate: 232, bicarbonate: 350, sodium: 248, calcium: 121, magnesium: 51, iron: 0.43, fluoride: 0.97, nitrate: 4.1, ammonia: 0.21 },
    ],
  },
];
