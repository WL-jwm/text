/*
 * 组件：RechargeDischargeBarChart（拆分自 balanceCharts.tsx）
 */

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { LazyChartCard } from '../../LazyChartCard';
import { ChartExport } from '../../ChartExport';
import { TOOLTIP_STYLE } from '../balanceConstants';

export function RechargeDischargeBarChart({ barData }: {
  barData: Array<{ name: string; 补给量: number; 排泄量: number; 均衡差: number }>;
}) {
  return (
    <LazyChartCard title="各市补给-排泄对比" height={320}>
      <div className="mb-2 flex justify-end">
        <ChartExport data={barData} filename="各市补给排泄对比" sheetName="补排对比" formats={['xlsx', 'csv', 'json']} label="导出数据" />
      </div>
      <ResponsiveContainer width="100%" height={270}>
        <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} angle={-30} textAnchor="end" height={50} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
          <Tooltip {...TOOLTIP_STYLE} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="补给量" fill="#3b82f6" radius={[2, 2, 0, 0]} />
          <Bar dataKey="排泄量" fill="#ef4444" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </LazyChartCard>
  );
}
