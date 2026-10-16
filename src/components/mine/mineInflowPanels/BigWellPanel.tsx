/**
 * B-18 矿坑涌水量预测计算器 Tab
 *
 * 4大面板：
 *  1. 大井法 — 稳定流涌水量计算（潜水/承压/承压转无压）
 *  2. 疏干排水 — 非稳定流Theis修正 + 时间-涌水量曲线
 *  3. 影响半径 — Kusakin/Sichardt/修正公式
 *  4. 预设矿区 — 6个河北典型矿区对比 + 涌水量分级
 * 面板: BigWellPanel（拆分自 MineInflowTab.tsx）
 */
import { type MineInflowInput, calcMineInflow, INFLOW_GRADES } from '../../../utils/mineInflowCalculator';
import { FilterableTechTable } from '../../FilterableTechTable';
import { StatCard, TechCard } from '../../UI';
import { Calculator } from 'lucide-react';
import { useMemo, useState } from 'react';
import { GRADE_COLORS } from './mineInflowConstants';

export function BigWellPanel() {
  const [name, setName] = useState('自定义矿区');
  const [aquiferType, setAquiferType] = useState<MineInflowInput['aquiferType']>('承压转无压');
  const [K, setK] = useState(0.85);
  const [M, setM] = useState(180);
  const [equivalentRadius, setEquivalentRadius] = useState(800);
  const [drawdown, setDrawdown] = useState(150);
  const [waterTableHeight, setWaterTableHeight] = useState(180);
  const [influenceRadius, setInfluenceRadius] = useState(3500);

  const input: MineInflowInput = {
    name, aquiferType, K, M, equivalentRadius, drawdown, waterTableHeight, influenceRadius,
  };
  const result = useMemo(() => calcMineInflow(input), [input]);

  return (
    <div className="space-y-4">
      <TechCard title="大井法涌水量计算参数" icon={Calculator}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="col-span-2">
            <label className="text-xs text-gw-muted block mb-1">矿区名称</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">含水层类型</label>
            <select value={aquiferType} onChange={e => setAquiferType(e.target.value as MineInflowInput['aquiferType'])}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text">
              <option value="潜水">潜水</option>
              <option value="承压水">承压水</option>
              <option value="承压转无压">承压转无压</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">渗透系数 K (m/d)</label>
            <input type="number" step="0.01" value={K} onChange={e => setK(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">含水层厚度 M (m)</label>
            <input type="number" value={M} onChange={e => setM(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">等效半径 r0 (m)</label>
            <input type="number" value={equivalentRadius} onChange={e => setEquivalentRadius(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">设计降深 s0 (m)</label>
            <input type="number" value={drawdown} onChange={e => setDrawdown(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">静止水位高度 H (m)</label>
            <input type="number" value={waterTableHeight} onChange={e => setWaterTableHeight(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">影响半径 R (m)</label>
            <input type="number" value={influenceRadius} onChange={e => setInfluenceRadius(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
        </div>
      </TechCard>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="涌水量 Q" value={result.bigWellQ} unit="m³/d" accent={GRADE_COLORS[result.inflowGrade]} />
        <StatCard title="涌水量 Q" value={result.bigWellQh} unit="m³/h" accent={GRADE_COLORS[result.inflowGrade]} />
        <StatCard title="单位降深涌水量" value={result.specificInflow} unit="m³/d·m" accent="text-blue-400" />
        <div className="bg-gw-card-alt rounded-lg p-3 flex flex-col justify-center items-center">
          <span className="text-xs text-gw-muted mb-1">涌水量等级</span>
          <span className="text-xl font-bold" style={{ color: GRADE_COLORS[result.inflowGrade] }}>
            {result.inflowGrade}
          </span>
        </div>
      </div>

      <div className="bg-gw-card-alt rounded-lg p-3">
        <p className="text-xs text-gw-muted leading-relaxed">
          <strong className="text-gw-text">计算公式：</strong>
          {' '}{result.formula}
          {' '}。其中 K={K} m/d, M={M} m, s={drawdown} m, R={influenceRadius} m, r0={equivalentRadius} m。
          {' '}矿坑系统面积 = π×r0² = {result.systemArea.toLocaleString()} m²。
        </p>
      </div>

      {/* 涌水量分级表 */}
      <FilterableTechTable
        headers={['等级', '涌水量范围(m³/h)', '防治措施']}
        rows={INFLOW_GRADES.map(g => [g.grade, g.range, g.measure])}
      />
    </div>
  );
}
