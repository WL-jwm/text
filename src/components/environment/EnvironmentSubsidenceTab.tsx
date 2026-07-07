import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, ComposedChart, Area, Line, ReferenceLine } from 'recharts';
import { MapPin, ArrowDown, Activity, AlertTriangle, TrendingDown, CheckCircle2, Droplets } from 'lucide-react';
import { landSubsidence, landSubsidence2024, subsidenceRateTrend } from '../../data/environment';
import { TechCard, StatCard, ChartTooltip } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { FilterableTechTable } from '../FilterableTechTable';
import { ChartExport } from '../ChartExport';

interface Props {
  subsidenceData: { name: string; total: number; rate: number }[];
  subsidenceGrades: { name: string; count: number; fill: string }[];
}

export function EnvironmentSubsidenceTab({ subsidenceData, subsidenceGrades }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="沉降城市" value={String(landSubsidence.length)} unit="个" icon={MapPin} accent="blue" />
        <StatCard title="最大累计" value={`${Math.max(...landSubsidence.map(s => s.totalMm)).toLocaleString()}`} unit="mm" icon={ArrowDown} accent="red" />
        <StatCard title="最大速率" value={`${Math.max(...landSubsidence.map(s => s.rateMmPerYear)).toFixed(1)}`} unit="mm/a" icon={Activity} accent="amber" />
        <StatCard title="主要区域" value="沧州/衡水" unit="" icon={AlertTriangle} accent="cyan" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="各市累计沉降量(1990s)" className="scan-line" height={280}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={subsidenceData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
              <XAxis type="number" stroke="#64748b" fontSize={10} label={{ value: 'mm', position: 'insideBottom', fontSize: 10, fill: '#64748b' }} />
              <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={10} width={55} />
              <Tooltip content={<ChartTooltip unit="mm" title="累计沉降量" />} />
              <Bar dataKey="total" name="累计沉降(mm)" fill="#ef4444" radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>
        <LazyChartCard title="沉降等级分布" height={280}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={subsidenceGrades} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}市`} fontSize={10}>
                {subsidenceGrades.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip content={<ChartTooltip unit="个城市" title="沉降等级" />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>

      <LazyChartCard title="各市沉降速率排名" className="scan-line" height={280}>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={subsidenceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={10} angle={-20} textAnchor="end" height={40} />
            <YAxis stroke="#64748b" fontSize={10} label={{ value: 'mm/a', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
            <Tooltip content={<ChartTooltip unit="mm/a" title="沉降速率" />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="rate" name="速率(mm/a)" fill="#f59e0b" radius={[2, 2, 0, 0]} />
          </ComposedChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <TechCard title="地面沉降统计详表">
        <div className="mb-3 flex justify-end">
          <ChartExport
            data={landSubsidence2024}
            filename="land-subsidence-2024"
            sheetName="地面沉降"
            formats={['xlsx', 'csv', 'json']}
            label="导出数据"
          />
        </div>
        <FilterableTechTable
          headers={['城市', '监测时段', '累计(mm)', '速率(mm/a)']}
          rows={landSubsidence.map(s => [s.city, s.period, s.totalMm.toLocaleString(), s.rateMmPerYear.toFixed(2)])}
          pageSize={10}
          filterPlaceholder="搜索..."
        />
      </TechCard>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
        <StatCard title="2024最大速率" value={`${Math.max(...landSubsidence2024.map(s => s.maxRateMmYr)).toFixed(1)}`} unit="mm/a" accent="amber" subtitle={`${landSubsidence2024.find(c => c.maxRateMmYr === Math.max(...landSubsidence2024.map(s => s.maxRateMmYr)))!.city}`} />
        <StatCard title="全省平均速率" value={`${(landSubsidence2024.reduce((s, c) => s + c.avgRateMmYr, 0) / landSubsidence2024.length).toFixed(1)}`} unit="mm/a" accent="cyan" subtitle="较2014年降幅74%" />
        <StatCard title="稳定城市" value={`${landSubsidence2024.filter(c => c.trend === '稳定').length}`} unit="/11市" accent="emerald" subtitle="承德/张家口/秦皇岛" />
        <StatCard title="显著减缓" value={`${landSubsidence2024.filter(c => c.trend.includes('显著')).length}`} unit="市" accent="blue" subtitle="沉降治理成效明显" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="2024年各市沉降速率分布(InSAR)" height={320}>
          <div className="flex items-center gap-4 text-xs text-gw-muted mb-2">
            <span className="text-red-400">红色=速率{'>'}15mm/a</span>
            <span className="text-amber-400">黄色=5-15mm/a</span>
            <span className="text-emerald-400">绿色={'<'}{'5'}mm/a</span>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={landSubsidence2024.sort((a, b) => b.maxRateMmYr - a.maxRateMmYr)} layout="vertical" margin={{ top: 10, right: 50, bottom: 10, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis type="number" tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: 'mm/a', position: 'insideBottom', offset: -5, style: { fill: '#8b9dc3', fontSize: 10 } }} />
              <YAxis dataKey="city" type="category" tick={{ fill: '#8b9dc3', fontSize: 11 }} width={55} />
              <Tooltip content={<ChartTooltip unit="mm/a" title="沉降速率" />} />
              <ReferenceLine x={15} stroke="#ef4444" strokeDasharray="6 3" label={{ value: '15mm/a预警', position: 'top', fill: '#ef4444', fontSize: 9 }} />
              <ReferenceLine x={5} stroke="#22c55e" strokeDasharray="6 3" label={{ value: '5mm/a稳定', position: 'bottom', fill: '#22c55e', fontSize: 9 }} />
              <Bar dataKey="maxRateMmYr" name="最大速率" radius={[0, 4, 4, 0]}>
                {landSubsidence2024.sort((a, b) => b.maxRateMmYr - a.maxRateMmYr).map((entry, index) => (
                  <Cell key={index} fill={entry.maxRateMmYr > 15 ? '#ef4444' : entry.maxRateMmYr > 5 ? '#f59e0b' : '#22c55e'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <LazyChartCard title="沉降速率-开采量关联演变(2014-2024)" height={320}>
          <div className="flex items-center gap-4 text-xs text-gw-muted mb-2">
            <span className="text-red-400">红色线=最大沉降速率</span>
            <span className="text-blue-400">蓝色面积=开采量</span>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={subsidenceRateTrend} margin={{ top: 10, right: 50, bottom: 30, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis dataKey="year" tick={{ fill: '#8b9dc3', fontSize: 11 }} />
              <YAxis yAxisId="rate" tick={{ fill: '#8b9dc3', fontSize: 10 }} domain={[0, 80]} label={{ value: 'mm/a', angle: -90, position: 'insideLeft', style: { fill: '#8b9dc3', fontSize: 10 } }} />
              <YAxis yAxisId="gw" orientation="right" tick={{ fill: '#8b9dc3', fontSize: 10 }} domain={[80, 160]} label={{ value: '亿m³', angle: 90, position: 'insideRight', style: { fill: '#8b9dc3', fontSize: 10 } }} />
              <Tooltip content={<ChartTooltip title="沉降-开采关联" />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Area yAxisId="gw" type="monotone" dataKey="gwExploitation" name="地下水开采(亿m³)" fill="#3b82f6" stroke="#3b82f6" fillOpacity={0.1} />
              <Line yAxisId="rate" type="monotone" dataKey="maxRate" name="最大沉降速率(mm/a)" stroke="#ef4444" strokeWidth={2} dot={{ r: 3, fill: '#ef4444' }} />
              <Line yAxisId="rate" type="monotone" dataKey="avgRate" name="平均沉降速率(mm/a)" stroke="#f59e0b" strokeWidth={1.5} dot={{ r: 3, fill: '#f59e0b' }} strokeDasharray="4 2" />
            </ComposedChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>

      <TechCard title="2024年各市沉降监测明细(InSAR)" badge="C-3">
        <div className="flex items-center gap-4 mb-3 text-[10px]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> {'>'}15mm/a(活跃)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> 5-15mm/a(减缓中)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> {'<'}5mm/a(稳定)</span>
        </div>
        <FilterableTechTable
          headers={['城市', '最大速率(mm/a)', '平均速率(mm/a)', '累计沉降(mm)', '沉降中心', '趋势', '备注']}
          rows={landSubsidence2024.sort((a, b) => b.maxRateMmYr - a.maxRateMmYr).map(c => [
            c.city, c.maxRateMmYr.toFixed(1), c.avgRateMmYr.toFixed(1),
            c.totalMm.toLocaleString(), c.center,
            c.trend, c.note,
          ])}
          pageSize={10}
          filterPlaceholder="搜索城市..."
        />
      </TechCard>

      <TechCard title="地面沉降改善分析" className="hud-corners">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/15">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-400">沉降速率大幅下降</span>
            </div>
            <p className="text-xs text-gw-muted">全省最大沉降速率从68.5mm/a(2014)降至18.5mm/a(2024)，10年降幅73%，深层漏斗消散直接驱动沉降趋缓</p>
          </div>
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/15">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown size={14} className="text-blue-400" />
              <span className="text-sm font-semibold text-blue-400">开采-沉降高度正相关</span>
            </div>
            <p className="text-xs text-gw-muted">开采量从155.3降至94.5亿m³，最大沉降速率从68.5降至18.5mm/a，开采每减10亿m³，沉降速率约降7mm/a</p>
          </div>
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/15">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={14} className="text-amber-400" />
              <span className="text-sm font-semibold text-amber-400">历史沉降不可逆</span>
            </div>
            <p className="text-xs text-gw-muted">沧州累计沉降1156mm、衡水365mm为塑性变形，即使水位完全恢复地面高程也无法复原，需持续InSAR监测预警</p>
          </div>
          <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/15">
            <div className="flex items-center gap-2 mb-2">
              <Droplets size={14} className="text-cyan-400" />
              <span className="text-sm font-semibold text-cyan-400">监测技术升级</span>
            </div>
            <p className="text-xs text-gw-muted">河北省地面沉降监测连续五年获评优秀，InSAR+分层标+GNSS三网融合，11市全覆盖实时监控</p>
          </div>
        </div>
      </TechCard>

      <TechCard title="地面沉降成因与防治" badge="沉降机制">
        <div className="space-y-2">
          <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">沉降机制：</span>深层承压水超采→含水层骨架有效应力增大→土层固结压缩→地面沉降。沧州沉降中心累计超2000mm，沉降量与深层水头降深高度相关。</p>
          <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">影响因素：</span>沉降量取决于可压缩层厚度、压缩系数和水位降幅。沧州/衡水/廊坊等滨海平原可压缩层（黏土/亚黏土）厚度大，沉降敏感性高。</p>
          <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">防治进展：</span>深层漏斗消散后，地面沉降速率已大幅减缓。但历史固结压缩为不可逆过程（塑性变形），地面高程无法完全恢复。沉降防治仍需持续监测。</p>
        </div>
      </TechCard>
    </div>
  );
}
