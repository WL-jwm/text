/**
 * B-22 饮用天然矿泉水水质评价计算器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 输入水质参数 → 界限指标/限量指标/类型判定/综合等级
 *  2. 预设水源地 — 14个产地对比评价
 *  3. 标准对比 — GB 8537 vs GB/T 14848
 *  4. 类型统计 — 矿泉水类型分布分析
 * 主组件（面板已拆分至 mineralWaterPanels/ 子目录）
 */
import { DataSourceNote } from '../UI';
import { MapPin, BookOpen, PieChart as PieIcon, Calculator } from 'lucide-react';
import { useState } from 'react';
import { CalculatorPanel } from './mineralWaterPanels/CalculatorPanel';
import { PresetPanel } from './mineralWaterPanels/PresetPanel';
import { StandardPanel } from './mineralWaterPanels/StandardPanel';
import { TypePanel } from './mineralWaterPanels/TypePanel';

export function MineralWaterCalculatorTab() {
  const [panel, setPanel] = useState<'calc' | 'preset' | 'standard' | 'type'>('calc');

  const panels = [
    { key: 'calc' as const, label: '计算器', icon: Calculator },
    { key: 'preset' as const, label: '预设水源地', icon: MapPin },
    { key: 'standard' as const, label: '标准对比', icon: BookOpen },
    { key: 'type' as const, label: '类型统计', icon: PieIcon },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {panels.map(p => (
          <button key={p.key} onClick={() => setPanel(p.key)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              panel === p.key
                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-gw-card-alt text-gw-muted hover:text-gw-text'
            }`}>
            <p.icon size={14} />
            {p.label}
          </button>
        ))}
      </div>

      {panel === 'calc' && <CalculatorPanel />}
      {panel === 'preset' && <PresetPanel />}
      {panel === 'standard' && <StandardPanel />}
      {panel === 'type' && <TypePanel />}

      <DataSourceNote source="GB 8537-2018 饮用天然矿泉水 + GB/T 14848-2017 地下水质量标准" version="B-22" />
    </div>
  );
}
