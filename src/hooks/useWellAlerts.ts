/**
 * H-02 实时读数历史趋势与告警联动 — React Hooks
 *
 *   1. useWellAlerts — 生成井网告警 + 汇总 + 筛选
 *   2. useWellHistory — 从缓存查询井的历史读数（持久化联动）
 *   3. useWellTrend — 单井历史趋势特征
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  buildWellAlerts,
  summarizeAlerts,
  filterAlerts,
  buildWellTrend,
} from '../services/wellAlerts';
import type {
  WellAlert,
  WellAlertSummary,
  AlertSeverity,
  WellTrend,
} from '../services/wellAlerts';
import { realtimeCache } from '../services/realtimeCache';
import type { WellWithData } from '../services/wellRealtime';
import type { RealtimeReading, DataChannel } from '../services/realtimeDataService';

// ============================================================
// useWellAlerts — 井网告警
// ============================================================

export function useWellAlerts(wellsWithData: WellWithData[]) {
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'all'>('all');
  const [channelFilter, setChannelFilter] = useState<DataChannel | 'all'>('all');

  // 所有告警（基于井实时数据）
  const alerts = useMemo(() => {
    return buildWellAlerts(wellsWithData);
  }, [wellsWithData]);

  // 汇总
  const summary = useMemo<WellAlertSummary>(() => {
    return summarizeAlerts(alerts);
  }, [alerts]);

  // 筛选后的告警
  const filteredAlerts = useMemo(() => {
    return filterAlerts(alerts, {
      severity: severityFilter,
      channel: channelFilter,
    });
  }, [alerts, severityFilter, channelFilter]);

  const setSeverity = useCallback((s: AlertSeverity | 'all') => setSeverityFilter(s), []);
  const setChannel = useCallback((c: DataChannel | 'all') => setChannelFilter(c), []);

  return { alerts, summary, filteredAlerts, severityFilter, channelFilter, setSeverity, setChannel };
}

// ============================================================
// useWellHistory — 井历史读数（持久化联动）
// ============================================================

/**
 * 从 IDB 缓存查询单井的历史读数
 * @param wellId — 井 ID
 * @param channel — 通道
 * @param hours — 查询最近 N 小时（默认 24h）
 */
export function useWellHistory(
  wellId: string | null,
  channel: DataChannel,
  hours = 24,
): {
  history: RealtimeReading[];
  loading: boolean;
  error: string | null;
} {
  const [history, setHistory] = useState<RealtimeReading[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!wellId) {
      setHistory([]);
      return;
    }

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const endTime = Date.now();
        const startTime = endTime - hours * 3600 * 1000;
        const cached = await realtimeCache.getByTimeRange({
          channel,
          startTime,
          endTime,
          limit: 500,
        });
        // 按 stationId 过滤该井的读数
        const wellReadings = cached
          .filter(r => r.stationId === wellId)
          .sort((a, b) => a.timestamp - b.timestamp);
        if (!cancelled) setHistory(wellReadings);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [wellId, channel, hours]);

  return { history, loading, error };
}

// ============================================================
// useWellTrend — 单井历史趋势特征
// ============================================================

export function useWellTrend(wellId: string | null, channel: DataChannel, hours = 24) {
  const { history, loading, error } = useWellHistory(wellId, channel, hours);

  const trend = useMemo<WellTrend | null>(() => {
    if (!wellId || history.length === 0) return null;
    return buildWellTrend(wellId, channel, history);
  }, [wellId, channel, history]);

  return { trend, history, loading, error };
}

// ============================================================
// 类型导出
// ============================================================

export type { WellAlert, WellAlertSummary, AlertSeverity, WellTrend };