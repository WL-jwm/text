import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Line, ScatterChart, Scatter, Cell } from 'recharts';
import { Gauge, Layers, Zap } from 'lucide-react';
import {
  aquiferGroups,  lithologyMu, infiltrationCoeff,
  storageCoeff, dispersivity, karstParams, fractureParams
} from '../../data/hydroParams';
import { exportDataCSV } from '../../utils/exportUtils';
import {
  TechCard,  ExportButton,  CollapsiblePanel, TagFilter,
  ChartTooltip, CHART_COLORS,
} from '../UI';
import { FilterableTechTable } from '../FilterableTechTable';
import { ChartExport } from '../ChartExport';
import { useToast } from '../Toast';
import type {
  AquiferGroup, StorageCoeff, KarstParam, FractureParam,
  PermBarItem, MuBarItem, InfiltrationBarItem, DispersivityScatterItem
} from '../../types/hydroParams';

interface Props {
  lithFilter: string;
  setLithFilter: (v: string) => void;
  permFilter: string;
  setPermFilter: (v: string) => void;
  allLith: string[];
  allPerm: string[];
  filteredPerm: { lithology: string; Kh: string; Kv: string; ratio: string; source: string }[];
  filteredLith: { category: string; lithology: string; mu: string; K: string; ne: string; source: string }[];
  permBarData: PermBarItem[];
  muBarData: MuBarItem[];
  infiltrationBarData: InfiltrationBarItem[];
  dispersivityScatter: DispersivityScatterItem[];
}

