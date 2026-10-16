/**
 * B-19 岩溶泉流量衰减分析 Tab
 *
 * 4大面板：
 *  1. 衰减分析 — Maillet指数衰减模型 + 衰减曲线
 *  2. 滞后相关 — 降水-泉流量滞后相关分析
 *  3. 调蓄评价 — 系统调蓄功能评价
 *  4. 预设泉域 — 6个河北岩溶大泉对比 + 衰减系数参考表
 * 主组件（面板已拆分至 springDecayPanels/ 子目录）
 */
import { DataSourceNote } from '../UI';
import { TrendingDown, Activity, Waves, Calculator } from 'lucide-react';
import { useState } from 'react';
import { CorrelationPanel } from './springDecayPanels/CorrelationPanel';
import { DecayPanel } from './springDecayPanels/DecayPanel';
import { PresetSpringsPanel } from './springDecayPanels/PresetSpringsPanel';
import { RegulationPanel } from './springDecayPanels/RegulationPanel';

export function SpringDecayTab() {
  const [panel, setPanel] = useState<'decay' | 'correlation' | 'regulation' | 'preset'>('decay');

  const panels = [
    { key: 'decay' as const, label: '衰减分析', icon: Calculator },
    { key: 'correlation' as const, label: '滞后相关', icon: Activity },
    { key: 'regulation' as const, label: '调蓄评价', icon: Waves },
    { key: 'preset' as const, label: '预设泉域', icon: TrendingDown },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {panels.map(p => (
          <button key={p.key} onClick={() => setPanel(p.key)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              panel === p.key
                ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-gw-card-alt text-gw-muted hover:text-gw-text'
            }`}>
            <p.icon size={14} />
            {p.label}
          </button>
        ))}
      </div>

      {panel === 'decay' && <DecayPanel />}
      {panel === 'correlation' && <CorrelationPanel />}
      {panel === 'regulation' && <RegulationPanel />}
      {panel === 'preset' && <PresetSpringsPanel />}

      <DataSourceNote source="河北省岩溶水资源评价报告 + Maillet衰减模型" version="B-19" />
    </div>
  );
}
