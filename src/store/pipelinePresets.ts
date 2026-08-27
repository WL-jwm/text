/**
 * 跨模块数据总线 (Pipeline Data Bus) — 预定义数据
 *
 * 拆分自 usePipelineStore.ts：预定义数据链路 + 模块元数据注册表
 */

import type { DataLink, ModuleMeta } from './pipelineTypes';

// ============================================================
// 预定义数据链路
// ============================================================

export const PREDEFINED_LINKS: Omit<DataLink, 'id' | 'active' | 'lastTransfer'>[] = [
  {
    sourceModule: 'waterQuality',
    targetModule: 'compliance',
    dataType: 'waterQualityFactors',
    sourceSlot: 'waterQuality.factors',
    targetSlot: 'compliance.waterQualityData',
    description: '水质评价因子浓度 → 合规检查水质数据输入',
  },
  {
    sourceModule: 'balance',
    targetModule: 'numericalSim',
    dataType: 'balanceResult',
    sourceSlot: 'balance.result',
    targetSlot: 'numericalSim.boundaryConditions',
    description: '均衡计算补排项 → 数值模拟边界条件',
  },
  {
    sourceModule: 'drastic',
    targetModule: 'riskAssessment',
    dataType: 'drasticResult',
    sourceSlot: 'drastic.result',
    targetSlot: 'riskAssessment.pollutionRisk',
    description: 'DRASTIC脆弱性指数 → 风险评估污染风险维度',
  },
  {
    sourceModule: 'aquiferParam',
    targetModule: 'remediation',
    dataType: 'aquiferParams',
    sourceSlot: 'aquiferParam.params',
    targetSlot: 'remediation.aquiferParams',
    description: '含水层参数(K/T/S) → 修复评估PRB/PAT设计参数',
  },
  {
    sourceModule: 'hydrochem',
    targetModule: 'waterQuality',
    dataType: 'ionConcentrations',
    sourceSlot: 'hydrochem.ions',
    targetSlot: 'waterQuality.factorInput',
    description: '水化学离子浓度 → 水质评价因子输入',
  },
  {
    sourceModule: 'aquiferParam',
    targetModule: 'numericalSim',
    dataType: 'aquiferParams',
    sourceSlot: 'aquiferParam.params',
    targetSlot: 'numericalSim.aquiferParams',
    description: '含水层参数(K/T/S) → 数值模拟含水层参数',
  },
  {
    sourceModule: 'aquiferParam',
    targetModule: 'protectionZone',
    dataType: 'aquiferParams',
    sourceSlot: 'aquiferParam.params',
    targetSlot: 'protectionZone.aquiferParams',
    description: '含水层参数 → 水源地保护区划分参数',
  },
  {
    sourceModule: 'waterQuality',
    targetModule: 'riskAssessment',
    dataType: 'waterQualityFactors',
    sourceSlot: 'waterQuality.factors',
    targetSlot: 'riskAssessment.waterQuality',
    description: '水质评价结果 → 风险评估水质维度',
  },
];


// ============================================================
// 模块元数据注册表
// ============================================================

export const MODULE_REGISTRY: ModuleMeta[] = [
  { id: 'waterQuality', name: '水质评价计算器', code: 'B-06', category: '水质评价',
    publishes: ['waterQualityFactors'], subscribes: ['ionConcentrations'] },
  { id: 'balance', name: '地下水均衡计算器', code: 'B-07', category: '水量与均衡',
    publishes: ['balanceResult'], subscribes: [] },
  { id: 'drastic', name: 'DRASTIC脆弱性评价', code: 'B-16', category: '环评与保护区',
    publishes: ['drasticResult'], subscribes: ['aquiferParams'] },
  { id: 'aquiferParam', name: '含水层参数速算器', code: 'B-08', category: '水量与均衡',
    publishes: ['aquiferParams'], subscribes: [] },
  { id: 'hydrochem', name: '水化学分析计算器', code: 'B-11', category: '专题评价',
    publishes: ['ionConcentrations'], subscribes: [] },
  { id: 'numericalSim', name: '数值模拟与校准器', code: 'B-35', category: '数值模拟',
    publishes: ['simulationConfig'], subscribes: ['balanceResult', 'aquiferParams'] },
  { id: 'riskAssessment', name: '风险评估计算器', code: 'B-31', category: '风险评估',
    publishes: ['riskInput'], subscribes: ['drasticResult', 'waterQualityFactors'] },
  { id: 'compliance', name: '法规标准合规检查器', code: 'B-40', category: '合规检查',
    publishes: [], subscribes: ['waterQualityFactors'] },
  { id: 'remediation', name: '修复方案评估器', code: 'B-38', category: '修复评估',
    publishes: [], subscribes: ['aquiferParams'] },
  { id: 'protectionZone', name: '水源地保护区划分', code: 'B-10', category: '环评与保护区',
    publishes: [], subscribes: ['aquiferParams'] },
];
