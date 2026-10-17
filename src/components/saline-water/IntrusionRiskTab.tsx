/**
 * B-13 咸水入侵风险评价 Tab
 *
 * 4大面板：
 *  1. 风险计算器 — Cl⁻输入+界面参数→综合评分
 *  2. 监测井预警 — 预设8个监测井风险排名
 *  3. 预测趋势 — Cl⁻浓度线性外推预测
 *  4. 防治参考 — 风险等级对应措施
 * 主组件（面板已拆分至 intrusionPanels/ 子目录）
 */
import { DataSourceNote } from '../UI';
import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { SUB_TABS, type SubTabKey } from './intrusionPanels/intrusionConstants';
import { MonitoringWellsPanel } from './intrusionPanels/MonitoringWellsPanel';
import { PredictPanel } from './intrusionPanels/PredictPanel';
import { ReferencePanel } from './intrusionPanels/ReferencePanel';
import { RiskCalculatorPanel } from './intrusionPanels/RiskCalculatorPanel';

export function IntrusionRiskTab() {
  const [activeSubTab, setActiveSubTab] = useState<SubTabKey>('calc');

  return (
    <div className="space-y-6">
      <div className="p-3 rounded-lg bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-400" />
          <span className="text-sm text-red-400 font-medium">海水入侵风险评价系统</span>
        </div>
        <p className="text-xs text-gw-muted mt-1">基于Cl⁻浓度变化、咸淡水界面动态(Ghyben-Herzberg公式)、距海岸距离等多维度综合评估海水入侵风险等级</p>
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

      {activeSubTab === 'calc' && <RiskCalculatorPanel />}
      {activeSubTab === 'wells' && <MonitoringWellsPanel />}
      {activeSubTab === 'predict' && <PredictPanel />}
      {activeSubTab === 'ref' && <ReferencePanel />}

      <DataSourceNote source="Ghyben-Herzberg公式 | GB/T 14848-2017 | 河北省海水入侵监测资料" />
    </div>
  );
}
