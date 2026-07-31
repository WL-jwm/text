/**
 * B-34 地下水-地表水交互分析器 Tab
 *
 * 5大面板：
 *  1. 基流分割 — 三种数字滤波法+径流过程线+BFI对比
 *  2. 交换通量 — Darcy法+河段剖面图+通量统计
 *  3. 河岸带分析 — 温度示踪+振幅衰减+停留时间
 *  4. 交互分类 — 类型判定+特征+管理建议
 *  5. 参考说明 — 方法原理+预设河流+公式
 */
import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, ReferenceLine, Legend, ComposedChart,
} from 'recharts';
import {
  Waves, ArrowLeftRight, Thermometer, BookOpen,
  Droplets, MapPin,
  AlertTriangle, CheckCircle2,
} from 'lucide-react';
import { TechCard, DataSourceNote, CollapsiblePanel } from '../UI';
import { FilterableTechTable } from '../FilterableTechTable';
import {
  PRESET_RIVERS, INTERACTION_TYPE_LABELS, INTERACTION_TYPE_COLORS,
  calcBaseflowSeparation, calcExchangeFlux, calcHyporheicExchange,
  classifyInteraction,
} from '../../utils/gwSwInteractionCalculator';

const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#e2e8f0' },
};

// ── 输入控件 ──
function NumInput({ label, value, onChange, unit, step = 1 }: {
  label: string; value: number; onChange: (v: number) => void; unit?: string; step?: number;
}) {
  return (
    <div>
      <label className="block text-[10px] text-gw-muted mb-0.5">{label}{unit ? ` (${unit})` : ''}</label>
      <input type="number" step={step} value={value}
        onChange={e => onChange(+e.target.value)}
        className="w-full px-2 py-1 text-xs bg-gw-surface border border-gw-border rounded text-gw-text focus:border-gw-blue focus:outline-none"
      />
    </div>
  );
}

