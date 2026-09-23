/**
 * MNAPanel — 修复方案评估面板（自 RemediationTab.tsx 拆分）
 */
import { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';
import { GitBranch } from 'lucide-react';
import { TechCard } from '../../UI';
import { calculateMNA, type MNAInput } from '../../../utils/remediationEvaluator';
import { DEFAULT_MNA, TOOLTIP_STYLE } from '../remediationConstants';
import { NumberField, StatBox } from './controls';

// MNA面板
export function MNAPanel() {
  const [input, setInput] = useState<MNAInput>(DEFAULT_MNA);
  const result = useMemo(() => calculateMNA(input), [input]);
  
  const update = (key: keyof MNAInput, v: number) => setInput(prev => ({ ...prev, [key]: v }));
  
  return (
    <div className="space-y-4">
      <TechCard>
        <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-green-400" /> 自然衰减评估参数
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <NumberField label="初始浓度" value={input.initialConcentration} onChange={v => update('initialConcentration', v)} unit="mg/L" step={0.1} />
          <NumberField label="目标浓度" value={input.targetConcentration} onChange={v => update('targetConcentration', v)} unit="mg/L" step={0.01} />
          <NumberField label="一阶衰减速率" value={input.decayRate} onChange={v => update('decayRate', v)} unit="1/d" step={0.0005} />
          <NumberField label="地下水流速" value={input.groundwaterVelocity} onChange={v => update('groundwaterVelocity', v)} unit="m/d" step={0.01} />
          <NumberField label="污染源距离" value={input.sourceDistance} onChange={v => update('sourceDistance', v)} unit="m" step={10} />
          <NumberField label="孔隙度" value={input.porosity} onChange={v => update('porosity', v)} step={0.01} />
          <NumberField label="监测井数" value={input.monitoringWells} onChange={v => update('monitoringWells', v)} unit="口" step={1} />
          <NumberField label="设计期限" value={input.designPeriod} onChange={v => update('designPeriod', v)} unit="年" step={1} />
        </div>
      </TechCard>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="半衰期" value={result.halfLife} unit="d" />
        <StatBox label="达标所需时间" value={result.timeToTarget} unit="年" color={result.feasible ? '#10b981' : '#ef4444'} />
        <StatBox label="衰减距离" value={result.attenuationDistance} unit="m" color="#06b6d4" />
        <StatBox label="衰减容量" value={result.attenuationCapacity} unit="mg/L·m" color="#f59e0b" />
        <StatBox label="可行性" value={result.feasible ? '可行' : '不可行'} color={result.feasible ? '#10b981' : '#ef4444'} />
        <StatBox label="监测频率建议" value={result.monitoringFrequency} unit="次/年" color="#8b5cf6" />
        <StatBox label="年监测成本" value={result.annualMonitoringCost} unit="万元/年" color="#f59e0b" />
        <StatBox label="全生命周期成本" value={result.lifecycleCost} unit="万元" color="#ef4444" />
      </div>
      
      <TechCard>
        <h4 className="text-xs font-semibold text-slate-300 mb-3">浓度-距离衰减曲线</h4>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={result.attenuationCurve}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="distance" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '距离(m)', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 10 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '浓度(mg/L)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <ReferenceLine y={input.targetConcentration} stroke="#ef4444" strokeDasharray="5 5" label={{ value: '目标', fill: '#ef4444', fontSize: 10 }} />
            <ReferenceLine x={input.sourceDistance} stroke="#64748b" strokeDasharray="3 3" label={{ value: '污染源', fill: '#64748b', fontSize: 10 }} />
            <Line type="monotone" dataKey="concentration" name="污染物浓度" stroke="#10b981" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </TechCard>
      
      <TechCard>
        <h4 className="text-xs font-semibold text-slate-300 mb-3">衰减机制贡献分析</h4>
        <div className="space-y-2">
          {result.attenuationMechanisms.map((m) => (
            <div key={m.mechanism} className="flex items-center gap-3">
              <span className="text-xs text-slate-300 w-20">{m.mechanism}</span>
              <div className="flex-1 bg-slate-800/60 rounded-full h-4 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${m.contribution}%`, background: ['#10b981', '#06b6d4', '#f59e0b', '#8b5cf6'][result.attenuationMechanisms.indexOf(m)] || '#64748b' }} />
              </div>
              <span className="text-xs text-slate-400 w-8 text-right">{m.contribution}%</span>
              <span className="text-xs text-slate-500 flex-1">{m.description}</span>
            </div>
          ))}
        </div>
      </TechCard>
    </div>
  );
}
