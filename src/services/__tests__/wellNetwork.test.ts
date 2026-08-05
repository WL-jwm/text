/**
 * H-01 监测井网与空间分析 — 服务层测试
 *
 * 覆盖：
 *   - Haversine 距离计算
 *   - CRUD 操作（新增/查询/编辑/删除）
 *   - 筛选
 *   - 最近邻分析
 *   - 缓冲区分析
 *   - 含水层/城市分组统计
 *   - 空间分析报告
 *   - 重置
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { WellNetworkService, haversineDistance, DEFAULT_WELLS, AQUIFER_LABELS } from '../wellNetwork';

describe('WellNetworkService — Haversine 距离', () => {
  it('相同点距离为 0', () => {
    const dist = haversineDistance(38.31, 116.84, 38.31, 116.84);
    expect(dist).toBe(0);
  });

  it('同城两点距离较小（<100km）', () => {
    // 沧州两井
    const dist = haversineDistance(38.31, 116.84, 38.35, 116.89);
    expect(dist).toBeLessThan(10);
  });

  it('跨城距离较大（>100km）', () => {
    // 秦皇岛到石家庄
    const dist = haversineDistance(39.94, 119.60, 38.04, 114.51);
    expect(dist).toBeGreaterThan(400);
  });

  it('距离对称', () => {
    const a = haversineDistance(38.31, 116.84, 37.74, 115.67);
    const b = haversineDistance(37.74, 115.67, 38.31, 116.84);
    expect(a).toBeCloseTo(b, 5);
  });
});

describe('WellNetworkService — CRUD', () => {
  let svc: WellNetworkService;

  beforeEach(() => {
    svc = new WellNetworkService();
  });

  it('默认有预置井', () => {
    const wells = svc.getWells();
    expect(wells.length).toBe(DEFAULT_WELLS.length);
    expect(wells.length).toBeGreaterThan(10);
  });

  it('getWellById 返回井或 undefined', () => {
    const well = svc.getWellById('WL-CZ-01');
    expect(well).toBeDefined();
    expect(well!.name).toBe('沧州监测站');

    expect(svc.getWellById('NOPE')).toBeUndefined();
  });

  it('新增井', () => {
    const created = svc.addWell({
      name: '测试井',
      city: '石家庄',
      latitude: 38.0,
      longitude: 114.5,
      aquiferType: 'karst',
      depth: 200,
      indicators: ['waterLevel'],
      status: 'active',
      builtYear: 2020,
    });

    expect(created.id).toBeDefined();
    expect(created.name).toBe('测试井');
    expect(svc.getWells().length).toBe(DEFAULT_WELLS.length + 1);
  });

  it('更新井', () => {
    const updated = svc.updateWell('WL-CZ-01', { depth: 300, status: 'maintenance' });
    expect(updated).toBeDefined();
    expect(updated!.depth).toBe(300);
    expect(updated!.status).toBe('maintenance');
    // 未修改字段保留
    expect(updated!.city).toBe('沧州');

    // 不存在的 ID 返回 undefined
    expect(svc.updateWell('NOPE', { depth: 1 })).toBeUndefined();
  });

  it('更新 indicators 不共享引用', () => {
    const updated = svc.updateWell('WL-CZ-01', { indicators: ['waterLevel', 'waterQuality'] });
    expect(updated!.indicators).toHaveLength(2);
    // 修改返回数组不影响内部状态
    updated!.indicators.push('subsidence');
    const again = svc.getWellById('WL-CZ-01');
    expect(again!.indicators).toHaveLength(2);
  });

  it('删除井', () => {
    expect(svc.deleteWell('WL-CZ-01')).toBe(true);
    expect(svc.getWells().length).toBe(DEFAULT_WELLS.length - 1);
    expect(svc.getWellById('WL-CZ-01')).toBeUndefined();

    // 删除不存在的返回 false
    expect(svc.deleteWell('NOPE')).toBe(false);
  });

  it('getWells 返回副本（不共享引用）', () => {
    const wells = svc.getWells();
    wells[0]!.name = '篡改';
    expect(svc.getWellById(wells[0]!.id)!.name).not.toBe('篡改');
  });

  it('setWells 批量替换', () => {
    svc.setWells([
      { id: 'W1', name: '井1', city: '石家庄', latitude: 38, longitude: 114.5, aquiferType: 'karst', depth: 100, indicators: ['waterLevel'], status: 'active', builtYear: 2020 },
    ]);
    expect(svc.getWells().length).toBe(1);
    expect(svc.getWells()[0]!.name).toBe('井1');
  });

  it('reset 恢复默认井网', () => {
    svc.addWell({ name: 'x', city: 'y', latitude: 1, longitude: 2, aquiferType: 'karst', depth: 1, indicators: ['waterLevel'], status: 'active', builtYear: 2020 });
    svc.reset();
    expect(svc.getWells().length).toBe(DEFAULT_WELLS.length);
  });
});

describe('WellNetworkService — 筛选', () => {
  let svc: WellNetworkService;

  beforeEach(() => {
    svc = new WellNetworkService();
  });

  it('按城市筛选', () => {
    const wells = svc.filterWells({ city: '沧州' });
    expect(wells.length).toBeGreaterThan(0);
    expect(wells.every(w => w.city === '沧州')).toBe(true);
  });

  it('按含水层筛选', () => {
    const wells = svc.filterWells({ aquiferType: 'karst' });
    expect(wells.length).toBeGreaterThan(0);
    expect(wells.every(w => w.aquiferType === 'karst')).toBe(true);
  });

  it('按状态筛选', () => {
    const wells = svc.filterWells({ status: 'maintenance' });
    expect(wells.length).toBeGreaterThan(0);
    expect(wells.every(w => w.status === 'maintenance')).toBe(true);
  });

  it('按监测指标筛选', () => {
    const wells = svc.filterWells({ indicator: 'waterQuality' });
    expect(wells.length).toBeGreaterThan(0);
    expect(wells.every(w => w.indicators.includes('waterQuality'))).toBe(true);
  });

  it('按关键字筛选', () => {
    const wells = svc.filterWells({ keyword: '沧州' });
    expect(wells.length).toBeGreaterThan(0);
  });

  it('组合筛选', () => {
    const wells = svc.filterWells({ city: '沧州', aquiferType: 'deepPorous' });
    expect(wells.length).toBeGreaterThan(0);
    expect(wells.every(w => w.city === '沧州' && w.aquiferType === 'deepPorous')).toBe(true);
  });
});

describe('WellNetworkService — 空间分析', () => {
  let svc: WellNetworkService;

  beforeEach(() => {
    svc = new WellNetworkService();
  });

  it('getWellDistances 返回有序距离', () => {
    const distances = svc.getWellDistances('WL-CZ-01');
    expect(distances.length).toBe(DEFAULT_WELLS.length - 1);
    // 升序排序
    for (let i = 1; i < distances.length; i++) {
      expect(distances[i]!.distanceKm).toBeGreaterThanOrEqual(distances[i - 1]!.distanceKm);
    }
    // 最近的是同城沧州
    expect(distances[0]!.distanceKm).toBeLessThan(20);
  });

  it('不存在的井返回空数组', () => {
    expect(svc.getWellDistances('NOPE')).toHaveLength(0);
  });

  it('getNearestNeighbors 每口井都有最近邻', () => {
    const neighbors = svc.getNearestNeighbors();
    expect(neighbors.length).toBe(DEFAULT_WELLS.length);
    for (const n of neighbors) {
      expect(n.nearestId).not.toBe('');
      expect(n.nearestDistanceKm).toBeGreaterThan(0);
    }
  });

  it('最近邻距离非零且合理', () => {
    const neighbors = svc.getNearestNeighbors();
    for (const n of neighbors) {
      // 最近邻距离应该在合理范围（>0 且 <1000km）
      expect(n.nearestDistanceKm).toBeGreaterThan(0);
      expect(n.nearestDistanceKm).toBeLessThan(1000);
    }
  });

  it('缓冲区分析：小半径返回较少井', () => {
    const result = svc.getWellsWithinRadius('WL-CZ-01', 30);
    expect(result.centerName).toBe('沧州监测站');
    expect(result.radiusKm).toBe(30);
    // 小半径通常包含同城井
    expect(result.wellsWithin.length).toBeGreaterThanOrEqual(1);
  });

  it('缓冲区分析：大半径包含更多井', () => {
    const small = svc.getWellsWithinRadius('WL-CZ-01', 50).wellsWithin.length;
    const large = svc.getWellsWithinRadius('WL-CZ-01', 300).wellsWithin.length;
    expect(large).toBeGreaterThanOrEqual(small);
  });

  it('缓冲区分析：不存在的中心返回空', () => {
    const result = svc.getWellsWithinRadius('NOPE', 100);
    expect(result.centerName).toBe('');
    expect(result.wellsWithin).toHaveLength(0);
  });

  it('缓冲区排除自身', () => {
    const result = svc.getWellsWithinRadius('WL-CZ-01', 10000);
    // 不包含自身
    expect(result.wellsWithin.some(w => w.id === 'WL-CZ-01')).toBe(false);
  });
});

describe('WellNetworkService — 分组统计', () => {
  let svc: WellNetworkService;

  beforeEach(() => {
    svc = new WellNetworkService();
  });

  it('含水层分组统计', () => {
    const groups = svc.getAquiferGroupStats();
    expect(groups.length).toBeGreaterThan(0);

    const totalCount = groups.reduce((s, g) => s + g.count, 0);
    expect(totalCount).toBe(DEFAULT_WELLS.length);

    // 每个组都有含水层标签
    for (const g of groups) {
      expect(AQUIFER_LABELS[g.aquiferType]).toBeDefined();
      expect(g.avgDepth).toBeGreaterThan(0);
      expect(g.activeCount).toBeGreaterThanOrEqual(0);
      expect(g.cities.length).toBeGreaterThan(0);
    }
  });

  it('城市分组统计', () => {
    const groups = svc.getCityGroupStats();
    expect(groups.length).toBeGreaterThan(0);

    const totalCount = groups.reduce((s, g) => s + g.count, 0);
    expect(totalCount).toBe(DEFAULT_WELLS.length);

    // 按数量降序
    for (let i = 1; i < groups.length; i++) {
      expect(groups[i]!.count).toBeLessThanOrEqual(groups[i - 1]!.count);
    }

    // 沧州应包含多个井
    const cz = groups.find(g => g.city === '沧州');
    expect(cz).toBeDefined();
    expect(cz!.count).toBeGreaterThanOrEqual(3);
  });

  it('城市统计包含指标分布', () => {
    const groups = svc.getCityGroupStats();
    const cz = groups.find(g => g.city === '沧州');
    expect(cz!.indicatorDistribution).toHaveProperty('waterLevel');
    expect(cz!.indicatorDistribution).toHaveProperty('waterQuality');
  });
});

describe('WellNetworkService — 空间分析报告', () => {
  let svc: WellNetworkService;

  beforeEach(() => {
    svc = new WellNetworkService();
  });

  it('生成完整报告', () => {
    const report = svc.generateSpatialReport();
    expect(report.totalWells).toBe(DEFAULT_WELLS.length);
    expect(report.activeWells).toBeGreaterThan(0);
    expect(report.cities.length).toBeGreaterThan(0);
    expect(report.aquiferGroups.length).toBeGreaterThan(0);
    expect(report.cityGroups.length).toBeGreaterThan(0);
    expect(report.avgNearestDistance).toBeGreaterThan(0);
    expect(report.minPairDistance).toBeGreaterThan(0);
    expect(report.maxPairDistance).toBeGreaterThan(report.minPairDistance);
  });

  it('新增井后报告更新', () => {
    const before = svc.generateSpatialReport();
    svc.addWell({ name: '新井', city: '承德', latitude: 40.95, longitude: 117.96, aquiferType: 'fracture', depth: 120, indicators: ['waterLevel'], status: 'active', builtYear: 2022 });
    const after = svc.generateSpatialReport();

    expect(after.totalWells).toBe(before.totalWells + 1);
    expect(after.cities).toContain('承德');
  });

  it('空井网报告', () => {
    svc.setWells([]);
    const report = svc.generateSpatialReport();
    expect(report.totalWells).toBe(0);
    expect(report.activeWells).toBe(0);
    expect(report.cities).toHaveLength(0);
    expect(report.aquiferGroups).toHaveLength(0);
    expect(report.avgNearestDistance).toBe(0);
    expect(report.minPairDistance).toBe(0);
    expect(report.maxPairDistance).toBe(0);
  });
});