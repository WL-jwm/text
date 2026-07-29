/**
 * B-32 地下水管理决策支持器引擎
 *
 * 五大决策模块：
 *  1. 水资源配置优化 — 多水源多用户线性规划分配
 *  2. 压采方案评估 — 分阶段压采目标+替代水源+经济成本
 *  3. 生态水位保障 — 生态水位阈值+保障措施+达标率
 *  4. 风险预警决策 — 三级预警阈值+响应措施矩阵
 *  5. 综合决策评价 — 多目标加权评分+方案排序
 */

// ═══════════════════════════════════════════════════════════════
// 通用类型与工具
// ═══════════════════════════════════════════════════════════════

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, v));
}

// ═══════════════════════════════════════════════════════════════
// 1. 水资源配置优化（线性规划简化求解）
// ═══════════════════════════════════════════════════════════════

export interface WaterSource {
  id: string;
  name: string;
  /** 可供水量 (万m³/yr) */
  supply: number;
  /** 单方水成本 (元/m³) */
  cost: number;
  /** 水质等级 (Ⅰ-Ⅴ) */
  quality: number;
}

export interface WaterUser {
  id: string;
  name: string;
  /** 需水量 (万m³/yr) */
  demand: number;
  /** 最低供水保障 (万m³/yr) */
  minSupply: number;
  /** 用户优先级 (1=最高, 5=最低) */
  priority: number;
  /** 可接受的水质等级上限 (1=Ⅰ类, 5=Ⅴ类) */
  maxQuality: number;
}

export interface AllocationResult {
  /** 分配矩阵 [source][user] = 水量 */
  allocation: { source: string; user: string; volume: number; cost: number }[];
  /** 各水源剩余水量 */
  sourceRemainder: { source: string; remainder: number; utilization: number }[];
  /** 各用户满足率 */
  userSatisfaction: { user: string; allocated: number; demand: number; satisfaction: number }[];
  /** 总供水量 */
  totalAllocated: number;
  /** 总成本 */
  totalCost: number;
  /** 总需求 */
  totalDemand: number;
  /** 整体满足率 */
  overallSatisfaction: number;
  /** 优化说明 */
  notes: string[];
}

export function calcWaterAllocation(sources: WaterSource[], users: WaterUser[]): AllocationResult {
  // 按用户优先级排序（优先级数字小的先分配）
  const sortedUsers = [...users].sort((a, b) => a.priority - b.priority);

  // 各水源剩余水量
  const sourceRemaining = new Map<string, number>();
  sources.forEach(s => sourceRemaining.set(s.id, s.supply));

  const allocation: { source: string; user: string; volume: number; cost: number }[] = [];
  const userAllocated = new Map<string, number>();
  users.forEach(u => userAllocated.set(u.id, 0));

  const notes: string[] = [];

  for (const user of sortedUsers) {
    let remainingDemand = user.demand;

    // 按成本从低到高排序可用水源
    const availableSources = sources
      .filter(s => sourceRemaining.get(s.id)! > 0 && s.quality <= user.maxQuality)
      .sort((a, b) => a.cost - b.cost);

    for (const source of availableSources) {
      if (remainingDemand <= 0) break;
      const available = sourceRemaining.get(source.id)!;
      const allocated = Math.min(remainingDemand, available);

      if (allocated > 0) {
        allocation.push({
          source: source.name,
          user: user.name,
          volume: +allocated.toFixed(0),
          cost: +(allocated * source.cost).toFixed(0),
        });
        sourceRemaining.set(source.id, available - allocated);
        userAllocated.set(user.id, userAllocated.get(user.id)! + allocated);
        remainingDemand -= allocated;
      }
    }

    // 检查最低保障
    const allocated = userAllocated.get(user.id)!;
    if (allocated < user.minSupply) {
      notes.push(`${user.name}未达到最低保障量(${user.minSupply}万m³)，缺口${(user.minSupply - allocated).toFixed(0)}万m³`);
    }
  }

  const totalAllocated = allocation.reduce((s, a) => s + a.volume, 0);
  const totalCost = allocation.reduce((s, a) => s + a.cost, 0);
  const totalDemand = users.reduce((s, u) => s + u.demand, 0);

  const sourceRemainder = sources.map(s => ({
    source: s.name,
    remainder: +(sourceRemaining.get(s.id) ?? 0).toFixed(0),
    utilization: +((1 - (sourceRemaining.get(s.id) ?? 0) / s.supply) * 100).toFixed(1),
  }));

  const userSatisfaction = users.map(u => {
    const allocated = userAllocated.get(u.id) ?? 0;
    return {
      user: u.name,
      allocated: +allocated.toFixed(0),
      demand: u.demand,
      satisfaction: +((allocated / u.demand) * 100).toFixed(1),
    };
  });

  const overallSatisfaction = totalDemand > 0 ? +((totalAllocated / totalDemand) * 100).toFixed(1) : 0;

  if (overallSatisfaction < 80) {
    notes.push(`整体满足率${overallSatisfaction}%低于80%，建议增加外调水或再生水供给`);
  }
  if (overallSatisfaction >= 100) {
    notes.push('水资源配置满足所有用户需求，可考虑优化成本结构');
  }

  return {
    allocation,
    sourceRemainder,
    userSatisfaction,
    totalAllocated: +totalAllocated.toFixed(0),
    totalCost: +totalCost.toFixed(0),
    totalDemand,
    overallSatisfaction,
    notes,
  };
}

