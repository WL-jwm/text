// ═══════════════════════════════════════════════════════════
// 数据资产仪表盘 — 平台数据覆盖率、模块统计、质量指标
// ═══════════════════════════════════════════════════════════
import React, { useMemo } from 'react';
import {
  Database, FileText,  CheckCircle2,   PieChart as PieChartIcon,
} from 'lucide-react';
import { dbMeta } from '../data/changelog';
import {
  TechCard, StatCard, 
} from '../components/UI';

/** 数据模块定义 */
const DATA_MODULES = [
  { key: 'resources', name: '水资源量', pages: ['Resources'], records: 42, completeness: 95, lastUpdate: '2024' },
  { key: 'waterQuality', name: '水质评价', pages: ['WaterQuality'], records: 38, completeness: 90, lastUpdate: '2024' },
  { key: 'exploitation', name: '开采管理', pages: ['Exploitation'], records: 35, completeness: 88, lastUpdate: '2024' },
  { key: 'environment', name: '地质环境', pages: ['Environment'], records: 28, completeness: 85, lastUpdate: '2024' },
  { key: 'hydrochemistry', name: '水文地球化学', pages: ['Hydrochemistry'], records: 22, completeness: 80, lastUpdate: '2024' },
  { key: 'geology', name: '地质基础', pages: ['Geology'], records: 18, completeness: 78, lastUpdate: '2024' },
  { key: 'hydroParams', name: '水文地质参数', pages: ['HydroZoneParams'], records: 45, completeness: 92, lastUpdate: '2024' },
  { key: 'systemZoning', name: '系统分区', pages: ['SystemZoning'], records: 32, completeness: 87, lastUpdate: '2024' },
  { key: 'waterSource', name: '水源地', pages: ['WaterSource'], records: 25, completeness: 83, lastUpdate: '2024' },
  { key: 'geothermal', name: '地热资源', pages: ['Geothermal'], records: 20, completeness: 82, lastUpdate: '2024' },
  { key: 'karstWater', name: '岩溶水', pages: ['KarstWater'], records: 18, completeness: 79, lastUpdate: '2024' },
  { key: 'mineralWater', name: '矿泉水', pages: ['MineralWater'], records: 12, completeness: 75, lastUpdate: '2024' },
  { key: 'salineWater', name: '咸水资源', pages: ['SalineWater'], records: 15, completeness: 76, lastUpdate: '2024' },
  { key: 'salineSoil', name: '盐碱土', pages: ['SalineSoil'], records: 16, completeness: 77, lastUpdate: '2024' },
  { key: 'fractureWater', name: '裂隙水', pages: ['FractureWater'], records: 14, completeness: 74, lastUpdate: '2024' },
  { key: 'mineHydro', name: '矿床水文地质', pages: ['MineHydrogeology'], records: 18, completeness: 80, lastUpdate: '2024' },
  { key: 'mapData', name: '地图标注', pages: ['MapView'], records: 0, completeness: 70, lastUpdate: '2024' },
  { key: 'dataInsight', name: '综合分析', pages: ['DataInsight'], records: 0, completeness: 85, lastUpdate: '2024' },
];

/** 覆盖度等级颜色 */
function getCompletenessColor(pct: number): string {
  if (pct >= 90) return 'text-emerald-400';
  if (pct >= 80) return 'text-cyan-400';
  if (pct >= 70) return 'text-amber-400';
  return 'text-red-400';
}

function getCompletenessBarColor(pct: number): string {
  if (pct >= 90) return 'bg-emerald-500';
  if (pct >= 80) return 'bg-cyan-500';
  if (pct >= 70) return 'bg-amber-500';
  return 'bg-red-500';
}

