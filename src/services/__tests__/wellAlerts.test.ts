/**
 * H-02 实时读数历史趋势与告警联动 — 服务层测试
 *
 * 覆盖：
 *   - 告警生成（超标/预警/过期/正常跳过）
 *   - 告警排序
 *   - 汇总统计
 *   - 分组
 *   - 筛选
 *   - 阈值文本格式化
 *   - 历史趋势分析
 */

import { describe, it, expect } from 'vitest';
import {
  buildWellAlerts,
  summarizeAlerts,
  groupAlertsByChannel,
  filterAlerts,
  formatThresholdText,
  formatAlertThreshold,
  buildWellTrend,
} from '../wellAlerts';
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
  isStale = false,
): WellWithData {
  return {
    ...well,
    indicators: [...well.indicators],
    realtime: {
      reading,
      value: reading?.value ?? null,
      unit: reading?.unit ?? 'm',
      timestamp: reading?.timestamp ?? null,
      isStale,
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

describe('buildWellAlerts — 告警生成', () => {
  it('正常井不生成告警', () => {
    const well = makeWellWithData(
      makeWell('WL-CZ-01'),
      makeReading({ stationId: 'WL-CZ-01', channel: 'waterLevel', value: 20 }),
      'normal',
    );
    expect(buildWellAlerts([well])).toHaveLength(0);
  });

  it('超标井生成 critical 告警', () => {
    const well = makeWellWithData(
      makeWell('WL-CZ-01'),
      makeReading({ stationId: 'WL-CZ-01', channel: 'waterLevel', value: 45 }),
      'critical',
    );
    const alerts = buildWellAlerts([well]);
    expect(alerts).toHaveLength(1);
    expect(alerts[0]!.severity).toBe('critical');
    expect(alerts[0]!.value).toBe(45);
    expect(alerts[0]!.wellId).toBe('WL-CZ-01');
  });

  it('预警井生成 warning 告警', () => {
    const well = makeWellWithData(
      makeWell('WL-CZ-01'),
      makeReading({ stationId: 'WL-CZ-01', channel: 'waterLevel', value: 35 }),
      'warning',
    );
    const alerts = buildWellAlerts([well]);
    expect(alerts).toHaveLength(1);
    expect(alerts[0]!.severity).toBe('warning');
  });

  it('过期井生成 stale 告警', () => {
    const well = makeWellWithData(makeWell('WL-CZ-01'), null, 'stale', true);
    const alerts = buildWellAlerts([well]);
    expect(alerts).toHaveLength(1);
    expect(alerts[0]!.severity).toBe('stale');
    expect(alerts[0]!.isStale).toBe(true);
  });

  it('水质向下方向的告警', () => {
    const well = makeWellWithData(
      makeWell('WQ-CZ-01'),
      makeReading({ stationId: 'WQ-CZ-01', channel: 'waterQuality', value: 60 }),
      'critical',
    );
    const alerts = buildWellAlerts([well]);
    expect(alerts[0]!.severity).toBe('critical');
    expect(alerts[0]!.channel).toBe('waterQuality');
  });

  it('混合状态按严重程度排序', () => {
    const critical = makeWellWithData(
      makeWell('WL-CZ-01'),
      makeReading({ stationId: 'WL-CZ-01', channel: 'waterLevel', value: 45 }),
      'critical',
    );
    const warning = makeWellWithData(
      makeWell('WL-HS-01'),
      makeReading({ stationId: 'WL-HS-01', channel: 'waterLevel', value: 35 }),
      'warning',
    );
    const stale = makeWellWithData(makeWell('WQ-CZ-01'), null, 'stale', true);

    const alerts = buildWellAlerts([warning, critical, stale]);
    expect(alerts[0]!.severity).toBe('critical');
    expect(alerts[1]!.severity).toBe('warning');
    expect(alerts[2]!.severity).toBe('stale');
  });

  it('无读数且非过期（异常）不生成', () => {
    const well = makeWellWithData(makeWell('WL-CZ-01'), null, 'normal', false);
    expect(buildWellAlerts([well])).toHaveLength(0);
  });

  it('超出阈值比例计算正确', () => {
    const well = makeWellWithData(
      makeWell('WL-CZ-01'),
      makeReading({ stationId: 'WL-CZ-01', channel: 'waterLevel', value: 40 }),
      'critical',
    );
    const alerts = buildWellAlerts([well]);
    // 水位 warning=30, critical=40, value=40
    // exceedPct = (40-30)/30*100 = 33.33 → 33
    expect(alerts[0]!.exceedPct).toBe(33);
  });
});

describe('summarizeAlerts — 汇总统计', () => {
  it('空告警列表', () => {
    const summary = summarizeAlerts([]);
    expect(summary.total).toBe(0);
    expect(summary.affectedWells).toBe(0);
    expect(summary.affectedChannels).toBe(0);
  });

  it('统计各级别数量', () => {
    const alerts = [
      { severity: 'critical' },
      { severity: 'critical' },
      { severity: 'warning' },
      { severity: 'stale' },
    ].map((a, i) => ({
      wellId: `W${i}`, wellName: '', city: '', channel: 'waterLevel' as const,
      value: 0, unit: '', threshold: { warning: 0, critical: 0, direction: 'above' as const },
      severity: a.severity as 'critical' | 'warning' | 'stale',
      status: 'normal' as const, timestamp: 0, isStale: false, exceedPct: 0,
    }));

    const summary = summarizeAlerts(alerts);
    expect(summary.total).toBe(4);
    expect(summary.critical).toBe(2);
    expect(summary.warning).toBe(1);
    expect(summary.stale).toBe(1);
    expect(summary.affectedWells).toBe(4);
  });
});

describe('groupAlertsByChannel — 分组', () => {
  it('按通道分组', () => {
    const critical = makeWellWithData(
      makeWell('WL-CZ-01'),
      makeReading({ stationId: 'WL-CZ-01', channel: 'waterLevel', value: 45 }),
      'critical',
    );
    const wq = makeWellWithData(
      makeWell('WQ-CZ-01'),
      makeReading({ stationId: 'WQ-CZ-01', channel: 'waterQuality', value: 60 }),
      'critical',
    );

    const alerts = buildWellAlerts([critical, wq]);
    const grouped = groupAlertsByChannel(alerts);

    expect(grouped.waterLevel).toHaveLength(1);
    expect(grouped.waterQuality).toHaveLength(1);
    expect(grouped.subsidence).toBeUndefined();
    expect(grouped.extraction).toBeUndefined();
  });
});

describe('filterAlerts — 筛选', () => {
  it('按严重程度筛选', () => {
    const warning = makeWellWithData(
      makeWell('WL-CZ-01'),
      makeReading({ stationId: 'WL-CZ-01', channel: 'waterLevel', value: 35 }),
      'warning',
    );
    const critical = makeWellWithData(
      makeWell('WL-HS-01'),
      makeReading({ stationId: 'WL-HS-01', channel: 'waterLevel', value: 45 }),
      'critical',
    );
    const alerts = buildWellAlerts([warning, critical]);

    expect(filterAlerts(alerts, { severity: 'critical' })).toHaveLength(1);
    expect(filterAlerts(alerts, { severity: 'all' })).toHaveLength(2);
    expect(filterAlerts(alerts, { channel: 'waterLevel' })).toHaveLength(2);
  });
});

describe('formatThresholdText — 阈值文本', () => {
  it('水位文本', () => {
    const text = formatThresholdText('waterLevel');
    expect(text).toContain('30');
    expect(text).toContain('40');
    expect(text).toContain('超标');
  });

  it('水质文本', () => {
    const text = formatThresholdText('waterQuality');
    expect(text).toContain('正常');
    expect(text).toContain('超标');
  });
});

describe('formatAlertThreshold — 单条告警阈值', () => {
  it('格式化告警', () => {
    const well = makeWellWithData(
      makeWell('WL-CZ-01'),
      makeReading({ stationId: 'WL-CZ-01', channel: 'waterLevel', value: 45 }),
      'critical',
    );
    const alert = buildWellAlerts([well])[0]!;
    const text = formatAlertThreshold(alert);
    expect(text).toContain('45.0');
    expect(text).toContain('超标≥40');
  });
});

describe('buildWellTrend — 历史趋势', () => {
  it('空序列', () => {
    const trend = buildWellTrend('WL-CZ-01', 'waterLevel', []);
    expect(trend.count).toBe(0);
    expect(trend.latest).toBeNull();
    expect(trend.delta).toBeNull();
    expect(trend.trendDirection).toBe(0);
  });

  it('上升趋势', () => {
    const readings = [
      makeReading({ stationId: 'WL-CZ-01', channel: 'waterLevel', value: 20, timestamp: 1000 }),
      makeReading({ stationId: 'WL-CZ-01', channel: 'waterLevel', value: 30, timestamp: 2000 }),
      makeReading({ stationId: 'WL-CZ-01', channel: 'waterLevel', value: 45, timestamp: 3000 }),
    ];
    const trend = buildWellTrend('WL-CZ-01', 'waterLevel', readings);
    expect(trend.count).toBe(3);
    expect(trend.latest).toBe(45);
    expect(trend.delta).toBe(25);
    expect(trend.trendDirection).toBe(1);
    expect(trend.hasCritical).toBe(true);
    expect(trend.mean).toBeCloseTo(31.67, 1);
  });

  it('下降趋势', () => {
    const readings = [
      makeReading({ stationId: 'WQ-CZ-01', channel: 'waterQuality', value: 95, timestamp: 1000 }),
      makeReading({ stationId: 'WQ-CZ-01', channel: 'waterQuality', value: 85, timestamp: 2000 }),
      makeReading({ stationId: 'WQ-CZ-01', channel: 'waterQuality', value: 60, timestamp: 3000 }),
    ];
    const trend = buildWellTrend('WQ-CZ-01', 'waterQuality', readings);
    expect(trend.trendDirection).toBe(-1);
    expect(trend.hasCritical).toBe(true);
  });

  it('平稳趋势', () => {
    const readings = [
      makeReading({ stationId: 'WL-CZ-01', channel: 'waterLevel', value: 20, timestamp: 1000 }),
      makeReading({ stationId: 'WL-CZ-01', channel: 'waterLevel', value: 21, timestamp: 2000 }),
      makeReading({ stationId: 'WL-CZ-01', channel: 'waterLevel', value: 20, timestamp: 3000 }),
    ];
    const trend = buildWellTrend('WL-CZ-01', 'waterLevel', readings);
    expect(trend.trendDirection).toBe(0);
  });

  it('点按时间升序排列', () => {
    const readings = [
      makeReading({ stationId: 'WL-CZ-01', channel: 'waterLevel', value: 30, timestamp: 3000 }),
      makeReading({ stationId: 'WL-CZ-01', channel: 'waterLevel', value: 20, timestamp: 1000 }),
      makeReading({ stationId: 'WL-CZ-01', channel: 'waterLevel', value: 25, timestamp: 2000 }),
    ];
    const trend = buildWellTrend('WL-CZ-01', 'waterLevel', readings);
    expect(trend.points[0]!.value).toBe(20);
    expect(trend.points[2]!.value).toBe(30);
  });

  it('不含超标点时 hasCritical 为 false', () => {
    const readings = [
      makeReading({ stationId: 'WL-CZ-01', channel: 'waterLevel', value: 20, timestamp: 1000 }),
      makeReading({ stationId: 'WL-CZ-01', channel: 'waterLevel', value: 25, timestamp: 2000 }),
    ];
    const trend = buildWellTrend('WL-CZ-01', 'waterLevel', readings);
    expect(trend.hasCritical).toBe(false);
  });
});