import React, { useState,  useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Mountain, Droplets, AlertTriangle, Layers, HardHat, Leaf, BarChart3, BookOpen, Gauge } from 'lucide-react';
import { mineHydrogeologyData, mineHydrogeologyClassification, mineDrainageImpact, mineWaterUtilization, mineComplexityStandard, mineDrainageStatistics, mineWaterInrushHistory, mineEcologicalRestoration } from '../data/mineHydrogeology';
import { reservoirEngineeringData, rockCompressiveStrength, getReservoirSummary } from '../data/hydrogeologyReference';
import { exportDataCSV } from '../utils/exportUtils';
import { SectionTitle, TechCard, StatCard, TechTable, ChartTooltip, DataSourceNote } from '../components/UI';
import { CrossLinkPanel } from '../components/CrossLink';
import { LazyChartCard } from '../components/LazyChartCard';
import { FilterableTechTable } from '../components/FilterableTechTable';
import { ChartExport } from '../components/ChartExport';

import { usePageCommons } from '../hooks/usePageCommons'
// 注册报告生成器
const TABS = [
  { key: 'mines', label: '矿区特征', icon: Mountain },
  { key: 'statistics', label: '排水统计', icon: BarChart3 },
  { key: 'inrush', label: '突水事故', icon: AlertTriangle },
  { key: 'classification', label: '分类标准', icon: Layers },
  { key: 'impact', label: '排水影响', icon: AlertTriangle },
  { key: 'utilization', label: '矿坑水利用', icon: Droplets },
  { key: 'restoration', label: '生态修复', icon: Leaf },
  { key: 'complexity', label: '复杂度分级', icon: HardHat },
  { key: 'classic', label: '坝基工程', icon: BookOpen },
] as const;

type TabKey = typeof TABS[number]['key'];

const _LEVEL_COLORS: Record<string, string> = {
  green: '#10b981', blue: '#3b82f6', amber: '#f59e0b', red: '#ef4444' };

const UTILIZATION_COLORS = ['#3b82f6', '#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#6b7280'];