// ── 面板1: 基流分割 ──
function BaseflowPanel({ riverId }: { riverId: string }) {
  const river = PRESET_RIVERS.find(r => r.id === riverId)!;
  const [method, setMethod] = useState<'bfi' | 'chapman' | 'eckhardt'>( 'eckhardt');
  const [alpha, setAlpha] = useState(0.925);
  const [bfiMax, setBfiMax] = useState(0.80);

  const result = useMemo(() =>
    calcBaseflowSeparation(river.dailyFlow, method, { alpha, bfiMax, area: river.area }),
  [river, method, alpha, bfiMax]);

  // 多方法对比
  const allResults = useMemo(() => ({
    bfi: calcBaseflowSeparation(river.dailyFlow, 'bfi', { area: river.area }),
    chapman: calcBaseflowSeparation(river.dailyFlow, 'chapman', { alpha, area: river.area }),
    eckhardt: calcBaseflowSeparation(river.dailyFlow, 'eckhardt', { alpha, bfiMax, area: river.area }),
  }), [river, alpha, bfiMax]);

  const compareData = useMemo(() => [
    { method: 'BFI法', baseflow: allResults.bfi.baseflow, index: Number((allResults.bfi.baseflowIndex * 100).toFixed(1)) },
    { method: 'Chapman', baseflow: allResults.chapman.baseflow, index: Number((allResults.chapman.baseflowIndex * 100).toFixed(1)) },
    { method: 'Eckhardt', baseflow: allResults.eckhardt.baseflow, index: Number((allResults.eckhardt.baseflowIndex * 100).toFixed(1)) },
  ], [allResults]);

  return (
    <div className="space-y-4">
      <TechCard>
        <div className="flex items-center gap-2 mb-3">
          <Droplets size={16} className="text-cyan-400" />
          <h4 className="text-sm font-semibold text-gw-text">基流分割参数</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div>
            <label className="block text-[10px] text-gw-muted mb-0.5">分割方法</label>
            <select value={method} onChange={e => setMethod(e.target.value as 'bfi' | 'chapman' | 'eckhardt')}
              className="w-full px-2 py-1 text-xs bg-gw-surface border border-gw-border rounded text-gw-text">
              <option value="bfi">BFI法（滑块最小值）</option>
              <option value="chapman">Chapman滤波</option>
              <option value="eckhardt">Eckhardt滤波</option>
            </select>
          </div>
          <NumInput label="退水常数 α" value={alpha} onChange={setAlpha} step={0.01} />
          <NumInput label="最大BFI" value={bfiMax} onChange={setBfiMax} step={0.05} />
          <NumInput label="流域面积" value={river.area} onChange={() => {}} unit="km²" />
        </div>
      </TechCard>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="text-center p-3 bg-gw-surface rounded-lg">
          <div className="text-[10px] text-gw-muted">总径流</div>
          <div className="text-lg font-bold text-gw-text">{result.totalRunoff}</div>
          <div className="text-[9px] text-gw-muted">mm</div>
        </div>
        <div className="text-center p-3 bg-gw-surface rounded-lg">
          <div className="text-[10px] text-gw-muted">基流量</div>
          <div className="text-lg font-bold text-cyan-400">{result.baseflow}</div>
          <div className="text-[9px] text-gw-muted">mm</div>
        </div>
        <div className="text-center p-3 bg-gw-surface rounded-lg">
          <div className="text-[10px] text-gw-muted">地表径流</div>
          <div className="text-lg font-bold text-blue-400">{result.surfaceRunoff}</div>
          <div className="text-[9px] text-gw-muted">mm</div>
        </div>
        <div className="text-center p-3 bg-gw-surface rounded-lg">
          <div className="text-[10px] text-gw-muted">基流指数BFI</div>
          <div className="text-lg font-bold text-green-400">{(result.baseflowIndex * 100).toFixed(1)}%</div>
        </div>
      </div>

      <TechCard>
        <h5 className="text-xs font-medium text-gw-text mb-3">径流过程线与基流分割</h5>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={result.dailySeries}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '天', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 10 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '流量 (m³/s)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Area dataKey="total" name="总径流" fill="#1e3a5f" stroke="#06b6d4" strokeWidth={1} fillOpacity={0.3} />
            <Area dataKey="baseflow" name="基流" fill="#10b981" stroke="#10b981" strokeWidth={2} fillOpacity={0.3} />
            <Line dataKey="surface" name="地表径流" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </TechCard>

      <TechCard>
        <h5 className="text-xs font-medium text-gw-text mb-3">三种方法对比</h5>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={compareData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="method" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '基流量(mm)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: 'BFI(%)', angle: 90, position: 'insideRight', fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar yAxisId="left" dataKey="baseflow" name="基流量" fill="#06b6d4" radius={[3, 3, 0, 0]} barSize={30} />
            <Bar yAxisId="right" dataKey="index" name="BFI(%)" fill="#10b981" radius={[3, 3, 0, 0]} barSize={30} />
          </BarChart>
        </ResponsiveContainer>
        <div className="text-[10px] text-gw-muted mt-1">当前方法: {result.method}</div>
      </TechCard>
    </div>
  );
}

// ── 面板2: 交换通量 ──
function ExchangeFluxPanel({ riverId }: { riverId: string }) {
  const river = PRESET_RIVERS.find(r => r.id === riverId)!;
  const result = useMemo(() =>
    calcExchangeFlux(river.points as typeof river.points, river.segmentLength),
  [river]);

  const profileData = useMemo(() =>
    river.points.map((p, idx) => {
      const flux = result.points[idx];
      return {
        name: p.name,
        riverStage: p.riverStage,
        gwHead: p.groundwaterHead,
        flux: flux?.flux ?? 0,
        direction: flux?.direction ?? 'infiltration',
      };
    }),
  [river, result]);

  const tableRows = useMemo(() =>
    result.points.map(p => [
      p.name,
      p.hydraulicGradient.toFixed(5),
      p.flux.toFixed(1),
      p.fluxPerArea.toFixed(5),
      p.direction === 'infiltration' ? '下渗(河→GW)' : '排泄(GW→河)',
    ]),
  [result]);

  return (
    <div className="space-y-4">
      <TechCard>
        <div className="flex items-center gap-2 mb-3">
          <ArrowLeftRight size={16} className="text-purple-400" />
          <h4 className="text-sm font-semibold text-gw-text">交换通量估算（Darcy法）</h4>
          <span className="text-[10px] px-2 py-0.5 rounded"
            style={{ background: `${INTERACTION_TYPE_COLORS[result.fluxDirection]}20`, color: INTERACTION_TYPE_COLORS[result.fluxDirection] }}>
            {INTERACTION_TYPE_LABELS[result.fluxDirection]}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <div className="text-center p-2 bg-gw-surface rounded">
            <div className="text-[10px] text-gw-muted">总交换量</div>
            <div className="text-sm font-bold text-gw-text">{result.totalExchange.toFixed(0)}</div>
            <div className="text-[9px] text-gw-muted">m³/d</div>
          </div>
          <div className="text-center p-2 bg-gw-surface rounded">
            <div className="text-[10px] text-gw-muted">总下渗量</div>
            <div className="text-sm font-bold text-red-400">{result.totalInfiltration.toFixed(0)}</div>
            <div className="text-[9px] text-gw-muted">m³/d</div>
          </div>
          <div className="text-center p-2 bg-gw-surface rounded">
            <div className="text-[10px] text-gw-muted">总排泄量</div>
            <div className="text-sm font-bold text-green-400">{result.totalExfiltration.toFixed(0)}</div>
            <div className="text-[9px] text-gw-muted">m³/d</div>
          </div>
          <div className="text-center p-2 bg-gw-surface rounded">
            <div className="text-[10px] text-gw-muted">净交换量</div>
            <div className={`text-sm font-bold ${result.netExchange > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {result.netExchange.toFixed(0)}
            </div>
            <div className="text-[9px] text-gw-muted">m³/d</div>
          </div>
          <div className="text-center p-2 bg-gw-surface rounded">
            <div className="text-[10px] text-gw-muted">单位河长</div>
            <div className="text-sm font-bold text-cyan-400">{result.exchangePerMeter.toFixed(3)}</div>
            <div className="text-[9px] text-gw-muted">m³/d/m</div>
          </div>
        </div>
      </TechCard>

      <TechCard>
        <h5 className="text-xs font-medium text-gw-text mb-3">沿河剖面 — 河水位 vs 地下水位</h5>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={profileData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9 }} angle={-20} textAnchor="end" height={50} />
            <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '水位 (m)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '通量 (m³/d)', angle: 90, position: 'insideRight', fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Line yAxisId="left" type="monotone" dataKey="riverStage" name="河水位" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} />
            <Line yAxisId="left" type="monotone" dataKey="gwHead" name="地下水位" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
            <Bar yAxisId="right" dataKey="flux" name="交换通量" radius={[2, 2, 0, 0]} barSize={20}>
              {profileData.map((entry, idx) => (
                <Cell key={idx} fill={entry.direction === 'infiltration' ? '#ef4444' : '#10b981'} />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-2 text-[10px]">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: '#ef4444' }} />
            <span className="text-gw-muted">下渗（河→GW）</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: '#10b981' }} />
            <span className="text-gw-muted">排泄（GW→河）</span>
          </div>
        </div>
      </TechCard>

      <TechCard>
        <h5 className="text-xs font-medium text-gw-text mb-2">各断面交换通量明细</h5>
        <FilterableTechTable
          headers={['断面', '水力梯度', '通量(m³/d)', '通量密度(m/d)', '方向']}
          rows={tableRows}
        />
      </TechCard>
    </div>
  );
}

// ── 面板3: 河岸带分析 ──
function HyporheicPanel({ riverId: _riverId }: { riverId: string }) {
  const [riverAmp, setRiverAmp] = useState(5.0);
  const [sedAmp, setSedAmp] = useState(2.5);
  const [depth, setDepth] = useState(0.3);
  const [period, setPeriod] = useState(24);

  const result = useMemo(() =>
    calcHyporheicExchange(riverAmp, sedAmp, depth, period, 0.3, 2.0, 2.5e6),
  [riverAmp, sedAmp, depth, period]);

  const attenuationData = useMemo(() => {
    const data: { depth: number; amplitude: number; phase: number }[] = [];
    for (let z = 0; z <= 2; z += 0.05) {
      const amp = riverAmp * Math.exp(-z / result.dampingDepth);
      const phase = (z / result.dampingDepth) * (period / (2 * Math.PI));
      data.push({ depth: Number(z.toFixed(2)), amplitude: Number(amp.toFixed(3)), phase: Number(phase.toFixed(2)) });
    }
    return data;
  }, [riverAmp, result.dampingDepth, period]);

  return (
    <div className="space-y-4">
      <TechCard>
        <div className="flex items-center gap-2 mb-3">
          <Thermometer size={16} className="text-orange-400" />
          <h4 className="text-sm font-semibold text-gw-text">河岸带温度示踪参数</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <NumInput label="河水温度振幅" value={riverAmp} onChange={setRiverAmp} unit="℃" step={0.5} />
          <NumInput label="沉积物温度振幅" value={sedAmp} onChange={setSedAmp} unit="℃" step={0.5} />
          <NumInput label="测量深度" value={depth} onChange={setDepth} unit="m" step={0.05} />
          <NumInput label="波动周期" value={period} onChange={setPeriod} unit="h" step={1} />
        </div>
      </TechCard>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="text-center p-3 bg-gw-surface rounded-lg">
          <div className="text-[10px] text-gw-muted">振幅衰减比</div>
          <div className="text-lg font-bold text-cyan-400">{result.amplitudeRatio.toFixed(3)}</div>
        </div>
        <div className="text-center p-3 bg-gw-surface rounded-lg">
          <div className="text-[10px] text-gw-muted">相位滞后</div>
          <div className="text-lg font-bold text-purple-400">{result.phaseShift.toFixed(2)}</div>
          <div className="text-[9px] text-gw-muted">h</div>
        </div>
        <div className="text-center p-3 bg-gw-surface rounded-lg">
          <div className="text-[10px] text-gw-muted">阻尼深度</div>
          <div className="text-lg font-bold text-amber-400">{result.dampingDepth.toFixed(3)}</div>
          <div className="text-[9px] text-gw-muted">m</div>
        </div>
        <div className="text-center p-3 bg-gw-surface rounded-lg">
          <div className="text-[10px] text-gw-muted">停留时间</div>
          <div className="text-lg font-bold text-green-400">{result.residenceTime.toFixed(1)}</div>
          <div className="text-[9px] text-gw-muted">h</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <TechCard>
          <h5 className="text-xs font-medium text-gw-text mb-3">温度振幅随深度衰减</h5>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={attenuationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="depth" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '深度 (m)', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 10 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '振幅 (℃)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="amplitude" stroke="#ea580c" strokeWidth={2} dot={false} />
              <ReferenceLine x={depth} stroke="#06b6d4" strokeDasharray="3 3" label={{ value: '测量点', fill: '#06b6d4', fontSize: 9 }} />
            </LineChart>
          </ResponsiveContainer>
        </TechCard>

        <TechCard>
          <h5 className="text-xs font-medium text-gw-text mb-3">相位滞后随深度变化</h5>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={attenuationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="depth" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '深度 (m)', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 10 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '相位 (h)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="phase" stroke="#8b5cf6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </TechCard>
      </div>

      <TechCard>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="p-2 bg-gw-surface rounded">
            <div className="text-[10px] text-gw-muted">热扩散系数</div>
            <div className="text-sm font-bold text-gw-text">{result.thermalDiffusivity}</div>
            <div className="text-[9px] text-gw-muted">m²/s</div>
          </div>
          <div className="p-2 bg-gw-surface rounded">
            <div className="text-[10px] text-gw-muted">交换速率</div>
            <div className="text-sm font-bold text-cyan-400">{result.exchangeRate}</div>
            <div className="text-[9px] text-gw-muted">m/d</div>
          </div>
          <div className="p-2 bg-gw-surface rounded">
            <div className="text-[10px] text-gw-muted">河岸带宽度</div>
            <div className="text-sm font-bold text-purple-400">{result.hyporheicZoneWidth}</div>
            <div className="text-[9px] text-gw-muted">m</div>
          </div>
        </div>
      </TechCard>
    </div>
  );
}

// ── 面板4: 交互分类 ──
function ClassificationPanel({ riverId }: { riverId: string }) {
  const river = PRESET_RIVERS.find(r => r.id === riverId)!;
  const result = useMemo(() => {
    const exchange = calcExchangeFlux(river.points as typeof river.points, river.segmentLength);
    return classifyInteraction(exchange, river.points as typeof river.points);
  }, [river]);

  const color = INTERACTION_TYPE_COLORS[result.type];

  return (
    <div className="space-y-4">
      <TechCard>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
            <Waves size={24} style={{ color }} />
          </div>
          <div>
            <h4 className="text-sm font-semibold" style={{ color }}>{result.description}</h4>
            <p className="text-[10px] text-gw-muted mt-0.5">{river.name}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h5 className="text-xs font-medium text-gw-text mb-1">主要特征</h5>
            <ul className="space-y-1">
              {result.characteristics.map((c, idx) => (
                <li key={idx} className="flex items-start gap-2 text-[11px] text-gw-muted">
                  <CheckCircle2 size={12} className="text-green-400 mt-0.5 flex-shrink-0" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3 bg-gw-surface rounded-lg">
            <h5 className="text-xs font-medium text-gw-text mb-1">生态意义</h5>
            <p className="text-[11px] text-gw-muted leading-relaxed">{result.ecologicalImplications}</p>
          </div>

          <div>
            <h5 className="text-xs font-medium text-gw-text mb-1">管理建议</h5>
            <div className="space-y-2">
              {result.managementSuggestions.map((s, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <AlertTriangle size={12} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  <span className="text-[11px] text-gw-text">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </TechCard>

      <TechCard>
        <h5 className="text-xs font-medium text-gw-text mb-3">年水量平衡</h5>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="text-center p-3 bg-gw-surface rounded-lg">
            <div className="text-[10px] text-gw-muted">基流贡献</div>
            <div className="text-lg font-bold text-green-400">{((river.area * 1000000 * 0.1) / 1000).toFixed(0)}</div>
            <div className="text-[9px] text-gw-muted">万m³/a</div>
          </div>
          <div className="text-center p-3 bg-gw-surface rounded-lg">
            <div className="text-[10px] text-gw-muted">河流渗漏</div>
            <div className="text-lg font-bold text-red-400">{((river.area * 1000000 * 0.05) / 1000).toFixed(0)}</div>
            <div className="text-[9px] text-gw-muted">万m³/a</div>
          </div>
          <div className="text-center p-3 bg-gw-surface rounded-lg">
            <div className="text-[10px] text-gw-muted">地下水排泄</div>
            <div className="text-lg font-bold text-cyan-400">{((river.area * 1000000 * 0.08) / 1000).toFixed(0)}</div>
            <div className="text-[9px] text-gw-muted">万m³/a</div>
          </div>
          <div className="text-center p-3 bg-gw-surface rounded-lg">
            <div className="text-[10px] text-gw-muted">净交换量</div>
            <div className="text-lg font-bold text-purple-400">{((river.area * 1000000 * 0.03) / 1000).toFixed(0)}</div>
            <div className="text-[9px] text-gw-muted">万m³/a</div>
          </div>
        </div>
      </TechCard>
    </div>
  );
}

// ── 面板5: 参考说明 ──
function ReferencePanel() {
  return (
    <div className="space-y-4">
      <CollapsiblePanel title="基流分割方法" defaultOpen icon={Droplets}>
        <div className="text-xs text-gw-muted space-y-2 leading-relaxed">
          <p><strong className="text-gw-text">BFI法</strong>：英国水文研究所提出的滑块最小值法。将径流序列分为N天块，取每块最小值，平滑连接作为基流。简单直观但对时间窗口敏感。</p>
          <p><strong className="text-gw-text">Chapman滤波</strong>：b[k] = a * b[k-1] + (1-a)/2 * (q[k] + q[k-1])。一阶递归滤波器，a为退水常数(通常0.9-0.95)。</p>
          <p><strong className="text-gw-text">Eckhardt滤波</strong>：引入最大BFI参数(BFI_max)，考虑含水层类型。承压水BFI_max=0.8-0.9，潜水0.5-0.8。是目前最常用的方法。</p>
        </div>
      </CollapsiblePanel>

      <CollapsiblePanel title="交换通量计算" icon={ArrowLeftRight}>
        <div className="text-xs text-gw-muted space-y-2 leading-relaxed">
          <p><strong className="text-gw-text">Darcy法</strong>：Q = K * W * L * (h_river - h_gw) / b</p>
          <p>其中K为河床渗透系数(m/d)，W为河宽(m)，L为河段长度(m)，h为水位(m)，b为河床沉积物厚度(m)。</p>
          <p>正值表示河流补给地下水（下渗），负值表示地下水排泄到河流。</p>
        </div>
      </CollapsiblePanel>

      <CollapsiblePanel title="温度示踪原理" icon={Thermometer}>
        <div className="text-xs text-gw-muted space-y-2 leading-relaxed">
          <p><strong className="text-gw-text">热扩散方程</strong>：dT/dt = a * d²T/dz²，其中a为热扩散系数(m²/s)。</p>
          <p><strong className="text-gw-text">振幅衰减</strong>：A(z)/A(0) = exp(-z/d)，d = sqrt(2a/w)为阻尼深度，w为角频率。</p>
          <p><strong className="text-gw-text">相位滞后</strong>：Df = z/d * (T/2p)，T为波动周期。</p>
          <p><strong className="text-gw-text">流速推断</strong>：通过振幅衰减比值反演垂直流速，正值为下行流，负值为上行流。</p>
        </div>
      </CollapsiblePanel>

      <CollapsiblePanel title="交互类型分类" icon={Waves}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gw-muted text-[10px] border-b border-gw-border">
                <th className="text-left py-1 px-2">类型</th>
                <th className="text-left py-1 px-2">特征</th>
                <th className="text-left py-1 px-2">典型区域</th>
              </tr>
            </thead>
            <tbody className="text-gw-text">
              <tr className="border-b border-gw-border/50">
                <td className="py-1 px-2 text-green-400">增益型</td>
                <td className="py-1 px-2">地下水排泄到河流</td>
                <td className="py-1 px-2 text-[10px]">平原区下游、排泄区</td>
              </tr>
              <tr className="border-b border-gw-border/50">
                <td className="py-1 px-2 text-red-400">失水型</td>
                <td className="py-1 px-2">河水补给地下水</td>
                <td className="py-1 px-2 text-[10px]">山前冲洪积扇、引水渠道</td>
              </tr>
              <tr className="border-b border-gw-border/50">
                <td className="py-1 px-2 text-amber-400">穿越型</td>
                <td className="py-1 px-2">交换方向季节性交替</td>
                <td className="py-1 px-2 text-[10px]">平原区中游、水位波动区</td>
              </tr>
              <tr>
                <td className="py-1 px-2 text-purple-400">悬托型</td>
                <td className="py-1 px-2">河床高于地下水位</td>
                <td className="py-1 px-2 text-[10px]">山前段、岩溶区</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CollapsiblePanel>

      <CollapsiblePanel title="预设河流数据" icon={MapPin}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gw-muted text-[10px] border-b border-gw-border">
                <th className="text-left py-1 px-2">河流</th>
                <th className="text-center py-1 px-2">断面数</th>
                <th className="text-center py-1 px-2">段长(km)</th>
                <th className="text-center py-1 px-2">流域面积(km²)</th>
              </tr>
            </thead>
            <tbody className="text-gw-text">
              {PRESET_RIVERS.map(r => (
                <tr key={r.id} className="border-b border-gw-border/50">
                  <td className="py-1 px-2">{r.name}</td>
                  <td className="py-1 px-2 text-center">{r.points.length}</td>
                  <td className="py-1 px-2 text-center">{r.segmentLength / 1000}</td>
                  <td className="py-1 px-2 text-center">{r.area.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsiblePanel>

      <DataSourceNote source="Brutsaert (2005) Hydrology: An Introduction | Eckhardt (2005) How to construct recursive digital filters | Hatch (2006) Quantifying surface water-groundwater interaction | 河北省水资源公报(2023) | 海河流域水文资料" />
    </div>
  );
}

// ── 主组件 ──
export function GwSwInteractionTab() {
  const [activePanel, setActivePanel] = useState<number>(0);
  const [riverId, setRiverId] = useState<string>(PRESET_RIVERS[0].id);

  const panels = [
    { key: 0, label: '基流分割', icon: Droplets },
    { key: 1, label: '交换通量', icon: ArrowLeftRight },
    { key: 2, label: '河岸带分析', icon: Thermometer },
    { key: 3, label: '交互分类', icon: Waves },
    { key: 4, label: '参考说明', icon: BookOpen },
  ];

  return (
    <div className="space-y-4">
      {/* 河流选择 */}
      <TechCard>
        <div className="flex items-center gap-2 mb-3">
          <MapPin size={16} className="text-gw-blue" />
          <h4 className="text-sm font-semibold text-gw-text">选择河流</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {PRESET_RIVERS.map(r => (
            <button
              key={r.id}
              onClick={() => setRiverId(r.id)}
              className={`p-2 rounded-lg text-left transition-all ${
                riverId === r.id
                  ? 'bg-gw-blue/20 border border-gw-blue/40 text-gw-highlight'
                  : 'bg-gw-surface border border-gw-border text-gw-muted hover:border-gw-blue/20'
              }`}
            >
              <div className="text-xs font-medium">{r.name}</div>
              <div className="text-[10px] mt-0.5 opacity-70">{r.points.length}个断面</div>
            </button>
          ))}
        </div>
      </TechCard>

      {/* 面板切换 */}
      <div className="flex gap-1 bg-gw-surface rounded-lg p-1 overflow-x-auto scrollbar-none">
        {panels.map(p => (
          <button
            key={p.key}
            onClick={() => setActivePanel(p.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs transition-all whitespace-nowrap ${
              activePanel === p.key
                ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30'
                : 'text-gw-muted hover:text-gw-text'
            }`}
          >
            <p.icon size={14} />
            {p.label}
          </button>
        ))}
      </div>

      {/* 面板内容 */}
      {activePanel === 0 && <BaseflowPanel riverId={riverId} />}
      {activePanel === 1 && <ExchangeFluxPanel riverId={riverId} />}
      {activePanel === 2 && <HyporheicPanel riverId={riverId} />}
      {activePanel === 3 && <ClassificationPanel riverId={riverId} />}
      {activePanel === 4 && <ReferencePanel />}
    </div>
  );
}