export function DataDashboard() {
  const stats = useMemo(() => {
    const totalRecords = DATA_MODULES.reduce((s, m) => s + m.records, 0);
    const avgCompleteness = DATA_MODULES.reduce((s, m) => s + m.completeness, 0) / DATA_MODULES.length;
    const highQuality = DATA_MODULES.filter(m => m.completeness >= 85).length;
    const needsWork = DATA_MODULES.filter(m => m.completeness < 80).length;
    const totalPages = dbMeta.totalPages || 20;
    const totalSearch = dbMeta.totalSearchEntries || 156;
    return { totalRecords, avgCompleteness, highQuality, needsWork, totalPages, totalSearch, moduleCount: DATA_MODULES.length };
  }, []);

  const completenessDistribution = useMemo(() => {
    const ranges = [
      { label: '90-100%', count: DATA_MODULES.filter(m => m.completeness >= 90).length, color: '#10b981' },
      { label: '80-89%', count: DATA_MODULES.filter(m => m.completeness >= 80 && m.completeness < 90).length, color: '#06b6d4' },
      { label: '70-79%', count: DATA_MODULES.filter(m => m.completeness >= 70 && m.completeness < 80).length, color: '#f59e0b' },
      { label: '<70%', count: DATA_MODULES.filter(m => m.completeness < 70).length, color: '#ef4444' },
    ];
    return ranges;
  }, []);

  return (
    <div className="space-y-4">
      {/* KPI行 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="数据模块" value={`${stats.moduleCount}`} unit="个" accent="blue" subtitle="覆盖18个专题" />
        <StatCard title="数据记录" value={`${stats.totalRecords}`} unit="条" accent="cyan" subtitle="结构化数据条目" />
        <StatCard title="平均覆盖度" value={`${stats.avgCompleteness.toFixed(0)}`} unit="%" accent="emerald" subtitle={`高质量${stats.highQuality}个`} />
        <StatCard title="页面总数" value={`${stats.totalPages}`} unit="页" accent="purple" subtitle={`${stats.totalSearch}搜索条目`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 模块覆盖度列表 */}
        <TechCard title="各模块数据覆盖度" icon={Database} badge={`${stats.moduleCount}个模块`}>
          <div className="space-y-2">
            {DATA_MODULES
              .sort((a, b) => b.completeness - a.completeness)
              .map(m => (
                <div key={m.key} className="flex items-center gap-3 group">
                  <span className="text-xs text-gw-muted w-20 truncate flex-shrink-0" title={m.name}>{m.name}</span>
                  <div className="flex-1 h-2 bg-gw-card-alt rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${getCompletenessBarColor(m.completeness)}`}
                      style={{ width: `${m.completeness}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium w-12 text-right ${getCompletenessColor(m.completeness)}`}>
                    {m.completeness}%
                  </span>
                  {m.records > 0 && (
                    <span className="text-[10px] text-gw-muted w-14 text-right">{m.records}条</span>
                  )}
                </div>
              ))}
          </div>
        </TechCard>

        {/* 覆盖度分布 + 质量摘要 */}
        <div className="space-y-4">
          <TechCard title="覆盖度分布" icon={PieChartIcon}>
            <div className="grid grid-cols-2 gap-3">
              {completenessDistribution.map(r => (
                <div key={r.label} className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gw-muted">{r.label}</span>
                    <span className="text-lg font-bold" style={{ color: r.color }}>{r.count}</span>
                  </div>
                  <div className="h-1.5 bg-gw-card-alt rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(r.count / stats.moduleCount) * 100}%`, background: r.color }} />
                  </div>
                </div>
              ))}
            </div>
          </TechCard>

          <TechCard title="数据质量概览" icon={CheckCircle2}>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-emerald-900/20 rounded-lg border border-emerald-500/20">
                <div className="text-xs text-emerald-400 mb-1">高质量模块</div>
                <div className="text-2xl font-bold text-emerald-400">{stats.highQuality}</div>
                <div className="text-[10px] text-gw-muted">覆盖度 ≥ 85%</div>
              </div>
              <div className="p-3 bg-amber-900/20 rounded-lg border border-amber-500/20">
                <div className="text-xs text-amber-400 mb-1">待补充模块</div>
                <div className="text-2xl font-bold text-amber-400">{stats.needsWork}</div>
                <div className="text-[10px] text-gw-muted">覆盖度 {'<'} 80%</div>
              </div>
              <div className="p-3 bg-cyan-900/20 rounded-lg border border-cyan-500/20">
                <div className="text-xs text-cyan-400 mb-1">时间序列数据</div>
                <div className="text-2xl font-bold text-cyan-400">4</div>
                <div className="text-[10px] text-gw-muted">资源/水质/开采/沉降</div>
              </div>
              <div className="p-3 bg-purple-900/20 rounded-lg border border-purple-500/20">
                <div className="text-xs text-purple-400 mb-1">空间数据</div>
                <div className="text-2xl font-bold text-purple-400">6</div>
                <div className="text-[10px] text-gw-muted">地图标注+系统分区</div>
              </div>
            </div>
          </TechCard>
        </div>
      </div>

      {/* 数据来源时间线 */}
      <TechCard title="数据来源年份覆盖" icon={FileText}>
        <div className="flex flex-wrap gap-2">
          {[
            { year: '2024', label: '水资源公报', color: 'bg-emerald-500' },
            { year: '2024', label: '水质监测', color: 'bg-cyan-500' },
            { year: '2024', label: '超采治理', color: 'bg-blue-500' },
            { year: '2015-2024', label: '水质趋势', color: 'bg-amber-500' },
            { year: '2018-2024', label: '资源时序', color: 'bg-purple-500' },
            { year: '1990s', label: '开采对比基线', color: 'bg-red-500' },
            { year: '2014-2024', label: '南水北调', color: 'bg-green-500' },
            { year: '2024', label: '水土保持', color: 'bg-teal-500' },
          ].map((d, i) => (
            <span key={i} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gw-card-alt border border-gw-border`}>
              <span className={`w-1.5 h-1.5 rounded-full ${d.color}`} />
              {d.year} {d.label}
            </span>
          ))}
        </div>
      </TechCard>
    </div>
  );
}
