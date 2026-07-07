import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend, ComposedChart, Line, ScatterChart, Scatter, ZAxis } from 'recharts';
import { TrendingUp, CheckCircle2, FileText, AlertTriangle, Droplets, BarChart3, Gauge } from 'lucide-react';
import { waterQualityTrend, cityQualityTrend, qualityLevelTrend2020_2024 } from '../../data/waterQuality';
import { TechCard, ChartTooltip, StatCard, DataSourceNote } from '../UI';
import { ChartRefLines } from '../ChartAnnotation';
import { LazyChartCard } from '../LazyChartCard';
import { ChartExport } from '../ChartExport';
import { FilterableTechTable } from '../FilterableTechTable';
import type { WaterQualityTrendPoint, CityQualityTrendPoint } from '../../types/waterQuality';

interface Props {
  wq: { nationalExam: { pollutionSourceSurvey: string } };
}

export function WaterQualityTrendTab({ wq }: Props) {
  const latest = waterQualityTrend[waterQualityTrend.length - 1];
  const base = waterQualityTrend[0];
  const tenYearImprovement = latest.IIIPlusPercent - base.IIIPlusPercent;
  const annualImprovement = tenYearImprovement / (latest.year - base.year);
  const vClassReduction = latest.VPercent - base.VPercent;
  const wellGrowth = ((latest.monitoringWells - base.monitoringWells) / base.monitoringWells * 100);

  // 每年各类水质变化贡献量(百分点)
  const yearlyChangeData = useMemo(() =>
    waterQualityTrend.slice(1).map((t, i) => {
      const prev = waterQualityTrend[i];
      return {
        year: t.year,
        'I+II类贡献': +(t.I2Percent - prev.I2Percent).toFixed(1),
        'III类贡献': +(t.IIIPlusPercent - prev.I2Percent - (prev.IIIPlusPercent - prev.I2Percent)).toFixed(1),
        'IV类改善': +(prev.IVPercent - t.IVPercent).toFixed(1),
        'V类改善': +(prev.VPercent - t.VPercent).toFixed(1),
      };
    }),
  []);

  // 水质-水位-开采关联数据(基于qualityLevelTrend2020_2024)
  const correlationData = useMemo(() =>
    qualityLevelTrend2020_2024.map(d => ({
      year: d.year,
      'III类+(%)': d.IIIplus,
      '浅层回升(m)': d.shallowRise,
      '地下水供水量(亿m³)': d.gwSupply,
      '监测井数': d.wells,
    })),
  []);

  // 各市改善速度排名
  const citySpeedRank = useMemo(() =>
    [...cityQualityTrend]
      .sort((a, b) => b.improvement - a.improvement)
      .map(c => ({
        city: c.city,
        '2020年(%)': c.y2020,
        '2024年(%)': c.y2024,
        '5年提升': c.improvement,
        '年均提升': +(c.improvement / 4).toFixed(1),
        '当前增速评级': c.improvement >= 35 ? '领先' : c.improvement >= 30 ? '较快' : c.improvement >= 25 ? '中等' : '平稳',
      })),
  []);

  return (
    <div className="space-y-4">
      {/* ── 5格统计卡片 ── */}
      <div className="grid grid-cols-5 gap-3">
        <StatCard title="2024年III类+" value={latest.IIIPlusPercent} unit="%" icon={Gauge} subtitle={`${tenYearImprovement > 0 ? '+' : ''}${tenYearImprovement.toFixed(1)}pp 10年`} accent="emerald" />
        <StatCard title="V类水质占比" value={latest.VPercent} unit="%" icon={AlertTriangle} subtitle={`${vClassReduction < 0 ? '' : '+'}${vClassReduction.toFixed(1)}pp 10年`} accent="red" />
        <StatCard title="年均改善率" value={annualImprovement.toFixed(1)} unit="pp/年" icon={TrendingUp} subtitle="2015-2024连续" accent="cyan" />
        <StatCard title="监测井总数" value={latest.monitoringWells} unit="眼" icon={BarChart3} subtitle={`+${Math.round(wellGrowth)}% vs 2015`} accent="blue" />
        <StatCard title="I+II类优良率" value={latest.I2Percent} unit="%" icon={Droplets} subtitle={`${(latest.I2Percent - base.I2Percent).toFixed(1)}pp 10年`} accent="violet" />
      </div>

      {/* ── 主趋势图(堆叠面积) ── */}
      <TechCard title="浅层地下水质量变化趋势(2015-2024)" className="hud-corners">
        <div className="flex items-center justify-between text-xs text-gw-muted mb-2">
          <div className="flex items-center gap-4">
            <span className="text-emerald-400">绿色虚线=III类及以上50%治理目标</span>
            <span className="text-amber-400">橙色虚线=V类水质30%警戒线</span>
          </div>
          <ChartExport data={waterQualityTrend} filename="水质变化趋势2015-2024" sheetName="水质趋势" formats={['xlsx', 'csv', 'json']} label="导出数据" />
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={waterQualityTrend} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
            <XAxis dataKey="year" tick={{ fill: '#8b9dc3', fontSize: 11 }} />
            <YAxis tick={{ fill: '#8b9dc3', fontSize: 11 }} label={{ value: '%', angle: -90, position: 'insideLeft', style: { fill: '#8b9dc3', fontSize: 11 } }} />
            <Tooltip content={<ChartTooltip unit="%" title="水质类别占比" />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <ChartRefLines lines={[
              { y: 50, stroke: '#22c55e', strokeDasharray: '8 4', label: 'III类+ 目标 50%', position: 'top', fontSize: 10 },
              { y: 30, stroke: '#f97316', strokeDasharray: '6 3', label: 'V类 警戒 30%', position: 'bottom', fontSize: 10 },
            ]} />
            <Area type="monotone" dataKey="VPercent" name="V类" stackId="a" fill="#ef4444" stroke="#ef4444" fillOpacity={0.6} />
            <Area type="monotone" dataKey="IVPercent" name="IV类" stackId="a" fill="#f97316" stroke="#f97316" fillOpacity={0.6} />
            <Area type="monotone" dataKey="IIIPlusPercent" name="III类" stackId="a" fill="#eab308" stroke="#eab308" fillOpacity={0.6} />
            <Area type="monotone" dataKey="I2Percent" name="I+II类" stackId="a" fill="#22c55e" stroke="#22c55e" fillOpacity={0.6} />
          </AreaChart>
        </ResponsiveContainer>
      </TechCard>

      <div className="grid grid-cols-2 gap-4">
        {/* ── 监测井增长与III类+达标双轴趋势 ── */}
        <LazyChartCard title="监测井数量与III类+达标率双轴趋势" badge="2015-2024" height={260}>
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={waterQualityTrend} margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis dataKey="year" tick={{ fill: '#8b9dc3', fontSize: 10 }} />
              <YAxis yAxisId="pct" tick={{ fill: '#8b9dc3', fontSize: 10 }} domain={[0, 80]} label={{ value: '%', angle: -90, position: 'insideLeft', fill: '#8b9dc3', fontSize: 10 }} />
              <YAxis yAxisId="wells" orientation="right" tick={{ fill: '#8b9dc3', fontSize: 10 }} domain={[800, 1500]} label={{ value: '眼', angle: 90, position: 'insideRight', fill: '#8b9dc3', fontSize: 10 }} />
              <Tooltip content={<ChartTooltip title="监测与达标" />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Line yAxisId="pct" type="monotone" dataKey="IIIPlusPercent" name="III类+(%)" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
              <Line yAxisId="pct" type="monotone" dataKey="VPercent" name="V类(%)" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
              <Bar yAxisId="wells" dataKey="monitoringWells" name="监测井数" fill="#06b6d4" fillOpacity={0.3} radius={[2, 2, 0, 0]} />
            </ComposedChart>
          </ResponsiveContainer>
        </LazyChartCard>

        {/* ── 各年改善贡献分解 ── */}
        <LazyChartCard title="水质改善年度贡献分解" badge="百分点/年" height={260}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={yearlyChangeData} margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis dataKey="year" tick={{ fill: '#8b9dc3', fontSize: 10 }} />
              <YAxis tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: '百分点', angle: -90, position: 'insideLeft', fill: '#8b9dc3', fontSize: 10 }} />
              <Tooltip content={<ChartTooltip unit="百分点" title="年变化" />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="I+II类贡献" name="I+II类" stackId="s" fill="#22c55e" radius={[0, 0, 0, 0]} />
              <Bar dataKey="III类贡献" name="III类" stackId="s" fill="#eab308" radius={[0, 0, 0, 0]} />
              <Bar dataKey="IV类改善" name="IV类转好" fill="#3b82f6" radius={[0, 0, 0, 0]} />
              <Bar dataKey="V类改善" name="V类转好" fill="#ef4444" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* ── 水质-水位-开采关联散点 ── */}
        <LazyChartCard title="水质改善驱动因素关联(2020-2024)" badge="多维度" height={260}>
          <ResponsiveContainer width="100%" height={240}>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis dataKey="地下水供水量(亿m³)" type="number" name="地下水供水量" tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: '亿m³', position: 'insideBottom', fill: '#8b9dc3', fontSize: 10 }} />
              <YAxis dataKey="III类+(%)" type="number" name="III类+达标率" tick={{ fill: '#8b9dc3', fontSize: 10 }} domain={[30, 50]} label={{ value: '%', angle: -90, position: 'insideLeft', fill: '#8b9dc3', fontSize: 10 }} />
              <ZAxis dataKey="浅层回升(m)" range={[60, 200]} name="浅层回升" />
              <Tooltip content={<ChartTooltip title="驱动关联" />} cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={correlationData} fill="#8b5cf6" fillOpacity={0.7} />
            </ScatterChart>
          </ResponsiveContainer>
          <DataSourceNote source="气泡大小=浅层水位回升幅度；开采减少与水质改善呈正相关" />
        </LazyChartCard>

        {/* ── 水质改善里程碑 ── */}
        <TechCard title="水质改善里程碑">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/15">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={13} className="text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-400">III类+持续提升</span>
              </div>
              <p className="text-xs text-gw-muted">从{base.IIIPlusPercent}%({base.year})升至{latest.IIIPlusPercent}%({latest.year})，10年提升{tenYearImprovement.toFixed(1)}pp</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/15">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 size={13} className="text-blue-400" />
                <span className="text-sm font-semibold text-blue-400">V类大幅下降</span>
              </div>
              <p className="text-xs text-gw-muted">{base.VPercent}%({base.year})降至{latest.VPercent}%({latest.year})，下降{Math.abs(vClassReduction).toFixed(1)}pp</p>
            </div>
            <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/15">
              <div className="flex items-center gap-2 mb-1">
                <FileText size={13} className="text-cyan-400" />
                <span className="text-sm font-semibold text-cyan-400">污染源管控</span>
              </div>
              <p className="text-xs text-gw-muted">{wq.nationalExam.pollutionSourceSurvey}</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/15">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle size={13} className="text-amber-400" />
                <span className="text-sm font-semibold text-amber-400">剩余挑战</span>
              </div>
              <p className="text-xs text-gw-muted">沧州/衡水/廊坊V类占比仍超25%，滨海平原氟化物/TDS治理需持续</p>
            </div>
          </div>
        </TechCard>
      </div>

      {/* ── 趋势明细表 ── */}
      <TechCard title="水质变化趋势明细">
        <FilterableTechTable
          headers={['年份', 'I+II类(%)', 'III类(%)', 'III类+(%)', 'IV类(%)', 'V类(%)', '监测井数', '说明']}
          rows={waterQualityTrend.map((t: WaterQualityTrendPoint) => [
            String(t.year), t.I2Percent, (t.IIIPlusPercent - t.I2Percent).toFixed(1), t.IIIPlusPercent, t.IVPercent, t.VPercent, t.monitoringWells, t.note,
          ])}
        />
      </TechCard>

      {/* ── 各市达标率变化柱状图 ── */}
      <LazyChartCard title="各市III类及以上达标率变化(2020-2024)" badge="百分点提升" height={280}>
        <div className="mb-2 flex justify-end">
          <ChartExport data={[...cityQualityTrend].sort((a: CityQualityTrendPoint, b: CityQualityTrendPoint) => b.improvement - a.improvement)} filename="各市达标率变化2020-2024" sheetName="各市达标率变化2020-2024" formats={['xlsx', 'csv', 'json']} label="导出数据" />
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={[...cityQualityTrend].sort((a: CityQualityTrendPoint, b: CityQualityTrendPoint) => b.improvement - a.improvement)} margin={{ top: 10, right: 20, bottom: 40, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
            <XAxis dataKey="city" tick={{ fill: '#8b9dc3', fontSize: 10 }} />
            <YAxis tick={{ fill: '#8b9dc3', fontSize: 10 }} domain={[15, 85]} label={{ value: '%', angle: -90, position: 'insideLeft', fill: '#8b9dc3' }} />
            <Tooltip content={<ChartTooltip unit="%" title="达标率" />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <ChartRefLines lines={[
              { y: 50, stroke: '#f59e0b', strokeDasharray: '8 4', label: '50% 达标线', position: 'top', fontSize: 10 },
            ]} />
            <Bar dataKey="y2020" name="2020年" fill="#64748b" radius={[2, 2, 0, 0]} />
            <Bar dataKey="y2024" name="2024年" fill="#10b981" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      {/* ── 各市改善速度排名 ── */}
      <TechCard title="各市改善速度排名(年均提升百分点)">
        <div className="mb-2 flex justify-end">
          <ChartExport data={citySpeedRank} filename="各市改善速度排名" sheetName="改善速度排名" formats={['xlsx', 'csv', 'json']} label="导出数据" />
        </div>
        <FilterableTechTable
          headers={['城市', '2020年(%)', '2024年(%)', '5年提升(pp)', '年均提升(pp)', '增速评级']}
          rows={citySpeedRank.map(c => [c.city, c['2020年(%)'], c['2024年(%)'], c['5年提升'], c['年均提升'], c['当前增速评级']])}
        />
      </TechCard>
    </div>
  );
}
