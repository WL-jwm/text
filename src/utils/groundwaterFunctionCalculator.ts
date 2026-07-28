/**
 * B-24 地下水功能评价计算引擎
 *
 * 功能：
 *  1. 供水功能评价（水量/水质/可开采性三维度）
 *  2. 生态功能评价（基流维持/湿地支撑/植被供水）
 *  3. 地质环境功能评价（地面沉降/海水入侵/土壤盐渍化）
 *  4. 调节功能评价（储存/补给/缓冲能力）
 *  5. 综合功能评价（AHP权重+加权评分+功能等级判定）
 *  6. 预设数据：河北省6个典型功能区评价参数
 */

// ═══════════════════════════════════════════════════════
// 类型定义
// ═══════════════════════════════════════════════════════

export interface FunctionEvaluationInput {
  /** 评价单元名称 */
  name: string;
  /** 区域类型（平原/山区/滨海/盆地） */
  regionType: string;

  // ── 供水功能指标 ──
  /** 单井涌水量 (m³/d) */
  wellYield: number;
  /** 地下水水质级别（Ⅰ~Ⅴ） */
  waterQualityGrade: number; // 1~5
  /** 可开采模数 (万m³/km²·a) */
  exploitableModulus: number;
  /** 开采利用率 (%) */
  utilizationRate: number;

  // ── 生态功能指标 ──
  /** 基流补给比例 (%) */
  baseflowRatio: number;
  /** 湿地依赖度 (1~5) */
  wetlandDependency: number;
  /** 植被地下水依赖度 (%) */
  vegetationDependency: number;

  // ── 地质环境功能指标 ──
  /** 地面沉降速率 (mm/a) */
  subsidenceRate: number;
  /** 海水入侵距离 (km)，0表示无 */
  seawaterIntrusion: number;
  /** 土壤盐渍化面积比例 (%) */
  salinizationRatio: number;

  // ── 调节功能指标 ──
  /** 含水层厚度 (m) */
  aquiferThickness: number;
  /** 给水度 */
  specificYield: number;
  /** 年补给强度 (mm/a) */
  rechargeIntensity: number;
  /** 水位年变幅 (m) */
  waterLevelAmplitude: number;
}

export interface DimensionScore {
  /** 维度名称 */
  dimension: string;
  /** 各指标得分 */
  indicators: Array<{
    name: string;
    value: number | string;
    score: number;
    weight: number;
    weightedScore: number;
    rating: string;
  }>;
  /** 维度总分（0~100） */
  totalScore: number;
  /** 维度等级 */
  grade: string;
  /** 维度权重 */
  weight: number;
  /** 维度评价说明 */
  note: string;
}

export interface FunctionEvaluationResult {
  name: string;
  /** 四维度评分 */
  dimensions: DimensionScore[];
  /** 综合得分（0~100） */
  comprehensiveScore: number;
  /** 综合功能等级 */
  functionGrade: string;
  /** 主导功能 */
  dominantFunction: string;
  /** 功能区划建议 */
  zoningSuggestion: string;
  /** 保护/利用建议 */
  suggestion: string;
}

// ═══════════════════════════════════════════════════════
// 评分标准与权重
// ═══════════════════════════════════════════════════════

/** AHP 维度权重 */
export const DIMENSION_WEIGHTS = {
  supply: 0.35,
  ecology: 0.20,
  geoEnvironment: 0.25,
  regulation: 0.20,
};

/** 评分→等级映射 */
export function scoreToGrade(score: number): string {
  if (score >= 85) return '优秀';
  if (score >= 70) return '良好';
  if (score >= 55) return '中等';
  if (score >= 40) return '较差';
  return '差';
}

/** 评分→颜色映射 */
export function scoreToColor(score: number): string {
  if (score >= 85) return '#10b981';
  if (score >= 70) return '#06b6d4';
  if (score >= 55) return '#f59e0b';
  if (score >= 40) return '#f97316';
  return '#ef4444';
}

/** 评分→评级标签 */
function scoreToRating(score: number): string {
  if (score >= 85) return '优';
  if (score >= 70) return '良';
  if (score >= 55) return '中';
  if (score >= 40) return '差';
  return '极差';
}

// ── 供水功能评分 ──

