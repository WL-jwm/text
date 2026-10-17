/**
 * 拆分自 DecisionSupportTab.tsx
 */

import { Droplets, Activity, Shield } from 'lucide-react';
import { TechCard } from '../../UI';
import { FilterableTechTable } from '../../FilterableTechTable';
import { InputCell, ProgressBar } from '../decisionSupportUI';
import { satisfactionColor } from '../decisionSupportConstants';
import type { EcoLevelInput, EcoLevelResult } from '../../../utils/decisionSupportCalculator';

export function EcoLevelPanel({ ecoInput, onEcoInputChange, ecoResult }: { ecoInput: EcoLevelInput; onEcoInputChange: (v: EcoLevelInput) => void; ecoResult: EcoLevelResult }) {
  return (
    <>
    {/* ═══ Panel 3: 生态水位保障 ═══ */}
    <TechCard title="生态水位保障" badge="生态" icon={Shield} className="border-green-500/15">
      <div className="grid grid-cols-2 gap-4">
        {/* 左侧输入 */}
        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-gw-text mb-1 flex items-center gap-1">
            <Droplets className="w-3.5 h-3.5 text-green-400" /> 水位参数
          </p>
          <div className="grid grid-cols-3 gap-2">
            <InputCell label="阈值埋深" value={ecoInput.thresholdDepth} onChange={v => onEcoInputChange({ ...ecoInput, thresholdDepth: v })} unit="m" />
            <InputCell label="当前埋深" value={ecoInput.currentDepth} onChange={v => onEcoInputChange({ ...ecoInput, currentDepth: v })} unit="m" />
            <InputCell label="目标埋深" value={ecoInput.targetDepth} onChange={v => onEcoInputChange({ ...ecoInput, targetDepth: v })} unit="m" />
          </div>
          <p className="text-[11px] font-semibold text-gw-text mt-2 mb-1 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-green-400" /> 监测与补给
          </p>
          <div className="grid grid-cols-2 gap-2">
            <InputCell label="监测井数" value={ecoInput.monitoringWells} onChange={v => onEcoInputChange({ ...ecoInput, monitoringWells: v })} unit="口" />
            <InputCell label="达标井数" value={ecoInput.compliantWells} onChange={v => onEcoInputChange({ ...ecoInput, compliantWells: v })} unit="口" />
            <InputCell label="年回补量" value={ecoInput.annualRecharge} onChange={v => onEcoInputChange({ ...ecoInput, annualRecharge: v })} unit="万m³" />
            <InputCell label="年开采量" value={ecoInput.annualExtraction} onChange={v => onEcoInputChange({ ...ecoInput, annualExtraction: v })} unit="万m³" />
          </div>
          <div>
            <label className="block text-[10px] text-gw-muted mb-0.5">含水层类型</label>
            <select value={ecoInput.aquiferType} onChange={e => onEcoInputChange({ ...ecoInput, aquiferType: e.target.value as '浅层' | '深层' })}
              className="w-full px-2.5 py-1.5 rounded-lg bg-gw-surface border border-gw-border/30 text-xs text-gw-text focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-colors">
              <option value="浅层">浅层</option>
              <option value="深层">深层</option>
            </select>
          </div>
        </div>
    
        {/* 右侧结果 */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-xl bg-gw-surface/40 border border-gw-border/20">
              <p className="text-[10px] text-gw-muted">达标率</p>
              <p className="text-base font-bold" style={{ color: satisfactionColor(ecoResult.complianceRate) }}>{ecoResult.complianceRate}%</p>
              <div className="mt-1"><ProgressBar value={ecoResult.complianceRate} max={100} color={satisfactionColor(ecoResult.complianceRate)} /></div>
            </div>
            <div className="p-2.5 rounded-xl bg-gw-surface/40 border border-gw-border/20">
              <p className="text-[10px] text-gw-muted">水位差距</p>
              <p className="text-base font-bold" style={{ color: ecoResult.depthGap <= 0 ? '#10b981' : '#ef4444' }}>{ecoResult.depthGap > 0 ? '+' : ''}{ecoResult.depthGap}m</p>
              <p className="text-[9px] text-gw-muted">当前 → 目标</p>
            </div>
            <div className="p-2.5 rounded-xl bg-gw-surface/40 border border-gw-border/20">
              <p className="text-[10px] text-gw-muted">补采比</p>
              <p className="text-base font-bold" style={{ color: ecoResult.rechargeExtractionRatio >= 1 ? '#10b981' : '#ef4444' }}>{ecoResult.rechargeExtractionRatio}</p>
              <p className="text-[9px] text-gw-muted">{ecoResult.rechargeExtractionRatio >= 1 ? '正平衡' : '负平衡'}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-gw-surface/40 border border-gw-border/20">
              <p className="text-[10px] text-gw-muted">预测达标</p>
              <p className="text-base font-bold text-blue-400">{ecoResult.estimatedYears > 0 ? `${ecoResult.estimatedYears}年` : '已达标'}</p>
            </div>
          </div>
    
          <div className="p-2.5 rounded-xl bg-green-500/8 border border-green-500/15">
            <p className="text-[11px] font-semibold text-green-400">{ecoResult.level}</p>
            <p className="text-[10px] text-gw-muted mt-0.5">综合保障评分: {ecoResult.overallScore}/100</p>
          </div>
    
          <FilterableTechTable
            headers={['指标', '值', '评分', '判定']}
            rows={ecoResult.details.map(d => [d.indicator, d.value, d.score, d.assessment])}
          />
    
          <div>
            <p className="text-[11px] font-semibold text-gw-text mb-1">保障措施</p>
            <FilterableTechTable
              headers={['措施', '优先级', '效果', '时间线']}
              rows={ecoResult.measures.map(m => [m.measure, m.priority, m.effect, m.timeline])}
            />
          </div>
        </div>
      </div>
    </TechCard>
    
    </>
  );
}
