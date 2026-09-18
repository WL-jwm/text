/**
 * 实时缓存服务 — 分析/导出/统计扩展
 *  离线分析 / 数据导出 / 通道统计（继承 RealtimeCacheBase，自 realtimeCacheCore.ts 拆分）
 */

import type { DataChannel } from './realtimeDataService';
import type { ChannelStats, OfflineAnalysisResult } from './realtimeCacheTypes';
import { MAX_READINGS_PER_CHANNEL } from './realtimeCacheTypes';
import { mean, std, median } from './realtimeCacheUtils';

import { RealtimeCacheBase } from './realtimeCacheBase';

export abstract class RealtimeCacheConfig extends RealtimeCacheBase {
  async analyzeChannel(channel: DataChannel, timeRange?: { start: number; end: number }): Promise<OfflineAnalysisResult> {

    const readings = timeRange

      ? await this.getByTimeRange({ channel, startTime: timeRange.start, endTime: timeRange.end })

      : await this.getRecentReadings(channel, MAX_READINGS_PER_CHANNEL);



    if (readings.length === 0) {

      return {

        channel,

        totalReadings: 0,

        timeRange: null,

        stationCount: 0,

        stats: { mean: 0, min: 0, max: 0, std: 0, median: 0 },

        byStation: [],

        hourlyAverages: new Array(24).fill(0),

      };

    }



    const values = readings.map(r => r.value);

    const timestamps = readings.map(r => r.timestamp);



    // 按站点分组

    const stationMap = new Map<string, { name: string; values: number[] }>();

    for (const r of readings) {

      if (!stationMap.has(r.stationId)) {

        stationMap.set(r.stationId, { name: r.stationName, values: [] });

      }

      stationMap.get(r.stationId)!.values.push(r.value);

    }



    // 按小时分桶

    const hourlyBuckets: number[][] = Array.from({ length: 24 }, () => []);

    for (const r of readings) {

      const hour = new Date(r.timestamp).getHours();

      hourlyBuckets[hour].push(r.value);

    }



    return {

      channel,

      totalReadings: readings.length,

      timeRange: {

        start: Math.min(...timestamps),

        end: Math.max(...timestamps),

      },

      stationCount: stationMap.size,

      stats: {

        mean: mean(values),

        min: Math.min(...values),

        max: Math.max(...values),

        std: std(values),

        median: median(values),

      },

      byStation: Array.from(stationMap.entries()).map(([id, { name, values: vals }]) => ({

        stationId: id,

        stationName: name,

        count: vals.length,

        mean: mean(vals),

        min: Math.min(...vals),

        max: Math.max(...vals),

      })),

      hourlyAverages: hourlyBuckets.map(bucket => bucket.length > 0 ? mean(bucket) : 0),

    };

  }

  async exportChannelData(channel: DataChannel, format: 'json' | 'csv' = 'csv'): Promise<string> {

    const readings = await this.getRecentReadings(channel, MAX_READINGS_PER_CHANNEL);



    if (format === 'json') {

      return JSON.stringify(readings, null, 2);

    }



    // CSV

    const headers = ['stationId', 'stationName', 'city', 'channel', 'value', 'unit', 'timestamp', 'quality', 'cachedAt'];

    const rows = readings.map(r => [

      r.stationId,

      r.stationName,

      r.city,

      r.channel,

      r.value,

      r.unit,

      new Date(r.timestamp).toISOString(),

      r.quality,

      new Date(r.cachedAt).toISOString(),

    ].join(','));



    return [headers.join(','), ...rows].join('\n');

  }

  async getStats(channel: DataChannel, days: number = 7): Promise<ChannelStats[]> {

    if (!this.db) await this.init();

    if (!this.db) return [];



    const index = this.db.transaction('stats').store.index('by-channel');

    const results: ChannelStats[] = [];



    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);



    let cursor = await index.openCursor(IDBKeyRange.only(channel));

    while (cursor) {

      if (cursor.value.date >= cutoff) {

        results.push(cursor.value);

      }

      cursor = await cursor.continue();

    }



    return results.sort((a, b) => a.date.localeCompare(b.date));

  }
}
