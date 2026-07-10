import React, { useMemo } from 'react';


import {

  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter, ZAxis, } from 'recharts';

import {

  TrendingUp, TrendingDown, Droplets, CheckCircle2, Database, MapPin, Trophy, Shield, HardHat, Gem, Snowflake, Flame, MountainSnow, Bug, ArrowLeftRight } from 'lucide-react';


import { historicalComparison, cityWaterSupply2024, groundwaterDynamic2024, resourceTimeSeries, overExploitControl2024, cityGroundwaterDynamic2024, cityBulletin2024 } from '../data/resources';

import { shallowTotal2024, deepTotal2024, landSubsidence } from '../data/environment';

import { pollutionDegree1990s, shallowGroundwaterQuality2024 } from '../data/waterQuality';

import { dbMeta } from '../data/changelog';
import type { CityBulletinBrief } from '../types/county';
import type { CountyDataItem } from '../types/county';

import { systemZones } from '../data/systemZoning';

import { karstSprings, karstProtectionZones } from '../data/karstWater';

import { storageStructureSummary, importantWaterSources, mountainFrontRichZones, waterSourceClassification, alluvialFanStructures } from '../data/waterSource';

import { geothermalFields, geothermalUtilization } from '../data/geothermal';

import { mineralWaterSites, mineralWaterTypes } from '../data/mineralWater';

import { salineDistribution } from '../data/salineWater';

import { salineSoilDistribution } from '../data/salineSoil';

import { fractureWaterTypes } from '../data/fractureWater';

import { mineHydrogeologyData, mineWaterUtilization } from '../data/mineHydrogeology';

import { exploitation1990s, cityOverExploitDetail, waterSubstitutionProjects, overExploitMilestones } from '../data/exploitation';
import { cityExploitationYearly } from '../data/exploitation';
import { cityWaterLevelYearly, citySubsidenceYearly, cityQualityYearly } from '../data/historicalTimeSeries';

import { hydrochemicalZoning } from '../data/hydrochemistry';


import { quaternaryAquiferGroups } from '../data/geology';

import { TechCard, StatCard, ChartTooltip, CHART_COLORS } from '../components/UI';

import { usePageCommons } from '../hooks/usePageCommons'
import { ExportProgressDialog } from '../components/ExportProgressDialog';
// 注册报告生成器

import { LazyChartCard } from '../components/LazyChartCard';
import { StaggerContainer } from '../components/AnimatedCounter';
import { ChartExport } from '../components/ChartExport';
import { useCountUp, KPICard, GaugeCard } from './OverviewHelpers';
import { OverExploitMilestones } from '../components/overview/OverExploitMilestones';
import { OverviewWaterPressure } from './OverviewWaterPressure';
import { OverviewNavigation } from './OverviewNavigation';
import { HydrogeologyReferenceLibrary } from '../components/overview/HydrogeologyReferenceLibrary';
import { HistoricalEvolution } from '../components/overview/HistoricalEvolution';
import { PollutionQualityComparison } from '../components/overview/PollutionQualityComparison';
import { CountyCoverageSection } from '../components/overview/CountyCoverageSection';