// ═══════════════════════════════════════════════════════════════
// 2. 压采方案评估
// ═══════════════════════════════════════════════════════════════

export interface ReductionPlan {
  /** 阶段名称 */
  phase: string;
  /** 年份范围 */
  yearRange: string;
  /** 当前开采量 (万m³/yr) */
  currentExtraction: number;
  /** 目标开采量 (万m³/yr) */
  targetExtraction: number;
  /** 替代水源供水量 (万m³/yr) */
  alternativeSupply: number;
  /** 替代水源类型 */
  alternativeTypes: string[];
  /** 单方替代成本 (元/m³) */
  alternativeCost: number;
  /** 生态补水量的影响 */
  ecologicalWater: number;
}

export interface ReductionResult {
  /** 各阶段压采量 */
  phaseResults: {
    phase: string;
    yearRange: string;
    reduction: number;
    reductionRate: number;
    alternativeVolume: number;
    alternativeCost: number;
    gap: number;
    ecologicalBenefit: number;
    assessment: string;
  }[];
  /** 总压采量 */
  totalReduction: number;
  /** 总压采率 */
  totalReductionRate: number;
  /** 总替代水量 */
  totalAlternative: number;
  /** 总替代成本 */
  totalAlternativeCost: number;
  /** 总缺口 */
  totalGap: number;
  /** 生态效益评分 */
  ecologicalScore: number;
  /** 经济可行性评分 */
  economicScore: number;
  /** 综合评分 */
  overallScore: number;
  /** 建议 */
  recommendations: string[];
}

