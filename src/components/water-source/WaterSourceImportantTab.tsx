import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { importantWaterSources } from '../../data/waterSource';
import { TechCard, ChartTooltip, CHART_COLORS } from '../UI';
import { FilterableTechTable } from '../FilterableTechTable';
import { LazyChartCard } from '../LazyChartCard';

interface Props {
  sourceTypePie: { name: string; value: number }[];
}

export function WaterSourceImportantTab({ sourceTypePie }: Props) {
  return (
    <div className="space-y-4">
      <TechCard title="重要水源地一览">
        <FilterableTechTable
          headers={['名称', '类型', '供水量', '含水层', '保护区', '状态']}
          rows={importantWaterSources.map(s => [s.name, s.type, `${s.supply} ${s.unit}`, s.aquifer, s.protection, s.status])}
          pageSize={15}
          filterPlaceholder="搜索..."
        />
      </TechCard>

      {sourceTypePie.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LazyChartCard title="水源地类型数量对比" height={280}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={sourceTypePie}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} angle={-15} textAnchor="end" height={35} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip content={<ChartTooltip unit="处" title="水源地类型" />} />
                <Bar dataKey="value" name="数量(处)" fill="#3b82f6" radius={[2, 2, 0, 0]}>
                  {sourceTypePie.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </LazyChartCard>
          <TechCard title="水源地保护与管理" badge="HJ/T338-2007">
            <div className="space-y-2">
              <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">保护区划分：</span>饮用水水源保护区分为一级、二级和准保护区。一级保护区为开采井周围一定范围（孔隙水一般半径50~500m），禁止一切排污活动。</p>
              <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">河北省现状：</span>全省共划定城镇集中式饮用水水源保护区数百个，其中以地下水水源地为主。南水北调通水后，部分地下水水源地转为备用水源。</p>
              <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">管理要求：</span>水源地需定期开展水质监测（每月/每季度）、水量动态监测和保护区巡查。水质达标率纳入地方政府考核。</p>
            </div>
          </TechCard>
        </div>
      )}
    </div>
  );
}
