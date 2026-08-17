/* eslint-disable @typescript-eslint/no-explicit-any */
/* 自动拆分生成：business 域交叉校验函数 */
import type { ValidationIssue } from '../dataValidation';

import { groundwaterExploitation2024 } from '../exploitation';
import { cityOverdraftZones, restrictedZones } from '../groundwaterFunction';
import { cityWaterBalance } from '../groundwaterResources';
import { TS_FULL_YEARS, cityQualityYearly, citySubsidenceYearly, cityWaterLevelYearly } from '../historicalTimeSeries';
import { cityWaterSupply2024 } from '../resources';
import { cityGroundwater2024 } from '../resources-core';

export function validateCityCoverageConsistency(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const allCities = new Set<string>();

  // 收集各模块的城市名
  const moduleCities: Record<string, Set<string>> = {};

  cityGroundwater2024.forEach(c => allCities.add(c.city));
  moduleCities['resources'] = new Set(cityGroundwater2024.map(c => c.city));

  cityWaterSupply2024.forEach(c => allCities.add(c.city));
  moduleCities['waterSupply'] = new Set(cityWaterSupply2024.map(c => c.city));

  if (Array.isArray(cityOverdraftZones)) {
    cityOverdraftZones.forEach(c => allCities.add(c.city));
    moduleCities['overdraft'] = new Set(cityOverdraftZones.map(c => c.city));
  }

  if (Array.isArray(cityWaterBalance)) {
    cityWaterBalance.forEach(c => allCities.add(c.city));
    moduleCities['waterBalance'] = new Set((cityWaterBalance as any[]).map(c => c.city));
  }

  // 检查差异
  const baseCities = moduleCities['resources'];
  if (!baseCities) return issues;

  const sourceEntries = Object.entries(moduleCities).filter(([k]) => k !== 'resources');
  for (const [mod, cities] of sourceEntries) {
    const missing = [...baseCities].filter(c => !cities.has(c));
    const extra = [...cities].filter(c => !baseCities.has(c));
    if (missing.length > 0) {
      issues.push({
        level: 'warning',
        category: 'completeness',
        title: `${mod}缺少${missing.length}个城市数据`,
        message: `缺少: ${missing.join('、')}`,
        affectedModules: ['resources', mod],
        blocking: false,
        fixSuggestion: `在${mod}模块中补充${missing.join('、')}的数据`,
        canAutoFix: false,
      });
    }
    if (extra.length > 0) {
      issues.push({
        level: 'info',
        category: 'consistency',
        title: `${mod}多出${extra.length}个城市`,
        message: `多出: ${extra.join('、')}`,
        affectedModules: ['resources', mod],
        blocking: false,
        fixSuggestion: `核实${mod}模块中${extra.join('、')}是否应为有效城市，或补充到resources模块`,
        canAutoFix: false,
      });
    }
  }

  // 检查是否覆盖全部11个地级市
  const expected = ['石家庄', '唐山', '秦皇岛', '邯郸', '邢台', '保定', '张家口', '承德', '沧州', '廊坊', '衡水'];
  const missingExpected = expected.filter(c => !allCities.has(c));
  if (missingExpected.length > 0) {
    issues.push({
      level: 'warning',
      category: 'completeness',
      title: `核心模块缺少${missingExpected.length}个地级市`,
      message: `缺少: ${missingExpected.join('、')}`,
      affectedModules: ['resources', 'waterSupply'],
      blocking: false,
      fixSuggestion: `在resources/waterSupply模块中补充${missingExpected.join('、')}的数据`,
      canAutoFix: false,
    });
  }

  return issues;
}

export function validateOverdraftRestrictionMatch(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!Array.isArray(cityOverdraftZones)) return issues;

  const overdraftCities = new Set(cityOverdraftZones
    .filter((c: any) => c.city)
    .map((c: any) => c.city));

  const restricted = restrictedZones as any;
  const allRestricted = [
    ...(restricted.forbidden || []),
    ...(restricted.limited || []),
  ];
  const restrictedCities = new Set(
    allRestricted.filter((z: any) => z.city).map((z: any) => z.city)
  );

  // 禁采区城市应存在于超采区列表
  for (const city of restrictedCities) {
    if (!overdraftCities.has(city)) {
      issues.push({
        level: 'warning',
        category: 'consistency',
        title: `${city}有禁采区但未在超采区列表中`,
        message: '禁采区应在超采区范围内',
        affectedModules: ['groundwaterFunction'],
        blocking: false,
        fixSuggestion: `在cityOverdraftZones中添加${city}的超采区信息，或在restrictedZones中移除${city}`,
        canAutoFix: false,
      });
    }
  }

  return issues;
}

export function validateForbiddenZoneExploitation(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const restricted = restrictedZones as any;
  const forbidden = restricted?.forbidden || [];
  for (const zone of forbidden) {
    const z = zone as any;
    if (!z.city) continue;
    const exploit = groundwaterExploitation2024.find((e: any) => e.city === z.city);
    if (exploit && exploit.total > 0) {
      issues.push({
        level: 'warning', category: 'business',
        title: `${z.city}禁采区仍有深层开采活动`,
        message: `禁采区存在但${z.city}仍有开采量${exploit.total}万m³（浅层${exploit.shallow}万m³+深层${exploit.deep}万m³），禁采区仅限制深层承压水，浅层开采合理`,
        affectedModules: ['groundwaterFunction', 'exploitation'], blocking: false,
        fixSuggestion: `核实${z.city}深层开采井(${exploit.deep}万m³)是否位于禁采区内或存在特殊豁免；浅层开采(${exploit.shallow}万m³)不受禁采区限制`,
        canAutoFix: false,
      });
    }
  }
  return issues;
}

export function validateHistoricalDataCoverage(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const expectedCities = ['石家庄', '保定', '邯郸', '邢台', '沧州', '衡水', '廊坊', '唐山', '秦皇岛', '张家口', '承德'];
  for (const dataset of [cityWaterLevelYearly, citySubsidenceYearly, cityQualityYearly]) {
    for (const city of expectedCities) {
      if (!dataset[city]) {
        issues.push({
          level: 'error', category: 'completeness',
          title: `历史数据缺少城市: ${city}`,
          message: `expectedCities中${city}在历史数据集中缺失`,
          affectedModules: ['hydrogeologyHistorical'], blocking: true,
          fixSuggestion: `在historicalTimeSeries.ts中补充${city}的历史数据`,
          canAutoFix: false,
        });
      } else {
        for (const year of TS_FULL_YEARS) {
          if (dataset[city][year] == null) {
            issues.push({
              level: 'warning', category: 'completeness',
              title: `${city}${year}年历史数据缺失`,
              message: `数据集中该年份值为null/undefined`,
              affectedModules: ['hydrogeologyHistorical'], blocking: false,
              fixSuggestion: `补充${city}${year}年的数据值`,
              canAutoFix: false,
            });
          }
        }
      }
    }
  }
  return issues;
}
