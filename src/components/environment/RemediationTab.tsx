/**
 * B-38 地下水修复方案评估器 Tab
 * 主组件：Tab 状态编排（面板组件已拆分至 ./panels/）
 */
import { useState } from 'react';
import { TechCard, DataSourceNote } from '../UI';
import { TABS, type TabKey } from './remediationConstants';
import { PRBPanel } from './panels/PRBPanel';
import { PATPanel } from './panels/PATPanel';
import { MNAPanel } from './panels/MNAPanel';
import { BioPanel } from './panels/BioPanel';
import { ASPanel } from './panels/ASPanel';
import { MCDAPanel } from './panels/MCDAPanel';
import { ReferencePanel } from './panels/ReferencePanel';

export function RemediationTab() {
  const [activeTab, setActiveTab] = useState<TabKey>('prb');
  
  return (
    <div className="space-y-4">
      <TechCard>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-semibold text-slate-100">地下水修复方案评估器</h2>
          <span className="text-xs text-slate-500">B-38</span>
        </div>
        <p className="text-xs text-slate-400">
          涵盖PRB反应墙、抽出处理、自然衰减、生物修复、气相抽提五大技术评估，支持多准则方案比选(MCDA)与成本效益分析
        </p>
      </TechCard>
      
      <div className="flex flex-wrap gap-1.5">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'bg-slate-800/40 text-slate-400 border border-slate-700/50 hover:bg-slate-800/60 hover:text-slate-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>
      
      {activeTab === 'prb' && <PRBPanel />}
      {activeTab === 'pat' && <PATPanel />}
      {activeTab === 'mna' && <MNAPanel />}
      {activeTab === 'bio' && <BioPanel />}
      {activeTab === 'as' && <ASPanel />}
      {activeTab === 'mcda' && <MCDAPanel />}
      {activeTab === 'ref' && <ReferencePanel />}
      
      <DataSourceNote source="基于EPA技术指南与HJ 25.6-2019污染地块地下水修复技术导则，参数可调" />
    </div>
  );
}
