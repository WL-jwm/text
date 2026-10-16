/**
 * B-10 水源地保护区划分 Tab
 *
 * 5大面板：
 *  1. 计算器 — 输入水文地质参数 → 计算保护区半径/面积
 *  2. 同心圆图 — 保护区可视化（一级/二级/准保护区嵌套）
 *  3. 预设水源地 — 8个河北重要水源地保护区一览
 *  4. 经验值参考表 — HJ/T 338-2007附录A查表
 *  5. 介质参数参考 — 有效孔隙度/渗透系数
 * 主组件（面板已拆分至 protectionPanels/ 子目录）
 */
import { PipelinePanel } from '../PipelinePanel';
import { DataSourceNote } from '../UI';
import { Shield } from 'lucide-react';
import { useState } from 'react';
import { SUB_TABS, type SubTabKey } from './protectionPanels/protectionConstants';
import { CalculatorPanel } from './protectionPanels/CalculatorPanel';
import { EmpiricalTablePanel } from './protectionPanels/EmpiricalTablePanel';
import { MediumParamPanel } from './protectionPanels/MediumParamPanel';
import { PresetSourcesPanel } from './protectionPanels/PresetSourcesPanel';

export function ProtectionZoneTab() {
  const [activeSubTab, setActiveSubTab] = useState<SubTabKey>('calc');

  return (
    <div className="space-y-6">
      {/* 横幅 */}
      <div className="p-3 rounded-lg bg-gradient-to-r from-red-500/10 to-blue-500/10 border border-red-500/20">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-red-400" />
          <span className="text-sm text-red-400 font-medium">水源地保护区划分辅助系统</span>
        </div>
        <p className="text-xs text-gw-muted mt-1">基于 HJ/T 338-2007《饮用水水源保护区划分技术规范》，支持解析法（水质点迁移时间法）和经验法，适用于孔隙水/岩溶水/承压水/裂隙水水源地</p>
      </div>

      {/* 子Tab */}
      <div className="flex gap-1 bg-gw-surface rounded-lg p-1 overflow-x-auto scrollbar-none flex-wrap">
        {SUB_TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveSubTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs transition-all whitespace-nowrap ${activeSubTab === tab.key ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30' : 'text-gw-muted hover:text-gw-text'}`}>
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeSubTab === 'calc' && <CalculatorPanel />}
      {activeSubTab === 'preset' && <PresetSourcesPanel />}
      {activeSubTab === 'empirical' && <EmpiricalTablePanel />}
      {activeSubTab === 'medium' && <MediumParamPanel />}

      <DataSourceNote source="HJ/T 338-2007 饮用水水源保护区划分技术规范 | 河北省重要水源地资料" />
      <PipelinePanel moduleId="protectionZone" onReceive={(dataType, payload) => {
        if (dataType === 'aquiferParams') {
          const parts: string[] = [];
          if (payload.hydraulicConductivity) parts.push(`K=${payload.hydraulicConductivity} m/d`);
          if (payload.hydraulicGradient) parts.push(`I=${payload.hydraulicGradient}`);
          if (parts.length > 0) alert(`已接收含水层参数:\n${parts.join(', ')}\n\n请手动更新保护区划分参数。`);
        }
      }} />
    </div>
  );
}
