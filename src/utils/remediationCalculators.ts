/**
 * 地下水修复方案评估器 (B-38) — 六大修复技术计算（自 remediationEvaluator 拆分）
 */
import type {
  PRBInput, PRBResult, PATInput, PATResult,
  MNAInput, MNAResult, BioInput, BioResult,
  ASInput, ASResult, MCDAInput, MCAResult,
} from './remediationTypes';

export function calculatePRB(input: PRBInput): PRBResult {
  const v = input.hydraulicGradient * input.hydraulicConductivity / input.porosity;
  const q = input.hydraulicGradient * input.hydraulicConductivity;
  
  // PRB厚度: 确保足够停留时间使浓度降至目标值
  // C/C0 = exp(-k*t), t = x/v
  // 厚度 x = -v * ln(C_target/C0) / k
  const thickness = Math.max(0.5, -v * Math.log(input.targetConcentration / input.initialConcentration) / input.reactionRateConstant);
  
  const prbWidth = input.plumeWidth + 10; // 两侧各预留5m
  const prbDepth = input.aquiferThickness + 2; // 深入隔水层2m
  const treatmentFlow = q * prbWidth * input.aquiferThickness;
  const residenceTime = thickness / v;
  
  const effluentConcentration = input.initialConcentration * Math.exp(-input.reactionRateConstant * residenceTime);
  const removalEfficiency = (1 - effluentConcentration / input.initialConcentration) * 100;
  
  const mediaVolume = thickness * prbWidth * prbDepth;
  const replacementCycle = input.mediaHalfLife / 365.25;
  
  // 成本估算
  const excavationCost = mediaVolume * 0.08; // 开挖+回填 800元/m³
  const mediaCost = mediaVolume * 0.15; // 反应介质 1500元/m³
  const monitoringCost = 5; // 监测系统 5万元
  const capitalCost = excavationCost + mediaCost + monitoringCost;
  
  const annualOcostVal = 3 + (replacementCycle < input.designLife ? mediaVolume * 0.15 / replacementCycle : 0);
  const lifecycleCost = capitalCost + annualOcostVal * input.designLife;
  
  return {
    groundwaterVelocity: v,
    darcyFlux: q,
    prbWidth,
    prbThickness: thickness,
    prbDepth,
    treatmentFlow,
    residenceTime,
    effluentConcentration,
    removalEfficiency,
    mediaVolume,
    replacementCycle,
    capitalCost,
    annualOcost: annualOcostVal,
    lifecycleCost,
  };
}

// ============================================================
// Pump-and-Treat 抽出处理系统计算
// ============================================================

