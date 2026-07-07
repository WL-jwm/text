import React, { useState, useMemo, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area,
} from 'recharts';
import {
  AlertTriangle, MapPin, TrendingUp,  Layers,  Ban,  CheckCircle2, 
} from 'lucide-react';
import {
  overdraftOverview, cityOverdraftZones, restrictedZones,
  waterLevelRecovery, groundwaterFunctionZones, overdraftControlResults,
} from '../data/groundwaterFunction';
import { SectionTitle, TechCard, StatCard, ChartTooltip, DataSourceNote } from '../components/UI';
import { LazyChartCard } from '../components/LazyChartCard';
import { ChartExport } from '../components/ChartExport';
import { usePageCommons } from '../hooks/usePageCommons'
import { ExportProgressDialog } from '../components/ExportProgressDialog';
import { CrossLinkPanel } from '../components/CrossLink';
// 注册报告生成器
const TABS = [
  { key: 'overview', label: '超采总览', icon: AlertTriangle },
  { key: 'city', label: '各市分布', icon: MapPin },
  { key: 'zones', label: '功能区划', icon: Layers },
  { key: 'recovery', label: '水位回升', icon: TrendingUp },
  { key: 'restricted', label: '禁采/限采', icon: Ban },
] as const;
type TabKey = typeof TABS[number]['key'];

