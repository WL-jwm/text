import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart, Cell, PieChart, Pie, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Waves, ShieldAlert, TrendingDown, ArrowDown, ArrowRight } from 'lucide-react';
import { freshSalineInterface, salineWater, salineAlkaliLand } from '../../data/hydrochemistry';
import { TechCard, ChartTooltip, StatCard, DataSourceNote } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { ChartExport } from '../ChartExport';
import { FilterableTechTable } from '../FilterableTechTable';

const TREND_ICONS: Record<string, typeof TrendingDown> = { '稳定': TrendingDown, '界面下移': ArrowDown, '超采治理后趋于稳定': TrendingDown, '南水北调后入侵遏制': ShieldAlert, '深层回补试验场稳定': ShieldAlert };
const TREND_COLORS: Record<string, string> = { '稳定': '#22c55e', '界面下移': '#f97316', '超采治理后趋于稳定': '#3b82f6', '南水北调后入侵遏制': '#22c55e', '深层回补试验场稳定': '#22c55e' };

export function HydrochemInterfaceTab() {
  // 界面深度柱图
  const depthData = useMemo(() =>
    freshSalineInterface.map((f) => ({
      name: f.region,
      浅层淡水底界: parseInt(f.shallowFreshDepth) || 0,
      咸水体顶界: parseInt(f.salineBodyTop) || 0,
      desc: f.interfaceDesc,
      trend: f.trend,
    })),
  []);

  // 趋势分布饼图
  const trendPie = useMemo(() => {
    const counts: Record<string, number> = {};
    freshSalineInterface.forEach(f => { counts[f.trend] = (counts[f.trend] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: name.length > 8 ? name.slice(0, 8) + '...' : name, value, color: TREND_COLORS[name] || '#64748b' }));
  }, []);

  // 盐碱地历史数据（各市轻中重分布）
  const alkaliData = useMemo(() =>
    salineAlkaliLand.historical
      .filter(c => c.total > 10)
      .map(c => ({ name: c.city, 轻度: c.light, 中度: c.medium, 重度: c.heavy, 碳酸盐: c.carbonate, total: c.total }))
      .sort((a, b) => b.total - a.total),
  []);

  // 盐碱地雷达图（top 5城市）
  const alkaliRadar = useMemo(() => {
    const maxTotal = Math.max(...alkaliData.map(d => d.total));
    return alkaliData.slice(0, 5).map(d => ({
      city: d.name,
      轻度: Math.round(d.轻度 / maxTotal * 100),
      中度: Math.round(d.中度 / maxTotal * 100),
      重度: Math.round(d.重度 / maxTotal * 100),
    }));
  }, []);

  // 统计
  const hasSaline = freshSalineInterface.filter(f => f.salineBodyTop !== '无咸水体').length;
  const totalSalineArea = salineWater.distribution.totalArea;
  const totalSalineStorage = salineWater.distribution.totalStorage;

  return (
    <div className="space-y-6">
      {/* 状态横幅 */}
      <div className="p-3 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
        <div className="flex items-center gap-2">
          <Waves size={14} className="text-cyan-400" />
          <span className="text-sm text-cyan-400 font-medium">咸淡水界面与盐碱地分析</span>
        </div>
        <p className="text-xs text-gw-muted mt-1">河北省咸水面积约{totalSalineArea.toLocaleString()}km²，储量{totalSalineStorage}亿m³。南水北调替代深层水后入侵趋势基本遏制。</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3">
        <StatCard title="监测区域" value={freshSalineInterface.length} unit="个" accent="cyan" subtitle="覆盖主要水文区" />
        <StatCard title="有咸水区域" value={hasSaline} unit="个" accent="amber" subtitle={`占比${(hasSaline / freshSalineInterface.length * 100).toFixed(0)}%`} />
        <StatCard title="咸水总面积" value={`${(totalSalineArea / 10000).toFixed(1)}万`} unit="km²" accent="red" subtitle="平原概数" />
        <StatCard title="咸水储量" value={totalSalineStorage} unit="亿m³" accent="blue" subtitle="1999基础文献" />
        <StatCard title="盐碱地面积" value={salineAlkaliLand.latest.totalArea} unit="万亩" accent="amber" subtitle={`${salineAlkaliLand.latest.distribution}`} />
      </div>

      {/* 深度柱状图 + 趋势饼图 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="咸淡水界面深度对比" badge="m" className="scan-line" height={320}>
          <div className="mb-2 flex justify-end">
            <ChartExport data={depthData} filename="咸淡水界面深度" sheetName="界面深度" formats={['xlsx', 'csv', 'json']} label="导出数据" />
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={depthData} margin={{ top: 10, right: 20, bottom: 40, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis dataKey="name" tick={{ fill: '#8b9dc3', fontSize: 9 }} angle={-15} textAnchor="end" height={45} />
              <YAxis tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: '深度(m)', angle: -90, position: 'insideLeft', style: { fill: '#8b9dc3' } }} />
              <Tooltip content={<ChartTooltip title="界面深度" unit="m" />} />
              <Legend wrapperStyle={{ fontSize: 9 }} />
              <Bar dataKey="浅层淡水底界" name="浅层淡水底界" fill="#06b6d4" radius={[3, 3, 0, 0]} />
              <Bar dataKey="咸水体顶界" name="咸水体顶界" fill="#f59e0b" radius={[3, 3, 0, 0]} />
            </ComposedChart>
          </ResponsiveContainer>
          <DataSourceNote source="浅层淡水底界=可开采淡水层底板深度；咸水体顶界=咸水层起始深度。石家庄-邢台山前为全淡水区" />
        </LazyChartCard>

        <div className="space-y-4">
          <LazyChartCard title="界面演变趋势分布" height={180}>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={trendPie} cx="50%" cy="50%" innerRadius={30} outerRadius={55} dataKey="value" stroke="none">
                  {trendPie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<ChartTooltip title="趋势" />} />
                <Legend wrapperStyle={{ fontSize: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </LazyChartCard>

          <TechCard title="界面特征分带卡片" badge="5区域">
            <div className="space-y-2">
              {freshSalineInterface.map((f, i: number) => {
                const TrendIcon = TREND_ICONS[f.trend] || ArrowRight;
                return (
                  <div key={i} className="p-2.5 rounded-lg bg-gw-surface/50 border border-gw-border/30">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-gw-text">{f.region}</span>
                      <span className="flex items-center gap-1 text-[10px]" style={{ color: TREND_COLORS[f.trend] }}>
                        <TrendIcon size={10} />{f.trend}
                      </span>
                    </div>
                    <p className="text-[10px] text-gw-muted mt-1">{f.interfaceDesc} | 淡水{f.shallowFreshDepth}m / 咸水{f.salineBodyTop}m</p>
                  </div>
                );
              })}
            </div>
          </TechCard>
        </div>
      </div>

      {/* 盐碱地城市分布柱状图 + 雷达图 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="各市盐碱地面积分布(历史)" badge="万亩" className="scan-line" height={320}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={alkaliData} margin={{ top: 5, right: 10, bottom: 40, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis dataKey="name" tick={{ fill: '#8b9dc3', fontSize: 10 }} />
              <YAxis tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: '万亩', angle: -90, position: 'insideLeft', fill: '#8b9dc3' }} />
              <Tooltip content={<ChartTooltip title="盐碱地面积" />} />
              <Legend wrapperStyle={{ fontSize: 9 }} />
              <Bar dataKey="轻度" name="轻度" stackId="a" fill="#22c55e" />
              <Bar dataKey="中度" name="中度" stackId="a" fill="#f59e0b" />
              <Bar dataKey="重度" name="重度" stackId="a" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
          <DataSourceNote source="第三次全国土壤普查(2025.11发布)，9市35县，总面积583.42万亩" />
        </LazyChartCard>

        <LazyChartCard title="TOP5城市盐碱化程度对比" badge="归一化" className="scan-line" height={320}>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={alkaliRadar} cx="50%" cy="50%" outerRadius="65%">
              <PolarGrid stroke="rgba(6,182,212,0.15)" />
              <PolarAngleAxis dataKey="city" tick={{ fill: '#8b9dc3', fontSize: 9 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 8 }} />
              <Radar name="轻度" dataKey="轻度" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} />
              <Radar name="中度" dataKey="中度" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
              <Radar name="重度" dataKey="重度" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
              <Legend wrapperStyle={{ fontSize: 9 }} />
            </RadarChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>

      {/* 界面分布表 + 盐碱地治理 */}
      <TechCard title="咸淡水界面分布特征">
        <FilterableTechTable headers={['区域', '浅层淡水深度(m)', '咸水体顶界(m)', '界面描述', '趋势']}
          rows={freshSalineInterface.map((f) => [f.region, f.shallowFreshDepth, f.salineBodyTop, f.interfaceDesc, f.trend])}
          filterPlaceholder="搜索..."
        />
      </TechCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TechCard title="咸水利用与治理现状" badge="可持续利用">
          <div className="space-y-2">
            <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">总体态势：</span>{salineWater.utilization.status}</p>
            <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">回补进展：</span>{salineWater.utilization.recharge}</p>
            <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">数据更新：</span>{salineWater.utilization.channels}</p>
          </div>
        </TechCard>

        <TechCard title="盐碱地治理成效" badge="第三次土壤普查">
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded bg-gw-surface/50 border border-gw-border/30">
                <span className="text-[10px] text-gw-muted">高标准农田</span>
                <span className="block text-sm font-semibold text-emerald-400">{salineAlkaliLand.treatment.highStandardFarm}万亩</span>
              </div>
              <div className="p-2 rounded bg-gw-surface/50 border border-gw-border/30">
                <span className="text-[10px] text-gw-muted">沧州耐盐麦</span>
                <span className="block text-sm font-semibold text-blue-400">{salineAlkaliLand.treatment.cangzhouWheat2024.area}万亩/{salineAlkaliLand.treatment.cangzhouWheat2024.yieldPerMu}kg</span>
              </div>
              <div className="p-2 rounded bg-gw-surface/50 border border-gw-border/30">
                <span className="text-[10px] text-gw-muted">轮作面积</span>
                <span className="block text-sm font-semibold text-amber-400">{salineAlkaliLand.treatment.rotationArea}万亩</span>
              </div>
              <div className="p-2 rounded bg-gw-surface/50 border border-gw-border/30">
                <span className="text-[10px] text-gw-muted">张家口覆盖率</span>
                <span className="block text-sm font-semibold text-cyan-400">{salineAlkaliLand.treatment.zhangjiakouCoverage}%</span>
              </div>
            </div>
            <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">减盐效果：</span>治理区土壤含盐量降低{salineAlkaliLand.treatment.saltReduction}%，耐盐小麦单产{salineAlkaliLand.treatment.cangzhouWheat2024.yieldPerMu}kg/亩，总产{salineAlkaliLand.treatment.cangzhouWheat2024.totalYield}万吨。</p>
          </div>
        </TechCard>
      </div>
    </div>
  );
}
