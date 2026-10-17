/**
 * B-22 饮用天然矿泉水水质评价计算器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 输入水质参数 → 界限指标/限量指标/类型判定/综合等级
 *  2. 预设水源地 — 14个产地对比评价
 *  3. 标准对比 — GB 8537 vs GB/T 14848
 *  4. 类型统计 — 矿泉水类型分布分析
 * 面板: TypePanel（拆分自 MineralWaterCalculatorTab.tsx）
 */
import { calcMineralWaterSummary, PRESET_SITES } from '../../../utils/mineralWaterCalculator';
import { ChartExport } from '../../ChartExport';
import { LazyChartCard } from '../../LazyChartCard';
import { StatCard } from '../../UI';
import { useMemo } from 'react';
import { Pie, ResponsiveContainer, Tooltip, Cell, PieChart, BarChart, YAxis, CartesianGrid, Legend, ReferenceLine, XAxis, Bar } from 'recharts';
import { TOOLTIP_STYLE } from './mineralWaterConstants';

export function TypePanel() {
  const summary = useMemo(() => calcMineralWaterSummary(), []);

  const typePieData = useMemo(() =>
    Object.entries(summary.typeCounts).map(([k, v]) => ({ name: k, value: v })),
    [summary],
  );

  const TYPE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const tempData = useMemo(() => PRESET_SITES.map(s => ({
    name: s.name,
    水温: s.temperature,
    SiO2: s.sio2,
  })), []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="最高SiO₂" value={summary.maxSiO2} unit="mg/L" accent="text-blue-400" />
        <StatCard title="最高锶" value={summary.maxSr} unit="mg/L" accent="text-amber-400" />
        <StatCard title="合格率" value={`${Math.round(summary.qualified / summary.siteCount * 100)}%`} accent="text-emerald-400" />
        <StatCard title="类型数" value={Object.keys(summary.typeCounts).length} unit="种" accent="text-violet-400" />
      </div>

      <LazyChartCard title="矿泉水类型分布">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={typePieData} cx="50%" cy="50%" outerRadius={90} dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} stroke="none">
              {typePieData.map((_, idx) => (
                <Cell key={idx} fill={TYPE_COLORS[idx % TYPE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip {...TOOLTIP_STYLE} />
          </PieChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <LazyChartCard title="各水源地水温与SiO₂对比">
        <ChartExport data={tempData} filename="矿泉水水温SiO2对比" />
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={tempData} margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9 }} angle={-25} textAnchor="end" height={70} />
            <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '°C', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: 'mg/L', angle: 90, position: 'insideRight', fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <ReferenceLine yAxisId="left" y={25} stroke="#ef4444" strokeDasharray="5 5" label={{ value: '温水界限(25°C)', fill: '#ef4444', fontSize: 9 }} />
            <Bar yAxisId="left" dataKey="水温" fill="#ef4444" radius={[3, 3, 0, 0]} />
            <Bar yAxisId="right" dataKey="SiO2" fill="#3b82f6" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <div className="bg-gw-card-alt rounded-lg p-4">
        <p className="text-xs text-gw-muted leading-relaxed">
          <strong className="text-gw-text">河北省矿泉水特征：</strong>
          {' '}河北省矿泉水以偏硅酸型为主导（SiO₂ 22~45mg/L），约57%的水源地属此类型。
          {' '}偏硅酸锶复合型约占29%，品质最优。锶型约占14%，集中分布在隆化、涞水、涉县等地。
          {' '}水温方面，平山温塘（68°C）和赤城汤泉（58°C）属温热矿泉水，具有理疗价值。
          {' '}14处水源地中{summary.qualified}处综合评价合格，合格率{Math.round(summary.qualified / summary.siteCount * 100)}%。
        </p>
      </div>
    </div>
  );
}
