/**
 * B-25 地下水数值模拟参数估算器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 水力参数转换+网格估算+稳定性判断+时间步长
 *  2. 模型校准 — 观测/模拟数据对比+NSE/RMSE/R²等指标
 *  3. 预设分区 — 6个河北典型数值模拟区参数对比
 *  4. 参考方法 — 数值方法+稳定性准则+校准标准
 * 主组件（面板已拆分至 panels/ 子目录）
 */

import { useState } from 'react';
import { Calculator, Gauge, MapPin, BookOpen } from 'lucide-react';
import { CalculatorPanel } from './panels/CalculatorPanel';
import { CalibrationPanel } from './panels/CalibrationPanel';
import { PresetZonesPanel } from './panels/PresetZonesPanel';
import { ReferencePanel } from './panels/ReferencePanel';

export function NumericalModelCalculatorTab() {
  const [activePanel, setActivePanel] = useState<'calculator' | 'calibration' | 'zones' | 'reference'>('calculator');

  const panels = [
    { key: 'calculator' as const, label: '计算器', icon: Calculator },
    { key: 'calibration' as const, label: '模型校准', icon: Gauge },
    { key: 'zones' as const, label: '预设分区', icon: MapPin },
    { key: 'reference' as const, label: '参考方法', icon: BookOpen },
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
      {activePanel === 'calibration' && <CalibrationPanel />}
      {activePanel === 'zones' && <PresetZonesPanel />}
      {activePanel === 'reference' && <ReferencePanel />}
    </div>
  );
}
