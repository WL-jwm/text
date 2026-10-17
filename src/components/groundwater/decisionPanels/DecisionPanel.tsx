/**
 * 拆分自 DecisionSupportTab.tsx
 */

import { Award } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { TechCard } from '../../UI';
import { LazyChartCard } from '../../LazyChartCard';
import { FilterableTechTable } from '../../FilterableTechTable';
import { ProgressBar, RankBadge } from '../decisionSupportUI';
import { TOOLTIP_STYLE } from '../decisionSupportConstants';
import type { DecisionResult } from '../../../utils/decisionSupportCalculator';

export function DecisionPanel({ decisionResult, decisionRadarData }: { decisionResult: DecisionResult; decisionRadarData: { option: string; '水资源保障': number; '生态效益': number; '经济可行性': number; '技术可行性': number; '社会接受度': number }[] }) {
  return (
    <>
    {/* ═══ Panel 5: 综合决策评价 ═══ */}
    <TechCard title="综合决策评价（多目标加权）" badge="综合" icon={Award} className="border-purple-500/15">
      <div className="grid grid-cols-[1fr_1fr] gap-3">
        <LazyChartCard title="方案对比雷达图" height={300}>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={[
              { criterion: '水资源保障', ...Object.fromEntries(decisionRadarData.map(d => [d.option, d.水资源保障])) },
              { criterion: '生态效益', ...Object.fromEntries(decisionRadarData.map(d => [d.option, d.生态效益])) },
              { criterion: '经济可行性', ...Object.fromEntries(decisionRadarData.map(d => [d.option, d.经济可行性])) },
              { criterion: '技术可行性', ...Object.fromEntries(decisionRadarData.map(d => [d.option, d.技术可行性])) },
              { criterion: '社会接受度', ...Object.fromEntries(decisionRadarData.map(d => [d.option, d.社会接受度])) },
            ]} margin={{ top: 10, right: 40, bottom: 10, left: 40 }}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="criterion" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
              {decisionRadarData.map((d, i) => {
                const key = d.option;
                const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
                return <Radar key={key} name={key} dataKey={key} stroke={colors[i % 4]} fill={colors[i % 4]} fillOpacity={0.15} />;
              })}
              <Tooltip {...TOOLTIP_STYLE} />
            </RadarChart>
          </ResponsiveContainer>
        </LazyChartCard>
    
        {/* 方案排名卡片 */}
        <div className="space-y-2">
          {decisionResult.rankedOptions.map((opt) => {
            const colors = ['#f59e0b', '#94a3b8', '#b45309', '#64748b'];
            const accent = opt.rank <= 3 ? colors[opt.rank - 1] : colors[3];
            return (
              <div
                key={opt.name}
                className="p-2.5 rounded-xl border transition-all"
                style={{
                  background: opt.rank === 1 ? `${accent}10` : 'rgba(255,255,255,0.02)',
                  borderColor: opt.rank === 1 ? `${accent}40` : 'rgba(255,255,255,0.08)',
                }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <RankBadge rank={opt.rank} />
                  <span className="text-xs font-semibold text-gw-text flex-1">{opt.name}</span>
                  <span className="text-sm font-bold" style={{ color: accent }}>{opt.totalScore}</span>
                </div>
                <div className="mb-1"><ProgressBar value={opt.totalScore} max={100} color={accent} /></div>
                <div className="flex items-center gap-3 text-[10px] text-gw-muted">
                  <span>投资 {opt.investment}万</span>
                  <span>周期 {opt.period}年</span>
                </div>
                <p className="text-[10px] text-gw-muted mt-1">{opt.recommendation}</p>
              </div>
            );
          })}
        </div>
      </div>
    
      <div className="mt-3">
        <FilterableTechTable
          headers={['排名', '方案', '综合评分', '投资(万元)', '周期(年)', '推荐意见']}
          rows={decisionResult.rankedOptions.map(o => [o.rank, o.name, o.totalScore, o.investment, o.period, o.recommendation])}
        />
      </div>
    
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[11px] font-semibold text-gw-text mb-1">权重设置</p>
          <FilterableTechTable
            headers={['评价准则', '权重', '说明']}
            rows={decisionResult.weights.map(w => [w.criterion, `${(w.weight * 100).toFixed(0)}%`, w.description])}
          />
        </div>
        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-gw-text">综合建议</p>
          {decisionResult.recommendations.map((r, i) => (
            <div key={i} className="flex items-start gap-1.5 p-2 rounded-lg bg-purple-500/8 border border-purple-500/12">
              <span className="text-[10px] text-purple-400 font-bold mt-0.5">{i + 1}.</span>
              <p className="text-[10px] text-gw-muted">{r}</p>
            </div>
          ))}
        </div>
      </div>
    </TechCard>
    
    </>
  );
}
