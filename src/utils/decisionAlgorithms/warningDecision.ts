/**
 * 拆分自 decisionSupportAlgorithms.ts — 风险预警决策
 */

import type { WarningInput, WarningResult } from '../decisionSupportTypes';
import { WARNING_LEVELS } from '../decisionSupportConstants';
import type { WarningLevel } from '../decisionSupportConstants';

function warningIndex(level: WarningLevel): number {
  return WARNING_LEVELS.indexOf(level);
}
export function calcWarningDecision(input: WarningInput): WarningResult {
  // 水位预警
  let waterLevelWarning: WarningLevel = '蓝色';
  if (input.currentDepth >= input.emergencyThreshold) waterLevelWarning = '红色';
  else if (input.currentDepth >= input.redThreshold) waterLevelWarning = '橙色';
  else if (input.currentDepth >= input.yellowThreshold) waterLevelWarning = '黄色';

  // 水位快速下降升级
  if (input.monthlyChangeRate > 1 && warningIndex(waterLevelWarning) < 2) {
    waterLevelWarning = '橙色';
  } else if (input.monthlyChangeRate > 0.5 && warningIndex(waterLevelWarning) < 1) {
    waterLevelWarning = '黄色';
  }

  // 水质预警（基于Cl⁻）
  let waterQualityWarning: WarningLevel = '蓝色';
  if (input.chloride > 500) waterQualityWarning = '红色';
  else if (input.chloride > 250) waterQualityWarning = '橙色';
  else if (input.chloride > 150) waterQualityWarning = '黄色';

  // Cl⁻快速上升升级
  if (input.chlorideRate > 20 && warningIndex(waterQualityWarning) < 2) {
    waterQualityWarning = '橙色';
  }

  // 超采状态影响
  if (input.extractionStatus === '严重超采') {
    if (warningIndex(waterLevelWarning) < 2) waterLevelWarning = '橙色';
  } else if (input.extractionStatus === '超采') {
    if (warningIndex(waterLevelWarning) < 1) waterLevelWarning = '黄色';
  }

  // 综合预警（取最高级别）
  const overallWarning: WarningLevel = warningIndex(waterLevelWarning) >= warningIndex(waterQualityWarning)
    ? waterLevelWarning
    : waterQualityWarning;

  const warningSignal = overallWarning === '红色'
    ? '紧急预警 — 立即启动应急响应'
    : overallWarning === '橙色'
    ? '高级预警 — 启动专项管控'
    : overallWarning === '黄色'
    ? '中级预警 — 加强监测与管控'
    : '低级预警 — 常规监测';

  // 响应措施矩阵
  const responseMeasures: { level: string; measure: string; responsible: string; timeline: string }[] = [];

  if (overallWarning === '红色') {
    responseMeasures.push(
      { level: '红色', measure: '立即停止区域地下水开采', responsible: '水利局+地方政府', timeline: '24小时内' },
      { level: '红色', measure: '启动应急供水方案', responsible: '住建局+水务公司', timeline: '48小时内' },
      { level: '红色', measure: '上报省级主管部门', responsible: '市水利局', timeline: '12小时内' },
    );
  } else if (overallWarning === '橙色') {
    responseMeasures.push(
      { level: '橙色', measure: '压减区域开采量30%', responsible: '水利局', timeline: '1周内' },
      { level: '橙色', measure: '加密监测频率至每日1次', responsible: '监测中心', timeline: '3天内' },
      { level: '橙色', measure: '编制专项治理方案', responsible: '水利局+技术单位', timeline: '1月内' },
    );
  } else if (overallWarning === '黄色') {
    responseMeasures.push(
      { level: '黄色', measure: '加强开采量核查', responsible: '水利局', timeline: '2周内' },
      { level: '黄色', measure: '监测频率提升至每周2次', responsible: '监测中心', timeline: '1周内' },
      { level: '黄色', measure: '制定压采预备方案', responsible: '水利局', timeline: '1月内' },
    );
  } else {
    responseMeasures.push(
      { level: '蓝色', measure: '维持常规监测', responsible: '监测中心', timeline: '持续' },
      { level: '蓝色', measure: '定期核查取水许可', responsible: '水利局', timeline: '季度' },
    );
  }

  const details = [
    {
      indicator: '水位预警',
      value: `当前${input.currentDepth}m / 警戒${input.yellowThreshold}m / 红色${input.redThreshold}m / 极限${input.emergencyThreshold}m`,
      warning: waterLevelWarning,
      assessment: input.currentDepth >= input.redThreshold ? '超过红色预警线' : input.currentDepth >= input.yellowThreshold ? '超过黄色警戒线' : '在警戒线内',
    },
    {
      indicator: '水位变化趋势',
      value: `${input.monthlyChangeRate} m/月`,
      warning: input.monthlyChangeRate > 1 ? '橙色' : input.monthlyChangeRate > 0.5 ? '黄色' : '蓝色',
      assessment: input.monthlyChangeRate > 1 ? '快速下降' : input.monthlyChangeRate > 0.5 ? '缓慢下降' : '基本稳定',
    },
    {
      indicator: '水质预警(Cl⁻)',
      value: `${input.chloride} mg/L (变化${input.chlorideRate > 0 ? '+' : ''}${input.chlorideRate} mg/L/月)`,
      warning: waterQualityWarning,
      assessment: input.chloride > 250 ? 'Cl⁻超标' : input.chloride > 150 ? 'Cl⁻偏高' : 'Cl⁻正常',
    },
    {
      indicator: '开采状态',
      value: input.extractionStatus,
      warning: input.extractionStatus === '严重超采' ? '橙色' : input.extractionStatus === '超采' ? '黄色' : '蓝色',
      assessment: input.extractionStatus === '严重超采' ? '需紧急压采' : input.extractionStatus === '超采' ? '需压采' : '正常',
    },
  ];

  return {
    waterLevelWarning,
    waterQualityWarning,
    overallWarning,
    warningSignal,
    responseMeasures,
    details,
  };
}
