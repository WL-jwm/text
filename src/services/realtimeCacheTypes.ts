/**
 * 实时缓存服务 — 类型与常量
 */

import type { DBSchema } from 'idb';
import type { RealtimeReading, DataChannel } from './realtimeDataService';

export interface CachedReading extends RealtimeReading {
  /** 唯一主键: `${channel}-${timestamp}-${stationId}` */
  id: string;
  /** 入库时间 */
  cachedAt: number;
}

/** 预聚合统计 */
export interface ChannelStats {
  /** 主键: `${channel}-${date}` 如 `waterLevel-2026-08-03` */
  id: string;
  channel: DataChannel;
  /** 日期 YYYY-MM-DD */
  date: string;
  /** 样本数 */
  count: number;
  /** 均值 */
  mean: number;
  /** 最小值 */
  min: number;
  /** 最大值 */
  max: number;
  /** 标准差 */
  std: number;
  /** 中位数 */
  median: number;
  /** P25 分位数 */
  p25: number;
  /** P75 分位数 */
  p75: number;
  /** 更新时间 */
  updatedAt: number;
}

/** 元数据键值 */
export interface CacheMeta {
  key: string;
  value: unknown;
  updatedAt: number;
}

/** 离线分析结果 */
export interface OfflineAnalysisResult {
  channel: DataChannel;
  totalReadings: number;
  timeRange: { start: number; end: number } | null;
  stationCount: number;
  stats: {
    mean: number;
    min: number;
    max: number;
    std: number;
    median: number;
  };
  /** 按站点分组统计 */
  byStation: Array<{
    stationId: string;
    stationName: string;
    count: number;
    mean: number;
    min: number;
    max: number;
  }>;
  /** 按小时分桶均值（24h 热力图数据） */
  hourlyAverages: number[];
}

/** 时间范围查询参数 */
export interface TimeRangeQuery {
  channel: DataChannel;
  startTime: number;
  endTime: number;
  /** 限制返回条数 */
  limit?: number;
}

// ============================================================
// DB Schema 定义
// ============================================================

export interface RealtimeCacheDBSchema extends DBSchema {
  readings: {
    key: string;
    value: CachedReading;
    indexes: {
      'by-channel': DataChannel;
      'by-timestamp': number;
      'by-channel-timestamp': [DataChannel, number];
    };
  };
  stats: {
    key: string;
    value: ChannelStats;
    indexes: {
      'by-channel': DataChannel;
    };
  };
  meta: {
    key: string;
    value: CacheMeta;
  };
}

// ============================================================
// 常量
// ============================================================

export const DB_NAME = 'hebei-gw-realtime-cache';
export const DB_VERSION = 1;
export const MAX_RETENTION_DAYS = 7;
export const MAX_READINGS_PER_CHANNEL = 10000;
export const CLEANUP_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 小时

// ============================================================
// 缓存服务
// ============================================================
