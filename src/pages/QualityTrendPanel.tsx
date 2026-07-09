// QualityTrendPanel
// 提取自 TimeSeriesAnalysis.tsx Phase 6b 拆分

import React, { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, ComposedChart, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartTooltip, StatCard, TechCard } from '../components/UI';
import { ChartRefLines } from '../components/ChartAnnotation';
import { FilterableTechTable } from '../components/FilterableTechTable';
import { qualityYearlySummary } from '../data/historicalTimeSeries';
import { cityGroundwaterQuality2024, cityQualityTrend, qualityLevelTrend2020_2024 } from '../data/waterQuality';
import { CITY_COLORS, ALL_CITIES} from './timeSeriesUtils';

export function QualityTrendPanel({ selected }: { selected: Set<string> }) {
  const cities = useMemo(() => ALL_CITIES.filter(c => selected.has(c)), [selected]);

  const chartData = useMemo(() => {
    return [2020, 2021, 2022, 2023, 2024].map(year => {
      const point: Record<string, number | string> = { year };
      cityQualityTrend.filter(c => cities.includes(c.city)).forEach(c => {
        const val = c[`y${year}` as keyof typeof c] as number;
        point[c.city] = val;
      });
      return point;
    });
  }, [cities]);

  // 全省趋势数据（qualityLevelTrend2020_2024）
  return (
    <div className="space-y-4">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="2024年III类以上达标率" value={`${qualityLevelTrend2020_2024[4].IIIplus}`} unit="%" accent="emerald" subtitle={`${qualityLevelTrend2020_2024[4].wells}眼监测井`} />
        <StatCard title="较2020年提升" value={`${(qualityLevelTrend2020_2024[4].IIIplus - qualityLevelTrend2020_2024[0].IIIplus).toFixed(1)}`} unit="百分点" accent="cyan" subtitle="5年累计" />
        <StatCard title="V类水占比" value={`${qualityLevelTrend2020_2024[4].V}`} unit="%" accent="red" subtitle={`${(qualityLevelTrend2020_2024[0].V - qualityLevelTrend2020_2024[4].V).toFixed(1)}pp下降`} />
        <StatCard title="监测井数增长" value={`${qualityLevelTrend2020_2024[4].wells - qualityLevelTrend2020_2024[0].wells}`} unit="眼" accent="blue" subtitle={`${qualityLevelTrend2020_2024[0].wells}→${qualityLevelTrend2020_2024[4].wells}`} />
      </div>

      {/* 各市达标率趋势 */}
      <TechCard title="各市地下水质量达标率趋势(2020-2024)" badge="%" className="hud-corners">
        {cities.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gw-muted text-sm">请选择城市查看趋势</div>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(350, cities.length * 8 + 280)}>
            <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis dataKey="year" tick={{ fill: '#8b9dc3', fontSize: 11 }} />
              <YAxis tick={{ fill: '#8b9dc3', fontSize: 11 }} domain={[0, 100]} label={{ value: '%', angle: -90, position: 'insideLeft', fill: '#8b9dc3' }} />
              <Tooltip content={<ChartTooltip unit="%" title="达标率" />} />
              <Legend wrapperStyle={{ fontSize: 10, maxHeight: 80, overflow: 'auto' }} />
              {cities.map(city => (
                <Line
                  key={city}
                  type="monotone"
                  dataKey={city}
                  stroke={CITY_COLORS[city]}
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </TechCard>

      {/* 全省水质等级变化 */}
      <TechCard title="全省地下水质量等级变化(2020-2024)" badge="%">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={qualityLevelTrend2020_2024} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis dataKey="year" tick={{ fill: '#8b9dc3', fontSize: 11 }} />
              <YAxis tick={{ fill: '#8b9dc3', fontSize: 11 }} domain={[0, 100]} />
              <Tooltip content={<ChartTooltip unit="%" title="占比" />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Area type="monotone" dataKey="I2" name="I-II类" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
              <Area type="monotone" dataKey="III" name="III类" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              <Area type="monotone" dataKey="IV" name="IV类" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
              <Area type="monotone" dataKey="V" name="V类" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="text-[10px] text-gw-muted space-y-1.5">
            <h4 className="text-xs font-bold text-gw-text mb-2">水质改善趋势摘要</h4>
            <p>• I-II类水比例：<span className="text-emerald-400">{qualityLevelTrend2020_2024[0].I2}%</span> → <span className="text-emerald-400 font-bold">{qualityLevelTrend2020_2024[4].I2}%</span>（+{(qualityLevelTrend2020_2024[4].I2 - qualityLevelTrend2020_2024[0].I2).toFixed(1)}pp）</p>
            <p>• III类水比例：<span className="text-blue-400">{qualityLevelTrend2020_2024[0].III}%</span> → <span className="text-blue-400 font-bold">{qualityLevelTrend2020_2024[4].III}%</span>（+{(qualityLevelTrend2020_2024[4].III - qualityLevelTrend2020_2024[0].III).toFixed(1)}pp）</p>
            <p>• IV类水比例：<span className="text-amber-400">{qualityLevelTrend2020_2024[0].IV}%</span> → <span className="text-amber-400">{qualityLevelTrend2020_2024[4].IV}%</span>（{(qualityLevelTrend2020_2024[4].IV - qualityLevelTrend2020_2024[0].IV).toFixed(1)}pp）</p>
            <p>• V类水比例：<span className="text-red-400">{qualityLevelTrend2020_2024[0].V}%</span> → <span className="text-red-400 font-bold">{qualityLevelTrend2020_2024[4].V}%</span>（-{(qualityLevelTrend2020_2024[0].V - qualityLevelTrend2020_2024[4].V).toFixed(1)}pp）</p>
            <p>• III类及以上合计：<span className="text-cyan-400 font-bold">{qualityLevelTrend2020_2024[0].IIIplus}%</span> → <span className="text-cyan-400 font-bold">{qualityLevelTrend2020_2024[4].IIIplus}%</span>（+{(qualityLevelTrend2020_2024[4].IIIplus - qualityLevelTrend2020_2024[0].IIIplus).toFixed(1)}pp）</p>
            <p className="pt-1 border-t border-gw-border/30">超采治理推进地下水位回升，氧化还原环境改善，有机物降解能力增强，水质呈持续改善态势。</p>
          </div>
        </div>
      </TechCard>

      {/* 2014-2024全省水质达标率趋势(11年均值) */}
      <TechCard title="全省地下水质量达标率趋势(2014-2024)" badge="%" className="hud-corners">
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={qualityYearlySummary} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
            <XAxis dataKey="year" tick={{ fill: '#8b9dc3', fontSize: 11 }} />
            <YAxis tick={{ fill: '#8b9dc3', fontSize: 11 }} domain={[0, 100]} />
            <Tooltip content={<ChartTooltip unit="%" title="全省均值达标率" />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Area type="monotone" dataKey="avgRate" name="全省均值" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} strokeWidth={2} />
            <Line type="monotone" dataKey="bestRate" name="最优市" stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
            <Line type="monotone" dataKey="worstRate" name="最差市" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
            <ChartRefLines lines={[{ y: 2020, stroke: '#f59e0b', strokeDasharray: '6 3', label: '治理加速', position: 'top' }]} />
          </ComposedChart>
        </ResponsiveContainer>
      </TechCard>

      {/* 各市2024年达标率排名 */}
      {cities.length > 0 && (
        <TechCard title="各市2024年地下水质量达标率" badge="%">
          <FilterableTechTable
            headers={['城市', '2020年(%)', '2021年(%)', '2022年(%)', '2023年(%)', '2024年(%)', '5年提升(pp)', '监测井(眼)']}
            rows={cityQualityTrend.filter(c => cities.includes(c.city)).sort((a, b) => b.y2024 - a.y2024).map(c => [
              c.city, c.y2020, c.y2021, c.y2022, c.y2023, c.y2024,
              c.improvement.toFixed(1),
              cityGroundwaterQuality2024.find(q => q.city === c.city)?.wells ?? '—',
            ])}
            pageSize={10}
          />
        </TechCard>
      )}
    </div>
  );
}

// ── 供水结构 Tab ──
