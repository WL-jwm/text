/* eslint-disable @typescript-eslint/no-explicit-any */
/* 自动拆分生成：waterResources 域交叉校验函数 */
import type { ValidationIssue } from '../dataValidation';

import { groundwaterExploitation2024, overExploitControl2024 } from '../exploitation';
import { cityExploitationPotential } from '../groundwaterResources';
import { cityWaterSupply2024 } from '../resources';

export function validateCitySupplyConsistency(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const city of cityWaterSupply2024) {
    const ratio = city.gwSupply / city.totalSupply;
    if (city.gwRatio && Math.abs(ratio - city.gwRatio / 100) > 0.01) {
      issues.push({
        level: 'error',
        category: 'consistency',
        title: `${city.city}供水量比例不一致`,
        message: `计算比例 ${(ratio * 100).toFixed(1)}% vs 标注比例 ${city.gwRatio}%`,
        affectedModules: ['resources'],
        blocking: false,
        fixSuggestion: `将gwRatio更新为${(ratio * 100).toFixed(1)}，或修正gwSupply/totalSupply数据`,
        canAutoFix: false,
      });
    }
    if (city.gwSupply > city.totalSupply) {
      issues.push({
        level: 'error',
        category: 'range',
        title: `${city.city}地下水供水量超过总供水量`,
        message: `${city.gwSupply}亿m³ > ${city.totalSupply}亿m³`,
        affectedModules: ['resources'],
        blocking: true,
        fixSuggestion: `核实${city.city}的gwSupply(${city.gwSupply})和totalSupply(${city.totalSupply})数据，地下水占比不应超过100%`,
        canAutoFix: false,
      });
    }
  }

  return issues;
}

export function validateSupplyStatisticalOutliers(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const ratios = cityWaterSupply2024.map(c => c.gwSupply / c.totalSupply).filter(r => !isNaN(r) && isFinite(r));
  if (ratios.length < 3) return issues;

  const mean = ratios.reduce((a, b) => a + b, 0) / ratios.length;
  const std = Math.sqrt(ratios.reduce((a, b) => a + (b - mean) ** 2, 0) / ratios.length);
  const upper = mean + 2 * std;
  const lower = mean - 2 * std;

  for (const city of cityWaterSupply2024) {
    const ratio = city.gwSupply / city.totalSupply;
    if (isNaN(ratio)) continue;
    if (ratio > upper) {
      issues.push({
        level: 'info', category: 'statistical',
        title: `${city.city}地下水占比显著偏高`,
        message: `占比${(ratio * 100).toFixed(1)}%，均值${(mean * 100).toFixed(1)}%±2σ=[${(lower * 100).toFixed(1)}%, ${(upper * 100).toFixed(1)}%]`,
        affectedModules: ['resources'], blocking: false,
        fixSuggestion: `核实${city.city}地下水占比是否因特殊地质/气候条件导致`,
        canAutoFix: false,
      });
    }
    if (ratio < lower && ratio >= 0) {
      issues.push({
        level: 'info', category: 'statistical',
        title: `${city.city}地下水占比显著偏低`,
        message: `占比${(ratio * 100).toFixed(1)}%，均值${(mean * 100).toFixed(1)}%±2σ=[${(lower * 100).toFixed(1)}%, ${(upper * 100).toFixed(1)}%]`,
        affectedModules: ['resources'], blocking: false,
        fixSuggestion: `核实${city.city}是否以地表水为主，地下水占比偏低是否合理`,
        canAutoFix: false,
      });
    }
  }
  return issues;
}

export function validatePotentialExploitationMatch(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const pot of cityExploitationPotential) {
    const p = pot as any;
    if (!p.city) continue;
    const exploit = groundwaterExploitation2024.find((e: any) => e.city === p.city);
    if (!exploit) continue;
    if (p.potential > 50000 && exploit.total < 10000) {
      issues.push({
        level: 'info', category: 'business',
        title: `${p.city}开采潜力大但实际开采量小`,
        message: `潜力${p.potential}万m³，实际开采${exploit.total}万m³，利用率不足20%`,
        affectedModules: ['groundwaterResources', 'exploitation'], blocking: false,
        fixSuggestion: `核实${p.city}开采潜力数据，或确认是否因水质/政策限制导致开采量低`,
        canAutoFix: false,
      });
    }
    if (p.potential < 5000 && exploit.total > 20000) {
      issues.push({
        level: 'warning', category: 'business',
        title: `${p.city}开采潜力小但实际开采量大`,
        message: `潜力仅${p.potential}万m³，实际开采${exploit.total}万m³，超采风险高`,
        affectedModules: ['groundwaterResources', 'exploitation'], blocking: false,
        fixSuggestion: `核实${p.city}开采量是否超出可开采资源量，建议控制开采规模`,
        canAutoFix: false,
      });
    }
  }
  return issues;
}

