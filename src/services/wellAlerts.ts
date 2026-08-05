/**
 * H-02 实时读数历史趋势与告警联动 — 服务层
 *
 * 在 H-01b 井-读数关联基础上，深化告警与历史趋势能力：
 *   1. 井告警生成（含阈值上下文 / 严重程度 / 状态）
 *   2. 告警分组与汇总
 *   3. 阈值文本格式化
 *   4. 单井历史趋势分析（从读数序列提取统计特征）
 */

import type { DataChannel, RealtimeReading } from './realtimeDataService';
import { ALERT_THRESHOLDS, getAlertLevel } from './realtimeDataService';
import type { WellWithData, WellRealtimeStatus } from './wellRealtime';

// ============================================================
// 类型定义
// ============================================================

/** 告警严重程度 */
export type AlertSeverity = 'critical' | 'warning' | 'stale';

/** 单井告警记录 */
export interface WellAlert {
  wellId: string;
  wellName: string;
  city: string;
  channel: DataChannel;
  /** 当前值 */
  value: number;
  /** 单位 */
  unit: string;
  /** 阈值配置 */
  threshold: { warning: number; critical: number; direction: 'above' | 'below' };
  /** 严重程度 */
  severity: AlertSeverity;
  /** 井实时状态 */
  status: WellRealtimeStatus;
  /** 触发时间 */
  timestamp: number;
  /** 是否过期 */
  isStale: boolean;
  /** 超出阈值比例（0-100%，用于排序） */
  exceedPct: number;
}

/** 告警汇总统计 */
export interface WellAlertSummary {
  total: number;
  critical: number;
  warning: number;
  stale: number;
  /** 涉及的井数 */
  affectedWells: number;
  /** 涉及的通道数 */
  affectedChannels: number;
}

// ============================================================
// 告警生成
// ============================================================

/**
 * 从带实时数据的井列表生成告警记录
 */
export function buildWellAlerts(wellsWithData: WellWithData[]): WellAlert[] {
  const alerts: WellAlert[] = [];

  for (const well of wellsWithData) {
    const rt = well.realtime;

    // 过期井
    if (rt.status === 'stale') {
      alerts.push({
        wellId: well.id,
        wellName: well.name,
        city: well.city,
        channel: rt.reading?.channel ?? well.indicators[0] ?? 'waterLevel',
        value: rt.value ?? NaN,
        unit: rt.unit || '',
        threshold: rt.reading ? ALERT_THRESHOLDS[rt.reading.channel] : { warning: 0, critical: 0, direction: 'above' },
        severity: 'stale',
        status: 'stale',
        timestamp: rt.timestamp ?? Date.now(),
        isStale: true,
        exceedPct: 0,
      });
      continue;
    }

    // 非过期但无读数或正常，跳过
    if (!rt.reading || rt.status === 'normal') continue;

    const channel = rt.reading.channel;
    const threshold = ALERT_THRESHOLDS[channel];
    if (!threshold) continue;

    const level = getAlertLevel(rt.reading);
    if (level === 'normal') continue;

    const severity: AlertSeverity = level === 'critical' ? 'critical' : 'warning';

    // 计算超出阈值比例
    let exceedPct = 0;
    if (threshold.direction === 'above') {
      const base = threshold.warning;
      if (rt.value !== null && rt.value > base) {
        exceedPct = Math.min(100, Math.round(((rt.value - base) / Math.max(base, 1)) * 100));
      }
    } else {
      const base = threshold.warning;
      if (rt.value !== null && rt.value < base) {
        exceedPct = Math.min(100, Math.round(((base - rt.value) / Math.max(base, 1)) * 100));
      }
    }

    alerts.push({
      wellId: well.id,
      wellName: well.name,
      city: well.city,
      channel,
      value: rt.value ?? NaN,
      unit: rt.unit,
      threshold,
      severity,
      status: rt.status,
      timestamp: rt.timestamp ?? Date.now(),
      isStale: false,
      exceedPct,
    });
  }

  // 排序：超标优先，其次预警，再次过期；同级别按超限比例降序
  const severityOrder: Record<AlertSeverity, number> = { critical: 0, warning: 1, stale: 2 };
  return alerts.sort((a, b) => {
    const sevDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (sevDiff !== 0) return sevDiff;
    return b.exceedPct - a.exceedPct;
  });
}

/**
 * 告警汇总统计
 */
export function summarizeAlerts(alerts: WellAlert[]): WellAlertSummary {
  const affectedWells = new Set(alerts.map(a => a.wellId));
  const affectedChannels = new Set(alerts.map(a => a.channel));

  return {
    total: alerts.length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    warning: alerts.filter(a => a.severity === 'warning').length,
    stale: alerts.filter(a => a.severity === 'stale').length,
    affectedWells: affectedWells.size,
    affectedChannels: affectedChannels.size,
  };
}

/**
 * 按通道分组告警
 */
