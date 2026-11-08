import { useTabTransition } from '../hooks/useTabTransition';
import { useCallback } from 'react';
import { Layers, MapPin, Droplets, Database, GitBranch, Info, BookOpen, Calculator } from 'lucide-react';
import { systemZones, subZones, zoneBoundaryStats } from '../data/systemZoning';
import { exportDataCSV } from '../utils/exportUtils';
import { StatCard, DataSourceNote } from '../components/UI';
import { CrossLinkPanel } from '../components/CrossLink';
import { ZoneParamCalculatorTab } from '../components/hydrochemistry/ZoneParamCalculatorTab';
import { ZonesTab } from './systemZoningParts/ZonesTab';
import { SubZonesTab } from './systemZoningParts/SubZonesTab';
import { RechargeTab } from './systemZoningParts/RechargeTab';
import { ParamsTab } from './systemZoningParts/ParamsTab';
import { BoundaryTab } from './systemZoningParts/BoundaryTab';
import { ClassicTab } from './systemZoningParts/ClassicTab';

import { usePageCommons } from '../hooks/usePageCommons';

// 注册报告生成器
const TABS = [
  { key: 'zones', label: '一级分区', icon: Layers },
  { key: 'subzones', label: '子区明细', icon: GitBranch },
  { key: 'recharge', label: '补给排泄', icon: Droplets },
  { key: 'params', label: '含水层参数', icon: Database },
  { key: 'boundary', label: '边界类型', icon: MapPin },
  { key: 'classic', label: '经典分区', icon: BookOpen },
  { key: 'calculator', label: '参数计算器', icon: Calculator },
] as const;

type TabKey = typeof TABS[number]['key'];

export function SystemZoning() {

  const { success } = usePageCommons({
    pageName: 'system-zoning',
    collector: useCallback(async () => ({ systemZones, subZones }), []),
  });

  const [activeTab, setActiveTab] = useTabTransition<TabKey>('zones');

  const totalArea = systemZones.reduce((s, z) => s + z.area, 0);
  const totalSubZones = subZones.filter(z => z.type === '子区').length;
  const totalSubCells = subZones.filter(z => z.type === '小区').length;

  return (
    <div className="p-3 md:p-6 max-w-[1440px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gw-text">地下水系统区划</h1>
          <p className="text-xs text-gw-muted mt-1">一级/二级分区、补给排泄、含水层参数与边界类型</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-2 py-1 rounded text-[10px] bg-blue-500/15 text-blue-400 border border-blue-500/20">固定型</span>
          <button onClick={() => { exportDataCSV(systemZones, 'system-zones'); success('数据已导出'); }} className="text-xs text-gw-cyan/60 hover:text-gw-cyan transition-colors">
            导出数据
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3">
        <StatCard title="一级分区" value={String(systemZones.length)} unit="个" icon={Layers} accent="blue" />
        <StatCard title="子区" value={String(totalSubZones)} unit="个" icon={GitBranch} accent="cyan" />
        <StatCard title="小区" value={String(totalSubCells)} unit="个" icon={Layers} accent="emerald" />
        <StatCard title="总面积" value={totalArea.toLocaleString()} unit="km²" icon={MapPin} accent="amber" />
        <StatCard title="边界类型" value={String(zoneBoundaryStats.length)} unit="种" icon={Info} accent="red" />
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
      {activeTab === 'zones' && <ZonesTab />}
      {activeTab === 'subzones' && <SubZonesTab />}
      {activeTab === 'recharge' && <RechargeTab />}
      {activeTab === 'params' && <ParamsTab />}
      {activeTab === 'boundary' && <BoundaryTab />}
      {activeTab === 'calculator' && <ZoneParamCalculatorTab />}
      {activeTab === 'classic' && <ClassicTab />}

      <DataSourceNote source="1999基础文献 | 第五章 地下水系统区划及分区特征" version="v2.0" />
      <CrossLinkPanel currentPath="/system-zoning" />
    </div>
  );
}
