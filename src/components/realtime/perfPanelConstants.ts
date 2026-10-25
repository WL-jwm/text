/**
 * 拆分自 PerformancePanel.tsx — 性能面板常量
 */

import type { MetricType } from '../../services/perfMonitor';
import type { DataChannel } from '../../services/realtimeDataService';

export const CHANNEL_LABELS: Record<DataChannel, string> = {
  waterLevel: '水位埋深',
  waterQuality: '水质达标率',
  subsidence: '沉降速率',
  extraction: '开采量',
};

export const CHANNEL_COLORS: Record<DataChannel, string> = {
  waterLevel: '#06b6d4',
  waterQuality: '#10b981',
  subsidence: '#ef4444',
  extraction: '#f59e0b',
};

export const HEALTH_CONFIG = {
  healthy: { label: '健康', color: '#10b981', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  degraded: { label: '降级', color: '#f59e0b', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  unhealthy: { label: '异常', color: '#ef4444', bg: 'bg-red-500/10', border: 'border-red-500/30' },
} as const;

export const METRIC_LABELS: Record<MetricType, string> = {
  dataFetch: '数据获取',
  workerProcess: 'Worker处理',
  renderCycle: '渲染周期',
  cacheHit: '缓存命中',
  evaluation: '质量评估',
};
