/**
 * 监测网优化计算器 (B-31)
 *
 * 五大评估：
 *  1. 监测密度评估
 *  2. 空间覆盖评估
 *  3. 最优监测频率（熵权法）
 *  4. 监测有效性评估
 *  5. 综合评估
 *
 * 聚合出口：按主题域拆分为 4 个子模块，保持对外 API 不变。
 *  - monitoringNetworkTypes.ts       类型定义
 *  - monitoringNetworkAlgorithms.ts  五大评估算法
 *  - monitoringNetworkUtils.ts       内部工具
 *  - monitoringNetworkPresets.ts     预设监测区/标签常量
 */

export * from './monitoringNetworkTypes';
export * from './monitoringNetworkAlgorithms';
export * from './monitoringNetworkUtils';
export * from './monitoringNetworkPresets';
