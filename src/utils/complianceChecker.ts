/**
 * 法规标准合规检查器 (B-40)
 * 
 * 地下水相关法规标准合规性自动检查:
 * 1. 水质标准合规 (GB/T 14848-2017)
 * 2. 取水许可合规
 * 3. 环境影响评价合规
 * 4. 水源地保护区合规
 * 5. 地下水污染防治合规
 * 6. 超采区管理合规
 */

// ============================================================
// 类型定义
// ============================================================

export interface WaterQualityCheck {
  /** 因子名称 */
  factor: string;
  /** 检测值 */
  value: number;
  /** 标准限值 */
  limit: number;
  /** 单位 */
  unit: string;
  /** 水质类别 */
  qualityClass: 'I' | 'II' | 'III' | 'IV' | 'V';
  /** 超标倍数 */
  exceedanceRatio: number;
  /** 是否合规 */
  compliant: boolean;
  /** 适用的功能区类别 */
  applicableClass: string;
  /** 判定说明 */
  note: string;
}

export interface ComplianceResult {
  waterQuality: {
    checked: number;
    compliant: number;
    nonCompliant: number;
    details: WaterQualityCheck[];
    overallCompliance: number;
    qualityGrade: string;
  };
  extractionPermit: {
    approvedVolume: number;
    actualVolume: number;
    utilizationRate: number;
    compliant: boolean;
    issues: string[];
  };
  eiaCompliance: {
    hasEIA: boolean;
    eiaApproved: boolean;
    monitoringPlan: boolean;
    emergencyPlan: boolean;
    completionAcceptance: boolean;
    score: number;
    issues: string[];
  };
  sourceProtection: {
    zone1Compliant: boolean;
    zone2Compliant: boolean;
    zone3Compliant: boolean;
    issues: string[];
    score: number;
  };
  pollutionControl: {
    sourceInvestigation: boolean;
    riskAssessment: boolean;
    remediationPlan: boolean;
    monitoringNetwork: boolean;
    issues: string[];
    score: number;
  };
  overdraftManagement: {
    inOverdraftArea: boolean;
    reductionPlan: boolean;
    alternativeWaterSource: boolean;
    issues: string[];
    score: number;
  };
  totalScore: number;
  complianceLevel: string;
  summary: { category: string; score: number; status: string; color: string }[];
  recommendations: string[];
}

// ============================================================
// GB/T 14848-2017 地下水质量标准
// ============================================================

export interface QualityStandard {
  factor: string;
  unit: string;
  I: number;
  II: number;
  III: number;
  IV: number;
  V: number;
}

export const GB14848_STANDARDS: QualityStandard[] = [
  { factor: 'pH', unit: '', I: 6.5, II: 6.5, III: 6.5, IV: 5.5, V: 5.5 },
  { factor: '氨氮(NH₃-N)', unit: 'mg/L', I: 0.02, II: 0.10, III: 0.50, IV: 1.50, V: 1.50 },
  { factor: '硝酸盐(以N计)', unit: 'mg/L', I: 2.0, II: 5.0, III: 20.0, IV: 30.0, V: 30.0 },
  { factor: '亚硝酸盐(以N计)', unit: 'mg/L', I: 0.001, II: 0.01, III: 0.02, IV: 0.10, V: 0.10 },
  { factor: '总硬度(以CaCO₃计)', unit: 'mg/L', I: 150, II: 300, III: 450, IV: 650, V: 650 },
  { factor: '溶解性总固体', unit: 'mg/L', I: 300, II: 500, III: 1000, IV: 2000, V: 2000 },
  { factor: '硫酸盐', unit: 'mg/L', I: 50, II: 150, III: 250, IV: 350, V: 350 },
  { factor: '氯化物', unit: 'mg/L', I: 50, II: 150, III: 250, IV: 350, V: 350 },
  { factor: '铁', unit: 'mg/L', I: 0.1, II: 0.2, III: 0.3, IV: 2.0, V: 2.0 },
  { factor: '锰', unit: 'mg/L', I: 0.05, II: 0.05, III: 0.10, IV: 1.0, V: 1.0 },
  { factor: '铜', unit: 'mg/L', I: 0.01, II: 0.05, III: 0.10, IV: 1.0, V: 1.0 },
  { factor: '锌', unit: 'mg/L', I: 0.05, II: 0.5, III: 1.0, IV: 5.0, V: 5.0 },
  { factor: '铝', unit: 'mg/L', I: 0.01, II: 0.05, III: 0.10, IV: 0.50, V: 0.50 },
  { factor: '挥发性酚类', unit: 'mg/L', I: 0.001, II: 0.001, III: 0.002, IV: 0.01, V: 0.01 },
  { factor: '高锰酸盐指数', unit: 'mg/L', I: 1.0, II: 2.0, III: 3.0, IV: 10.0, V: 10.0 },
  { factor: '氟化物', unit: 'mg/L', I: 1.0, II: 1.0, III: 1.0, IV: 2.0, V: 2.0 },
  { factor: '砷', unit: 'mg/L', I: 0.001, II: 0.001, III: 0.01, IV: 0.05, V: 0.05 },
  { factor: '镉', unit: 'mg/L', I: 0.001, II: 0.001, III: 0.005, IV: 0.01, V: 0.01 },
  { factor: '铬(六价)', unit: 'mg/L', I: 0.005, II: 0.01, III: 0.05, IV: 0.10, V: 0.10 },
  { factor: '铅', unit: 'mg/L', I: 0.005, II: 0.005, III: 0.01, IV: 0.10, V: 0.10 },
  { factor: '汞', unit: 'mg/L', I: 0.0001, II: 0.0001, III: 0.001, IV: 0.001, V: 0.001 },
  { factor: '硒', unit: 'mg/L', I: 0.01, II: 0.01, III: 0.01, IV: 0.1, V: 0.1 },
  { factor: '氰化物', unit: 'mg/L', I: 0.001, II: 0.01, III: 0.05, IV: 0.10, V: 0.10 },
];

