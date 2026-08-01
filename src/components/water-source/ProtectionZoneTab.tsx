/**
 * B-10 水源地保护区划分 Tab
 *
 * 5大面板：
 *  1. 计算器 — 输入水文地质参数 → 计算保护区半径/面积
 *  2. 同心圆图 — 保护区可视化（一级/二级/准保护区嵌套）
 *  3. 预设水源地 — 8个河北重要水源地保护区一览
 *  4. 经验值参考表 — HJ/T 338-2007附录A查表
 *  5. 介质参数参考 — 有效孔隙度/渗透系数
 */
import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { Shield, Calculator, MapPin, BookOpen, Layers } from 'lucide-react';
import { TechCard, StatCard, DataSourceNote } from '../UI';
import { PipelinePanel } from '../PipelinePanel';
import { LazyChartCard } from '../LazyChartCard';
import { ChartExport } from '../ChartExport';
import { FilterableTechTable } from '../FilterableTechTable';
import {
  ZONE_LEVELS,
  TRAVEL_TIMES,
  MEDIUM_POROSITY,
  EMPIRICAL_RADII,
  type SourceType,
  type AnalyticInput,
  type ProtectionZoneResult,
  calcProtectionZone,
  calcAllPresets,
} from '../../utils/protectionZoneCalculator';

const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
};

const SOURCE_TYPES: SourceType[] = ['孔隙水-潜水', '孔隙水-承压', '岩溶水', '裂隙水'];
const SCALES = ['小型', '中型', '大型', '特大型'] as const;
const MEDIUM_NAMES = Object.keys(MEDIUM_POROSITY);

// ── 同心圆SVG图 ──

function ZoneConcentricSVG({ result }: { result: ProtectionZoneResult | null }) {
  if (!result) {
    return (
      <div className="flex items-center justify-center h-[400px] text-gw-muted text-sm">
        请先计算保护区参数
      </div>
    );
  }

  const maxRadius = result.zones[result.zones.length - 1].radius;
  const svgSize = 400;
  const center = svgSize / 2;
  const maxDisplayR = 170;
  const scale = maxDisplayR / maxRadius;

  return (
    <div className="flex flex-col items-center">
      <svg width={svgSize} height={svgSize} className="max-w-full">
        {/* 准保护区（最外圈） */}
        {result.zones[2] && (
          <circle
            cx={center} cy={center}
            r={result.zones[2].radius * scale}
            fill={ZONE_LEVELS['准保护区'].color + '15'}
            stroke={ZONE_LEVELS['准保护区'].color}
            strokeWidth={1.5}
            strokeDasharray="4 2"
          />
        )}
        {/* 二级保护区 */}
        {result.zones[1] && (
          <circle
            cx={center} cy={center}
            r={result.zones[1].radius * scale}
            fill={ZONE_LEVELS['二级'].color + '20'}
            stroke={ZONE_LEVELS['二级'].color}
            strokeWidth={1.5}
          />
        )}
        {/* 一级保护区 */}
        {result.zones[0] && (
          <circle
            cx={center} cy={center}
            r={Math.max(result.zones[0].radius * scale, 8)}
            fill={ZONE_LEVELS['一级'].color + '30'}
            stroke={ZONE_LEVELS['一级'].color}
            strokeWidth={2}
          />
        )}
        {/* 取水井 */}
        <circle cx={center} cy={center} r={4} fill="#fff" stroke="#1e293b" strokeWidth={1} />
        <text x={center + 8} y={center - 4} fontSize={9} fill="#9ca3af">取水井</text>

        {/* 半径标注线 */}
        {result.zones.map((zone, i) => {
          const r = zone.radius * scale;
          if (r < 12) return null;
          const angle = -45 - i * 25;
          const rad = (angle * Math.PI) / 180;
          const x2 = center + r * Math.cos(rad);
          const y2 = center + r * Math.sin(rad);
          return (
            <g key={i}>
              <line x1={center} y1={center} x2={x2} y2={y2} stroke={zone.color} strokeWidth={1} strokeDasharray="2 2" />
              <text x={x2 + 4} y={y2 + 4} fontSize={9} fill={zone.color} fontWeight="bold">
                {zone.level}: {zone.radius}m
              </text>
            </g>
          );
        })}
      </svg>
      {/* 图例 */}
      <div className="flex gap-4 mt-2 text-xs">
        {result.zones.map(z => (
          <span key={z.level} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: z.color }} />
            <span style={{ color: z.color }}>{z.level}</span>
            <span className="text-gw-muted">R={z.radius}m A={z.area}km²</span>
          </span>
        ))}
      </div>
      <PipelinePanel moduleId="protectionZone" onReceive={(dataType, payload) => {
        if (dataType === 'aquiferParams') {
          const parts: string[] = [];
          if (payload.hydraulicConductivity) parts.push(`K=${payload.hydraulicConductivity} m/d`);
          if (payload.hydraulicGradient) parts.push(`I=${payload.hydraulicGradient}`);
          if (parts.length > 0) alert(`已接收含水层参数:\n${parts.join(', ')}\n\n请手动更新保护区划分参数。`);
        }
      }} />
    </div>
  );
}

