/**
 * B-20 地下水同位素年龄估算 Tab
 *
 * 5大面板：
 *  1. ³H年龄 — 活塞流/指数模型衰变年龄
 *  2. ¹⁴C年龄 — δ¹³C校正/稀释校正
 *  3. ⁴He年龄 — He累积法定年
 *  4. 补给温度 — δ²H-δ¹⁸O关系估算补给温度/高程
 *  5. 预设监测点 — 8组河北平原同位素数据对比
 * 面板: TritiumPanel（拆分自 IsotopeAgeTab.tsx）
 */
import { type TritiumInput, calcTritiumAge } from '../../../utils/isotopeAgeCalculator';
import { StatCard, TechCard } from '../../UI';
import { Atom } from 'lucide-react';
import { useState, useMemo } from 'react';
import { AGE_COLORS } from './isotopeAgeConstants';

export function TritiumPanel() {
  const [name, setName] = useState('自定义监测点');
  const [measuredTU, setMeasuredTU] = useState(3.8);
  const [initialTU, setInitialTU] = useState(20);
  const [model, setModel] = useState<TritiumInput['model']>('piston');
  const [turnoverTime, setTurnoverTime] = useState(30);

  const input: TritiumInput = { name, measuredTU, initialTU, model, turnoverTime };
  const result = useMemo(() => calcTritiumAge(input), [input]);

  return (
    <div className="space-y-4">
      <TechCard title="³H放射性衰变年龄计算" icon={Atom}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="col-span-2">
            <label className="text-xs text-gw-muted block mb-1">监测点名称</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">实测³H (TU)</label>
            <input type="number" step="0.1" value={measuredTU} onChange={e => setMeasuredTU(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">初始³H (TU)</label>
            <input type="number" step="0.1" value={initialTU} onChange={e => setInitialTU(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">模型类型</label>
            <select value={model} onChange={e => setModel(e.target.value as TritiumInput['model'])}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text">
              <option value="piston">活塞流模型 (PFM)</option>
              <option value="exponential">指数模型 (EMM)</option>
            </select>
          </div>
          {model === 'exponential' && (
            <div>
              <label className="text-xs text-gw-muted block mb-1">平均周转时间 τ (a)</label>
              <input type="number" value={turnoverTime} onChange={e => setTurnoverTime(parseFloat(e.target.value) || 0)}
                className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
            </div>
          )}
        </div>
      </TechCard>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="表观年龄" value={result.apparentAge} unit="a" accent={AGE_COLORS[result.ageGrade] ?? '#6b7280'} />
        <StatCard title="剩余³H比例" value={result.remainingFraction} unit="%" accent="text-cyan-400" />
        <div className="bg-gw-card-alt rounded-lg p-3 flex flex-col justify-center items-center">
          <span className="text-xs text-gw-muted mb-1">年龄分级</span>
          <span className="text-sm font-bold" style={{ color: AGE_COLORS[result.ageGrade] ?? '#6b7280' }}>
            {result.ageGrade}
          </span>
        </div>
        <div className="bg-gw-card-alt rounded-lg p-3 flex flex-col justify-center">
          <span className="text-xs text-gw-muted mb-1">模型</span>
          <span className="text-xs text-gw-text">{result.model}</span>
        </div>
      </div>

      <div className="bg-gw-card-alt rounded-lg p-3">
        <p className="text-xs text-gw-muted leading-relaxed">
          <strong className="text-gw-text">原理：</strong>
          {' '}³H半衰期12.32a，通过测量地下水中³H浓度与补给时初始浓度的比值估算年龄。
          {' '}活塞流模型假设无混合，t = -ln(C/C₀)/λ；指数模型假设完全混合，t = τ。
          {' '}{result.note}
        </p>
      </div>

      <div className="bg-gw-card-alt rounded-lg p-3">
        <p className="text-xs text-gw-muted leading-relaxed">
          <strong className="text-gw-text">³H浓度参考：</strong>
          {' '}现代降水³H≈10~25TU（北半球受核试验影响）；1952年前大气³H≈5~10TU；
          {' '}³H&lt;0.5TU通常认为是核试验前老水（&gt;50a）；
          {' '}³H=0.5~5TU为次现代-现代混合水；³H&gt;10TU为现代水（&lt;20a）。
        </p>
      </div>
    </div>
  );
}
