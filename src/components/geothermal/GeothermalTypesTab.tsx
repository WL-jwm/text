import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { Flame, Droplets, Zap, MapPin, Thermometer } from 'lucide-react';
import { geothermalTypes, geothermalZoning } from '../../data/geothermal';
import { StatCard, TechCard, ChartTooltip, DataSourceNote } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { ChartExport } from '../ChartExport';
import { FilterableTechTable } from '../FilterableTechTable';
import type { PieItem, GeothermalType } from '../../types/geothermal';

interface Props {
  typePie: PieItem[];
}

export function GeothermalTypesTab({ typePie }: Props) {
  // 分区潜力雷达数据
  const zoneRadar = useMemo(() =>
    geothermalZoning.map(z => ({
      zone: z.zone.replace('地热区', '').replace('地热带', ''),
      '面积': z.area.includes('~') ? parseInt(z.area.replace(/[^\d]/g, '')) : 200,
      '温度': z.avgTemp.includes('80') ? 80 : z.avgTemp.includes('75') ? 75 : z.avgTemp.includes('68') ? 68 : 55,
      '开发度': z.status === '成熟开发' ? 90 : z.status === '规模开发' ? 70 : z.status === '初期开发' ? 40 : 20,
    })),
  []);

  // 热储温度对比
  const tempCompare = useMemo(() =>
    geothermalTypes.map(t => ({
      name: t.type,
      '温度范围(C)': parseInt(t.reservoirTemp.match(/(\d+)/)?.[1] || '50'),
      '数量(处)': t.count,
      '占比(%)': parseInt(t.proportion),
    })),
  []);

  return (
    <div className="space-y-4">
      {/* ── 5格统计卡片 ── */}
      <div className="grid grid-cols-5 gap-3">
        <StatCard title="岩溶裂隙型" value="3" unit="处" icon={Flame} subtitle="37.5%占比" accent="red" />
        <StatCard title="沉积盆地型" value="2" unit="处" icon={Droplets} subtitle="25.0%占比" accent="blue" />
        <StatCard title="断裂构造型" value="3" unit="处" icon={Zap} subtitle="37.5%占比" accent="amber" />
        <StatCard title="地热分区" value="4" unit="个" icon={MapPin} subtitle="3区+1带" accent="emerald" />
        <StatCard title="最高温度" value="95" unit="C" icon={Thermometer} subtitle="牛驼镇凸起" accent="orange" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* ── 类型数量饼图 ── */}
        <LazyChartCard title="地热类型数量分布" className="scan-line" height={280}>
          <div className="mb-2 flex justify-end">
            <ChartExport data={typePie} filename="地热类型数量分布" sheetName="地热类型数量分布" formats={['xlsx', 'csv', 'json']} label="导出数据" />
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={typePie} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {typePie.map((e: PieItem, i: number) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip content={<ChartTooltip percentDigits={1} title="类型分布" />} />
            </PieChart>
          </ResponsiveContainer>
        </LazyChartCard>

        {/* ── 分区潜力雷达 ── */}
        <LazyChartCard title="地热分区综合潜力雷达" badge="面积/温度/开发度" height={280}>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={zoneRadar} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
              <PolarGrid stroke="rgba(6,182,212,0.15)" />
              <PolarAngleAxis dataKey="zone" tick={{ fill: '#8b9dc3', fontSize: 9 }} />
              <PolarRadiusAxis tick={{ fill: '#8b9dc3', fontSize: 8 }} />
              <Radar name="面积(km²)" dataKey="面积" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
              <Radar name="温度(C)" dataKey="温度" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} />
              <Radar name="开发度" dataKey="开发度" stroke="#22c55e" fill="#22c55e" fillOpacity={0.15} />
              <Tooltip content={<ChartTooltip title="分区雷达" />} />
              <Legend wrapperStyle={{ fontSize: 9 }} />
            </RadarChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>

      {/* ── 热储温度对比柱状图 ── */}
      <LazyChartCard title="热储温度下限对比" badge="C" height={220}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={tempCompare} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
            <XAxis dataKey="name" tick={{ fill: '#8b9dc3', fontSize: 10 }} />
            <YAxis tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: 'C', angle: -90, position: 'insideLeft', fill: '#8b9dc3' }} />
            <Tooltip content={<ChartTooltip unit="C" title="热储温度" />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="温度范围(C)" name="温度下限" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <DataSourceNote source="岩溶裂隙型温度最高(60-95C)，断裂构造型温度变化最大(45-72C)" />
      </LazyChartCard>

      {/* ── 分区详情 + 类型特征对比 ── */}
      <div className="grid grid-cols-2 gap-4">
        <TechCard title="地热资源分区">
          <div className="space-y-3">
            {geothermalZoning.map((z: { zone: string; area: string; avgTemp: string; heatSource: string; mainFields: string; potential: string; status: string }, i: number) => (
              <div key={i} className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gw-text">{z.zone}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${z.potential === '极高' ? 'bg-red-500/15 text-red-400' : z.potential === '高' ? 'bg-amber-500/15 text-amber-400' : z.potential === '中-高' ? 'bg-yellow-500/15 text-yellow-400' : 'bg-blue-500/15 text-blue-400'}`}>潜力: {z.potential}</span>
                </div>
                <p className="text-[10px] text-gw-muted mt-1">{z.area} | {z.avgTemp}</p>
                <p className="text-[10px] text-gw-muted">{z.heatSource} | {z.mainFields}</p>
                <p className="text-[10px] text-gw-highlight">{z.status}</p>
              </div>
            ))}
          </div>
        </TechCard>
        <TechCard title="地热类型特征对比" badge="热储类型">
          <div className="space-y-3">
            {geothermalTypes.map((t: GeothermalType, i: number) => (
              <div key={i} className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
                <p className="text-xs font-semibold text-gw-text">{t.type}</p>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-[10px]"><span className="text-gw-muted">数量/占比</span><span className="font-mono text-gw-cyan">{t.count}处 / {t.proportion}</span></div>
                  <div className="flex justify-between text-[10px]"><span className="text-gw-muted">热储温度</span><span className="font-mono text-gw-highlight">{t.reservoirTemp}</span></div>
                  <div className="flex justify-between text-[10px]"><span className="text-gw-muted">代表地区</span><span className="text-gw-muted">{t.representative}</span></div>
                </div>
                <p className="text-[10px] text-gw-muted mt-2 border-t border-gw-border/30 pt-2">{t.features}</p>
              </div>
            ))}
          </div>
        </TechCard>
      </div>

      {/* ── 类型特征数据表 ── */}
      <TechCard title="地热类型统计">
        <FilterableTechTable
          headers={['类型', '数量(处)', '占比(%)', '温度(C)', '特征', '代表地区']}
          rows={geothermalTypes.map(t => [t.type, t.count, t.proportion, t.reservoirTemp, t.features, t.representative])}
          filterPlaceholder="搜索类型..."
        />
      </TechCard>
    </div>
  );
}
