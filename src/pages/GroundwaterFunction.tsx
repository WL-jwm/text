import { useTabTransition } from '../hooks/useTabTransition';
import React, { useMemo, useCallback } from 'react';
import {
  AlertTriangle, MapPin, TrendingUp, Layers, Ban, CheckCircle2, Calculator, ClipboardList,
} from 'lucide-react';
import {
  overdraftOverview, cityOverdraftZones, restrictedZones,
  waterLevelRecovery, groundwaterFunctionZones, overdraftControlResults,
} from '../data/groundwaterFunction';
import { SectionTitle, StatCard, DataSourceNote } from '../components/UI';
import { usePageCommons } from '../hooks/usePageCommons';
import { ExportProgressDialog } from '../components/ExportProgressDialog';
import { CrossLinkPanel } from '../components/CrossLink';
import { FunctionOverviewTab } from './groundwater/FunctionOverviewTab';
import { FunctionCityTab } from './groundwater/FunctionCityTab';
import { FunctionZonesTab } from './groundwater/FunctionZonesTab';
import { FunctionRecoveryTab } from './groundwater/FunctionRecoveryTab';
import { FunctionRestrictedTab } from './groundwater/FunctionRestrictedTab';
import { GroundwaterFunctionCalculatorTab } from '../components/groundwater/GroundwaterFunctionCalculatorTab';
import { DecisionSupportTab } from '../components/groundwater/DecisionSupportTab';

const TABS = [
  { key: 'overview', label: '超采总览', icon: AlertTriangle },
  { key: 'city', label: '各市分布', icon: MapPin },
  { key: 'zones', label: '功能区划', icon: Layers },
  { key: 'recovery', label: '水位回升', icon: TrendingUp },
  { key: 'restricted', label: '禁采/限采', icon: Ban },
  { key: 'calculator', label: '功能评价', icon: Calculator },
  { key: 'decision', label: '决策支持', icon: ClipboardList },
] as const;
type TabKey = (typeof TABS)[number]['key'];

export function GroundwaterFunction() {
  const { setExportOpen, exportOpen, getData, dataLoading } = usePageCommons({
    pageName: 'groundwater-function',
    collector: useCallback(async () => ({
      overdraftOverview,
      cityOverdraftZones,
      restrictedZones,
      waterLevelRecovery,
      groundwaterFunctionZones,
      overdraftControlResults,
    }), []),
  });

  const [activeTab, setActiveTab] = useTabTransition<TabKey>('overview');

  // ── 衍生数据 ──
  const typePieData = useMemo(() => [
    { name: '浅层超采区', value: overdraftOverview.shallowOverdraft, color: '#f59e0b' },
    { name: '深层超采区', value: overdraftOverview.deepOverdraft, color: '#ef4444' },
    { name: '重叠面积', value: overdraftOverview.overlapArea, color: '#8b5cf6' },
  ], []);

  const cityTypeData = useMemo(() =>
    cityOverdraftZones.map(c => ({
      name: c.city,
      shallow: c.shallowType !== '—' ? 1 : 0,
      deep: c.deepType !== '—' ? 1 : 0,
      severeDeep: c.deepType === '严重超采区' ? 1 : 0,
    })),
    []
  );

  const funcZoneRadar = useMemo(() =>
    groundwaterFunctionZones.map(z => ({
      name: z.zone,
      value: 100,
    })),
    []
  );

  const recoveryChartData = useMemo(() =>
    waterLevelRecovery.annualData.map(d => ({
      year: String(d.year),
      shallowDepth: d.shallowDepth,
      deepDepth: d.deepDepth,
      shallowRise: d.shallowRise,
      deepRise: d.deepRise,
    })),
    []
  );

  // ── 导出数据 ──
  const cityExportData = useMemo(() =>
    cityOverdraftZones.map(c => ({
      城市: c.city,
      浅层超采类型: c.shallowType,
      浅层超采范围: c.shallowArea,
      深层超采类型: c.deepType,
      深层超采范围: c.deepArea,
      备注: c.note,
    })),
    []
  );

  const recoveryExportData = useMemo(() =>
    waterLevelRecovery.annualData.map(d => ({
      年份: d.year,
      浅层埋深_m: d.shallowDepth,
      深层埋深_m: d.deepDepth,
      浅层回升_m: d.shallowRise,
      深层回升_m: d.deepRise,
      备注: d.note,
    })),
    []
  );

  return (
    <div className="p-3 md:p-6 max-w-[1440px] mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <SectionTitle icon={AlertTriangle}>地下水超采区划与功能区</SectionTitle>
          <p className="text-xs text-gw-muted mt-1">超采区分布 · 功能区划 · 水位回升 · 禁采/限采区</p>
        </div>
        <button
          onClick={() => setExportOpen(true)}
          className="px-3 py-1.5 rounded-lg text-xs bg-gw-blue/15 text-gw-highlight border border-gw-blue/30 hover:bg-gw-blue/25 transition-all"
        >
          导出报告
        </button>
      </div>

      {/* 关键指标 */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3">
        <StatCard title="超采区总面积" value={String(overdraftOverview.totalArea.toLocaleString())} unit="km²" icon={AlertTriangle} accent="red" />
        <StatCard title="浅层超采" value={String(overdraftOverview.shallowOverdraft.toLocaleString())} unit="km²" icon={MapPin} accent="amber" />
        <StatCard title="深层超采" value={String(overdraftOverview.deepOverdraft.toLocaleString())} unit="km²" icon={MapPin} accent="orange" />
        <StatCard title="浅层水位回升" value={String(waterLevelRecovery.shallowRecovery)} unit="m(2019-2023)" icon={TrendingUp} accent="green" />
        <StatCard title="深层水位回升" value={String(waterLevelRecovery.deepRecovery)} unit="m(2019-2023)" icon={TrendingUp} accent="emerald" />
        <StatCard title="水位回升县" value={String(overdraftControlResults.shallowRiseCounties)} unit="浅层" icon={CheckCircle2} accent="cyan" />
      </div>

      {/* Tab 切换 */}
      <div className="flex gap-1 bg-gw-surface rounded-lg p-1 overflow-x-auto scrollbar-none">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30'
                : 'text-gw-muted hover:text-gw-text'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 内容 */}
      {activeTab === 'overview' && (
        <FunctionOverviewTab typePieData={typePieData} cityTypeData={cityTypeData} />
      )}
      {activeTab === 'city' && (
        <FunctionCityTab cityExportData={cityExportData} />
      )}
      {activeTab === 'zones' && (
        <FunctionZonesTab funcZoneRadar={funcZoneRadar} />
      )}
      {activeTab === 'recovery' && (
        <FunctionRecoveryTab recoveryChartData={recoveryChartData} recoveryExportData={recoveryExportData} />
      )}
      {activeTab === 'restricted' && (
        <FunctionRestrictedTab />
      )}

      {activeTab === 'calculator' && <GroundwaterFunctionCalculatorTab />}
      {activeTab === 'decision' && <DecisionSupportTab />}

      <ExportProgressDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        reportType="groundwater-function"
        reportLabel="河北省地下水超采区划报告"
        data={getData()}
        dataLoading={dataLoading}
      />
      <CrossLinkPanel currentPath="/groundwater-function" />
      <DataSourceNote source="河北省人民政府《关于公布地下水超采区和禁止开采区、限制开采区范围的通知》(2022) | 河北省水利厅超采区监测通报(2020-2024) | 河北省地下水功能区划报告" />
    </div>
  );
}
