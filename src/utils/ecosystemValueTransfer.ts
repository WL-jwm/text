/**
 * 生态系统服务价值评估 — 价值转移与当量系数法
 */

import type { ValueTransferInput, ValueTransferResult } from './ecosystemTypes';

const BASE_VALUES = {
  porous: { humid: 85, 'semi-arid': 45, arid: 20 },
  fractured: { humid: 65, 'semi-arid': 35, arid: 15 },
  karst: { humid: 120, 'semi-arid': 60, arid: 25 },
};


const DEVELOPMENT_FACTORS = {
  low: 1.2,    // 低开发: 生态价值保留度高
  medium: 0.9, // 中等开发
  high: 0.6,   // 高开发: 生态价值受损
};


export function calculateValueTransfer(input: ValueTransferInput): ValueTransferResult {
  const baseValue = BASE_VALUES[input.aquiferType][input.climate];
  const devFactor = DEVELOPMENT_FACTORS[input.development];
  const unitValue = baseValue * devFactor;
  const totalValue = unitValue * input.area;
  
  const services = [
    { type: '供给服务', ratio: 0.40, confidence: '高' },
    { type: '调节服务', ratio: 0.35, confidence: '中' },
    { type: '文化服务', ratio: 0.10, confidence: '中低' },
    { type: '支持服务', ratio: 0.15, confidence: '中' },
  ].map(s => ({
    type: s.type,
    unitValue: Math.round(unitValue * s.ratio * 100) / 100,
    totalValue: Math.round(totalValue * s.ratio * 100) / 100,
    confidence: s.confidence,
  }));
  
  const transferCoefficients = [
    { factor: '含水层类型修正', coefficient: input.aquiferType === 'karst' ? 1.4 : input.aquiferType === 'porous' ? 1.0 : 0.8, description: '岩溶含水层生态价值最高' },
    { factor: '气候区修正', coefficient: input.climate === 'humid' ? 1.5 : input.climate === 'semi-arid' ? 0.8 : 0.4, description: '湿润区生态价值显著高于干旱区' },
    { factor: '开发利用修正', coefficient: devFactor, description: '高开发区域生态服务价值降低40%' },
    { factor: '区域校正', coefficient: 0.85, description: '河北省区域校正系数(基于华北平原实证)' },
  ];
  
  return {
    unitValue: Math.round(unitValue * 100) / 100,
    totalValue: Math.round(totalValue),
    services,
    transferCoefficients,
  };
}

// ============================================================
// 生态需水量计算
// ============================================================

