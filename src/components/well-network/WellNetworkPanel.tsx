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
import { Network, Bell, Clock } from 'lucide-react';
import { TechCard } from '../UI';
import { useWellNetwork, useWellFilter, useSpatialAnalysis, useWellSelection } from '../../hooks/useWellNetwork';
import { useWellRealtime, useWellRealtimeStats, useWellRealtimeTrend } from '../../hooks/useWellRealtime';
import { useWellAlerts, useWellTrend } from '../../hooks/useWellAlerts';
import { useWaterBalance, useCityBalance, useBalanceComparison } from '../../hooks/useWaterBalance';
import { useWaterQuality, useWellWaterQuality } from '../../hooks/useWaterQuality';
import { getDefaultExportOptions, exportData } from '../../services/dataExporter';
import type { ExportFormat, ExportSheet } from '../../services/dataExporter';
import { buildSpatialOptimization } from '../../services/spatialOptimizer';
import { downloadWellReportPdf } from '../../services/wellReportPdf';
import { downloadWellReportExcel } from '../../services/wellReportExcel';
import { useIntegratedAnalysis } from '../../hooks/useWaterQualityBalance';
import { AlertNotifier, buildAlertTimeline } from '../../services/alertNotifier';
import type { AlertTimeline, NotificationConfig } from '../../services/alertNotifier';
import { downloadWellReport } from '../../services/wellReportDocx';
import { buildWellReportData } from '../../services/wellReport';
import type { WellRealtimeStatus } from '../../services/wellRealtime';
import type { AlertSeverity } from '../../services/wellAlerts';
import { BalancePanel } from './BalancePanel';
import { QualityPanel } from './QualityPanel';
import { IntegratedPanel } from './IntegratedPanel';
import { SharingPanel } from './SharingPanel';
import { WellMap } from './WellMap';
import { WellTable } from './WellTable';
import { AddWellForm } from './AddWellForm';
import { SpatialOptimizationPanel } from './panels/SpatialOptimizationPanel';
import { SelectedWellDetail } from './panels/SelectedWellDetail';
import { StatsCardsPanel, RealtimeStatusBar, AlertsPanel, FilterBar, ActionButtons, StatusHints, SpatialAnalysisPanel } from './panels';

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
        <StatsCardsPanel wellsCount={wells.length} report={report} rtStats={rtStats} />
        <RealtimeStatusBar
          rtStats={rtStats}
          rtFilter={rtFilter}
          onFilterChange={setRtFilter}
          isConnected={isConnected}
          lastUpdateText={lastUpdateText}
        />
        <AlertsPanel
          showAlerts={showAlerts}
          onToggleAlerts={() => setShowAlerts(!showAlerts)}
          alertSummary={alertSummary}
          showNotifyConfig={showNotifyConfig}
          onToggleNotifyConfig={() => setShowNotifyConfig(!showNotifyConfig)}
          notifyEnabled={notifyConfig.browserNotify || notifyConfig.soundAlert}
          severityFilter={alertSeverityFilter}
          onSeverityFilterChange={setAlertSeverityFilter}
          alerts={filteredAlerts}
          onSelectWell={handleSelect}
        />
        <WellMap wells={wellsWithData} selectedId={selectedId} onSelect={handleSelect} />
        <FilterBar
          filters={filters}
          cities={cities}
          onFilterChange={setFilter}
          onClear={clearFilters}
        />
        <ActionButtons
          showAdd={showAdd}
          onToggleAdd={setShowAdd}
          onReset={reset}
          showSpatial={showSpatial}
          onToggleSpatial={setShowSpatial}
          showTable={showTable}
          onToggleTable={setShowTable}
          displayWellsCount={displayWells.length}
          onGenerateReport={handleGenerateReport}
          reportFormat={reportFormat}
          reportStatus={reportStatus}
          showReportFormatMenu={showReportFormatMenu}
          onToggleFormatMenu={setShowReportFormatMenu}
          onSelectFormat={setReportFormat}
          showExportMenu={showExportMenu}
          onToggleExportMenu={setShowExportMenu}
          exportStatus={exportStatus}
          onExport={handleExport}
        />
        <StatusHints reportStatus={reportStatus} reportMsg={reportMsg} exportStatus={exportStatus} />
        {showAdd && <AddWellForm onAdd={addWell} onClose={() => setShowAdd(false)} />}
        {showTable && (
          <WellTable
            wells={displayWells}
            selectedId={selectedId}
            onSelect={handleSelect}
            onDelete={id => { deleteWell(id); if (selectedId === id) clear(); }}
          />
        )}
        {showSpatial && (
          <SpatialAnalysisPanel
            report={report}
            neighbors={neighbors}
            bufferCenter={bufferCenter}
            onBufferCenterChange={setBufferCenter}
            bufferRadius={bufferRadius}
            onBufferRadiusChange={setBufferRadius}
            onAnalyze={handleBuffer}
            buffer={buffer}
            bufferWells={bufferWells}
            wells={wells}
          />
        )}
        <SpatialOptimizationPanel showSpatial={showSpatial} spatialOptimization={spatialOptimization} />
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
        <QualityPanel
          open={showQuality}
          onToggle={() => setShowQuality(!showQuality)}
          qualitySummary={qualitySummary}
          qualityCityStats={qualityCityStats}
          selectedWellQuality={selectedWellQuality}
          onSelectCity={(city) => {
            const w = wells.find(well => well.city === city);
            if (w) handleSelect(w.id);
          }}
        />
        <IntegratedPanel
          open={showIntegrated}
          onToggle={() => setShowIntegrated(!showIntegrated)}
          integratedAnalysis={integratedAnalysis}
          onSelectCity={(city) => {
            const w = wells.find(well => well.city === city);
            if (w) handleSelect(w.id);
          }}
        />
        <SharingPanel
          open={showSharing}
          onToggle={() => setShowSharing(!showSharing)}
          addWell={addWell}
        />
        <SelectedWellDetail
          selectedWithData={selectedWithData}
          liveTrend={liveTrend}
          historyTrend={historyTrend}
          historyLoading={historyLoading}
          distances={distances}
          onClear={clear}
        />
      </div>
    </TechCard>
  );
}
