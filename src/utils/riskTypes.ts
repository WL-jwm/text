/**
 * B-31 地下水风险评估 — 类型定义
 */

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


export interface ComprehensiveRiskInput {
  /** 各子风险等级 */
  pollutionRisk: RiskLevel;
  overexploitationRisk: RiskLevel;
  subsidenceRisk: RiskLevel;
  seawaterIntrusionRisk: RiskLevel;
}


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


export interface PresetArea {
  name: string;
  description: string;
  pollution: DrasticInput;
  overexploitation: OverexploitationInput;
  subsidence: SubsidenceRiskInput;
  seawater: SeawaterIntrusionInput;
}


export type RiskLevel = '极低' | '低' | '中等' | '高' | '极高';

