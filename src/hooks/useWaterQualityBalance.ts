/**
 * H-06 均衡-水质联动分析 Hook
 */
import { useMemo } from 'react';
import type { CityBalanceResult } from '../services/waterBalance';
import type { CityWaterQualityStats } from '../services/waterQuality';
import {
  type IntegratedAnalysis,
  buildIntegratedAnalysis,
} from '../services/waterQualityBalance';

/**
 * 均衡-水质联动分析 Hook
 * 整合水均衡和水质评价数据，输出综合分析与排名
 */
export function useIntegratedAnalysis(
  cityBalances: CityBalanceResult[],
  qualityCityStats: CityWaterQualityStats[],
): IntegratedAnalysis {
  return useMemo(() => {
    return buildIntegratedAnalysis(cityBalances, qualityCityStats);
  }, [cityBalances, qualityCityStats]);
}

/**
 * 获取指定城市的综合详情
 */
export function useCityIntegratedDetail(
  analysis: IntegratedAnalysis,
  city: string | null,
) {
  return useMemo(() => {
    if (!city) return null;
    return analysis.cities.find(c => c.city === city) ?? null;
  }, [analysis, city]);
}