// ============================================================
// 法规清单
// ============================================================

export interface Regulation {
  id: string;
  name: string;
  level: '法律' | '行政法规' | '部门规章' | '技术标准' | '地方性法规';
  issuer: string;
  date: string;
  status: '现行' | '已修订' | '已废止';
  keyPoints: string[];
  applicableScenarios: string[];
}

export const REGULATIONS: Regulation[] = [
  {
    id: 'water_law',
    name: '中华人民共和国水法',
    level: '法律',
    issuer: '全国人大常委会',
    date: '2002-10-01(2016修订)',
    status: '现行',
    keyPoints: ['取水许可制度', '水资源费征收', '超采区管制', '地下水保护规划'],
    applicableScenarios: ['取水许可申请', '水资源论证', '超采区管理'],
  },
  {
    id: 'water_pollution_law',
    name: '中华人民共和国水污染防治法',
    level: '法律',
    issuer: '全国人大常委会',
    date: '2018-01-01',
    status: '现行',
    keyPoints: ['地下水污染防治', '水源地保护区', '渗井渗坑禁止', '地下工程防渗'],
    applicableScenarios: ['地下水污染调查', '水源地保护', '工业场地防渗'],
  },
  {
    id: 'eia_law',
    name: '中华人民共和国环境影响评价法',
    level: '法律',
    issuer: '全国人大常委会',
    date: '2018-12-29修订',
    status: '现行',
    keyPoints: ['建设项目环评', '规划环评', '地下水专项评价', '后评价制度'],
    applicableScenarios: ['建设项目环评', '地下水环境影响评价'],
  },
  {
    id: 'gb14848',
    name: 'GB/T 14848-2017 地下水质量标准',
    level: '技术标准',
    issuer: '国家质检总局/国家标准委',
    date: '2018-05-01',
    status: '现行',
    keyPoints: ['五类水质标准', '39项常规指标', '54项非常规指标', '单因子评价法'],
    applicableScenarios: ['水质监测', '水源地评价', '污染评价'],
  },
  {
    id: 'hj253',
    name: 'HJ 25.1-2019 建设用地土壤污染状况调查技术导则',
    level: '技术标准',
    issuer: '生态环境部',
    date: '2019-12-31',
    status: '现行',
    keyPoints: ['地下水调查要求', '采样布点', '风险评估'],
    applicableScenarios: ['污染场地调查', '地下水风险评估'],
  },
  {
    id: 'hj610',
    name: 'HJ 610-2016 环境影响评价技术导则 地下水环境',
    level: '技术标准',
    issuer: '生态环境部',
    date: '2016-07-01',
    status: '现行',
    keyPoints: ['评价分级', '调查范围', '预测方法', '防渗措施'],
    applicableScenarios: ['地下水环评', '防渗设计'],
  },
  {
    id: 'source_protection',
    name: '饮用水水源保护区划分技术规范',
    level: '技术标准',
    issuer: '生态环境部',
    date: '2018-03-01',
    status: '现行',
    keyPoints: ['一级保护区', '二级保护区', '准保护区', '经验公式法/数值模拟法'],
    applicableScenarios: ['水源地划分', '保护区管理'],
  },
  {
    id: 'overdraft_control',
    name: '地下水管理条例',
    level: '行政法规',
    issuer: '国务院',
    date: '2021-12-01',
    status: '现行',
    keyPoints: ['超采治理', '取水总量控制', '水位控制', '禁采限采区划定'],
    applicableScenarios: ['超采区治理', '取水管理', '水位管控'],
  },
  {
    id: 'hebei_water',
    name: '河北省地下水管理条例',
    level: '地方性法规',
    issuer: '河北省人大常委会',
    date: '2014-09-01(2021修订)',
    status: '现行',
    keyPoints: ['超采区划分', '取水许可', '水位预警', '回补工程'],
    applicableScenarios: ['河北省地下水管理', '超采综合治理'],
  },
  {
    id: 'hebei_source',
    name: '河北省饮用水水源地保护条例',
    level: '地方性法规',
    issuer: '河北省人大常委会',
    date: '2016-01-01',
    status: '现行',
    keyPoints: ['保护区划定', '污染源整治', '应急水源', '监测预警'],
    applicableScenarios: ['河北省水源地保护', '保护区管理'],
  },
];

