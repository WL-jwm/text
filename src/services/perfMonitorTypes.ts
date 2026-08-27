/**
 * 性能监控器 — 类型定义
 */

import type { DataChannel } from './realtimeDataService';

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

