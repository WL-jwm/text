/* 自动拆分生成：common 域交叉校验函数 */
import type { ValidationIssue } from '../dataValidation';

import { dataSourceRegistry } from '../dataSourceRegistry';
import { dbMeta } from '../dbMeta';

export function validateDataFreshness(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const lastDbUpdate = new Date(dbMeta.lastUpdate);
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  for (const entry of dataSourceRegistry) {
    if (entry.updateFrequency === '年度' && lastDbUpdate < oneYearAgo) {
      issues.push({
        level: 'warning',
        category: 'freshness',
        title: `${entry.module}年度数据可能过时`,
        message: `dbMeta.lastUpdate=${dbMeta.lastUpdate}，超过1年未更新（更新频率：${entry.updateFrequency}）`,
        affectedModules: [entry.module],
        blocking: false,
        fixSuggestion: `更新${entry.module}模块数据至最新年份，并同步更新dbMeta.lastUpdate`,
        canAutoFix: false,
      });
    }
  }

  return issues;
}

export function validateDataSourceCoverage(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const registered = new Set(dataSourceRegistry.map(s => s.module));

  // 检查searchIndex/changelog外的所有数据模块
  const requiredModules = [
    'resources', 'environment', 'waterQuality', 'geology',
    'systemZoning', 'exploitation', 'hydrochemistry', 'groundwaterFunction',
    'groundwaterResources', 'hydroParams', 'zoneParams', 'backgroundValues',
    'waterSource', 'karstWater', 'fractureWater', 'geothermal',
    'mineralWater', 'salineWater', 'salineSoil', 'mineHydrogeology',
    'hydrogeologyHistorical', 'hydrogeologyReference', 'mapData',
  ];

  for (const mod of requiredModules) {
    if (!registered.has(mod)) {
      issues.push({
        level: 'error',
        category: 'completeness',
        title: `数据模块 ${mod} 未注册数据源`,
        message: '请在dataSourceRegistry中添加溯源信息',
        affectedModules: [mod],
        blocking: true,
        fixSuggestion: `在dataSourceRegistry.ts中为${mod}模块添加数据源条目，包含来源、更新频率、负责人等信息`,
        canAutoFix: false,
      });
    }
  }

  return issues;
}
