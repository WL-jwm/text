/**
 * B-31 地下水风险评估 — 模块5 综合风险评价(AHP)
 */

import type { ComprehensiveRiskInput, ComprehensiveRiskResult } from './riskTypes';
import { scoreToLevel, RISK_SCORES } from './riskBase';

const AHP_WEIGHTS = {
  pollution: 0.30,
  overexploitation: 0.35,
  subsidence: 0.20,
  seawater: 0.15,
};


export function calcComprehensiveRisk(input: ComprehensiveRiskInput): ComprehensiveRiskResult {
  const items = [
    { riskType: '污染风险', level: input.pollutionRisk, score: RISK_SCORES[input.pollutionRisk], weight: AHP_WEIGHTS.pollution },
    { riskType: '超采风险', level: input.overexploitationRisk, score: RISK_SCORES[input.overexploitationRisk], weight: AHP_WEIGHTS.overexploitation },
    { riskType: '沉降风险', level: input.subsidenceRisk, score: RISK_SCORES[input.subsidenceRisk], weight: AHP_WEIGHTS.subsidence },
    { riskType: '海水入侵', level: input.seawaterIntrusionRisk, score: RISK_SCORES[input.seawaterIntrusionRisk], weight: AHP_WEIGHTS.seawater },
  ];

  const overallScore = items.reduce((s, item) => s + item.score * item.weight, 0);
  const overallLevel = scoreToLevel(overallScore);

  const maxScore = Math.max(...items.map(i => i.score));
  const riskContributions = items.map(item => ({
    ...item,
    contribution: +(item.score * item.weight).toFixed(2),
    barWidth: +(item.score / maxScore * 100).toFixed(0),
  }));

  // 风险矩阵判定
  let matrixLevel: string;
  if (overallScore >= 4.0) matrixLevel = '极高风险 — 需立即启动应急预案';
  else if (overallScore >= 3.0) matrixLevel = '高风险 — 需制定专项治理方案';
  else if (overallScore >= 2.0) matrixLevel = '中等风险 — 需加强监测与管理';
  else matrixLevel = '低风险 — 常规管理即可';

  // 优先管控顺序
  const priorityOrder = [...items].sort((a, b) => b.score - a.score).map(i => i.riskType);

  const recommendations: string[] = [];
  if (overallScore >= 3.5) recommendations.push('综合风险高，建议成立专项治理领导小组，编制综合治理方案');
  if (items[1].score >= 4) recommendations.push('超采风险最为突出，压采是首要任务');
  if (items[0].score >= 4 && items[1].score >= 4) recommendations.push('污染与超采叠加，需协同治理');
  if (items[3].score >= 4) recommendations.push('海水入侵风险高，需建设阻水屏障并控制沿海开采');
  if (items[2].score >= 4) recommendations.push('沉降风险高，需结合InSAR监测建立预警系统');
  if (recommendations.length === 0) recommendations.push('综合风险可控，维持现有管理措施并定期复评');

  return {
    overallScore: +overallScore.toFixed(2),
    overallLevel,
    riskContributions,
    matrixLevel,
    priorityOrder,
    recommendations,
  };
}

// ═══════════════════════════════════════════════════════════════
// 预设评价区域
// ═══════════════════════════════════════════════════════════════