export function HydroZoneDisplayTab({
  lithFilter, setLithFilter, permFilter, setPermFilter,
  allLith, allPerm, filteredPerm, filteredLith,
  permBarData, muBarData, infiltrationBarData, dispersivityScatter,
}: Props) {
  const { success } = useToast();

  return (
    <div className="space-y-4 md:space-y-6">
      {/* ── 含水层组参数 ── */}
      <CollapsiblePanel title="含水层组参数" defaultOpen>
        <FilterableTechTable
          filterPlaceholder="搜索含水层组..."
          headers={['含水层组', '时代', '性质', '深度(m)', '岩性', 'K(m/d)', 'T(m2/d)', 'mu', '矿化度']}
          rows={aquiferGroups.map((d: AquiferGroup) => [d.group, d.era, d.property, d.depth, d.lithology, d.K, d.T, d.mu, d.salinity])}
          pageSize={10}
        />
      </CollapsiblePanel>

      {/* ── 渗透系数 ── */}
      <CollapsiblePanel title="渗透系数Kh/Kv" defaultOpen>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <TechCard title="渗透系数Kh对比" icon={Gauge}>
            <div className="mb-2 flex justify-end">
              <ChartExport data={permBarData} filename="渗透系数Kh对比" sheetName="渗透系数" formats={['xlsx','csv','json']} label="导出数据" />
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={permBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gw-border, #1a2d4d)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 9 }} />
                <YAxis tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 9 }} />
                <ChartTooltip unit="m/d" />
                <Bar dataKey="Kh" fill="var(--gw-cyan, #06b6d4)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TechCard>

          <TechCard title="Kh/Kv对比" icon={Layers}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={permBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gw-border, #1a2d4d)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 9 }} />
                <YAxis tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 9 }} />
                <ChartTooltip unit="m/d" />
                <Bar dataKey="Kh" fill="var(--gw-cyan, #06b6d4)" name="Kh" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Kv" fill="var(--gw-blue, #3b82f6)" name="Kv" radius={[4, 4, 0, 0]} />
                <Legend wrapperStyle={{ fontSize: 9, color: 'var(--gw-muted, #64748b)' }} />
              </BarChart>
            </ResponsiveContainer>
          </TechCard>
        </div>

        <div className="mb-3 flex flex-wrap gap-2 items-center">
          <TagFilter tags={['全部', ...allPerm]} activeTag={permFilter} onTagChange={setPermFilter} />
          <div className="flex-1" />
          <ExportButton onClick={() => { exportDataCSV(filteredPerm as Record<string, unknown>[], 'permeability'); success('数据已导出'); }} label="导出" />
        </div>
        <FilterableTechTable
          filterPlaceholder="搜索渗透系数..."
          headers={['岩性', 'Kh(m/d)', 'Kv(m/d)', 'Kh/Kv', '来源']}
          rows={filteredPerm.map((d: { lithology: string; Kh: string; Kv: string; ratio: string; source: string }) => [d.lithology, d.Kh, d.Kv, d.ratio, d.source])}
          pageSize={10}
        />
      </CollapsiblePanel>

      {/* ── 给水度 ── */}
      <CollapsiblePanel title="给水度mu值">
        <div className="mb-4">
          <TechCard title="给水度mu与K关系" icon={Gauge}>
            <div className="mb-2 flex justify-end">
              <ChartExport data={muBarData} filename="给水度mu与K关系" sheetName="给水度" formats={['xlsx','csv','json']} label="导出数据" />
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={muBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gw-border, #1a2d4d)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 9 }} />
                <YAxis yAxisId="left" tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 9 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 9 }} />
                <ChartTooltip />
                <Bar yAxisId="left" dataKey="mu" fill="var(--gw-green, #10b981)" name="mu" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="K" stroke="var(--gw-cyan, #06b6d4)" name="K(m/d)" strokeWidth={2} dot={{ r: 3 }} />
                <Legend wrapperStyle={{ fontSize: 9, color: 'var(--gw-muted, #64748b)' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </TechCard>
        </div>

        <div className="mb-3 flex flex-wrap gap-2 items-center">
          <TagFilter tags={['全部', ...allLith]} activeTag={lithFilter} onTagChange={setLithFilter} />
          <div className="flex-1" />
          <ExportButton onClick={() => { exportDataCSV(filteredLith as Record<string, unknown>[], 'lithology-mu'); success('数据已导出'); }} label="导出" />
        </div>
        <FilterableTechTable
          filterPlaceholder="搜索给水度..."
          headers={['类别', '岩性', 'mu', 'K(m/d)', 'ne', '来源']}
          rows={filteredLith.map((d: { category: string; lithology: string; mu: string; K: string; ne: string; source: string }) => [d.category, d.lithology, d.mu, d.K, d.ne, d.source])}
          pageSize={10}
        />
      </CollapsiblePanel>

      {/* ── 降水入渗系数 ── */}
      <CollapsiblePanel title="降水入渗系数alpha">
        <div className="mb-4">
          <TechCard title="入渗系数对比" icon={Layers}>
            <div className="mb-2 flex justify-end">
              <ChartExport data={infiltrationBarData} filename="入渗系数对比" sheetName="入渗系数" formats={['xlsx','csv','json']} label="导出数据" />
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={infiltrationBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gw-border, #1a2d4d)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 9 }} />
                <YAxis tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 9 }} unit="%" />
                <ChartTooltip unit="%" />
                <Bar dataKey="平原区" fill="var(--gw-blue, #3b82f6)" name="平原区" radius={[4, 4, 0, 0]} />
                <Bar dataKey="山区" fill="var(--gw-green, #10b981)" name="山区" radius={[4, 4, 0, 0]} />
                <Legend wrapperStyle={{ fontSize: 9, color: 'var(--gw-muted, #64748b)' }} />
              </BarChart>
            </ResponsiveContainer>
          </TechCard>
        </div>

        <FilterableTechTable
          filterPlaceholder="搜索入渗系数..."
          headers={['岩性', '平原区', '山间盆地', '山区', '最佳埋深(m)', '备注']}
          rows={infiltrationCoeff.map((d: { lithology: string; plain: string; basin: string; mountain: string; optDepth: string; note: string }) => [d.lithology, d.plain, d.basin, d.mountain, d.optDepth, d.note])}
          pageSize={10}
        />
      </CollapsiblePanel>

      {/* ── 释水系数 + 弥散度 ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CollapsiblePanel title="承压含水层释水系数">
          <FilterableTechTable
            filterPlaceholder="搜索释水系数..."
            headers={['时代', '岩性', '弹性释水系数ue', '备注']}
            rows={storageCoeff.map((d: StorageCoeff) => [d.era, d.lithology, d.mu_e, d.note])}
          />
        </CollapsiblePanel>
        <CollapsiblePanel title="弥散度经验值">
          {dispersivityScatter.length > 0 && (
            <div className="mb-3">
              <ResponsiveContainer width="100%" height={180}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--gw-border, #1a2d4d)" />
                  <XAxis dataKey="aL" name="aL(m)" tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 9 }} />
                  <YAxis dataKey="aT" name="aT(m)" tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 9 }} />
                  <ChartTooltip unit="m" />
                  <Scatter data={dispersivityScatter} name="弥散度">
                    {dispersivityScatter.map((_: DispersivityScatterItem, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          )}
          <FilterableTechTable
            filterPlaceholder="搜索弥散度..."
            headers={['介质', '纵向弥散度aL(m)', '横向弥散度aT(m)', '备注']}
            rows={dispersivity.map((d: { medium: string; aL: string; aT: string; note: string }) => [d.medium, d.aL, d.aT, d.note])}
          />
        </CollapsiblePanel>
      </div>

      {/* ── 岩溶 + 裂隙 ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CollapsiblePanel title="岩溶水参数">
          <FilterableTechTable
            filterPlaceholder="搜索岩溶参数..."
            headers={['类型', 'K(m/d)', 'T(m2/d)', 'mu', '分布', '备注']}
            rows={karstParams.map((d: KarstParam) => [d.type, d.K, d.T, d.mu, d.area, d.note])}
          />
        </CollapsiblePanel>
        <CollapsiblePanel title="裂隙水参数">
          <FilterableTechTable
            filterPlaceholder="搜索裂隙参数..."
            headers={['类型', '岩性', 'K(m/d)', '泉流量(L/s)', '径流模数']}
            rows={fractureParams.map((d: FractureParam) => [d.type, d.lithology, d.K, d.springFlow, d.modulus])}
          />
        </CollapsiblePanel>
      </div>

      {/* C-4: 参数速查面板 */}
      <TechCard title="含水层参数速查" className="hud-corners" badge="C-4">
        <p className="text-[10px] text-gw-muted mb-3">统一查阅四类含水介质的关键水文地质参数，快速定位设计参数取值范围</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div className="text-center p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/15">
            <p className="text-[10px] text-gw-muted">孔隙水(松散层)</p>
            <p className="text-lg font-mono font-bold text-cyan-400">{aquiferGroups.length}</p>
            <p className="text-[10px] text-gw-muted">4个含水层组</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/15">
            <p className="text-[10px] text-gw-muted">给水度参数</p>
            <p className="text-lg font-mono font-bold text-emerald-400">{lithologyMu.length}</p>
            <p className="text-[10px] text-gw-muted">7种岩性</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-purple-500/10 border border-purple-500/15">
            <p className="text-[10px] text-gw-muted">岩溶水参数</p>
            <p className="text-lg font-mono font-bold text-purple-400">{karstParams.length}</p>
            <p className="text-[10px] text-gw-muted">4种溶蚀类型</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-amber-500/10 border border-amber-500/15">
            <p className="text-[10px] text-gw-muted">裂隙水参数</p>
            <p className="text-lg font-mono font-bold text-amber-400">{fractureParams.length}</p>
            <p className="text-[10px] text-gw-muted">4种裂隙类型</p>
          </div>
        </div>

        {/* 四类含水介质K值量级对比 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TechCard title="四类含水介质渗透系数量级对比" icon={Gauge}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={[
                { type: '粘土', Kmin: 0.001, Kmax: 0.05, fill: '#ef4444' },
                { type: '粉砂', Kmin: 0.5, Kmax: 5, fill: '#f59e0b' },
                { type: '细砂', Kmin: 2, Kmax: 15, fill: '#22c55e' },
                { type: '中砂', Kmin: 10, Kmax: 50, fill: '#10b981' },
                { type: '粗砂/卵石', Kmin: 20, Kmax: 500, fill: '#06b6d4' },
                { type: '溶洞管道', Kmin: 100, Kmax: 1000, fill: '#8b5cf6' },
                { type: '构造裂隙', Kmin: 0.01, Kmax: 20, fill: '#3b82f6' },
                { type: '风化裂隙', Kmin: 0.01, Kmax: 5, fill: '#64748b' },
              ]} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 70 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
                <XAxis type="number" tick={{ fill: '#8b9dc3', fontSize: 9 }} label={{ value: 'K(m/d)', position: 'insideBottom', offset: -3, style: { fill: '#8b9dc3', fontSize: 9 } }} />
                <YAxis dataKey="type" type="category" tick={{ fill: '#8b9dc3', fontSize: 10 }} width={65} />
                <Tooltip content={<ChartTooltip unit="m/d" title="渗透系数范围" />} />
                <Bar dataKey="Kmin" name="最小值" fill="#64748b" radius={[0, 2, 2, 0]} />
                <Bar dataKey="Kmax" name="最大值" fill="#06b6d4" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TechCard>

          <TechCard title="承压含水层释水系数(Storage)对比" icon={Layers}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={storageCoeff.map((s: StorageCoeff) => ({
                name: s.era.replace('(第一含水层组','').replace('(第二含水层组','').replace('(第三含水层组','').replace('(第四含水层组','').replace('(明化镇组下段',''),
                mu_e: parseFloat(s.mu_e.split('~')[0]),
                fill: parseFloat(s.mu_e.split('~')[0]) > 0.01 ? '#22c55e' : parseFloat(s.mu_e.split('~')[0]) > 0.001 ? '#f59e0b' : '#ef4444',
              }))} margin={{ top: 5, right: 20, bottom: 40, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
                <XAxis dataKey="name" tick={{ fill: '#8b9dc3', fontSize: 9 }} />
                <YAxis tick={{ fill: '#8b9dc3', fontSize: 9 }} label={{ value: 'S', angle: -90, position: 'insideLeft', style: { fill: '#8b9dc3', fontSize: 9 } }} />
                <Tooltip content={<ChartTooltip title="释水系数" />} />
                <Bar dataKey="mu_e" name="释水系数S" radius={[4, 4, 0, 0]}>
                  {storageCoeff.map((s: StorageCoeff) => {
                    const val = parseFloat(s.mu_e.split('~')[0]);
                    return <Cell key={s.era} fill={val > 0.01 ? '#22c55e' : val > 0.001 ? '#f59e0b' : '#ef4444'} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </TechCard>
        </div>

        {/* 速查表：按介质类型分类 */}
        <div className="space-y-3 mt-2">
          <h4 className="text-sm text-gw-text font-medium flex items-center gap-2"><Zap size={14} className="text-amber-400" /> 快速取值参考</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-gw-surface/50 border border-gw-border/30">
              <h5 className="text-xs font-medium text-gw-text mb-2">浅层潜水(Q3-4, 0~60m)</h5>
              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div><span className="text-gw-muted">mu:</span> <span className="text-gw-highlight font-mono">0.10~0.25</span></div>
                <div><span className="text-gw-muted">K:</span> <span className="text-gw-highlight font-mono">10~300 m/d</span></div>
                <div><span className="text-gw-muted">alpha:</span> <span className="text-gw-highlight font-mono">0.12~0.35</span></div>
                <div><span className="text-gw-muted">S:</span> <span className="text-gw-highlight font-mono">0.05~0.15</span></div>
                <div><span className="text-gw-muted">T:</span> <span className="text-gw-highlight font-mono">100~5000 m2/d</span></div>
                <div><span className="text-gw-muted">aL:</span> <span className="text-gw-highlight font-mono">5~50 m</span></div>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-gw-surface/50 border border-gw-border/30">
              <h5 className="text-xs font-medium text-gw-text mb-2">深层承压水(N2, 350~600m)</h5>
              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div><span className="text-gw-muted">mu:</span> <span className="text-gw-highlight font-mono">0.005~0.03</span></div>
                <div><span className="text-gw-muted">K:</span> <span className="text-gw-highlight font-mono">0.1~5 m/d</span></div>
                <div><span className="text-gw-muted">alpha:</span> <span className="text-gw-highlight font-mono">—</span></div>
                <div><span className="text-gw-muted">S:</span> <span className="text-gw-highlight font-mono">0.0005~0.002</span></div>
                <div><span className="text-gw-muted">T:</span> <span className="text-gw-highlight font-mono">5~100 m2/d</span></div>
                <div><span className="text-gw-muted">aL:</span> <span className="text-gw-highlight font-mono">—</span></div>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-gw-surface/50 border border-gw-border/30">
              <h5 className="text-xs font-medium text-gw-text mb-2">岩溶水(溶洞管道)</h5>
              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div><span className="text-gw-muted">mu:</span> <span className="text-gw-highlight font-mono">0.05~0.20</span></div>
                <div><span className="text-gw-muted">K:</span> <span className="text-gw-highlight font-mono">100~1000+ m/d</span></div>
                <div><span className="text-gw-muted">S:</span> <span className="text-gw-highlight font-mono">—</span></div>
                <div><span className="text-gw-muted">T:</span> <span className="text-gw-highlight font-mono">1000~50000+ m2/d</span></div>
                <div><span className="text-gw-muted">aL:</span> <span className="text-gw-highlight font-mono">50~500 m</span></div>
                <div><span className="text-gw-muted">代表:</span> <span className="text-gw-text">黑龙洞/百泉/涞源</span></div>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-gw-surface/50 border border-gw-border/30">
              <h5 className="text-xs font-medium text-gw-text mb-2">裂隙水(构造裂隙)</h5>
              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div><span className="text-gw-muted">K:</span> <span className="text-gw-highlight font-mono">0.01~20 m/d</span></div>
                <div><span className="text-gw-muted">泉流量:</span> <span className="text-gw-highlight font-mono">0.1~10 L/s</span></div>
              </div>
            </div>
          </div>
        </div>
      </TechCard>
    </div>
  );
}
