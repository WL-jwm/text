import { useTabTransition } from '../hooks/useTabTransition';
import React, { useState, useMemo, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Droplets, Mountain, Layers, Waves, HardHat, Zap, BookOpen,
  Search,  Database, Calculator,
} from 'lucide-react';
import {
  historicalSprings, springStatsByRegion,
  riverLeakageData, mountainRunoffModulus,
  aquiferYieldRate, kValueByZone,
  thicknessYieldRelation, deepWaterParams,
  regionSpecificYield, huailaiBasinParams,
  hanxingKarstParams, basinAquiferParams,
  reservoirGeology, rockMechanics,
  resistivitySalinityRelation, lithologyResistivity,
  plainResistivityZones, ionMobility,
  chengdeHydrochemistry, historicalStratigraphy,
  largeIrrigationDistricts, mediumIrrigationByRegion,
} from '../data/hydrogeologyHistorical';
import { SectionTitle, TechCard, ChartTooltip, DataSourceNote } from '../components/UI';
import { LazyChartCard } from '../components/LazyChartCard';
import { VirtualizedTable } from '../components/VirtualizedTable';
import { usePageCommons } from '../hooks/usePageCommons'
import { ExportProgressDialog } from '../components/ExportProgressDialog';
import { CrossLinkPanel } from '../components/CrossLink';
import { HistoricalParamCalculatorTab } from '../components/hydrogeology-historical/HistoricalParamCalculatorTab';
// 注册报告生成器
type TabKey = 'springs' | 'aquifer' | 'runoff' | 'basin' | 'engineering' | 'geophysics' | 'stratigraphy' | 'calculator';
const TABS: { key: TabKey; label: string; icon; count?: number }[] = [
  { key: 'springs', label: '泉水数据库', icon: Droplets, count: historicalSprings.length },
  { key: 'aquifer', label: '含水层参数', icon: Layers },
  { key: 'runoff', label: '径流与渗漏', icon: Waves },
  { key: 'basin', label: '盆地参数', icon: Mountain },
  { key: 'engineering', label: '工程地质', icon: HardHat },
  { key: 'geophysics', label: '物探参数', icon: Zap },
  { key: 'stratigraphy', label: '地层柱状', icon: BookOpen },
  { key: 'calculator', label: '参数推算', icon: Calculator },
];
const REGION_COLORS: Record<string, string> = {
  '邯邢': '#ef4444', '石家庄': '#f59e0b', '唐山': '#3b82f6',
  '承德': '#10b981', '保定': '#8b5cf6', '张家口': '#ec4899',
};