function scoreWellYield(yield_m3d: number): number {
  if (yield_m3d >= 5000) return 95;
  if (yield_m3d >= 2000) return 80;
  if (yield_m3d >= 1000) return 65;
  if (yield_m3d >= 500) return 50;
  if (yield_m3d >= 100) return 35;
  return 20;
}

function scoreWaterQuality(grade: number): number {
  // Ⅰ=95, Ⅱ=85, Ⅲ=70, Ⅳ=50, Ⅴ=30
  const scores = [0, 95, 85, 70, 50, 30];
  return scores[Math.min(5, Math.max(1, grade))] ?? 30;
}

function scoreExploitableModulus(modulus: number): number {
  if (modulus >= 20) return 90;
  if (modulus >= 10) return 75;
  if (modulus >= 5) return 60;
  if (modulus >= 2) return 45;
  if (modulus >= 1) return 30;
  return 15;
}

function scoreUtilizationRate(rate: number): number {
  // 利用率越低，供水功能潜力越大（反向评分）
  if (rate <= 30) return 90;
  if (rate <= 50) return 75;
  if (rate <= 70) return 60;
  if (rate <= 85) return 45;
  if (rate <= 100) return 30;
  return 15; // 超采
}

// ── 生态功能评分 ──

function scoreBaseflow(ratio: number): number {
  if (ratio >= 60) return 90;
  if (ratio >= 40) return 75;
  if (ratio >= 20) return 60;
  if (ratio >= 10) return 45;
  if (ratio > 0) return 30;
  return 15;
}

function scoreWetland(dep: number): number {
  // 1~5，5为最高依赖
  const scores = [0, 20, 40, 60, 80, 95];
  return scores[Math.min(5, Math.max(1, dep))] ?? 20;
}

function scoreVegetation(dep: number): number {
  if (dep >= 60) return 90;
  if (dep >= 40) return 75;
  if (dep >= 20) return 60;
  if (dep >= 10) return 45;
  if (dep > 0) return 30;
  return 15;
}

// ── 地质环境功能评分 ──

function scoreSubsidence(rate: number): number {
  // 沉降速率越低，地质环境功能越好
  if (rate <= 0) return 95;
  if (rate <= 5) return 80;
  if (rate <= 10) return 65;
  if (rate <= 20) return 50;
  if (rate <= 40) return 35;
  return 20;
}

function scoreSeawaterIntrusion(dist: number): number {
  if (dist <= 0) return 95;
  if (dist <= 1) return 70;
  if (dist <= 3) return 55;
  if (dist <= 5) return 40;
  if (dist <= 10) return 25;
  return 15;
}

function scoreSalinization(ratio: number): number {
  if (ratio <= 0) return 95;
  if (ratio <= 5) return 80;
  if (ratio <= 15) return 65;
  if (ratio <= 30) return 50;
  if (ratio <= 50) return 35;
  return 20;
}

// ── 调节功能评分 ──

function scoreAquiferThickness(thickness: number): number {
  if (thickness >= 50) return 90;
  if (thickness >= 30) return 75;
  if (thickness >= 15) return 60;
  if (thickness >= 5) return 45;
  if (thickness >= 1) return 30;
  return 15;
}

function scoreSpecificYield(sy: number): number {
  if (sy >= 0.25) return 90;
  if (sy >= 0.15) return 75;
  if (sy >= 0.08) return 60;
  if (sy >= 0.04) return 45;
  if (sy >= 0.02) return 30;
  return 15;
}

function scoreRecharge(recharge: number): number {
  if (recharge >= 200) return 90;
  if (recharge >= 100) return 75;
  if (recharge >= 50) return 60;
  if (recharge >= 20) return 45;
  if (recharge >= 10) return 30;
  return 15;
}

function scoreAmplitude(amp: number): number {
  // 水位变幅越小，调节能力越强
  if (amp <= 1) return 90;
  if (amp <= 2) return 75;
  if (amp <= 4) return 60;
  if (amp <= 6) return 45;
  if (amp <= 10) return 30;
  return 15;
}

// ═══════════════════════════════════════════════════════
// 维度计算
// ═══════════════════════════════════════════════════════

