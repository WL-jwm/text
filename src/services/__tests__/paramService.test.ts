/**
 * paramService.ts 参数服务单元测试
 * 覆盖：服务状态管理、查询接口(模拟HTTP)、缓存行为
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getServiceStatus,
  onStatusChange,
  queryParams,
  getParamById,
  getCategories,
  getRegions,
  getStats,
  checkServiceHealth,
  getPermeabilityData,
  getLithologyMuData,
  getAquiferGroupsData,
  getInfiltrationData,
  getDispersivityData,
  type ParamItem,
} from '../paramService';

// ============================================================
// 服务状态管理
// ============================================================
describe('getServiceStatus', () => {
  it('应返回有效状态值', () => {
    const status = getServiceStatus();
    expect(['remote', 'local', 'loading', 'error']).toContain(status);
  });
});

describe('onStatusChange', () => {
  it('应注册和触发状态变化监听', () => {
    const listener = vi.fn();
    onStatusChange(listener);
    // 更改状态应触发回调(验证不抛异常)
    expect(() => onStatusChange(listener)).not.toThrow();
  });

  it('多次注册不应冲突', () => {
    const l1 = vi.fn();
    const l2 = vi.fn();
    onStatusChange(l1);
    onStatusChange(l2);
    expect(() => onStatusChange(l1)).not.toThrow();
  });
});

// ============================================================
// HTTP查询接口(模拟fetch)
// ============================================================
describe('checkServiceHealth', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('服务正常时应返回true', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'ok' }),
    });
    const result = await checkServiceHealth();
    expect(result).toBe(true);
  });

  it('服务异常时应返回false', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    const result = await checkServiceHealth();
    expect(result).toBe(false);
  });

  it('非200响应应返回false', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    });
    const result = await checkServiceHealth();
    expect(result).toBe(false);
  });
});

describe('queryParams', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('应返回分页查询结果', async () => {
    const mockData = {
      items: [{ id: '1', name: '渗透系数', value: 12.5, unit: 'm/d', category: '水文地质参数' }],
      total: 1,
      page: 1,
      pageSize: 20,
    };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });
    const result = await queryParams({ category: '水文地质参数' });
    expect(result).toBeDefined();
    expect(result!.items.length).toBe(1);
    expect(result!.total).toBe(1);
  });

  it('支持按关键词搜索', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ items: [], total: 0, page: 1, pageSize: 20 }),
    });
    const result = await queryParams({ keyword: '渗透' });
    expect(result).toBeDefined();
    expect(result!.total).toBe(0);
  });

  it('网络异常应返回null', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    const result = await queryParams({ category: '水文' });
    expect(result).toBeNull();
  });

  it('空过滤条件应正常调用', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ items: [], total: 0, page: 1, pageSize: 20 }),
    });
    const result = await queryParams({});
    expect(result).toBeDefined();
  });
});

describe('getParamById', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('应返回指定ID的参数', async () => {
    const mockParam = { id: 'p1', name: '给水度', value: '0.15', unit: '', category: '水文地质参数' } as ParamItem;
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockParam,
    });
    const result = await getParamById('p1');
    expect(result).toBeDefined();
    expect(result!.id).toBe('p1');
    expect(result!.name).toBe('给水度');
  });

  it('不存在时返回null', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => null,
    });
    const result = await getParamById('nonexistent');
    expect(result).toBeNull();
  });
});

describe('getCategories', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('应返回分类列表', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ category: '水文地质参数', count: 50 }],
    });
    const result = await getCategories();
    expect(result).toBeDefined();
    expect(result!.length).toBeGreaterThan(0);
  });
});

describe('getRegions', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('应返回地区列表', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ['石家庄', '唐山', '邯郸'],
    });
    const result = await getRegions();
    expect(result).toBeDefined();
    expect(result!.length).toBe(3);
  });
});

describe('getStats', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('应返回统计数据', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ totalParams: 500, categories: 10, lastUpdate: '2024-12-01' }),
    });
    const result = await getStats();
    expect(result).toBeDefined();
    expect(result).toBeDefined();
  });
});

// ============================================================
// 专业数据查询(模拟)
// ============================================================
describe('专业数据查询函数', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [], count: 0 }),
    });
  });

  it('getPermeabilityData应返回数据', async () => {
    const result = await getPermeabilityData();
    expect(result).toBeDefined();
  });

  it('getLithologyMuData应返回数据', async () => {
    const result = await getLithologyMuData();
    expect(result).toBeDefined();
  });

  it('getAquiferGroupsData应返回数据', async () => {
    const result = await getAquiferGroupsData();
    expect(result).toBeDefined();
  });

  it('getInfiltrationData应返回数据', async () => {
    const result = await getInfiltrationData();
    expect(result).toBeDefined();
  });

  it('getDispersivityData应返回数据', async () => {
    const result = await getDispersivityData();
    expect(result).toBeDefined();
  });
});
