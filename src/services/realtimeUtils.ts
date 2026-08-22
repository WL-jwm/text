/**
 * 实时数据源 — 内部工具（自 realtimeDataSource 拆分）
 */
import type { RealtimeReading } from './realtimeDataService';

export function gaussian(): number {
  const u1 = Math.random() || 0.0001;
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/**
 * 从对象中按路径读取值
 * @example getPath({ data: { id: 'A1' } }, 'data.id') → 'A1'
 */
export function getPath(obj: unknown, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

/**
 * 将未知值安全转换为 number
 */
export function toNumber(val: unknown): number {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') return parseFloat(val) || 0;
  return 0;
}

/**
 * 将未知值安全转换为 string
 */
export function toStr(val: unknown, fallback = ''): string {
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  return fallback;
}

/**
 * 将未知值安全转换为 quality
 */
export function toQuality(val: unknown): RealtimeReading['quality'] {
  const s = toStr(val, 'good');
  if (s === 'fair' || s === 'poor') return s;
  return 'good';
}

// ============================================================
// MockDataSource — 本地模拟数据源
// ============================================================
