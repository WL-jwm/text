/**
 * B-33 地下水监测网优化评估器 — 计算引擎
 *
 * 核心算法：
 *  1. 监测井密度分析 — 面积/含水层类型计算合理井数，对比实际密度
 *  2. 空间覆盖评价 — Voronoi/泰森多边形控制面积，识别覆盖空白
 *  3. 监测频率优化 — 基于时间序列自相关分析推荐最优采样频率
 *  4. 监测有效性评价 — 信息熵+冗余度分析，识别信息重叠
 */

// ── 类型定义 ──

export interface MonitoringWell {
  id: string;
  name: string;
  row: number;       // 网格行号
  col: number;       // 网格列号
  x: number;         // 实际x坐标 (m)
  y: number;         // 实际y坐标 (m)
  aquiferType: 'shallow' | 'deep' | 'karst';
  frequency: number;  // 当前监测频率 (次/年)
  startDate: number;  // 监测起始年份
  type: 'national' | 'provincial' | 'municipal' | 'enterprise';
}

export interface MonitoringArea {
  id: string;
  name: string;
  area: number;            // 面积 (km²)
  aquiferType: 'shallow' | 'deep' | 'karst';
  cellSize: number;        // 网格间距 (m)
  rows: number;
  cols: number;
  wells: MonitoringWell[];
  // 监测井水位历史数据（用于频率优化）
  wellHistory?: Record<string, number[]>; // wellId -> 月度水位序列
}

export interface DensityResult {
  area: number;              // 面积 (km²)
  wellCount: number;         // 实际井数
  requiredCount: number;     // 推荐井数
  actualDensity: number;     // 实际密度 (口/km²)
  requiredDensity: number;   // 推荐密度 (口/km²)
  coverageRatio: number;     // 覆盖率 (%)
  gap: number;               // 缺口 (口)
  status: 'excellent' | 'adequate' | 'insufficient' | 'severe';
  message: string;
}

export interface CoverageResult {
  totalArea: number;          // 总面积 (km²)
  coveredArea: number;        // 覆盖面积 (km²)
  uncoveredArea: number;      // 未覆盖面积 (km²)
  coveragePercent: number;    // 覆盖率 (%)
  avgControlArea: number;     // 平均控制面积 (km²/口)
  maxControlArea: number;     // 最大控制面积 (km²/口)
  minControlArea: number;     // 最小控制面积 (km²/口)
  blankZones: { row: number; col: number; x: number; y: number; distance: number }[]; // 覆盖空白
  uniformityIndex: number;    // 均匀度指数 (0~1)
}

export interface FrequencyResult {
  wellId: string;
  wellName: string;
  currentFrequency: number;    // 当前频率 (次/年)
  optimalFrequency: number;    // 推荐频率 (次/年)
  autocorrelationLag1: number; // 一阶自相关系数
  redundancyIndex: number;     // 冗余指数 (0~1)
  nuggetRatio: number;         // 块金效应比
  recommendation: string;
  status: 'optimal' | 'over-sampled' | 'under-sampled';
}

export interface EffectivenessResult {
  totalWells: number;
  totalEntropy: number;        // 总信息熵
  avgEntropy: number;          // 平均信息熵
  redundancyPairs: { wellA: string; wellB: string; correlation: number; redundancy: number }[];
  redundantWells: string[];    // 冗余井列表
  essentialWells: string[];    // 关键井列表
  efficiencyScore: number;     // 监测效率评分 (0~100)
  recommendation: string;
}

export interface ComprehensiveResult {
  density: DensityResult;
  coverage: CoverageResult;
  frequency: FrequencyResult[];
  effectiveness: EffectivenessResult;
  overallScore: number;        // 综合评分 (0~100)
  grade: string;               // 等级 (优/良/中/差)
  suggestions: string[];
}

// ── 1. 监测井密度分析 ──

/**
 * 基于面积和含水层类型计算推荐监测井密度
 *
 * 参考标准：
 * - 平原区潜水: 1口/50-100 km²
 * - 平原区承压水: 1口/100-200 km²
 * - 岩溶区: 1口/30-80 km²
 * - 山区裂隙水: 1口/80-150 km²
 */
