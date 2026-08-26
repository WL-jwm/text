/**
 * 污染预警引擎 — 演示样本
 */

import type { SampleAlertResult, AlertThresholds } from './pollutionAlertTypes';
import { calcSampleAlert } from './pollutionAlertAlgorithms';

export const DEMO_SAMPLES: Array<{ name: string; factors: Array<{ name: string; value: number; standardIII: number; unit: string; type: string }> }> = [
  {
    name: '沧州-深层承压水-01',
    factors: [
      { name: '氟化物', value: 2.8, standardIII: 1.0, unit: 'mg/L', type: '毒理指标' },
      { name: '总硬度(CaCO₃)', value: 680, standardIII: 450, unit: 'mg/L', type: '一般化学指标' },
      { name: '溶解性总固体(TDS)', value: 2100, standardIII: 1000, unit: 'mg/L', type: '一般化学指标' },
      { name: '硝酸盐(NO₃⁻-N)', value: 8.5, standardIII: 20, unit: 'mg/L', type: '毒理指标' },
      { name: '氯化物(Cl⁻)', value: 380, standardIII: 250, unit: 'mg/L', type: '一般化学指标' },
      { name: '硫酸盐(SO₄²⁻)', value: 120, standardIII: 250, unit: 'mg/L', type: '一般化学指标' },
    ],
  },
  {
    name: '石家庄-浅层孔隙水-02',
    factors: [
      { name: '氟化物', value: 0.5, standardIII: 1.0, unit: 'mg/L', type: '毒理指标' },
      { name: '总硬度(CaCO₃)', value: 520, standardIII: 450, unit: 'mg/L', type: '一般化学指标' },
      { name: '溶解性总固体(TDS)', value: 850, standardIII: 1000, unit: 'mg/L', type: '一般化学指标' },
      { name: '硝酸盐(NO₃⁻-N)', value: 28, standardIII: 20, unit: 'mg/L', type: '毒理指标' },
      { name: '氨氮(NH₃-N)', value: 0.35, standardIII: 0.50, unit: 'mg/L', type: '一般化学指标' },
      { name: '高锰酸盐指数', value: 2.8, standardIII: 3.0, unit: 'mg/L', type: '一般化学指标' },
    ],
  },
  {
    name: '唐山-浅层水-03',
    factors: [
      { name: '氟化物', value: 0.8, standardIII: 1.0, unit: 'mg/L', type: '毒理指标' },
      { name: '铁(Fe)', value: 0.9, standardIII: 0.3, unit: 'mg/L', type: '一般化学指标' },
      { name: '锰(Mn)', value: 0.35, standardIII: 0.1, unit: 'mg/L', type: '一般化学指标' },
      { name: '氨氮(NH₃-N)', value: 0.65, standardIII: 0.50, unit: 'mg/L', type: '一般化学指标' },
      { name: '总硬度(CaCO₃)', value: 380, standardIII: 450, unit: 'mg/L', type: '一般化学指标' },
      { name: '溶解性总固体(TDS)', value: 720, standardIII: 1000, unit: 'mg/L', type: '一般化学指标' },
    ],
  },
  {
    name: '承德-基岩裂隙水-04',
    factors: [
      { name: '氟化物', value: 0.2, standardIII: 1.0, unit: 'mg/L', type: '毒理指标' },
      { name: '总硬度(CaCO₃)', value: 180, standardIII: 450, unit: 'mg/L', type: '一般化学指标' },
      { name: '溶解性总固体(TDS)', value: 320, standardIII: 1000, unit: 'mg/L', type: '一般化学指标' },
      { name: '硝酸盐(NO₃⁻-N)', value: 5.2, standardIII: 20, unit: 'mg/L', type: '毒理指标' },
      { name: '硫酸盐(SO₄²⁻)', value: 45, standardIII: 250, unit: 'mg/L', type: '一般化学指标' },
      { name: '氯化物(Cl⁻)', value: 32, standardIII: 250, unit: 'mg/L', type: '一般化学指标' },
    ],
  },
  {
    name: '衡水-深层承压水-05',
    factors: [
      { name: '氟化物', value: 3.5, standardIII: 1.0, unit: 'mg/L', type: '毒理指标' },
      { name: '总硬度(CaCO₃)', value: 950, standardIII: 450, unit: 'mg/L', type: '一般化学指标' },
      { name: '溶解性总固体(TDS)', value: 3200, standardIII: 1000, unit: 'mg/L', type: '一般化学指标' },
      { name: '氯化物(Cl⁻)', value: 520, standardIII: 250, unit: 'mg/L', type: '一般化学指标' },
      { name: '硫酸盐(SO₄²⁻)', value: 310, standardIII: 250, unit: 'mg/L', type: '一般化学指标' },
      { name: '硝酸盐(NO₃⁻-N)', value: 4.0, standardIII: 20, unit: 'mg/L', type: '毒理指标' },
    ],
  },
];

/**
 * 生成演示预警结果
 */

export function getDemoAlertResults(thresholds?: AlertThresholds): SampleAlertResult[] {
  return DEMO_SAMPLES.map(s => calcSampleAlert(s.name, s.factors, thresholds));
}

