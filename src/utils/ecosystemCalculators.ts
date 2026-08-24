/**
 * 生态系统服务价值评估 — 四大服务计算
 *  供给 / 调节 / 文化 / 支持 + 综合评估
 */

import type { SupplyServiceInput, RegulationServiceInput, CulturalServiceInput, SupportingServiceInput, EcosystemServiceResult } from './ecosystemTypes';
import { REGION_PRESETS } from './ecosystemPresets';

export function calculateSupplyService(input: SupplyServiceInput) {
  // 转换为万m³
  const totalExtraction = input.actualExtraction * 10000; // 万m³
  const domesticVol = totalExtraction * input.domesticRatio / 100;
  const irrigationVol = totalExtraction * input.irrigationRatio / 100;
  const industrialVol = totalExtraction * input.industrialRatio / 100;
  const ecologicalVol = totalExtraction * input.ecologicalRatio / 100;
  
  // 价值计算 (万元)
  const domesticValue = domesticVol * input.domesticPrice;
  const irrigationValue = irrigationVol * input.irrigationPrice;
  const industrialValue = industrialVol * input.industrialPrice;
  const ecologicalValue = ecologicalVol * input.domesticPrice * 0.8; // 生态用水按生活水价80%计
  
  const totalVolume = domesticVol + irrigationVol + industrialVol + ecologicalVol;
  const totalValue = domesticValue + irrigationValue + industrialValue + ecologicalValue;
  
  return {
    domestic: { volume: Math.round(domesticVol), value: Math.round(domesticValue) },
    irrigation: { volume: Math.round(irrigationVol), value: Math.round(irrigationValue) },
    industrial: { volume: Math.round(industrialVol), value: Math.round(industrialValue) },
    ecological: { volume: Math.round(ecologicalVol), value: Math.round(ecologicalValue) },
    totalVolume: Math.round(totalVolume),
    totalValue: Math.round(totalValue),
  };
}


export function calculateRegulationService(input: RegulationServiceInput) {
  // 基流维持价值 (替代工程法: 建设同等流量水库的成本)
  const baseflowVol = input.riverRunoff * input.baseflowContribution / 100 * 10000; // 万m³
  const baseflowValue = baseflowVol * 2.0; // 2元/m³替代工程成本
  
  // 水质净化价值 (替代成本法)
  const purificationValue = input.purifiedPollutants * input.treatmentCost; // 元 → 万元
  
  // 气候调节 (碳储量×碳价)
  const climateValue = input.carbonStorage * 10000 * input.carbonPrice / 10000; // 万吨→吨→元→万元
  
  // 洪水调蓄 (调蓄空间×避免损失)
  const floodCapacity = input.storageCapacity * 10000; // 万m³
  const floodValue = floodCapacity * input.floodAvoidanceValue;
  
  // 蒸散发调节 (区域微气候调节)
  const etVol = input.evapotranspiration * 10000; // 万m³
  const etValue = etVol * 0.5; // 0.5元/m³微气候调节价值
  
  const totalValue = baseflowValue + purificationValue + climateValue + floodValue + etValue;
  
  return {
    baseflow: { volume: Math.round(baseflowVol), value: Math.round(baseflowValue) },
    purification: { amount: input.purifiedPollutants, value: Math.round(purificationValue) },
    climate: { carbon: input.carbonStorage, value: Math.round(climateValue) },
    flood: { capacity: Math.round(floodCapacity), value: Math.round(floodValue) },
    etRegulation: { volume: Math.round(etVol), value: Math.round(etValue) },
    totalValue: Math.round(totalValue),
  };
}


export function calculateCulturalService(input: CulturalServiceInput) {
  // 休闲旅游 (旅行费用法)
  const recreationValue = input.annualVisitors * 10000 * input.avgSpending / 10000; // 万人次→人次→元→万元
  
  // 教育科研 (科研经费+教育价值)
  const educationValue = input.researchProjects * input.avgResearchFunding;
  
  // 地质遗迹 (存在价值评估, 每个遗迹50万元/年)
  const geologicalValue = input.geologicalSites * 50;
  
  // 泉群文化价值 (每个泉群100万元/年)
  const springValue = input.springCount * 100;
  
  const totalValue = recreationValue + educationValue + geologicalValue + springValue;
  
  return {
    recreation: { visitors: input.annualVisitors, value: Math.round(recreationValue) },
    education: { projects: input.researchProjects, value: Math.round(educationValue) },
    geological: { sites: input.geologicalSites, value: Math.round(geologicalValue + springValue) },
    totalValue: Math.round(totalValue),
  };
}


export function calculateSupportingService(input: SupportingServiceInput) {
  // 生境维持 (湿地面积×单位生态价值)
  const habitatValue = input.wetlandArea * input.biodiversityValue;
  
  // 生物多样性 (濒危物种额外价值, 每种500万元/年)
  const biodiversityValue = input.endangeredSpecies * 500;
  
  // 植被固碳 (光合作用固碳, 5tC/km²·年 × 200元/t)
  const carbonFixation = input.protectedArea * 5 * 200 / 10000; // 万元
  
  const totalValue = habitatValue + biodiversityValue + carbonFixation;
  
  return {
    habitat: { area: input.wetlandArea, value: Math.round(habitatValue) },
    biodiversity: { species: input.endangeredSpecies, value: Math.round(biodiversityValue) },
    carbonFixation: Math.round(carbonFixation),
    totalValue: Math.round(totalValue),
  };
}


