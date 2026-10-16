/**
 * B-18 矿坑涌水量预测计算器 Tab
 *
 * 4大面板：
 *  1. 大井法 — 稳定流涌水量计算（潜水/承压/承压转无压）
 *  2. 疏干排水 — 非稳定流Theis修正 + 时间-涌水量曲线
 *  3. 影响半径 — Kusakin/Sichardt/修正公式
 *  4. 预设矿区 — 6个河北典型矿区对比 + 涌水量分级
 * 面板: PresetMinesPanel（拆分自 MineInflowTab.tsx）
 */
import { calcAllPresetMines, PRESET_MINES, calcMineSummary, INFLOW_GRADES } from '../../../utils/mineInflowCalculator';
import { ChartExport } from '../../ChartExport';
import { FilterableTechTable } from '../../FilterableTechTable';
import { LazyChartCard } from '../../LazyChartCard';
import { StatCard, TechCard } from '../../UI';
import { BookOpen, AlertTriangle } from 'lucide-react';
import { useMemo } from 'react';
import { BarChart, XAxis, CartesianGrid, Tooltip, YAxis, Legend, Bar, ResponsiveContainer } from 'recharts';
import { GRADE_COLORS, TOOLTIP_STYLE } from './mineInflowConstants';

export function PresetMinesPanel() {
  const results = useMemo(() => calcAllPresetMines(), []);
  const summary = useMemo(() => calcMineSummary(), []);

  const compareData = useMemo(() => results.map((r, i) => ({
    name: PRESET_MINES[i].name.replace('矿区', ''),
    计算涌水量: r.bigWellQh,
    实际最小: parseFloat(PRESET_MINES[i].actualInflow.split('~')[0]) || 0,
    实际最大: parseFloat(PRESET_MINES[i].actualInflow.split('~')[1]) || 0,
    fill: GRADE_COLORS[r.inflowGrade] ?? '#6b7280',
  })), [results]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="矿区总数" value={summary.mineCount} unit="处" accent="text-amber-400" />
        <StatCard title="总涌水量" value={summary.totalInflow} unit="m³/h" accent="text-red-400" />
        <StatCard title="平均涌水量" value={summary.avgInflow} unit="m³/h" accent="text-blue-400" />
        <StatCard title="高风险矿区" value={summary.highRiskCount} unit="处" accent="text-red-400" subtitle="大/极大涌水量" />
      </div>

      <LazyChartCard title="各矿区计算涌水量 vs 实际涌水量">
        <ChartExport data={compareData} filename="矿区涌水量对比" />
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={compareData} margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-25} textAnchor="end" height={70} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'm³/h', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="计算涌水量" fill="#f59e0b" radius={[3, 3, 0, 0]} />
            <Bar dataKey="实际最小" fill="#3b82f6" radius={[3, 3, 0, 0]} />
            <Bar dataKey="实际最大" fill="#ef4444" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <FilterableTechTable
        headers={['矿区', '位置', '矿种', '含水层类型', 'K(m/d)', 'M(m)', '降深(m)', '计算涌水量(m³/h)', '实际涌水量(m³/h)', '等级', '备注']}
        rows={PRESET_MINES.map((m, i) => [m.name, m.location, m.oreType, m.aquiferType, m.K, m.M, m.drawdown, results[i].bigWellQh, m.actualInflow, results[i].inflowGrade, m.note])}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <TechCard title="高风险矿区" icon={AlertTriangle} className="border-red-500/20">
          <div className="space-y-1.5">
            {results.filter(r => r.inflowGrade === '大' || r.inflowGrade === '极大').map((r, i) => {
              const idx = results.indexOf(r);
              return (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 rounded-full" style={{ background: GRADE_COLORS[r.inflowGrade] }} />
                  <span className="text-gw-text">{PRESET_MINES[idx].name}</span>
                  <span className="text-gw-muted text-xs">{r.bigWellQh} m³/h</span>
                </div>
              );
            })}
          </div>
        </TechCard>
        <TechCard title="涌水量分级标准" icon={BookOpen}>
          <div className="space-y-1.5">
            {INFLOW_GRADES.map(g => (
              <div key={g.grade} className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full" style={{ background: GRADE_COLORS[g.grade] }} />
                <span className="text-gw-text">{g.grade}</span>
                <span className="text-gw-muted text-xs">{g.range} m³/h</span>
                <span className="text-gw-muted text-xs ml-auto">{g.measure}</span>
              </div>
            ))}
          </div>
        </TechCard>
      </div>
    </div>
  );
}
