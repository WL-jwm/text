/**
 * PATPanel — 修复方案评估面板（自 RemediationTab.tsx 拆分）
 */
import { useState, useMemo } from 'react';
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';
import { Droplets } from 'lucide-react';
import { TechCard } from '../../UI';
import { calculatePAT, type PATInput } from '../../../utils/remediationEvaluator';
import { DEFAULT_PAT, TOOLTIP_STYLE } from '../remediationConstants';
import { NumberField, StatBox } from './controls';

// PAT面板
export function PATPanel() {
  const [input, setInput] = useState<PATInput>(DEFAULT_PAT);
  const result = useMemo(() => calculatePAT(input), [input]);
  
  const update = (key: keyof PATInput, v: number) => setInput(prev => ({ ...prev, [key]: v }));
  
  return (
    <div className="space-y-4">
      <TechCard>
        <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
          <Droplets className="w-4 h-4 text-blue-400" /> 抽出处理系统参数
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <NumberField label="渗透系数" value={input.hydraulicConductivity} onChange={v => update('hydraulicConductivity', v)} unit="m/d" step={1} />
          <NumberField label="含水层厚度" value={input.aquiferThickness} onChange={v => update('aquiferThickness', v)} unit="m" step={1} />
          <NumberField label="水力梯度" value={input.hydraulicGradient} onChange={v => update('hydraulicGradient', v)} step={0.001} />
          <NumberField label="孔隙度" value={input.porosity} onChange={v => update('porosity', v)} step={0.01} />
          <NumberField label="污染羽面积" value={input.plumeArea} onChange={v => update('plumeArea', v)} unit="m²" step={100} />
          <NumberField label="初始浓度" value={input.initialConcentration} onChange={v => update('initialConcentration', v)} unit="mg/L" step={0.1} />
          <NumberField label="目标浓度" value={input.targetConcentration} onChange={v => update('targetConcentration', v)} unit="mg/L" step={0.01} />
          <NumberField label="单井抽水量" value={input.pumpingRate} onChange={v => update('pumpingRate', v)} unit="m³/d" step={5} />
          <NumberField label="井半径" value={input.wellRadius} onChange={v => update('wellRadius', v)} unit="m" step={0.01} />
          <NumberField label="储水系数" value={input.storageCoefficient} onChange={v => update('storageCoefficient', v)} step={0.0001} />
          <NumberField label="设计期限" value={input.designPeriod} onChange={v => update('designPeriod', v)} unit="年" step={1} />
        </div>
      </TechCard>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="影响半径" value={result.influenceRadius} unit="m" />
        <StatBox label="捕获区宽度" value={result.captureWidth} unit="m" color="#10b981" />
        <StatBox label="推荐井数" value={result.recommendedWells} unit="口" color="#10b981" />
        <StatBox label="总抽水量" value={result.totalPumpingRate} unit="m³/d" color="#06b6d4" />
        <StatBox label="孔隙体积交换" value={result.poreVolumeExchanges} unit="次" color="#f59e0b" />
        <StatBox label="预测修复时间" value={result.estimatedRemediationTime} unit="年" color={result.estimatedRemediationTime <= input.designPeriod ? '#10b981' : '#ef4444'} />
        <StatBox label="能否达标" value={result.canAchieveTarget ? '是' : '否'} color={result.canAchieveTarget ? '#10b981' : '#ef4444'} />
        <StatBox label="全生命周期成本" value={result.lifecycleCost} unit="万元" color="#ef4444" />
      </div>
      
      <TechCard>
        <h4 className="text-xs font-semibold text-slate-300 mb-3">浓度衰减曲线</h4>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={result.concentrationCurve}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '时间(年)', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 10 }} />
            <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '浓度(mg/L)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: 'PV交换次数', angle: 90, position: 'insideRight', fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <ReferenceLine y={input.targetConcentration} yAxisId="left" stroke="#ef4444" strokeDasharray="5 5" label={{ value: '目标', fill: '#ef4444', fontSize: 10 }} />
            <Line yAxisId="left" type="monotone" dataKey="concentration" name="出水浓度" stroke="#06b6d4" strokeWidth={2} dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="cumulativePV" name="累计PV" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </TechCard>
    </div>
  );
}