export function calcMonitoringDensity(area: MonitoringArea): DensityResult {
  const { area: km2, aquiferType, wells } = area;

  // 推荐密度标准 (口/km²)
  const densityStandards: Record<string, { min: number; max: number; recommended: number }> = {
    shallow: { min: 1 / 100, max: 1 / 50, recommended: 1 / 75 },   // 平原潜水
    deep: { min: 1 / 200, max: 1 / 100, recommended: 1 / 150 },     // 平原承压水
    karst: { min: 1 / 80, max: 1 / 30, recommended: 1 / 50 },       // 岩溶区
  };

  const standard = densityStandards[aquiferType] ?? densityStandards.shallow;
  const requiredCount = Math.ceil(km2 * standard.recommended);
  const actualCount = wells.length;
  const actualDensity = actualCount / km2;
  const requiredDensity = standard.recommended;
  const coverageRatio = Math.min(100, (actualDensity / requiredDensity) * 100);
  const gap = Math.max(0, requiredCount - actualCount);

  let status: DensityResult['status'];
  let message: string;

  if (coverageRatio >= 120) {
    status = 'excellent';
    message = `监测密度充分，覆盖率达${coverageRatio.toFixed(0)}%，超出推荐标准`;
  } else if (coverageRatio >= 80) {
    status = 'adequate';
    message = `监测密度基本满足要求，覆盖率达${coverageRatio.toFixed(0)}%`;
  } else if (coverageRatio >= 50) {
    status = 'insufficient';
    message = `监测密度不足，覆盖率仅${coverageRatio.toFixed(0)}%，建议增补${gap}口监测井`;
  } else {
    status = 'severe';
    message = `监测密度严重不足，覆盖率仅${coverageRatio.toFixed(0)}%，急需增补${gap}口监测井`;
  }

  return {
    area: km2,
    wellCount: actualCount,
    requiredCount,
    actualDensity,
    requiredDensity,
    coverageRatio,
    gap,
    status,
    message,
  };
}

// ── 2. 空间覆盖评价（泰森多边形法）──

/**
 * 基于最近邻距离的空间覆盖评价
 * 每个网格单元归属最近的监测井，计算控制面积
 */
export function calcSpatialCoverage(area: MonitoringArea): CoverageResult {
  const { rows, cols, cellSize, wells } = area;
  const totalCells = rows * cols;
  const cellArea = (cellSize * cellSize) / 1_000_000; // km²

  // 每口井的控制面积
  const controlCounts = new Map<string, number>();
  wells.forEach(w => controlCounts.set(w.id, 0));

  const blankZones: { row: number; col: number; x: number; y: number; distance: number }[] = [];
  const maxAcceptableDistance = Math.max(rows, cols) * 0.3; // 最大可接受距离（网格单位）

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let minDist = Infinity;
      let nearestWell: MonitoringWell | null = null;

      for (const well of wells) {
        const dist = Math.sqrt((i - well.row) ** 2 + (j - well.col) ** 2);
        if (dist < minDist) {
          minDist = dist;
          nearestWell = well;
        }
      }

      if (nearestWell) {
        const count = controlCounts.get(nearestWell.id) ?? 0;
        controlCounts.set(nearestWell.id, count + 1);

        // 如果距离过大，标记为覆盖空白
        if (minDist > maxAcceptableDistance) {
          blankZones.push({
            row: i,
            col: j,
            x: j * cellSize,
            y: i * cellSize,
            distance: minDist,
          });
        }
      }
    }
  }

  // 计算控制面积统计
  const controlAreas = wells.map(w => (controlCounts.get(w.id) ?? 0) * cellArea);
  const totalArea = totalCells * cellArea;
  const coveredArea = totalArea - blankZones.length * cellArea;
  const uncoveredArea = blankZones.length * cellArea;
  const coveragePercent = (coveredArea / totalArea) * 100;

  const validAreas = controlAreas.filter(a => a > 0);
  const avgControlArea = validAreas.length > 0
    ? validAreas.reduce((s, a) => s + a, 0) / validAreas.length
    : 0;
  const maxControlArea = validAreas.length > 0 ? Math.max(...validAreas) : 0;
  const minControlArea = validAreas.length > 0 ? Math.min(...validAreas) : 0;

  // 均匀度指数 (Gini系数的补)
  let uniformityIndex = 0;
  if (validAreas.length > 1) {
    const sorted = [...validAreas].sort((a, b) => a - b);
    const n = sorted.length;
    const sum = sorted.reduce((s, a) => s + a, 0);
    if (sum > 0) {
      let cumulativeSum = 0;
      for (let k = 0; k < n; k++) {
        cumulativeSum += (k + 1) * sorted[k];
      }
      const gini = (2 * cumulativeSum) / (n * sum) - (n + 1) / n;
      uniformityIndex = 1 - gini;
    }
  }

  return {
    totalArea,
    coveredArea,
    uncoveredArea,
    coveragePercent,
    avgControlArea,
    maxControlArea,
    minControlArea,
    blankZones: blankZones.slice(0, 50), // 限制返回数量
    uniformityIndex,
  };
}

