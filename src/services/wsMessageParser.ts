/**
 * 拆分自 wsDataSourceBase.ts — WebSocket 消息解析（纯函数）
 *  数据路径提取 / 字段映射 / 质量标记
 */

import { toNumber, toStr, toQuality, getPath } from './realtimeUtils';
import { connectionLogger } from './realtimeLogger';
import type { WsChannelContext } from './wsChannelTypes';
import type { RealtimeReading } from './realtimeDataService';

/**
 * 解析 WebSocket 消息为读数数组
 * 返回 null 表示解析失败或无可读数据
 */
export function parseWsReadings(ctx: WsChannelContext, data: string): RealtimeReading[] | null {
  const { channel, config, wsConfig } = ctx;

  try {
    const json = JSON.parse(data);
    const mapping = wsConfig.responseMapping;

    let dataArr: unknown[];
    if (mapping.dataPath) {
      const wrapped = getPath(json, mapping.dataPath);
      if (!Array.isArray(wrapped)) {
        // 可能是单条消息
        if (wrapped !== null && wrapped !== undefined) {
          dataArr = [wrapped];
        } else {
          return null;
        }
      } else {
        dataArr = wrapped;
      }
    } else if (mapping.isArray) {
      if (Array.isArray(json)) {
        dataArr = json;
      } else {
        dataArr = [json];
      }
    } else {
      dataArr = [json];
    }

    const readings: RealtimeReading[] = dataArr.map(item => {
      const stationId = toStr(getPath(item, mapping.stationIdPath));
      return {
        stationId,
        stationName: mapping.stationNamePath
          ? toStr(getPath(item, mapping.stationNamePath), stationId)
          : stationId,
        city: mapping.cityPath
          ? toStr(getPath(item, mapping.cityPath))
          : config.channel,
        channel,
        value: Math.round(toNumber(getPath(item, mapping.valuePath)) * 100) / 100,
        unit: mapping.unitPath
          ? toStr(getPath(item, mapping.unitPath), config.unit)
          : config.unit,
        timestamp: mapping.timestampPath
          ? toNumber(getPath(item, mapping.timestampPath))
          : Date.now(),
        quality: mapping.qualityPath
          ? toQuality(getPath(item, mapping.qualityPath))
          : 'good',
      } satisfies RealtimeReading;
    });

    return readings.length > 0 ? readings : null;
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    connectionLogger.warn(channel, 'ws', '消息解析失败', error.message);
    return null;
  }
}
