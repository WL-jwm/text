/**
 * 拆分自 realtimeCacheBase.ts — 索引游标查询/删除纯函数
 * （基类方法保留 db 判空与 init 编排，游标遍历逻辑下沉至此）
 */

import type { IDBPDatabase } from 'idb';
import type { DataChannel } from './realtimeDataService';
import type { CachedReading, TimeRangeQuery, RealtimeCacheDBSchema } from './realtimeCacheTypes';

const ALL_CHANNELS: DataChannel[] = ['waterLevel', 'waterQuality', 'subsidence', 'extraction'];

/** 按通道读取最近 limit 条读数（时间正序） */
export async function readRecentReadings(
  db: IDBPDatabase<RealtimeCacheDBSchema>,
  channel: DataChannel,
  limit: number
): Promise<CachedReading[]> {
  const index = db.transaction('readings').store.index('by-channel-timestamp');
  const results: CachedReading[] = [];
  let cursor = await index.openCursor(
    IDBKeyRange.bound([channel, 0], [channel, Date.now() + 1]),
    'prev'
  );
  while (cursor && results.length < limit) {
    results.push(cursor.value);
    cursor = await cursor.continue();
  }
  return results.reverse();
}

/** 按时间区间读取读数（可选 limit 截断） */
export async function readReadingsByRange(
  db: IDBPDatabase<RealtimeCacheDBSchema>,
  query: TimeRangeQuery
): Promise<CachedReading[]> {
  const { channel, startTime, endTime, limit } = query;
  const index = db.transaction('readings').store.index('by-channel-timestamp');
  const range = IDBKeyRange.bound([channel, startTime], [channel, endTime]);
  const results: CachedReading[] = [];
  let cursor = await index.openCursor(range);
  while (cursor) {
    results.push(cursor.value);
    if (limit && results.length >= limit) break;
    cursor = await cursor.continue();
  }
  return results;
}

/** 统计各通道缓存条数 */
export async function readCacheCounts(
  db: IDBPDatabase<RealtimeCacheDBSchema>
): Promise<Record<DataChannel, number>> {
  const counts = {} as Record<DataChannel, number>;
  for (const ch of ALL_CHANNELS) {
    const index = db.transaction('readings').store.index('by-channel');
    counts[ch] = await index.count(IDBKeyRange.only(ch));
  }
  return counts;
}

/** 读取指定通道最后一次缓存的时间戳 */
export async function readLastCachedTime(
  db: IDBPDatabase<RealtimeCacheDBSchema>,
  channel: DataChannel
): Promise<number | undefined> {
  const index = db.transaction('readings').store.index('by-channel-timestamp');
  const range = IDBKeyRange.bound([channel, 0], [channel, Date.now() + 1]);
  const cursor = await index.openCursor(range, 'prev');
  return cursor ? cursor.value.timestamp : undefined;
}

/** 删除指定通道的全部读数，返回删除条数 */
export async function removeChannelReadings(
  db: IDBPDatabase<RealtimeCacheDBSchema>,
  channel: DataChannel
): Promise<number> {
  const tx = db.transaction('readings', 'readwrite');
  const index = tx.store.index('by-channel');
  let deleted = 0;
  let cursor = await index.openCursor(IDBKeyRange.only(channel));
  while (cursor) {
    await cursor.delete();
    deleted++;
    cursor = await cursor.continue();
  }
  await tx.done;
  return deleted;
}