function calcSupplyDimension(input: FunctionEvaluationInput): DimensionScore {
  const indicators = [
    { name: '单井涌水量', value: `${input.wellYield} m³/d`, score: scoreWellYield(input.wellYield), weight: 0.30 },
    { name: '水质级别', value: ['—', 'Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ'][Math.min(5, input.waterQualityGrade)], score: scoreWaterQuality(input.waterQualityGrade), weight: 0.25 },
    { name: '可开采模数', value: `${input.exploitableModulus} 万m³/km²·a`, score: scoreExploitableModulus(input.exploitableModulus), weight: 0.25 },
    { name: '开采利用率', value: `${input.utilizationRate}%`, score: scoreUtilizationRate(input.utilizationRate), weight: 0.20 },
  ];
  const total = indicators.reduce((s, i) => s + i.score * i.weight, 0);
  return {
    dimension: '供水功能',
    indicators: indicators.map(i => ({ ...i, weightedScore: Math.round(i.score * i.weight * 10) / 10, rating: scoreToRating(i.score) })),
    totalScore: Math.round(total),
    grade: scoreToGrade(total),
    weight: DIMENSION_WEIGHTS.supply,
    note: total >= 70 ? '供水能力强，适宜作为集中供水水源地。' : total >= 55 ? '供水能力中等，可满足分散供水需求。' : '供水能力弱，需谨慎开发。',
  };
}

function calcEcologyDimension(input: FunctionEvaluationInput): DimensionScore {
  const indicators = [
    { name: '基流补给比例', value: `${input.baseflowRatio}%`, score: scoreBaseflow(input.baseflowRatio), weight: 0.40 },
    { name: '湿地依赖度', value: `${input.wetlandDependency}级`, score: scoreWetland(input.wetlandDependency), weight: 0.30 },
    { name: '植被依赖度', value: `${input.vegetationDependency}%`, score: scoreVegetation(input.vegetationDependency), weight: 0.30 },
  ];
  const total = indicators.reduce((s, i) => s + i.score * i.weight, 0);
  return {
    dimension: '生态功能',
    indicators: indicators.map(i => ({ ...i, weightedScore: Math.round(i.score * i.weight * 10) / 10, rating: scoreToRating(i.score) })),
    totalScore: Math.round(total),
    grade: scoreToGrade(total),
    weight: DIMENSION_WEIGHTS.ecology,
    note: total >= 70 ? '生态功能重要，需维持地下水生态基流。' : total >= 55 ? '生态功能中等，适当考虑生态需水。' : '生态功能弱，地下水对生态支撑有限。',
  };
}

function calcGeoEnvDimension(input: FunctionEvaluationInput): DimensionScore {
  const indicators = [
    { name: '地面沉降速率', value: `${input.subsidenceRate} mm/a`, score: scoreSubsidence(input.subsidenceRate), weight: 0.40 },
    { name: '海水入侵距离', value: `${input.seawaterIntrusion} km`, score: scoreSeawaterIntrusion(input.seawaterIntrusion), weight: 0.30 },
    { name: '盐渍化面积比', value: `${input.salinizationRatio}%`, score: scoreSalinization(input.salinizationRatio), weight: 0.30 },
  ];
  const total = indicators.reduce((s, i) => s + i.score * i.weight, 0);
  return {
    dimension: '地质环境功能',
    indicators: indicators.map(i => ({ ...i, weightedScore: Math.round(i.score * i.weight * 10) / 10, rating: scoreToRating(i.score) })),
    totalScore: Math.round(total),
    grade: scoreToGrade(total),
    weight: DIMENSION_WEIGHTS.geoEnvironment,
    note: total >= 70 ? '地质环境稳定，无明显环境地质问题。' : total >= 55 ? '存在轻度环境地质问题，需监测。' : '地质环境问题突出，需限制开采。',
  };
}

