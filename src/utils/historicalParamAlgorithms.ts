/**
 * 历史水文地质参数计算 — 核心算法
 *  泉流量频率(P-III) / 含水层参数(3法) / 径流还原 / 地质年龄(14C/氚)
 */

import type { SpringFrequencyInput, SpringFrequencyResult, AquiferParamInput, AquiferParamResult, RunoffRestorationInput, RunoffRestorationResult, GeologicalAgeInput, GeologicalAgeResult } from './historicalParamTypes';
import { mean, std, round, piiiQuantile } from './historicalParamUtils';

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
