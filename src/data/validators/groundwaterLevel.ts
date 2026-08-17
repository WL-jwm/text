/* eslint-disable @typescript-eslint/no-explicit-any */
/* 自动拆分生成：groundwaterLevel 域交叉校验函数 */
import type { ValidationIssue } from '../dataValidation';

import { waterLevelRecovery } from '../groundwaterFunction';
import { TS_FULL_YEARS, cityWaterLevelYearly } from '../historicalTimeSeries';

export function validateWaterLevelRecovery(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const recovery = waterLevelRecovery as any;

  // 检查annualData中每年的水位埋深和回升值
  if (Array.isArray(recovery?.annualData)) {
    for (const item of recovery.annualData) {
      if (item.shallowDepth !== undefined && item.shallowDepth < 0) {
        issues.push({
          level: 'error',
          category: 'range',
          title: `${item.year}年浅层水位埋深为负`,
          message: `埋深 ${item.shallowDepth}m 不应为负值`,
          affectedModules: ['groundwaterFunction'],
          blocking: false,
          fixSuggestion: `将${item.year}年的shallowDepth取绝对值`,
          canAutoFix: true,
        });
      }
      if (item.deepDepth !== undefined && item.deepDepth < 0) {
        issues.push({
          level: 'error',
          category: 'range',
          title: `${item.year}年深层水位埋深为负`,
          message: `埋深 ${item.deepDepth}m 不应为负值`,
          affectedModules: ['groundwaterFunction'],
          blocking: false,
          fixSuggestion: `将${item.year}年的deepDepth取绝对值`,
          canAutoFix: true,
        });
      }
      if (item.shallowRise !== undefined && item.shallowRise < 0) {
        issues.push({
          level: 'warning',
          category: 'range',
          title: `${item.year}年浅层水位回升为负`,
          message: `回升 ${item.shallowRise}m，可能表示水位继续下降`,
          affectedModules: ['groundwaterFunction'],
          blocking: false,
          fixSuggestion: `核实${item.year}年浅层水位数据，回升值为负表示水位下降，确认是否应为正数`,
          canAutoFix: false,
        });
      }
      if (item.deepRise !== undefined && item.deepRise < 0) {
        issues.push({
          level: 'warning',
          category: 'range',
          title: `${item.year}年深层水位回升为负`,
          message: `回升 ${item.deepRise}m，可能表示水位继续下降`,
          affectedModules: ['groundwaterFunction'],
          blocking: false,
          fixSuggestion: `核实${item.year}年深层水位数据，回升值为负表示水位下降，确认是否应为正数`,
          canAutoFix: false,
        });
      }
    }
  }

  return issues;
}

export function validateOverdraftDepthTrend(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const recovery = waterLevelRecovery as any;
  if (!Array.isArray(recovery?.annualData) || recovery.annualData.length < 2) return issues;

  const data = recovery.annualData;
  for (let i = 1; i < data.length; i++) {
    const prev = data[i - 1];
    const curr = data[i];
    if (prev.shallowDepth !== undefined && curr.shallowDepth !== undefined) {
      const change = prev.shallowDepth - curr.shallowDepth;
      if (change > 5) {
        issues.push({
          level: 'info', category: 'business',
          title: `${curr.year}年浅层水位大幅回升`,
          message: `较${prev.year}年回升${change.toFixed(1)}m，超采区水位回升过快需核实`,
          affectedModules: ['groundwaterFunction'], blocking: false,
          fixSuggestion: `核实${curr.year}年浅层水位数据，确认是否因补给条件变化或数据错误`,
          canAutoFix: false,
        });
      }
    }
  }
  return issues;
}

export function validateTimeSeriesCompleteness(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const expectedYears = [2020, 2021, 2022, 2023, 2024];

  const recovery = waterLevelRecovery as any;
  if (Array.isArray(recovery?.annualData)) {
    const years = new Set(recovery.annualData.map((d: any) => d.year));
    const missing = expectedYears.filter(y => !years.has(y));
    if (missing.length > 0) {
      issues.push({
        level: 'warning', category: 'completeness',
        title: `水位恢复数据缺少${missing.length}个年份`,
        message: `缺少: ${missing.join('、')}年`,
        affectedModules: ['groundwaterFunction'], blocking: false,
        fixSuggestion: `补充水位恢复数据中${missing.join('、')}年的annualData记录`,
        canAutoFix: false,
      });
    }
  }
  return issues;
}

