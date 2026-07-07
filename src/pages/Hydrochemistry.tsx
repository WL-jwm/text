import React, { useState, useMemo, useCallback } from 'react';
import { FlaskConical, Layers, Atom, MapPin, Droplets, BookOpen, Zap, Database } from 'lucide-react';
import { hydrochemistry, hydrochemicalByRegion, isotopeSamples, salineWater } from '../data/hydrochemistry';
import { salineDistribution } from '../data/salineWater';
import { exportDataCSV } from '../utils/exportUtils';
import { StatCard, DataSourceNote, CHART_COLORS } from '../components/UI';
import type {  TdsBarItem, FluorideBarItem, PhBarItem,  SukaliefClassification, HydrochemicalByRegion} from '../types/county';
import { CrossLinkPanel } from '../components/CrossLink';
import { HydrochemClassificationTab } from '../components/hydrochemistry/HydrochemClassificationTab';
import { HydrochemZoningTab } from '../components/hydrochemistry/HydrochemZoningTab';
import { HydrochemIsotopeTab } from '../components/hydrochemistry/HydrochemIsotopeTab';
import { HydrochemRegionalTab } from '../components/hydrochemistry/HydrochemRegionalTab';
import { HydrochemInterfaceTab } from '../components/hydrochemistry/HydrochemInterfaceTab';
import { HydrochemGeophysicalTab } from '../components/hydrochemistry/HydrochemGeophysicalTab';
import { HydrochemIonMobilityTab } from '../components/hydrochemistry/HydrochemIonMobilityTab';
import { HydrochemChengdeTab } from '../components/hydrochemistry/HydrochemChengdeTab';
import { HydrochemResistivityTab } from '../components/hydrochemistry/HydrochemResistivityTab';

import { usePageCommons } from '../hooks/usePageCommons'
// 注册报告生成器
const TABS = [
  { key: 'classification', label: '苏卡列夫分类', icon: FlaskConical },
  { key: 'zoning', label: '水平分带', icon: Layers },
  { key: 'isotope', label: '同位素', icon: Atom },
  { key: 'regional', label: '分区指标', icon: MapPin },
  { key: 'interface', label: '咸淡水界面', icon: Droplets },
  { key: 'geophysical', label: '物探参数', icon: BookOpen },
  { key: 'ionMobility', label: '离子迁移率', icon: Zap },
  { key: 'chengde', label: '承德水化学', icon: MapPin },
  { key: 'resistivity', label: '电阻率详表', icon: Database },
] as const;

type TabKey = typeof TABS[number]['key'];

export function Hydrochemistry() {

  const { success } = usePageCommons({
    pageName: 'hydrochemistry',
    collector: useCallback(async () => ({ salineWaterOverview: salineWater, salineDistribution }), []),
  });

  const [activeTab, setActiveTab] = useState<TabKey>('classification');

  // ── 图表数据 ──
  const classPie = useMemo(() =>
    hydrochemistry.sukaliefClassification.map((c: SukaliefClassification, i: number) => ({
      name: c.type.split('(')[0],
      value: parseInt(c.percentage) || 0,
      color: CHART_COLORS[i % CHART_COLORS.length],
    })),
    []
  );

  const radarData = useMemo(() =>
    hydrochemistry.sukaliefClassification.map((c: SukaliefClassification) => ({
      type: c.type.split('(')[0],
      percentage: parseInt(c.percentage) || 0,
      tds: parseInt(c.typicalTDS) || 0,
    })),
    []
  );

  const tdsBarData = useMemo(() =>
    hydrochemicalByRegion.map((r: HydrochemicalByRegion) => ({
      name: r.region,
      tds: r.tds,
      hardness: r.hardness,
      sulfate: r.sulfate,
      chloride: r.chloride,
    })).sort((a: TdsBarItem, b: TdsBarItem) => b.tds - a.tds),
    []
  );

  const fluorideBarData = useMemo(() =>
    hydrochemicalByRegion.map((r: HydrochemicalByRegion) => ({
      name: r.region,
      fluoride: r.fluoride,
    })).sort((a: FluorideBarItem, b: FluorideBarItem) => b.fluoride - a.fluoride),
    []
  );

  const phBarData = useMemo(() =>
    hydrochemicalByRegion.map((r: HydrochemicalByRegion) => ({
      name: r.region,
      ph: r.ph,
    })).sort((a: PhBarItem, b: PhBarItem) => b.ph - a.ph),
    []
  );

  const isoShallow = useMemo(() =>
    isotopeSamples.filter((s) => s.type === 'shallow').map((s) => ({ x: s.delta18O, y: s.deltaD, z: s.tritium, name: s.location })),
    []
  );
  const isoMid = useMemo(() =>
    isotopeSamples.filter((s) => s.type === 'mid').map((s) => ({ x: s.delta18O, y: s.deltaD, z: s.tritium, name: s.location })),
    []
  );
  const isoDeep = useMemo(() =>
    isotopeSamples.filter((s) => s.type === 'deep').map((s) => ({ x: s.delta18O, y: s.deltaD, z: s.tritium, name: s.location })),
    []
  );
  const isoKarst = useMemo(() =>
    isotopeSamples.filter((s) => s.type === 'karst').map((s) => ({ x: s.delta18O, y: s.deltaD, z: s.tritium, name: s.location })),
    []
  );

  // 报告数据预采集（增量缓存）
  return (
    <div className="p-3 md:p-6 max-w-[1440px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gw-text">水化学与同位素</h1>
          <p className="text-xs text-gw-muted mt-1">水化学分类、水平分带、环境同位素与咸淡水界面</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-2 py-1 rounded text-[10px] bg-blue-500/15 text-blue-400 border border-blue-500/20">v2.0</span>
          <button onClick={() => { exportDataCSV(hydrochemicalByRegion, 'hydrochemistry-regional'); success('数据已导出'); }} className="text-xs text-gw-cyan/60 hover:text-gw-cyan transition-colors">
            导出数据
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        <StatCard title="水化学类型" value="4" unit="大类" icon={FlaskConical} accent="blue" />
        <StatCard title="水平分带" value="4" unit="区" icon={Layers} accent="cyan" />
        <StatCard title="同位素分区" value="3" unit="个" icon={Atom} accent="emerald" />
        <StatCard title="咸水储量" value={String(salineWater.distribution.totalStorage)} unit="亿m³" icon={Droplets} accent="amber" />
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

      {activeTab === 'classification' && <HydrochemClassificationTab classPie={classPie} radarData={radarData} />}
      {activeTab === 'zoning' && <HydrochemZoningTab />}
      {activeTab === 'isotope' && <HydrochemIsotopeTab isoShallow={isoShallow} isoMid={isoMid} isoDeep={isoDeep} isoKarst={isoKarst} />}
      {activeTab === 'regional' && <HydrochemRegionalTab tdsBarData={tdsBarData} fluorideBarData={fluorideBarData} phBarData={phBarData} />}
      {activeTab === 'interface' && <HydrochemInterfaceTab />}
      {activeTab === 'geophysical' && <HydrochemGeophysicalTab />}
      {activeTab === 'ionMobility' && <HydrochemIonMobilityTab />}
      {activeTab === 'chengde' && <HydrochemChengdeTab />}
      {activeTab === 'resistivity' && <HydrochemResistivityTab />}

      <DataSourceNote source="1999基础文献 + 2024河北省水资源公报 + 第三次土壤普查" version="v2.0" />
      <CrossLinkPanel currentPath="/hydrochemistry" />
    </div>
  );
}
