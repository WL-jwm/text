/**
 * H-03 报告自动生成 — 报告数据组装测试
 *
 * 覆盖：
 *   - 数据组装（摘要/含水层/城市/实时/告警/井明细）
 *   - 选项控制（includeWells/includeAlerts）
 *   - 空数据
 *   - 阈值附注
 *   - 时间格式化
 */

import { describe, it, expect } from 'vitest';
import { buildWellReportData, formatGeneratedAt, getThresholdNote } from '../wellReport';
import { buildWellAlerts } from '../wellAlerts';
import type { WellWithData } from '../wellRealtime';
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

function makeWellWithData(
  well: Well,
  reading: RealtimeReading | null,
  status: WellWithData['realtime']['status'],
): WellWithData {
  return {
    ...well,
    indicators: [...well.indicators],
    realtime: {
      reading,
      value: reading?.value ?? null,
      unit: reading?.unit ?? 'm',
      timestamp: reading?.timestamp ?? null,
      isStale: reading === null,
      quality: reading?.quality ?? null,
      status,
    },
    channelReadings: reading ? [reading] : [],
    matchedChannels: reading ? [reading.channel] : [],
  };
}

function makeReading(overrides: Partial<RealtimeReading> & { stationId: string; channel: RealtimeReading['channel'] }): RealtimeReading {
  return {
    stationName: '站',
    city: '沧州',
    value: 20,
    unit: 'm',
    timestamp: Date.now(),
    quality: 'good',
    ...overrides,
  };
}

describe('buildWellReportData — 数据组装', () => {
  it('组装完整报告数据', () => {
    const wells = [
      makeWellWithData(makeWell('WL-CZ-01'), makeReading({ stationId: 'WL-CZ-01', channel: 'waterLevel', value: 20 }), 'normal'),
      makeWellWithData({ ...makeWell('WL-HS-01'), city: '衡水' }, makeReading({ stationId: 'WL-HS-01', channel: 'waterLevel', value: 45 }), 'critical'),
      makeWellWithData(makeWell('WQ-CZ-01'), makeReading({ stationId: 'WQ-CZ-01', channel: 'waterQuality', value: 90 }), 'normal'),
    ];

    const alerts = buildWellAlerts(wells);
    const data = buildWellReportData(wells, alerts);

    expect(data.meta.title).toBe('地下水监测井网综合分析报告');
    expect(data.summary.totalWells).toBe(3);
    expect(data.summary.cities).toBe(2);
    expect(data.summary.coverage).toBe(100);
    expect(data.summary.abnormalCount).toBe(1);
    expect(data.summary.criticalCount).toBe(1);

    expect(data.aquiferRows.length).toBeGreaterThan(0);
    expect(data.cityRows.length).toBe(2);
    expect(data.realtimeRows.length).toBe(2); // waterLevel + waterQuality
    expect(data.alertRows.length).toBe(1);
    expect(data.wellRows.length).toBe(3);
  });

  it('实时通道统计正确', () => {
    const wells = [
      makeWellWithData(makeWell('WL-CZ-01'), makeReading({ stationId: 'WL-CZ-01', channel: 'waterLevel', value: 20 }), 'normal'),
      makeWellWithData(makeWell('WL-HS-01'), makeReading({ stationId: 'WL-HS-01', channel: 'waterLevel', value: 45 }), 'critical'),
      makeWellWithData(makeWell('SUB-CZ-01'), makeReading({ stationId: 'SUB-CZ-01', channel: 'subsidence', value: 10 }), 'normal'),
    ];

    const alerts = buildWellAlerts(wells);
    const data = buildWellReportData(wells, alerts);

    const wl = data.realtimeRows.find(r => r.channel === 'waterLevel');
    expect(wl).toBeDefined();
    expect(wl!.total).toBe(2);
    expect(wl!.normal).toBe(1);
    expect(wl!.critical).toBe(1);
    expect(wl!.warning).toBe(0);
  });

  it('告警行包含阈值详情', () => {
    const wells = [
      makeWellWithData(makeWell('WL-CZ-01'), makeReading({ stationId: 'WL-CZ-01', channel: 'waterLevel', value: 45 }), 'critical'),
    ];

    const alerts = buildWellAlerts(wells);
    const data = buildWellReportData(wells, alerts);

    expect(data.alertRows[0]!.severityLabel).toBe('超标');
    expect(data.alertRows[0]!.valueText).toContain('45.0');
    expect(data.alertRows[0]!.detail).toContain('预警≥30');
  });

  it('includeWells=false 时无井明细', () => {
    const wells = [
      makeWellWithData(makeWell('WL-CZ-01'), makeReading({ stationId: 'WL-CZ-01', channel: 'waterLevel', value: 20 }), 'normal'),
    ];
    const alerts = buildWellAlerts(wells);
    const data = buildWellReportData(wells, alerts, { includeWells: false });

    expect(data.wellRows).toHaveLength(0);
    expect(data.summary.totalWells).toBe(1);
  });

  it('includeAlerts=false 时无告警', () => {
    const wells = [
      makeWellWithData(makeWell('WL-CZ-01'), makeReading({ stationId: 'WL-CZ-01', channel: 'waterLevel', value: 45 }), 'critical'),
    ];
    const alerts = buildWellAlerts(wells);
    const data = buildWellReportData(wells, alerts, { includeAlerts: false });

    expect(data.alertRows).toHaveLength(0);
  });

  it('自定义标题与单位', () => {
    const data = buildWellReportData([], [], { title: '专项报告', unit: '测试单位', period: '2026-08' });
    expect(data.meta.title).toBe('专项报告');
    expect(data.meta.unit).toBe('测试单位');
    expect(data.meta.period).toBe('2026-08');
  });
});

describe('buildWellReportData — 空数据', () => {
  it('空井网返回空报告', () => {
    const data = buildWellReportData([], []);
    expect(data.summary.totalWells).toBe(0);
    expect(data.summary.coverage).toBe(0);
    expect(data.aquiferRows).toHaveLength(0);
    expect(data.cityRows).toHaveLength(0);
    expect(data.realtimeRows).toHaveLength(0);
    expect(data.alertRows).toHaveLength(0);
    expect(data.wellRows).toHaveLength(0);
  });
});

describe('buildWellReportData — 含水层分布', () => {
  it('含水层行包含平均井深和运行井', () => {
    const wells = [
      makeWellWithData(makeWell('WL-CZ-01'), null, 'stale'),
      makeWellWithData(makeWell('WL-HS-01'), null, 'stale'),
    ];
    // 两个深层孔隙水井
    const data = buildWellReportData(wells, []);
    const deepPorous = data.aquiferRows.find(r => r.aquiferType === 'deepPorous');
    expect(deepPorous).toBeDefined();
    expect(deepPorous!.count).toBe(2);
    expect(deepPorous!.avgDepth).toBe(220);
    expect(deepPorous!.activeCount).toBe(2);
  });
});

describe('getThresholdNote — 阈值附注', () => {
  it('包含四通道阈值说明', () => {
    const note = getThresholdNote();
    expect(note).toContain('水位埋深');
    expect(note).toContain('水质达标率');
    expect(note).toContain('沉降速率');
    expect(note).toContain('开采量');
    expect(note).toContain('超标');
  });
});

describe('formatGeneratedAt — 时间格式化', () => {
  it('格式化时间戳', () => {
    const ts = new Date(2026, 7, 6, 14, 30, 5).getTime();
    const str = formatGeneratedAt(ts);
    expect(str).toContain('2026-08-06');
    expect(str).toContain('14:30');
  });
});