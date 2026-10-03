/**
 * B-23 土壤盐渍化评价计算器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 输入土壤参数 → 盐分分级/类型判定/淋洗需水量/改良预测/临界深度
 *  2. 预设分区 — 8个河北平原盐渍化分区对比评价
 *  3. 盐分分级标准 — 5级分级标准参考
 *  4. 质地参数 — 不同质地毛细参数与改良建议
 * 主组件（面板已拆分至 salineSoilPanels/ 子目录）
 */

import { useState } from 'react';
import { Calculator, MapPin, BookOpen, Layers } from 'lucide-react';
import { CalculatorPanel } from './salineSoilPanels/CalculatorPanel';
import { PresetZonesPanel } from './salineSoilPanels/PresetZonesPanel';
import { GradeStandardsPanel } from './salineSoilPanels/GradeStandardsPanel';
import { TextureParamsPanel } from './salineSoilPanels/TextureParamsPanel';

export function SoilSalinizationCalculatorTab() {
  const [activePanel, setActivePanel] = useState<'calculator' | 'zones' | 'standards' | 'texture'>('calculator');

  const panels = [
    { key: 'calculator' as const, label: '计算器', icon: Calculator },
    { key: 'zones' as const, label: '预设分区', icon: MapPin },
    { key: 'standards' as const, label: '分级标准', icon: BookOpen },
    { key: 'texture' as const, label: '质地参数', icon: Layers },
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
      {activePanel === 'standards' && <GradeStandardsPanel />}
      {activePanel === 'texture' && <TextureParamsPanel />}
    </div>
  );
}
