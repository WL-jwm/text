// 预测面板组件
// 提取自 TimeSeriesAnalysis.tsx Phase 6b 拆分

import React, { useMemo } from 'react';
import { Droplets } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, Line, LineChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartTooltip, DataSourceNote, StatCard, TechCard } from '../components/UI';
import { ChartExport } from '../components/ChartExport';
import { ChartRefLines } from '../components/ChartAnnotation';
import { FilterableTechTable } from '../components/FilterableTechTable';
import { cityExploitationYearly } from '../data/exploitation';
import { TS_FULL_YEARS, cityQualityYearly, citySubsidenceYearly, cityWaterLevelYearly } from '../data/historicalTimeSeries';
import { CITY_COLORS, ALL_CITIES, YEARS, FORECAST_YEARS, CITY_GROUPS, linearForecast } from './timeSeriesUtils';

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

// ── 水位埋深预测区块 ──
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

// ── 沉降速率预测区块 ──
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

// ── 任务11: 区域对比Tab ──
export function RegionalComparePanel({ selected }: { selected: Set<string> }) {
  // 区域汇总数据
  const regionData = useMemo(() =>
    Object.entries(CITY_GROUPS).map(([key, group]) => {
      const gc = group.cities.filter(c => selected.has(c));
      if (gc.length === 0) return { key, label: group.label, color: group.color, cityCount: 0, exp2024: 0, exp2014: 0, wl2024: 0, wl2014: 0, q2024: 0, q2014: 0, sub2024: 0, sub2014: 0 };
      const exp2024 = gc.reduce((s, c) => s + (cityExploitationYearly[c]?.[2024] ?? 0), 0);
      const exp2014 = gc.reduce((s, c) => s + (cityExploitationYearly[c]?.[2014] ?? 0), 0);
      const wl2024 = gc.reduce((s, c) => s + (cityWaterLevelYearly[c]?.[2024] ?? 0), 0) / gc.length;
      const wl2014 = gc.reduce((s, c) => s + (cityWaterLevelYearly[c]?.[2014] ?? 0), 0) / gc.length;
      const q2024 = gc.reduce((s, c) => s + (cityQualityYearly[c]?.[2024] ?? 0), 0) / gc.length;
      const q2014 = gc.reduce((s, c) => s + (cityQualityYearly[c]?.[2014] ?? 0), 0) / gc.length;
      const sub2024 = gc.reduce((s, c) => s + (citySubsidenceYearly[c]?.[2024] ?? 0), 0) / gc.length;
      const sub2014 = gc.reduce((s, c) => s + (citySubsidenceYearly[c]?.[2014] ?? 0), 0) / gc.length;
      return { key, label: group.label, color: group.color, cityCount: gc.length, exp2024: +exp2024.toFixed(1), exp2014: +exp2014.toFixed(1), wl2024: +wl2024.toFixed(1), wl2014: +wl2014.toFixed(1), q2024: +q2024.toFixed(1), q2014: +q2014.toFixed(1), sub2024: +sub2024.toFixed(1), sub2014: +sub2014.toFixed(1) };
    }),
  [selected]);

  // 区域年度趋势(开采量)
  const regionTrend = useMemo(() =>
    TS_FULL_YEARS.map(year => {
      const point: Record<string, number | string> = { year };
      Object.entries(CITY_GROUPS).forEach(([_key, group]) => {
        const gc = group.cities.filter(c => selected.has(c));
        point[group.label] = +(gc.reduce((s, c) => s + (cityExploitationYearly[c]?.[year] ?? 0), 0)).toFixed(1);
      });
      return point;
    }),
  [selected]);

  // 区域雷达图数据(2024年归一化)
  const radarData = useMemo(() => {
    const dims = ['开采规模', '水位健康', '水质达标', '沉降控制', '治理成效'];
    return dims.map(dim => {
      const entry: Record<string, number | string> = { dimension: dim };
      regionData.forEach(r => {
        if (r.cityCount === 0) { entry[r.label] = 0; return; }
        let val = 0;
        if (dim === '开采规模') val = Math.min(100, r.exp2024 / 80 * 100); // 80亿m3=100%
        else if (dim === '水位健康') val = Math.min(100, 100 - r.wl2024 / 50 * 100); // 埋深越浅越好
        else if (dim === '水质达标') val = r.q2024;
        else if (dim === '沉降控制') val = Math.min(100, 100 - r.sub2024 / 65 * 100);
        else if (dim === '治理成效') {
          const expChg = r.exp2014 > 0 ? (r.exp2014 - r.exp2024) / r.exp2014 * 100 : 0;
          const wlChg = r.wl2014 > 0 ? (r.wl2014 - r.wl2024) / r.wl2014 * 100 : 0;
          const qChg = r.q2014 > 0 ? (r.q2024 - r.q2014) / r.q2014 * 100 : 0;
          const subChg = r.sub2014 > 0 ? (r.sub2014 - r.sub2024) / r.sub2014 * 100 : 0;
          val = Math.min(100, expChg * 0.25 + wlChg * 0.30 + qChg * 0.25 + subChg * 0.20);
        }
        entry[r.label] = +val.toFixed(0);
      });
      return entry;
    });
  }, [regionData]);

  const activeRegions = regionData.filter(r => r.cityCount > 0);
  if (activeRegions.length === 0) return <div className="text-center text-gw-muted py-12">请选择城市查看区域对比</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        {activeRegions.map(r => (
          <StatCard key={r.key} title={r.label} value={`${r.cityCount}`} unit="市" accent={r.color === '#14b8a6' ? 'cyan' : r.color === '#3b82f6' ? 'blue' : r.color === '#f59e0b' ? 'amber' : 'red'} subtitle={`开采${r.exp2024}亿m3`} />
        ))}
      </div>

      {/* 区域开采量趋势 */}
      <TechCard title="四大水文地质区开采量变化趋势" badge="2014-2024" className="hud-corners">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={regionTrend} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
            <XAxis dataKey="year" tick={{ fill: '#8b9dc3', fontSize: 11 }} />
            <YAxis tick={{ fill: '#8b9dc3', fontSize: 11 }} label={{ value: '亿m3', angle: -90, position: 'insideLeft', fill: '#8b9dc3' }} />
            <Tooltip content={<ChartTooltip unit="亿m3" title="区域开采" />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            {activeRegions.map(r => (
              <Line key={r.key} type="monotone" dataKey={r.label} stroke={r.color} strokeWidth={2} dot={{ r: 2 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </TechCard>

      {/* 区域多维雷达图 */}
      <TechCard title="四大区域2024年综合指标雷达图" badge="五维对比">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="80%">
              <PolarGrid stroke="rgba(6,182,212,0.15)" />
              <PolarAngleAxis dataKey="dimension" tick={{ fill: '#8b9dc3', fontSize: 11 }} />
              <PolarRadiusAxis tick={{ fill: '#8b9dc3', fontSize: 9 }} domain={[0, 100]} />
              {activeRegions.map(r => (
                <Radar key={r.key} name={r.label} dataKey={r.label} stroke={r.color} fill={r.color} fillOpacity={0.15} strokeWidth={2} />
              ))}
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
          <div className="text-[10px] text-gw-muted space-y-1.5">
            <h4 className="text-xs font-bold text-gw-text mb-2">区域特征解读</h4>
            {activeRegions.map(r => (
              <div key={r.key} className="border-l-2 pl-2 mb-2" style={{ borderColor: r.color }}>
                <p className="font-bold" style={{ color: r.color }}>{r.label}({r.cityCount}市)</p>
                <p>开采: {r.exp2014}→{r.exp2024}亿m3 (-{((r.exp2014 - r.exp2024) / r.exp2014 * 100).toFixed(0)}%)</p>
                <p>水位: {r.wl2014}→{r.wl2024}m ({(r.wl2014 - r.wl2024).toFixed(1)}m回升)</p>
                <p>水质: {r.q2014}→{r.q2024}% (+{(r.q2024 - r.q2014).toFixed(0)}pp)</p>
                <p>沉降: {r.sub2014}→{r.sub2024}mm/a (-{((r.sub2014 - r.sub2024) / r.sub2014 * 100).toFixed(0)}%)</p>
              </div>
            ))}
          </div>
        </div>
      </TechCard>

      {/* 区域对比表 */}
      <TechCard title="四大区域核心指标对比" badge="2014 vs 2024">
        <FilterableTechTable
          headers={['区域', '城市数', '开采2014', '开采2024', '水位2014(m)', '水位2024(m)', '水质2014(%)', '水质2024(%)', '沉降2014(mm/a)', '沉降2024(mm/a)']}
          rows={activeRegions.map(r => [r.label, r.cityCount, r.exp2014, r.exp2024, r.wl2014, r.wl2024, r.q2014, r.q2024, r.sub2014, r.sub2024])}
          pageSize={10}
        />
      </TechCard>
    </div>
  );
}

// ── 开采量趋势 Tab ──
