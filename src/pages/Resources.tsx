import React, { useState, useMemo, useCallback } from 'react';
import { useTabTransition } from '../hooks/useTabTransition';
import { Droplets, BarChart3, Activity, TrendingUp, FileText, AlertTriangle, Scale, Zap } from 'lucide-react';
import { cityWaterSupply2024, cityGroundwaterDynamic2024, resourceTimeSeries, cityGroundwater2024, groundwaterDynamic2024 } from '../data/resources';
import { SectionTitle, DataSourceNote } from '../components/UI';
import { CrossLinkPanel } from '../components/CrossLink';
import { useToast } from '../components/Toast';
import { useReportData } from '../hooks/useReportData';
import { ExportProgressDialog } from '../components/ExportProgressDialog';
import { YearSwitcher, bulletinYearOptions, getBulletinData } from '../components/YearSwitcher';
// 注册水资源公报简报报告生成器（side-effect import）
import { ResourcesOverviewTab } from '../components/resources/ResourcesOverviewTab';
import { ResourcesSupplyTab } from '../components/resources/ResourcesSupplyTab';
import { ResourcesDynamicTab } from '../components/resources/ResourcesDynamicTab';
import { ResourcesTimeseriesTab } from '../components/resources/ResourcesTimeseriesTab';
import { ResourcesBulletinTab } from '../components/resources/ResourcesBulletinTab';
import { ResourcesOverexploitTab } from '../components/resources/ResourcesOverexploitTab';
import { ResourcesBalanceTab } from '../components/resources/ResourcesBalanceTab';
import { ResourcesPotentialTab } from '../components/resources/ResourcesPotentialTab';
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

  const ws = useMemo(() => ({
    rainfall: { value: 659.3, unit: 'mm', yoyChange: '+12.8%', multiAvg: 520.8, multiChange: '+26.6%' },
    totalResource: { value: 247.92, unit: '亿m3', yoyChange: '+2.7%', multiAvg: 176.47, multiChange: '+40.5%' },
    surfaceWater: { value: 140.76, unit: '亿m3', multiAvg: 90.27, multiChange: '+55.9%' },
    groundwater: { value: 179.94, unit: '亿m3', multiAvg: 114.22, multiChange: '+57.5%' },
    perCapita: { value: 336, unit: 'm3/person' },
    runOffCoeff: { value: 0.20 },
    runOffModule: { value: 13.21, unit: '万m3/km2' },
  }), []);

  const gd = useMemo(() => cityGroundwaterDynamic2024, []);
  const currentBulletin = useMemo(() => getBulletinData(dataYear), [dataYear]);

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

  const handleExportSupply = () => {
    exportDataCSV(cityWaterSupply2024 as Record<string, unknown>[], '河北各市供水量2024');
    success('数据已导出');
  };

  const handleExportDynamic = () => {
    exportDataCSV(cityGroundwaterDynamic2024 as Record<string, unknown>[], '河北各市地下水动态2024');
    success('数据已导出');
  };

  const handleExportTimeseries = () => {
    exportDataCSV(resourceTimeSeries as Record<string, unknown>[], '河北水资源时序');
    success('数据已导出');
  };

  const handleExportBulletin = () => {
    const data = currentBulletin.map(n => ({
      城市: n.city,
      '面积km2': n.area,
      '降水mm': n.precipitation,
      '降水总量亿m3': n.precipTotal,
      '地表水亿m3': n.surfaceWater,
      '地下水亿m3': n.groundWater,
      '重复量亿m3': n.repeatCalc,
      '水资源总量亿m3': n.totalWater,
      '产水系数': n.coeff,
      '总供水亿m3': n.totalSupply,
      '本地地表水供水亿m3': n.localSurfaceSupply,
      '跨流域调水亿m3': n.interBasinTransferSupply,
      '地下水供水亿m3': n.groundSupply,
      '其他供水亿m3': n.otherSupply,
      '农业用水亿m3': n.agriUse,
      '工业用水亿m3': n.industryUse,
      '生活用水亿m3': n.domesticUse,
      '生态用水亿m3': n.ecoUse,
      '浅层埋深m': n.shallowDepth,
      '浅层变化m': n.shallowChange,
    }));
    exportDataCSV(data as Record<string, unknown>[], `河北各市${dataYear}年水资源公报`);
    success('公报数据已导出');
  };

  const bulletinCompareData = useMemo(() =>
    currentBulletin.map(l => ({
      name: l.city.replace('市', '').replace('新区', ''),
      降水量: l.precipitation,
      地表水: l.surfaceWater,
      地下水: l.groundWater,
      水资源总量: l.totalWater,
      总供水: l.totalSupply ?? 0,
      地下水供水: l.groundSupply ?? 0,
      降水总量: l.precipTotal ?? 0,
    })).sort((a, b) => b.水资源总量 - a.水资源总量),
    []
  );

  const supplyStructureData = useMemo(() =>
    currentBulletin.filter(l => l.totalSupply != null).map(l => ({
      name: l.city.replace('市', '').replace('新区', ''),
      本地地表水: l.localSurfaceSupply ?? 0,
      跨流域调水: l.interBasinTransferSupply ?? 0,
      地下水: l.groundSupply ?? 0,
      其他: (l.totalSupply ?? 0) - (l.localSurfaceSupply ?? 0) - (l.interBasinTransferSupply ?? 0) - (l.groundSupply ?? 0),
    })).sort((a, b) => b.本地地表水 + b.跨流域调水 + b.地下水 + b.其他 - (a.本地地表水 + a.跨流域调水 + a.地下水 + a.其他)),
    []
  );

  const useStructureData = useMemo(() =>
    currentBulletin.filter(l => l.agriUse != null).map(l => ({
      name: l.city.replace('市', '').replace('新区', ''),
      农业: l.agriUse ?? 0,
      工业: l.industryUse ?? 0,
      生活: l.domesticUse ?? 0,
      生态: l.ecoUse ?? 0,
    })),
    [currentBulletin]
  );

  const gwDynamicData: { name: string; 浅层埋深: number; 浅层变化: number; 深层埋深: number; 深层变化: number }[] = useMemo(() =>
    cityGroundwaterDynamic2024.filter(l => l.shallowDepth != null || l.deepDepth != null).map(l => ({
      name: (l.city || '').replace('市', '').replace('全省', '全省平均'),
      浅层埋深: l.shallowDepth ?? 0,
      浅层变化: l.shallowChange ?? 0,
      深层埋深: l.deepDepth ?? 0,
      深层变化: l.deepChange ?? 0,
    })),
    []
  );

  const selectedBulletin = useMemo(() =>
    selectedCity ? (currentBulletin as unknown as CityBulletinData[]).find(l => l.city === selectedCity) ?? null : null,
    [selectedCity, currentBulletin]
  );

  const bulletinTableData = useMemo(() => {
    let l = currentBulletin.map(n => ({
      name: n.city,
      降水: n.precipitation,
      地表水: n.surfaceWater,
      地下水: n.groundWater,
      总量: n.totalWater,
      供水: n.totalSupply ?? 0,
      地下水供水比: n.totalSupply && n.groundSupply ? n.groundSupply / n.totalSupply * 100 : 0,
      浅层埋深: n.shallowDepth ?? 0,
      浅层变化: n.shallowChange ?? 0,
      县级数据: n.counties?.length ?? 0,
    }));
    if (bulletinSortCol != null) {
      const keys = ['name', '降水', '地表水', '地下水', '总量', '供水', '地下水供水比', '浅层埋深', '浅层变化', '县级数据'];
      const key = keys[bulletinSortCol];
      if (key) {
        l = [...l].sort((a, b) => {
          const va = a[key as keyof typeof a];
          const vb = b[key as keyof typeof b];
          if (typeof va === 'string') {
            return bulletinSortDir === 'asc' ? va.localeCompare(vb as string) : (vb as string).localeCompare(va);
          }
          return bulletinSortDir === 'asc' ? (va as number) - (vb as number) : (vb as number) - (va as number);
        });
      }
    }
    return l;
  }, [bulletinSortCol, bulletinSortDir]);

  const countyTableRows = useMemo(() => {
    if (!selectedBulletin?.counties) return [];
    const keys = ['name', 'precip', 'surface', 'ground', 'total', 'totalUse', 'agri', 'gwUse'];
    let n = selectedBulletin.counties.filter((p): p is NonNullable<typeof p> => p != null).map(p => ({
      name: p.name,
      precip: p.precip ?? 0,
      surface: p.surface ?? 0,
      ground: p.ground ?? 0,
      total: p.total ?? 0,
      totalUse: p.totalUse ?? 0,
      agri: p.agri ?? 0,
      gwUse: p.gwUse ?? 0,
      hasData: p.precip != null,
    }));
    if (countySortCol != null) {
      const key = keys[countySortCol] as keyof typeof n[0];
      if (key) {
        n = n.sort((a, b) => countySortDir === 'asc' ? (a[key] as number) - (b[key] as number) : (b[key] as number) - (a[key] as number));
      }
    }
    return n;
  }, [selectedBulletin, countySortCol, countySortDir]);

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

function exportDataCSV<T>(data: T[], filename: string) {
  // Simple CSV export
  if (data.length === 0) return;
  const keys = Object.keys(data[0] as Record<string, unknown>);
  const csv = [
    keys.join(','),
    ...data.map(row =>
      keys.map(k => {
        const v = (row as Record<string, unknown>)[k];
        const s = String(v ?? '');
        return /[,"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      }).join(',')
    ),
  ].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
