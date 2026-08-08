/**
 * 空间优化建议 测试
 */
import { describe, it, expect } from 'vitest';
import {
  calcCityCoverageDensity,
  identifyCoverageGaps,
  analyzeWellRedundancy,
  calcOverallScore,
  buildSpatialOptimization,
} from '../spatialOptimizer';
import type { Well, NearestNeighborResult, SpatialAnalysisReport, CityGroupStats } from '../wellNetwork';

const mockWells: Well[] = [
  { id: 'W1', name: '井1', city: '石家庄', lng: 114.5, lat: 38.0, depth: 100, aquifer: 'shallowPorous', indicators: ['waterLevel'], status: 'active', group: '', note: '' },
  { id: 'W2', name: '井2', city: '石家庄', lng: 114.51, lat: 38.01, depth: 120, aquifer: 'shallowPorous', indicators: ['waterLevel'], status: 'active', group: '', note: '' },
  { id: 'W3', name: '井3', city: '保定', lng: 115.5, lat: 39.0, depth: 200, aquifer: 'deepPorous', indicators: ['waterLevel', 'waterQuality'], status: 'active', group: '', note: '' },
  { id: 'W4', name: '井4', city: '沧州', lng: 116.8, lat: 38.3, depth: 300, aquifer: 'deepPorous', indicators: ['waterLevel'], status: 'active', group: '', note: '' },
];

const mockReport: SpatialAnalysisReport = {
  totalWells: 4,
  activeWells: 4,
  cities: ['石家庄', '保定', '沧州'],
  aquiferGroups: [
    { aquiferType: 'shallowPorous', count: 2, avgDepth: 110, activeCount: 2, cities: ['石家庄'] },
    { aquiferType: 'deepPorous', count: 2, avgDepth: 250, activeCount: 2, cities: ['保定', '沧州'] },
  ],
  cityGroups: [
    { city: '石家庄', count: 2, aquiferDistribution: { shallowPorous: 2 }, indicatorDistribution: { waterLevel: 2 } },
    { city: '保定', count: 1, aquiferDistribution: { deepPorous: 1 }, indicatorDistribution: { waterLevel: 1, waterQuality: 1 } },
    { city: '沧州', count: 1, aquiferDistribution: { deepPorous: 1 }, indicatorDistribution: { waterLevel: 1 } },
  ],
  avgNearestDistance: 0.5,
  minPairDistance: 0.1,
  maxPairDistance: 200,
};

const mockNeighbors: NearestNeighborResult[] = [
  { wellId: 'W1', wellName: '井1', city: '石家庄', nearestId: 'W2', nearestName: '井2', nearestDistanceKm: 0.1, aquiferType: 'shallowPorous' },
  { wellId: 'W2', wellName: '井2', city: '石家庄', nearestId: 'W1', nearestName: '井1', nearestDistanceKm: 0.1, aquiferType: 'shallowPorous' },
  { wellId: 'W3', wellName: '井3', city: '保定', nearestId: 'W1', nearestName: '井1', nearestDistanceKm: 95, aquiferType: 'deepPorous' },
  { wellId: 'W4', wellName: '井4', city: '沧州', nearestId: 'W3', nearestName: '井3', nearestDistanceKm: 120, aquiferType: 'deepPorous' },
];

describe('calcCityCoverageDensity', () => {
  it('应计算各城市井密度', () => {
    const densities = calcCityCoverageDensity(mockReport.cityGroups, mockNeighbors);
    expect(densities).toHaveLength(3);
    // 石家庄: 2口/6673km² = 0.30 口/1000km² → critical
    const sjz = densities.find(d => d.city === '石家庄');
    expect(sjz).toBeDefined();
    expect(sjz?.density).toBeLessThan(1);
    expect(sjz?.status).toBe('critical');
    expect(sjz?.gap).toBeGreaterThan(0);
  });

  it('应排序（密度最低在前）', () => {
    const densities = calcCityCoverageDensity(mockReport.cityGroups, mockNeighbors);
    expect(densities[0].density).toBeLessThanOrEqual(densities[1].density);
  });
});

describe('identifyCoverageGaps', () => {
  it('应识别稀疏监测区', () => {
    const densities = calcCityCoverageDensity(mockReport.cityGroups, mockNeighbors);
    const gaps = identifyCoverageGaps(mockReport, mockNeighbors, densities);
    const sparse = gaps.find(g => g.type === 'sparse');
    expect(sparse).toBeDefined();
    expect(sparse?.cities.length).toBeGreaterThan(0);
  });

  it('应识别井间距过大', () => {
    const densities = calcCityCoverageDensity(mockReport.cityGroups, mockNeighbors);
    const gaps = identifyCoverageGaps(mockReport, mockNeighbors, densities);
    const edge = gaps.find(g => g.type === 'edgeMonitoring');
    expect(edge).toBeDefined();
    expect(edge?.cities).toContain('保定');
  });

  it('应识别冗余井', () => {
    const densities = calcCityCoverageDensity(mockReport.cityGroups, mockNeighbors);
    const gaps = identifyCoverageGaps(mockReport, mockNeighbors, densities);
    const redundant = gaps.find(g => g.type === 'redundant');
    expect(redundant).toBeDefined();
    expect(redundant?.cities).toContain('石家庄');
  });
});

describe('analyzeWellRedundancy', () => {
  it('应识别高冗余井', () => {
    const redundancies = analyzeWellRedundancy(mockWells, mockNeighbors);
    expect(redundancies.length).toBeGreaterThan(0);
    const highRedundant = redundancies.find(r => r.suggestRemove);
    expect(highRedundant).toBeDefined();
    expect(highRedundant?.wellId).toBe('W1'); // W1 与 W2 仅 0.1km
  });
});

describe('calcOverallScore', () => {
  it('完美状态应得100分', () => {
    expect(calcOverallScore([], [])).toBe(100);
  });

  it('有严重盲区应扣分', () => {
    const gaps = [{ type: 'sparse', severity: 5, cities: ['石家庄'], priority: 'high', title: '', description: '', suggestion: '', suggestedWells: 3 }];
    const densities = [{ city: '石家庄', wellCount: 1, area: 6673, density: 0.15, avgNearestDistance: 0, status: 'critical', recommendedWells: 19, gap: 18 }];
    const score = calcOverallScore(gaps as any, densities as any);
    expect(score).toBeLessThan(100);
    expect(score).toBeGreaterThan(0);
  });
});

describe('buildSpatialOptimization', () => {
  it('应生成完整优化建议', () => {
    const result = buildSpatialOptimization(mockWells, mockReport, mockNeighbors);
    expect(result.hasData).toBe(true);
    expect(result.gaps.length).toBeGreaterThan(0);
    expect(result.cityDensities.length).toBe(3);
    expect(result.topRecommendations.length).toBeGreaterThan(0);
    expect(result.overallScore).toBeGreaterThan(0);
  });

  it('应处理空井网', () => {
    const emptyReport: SpatialAnalysisReport = {
      totalWells: 0, activeWells: 0, cities: [],
      aquiferGroups: [], cityGroups: [],
      avgNearestDistance: 0, minPairDistance: 0, maxPairDistance: 0,
    };
    const result = buildSpatialOptimization([], emptyReport, []);
    expect(result.hasData).toBe(false);
    expect(result.overallScore).toBe(100);
  });
});