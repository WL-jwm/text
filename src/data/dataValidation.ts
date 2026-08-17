/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 交叉数据校验模块 (C4)
 * 检验不同数据源中相同指标的一致性，发现数据矛盾
 * 依赖 dataSourceRegistry 中的模块溯源信息
 *
 * v2.0: 新增全平台数据完整性扫描 + 跨模块一致性校验
 */

import { cityWaterSupply2024 } from './resources';
import { shallowCones2024, deepCones2024 } from './environment';

/* ── 新增导入：用于全平台扫描 ── */
import { cityGroundwater2024 } from './resources-core';
import { cityGroundwaterQuality2024 } from './waterQuality';
import { tectonicUnits, majorFaults, quaternaryAquiferGroups } from './geology';
import { cityOverdraftZones, restrictedZones } from './groundwaterFunction';
import { cityWaterBalance, cityExploitationPotential } from './groundwaterResources';
import { systemZones, subZones, plainZones } from './zoneParams';
import { aquiferGroups, lithologyMu, infiltrationCoeff, permeability } from './hydroParams';
import { importantWaterSources } from './waterSource';
import { karstSprings, karstSystemZones } from './karstWater';
import { fractureWaterTypes, fractureWaterZones } from './fractureWater';
import { geothermalFields } from './geothermal';
import { mineralWaterSites } from './mineralWater';
import { salineDistribution } from './salineWater';
import { salineSoilDistribution } from './salineSoil';
import { mineHydrogeologyData } from './mineHydrogeology';

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

import { validateCitySupplyConsistency, validateSupplyStatisticalOutliers, validatePotentialExploitationMatch, validateExploitationRanking, validateExploitationStructure, validateExploitationChange } from './validators/waterResources';
import { validateWaterLevelRecovery, validateOverdraftDepthTrend, validateTimeSeriesCompleteness, validateWaterLevelAbruptChange, validateWaterLevelRange, validateWaterLevelRecoveryTrend, validateRegionalInternalConsistency } from './validators/groundwaterLevel';
import { validateConeAreas, validateHydroParamsRange, validateGeologyParams, validateWaterSourceCoordinates, validateParamSpatialConsistency, validateSpringRechargeConsistency, validateSpringFlowVariation, validateZoneOverdraftMatch } from './validators/geology';
import { validateQualityExploitationMatch, validateWaterQualityFunctionMatch, validateQualityImprovementCorrelation, validateWaterLevelQualitySpatial, validateMineralWaterQuality } from './validators/quality';
import { validateGeothermalGradient, validateGeothermalMineralOverlap, validateGeothermalWellTemp, validateGeothermalAreaReserve, validateGeothermalFluidChemistry, validateGeothermalReinjectionRate, validateMineralWaterSourceOverlap, validateSalineExploitationConflict } from './validators/geothermal';
import { validateSubsidenceRange, validateSubsidenceAbruptChange, validateSubsidenceDeceleration, validateSubsidenceWaterLevelLag, validateExploitationSubsidenceSpatial, validateWaterLevelExploitationCorrelation } from './validators/subsidence';
import { validateCityCoverageConsistency, validateOverdraftRestrictionMatch, validateForbiddenZoneExploitation, validateHistoricalDataCoverage } from './validators/business';
import { validateDataFreshness, validateDataSourceCoverage } from './validators/common';


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

