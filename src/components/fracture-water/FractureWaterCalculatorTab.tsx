/**
 * B-21 裂隙水涌水量估算计算器 Tab
 *
 * 4大面板：
 *  1. 大井法 — 完整井/非完整井，承压/潜水公式
 *  2. 裂隙率法 — Kf估算 + Q = Kf×I×F
 *  3. 径流模数法 — 经验公式按岩性分区
 *  4. 预设岩性 — 6种岩性对比 + 干扰分析 + 参考表
 * 主组件（面板已拆分至 fracturePanels/ 子目录）
 */
import { DataSourceNote } from '../UI';
import { Calculator, Mountain, Activity, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { BigWellPanel } from './fracturePanels/BigWellPanel';
import { FracturePanel } from './fracturePanels/FracturePanel';
import { PresetPanel } from './fracturePanels/PresetPanel';
import { RunoffPanel } from './fracturePanels/RunoffPanel';

export function FractureWaterCalculatorTab() {
  const [panel, setPanel] = useState<'bigwell' | 'fracture' | 'runoff' | 'preset'>('bigwell');

  const panels = [
    { key: 'bigwell' as const, label: '大井法', icon: Calculator },
    { key: 'fracture' as const, label: '裂隙率法', icon: Mountain },
    { key: 'runoff' as const, label: '径流模数法', icon: Activity },
    { key: 'preset' as const, label: '预设岩性', icon: BookOpen },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {panels.map(p => (
          <button key={p.key} onClick={() => setPanel(p.key)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              panel === p.key
                ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30'
                : 'bg-gw-card-alt text-gw-muted hover:text-gw-text'
            }`}>
            <p.icon size={14} />
            {p.label}
          </button>
        ))}
      </div>

      {panel === 'bigwell' && <BigWellPanel />}
      {panel === 'fracture' && <FracturePanel />}
      {panel === 'runoff' && <RunoffPanel />}
      {panel === 'preset' && <PresetPanel />}

      <DataSourceNote source="GB 50027-2001 供水水文地质勘察规范 + 河北基岩山区水文地质" version="B-21" />
    </div>
  );
}
