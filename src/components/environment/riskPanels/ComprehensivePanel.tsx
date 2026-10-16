/**
 * 面板: ComprehensivePanel（拆分自 RiskAssessmentTab.tsx）
 */
import { FilterableTechTable } from '../../FilterableTechTable';
import { LazyChartCard } from '../../LazyChartCard';
import { TechCard } from '../../UI';
import { ShieldAlert } from 'lucide-react';
import { Cell, CartesianGrid, RadarChart, ResponsiveContainer, PolarGrid, PolarRadiusAxis, Radar, Tooltip, Bar, YAxis, XAxis, PolarAngleAxis, BarChart } from 'recharts';
import { calcComprehensiveRisk } from '../../../utils/riskAssessmentCalculator';
import { TOOLTIP_STYLE } from './riskAssessmentConstants';

interface ComprehensivePanelProps {
  radarData: { risk: string
  score: number }[]
  barData: { name: string
  score: number
  contribution: number
  fill: string }[]
  comprehensiveResult: ReturnType<typeof calcComprehensiveRisk>;
}
export function ComprehensivePanel({ radarData, barData, comprehensiveResult }: ComprehensivePanelProps) {
  return (
      <TechCard title="综合风险评价（AHP权重）" badge="综合" icon={ShieldAlert} className="border-red-500/15">
        <div className="grid grid-cols-2 gap-3">
          <LazyChartCard title="风险雷达图" height={300}>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="risk" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 5]} tick={{ fill: '#64748b', fontSize: 10 }} />
                <Radar name="风险评分" dataKey="score" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                <Tooltip {...TOOLTIP_STYLE} />
              </RadarChart>
            </ResponsiveContainer>
          </LazyChartCard>

          <div className="space-y-3">
            <LazyChartCard title="各风险贡献度" height={180}>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" domain={[0, 5]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} width={55} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Bar dataKey="score" name="评分" radius={[0, 4, 4, 0]}>
                    {barData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </LazyChartCard>

            <div className="p-3 rounded-lg bg-red-500/8 border border-red-500/15">
              <p className="text-xs font-semibold text-red-400">{comprehensiveResult.matrixLevel}</p>
              <p className="text-[11px] text-gw-muted mt-1">综合评分: {comprehensiveResult.overallScore} / 5.00</p>
              <p className="text-[11px] text-gw-muted">优先管控: {comprehensiveResult.priorityOrder.join(' → ')}</p>
            </div>

            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-gw-text">综合建议</p>
              {comprehensiveResult.recommendations.map((r, i) => (
                <p key={i} className="text-[10px] text-gw-muted">• {r}</p>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3">
          <FilterableTechTable
            headers={['风险类型', '等级', '评分', '权重', '贡献度', '占比']}
            rows={comprehensiveResult.riskContributions.map(r => [r.riskType, r.level, r.score, r.weight, r.contribution, `${r.barWidth}%`])}
          />
        </div>
      </TechCard>
  );
}
