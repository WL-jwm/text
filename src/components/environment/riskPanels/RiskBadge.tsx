/**
 * 风险等级徽章（拆分自 RiskAssessmentTab.tsx）
 */
import { RISK_COLORS, type RiskLevel } from './riskAssessmentConstants';

export function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span
      className="px-2 py-0.5 rounded text-[10px] font-semibold"
      style={{ background: `${RISK_COLORS[level]}20`, color: RISK_COLORS[level], border: `1px solid ${RISK_COLORS[level]}40` }}
    >
      {level}
    </span>
  );
}
