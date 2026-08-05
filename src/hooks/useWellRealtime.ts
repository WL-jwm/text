/**
 * H-01 监测井网实时读数联动 — React Hook
 *
 * 将监测井网与实时数据系统联动：
 *   1. useWellRealtime — 关联井与实时读数，返回带实时数据的井
 *   2. useWellRealtimeStats — 井网实时统计
 *   3. useWellRealtimeFilter — 异常井筛选
 *   4. useWellRealtimeTrend — 单井实时趋势
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRealtimeAll } from './useRealtimeData';
import {
  linkWellsToReadings,
  computeWellRealtimeStats,
  filterAbnormalWells,
} from '../services/wellRealtime';
import type {
  WellWithData,
  WellRealtimeStatus,
  WellRealtimeStats,
} from '../services/wellRealtime';
import type { Well } from '../services/wellNetwork';
import type { RealtimeReading } from '../services/realtimeDataService';

// ============================================================
// useWellRealtime — 关联井与实时读数
// ============================================================

export function useWellRealtime(
  wells: Well[],
  freshnessMs = 60000,
): {
  wellsWithData: WellWithData[];
  allReadings: RealtimeReading[];
  lastUpdate: number | null;
  isConnected: boolean;
} {
  const { allReadings, lastUpdates } = useRealtimeAll();
  const [wellsWithData, setWellsWithData] = useState<WellWithData[]>([]);

  // 关联井与实时数据
  useEffect(() => {
    const linked = linkWellsToReadings(wells, allReadings, freshnessMs);
    setWellsWithData(linked);
  }, [wells, allReadings, freshnessMs]);

  // 计算最近更新时间（任一通道）
  const lastUpdate = useMemo(() => {
    const times = Object.values(lastUpdates).filter((t): t is number => t !== undefined);
    return times.length > 0 ? Math.max(...times) : null;
  }, [lastUpdates]);

  const isConnected = useMemo(() => {
    return Object.values(lastUpdates).some(t => t !== undefined);
  }, [lastUpdates]);

  return { wellsWithData, allReadings, lastUpdate, isConnected };
}

// ============================================================
// useWellRealtimeStats — 井网实时统计
// ============================================================

export function useWellRealtimeStats(wellsWithData: WellWithData[]) {
  const stats = useMemo<WellRealtimeStats>(() => {
    return computeWellRealtimeStats(wellsWithData);
  }, [wellsWithData]);

  return stats;
}

// ============================================================
// useWellRealtimeFilter — 异常井筛选
// ============================================================

export function useWellRealtimeFilter(
  wellsWithData: WellWithData[],
  initialStatuses?: WellRealtimeStatus[],
) {
  const [statuses, setStatuses] = useState<WellRealtimeStatus[] | undefined>(initialStatuses);

  const filteredWells = useMemo(() => {
    if (!statuses || statuses.length === 0) return wellsWithData;
    return filterAbnormalWells(wellsWithData, statuses);
  }, [wellsWithData, statuses]);

  const setFilter = useCallback((next: WellRealtimeStatus[] | undefined) => {
    setStatuses(next);
  }, []);

  const clearFilter = useCallback(() => {
    setStatuses(undefined);
  }, []);

  return { filteredWells, statuses, setFilter, clearFilter };
}

// ============================================================
// useWellRealtimeTrend — 单井实时趋势
// ============================================================

export function useWellRealtimeTrend(
  wellId: string | null,
  allReadings: RealtimeReading[],
  maxPoints = 30,
): RealtimeReading[] {
  const [trend, setTrend] = useState<RealtimeReading[]>([]);

  useEffect(() => {
    if (!wellId) {
      setTrend([]);
      return;
    }

    // 取该井的所有读数，按时间排序，取最近 N 条
    const wellReadings = allReadings
      .filter(r => r.stationId === wellId)
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-maxPoints);

    setTrend(wellReadings);
  }, [wellId, allReadings, maxPoints]);

  return trend;
}

// ============================================================
// 类型导出
// ============================================================

export type { WellWithData, WellRealtimeStatus, WellRealtimeStats };