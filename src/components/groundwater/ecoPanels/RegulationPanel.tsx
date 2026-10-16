/**
 * 面板: RegulationPanel（拆分自 EcosystemServiceTab.tsx）
 */
import { TechCard, CollapsiblePanel } from '../../UI';
import { YAxis, Cell, CartesianGrid, XAxis, BarChart, ResponsiveContainer, Tooltip, Bar } from 'recharts';
import { type EcosystemServiceResult, CATEGORY_COLORS, TOOLTIP_STYLE } from './ecoConstants';
import { StatBox } from './StatBox';

export function RegulationPanel({ regulation }: { regulation: EcosystemServiceResult['regulation'] }) {
  const data = [
    { name: '基流维持', value: regulation.baseflow.value },
    { name: '水质净化', value: regulation.purification.value },
    { name: '气候调节', value: regulation.climate.value },
    { name: '洪水调蓄', value: regulation.flood.value },
    { name: '蒸散发调节', value: regulation.etRegulation.value },
  ];
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="调节服务总价值" value={regulation.totalValue.toLocaleString()} unit="万元/年" color="#10b981" />
        <StatBox label="基流维持" value={regulation.baseflow.value.toLocaleString()} unit="万元" color="#06b6d4" />
        <StatBox label="水质净化" value={regulation.purification.value.toLocaleString()} unit="万元" color="#10b981" />
        <StatBox label="气候调节(碳汇)" value={regulation.climate.value.toLocaleString()} unit="万元" color="#8b5cf6" />
        <StatBox label="洪水调蓄" value={regulation.flood.value.toLocaleString()} unit="万元" color="#f59e0b" />
        <StatBox label="蒸散发调节" value={regulation.etRegulation.value.toLocaleString()} unit="万元" color="#06b6d4" />
        <StatBox label="基流量" value={regulation.baseflow.volume.toLocaleString()} unit="万m³" />
        <StatBox label="净化污染物" value={regulation.purification.amount.toLocaleString()} unit="吨/年" />
      </div>
      
      <TechCard>
        <h4 className="text-xs font-semibold text-slate-300 mb-3">调节服务价值分布</h4>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '价值(万元)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => `${v.toLocaleString()} 万元`} />
            <Bar dataKey="value" name="价值" radius={[4, 4, 0, 0]}>
              {data.map((_, i) => <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </TechCard>
      
      <CollapsiblePanel title="调节服务评估方法" defaultOpen={false}>
        <div className="text-xs text-slate-400 space-y-2">
          <p><strong className="text-slate-300">基流维持</strong>: 替代工程法，以建设同等流量水库的成本(2元/m³)估算基流价值。</p>
          <p><strong className="text-slate-300">水质净化</strong>: 替代成本法，以同等污染物处理量的水处理成本估算。</p>
          <p><strong className="text-slate-300">气候调节</strong>: 碳储量乘以碳交易价格，反映地下水生态系统的碳汇价值。</p>
          <p><strong className="text-slate-300">洪水调蓄</strong>: 调蓄空间乘以单位避免洪涝损失。</p>
          <p><strong className="text-slate-300">蒸散发调节</strong>: 蒸散发量乘以微气候调节单价(0.5元/m³)。</p>
        </div>
      </CollapsiblePanel>
    </div>
  );
}
