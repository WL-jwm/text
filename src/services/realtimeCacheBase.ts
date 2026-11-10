/**
 * 实时缓存服务 — 抽象基类
 *  状态字段 / 数据库初始化 / 读写核心 / 保留策略清理（自 realtimeCacheCore.ts 继承拆分）
 */

import { openDB, type IDBPDatabase } from 'idb';
import type { RealtimeReading, DataChannel } from './realtimeDataService';
import type { CachedReading, TimeRangeQuery, RealtimeCacheDBSchema } from './realtimeCacheTypes';
import { DB_NAME, DB_VERSION, MAX_RETENTION_DAYS, CLEANUP_INTERVAL_MS } from './realtimeCacheTypes';
import { createRealtimeCacheSchema, groupReadingsByChannelDate, buildChannelStats, cleanupExpiredReadings, cleanupExpiredStats } from './realtimeCacheOps';
import { readRecentReadings, readReadingsByRange, readCacheCounts, readLastCachedTime, removeChannelReadings } from './realtimeCacheQuery';

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
          createRealtimeCacheSchema(database);
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
    return readRecentReadings(this.db, channel, limit);
  }

  async getByTimeRange(query: TimeRangeQuery): Promise<CachedReading[]> {
    if (!this.db) await this.init();
    if (!this.db) return [];
    return readReadingsByRange(this.db, query);
  }

  async getCacheCounts(): Promise<Record<DataChannel, number>> {
    if (!this.db) await this.init();
    if (!this.db) return { waterLevel: 0, waterQuality: 0, subsidence: 0, extraction: 0 };
    return readCacheCounts(this.db);
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
    return readLastCachedTime(this.db, channel);
  }

  async clearChannel(channel: DataChannel): Promise<number> {
    if (!this.db) await this.init();
    if (!this.db) return 0;
    return removeChannelReadings(this.db, channel);
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
    const deleted = await cleanupExpiredReadings(this.db, cutoff);
    // 同时清理过期统计
    const cutoffDate = new Date(cutoff).toISOString().slice(0, 10);
    await cleanupExpiredStats(this.db, cutoffDate);
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
    const groups = groupReadingsByChannelDate(readings);
    const tx = this.db.transaction('stats', 'readwrite');
    for (const [key, group] of groups) {
      // 尝试读取已有统计并合并
      const existing = await tx.store.get(key);
      const stats = buildChannelStats(key, group, existing);
      await tx.store.put(stats);
    }
    await tx.done;
  }
}
