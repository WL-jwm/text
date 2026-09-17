/**
 * 井健康报告服务 (G-14) — 标签常量
 * 拆分自 wellReport.ts：通道/状态/严重级别标签
 */

import type { DataChannel } from './realtimeDataService';
import type { WellAlert } from './wellAlerts';
import type { WellRealtimeStatus } from './wellRealtime';

export const CHANNEL_LABELS: Record<DataChannel, string> = {
  waterLevel: '水位埋深',
  waterQuality: '水质达标率',
  subsidence: '沉降速率',
  extraction: '开采量',
};

export const STATUS_LABELS: Record<WellRealtimeStatus, string> = {
  normal: '正常',
  warning: '预警',
  critical: '超标',
  stale: '过期',
};

export const SEVERITY_LABELS: Record<WellAlert['severity'], string> = {
  critical: '超标',
  warning: '预警',
  stale: '过期',
};

// ============================================================
// 数据组装
// ============================================================

/**
 * 从井实时数据组装报告数据结构
 */
