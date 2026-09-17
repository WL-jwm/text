/**
 * 井健康报告服务 (G-14) — 数据组装
 * 拆分自 wellReport.ts：buildWellReportData 报告数据构建
 */

import { AQUIFER_LABELS } from './wellNetwork';
import type { AquiferType } from './wellNetwork';
import type { DataChannel } from './realtimeDataService';
import type { WellAlert } from './wellAlerts';
import type { WellWithData } from './wellRealtime';
import { CHANNEL_LABELS, SEVERITY_LABELS, STATUS_LABELS } from './wellReportConstants';
import type {
  WellReportAlertRow,
  WellReportAquiferRow,
  WellReportCityRow,
  WellReportData,
  WellReportMeta,
  WellReportOptions,
  WellReportPdfAlertRow,
  WellReportPdfAquiferRow,
  WellReportPdfCityRow,
  WellReportPdfRealtimeRow,
  WellReportRealtimeRow,
  WellReportSummary,
  WellReportWellRow,
} from './wellReportTypes';
import { formatGeneratedAt, formatPeriod } from './wellReportUtils';
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
