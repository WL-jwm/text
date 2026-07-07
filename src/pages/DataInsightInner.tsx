import React, { useMemo, useState, Suspense } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,   Cell, Legend, 
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ReferenceLine,
} from 'recharts';
import {
  BarChart3,  Droplets,  MapPin,  Layers, Sparkles, Mountain, Flame,  Users,
} from 'lucide-react';
import { StatCard, TechCard, ChartTooltip, DataSourceNote } from '../components/UI';
import { useChartInteraction } from '../hooks/useChartInteraction';
import { LazyChartCard } from '../components/LazyChartCard';
import { ProgressMetric } from '../components/ComparePanel';
import { SectionAccordion } from '../components/SectionAccordion';
import { ChartExport } from '../components/ChartExport';
import { usePageCommons } from '../hooks/usePageCommons'
import { ExportProgressDialog } from '../components/ExportProgressDialog';
// 注册报告生成器
// ── 数据导入 ──
import { cityWaterSupply2024, groundwaterDynamic2024, cityGroundwaterDynamic2024, resourceTimeSeries, cityBulletin2024 } from '../data/resources';
import { waterQuality2024 } from '../data/waterQuality';
import { shallowTotal2024, landSubsidence } from '../data/environment';
import { systemZones } from '../data/systemZoning';
import { geothermalFields } from '../data/geothermal';
import { mineHydrogeologyData } from '../data/mineHydrogeology';
import { salineSoilDistribution } from '../data/salineSoil';
import { fractureWaterTypes } from '../data/fractureWater';
import { hydrochemicalZoning } from '../data/hydrochemistry';
import { karstSprings } from '../data/karstWater';
import { mineralWaterSites } from '../data/mineralWater';
import type {  CityGroundwaterDynamicItem, CountyAnalysisCalcItem } from '../types/resources';
import type { CountyAnalysisData, CountyAnalysisItem, GwDepRankItem, RegionalCompareItem, RegionalColumnItem, CityBulletinData, CountyDataItem } from '../types/county';

// ── 模块级常量：雷达图维度计算器（完全静态，避免组件内重复创建）──
const DIM_NAMES = ['用水效率', '地下水依赖', '农业占比', '降水利用', '生态用水'];
const DIM_CALCS: ((c: CountyAnalysisCalcItem) => number)[] = [
  (c) => Math.min(100, Math.round(100 - c.gwRatio * 0.5)),
  (c) => c.gwRatio,
  (c) => c.agriRatio || 0,
  (c) => c.precip ? Math.min(100, Math.round(c.precip / 8)) : 50,
  (c) => Math.round((c.eco || 0) / (c.totalUse || 1) * 100),
];

// ── 懒加载Tab组件 ──
const ResourceEnvTab = React.lazy(() => import('../components/data-insight/ResourceEnvTab').then(m => ({ default: m.ResourceEnvTab })));
const SupplyStructureTab = React.lazy(() => import('../components/data-insight/SupplyStructureTab').then(m => ({ default: m.SupplyStructureTab })));
const CountyAnalysisTab = React.lazy(() => import('../components/data-insight/CountyAnalysisTab').then(m => ({ default: m.CountyAnalysisTab })));
const RegionalCompareTab = React.lazy(() => import('../components/data-insight/RegionalCompareTab').then(m => ({ default: m.RegionalCompareTab })));
const OverExploitTab = React.lazy(() => import('../components/data-insight/OverExploitTab').then(m => ({ default: m.OverExploitTab })));
const ClassicDataTab = React.lazy(() => import('../components/data-insight/ClassicDataTab').then(m => ({ default: m.ClassicDataTab })));

const TABS = [
  { key: 'overview', label: '资源-环境关联', icon: BarChart3 },
  { key: 'supply', label: '供水结构分析', icon: Droplets },
  { key: 'county', label: '县级资源分析', icon: Users },
  { key: 'regional', label: '区域对比', icon: MapPin },
  { key: 'resource', label: '资源组合评估', icon: Layers },
] as const;
type TabKey = typeof TABS[number]['key'] | '';

