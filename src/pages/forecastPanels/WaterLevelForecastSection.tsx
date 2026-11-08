/**
 * 拆分自 ForecastPanels.tsx — WaterLevelForecastSection
 */

import { useMemo } from 'react';
import { CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartTooltip, DataSourceNote, TechCard } from '../../components/UI';
import { ChartExport } from '../../components/ChartExport';
import { ChartRefLines } from '../../components/ChartAnnotation';
import { cityWaterLevelYearly } from '../../data/historicalTimeSeries';
import { CITY_COLORS, YEARS, FORECAST_YEARS, linearForecast } from '../timeSeriesUtils';

export function WaterLevelForecastSection({ cities }: { cities: string[] }) {
  const forecastData = useMemo(() => {
    return [
      ...YEARS.map(year => {
        const point: Record<string, number | string> = { year };
        cities.forEach(city => {
          point[city] = cityWaterLevelYearly[city]?.[year] ?? null;
        });
        return point;
      }),
      ...FORECAST_YEARS.map(year => {
        const point: Record<string, number | string> = { year, isForecast: 'true' };
        cities.forEach(city => {
          const data = cityWaterLevelYearly[city];
          const vals = YEARS.map(y => data?.[y] ?? null);
          const { forecast } = linearForecast(vals, YEARS, [year]);
          point[city] = forecast[year] ?? 0;
        });
        return point;
      }),
    ];
  }, [cities]);

  if (cities.length === 0) return null;
  return (
    <TechCard title="水位埋深趋势+预测(虚线)" badge="2014-2026" className="hud-corners">
      <ChartExport data={forecastData} filename="水位埋深预测2014-2026" sheetName="水位预测" formats={['xlsx', 'csv', 'json']} label="导出数据" />
      <ResponsiveContainer width="100%" height={Math.max(300, cities.length * 8 + 260)}>
        <ComposedChart data={forecastData} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
          <XAxis dataKey="year" tick={{ fill: '#8b9dc3', fontSize: 11 }} />
          <YAxis tick={{ fill: '#8b9dc3', fontSize: 11 }} label={{ value: 'm', angle: -90, position: 'insideLeft', fill: '#8b9dc3' }} />
          <Tooltip content={<ChartTooltip unit="m" title="水位埋深" />} />
          <Legend wrapperStyle={{ fontSize: 10, maxHeight: 60, overflow: 'auto' }} />
          <ChartRefLines lines={[{ x: 2024.5, stroke: '#64748b', strokeDasharray: '4 2', label: '预测', position: 'top', fontSize: 9 }]} />
          {cities.map(city => (
            <Line key={city} type="monotone" dataKey={city} stroke={CITY_COLORS[city] || '#64748b'} strokeWidth={2} dot={{ r: 2 }} connectNulls />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
      <DataSourceNote source="基于2014-2024年线性回归外推，实际受降水、开采政策等影响" />
    </TechCard>
  );
}
