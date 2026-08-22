/**
 * 实时数据源 — HTTP 轮询数据源（自 realtimeDataSource 拆分）
 */
import { getPath, toNumber, toStr, toQuality } from './realtimeUtils';
import { connectionLogger } from './realtimeLogger';
import type { RealtimeDataSource, HttpSourceConfig } from './realtimeTypes';
import type { DataChannel, RealtimeReading } from './realtimeDataService';
import type { ChannelConfig } from './realtimeDataService';
import type { DataSourceType, HttpResponseMapping } from './realtimeTypes';

export class HttpPollingDataSource implements RealtimeDataSource {
  readonly type: DataSourceType = 'http';
  readonly isPush = false;

  private timers = new Map<DataChannel, ReturnType<typeof setInterval>>();
  private abortControllers = new Map<DataChannel, AbortController>();

  private async fetchOnce(
    channel: DataChannel,
    config: ChannelConfig,
    sourceConfig: HttpSourceConfig,
  ): Promise<RealtimeReading[]> {
    const {
      endpoint,
      method = 'GET',
      headers = {},
      body,
      authToken,
      timeoutMs = 10000,
      maxRetries = 3,
      retryDelayMs = 2000,
      responseMapping,
    } = sourceConfig;

    const reqHeaders: Record<string, string> = { ...headers };
    if (authToken) {
      reqHeaders['Authorization'] = `Bearer ${authToken}`;
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const controller = new AbortController();
      this.abortControllers.set(channel, controller);
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        connectionLogger.debug(channel, this.type, `HTTP 请求 attempt=${attempt}`, endpoint);

        const resp = await fetch(endpoint, {
          method,
          headers: reqHeaders,
          body: method === 'POST' ? body : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        this.abortControllers.delete(channel);

        if (!resp.ok) {
          throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
        }

        const json = await resp.json();
        return this.parseResponse(json, channel, config, responseMapping);
      } catch (err) {
        clearTimeout(timeoutId);
        this.abortControllers.delete(channel);

        lastError = err instanceof Error ? err : new Error(String(err));

        if (attempt < maxRetries) {
          connectionLogger.warn(channel, this.type, `请求失败，${retryDelayMs}ms 后重试 (${attempt + 1}/${maxRetries})`, lastError.message);
          await new Promise(resolve => setTimeout(resolve, retryDelayMs));
        }
      }
    }

    throw lastError ?? new Error('Unknown HTTP error');
  }

  /**
   * 按 responseMapping 解析响应数据
   */
  private parseResponse(
    json: unknown,
    channel: DataChannel,
    config: ChannelConfig,
    mapping: HttpResponseMapping,
  ): RealtimeReading[] {
    let dataArr: unknown[];

    if (mapping.dataPath) {
      const wrapped = getPath(json, mapping.dataPath);
      if (!Array.isArray(wrapped)) {
        connectionLogger.error(channel, this.type, `响应数据路径 "${mapping.dataPath}" 不是数组`);
        return [];
      }
      dataArr = wrapped;
    } else if (mapping.isArray) {
      if (!Array.isArray(json)) {
        connectionLogger.error(channel, this.type, '响应不是数组');
        return [];
      }
      dataArr = json;
    } else {
      dataArr = [json];
    }

    return dataArr.map(item => {
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
  }

  connect(
    channel: DataChannel,
    config: ChannelConfig,
    onReading: (readings: RealtimeReading[]) => void,
    onError: (error: Error) => void,
  ): () => void {
    // HttpPollingDataSource 需要 sourceConfig，这里通过 config 扩展获取
    // 实际使用时由 realtimeDataService 传入带 httpConfig 的 ChannelConfig
    const sourceConfig = (config as ChannelConfig & { httpConfig?: HttpSourceConfig }).httpConfig;

    if (!sourceConfig) {
      const err = new Error(`通道 ${channel} 未配置 HTTP 数据源参数`);
      connectionLogger.error(channel, this.type, err.message);
      onError(err);
      return () => {};
    }

    connectionLogger.info(channel, this.type, `HTTP 数据源已连接，端点: ${sourceConfig.endpoint}`);

    // 初始请求
    this.fetchOnce(channel, config, sourceConfig)
      .then(readings => onReading(readings))
      .catch(err => {
        connectionLogger.error(channel, this.type, '初始请求失败', err.message);
        onError(err);
      });

    const timer = setInterval(() => {
      this.fetchOnce(channel, config, sourceConfig)
        .then(readings => onReading(readings))
        .catch(err => {
          connectionLogger.error(channel, this.type, '轮询请求失败', err.message);
          onError(err);
        });
    }, config.intervalMs);

    this.timers.set(channel, timer);

    return () => {
      clearInterval(timer);
      this.timers.delete(channel);
      const controller = this.abortControllers.get(channel);
      if (controller) {
        controller.abort();
        this.abortControllers.delete(channel);
      }
      connectionLogger.info(channel, this.type, 'HTTP 数据源已断开');
    };
  }

  async fetch(channel: DataChannel, config: ChannelConfig): Promise<RealtimeReading[]> {
    const sourceConfig = (config as ChannelConfig & { httpConfig?: HttpSourceConfig }).httpConfig;
    if (!sourceConfig) {
      throw new Error(`通道 ${channel} 未配置 HTTP 数据源参数`);
    }
    return this.fetchOnce(channel, config, sourceConfig);
  }

  async testConnection(channel: DataChannel, config: ChannelConfig): Promise<boolean> {
    try {
      const readings = await this.fetch(channel, config);
      return readings.length > 0;
    } catch {
      return false;
    }
  }
}

// ============================================================
// WebSocketDataSource — G-01b 实现
// ============================================================

/** WebSocket 连接状态 */