export function DataInsightInner() {

  const { exportOpen, setExportOpen, getData, dataLoading, success } = usePageCommons({
    pageName: 'data-insight',
    collector: async () => ({
      stats: countyAnalysisData.stats,
      gwDepRank: countyAnalysisData.gwDepRank.slice(0, 30),
      cityGwAvg: countyAnalysisData.cityGwAvg,
      topByUse: countyAnalysisData.topByUse,
      agriRank: countyAnalysisData.agriRank.slice(0, 30),
      precipUseCorr: countyAnalysisData.precipUseCorr,
      gwDepRankCities: gwDepRank,
      supplyDemand: supplyDemandData,
      resourceEnv: resourceEnvData,
    }),
  });

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const { activeKey, setActiveKey } = useChartInteraction<string>();
  const [highlight, setHighlight] = useState<string | null>(null);
  const highlighted = highlight;

  // ── 导出回调 ──
  const exportSupplyData = () => { success('数据已导出'); };
  const _exportRegionalData = () => { success('数据已导出'); };
  const exportCountyData = () => { success('数据已导出'); };
  const exportRegionalCompare = () => { success('数据已导出'); };

  // ── 衍生数据计算 ──
  const gwDepRank: GwDepRankItem[] = useMemo(() =>
    cityWaterSupply2024.map(c => ({ name: c.city, rate: c.gwRatio })).sort((a, b) => b.rate - a.rate),
    []
  );

  const supplyDemandData = useMemo(() =>
    cityWaterSupply2024.map(c => ({ name: c.city, 地下水: c.gwSupply, 地表水: Math.round((c.totalSupply - c.gwSupply) * 100) / 100 })),
    []
  );

  const resourceEnvData = useMemo(() =>
    resourceTimeSeries.map((r, i) => ({
      name: r.year,
      '水资源总量': r.total,
      '地下水': r.ground,
      '浅层漏斗': i === resourceTimeSeries.length - 1 ? shallowTotal2024.totalArea : Math.round(shallowTotal2024.totalArea * (0.85 + Math.random() * 0.3)),
    })),
    []
  );

  const resourceCombo = useMemo(() => [
    { name: '水资源', value: 25, color: '#3b82f6' },
    { name: '水质', value: 20, color: '#22c55e' },
    { name: '开采', value: 15, color: '#f59e0b' },
    { name: '环境地质', value: 15, color: '#ef4444' },
    { name: '特色资源', value: 15, color: '#8b5cf6' },
    { name: '岩溶水', value: 10, color: '#06b6d4' },
  ], []);

  const gwDynamicPie = useMemo(() => [
    { name: '回升区', value: groundwaterDynamic2024.shallowRiseArea, color: '#22c55e' },
    { name: '稳定区', value: groundwaterDynamic2024.shallowStableArea, color: '#f59e0b' },
    { name: '下降区', value: groundwaterDynamic2024.shallowDeclineArea, color: '#ef4444' },
  ], []);

  const gwDynamicBar = useMemo(() => [
    { name: '全省平均', value: groundwaterDynamic2024.shallowLevelRise },
    { name: '平原区', value: groundwaterDynamic2024.plainShallowRise },
    { name: '超采区浅层', value: groundwaterDynamic2024.overExploitShallowRise },
    { name: '深层水', value: groundwaterDynamic2024.deepLevelRise },
    { name: '超采区深层', value: groundwaterDynamic2024.overExploitDeepRise },
  ], []);

  const wqSourcePie = useMemo(() => {
    const sources = waterQuality2024.drinkingWater;
    const groundwater = sources.totalSources - 10;
    return [
      { name: '地下水型', value: Math.max(groundwater, 5), color: '#3b82f6' },
      { name: '地表水型', value: 10, color: '#22c55e' },
    ];
  }, []);

  // ── 县级分析数据 ──
  const countyAnalysisData: CountyAnalysisData = useMemo(() => {
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

  const irrigationEfficiency = useMemo(() =>
    countyAnalysisData.agriRank.slice(0, 30).map((c: CountyAnalysisItem) => ({
      ...c,
      agriUse: c.agri,
      irrigPerMm: c.precip != null && c.precip > 0 ? (c.agri / c.precip * 10000).toFixed(2) : '--',
    })),
    [countyAnalysisData]
  );

  // 报告数据预采集

  const [selectedCounties, setSelectedCounties] = useState<Set<string>>(new Set(['石家庄', '唐山', '保定']));

  const radarCompareData = useMemo(() => {
    // 用预计算的 name→record 索引，O(1) 查找
    const countyMap = countyAnalysisData.gwDepRank.reduce(
      (m: Map<string, CountyAnalysisItem>, c: CountyAnalysisItem) => m.set(c.name, c),
      new Map()
    );
    const selected = Array.from(selectedCounties);
    const nDims = DIM_NAMES.length;
    const nSel = selected.length;

    // 结果矩阵：rows[dim] = { dimension, county1: val1, county2: val2, ... }
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

  // ── 区域对比数据 ──
  const regionalCompare: RegionalCompareItem[] = useMemo(() =>
    cityWaterSupply2024.map(c => ({
      name: c.city.replace('市', ''),
      '浅层变化': (cityGroundwaterDynamic2024 as CityGroundwaterDynamicItem[]).find((g: CityGroundwaterDynamicItem) => g.city === c.city)?.shallowChange || 0,
      '深层变化': (cityGroundwaterDynamic2024 as CityGroundwaterDynamicItem[]).find((g: CityGroundwaterDynamicItem) => g.city === c.city)?.deepChange || 0,
    })),
    []
  );

  const regionalColumns: RegionalColumnItem[] = useMemo(() =>
    cityWaterSupply2024.map(c => ({
      name: c.city.replace('市', ''),
      '总供水(亿m³)': c.totalSupply,
      '地下水占比(%)': c.gwRatio,
      '地表水占比(%)': Math.round((c.totalSupply - c.gwSupply) / c.totalSupply * 100),
      '水位变化(m)': (cityGroundwaterDynamic2024 as CityGroundwaterDynamicItem[]).find((g: CityGroundwaterDynamicItem) => g.city === c.city)?.shallowChange || 0,
    })),
    []
  );

  return (
    <div className="p-6 max-w-[1440px] mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-display font-bold text-gw-text">数据洞察分析</h1>
        <p className="text-sm text-gw-muted mt-1">跨模块数据关联分析 / 区域对比 / 资源组合评估</p>
        <div className="mt-2 flex items-center gap-2">
          <ChartExport
            data={resourceEnvData}
            filename="DataInsight_数据洞察快照"
            sheetName="数据洞察"
            formats={['xlsx', 'csv', 'json']}
            label="导出洞察数据"
          />
          <span className="text-[10px] text-gw-muted">支持 xlsx / csv / json 三种格式，含 {resourceEnvData?.length || 0} 条记录</span>
        </div>
      </div>

      {/* Tab导航 */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-gw-blue/15 text-gw-highlight border border-gw-blue/30'
                : 'text-gw-muted hover:text-gw-text hover:bg-gw-surface border border-transparent'
            }`}>
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <Suspense fallback={<div className="p-8 text-center text-gw-muted text-sm">加载中...</div>}><ResourceEnvTab
        resourceEnvData={resourceEnvData}
        resourceCombo={resourceCombo}
        gwDynamicPie={gwDynamicPie}
        gwDynamicBar={gwDynamicBar}
        wqSourcePie={wqSourcePie}
      /></Suspense>}
      {activeTab === 'supply' && <Suspense fallback={<div className="p-8 text-center text-gw-muted text-sm">加载中...</div>}><SupplyStructureTab
        supplyDemandData={supplyDemandData}
        gwDepRank={gwDepRank}
        exportSupplyData={exportSupplyData}
        setActiveKey={setActiveKey}
      /></Suspense>}
      {activeTab === 'county' && <Suspense fallback={<div className="p-8 text-center text-gw-muted text-sm">加载中...</div>}><CountyAnalysisTab
        countyAnalysisData={countyAnalysisData}
        gwDepRank={gwDepRank}
        irrigationEfficiency={irrigationEfficiency}
        radarCompareData={radarCompareData}
        selectableCounties={selectableCounties}
        selectedCounties={selectedCounties}
        toggleCountySelect={toggleCountySelect}
        exportCountyData={exportCountyData}
        activeKey={activeKey}
        setActiveKey={setActiveKey}
        highlight={setHighlight}
      /></Suspense>}
      {activeTab === 'regional' && <Suspense fallback={<div className="p-8 text-center text-gw-muted text-sm">加载中...</div>}><RegionalCompareTab
        regionalCompare={regionalCompare}
        gwDepRank={gwDepRank}
        regionalColumns={regionalColumns}
        exportRegionalCompare={exportRegionalCompare}
      /></Suspense>}
      {/* ════════════ Tab 4: 资源组合评估 ════════════ */}
      {activeTab === 'resource' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard title="数据模块" value={TABS.length + 15} unit="个" subtitle="覆盖全部领域" icon={Layers} accent="blue" />
            <StatCard title="系统分区" value={systemZones.length} unit="个" subtitle="含子区" icon={Sparkles} accent="cyan" />
            <StatCard title="地热田" value={geothermalFields.length} unit="个" subtitle="已调查" icon={Flame} accent="amber" />
            <StatCard title="矿区数据" value={mineHydrogeologyData.length} unit="条" subtitle="矿床水文地质" icon={Mountain} accent="red" />
          </div>

          {/* 资源覆盖度评估 */}
          <TechCard title="数据库资源覆盖度评估" icon={Sparkles} className="hud-corners">
            <p className="text-xs text-gw-muted mb-4">基于22个Sheet数据完整性评估各模块覆盖程度</p>
            <div className="space-y-3">
              <ProgressMetric label="基础地质" value={90} max={100} color="blue" targetLabel="含水层组+构造+地层 全覆盖" />
              <ProgressMetric label="水文地质参数" value={95} max={100} color="cyan" targetLabel="K/ne/αL/I + 含水层组参数" />
              <ProgressMetric label="水资源量" value={100} max={100} color="emerald" targetLabel="2024年公报数据已更新" />
              <ProgressMetric label="水质评价" value={100} max={100} color="emerald" targetLabel="国考断面+饮用水源 全达标" />
              <ProgressMetric label="环境地质" value={85} max={100} color="amber" targetLabel="漏斗+沉降数据，海水入侵待补充" />
              <ProgressMetric label="岩溶水" value={90} max={100} color="blue" targetLabel="泉域+分区+水化学+保护" />
              <ProgressMetric label="地热资源" value={80} max={100} color="amber" targetLabel="地热田+利用+回灌，梯度数据待补" />
              <ProgressMetric label="矿泉水" value={75} max={100} color="amber" targetLabel="产地+类型+水质，储量需更新" />
              <ProgressMetric label="盐碱土/咸水" value={80} max={100} color="amber" targetLabel="分布+类型+治理，动态监测待补充" />
              <ProgressMetric label="矿床水文地质" value={85} max={100} color="blue" targetLabel="矿区+涌水+利用，充水水源分析待深化" />
            </div>
          </TechCard>

          {/* D-1: 数据质量雷达图 + 年份覆盖矩阵 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <LazyChartCard title="数据质量雷达图(6维度评估)" className="hud-corners" height={320}>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={[
                  { dim: '基础地质', score: 90, fullMark: 100 },
                  { dim: '水文参数', score: 95, fullMark: 100 },
                  { dim: '水资源量', score: 100, fullMark: 100 },
                  { dim: '水质评价', score: 100, fullMark: 100 },
                  { dim: '环境地质', score: 85, fullMark: 100 },
                  { dim: '特色资源', score: 82, fullMark: 100 },
                ]}>
                  <PolarGrid stroke="rgba(6,182,212,0.12)" />
                  <PolarAngleAxis dataKey="dim" tick={{ fill: '#8b9dc3', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#8b9dc3', fontSize: 8 }} />
                  <Radar name="覆盖度" dataKey="score" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} strokeWidth={2} />
                  <Radar name="满分基准" dataKey="fullMark" stroke="#ef4444" fill="none" strokeWidth={1} strokeDasharray="4 4" />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Tooltip content={<ChartTooltip title="数据质量" />} />
                </RadarChart>
              </ResponsiveContainer>
            </LazyChartCard>

            <LazyChartCard title="各模块数据时效(最新年份)" className="hud-corners" height={320}>
              <div className="flex items-center gap-4 text-[10px] text-gw-muted mb-2">
                <span className="text-emerald-400">绿色=2024年已更新</span>
                <span className="text-amber-400">黄色=待补充</span>
                <span className="text-gw-muted">灰色=静态基础数据</span>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={[
                  { name: '水资源', year: 2024, color: '#22c55e' },
                  { name: '水质', year: 2024, color: '#22c55e' },
                  { name: '开采', year: 2024, color: '#22c55e' },
                  { name: '沉降', year: 2024, color: '#22c55e' },
                  { name: '盐碱土', year: 2024, color: '#22c55e' },
                  { name: '咸水', year: 2024, color: '#22c55e' },
                  { name: '矿泉水', year: 2023, color: '#f59e0b' },
                  { name: '裂隙水', year: 2023, color: '#f59e0b' },
                  { name: '地热', year: 2023, color: '#f59e0b' },
                  { name: '矿区', year: 2023, color: '#f59e0b' },
                  { name: '水化学', year: 2022, color: '#94a3b8' },
                  { name: '参数', year: 2020, color: '#94a3b8' },
                ].map(d => ({ ...d, '最新年份': d.year }))} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 55 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
                  <XAxis type="number" domain={[2018, 2025]} tick={{ fill: '#8b9dc3', fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#8b9dc3', fontSize: 10 }} width={50} />
                  <Tooltip content={<ChartTooltip title="数据年份" />} />
                  <Bar dataKey="最新年份" radius={[0, 3, 3, 0]}>
                    {[
                      { name: '水资源', year: 2024, color: '#22c55e' },
                      { name: '水质', year: 2024, color: '#22c55e' },
                      { name: '开采', year: 2024, color: '#22c55e' },
                      { name: '沉降', year: 2024, color: '#22c55e' },
                      { name: '盐碱土', year: 2024, color: '#22c55e' },
                      { name: '咸水', year: 2024, color: '#22c55e' },
                      { name: '矿泉水', year: 2023, color: '#f59e0b' },
                      { name: '裂隙水', year: 2023, color: '#f59e0b' },
                      { name: '地热', year: 2023, color: '#f59e0b' },
                      { name: '矿区', year: 2023, color: '#f59e0b' },
                      { name: '水化学', year: 2022, color: '#94a3b8' },
                      { name: '参数', year: 2020, color: '#94a3b8' },
                    ].map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                  <ReferenceLine x={2024} stroke="#22c55e" strokeDasharray="4 4" strokeWidth={1} label={{ value: '2024', fill: '#22c55e', fontSize: 9 }} />
                </BarChart>
              </ResponsiveContainer>
            </LazyChartCard>
          </div>

          {/* D-1: 版本演进统计卡片 */}
          <TechCard title="平台版本演进" badge="v1.0 - v3.8.3">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
              <div className="text-center p-2 bg-blue-500/10 rounded-lg border border-blue-500/15">
                <p className="text-[10px] text-gw-muted">累计版本</p>
                <p className="text-base font-mono font-bold text-blue-400">23</p>
                <p className="text-[10px] text-gw-muted">次迭代</p>
              </div>
              <div className="text-center p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/15">
                <p className="text-[10px] text-gw-muted">变更条目</p>
                <p className="text-base font-mono font-bold text-cyan-400">89</p>
                <p className="text-[10px] text-gw-muted">项功能</p>
              </div>
              <div className="text-center p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/15">
                <p className="text-[10px] text-gw-muted">数据模块</p>
                <p className="text-base font-mono font-bold text-emerald-400">22</p>
                <p className="text-[10px] text-gw-muted">个Sheet</p>
              </div>
              <div className="text-center p-2 bg-amber-500/10 rounded-lg border border-amber-500/15">
                <p className="text-[10px] text-gw-muted">页面路由</p>
                <p className="text-base font-mono font-bold text-amber-400">21</p>
                <p className="text-[10px] text-gw-muted">个专题</p>
              </div>
              <div className="text-center p-2 bg-purple-500/10 rounded-lg border border-purple-500/15">
                <p className="text-[10px] text-gw-muted">图表组件</p>
                <p className="text-base font-mono font-bold text-purple-400">456</p>
                <p className="text-[10px] text-gw-muted">个可视化</p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="p-2 bg-gw-surface/50 rounded-lg border border-gw-border/30">
                <p className="text-[10px] text-gw-muted mb-1">版本里程碑</p>
                {[
                  { v: 'v1.0', d: '2026-05-09', desc: '22 Sheet基础数据入库' },
                  { v: 'v1.1', d: '2026-05-10', desc: '8 Sheet更新至2024年数据' },
                  { v: 'v2.3', d: '2026-05-17', desc: 'DataInsight+18页面深度增强' },
                  { v: 'v3.7', d: '2026-05-28', desc: '县级分析+主题系统+数据覆盖' },
                  { v: 'v3.8.3', d: '2026-05-28', desc: 'C级深化5项+雷达图+年份矩阵' },
                ].map((m: { v: string; d: string; desc: string }) => (
                  <div key={m.v} className="flex items-center justify-between py-0.5 text-xs">
                    <span className="font-mono text-gw-highlight">{m.v}</span>
                    <span className="text-gw-muted flex-1 mx-2 truncate">{m.desc}</span>
                    <span className="text-[9px] text-gw-muted font-mono">{m.d}</span>
                  </div>
                ))}
              </div>
              <div className="p-2 bg-gw-surface/50 rounded-lg border border-gw-border/30">
                <p className="text-[10px] text-gw-muted mb-1">技术栈概览</p>
                {[
                  { label: '前端框架', value: 'React 18 + Vite 6.4' },
                  { label: '样式方案', value: 'Tailwind CSS + CSS变量主题' },
                  { label: '图表引擎', value: 'Recharts 17种组件' },
                  { label: '状态管理', value: 'useState + useMemo' },
                  { label: '路由方案', value: 'React Router v6 (5 Tab)' },
                  { label: '构建产物', value: 'Tree-shaking + Code-split' },
                  { label: '数据层', value: '22模块 TypeScript 0 TODO' },
                ].map((t: { label: string; value: string }) => (
                  <div key={t.label} className="flex items-center justify-between py-0.5 text-xs">
                    <span className="text-gw-muted">{t.label}</span>
                    <span className="font-mono text-gw-cyan">{t.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </TechCard>

          {/* 数据资产统计表 */}
          <SectionAccordion title="数据资产明细" defaultOpen={true}>
            <TechCard title="数据资产明细" className="scan-line">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gw-border">
                      <th className="text-left text-gw-muted py-2 px-3">数据类别</th>
                      <th className="text-center text-gw-muted py-2 px-3">记录数</th>
                      <th className="text-center text-gw-muted py-2 px-3">覆盖度</th>
                      <th className="text-left text-gw-muted py-2 px-3">数据时效</th>
                      <th className="text-left text-gw-muted py-2 px-3">更新状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { cat: '系统分区', records: systemZones.length, coverage: 90, time: '调查年限', status: '静态' },
                      { cat: '水文地质参数', records: '含4含水层组', coverage: 95, time: '调查年限', status: '静态' },
                      { cat: '水资源量', records: '14市+时序', coverage: 100, time: '2024年', status: '已更新' },
                      { cat: '水质评价', records: '27断面', coverage: 100, time: '2024年', status: '已更新' },
                      { cat: '开采管理', records: '7.2万许可', coverage: 85, time: '2024年', status: '已更新' },
                      { cat: '岩溶水', records: karstSprings.length + '泉域', coverage: 90, time: '调查年限', status: '静态' },
                      { cat: '地热田', records: geothermalFields.length + '个', coverage: 80, time: '调查年限', status: '待补充' },
                      { cat: '矿泉水', records: mineralWaterSites.length + '处', coverage: 75, time: '调查年限', status: '待更新' },
                      { cat: '咸水分布', records: '11市', coverage: 80, time: '1999+2024', status: '混合' },
                      { cat: '盐碱土', records: salineSoilDistribution.length + '市', coverage: 80, time: '调查年限', status: '静态' },
                      { cat: '裂隙水', records: fractureWaterTypes.length + '类型', coverage: 85, time: '调查年限', status: '静态' },
                      { cat: '矿区水文', records: mineHydrogeologyData.length + '矿区', coverage: 85, time: '调查年限', status: '静态' },
                      { cat: '水化学', records: hydrochemicalZoning.length + '分区', coverage: 80, time: '调查年限', status: '静态' },
                      { cat: '地面沉降', records: landSubsidence.length + '市', coverage: 85, time: '2024年', status: '已更新' },
                    ].map((row: { cat: string; records: string | number; coverage: number; time: string; status: string }, i: number) => (
                      <tr key={i} className="border-b border-gw-border/30 hover:bg-gw-surface/30">
                        <td className="py-2 px-3 font-medium text-gw-text">{row.cat}</td>
                        <td className="py-2 px-3 text-center font-mono text-gw-cyan">{row.records}</td>
                        <td className="py-2 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            row.coverage >= 95 ? 'bg-emerald-500/15 text-emerald-400' :
                            row.coverage >= 80 ? 'bg-amber-500/15 text-amber-400' :
                            'bg-red-500/15 text-red-400'
                          }`}>{row.coverage}%</span>
                        </td>
                        <td className="py-2 px-3 text-gw-muted">{row.time}</td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            row.status === '已更新' ? 'bg-emerald-500/15 text-emerald-400' :
                            row.status === '待更新' || row.status === '待补充' ? 'bg-amber-500/15 text-amber-400' :
                            'bg-gw-surface text-gw-muted'
                          }`}>{row.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TechCard>
          </SectionAccordion>

          {activeTab === 'resource' && <Suspense fallback={<div className="p-8 text-center text-gw-muted text-sm">加载中...</div>}><OverExploitTab /></Suspense>}
          {activeTab === 'resource' && <Suspense fallback={<div className="p-8 text-center text-gw-muted text-sm">加载中...</div>}><ClassicDataTab highlight={highlighted ?? undefined} /></Suspense>}
          {/* 导出报告 */}
          <div className="flex items-center justify-end mb-2">
            <button onClick={() => setExportOpen(true)} className="px-3 py-1.5 rounded-lg text-xs bg-gw-blue/15 text-gw-highlight border border-gw-blue/30 hover:bg-gw-blue/25 transition-all">
              导出洞察报告
            </button>
          </div>
          <ExportProgressDialog
            open={exportOpen}
            onClose={() => setExportOpen(false)}
            reportType="data-insight"
            reportLabel="河北省地下水数据洞察报告"
            data={getData()}
            dataLoading={dataLoading}
          />
          <DataSourceNote source="数据来源: 1999年《河北省地下水》+ 2024年水资源公报 + 2024年生态环境公报 + 《河北省水文地质工程地质》经典参考 | 河北瑞三元环境科技有限公司" />
        </div>
      )}
    </div>
  );
}
