/**
 * B-11 水化学分析计算器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 输入6大离子浓度 → 自动分类+评价
 *  2. Piper三线图 — SVG绘制阳离子/阴离子三角形+菱形
 *  3. 预设水样 — 8个河北典型水样对比
 *  4. 离子换算参考 — 毫摩尔换算表+评价标准
 * 主组件（面板已拆分至 hydrochemPanels/ 子目录）
 */
import { DataSourceNote } from '../UI';
import { FlaskConical } from 'lucide-react';
import { useState } from 'react';
import { SUB_TABS, type SubTabKey } from './hydrochemPanels/hydrochemConstants';
import { CalculatorPanel } from './hydrochemPanels/CalculatorPanel';
import { PresetSamplesPanel } from './hydrochemPanels/PresetSamplesPanel';
import { ReferencePanel } from './hydrochemPanels/ReferencePanel';

export function HydrochemCalculatorTab() {
  const [activeSubTab, setActiveSubTab] = useState<SubTabKey>('calc');

  return (
    <div className="space-y-6">
      <div className="p-3 rounded-lg bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-500/20">
        <div className="flex items-center gap-2">
          <FlaskConical size={16} className="text-violet-400" />
          <span className="text-sm text-violet-400 font-medium">水化学分析计算器</span>
        </div>
        <p className="text-xs text-gw-muted mt-1">输入6大离子浓度，自动计算苏卡列夫分类、Piper三线图坐标、水化学指标评价。服务环评报告水化学章节。</p>
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

      {activeSubTab === 'calc' && <CalculatorPanel />}
      {activeSubTab === 'preset' && <PresetSamplesPanel />}
      {activeSubTab === 'ref' && <ReferencePanel />}

      <DataSourceNote source="GB/T 14848-2017 | 苏卡列夫分类法 | Piper (1944)" />
    </div>
  );
}
