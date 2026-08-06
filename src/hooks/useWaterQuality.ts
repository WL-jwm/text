/**
 * H-05 水质综合评价 Hook
 * 关联 wellNetwork 井网数据，提供水质评价/统计/筛选
 */
import { useMemo } from 'react';
import type { Well } from './wellNetwork';
import {
  type WaterQualityAssessment,
  type WaterQualitySummary,
  type CityWaterQualityStats,
  comprehensiveAssessment,
  buildWaterQualitySummary,
  buildCityWaterQualityStats,
  classifySulin,
  INDICATOR_META,
} from './waterQuality';

/** 河北平原典型水质指标值（按城市，基于背景值中位数） */
const CITY_TYPICAL_WATER_QUALITY: Record<string, Partial<Record<string, number>>> = {
  '石家庄': { pH: 7.6, TDS: 450, totalHardness: 300, Cl: 50, SO4: 75, NO3: 8.5, F: 0.6, Fe: 0.15, Mn: 0.05, HCO3: 300, Ca: 90, Mg: 35, Na: 40 },
  '保定': { pH: 7.5, TDS: 420, totalHardness: 280, Cl: 45, SO4: 70, NO3: 7.2, F: 0.5, Fe: 0.12, Mn: 0.04, HCO3: 320, Ca: 85, Mg: 32, Na: 35 },
  '沧州': { pH: 7.8, TDS: 850, totalHardness: 450, Cl: 120, SO4: 150, NO3: 5.5, F: 1.2, Fe: 0.25, Mn: 0.08, HCO3: 280, Ca: 100, Mg: 45, Na: 120 },
  '衡水': { pH: 7.7, TDS: 750, totalHardness: 420, Cl: 100, SO4: 130, NO3: 6.0, F: 1.0, Fe: 0.20, Mn: 0.07, HCO3: 290, Ca: 95, Mg: 40, Na: 100 },
  '邢台': { pH: 7.6, TDS: 550, totalHardness: 350, Cl: 70, SO4: 100, NO3: 9.0, F: 0.8, Fe: 0.18, Mn: 0.06, HCO3: 310, Ca: 90, Mg: 38, Na: 60 },
  '邯郸': { pH: 7.5, TDS: 500, totalHardness: 320, Cl: 60, SO4: 85, NO3: 10.0, F: 0.7, Fe: 0.16, Mn: 0.05, HCO3: 320, Ca: 88, Mg: 36, Na: 50 },
  '唐山': { pH: 7.4, TDS: 480, totalHardness: 310, Cl: 55, SO4: 80, NO3: 7.8, F: 0.6, Fe: 0.14, Mn: 0.05, HCO3: 310, Ca: 85, Mg: 34, Na: 45 },
  '廊坊': { pH: 7.6, TDS: 580, totalHardness: 360, Cl: 75, SO4: 105, NO3: 6.5, F: 0.8, Fe: 0.20, Mn: 0.06, HCO3: 300, Ca: 92, Mg: 38, Na: 70 },
  '秦皇岛': { pH: 7.3, TDS: 380, totalHardness: 250, Cl: 40, SO4: 60, NO3: 5.0, F: 0.4, Fe: 0.10, Mn: 0.03, HCO3: 340, Ca: 80, Mg: 30, Na: 30 },
  '张家口': { pH: 7.5, TDS: 400, totalHardness: 270, Cl: 35, SO4: 55, NO3: 4.5, F: 0.5, Fe: 0.08, Mn: 0.03, HCO3: 350, Ca: 82, Mg: 31, Na: 28 },
  '承德': { pH: 7.2, TDS: 350, totalHardness: 230, Cl: 30, SO4: 50, NO3: 3.5, F: 0.3, Fe: 0.08, Mn: 0.02, HCO3: 360, Ca: 78, Mg: 28, Na: 25 },
  '雄安新区': { pH: 7.7, TDS: 700, totalHardness: 400, Cl: 95, SO4: 120, NO3: 5.8, F: 0.9, Fe: 0.22, Mn: 0.07, HCO3: 290, Ca: 95, Mg: 42, Na: 90 },
  '定州': { pH: 7.5, TDS: 440, totalHardness: 290, Cl: 48, SO4: 72, NO3: 7.5, F: 0.6, Fe: 0.14, Mn: 0.04, HCO3: 310, Ca: 87, Mg: 33, Na: 38 },
  '辛集': { pH: 7.6, TDS: 460, totalHardness: 310, Cl: 52, SO4: 78, NO3: 8.0, F: 0.6, Fe: 0.15, Mn: 0.05, HCO3: 305, Ca: 88, Mg: 34, Na: 42 },
};

/** 水质评价指标列表（用于评价的常规指标） */
const DEFAULT_INDICATORS = [
  'pH', 'TDS', 'totalHardness', 'Cl', 'SO4', 'NO3', 'F', 'Fe', 'Mn',
] as const;

/**
 * 基础水质评价 Hook
 * 对每个井按城市典型水质值进行评价
 */
export function useWaterQuality(wells: Well[]): {
  assessments: WaterQualityAssessment[];
  summary: WaterQualitySummary;
  cityStats: CityWaterQualityStats[];
} {
  return useMemo(() => {
    const assessments: WaterQualityAssessment[] = [];

    for (const well of wells) {
      if (!well.indicators.includes('waterQuality')) continue;

      const cityData = CITY_TYPICAL_WATER_QUALITY[well.city];
      if (!cityData) continue;

      // 构建指标值
      const values: Partial<Record<string, number>> = {};
      for (const ind of DEFAULT_INDICATORS) {
        const val = cityData[ind];
        if (val !== undefined) {
          values[ind] = val;
        }
      }

      // 苏卡列夫分类
      const sulin = classifySulin({
        HCO3: cityData.HCO3 ?? 0,
        SO4: cityData.SO4 ?? 0,
        Cl: cityData.Cl ?? 0,
        Ca: cityData.Ca ?? 0,
        Mg: cityData.Mg ?? 0,
        Na: cityData.Na ?? 0,
      });

      const assessment = comprehensiveAssessment(
        well.id,
        well.name,
        well.city,
        values,
        sulin,
      );

      assessments.push(assessment);
    }

    return {
      assessments,
      summary: buildWaterQualitySummary(assessments),
      cityStats: buildCityWaterQualityStats(assessments),
    };
  }, [wells]);
}

/**
 * 获取指定井的水质评价结果
 */
export function useWellWaterQuality(
  assessments: WaterQualityAssessment[],
  wellId: string | null,
): WaterQualityAssessment | null {
  return useMemo(() => {
    if (!wellId) return null;
    return assessments.find(a => a.stationId === wellId) ?? null;
  }, [assessments, wellId]);
}

/**
 * 获取指定城市的超标因子统计
 */
export function useCityExceedanceFactors(
  assessments: WaterQualityAssessment[],
  city: string | null,
): { indicators: string[]; count: number } {
  return useMemo(() => {
    if (!city) return { indicators: [], count: 0 };
    const cityAssessments = assessments.filter(a => a.city === city);
    const factors = new Set<string>();
    for (const a of cityAssessments) {
      for (const f of a.exceededFactors) {
        factors.add(f.label);
      }
    }
    return {
      indicators: Array.from(factors),
      count: factors.size,
    };
  }, [assessments, city]);
}