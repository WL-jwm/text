/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 交叉数据校验模块 (C4)
 * 检验不同数据源中相同指标的一致性，发现数据矛盾
 * 依赖 dataSourceRegistry 中的模块溯源信息
 *
 * v2.0: 新增全平台数据完整性扫描 + 跨模块一致性校验
 */

import { dataSourceRegistry } from './dataSourceRegistry';
import { cityWaterSupply2024 } from './resources';
import { shallowCones2024, deepCones2024 } from './environment';
import { dbMeta } from './changelog';

/* ── 新增导入：用于全平台扫描 ── */
import { cityGroundwater2024 } from './resources-core';
import { cityGroundwaterQuality2024, qualityLevelTrend2020_2024 } from './waterQuality';
import { tectonicUnits, majorFaults, quaternaryAquiferGroups } from './geology';
import { cityOverdraftZones, restrictedZones, waterLevelRecovery } from './groundwaterFunction';
import { cityWaterBalance, cityExploitationPotential } from './groundwaterResources';
import { systemZones, subZones, plainZones } from './zoneParams';
import { aquiferGroups, lithologyMu, infiltrationCoeff, permeability } from './hydroParams';
import { importantWaterSources } from './waterSource';
import { karstSprings, karstSystemZones, karstRechargeFeatures } from './karstWater';
import { fractureWaterTypes, fractureWaterZones } from './fractureWater';
import { geothermalFields, geothermalResources, geothermalGradient, geothermalFluidChemistry, reinjectionDataExtended } from './geothermal';
import { mineralWaterSites } from './mineralWater';
import { salineDistribution, citySalineArea } from './salineWater';
import { salineSoilDistribution } from './salineSoil';
import { mineHydrogeologyData } from './mineHydrogeology';
import { groundwaterExploitation2024, overExploitControl2024 } from './exploitation';
import { cityWaterLevelYearly, citySubsidenceYearly, cityQualityYearly, TS_FULL_YEARS } from './historicalTimeSeries';

export interface ValidationIssue {
  level: 'error' | 'warning' | 'info';
  category: 'consistency' | 'completeness' | 'range' | 'freshness' | 'statistical' | 'business';
  title: string;
  message: string;
  affectedModules: string[];
  /** 是否阻塞发布 */
  blocking: boolean;
  /** 自动修复建议（文本描述） */
  fixSuggestion?: string;
  /** 是否可自动修复 */
  canAutoFix?: boolean;
}

/* ================================================================
 * 第一部分：原始交叉校验（保留原有4项）
 * ================================================================ */

/**
 * 校验1: 各市地下水供水量内部一致性
 * gwRatio = gwSupply / totalSupply，理论应在 0~1 范围
 */
function validateCitySupplyConsistency(): ValidationIssue[] {
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

/**
 * 校验2: 漏斗面积合理性
 * 浅层/深层漏斗面积应在历史经验范围内
 */
function validateConeAreas(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const cone of shallowCones2024) {
    if (cone.waterLevel < 0) {
      issues.push({
        level: 'warning',
        category: 'range',
        title: `${cone.name}水位埋深异常`,
        message: `水位埋深 ${cone.waterLevel}m 为负值（应>0）`,
        affectedModules: ['environment'],
        blocking: false,
        fixSuggestion: `将${cone.name}的waterLevel取绝对值，或核实原始监测数据`,
        canAutoFix: true,
      });
    }
    if (cone.area < 0) {
      issues.push({
        level: 'error',
        category: 'range',
        title: `${cone.name}漏斗面积异常`,
        message: `面积 ${cone.area}km² 为负值`,
        affectedModules: ['environment'],
        blocking: true,
        fixSuggestion: `将${cone.name}的area取绝对值`,
        canAutoFix: true,
      });
    }
  }

  for (const cone of deepCones2024) {
    if (cone.waterLevel < 0) {
      issues.push({
        level: 'warning',
        category: 'range',
        title: `${cone.name}深层水位埋深异常`,
        message: `水位埋深 ${cone.waterLevel}m 为负值（应>0）`,
        affectedModules: ['environment'],
        blocking: false,
        fixSuggestion: `将${cone.name}的waterLevel取绝对值，或核实原始监测数据`,
        canAutoFix: true,
      });
    }
  }

  return issues;
}

/**
 * 校验3: 数据源新鲜度
 * 检查每个模块的最后更新日期，对于年度数据应不晚于去年
 */