export function calculatePAT(input: PATInput): PATResult {
  // Theis井影响半径 (近似)
  const T = input.hydraulicConductivity * input.aquiferThickness;
  const tDays = 365 * input.designPeriod; // 设计期限(天)
  
  // 稳态影响半径 (Sichardt公式)
  const drawdown = (input.pumpingRate * Math.log(2000 / input.wellRadius)) / (2 * Math.PI * T);
  const influenceRadius = 3000 * Math.sqrt(drawdown); // Sichardt
  
  // 捕获区宽度 (近似)
  const captureWidth = input.pumpingRate / (input.hydraulicGradient * T) * 2;
  
  // 推荐井数
  const recommendedWells = Math.max(1, Math.ceil(input.plumeArea > 0 ? 
    Math.sqrt(input.plumeArea) / Math.max(1, captureWidth) : 1));
  
  const totalPumpingRate = recommendedWells * input.pumpingRate;
  
  // 孔隙体积
  const poreVolume = input.plumeArea * input.aquiferThickness * input.porosity;
  const poreVolumeExchanges = (totalPumpingRate * tDays) / poreVolume;
  
  // 浓度衰减曲线 (一阶衰减模型)
  // C/C0 = exp(-N * PV), N为孔隙体积交换次数
  const concentrationCurve: { time: number; concentration: number; cumulativePV: number }[] = [];
  const steps = 20;
  for (let i = 0; i <= steps; i++) {
    const year = (input.designPeriod * i) / steps;
    const days = year * 365;
    const cumPV = (totalPumpingRate * days) / poreVolume;
    const conc = input.initialConcentration * Math.exp(-cumPV * 0.5); // 0.5为洗脱效率因子
    concentrationCurve.push({
      time: Math.round(year * 10) / 10,
      concentration: Math.round(conc * 10000) / 10000,
      cumulativePV: Math.round(cumPV * 100) / 100,
    });
  }
  
  const finalConcentration = concentrationCurve[concentrationCurve.length - 1].concentration;
  const canAchieveTarget = finalConcentration <= input.targetConcentration;
  
  // 修复时间估算
  const targetPV = -Math.log(input.targetConcentration / input.initialConcentration) / 0.5;
  const estimatedRemediationTime = (targetPV * poreVolume) / (totalPumpingRate * 365);
  
  // 成本
  const wellCost = recommendedWells * 8; // 单井8万元
  const treatmentSystemCost = 15; // 水处理系统15万元
  const capitalCost = wellCost + treatmentSystemCost;
  const annualOcostVal = totalPumpingRate * 365 * 0.002 + recommendedWells * 1.5; // 电费+维护
  const lifecycleCost = capitalCost + annualOcostVal * input.designPeriod;
  
  return {
    influenceRadius: Math.round(influenceRadius * 10) / 10,
    captureWidth: Math.round(captureWidth * 10) / 10,
    recommendedWells,
    totalPumpingRate: Math.round(totalPumpingRate * 10) / 10,
    poreVolumeExchanges: Math.round(poreVolumeExchanges * 100) / 100,
    estimatedRemediationTime: Math.round(estimatedRemediationTime * 10) / 10,
    concentrationCurve,
    canAchieveTarget,
    capitalCost: Math.round(capitalCost * 10) / 10,
    annualOcost: Math.round(annualOcostVal * 10) / 10,
    lifecycleCost: Math.round(lifecycleCost * 10) / 10,
  };
}

// ============================================================
// MNA 监测自然衰减评估
// ============================================================

export function calculateMNA(input: MNAInput): MNAResult {
  const halfLife = Math.LN2 / input.decayRate;
  
  // 衰减到目标浓度的时间
  const timeToTarget = Math.log(input.initialConcentration / input.targetConcentration) / input.decayRate / 365.25;
  
  // 衰减距离 = 流速 * 衰减时间
  const attenuationDistance = input.groundwaterVelocity * (timeToTarget * 365.25);
  
  // 自然衰减容量
  const attenuationCapacity = (input.initialConcentration - input.targetConcentration) / Math.max(1, attenuationDistance) * 1000;
  
  const feasible = timeToTarget <= input.designPeriod && timeToTarget > 0;
  
  // 衰减曲线
  const attenuationCurve: { distance: number; concentration: number; time: number }[] = [];
  const maxDist = Math.max(attenuationDistance * 1.5, input.sourceDistance + 100);
  const steps = 30;
  for (let i = 0; i <= steps; i++) {
    const dist = (maxDist * i) / steps;
    const time = dist / Math.max(0.0001, input.groundwaterVelocity);
    const conc = input.initialConcentration * Math.exp(-input.decayRate * time);
    attenuationCurve.push({
      distance: Math.round(dist * 10) / 10,
      concentration: Math.round(conc * 10000) / 10000,
      time: Math.round((time / 365.25) * 100) / 100,
    });
  }
  
  // 监测频率建议
  const monitoringFrequency = timeToTarget > 10 ? 2 : timeToTarget > 5 ? 4 : 6;
  
  // 监测成本
  const annualMonitoringCost = input.monitoringWells * monitoringFrequency * 0.3; // 0.3万元/井/次
  const lifecycleCost = annualMonitoringCost * input.designPeriod + 10; // +初始评估费10万
  
  // 衰减机制贡献分析
  const attenuationMechanisms = [
    { mechanism: '生物降解', contribution: 60, description: '微生物代谢分解污染物为主要衰减机制' },
    { mechanism: '吸附滞留', contribution: 20, description: '含水层介质吸附降低溶解相浓度' },
    { mechanism: '稀释扩散', contribution: 15, description: '水动力弥散与净稀释作用' },
    { mechanism: '化学沉淀', contribution: 5, description: '沉淀反应去除溶解态污染物' },
  ];
  
  return {
    halfLife: Math.round(halfLife * 10) / 10,
    timeToTarget: Math.round(timeToTarget * 100) / 100,
    attenuationDistance: Math.round(attenuationDistance * 10) / 10,
    feasible,
    attenuationCapacity: Math.round(attenuationCapacity * 100) / 100,
    attenuationCurve,
    monitoringFrequency,
    annualMonitoringCost: Math.round(annualMonitoringCost * 10) / 10,
    lifecycleCost: Math.round(lifecycleCost * 10) / 10,
    attenuationMechanisms,
  };
}

