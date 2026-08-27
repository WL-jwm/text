/**
 * G-06 WebWorker — React Hooks 封装（聚合出口）
 *
 * 拆分自 useWorker.ts，对外 API 保持不变。
 *
 * 提供：
 *   - useWorkerInterpolation: IDW 插值（Worker 化）
 *   - useWorkerContours: 等值线提取（Worker 化）
 *   - useWorkerStats: 统计聚合（Worker 化）
 *   - useWorkerStatus: Worker 状态监控
 */

export * from './workerTypes';
export * from './workerCore';
export { useWorkerInterpolation } from './useWorkerInterpolation';
export { useWorkerContours } from './useWorkerContours';
export { useWorkerStats } from './useWorkerStats';
export { useWorkerStatus } from './useWorkerStatus';