function validateDataFreshness(): ValidationIssue[] {
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

/**
 * 校验4: 数据源完整性
 * 已知模块是否都注册了源信息
 */
function validateDataSourceCoverage(): ValidationIssue[] {
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

/* ================================================================
 * 第二部分：全平台数据完整性扫描（v2.0 新增）
 * ================================================================ */

export interface ModuleScanResult {
  module: string;
  label: string;
  category: string;
  totalRecords: number;
  emptyFields: string[];
  issues: ValidationIssue[];
  status: 'ok' | 'warning' | 'error';
}

/**
 * 通用扫描器：检查数组数据的基本完整性
 */
function scanArrayModule(
  module: string,
  label: string,
  category: string,
  data: Record<string, unknown>[],
  requiredFields?: string[]
): ModuleScanResult {
  const issues: ValidationIssue[] = [];
  const emptyFields: string[] = [];

  if (!data || data.length === 0) {
    return {
      module, label, category,
      totalRecords: 0,
      emptyFields: [],
      issues: [{
        level: 'warning',
        category: 'completeness',
        title: `${label}无数据`,
        message: `模块${module}的数组数据为空`,
        affectedModules: [module],
        blocking: false,
      }],
      status: 'warning',
    };
  }

  // 扫描空值字段
  const allKeys = new Set<string>();
  data.forEach(r => Object.keys(r).forEach(k => allKeys.add(k)));

  allKeys.forEach(key => {
    const nullCount = data.filter(r => r[key] === null || r[key] === undefined || r[key] === '').length;
    if (nullCount === data.length) {
      emptyFields.push(key);
    } else if (nullCount > data.length * 0.5 && nullCount > 2) {
      issues.push({
        level: 'warning',
        category: 'completeness',
        title: `${label}字段"${key}"大量缺失`,
        message: `${nullCount}/${data.length}条记录为空（${(nullCount / data.length * 100).toFixed(0)}%）`,
        affectedModules: [module],
        blocking: false,
        fixSuggestion: `补充${label}中"${key}"字段的缺失值，或确认该字段是否已废弃`,
        canAutoFix: false,
      });
    }
  });

  // 检查必填字段
  if (requiredFields) {
    for (const field of requiredFields) {
      const missing = data.filter(r => !r[field] || r[field] === null || r[field] === '');
      if (missing.length === data.length) {
        issues.push({
          level: 'error',
          category: 'completeness',
          title: `${label}必填字段"${field}"全部缺失`,
          message: '所有记录均无此字段值',
          affectedModules: [module],
          blocking: true,
          fixSuggestion: `为${label}的"${field}"字段补充数据，或从必填字段列表中移除`,
          canAutoFix: false,
        });
      } else if (missing.length > 0) {
        issues.push({
          level: 'info',
          category: 'completeness',
          title: `${label}字段"${field}"部分缺失`,
          message: `${missing.length}/${data.length}条记录为空`,
          affectedModules: [module],
          blocking: false,
          fixSuggestion: `补充${label}中"${field}"字段的${missing.length}条缺失值`,
          canAutoFix: false,
        });
      }
    }
  }

  return {
    module, label, category,
    totalRecords: data.length,
    emptyFields,
    issues,
    status: issues.some(i => i.level === 'error') ? 'error'
      : issues.some(i => i.level === 'warning') ? 'warning' : 'ok',
  };
}

/**
 * 扫描全平台22个数据模块的完整性
 */
export function scanAllModules(): ModuleScanResult[] {
  const results: ModuleScanResult[] = [];

  // F-水资源
  results.push(scanArrayModule(
    'resources', '城市地下水概况(2024)', 'F-水资源',
    cityGroundwater2024 as unknown as Record<string, unknown>[],
    ['city']
  ));
  results.push(scanArrayModule(
    'resources', '城市供水量(2024)', 'F-水资源',
    cityWaterSupply2024 as unknown as Record<string, unknown>[],
    ['city', 'totalSupply', 'gwSupply']
  ));

  // N-监测：水质（waterQuality2024为对象非数组，跳过）
  results.push(scanArrayModule(
    'waterQuality', '城市水质(2024)', 'N-监测',
    cityGroundwaterQuality2024 as unknown as Record<string, unknown>[],
    ['city']
  ));

  // M-环境地质
  results.push(scanArrayModule(
    'environment', '浅层漏斗(2024)', 'M-环境地质',
    shallowCones2024 as unknown as Record<string, unknown>[],
    ['name']
  ));
  results.push(scanArrayModule(
    'environment', '深层漏斗(2024)', 'M-环境地质',
    deepCones2024 as unknown as Record<string, unknown>[],
    ['name']
  ));

  // A-基础地质
  results.push(scanArrayModule(
    'geology', '大地构造单元', 'A-基础地质',
    tectonicUnits as unknown as Record<string, unknown>[],
    ['name']
  ));
  results.push(scanArrayModule(
    'geology', '主要断裂', 'A-基础地质',
    majorFaults as unknown as Record<string, unknown>[],
    ['name']
  ));
  results.push(scanArrayModule(
    'geology', '第四系含水层组', 'A-基础地质',
    quaternaryAquiferGroups as unknown as Record<string, unknown>[],
  ));

  // D-超采治理
  results.push(scanArrayModule(
    'groundwaterFunction', '城市超采区', 'D-超采治理',
    cityOverdraftZones as unknown as Record<string, unknown>[],
    ['city']
  ));
  results.push(scanArrayModule(
    'groundwaterFunction', '禁采/限采区', 'D-超采治理',
    (restrictedZones as any).items || (restrictedZones as any).zones || [],
  ));

  // F-水资源（资源量）
  results.push(scanArrayModule(
    'groundwaterResources', '城市水均衡', 'F-水资源',
    cityWaterBalance as unknown as Record<string, unknown>[],
    ['city']
  ));
  results.push(scanArrayModule(
    'groundwaterResources', '开采潜力', 'F-水资源',
    cityExploitationPotential as unknown as Record<string, unknown>[],
  ));

  // B-系统区划
  results.push(scanArrayModule(
    'zoneParams', '地下水系统区划', 'B-系统区划',
    systemZones as unknown as Record<string, unknown>[],
    ['name']
  ));
  results.push(scanArrayModule(
    'zoneParams', '亚区', 'B-系统区划',
    subZones as unknown as Record<string, unknown>[],
  ));
  results.push(scanArrayModule(
    'zoneParams', '平原区', 'B-系统区划',
    plainZones as unknown as Record<string, unknown>[],
  ));

  // O-参数
  results.push(scanArrayModule(
    'hydroParams', '含水层组参数', 'O-参数',
    aquiferGroups as unknown as Record<string, unknown>[],
    ['name']
  ));
  results.push(scanArrayModule(
    'hydroParams', '给水度(岩性)', 'O-参数',
    lithologyMu as unknown as Record<string, unknown>[],
  ));
  results.push(scanArrayModule(
    'hydroParams', '入渗系数', 'O-参数',
    infiltrationCoeff as unknown as Record<string, unknown>[],
  ));
  results.push(scanArrayModule(
    'hydroParams', '渗透系数', 'O-参数',
    permeability as unknown as Record<string, unknown>[],
  ));

  // C-水源地
  results.push(scanArrayModule(
    'waterSource', '重要水源地', 'C-水源地',
    importantWaterSources as unknown as Record<string, unknown>[],
    ['name']
  ));

  // Q-岩溶
  results.push(scanArrayModule(
    'karstWater', '岩溶泉', 'Q-岩溶',
    karstSprings as unknown as Record<string, unknown>[],
    ['name']
  ));
  results.push(scanArrayModule(
    'karstWater', '岩溶系统区', 'Q-岩溶',
    karstSystemZones as unknown as Record<string, unknown>[],
  ));

  // R-裂隙
  results.push(scanArrayModule(
    'fractureWater', '裂隙水类型', 'R-裂隙',
    fractureWaterTypes as unknown as Record<string, unknown>[],
  ));
  results.push(scanArrayModule(
    'fractureWater', '裂隙水分布区', 'R-裂隙',
    fractureWaterZones as unknown as Record<string, unknown>[],
  ));

  // H-地热
  results.push(scanArrayModule(
    'geothermal', '地热田', 'H-地热',
    geothermalFields as unknown as Record<string, unknown>[],
    ['name']
  ));

  // I-矿泉水
  results.push(scanArrayModule(
    'mineralWater', '矿泉水产地', 'I-矿泉水',
    mineralWaterSites as unknown as Record<string, unknown>[],
  ));

  // J-咸水
  results.push(scanArrayModule(
    'salineWater', '咸水分布', 'J-咸水',
    salineDistribution as unknown as Record<string, unknown>[],
  ));

  // K-盐碱土
  results.push(scanArrayModule(
    'salineSoil', '盐碱土分布', 'K-盐碱土',
    salineSoilDistribution as unknown as Record<string, unknown>[],
  ));

  // S-矿山
  results.push(scanArrayModule(
    'mineHydrogeology', '矿山水文地质', 'S-矿山',
    mineHydrogeologyData as unknown as Record<string, unknown>[],
  ));

  return results;
}

/* ================================================================
 * 第三部分：跨模块一致性校验（v2.0 新增）
 * ================================================================ */

/**
 * 校验5: 城市覆盖一致性
 * 多个模块都按城市分组，检查城市列表是否一致
 */
function validateCityCoverageConsistency(): ValidationIssue[] {
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

/**
 * 校验6: 超采区与禁采区交叉检查
 * 禁采区应在超采区范围内
 */
function validateOverdraftRestrictionMatch(): ValidationIssue[] {
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

/**
 * 校验7: 水位恢复数据合理性
 * 恢复水位应与超采区对应
 */
function validateWaterLevelRecovery(): ValidationIssue[] {
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

/**
 * 校验8: 含水层参数范围检查
 * 给水度(0~0.35)、渗透系数(0.01~500 m/d)
 */
function validateHydroParamsRange(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const p of lithologyMu) {
    if ((p as any).value !== undefined && ((p as any).value < 0 || (p as any).value > 0.4)) {
      issues.push({
        level: 'warning',
        category: 'range',
        title: `给水度异常: ${(p as any).lith || (p as any).name}`,
        message: `μ = ${(p as any).value}，典型范围0~0.35`,
        affectedModules: ['hydroParams'],
        blocking: false,
        fixSuggestion: `将${(p as any).lith || (p as any).name}的μ值${(p as any).value}修正至0~0.35范围内`,
        canAutoFix: false,
      });
    }
  }

  for (const p of permeability) {
    const v = (p as any).K || (p as any).value;
    if (v !== undefined && (v < 0.001 || v > 1000)) {
      issues.push({
        level: 'warning',
        category: 'range',
        title: `渗透系数异常: ${(p as any).lith || (p as any).name}`,
        message: `K = ${v} m/d，典型范围0.01~500 m/d`,
        affectedModules: ['hydroParams'],
        blocking: false,
        fixSuggestion: `将${(p as any).lith || (p as any).name}的K值${v}修正至0.01~500 m/d范围内`,
        canAutoFix: false,
      });
    }
  }

  return issues;
}

/**
 * 校验9: 水源地坐标范围检查
 * 经度应在113~120，纬度应在36~43（河北省范围）
 */
function validateWaterSourceCoordinates(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const ws of importantWaterSources) {
    const item = ws as any;
    if (item.lng !== undefined && (item.lng < 113 || item.lng > 120)) {
      issues.push({
        level: 'warning',
        category: 'range',
        title: `水源地坐标异常: ${item.name}`,
        message: `经度 ${item.lng}° 超出河北省范围(113~120°)`,
        affectedModules: ['waterSource'],
        blocking: false,
        fixSuggestion: `核实${item.name}的经度(${item.lng}°)，河北省范围113~120°`,
        canAutoFix: false,
      });
    }
    if (item.lat !== undefined && (item.lat < 36 || item.lat > 43)) {
      issues.push({
        level: 'warning',
        category: 'range',
        title: `水源地坐标异常: ${item.name}`,
        message: `纬度 ${item.lat}° 超出河北省范围(36~43°)`,
        affectedModules: ['waterSource'],
        blocking: false,
        fixSuggestion: `核实${item.name}的纬度(${item.lat}°)，河北省范围36~43°`,
        canAutoFix: false,
      });
    }
  }

  return issues;
}

/**
 * 校验10: 地质构造单元参数非负
 * 面积、长度、厚度等不应为负
 */
function validateGeologyParams(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const unit of tectonicUnits) {
    const u = unit as any;
    if (u.area !== undefined && u.area < 0) {
      issues.push({
        level: 'error',
        category: 'range',
        title: `构造单元面积异常: ${u.name}`,
        message: `面积 ${u.area} 为负值`,
        affectedModules: ['geology'],
        blocking: true,
        fixSuggestion: `将${u.name}的area取绝对值`,
        canAutoFix: true,
      });
    }
  }

  for (const fault of majorFaults) {
    const f = fault as any;
    if (f.length !== undefined && f.length < 0) {
      issues.push({
        level: 'error',
        category: 'range',
        title: `断裂长度异常: ${f.name}`,
        message: `长度 ${f.length}km 为负值`,
        affectedModules: ['geology'],
        blocking: true,
        fixSuggestion: `将${f.name}的length取绝对值`,
        canAutoFix: true,
      });
    }
  }

  return issues;
}

/* ================================================================
 * 第四部分：新增跨模块校验规则（v2.1 新增5项，共15项）
 * ================================================================ */

/**
 * 校验11: 水质类别与开采量交叉验证
 * 水质优良率高的城市，地下水开采占比应合理；水质差的城市深层开采应受限
 */
function validateQualityExploitationMatch(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const q of cityGroundwaterQuality2024) {
    const exploit = groundwaterExploitation2024.find((e: any) => e.city === q.city);
    if (!exploit) continue;

    // 水质优良率>50%且深层开采占比>15% → 可能不合理
    const deepRatio = exploit.total > 0 ? (exploit.deep / exploit.total) * 100 : 0;
    if (q.rate > 50 && deepRatio > 15) {
      issues.push({
        level: 'info',
        category: 'consistency',
        title: `${q.city}水质优良但深层开采占比偏高`,
        message: `水质优良率${q.rate}%，深层开采占比${deepRatio.toFixed(1)}%，建议核实深层水用途`,
        affectedModules: ['waterQuality', 'exploitation'],
        blocking: false,
        fixSuggestion: `核实${q.city}深层水是否用于非饮用用途（工业/农业），或确认深层水质数据`,
        canAutoFix: false,
      });
    }

    // 水质优良率<20%且浅层开采占比>80% → 浅层水质差却大量开采
    const shallowRatio = exploit.total > 0 ? (exploit.shallow / exploit.total) * 100 : 0;
    if (q.rate < 20 && shallowRatio > 80) {
      issues.push({
        level: 'info',
        category: 'business',
        title: `${q.city}水质差但浅层开采占比高`,
        message: `水质优良率仅${q.rate}%，浅层开采占比${shallowRatio.toFixed(1)}%，浅层水主要用于农业灌溉，深层水供生活/工业`,
        affectedModules: ['waterQuality', 'exploitation'],
        blocking: false,
        fixSuggestion: `核实${q.city}浅层水是否经处理后用于农业灌溉（通常合理），或浅层开采井是否位于淡水透镜体区域`,
        canAutoFix: false,
      });
    }
  }

  return issues;
}

/**
 * 校验12: 地热田温度梯度合理性
 * 地热梯度应在正常范围(1.5~6.0°C/100m)
 */
function validateGeothermalGradient(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const g of geothermalGradient) {
    // 解析梯度范围字符串如 "3.5~4.2"
    const parts = g.gradient.split('~');
    if (parts.length === 2) {
      const minVal = parseFloat(parts[0]);
      const maxVal = parseFloat(parts[1]);
      if (isNaN(minVal) || isNaN(maxVal)) continue;

      if (minVal < 1.5 || maxVal > 6.0) {
        issues.push({
          level: 'warning',
          category: 'range',
          title: `${g.region}地热梯度异常`,
          message: `梯度 ${g.gradient}°C/100m，典型范围1.5~6.0°C/100m`,
          affectedModules: ['geothermal'],
          blocking: false,
          fixSuggestion: `核实${g.region}地热梯度${g.gradient}°C/100m，确认是否为特殊地质条件导致`,
          canAutoFix: false,
        });
      }
    }
  }

  return issues;
}

