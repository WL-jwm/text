/**
 * BioPanel — 修复方案评估面板（自 RemediationTab.tsx 拆分）
 */
import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Sprout, CheckCircle2 } from 'lucide-react';
import { TechCard } from '../../UI';
import { calculateBio, type BioInput } from '../../../utils/remediationEvaluator';
import { DEFAULT_BIO, TOOLTIP_STYLE } from '../remediationConstants';
import { NumberField, StatBox } from './controls';

// 生物修复面板
export function BioPanel() {
  const [input, setInput] = useState<BioInput>(DEFAULT_BIO);
  const result = useMemo(() => calculateBio(input), [input]);
  
  const update = (key: keyof BioInput, v: number) => setInput(prev => ({ ...prev, [key]: v }));
  
  const suitColor = result.suitabilityScore >= 75 ? '#10b981' : result.suitabilityScore >= 50 ? '#f59e0b' : result.suitabilityScore >= 30 ? '#f97316' : '#ef4444';
  
  return (
    <div className="space-y-4">
      <TechCard>
        <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
          <Sprout className="w-4 h-4 text-emerald-400" /> 生物修复评估参数
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <NumberField label="初始浓度" value={input.initialConcentration} onChange={v => update('initialConcentration', v)} unit="mg/L" step={0.1} />
          <NumberField label="目标浓度" value={input.targetConcentration} onChange={v => update('targetConcentration', v)} unit="mg/L" step={0.01} />
          <NumberField label="温度" value={input.temperature} onChange={v => update('temperature', v)} unit="℃" step={1} />
          <NumberField label="pH值" value={input.pH} onChange={v => update('pH', v)} step={0.1} />
          <NumberField label="溶解氧" value={input.dissolvedOxygen} onChange={v => update('dissolvedOxygen', v)} unit="mg/L" step={0.5} />
          <NumberField label="硝酸盐" value={input.nitrate} onChange={v => update('nitrate', v)} unit="mg/L" step={1} />
          <NumberField label="硫酸盐" value={input.sulfate} onChange={v => update('sulfate', v)} unit="mg/L" step={5} />
          <NumberField label="Fe(III)" value={input.fe3} onChange={v => update('fe3', v)} unit="mg/L" step={1} />
          <NumberField label="TOC" value={input.toc} onChange={v => update('toc', v)} unit="mg/L" step={1} />
          <NumberField label="微生物计数" value={input.microbialCount} onChange={v => update('microbialCount', v)} unit="CFU/mL" step={1000} />
          <NumberField label="渗透系数" value={input.hydraulicConductivity} onChange={v => update('hydraulicConductivity', v)} unit="m/d" step={1} />
          <NumberField label="污染羽体积" value={input.plumeVolume} onChange={v => update('plumeVolume', v)} unit="m³" step={1000} />
        </div>
      </TechCard>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="适宜性评分" value={result.suitabilityScore} unit="/100" color={suitColor} />
        <StatBox label="适宜性等级" value={result.suitabilityLevel} color={suitColor} />
        <StatBox label="最大降解速率" value={result.maxDegradationRate} unit="mg/L/d" color="#10b981" />
        <StatBox label="预测修复时间" value={result.estimatedTime} unit="年" color="#f59e0b" />
        <StatBox label="需要强化" value={result.needsEnhancement ? '是' : '否'} color={result.needsEnhancement ? '#f59e0b' : '#10b981'} />
        <StatBox label="氮需求" value={result.nutrientRequirement.nitrogen} unit="kg" />
        <StatBox label="磷需求" value={result.nutrientRequirement.phosphorus} unit="kg" />
        <StatBox label="全生命周期成本" value={result.lifecycleCost} unit="万元" color="#ef4444" />
      </div>
      
      <TechCard>
        <h4 className="text-xs font-semibold text-slate-300 mb-3">电子受体分析</h4>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={result.electronAcceptors}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="acceptor" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '浓度(mg/L)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '容量(mg/L)', angle: 90, position: 'insideRight', fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar yAxisId="left" dataKey="concentration" name="浓度" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            <Bar yAxisId="right" dataKey="capacity" name="氧化容量" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </TechCard>
      
      {result.enhancementSuggestions.length > 0 && (
        <TechCard>
          <h4 className="text-xs font-semibold text-slate-300 mb-3">强化修复建议</h4>
          <ul className="space-y-1.5">
            {result.enhancementSuggestions.map((s, i) => (
              <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </TechCard>
      )}
    </div>
  );
}
