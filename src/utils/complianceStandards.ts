/**
 * 环保合规检查 — GB14848 水质标准
 */

import type { QualityStandard } from './complianceTypes';

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

