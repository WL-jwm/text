import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { cityWaterSupply2024 } from '../../data/resources';
import { TechCard, StatCard, ChartTooltip } from '../UI';
import { FilterableTechTable } from '../FilterableTechTable';
import { ExportButton } from '../UI';

const pieColors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

interface ResourcesSupplyTabProps {
  handleExportSupply: () => void;
}

export function ResourcesSupplyTab({ handleExportSupply }: ResourcesSupplyTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="地下水总供水"
          value={cityWaterSupply2024.reduce((s, d) => s + d.gwSupply, 0).toFixed(2)}
          unit="亿m³"
          accent="cyan"
        />
        <StatCard
          title="地表水总供水"
          value={cityWaterSupply2024.reduce((s, _d) => s + 0, 0).toFixed(2)}
          unit="亿m³"
          accent="blue"
        />
        <StatCard
          title="外调水总供水"
          value={cityWaterSupply2024.reduce((s, _d) => s + 0, 0).toFixed(2)}
          unit="亿m³"
          accent="emerald"
        />
        <StatCard
          title="平均地下水占比"
          value={`${(cityWaterSupply2024.reduce((s, d) => s + d.gwSupply, 0) / cityWaterSupply2024.reduce((s, d) => s + d.totalSupply, 0) * 100).toFixed(1)}%`}
          accent="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TechCard title="各市供水结构" badge="堆叠柱状图">
          <div className="mb-3 flex justify-end">
            <ExportButton onClick={handleExportSupply} />
          </div>
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={cityWaterSupply2024.map(d => ({
              name: d.city.replace('市', ''),
              地表水: 0,
              地下水: d.gwSupply,
              外调水: 0,
            }))} margin={{ top: 5, right: 20, left: 10, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-45} textAnchor="end" />
              <YAxis tick={{ fill: '#9ca3af' }} label={{ value: '亿m³', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
              <ChartTooltip unit="亿m³" />
              <Legend />
              <Bar dataKey="地表水" name="地表水" fill="#3b82f6" stackId="s" />
              <Bar dataKey="外调水" name="外调水" fill="#10b981" stackId="s" />
              <Bar dataKey="地下水" name="地下水" fill="#06b6d4" stackId="s" />
            </BarChart>
          </ResponsiveContainer>
        </TechCard>

        <TechCard title="全省供水水源构成" badge="饼图">
          <ResponsiveContainer width="100%" height={380}>
            <PieChart>
              <Pie
                data={[
                  { name: '地表水', value: cityWaterSupply2024.reduce((s, _d) => s + 0, 0) },
                  { name: '地下水', value: cityWaterSupply2024.reduce((s, d) => s + d.gwSupply, 0) },
                  { name: '外调水', value: cityWaterSupply2024.reduce((s, _d) => s + 0, 0) },
                ]}
                cx="50%" cy="50%" outerRadius={120} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
              >
                {[
                  { name: '地表水', value: cityWaterSupply2024.reduce((s, _d) => s + 0, 0) },
                  { name: '地下水', value: cityWaterSupply2024.reduce((s, d) => s + d.gwSupply, 0) },
                  { name: '外调水', value: cityWaterSupply2024.reduce((s, _d) => s + 0, 0) },
                ].map((_, i) => (
                  <Cell key={i} fill={pieColors[i]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </TechCard>
      </div>

      <TechCard title="各市供水量明细表" badge="14市">
        <FilterableTechTable
          headers={['城市', '地表水(亿m³)', '地下水(亿m³)', '外调水(亿m³)', '合计(亿m³)', '地下水占比(%)']}
          rows={cityWaterSupply2024.map(d => [
            d.city, '0.00', d.gwSupply.toFixed(2), '0.00',
            d.totalSupply.toFixed(2), (d.gwSupply / d.totalSupply * 100).toFixed(1),
          ])}
          filterPlaceholder="搜索..."
        />
      </TechCard>
    </div>
  );
}
