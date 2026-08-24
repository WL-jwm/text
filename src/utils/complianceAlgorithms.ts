/**
 * 环保合规检查 — 核心算法
 *  水质检查 / 综合合规计算(水质/取水许可/环评/水源地/防治/超采)
 */

import type { WaterQualityCheck, ComplianceResult } from './complianceTypes';
import { GB14848_STANDARDS } from './complianceStandards';

export function checkWaterQuality(
  factors: { factor: string; value: number }[],
  targetClass: 'I' | 'II' | 'III' | 'IV' | 'V' = 'III',
): WaterQualityCheck[] {
  return factors.map(f => {
    const standard = GB14848_STANDARDS.find(s => s.factor === f.factor);
    if (!standard) {
      return {
        factor: f.factor, value: f.value, limit: 0, unit: '',
        qualityClass: 'V', exceedanceRatio: 0, compliant: true,
        applicableClass: targetClass, note: '无对应标准',
      };
    }
    
    // 特殊处理pH
    if (f.factor === 'pH') {
      const lower = targetClass === 'IV' || targetClass === 'V' ? 5.5 : 6.5;
      const upper = targetClass === 'IV' || targetClass === 'V' ? 6.5 : 8.5;
      const compliant = f.value >= lower && f.value <= upper;
      return {
        factor: f.factor, value: f.value, limit: upper, unit: '',
        qualityClass: compliant ? targetClass : (f.value < 5.5 ? 'V' : 'IV'),
        exceedanceRatio: 0, compliant,
        applicableClass: targetClass,
        note: compliant ? `${lower}-${upper}范围内` : `超出${lower}-${upper}范围`,
      };
    }
    
    // 确定水质类别
    let qualityClass: 'I' | 'II' | 'III' | 'IV' | 'V' = 'V';
    const limit = standard[targetClass];
    
    if (f.value <= standard.I) qualityClass = 'I';
    else if (f.value <= standard.II) qualityClass = 'II';
    else if (f.value <= standard.III) qualityClass = 'III';
    else if (f.value <= standard.IV) qualityClass = 'IV';
    else qualityClass = 'V';
    
    const compliant = f.value <= limit;
    const exceedanceRatio = compliant ? 0 : Math.round((f.value / limit - 1) * 1000) / 1000;
    
    return {
      factor: f.factor,
      value: f.value,
      limit,
      unit: standard.unit,
      qualityClass,
      exceedanceRatio,
      compliant,
      applicableClass: targetClass,
      note: compliant ? `达标(${qualityClass}类)` : `超标${exceedanceRatio}倍(${qualityClass}类)`,
    };
  });
}


