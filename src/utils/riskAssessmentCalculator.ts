/**
 * B-31 地下水风险评估计算器引擎
 *
 * 五大风险评估模块：
 *  1. 污染风险 — 改进DRASTIC模型(7因子) + 土地利用叠加
 *  2. 超采风险 — 开采强度指数 + 水位下降速率 + 补亏比
 *  3. 沉降风险 — 压缩层厚度 + 水位降幅 + 地层压缩性
 *  4. 海水入侵风险 — 距海距离 + Cl⁻浓度变化 + 水力梯度
 *  5. 综合风险评价 — AHP权重 + 风险矩阵 + 分级
 */

// ═══════════════════════════════════════════════════════════════
// 通用类型与工具
// ═══════════════════════════════════════════════════════════════

export type RiskLevel = '极低' | '低' | '中等' | '高' | '极高';

const RISK_SCORES: Record<RiskLevel, number> = {
  '极低': 1, '低': 2, '中等': 3, '高': 4, '极高': 5,
};

function scoreToLevel(score: number): RiskLevel {
  if (score < 1.5) return '极低';
  if (score < 2.5) return '低';
  if (score < 3.5) return '中等';
  if (score < 4.5) return '高';
  return '极高';
}

function clamp(v: number, min = 1, max = 10): number {
  return Math.max(min, Math.min(max, v));
}

// ═══════════════════════════════════════════════════════════════
// 1. 污染风险评价（改进DRASTIC）
// ═══════════════════════════════════════════════════════════════

export interface DrasticInput {
  /** D - 地下水埋深 (m) */
  depthToWater: number;
  /** R - 净补给量 (mm/yr) */
  netRecharge: number;
  /** A - 含水层介质类型 */
  aquiferMedia: AquiferMedia;
  /** S - 土壤介质类型 */
  soilMedia: SoilMedia;
  /** T - 地形坡度 (%) */
  topography: number;
  /** I - 包气带影响 */
  vadoseZone: VadoseZone;
  /** C - 含水层渗透系数 (m/d) */
  conductivity: number;
  /** 土地利用类型（叠加因子） */
  landUse: LandUse;
}

export type AquiferMedia = '页岩' | '变质岩' | '砂岩' | '灰岩' | '砂砾石' | '玄武岩';
export type SoilMedia = '黏土' | '粉质黏土' | '粉土' | '砂土' | '砾石' | '薄层/缺失';
export type VadoseZone = '黏土' | '粉质黏土' | '粉土' | '砂' | '砂砾' | '灰岩' | '砂岩';
export type LandUse = '林地' | '草地' | '耕地' | '建设用地' | '工业区' | '垃圾填埋场';

const AQUIFER_RATING: Record<AquiferMedia, number> = {
  '页岩': 2, '变质岩': 3, '砂岩': 6, '灰岩': 7, '砂砾石': 9, '玄武岩': 8,
};

const SOIL_RATING: Record<SoilMedia, number> = {
  '黏土': 2, '粉质黏土': 3, '粉土': 5, '砂土': 7, '砾石': 9, '薄层/缺失': 10,
};

const VADOSE_RATING: Record<VadoseZone, number> = {
  '黏土': 2, '粉质黏土': 4, '粉土': 5, '砂': 7, '砂砾': 8, '灰岩': 8, '砂岩': 6,
};

const LANDUSE_FACTOR: Record<LandUse, number> = {
  '林地': 0.7, '草地': 0.8, '耕地': 1.2, '建设用地': 1.5, '工业区': 2.0, '垃圾填埋场': 2.5,
};

// DRASTIC标准权重
const DRASTIC_WEIGHTS = { D: 0.22, R: 0.17, A: 0.13, S: 0.09, T: 0.06, I: 0.17, C: 0.16 };

function depthRating(d: number): number {
  if (d < 1.5) return 10;
  if (d < 3) return 9;
  if (d < 5) return 8;
  if (d < 8) return 7;
  if (d < 12) return 5;
  if (d < 18) return 3;
  if (d < 25) return 2;
  return 1;
}

function rechargeRating(r: number): number {
  if (r < 25) return 1;
  if (r < 50) return 3;
  if (r < 100) return 6;
  if (r < 150) return 8;
  if (r < 200) return 9;
  return 10;
}

