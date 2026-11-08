/**
 * 拆分自 ForecastPanels.tsx — RegionalComparePanel
 */

import { useMemo } from 'react';
import { CartesianGrid, Legend, Line, LineChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartTooltip, StatCard, TechCard } from '../../components/UI';
import { FilterableTechTable } from '../../components/FilterableTechTable';
import { cityExploitationYearly } from '../../data/exploitation';
import { TS_FULL_YEARS, cityQualityYearly, citySubsidenceYearly, cityWaterLevelYearly } from '../../data/historicalTimeSeries';
import { CITY_GROUPS } from '../timeSeriesUtils';

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
