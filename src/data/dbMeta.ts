/**
 * dbMeta — 数据库元信息（轻量）
 *
 * 从 changelog.ts 提取出来，避免首页 Overview 等组件
 * 只需要 dbMeta 时拉入整个 changelog 数组（39KB）。
 */
export const dbMeta = {
  name: '河北地下水数据库',
  version: 'v3.23.0',
  lastUpdate: '2026-06-16',
  // 旧字段保留(Changelog.tsx使用)
  totalSheets: 25,
  totalRows: 0, // 由Changelog.tsx计算自changelog数组
  fileSize: '541.1KB',
  updatedSheets: [
    'geology', 'environment', 'exploitation', 'resources', 'waterQuality',
    'hydrochemistry', 'geothermal', 'salineWater', 'salineSoil', 'mineHydrogeology',
    'karstWater', 'fractureWater', 'mineralWater', 'waterSource', 'systemZoning',
    'hydroParams', 'zoneParams', 'backgroundValues', 'groundwaterFunction',
    'groundwaterResources', 'hydrogeologyHistorical', 'hydrogeologyReference',
    'mapData', 'searchIndex', 'changelog',
  ],
  staticSheets: [],
  // 新增字段
  totalExports: 270,
  dataSize: '541.1KB',
  totalPages: 23,
  pageSize: '894.5KB',
  totalComponents: 30,
  componentSize: '210.2KB',
  totalSearchEntries: 200,
  source: '1999年《河北省地下水》基础文献 + 2024年河北省官方数据 + 2024-2025年度公报',
  updatedModules: [
    'geology', 'environment', 'exploitation', 'resources', 'waterQuality',
    'hydrochemistry', 'geothermal', 'salineWater', 'salineSoil', 'mineHydrogeology',
    'karstWater', 'fractureWater', 'mineralWater', 'waterSource', 'systemZoning',
    'hydroParams', 'zoneParams', 'backgroundValues', 'groundwaterFunction',
    'groundwaterResources', 'hydrogeologyHistorical', 'hydrogeologyReference',
    'mapData', 'searchIndex', 'changelog',
  ],
  staticModules: [],
  pwaEnabled: true,
  offlineCacheSize: '~2MB',
};