function topoRating(t: number): number {
  if (t < 2) return 10;
  if (t < 6) return 9;
  if (t < 12) return 7;
  if (t < 18) return 5;
  if (t < 25) return 3;
  return 1;
}

function conductivityRating(c: number): number {
  if (c < 5) return 1;
  if (c < 10) return 2;
  if (c < 30) return 4;
  if (c < 50) return 6;
  if (c < 100) return 8;
  if (c < 300) return 9;
  return 10;
}

export interface PollutionRiskResult {
  /** DRASTIC原始指数 */
  drasticIndex: number;
  /** 土地利用修正后指数 */
  adjustedIndex: number;
  /** 风险等级 */
  riskLevel: RiskLevel;
  /** 各因子评分 */
  factorRatings: { factor: string; symbol: string; rating: number; weight: number; contribution: number }[];
  /** 主要风险因子 */
  keyRiskFactors: string[];
  /** 防护建议 */
  recommendations: string[];
}

export function calcPollutionRisk(input: DrasticInput): PollutionRiskResult {
  const dR = depthRating(input.depthToWater);
  const rR = rechargeRating(input.netRecharge);
  const aR = AQUIFER_RATING[input.aquiferMedia];
  const sR = SOIL_RATING[input.soilMedia];
  const tR = topoRating(input.topography);
  const iR = VADOSE_RATING[input.vadoseZone];
  const cR = conductivityRating(input.conductivity);

  const factorRatings = [
    { factor: '地下水埋深', symbol: 'D', rating: dR, weight: DRASTIC_WEIGHTS.D, contribution: dR * DRASTIC_WEIGHTS.D },
    { factor: '净补给量', symbol: 'R', rating: rR, weight: DRASTIC_WEIGHTS.R, contribution: rR * DRASTIC_WEIGHTS.R },
    { factor: '含水层介质', symbol: 'A', rating: aR, weight: DRASTIC_WEIGHTS.A, contribution: aR * DRASTIC_WEIGHTS.A },
    { factor: '土壤介质', symbol: 'S', rating: sR, weight: DRASTIC_WEIGHTS.S, contribution: sR * DRASTIC_WEIGHTS.S },
    { factor: '地形坡度', symbol: 'T', rating: tR, weight: DRASTIC_WEIGHTS.T, contribution: tR * DRASTIC_WEIGHTS.T },
    { factor: '包气带影响', symbol: 'I', rating: iR, weight: DRASTIC_WEIGHTS.I, contribution: iR * DRASTIC_WEIGHTS.I },
    { factor: '渗透系数', symbol: 'C', rating: cR, weight: DRASTIC_WEIGHTS.C, contribution: cR * DRASTIC_WEIGHTS.C },
  ];

  const drasticIndex = factorRatings.reduce((s, f) => s + f.contribution, 0);
  const landUseFactor = LANDUSE_FACTOR[input.landUse];
  const adjustedIndex = drasticIndex * landUseFactor;

  // 归一化到1-5分
  const normalizedScore = clamp((adjustedIndex / 23) * 5, 1, 5);
  const riskLevel = scoreToLevel(normalizedScore);

  const keyRiskFactors = factorRatings
    .filter(f => f.rating >= 7)
    .sort((a, b) => b.contribution - a.contribution)
    .map(f => `${f.factor}(${f.symbol}=${f.rating})`);

  const recommendations: string[] = [];
  if (dR >= 7) recommendations.push('地下水埋深浅，污染物易到达含水层，建议加强源头控制');
  if (rR >= 7) recommendations.push('净补给量大，污染物迁移快，建议减少地表污染源');
  if (aR >= 7 || cR >= 7) recommendations.push('含水层渗透性强，污染物扩散范围大，需设置隔离带');
  if (sR >= 7) recommendations.push('土壤防护能力差，建议铺设防渗层');
  if (landUseFactor >= 1.5) recommendations.push('土地利用类型风险高，建议加强工业废水和固废管理');
  if (recommendations.length === 0) recommendations.push('整体污染风险较低，维持现有防护措施');

  return {
    drasticIndex: +drasticIndex.toFixed(2),
    adjustedIndex: +adjustedIndex.toFixed(2),
    riskLevel,
    factorRatings: factorRatings.map(f => ({ ...f, contribution: +f.contribution.toFixed(3) })),
    keyRiskFactors,
    recommendations,
  };
}