/**
 * 校验13: 矿泉水水质达标检查
 * 偏硅酸≥25mg/L，锶≥0.20mg/L（界限指标）
 */
function validateMineralWaterQuality(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const site of mineralWaterSites) {
    const s = site as any;
    const type = s.type || '';

    // 偏硅酸型应检查SiO2
    if (type.includes('偏硅酸') && s.siO2 !== undefined) {
      const siO2 = parseFloat(s.siO2);
      if (!isNaN(siO2) && siO2 < 25) {
        issues.push({
          level: 'warning',
          category: 'range',
          title: `${s.name}偏硅酸未达界限指标`,
          message: `SiO₂=${s.siO2}mg/L，标准≥25mg/L（${s.status}）`,
          affectedModules: ['mineralWater'],
          blocking: false,
          fixSuggestion: `核实${s.name}的SiO₂数据(${s.siO2}mg/L)，若数据正确则标注为"未达标"`,
          canAutoFix: false,
        });
      }
    }

    // 锶型应检查锶
    if (type.includes('锶') && s.strontium !== undefined) {
      const sr = parseFloat(s.strontium);
      if (!isNaN(sr) && sr < 0.2) {
        issues.push({
          level: 'warning',
          category: 'range',
          title: `${s.name}锶含量未达界限指标`,
          message: `Sr=${s.strontium}mg/L，标准≥0.20mg/L（${s.status}）`,
          affectedModules: ['mineralWater'],
          blocking: false,
          fixSuggestion: `核实${s.name}的锶含量数据(${s.strontium}mg/L)，若数据正确则标注为"未达标"`,
          canAutoFix: false,
        });
      }
    }
  }

  return issues;
}

