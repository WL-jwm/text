/**
 * 实时数据源 (Realtime Data Source)
 *
 * 提供三类数据源连接器：
 *  - MockDataSource        模拟数据源
 *  - HttpPollingDataSource HTTP 轮询数据源
 *  - WebSocketDataSource   WebSocket 数据源
 *
 * 聚合出口：按连接器类型拆分为 6 个子模块，保持对外 API 不变。
 *  - realtimeLogger.ts      连接日志
 *  - realtimeTypes.ts       类型定义
 *  - realtimeUtils.ts       内部工具
 *  - mockDataSource.ts      Mock 模拟数据源
 *  - httpDataSource.ts      HTTP 轮询数据源
 *  - wsDataSource.ts        WebSocket 数据源
 */

export * from './realtimeLogger';
export * from './realtimeTypes';
export * from './realtimeUtils';
export * from './mockDataSource';
export * from './httpDataSource';
export * from './wsDataSource';

import { MockDataSource } from './mockDataSource';
import { HttpPollingDataSource } from './httpDataSource';
import { WebSocketDataSource } from './wsDataSource';
import type { RealtimeDataSource, DataSourceType } from './realtimeTypes';

const dataSourceInstances = new Map<DataSourceType, RealtimeDataSource>();

export function getDataSource(type: DataSourceType): RealtimeDataSource {
  if (!dataSourceInstances.has(type)) {
    switch (type) {
      case 'mock':
        dataSourceInstances.set(type, new MockDataSource());
        break;
      case 'http':
        dataSourceInstances.set(type, new HttpPollingDataSource());
        break;
      case 'ws':
        dataSourceInstances.set(type, new WebSocketDataSource());
        break;
    }
  }
  return dataSourceInstances.get(type)!;
}