// ── Phase 3.2: 治理成效摘要卡片 ──
function GovernanceSummaryCards() {
  const gwCities = ['石家庄', '保定', '邯郸', '邢台', '沧州', '衡水', '廊坊', '唐山', '秦皇岛', '张家口', '承德'];
  const totalExp14 = gwCities.reduce((s, c) => s + (cityExploitationYearly[c]?.[2014] ?? 0), 0);
  const totalExp24 = gwCities.reduce((s, c) => s + (cityExploitationYearly[c]?.[2024] ?? 0), 0);
  const expReduction = totalExp14 > 0 ? ((totalExp14 - totalExp24) / totalExp14 * 100).toFixed(1) : '0';
  const avgWl14 = gwCities.reduce((s, c) => s + (cityWaterLevelYearly[c]?.[2014] ?? 0), 0) / gwCities.length;
  const avgWl24 = gwCities.reduce((s, c) => s + (cityWaterLevelYearly[c]?.[2024] ?? 0), 0) / gwCities.length;
  const wlRecovery = (avgWl14 - avgWl24).toFixed(1);
  const avgQ14 = gwCities.reduce((s, c) => s + (cityQualityYearly[c]?.[2014] ?? 0), 0) / gwCities.length;
  const avgQ24 = gwCities.reduce((s, c) => s + (cityQualityYearly[c]?.[2024] ?? 0), 0) / gwCities.length;
  const qImprove = (avgQ24 - avgQ14).toFixed(1);
  const avgSub14 = gwCities.reduce((s, c) => s + (citySubsidenceYearly[c]?.[2014] ?? 0), 0) / gwCities.length;
  const avgSub24 = gwCities.reduce((s, c) => s + (citySubsidenceYearly[c]?.[2024] ?? 0), 0) / gwCities.length;
  const subSlowdown = avgSub14 > 0 ? ((avgSub14 - avgSub24) / avgSub14 * 100).toFixed(1) : '0';

  const bestRecoveryCity = gwCities.reduce((a, c) => {
    const r = (cityWaterLevelYearly[c]?.[2014] ?? 0) - (cityWaterLevelYearly[c]?.[2024] ?? 0);
    return r > a.val ? { city: c, val: r } : a;
  }, { city: '', val: 0 });

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <StatCard title="十年开采降幅" value={expReduction} unit="%" accent="blue" subtitle={`${totalExp14}→${totalExp24}亿m3`} />
      <StatCard title="十年水位回升" value={wlRecovery} unit="m" accent="cyan" subtitle={`埋深${avgWl14.toFixed(1)}→${avgWl24.toFixed(1)}m`} />
      <StatCard title="十年水质改善" value={qImprove} unit="pp" accent="emerald" subtitle={`达标率${avgQ14.toFixed(1)}%→${avgQ24.toFixed(1)}%`} />
      <StatCard title="十年沉降减缓" value={subSlowdown} unit="%" accent="amber" subtitle={`速率${avgSub14.toFixed(1)}→${avgSub24.toFixed(1)}mm/a`} />
      <StatCard title="水位回升最大" value={bestRecoveryCity.city} unit={`${bestRecoveryCity.val.toFixed(1)}m`} accent="green" subtitle="2014→2024" />
    </div>
  );
}

