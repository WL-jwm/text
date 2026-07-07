/**
 * reportGeneratorLoader — 报告生成器动态加载器
 *
 * 将 25 个报告生成器从静态 side-effect import 改为按需动态导入，
 * 避免所有报告生成器（含 docx 库 359KB）在首页加载时一并下载。
 *
 * 使用方式：
 *   import { loadReportGenerator } from './reportGeneratorLoader';
 *   await loadReportGenerator('overview');
 */

// 报告类型 → 动态导入函数的映射
const REPORT_LOADERS: Record<string, () => Promise<unknown>> = {
  'overview': () => import('../services/reportGenerators/overviewReport'),
  'resources': () => import('../services/reportGenerators/resourcesReport'),
  'water-quality': () => import('../services/reportGenerators/waterQualityReport'),
  'environment': () => import('../services/reportGenerators/environmentReport'),
  'exploitation': () => import('../services/reportGenerators/exploitationReport'),
  'hydrochemistry': () => import('../services/reportGenerators/hydrochemistryReport'),
  'geology': () => import('../services/reportGenerators/geologyReport'),
  'hydro-params': () => import('../services/reportGenerators/hydroParamsReport'),
  'water-source': () => import('../services/reportGenerators/waterSourceReport'),
  'geothermal': () => import('../services/reportGenerators/geothermalReport'),
  'mineral-water': () => import('../services/reportGenerators/mineralWaterReport'),
  'saline-water': () => import('../services/reportGenerators/salineWaterReport'),
  'saline-soil': () => import('../services/reportGenerators/salineSoilReport'),
  'mine-hydrogeology': () => import('../services/reportGenerators/mineHydrogeologyReport'),
  'karst-water': () => import('../services/reportGenerators/karstWaterReport'),
  'fracture-water': () => import('../services/reportGenerators/fractureWaterReport'),
  'system-zoning': () => import('../services/reportGenerators/systemZoningReport'),
  'map-view': () => import('../services/reportGenerators/mapViewReport'),
  'data-insight': () => import('../services/reportGenerators/dataInsightReport'),
  'dataQuality': () => import('../services/reportGenerators/dataQualityReport'),
  'workspace': () => import('../services/reportGenerators/dataQualityReport'),
  'county-water-compare': () => import('../services/reportGenerators/countyWaterCompareReport'),
  'groundwater-function': () => import('../services/reportGenerators/groundwaterFunctionReport'),
  'hydrogeology-historical': () => import('../services/reportGenerators/hydrogeologyHistoricalReport'),
  'groundwater-balance': () => import('../services/reportGenerators/groundwaterBalanceReport'),
  'groundwater-background': () => import('../services/reportGenerators/groundwaterBackgroundReport'),
  'spatial-analysis': () => import('../services/reportGenerators/spatialAnalysisReport'),
  'time-series': () => import('../services/reportGenerators/timeSeriesReport'),
};

/** 已加载的报告类型缓存 */
const loadedTypes = new Set<string>();

/**
 * 按需加载指定类型的报告生成器
 * 首次调用时动态导入，后续直接返回
 */
export async function loadReportGenerator(type: string): Promise<void> {
  if (loadedTypes.has(type)) return;

  const loader = REPORT_LOADERS[type];
  if (!loader) {
    console.warn(`[reportGeneratorLoader] 未找到报告类型: ${type}`);
    return;
  }

  await loader();
  loadedTypes.add(type);
}

/**
 * 预加载常用报告生成器（在空闲时调用）
 */
export function preloadCommonReportGenerators(): void {
  const commonTypes = ['overview', 'resources', 'water-quality', 'data-insight'];
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(() => {
      commonTypes.forEach(type => {
        if (!loadedTypes.has(type)) {
          loadReportGenerator(type);
        }
      });
    }, { timeout: 3000 });
  }
}

/**
 * 重置加载状态（主要用于测试）
 */
export function resetReportGeneratorLoader(): void {
  loadedTypes.clear();
}
