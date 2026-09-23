/**
 * B-26 地下水时间序列分析器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 自定义序列输入→趋势/统计/突变/预测/自相关
 *  2. 预设序列 — 6个河北典型监测点11年序列对比
 *  3. 方法说明 — Mann-Kendall/Pettitt/Sen斜率等统计方法
 *  4. 评价标准 — 趋势/波动/突变/模型校准标准
 * 主组件（面板已拆分至 panels/ 子目录）
 */

import { useState } from 'react';
import { Calculator, MapPin, BookOpen, Gauge } from 'lucide-react';
import { CalculatorPanel } from './panels/CalculatorPanel';
import { PresetSeriesPanel } from './panels/PresetSeriesPanel';
import { MethodPanel } from './panels/MethodPanel';
import { StandardPanel } from './panels/StandardPanel';

export function TimeSeriesCalculatorTab() {
  const [activePanel, setActivePanel] = useState<'calculator' | 'preset' | 'method' | 'standard'>('calculator');

  const panels = [
    { key: 'calculator' as const, label: '计算器', icon: Calculator },
    { key: 'preset' as const, label: '预设序列', icon: MapPin },
    { key: 'method' as const, label: '方法说明', icon: BookOpen },
    { key: 'standard' as const, label: '评价标准', icon: Gauge },
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
      {activePanel === 'preset' && <PresetSeriesPanel />}
      {activePanel === 'method' && <MethodPanel />}
      {activePanel === 'standard' && <StandardPanel />}
    </div>
  );
}
