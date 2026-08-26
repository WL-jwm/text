/**
 * 同位素测年计算器
 *
 * 聚合出口：按主题域拆分为 4 个子模块，保持对外 API 不变。
 *  - isotopeTypes.ts      类型定义
 *  - isotopeConstants.ts  衰变常量
 *  - isotopeAlgorithms.ts 核心算法
 *  - isotopePresets.ts    预设监测点与汇总
 */

export * from './isotopeTypes';
export * from './isotopeConstants';
export * from './isotopeAlgorithms';
export * from './isotopePresets';