// ── 3. 监测频率优化 ──

/**
 * 基于时间序列自相关分析推荐最优监测频率
 *
 * 原理：
 * - 计算一阶自相关系数 r1
 * - r1 高 → 连续观测相关性高 → 可降低频率
 * - r1 低 → 变化快速 → 需提高频率
 *
 * 推荐频率 = round(12 * (1 - r1²) * adjustment)
 */
export function calcOptimalFrequency(
  wellId: string,
  wellName: string,
  history: number[],
  currentFrequency: number,
): FrequencyResult {
  const n = history.length;

  if (n < 4) {
    return {
      wellId,
      wellName,
      currentFrequency,
      optimalFrequency: currentFrequency,
      autocorrelationLag1: 0,
      redundancyIndex: 0,
      nuggetRatio: 0,
      recommendation: '历史数据不足，建议维持当前监测频率',
      status: 'optimal',
    };
  }

  // 一阶自相关系数
  const mean = history.reduce((s, v) => s + v, 0) / n;
  let numerator = 0, denominator = 0;
  for (let i = 0; i < n - 1; i++) {
    numerator += (history[i] - mean) * (history[i + 1] - mean);
  }
  for (let i = 0; i < n; i++) {
    denominator += (history[i] - mean) ** 2;
  }
  const r1 = denominator > 0 ? numerator / denominator : 0;

  // 块金效应比（短距离变异占总变异的比例）
  const variance = denominator / n;
  const nugget = variance * (1 - r1 * r1);
  const nuggetRatio = variance > 0 ? nugget / variance : 0;

  // 冗余指数
  const redundancyIndex = Math.max(0, Math.min(1, r1 * r1));

  // 推荐频率
  // r1²高 → 冗余高 → 可降低频率
  // r1²低 → 信息量大 → 需保持或提高频率
  const informationContent = 1 - r1 * r1;
  let optimalFreq = Math.round(12 * informationContent);
  optimalFreq = Math.max(2, Math.min(24, optimalFreq)); // 2~24次/年

  let status: FrequencyResult['status'];
  let recommendation: string;

  const ratio = optimalFreq / currentFrequency;
  if (ratio > 1.3) {
    status = 'under-sampled';
    recommendation = `监测频率偏低，当前${currentFrequency}次/年，建议提高至${optimalFreq}次/年（数据变化较快）`;
  } else if (ratio < 0.7) {
    status = 'over-sampled';
    recommendation = `监测频率偏高，当前${currentFrequency}次/年，可降至${optimalFreq}次/年（数据变化平缓，存在冗余）`;
  } else {
    status = 'optimal';
    recommendation = `监测频率合理，当前${currentFrequency}次/年，推荐${optimalFreq}次/年`;
  }

  return {
    wellId,
    wellName,
    currentFrequency,
    optimalFrequency: optimalFreq,
    autocorrelationLag1: r1,
    redundancyIndex,
    nuggetRatio,
    recommendation,
    status,
  };
}

// ── 4. 监测有效性评价 ──

/**
 * 基于信息熵和冗余度分析评价监测网有效性
 *
 * 信息熵：H = -Σ p(x) * log2(p(x))
 * 互信息（冗余）：I(X;Y) = H(X) + H(Y) - H(X,Y)
 */
