/**
 * 拆分自 ForecastPanels.tsx — ForecastPanel
 */
import { WaterLevelForecastSection } from './WaterLevelForecastSection';
import { SubsidenceForecastSection } from './SubsidenceForecastSection';

import { useMemo } from 'react';
import { Droplets } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartTooltip, StatCard, TechCard } from '../../components/UI';
import { ChartRefLines } from '../../components/ChartAnnotation';
import { FilterableTechTable } from '../../components/FilterableTechTable';
import { cityExploitationYearly } from '../../data/exploitation';
import { CITY_COLORS, ALL_CITIES, YEARS, FORECAST_YEARS, CITY_GROUPS, linearForecast } from '../timeSeriesUtils';

export function ForecastPanel({ selected, baseline }: { selected: Set<string>; baseline: number }) {
  const cities = useMemo(() => ALL_CITIES.filter(c => selected.has(c)), [selected]);
  const baselineIdx = YEARS.indexOf(baseline);

  // 含预测的趋势数据
  const trendWithForecast = useMemo(() => {
    return [
      ...YEARS.map(year => {
        const point: Record<string, number | string> = { year };
        cities.forEach(city => {
          const data = cityExploitationYearly[city];
          point[city] = data?.[year] ?? null;
        });
        return point;
      }),
      // 预测年
      ...FORECAST_YEARS.map(year => {
        const point: Record<string, number | string> = { year, isForecast: 'true' };
        cities.forEach(city => {
          const data = cityExploitationYearly[city];
          const vals = YEARS.map(y => data?.[y] ?? null);
          const { forecast } = linearForecast(vals, YEARS, [year]);
          point[city] = forecast[year] ?? 0;
        });
        return point;
      }),
    ];
  }, [cities]);

  // 基准年对比
  const baselineCompare = useMemo(() => {
    if (baselineIdx < 0) return [];
    return cities.map(city => {
      const data = cityExploitationYearly[city];
      const baseVal = data?.[baseline] ?? 0;
      const curVal = data?.[2024] ?? 0;
      const { forecast } = linearForecast(
        YEARS.map(y => data?.[y] ?? null), YEARS, FORECAST_YEARS
      );
      return {
        city,
        [`${baseline}年`]: baseVal,
        '2024年': curVal,
        '变化量': +(curVal - baseVal).toFixed(1),
        '变化率(%)': baseVal > 0 ? +((curVal - baseVal) / baseVal * 100).toFixed(1) : 0,
        '预测2025': forecast[2025],
        '预测2026': forecast[2026],
      };
    });
  }, [cities, baselineIdx, baseline]);

  // 分组汇总
  const groupSummary = useMemo(() =>
    Object.entries(CITY_GROUPS).map(([key, group]) => {
      const gc = group.cities.filter(c => selected.has(c));
      const total2024 = gc.reduce((s, c) => s + (cityExploitationYearly[c]?.[2024] ?? 0), 0);
      const totalBase = gc.reduce((s, c) => s + (cityExploitationYearly[c]?.[baseline] ?? 0), 0);
      return { key, ...group, cityCount: gc.length, total2024, totalBase, change: +(total2024 - totalBase).toFixed(1), pct: totalBase > 0 ? +((total2024 - totalBase) / totalBase * 100).toFixed(1) : 0 };
    }),
  [selected, baseline]);

  return (
    <div className="space-y-4">
      {/* 分组汇总 */}
      <div className="grid grid-cols-4 gap-3">
        {groupSummary.map(g => (
          <StatCard key={g.key} title={g.label} value={g.total2024.toFixed(1)} unit="亿m3" icon={Droplets} subtitle={`${baseline}年${g.totalBase.toFixed(1)} / ${g.change > 0 ? '+' : ''}${g.change}`} accent={g.color === '#14b8a6' ? 'cyan' : g.color === '#3b82f6' ? 'blue' : g.color === '#f59e0b' ? 'amber' : 'red'} />
        ))}
      </div>

      {/* 含预测的趋势折线图 */}
      <TechCard title="开采量趋势+预测(虚线)" badge="2014-2026" className="hud-corners">
        {cities.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gw-muted text-sm">请选择城市</div>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(350, cities.length * 8 + 280)}>
            <ComposedChart data={trendWithForecast} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis dataKey="year" tick={{ fill: '#8b9dc3', fontSize: 11 }} />
              <YAxis tick={{ fill: '#8b9dc3', fontSize: 11 }} label={{ value: '亿m3', angle: -90, position: 'insideLeft', fill: '#8b9dc3', fontSize: 11 }} />
              <Tooltip content={<ChartTooltip unit="亿m3" title="开采量" />} />
              <Legend wrapperStyle={{ fontSize: 10, maxHeight: 80, overflow: 'auto' }} />
              <ChartRefLines lines={[
                { x: 2024.5, stroke: '#64748b', strokeDasharray: '4 2', label: '预测', position: 'top', fontSize: 9 },
              ]} />
              {cities.map(city => (
                <Line key={city} type="monotone" dataKey={city} stroke={CITY_COLORS[city]} strokeWidth={2} dot={{ r: 2 }} connectNulls strokeDasharray="solid" />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </TechCard>

      {/* 基准年对比排名 */}
      {baselineCompare.length > 0 && (
        <TechCard title={`较${baseline}年开采变化排名`} badge="%">
          <ResponsiveContainer width="100%" height={Math.max(200, baselineCompare.length * 25 + 40)}>
            <BarChart data={[...baselineCompare].sort((a, b) => b['变化率(%)'] - a['变化率(%)'])} layout="vertical" margin={{ top: 10, right: 20, bottom: 5, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis type="number" tick={{ fill: '#8b9dc3', fontSize: 10 }} />
              <YAxis dataKey="city" type="category" tick={{ fill: '#8b9dc3', fontSize: 10 }} width={55} />
              <Tooltip content={<ChartTooltip unit="%" title="变化率" />} />
              <Bar dataKey="变化率(%)" name="变化率(%)">
                {baselineCompare.map((entry, i) => (
                  <Cell key={i} fill={Number(entry['变化率(%)']) < 0 ? '#22c55e' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </TechCard>
      )}

      {/* 预测明细表 */}
      {baselineCompare.length > 0 && (
        <TechCard title={`基准年对比+预测明细`} badge={`${baseline}-2026`}>
          <FilterableTechTable
            headers={['城市', `${baseline}年`, '2024年', '变化量', '变化率(%)', '预测2025', '预测2026']}
            rows={baselineCompare.map(c => [c.city, c[`${baseline}年`], c['2024年'], c['变化量'], c['变化率(%)'] + '%', c['预测2025'], c['预测2026']])}
            pageSize={10}
          />
        </TechCard>
      )}

      {/* ══ 水位埋深预测 ══ */}
      <WaterLevelForecastSection cities={cities} />

      {/* ══ 沉降速率预测 ══ */}
      <SubsidenceForecastSection cities={cities} />
    </div>
  );
}
