/**
 * B-21 裂隙水涌水量估算计算器 Tab
 *
 * 4大面板：
 *  1. 大井法 — 完整井/非完整井，承压/潜水公式
 *  2. 裂隙率法 — Kf估算 + Q = Kf×I×F
 *  3. 径流模数法 — 经验公式按岩性分区
 *  4. 预设岩性 — 6种岩性对比 + 干扰分析 + 参考表
 * 面板: BigWellPanel（拆分自 FractureWaterCalculatorTab.tsx）
 */
import { type BigWellInput, calcBigWell, INFLOW_GRADES } from '../../../utils/fractureWaterCalculator';
import { FilterableTechTable } from '../../FilterableTechTable';
import { TechCard, StatCard } from '../../UI';
import { Calculator } from 'lucide-react';
import { useState, useMemo } from 'react';
import { GRADE_COLORS } from './fractureConstants';

export function BigWellPanel() {
  const [name, setName] = useState('自定义评价区');
  const [aquiferType, setAquiferType] = useState<BigWellInput['aquiferType']>('承压水');
  const [Kf, setKf] = useState(0.25);
  const [M, setM] = useState(80);
  const [r0, setR0] = useState(250);
  const [s0, setS0] = useState(40);
  const [H, setH] = useState(80);
  const [R, setR] = useState(1500);
  const [completeness, setCompleteness] = useState<BigWellInput['completeness']>('完整井');
  const [filterLength, setFilterLength] = useState(40);

  const input: BigWellInput = { name, aquiferType, Kf, M, r0, s0, H, R, completeness, filterLength };
  const result = useMemo(() => calcBigWell(input), [input]);

  return (
    <div className="space-y-4">
      <TechCard title="大井法涌水量计算参数" icon={Calculator}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="col-span-2">
            <label className="text-xs text-gw-muted block mb-1">评价区名称</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">含水层类型</label>
            <select value={aquiferType} onChange={e => setAquiferType(e.target.value as BigWellInput['aquiferType'])}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text">
              <option value="潜水">潜水</option>
              <option value="承压水">承压水</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">完整性</label>
            <select value={completeness} onChange={e => setCompleteness(e.target.value as BigWellInput['completeness'])}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text">
              <option value="完整井">完整井</option>
              <option value="非完整井">非完整井</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">裂隙渗透系数 Kf (m/d)</label>
            <input type="number" step="0.01" value={Kf} onChange={e => setKf(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">含水层厚度 M (m)</label>
            <input type="number" value={M} onChange={e => setM(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">等效半径 r0 (m)</label>
            <input type="number" value={r0} onChange={e => setR0(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">设计降深 s0 (m)</label>
            <input type="number" value={s0} onChange={e => setS0(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">水位至底板 H (m)</label>
            <input type="number" value={H} onChange={e => setH(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">影响半径 R (m)</label>
            <input type="number" value={R} onChange={e => setR(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          {completeness === '非完整井' && (
            <div>
              <label className="text-xs text-gw-muted block mb-1">过滤器长度 l (m)</label>
              <input type="number" value={filterLength} onChange={e => setFilterLength(parseFloat(e.target.value) || 0)}
                className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
            </div>
          )}
        </div>
      </TechCard>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="涌水量 Q" value={result.Q} unit="m³/d" accent={GRADE_COLORS[result.grade]} />
        <StatCard title="涌水量 Q" value={result.Qh} unit="m³/h" accent={GRADE_COLORS[result.grade]} />
        <StatCard title="单位降深涌水量" value={result.specificQ} unit="m³/d·m" accent="text-blue-400" />
        <div className="bg-gw-card-alt rounded-lg p-3 flex flex-col justify-center items-center">
          <span className="text-xs text-gw-muted mb-1">涌水量等级</span>
          <span className="text-xl font-bold" style={{ color: GRADE_COLORS[result.grade] }}>
            {result.grade}
          </span>
        </div>
      </div>

      <div className="bg-gw-card-alt rounded-lg p-3">
        <p className="text-xs text-gw-muted leading-relaxed">
          <strong className="text-gw-text">计算公式：</strong>
          {' '}{result.formula}
          {' '}。Kf={Kf} m/d, M={M} m, s={s0} m, R={R} m, r0={r0} m。
        </p>
      </div>

      <FilterableTechTable
        headers={['等级', '涌水量范围(m³/h)', '适用场景']}
        rows={INFLOW_GRADES.map(g => [g.grade, g.range, g.measure])}
      />
    </div>
  );
}
