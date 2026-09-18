/**
 * 实时缓存服务 — 聚合实现类
 *  继承 RealtimeCacheConfig（Base 字段/存储/清理 + Config 分析/导出/统计），保持对外 API 不变
 */

import { RealtimeCacheConfig } from './realtimeCacheConfig';

export class RealtimeCacheService extends RealtimeCacheConfig {}