export function calculateEcosystemService(
  supply: SupplyServiceInput,
  regulation: RegulationServiceInput,
  cultural: CulturalServiceInput,
  supporting: SupportingServiceInput,
  _population: number = 1000,
): EcosystemServiceResult {
  const supplyResult = calculateSupplyService(supply);
  const regulationResult = calculateRegulationService(regulation);
  const culturalResult = calculateCulturalService(cultural);
  const supportingResult = calculateSupportingService(supporting);
  
  const totalValue = supplyResult.totalValue + regulationResult.totalValue + 
                     culturalResult.totalValue + supportingResult.totalValue;
  
  const valueByCategory = [
    { category: '供给服务', value: supplyResult.totalValue, percentage: Math.round(supplyResult.totalValue / totalValue * 1000) / 10, color: '#06b6d4' },
    { category: '调节服务', value: regulationResult.totalValue, percentage: Math.round(regulationResult.totalValue / totalValue * 1000) / 10, color: '#10b981' },
    { category: '文化服务', value: culturalResult.totalValue, percentage: Math.round(culturalResult.totalValue / totalValue * 1000) / 10, color: '#f59e0b' },
    { category: '支持服务', value: supportingResult.totalValue, percentage: Math.round(supportingResult.totalValue / totalValue * 1000) / 10, color: '#8b5cf6' },
  ].sort((a, b) => b.value - a.value);
  
  // 人均价值
  const valueByRegion = REGION_PRESETS.map(r => {
    const s = calculateSupplyService({ ...r.supply as SupplyServiceInput });
    const reg = calculateRegulationService({ ...r.regulation as RegulationServiceInput });
    const c = calculateCulturalService({ ...r.cultural as CulturalServiceInput });
    const sup = calculateSupportingService({ ...r.supporting as SupportingServiceInput });
    const total = s.totalValue + reg.totalValue + c.totalValue + sup.totalValue;
    return {
      region: r.name,
      value: Math.round(total),
      perCapita: Math.round(total / r.population),
    };
  }).sort((a, b) => b.value - a.value);
  
  // 可持续性评分
  const extractionRatio = supply.actualExtraction / supply.annualResource;
  let score = 0;
  // 开采平衡 (40%)
  score += Math.min(40, 40 * (extractionRatio <= 1 ? 1 : Math.max(0, 2 - extractionRatio)));
  // 调节服务占比 (25%)
  const regRatio = regulationResult.totalValue / totalValue;
  score += Math.min(25, regRatio * 100);
  // 文化+支持占比 (20%)
  const cultSupRatio = (culturalResult.totalValue + supportingResult.totalValue) / totalValue;
  score += Math.min(20, cultSupRatio * 80);
  // 生态用水比例 (15%)
  score += Math.min(15, supply.ecologicalRatio * 0.5);
  
  const sustainabilityScore = Math.round(score);
  const sustainabilityLevel = sustainabilityScore >= 75 ? '高度可持续' :
    sustainabilityScore >= 55 ? '中度可持续' :
    sustainabilityScore >= 35 ? '低度可持续' : '不可持续';
  
  // 建议措施
  const recommendations: string[] = [];
  if (extractionRatio > 1.2) recommendations.push('地下水超采严重，建议压采至可开采量以内，实施节水改造和替代水源工程');
  else if (extractionRatio > 1.0) recommendations.push('处于超采临界状态，建议严格取水许可管理，控制开采量增长');
  
  if (supply.ecologicalRatio < 5) recommendations.push('生态用水比例偏低，建议增加地下水生态补给，保障最小生态需水量');
  if (regulationResult.purification.value < regulationResult.totalValue * 0.1) recommendations.push('水质净化功能不足，建议加强水源地保护和污染源控制');
  if (culturalResult.totalValue < totalValue * 0.05) recommendations.push('文化服务价值开发不足，建议挖掘地下水文化遗迹和泉群旅游资源');
  if (supportingResult.biodiversity.species > 10 && supportingResult.habitat.area > 200) recommendations.push('生物多样性丰富区域，建议建立地下水生态保护区，严格限制开发活动');
  if (regulationResult.baseflow.value < regulationResult.totalValue * 0.15) recommendations.push('基流维持功能较弱，建议保障枯水期地下水排泄，维持河流生态基流');
  if (recommendations.length === 0) recommendations.push('地下水生态系统服务状态良好，建议维持现有管理水平并持续监测');
  
  return {
    supply: supplyResult,
    regulation: regulationResult,
    cultural: culturalResult,
    supporting: supportingResult,
    totalValue: Math.round(totalValue),
    valueByCategory,
    valueByRegion,
    sustainabilityScore,
    sustainabilityLevel,
    recommendations,
  };
}

// ============================================================
// 价值转移法估算
// ============================================================

