/**
 * 监测网优化 — 综合评价（聚合出口）
 *  calcComprehensiveAssessment 综合调用基础评估（基础算法见 monitoringNetworkCore.ts）
 */

import type {
  MonitoringArea, FrequencyResult, ComprehensiveResult,
} from './monitoringNetworkTypes';
import {
  calcMonitoringDensity, calcSpatialCoverage, calcOptimalFrequency, calcMonitoringEffectiveness,
} from './monitoringNetworkCore';
import { generateSyntheticHistory } from './monitoringNetworkUtils';

export * from './monitoringNetworkCore';

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
