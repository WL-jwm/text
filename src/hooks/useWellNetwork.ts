/**
 * H-01 监测井网与空间分析 — React Hooks
 *
 * 提供井网管理和空间分析的 React 封装：
 *   1. useWellNetwork — 井网数据 CRUD 管理
 *   2. useWellFilter — 井网筛选
 *   3. useSpatialAnalysis — 空间分析结果
 *   4. useWellSelection — 选中井管理
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  wellNetworkService,
  WellNetworkService,
} from '../services/wellNetwork';
import type {
  Well,
  AquiferType,
  WellStatus,
  NearestNeighborResult,
  BufferResult,
  SpatialAnalysisReport,
  AquiferGroupStats,
  CityGroupStats,
  WellDistance,
} from '../services/wellNetwork';
import type { DataChannel } from '../services/realtimeDataService';

// ============================================================
// useWellNetwork — 井网数据 CRUD 管理
// ============================================================

export function useWellNetwork() {
  const [wells, setWells] = useState<Well[]>(() => wellNetworkService.getWells());
  const [version, setVersion] = useState(0);

  // 版本号变化时刷新数据
  useEffect(() => {
    setWells(wellNetworkService.getWells());
  }, [version]);

  const refresh = useCallback(() => {
    setVersion(v => v + 1);
  }, []);

  const addWell = useCallback((well: Omit<Well, 'id'>): Well | null => {
    const created = wellNetworkService.addWell(well);
    refresh();
    return created;
  }, [refresh]);

  const updateWell = useCallback((id: string, patch: Partial<Omit<Well, 'id'>>): Well | null => {
    const updated = wellNetworkService.updateWell(id, patch);
    if (updated) refresh();
    return updated ?? null;
  }, [refresh]);

  const deleteWell = useCallback((id: string): boolean => {
    const ok = wellNetworkService.deleteWell(id);
    if (ok) refresh();
    return ok;
  }, [refresh]);

  const reset = useCallback(() => {
    wellNetworkService.reset();
    refresh();
  }, [refresh]);

  const setWellsFromService = useCallback((newWells: Well[]) => {
    wellNetworkService.setWells(newWells);
    refresh();
  }, [refresh]);

  return {
    wells,
    refresh,
    addWell,
    updateWell,
    deleteWell,
    reset,
    setWellsFromService,
    getWellById: (id: string) => wellNetworkService.getWellById(id),
  };
}

// ============================================================
// useWellFilter — 井网筛选
// ============================================================

export function useWellFilter(wells: Well[]) {
  const [filters, setFilters] = useState<{
    city?: string;
    aquiferType?: AquiferType;
    status?: WellStatus;
    indicator?: DataChannel;
    keyword?: string;
  }>({});

  const filteredWells = useMemo(() => {
    return wells.filter(w => {
      if (filters.city && w.city !== filters.city) return false;
      if (filters.aquiferType && w.aquiferType !== filters.aquiferType) return false;
      if (filters.status && w.status !== filters.status) return false;
      if (filters.indicator && !w.indicators.includes(filters.indicator)) return false;
      if (filters.keyword) {
        const kw = filters.keyword.toLowerCase();
        const match = w.name.toLowerCase().includes(kw) ||
          w.id.toLowerCase().includes(kw) ||
          (w.district ?? '').toLowerCase().includes(kw);
        if (!match) return false;
      }
      return true;
    });
  }, [wells, filters]);

  const setFilter = useCallback((patch: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...patch }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  return { filteredWells, filters, setFilter, clearFilters };
}

// ============================================================
// useSpatialAnalysis — 空间分析结果
// ============================================================

export function useSpatialAnalysis(wells: Well[]) {
  const [report, setReport] = useState<SpatialAnalysisReport | null>(null);
  const [neighbors, setNeighbors] = useState<NearestNeighborResult[]>([]);
  const [buffer, setBuffer] = useState<BufferResult | null>(null);

  // 基于当前井集生成空间报告
  useEffect(() => {
    const tempService = new WellNetworkService(wells);
    setReport(tempService.generateSpatialReport());
    setNeighbors(tempService.getNearestNeighbors());
  }, [wells]);

  const analyzeBuffer = useCallback((centerId: string, radiusKm: number): BufferResult => {
    const tempService = new WellNetworkService(wells);
    const result = tempService.getWellsWithinRadius(centerId, radiusKm);
    setBuffer(result);
    return result;
  }, [wells]);

  const getDistances = useCallback((wellId: string): WellDistance[] => {
    const tempService = new WellNetworkService(wells);
    return tempService.getWellDistances(wellId);
  }, [wells]);

  return {
    report,
    neighbors,
    buffer,
    analyzeBuffer,
    getDistances,
  };
}

// ============================================================
// useWellSelection — 选中井管理
// ============================================================

export function useWellSelection(wells: Well[]) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedWell = useMemo(() => {
    if (!selectedId) return null;
    return wells.find(w => w.id === selectedId) ?? null;
  }, [wells, selectedId]);

  const select = useCallback((id: string | null) => {
    setSelectedId(id);
  }, []);

  const clear = useCallback(() => {
    setSelectedId(null);
  }, []);

  return { selectedId, selectedWell, select, clear };
}

// ============================================================
// 类型导出
// ============================================================

export type {
  Well,
  AquiferType,
  WellStatus,
  NearestNeighborResult,
  BufferResult,
  SpatialAnalysisReport,
  AquiferGroupStats,
  CityGroupStats,
  WellDistance,
};