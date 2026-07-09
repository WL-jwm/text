// GovernancePanel
// 提取自 TimeSeriesAnalysis.tsx Phase 6b 拆分

import React, { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartTooltip, DataSourceNote, StatCard, TechCard } from '../components/UI';
import { ChartRefLines } from '../components/ChartAnnotation';
import { FilterableTechTable } from '../components/FilterableTechTable';
import { cityExploitationYearly } from '../data/exploitation';
import { TS_FULL_YEARS, cityQualityYearly, citySubsidenceYearly, cityWaterLevelYearly } from '../data/historicalTimeSeries';
import {ALL_CITIES} from './timeSeriesUtils';

export function GovernancePanel({ selected }: { selected: Set<string> }) {
  const cities = useMemo(() => ALL_CITIES.filter(c => selected.has(c)), [selected]);

  // 治理成效综合评分
  const governanceData = useMemo(() =>
    cities.map(city => {
      const exp14 = cityExploitationYearly[city]?.[2014] ?? 0;
      const exp24 = cityExploitationYearly[city]?.[2024] ?? 0;
      const expPct = exp14 > 0 ? (exp14 - exp24) / exp14 * 100 : 0;
      const wl14 = cityWaterLevelYearly[city]?.[2014] ?? 0;
      const wl24 = cityWaterLevelYearly[city]?.[2024] ?? 0;
      const wlRecoveryM = wl14 - wl24;
      const wlPct = wl14 > 0 ? wlRecoveryM / wl14 * 100 : 0;
      const q14 = cityQualityYearly[city]?.[2014] ?? 0;
      const q24 = cityQualityYearly[city]?.[2024] ?? 0;
      const qPct = q14 > 0 ? (q24 - q14) / q14 * 100 : 0;
      const sub14 = citySubsidenceYearly[city]?.[2014] ?? 0;
      const sub24 = citySubsidenceYearly[city]?.[2024] ?? 0;
      const subPct = sub14 > 0 ? (sub14 - sub24) / sub14 * 100 : 0;
      // 综合评分(加权: 开采25%+水位30%+水质25%+沉降20%)
      const score = Math.round(expPct * 0.25 + wlPct * 0.30 + qPct * 0.25 + subPct * 0.20);
      return { city, expPct: +expPct.toFixed(1), wlPct: +wlPct.toFixed(1), qPct: +qPct.toFixed(1), subPct: +subPct.toFixed(1), score, wlRecoveryM: +wlRecoveryM.toFixed(1) };
    }).sort((a, b) => b.score - a.score),
  [cities]);

  // 年度治理进程
  const yearlyProcess = useMemo(() =>
    TS_FULL_YEARS.map(year => {
      const avgExp = cities.reduce((s, c) => s + (cityExploitationYearly[c]?.[year] ?? 0), 0) / (cities.length || 1);
      const avgWl = cities.reduce((s, c) => s + (cityWaterLevelYearly[c]?.[year] ?? 0), 0) / (cities.length || 1);
      const avgQ = cities.reduce((s, c) => s + (cityQualityYearly[c]?.[year] ?? 0), 0) / (cities.length || 1);
      const avgSub = cities.reduce((s, c) => s + (citySubsidenceYearly[c]?.[year] ?? 0), 0) / (cities.length || 1);
      return { year, avgExp: +avgExp.toFixed(1), avgWl: +avgWl.toFixed(1), avgQ: +avgQ.toFixed(1), avgSub: +avgSub.toFixed(1) };
    }),
  [cities]);

  if (cities.length === 0) return <div className="text-center text-gw-muted py-12">请选择城市查看治理成效</div>;

  const topCity = governanceData[0];
  const avgScore = governanceData.length > 0 ? Math.round(governanceData.reduce((s, d) => s + d.score, 0) / governanceData.length) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="最优治理城市" value={topCity?.city ?? '—'} unit={`${topCity?.score ?? 0}分`} accent="emerald" subtitle="综合评分最高" />
        <StatCard title="平均治理评分" value={`${avgScore}`} unit="分(100制)" accent="cyan" subtitle={`${cities.length}市平均`} />
        <StatCard title="最高开采降幅" value={`${governanceData.length > 0 ? Math.max(...governanceData.map(d => d.expPct)) : 0}`} unit="%" accent="blue" subtitle="2014→2024" />
        <StatCard title="最高水质改善率" value={`${governanceData.length > 0 ? Math.max(...governanceData.map(d => d.qPct)) : 0}`} unit="%" accent="green" subtitle="达标率提升" />
      </div>

      {/* 治理成效排名 */}
      <TechCard title="各市超采治理综合成效排名" badge="2014→2024" className="hud-corners">
        <ResponsiveContainer width="100%" height={Math.max(300, governanceData.length * 28 + 40)}>
          <BarChart data={governanceData} layout="vertical" margin={{ top: 10, right: 20, bottom: 5, left: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
            <XAxis type="number" tick={{ fill: '#8b9dc3', fontSize: 10 }} domain={[0, 100]} />
            <YAxis dataKey="city" type="category" tick={{ fill: '#8b9dc3', fontSize: 10 }} width={55} />
            <Tooltip content={<ChartTooltip unit="分" title="综合评分" />} />
            <Bar dataKey="score" name="综合评分" radius={[0, 4, 4, 0]}>
                {governanceData.map((d, i) => (
                  <Cell key={i} fill={d.score >= 40 ? '#10b981' : d.score >= 25 ? '#f59e0b' : '#ef4444'} />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </TechCard>

      {/* 年度治理进程四维折线 */}
      <TechCard title="年度治理进程(四维均值)" badge="2014-2024">
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={yearlyProcess} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
            <XAxis dataKey="year" tick={{ fill: '#8b9dc3', fontSize: 11 }} />
            <YAxis yAxisId="exp" tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: '亿m3', angle: -90, position: 'insideLeft', fill: '#8b9dc3', fontSize: 10 }} />
            <YAxis yAxisId="sub" orientation="right" tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: 'mm/a', angle: 90, position: 'insideRight', fill: '#8b9dc3', fontSize: 10 }} />
            <Tooltip content={<ChartTooltip unit="" title="年份" />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <ChartRefLines lines={[{ x: 2018, stroke: '#22c55e', strokeDasharray: '6 3', label: '回升拐点', position: 'top', fontSize: 9 }]} />
            <Line yAxisId="exp" type="monotone" dataKey="avgExp" name="平均开采(亿m3)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} />
            <Line yAxisId="exp" type="monotone" dataKey="avgWl" name="平均埋深(m)" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} />
            <Line yAxisId="sub" type="monotone" dataKey="avgSub" name="平均沉降(mm/a)" stroke="#ef4444" strokeWidth={2} dot={{ r: 2 }} />
            <Line yAxisId="exp" type="monotone" dataKey="avgQ" name="平均达标率(%)" stroke="#06b6d4" strokeWidth={2} dot={{ r: 2 }} />
          </ComposedChart>
        </ResponsiveContainer>
        <DataSourceNote source="开采量下降+水位回升+水质改善+沉降减缓，四维指标同步优化" />
      </TechCard>

      {/* 明细表 */}
      <TechCard title="治理成效综合评分明细" badge="加权评分">
        <FilterableTechTable
          headers={['城市', '开采降幅(%)', '水位回升(%)', '水质改善(%)', '沉降减缓(%)', '综合评分', '水位回升(m)']}
          rows={governanceData.map(d => [d.city, d.expPct, d.wlPct, d.qPct, d.subPct, d.score, d.wlRecoveryM])}
          pageSize={10}
        />
      </TechCard>
    </div>
  );
}
