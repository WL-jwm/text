import React, { useMemo } from 'react';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
  PieChart, Pie, Cell, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, ZAxis, Radar,
} from 'recharts';
import { Activity, TrendingUp, TrendingDown, Droplets, CheckCircle2, Trophy, Shield, HardHat } from 'lucide-react';

import { historicalComparison, cityWaterSupply2024, groundwaterDynamic2024, resourceTimeSeries, overExploitControl2024, cityGroundwaterDynamic2024, cityBulletin2024 } from '../data/resources';

import { shallowTotal2024, deepTotal2024 } from '../data/environment';

import { dbMeta } from '../data/changelog';
import type { CityBulletinBrief } from '../types/county';
import type { CountyDataItem } from '../types/county';

import { systemZones } from '../data/systemZoning';

import { salineSoilDistribution } from '../data/salineSoil';

import { mineWaterUtilization } from '../data/mineHydrogeology';

import { cityOverExploitDetail } from '../data/exploitation';

import { TechCard, ChartTooltip } from '../components/UI';

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
import { CountyCoverageSection } from '../components/overview/CountyCoverageSection';
import { GovernanceSummaryCards } from '../components/overview/GovernanceSummaryCards';
import { CollapsiblePanel } from '../components/overview/CollapsiblePanel';
import { HydrogeologyReferenceLibrary } from '../components/overview/HydrogeologyReferenceLibrary';
import { ExploitationControlComparison } from '../components/overview/ExploitationControlComparison';
import { ExploitationManagement } from '../components/overview/ExploitationManagement';
import { AlluvialFansWaterSources } from '../components/overview/AlluvialFansWaterSources';
import { StandardsReferencePanel } from '../components/overview/StandardsReferencePanel';
import { HydroParamsReferencePanel } from '../components/overview/HydroParamsReferencePanel';
import { ZoneParamsPanel } from '../components/overview/ZoneParamsPanel';
import { HistoricalEvolution } from '../components/overview/HistoricalEvolution';
import { PollutionQualityComparison } from '../components/overview/PollutionQualityComparison';

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

      <OverviewWaterPressure dataCounties={countyDataStats.dataCounties} />

      {/* ═══════════════════ 地下水动态仪表盘 ═══════════════════ */}

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

      {/* ═══════════════════ 参数参考面板（默认折叠） ═══════════════════ */}
      <CollapsiblePanel title="历史水文地质参数参考库" badge="A表">
        <HydrogeologyReferenceLibrary />
      </CollapsiblePanel>

      <CollapsiblePanel title="超采治理成效对比" badge="exploitation">
        <ExploitationControlComparison />
      </CollapsiblePanel>

      <CollapsiblePanel title="开采管理概览" badge="管理">
        <ExploitationManagement />
      </CollapsiblePanel>

      <CollapsiblePanel title="冲洪积扇与水源地" badge="蓄水构造">
        <AlluvialFansWaterSources />
      </CollapsiblePanel>

      <CollapsiblePanel title="评价标准参考" badge="GB">
        <StandardsReferencePanel />
      </CollapsiblePanel>

      <CollapsiblePanel title="水文地质参数速查" badge="B表">
        <HydroParamsReferencePanel />
      </CollapsiblePanel>

      <CollapsiblePanel title="地下水系统分区参数" badge="分区">
        <ZoneParamsPanel />
      </CollapsiblePanel>

      <CollapsiblePanel title="历史演变与污染对比" badge="历史">
        <HistoricalEvolution />
        <PollutionQualityComparison />
      </CollapsiblePanel>

      <OverviewNavigation />

      {/* 导出报告按钮 */}
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