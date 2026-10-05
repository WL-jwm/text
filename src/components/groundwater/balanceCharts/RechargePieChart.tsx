/*
 * 组件：RechargePieChart（拆分自 balanceCharts.tsx）
 */

import { Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { LazyChartCard } from '../../LazyChartCard';
import { ChartExport } from '../../ChartExport';
import { fmt } from '../../../utils/balanceCalculator';
import { TOOLTIP_STYLE, CHART_COLORS } from '../balanceConstants';

export function RechargePieChart({ pieData }: {
  pieData: Array<{ name: string; value: number }>;
}) {
  return (
    <LazyChartCard title="补给项结构（全省汇总）" height={320}>
      <div className="mb-2 flex justify-end">
        <ChartExport data={pieData} filename="补给项结构" sheetName="补给结构" formats={['xlsx', 'csv', 'json']} label="导出数据" />
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={95}
            paddingAngle={2}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
            labelLine={{ stroke: '#6b7280' }}
          >
            {pieData.map((_, idx) => (
              <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            {...TOOLTIP_STYLE}
            formatter={(value: number) => [`${fmt(value)} 亿m\u00b3/a`, '']}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </LazyChartCard>
  );
}
