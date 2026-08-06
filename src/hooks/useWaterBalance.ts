/**
 * H-04 水均衡计算 Hook
 * 关联 wellNetwork 井网数据，提供筛选/计算/对比
 */
import { useMemo } from 'react';
import type { Well } from './wellNetwork';
import {
  type WaterBalanceResult,
  type CityBalanceResult,
  type BalanceComparison,
  type PeriodId,
  DEFAULT_PERIODS,
  getDefaultBalanceResult,
  analyzeCityBalance,
  buildBalanceComparison,
  buildWaterBalanceResult,
} from './waterBalance';

/**
 * 基础水均衡 Hook
 * 从井网数据中提取城市分布，计算均衡结果
 */
export function useWaterBalance(
  wells: Well[],
  periodId: PeriodId = '2011-2020',
): WaterBalanceResult {
  return useMemo(() => {
    const cityWells = getCityWells(wells);
    return getDefaultBalanceResult(cityWells, periodId);
  }, [wells, periodId]);
}

/**
 * 按城市均衡分析 Hook
 */
export function useCityBalance(
  wells: Well[],
  periodId: PeriodId = '2011-2020',
): CityBalanceResult[] {
  return useMemo(() => {
    const cityWells = getCityWells(wells);
    const period = DEFAULT_PERIODS.find(p => p.periodId === periodId)
      ?? DEFAULT_PERIODS[DEFAULT_PERIODS.length - 1];
    return analyzeCityBalance(cityWells, period);
  }, [wells, periodId]);
}

/**
 * 多时段对比 Hook
 */
export function useBalanceComparison(
  _wells: Well[],
  defaultPeriodId: PeriodId = '2011-2020',
): BalanceComparison {
  return useMemo(() => {
    return buildBalanceComparison(DEFAULT_PERIODS, defaultPeriodId);
  }, [defaultPeriodId]);
}

/**
 * 选中城市的均衡详情
 */
export function useCityBalanceDetail(
  wells: Well[],
  selectedCity: string | null,
  periodId: PeriodId = '2011-2020',
): CityBalanceResult | null {
  return useMemo(() => {
    if (!selectedCity) return null;
    const cityWells = getCityWells(wells);
    const period = DEFAULT_PERIODS.find(p => p.periodId === periodId)
      ?? DEFAULT_PERIODS[DEFAULT_PERIODS.length - 1];
    const results = analyzeCityBalance(cityWells, period);
    return results.find(r => r.city === selectedCity) ?? null;
  }, [wells, selectedCity, periodId]);
}

/**
 * 获取指定城市的井数（按城市分组）
 */
export function useCityWellCount(
  wells: Well[],
  city: string | null,
): number {
  return useMemo(() => {
    if (!city) return 0;
    return wells.filter(w => w.city === city).length;
  }, [wells, city]);
}

// ============ 工具函数 ============

/** 从井数组提取城市-井数映射 */
export function getCityWells(wells: Well[]): Record<string, number> {
  const cityWells: Record<string, number> = {};
  for (const well of wells) {
    cityWells[well.city] = (cityWells[well.city] ?? 0) + 1;
  }
  return cityWells;
}

/** 获取城市列表（按井数排序） */
export function getSortedCities(wells: Well[]): string[] {
  const cityWells = getCityWells(wells);
  return Object.entries(cityWells)
    .sort(([, a], [, b]) => b - a)
    .map(([city]) => city);
}