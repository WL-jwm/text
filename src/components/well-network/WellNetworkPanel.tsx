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

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Network,
  MapPin,
  Plus,
  Search,
  Crosshair,
  Layers,
  Building2,
  Filter,
  RefreshCw,
  ChevronDown,
  Ruler,
  Activity,
  CircleDot,
  Radio,
  TriangleAlert,
  Clock,
  Bell,
  FileDown,
  Download,
  Upload,
  Droplets,
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
import { useWaterQuality, useWellWaterQuality } from '../../hooks/useWaterQuality';
import { WATER_CLASS_LABELS } from '../../services/waterQuality';
import { getDefaultExportOptions, exportData } from '../../services/dataExporter';
import type { ExportFormat, ExportSheet } from '../../services/dataExporter';
import { DataSourceConfigManager, DEFAULT_CHANNELS, testConnection } from '../../services/dataSourceConfigManager';
import type { DataSourceConfig } from '../../services/dataSourceConfigManager';
import type { ImportPreviewRow } from '../../services/dataImporter';
import { previewImport, importWells } from '../../services/dataImporter';
import { buildSpatialOptimization } from '../../services/spatialOptimizer';
import { downloadWellReportPdf } from '../../services/wellReportPdf';
import { downloadWellReportExcel } from '../../services/wellReportExcel';
import { useIntegratedAnalysis } from '../../hooks/useWaterQualityBalance';
import {
  AQUIFER_LABELS,
  WELL_STATUS_LABELS,
} from '../../services/wellNetwork';
import { WELL_REALTIME_STATUS_CONFIG } from '../../services/wellRealtime';
import { ALERT_SEVERITY_CONFIG, formatAlertThreshold } from '../../services/wellAlerts';
import type { AlertSeverity } from '../../services/wellAlerts';
import { AlertNotifier, buildAlertTimeline } from '../../services/alertNotifier';
import type { AlertTimeline, NotificationConfig } from '../../services/alertNotifier';
import { downloadWellReport } from '../../services/wellReportDocx';
import { buildWellReportData } from '../../services/wellReport';
import type { AquiferType, WellStatus } from '../../services/wellNetwork';
import type { WellRealtimeStatus } from '../../services/wellRealtime';


// ── 子组件与共享常量（自 WellNetworkPanel 拆分）──
import { BalancePanel } from './BalancePanel';

