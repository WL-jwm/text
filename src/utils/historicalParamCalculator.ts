/**
 * B-28 历史水文地质参数推算引擎
 *
 * 功能：
 *  1. 泉水流量频率分析（经验频率+P-III型曲线参数估算+保证率流量）
 *  2. 含水层参数反演（利用早期抽水试验数据推算K/T/S）
 *  3. 径流还原计算（天然径流量还原+人类活动影响量分离）
 *  4. 地质年代估算（¹⁴C校正/地层对比法/氚法）
 *  5. 预设数据：河北省6个历史监测点参数
 */

// ═══════════════════════════════════════════════════════
// 类型定义
// ═══════════════════════════════════════════════════════

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

function mean(arr: number[]): number {
  return arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

function std(arr: number[]): number {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1));
}

function round(v: number, d = 4): number {
  const f = Math.pow(10, d);
  return Math.round(v * f) / f;
}

// P-III型分布分位数近似（Wilson-Hilferty变换）
function piiiQuantile(p: number, meanVal: number, cv: number, cs: number): number {
  // Wilson-Hilferty近似
  const z = whInverseCDF(1 - p / 100);
  const skew = cs / 2;
  const t = z + (skew - 1) / 6 * (z * z - 1) + skew / 36 * (z * z - 3) * z - skew * skew / 216 * (z * z * z * z - 6 * z * z + 3);
  return meanVal * (1 + cv * t);
}

// 标准正态分布分位数近似
function whInverseCDF(p: number): number {
  if (p <= 0) return -3;
  if (p >= 1) return 3;
  // Beasley-Springer-Moro算法
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];
  const plow = 0.02425;
  const phigh = 1 - plow;
  let q, r;
  if (p < plow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p <= phigh) {
    q = p - 0.5;
    r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
}

// ═══════════════════════════════════════════════════════
// 1. 泉水流量频率分析
// ═══════════════════════════════════════════════════════

export function calcSpringFrequency(input: SpringFrequencyInput): SpringFrequencyResult {
  const { name, data, probabilities } = input;
  const n = data.length;
  const flows = data.map(d => d.flow);
  const m = mean(flows);
  const s = std(flows);
  const cv = m !== 0 ? s / Math.abs(m) : 0;

  // 偏态系数 Cs
  const cs = n > 2 && s > 0
    ? n * flows.reduce((sum, v) => sum + ((v - m) / s) ** 3, 0) / ((n - 1) * (n - 2))
    : 0;
  const csCvRatio = cv !== 0 ? cs / cv : 0;

  // 经验频率排序
  const sorted = [...data].sort((a, b) => b.flow - a.flow);
  const empirical = sorted.map((d, i) => ({
    rank: i + 1,
    year: d.year,
    flow: round(d.flow, 3),
    frequency: round((i + 1) / (n + 1) * 100, 1),
  }));

  // P-III型曲线各保证率流量
  // 通常Cs = 2*Cv（皮尔逊III型经验关系）
  const useCs = Math.abs(cs) > 0.1 ? cs : 2 * cv; // 若Cs估算不稳定，用2Cv
  const designFlows = probabilities.map(p => {
    // p为超越概率(%)
    const flow = piiiQuantile(p, m, cv, useCs);
    return {
      probability: p,
      flow: round(Math.max(0, flow), 3),
      method: `P-III型(Cs=${round(useCs, 2)}, Cv=${round(cv, 3)})`,
    };
  });

  const note = `${name}泉水流量频率分析：均值=${round(m, 3)} m³/s，Cv=${round(cv, 3)}，Cs=${round(useCs, 2)}。`
    + ` P=50%流量=${designFlows.find(d => d.probability === 50)?.flow ?? '—'} m³/s，`
    + ` P=95%流量=${designFlows.find(d => d.probability === 95)?.flow ?? '—'} m³/s。`
    + (cv < 0.3 ? ' 流量稳定，年际变化小。' : cv < 0.5 ? ' 流量中等波动。' : ' 流量波动较大，枯水年保障率低。');

  return {
    name, n, empirical,
    mean: round(m, 3), std: round(s, 3), cv: round(cv, 4),
    cs: round(useCs, 2), csCvRatio: round(csCvRatio, 2),
    designFlows, note,
  };
}

// ═══════════════════════════════════════════════════════
// 2. 含水层参数反演
// ═══════════════════════════════════════════════════════