export function calcReductionPlan(plans: ReductionPlan[]): ReductionResult {
  const phaseResults = plans.map(p => {
    const reduction = p.currentExtraction - p.targetExtraction;
    const reductionRate = p.currentExtraction > 0 ? (reduction / p.currentExtraction) * 100 : 0;
    const alternativeVolume = p.alternativeSupply;
    const alternativeCost = alternativeVolume * p.alternativeCost;
    const gap = reduction - alternativeVolume;
    const ecologicalBenefit = p.ecologicalWater;

    let assessment: string;
    if (gap <= 0 && reductionRate >= 20) assessment = '目标可达，替代水源充足';
    else if (gap <= 0) assessment = '目标可达，但压采力度可加大';
    else if (gap <= reduction * 0.2) assessment = '基本可达，存在小幅缺口';
    else if (gap <= reduction * 0.4) assessment = '存在缺口，需增加替代水源';
    else assessment = '缺口较大，需调整压采目标';

    return {
      phase: p.phase,
      yearRange: p.yearRange,
      reduction: +reduction.toFixed(0),
      reductionRate: +reductionRate.toFixed(1),
      alternativeVolume: +alternativeVolume.toFixed(0),
      alternativeCost: +alternativeCost.toFixed(0),
      gap: +gap.toFixed(0),
      ecologicalBenefit: +ecologicalBenefit.toFixed(0),
      assessment,
    };
  });

  const totalReduction = phaseResults.reduce((s, p) => s + p.reduction, 0);
  const totalAlternative = phaseResults.reduce((s, p) => s + p.alternativeVolume, 0);
  const totalAlternativeCost = phaseResults.reduce((s, p) => s + p.alternativeCost, 0);
  const totalGap = phaseResults.reduce((s, p) => s + Math.max(0, p.gap), 0);
  const firstCurrent = plans[0]?.currentExtraction ?? 1;
  const lastTarget = plans[plans.length - 1]?.targetExtraction ?? 0;
  const totalReductionRate = firstCurrent > 0 ? ((firstCurrent - lastTarget) / firstCurrent) * 100 : 0;

  // 生态效益评分(0-100)
  const ecologicalScore = clamp(totalGap <= 0 ? 90 : Math.max(30, 90 - totalGap / firstCurrent * 200));

  // 经济可行性评分(成本越低越好)
  const avgCost = totalAlternative > 0 ? totalAlternativeCost / totalAlternative : 0;
  const economicScore = clamp(avgCost < 3 ? 90 : avgCost < 5 ? 70 : avgCost < 8 ? 50 : 30);

  // 综合评分
  const overallScore = clamp(ecologicalScore * 0.6 + economicScore * 0.4);

  const recommendations: string[] = [];
  if (totalGap > 0) recommendations.push(`总缺口${totalGap.toFixed(0)}万m³/yr，需新增替代水源或调整压采节奏`);
  if (avgCost > 5) recommendations.push(`替代水成本较高(${avgCost.toFixed(1)}元/m³)，建议增加低成本水源(如再生水)比例`);
  if (totalReductionRate < 30) recommendations.push('压采力度不足，建议提高目标');
  if (ecologicalScore >= 80) recommendations.push('生态效益显著，维持当前方案');
  if (economicScore < 50) recommendations.push('经济可行性偏低，需优化替代水源结构');
  if (recommendations.length === 0) recommendations.push('压采方案整体可行，按计划推进');

  return {
    phaseResults,
    totalReduction: +totalReduction.toFixed(0),
    totalReductionRate: +totalReductionRate.toFixed(1),
    totalAlternative: +totalAlternative.toFixed(0),
    totalAlternativeCost: +totalAlternativeCost.toFixed(0),
    totalGap: +totalGap.toFixed(0),
    ecologicalScore: +ecologicalScore.toFixed(0),
    economicScore: +economicScore.toFixed(0),
    overallScore: +overallScore.toFixed(0),
    recommendations,
  };
}

// ═══════════════════════════════════════════════════════════════
// 3. 生态水位保障
// ═══════════════════════════════════════════════════════════════

export interface EcoLevelInput {
  /** 生态水位埋深阈值 (m) — 超过此值视为不达标 */
  thresholdDepth: number;
  /** 当前水位埋深 (m) */
  currentDepth: number;
  /** 目标水位埋深 (m) */
  targetDepth: number;
  /** 监测井数 */
  monitoringWells: number;
  /** 当前达标井数 */
  compliantWells: number;
  /** 年均回补量 (万m³/yr) */
  annualRecharge: number;
  /** 年均开采量 (万m³/yr) */
  annualExtraction: number;
  /** 含水层类型 */
  aquiferType: '浅层' | '深层';
}

