/**
 * 拆分自 decisionSupportAlgorithms.ts — 生态水位保障
 */

import type { EcoLevelInput, EcoLevelResult } from '../decisionSupportTypes';
import { clamp } from './shared';

export function calcEcoLevel(input: EcoLevelInput): EcoLevelResult {
  const complianceRate = input.monitoringWells > 0 ? (input.compliantWells / input.monitoringWells) * 100 : 0;
  const depthGap = input.currentDepth - input.targetDepth;
  const rechargeExtractionRatio = input.annualExtraction > 0 ? input.annualRecharge / input.annualExtraction : 0;

  // 达标率评分(0-100)
  const complianceScore = clamp(complianceRate);

  // 水位差距评分
  let depthScore: number;
  if (depthGap <= 0) depthScore = 100;
  else if (depthGap < 1) depthScore = 80;
  else if (depthGap < 3) depthScore = 60;
  else if (depthGap < 5) depthScore = 40;
  else depthScore = 20;

  // 补采比评分
  let ratioScore: number;
  if (rechargeExtractionRatio >= 1.0) ratioScore = 90;
  else if (rechargeExtractionRatio >= 0.7) ratioScore = 70;
  else if (rechargeExtractionRatio >= 0.5) ratioScore = 50;
  else ratioScore = 30;

  // 预测达标年限（假设每年水位恢复速率）
  const annualRecoveryRate = depthGap > 0 && rechargeExtractionRatio > 0
    ? Math.max(0.1, (rechargeExtractionRatio - 0.5) * 2)
    : 0;
  const estimatedYears = depthGap > 0 && annualRecoveryRate > 0
    ? Math.ceil(depthGap / annualRecoveryRate)
    : 0;

  // 深层水加权
  const deepFactor = input.aquiferType === '深层' ? 0.85 : 1.0;

  const measureScore = clamp((complianceScore * 0.35 + depthScore * 0.35 + ratioScore * 0.30) * deepFactor);
  const overallScore = measureScore;

  let level: string;
  if (overallScore >= 80) level = '优 — 生态水位保障良好';
  else if (overallScore >= 60) level = '良 — 基本满足生态水位需求';
  else if (overallScore >= 40) level = '中 — 需加强回补和压采';
  else level = '差 — 生态水位严重不足';

  const measures: { measure: string; priority: string; effect: string; timeline: string }[] = [];
  if (complianceRate < 80) {
    measures.push({ measure: '加密生态水位监测网络', priority: '高', effect: '提高达标率监控精度', timeline: '1年内' });
  }
  if (depthGap > 2) {
    measures.push({ measure: '增加生态补水水源', priority: '高', effect: `每年回补${Math.ceil(depthGap * 0.5 * 100)}万m³`, timeline: '2-3年' });
  }
  if (rechargeExtractionRatio < 0.7) {
    measures.push({ measure: '压减该区域开采量', priority: '高', effect: `年压采${Math.ceil((0.8 - rechargeExtractionRatio) * input.annualExtraction)}万m³`, timeline: '1-2年' });
  }
  if (input.aquiferType === '深层') {
    measures.push({ measure: '深层水回灌试验', priority: '中', effect: '探索深层水恢复路径', timeline: '3-5年' });
  }
  measures.push({ measure: '建立生态水位预警机制', priority: '中', effect: '及时发现水位异常', timeline: '1年内' });

  const details = [
    { indicator: '监测井达标率', value: `${complianceRate.toFixed(1)}% (${input.compliantWells}/${input.monitoringWells})`, score: +complianceScore.toFixed(0), assessment: complianceRate >= 80 ? '达标良好' : '需提升' },
    { indicator: '水位差距', value: `${depthGap.toFixed(1)} m (当前${input.currentDepth} → 目标${input.targetDepth})`, score: depthScore, assessment: depthGap <= 0 ? '已达标' : depthGap < 3 ? '差距较小' : '差距较大' },
    { indicator: '回补-开采比', value: `${rechargeExtractionRatio.toFixed(2)} (回补${input.annualRecharge}/开采${input.annualExtraction})`, score: ratioScore, assessment: rechargeExtractionRatio >= 1 ? '正平衡' : '负平衡' },
    { indicator: '预测达标年限', value: estimatedYears > 0 ? `${estimatedYears}年` : '已达标', score: estimatedYears > 5 ? 30 : estimatedYears > 3 ? 60 : 90, assessment: estimatedYears > 5 ? '恢复缓慢' : '恢复可期' },
  ];

  return {
    complianceRate: +complianceRate.toFixed(1),
    depthGap: +depthGap.toFixed(1),
    rechargeExtractionRatio: +rechargeExtractionRatio.toFixed(3),
    estimatedYears,
    measureScore: +measureScore.toFixed(0),
    overallScore: +overallScore.toFixed(0),
    level,
    measures,
    details,
  };
}
