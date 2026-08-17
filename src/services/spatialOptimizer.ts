/**
 * Q-02 空间优化建议
 * 基于最近邻/缓冲区分析，输出"监测覆盖盲区"建议与优化方案
 */
import type { Well, NearestNeighborResult, SpatialAnalysisReport, CityGroupStats } from './wellNetwork';

// ============ 数据模型 ============

/** 覆盖盲区类型 */
export type GapType = 'sparse' | 'missingAquifer' | 'missingIndicator' | 'edgeMonitoring' | 'redundant';

/** 覆盖盲区 */
export interface CoverageGap {
  /** 类型 */
  type: GapType;
  /** 严重度（1-5，越高越严重） */
  severity: number;
  /** 标题 */
  title: string;
  /** 描述 */
  description: string;
  /** 涉及城市 */
  cities: string[];
  /** 建议 */
  suggestion: string;
  /** 建议新增井数 */
  suggestedWells: number;
  /** 优先级 */
  priority: 'high' | 'medium' | 'low';
}

/** 城市覆盖密度 */
export interface CityCoverageDensity {
  city: string;
  wellCount: number;
  /** 面积（km²） */
  area: number;
  /** 井密度（口/1000km²） */
  density: number;
  /** 平均最近邻距离（km） */
  avgNearestDistance: number;
  /** 覆盖状态 */
  status: 'adequate' | 'moderate' | 'sparse' | 'critical';
  /** 建议井数 */
  recommendedWells: number;
  /** 缺口 */
  gap: number;
}

/** 井冗余度分析 */
export interface WellRedundancy {
  wellId: string;
  wellName: string;
  city: string;
  /** 最近邻距离（km） */
  nearestDistance: number;
  /** 冗余评分（0-100，越高越冗余） */
  redundancyScore: number;
  /** 是否建议移除 */
  suggestRemove: boolean;
  /** 原因 */
  reason: string;
}

/** 空间优化建议完整结果 */
export interface SpatialOptimizationResult {
  /** 覆盖盲区 */
  gaps: CoverageGap[];
  /** 城市覆盖密度 */
  cityDensities: CityCoverageDensity[];
  /** 井冗余度 */
  redundancies: WellRedundancy[];
  /** 优先建议 */
  topRecommendations: string[];
  /** 总体评分（0-100，越高越好） */
  overallScore: number;
  /** 是否有数据 */
  hasData: boolean;
}

// ============ 常量 ============

/** 城市参考面积（km²，用于密度计算） */
const CITY_AREAS: Record<string, number> = {
  '石家庄': 6673, '保定': 10994.6, '沧州': 12121, '衡水': 8433,
  '邢台': 8686.9, '邯郸': 7514.6, '唐山': 6604.4, '廊坊': 6398,
  '秦皇岛': 1919.5, '张家口': 15796, '承德': 19748, '雄安新区': 1770,
  '定州': 1274, '辛集': 951,
};

/** 建议井密度（口/1000km²，按平原区标准） */
const TARGET_DENSITY = 3; // 每1000km² 3口监测井

// ============ 核心分析引擎 ============

/**
 * 计算城市覆盖密度
 * 纯函数，可测试
 */
export function calcCityCoverageDensity(
  cityStats: CityGroupStats[],
  nearestNeighbors: NearestNeighborResult[],
): CityCoverageDensity[] {
  const densities: CityCoverageDensity[] = [];

  for (const cs of cityStats) {
    const area = CITY_AREAS[cs.city] ?? 5000;
    const density = parseFloat(((cs.count / area) * 1000).toFixed(2));
    const avgDist = calcAvgNearestDistance(cs.city, nearestNeighbors);

    let status: 'adequate' | 'moderate' | 'sparse' | 'critical';
    if (density >= TARGET_DENSITY * 1.5) status = 'adequate';
    else if (density >= TARGET_DENSITY) status = 'moderate';
    else if (density >= TARGET_DENSITY * 0.5) status = 'sparse';
    else status = 'critical';

    const recommendedWells = Math.max(0, Math.ceil((TARGET_DENSITY * area / 1000) - cs.count));
    const gap = recommendedWells;

    densities.push({
      city: cs.city,
      wellCount: cs.count,
      area,
      density,
      avgNearestDistance: avgDist,
      status,
      recommendedWells,
      gap,
    });
  }

  return densities.sort((a, b) => a.density - b.density);
}

