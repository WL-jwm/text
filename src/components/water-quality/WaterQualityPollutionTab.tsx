import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { pollutionDegree1990s } from '../../data/waterQuality';
import { TechCard, ChartTooltip, StatCard, DataSourceNote } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { ChartExport } from '../ChartExport';
import { FilterableTechTable } from '../FilterableTechTable';


interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pollutionPie: any[];
}

export function WaterQualityPollutionTab({ pollutionPie }: Props) {
  // 各市污染率排名
  const pollutionRateData = useMemo(() =>
    [...pollutionDegree1990s]
      .map(c => {
        const total = c.unpolluted + c.light + c.moderate + c.heavy + c.severe;
        const polluted = total - c.unpolluted;
        return {
          city: c.city.replace(/市$/, ''),
          '污染率(%)': total > 0 ? Math.round(polluted / total * 100) : 0,
          '未污染率(%)': total > 0 ? Math.round(c.unpolluted / total * 100) : 0,
          total: Math.round(total),
        };
      })
      .sort((a, b) => b['污染率(%)'] - a['污染率(%)']),
  []);

  // 污染构成堆叠数据
  const stackData = useMemo(() =>
    pollutionDegree1990s.map(c => ({
      city: c.city.replace(/市$/, ''),
      未污染: Math.round(c.unpolluted),
      轻度: Math.round(c.light),
      中度: Math.round(c.moderate),
      重度: Math.round(c.heavy),
      严重: Math.round(c.severe),
    })),
  []);

  // 污染因子热力雷达（Top5城市）
  const pollutionRadar = useMemo(() => {
    const top5 = [...pollutionDegree1990s].sort((a, b) => {
      const ta = a.light + a.moderate + a.heavy + a.severe;
      const tb = b.light + b.moderate + b.heavy + b.severe;
      return tb - ta;
    }).slice(0, 5);
    const maxVal = Math.max(...top5.map(c => c.light + c.moderate + c.heavy + c.severe));
    return top5.map(c => ({
      city: c.city.replace(/市$/, ''),
      轻度: Math.round(c.light / maxVal * 100),
      中度: Math.round(c.moderate / maxVal * 100),
      重度: Math.round(c.heavy / maxVal * 100),
      严重: Math.round(c.severe / maxVal * 100),
    }));
  }, []);

  // 统计
  const totalArea = pollutionDegree1990s.reduce((s, c) => s + c.unpolluted + c.light + c.moderate + c.heavy + c.severe, 0);
  const totalUnpolluted = pollutionDegree1990s.reduce((s, c) => s + c.unpolluted, 0);
  const totalPolluted = totalArea - totalUnpolluted;
  const heavyPlus = pollutionDegree1990s.reduce((s, c) => s + c.heavy + c.severe, 0);
  const maxPollutedCity = pollutionRateData[0];

  return (
    <div className="space-y-6">
      {/* 横幅 */}
      <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-red-500/10 border border-blue-500/20">
        <div className="flex items-center gap-2">
          <span className="text-sm text-blue-400 font-medium">1990年代河北平原地下水污染程度评价</span>
        </div>
        <p className="text-xs text-gw-muted mt-1">基准数据，评价{pollutionDegree1990s.length}城市，总面积{Math.round(totalArea).toLocaleString()}km²。2024年水质已显著改善。</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3">
        <StatCard title="评价城市" value={pollutionDegree1990s.length} unit="个" accent="blue" subtitle="1990年代基准" />
        <StatCard title="评价总面积" value={Math.round(totalArea).toLocaleString()} unit="km²" accent="cyan" subtitle="10城市合计" />
        <StatCard title="未污染面积" value={Math.round(totalUnpolluted).toLocaleString()} unit="km²" accent="emerald" subtitle={`${(totalUnpolluted / totalArea * 100).toFixed(1)}%`} />
        <StatCard title="已污染面积" value={Math.round(totalPolluted).toLocaleString()} unit="km²" accent="amber" subtitle={`${(totalPolluted / totalArea * 100).toFixed(1)}%`} />
        <StatCard title="重度以上" value={Math.round(heavyPlus).toLocaleString()} unit="km²" accent="red" subtitle={`${maxPollutedCity?.city || '-'}最高`} />
      </div>

      {/* 污染面积饼图 + 污染率排名 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="污染面积构成" className="scan-line" height={320}>
          <div className="mb-2 flex justify-end">
            <ChartExport data={pollutionPie} filename="污染面积构成" sheetName="污染面积构成" formats={['xlsx', 'csv', 'json']} label="导出数据" />
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pollutionPie} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={2} dataKey="value" stroke="none">
                {pollutionPie.map((entry, i: number) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip content={<ChartTooltip title="污染面积构成" />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <LazyChartCard title="各市污染率排名" badge="1990年代" className="scan-line" height={320}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={pollutionRateData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis type="number" tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: '%', position: 'insideBottom', fill: '#8b9dc3' }} />
              <YAxis type="category" dataKey="city" tick={{ fill: '#8b9dc3', fontSize: 10 }} width={50} />
              <Tooltip content={<ChartTooltip unit="%" title="污染率" />} />
              <Bar dataKey="污染率(%)" name="污染率" radius={[0, 4, 4, 0]}>
                {pollutionRateData.map((entry, i) => (
                  <Cell key={i} fill={entry['污染率(%)'] > 50 ? '#ef4444' : entry['污染率(%)'] > 30 ? '#f59e0b' : '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <DataSourceNote source="污染率=已污染面积(轻+中+重+严)/总面积。1990年代基准数据，2024年已大幅改善" />
        </LazyChartCard>
      </div>

      {/* 堆叠柱状图 + 污染等级雷达 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="各市污染程度面积构成(km²)" className="scan-line" height={320}>
          <div className="mb-2 flex justify-end">
            <ChartExport data={stackData} filename="各市污染程度" sheetName="各市污染程度" formats={['xlsx', 'csv', 'json']} label="导出数据" />
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stackData} layout="vertical">
              <CartesianGrid strokeDasharray="2 4" stroke="#1a2d4d" />
              <XAxis type="number" stroke="#64748b" fontSize={10} />
              <YAxis dataKey="city" type="category" stroke="#64748b" fontSize={10} width={50} />
              <Tooltip content={<ChartTooltip title="污染面积" />} />
              <Legend wrapperStyle={{ fontSize: 9 }} />
              <Bar dataKey="未污染" name="未污染" stackId="a" fill="#10b981" />
              <Bar dataKey="轻度" name="轻度" stackId="a" fill="#3b82f6" />
              <Bar dataKey="中度" name="中度" stackId="a" fill="#f59e0b" />
              <Bar dataKey="重度" name="重度" stackId="a" fill="#ef4444" />
              <Bar dataKey="严重" name="严重" stackId="a" fill="#7f1d1d" />
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <LazyChartCard title="TOP5污染城市等级分布雷达" badge="归一化" className="scan-line" height={320}>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={pollutionRadar} cx="50%" cy="50%" outerRadius="60%">
              <PolarGrid stroke="rgba(6,182,212,0.15)" />
              <PolarAngleAxis dataKey="city" tick={{ fill: '#8b9dc3', fontSize: 9 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 8 }} />
              <Radar name="轻度" dataKey="轻度" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
              <Radar name="中度" dataKey="中度" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
              <Radar name="重度" dataKey="重度" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} />
              <Radar name="严重" dataKey="严重" stroke="#7f1d1d" fill="#7f1d1d" fillOpacity={0.15} />
              <Legend wrapperStyle={{ fontSize: 9 }} />
            </RadarChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>

      {/* 明细表 */}
      <TechCard title="各市污染面积明细(km²)">
        <div className="mb-3 flex justify-between items-center">
          <div className="flex items-center gap-2 text-[9px] text-gw-muted">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />未污染</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />轻度</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />中度</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />重度</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-900 inline-block" />严重</span>
          </div>
          <ChartExport data={pollutionDegree1990s.map(c => ({ city: c.city, unpolluted: Math.round(c.unpolluted), light: Math.round(c.light), moderate: Math.round(c.moderate), heavy: Math.round(c.heavy), severe: Math.round(c.severe) }))} filename="污染面积明细" sheetName="污染面积明细" formats={['xlsx', 'csv', 'json']} label="导出数据" />
        </div>
        <FilterableTechTable headers={['城市', '未污染', '轻度', '中度', '重度', '严重', '合计', '污染率(%)']}
          rows={pollutionDegree1990s.map(c => {
            const total = Math.round(c.unpolluted + c.light + c.moderate + c.heavy + c.severe);
            const polluted = total - Math.round(c.unpolluted);
            return [c.city, String(Math.round(c.unpolluted)), String(Math.round(c.light)), String(Math.round(c.moderate)), String(Math.round(c.heavy)), String(Math.round(c.severe)), String(total), `${(polluted / total * 100).toFixed(1)}`];
          })}
          filterPlaceholder="搜索..."
        />
      </TechCard>

      {/* 改善说明 */}
      <TechCard title="1990年代→2024年水质改善对比" badge="历史参照">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">1990年代基准：</span>河北平原地下水污染严重，唐山、廊坊等市重度和严重污染面积超过60km²。主要污染源为工业废水、生活污水和农业面源污染。</p>
            <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">2024年现状：</span>III类及以上占比从25.8%(2015)提升至63.5%(2024)，V类从35.7%降至14.5%，10年改善37.7个百分点。</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">主要驱动力：</span>超采治理(南水北调替代)、工业点源管控(双源调查)、农业面源治理(化肥减量)、城镇污水提标改造(III类以上)。</p>
            <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">剩余挑战：</span>沧州/衡水/廊坊V类占比仍超25%，滨海平原氟化物和TDS治理需持续推进。</p>
          </div>
        </div>
      </TechCard>
    </div>
  );
}
