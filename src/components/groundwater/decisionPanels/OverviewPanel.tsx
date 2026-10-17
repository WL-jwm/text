/**
 * 拆分自 DecisionSupportTab.tsx
 */

import { ClipboardList, Droplets, TrendingDown, Shield, AlertTriangle, Award } from 'lucide-react';
import { TechCard } from '../../UI';
import { ProgressBar } from '../decisionSupportUI';
import { satisfactionColor, WARNING_COLORS, WARNING_GRADIENTS } from '../decisionSupportConstants';
import type { AllocationResult, ReductionResult, EcoLevelResult, WarningResult, DecisionResult } from '../../../utils/decisionSupportCalculator';

export function OverviewPanel({ allocationResult, reductionResult, ecoResult, warningResult, decisionResult }: { allocationResult: AllocationResult; reductionResult: ReductionResult; ecoResult: EcoLevelResult; warningResult: WarningResult; decisionResult: DecisionResult }) {
  return (
    <>
    {/* ═══ 概览面板 ═══ */}
    <TechCard title="地下水管理决策支持器" badge="B-32" icon={ClipboardList}>
      <p className="text-[11px] text-gw-muted mb-3">
        集成水资源配置优化、压采方案评估、生态水位保障、风险预警决策和综合方案评价，为地下水管理提供量化决策支持。
      </p>
      <div className="grid grid-cols-5 gap-2">
        <div className="p-2.5 rounded-xl bg-blue-500/8 border border-blue-500/15">
          <div className="flex items-center gap-1.5 mb-1">
            <Droplets className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[10px] text-gw-muted">配置满足率</span>
          </div>
          <p className="text-lg font-bold text-blue-400">{allocationResult.overallSatisfaction}%</p>
          <div className="mt-1.5"><ProgressBar value={allocationResult.overallSatisfaction} max={100} color={satisfactionColor(allocationResult.overallSatisfaction)} /></div>
        </div>
        <div className="p-2.5 rounded-xl bg-orange-500/8 border border-orange-500/15">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingDown className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-[10px] text-gw-muted">压采总量</span>
          </div>
          <p className="text-lg font-bold text-orange-400">{reductionResult.totalReduction}<span className="text-[10px] text-gw-muted ml-0.5">万m³</span></p>
          <p className="text-[10px] text-gw-muted mt-0.5">压采率 {reductionResult.totalReductionRate}%</p>
        </div>
        <div className="p-2.5 rounded-xl bg-green-500/8 border border-green-500/15">
          <div className="flex items-center gap-1.5 mb-1">
            <Shield className="w-3.5 h-3.5 text-green-400" />
            <span className="text-[10px] text-gw-muted">生态保障</span>
          </div>
          <p className="text-lg font-bold text-green-400">{ecoResult.overallScore}<span className="text-[10px] text-gw-muted ml-0.5">/100</span></p>
          <div className="mt-1.5"><ProgressBar value={ecoResult.overallScore} max={100} color="#10b981" /></div>
        </div>
        <div className="p-2.5 rounded-xl border-2 relative overflow-hidden" style={{
          background: `linear-gradient(135deg, ${WARNING_GRADIENTS[warningResult.overallWarning]?.[0] ?? '#1e293b'} 0%, ${WARNING_GRADIENTS[warningResult.overallWarning]?.[1] ?? '#0f172a'} 100%)`,
          borderColor: `${WARNING_COLORS[warningResult.overallWarning]}40`,
        }}>
          <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: WARNING_COLORS[warningResult.overallWarning] }} />
          <div className="flex items-center gap-1.5 mb-1">
            <AlertTriangle className="w-3.5 h-3.5" style={{ color: WARNING_COLORS[warningResult.overallWarning] }} />
            <span className="text-[10px] text-gw-muted">预警等级</span>
          </div>
          <p className="text-lg font-bold" style={{ color: WARNING_COLORS[warningResult.overallWarning] }}>{warningResult.overallWarning}</p>
          <p className="text-[10px] text-gw-muted mt-0.5">{warningResult.warningSignal.slice(0, 12)}…</p>
        </div>
        <div className="p-2.5 rounded-xl bg-purple-500/8 border border-purple-500/15">
          <div className="flex items-center gap-1.5 mb-1">
            <Award className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[10px] text-gw-muted">最优方案</span>
          </div>
          <p className="text-sm font-bold text-purple-400 truncate">{decisionResult.bestOption.split(':')[0]}</p>
          <p className="text-[10px] text-gw-muted mt-0.5">评分 {decisionResult.rankedOptions[0]?.totalScore ?? 0}</p>
        </div>
      </div>
    </TechCard>
    
    </>
  );
}
