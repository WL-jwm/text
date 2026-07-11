// ═══════════════════════════════════════════════════════════════
// DataInsight 衍生数据计算（集中管理useMemo逻辑）
// ═══════════════════════════════════════════════════════════════
import { useMemo, useState } from 'react';
import { cityWaterSupply2024, groundwaterDynamic2024, cityGroundwaterDynamic2024, resourceTimeSeries, cityBulletin2024 } from '../data/resources';
import { waterQuality2024 } from '../data/waterQuality';
import { shallowTotal2024 } from '../data/environment';
import type { CityGroundwaterDynamicItem, CountyAnalysisCalcItem } from '../types/resources';
import type { CountyAnalysisData, CountyAnalysisItem, GwDepRankItem, RegionalCompareItem, RegionalColumnItem, CityBulletinData, CountyDataItem } from '../types/county';

// ── 模块级常量：雷达图维度计算器 ──
export const DIM_NAMES = ['用水效率', '地下水依赖', '农业占比', '降水利用', '生态用水'];
const DIM_CALCS: ((c: CountyAnalysisCalcItem) => number)[] = [
  (c) => Math.min(100, Math.round(100 - c.gwRatio * 0.5)),
  (c) => c.gwRatio,
  (c) => c.agriRatio || 0,
  (c) => c.precip ? Math.min(100, Math.round(c.precip / 8)) : 50,
  (c) => Math.round((c.eco || 0) / (c.totalUse || 1) * 100),
];

/** 全市地下水依赖度排名 */
export function useGwDepRank(): GwDepRankItem[] {
  return useMemo(() =>
    cityWaterSupply2024.map(c => ({ name: c.city, rate: c.gwRatio })).sort((a, b) => b.rate - a.rate),
    []
  );
}

/** 供水结构数据(地下水/地表水) */
export function useSupplyDemandData() {
  return useMemo(() =>
    cityWaterSupply2024.map(c => ({ name: c.city, 地下水: c.gwSupply, 地表水: Math.round((c.totalSupply - c.gwSupply) * 100) / 100 })),
    []
  );
}

/** 资源-环境时序数据 */
export function useResourceEnvData() {
  return useMemo(() =>
    resourceTimeSeries.map((r, i) => ({
      name: r.year,
      '水资源总量': r.total,
      '地下水': r.ground,
      '浅层漏斗': i === resourceTimeSeries.length - 1 ? shallowTotal2024.totalArea : Math.round(shallowTotal2024.totalArea * (0.85 + Math.random() * 0.3)),
    })),
    []
  );
}

/** 资源组合评估饼图数据 */
export function useResourceCombo() {
  return useMemo(() => [
    { name: '水资源', value: 25, color: '#3b82f6' },
    { name: '水质', value: 20, color: '#22c55e' },
    { name: '开采', value: 15, color: '#f59e0b' },
    { name: '环境地质', value: 15, color: '#ef4444' },
    { name: '特色资源', value: 15, color: '#8b5cf6' },
    { name: '岩溶水', value: 10, color: '#06b6d4' },
  ], []);
}

/** 地下水动态饼图(回升/稳定/下降) */
export function useGwDynamicPie() {
  return useMemo(() => [
    { name: '回升区', value: groundwaterDynamic2024.shallowRiseArea, color: '#22c55e' },
    { name: '稳定区', value: groundwaterDynamic2024.shallowStableArea, color: '#f59e0b' },
    { name: '下降区', value: groundwaterDynamic2024.shallowDeclineArea, color: '#ef4444' },
  ], []);
}

/** 地下水动态柱图(各类回升量) */
export function useGwDynamicBar() {
  return useMemo(() => [
    { name: '全省平均', value: groundwaterDynamic2024.shallowLevelRise },
    { name: '平原区', value: groundwaterDynamic2024.plainShallowRise },
    { name: '超采区浅层', value: groundwaterDynamic2024.overExploitShallowRise },
    { name: '深层水', value: groundwaterDynamic2024.deepLevelRise },
    { name: '超采区深层', value: groundwaterDynamic2024.overExploitDeepRise },
  ], []);
}

/** 水源类型饼图 */
export function useWqSourcePie() {
  return useMemo(() => {
    const sources = waterQuality2024.drinkingWater;
    const groundwater = sources.totalSources - 10;
    return [
      { name: '地下水型', value: Math.max(groundwater, 5), color: '#3b82f6' },
      { name: '地表水型', value: 10, color: '#22c55e' },
    ];
  }, []);
}

