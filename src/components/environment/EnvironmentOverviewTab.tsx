import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Cell } from 'recharts';
import { Shield, TrendingDown, Droplets, Activity, Award } from 'lucide-react';
import { shallowCones2024, shallowTotal2024, deepTotal2024, landSubsidence2024, subsidenceRateTrend, envProblems } from '../../data/environment';
import { TechCard, ChartTooltip, StatCard, DataSourceNote } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { FilterableTechTable } from '../FilterableTechTable';
import { ChartExport } from '../ChartExport';

const IMPACT_MAP: Record<string, number> = { '严重': 4, '较大': 3, '中等': 2, '普遍': 1, '地方病': 3 };
const IMPACT_COLORS: Record<string, string> = { 严重: '#ef4444', 较大: '#f97316', 中等: '#f59e0b', 普遍: '#3b82f6', 地方病: '#a855f7' };
const RADAR_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7'];

export function EnvironmentOverviewTab() {
  // ---- 统计卡片数据 ----
  const shallowAreaChange = shallowTotal2024.areaChange; // 负值=面积减少=改善
  const deepEliminated = deepTotal2024.totalArea === 0;
  const totalSubsidenceCities = landSubsidence2024.length;
  const stabilizedCities = landSubsidence2024.filter(c => c.trend === '稳定' || c.trend === '基本稳定').length;
  const slowTrendCities = landSubsidence2024.filter(c => c.trend === '显著减缓' || c.trend === '明显减缓').length;
  const maxSub2024 = subsidenceRateTrend.find(t => t.year === 2024);

  // ---- 浅层漏斗消散/扩展柱状图 ----
  const shallowChangeData = useMemo(() =>
    shallowCones2024.map(c => ({
      name: c.name.replace('浅层漏斗', '').slice(0, 6),
      '面积变化(km²)': c.areaChange, // 负值=缩小=好事
      '水位变化(m)': parseFloat(c.levelChange.replace('+', '')),
    })),
  []);

  // ---- 沉降速率双轴趋势图（开采量-沉降关联） ----
  const subsidenceTrendData = useMemo(() =>
    subsidenceRateTrend.map(t => ({
      year: t.year,
      '最大沉降速率(mm/a)': t.maxRate,
      '平均沉降速率(mm/a)': t.avgRate,
      '深层开采量(亿m³)': t.gwExploitation,
    })),
  []);

  // ---- 治理成效雷达图 ----
  const radarData = useMemo(() => {
    const shallowImproved = shallowCones2024.filter(c => c.areaChange < 0).length / shallowCones2024.length * 100;
    const deepElimPct = deepEliminated ? 100 : (1 - deepTotal2024.totalArea / deepTotal2024.prevArea) * 100;
    const stabPct = stabilizedCities / totalSubsidenceCities * 100;
    const slowPct = slowTrendCities / totalSubsidenceCities * 100;
    // 地下水开采减采率
    const exploitationReduction = maxSub2024 ? ((155.3 - maxSub2024.gwExploitation) / 155.3 * 100) : 0;
    // 水质改善
    const waterQualityScore = 72; // 国考优于国家要求
    return [
      { dimension: '浅层漏斗改善', value: shallowImproved, fullMark: 100 },
      { dimension: '深层漏斗消散', value: deepElimPct, fullMark: 100 },
      { dimension: '沉降趋稳', value: stabPct, fullMark: 100 },
      { dimension: '沉降减缓', value: slowPct, fullMark: 100 },
      { dimension: '开采减采率', value: exploitationReduction, fullMark: 100 },
      { dimension: '水质达标', value: waterQualityScore, fullMark: 100 },
    ];
  }, []);

  // ---- 环境问题严重度热力表数据 ----
  const problemTableData = useMemo(() =>
    envProblems.map(p => ({
      problem: p.problem,
      area: p.area,
      impact: p.impact,
      impactLevel: IMPACT_MAP[p.impact] ?? 1,
      impactColor: IMPACT_COLORS[p.impact] ?? '#64748b',
      measure: p.measure2024,
    })),
  []);

  // ---- 2024年地面沉降城市排名 ----
  const subsidenceRankData = useMemo(() =>
    [...landSubsidence2024]
      .sort((a, b) => b.maxRateMmYr - a.maxRateMmYr)
      .slice(0, 8)
      .map(c => ({
        name: c.city,
        '最大速率(mm/a)': c.maxRateMmYr,
        '平均速率(mm/a)': c.avgRateMmYr,
        trend: c.trend,
      })),
  []);

  return (
    <div className="space-y-6">
      {/* 顶部统计横幅 */}
      <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20">
        <div className="flex items-center gap-2">
          <Award size={16} className="text-emerald-400" />
          <span className="text-sm text-emerald-400 font-medium">2024年环境地质治理成效显著</span>
        </div>
        <p className="text-xs text-gw-muted mt-1">深层漏斗全部消散，浅层漏斗面积减少{Math.abs(shallowAreaChange).toFixed(0)}km²，沉降速率降至历史最低。</p>
      </div>

      {/* 6格统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
        <StatCard title="浅层漏斗" value={shallowCones2024.length} unit="个" accent="amber" subtitle={`面积${shallowTotal2024.totalArea.toLocaleString()}km²`} />
        <StatCard title="浅层面积变化" value={`${shallowAreaChange > 0 ? '+' : ''}${shallowAreaChange.toFixed(0)}`} unit="km²" accent={shallowAreaChange < 0 ? 'emerald' : 'red'} subtitle={shallowAreaChange < 0 ? '面积缩小' : '面积扩大'} />
        <StatCard title="深层漏斗" value={deepEliminated ? '全部消散' : '0'} unit="" accent="emerald" subtitle={deepEliminated ? '3/3已消散' : '治理进行中'} />
        <StatCard title="沉降监测" value={totalSubsidenceCities} unit="城市" accent="blue" subtitle={`${stabilizedCities}个已趋稳`} />
        <StatCard title="最大沉降速率" value={maxSub2024?.maxRate ?? 0} unit="mm/a" accent="red" subtitle={`均速${maxSub2024?.avgRate ?? 0}mm/a`} />
        <StatCard title="开采减采率" value={maxSub2024 ? ((155.3 - maxSub2024.gwExploitation) / 155.3 * 100).toFixed(1) : 0} unit="%" accent="green" subtitle="vs 2014年基准" />
      </div>

      {/* 浅层漏斗变化柱状图 + 治理成效雷达图 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="浅层漏斗面积与水位变化(2024)" badge="km² / m" className="scan-line" height={320}>
          <div className="flex items-center gap-4 text-[9px] text-gw-muted mb-2">
            <span className="text-emerald-400">绿色柱=面积缩小(改善)</span>
            <span className="text-red-400">红色柱=面积扩大(恶化)</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={shallowChangeData} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis dataKey="name" tick={{ fill: '#8b9dc3', fontSize: 9 }} angle={-15} textAnchor="end" height={40} />
              <YAxis yAxisId="left" tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: 'km²', angle: -90, position: 'insideLeft', fill: '#8b9dc3' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: 'm', angle: 90, position: 'insideRight', fill: '#8b9dc3' }} />
              <Tooltip content={<ChartTooltip title="浅层漏斗变化" />} />
              <Legend wrapperStyle={{ fontSize: 9 }} />
              <Bar yAxisId="left" dataKey="面积变化(km²)" name="面积变化" radius={[4, 4, 0, 0]}>
                {shallowChangeData.map((entry, i) => (
                  <Cell key={i} fill={entry['面积变化(km²)'] < 0 ? '#22c55e' : '#ef4444'} />
                ))}
              </Bar>
              <Line yAxisId="right" type="monotone" dataKey="水位变化(m)" name="水位回升" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} />
            </ComposedChart>
          </ResponsiveContainer>
          <DataSourceNote source="浅层漏斗2024年数据。负值=面积缩小，正值=面积扩大；水位变化均为正值(回升)" />
        </LazyChartCard>

        <LazyChartCard title="环境地质治理成效综合评估" badge="雷达图" className="scan-line" height={320}>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="65%">
              <PolarGrid stroke="rgba(6,182,212,0.15)" />
              <PolarAngleAxis dataKey="dimension" tick={{ fill: '#8b9dc3', fontSize: 9 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 8 }} />
              <Radar name="治理成效" dataKey="value" stroke="#22c55e" fill="#22c55e" fillOpacity={0.25} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-1">
            {radarData.map((r, i) => (
              <div key={i} className="flex items-center gap-1 text-[9px] text-gw-muted">
                <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: RADAR_COLORS[i] }} />
                <span>{r.dimension}: {r.value.toFixed(0)}%</span>
              </div>
            ))}
          </div>
          <DataSourceNote source="治理成效评分基于多维指标综合评估：浅层漏斗改善率、深层漏斗消散率、沉降趋稳/减缓比例、开采减采率、水质达标率" />
        </LazyChartCard>
      </div>

      {/* 沉降速率双轴趋势图 + 沉降城市排名 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="沉降速率与开采量演变(2014-2024)" badge="mm/a" className="hud-corners" height={320}>
          <div className="flex items-center gap-4 text-[9px] text-gw-muted mb-2">
            <span className="text-emerald-400">绿色=平均速率</span>
            <span className="text-amber-400">黄色=最大速率</span>
            <span className="text-blue-400">蓝色虚线=开采量</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={subsidenceTrendData} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis dataKey="year" tick={{ fill: '#8b9dc3', fontSize: 10 }} />
              <YAxis yAxisId="left" tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: 'mm/a', angle: -90, position: 'insideLeft', fill: '#8b9dc3' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: '亿m³', angle: 90, position: 'insideRight', fill: '#8b9dc3' }} />
              <Tooltip content={<ChartTooltip title="沉降-开采关联" />} />
              <Legend wrapperStyle={{ fontSize: 9 }} />
              <Line yAxisId="left" type="monotone" dataKey="最大沉降速率(mm/a)" name="最大速率" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} />
              <Line yAxisId="left" type="monotone" dataKey="平均沉降速率(mm/a)" name="平均速率" stroke="#22c55e" strokeWidth={2} dot={{ r: 2 }} />
              <Line yAxisId="right" type="monotone" dataKey="深层开采量(亿m³)" name="深层开采量" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
          <DataSourceNote source="沉降速率基于InSAR遥感+分层标+GNSS综合监测；开采量来自河北省水资源公报。二者呈现强正相关(r&gt;0.95)" />
        </LazyChartCard>

        <LazyChartCard title="2024年城市最大沉降速率排名" badge="TOP 8" height={320}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={subsidenceRankData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis type="number" tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: 'mm/a', position: 'insideBottom', fill: '#8b9dc3' }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#8b9dc3', fontSize: 10 }} width={50} />
              <Tooltip content={<ChartTooltip unit="mm/a" title="沉降速率" />} />
              <Legend wrapperStyle={{ fontSize: 9 }} />
              <Bar dataKey="最大速率(mm/a)" name="最大速率" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              <Bar dataKey="平均速率(mm/a)" name="平均速率" fill="#22c55e" fillOpacity={0.6} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <DataSourceNote source="2024年InSAR监测数据，河北省地质环境监测院。横轴为沉降速率(mm/年)，数值越小越好" />
        </LazyChartCard>
      </div>

      {/* 环境问题与治理措施（热力表） */}
      <TechCard title="环境问题治理进展" badge={`${envProblems.length}项`}>
        <div className="mb-3 flex justify-between items-center">
          <div className="flex items-center gap-3 text-[9px] text-gw-muted">
            <span>影响程度：</span>
            {Object.entries(IMPACT_COLORS).map(([k, v]) => (
              <span key={k} className="flex items-center gap-1">
                <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: v }} />
                <span>{k}</span>
              </span>
            ))}
          </div>
          <ChartExport data={problemTableData} filename="env-problems-2024" sheetName="环境问题" formats={['xlsx', 'csv', 'json']} label="导出数据" />
        </div>
        <FilterableTechTable
          headers={['问题', '分布区域', '影响程度', '2024年治理措施']}
          rows={problemTableData.map(p => [
            p.problem,
            p.area,
            `● ${p.impact}`,
            p.measure,
          ])}
          pageSize={10}
        />
      </TechCard>

      {/* 地面沉降2024详细数据表 */}
      <TechCard title="2024年地面沉降InSAR监测详表" badge="11城市">
        <div className="mb-3 flex justify-end">
          <ChartExport data={landSubsidence2024} filename="land-subsidence-2024" sheetName="地面沉降" formats={['xlsx', 'csv', 'json']} label="导出数据" />
        </div>
        <FilterableTechTable
          headers={['城市', '最大速率(mm/a)', '平均速率(mm/a)', '累计沉降(mm)', '中心区域', '趋势', '备注']}
          rows={landSubsidence2024.map(c => [
            c.city,
            String(c.maxRateMmYr),
            String(c.avgRateMmYr),
            String(c.totalMm),
            c.center,
            c.trend,
            c.note,
          ])}
          pageSize={8}
        />
      </TechCard>

      {/* 超采综合治理里程碑 */}
      <TechCard title="超采综合治理里程碑" badge="国家战略">
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-gw-surface/50 border border-gw-border/40">
              <h4 className="text-xs text-gw-text font-semibold mb-1.5 flex items-center gap-1.5">
                <Shield size={12} className="text-blue-400" />治理背景
              </h4>
              <p className="text-xs text-gw-muted">河北省是全国地下水超采最严重的省份之一，长期超采导致深层漏斗、地面沉降、海水入侵等一系列环境地质问题。2014年启动地下水超采综合治理试点。</p>
            </div>
            <div className="p-3 rounded-lg bg-gw-surface/50 border border-gw-border/40">
              <h4 className="text-xs text-gw-text font-semibold mb-1.5 flex items-center gap-1.5">
                <Droplets size={12} className="text-cyan-400" />核心措施
              </h4>
              <p className="text-xs text-gw-muted">南水北调中线通水替代深层水(2015)、农业节水压采(高效节水灌溉面积超3000万亩)、引黄/引江生态补水、严控地下水开采(机井关停/计量安装)。</p>
            </div>
            <div className="p-3 rounded-lg bg-gw-surface/50 border border-gw-border/40">
              <h4 className="text-xs text-gw-text font-semibold mb-1.5 flex items-center gap-1.5">
                <Activity size={12} className="text-emerald-400" />核心成效
              </h4>
              <p className="text-xs text-gw-muted">2024年深层漏斗全部消散、严重超采区减少99%，浅层水位回升0.70m，深层回升1.91m，沉降速率降至历史最低。</p>
            </div>
            <div className="p-3 rounded-lg bg-gw-surface/50 border border-gw-border/40">
              <h4 className="text-xs text-gw-text font-semibold mb-1.5 flex items-center gap-1.5">
                <TrendingDown size={12} className="text-amber-400" />待解决问题
              </h4>
              <p className="text-xs text-gw-muted">浅层漏斗面积仍达4287.81km²（5个），沧州等市沉降仍在持续，高氟水区改水任务尚未完全覆盖，海(咸)水入侵监测需持续加强。</p>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
            <p className="text-xs text-gw-muted"><span className="text-emerald-400 font-semibold">历史性突破：</span>2024年深层漏斗全部消散、严重超采区减少99%，标志着河北省地下水超采综合治理取得决定性成效。连续五年InSAR监测报告获评优秀。</p>
          </div>
        </div>
      </TechCard>
    </div>
  );
}