export interface EcoLevelResult {
  /** 达标率 */
  complianceRate: number;
  /** 水位差距 */
  depthGap: number;
  /** 回补-开采比 */
  rechargeExtractionRatio: number;
  /** 达标预测年限 */
  estimatedYears: number;
  /** 保障措施评分 */
  measureScore: number;
  /** 综合保障评分 */
  overallScore: number;
  /** 保障等级 */
  level: string;
  /** 保障措施建议 */
  measures: { measure: string; priority: string; effect: string; timeline: string }[];
  /** 评价详情 */
  details: { indicator: string; value: string; score: number; assessment: string }[];
}

export function calcEcoLevel(input: EcoLevelInput): EcoLevelResult {
  const complianceRate = input.monitoringWells > 0 ? (input.compliantWells / input.monitoringWells) * 100 : 0;
  const depthGap = input.currentDepth - input.targetDepth;
  const rechargeExtractionRatio = input.annualExtraction > 0 ? input.annualRecharge / input.annualExtraction : 0;

  // 达标率评分(0-100)
  const complianceScore = clamp(complianceRate);

  // 水位差距评分
  let depthScore: number;
  if (depthGap <= 0) depthScore = 100;
  else if (depthGap < 1) depthScore = 80;
  else if (depthGap < 3) depthScore = 60;
  else if (depthGap < 5) depthScore = 40;
  else depthScore = 20;

  // 补采比评分
  let ratioScore: number;
  if (rechargeExtractionRatio >= 1.0) ratioScore = 90;
  else if (rechargeExtractionRatio >= 0.7) ratioScore = 70;
  else if (rechargeExtractionRatio >= 0.5) ratioScore = 50;
  else ratioScore = 30;

  // 预测达标年限（假设每年水位恢复速率）
  const annualRecoveryRate = depthGap > 0 && rechargeExtractionRatio > 0
    ? Math.max(0.1, (rechargeExtractionRatio - 0.5) * 2)
    : 0;
  const estimatedYears = depthGap > 0 && annualRecoveryRate > 0
    ? Math.ceil(depthGap / annualRecoveryRate)
    : 0;

  // 深层水加权
  const deepFactor = input.aquiferType === '深层' ? 0.85 : 1.0;

  const measureScore = clamp((complianceScore * 0.35 + depthScore * 0.35 + ratioScore * 0.30) * deepFactor);
  const overallScore = measureScore;

  let level: string;
  if (overallScore >= 80) level = '优 — 生态水位保障良好';
  else if (overallScore >= 60) level = '良 — 基本满足生态水位需求';
  else if (overallScore >= 40) level = '中 — 需加强回补和压采';
  else level = '差 — 生态水位严重不足';

  const measures: { measure: string; priority: string; effect: string; timeline: string }[] = [];
  if (complianceRate < 80) {
    measures.push({ measure: '加密生态水位监测网络', priority: '高', effect: '提高达标率监控精度', timeline: '1年内' });
  }
  if (depthGap > 2) {
    measures.push({ measure: '增加生态补水水源', priority: '高', effect: `每年回补${Math.ceil(depthGap * 0.5 * 100)}万m³`, timeline: '2-3年' });
  }
  if (rechargeExtractionRatio < 0.7) {
    measures.push({ measure: '压减该区域开采量', priority: '高', effect: `年压采${Math.ceil((0.8 - rechargeExtractionRatio) * input.annualExtraction)}万m³`, timeline: '1-2年' });
  }
  if (input.aquiferType === '深层') {
    measures.push({ measure: '深层水回灌试验', priority: '中', effect: '探索深层水恢复路径', timeline: '3-5年' });
  }
  measures.push({ measure: '建立生态水位预警机制', priority: '中', effect: '及时发现水位异常', timeline: '1年内' });

  const details = [
    { indicator: '监测井达标率', value: `${complianceRate.toFixed(1)}% (${input.compliantWells}/${input.monitoringWells})`, score: +complianceScore.toFixed(0), assessment: complianceRate >= 80 ? '达标良好' : '需提升' },
    { indicator: '水位差距', value: `${depthGap.toFixed(1)} m (当前${input.currentDepth} → 目标${input.targetDepth})`, score: depthScore, assessment: depthGap <= 0 ? '已达标' : depthGap < 3 ? '差距较小' : '差距较大' },
    { indicator: '回补-开采比', value: `${rechargeExtractionRatio.toFixed(2)} (回补${input.annualRecharge}/开采${input.annualExtraction})`, score: ratioScore, assessment: rechargeExtractionRatio >= 1 ? '正平衡' : '负平衡' },
    { indicator: '预测达标年限', value: estimatedYears > 0 ? `${estimatedYears}年` : '已达标', score: estimatedYears > 5 ? 30 : estimatedYears > 3 ? 60 : 90, assessment: estimatedYears > 5 ? '恢复缓慢' : '恢复可期' },
  ];

  return {
    complianceRate: +complianceRate.toFixed(1),
    depthGap: +depthGap.toFixed(1),
    rechargeExtractionRatio: +rechargeExtractionRatio.toFixed(3),
    estimatedYears,
    measureScore: +measureScore.toFixed(0),
    overallScore: +overallScore.toFixed(0),
    level,
    measures,
    details,
  };
}