// ═══════════════════════════════════════════════════════════════
// 2. 超采风险评价
// ═══════════════════════════════════════════════════════════════

export interface OverexploitationInput {
  /** 年开采量 (万m³/yr) */
  extraction: number;
  /** 年补给量 (万m³/yr) */
  recharge: number;
  /** 近5年水位年均下降速率 (m/yr) */
  waterLevelDecline: number;
  /** 含水层类型 */
  aquiferType: '浅层孔隙水' | '深层孔隙水' | '岩溶水' | '裂隙水';
  /** 可开采量 (万m³/yr) */
  allowableExtraction: number;
}

export interface OverexploitationResult {
  /** 开采强度指数 = 开采量/可开采量 */
  extractionIntensity: number;
  /** 补亏比 = 开采量/补给量 */
  exploitationRatio: number;
  /** 水位下降风险评分 */
  declineRiskScore: number;
  /** 综合超采风险评分 (1-5) */
  overallScore: number;
  /** 风险等级 */
  riskLevel: RiskLevel;
  /** 评价详情 */
  details: { indicator: string; value: string; score: number; weight: number; assessment: string }[];
  /** 建议 */
  recommendations: string[];
}

export function calcOverexploitationRisk(input: OverexploitationInput): OverexploitationResult {
  const extractionIntensity = input.allowableExtraction > 0 ? input.extraction / input.allowableExtraction : 0;
  const exploitationRatio = input.recharge > 0 ? input.extraction / input.recharge : 0;

  // 开采强度评分(1-5)
  let intensityScore: number;
  if (extractionIntensity < 0.8) intensityScore = 1;
  else if (extractionIntensity < 1.0) intensityScore = 2;
  else if (extractionIntensity < 1.2) intensityScore = 3;
  else if (extractionIntensity < 1.5) intensityScore = 4;
  else intensityScore = 5;

  // 补亏比评分(1-5)
  let ratioScore: number;
  if (exploitationRatio < 0.8) ratioScore = 1;
  else if (exploitationRatio < 1.0) ratioScore = 2;
  else if (exploitationRatio < 1.2) ratioScore = 3;
  else if (exploitationRatio < 1.5) ratioScore = 4;
  else ratioScore = 5;

  // 水位下降评分(1-5)
  let declineScore: number;
  if (input.waterLevelDecline < 0.2) declineScore = 1;
  else if (input.waterLevelDecline < 0.5) declineScore = 2;
  else if (input.waterLevelDecline < 1.0) declineScore = 3;
  else if (input.waterLevelDecline < 2.0) declineScore = 4;
  else declineScore = 5;

  // 深层水额外加权
  const deepWeight = input.aquiferType === '深层孔隙水' ? 1.2 : 1.0;

  // 综合评分（权重: 开采强度40% + 补亏比30% + 水位下降30%）
  const overallScore = clamp((intensityScore * 0.4 + ratioScore * 0.3 + declineScore * 0.3) * deepWeight, 1, 5);
  const riskLevel = scoreToLevel(overallScore);

  const details = [
    {
      indicator: '开采强度指数',
      value: `${extractionIntensity.toFixed(2)}（开采量${input.extraction}/${input.allowableExtraction}万m³）`,
      score: intensityScore,
      weight: 0.4,
      assessment: extractionIntensity > 1 ? '超采' : '未超采',
    },
    {
      indicator: '补亏比',
      value: `${exploitationRatio.toFixed(2)}（开采量${input.extraction}/${input.recharge}万m³）`,
      score: ratioScore,
      weight: 0.3,
      assessment: exploitationRatio > 1 ? '补给不足' : '补给充足',
    },
    {
      indicator: '水位下降速率',
      value: `${input.waterLevelDecline} m/yr`,
      score: declineScore,
      weight: 0.3,
      assessment: input.waterLevelDecline > 1 ? '快速下降' : input.waterLevelDecline > 0.5 ? '缓慢下降' : '基本稳定',
    },
  ];

  const recommendations: string[] = [];
  if (extractionIntensity > 1) recommendations.push(`开采量超出可开采量${((extractionIntensity - 1) * 100).toFixed(0)}%，建议压采${(input.extraction - input.allowableExtraction).toFixed(0)}万m³/yr`);
  if (exploitationRatio > 1) recommendations.push('开采量超过补给量，长期不可持续，需寻找替代水源');
  if (input.waterLevelDecline > 1) recommendations.push('水位下降速率过快，建议加密监测并实施回补');
  if (input.aquiferType === '深层孔隙水') recommendations.push('深层地下水补给困难，超采后果严重，建议优先压减深层开采');
  if (recommendations.length === 0) recommendations.push('开采状况合理，维持现有管理措施');

  return {
    extractionIntensity: +extractionIntensity.toFixed(3),
    exploitationRatio: +exploitationRatio.toFixed(3),
    declineRiskScore: declineScore,
    overallScore: +overallScore.toFixed(2),
    riskLevel,
    details,
    recommendations,
  };
}