export function calcMonitoringEffectiveness(
  wells: MonitoringWell[],
  wellHistory: Record<string, number[]>,
): EffectivenessResult {
  const n = wells.length;

  if (n < 2 || Object.keys(wellHistory).length < 2) {
    return {
      totalWells: n,
      totalEntropy: 0,
      avgEntropy: 0,
      redundancyPairs: [],
      redundantWells: [],
      essentialWells: wells.map(w => w.id),
      efficiencyScore: 50,
      recommendation: '监测井数量不足，无法进行有效性分析',
    };
  }

  // 计算每口井的信息熵
  const entropies: Record<string, number> = {};
  for (const well of wells) {
    const history = wellHistory[well.id];
    if (history && history.length > 3) {
      entropies[well.id] = calcEntropy(history);
    }
  }

  const entropyValues = Object.values(entropies);
  const totalEntropy = entropyValues.reduce((s, h) => s + h, 0);
  const avgEntropy = entropyValues.length > 0 ? totalEntropy / entropyValues.length : 0;

  // 计算井间相关性（皮尔逊相关系数）
  const redundancyPairs: { wellA: string; wellB: string; correlation: number; redundancy: number }[] = [];
  const wellCorrelations: Record<string, number> = {}; // 每口井的最大相关性

  for (let i = 0; i < wells.length; i++) {
    for (let j = i + 1; j < wells.length; j++) {
      const histA = wellHistory[wells[i].id];
      const histB = wellHistory[wells[j].id];

      if (histA && histB && histA.length > 3 && histB.length > 3) {
        const minLen = Math.min(histA.length, histB.length);
        const corr = calcPearsonCorrelation(
          histA.slice(0, minLen),
          histB.slice(0, minLen),
        );

        const redundancy = Math.max(0, corr * corr); // R² 作为冗余度

        if (Math.abs(corr) > 0.3) {
          redundancyPairs.push({
            wellA: wells[i].id,
            wellB: wells[j].id,
            correlation: corr,
            redundancy,
          });
        }

        // 记录每口井的最大相关性
        const absCorr = Math.abs(corr);
        if (absCorr > (wellCorrelations[wells[i].id] ?? 0)) {
          wellCorrelations[wells[i].id] = absCorr;
        }
        if (absCorr > (wellCorrelations[wells[j].id] ?? 0)) {
          wellCorrelations[wells[j].id] = absCorr;
        }
      }
    }
  }

  // 按冗余度排序
  redundancyPairs.sort((a, b) => b.redundancy - a.redundancy);

  // 识别冗余井和关键井
  const redundantWells: string[] = [];
  const essentialWells: string[] = [];

  for (const well of wells) {
    const maxCorr = wellCorrelations[well.id] ?? 0;
    if (maxCorr > 0.85) {
      redundantWells.push(well.id);
    } else if (maxCorr < 0.5) {
      essentialWells.push(well.id);
    }
  }

  // 效率评分
  const redundancyRatio = redundantWells.length / n;
  const uniquenessRatio = essentialWells.length / n;
  const efficiencyScore = Math.round(
    (1 - redundancyRatio) * 50 + uniquenessRatio * 30 + Math.min(20, avgEntropy * 5),
  );

  let recommendation: string;
  if (efficiencyScore >= 80) {
    recommendation = '监测网效率优秀，各井信息独立性强，冗余度低';
  } else if (efficiencyScore >= 60) {
    recommendation = '监测网效率良好，部分井存在信息冗余，可考虑优化布局';
  } else if (efficiencyScore >= 40) {
    recommendation = '监测网效率一般，存在较多冗余井，建议调整监测井布局或减少冗余监测';
  } else {
    recommendation = '监测网效率较低，冗余严重，建议重新规划监测网，增加独立信息源';
  }

  return {
    totalWells: n,
    totalEntropy,
    avgEntropy,
    redundancyPairs: redundancyPairs.slice(0, 20),
    redundantWells,
    essentialWells,
    efficiencyScore,
    recommendation,
  };
}

// ── 综合评价 ──