function calcRegulationDimension(input: FunctionEvaluationInput): DimensionScore {
  const indicators = [
    { name: '含水层厚度', value: `${input.aquiferThickness} m`, score: scoreAquiferThickness(input.aquiferThickness), weight: 0.25 },
    { name: '给水度', value: String(input.specificYield), score: scoreSpecificYield(input.specificYield), weight: 0.25 },
    { name: '年补给强度', value: `${input.rechargeIntensity} mm/a`, score: scoreRecharge(input.rechargeIntensity), weight: 0.30 },
    { name: '水位年变幅', value: `${input.waterLevelAmplitude} m`, score: scoreAmplitude(input.waterLevelAmplitude), weight: 0.20 },
  ];
  const total = indicators.reduce((s, i) => s + i.score * i.weight, 0);
  return {
    dimension: '调节功能',
    indicators: indicators.map(i => ({ ...i, weightedScore: Math.round(i.score * i.weight * 10) / 10, rating: scoreToRating(i.score) })),
    totalScore: Math.round(total),
    grade: scoreToGrade(total),
    weight: DIMENSION_WEIGHTS.regulation,
    note: total >= 70 ? '调节能力强，含水层储水和缓冲性能好。' : total >= 55 ? '调节能力中等，有一定的年内调节空间。' : '调节能力弱，水位波动大，补给不足。',
  };
}

// ═══════════════════════════════════════════════════════
// 综合评价
// ═══════════════════════════════════════════════════════

export function calcFunctionEvaluation(input: FunctionEvaluationInput): FunctionEvaluationResult {
  const supply = calcSupplyDimension(input);
  const ecology = calcEcologyDimension(input);
  const geoEnv = calcGeoEnvDimension(input);
  const regulation = calcRegulationDimension(input);

  const dimensions = [supply, ecology, geoEnv, regulation];

  // 综合得分 = Σ(维度得分 × 维度权重)
  const comprehensiveScore = Math.round(
    supply.totalScore * DIMENSION_WEIGHTS.supply +
    ecology.totalScore * DIMENSION_WEIGHTS.ecology +
    geoEnv.totalScore * DIMENSION_WEIGHTS.geoEnvironment +
    regulation.totalScore * DIMENSION_WEIGHTS.regulation
  );

  const functionGrade = scoreToGrade(comprehensiveScore);

  // 主导功能判定
  const sortedDims = [...dimensions].sort((a, b) => b.totalScore - a.totalScore);
  const dominantFunction = sortedDims[0].dimension;

  // 功能区划建议
  let zoningSuggestion: string;
  if (comprehensiveScore >= 70) {
    zoningSuggestion = '开发保护区——以供水开发为主，兼顾生态保护，可适度增加开采。';
  } else if (comprehensiveScore >= 55) {
    zoningSuggestion = '限制开发区——以维持现状为主，控制开采量，加强监测。';
  } else if (comprehensiveScore >= 40) {
    zoningSuggestion = '涵养修复区——以涵养修复为主，压采减采，恢复地下水功能。';
  } else {
    zoningSuggestion = '禁采保护区——全面禁止开采，实施生态修复和地下水回补。';
  }

  // 详细建议
  const suggestions: string[] = [];
  if (supply.totalScore < 55) suggestions.push('供水功能不足，不宜作为主要水源地');
  if (ecology.totalScore >= 70) suggestions.push('生态功能重要，须保障生态基流');
  if (geoEnv.totalScore < 55) {
    if (input.subsidenceRate > 10) suggestions.push('地面沉降严重，需严格控制深层水开采');
    if (input.seawaterIntrusion > 0) suggestions.push('存在海水入侵风险，需控制滨海区开采');
    if (input.salinizationRatio > 15) suggestions.push('土壤盐渍化较重，需排水降盐');
  }
  if (regulation.totalScore < 55) suggestions.push('调节能力弱，需加强补源回灌');
  if (input.utilizationRate > 100) suggestions.push('已超采，需压减开采量');

  const suggestion = suggestions.length > 0 ? suggestions.join('；') + '。' : '各功能维度基本平衡，维持现状管理即可。';

  return {
    name: input.name,
    dimensions,
    comprehensiveScore,
    functionGrade,
    dominantFunction,
    zoningSuggestion,
    suggestion,
  };
}

// ═══════════════════════════════════════════════════════
// 预设数据：河北省6个典型功能区
// ═══════════════════════════════════════════════════════