// ============================================================
// 检查函数
// ============================================================

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

export interface CompliancePreset {
  id: string;
  name: string;
  description: string;
  scenario: string;
  input: {
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
  };
}

export const COMPLIANCE_PRESETS: CompliancePreset[] = [
  {
    id: 'drinking_source',
    name: '集中式饮用水水源地',
    description: '某县级集中式地下水饮用水水源地合规检查',
    scenario: '水源地保护',
    input: {
      waterQualityData: [
        { factor: 'pH', value: 7.2 }, { factor: '氨氮(NH₃-N)', value: 0.08 },
        { factor: '硝酸盐(以N计)', value: 8.5 }, { factor: '总硬度(以CaCO₃计)', value: 380 },
        { factor: '溶解性总固体', value: 620 }, { factor: '硫酸盐', value: 120 },
        { factor: '氯化物', value: 85 }, { factor: '铁', value: 0.15 },
        { factor: '氟化物', value: 0.8 }, { factor: '砷', value: 0.005 },
        { factor: '高锰酸盐指数', value: 2.1 }, { factor: '汞', value: 0.0002 },
      ],
      targetWaterClass: 'III',
      approvedExtraction: 500, actualExtraction: 480,
      hasEIA: true, eiaApproved: true, hasMonitoringPlan: true,
      hasEmergencyPlan: true, hasCompletionAcceptance: true,
      zone1Protected: true, zone2Protected: true, zone3Protected: false,
      hasSourceInvestigation: true, hasRiskAssessment: true,
      hasRemediationPlan: false, hasMonitoringNetwork: true,
      inOverdraftArea: false, hasReductionPlan: false, hasAlternativeSource: true,
    },
  },
  {
    id: 'industrial_site',
    name: '工业场地地下水',
    description: '某化工企业场地地下水污染防治合规检查',
    scenario: '污染防治',
    input: {
      waterQualityData: [
        { factor: 'pH', value: 6.8 }, { factor: '氨氮(NH₃-N)', value: 0.35 },
        { factor: '硝酸盐(以N计)', value: 15.2 }, { factor: '总硬度(以CaCO₃计)', value: 520 },
        { factor: '溶解性总固体', value: 1100 }, { factor: '硫酸盐', value: 280 },
        { factor: '氯化物', value: 310 }, { factor: '铁', value: 0.8 },
        { factor: '锰', value: 0.35 }, { factor: '挥发性酚类', value: 0.003 },
        { factor: '高锰酸盐指数', value: 4.5 }, { factor: '铬(六价)', value: 0.08 },
      ],
      targetWaterClass: 'IV',
      approvedExtraction: 100, actualExtraction: 95,
      hasEIA: true, eiaApproved: true, hasMonitoringPlan: true,
      hasEmergencyPlan: false, hasCompletionAcceptance: true,
      zone1Protected: false, zone2Protected: false, zone3Protected: false,
      hasSourceInvestigation: true, hasRiskAssessment: true,
      hasRemediationPlan: true, hasMonitoringNetwork: true,
      inOverdraftArea: true, hasReductionPlan: false, hasAlternativeSource: false,
    },
  },
  {
    id: 'overdraft_area',
    name: '超采区水源井',
    description: '河北平原超采区农业灌溉井合规检查',
    scenario: '超采管理',
    input: {
      waterQualityData: [
        { factor: 'pH', value: 7.5 }, { factor: '氨氮(NH₃-N)', value: 0.15 },
        { factor: '硝酸盐(以N计)', value: 25.0 }, { factor: '总硬度(以CaCO₃计)', value: 480 },
        { factor: '溶解性总固体', value: 1200 }, { factor: '硫酸盐', value: 200 },
        { factor: '氯化物', value: 260 }, { factor: '氟化物', value: 1.2 },
        { factor: '高锰酸盐指数', value: 3.2 }, { factor: '铁', value: 0.25 },
      ],
      targetWaterClass: 'III',
      approvedExtraction: 80, actualExtraction: 120,
      hasEIA: false, eiaApproved: false, hasMonitoringPlan: false,
      hasEmergencyPlan: false, hasCompletionAcceptance: false,
      zone1Protected: false, zone2Protected: false, zone3Protected: false,
      hasSourceInvestigation: false, hasRiskAssessment: false,
      hasRemediationPlan: false, hasMonitoringNetwork: false,
      inOverdraftArea: true, hasReductionPlan: false, hasAlternativeSource: false,
    },
  },
];
