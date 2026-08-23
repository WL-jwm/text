/**
 * B-32 决策支持引擎 — 预设方案
 * 水资源/压采/综合决策 的演示预设数据
 */

import type { WaterSource, WaterUser, ReductionPlan, DecisionOption } from './decisionSupportTypes';
export const PRESET_SOURCES: WaterSource[] = [
  { id: 'gw', name: '地下水', supply: 8000, cost: 1.2, quality: 2 },
  { id: 'sw', name: '地表水', supply: 5000, cost: 2.5, quality: 2 },
  { id: 'transfer', name: '南水北调', supply: 4000, cost: 4.5, quality: 1 },
  { id: 'reuse', name: '再生水', supply: 2000, cost: 1.8, quality: 3 },
  { id: 'desal', name: '海水淡化', supply: 1000, cost: 6.0, quality: 1 },
];


export const PRESET_USERS: WaterUser[] = [
  { id: 'domestic', name: '城镇生活', demand: 3500, minSupply: 3000, priority: 1, maxQuality: 2 },
  { id: 'industrial', name: '工业生产', demand: 4000, minSupply: 2000, priority: 2, maxQuality: 3 },
  { id: 'agri', name: '农业灌溉', demand: 8000, minSupply: 4000, priority: 3, maxQuality: 4 },
  { id: 'eco', name: '生态用水', demand: 1500, minSupply: 800, priority: 2, maxQuality: 4 },
  { id: 'rural', name: '农村人饮', demand: 1000, minSupply: 900, priority: 1, maxQuality: 2 },
];


export const PRESET_REDUCTION_PLANS: ReductionPlan[] = [
  {
    phase: '第一阶段', yearRange: '2024-2025',
    currentExtraction: 12000, targetExtraction: 10000,
    alternativeSupply: 1500, alternativeTypes: ['南水北调', '再生水'],
    alternativeCost: 3.5, ecologicalWater: 500,
  },
  {
    phase: '第二阶段', yearRange: '2026-2028',
    currentExtraction: 10000, targetExtraction: 7500,
    alternativeSupply: 2000, alternativeTypes: ['南水北调', '再生水', '地表水'],
    alternativeCost: 4.0, ecologicalWater: 800,
  },
  {
    phase: '第三阶段', yearRange: '2029-2030',
    currentExtraction: 7500, targetExtraction: 5500,
    alternativeSupply: 1800, alternativeTypes: ['再生水', '海水淡化', '雨洪利用'],
    alternativeCost: 4.5, ecologicalWater: 600,
  },
];


export const PRESET_DECISION_OPTIONS: DecisionOption[] = [
  {
    name: '方案A: 南水北调为主',
    description: '以南水北调水替代深层地下水，城镇供水全面切换',
    waterSecurity: 85, ecologicalBenefit: 80, economicFeasibility: 60, technicalFeasibility: 85, socialAcceptance: 75,
    implementationPeriod: 3, investment: 45000,
  },
  {
    name: '方案B: 再生水回用为主',
    description: '建设再生水处理设施，主要用于工业和生态',
    waterSecurity: 70, ecologicalBenefit: 75, economicFeasibility: 80, technicalFeasibility: 75, socialAcceptance: 65,
    implementationPeriod: 4, investment: 25000,
  },
  {
    name: '方案C: 多水源联合调度',
    description: '南水北调+再生水+地表水+雨洪利用综合配置',
    waterSecurity: 88, ecologicalBenefit: 85, economicFeasibility: 65, technicalFeasibility: 70, socialAcceptance: 80,
    implementationPeriod: 5, investment: 55000,
  },
  {
    name: '方案D: 节水优先+适度替代',
    description: '以节水改造为主，辅以少量替代水源，成本最低',
    waterSecurity: 65, ecologicalBenefit: 70, economicFeasibility: 90, technicalFeasibility: 88, socialAcceptance: 85,
    implementationPeriod: 3, investment: 15000,
  },
];