export function GroundwaterFunction() {

  const { setExportOpen, exportOpen, getData, dataLoading } = usePageCommons({
    pageName: 'groundwater-function',
    collector: useCallback(async () => ({
      overdraftOverview,
      cityOverdraftZones,
      restrictedZones,
      waterLevelRecovery,
      groundwaterFunctionZones,
      overdraftControlResults,
    }), []),
  });

  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  // ── 衍生数据 ──
  const shallowCities = cityOverdraftZones.filter(c => c.shallowType !== '—');
  const deepCities = cityOverdraftZones.filter(c => c.deepType !== '—');
  const severeDeepCities = cityOverdraftZones.filter(c => c.deepType === '严重超采区');

  const typePieData = useMemo(() => [
    { name: '浅层超采区', value: overdraftOverview.shallowOverdraft, color: '#f59e0b' },
    { name: '深层超采区', value: overdraftOverview.deepOverdraft, color: '#ef4444' },
    { name: '重叠面积', value: overdraftOverview.overlapArea, color: '#8b5cf6' },
  ], []);

  const recoveryChartData = useMemo(() =>
    waterLevelRecovery.annualData.map(d => ({
      year: String(d.year),
      shallowDepth: d.shallowDepth,
      deepDepth: d.deepDepth,
      shallowRise: d.shallowRise,
      deepRise: d.deepRise,
    })),
    []
  );

  const cityTypeData = useMemo(() =>
    cityOverdraftZones.map(c => ({
      name: c.city,
      shallow: c.shallowType !== '—' ? 1 : 0,
      deep: c.deepType !== '—' ? 1 : 0,
      severeDeep: c.deepType === '严重超采区' ? 1 : 0,
    })),
    []
  );

  const funcZoneRadar = useMemo(() =>
    groundwaterFunctionZones.map(z => ({
      name: z.zone,
      value: 100,
    })),
    []
  );

  // ── 导出数据 ──
  const cityExportData = useMemo(() =>
    cityOverdraftZones.map(c => ({
      城市: c.city,
      浅层超采类型: c.shallowType,
      浅层超采范围: c.shallowArea,
      深层超采类型: c.deepType,
      深层超采范围: c.deepArea,
      备注: c.note,
    })),
    []
  );

  const recoveryExportData = useMemo(() =>
    waterLevelRecovery.annualData.map(d => ({
      年份: d.year,
      浅层埋深_m: d.shallowDepth,
      深层埋深_m: d.deepDepth,
      浅层回升_m: d.shallowRise,
      深层回升_m: d.deepRise,
      备注: d.note,
    })),
    []
  );

  // 报告数据预采集

  return (
    <div className="p-3 md:p-6 max-w-[1440px] mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <SectionTitle icon={AlertTriangle}>地下水超采区划与功能区</SectionTitle>
          <p className="text-xs text-gw-muted mt-1">超采区分布 · 功能区划 · 水位回升 · 禁采/限采区</p>
        </div>
        <button onClick={() => setExportOpen(true)}
          className="px-3 py-1.5 rounded-lg text-xs bg-gw-blue/15 text-gw-highlight border border-gw-blue/30 hover:bg-gw-blue/25 transition-all">
          导出报告
        </button>
      </div>

      {/* 关键指标 */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3">
        <StatCard title="超采区总面积" value={String(overdraftOverview.totalArea.toLocaleString())} unit="km²" icon={AlertTriangle} accent="red" />
        <StatCard title="浅层超采" value={String(overdraftOverview.shallowOverdraft.toLocaleString())} unit="km²" icon={MapPin} accent="amber" />
        <StatCard title="深层超采" value={String(overdraftOverview.deepOverdraft.toLocaleString())} unit="km²" icon={MapPin} accent="orange" />
        <StatCard title="浅层水位回升" value={String(waterLevelRecovery.shallowRecovery)} unit="m(2019-2023)" icon={TrendingUp} accent="green" />
        <StatCard title="深层水位回升" value={String(waterLevelRecovery.deepRecovery)} unit="m(2019-2023)" icon={TrendingUp} accent="emerald" />
        <StatCard title="水位回升县" value={String(overdraftControlResults.shallowRiseCounties)} unit="浅层" icon={CheckCircle2} accent="cyan" />
      </div>

      {/* Tab 切换 */}
      <div className="flex gap-1 bg-gw-surface rounded-lg p-1 overflow-x-auto scrollbar-none">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30'
                : 'text-gw-muted hover:text-gw-text'
            }`}>
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════ 超采总览 ═══════════════════ */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <LazyChartCard title="超采区面积构成" className="scan-line" height={300}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={typePieData} cx="50%" cy="50%" innerRadius={50} outerRadius={100}
                    dataKey="value" label={({ name, value }) => `${name} ${value.toLocaleString()}km²`}>
                    {typePieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip unit="km²" title="超采面积" />} />
                </PieChart>
              </ResponsiveContainer>
            </LazyChartCard>
            <TechCard title="超采区概况" badge="2022年公布">
              <div className="space-y-3">
                <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
                  <p className="text-xs text-gw-muted">
                    依据河北省人民政府《关于公布地下水超采区和禁止开采区、限制开采区范围的通知》(2022)，全省超采区总面积
                    <span className="text-gw-highlight font-bold"> {overdraftOverview.totalArea.toLocaleString()} km²</span>。
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-amber-500/5 rounded-lg border border-amber-500/20">
                    <p className="text-[10px] text-gw-muted">浅层超采面积</p>
                    <p className="text-lg font-bold text-amber-400">{overdraftOverview.shallowOverdraft.toLocaleString()}</p>
                    <p className="text-[9px] text-gw-muted">km²</p>
                  </div>
                  <div className="p-2.5 bg-red-500/5 rounded-lg border border-red-500/20">
                    <p className="text-[10px] text-gw-muted">深层超采面积</p>
                    <p className="text-lg font-bold text-red-400">{overdraftOverview.deepOverdraft.toLocaleString()}</p>
                    <p className="text-[9px] text-gw-muted">km²</p>
                  </div>
                </div>
                <div className="p-2.5 bg-purple-500/5 rounded-lg border border-purple-500/20">
                  <p className="text-[10px] text-gw-muted">浅层与深层重叠面积</p>
                  <p className="text-lg font-bold text-purple-400">{overdraftOverview.overlapArea.toLocaleString()} km²</p>
                </div>
                <p className="text-[9px] text-gw-muted/60">数据来源：{overdraftOverview.source} | 更新日期：{overdraftOverview.updateDate}</p>
              </div>
            </TechCard>
          </div>

          <TechCard title="各市超采类型统计">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <LazyChartCard title="各市超采类型分布" height={280}>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={cityTypeData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
                    <XAxis type="number" stroke="#64748b" fontSize={10} />
                    <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} width={50} />
                    <Tooltip content={<ChartTooltip title="超采类型" />} />
                    <Bar dataKey="shallow" name="浅层超采" fill="#f59e0b" stackId="a" radius={[0, 2, 2, 0]} />
                    <Bar dataKey="deep" name="深层超采" fill="#3b82f6" stackId="a" />
                    <Bar dataKey="severeDeep" name="严重超采" fill="#ef4444" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </LazyChartCard>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-gw-surface/30 rounded-lg">
                  <span className="text-xs text-gw-text">有浅层超采的市</span>
                  <span className="text-lg font-bold text-amber-400">{shallowCities.length}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gw-surface/30 rounded-lg">
                  <span className="text-xs text-gw-text">有深层超采的市</span>
                  <span className="text-lg font-bold text-blue-400">{deepCities.length}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gw-surface/30 rounded-lg">
                  <span className="text-xs text-gw-text">深层严重超采的市</span>
                  <span className="text-lg font-bold text-red-400">{severeDeepCities.length}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gw-surface/30 rounded-lg">
                  <span className="text-xs text-gw-text">超采治理成效</span>
                  <span className="text-sm font-bold text-emerald-400">深层水位回升{waterLevelRecovery.deepRecovery}m</span>
                </div>
              </div>
            </div>
          </TechCard>
        </div>
      )}

      {/* ═══════════════════ 各市分布 ═══════════════════ */}
      {activeTab === 'city' && (
        <div className="space-y-4">
          <TechCard title="各市超采区类型与分布" badge="2022年公布">
            <div className="mb-3 flex justify-end">
              <ChartExport data={cityExportData} filename="各市超采区分布" sheetName="超采区" formats={['xlsx','csv','json']} label="导出数据" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-gw-border">
                  <th className="text-left text-gw-muted py-2 px-2">城市</th>
                  <th className="text-gw-muted py-2 px-2">浅层超采</th>
                  <th className="text-gw-muted py-2 px-2">深层超采</th>
                  <th className="text-left text-gw-muted py-2 px-2">备注</th>
                </tr></thead>
                <tbody>
                  {cityOverdraftZones.map((c, i) => (
                    <tr key={i} className="border-b border-gw-border/30 data-row">
                      <td className="py-2 px-2 font-medium text-gw-text">{c.city}</td>
                      <td className="py-2 px-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                          c.shallowType === '—' ? 'text-gw-muted/40' : 'bg-amber-500/15 text-amber-400'
                        }`}>{c.shallowType || '—'}</span>
                      </td>
                      <td className="py-2 px-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                          c.deepType === '—' ? 'text-gw-muted/40' :
                          c.deepType === '严重超采区' ? 'bg-red-500/15 text-red-400' : 'bg-blue-500/15 text-blue-400'
                        }`}>{c.deepType || '—'}</span>
                      </td>
                      <td className="py-2 px-2 text-gw-muted text-[10px]">{c.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TechCard>

          <TechCard title="浅层超采区范围明细">
            <div className="overflow-x-auto max-h-[300px] overflow-y-auto scrollbar-thin">
              <table className="w-full text-[10px]">
                <thead className="sticky top-0 bg-gw-card"><tr className="border-b border-gw-border">
                  <th className="text-left text-gw-muted py-1.5 px-2">城市</th>
                  <th className="text-left text-gw-muted py-1.5 px-2">浅层超采范围</th>
                </tr></thead>
                <tbody>
                  {cityOverdraftZones.filter(c => c.shallowType !== '—').map((c, i) => (
                    <tr key={i} className="border-b border-gw-border/20">
                      <td className="py-1.5 px-2 font-medium text-gw-text">{c.city}</td>
                      <td className="py-1.5 px-2 text-gw-muted">{c.shallowArea}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TechCard>

          <TechCard title="深层超采区范围明细">
            <div className="overflow-x-auto max-h-[300px] overflow-y-auto scrollbar-thin">
              <table className="w-full text-[10px]">
                <thead className="sticky top-0 bg-gw-card"><tr className="border-b border-gw-border">
                  <th className="text-left text-gw-muted py-1.5 px-2">城市</th>
                  <th className="text-left text-gw-muted py-1.5 px-2">深层超采范围</th>
                  <th className="text-gw-muted py-1.5 px-2">类型</th>
                </tr></thead>
                <tbody>
                  {cityOverdraftZones.filter(c => c.deepType !== '—').map((c, i) => (
                    <tr key={i} className="border-b border-gw-border/20">
                      <td className="py-1.5 px-2 font-medium text-gw-text">{c.city}</td>
                      <td className="py-1.5 px-2 text-gw-muted">{c.deepArea}</td>
                      <td className="py-1.5 px-2">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                          c.deepType === '严重超采区' ? 'bg-red-500/15 text-red-400' : 'bg-blue-500/15 text-blue-400'
                        }`}>{c.deepType}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TechCard>
        </div>
      )}

      {/* ═══════════════════ 功能区划 ═══════════════════ */}
      {activeTab === 'zones' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TechCard title="地下水功能区划" badge="四区管理">
              <div className="space-y-3">
                {groundwaterFunctionZones.map((z, i) => (
                  <div key={i} className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gw-text">
                        {z.zone}（{z.code}）
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-gw-blue/10 text-gw-cyan">{z.protectionTarget}</span>
                    </div>
                    <p className="text-[10px] text-gw-muted">{z.description}</p>
                    <p className="text-[9px] text-gw-highlight mt-1">典型区域：{z.typicalArea}</p>
                  </div>
                ))}
              </div>
            </TechCard>
            <LazyChartCard title="功能区保护目标雷达" className="scan-line" height={320}>
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={funcZoneRadar}>
                  <PolarGrid stroke="#1a2d4d" />
                  <PolarAngleAxis dataKey="name" stroke="#64748b" fontSize={10} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#64748b" fontSize={9} />
                  <Radar name="功能区" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </LazyChartCard>
          </div>

          <TechCard title="功能分区管理原则">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {groundwaterFunctionZones.map((z, i) => (
                <div key={i} className="p-3 rounded-lg border border-gw-border/30 bg-gw-surface/30">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      i === 0 ? 'bg-emerald-500/15 text-emerald-400' :
                      i === 1 ? 'bg-blue-500/15 text-blue-400' :
                      i === 2 ? 'bg-amber-500/15 text-amber-400' :
                      'bg-red-500/15 text-red-400'
                    }`}>{z.code}</span>
                    <span className="text-xs font-semibold text-gw-text">{z.zone}</span>
                  </div>
                  <p className="text-[10px] text-gw-muted">{z.description}</p>
                </div>
              ))}
            </div>
          </TechCard>
        </div>
      )}

      {/* ═══════════════════ 水位回升 ═══════════════════ */}
      {activeTab === 'recovery' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <LazyChartCard title="浅层与深层水位埋深变化（2019-2023）" className="scan-line" height={300}>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={recoveryChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
                  <XAxis dataKey="year" stroke="#64748b" fontSize={10} />
                  <YAxis yAxisId="left" stroke="#64748b" fontSize={10} label={{ value: '埋深(m)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
                  <Tooltip content={<ChartTooltip unit="m" title="水位埋深" />} />
                  <Area yAxisId="left" type="monotone" dataKey="shallowDepth" name="浅层埋深" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} strokeWidth={2} />
                  <Area yAxisId="left" type="monotone" dataKey="deepDepth" name="深层埋深" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </LazyChartCard>
            <LazyChartCard title="水位累计回升量（2019-2023）" className="scan-line" height={300}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={recoveryChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
                  <XAxis dataKey="year" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} label={{ value: '回升(m)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
                  <Tooltip content={<ChartTooltip unit="m" title="回升量" />} />
                  <Bar dataKey="shallowRise" name="浅层回升" fill="#10b981" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="deepRise" name="深层回升" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </LazyChartCard>
          </div>

          <TechCard title="水位回升动态数据" badge="2019-2023">
            <div className="mb-3 flex justify-end">
              <ChartExport data={recoveryExportData} filename="水位回升动态" sheetName="水位回升" formats={['xlsx','csv','json']} label="导出数据" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-gw-border">
                  <th className="text-left text-gw-muted py-2 px-2">年份</th>
                  <th className="text-gw-muted py-2 px-2">浅层埋深(m)</th>
                  <th className="text-gw-muted py-2 px-2">深层埋深(m)</th>
                  <th className="text-gw-muted py-2 px-2">浅层回升(m)</th>
                  <th className="text-gw-muted py-2 px-2">深层回升(m)</th>
                  <th className="text-left text-gw-muted py-2 px-2">备注</th>
                </tr></thead>
                <tbody>
                  {waterLevelRecovery.annualData.map((d, i) => (
                    <tr key={i} className="border-b border-gw-border/30 data-row">
                      <td className="py-2 px-2 font-mono text-gw-text">{d.year}</td>
                      <td className="py-2 px-2 font-mono">{d.shallowDepth}</td>
                      <td className="py-2 px-2 font-mono">{d.deepDepth}</td>
                      <td className={`py-2 px-2 font-mono ${d.shallowRise > 0 ? 'text-emerald-400' : ''}`}>
                        {d.shallowRise > 0 ? `+${d.shallowRise}` : '-'}
                      </td>
                      <td className={`py-2 px-2 font-mono ${d.deepRise > 0 ? 'text-emerald-400' : ''}`}>
                        {d.deepRise > 0 ? `+${d.deepRise}` : '-'}
                      </td>
                      <td className="py-2 px-2 text-gw-muted text-[10px]">{d.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[9px] text-gw-muted/60 mt-2">数据来源：{waterLevelRecovery.dataSource}</p>
          </TechCard>

          <TechCard title="超采治理成效">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30 text-center">
                <p className="text-[10px] text-gw-muted">浅层水位回升县</p>
                <p className="text-2xl font-bold text-emerald-400">{overdraftControlResults.shallowRiseCounties}</p>
                <p className="text-[9px] text-gw-muted">占{overdraftControlResults.shallowRisePercent}%</p>
              </div>
              <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30 text-center">
                <p className="text-[10px] text-gw-muted">深层水位回升县</p>
                <p className="text-2xl font-bold text-blue-400">{overdraftControlResults.deepRiseCounties}</p>
                <p className="text-[9px] text-gw-muted">占{overdraftControlResults.deepRisePercent}%</p>
              </div>
              <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30 text-center">
                <p className="text-[10px] text-gw-muted">浅层基准埋深</p>
                <p className="text-2xl font-bold text-amber-400">{overdraftControlResults.shallowBaseDepth}</p>
                <p className="text-[9px] text-gw-muted">m</p>
              </div>
              <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30 text-center">
                <p className="text-[10px] text-gw-muted">深层基准埋深</p>
                <p className="text-2xl font-bold text-red-400">{overdraftControlResults.deepBaseDepth}</p>
                <p className="text-[9px] text-gw-muted">m</p>
              </div>
            </div>
            <p className="text-[9px] text-gw-muted/60 mt-2">数据来源：{overdraftControlResults.source}</p>
          </TechCard>
        </div>
      )}

      {/* ═══════════════════ 禁采/限采 ═══════════════════ */}
      {activeTab === 'restricted' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TechCard title="禁止开采区" badge={`${restrictedZones.forbidden.length}区`}>
              <div className="space-y-2">
                {restrictedZones.forbidden.map((z, i) => (
                  <div key={i} className="p-3 bg-red-500/5 rounded-lg border border-red-500/20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gw-text">{z.city}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">{z.status}</span>
                    </div>
                    <p className="text-[10px] text-gw-muted">{z.scope}</p>
                    <p className="text-[9px] text-gw-muted/70 mt-0.5">{z.reason}</p>
                  </div>
                ))}
              </div>
            </TechCard>
            <TechCard title="限制开采区" badge={`${restrictedZones.limited.length}区`}>
              <div className="space-y-2">
                {restrictedZones.limited.map((z, i) => (
                  <div key={i} className="p-3 bg-amber-500/5 rounded-lg border border-amber-500/20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gw-text">{z.city}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">{z.status}</span>
                    </div>
                    <p className="text-[10px] text-gw-muted">{z.scope}</p>
                    <p className="text-[9px] text-gw-muted/70 mt-0.5">{z.reason}</p>
                  </div>
                ))}
              </div>
            </TechCard>
          </div>

          <TechCard title="禁采/限采区管理政策" badge="政策依据">
            <div className="space-y-2">
              <p className="text-xs text-gw-muted">
                <span className="text-gw-text font-semibold">禁止开采区：</span>在禁止开采区内，除应急供水外严禁开凿新井，
                已有的取水许可证到期后不再延续。沧州、衡水、廊坊三市深层承压水已全域划入禁采区。
              </p>
              <p className="text-xs text-gw-muted">
                <span className="text-gw-text font-semibold">限制开采区：</span>在限制开采区内，严格控制新增取水许可，
                逐步压减现有开采量。石家庄、邢台、邯郸等市浅层地下水超采区已实施限采管理。
              </p>
              <p className="text-xs text-gw-muted">
                <span className="text-gw-text font-semibold">水源替代：</span>禁采区和限采区的水源替代主要依靠南水北调中线工程、
                引黄入冀补淀工程和当地地表水联合调度。2024年全省地下水供水量已压减至94.5亿m³。
              </p>
            </div>
          </TechCard>
        </div>
      )}

      <ExportProgressDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        reportType="groundwater-function"
        reportLabel="河北省地下水超采区划报告"
        data={getData()}
        dataLoading={dataLoading}
      />      <CrossLinkPanel currentPath="/groundwater-function" />
      <DataSourceNote source="河北省人民政府《关于公布地下水超采区和禁止开采区、限制开采区范围的通知》(2022) | 河北省水利厅超采区监测通报(2020-2024) | 河北省地下水功能区划报告" />
    </div>
  );
}