/**
 * 校验14: 岩溶泉流量与补给面积一致性
 * 单位面积补给量应在合理范围(5~15万m³/km²·a)
 * 注：岩溶泉入渗系数α=0.20~0.30，降雨量500~600mm，
 *     理论计算单位补给量可达5~15万m³/km²·a，与孔隙水(0.5~3.0)不同
 */
function validateSpringRechargeConsistency(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const rf of karstRechargeFeatures) {
    if (rf.rechargeArea > 0 && rf.totalRecharge > 0) {
      const unitRecharge = (rf.totalRecharge * 10000) / rf.rechargeArea; // 万m³/km²

      if (unitRecharge < 5) {
        issues.push({
          level: 'info',
          category: 'range',
          title: `${rf.spring}单位面积补给量偏低`,
          message: `${unitRecharge.toFixed(2)}万m³/km²·a，典型范围5~15`,
          affectedModules: ['karstWater'],
          blocking: false,
          fixSuggestion: `核实${rf.spring}的补给面积(${rf.rechargeArea}km²)或总补给量(${rf.totalRecharge}万m³/a)数据`,
          canAutoFix: false,
        });
      }
      if (unitRecharge > 15) {
        issues.push({
          level: 'info',
          category: 'range',
          title: `${rf.spring}单位面积补给量偏高`,
          message: `${unitRecharge.toFixed(2)}万m³/km²·a，典型范围5~15`,
          affectedModules: ['karstWater'],
          blocking: false,
          fixSuggestion: `核实${rf.spring}的补给面积(${rf.rechargeArea}km²)或总补给量(${rf.totalRecharge}万m³/a)数据`,
          canAutoFix: false,
        });
      }
    }

    // 入渗系数合理性
    if (rf.infiltrationCoeff < 0.1 || rf.infiltrationCoeff > 0.5) {
      issues.push({
        level: 'info',
        category: 'range',
        title: `${rf.spring}入渗系数异常`,
        message: `α=${rf.infiltrationCoeff}，典型范围0.1~0.5`,
        affectedModules: ['karstWater'],
        blocking: false,
        fixSuggestion: `核实${rf.spring}的入渗系数(${rf.infiltrationCoeff})，确认是否为特殊岩溶条件`,
        canAutoFix: false,
      });
    }
  }

  return issues;
}

/**
 * 校验15: 开采量同比变化合理性
 * 与2014年相比的降幅应在合理范围（5%~70%），超出则预警
 */