// ═══════════════════════════════════════════════════════════════
// 3. 地面沉降风险评价
// ═══════════════════════════════════════════════════════════════

export interface SubsidenceRiskInput {
  /** 压缩层总厚度 (m) */
  compressibleLayerThickness: number;
  /** 水位累计降幅 (m) */
  waterLevelDecline: number;
  /** 压缩层类型 */
  layerType: '黏土' | '粉质黏土' | '粉土' | '砂';
  /** 地层结构 */
  structure: '单层' | '多层互层' | '厚层黏土';
  /** 历史累计沉降量 (mm) */
  historicalSubsidence: number;
  /** 当前沉降速率 (mm/yr) */
  currentRate: number;
}

const LAYER_COMPRESSIBILITY: Record<string, number> = {
  '黏土': 0.9, '粉质黏土': 0.7, '粉土': 0.5, '砂': 0.3,
};

const STRUCTURE_FACTOR: Record<string, number> = {
  '单层': 0.8, '多层互层': 1.0, '厚层黏土': 1.2,
};

export interface SubsidenceRiskResult {
  /** 压缩指数评分 */
  compressibilityScore: number;
  /** 水位降幅评分 */
  declineScore: number;
  /** 历史沉降评分 */
  historicalScore: number;
  /** 速率评分 */
  rateScore: number;
  /** 综合评分 */
  overallScore: number;
  /** 风险等级 */
  riskLevel: RiskLevel;
  /** 预测沉降量 */
  predictedSubsidence: number;
  /** 评价详情 */
  details: { indicator: string; value: string; score: number; assessment: string }[];
  /** 建议 */
  recommendations: string[];
}

