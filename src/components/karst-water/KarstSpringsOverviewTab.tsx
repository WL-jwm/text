import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Mountain, Compass, Gauge } from 'lucide-react';
import { karstSprings } from '../../data/karstWater';
import { TechCard, ChartTooltip, CHART_COLORS, ExportButton } from '../UI';
import { FilterableTechTable } from '../FilterableTechTable';
import { LazyChartCard } from '../LazyChartCard';

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  springAreaData: any[];
  handleExportSprings: () => void;
}

export function KarstSpringsOverviewTab({ springAreaData, handleExportSprings }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="泉域面积分布" badge={`${springAreaData.length} 个泉域`} icon={Mountain} height={280}>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={springAreaData} cx="50%" cy="50%" outerRadius={90} dataKey="value"
                label={({ name, percent }) => `${name.length > 5 ? name.substring(0, 5) + '..' : name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false} stroke="none">
                {springAreaData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <ChartTooltip unit="km²" />
            </PieChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <TechCard title="泉域现状一览" icon={Compass}>
          <FilterableTechTable
            headers={['泉域名称', '位置', '类型', '流量(m³/s)', '面积(km²)', '矿化度(g/L)']}
            rows={karstSprings.map(s => [s.name, s.location, s.type, s.discharge, s.area, s.tds])}
            pageSize={10}
            filterPlaceholder="搜索..."
          />
        </TechCard>
      </div>

      <LazyChartCard title="泉域流量分布" icon={Gauge} height={280}>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={karstSprings.filter(s => s.discharge !== '-').map(s => ({
            name: s.name.length > 6 ? s.name.substring(0, 6) : s.name,
            流量: parseFloat(s.discharge) || 0,
          }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--gw-border, #1a2d4d)" />
            <XAxis dataKey="name" tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 10 }} />
            <YAxis tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 10 }} />
            <ChartTooltip unit="m³/s" />
            <Bar dataKey="流量" fill="var(--gw-cyan, #06b6d4)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <div className="flex items-center gap-2">
        <ExportButton onClick={handleExportSprings} label="导出泉域数据" />
      </div>
    </div>
  );
}
