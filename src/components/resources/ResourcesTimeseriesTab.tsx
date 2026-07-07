import React from 'react';
import { XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, AreaChart, Area, LineChart, Line } from 'recharts';
import { resourceTimeSeries } from '../../data/resources';
import { TechCard, ChartTooltip } from '../UI';
import { FilterableTechTable } from '../FilterableTechTable';
import { ExportButton } from '../UI';

interface ResourcesTimeseriesTabProps {
  handleExportTimeseries: () => void;
}

export function ResourcesTimeseriesTab({ handleExportTimeseries }: ResourcesTimeseriesTabProps) {
  const tsData = resourceTimeSeries.map(r => ({
    name: r.year,
    地表水: r.surface,
    地下水: r.ground,
    总量: r.total,
    降水: '-',
  }));
  const gwData = resourceTimeSeries.filter(r => Number(r.year) >= 2015).map(r => ({
    name: r.year,
    浅层埋深: '-',
    深层埋深: '-',
  }));

  return (
    <div className="space-y-6">
      <TechCard title="水资源量时序变化" badge="2000-2024">
        <div className="mb-3 flex justify-end">
          <ExportButton onClick={handleExportTimeseries} />
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={tsData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" tick={{ fill: '#9ca3af' }} />
            <YAxis tick={{ fill: '#9ca3af' }} label={{ value: '亿m³', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
            <ChartTooltip unit="亿m³" />
            <Legend />
            <Area type="monotone" dataKey="地表水" stackId="1" stroke="#3b82f6" fill="#3b82f620" />
            <Area type="monotone" dataKey="地下水" stackId="1" stroke="#10b981" fill="#10b98120" />
          </AreaChart>
        </ResponsiveContainer>
      </TechCard>

      {gwData.length > 0 && (
        <TechCard title="地下水埋深时序" badge="2015-2024">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={gwData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af' }} />
              <YAxis tick={{ fill: '#9ca3af' }} label={{ value: 'm', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
              <ChartTooltip unit="m" />
              <Legend />
              <Line type="monotone" dataKey="浅层埋深" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="深层埋深" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </TechCard>
      )}

      <TechCard title="时序数据明细" badge={`${tsData.length}年`}>
        <FilterableTechTable
          headers={['年份', '降水(mm)', '地表水(亿m³)', '地下水(亿m³)', '总量(亿m³)']}
          rows={resourceTimeSeries.map(r => [r.year, '-', r.surface.toFixed(2), r.ground.toFixed(2), r.total.toFixed(2)])}
          filterPlaceholder="搜索年份..."
        />
      </TechCard>
    </div>
  );
}