// ═══════════════════════════════════════════════════════════════
// 4. 风险预警决策
// ═══════════════════════════════════════════════════════════════

export interface WarningInput {
  /** 当前水位埋深 (m) */
  currentDepth: number;
  /** 警戒水位埋深 (m) — 黄色预警 */
  yellowThreshold: number;
  /** 红色预警水位埋深 (m) */
  redThreshold: number;
  /** 极限水位埋深 (m) — 紧急预警 */
  emergencyThreshold: number;
  /** 水位月变化率 (m/月) */
  monthlyChangeRate: number;
  /** Cl⁻浓度 (mg/L) */
  chloride: number;
  /** Cl⁻月变化率 (mg/L/月) */
  chlorideRate: number;
  /** 区域开采状态 */
  extractionStatus: '正常' | '超采' | '严重超采';
}

export interface WarningResult {
  /** 水位预警等级 */
  waterLevelWarning: '蓝色' | '黄色' | '橙色' | '红色';
  /** 水质预警等级 */
  waterQualityWarning: '蓝色' | '黄色' | '橙色' | '红色';
  /** 综合预警等级 */
  overallWarning: '蓝色' | '黄色' | '橙色' | '红色';
  /** 预警信号 */
  warningSignal: string;
  /** 响应措施 */
  responseMeasures: { level: string; measure: string; responsible: string; timeline: string }[];
  /** 评价详情 */
  details: { indicator: string; value: string; warning: string; assessment: string }[];
}

const WARNING_LEVELS = ['蓝色', '黄色', '橙色', '红色'] as const;
type WarningLevel = typeof WARNING_LEVELS[number];

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

// ═══════════════════════════════════════════════════════════════
// 5. 综合决策评价（多目标加权）
// ═══════════════════════════════════════════════════════════════

export interface DecisionOption {
  /** 方案名称 */
  name: string;
  /** 方案描述 */
  description: string;
  /** 水资源保障率 (%) */
  waterSecurity: number;
  /** 生态效益评分 (0-100) */
  ecologicalBenefit: number;
  /** 经济可行性评分 (0-100) */
  economicFeasibility: number;
  /** 技术可行性评分 (0-100) */
  technicalFeasibility: number;
  /** 社会可接受度 (0-100) */
  socialAcceptance: number;
  /** 实施周期 (年) */
  implementationPeriod: number;
  /** 投资估算 (万元) */
  investment: number;
}

export interface DecisionResult {
  /** 方案排序 */
  rankedOptions: {
    name: string;
    description: string;
    scores: { criterion: string; score: number; weight: number }[];
    totalScore: number;
    rank: number;
    investment: number;
    period: number;
    recommendation: string;
  }[];
  /** 最优方案 */
  bestOption: string;
  /** 权重说明 */
  weights: { criterion: string; weight: number; description: string }[];
  /** 综合建议 */
  recommendations: string[];
}

