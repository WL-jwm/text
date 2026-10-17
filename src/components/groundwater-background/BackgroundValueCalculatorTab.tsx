/**
 * B-27 地下水背景值统计分析器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 单因子背景值确定（3种方法对比）
 *  2. 分区对比 — 3个分区6项因子背景值差异分析
 *  3. 超标统计 — 各因子超标率/超标倍数/污染指数
 *  4. 趋势检测 — 多年背景值变化趋势+偏移判断
 * 主组件（面板已拆分至 backgroundPanels/ 子目录）
 */
import { TrendingDown, MapPin, Calculator, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { CalculatorPanel } from './backgroundPanels/CalculatorPanel';
import { ExceedancePanel } from './backgroundPanels/ExceedancePanel';
import { TrendPanel } from './backgroundPanels/TrendPanel';
import { ZoneComparePanel } from './backgroundPanels/ZoneComparePanel';

export function BackgroundValueCalculatorTab() {
  const [activePanel, setActivePanel] = useState<'calculator' | 'compare' | 'exceedance' | 'trend'>('calculator');

  const panels = [
    { key: 'calculator' as const, label: '计算器', icon: Calculator },
    { key: 'compare' as const, label: '分区对比', icon: MapPin },
    { key: 'exceedance' as const, label: '超标统计', icon: AlertTriangle },
    { key: 'trend' as const, label: '趋势检测', icon: TrendingDown },
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
      {activePanel === 'compare' && <ZoneComparePanel />}
      {activePanel === 'exceedance' && <ExceedancePanel />}
      {activePanel === 'trend' && <TrendPanel />}
    </div>
  );
}
