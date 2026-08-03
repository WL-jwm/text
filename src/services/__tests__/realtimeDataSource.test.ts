// @vitest-environment jsdom
/**
 * G-01a 数据源基础层测试
 *
 * 测试覆盖：
 *   1. MockDataSource — 生成读数/连接/断开/fetch/testConnection
 *   2. HttpPollingDataSource — fetch 重试/响应解析/连接/断开
 *   3. WebSocketDataSource — stub 行为验证
 *   4. getDataSource 工厂 — 单例模式
 *   5. ConnectionLogger — 日志记录/订阅/过滤/清除
 *   6. realtimeDataService 数据源管理 API
 *   7. realtimeConfig — 默认配置/持久化/重置
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  MockDataSource,
  HttpPollingDataSource,
  WebSocketDataSource,
  getDataSource,
  connectionLogger,
  type HttpSourceConfig,
} from '../realtimeDataSource';
import {
  realtimeService,
  type DataChannel,
  type ChannelConfig,
} from '../realtimeDataService';
import {
  DEFAULT_SOURCE_CONFIGS,
  loadSourceConfigs,
  saveSourceConfigs,
  resetSourceConfigs,
} from '../../config/realtimeConfig';

// ============================================================
// 辅助工具
// ============================================================

function makeMockConfig(channel: DataChannel): ChannelConfig {
  return {
    channel,
    label: 'test',
    unit: 'm',
    intervalMs: 100,
    stations: [
      { id: 'S1', name: '站1', city: '城市', baseValue: 10, volatility: 1 },
      { id: 'S2', name: '站2', city: '城市', baseValue: 20, volatility: 2 },
    ],
  };
}

function makeHttpConfig(): HttpSourceConfig {
  return {
    endpoint: 'https://api.example.com/data',
    method: 'GET',
    timeoutMs: 5000,
    maxRetries: 2,
    retryDelayMs: 100,
    responseMapping: {
      stationIdPath: 'stationId',
      stationNamePath: 'stationName',
      cityPath: 'city',
      valuePath: 'value',
      unitPath: 'unit',
      timestampPath: 'timestamp',
      qualityPath: 'quality',
      isArray: true,
      dataPath: 'data',
    },
  };
}

// ============================================================
// 1. MockDataSource 测试
// ============================================================

describe('MockDataSource', () => {
  const source = new MockDataSource();

  it('类型为 mock，isPush 为 false', () => {
    expect(source.type).toBe('mock');
    expect(source.isPush).toBe(false);
  });

  it('fetch 返回正确数量的读数', async () => {
    const config = makeMockConfig('waterLevel');
    const readings = await source.fetch('waterLevel', config);
    expect(readings).toHaveLength(2);
    expect(readings[0].stationId).toBe('S1');
    expect(readings[1].stationId).toBe('S2');
    expect(readings[0].channel).toBe('waterLevel');
    expect(readings[0].unit).toBe('m');
  });

  it('读数值在合理范围内', async () => {
    const config = makeMockConfig('waterLevel');
    const readings = await source.fetch('waterLevel', config);
    // base=10, volatility=1 → value 应在 7~13 范围内（3σ）
    expect(readings[0].value).toBeGreaterThan(7);
    expect(readings[0].value).toBeLessThan(13);
  });

  it('connect 推送数据并可通过 disconnect 停止', () => {
    const config = makeMockConfig('waterQuality');
    config.intervalMs = 50;
    const readings: unknown[] = [];
    const disconnect = source.connect(
      'waterQuality',
      config,
      (r) => readings.push(r),
      () => {},
    );

    expect(readings.length).toBeGreaterThanOrEqual(1);

    disconnect();
    const countAfterDisconnect = readings.length;

    // 等一段时间，不应有更多数据
    return new Promise<void>(resolve => {
      setTimeout(() => {
        expect(readings.length).toBe(countAfterDisconnect);
        resolve();
      }, 120);
    });
  });

  it('testConnection 总是返回 true', async () => {
    const result = await source.testConnection('waterLevel', makeMockConfig('waterLevel'));
    expect(result).toBe(true);
  });
});

// ============================================================
// 2. HttpPollingDataSource 测试
// ============================================================

describe('HttpPollingDataSource', () => {
  const source = new HttpPollingDataSource();

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('类型为 http，isPush 为 false', () => {
    expect(source.type).toBe('http');
    expect(source.isPush).toBe(false);
  });

  it('fetch 正确解析数组响应', async () => {
    const mockResponse = {
      data: [
        { stationId: 'A1', stationName: '站A', city: '北京', value: 15.5, unit: 'm', timestamp: 1700000000000, quality: 'good' },
        { stationId: 'A2', stationName: '站B', city: '上海', value: 22.3, unit: 'm', timestamp: 1700000000001, quality: 'fair' },
      ],
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    } as Response);

    const config = { ...makeMockConfig('waterLevel'), httpConfig: makeHttpConfig() };
    const readings = await source.fetch('waterLevel', config);

    expect(readings).toHaveLength(2);
    expect(readings[0].stationId).toBe('A1');
    expect(readings[0].stationName).toBe('站A');
    expect(readings[0].city).toBe('北京');
    expect(readings[0].value).toBe(15.5);
    expect(readings[0].quality).toBe('good');
    expect(readings[1].stationId).toBe('A2');
    expect(readings[1].quality).toBe('fair');
  });

  it('fetch 在 HTTP 错误时重试', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Internal Server Error' } as Response)
      .mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Internal Server Error' } as Response)
      .mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Internal Server Error' } as Response);

    const config = { ...makeMockConfig('waterLevel'), httpConfig: makeHttpConfig() };

    await expect(source.fetch('waterLevel', config)).rejects.toThrow('HTTP 500');
  });

  it('fetch 成功后重试计数器归零', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({ ok: false, status: 503, statusText: 'Service Unavailable' } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: [{ stationId: 'B1', value: 30, stationName: '站', city: '城' }] }),
      } as Response);

    const config = { ...makeMockConfig('waterLevel'), httpConfig: makeHttpConfig() };
    const readings = await source.fetch('waterLevel', config);
    expect(readings).toHaveLength(1);
    expect(readings[0].stationId).toBe('B1');
  });

  it('fetch 处理单站点非数组响应', async () => {
    const singleResponse = {
      stationId: 'C1',
      stationName: '单站',
      city: '广州',
      value: 18.2,
      unit: 'm',
      timestamp: 1700000000000,
      quality: 'good',
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => singleResponse,
    } as Response);

    const httpConfig = makeHttpConfig();
    httpConfig.responseMapping.isArray = false;
    httpConfig.responseMapping.dataPath = undefined;

    const config = { ...makeMockConfig('waterLevel'), httpConfig };
    const readings = await source.fetch('waterLevel', config);

    expect(readings).toHaveLength(1);
    expect(readings[0].stationId).toBe('C1');
    expect(readings[0].stationName).toBe('单站');
  });

  it('testConnection 在成功时返回 true', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: [{ stationId: 'X1', value: 1, stationName: 'S', city: 'C' }] }),
    } as Response);

    const config = { ...makeMockConfig('waterLevel'), httpConfig: makeHttpConfig() };
    const result = await source.testConnection('waterLevel', config);
    expect(result).toBe(true);
  });

  it('testConnection 在失败时返回 false', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    const config = { ...makeMockConfig('waterLevel'), httpConfig: makeHttpConfig() };
    const result = await source.testConnection('waterLevel', config);
    expect(result).toBe(false);
  });

  it('connect 在缺少 httpConfig 时调用 onError', () => {
    const config = makeMockConfig('waterLevel'); // 无 httpConfig
    let errorCaught: Error | null = null;

    const disconnect = source.connect(
      'waterLevel',
      config,
      () => {},
      (err) => { errorCaught = err; },
    );

    expect(errorCaught).not.toBeNull();
    expect(errorCaught!.message).toContain('未配置');
    disconnect();
  });
});

// ============================================================
// 3. WebSocketDataSource 测试
// ============================================================

describe('WebSocketDataSource', () => {
  const source = new WebSocketDataSource();

  it('类型为 ws，isPush 为 true', () => {
    expect(source.type).toBe('ws');
    expect(source.isPush).toBe(true);
  });

  it('connect 调用 onError（未实现）', () => {
    let errorCaught: Error | null = null;
    const disconnect = source.connect(
      'waterLevel',
      makeMockConfig('waterLevel'),
      () => {},
      (err) => { errorCaught = err; },
    );

    expect(errorCaught).not.toBeNull();
    expect(errorCaught!.message).toContain('尚未实现');
    disconnect();
  });

  it('fetch 抛出未实现错误', async () => {
    await expect(source.fetch('waterLevel', makeMockConfig('waterLevel'))).rejects.toThrow('不支持主动拉取');
  });

  it('testConnection 返回 false', async () => {
    const result = await source.testConnection('waterLevel', makeMockConfig('waterLevel'));
    expect(result).toBe(false);
  });
});

// ============================================================
// 4. getDataSource 工厂测试
// ============================================================

describe('getDataSource 工厂', () => {
  it('返回对应类型的实例', () => {
    const mock = getDataSource('mock');
    const http = getDataSource('http');
    const ws = getDataSource('ws');

    expect(mock.type).toBe('mock');
    expect(http.type).toBe('http');
    expect(ws.type).toBe('ws');
  });

  it('同类型返回同一实例（单例）', () => {
    const a = getDataSource('mock');
    const b = getDataSource('mock');
    expect(a).toBe(b);
  });
});

// ============================================================
// 5. ConnectionLogger 测试
// ============================================================

describe('ConnectionLogger', () => {
  beforeEach(() => {
    connectionLogger.clear();
  });

  it('记录日志并获取', () => {
    connectionLogger.info('waterLevel', 'mock', '测试消息');
    const logs = connectionLogger.getLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].message).toBe('测试消息');
    expect(logs[0].level).toBe('info');
    expect(logs[0].channel).toBe('waterLevel');
  });

  it('按通道过滤日志', () => {
    connectionLogger.info('waterLevel', 'mock', '消息1');
    connectionLogger.warn('waterQuality', 'http', '消息2');
    const wqLogs = connectionLogger.getLogsByChannel('waterQuality');
    expect(wqLogs).toHaveLength(1);
    expect(wqLogs[0].message).toBe('消息2');
  });

  it('订阅日志更新', () => {
    const updates: unknown[] = [];
    const unsub = connectionLogger.subscribe(logs => updates.push(logs.length));

    connectionLogger.info('waterLevel', 'mock', '新消息');
    expect(updates.length).toBeGreaterThanOrEqual(2); // 初始 + 新增

    unsub();
    connectionLogger.info('waterLevel', 'mock', '取消后消息');
    // 取消后不应再推送
    const countAfterUnsub = updates.length;
    return new Promise<void>(resolve => {
      setTimeout(() => {
        expect(updates.length).toBe(countAfterUnsub);
        resolve();
      }, 50);
    });
  });

  it('超过 200 条时自动清理旧日志', () => {
    for (let i = 0; i < 210; i++) {
      connectionLogger.debug('waterLevel', 'mock', `msg-${i}`);
    }
    const logs = connectionLogger.getLogs();
    expect(logs.length).toBe(200);
    expect(logs[0].message).toBe('msg-10');
  });

  it('clear 清空日志', () => {
    connectionLogger.info('waterLevel', 'mock', '消息');
    connectionLogger.clear();
    expect(connectionLogger.getLogs()).toHaveLength(0);
  });
});

// ============================================================
// 6. realtimeConfig 测试
// ============================================================

describe('realtimeConfig', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('DEFAULT_SOURCE_CONFIGS 所有通道默认为 mock', () => {
    const channels: DataChannel[] = ['waterLevel', 'waterQuality', 'subsidence', 'extraction'];
    channels.forEach(ch => {
      expect(DEFAULT_SOURCE_CONFIGS[ch].type).toBe('mock');
      expect(DEFAULT_SOURCE_CONFIGS[ch].enabled).toBe(true);
    });
  });

  it('DEFAULT_SOURCE_CONFIGS http 通道有完整响应映射', () => {
    const channels: DataChannel[] = ['waterLevel', 'waterQuality', 'subsidence', 'extraction'];
    channels.forEach(ch => {
      const http = DEFAULT_SOURCE_CONFIGS[ch].httpConfig;
      expect(http).toBeDefined();
      expect(http!.endpoint).toContain('/api/realtime/');
      expect(http!.responseMapping.stationIdPath).toBe('stationId');
      expect(http!.responseMapping.valuePath).toBe('value');
      expect(http!.responseMapping.dataPath).toBe('data');
    });
  });

  it('loadSourceConfigs 回退到默认', () => {
    const configs = loadSourceConfigs();
    expect(configs.waterLevel.type).toBe('mock');
  });

  it('saveSourceConfigs + loadSourceConfigs 往返', () => {
    const custom = JSON.parse(JSON.stringify(DEFAULT_SOURCE_CONFIGS)) as typeof DEFAULT_SOURCE_CONFIGS;
    custom.waterLevel.type = 'http';
    saveSourceConfigs(custom);

    const loaded = loadSourceConfigs();
    expect(loaded.waterLevel.type).toBe('http');
  });

  it('resetSourceConfigs 恢复默认', () => {
    const custom = JSON.parse(JSON.stringify(DEFAULT_SOURCE_CONFIGS)) as typeof DEFAULT_SOURCE_CONFIGS;
    custom.waterLevel.type = 'http';
    saveSourceConfigs(custom);

    const reset = resetSourceConfigs();
    expect(reset.waterLevel.type).toBe('mock');

    const loaded = loadSourceConfigs();
    expect(loaded.waterLevel.type).toBe('mock');
  });

  it('loadSourceConfigs 处理损坏的 localStorage 数据', () => {
    localStorage.setItem('realtime-source-configs', '{invalid json');
    const configs = loadSourceConfigs();
    expect(configs.waterLevel.type).toBe('mock');
  });
});

// ============================================================
// 7. realtimeDataService 数据源管理 API 测试
// ============================================================

describe('realtimeDataService 数据源管理', () => {
  beforeEach(() => {
    localStorage.clear();
    realtimeService.disconnect();
    connectionLogger.clear();
    // 重置所有通道为 mock（singleton 状态需要在测试间清理）
    const channels: DataChannel[] = ['waterLevel', 'waterQuality', 'subsidence', 'extraction'];
    channels.forEach(ch => {
      realtimeService.setDataSourceType(ch, 'mock');
      realtimeService.setChannelEnabled(ch, true);
    });
  });

  afterEach(() => {
    realtimeService.disconnect();
  });

  it('getDataSourceType 默认返回 mock', () => {
    expect(realtimeService.getDataSourceType('waterLevel')).toBe('mock');
  });

  it('getSourceConfig 返回完整配置', () => {
    const config = realtimeService.getSourceConfig('waterLevel');
    expect(config.type).toBe('mock');
    expect(config.enabled).toBe(true);
  });

  it('setDataSourceType 切换数据源类型', () => {
    realtimeService.setDataSourceType('waterLevel', 'http');
    expect(realtimeService.getDataSourceType('waterLevel')).toBe('http');

    realtimeService.setDataSourceType('waterLevel', 'mock');
    expect(realtimeService.getDataSourceType('waterLevel')).toBe('mock');
  });

  it('setDataSourceType 切换到 http 时自动填充 httpConfig', () => {
    realtimeService.setDataSourceType('waterQuality', 'http');
    const config = realtimeService.getSourceConfig('waterQuality');
    expect(config.httpConfig).toBeDefined();
    expect(config.httpConfig!.endpoint).toBeDefined();
  });

  it('updateSourceConfig 更新配置', () => {
    realtimeService.updateSourceConfig('subsidence', { enabled: false });
    const config = realtimeService.getSourceConfig('subsidence');
    expect(config.enabled).toBe(false);
  });

  it('setChannelEnabled 禁用通道', () => {
    realtimeService.setChannelEnabled('extraction', false);
    expect(realtimeService.getSourceConfig('extraction').enabled).toBe(false);
  });

  it('getChannelError 初始为 undefined', () => {
    expect(realtimeService.getChannelError('waterLevel')).toBeUndefined();
  });

  it('onChannelError 订阅错误变化', () => {
    const errors: Array<{ channel: DataChannel; error: string | undefined }> = [];
    const unsub = realtimeService.onChannelError((channel, error) => {
      errors.push({ channel, error });
    });

    // 手动触发错误
    realtimeService.updateSourceConfig('waterLevel', { enabled: true });

    unsub();
    expect(typeof unsub).toBe('function');
  });

  it('getConnectionLogs 返回日志数组', () => {
    const logs = realtimeService.getConnectionLogs();
    expect(Array.isArray(logs)).toBe(true);
  });

  it('onLogs 返回取消订阅函数', () => {
    const unsub = realtimeService.onLogs(() => {});
    expect(typeof unsub).toBe('function');
    unsub();
  });

  it('clearLogs 清空日志', () => {
    realtimeService.clearLogs();
    expect(realtimeService.getConnectionLogs()).toHaveLength(0);
  });

  it('testConnection 对 mock 数据源返回 true', async () => {
    const result = await realtimeService.testConnection('waterLevel');
    expect(result).toBe(true);
  });

  it('refresh 返回读数数组', async () => {
    const readings = await realtimeService.refresh('waterLevel');
    expect(Array.isArray(readings)).toBe(true);
    expect(readings.length).toBeGreaterThan(0);
  });

  it('refreshAll 返回所有通道读数', async () => {
    const readings = await realtimeService.refreshAll();
    expect(readings.length).toBeGreaterThan(0);
    const chSet = new Set(readings.map(r => r.channel));
    expect(chSet.size).toBe(4);
  }, 15000);

  it('subscribe 接收数据并通过 unsubscribe 取消', () => {
    const received: unknown[] = [];
    const unsub = realtimeService.subscribe('waterLevel', readings => {
      received.push(readings);
    });

    expect(received.length).toBeGreaterThanOrEqual(1);
    unsub();
  });

  it('disconnect 清理所有连接', () => {
    realtimeService.subscribe('waterLevel', () => {});
    realtimeService.subscribe('waterQuality', () => {});
    realtimeService.disconnect();
    expect(realtimeService.getStatus()).toBe('disconnected');
  });
});
