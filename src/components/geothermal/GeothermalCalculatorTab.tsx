/**
 * B-17 地热资源量评价计算器 Tab
 *
 * 4大面板：
 *  1. 热储储量 — 热储法 Q=ρ·c·V·ΔT 计算 + 预设地热田对比
 *  2. 井产能评价 — 热功率/年产热量/产能等级
 *  3. 地温梯度 — 梯度/热流值/不同深度温度预测
 *  4. 可开采量 — 开采系数法/回灌率/服务年限
 * 主组件（面板已拆分至 geothermalPanels/ 子目录）
 */

import { useState } from 'react';
import { Flame, Zap, TrendingUp, Calculator, BookOpen } from 'lucide-react';
import { DataSourceNote } from '../UI';
import { ReservoirPanel } from './geothermalPanels/ReservoirPanel';
import { WellPanel } from './geothermalPanels/WellPanel';
import { GradientPanel } from './geothermalPanels/GradientPanel';
import { ExploitablePanel } from './geothermalPanels/ExploitablePanel';
import { ReferencePanel } from './geothermalPanels/ReferencePanel';

export function GeothermalCalculatorTab() {
  const [panel, setPanel] = useState<'reservoir' | 'well' | 'gradient' | 'exploitable' | 'ref'>('reservoir');

  const panels = [
    { key: 'reservoir' as const, label: '热储储量', icon: Flame },
    { key: 'well' as const, label: '井产能评价', icon: Zap },
    { key: 'gradient' as const, label: '地温梯度', icon: TrendingUp },
    { key: 'exploitable' as const, label: '可开采量', icon: Calculator },
    { key: 'ref' as const, label: '参数参考', icon: BookOpen },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {panels.map(p => (
          <button key={p.key} onClick={() => setPanel(p.key)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              panel === p.key
                ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                : 'bg-gw-card-alt text-gw-muted hover:text-gw-text'
            }`}>
            <p.icon size={14} />
            {p.label}
          </button>
        ))}
      </div>

      {panel === 'reservoir' && <ReservoirPanel />}
      {panel === 'well' && <WellPanel />}
      {panel === 'gradient' && <GradientPanel />}
      {panel === 'exploitable' && <ExploitablePanel />}
      {panel === 'ref' && <ReferencePanel />}

      <DataSourceNote source="河北省地热资源调查评价报告 + DZ/T 0286-2015地热能评价方法" version="B-17" />
    </div>
  );
}