export function calcSubsidenceRisk(input: SubsidenceRiskInput): SubsidenceRiskResult {
  // 压缩层厚度评分(1-5)
  let thickScore: number;
  if (input.compressibleLayerThickness < 10) thickScore = 1;
  else if (input.compressibleLayerThickness < 30) thickScore = 2;
  else if (input.compressibleLayerThickness < 60) thickScore = 3;
  else if (input.compressibleLayerThickness < 100) thickScore = 4;
  else thickScore = 5;

  const compressibility = LAYER_COMPRESSIBILITY[input.layerType] * STRUCTURE_FACTOR[input.structure];
  const compressibilityScore = clamp(thickScore * compressibility, 1, 5);

  // 水位降幅评分
  let declineScore: number;
  if (input.waterLevelDecline < 5) declineScore = 1;
  else if (input.waterLevelDecline < 15) declineScore = 2;
  else if (input.waterLevelDecline < 30) declineScore = 3;
  else if (input.waterLevelDecline < 50) declineScore = 4;
  else declineScore = 5;

  // 历史沉降评分
  let historicalScore: number;
  if (input.historicalSubsidence < 100) historicalScore = 1;
  else if (input.historicalSubsidence < 300) historicalScore = 2;
  else if (input.historicalSubsidence < 600) historicalScore = 3;
  else if (input.historicalSubsidence < 1000) historicalScore = 4;
  else historicalScore = 5;

  // 当前速率评分
  let rateScore: number;
  if (input.currentRate < 5) rateScore = 1;
  else if (input.currentRate < 15) rateScore = 2;
  else if (input.currentRate < 30) rateScore = 3;
  else if (input.currentRate < 50) rateScore = 4;
  else rateScore = 5;

  // 综合(压缩性30% + 水位降幅25% + 历史25% + 速率20%)
  const overallScore = clamp(
    compressibilityScore * 0.30 + declineScore * 0.25 + historicalScore * 0.25 + rateScore * 0.20,
    1, 5,
  );
  const riskLevel = scoreToLevel(overallScore);

  // 简化预测: 沉降量 ≈ 压缩层厚度 × 应变 × 水位降幅系数
  const strain = compressibility * 0.001 * Math.max(0.5, input.waterLevelDecline / 20);
  const predictedSubsidence = input.compressibleLayerThickness * strain * 1000;

  const details = [
    { indicator: '压缩层条件', value: `${input.compressibleLayerThickness}m / ${input.layerType} / ${input.structure}`, score: +compressibilityScore.toFixed(2), assessment: compressibilityScore >= 3.5 ? '高压缩性' : '中低压缩性' },
    { indicator: '水位累计降幅', value: `${input.waterLevelDecline}m`, score: declineScore, assessment: declineScore >= 4 ? '降幅显著' : '降幅可控' },
    { indicator: '历史累计沉降', value: `${input.historicalSubsidence}mm`, score: historicalScore, assessment: historicalScore >= 4 ? '沉降严重' : '沉降较轻' },
    { indicator: '当前沉降速率', value: `${input.currentRate}mm/yr`, score: rateScore, assessment: rateScore >= 4 ? '沉降活跃' : '沉降趋缓' },
  ];

  const recommendations: string[] = [];
  if (rateScore >= 4) recommendations.push('沉降速率较高，建议加密InSAR监测并设置预警阈值');
  if (declineScore >= 4) recommendations.push('水位降幅大是主要诱因，需优先控制地下水开采');
  if (compressibilityScore >= 3.5) recommendations.push('地层压缩性高，即使水位恢复也可能存在残余沉降');
  if (overallScore >= 3.5) recommendations.push('建议建立沉降分区管控方案，限制高危险区工程建设');
  if (recommendations.length === 0) recommendations.push('沉降风险较低，维持常规监测');

  return {
    compressibilityScore: +compressibilityScore.toFixed(2),
    declineScore,
    historicalScore,
    rateScore,
    overallScore: +overallScore.toFixed(2),
    riskLevel,
    predictedSubsidence: +predictedSubsidence.toFixed(0),
    details,
    recommendations,
  };
}

// ═══════════════════════════════════════════════════════════════
// 4. 海水入侵风险评价
// ═══════════════════════════════════════════════════════════════

export interface SeawaterIntrusionInput {
  /** 距海岸线距离 (km) */
  distanceToCoast: number;
  /** 当前Cl⁻浓度 (mg/L) */
  currentChloride: number;
  /** 5年前Cl⁻浓度 (mg/L) */
  previousChloride: number;
  /** 内陆水位标高 (m) */
  inlandWaterLevel: number;
  /** 海平面标高 (m) */
  seaLevel: number;
  /** 含水层渗透系数 (m/d) */
  conductivity: number;
  /** 是否存在咸淡水界面 */
  hasInterface: boolean;
}

export interface SeawaterIntrusionResult {
  /** 距离评分 */
  distanceScore: number;
  /** Cl⁻变化评分 */
  chlorideScore: number;
  /** 水力梯度评分 */
  gradientScore: number;
  /** 侵入程度 */
  intrusionDegree: string;
  /** 综合评分 */
  overallScore: number;
  /** 风险等级 */
  riskLevel: RiskLevel;
  /** 评价详情 */
  details: { indicator: string; value: string; score: number; weight: number; assessment: string }[];
  /** 建议 */
  recommendations: string[];
}

