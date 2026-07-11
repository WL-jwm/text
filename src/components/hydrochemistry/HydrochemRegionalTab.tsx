import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, PieChart, Pie, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { hydrochemicalByRegion } from '../../data/hydrochemistry';
import { TechCard, ChartTooltip, StatCard, DataSourceNote } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { FilterableTechTable } from '../FilterableTechTable';
import { ChartExport } from '../ChartExport';

import type { TdsBarItem, FluorideBarItem, PhBarItem } from '../../types/county';

// GB/T 14848-2017 TDS分级标准
const TDS_CLASSES = [
  { max: 300, label: 'I类', color: '#22c55e' },
  { max: 500, label: 'II类', color: '#06b6d4' },
  { max: 1000, label: 'III类', color: '#3b82f6' },
  { max: 2000, label: 'IV类', color: '#f59e0b' },
  { max: Infinity, label: 'V类', color: '#ef4444' },
];

function getTdsClass(tds: number) {
  return TDS_CLASSES.find(c => tds < c.max) || TDS_CLASSES[4];
}

function getFluorideClass(f: number) {
  if (f <= 0.5) return { label: '优', color: '#22c55e' };
  if (f <= 1.0) return { label: '达标', color: '#3b82f6' };
  if (f <= 1.5) return { label: '轻微超标', color: '#f59e0b' };
  return { label: '超标', color: '#ef4444' };
}

interface Props {
  tdsBarData: TdsBarItem[];
  fluorideBarData: FluorideBarItem[];
  phBarData: PhBarItem[];
}