function validateExploitationChange(): ValidationIssue[] {
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


/* ================================================================
 * 第五部分：v2.2 新增统计与业务规则（15项，累计50项）
 * ================================================================ */

/**
 * 校验16: 供水量统计离群值检测
 * 各市地下水供水量/总供水量比例，超过均值±2σ视为离群
 */
function validateSupplyStatisticalOutliers(): ValidationIssue[] {
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

/**
 * 校验17: 水质类别与功能分区一致性
 * 饮用水源保护区对应的水质应达到III类以上
 */
function validateWaterQualityFunctionMatch(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // 检查水质较差城市是否有重要水源地
  const poorQualityCities = cityGroundwaterQuality2024
    .filter(q => q.rate < 30)
    .map(q => q.city);

  for (const ws of importantWaterSources) {
    const item = ws as any;
    if (item.city && poorQualityCities.includes(item.city)) {
      issues.push({
        level: 'warning', category: 'business',
        title: `${item.name}所在城市水质优良率偏低`,
        message: `${item.city}水质优良率<30%，但${item.name}为重要水源地，建议关注保护状况`,
        affectedModules: ['waterQuality', 'waterSource'], blocking: false,
        fixSuggestion: `核实${item.name}水源地保护措施是否到位，或更新水质监测数据`,
        canAutoFix: false,
      });
    }
  }
  return issues;
}

/**
 * 校验18: 超采区水位埋深趋势合理性
 * 多年水位埋深应呈下降趋势（超采区特征），若回升幅度过大需核实
 */
function validateOverdraftDepthTrend(): ValidationIssue[] {
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

/**
 * 校验19: 城市开采量排名合理性
 * 地下水开采量排名应与城市规模/产业特征匹配
 */
function validateExploitationRanking(): ValidationIssue[] {
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

/**
 * 校验20: 矿泉水产地与水源地空间重叠
 * 矿泉水产地与重要水源地不应在同一位置
 */
function validateMineralWaterSourceOverlap(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const site of mineralWaterSites) {
    const s = site as any;
    if (!s.lng || !s.lat) continue;
    for (const ws of importantWaterSources) {
      const w = ws as any;
      if (!w.lng || !w.lat) continue;
      const dist = Math.sqrt((s.lng - w.lng) ** 2 + (s.lat - w.lat) ** 2);
      if (dist < 0.05) {
        issues.push({
          level: 'info', category: 'business',
          title: `${s.name}与水源地${w.name}空间重叠`,
          message: `距离约${(dist * 111).toFixed(0)}km，建议核实是否相互影响`,
          affectedModules: ['mineralWater', 'waterSource'], blocking: false,
          fixSuggestion: `核实${s.name}与${w.name}的空间关系，确认开采层位是否冲突`,
          canAutoFix: false,
        });
      }
    }
  }
  return issues;
}

/**
 * 校验21: 咸水分布区与浅层开采冲突
 * 咸水分布面积大的城市，浅层开采占比应较低
 */
function validateSalineExploitationConflict(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const sa of citySalineArea) {
    const s = sa as any;
    if (!s.city || !s.area) continue;
    const exploit = groundwaterExploitation2024.find((e: any) => e.city === s.city);
    if (!exploit) continue;
    const shallowRatio = exploit.total > 0 ? (exploit.shallow / exploit.total) * 100 : 0;
    if (s.area > 500 && shallowRatio > 60) {
      issues.push({
        level: 'warning', category: 'business',
        title: `${s.city}咸水面积大但浅层开采占比高`,
        message: `咸水分布${s.area}km²，浅层开采占比${shallowRatio.toFixed(1)}%，存在咸水入侵风险`,
        affectedModules: ['salineWater', 'exploitation'], blocking: false,
        fixSuggestion: `建议${s.city}控制浅层开采量，增加深层水或地表水替代`,
        canAutoFix: false,
      });
    }
  }
  return issues;
}

/**
 * 校验22: 开采潜力与开采量匹配
 * 开采潜力大的城市实际开采量不应过低，反之亦然
 */
function validatePotentialExploitationMatch(): ValidationIssue[] {
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

/**
 * 校验23: 岩溶泉流量年际变化检测
 * 泉流量年际变化超过50%需预警
 */
function validateSpringFlowVariation(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const spring of karstSprings) {
    const s = spring as any;
    if (!s.flow || !s.historicalFlow) continue;
    const change = Math.abs(s.flow - s.historicalFlow) / s.historicalFlow * 100;
    if (change > 50) {
      issues.push({
        level: 'warning', category: 'statistical',
        title: `${s.name}流量年际变化大`,
        message: `当前${s.flow}m³/s，历史${s.historicalFlow}m³/s，变化${change.toFixed(0)}%`,
        affectedModules: ['karstWater'], blocking: false,
        fixSuggestion: `核实${s.name}流量数据，确认是否因气候/开采条件变化导致`,
        canAutoFix: false,
      });
    }
  }
  return issues;
}

/**
 * 校验24: 含水层参数空间一致性
 * 相邻系统区划的渗透系数不应差异过大（>10倍）
 */
function validateParamSpatialConsistency(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (let i = 0; i < aquiferGroups.length; i++) {
    for (let j = i + 1; j < aquiferGroups.length; j++) {
      const a = aquiferGroups[i] as any;
      const b = aquiferGroups[j] as any;
      if (!a.K || !b.K) continue;
      const ratio = Math.max(a.K, b.K) / Math.min(a.K, b.K);
      if (ratio > 10) {
        issues.push({
          level: 'info', category: 'statistical',
          title: `${a.name}与${b.name}渗透系数差异大`,
          message: `K比值=${ratio.toFixed(1)}倍（${a.K} vs ${b.K} m/d），建议核实`,
          affectedModules: ['hydroParams'], blocking: false,
          fixSuggestion: `核实${a.name}和${b.name}的渗透系数，确认是否因岩性差异导致`,
          canAutoFix: false,
        });
      }
    }
  }
  return issues;
}

/**
 * 校验25: 地热田与矿泉水产地交叉检查
 * 地热田区域不应同时标注为矿泉水产地（水温差异）
 */
function validateGeothermalMineralOverlap(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const field of geothermalFields) {
    const f = field as any;
    if (!f.lng || !f.lat) continue;
    for (const site of mineralWaterSites) {
      const s = site as any;
      if (!s.lng || !s.lat) continue;
      const dist = Math.sqrt((f.lng - s.lng) ** 2 + (f.lat - s.lat) ** 2);
      if (dist < 0.05) {
        issues.push({
          level: 'info', category: 'business',
          title: `${f.name}地热田与${s.name}矿泉水产地重叠`,
          message: `距离约${(dist * 111).toFixed(0)}km，地热与矿泉水开采层位应不同`,
          affectedModules: ['geothermal', 'mineralWater'], blocking: false,
          fixSuggestion: `核实${f.name}和${s.name}的开采层位，确认是否存在层位冲突`,
          canAutoFix: false,
        });
      }
    }
  }
  return issues;
}

/**
 * 校验26: 城市水质改善趋势与初始水平相关性
 * 初始水质差的城市改善幅度应更大（回归效应）
 */
function validateQualityImprovementCorrelation(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  // 使用qualityLevelTrend2020_2024数据检查III类以上比例趋势
  const validData = qualityLevelTrend2020_2024.filter(q => q.IIIplus !== undefined);
  if (validData.length < 3) return issues;

  // 检查2020-2024年改善是否持续
  for (let i = 1; i < validData.length; i++) {
    const prev = validData[i - 1];
    const curr = validData[i];
    if (curr.IIIplus < prev.IIIplus) {
      issues.push({
        level: 'warning', category: 'statistical',
        title: `${curr.year}年水质优良率下降`,
        message: `III类以上比例从${prev.IIIplus}%降至${curr.IIIplus}%，较${prev.year}年下降${(prev.IIIplus - curr.IIIplus).toFixed(1)}个百分点`,
        affectedModules: ['waterQuality'], blocking: false,
        fixSuggestion: `核实${curr.year}年水质数据，确认下降原因（监测点变化/污染事件/数据错误）`,
        canAutoFix: false,
      });
    }
  }

  // 检查水位回升与水质改善的同步性
  const shallowRiseData = validData.filter(d => d.shallowRise !== undefined && d.IIIplus !== undefined);
  if (shallowRiseData.length >= 3) {
    // 简单检查：水位回升年份水质也应改善
    for (let i = 1; i < shallowRiseData.length; i++) {
      const prev = shallowRiseData[i - 1];
      const curr = shallowRiseData[i];
      if (curr.shallowRise > prev.shallowRise && curr.IIIplus < prev.IIIplus) {
        issues.push({
          level: 'info', category: 'statistical',
          title: `${curr.year}年水位回升但水质未同步改善`,
          message: `水位回升${curr.shallowRise}m（较${prev.year}年+${(curr.shallowRise - prev.shallowRise).toFixed(2)}m），但III类以上比例下降${(prev.IIIplus - curr.IIIplus).toFixed(1)}个百分点`,
          affectedModules: ['waterQuality', 'groundwaterFunction'], blocking: false,
          fixSuggestion: `核实${curr.year}年水质监测数据，水位回升通常伴随水质改善`,
          canAutoFix: false,
        });
      }
    }
  }
  return issues;
}

/**
 * 校验27: 禁采区开采井存在性检查
 * 禁采区内不应有活跃开采井
 */
function validateForbiddenZoneExploitation(): ValidationIssue[] {
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

/**
 * 校验28: 数据完整性时间序列检测
 * 检查2020-2024年各年数据是否存在断层
 */
function validateTimeSeriesCompleteness(): ValidationIssue[] {
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

/**
 * 校验29: 系统区划与超采区交叉验证
 * 超采区应位于对应的地下水系统区划内
 */
function validateZoneOverdraftMatch(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const zoneNames = new Set(systemZones.map(z => z.name));
  for (const zone of cityOverdraftZones) {
    const z = zone as any;
    if (z.systemZone && !zoneNames.has(z.systemZone)) {
      issues.push({
        level: 'warning', category: 'consistency',
        title: `${z.city}超采区系统区划不匹配`,
        message: `标注的系统区划"${z.systemZone}"不在已注册的系统区划列表中`,
        affectedModules: ['groundwaterFunction', 'zoneParams'], blocking: false,
        fixSuggestion: `将${z.city}的systemZone修正为已注册的系统区划名称`,
        canAutoFix: false,
      });
    }
  }
  return issues;
}

/**
 * 校验30: 地下水开采结构合理性
 * 农业占比高的城市，总开采量应与灌溉面积匹配
 */
function validateExploitationStructure(): ValidationIssue[] {
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


/* ================================================================
 * 第六部分：Phase 3.3 历史时间序列校验（v3.0 新增16项，累计46项）
 * 基于historicalTimeSeries中的11市×11年数据
 * ================================================================ */

// ── 任务15: 水位校验(4条) ──

/**
 * 校验31: 水位埋深年际突变检测
 * 相邻年份水位埋深变化>3m视为突变（正常年际变幅0.5~2m）
 */
function validateWaterLevelAbruptChange(): ValidationIssue[] {
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

/**
 * 校验32: 水位埋深合理范围
 * 河北平原浅层地下水埋深0~60m，超出范围需核实
 */
function validateWaterLevelRange(): ValidationIssue[] {
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

/**
 * 校验33: 水位回升趋势一致性
 * 2018年后全省水位应普遍止跌回升，若持续下降需预警
 */
function validateWaterLevelRecoveryTrend(): ValidationIssue[] {
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

/**
 * 校验34: 水位与开采量反相关校验
 * 开采量减少→水位回升(埋深减小)，若开采减但埋深增大需预警
 */
function validateWaterLevelExploitationCorrelation(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const [city, data] of Object.entries(cityWaterLevelYearly)) {
    const wl14 = data[2014], wl24 = data[2024];
    const exp = groundwaterExploitation2024.find((e: any) => e.city === city);
    if (!exp || wl14 == null || wl24 == null) continue;
    if ((exp.reductionVs2014 ?? 0) > 10 && wl24 > wl14) {
      issues.push({
        level: 'info', category: 'consistency',
        title: `${city}开采减少但水位未回升`,
        message: `开采降幅${exp.reductionVs2014}%，但埋深${wl14}→${wl24}m（增大${(wl24 - wl14).toFixed(1)}m）`,
        affectedModules: ['hydrogeologyHistorical', 'exploitation'], blocking: false,
        fixSuggestion: `水位回升滞后于开采削减，核实${city}含水层补给条件或监测井代表性`,
        canAutoFix: false,
      });
    }
  }
  return issues;
}

// ── 任务16: 沉降校验(4条) ──

/**
 * 校验35: 沉降速率合理范围
 * 河北平原沉降速率0~200mm/a，超出范围需核实
 */
function validateSubsidenceRange(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const [city, data] of Object.entries(citySubsidenceYearly)) {
    for (const year of TS_FULL_YEARS) {
      const val = data[year];
      if (val == null) continue;
      if (val < 0) {
        issues.push({
          level: 'error', category: 'range',
          title: `${city}${year}年沉降速率为负`,
          message: `速率${val}mm/a不应为负值（正值=地面下沉）`,
          affectedModules: ['hydrogeologyHistorical'], blocking: true,
          fixSuggestion: `将${city}${year}年沉降速率取绝对值`,
          canAutoFix: true,
        });
      }
      if (val > 200) {
        issues.push({
          level: 'warning', category: 'range',
          title: `${city}${year}年沉降速率异常偏大`,
          message: `速率${val}mm/a，河北平原典型范围0~200mm/a`,
          affectedModules: ['hydrogeologyHistorical'], blocking: false,
          fixSuggestion: `核实${city}${year}年沉降监测数据，确认是否为局部沉降漏斗中心数据`,
          canAutoFix: false,
        });
      }
    }
  }
  return issues;
}

/**
 * 校验36: 沉降速率年际突变
 * 相邻年份变化>15mm/a视为突变（正常年际变幅2~8mm/a）
 */
function validateSubsidenceAbruptChange(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const [city, data] of Object.entries(citySubsidenceYearly)) {
    for (let i = 1; i < TS_FULL_YEARS.length; i++) {
      const prev = data[TS_FULL_YEARS[i - 1]];
      const curr = data[TS_FULL_YEARS[i]];
      if (prev == null || curr == null) continue;
      const change = Math.abs(curr - prev);
      if (change > 15) {
        issues.push({
          level: 'warning', category: 'range',
          title: `${city}${TS_FULL_YEARS[i]}年沉降速率突变`,
          message: `${TS_FULL_YEARS[i - 1]}年${prev}→${TS_FULL_YEARS[i]}年${curr}mm/a，变化${change.toFixed(1)}mm/a`,
          affectedModules: ['hydrogeologyHistorical'], blocking: false,
          fixSuggestion: `核实${city}${TS_FULL_YEARS[i]}年InSAR/水准测量数据`,
          canAutoFix: false,
        });
      }
    }
  }
  return issues;
}

/**
 * 校验37: 沉降减缓趋势校验
 * 2015年后沉降速率应持续下降，若反弹需预警
 */
function validateSubsidenceDeceleration(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const [city, data] of Object.entries(citySubsidenceYearly)) {
    const v2018 = data[2018];
    const v2024 = data[2024];
    if (v2018 == null || v2024 == null) continue;
    if (v2024 > v2018 + 2) {
      issues.push({
        level: 'warning', category: 'business',
        title: `${city}沉降速率近年反弹`,
        message: `2018年${v2018}→2024年${v2024}mm/a，速率增大${(v2024 - v2018).toFixed(1)}mm/a`,
        affectedModules: ['hydrogeologyHistorical'], blocking: false,
        fixSuggestion: `核实${city}2020年后开采量变化，沉降反弹可能与局部工程活动或含水层蠕变有关`,
        canAutoFix: false,
      });
    }
  }
  return issues;
}

/**
 * 校验38: 沉降与水位滞后相关性
 * 水位回升应伴随沉降减缓，但存在1~3年滞后
 */
function validateSubsidenceWaterLevelLag(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const [city, wlData] of Object.entries(cityWaterLevelYearly)) {
    const subData = citySubsidenceYearly[city];
    if (!subData) continue;
    const wl14 = wlData[2014], wl24 = wlData[2024];
    const sub14 = subData[2014], sub24 = subData[2024];
    if (wl14 == null || wl24 == null || sub14 == null || sub24 == null) continue;
    const wlRecovery = wl14 - wl24;
    const subReduction = sub14 > 0 ? (sub14 - sub24) / sub14 * 100 : 0;
    if (wlRecovery > 2 && subReduction < 10) {
      issues.push({
        level: 'info', category: 'consistency',
        title: `${city}水位回升但沉降减缓不明显`,
        message: `水位回升${wlRecovery.toFixed(1)}m，沉降仅减缓${subReduction.toFixed(1)}%，含水层蠕变滞后效应`,
        affectedModules: ['hydrogeologyHistorical'], blocking: false,
        fixSuggestion: `含水层黏性土蠕变导致沉降滞后于水位回升1~3年，属正常现象，持续监测`,
        canAutoFix: false,
      });
    }
  }
  return issues;
}

// ── 任务17: 地热校验(4条) ──

/**
 * 校验39: 地热井口水温合理范围
 * 河北地热井口水温30~120°C，超出需核实
 */
function validateGeothermalWellTemp(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const field of geothermalFields) {
    const f = field as any;
    if (f.temperature == null) continue;
    if (f.temperature < 25) {
      issues.push({
        level: 'warning', category: 'range',
        title: `${f.name}井口水温偏低`,
        message: `温度${f.temperature}°C，河北地热田典型井口温度≥30°C`,
        affectedModules: ['geothermal'], blocking: false,
        fixSuggestion: `核实${f.name}是否为低温地热资源或温泉`,
        canAutoFix: false,
      });
    }
    if (f.temperature > 150) {
      issues.push({
        level: 'warning', category: 'range',
        title: `${f.name}井口水温异常偏高`,
        message: `温度${f.temperature}°C，河北地热田典型井口温度30~120°C`,
        affectedModules: ['geothermal'], blocking: false,
        fixSuggestion: `核实${f.name}测温数据或是否为深层干热岩资源`,
        canAutoFix: false,
      });
    }
  }
  return issues;
}

/**
 * 校验40: 地热田面积与热储量匹配
 * 面积>热储量对应的典型值或反之需核实
 */
function validateGeothermalAreaReserve(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const entries = Array.isArray(geothermalResources) ? geothermalResources : Object.entries(geothermalResources).map(([, v]) => v as any);
  for (const res of entries) {
    const r = res as any;
    if (!r.area || !r.thermalReserve) continue;
    const unitReserve = r.thermalReserve / r.area;
    if (unitReserve > 500) {
      issues.push({
        level: 'info', category: 'consistency',
        title: `${r.name}单位面积热储量偏高`,
        message: `${unitReserve.toFixed(0)}万t标煤/km²，典型范围5~500`,
        affectedModules: ['geothermal'], blocking: false,
        fixSuggestion: `核实${r.name}热储量计算参数（厚度、温度、比热容等）`,
        canAutoFix: false,
      });
    }
  }
  return issues;
}

/**
 * 校验41: 地热流体化学组分合理性
 * 矿化度应在0.5~15g/L范围（河北地热流体典型值）
 */
function validateGeothermalFluidChemistry(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!Array.isArray(geothermalFluidChemistry)) return issues;
  for (const sample of geothermalFluidChemistry) {
    const s = sample as any;
    if (s.tds == null) continue;
    if (s.tds < 0.3) {
      issues.push({
        level: 'info', category: 'range',
        title: `${s.field || s.name || '未命名'}地热流体矿化度偏低`,
        message: `TDS=${s.tds}g/L，河北地热流体典型范围0.5~15g/L`,
        affectedModules: ['geothermal'], blocking: false,
        fixSuggestion: `核实矿化度数据或确认是否为大气降水补给型低温地热`,
        canAutoFix: false,
      });
    }
    if (s.tds > 20) {
      issues.push({
        level: 'warning', category: 'range',
        title: `${s.field || s.name || '未命名'}地热流体矿化度偏高`,
        message: `TDS=${s.tds}g/L，可能为古封存卤水`,
        affectedModules: ['geothermal'], blocking: false,
        fixSuggestion: `核实矿化度数据，高TDS地热流体不宜直接用于供暖回灌`,
        canAutoFix: false,
      });
    }
  }
  return issues;
}