/**
 * 计算城市平均最近邻距离
 * 纯函数，可测试
 */
function calcAvgNearestDistance(city: string, neighbors: NearestNeighborResult[]): number {
  const cityNeighbors = neighbors.filter(n => n.city === city);
  if (cityNeighbors.length === 0) return 0;
  const avg = cityNeighbors.reduce((s, n) => s + n.nearestDistanceKm, 0) / cityNeighbors.length;
  return parseFloat(avg.toFixed(2));
}

/**
 * 识别覆盖盲区
 * 纯函数，可测试
 */
export function identifyCoverageGaps(
  report: SpatialAnalysisReport,
  neighbors: NearestNeighborResult[],
  cityDensities: CityCoverageDensity[],
): CoverageGap[] {
  const gaps: CoverageGap[] = [];

  // 1. 稀疏监测区
  const sparseCities = cityDensities.filter(c => c.status === 'sparse' || c.status === 'critical');
  if (sparseCities.length > 0) {
    const totalGap = sparseCities.reduce((s, c) => s + c.gap, 0);
    gaps.push({
      type: 'sparse',
      severity: sparseCities.some(c => c.status === 'critical') ? 5 : 4,
      title: '监测覆盖稀疏',
      description: `${sparseCities.length} 个城市监测密度不足，共需补充 ${totalGap} 口井`,
      cities: sparseCities.map(c => c.city),
      suggestion: `优先在 ${sparseCities.slice(0, 3).map(c => c.city).join('、')} 部署新监测井`,
      suggestedWells: totalGap,
      priority: sparseCities.some(c => c.status === 'critical') ? 'high' : 'medium',
    });
  }

  // 2. 缺失含水层监测
  const allAquifers = new Set(report.aquiferGroups.map(g => g.aquiferType));
  const missingAquifers: string[] = [];
  if (!allAquifers.has('deepPorous')) missingAquifers.push('深层孔隙水');
  if (!allAquifers.has('karst')) missingAquifers.push('岩溶水');
  if (!allAquifers.has('fracture')) missingAquifers.push('裂隙水');
  if (missingAquifers.length > 0) {
    gaps.push({
      type: 'missingAquifer',
      severity: 3,
      title: '含水层监测缺失',
      description: `缺少 ${missingAquifers.join('、')} 监测`,
      cities: [],
      suggestion: `在典型区域补充 ${missingAquifers.join('、')} 监测井`,
      suggestedWells: missingAquifers.length,
      priority: 'medium',
    });
  }

  // 3. 井间距过大（最近邻 > 20km）
  const largeGaps = neighbors.filter(n => n.nearestDistanceKm > 20);
  if (largeGaps.length > 0) {
    const gapCities = [...new Set(largeGaps.map(n => n.city))];
    gaps.push({
      type: 'edgeMonitoring',
      severity: 3,
      title: '井间距过大',
      description: `${largeGaps.length} 口井最近邻距离 > 20km，可能存在监测盲区`,
      cities: gapCities,
      suggestion: `在 ${gapCities.slice(0, 3).join('、')} 的大间距区域增补监测井`,
      suggestedWells: Math.ceil(largeGaps.length / 2),
      priority: 'medium',
    });
  }

  // 4. 冗余井（最近邻 < 0.5km）
  const redundant = neighbors.filter(n => n.nearestDistanceKm < 0.5);
  if (redundant.length > 0) {
    gaps.push({
      type: 'redundant',
      severity: 2,
      title: '监测井过密',
      description: `${redundant.length} 口井间距 < 0.5km，存在冗余`,
      cities: [...new Set(redundant.map(n => n.city))],
      suggestion: '评估过密区域，考虑合并或调整监测井位',
      suggestedWells: 0,
      priority: 'low',
    });
  }

  return gaps.sort((a, b) => b.severity - a.severity);
}