export function calcSeawaterIntrusionRisk(input: SeawaterIntrusionInput): SeawaterIntrusionResult {
  // 距离评分(1-5)
  let distanceScore: number;
  if (input.distanceToCoast < 2) distanceScore = 5;
  else if (input.distanceToCoast < 5) distanceScore = 4;
  else if (input.distanceToCoast < 10) distanceScore = 3;
  else if (input.distanceToCoast < 20) distanceScore = 2;
  else distanceScore = 1;

  // Cl⁻浓度及变化趋势评分
  const chlorideChange = input.currentChloride - input.previousChloride;
  const chlorideRatio = input.previousChloride > 0 ? input.currentChloride / input.previousChloride : 1;
  let chlorideScore: number;
  if (input.currentChloride > 500) chlorideScore = 5;
  else if (input.currentChloride > 250) chlorideScore = 4;
  else if (input.currentChloride > 150) chlorideScore = 3;
  else if (input.currentChloride > 100) chlorideScore = 2;
  else chlorideScore = 1;
  // 趋势加权
  if (chlorideRatio > 1.5) chlorideScore = Math.min(5, chlorideScore + 1);
  if (chlorideRatio < 0.8) chlorideScore = Math.max(1, chlorideScore - 1);

  // 水力梯度评分
  const gradient = input.inlandWaterLevel - input.seaLevel;
  let gradientScore: number;
  if (gradient < 0) gradientScore = 5;
  else if (gradient < 1) gradientScore = 4;
  else if (gradient < 3) gradientScore = 3;
  else if (gradient < 5) gradientScore = 2;
  else gradientScore = 1;

  // 侵入程度判定
  let intrusionDegree: string;
  if (input.currentChloride > 500) intrusionDegree = '严重入侵';
  else if (input.currentChloride > 250) intrusionDegree = '中度入侵';
  else if (input.currentChloride > 150) intrusionDegree = '轻度入侵';
  else if (chlorideChange > 20) intrusionDegree = '入侵趋势';
  else intrusionDegree = '未入侵';

  // 综合(距离30% + Cl⁻35% + 水力梯度35%)
  const overallScore = clamp(
    distanceScore * 0.30 + chlorideScore * 0.35 + gradientScore * 0.35,
    1, 5,
  );
  const riskLevel = scoreToLevel(overallScore);

  const details = [
    { indicator: '距海岸距离', value: `${input.distanceToCoast} km`, score: distanceScore, weight: 0.30, assessment: distanceScore >= 4 ? '近海岸高风险区' : '距海较远' },
    { indicator: 'Cl⁻浓度及趋势', value: `${input.currentChloride} mg/L（变化${chlorideChange >= 0 ? '+' : ''}${chlorideChange.toFixed(0)}）`, score: chlorideScore, weight: 0.35, assessment: intrusionDegree },
    { indicator: '水力梯度', value: `内陆-海面差: ${gradient.toFixed(1)} m`, score: gradientScore, weight: 0.35, assessment: gradient < 0 ? '海水倒灌风险' : gradient < 3 ? '驱动力弱' : '向海排泄' },
  ];

  const recommendations: string[] = [];
  if (gradientScore >= 4) recommendations.push('水力梯度不利，内陆水位低于或接近海平面，需控制开采维持水头');
  if (chlorideScore >= 4) recommendations.push('Cl⁻浓度超标且呈上升趋势，建议建设地下阻水帷幕或注水屏障');
  if (distanceScore >= 4 && input.conductivity > 30) recommendations.push('近海岸且含水层渗透性强，建议建立监测预警带');
  if (input.hasInterface) recommendations.push('已存在咸淡水界面，需定期监测界面迁移方向和速率');
  if (recommendations.length === 0) recommendations.push('海水入侵风险低，维持常规Cl⁻监测');

  return {
    distanceScore,
    chlorideScore,
    gradientScore,
    intrusionDegree,
    overallScore: +overallScore.toFixed(2),
    riskLevel,
    details,
    recommendations,
  };
}

// ═══════════════════════════════════════════════════════════════
// 5. 综合风险评价（AHP权重）
// ═══════════════════════════════════════════════════════════════

export interface ComprehensiveRiskInput {
  /** 各子风险等级 */
  pollutionRisk: RiskLevel;
  overexploitationRisk: RiskLevel;
  subsidenceRisk: RiskLevel;
  seawaterIntrusionRisk: RiskLevel;
}

const AHP_WEIGHTS = {
  pollution: 0.30,
  overexploitation: 0.35,
  subsidence: 0.20,
  seawater: 0.15,
};

export interface ComprehensiveRiskResult {
  /** 综合风险评分 */
  overallScore: number;
  /** 综合风险等级 */
  overallLevel: RiskLevel;
  /** 各风险贡献 */
  riskContributions: { riskType: string; level: RiskLevel; score: number; weight: number; contribution: number; barWidth: number }[];
  /** 风险矩阵等级 */
  matrixLevel: string;
  /** 优先管控顺序 */
  priorityOrder: string[];
  /** 建议 */
  recommendations: string[];
}