export function calculateCompliance(input: {
  waterQualityData: { factor: string; value: number }[];
  targetWaterClass: 'I' | 'II' | 'III' | 'IV' | 'V';
  approvedExtraction: number;
  actualExtraction: number;
  hasEIA: boolean;
  eiaApproved: boolean;
  hasMonitoringPlan: boolean;
  hasEmergencyPlan: boolean;
  hasCompletionAcceptance: boolean;
  zone1Protected: boolean;
  zone2Protected: boolean;
  zone3Protected: boolean;
  hasSourceInvestigation: boolean;
  hasRiskAssessment: boolean;
  hasRemediationPlan: boolean;
  hasMonitoringNetwork: boolean;
  inOverdraftArea: boolean;
  hasReductionPlan: boolean;
  hasAlternativeSource: boolean;
}): ComplianceResult {
  // 水质检查
  const wqDetails = checkWaterQuality(input.waterQualityData, input.targetWaterClass);
  const wqCompliant = wqDetails.filter(d => d.compliant).length;
  const wqNonCompliant = wqDetails.length - wqCompliant;
  const overallCompliance = Math.round((wqCompliant / wqDetails.length) * 1000) / 10;
  
  // 水质综合类别 (最差因子决定)
  const worstClass = wqDetails.reduce((worst, d) => {
    const order = ['I', 'II', 'III', 'IV', 'V'];
    return order.indexOf(d.qualityClass) > order.indexOf(worst) ? d.qualityClass : worst;
  }, 'I' as string);
  
  // 取水许可
  const utilizationRate = input.approvedExtraction > 0 ? input.actualExtraction / input.approvedExtraction : 0;
  const extractionIssues: string[] = [];
  if (utilizationRate > 1) extractionIssues.push(`超许可取水: 实际取水量超出批准量${Math.round((utilizationRate - 1) * 100)}%`);
  if (utilizationRate > 0.9 && utilizationRate <= 1) extractionIssues.push('接近许可上限，建议申请增加取水指标');
  
  // 环评合规
  const eiaIssues: string[] = [];
  if (!input.hasEIA) eiaIssues.push('未开展环境影响评价');
  if (input.hasEIA && !input.eiaApproved) eiaIssues.push('环评报告未获批复');
  if (!input.hasMonitoringPlan) eiaIssues.push('缺少地下水监测计划');
  if (!input.hasEmergencyPlan) eiaIssues.push('缺少地下水污染应急预案');
  if (!input.hasCompletionAcceptance) eiaIssues.push('未完成竣工环保验收');
  const eiaScore = [input.hasEIA, input.eiaApproved, input.hasMonitoringPlan, input.hasEmergencyPlan, input.hasCompletionAcceptance]
    .filter(Boolean).length * 20;
  
  // 水源地保护
  const sourceIssues: string[] = [];
  if (!input.zone1Protected) sourceIssues.push('一级保护区存在违规建设项目');
  if (!input.zone2Protected) sourceIssues.push('二级保护区污染源未整治');
  if (!input.zone3Protected) sourceIssues.push('准保护区管理措施不到位');
  const sourceScore = [input.zone1Protected, input.zone2Protected, input.zone3Protected].filter(Boolean).length * 33.3;
  
  // 污染防治
  const pollutionIssues: string[] = [];
  if (!input.hasSourceInvestigation) pollutionIssues.push('未开展地下水污染源调查');
  if (!input.hasRiskAssessment) pollutionIssues.push('未完成地下水环境风险评估');
  if (!input.hasRemediationPlan) pollutionIssues.push('缺少地下水修复治理方案');
  if (!input.hasMonitoringNetwork) pollutionIssues.push('地下水监测网络不完善');
  const pollutionScore = [input.hasSourceInvestigation, input.hasRiskAssessment, input.hasRemediationPlan, input.hasMonitoringNetwork]
    .filter(Boolean).length * 25;
  
  // 超采管理
  const overdraftIssues: string[] = [];
  if (input.inOverdraftArea && !input.hasReductionPlan) overdraftIssues.push('位于超采区但未制定压采方案');
  if (input.inOverdraftArea && !input.hasAlternativeSource) overdraftIssues.push('超采区未落实替代水源');
  const overdraftScore = input.inOverdraftArea 
    ? [input.hasReductionPlan, input.hasAlternativeSource].filter(Boolean).length * 50
    : 100;
  
  // 总分
  const totalScore = Math.round(
    (overallCompliance * 0.25 + 
    (utilizationRate <= 1 ? 100 : Math.max(0, 100 - (utilizationRate - 1) * 100)) * 0.15 +
    eiaScore * 0.20 +
    sourceScore * 0.15 +
    pollutionScore * 0.15 +
    overdraftScore * 0.10)
  );
  
  const complianceLevel = totalScore >= 90 ? '高度合规' :
    totalScore >= 75 ? '合规' :
    totalScore >= 60 ? '基本合规' :
    totalScore >= 40 ? '部分合规' : '不合规';
  
  const summary = [
    { category: '水质达标', score: Math.round(overallCompliance), status: overallCompliance >= 90 ? '达标' : '需关注', color: overallCompliance >= 90 ? '#10b981' : '#f59e0b' },
    { category: '取水许可', score: Math.round(utilizationRate <= 1 ? 100 : Math.max(0, 100 - (utilizationRate - 1) * 100)), status: utilizationRate <= 1 ? '合规' : '超采', color: utilizationRate <= 1 ? '#10b981' : '#ef4444' },
    { category: '环评合规', score: eiaScore, status: eiaScore >= 80 ? '合规' : '不完善', color: eiaScore >= 80 ? '#10b981' : '#f59e0b' },
    { category: '水源地保护', score: Math.round(sourceScore), status: sourceScore >= 90 ? '合规' : '需整改', color: sourceScore >= 90 ? '#10b981' : '#f59e0b' },
    { category: '污染防治', score: pollutionScore, status: pollutionScore >= 75 ? '合规' : '需完善', color: pollutionScore >= 75 ? '#10b981' : '#f59e0b' },
    { category: '超采管理', score: Math.round(overdraftScore), status: overdraftScore >= 75 ? '合规' : '需整改', color: overdraftScore >= 75 ? '#10b981' : '#ef4444' },
  ];
  
  // 建议
  const recommendations: string[] = [];
  if (overallCompliance < 90) {
    const nonCompliant = wqDetails.filter(d => !d.compliant);
    if (nonCompliant.length > 0) {
      recommendations.push(`水质超标因子: ${nonCompliant.map(d => `${d.factor}(${d.note})`).join('、')}，需溯源整治`);
    }
  }
  if (utilizationRate > 1) recommendations.push('立即停止超许可取水行为，申请调整取水许可或实施节水改造');
  if (eiaIssues.length > 0) recommendations.push(`环评问题: ${eiaIssues.join('；')}`);
  if (sourceIssues.length > 0) recommendations.push(`水源地保护: ${sourceIssues.join('；')}`);
  if (pollutionIssues.length > 0) recommendations.push(`污染防治: ${pollutionIssues.join('；')}`);
  if (overdraftIssues.length > 0) recommendations.push(`超采管理: ${overdraftIssues.join('；')}`);
  if (recommendations.length === 0) recommendations.push('各项指标均符合法规标准要求，建议持续保持并定期复查');
  
  return {
    waterQuality: {
      checked: wqDetails.length,
      compliant: wqCompliant,
      nonCompliant: wqNonCompliant,
      details: wqDetails,
      overallCompliance,
      qualityGrade: worstClass,
    },
    extractionPermit: {
      approvedVolume: input.approvedExtraction,
      actualVolume: input.actualExtraction,
      utilizationRate: Math.round(utilizationRate * 100) / 100,
      compliant: utilizationRate <= 1,
      issues: extractionIssues,
    },
    eiaCompliance: { hasEIA: input.hasEIA, eiaApproved: input.eiaApproved, monitoringPlan: input.hasMonitoringPlan, emergencyPlan: input.hasEmergencyPlan, completionAcceptance: input.hasCompletionAcceptance, score: eiaScore, issues: eiaIssues },
    sourceProtection: { zone1Compliant: input.zone1Protected, zone2Compliant: input.zone2Protected, zone3Compliant: input.zone3Protected, issues: sourceIssues, score: Math.round(sourceScore) },
    pollutionControl: { sourceInvestigation: input.hasSourceInvestigation, riskAssessment: input.hasRiskAssessment, remediationPlan: input.hasRemediationPlan, monitoringNetwork: input.hasMonitoringNetwork, issues: pollutionIssues, score: pollutionScore },
    overdraftManagement: { inOverdraftArea: input.inOverdraftArea, reductionPlan: input.hasReductionPlan, alternativeWaterSource: input.hasAlternativeSource, issues: overdraftIssues, score: Math.round(overdraftScore) },
    totalScore,
    complianceLevel,
    summary,
    recommendations,
  };
}

// ============================================================
// 预设合规检查场景
// ============================================================

