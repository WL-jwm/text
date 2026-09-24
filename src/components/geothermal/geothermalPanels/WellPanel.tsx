/**
 * B-17 地热资源量评价计算器 Tab
 *
 * 4大面板：
 *  1. 热储储量 — 热储法 Q=ρ·c·V·ΔT 计算 + 预设地热田对比
 *  2. 井产能评价 — 热功率/年产热量/产能等级
 *  3. 地温梯度 — 梯度/热流值/不同深度温度预测
 *  4. 可开采量 — 开采系数法/回灌率/服务年限
 * 面板组件：WellPanel（拆分自 GeothermalCalculatorTab.tsx）
 */

import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { Zap } from 'lucide-react';
import { TechCard, StatCard } from '../../UI';
import { LazyChartCard } from '../../LazyChartCard';
import { ChartExport } from '../../ChartExport';
import { FilterableTechTable } from '../../FilterableTechTable';
import { PRESET_FIELDS, calcWellProductivity, calcAllPresetWells, calcGeothermalSummary, type WellProductivityInput } from '../../../utils/geothermalCalculator';
import { TOOLTIP_STYLE, GRADE_COLORS } from './geothermalConstants';

// ── 面板2: 井产能评价 ──
export function WellPanel() {
  const [name, setName] = useState('自定义地热井');
  const [yieldVal, setYield] = useState(2000);
  const [wellheadTemp, setWellheadTemp] = useState(75);
  const [reinjectionTemp, setReinjectionTemp] = useState(25);
  const [depth, setDepth] = useState(3000);
  const [wellDiameter, setWellDiameter] = useState(0.2);

  const input: WellProductivityInput = {
    name, yield: yieldVal, wellheadTemp, reinjectionTemp, depth, wellDiameter,
  };
  const result = useMemo(() => calcWellProductivity(input), [input]);
  const wells = useMemo(() => calcAllPresetWells(), []);
  const summary = useMemo(() => calcGeothermalSummary(), []);

  const wellCompare = useMemo(() => wells.map((w, i) => ({
    name: PRESET_FIELDS[i].name.replace('地热田', ''),
    热功率: w.thermalPower,
    fill: GRADE_COLORS[w.productivityGrade] ?? '#6b7280',
  })), [wells]);

  return (
    <div className="space-y-4">
      <TechCard title="地热井产能参数" icon={Zap}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="col-span-2">
            <label className="text-xs text-gw-muted block mb-1">井名</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">产量 (m³/d)</label>
            <input type="number" value={yieldVal} onChange={e => setYield(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">井口温度 (°C)</label>
            <input type="number" value={wellheadTemp} onChange={e => setWellheadTemp(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">回灌温度 (°C)</label>
            <input type="number" value={reinjectionTemp} onChange={e => setReinjectionTemp(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">井深</label>
            <input type="number" value={depth} onChange={e => setDepth(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">井径</label>
            <input type="number" step="0.01" value={wellDiameter} onChange={e => setWellDiameter(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
        </div>
      </TechCard>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="热功率" value={result.thermalPower} unit="kW" accent={GRADE_COLORS[result.productivityGrade]} />
        <StatCard title="年产热量" value={result.annualHeat} unit="×10⁶kWh" accent="text-orange-400" />
        <StatCard title="年折合标煤" value={result.annualCoal} unit="万t" accent="text-amber-400" />
        <div className="bg-gw-card-alt rounded-lg p-3 flex flex-col justify-center items-center">
          <span className="text-xs text-gw-muted mb-1">产能等级</span>
          <span className="text-xl font-bold" style={{ color: GRADE_COLORS[result.productivityGrade] }}>
            {result.productivityGrade}
          </span>
        </div>
      </div>

      <div className="bg-gw-card-alt rounded-lg p-3">
        <p className="text-xs text-gw-muted leading-relaxed">
          <strong className="text-gw-text">计算公式：</strong>
          {' '}P = Q × ρw × cw × (Tin - Tout) / 86400 (kW)，其中 Q 为日产量(m³/d)。
          {' '}产能分级：&lt;2000kW 低产，2000~5000kW 中产，5000~10000kW 高产，&ge;10000kW 特高产。
          {' '}水的焓值 = {result.enthalpy} kJ/m³，单位深度热功率 = {result.powerPerDepth} kW/m。
        </p>
      </div>

      <LazyChartCard title="各预设地热田井产能对比">
        <ChartExport data={wellCompare} filename="地热井产能对比" />
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={wellCompare} margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-25} textAnchor="end" height={70} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'kW', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <ReferenceLine y={2000} stroke="#6b7280" strokeDasharray="3 3" label={{ value: '低/中', fill: '#6b7280', fontSize: 10 }} />
            <ReferenceLine y={5000} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: '中/高', fill: '#3b82f6', fontSize: 10 }} />
            <ReferenceLine y={10000} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '高/特高', fill: '#ef4444', fontSize: 10 }} />
            <Bar dataKey="热功率" radius={[4, 4, 0, 0]}>
              {wellCompare.map((entry, idx) => (
                <Cell key={idx} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <FilterableTechTable
        headers={['地热井', '产量(m³/d)', '井口温度(°C)', '热功率(kW)', '年产热(×10⁶kWh)', '折合标煤(万t)', '产能等级']}
        rows={PRESET_FIELDS.map((f, i) => [f.name, f.yield, f.wellheadTemp, wells[i].thermalPower, wells[i].annualHeat, wells[i].annualCoal, wells[i].productivityGrade])}
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard title="总热功率" value={summary.totalPower} unit="kW" accent="text-red-400" />
        <StatCard title="最高热储温度" value={summary.maxTemp} unit="°C" accent="text-orange-400" />
        <StatCard title="总可开采热能" value={summary.totalRecoverable} unit="×10¹²kJ" accent="text-amber-400" />
      </div>
    </div>
  );
}
