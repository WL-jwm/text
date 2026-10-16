/**
 * B-24 地下水功能评价计算器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 输入14项指标 → 四维度评分+综合评价
 *  2. 预设分区 — 6个河北典型功能区对比
 *  3. 评分标准 — 各指标评分细则
 *  4. 权重方法 — AHP权重+功能等级标准
 * 主组件（面板已拆分至 gwFuncPanels/ 子目录）
 */
import { MapPin, Calculator, BookOpen, Settings } from 'lucide-react';
import { useState } from 'react';
import { CalculatorPanel } from './gwFuncPanels/CalculatorPanel';
import { PresetZonesPanel } from './gwFuncPanels/PresetZonesPanel';
import { ScoringStandardsPanel } from './gwFuncPanels/ScoringStandardsPanel';
import { WeightMethodPanel } from './gwFuncPanels/WeightMethodPanel';

export function GroundwaterFunctionCalculatorTab() {
  const [activePanel, setActivePanel] = useState<'calculator' | 'zones' | 'standards' | 'method'>('calculator');

  const panels = [
    { key: 'calculator' as const, label: '计算器', icon: Calculator },
    { key: 'zones' as const, label: '预设分区', icon: MapPin },
    { key: 'standards' as const, label: '评分标准', icon: BookOpen },
    { key: 'method' as const, label: '权重方法', icon: Settings },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-gw-surface rounded-lg p-1 overflow-x-auto scrollbar-none">
        {panels.map(p => (
          <button key={p.key} onClick={() => setActivePanel(p.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs transition-all ${activePanel === p.key ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30' : 'text-gw-muted hover:text-gw-text'}`}>
            <p.icon size={14} />
            {p.label}
          </button>
        ))}
      </div>

      {activePanel === 'calculator' && <CalculatorPanel />}
      {activePanel === 'zones' && <PresetZonesPanel />}
      {activePanel === 'standards' && <ScoringStandardsPanel />}
      {activePanel === 'method' && <WeightMethodPanel />}
    </div>
  );
}
