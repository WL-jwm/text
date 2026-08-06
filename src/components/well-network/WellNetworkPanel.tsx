/**
 * H-01 监测井网与空间分析 — 井网管理面板（实时联动增强）
 *
 * 提供监测井网管理和空间分析的可视化界面，并集成实时读数联动：
 *   1. 井网总览（统计卡片：井总数/覆盖城市/活跃井/含水层数 + 实时状态统计）
 *   2. 井点分布图（按含水层着色 + 实时状态描边）
 *   3. 井列表（可筛选 + 实时值/状态徽章）
 *   4. 实时异常筛选
 *   5. 空间分析（含水层分组/城市分组/最近邻/缓冲区）
 *   6. 选中井实时详情与趋势
 */

import { useState, useMemo, useCallback } from 'react';
import {
  Network,
  MapPin,
  Plus,
  Search,
  Crosshair,
  Layers,
  Building2,
  Filter,
  Trash2,
  RefreshCw,
  ChevronDown,
  Ruler,
  Activity,
  CircleDot,
  Radio,
  TriangleAlert,
  Clock,
  FileDown,
  Droplets,
  TrendingUp,
  TrendingDown,
  BarChart3,
} from 'lucide-react';
import { TechCard } from '../UI';
import {
  useWellNetwork,
  useWellFilter,
  useSpatialAnalysis,
  useWellSelection,
} from '../../hooks/useWellNetwork';
import { useWellRealtime, useWellRealtimeStats, useWellRealtimeTrend } from '../../hooks/useWellRealtime';
import { useWellAlerts, useWellTrend } from '../../hooks/useWellAlerts';
import { useWaterBalance, useCityBalance, useBalanceComparison } from '../../hooks/useWaterBalance';
import { RECHARGE_META, DISCHARGE_META } from '../../services/waterBalance';
import { useWaterQuality, useWellWaterQuality } from '../../hooks/useWaterQuality';
import { WATER_CLASS_LABELS } from '../../services/waterQuality';
import {
  AQUIFER_LABELS,
  WELL_STATUS_LABELS,
} from '../../services/wellNetwork';
import { WELL_REALTIME_STATUS_CONFIG } from '../../services/wellRealtime';
import { ALERT_SEVERITY_CONFIG, formatAlertThreshold } from '../../services/wellAlerts';
import type { AlertSeverity } from '../../services/wellAlerts';
import { downloadWellReport } from '../../services/wellReportDocx';
import { buildWellReportData } from '../../services/wellReport';
import type { AquiferType, WellStatus, Well } from '../../services/wellNetwork';
import type { WellWithData, WellRealtimeStatus } from '../../services/wellRealtime';
import type { DataChannel } from '../../services/realtimeDataService';

// ── 常量 ──

const CHANNEL_LABELS: Record<DataChannel, string> = {
  waterLevel: '水位',
  waterQuality: '水质',
  subsidence: '沉降',
  extraction: '开采量',
};

const AQUIFER_COLORS: Record<AquiferType, string> = {
  shallowPorous: '#06b6d4',
  deepPorous: '#2563eb',
  karst: '#10b981',
  fracture: '#f59e0b',
};

const AQUIFER_TYPES: AquiferType[] = ['shallowPorous', 'deepPorous', 'karst', 'fracture'];
const STATUSES: WellStatus[] = ['active', 'maintenance', 'inactive'];
const CHANNELS: DataChannel[] = ['waterLevel', 'waterQuality', 'subsidence', 'extraction'];
const RT_STATUSES: WellRealtimeStatus[] = ['normal', 'warning', 'critical', 'stale'];

// ── 井点分布图（SVG 平面） ──

