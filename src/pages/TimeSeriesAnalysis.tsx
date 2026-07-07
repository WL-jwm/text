// ═══════════════════════════════════════════════════════════
// 时间序列分析页面 - 河北省11市+雄安地下水多年变化趋势
// 数据来源: cityExploitationYearly / cityGroundwaterQuality2024 / resources-bulletin
// ═══════════════════════════════════════════════════════════

import React, { useState, useMemo, useCallback } from 'react';
import {
  TrendingDown,  Droplets,  FlaskConical, BarChart3,  ChevronDown, ChevronRight,  Layers, Activity, FileText,
  GitCompare, Trophy, BarChartHorizontal,
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { StatCard, TechCard, ChartTooltip, DataSourceNote } from '../components/UI';
import { CrossLinkPanel } from '../components/CrossLink';
import { ChartExport } from '../components/ChartExport';
import { FilterableTechTable } from '../components/FilterableTechTable';
import { ChartRefLines } from '../components/ChartAnnotation';
import { useReportData } from '../hooks/useReportData';
import { ExportProgressDialog } from '../components/ExportProgressDialog';
// 注册时间序列报告生成器（side-effect import）
import '../services/reportGenerators/timeSeriesReport';


import { cityExploitationYearly } from '../data/exploitation';
import { cityWaterLevelYearly, citySubsidenceYearly, waterLevelYearlySummary, subsidenceYearlySummary, cityQualityYearly, qualityYearlySummary, TS_FULL_YEARS } from '../data/historicalTimeSeries';
import { cityGroundwaterQuality2024, cityQualityTrend, qualityLevelTrend2020_2024 } from '../data/waterQuality';
import { cityGroundwaterDynamic2024 } from '../data/resources-bulletin';
import { cityWaterSupply2024 } from '../data/resources-core';

// ── 城市配色方案（14城市） ──
const CITY_COLORS: Record<string, string> = {
  '石家庄': '#3b82f6',
  '保定': '#8b5cf6',
  '邯郸': '#f97316',
  '邢台': '#ef4444',
  '沧州': '#06b6d4',
  '衡水': '#10b981',
  '唐山': '#ec4899',
  '廊坊': '#f59e0b',
  '张家口': '#14b8a6',
  '承德': '#22d3ee',
  '秦皇岛': '#a855f7',
  '辛集': '#64748b',
  '定州': '#6366f1',
  '雄安新区': '#e11d48',
};

const ALL_CITIES = Object.keys(cityExploitationYearly);
const YEARS = [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];
const BASELINE_YEARS = YEARS.slice(); // 可选基准年
const FORECAST_YEARS = [2025, 2026]; // 预测外推年

// ── 城市水文地质分组 ──
const CITY_GROUPS: Record<string, { label: string; color: string; cities: string[] }> = {
  'mountain': { label: '山区', color: '#14b8a6', cities: ['张家口', '承德', '秦皇岛'] },
  'piedmont': { label: '山前平原', color: '#3b82f6', cities: ['石家庄', '保定', '唐山'] },
  'central': { label: '中部平原', color: '#f59e0b', cities: ['邯郸', '邢台', '衡水'] },
  'coastal': { label: '滨海平原', color: '#ef4444', cities: ['沧州', '廊坊'] },
};

/** 线性回归预测(最小二乘法) */
function linearForecast(values: (number | null)[], years: number[], forecastYears: number[]): { slope: number; intercept: number; forecast: Record<number, number | null> } {
  const validPairs = values.map((v, i) => ({ x: years[i], y: v })).filter((p): p is { x: number; y: number } => p.y !== null && p.y !== undefined);
  if (validPairs.length < 2) return { slope: 0, intercept: 0, forecast: {} };
  const n = validPairs.length;
  const sumX = validPairs.reduce((s, p) => s + p.x, 0);
  const sumY = validPairs.reduce((s, p) => s + p.y, 0);
  const sumXY = validPairs.reduce((s, p) => s + p.x * p.y, 0);
  const sumX2 = validPairs.reduce((s, p) => s + p.x * p.x, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const forecast: Record<number, number | null> = {};
  forecastYears.forEach(y => { forecast[y] = Math.round((slope * y + intercept) * 100) / 100; });
  return { slope, intercept, forecast };
}

// ── Tab 定义 ──
const TABS = [
  { key: 'exploitation', label: '开采量趋势', icon: Droplets, description: '2014-2024年各市地下水开采量变化' },
  { key: 'waterLevel', label: '水位埋深', icon: TrendingDown, description: '2024年各市浅层/深层水位埋深分布' },
  { key: 'quality', label: '水质改善', icon: FlaskConical, description: '2020-2024年各市地下水质量达标率变化' },
  { key: 'structure', label: '供水结构', icon: BarChart3, description: '2024年各市供水来源构成分析' },
  { key: 'radar', label: '雷达对比', icon: Activity, description: '多维度城市综合指标雷达图对比' },
  { key: 'forecast', label: '趋势预测', icon: TrendingDown, description: '线性回归预测2025-2026年+分组对比' },
  { key: 'subsidence', label: '沉降趋势', icon: TrendingDown, description: '2014-2024年各市地面沉降速率变化' },
  { key: 'correlation', label: '综合关联', icon: GitCompare, description: '开采-水位-水质-沉降四维关联分析' },
  { key: 'governance', label: '治理成效', icon: Trophy, description: '2014→2024年超采治理综合成效评估' },
  { key: 'regional', label: '区域对比', icon: BarChartHorizontal, description: '山区/山前/中部/滨海四区多维对比' },
] as const;

type TabKey = typeof TABS[number]['key'];

// ── 城市选择器组件 ──
function CitySelector({ selected, onToggle, onAll, onClear }: {
  selected: Set<string>;
  onToggle: (city: string) => void;
  onAll: () => void;
  onClear: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const toggle = useCallback((city: string) => {
    onToggle(city);
  }, [onToggle]);

  return (
    <TechCard title="城市筛选" badge={`${selected.size}/${ALL_CITIES.length}`} className="relative">
      <div className="flex items-center gap-2 mb-2">
        <button onClick={onAll} className="text-[10px] px-2 py-0.5 rounded bg-gw-blue/20 text-gw-highlight hover:bg-gw-blue/30 transition-colors">
          全选
        </button>
        <button onClick={onClear} className="text-[10px] px-2 py-0.5 rounded bg-gw-surface/50 text-gw-muted hover:bg-gw-surface transition-colors">
          清空
        </button>
        <button onClick={() => setExpanded(!expanded)} className="text-[10px] px-2 py-0.5 rounded bg-gw-surface/50 text-gw-muted hover:bg-gw-surface transition-colors flex items-center gap-1">
          {expanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
          {expanded ? '收起' : '展开'}
        </button>
      </div>
      {/* 已选标签 */}
      <div className="flex flex-wrap gap-1 mb-2">
        {selected.size === 0 && <span className="text-[10px] text-gw-muted/50">点击城市名选择</span>}
        {ALL_CITIES.filter(c => selected.has(c)).map(city => (
          <span
            key={city}
            onClick={() => toggle(city)}
            className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded cursor-pointer transition-all"
            style={{ backgroundColor: `${CITY_COLORS[city]}20`, color: CITY_COLORS[city], border: `1px solid ${CITY_COLORS[city]}40` }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: CITY_COLORS[city] }} />
            {city}
            <span className="opacity-50">×</span>
          </span>
        ))}
      </div>
      {/* 展开列表 */}
      {expanded && (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-1 mt-1 pt-2 border-t border-gw-border/30">
          {ALL_CITIES.map(city => (
            <button
              key={city}
              onClick={() => toggle(city)}
              className={`text-[10px] px-2 py-1 rounded transition-all text-left truncate ${
                selected.has(city) ? 'ring-1 ring-gw-blue/40' : 'hover:bg-gw-surface/50'
              }`}
              style={{
                backgroundColor: selected.has(city) ? `${CITY_COLORS[city]}15` : undefined,
                color: selected.has(city) ? CITY_COLORS[city] : undefined,
              }}
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full mr-0.5" style={{ backgroundColor: CITY_COLORS[city] }} />
              {city}
            </button>
          ))}
        </div>
      )}
    </TechCard>
  );
}

// ── 城市分组选择器 ──
function GroupSelector({ onSelect }: { onSelect: (cities: string[]) => void }) {
  return (
    <TechCard title="水文地质分组" badge={Object.keys(CITY_GROUPS).length + '组'}>
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(CITY_GROUPS).map(([key, group]) => (
          <button
            key={key}
            onClick={() => onSelect(group.cities)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] transition-all border"
            style={{
              backgroundColor: `${group.color}15`,
              borderColor: `${group.color}30`,
              color: group.color,
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: group.color }} />
            {group.label}
            <span className="opacity-60">({group.cities.length}市)</span>
          </button>
        ))}
      </div>
      <div className="mt-2 text-[9px] text-gw-muted">点击分组可快速选中该区域所有城市</div>
    </TechCard>
  );
}

// ── 基准年选择器 ──
function BaselineSelector({ baseline, onChange }: { baseline: number; onChange: (y: number) => void }) {
  return (
    <TechCard title="对比基准年" badge={String(baseline)}>
      <div className="flex flex-wrap gap-1">
        {BASELINE_YEARS.map(y => (
          <button
            key={y}
            onClick={() => onChange(y)}
            className={`px-2 py-0.5 rounded text-[10px] transition-all ${baseline === y ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30' : 'bg-gw-surface/50 text-gw-muted border border-gw-border/30 hover:border-gw-blue/20'}`}
          >{y}</button>
        ))}
      </div>
    </TechCard>
  );
}

// ── 趋势预测 Tab ──
function ForecastPanel({ selected, baseline }: { selected: Set<string>; baseline: number }) {
  const cities = useMemo(() => ALL_CITIES.filter(c => selected.has(c)), [selected]);
  const baselineIdx = YEARS.indexOf(baseline);

  // 含预测的趋势数据
  const trendWithForecast = useMemo(() => {
    return [
      ...YEARS.map(year => {
        const point: Record<string, number | string> = { year };
        cities.forEach(city => {
          const data = cityExploitationYearly[city];
          point[city] = data?.[year] ?? null;
        });
        return point;
      }),
      // 预测年
      ...FORECAST_YEARS.map(year => {
        const point: Record<string, number | string> = { year, isForecast: 'true' };
        cities.forEach(city => {
          const data = cityExploitationYearly[city];
          const vals = YEARS.map(y => data?.[y] ?? null);
          const { forecast } = linearForecast(vals, YEARS, [year]);
          point[city] = forecast[year] ?? 0;
        });
        return point;
      }),
    ];
  }, [cities]);

  // 基准年对比
  const baselineCompare = useMemo(() => {
    if (baselineIdx < 0) return [];
    return cities.map(city => {
      const data = cityExploitationYearly[city];
      const baseVal = data?.[baseline] ?? 0;
      const curVal = data?.[2024] ?? 0;
      const { forecast } = linearForecast(
        YEARS.map(y => data?.[y] ?? null), YEARS, FORECAST_YEARS
      );
      return {
        city,
        [`${baseline}年`]: baseVal,
        '2024年': curVal,
        '变化量': +(curVal - baseVal).toFixed(1),
        '变化率(%)': baseVal > 0 ? +((curVal - baseVal) / baseVal * 100).toFixed(1) : 0,
        '预测2025': forecast[2025],
        '预测2026': forecast[2026],
      };
    });
  }, [cities, baselineIdx, baseline]);

  // 分组汇总
  const groupSummary = useMemo(() =>
    Object.entries(CITY_GROUPS).map(([key, group]) => {
      const gc = group.cities.filter(c => selected.has(c));
      const total2024 = gc.reduce((s, c) => s + (cityExploitationYearly[c]?.[2024] ?? 0), 0);
      const totalBase = gc.reduce((s, c) => s + (cityExploitationYearly[c]?.[baseline] ?? 0), 0);
      return { key, ...group, cityCount: gc.length, total2024, totalBase, change: +(total2024 - totalBase).toFixed(1), pct: totalBase > 0 ? +((total2024 - totalBase) / totalBase * 100).toFixed(1) : 0 };
    }),
  [selected, baseline]);

  return (
    <div className="space-y-4">
      {/* 分组汇总 */}
      <div className="grid grid-cols-4 gap-3">
        {groupSummary.map(g => (
          <StatCard key={g.key} title={g.label} value={g.total2024.toFixed(1)} unit="亿m3" icon={Droplets as any} subtitle={`${baseline}年${g.totalBase.toFixed(1)} / ${g.change > 0 ? '+' : ''}${g.change}`} accent={g.color === '#14b8a6' ? 'cyan' : g.color === '#3b82f6' ? 'blue' : g.color === '#f59e0b' ? 'amber' : 'red'} />
        ))}
      </div>

      {/* 含预测的趋势折线图 */}
      <TechCard title="开采量趋势+预测(虚线)" badge="2014-2026" className="hud-corners">
        {cities.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gw-muted text-sm">请选择城市</div>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(350, cities.length * 8 + 280)}>
            <ComposedChart data={trendWithForecast} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis dataKey="year" tick={{ fill: '#8b9dc3', fontSize: 11 }} />
              <YAxis tick={{ fill: '#8b9dc3', fontSize: 11 }} label={{ value: '亿m3', angle: -90, position: 'insideLeft', fill: '#8b9dc3', fontSize: 11 }} />
              <Tooltip content={<ChartTooltip unit="亿m3" title="开采量" />} />
              <Legend wrapperStyle={{ fontSize: 10, maxHeight: 80, overflow: 'auto' }} />
              <ChartRefLines lines={[
                { x: 2024.5, stroke: '#64748b', strokeDasharray: '4 2', label: '预测', position: 'top', fontSize: 9 },
              ]} />
              {cities.map(city => (
                <Line key={city} type="monotone" dataKey={city} stroke={CITY_COLORS[city]} strokeWidth={2} dot={{ r: 2 }} connectNulls strokeDasharray="solid" />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </TechCard>

      {/* 基准年对比排名 */}
      {baselineCompare.length > 0 && (
        <TechCard title={`较${baseline}年开采变化排名`} badge="%">
          <ResponsiveContainer width="100%" height={Math.max(200, baselineCompare.length * 25 + 40)}>
            <BarChart data={[...baselineCompare].sort((a, b) => b['变化率(%)'] - a['变化率(%)'])} layout="vertical" margin={{ top: 10, right: 20, bottom: 5, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis type="number" tick={{ fill: '#8b9dc3', fontSize: 10 }} />
              <YAxis dataKey="city" type="category" tick={{ fill: '#8b9dc3', fontSize: 10 }} width={55} />
              <Tooltip content={<ChartTooltip unit="%" title="变化率" />} />
              <Bar dataKey="变化率(%)" name="变化率(%)">
                {baselineCompare.map((entry: any, i: number) => (
                  <Cell key={i} fill={(entry as any)['变化率(%)'] < 0 ? '#22c55e' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </TechCard>
      )}

      {/* 预测明细表 */}
      {baselineCompare.length > 0 && (
        <TechCard title={`基准年对比+预测明细`} badge={`${baseline}-2026`}>
          <FilterableTechTable
            headers={['城市', `${baseline}年`, '2024年', '变化量', '变化率(%)', '预测2025', '预测2026']}
            rows={baselineCompare.map(c => [c.city, c[`${baseline}年`], c['2024年'], c['变化量'], c['变化率(%)'] + '%', c['预测2025'], c['预测2026']])}
            pageSize={10}
          />
        </TechCard>
      )}

      {/* ══ 水位埋深预测 ══ */}
      <WaterLevelForecastSection cities={cities} />

      {/* ══ 沉降速率预测 ══ */}
      <SubsidenceForecastSection cities={cities} />
    </div>
  );
}

// ── 水位埋深预测区块 ──
function WaterLevelForecastSection({ cities }: { cities: string[] }) {
  const forecastData = useMemo(() => {
    return [
      ...YEARS.map(year => {
        const point: Record<string, number | string> = { year };
        cities.forEach(city => {
          point[city] = cityWaterLevelYearly[city]?.[year] ?? null;
        });
        return point;
      }),
      ...FORECAST_YEARS.map(year => {
        const point: Record<string, number | string> = { year, isForecast: 'true' };
        cities.forEach(city => {
          const data = cityWaterLevelYearly[city];
          const vals = YEARS.map(y => data?.[y] ?? null);
          const { forecast } = linearForecast(vals, YEARS, [year]);
          point[city] = forecast[year] ?? 0;
        });
        return point;
      }),
    ];
  }, [cities]);

  if (cities.length === 0) return null;
  return (
    <TechCard title="水位埋深趋势+预测(虚线)" badge="2014-2026" className="hud-corners">
      <ChartExport data={forecastData} filename="水位埋深预测2014-2026" sheetName="水位预测" formats={['xlsx', 'csv', 'json']} label="导出数据" />
      <ResponsiveContainer width="100%" height={Math.max(300, cities.length * 8 + 260)}>
        <ComposedChart data={forecastData} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
          <XAxis dataKey="year" tick={{ fill: '#8b9dc3', fontSize: 11 }} />
          <YAxis tick={{ fill: '#8b9dc3', fontSize: 11 }} label={{ value: 'm', angle: -90, position: 'insideLeft', fill: '#8b9dc3' }} />
          <Tooltip content={<ChartTooltip unit="m" title="水位埋深" />} />
          <Legend wrapperStyle={{ fontSize: 10, maxHeight: 60, overflow: 'auto' }} />
          <ChartRefLines lines={[{ x: 2024.5, stroke: '#64748b', strokeDasharray: '4 2', label: '预测', position: 'top', fontSize: 9 }]} />
          {cities.map(city => (
            <Line key={city} type="monotone" dataKey={city} stroke={CITY_COLORS[city] || '#64748b'} strokeWidth={2} dot={{ r: 2 }} connectNulls />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
      <DataSourceNote source="基于2014-2024年线性回归外推，实际受降水、开采政策等影响" />
    </TechCard>
  );
}

// ── 沉降速率预测区块 ──
function SubsidenceForecastSection({ cities }: { cities: string[] }) {
  const forecastData = useMemo(() => {
    return [
      ...YEARS.map(year => {
        const point: Record<string, number | string> = { year };
        cities.forEach(city => {
          point[city] = citySubsidenceYearly[city]?.[year] ?? null;
        });
        return point;
      }),
      ...FORECAST_YEARS.map(year => {
        const point: Record<string, number | string> = { year, isForecast: 'true' };
        cities.forEach(city => {
          const data = citySubsidenceYearly[city];
          const vals = YEARS.map(y => data?.[y] ?? null);
          const { forecast } = linearForecast(vals, YEARS, [year]);
          point[city] = Math.max(0, forecast[year] ?? 0);
        });
        return point;
      }),
    ];
  }, [cities]);

  const predTable = useMemo(() =>
    cities.map(city => {
      const data = citySubsidenceYearly[city];
      const vals = YEARS.map(y => data?.[y] ?? null);
      const { forecast } = linearForecast(vals, YEARS, FORECAST_YEARS);
      return {
        city,
        '2024年': data?.[2024] ?? 0,
        '预测2025': Math.max(0, forecast[2025] ?? 0),
        '预测2026': Math.max(0, forecast[2026] ?? 0),
      };
    }), [cities]);

  if (cities.length === 0) return null;
  return (
    <div className="space-y-4">
      <TechCard title="沉降速率趋势+预测(虚线)" badge="2014-2026" className="hud-corners">
        <ChartExport data={forecastData} filename="沉降速率预测2014-2026" sheetName="沉降预测" formats={['xlsx', 'csv', 'json']} label="导出数据" />
        <ResponsiveContainer width="100%" height={Math.max(300, cities.length * 8 + 260)}>
          <ComposedChart data={forecastData} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
            <XAxis dataKey="year" tick={{ fill: '#8b9dc3', fontSize: 11 }} />
            <YAxis tick={{ fill: '#8b9dc3', fontSize: 11 }} label={{ value: 'mm/a', angle: -90, position: 'insideLeft', fill: '#8b9dc3' }} />
            <Tooltip content={<ChartTooltip unit="mm/a" title="沉降速率" />} />
            <Legend wrapperStyle={{ fontSize: 10, maxHeight: 60, overflow: 'auto' }} />
            <ChartRefLines lines={[{ x: 2024.5, stroke: '#64748b', strokeDasharray: '4 2', label: '预测', position: 'top', fontSize: 9 }]} />
            {cities.map(city => (
              <Line key={city} type="monotone" dataKey={city} stroke={CITY_COLORS[city] || '#64748b'} strokeWidth={2} dot={{ r: 2 }} connectNulls />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
        <DataSourceNote source="基于2014-2024年线性回归外推，沉降受地下水位回升滞后效应影响" />
      </TechCard>

      <TechCard title="沉降速率预测明细" badge="mm/a">
        <FilterableTechTable
          headers={['城市', '2024年(mm/a)', '预测2025(mm/a)', '预测2026(mm/a)', '2024→2026变化']}
          rows={predTable.map(r => [r.city, r['2024年'].toFixed(1), r['预测2025'].toFixed(1), r['预测2026'].toFixed(1), (r['预测2026'] - r['2024年']).toFixed(1)])}
          pageSize={10}
        />
      </TechCard>
    </div>
  );
}

// ── 任务11: 区域对比Tab ──
function RegionalComparePanel({ selected }: { selected: Set<string> }) {
  // 区域汇总数据
  const regionData = useMemo(() =>
    Object.entries(CITY_GROUPS).map(([key, group]) => {
      const gc = group.cities.filter(c => selected.has(c));
      if (gc.length === 0) return { key, label: group.label, color: group.color, cityCount: 0, exp2024: 0, exp2014: 0, wl2024: 0, wl2014: 0, q2024: 0, q2014: 0, sub2024: 0, sub2014: 0 };
      const exp2024 = gc.reduce((s, c) => s + (cityExploitationYearly[c]?.[2024] ?? 0), 0);
      const exp2014 = gc.reduce((s, c) => s + (cityExploitationYearly[c]?.[2014] ?? 0), 0);
      const wl2024 = gc.reduce((s, c) => s + (cityWaterLevelYearly[c]?.[2024] ?? 0), 0) / gc.length;
      const wl2014 = gc.reduce((s, c) => s + (cityWaterLevelYearly[c]?.[2014] ?? 0), 0) / gc.length;
      const q2024 = gc.reduce((s, c) => s + (cityQualityYearly[c]?.[2024] ?? 0), 0) / gc.length;
      const q2014 = gc.reduce((s, c) => s + (cityQualityYearly[c]?.[2014] ?? 0), 0) / gc.length;
      const sub2024 = gc.reduce((s, c) => s + (citySubsidenceYearly[c]?.[2024] ?? 0), 0) / gc.length;
      const sub2014 = gc.reduce((s, c) => s + (citySubsidenceYearly[c]?.[2014] ?? 0), 0) / gc.length;
      return { key, label: group.label, color: group.color, cityCount: gc.length, exp2024: +exp2024.toFixed(1), exp2014: +exp2014.toFixed(1), wl2024: +wl2024.toFixed(1), wl2014: +wl2014.toFixed(1), q2024: +q2024.toFixed(1), q2014: +q2014.toFixed(1), sub2024: +sub2024.toFixed(1), sub2014: +sub2014.toFixed(1) };
    }),
  [selected]);

  // 区域年度趋势(开采量)
  const regionTrend = useMemo(() =>
    TS_FULL_YEARS.map(year => {
      const point: Record<string, number | string> = { year };
      Object.entries(CITY_GROUPS).forEach(([_key, group]) => {
        const gc = group.cities.filter(c => selected.has(c));
        point[group.label] = +(gc.reduce((s, c) => s + (cityExploitationYearly[c]?.[year] ?? 0), 0)).toFixed(1);
      });
      return point;
    }),
  [selected]);

  // 区域雷达图数据(2024年归一化)
  const radarData = useMemo(() => {
    const dims = ['开采规模', '水位健康', '水质达标', '沉降控制', '治理成效'];
    return dims.map(dim => {
      const entry: Record<string, number | string> = { dimension: dim };
      regionData.forEach(r => {
        if (r.cityCount === 0) { entry[r.label] = 0; return; }
        let val = 0;
        if (dim === '开采规模') val = Math.min(100, r.exp2024 / 80 * 100); // 80亿m3=100%
        else if (dim === '水位健康') val = Math.min(100, 100 - r.wl2024 / 50 * 100); // 埋深越浅越好
        else if (dim === '水质达标') val = r.q2024;
        else if (dim === '沉降控制') val = Math.min(100, 100 - r.sub2024 / 65 * 100);
        else if (dim === '治理成效') {
          const expChg = r.exp2014 > 0 ? (r.exp2014 - r.exp2024) / r.exp2014 * 100 : 0;
          const wlChg = r.wl2014 > 0 ? (r.wl2014 - r.wl2024) / r.wl2014 * 100 : 0;
          const qChg = r.q2014 > 0 ? (r.q2024 - r.q2014) / r.q2014 * 100 : 0;
          const subChg = r.sub2014 > 0 ? (r.sub2014 - r.sub2024) / r.sub2014 * 100 : 0;
          val = Math.min(100, expChg * 0.25 + wlChg * 0.30 + qChg * 0.25 + subChg * 0.20);
        }
        entry[r.label] = +val.toFixed(0);
      });
      return entry;
    });
  }, [regionData]);

  const activeRegions = regionData.filter(r => r.cityCount > 0);
  if (activeRegions.length === 0) return <div className="text-center text-gw-muted py-12">请选择城市查看区域对比</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        {activeRegions.map(r => (
          <StatCard key={r.key} title={r.label} value={`${r.cityCount}`} unit="市" accent={r.color === '#14b8a6' ? 'cyan' : r.color === '#3b82f6' ? 'blue' : r.color === '#f59e0b' ? 'amber' : 'red'} subtitle={`开采${r.exp2024}亿m3`} />
        ))}
      </div>

      {/* 区域开采量趋势 */}
      <TechCard title="四大水文地质区开采量变化趋势" badge="2014-2024" className="hud-corners">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={regionTrend} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
            <XAxis dataKey="year" tick={{ fill: '#8b9dc3', fontSize: 11 }} />
            <YAxis tick={{ fill: '#8b9dc3', fontSize: 11 }} label={{ value: '亿m3', angle: -90, position: 'insideLeft', fill: '#8b9dc3' }} />
            <Tooltip content={<ChartTooltip unit="亿m3" title="区域开采" />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            {activeRegions.map(r => (
              <Line key={r.key} type="monotone" dataKey={r.label} stroke={r.color} strokeWidth={2} dot={{ r: 2 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </TechCard>

      {/* 区域多维雷达图 */}
      <TechCard title="四大区域2024年综合指标雷达图" badge="五维对比">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="80%">
              <PolarGrid stroke="rgba(6,182,212,0.15)" />
              <PolarAngleAxis dataKey="dimension" tick={{ fill: '#8b9dc3', fontSize: 11 }} />
              <PolarRadiusAxis tick={{ fill: '#8b9dc3', fontSize: 9 }} domain={[0, 100]} />
              {activeRegions.map(r => (
                <Radar key={r.key} name={r.label} dataKey={r.label} stroke={r.color} fill={r.color} fillOpacity={0.15} strokeWidth={2} />
              ))}
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
          <div className="text-[10px] text-gw-muted space-y-1.5">
            <h4 className="text-xs font-bold text-gw-text mb-2">区域特征解读</h4>
            {activeRegions.map(r => (
              <div key={r.key} className="border-l-2 pl-2 mb-2" style={{ borderColor: r.color }}>
                <p className="font-bold" style={{ color: r.color }}>{r.label}({r.cityCount}市)</p>
                <p>开采: {r.exp2014}→{r.exp2024}亿m3 (-{((r.exp2014 - r.exp2024) / r.exp2014 * 100).toFixed(0)}%)</p>
                <p>水位: {r.wl2014}→{r.wl2024}m ({(r.wl2014 - r.wl2024).toFixed(1)}m回升)</p>
                <p>水质: {r.q2014}→{r.q2024}% (+{(r.q2024 - r.q2014).toFixed(0)}pp)</p>
                <p>沉降: {r.sub2014}→{r.sub2024}mm/a (-{((r.sub2014 - r.sub2024) / r.sub2014 * 100).toFixed(0)}%)</p>
              </div>
            ))}
          </div>
        </div>
      </TechCard>

      {/* 区域对比表 */}
      <TechCard title="四大区域核心指标对比" badge="2014 vs 2024">
        <FilterableTechTable
          headers={['区域', '城市数', '开采2014', '开采2024', '水位2014(m)', '水位2024(m)', '水质2014(%)', '水质2024(%)', '沉降2014(mm/a)', '沉降2024(mm/a)']}
          rows={activeRegions.map(r => [r.label, r.cityCount, r.exp2014, r.exp2024, r.wl2014, r.wl2024, r.q2014, r.q2024, r.sub2014, r.sub2024])}
          pageSize={10}
        />
      </TechCard>
    </div>
  );
}

// ── 开采量趋势 Tab ──
function ExploitationTrendPanel({ selected }: { selected: Set<string> }) {
  const cities = useMemo(() => ALL_CITIES.filter(c => selected.has(c)), [selected]);
  const chartData = useMemo(() => {
    return YEARS.map(year => {
      const point: Record<string, number | string> = { year };
      cities.forEach(city => {
        const data = cityExploitationYearly[city];
        point[city] = data?.[year] ?? null;
      });
      return point;
    });
  }, [cities]);

  // 统计数据
  const stats = useMemo(() => {
    if (cities.length === 0) return null;
    const total2024 = cities.reduce((s, c) => s + (cityExploitationYearly[c]?.[2024] ?? 0), 0);
    const total2014 = cities.reduce((s, c) => s + (cityExploitationYearly[c]?.[2014] ?? 0), 0);
    const reduction = total2014 - total2024;
    const maxReduction = cities.reduce((a, c) => {
      const r = (cityExploitationYearly[c]?.[2014] ?? 0) - (cityExploitationYearly[c]?.[2024] ?? 0);
      return r > a.val ? { city: c, val: r } : a;
    }, { city: '', val: 0 });
    const avgPct = cities.length > 0 ? cities.reduce((s, c) => {
      const d14 = cityExploitationYearly[c]?.[2014] ?? 0;
      const d24 = cityExploitationYearly[c]?.[2024] ?? 0;
      return s + (d14 > 0 ? (d14 - d24) / d14 * 100 : 0);
    }, 0) / cities.length : 0;
    return { total2024, total2014, reduction, maxReduction, avgPct };
  }, [cities]);

  return (
    <div className="space-y-4">
      {/* 统计卡片 */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="2024年总开采量" value={`${stats.total2024.toFixed(1)}`} unit="亿m³" accent="blue" subtitle={`${cities.length}市合计`} />
          <StatCard title="较2014年减采" value={`${stats.reduction.toFixed(1)}`} unit="亿m³" accent="emerald" subtitle={`降幅${(stats.reduction / stats.total2014 * 100).toFixed(1)}%`} />
          <StatCard title="最大减采城市" value={stats.maxReduction.city} unit={`${stats.maxReduction.val.toFixed(1)}亿m³`} accent="cyan" subtitle="2014-2024减量" />
          <StatCard title="平均降幅" value={`${stats.avgPct.toFixed(1)}`} unit="%" accent="green" subtitle={`${cities.length}市平均`} />
        </div>
      )}

      {/* 开采量趋势折线图 */}
      <TechCard title="各市地下水开采量趋势(2014-2024)" badge="亿m³" className="hud-corners">
        {cities.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gw-muted text-sm">请选择城市查看趋势</div>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(350, cities.length * 8 + 280)}>
            <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis dataKey="year" tick={{ fill: '#8b9dc3', fontSize: 11 }} />
              <YAxis tick={{ fill: '#8b9dc3', fontSize: 11 }} label={{ value: '亿m³', angle: -90, position: 'insideLeft', fill: '#8b9dc3', fontSize: 11 }} />
              <Tooltip content={<ChartTooltip unit="亿m³" title="地下水开采量" />} />
              <Legend wrapperStyle={{ fontSize: 10, maxHeight: 80, overflow: 'auto' }} />
              {cities.map(city => (
                <Line
                  key={city}
                  type="monotone"
                  dataKey={city}
                  stroke={CITY_COLORS[city]}
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  activeDot={{ r: 4 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </TechCard>

      {/* 减采率排名柱状图 */}
      {cities.length > 0 && (
        <TechCard title="各市开采减采率排名(2014→2024)" badge="%">
          <ResponsiveContainer width="100%" height={Math.max(250, cities.length * 30 + 40)}>
            <BarChart
              data={cities.map(city => {
                const d14 = cityExploitationYearly[city]?.[2014] ?? 0;
                const d24 = cityExploitationYearly[city]?.[2024] ?? 0;
                return {
                  city,
                  '减采率(%)': d14 > 0 ? parseFloat(((d14 - d24) / d14 * 100).toFixed(1)) : 0,
                  '2014年': d14,
                  '2024年': d24,
                };
              }).sort((a, b) => b['减采率(%)'] - a['减采率(%)'])}
              layout="vertical"
              margin={{ top: 10, right: 20, bottom: 5, left: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis type="number" tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: '%', position: 'insideBottom', fill: '#8b9dc3' }} />
              <YAxis dataKey="city" type="category" tick={{ fill: '#8b9dc3', fontSize: 10 }} width={55} />
              <Tooltip content={<ChartTooltip unit="%" title="减采率" />} />
              <Bar dataKey="减采率(%)" radius={[0, 4, 4, 0]}>
                {cities.map(city => (
                  <React.Fragment key={city}>
                    {/* Note: Cell in Bar doesn't work well with sort, use static fill approach */}
                  </React.Fragment>
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </TechCard>
      )}

      {/* 年度开采量明细表 */}
      {cities.length > 0 && (
        <TechCard title="各市年度开采量数据明细" badge="亿m³">
          <FilterableTechTable
            headers={['城市', ...YEARS.map(String), '减量(亿m³)', '减幅(%)']}
            rows={cities.map(city => {
              const data = cityExploitationYearly[city] ?? {};
              const d14 = data[2014] ?? 0;
              const d24 = data[2024] ?? 0;
              return [
                city,
                ...YEARS.map(y => data[y]?.toFixed(1) ?? '—'),
                (d14 - d24).toFixed(1),
                d14 > 0 ? `${((d14 - d24) / d14 * 100).toFixed(1)}%` : '—',
              ];
            })}
            pageSize={10}
          />
        </TechCard>
      )}
    </div>
  );
}

// ── 水位埋深 Tab ──
function WaterLevelPanel({ selected }: { selected: Set<string> }) {
  const cities = useMemo(() => ALL_CITIES.filter(c => selected.has(c)), [selected]);

  const chartData = useMemo(() => {
    const shallowCities = cityGroundwaterDynamic2024.filter(c => c.shallowDepth !== null);
    const deepCities = cityGroundwaterDynamic2024.filter(c => c.deepDepth !== null);
    return { shallowCities, deepCities };
  }, []);

  const displayData = useMemo(() => {
    return chartData.shallowCities.filter(c => cities.includes(c.city));
  }, [cities, chartData]);

  const deepData = useMemo(() => {
    return chartData.deepCities.filter(c => cities.includes(c.city));
  }, [cities, chartData]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="浅层平均埋深" value={`${(displayData.reduce((s, c) => s + (c.shallowDepth ?? 0), 0) / (displayData.length || 1)).toFixed(1)}`} unit="m" accent="blue" subtitle={`${displayData.length}市平均`} />
        <StatCard title="深层平均埋深" value={`${(deepData.reduce((s, c) => s + (c.deepDepth ?? 0), 0) / (deepData.length || 1)).toFixed(1)}`} unit="m" accent="cyan" subtitle={`${deepData.length}市有数据`} />
        <StatCard title="最浅(浅层)" value={displayData.length > 0 ? `${Math.min(...displayData.map(c => c.shallowDepth ?? 999)).toFixed(1)}` : '—'} unit="m" accent="emerald" subtitle="最小值" />
        <StatCard title="最深(浅层)" value={displayData.length > 0 ? `${Math.max(...displayData.map(c => c.shallowDepth ?? 0)).toFixed(1)}` : '—'} unit="m" accent="amber" subtitle="最大值" />
      </div>

      {/* 浅层埋深柱状图 */}
      <TechCard title="各市浅层地下水埋深(2024)" badge="m" className="hud-corners">
        {displayData.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gw-muted text-sm">请选择城市</div>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(250, displayData.length * 30 + 40)}>
            <BarChart
              data={[...displayData].sort((a, b) => (b.shallowDepth ?? 0) - (a.shallowDepth ?? 0))}
              layout="vertical"
              margin={{ top: 10, right: 20, bottom: 5, left: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis type="number" tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: 'm', position: 'insideBottom', fill: '#8b9dc3' }} />
              <YAxis dataKey="city" type="category" tick={{ fill: '#8b9dc3', fontSize: 10 }} width={55} />
              <Tooltip content={<ChartTooltip unit="m" title="水位埋深" />} />
              <Bar dataKey="shallowDepth" name="浅层埋深(m)" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              {deepData.length > 0 && (
                <Bar dataKey="deepDepth" name="深层埋深(m)" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              )}
            </BarChart>
          </ResponsiveContainer>
        )}
      </TechCard>

      {/* 年变化量图 */}
      <TechCard title="各市水位年回升量(2024)" badge="m/a">
        {displayData.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-gw-muted text-sm">请选择城市</div>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(200, displayData.length * 25 + 40)}>
            <BarChart
              data={[...displayData].sort((a, b) => (b.shallowChange ?? 0) - (a.shallowChange ?? 0))}
              layout="vertical"
              margin={{ top: 10, right: 20, bottom: 5, left: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis type="number" tick={{ fill: '#8b9dc3', fontSize: 10 }} />
              <YAxis dataKey="city" type="category" tick={{ fill: '#8b9dc3', fontSize: 10 }} width={55} />
              <Tooltip content={<ChartTooltip unit="m" title="年回升量" />} />
              <Bar dataKey="shallowChange" name="浅层回升(m)" fill="#10b981" radius={[0, 4, 4, 0]} />
              <Bar dataKey="deepChange" name="深层回升(m)" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </TechCard>

      {/* 明细表 */}
      {displayData.length > 0 && (
        <TechCard title="各市水位埋深数据明细(2024)" badge="m">
          <FilterableTechTable
            headers={['城市', '浅层埋深(m)', '浅层年变化(m)', '深层埋深(m)', '深层年变化(m)', '超采状况说明']}
            rows={displayData.map(c => [
              c.city,
              c.shallowDepth?.toFixed(2) ?? '—',
              c.shallowChange?.toFixed(2) ?? '—',
              c.deepDepth?.toFixed(2) ?? '—',
              c.deepChange?.toFixed(2) ?? '—',
              c.overExploit ?? '—',
            ])}
            pageSize={10}
          />
        </TechCard>
      )}
      {/* 年度趋势折线图(2014-2024) */}
      <TechCard title="各市水位埋深年度变化趋势(2014-2024)" badge="m" className="hud-corners">
        <ChartExport data={TS_FULL_YEARS.map(y => ({ year: y, ...Object.fromEntries(cities.map(c => [c, cityWaterLevelYearly[c]?.[y] ?? null])) }))} filename="水位埋深趋势2014-2024" sheetName="水位趋势" formats={['xlsx', 'csv', 'json']} label="导出数据" />
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={TS_FULL_YEARS.map(y => ({ year: y, ...Object.fromEntries(cities.map(c => [c, cityWaterLevelYearly[c]?.[y] ?? null])) }))} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
            <XAxis dataKey="year" tick={{ fill: '#8b9dc3', fontSize: 10 }} />
            <YAxis tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: 'm', angle: -90, position: 'insideLeft', fill: '#8b9dc3' }} />
            <Tooltip content={<ChartTooltip unit="m" title="水位埋深" />} />
            <Legend wrapperStyle={{ fontSize: 9 }} />
            <ChartRefLines lines={[{ y: 2018, stroke: '#22c55e', strokeDasharray: '6 3', label: '2018 回升拐点', position: 'top', fontSize: 9 }]} />
            {cities.map(c => (
              <Line key={c} type="monotone" dataKey={c} name={c} stroke={CITY_COLORS[c] || '#64748b'} strokeWidth={2} dot={{ r: 2 }} connectNulls />
            ))}
          </LineChart>
        </ResponsiveContainer>
        <DataSourceNote source="2018年起全省水位普遍止跌回升，山前平原回升幅度最大" />
      </TechCard>

      {/* 全省均值趋势 */}
      <TechCard title="全省水位埋深均值变化" badge="11市平均">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={waterLevelYearlySummary} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
            <XAxis dataKey="year" tick={{ fill: '#8b9dc3', fontSize: 10 }} />
            <YAxis tick={{ fill: '#8b9dc3', fontSize: 10 }} domain={[15, 30]} label={{ value: 'm', angle: -90, position: 'insideLeft', fill: '#8b9dc3' }} />
            <Tooltip content={<ChartTooltip unit="m" title="全省均值" />} />
            <Area type="monotone" dataKey="avgDepth" name="平均埋深" fill="#3b82f6" stroke="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </TechCard>
    </div>
  );
}

// ── 沉降趋势 Tab ──
function SubsidenceTrendPanel({ selected }: { selected: Set<string> }) {
  const cities = useMemo(() => ALL_CITIES.filter(c => selected.has(c)), [selected]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="全省均值(2024)" value={subsidenceYearlySummary[subsidenceYearlySummary.length - 1].avgRate.toFixed(1)} unit="mm/a" icon={TrendingDown as any} subtitle="较2014年降74%" accent="emerald" />
        <StatCard title="最大沉降城市" value={subsidenceYearlySummary[subsidenceYearlySummary.length - 1].maxCity} unit="" icon={Layers as any} subtitle={`${subsidenceYearlySummary[subsidenceYearlySummary.length - 1].maxRate}mm/a`} accent="red" />
        <StatCard title="10年降幅" value={((1 - subsidenceYearlySummary[subsidenceYearlySummary.length - 1].avgRate / subsidenceYearlySummary[0].avgRate) * 100).toFixed(0)} unit="%" icon={Activity as any} subtitle="沉降减缓显著" accent="cyan" />
        <StatCard title="全部改善" value={subsidenceYearlySummary[subsidenceYearlySummary.length - 1].improvingCities} unit="市" icon={Droplets as any} subtitle="11市全部改善" accent="blue" />
      </div>

      {/* 各市沉降速率折线 */}
      <TechCard title="各市沉降速率年度变化(2014-2024)" badge="mm/a" className="hud-corners">
        <ChartExport data={TS_FULL_YEARS.map(y => ({ year: y, ...Object.fromEntries(cities.map(c => [c, citySubsidenceYearly[c]?.[y] ?? null])) }))} filename="沉降速率趋势2014-2024" sheetName="沉降趋势" formats={['xlsx', 'csv', 'json']} label="导出数据" />
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={TS_FULL_YEARS.map(y => ({ year: y, ...Object.fromEntries(cities.map(c => [c, citySubsidenceYearly[c]?.[y] ?? null])) }))} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
            <XAxis dataKey="year" tick={{ fill: '#8b9dc3', fontSize: 10 }} />
            <YAxis tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: 'mm/a', angle: -90, position: 'insideLeft', fill: '#8b9dc3' }} />
            <Tooltip content={<ChartTooltip unit="mm/a" title="沉降速率" />} />
            <Legend wrapperStyle={{ fontSize: 9 }} />
            <ChartRefLines lines={[{ y: 30, stroke: '#ef4444', strokeDasharray: '6 3', label: '30mm/a 治理目标', position: 'top', fontSize: 9 }]} />
            {cities.map(c => (
              <Line key={c} type="monotone" dataKey={c} name={c} stroke={CITY_COLORS[c] || '#64748b'} strokeWidth={2} dot={{ r: 2 }} connectNulls />
            ))}
          </LineChart>
        </ResponsiveContainer>
        <DataSourceNote source="沧州沉降速率从65mm/a降至14.5mm/a，降幅77.7%，治理成效最为显著" />
      </TechCard>

      {/* 全省均值面积图 */}
      <TechCard title="全省沉降速率均值变化" badge="11市平均">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={subsidenceYearlySummary} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
            <XAxis dataKey="year" tick={{ fill: '#8b9dc3', fontSize: 10 }} />
            <YAxis tick={{ fill: '#8b9dc3', fontSize: 10 }} domain={[0, 35]} label={{ value: 'mm/a', angle: -90, position: 'insideLeft', fill: '#8b9dc3' }} />
            <Tooltip content={<ChartTooltip unit="mm/a" title="全省均值" />} />
            <ChartRefLines lines={[{ y: 30, stroke: '#ef4444', strokeDasharray: '6 3', label: '30mm/a', position: 'top', fontSize: 9 }]} />
            <Area type="monotone" dataKey="avgRate" name="平均沉降速率" fill="#ef4444" stroke="#ef4444" fillOpacity={0.15} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </TechCard>

      {/* 沉降-开采关联 */}
      <TechCard title="沉降速率 vs 开采量关联(2024)" badge="双轴">
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={subsidenceYearlySummary} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
            <XAxis dataKey="year" tick={{ fill: '#8b9dc3', fontSize: 10 }} />
            <YAxis yAxisId="sub" tick={{ fill: '#8b9dc3', fontSize: 10 }} domain={[0, 35]} label={{ value: 'mm/a', angle: -90, position: 'insideLeft', fill: '#8b9dc3' }} />
            <YAxis yAxisId="gw" orientation="right" tick={{ fill: '#8b9dc3', fontSize: 10 }} domain={[80, 160]} label={{ value: '亿m³', angle: 90, position: 'insideRight', fill: '#8b9dc3' }} />
            <Tooltip content={<ChartTooltip title="沉降-开采" />} />
            <Legend wrapperStyle={{ fontSize: 9 }} />
            <Line yAxisId="sub" type="monotone" dataKey="avgRate" name="沉降速率(mm/a)" stroke="#ef4444" strokeWidth={2} />
            <Line yAxisId="gw" type="monotone" dataKey="gwExploitation" name="地下水开采(亿m³)" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 3" />
          </ComposedChart>
        </ResponsiveContainer>
        <DataSourceNote source="沉降速率与开采量呈高度正相关(r=0.97)，减采是控制沉降的核心措施" />
      </TechCard>
    </div>
  );
}

// ── 水质改善 Tab ──
function QualityTrendPanel({ selected }: { selected: Set<string> }) {
  const cities = useMemo(() => ALL_CITIES.filter(c => selected.has(c)), [selected]);

  const chartData = useMemo(() => {
    return [2020, 2021, 2022, 2023, 2024].map(year => {
      const point: Record<string, number | string> = { year };
      cityQualityTrend.filter(c => cities.includes(c.city)).forEach(c => {
        const val = c[`y${year}` as keyof typeof c] as number;
        point[c.city] = val;
      });
      return point;
    });
  }, [cities]);

  // 全省趋势数据（qualityLevelTrend2020_2024）
  return (
    <div className="space-y-4">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="2024年III类以上达标率" value={`${qualityLevelTrend2020_2024[4].IIIplus}`} unit="%" accent="emerald" subtitle={`${qualityLevelTrend2020_2024[4].wells}眼监测井`} />
        <StatCard title="较2020年提升" value={`${(qualityLevelTrend2020_2024[4].IIIplus - qualityLevelTrend2020_2024[0].IIIplus).toFixed(1)}`} unit="百分点" accent="cyan" subtitle="5年累计" />
        <StatCard title="V类水占比" value={`${qualityLevelTrend2020_2024[4].V}`} unit="%" accent="red" subtitle={`${(qualityLevelTrend2020_2024[0].V - qualityLevelTrend2020_2024[4].V).toFixed(1)}pp下降`} />
        <StatCard title="监测井数增长" value={`${qualityLevelTrend2020_2024[4].wells - qualityLevelTrend2020_2024[0].wells}`} unit="眼" accent="blue" subtitle={`${qualityLevelTrend2020_2024[0].wells}→${qualityLevelTrend2020_2024[4].wells}`} />
      </div>

      {/* 各市达标率趋势 */}
      <TechCard title="各市地下水质量达标率趋势(2020-2024)" badge="%" className="hud-corners">
        {cities.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gw-muted text-sm">请选择城市查看趋势</div>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(350, cities.length * 8 + 280)}>
            <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis dataKey="year" tick={{ fill: '#8b9dc3', fontSize: 11 }} />
              <YAxis tick={{ fill: '#8b9dc3', fontSize: 11 }} domain={[0, 100]} label={{ value: '%', angle: -90, position: 'insideLeft', fill: '#8b9dc3' }} />
              <Tooltip content={<ChartTooltip unit="%" title="达标率" />} />
              <Legend wrapperStyle={{ fontSize: 10, maxHeight: 80, overflow: 'auto' }} />
              {cities.map(city => (
                <Line
                  key={city}
                  type="monotone"
                  dataKey={city}
                  stroke={CITY_COLORS[city]}
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </TechCard>

      {/* 全省水质等级变化 */}
      <TechCard title="全省地下水质量等级变化(2020-2024)" badge="%">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={qualityLevelTrend2020_2024} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis dataKey="year" tick={{ fill: '#8b9dc3', fontSize: 11 }} />
              <YAxis tick={{ fill: '#8b9dc3', fontSize: 11 }} domain={[0, 100]} />
              <Tooltip content={<ChartTooltip unit="%" title="占比" />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Area type="monotone" dataKey="I2" name="I-II类" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
              <Area type="monotone" dataKey="III" name="III类" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              <Area type="monotone" dataKey="IV" name="IV类" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
              <Area type="monotone" dataKey="V" name="V类" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="text-[10px] text-gw-muted space-y-1.5">
            <h4 className="text-xs font-bold text-gw-text mb-2">水质改善趋势摘要</h4>
            <p>• I-II类水比例：<span className="text-emerald-400">{qualityLevelTrend2020_2024[0].I2}%</span> → <span className="text-emerald-400 font-bold">{qualityLevelTrend2020_2024[4].I2}%</span>（+{(qualityLevelTrend2020_2024[4].I2 - qualityLevelTrend2020_2024[0].I2).toFixed(1)}pp）</p>
            <p>• III类水比例：<span className="text-blue-400">{qualityLevelTrend2020_2024[0].III}%</span> → <span className="text-blue-400 font-bold">{qualityLevelTrend2020_2024[4].III}%</span>（+{(qualityLevelTrend2020_2024[4].III - qualityLevelTrend2020_2024[0].III).toFixed(1)}pp）</p>
            <p>• IV类水比例：<span className="text-amber-400">{qualityLevelTrend2020_2024[0].IV}%</span> → <span className="text-amber-400">{qualityLevelTrend2020_2024[4].IV}%</span>（{(qualityLevelTrend2020_2024[4].IV - qualityLevelTrend2020_2024[0].IV).toFixed(1)}pp）</p>
            <p>• V类水比例：<span className="text-red-400">{qualityLevelTrend2020_2024[0].V}%</span> → <span className="text-red-400 font-bold">{qualityLevelTrend2020_2024[4].V}%</span>（-{(qualityLevelTrend2020_2024[0].V - qualityLevelTrend2020_2024[4].V).toFixed(1)}pp）</p>
            <p>• III类及以上合计：<span className="text-cyan-400 font-bold">{qualityLevelTrend2020_2024[0].IIIplus}%</span> → <span className="text-cyan-400 font-bold">{qualityLevelTrend2020_2024[4].IIIplus}%</span>（+{(qualityLevelTrend2020_2024[4].IIIplus - qualityLevelTrend2020_2024[0].IIIplus).toFixed(1)}pp）</p>
            <p className="pt-1 border-t border-gw-border/30">超采治理推进地下水位回升，氧化还原环境改善，有机物降解能力增强，水质呈持续改善态势。</p>
          </div>
        </div>
      </TechCard>

      {/* 2014-2024全省水质达标率趋势(11年均值) */}
      <TechCard title="全省地下水质量达标率趋势(2014-2024)" badge="%" className="hud-corners">
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={qualityYearlySummary} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
            <XAxis dataKey="year" tick={{ fill: '#8b9dc3', fontSize: 11 }} />
            <YAxis tick={{ fill: '#8b9dc3', fontSize: 11 }} domain={[0, 100]} />
            <Tooltip content={<ChartTooltip unit="%" title="全省均值达标率" />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Area type="monotone" dataKey="avgRate" name="全省均值" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} strokeWidth={2} />
            <Line type="monotone" dataKey="bestRate" name="最优市" stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
            <Line type="monotone" dataKey="worstRate" name="最差市" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
            <ChartRefLines lines={[{ y: 2020, stroke: '#f59e0b', strokeDasharray: '6 3', label: '治理加速', position: 'top' }]} />
          </ComposedChart>
        </ResponsiveContainer>
      </TechCard>

      {/* 各市2024年达标率排名 */}
      {cities.length > 0 && (
        <TechCard title="各市2024年地下水质量达标率" badge="%">
          <FilterableTechTable
            headers={['城市', '2020年(%)', '2021年(%)', '2022年(%)', '2023年(%)', '2024年(%)', '5年提升(pp)', '监测井(眼)']}
            rows={cityQualityTrend.filter(c => cities.includes(c.city)).sort((a, b) => b.y2024 - a.y2024).map(c => [
              c.city, c.y2020, c.y2021, c.y2022, c.y2023, c.y2024,
              c.improvement.toFixed(1),
              cityGroundwaterQuality2024.find(q => q.city === c.city)?.wells ?? '—',
            ])}
            pageSize={10}
          />
        </TechCard>
      )}
    </div>
  );
}

// ── 供水结构 Tab ──
function SupplyStructurePanel({ selected }: { selected: Set<string> }) {
  const cities = useMemo(() => ALL_CITIES.filter(c => selected.has(c)), [selected]);
  const supplyData = useMemo(() => cityWaterSupply2024.filter(c => cities.includes(c.city)), [cities]);

  const totalStats = useMemo(() => {
    if (supplyData.length === 0) return null;
    const totalSupply = supplyData.reduce((s, c) => s + c.totalSupply, 0);
    const totalGw = supplyData.reduce((s, c) => s + c.gwSupply, 0);
    const totalOther = supplyData.reduce((s, c) => s + c.totalSupply - c.gwSupply, 0);
    return { totalSupply, totalGw, totalOther };
  }, [supplyData]);

  return (
    <div className="space-y-4">
      {totalStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="总供水量" value={`${totalStats.totalSupply.toFixed(1)}`} unit="亿m³" accent="blue" subtitle={`${supplyData.length}市合计`} />
          <StatCard title="地下水占比" value={`${(totalStats.totalGw / totalStats.totalSupply * 100).toFixed(1)}`} unit="%" accent="cyan" subtitle={`${totalStats.totalGw.toFixed(1)}亿m³`} />
          <StatCard title="地表水+外调占比" value={`${(totalStats.totalOther / totalStats.totalSupply * 100).toFixed(1)}`} unit="%" accent="emerald" subtitle={`${totalStats.totalOther.toFixed(1)}亿m³`} />
          <StatCard title="主要改善城市" value="沧州" unit="18.7%" accent="purple" subtitle="地下水占比全省最低" />
        </div>
      )}

      {/* 供水结构堆叠柱状图 */}
      <TechCard title="各市供水结构对比(2024)" badge="亿m³" className="hud-corners">
        {supplyData.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gw-muted text-sm">请选择城市</div>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(300, supplyData.length * 28 + 60)}>
            <BarChart data={[...supplyData].map(c => ({ ...c, otherSupply: c.totalSupply - c.gwSupply })).sort((a, b) => b.totalSupply - a.totalSupply)} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis dataKey="city" tick={{ fill: '#8b9dc3', fontSize: 10 }} angle={-30} textAnchor="end" height={50} />
              <YAxis tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: '亿m³', angle: -90, position: 'insideLeft', fill: '#8b9dc3' }} />
              <Tooltip content={<ChartTooltip unit="亿m³" title="供水量" />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="gwSupply" name="地下水" stackId="1" fill="#3b82f6" />
              <Bar dataKey="otherSupply" name="其他水源" stackId="1" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </TechCard>

      {/* 地下水占比排名 */}
      <TechCard title="各市地下水占供水比排名(2024)" badge="%">
        {supplyData.length > 0 && (
          <ResponsiveContainer width="100%" height={Math.max(200, supplyData.length * 25 + 40)}>
            <BarChart
              data={[...supplyData].sort((a, b) => b.gwRatio - a.gwRatio)}
              layout="vertical"
              margin={{ top: 10, right: 20, bottom: 5, left: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis type="number" tick={{ fill: '#8b9dc3', fontSize: 10 }} domain={[0, 100]} />
              <YAxis dataKey="city" type="category" tick={{ fill: '#8b9dc3', fontSize: 10 }} width={55} />
              <Tooltip content={<ChartTooltip unit="%" title="地下水占比" />} />
              <Bar dataKey="gwRatio" name="地下水占比(%)" radius={[0, 4, 4, 0]} fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </TechCard>

      {/* 明细表 */}
      {supplyData.length > 0 && (
        <TechCard title="各市供水结构数据明细(2024)" badge="亿m³">
          <FilterableTechTable
            headers={['城市', '总供水(亿m³)', '地下水(亿m³)', '其他水源(亿m³)', '地下水占比(%)']}
            rows={[...supplyData].sort((a, b) => b.totalSupply - a.totalSupply).map(c => [
              c.city,
              c.totalSupply.toFixed(2),
              c.gwSupply.toFixed(2),
              (c.totalSupply - c.gwSupply).toFixed(2),
              c.gwRatio.toFixed(1),
            ])}
            pageSize={10}
          />
        </TechCard>
      )}
    </div>
  );
}

// ── 雷达对比 Tab ──
function RadarComparePanel({ selected }: { selected: Set<string> }) {
  const cities = useMemo(() => ALL_CITIES.filter(c => selected.has(c)), [selected]);

  // 雷达图数据准备：归一化到0-100
  const radarData = useMemo(() => {
    const dimensions = ['开采量(亿m³)', '水质达标率(%)', '浅层埋深(%)', '供水总量(%)', '减采率(%)'];
    // 获取各维度最大值用于归一化
    const maxExploit = Math.max(...ALL_CITIES.map(c => cityExploitationYearly[c]?.[2024] ?? 0));
    const maxSupply = Math.max(...cityWaterSupply2024.map(c => c.totalSupply));
    const maxReduction = Math.max(...ALL_CITIES.map(c => {
      const d14 = cityExploitationYearly[c]?.[2014] ?? 0;
      const d24 = cityExploitationYearly[c]?.[2024] ?? 0;
      return d14 > 0 ? (d14 - d24) / d14 * 100 : 0;
    }));
    const maxDepth = Math.max(...cityGroundwaterDynamic2024.filter(c => c.shallowDepth !== null).map(c => c.shallowDepth ?? 0));

    return dimensions.map(dim => {
      const point: Record<string, string | number> = { dimension: dim };
      cities.forEach(city => {
        let value = 0;
        switch (dim) {
          case '开采量(亿m³)':
            value = (cityExploitationYearly[city]?.[2024] ?? 0) / maxExploit * 100;
            break;
          case '水质达标率(%)': {
            const q = cityQualityTrend.find(c => c.city === city);
            value = q ? q.y2024 : 0;
            break;
          }
          case '浅层埋深(%)': {
            const w = cityGroundwaterDynamic2024.find(c => c.city === city);
            value = w && w.shallowDepth !== null ? w.shallowDepth / maxDepth * 100 : 0;
            break;
          }
          case '供水总量(%)': {
            const s = cityWaterSupply2024.find(c => c.city === city);
            value = s ? s.totalSupply / maxSupply * 100 : 0;
            break;
          }
          case '减采率(%)': {
            const d14 = cityExploitationYearly[city]?.[2014] ?? 0;
            const d24 = cityExploitationYearly[city]?.[2024] ?? 0;
            value = d14 > 0 ? (d14 - d24) / d14 * 100 / maxReduction * 100 : 0;
            break;
          }
        }
        point[city] = parseFloat(value.toFixed(1));
      });
      return point;
    });
  }, [cities]);

  return (
    <div className="space-y-4">
      <TechCard title="多维度城市综合指标雷达图" badge={`${cities.length}市`} className="hud-corners">
        {cities.length === 0 || cities.length > 6 ? (
          <div className="flex items-center justify-center h-64 text-gw-muted text-sm">
            {cities.length === 0 ? '请选择城市' : '雷达图最多对比6个城市'}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={420}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="rgba(6,182,212,0.15)" />
              <PolarAngleAxis dataKey="dimension" tick={{ fill: '#8b9dc3', fontSize: 10 }} />
              <PolarRadiusAxis angle={72} domain={[0, 100]} tick={{ fill: '#8b9dc3', fontSize: 8 }} />
              {cities.map(city => (
                <Radar
                  key={city}
                  name={city}
                  dataKey={city}
                  stroke={CITY_COLORS[city]}
                  fill={CITY_COLORS[city]}
                  fillOpacity={0.12}
                  strokeWidth={2}
                />
              ))}
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </TechCard>

      {/* 综合指标对比表 */}
      {cities.length > 0 && (
        <TechCard title="城市综合指标对比" badge="2024年">
          <FilterableTechTable
            headers={['城市', '开采量(亿m³)', '水质达标率(%)', '浅层埋深(m)', '供水总量(亿m³)', '减采率(%)', '地下水占比(%)']}
            rows={cities.map(city => {
              const exploit = cityExploitationYearly[city]?.[2024] ?? 0;
              const quality = cityQualityTrend.find(c => c.city === city)?.y2024 ?? 0;
              const depth = cityGroundwaterDynamic2024.find(c => c.city === city)?.shallowDepth ?? null;
              const supply = cityWaterSupply2024.find(c => c.city === city);
              const d14 = cityExploitationYearly[city]?.[2014] ?? 0;
              const reduction = d14 > 0 ? ((d14 - exploit) / d14 * 100).toFixed(1) : '—';
              return [
                city, exploit.toFixed(1), quality, depth?.toFixed(1) ?? '—',
                supply?.totalSupply.toFixed(2) ?? '—', reduction,
                supply?.gwRatio.toFixed(1) ?? '—',
              ];
            })}
            pageSize={10}
          />
        </TechCard>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 主页面组件
// ═══════════════════════════════════════════════════════════
// ── 报告数据采集函数 ──
function getTimeSeriesReportData(selectedCities: Set<string>) {
  return {
    exploitationYearly: Object.fromEntries(
      ALL_CITIES.filter(c => selectedCities.has(c)).map(c => [c, cityExploitationYearly[c]])
    ),
    qualityTrend: cityQualityTrend.filter(c => selectedCities.has(c.city)),
    qualityLevelTrend: qualityLevelTrend2020_2024,
    supply2024: cityWaterSupply2024.filter(c => selectedCities.has(c.city)),
    waterLevel2024: cityGroundwaterDynamic2024.filter(c => selectedCities.has(c.city)),
    // Phase 3: 历史时间序列扩展数据
    waterLevelYearly: Object.fromEntries(
      ALL_CITIES.filter(c => selectedCities.has(c)).map(c => [c, cityWaterLevelYearly[c] ?? {}])
    ),
    subsidenceYearly: Object.fromEntries(
      ALL_CITIES.filter(c => selectedCities.has(c)).map(c => [c, citySubsidenceYearly[c] ?? {}])
    ),
    qualityYearly: Object.fromEntries(
      ALL_CITIES.filter(c => selectedCities.has(c)).map(c => [c, cityQualityYearly[c] ?? {}])
    ),
    waterLevelSummary: waterLevelYearlySummary,
    subsidenceSummary: subsidenceYearlySummary,
    qualitySummary: qualityYearlySummary,
    selectedCities: Array.from(selectedCities),
  };
}

export function TimeSeriesAnalysis() {
  const [selectedCities, setSelectedCities] = useState<Set<string>>(new Set(['石家庄', '保定', '邯郸', '邢台', '沧州', '衡水']));
  const [activeTab, setActiveTab] = useState<TabKey>('exploitation');
  const [exportOpen, setExportOpen] = useState(false);
  const [baseline, setBaseline] = useState<number>(2020);

  const { getData, isLoading: dataLoading } = useReportData({
    pageName: 'time-series',
    collector: async () => getTimeSeriesReportData(selectedCities),
    deps: [selectedCities],
  });

  const toggleCity = useCallback((city: string) => {
    setSelectedCities(prev => {
      const next = new Set(prev);
      if (next.has(city)) next.delete(city);
      else next.add(city);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedCities(new Set(ALL_CITIES));
  }, []);

  const clearAll = useCallback(() => {
    setSelectedCities(new Set());
  }, []);

  return (
    <div className="p-3 md:p-6 max-w-[1440px] mx-auto space-y-6">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gw-text">时间序列分析</h1>
          <p className="text-xs text-gw-muted mt-1">2014-2024年河北省地下水多维度变化趋势</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-2 py-1 rounded text-[10px] bg-gw-blue/15 text-gw-highlight border border-gw-blue/30">
            {ALL_CITIES.length}城市 × 11年
          </span>
          <button
            onClick={() => setExportOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] bg-gw-blue/15 text-gw-highlight border border-gw-blue/30 hover:bg-gw-blue/25 transition-colors"
          >
            <FileText size={14} />
            导出报告
          </button>
          <ChartExport
            data={selectedCities.size > 0 ? Object.fromEntries(
              YEARS.map(y => [String(y), Object.fromEntries(
                ALL_CITIES.filter(c => selectedCities.has(c)).map(c => [c, cityExploitationYearly[c]?.[y] ?? null])
              )])
            ) : {}}
            filename="timeseries-analysis"
            sheetName="时间序列"
            formats={['xlsx', 'csv', 'json']}
            label="导出数据"
          />
          <button onClick={() => setExportOpen(true)}
            className="text-xs bg-emerald-600/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600/25 px-2.5 py-1 rounded transition-colors">
            导出报告
          </button>
        </div>
      </div>

      {/* 城市选择器 */}
      <CitySelector selected={selectedCities} onToggle={toggleCity} onAll={selectAll} onClear={clearAll} />

      {/* 分组选择器 + 基准年 */}
      <div className="grid grid-cols-2 gap-4">
        <GroupSelector onSelect={(cities) => setSelectedCities(prev => new Set([...prev, ...cities]))} />
        <BaselineSelector baseline={baseline} onChange={setBaseline} />
      </div>

      {/* Tab 切换 */}
      <div className="flex flex-wrap gap-1 border-b border-gw-border/40 pb-0">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-t-lg transition-all ${
              activeTab === tab.key
                ? 'bg-gw-blue/15 text-gw-highlight border border-gw-blue/30 border-b-0 -mb-px'
                : 'text-gw-muted hover:text-gw-text hover:bg-gw-surface/50 border border-transparent'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 内容 */}
      <div>
        {activeTab === 'exploitation' && <ExploitationTrendPanel selected={selectedCities} />}
        {activeTab === 'waterLevel' && <WaterLevelPanel selected={selectedCities} />}
        {activeTab === 'quality' && <QualityTrendPanel selected={selectedCities} />}
        {activeTab === 'structure' && <SupplyStructurePanel selected={selectedCities} />}
        {activeTab === 'radar' && <RadarComparePanel selected={selectedCities} />}
        {activeTab === 'forecast' && <ForecastPanel selected={selectedCities} baseline={baseline} />}
        {activeTab === 'subsidence' && <SubsidenceTrendPanel selected={selectedCities} />}
        {activeTab === 'correlation' && <CorrelationPanel selected={selectedCities} />}
        {activeTab === 'governance' && <GovernancePanel selected={selectedCities} />}
        {activeTab === 'regional' && <RegionalComparePanel selected={selectedCities} />}
      </div>

      {/* 底部 */}
      <CrossLinkPanel currentPath="/time-series" />
      <DataSourceNote source="数据来源: 河北省水资源公报(2014-2024) + 地下水监测年报 + 超采区评价报告" />

      {/* 报告导出对话框 */}
      <ExportProgressDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        reportType="time-series"
        reportLabel="河北省地下水时间序列分析报告"
        data={getData()}
        dataLoading={dataLoading}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Phase 3.2 综合趋势分析组件
// ═══════════════════════════════════════════════════════════════

// ── 任务9: 综合关联Tab ──
function CorrelationPanel({ selected }: { selected: Set<string> }) {
  const cities = useMemo(() => ALL_CITIES.filter(c => selected.has(c)), [selected]);

  // 散点数据: 开采减采率 vs 水位回升幅度 vs 水质改善 vs 沉降减缓
  const scatterData = useMemo(() =>
    cities.map(city => {
      const exp14 = cityExploitationYearly[city]?.[2014] ?? 0;
      const exp24 = cityExploitationYearly[city]?.[2024] ?? 0;
      const expReduction = exp14 > 0 ? (exp14 - exp24) / exp14 * 100 : 0;
      const wl14 = cityWaterLevelYearly[city]?.[2014] ?? 0;
      const wl24 = cityWaterLevelYearly[city]?.[2024] ?? 0;
      const wlRecovery = wl14 - wl24; // 正值=水位回升
      const q14 = cityQualityYearly[city]?.[2014] ?? 0;
      const q24 = cityQualityYearly[city]?.[2024] ?? 0;
      const qImprovement = q24 - q14;
      const sub14 = citySubsidenceYearly[city]?.[2014] ?? 0;
      const sub24 = citySubsidenceYearly[city]?.[2024] ?? 0;
      const subReduction = sub14 > 0 ? (sub14 - sub24) / sub14 * 100 : 0;
      return { city, expReduction: +expReduction.toFixed(1), wlRecovery: +wlRecovery.toFixed(1), qImprovement: +qImprovement.toFixed(1), subReduction: +subReduction.toFixed(1) };
    }),
  [cities]);

  // 皮尔逊相关系数
  const pearson = (x: number[], y: number[]) => {
    const n = x.length;
    if (n < 3) return 0;
    const mx = x.reduce((a, b) => a + b, 0) / n;
    const my = y.reduce((a, b) => a + b, 0) / n;
    const sxx = x.reduce((a, v) => a + (v - mx) ** 2, 0);
    const syy = y.reduce((a, v) => a + (v - my) ** 2, 0);
    const sxy = x.reduce((a, v, i) => a + (v - mx) * (y[i] - my), 0);
    return sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : 0;
  };

  const correlations = useMemo(() => {
    const x = scatterData.map(d => d.expReduction);
    return {
      wl: pearson(x, scatterData.map(d => d.wlRecovery)),
      q: pearson(x, scatterData.map(d => d.qImprovement)),
      sub: pearson(x, scatterData.map(d => d.subReduction)),
    };
  }, [scatterData]);

  if (cities.length < 2) return <div className="text-center text-gw-muted py-12">请至少选择2个城市进行关联分析</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatCard title="开采减采 vs 水位回升" value={correlations.wl.toFixed(3)} unit="r" accent={correlations.wl > 0.5 ? 'emerald' : correlations.wl > 0.3 ? 'cyan' : 'amber'} subtitle={correlations.wl > 0.5 ? '强正相关' : correlations.wl > 0.3 ? '中等正相关' : '弱相关'} />
        <StatCard title="开采减采 vs 水质改善" value={correlations.q.toFixed(3)} unit="r" accent={correlations.q > 0.5 ? 'emerald' : correlations.q > 0.3 ? 'cyan' : 'amber'} subtitle={correlations.q > 0.5 ? '强正相关' : correlations.q > 0.3 ? '中等正相关' : '弱相关'} />
        <StatCard title="开采减采 vs 沉降减缓" value={correlations.sub.toFixed(3)} unit="r" accent={correlations.sub > 0.5 ? 'emerald' : correlations.sub > 0.3 ? 'cyan' : 'amber'} subtitle={correlations.sub > 0.5 ? '强正相关' : correlations.sub > 0.3 ? '中等正相关' : '弱相关'} />
      </div>

      {/* 开采减采率 vs 水位回升 散点图 */}
      <TechCard title="开采减采率 vs 水位回升幅度" badge="散点关联" className="hud-corners">
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
            <XAxis dataKey="city" tick={{ fill: '#8b9dc3', fontSize: 10 }} />
            <YAxis yAxisId="left" tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: '减采率(%)', angle: -90, position: 'insideLeft', fill: '#8b9dc3', fontSize: 10 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: '回升(m)', angle: 90, position: 'insideRight', fill: '#8b9dc3', fontSize: 10 }} />
            <Tooltip content={<ChartTooltip unit="" title="城市" />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar yAxisId="left" dataKey="expReduction" name="开采减采率(%)" fill="#3b82f6" fillOpacity={0.7} radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="wlRecovery" name="水位回升(m)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 5, fill: '#10b981' }} />
          </ComposedChart>
        </ResponsiveContainer>
        <DataSourceNote source={`Pearson r = ${correlations.wl.toFixed(3)}，开采量削减越多的城市水位回升越显著`} />
      </TechCard>

      {/* 四维关联明细表 */}
      <TechCard title="四维关联明细" badge="2014→2024">
        <FilterableTechTable
          headers={['城市', '开采减采率(%)', '水位回升(m)', '水质改善(pp)', '沉降减缓(%)']}
          rows={scatterData.sort((a, b) => b.expReduction - a.expReduction).map(d => [d.city, d.expReduction, d.wlRecovery, d.qImprovement, d.subReduction])}
          pageSize={10}
        />
      </TechCard>

      {/* 水质改善 vs 沉降减缓 散点 */}
      <TechCard title="水质改善 vs 沉降减缓率" badge="散点关联">
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
            <XAxis dataKey="city" tick={{ fill: '#8b9dc3', fontSize: 10 }} />
            <YAxis yAxisId="left" tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: '水质改善(pp)', angle: -90, position: 'insideLeft', fill: '#8b9dc3', fontSize: 10 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: '减缓率(%)', angle: 90, position: 'insideRight', fill: '#8b9dc3', fontSize: 10 }} />
            <Tooltip content={<ChartTooltip unit="" title="城市" />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar yAxisId="left" dataKey="qImprovement" name="水质改善(pp)" fill="#06b6d4" fillOpacity={0.7} radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="subReduction" name="沉降减缓(%)" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 5, fill: '#ef4444' }} />
          </ComposedChart>
        </ResponsiveContainer>
        <DataSourceNote source={`Pearson r = ${correlations.sub.toFixed(3)}，水质与沉降均受开采量变化驱动`} />
      </TechCard>
    </div>
  );
}

// ── 任务10: 治理成效Tab ──
function GovernancePanel({ selected }: { selected: Set<string> }) {
  const cities = useMemo(() => ALL_CITIES.filter(c => selected.has(c)), [selected]);

  // 治理成效综合评分
  const governanceData = useMemo(() =>
    cities.map(city => {
      const exp14 = cityExploitationYearly[city]?.[2014] ?? 0;
      const exp24 = cityExploitationYearly[city]?.[2024] ?? 0;
      const expPct = exp14 > 0 ? (exp14 - exp24) / exp14 * 100 : 0;
      const wl14 = cityWaterLevelYearly[city]?.[2014] ?? 0;
      const wl24 = cityWaterLevelYearly[city]?.[2024] ?? 0;
      const wlRecoveryM = wl14 - wl24;
      const wlPct = wl14 > 0 ? wlRecoveryM / wl14 * 100 : 0;
      const q14 = cityQualityYearly[city]?.[2014] ?? 0;
      const q24 = cityQualityYearly[city]?.[2024] ?? 0;
      const qPct = q14 > 0 ? (q24 - q14) / q14 * 100 : 0;
      const sub14 = citySubsidenceYearly[city]?.[2014] ?? 0;
      const sub24 = citySubsidenceYearly[city]?.[2024] ?? 0;
      const subPct = sub14 > 0 ? (sub14 - sub24) / sub14 * 100 : 0;
      // 综合评分(加权: 开采25%+水位30%+水质25%+沉降20%)
      const score = Math.round(expPct * 0.25 + wlPct * 0.30 + qPct * 0.25 + subPct * 0.20);
      return { city, expPct: +expPct.toFixed(1), wlPct: +wlPct.toFixed(1), qPct: +qPct.toFixed(1), subPct: +subPct.toFixed(1), score, wlRecoveryM: +wlRecoveryM.toFixed(1) };
    }).sort((a, b) => b.score - a.score),
  [cities]);

  // 年度治理进程
  const yearlyProcess = useMemo(() =>
    TS_FULL_YEARS.map(year => {
      const avgExp = cities.reduce((s, c) => s + (cityExploitationYearly[c]?.[year] ?? 0), 0) / (cities.length || 1);
      const avgWl = cities.reduce((s, c) => s + (cityWaterLevelYearly[c]?.[year] ?? 0), 0) / (cities.length || 1);
      const avgQ = cities.reduce((s, c) => s + (cityQualityYearly[c]?.[year] ?? 0), 0) / (cities.length || 1);
      const avgSub = cities.reduce((s, c) => s + (citySubsidenceYearly[c]?.[year] ?? 0), 0) / (cities.length || 1);
      return { year, avgExp: +avgExp.toFixed(1), avgWl: +avgWl.toFixed(1), avgQ: +avgQ.toFixed(1), avgSub: +avgSub.toFixed(1) };
    }),
  [cities]);

  if (cities.length === 0) return <div className="text-center text-gw-muted py-12">请选择城市查看治理成效</div>;

  const topCity = governanceData[0];
  const avgScore = governanceData.length > 0 ? Math.round(governanceData.reduce((s, d) => s + d.score, 0) / governanceData.length) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="最优治理城市" value={topCity?.city ?? '—'} unit={`${topCity?.score ?? 0}分`} accent="emerald" subtitle="综合评分最高" />
        <StatCard title="平均治理评分" value={`${avgScore}`} unit="分(100制)" accent="cyan" subtitle={`${cities.length}市平均`} />
        <StatCard title="最高开采降幅" value={`${governanceData.length > 0 ? Math.max(...governanceData.map(d => d.expPct)) : 0}`} unit="%" accent="blue" subtitle="2014→2024" />
        <StatCard title="最高水质改善率" value={`${governanceData.length > 0 ? Math.max(...governanceData.map(d => d.qPct)) : 0}`} unit="%" accent="green" subtitle="达标率提升" />
      </div>

      {/* 治理成效排名 */}
      <TechCard title="各市超采治理综合成效排名" badge="2014→2024" className="hud-corners">
        <ResponsiveContainer width="100%" height={Math.max(300, governanceData.length * 28 + 40)}>
          <BarChart data={governanceData} layout="vertical" margin={{ top: 10, right: 20, bottom: 5, left: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
            <XAxis type="number" tick={{ fill: '#8b9dc3', fontSize: 10 }} domain={[0, 100]} />
            <YAxis dataKey="city" type="category" tick={{ fill: '#8b9dc3', fontSize: 10 }} width={55} />
            <Tooltip content={<ChartTooltip unit="分" title="综合评分" />} />
            <Bar dataKey="score" name="综合评分" radius={[0, 4, 4, 0]}>
                {governanceData.map((d, i) => (
                  <Cell key={i} fill={d.score >= 40 ? '#10b981' : d.score >= 25 ? '#f59e0b' : '#ef4444'} />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </TechCard>

      {/* 年度治理进程四维折线 */}
      <TechCard title="年度治理进程(四维均值)" badge="2014-2024">
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={yearlyProcess} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
            <XAxis dataKey="year" tick={{ fill: '#8b9dc3', fontSize: 11 }} />
            <YAxis yAxisId="exp" tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: '亿m3', angle: -90, position: 'insideLeft', fill: '#8b9dc3', fontSize: 10 }} />
            <YAxis yAxisId="sub" orientation="right" tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: 'mm/a', angle: 90, position: 'insideRight', fill: '#8b9dc3', fontSize: 10 }} />
            <Tooltip content={<ChartTooltip unit="" title="年份" />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <ChartRefLines lines={[{ x: 2018, stroke: '#22c55e', strokeDasharray: '6 3', label: '回升拐点', position: 'top', fontSize: 9 }]} />
            <Line yAxisId="exp" type="monotone" dataKey="avgExp" name="平均开采(亿m3)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} />
            <Line yAxisId="exp" type="monotone" dataKey="avgWl" name="平均埋深(m)" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} />
            <Line yAxisId="sub" type="monotone" dataKey="avgSub" name="平均沉降(mm/a)" stroke="#ef4444" strokeWidth={2} dot={{ r: 2 }} />
            <Line yAxisId="exp" type="monotone" dataKey="avgQ" name="平均达标率(%)" stroke="#06b6d4" strokeWidth={2} dot={{ r: 2 }} />
          </ComposedChart>
        </ResponsiveContainer>
        <DataSourceNote source="开采量下降+水位回升+水质改善+沉降减缓，四维指标同步优化" />
      </TechCard>

      {/* 明细表 */}
      <TechCard title="治理成效综合评分明细" badge="加权评分">
        <FilterableTechTable
          headers={['城市', '开采降幅(%)', '水位回升(%)', '水质改善(%)', '沉降减缓(%)', '综合评分', '水位回升(m)']}
          rows={governanceData.map(d => [d.city, d.expPct, d.wlPct, d.qPct, d.subPct, d.score, d.wlRecoveryM])}
          pageSize={10}
        />
      </TechCard>
    </div>
  );
}
