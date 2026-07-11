import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Mountain, Layers, Grid3X3, BookOpen, Droplets, Shield, FlaskConical, Clock } from 'lucide-react';
import { stratigraphyAquifer, tectonicUnits, geology } from '../data/geology';
import { stratigraphyLayers, weatheringThickness, rockCompressiveStrength } from '../data/hydrogeologyReference';
import { SectionTitle, TechCard, ChartTooltip, DataSourceNote } from '../components/UI';
import { CrossLinkPanel } from '../components/CrossLink';
import { LazyChartCard } from '../components/LazyChartCard';
import { GeologyOverviewTab } from '../components/geology/GeologyOverviewTab';
import { GeologyAquiferTab } from '../components/geology/GeologyAquiferTab';
import { GeologyTectonicTab } from '../components/geology/GeologyTectonicTab';
import { GeologyStratigraphyTab } from '../components/geology/GeologyStratigraphyTab';
import { GeologyFunctionTab } from '../components/geology/GeologyFunctionTab';
import { GeologyBackgroundTab } from '../components/geology/GeologyBackgroundTab';
import { GeologyHistoryTab } from '../components/geology/GeologyHistoryTab';

import { usePageCommons } from '../hooks/usePageCommons'
// 注册报告生成器
const TABS = [
  { key: 'overview', label: '地质概览', icon: Mountain },
  { key: 'aquifer', label: '含水层组', icon: Layers },
  { key: 'tectonic', label: '构造单元', icon: Grid3X3 },
  { key: 'stratigraphy', label: '地层与岩性', icon: BookOpen },
  { key: 'function', label: '功能分区', icon: Shield },
  { key: 'background', label: '背景值', icon: FlaskConical },
  { key: 'history', label: '地质发展史', icon: Clock },
] as const;
type TabKey = typeof TABS[number]['key'];

