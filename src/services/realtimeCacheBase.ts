/**
 * 实时缓存服务 — 抽象基类
 *  状态字段 / 数据库初始化 / 读写核心 / 保留策略清理（自 realtimeCacheCore.ts 继承拆分）
 */

import { openDB, type IDBPDatabase } from 'idb';
import type { RealtimeReading, DataChannel } from './realtimeDataService';
import type { CachedReading, ChannelStats, TimeRangeQuery, RealtimeCacheDBSchema } from './realtimeCacheTypes';
import { DB_NAME, DB_VERSION, MAX_RETENTION_DAYS, CLEANUP_INTERVAL_MS } from './realtimeCacheTypes';
import { mean, std, percentile, median } from './realtimeCacheUtils';

export abstract class RealtimeCacheBase {
  protected db: IDBPDatabase<RealtimeCacheDBSchema> | null = null;
  protected initPromise: Promise<void> | null = null;

  async init(): Promise<void> {

    if (this.db) return;

    if (this.initPromise) {

      await this.initPromise;

      return;

    }



    this.initPromise = this._initDB();

    await this.initPromise;

  }

  private async _initDB(): Promise<void> {

    try {

      this.db = await openDB<RealtimeCacheDBSchema>(DB_NAME, DB_VERSION, {

        upgrade(database) {

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

        },

      });



      // 检查是否需要清理

      await this._maybeCleanup();

    } catch (err) {

      console.error('[RealtimeCache] IDB init failed:', err);

    }

  }

  async putReadings(readings: RealtimeReading[]): Promise<number> {

    if (!this.db) await this.init();

    if (!this.db || readings.length === 0) return 0;



    const tx = this.db.transaction('readings', 'readwrite');

    let written = 0;



    for (const r of readings) {

      const cached: CachedReading = {

        ...r,

        id: `${r.channel}-${r.timestamp}-${r.stationId}`,

        cachedAt: Date.now(),

      };

      try {

        await tx.store.put(cached);

        written++;

      } catch {

        // 主键冲突（重复读数）静默跳过

      }

    }



    await tx.done;



    // 异步更新统计（不阻塞写入）

    this.updateStats(readings).catch(() => {});



    return written;

  }

  async getRecentReadings(channel: DataChannel, limit: number = 100): Promise<CachedReading[]> {

    if (!this.db) await this.init();

    if (!this.db) return [];



    const index = this.db.transaction('readings').store.index('by-channel-timestamp');

    const results: CachedReading[] = [];



    let cursor = await index.openCursor(IDBKeyRange.bound([channel, 0], [channel, Date.now() + 1]), 'prev');

    while (cursor && results.length < limit) {

      results.push(cursor.value);

      cursor = await cursor.continue();

    }



    return results.reverse(); // 按时间正序返回

  }

