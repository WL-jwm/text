/**
 * B-19 岩溶泉流量衰减分析 Tab
 *
 * 4大面板：
 *  1. 衰减分析 — Maillet指数衰减模型 + 衰减曲线
 *  2. 滞后相关 — 降水-泉流量滞后相关分析
 *  3. 调蓄评价 — 系统调蓄功能评价
 *  4. 预设泉域 — 6个河北岩溶大泉对比 + 衰减系数参考表
 * 面板: DecayPanel（拆分自 SpringDecayTab.tsx）
 */
import { type DecayInput, calcDecay } from '../../../utils/springDecayCalculator';
import { ChartExport } from '../../ChartExport';
import { LazyChartCard } from '../../LazyChartCard';
import { TechCard, StatCard } from '../../UI';
import { Calculator } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Legend, Area, ResponsiveContainer, Tooltip, CartesianGrid, Line, XAxis, ComposedChart, YAxis } from 'recharts';
import { REGULATION_COLORS, TOOLTIP_STYLE } from './springDecayConstants';

export function DecayPanel() {
  const [name, setName] = useState('自定义泉域');
  const [Q0, setQ0] = useState(7.0);
  const [alpha, setAlpha] = useState(0.010);
  const [duration, setDuration] = useState(180);
  const [startDay, setStartDay] = useState(120);

  const input: DecayInput = { name, Q0, alpha, duration, startDay };
  const result = useMemo(() => calcDecay(input), [input]);

  return (
    <div className="space-y-4">
      <TechCard title="Maillet指数衰减模型参数" icon={Calculator}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="col-span-2">
            <label className="text-xs text-gw-muted block mb-1">泉域名称</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">初始流量 Q0 (m³/s)</label>
            <input type="number" step="0.1" value={Q0} onChange={e => setQ0(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">衰减系数 α (1/d)</label>
            <input type="number" step="0.001" value={alpha} onChange={e => setAlpha(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">衰减持续天数</label>
            <input type="number" value={duration} onChange={e => setDuration(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">衰减起始日（年内第N天）</label>
            <input type="number" value={startDay} onChange={e => setStartDay(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
        </div>
      </TechCard>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="期末流量 Qt" value={result.Qt} unit="m³/s" accent={REGULATION_COLORS[result.regulation]} />
        <StatCard title="衰减率" value={result.decayRate} unit="%" accent="text-amber-400" />
        <StatCard title="半衰期" value={result.halfLife} unit="d" accent="text-blue-400" subtitle="流量减半天数" />
        <div className="bg-gw-card-alt rounded-lg p-3 flex flex-col justify-center items-center">
          <span className="text-xs text-gw-muted mb-1">调蓄能力</span>
          <span className="text-xl font-bold" style={{ color: REGULATION_COLORS[result.regulation] }}>
            {result.regulation}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard title="衰减期总排泄量" value={result.totalDischarge} unit="万m³" accent="text-cyan-400" />
        <StatCard title="储水量估算" value={result.storageEstimate} unit="万m³" accent="text-violet-400" subtitle="Q0/α" />
        <StatCard title="衰减系数 α" value={result.alpha} unit="1/d" accent="text-orange-400" />
      </div>

      <div className="bg-gw-card-alt rounded-lg p-3">
        <p className="text-xs text-gw-muted leading-relaxed">
          <strong className="text-gw-text">Maillet模型：</strong>
          {' '}Qt = Q0 · e^(-αt)，其中 α 为衰减系数，反映岩溶系统的排水速率。
          {' '}α越小，调蓄能力越强；α越大，系统响应越快、衰减越迅速。
          {' '}半衰期 t₁/₂ = ln2/α = {result.halfLife}天，储水量 V ≈ Q0/α = {result.storageEstimate}万m³。
        </p>
      </div>

      {/* 衰减曲线 */}
      <LazyChartCard title="泉流量衰减曲线">
        <ChartExport data={result.curve} filename={`${name}_衰减曲线`} />
        <ResponsiveContainer width="100%" height={340}>
          <ComposedChart data={result.curve} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '天数(d)', position: 'insideBottom', fill: '#94a3b8', fontSize: 11, offset: -5 }} />
            <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'm³/s', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: '万m³', angle: 90, position: 'insideRight', fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line yAxisId="left" type="monotone" dataKey="流量" stroke="#ef4444" strokeWidth={2} dot={false} />
            <Area yAxisId="right" type="monotone" dataKey="累计量" fill="#3b82f6" fillOpacity={0.2} stroke="#3b82f6" strokeWidth={1} />
          </ComposedChart>
        </ResponsiveContainer>
      </LazyChartCard>
    </div>
  );
}
