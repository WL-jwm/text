/**
 * Overview 页面数据层 hook
 * 集中管理总览页全部派生数据：统计指标、动画数值、各图表 useMemo 数据、导出数据
 */

import { useMemo } from 'react';
import {
  historicalComparison,
  cityWaterSupply2024,
  overExploitControl2024,
  cityGroundwaterDynamic2024,
  cityBulletin2024,
} from '../data/resources';
import { shallowTotal2024 } from '../data/environment';
import { systemZones } from '../data/systemZoning';
import { salineSoilDistribution } from '../data/salineSoil';
import { mineWaterUtilization } from '../data/mineHydrogeology';
import { cityOverExploitDetail } from '../data/exploitation';
import type { CountyDataItem } from '../types/county';
import { useCountUp } from './OverviewHelpers';

export function useOverviewData() {
  // 统计

  const totalMineDrainage = mineWaterUtilization.reduce((s, m) => s + parseFloat(m.annualDrainage), 0);

  const avgMineUtilization = Math.round(mineWaterUtilization.reduce((s, m) => s + parseFloat(m.utilizationRate), 0) / mineWaterUtilization.length);

  const salineSoilTotal = salineSoilDistribution.reduce((s, d) => s + d.totalSalineAlkali, 0);

  // 动画数值

  const animResource = useCountUp(247.92, 1400, 2);

  const animSupply = useCountUp(73.18, 1400, 2);

  const animCompliance = useCountUp(100, 1000, 0);

  const animOverExploitReduction = useCountUp(99, 1200, 0);

  const animShallowRise = useCountUp(0.70, 1000, 2);

  const animDeepRise = useCountUp(1.91, 1000, 2);

  const animStorageChange = useCountUp(33.33, 1200, 2);

  const animRivers = useCountUp(90, 1000, 0);

  const animEcoVolume = useCountUp(52, 1000, 0);

  const animSpringCount = useCountUp(3, 800, 0);

  // 各市水位回升数据

  const cityWaterLevelData = useMemo(() =>

    cityGroundwaterDynamic2024

      .filter(c => c.city !== '全省' && c.shallowChange != null)

      .sort((a, b) => (b.shallowChange || 0) - (a.shallowChange || 0))

      .map(c => ({ ...c, shallowChange: Number(c.shallowChange) })),

  []);

  // D-14: 降水-水位回升散点图数据
  const precipWaterLevelScatter = useMemo(() => {
    const gwDynamicMap = new Map(
      cityGroundwaterDynamic2024.filter(c => c.shallowChange != null).map(c => [c.city, c])
    );
    return cityBulletin2024
      .map(c => ({
        city: c.city.replace('市', ''),
        precipitation: c.precipitation,
        shallowChange: gwDynamicMap.get(c.city)?.shallowChange ?? null,
        totalSupply: c.totalSupply,
        gwSupply: c.groundSupply,
        gwRatio: c.totalSupply > 0 ? Math.round(c.groundSupply / c.totalSupply * 100) : 0,
      }))
      .filter(d => d.shallowChange != null && d.precipitation > 0)
      .map(d => ({
        name: d.city,
        precipitation: Math.round(d.precipitation),
        shallowChange: Number(d.shallowChange),
        gwRatio: d.gwRatio,
        totalSupply: d.totalSupply,
      }));
  }, []);

  // D-15: 各市多维水资源雷达图数据
  const cityRadarData = useMemo(() => {
    const gwDynamicMap = new Map(
      cityGroundwaterDynamic2024.filter(c => c.shallowChange != null).map(c => [c.city, c])
    );
    const radarCities = ['石家庄', '邢台', '保定', '承德', '邯郸'];
    const dims = ['供水保障', '水质安全', '水位回升', '用水效率', '生态用水'];
    return dims.map(dim => {
      const entry: Record<string, unknown> = { dimension: dim };
      radarCities.forEach(city => {
        const bulletin = cityBulletin2024.find(c => c.city === city);
        const gwD = gwDynamicMap.get(city);
        if (!bulletin) return;
        let val = 0;
        if (dim === '供水保障') {
          val = Math.min(100, Math.round(bulletin.totalSupply / 35 * 100));
        } else if (dim === '水质安全') {
          val = 95;
        } else if (dim === '水位回升') {
          val = gwD ? Math.min(100, Math.round((gwD.shallowChange || 0) / 3 * 100)) : 60;
        } else if (dim === '用水效率') {
          val = (bulletin.gdpWaterUse ?? 0) > 0 ? Math.max(20, Math.round(100 - (bulletin.gdpWaterUse ?? 0) / 80 * 100)) : 50;
        } else if (dim === '生态用水') {
          val = bulletin.totalSupply > 0 ? Math.min(100, Math.round(bulletin.ecoUse / bulletin.totalSupply * 100 * 3)) : 0;
        }
        entry[city] = val;
      });
      return entry;
    });
  }, []);

  // 供水结构饼图

  const supplyStructure = useMemo(() => {

    const gw = cityWaterSupply2024.reduce((s, c) => s + c.gwSupply, 0);

    const total = cityWaterSupply2024.reduce((s, c) => s + c.totalSupply, 0);

    const surface = Math.round((total - gw) * 100) / 100;

    return [

      { name: '地下水', value: Math.round(gw * 100) / 100, color: '#3b82f6' },

      { name: '地表水+其他', value: surface, color: '#10b981' },

    ];

  }, []);

  // 泉域恢复数据

  const oe = overExploitControl2024;

  const springData = (oe.springRecovery || []).filter((s): s is { name: string; detail: string } => s != null).map((s) => ({
    name: s.name,
    status: 'active',
    detail: s.detail,
  }));

  // 含水层组雷达图数据

  // 矿坑水利用饼图

  // 咸水面积分布

// ── 县级水资源公报数据统计 ──

  const countyDataStats = useMemo(() => {

    const cities = cityBulletin2024.filter(c => c.counties && c.counties.length > 0);

    const withData = cities.filter(c => (c.counties as CountyDataItem[]).some((ct: CountyDataItem) => ct.precip != null));

    const totalCounties = cities.reduce((s: number, c) => s + (c.counties?.length ?? 0), 0);

    const dataCounties = withData.reduce((s: number, c) => s + ((c.counties as CountyDataItem[]).filter((ct: CountyDataItem) => ct.precip != null).length ?? 0), 0);

    // 降水排名

    const allPrecip: { name: string; city: string; precip: number }[] = [];

    cities.forEach((c) => {

      (c.counties as CountyDataItem[]).forEach((ct: CountyDataItem) => {

        if (ct.precip != null) {

          allPrecip.push({ name: ct.name, city: c.city.replace('市', ''), precip: ct.precip });

        }

      });

    });

    allPrecip.sort((a, b) => b.precip - a.precip);

    const topPrecip = allPrecip.slice(0, 5);

    const bottomPrecip = allPrecip.slice(-5).reverse();

    const avgPrecip = allPrecip.length > 0 ? Math.round(allPrecip.reduce((s, c) => s + c.precip, 0) / allPrecip.length) : 0;

    return {

      cities: cities.length, withData: withData.length, totalCounties, dataCounties,

      skelCounties: totalCounties - dataCounties,

      topPrecip, bottomPrecip, avgPrecip,

    };

  }, []);

  // 模块快速入口（扩展到16个，覆盖全部模块）

  // 数据库统计（动态计算）

  // ── 导出数据集 ──

  const overviewSummaryData = useMemo(() => [

    { 指标: '水资源总量(亿m³)', 数值: '247.92', 年份: '2024', 备注: '包含地下水+地表水' },

    { 指标: '地下水供水量(亿m³)', 数值: '73.18', 年份: '2024', 备注: '占总供水量' },

    { 指标: '饮水源达标率(%)', 数值: '100', 年份: '2024', 备注: '27个水源地全部达标' },

    { 指标: '严重超采区缩减(%)', 数值: '99', 年份: '2024', 备注: '历史突破' },

    { 指标: '浅层水位回升(m)', 数值: '0.70', 年份: '2024', 备注: '同比回升' },

    { 指标: '深层水位回升(m)', 数值: '1.91', 年份: '2024', 备注: '同比回升' },

    { 指标: '蓄水变量(亿m³)', 数值: '+33.33', 年份: '2024', 备注: '地下水储存量增加' },

    { 指标: '浅层漏斗面积(km²)', 数值: String(shallowTotal2024.totalArea), 年份: '2024', 备注: '较上年减少734km²' },

    { 指标: '深层漏斗面积(km²)', 数值: '0', 年份: '2024', 备注: '3个深层漏斗全部消散' },

    { 指标: '矿坑排水利用(亿m³/a)', 数值: totalMineDrainage.toFixed(2), 年份: '近期', 备注: `平均利用率${avgMineUtilization}%` },

    { 指标: '开采许可证(个)', 数值: '72334', 年份: '2024', 备注: '全省有效许可' },

    { 指标: '盐碱土面积(万亩)', 数值: salineSoilTotal.toFixed(1), 年份: '调查数据', 备注: '含轻度+中度+重度' },

  ], []);

  const cityWaterLevelExportData = useMemo(() => cityGroundwaterDynamic2024.map(c => {

    const ws = cityWaterSupply2024.find(w => c.city.startsWith(w.city.slice(0, 2)));

    return {

      城市: c.city,

      浅层水位变化: c.shallowChange,

      深层水位变化: c.deepChange,

      供水总量: ws?.totalSupply || '-',

      地下水供水量: ws?.gwSupply || '-',

    };

  }), []);

  const systemZoneExportData = useMemo(() => systemZones.map(z => ({

    分区名称: z.name,

    面积: z.area,

    补给量: z.recharge,

    排泄量: z.discharge,

    水质: z.waterQuality,

  })), []);

  // ── 历史对比面板计算数据 ──

  const historicalCompData = [

    { name: '地下水资源量', period1980s: historicalComparison.period1980s.totalResource, year2024: historicalComparison.year2024.totalResource, unit: '亿m3', change: (historicalComparison.year2024.totalResource - historicalComparison.period1980s.totalResource).toFixed(1) },

    { name: '开采量(2014)', value2014: 155.3, value2024: 94.5, unit: '亿m3', change: (94.5 - 155.3).toFixed(1) },

    { name: '浅层漏斗面积', value2014: 8700, value2024: 3200, unit: 'km2', change: (3200 - 8700) },

    { name: '浅层漏斗数量', value2014: 15, value2024: 7, unit: '个', change: 7 - 15 },

  ];

  // 超采治理里程碑数据

  const overExploitCityData = cityOverExploitDetail.map(c => ({

    name: c.city,

    超采面积: c.overexploitArea,

    治理面积: c.controlArea,

    压采量: c.reductionVolume,

    水位变化: c.waterLevelChange,

    状态: c.status,

  }));

  return {
    totalMineDrainage,
    avgMineUtilization,
    salineSoilTotal,
    animResource,
    animSupply,
    animCompliance,
    animOverExploitReduction,
    animShallowRise,
    animDeepRise,
    animStorageChange,
    animRivers,
    animEcoVolume,
    animSpringCount,
    cityWaterLevelData,
    precipWaterLevelScatter,
    cityRadarData,
    supplyStructure,
    springData,
    countyDataStats,
    overviewSummaryData,
    cityWaterLevelExportData,
    systemZoneExportData,
    historicalCompData,
    overExploitCityData,
  };
}
