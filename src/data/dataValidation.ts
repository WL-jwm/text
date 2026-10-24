/**
 * 交叉数据校验模块 (C4)
 * 检验不同数据源中相同指标的一致性，发现数据矛盾
 * 依赖 dataSourceRegistry 中的模块溯源信息
 *
 * v2.0: 新增全平台数据完整性扫描 + 跨模块一致性校验
 */

import { scanAllModules } from './validationCore/moduleScanner';
import { runAllValidations } from './validationCore/crossValidator';

export type { ValidationIssue, ModuleScanResult } from './validationCore/validationTypes';
import type { ModuleScanResult } from './validationCore/validationTypes';
export { scanAllModules, runAllValidations };
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