/**
 * 分析井冗余度
 * 纯函数，可测试
 */
export function analyzeWellRedundancy(
  wells: Well[],
  neighbors: NearestNeighborResult[],
): WellRedundancy[] {
  const redundancies: WellRedundancy[] = [];

  for (const well of wells) {
    const neighbor = neighbors.find(n => n.wellId === well.id);
    if (!neighbor) continue;

    const dist = neighbor.nearestDistanceKm;
    let score = 0;
    let suggestRemove = false;
    let reason = '';

    if (dist < 0.3) {
      score = 90;
      suggestRemove = true;
      reason = `与 ${neighbor.nearestName} 间距仅 ${dist.toFixed(2)}km，高度冗余`;
    } else if (dist < 0.5) {
      score = 70;
      suggestRemove = true;
      reason = `与 ${neighbor.nearestName} 间距 ${dist.toFixed(2)}km，建议评估合并`;
    } else if (dist < 1.0) {
      score = 40;
      suggestRemove = false;
      reason = `与 ${neighbor.nearestName} 间距 ${dist.toFixed(2)}km，可接受`;
    } else {
      continue;
    }

    redundancies.push({
      wellId: well.id,
      wellName: well.name,
      city: well.city,
      nearestDistance: dist,
      redundancyScore: score,
      suggestRemove,
      reason,
    });
  }

  return redundancies.sort((a, b) => b.redundancyScore - a.redundancyScore);
}

/**
 * 计算总体评分
 * 纯函数，可测试
 */
export function calcOverallScore(
  gaps: CoverageGap[],
  densities: CityCoverageDensity[],
): number {
  if (gaps.length === 0 && densities.length === 0) return 100;

  // 基础分 100
  let score = 100;

  // 严重盲区扣分
  for (const gap of gaps) {
    score -= gap.severity * 5;
  }

  // 覆盖不足扣分
  const criticalCities = densities.filter(d => d.status === 'critical').length;
  const sparseCities = densities.filter(d => d.status === 'sparse').length;
  score -= criticalCities * 10;
  score -= sparseCities * 5;

  return Math.max(0, Math.min(100, score));
}

/**
 * 生成空间优化建议完整结果
 * 纯函数，可测试
 */
export function buildSpatialOptimization(
  wells: Well[],
  report: SpatialAnalysisReport,
  neighbors: NearestNeighborResult[],
): SpatialOptimizationResult {
  const cityDensities = calcCityCoverageDensity(report.cityGroups, neighbors);
  const gaps = identifyCoverageGaps(report, neighbors, cityDensities);
  const redundancies = analyzeWellRedundancy(wells, neighbors);
  const overallScore = calcOverallScore(gaps, cityDensities);

  // 生成优先建议
  const topRecommendations: string[] = [];
  for (const gap of gaps.filter(g => g.priority === 'high')) {
    topRecommendations.push(`[高优] ${gap.title}: ${gap.suggestion}`);
  }
  for (const gap of gaps.filter(g => g.priority === 'medium')) {
    topRecommendations.push(`[中优] ${gap.title}: ${gap.suggestion}`);
  }
  if (redundancies.filter(r => r.suggestRemove).length > 0) {
    topRecommendations.push(`[低优] 建议评估 ${redundancies.filter(r => r.suggestRemove).length} 口冗余井`);
  }

  return {
    gaps,
    cityDensities,
    redundancies,
    topRecommendations,
    overallScore,
    hasData: wells.length > 0,
  };
}