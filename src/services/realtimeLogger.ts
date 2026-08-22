/**
 * 实时数据源 — 连接日志（自 realtimeDataSource 拆分）
 */
import type { DataChannel } from './realtimeDataService';
import type { DataSourceType } from './realtimeTypes';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  channel: DataChannel;
  sourceType: DataSourceType;
  message: string;
  detail?: string;
}

/**
 * 连接日志缓冲区（环形缓冲，最大 200 条）
 */
export class ConnectionLogger {
  private logs: LogEntry[] = [];
  private listeners = new Set<(logs: LogEntry[]) => void>();
  private readonly maxEntries = 200;

  log(entry: Omit<LogEntry, 'timestamp'>): void {
    const full: LogEntry = { ...entry, timestamp: Date.now() };
    this.logs.push(full);
    if (this.logs.length > this.maxEntries) {
      this.logs.shift();
    }
    this.listeners.forEach(cb => cb(this.logs));
  }

  info(channel: DataChannel, sourceType: DataSourceType, message: string, detail?: string): void {
    this.log({ level: 'info', channel, sourceType, message, detail });
  }

  warn(channel: DataChannel, sourceType: DataSourceType, message: string, detail?: string): void {
    this.log({ level: 'warn', channel, sourceType, message, detail });
  }

  error(channel: DataChannel, sourceType: DataSourceType, message: string, detail?: string): void {
    this.log({ level: 'error', channel, sourceType, message, detail });
  }

  debug(channel: DataChannel, sourceType: DataSourceType, message: string, detail?: string): void {
    this.log({ level: 'debug', channel, sourceType, message, detail });
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  getLogsByChannel(channel: DataChannel): LogEntry[] {
    return this.logs.filter(l => l.channel === channel);
  }

  clear(): void {
    this.logs = [];
    this.listeners.forEach(cb => cb(this.logs));
  }

  subscribe(cb: (logs: LogEntry[]) => void): () => void {
    this.listeners.add(cb);
    cb(this.logs);
    return () => this.listeners.delete(cb);
  }
}

export const connectionLogger = new ConnectionLogger();

// ============================================================
// 数据源类型与配置
// ============================================================
