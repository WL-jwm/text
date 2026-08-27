/**
 * 实时数据服务 — 入口（聚合出口）
 * 核心类见 realtimeServiceCore，类型见 realtimeServiceTypes，常量见 realtimeServiceConstants
 */

import { RealtimeDataService } from './realtimeServiceCore';
import type { RealtimeReading } from './realtimeServiceTypes';
import { ALERT_THRESHOLDS } from './realtimeServiceConstants';

export const realtimeService = new RealtimeDataService();

export function getAlertLevel(
  reading: RealtimeReading,
): 'normal' | 'warning' | 'critical' {
  const threshold = ALERT_THRESHOLDS[reading.channel];
  if (!threshold) return 'normal';

  if (threshold.direction === 'above') {
    if (reading.value >= threshold.critical) return 'critical';
    if (reading.value >= threshold.warning) return 'warning';
  } else {
    if (reading.value <= threshold.critical) return 'critical';
    if (reading.value <= threshold.warning) return 'warning';
  }
  return 'normal';
}

/**
 * 格式化时间戳为 "HH:mm:ss"
 */
export function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
}

/**
 * 格式化时间戳为 "X秒前 / X分钟前"
 */
export function formatTimeAgo(ts: number | undefined): string {
  if (!ts) return '未连接';
  const diff = Date.now() - ts;
  if (diff < 1000) return '刚刚';
  if (diff < 60000) return `${Math.floor(diff / 1000)}秒前`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  return `${Math.floor(diff / 3600000)}小时前`;
}

export type { RealtimeReading, DataChannel, ConnectionStatus, ChannelConfig, SubscriptionCallback } from './realtimeServiceTypes';
export { CHANNEL_CONFIGS, ALERT_THRESHOLDS } from './realtimeServiceConstants';
