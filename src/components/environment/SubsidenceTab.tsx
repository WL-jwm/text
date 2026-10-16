/**
 * B-12 地面沉降与降落漏斗分析 Tab
 *
 * 4大面板：
 *  1. 漏斗计算器 — 水文地质参数输入→漏斗半径/降深/体积
 *  2. 沉降估算 — 土层参数→分层沉降量+总沉降
 *  3. 趋势分析 — 历史沉降趋势+预测
 *  4. 沉降风险 — 河北典型沉降区+风险分区
 * 主组件（面板已拆分至 subsidencePanels/ 子目录）
 */
import { DataSourceNote } from '../UI';
import { ArrowDown } from 'lucide-react';
import { useState } from 'react';
import { SUB_TABS, type SubTabKey } from './subsidencePanels/subsidenceConstants';
import { ConeCalculatorPanel } from './subsidencePanels/ConeCalculatorPanel';
import { RiskReferencePanel } from './subsidencePanels/RiskReferencePanel';
import { SubsidenceCalcPanel } from './subsidencePanels/SubsidenceCalcPanel';
import { TrendPanel } from './subsidencePanels/TrendPanel';

export function SubsidenceTab() {
  const [activeSubTab, setActiveSubTab] = useState<SubTabKey>('cone');

  return (
    <div className="space-y-6">
      <div className="p-3 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
        <div className="flex items-center gap-2">
          <ArrowDown size={16} className="text-orange-400" />
          <span className="text-sm text-orange-400 font-medium">地面沉降与降落漏斗分析</span>
        </div>
        <p className="text-xs text-gw-muted mt-1">支持Dupuit/Theis/经验公式三种模型计算降落漏斗，基于有效应力原理估算地面沉降量，服务于环评疏干排水影响预测</p>
      </div>

      <div className="flex gap-1 bg-gw-surface rounded-lg p-1 overflow-x-auto scrollbar-none flex-wrap">
        {SUB_TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveSubTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs transition-all whitespace-nowrap ${activeSubTab === tab.key ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30' : 'text-gw-muted hover:text-gw-text'}`}>
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeSubTab === 'cone' && <ConeCalculatorPanel />}
      {activeSubTab === 'subsidence' && <SubsidenceCalcPanel />}
      {activeSubTab === 'trend' && <TrendPanel />}
      {activeSubTab === 'ref' && <RiskReferencePanel />}

      <DataSourceNote source="Theis(1935) | Dupuit | Terzaghi有效应力原理 | 河北省地面沉降监测资料" />
    </div>
  );
}
