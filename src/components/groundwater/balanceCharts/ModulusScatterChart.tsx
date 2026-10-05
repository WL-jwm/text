/*
 * 组件：ModulusScatterChart（拆分自 balanceCharts.tsx）
 */

import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';
import { LazyChartCard } from '../../LazyChartCard';
import { ChartExport } from '../../ChartExport';
import { TOOLTIP_STYLE } from '../balanceConstants';

export function ModulusScatterChart({ scatterData }: {
  scatterData: Array<{ name: string; 开采模数: number; 补给模数: number; area: number; status: string }>;
}) {
  return (
    <LazyChartCard title="开采模数 vs 补给模数（气泡大小=面积）" height={360}>
      <div className="mb-2 flex justify-end">
        <ChartExport data={scatterData} filename="开采补给模数散点" sheetName="模数散点" formats={['xlsx', 'csv', 'json']} label="导出数据" />
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="补给模数" name="补给模数" tick={{ fontSize: 11, fill: '#9ca3af' }}
            label={{ value: '补给模数 (万m\u00b3/km\u00b2\u00b7a)', position: 'bottom', offset: 0, fontSize: 10, fill: '#9ca3af' }} />
          <YAxis dataKey="开采模数" name="开采模数" tick={{ fontSize: 11, fill: '#9ca3af' }}
            label={{ value: '开采模数 (万m\u00b3/km\u00b2\u00b7a)', angle: -90, position: 'insideLeft', offset: 0, fontSize: 10, fill: '#9ca3af' }} />
          <ZAxis dataKey="area" range={[60, 600]} name="面积" />
          <Tooltip {...TOOLTIP_STYLE} />
          <Scatter data={scatterData} name="城市" fill="#3b82f6" />
        </ScatterChart>
      </ResponsiveContainer>
      {/* 对角线参考说明 */}
      <div className="text-center text-[10px] text-gw-muted mt-1">
        对角线以上 = 开采模数 &gt; 补给模数（超采区域）| 气泡越大 = 计算面积越大
      </div>
    </LazyChartCard>
  );
}
