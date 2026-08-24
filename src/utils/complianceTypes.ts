/**
 * 环保合规检查 — 类型定义
 */

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

