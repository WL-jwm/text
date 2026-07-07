import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { hydrochemistry } from '../../data/hydrochemistry';
import { TechCard, TechTable, ChartTooltip, StatCard, DataSourceNote } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { ChartExport } from '../ChartExport';

import type { ClassPieItem, RadarItem } from '../../types/county';

const COLORS_6 = ['#10b981', '#06b6d4', '#3b82f6', '#f59e0b', '#f97316', '#ef4444', '#a855f7', '#64748b'];

interface Props {
  classPie: ClassPieItem[];
  radarData: RadarItem[];
}

export function HydrochemClassificationTab({ classPie, radarData }: Props) {
  // 苏卡列夫分类TDS区间分布
  const tdsDistribution = useMemo(() => {
    const ranges = [
      { range: '<500', label: '低矿化', count: 0 },
      { range: '500-1000', label: '中矿化', count: 0 },
      { range: '1000-2000', label: '较高矿化', count: 0 },
      { range: '2000-5000', label: '高矿化', count: 0 },
      { range: '>5000', label: '极高矿化', count: 0 },
    ];
    hydrochemistry.sukaliefClassification.forEach(c => {
      const tds = c.typicalTDS.replace(/[<>~]/g, '').split('-').map(Number);
      const avg = tds.length === 2 ? (tds[0] + tds[1]) / 2 : tds[0] || 0;
      if (avg < 500) ranges[0].count++;
      else if (avg < 1000) ranges[1].count++;
      else if (avg < 2000) ranges[2].count++;
      else if (avg < 5000) ranges[3].count++;
      else ranges[4].count++;
    });
    return ranges.map(r => ({ name: `${r.label}(${r.range})`, count: r.count, range: r.range }));
  }, []);

  // 离子演化梯度数据（山前→滨海TDS递增示意）
  const _evolutionData = useMemo(() =>
    hydrochemistry.sukaliefClassification.map((c, i) => ({
      name: c.type.split('(')[0].slice(0, 8),
      TDS: c.typicalTDS.includes('~') ? c.typicalTDS : c.typicalTDS.replace(/[<>]/g, ''),
      order: i + 1,
    })),
  []);

  // 统计
  const totalTypes = hydrochemistry.sukaliefClassification.length;
  const freshWaterTypes = hydrochemistry.sukaliefClassification.filter(c => c.type.includes('HCO3')).length;

  return (
    <div className="space-y-6">
      {/* 状态横幅 */}
      <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20">
        <div className="flex items-center gap-2">
          <span className="text-sm text-emerald-400 font-medium">苏卡列夫水化学分类</span>
        </div>
        <p className="text-xs text-gw-muted mt-1">{totalTypes}种水化学类型，自山前HCO3型到滨海Cl型呈完整演化序列，反映地下水从溶滤→浓缩→海侵的地球化学过程。</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3">
        <StatCard title="水化学类型" value={totalTypes} unit="种" accent="blue" subtitle="苏卡列夫分类" />
        <StatCard title="HCO3主导型" value={freshWaterTypes} unit="种" accent="emerald" subtitle="优质淡水" />
        <StatCard title="Cl主导型" value={totalTypes - freshWaterTypes} unit="种" accent="red" subtitle="咸化趋势" />
        <StatCard title="低矿化占比" value={tdsDistribution[0].count} unit="种" accent="cyan" subtitle="TDS<500mg/L" />
        <StatCard title="演化阶段" value={totalTypes} unit="级" accent="amber" subtitle="溶滤→海侵" />
      </div>

      {/* 饼图 + 雷达图 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="苏卡列夫分类面积占比" className="scan-line" height={320}>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={classPie} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
                {classPie.map((e: ClassPieItem, i: number) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip content={<ChartTooltip unit="km²" title="面积数据" />} />
            </PieChart>
          </ResponsiveContainer>
          <DataSourceNote source="苏卡列夫分类基于主要阴离子(HCO3/SO4/Cl)和阳离子(Ca/Mg/Na)的相对含量划分" />
        </LazyChartCard>

        <LazyChartCard title="类型-占比-典型TDS雷达图" className="scan-line" height={320}>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="#1a2d4d" />
              <PolarAngleAxis dataKey="type" stroke="#64748b" fontSize={9} />
              <Radar name="占比(%)" dataKey="percentage" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
              <Radar name="典型TDS" dataKey="tds" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
              <Tooltip content={<ChartTooltip title="水化学数据" />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </RadarChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>

      {/* TDS区间分布 + 演化梯度 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="各类型TDS矿化度区间分布" badge="mg/L" className="scan-line" height={280}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={tdsDistribution} margin={{ top: 5, right: 10, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis dataKey="name" tick={{ fill: '#8b9dc3', fontSize: 8 }} angle={-15} textAnchor="end" height={40} />
              <YAxis tick={{ fill: '#8b9dc3', fontSize: 10 }} allowDecimals={false} />
              <Tooltip content={<ChartTooltip title="TDS区间" />} />
              <Bar dataKey="count" name="类型数量" radius={[4, 4, 0, 0]}>
                {tdsDistribution.map((_, i) => <Cell key={i} fill={COLORS_6[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <DataSourceNote source="各水化学类型的典型TDS分布。从低矿化到高矿化反映完整的水文地球化学演化序列" />
        </LazyChartCard>

        <LazyChartCard title="水化学类型演化序列" badge="山前→滨海" className="scan-line" height={280}>
          <div className="flex items-center gap-3 mb-2 text-[9px] text-gw-muted flex-wrap">
            {hydrochemistry.sukaliefClassification.map((c, i) => (
              <span key={i} className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                <span>{i + 1}</span>
              </span>
            ))}
            <span>→ 演化方向</span>
          </div>
          <div className="space-y-1.5 px-1">
            {hydrochemistry.sukaliefClassification.map((c, i) => (
              <div key={i} className="flex items-center gap-2 text-[10px]">
                <span className="inline-block w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: c.color }} />
                <span className="text-gw-text font-medium w-8">{c.percentage}</span>
                <span className="text-gw-text truncate flex-1">{c.type}</span>
                <span className="text-gw-muted font-mono shrink-0">TDS {c.typicalTDS}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center mt-2 gap-1 h-3">
            {hydrochemistry.sukaliefClassification.map((c, i) => (
              <div key={i} className="h-full transition-all" style={{ backgroundColor: c.color, flex: parseFloat(c.percentage) || 1 }} />
            ))}
          </div>
          <DataSourceNote source="从HCO3-Ca(溶滤)→SO4型(蒸发浓缩)→Cl-Na(海侵混合)，反映地下水径流路径上的水化学成熟度递增" />
        </LazyChartCard>
      </div>

      {/* 分类详表 */}
      <TechCard title="苏卡列夫分类特征详表">
        <div className="mb-3 flex justify-end">
          <ChartExport data={hydrochemistry.sukaliefClassification} filename="sukalief-classification" sheetName="苏卡列夫分类" formats={['xlsx', 'csv', 'json']} label="导出数据" />
        </div>
        <TechTable headers={['类型', '分布区域', '典型TDS(mg/L)', '占比', '特征']}
          rows={hydrochemistry.sukaliefClassification.map((c) => [c.type, c.zone, c.typicalTDS, c.percentage, c.note])}
        />
      </TechCard>

      {/* 形成机理增强 */}
      <TechCard title="水化学形成机理" badge="水文地球化学">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-gw-surface/50 border border-gw-border/30">
              <h4 className="text-xs text-emerald-400 font-semibold mb-1">溶滤作用</h4>
              <p className="text-xs text-gw-muted">山区碳酸盐岩溶滤形成HCO3-Ca型水，是地下水水化学演化的起始端元。方解石/白云石溶解控制Ca²⁺、Mg²⁺和HCO3⁻浓度。</p>
            </div>
            <div className="p-3 rounded-lg bg-gw-surface/50 border border-gw-border/30">
              <h4 className="text-xs text-blue-400 font-semibold mb-1">阳离子交换</h4>
              <p className="text-xs text-gw-muted">山前向平原过渡过程中，含水层介质中的Na⁺置换Ca²⁺（正常交换），使水化学类型从HCO3-Ca向HCO3-Na演变。</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-gw-surface/50 border border-gw-border/30">
              <h4 className="text-xs text-amber-400 font-semibold mb-1">蒸发浓缩</h4>
              <p className="text-xs text-gw-muted">平原中部蒸发量远超降水量，地下水TDS沿径流方向递增。SO4²⁻、Cl⁻等易溶组分逐渐富集，形成SO4·Cl-Na型水。</p>
            </div>
            <div className="p-3 rounded-lg bg-gw-surface/50 border border-gw-border/30">
              <h4 className="text-xs text-red-400 font-semibold mb-1">海侵混合</h4>
              <p className="text-xs text-gw-muted">滨海地区第四纪多次海侵残留海水与现代地下水混合，形成高矿化Cl-Na型水，TDS可达10~50g/L。</p>
            </div>
          </div>
        </div>
      </TechCard>
    </div>
  );
}
