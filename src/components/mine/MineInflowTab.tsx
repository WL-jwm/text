/**
 * B-18 矿坑涌水量预测计算器 Tab
 *
 * 4大面板：
 *  1. 大井法 — 稳定流涌水量计算（潜水/承压/承压转无压）
 *  2. 疏干排水 — 非稳定流Theis修正 + 时间-涌水量曲线
 *  3. 影响半径 — Kusakin/Sichardt/修正公式
 *  4. 预设矿区 — 6个河北典型矿区对比 + 涌水量分级
 * 主组件（面板已拆分至 mineInflowPanels/ 子目录）
 */
import { DataSourceNote } from '../UI';
import { AlertTriangle, TrendingDown, Calculator, Mountain } from 'lucide-react';
import { useState } from 'react';
import { BigWellPanel } from './mineInflowPanels/BigWellPanel';
import { DewateringPanel } from './mineInflowPanels/DewateringPanel';
import { PresetMinesPanel } from './mineInflowPanels/PresetMinesPanel';
import { RadiusPanel } from './mineInflowPanels/RadiusPanel';

export function MineInflowTab() {
  const [panel, setPanel] = useState<'bigwell' | 'dewatering' | 'radius' | 'preset'>('bigwell');

  const panels = [
    { key: 'bigwell' as const, label: '大井法', icon: Calculator },
    { key: 'dewatering' as const, label: '疏干排水', icon: TrendingDown },
    { key: 'radius' as const, label: '影响半径', icon: Mountain },
    { key: 'preset' as const, label: '预设矿区', icon: AlertTriangle },
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
      {panel === 'dewatering' && <DewateringPanel />}
      {panel === 'radius' && <RadiusPanel />}
      {panel === 'preset' && <PresetMinesPanel />}

      <DataSourceNote source="GB 50027-2001 供水水文地质勘察规范 + 河北省矿区水文地质资料" version="B-18" />
    </div>
  );
}
