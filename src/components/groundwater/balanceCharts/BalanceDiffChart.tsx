/*
 * 组件：BalanceDiffChart（拆分自 balanceCharts.tsx）
 */

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { LazyChartCard } from '../../LazyChartCard';
import { ChartExport } from '../../ChartExport';
import { TOOLTIP_STYLE } from '../balanceConstants';

export function BalanceDiffChart({ barData }: {
  barData: Array<{ name: string; 均衡差: number }>;
}) {
  return (
    <LazyChartCard title="各市均衡差（正=盈余/负=亏损）" height={320}>
      <div className="mb-2 flex justify-end">
        <ChartExport data={barData} filename="各市均衡差" sheetName="均衡差" formats={['xlsx', 'csv', 'json']} label="导出数据" />
      </div>
      <ResponsiveContainer width="100%" height={270}>
        <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} angle={-30} textAnchor="end" height={50} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
          <Tooltip {...TOOLTIP_STYLE} />
          {/* 参考线 y=0 */}
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <Bar dataKey="均衡差">
            {barData.map((entry, idx) => (
              <Cell
                key={idx}
                fill={entry.均衡差 >= 0 ? '#10b981' : '#ef4444'}
                opacity={Math.min(1, Math.abs(entry.均衡差) / 10 + 0.3)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 mt-1 text-[10px] text-gw-muted">
        <span className="flex items-center gap-1"><span className="w-3 h-2 rounded bg-emerald-500 inline-block" />盈余</span>
        <span className="flex items-center gap-1"><span className="w-3 h-2 rounded bg-red-500 inline-block" />亏损</span>
        <span>颜色越深=绝对值越大</span>
      </div>
    </LazyChartCard>
  );
}
