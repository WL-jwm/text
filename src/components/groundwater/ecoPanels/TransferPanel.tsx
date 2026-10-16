/**
 * 面板: TransferPanel（拆分自 EcosystemServiceTab.tsx）
 */
import { type ValueTransferInput, calculateValueTransfer } from '../../../utils/ecosystemServiceEvaluator';
import { TechCard } from '../../UI';
import { TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { YAxis, Cell, CartesianGrid, XAxis, BarChart, ResponsiveContainer, Tooltip, Bar } from 'recharts';
import { CATEGORY_COLORS, TOOLTIP_STYLE } from './ecoConstants';
import { StatBox } from './StatBox';

export function TransferPanel() {
  const [input, setInput] = useState<ValueTransferInput>({
    area: 5000, aquiferType: 'porous', climate: 'semi-arid', development: 'high',
  });
  const result = useMemo(() => calculateValueTransfer(input), [input]);
  
  return (
    <div className="space-y-4">
      <TechCard>
        <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" /> 价值转移法估算
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-slate-400 block mb-1">评估面积 (km²)</label>
            <input type="number" value={input.area} step={100}
              onChange={e => setInput(p => ({ ...p, area: parseFloat(e.target.value) || 0 }))}
              className="w-full bg-slate-800/60 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">含水层类型</label>
            <select value={input.aquiferType} onChange={e => setInput(p => ({ ...p, aquiferType: e.target.value as ValueTransferInput['aquiferType'] }))}
              className="w-full bg-slate-800/60 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none">
              <option value="porous">孔隙含水层</option>
              <option value="fractured">裂隙含水层</option>
              <option value="karst">岩溶含水层</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">气候区</label>
            <select value={input.climate} onChange={e => setInput(p => ({ ...p, climate: e.target.value as ValueTransferInput['climate'] }))}
              className="w-full bg-slate-800/60 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none">
              <option value="humid">湿润区</option>
              <option value="semi-arid">半干旱区</option>
              <option value="arid">干旱区</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">开发利用程度</label>
            <select value={input.development} onChange={e => setInput(p => ({ ...p, development: e.target.value as ValueTransferInput['development'] }))}
              className="w-full bg-slate-800/60 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none">
              <option value="low">低开发</option>
              <option value="medium">中开发</option>
              <option value="high">高开发</option>
            </select>
          </div>
        </div>
      </TechCard>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatBox label="单位面积价值" value={result.unitValue} unit="万元/km²·年" color="#06b6d4" />
        <StatBox label="总价值" value={result.totalValue.toLocaleString()} unit="万元/年" color="#10b981" />
        <StatBox label="评估面积" value={input.area} unit="km²" />
      </div>
      
      <TechCard>
        <h4 className="text-xs font-semibold text-slate-300 mb-3">各服务类型价值分配</h4>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={result.services}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="type" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '万元/年', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Bar dataKey="totalValue" name="总价值" radius={[4, 4, 0, 0]}>
              {result.services.map((_, i) => <Cell key={i} fill={CATEGORY_COLORS[i]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </TechCard>
      
      <TechCard>
        <h4 className="text-xs font-semibold text-slate-300 mb-3">价值转移修正系数</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-2 px-2 text-slate-400">修正因子</th>
                <th className="text-right py-2 px-2 text-slate-400">系数</th>
                <th className="text-left py-2 px-2 text-slate-400">说明</th>
              </tr>
            </thead>
            <tbody>
              {result.transferCoefficients.map((c, i) => (
                <tr key={i} className="border-b border-slate-800">
                  <td className="py-2 px-2 text-slate-200">{c.factor}</td>
                  <td className="text-right py-2 px-2 text-cyan-400 font-semibold">{c.coefficient.toFixed(2)}</td>
                  <td className="py-2 px-2 text-slate-400">{c.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>
    </div>
  );
}