export const PRESET_ZONES: FunctionEvaluationInput[] = [
  {
    name: '太行山前冲洪积扇（保定石家庄补给区）', regionType: '平原',
    wellYield: 3000, waterQualityGrade: 2, exploitableModulus: 15, utilizationRate: 45,
    baseflowRatio: 35, wetlandDependency: 2, vegetationDependency: 15,
    subsidenceRate: 0, seawaterIntrusion: 0, salinizationRatio: 0,
    aquiferThickness: 40, specificYield: 0.20, rechargeIntensity: 150, waterLevelAmplitude: 2,
  },
  {
    name: '河北平原中部（衡水深层超采区）', regionType: '平原',
    wellYield: 1500, waterQualityGrade: 3, exploitableModulus: 5, utilizationRate: 130,
    baseflowRatio: 10, wetlandDependency: 1, vegetationDependency: 5,
    subsidenceRate: 35, seawaterIntrusion: 0, salinizationRatio: 10,
    aquiferThickness: 60, specificYield: 0.06, rechargeIntensity: 20, waterLevelAmplitude: 8,
  },
  {
    name: '沧州滨海区（海水入侵区）', regionType: '滨海',
    wellYield: 800, waterQualityGrade: 4, exploitableModulus: 3, utilizationRate: 110,
    baseflowRatio: 5, wetlandDependency: 3, vegetationDependency: 10,
    subsidenceRate: 25, seawaterIntrusion: 6, salinizationRatio: 40,
    aquiferThickness: 30, specificYield: 0.05, rechargeIntensity: 15, waterLevelAmplitude: 5,
  },
  {
    name: '燕山山区（承德生态水源地）', regionType: '山区',
    wellYield: 2000, waterQualityGrade: 1, exploitableModulus: 8, utilizationRate: 25,
    baseflowRatio: 55, wetlandDependency: 4, vegetationDependency: 30,
    subsidenceRate: 0, seawaterIntrusion: 0, salinizationRatio: 0,
    aquiferThickness: 20, specificYield: 0.12, rechargeIntensity: 120, waterLevelAmplitude: 3,
  },
  {
    name: '邢台东部平原（限采区）', regionType: '平原',
    wellYield: 1200, waterQualityGrade: 3, exploitableModulus: 6, utilizationRate: 95,
    baseflowRatio: 15, wetlandDependency: 1, vegetationDependency: 8,
    subsidenceRate: 12, seawaterIntrusion: 0, salinizationRatio: 20,
    aquiferThickness: 35, specificYield: 0.08, rechargeIntensity: 30, waterLevelAmplitude: 6,
  },
  {
    name: '张家口坝上高原（生态脆弱区）', regionType: '盆地',
    wellYield: 500, waterQualityGrade: 2, exploitableModulus: 4, utilizationRate: 60,
    baseflowRatio: 40, wetlandDependency: 5, vegetationDependency: 45,
    subsidenceRate: 0, seawaterIntrusion: 0, salinizationRatio: 5,
    aquiferThickness: 15, specificYield: 0.10, rechargeIntensity: 40, waterLevelAmplitude: 4,
  },
];

// ═══════════════════════════════════════════════════════
// 批量计算与汇总
// ═══════════════════════════════════════════════════════

export function calcAllPresetZones(): FunctionEvaluationResult[] {
  return PRESET_ZONES.map(z => calcFunctionEvaluation(z));
}

export function calcFunctionSummary() {
  const results = calcAllPresetZones();
  const gradeCounts: Record<string, number> = {};
  results.forEach(r => {
    gradeCounts[r.functionGrade] = (gradeCounts[r.functionGrade] || 0) + 1;
  });

  const dominantCounts: Record<string, number> = {};
  results.forEach(r => {
    dominantCounts[r.dominantFunction] = (dominantCounts[r.dominantFunction] || 0) + 1;
  });

  const avgScore = Math.round(results.reduce((s, r) => s + r.comprehensiveScore, 0) / results.length);
  const maxScore = Math.max(...results.map(r => r.comprehensiveScore));
  const minScore = Math.min(...results.map(r => r.comprehensiveScore));

  // 维度平均分
  const dimAvg = ['供水功能', '生态功能', '地质环境功能', '调节功能'].map(dim => {
    const scores = results.map(r => r.dimensions.find(d => d.dimension === dim)?.totalScore ?? 0);
    return { dimension: dim, avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) };
  });

  return { zoneCount: PRESET_ZONES.length, gradeCounts, dominantCounts, avgScore, maxScore, minScore, dimAvg, results };
}