export function calcDecisionEvaluation(options: DecisionOption[]): DecisionResult {
  // 权重设置
  const weights = [
    { criterion: '水资源保障', weight: 0.30, key: 'waterSecurity' as const },
    { criterion: '生态效益', weight: 0.25, key: 'ecologicalBenefit' as const },
    { criterion: '经济可行性', weight: 0.20, key: 'economicFeasibility' as const },
    { criterion: '技术可行性', weight: 0.15, key: 'technicalFeasibility' as const },
    { criterion: '社会可接受度', weight: 0.10, key: 'socialAcceptance' as const },
  ];

  const rankedOptions = options.map(opt => {
    const scores = weights.map(w => ({
      criterion: w.criterion,
      score: opt[w.key],
      weight: w.weight,
    }));

    const totalScore = scores.reduce((s, sc) => s + sc.score * sc.weight, 0);

    // 投资效率
    const efficiency = opt.investment > 0 ? totalScore / (opt.investment / 10000) : totalScore;

    let recommendation: string;
    if (totalScore >= 80) recommendation = '强烈推荐 — 综合优势显著';
    else if (totalScore >= 70) recommendation = '推荐 — 综合表现良好';
    else if (totalScore >= 60) recommendation = '可考虑 — 部分指标需优化';
    else recommendation = '不推荐 — 综合表现欠佳';

    if (opt.investment > 50000 && efficiency < 0.01) {
      recommendation += '（投资偏高）';
    }
    if (opt.implementationPeriod > 5) {
      recommendation += '（周期较长）';
    }

    return {
      name: opt.name,
      description: opt.description,
      scores,
      totalScore: +totalScore.toFixed(1),
      rank: 0,
      investment: opt.investment,
      period: opt.implementationPeriod,
      recommendation,
    };
  });

  // 排序
  rankedOptions.sort((a, b) => b.totalScore - a.totalScore);
  rankedOptions.forEach((opt, i) => { opt.rank = i + 1; });

  const bestOption = rankedOptions[0]?.name ?? '';

  const recommendations: string[] = [];
  if (rankedOptions.length > 0) {
    const best = rankedOptions[0];
    recommendations.push(`推荐方案: ${best.name}（综合评分${best.totalScore}）— ${best.recommendation}`);

    if (rankedOptions.length > 1) {
      const second = rankedOptions[1];
      if (second.totalScore >= best.totalScore * 0.95) {
        recommendations.push(`备选方案: ${second.name}（评分${second.totalScore}，与最优方案差距<5%）`);
      }
    }

    // 检查是否有短板
    const bestScores = rankedOptions[0].scores;
    const weakest = bestScores.reduce((min, s) => s.score < min.score ? s : min);
    if (weakest.score < 60) {
      recommendations.push(`最优方案在"${weakest.criterion}"方面存在短板(评分${weakest.score})，建议针对性加强`);
    }

    // 投资比较
    if (rankedOptions.length >= 2) {
      const cheapest = [...rankedOptions].sort((a, b) => a.investment - b.investment)[0];
      if (cheapest.rank > 1 && cheapest.totalScore >= rankedOptions[0].totalScore * 0.9) {
        recommendations.push(`${cheapest.name}投资更低(${cheapest.investment}万元)且评分接近，可作为经济型选择`);
      }
    }
  }

  return {
    rankedOptions,
    bestOption,
    weights: weights.map(w => ({ criterion: w.criterion, weight: w.weight, description: weightDescriptions[w.criterion] })),
    recommendations,
  };
}

const weightDescriptions: Record<string, string> = {
  '水资源保障': '保障供水安全和用水需求满足程度',
  '生态效益': '对地下水位恢复、水质改善的生态贡献',
  '经济可行性': '投资成本合理性和经济回报率',
  '技术可行性': '技术成熟度和实施难度',
  '社会可接受度': '公众接受度和政策协调性',
};

// ═══════════════════════════════════════════════════════════════
// 预设方案
// ═══════════════════════════════════════════════════════════════

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
