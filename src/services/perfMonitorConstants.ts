/**
 * 性能监控器 — 健康阈值
 */

import type { DataChannel } from './realtimeDataService';

export const HEALTH_THRESHOLDS: Record<DataChannel, { healthy: number; degraded: number }> = {
  waterLevel: { healthy: 200, degraded: 500 },
  waterQuality: { healthy: 300, degraded: 600 },
  subsidence: { healthy: 300, degraded: 600 },
  extraction: { healthy: 200, degraded: 500 },
};

export const DEFAULT_HEALTH_THRESHOLD = { healthy: 300, degraded: 600 };

// ============================================================
// 性能监控服务
// ============================================================