export function calcComprehensiveRisk(input: ComprehensiveRiskInput): ComprehensiveRiskResult {
  const items = [
    { riskType: '污染风险', level: input.pollutionRisk, score: RISK_SCORES[input.pollutionRisk], weight: AHP_WEIGHTS.pollution },
    { riskType: '超采风险', level: input.overexploitationRisk, score: RISK_SCORES[input.overexploitationRisk], weight: AHP_WEIGHTS.overexploitation },
    { riskType: '沉降风险', level: input.subsidenceRisk, score: RISK_SCORES[input.subsidenceRisk], weight: AHP_WEIGHTS.subsidence },
    { riskType: '海水入侵', level: input.seawaterIntrusionRisk, score: RISK_SCORES[input.seawaterIntrusionRisk], weight: AHP_WEIGHTS.seawater },
  ];

  const overallScore = items.reduce((s, item) => s + item.score * item.weight, 0);
  const overallLevel = scoreToLevel(overallScore);

  const maxScore = Math.max(...items.map(i => i.score));
  const riskContributions = items.map(item => ({
    ...item,
    contribution: +(item.score * item.weight).toFixed(2),
    barWidth: +(item.score / maxScore * 100).toFixed(0),
  }));

  // 风险矩阵判定
  let matrixLevel: string;
  if (overallScore >= 4.0) matrixLevel = '极高风险 — 需立即启动应急预案';
  else if (overallScore >= 3.0) matrixLevel = '高风险 — 需制定专项治理方案';
  else if (overallScore >= 2.0) matrixLevel = '中等风险 — 需加强监测与管理';
  else matrixLevel = '低风险 — 常规管理即可';

  // 优先管控顺序
  const priorityOrder = [...items].sort((a, b) => b.score - a.score).map(i => i.riskType);

  const recommendations: string[] = [];
  if (overallScore >= 3.5) recommendations.push('综合风险高，建议成立专项治理领导小组，编制综合治理方案');
  if (items[1].score >= 4) recommendations.push('超采风险最为突出，压采是首要任务');
  if (items[0].score >= 4 && items[1].score >= 4) recommendations.push('污染与超采叠加，需协同治理');
  if (items[3].score >= 4) recommendations.push('海水入侵风险高，需建设阻水屏障并控制沿海开采');
  if (items[2].score >= 4) recommendations.push('沉降风险高，需结合InSAR监测建立预警系统');
  if (recommendations.length === 0) recommendations.push('综合风险可控，维持现有管理措施并定期复评');

  return {
    overallScore: +overallScore.toFixed(2),
    overallLevel,
    riskContributions,
    matrixLevel,
    priorityOrder,
    recommendations,
  };
}

// ═══════════════════════════════════════════════════════════════
// 预设评价区域
// ═══════════════════════════════════════════════════════════════

export interface PresetArea {
  name: string;
  description: string;
  pollution: DrasticInput;
  overexploitation: OverexploitationInput;
  subsidence: SubsidenceRiskInput;
  seawater: SeawaterIntrusionInput;
}

