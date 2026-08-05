/**
 * H-01 监测井网实时读数联动 — 服务层
 *
 * 将监测井网（Well）与实时读数（RealtimeReading）关联：
 *   1. 按 stationId 匹配井与其实时读数
 *   2. 生成带实时数据的井视图（WellWithData）
 *   3. 计算井的实时状态（正常/预警/超标）
 *   4. 通道级读数聚合
 *   5. 异常井筛选与统计
 */

import type { Well } from './wellNetwork';
import type { RealtimeReading, DataChannel } from './realtimeDataService';
import { ALERT_THRESHOLDS } from './realtimeDataService';

// ============================================================
// 类型定义
// ============================================================

/** 井实时状态 */
export type WellRealtimeStatus = 'normal' | 'warning' | 'critical' | 'stale';

/** 井的实时数据视图 */
export interface WellWithData extends Well {
  /** 实时读数详情 */
  realtime: {
    /** 匹配到的读数 */
    reading: RealtimeReading | null;
    /** 当前值 */
    value: number | null;
    /** 单位 */
    unit: string;
    /** 更新时间戳 */
    timestamp: number | null;
    /** 数据是否过期 */
    isStale: boolean;
    /** 数据质量 */
    quality: RealtimeReading['quality'] | null;
    /** 实时状态 */
    status: WellRealtimeStatus;
  };
  /** 该井所属通道的所有读数（可能多条） */
  channelReadings: RealtimeReading[];
  /** 匹配到实时数据的通道 */
  matchedChannels: DataChannel[];
}

/** 井网实时统计 */
export interface WellRealtimeStats {
  /** 总井数 */
  total: number;
  /** 有实时数据的井数 */
  withData: number;
  /** 正常井数 */
  normal: number;
  /** 预警井数 */
  warning: number;
  /** 超标井数 */
  critical: number;
  /** 数据过期井数 */
  stale: number;
  /** 实时数据覆盖率 */
  coverage: number;
}

// ============================================================
// 联动工具函数
// ============================================================

/**
 * 判断井的实时状态
 * @param reading — 井的实时读数
 * @param isStale — 是否过期
 */
export function computeWellStatus(reading: RealtimeReading | null, isStale: boolean): WellRealtimeStatus {
  if (isStale || !reading) return 'stale';

  const threshold = ALERT_THRESHOLDS[reading.channel];
  if (!threshold) return 'normal';

  const { warning, critical, direction } = threshold;

  if (direction === 'above') {
    if (reading.value >= critical) return 'critical';
    if (reading.value >= warning) return 'warning';
  } else {
    if (reading.value <= critical) return 'critical';
    if (reading.value <= warning) return 'warning';
  }

  return 'normal';
}

/**
 * 判断读数是否过期（超过新鲜度阈值）
 * @param reading — 读数
 * @param freshnessMs — 过期阈值（默认 60s）
 */
export function isReadingStale(reading: RealtimeReading | null, freshnessMs = 60000): boolean {
  if (!reading) return true;
  return Date.now() - reading.timestamp > freshnessMs;
}

/**
 * 将井与实时读数关联
 * @param wells — 井列表
 * @param readings — 全部实时读数
 * @param freshnessMs — 数据新鲜度阈值
 */
export function linkWellsToReadings(
  wells: Well[],
  readings: RealtimeReading[],
  freshnessMs = 60000,
): WellWithData[] {
  const now = Date.now();

  return wells.map(well => {
    // 该井的所有读数（按 stationId 匹配）
    const wellReadings = readings.filter(r => r.stationId === well.id);

    // 最新的一条读数（按时间戳排序取最新）
    const latestReading = wellReadings.length > 0
      ? wellReadings.reduce((a, b) => (a.timestamp > b.timestamp ? a : b))
      : null;

    const isStale = latestReading ? now - latestReading.timestamp > freshnessMs : true;

    // 匹配到的通道（去重）
    const matchedChannels = Array.from(new Set(wellReadings.map(r => r.channel)));

    return {
      ...well,
      indicators: [...well.indicators],
      realtime: {
        reading: latestReading,
        value: latestReading?.value ?? null,
        unit: latestReading?.unit ?? '',
        timestamp: latestReading?.timestamp ?? null,
        isStale,
        quality: latestReading?.quality ?? null,
        status: computeWellStatus(latestReading, isStale),
      },
      channelReadings: wellReadings,
      matchedChannels,
    };
  });
}

/**
 * 计算井网实时统计
 */
export function computeWellRealtimeStats(wellsWithData: WellWithData[]): WellRealtimeStats {
  const total = wellsWithData.length;
  const withData = wellsWithData.filter(w => w.realtime.reading !== null).length;
  const normal = wellsWithData.filter(w => w.realtime.status === 'normal').length;
  const warning = wellsWithData.filter(w => w.realtime.status === 'warning').length;
  const critical = wellsWithData.filter(w => w.realtime.status === 'critical').length;
  const stale = wellsWithData.filter(w => w.realtime.status === 'stale').length;

  return {
    total,
    withData,
    normal,
    warning,
    critical,
    stale,
    coverage: total > 0 ? Math.round((withData / total) * 100) : 0,
  };
}

/**
 * 筛选异常井（预警/超标/过期）
 */
export function filterAbnormalWells(
  wellsWithData: WellWithData[],
  statuses?: WellRealtimeStatus[],
): WellWithData[] {
  const targets = statuses ?? ['warning', 'critical', 'stale'];
  return wellsWithData.filter(w => targets.includes(w.realtime.status));
}

/**
 * 按通道分组统计井
 */
export function groupWellsByChannel(wellsWithData: WellWithData[]): Record<DataChannel, WellWithData[]> {
  const channels: DataChannel[] = ['waterLevel', 'waterQuality', 'subsidence', 'extraction'];
  const result = {} as Record<DataChannel, WellWithData[]>;

  for (const ch of channels) {
    result[ch] = wellsWithData.filter(w => w.matchedChannels.includes(ch));
  }

  return result;
}

// ============================================================
// 实时状态展示配置
// ============================================================

export const WELL_REALTIME_STATUS_CONFIG: Record<WellRealtimeStatus, {
  label: string;
  color: string;
  bg: string;
  border: string;
}> = {
  normal: { label: '正常', color: '#10b981', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  warning: { label: '预警', color: '#f59e0b', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  critical: { label: '超标', color: '#ef4444', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  stale: { label: '过期', color: '#9ca3af', bg: 'bg-gray-500/10', border: 'border-gray-500/30' },
};