export function validateExploitationRanking(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const sorted = [...groundwaterExploitation2024].sort((a: any, b: any) => (b.total || 0) - (a.total || 0));
  if (sorted.length < 3) return issues;

  const bottom3 = sorted.slice(-3).map((e: any) => e.city);

  const agriCities = ['邯郸', '邢台', '保定', '沧州'];
  for (const city of agriCities) {
    if (bottom3.includes(city)) {
      issues.push({
        level: 'info', category: 'business',
        title: `${city}开采量排名偏低（南水北调压采成效）`,
        message: `农业大市${city}开采量排在后3位，降幅65.2%为全省最高，南水北调替代9.5亿m³，咸水面积100%限制浅层开采`,
        affectedModules: ['exploitation'], blocking: false,
        fixSuggestion: `南水北调压采政策效果显著，开采量偏低属正常现象`,
        canAutoFix: false,
      });
    }
  }
  return issues;
}

export function validateExploitationStructure(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const e of groundwaterExploitation2024) {
    const item = e as any;
    if (!item.city || !item.total) continue;
    const agriRatio = item.total > 0 ? ((item.agriculture || 0) / item.total) * 100 : 0;
    const lifeRatio = item.total > 0 ? ((item.domestic || 0) / item.total) * 100 : 0;

    if (agriRatio > 90) {
      issues.push({
        level: 'info', category: 'business',
        title: `${item.city}农业开采占比极高`,
        message: `农业占比${agriRatio.toFixed(1)}%，需关注农业节水潜力`,
        affectedModules: ['exploitation'], blocking: false,
        fixSuggestion: `评估${item.city}农业节水潜力，推进高效节水灌溉`,
        canAutoFix: false,
      });
    }
    if (lifeRatio > 50) {
      issues.push({
        level: 'info', category: 'business',
        title: `${item.city}生活开采占比高`,
        message: `生活占比${lifeRatio.toFixed(1)}%，需关注供水安全保障`,
        affectedModules: ['exploitation'], blocking: false,
        fixSuggestion: `评估${item.city}地表水替代地下水用于生活供水的可行性`,
        canAutoFix: false,
      });
    }
  }
  return issues;
}

export function validateExploitationChange(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const e of groundwaterExploitation2024) {
    if (e.reductionVs2014 < 0) {
      issues.push({
        level: 'warning',
        category: 'range',
        title: `${e.city}开采量同比2014年增加`,
        message: `降幅 ${e.reductionVs2014}%，负值表示开采量增加，请核实`,
        affectedModules: ['exploitation'],
        blocking: false,
        fixSuggestion: `核实${e.city}2014年基准数据，确认开采量是否确实增加而非数据录入错误`,
        canAutoFix: false,
      });
    }
    if (e.reductionVs2014 > 70) {
      issues.push({
        level: 'info',
        category: 'range',
        title: `${e.city}开采量降幅异常大`,
        message: `降幅 ${e.reductionVs2014}%，超过70%，请核实数据`,
        affectedModules: ['exploitation'],
        blocking: false,
        fixSuggestion: `核实${e.city}2014年基准数据，确认降幅${e.reductionVs2014}%是否合理`,
        canAutoFix: false,
      });
    }

    // 开采量为负检查
    if (e.total < 0) {
      issues.push({
        level: 'error',
        category: 'range',
        title: `${e.city}开采量为负`,
        message: `总开采量 ${e.total}万m³，不应为负值`,
        affectedModules: ['exploitation'],
        blocking: true,
        fixSuggestion: `将${e.city}的total取绝对值，或核实原始数据`,
        canAutoFix: true,
      });
    }
  }

  // 检查overExploitControl2024中的水位回升数据
  const control = overExploitControl2024 as any;
  if (control?.waterLevelRecovery?.cities) {
    for (const c of control.waterLevelRecovery.cities) {
      if (c.rise !== undefined && c.rise < 0) {
        issues.push({
          level: 'warning',
          category: 'range',
          title: `${c.city}水位回升值为负`,
          message: `回升 ${c.rise}m，表示水位仍在下降`,
          affectedModules: ['exploitation'],
          blocking: false,
          fixSuggestion: `核实${c.city}水位数据，回升值为负表示水位下降，确认是否应为正数`,
          canAutoFix: false,
        });
      }
    }
  }

  return issues;
}