// ── 面板1: 计算器 ──

function CalculatorPanel() {
  const [sourceName, setSourceName] = useState('自定义水源地');
  const [sourceType, setSourceType] = useState<SourceType>('孔隙水-潜水');
  const [scale, setScale] = useState<typeof SCALES[number]>('大型');
  const [medium, setMedium] = useState('砾石卵石');
  const [K, setK] = useState(150);
  const [I, setI] = useState(0.003);
  const [ne, setNe] = useState(0.25);
  const [M, setM] = useState(50);
  const [Q, setQ] = useState(12000);
  const [rw, setRw] = useState(0.3);

  const onMediumChange = (name: string) => {
    setMedium(name);
    const info = MEDIUM_POROSITY[name];
    if (info) {
      setK(info.K);
      setNe(info.ne);
    }
  };

  const result = useMemo(() => {
    const input: AnalyticInput = { K, I, ne, M, Q, rw };
    return calcProtectionZone(sourceName, sourceType, input, scale);
  }, [sourceName, sourceType, K, I, ne, M, Q, rw, scale]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 输入区 */}
        <TechCard icon={Calculator} title="保护区划分参数" badge="输入">
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gw-muted">水源地名称</label>
              <input type="text" value={sourceName} onChange={e => setSourceName(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gw-muted">水源地类型</label>
                <select value={sourceType} onChange={e => setSourceType(e.target.value as SourceType)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm">
                  {SOURCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gw-muted">规模</label>
                <select value={scale} onChange={e => setScale(e.target.value as typeof SCALES[number])}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm">
                  {SCALES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-gw-muted">含水层介质（选择后自动填充K和n_e）</label>
              <select value={medium} onChange={e => onMediumChange(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm">
                {MEDIUM_NAMES.map(m => <option key={m} value={m}>{m}（K={MEDIUM_POROSITY[m].K} m/d, ne={MEDIUM_POROSITY[m].ne}）</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gw-muted">渗透系数 K (m/d)</label>
                <input type="number" step="any" value={K} onChange={e => setK(Number(e.target.value) || 0)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm" />
              </div>
              <div>
                <label className="text-xs text-gw-muted">水力坡度 I</label>
                <input type="number" step="any" value={I} onChange={e => setI(Number(e.target.value) || 0)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm" />
              </div>
              <div>
                <label className="text-xs text-gw-muted">有效孔隙度 n_e</label>
                <input type="number" step="any" value={ne} onChange={e => setNe(Number(e.target.value) || 0)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm" />
              </div>
              <div>
                <label className="text-xs text-gw-muted">含水层厚度 M (m)</label>
                <input type="number" step="any" value={M} onChange={e => setM(Number(e.target.value) || 0)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm" />
              </div>
              <div>
                <label className="text-xs text-gw-muted">开采量 Q (m³/d)</label>
                <input type="number" step="any" value={Q} onChange={e => setQ(Number(e.target.value) || 0)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm" />
              </div>
              <div>
                <label className="text-xs text-gw-muted">井半径 r_w (m)</label>
                <input type="number" step="any" value={rw} onChange={e => setRw(Number(e.target.value) || 0)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm" />
              </div>
            </div>
          </div>
        </TechCard>

        {/* 同心圆可视化 */}
        <TechCard icon={Shield} title="保护区同心圆示意图">
          <ZoneConcentricSVG result={result} />
        </TechCard>
      </div>

      {/* 结果表 */}
      <TechCard icon={Layers} title="保护区划分结果" badge={result.methodSummary}>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <StatCard title="一级保护区" value={`${result.primaryRadius}`} unit="m" subtitle={`面积 ${result.zones[0]?.area || 0} km²`} accent="red" />
          <StatCard title="二级保护区" value={`${result.secondaryRadius}`} unit="m" subtitle={`面积 ${result.zones[1]?.area || 0} km²`} accent="amber" />
          <StatCard title="总保护区面积" value={`${result.totalArea}`} unit="km²" subtitle="含准保护区" accent="blue" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gw-border">
                <th className="text-left p-2 text-gw-muted">保护区级别</th>
                <th className="text-right p-2 text-gw-muted">半径 (m)</th>
                <th className="text-right p-2 text-gw-muted">面积 (km²)</th>
                <th className="text-left p-2 text-gw-muted">划分方法</th>
                <th className="text-left p-2 text-gw-muted">计算依据</th>
              </tr>
            </thead>
            <tbody>
              {result.zones.map(z => (
                <tr key={z.level} className="border-b border-gw-border/50 hover:bg-gw-surface/50">
                  <td className="p-2">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: z.color }} />
                      <span className="font-medium" style={{ color: z.color }}>{z.level}保护区</span>
                    </span>
                  </td>
                  <td className="p-2 text-right font-mono text-gw-text">{z.radius}</td>
                  <td className="p-2 text-right font-mono text-gw-text">{z.area}</td>
                  <td className="p-2 text-gw-muted">{z.method}</td>
                  <td className="p-2 text-gw-muted text-[11px]">{z.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>
      <PipelinePanel moduleId="protectionZone" onReceive={(dataType, payload) => {
        if (dataType === 'aquiferParams') {
          const parts: string[] = [];
          if (payload.hydraulicConductivity) parts.push(`K=${payload.hydraulicConductivity} m/d`);
          if (payload.hydraulicGradient) parts.push(`I=${payload.hydraulicGradient}`);
          if (parts.length > 0) alert(`已接收含水层参数:\n${parts.join(', ')}\n\n请手动更新保护区划分参数。`);
        }
      }} />
    </div>
  );
}

// ── 面板2: 预设水源地一览 ──

function PresetSourcesPanel() {
  const results = useMemo(() => calcAllPresets(), []);

  const barData = useMemo(() =>
    results.map(r => ({
      name: r.sourceName.replace('水源地', ''),
      '一级': r.primaryRadius,
      '二级': r.secondaryRadius,
    })),
    [results],
  );

  const areaData = useMemo(() =>
    results.map(r => ({
      name: r.sourceName.replace('水源地', ''),
      '一级面积': r.zones[0]?.area || 0,
      '二级面积': r.zones[1]?.area || 0,
      '总面积': r.totalArea,
    })),
    [results],
  );

  return (
    <div className="space-y-4">
      <TechCard icon={MapPin} title="河北重要水源地保护区划分一览" badge={`${results.length}个水源地`}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gw-border">
                <th className="text-left p-2 text-gw-muted">水源地</th>
                <th className="text-left p-2 text-gw-muted">类型</th>
                <th className="text-right p-2 text-gw-muted">一级R(m)</th>
                <th className="text-right p-2 text-gw-muted">一级A(km²)</th>
                <th className="text-right p-2 text-gw-muted">二级R(m)</th>
                <th className="text-right p-2 text-gw-muted">二级A(km²)</th>
                <th className="text-right p-2 text-gw-muted">总面积(km²)</th>
                <th className="text-left p-2 text-gw-muted">划分方法</th>
              </tr>
            </thead>
            <tbody>
              {results.map(r => (
                <tr key={r.sourceName} className="border-b border-gw-border/50 hover:bg-gw-surface/50">
                  <td className="p-2 font-medium text-gw-text">{r.sourceName}</td>
                  <td className="p-2 text-gw-muted">{r.sourceType}</td>
                  <td className="p-2 text-right font-mono text-red-400">{r.primaryRadius}</td>
                  <td className="p-2 text-right font-mono text-gw-muted">{r.zones[0]?.area || 0}</td>
                  <td className="p-2 text-right font-mono text-amber-400">{r.secondaryRadius}</td>
                  <td className="p-2 text-right font-mono text-gw-muted">{r.zones[1]?.area || 0}</td>
                  <td className="p-2 text-right font-mono font-semibold text-blue-400">{r.totalArea}</td>
                  <td className="p-2 text-gw-muted text-[11px]">{r.methodSummary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="各水源地保护区半径对比" height={350}>
          <div className="mb-2 flex justify-end">
            <ChartExport data={barData} filename="水源地保护区半径" sheetName="保护区半径" formats={['xlsx', 'csv', 'json']} label="导出数据" />
          </div>
          <ResponsiveContainer width="100%" height={290}>
            <BarChart data={barData} margin={{ top: 5, right: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} angle={-30} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} unit="m" />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="一级" fill="#ef4444" radius={[2, 2, 0, 0]} />
              <Bar dataKey="二级" fill="#f59e0b" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <LazyChartCard title="各水源地保护区面积对比" height={350}>
          <div className="mb-2 flex justify-end">
            <ChartExport data={areaData} filename="水源地保护区面积" sheetName="保护区面积" formats={['xlsx', 'csv', 'json']} label="导出数据" />
          </div>
          <ResponsiveContainer width="100%" height={290}>
            <BarChart data={areaData} margin={{ top: 5, right: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} angle={-30} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} unit="km²" />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="一级面积" stackId="a" fill="#ef4444" />
              <Bar dataKey="二级面积" stackId="a" fill="#f59e0b" />
              <Bar dataKey="总面积" fill="#3b82f6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>
      <PipelinePanel moduleId="protectionZone" onReceive={(dataType, payload) => {
        if (dataType === 'aquiferParams') {
          const parts: string[] = [];
          if (payload.hydraulicConductivity) parts.push(`K=${payload.hydraulicConductivity} m/d`);
          if (payload.hydraulicGradient) parts.push(`I=${payload.hydraulicGradient}`);
          if (parts.length > 0) alert(`已接收含水层参数:\n${parts.join(', ')}\n\n请手动更新保护区划分参数。`);
        }
      }} />
    </div>
  );
}

// ── 面板3: 经验值参考表 ──

function EmpiricalTablePanel() {
  const allRows = useMemo(() => {
    const rows: Array<{ type: string; scale: string; primary: number; secondary: number; note: string }> = [];
    (Object.keys(EMPIRICAL_RADII) as SourceType[]).forEach(type => {
      SCALES.forEach(scale => {
        const r = EMPIRICAL_RADII[type][scale];
        rows.push({ type, scale, primary: r.primary, secondary: r.secondary, note: r.note });
      });
    });
    return rows;
  }, []);

  return (
    <TechCard icon={BookOpen} title="HJ/T 338-2007 经验半径参考表" badge="附录A">
      <p className="text-xs text-gw-muted mb-3">根据水源地类型和规模查表确定保护区经验半径。实际应用中应结合解析法和水文地质条件综合确定。</p>
      <FilterableTechTable
        headers={['水源地类型', '规模', '一级R(m)', '二级R(m)', '说明']}
        rows={allRows.map(r => [r.type, r.scale, String(r.primary), String(r.secondary), r.note])}
        filterPlaceholder="搜索类型或规模..."
      />
    </TechCard>
  );
}

// ── 面板4: 介质参数参考 ──

function MediumParamPanel() {
  return (
    <TechCard icon={Layers} title="含水层介质参数参考表">
      <p className="text-xs text-gw-muted mb-3">常用含水层介质的有效孔隙度和渗透系数参考值，选择介质后可自动填充计算器参数。</p>
      <FilterableTechTable
        headers={['含水层介质', '有效孔隙度 n_e', '渗透系数 K (m/d)', '说明']}
        rows={Object.entries(MEDIUM_POROSITY).map(([name, info]) => [
          name,
          String(info.ne),
          String(info.K),
          info.description,
        ])}
        filterPlaceholder="搜索介质名称..."
      />
      <div className="mt-3 p-3 rounded-lg bg-gw-surface text-xs text-gw-muted">
        <p className="font-medium text-gw-text mb-1">解析法公式（孔隙水潜水）</p>
        <p className="font-mono text-blue-400">R = (K × I × T) / n_e</p>
        <p className="mt-1">其中：K=渗透系数(m/d)，I=水力坡度，T=迁移时间(d)，n_e=有效孔隙度</p>
        <p className="mt-1">时间标准：一级保护区 T₁ = {TRAVEL_TIMES.primaryDays}天，二级保护区 T₂ = {TRAVEL_TIMES.secondaryDays}天</p>
      </div>
    </TechCard>
  );
}

// ═══════════════════════════════════════════════════════
// 主组件
// ═══════════════════════════════════════════════════════

const SUB_TABS = [
  { key: 'calc', label: '保护区计算器', icon: Calculator },
  { key: 'preset', label: '预设水源地', icon: MapPin },
  { key: 'empirical', label: '经验值参考', icon: BookOpen },
  { key: 'medium', label: '介质参数', icon: Layers },
] as const;

type SubTabKey = typeof SUB_TABS[number]['key'];

export function ProtectionZoneTab() {
  const [activeSubTab, setActiveSubTab] = useState<SubTabKey>('calc');

  return (
    <div className="space-y-6">
      {/* 横幅 */}
      <div className="p-3 rounded-lg bg-gradient-to-r from-red-500/10 to-blue-500/10 border border-red-500/20">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-red-400" />
          <span className="text-sm text-red-400 font-medium">水源地保护区划分辅助系统</span>
        </div>
        <p className="text-xs text-gw-muted mt-1">基于 HJ/T 338-2007《饮用水水源保护区划分技术规范》，支持解析法（水质点迁移时间法）和经验法，适用于孔隙水/岩溶水/承压水/裂隙水水源地</p>
      </div>

      {/* 子Tab */}
      <div className="flex gap-1 bg-gw-surface rounded-lg p-1 overflow-x-auto scrollbar-none flex-wrap">
        {SUB_TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveSubTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs transition-all whitespace-nowrap ${activeSubTab === tab.key ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30' : 'text-gw-muted hover:text-gw-text'}`}>
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeSubTab === 'calc' && <CalculatorPanel />}
      {activeSubTab === 'preset' && <PresetSourcesPanel />}
      {activeSubTab === 'empirical' && <EmpiricalTablePanel />}
      {activeSubTab === 'medium' && <MediumParamPanel />}

      <DataSourceNote source="HJ/T 338-2007 饮用水水源保护区划分技术规范 | 河北省重要水源地资料" />
      <PipelinePanel moduleId="protectionZone" onReceive={(dataType, payload) => {
        if (dataType === 'aquiferParams') {
          const parts: string[] = [];
          if (payload.hydraulicConductivity) parts.push(`K=${payload.hydraulicConductivity} m/d`);
          if (payload.hydraulicGradient) parts.push(`I=${payload.hydraulicGradient}`);
          if (parts.length > 0) alert(`已接收含水层参数:\n${parts.join(', ')}\n\n请手动更新保护区划分参数。`);
        }
      }} />
    </div>
  );
}
