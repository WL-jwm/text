/**
 * WebSocket 实时数据源 — 聚合实现类
 *  继承 WebSocketDataSourceConfig（Base 连接管理 + Config 诊断/测试），保持对外 API 不变
 */

import { WebSocketDataSourceConfig } from './wsDataSourceConfig';

export class WebSocketDataSource extends WebSocketDataSourceConfig {}