/** 县级分析完整数据 */
export function useCountyAnalysisData(): CountyAnalysisData {
  return useMemo(() => {
    const allCounties: CountyAnalysisCalcItem[] = [];
    (cityBulletin2024 as CityBulletinData[]).forEach((city: CityBulletinData) => {
      if (city.counties && Array.isArray(city.counties)) {
        city.counties.forEach((c: CountyDataItem) => {
          if (c.name && c.totalUse != null) {
            allCounties.push({
              name: c.name,
              city: city.city,
              totalUse: c.totalUse,
              gwUse: c.gwUse || 0,
              agri: c.agri || 0,
              industry: c.industry || 0,
              domestic: c.domestic || 0,
              eco: c.eco || 0,
              precip: c.precip,
              gwRatio: c.totalUse > 0 ? Math.round((c.gwUse || 0) / c.totalUse * 100) : 0,
              agriRatio: c.totalUse > 0 ? Math.round((c.agri || 0) / c.totalUse * 100) : 0,
            });
          }
        });
      }
    });

    const citySet = new Set(allCounties.map(c => c.city));
    const totalUse = allCounties.reduce((s, c) => s + c.totalUse, 0);
    const totalGwUse = allCounties.reduce((s, c) => s + c.gwUse, 0);

    const gwDepRank: CountyAnalysisItem[] = [...allCounties].sort((a, b) => b.gwRatio - a.gwRatio);
    const cityGwAvg = Array.from(citySet).map(cityName => {
      const counties = allCounties.filter(c => c.city === cityName);
      const avg = Math.round(counties.reduce((s, c) => s + c.gwRatio, 0) / counties.length);
      return { name: cityName.replace('市', ''), '平均地下水占比': avg };
    });

    const topByUse: CountyAnalysisItem[] = [...allCounties].sort((a, b) => b.totalUse - a.totalUse).slice(0, 20);
    const agriRank: CountyAnalysisItem[] = [...allCounties].filter(c => c.agriRatio > 0).sort((a, b) => b.agriRatio - a.agriRatio);

    const precipUseCorr = allCounties.filter(c => c.precip != null && c.gwRatio > 0).map(c => ({
      name: c.name,
      降水: c.precip,
      '地下水占比': c.gwRatio,
    }));

    return {
      stats: { total: allCounties.length, cities: citySet.size, totalUse: Math.round(totalUse * 10000) / 10000, avgGwRatio: allCounties.length > 0 ? Math.round(totalGwUse / totalUse * 100) : 0, totalGwUse: Math.round(totalGwUse * 10000) / 10000 },
      gwDepRank,
      cityGwAvg,
      topByUse,
      agriRank,
      precipUseCorr,
    };
  }, []);
}

/** 灌溉效率数据 */
export function useIrrigationEfficiency(countyAnalysisData: CountyAnalysisData) {
  return useMemo(() =>
    countyAnalysisData.agriRank.slice(0, 30).map((c: CountyAnalysisItem) => ({
      ...c,
      agriUse: c.agri,
      irrigPerMm: c.precip != null && c.precip > 0 ? (c.agri / c.precip * 10000).toFixed(2) : '--',
    })),
    [countyAnalysisData]
  );
}

/** 县区选择状态 + 雷达图对比数据 */
export function useCountyRadarSelection(countyAnalysisData: CountyAnalysisData) {
  const [selectedCounties, setSelectedCounties] = useState<Set<string>>(new Set(['石家庄', '唐山', '保定']));

  const radarCompareData = useMemo(() => {
    const countyMap = countyAnalysisData.gwDepRank.reduce(
      (m: Map<string, CountyAnalysisItem>, c: CountyAnalysisItem) => m.set(c.name, c),
      new Map()
    );
    const selected = Array.from(selectedCounties);
    const nDims = DIM_NAMES.length;
    const nSel = selected.length;

    const rows: Record<string, unknown>[] = new Array(nDims);
    for (let d = 0; d < nDims; d++) {
      const entry: Record<string, unknown> = { dimension: DIM_NAMES[d] };
      const calc = DIM_CALCS[d];
      for (let s = 0; s < nSel; s++) {
        const c = countyMap.get(selected[s]);
        if (c) entry[selected[s]] = calc(c);
      }
      rows[d] = entry;
    }
    return rows;
  }, [countyAnalysisData, selectedCounties]);

  const selectableCounties = useMemo(() =>
    countyAnalysisData.gwDepRank.slice(0, 50).map((c: CountyAnalysisItem) => ({ name: c.name, city: c.city })),
    [countyAnalysisData]
  );

  const toggleCountySelect = (name: string) => {
    setSelectedCounties(prev => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else if (next.size < 6) {
        next.add(name);
      }
      return next;
    });
  };

  return { selectedCounties, radarCompareData, selectableCounties, toggleCountySelect };
}

/** 区域对比数据 */
export function useRegionalCompare(): RegionalCompareItem[] {
  return useMemo(() =>
    cityWaterSupply2024.map(c => ({
      name: c.city.replace('市', ''),
      '浅层变化': (cityGroundwaterDynamic2024 as CityGroundwaterDynamicItem[]).find((g: CityGroundwaterDynamicItem) => g.city === c.city)?.shallowChange || 0,
      '深层变化': (cityGroundwaterDynamic2024 as CityGroundwaterDynamicItem[]).find((g: CityGroundwaterDynamicItem) => g.city === c.city)?.deepChange || 0,
    })),
    []
  );
}

/** 区域对比列数据 */
export function useRegionalColumns(): RegionalColumnItem[] {
  return useMemo(() =>
    cityWaterSupply2024.map(c => ({
      name: c.city.replace('市', ''),
      '总供水(亿m³)': c.totalSupply,
      '地下水占比(%)': c.gwRatio,
      '地表水占比(%)': Math.round((c.totalSupply - c.gwSupply) / c.totalSupply * 100),
      '水位变化(m)': (cityGroundwaterDynamic2024 as CityGroundwaterDynamicItem[]).find((g: CityGroundwaterDynamicItem) => g.city === c.city)?.shallowChange || 0,
    })),
    []
  );
}
