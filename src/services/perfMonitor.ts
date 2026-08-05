/**
 * G-07 性能监控 — 性能指标采集服务
 *
 * 追踪系统关键性能指标：
 *   1. 数据获取延迟（per-channel）
 *   2. Worker 处理时间
 *   3. 组件渲染周期
 *   4. 缓存命中率
 *   5. 内存使用估算
 */

import type { DataChannel } from './realtimeDataService';

// ============================================================
// 类型定义
// ============================================================

/** 性能指标类型 */
export type MetricType =
  | 'dataFetch'       // 数据获取延迟
  | 'workerProcess'   // Worker 处理时间
  | 'renderCycle'     // 组件渲染周期
  | 'cacheHit'        // 缓存命中
  | 'evaluation'      // 质量评估耗时
  ;

/** 单条性能记录 */
export interface PerfEntry {
  type: MetricType;
  /** 耗时（毫秒） */
  durationMs: number;
  /** 关联通道 */
  channel?: DataChannel;
  /** 关联标签（如 worker 任务类型、组件名） */
  label?: string;
  /** 时间戳 */
  timestamp: number;
  /** 是否成功 */
  success: boolean;
  /** 附加数据 */
  metadata?: Record<string, unknown>;
}

/** 汇总统计 */
export interface PerfStats {
  /** 指标类型 */
  type: MetricType;
  /** 记录数 */
  count: number;
  /** 平均耗时 */
  avgMs: number;
  /** P50 耗时 */
  p50Ms: number;
  /** P95 耗时 */
  p95Ms: number;
  /** P99 耗时 */
  p99Ms: number;
  /** 最小耗时 */
  minMs: number;
  /** 最大耗时 */
  maxMs: number;
  /** 成功率 */
  successRate: number;
}

/** 通道性能报告 */
export interface ChannelPerfReport {
  channel: DataChannel;
  /** 数据获取延迟统计 */
  fetchLatency: PerfStats | null;
  /** 最近 N 条耗时 */
  recentLatencies: number[];
  /** 健康状态 */
  health: 'healthy' | 'degraded' | 'unhealthy';
  /** 健康评分 0-100 */
  healthScore: number;
}

/** 总体性能仪表盘数据 */
export interface PerfDashboard {
  /** 各通道报告 */
  channels: Record<DataChannel, ChannelPerfReport>;
  /** Worker 处理统计 */
  workerStats: PerfStats | null;
  /** 渲染周期统计 */
  renderStats: PerfStats | null;
  /** 缓存命中率 */
  cacheHitRate: number;
  /** 总体健康评分 */
  overallHealth: number;
  /** 近期耗时趋势（最近 100 条记录） */
  recentTrend: number[];
}

// ============================================================
// 健康阈值
// ============================================================

const HEALTH_THRESHOLDS: Record<DataChannel, { healthy: number; degraded: number }> = {
  waterLevel: { healthy: 200, degraded: 500 },
  waterQuality: { healthy: 300, degraded: 600 },
  subsidence: { healthy: 300, degraded: 600 },
  extraction: { healthy: 200, degraded: 500 },
};

const DEFAULT_HEALTH_THRESHOLD = { healthy: 300, degraded: 600 };

// ============================================================
// 性能监控服务
// ============================================================

export class PerfMonitorService {
  /** 所有性能记录（环形缓冲区） */
  private entries: PerfEntry[] = [];
  private readonly MAX_ENTRIES = 5000;

  /** 缓存命中统计 */
  private cacheHits = 0;
  private cacheMisses = 0;

  /** 当前正在进行的测量 */
  private activeMarks = new Map<string, number>();

  /** 订阅者 */
  private listeners = new Set<(entry: PerfEntry) => void>();

  // ============================================================
  // 记录方法
  // ============================================================

  /**
   * 记录一条性能指标
   */
  record(entry: Omit<PerfEntry, 'timestamp'>): void {
    const fullEntry: PerfEntry = {
      ...entry,
      timestamp: Date.now(),
    };

    this.entries.push(fullEntry);
    if (this.entries.length > this.MAX_ENTRIES) {
      this.entries.splice(0, this.entries.length - this.MAX_ENTRIES);
    }

    this.listeners.forEach(cb => cb(fullEntry));
  }

