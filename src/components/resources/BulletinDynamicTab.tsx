import React from 'react';
import { Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ComposedChart, Line, Legend } from 'recharts';
import { TechCard, StatCard, ChartTooltip, SortableTechTable } from '../UI';

interface GwDynamicDataItem {
  name: string;
  浅层埋深: number;
  浅层变化: number;
  深层埋深: number;
  深层变化: number;
}

interface BulletinDynamicTabProps {
  gwDynamicData: GwDynamicDataItem[];
}

export function BulletinDynamicTab({ gwDynamicData }: BulletinDynamicTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="监测行政区" value={gwDynamicData.length} unit="个" accent="blue" />
        <StatCard title="最大浅层埋深" value={Math.max(...gwDynamicData.map((d: GwDynamicDataItem) => d.浅层埋深)).toFixed(1)} unit="m" accent="red" />
        <StatCard title="最大回升" value={`+${Math.max(...gwDynamicData.map((d: GwDynamicDataItem) => d.浅层变化)).toFixed(2)}`} unit="m" accent="emerald" />
        <StatCard title="最大下降" value={Math.min(...gwDynamicData.map((d: GwDynamicDataItem) => d.浅层变化)).toFixed(2)} unit="m" accent="amber" />
      </div>

      <TechCard title="浅层地下水埋深及变化" badge="2024年 · 含全省平均">
        <ResponsiveContainer width="100%" height={420}>
          <ComposedChart data={gwDynamicData} margin={{ top: 5, right: 20, left: 10, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-45} textAnchor="end" />
            <YAxis yAxisId="left" tick={{ fill: '#9ca3af' }} label={{ value: '埋深(m)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#9ca3af' }} label={{ value: '变化(m)', angle: 90, position: 'insideRight', fill: '#9ca3af' }} />
            <ChartTooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="浅层埋深" name="2024年浅层埋深(m)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" dataKey="浅层变化" name="较上年变化(m)" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: '#10b981' }} />
          </ComposedChart>
        </ResponsiveContainer>
      </TechCard>

      {gwDynamicData.some((d: GwDynamicDataItem) => d.深层埋深 > 0) && (
        <TechCard title="深层地下水埋深及变化" badge="2024年">
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={gwDynamicData.filter((d: GwDynamicDataItem) => d.深层埋深 > 0)} margin={{ top: 5, right: 20, left: 10, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-45} textAnchor="end" />
              <YAxis yAxisId="left" tick={{ fill: '#9ca3af' }} label={{ value: '埋深(m)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#9ca3af' }} />
              <ChartTooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="深层埋深" name="2024年深层埋深(m)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" dataKey="深层变化" name="较上年变化(m)" stroke="#ef4444" strokeWidth={2} dot={{ r: 4, fill: '#ef4444' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </TechCard>
      )}

      <TechCard title="地下水动态明细" badge={`${gwDynamicData.length}个区域`}>
        <SortableTechTable
          headers={['区域', '浅层埋深(m)', '浅层变化(m)', '深层埋深(m)', '深层变化(m)']}
          rows={gwDynamicData.map((d: GwDynamicDataItem) => [
            d.name,
            d.浅层埋深 > 0 ? d.浅层埋深.toFixed(2) : '-',
            d.浅层变化 !== 0 ? (d.浅层变化 > 0 ? `+${d.浅层变化.toFixed(2)}` : d.浅层变化.toFixed(2)) : '-',
            d.深层埋深 > 0 ? d.深层埋深.toFixed(2) : '-',
            d.深层变化 !== 0 ? (d.深层变化 > 0 ? `+${d.深层变化.toFixed(2)}` : d.深层变化.toFixed(2)) : '-',
          ])}
        />
      </TechCard>
    </div>
  );
}