export function calcAquiferParams(input: AquiferParamInput): AquiferParamResult {
  const { name, aquiferType, drawdown, discharge, distance, thickness, recoveryTime, recoveryDrawdown } = input;

  // 方法1：Dupuit法（潜水完整井稳定流）
  // K = Q·ln(R/r) / (π·(2H-s)·s)，R为影响半径
  // 简化：R = 3000·s·√K → 迭代求解，这里用经验R=150·s
  const R = Math.max(150 * drawdown, 100);
  const dupuitK = drawdown > 0
    ? discharge * Math.log(R / distance) / (Math.PI * (2 * thickness - drawdown) * drawdown)
    : 0;
  const dupuitT = dupuitK * thickness;

  // 方法2：Theis恢复法（Jacob近似）
  // T = 2.3·Q / (4π·Δs'), Δs' = s'·Δ(lg t)
  // 简化：T = Q / (4π·s')， S = 2.25·T·t / r²
  const theisT = recoveryDrawdown > 0 ? discharge / (4 * Math.PI * recoveryDrawdown) : 0;
  const theisK = thickness > 0 ? theisT / thickness : 0;
  const theisS = recoveryTime > 0 && distance > 0 ? 2.25 * theisT * recoveryTime / (distance * distance) : 0;

  // 方法3：经验估算法（出水率法）
  // 出水率 = Q / (s · M)， K ≈ 出水率 / (24 · 某系数)
  const yieldRate = drawdown > 0 && thickness > 0 ? discharge / (drawdown * thickness) * 24 : 0; // m³/(h·m)
  // 经验关系：K ≈ yieldRate × 0.04 (近似)
  const empiricalK = yieldRate * 0.04;
  const empiricalT = empiricalK * thickness;

  // 综合推荐：取三种方法的均值（剔除异常）
  const allK = [dupuitK, theisK, empiricalK].filter(v => v > 0 && isFinite(v));
  const recommendedK = allK.length > 0 ? mean(allK) : 0;
  const recommendedT = recommendedK * thickness;

  const note = `${name}含水层参数反演：`
    + ` Dupuit法K=${round(dupuitK, 2)} m/d，Theis恢复法K=${round(theisK, 2)} m/d，经验法K=${round(empiricalK, 2)} m/d。`
    + ` 推荐K=${round(recommendedK, 2)} m/d，T=${round(recommendedT, 1)} m²/d。`
    + ` 出水率=${round(yieldRate, 2)} m³/(h·m)。`
    + (aquiferType === '承压' ? ' 承压含水层参数。' : ' 潜水含水层参数。');

  return {
    name,
    dupuit: { K: round(dupuitK, 2), T: round(dupuitT, 1), method: 'Dupuit稳定流(潜水完整井)' },
    theis: { K: round(theisK, 2), T: round(theisT, 1), S: round(theisS, 6), method: 'Theis恢复法(Jacob近似)' },
    empirical: { K: round(empiricalK, 2), T: round(empiricalT, 1), yieldRate: round(yieldRate, 2), method: '经验出水率法' },
    recommendedK: round(recommendedK, 2),
    recommendedT: round(recommendedT, 1),
    note,
  };
}

// ═══════════════════════════════════════════════════════
// 3. 径流还原计算
// ═══════════════════════════════════════════════════════

export function calcRunoffRestoration(input: RunoffRestorationInput): RunoffRestorationResult {
  const { name, measuredData, irrigationDiversion, industrialUse, reservoirChange, interbasinTransfer } = input;
  const n = measuredData.length;

  // 天然径流量 = 实测径流量 + 灌溉引水 + 工业用水 + 水库蓄变量 - 跨流域调水
  const naturalRunoff = measuredData.map((d, i) => {
    const reduction = (irrigationDiversion[i] ?? 0) + (industrialUse[i] ?? 0)
      + (reservoirChange[i] ?? 0) - (interbasinTransfer[i] ?? 0);
    return {
      year: d.year,
      measured: round(d.runoff, 2),
      natural: round(d.runoff + reduction, 2),
      reduction: round(reduction, 2),
    };
  });

  const avgMeasured = mean(naturalRunoff.map(d => d.measured));
  const avgNatural = mean(naturalRunoff.map(d => d.natural));
  const avgReduction = mean(naturalRunoff.map(d => d.reduction));
  const reductionRate = avgNatural > 0 ? (avgReduction / avgNatural) * 100 : 0;

  let impactLevel: string;
  if (reductionRate < 10) impactLevel = '轻微影响';
  else if (reductionRate < 25) impactLevel = '中度影响';
  else if (reductionRate < 40) impactLevel = '显著影响';
  else impactLevel = '严重影响';

  const note = `${name}径流还原：多年平均实测径流量${round(avgMeasured, 2)}亿m³，`
    + `还原后天然径流量${round(avgNatural, 2)}亿m³，削减量${round(avgReduction, 2)}亿m³(${round(reductionRate, 1)}%)。`
    + ` 人类活动影响等级：${impactLevel}。`;

  return {
    name, n, naturalRunoff,
    avgMeasured: round(avgMeasured, 2),
    avgNatural: round(avgNatural, 2),
    avgReduction: round(avgReduction, 2),
    reductionRate: round(reductionRate, 1),
    impactLevel, note,
  };
}

