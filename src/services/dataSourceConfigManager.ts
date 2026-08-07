/**
 * 数据共享与对接 - 数据源配置管理
 * 管理外部数据源（HTTP/WS）配置，持久化到 IDB
 */
import type { DataSourceType } from './realtimeDataSource';

// ============ 数据模型 ============

/** 数据源配置 */
export interface DataSourceConfig {
  /** 配置 ID */
  id: string;
  /** 名称 */
  name: string;
  /** 类型 */
  type: DataSourceType;
  /** 端点 URL */
  endpoint: string;
  /** 通道配置 */
  channels: DataSourceChannelConfig[];
  /** 是否启用 */
  enabled: boolean;
  /** 轮询间隔（ms，仅 HTTP） */
  pollingInterval?: number;
  /** 最后连接时间 */
  lastConnected?: string;
  /** 连接状态 */
  status: 'untested' | 'connected' | 'disconnected' | 'error';
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
  /** 备注 */
  note?: string;
}

/** 数据源通道配置 */
export interface DataSourceChannelConfig {
  /** 通道标识 */
  channel: string;
  /** 显示名称 */
  label: string;
  /** 是否启用 */
  enabled: boolean;
  /** 数据路径映射（JSONPath） */
  dataPath?: string;
  /** 值字段名 */
  valueField?: string;
  /** 时间戳字段名 */
  timestampField?: string;
}

/** 数据源配置创建参数 */
export interface CreateDataSourceConfig {
  name: string;
  type: DataSourceType;
  endpoint: string;
  channels?: DataSourceChannelConfig[];
  pollingInterval?: number;
  note?: string;
}

// ============ 默认通道配置 ============

/** 默认通道配置列表 */
export const DEFAULT_CHANNELS: DataSourceChannelConfig[] = [
  { channel: 'waterLevel', label: '水位', enabled: true, dataPath: 'data.waterLevel', valueField: 'value', timestampField: 'time' },
  { channel: 'waterQuality', label: '水质', enabled: true, dataPath: 'data.waterQuality', valueField: 'score', timestampField: 'time' },
  { channel: 'subsidence', label: '沉降', enabled: true, dataPath: 'data.subsidence', valueField: 'mm', timestampField: 'time' },
  { channel: 'extraction', label: '开采量', enabled: true, dataPath: 'data.extraction', valueField: 'volume', timestampField: 'time' },
];

// ============ 配置管理 ============

/**
 * 数据源配置管理器
 */
export class DataSourceConfigManager {
  private configs: DataSourceConfig[] = [];
  private listeners: Set<() => void> = new Set();

  constructor(initialConfigs?: DataSourceConfig[]) {
    if (initialConfigs) {
      this.configs = [...initialConfigs];
    }
  }

  /** 获取所有配置 */
  getAll(): DataSourceConfig[] {
    return [...this.configs];
  }

  /** 获取启用配置 */
  getEnabled(): DataSourceConfig[] {
    return this.configs.filter(c => c.enabled);
  }

  /** 按 ID 获取 */
  getById(id: string): DataSourceConfig | undefined {
    return this.configs.find(c => c.id === id);
  }

  /** 按类型获取 */
  getByType(type: DataSourceType): DataSourceConfig[] {
    return this.configs.filter(c => c.type === type);
  }

  /** 添加配置 */
  add(config: CreateDataSourceConfig): DataSourceConfig {
    const now = new Date().toISOString();
    const newConfig: DataSourceConfig = {
      id: `ds-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ...config,
      channels: config.channels ?? DEFAULT_CHANNELS.map(c => ({ ...c })),
      enabled: true,
      status: 'untested',
      createdAt: now,
      updatedAt: now,
    };
    this.configs.push(newConfig);
    this.notify();
    return newConfig;
  }

  /** 更新配置 */
  update(id: string, patch: Partial<DataSourceConfig>): DataSourceConfig | undefined {
    const idx = this.configs.findIndex(c => c.id === id);
    if (idx === -1) return undefined;
    this.configs[idx] = {
      ...this.configs[idx],
      ...patch,
      id,
      updatedAt: new Date().toISOString(),
    };
    this.notify();
    return this.configs[idx];
  }

  /** 删除配置 */
  remove(id: string): boolean {
    const idx = this.configs.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.configs.splice(idx, 1);
    this.notify();
    return true;
  }

  /** 切换启用 */
  toggleEnabled(id: string): DataSourceConfig | undefined {
    const config = this.getById(id);
    if (!config) return undefined;
    return this.update(id, { enabled: !config.enabled });
  }

  /** 更新连接状态 */
  updateStatus(id: string, status: DataSourceConfig['status']): void {
    const config = this.getById(id);
    if (config) {
      this.update(id, {
        status,
        lastConnected: status === 'connected' ? new Date().toISOString() : config.lastConnected,
      });
    }
  }

  /** 订阅变更 */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** 通知变更 */
  private notify(): void {
    for (const listener of this.listeners) {
      try { listener(); } catch { /* 忽略单个监听器错误 */ }
    }
  }

  /** 获取配置总数 */
  get count(): number {
    return this.configs.length;
  }

  /** 导出配置为 JSON */
  exportConfig(): string {
    return JSON.stringify(this.configs, null, 2);
  }

  /** 从 JSON 导入配置 */
  importConfig(json: string): number {
    try {
      const configs = JSON.parse(json) as DataSourceConfig[];
      if (!Array.isArray(configs)) return 0;
      this.configs = configs;
      this.notify();
      return configs.length;
    } catch {
      return 0;
    }
  }
}

// ============ 预设配置 ============

/** 获取预设数据源配置示例 */
export function getPresetConfigs(): CreateDataSourceConfig[] {
  return [
    {
      name: '河北省地下水监测平台',
      type: 'http',
      endpoint: 'http://110.249.223.67/api/v1/realtime',
      pollingInterval: 300000, // 5分钟
      note: '河北省环评公示平台地下水监测数据',
    },
    {
      name: '河北水文水资源监测中心',
      type: 'http',
      endpoint: 'https://api.hebswj.cn/v2/groundwater',
      pollingInterval: 600000, // 10分钟
      note: '水位、水质公开数据',
    },
  ];
}

// ============ 测试连接 ============

/**
 * 测试数据源连接
 * 返回连接结果
 */
export async function testConnection(config: DataSourceConfig): Promise<{ success: boolean; latency: number; message: string }> {
  const start = Date.now();
  try {
    const response = await fetch(config.endpoint, {
      method: 'HEAD',
      signal: AbortSignal.timeout(10000),
    });
    const latency = Date.now() - start;
    if (response.ok) {
      return { success: true, latency, message: `连接成功（${latency}ms）` };
    }
    return { success: false, latency, message: `HTTP ${response.status}: ${response.statusText}` };
  } catch (err) {
    const latency = Date.now() - start;
    const msg = err instanceof Error ? err.message : '未知错误';
    return { success: false, latency, message: `连接失败: ${msg}` };
  }
}