// ============================================================
// 生物修复评估
// ============================================================

export function calculateBio(input: BioInput): BioResult {
  // 适宜性评分计算 (多因素加权)
  let score = 0;
  
  // 温度 (15-30度最佳)
  const tempScore = input.temperature >= 15 && input.temperature <= 30 ? 100 :
    input.temperature >= 10 && input.temperature <= 35 ? 60 : 20;
  score += tempScore * 0.15;
  
  // pH (6.5-8.0最佳)
  const pHScore = input.pH >= 6.5 && input.pH <= 8.0 ? 100 :
    input.pH >= 6.0 && input.pH <= 8.5 ? 70 : 30;
  score += pHScore * 0.15;
  
  // 电子受体
  const eaScore = Math.min(100, (input.dissolvedOxygen / 2 + input.nitrate / 10 + input.sulfate / 50 + input.fe3 / 20) * 25);
  score += eaScore * 0.25;
  
  // TOC (有机碳作为共代谢基质)
  const tocScore = input.toc >= 10 ? 100 : input.toc >= 5 ? 70 : input.toc >= 2 ? 40 : 10;
  score += tocScore * 0.15;
  
  // 微生物丰度
  const microScore = input.microbialCount >= 100000 ? 100 :
    input.microbialCount >= 10000 ? 70 :
    input.microbialCount >= 1000 ? 40 : 10;
  score += microScore * 0.15;
  
  // 渗透性
  const kScore = input.hydraulicConductivity >= 5 ? 100 :
    input.hydraulicConductivity >= 1 ? 70 : 30;
  score += kScore * 0.15;
  
  const suitabilityScore = Math.round(score);
  const suitabilityLevel = suitabilityScore >= 75 ? '高度适宜' :
    suitabilityScore >= 50 ? '中度适宜' :
    suitabilityScore >= 30 ? '低度适宜' : '不适宜';
  
  // 电子受体分析
  const electronAcceptors = [
    { acceptor: 'O₂', concentration: input.dissolvedOxygen, capacity: input.dissolvedOxygen * 3.42, status: input.dissolvedOxygen > 1 ? '充足' : '不足' },
    { acceptor: 'NO₃⁻', concentration: input.nitrate, capacity: input.nitrate * 2.86, status: input.nitrate > 5 ? '充足' : '不足' },
    { acceptor: 'SO₄²⁻', concentration: input.sulfate, capacity: input.sulfate * 1.5, status: input.sulfate > 20 ? '充足' : '不足' },
    { acceptor: 'Fe(III)', concentration: input.fe3, capacity: input.fe3 * 5.0, status: input.fe3 > 10 ? '充足' : '不足' },
  ];
  
  // 最大降解速率 (基于Monod方程简化)
  const tempFactor = Math.exp(0.07 * (input.temperature - 20)); // Q10=2
  const maxDegradationRate = 0.05 * tempFactor * (suitabilityScore / 100);
  
  // 预测修复时间
  const estimatedTime = Math.log(input.initialConcentration / input.targetConcentration) / maxDegradationRate / 365.25;
  
  const needsEnhancement = suitabilityScore < 60;
  
  const enhancementSuggestions: string[] = [];
  if (input.dissolvedOxygen < 2) enhancementSuggestions.push('注入过氧化氢或曝气提高溶解氧浓度');
  if (input.toc < 10) enhancementSuggestions.push('添加电子供体(乳酸盐/醋酸盐等)促进共代谢');
  if (input.pH < 6.5 || input.pH > 8.0) enhancementSuggestions.push('调节pH至6.5-8.0范围');
  if (input.microbialCount < 10000) enhancementSuggestions.push('接种降解菌群进行生物强化');
  if (input.nitrate < 5 && input.sulfate < 20) enhancementSuggestions.push('补充硝酸盐/硫酸盐作为替代电子受体');
  if (enhancementSuggestions.length === 0) enhancementSuggestions.push('当前条件已满足自然生物降解需求');
  
  // 营养盐需求 (C:N:P = 100:10:1)
  const contaminantMass = input.initialConcentration * input.plumeVolume * input.porosity; // mg
  const nitrogenNeed = contaminantMass * 0.1 / 1e6; // kg
  const phosphorusNeed = contaminantMass * 0.01 / 1e6;
  
  // 成本
  const baseCost = needsEnhancement ? 30 : 10;
  const wellCost = needsEnhancement ? 15 : 0;
  const capitalCost = baseCost + wellCost;
  const annualOcostVal = needsEnhancement ? 8 : 3;
  const lifecycleCost = capitalCost + annualOcostVal * input.designPeriod;
  
  return {
    suitabilityScore,
    suitabilityLevel,
    electronAcceptors,
    maxDegradationRate: Math.round(maxDegradationRate * 10000) / 10000,
    estimatedTime: Math.round(estimatedTime * 100) / 100,
    needsEnhancement,
    enhancementSuggestions,
    nutrientRequirement: {
      nitrogen: Math.round(nitrogenNeed * 100) / 100,
      phosphorus: Math.round(phosphorusNeed * 100) / 100,
    },
    capitalCost,
    annualOcost: annualOcostVal,
    lifecycleCost: Math.round(lifecycleCost * 10) / 10,
  };
}

