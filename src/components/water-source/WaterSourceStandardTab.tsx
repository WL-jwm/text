import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { waterSourceScaleStandard } from '../../data/waterSource';
import { TechCard, TechTable, ChartTooltip } from '../UI';
import { LazyChartCard } from '../LazyChartCard';

export function WaterSourceStandardTab() {
  // 阈值数值化：取范围上限
  const chartData = React.useMemo(() =>
    waterSourceScaleStandard.map(s => {
      let val = 0;
      if (s.threshold.startsWith('<')) val = parseFloat(s.threshold.slice(1));
      else if (s.threshold.startsWith('≥')) val = parseFloat(s.threshold.slice(1));
      else if (s.threshold.includes('~')) val = parseFloat(s.threshold.split('~')[1]);
      else val = parseFloat(s.threshold) || 0;
      return { name: s.scale, threshold: val, desc: s.description };
    }),
    []
  );

  return (
    <div className="space-y-4">
      <LazyChartCard title="水源地规模分级" badge="万m³/d" className="scan-line" height={320}>
        <div className="flex items-center gap-3 mb-2 text-[10px] text-gw-muted">
          <span>柱高=允许开采量阈值(万m³/d)</span>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 10, right: 20, bottom: 40, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
            <XAxis dataKey="name" tick={{ fill: '#8b9dc3', fontSize: 10 }} />
            <YAxis tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: '万m³/d', angle: -90, position: 'insideLeft', style: { fill: '#8b9dc3', fontSize: 10 } }} />
            <Tooltip content={<ChartTooltip title="规模阈值" unit="万m³/d" />} />
            <Bar dataKey="threshold" name="允许开采量" radius={[3, 3, 0, 0]}>
              {chartData.map((_, i: number) => (
                <rect key={i} fill={['#10b981', '#3b82f6', '#f59e0b', '#ef4444'][i] || '#64748b'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <TechCard title="水源地规模分级标准(GB/T 14848)">
        <TechTable
          title={`${waterSourceScaleStandard.length} 个规模等级`}
          headers={['规模', '允许开采量', '单位', '说明']}
          rows={waterSourceScaleStandard.map(s => [s.scale, s.threshold, s.unit, s.description])}
          pageSize={10}
        />
      </TechCard>
    </div>
  );
}
