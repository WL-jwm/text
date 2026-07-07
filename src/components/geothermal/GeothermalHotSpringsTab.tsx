import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Thermometer, Flame, Zap, TrendingUp, MapPin } from 'lucide-react';
import { hotSpringData } from '../../data/hydrogeologyReference';
import { StatCard, TechCard, ChartTooltip, CHART_COLORS } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { ChartExport } from '../ChartExport';
import { FilterableTechTable } from '../FilterableTechTable';


export function GeothermalHotSpringsTab() {
  const springs = hotSpringData.hotSprings;
  const above37 = springs.filter((s: any) => s.temp && parseFloat(s.temp) >= 37).length;
  const above42 = springs.filter((s: any) => s.temp && parseFloat(s.temp) >= 42).length;
  const avgTemp = useMemo(() => {
    const temps = springs.filter((s: any) => s.temp).map((s: any) => parseFloat(s.temp));
    return temps.length ? (temps.reduce((a: number, b: number) => a + b) / temps.length).toFixed(1) : '-';
  }, [springs]);

  // 温度区间分布
  const tempBins = useMemo(() => [
    { name: '25-30C', range: [25, 30], count: springs.filter((s: any) => s.temp && parseFloat(s.temp) >= 25 && parseFloat(s.temp) < 30).length, color: '#3b82f6' },
    { name: '30-37C', range: [30, 37], count: springs.filter((s: any) => s.temp && parseFloat(s.temp) >= 30 && parseFloat(s.temp) < 37).length, color: '#22c55e' },
    { name: '37-42C', range: [37, 42], count: springs.filter((s: any) => s.temp && parseFloat(s.temp) >= 37 && parseFloat(s.temp) < 42).length, color: '#f59e0b' },
    { name: '42C以上', range: [42, 100], count: springs.filter((s: any) => s.temp && parseFloat(s.temp) >= 42).length, color: '#ef4444' },
  ], [springs]);

  // 水化学类型饼图
  const typePie = useMemo(() => {
    const m: Record<string, number> = {};
    springs.forEach((s: any) => { if (s.type) { const t = s.type.split('型')[0] + '型'; m[t] = (m[t] || 0) + 1; } });
    return Object.entries(m).map(([name, value],_i) => ({ name, value }));
  }, [springs]);

  // 温度排名数据
  const tempRankData = useMemo(() =>
    springs.filter((s: any) => s.temp).map((s: any) => ({
      name: s.name,
      '温度(C)': parseFloat(s.temp),
      '流量(m3/h)': s.flow ? parseFloat(s.flow) : 0,
    })).sort((a: any, b: any) => b['温度(C)'] - a['温度(C)']).slice(0, 12),
  []);

  return (
    <div className="space-y-4">
      {/* ── 数据来源提示 ── */}
      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
        <p className="text-[10px] text-amber-300">经典热泉资料来源于《河北省水文地质工程地质》（1980s），反映历史调查成果。截止1977年全省山区热泉点31个。</p>
      </div>

      {/* ── 5格统计卡片 ── */}
      <div className="grid grid-cols-5 gap-3">
        <StatCard title="热泉总数" value={hotSpringData.summary.totalPoints} unit="个" icon={Thermometer} subtitle="截止1977年" accent="amber" />
        <StatCard title="37C以上" value={above37} unit="个" icon={Flame} subtitle="中温热泉" accent="red" />
        <StatCard title="42C以上" value={above42} unit="个" icon={Zap} subtitle="高温热泉" accent="orange" />
        <StatCard title="平均温度" value={avgTemp} unit="C" icon={TrendingUp} subtitle="有记录泉点" accent="cyan" />
        <StatCard title="最高温度" value={hotSpringData.summary.maxTemp} unit="C" icon={MapPin} subtitle={hotSpringData.summary.maxLocation} accent="emerald" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* ── 温度TOP12排名 ── */}
        <LazyChartCard title="热泉温度TOP12排名" badge="C" height={280}>
          <div className="mb-2 flex justify-end">
            <ChartExport data={tempRankData} filename="热泉温度排名" sheetName="温度排名" formats={['xlsx', 'csv', 'json']} label="导出数据" />
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={tempRankData} layout="vertical" margin={{ top: 5, right: 20, bottom: 20, left: 70 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis type="number" tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: 'C', position: 'insideBottom', fill: '#8b9dc3', fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#8b9dc3', fontSize: 9 }} width={65} />
              <Tooltip content={<ChartTooltip unit="C" title="热泉温度" />} />
              <Bar dataKey="温度(C)" name="温度" radius={[0, 4, 4, 0]}>
                {tempRankData.map((entry: any, i: number) => (
                  <Cell key={i} fill={entry['温度(C)'] >= 60 ? '#ef4444' : entry['温度(C)'] >= 42 ? '#f59e0b' : entry['温度(C)'] >= 37 ? '#22c55e' : '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>

        {/* ── 温度区间+水化学类型 ── */}
        <div className="space-y-4">
          <LazyChartCard title="温度区间分布" badge="4区间" height={140}>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={tempBins}>
                <XAxis dataKey="name" tick={{ fill: '#8b9dc3', fontSize: 9 }} />
                <YAxis tick={{ fill: '#8b9dc3', fontSize: 10 }} />
                <Tooltip content={<ChartTooltip unit="个" title="温度区间" />} />
                <Bar dataKey="count" name="数量" radius={[4, 4, 0, 0]}>
                  {tempBins.map((entry: any, i: number) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </LazyChartCard>
          <LazyChartCard title="水化学类型分布" badge={typePie.length + '类'} height={140}>
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie data={typePie} cx="50%" cy="50%" innerRadius={25} outerRadius={50} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {typePie.map((e: any, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<ChartTooltip title="水化学类型" />} />
              </PieChart>
            </ResponsiveContainer>
          </LazyChartCard>
        </div>
      </div>

      {/* ── 热泉详细列表 ── */}
      <TechCard title="主要热泉一览" badge={springs.length + '处'}>
        <div className="mb-2 flex justify-end">
          <ChartExport data={springs.map((s: any) => ({ name: s.name, location: s.location, temp: s.temp, flow: s.flow, type: s.type }))} filename="热泉一览" sheetName="热泉" formats={['xlsx', 'csv', 'json']} label="导出数据" />
        </div>
        <FilterableTechTable
          headers={['泉名', '位置', '温度(C)', '流量(m3/h)', '水化学类型']}
          rows={springs.map((s: any) => [s.name, s.location, s.temp ?? '-', s.flow ?? '-', s.type || '-'])}
          filterPlaceholder="搜索热泉..."
        />
        <div className="mt-3 flex flex-wrap gap-3 text-[10px]">
          <span className="text-gw-muted">常见流量: {hotSpringData.summary.commonFlow}</span>
          <span className="text-gw-muted">水化学: {hotSpringData.summary.hydrochemType}</span>
          <span className="text-gw-muted">最高温度位置: {hotSpringData.summary.maxLocation}</span>
        </div>
      </TechCard>

      {/* ── 平原地热异常区 ── */}
      <TechCard title="平原地热异常区" badge="3处">
        <div className="space-y-2">
          {hotSpringData.geothermalAnomalies.map((ga: any, i: number) => (
            <div key={i} className="p-2.5 bg-gw-surface/50 rounded-lg border border-gw-border/30">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gw-text">{ga.name}</span>
                {ga.temp && <span className="text-[10px] font-mono text-amber-400">{ga.temp}</span>}
              </div>
              <p className="text-[10px] text-gw-muted">{ga.location}</p>
              <p className="text-[10px] text-gw-cyan mt-0.5">{ga.note}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 p-2 bg-gw-surface/30 rounded text-[10px] text-gw-muted">
          <p className="font-medium text-gw-text mb-1">开发利用概况（截止1977年）</p>
          <p>已利用热泉45处：疗养9处、工业1处、饮用8处、灌溉24处、发电1处。平原区利用地热钻孔70个（采暖、洗澡、育秧、育种）。</p>
        </div>
      </TechCard>
    </div>
  );
}
