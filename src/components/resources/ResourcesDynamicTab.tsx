import React from 'react';
import { Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, ComposedChart, Line } from 'recharts';
import { cityGroundwaterDynamic2024 } from '../../data/resources';
import { TechCard, StatCard, ChartTooltip } from '../UI';
import { FilterableTechTable } from '../FilterableTechTable';
import { ExportButton } from '../UI';
import { ChartRefLines } from '../ChartAnnotation';

interface ResourcesDynamicTabProps {
  gd: any;
  handleExportDynamic: () => void;
}

export function ResourcesDynamicTab({ gd, handleExportDynamic }: ResourcesDynamicTabProps) {
  const dyData = cityGroundwaterDynamic2024.filter(d => d.shallowDepth != null).map(d => ({
    name: (d.city || '').replace('市', '').replace('平原区', '').replace('全省', '全省'),
    埋深2024: d.shallowDepth,
    变化: d.shallowChange ?? 0,
  }));
  const deepData = cityGroundwaterDynamic2024.filter(d => d.deepDepth != null).map(d => ({
    name: (d.city || '').replace('市', '').replace('平原区', '').replace('全省', '全省'),
    埋深2024: d.deepDepth,
    变化: d.deepChange ?? 0,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="浅层平均埋深" value={gd.shallowLevelRise} unit="m" accent="cyan" subtitle={'全省'} />
        <StatCard title="浅层水位回升" value={`+${gd.shallowLevelRise}`} unit="m" accent="emerald" subtitle={'全省'} />
        <StatCard title="深层平均埋深" value={43.78} unit="m" accent="amber" subtitle={'全省'} />
        <StatCard title="深层水位回升" value={`+${gd.deepLevelRise}`} unit="m" accent="emerald" subtitle={'全省'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TechCard title="浅层地下水埋深及变化" badge="2024年">
          <div className="mb-3 flex justify-end">
            <ExportButton onClick={handleExportDynamic} />
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={dyData} margin={{ top: 5, right: 20, left: 10, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-45} textAnchor="end" />
              <YAxis yAxisId="left" tick={{ fill: '#9ca3af' }} label={{ value: 'm', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#9ca3af' }} />
              <ChartTooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="埋深2024" name="2024年埋深(m)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" dataKey="变化" name="较上年变化(m)" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: '#10b981' }} />
              <ChartRefLines lines={[{ y: 0, stroke: '#ef4444', strokeDasharray: '5 5', label: '' }]} />
            </ComposedChart>
          </ResponsiveContainer>
        </TechCard>

        {deepData.length > 0 && (
          <TechCard title="深层地下水埋深及变化" badge="2024年">
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={deepData} margin={{ top: 5, right: 20, left: 10, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-45} textAnchor="end" />
                <YAxis yAxisId="left" tick={{ fill: '#9ca3af' }} label={{ value: 'm', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#9ca3af' }} />
                <ChartTooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="埋深2024" name="2024年埋深(m)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" dataKey="变化" name="较上年变化(m)" stroke="#ef4444" strokeWidth={2} dot={{ r: 4, fill: '#ef4444' }} />
                <ChartRefLines lines={[{ y: 0, stroke: '#ef4444', strokeDasharray: '5 5', label: '' }]} />
              </ComposedChart>
            </ResponsiveContainer>
          </TechCard>
        )}
      </div>

      <TechCard title="各市地下水动态明细" badge={cityGroundwaterDynamic2024.length + '条'}>
        <FilterableTechTable
          headers={['区域', '浅层埋深(m)', '浅层变化(m)', '深层埋深(m)', '深层变化(m)', '蓄变量(亿m³)']}
          rows={cityGroundwaterDynamic2024.map(d => [
            d.city || '-',
            d.shallowDepth?.toFixed(2) ?? '-',
            d.shallowChange != null ? (d.shallowChange >= 0 ? `+${d.shallowChange.toFixed(2)}` : d.shallowChange.toFixed(2)) : '-',
            d.deepDepth?.toFixed(2) ?? '-',
            d.deepChange != null ? (d.deepChange >= 0 ? `+${d.deepChange.toFixed(2)}` : d.deepChange.toFixed(2)) : '-',
            (d.shallowChange ?? 0).toFixed(2) ?? '-',
          ])}
          filterPlaceholder="搜索..."
        />
      </TechCard>
    </div>
  );
}
