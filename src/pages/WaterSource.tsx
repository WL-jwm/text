import { useTabTransition } from '../hooks/useTabTransition';
import React, { useMemo, useCallback } from 'react';
import { Layers, Mountain, Droplets, Shield, Database, BookOpen, Waves, Activity, Lock } from 'lucide-react';
import { storageStructureSummary, karstBasinStructures, alluvialFanStructures, importantWaterSources, mountainFrontRichZones } from '../data/waterSource';
import { exportDataCSV } from '../utils/exportUtils';
import { StatCard, DataSourceNote } from '../components/UI';
import { CrossLinkPanel } from '../components/CrossLink';
import { CHART_COLORS } from '../components/UI';
import { WaterSourceOverviewTab } from '../components/water-source/WaterSourceOverviewTab';
import { WaterSourceKarstTab } from '../components/water-source/WaterSourceKarstTab';
import { WaterSourceAlluvialTab } from '../components/water-source/WaterSourceAlluvialTab';
import { WaterSourceImportantTab } from '../components/water-source/WaterSourceImportantTab';
import { WaterSourceClassificationTab } from '../components/water-source/WaterSourceClassificationTab';
import { WaterSourceStandardTab } from '../components/water-source/WaterSourceStandardTab';
import { WaterSourceClassicTab } from '../components/water-source/WaterSourceClassicTab';
import { WaterSourceIrrigationTab } from '../components/water-source/WaterSourceIrrigationTab';
import { ProtectionZoneTab } from '../components/water-source/ProtectionZoneTab';
import { IntermontaneBasinSection } from '../components/water-source/IntermontaneBasinSection';
import { PaleochannelSection } from '../components/water-source/PaleochannelSection';

import { usePageCommons } from '../hooks/usePageCommons'
// 注册报告生成器
const TABS = [
  { key: 'overview', label: '总览', icon: Layers },
  { key: 'karst', label: '岩溶盆地', icon: Mountain },
  { key: 'alluvial', label: '冲洪积扇', icon: Droplets },
  { key: 'important', label: '重要水源地', icon: Shield },
  { key: 'classification', label: '水源地分类', icon: Database },
  { key: 'standard', label: '规模标准', icon: BookOpen },
  { key: 'classic', label: '经典参数', icon: BookOpen },
  { key: 'irrigation', label: '灌区概况', icon: Waves },
  { key: 'protection', label: '保护区划分', icon: Lock },
] as const;

type TabKey = string;

export function WaterSource() {

  const { success } = usePageCommons({
    pageName: 'water-source',
    collector: useCallback(async () => ({ summary: storageStructureSummary, karstBasin: karstBasinStructures }), []),
  });

  const [activeTab, setActiveTab] = useTabTransition<TabKey>('overview');

  const summaryPie = useMemo(() => storageStructureSummary.map((s, i) => ({ name: s.type, value: s.count, color: CHART_COLORS[i % CHART_COLORS.length] })), []);
  const totalStructures = storageStructureSummary.reduce((s, x) => s + x.count, 0);

  const structureBarData = useMemo(() => storageStructureSummary.map(s => ({
    name: s.type.length > 6 ? s.type.slice(0, 6) : s.type,
    count: s.count,
  })).sort((a, b) => b.count - a.count), []);

  const karstAreaData = useMemo(() => karstBasinStructures.map(s => ({
    name: s.name.length > 6 ? s.name.slice(0, 6) : s.name,
    area: parseFloat(s.area) || 0,
    exposed: String(s.exposedArea),
  })).sort((a, b) => b.area - a.area), []);

  const richZoneBarData = useMemo(() => mountainFrontRichZones.map(z => ({
    name: z.zone.length > 5 ? z.zone.slice(0, 5) : z.zone,
    width: parseFloat(z.width) || 5,
    K: parseFloat(z.K) || 20,
  })), []);

  const richRadarData = useMemo(() => {
    const maxK = Math.max(...mountainFrontRichZones.map(z => parseFloat(z.K) || 0));
    const maxW = Math.max(...mountainFrontRichZones.map(z => parseFloat(z.width) || 0));
    const maxY = Math.max(...mountainFrontRichZones.map(z => parseFloat(z.yield) || 0));
    return mountainFrontRichZones.map(z => ({
      zone: z.zone.length > 4 ? z.zone.slice(0, 4) : z.zone,
      渗透系数: Math.round(((parseFloat(z.K) || 0) / maxK) * 100),
      宽度: Math.round(((parseFloat(z.width) || 0) / maxW) * 100),
      出水量: Math.round(((parseFloat(z.yield) || 0) / maxY) * 100),
    }));
  }, []);

  const sourceTypePie = useMemo(() => {
    const typeCount: Record<string, number> = {};
    importantWaterSources.forEach(s => {
      typeCount[s.type] = (typeCount[s.type] || 0) + 1;
    });
    return Object.entries(typeCount).map(([name, value], i) => ({ name, value, color: CHART_COLORS[i % CHART_COLORS.length] }));
  }, []);

  // 报告数据预采集（增量缓存）
  return (
    <div className="p-3 md:p-6 max-w-[1440px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gw-text">水源地蓄水构造</h1>
          <p className="text-xs text-gw-muted mt-1">蓄水构造类型、重要水源地与山前富水带</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-2 py-1 rounded text-[10px] bg-blue-500/15 text-blue-400 border border-blue-500/20">稳定型</span>
          <button onClick={() => { exportDataCSV(importantWaterSources, 'important-water-sources'); success('数据已导出'); }} className="text-xs text-gw-cyan/60 hover:text-gw-cyan transition-colors">
            导出数据
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3">
        <StatCard title="蓄水构造" value={String(totalStructures)} unit="处" icon={Layers} accent="blue" />
        <StatCard title="重要水源地" value={String(importantWaterSources.length)} unit="处" icon={Shield} accent="emerald" />
        <StatCard title="山前富水带" value={String(mountainFrontRichZones.length)} unit="处" icon={Activity} accent="cyan" />
        <StatCard title="岩溶盆地" value={String(karstBasinStructures.length)} unit="个" icon={Mountain} accent="amber" />
        <StatCard title="冲洪积扇" value={String(alluvialFanStructures.length)} unit="个" icon={Droplets} accent="red" />
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

      {activeTab === 'overview' && <WaterSourceOverviewTab summaryPie={summaryPie} structureBarData={structureBarData} sourceTypePie={sourceTypePie} />}
      {activeTab === 'karst' && <WaterSourceKarstTab karstAreaData={karstAreaData} />}
      {activeTab === 'alluvial' && <WaterSourceAlluvialTab richZoneBarData={richZoneBarData} richRadarData={richRadarData} />}
      {activeTab === 'important' && <WaterSourceImportantTab sourceTypePie={sourceTypePie} />}
      {activeTab === 'classification' && <WaterSourceClassificationTab />}
      {activeTab === 'standard' && <WaterSourceStandardTab />}
      {activeTab === 'classic' && <WaterSourceClassicTab />}
      {activeTab === 'irrigation' && <WaterSourceIrrigationTab />}
      {activeTab === 'protection' && <ProtectionZoneTab />}

      <IntermontaneBasinSection />
      <PaleochannelSection />

      <CrossLinkPanel currentPath="/water-source" />
      <DataSourceNote source="1999基础文献 | 第七章 地下水资源与开发利用" version="v3.1" />
    </div>
  );
}