export function validateWaterLevelAbruptChange(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const [city, data] of Object.entries(cityWaterLevelYearly)) {
    for (let i = 1; i < TS_FULL_YEARS.length; i++) {
      const prev = data[TS_FULL_YEARS[i - 1]];
      const curr = data[TS_FULL_YEARS[i]];
      if (prev == null || curr == null) continue;
      const change = Math.abs(curr - prev);
      if (change > 3) {
        issues.push({
          level: 'warning', category: 'range',
          title: `${city}${TS_FULL_YEARS[i]}年水位埋深突变`,
          message: `${TS_FULL_YEARS[i - 1]}年${prev}m→${TS_FULL_YEARS[i]}年${curr}m，变化${change.toFixed(1)}m，正常年际变幅0.5~2m`,
          affectedModules: ['hydrogeologyHistorical'], blocking: false,
          fixSuggestion: `核实${city}${TS_FULL_YEARS[i]}年水位数据，确认是否因开采政策突变或监测点变更`,
          canAutoFix: false,
        });
      }
    }
  }
  return issues;
}

export function validateWaterLevelRange(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const [city, data] of Object.entries(cityWaterLevelYearly)) {
    for (const year of TS_FULL_YEARS) {
      const val = data[year];
      if (val == null) continue;
      if (val < 0) {
        issues.push({
          level: 'error', category: 'range',
          title: `${city}${year}年水位埋深为负`,
          message: `埋深${val}m不应为负值`,
          affectedModules: ['hydrogeologyHistorical'], blocking: true,
          fixSuggestion: `将${city}${year}年水位取绝对值`,
          canAutoFix: true,
        });
      }
      if (val > 60) {
        issues.push({
          level: 'warning', category: 'range',
          title: `${city}${year}年水位埋深异常偏大`,
          message: `埋深${val}m，河北平原浅层地下水典型范围0~60m`,
          affectedModules: ['hydrogeologyHistorical'], blocking: false,
          fixSuggestion: `核实${city}${year}年是否为深层承压水数据误录入浅层`,
          canAutoFix: false,
        });
      }
    }
  }
  return issues;
}

export function validateWaterLevelRecoveryTrend(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const [city, data] of Object.entries(cityWaterLevelYearly)) {
    const v2018 = data[2018];
    const v2024 = data[2024];
    if (v2018 == null || v2024 == null) continue;
    if (v2024 > v2018) {
      issues.push({
        level: 'warning', category: 'business',
        title: `${city}2018-2024水位持续下降`,
        message: `2018年埋深${v2018}m→2024年${v2024}m，水位下降${(v2024 - v2018).toFixed(1)}m，全省2018年起普遍回升`,
        affectedModules: ['hydrogeologyHistorical'], blocking: false,
        fixSuggestion: `核实${city}超采治理措施落实情况，水位未回升可能因开采结构或补给条件限制`,
        canAutoFix: false,
      });
    }
  }
  return issues;
}

export function validateRegionalInternalConsistency(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const groups: Record<string, string[]> = {
    '山区': ['张家口', '承德', '秦皇岛'],
    '山前平原': ['石家庄', '保定', '唐山'],
    '中部平原': ['邯郸', '邢台', '衡水'],
    '滨海平原': ['沧州', '廊坊'],
  };
  for (const [region, cities] of Object.entries(groups)) {
    const wlVals = cities.map(c => cityWaterLevelYearly[c]?.[2024]).filter((v): v is number => v != null);
    if (wlVals.length < 2) continue;
    const wlRange = Math.max(...wlVals) - Math.min(...wlVals);
    if (wlRange > 20) {
      issues.push({
        level: 'info', category: 'consistency',
        title: `${region}水位埋深差异过大`,
        message: `2024年埋深范围${Math.min(...wlVals)}~${Math.max(...wlVals)}m，极差${wlRange.toFixed(1)}m`,
        affectedModules: ['hydrogeologyHistorical'], blocking: false,
        fixSuggestion: `核实${region}内各市监测井位置和含水层位是否一致`,
        canAutoFix: false,
      });
    }
  }
  return issues;
}