function WellMap({ wells, selectedId, onSelect }: {
  wells: WellWithData[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const bounds = useMemo(() => {
    if (wells.length === 0) return null;
    let minLat = Infinity, maxLat = -Infinity;
    let minLon = Infinity, maxLon = -Infinity;
    for (const w of wells) {
      if (w.latitude < minLat) minLat = w.latitude;
      if (w.latitude > maxLat) maxLat = w.latitude;
      if (w.longitude < minLon) minLon = w.longitude;
      if (w.longitude > maxLon) maxLon = w.longitude;
    }
    return { minLat, maxLat, minLon, maxLon };
  }, [wells]);

  if (!bounds || wells.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center text-[10px] text-gw-muted/50">
        暂无井点数据
      </div>
    );
  }

  const pad = 0.5;
  const latRange = (bounds.maxLat - bounds.minLat) || 1;
  const lonRange = (bounds.maxLon - bounds.minLon) || 1;
  const w = 200, h = 140;

  const project = (lat: number, lon: number) => {
    const x = ((lon - bounds.minLon + pad) / (lonRange + 2 * pad)) * w;
    const y = h - ((lat - bounds.minLat + pad) / (latRange + 2 * pad)) * h;
    return { x, y };
  };

  return (
    <div className="relative h-36 bg-gw-surface/10 border border-gw-border/20 rounded overflow-hidden">
      <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} className="absolute inset-0">
        <defs>
          <pattern id="well-grid" width="25" height="25" patternUnits="userSpaceOnUse">
            <path d="M 25 0 L 0 0 0 25" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-gw-border/20" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#well-grid)" />
        {wells.map(well => {
          const { x, y } = project(well.latitude, well.longitude);
          const color = AQUIFER_COLORS[well.aquiferType];
          const selected = well.id === selectedId;
          // 实时状态描边
          const rtConfig = WELL_REALTIME_STATUS_CONFIG[well.realtime.status];
          const rtColor = well.realtime.status === 'normal' ? undefined : rtConfig.color;
          return (
            <g key={well.id} transform={`translate(${x},${y})`}>
              {/* 实时状态光环 */}
              {rtColor && (
                <circle r={selected ? 10 : 8} fill={rtColor} fillOpacity={0.15} />
              )}
              <circle
                r={selected ? 6 : 4.5}
                fill={color}
                fillOpacity={selected ? 0.9 : 0.5}
                stroke={rtColor ?? '#fff'}
                strokeWidth={selected ? 1.5 : (rtColor ? 1.2 : 0.8)}
                onClick={() => onSelect(well.id)}
                className="cursor-pointer hover:fill-opacity-80"
              />
              {selected && (
                <text x={0} y={-9} textAnchor="middle" fill={color} fontSize="6" fontWeight="bold">
                  {well.name.slice(0, 6)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="absolute bottom-1 left-1 flex items-center gap-1.5 text-[8px] text-gw-muted/70 bg-gw-surface/80 rounded px-1.5 py-0.5">
        {AQUIFER_TYPES.map(type => (
          <span key={type} className="flex items-center gap-0.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: AQUIFER_COLORS[type] }} />
            {AQUIFER_LABELS[type]}
          </span>
        ))}
      </div>
      {/* 状态图例 */}
      <div className="absolute bottom-1 right-1 flex items-center gap-1.5 text-[8px] text-gw-muted/70 bg-gw-surface/80 rounded px-1.5 py-0.5">
        {RT_STATUSES.map(s => (
          <span key={s} className="flex items-center gap-0.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: WELL_REALTIME_STATUS_CONFIG[s].color }} />
            {WELL_REALTIME_STATUS_CONFIG[s].label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── 统计卡片 ──

function StatCard({ label, value, icon: Icon, color }: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="px-2 py-2 rounded-lg bg-gw-surface/20 border border-gw-border/10 flex items-center gap-2">
      <Icon size={14} style={{ color }} />
      <div>
        <div className="text-[13px] font-bold font-mono" style={{ color }}>{value}</div>
        <div className="text-[8px] text-gw-muted/60">{label}</div>
      </div>
    </div>
  );
}

// ── 实时状态徽章 ──

function RealtimeStatusBadge({ status }: { status: WellRealtimeStatus }) {
  const config = WELL_REALTIME_STATUS_CONFIG[status];
  return (
    <span
      className="text-[8px] px-1.5 py-0.5 rounded font-medium whitespace-nowrap"
      style={{ backgroundColor: `${config.color}20`, color: config.color }}
    >
      {config.label}
    </span>
  );
}

// ── 井表格 ──

function WellTable({ wells, selectedId, onSelect, onDelete }: {
  wells: WellWithData[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[10px]">
        <thead>
          <tr className="text-gw-muted/60 border-b border-gw-border/20">
            <th className="py-1 pr-2 font-medium">井名</th>
            <th className="py-1 pr-2 font-medium">城市</th>
            <th className="py-1 pr-2 font-medium">含水层</th>
            <th className="py-1 pr-2 font-medium">实时值</th>
            <th className="py-1 pr-2 font-medium">状态</th>
            <th className="py-1 pr-2 font-medium">指标</th>
            <th className="py-1 font-medium">操作</th>
          </tr>
        </thead>
        <tbody>
          {wells.map(well => {
            const selected = well.id === selectedId;
            const rt = well.realtime;
            return (
              <tr
                key={well.id}
                onClick={() => onSelect(well.id)}
                className={`border-b border-gw-border/10 cursor-pointer transition-colors ${
                  selected ? 'bg-gw-cyan/10' : 'hover:bg-gw-surface/20'
                }`}
              >
                <td className="py-1.5 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: AQUIFER_COLORS[well.aquiferType] }} />
                    <span className="font-medium text-gw-text">{well.name}</span>
                  </div>
                  <span className="text-[8px] text-gw-muted/40 font-mono">{well.id}</span>
                </td>
                <td className="py-1.5 pr-2 text-gw-muted">{well.city}</td>
                <td className="py-1.5 pr-2 text-gw-muted">{AQUIFER_LABELS[well.aquiferType]}</td>
                <td className="py-1.5 pr-2">
                  {rt.value !== null ? (
                    <span className="font-mono font-medium" style={{ color: rt.status === 'normal' ? undefined : WELL_REALTIME_STATUS_CONFIG[rt.status].color }}>
                      {rt.value.toFixed(1)}{rt.unit}
                    </span>
                  ) : (
                    <span className="text-gw-muted/40">—</span>
                  )}
                </td>
                <td className="py-1.5 pr-2">
                  <RealtimeStatusBadge status={rt.status} />
                </td>
                <td className="py-1.5 pr-2">
                  <div className="flex flex-wrap gap-0.5 max-w-24">
                    {well.indicators.map(ind => (
                      <span key={ind} className="text-[7px] px-1 py-px rounded bg-gw-surface/40 text-gw-muted/70">
                        {CHANNEL_LABELS[ind]}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-1.5">
                  <button
                    onClick={e => { e.stopPropagation(); onDelete(well.id); }}
                    className="text-gw-muted/40 hover:text-red-400 transition-colors"
                    title="删除井"
                  >
                    <Trash2 size={11} />
                  </button>
                </td>
              </tr>
            );
          })}
          {wells.length === 0 && (
            <tr>
              <td colSpan={7} className="py-4 text-center text-[10px] text-gw-muted/50">暂无符合条件的井</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ── 实时趋势迷你图 ──

function TrendSparkline({ readings, color }: { readings: { timestamp: number; value: number }[]; color: string }) {
  if (readings.length < 2) return null;

  const values = readings.map(r => r.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const w = 120, h = 28;
  const points = readings.map((r, i) => {
    const x = (i / (readings.length - 1)) * w;
    const y = h - ((r.value - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  });

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="flex-shrink-0">
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── 新增井表单 ──

function AddWellForm({ onAdd, onClose }: {
  onAdd: (well: Omit<Well, 'id'>) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [city, setCity] = useState('石家庄');
  const [latitude, setLatitude] = useState(38.0);
  const [longitude, setLongitude] = useState(114.5);
  const [aquiferType, setAquiferType] = useState<AquiferType>('shallowPorous');
  const [depth, setDepth] = useState(100);
  const [indicator, setIndicator] = useState<DataChannel>('waterLevel');
  const [builtYear, setBuiltYear] = useState(2024);

  const cities = ['石家庄', '保定', '沧州', '衡水', '邢台', '廊坊', '邯郸', '秦皇岛', '承德', '张家口', '唐山'];

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      city,
      latitude,
      longitude,
      aquiferType,
      depth,
      indicators: [indicator],
      status: 'active',
      builtYear,
    });
    onClose();
  };

  return (
    <div className="border border-gw-cyan/30 rounded-lg bg-gw-surface/10 p-2.5 space-y-2">
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-gw-text">
        <Plus size={12} className="text-gw-cyan" />
        新增监测井
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="space-y-0.5">
          <span className="text-[8px] text-gw-muted/60 block">井名 *</span>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="如：唐山监测站"
            className="w-full text-[10px] bg-gw-surface/40 border border-gw-border/30 rounded px-1.5 py-1 text-gw-text focus:outline-none focus:border-gw-cyan/50"
          />
        </label>
        <label className="space-y-0.5">
          <span className="text-[8px] text-gw-muted/60 block">城市</span>
          <select value={city} onChange={e => setCity(e.target.value)} className="w-full text-[10px] bg-gw-surface/40 border border-gw-border/30 rounded px-1.5 py-1 text-gw-text focus:outline-none">
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="space-y-0.5">
          <span className="text-[8px] text-gw-muted/60 block">纬度</span>
          <input type="number" value={latitude} onChange={e => setLatitude(Number(e.target.value))} step="0.01" className="w-full text-[10px] bg-gw-surface/40 border border-gw-border/30 rounded px-1.5 py-1 text-gw-text focus:outline-none" />
        </label>
        <label className="space-y-0.5">
          <span className="text-[8px] text-gw-muted/60 block">经度</span>
          <input type="number" value={longitude} onChange={e => setLongitude(Number(e.target.value))} step="0.01" className="w-full text-[10px] bg-gw-surface/40 border border-gw-border/30 rounded px-1.5 py-1 text-gw-text focus:outline-none" />
        </label>
        <label className="space-y-0.5">
          <span className="text-[8px] text-gw-muted/60 block">含水层</span>
          <select value={aquiferType} onChange={e => setAquiferType(e.target.value as AquiferType)} className="w-full text-[10px] bg-gw-surface/40 border border-gw-border/30 rounded px-1.5 py-1 text-gw-text focus:outline-none">
            {AQUIFER_TYPES.map(t => <option key={t} value={t}>{AQUIFER_LABELS[t]}</option>)}
          </select>
        </label>
        <label className="space-y-0.5">
          <span className="text-[8px] text-gw-muted/60 block">井深(m)</span>
          <input type="number" value={depth} onChange={e => setDepth(Number(e.target.value))} className="w-full text-[10px] bg-gw-surface/40 border border-gw-border/30 rounded px-1.5 py-1 text-gw-text focus:outline-none" />
        </label>
        <label className="space-y-0.5">
          <span className="text-[8px] text-gw-muted/60 block">监测指标</span>
          <select value={indicator} onChange={e => setIndicator(e.target.value as DataChannel)} className="w-full text-[10px] bg-gw-surface/40 border border-gw-border/30 rounded px-1.5 py-1 text-gw-text focus:outline-none">
            {CHANNELS.map(c => <option key={c} value={c}>{CHANNEL_LABELS[c]}</option>)}
          </select>
        </label>
        <label className="space-y-0.5">
          <span className="text-[8px] text-gw-muted/60 block">建成年份</span>
          <input type="number" value={builtYear} onChange={e => setBuiltYear(Number(e.target.value))} className="w-full text-[10px] bg-gw-surface/40 border border-gw-border/30 rounded px-1.5 py-1 text-gw-text focus:outline-none" />
        </label>
      </div>

      <div className="flex justify-end gap-1.5 pt-1">
        <button onClick={onClose} className="px-2 py-1 text-[9px] text-gw-muted hover:text-gw-text transition-colors">取消</button>
        <button onClick={handleSubmit} className="px-2.5 py-1 text-[9px] font-medium bg-gw-cyan/20 text-gw-cyan rounded hover:bg-gw-cyan/30 transition-colors">保存</button>
      </div>
    </div>
  );
}

// ── 主组件 ──

export function WellNetworkPanel() {
  const { wells, addWell, deleteWell, reset } = useWellNetwork();
  const { filters, setFilter, clearFilters } = useWellFilter(wells);
  const { report, neighbors, buffer, analyzeBuffer, getDistances } = useSpatialAnalysis(wells);
  const { selectedId, select, clear } = useWellSelection(wells);

  // 实时联动
  const { wellsWithData, allReadings, lastUpdate, isConnected } = useWellRealtime(wells, 60000);
  const rtStats = useWellRealtimeStats(wellsWithData);
  const liveTrend = useWellRealtimeTrend(selectedId, allReadings, 30);

  // 告警联动
  const { alerts: allAlerts, summary: alertSummary, filteredAlerts } = useWellAlerts(wellsWithData);
  const selectedForChannel = useMemo(
    () => wellsWithData.find(w => w.id === selectedId) ?? null,
    [wellsWithData, selectedId],
  );
  const selectedChannel = selectedForChannel?.realtime.reading?.channel ?? selectedForChannel?.indicators[0] ?? 'waterLevel';
  const { trend: historyTrend, loading: historyLoading } = useWellTrend(selectedId, selectedChannel, 24);

  const [showAdd, setShowAdd] = useState(false);
  const [showSpatial, setShowSpatial] = useState(true);
  const [showTable, setShowTable] = useState(true);
  const [rtFilter, setRtFilter] = useState<WellRealtimeStatus | 'all'>('all');
  const [showAlerts, setShowAlerts] = useState(true);
  const [alertSeverityFilter, setAlertSeverityFilter] = useState<AlertSeverity | 'all'>('all');
  const [reportStatus, setReportStatus] = useState<'idle' | 'generating' | 'done' | 'error'>('idle');
  const [reportMsg, setReportMsg] = useState('');
  const [bufferRadius, setBufferRadius] = useState(50);
  const [bufferCenter, setBufferCenter] = useState('WL-CZ-01');
  const [distances, setDistances] = useState<ReturnType<typeof getDistances>>([]);
  const [showBalance, setShowBalance] = useState(false);
  const [balancePeriodId, setBalancePeriodId] = useState<string>('2011-2020');

  // 水均衡
  const balanceResult = useWaterBalance(wells, balancePeriodId);
  const cityBalances = useCityBalance(wells, balancePeriodId);
  const balanceComparison = useBalanceComparison(wells);

  // 水质评价
  const [showQuality, setShowQuality] = useState(false);
  const { assessments: qualityAssessments, summary: qualitySummary, cityStats: qualityCityStats } = useWaterQuality(wells);
  const selectedWellQuality = useWellWaterQuality(qualityAssessments, selectedId);

  const cities = useMemo(() => Array.from(new Set(wells.map(w => w.city))).sort(), [wells]);

  // 选中井的实时数据视图
  const selectedWithData = useMemo(
    () => wellsWithData.find(w => w.id === selectedId) ?? null,
    [wellsWithData, selectedId],
  );

  // 筛选后的井（含水层等过滤 + 实时状态过滤）
  const displayWells = useMemo(() => {
    let result = wellsWithData.filter(w => {
      // 基础筛选
      if (filters.city && w.city !== filters.city) return false;
      if (filters.aquiferType && w.aquiferType !== filters.aquiferType) return false;
      if (filters.status && w.status !== filters.status) return false;
      if (filters.indicator && !w.indicators.includes(filters.indicator)) return false;
      if (filters.keyword) {
        const kw = filters.keyword.toLowerCase();
        const match = w.name.toLowerCase().includes(kw) || w.id.toLowerCase().includes(kw) || (w.district ?? '').toLowerCase().includes(kw);
        if (!match) return false;
      }
      return true;
    });
    // 实时状态过滤
    if (rtFilter !== 'all') {
      result = result.filter(w => w.realtime.status === rtFilter);
    }
    return result;
  }, [wellsWithData, filters, rtFilter]);

  const handleSelect = useCallback((id: string) => {
    select(id);
    setDistances(getDistances(id));
  }, [select, getDistances]);

  const handleBuffer = useCallback(() => {
    analyzeBuffer(bufferCenter, bufferRadius);
  }, [bufferCenter, bufferRadius, analyzeBuffer]);

  // 生成并下载报告
  const handleGenerateReport = useCallback(async () => {
    setReportStatus('generating');
    setReportMsg('正在生成报告...');
    const data = buildWellReportData(wellsWithData, allAlerts, {
      unit: '河北瑞三元环境科技有限公司',
    });
    const result = await downloadWellReport(data);
    setReportStatus(result.ok ? 'done' : 'error');
    setReportMsg(result.message);
  }, [wellsWithData, allAlerts]);

  const bufferWells = buffer?.wellsWithin ?? [];

  const abnormalCount = rtStats.warning + rtStats.critical + rtStats.stale;
  const lastUpdateText = lastUpdate
    ? new Date(lastUpdate).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '—';

  return (
    <TechCard
      title="监测井网与空间分析"
      icon={Network}
      badge={`${wells.length}井·${report?.cities.length ?? 0}市·${isConnected ? '实时' : '离线'}`}
    >
      <div className="space-y-3">
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-1.5">
          <StatCard label="监测井总数" value={wells.length} icon={MapPin} color="#06b6d4" />
          <StatCard label="覆盖城市" value={report?.cities.length ?? 0} icon={Building2} color="#10b981" />
          <StatCard label="活跃井" value={report?.activeWells ?? 0} icon={Activity} color="#2563eb" />
          <StatCard label="含水层类型" value={report?.aquiferGroups.length ?? 0} icon={Layers} color="#f59e0b" />
          <StatCard label="实时覆盖率" value={`${rtStats.coverage}%`} icon={Radio} color="#06b6d4" />
        </div>

        {/* 实时状态统计条 */}
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex items-center gap-1">
            <Radio size={11} className={isConnected ? 'text-emerald-400' : 'text-gray-400'} />
            <span className={`text-[9px] ${isConnected ? 'text-emerald-400' : 'text-gw-muted/60'}`}>
              {isConnected ? `实时 · 更新 ${lastUpdateText}` : '实时数据未连接'}
            </span>
          </div>
          <div className="flex items-center gap-1 ml-1">
            {RT_STATUSES.map(s => {
              const count = s === 'normal' ? rtStats.normal : s === 'warning' ? rtStats.warning : s === 'critical' ? rtStats.critical : rtStats.stale;
              const config = WELL_REALTIME_STATUS_CONFIG[s];
              const active = rtFilter === s;
              return (
                <button
                  key={s}
                  onClick={() => setRtFilter(active ? 'all' : s)}
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-medium transition-colors ${
                    active ? 'ring-1 ring-inset' : ''
                  }`}
                  style={{
                    backgroundColor: `${config.color}15`,
                    color: config.color,
                    ...(active ? { boxShadow: `inset 0 0 0 1px ${config.color}` } : {}),
                  }}
                >
                  {s === 'critical' || s === 'warning' ? <TriangleAlert size={8} /> : s === 'stale' ? <Clock size={8} /> : <CircleDot size={8} />}
                  {config.label}{count}
                </button>
              );
            })}
            {rtFilter !== 'all' && (
              <button onClick={() => setRtFilter('all')} className="text-[8px] text-gw-muted/50 hover:text-gw-text">
                全部
              </button>
            )}
            {abnormalCount > 0 && (
              <span className="text-[8px] text-gw-muted/50 ml-1">共 {abnormalCount} 口异常井</span>
            )}
          </div>
        </div>

        {/* 告警列表 */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className="flex items-center gap-1 text-[10px] text-gw-muted hover:text-gw-text transition-colors"
            >
              <TriangleAlert size={11} className={alertSummary.total > 0 ? 'text-amber-400' : 'text-gw-muted/60'} />
              <span>实时告警 ({alertSummary.total})</span>
              <ChevronDown size={9} className={`transition-transform ${showAlerts ? 'rotate-0' : '-rotate-90'}`} />
            </button>
            {showAlerts && alertSummary.total > 0 && (
              <div className="flex items-center gap-1">
                <select
                  value={alertSeverityFilter}
                  onChange={e => setAlertSeverityFilter(e.target.value as AlertSeverity | 'all')}
                  className="text-[8px] bg-gw-surface/40 border border-gw-border/30 rounded px-1 py-0.5 text-gw-muted focus:outline-none"
                >
                  <option value="all">全部级别</option>
                  <option value="critical">超标 ({alertSummary.critical})</option>
                  <option value="warning">预警 ({alertSummary.warning})</option>
                  <option value="stale">过期 ({alertSummary.stale})</option>
                </select>
              </div>
            )}
          </div>
          {showAlerts && (
            <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
              {alertSummary.total === 0 ? (
                <div className="text-center text-[10px] text-gw-muted/50 py-2">暂无告警，数据质量正常</div>
              ) : (
                filteredAlerts.map(a => {
                  const cfg = ALERT_SEVERITY_CONFIG[a.severity];
                  return (
                    <button
                      key={`${a.wellId}-${a.channel}-${a.timestamp}`}
                      onClick={() => handleSelect(a.wellId)}
                      className={`w-full text-left px-2 py-1.5 rounded border ${cfg.bg} ${cfg.border} hover:brightness-110 transition-all`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8px] px-1 rounded font-medium" style={{ backgroundColor: cfg.color, color: '#fff' }}>{cfg.label}</span>
                        <span className="text-[10px] font-medium text-gw-text">{a.wellName}</span>
                        <span className="text-[8px] text-gw-muted/50">{a.city}</span>
                        <span className="text-[8px] text-gw-muted/40 font-mono ml-auto">{CHANNEL_LABELS[a.channel]}</span>
                      </div>
                      <div className="text-[8px] text-gw-muted/70 mt-0.5 pl-1">
                        {a.severity === 'stale' ? '数据过期，无最新读数' : formatAlertThreshold(a)}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* 井点分布图 */}
        <WellMap wells={wellsWithData} selectedId={selectedId} onSelect={handleSelect} />

        {/* 筛选栏 */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Filter size={11} className="text-gw-muted/60" />
          <select value={filters.city ?? ''} onChange={e => setFilter({ city: e.target.value || undefined })} className="text-[9px] bg-gw-surface/40 border border-gw-border/30 rounded px-1.5 py-0.5 text-gw-muted focus:outline-none">
            <option value="">全部城市</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filters.aquiferType ?? ''} onChange={e => setFilter({ aquiferType: (e.target.value || undefined) as AquiferType | undefined })} className="text-[9px] bg-gw-surface/40 border border-gw-border/30 rounded px-1.5 py-0.5 text-gw-muted focus:outline-none">
            <option value="">全部含水层</option>
            {AQUIFER_TYPES.map(t => <option key={t} value={t}>{AQUIFER_LABELS[t]}</option>)}
          </select>
          <select value={filters.status ?? ''} onChange={e => setFilter({ status: (e.target.value || undefined) as WellStatus | undefined })} className="text-[9px] bg-gw-surface/40 border border-gw-border/30 rounded px-1.5 py-0.5 text-gw-muted focus:outline-none">
            <option value="">全部状态</option>
            {STATUSES.map(s => <option key={s} value={s}>{WELL_STATUS_LABELS[s]}</option>)}
          </select>
          <div className="flex items-center gap-0.5 flex-1 min-w-32">
            <Search size={10} className="text-gw-muted/40" />
            <input value={filters.keyword ?? ''} onChange={e => setFilter({ keyword: e.target.value || undefined })} placeholder="搜索井名/编号/区县" className="flex-1 text-[9px] bg-gw-surface/40 border border-gw-border/30 rounded px-1.5 py-0.5 text-gw-muted focus:outline-none" />
          </div>
          {(filters.city || filters.aquiferType || filters.status || filters.keyword) && (
            <button onClick={clearFilters} className="text-[8px] text-gw-muted/50 hover:text-gw-text">清空</button>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1 px-2 py-1 text-[9px] font-medium bg-gw-cyan/20 text-gw-cyan rounded hover:bg-gw-cyan/30 transition-colors">
            <Plus size={11} />新增井
          </button>
          <button onClick={reset} className="flex items-center gap-1 px-2 py-1 text-[9px] text-gw-muted hover:text-gw-text transition-colors">
            <RefreshCw size={11} />重置
          </button>
          <button onClick={() => setShowSpatial(!showSpatial)} className="flex items-center gap-1 px-2 py-1 text-[9px] text-gw-muted hover:text-gw-text transition-colors">
            <Layers size={11} />空间分析
            <ChevronDown size={9} className={`transition-transform ${showSpatial ? 'rotate-0' : '-rotate-90'}`} />
          </button>
          <button onClick={() => setShowTable(!showTable)} className="flex items-center gap-1 px-2 py-1 text-[9px] text-gw-muted hover:text-gw-text transition-colors">
            <Crosshair size={11} />井列表({displayWells.length})
            <ChevronDown size={9} className={`transition-transform ${showTable ? 'rotate-0' : '-rotate-90'}`} />
          </button>
          <button
            onClick={handleGenerateReport}
            disabled={reportStatus === 'generating'}
            className="flex items-center gap-1 px-2 py-1 text-[9px] font-medium bg-gw-cyan/20 text-gw-cyan rounded hover:bg-gw-cyan/30 transition-colors disabled:opacity-50 ml-auto"
            title="生成并下载 Word 报告"
          >
            <FileDown size={11} />
            {reportStatus === 'generating' ? '生成中...' : '生成报告'}
          </button>
        </div>

        {/* 报告状态提示 */}
        {reportStatus !== 'idle' && (
          <div className={`text-[9px] px-2 py-1 rounded ${reportStatus === 'done' ? 'bg-emerald-500/10 text-emerald-400' : reportStatus === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-gw-cyan/10 text-gw-cyan'}`}>
            {reportMsg}
          </div>
        )}

        {/* 新增表单 */}
        {showAdd && <AddWellForm onAdd={addWell} onClose={() => setShowAdd(false)} />}

        {/* 井列表 */}
        {showTable && (
          <WellTable wells={displayWells} selectedId={selectedId} onSelect={handleSelect} onDelete={id => { deleteWell(id); if (selectedId === id) clear(); }} />
        )}

        {/* 空间分析 */}
        {showSpatial && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5">
              {report?.aquiferGroups.map(group => (
                <div key={group.aquiferType} className="px-2 py-1.5 rounded-lg bg-gw-surface/20 border border-gw-border/10">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[9px] text-gw-muted">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: AQUIFER_COLORS[group.aquiferType] }} />
                      {AQUIFER_LABELS[group.aquiferType]}
                    </span>
                    <span className="text-[11px] font-bold font-mono" style={{ color: AQUIFER_COLORS[group.aquiferType] }}>{group.count}</span>
                  </div>
                  <div className="text-[8px] text-gw-muted/50 mt-0.5">平均井深 {group.avgDepth}m · 活跃{group.activeCount}</div>
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-center gap-1 mb-1">
                <Building2 size={10} className="text-gw-muted/60" />
                <span className="text-[9px] font-medium text-gw-muted">城市分布</span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-1">
                {report?.cityGroups.slice(0, 8).map(group => (
                  <div key={group.city} className="px-2 py-1 rounded bg-gw-surface/20 border border-gw-border/10">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-gw-muted">{group.city}</span>
                      <span className="text-[10px] font-bold font-mono text-gw-cyan">{group.count}</span>
                    </div>
                    <div className="flex gap-1 mt-1">
                      {Object.entries(group.aquiferDistribution).map(([type, count]) => (
                        <span key={type} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: AQUIFER_COLORS[type as AquiferType], opacity: 0.4 + ((count ?? 1) / 6) * 0.6 }} title={`${AQUIFER_LABELS[type as AquiferType]}: ${count}`} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1 mb-1">
                <CircleDot size={10} className="text-gw-muted/60" />
                <span className="text-[9px] font-medium text-gw-muted">最近邻分析 · 平均间距 {report?.avgNearestDistance ?? 0}km · 最小 {report?.minPairDistance ?? 0}km · 最大 {report?.maxPairDistance ?? 0}km</span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-1 max-h-32 overflow-y-auto">
                {neighbors.slice(0, 18).map(n => (
                  <div key={n.wellId} className="flex items-center justify-between px-1.5 py-0.5 rounded bg-gw-surface/20 border border-gw-border/10">
                    <div className="flex items-center gap-1 min-w-0">
                      <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: AQUIFER_COLORS[n.aquiferType] }} />
                      <span className="text-[8px] text-gw-muted truncate">{n.wellName}</span>
                    </div>
                    <span className="text-[8px] font-mono text-gw-cyan flex-shrink-0">→{n.nearestDistanceKm}km</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1 mb-1">
                <Ruler size={10} className="text-gw-muted/60" />
                <span className="text-[9px] font-medium text-gw-muted">缓冲区分析</span>
              </div>
              <div className="flex items-center gap-1.5">
                <select value={bufferCenter} onChange={e => setBufferCenter(e.target.value)} className="text-[9px] bg-gw-surface/40 border border-gw-border/30 rounded px-1.5 py-0.5 text-gw-muted focus:outline-none">
                  {wells.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
                <input type="number" value={bufferRadius} onChange={e => setBufferRadius(Number(e.target.value))} className="w-16 text-[9px] bg-gw-surface/40 border border-gw-border/30 rounded px-1.5 py-0.5 text-gw-muted focus:outline-none" />
                <span className="text-[8px] text-gw-muted/60">km</span>
                <button onClick={handleBuffer} className="px-2 py-0.5 text-[9px] font-medium bg-gw-cyan/20 text-gw-cyan rounded hover:bg-gw-cyan/30 transition-colors">分析</button>
                {buffer && <span className="text-[8px] text-gw-muted/70 ml-auto">{buffer.centerName} {buffer.radiusKm}km 内 {bufferWells.length} 口井</span>}
              </div>
              {bufferWells.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {bufferWells.map(w => (
                    <span key={w.id} className="text-[8px] px-1.5 py-0.5 rounded bg-gw-surface/30 border border-gw-border/20 text-gw-muted">{w.name}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 水均衡分析 */}
        <div className="border-t border-gw-border/10 pt-2 mt-2">
          <div className="flex items-center justify-between mb-1">
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="flex items-center gap-1 text-[10px] text-gw-muted hover:text-gw-text transition-colors"
            >
              <Droplets size={11} className={balanceResult.isOverdrafted ? 'text-red-400' : 'text-gw-cyan'} />
              <span>水均衡分析 · {balanceResult.period.periodLabel}</span>
              <span className={`text-[8px] font-mono px-1 rounded ${balanceResult.isOverdrafted ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {balanceResult.isOverdrafted ? `超采${Math.abs(balanceResult.period.balance).toFixed(1)}亿m³` : `盈余${balanceResult.period.balance.toFixed(1)}亿m³`}
              </span>
              <ChevronDown size={9} className={`transition-transform ml-auto ${showBalance ? 'rotate-0' : '-rotate-90'}`} />
            </button>
          </div>

          {showBalance && (
            <div className="space-y-2">
              {/* 时段选择 */}
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] text-gw-muted/60">时段:</span>
                {balanceComparison.periods.map(p => (
                  <button
                    key={p.periodId}
                    onClick={() => setBalancePeriodId(p.periodId)}
                    className={`text-[8px] px-1.5 py-0.5 rounded transition-colors ${
                      balancePeriodId === p.periodId
                        ? 'bg-gw-cyan/20 text-gw-cyan'
                        : 'text-gw-muted/60 hover:text-gw-muted'
                    }`}
                  >
                    {p.periodLabel}
                  </button>
                ))}
              </div>

              {/* 统计卡片 */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5">
                <div className="px-2 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="text-[8px] text-blue-300/70">总补给量</div>
                  <div className="text-[12px] font-bold font-mono text-blue-400">{balanceResult.period.totalRecharge.toFixed(2)}</div>
                  <div className="text-[7px] text-blue-300/50">亿m³/a</div>
                </div>
                <div className="px-2 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="text-[8px] text-red-300/70">总排泄量</div>
                  <div className="text-[12px] font-bold font-mono text-red-400">{balanceResult.period.totalDischarge.toFixed(2)}</div>
                  <div className="text-[7px] text-red-300/50">亿m³/a</div>
                </div>
                <div className={`px-2 py-1.5 rounded-lg border ${balanceResult.isOverdrafted ? 'bg-orange-500/10 border-orange-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                  <div className="text-[8px] text-gw-muted/70">均衡差</div>
                  <div className={`text-[12px] font-bold font-mono ${balanceResult.isOverdrafted ? 'text-orange-400' : 'text-emerald-400'}`}>
                    {balanceResult.period.balance > 0 ? '+' : ''}{balanceResult.period.balance.toFixed(2)}
                  </div>
                  <div className="text-[7px] text-gw-muted/50">亿m³/a</div>
                </div>
                <div className="px-2 py-1.5 rounded-lg bg-gw-surface/20 border border-gw-border/10">
                  <div className="text-[8px] text-gw-muted/70">储量变化</div>
                  <div className="text-[12px] font-bold font-mono text-gw-muted">{balanceResult.period.storageChange.toFixed(2)}</div>
                  <div className="text-[7px] text-gw-muted/50">亿m³/a</div>
                </div>
              </div>

              {/* 补给项明细 */}
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <TrendingUp size={10} className="text-blue-400" />
                  <span className="text-[9px] font-medium text-gw-muted">补给项构成</span>
                </div>
                <div className="space-y-0.5">
                  {balanceResult.sortedRecharge.map(item => {
                    const meta = RECHARGE_META[item.id as keyof typeof RECHARGE_META];
                    return (
                      <div key={item.id} className="flex items-center gap-1.5">
                        <span className="text-[8px] text-gw-muted w-16 truncate flex-shrink-0" title={meta?.label}>{meta?.shortLabel ?? item.label}</span>
                        <div className="flex-1 h-2.5 rounded bg-gw-surface/30 overflow-hidden">
                          <div
                            className="h-full rounded transition-all duration-300"
                            style={{ width: `${item.percent}%`, backgroundColor: '#06b6d4' }}
                          />
                        </div>
                        <span className="text-[8px] font-mono text-gw-muted w-16 text-right flex-shrink-0">{item.value.toFixed(2)}</span>
                        <span className="text-[7px] text-gw-muted/50 w-10 text-right flex-shrink-0">{item.percent.toFixed(1)}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 排泄项明细 */}
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <TrendingDown size={10} className="text-red-400" />
                  <span className="text-[9px] font-medium text-gw-muted">排泄项构成</span>
                </div>
                <div className="space-y-0.5">
                  {balanceResult.sortedDischarge.map(item => {
                    const meta = DISCHARGE_META[item.id as keyof typeof DISCHARGE_META];
                    return (
                      <div key={item.id} className="flex items-center gap-1.5">
                        <span className="text-[8px] text-gw-muted w-16 truncate flex-shrink-0" title={meta?.label}>{meta?.shortLabel ?? item.label}</span>
                        <div className="flex-1 h-2.5 rounded bg-gw-surface/30 overflow-hidden">
                          <div
                            className="h-full rounded transition-all duration-300"
                            style={{ width: `${item.percent}%`, backgroundColor: '#ef4444' }}
                          />
                        </div>
                        <span className="text-[8px] font-mono text-gw-muted w-16 text-right flex-shrink-0">{item.value.toFixed(2)}</span>
                        <span className="text-[7px] text-gw-muted/50 w-10 text-right flex-shrink-0">{item.percent.toFixed(1)}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 市均衡表 */}
              {cityBalances.length > 0 && (
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Building2 size={10} className="text-gw-muted/60" />
                    <span className="text-[9px] font-medium text-gw-muted">市均衡分析 · {cityBalances.length}市</span>
                    <span className="text-[8px] text-gw-muted/50 ml-auto">按亏损排序</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-0.5 pr-1">
                    {cityBalances.map(cb => (
                      <div
                        key={cb.city}
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] cursor-pointer transition-colors ${
                          cb.isOverdrafted ? 'bg-red-500/5 hover:bg-red-500/10' : 'bg-emerald-500/5 hover:bg-emerald-500/10'
                        }`}
                        onClick={() => {
                          const w = wells.find(w => w.city === cb.city);
                          if (w) handleSelect(w.id);
                        }}
                      >
                        <span className="w-14 font-medium text-gw-text truncate">{cb.city}</span>
                        <span className="text-gw-muted/70 w-12 text-right font-mono">{cb.recharge.toFixed(2)}</span>
                        <span className="text-gw-muted/50">/</span>
                        <span className="text-gw-muted/70 w-12 text-right font-mono">{cb.discharge.toFixed(2)}</span>
                        <span className={`w-14 text-right font-bold font-mono ${cb.isOverdrafted ? 'text-red-400' : 'text-emerald-400'}`}>
                          {cb.balance > 0 ? '+' : ''}{cb.balance.toFixed(2)}
                        </span>
                        {cb.factor && <span className="text-[7px] text-gw-muted/50 ml-auto">{cb.factor}</span>}
                        {cb.wellCount > 0 && <span className="text-[7px] text-gw-muted/40">{cb.wellCount}井</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 多时段趋势 */}
              {balanceComparison.periods.length > 1 && (
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <BarChart3 size={10} className="text-gw-muted/60" />
                    <span className="text-[9px] font-medium text-gw-muted">多时段对比</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {balanceComparison.periods.map(p => {
                      const isCurrent = p.periodId === balancePeriodId;
                      return (
                        <div
                          key={p.periodId}
                          className={`px-1.5 py-1 rounded border cursor-pointer transition-all ${
                            isCurrent ? 'border-gw-cyan/30 bg-gw-cyan/5' : 'border-gw-border/10 bg-gw-surface/20'
                          }`}
                          onClick={() => setBalancePeriodId(p.periodId)}
                        >
                          <div className="text-[7px] text-gw-muted/60">{p.periodLabel}</div>
                          <div className="text-[9px] font-bold font-mono mt-0.5">
                            <span className={p.balance < 0 ? 'text-red-400' : 'text-emerald-400'}>
                              {p.balance > 0 ? '+' : ''}{p.balance.toFixed(1)}
                            </span>
                          </div>
                          <div className="text-[7px] text-gw-muted/50">补{p.totalRecharge.toFixed(0)} / 排{p.totalDischarge.toFixed(0)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 备注 */}
              {balanceResult.period.note && (
                <div className="text-[8px] text-gw-muted/50 italic px-1 py-0.5 rounded bg-gw-surface/20">
                  {balanceResult.period.note}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 水质综合评价 */}
        <div className="border-t border-gw-border/10 pt-2 mt-2">
          <div className="flex items-center justify-between mb-1">
            <button
              onClick={() => setShowQuality(!showQuality)}
              className="flex items-center gap-1 text-[10px] text-gw-muted hover:text-gw-text transition-colors"
            >
              <Droplets size={11} className={qualitySummary.exceededSites > 0 ? 'text-orange-400' : 'text-emerald-400'} />
              <span>水质综合评价 · GB/T 14848-2017</span>
              <span className={`text-[8px] font-mono px-1 rounded ${qualitySummary.exceedRate > 50 ? 'bg-red-500/20 text-red-400' : qualitySummary.exceedRate > 0 ? 'bg-orange-500/20 text-orange-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {qualitySummary.totalSites > 0 ? `超标${qualitySummary.exceedRate}%` : '无数据'}
              </span>
              <ChevronDown size={9} className={`transition-transform ml-auto ${showQuality ? 'rotate-0' : '-rotate-90'}`} />
            </button>
          </div>

          {showQuality && (
            <div className="space-y-2">
              {/* 水质类别分布 */}
              {qualitySummary.totalSites > 0 ? (
                <>
                  <div className="grid grid-cols-5 gap-1">
                    {([1, 2, 3, 4, 5] as const).map(cls => {
                      const cfg = WATER_CLASS_LABELS[cls];
                      const count = qualitySummary.classDistribution[cls] ?? 0;
                      const pct = qualitySummary.totalSites > 0 ? (count / qualitySummary.totalSites) * 100 : 0;
                      return (
                        <div key={cls} className="px-1.5 py-1 rounded text-center" style={{ backgroundColor: `${cfg.color}15`, border: `1px solid ${cfg.color}30` }}>
                          <div className="text-[10px] font-bold" style={{ color: cfg.color }}>{cfg.label}</div>
                          <div className="text-[11px] font-bold font-mono text-gw-text">{count}</div>
                          <div className="text-[7px] text-gw-muted/50">{pct.toFixed(0)}%</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 主要超标因子 */}
                  {qualitySummary.topFactors.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <TriangleAlert size={10} className="text-orange-400" />
                        <span className="text-[9px] font-medium text-gw-muted">主要超标因子（前5）</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {qualitySummary.topFactors.slice(0, 5).map(f => (
                          <span key={f.indicator} className="text-[8px] px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400">
                            {f.label} {f.count}站({f.rate}%)
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 苏卡列夫类型分布 */}
                  {Object.keys(qualitySummary.sulinDistribution).length > 0 && (
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Layers size={10} className="text-gw-muted/60" />
                        <span className="text-[9px] font-medium text-gw-muted">水化学类型分布</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(qualitySummary.sulinDistribution)
                          .sort(([, a], [, b]) => b - a)
                          .slice(0, 6)
                          .map(([type, count]) => (
                            <span key={type} className="text-[8px] px-1.5 py-0.5 rounded bg-gw-surface/30 border border-gw-border/20 text-gw-muted">
                              {type} {count}站
                            </span>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* 市水质统计 */}
                  {qualityCityStats.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Building2 size={10} className="text-gw-muted/60" />
                        <span className="text-[9px] font-medium text-gw-muted">市水质统计 · {qualityCityStats.length}市</span>
                      </div>
                      <div className="max-h-40 overflow-y-auto space-y-0.5 pr-1">
                        {qualityCityStats.map(cs => (
                          <div
                            key={cs.city}
                            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] bg-gw-surface/20 border border-gw-border/10 cursor-pointer hover:bg-gw-surface/30 transition-colors"
                            onClick={() => {
                              const w = wells.find(w => w.city === cs.city);
                              if (w) handleSelect(w.id);
                            }}
                          >
                            <span className="w-12 font-medium text-gw-text truncate">{cs.city}</span>
                            <div className="flex items-center gap-0.5">
                              {([1, 2, 3, 4, 5] as const).map(cls => {
                                const count = cs.classDistribution[cls] ?? 0;
                                return count > 0 ? (
                                  <span key={cls} className="text-[7px] px-0.5 rounded" style={{ backgroundColor: `${WATER_CLASS_LABELS[cls].color}30`, color: WATER_CLASS_LABELS[cls].color }}>
                                    {WATER_CLASS_LABELS[cls].label}{count}
                                  </span>
                                ) : null;
                              })}
                            </div>
                            <span className="ml-auto text-gw-muted/50">{cs.siteCount}站</span>
                            {cs.exceededSites > 0 && <span className="text-red-400 font-medium">{cs.exceededSites}站超标</span>}
                            {cs.mainFactors.length > 0 && <span className="text-gw-muted/40">{cs.mainFactors.slice(0, 2).join('、')}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 选中井水质详情 */}
                  {selectedWellQuality && (
                    <div className="border border-gw-cyan/30 rounded-lg bg-gw-surface/10 p-2 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <CircleDot size={11} className="text-gw-cyan" />
                          <span className="text-[10px] font-medium text-gw-text">{selectedWellQuality.stationName}</span>
                          <span className="text-[8px] text-gw-muted/50">{selectedWellQuality.city}</span>
                          <span
                            className="text-[8px] px-1 rounded font-medium"
                            style={{ backgroundColor: `${WATER_CLASS_LABELS[selectedWellQuality.comprehensiveClass].color}25`, color: WATER_CLASS_LABELS[selectedWellQuality.comprehensiveClass].color }}
                          >
                            {WATER_CLASS_LABELS[selectedWellQuality.comprehensiveClass].label} · {selectedWellQuality.comprehensiveLabel}
                          </span>
                        </div>
                      </div>

                      {selectedWellQuality.sulin && (
                        <div className="text-[8px] text-gw-muted/70">
                          水化学类型: {selectedWellQuality.sulin.fullName}
                        </div>
                      )}

                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-1">
                        {selectedWellQuality.indicators.slice(0, 12).map(ind => {
                          const cls = WATER_CLASS_LABELS[ind.class];
                          return (
                            <div key={ind.indicator} className="flex items-center gap-1 px-1 py-0.5 rounded bg-gw-surface/20 border border-gw-border/10">
                              <span className="text-[7px] w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: cls.color }} />
                              <span className="text-[7px] text-gw-muted w-10 truncate">{ind.label}</span>
                              <span className="text-[7px] font-mono text-gw-muted flex-1 text-right">{ind.value}{ind.unit}</span>
                              <span className="text-[7px] font-medium" style={{ color: cls.color }}>{cls.label}</span>
                              {ind.isExceeded && <TriangleAlert size={7} className="text-red-400 flex-shrink-0" />}
                            </div>
                          );
                        })}
                      </div>

                      {selectedWellQuality.exceededCount > 0 && (
                        <div className="text-[8px] text-red-400/80 bg-red-500/10 px-1.5 py-0.5 rounded">
                          超标因子 {selectedWellQuality.exceededCount} 项：
                          {selectedWellQuality.exceededFactors.map(f => f.label).join('、')}
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center text-[10px] text-gw-muted/50 py-2">
                  当前井网中无水质监测井（indicators 不含 waterQuality）
                </div>
              )}
            </div>
          )}
        </div>

        {/* 选中井详情 */}
        {selectedWithData && (
          <div className="border border-gw-cyan/30 rounded-lg bg-gw-surface/10 p-2 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <CircleDot size={12} className="text-gw-cyan" />
                <span className="text-[11px] font-medium text-gw-text">{selectedWithData.name}</span>
                <span className="text-[8px] text-gw-muted/50 font-mono">{selectedWithData.id}</span>
                <RealtimeStatusBadge status={selectedWithData.realtime.status} />
              </div>
              <button onClick={clear} className="text-[8px] text-gw-muted/50 hover:text-gw-text">关闭</button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 text-[8px] text-gw-muted">
              <div>城市: <span className="text-gw-text">{selectedWithData.city}</span></div>
              <div>含水层: <span className="text-gw-text">{AQUIFER_LABELS[selectedWithData.aquiferType]}</span></div>
              <div>井深: <span className="text-gw-text font-mono">{selectedWithData.depth}m</span></div>
              <div>坐标: <span className="text-gw-text font-mono">{selectedWithData.latitude},{selectedWithData.longitude}</span></div>
            </div>

            {/* 实时值详情 */}
            {selectedWithData.realtime.reading ? (
              <div className="flex items-center gap-3">
                <div className="text-[16px] font-bold font-mono" style={{ color: WELL_REALTIME_STATUS_CONFIG[selectedWithData.realtime.status].color }}>
                  {selectedWithData.realtime.value?.toFixed(2)}{selectedWithData.realtime.unit}
                </div>
                <div className="text-[8px] text-gw-muted/60">
                  <div>通道: {CHANNEL_LABELS[selectedWithData.realtime.reading.channel]}</div>
                  <div>质量: {selectedWithData.realtime.quality}</div>
                </div>
              </div>
            ) : (
              <div className="text-[9px] text-gw-muted/50">暂无实时数据</div>
            )}

            {/* 实时趋势（会话内） */}
            {liveTrend.length >= 2 && (
              <div className="flex items-center gap-2">
                <TrendSparkline readings={liveTrend} color={WELL_REALTIME_STATUS_CONFIG[selectedWithData.realtime.status].color} />
                <div className="text-[8px] text-gw-muted/50">
                  <div>实时 {liveTrend.length} 点</div>
                  <div>当前 {selectedWithData.realtime.value?.toFixed(2)}{selectedWithData.realtime.unit}</div>
                </div>
              </div>
            )}

            {/* 历史趋势（缓存持久化 24h） */}
            {historyLoading ? (
              <div className="text-[8px] text-gw-muted/50">正在加载历史趋势...</div>
            ) : historyTrend && historyTrend.count >= 2 ? (
              <div className="border-t border-gw-border/10 pt-1.5 mt-1">
                <div className="flex items-center gap-1 mb-1">
                  <Clock size={10} className="text-gw-muted/60" />
                  <span className="text-[8px] font-medium text-gw-muted">历史趋势 (24h · {historyTrend.count}点)</span>
                  {historyTrend.trendDirection === 1 && <span className="text-[8px] text-red-400">↑ 上升</span>}
                  {historyTrend.trendDirection === -1 && <span className="text-[8px] text-cyan-400">↓ 下降</span>}
                  {historyTrend.trendDirection === 0 && <span className="text-[8px] text-gw-muted/50">→ 平稳</span>}
                  {historyTrend.hasCritical && <span className="text-[8px] px-1 rounded bg-red-500/20 text-red-400">含超标</span>}
                </div>
                <div className="flex items-center gap-2">
                  <TrendSparkline readings={historyTrend.points} color={WELL_REALTIME_STATUS_CONFIG[selectedWithData.realtime.status].color} />
                  <div className="text-[8px] text-gw-muted/50 leading-relaxed">
                    <div>均值 {historyTrend.mean}{selectedWithData.realtime.unit}</div>
                    <div>范围 {historyTrend.min}~{historyTrend.max}{selectedWithData.realtime.unit}</div>
                    {historyTrend.delta !== null && <div>变化 {historyTrend.delta > 0 ? '+' : ''}{historyTrend.delta}{selectedWithData.realtime.unit}</div>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-[8px] text-gw-muted/40">暂无历史数据</div>
            )}

            {distances.length > 0 && (
              <div className="mt-1">
                <div className="text-[8px] text-gw-muted/60 mb-0.5">最近邻井：</div>
                <div className="flex flex-wrap gap-1">
                  {distances.slice(0, 5).map(d => (
                    <span key={d.wellId} className="text-[8px] px-1.5 py-0.5 rounded bg-gw-surface/30 border border-gw-border/20 text-gw-muted">
                      {d.wellName} <span className="font-mono text-gw-cyan">{d.distanceKm}km</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </TechCard>
  );
}