  /**
   * 开始计时（标记开始时间）
   * @returns 标记 ID，用于 stopMark
   */
  startMark(type: MetricType, label?: string, channel?: DataChannel): string {
    const id = `${type}-${label ?? ''}-${channel ?? ''}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.activeMarks.set(id, performance.now());
    return id;
  }

  /**
   * 结束计时并记录
   */
  stopMark(
    markId: string,
    type: MetricType,
    overrides?: { label?: string; channel?: DataChannel; success?: boolean; metadata?: Record<string, unknown> },
  ): number {
    const start = this.activeMarks.get(markId);
    if (start === undefined) return 0;

    const duration = performance.now() - start;
    this.activeMarks.delete(markId);

    this.record({
      type,
      durationMs: Math.round(duration * 100) / 100,
      label: overrides?.label,
      channel: overrides?.channel,
      success: overrides?.success ?? true,
      metadata: overrides?.metadata,
    });

    return duration;
  }

  /**
   * 便捷方法：异步函数计时包装
   */
  async timeAsync<T>(
    type: MetricType,
    fn: () => Promise<T>,
    options?: { label?: string; channel?: DataChannel },
  ): Promise<T> {
    const markId = this.startMark(type, options?.label, options?.channel);
    try {
      const result = await fn();
      this.stopMark(markId, type, { ...options, success: true });
      return result;
    } catch (err) {
      this.stopMark(markId, type, {
        ...options,
        success: false,
        metadata: { error: err instanceof Error ? err.message : String(err) },
      });
      throw err;
    }
  }

  /**
   * 同步函数计时包装
   */
  timeSync<T>(
    type: MetricType,
    fn: () => T,
    options?: { label?: string; channel?: DataChannel },
  ): T {
    const markId = this.startMark(type, options?.label, options?.channel);
    try {
      const result = fn();
      this.stopMark(markId, type, { ...options, success: true });
      return result;
    } catch (err) {
      this.stopMark(markId, type, {
        ...options,
        success: false,
        metadata: { error: err instanceof Error ? err.message : String(err) },
      });
      throw err;
    }
  }

  // ============================================================
  // 缓存命中跟踪
  // ============================================================

  recordCacheHit(): void {
    this.cacheHits++;
  }

  recordCacheMiss(): void {
    this.cacheMisses++;
  }

  getCacheHitRate(): number {
    const total = this.cacheHits + this.cacheMisses;
    return total === 0 ? 1 : this.cacheHits / total;
  }

  resetCacheStats(): void {
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  // ============================================================
  // 查询与统计
  // ============================================================

  /**
   * 获取指定类型的统计
   */
  getStats(type: MetricType, sinceMs?: number): PerfStats {
    const filtered = sinceMs
      ? this.entries.filter(e => e.type === type && e.timestamp > Date.now() - sinceMs)
      : this.entries.filter(e => e.type === type);

    if (filtered.length === 0) {
      return {
        type,
        count: 0,
        avgMs: 0,
        p50Ms: 0,
        p95Ms: 0,
        p99Ms: 0,
        minMs: 0,
        maxMs: 0,
        successRate: 1,
      };
    }

    const durations = filtered.map(e => e.durationMs).sort((a, b) => a - b);
    const successCount = filtered.filter(e => e.success).length;
    const sum = durations.reduce((s, v) => s + v, 0);

    return {
      type,
      count: filtered.length,
      avgMs: Math.round((sum / filtered.length) * 100) / 100,
      p50Ms: percentile(durations, 0.5),
      p95Ms: percentile(durations, 0.95),
      p99Ms: percentile(durations, 0.99),
      minMs: durations[0] ?? 0,
      maxMs: durations[durations.length - 1] ?? 0,
      successRate: successCount / filtered.length,
    };
  }

  /**
   * 获取通道性能报告
   */
  getChannelReport(channel: DataChannel, sinceMs = 300000): ChannelPerfReport {
    const thresholds = HEALTH_THRESHOLDS[channel] ?? DEFAULT_HEALTH_THRESHOLD;

    // 获取该通道的数据获取延迟记录
    const fetchEntries = this.entries.filter(
      e => e.type === 'dataFetch' && e.channel === channel && e.timestamp > Date.now() - sinceMs,
    );

    const fetchLatency = fetchEntries.length > 0 ? this.getStats('dataFetch', sinceMs) : null;

    const recentLatencies = fetchEntries
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 20)
      .map(e => e.durationMs);

    // 计算健康评分
    const avgLatency = fetchEntries.length > 0
      ? fetchEntries.reduce((s, e) => s + e.durationMs, 0) / fetchEntries.length
      : 0;

    let healthScore: number;
    let health: 'healthy' | 'degraded' | 'unhealthy';

    if (avgLatency <= thresholds.healthy) {
      healthScore = 100 - (avgLatency / thresholds.healthy) * 25;
      health = 'healthy';
    } else if (avgLatency <= thresholds.degraded) {
      healthScore = 75 - ((avgLatency - thresholds.healthy) / (thresholds.degraded - thresholds.healthy)) * 25;
      health = 'degraded';
    } else {
      healthScore = Math.max(0, 50 - ((avgLatency - thresholds.degraded) / thresholds.degraded) * 50);
      health = 'unhealthy';
    }

    return {
      channel,
      fetchLatency,
      recentLatencies,
      health,
      healthScore: Math.round(healthScore),
    };
  }

  /**
   * 获取总体性能仪表盘数据
   */
  getDashboard(sinceMs = 300000): PerfDashboard {
    const channels: DataChannel[] = ['waterLevel', 'waterQuality', 'subsidence', 'extraction'];

    const channelReports: Record<string, ChannelPerfReport> = {};
    let totalHealth = 0;

    for (const ch of channels) {
      const report = this.getChannelReport(ch, sinceMs);
      channelReports[ch] = report;
      totalHealth += report.healthScore;
    }

    const workerStats = this.getStats('workerProcess', sinceMs);

    // 最近耗时趋势
    const recentTrend = this.entries
      .filter(e => e.type === 'dataFetch' && e.timestamp > Date.now() - sinceMs)
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-100)
      .map(e => e.durationMs);

    return {
      channels: channelReports as Record<DataChannel, ChannelPerfReport>,
      workerStats: workerStats.count > 0 ? workerStats : null,
      renderStats: this.getStats('renderCycle', sinceMs).count > 0 ? this.getStats('renderCycle', sinceMs) : null,
      cacheHitRate: this.getCacheHitRate(),
      overallHealth: Math.round(totalHealth / channels.length),
      recentTrend,
    };
  }

  /**
   * 获取所有记录（用于调试）
   */
  getEntries(): PerfEntry[] {
    return [...this.entries];
  }

  /**
   * 清除记录
   */
  clear(sinceMs?: number): void {
    if (sinceMs) {
      const cutoff = Date.now() - sinceMs;
      this.entries = this.entries.filter(e => e.timestamp > cutoff);
    } else {
      this.entries = [];
      this.cacheHits = 0;
      this.cacheMisses = 0;
    }
  }

  // ============================================================
  // 订阅
  // ============================================================

  subscribe(callback: (entry: PerfEntry) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
}

// ============================================================
// 工具函数
// ============================================================

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const index = Math.ceil(p * sorted.length) - 1;
  return sorted[Math.max(0, index)] ?? 0;
}

// 单例导出
export const perfMonitor = new PerfMonitorService();

// ============================================================
// 性能监控装饰器（用于类方法）
// ============================================================

/**
 * 方法装饰器：自动计时
 * 用法：@perfTrack('dataFetch', { label: 'fetchReadings' })
 */
export function perfTrack(type: MetricType, options?: { label?: string; channel?: DataChannel }) {
  return function (_target: unknown, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: unknown[]) {
      const markId = perfMonitor.startMark(type, options?.label, options?.channel);
      try {
        const result = originalMethod.apply(this, args);
        if (result instanceof Promise) {
          return result.then(
            (val: unknown) => {
              perfMonitor.stopMark(markId, type, { ...options, success: true });
              return val;
            },
            (err: Error) => {
              perfMonitor.stopMark(markId, type, {
                ...options,
                success: false,
                metadata: { error: err.message },
              });
              throw err;
            },
          );
        }
        perfMonitor.stopMark(markId, type, { ...options, success: true });
        return result;
      } catch (err) {
        perfMonitor.stopMark(markId, type, {
          ...options,
          success: false,
          metadata: { error: err instanceof Error ? err.message : String(err) },
        });
        throw err;
      }
    };
    return descriptor;
  };
}

// ============================================================
// React DevTools 兼容
// ============================================================

// 在开发模式下暴露到全局
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as unknown as Record<string, unknown>).__perfMonitor = perfMonitor;
}