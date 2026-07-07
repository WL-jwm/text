import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { paleochannelStructures } from '../../data/waterSource';
import { TechCard, ChartTooltip } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { FilterableTechTable } from '../FilterableTechTable';

export function PaleochannelSection() {
  const widthData = React.useMemo(() =>
    paleochannelStructures.map(p => ({
      name: p.name.length > 5 ? p.name.slice(0, 5) : p.name,
      宽度: parseFloat(p.width) || 0,
      深度: parseInt(p.depth) || 0,
    })),
    []
  );

  return (
    <div className="space-y-4">
      <LazyChartCard title="古河道宽度对比" badge="km" className="scan-line" height={320}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={widthData} layout="vertical" margin={{ top: 10, right: 20, bottom: 5, left: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
            <XAxis type="number" tick={{ fill: '#8b9dc3', fontSize: 10 }} unit="km" />
            <YAxis dataKey="name" type="category" tick={{ fill: '#8b9dc3', fontSize: 10 }} width={50} />
            <Tooltip content={<ChartTooltip title="古河道宽度" unit="km" />} />
            <Bar dataKey="宽度" name="宽度(km)" fill="#f59e0b" radius={[0, 3, 3, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <TechCard title="平原古河道带分布" badge="古河道">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <FilterableTechTable
              headers={['名称', '岩性', '深度(m)', '宽度(km)']}
              rows={paleochannelStructures.map(p => [p.name, p.lithology, p.depth, p.width])}
              pageSize={10}
              filterPlaceholder="搜索..."
            />
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/15">
              <p className="text-[10px] text-gw-muted">古河道特征</p>
              <p className="text-xs text-gw-text">8条主要古河道带贯穿河北平原，以细粉砂+中细砂为主，埋深10~20m，宽度2~15km</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/15">
              <p className="text-[10px] text-gw-muted">水文地质意义</p>
              <p className="text-xs text-gw-text">古河道带是平原区浅层地下水富集地带，单井出水量较大，为农村供水重要水源</p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/15">
              <p className="text-[10px] text-gw-muted">代表性古河道</p>
              <p className="text-xs text-gw-text">滹沱河(最宽12km) / 古黄河(最宽15km) / 漳卫河(10km)</p>
            </div>
          </div>
        </div>
      </TechCard>
    </div>
  );
}
