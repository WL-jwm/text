/**
 * 面板: SupplyPanel（拆分自 EcosystemServiceTab.tsx）
 */
import { CollapsiblePanel, TechCard } from '../../UI';
import { Tooltip, Bar, ResponsiveContainer, Line, YAxis, ComposedChart, CartesianGrid, XAxis, Legend } from 'recharts';
import { type EcosystemServiceResult, TOOLTIP_STYLE } from './ecoConstants';
import { StatBox } from './StatBox';

export function SupplyPanel({ supply }: { supply: EcosystemServiceResult['supply'] }) {
  const data = [
    { name: '生活用水', volume: supply.domestic.volume, value: supply.domestic.value },
    { name: '农业灌溉', volume: supply.irrigation.volume, value: supply.irrigation.value },
    { name: '工业用水', volume: supply.industrial.volume, value: supply.industrial.value },
    { name: '生态用水', volume: supply.ecological.volume, value: supply.ecological.value },
  ];
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="总供水量" value={supply.totalVolume.toLocaleString()} unit="万m³/年" color="#06b6d4" />
        <StatBox label="供水总价值" value={supply.totalValue.toLocaleString()} unit="万元/年" color="#10b981" />
        <StatBox label="生活用水价值" value={supply.domestic.value.toLocaleString()} unit="万元" />
        <StatBox label="农业灌溉价值" value={supply.irrigation.value.toLocaleString()} unit="万元" />
      </div>
      
      <TechCard>
        <h4 className="text-xs font-semibold text-slate-300 mb-3">各类用水量与价值对比</h4>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '水量(万m³)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '价值(万元)', angle: 90, position: 'insideRight', fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar yAxisId="left" dataKey="volume" name="用水量" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="value" name="经济价值" stroke="#f59e0b" strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>
      </TechCard>
      
      <CollapsiblePanel title="供给服务评估方法" defaultOpen={false}>
        <div className="text-xs text-slate-400 space-y-2">
          <p>供给服务采用市场价值法评估，水量乘以对应水价得出经济价值。生活、农业、工业、生态用水分别按各自水价计算。</p>
          <p>生态用水按生活水价的80%估算，反映其社会公益性。实际开采量与可开采量的比值反映资源可持续性。</p>
        </div>
      </CollapsiblePanel>
    </div>
  );
}
