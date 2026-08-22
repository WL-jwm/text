/**
 * B-35 地下水数值模拟与校准器 — 计算引擎
 *
 * 核心算法：
 *  1. 有限差分网格（规则网格，支持变间距）
 *  2. 地下水流方程求解（Gauss-Seidel迭代 + SOR加速）
 *  3. 稳定流/非稳定流模拟
 *  4. 反演校准（观测水位→渗透系数/补给量反推）
 *  5. 情景预测（不同开采方案下水位响应）
 *
 * 水流方程（二维承压含水层，非稳定流）：
 *   ∂/∂x(T_x ∂h/∂x) + ∂/∂y(T_y ∂h/∂y) + W = S ∂h/∂t
 *
 * 聚合出口：按主题域拆分为 5 个子模块，保持对外 API 不变。
 *  - numericalFlowTypes.ts        类型定义
 *  - numericalFlowSolver.ts       稳定流/非稳定流求解
 *  - numericalFlowCalibration.ts  参数率定/情景预测
 *  - numericalFlowPresets.ts      预设区域/观测点/情景
 *  - numericalFlowPostProcess.ts  结果后处理
 */

export * from './numericalFlowTypes';
export * from './numericalFlowSolver';
export * from './numericalFlowCalibration';
export * from './numericalFlowPresets';
export * from './numericalFlowPostProcess';
