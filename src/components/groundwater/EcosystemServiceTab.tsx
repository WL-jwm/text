/**
 * 主组件（面板已拆分至 ecoPanels/ 子目录）
 */
import { type CulturalServiceInput, type SupplyServiceInput, type RegulationServiceInput, type SupportingServiceInput, REGION_PRESETS, calculateEcosystemService } from '../../utils/ecosystemServiceEvaluator';
import { DataSourceNote, TechCard } from '../UI';
import { useMemo, useState } from 'react';
import { TABS, type TabKey } from './ecoPanels/ecoConstants';
import { CulturalPanel } from './ecoPanels/CulturalPanel';
import { EcoDemandPanel } from './ecoPanels/EcoDemandPanel';
import { OverviewPanel } from './ecoPanels/OverviewPanel';
import { ReferencePanel } from './ecoPanels/ReferencePanel';
import { RegulationPanel } from './ecoPanels/RegulationPanel';
import { SupplyPanel } from './ecoPanels/SupplyPanel';
import { TransferPanel } from './ecoPanels/TransferPanel';

export function EcosystemServiceTab() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [presetId, setPresetId] = useState('hebei_plain');
  
  const preset = REGION_PRESETS.find(p => p.id === presetId) || REGION_PRESETS[0];
  
  const result = useMemo(() => calculateEcosystemService(
    preset.supply as SupplyServiceInput,
    preset.regulation as RegulationServiceInput,
    preset.cultural as CulturalServiceInput,
    preset.supporting as SupportingServiceInput,
    preset.population,
  ), [preset]);
  
  return (
    <div className="space-y-4">
      <TechCard>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-semibold text-slate-100">地下水生态系统服务评估器</h2>
          <span className="text-xs text-slate-500">B-39</span>
        </div>
        <p className="text-xs text-slate-400">
          基于TEV框架评估地下水四大生态系统服务(供给/调节/文化/支持)价值，含生态需水量计算与价值转移法估算
        </p>
      </TechCard>
      
      <TechCard>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-slate-400">预设区域:</span>
          <select value={presetId} onChange={e => setPresetId(e.target.value)}
            className="bg-slate-800/60 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none">
            {REGION_PRESETS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="text-xs text-slate-500">{preset.description}</div>
      </TechCard>
      
      <div className="flex flex-wrap gap-1.5">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-slate-800/40 text-slate-400 border border-slate-700/50 hover:bg-slate-800/60 hover:text-slate-300'
              }`}>
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>
      
      {activeTab === 'overview' && <OverviewPanel result={result} />}
      {activeTab === 'supply' && <SupplyPanel supply={result.supply} />}
      {activeTab === 'regulation' && <RegulationPanel regulation={result.regulation} />}
      {activeTab === 'cultural' && <CulturalPanel cultural={result.cultural} supporting={result.supporting} />}
      {activeTab === 'demand' && <EcoDemandPanel />}
      {activeTab === 'transfer' && <TransferPanel />}
      {activeTab === 'ref' && <ReferencePanel />}
      
      <DataSourceNote source="基于TEV框架与MA分类体系, 参考Costanza(2014)和GB/T 38582-2020" />
    </div>
  );
}
