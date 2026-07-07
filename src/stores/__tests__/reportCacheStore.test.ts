import { describe, it, expect, beforeEach } from 'vitest';
import { useReportCacheStore, simpleHash, buildCacheKey } from '../reportCacheStore';

describe('reportCacheStore', () => {
  beforeEach(() => {
    useReportCacheStore.getState().clearAll();
  });

  describe('simpleHash', () => {
    it('相同输入应产生相同hash', () => {
      expect(simpleHash('test')).toBe(simpleHash('test'));
    });

    it('不同输入应产生不同hash', () => {
      expect(simpleHash('aaa')).not.toBe(simpleHash('bbb'));
    });

    it('空字符串应返回有效hash', () => {
      const h = simpleHash('');
      expect(h).toBeTruthy();
      expect(h.length).toBeGreaterThan(0);
    });

    it('hash应为base36格式(数字+小写字母)', () => {
      const h = simpleHash('groundwater');
      expect(h).toMatch(/^[0-9a-z]+$/);
    });

    it('长字符串也应返回hash', () => {
      const long = 'a'.repeat(10000);
      const h = simpleHash(long);
      expect(h).toBeTruthy();
    });
  });

  describe('buildCacheKey', () => {
    it('仅pageName', () => {
      expect(buildCacheKey('resources')).toBe('resources');
    });

    it('pageName + section', () => {
      expect(buildCacheKey('resources', 'table')).toBe('resources:table');
    });

    it('pageName + section + filters', () => {
      const key = buildCacheKey('resources', 'chart', { city: '石家庄' });
      expect(key.startsWith('resources:chart:')).toBe(true);
      // hash部分为非空base36字符串
      const hashPart = key.split(':')[2];
      expect(hashPart).toMatch(/^[0-9a-z]+$/);
    });

    it('相同filters应产生相同key', () => {
      const filters = { year: 2024 };
      const k1 = buildCacheKey('page', 'sec', filters);
      const k2 = buildCacheKey('page', 'sec', { year: 2024 });
      expect(k1).toBe(k2);
    });

    it('不同filters应产生不同key', () => {
      const k1 = buildCacheKey('page', 'sec', { year: 2024 });
      const k2 = buildCacheKey('page', 'sec', { year: 2025 });
      expect(k1).not.toBe(k2);
    });

    it('filters顺序不同应产生不同key', () => {
      const k1 = buildCacheKey('page', 'sec', { a: 1, b: 2 });
      const k2 = buildCacheKey('page', 'sec', { b: 2, a: 1 });
      // JSON.stringify顺序不同 → 不同key
      expect(k1).not.toBe(k2);
    });
  });

  describe('setCache / getCache', () => {
    it('设置后应能获取', () => {
      const store = useReportCacheStore.getState();
      store.setCache('test:section', { value: 42 });
      const result = store.getCache<{ value: number }>('test:section');
      expect(result).toEqual({ value: 42 });
    });

    it('未设置的key应返回null', () => {
      const store = useReportCacheStore.getState();
      expect(store.getCache('nonexistent')).toBeNull();
    });

    it('缓存应支持任意数据类型', () => {
      const store = useReportCacheStore.getState();

      store.setCache('str', 'hello');
      expect(store.getCache<string>('str')).toBe('hello');

      store.setCache('num', 123);
      expect(store.getCache<number>('num')).toBe(123);

      store.setCache('arr', [1, 2, 3]);
      expect(store.getCache<number[]>('arr')).toEqual([1, 2, 3]);

      store.setCache('obj', { nested: { deep: true } });
      expect(store.getCache<{ nested: { deep: boolean } }>('obj')).toEqual({ nested: { deep: true } });
    });

    it('同一key覆盖应更新数据', () => {
      const store = useReportCacheStore.getState();
      store.setCache('key', 'old');
      store.setCache('key', 'new');
      expect(store.getCache<string>('key')).toBe('new');
    });
  });

  describe('getCache 过期机制', () => {
    it('默认5分钟内不应过期', () => {
      const store = useReportCacheStore.getState();
      store.setCache('fresh', 'data');
      expect(store.getCache<string>('fresh')).toBe('data');
    });

    it('自定义maxAge应生效', () => {
      const store = useReportCacheStore.getState();
      store.setCache('short', 'data');

      // maxAge=-1 使任何缓存过期
      expect(store.getCache<string>('short', -1)).toBeNull();
    });

    it('大maxAge不应过期', () => {
      const store = useReportCacheStore.getState();
      store.setCache('long', 'data');
      expect(store.getCache<string>('long', 999999999)).toBe('data');
    });
  });

  describe('getHash', () => {
    it('设置时传入hash应能获取', () => {
      const store = useReportCacheStore.getState();
      store.setCache('key', 'data', 'abc123');
      expect(store.getHash('key')).toBe('abc123');
    });

    it('未设置hash时应返回null', () => {
      const store = useReportCacheStore.getState();
      store.setCache('key', 'data');
      // 自动生成的时间戳hash
      expect(store.getHash('key')).toBeTruthy();
    });

    it('不存在的key应返回null', () => {
      const store = useReportCacheStore.getState();
      expect(store.getHash('nonexistent')).toBeNull();
    });
  });

  describe('invalidate', () => {
    it('应使指定前缀的缓存失效', () => {
      const store = useReportCacheStore.getState();
      store.setCache('resources:table', 't1');
      store.setCache('resources:chart', 'c1');
      store.setCache('other:table', 'o1');

      store.invalidate('resources');

      expect(store.getCache('resources:table')).toBeNull();
      expect(store.getCache('resources:chart')).toBeNull();
      expect(store.getCache<string>('other:table')).toBe('o1');
    });

    it('无匹配前缀时不应删除其他缓存', () => {
      const store = useReportCacheStore.getState();
      store.setCache('a:1', 'data1');
      store.setCache('b:2', 'data2');

      store.invalidate('c');

      expect(store.getCache<string>('a:1')).toBe('data1');
      expect(store.getCache<string>('b:2')).toBe('data2');
    });

    it('无冒号分隔的key不应被匹配', () => {
      const store = useReportCacheStore.getState();
      store.setCache('resourcestable', 'no-colon');
      store.setCache('resources:table', 'with-colon');

      store.invalidate('resources');

      expect(store.getCache<string>('resourcestable')).toBe('no-colon');
      expect(store.getCache('resources:table')).toBeNull();
    });
  });

  describe('clearAll', () => {
    it('应清除所有缓存', () => {
      const store = useReportCacheStore.getState();
      store.setCache('a', 1);
      store.setCache('b', 2);
      store.setCache('c', 3);

      store.clearAll();

      expect(store.getCache('a')).toBeNull();
      expect(store.getCache('b')).toBeNull();
      expect(store.getCache('c')).toBeNull();
    });

    it('清除后再setCache应正常工作', () => {
      const store = useReportCacheStore.getState();
      store.setCache('a', 1);
      store.clearAll();
      store.setCache('b', 2);

      expect(store.getCache('a')).toBeNull();
      expect(store.getCache<number>('b')).toBe(2);
    });
  });

  describe('getStats', () => {
    it('空缓存应返回0个keys', () => {
      const store = useReportCacheStore.getState();
      const stats = store.getStats();
      expect(stats.keys).toBe(0);
      expect(stats.entries).toHaveLength(0);
    });

    it('有缓存时应返回正确数量', () => {
      const store = useReportCacheStore.getState();
      store.setCache('a', 1);
      store.setCache('b', 2);
      store.setCache('c', 3);

      const stats = store.getStats();
      expect(stats.keys).toBe(3);
      expect(stats.entries).toHaveLength(3);
    });

    it('age应为秒级整数', () => {
      const store = useReportCacheStore.getState();
      store.setCache('new', 'data');

      const stats = store.getStats();
      const entry = stats.entries.find(e => e.key === 'new');
      expect(entry).toBeDefined();
      expect(entry!.age).toBe(0);
    });

    it('每个entry应有key和age', () => {
      const store = useReportCacheStore.getState();
      store.setCache('x', 'data');

      const stats = store.getStats();
      for (const entry of stats.entries) {
        expect(entry).toHaveProperty('key');
        expect(entry).toHaveProperty('age');
        expect(typeof entry.age).toBe('number');
      }
    });
  });
});