export function Overview() {

  const { exportOpen, setExportOpen, getData, dataLoading } = usePageCommons({
    pageName: 'overview',
    collector: async () => ({
      summary: overviewSummaryData,
      cityWaterLevel: cityWaterLevelExportData,
      systemZones: systemZoneExportData,
      overExploitDetail: overExploitCityData,
      historicalComp: historicalCompData,
      countyDataStats,
    }),
  });

  

  const d = groundwaterDynamic2024;

  const oe = overExploitControl2024;

  const now = new Date();

  const timeStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // 统计

  const _totalArea = systemZones.filter(z => z.area > 0).reduce((s, z) => s + z.area, 0);

  const salineArea = salineDistribution.reduce((s, d) => s + d.salineArea, 0);

  const totalMineDrainage = mineWaterUtilization.reduce((s, m) => s + parseFloat(m.annualDrainage), 0);

  const avgMineUtilization = Math.round(mineWaterUtilization.reduce((s, m) => s + parseFloat(m.utilizationRate), 0) / mineWaterUtilization.length);

  const salineSoilTotal = salineSoilDistribution.reduce((s, d) => s + d.totalSalineAlkali, 0);

  const totalMineData = mineHydrogeologyData.length;

  // 动画数值

  const animResource = useCountUp(247.92, 1400, 2);

  const animSupply = useCountUp(73.18, 1400, 2);

  const animCompliance = useCountUp(100, 1000, 0);

  const animOverExploitReduction = useCountUp(99, 1200, 0);

  const animShallowRise = useCountUp(0.70, 1000, 2);

  const animDeepRise = useCountUp(1.91, 1000, 2);

  const animStorageChange = useCountUp(33.33, 1200, 2);

  const _animDecline = useCountUp(52.7, 1200, 1);

  const animRivers = useCountUp(90, 1000, 0);

  const animEcoVolume = useCountUp(52, 1000, 0);

  const animSpringCount = useCountUp(3, 800, 0);

  const animPermitCount = useCountUp(72334, 1600, 0);

  const _animSalineSoilArea = useCountUp(622.8, 1200, 1);

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

  const springData = (oe.springRecovery || []).filter((s): s is { name: string; detail: string } => s != null).map((s) => ({
    name: s.name,
    status: 'active',
    detail: s.detail,
  }));

  // 含水层组雷达图数据

  const _aquiferRadarData = useMemo(() => quaternaryAquiferGroups.map(g => ({

    name: g.group.replace('第', '').replace('含水组', ''),

    K: parseFloat(g.K) || 5,

    yield: parseFloat(g.yield) || 10,

    depth: parseFloat(g.depth.split('~')[1]) || 50,

  })), []);

  // 水源地类型分布

  const _wsTypeDistribution = useMemo(() => {

    const typeMap: Record<string, number> = {};

    waterSourceClassification.forEach(wc => {

      const _baseType = wc.name.split('-')[0] || wc.code;

      typeMap[wc.name] = (typeMap[wc.name] || 0) + 1;

    });

    return Object.entries(typeMap).slice(0, 8).map(([name, count], i) => ({

      name: name.length > 8 ? name.slice(0, 8) + '...' : name,

      value: count,

      color: CHART_COLORS[i % CHART_COLORS.length],

    }));

  }, []);

  // 矿坑水利用饼图

  const _mineUtilPie = useMemo(() => mineWaterUtilization.map(m => ({

    name: m.mine,

    value: parseFloat(m.utilizationRate),

    utilization: m.utilizationAmount,

  })), []);

  // 系统分区面积TOP5

  const _topZones = useMemo(() =>

    systemZones.filter(z => z.area > 0).sort((a, b) => b.area - a.area).slice(0, 5),

  []);

  // 地热利用饼图

  const _geothermalPie = useMemo(() => geothermalUtilization.map(g => ({

    name: g.use,

    value: parseFloat(g.proportion),

    scale: g.scale,

  })), []);

  // 矿泉水类型分布

  const _mwTypePie = useMemo(() => mineralWaterTypes.map(t => ({

    name: t.type.length > 10 ? t.type.slice(0, 10) : t.type,

    value: t.count || 1,

  })), []);

  // 咸水面积分布

  const _salinePie = useMemo(() => salineDistribution.slice(0, 6).map(s => ({

    name: s.region,

    value: s.salineArea,

    freshRatio: s.freshArea ? `${((1 - s.salineArea / (s.freshArea + s.salineArea)) * 100).toFixed(0)}%` : '-',

  })), []);

  // 裂隙水类型对比

  const _fractureBarData = useMemo(() => fractureWaterTypes.map(f => ({

    name: f.type.length > 6 ? f.type.slice(0, 6) : f.type,

    yield: parseFloat(f.yield) || 0,

    proportion: parseFloat(f.proportion) || 0,

    richness: f.richness,

  })), []);

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

  const _quickLinks = [

    { label: '水资源公报', count: '2024', icon: Droplets, path: '/resources', accent: 'blue' as const },

    { label: '水质评价', count: '达标100%', icon: FlaskConical, path: '/water-quality', accent: 'green' as const },

    { label: '水化学', count: `${hydrochemicalZoning.length}分区`, icon: Activity, path: '/hydrochemistry', accent: 'cyan' as const },

    { label: '系统区划', count: `${systemZones.length}区`, icon: Grid3X3, path: '/system-zoning', accent: 'blue' as const },

    { label: '基础地质', count: `${quaternaryAquiferGroups.length}组`, icon: Mountain, path: '/geology', accent: 'amber' as const },

    { label: '水文参数', count: 'K/μ/ne/αL', icon: Database, path: '/hydro-zone-params', accent: 'green' as const },

    { label: '水源地', count: `${importantWaterSources.length}个`, icon: MapPin, path: '/water-source', accent: 'cyan' as const },

    { label: '开采管理', count: `${animPermitCount}证`, icon: Target, path: '/exploitation', accent: 'purple' as const },

    { label: '岩溶水', count: `${karstSprings.length}泉`, icon: Waves, path: '/karst-water', accent: 'blue' as const },

    { label: '裂隙水', count: `${fractureWaterTypes.length}类`, icon: Grid3X3, path: '/fracture-water', accent: 'green' as const },

    { label: '地热资源', count: `${geothermalFields.length}田`, icon: Flame, path: '/geothermal', accent: 'amber' as const },

    { label: '矿泉水', count: `${mineralWaterSites.length}处`, icon: Gem, path: '/mineral-water', accent: 'purple' as const },

    { label: '咸水分布', count: `${salineArea.toLocaleString()}km²`, icon: Snowflake, path: '/saline-water', accent: 'red' as const },

    { label: '盐碱土', count: `${salineSoilTotal.toFixed(0)}万亩`, icon: MountainSnow, path: '/saline-soil', accent: 'amber' as const },

    { label: '矿山地质', count: `${totalMineData}矿区`, icon: HardHat, path: '/mine-hydrogeology', accent: 'red' as const },

    { label: '环境问题', count: `${landSubsidence.length}市`, icon: Bug, path: '/environment', accent: 'red' as const },

    { label: '县级对比', count: `${countyDataStats.dataCounties}县`, icon: ArrowLeftRight, path: '/county-compare', accent: 'cyan' as const },

    { label: '数据洞察', count: '8维度', icon: TrendingUp, path: '/data-insight', accent: 'purple' as const },

  ];

  // 数据库统计（动态计算）

  const _dbStats = useMemo(() => [

    { label: '系统分区', value: systemZones.length, sub: '区', accent: 'blue' },

    { label: '蓄水构造', value: storageStructureSummary.reduce((s, t) => s + t.count, 0), sub: '个', accent: 'cyan' },

    { label: '岩溶泉域', value: karstSprings.length, sub: '个', accent: 'blue' },

    { label: '含水层组', value: quaternaryAquiferGroups.length, sub: '组', accent: 'green' },

    { label: '地热田', value: geothermalFields.length, sub: '个', accent: 'amber' },

    { label: '矿泉水', value: mineralWaterSites.length, sub: '处', accent: 'purple' },

    { label: '水源地', value: importantWaterSources.length, sub: '个', accent: 'cyan' },

    { label: '裂隙水类', value: fractureWaterTypes.length, sub: '类', accent: 'green' },

    { label: '开采许可证', value: '7.2万', sub: '个', accent: 'purple' },

    { label: '补给回灌', value: `${geothermalUtilization.length}类`, sub: '利用', accent: 'amber' },

    { label: '保护分区', value: karstProtectionZones.length, sub: '泉域', accent: 'blue' },

    { label: '盐碱土', value: salineSoilTotal.toFixed(0), sub: '万亩', accent: 'amber' },

  ], []);

  // 报告数据预采集

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

  const _milestoneData = overExploitMilestones.map(m => ({

    name: String(m.year),

    value: m.year - 2013,

    event: m.event,

    detail: m.detail,

  }));

  // 山前富水区数据

  const _richZoneData = mountainFrontRichZones.map((z: { zone: string; yield: string; area?: string; K?: string; k?: string }) => ({
    name: z.zone.length > 8 ? z.zone.slice(0, 8) : z.zone,
    yield: parseFloat(z.yield || '0'),

    area: parseFloat(String(z.area || '0')),

    k: parseFloat(String(z.K || z.k || '0')),

  }));

  // 引调水工程数据

  const _substitutionData = waterSubstitutionProjects.slice(0, 6).map(p => ({

    name: (p.name || '').length > 10 ? (p.name || '').slice(0, 10) + '...' : (p.name || ''),

    volume: parseFloat(String(p.substitutionVolume || p.scale || '0')),

    status: p.status || '',

  }));

  // 1990s污染程度数据（堆叠面积图）

  const _pollution1990Data = pollutionDegree1990s.map(p => ({

    name: p.city,

    未污染: p.unpolluted,

    轻度: p.light,

    中度: p.moderate,

    重度: p.heavy,

    严重: p.severe,

  }));

  // 2024年浅层水质数据（堆叠柱图）

  const _quality2024Data = shallowGroundwaterQuality2024.slice(0, 8).map(q => ({

    name: q.region,

    'III类及以上': +(q.I + q.II + q.III).toFixed(1),

    IV类: q.IV,

    V类: q.V,

  }));

  // 冲洪积扇蓄水构造数据

  const _fanData = alluvialFanStructures.slice(0, 6).map(f => ({

    name: f.name.length > 10 ? f.name.slice(0, 10) + '...' : f.name,

    面积: parseFloat(String(f.area || '0')),

    深度: f.depth || '-',

    岩性: (f.lithology || '').slice(0, 15),

  }));

  // 重点水源地数据

  const _wsSourceData = importantWaterSources.map(w => ({

    name: w.name.replace('水源地', ''),

    供水量: parseFloat(String(w.supply || '0')),

    类型: w.type || '',

    状态: w.status || '',

  }));

  // 1990s各市开采量数据

  const _exploit1990Data = exploitation1990s.map(e => ({

    name: e.city,

    浅层: e.shallow,

    深层: e.deep,

    合计: e.shallow + e.deep,

  })).sort((a: { 合计: number }, b: { 合计: number }) => b.合计 - a.合计).slice(0, 8);

  // 各市超采治理详情

  const overExploitCityData = cityOverExploitDetail.map(c => ({

    name: c.city,

    超采面积: c.overexploitArea,

    治理面积: c.controlArea,

    压采量: c.reductionVolume,

    水位变化: c.waterLevelChange,

    状态: c.status,

  }));

  return (

    <div className="p-6 max-w-[1440px] mx-auto space-y-6">

      {/* ═══════════════════ Header ═══════════════════ */}

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-2xl font-bold text-gw-text tracking-tight">

            <span className="text-gw-highlight text-glow-cyan">河北地下水</span>

            <span className="text-gw-muted mx-2">/</span>

            基础资料数据库

          </h1>

          <p className="text-xs text-gw-muted mt-1 font-mono">

            Hebei Groundwater Database v2.0 | {timeStr}

          </p>

        </div>

        <div className="flex items-center gap-2">

          <span className="px-3 py-1 rounded-full text-[10px] bg-gw-cyan/10 text-gw-cyan border border-gw-cyan/20 font-mono tracking-wider">{dbMeta.version}</span>

          <span className="px-3 py-1 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">{dbMeta.lastUpdate}</span>

        </div>

      </div>

      <CountyCoverageSection countyDataStats={countyDataStats} cityBulletin2024={cityBulletin2024 as CityBulletinBrief[]} />

      {/* ═══════════════════ 核心指标 KPI（8列） ═══════════════════ */}

      <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3" staggerDelay={60}>

        <KPICard title="水资源总量" value={animResource} unit="亿m³" sub="2024年" change="+40.5%" changeType="up" icon={Droplets} accent="blue" sparkline={[167.7, 214.8, 206.2, 226.9, 168.6, 241.4, 247.9]} sparkColor="#3b82f6" />

        <KPICard title="地下水供水量" value={animSupply} unit="亿m³" sub="2024年" change={`峰值${d.declinePercent}%`} changeType="down" icon={Activity} accent="cyan" sparkline={[120.2, 112.6, 108.5, 106.1, 99.8, 82.3, 73.2]} sparkColor="#06b6d4" />

        <KPICard title="饮水源达标率" value={animCompliance} unit="%" change="27水源地" changeType="up" icon={CheckCircle2} accent="green" />

        <KPICard title="严重超采缩减" value={animOverExploitReduction} unit="%" change="历史突破" changeType="up" icon={Trophy} accent="emerald" sparkline={[155.3, 149.3, 143.8, 138.0, 132.6, 126.8, 121.1, 115.7, 110.8, 105.7, 94.5]} sparkColor="#10b981" />

        <KPICard title="浅层水位" value={animShallowRise} unit="m" change="同比回升" changeType="up" icon={TrendingUp} accent="cyan" sparkline={[25.8, 27.2, 29.5, 32.1, 35.8, 40.2, 44.5, 50.3, 56.8, 63.5]} sparkColor="#06b6d4" />

        <KPICard title="深层水位" value={animDeepRise} unit="m" change="同比回升" changeType="up" icon={TrendingUp} accent="blue" sparkline={[0.3, 0.5, 0.8, 1.0, 1.2, 1.5, 1.91]} sparkColor="#3b82f6" />

        <KPICard title="矿坑水利用" value={avgMineUtilization} unit="%" change={`${totalMineDrainage.toFixed(1)}亿m³/a`} changeType="up" icon={HardHat} accent="amber" />

        <KPICard title="深层漏斗" value="消散" unit="" change="3个漏斗" changeType="neutral" icon={Shield} accent="purple" />

      </StaggerContainer>

      {/* ═════════════════ 历史治理成效摘要（Phase 3.2） ═════════════════ */}
      <TechCard title="2014→2024 超采治理十年成效" badge="综合评估" className="hud-corners">
        <GovernanceSummaryCards />
      </TechCard>

      <OverviewWaterPressure dataCounties={countyDataStats.dataCounties} />{/* ═══════════════════ 地下水动态仪表盘 ═══════════════════ */}

      <TechCard title="2024年地下水动态" icon={Activity} className="hud-corners">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          <GaugeCard label="浅层水位回升" value={animShallowRise} unit="m" color="emerald" />

          <GaugeCard label="深层水位回升" value={animDeepRise} unit="m" color="emerald" />

          <GaugeCard label="蓄水变量" value={`+${animStorageChange}`} unit="亿m³" color="cyan" />

          <GaugeCard label="浅层漏斗面积" value={shallowTotal2024.totalArea} unit="km²" color="blue" sub="较上年-734" />

        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">

          <div>

            <div className="flex justify-between text-xs mb-1">

              <span className="text-gw-muted">浅层漏斗总面积</span>

              <span className="font-mono text-gw-cyan">{shallowTotal2024.totalArea} km²</span>

            </div>

            <div className="h-2.5 bg-gw-surface rounded-full overflow-hidden">

              <div className="h-full bg-gradient-to-r from-gw-blue to-gw-cyan rounded-full progress-bar" style={{ width: `${(Number(shallowTotal2024.totalArea) / 18000 * 100).toFixed(0)}%` }} />

            </div>

          </div>

          <div>

            <div className="flex justify-between text-xs mb-1">

              <span className="text-gw-muted">深层漏斗总面积</span>

              <span className="font-mono text-emerald-400">{deepTotal2024.totalArea} km²</span>

            </div>

            <div className="h-2.5 bg-gw-surface rounded-full overflow-hidden">

              <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-full progress-bar" style={{ width: '0%' }} />

            </div>

            <p className="text-[10px] text-emerald-400/70 mt-1 font-mono">3个深层漏斗全部消散</p>

          </div>

        </div>

      </TechCard>

      {/* ═══════════════════ 核心图表行 ═══════════════════ */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <LazyChartCard title="水资源量时序变化" className="scan-line min-h-[320px]" height={280}>
            <div className="mb-2 flex justify-end">
              <ChartExport data={resourceTimeSeries} filename="水资源量时序变化" sheetName="水资源时序" formats={['xlsx','csv','json']} label="导出数据" />
            </div>
          <ResponsiveContainer width="100%" height={280}>

            <AreaChart data={resourceTimeSeries}>

              <defs>

                <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">

                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />

                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />

                </linearGradient>

                <linearGradient id="gGround" x1="0" y1="0" x2="0" y2="1">

                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />

                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />

                </linearGradient>

                <linearGradient id="gSurface" x1="0" y1="0" x2="0" y2="1">

                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />

                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />

                </linearGradient>

              </defs>

              <CartesianGrid strokeDasharray="2 4" stroke="#1a2d4d" />

              <XAxis dataKey="year" stroke="#64748b" fontSize={11} />

              <YAxis stroke="#64748b" fontSize={11} />

              <Tooltip content={<ChartTooltip unit="亿m³" title="水资源趋势" />} />

              <Legend wrapperStyle={{ fontSize: 11, color: '#64748b' }} />

              <Area type="monotone" dataKey="total" name="总量" stroke="#3b82f6" fill="url(#gTotal)" strokeWidth={2} />

              <Area type="monotone" dataKey="ground" name="地下水" stroke="#06b6d4" fill="url(#gGround)" strokeWidth={2} />

              <Area type="monotone" dataKey="surface" name="地表水" stroke="#10b981" fill="url(#gSurface)" strokeWidth={2} />

            </AreaChart>

          </ResponsiveContainer>

        </LazyChartCard>

        <TechCard title="平原区浅层水位变化分区" className="hud-corners">

          <div className="flex items-center gap-6">

            <ResponsiveContainer width="60%" height={260}>

              <PieChart>

                <Pie

                  data={[

                    { name: '上升区', value: d.shallowRiseArea },

                    { name: '稳定区', value: d.shallowStableArea },

                    { name: '下降区', value: d.shallowDeclineArea },

                  ]}

                  cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3}

                  dataKey="value" stroke="none"

                >

                  <Cell fill="#10b981" />

                  <Cell fill="#f59e0b" />

                  <Cell fill="#ef4444" />

                </Pie>

                <Tooltip content={<ChartTooltip percentDigits={1} title="类型分布" />} />

              </PieChart>

            </ResponsiveContainer>

            <div className="flex-1 space-y-4">

              {[

                { name: '上升区', value: d.shallowRiseArea, color: 'emerald', icon: TrendingUp },

                { name: '稳定区', value: d.shallowStableArea, color: 'amber', icon: Activity },

                { name: '下降区', value: d.shallowDeclineArea, color: 'red', icon: TrendingDown },

              ].map(item => (

                <div key={item.name} className="flex items-center gap-3">

                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-${item.color}-500/15`}>

                    <item.icon size={14} className={`text-${item.color}-400`} />

                  </div>

                  <div className="flex-1">

                    <div className="flex justify-between text-xs mb-1">

                      <span className="text-gw-muted">{item.name}</span>

                      <span className="font-mono text-gw-text">{item.value}%</span>

                    </div>

                    <div className="h-1.5 bg-gw-surface rounded-full overflow-hidden">

                      <div className={`h-full bg-${item.color}-500 rounded-full progress-bar`} style={{ width: `${item.value}%` }} />

                    </div>

                  </div>

                </div>

              ))}

            </div>

          </div>

        </TechCard>

      </div>

      {/* ═══════════════════ 供水结构 + 各市水位回升 ═══════════════════ */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <LazyChartCard title="供水结构(2024)" className="hud-corners" height={280}>
            <div className="mb-2 flex justify-end">
              <ChartExport data={supplyStructure} filename="供水结构2024" sheetName="供水结构" formats={['xlsx','csv','json']} label="导出数据" />
            </div>
          <ResponsiveContainer width="100%" height={260}>

            <PieChart>

              <Pie data={supplyStructure} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" stroke="none">

                {supplyStructure.map((entry, i) => <Cell key={i} fill={entry.color} />)}

              </Pie>

              <Tooltip content={<ChartTooltip percentDigits={1} title="供水结构" />} />

              <Legend wrapperStyle={{ fontSize: 11 }} />

            </PieChart>

          </ResponsiveContainer>

        </LazyChartCard>

        <LazyChartCard title="各市浅层水位年变幅(2024)" className="scan-line lg:col-span-2" height={280}>
            <div className="mb-2 flex justify-end">
              <ChartExport data={cityWaterLevelData} filename="各市浅层水位年变幅2024" sheetName="水位变幅" formats={['xlsx','csv','json']} label="导出数据" />
            </div>
          <ResponsiveContainer width="100%" height={260}>

            <BarChart data={cityWaterLevelData} layout="vertical" margin={{ left: 10 }}>

              <CartesianGrid strokeDasharray="2 4" stroke="#1a2d4d" />

              <XAxis type="number" stroke="#64748b" fontSize={11} unit="m" />

              <YAxis dataKey="city" type="category" stroke="#64748b" fontSize={11} width={65} />

              <Tooltip content={<ChartTooltip unit="m" title="水位变幅" />} />

              <Bar dataKey="shallowChange" name="水位年变幅(m)" radius={[0, 3, 3, 0]} barSize={14}>

                {cityWaterLevelData.map((entry, index) => (

                  <Cell key={index} fill={entry.shallowChange > 1.5 ? '#10b981' : entry.shallowChange > 0.5 ? '#3b82f6' : '#f59e0b'} />

                ))}

              </Bar>

            </BarChart>

          </ResponsiveContainer>

          <div className="flex items-center gap-4 mt-2 text-[10px] text-gw-muted">

            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500 inline-block" />&gt;1.5m</span>

            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500 inline-block" />0.5~1.5m</span>

            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500 inline-block" />&lt;0.5m</span>

          </div>

        </LazyChartCard>

      </div>

      {/* ═══════════════════ 14市供水量 ═══════════════════ */}

      <LazyChartCard title="14市地下水供水量" height={280}>

        <ResponsiveContainer width="100%" height={320}>

          <BarChart data={cityWaterSupply2024} layout="vertical" margin={{ left: 10 }}>

            <CartesianGrid strokeDasharray="2 4" stroke="#1a2d4d" />

            <XAxis type="number" stroke="#64748b" fontSize={11} />

            <YAxis dataKey="city" type="category" stroke="#64748b" fontSize={11} width={55} />

            <Tooltip content={<ChartTooltip unit="亿m³" title="供水量" />} />

            <Bar dataKey="gwSupply" name="地下水(亿m³)" fill="#3b82f6" radius={[0, 3, 3, 0]} barSize={12} />

            <Bar dataKey="totalSupply" name="总供水(亿m³)" fill="#1a2d4d" radius={[0, 3, 3, 0]} barSize={12} />

          </BarChart>

        </ResponsiveContainer>

      </LazyChartCard>

      {/* ═══════════════════ 降水-水位散点 + 多维雷达 ═══════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="降水-水位回升相关性" badge={`${precipWaterLevelScatter.length}市`} className="scan-line" height={320}>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] text-gw-muted">X:年降水量(mm) Y:浅层水位年变幅(m) 气泡大小=地下水占比</span>
            <ChartExport data={precipWaterLevelScatter} filename="降水-水位回升相关性" sheetName="散点数据" formats={['xlsx','csv','json']} label="导出数据" />
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#1a2d4d" />
              <XAxis dataKey="precipitation" name="降水量" type="number" unit="mm" stroke="#64748b" fontSize={11} domain={[200, 700]} />
              <YAxis dataKey="shallowChange" name="水位变幅" type="number" unit="m" stroke="#64748b" fontSize={11} domain={[0, 4]} />
              <ZAxis dataKey="gwRatio" range={[40, 200]} name="地下水占比" />
              <Tooltip content={<ChartTooltip title="降水-水位" />} />
              <Scatter name="城市" data={precipWaterLevelScatter} fill="#06b6d4">
                {precipWaterLevelScatter.map((entry, index) => (
                  <Cell key={index} fill={entry.shallowChange > 1.5 ? '#10b981' : entry.shallowChange > 0.5 ? '#3b82f6' : '#f59e0b'} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <LazyChartCard title="各市多维水资源雷达图" badge="5维度 · 5城市" className="hud-corners" height={320}>
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{backgroundColor:'#06b6d4'}} />石家庄</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{backgroundColor:'#3b82f6'}} />邢台</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{backgroundColor:'#f59e0b'}} />保定</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{backgroundColor:'#10b981'}} />承德</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{backgroundColor:'#ef4444'}} />邯郸</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={cityRadarData}>
              <PolarGrid stroke="rgba(6,182,212,0.12)" />
              <PolarAngleAxis dataKey="dimension" tick={{ fill: '#8b9dc3', fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#8b9dc3', fontSize: 8 }} />
              <Radar name="石家庄" dataKey="石家庄" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} strokeWidth={2} />
              <Radar name="邢台" dataKey="邢台" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
              <Radar name="保定" dataKey="保定" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} strokeWidth={2} />
              <Radar name="承德" dataKey="承德" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
              <Radar name="邯郸" dataKey="邯郸" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} strokeWidth={2} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Tooltip content={<ChartTooltip title="多维对比" />} />
            </RadarChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>

      <OverExploitMilestones
        oe={oe}
        springData={springData}
        animSpringCount={animSpringCount}
        animRivers={animRivers}
        animEcoVolume={animEcoVolume}
      />

      <HydrogeologyReferenceLibrary />

      <HistoricalEvolution />

      <PollutionQualityComparison />

      <OverviewNavigation />{/* 导出报告按钮 */}
      <div className="flex items-center justify-end mb-2">
        <button onClick={() => setExportOpen(true)} className="px-3 py-1.5 rounded-lg text-xs bg-gw-blue/15 text-gw-highlight border border-gw-blue/30 hover:bg-gw-blue/25 transition-all">
          导出总览报告
        </button>
      </div>
      <ExportProgressDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        reportType="overview"
        reportLabel="河北省地下水数据库总览报告"
        data={getData()}
        dataLoading={dataLoading}
      />

      {/* ── 数据源标注 ── */}

      <div className="flex items-center justify-between text-[10px] text-gw-muted/40 pb-4">

        <span>数据来源: 1999年《河北省地下水》+ 2024年水资源公报 + 2024年生态环境公报</span>

        <span>河北瑞三元环境科技有限公司</span>
      </div>
      </div>

  );
}

// ── KPI 卡片 ──

