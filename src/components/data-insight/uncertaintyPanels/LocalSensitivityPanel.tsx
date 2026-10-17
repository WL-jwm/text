/**
 * 拆分自 UncertaintyAnalysisTab.tsx
 */
import { useState, useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Wind } from 'lucide-react';
import { TechCard } from '../../UI';
import { FilterableTechTable } from '../../FilterableTechTable';
import { runLocalSensitivity, type ModelFunction, type UncertainParameter } from '../../../utils/uncertaintyAnalyzer';
import { NumInput } from './NumInput';
import { PIE_COLORS, TOOLTIP_STYLE } from './uncertaintyConstants';

export function LocalSensitivityPanel({ model, parameters }: { model: ModelFunction; parameters: UncertainParameter[] }) {
  const [perturbation, setPerturbation] = useState(10);
  const result = useMemo(() => runLocalSensitivity(parameters, model, perturbation), [parameters, model, perturbation]);



  const tornadoChartData = useMemo(() => {
    const sorted = [...result].sort((a, b) => Math.abs(b.normalizedSensitivity) - Math.abs(a.normalizedSensitivity));
    return sorted.map(r => ({
      name: r.parameter,
      negative: -Math.abs(r.normalizedSensitivity),
      positive: Math.abs(r.normalizedSensitivity),
    }));
  }, [result]);

  const tableRows = useMemo(() =>
    result.map(r => [
      r.parameter,
      r.baseValue.toFixed(4),
      r.elasticity.toFixed(4),
      r.normalizedSensitivity.toFixed(4),
      r.perturbedOutputs.find(p => p.delta === 0.05)?.output.toFixed(4) ?? '-',
      r.perturbedOutputs.find(p => p.delta === -0.05)?.output.toFixed(4) ?? '-',
    ]),
  [result]);

  return (
    <div className="space-y-4">
      <TechCard>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Wind size={16} className="text-blue-400" />
            <h4 className="text-sm font-semibold text-gw-text">局部敏感性分析（OAT）</h4>
          </div>
          <NumInput label="扰动幅度" value={perturbation} onChange={setPerturbation} unit="%" step={5} />
        </div>
      </TechCard>

      <TechCard>
        <h5 className="text-xs font-medium text-gw-text mb-3">敏感性龙卷风图</h5>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={tornadoChartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} width={60} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="positive" name="正向敏感度" fill="#06b6d4" radius={[0, 3, 3, 0]} stackId="a" barSize={15} />
            <Bar dataKey="negative" name="负向敏感度" fill="#ef4444" radius={[3, 0, 0, 3]} stackId="a" barSize={15} />
          </BarChart>
        </ResponsiveContainer>
      </TechCard>

      <TechCard>
        <h5 className="text-xs font-medium text-gw-text mb-3">参数扰动响应曲线</h5>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis type="number" domain={[-0.5, 0.5]} tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '参数变化(%)', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 10 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '输出变化(%)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <ReferenceLine x={0} stroke="#64748b" />
            {result.map((r, idx) => (
              <Line
                key={r.parameter}
                type="monotone"
                dataKey="delta"
                name={r.parameter}
                data={r.perturbedOutputs.map(p => ({ x: p.delta, [r.parameter]: p.delta }))}
                stroke={PIE_COLORS[idx % PIE_COLORS.length]}
                strokeWidth={1.5}
                dot={{ r: 2 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </TechCard>

      <TechCard>
        <h5 className="text-xs font-medium text-gw-text mb-2">局部敏感性明细</h5>
        <FilterableTechTable
          headers={['参数', '基值', '弹性系数', '归一化敏感度', '+5%输出', '-5%输出']}
          rows={tableRows}
        />
      </TechCard>
    </div>
  );
}
