/**
 * B-21 裂隙水涌水量估算计算器 Tab
 *
 * 4大面板：
 *  1. 大井法 — 完整井/非完整井，承压/潜水公式
 *  2. 裂隙率法 — Kf估算 + Q = Kf×I×F
 *  3. 径流模数法 — 经验公式按岩性分区
 *  4. 预设岩性 — 6种岩性对比 + 干扰分析 + 参考表
 * 面板: FracturePanel（拆分自 FractureWaterCalculatorTab.tsx）
 */
import { type FractureMethodInput, FRACTURE_K_REF, calcFractureMethod } from '../../../utils/fractureWaterCalculator';
import { FilterableTechTable } from '../../FilterableTechTable';
import { TechCard, StatCard } from '../../UI';
import { Mountain } from 'lucide-react';
import { useState, useMemo } from 'react';
import { FRACTURE_COLORS } from './fractureConstants';

export function FracturePanel() {
  const [name, setName] = useState('自定义评价区');
  const [fractureRatio, setFractureRatio] = useState(0.012);
  const [fractureAperture, setFractureAperture] = useState(0.5);
  const [connectivity, setConnectivity] = useState(0.7);
  const [hydraulicGradient, setHydraulicGradient] = useState(0.005);
  const [crossSectionArea, setCrossSectionArea] = useState(500);
  const [fractureDensity, setFractureDensity] = useState(3.5);

  const input: FractureMethodInput = {
    name, fractureRatio, fractureAperture, connectivity, hydraulicGradient, crossSectionArea, fractureDensity,
  };
  const result = useMemo(() => calcFractureMethod(input), [input]);

  return (
    <div className="space-y-4">
      <TechCard title="裂隙率法涌水量估算参数" icon={Mountain}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="col-span-2">
            <label className="text-xs text-gw-muted block mb-1">评价区名称</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">裂隙率 n (小数)</label>
            <input type="number" step="0.001" value={fractureRatio} onChange={e => setFractureRatio(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">裂隙开度 b (mm)</label>
            <input type="number" step="0.1" value={fractureAperture} onChange={e => setFractureAperture(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">连通系数 (0~1)</label>
            <input type="number" step="0.05" value={connectivity} onChange={e => setConnectivity(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">水力梯度 I</label>
            <input type="number" step="0.001" value={hydraulicGradient} onChange={e => setHydraulicGradient(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">过水断面 F (m²)</label>
            <input type="number" value={crossSectionArea} onChange={e => setCrossSectionArea(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">裂隙密度 (条/m)</label>
            <input type="number" step="0.5" value={fractureDensity} onChange={e => setFractureDensity(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
        </div>
      </TechCard>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="裂隙渗透系数 Kf" value={result.Kf} unit="m/d" accent={FRACTURE_COLORS[result.fractureGrade]} />
        <StatCard title="等效渗透系数 Keq" value={result.Keq} unit="m/d" accent="text-violet-400" />
        <StatCard title="涌水量 Q" value={result.Q} unit="m³/d" accent={FRACTURE_COLORS[result.fractureGrade]} />
        <div className="bg-gw-card-alt rounded-lg p-3 flex flex-col justify-center items-center">
          <span className="text-xs text-gw-muted mb-1">裂隙发育等级</span>
          <span className="text-xl font-bold" style={{ color: FRACTURE_COLORS[result.fractureGrade] }}>
            {result.fractureGrade}
          </span>
        </div>
      </div>

      <div className="bg-gw-card-alt rounded-lg p-3">
        <p className="text-xs text-gw-muted leading-relaxed">
          <strong className="text-gw-text">计算原理：</strong>
          {' '}{result.note}
          {' '}。公式 Kf = n·b²·g/(12ν)·c，其中g=9.81m/s², ν=1.0×10⁻⁶m²/s(15°C水)。
          {' '}裂隙开度对Kf影响最大（平方关系），开度增加1倍，Kf增大4倍。
        </p>
      </div>

      <FilterableTechTable
        headers={['裂隙等级', '开度范围', 'Kf范围(m/d)', 'Kf均值', '典型特征']}
        rows={FRACTURE_K_REF.map(r => [r.fractureGrade, r.apertureRange, r.KfRange, r.KfAvg, r.typical])}
      />
    </div>
  );
}
