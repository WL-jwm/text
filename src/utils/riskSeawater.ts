/**
 * B-31 地下水风险评估 — 模块4 海水入侵风险
 */

import type { SeawaterIntrusionInput, SeawaterIntrusionResult } from './riskTypes';
import { scoreToLevel, clamp } from './riskBase';

export function calcSeawaterIntrusionRisk(input: SeawaterIntrusionInput): SeawaterIntrusionResult {
  // 距离评分(1-5)
  let distanceScore: number;
  if (input.distanceToCoast < 2) distanceScore = 5;
  else if (input.distanceToCoast < 5) distanceScore = 4;
  else if (input.distanceToCoast < 10) distanceScore = 3;
  else if (input.distanceToCoast < 20) distanceScore = 2;
  else distanceScore = 1;

  // Cl⁻浓度及变化趋势评分
  const chlorideChange = input.currentChloride - input.previousChloride;
  const chlorideRatio = input.previousChloride > 0 ? input.currentChloride / input.previousChloride : 1;
  let chlorideScore: number;
  if (input.currentChloride > 500) chlorideScore = 5;
  else if (input.currentChloride > 250) chlorideScore = 4;
  else if (input.currentChloride > 150) chlorideScore = 3;
  else if (input.currentChloride > 100) chlorideScore = 2;
  else chlorideScore = 1;
  // 趋势加权
  if (chlorideRatio > 1.5) chlorideScore = Math.min(5, chlorideScore + 1);
  if (chlorideRatio < 0.8) chlorideScore = Math.max(1, chlorideScore - 1);

  // 水力梯度评分
  const gradient = input.inlandWaterLevel - input.seaLevel;
  let gradientScore: number;
  if (gradient < 0) gradientScore = 5;
  else if (gradient < 1) gradientScore = 4;
  else if (gradient < 3) gradientScore = 3;
  else if (gradient < 5) gradientScore = 2;
  else gradientScore = 1;

  // 侵入程度判定
  let intrusionDegree: string;
  if (input.currentChloride > 500) intrusionDegree = '严重入侵';
  else if (input.currentChloride > 250) intrusionDegree = '中度入侵';
  else if (input.currentChloride > 150) intrusionDegree = '轻度入侵';
  else if (chlorideChange > 20) intrusionDegree = '入侵趋势';
  else intrusionDegree = '未入侵';

  // 综合(距离30% + Cl⁻35% + 水力梯度35%)
  const overallScore = clamp(
    distanceScore * 0.30 + chlorideScore * 0.35 + gradientScore * 0.35,
    1, 5,
  );
  const riskLevel = scoreToLevel(overallScore);

  const details = [
    { indicator: '距海岸距离', value: `${input.distanceToCoast} km`, score: distanceScore, weight: 0.30, assessment: distanceScore >= 4 ? '近海岸高风险区' : '距海较远' },
    { indicator: 'Cl⁻浓度及趋势', value: `${input.currentChloride} mg/L（变化${chlorideChange >= 0 ? '+' : ''}${chlorideChange.toFixed(0)}）`, score: chlorideScore, weight: 0.35, assessment: intrusionDegree },
    { indicator: '水力梯度', value: `内陆-海面差: ${gradient.toFixed(1)} m`, score: gradientScore, weight: 0.35, assessment: gradient < 0 ? '海水倒灌风险' : gradient < 3 ? '驱动力弱' : '向海排泄' },
  ];

  const recommendations: string[] = [];
  if (gradientScore >= 4) recommendations.push('水力梯度不利，内陆水位低于或接近海平面，需控制开采维持水头');
  if (chlorideScore >= 4) recommendations.push('Cl⁻浓度超标且呈上升趋势，建议建设地下阻水帷幕或注水屏障');
  if (distanceScore >= 4 && input.conductivity > 30) recommendations.push('近海岸且含水层渗透性强，建议建立监测预警带');
  if (input.hasInterface) recommendations.push('已存在咸淡水界面，需定期监测界面迁移方向和速率');
  if (recommendations.length === 0) recommendations.push('海水入侵风险低，维持常规Cl⁻监测');

  return {
    distanceScore,
    chlorideScore,
    gradientScore,
    intrusionDegree,
    overallScore: +overallScore.toFixed(2),
    riskLevel,
    details,
    recommendations,
  };
}

// ═══════════════════════════════════════════════════════════════
// 5. 综合风险评价（AHP权重）
// ═══════════════════════════════════════════════════════════════

