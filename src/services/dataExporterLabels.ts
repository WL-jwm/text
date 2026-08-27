/**
 * 数据导出器 — 频道/严重度标签
 */

export const CHANNEL_LABELS: Record<string, string> = {
  waterLevel: '水位埋深',
  waterQuality: '水质达标率',
  subsidence: '沉降速率',
  extraction: '开采量',
};
export const SEVERITY_LABELS: Record<string, string> = {
  critical: '超标',
  warning: '预警',
  stale: '过期',
};

/** 构造告警消息文本 */