  async getByTimeRange(query: TimeRangeQuery): Promise<CachedReading[]> {

    if (!this.db) await this.init();

    if (!this.db) return [];



    const { channel, startTime, endTime, limit } = query;

    const index = this.db.transaction('readings').store.index('by-channel-timestamp');

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

  async getCacheCounts(): Promise<Record<DataChannel, number>> {

    if (!this.db) await this.init();

    if (!this.db) return { waterLevel: 0, waterQuality: 0, subsidence: 0, extraction: 0 };



    const channels: DataChannel[] = ['waterLevel', 'waterQuality', 'subsidence', 'extraction'];

    const counts = {} as Record<DataChannel, number>;



    for (const ch of channels) {

      const index = this.db.transaction('readings').store.index('by-channel');

      counts[ch] = await index.count(IDBKeyRange.only(ch));

    }



    return counts;

  }

  async getCacheSize(): Promise<number> {

    if (!this.db) await this.init();

    if (!this.db) return 0;



    // IDB 没有直接的 size API，用 navigator.storage.estimate 估算

    if (navigator.storage?.estimate) {

      const estimate = await navigator.storage.estimate();

      return estimate.usage ?? 0;

    }

    return 0;

  }

  async getLastCachedTime(channel: DataChannel): Promise<number | undefined> {

    if (!this.db) await this.init();

    if (!this.db) return undefined;



    const index = this.db.transaction('readings').store.index('by-channel-timestamp');

    const range = IDBKeyRange.bound([channel, 0], [channel, Date.now() + 1]);

    let lastTime: number | undefined;



    const cursor = await index.openCursor(range, 'prev');

    if (cursor) {

      lastTime = cursor.value.timestamp;

    }



    return lastTime;

  }

  async clearChannel(channel: DataChannel): Promise<number> {

    if (!this.db) await this.init();

    if (!this.db) return 0;



    const tx = this.db.transaction('readings', 'readwrite');

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

  async clearAll(): Promise<void> {

    if (!this.db) await this.init();

    if (!this.db) return;



    await this.db.clear('readings');

    await this.db.clear('stats');

    await this.db.clear('meta');

  }

  private async _maybeCleanup(): Promise<void> {

    if (!this.db) return;



    // 检查上次清理时间

    const meta = await this.db.get('meta', 'last-cleanup');

    const lastCleanup = meta?.value as number | undefined;



    if (lastCleanup && Date.now() - lastCleanup < CLEANUP_INTERVAL_MS) {

      return; // 未到清理间隔

    }



    await this._cleanupExpired();

    await this.db.put('meta', { key: 'last-cleanup', value: Date.now(), updatedAt: Date.now() });

  }

  private async _cleanupExpired(): Promise<number> {

    if (!this.db) return 0;



    const cutoff = Date.now() - MAX_RETENTION_DAYS * 24 * 60 * 60 * 1000;

    const tx = this.db.transaction('readings', 'readwrite');

    const index = tx.store.index('by-timestamp');

    let deleted = 0;



    let cursor = await index.openCursor(IDBKeyRange.upperBound(cutoff));

    while (cursor) {

      await cursor.delete();

      deleted++;

      cursor = await cursor.continue();

    }



    await tx.done;



    // 同时清理过期统计

    const statsTx = this.db.transaction('stats', 'readwrite');

    const cutoffDate = new Date(cutoff).toISOString().slice(0, 10);

    let statsCursor = await statsTx.store.openCursor();

    while (statsCursor) {

      if (statsCursor.value.date < cutoffDate) {

        await statsCursor.delete();

      }

      statsCursor = await statsCursor.continue();

    }

    await statsTx.done;



    return deleted;

  }

  async cleanup(): Promise<{ readingsDeleted: number; expiredBefore: number }> {

    if (!this.db) await this.init();

    if (!this.db) return { readingsDeleted: 0, expiredBefore: 0 };



    const cutoff = Date.now() - MAX_RETENTION_DAYS * 24 * 60 * 60 * 1000;

    const deleted = await this._cleanupExpired();

    await this.db.put('meta', { key: 'last-cleanup', value: Date.now(), updatedAt: Date.now() });



    return { readingsDeleted: deleted, expiredBefore: cutoff };

  }

  private async updateStats(readings: RealtimeReading[]): Promise<void> {

    if (!this.db || readings.length === 0) return;



    // 按通道+日期分组

    const groups = new Map<string, RealtimeReading[]>();

    for (const r of readings) {

      const date = new Date(r.timestamp).toISOString().slice(0, 10);

      const key = `${r.channel}-${date}`;

      if (!groups.has(key)) groups.set(key, []);

      groups.get(key)!.push(r);

    }



    const tx = this.db.transaction('stats', 'readwrite');



    for (const [key, group] of groups) {

      const values = group.map(r => r.value);

      const channel = group[0].channel;

      const date = key.split('-').slice(-3).join('-');



      // 尝试读取已有统计并合并

      const existing = await tx.store.get(key);

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



      await tx.store.put(stats);

    }



    await tx.done;

  }
}
