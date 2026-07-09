// CorrelationPanel
// 提取自 TimeSeriesAnalysis.tsx Phase 6b 拆分

import React, { useMemo } from 'react';
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartTooltip, DataSourceNote, StatCard, TechCard } from '../components/UI';
import { FilterableTechTable } from '../components/FilterableTechTable';
import { cityExploitationYearly } from '../data/exploitation';
import { cityQualityYearly, citySubsidenceYearly, cityWaterLevelYearly } from '../data/historicalTimeSeries';
import {ALL_CITIES} from './timeSeriesUtils';

export function CorrelationPanel({ selected }: { selected: Set<string> }) {
  const cities = useMemo(() => ALL_CITIES.filter(c => selected.has(c)), [selected]);

  // 散点数据: 开采减采率 vs 水位回升幅度 vs 水质改善 vs 沉降减缓
  const scatterData = useMemo(() =>
    cities.map(city => {
      const exp14 = cityExploitationYearly[city]?.[2014] ?? 0;
      const exp24 = cityExploitationYearly[city]?.[2024] ?? 0;
      const expReduction = exp14 > 0 ? (exp14 - exp24) / exp14 * 100 : 0;
      const wl14 = cityWaterLevelYearly[city]?.[2014] ?? 0;
      const wl24 = cityWaterLevelYearly[city]?.[2024] ?? 0;
      const wlRecovery = wl14 - wl24; // 正值=水位回升
      const q14 = cityQualityYearly[city]?.[2014] ?? 0;
      const q24 = cityQualityYearly[city]?.[2024] ?? 0;
      const qImprovement = q24 - q14;
      const sub14 = citySubsidenceYearly[city]?.[2014] ?? 0;
      const sub24 = citySubsidenceYearly[city]?.[2024] ?? 0;
      const subReduction = sub14 > 0 ? (sub14 - sub24) / sub14 * 100 : 0;
      return { city, expReduction: +expReduction.toFixed(1), wlRecovery: +wlRecovery.toFixed(1), qImprovement: +qImprovement.toFixed(1), subReduction: +subReduction.toFixed(1) };
    }),
  [cities]);

  // 皮尔逊相关系数
  const pearson = (x: number[], y: number[]) => {
    const n = x.length;
    if (n < 3) return 0;
    const mx = x.reduce((a, b) => a + b, 0) / n;
    const my = y.reduce((a, b) => a + b, 0) / n;
    const sxx = x.reduce((a, v) => a + (v - mx) ** 2, 0);
    const syy = y.reduce((a, v) => a + (v - my) ** 2, 0);
    const sxy = x.reduce((a, v, i) => a + (v - mx) * (y[i] - my), 0);
    return sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : 0;
  };

  const correlations = useMemo(() => {
    const x = scatterData.map(d => d.expReduction);
    return {
      wl: pearson(x, scatterData.map(d => d.wlRecovery)),
      q: pearson(x, scatterData.map(d => d.qImprovement)),
      sub: pearson(x, scatterData.map(d => d.subReduction)),
    };
  }, [scatterData]);

  if (cities.length < 2) return <div className="text-center text-gw-muted py-12">请至少选择2个城市进行关联分析</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatCard title="开采减采 vs 水位回升" value={correlations.wl.toFixed(3)} unit="r" accent={correlations.wl > 0.5 ? 'emerald' : correlations.wl > 0.3 ? 'cyan' : 'amber'} subtitle={correlations.wl > 0.5 ? '强正相关' : correlations.wl > 0.3 ? '中等正相关' : '弱相关'} />
        <StatCard title="开采减采 vs 水质改善" value={correlations.q.toFixed(3)} unit="r" accent={correlations.q > 0.5 ? 'emerald' : correlations.q > 0.3 ? 'cyan' : 'amber'} subtitle={correlations.q > 0.5 ? '强正相关' : correlations.q > 0.3 ? '中等正相关' : '弱相关'} />
        <StatCard title="开采减采 vs 沉降减缓" value={correlations.sub.toFixed(3)} unit="r" accent={correlations.sub > 0.5 ? 'emerald' : correlations.sub > 0.3 ? 'cyan' : 'amber'} subtitle={correlations.sub > 0.5 ? '强正相关' : correlations.sub > 0.3 ? '中等正相关' : '弱相关'} />
      </div>

      {/* 开采减采率 vs 水位回升 散点图 */}
      <TechCard title="开采减采率 vs 水位回升幅度" badge="散点关联" className="hud-corners">
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
            <XAxis dataKey="city" tick={{ fill: '#8b9dc3', fontSize: 10 }} />
            <YAxis yAxisId="left" tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: '减采率(%)', angle: -90, position: 'insideLeft', fill: '#8b9dc3', fontSize: 10 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: '回升(m)', angle: 90, position: 'insideRight', fill: '#8b9dc3', fontSize: 10 }} />
            <Tooltip content={<ChartTooltip unit="" title="城市" />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar yAxisId="left" dataKey="expReduction" name="开采减采率(%)" fill="#3b82f6" fillOpacity={0.7} radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="wlRecovery" name="水位回升(m)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 5, fill: '#10b981' }} />
          </ComposedChart>
        </ResponsiveContainer>
        <DataSourceNote source={`Pearson r = ${correlations.wl.toFixed(3)}，开采量削减越多的城市水位回升越显著`} />
      </TechCard>

      {/* 四维关联明细表 */}
      <TechCard title="四维关联明细" badge="2014→2024">
        <FilterableTechTable
          headers={['城市', '开采减采率(%)', '水位回升(m)', '水质改善(pp)', '沉降减缓(%)']}
          rows={scatterData.sort((a, b) => b.expReduction - a.expReduction).map(d => [d.city, d.expReduction, d.wlRecovery, d.qImprovement, d.subReduction])}
          pageSize={10}
        />
      </TechCard>

      {/* 水质改善 vs 沉降减缓 散点 */}
      <TechCard title="水质改善 vs 沉降减缓率" badge="散点关联">
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
            <XAxis dataKey="city" tick={{ fill: '#8b9dc3', fontSize: 10 }} />
            <YAxis yAxisId="left" tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: '水质改善(pp)', angle: -90, position: 'insideLeft', fill: '#8b9dc3', fontSize: 10 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: '减缓率(%)', angle: 90, position: 'insideRight', fill: '#8b9dc3', fontSize: 10 }} />
            <Tooltip content={<ChartTooltip unit="" title="城市" />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar yAxisId="left" dataKey="qImprovement" name="水质改善(pp)" fill="#06b6d4" fillOpacity={0.7} radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="subReduction" name="沉降减缓(%)" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 5, fill: '#ef4444' }} />
          </ComposedChart>
        </ResponsiveContainer>
        <DataSourceNote source={`Pearson r = ${correlations.sub.toFixed(3)}，水质与沉降均受开采量变化驱动`} />
      </TechCard>
    </div>
  );
}

// ── 任务10: 治理成效Tab ──
