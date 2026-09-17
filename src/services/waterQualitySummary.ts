/**
 * 水质评价服务 (G-11) — 汇总统计
 * 拆分自 waterQuality.ts：区域/城市水质汇总与评价结果聚合
 */

import type {
  CityWaterQualityStats,
  WaterQualityAssessment,
  WaterQualityClass,
  WaterQualityIndicator,
  WaterQualitySummary,
} from './waterQualityTypes';
export function buildWaterQualitySummary(
  assessments: WaterQualityAssessment[],
): WaterQualitySummary {
  const classDist: Record<WaterQualityClass, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const factorCount: Record<string, { label: string; count: number }> = {};
  const sulinDist: Record<string, number> = {};

  for (const a of assessments) {
    classDist[a.comprehensiveClass] = (classDist[a.comprehensiveClass] ?? 0) + 1;

    for (const f of a.exceededFactors) {
      if (!factorCount[f.indicator]) {
        factorCount[f.indicator] = { label: f.label, count: 0 };
      }
      factorCount[f.indicator].count++;
    }

    if (a.sulin) {
      sulinDist[a.sulin.fullName] = (sulinDist[a.sulin.fullName] ?? 0) + 1;
    }
  }

  const exceededSites = classDist[4] + classDist[5];
  const totalSites = assessments.length;

  const topFactors = Object.entries(factorCount)
    .map(([indicator, data]) => ({
      indicator: indicator as WaterQualityIndicator,
      label: data.label,
      count: data.count,
      rate: totalSites > 0 ? parseFloat(((data.count / totalSites) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalSites,
    classDistribution: classDist,
    exceededSites,
    exceedRate: totalSites > 0 ? parseFloat(((exceededSites / totalSites) * 100).toFixed(1)) : 0,
    topFactors,
    sulinDistribution: sulinDist,
  };
}

/**
 * 按城市统计水质
 * 纯函数，可测试
 */
export function buildCityWaterQualityStats(
  assessments: WaterQualityAssessment[],
): CityWaterQualityStats[] {
  const cityMap = new Map<string, WaterQualityAssessment[]>();

  for (const a of assessments) {
    const list = cityMap.get(a.city) ?? [];
    list.push(a);
    cityMap.set(a.city, list);
  }

  const results: CityWaterQualityStats[] = [];
  for (const [city, list] of cityMap) {
    const classDist: Record<WaterQualityClass, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const factors = new Set<string>();

    for (const a of list) {
      classDist[a.comprehensiveClass] = (classDist[a.comprehensiveClass] ?? 0) + 1;
      for (const f of a.exceededFactors) {
        factors.add(f.label);
      }
    }

    const exceeded = classDist[4] + classDist[5];
    const avgClass = parseFloat(
      (list.reduce((s, a) => s + a.comprehensiveClass, 0) / list.length).toFixed(1),
    );

    results.push({
      city,
      siteCount: list.length,
      classDistribution: classDist,
      exceededSites: exceeded,
      averageClass: avgClass,
      mainFactors: Array.from(factors).slice(0, 5),
    });
  }

  return results.sort((a, b) => b.exceededSites - a.exceededSites);
}

// ============ 水质等级转换工具 ============

/**
 * 获取水质等级颜色
 */