export function Geology() {

  usePageCommons({
    pageName: 'geology',
    collector: async () => ({ geology }),
  });

  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  // 报告数据预采集（增量缓存）
  return (
    <div className="p-6 max-w-[1440px] mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gw-text">基础地质</h1>
        <p className="text-xs text-gw-muted mt-1">地质构造 / 地层岩性 / 含水层组划分</p>
      </div>

      <div className="flex gap-1 bg-gw-surface rounded-lg p-1">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs transition-all ${activeTab === tab.key ? 'bg-gw-blue/15 text-gw-highlight border border-gw-blue/30' : 'text-gw-muted hover:text-gw-text'}`}>
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <GeologyOverviewTab />}
      {activeTab === 'aquifer' && <GeologyAquiferTab />}
      {activeTab === 'tectonic' && <GeologyTectonicTab />}
      {activeTab === 'stratigraphy' && <GeologyStratigraphyTab />}
      {activeTab === 'function' && <GeologyFunctionTab />}
      {activeTab === 'background' && <GeologyBackgroundTab />}
      {activeTab === 'history' && <GeologyHistoryTab />}

      {/* ═══════════════════ 地层-含水介质-构造 综合分析 ═══════════════════ */}
      <SectionTitle icon={BookOpen} badge="综合分析" >地层-构造-含水关系</SectionTitle>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="各时代地层含水特征对比" className="scan-line" height={280}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stratigraphyAquifer.map(s => ({
              name: s.era.length > 4 ? s.era.slice(0,4) : s.era,
              出露面积: parseFloat(String(s.areaPercent || '0')),
              富水性: s.productivity === '高' ? 3 : s.productivity === '中' ? 2 : 1,
            }))} margin={{ left: 0, right: 10 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#1a2d4d" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={9} />
              <YAxis stroke="#64748b" fontSize={9} />
              <Tooltip content={<ChartTooltip title="地层含水特征" />} />
              <Legend wrapperStyle={{ fontSize: 9 }} />
              <Bar dataKey="出露面积" fill="#3b82f6" radius={[2, 2, 0, 0]} name="面积占比(%)" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1">
            {stratigraphyAquifer.map((s, i: number) => (
              <div key={i} className="flex items-center justify-between text-[9px] px-2 py-0.5 bg-gw-surface/50 rounded hover:bg-gw-surface/80">
                <span className="text-gw-muted">{s.era} · {s.period}</span>
                <span className={`font-medium ${s.aquiferType.includes('岩溶') ? 'text-cyan-400' : s.aquiferType.includes('孔隙') ? 'text-blue-400' : 'text-amber-400'}`}>
                  {s.aquiferType}
                </span>
              </div>
            ))}
          </div>
        </LazyChartCard>

        <TechCard title="构造单元含水特征卡片" className="hud-corners">
          <div className="space-y-2">
            {tectonicUnits.map((t, i: number) => (
              <div key={i} className="p-2 bg-gw-surface/50 rounded-lg border border-gw-border/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gw-text">{t.unit}</span>
                  <span className="text-[9px] font-mono text-blue-400">{t.area}</span>
                </div>
                <p className="text-[9px] text-gw-muted/70 mb-1">{t.features}</p>
                <div className="flex items-center gap-1">
                  <Droplets size={10} className="text-cyan-400" />
                  <span className="text-[9px] text-cyan-300">{t.aquiferCharacteristics}</span>
                </div>
              </div>
            ))}
          </div>
        </TechCard>
      </div>

      {/* ═══════════════════ 经典地层详表(1980s) ═══════════════════ */}
      <TechCard title="河北省地层岩性详表" badge="经典参考" className="mt-4">
        <p className="text-[10px] text-gw-muted mb-2">数据来源：《河北省水文地质工程地质》（1980s），含主要含水层位标注</p>
        <div className="overflow-x-auto max-h-[350px] overflow-y-auto scrollbar-thin">
          <table className="w-full text-[10px]">
            <thead className="sticky top-0 bg-gw-card"><tr className="border-b border-gw-border">
              <th className="text-left text-gw-muted py-1.5 px-2">地层界</th>
              <th className="text-left text-gw-muted py-1.5 px-2">地层系</th>
              <th className="text-gw-muted py-1.5 px-2">统</th>
              <th className="text-gw-muted py-1.5 px-2">代号</th>
              <th className="text-gw-muted py-1.5 px-2">厚度(m)</th>
              <th className="text-left text-gw-muted py-1.5 px-2">岩性描述</th>
            </tr></thead>
            <tbody>
              {stratigraphyLayers.map((s, i) => (
                <tr key={i} className="border-b border-gw-border/20 hover:bg-gw-surface/50">
                  <td className="py-1 px-2 font-medium text-gw-text">{s.era}</td>
                  <td className="py-1 px-2">{s.system}</td>
                  <td className="py-1 px-2 text-gw-muted">{s.series}</td>
                  <td className="py-1 px-2 font-mono text-gw-cyan">{s.code}</td>
                  <td className="py-1 px-2 font-mono">{s.thickness}</td>
                  <td className="py-1 px-2 max-w-[300px]">{s.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>

      {/* 风化带厚度 + 抗压强度 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <TechCard title="岩石风化带厚度" badge="工程地质">
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]">
              <thead><tr className="border-b border-gw-border">
                <th className="text-left text-gw-muted py-1 px-1.5">岩性</th>
                <th className="text-gw-muted py-1 px-1.5">全风化(m)</th>
                <th className="text-gw-muted py-1 px-1.5">半风化(m)</th>
                <th className="text-left text-gw-muted py-1 px-1.5">备注</th>
              </tr></thead>
              <tbody>
                {weatheringThickness.map((w, i) => (
                  <tr key={i} className="border-b border-gw-border/20">
                    <td className="py-1 px-1.5 text-gw-text">{w.lithology}</td>
                    <td className="py-1 px-1.5 font-mono text-gw-cyan">{w.full}</td>
                    <td className="py-1 px-1.5 font-mono">{w.half || '-'}</td>
                    <td className="py-1 px-1.5 text-gw-muted">{w.note || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TechCard>

        <TechCard title="水库坝基岩石抗压强度" badge="表249">
          <div className="overflow-x-auto max-h-[250px] overflow-y-auto scrollbar-thin">
            <table className="w-full text-[10px]">
              <thead className="sticky top-0 bg-gw-card"><tr className="border-b border-gw-border">
                <th className="text-left text-gw-muted py-1 px-1">水库</th>
                <th className="text-left text-gw-muted py-1 px-1">岩石</th>
                <th className="text-gw-muted py-1 px-1">干燥(kg/cm²)</th>
                <th className="text-gw-muted py-1 px-1">饱和(kg/cm²)</th>
              </tr></thead>
              <tbody>
                {rockCompressiveStrength.slice(0, 20).map((r, i) => (
                  <tr key={i} className="border-b border-gw-border/20">
                    <td className="py-1 px-1 text-gw-text">{r.reservoir}</td>
                    <td className="py-1 px-1">{r.rock}</td>
                    <td className="py-1 px-1 font-mono text-gw-cyan">{r.dry}</td>
                    <td className="py-1 px-1 font-mono">{r.saturated ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[9px] text-gw-muted mt-1">共{rockCompressiveStrength.length}组试验数据（仅显示前20组）</p>
        </TechCard>
      </div>

      <DataSourceNote source="1999年《河北省地下水》| 河北省地质矿产勘查开发局 + 《河北省水文地质工程地质》(1980s)" />
      <CrossLinkPanel currentPath="/geology" />
    </div>
  );
}
