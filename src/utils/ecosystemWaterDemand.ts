/**
 * 生态系统服务价值评估 — 生态需水量计算
 */

import type { EcoWaterDemandInput, EcoWaterDemandResult } from './ecosystemTypes';

export function calculateEcoWaterDemand(input: EcoWaterDemandInput): EcoWaterDemandResult {
  // 湿地需水量 (万m³)
  const wetlandDemand = input.wetlandArea * 1000000 * input.wetlandET / 1000 / 10000;
  
  // 植被需水量 (万m³)
  const vegetationDemand = input.vegetationArea * 1000000 * input.vegetationTranspiration / 1000 / 10000;
  
  // 河流需水量 (水面蒸发) (万m³)
  const riverArea = input.riverLength * 1000 * input.riverWidth; // m²
  const riverDemand = riverArea * input.riverEvaporation / 1000 / 10000;
  
  const totalDemand = wetlandDemand + vegetationDemand + riverDemand;
  
  // 当前地下水可供给量 (基于埋深差)
  const depthDiff = Math.max(0, input.currentDepth - input.criticalDepth);
  const supplyArea = input.wetlandArea * 1000000 + input.vegetationArea * 1000000; // m²
  const currentSupply = depthDiff > 0 ? 0 : 
    supplyArea * input.influenceRadius * input.specificYield / 10000; // 万m³
  
  const deficit = Math.max(0, totalDemand - currentSupply);
  const deficitRatio = totalDemand > 0 ? deficit / totalDemand * 100 : 0;
  
  let status: string;
  if (deficitRatio < 10) status = '满足良好';
  else if (deficitRatio < 30) status = '基本满足';
  else if (deficitRatio < 50) status = '轻度缺水';
  else if (deficitRatio < 75) status = '中度缺水';
  else status = '严重缺水';
  
  // 月度需水分配 (华北地区典型分配)
  const monthlyFactors = [
    { month: '1月', f: 0.03 }, { month: '2月', f: 0.03 }, { month: '3月', f: 0.05 },
    { month: '4月', f: 0.08 }, { month: '5月', f: 0.10 }, { month: '6月', f: 0.12 },
    { month: '7月', f: 0.15 }, { month: '8月', f: 0.14 }, { month: '9月', f: 0.10 },
    { month: '10月', f: 0.08 }, { month: '11月', f: 0.07 }, { month: '12月', f: 0.05 },
  ];
  
  const monthlyDemand = monthlyFactors.map(m => ({
    month: m.month,
    wetland: Math.round(wetlandDemand * m.f * 100) / 100,
    vegetation: Math.round(vegetationDemand * m.f * 100) / 100,
    river: Math.round(riverDemand * m.f * 100) / 100,
    total: Math.round(totalDemand * m.f * 100) / 100,
  }));
  
  return {
    wetlandDemand: Math.round(wetlandDemand * 100) / 100,
    vegetationDemand: Math.round(vegetationDemand * 100) / 100,
    riverDemand: Math.round(riverDemand * 100) / 100,
    totalDemand: Math.round(totalDemand * 100) / 100,
    currentSupply: Math.round(currentSupply * 100) / 100,
    deficit: Math.round(deficit * 100) / 100,
    deficitRatio: Math.round(deficitRatio * 10) / 10,
    status,
    monthlyDemand,
  };
}

