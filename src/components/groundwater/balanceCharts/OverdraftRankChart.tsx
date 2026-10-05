/*
 * 组件：OverdraftRankChart（拆分自 balanceCharts.tsx）
 */

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TechCard } from '../../UI';
import { LazyChartCard } from '../../LazyChartCard';
import { ChartExport } from '../../ChartExport';
import { TOOLTIP_STYLE } from '../balanceConstants';

export function OverdraftRankChart({ overdraftData }: {
  overdraftData: Array<{ name: string; 超采量: number; 开采系数: number }>;
}) {
  if (overdraftData.length === 0) {
    return (
      <TechCard title="超采量排名">
        <p className="text-sm text-gw-muted text-center py-8">无超采城市，所有城市开采量均未超出补给量</p>
      </TechCard>
    );
  }
  return (
    <LazyChartCard title="超采量排名（仅列出超采城市）" height={Math.max(280, overdraftData.length * 36 + 60)}>
      <div className="mb-2 flex justify-end">
        <ChartExport data={overdraftData} filename="超采量排名" sheetName="超采排名" formats={['xlsx', 'csv', 'json']} label="导出数据" />
      </div>
      <ResponsiveContainer width="100%" height={Math.max(220, overdraftData.length * 36)}>
        <BarChart data={overdraftData} layout="vertical" margin={{ left: 10, right: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#9ca3af' }} width={55} />
          <Tooltip {...TOOLTIP_STYLE} />
          <Bar dataKey="超采量" radius={[0, 3, 3, 0]} barSize={16} name="超采量 (亿m\u00b3/a)">
            {overdraftData.map((entry) => (
              <Cell
                key={entry.name}
                fill={entry.开采系数 > 1.0 ? '#ef4444' : '#f97316'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </LazyChartCard>
  );
}
