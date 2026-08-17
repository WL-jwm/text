/**
 * H-03 报告自动生成 — 报告数据模型与组装
 *
 * 将井网 + 实时读数 + 空间分析 + 告警数据组装为结构化报告数据，
 * 供 Word 报告生成器渲染。纯逻辑、可测试。
 */

import type { DataChannel } from './realtimeDataService';
import { ALERT_THRESHOLDS } from './realtimeDataService';
import { AQUIFER_LABELS } from './wellNetwork';
import type { AquiferType } from './wellNetwork';
import type { WellWithData, WellRealtimeStatus } from './wellRealtime';
import type { WellAlert, AlertSeverity } from './wellAlerts';

// ============================================================
// 类型定义
// ============================================================

export interface WellReportMeta {
  title: string;
  unit: string;
  generatedAt: number;
  period: string;
  /** 报告编号（PDF/Excel/Word 页眉与文件名使用） */
  reportId: string;
}

export interface WellReportSummary {
  totalWells: number;
  cities: number;
  activeWells: number;
  aquiferTypes: number;
  coverage: number;
  abnormalCount: number;
  criticalCount: number;
  /** 告警总数（PDF/Excel/Word 摘要卡使用） */
  alertCount: number;
  /** 严重告警数 */
  criticalAlerts: number;
  /** 评估日期（YYYY-MM-DD） */
  assessmentDate: string;
}

export interface WellReportAquiferRow {
  aquiferType: AquiferType;
  /** Word 生成器用 r.type 访问含水层类型标识 */
  type: AquiferType;
  label: string;
  count: number;
  avgDepth: number;
  activeCount: number;
}

export interface WellReportCityRow {
  city: string;
  count: number;
  aquiferDesc: string;
}

export interface WellReportRealtimeRow {
  channel: DataChannel;
  label: string;
  total: number;
  normal: number;
  warning: number;
  critical: number;
  stale: number;
  coverage: number;
}

export interface WellReportAlertRow {
  wellName: string;
  wellId: string;
  city: string;
  channelLabel: string;
  valueText: string;
  severityLabel: string;
  detail: string;
}

export interface WellReportWellRow {
  name: string;
  id: string;
  city: string;
  aquiferLabel: string;
  depth: number;
  indicatorLabel: string;
  realtimeValue: string;
  statusLabel: string;
}

// ------------------------------------------------------------
// 扁平模型（供 PDF / Excel 生成器使用）
// 与 xxxRows 模型并存：PDF/Excel 消费 alerts/cities/aquifers/realtime，
// Word 消费 xxxRows。buildWellReportData 同时组装两套。
// ------------------------------------------------------------

export interface WellReportPdfAlertRow {
  wellId: string;
  /** 通道类型标签（如 水位埋深） */
  type: string;
  severity: AlertSeverity;
  /** 告警消息说明 */
  message: string;
  /** 触发时间（YYYY-MM-DD） */
  createdAt: string;
}

export interface WellReportPdfCityRow {
  city: string;
  wellCount: number;
  /** 含水层类型标签集合 */
  aquifers: string[];
  /** 监测指标标签集合 */
  indicators: string[];
}

export interface WellReportPdfAquiferRow {
  type: AquiferType;
  count: number;
  avgDepth: number;
  /** 分布城市名集合 */
  cities: string[];
}

export interface WellReportPdfRealtimeRow {
  stationId: string;
  stationName: string;
  waterLevel?: number;
  waterQuality?: number;
  subsidence?: number;
  extraction?: number;
  status: WellRealtimeStatus;
}

export interface WellReportData {
  meta: WellReportMeta;
  summary: WellReportSummary;
  // ── Word（xxxRows 模型）──
  aquiferRows: WellReportAquiferRow[];
  cityRows: WellReportCityRow[];
  realtimeRows: WellReportRealtimeRow[];
  alertRows: WellReportAlertRow[];
  wellRows: WellReportWellRow[];
  // ── PDF / Excel（扁平模型）──
  alerts: WellReportPdfAlertRow[];
  cities: WellReportPdfCityRow[];
  aquifers: WellReportPdfAquiferRow[];
  realtime: WellReportPdfRealtimeRow[];
}

export interface WellReportOptions {
  title?: string;
  unit?: string;
  period?: string;
  includeWells?: boolean;
  includeAlerts?: boolean;
  includeSpatial?: boolean;
  includeRealtime?: boolean;
}

// ============================================================
// 常量
// ============================================================

const CHANNEL_LABELS: Record<DataChannel, string> = {
  waterLevel: '水位埋深',
  waterQuality: '水质达标率',
  subsidence: '沉降速率',
  extraction: '开采量',
};

