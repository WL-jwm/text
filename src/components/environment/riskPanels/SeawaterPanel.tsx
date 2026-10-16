import { calcSeawaterIntrusionRisk, type SeawaterIntrusionInput } from '../../../utils/riskAssessmentCalculator';

/**
 * 面板: SeawaterPanel（拆分自 RiskAssessmentTab.tsx）
 */
import { FilterableTechTable } from '../../FilterableTechTable';
import { StatCard, TechCard } from '../../UI';
import { Waves } from 'lucide-react';

interface SeawaterPanelProps {
  seawater: SeawaterIntrusionInput
  setSeawater: React.Dispatch<React.SetStateAction<SeawaterIntrusionInput>>
  seawaterResult: ReturnType<typeof calcSeawaterIntrusionRisk>;
}
export function SeawaterPanel({ seawater, setSeawater, seawaterResult }: SeawaterPanelProps) {
  return (
      <TechCard title="海水入侵风险评价" badge="入侵" icon={Waves} className="border-cyan-500/15">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="block text-[11px] text-gw-muted">距海岸线距离 (km)</label>
            <input type="number" value={seawater.distanceToCoast} onChange={e => setSeawater({ ...seawater, distanceToCoast: +e.target.value })}
              className="w-full px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text" />
            <label className="block text-[11px] text-gw-muted">当前Cl⁻浓度 (mg/L)</label>
            <input type="number" value={seawater.currentChloride} onChange={e => setSeawater({ ...seawater, currentChloride: +e.target.value })}
              className="w-full px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text" />
            <label className="block text-[11px] text-gw-muted">5年前Cl⁻浓度 (mg/L)</label>
            <input type="number" value={seawater.previousChloride} onChange={e => setSeawater({ ...seawater, previousChloride: +e.target.value })}
              className="w-full px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text" />
            <label className="block text-[11px] text-gw-muted">内陆水位标高 (m)</label>
            <input type="number" step="0.1" value={seawater.inlandWaterLevel} onChange={e => setSeawater({ ...seawater, inlandWaterLevel: +e.target.value })}
              className="w-full px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text" />
            <label className="block text-[11px] text-gw-muted">含水层渗透系数 (m/d)</label>
            <input type="number" value={seawater.conductivity} onChange={e => setSeawater({ ...seawater, conductivity: +e.target.value })}
              className="w-full px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text" />
            <label className="flex items-center gap-2 text-[11px] text-gw-muted">
              <input type="checkbox" checked={seawater.hasInterface} onChange={e => setSeawater({ ...seawater, hasInterface: e.target.checked })}
                className="accent-cyan-500" />
              存在咸淡水界面
            </label>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <StatCard title="侵入程度" value={seawaterResult.intrusionDegree} accent={seawaterResult.intrusionDegree.includes('严重') ? 'red' : 'cyan'} />
              <StatCard title="综合评分" value={seawaterResult.overallScore} accent="orange" />
              <StatCard title="风险等级" value={seawaterResult.riskLevel} accent={seawaterResult.riskLevel === '极高' || seawaterResult.riskLevel === '高' ? 'red' : 'cyan'} />
            </div>
            <FilterableTechTable
              headers={['指标', '值', '评分', '权重', '判定']}
              rows={seawaterResult.details.map(d => [d.indicator, d.value, d.score, d.weight, d.assessment])}
            />
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-gw-text">管控建议</p>
              {seawaterResult.recommendations.map((r, i) => (
                <p key={i} className="text-[10px] text-gw-muted">• {r}</p>
              ))}
            </div>
          </div>
        </div>
      </TechCard>
  );
}