// ═══════════════════════════════════════════════════════
// 4. 地质年代估算
// ═══════════════════════════════════════════════════════

export function calcGeologicalAge(input: GeologicalAgeInput): GeologicalAgeResult {
  const { name, c14Age, delta13C, initialActivity, measuredActivity, tritium, stratigraphicAge } = input;

  // ¹⁴C校正年龄（δ¹³C校正）
  // 校正公式：t_corrected = t_measured - 8033 × ln(1 + δ¹³C/1000 × f)
  // 简化：t_corrected = t_measured × (1 - δ¹³C / 1000 × 0.5)
  const c14CorrectedAge = Math.round(c14Age * (1 - delta13C / 1000 * 0.5));

  // ¹⁴C稀释模型年龄
  // t = -8267 × ln(A/A0)，其中A0为初始活度
  const c14DilutionAge = initialActivity > 0 && measuredActivity > 0
    ? Math.round(-8267 * Math.log(measuredActivity / initialActivity))
    : 0;

  // 氚法年龄估算
  let tritiumAge: string;
  if (tritium > 10) tritiumAge = '现代水（<5年，核试验后补给）';
  else if (tritium > 1) tritiumAge = '年轻水（5~30年，含少量核爆氚）';
  else if (tritium > 0.1) tritiumAge = '过渡水（30~50年，氚衰减）';
  else tritiumAge = '古水（>50年，无核爆氚）';

  // 综合推荐年龄
  const ages = [c14CorrectedAge, c14DilutionAge, stratigraphicAge].filter(v => v > 0);
  const recommendedAge = ages.length > 0 ? Math.round(mean(ages)) : 0;

  // 年龄分类
  let ageCategory: string;
  if (recommendedAge < 50) ageCategory = '现代水';
  else if (recommendedAge < 1000) ageCategory = '全新世水';
  else if (recommendedAge < 10000) ageCategory = '晚更新世水';
  else if (recommendedAge < 35000) ageCategory = '中更新世水';
  else ageCategory = '古水';

  const note = `${name}地下水年龄估算：¹⁴C校正年龄=${c14CorrectedAge}年，稀释模型年龄=${c14DilutionAge}年，`
    + `地层对比年龄=${stratigraphicAge}年。综合推荐年龄=${recommendedAge}年（${ageCategory}）。`
    + ` 氚法判定：${tritiumAge}。`;

  return {
    name,
    c14CorrectedAge,
    c14DilutionAge,
    tritiumAge,
    stratigraphicEstimate: stratigraphicAge,
    recommendedAge,
    ageCategory,
    note,
  };
}

// ═══════════════════════════════════════════════════════
// 预设数据：河北省6个历史监测点
// ═══════════════════════════════════════════════════════

// 泉水流量序列（10年）
export const PRESET_SPRINGS: SpringFrequencyInput[] = [
  {
    name: '邢台百泉',
    probabilities: [10, 25, 50, 75, 95],
    data: [
      { year: 2015, flow: 5.2 }, { year: 2016, flow: 4.8 }, { year: 2017, flow: 5.5 },
      { year: 2018, flow: 6.1 }, { year: 2019, flow: 5.0 }, { year: 2020, flow: 4.5 },
      { year: 2021, flow: 5.3 }, { year: 2022, flow: 5.8 }, { year: 2023, flow: 5.1 }, { year: 2024, flow: 4.9 },
    ],
  },
  {
    name: '承德热河泉',
    probabilities: [10, 25, 50, 75, 95],
    data: [
      { year: 2015, flow: 0.8 }, { year: 2016, flow: 0.75 }, { year: 2017, flow: 0.85 },
      { year: 2018, flow: 0.9 }, { year: 2019, flow: 0.7 }, { year: 2020, flow: 0.65 },
      { year: 2021, flow: 0.78 }, { year: 2022, flow: 0.82 }, { year: 2023, flow: 0.76 }, { year: 2024, flow: 0.72 },
    ],
  },
  {
    name: '石家庄威州泉',
    probabilities: [10, 25, 50, 75, 95],
    data: [
      { year: 2015, flow: 2.1 }, { year: 2016, flow: 1.9 }, { year: 2017, flow: 2.3 },
      { year: 2018, flow: 2.5 }, { year: 2019, flow: 2.0 }, { year: 2020, flow: 1.7 },
      { year: 2021, flow: 2.2 }, { year: 2022, flow: 2.4 }, { year: 2023, flow: 2.0 }, { year: 2024, flow: 1.85 },
    ],
  },
];

