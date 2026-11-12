import React, { useState, useMemo, useCallback } from 'react';
import { useTabTransition } from '../hooks/useTabTransition';
import { Droplets, BarChart3, Activity, TrendingUp, FileText, AlertTriangle, Scale, Zap, Calculator } from 'lucide-react';
import { cityWaterSupply2024, cityGroundwaterDynamic2024, resourceTimeSeries, cityGroundwater2024, groundwaterDynamic2024 } from '../data/resources';
import { SectionTitle, DataSourceNote } from '../components/UI';
import {
  WS_SUMMARY,
  useResourcesDerived,
  buildResourcesExportHandlers,
} from './resourcesParts/useResourcesDerived';
import { CrossLinkPanel } from '../components/CrossLink';
import { useToast } from '../components/Toast';
import { useReportData } from '../hooks/useReportData';
import { ExportProgressDialog } from '../components/ExportProgressDialog';
import { YearSwitcher, bulletinYearOptions } from '../components/YearSwitcher';
// 注册水资源公报简报报告生成器（side-effect import）
import { ResourcesOverviewTab } from '../components/resources/ResourcesOverviewTab';
import { ResourcesSupplyTab } from '../components/resources/ResourcesSupplyTab';
import { ResourcesDynamicTab } from '../components/resources/ResourcesDynamicTab';
import { ResourcesTimeseriesTab } from '../components/resources/ResourcesTimeseriesTab';
import { ResourcesBulletinTab } from '../components/resources/ResourcesBulletinTab';
import { ResourcesOverexploitTab } from '../components/resources/ResourcesOverexploitTab';
import { ResourcesBalanceTab } from '../components/resources/ResourcesBalanceTab';
import { ResourcesPotentialTab } from '../components/resources/ResourcesPotentialTab';
import { ExploitableResourceTab } from '../components/resources/ExploitableResourceTab';
import type {   CityBulletinData} from '../types/county';

const TABS = [
  { key: 'overview', label: '总览', icon: Droplets },
  { key: 'supply', label: '供水结构', icon: BarChart3 },
  { key: 'dynamic', label: '地下水动态', icon: Activity },
  { key: 'timeseries', label: '时序变化', icon: TrendingUp },
  { key: 'bulletin', label: '公报数据', icon: FileText },
  { key: 'overexploit', label: '超采治理', icon: AlertTriangle },
  { key: 'balance', label: '均衡分析', icon: Scale },
  { key: 'potential', label: '潜力分析', icon: Zap },
  { key: 'exploitable', label: '可开采量评价', icon: Calculator },
] as const;

type BulletinSubKey = 'compare' | 'supply' | 'dynamic' | 'detail';

