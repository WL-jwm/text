import { useTabTransition } from '../hooks/useTabTransition';
import React, { useState, useMemo, useCallback } from 'react';
import { TrendingDown, AlertTriangle, ArrowDown, Shield, Activity, Droplets, CheckCircle2 } from 'lucide-react';
import { shallowCones2024, shallowTotal2024, deepCones2024, deepTotal2024, historicalCones, landSubsidence, landSubsidence2024, subsidenceRateTrend, envStatus2024, envProblems } from '../data/environment';
import { StatCard, DataSourceNote } from '../components/UI';
import { CrossLinkPanel } from '../components/CrossLink';
import { useToast } from '../components/Toast';
import { ChartExport } from '../components/ChartExport';
import { useReportData } from '../hooks/useReportData';
import { ExportProgressDialog } from '../components/ExportProgressDialog';
// 注册环境地质简报报告生成器（side-effect import）
import { EnvironmentShallowTab } from '../components/environment/EnvironmentShallowTab';
import { EnvironmentDeepTab } from '../components/environment/EnvironmentDeepTab';
import { EnvironmentSubsidenceTab } from '../components/environment/EnvironmentSubsidenceTab';
import { EnvironmentOverviewTab } from '../components/environment/EnvironmentOverviewTab';

const TABS = [
  { key: 'shallow', label: '浅层漏斗', icon: TrendingDown },
  { key: 'deep', label: '深层漏斗', icon: AlertTriangle },
  { key: 'subsidence', label: '地面沉降', icon: ArrowDown },
  { key: 'overview', label: '环境总览', icon: Shield },
] as const;

type TabKey = string;

export function Environment() {
  const {} = useToast();
  const [activeTab, setActiveTab] = useTabTransition<TabKey>('shallow');
  const [exportOpen, setExportOpen] = useState(false);

  const shallowBar = useMemo(() => shallowCones2024.map(c => ({
    name: c.name.replace('浅层漏斗', ''),
    currentArea: c.area,
    prevArea: c.prevArea,
    change: c.areaChange,
  })), []);

  const shallowPieData = useMemo(() =>
    shallowCones2024.map(c => ({
      name: c.name.replace('浅层漏斗', ''),
      value: Math.abs(c.area),
    })).sort((a, b) => b.value - a.value),
  []);

  const subsidenceData = useMemo(() => landSubsidence.map(s => ({
    name: s.city, total: s.totalMm, rate: s.rateMmPerYear,
  })).sort((a, b) => b.total - a.total), []);

  const subsidenceGrades = useMemo(() => {
    const severe = landSubsidence.filter(s => s.totalMm >= 1000).length;
    const moderate = landSubsidence.filter(s => s.totalMm >= 500 && s.totalMm < 1000).length;
    const slight = landSubsidence.filter(s => s.totalMm < 500).length;
    return [
      { name: '重度(>=1000mm)', count: severe, fill: '#ef4444' },
      { name: '中等(500-1000mm)', count: moderate, fill: '#f59e0b' },
      { name: '轻度(<500mm)', count: slight, fill: '#3b82f6' },
    ];
  }, []);

  const historicalCompareData = useMemo(() => {
    return historicalCones.map(hc => {
      const matching = deepCones2024.find(dc => dc.name.includes(hc.name.replace('深层漏斗', '').slice(0, 2)));
      return {
        name: hc.name.replace('深层漏斗', ''),
        historical: parseFloat(hc.area) || 0,
        current: matching ? matching.area : 0,
      };
    });
  }, []);

  // 报告数据预采集（增量缓存）
  const { getData, isLoading: dataLoading } = useReportData({
    pageName: 'environment',
    collector: useCallback(async () => ({
      shallowCones: shallowCones2024,
      shallowTotal: shallowTotal2024,
      deepCones: deepCones2024,
      deepTotal: deepTotal2024,
      historicalCones,
      subsidence2024: landSubsidence2024,
      subsidenceTrend: subsidenceRateTrend,
      envStatus: envStatus2024,
      envProblems,
      conclusion: '2024年河北省环境地质状况持续改善，深层地下水漏斗全部消散，地面沉降速率连续六年下降，超采治理取得历史性成效。建议继续巩固治理成果，加强地面沉降监测网络建设，推进深层地下水回补试验，确保地下水资源的可持续利用。',
    }), []),
    autoCollect: true,
  });

  return (
    <div className="p-3 md:p-6 max-w-[1440px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gw-text">环境地质</h1>
          <p className="text-xs text-gw-muted mt-1">地下水漏斗、地面沉降与环境治理成效</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-2 py-1 rounded text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">2024年</span>
          <ChartExport
            data={shallowCones2024}
            filename="shallow-cones-2024"
            sheetName="浅层漏斗"
            formats={['xlsx', 'csv', 'json']}
            label="导出数据"
          />
          <button onClick={() => setExportOpen(true)}
            className="text-xs bg-emerald-600/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600/25 px-2.5 py-1 rounded transition-colors">
            导出报告
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        <StatCard title="浅层漏斗面积" value={shallowTotal2024.totalArea.toLocaleString()} unit="km²" icon={TrendingDown} accent="amber" subtitle={`较上年${shallowTotal2024.areaChange > 0 ? '+' : ''}${shallowTotal2024.areaChange}km²`} />
        <StatCard title="深层漏斗" value={deepTotal2024.status} icon={CheckCircle2} accent="emerald" subtitle={`消散${Math.abs(deepTotal2024.areaChange)}km²`} />
        <StatCard title="水位变化" value={shallowTotal2024.levelChange} icon={Activity} accent="blue" />
        <StatCard title="超采区减少" value="31" unit="%" icon={Droplets} accent="cyan" subtitle="严重超采区减少99%" />
      </div>

      <div className="flex gap-1 bg-gw-surface rounded-lg p-1 overflow-x-auto scrollbar-none">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs transition-all ${activeTab === tab.key ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30' : 'text-gw-muted hover:text-gw-text'}`}>
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'shallow' && <EnvironmentShallowTab shallowBar={shallowBar} shallowPieData={shallowPieData} />}
      {activeTab === 'deep' && <EnvironmentDeepTab historicalCompareData={historicalCompareData} />}
      {activeTab === 'subsidence' && <EnvironmentSubsidenceTab subsidenceData={subsidenceData} subsidenceGrades={subsidenceGrades} />}
      {activeTab === 'overview' && <EnvironmentOverviewTab />}

      <DataSourceNote source="2024年12月浅层漏斗数据 + 1999基础文献" version="v3.1" />
      <CrossLinkPanel currentPath="/environment" />

      {/* 导出报告对话框 */}
      <ExportProgressDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        reportType="environment"
        reportLabel="河北省环境地质简报"
        data={getData()}
        dataLoading={dataLoading}
      />
    </div>
  );
}