import { CHANNEL_LABELS, AQUIFER_COLORS, AQUIFER_TYPES, STATUSES, RT_STATUSES } from './constants';
import { WellMap } from './WellMap';
import { StatCard } from './StatCard';
import { RealtimeStatusBadge } from './RealtimeStatusBadge';
import { WellTable } from './WellTable';
import { TrendSparkline } from './TrendSparkline';
import { AddWellForm } from './AddWellForm';

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
  const [alertNotifier] = useState(() => new AlertNotifier());
  const [alertTimeline, setAlertTimeline] = useState<AlertTimeline>({ entries: [], unreadCount: 0, stats24h: { critical: 0, warning: 0, stale: 0, total: 0 } });
  const [showNotifyConfig, setShowNotifyConfig] = useState(false);
  const [notifyConfig, setNotifyConfig] = useState<NotificationConfig>({ browserNotify: true, soundAlert: true, criticalOnly: false, throttleMs: 60000 });

  // 构建告警时间线
  useEffect(() => {
    const wellNames: Record<string, string> = {};
    for (const w of wells) {
      wellNames[w.id] = w.name;
    }
    const timeline = buildAlertTimeline(allAlerts, wellNames);
    setAlertTimeline(timeline);
    alertNotifier.checkAndNotify(allAlerts, wellNames);
  }, [allAlerts, wells, alertNotifier]);

  const [reportStatus, setReportStatus] = useState<'idle' | 'generating' | 'done' | 'error'>('idle');
  const [reportMsg, setReportMsg] = useState('');
  const [reportFormat, setReportFormat] = useState<'docx' | 'pdf' | 'xlsx'>('docx');
  const [showReportFormatMenu, setShowReportFormatMenu] = useState(false);
  const [bufferRadius, setBufferRadius] = useState(50);
  const [bufferCenter, setBufferCenter] = useState('WL-CZ-01');
  const [distances, setDistances] = useState<ReturnType<typeof getDistances>>([]);

  // 空间优化建议
  const spatialOptimization = useMemo(
    () => buildSpatialOptimization(wells, report ?? { totalWells: 0, activeWells: 0, cities: [], aquiferGroups: [], cityGroups: [], avgNearestDistance: 0, minPairDistance: 0, maxPairDistance: 0 }, neighbors),
    [wells, report, neighbors],
  );

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

  // 均衡-水质联动
  const [showIntegrated, setShowIntegrated] = useState(false);
  const integratedAnalysis = useIntegratedAnalysis(cityBalances, qualityCityStats);

  // 数据共享与对接
  const [showSharing, setShowSharing] = useState(false);
  const [configMgr] = useState(() => new DataSourceConfigManager());
  const [dsConfigs, setDsConfigs] = useState<DataSourceConfig[]>([]);
  const [showAddDs, setShowAddDs] = useState(false);
  const [dsName, setDsName] = useState('');
  const [dsType, setDsType] = useState<'http' | 'ws'>('http');
  const [dsEndpoint, setDsEndpoint] = useState('');
  const [dsTestResult, setDsTestResult] = useState<string | null>(null);
  const [dsTesting, setDsTesting] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [importPreview, setImportPreview] = useState<{ headers: string[]; previewRows: ImportPreviewRow[]; error?: string } | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // 初始化配置列表
  useEffect(() => {
    setDsConfigs(configMgr.getAll());
    const unsub = configMgr.subscribe(() => setDsConfigs([...configMgr.getAll()]));
    return unsub;
  }, [configMgr]);

  // 数据导出
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'done'>('idle');

  const handleExport = useCallback(async (format: ExportFormat) => {
    setExportStatus('exporting');
    setShowExportMenu(false);
    try {
      const allSheets = ['wells', 'readings', 'alerts', 'balance', 'quality', 'integrated'] as ExportSheet[];
      const options = getDefaultExportOptions(
        {
          wells,
          alerts: allAlerts,
          balanceResult,
          cityBalances,
          qualityAssessments,
          qualitySummary,
          qualityCityStats,
          integratedAnalysis,
        },
        format,
      );
      options.sheets = allSheets;
      await exportData(options);
      setExportStatus('done');
    } catch (err) {
      console.error('导出失败:', err);
      setExportStatus('idle');
    }
    setTimeout(() => setExportStatus('idle'), 3000);
  }, [wells, allAlerts, balanceResult, cityBalances, qualityAssessments, qualitySummary, qualityCityStats, integratedAnalysis]);

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
        {/* 通知设置 */}
        {showNotifyConfig && (
          <div className="px-1.5 py-1 rounded-lg bg-gw-surface/20 border border-gw-border/10 mb-2">
            <div className="flex items-center gap-1 mb-1">
              <Bell size={9} className="text-gw-muted/60" />
              <span className="text-[9px] font-medium text-gw-muted">通知设置</span>
            </div>
            <div className="space-y-1">
              <label className="flex items-center gap-1.5 text-[8px] text-gw-muted cursor-pointer">
                <input type="checkbox" checked={notifyConfig.browserNotify} onChange={e => { const newConfig = { ...notifyConfig, browserNotify: e.target.checked }; setNotifyConfig(newConfig); alertNotifier.updateConfig(newConfig); }} className="accent-gw-cyan" />
                浏览器通知
              </label>
              <label className="flex items-center gap-1.5 text-[8px] text-gw-muted cursor-pointer">
                <input type="checkbox" checked={notifyConfig.soundAlert} onChange={e => { const newConfig = { ...notifyConfig, soundAlert: e.target.checked }; setNotifyConfig(newConfig); alertNotifier.updateConfig(newConfig); }} className="accent-gw-cyan" />
                声音提醒
              </label>
              <label className="flex items-center gap-1.5 text-[8px] text-gw-muted cursor-pointer">
                <input type="checkbox" checked={notifyConfig.criticalOnly} onChange={e => { const newConfig = { ...notifyConfig, criticalOnly: e.target.checked }; setNotifyConfig(newConfig); alertNotifier.updateConfig(newConfig); }} className="accent-gw-cyan" />
                仅严重告警
              </label>
            </div>
          </div>
        )}

        {/* 告警时间线 */}
        {showAlerts && alertTimeline.entries.length > 0 && (
          <div className="px-1.5 py-1 rounded-lg bg-gw-surface/20 border border-gw-border/10 mb-2">
            <div className="flex items-center gap-1 mb-1">
              <Clock size={9} className="text-gw-muted/60" />
              <span className="text-[9px] font-medium text-gw-muted">告警时间线（最近24h）</span>
              <span className="text-[8px] text-gw-muted/50 ml-auto">
                {alertTimeline.stats24h.critical > 0 && <span className="text-red-400">严重{alertTimeline.stats24h.critical} </span>}
                {alertTimeline.stats24h.warning > 0 && <span className="text-amber-400">预警{alertTimeline.stats24h.warning} </span>}
                {alertTimeline.stats24h.stale > 0 && <span className="text-gw-muted/60">过期{alertTimeline.stats24h.stale}</span>}
              </span>
            </div>
            <div className="max-h-32 overflow-y-auto">
              {alertTimeline.entries.slice(0, 15).map((entry, idx) => (
                <div key={entry.id} className="flex items-start gap-1 px-1 py-0.5 text-[7px] border-b border-gw-border/5 last:border-0">
                  <span className="text-gw-muted/30 w-8 flex-shrink-0 font-mono">
                    {new Date(entry.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className={'w-1 h-1 rounded-full mt-1 flex-shrink-0 ' + (
                    entry.severity === 'critical' ? 'bg-red-400' : entry.severity === 'warning' ? 'bg-amber-400' : 'bg-gw-muted/40'
                  )} />
                  <span className="text-gw-muted/70 w-14 truncate flex-shrink-0">{entry.wellName}</span>
                  <span className={'text-gw-muted/60 flex-1 ' + (entry.read ? '' : 'font-medium text-gw-text')}>{entry.message}</span>
                  {idx === 0 && !entry.read && <span className="text-red-400 text-[6px] px-0.5 rounded bg-red-500/20">新</span>}
                </div>
              ))}
            </div>
          </div>
        )}
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
  const handleGenerateReport = useCallback(async (format: 'docx' | 'pdf' | 'xlsx' = reportFormat) => {
    setReportStatus('generating');
    const formatLabel = format === 'docx' ? 'Word' : format === 'pdf' ? 'PDF' : 'Excel';
    setReportMsg(`正在生成 ${formatLabel} 报告...`);
    const data = buildWellReportData(wellsWithData, allAlerts, {
      unit: '河北瑞三元环境科技有限公司',
    });
    let result: { ok: boolean; message: string };
    if (format === 'pdf') {
      result = await downloadWellReportPdf(data);
    } else if (format === 'xlsx') {
      result = await downloadWellReportExcel(data);
    } else {
      result = await downloadWellReport(data);
    }
    setReportStatus(result.ok ? 'done' : 'error');
    setReportMsg(result.message);
  }, [wellsWithData, allAlerts, reportFormat]);

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
            {showAlerts && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowNotifyConfig(!showNotifyConfig)}
                  className={`text-[7px] px-1 py-0.5 rounded transition-colors ${notifyConfig.browserNotify || notifyConfig.soundAlert ? 'bg-gw-cyan/20 text-gw-cyan' : 'bg-gw-surface/30 text-gw-muted/50'}`}
                  title="通知设置"
                >
                  <Bell size={9} />
                </button>
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
          <div className="relative">
            <button
              onClick={() => {
                handleGenerateReport(reportFormat);
              }}
              disabled={reportStatus === 'generating'}
              className="flex items-center gap-1 px-2 py-1 text-[9px] font-medium bg-gw-cyan/20 text-gw-cyan rounded hover:bg-gw-cyan/30 transition-colors disabled:opacity-50"
              title="生成并下载报告"
            >
              <FileDown size={11} />
              {reportStatus === 'generating' ? '生成中...' : '生成报告'}
            </button>
            <button
              onClick={() => setShowReportFormatMenu(!showReportFormatMenu)}
              className="px-1 py-1 text-[9px] font-medium bg-gw-cyan/20 text-gw-cyan rounded hover:bg-gw-cyan/30 transition-colors"
              title="选择格式"
            >
              <ChevronDown size={9} />
            </button>

            {showReportFormatMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowReportFormatMenu(false)} />
                <div className="absolute right-0 top-full mt-1 z-50 bg-gw-surface border border-gw-border/30 rounded-lg shadow-lg overflow-hidden min-w-[100px]">
                  {(['docx', 'pdf', 'xlsx'] as const).map(fmt => (
                    <button
                      key={fmt}
                      onClick={() => {
                        setReportFormat(fmt);
                        setShowReportFormatMenu(false);
                        handleGenerateReport(fmt);
                      }}
                      className={`flex items-center gap-2 w-full px-3 py-2 text-[10px] transition-colors ${
                        reportFormat === fmt ? 'text-gw-cyan bg-gw-cyan/10' : 'text-gw-muted hover:text-gw-text hover:bg-gw-surface/30'
                      }`}
                    >
                      <span className="text-[8px] font-mono px-1 rounded bg-gw-surface/30">{fmt.toUpperCase()}</span>
                      <span>{fmt === 'docx' ? 'Word 文档' : fmt === 'pdf' ? 'PDF 文档' : 'Excel 表格'}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* 数据导出按钮 */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={exportStatus === 'exporting'}
              className="flex items-center gap-1 px-2 py-1 text-[9px] font-medium bg-gw-surface/40 text-gw-muted rounded hover:text-gw-text hover:bg-gw-surface/60 transition-colors disabled:opacity-50"
              title="导出数据 (Excel/CSV/JSON)"
            >
              <Download size={11} />
              {exportStatus === 'exporting' ? '导出中...' : '导出数据'}
            </button>

            {showExportMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
                <div className="absolute right-0 top-full mt-1 z-50 bg-gw-surface border border-gw-border/30 rounded-lg shadow-lg overflow-hidden min-w-[120px]">
                  {(['xlsx', 'csv', 'json'] as ExportFormat[]).map(fmt => (
                    <button
                      key={fmt}
                      onClick={() => handleExport(fmt)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-[10px] text-gw-muted hover:text-gw-text hover:bg-gw-surface/30 transition-colors"
                    >
                      <span className="text-[8px] font-mono px-1 rounded bg-gw-surface/30">{fmt.toUpperCase()}</span>
                      <span>{fmt === 'xlsx' ? 'Excel 多标签页' : fmt === 'csv' ? 'CSV 文本' : 'JSON 结构化'}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* 报告/导出状态提示 */}
        {reportStatus !== 'idle' && (
          <div className={`text-[9px] px-2 py-1 rounded ${reportStatus === 'done' ? 'bg-emerald-500/10 text-emerald-400' : reportStatus === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-gw-cyan/10 text-gw-cyan'}`}>
            {reportMsg}
          </div>
        )}
        {exportStatus === 'done' && (
          <div className="text-[9px] px-2 py-1 rounded bg-emerald-500/10 text-emerald-400">
            数据导出成功
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
        {/* 空间优化建议 */}
        {showSpatial && spatialOptimization.hasData && (
          <div className="mt-2 px-1.5 py-1 rounded-lg bg-gw-surface/20 border border-gw-border/10">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <Crosshair size={10} className="text-gw-muted/60" />
                <span className="text-[9px] font-medium text-gw-muted">空间优化建议</span>
              </div>
              <span className="text-[8px] font-mono px-1 rounded" style={{
                backgroundColor: spatialOptimization.overallScore >= 60 ? '#10b98125' : '#f9731625',
                color: spatialOptimization.overallScore >= 60 ? '#10b981' : '#f97316',
              }}>
                评分 {spatialOptimization.overallScore}
              </span>
            </div>

            {/* 覆盖密度 */}
            <div className="space-y-0.5 mb-1">
              <div className="text-[8px] text-gw-muted/60 mb-0.5">城市覆盖密度</div>
              {spatialOptimization.cityDensities.slice(0, 6).map(d => (
                <div key={d.city} className="flex items-center gap-1 text-[7px]">
                  <span className="w-10 truncate text-gw-muted">{d.city}</span>
                  <div className="flex-1 h-2 rounded bg-gw-surface/30 overflow-hidden">
                    <div className="h-full rounded transition-all" style={{
                      width: Math.min(100, (d.density / 3) * 100) + '%',
                      backgroundColor: d.status === 'critical' ? '#ef4444' : d.status === 'sparse' ? '#f97316' : d.status === 'moderate' ? '#f59e0b' : '#10b981',
                    }} />
                  </div>
                  <span className="w-16 text-right font-mono text-gw-muted/70">{d.density.toFixed(2)}口/千km²</span>
                  <span className="w-6 text-right" style={{
                    color: d.status === 'critical' ? '#ef4444' : d.status === 'sparse' ? '#f97316' : '#10b981',
                  }}>{d.gap > 0 ? '+' + d.gap : '\u2014'}</span>
                </div>
              ))}
            </div>

            {/* 盲区与建议 */}
            {spatialOptimization.gaps.length > 0 && (
              <div className="space-y-0.5">
                <div className="text-[8px] text-gw-muted/60 mb-0.5">识别盲区</div>
                {spatialOptimization.gaps.map((gap, idx) => (
                  <div key={idx} className="px-1 py-0.5 rounded text-[7px] border" style={{
                    borderColor: gap.priority === 'high' ? '#ef444430' : gap.priority === 'medium' ? '#f9731630' : '#6b728030',
                    backgroundColor: gap.priority === 'high' ? '#ef444408' : gap.priority === 'medium' ? '#f9731608' : '#6b728008',
                  }}>
                    <div className="flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full" style={{
                        backgroundColor: gap.priority === 'high' ? '#ef4444' : gap.priority === 'medium' ? '#f97316' : '#6b7280',
                      }} />
                      <span className="font-medium text-gw-text">{gap.title}</span>
                      <span className="text-gw-muted/50">{gap.cities.slice(0, 3).join('、')}</span>
                      {gap.suggestedWells > 0 && <span className="text-gw-cyan ml-auto">建议+{gap.suggestedWells}口</span>}
                    </div>
                    <div className="text-gw-muted/50 mt-0.5">{gap.suggestion}</div>
                  </div>
                ))}
              </div>
            )}

            {/* 冗余井 */}
            {spatialOptimization.redundancies.filter(r => r.suggestRemove).length > 0 && (
              <div className="mt-1">
                <div className="text-[8px] text-gw-muted/60 mb-0.5">建议评估</div>
                {spatialOptimization.redundancies.filter(r => r.suggestRemove).slice(0, 3).map(r => (
                  <div key={r.wellId} className="flex items-center gap-1 px-1 py-0.5 rounded text-[7px] bg-amber-500/10 border border-amber-500/20 mb-0.5">
                    <span className="text-gw-text">{r.wellName}</span>
                    <span className="text-gw-muted/50">{r.city}</span>
                    <span className="text-gw-muted/50 ml-auto">{r.reason}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <BalancePanel
          open={showBalance}
          onToggle={() => setShowBalance(!showBalance)}
          balanceResult={balanceResult}
          balanceComparison={balanceComparison}
          balancePeriodId={balancePeriodId}
          onSelectPeriod={setBalancePeriodId}
          cityBalances={cityBalances}
          onSelectCity={(city) => {
            const w = wells.find(well => well.city === city);
            if (w) handleSelect(w.id);
          }}
        />

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
                          .sort(([, a], [, b]) => (b as number) - (a as number))
                          .slice(0, 6)
                          .map(([type, count]) => (
                            <span key={type} className="text-[8px] px-1.5 py-0.5 rounded bg-gw-surface/30 border border-gw-border/20 text-gw-muted">
                              {type} {String(count)}站
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

        {/* 均衡-水质联动分析 */}
        <div className="border-t border-gw-border/10 pt-2 mt-2">
          <div className="flex items-center justify-between mb-1">
            <button
              onClick={() => setShowIntegrated(!showIntegrated)}
              className="flex items-center gap-1 text-[10px] text-gw-muted hover:text-gw-text transition-colors"
            >
              <BarChart3 size={11} className={integratedAnalysis.summary.dualPoor > 0 ? 'text-red-400' : 'text-emerald-400'} />
              <span>均衡-水质联动分析</span>
              {integratedAnalysis.hasData && (
                <span className={`text-[8px] font-mono px-1 rounded ${integratedAnalysis.summary.dualPoor > 0 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {integratedAnalysis.summary.dualPoor > 0
                    ? `${integratedAnalysis.summary.dualPoor}个双差城市`
                    : '无异常'}
                </span>
              )}
              <ChevronDown size={9} className={`transition-transform ml-auto ${showIntegrated ? 'rotate-0' : '-rotate-90'}`} />
            </button>
          </div>

          {showIntegrated && integratedAnalysis.hasData && (
            <div className="space-y-2">
              {/* 四象限统计卡片 */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5">
                <div className="px-2 py-1.5 rounded-lg" style={{ backgroundColor: '#ef444415', border: '1px solid #ef444430' }}>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#ef4444' }} />
                    <span className="text-[8px] text-red-300/70">双差</span>
                  </div>
                  <div className="text-[14px] font-bold font-mono text-red-400">{integratedAnalysis.summary.dualPoor}</div>
                  <div className="text-[7px] text-red-300/50">超采+差水质</div>
                </div>
                <div className="px-2 py-1.5 rounded-lg" style={{ backgroundColor: '#f9731615', border: '1px solid #f9731630' }}>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#f97316' }} />
                    <span className="text-[8px] text-orange-300/70">盈余·差水质</span>
                  </div>
                  <div className="text-[14px] font-bold font-mono text-orange-400">{integratedAnalysis.summary.surplusPoorQuality}</div>
                  <div className="text-[7px] text-orange-300/50">需控制污染源</div>
                </div>
                <div className="px-2 py-1.5 rounded-lg" style={{ backgroundColor: '#f59e0b15', border: '1px solid #f59e0b30' }}>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#f59e0b' }} />
                    <span className="text-[8px] text-amber-300/70">超采·好水质</span>
                  </div>
                  <div className="text-[14px] font-bold font-mono text-amber-400">{integratedAnalysis.summary.overdraftGoodQuality}</div>
                  <div className="text-[7px] text-amber-300/50">需预防性控采</div>
                </div>
                <div className="px-2 py-1.5 rounded-lg" style={{ backgroundColor: '#10b98115', border: '1px solid #10b98130' }}>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#10b981' }} />
                    <span className="text-[8px] text-emerald-300/70">双优</span>
                  </div>
                  <div className="text-[14px] font-bold font-mono text-emerald-400">{integratedAnalysis.summary.dualGood}</div>
                  <div className="text-[7px] text-emerald-300/50">盈余+好水质</div>
                </div>
              </div>

              {/* 综合排名 */}
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <BarChart3 size={10} className="text-gw-muted/60" />
                  <span className="text-[9px] font-medium text-gw-muted">综合排名 · {integratedAnalysis.ranking.length}市</span>
                  <span className="text-[8px] text-gw-muted/50 ml-auto">得分越高越好</span>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-0.5 pr-1">
                  {integratedAnalysis.ranking.map(item => {
                    const quadrantConfig = [
                      { color: '#6b7280' },
                      { color: '#ef4444' },
                      { color: '#f97316' },
                      { color: '#f59e0b' },
                      { color: '#10b981' },
                    ];
                    const qColor = quadrantConfig[item.quadrant]?.color ?? '#6b7280';
                    return (
                      <div
                        key={item.city}
                        className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] cursor-pointer transition-colors bg-gw-surface/20 border border-gw-border/10 hover:bg-gw-surface/30"
                        onClick={() => {
                          const w = wells.find(w => w.city === item.city);
                          if (w) handleSelect(w.id);
                        }}
                      >
                        <span className="w-4 text-gw-muted/50 font-mono text-[7px]">#{item.rank}</span>
                        <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: qColor }} />
                        <span className="w-10 font-medium text-gw-text truncate">{item.city}</span>
                        <div className="flex-1 h-2 rounded bg-gw-surface/30 overflow-hidden">
                          <div
                            className="h-full rounded transition-all"
                            style={{ width: `${item.compositeScore}%`, backgroundColor: qColor }}
                          />
                        </div>
                        <span className="w-8 text-right font-mono text-gw-muted">{item.compositeScore.toFixed(0)}</span>
                        <span className="text-[7px] text-gw-muted/50">
                          {item.isOverdrafted ? '超采' : '盈余'}·{WATER_CLASS_LABELS[item.qualityClass]?.label ?? '—'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 双差城市预警 */}
              {integratedAnalysis.alertCities.length > 0 && (
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <TriangleAlert size={10} className="text-red-400" />
                    <span className="text-[9px] font-medium text-gw-muted">双差城市预警 · {integratedAnalysis.alertCities.length}市</span>
                  </div>
                  <div className="space-y-0.5">
                    {integratedAnalysis.alertCities.map(c => (
                      <div
                        key={c.city}
                        className="px-1.5 py-1 rounded border bg-red-500/5 border-red-500/20 cursor-pointer hover:bg-red-500/10 transition-colors"
                        onClick={() => {
                          const w = wells.find(w => w.city === c.city);
                          if (w) handleSelect(w.id);
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] font-medium text-gw-text">{c.city}</span>
                          <span className="text-[7px] text-red-400/80">
                            超采 {Math.abs(c.balance?.balance ?? 0).toFixed(1)}亿m³ ·
                            水质平均 {WATER_CLASS_LABELS[Math.round(c.quality?.averageClass ?? 3) as 1|2|3|4|5]?.label ?? 'Ⅲ类'}
                          </span>
                        </div>
                        <div className="text-[7px] text-gw-muted/60 mt-0.5">
                          {c.quality && c.quality.mainFactors.length > 0 && (
                            <span>超标因子: {c.quality.mainFactors.join('、')} · </span>
                          )}
                          {c.suggestion}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 超采区水质特征 */}
              <div className="text-[8px] text-gw-muted/50 italic px-1 py-0.5 rounded bg-gw-surface/20">
                {integratedAnalysis.summary.overdraftQualityPattern}
              </div>

              {/* 主要建议 */}
              <div className="space-y-0.5">
                <div className="flex items-center gap-1 mb-0.5">
                  <TriangleAlert size={10} className="text-amber-400" />
                  <span className="text-[9px] font-medium text-gw-muted">建议</span>
                </div>
                {integratedAnalysis.recommendations.slice(0, 3).map((rec, i) => (
                  <div key={i} className="flex items-start gap-1 text-[8px] text-gw-muted/70">
                    <span className="text-gw-cyan mt-0.5">•</span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showIntegrated && !integratedAnalysis.hasData && (
            <div className="text-center text-[10px] text-gw-muted/50 py-2">
              数据不足，请先添加井网数据
            </div>
          )}
        </div>

        {/* 数据共享与对接 */}
        <div className="border-t border-gw-border/10 pt-2 mt-2">
          <div className="flex items-center justify-between mb-1">
            <button
              onClick={() => setShowSharing(!showSharing)}
              className="flex items-center gap-1 text-[10px] text-gw-muted hover:text-gw-text transition-colors"
            >
              <RefreshCw size={11} className="text-gw-muted/60" />
              <span>数据共享与对接</span>
              <span className="text-[8px] font-mono px-1 rounded bg-gw-surface/30 text-gw-muted">
                {dsConfigs.length} 数据源
              </span>
              <ChevronDown size={9} className={`transition-transform ml-auto ${showSharing ? 'rotate-0' : '-rotate-90'}`} />
            </button>
          </div>

          {showSharing && (
            <div className="space-y-2">
              {/* 数据源配置 */}
              <div className="px-1.5 py-1 rounded-lg bg-gw-surface/20 border border-gw-border/10">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <CircleDot size={10} className="text-gw-cyan" />
                    <span className="text-[9px] font-medium text-gw-muted">外部数据源</span>
                  </div>
                  <button
                    onClick={() => setShowAddDs(!showAddDs)}
                    className="text-[8px] px-1.5 py-0.5 rounded bg-gw-cyan/20 text-gw-cyan hover:bg-gw-cyan/30 transition-colors"
                  >
                    + 添加
                  </button>
                </div>

                {/* 添加数据源表单 */}
                {showAddDs && (
                  <div className="space-y-1.5 mb-2 p-1.5 rounded bg-gw-surface/30 border border-gw-border/10">
                    <input
                      value={dsName}
                      onChange={e => setDsName(e.target.value)}
                      placeholder="数据源名称"
                      className="w-full text-[8px] bg-gw-surface/40 border border-gw-border/30 rounded px-1.5 py-1 text-gw-text focus:outline-none"
                    />
                    <div className="flex items-center gap-1">
                      <select
                        value={dsType}
                        onChange={e => setDsType(e.target.value as 'http' | 'ws')}
                        className="text-[8px] bg-gw-surface/40 border border-gw-border/30 rounded px-1.5 py-1 text-gw-text focus:outline-none"
                      >
                        <option value="http">HTTP</option>
                        <option value="ws">WebSocket</option>
                      </select>
                      <input
                        value={dsEndpoint}
                        onChange={e => setDsEndpoint(e.target.value)}
                        placeholder="端点 URL"
                        className="flex-1 text-[8px] bg-gw-surface/40 border border-gw-border/30 rounded px-1.5 py-1 text-gw-text focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={async () => {
                          setDsTesting(true);
                          setDsTestResult(null);
                          const config = new DataSourceConfigManager().add({ name: dsName, type: dsType, endpoint: dsEndpoint });
                          const result = await testConnection({
                            ...config,
                            channels: DEFAULT_CHANNELS,
                            enabled: true,
                            status: 'untested',
                            createdAt: '',
                            updatedAt: '',
                          });
                          setDsTestResult(result.message);
                          setDsTesting(false);
                        }}
                        disabled={dsTesting || !dsEndpoint}
                        className="text-[8px] px-1.5 py-0.5 rounded bg-gw-surface/40 text-gw-muted hover:text-gw-text transition-colors disabled:opacity-50"
                      >
                        {dsTesting ? '测试中...' : '测试连接'}
                      </button>
                      <button
                        onClick={() => {
                          if (!dsName || !dsEndpoint) return;
                          configMgr.add({ name: dsName, type: dsType, endpoint: dsEndpoint });
                          setDsName('');
                          setDsEndpoint('');
                          setDsTestResult(null);
                          setShowAddDs(false);
                        }}
                        disabled={!dsName || !dsEndpoint}
                        className="text-[8px] px-1.5 py-0.5 rounded bg-gw-cyan/20 text-gw-cyan hover:bg-gw-cyan/30 transition-colors disabled:opacity-50 ml-auto"
                      >
                        保存
                      </button>
                    </div>
                    {dsTestResult && (
                      <div className="text-[7px] text-gw-muted/60">{dsTestResult}</div>
                    )}
                  </div>
                )}

                {/* 数据源列表 */}
                {dsConfigs.length === 0 ? (
                  <div className="text-[8px] text-gw-muted/50 text-center py-1">暂无配置，点击"+ 添加"添加数据源</div>
                ) : (
                  <div className="space-y-0.5 max-h-32 overflow-y-auto">
                    {dsConfigs.map(cfg => (
                      <div key={cfg.id} className="flex items-center gap-1 px-1 py-0.5 rounded text-[8px] bg-gw-surface/10 border border-gw-border/10">
                        <span className={`w-1 h-1 rounded-full ${cfg.status === 'connected' ? 'bg-emerald-400' : cfg.status === 'error' ? 'bg-red-400' : 'bg-gw-muted/40'}`} />
                        <span className="w-12 truncate text-gw-text">{cfg.name}</span>
                        <span className="text-gw-muted/50">{cfg.type.toUpperCase()}</span>
                        <span className="flex-1 truncate text-gw-muted/40">{cfg.endpoint}</span>
                        <button
                          onClick={() => configMgr.toggleEnabled(cfg.id)}
                          className={`text-[7px] px-1 rounded ${cfg.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gw-surface/30 text-gw-muted/50'}`}
                        >
                          {cfg.enabled ? '启用' : '禁用'}
                        </button>
                        <button
                          onClick={() => configMgr.remove(cfg.id)}
                          className="text-[7px] px-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20"
                        >
                          删除
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CSV 导入 */}
              <div className="px-1.5 py-1 rounded-lg bg-gw-surface/20 border border-gw-border/10">
                <div className="flex items-center gap-1 mb-1">
                  <Upload size={10} className="text-gw-cyan" />
                  <span className="text-[9px] font-medium text-gw-muted">导入监测井台账</span>
                </div>

                <textarea
                  value={csvText}
                  onChange={e => {
                    setCsvText(e.target.value);
                    setImportPreview(null);
                    setImportStatus(null);
                  }}
                  placeholder="粘贴 CSV 数据（第一行为表头，支持中文列名：名称,城市,经度,纬度,井深,含水层,监测指标,状态）"
                  className="w-full h-16 text-[8px] bg-gw-surface/40 border border-gw-border/30 rounded px-1.5 py-1 text-gw-text focus:outline-none resize-none"
                />

                <div className="flex items-center gap-1 mt-1">
                  <button
                    onClick={() => {
                      if (!csvText.trim()) return;
                      const result = previewImport(csvText);
                      setImportPreview(result);
                      setImportStatus(null);
                    }}
                    disabled={!csvText.trim()}
                    className="text-[8px] px-1.5 py-0.5 rounded bg-gw-cyan/20 text-gw-cyan hover:bg-gw-cyan/30 transition-colors disabled:opacity-50"
                  >
                    预览
                  </button>
                  <button
                    onClick={() => {
                      if (!importPreview || importPreview.previewRows.length === 0) return;
                      const result = importWells(importPreview.previewRows, (well) => addWell(well));
                      setImportStatus(`导入完成: ${result.importedCount} 成功, ${result.failedCount} 失败`);
                      setCsvText('');
                      setImportPreview(null);
                    }}
                    disabled={!importPreview || importPreview.previewRows.filter(r => r.valid).length === 0}
                    className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                  >
                    确认导入
                  </button>
                  {importStatus && <span className="text-[8px] text-gw-muted/60">{importStatus}</span>}
                </div>

                {/* 预览结果 */}
                {importPreview && (
                  <div className="mt-1 space-y-0.5">
                    <div className="text-[7px] text-gw-muted/50">
                      识别到 {importPreview.headers.length} 列 · {importPreview.previewRows.length} 行
                      · 有效 {importPreview.previewRows.filter(r => r.valid).length} 行
                      · 无效 {importPreview.previewRows.filter(r => !r.valid).length} 行
                      {importPreview.error && <span className="text-red-400"> · {importPreview.error}</span>}
                    </div>
                    <div className="max-h-24 overflow-y-auto space-y-0.5">
                      {importPreview.previewRows.slice(0, 10).map(row => (
                        <div key={row.rowNum} className={`flex items-center gap-1 px-1 py-0.5 rounded text-[7px] ${row.valid ? 'bg-emerald-500/5' : 'bg-red-500/10'}`}>
                          <span className="w-6 text-gw-muted/50">L{row.rowNum}</span>
                          <span className={`w-1 h-1 rounded-full ${row.valid ? 'bg-emerald-400' : 'bg-red-400'}`} />
                          <span className="text-gw-text">{row.well?.name ?? row.raw.name ?? '—'}</span>
                          <span className="text-gw-muted/50">{row.well?.city ?? row.raw.city ?? '—'}</span>
                          {!row.valid && <span className="text-red-400 ml-auto">{row.errors[0]}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 共享接口说明 */}
              <div className="px-1.5 py-1 rounded-lg bg-gw-surface/20 border border-gw-border/10">
                <div className="flex items-center gap-1 mb-0.5">
                  <Layers size={10} className="text-gw-muted/60" />
                  <span className="text-[9px] font-medium text-gw-muted">数据共享接口</span>
                </div>
                <div className="text-[7px] text-gw-muted/50 space-y-0.5">
                  <p>• 导出: 点击上方"导出数据"按钮，选择 Excel/CSV/JSON 格式</p>
                  <p>• 导入: 粘贴 CSV 格式的监测井台账数据，支持自动列映射</p>
                  <p>• 数据源: 配置 HTTP/WebSocket 数据源，对接外部监测系统</p>
                  <p>• 标准格式: 导出数据遵循地下水监测数据交换标准格式</p>
                </div>
              </div>
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