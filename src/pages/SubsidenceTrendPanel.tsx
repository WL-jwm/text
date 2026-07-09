// SubsidenceTrendPanel
// 提取自 TimeSeriesAnalysis.tsx Phase 6b 拆分

import React, { useMemo } from 'react';
import { Activity, Droplets, Layers, TrendingDown } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ComposedChart, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartTooltip, DataSourceNote, StatCard, TechCard } from '../components/UI';
import { ChartExport } from '../components/ChartExport';
import { ChartRefLines } from '../components/ChartAnnotation';
import { TS_FULL_YEARS, citySubsidenceYearly, subsidenceYearlySummary } from '../data/historicalTimeSeries';
import { CITY_COLORS, ALL_CITIES} from './timeSeriesUtils';

export function SubsidenceTrendPanel({ selected }: { selected: Set<string> }) {
  const cities = useMemo(() => ALL_CITIES.filter(c => selected.has(c)), [selected]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="全省均值(2024)" value={subsidenceYearlySummary[subsidenceYearlySummary.length - 1].avgRate.toFixed(1)} unit="mm/a" icon={TrendingDown} subtitle="较2014年降74%" accent="emerald" />
        <StatCard title="最大沉降城市" value={subsidenceYearlySummary[subsidenceYearlySummary.length - 1].maxCity} unit="" icon={Layers} subtitle={`${subsidenceYearlySummary[subsidenceYearlySummary.length - 1].maxRate}mm/a`} accent="red" />
        <StatCard title="10年降幅" value={((1 - subsidenceYearlySummary[subsidenceYearlySummary.length - 1].avgRate / subsidenceYearlySummary[0].avgRate) * 100).toFixed(0)} unit="%" icon={Activity} subtitle="沉降减缓显著" accent="cyan" />
        <StatCard title="全部改善" value={subsidenceYearlySummary[subsidenceYearlySummary.length - 1].improvingCities} unit="市" icon={Droplets} subtitle="11市全部改善" accent="blue" />
      </div>

      {/* 各市沉降速率折线 */}
      <TechCard title="各市沉降速率年度变化(2014-2024)" badge="mm/a" className="hud-corners">
        <ChartExport data={TS_FULL_YEARS.map(y => ({ year: y, ...Object.fromEntries(cities.map(c => [c, citySubsidenceYearly[c]?.[y] ?? null])) }))} filename="沉降速率趋势2014-2024" sheetName="沉降趋势" formats={['xlsx', 'csv', 'json']} label="导出数据" />
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={TS_FULL_YEARS.map(y => ({ year: y, ...Object.fromEntries(cities.map(c => [c, citySubsidenceYearly[c]?.[y] ?? null])) }))} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
            <XAxis dataKey="year" tick={{ fill: '#8b9dc3', fontSize: 10 }} />
            <YAxis tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: 'mm/a', angle: -90, position: 'insideLeft', fill: '#8b9dc3' }} />
            <Tooltip content={<ChartTooltip unit="mm/a" title="沉降速率" />} />
            <Legend wrapperStyle={{ fontSize: 9 }} />
            <ChartRefLines lines={[{ y: 30, stroke: '#ef4444', strokeDasharray: '6 3', label: '30mm/a 治理目标', position: 'top', fontSize: 9 }]} />
            {cities.map(c => (
              <Line key={c} type="monotone" dataKey={c} name={c} stroke={CITY_COLORS[c] || '#64748b'} strokeWidth={2} dot={{ r: 2 }} connectNulls />
            ))}
          </LineChart>
        </ResponsiveContainer>
        <DataSourceNote source="沧州沉降速率从65mm/a降至14.5mm/a，降幅77.7%，治理成效最为显著" />
      </TechCard>

      {/* 全省均值面积图 */}
      <TechCard title="全省沉降速率均值变化" badge="11市平均">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={subsidenceYearlySummary} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
            <XAxis dataKey="year" tick={{ fill: '#8b9dc3', fontSize: 10 }} />
            <YAxis tick={{ fill: '#8b9dc3', fontSize: 10 }} domain={[0, 35]} label={{ value: 'mm/a', angle: -90, position: 'insideLeft', fill: '#8b9dc3' }} />
            <Tooltip content={<ChartTooltip unit="mm/a" title="全省均值" />} />
            <ChartRefLines lines={[{ y: 30, stroke: '#ef4444', strokeDasharray: '6 3', label: '30mm/a', position: 'top', fontSize: 9 }]} />
            <Area type="monotone" dataKey="avgRate" name="平均沉降速率" fill="#ef4444" stroke="#ef4444" fillOpacity={0.15} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </TechCard>

      {/* 沉降-开采关联 */}
      <TechCard title="沉降速率 vs 开采量关联(2024)" badge="双轴">
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={subsidenceYearlySummary} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
            <XAxis dataKey="year" tick={{ fill: '#8b9dc3', fontSize: 10 }} />
            <YAxis yAxisId="sub" tick={{ fill: '#8b9dc3', fontSize: 10 }} domain={[0, 35]} label={{ value: 'mm/a', angle: -90, position: 'insideLeft', fill: '#8b9dc3' }} />
            <YAxis yAxisId="gw" orientation="right" tick={{ fill: '#8b9dc3', fontSize: 10 }} domain={[80, 160]} label={{ value: '亿m³', angle: 90, position: 'insideRight', fill: '#8b9dc3' }} />
            <Tooltip content={<ChartTooltip title="沉降-开采" />} />
            <Legend wrapperStyle={{ fontSize: 9 }} />
            <Line yAxisId="sub" type="monotone" dataKey="avgRate" name="沉降速率(mm/a)" stroke="#ef4444" strokeWidth={2} />
            <Line yAxisId="gw" type="monotone" dataKey="gwExploitation" name="地下水开采(亿m³)" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 3" />
          </ComposedChart>
        </ResponsiveContainer>
        <DataSourceNote source="沉降速率与开采量呈高度正相关(r=0.97)，减采是控制沉降的核心措施" />
      </TechCard>
    </div>
  );
}

// ── 水质改善 Tab ──
