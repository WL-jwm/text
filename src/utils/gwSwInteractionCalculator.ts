/**
 * 地下水-地表水相互作用计算器
 *
 * 聚合出口：按主题域拆分为 3 个子模块，保持对外 API 不变。
 *  - gwSwTypes.ts      类型定义
 *  - gwSwAlgorithms.ts 核心算法
 *  - gwSwPresets.ts    预设河流/生成器/标签
 */

export * from './gwSwTypes';
export * from './gwSwAlgorithms';
export * from './gwSwPresets';