export function HydrochemRegionalTab({ tdsBarData, fluorideBarData, phBarData }: Props) {
  // TDS水质类别分布
  const tdsPieData = useMemo(() => {
    const counts: Record<string, number> = {};
    hydrochemicalByRegion.forEach(r => {
      const cls = getTdsClass(r.tds).label;
      counts[cls] = (counts[cls] || 0) + 1;
    });
    return TDS_CLASSES.filter(c => counts[c.label]).map(c => ({
      name: c.label, value: counts[c.label], color: c.color,
    }));
  }, []);

  // 氟化物超标城市
  const fluorideAlerts = useMemo(() =>
    hydrochemicalByRegion.filter(r => r.fluoride > 1.0)
      .sort((a, b) => b.fluoride - a.fluoride),
  []);

  // 综合质量雷达（取主要6市）
  const qualityRadar = useMemo(() => {
    const cities = ['石家庄', '保定', '邯郸', '邢台', '衡水', '沧州'];
    const maxVals = { tds: 3000, hardness: 1300, sulfate: 500, chloride: 1000, fluoride: 3, ph: 8.5 };
    const minVals = { tds: 200, hardness: 140, sulfate: 30, chloride: 15, fluoride: 0.2, ph: 7.0 };
    return cities.map(city => {
      const r = hydrochemicalByRegion.find(r => r.region === city)!;
      const normalize = (key: keyof typeof maxVals, val: number) =>
        Math.round(((val - minVals[key]) / (maxVals[key] - minVals[key])) * 100);
      return {
        city,
        TDS: normalize('tds', r.tds),
        硬度: normalize('hardness', r.hardness),
        SO4: normalize('sulfate', r.sulfate),
        Cl: normalize('chloride', r.chloride),
        F: normalize('fluoride', r.fluoride),
        pH: normalize('ph', r.ph),
      };
    });
  }, []);

  // 统计
  const avgTds = Math.round(hydrochemicalByRegion.reduce((s, r) => s + r.tds, 0) / hydrochemicalByRegion.length);
  const freshCities = hydrochemicalByRegion.filter(r => r.tds <= 500).length;
  const alertCities = fluorideAlerts.length;

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3">
        <StatCard title="监测城市" value={hydrochemicalByRegion.length} unit="个" accent="blue" subtitle="全覆盖" />
        <StatCard title="平均TDS" value={avgTds} unit="mg/L" accent="cyan" subtitle="全区平均" />
        <StatCard title="I-II类水" value={freshCities} unit="城市" accent="emerald" subtitle="TDS<=500" />
        <StatCard title="氟超标城市" value={alertCities} unit="个" accent="red" subtitle={`F>1.0mg/L`} />
        <StatCard title="水质类别" value={tdsPieData.length} unit="级" accent="amber" subtitle="I~V类分布" />
      </div>

      {/* TDS/硬度/硫酸盐/氯化物 + 氟/pH */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="各市TDS/硬度/硫酸盐/氯化物" className="scan-line" height={320}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tdsBarData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} angle={-20} textAnchor="end" height={40} />
              <YAxis stroke="#64748b" fontSize={10} label={{ value: 'mg/L', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
              <Tooltip content={<ChartTooltip title="水化学指标" />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="tds" name="TDS" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="hardness" name="硬度" fill="#f59e0b" radius={[2, 2, 0, 0]} />
              <Bar dataKey="sulfate" name="SO4" fill="#06b6d4" radius={[2, 2, 0, 0]} />
              <Bar dataKey="chloride" name="Cl" fill="#ef4444" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <div className="space-y-4">
          <LazyChartCard title="氟化物分布(TDS排序)" className="scan-line" height={150}>
            <div className="flex items-center gap-2 mb-1">
              {fluorideAlerts.length > 0 && (
                <span className="text-[9px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">⚠ {fluorideAlerts.map(f => f.region).join('/')}超标</span>
              )}
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={fluorideBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={9} angle={-20} textAnchor="end" height={35} />
                <YAxis stroke="#64748b" fontSize={9} />
                <Tooltip content={<ChartTooltip title="氟化物" />} />
                <Bar dataKey="fluoride" name="F(mg/L)" radius={[2, 2, 0, 0]}>
                  {fluorideBarData.map((entry, i: number) => (
                    <Cell key={i} fill={entry.fluoride > 1.0 ? '#ef4444' : entry.fluoride > 0.8 ? '#f59e0b' : '#22c55e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </LazyChartCard>

          <LazyChartCard title="pH分布(TDS排序)" className="scan-line" height={150}>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={phBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={9} angle={-20} textAnchor="end" height={35} />
                <YAxis stroke="#64748b" fontSize={9} domain={[7, 8.5]} />
                <Tooltip content={<ChartTooltip title="pH" />} />
                <Bar dataKey="ph" name="pH" fill="#10b981" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </LazyChartCard>
        </div>
      </div>

      {/* TDS类别分布 + 综合质量雷达 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="TDS水质类别分布(GB/T 14848)" badge={`${hydrochemicalByRegion.length}城市`} height={280}>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={tdsPieData} cx="50%" cy="50%" innerRadius={35} outerRadius={65} dataKey="value" label={({ name, value }) => `${name}: ${value}市`}>
                {tdsPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip content={<ChartTooltip title="水质类别" />} />
              <Legend wrapperStyle={{ fontSize: 9 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-1">
            {TDS_CLASSES.filter(c => c.max !== Infinity).map(c => (
              <span key={c.label} className="text-[9px] text-gw-muted"><span className="inline-block w-1.5 h-1.5 rounded-full mr-1" style={{ backgroundColor: c.color }} />{c.label}: &lt;{c.max}mg/L</span>
            ))}
          </div>
          <DataSourceNote source="按GB/T 14848-2017地下水质量标准TDS限值分类。III类及以下为可用饮用水源" />
        </LazyChartCard>

        <LazyChartCard title="主要城市水质指标归一化雷达" badge="6市对比" height={280}>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={qualityRadar} cx="50%" cy="50%" outerRadius="60%">
              <PolarGrid stroke="rgba(6,182,212,0.15)" />
              <PolarAngleAxis dataKey="city" tick={{ fill: '#8b9dc3', fontSize: 9 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 8 }} />
              <Radar name="TDS" dataKey="TDS" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
              <Radar name="硬度" dataKey="硬度" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
              <Radar name="SO4" dataKey="SO4" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.1} />
              <Radar name="Cl" dataKey="Cl" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
              <Legend wrapperStyle={{ fontSize: 8 }} />
            </RadarChart>
          </ResponsiveContainer>
          <DataSourceNote source="归一化到0-100范围，数值越高表示该指标含量越高(越差)。石家庄、保定各项最低，水质最优" />
        </LazyChartCard>
      </div>

      {/* 详细数据表 */}
      <TechCard title="各市水化学指标详细数据">
        <div className="mb-3 flex justify-between items-center">
          <div className="flex items-center gap-2 text-[9px] text-gw-muted">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />TDS&lt;300(I类)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />300-500(II类)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />F&gt;1.0超标</span>
          </div>
          <ChartExport data={hydrochemicalByRegion} filename="hydrochemical-by-region" sheetName="分区水化学" formats={['xlsx', 'csv', 'json']} label="导出数据" />
        </div>
        <FilterableTechTable headers={['区域', 'TDS(mg/L)', '硬度', 'SO4', 'Cl', 'F(mg/L)', 'pH', '水化学类型']}
          rows={hydrochemicalByRegion.map((r) => [
            r.region,
            String(r.tds),
            String(r.hardness),
            String(r.sulfate),
            String(r.chloride),
            `${String(r.fluoride)}${r.fluoride > 1.0 ? ' ⚠' : ''}`,
            String(r.ph),
            r.type,
          ])}
          filterPlaceholder="搜索..."
        />
      </TechCard>

      {/* 水质评价 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TechCard title="水质评价要点" badge="GB/T 14848-2017">
          <div className="space-y-2">
            <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">TDS评价：</span>承德(220)和张家口(280)为I类水；石家庄、保定、秦皇岛为II类；邯郸、唐山、廊坊为III类；邢台、衡水为IV类；沧州(2800)为V类(不宜直接饮用)。</p>
            <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">氟化物问题：</span>沧州深层水F含量2.1mg/L，超标严重(标准1.0mg/L)。衡水(1.2)、邢台(1.0)也接近或超标。高氟是河北省地下水主要健康风险因子。</p>
            <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">硬度分布：</span>山前地区以暂时硬度为主(碳酸盐硬度)，中部和滨海永久硬度比例增高(硫酸盐+氯化物硬度)，总硬度与TDS正相关。</p>
          </div>
        </TechCard>

        {fluorideAlerts.length > 0 && (
          <TechCard title="氟化物超标城市预警" badge={`${alertCities}城市超标`}>
            <div className="space-y-2">
              {fluorideAlerts.map(r => {
                const fc = getFluorideClass(r.fluoride);
                return (
                  <div key={r.region} className="p-2 rounded-lg bg-red-500/5 border border-red-500/20">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-gw-text">{r.region}</span>
                      <span className="text-xs font-mono" style={{ color: fc.color }}>{r.fluoride} mg/L ({fc.label})</span>
                    </div>
                    <p className="text-[10px] text-gw-muted mt-0.5">超标{(r.fluoride - 1.0).toFixed(1)}mg/L，超标率{((r.fluoride - 1.0) / 1.0 * 100).toFixed(0)}%。水化学类型: {r.type}</p>
                  </div>
                );
              })}
            </div>
          </TechCard>
        )}
      </div>
    </div>
  );
}