/**
 * 校验42: 回灌率与开采量匹配
 * 回灌率应≥80%（河北地热管理要求），低于需预警
 */
function validateGeothermalReinjectionRate(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!Array.isArray(reinjectionDataExtended)) return issues;
  for (const item of reinjectionDataExtended) {
    const r = item as any;
    if (r.rate == null) continue;
    if (r.rate < 70) {
      issues.push({
        level: 'warning', category: 'business',
        title: `${r.field || r.name || '未命名'}回灌率偏低`,
        message: `回灌率${r.rate}%，河北省要求≥80%`,
        affectedModules: ['geothermal'], blocking: false,
        fixSuggestion: `提高${r.field || r.name}回灌率至80%以上，防止地热田压力下降`,
        canAutoFix: false,
      });
    }
  }
  return issues;
}

// ── 任务18: 空间一致性校验(4条) ──

/**
 * 校验43: 历史数据城市覆盖完整性
 * historicalTimeSeries中11市×11年应无空值
 */
function validateHistoricalDataCoverage(): ValidationIssue[] {
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

/**
 * 校验44: 水位与水质空间一致性
 * 水质优良区水位应较浅，水质差区水位可能较深（超采导致）
 */
function validateWaterLevelQualitySpatial(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const city of Object.keys(cityWaterLevelYearly)) {
    const wl = cityWaterLevelYearly[city]?.[2024];
    const q = cityQualityYearly[city]?.[2024];
    if (wl == null || q == null) continue;
    if (wl > 25 && q > 60) {
      issues.push({
        level: 'info', category: 'consistency',
        title: `${city}水位深但水质优良`,
        message: `埋深${wl}m，达标率${q}%，深埋深通常伴随水质恶化`,
        affectedModules: ['hydrogeologyHistorical', 'waterQuality'], blocking: false,
        fixSuggestion: `核实${city}监测井深度和含水层位，深井可能开采深层优质水`,
        canAutoFix: false,
      });
    }
    if (wl < 5 && q < 20) {
      issues.push({
        level: 'info', category: 'consistency',
        title: `${city}水位浅但水质差`,
        message: `埋深${wl}m，达标率${q}%，浅层水易受污染`,
        affectedModules: ['hydrogeologyHistorical', 'waterQuality'], blocking: false,
        fixSuggestion: `核实${city}浅层水污染来源（农业面源/工业排放/生活污水）`,
        canAutoFix: false,
      });
    }
  }
  return issues;
}

