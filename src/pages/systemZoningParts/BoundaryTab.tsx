/**
 * 拆分自 SystemZoning.tsx — 边界类型 Tab 面板
 */

import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { zoneBoundaryStats } from '../../data/systemZoning';
import { TechCard, ChartTooltip, CHART_COLORS } from '../../components/UI';
import { LazyChartCard } from '../../components/LazyChartCard';

export function BoundaryTab() {

  const boundaryPie = useMemo(() => zoneBoundaryStats.map((b, i) => ({ name: b.boundaryType, value: b.count, color: CHART_COLORS[i % CHART_COLORS.length] })), []);
  return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <LazyChartCard title="边界类型统计" className="scan-line" height={280}>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={boundaryPie} cx="50%" cy="50%" innerRadius={40} outerRadius={85} dataKey="value" label={({ name, value }) => `${name} ${value}`}>
                    {boundaryPie.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip percentDigits={1} title="类型分布" />} />
                </PieChart>
              </ResponsiveContainer>
            </LazyChartCard>
            <TechCard title="边界类型说明">
              <div className="space-y-2">
                {zoneBoundaryStats.map((b, i) => (
                  <div key={i} className="p-2 bg-gw-surface/50 rounded-lg border border-gw-border/30">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-gw-text">{b.boundaryType}</span>
                      <span className="text-xs font-mono text-gw-highlight">{b.count}条</span>
                    </div>
                    <p className="text-[10px] text-gw-muted mt-1">{b.description}</p>
                  </div>
                ))}
              </div>
            </TechCard>
          </div>
        </div>
  );
}
