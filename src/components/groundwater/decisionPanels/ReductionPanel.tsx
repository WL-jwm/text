/**
 * 拆分自 DecisionSupportTab.tsx
 */

import { Activity } from 'lucide-react';
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { TechCard } from '../../UI';
import { LazyChartCard } from '../../LazyChartCard';
import { FilterableTechTable } from '../../FilterableTechTable';
import { ProgressBar } from '../decisionSupportUI';
import { TOOLTIP_STYLE } from '../decisionSupportConstants';
import type { ReductionResult } from '../../../utils/decisionSupportCalculator';

export function ReductionPanel({ reductionResult, reductionTrendData }: { reductionResult: ReductionResult; reductionTrendData: { phase: string; extraction: number; target: number; alternative: number }[] }) {
  return (
    <>
    {/* ═══ Panel 2: 压采方案评估 ═══ */}
    <TechCard title="压采方案评估" badge="压采" icon={Activity} className="border-orange-500/15">
      <LazyChartCard title="分阶段压采趋势" height={240}>
        <ResponsiveContainer width="100%" height={240}>
          <ComposedChart data={reductionTrendData} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="phase" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} unit="万m³" />
            <Tooltip {...TOOLTIP_STYLE} />
            <Bar dataKey="extraction" name="当前开采" fill="#f97316" radius={[4, 4, 0, 0]} />
            <Bar dataKey="target" name="目标开采" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Line dataKey="alternative" name="替代水量" stroke="#10b981" strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>
      </LazyChartCard>
    
      <div className="grid grid-cols-4 gap-2 mt-3">
        <div className="p-2.5 rounded-xl bg-orange-500/8 border border-orange-500/15">
          <p className="text-[10px] text-gw-muted mb-0.5">总压采量</p>
          <p className="text-base font-bold text-orange-400">{reductionResult.totalReduction}<span className="text-[10px] text-gw-muted ml-0.5">万m³/yr</span></p>
        </div>
        <div className="p-2.5 rounded-xl bg-red-500/8 border border-red-500/15">
          <p className="text-[10px] text-gw-muted mb-0.5">压采率</p>
          <p className="text-base font-bold text-red-400">{reductionResult.totalReductionRate}%</p>
          <div className="mt-1"><ProgressBar value={reductionResult.totalReductionRate} max={100} color="#ef4444" /></div>
        </div>
        <div className="p-2.5 rounded-xl bg-amber-500/8 border border-amber-500/15">
          <p className="text-[10px] text-gw-muted mb-0.5">总替代成本</p>
          <p className="text-base font-bold text-amber-400">{reductionResult.totalAlternativeCost}<span className="text-[10px] text-gw-muted ml-0.5">万元</span></p>
        </div>
        <div className="p-2.5 rounded-xl bg-green-500/8 border border-green-500/15">
          <p className="text-[10px] text-gw-muted mb-0.5">综合评分</p>
          <p className="text-base font-bold text-green-400">{reductionResult.overallScore}<span className="text-[10px] text-gw-muted ml-0.5">/100</span></p>
          <div className="mt-1"><ProgressBar value={reductionResult.overallScore} max={100} color="#10b981" /></div>
        </div>
      </div>
    
      <div className="mt-3">
        <FilterableTechTable
          headers={['阶段', '年份', '压采量(万m³)', '压采率', '替代水量', '替代成本(万元)', '缺口', '生态效益', '评估']}
          rows={reductionResult.phaseResults.map(p => [p.phase, p.yearRange, p.reduction, `${p.reductionRate}%`, p.alternativeVolume, p.alternativeCost, p.gap, p.ecologicalBenefit, p.assessment])}
        />
      </div>
    
      <div className="mt-2 space-y-1">
        {reductionResult.recommendations.map((r, i) => (
          <div key={i} className="flex items-start gap-1.5">
            <span className="text-[10px] text-orange-400 mt-0.5">▸</span>
            <p className="text-[10px] text-gw-muted">{r}</p>
          </div>
        ))}
      </div>
    </TechCard>
    
    </>
  );
}