// ============================================================
// Air Sparging 土壤气相抽提设计
// ============================================================

export function calculateAS(input: ASInput): ASResult {
  // 影响半径 (经验公式, 基于渗透系数)
  const influenceRadius = Math.max(1.5, 0.5 + input.hydraulicConductivity * 0.3);
  
  // 单井注气流量 (基于影响面积和注入深度)
  const influenceArea = Math.PI * influenceRadius * influenceRadius;
  const airFlowRate = influenceArea * (input.aquiferThickness + input.depthToWater) * 0.05; // 0.05 m³/m³/min
  
  // 推荐井数
  const recommendedWells = Math.max(1, Math.ceil(input.plumeArea / (influenceArea * 0.7))); // 0.7为重叠系数
  
  // 井间距 (1.5倍影响半径)
  const wellSpacing = influenceRadius * 1.5;
  
  // 注气压力 (克服水头+介质阻力)
  const injectionPressure = Math.round((input.depthToWater * 9.81 + 20) * 10) / 10;
  
  // 挥发去除曲线
  // 亨利常数越大越容易挥发
  const volatilizationFactor = Math.min(1, input.henryConstant * 2);
  const removalCurve: { time: number; concentration: number; removalPercent: number }[] = [];
  const steps = 20;
  for (let i = 0; i <= steps; i++) {
    const year = (input.designPeriod * i) / steps;
    const k = volatilizationFactor * 2 * Math.exp(-i / steps * 1.5); // 速率随时间衰减
    const conc = input.initialConcentration * Math.exp(-k * year * 365);
    const removal = (1 - conc / input.initialConcentration) * 100;
    removalCurve.push({
      time: Math.round(year * 100) / 100,
      concentration: Math.round(conc * 10000) / 10000,
      removalPercent: Math.round(removal * 100) / 100,
    });
  }
  
  const finalConcentration = removalCurve[removalCurve.length - 1].concentration;
  const canAchieveTarget = finalConcentration <= input.targetConcentration;
  
  // 修复时间估算
  const targetK = volatilizationFactor * 2;
  const estimatedTime = input.henryConstant > 0.01 ?
    Math.log(input.initialConcentration / input.targetConcentration) / targetK / 365.25 :
    999; // 亨利常数过低不适合AS
  
  // 成本
  const wellCost = recommendedWells * 5; // 单井5万元
  const equipmentCost = 20; // 空压机+管路20万
  const capitalCost = wellCost + equipmentCost;
  const annualOcostVal = recommendedWells * 2 + 5; // 运行电费+维护
  const lifecycleCost = capitalCost + annualOcostVal * input.designPeriod;
  
  return {
    influenceRadius: Math.round(influenceRadius * 100) / 100,
    airFlowRate: Math.round(airFlowRate * 100) / 100,
    recommendedWells,
    wellSpacing: Math.round(wellSpacing * 100) / 100,
    injectionPressure,
    estimatedTime: estimatedTime > 100 ? -1 : Math.round(estimatedTime * 100) / 100,
    removalCurve,
    canAchieveTarget,
    capitalCost,
    annualOcost: annualOcostVal,
    lifecycleCost: Math.round(lifecycleCost * 10) / 10,
  };
}

