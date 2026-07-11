import React, { useState, useMemo, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, 
} from 'recharts';
import {
  Scale, BarChart3, MapPin, AlertTriangle, Droplets, 
  TrendingDown, TrendingUp, MinusCircle, 
} from 'lucide-react';
import {
  plainWaterBalance, cityWaterBalance,
  cityGroundwaterExtraction2000, shallowWaterQualityByClass,
  hydrogeologicalParams, cityExploitationPotential,
  potentialZoneSummary, cityGroundwaterPollution,
  pollutantDetectionRates, wastewaterDischarge1999,
} from '../data/groundwaterResources';
import { SectionTitle, TechCard, StatCard, ChartTooltip, DataSourceNote } from '../components/UI';
import { LazyChartCard } from '../components/LazyChartCard';
import { usePageCommons } from '../hooks/usePageCommons'
import { ExportProgressDialog } from '../components/ExportProgressDialog';
import { CrossLinkPanel } from '../components/CrossLink';
// 注册报告生成器
type TabKey = 'overview' | 'city' | 'potential' | 'quality' | 'pollution';
const TABS: { key: TabKey; label: string; icon }[] = [
  { key: 'overview', label: '均衡总览', icon: Scale },
  { key: 'city', label: '各市均衡', icon: MapPin },
  { key: 'potential', label: '开采潜力', icon: BarChart3 },
  { key: 'quality', label: '水质评价', icon: Droplets },
  { key: 'pollution', label: '污染评价', icon: AlertTriangle },
];

