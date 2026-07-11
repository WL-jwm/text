import React, { Suspense, useState } from 'react';
import {
  BarChart3, Droplets, MapPin, Layers, Users,
} from 'lucide-react';
import { ChartExport } from '../components/ChartExport';
import { ExportProgressDialog } from '../components/ExportProgressDialog';
import { useChartInteraction } from '../hooks/useChartInteraction';
import { usePageCommons } from '../hooks/usePageCommons';
import {
  useGwDepRank,
  useSupplyDemandData,
  useResourceEnvData,
  useResourceCombo,
  useGwDynamicPie,
  useGwDynamicBar,
  useWqSourcePie,
  useCountyAnalysisData,
  useIrrigationEfficiency,
  useCountyRadarSelection,
  useRegionalCompare,
  useRegionalColumns,
} from './dataInsightData';

// ── 懒加载Tab组件 ──
const ResourceEnvTab = React.lazy(() => import('../components/data-insight/ResourceEnvTab').then(m => ({ default: m.ResourceEnvTab })));
const SupplyStructureTab = React.lazy(() => import('../components/data-insight/SupplyStructureTab').then(m => ({ default: m.SupplyStructureTab })));
const CountyAnalysisTab = React.lazy(() => import('../components/data-insight/CountyAnalysisTab').then(m => ({ default: m.CountyAnalysisTab })));
const RegionalCompareTab = React.lazy(() => import('../components/data-insight/RegionalCompareTab').then(m => ({ default: m.RegionalCompareTab })));
const ResourceTab = React.lazy(() => import('../components/data-insight/ResourceTab').then(m => ({ default: m.ResourceTab })));

const TABS = [
  { key: 'overview', label: '资源-环境关联', icon: BarChart3 },
  { key: 'supply', label: '供水结构分析', icon: Droplets },
  { key: 'county', label: '县级资源分析', icon: Users },
  { key: 'regional', label: '区域对比', icon: MapPin },
  { key: 'resource', label: '资源组合评估', icon: Layers },
] as const;
type TabKey = typeof TABS[number]['key'] | '';

export function DataInsightInner() {
  const { exportOpen, setExportOpen, getData, dataLoading, success } = usePageCommons({
    pageName: 'data-insight',
    collector: async () => ({
      stats: countyAnalysisData.stats,
      gwDepRank: countyAnalysisData.gwDepRank.slice(0, 30),
      cityGwAvg: countyAnalysisData.cityGwAvg,
      topByUse: countyAnalysisData.topByUse,
      agriRank: countyAnalysisData.agriRank.slice(0, 30),
      precipUseCorr: countyAnalysisData.precipUseCorr,
      gwDepRankCities: gwDepRank,
      supplyDemand: supplyDemandData,
      resourceEnv: resourceEnvData,
    }),
  });

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const { activeKey, setActiveKey } = useChartInteraction<string>();
  const [highlight, setHighlight] = useState<string | null>(null);

  // ── 导出回调 ──
  const exportSupplyData = () => { success('数据已导出'); };
  const exportCountyData = () => { success('数据已导出'); };
  const exportRegionalCompare = () => { success('数据已导出'); };

  // ── 衍生数据（使用提取的hooks）──
  const gwDepRank = useGwDepRank();
  const supplyDemandData = useSupplyDemandData();
  const resourceEnvData = useResourceEnvData();
  const resourceCombo = useResourceCombo();
  const gwDynamicPie = useGwDynamicPie();
  const gwDynamicBar = useGwDynamicBar();
  const wqSourcePie = useWqSourcePie();
  const countyAnalysisData = useCountyAnalysisData();
  const irrigationEfficiency = useIrrigationEfficiency(countyAnalysisData);
  const { selectedCounties, radarCompareData, selectableCounties, toggleCountySelect } = useCountyRadarSelection(countyAnalysisData);
  const regionalCompare = useRegionalCompare();
  const regionalColumns = useRegionalColumns();

  const fallback = <div className="p-8 text-center text-gw-muted text-sm">加载中...</div>;

  return (
    <div className="p-6 max-w-[1440px] mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-display font-bold text-gw-text">数据洞察分析</h1>
        <p className="text-sm text-gw-muted mt-1">跨模块数据关联分析 / 区域对比 / 资源组合评估</p>
        <div className="mt-2 flex items-center gap-2">
          <ChartExport
            data={resourceEnvData}
            filename="DataInsight_数据洞察快照"
            sheetName="数据洞察"
            formats={['xlsx', 'csv', 'json']}
            label="导出洞察数据"
          />
          <span className="text-[10px] text-gw-muted">支持 xlsx / csv / json 三种格式，含 {resourceEnvData?.length || 0} 条记录</span>
        </div>
      </div>

      {/* Tab导航 */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-gw-blue/15 text-gw-highlight border border-gw-blue/30'
                : 'text-gw-muted hover:text-gw-text hover:bg-gw-surface border border-transparent'
            }`}>
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <Suspense fallback={fallback}><ResourceEnvTab
        resourceEnvData={resourceEnvData}
        resourceCombo={resourceCombo}
        gwDynamicPie={gwDynamicPie}
        gwDynamicBar={gwDynamicBar}
        wqSourcePie={wqSourcePie}
      /></Suspense>}
      {activeTab === 'supply' && <Suspense fallback={fallback}><SupplyStructureTab
        supplyDemandData={supplyDemandData}
        gwDepRank={gwDepRank}
        exportSupplyData={exportSupplyData}
        setActiveKey={setActiveKey}
      /></Suspense>}
      {activeTab === 'county' && <Suspense fallback={fallback}><CountyAnalysisTab
        countyAnalysisData={countyAnalysisData}
        gwDepRank={gwDepRank}
        irrigationEfficiency={irrigationEfficiency}
        radarCompareData={radarCompareData}
        selectableCounties={selectableCounties}
        selectedCounties={selectedCounties}
        toggleCountySelect={toggleCountySelect}
        exportCountyData={exportCountyData}
        activeKey={activeKey}
        setActiveKey={setActiveKey}
        highlight={setHighlight}
      /></Suspense>}
      {activeTab === 'regional' && <Suspense fallback={fallback}><RegionalCompareTab
        regionalCompare={regionalCompare}
        gwDepRank={gwDepRank}
        regionalColumns={regionalColumns}
        exportRegionalCompare={exportRegionalCompare}
      /></Suspense>}
      {activeTab === 'resource' && (
        <div className="space-y-4">
          <Suspense fallback={fallback}><ResourceTab tabCount={TABS.length} highlight={highlight ?? undefined} /></Suspense>
          {/* 导出报告 */}
          <div className="flex items-center justify-end mb-2">
            <button onClick={() => setExportOpen(true)} className="px-3 py-1.5 rounded-lg text-xs bg-gw-blue/15 text-gw-highlight border border-gw-blue/30 hover:bg-gw-blue/25 transition-all">
              导出洞察报告
            </button>
          </div>
          <ExportProgressDialog
            open={exportOpen}
            onClose={() => setExportOpen(false)}
            reportType="data-insight"
            reportLabel="河北省地下水数据洞察报告"
            data={getData()}
            dataLoading={dataLoading}
          />
        </div>
      )}
    </div>
  );
}
