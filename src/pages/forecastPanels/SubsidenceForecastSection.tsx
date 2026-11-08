/**
 * 拆分自 ForecastPanels.tsx — SubsidenceForecastSection
 */

import { useMemo } from 'react';
import { CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartTooltip, DataSourceNote, TechCard } from '../../components/UI';
import { ChartExport } from '../../components/ChartExport';
import { ChartRefLines } from '../../components/ChartAnnotation';
import { FilterableTechTable } from '../../components/FilterableTechTable';
import { citySubsidenceYearly } from '../../data/historicalTimeSeries';
import { CITY_COLORS, YEARS, FORECAST_YEARS, linearForecast } from '../timeSeriesUtils';

export function SubsidenceForecastSection({ cities }: { cities: string[] }) {
  const forecastData = useMemo(() => {
    return [
      ...YEARS.map(year => {
        const point: Record<string, number | string> = { year };
        cities.forEach(city => {
          point[city] = citySubsidenceYearly[city]?.[year] ?? null;
        });
        return point;
      }),
      ...FORECAST_YEARS.map(year => {
        const point: Record<string, number | string> = { year, isForecast: 'true' };
        cities.forEach(city => {
          const data = citySubsidenceYearly[city];
          const vals = YEARS.map(y => data?.[y] ?? null);
          const { forecast } = linearForecast(vals, YEARS, [year]);
          point[city] = Math.max(0, forecast[year] ?? 0);
        });
        return point;
      }),
    ];
  }, [cities]);

  const predTable = useMemo(() =>
    cities.map(city => {
      const data = citySubsidenceYearly[city];
      const vals = YEARS.map(y => data?.[y] ?? null);
      const { forecast } = linearForecast(vals, YEARS, FORECAST_YEARS);
      return {
        city,
        '2024年': data?.[2024] ?? 0,
        '预测2025': Math.max(0, forecast[2025] ?? 0),
        '预测2026': Math.max(0, forecast[2026] ?? 0),
      };
    }), [cities]);

  if (cities.length === 0) return null;
  return (
    <div className="space-y-4">
      <TechCard title="沉降速率趋势+预测(虚线)" badge="2014-2026" className="hud-corners">
        <ChartExport data={forecastData} filename="沉降速率预测2014-2026" sheetName="沉降预测" formats={['xlsx', 'csv', 'json']} label="导出数据" />
        <ResponsiveContainer width="100%" height={Math.max(300, cities.length * 8 + 260)}>
          <ComposedChart data={forecastData} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
            <XAxis dataKey="year" tick={{ fill: '#8b9dc3', fontSize: 11 }} />
            <YAxis tick={{ fill: '#8b9dc3', fontSize: 11 }} label={{ value: 'mm/a', angle: -90, position: 'insideLeft', fill: '#8b9dc3' }} />
            <Tooltip content={<ChartTooltip unit="mm/a" title="沉降速率" />} />
            <Legend wrapperStyle={{ fontSize: 10, maxHeight: 60, overflow: 'auto' }} />
            <ChartRefLines lines={[{ x: 2024.5, stroke: '#64748b', strokeDasharray: '4 2', label: '预测', position: 'top', fontSize: 9 }]} />
            {cities.map(city => (
              <Line key={city} type="monotone" dataKey={city} stroke={CITY_COLORS[city] || '#64748b'} strokeWidth={2} dot={{ r: 2 }} connectNulls />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
        <DataSourceNote source="基于2014-2024年线性回归外推，沉降受地下水位回升滞后效应影响" />
      </TechCard>

      <TechCard title="沉降速率预测明细" badge="mm/a">
        <FilterableTechTable
          headers={['城市', '2024年(mm/a)', '预测2025(mm/a)', '预测2026(mm/a)', '2024→2026变化']}
          rows={predTable.map(r => [r.city, r['2024年'].toFixed(1), r['预测2025'].toFixed(1), r['预测2026'].toFixed(1), (r['预测2026'] - r['2024年']).toFixed(1)])}
          pageSize={10}
        />
      </TechCard>
    </div>
  );
}
