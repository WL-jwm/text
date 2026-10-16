/**
 * B-29 地下水空间统计分析器 Tab
 *
 * 4大面板：
 *  1. Moran's I — 全局空间自相关+LISA局部热点/冷点
 *  2. 半变异函数 — 实验+理论模型拟合(球状/指数/高斯)
 *  3. 交叉验证 — 克里金插值精度评估(留一法)
 *  4. 参考 — 空间统计方法与判据说明
 * 主组件（面板已拆分至 spatialStatsPanels/ 子目录）
 */
import { Globe, BookOpen, Calculator, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { CrossValidationPanel } from './spatialStatsPanels/CrossValidationPanel';
import { MoranIPanel } from './spatialStatsPanels/MoranIPanel';
import { ReferencePanel } from './spatialStatsPanels/ReferencePanel';
import { VariogramPanel } from './spatialStatsPanels/VariogramPanel';

export function SpatialStatsCalculatorTab() {
  const [activePanel, setActivePanel] = useState<'moran' | 'variogram' | 'cv' | 'reference'>('moran');

  const panels = [
    { key: 'moran' as const, label: "Moran's I", icon: Globe },
    { key: 'variogram' as const, label: '半变异函数', icon: TrendingUp },
    { key: 'cv' as const, label: '交叉验证', icon: Calculator },
    { key: 'reference' as const, label: '参考', icon: BookOpen },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-gw-surface rounded-lg p-1 overflow-x-auto scrollbar-none">
        {panels.map(p => (
          <button key={p.key} onClick={() => setActivePanel(p.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs transition-all ${activePanel === p.key ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-gw-muted hover:text-gw-text'}`}>
            <p.icon size={14} />
            {p.label}
          </button>
        ))}
      </div>

      {activePanel === 'moran' && <MoranIPanel />}
      {activePanel === 'variogram' && <VariogramPanel />}
      {activePanel === 'cv' && <CrossValidationPanel />}
      {activePanel === 'reference' && <ReferencePanel />}
    </div>
  );
}
