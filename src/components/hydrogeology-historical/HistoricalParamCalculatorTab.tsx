/**
 * B-28 历史水文地质参数推算器 Tab
 *
 * 4大面板（已拆分至 paramPanels/ 子目录）：
 *  1. 泉水频率分析 — 流量序列→P-III型曲线+保证率流量
 *  2. 参数反演 — 抽水试验数据→K/T/S三方法对比
 *  3. 径流还原 — 实测径流→天然径流（人类活动影响分离）
 *  4. 地质年代 — ¹⁴C/氚/地层对比多方法估算
 */
import { useState } from 'react';
import { Calculator, Droplets, Waves, Atom } from 'lucide-react';
import { SpringFrequencyPanel } from './paramPanels/SpringFrequencyPanel';
import { AquiferParamPanel } from './paramPanels/AquiferParamPanel';
import { RunoffPanel } from './paramPanels/RunoffPanel';
import { AgePanel } from './paramPanels/AgePanel';

// ── 主组件 ──


export function HistoricalParamCalculatorTab() {
  const [activePanel, setActivePanel] = useState<'spring' | 'aquifer' | 'runoff' | 'age'>('spring');

  const panels = [
    { key: 'spring' as const, label: '泉水频率', icon: Droplets },
    { key: 'aquifer' as const, label: '参数反演', icon: Calculator },
    { key: 'runoff' as const, label: '径流还原', icon: Waves },
    { key: 'age' as const, label: '地质年代', icon: Atom },
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

      {activePanel === 'spring' && <SpringFrequencyPanel />}
      {activePanel === 'aquifer' && <AquiferParamPanel />}
      {activePanel === 'runoff' && <RunoffPanel />}
      {activePanel === 'age' && <AgePanel />}
    </div>
  );
}