export function calcComprehensiveAssessment(area: MonitoringArea): ComprehensiveResult {
  const density = calcMonitoringDensity(area);
  const coverage = calcSpatialCoverage(area);

  const frequencyResults: FrequencyResult[] = area.wells.map(well => {
    const history = area.wellHistory?.[well.id] ?? generateSyntheticHistory(well);
    return calcOptimalFrequency(well.id, well.name, history, well.frequency);
  });

  const wellHistory: Record<string, number[]> = {};
  for (const well of area.wells) {
    wellHistory[well.id] = area.wellHistory?.[well.id] ?? generateSyntheticHistory(well);
  }
  const effectiveness = calcMonitoringEffectiveness(area.wells, wellHistory);

  // 综合评分
  const densityScore = Math.min(100, density.coverageRatio);
  const coverageScore = coverage.coveragePercent;
  const freqScore = (frequencyResults.filter(f => f.status === 'optimal').length / Math.max(1, frequencyResults.length)) * 100;
  const effScore = effectiveness.efficiencyScore;

  const overallScore = Math.round(densityScore * 0.3 + coverageScore * 0.3 + freqScore * 0.2 + effScore * 0.2);

  let grade: string;
  if (overallScore >= 80) grade = '优';
  else if (overallScore >= 65) grade = '良';
  else if (overallScore >= 50) grade = '中';
  else grade = '差';

  // 建议
  const suggestions: string[] = [];
  if (density.gap > 0) {
    suggestions.push(`增补${density.gap}口监测井，使密度达到推荐标准（${density.requiredCount}口）`);
  }
  if (coverage.blankZones.length > 10) {
    suggestions.push(`覆盖空白区共${coverage.blankZones.length}个网格，建议在空白区中心增设监测井`);
  }
  if (coverage.uniformityIndex < 0.6) {
    suggestions.push('监测井空间分布不均匀，建议优化布局使控制面积更均衡');
  }
  const underSampled = frequencyResults.filter(f => f.status === 'under-sampled');
  if (underSampled.length > 0) {
    suggestions.push(`${underSampled.length}口井监测频率偏低，建议提高采样频率`);
  }
  const overSampled = frequencyResults.filter(f => f.status === 'over-sampled');
  if (overSampled.length > 0) {
    suggestions.push(`${overSampled.length}口井监测频率偏高，可适当降低以节约成本`);
  }
  if (effectiveness.redundantWells.length > 0) {
    suggestions.push(`${effectiveness.redundantWells.length}口井信息冗余度高（相关系数>0.85），可考虑整合或调整位置`);
  }
  if (suggestions.length === 0) {
    suggestions.push('监测网整体状况良好，建议维持现有监测方案并定期复核');
  }

  return {
    density,
    coverage,
    frequency: frequencyResults,
    effectiveness,
    overallScore,
    grade,
    suggestions,
  };
}

// ── 辅助函数 ──

/** 计算信息熵（离散化） */
function calcEntropy(values: number[]): number {
  if (values.length === 0) return 0;

  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return 0;

  // 离散化为10个区间
  const bins = 10;
  const binSize = (max - min) / bins;
  const counts = new Array(bins).fill(0);

  for (const v of values) {
    const idx = Math.min(bins - 1, Math.floor((v - min) / binSize));
    counts[idx]++;
  }

  const n = values.length;
  let entropy = 0;
  for (const count of counts) {
    if (count > 0) {
      const p = count / n;
      entropy -= p * Math.log2(p);
    }
  }

  return entropy;
}

/** 皮尔逊相关系数 */
function calcPearsonCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 2) return 0;

  const meanX = x.slice(0, n).reduce((s, v) => s + v, 0) / n;
  const meanY = y.slice(0, n).reduce((s, v) => s + v, 0) / n;

  let numerator = 0, denomX = 0, denomY = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    numerator += dx * dy;
    denomX += dx * dx;
    denomY += dy * dy;
  }

  const denom = Math.sqrt(denomX * denomY);
  return denom > 0 ? numerator / denom : 0;
}

