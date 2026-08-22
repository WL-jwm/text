/**
 * 监测网优化 — 五大评估算法（自 monitoringNetworkCalculator 拆分）
 */
import type {
  MonitoringArea, MonitoringWell,
  DensityResult, CoverageResult, FrequencyResult,
  EffectivenessResult, ComprehensiveResult,
} from './monitoringNetworkTypes';
import {
  calcEntropy, calcPearsonCorrelation, generateSyntheticHistory,
} from './monitoringNetworkUtils';

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
