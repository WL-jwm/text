/**
 * 水质数据挖掘 (B-30)
 *
 * 四大算法：
 *  1. K-Means 聚类（水质类型划分）
 *  2. PCA 主成分分析（降维可视化）
 *  3. Apriori 关联规则挖掘（指标共现）
 *  4. 异常检测（Z-Score + 综合评分）
 *
 * 聚合出口：按主题域拆分为 4 个子模块，保持对外 API 不变。
 *  - dataMiningTypes.ts       类型定义
 *  - dataMiningUtils.ts       内部工具
 *  - dataMiningAlgorithms.ts  四大算法
 *  - dataMiningPresets.ts     预设数据集
 */

export * from './dataMiningTypes';
export * from './dataMiningUtils';
export * from './dataMiningAlgorithms';
export * from './dataMiningPresets';
