/**
 * MCDAPanel — 修复方案评估面板（自 RemediationTab.tsx 拆分）
 */
import { useState, useMemo } from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip, Legend,
} from 'recharts';
import { Scale } from 'lucide-react';
import { TechCard } from '../../UI';
import { calculateMCDA, type MCDAInput } from '../../../utils/remediationEvaluator';
import { DEFAULT_MCDA, TOOLTIP_STYLE } from '../remediationConstants';

// MCDA方案比选面板
export function MCDAPanel() {
  const [input, setInput] = useState<MCDAInput>(DEFAULT_MCDA);
  const result = useMemo(() => calculateMCDA(input), [input]);
  
  const radarData = useMemo(() => {
    const criteria = Object.keys(input.weights);
    return criteria.map(c => {
      const row: Record<string, number | string> = { criterion: input.criteriaLabels[c] || c };
      input.alternatives.forEach(alt => {
        row[alt.name] = alt.scores[c] || 0;
      });
      return row;
    });
  }, [input]);
  
  return (
    <div className="space-y-4">
      <TechCard>
        <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
          <Scale className="w-4 h-4 text-amber-400" /> 多准则决策分析(MCDA)
        </h3>
        <div className="text-xs text-slate-400 mb-3">
          基于6项准则对5种修复技术进行综合评价，权重可通过滑块调整
        </div>
        <div className="space-y-2">
          {Object.entries(input.weights).map(([key, w]) => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-xs text-slate-300 w-20">{input.criteriaLabels[key] || key}</span>
              <input
                type="range" min={0} max={1} step={0.05} value={w}
                onChange={(e) => {
                  const newW = parseFloat(e.target.value);
                  const others = Object.entries(input.weights).filter(([k]) => k !== key);
                  const remainW = 1 - newW;
                  const totalOthers = others.reduce((s, [, v]) => s + v, 0);
                  const newWeights = { ...input.weights, [key]: newW };
                  others.forEach(([k, v]) => {
                    newWeights[k] = totalOthers > 0 ? (v / totalOthers) * remainW : remainW / others.length;
                  });
                  setInput(prev => ({ ...prev, weights: newWeights }));
                }}
                className="flex-1"
              />
              <span className="text-xs text-cyan-400 w-10 text-right">{(w * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </TechCard>
      
      <TechCard>
        <h4 className="text-xs font-semibold text-slate-300 mb-3">综合排名</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-2 px-2 text-slate-400">排名</th>
                <th className="text-left py-2 px-2 text-slate-400">方案</th>
                <th className="text-right py-2 px-2 text-slate-400">综合得分</th>
                <th className="text-right py-2 px-2 text-slate-400">成本(万元)</th>
                <th className="text-right py-2 px-2 text-slate-400">修复时间(年)</th>
                <th className="text-right py-2 px-2 text-slate-400">成本效益比</th>
              </tr>
            </thead>
            <tbody>
              {result.ranking.map((r) => (
                <tr key={r.id} className={`border-b border-slate-800 ${r.rank === 1 ? 'bg-cyan-500/5' : ''}`}>
                  <td className="py-2 px-2">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${r.rank === 1 ? 'bg-cyan-500 text-white' : r.rank === 2 ? 'bg-slate-600 text-slate-200' : 'bg-slate-800 text-slate-400'}`}>
                      {r.rank}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-slate-200">{r.name}{r.rank === 1 && <span className="ml-2 text-cyan-400">推荐</span>}</td>
                  <td className="text-right py-2 px-2 text-cyan-400 font-semibold">{r.totalScore}</td>
                  <td className="text-right py-2 px-2 text-slate-300">{r.cost}</td>
                  <td className="text-right py-2 px-2 text-slate-300">{r.remediationTime || '实时'}</td>
                  <td className="text-right py-2 px-2 text-amber-400">{result.costEffectiveness.find(c => c.name === r.name)?.ratio || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>
      
      <TechCard>
        <h4 className="text-xs font-semibold text-slate-300 mb-3">雷达图对比</h4>
        <ResponsiveContainer width="100%" height={320}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis dataKey="criterion" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} />
            {input.alternatives.map((alt, i) => (
              <Radar key={alt.id} name={alt.name} dataKey={alt.name} stroke={['#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'][i]} fill={['#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'][i]} fillOpacity={0.1} strokeWidth={1.5} />
            ))}
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Tooltip {...TOOLTIP_STYLE} />
          </RadarChart>
        </ResponsiveContainer>
      </TechCard>
      
      <TechCard>
        <h4 className="text-xs font-semibold text-slate-300 mb-3">权重敏感性分析</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-2 px-2 text-slate-400">准则</th>
                <th className="text-center py-2 px-2 text-slate-400">权重+20%排序变化</th>
                <th className="text-center py-2 px-2 text-slate-400">权重-20%排序变化</th>
                <th className="text-center py-2 px-2 text-slate-400">是否敏感</th>
              </tr>
            </thead>
            <tbody>
              {result.sensitivityAnalysis.map((s) => (
                <tr key={s.criterion} className="border-b border-slate-800">
                  <td className="py-2 px-2 text-slate-200">{input.criteriaLabels[s.criterion] || s.criterion}</td>
                  <td className="text-center py-2 px-2 text-slate-400">
                    {s.increasedRank.map(id => input.alternatives.find(a => a.id === id)?.name?.charAt(0) || '?').join('→')}
                  </td>
                  <td className="text-center py-2 px-2 text-slate-400">
                    {s.decreasedRank.map(id => input.alternatives.find(a => a.id === id)?.name?.charAt(0) || '?').join('→')}
                  </td>
                  <td className="text-center py-2 px-2">
                    {s.rankChanged ? <span className="text-amber-400">敏感</span> : <span className="text-emerald-400">稳定</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>
    </div>
  );
}
