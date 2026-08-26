/**
 * 地下水功能评价 — 类型定义
 */

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
