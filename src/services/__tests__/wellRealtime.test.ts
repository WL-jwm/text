/**
 * H-01 监测井网实时读数联动 — 服务层测试
 *
 * 覆盖：
 *   - 状态计算（正常/预警/超标/过期）
 *   - 过期判断
 *   - 井读数关联
 *   - 实时统计
 *   - 异常筛选
 *   - 通道分组
 */

import { describe, it, expect } from 'vitest';
import {
  computeWellStatus,
  isReadingStale,
  linkWellsToReadings,
  computeWellRealtimeStats,
  filterAbnormalWells,
  groupWellsByChannel,
} from '../wellRealtime';
import type { Well } from '../wellNetwork';
import type { RealtimeReading } from '../realtimeDataService';

// ── 辅助工厂 ──

function makeWell(id = 'WL-CZ-01'): Well {
  return {
    id,
    name: `井${id}`,
    city: '沧州',
    latitude: 38.31,
    longitude: 116.84,
    aquiferType: 'deepPorous',
    depth: 220,
    indicators: ['waterLevel'],
    status: 'active',
    builtYear: 2012,
  };
}

function makeReading(overrides: Partial<RealtimeReading> & { stationId: string }): RealtimeReading {
  return {
    stationName: '站',
    city: '沧州',
    channel: 'waterLevel',
    value: 20,
    unit: 'm',
    timestamp: Date.now(),
    quality: 'good',
    ...overrides,
  };
}

describe('computeWellStatus — 状态计算', () => {
  it('无读数返回过期', () => {
    expect(computeWellStatus(null, true)).toBe('stale');
  });

  it('过期返回过期', () => {
    const reading = makeReading({ stationId: 'WL-CZ-01', value: 20 });
    expect(computeWellStatus(reading, true)).toBe('stale');
  });

  it('水位正常值（低于warning 30）返回正常', () => {
    const reading = makeReading({ stationId: 'WL-CZ-01', channel: 'waterLevel', value: 20 });
    expect(computeWellStatus(reading, false)).toBe('normal');
  });

  it('水位预警（>=30 且 <40）', () => {
    const reading = makeReading({ stationId: 'WL-CZ-01', channel: 'waterLevel', value: 35 });
    expect(computeWellStatus(reading, false)).toBe('warning');
  });

  it('水位超标（>=40）', () => {
    const reading = makeReading({ stationId: 'WL-CZ-01', channel: 'waterLevel', value: 45 });
    expect(computeWellStatus(reading, false)).toBe('critical');
  });

  it('水质向下方向判断', () => {
    // 水质阈值 warning=80, critical=70, direction=below
    const normal = makeReading({ stationId: 'WQ-CZ-01', channel: 'waterQuality', value: 90 });
    expect(computeWellStatus(normal, false)).toBe('normal');

    const warning = makeReading({ stationId: 'WQ-CZ-01', channel: 'waterQuality', value: 75 });
    expect(computeWellStatus(warning, false)).toBe('warning');

    const critical = makeReading({ stationId: 'WQ-CZ-01', channel: 'waterQuality', value: 60 });
    expect(computeWellStatus(critical, false)).toBe('critical');
  });
});

describe('isReadingStale — 过期判断', () => {
  it('新数据未过期', () => {
    const reading = makeReading({ stationId: 'WL-CZ-01', timestamp: Date.now() });
    expect(isReadingStale(reading, 60000)).toBe(false);
  });

  it('旧数据过期', () => {
    const reading = makeReading({ stationId: 'WL-CZ-01', timestamp: Date.now() - 120000 });
    expect(isReadingStale(reading, 60000)).toBe(true);
  });

  it('null 数据过期', () => {
    expect(isReadingStale(null, 60000)).toBe(true);
  });

  it('自定义新鲜度阈值', () => {
    const reading = makeReading({ stationId: 'WL-CZ-01', timestamp: Date.now() - 30000 });
    expect(isReadingStale(reading, 10000)).toBe(true);
    expect(isReadingStale(reading, 60000)).toBe(false);
  });
});

describe('linkWellsToReadings — 井读数关联', () => {
  it('关联单口井的读数', () => {
    const well = makeWell('WL-CZ-01');
    const reading = makeReading({ stationId: 'WL-CZ-01', value: 22.5 });

    const result = linkWellsToReadings([well], [reading]);
    expect(result[0]!.realtime.reading).not.toBeNull();
    expect(result[0]!.realtime.value).toBe(22.5);
    expect(result[0]!.realtime.status).toBe('normal');
    expect(result[0]!.matchedChannels).toContain('waterLevel');
  });

  it('无匹配读数的井 realtime 为空', () => {
    const well = makeWell('WL-CZ-01');
    const otherReading = makeReading({ stationId: 'WL-HS-01' });

    const result = linkWellsToReadings([well], [otherReading]);
    expect(result[0]!.realtime.reading).toBeNull();
    expect(result[0]!.realtime.value).toBeNull();
    expect(result[0]!.realtime.status).toBe('stale');
  });

  it('多读数取最新一条', () => {
    const well = makeWell('WL-CZ-01');
    const old = makeReading({ stationId: 'WL-CZ-01', value: 10, timestamp: Date.now() - 10000 });
    const recent = makeReading({ stationId: 'WL-CZ-01', value: 25, timestamp: Date.now() });

    const result = linkWellsToReadings([well], [old, recent]);
    expect(result[0]!.realtime.value).toBe(25);
  });

  it('channelReadings 包含该井所有读数', () => {
    const well = makeWell('WL-CZ-01');
    const r1 = makeReading({ stationId: 'WL-CZ-01', value: 10 });
    const r2 = makeReading({ stationId: 'WL-CZ-01', value: 20 });

    const result = linkWellsToReadings([well], [r1, r2]);
    expect(result[0]!.channelReadings).toHaveLength(2);
  });

  it('过期读数标记为过期', () => {
    const well = makeWell('WL-CZ-01');
    const stale = makeReading({ stationId: 'WL-CZ-01', value: 20, timestamp: Date.now() - 120000 });

    const result = linkWellsToReadings([well], [stale], 60000);
    expect(result[0]!.realtime.isStale).toBe(true);
    expect(result[0]!.realtime.status).toBe('stale');
  });

  it('不修改原始井数据', () => {
    const well = makeWell('WL-CZ-01');
    const reading = makeReading({ stationId: 'WL-CZ-01' });
    const originalIndicators = well.indicators;

    const result = linkWellsToReadings([well], [reading]);
    // 修改结果不影响原始
    result[0]!.indicators.push('waterQuality');
    expect(originalIndicators).toHaveLength(1);
  });
});

