import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { CheckCircle2, Droplets, Shield, Award, Activity } from 'lucide-react';
import { TechCard, ChartTooltip, StatCard } from '../UI';
import { LazyChartCard } from '../LazyChartCard';

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wq: any;
}

const _COLORS = ['#06b6d4', '#3b82f6', '#10b981', '#f59e0b'];

export function WaterQualityDrinkingTab({ wq }: Props) {
  const dw = wq.drinkingWater;
  const exam = wq.nationalExam;

  // 水源地类型分布
  const sourcePie = useMemo(() => [
    { name: '地表水水源地', value: dw.surfaceWater.count, color: '#06b6d4' },
    { name: '地下水水源地', value: dw.groundwater.count, color: '#3b82f6' },
  ], [wq]);

  // 地表水源地城市分布
  const _surfaceByCity = useMemo(() => {
    const cityCount: Record<string, number> = {};
    dw.surfaceWater.list.forEach((s: string) => {
      const match = s.match(/（(.+?）)/);
      const c = match ? match[1] : '其他';
      cityCount[c] = (cityCount[c] || 0) + 1;
    });
    return Object.entries(cityCount).map(([city, count]) => ({ city, count }));
  }, [wq]);

  // 地下水源地城市分布
  const gwByCity = useMemo(() => {
    const cityCount: Record<string, number> = {};
    dw.groundwater.list.forEach((s: string) => {
      const match = s.match(/（(.+?）)/);
      const c = match ? match[1] : '其他';
      cityCount[c] = (cityCount[c] || 0) + 1;
    });
    return Object.entries(cityCount).sort((a, b) => b[1] - a[1]).map(([city, count]) => ({ city, count }));
  }, [wq]);

  // 统计
  const totalSources = dw.surfaceWater.count + dw.groundwater.count;
  const surfaceRatio = (dw.surfaceWater.count / totalSources * 100).toFixed(0);
  const gwRatio = (dw.groundwater.count / totalSources * 100).toFixed(0);

  return (
    <div className="space-y-6">
      {/* 状态横幅 */}
      <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20">
        <div className="flex items-center gap-2">
          <Award size={14} className="text-emerald-400" />
          <span className="text-sm text-emerald-400 font-medium">集中式饮用水源地100%达标</span>
        </div>
        <p className="text-xs text-gw-muted mt-1">{totalSources}个水源地（地表水{dw.surfaceWater.count}个+地下水{dw.groundwater.count}个），全部符合饮用水标准。</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3">
        <StatCard title="水源地总数" value={totalSources} unit="个" accent="blue" subtitle="全省集中式" />
        <StatCard title="地表水" value={dw.surfaceWater.count} unit="个" accent="cyan" subtitle={`占比${surfaceRatio}%`} />
        <StatCard title="地下水" value={dw.groundwater.count} unit="个" accent="emerald" subtitle={`占比${gwRatio}%`} />
        <StatCard title="V类水比例" value={exam.classVRatio} unit="%" accent="green" subtitle={`要求&le;${exam.nationalRequirement}%`} />
        <StatCard title="综合评价" value="100" unit="%达标" accent="emerald" subtitle={exam.evaluation} />
      </div>

      {/* 水源类型 + 国考断面 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="水源地类型分布" badge={`${totalSources}个`} className="scan-line" height={320}>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={sourcePie} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none">
                {sourcePie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip content={<ChartTooltip title="水源地" />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-2 text-[10px] text-gw-muted">
            <span>地表水: {surfaceRatio}%</span>
            <span>地下水: {gwRatio}%</span>
          </div>
        </LazyChartCard>

        <LazyChartCard title="国考断面水质评价" badge="2024" className="hud-corners" height={320}>
          <div className="grid grid-cols-2 gap-3 p-2">
            <div className="text-center p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/15">
              <p className="text-[10px] text-gw-muted mb-1">V类水比例</p>
              <p className="text-2xl font-bold font-mono text-emerald-400">{exam.classVRatio}%</p>
              <p className="text-[10px] text-gw-muted mt-1">国家要求 &le;{exam.nationalRequirement}%</p>
            </div>
            <div className="text-center p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/15">
              <p className="text-[10px] text-gw-muted mb-1">评价结论</p>
              <p className="text-lg font-bold text-cyan-400">{exam.evaluation}</p>
              <p className="text-[10px] text-gw-muted mt-1">{exam.monitoring}</p>
            </div>
          </div>
          {/* 地表水评价 */}
          <div className="grid grid-cols-2 gap-2 px-2 mt-1">
            <div className="p-2 rounded bg-gw-surface/50 border border-gw-border/30">
              <span className="text-[10px] text-gw-muted">地表水III类以上</span>
              <span className="block text-sm font-semibold text-blue-400">{wq.surfaceWaterQuality.classIIIPlus}/{wq.surfaceWaterQuality.totalStations}站 ({wq.surfaceWaterQuality.classIIIRatio}%)</span>
            </div>
            <div className="p-2 rounded bg-gw-surface/50 border border-gw-border/30">
              <span className="text-[10px] text-gw-muted">连续V类消除</span>
              <span className="block text-sm font-semibold text-emerald-400">{wq.surfaceWaterQuality.worstClassYears === 0 ? '已全部消除' : wq.surfaceWaterQuality.worstClassYears + '年改善中'}</span>
            </div>
          </div>
          {/* 达标进度条 */}
          <div className="px-2 pb-2 mt-2">
            <div className="flex items-center justify-between text-[10px] text-gw-muted mb-1">
              <span>V类水控制目标达成</span>
              <span>{exam.classVRatio}% / {exam.nationalRequirement}%</span>
            </div>
            <div className="h-3 rounded-full bg-gw-surface/60 overflow-hidden">
              <div className="h-full rounded-full progress-stripe" style={{
                width: `${(exam.classVRatio / exam.nationalRequirement) * 100}%`,
                background: exam.classVRatio <= exam.nationalRequirement
                  ? 'linear-gradient(90deg, #10b981, #34d399)'
                  : 'linear-gradient(90deg, #ef4444, #f87171)',
              }} />
            </div>
          </div>
        </LazyChartCard>
      </div>

      {/* 水源地城市分布 + 各市水源地数量 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="地下水源地城市分布" badge="16个" height={280}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={gwByCity} margin={{ top: 5, right: 10, bottom: 30, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis dataKey="city" tick={{ fill: '#8b9dc3', fontSize: 9 }} angle={-15} textAnchor="end" height={35} />
              <YAxis tick={{ fill: '#8b9dc3', fontSize: 10 }} allowDecimals={false} />
              <Tooltip content={<ChartTooltip title="水源地数量" />} />
              <Bar dataKey="count" name="水源地数量" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <TechCard title="水源地达标统计" badge="100%">
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/15 text-center">
              <Activity size={14} className="text-emerald-400 mx-auto mb-1" />
              <span className="text-[10px] text-gw-muted block">地表水达标率</span>
              <span className="text-lg font-bold text-emerald-400">{dw.surfaceWater.compliance}%</span>
            </div>
            <div className="p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/15 text-center">
              <Droplets size={14} className="text-blue-400 mx-auto mb-1" />
              <span className="text-[10px] text-gw-muted block">地下水达标率</span>
              <span className="text-lg font-bold text-blue-400">{dw.groundwater.compliance}%</span>
            </div>
          </div>
          <div className="mt-3 p-2 rounded bg-gw-surface/50 border border-gw-border/30">
            <p className="text-[10px] text-gw-muted"><span className="text-gw-text font-semibold">综合达标率：</span>{dw.overallCompliance}%（{totalSources}个水源地全部达标）</p>
            <p className="text-[10px] text-gw-muted mt-1"><span className="text-gw-text font-semibold">监测方式：</span>{exam.monitoring}</p>
            <p className="text-[10px] text-gw-muted mt-1"><span className="text-gw-text font-semibold">污染源调查：</span>{exam.pollutionSourceSurvey}</p>
          </div>
        </TechCard>
      </div>

      {/* 水源地列表 */}
      <TechCard title="集中式饮用水源地" className="hud-corners">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Droplets size={14} className="text-blue-400" />
              <h4 className="text-sm text-gw-text font-medium">地表水水源地 ({dw.surfaceWater.count}个)</h4>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {dw.surfaceWater.list.map((s: string, i: number) => (
                <div key={i} className="p-2 bg-gw-surface/50 rounded-lg border border-gw-border/30 text-xs text-gw-text flex items-center gap-1">
                  <CheckCircle2 size={11} className="text-emerald-400 flex-shrink-0" />{s}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield size={14} className="text-cyan-400" />
              <h4 className="text-sm text-gw-text font-medium">地下水水源地 ({dw.groundwater.count}个)</h4>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {dw.groundwater.list.map((s: string, i: number) => (
                <div key={i} className="p-2 bg-gw-surface/50 rounded-lg border border-gw-border/30 text-xs text-gw-text flex items-center gap-1">
                  <CheckCircle2 size={11} className="text-emerald-400 flex-shrink-0" />{s}
                </div>
              ))}
            </div>
          </div>
        </div>
      </TechCard>
    </div>
  );
}
