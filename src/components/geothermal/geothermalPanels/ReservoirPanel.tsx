/**
 * B-17 地热资源量评价计算器 Tab
 *
 * 4大面板：
 *  1. 热储储量 — 热储法 Q=ρ·c·V·ΔT 计算 + 预设地热田对比
 *  2. 井产能评价 — 热功率/年产热量/产能等级
 *  3. 地温梯度 — 梯度/热流值/不同深度温度预测
 *  4. 可开采量 — 开采系数法/回灌率/服务年限
 * 面板组件：ReservoirPanel（拆分自 GeothermalCalculatorTab.tsx）
 */

import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { Calculator } from 'lucide-react';
import { TechCard, StatCard } from '../../UI';
import { LazyChartCard } from '../../LazyChartCard';
import { ChartExport } from '../../ChartExport';
import { FilterableTechTable } from '../../FilterableTechTable';
import { PRESET_FIELDS, ROCK_PROPERTIES, calcReservoirReserve, calcAllPresetFields, calcGeothermalSummary, type ReservoirInput, type RockType } from '../../../utils/geothermalCalculator';
import { TOOLTIP_STYLE } from './geothermalConstants';

// ── 面板1: 热储储量计算 ──
export function ReservoirPanel() {
  const [name, setName] = useState('自定义地热田');
  const [area, setArea] = useState(250);
  const [reservoirThickness, setReservoirThickness] = useState(300);
  const [reservoirTemp, setReservoirTemp] = useState(75);
  const [referenceTemp, setReferenceTemp] = useState(25);
  const [porosity, setPorosity] = useState(0.06);
  const [rockType, setRockType] = useState<RockType>('limestone');

  const input: ReservoirInput = {
    name, area, reservoirThickness, reservoirTemp, referenceTemp, porosity, rockType,
  };
  const result = useMemo(() => calcReservoirReserve(input), [input]);
  const presets = useMemo(() => calcAllPresetFields(), []);
  const summary = useMemo(() => calcGeothermalSummary(), []);

  const compareData = useMemo(() => presets.map((r, i) => ({
    name: PRESET_FIELDS[i].name.replace('地热田', ''),
    热储量: r.totalHeatReservePJ,
    可开采量: r.recoverableHeat,
    fill: r.totalHeatReservePJ > 50 ? '#ef4444' : r.totalHeatReservePJ > 30 ? '#f59e0b' : '#3b82f6',
  })), [presets]);

  const tempData = useMemo(() => PRESET_FIELDS.map(f => ({
    name: f.name.replace('地热田', ''),
    热储温度: f.reservoirTemp,
    井口温度: f.wellheadTemp,
    fill: f.reservoirTemp >= 80 ? '#ef4444' : f.reservoirTemp >= 70 ? '#f59e0b' : '#3b82f6',
  })), []);

  return (
    <div className="space-y-4">
      <TechCard title="热储法储量计算" icon={Calculator}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="col-span-2">
            <label className="text-xs text-gw-muted block mb-1">地热田名称</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">热储面积 (km²)</label>
            <input type="number" value={area} onChange={e => setArea(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">热储厚度</label>
            <input type="number" value={reservoirThickness} onChange={e => setReservoirThickness(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">热储温度 (°C)</label>
            <input type="number" value={reservoirTemp} onChange={e => setReservoirTemp(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">基准温度 (°C)</label>
            <input type="number" value={referenceTemp} onChange={e => setReferenceTemp(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">孔隙度</label>
            <input type="number" step="0.01" value={porosity} onChange={e => setPorosity(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">岩石类型</label>
            <select value={rockType} onChange={e => setRockType(e.target.value as RockType)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text">
              {Object.entries(ROCK_PROPERTIES).map(([k, v]) => (
                <option key={k} value={k}>{v.type}</option>
              ))}
            </select>
          </div>
        </div>
      </TechCard>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="热储体积" value={(result.volume / 1e9).toFixed(2)} unit="×10⁹m³" accent="text-blue-400" />
        <StatCard title="总热储量" value={result.totalHeatReservePJ} unit="×10¹²kJ" accent="text-orange-400" />
        <StatCard title="折合标煤" value={result.coalEquivalent} unit="万t" accent="text-amber-400" />
        <StatCard title="可开采热能" value={result.recoverableHeat} unit="×10¹²kJ" accent="text-red-400" />
      </div>

      <div className="bg-gw-card-alt rounded-lg p-3">
        <p className="text-xs text-gw-muted leading-relaxed">
          <strong className="text-gw-text">计算公式：</strong>
          {' '}Q = [ρw·cw·φ + ρr·cr·(1-φ)] × V × (T - T0)
          {' '}其中 V=F×M 为热储体积，φ为孔隙度，w为水，r为岩石。
          {' '}体积比热容 = {result.volumetricHeatCapacity} kJ/(m³·°C)，
          {' '}水中热量占比 = {Math.round(result.heatInWater / result.totalHeatReserve * 100)}%。
        </p>
      </div>

      {/* 预设地热田对比 */}
      <LazyChartCard title="各预设地热田热储量对比">
        <ChartExport data={compareData} filename="地热田热储量对比" />
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={compareData} margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-25} textAnchor="end" height={70} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: '×10¹² kJ', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="热储量" fill="#ef4444" radius={[3, 3, 0, 0]} />
            <Bar dataKey="可开采量" fill="#f59e0b" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <LazyChartCard title="各地热田温度对比">
        <ChartExport data={tempData} filename="地热田温度对比" />
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={tempData} margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-25} textAnchor="end" height={70} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: '°C', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <ReferenceLine y={70} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: '中温地热(70°C)', fill: '#f59e0b', fontSize: 10 }} />
            <Bar dataKey="热储温度" fill="#ef4444" radius={[3, 3, 0, 0]} />
            <Bar dataKey="井口温度" fill="#3b82f6" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <FilterableTechTable
        headers={['地热田', '位置', '面积(km²)', '厚度', '温度(°C)', '热储量(×10¹²kJ)', '折合标煤(万t)', '开采状态']}
        rows={PRESET_FIELDS.map((f, i) => [f.name, f.location, f.area, f.reservoirThickness, f.reservoirTemp, presets[i].totalHeatReservePJ, presets[i].coalEquivalent, f.status])}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="地热田总数" value={summary.fieldCount} unit="处" accent="text-red-400" />
        <StatCard title="总热储量" value={summary.totalHeat} unit="×10¹²kJ" accent="text-orange-400" />
        <StatCard title="总折合标煤" value={summary.totalCoal} unit="万t" accent="text-amber-400" />
        <StatCard title="平均热储温度" value={summary.avgTemp} unit="°C" accent="text-blue-400" />
      </div>
    </div>
  );
}