export const PRESET_AREAS: PresetArea[] = [
  {
    name: '沧州滨海平原',
    description: '滨海平原区，海水入侵+深层超采+地面沉降多重风险叠加',
    pollution: { depthToWater: 8, netRecharge: 120, aquiferMedia: '砂砾石', soilMedia: '砂土', topography: 1, vadoseZone: '砂', conductivity: 50, landUse: '耕地' },
    overexploitation: { extraction: 8500, recharge: 3200, waterLevelDecline: 1.8, aquiferType: '深层孔隙水', allowableExtraction: 4500 },
    subsidence: { compressibleLayerThickness: 80, waterLevelDecline: 45, layerType: '黏土', structure: '多层互层', historicalSubsidence: 1200, currentRate: 25 },
    seawater: { distanceToCoast: 3, currentChloride: 320, previousChloride: 180, inlandWaterLevel: 2, seaLevel: 0, conductivity: 50, hasInterface: true },
  },
  {
    name: '衡水中部平原',
    description: '中部冲积平原，深层水超采引发地面沉降典型区',
    pollution: { depthToWater: 12, netRecharge: 80, aquiferMedia: '砂岩', soilMedia: '粉质黏土', topography: 2, vadoseZone: '粉质黏土', conductivity: 15, landUse: '耕地' },
    overexploitation: { extraction: 12000, recharge: 4500, waterLevelDecline: 2.5, aquiferType: '深层孔隙水', allowableExtraction: 6000 },
    subsidence: { compressibleLayerThickness: 60, waterLevelDecline: 35, layerType: '粉质黏土', structure: '多层互层', historicalSubsidence: 600, currentRate: 15 },
    seawater: { distanceToCoast: 120, currentChloride: 95, previousChloride: 80, inlandWaterLevel: 8, seaLevel: 0, conductivity: 15, hasInterface: false },
  },
  {
    name: '石家庄山前平原',
    description: '山前冲洪积扇，浅层地下水水质良好但存在农业面源污染',
    pollution: { depthToWater: 15, netRecharge: 150, aquiferMedia: '砂砾石', soilMedia: '砂土', topography: 3, vadoseZone: '砂砾', conductivity: 80, landUse: '耕地' },
    overexploitation: { extraction: 6000, recharge: 8000, waterLevelDecline: 0.3, aquiferType: '浅层孔隙水', allowableExtraction: 7000 },
    subsidence: { compressibleLayerThickness: 15, waterLevelDecline: 5, layerType: '粉土', structure: '单层', historicalSubsidence: 50, currentRate: 2 },
    seawater: { distanceToCoast: 300, currentChloride: 65, previousChloride: 60, inlandWaterLevel: 45, seaLevel: 0, conductivity: 80, hasInterface: false },
  },
  {
    name: '唐山沿海经济区',
    description: '沿海工业区，海水入侵与工业污染双重风险',
    pollution: { depthToWater: 5, netRecharge: 100, aquiferMedia: '砂砾石', soilMedia: '砂土', topography: 1, vadoseZone: '砂', conductivity: 60, landUse: '工业区' },
    overexploitation: { extraction: 5000, recharge: 2500, waterLevelDecline: 1.2, aquiferType: '浅层孔隙水', allowableExtraction: 4000 },
    subsidence: { compressibleLayerThickness: 45, waterLevelDecline: 20, layerType: '粉质黏土', structure: '多层互层', historicalSubsidence: 350, currentRate: 8 },
    seawater: { distanceToCoast: 1.5, currentChloride: 580, previousChloride: 350, inlandWaterLevel: 0.5, seaLevel: 0, conductivity: 60, hasInterface: true },
  },
  {
    name: '邢台黑龙港流域',
    description: '缺水地区，水质型缺水与资源型缺水并存',
    pollution: { depthToWater: 10, netRecharge: 70, aquiferMedia: '砂岩', soilMedia: '粉质黏土', topography: 2, vadoseZone: '粉土', conductivity: 20, landUse: '耕地' },
    overexploitation: { extraction: 7500, recharge: 2800, waterLevelDecline: 1.5, aquiferType: '深层孔隙水', allowableExtraction: 3800 },
    subsidence: { compressibleLayerThickness: 50, waterLevelDecline: 28, layerType: '粉质黏土', structure: '多层互层', historicalSubsidence: 450, currentRate: 12 },
    seawater: { distanceToCoast: 200, currentChloride: 180, previousChloride: 150, inlandWaterLevel: 12, seaLevel: 0, conductivity: 20, hasInterface: false },
  },
  {
    name: '张家口坝上高原',
    description: '高原内陆盆地，生态脆弱区，地下水开采强度较低',
    pollution: { depthToWater: 20, netRecharge: 60, aquiferMedia: '变质岩', soilMedia: '粉质黏土', topography: 5, vadoseZone: '粉质黏土', conductivity: 8, landUse: '草地' },
    overexploitation: { extraction: 1500, recharge: 3500, waterLevelDecline: 0.1, aquiferType: '裂隙水', allowableExtraction: 2500 },
    subsidence: { compressibleLayerThickness: 8, waterLevelDecline: 2, layerType: '粉土', structure: '单层', historicalSubsidence: 10, currentRate: 1 },
    seawater: { distanceToCoast: 500, currentChloride: 45, previousChloride: 42, inlandWaterLevel: 1200, seaLevel: 0, conductivity: 8, hasInterface: false },
  },
];
