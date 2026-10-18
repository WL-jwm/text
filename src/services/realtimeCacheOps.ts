/**
 * 拆分自 realtimeCacheBase.ts — 缓存操作纯函数（schema/分组/统计/过期清理）
 */

import type { IDBPDatabase } from 'idb';
import type { RealtimeReading } from './realtimeDataService';
import type { ChannelStats, RealtimeCacheDBSchema } from './realtimeCacheTypes';
import { mean, std, percentile, median } from './realtimeCacheUtils';

/** 创建缓存对象库 schema（idb upgrade 回调） */
export function createRealtimeCacheSchema(database: IDBPDatabase<RealtimeCacheDBSchema>): void {


          if (!database.objectStoreNames.contains('readings')) {

            const readingStore = database.createObjectStore('readings', { keyPath: 'id' });

            readingStore.createIndex('by-channel', 'channel');

            readingStore.createIndex('by-timestamp', 'timestamp');

            readingStore.createIndex('by-channel-timestamp', ['channel', 'timestamp']);

          }

          if (!database.objectStoreNames.contains('stats')) {

            const statsStore = database.createObjectStore('stats', { keyPath: 'id' });

            statsStore.createIndex('by-channel', 'channel');

          }

          if (!database.objectStoreNames.contains('meta')) {

            database.createObjectStore('meta', { keyPath: 'key' });

          }

}

/** 按 通道+日期 分组读数 */
export function groupReadingsByChannelDate(readings: RealtimeReading[]): Map<string, RealtimeReading[]> {
const groups = new Map<string, RealtimeReading[]>();

    for (const r of readings) {

      const date = new Date(r.timestamp).toISOString().slice(0, 10);

      const key = `${r.channel}-${date}`;

      if (!groups.has(key)) groups.set(key, []);

      groups.get(key)!.push(r);

    }

  return groups;
}

/** 构建通道日统计（合并已有统计） */
export function buildChannelStats(key: string, group: RealtimeReading[], existing: ChannelStats | null | undefined): ChannelStats {
const values = group.map(r => r.value);

      const channel = group[0].channel;

      const date = key.split('-').slice(-3).join('-');



      // 尝试读取已有统计并合并

      

      const allValues = existing ? [...values, existing.mean] : values; // 简化：用已有均值代表历史



      const stats: ChannelStats = {

        id: key,

        channel,

        date,

        count: (existing?.count ?? 0) + group.length,

        mean: mean(allValues),

        min: Math.min(...values, existing?.min ?? Infinity),

        max: Math.max(...values, existing?.max ?? -Infinity),

        std: std(allValues),

        median: median(allValues),

        p25: percentile(allValues, 0.25),

        p75: percentile(allValues, 0.75),

        updatedAt: Date.now(),

      };



      if (existing) {

        stats.min = Math.min(stats.min, existing.min);

        stats.max = Math.max(stats.max, existing.max);

      }



      return stats;
}

/** 清理过期读数（readings 表按时间索引） */
export async function cleanupExpiredReadings(db: IDBPDatabase<RealtimeCacheDBSchema>, cutoff: number): Promise<number> {
const tx = db.transaction('readings', 'readwrite');

    const index = tx.store.index('by-timestamp');

    let deleted = 0;



    let cursor = await index.openCursor(IDBKeyRange.upperBound(cutoff));

    while (cursor) {

      await cursor.delete();

      deleted++;

      cursor = await cursor.continue();

    }



    await tx.done;
  return deleted;
}

/** 清理过期统计（stats 表按日期） */
export async function cleanupExpiredStats(db: IDBPDatabase<RealtimeCacheDBSchema>, cutoffDate: string): Promise<void> {
const statsTx = db.transaction('stats', 'readwrite');

    let statsCursor = await statsTx.store.openCursor();

    while (statsCursor) {

      if (statsCursor.value.date < cutoffDate) {

        await statsCursor.delete();

      }

      statsCursor = await statsCursor.continue();

    }

    await statsTx.done;
}