export function HydrogeologyHistorical() {

  const { setExportOpen, exportOpen, getData, dataLoading } = usePageCommons({
    pageName: 'hydrogeology-historical',
    collector: useCallback(async () => ({
      historicalSprings,
      springStatsByRegion,
      riverLeakageData,
      mountainRunoffModulus,
      aquiferYieldRate,
      kValueByZone,
      thicknessYieldRelation,
      deepWaterParams,
      regionSpecificYield,
      huailaiBasinParams,
      hanxingKarstParams,
      basinAquiferParams,
      reservoirGeology,
      rockMechanics,
      resistivitySalinityRelation,
      lithologyResistivity,
      plainResistivityZones,
      ionMobility,
      chengdeHydrochemistry,
      historicalStratigraphy,
      largeIrrigationDistricts,
      mediumIrrigationByRegion,
    }), []),
  });

  const [activeTab, setActiveTab] = useTabTransition<TabKey>('springs');
  const [springSearch, setSpringSearch] = useState('');
  const [springRegion, setSpringRegion] = useState('全部');
  const [expandedSpring, setExpandedSpring] = useState<number | null>(null);

  // ── 泉水过滤 ──
  const filteredSprings = useMemo(() => {
    let list = historicalSprings;
    if (springRegion !== '全部') list = list.filter(s => s.region === springRegion);
    if (springSearch.trim()) {
      const kw = springSearch.trim().toLowerCase();
      list = list.filter(s =>
        s.location.toLowerCase().includes(kw) ||
        s.geology.toLowerCase().includes(kw) ||
        s.region.toLowerCase().includes(kw)
      );
    }
    return list;
  }, [springSearch, springRegion]);

  // ── 泉水流量分布（用于散点图） ──
  const springFlowData = useMemo(() => {
    return filteredSprings.map(s => {
      const flowStr = s.flow.replace(/~.*$/, '').replace(/[^0-9.]/g, '');
      const flow = parseFloat(flowStr);
      return { name: s.location, flow: isNaN(flow) ? 0 : flow, region: s.region };
    }).filter(d => d.flow > 0).sort((a, b) => b.flow - a.flow).slice(0, 30);
  }, [filteredSprings]);

  // ── 渗透系数对比数据 ──
  const _kComparison = useMemo(() => {
    const groups = ['粉砂', '细砂', '中砂', '粗砂', '砾石', '卵石'];
    return groups.map(l => {
      const items = kValueByZone.filter(k => k.lithology === l && k.aquiferGroup === 'I');
      const shallow = items.find(i => i.plainZone === '山前平原');
      const middle = items.find(i => i.plainZone === '中部平原');
      return { name: l, 山前: shallow ? shallow.range : '-', 中部: middle ? middle.range : '-' };
    });
  }, []);

  // ── 报告数据 ──

  return (
    <div className="p-3 md:p-6 max-w-[1440px] mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <SectionTitle icon={Database}>历史水文地质参数汇编</SectionTitle>
          <p className="text-xs text-gw-muted mt-1">
            数据来源：《河北省水文地质工程地质》(1980年代, OCR识别) | {historicalSprings.length}条泉水 · 12条河流渗漏 · 含水层参数 · 工程地质
          </p>
        </div>
        <button onClick={() => setExportOpen(true)}
          className="px-3 py-1.5 rounded-lg text-xs bg-gw-blue/15 text-gw-highlight border border-gw-blue/30 hover:bg-gw-blue/25 transition-all">
          导出报告
        </button>
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
            {tab.count && <span className="text-[9px] px-1 py-0.5 rounded bg-gw-blue/10 text-gw-cyan">{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* ═══════════════════ 泉水数据库 ═══════════════════ */}
      {activeTab === 'springs' && (
        <div className="space-y-4">
          {/* 统计卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {springStatsByRegion.map(r => (
              <div key={r.region} className="p-2.5 rounded-lg border border-gw-border/30 bg-gw-surface/30 text-center">
                <p className="text-[10px] text-gw-muted">{r.region}</p>
                <p className="text-lg font-bold" style={{ color: REGION_COLORS[r.region] || '#3b82f6' }}>{r.count}</p>
                <p className="text-[9px] text-gw-muted">处泉水</p>
              </div>
            ))}
          </div>

          {/* 流量Top30柱图 */}
          <LazyChartCard title="泉水流量排名（Top 30）" className="scan-line" height={300}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={springFlowData} layout="vertical" margin={{ left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
                <XAxis type="number" stroke="#64748b" fontSize={10} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={9} width={90} />
                <Tooltip content={<ChartTooltip unit="m³/h" title="流量" />} />
                <Bar dataKey="flow" fill="#3b82f6" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </LazyChartCard>

          {/* 搜索过滤 */}
          <TechCard title="泉水数据库" badge={`${filteredSprings.length}/${historicalSprings.length}`}>
            <div className="flex flex-wrap gap-2 mb-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gw-muted" />
                <input type="text" value={springSearch} onChange={e => setSpringSearch(e.target.value)}
                  placeholder="搜索泉水位置/地质条件..." className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-gw-surface border border-gw-border/40 text-xs text-gw-text placeholder:text-gw-muted/50 focus:outline-none focus:border-gw-blue/50" />
              </div>
              <select value={springRegion} onChange={e => setSpringRegion(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-gw-surface border border-gw-border/40 text-xs text-gw-text focus:outline-none focus:border-gw-blue/50">
                <option value="全部">全部地区</option>
                {springStatsByRegion.map(r => <option key={r.region} value={r.region}>{r.region}({r.count})</option>)}
              </select>
            </div>
            <VirtualizedTable
              rows={filteredSprings}
              rowHeight={32}
              maxHeight={500}
              rowKey={(s) => String(s.id)}
              renderHeader={() => (
                <thead className="sticky top-0 bg-gw-card z-10"><tr className="border-b border-gw-border">
                  <th className="text-left text-gw-muted py-1.5 px-1.5 w-8">#</th>
                  <th className="text-left text-gw-muted py-1.5 px-1.5">位置</th>
                  <th className="text-gw-muted py-1.5 px-1.5">流量(m³/h)</th>
                  <th className="text-left text-gw-muted py-1.5 px-1.5">出露条件</th>
                  <th className="text-gw-muted py-1.5 px-1.5 w-12">地区</th>
                </tr></thead>
              )}
              renderRow={(s) => (
                <tr className="border-b border-gw-border/20 data-row cursor-pointer"
                  onClick={() => setExpandedSpring(expandedSpring === s.id ? null : s.id)}>
                  <td className="py-1.5 px-1.5 text-gw-muted font-mono text-[10px]">{s.id}</td>
                  <td className="py-1.5 px-1.5 font-medium text-gw-text">{s.location}</td>
                  <td className="py-1.5 px-1.5 font-mono text-center">{s.flow}</td>
                  <td className="py-1.5 px-1.5 text-gw-muted text-[10px]">{s.geology}</td>
                  <td className="py-1.5 px-1.5">
                    <span className="px-1 py-0.5 rounded text-[9px] text-white"
                      style={{ backgroundColor: REGION_COLORS[s.region] || '#3b82f6' }}>{s.region}</span>
                  </td>
                </tr>
              )}
            />
          </TechCard>
        </div>
      )}

      {/* ═══════════════════ 含水层参数 ═══════════════════ */}
      {activeTab === 'aquifer' && (
        <div className="space-y-4">
          <TechCard title="含水层出水率经验值" badge="m³/h·m³">
            <p className="text-[10px] text-gw-muted mb-2">单位：厚度1m砂层水位降低1m时的出水量</p>
            <div className="overflow-x-auto max-h-[350px] overflow-y-auto scrollbar-thin">
              <table className="w-full text-[11px]">
                <thead className="sticky top-0 bg-gw-card"><tr className="border-b border-gw-border">
                  <th className="text-left text-gw-muted py-1.5 px-2">岩性</th>
                  <th className="text-gw-muted py-1.5 px-2">含水组</th>
                  <th className="text-left text-gw-muted py-1.5 px-2">分区</th>
                  <th className="text-gw-muted py-1.5 px-2">出水率</th>
                </tr></thead>
                <tbody>
                  {aquiferYieldRate.map((a, i) => (
                    <tr key={i} className="border-b border-gw-border/20 data-row">
                      <td className="py-1.5 px-2 font-medium text-gw-text">{a.lithology}</td>
                      <td className="py-1.5 px-2 text-center font-mono">{a.aquiferGroup}</td>
                      <td className="py-1.5 px-2 text-gw-muted text-[10px]">{a.region}</td>
                      <td className="py-1.5 px-2 font-mono text-center">{a.range}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TechCard>

          <TechCard title="渗透系数K值分区统计" badge="m/d">
            <p className="text-[10px] text-gw-muted mb-2">第I含水组各平原分区渗透系数对比</p>
            <div className="overflow-x-auto max-h-[350px] overflow-y-auto scrollbar-thin">
              <table className="w-full text-[11px]">
                <thead className="sticky top-0 bg-gw-card"><tr className="border-b border-gw-border">
                  <th className="text-left text-gw-muted py-1.5 px-2">岩性</th>
                  <th className="text-gw-muted py-1.5 px-2">含水组</th>
                  <th className="text-left text-gw-muted py-1.5 px-2">平原分区</th>
                  <th className="text-gw-muted py-1.5 px-2">K值(m/d)</th>
                </tr></thead>
                <tbody>
                  {kValueByZone.map((k, i) => (
                    <tr key={i} className="border-b border-gw-border/20 data-row">
                      <td className="py-1.5 px-2 font-medium text-gw-text">{k.lithology}</td>
                      <td className="py-1.5 px-2 text-center font-mono">{k.aquiferGroup}</td>
                      <td className="py-1.5 px-2 text-gw-muted text-[10px]">{k.plainZone}</td>
                      <td className="py-1.5 px-2 font-mono text-center">{k.range}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TechCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TechCard title="深层水参数" badge="沧州/衡水/邢台">
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead><tr className="border-b border-gw-border">
                    <th className="text-left text-gw-muted py-1.5 px-2">地区</th>
                    <th className="text-gw-muted py-1.5 px-2">弹性释放系数S</th>
                    <th className="text-gw-muted py-1.5 px-2">越流补给系数e</th>
                  </tr></thead>
                  <tbody>
                    {deepWaterParams.map((d, i) => (
                      <tr key={i} className="border-b border-gw-border/20">
                        <td className="py-1.5 px-2 font-medium text-gw-text">{d.region}</td>
                        <td className="py-1.5 px-2 font-mono text-center">{d.elasticReleaseCoeff}</td>
                        <td className="py-1.5 px-2 font-mono text-center">{d.leakageRechargeCoeff}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TechCard>
            <TechCard title="各市给水度与砂层厚度">
              <div className="overflow-x-auto max-h-[250px] overflow-y-auto scrollbar-thin">
                <table className="w-full text-[11px]">
                  <thead className="sticky top-0 bg-gw-card"><tr className="border-b border-gw-border">
                    <th className="text-left text-gw-muted py-1.5 px-2">地区</th>
                    <th className="text-gw-muted py-1.5 px-2">砂厚(m)</th>
                    <th className="text-gw-muted py-1.5 px-2">给水度</th>
                    <th className="text-gw-muted py-1.5 px-2">静储量(亿m³)</th>
                  </tr></thead>
                  <tbody>
                    {regionSpecificYield.map((r, i) => (
                      <tr key={i} className="border-b border-gw-border/20">
                        <td className="py-1.5 px-2 font-medium text-gw-text">{r.region}</td>
                        <td className="py-1.5 px-2 font-mono text-center">{r.sandThickness}</td>
                        <td className="py-1.5 px-2 font-mono text-center">{r.specificYield}</td>
                        <td className="py-1.5 px-2 font-mono text-center">{r.staticReserve}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TechCard>
          </div>
        </div>
      )}

      {/* ═══════════════════ 径流与渗漏 ═══════════════════ */}
      {activeTab === 'runoff' && (
        <div className="space-y-4">
          <TechCard title="河流渗漏数据" badge="12条">
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead><tr className="border-b border-gw-border">
                  <th className="text-left text-gw-muted py-1.5 px-2">河流</th>
                  <th className="text-left text-gw-muted py-1.5 px-2">渗漏段</th>
                  <th className="text-gw-muted py-1.5 px-2">实测漏失(m³/s)</th>
                  <th className="text-gw-muted py-1.5 px-2">平均漏失(m³/s)</th>
                  <th className="text-left text-gw-muted py-1.5 px-2">备注</th>
                </tr></thead>
                <tbody>
                  {riverLeakageData.map((r, i) => (
                    <tr key={i} className="border-b border-gw-border/20 data-row">
                      <td className="py-1.5 px-2 font-medium text-gw-text">{r.river}</td>
                      <td className="py-1.5 px-2 text-gw-muted text-[10px]">{r.section}</td>
                      <td className="py-1.5 px-2 font-mono text-center">{r.measuredLeakage}</td>
                      <td className="py-1.5 px-2 font-mono text-center">{r.avgLeakage}</td>
                      <td className="py-1.5 px-2 text-gw-muted text-[10px]">{r.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TechCard>

          <TechCard title="山区径流模数" badge="L/(s·km²)">
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead><tr className="border-b border-gw-border">
                  <th className="text-left text-gw-muted py-1.5 px-2">岩性组合</th>
                  <th className="text-gw-muted py-1.5 px-2">范围</th>
                  <th className="text-gw-muted py-1.5 px-2">平均值</th>
                </tr></thead>
                <tbody>
                  {mountainRunoffModulus.map((m, i) => (
                    <tr key={i} className="border-b border-gw-border/20">
                      <td className="py-1.5 px-2 font-medium text-gw-text">{m.rockType}</td>
                      <td className="py-1.5 px-2 font-mono text-center">{m.range}</td>
                      <td className="py-1.5 px-2 font-mono text-center">{m.average}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TechCard>
        </div>
      )}

      {/* ═══════════════════ 盆地参数 ═══════════════════ */}
      {activeTab === 'basin' && (
        <div className="space-y-4">
          <TechCard title="邯邢地区岩溶水参数" badge="抽水/注水试验">
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead><tr className="border-b border-gw-border">
                  <th className="text-left text-gw-muted py-1.5 px-2">位置</th>
                  <th className="text-left text-gw-muted py-1.5 px-2">含水层</th>
                  <th className="text-gw-muted py-1.5 px-2">出水率(m³/(h·m))</th>
                  <th className="text-gw-muted py-1.5 px-2">方法</th>
                </tr></thead>
                <tbody>
                  {hanxingKarstParams.map((h, i) => (
                    <tr key={i} className="border-b border-gw-border/20 data-row">
                      <td className="py-1.5 px-2 font-medium text-gw-text">{h.location}</td>
                      <td className="py-1.5 px-2 text-gw-muted text-[10px]">{h.aquifer}</td>
                      <td className="py-1.5 px-2 font-mono text-center">{h.yieldRate}</td>
                      <td className="py-1.5 px-2 text-center text-[10px]">{h.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TechCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TechCard title="怀来盆地冲洪积扇分段参数">
              <div className="overflow-x-auto">
                <table className="w-full text-[10px]">
                  <thead><tr className="border-b border-gw-border">
                    <th className="text-left text-gw-muted py-1.5 px-1.5">位置</th>
                    <th className="text-left text-gw-muted py-1.5 px-1.5">岩性</th>
                    <th className="text-gw-muted py-1.5 px-1.5">厚度(m)</th>
                    <th className="text-gw-muted py-1.5 px-1.5">出水率</th>
                    <th className="text-gw-muted py-1.5 px-1.5">水位(m)</th>
                    <th className="text-gw-muted py-1.5 px-1.5">矿化度</th>
                  </tr></thead>
                  <tbody>
                    {huailaiBasinParams.map((h, i) => (
                      <tr key={i} className="border-b border-gw-border/20">
                        <td className="py-1.5 px-1.5 font-medium text-gw-text">{h.position}</td>
                        <td className="py-1.5 px-1.5 text-gw-muted text-[9px]">{h.lithology}</td>
                        <td className="py-1.5 px-1.5 font-mono text-center">{h.thickness}</td>
                        <td className="py-1.5 px-1.5 font-mono text-center">{h.yieldRate}</td>
                        <td className="py-1.5 px-1.5 font-mono text-center">{h.waterLevel}</td>
                        <td className="py-1.5 px-1.5 font-mono text-center">{h.salinity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TechCard>
            <TechCard title="各盆地含水层参数">
              <div className="overflow-x-auto max-h-[300px] overflow-y-auto scrollbar-thin">
                <table className="w-full text-[10px]">
                  <thead className="sticky top-0 bg-gw-card"><tr className="border-b border-gw-border">
                    <th className="text-left text-gw-muted py-1.5 px-1.5">位置</th>
                    <th className="text-left text-gw-muted py-1.5 px-1.5">岩性</th>
                    <th className="text-gw-muted py-1.5 px-1.5">厚度(m)</th>
                    <th className="text-gw-muted py-1.5 px-1.5">出水率</th>
                    <th className="text-gw-muted py-1.5 px-1.5">水位(m)</th>
                  </tr></thead>
                  <tbody>
                    {basinAquiferParams.map((b, i) => (
                      <tr key={i} className="border-b border-gw-border/20">
                        <td className="py-1.5 px-1.5 font-medium text-gw-text">{b.location}</td>
                        <td className="py-1.5 px-1.5 text-gw-muted text-[9px]">{b.lithology}</td>
                        <td className="py-1.5 px-1.5 font-mono text-center">{b.thickness}</td>
                        <td className="py-1.5 px-1.5 font-mono text-center">{b.yieldRate}</td>
                        <td className="py-1.5 px-1.5 font-mono text-center">{b.waterLevel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TechCard>
          </div>
        </div>
      )}

      {/* ═══════════════════ 工程地质 ═══════════════════ */}
      {activeTab === 'engineering' && (
        <div className="space-y-4">
          <TechCard title="水库工程地质" badge="6座大型水库">
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead><tr className="border-b border-gw-border">
                  <th className="text-left text-gw-muted py-1.5 px-2">水库名称</th>
                  <th className="text-left text-gw-muted py-1.5 px-2">位置</th>
                  <th className="text-left text-gw-muted py-1.5 px-2">坝型</th>
                  <th className="text-left text-gw-muted py-1.5 px-2">坝基岩性</th>
                </tr></thead>
                <tbody>
                  {reservoirGeology.map((r, i) => (
                    <tr key={i} className="border-b border-gw-border/20">
                      <td className="py-1.5 px-2 font-medium text-gw-text">{r.name}</td>
                      <td className="py-1.5 px-2 text-gw-muted text-[10px]">{r.location}</td>
                      <td className="py-1.5 px-2 text-center">{r.damType}</td>
                      <td className="py-1.5 px-2 text-gw-muted text-[10px]">{r.foundationRock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TechCard>

          <TechCard title="岩石力学参数" badge="抗压强度 kg/cm²">
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead><tr className="border-b border-gw-border">
                  <th className="text-left text-gw-muted py-1.5 px-2">位置</th>
                  <th className="text-left text-gw-muted py-1.5 px-2">岩石名称</th>
                  <th className="text-gw-muted py-1.5 px-2">干燥抗压</th>
                  <th className="text-gw-muted py-1.5 px-2">饱和抗压</th>
                </tr></thead>
                <tbody>
                  {rockMechanics.map((r, i) => (
                    <tr key={i} className="border-b border-gw-border/20">
                      <td className="py-1.5 px-2 font-medium text-gw-text">{r.location}</td>
                      <td className="py-1.5 px-2 text-gw-muted text-[10px]">{r.rockName}</td>
                      <td className="py-1.5 px-2 font-mono text-center">{r.compressiveDry}</td>
                      <td className="py-1.5 px-2 font-mono text-center">{r.compressiveSaturated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TechCard>

          <TechCard title="大型灌区工程数据">
            <div className="overflow-x-auto">
              <table className="w-full text-[10px]">
                <thead><tr className="border-b border-gw-border">
                  <th className="text-left text-gw-muted py-1.5 px-1.5">灌区</th>
                  <th className="text-left text-gw-muted py-1.5 px-1.5">水源</th>
                  <th className="text-gw-muted py-1.5 px-1.5">设计流量</th>
                  <th className="text-gw-muted py-1.5 px-1.5">实际流量</th>
                  <th className="text-gw-muted py-1.5 px-1.5">设计面积(万亩)</th>
                  <th className="text-gw-muted py-1.5 px-1.5">实际面积</th>
                  <th className="text-gw-muted py-1.5 px-1.5">渠系系数</th>
                </tr></thead>
                <tbody>
                  {largeIrrigationDistricts.map((d, i) => (
                    <tr key={i} className="border-b border-gw-border/20">
                      <td className="py-1.5 px-1.5 font-medium text-gw-text">{d.name}</td>
                      <td className="py-1.5 px-1.5 text-gw-muted text-[9px]">{d.waterSource}</td>
                      <td className="py-1.5 px-1.5 font-mono text-center">{d.designFlow}</td>
                      <td className="py-1.5 px-1.5 font-mono text-center">{d.actualFlow}</td>
                      <td className="py-1.5 px-1.5 font-mono text-center">{d.designArea}</td>
                      <td className="py-1.5 px-1.5 font-mono text-center">{d.actualArea}</td>
                      <td className="py-1.5 px-1.5 font-mono text-center">{d.efficiency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TechCard>
        </div>
      )}

      {/* ═══════════════════ 物探参数 ═══════════════════ */}
      {activeTab === 'geophysics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TechCard title="电阻率与矿化度对应关系">
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead><tr className="border-b border-gw-border">
                    <th className="text-gw-muted py-1.5 px-2">电阻率(Ω·m)</th>
                    <th className="text-gw-muted py-1.5 px-2">矿化度(g/L)</th>
                    <th className="text-left text-gw-muted py-1.5 px-2">水类型</th>
                  </tr></thead>
                  <tbody>
                    {resistivitySalinityRelation.map((r, i) => (
                      <tr key={i} className="border-b border-gw-border/20">
                        <td className="py-1.5 px-2 font-mono text-center">{r.resistivityRange}</td>
                        <td className="py-1.5 px-2 font-mono text-center">{r.salinityRange}</td>
                        <td className="py-1.5 px-2 text-gw-text">{r.waterType}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TechCard>
            <TechCard title="河北平原电阻率分区">
              <div className="overflow-x-auto">
                <table className="w-full text-[10px]">
                  <thead><tr className="border-b border-gw-border">
                    <th className="text-left text-gw-muted py-1.5 px-1.5">分区</th>
                    <th className="text-gw-muted py-1.5 px-1.5">砂层</th>
                    <th className="text-gw-muted py-1.5 px-1.5">亚砂土</th>
                    <th className="text-gw-muted py-1.5 px-1.5">亚粘土</th>
                    <th className="text-gw-muted py-1.5 px-1.5">粘土</th>
                  </tr></thead>
                  <tbody>
                    {plainResistivityZones.map((p, i) => (
                      <tr key={i} className="border-b border-gw-border/20">
                        <td className="py-1.5 px-1.5 font-medium text-gw-text">{p.hydroZone}</td>
                        <td className="py-1.5 px-1.5 font-mono text-center">{p.sand}</td>
                        <td className="py-1.5 px-1.5 font-mono text-center">{p.siltySand}</td>
                        <td className="py-1.5 px-1.5 font-mono text-center">{p.siltyClay}</td>
                        <td className="py-1.5 px-1.5 font-mono text-center">{p.clay}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TechCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TechCard title="岩性电阻率参数" badge="钓鱼台水库">
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead><tr className="border-b border-gw-border">
                    <th className="text-left text-gw-muted py-1.5 px-2">岩性</th>
                    <th className="text-gw-muted py-1.5 px-2">电阻率(Ω·m)</th>
                  </tr></thead>
                  <tbody>
                    {lithologyResistivity.map((l, i) => (
                      <tr key={i} className="border-b border-gw-border/20">
                        <td className="py-1.5 px-2 font-medium text-gw-text">{l.lithology}</td>
                        <td className="py-1.5 px-2 font-mono text-center">{l.resistivity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TechCard>
            <TechCard title="离子迁移率(18°C)">
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead><tr className="border-b border-gw-border">
                    <th className="text-left text-gw-muted py-1.5 px-2">离子</th>
                    <th className="text-gw-muted py-1.5 px-2">迁移率(×10⁻⁶ cm²/(s·V))</th>
                    <th className="text-left text-gw-muted py-1.5 px-2">类型</th>
                  </tr></thead>
                  <tbody>
                    {ionMobility.map((ion, i) => (
                      <tr key={i} className="border-b border-gw-border/20">
                        <td className="py-1.5 px-2 font-medium text-gw-text font-mono">{ion.ion}</td>
                        <td className="py-1.5 px-2 font-mono text-center">{ion.mobility}</td>
                        <td className="py-1.5 px-2 text-gw-muted text-[10px]">{ion.ionType}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TechCard>
          </div>
        </div>
      )}

      {/* ═══════════════════ 地层柱状 ═══════════════════ */}
      {activeTab === 'stratigraphy' && (
        <div className="space-y-4">
          <TechCard title="河北省地层柱状简表" badge="17个地层单元">
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto scrollbar-thin">
              <table className="w-full text-[10px]">
                <thead className="sticky top-0 bg-gw-card z-10"><tr className="border-b border-gw-border">
                  <th className="text-left text-gw-muted py-1.5 px-1.5">界</th>
                  <th className="text-left text-gw-muted py-1.5 px-1.5">系</th>
                  <th className="text-left text-gw-muted py-1.5 px-1.5">统/群</th>
                  <th className="text-gw-muted py-1.5 px-1.5">厚度(m)</th>
                  <th className="text-left text-gw-muted py-1.5 px-1.5">主要岩性</th>
                  <th className="text-left text-gw-muted py-1.5 px-1.5">含水意义</th>
                </tr></thead>
                <tbody>
                  {historicalStratigraphy.map((s, i) => (
                    <tr key={i} className="border-b border-gw-border/20 data-row">
                      <td className="py-1.5 px-1.5 font-medium text-gw-text">{s.era}</td>
                      <td className="py-1.5 px-1.5 text-gw-muted">{s.system}</td>
                      <td className="py-1.5 px-1.5 text-gw-muted">{s.series || s.group}</td>
                      <td className="py-1.5 px-1.5 font-mono text-center">{s.thickness}</td>
                      <td className="py-1.5 px-1.5 text-gw-muted">{s.mainLithology}</td>
                      <td className="py-1.5 px-1.5 text-gw-cyan text-[9px]">{s.aquiferNote}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TechCard>

          <TechCard title="承德地区水化学特征" badge="表18">
            <div className="overflow-x-auto">
              <table className="w-full text-[10px]">
                <thead><tr className="border-b border-gw-border">
                  <th className="text-left text-gw-muted py-1.5 px-1.5">成分</th>
                  <th className="text-gw-muted py-1.5 px-1.5">强烈侵蚀区(浅部)</th>
                  <th className="text-gw-muted py-1.5 px-1.5">侵蚀-堆积区(浅部)</th>
                  <th className="text-gw-muted py-1.5 px-1.5">侵蚀-堆积区(深部)</th>
                  <th className="text-gw-muted py-1.5 px-1.5">单位</th>
                </tr></thead>
                <tbody>
                  {chengdeHydrochemistry.map((c, i) => (
                    <tr key={i} className="border-b border-gw-border/20">
                      <td className="py-1.5 px-1.5 font-medium text-gw-text">{c.component}</td>
                      <td className="py-1.5 px-1.5 font-mono text-center">{c.strongErosion}</td>
                      <td className="py-1.5 px-1.5 font-mono text-center">{c.erosionDepositShallow}</td>
                      <td className="py-1.5 px-1.5 font-mono text-center">{c.erosionDepositDeep}</td>
                      <td className="py-1.5 px-1.5 text-gw-muted text-center">{c.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TechCard>
        </div>
      )}

      {activeTab === 'calculator' && <HistoricalParamCalculatorTab />}

      <ExportProgressDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        reportType="hydrogeology-historical"
        reportLabel="河北省历史水文地质参数汇编报告"
        data={getData()}
        dataLoading={dataLoading}
      />      <CrossLinkPanel currentPath="/hydrogeology-historical" />
      <DataSourceNote source="《河北省水文地质工程地质》(1980年代, OCR识别) | 河北瑞三元环境科技有限公司整理" />
    </div>
  );
}
