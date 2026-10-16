import { calcSubsidenceRisk } from '../../../utils/riskAssessmentCalculator';

/**
 * 面板: SubsidencePanel（拆分自 RiskAssessmentTab.tsx）
 */
import type { SubsidenceRiskInput } from '../../../utils/riskAssessmentCalculator';
import { FilterableTechTable } from '../../FilterableTechTable';
import { TechCard, StatCard } from '../../UI';
import { ArrowDown } from 'lucide-react';

interface SubsidencePanelProps {
  subsidence: SubsidenceRiskInput
  setSubsidence: React.Dispatch<React.SetStateAction<SubsidenceRiskInput>>
  subsidenceResult: ReturnType<typeof calcSubsidenceRisk>;
}
export function SubsidencePanel({ subsidence, setSubsidence, subsidenceResult }: SubsidencePanelProps) {
  return (
      <TechCard title="地面沉降风险评价" badge="沉降" icon={ArrowDown} className="border-blue-500/15">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="block text-[11px] text-gw-muted">压缩层厚度 (m)</label>
            <input type="number" value={subsidence.compressibleLayerThickness} onChange={e => setSubsidence({ ...subsidence, compressibleLayerThickness: +e.target.value })}
              className="w-full px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text" />
            <label className="block text-[11px] text-gw-muted">水位累计降幅 (m)</label>
            <input type="number" value={subsidence.waterLevelDecline} onChange={e => setSubsidence({ ...subsidence, waterLevelDecline: +e.target.value })}
              className="w-full px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text" />
            <label className="block text-[11px] text-gw-muted">压缩层类型</label>
            <select value={subsidence.layerType} onChange={e => setSubsidence({ ...subsidence, layerType: e.target.value as SubsidenceRiskInput['layerType'] })}
              className="w-full px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text">
              <option value="黏土">黏土</option><option value="粉质黏土">粉质黏土</option><option value="粉土">粉土</option><option value="砂">砂</option>
            </select>
            <label className="block text-[11px] text-gw-muted">地层结构</label>
            <select value={subsidence.structure} onChange={e => setSubsidence({ ...subsidence, structure: e.target.value as SubsidenceRiskInput['structure'] })}
              className="w-full px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text">
              <option value="单层">单层</option><option value="多层互层">多层互层</option><option value="厚层黏土">厚层黏土</option>
            </select>
            <label className="block text-[11px] text-gw-muted">历史累计沉降量 (mm)</label>
            <input type="number" value={subsidence.historicalSubsidence} onChange={e => setSubsidence({ ...subsidence, historicalSubsidence: +e.target.value })}
              className="w-full px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text" />
            <label className="block text-[11px] text-gw-muted">当前沉降速率 (mm/yr)</label>
            <input type="number" value={subsidence.currentRate} onChange={e => setSubsidence({ ...subsidence, currentRate: +e.target.value })}
              className="w-full px-2 py-1.5 rounded bg-gw-surface border border-gw-border/30 text-xs text-gw-text" />
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <StatCard title="预测沉降量" value={subsidenceResult.predictedSubsidence} unit="mm" accent="blue" />
              <StatCard title="综合评分" value={subsidenceResult.overallScore} accent="orange" />
              <StatCard title="风险等级" value={subsidenceResult.riskLevel} accent={subsidenceResult.riskLevel === '极高' || subsidenceResult.riskLevel === '高' ? 'red' : 'blue'} />
            </div>
            <FilterableTechTable
              headers={['指标', '值', '评分', '判定']}
              rows={subsidenceResult.details.map(d => [d.indicator, d.value, d.score, d.assessment])}
            />
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-gw-text">管控建议</p>
              {subsidenceResult.recommendations.map((r, i) => (
                <p key={i} className="text-[10px] text-gw-muted">• {r}</p>
              ))}
            </div>
          </div>
        </div>
      </TechCard>
  );
}