/** 生成合成历史数据（用于无实际数据时的演示） */
function generateSyntheticHistory(well: MonitoringWell): number[] {
  const months = 24; // 2年月度数据
  const history: number[] = [];
  const baseLevel = well.aquiferType === 'deep' ? -15 : well.aquiferType === 'karst' ? 540 : 35;
  const seasonalAmplitude = well.aquiferType === 'deep' ? 2 : 5;
  const trend = well.aquiferType === 'deep' ? -0.3 : -0.1;

  // 基于井位置生成不同相位
  const phaseOffset = (well.row + well.col) * 0.3;

  for (let m = 0; m < months; m++) {
    const seasonal = seasonalAmplitude * Math.sin((m / 12) * 2 * Math.PI + phaseOffset);
    const trendComponent = trend * m;
    const noise = (Math.sin(m * 7.3 + well.row * 3.1) * 0.5 + Math.sin(m * 2.1 + well.col * 1.7) * 0.3) * 1.5;
    history.push(baseLevel + seasonal + trendComponent + noise);
  }

  return history;
}

// ── 预设数据 ──

export const PRESET_MONITORING_AREAS: MonitoringArea[] = [
  {
    id: 'baoding-plain',
    name: '保定平原区',
    area: 12000,
    aquiferType: 'shallow',
    cellSize: 2000,
    rows: 30,
    cols: 40,
    wells: generateWells('baoding', 'shallow', 30, 40, 120, [
      { name: '保定市区', row: 15, col: 20, type: 'national' },
      { name: '涿州', row: 5, col: 15, type: 'national' },
      { name: '高碑店', row: 6, col: 22, type: 'provincial' },
      { name: '定兴', row: 8, col: 18, type: 'provincial' },
      { name: '徐水', row: 10, col: 22, type: 'municipal' },
      { name: '满城', row: 14, col: 12, type: 'municipal' },
      { name: '清苑', row: 18, col: 20, type: 'provincial' },
      { name: '望都', row: 16, col: 14, type: 'municipal' },
      { name: '曲阳', row: 12, col: 30, type: 'enterprise' },
      { name: '阜平', row: 8, col: 35, type: 'enterprise' },
      { name: '唐县', row: 10, col: 28, type: 'municipal' },
      { name: '容城', row: 7, col: 25, type: 'national' },
      { name: '雄县', row: 9, col: 28, type: 'national' },
      { name: '安新', row: 11, col: 26, type: 'provincial' },
    ]),
  },
  {
    id: 'hengtai-deep',
    name: '衡水深层水',
    area: 8800,
    aquiferType: 'deep',
    cellSize: 2500,
    rows: 25,
    cols: 30,
    wells: generateWells('hengtai', 'deep', 25, 30, 80, [
      { name: '衡水市区', row: 12, col: 15, type: 'national' },
      { name: '冀州', row: 16, col: 18, type: 'provincial' },
      { name: '枣强', row: 15, col: 22, type: 'provincial' },
      { name: '武邑', row: 10, col: 20, type: 'municipal' },
      { name: '深州', row: 8, col: 14, type: 'national' },
      { name: '武强', row: 9, col: 22, type: 'enterprise' },
      { name: '饶阳', row: 6, col: 18, type: 'municipal' },
      { name: '安平', row: 5, col: 14, type: 'enterprise' },
      { name: '故城', row: 18, col: 25, type: 'provincial' },
      { name: '景县', row: 20, col: 20, type: 'municipal' },
    ]),
  },
  {
    id: 'cangzhou-coastal',
    name: '沧州滨海区',
    area: 6500,
    aquiferType: 'shallow',
    cellSize: 1800,
    rows: 28,
    cols: 25,
    wells: generateWells('cangzhou', 'shallow', 28, 25, 65, [
      { name: '沧州市区', row: 10, col: 12, type: 'national' },
      { name: '黄骅', row: 20, col: 18, type: 'national' },
      { name: '海兴', row: 22, col: 15, type: 'provincial' },
      { name: '盐山', row: 18, col: 20, type: 'municipal' },
      { name: '孟村', row: 16, col: 22, type: 'enterprise' },
      { name: '青县', row: 5, col: 10, type: 'provincial' },
      { name: '沧县', row: 12, col: 15, type: 'municipal' },
    ]),
  },
  {
    id: 'baoding-karst',
    name: '保定西部岩溶区',
    area: 3200,
    aquiferType: 'karst',
    cellSize: 1500,
    rows: 20,
    cols: 18,
    wells: generateWells('karst', 'karst', 20, 18, 40, [
      { name: '涞源县城', row: 5, col: 8, type: 'national' },
      { name: '王安镇泉', row: 8, col: 12, type: 'national' },
      { name: '白石山', row: 10, col: 6, type: 'provincial' },
      { name: '走马驿', row: 14, col: 14, type: 'municipal' },
      { name: '银坊', row: 16, col: 10, type: 'enterprise' },
    ]),
  },
  {
    id: 'zhangjiakou-basin',
    name: '张家口坝上盆地',
    area: 9800,
    aquiferType: 'shallow',
    cellSize: 2200,
    rows: 22,
    cols: 28,
    wells: generateWells('zhangjiakou', 'shallow', 22, 28, 90, [
      { name: '张北县城', row: 10, col: 14, type: 'national' },
      { name: '康保', row: 5, col: 20, type: 'provincial' },
      { name: '沽源', row: 8, col: 8, type: 'municipal' },
      { name: '尚义', row: 15, col: 22, type: 'enterprise' },
      { name: '察北管理区', row: 6, col: 14, type: 'municipal' },
    ]),
  },
  {
    id: 'handan-east',
    name: '邯郸东部平原',
    area: 7500,
    aquiferType: 'deep',
    cellSize: 2000,
    rows: 24,
    cols: 26,
    wells: generateWells('handan', 'deep', 24, 26, 70, [
      { name: '邯郸市区', row: 8, col: 10, type: 'national' },
      { name: '永年', row: 6, col: 14, type: 'provincial' },
      { name: '肥乡', row: 12, col: 16, type: 'municipal' },
      { name: '成安', row: 14, col: 12, type: 'enterprise' },
      { name: '大名', row: 18, col: 20, type: 'provincial' },
      { name: '魏县', row: 16, col: 24, type: 'municipal' },
      { name: '馆陶', row: 14, col: 25, type: 'enterprise' },
      { name: '邱县', row: 10, col: 22, type: 'municipal' },
    ]),
  },
];

