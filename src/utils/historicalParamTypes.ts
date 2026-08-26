/**
 * 历史水文地质参数计算 — 类型定义
 */

export interface SpringFrequencyInput {
  /** 泉名 */
  name: string;
  /** 年流量序列（年份→流量 m³/s） */
  data: Array<{ year: number; flow: number }>;
  /** 保证率列表 */
  probabilities: number[];
}


export interface SpringFrequencyResult {
  name: string;
  n: number;
  /** 经验频率排序列表 */
  empirical: Array<{ rank: number; year: number; flow: number; frequency: number }>;
  /** 均值 */
  mean: number;
  /** 标准差 */
  std: number;
  /** 变差系数 Cv */
  cv: number;
  /** 偏态系数 Cs */
  cs: number;
  /** Cs/Cv 比值 */
  csCvRatio: number;
  /** 各保证率对应流量 */
  designFlows: Array<{ probability: number; flow: number; method: string }>;
  /** 评价 */
  note: string;
}


export interface AquiferParamInput {
  /** 监测点名称 */
  name: string;
  /** 含水层类型（潜水/承压） */
  aquiferType: string;
  /** 降深 s (m) */
  drawdown: number;
  /** 稳定流量 Q (m³/d) */
  discharge: number;
  /** 观测孔距离 r (m) */
  distance: number;
  /** 含水层厚度 M (m) */
  thickness: number;
  /** 恢复时间 t (d)，用于Theis恢复法 */
  recoveryTime: number;
  /** 降深恢复值 s' (m) */
  recoveryDrawdown: number;
}


export interface AquiferParamResult {
  name: string;
  /** 方法1：Dupuit法（潜水完整井） */
  dupuit: {
    K: number; // 渗透系数 m/d
    T: number; // 导水系数 m²/d
    method: string;
  };
  /** 方法2：Theis恢复法 */
  theis: {
    K: number;
    T: number;
    S: number; // 贮水系数
    method: string;
  };
  /** 方法3：经验估算法（基于出水率） */
  empirical: {
    K: number;
    T: number;
    yieldRate: number; // 出水率 m³/(h·m)
    method: string;
  };
  /** 综合推荐值 */
  recommendedK: number;
  recommendedT: number;
  /** 说明 */
  note: string;
}


export interface RunoffRestorationInput {
  /** 河流/断面名称 */
  name: string;
  /** 实测径流量序列（年份→亿m³） */
  measuredData: Array<{ year: number; runoff: number }>;
  /** 灌溉引水量序列（亿m³） */
  irrigationDiversion: number[];
  /** 工业用水量序列（亿m³） */
  industrialUse: number[];
  /** 水库蓄变量序列（亿m³，正为蓄水） */
  reservoirChange: number[];
  /** 跨流域调水量（亿m³，正为调入） */
  interbasinTransfer: number[];
}


export interface RunoffRestorationResult {
  name: string;
  n: number;
  /** 天然径流量序列 */
  naturalRunoff: Array<{ year: number; measured: number; natural: number; reduction: number }>;
  /** 多年平均实测径流量 */
  avgMeasured: number;
  /** 多年平均天然径流量 */
  avgNatural: number;
  /** 多年平均削减量 */
  avgReduction: number;
  /** 削减率 (%) */
  reductionRate: number;
  /** 人类活动影响评价 */
  impactLevel: string;
  /** 说明 */
  note: string;
}


export interface GeologicalAgeInput {
  /** 监测点名称 */
  name: string;
  /** ¹⁴C实测年龄 (a BP) */
  c14Age: number;
  /** δ¹³C值 (‰) */
  delta13C: number;
  /** ¹⁴C初始活度 A0 (pmC) */
  initialActivity: number;
  /** 实测¹⁴C活度 A (pmC) */
  measuredActivity: number;
  /** 氚含量 (TU) */
  tritium: number;
  /** 地层推断年龄 (a) */
  stratigraphicAge: number;
}


export interface GeologicalAgeResult {
  name: string;
  /** ¹⁴C校正年龄（δ¹³C校正） */
  c14CorrectedAge: number;
  /** ¹⁴C稀释模型年龄 */
  c14DilutionAge: number;
  /** 氚法年龄估算 */
  tritiumAge: string;
  /** 地层对比年龄 */
  stratigraphicEstimate: number;
  /** 综合推荐年龄 */
  recommendedAge: number;
  /** 水年龄分类 */
  ageCategory: string;
  /** 说明 */
  note: string;
}

// ═══════════════════════════════════════════════════════
// 辅助函数
// ═══════════════════════════════════════════════════════

