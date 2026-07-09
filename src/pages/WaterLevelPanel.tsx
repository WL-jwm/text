// WaterLevelPanel
// 提取自 TimeSeriesAnalysis.tsx Phase 6b 拆分

import React, { useMemo } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartTooltip, DataSourceNote, StatCard, TechCard } from '../components/UI';
import { ChartExport } from '../components/ChartExport';
import { ChartRefLines } from '../components/ChartAnnotation';
import { FilterableTechTable } from '../components/FilterableTechTable';
import { TS_FULL_YEARS, cityWaterLevelYearly, waterLevelYearlySummary } from '../data/historicalTimeSeries';
import { cityGroundwaterDynamic2024 } from '../data/resources-bulletin';
import { CITY_COLORS, ALL_CITIES} from './timeSeriesUtils';

export function WaterLevelPanel({ selected }: { selected: Set<string> }) {
  const cities = useMemo(() => ALL_CITIES.filter(c => selected.has(c)), [selected]);

  const chartData = useMemo(() => {
    const shallowCities = cityGroundwaterDynamic2024.filter(c => c.shallowDepth !== null);
    const deepCities = cityGroundwaterDynamic2024.filter(c => c.deepDepth !== null);
    return { shallowCities, deepCities };
  }, []);

  const displayData = useMemo(() => {
    return chartData.shallowCities.filter(c => cities.includes(c.city));
  }, [cities, chartData]);

  const deepData = useMemo(() => {
    return chartData.deepCities.filter(c => cities.includes(c.city));
  }, [cities, chartData]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="浅层平均埋深" value={`${(displayData.reduce((s, c) => s + (c.shallowDepth ?? 0), 0) / (displayData.length || 1)).toFixed(1)}`} unit="m" accent="blue" subtitle={`${displayData.length}市平均`} />
        <StatCard title="深层平均埋深" value={`${(deepData.reduce((s, c) => s + (c.deepDepth ?? 0), 0) / (deepData.length || 1)).toFixed(1)}`} unit="m" accent="cyan" subtitle={`${deepData.length}市有数据`} />
        <StatCard title="最浅(浅层)" value={displayData.length > 0 ? `${Math.min(...displayData.map(c => c.shallowDepth ?? 999)).toFixed(1)}` : '—'} unit="m" accent="emerald" subtitle="最小值" />
        <StatCard title="最深(浅层)" value={displayData.length > 0 ? `${Math.max(...displayData.map(c => c.shallowDepth ?? 0)).toFixed(1)}` : '—'} unit="m" accent="amber" subtitle="最大值" />
      </div>

      {/* 浅层埋深柱状图 */}
      <TechCard title="各市浅层地下水埋深(2024)" badge="m" className="hud-corners">
        {displayData.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gw-muted text-sm">请选择城市</div>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(250, displayData.length * 30 + 40)}>
            <BarChart
              data={[...displayData].sort((a, b) => (b.shallowDepth ?? 0) - (a.shallowDepth ?? 0))}
              layout="vertical"
              margin={{ top: 10, right: 20, bottom: 5, left: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis type="number" tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: 'm', position: 'insideBottom', fill: '#8b9dc3' }} />
              <YAxis dataKey="city" type="category" tick={{ fill: '#8b9dc3', fontSize: 10 }} width={55} />
              <Tooltip content={<ChartTooltip unit="m" title="水位埋深" />} />
              <Bar dataKey="shallowDepth" name="浅层埋深(m)" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              {deepData.length > 0 && (
                <Bar dataKey="deepDepth" name="深层埋深(m)" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              )}
            </BarChart>
          </ResponsiveContainer>
        )}
      </TechCard>

      {/* 年变化量图 */}
      <TechCard title="各市水位年回升量(2024)" badge="m/a">
        {displayData.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-gw-muted text-sm">请选择城市</div>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(200, displayData.length * 25 + 40)}>
            <BarChart
              data={[...displayData].sort((a, b) => (b.shallowChange ?? 0) - (a.shallowChange ?? 0))}
              layout="vertical"
              margin={{ top: 10, right: 20, bottom: 5, left: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis type="number" tick={{ fill: '#8b9dc3', fontSize: 10 }} />
              <YAxis dataKey="city" type="category" tick={{ fill: '#8b9dc3', fontSize: 10 }} width={55} />
              <Tooltip content={<ChartTooltip unit="m" title="年回升量" />} />
              <Bar dataKey="shallowChange" name="浅层回升(m)" fill="#10b981" radius={[0, 4, 4, 0]} />
              <Bar dataKey="deepChange" name="深层回升(m)" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </TechCard>

      {/* 明细表 */}
      {displayData.length > 0 && (
        <TechCard title="各市水位埋深数据明细(2024)" badge="m">
          <FilterableTechTable
            headers={['城市', '浅层埋深(m)', '浅层年变化(m)', '深层埋深(m)', '深层年变化(m)', '超采状况说明']}
            rows={displayData.map(c => [
              c.city,
              c.shallowDepth?.toFixed(2) ?? '—',
              c.shallowChange?.toFixed(2) ?? '—',
              c.deepDepth?.toFixed(2) ?? '—',
              c.deepChange?.toFixed(2) ?? '—',
              c.overExploit ?? '—',
            ])}
            pageSize={10}
          />
        </TechCard>
      )}
      {/* 年度趋势折线图(2014-2024) */}
      <TechCard title="各市水位埋深年度变化趋势(2014-2024)" badge="m" className="hud-corners">
        <ChartExport data={TS_FULL_YEARS.map(y => ({ year: y, ...Object.fromEntries(cities.map(c => [c, cityWaterLevelYearly[c]?.[y] ?? null])) }))} filename="水位埋深趋势2014-2024" sheetName="水位趋势" formats={['xlsx', 'csv', 'json']} label="导出数据" />
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={TS_FULL_YEARS.map(y => ({ year: y, ...Object.fromEntries(cities.map(c => [c, cityWaterLevelYearly[c]?.[y] ?? null])) }))} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
            <XAxis dataKey="year" tick={{ fill: '#8b9dc3', fontSize: 10 }} />
            <YAxis tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: 'm', angle: -90, position: 'insideLeft', fill: '#8b9dc3' }} />
            <Tooltip content={<ChartTooltip unit="m" title="水位埋深" />} />
            <Legend wrapperStyle={{ fontSize: 9 }} />
            <ChartRefLines lines={[{ y: 2018, stroke: '#22c55e', strokeDasharray: '6 3', label: '2018 回升拐点', position: 'top', fontSize: 9 }]} />
            {cities.map(c => (
              <Line key={c} type="monotone" dataKey={c} name={c} stroke={CITY_COLORS[c] || '#64748b'} strokeWidth={2} dot={{ r: 2 }} connectNulls />
            ))}
          </LineChart>
        </ResponsiveContainer>
        <DataSourceNote source="2018年起全省水位普遍止跌回升，山前平原回升幅度最大" />
      </TechCard>

      {/* 全省均值趋势 */}
      <TechCard title="全省水位埋深均值变化" badge="11市平均">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={waterLevelYearlySummary} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
            <XAxis dataKey="year" tick={{ fill: '#8b9dc3', fontSize: 10 }} />
            <YAxis tick={{ fill: '#8b9dc3', fontSize: 10 }} domain={[15, 30]} label={{ value: 'm', angle: -90, position: 'insideLeft', fill: '#8b9dc3' }} />
            <Tooltip content={<ChartTooltip unit="m" title="全省均值" />} />
            <Area type="monotone" dataKey="avgDepth" name="平均埋深" fill="#3b82f6" stroke="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </TechCard>
    </div>
  );
}

// ── 沉降趋势 Tab ──
