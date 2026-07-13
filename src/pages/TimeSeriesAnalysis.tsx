// ═══════════════════════════════════════════════════════════
// 时间序列分析页面 - 河北省11市+雄安地下水多年变化趋势
// 数据来源: cityExploitationYearly / cityGroundwaterQuality2024 / resources-bulletin
// Phase 6b: 从1567行拆分为11个子模块
// ═══════════════════════════════════════════════════════════

import { useTabTransition } from '../hooks/useTabTransition';
import React, { useState, useCallback } from 'react';
import { FileText } from 'lucide-react';
import { DataSourceNote } from '../components/UI';
import { CrossLinkPanel } from '../components/CrossLink';
import { ChartExport } from '../components/ChartExport';
import { useReportData } from '../hooks/useReportData';
import { ExportProgressDialog } from '../components/ExportProgressDialog';
import '../services/reportGenerators/timeSeriesReport';

import { cityExploitationYearly } from '../data/exploitation';
import { cityWaterLevelYearly, citySubsidenceYearly, waterLevelYearlySummary, subsidenceYearlySummary, cityQualityYearly, qualityYearlySummary } from '../data/historicalTimeSeries';
import { cityQualityTrend, qualityLevelTrend2020_2024 } from '../data/waterQuality';
import { cityGroundwaterDynamic2024 } from '../data/resources-bulletin';
import { cityWaterSupply2024 } from '../data/resources-core';

import { ALL_CITIES, YEARS, TABS, type TabKey } from './timeSeriesUtils';
import { CitySelector, GroupSelector, BaselineSelector } from './timeSeriesSelectors';
import { ForecastPanel } from './ForecastPanels';
import { ExploitationTrendPanel } from './ExploitationTrendPanel';
import { WaterLevelPanel } from './WaterLevelPanel';
import { SubsidenceTrendPanel } from './SubsidenceTrendPanel';
import { QualityTrendPanel } from './QualityTrendPanel';
import { SupplyStructurePanel } from './SupplyStructurePanel';
import { RegionalComparePanel } from './ForecastPanels';
import { RadarComparePanel } from './RadarComparePanel';
import { CorrelationPanel } from './CorrelationPanel';
import { GovernancePanel } from './GovernancePanel';

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
  const [activeTab, setActiveTab] = useTabTransition<TabKey>('exploitation');
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