describe('computeWellRealtimeStats — 实时统计', () => {
  it('空井网统计', () => {
    const stats = computeWellRealtimeStats([]);
    expect(stats.total).toBe(0);
    expect(stats.coverage).toBe(0);
  });

  it('统计正常井', () => {
    const wells = [
      makeWell('WL-CZ-01'),
      makeWell('WL-HS-01'),
    ];
    const readings = [
      makeReading({ stationId: 'WL-CZ-01', value: 20 }),
      makeReading({ stationId: 'WL-HS-01', value: 25 }),
    ];

    const linked = linkWellsToReadings(wells, readings);
    const stats = computeWellRealtimeStats(linked);

    expect(stats.total).toBe(2);
    expect(stats.withData).toBe(2);
    expect(stats.normal).toBe(2);
    expect(stats.coverage).toBe(100);
  });

  it('统计含异常井', () => {
    const wells = [
      makeWell('WL-CZ-01'),
      makeWell('WL-HS-01'),
      makeWell('WQ-CZ-01'),
    ];
    const readings = [
      makeReading({ stationId: 'WL-CZ-01', value: 20 }),          // normal
      makeReading({ stationId: 'WL-HS-01', value: 35 }),          // warning
      makeReading({ stationId: 'WQ-CZ-01', channel: 'waterQuality', value: 60 }), // critical
    ];

    const linked = linkWellsToReadings(wells, readings);
    const stats = computeWellRealtimeStats(linked);

    expect(stats.normal).toBe(1);
    expect(stats.warning).toBe(1);
    expect(stats.critical).toBe(1);
    expect(stats.withData).toBe(3);
  });

  it('覆盖率计算', () => {
    const wells = [makeWell('WL-CZ-01'), makeWell('WL-HS-01'), makeWell('WQ-CZ-01'), makeWell('WQ-HS-01')];
    const readings = [makeReading({ stationId: 'WL-CZ-01' }), makeReading({ stationId: 'WL-HS-01' })];

    const linked = linkWellsToReadings(wells, readings);
    const stats = computeWellRealtimeStats(linked);

    expect(stats.withData).toBe(2);
    expect(stats.coverage).toBe(50);
  });
});

describe('filterAbnormalWells — 异常筛选', () => {
  it('筛选全部异常井', () => {
    const wells = [
      makeWell('WL-CZ-01'),
      makeWell('WL-HS-01'),
    ];
    const readings = [
      makeReading({ stationId: 'WL-CZ-01', value: 20 }),
      makeReading({ stationId: 'WL-HS-01', value: 45 }), // critical
    ];

    const linked = linkWellsToReadings(wells, readings);
    const abnormal = filterAbnormalWells(linked);
    expect(abnormal).toHaveLength(1);
    expect(abnormal[0]!.id).toBe('WL-HS-01');
  });

  it('自定义筛选状态', () => {
    const wells = [makeWell('WL-CZ-01')];
    const readings = [makeReading({ stationId: 'WL-CZ-01', value: 20 })];

    const linked = linkWellsToReadings(wells, readings);
    const warnings = filterAbnormalWells(linked, ['warning']);
    expect(warnings).toHaveLength(0);
  });

  it('无异常时返回空数组', () => {
    const wells = [makeWell('WL-CZ-01')];
    const readings = [makeReading({ stationId: 'WL-CZ-01', value: 20 })];

    const linked = linkWellsToReadings(wells, readings);
    const abnormal = filterAbnormalWells(linked);
    expect(abnormal).toHaveLength(0);
  });
});

describe('groupWellsByChannel — 通道分组', () => {
  it('按通道分组井', () => {
    const wells = [
      makeWell('WL-CZ-01'),
      makeWell('WQ-CZ-01'),
      makeWell('EXT-HS-01'),
    ];
    const readings = [
      makeReading({ stationId: 'WL-CZ-01', channel: 'waterLevel' }),
      makeReading({ stationId: 'WQ-CZ-01', channel: 'waterQuality' }),
      makeReading({ stationId: 'EXT-HS-01', channel: 'extraction' }),
    ];

    const linked = linkWellsToReadings(wells, readings);
    const grouped = groupWellsByChannel(linked);

    expect(grouped.waterLevel).toHaveLength(1);
    expect(grouped.waterQuality).toHaveLength(1);
    expect(grouped.extraction).toHaveLength(1);
    expect(grouped.subsidence).toHaveLength(0);
  });

  it('四个通道键都存在', () => {
    const linked = linkWellsToReadings([makeWell()], []);
    const grouped = groupWellsByChannel(linked);

    expect(Object.keys(grouped)).toEqual(['waterLevel', 'waterQuality', 'subsidence', 'extraction']);
  });
});