export function MineHydrogeology() {

  const { success } = usePageCommons({
    pageName: 'mine-hydrogeology',
    collector: useCallback(async () => ({ mineData: mineHydrogeologyData }), []),
  });

  const [activeTab, setActiveTab] = useState<TabKey>('mines');

  const inflowData = mineHydrogeologyData.map(d => {
    const range = d.mineWaterInflow.split('～');
    return {
      mine: d.mine,
      min: parseFloat(range[0]) || 0,
      max: parseFloat(range[1]) || 0,
      avg: ((parseFloat(range[0]) || 0) + (parseFloat(range[1]) || 0)) / 2 };
  });

  const utilizationPie = mineDrainageStatistics.utilizationBreakdown.map((u, i) => ({
    name: u.purpose,
    value: u.percent,
    color: UTILIZATION_COLORS[i % UTILIZATION_COLORS.length] }));

  const inrushTimeline = mineWaterInrushHistory.map(h => ({
    year: h.year,
    mine: h.mine.split(/矿|集团/)[0] + '矿',
    inflowNum: parseInt(h.inflow.match(/[\d,.]+/)?.[0].replace(',', '') || '0'),
    label: h.type }));

  // 报告数据预采集（增量缓存）
  return (
    <div className="p-3 md:p-6 max-w-[1440px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gw-text">矿床水文地质</h1>
          <p className="text-xs text-gw-muted mt-1">矿区充水条件、排水统计、突水事故与生态修复</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-2 py-1 rounded text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/20">稳定可更新</span>
          <button onClick={() => { exportDataCSV(mineHydrogeologyData as Record<string, unknown>[], 'mine-hydrogeology'); success('数据已导出'); }} className="text-xs text-gw-cyan/60 hover:text-gw-cyan transition-colors">
            导出数据
          </button>
        </div>
      </div>

      {/* KPI卡片 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
        <StatCard title="主要矿区" value={String(mineHydrogeologyData.length)} unit="处" accent="amber" />
        <StatCard title="年排水量" value={mineDrainageStatistics.totalAnnualDrainage.replace('约', '')} accent="cyan" />
        <StatCard title="综合利用率" value={mineDrainageStatistics.overallUtilizationRate} accent="emerald" />
        <StatCard title="突水事故" value={String(mineWaterInrushHistory.length)} unit="起" accent="red" />
        <StatCard title="生态修复" value={String(mineEcologicalRestoration.length)} unit="案例" accent="green" />
      </div>

      <div className="flex gap-1 bg-gw-surface rounded-lg p-1 overflow-x-auto scrollbar-none flex-wrap">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs transition-all ${activeTab === tab.key ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30' : 'text-gw-muted hover:text-gw-text'}`}>
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ============ 矿区特征 ============ */}
      {activeTab === 'mines' && (
        <div className="space-y-4">
          <LazyChartCard title="矿区涌水量对比" height={280}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={inflowData} margin={{ top: 10, right: 20, bottom: 40, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
                <XAxis dataKey="mine" tick={{ fill: '#8b9dc3', fontSize: 11 }} angle={-20} textAnchor="end" />
                <YAxis tick={{ fill: '#8b9dc3', fontSize: 11 }} label={{ value: 'm³/h', angle: -90, position: 'insideLeft', style: { fill: '#8b9dc3', fontSize: 11 } }} />
                <Tooltip content={<ChartTooltip unit="m³" title="矿区涌水量对比" />} />
                <Bar dataKey="min" name="最小涌水" fill="#3b82f6" />
                <Bar dataKey="max" name="最大涌水" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </LazyChartCard>
          <TechCard title="主要矿区水文地质特征">
              <div className="mb-3 flex justify-end">
                <ChartExport data={mineHydrogeologyData} filename="mine-hydrogeology" sheetName="矿区水文地质" formats={['xlsx','csv','json']} label="导出数据" />
              </div>
            <FilterableTechTable headers={['矿区', '位置', '矿种', '时代', '含水层类型', '涌水量(m³/h)', '充水水源', '富水性', '水文地质类型', '年排水量', '防治措施']}
              rows={mineHydrogeologyData.map(d => [d.mine, d.location, d.oreType, d.geologicAge, d.aquiferType, d.mineWaterInflow, d.waterFillingSource, d.waterRichness, d.hydrogeologyType, d.annualDrainage, d.protectionMeasures])}
          
                              filterPlaceholder="搜索..."
              />
          </TechCard>
        </div>
      )}

      {/* ============ 排水统计(新增) ============ */}
      {activeTab === 'statistics' && (
        <div className="space-y-4">
          {/* 总量KPI */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            <div className="p-4 rounded-lg bg-gw-surface/50 border border-gw-border/40 text-center">
              <div className="text-xs text-gw-muted">年排水总量</div>
              <div className="text-lg font-bold text-gw-highlight mt-1">{mineDrainageStatistics.totalAnnualDrainage}</div>
            </div>
            <div className="p-4 rounded-lg bg-gw-surface/50 border border-gw-border/40 text-center">
              <div className="text-xs text-gw-muted">综合利用量</div>
              <div className="text-lg font-bold text-emerald-400 mt-1">{mineDrainageStatistics.totalUtilization}</div>
            </div>
            <div className="p-4 rounded-lg bg-gw-surface/50 border border-gw-border/40 text-center">
              <div className="text-xs text-gw-muted">煤矿占比</div>
              <div className="text-lg font-bold text-amber-400 mt-1">{mineDrainageStatistics.coalMinesShare}</div>
            </div>
            <div className="p-4 rounded-lg bg-gw-surface/50 border border-gw-border/40 text-center">
              <div className="text-xs text-gw-muted">铁矿占比</div>
              <div className="text-lg font-bold text-blue-400 mt-1">{mineDrainageStatistics.ironMinesShare}</div>
            </div>
          </div>

          {/* 利用结构饼图 + 利用明细表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LazyChartCard title="矿井水利用结构" height={280}>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={utilizationPie} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {utilizationPie.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip unit="%" title="矿井水利用结构" />} />
                </PieChart>
              </ResponsiveContainer>
            </LazyChartCard>
            <TechCard title="利用途径明细">
              <TechTable headers={['利用途径', '占比(%)', '利用量']}
                rows={mineDrainageStatistics.utilizationBreakdown.map(u => [u.purpose, u.percent, u.volume])}
          />
            </TechCard>
          </div>

          {/* 政策目标 */}
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-xs text-blue-400"><span className="font-medium">政策目标:</span> {mineDrainageStatistics.policyTarget}</p>
            <p className="text-xs text-gw-muted mt-1"><span className="text-gw-text font-medium">依据:</span> {mineDrainageStatistics.keyPolicy}</p>
          </div>

          {/* 利用结构柱状图 */}
          <LazyChartCard title="各利用途径占比对比" height={280}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={mineDrainageStatistics.utilizationBreakdown.map(u => ({
                name: u.purpose.length > 6 ? u.purpose.substring(0, 6) + '...' : u.purpose,
                value: u.percent }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} unit="%" />
                <Tooltip content={<ChartTooltip unit="%" title="占比数据" />} />
                <Bar dataKey="value" name="占比(%)" radius={[2, 2, 0, 0]}>
                  {mineDrainageStatistics.utilizationBreakdown.map((_, i) => <Cell key={i} fill={UTILIZATION_COLORS[i % UTILIZATION_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </LazyChartCard>
        </div>
      )}

      {/* ============ 突水事故(新增) ============ */}
      {activeTab === 'inrush' && (
        <div className="space-y-4">
          {/* 事故时间线 */}
          <LazyChartCard title="矿区突水事故时间线(1984-2019)" height={280}>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={inrushTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="year" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} label={{ value: '涌水量', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af', fontSize: 10 } }} />
                <Tooltip content={<ChartTooltip title="开采数据" />} />
                <Line type="monotone" dataKey="inflowNum" name="涌水量" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </LazyChartCard>

          {/* 事故明细卡片 */}
          <div className="space-y-3">
            {mineWaterInrushHistory.map((h, i) => (
              <TechCard key={i} title={`${h.year} ${h.mine}`}>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-red-500/15 text-red-400 text-[10px] font-medium">{h.type}</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 text-[10px]">涌水: {h.inflow}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2 rounded bg-gw-surface/50">
                      <span className="text-gw-muted">原因</span>
                      <p className="text-gw-text mt-1">{h.cause}</p>
                    </div>
                    <div className="p-2 rounded bg-gw-surface/50">
                      <span className="text-gw-muted">后果</span>
                      <p className="text-gw-text mt-1">{h.consequence}</p>
                    </div>
                  </div>
                  <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-emerald-400"><span className="font-medium">教训:</span> {h.lesson}</p>
                  </div>
                </div>
              </TechCard>
            ))}
          </div>

          {/* 事故统计表 */}
          <TechCard title="突水事故统计">
              <div className="mb-3 flex justify-end">
                <ChartExport data={mineWaterInrushHistory} filename="mine-water-inrush" sheetName="突水事故" formats={['xlsx','csv','json']} label="导出数据" />
              </div>
            <TechTable headers={['年份', '矿区', '类型', '涌水量', '原因', '后果', '防治教训']}
              rows={mineWaterInrushHistory.map(h => [String(h.year), h.mine, h.type, h.inflow, h.cause, h.consequence, h.lesson])}
          />
          </TechCard>
        </div>
      )}

      {/* ============ 分类标准 ============ */}
      {activeTab === 'classification' && (
        <div className="space-y-4">
          <TechCard title="矿床水文地质分类">
            <TechTable headers={['类型', '描述', '复杂程度', '代表矿区']}
              rows={mineHydrogeologyClassification.map(c => [c.type, c.description, c.complexity, c.representative])}
          />
          </TechCard>
        </div>
      )}

      {/* ============ 排水影响 ============ */}
      {activeTab === 'impact' && (
        <div className="space-y-4">
          <TechCard title="矿区排水环境影响">
            <TechTable headers={['影响类型', '描述', '严重程度', '影响范围', '恢复状况']}
              rows={mineDrainageImpact.map(d => [d.impact, d.description, d.severity, d.affectedArea, d.recoveryStatus])}
          />
          </TechCard>
        </div>
      )}

      {/* ============ 矿坑水利用 ============ */}
      {activeTab === 'utilization' && (
        <div className="space-y-4">
          <TechCard title="矿坑水利用情况">
            <FilterableTechTable headers={['矿区', '年排水量(亿m³)', '利用率(%)', '利用途径', '利用量']}
              rows={mineWaterUtilization.map(u => [u.mine, u.annualDrainage, u.utilizationRate, u.utilization, u.utilizationAmount])}
          
                              filterPlaceholder="搜索..."
              />
          </TechCard>
        </div>
      )}

      {/* ============ 生态修复(新增) ============ */}
      {activeTab === 'restoration' && (
        <div className="space-y-4">
          {/* 修复成果KPI */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            <div className="p-4 rounded-lg bg-gw-surface/50 border border-gw-border/40 text-center">
              <div className="text-xs text-gw-muted">修复案例</div>
              <div className="text-lg font-bold text-emerald-400 mt-1">{mineEcologicalRestoration.length}</div>
            </div>
            <div className="p-4 rounded-lg bg-gw-surface/50 border border-gw-border/40 text-center">
              <div className="text-xs text-gw-muted">总投资</div>
              <div className="text-lg font-bold text-gw-highlight mt-1">约85亿元</div>
            </div>
            <div className="p-4 rounded-lg bg-gw-surface/50 border border-gw-border/40 text-center">
              <div className="text-xs text-gw-muted">黑龙洞泉复涌</div>
              <div className="text-lg font-bold text-cyan-400 mt-1">2021年</div>
            </div>
            <div className="p-4 rounded-lg bg-gw-surface/50 border border-gw-border/40 text-center">
              <div className="text-xs text-gw-muted">百泉复涌</div>
              <div className="text-lg font-bold text-cyan-400 mt-1">2021年</div>
            </div>
          </div>

          {/* 修复案例详情 */}
          <div className="space-y-3">
            {mineEcologicalRestoration.map((r, i) => (
              <TechCard key={i} title={r.case}>
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3">
                    <div className="p-2 rounded bg-gw-surface/50">
                      <span className="text-gw-muted">位置</span>
                      <p className="text-gw-text mt-0.5">{r.location}</p>
                    </div>
                    <div className="p-2 rounded bg-gw-surface/50">
                      <span className="text-gw-muted">影响面积</span>
                      <p className="text-gw-text mt-0.5">{r.area}</p>
                    </div>
                    <div className="p-2 rounded bg-gw-surface/50">
                      <span className="text-gw-muted">总投资</span>
                      <p className="text-gw-text mt-0.5">{r.investment}</p>
                    </div>
                  </div>
                  <div className="p-2 rounded bg-gw-surface/50">
                    <span className="text-gw-muted">治理措施</span>
                    <p className="text-gw-text mt-0.5">{r.measures}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 text-[10px]">{r.period}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[10px]">{r.result}</span>
                  </div>
                </div>
              </TechCard>
            ))}
          </div>

          {/* 修复统计表 */}
          <TechCard title="生态修复案例汇总">
            <TechTable headers={['案例', '位置', '影响面积', '治理措施', '修复成果', '投资', '周期']}
              rows={mineEcologicalRestoration.map(r => [r.case, r.location, r.area, r.measures, r.result, r.investment, r.period])}
          />
          </TechCard>

          {/* 泉域复涌专题 */}
          <TechCard title="泉域保护与复涌专题">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 space-y-2">
                <h4 className="text-cyan-400 font-medium">黑龙洞泉域(邯郸峰峰)</h4>
                <p className="text-gw-muted">泉域面积约350km²，为峰峰矿区重要水源。长期煤矿排水导致泉水断流。</p>
                <p className="text-gw-muted">治理措施：关闭小矿、限制排水量、人工补给。</p>
                <p className="text-emerald-400 font-medium">2021年黑龙洞泉复涌，流量约0.5m³/s</p>
              </div>
              <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 space-y-2">
                <h4 className="text-cyan-400 font-medium">百泉泉域(邢台)</h4>
                <p className="text-gw-muted">泉域面积约380km²，为邢台市历史水源地。因铁矿排水自1980年代干涸近40年。</p>
                <p className="text-gw-muted">治理措施：关闭铁矿、减少排水、南水北调补水替代。</p>
                <p className="text-emerald-400 font-medium">2021年百泉复涌，结束40年干涸历史</p>
              </div>
            </div>
          </TechCard>
        </div>
      )}

      {/* ============ 复杂度分级 ============ */}
      {activeTab === 'complexity' && (
        <div className="space-y-4">
          <TechCard title="矿区水文地质条件复杂程度分级">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mineComplexityStandard.map((s, i) => (
                <div key={i} className={`p-4 rounded-lg bg-gw-surface/50 border ${s.color === 'green' ? 'border-emerald-500/30' : s.color === 'blue' ? 'border-blue-500/30' : s.color === 'amber' ? 'border-amber-500/30' : 'border-red-500/30'}`}>
                  <h3 className={`text-sm font-medium mb-2 ${s.color === 'green' ? 'text-emerald-400' : s.color === 'blue' ? 'text-blue-400' : s.color === 'amber' ? 'text-amber-400' : 'text-red-400'}`}>{s.level}</h3>
                  <p className="text-xs text-gw-muted">{s.criteria}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-gw-surface text-gw-text text-[10px]">充水层: {s.waterFillingLayers}</span>
                  </div>
                  <div className="mt-1">
                    <span className="text-[10px] text-gw-muted">勘查要求: </span>
                    <span className="text-[10px] text-gw-text">{s.explorationRequirement}</span>
                  </div>
                </div>
              ))}
            </div>
          </TechCard>
        </div>
      )}

      {/* ═══════════════════ 矿区排水影响与复杂度分析 ═══════════════════ */}
      <SectionTitle icon={AlertTriangle} badge="影响评估" >排水环境影响与复杂度分级</SectionTitle>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TechCard title="矿区排水环境影响矩阵" className="scan-line">
          <div className="space-y-1.5">
            {mineDrainageImpact.map((d: typeof mineDrainageImpact[number], i: number) => (
              <div key={i} className={`p-2 rounded-lg border ${d.severity === '严重' ? 'bg-red-500/10 border-red-500/20' : 'bg-amber-500/10 border-amber-500/15'}`}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-medium text-gw-text">{d.impact}</span>
                  <span className={`text-[9px] px-1.5 rounded font-medium ${d.severity === '严重' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {d.severity}
                  </span>
                </div>
                <p className="text-[9px] text-gw-muted/70 leading-relaxed">{d.description}</p>
                <div className="flex items-center justify-between mt-1 text-[9px]">
                  <span className="text-gw-muted">{d.affectedArea}</span>
                  <span className="text-emerald-400">{d.recoveryStatus}</span>
                </div>
              </div>
            ))}
          </div>
        </TechCard>

        <TechCard title="矿床水文地质复杂度分级标准" className="hud-corners">
          <div className="space-y-2">
            {mineComplexityStandard.map((s: typeof mineComplexityStandard[number], i: number) => (
              <div key={i} className={`p-2.5 rounded-lg border ${s.color === 'green' ? 'bg-emerald-500/10 border-emerald-500/15' : s.color === 'blue' ? 'bg-blue-500/10 border-blue-500/15' : s.color === 'amber' ? 'bg-amber-500/10 border-amber-500/15' : 'bg-red-500/10 border-red-500/15'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold ${s.color === 'green' ? 'text-emerald-400' : s.color === 'blue' ? 'text-blue-400' : s.color === 'amber' ? 'text-amber-400' : 'text-red-400'}`}>
                    {s.level}
                  </span>
                  <span className="text-[9px] text-gw-muted bg-gw-surface/50 px-1.5 py-0.5 rounded">
                    充水层: {s.waterFillingLayers}
                  </span>
                </div>
                <p className="text-[9px] text-gw-muted/80">{s.criteria}</p>
                <p className="text-[8px] text-gw-muted/50 mt-0.5">勘探要求: {s.explorationRequirement}</p>
              </div>
            ))}
          </div>
        </TechCard>
      </div>

      <DataSourceNote source="1999基础文献 | 第十四章 矿床水文地质特征" version="v3.0" />

      <SectionTitle icon={BookOpen} badge="经典参考">水库坝基工程地质</SectionTitle>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard title="大型水库" value={String(reservoirEngineeringData.length)} unit="座" icon={Layers} accent="blue" />
        <StatCard title="总库容" value={getReservoirSummary().totalCapacity.toFixed(1)} unit="亿m³" icon={Droplets} accent="cyan" />
        <StatCard title="总流域面积" value={(getReservoirSummary().totalCatchArea / 10000).toFixed(1)} unit="万km²" icon={Mountain} accent="green" />
        <StatCard title="坝基强度" value={String(rockCompressiveStrength.length)} unit="组" icon={Gauge} accent="amber" />
      </div>

      <TechCard title="大型水库坝基工程地质条件" icon={BookOpen}>
        <p className="text-[10px] text-gw-muted mb-3">
          河北省主要水库坝型、坝基岩性及主要工程地质问题
        </p>
        <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-gw-surface z-10">
              <tr className="border-b border-gw-border">
                <th className="px-2 py-1.5 text-left text-gw-muted font-medium">水库</th>
                <th className="px-2 py-1.5 text-left text-gw-muted font-medium">位置</th>
                <th className="px-2 py-1.5 text-left text-gw-muted font-medium">河流</th>
                <th className="px-2 py-1.5 text-left text-gw-muted font-medium">坝型</th>
                <th className="px-2 py-1.5 text-left text-gw-muted font-medium">库容(亿m³)</th>
                <th className="px-2 py-1.5 text-left text-gw-muted font-medium">坝基</th>
                <th className="px-2 py-1.5 text-left text-gw-muted font-medium">主要地质问题</th>
              </tr>
            </thead>
            <tbody>
              {reservoirEngineeringData.map((r, i) => (
                <tr key={i} className="border-b border-gw-border/50 hover:bg-gw-surface/50">
                  <td className="px-2 py-1 text-gw-text font-medium whitespace-nowrap">{r.name}</td>
                  <td className="px-2 py-1 text-gw-text text-[10px]">{r.location}</td>
                  <td className="px-2 py-1 text-gw-text">{r.river}</td>
                  <td className="px-2 py-1 text-gw-text text-[10px]">{r.damType}</td>
                  <td className="px-2 py-1 font-mono text-gw-highlight">{r.capacity}</td>
                  <td className="px-2 py-1 text-gw-text text-[10px]">{r.foundation}</td>
                  <td className="px-2 py-1 text-gw-muted text-[10px] max-w-[180px]">{r.geoIssue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>

      <CrossLinkPanel currentPath="/mine-hydrogeology" />
    </div>
  );
}
