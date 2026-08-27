/**
 * 性能监控器 — 核心服务类
 *  指标记录 / 缓存命中 / 统计查询 / 订阅
 */

import type { DataChannel } from './realtimeDataService';
import type { MetricType, PerfEntry, PerfStats, ChannelPerfReport, PerfDashboard } from './perfMonitorTypes';
import { HEALTH_THRESHOLDS, DEFAULT_HEALTH_THRESHOLD } from './perfMonitorConstants';

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