const BALANCE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export function GroundwaterBalance() {

  const { setExportOpen, exportOpen, getData, dataLoading } = usePageCommons({
    pageName: 'groundwater-balance',
    collector: useCallback(async () => ({
      plainWaterBalance,
      cityWaterBalance,
      cityGroundwaterExtraction2000,
      shallowWaterQualityByClass,
      hydrogeologicalParams,
      cityExploitationPotential,
      potentialZoneSummary,
      cityGroundwaterPollution,
      pollutantDetectionRates,
      wastewaterDischarge1999,
    }), []),
  });

  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  // ── 均衡饼图数据 ──
  const rechargePie = useMemo(() =>
    plainWaterBalance.rechargeBreakdown.map(r => ({ name: r.item, value: r.value })),
    []
  );
  const dischargePie = useMemo(() =>
    plainWaterBalance.dischargeBreakdown.map(d => ({ name: d.item, value: d.value })),
    []
  );

  // ── 各市均衡柱图数据 ──
  const cityBalanceChart = useMemo(() =>
    cityWaterBalance.map(c => ({
      name: c.city,
      recharge: c.total.recharge,
      discharge: c.total.discharge,
      balance: c.total.balance,
    })),
    []
  );

  // ── 开采潜力数据 ──
  const potentialChart = useMemo(() =>
    cityExploitationPotential.map(c => ({
      name: c.city,
      resource: c.resource,
      extraction: c.extraction2000,
      surplus: c.surplus,
    })),
    []
  );

  // ── 各市开采量柱图 ──
  const _extractionChart = useMemo(() =>
    cityGroundwaterExtraction2000.map(c => ({
      name: c.city,
      agriculture: c.agriculture,
      industry: c.industry,
      domestic: c.domestic,
    })),
    []
  );

  // ── 污染评价数据 ──
  const pollutionChart = useMemo(() =>
    cityGroundwaterPollution.map(c => ({
      name: c.city,
      unpol: c.unpol,
      light: c.light,
      moderate: c.moderate,
      heavy: c.heavy,
      severe: c.severe,
    })),
    []
  );

  // ── 报告数据 ──

  return (
    <div className="p-3 md:p-6 max-w-[1440px] mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <SectionTitle icon={Scale}>地下水均衡与资源评价</SectionTitle>
          <p className="text-xs text-gw-muted mt-1">
            数据来源：《中国地下水资源 河北卷》(2005) | 平原区水均衡 · 各市均衡 · 开采潜力 · 水质污染评价
          </p>
        </div>
        <button onClick={() => setExportOpen(true)}
          className="px-3 py-1.5 rounded-lg text-xs bg-gw-blue/15 text-gw-highlight border border-gw-blue/30 hover:bg-gw-blue/25 transition-all">
          导出报告
        </button>
      </div>

      {/* 关键指标 */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3">
        <StatCard title="总补给量" value={String(plainWaterBalance.totalRecharge)} unit="亿m³/a" icon={TrendingUp} accent="blue" />
        <StatCard title="总排泄量" value={String(plainWaterBalance.totalDischarge)} unit="亿m³/a" icon={TrendingDown} accent="red" />
        <StatCard title="年均超采" value={String(Math.abs(plainWaterBalance.balance))} unit="亿m³/a" icon={MinusCircle} accent="orange" />
        <StatCard title="总开采量" value={String(potentialZoneSummary.totalExtraction2000)} unit="亿m³/a(2000)" icon={Droplets} accent="amber" />
        <StatCard title="超采区占比" value={String(potentialZoneSummary.zones[2].percent)} unit="%" icon={AlertTriangle} accent="red" />
        <StatCard title="农业开采占比" value="76.8" unit="%" icon={BarChart3} accent="green" />
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

      {/* ═══════════════════ 均衡总览 ═══════════════════ */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <LazyChartCard title="补给项构成" className="scan-line" height={320}>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie data={rechargePie} cx="50%" cy="50%" innerRadius={50} outerRadius={100}
                    dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}>
                    {rechargePie.map((e, i) => <Cell key={i} fill={BALANCE_COLORS[i % BALANCE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip unit="亿m³/a" title="补给量" />} />
                </PieChart>
              </ResponsiveContainer>
            </LazyChartCard>
            <LazyChartCard title="排泄项构成" className="scan-line" height={320}>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie data={dischargePie} cx="50%" cy="50%" innerRadius={50} outerRadius={100}
                    dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}>
                    {dischargePie.map((e, i) => <Cell key={i} fill={BALANCE_COLORS.slice(2)[i % BALANCE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip unit="亿m³/a" title="排泄量" />} />
                </PieChart>
              </ResponsiveContainer>
            </LazyChartCard>
          </div>

          <TechCard title="河北平原区水均衡总表" badge={`${plainWaterBalance.period} 年均值`}>
            <p className="text-xs text-gw-muted mb-3">
              总补给 {plainWaterBalance.totalRecharge} 亿m³/a，总排泄 {plainWaterBalance.totalDischarge} 亿m³/a，
              均衡差 <span className="text-red-400 font-bold">{plainWaterBalance.balance} 亿m³/a</span>（超采），
              储存量变化 <span className="text-red-400 font-bold">{plainWaterBalance.storageChange} 亿m³/a</span>。
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-gw-cyan font-semibold mb-1">补给项（总计 {plainWaterBalance.totalRecharge} 亿m³/a）</p>
                <table className="w-full text-[11px]">
                  <thead><tr className="border-b border-gw-border">
                    <th className="text-left text-gw-muted py-1 px-2">项目</th>
                    <th className="text-gw-muted py-1 px-2">水量(亿m³/a)</th>
                    <th className="text-gw-muted py-1 px-2">占比(%)</th>
                  </tr></thead>
                  <tbody>
                    {plainWaterBalance.rechargeBreakdown.map((r, i) => (
                      <tr key={i} className="border-b border-gw-border/20">
                        <td className="py-1 px-2 text-gw-text">{r.item}</td>
                        <td className="py-1 px-2 font-mono text-center">{r.value}</td>
                        <td className="py-1 px-2 font-mono text-center">{r.percent}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div>
                <p className="text-[10px] text-gw-cyan font-semibold mb-1">排泄项（总计 {plainWaterBalance.totalDischarge} 亿m³/a）</p>
                <table className="w-full text-[11px]">
                  <thead><tr className="border-b border-gw-border">
                    <th className="text-left text-gw-muted py-1 px-2">项目</th>
                    <th className="text-gw-muted py-1 px-2">水量(亿m³/a)</th>
                    <th className="text-gw-muted py-1 px-2">占比(%)</th>
                  </tr></thead>
                  <tbody>
                    {plainWaterBalance.dischargeBreakdown.map((d, i) => (
                      <tr key={i} className="border-b border-gw-border/20">
                        <td className="py-1 px-2 text-gw-text">{d.item}</td>
                        <td className="py-1 px-2 font-mono text-center">{d.value}</td>
                        <td className="py-1 px-2 font-mono text-center">{d.percent}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TechCard>

          <TechCard title="水文地质参数">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(hydrogeologicalParams).map(([key, val]) => (
                <div key={key} className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
                  <p className="text-[10px] text-gw-cyan font-semibold mb-1">
                    {key === 'rainfallInfiltration' ? '降水入渗系数' :
                     key === 'permeability' ? '渗透系数' :
                     key === 'specificYield' ? '给水度' :
                     key === 'storageCoefficient' ? '释水系数' :
                     '潜水蒸发极限深度'}
                  </p>
                  <p className="text-[10px] text-gw-muted">{val}</p>
                </div>
              ))}
            </div>
          </TechCard>
        </div>
      )}

      {/* ═══════════════════ 各市均衡 ═══════════════════ */}
      {activeTab === 'city' && (
        <div className="space-y-4">
          <LazyChartCard title="各市潜水-微承压水均衡对比" className="scan-line" height={350}>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={cityBalanceChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} label={{ value: '亿m³/a', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
                <Tooltip content={<ChartTooltip unit="亿m³/a" title="水量" />} />
                <Bar dataKey="recharge" name="补给量" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                <Bar dataKey="discharge" name="排泄量" fill="#ef4444" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </LazyChartCard>

          <TechCard title="各市均衡明细" badge="1991-2000年均值">
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto scrollbar-thin">
              <table className="w-full text-[10px]">
                <thead className="sticky top-0 bg-gw-card z-10"><tr className="border-b border-gw-border">
                  <th className="text-left text-gw-muted py-1.5 px-1.5">城市</th>
                  <th className="text-left text-gw-muted py-1.5 px-1.5">矿化度</th>
                  <th className="text-gw-muted py-1.5 px-1.5">面积(km²)</th>
                  <th className="text-gw-muted py-1.5 px-1.5">补给量</th>
                  <th className="text-gw-muted py-1.5 px-1.5">排泄量</th>
                  <th className="text-gw-muted py-1.5 px-1.5">均衡差</th>
                </tr></thead>
                <tbody>
                  {cityWaterBalance.map(c =>
                    c.units.map((u, i) => (
                      <tr key={`${c.city}-${i}`} className="border-b border-gw-border/20 data-row">
                        {i === 0 && <td className="py-1.5 px-1.5 font-medium text-gw-text" rowSpan={c.units.length}>{c.city}</td>}
                        <td className="py-1.5 px-1.5 text-gw-muted">{u.salinity}</td>
                        <td className="py-1.5 px-1.5 font-mono text-center">{u.area}</td>
                        <td className="py-1.5 px-1.5 font-mono text-center">{u.recharge}</td>
                        <td className="py-1.5 px-1.5 font-mono text-center">{u.discharge}</td>
                        <td className={`py-1.5 px-1.5 font-mono text-center ${u.balance < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {u.balance > 0 ? '+' : ''}{u.balance.toFixed(4)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </TechCard>

          <TechCard title="各市地下水开采量（2000年，按用途）">
            <div className="overflow-x-auto">
              <table className="w-full text-[10px]">
                <thead><tr className="border-b border-gw-border">
                  <th className="text-left text-gw-muted py-1.5 px-1.5">城市</th>
                  <th className="text-gw-muted py-1.5 px-1.5">浅层</th>
                  <th className="text-gw-muted py-1.5 px-1.5">深层</th>
                  <th className="text-gw-muted py-1.5 px-1.5">微咸水</th>
                  <th className="text-gw-muted py-1.5 px-1.5">总计</th>
                  <th className="text-gw-muted py-1.5 px-1.5">农业</th>
                  <th className="text-gw-muted py-1.5 px-1.5">工业</th>
                  <th className="text-gw-muted py-1.5 px-1.5">生活</th>
                </tr></thead>
                <tbody>
                  {cityGroundwaterExtraction2000.map((c, i) => (
                    <tr key={i} className="border-b border-gw-border/20 data-row">
                      <td className="py-1.5 px-1.5 font-medium text-gw-text">{c.city}</td>
                      <td className="py-1.5 px-1.5 font-mono text-center">{c.shallow}</td>
                      <td className="py-1.5 px-1.5 font-mono text-center">{c.deep}</td>
                      <td className="py-1.5 px-1.5 font-mono text-center">{c.brackish}</td>
                      <td className="py-1.5 px-1.5 font-mono text-center font-bold">{c.total}</td>
                      <td className="py-1.5 px-1.5 font-mono text-center">{c.agriculture}</td>
                      <td className="py-1.5 px-1.5 font-mono text-center">{c.industry}</td>
                      <td className="py-1.5 px-1.5 font-mono text-center">{c.domestic}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TechCard>
        </div>
      )}

      {/* ═══════════════════ 开采潜力 ═══════════════════ */}
      {activeTab === 'potential' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <LazyChartCard title="各市开采潜力对比" className="scan-line" height={350}>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={potentialChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} label={{ value: '亿m³/a', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
                  <Tooltip content={<ChartTooltip unit="亿m³/a" title="水量" />} />
                  <Bar dataKey="resource" name="可开采资源" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="extraction" name="实际开采(2000)" fill="#ef4444" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </LazyChartCard>
            <TechCard title="开采潜力分区统计">
              <div className="space-y-3">
                {potentialZoneSummary.zones.map((z, i) => (
                  <div key={i} className="p-3 rounded-lg border border-gw-border/30 bg-gw-surface/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gw-text">{z.zone}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                        i === 0 ? 'bg-emerald-500/15 text-emerald-400' :
                        i === 1 ? 'bg-blue-500/15 text-blue-400' : 'bg-red-500/15 text-red-400'
                      }`}>{z.percent}%</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[10px]">
                      <div><span className="text-gw-muted">面积</span> <span className="font-mono">{z.area}km²</span></div>
                      <div><span className="text-gw-muted">资源</span> <span className="font-mono">{z.resource}亿m³</span></div>
                      <div><span className="text-gw-muted">开采</span> <span className="font-mono">{z.extraction}亿m³</span></div>
                    </div>
                    <p className="text-[9px] text-gw-muted mt-1">潜力指数 {z.piRange}，盈余 {z.surplus} 亿m³/a</p>
                  </div>
                ))}
              </div>
            </TechCard>
          </div>

          <TechCard title="各市开采潜力明细" badge="2000年基准">
            <div className="overflow-x-auto">
              <table className="w-full text-[10px]">
                <thead><tr className="border-b border-gw-border">
                  <th className="text-left text-gw-muted py-1.5 px-1.5">城市</th>
                  <th className="text-gw-muted py-1.5 px-1.5">面积(km²)</th>
                  <th className="text-gw-muted py-1.5 px-1.5">可采资源</th>
                  <th className="text-gw-muted py-1.5 px-1.5">实际开采</th>
                  <th className="text-gw-muted py-1.5 px-1.5">潜力指数</th>
                  <th className="text-gw-muted py-1.5 px-1.5">盈余/超采</th>
                  <th className="text-gw-muted py-1.5 px-1.5">超采率(%)</th>
                  <th className="text-left text-gw-muted py-1.5 px-1.5">状态</th>
                </tr></thead>
                <tbody>
                  {cityExploitationPotential.map((c, i) => (
                    <tr key={i} className="border-b border-gw-border/20 data-row">
                      <td className="py-1.5 px-1.5 font-medium text-gw-text">{c.city}</td>
                      <td className="py-1.5 px-1.5 font-mono text-center">{c.area}</td>
                      <td className="py-1.5 px-1.5 font-mono text-center">{c.resource}</td>
                      <td className="py-1.5 px-1.5 font-mono text-center">{c.extraction2000}</td>
                      <td className="py-1.5 px-1.5 font-mono text-center">{c.potentialIndex}</td>
                      <td className={`py-1.5 px-1.5 font-mono text-center ${c.surplus < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {c.surplus > 0 ? '+' : ''}{c.surplus.toFixed(4)}
                      </td>
                      <td className="py-1.5 px-1.5 font-mono text-center">{c.surplusPercent.toFixed(2)}</td>
                      <td className="py-1.5 px-1.5">
                        <span className={`px-1 py-0.5 rounded text-[9px] ${
                          c.note === '严重超采' ? 'bg-red-500/15 text-red-400' :
                          c.note === '超采' ? 'bg-amber-500/15 text-amber-400' : 'bg-emerald-500/15 text-emerald-400'
                        }`}>{c.note}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TechCard>

          <TechCard title="开采潜力增量措施">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {potentialZoneSummary.potentialIncrease.map((p, i) => (
                <div key={i} className="p-2.5 rounded-lg border border-gw-border/30 bg-gw-surface/30 text-center">
                  <p className="text-[9px] text-gw-muted">{p.measure}</p>
                  <p className="text-lg font-bold text-gw-highlight">{p.amount}</p>
                  <p className="text-[9px] text-gw-muted">亿m³/a</p>
                </div>
              ))}
            </div>
          </TechCard>
        </div>
      )}

      {/* ═══════════════════ 水质评价 ═══════════════════ */}
      {activeTab === 'quality' && (
        <div className="space-y-4">
          <TechCard title="浅层地下水质量分类" badge="GB/T 14848-2017">
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead><tr className="border-b border-gw-border">
                  <th className="text-gw-muted py-1.5 px-2">类别</th>
                  <th className="text-left text-gw-muted py-1.5 px-2">分布范围</th>
                  <th className="text-gw-muted py-1.5 px-2">占比(%)</th>
                  <th className="text-left text-gw-muted py-1.5 px-2">特征描述</th>
                </tr></thead>
                <tbody>
                  {shallowWaterQualityByClass.map((q, i) => (
                    <tr key={i} className="border-b border-gw-border/20">
                      <td className="py-1.5 px-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          q.class === 'Ⅰ类' ? 'bg-blue-500/15 text-blue-400' :
                          q.class === 'Ⅱ类' ? 'bg-emerald-500/15 text-emerald-400' :
                          q.class === 'Ⅲ类' ? 'bg-amber-500/15 text-amber-400' :
                          q.class === 'Ⅳ类' ? 'bg-orange-500/15 text-orange-400' :
                          'bg-red-500/15 text-red-400'
                        }`}>{q.class}</span>
                      </td>
                      <td className="py-1.5 px-2 text-gw-muted text-[10px]">{q.area}</td>
                      <td className="py-1.5 px-2 font-mono text-center">{q.percent}</td>
                      <td className="py-1.5 px-2 text-gw-muted text-[10px]">{q.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TechCard>

          <TechCard title="废污水排放量（1999年）" badge={`总计 ${wastewaterDischarge1999.total} 亿t/a`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-gw-muted mb-1">排放构成</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-gw-surface/30 rounded-lg">
                    <span className="text-xs text-gw-text">工业废水</span>
                    <span className="text-sm font-bold text-blue-400">{wastewaterDischarge1999.industrial} 亿t/a</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gw-surface/30 rounded-lg">
                    <span className="text-xs text-gw-text">生活污水</span>
                    <span className="text-sm font-bold text-amber-400">{wastewaterDischarge1999.domestic} 亿t/a</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-gw-muted mb-1">流域分布</p>
                <div className="space-y-2">
                  {wastewaterDischarge1999.byBasin.map((b, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-gw-surface/30 rounded-lg">
                      <span className="text-xs text-gw-text">{b.basin}</span>
                      <span className="text-sm font-bold text-gw-highlight">{b.amount} 亿t/a ({b.percent}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TechCard>
        </div>
      )}

      {/* ═══════════════════ 污染评价 ═══════════════════ */}
      {activeTab === 'pollution' && (
        <div className="space-y-4">
          <LazyChartCard title="各市地下水污染面积分布" className="scan-line" height={350}>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={pollutionChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} label={{ value: 'km²', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
                <Tooltip content={<ChartTooltip unit="km²" title="面积" />} />
                <Bar dataKey="unpol" name="未污染" fill="#10b981" stackId="a" />
                <Bar dataKey="light" name="轻污染" fill="#f59e0b" stackId="a" />
                <Bar dataKey="moderate" name="中污染" fill="#f97316" stackId="a" />
                <Bar dataKey="heavy" name="重污染" fill="#ef4444" stackId="a" />
                <Bar dataKey="severe" name="严重污染" fill="#7f1d1d" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </LazyChartCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TechCard title="主要污染物检出率与超标率">
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead><tr className="border-b border-gw-border">
                    <th className="text-left text-gw-muted py-1.5 px-2">污染物</th>
                    <th className="text-gw-muted py-1.5 px-2">检出率(%)</th>
                    <th className="text-gw-muted py-1.5 px-2">超标率(%)</th>
                  </tr></thead>
                  <tbody>
                    {pollutantDetectionRates.map((p, i) => (
                      <tr key={i} className="border-b border-gw-border/20">
                        <td className="py-1.5 px-2 text-gw-text">{p.pollutant}</td>
                        <td className="py-1.5 px-2 font-mono text-center">{p.detection}</td>
                        <td className="py-1.5 px-2 font-mono text-center">{p.exceedance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TechCard>
            <TechCard title="各市地下水污染趋势">
              <div className="overflow-x-auto max-h-[300px] overflow-y-auto scrollbar-thin">
                <table className="w-full text-[10px]">
                  <thead className="sticky top-0 bg-gw-card"><tr className="border-b border-gw-border">
                    <th className="text-left text-gw-muted py-1.5 px-1.5">城市</th>
                    <th className="text-left text-gw-muted py-1.5 px-1.5">主要污染物</th>
                    <th className="text-gw-muted py-1.5 px-1.5">趋势</th>
                  </tr></thead>
                  <tbody>
                    {cityGroundwaterPollution.map((c, i) => (
                      <tr key={i} className="border-b border-gw-border/20">
                        <td className="py-1.5 px-1.5 font-medium text-gw-text">{c.city}</td>
                        <td className="py-1.5 px-1.5 text-gw-muted text-[9px]">{c.mainPollutants}</td>
                        <td className="py-1.5 px-1.5">
                          <span className={`px-1 py-0.5 rounded text-[9px] ${
                            c.trend === '减缓' ? 'bg-emerald-500/15 text-emerald-400' :
                            c.trend === '加重' || c.trend === '变差' ? 'bg-red-500/15 text-red-400' :
                            'bg-amber-500/15 text-amber-400'
                          }`}>{c.trend}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TechCard>
          </div>
        </div>
      )}

      <ExportProgressDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        reportType="groundwater-balance"
        reportLabel="河北省地下水均衡与资源评价报告"
        data={getData()}
        dataLoading={dataLoading}
      />      <CrossLinkPanel currentPath="/groundwater-balance" />
      <DataSourceNote source="《中国地下水资源 河北卷》(2005) 第三、四、六章 | 河北瑞三元环境科技有限公司整理" />
    </div>
  );
}
