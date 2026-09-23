/**
 * PRBPanel — 修复方案评估面板（自 RemediationTab.tsx 拆分）
 */
import { useState, useMemo } from 'react';
import { FlaskConical } from 'lucide-react';
import { TechCard, CollapsiblePanel } from '../../UI';
import { calculatePRB, type PRBInput } from '../../../utils/remediationEvaluator';
import { DEFAULT_PRB } from '../remediationConstants';
import { NumberField, StatBox } from './controls';

// PRB面板
export function PRBPanel() {
  const [input, setInput] = useState<PRBInput>(DEFAULT_PRB);
  const result = useMemo(() => calculatePRB(input), [input]);
  
  const update = (key: keyof PRBInput, v: number) => setInput(prev => ({ ...prev, [key]: v }));
  
  return (
    <div className="space-y-4">
      <TechCard>
        <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-cyan-400" /> PRB设计参数
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <NumberField label="含水层厚度" value={input.aquiferThickness} onChange={v => update('aquiferThickness', v)} unit="m" step={1} />
          <NumberField label="水力梯度" value={input.hydraulicGradient} onChange={v => update('hydraulicGradient', v)} step={0.001} />
          <NumberField label="渗透系数" value={input.hydraulicConductivity} onChange={v => update('hydraulicConductivity', v)} unit="m/d" step={1} />
          <NumberField label="孔隙度" value={input.porosity} onChange={v => update('porosity', v)} step={0.01} />
          <NumberField label="污染羽宽度" value={input.plumeWidth} onChange={v => update('plumeWidth', v)} unit="m" step={5} />
          <NumberField label="初始浓度" value={input.initialConcentration} onChange={v => update('initialConcentration', v)} unit="mg/L" step={0.1} />
          <NumberField label="目标浓度" value={input.targetConcentration} onChange={v => update('targetConcentration', v)} unit="mg/L" step={0.01} />
          <NumberField label="反应速率常数" value={input.reactionRateConstant} onChange={v => update('reactionRateConstant', v)} unit="1/d" step={0.1} />
          <NumberField label="介质半衰期" value={input.mediaHalfLife} onChange={v => update('mediaHalfLife', v)} unit="d" step={100} />
          <NumberField label="设计寿命" value={input.designLife} onChange={v => update('designLife', v)} unit="年" step={1} />
        </div>
      </TechCard>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="PRB厚度(沿流向)" value={result.prbThickness.toFixed(2)} unit="m" />
        <StatBox label="PRB宽度" value={result.prbWidth.toFixed(0)} unit="m" color="#10b981" />
        <StatBox label="PRB深度" value={result.prbDepth.toFixed(1)} unit="m" color="#10b981" />
        <StatBox label="停留时间" value={result.residenceTime.toFixed(2)} unit="d" color="#f59e0b" />
        <StatBox label="出流浓度" value={result.effluentConcentration.toFixed(4)} unit="mg/L" color={result.effluentConcentration <= input.targetConcentration ? '#10b981' : '#ef4444'} />
        <StatBox label="去除率" value={result.removalEfficiency.toFixed(1)} unit="%" color="#8b5cf6" />
        <StatBox label="介质体积" value={result.mediaVolume.toFixed(1)} unit="m³" color="#06b6d4" />
        <StatBox label="更换周期" value={result.replacementCycle.toFixed(1)} unit="年" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <StatBox label="建设投资" value={result.capitalCost.toFixed(1)} unit="万元" color="#f59e0b" />
        <StatBox label="年运维费" value={result.annualOcost.toFixed(1)} unit="万元/年" color="#f59e0b" />
        <StatBox label="全生命周期成本" value={result.lifecycleCost.toFixed(1)} unit="万元" color="#ef4444" />
      </div>
      
      <CollapsiblePanel title="PRB设计说明" defaultOpen={false}>
        <div className="text-xs text-slate-400 space-y-2">
          <p>可渗透反应墙(PRB)是在地下设置含有反应介质的可渗透墙体，当污染地下水通过时发生吸附、降解、沉淀等反应，实现原位处理。</p>
          <p>厚度计算基于一级反应动力学: C/C₀ = exp(-k·t)，其中停留时间 t = 厚度/流速。</p>
          <p>反应介质选择取决于污染物类型: 零价铁(ZVI)适用于重金属和氯代溶剂; 活性炭适用于有机物; 石灰石适用于中和酸性地下水。</p>
        </div>
      </CollapsiblePanel>
    </div>
  );
}
