/**
 * B-22 饮用天然矿泉水水质评价计算器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 输入水质参数 → 界限指标/限量指标/类型判定/综合等级
 *  2. 预设水源地 — 14个产地对比评价
 *  3. 标准对比 — GB 8537 vs GB/T 14848
 *  4. 类型统计 — 矿泉水类型分布分析
 * 面板: PresetPanel（拆分自 MineralWaterCalculatorTab.tsx）
 */
import { calcAllPresetSites, calcMineralWaterSummary, PRESET_SITES } from '../../../utils/mineralWaterCalculator';
import { ChartExport } from '../../ChartExport';
import { FilterableTechTable } from '../../FilterableTechTable';
import { LazyChartCard } from '../../LazyChartCard';
import { StatCard } from '../../UI';
import { useMemo } from 'react';
import { Pie, ResponsiveContainer, Tooltip, Cell, PieChart, BarChart, YAxis, CartesianGrid, Legend, ReferenceLine, XAxis, Bar } from 'recharts';
import { GRADE_COLORS, TOOLTIP_STYLE } from './mineralWaterConstants';

export function PresetPanel() {
  const results = useMemo(() => calcAllPresetSites(), []);
  const summary = useMemo(() => calcMineralWaterSummary(), []);

  const gradeData = useMemo(() => [
    { name: '合格', value: summary.qualified, fill: GRADE_COLORS['合格'] },
    { name: '界限达标', value: summary.borderline, fill: GRADE_COLORS['界限达标'] },
    { name: '不合格', value: summary.unqualified, fill: GRADE_COLORS['不合格'] },
  ], [summary]);

  const sio2Data = useMemo(() => PRESET_SITES.map((s, i) => ({
    name: s.name,
    SiO2: s.sio2,
    Sr: s.strontium,
    界限值: 25,
    Sr界限: 0.2,
    fill: GRADE_COLORS[results[i].grade],
  })), [results]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="水源地总数" value={summary.siteCount} unit="处" accent="text-blue-400" />
        <StatCard title="合格" value={summary.qualified} unit="处" accent="text-emerald-400" />
        <StatCard title="平均SiO₂" value={summary.avgSiO2} unit="mg/L" accent="text-cyan-400" />
        <StatCard title="平均锶" value={summary.avgSr} unit="mg/L" accent="text-amber-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="水质等级分布">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={gradeData} cx="50%" cy="50%" outerRadius={90} dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} stroke="none">
                {gradeData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip {...TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <LazyChartCard title="各水源地SiO₂与锶含量">
          <ChartExport data={sio2Data} filename="矿泉水指标对比" />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={sio2Data} margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9 }} angle={-25} textAnchor="end" height={70} />
              <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: 'SiO₂(mg/L)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: 'Sr(mg/L)', angle: 90, position: 'insideRight', fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine yAxisId="left" y={25} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'SiO₂界限(25)', fill: '#ef4444', fontSize: 9 }} />
              <Bar yAxisId="left" dataKey="SiO2" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              <Bar yAxisId="right" dataKey="Sr" fill="#f59e0b" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>

      <FilterableTechTable
        headers={['水源地', 'SiO₂(mg/L)', 'Sr(mg/L)', '矿化度(mg/L)', '水温(°C)', 'pH', '达标界限数', '类型', '综合等级', '结论']}
        rows={PRESET_SITES.map((s, i) => [
          s.name, s.sio2, s.strontium, s.mineralization, s.temperature, s.ph,
          `${results[i].passedLimitCount}/${results[i].totalLimitCount}`,
          results[i].waterType, results[i].grade, results[i].conclusion.substring(0, 30) + '...',
        ])}
      />
    </div>
  );
}
