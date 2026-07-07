import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, Area, Line, ComposedChart, Legend } from 'recharts';
import { TrendingUp, CheckCircle2, AlertTriangle, Droplets } from 'lucide-react';
import { cityGroundwaterQuality2024, qualityLevelTrend2020_2024 } from '../../data/waterQuality';
import { StatCard, TechCard, ChartTooltip, DataSourceNote } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { ChartExport } from '../ChartExport';
import { FilterableTechTable } from '../FilterableTechTable';

export function WaterQualityCityRateTab() {
  const avgRate = (cityGroundwaterQuality2024.reduce((s, c) => s + c.rate, 0) / cityGroundwaterQuality2024.length).toFixed(1);
  const bestCity = cityGroundwaterQuality2024.find(c => c.city === '承德')!;
  const worstCity = cityGroundwaterQuality2024.find(c => c.city === '沧州')!;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <StatCard title="市级覆盖率" value="11" unit="/14市" accent="cyan" subtitle="有监测数据城市" />
        <StatCard title="全省均值" value={`${avgRate}%`} accent="amber" subtitle="III类及以上达标率" />
        <StatCard title="最优城市" value="承德" subtitle={`${bestCity.rate}% · ${bestCity.wells}井`} accent="emerald" />
        <StatCard title="需关注" value="沧州" subtitle={`${worstCity.rate}% · 深层咸水区`} accent="red" />
      </div>

      <LazyChartCard title="各市浅层地下水III类及以上达标率排名(2024)" height={340}>
        <div className="mb-2 flex justify-end">
          <ChartExport data={cityGroundwaterQuality2024.sort((a, b) => b.rate - a.rate)} filename="各市达标率排名2024" sheetName="各市达标率排名2024" formats={['xlsx','csv','json']} label="导出数据" />
        </div>
        <div className="flex items-center gap-4 text-xs text-gw-muted mb-2">
          <span className="text-amber-400">黄色虚线=全省均值</span>
          <span className="text-emerald-400">绿色虚线=50%优良线</span>
        </div>
        <ResponsiveContainer width="100%" height={380}>
          <BarChart data={cityGroundwaterQuality2024.sort((a, b) => b.rate - a.rate)} layout="vertical" margin={{ top: 10, right: 50, bottom: 10, left: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
            <XAxis type="number" tick={{ fill: '#8b9dc3', fontSize: 10 }} domain={[0, 80]} label={{ value: '达标率(%)', position: 'insideBottom', offset: -5, style: { fill: '#8b9dc3', fontSize: 10 } }} />
            <YAxis dataKey="city" type="category" tick={{ fill: '#8b9dc3', fontSize: 11 }} width={55} />
            <Tooltip content={<ChartTooltip unit="%" title="达标率" />} />
            <ReferenceLine x={50} stroke="#22c55e" strokeDasharray="8 4" label={{ value: '50%优良', position: 'top', fill: '#22c55e', fontSize: 10 }} />
            <ReferenceLine x={+avgRate} stroke="#eab308" strokeDasharray="6 3" label={{ value: '全省均值', position: 'bottom', fill: '#eab308', fontSize: 10 }} />
            <Bar dataKey="rate" name="达标率" radius={[0, 4, 4, 0]}>
              {cityGroundwaterQuality2024.sort((a, b) => b.rate - a.rate).map((entry) => (
                <Cell key={entry.city} fill={entry.rate >= 50 ? '#10b981' : entry.rate >= 30 ? '#eab308' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <LazyChartCard title="水质达标率-地下水供水量-浅层水位回升 关联趋势(2020-2024)" height={320}>
        <div className="mb-2 flex justify-end">
          <ChartExport data={qualityLevelTrend2020_2024} filename="水质关联趋势2020-2024" sheetName="水质关联趋势2020-2024" formats={['xlsx','csv','json']} label="导出数据" />
        </div>
        <div className="flex items-center gap-4 text-xs text-gw-muted mb-2">
          <span className="text-emerald-400">绿色面积=III类+达标率</span>
          <span className="text-blue-400">蓝色线=地下水供水量(亿m³)</span>
          <span className="text-amber-400">橙色线=浅层水位回升(m)</span>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={qualityLevelTrend2020_2024} margin={{ top: 10, right: 50, bottom: 30, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
            <XAxis dataKey="year" tick={{ fill: '#8b9dc3', fontSize: 11 }} />
            <YAxis yAxisId="rate" tick={{ fill: '#8b9dc3', fontSize: 10 }} domain={[0, 50]} label={{ value: '达标率(%)', angle: -90, position: 'insideLeft', style: { fill: '#8b9dc3', fontSize: 10 } }} />
            <YAxis yAxisId="supply" orientation="right" tick={{ fill: '#8b9dc3', fontSize: 10 }} domain={[60, 120]} label={{ value: '亿m³', angle: 90, position: 'insideRight', style: { fill: '#8b9dc3', fontSize: 10 } }} />
            <YAxis yAxisId="rise" orientation="right" tick={{ fill: '#8b9dc3', fontSize: 9 }} domain={[0, 1]} label={{ value: '回升(m)', angle: 90, position: 'insideRight', offset: 55, style: { fill: '#8b9dc3', fontSize: 9 } }} />
            <Tooltip content={<ChartTooltip title="关联趋势" />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Area yAxisId="rate" type="monotone" dataKey="IIIplus" name="III类+达标率(%)" fill="#22c55e" stroke="#22c55e" fillOpacity={0.15} />
            <Line yAxisId="supply" type="monotone" dataKey="gwSupply" name="地下水供水(亿m³)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6' }} />
            <Line yAxisId="rise" type="monotone" dataKey="shallowRise" name="浅层回升(m)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4, fill: '#f59e0b' }} strokeDasharray="4 2" />
          </ComposedChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <TechCard title="各市浅层地下水达标率评价(2024)">
        <div className="flex items-center gap-4 mb-3 text-[10px]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> 达标率≥50% (优良)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> 30%-50% (一般)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> {'<'}30% (较差)</span>
        </div>
        <FilterableTechTable
          headers={['城市', '达标率(%)', '监测井数', '年变化', '水质评价', '备注']}
          rows={cityGroundwaterQuality2024.sort((a, b) => b.rate - a.rate).map(c => {
            const level = c.rate >= 50 ? '优良' : c.rate >= 30 ? '一般' : '较差';
            const levelClass = c.rate >= 50 ? 'text-emerald-400' : c.rate >= 30 ? 'text-amber-400' : 'text-red-400';
            return [c.city, c.rate.toFixed(1), String(c.wells), `+${c.trend}`, `<span class="${levelClass}">${level}</span>`, c.note];
          })}
          filterPlaceholder="搜索城市..."
        />
      </TechCard>

      <TechCard title="市级水质达标率分析" className="hud-corners">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/15">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-400">承德/张家口领先</span>
            </div>
            <p className="text-xs text-gw-muted">山区基岩水质优良，达标率超68%，监测井覆盖稳定，年改善幅度居全省前列</p>
          </div>
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/15">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={14} className="text-amber-400" />
              <span className="text-sm font-semibold text-amber-400">开采量-水质负相关</span>
            </div>
            <p className="text-xs text-gw-muted">2020-2024年地下水供水量从108.5降至73.2亿m³，同期达标率从33.8%升至43.0%，减排压采成效显著</p>
          </div>
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/15">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={14} className="text-red-400" />
              <span className="text-sm font-semibold text-red-400">沧州/廊坊/衡水需重点治理</span>
            </div>
            <p className="text-xs text-gw-muted">达标率均低于20%，深层咸水入侵和滨海平原矿化度偏高，为全省水质治理重点区域</p>
          </div>
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/15">
            <div className="flex items-center gap-2 mb-2">
              <Droplets size={14} className="text-blue-400" />
              <span className="text-sm font-semibold text-blue-400">保定/石家庄改善明显</span>
            </div>
            <p className="text-xs text-gw-muted">白洋淀/滹沱河综合治理带动山前平原水质提升，年改善幅度分别达2.8和2.1个百分点</p>
          </div>
        </div>
      </TechCard>

      <DataSourceNote source="2024河北省水资源公报 | 各市地下水水质监测年报" version="C-1 市级达标率" />
    </div>
  );
}