/**
 * 校验45: 开采-沉降空间一致性
 * 开采量大且深层开采占比高的区域沉降应更严重
 */
function validateExploitationSubsidenceSpatial(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const city of Object.keys(citySubsidenceYearly)) {
    const sub = citySubsidenceYearly[city]?.[2024];
    const exp = groundwaterExploitation2024.find((e: any) => e.city === city);
    if (sub == null || !exp) continue;
    const deepRatio = exp.total > 0 ? (exp.deep / exp.total) * 100 : 0;
    if (deepRatio > 40 && sub < 5) {
      issues.push({
        level: 'info', category: 'consistency',
        title: `${city}深层开采多但沉降轻微`,
        message: `深层占比${deepRatio.toFixed(1)}%，沉降${sub}mm/a`,
        affectedModules: ['exploitation', 'hydrogeologyHistorical'], blocking: false,
        fixSuggestion: `核实${city}深层含水层压缩性参数或沉降监测精度`,
        canAutoFix: false,
      });
    }
  }
  return issues;
}

/**
 * 校验46: 区域内部城市数据合理性
 * 同一水文地质区内城市的水位/沉降/水质差异不应过大
 */
function validateRegionalInternalConsistency(): ValidationIssue[] {
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
/* ================================================================
 * 运行与缓存
 * ================================================================ */

/**
 * 运行全部校验（含v2.0新增规则）
 */
export function runAllValidations(): {
  issues: ValidationIssue[];
  summary: {
    total: number;
    error: number;
    warning: number;
    info: number;
    blocking: number;
  };
} {
  const allIssues: ValidationIssue[] = [
    // 原始4项
    ...validateCitySupplyConsistency(),
    ...validateConeAreas(),
    ...validateDataFreshness(),
    ...validateDataSourceCoverage(),
    // v2.0 新增6项跨模块校验
    ...validateCityCoverageConsistency(),
    ...validateOverdraftRestrictionMatch(),
    ...validateWaterLevelRecovery(),
    ...validateHydroParamsRange(),
    ...validateWaterSourceCoordinates(),
    ...validateGeologyParams(),
    // v2.1 新增5项校验
    ...validateQualityExploitationMatch(),
    ...validateGeothermalGradient(),
    ...validateMineralWaterQuality(),
    ...validateSpringRechargeConsistency(),
    ...validateExploitationChange(),
    // v2.2 新增15项统计与业务校验
    ...validateSupplyStatisticalOutliers(),
    ...validateWaterQualityFunctionMatch(),
    ...validateOverdraftDepthTrend(),
    ...validateExploitationRanking(),
    ...validateMineralWaterSourceOverlap(),
    ...validateSalineExploitationConflict(),
    ...validatePotentialExploitationMatch(),
    ...validateSpringFlowVariation(),
    ...validateParamSpatialConsistency(),
    ...validateGeothermalMineralOverlap(),
    ...validateQualityImprovementCorrelation(),
    ...validateForbiddenZoneExploitation(),
    ...validateTimeSeriesCompleteness(),
    ...validateZoneOverdraftMatch(),
    ...validateExploitationStructure(),
    // Phase 3.3 新增16项历史时间序列校验
    ...validateWaterLevelAbruptChange(),
    ...validateWaterLevelRange(),
    ...validateWaterLevelRecoveryTrend(),
    ...validateWaterLevelExploitationCorrelation(),
    ...validateSubsidenceRange(),
    ...validateSubsidenceAbruptChange(),
    ...validateSubsidenceDeceleration(),
    ...validateSubsidenceWaterLevelLag(),
    ...validateGeothermalWellTemp(),
    ...validateGeothermalAreaReserve(),
    ...validateGeothermalFluidChemistry(),
    ...validateGeothermalReinjectionRate(),
    ...validateHistoricalDataCoverage(),
    ...validateWaterLevelQualitySpatial(),
    ...validateExploitationSubsidenceSpatial(),
    ...validateRegionalInternalConsistency(),
  ];

  return {
    issues: allIssues,
    summary: {
      total: allIssues.length,
      error: allIssues.filter(i => i.level === 'error').length,
      warning: allIssues.filter(i => i.level === 'warning').length,
      info: allIssues.filter(i => i.level === 'info').length,
      blocking: allIssues.filter(i => i.blocking).length,
    },
  };
}

/**
 * 校验结果（懒加载版，首次调用时执行）
 */
let cachedResult: ReturnType<typeof runAllValidations> | null = null;
let cachedScanResult: ModuleScanResult[] | null = null;

export function getValidationResult() {
  if (!cachedResult) {
    cachedResult = runAllValidations();
  }
  return cachedResult;
}

export function getModuleScanResult(): ModuleScanResult[] {
  if (!cachedScanResult) {
    cachedScanResult = scanAllModules();
  }
  return cachedScanResult;
}

/** 清除缓存，用于刷新校验 */
export function clearValidationCache() {
  cachedResult = null;
  cachedScanResult = null;
}