// ============================================================
// MCDA 多准则决策分析
// ============================================================

export function calculateMCDA(input: MCDAInput): MCAResult {
  const { alternatives, weights } = input;
  
  // 计算加权综合得分
  const scored = alternatives.map(alt => {
    const detailScores = { ...alt.scores };
    const weightedScores: Record<string, number> = {};
    let totalScore = 0;
    
    for (const [criterion, weight] of Object.entries(weights)) {
      const score = alt.scores[criterion] || 0;
      weightedScores[criterion] = score * weight;
      totalScore += score * weight;
    }
    
    return {
      id: alt.id,
      name: alt.name,
      totalScore: Math.round(totalScore * 100) / 100,
      detailScores,
      weightedScores,
      cost: alt.cost,
      remediationTime: alt.remediationTime,
      rank: 0,
    };
  });
  
  // 排序
  scored.sort((a, b) => b.totalScore - a.totalScore);
  scored.forEach((item, idx) => { item.rank = idx + 1; });
  
  const recommended = scored[0]?.id || '';
  
  // 敏感性分析 (权重±20%)
  const sensitivityAnalysis = Object.keys(weights).map(criterion => {
    const originalRank = scored.map(s => s.id);
    
    // 增加20%
    const increasedWeights = { ...weights };
    const totalOthers = 1 - weights[criterion];
    const newWeightIncreased = Math.min(1, weights[criterion] * 1.2);
    const scaleIncreased = (1 - newWeightIncreased) / Math.max(0.0001, totalOthers);
    for (const key of Object.keys(increasedWeights)) {
      if (key === criterion) increasedWeights[key] = newWeightIncreased;
      else increasedWeights[key] = weights[key] * scaleIncreased;
    }
    
    const increasedScored = alternatives.map(alt => {
      let ts = 0;
      for (const [c, w] of Object.entries(increasedWeights)) {
        ts += (alt.scores[c] || 0) * w;
      }
      return { id: alt.id, score: ts };
    }).sort((a, b) => b.score - a.score);
    const increasedRank = increasedScored.map(s => s.id);
    
    // 减少20%
    const decreasedWeights = { ...weights };
    const newWeightDecreased = weights[criterion] * 0.8;
    const totalOthers2 = 1 - newWeightDecreased;
    const scaleDecreased = totalOthers2 / Math.max(0.0001, totalOthers);
    for (const key of Object.keys(decreasedWeights)) {
      if (key === criterion) decreasedWeights[key] = newWeightDecreased;
      else decreasedWeights[key] = weights[key] * scaleDecreased;
    }
    
    const decreasedScored = alternatives.map(alt => {
      let ts = 0;
      for (const [c, w] of Object.entries(decreasedWeights)) {
        ts += (alt.scores[c] || 0) * w;
      }
      return { id: alt.id, score: ts };
    }).sort((a, b) => b.score - a.score);
    const decreasedRank = decreasedScored.map(s => s.id);
    
    return {
      criterion,
      originalRank,
      increasedRank,
      decreasedRank,
      rankChanged: JSON.stringify(originalRank) !== JSON.stringify(increasedRank) ||
                     JSON.stringify(originalRank) !== JSON.stringify(decreasedRank),
    };
  });
  
  // 成本效益比
  const costEffectiveness = scored.map(s => ({
    name: s.name,
    score: s.totalScore,
    cost: s.cost,
    ratio: Math.round((s.totalScore / Math.max(1, s.cost)) * 100) / 100,
  }));
  
  return {
    ranking: scored,
    recommended,
    sensitivityAnalysis,
    costEffectiveness,
  };
}

// ============================================================
// 技术对比表数据
// ============================================================

