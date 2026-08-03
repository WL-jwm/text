/**
 * G-07 性能监控 — 性能监控服务测试
 *
 * 覆盖：
 *   - 记录性能指标
 *   - 计时标记（start/stop）
 *   - 异步函数计时
 *   - 同步函数计时
 *   - 缓存命中统计
 *   - 统计查询
 *   - 通道报告
 *   - 仪表盘数据
 *   - 清除记录
 *   - 订阅
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PerfMonitorService } from '../perfMonitor';

// 注意：PerfMonitorService 未导出，但测试通过 import 来测试 perfMonitor 单例
// 这里我们直接创建一个新实例来测试

describe('PerfMonitorService — 记录指标', () => {
  let monitor: PerfMonitorService;

  beforeEach(() => {
    // 使用构造函数创建新实例
    monitor = new (PerfMonitorService as unknown as new () => PerfMonitorService)();
  });

  it('记录一条指标', () => {
    monitor.record({
      type: 'dataFetch',
      durationMs: 150,
      channel: 'waterLevel',
      success: true,
    });

    const stats = monitor.getStats('dataFetch');
    expect(stats.count).toBe(1);
    expect(stats.avgMs).toBe(150);
    expect(stats.minMs).toBe(150);
    expect(stats.maxMs).toBe(150);
  });

  it('记录多条指标并计算统计', () => {
    const durations = [100, 200, 300, 400, 500];
    for (const d of durations) {
      monitor.record({
        type: 'dataFetch',
        durationMs: d,
        channel: 'waterLevel',
        success: true,
      });
    }

    const stats = monitor.getStats('dataFetch');
    expect(stats.count).toBe(5);
    expect(stats.avgMs).toBe(300);
    expect(stats.minMs).toBe(100);
    expect(stats.maxMs).toBe(500);
    expect(stats.p50Ms).toBe(300);
    expect(stats.p95Ms).toBe(500);
  });

  it('记录失败指标', () => {
    monitor.record({
      type: 'dataFetch',
      durationMs: 100,
      channel: 'waterLevel',
      success: false,
    });

    const stats = monitor.getStats('dataFetch');
    expect(stats.count).toBe(1);
    expect(stats.successRate).toBe(0);
  });

  it('不同指标类型独立统计', () => {
    monitor.record({ type: 'dataFetch', durationMs: 100, channel: 'waterLevel', success: true });
    monitor.record({ type: 'workerProcess', durationMs: 200, label: 'idw', success: true });

    expect(monitor.getStats('dataFetch').count).toBe(1);
    expect(monitor.getStats('workerProcess').count).toBe(1);
    expect(monitor.getStats('dataFetch').avgMs).toBe(100);
    expect(monitor.getStats('workerProcess').avgMs).toBe(200);
  });

  it('空统计返回零值', () => {
    const stats = monitor.getStats('dataFetch');
    expect(stats.count).toBe(0);
    expect(stats.avgMs).toBe(0);
    expect(stats.successRate).toBe(1);
  });
});

describe('PerfMonitorService — 计时标记', () => {
  let monitor: PerfMonitorService;

  beforeEach(() => {
    monitor = new (PerfMonitorService as unknown as new () => PerfMonitorService)();
  });

  it('startMark 和 stopMark 记录耗时', () => {
    const markId = monitor.startMark('dataFetch', 'test', 'waterLevel');
    // 模拟耗时
    const duration = monitor.stopMark(markId, 'dataFetch', { label: 'test', channel: 'waterLevel' });

    expect(duration).toBeGreaterThanOrEqual(0);
    const stats = monitor.getStats('dataFetch');
    expect(stats.count).toBe(1);
  });

  it('无效标记返回 0', () => {
    const duration = monitor.stopMark('nonexistent', 'dataFetch');
    expect(duration).toBe(0);
  });

  it('多次标记独立记录', () => {
    const id1 = monitor.startMark('dataFetch', 'req1', 'waterLevel');
    const id2 = monitor.startMark('dataFetch', 'req2', 'waterQuality');

    monitor.stopMark(id1, 'dataFetch', { label: 'req1' });
    monitor.stopMark(id2, 'dataFetch', { label: 'req2' });

    const stats = monitor.getStats('dataFetch');
    expect(stats.count).toBe(2);
  });
});

describe('PerfMonitorService — 异步函数计时', () => {
  let monitor: PerfMonitorService;

  beforeEach(() => {
    monitor = new (PerfMonitorService as unknown as new () => PerfMonitorService)();
  });

  it('timeAsync 记录成功调用', async () => {
    const result = await monitor.timeAsync(
      'dataFetch',
      async () => {
        await new Promise(r => setTimeout(r, 5));
        return 42;
      },
      { channel: 'waterLevel' },
    );

    expect(result).toBe(42);
    const stats = monitor.getStats('dataFetch');
    expect(stats.count).toBe(1);
    expect(stats.avgMs).toBeGreaterThanOrEqual(5);
    expect(stats.successRate).toBe(1);
  });

  it('timeAsync 记录失败调用', async () => {
    await expect(
      monitor.timeAsync(
        'dataFetch',
        async () => {
          await new Promise(r => setTimeout(r, 5));
          throw new Error('test error');
        },
        { channel: 'waterLevel' },
      ),
    ).rejects.toThrow('test error');

    const stats = monitor.getStats('dataFetch');
    expect(stats.count).toBe(1);
    expect(stats.successRate).toBe(0);
  });
});

describe('PerfMonitorService — 同步函数计时', () => {
  let monitor: PerfMonitorService;

  beforeEach(() => {
    monitor = new (PerfMonitorService as unknown as new () => PerfMonitorService)();
  });

  it('timeSync 记录成功调用', () => {
    const result = monitor.timeSync(
      'renderCycle',
      () => 42,
      { label: 'testComponent' },
    );

    expect(result).toBe(42);
    const stats = monitor.getStats('renderCycle');
    expect(stats.count).toBe(1);
  });

  it('timeSync 记录失败调用', () => {
    expect(() => {
      monitor.timeSync(
        'renderCycle',
        () => { throw new Error('sync error'); },
        { label: 'testComponent' },
      );
    }).toThrow('sync error');

    const stats = monitor.getStats('renderCycle');
    expect(stats.count).toBe(1);
    expect(stats.successRate).toBe(0);
  });
});

describe('PerfMonitorService — 缓存命中统计', () => {
  let monitor: PerfMonitorService;

  beforeEach(() => {
    monitor = new (PerfMonitorService as unknown as new () => PerfMonitorService)();
  });

  it('无缓存记录时命中率 100%', () => {
    expect(monitor.getCacheHitRate()).toBe(1);
  });

  it('记录缓存命中', () => {
    monitor.recordCacheHit();
    monitor.recordCacheHit();
    monitor.recordCacheMiss();

    expect(monitor.getCacheHitRate()).toBeCloseTo(2 / 3);
  });

  it('resetCacheStats 重置', () => {
    monitor.recordCacheHit();
    monitor.recordCacheMiss();
    monitor.resetCacheStats();

    expect(monitor.getCacheHitRate()).toBe(1);
  });
});

describe('PerfMonitorService — 通道报告', () => {
  let monitor: PerfMonitorService;

  beforeEach(() => {
    monitor = new (PerfMonitorService as unknown as new () => PerfMonitorService)();
  });

  it('无数据时返回默认报告', () => {
    const report = monitor.getChannelReport('waterLevel');
    expect(report.channel).toBe('waterLevel');
    expect(report.fetchLatency).toBeNull();
    expect(report.health).toBe('healthy');
    expect(report.healthScore).toBe(100);
  });

  it('有延迟数据时计算健康评分', () => {
    // 写入一些低于 healthy 阈值的数据 (200ms)
    for (let i = 0; i < 5; i++) {
      monitor.record({
        type: 'dataFetch',
        durationMs: 100,
        channel: 'waterLevel',
        success: true,
      });
    }

    const report = monitor.getChannelReport('waterLevel');
    expect(report.fetchLatency).not.toBeNull();
    expect(report.health).toBe('healthy');
    expect(report.healthScore).toBeGreaterThan(75);
  });

  it('高延迟导致降级', () => {
    for (let i = 0; i < 5; i++) {
      monitor.record({
        type: 'dataFetch',
        durationMs: 350,
        channel: 'waterLevel',
        success: true,
      });
    }

    const report = monitor.getChannelReport('waterLevel');
    expect(report.health).toBe('degraded');
    expect(report.healthScore).toBeLessThan(75);
    expect(report.healthScore).toBeGreaterThanOrEqual(50);
  });

  it('极高延迟导致异常', () => {
    for (let i = 0; i < 5; i++) {
      monitor.record({
        type: 'dataFetch',
        durationMs: 1000,
        channel: 'waterLevel',
        success: true,
      });
    }

    const report = monitor.getChannelReport('waterLevel');
    expect(report.health).toBe('unhealthy');
    expect(report.healthScore).toBeLessThan(50);
  });

  it('recentLatencies 返回最近 20 条', () => {
    for (let i = 0; i < 25; i++) {
      monitor.record({
        type: 'dataFetch',
        durationMs: 100,
        channel: 'waterLevel',
        success: true,
      });
    }

    const report = monitor.getChannelReport('waterLevel');
    expect(report.recentLatencies.length).toBeLessThanOrEqual(20);
  });
});

describe('PerfMonitorService — 仪表盘数据', () => {
  let monitor: PerfMonitorService;

  beforeEach(() => {
    monitor = new (PerfMonitorService as unknown as new () => PerfMonitorService)();
  });

  it('空数据返回默认仪表盘', () => {
    const dashboard = monitor.getDashboard();
    expect(dashboard.overallHealth).toBe(100);
    expect(dashboard.cacheHitRate).toBe(1);
    expect(dashboard.channels).toHaveProperty('waterLevel');
    expect(dashboard.channels).toHaveProperty('waterQuality');
    expect(dashboard.channels).toHaveProperty('subsidence');
    expect(dashboard.channels).toHaveProperty('extraction');
    expect(dashboard.workerStats).toBeNull();
    expect(dashboard.renderStats).toBeNull();
  });

  it('有数据时计算总体健康', () => {
    for (const ch of ['waterLevel', 'waterQuality', 'subsidence', 'extraction'] as const) {
      for (let i = 0; i < 3; i++) {
        monitor.record({
          type: 'dataFetch',
          durationMs: 100,
          channel: ch,
          success: true,
        });
      }
    }

    const dashboard = monitor.getDashboard();
    expect(dashboard.overallHealth).toBeGreaterThan(75);
  });

  it('Worker 统计包含在仪表盘中', () => {
    monitor.record({ type: 'workerProcess', durationMs: 50, label: 'idw', success: true });
    monitor.record({ type: 'workerProcess', durationMs: 150, label: 'contour', success: true });

    const dashboard = monitor.getDashboard();
    expect(dashboard.workerStats).not.toBeNull();
    expect(dashboard.workerStats!.count).toBe(2);
    expect(dashboard.workerStats!.avgMs).toBe(100);
  });

  it('recentTrend 包含最近记录', () => {
    for (let i = 0; i < 10; i++) {
      monitor.record({
        type: 'dataFetch',
        durationMs: 100 + i * 10,
        channel: 'waterLevel',
        success: true,
      });
    }

    const dashboard = monitor.getDashboard();
    expect(dashboard.recentTrend.length).toBeGreaterThanOrEqual(10);
  });
});

describe('PerfMonitorService — 清除记录', () => {
  let monitor: PerfMonitorService;

  beforeEach(() => {
    monitor = new (PerfMonitorService as unknown as new () => PerfMonitorService)();
  });

  it('clear 清除所有记录', () => {
    monitor.record({ type: 'dataFetch', durationMs: 100, channel: 'waterLevel', success: true });
    monitor.record({ type: 'workerProcess', durationMs: 50, label: 'idw', success: true });

    monitor.clear();

    expect(monitor.getStats('dataFetch').count).toBe(0);
    expect(monitor.getStats('workerProcess').count).toBe(0);
  });

  it('clear(sinceMs) 仅清除旧记录', () => {
    monitor.record({ type: 'dataFetch', durationMs: 100, channel: 'waterLevel', success: true });

    // 模拟时间推进
    const entries = monitor.getEntries();
    const oldTimestamp = entries[0]!.timestamp - 100000;
    // 直接修改时间戳
    Object.defineProperty(entries[0], 'timestamp', { value: oldTimestamp });

    monitor.record({ type: 'dataFetch', durationMs: 200, channel: 'waterLevel', success: true });

    // 清除 1 分钟前的数据（即第一条）
    monitor.clear(60000);

    expect(monitor.getStats('dataFetch').count).toBe(1);
  });
});

describe('PerfMonitorService — 订阅', () => {
  let monitor: PerfMonitorService;

  beforeEach(() => {
    monitor = new (PerfMonitorService as unknown as new () => PerfMonitorService)();
  });

  it('subscribe 接收新记录', () => {
    const callback = vi.fn();
    const unsub = monitor.subscribe(callback);

    monitor.record({ type: 'dataFetch', durationMs: 100, channel: 'waterLevel', success: true });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'dataFetch',
        durationMs: 100,
        channel: 'waterLevel',
      }),
    );

    unsub();
  });

  it('unsubscribe 停止接收', () => {
    const callback = vi.fn();
    const unsub = monitor.subscribe(callback);
    unsub();

    monitor.record({ type: 'dataFetch', durationMs: 100, channel: 'waterLevel', success: true });

    expect(callback).not.toHaveBeenCalled();
  });

  it('多个订阅者各自接收', () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    monitor.subscribe(cb1);
    monitor.subscribe(cb2);

    monitor.record({ type: 'dataFetch', durationMs: 100, channel: 'waterLevel', success: true });

    expect(cb1).toHaveBeenCalledTimes(1);
    expect(cb2).toHaveBeenCalledTimes(1);
  });
});

describe('PerfMonitorService — 环形缓冲区', () => {
  let monitor: PerfMonitorService;

  beforeEach(() => {
    monitor = new (PerfMonitorService as unknown as new () => PerfMonitorService)();
  });

  it('超出 MAX_ENTRIES 时自动裁剪', () => {
    // 记录大量数据
    const maxEntries = 5000;
    for (let i = 0; i < maxEntries + 100; i++) {
      monitor.record({ type: 'dataFetch', durationMs: 100, channel: 'waterLevel', success: true });
    }

    const entries = monitor.getEntries();
    expect(entries.length).toBeLessThanOrEqual(maxEntries);
  });
});