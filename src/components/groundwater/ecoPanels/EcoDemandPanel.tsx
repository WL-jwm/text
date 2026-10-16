/**
 * 面板: EcoDemandPanel（拆分自 EcosystemServiceTab.tsx）
 */
import { type EcoWaterDemandInput, calculateEcoWaterDemand } from '../../../utils/ecosystemServiceEvaluator';
import { TechCard } from '../../UI';
import { TrendingDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { YAxis, CartesianGrid, XAxis, LineChart, ResponsiveContainer, Tooltip, Legend, Line } from 'recharts';
import { TOOLTIP_STYLE } from './ecoConstants';
import { StatBox } from './StatBox';

export function EcoDemandPanel() {
  const [input, setInput] = useState<EcoWaterDemandInput>({
    wetlandArea: 500, wetlandET: 1200,
    vegetationArea: 1000, vegetationTranspiration: 800,
    riverLength: 200, riverEvaporation: 1100, riverWidth: 30,
    criticalDepth: 4, currentDepth: 12,
    specificYield: 0.15, influenceRadius: 50,
  });
  
  const result = useMemo(() => calculateEcoWaterDemand(input), [input]);
  const update = (key: keyof EcoWaterDemandInput, v: number) => setInput(prev => ({ ...prev, [key]: v }));
  
  return (
    <div className="space-y-4">
      <TechCard>
        <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-blue-400" /> 生态需水量计算
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {([
            ['wetlandArea', '湿地面积', 'km²', 100], ['wetlandET', '湿地蒸散发', 'mm/年', 50],
            ['vegetationArea', '植被面积', 'km²', 100], ['vegetationTranspiration', '植被蒸腾', 'mm/年', 50],
            ['riverLength', '河流长度', 'km', 10], ['riverEvaporation', '河流蒸发', 'mm/年', 50],
            ['riverWidth', '河流宽度', 'm', 5], ['criticalDepth', '临界埋深', 'm', 0.5],
            ['currentDepth', '当前埋深', 'm', 0.5], ['specificYield', '给水度', '', 0.01],
            ['influenceRadius', '影响半径', 'm', 10],
          ] as [keyof EcoWaterDemandInput, string, string, number][]).map(([key, label, unit, step]) => (
            <div key={key}>
              <label className="text-xs text-slate-400 block mb-1">{label}{unit ? ` (${unit})` : ''}</label>
              <input type="number" value={input[key]} step={step}
                onChange={e => update(key, parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800/60 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          ))}
        </div>
      </TechCard>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="总需水量" value={result.totalDemand} unit="万m³/年" color="#06b6d4" />
        <StatBox label="湿地需水" value={result.wetlandDemand} unit="万m³" color="#10b981" />
        <StatBox label="植被需水" value={result.vegetationDemand} unit="万m³" color="#84cc16" />
        <StatBox label="河流需水" value={result.riverDemand} unit="万m³" color="#3b82f6" />
        <StatBox label="当前供给" value={result.currentSupply} unit="万m³" color="#f59e0b" />
        <StatBox label="缺水量" value={result.deficit} unit="万m³" color="#ef4444" />
        <StatBox label="缺水率" value={result.deficitRatio} unit="%" color={result.deficitRatio > 50 ? '#ef4444' : '#f59e0b'} />
        <StatBox label="缺水状态" value={result.status} color={result.deficitRatio < 30 ? '#10b981' : '#ef4444'} />
      </div>
      
      <TechCard>
        <h4 className="text-xs font-semibold text-slate-300 mb-3">月度生态需水过程</h4>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={result.monthlyDemand}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '需水量(万m³)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Line type="monotone" dataKey="wetland" name="湿地" stroke="#10b981" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="vegetation" name="植被" stroke="#84cc16" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="river" name="河流" stroke="#3b82f6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="total" name="总计" stroke="#06b6d4" strokeWidth={2.5} strokeDasharray="5 3" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </TechCard>
    </div>
  );
}