/** 生成监测井数据 */
function generateWells(
  areaPrefix: string,
  aquiferType: 'shallow' | 'deep' | 'karst',
  rows: number,
  cols: number,
  targetCount: number,
  customWells: { name: string; row: number; col: number; type: 'national' | 'provincial' | 'municipal' | 'enterprise' }[],
): MonitoringWell[] {
  const wells: MonitoringWell[] = [];
  const cellSize = 2000; // 用于坐标

  // 添加自定义井
  customWells.forEach((cw, idx) => {
    wells.push({
      id: `${areaPrefix}-W${String(idx + 1).padStart(3, '0')}`,
      name: cw.name,
      row: cw.row,
      col: cw.col,
      x: cw.col * cellSize,
      y: cw.row * cellSize,
      aquiferType,
      frequency: cw.type === 'national' ? 12 : cw.type === 'provincial' ? 6 : 4,
      startDate: cw.type === 'national' ? 2014 : cw.type === 'provincial' ? 2016 : 2018,
      type: cw.type,
    });
  });

  return wells;
}

/** 监测井类型标签 */
export const WELL_TYPE_LABELS: Record<MonitoringWell['type'], string> = {
  national: '国考点',
  provincial: '省考点',
  municipal: '市考点',
  enterprise: '企业井',
};

/** 含水层类型标签 */
export const AQUIFER_LABELS: Record<MonitoringArea['aquiferType'], string> = {
  shallow: '浅层地下水',
  deep: '深层承压水',
  karst: '岩溶水',
};

/** 监测密度标准参考 */
export const DENSITY_STANDARDS = [
  { type: 'shallow', label: '平原区潜水', minSpacing: 50, maxSpacing: 100, recommended: 75 },
  { type: 'deep', label: '平原区承压水', minSpacing: 100, maxSpacing: 200, recommended: 150 },
  { type: 'karst', label: '岩溶区', minSpacing: 30, maxSpacing: 80, recommended: 50 },
] as const;
