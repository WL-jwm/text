/**
 * B-18 矿坑涌水量预测计算器 Tab
 *
 * 4大面板：
 *  1. 大井法 — 稳定流涌水量计算（潜水/承压/承压转无压）
 *  2. 疏干排水 — 非稳定流Theis修正 + 时间-涌水量曲线
 *  3. 影响半径 — Kusakin/Sichardt/修正公式
 *  4. 预设矿区 — 6个河北典型矿区对比 + 涌水量分级
 * 面板: DewateringPanel（拆分自 MineInflowTab.tsx）
 */
import { type DewateringInput, calcDewatering } from '../../../utils/mineInflowCalculator';
import { ChartExport } from '../../ChartExport';
import { LazyChartCard } from '../../LazyChartCard';
import { StatCard, TechCard } from '../../UI';
import { TrendingDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { XAxis, CartesianGrid, Area, Tooltip, YAxis, Legend, ComposedChart, Line, ResponsiveContainer } from 'recharts';
import { TOOLTIP_STYLE } from './mineInflowConstants';

export function DewateringPanel() {
  const [name, setName] = useState('自定义矿区');
  const [K, setK] = useState(0.85);
  const [M, setM] = useState(180);
  const [storageCoeff, setStorageCoeff] = useState(0.0005);
  const [equivalentRadius, setEquivalentRadius] = useState(800);
  const [targetDrawdown, setTargetDrawdown] = useState(150);
  const [dewateringTime, setDewateringTime] = useState(180);
  const [stages, setStages] = useState(3);

  const input: DewateringInput = {
    name, K, M, storageCoeff, equivalentRadius, targetDrawdown, dewateringTime, stages,
  };
  const result = useMemo(() => calcDewatering(input), [input]);

  return (
    <div className="space-y-4">
      <TechCard title="疏干排水计算参数" icon={TrendingDown}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="col-span-2">
            <label className="text-xs text-gw-muted block mb-1">矿区名称</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">渗透系数 K (m/d)</label>
            <input type="number" step="0.01" value={K} onChange={e => setK(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">含水层厚度 M (m)</label>
            <input type="number" value={M} onChange={e => setM(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">储水系数 S / 给水度 μ</label>
            <input type="number" step="0.0001" value={storageCoeff} onChange={e => setStorageCoeff(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">等效半径 r0 (m)</label>
            <input type="number" value={equivalentRadius} onChange={e => setEquivalentRadius(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">目标降深 s0 (m)</label>
            <input type="number" value={targetDrawdown} onChange={e => setTargetDrawdown(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">疏干时间</label>
            <input type="number" value={dewateringTime} onChange={e => setDewateringTime(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">疏干阶段数</label>
            <input type="number" value={stages} onChange={e => setStages(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
        </div>
      </TechCard>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="初始涌水量 Q0" value={result.initialQ} unit="m³/d" accent="text-red-400" />
        <StatCard title="最终涌水量 Qt" value={result.finalQ} unit="m³/d" accent="text-amber-400" />
        <StatCard title="平均涌水量" value={result.averageQ} unit="m³/d" accent="text-blue-400" />
        <StatCard title="总排水量" value={result.totalVolume} unit="m³" accent="text-violet-400" />
      </div>

      <div className="bg-gw-card-alt rounded-lg p-3">
        <p className="text-xs text-gw-muted leading-relaxed">
          <strong className="text-gw-text">评价结论：</strong>
          {' '}{result.timeEvaluation}。
          {' '}导水系数 T = K×M = {K * M} m²/d，
          {' '}初始涌水量 {result.initialQ} m³/d，最终衰减至 {result.finalQ} m³/d，
          {' '}疏干期总排水量约 {result.totalVolume.toLocaleString()} m³。
        </p>
      </div>

      {/* 时间-涌水量曲线 */}
      <LazyChartCard title="疏干期涌水量衰减曲线">
        <ChartExport data={result.curve} filename={`${name}_疏干曲线`} />
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={result.curve} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '时间(d)', position: 'insideBottom', fill: '#94a3b8', fontSize: 11, offset: -5 }} />
            <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'm³/d', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'm³', angle: 90, position: 'insideRight', fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line yAxisId="left" type="monotone" dataKey="涌水量" stroke="#ef4444" strokeWidth={2} dot={false} />
            <Area yAxisId="right" type="monotone" dataKey="累计量" fill="#3b82f6" fillOpacity={0.2} stroke="#3b82f6" strokeWidth={1} />
          </ComposedChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <div className="bg-gw-card-alt rounded-lg p-3">
        <p className="text-xs text-gw-muted leading-relaxed">
          <strong className="text-gw-text">计算原理：</strong>
          {' '}基于Theis非稳定流方程修正，采用Jacob近似 W(u) ≈ -0.5772 - ln(u)。
          {' '}涌水量随时间衰减，因为疏干范围逐渐扩大、水力梯度降低。
          {' '}u = r0²S / (4Tt)，T = KM。时间越长，涌水量越接近稳定值。
        </p>
      </div>
    </div>
  );
}
