/**
 * B-20 地下水同位素年龄估算 Tab
 *
 * 5大面板：
 *  1. ³H年龄 — 活塞流/指数模型衰变年龄
 *  2. ¹⁴C年龄 — δ¹³C校正/稀释校正
 *  3. ⁴He年龄 — He累积法定年
 *  4. 补给温度 — δ²H-δ¹⁸O关系估算补给温度/高程
 *  5. 预设监测点 — 8组河北平原同位素数据对比
 * 面板: Helium4Panel（拆分自 IsotopeAgeTab.tsx）
 */
import { type Helium4Input, calcHelium4Age } from '../../../utils/isotopeAgeCalculator';
import { StatCard, TechCard } from '../../UI';
import { Activity } from 'lucide-react';
import { useState, useMemo } from 'react';
import { AGE_COLORS } from './isotopeAgeConstants';

export function Helium4Panel() {
  const [name, setName] = useState('自定义监测点');
  const [measuredHe4, setMeasuredHe4] = useState(2e-6);
  const [atmosphericHe4, setAtmosphericHe4] = useState(4e-8);
  const [accumRate, setAccumRate] = useState(1e-8);

  const input: Helium4Input = { name, measuredHe4, atmosphericHe4, accumRate };
  const result = useMemo(() => calcHelium4Age(input), [input]);

  return (
    <div className="space-y-4">
      <TechCard title="⁴He累积年龄计算" icon={Activity}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="col-span-2">
            <label className="text-xs text-gw-muted block mb-1">监测点名称</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">实测⁴He (cm³STP/kg)</label>
            <input type="number" step="1e-8" value={measuredHe4} onChange={e => setMeasuredHe4(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">大气背景⁴He</label>
            <input type="number" step="1e-8" value={atmosphericHe4} onChange={e => setAtmosphericHe4(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">累积速率 (cm³STP/kg·a)</label>
            <input type="number" step="1e-9" value={accumRate} onChange={e => setAccumRate(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
        </div>
      </TechCard>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard title="过量⁴He" value={result.excessHe4.toExponential(3)} unit="cm³STP/kg" accent="text-violet-400" />
        <StatCard title="估算年龄" value={result.estimatedAge} unit="a" accent={AGE_COLORS[result.ageGrade] ?? '#6b7280'} />
        <div className="bg-gw-card-alt rounded-lg p-3 flex flex-col justify-center items-center">
          <span className="text-xs text-gw-muted mb-1">年龄分级</span>
          <span className="text-sm font-bold" style={{ color: AGE_COLORS[result.ageGrade] ?? '#6b7280' }}>
            {result.ageGrade}
          </span>
        </div>
      </div>

      <div className="bg-gw-card-alt rounded-lg p-3">
        <p className="text-xs text-gw-muted leading-relaxed">
          <strong className="text-gw-text">原理：</strong>
          {' '}{result.note}
          {' '}⁴He年龄适用于10³~10⁶年范围的地下水，弥补¹⁴C（上限5万年）的不足。
          {' '}累积速率受含水层U/Th含量影响，不同地质环境差异较大（10⁻⁹~10⁻⁷ cm³STP/kg·a），
          {' '}实际应用中需通过已知年龄水样标定。
        </p>
      </div>
    </div>
  );
}