// 含水层参数反演预设
export const PRESET_AQUIFERS: AquiferParamInput[] = [
  { name: '保定望都（山前平原）', aquiferType: '潜水', drawdown: 3.5, discharge: 1200, distance: 50, thickness: 25, recoveryTime: 0.5, recoveryDrawdown: 0.15 },
  { name: '衡水深层（中部平原）', aquiferType: '承压', drawdown: 15, discharge: 800, distance: 100, thickness: 60, recoveryTime: 1.0, recoveryDrawdown: 0.8 },
  { name: '沧州滨海', aquiferType: '承压', drawdown: 20, discharge: 500, distance: 80, thickness: 40, recoveryTime: 1.5, recoveryDrawdown: 1.2 },
  { name: '邯郸峰峰岩溶', aquiferType: '承压', drawdown: 2.0, discharge: 2000, distance: 30, thickness: 15, recoveryTime: 0.3, recoveryDrawdown: 0.08 },
];

// 径流还原预设
export const PRESET_RUNOFF: RunoffRestorationInput[] = [
  {
    name: '滹沱河（黄壁庄断面）',
    measuredData: [
      { year: 2015, runoff: 8.5 }, { year: 2016, runoff: 9.2 }, { year: 2017, runoff: 7.8 },
      { year: 2018, runoff: 6.5 }, { year: 2019, runoff: 7.0 }, { year: 2020, runoff: 6.2 },
      { year: 2021, runoff: 5.8 }, { year: 2022, runoff: 5.5 }, { year: 2023, runoff: 5.0 }, { year: 2024, runoff: 4.8 },
    ],
    irrigationDiversion: [2.5, 2.3, 2.8, 3.2, 3.0, 3.5, 3.8, 4.0, 4.2, 4.3],
    industrialUse: [0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7],
    reservoirChange: [0.2, -0.3, 0.5, 0.8, -0.2, 0.3, 0.1, -0.1, 0.2, -0.1],
    interbasinTransfer: [0, 0, 0, 0.5, 0.5, 0.8, 1.0, 1.2, 1.5, 1.8],
  },
  {
    name: '滏阳河（艾辛庄断面）',
    measuredData: [
      { year: 2015, runoff: 5.2 }, { year: 2016, runoff: 5.8 }, { year: 2017, runoff: 4.5 },
      { year: 2018, runoff: 3.8 }, { year: 2019, runoff: 4.0 }, { year: 2020, runoff: 3.5 },
      { year: 2021, runoff: 3.2 }, { year: 2022, runoff: 2.8 }, { year: 2023, runoff: 2.5 }, { year: 2024, runoff: 2.3 },
    ],
    irrigationDiversion: [1.8, 1.6, 2.0, 2.5, 2.3, 2.8, 3.0, 3.2, 3.5, 3.6],
    industrialUse: [0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4],
    reservoirChange: [0.1, -0.1, 0.3, 0.5, -0.2, 0.2, 0.1, 0, 0.1, 0],
    interbasinTransfer: [0, 0, 0, 0.2, 0.3, 0.5, 0.8, 1.0, 1.2, 1.5],
  },
];

// 地质年代预设
export const PRESET_AGES: GeologicalAgeInput[] = [
  { name: '衡水深层水（300m）', c14Age: 15000, delta13C: -8.5, initialActivity: 100, measuredActivity: 15, tritium: 0.1, stratigraphicAge: 12000 },
  { name: '沧州深层水（400m）', c14Age: 25000, delta13C: -6.2, initialActivity: 100, measuredActivity: 5, tritium: 0.05, stratigraphicAge: 20000 },
  { name: '石家庄浅层水（50m）', c14Age: 500, delta13C: -12.0, initialActivity: 100, measuredActivity: 93, tritium: 15, stratigraphicAge: 300 },
  { name: '承德山区泉水', c14Age: 100, delta13C: -10.5, initialActivity: 100, measuredActivity: 98, tritium: 25, stratigraphicAge: 50 },
  { name: '邯郸岩溶水（200m）', c14Age: 3000, delta13C: -7.8, initialActivity: 100, measuredActivity: 70, tritium: 2, stratigraphicAge: 2500 },
  { name: '张家口坝上水（80m）', c14Age: 800, delta13C: -9.5, initialActivity: 100, measuredActivity: 90, tritium: 8, stratigraphicAge: 500 },
];

// ═══════════════════════════════════════════════════════
// 批量计算
// ═══════════════════════════════════════════════════════

export function calcAllSprings(): SpringFrequencyResult[] {
  return PRESET_SPRINGS.map(s => calcSpringFrequency(s));
}

export function calcAllAquifers(): AquiferParamResult[] {
  return PRESET_AQUIFERS.map(a => calcAquiferParams(a));
}

export function calcAllRunoff(): RunoffRestorationResult[] {
  return PRESET_RUNOFF.map(r => calcRunoffRestoration(r));
}

export function calcAllAges(): GeologicalAgeResult[] {
  return PRESET_AGES.map(a => calcGeologicalAge(a));
}
