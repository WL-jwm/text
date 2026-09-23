/**
 * ASPanel — 修复方案评估面板（自 RemediationTab.tsx 拆分）
 */
import { useState, useMemo } from 'react';
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';
import { Wind, XCircle } from 'lucide-react';
import { TechCard } from '../../UI';
import { calculateAS, type ASInput } from '../../../utils/remediationEvaluator';
import { DEFAULT_AS, TOOLTIP_STYLE } from '../remediationConstants';
import { NumberField, StatBox } from './controls';

// AS面板
export function ASPanel() {
  const [input, setInput] = useState<ASInput>(DEFAULT_AS);
  const result = useMemo(() => calculateAS(input), [input]);
  
  const update = (key: keyof ASInput, v: number) => setInput(prev => ({ ...prev, [key]: v }));
  
  const suitable = input.henryConstant > 0.01;
  
  return (
    <div className="space-y-4">
      <TechCard>
        <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
          <Wind className="w-4 h-4 text-sky-400" /> 气相抽提设计参数
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <NumberField label="初始浓度" value={input.initialConcentration} onChange={v => update('initialConcentration', v)} unit="mg/L" step={0.1} />
          <NumberField label="目标浓度" value={input.targetConcentration} onChange={v => update('targetConcentration', v)} unit="mg/L" step={0.01} />
          <NumberField label="亨利常数" value={input.henryConstant} onChange={v => update('henryConstant', v)} step={0.01} />
          <NumberField label="含水层厚度" value={input.aquiferThickness} onChange={v => update('aquiferThickness', v)} unit="m" step={1} />
          <NumberField label="渗透系数" value={input.hydraulicConductivity} onChange={v => update('hydraulicConductivity', v)} unit="m/d" step={1} />
          <NumberField label="孔隙度" value={input.porosity} onChange={v => update('porosity', v)} step={0.01} />
          <NumberField label="污染羽面积" value={input.plumeArea} onChange={v => update('plumeArea', v)} unit="m²" step={100} />
          <NumberField label="地下水埋深" value={input.depthToWater} onChange={v => update('depthToWater', v)} unit="m" step={1} />
          <NumberField label="设计期限" value={input.designPeriod} onChange={v => update('designPeriod', v)} unit="年" step={1} />
        </div>
      </TechCard>
      
      {!suitable && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2">
          <XCircle className="w-4 h-4 text-red-400" />
          <span className="text-xs text-red-300">亨利常数过低(≤0.01)，该污染物挥发性差，不适合气相抽提技术</span>
        </div>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="影响半径" value={result.influenceRadius} unit="m" />
        <StatBox label="注气流量" value={result.airFlowRate} unit="m³/min" color="#06b6d4" />
        <StatBox label="推荐井数" value={result.recommendedWells} unit="口" color="#10b981" />
        <StatBox label="井间距" value={result.wellSpacing} unit="m" color="#10b981" />
        <StatBox label="注气压力" value={result.injectionPressure} unit="kPa" color="#f59e0b" />
        <StatBox label="预测修复时间" value={result.estimatedTime > 0 ? result.estimatedTime : 'N/A'} unit={result.estimatedTime > 0 ? '年' : ''} color={result.estimatedTime > 0 && result.estimatedTime <= input.designPeriod ? '#10b981' : '#ef4444'} />
        <StatBox label="能否达标" value={result.canAchieveTarget ? '是' : '否'} color={result.canAchieveTarget ? '#10b981' : '#ef4444'} />
        <StatBox label="全生命周期成本" value={result.lifecycleCost} unit="万元" color="#ef4444" />
      </div>
      
      <TechCard>
        <h4 className="text-xs font-semibold text-slate-300 mb-3">去除率随时间变化</h4>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={result.removalCurve}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '时间(年)', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 10 }} />
            <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '浓度(mg/L)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '去除率(%)', angle: 90, position: 'insideRight', fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <ReferenceLine y={input.targetConcentration} yAxisId="left" stroke="#ef4444" strokeDasharray="5 5" />
            <Line yAxisId="left" type="monotone" dataKey="concentration" name="残留浓度" stroke="#06b6d4" strokeWidth={2} dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="removalPercent" name="去除率" stroke="#10b981" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </TechCard>
    </div>
  );
}
