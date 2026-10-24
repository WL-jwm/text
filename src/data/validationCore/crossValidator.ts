/**
 * 拆分自 dataValidation.ts — 跨模块一致性校验编排
 */

import { validateCitySupplyConsistency, validateSupplyStatisticalOutliers, validatePotentialExploitationMatch, validateExploitationRanking, validateExploitationStructure, validateExploitationChange } from '../validators/waterResources';
import { validateWaterLevelRecovery, validateOverdraftDepthTrend, validateTimeSeriesCompleteness, validateWaterLevelAbruptChange, validateWaterLevelRange, validateWaterLevelRecoveryTrend, validateRegionalInternalConsistency } from '../validators/groundwaterLevel';
import { validateConeAreas, validateHydroParamsRange, validateGeologyParams, validateWaterSourceCoordinates, validateParamSpatialConsistency, validateSpringRechargeConsistency, validateSpringFlowVariation, validateZoneOverdraftMatch } from '../validators/geology';
import { validateQualityExploitationMatch, validateWaterQualityFunctionMatch, validateQualityImprovementCorrelation, validateWaterLevelQualitySpatial, validateMineralWaterQuality } from '../validators/quality';
import { validateGeothermalGradient, validateGeothermalMineralOverlap, validateGeothermalWellTemp, validateGeothermalAreaReserve, validateGeothermalFluidChemistry, validateGeothermalReinjectionRate, validateMineralWaterSourceOverlap, validateSalineExploitationConflict } from '../validators/geothermal';
import { validateSubsidenceRange, validateSubsidenceAbruptChange, validateSubsidenceDeceleration, validateSubsidenceWaterLevelLag, validateExploitationSubsidenceSpatial, validateWaterLevelExploitationCorrelation } from '../validators/subsidence';
import { validateCityCoverageConsistency, validateOverdraftRestrictionMatch, validateForbiddenZoneExploitation, validateHistoricalDataCoverage } from '../validators/business';
import { validateDataFreshness, validateDataSourceCoverage } from '../validators/common';
import type { ValidationIssue } from './validationTypes';





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
