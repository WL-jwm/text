/**
 * 拆分自 MineralWater.tsx — 产地分布面板（类型分布饼图 / 产地一览表 / 指标对比 / 导出）
 */

import { useMemo } from 'react';
import {
  Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, ComposedChart, Line,
} from 'recharts';
import { Compass, Database, Beaker } from 'lucide-react';
import { TechCard, ChartTooltip, CHART_COLORS, ExportButton } from '../../components/UI';
import { mineralWaterSites, mineralWaterTypes } from '../../data/mineralWater';
import { LazyChartCard } from '../../components/LazyChartCard';
import { FilterableTechTable } from '../../components/FilterableTechTable';
import { ChartExport } from '../../components/ChartExport';

interface SitesTabPanelProps {
  onExport: () => void;
}

export function SitesTabPanel({ onExport }: SitesTabPanelProps) {
  // 产地类型分布
  const typePieData = useMemo(() =>
    mineralWaterTypes.map(t => ({ name: t.type, value: t.count })),
    []
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="产地类型分布" icon={Compass} height={280}>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={typePieData} cx="50%" cy="50%" outerRadius={90} dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} stroke="none">
                {typePieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <ChartTooltip />
            </PieChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <TechCard title="产地一览" icon={Database}>
          <div className="mb-3 flex justify-end">
            <ChartExport data={mineralWaterSites} filename="mineral-water-sites" sheetName="矿泉水产地" formats={['xlsx','csv','json']} label="导出数据" />
          </div>
          <FilterableTechTable
              headers={['名称', '位置', '类型', '水温', '日产量(m³/d)', '状态']}
            rows={mineralWaterSites.map(s => [s.name, s.location, s.type, s.temperature, s.dailyYield, s.status])}
            pageSize={10}
          
                          filterPlaceholder="搜索..."
          />
        </TechCard>
      </div>

      <LazyChartCard title="各产地指标对比" icon={Beaker} height={280}>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={mineralWaterSites.map(s => ({
            name: s.name.length > 5 ? s.name.substring(0, 5) : s.name,
            SiO2: parseFloat(s.siO2) || 0,
            锶mgL: parseFloat(s.strontium) || 0,
            pH: parseFloat(s.ph) || 7,
          }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--gw-border, #1a2d4d)" />
            <XAxis dataKey="name" tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 9 }} />
            <YAxis tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 10 }} />
            <ChartTooltip />
            <Bar dataKey="SiO2" fill="var(--gw-cyan, #06b6d4)" name="SiO₂(mg/L)" radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="锶mgL" stroke="var(--gw-amber, #f59e0b)" name="锶(mg/L)" strokeWidth={2} dot={{ r: 3 }} />
            <Legend wrapperStyle={{ fontSize: 10, color: 'var(--gw-muted, #64748b)' }} />
          </ComposedChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <div className="flex items-center gap-2">
        <ExportButton onClick={onExport} label="导出矿泉水数据" />
      </div>
    </div>
  );
}
