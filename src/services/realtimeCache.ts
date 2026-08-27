/**
 * 实时缓存服务 — 入口（聚合出口）
 * 核心类见 realtimeCacheCore，类型见 realtimeCacheTypes，工具见 realtimeCacheUtils
 */

import { RealtimeCacheService } from './realtimeCacheCore';

export const realtimeCache = new RealtimeCacheService();

export type { CachedReading, ChannelStats, CacheMeta, OfflineAnalysisResult, TimeRangeQuery } from './realtimeCacheTypes';
