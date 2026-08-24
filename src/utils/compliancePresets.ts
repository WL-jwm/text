/**
 * 环保合规检查 — 预设场景
 */

import type { CompliancePreset } from './complianceTypes';

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

