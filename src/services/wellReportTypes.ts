import type { AquiferType } from './wellNetwork';

/**
 * 井健康报告服务 (G-14) — 类型定义
 * 拆分自 wellReport.ts：报告元数据/汇总/含水层行/城市行/实时行/预警行/PDF行
 */

import type { AlertSeverity } from './wellAlerts';
import type { DataChannel } from './realtimeDataService';
import type { WellRealtimeStatus } from './wellRealtime';
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
