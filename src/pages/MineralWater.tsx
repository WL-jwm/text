import { useTabTransition } from '../hooks/useTabTransition';
import React, { useMemo, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,  ResponsiveContainer,
  PieChart, Pie, Cell, Legend, ComposedChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';
import { Droplets, MapPin, Beaker, TrendingUp, Shield, CheckCircle, Database, Gauge, Compass, BookOpen } from 'lucide-react';
import { mineralWaterSites, mineralWaterTypes, mineralWaterStandards, mineralWaterIndustry } from '../data/mineralWater';
import { hotSpringData } from '../data/hydrogeologyReference';
import { SectionTitle, TechCard, StatCard, ChartTooltip, CHART_COLORS, DataSourceNote, ExportButton, TechTable } from '../components/UI';
import { exportDataCSV } from '../utils/exportUtils';
import { LazyChartCard } from '../components/LazyChartCard';
import { FilterableTechTable } from '../components/FilterableTechTable';
import { ChartExport } from '../components/ChartExport';

import { usePageCommons } from '../hooks/usePageCommons'
import { MineralWaterCalculatorTab } from '../components/mineral-water/MineralWaterCalculatorTab';
import { CrossLinkPanel } from '../components/CrossLink';
// 注册报告生成器
// ── Tab 定义 ──
const tabs = ['产地分布', '水质类型', '标准对比', '开发现状', '水质评价'];
const [SITES, TYPES, STANDARDS, DEVELOPMENT, CALCULATOR] = tabs;

export function MineralWater() {

  const { success, setExportOpen } = usePageCommons({
    pageName: 'mineral-water',
    collector: useCallback(async () => ({ mineralWaterSites }), []),
  });

  const [activeTab, setActiveTab] = useTabTransition(tabs[0]);

  // ── 导出 ──
  const handleExport = () => {
    exportDataCSV(mineralWaterSites.map(s => ({
      名称: s.name, 位置: s.location, 类型: s.type, 水温: s.temperature,
      日产量: s.dailyYield, 批准文号: s.approvalNo, 状态: s.status,
      矿化度: s.mineralization, SiO2: s.siO2, 锶: s.strontium, pH: s.ph
    })), '河北省矿泉水产地');
    success('矿泉水数据已导出');
  };

  // ── 统计 ──
  const producing = mineralWaterSites.filter(s => s.status === '生产中').length;
  const exploring = mineralWaterSites.filter(s => s.status === '勘查中').length;

  // ── 产地类型分布 ──
  const typePieData = useMemo(() =>
    mineralWaterTypes.map(t => ({ name: t.type, value: t.count })),
    []
  );

  // ── 矿化度对比 ──
  const _mineralBarData = useMemo(() =>
    mineralWaterSites.map(s => ({
      name: s.name.length > 6 ? s.name.substring(0, 6) : s.name,
      SiO2: parseFloat(s.siO2) || 0,
      锶: parseFloat(s.strontium) * 50 || 0,
      矿化度: parseFloat(s.mineralization) * 10 || 0,
    })),
    []
  );

  // ── 各类型特征雷达 ──
  const typeRadarData = useMemo(() => [
    {
      type: '偏硅酸型',
      达标率: 100,
      代表产地数: 8,
      平均SiO2: 38,
      矿化度均值: 65,
    },
    {
      type: '复合型',
      达标率: 100,
      代表产地数: 4,
      平均SiO2: 39,
      矿化度均值: 79,
    },
    {
      type: '锶型',
      达标率: 100,
      代表产地数: 2,
      平均SiO2: 25,
      矿化度均值: 76,
    },
  ], []);

  // 报告数据预采集（增量缓存）
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionTitle icon={Droplets}>矿泉水</SectionTitle>
        <button onClick={() => setExportOpen(true)}
          className="text-xs bg-emerald-600/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600/25 px-2.5 py-1 rounded transition-colors">
          导出报告
        </button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="矿泉水产地" value={mineralWaterSites.length} unit="处" icon={MapPin} accent="blue" />
        <StatCard title="生产中" value={producing} unit="处" icon={CheckCircle} accent="green" />
        <StatCard title="勘查中" value={exploring} unit="处" icon={Gauge} accent="amber" />
        <StatCard title="年产量" value="~85万" unit="m³" icon={TrendingUp} accent="cyan" />
      </div>

      {/* Tab */}
      <div className="flex gap-1 p-1 bg-gw-surface/50 rounded-lg overflow-x-auto scrollbar-none">
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${activeTab === t ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30' : 'text-gw-muted hover:text-gw-text hover:bg-gw-surface/80'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* ====== 产地分布 ====== */}
      {activeTab === SITES && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <LazyChartCard title="产地类型分布" icon={Compass} height={280}>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={typePieData} cx="50%" cy="50%" outerRadius={90} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} stroke="none">
                    {typePieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </LazyChartCard>

            <TechCard title="产地一览" icon={Database}>
              <div className="mb-3 flex justify-end">
                <ChartExport data={mineralWaterSites} filename="mineral-water-sites" sheetName="矿泉水产地" formats={['xlsx','csv','json']} label="导出数据" />
              </div>
              <FilterableTechTable
                  headers={['名称', '位置', '类型', '水温', '日产量(m³/d)', '状态']}
                rows={mineralWaterSites.map(s => [s.name, s.location, s.type, s.temperature, s.dailyYield, s.status])}
                pageSize={10}
              
                              filterPlaceholder="搜索..."
              />
            </TechCard>
          </div>

          <LazyChartCard title="各产地指标对比" icon={Beaker} height={280}>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={mineralWaterSites.map(s => ({
                name: s.name.length > 5 ? s.name.substring(0, 5) : s.name,
                SiO2: parseFloat(s.siO2) || 0,
                锶mgL: parseFloat(s.strontium) || 0,
                pH: parseFloat(s.ph) || 7,
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gw-border, #1a2d4d)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 9 }} />
                <YAxis tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 10 }} />
                <ChartTooltip />
                <Bar dataKey="SiO2" fill="var(--gw-cyan, #06b6d4)" name="SiO₂(mg/L)" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="锶mgL" stroke="var(--gw-amber, #f59e0b)" name="锶(mg/L)" strokeWidth={2} dot={{ r: 3 }} />
                <Legend wrapperStyle={{ fontSize: 10, color: 'var(--gw-muted, #64748b)' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </LazyChartCard>

          <div className="flex items-center gap-2">
            <ExportButton onClick={handleExport} label="导出矿泉水数据" />
          </div>
        </div>
      )}

      {/* ====== 水质类型 ====== */}
      {activeTab === TYPES && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <LazyChartCard title="各类型特征对比" icon={Gauge} height={280}>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={typeRadarData}>
                  <PolarGrid stroke="var(--gw-border, #1a2d4d)" />
                  <PolarAngleAxis dataKey="type" tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 10 }} />
                  <PolarRadiusAxis tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 9 }} />
                  <Radar name="达标率" dataKey="达标率" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
                  <Radar name="代表产地数" dataKey="代表产地数" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} />
                  <Legend wrapperStyle={{ fontSize: 10, color: 'var(--gw-muted, #64748b)' }} />
                  <ChartTooltip />
                </RadarChart>
              </ResponsiveContainer>
            </LazyChartCard>

            <TechCard title="类型特征详情" icon={Beaker}>
              <TechTable
                title={`${mineralWaterTypes.length} 种类型`}
                headers={['类型', '产地数', '占比', '达标限值', '特征']}
                rows={mineralWaterTypes.map(t => [t.type, String(t.count), t.proportion, t.threshold, t.features])}
              />
            </TechCard>

            <LazyChartCard title="矿化度-SiO₂关系" icon={Compass} height={280}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={mineralWaterSites.map(s => ({
                  name: s.name.length > 5 ? s.name.substring(0, 5) : s.name,
                  矿化度: parseFloat(s.mineralization) || 0,
                  SiO2: parseFloat(s.siO2) || 0,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--gw-border, #1a2d4d)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 9 }} />
                  <YAxis tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 10 }} />
                  <ChartTooltip unit="mg/L" />
                  <Bar dataKey="矿化度" fill="var(--gw-cyan, #06b6d4)" name="矿化度(g/L)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="SiO2" fill="var(--gw-green, #10b981)" name="SiO₂(mg/L)" radius={[4, 4, 0, 0]} />
                  <Legend wrapperStyle={{ fontSize: 10, color: 'var(--gw-muted, #64748b)' }} />
                </BarChart>
              </ResponsiveContainer>
            </LazyChartCard>

            <LazyChartCard title="各产地锶含量" icon={Beaker} height={280}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={mineralWaterSites.filter(s => parseFloat(s.strontium) > 0).map(s => ({
                  name: s.name.length > 6 ? s.name.substring(0, 6) : s.name,
                  锶: parseFloat(s.strontium) || 0,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--gw-border, #1a2d4d)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 9 }} />
                  <YAxis tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 10 }} />
                  <ChartTooltip unit="mg/L" />
                  <Bar dataKey="锶" fill="var(--gw-amber, #f59e0b)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </LazyChartCard>
          </div>      <CrossLinkPanel currentPath="/mineral-water" />
      <DataSourceNote source="GB 8537-2018 + 2024年监测数据" version="矿泉水水质" />
        </div>
      )}

      {/* ====== 标准对比 ====== */}
      {activeTab === STANDARDS && (
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-gw-blue/10 border border-gw-blue/20">
            <p className="text-xs text-gw-text font-medium">{mineralWaterStandards.nationalStandard}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TechCard title="界限指标" icon={Shield}>
              <TechTable
                headers={['指标', '限值', '单位', '备注']}
                rows={mineralWaterStandards.limits.map(l => [l.indicator, l.threshold, l.unit, l.note])}
              />
            </TechCard>

            <TechCard title="感官要求" icon={Beaker}>
              <TechTable
                headers={['指标', '限值', '备注']}
                rows={mineralWaterStandards.sensoryLimits.map(l => [l.indicator, l.limit, l.note])}
              />
            </TechCard>

            <TechCard title="污染物限量" icon={Gauge} className="lg:col-span-2">
              <TechTable
                headers={['指标', '限值']}
                rows={mineralWaterStandards.contaminantLimits.map(l => [l.indicator, l.limit])}
              />
            </TechCard>
          </div>      <CrossLinkPanel currentPath="/mineral-water" />
      <DataSourceNote source="GB 8537-2018 饮用天然矿泉水" version="国标限值" />
        </div>
      )}

      {/* ====== 开发现状 ====== */}
      {activeTab === DEVELOPMENT && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard title="总许可证" value={mineralWaterIndustry.totalPermits} unit="个" icon={Database} accent="blue" />
            <StatCard title="生产中" value={mineralWaterIndustry.producing} unit="个" icon={CheckCircle} accent="green" />
            <StatCard title="勘查中" value={mineralWaterIndustry.exploring} unit="个" icon={Gauge} accent="amber" />
            <StatCard title="年产值" value={mineralWaterIndustry.annualRevenue} icon={TrendingUp} accent="cyan" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TechCard title="产业概况" icon={Compass}>
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-gw-muted">年产量</span>
                  <span className="text-gw-text">{mineralWaterIndustry.annualOutput}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gw-muted">市场份额</span>
                  <span className="text-gw-text">{mineralWaterIndustry.marketShare}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gw-muted">年均增长率</span>
                  <span className="text-gw-text">{mineralWaterIndustry.growthRate}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gw-muted">主要消费区</span>
                  <span className="text-gw-text">{mineralWaterIndustry.mainConsumption}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gw-muted">主要品牌</span>
                  <span className="text-gw-text text-[10px]">{mineralWaterIndustry.mainBrands}</span>
                </div>
              </div>
            </TechCard>

            <LazyChartCard title="产地状态分布" icon={MapPin} height={280}>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={[
                    { name: '生产中', value: mineralWaterIndustry.producing },
                    { name: '勘查中', value: mineralWaterIndustry.exploring },
                  ]} cx="50%" cy="50%" outerRadius={90} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} stroke="none">
                    <Cell fill="#10b981" />
                    <Cell fill="#f59e0b" />
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </LazyChartCard>
          </div>      <CrossLinkPanel currentPath="/mineral-water" />
      <DataSourceNote source="2024年河北省矿泉水产业发展报告" version="产业概况" />
        </div>
      )}

      {activeTab === CALCULATOR && <MineralWaterCalculatorTab />}

      <SectionTitle icon={BookOpen} badge="经典参考">天然热泉与矿泉资源</SectionTitle>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="热泉点" value={String(hotSpringData.summary.totalPoints)} unit="处" icon={BookOpen} accent="blue" />
        <StatCard title="≥37°C" value={String(hotSpringData.summary.above37C)} unit="处" icon={TrendingUp} accent="cyan" />
        <StatCard title="≥42°C" value={String(hotSpringData.summary.above42C)} unit="处" icon={Gauge} accent="green" />
        <StatCard title="最高温度" value={String(hotSpringData.summary.maxTemp)} unit="°C" icon={Compass} accent="amber" subtitle={hotSpringData.summary.maxLocation} />
      </div>

      <TechCard title={`天然热泉调查（${hotSpringData.summary.totalPoints}处）`} icon={BookOpen}>
        <p className="text-[10px] text-gw-muted mb-3">
          数据来源：《河北省水文地质工程地质》（1980年代前调查），水温单位°C，流量单位m³/h
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {hotSpringData.hotSprings.map((hs, i) => (
            <div key={i} className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gw-text">{hs.name}</span>
                <span className="text-xs font-mono text-gw-highlight">
                  {hs.temp ? `${hs.temp}°C` : '-'} / {hs.flow} m³/h
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-gw-muted">{hs.location}</span>
                {hs.type && <span className="text-gw-cyan">{hs.type}</span>}
              </div>
            </div>
          ))}
        </div>
      </TechCard>

      <TechCard title="水化学类型与流量特征" icon={Beaker}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 bg-gw-surface/50 rounded-lg">
            <p className="text-[10px] text-gw-muted mb-1">主要水化学类型</p>
            <p className="text-xs text-gw-text">{hotSpringData.summary.hydrochemType}</p>
          </div>
          <div className="p-3 bg-gw-surface/50 rounded-lg">
            <p className="text-[10px] text-gw-muted mb-1">常见流量范围</p>
            <p className="text-xs text-gw-text">{hotSpringData.summary.commonFlow}</p>
          </div>
        </div>
      </TechCard>
    </div>
  );
}