export function groupAlertsByChannel(alerts: WellAlert[]): Partial<Record<DataChannel, WellAlert[]>> {
  const channels: DataChannel[] = ['waterLevel', 'waterQuality', 'subsidence', 'extraction'];
  const result: Partial<Record<DataChannel, WellAlert[]>> = {};
  for (const ch of channels) {
    const list = alerts.filter(a => a.channel === ch);
    if (list.length > 0) result[ch] = list;
  }
  return result;
}

/**
 * 筛选告警（按严重程度 / 通道）
 */
export function filterAlerts(
  alerts: WellAlert[],
  filter?: { severity?: AlertSeverity | 'all'; channel?: DataChannel | 'all' },
): WellAlert[] {
  return alerts.filter(a => {
    if (filter?.severity && filter.severity !== 'all' && a.severity !== filter.severity) return false;
    if (filter?.channel && filter.channel !== 'all' && a.channel !== filter.channel) return false;
    return true;
  });
}

// ============================================================
// 阈值文本格式化
// ============================================================

/**
 * 格式化阈值说明文本
 * 例：水位 → "正常 <30，预警 30~40，超标 ≥40"
 */
export function formatThresholdText(channel: DataChannel): string {
  const threshold = ALERT_THRESHOLDS[channel];
  if (!threshold) return '';

  const { warning, critical, direction } = threshold;
  const unit = UNIT_LABELS[channel];

  if (direction === 'above') {
    return `正常 <${warning}${unit}，预警 ${warning}~${critical}${unit}，超标 ≥${critical}${unit}`;
  }
  return `正常 >${warning}${unit}，预警 ${critical}~${warning}${unit}，超标 ≤${critical}${unit}`;
}

const UNIT_LABELS: Record<DataChannel, string> = {
  waterLevel: 'm',
  waterQuality: '%',
  subsidence: 'mm/a',
  extraction: 'm³/d',
};

/**
 * 格式化单条告警的阈值说明
 */
export function formatAlertThreshold(a: WellAlert): string {
  const { warning, critical, direction } = a.threshold;
  if (direction === 'above') {
    return `当前 ${a.value.toFixed(1)}${a.unit}（预警≥${warning}，超标≥${critical}）`;
  }
  return `当前 ${a.value.toFixed(1)}${a.unit}（预警≤${warning}，超标≤${critical}）`;
}

// ============================================================
// 历史趋势分析
// ============================================================

/**
 * 单井历史读数趋势特征
 */
export interface WellTrend {
  wellId: string;
  channel: DataChannel;
  points: Array<{ timestamp: number; value: number }>;
  count: number;
  mean: number;
  min: number;
  max: number;
  /** 最新值 */
  latest: number | null;
  /** 较首个值的净变化 */
  delta: number | null;
  /** 趋势方向（-1 下降 / 0 平稳 / 1 上升） */
  trendDirection: -1 | 0 | 1;
  /** 是否包含超标点 */
  hasCritical: boolean;
}

/**
 * 从井的历史读数序列提取趋势特征
 * @param wellId — 井 ID
 * @param readings — 该井通道的历史读数（按时间升序）
 */
export function buildWellTrend(wellId: string, channel: DataChannel, readings: RealtimeReading[]): WellTrend {
  const sorted = [...readings].sort((a, b) => a.timestamp - b.timestamp);

  const points = sorted.map(r => ({ timestamp: r.timestamp, value: r.value }));

  const count = points.length;
  const mean = count > 0 ? points.reduce((s, p) => s + p.value, 0) / count : 0;
  const values = points.map(p => p.value);
  const min = count > 0 ? Math.min(...values) : 0;
  const max = count > 0 ? Math.max(...values) : 0;
  const latest = count > 0 ? points[count - 1]!.value : null;
  const delta = count >= 2 ? latest! - points[0]!.value : null;

  // 趋势方向：基于首尾变化与波动范围
  let trendDirection: -1 | 0 | 1 = 0;
  if (count >= 2 && delta !== null) {
    const range = max - min || 1;
    const threshold = range * 0.1;
    if (delta > threshold) trendDirection = 1;
    else if (delta < -threshold) trendDirection = -1;
  }

  // 是否含超标点
  const hasCritical = sorted.some(r => getAlertLevel(r) === 'critical');

  return {
    wellId,
    channel,
    points,
    count,
    mean: Math.round(mean * 100) / 100,
    min,
    max,
    latest,
    delta: delta !== null ? Math.round(delta * 100) / 100 : null,
    trendDirection,
    hasCritical,
  };
}

// ============================================================
// 展示配置
// ============================================================

export const ALERT_SEVERITY_CONFIG: Record<AlertSeverity, {
  label: string;
  color: string;
  bg: string;
  border: string;
}> = {
  critical: { label: '超标', color: '#ef4444', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  warning: { label: '预警', color: '#f59e0b', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  stale: { label: '过期', color: '#9ca3af', bg: 'bg-gray-500/10', border: 'border-gray-500/30' },
};