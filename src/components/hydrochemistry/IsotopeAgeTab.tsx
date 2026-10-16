/**
 * B-20 地下水同位素年龄估算 Tab
 *
 * 5大面板：
 *  1. ³H年龄 — 活塞流/指数模型衰变年龄
 *  2. ¹⁴C年龄 — δ¹³C校正/稀释校正
 *  3. ⁴He年龄 — He累积法定年
 *  4. 补给温度 — δ²H-δ¹⁸O关系估算补给温度/高程
 *  5. 预设监测点 — 8组河北平原同位素数据对比
 * 主组件（面板已拆分至 isotopeAgePanels/ 子目录）
 */
import { DataSourceNote } from '../UI';
import { Activity, Calculator, Atom, MapPin, Thermometer } from 'lucide-react';
import { useState } from 'react';
import { Carbon14Panel } from './isotopeAgePanels/Carbon14Panel';
import { Helium4Panel } from './isotopeAgePanels/Helium4Panel';
import { PresetSitesPanel } from './isotopeAgePanels/PresetSitesPanel';
import { RechargeTempPanel } from './isotopeAgePanels/RechargeTempPanel';
import { TritiumPanel } from './isotopeAgePanels/TritiumPanel';

export function IsotopeAgeTab() {
  const [panel, setPanel] = useState<'tritium' | 'c14' | 'he4' | 'temp' | 'preset'>('tritium');

  const panels = [
    { key: 'tritium' as const, label: '³H年龄', icon: Atom },
    { key: 'c14' as const, label: '¹⁴C年龄', icon: Calculator },
    { key: 'he4' as const, label: '⁴He年龄', icon: Activity },
    { key: 'temp' as const, label: '补给温度', icon: Thermometer },
    { key: 'preset' as const, label: '预设监测点', icon: MapPin },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {panels.map(p => (
          <button key={p.key} onClick={() => setPanel(p.key)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              panel === p.key
                ? 'bg-violet-600/20 text-violet-400 border border-violet-500/30'
                : 'bg-gw-card-alt text-gw-muted hover:text-gw-text'
            }`}>
            <p.icon size={14} />
            {p.label}
          </button>
        ))}
      </div>

      {panel === 'tritium' && <TritiumPanel />}
      {panel === 'c14' && <Carbon14Panel />}
      {panel === 'he4' && <Helium4Panel />}
      {panel === 'temp' && <RechargeTempPanel />}
      {panel === 'preset' && <PresetSitesPanel />}

      <DataSourceNote source="IAEA同位素水文数据库 + 河北平原地下水同位素研究" version="B-20" />
    </div>
  );
}