export function Resources() {
  const { success } = useToast();
  const [activeTab, setActiveTab] = useTabTransition<typeof TABS[number]['key']>('overview');
  const [exportOpen, setExportOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [dataYear, setDataYear] = useState(2024);
  const [bulletinSub, setBulletinSub] = useState<BulletinSubKey>('compare');
  const [bulletinSortCol, setBulletinSortCol] = useState<number | null>(null);
  const [bulletinSortDir, setBulletinSortDir] = useState<'asc' | 'desc'>('desc');
  const [countySortCol, setCountySortCol] = useState<number | null>(null);
  const [countySortDir, setCountySortDir] = useState<'asc' | 'desc'>('desc');

  const ws = WS_SUMMARY;

  const gd = useMemo(() => cityGroundwaterDynamic2024, []);

  const handleBulletinSort = (col: number) => {
    if (bulletinSortCol === col) {
      setBulletinSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setBulletinSortCol(col);
      setBulletinSortDir('desc');
    }
  };

  const handleCountySort = (col: number) => {
    if (countySortCol === col) {
      setCountySortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setCountySortCol(col);
      setCountySortDir('desc');
    }
  };


  // 公报派生数据（下沉至 resourcesParts/useResourcesDerived）
  const {
    currentBulletin,
    bulletinCompareData,
    supplyStructureData,
    useStructureData,
    gwDynamicData,
    selectedBulletin,
    bulletinTableData,
    countyTableRows,
  } = useResourcesDerived(dataYear, selectedCity, bulletinSortCol, bulletinSortDir, countySortCol, countySortDir);


  const { handleExportSupply, handleExportDynamic, handleExportTimeseries, handleExportBulletin } =
    buildResourcesExportHandlers({ notify: success, currentBulletin, dataYear });

  // 报告数据预采集（增量缓存）
  const { getData, isLoading: dataLoading } = useReportData({
    pageName: 'resources',
    collector: useCallback(async () => ({
      summary: {
        rainfallValue: ws.rainfall.value,
        rainfallChange: ws.rainfall.multiChange,
        totalResourceValue: ws.totalResource.value,
        totalResourceChange: ws.totalResource.multiChange,
        surfaceWaterValue: ws.surfaceWater.value,
        surfaceWaterChange: ws.surfaceWater.multiChange,
        groundwaterValue: ws.groundwater.value,
        groundwaterChange: ws.groundwater.multiChange,
        perCapitaValue: ws.perCapita.value,
        runOffCoeff: ws.runOffCoeff.value,
        runOffModule: ws.runOffModule.value,
      },
      cityResources: cityGroundwater2024,
      citySupply: cityWaterSupply2024,
      gwDynamic: groundwaterDynamic2024,
      timeSeries: resourceTimeSeries,
      conclusion: '2024年河北省降水量偏丰，水资源总量247.92亿m³，较多年均值增加40.5%。地下水水位持续回升，浅层水位平均回升0.70m，深层水位平均回升1.91m。超采治理成效显著，开采量较1990年代峰值下降52.7%。建议继续推进地下水超采综合治理，优化供水结构，提高水资源利用效率。',
    }), [ws]),
    autoCollect: true,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionTitle icon={Droplets}>水资源量</SectionTitle>
        <button onClick={() => setExportOpen(true)}
          className="text-xs bg-emerald-600/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600/25 px-2.5 py-1 rounded transition-colors">
          导出报告
        </button>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gw-border pb-3">
        {TABS.map(tab => (
          <button key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'bg-gw-card-alt text-gw-muted hover:bg-gw-card-alt hover:text-gw-text'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <ResourcesOverviewTab ws={ws} />}
      {activeTab === 'supply' && <ResourcesSupplyTab handleExportSupply={handleExportSupply} />}
      {activeTab === 'dynamic' && <ResourcesDynamicTab gd={gd} handleExportDynamic={handleExportDynamic} />}
      {activeTab === 'timeseries' && <ResourcesTimeseriesTab handleExportTimeseries={handleExportTimeseries} />}
      {activeTab === 'bulletin' && (
        <>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs text-gw-muted">数据年份</span>
          <YearSwitcher
            years={bulletinYearOptions}
            value={dataYear}
            onChange={setDataYear}
            mode="buttons"
          />
          {dataYear !== 2024 && (
            <span className="text-[10px] text-amber-400/70 bg-amber-400/10 px-2 py-0.5 rounded">
              {dataYear === 2022 ? '仅秦皇岛有完整数据' : '数据有限'}
            </span>
          )}
        </div>
        <ResourcesBulletinTab
          bulletinCompareData={bulletinCompareData}
          supplyStructureData={supplyStructureData}
          useStructureData={useStructureData}
          gwDynamicData={gwDynamicData}
          selectedBulletin={selectedBulletin}
          bulletinTableData={bulletinTableData}
          countyTableRows={countyTableRows}
          bulletinSub={bulletinSub}
          setBulletinSub={setBulletinSub}
          selectedCity={selectedCity}
          setSelectedCity={setSelectedCity}
          bulletinSortCol={bulletinSortCol}
          bulletinSortDir={bulletinSortDir}
          countySortCol={countySortCol}
          countySortDir={countySortDir}
          handleBulletinSort={handleBulletinSort}
          handleCountySort={handleCountySort}
          handleExportBulletin={handleExportBulletin}
          bulletinData={currentBulletin as CityBulletinData[]}
        />
      </>
      )}
      {activeTab === 'overexploit' && <ResourcesOverexploitTab />}
      {activeTab === 'balance' && <ResourcesBalanceTab />}
      {activeTab === 'potential' && <ResourcesPotentialTab />}
      {activeTab === 'exploitable' && <ExploitableResourceTab />}

      <CrossLinkPanel currentPath="/resources" />
      <DataSourceNote source={`${dataYear}年河北省水资源公报`} version="v3.5" />

      {/* 导出报告对话框 */}
      <ExportProgressDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        reportType="resources"
        reportLabel="河北省水资源公报简报"
        data={getData()}
        dataLoading={dataLoading}
      />
    </div>
  );
}