const STATUS_LABELS: Record<WellRealtimeStatus, string> = {
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
export function buildWellReportData(
  wellsWithData: WellWithData[],
  alerts: WellAlert[],
  options: WellReportOptions = {},
): WellReportData {
  const now = Date.now();
  const d = new Date(now);
  const pad = (n: number) => String(n).padStart(2, '0');
  const meta: WellReportMeta = {
    title: options.title ?? '地下水监测井网综合分析报告',
    unit: options.unit ?? '河北瑞三元环境科技有限公司',
    generatedAt: now,
    period: options.period ?? formatPeriod(now),
    // 报告编号：GW-YYYYMMDD-HHMMSS，供页眉与文件名使用
    reportId: `GW-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`,
  };

  // ── 摘要 ──
  const aquiferTypes = new Set(wellsWithData.map(w => w.aquiferType)).size;
  const activeWells = wellsWithData.filter(w => w.status === 'active').length;
  const cities = new Set(wellsWithData.map(w => w.city)).size;
  const withData = wellsWithData.filter(w => w.realtime.reading !== null).length;
  const abnormal = wellsWithData.filter(w => w.realtime.status !== 'normal' && w.realtime.status !== 'stale').length;
  const critical = wellsWithData.filter(w => w.realtime.status === 'critical').length;

  const summary: WellReportSummary = {
    totalWells: wellsWithData.length,
    cities,
    activeWells,
    aquiferTypes,
    coverage: wellsWithData.length > 0 ? Math.round((withData / wellsWithData.length) * 100) : 0,
    abnormalCount: abnormal,
    criticalCount: critical,
    alertCount: alerts.length,
    criticalAlerts: alerts.filter(a => a.severity === 'critical').length,
    assessmentDate: formatGeneratedAt(now).slice(0, 10),
  };

  // ── 含水层分布 ──
  const aquiferMap = new Map<AquiferType, { wells: WellWithData[] }>();
  for (const w of wellsWithData) {
    const g = aquiferMap.get(w.aquiferType);
    if (g) g.wells.push(w);
    else aquiferMap.set(w.aquiferType, { wells: [w] });
  }

  const aquiferRows: WellReportAquiferRow[] = Array.from(aquiferMap.entries()).map(([type, g]) => ({
    aquiferType: type,
    type,
    label: AQUIFER_LABELS[type],
    count: g.wells.length,
    avgDepth: Math.round((g.wells.reduce((s, w) => s + w.depth, 0) / g.wells.length) * 10) / 10,
    activeCount: g.wells.filter(w => w.status === 'active').length,
  }));

  // ── 城市分布 ──
  const cityMap = new Map<string, WellWithData[]>();
  for (const w of wellsWithData) {
    const list = cityMap.get(w.city);
    if (list) list.push(w);
    else cityMap.set(w.city, [w]);
  }

  const cityRows: WellReportCityRow[] = Array.from(cityMap.entries())
    .map(([city, list]) => {
      const aquifers = new Set(list.map(w => AQUIFER_LABELS[w.aquiferType]));
      return {
        city,
        count: list.length,
        aquiferDesc: Array.from(aquifers).join('、'),
      };
    })
    .sort((a, b) => b.count - a.count);

  // ── 实时通道统计 ──
  const channels: DataChannel[] = ['waterLevel', 'waterQuality', 'subsidence', 'extraction'];
  const realtimeRows: WellReportRealtimeRow[] = channels.map(ch => {
    const channelWells = wellsWithData.filter(w => w.matchedChannels.includes(ch));
    const total = channelWells.length;
    if (total === 0) {
      return { channel: ch, label: CHANNEL_LABELS[ch], total: 0, normal: 0, warning: 0, critical: 0, stale: 0, coverage: 0 };
    }
    const normal = channelWells.filter(w => w.realtime.status === 'normal').length;
    const warning = channelWells.filter(w => w.realtime.status === 'warning').length;
    const critical = channelWells.filter(w => w.realtime.status === 'critical').length;
    const stale = channelWells.filter(w => w.realtime.status === 'stale').length;
    const withDataCount = channelWells.filter(w => w.realtime.reading !== null).length;
    return {
      channel: ch,
      label: CHANNEL_LABELS[ch],
      total,
      normal,
      warning,
      critical,
      stale,
      coverage: Math.round((withDataCount / total) * 100),
    };
  }).filter(r => r.total > 0);

  // ── 告警清单 ──
  const alertRows: WellReportAlertRow[] = options.includeAlerts === false ? [] : alerts.map(a => {
    const threshold = a.threshold;
    let detail: string;
    if (a.severity === 'stale') {
      detail = '数据过期，无最新读数';
    } else if (threshold.direction === 'above') {
      detail = `当前 ${a.value.toFixed(1)}${a.unit}（预警≥${threshold.warning}，超标≥${threshold.critical}）`;
    } else {
      detail = `当前 ${a.value.toFixed(1)}${a.unit}（预警≤${threshold.warning}，超标≤${threshold.critical}）`;
    }
    return {
      wellName: a.wellName,
      wellId: a.wellId,
      city: a.city,
      channelLabel: CHANNEL_LABELS[a.channel],
      valueText: a.severity === 'stale' ? '—' : `${a.value.toFixed(1)}${a.unit}`,
      severityLabel: SEVERITY_LABELS[a.severity],
      detail,
    };
  });

  // ── 井详情表 ──
  const wellRows: WellReportWellRow[] = options.includeWells === false ? [] : wellsWithData.map(w => ({
    name: w.name,
    id: w.id,
    city: w.city,
    aquiferLabel: AQUIFER_LABELS[w.aquiferType],
    depth: w.depth,
    indicatorLabel: w.indicators.map(i => CHANNEL_LABELS[i]).join('、'),
    realtimeValue: w.realtime.value !== null ? `${w.realtime.value.toFixed(1)}${w.realtime.unit}` : '—',
    statusLabel: STATUS_LABELS[w.realtime.status],
  }));

  // ── 扁平模型（供 PDF / Excel 生成器）──
  const alertsFlat: WellReportPdfAlertRow[] = alerts.map(a => {
    const threshold = a.threshold;
    let message: string;
    if (a.severity === 'stale') {
      message = '数据过期，无最新读数';
    } else if (threshold.direction === 'above') {
      message = `当前 ${a.value.toFixed(1)}${a.unit}（预警≥${threshold.warning}，超标≥${threshold.critical}）`;
    } else {
      message = `当前 ${a.value.toFixed(1)}${a.unit}（预警≤${threshold.warning}，超标≤${threshold.critical}）`;
    }
    return {
      wellId: a.wellId,
      type: CHANNEL_LABELS[a.channel],
      severity: a.severity,
      message,
      createdAt: formatGeneratedAt(a.timestamp).slice(0, 10),
    };
  });

  const citiesFlat: WellReportPdfCityRow[] = Array.from(cityMap.entries()).map(([city, list]) => ({
    city,
    wellCount: list.length,
    aquifers: Array.from(new Set(list.map(w => AQUIFER_LABELS[w.aquiferType]))),
    indicators: Array.from(new Set(list.flatMap(w => w.indicators.map(i => CHANNEL_LABELS[i])))),
  }));

  const aquifersFlat: WellReportPdfAquiferRow[] = Array.from(aquiferMap.entries()).map(([type, g]) => ({
    type,
    count: g.wells.length,
    avgDepth: Math.round((g.wells.reduce((s, w) => s + w.depth, 0) / g.wells.length) * 10) / 10,
    cities: Array.from(new Set(g.wells.map(w => w.city))),
  }));

  const realtimeFlat: WellReportPdfRealtimeRow[] = wellsWithData.map(w => {
    const byChannel = new Map<DataChannel, number>();
    for (const r of w.channelReadings) {
      if (r.value !== null) byChannel.set(r.channel, r.value);
    }
    return {
      stationId: w.id,
      stationName: w.name,
      waterLevel: byChannel.get('waterLevel'),
      waterQuality: byChannel.get('waterQuality'),
      subsidence: byChannel.get('subsidence'),
      extraction: byChannel.get('extraction'),
      status: w.realtime.status,
    };
  });

  return {
    meta,
    summary,
    aquiferRows,
    cityRows,
    realtimeRows,
    alertRows,
    wellRows,
    alerts: alertsFlat,
    cities: citiesFlat,
    aquifers: aquifersFlat,
    realtime: realtimeFlat,
  };
}

/**
 * 格式化报告期间（YYYY-MM）
 */
function formatPeriod(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * 格式化生成时间为本地字符串
 */
export function formatGeneratedAt(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * 获取通道阈值文本（用于报告附注）
 */
export function getThresholdNote(): string {
  const lines: string[] = [];
  for (const ch of ['waterLevel', 'waterQuality', 'subsidence', 'extraction'] as DataChannel[]) {
    const t = ALERT_THRESHOLDS[ch];
    if (!t) continue;
    const label = CHANNEL_LABELS[ch];
    if (t.direction === 'above') {
      lines.push(`${label}：正常<${t.warning}，预警${t.warning}~${t.critical}，超标≥${t.critical}`);
    } else {
      lines.push(`${label}：正常>${t.warning}，预警${t.critical}~${t.warning}，超标≤${t.critical}`);
    }
  }
  return lines.join('\n');
}