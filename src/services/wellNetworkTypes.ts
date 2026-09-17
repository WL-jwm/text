import type { DataChannel } from './realtimeDataService';

/**
 * 监测井网络服务 (G-13) — 类型定义
 * 拆分自 wellNetwork.ts：含水层/井状态/井体/空间分析结果类型
 */

export type AquiferType = 'shallowPorous' | 'deepPorous' | 'karst' | 'fracture';

/** 监测井状态 */
export type WellStatus = 'active' | 'maintenance' | 'inactive';

/** 监测井 */
export interface Well {
  id: string;
  name: string;
  city: string;
  /** 纬度（WGS84） */
  latitude: number;
  /** 经度（WGS84） */
  longitude: number;
  /** 含水层类型 */
  aquiferType: AquiferType;
  /** 井深（m） */
  depth: number;
  /** 监测指标（通道） */
  indicators: DataChannel[];
  /** 井状态 */
  status: WellStatus;
  /** 建立年份 */
  builtYear: number;
  /** 所属区县 */
  district?: string;
  /** 备注 */
  notes?: string;
}

/** 井间距结果 */
export interface WellDistance {
  wellId: string;
  wellName: string;
  /** 距离（km） */
  distanceKm: number;
}

/** 最近邻分析结果 */
export interface NearestNeighborResult {
  wellId: string;
  wellName: string;
  city: string;
  nearestId: string;
  nearestName: string;
  /** 最近邻距离（km） */
  nearestDistanceKm: number;
  /** 含水层类型 */
  aquiferType: AquiferType;
}

/** 缓冲区分析结果 */
export interface BufferResult {
  centerId: string;
  centerName: string;
  radiusKm: number;
  /** 缓冲区内井 */
  wellsWithin: Well[];
}

/** 含水层分组统计 */
export interface AquiferGroupStats {
  aquiferType: AquiferType;
  count: number;
  /** 平均井深（m） */
  avgDepth: number;
  /** 活跃井数 */
  activeCount: number;
  /** 覆盖城市 */
  cities: string[];
}

/** 城市分组统计 */
export interface CityGroupStats {
  city: string;
  count: number;
  /** 含水层分布 */
  aquiferDistribution: Partial<Record<AquiferType, number>>;
  /** 监测指标分布 */
  indicatorDistribution: Partial<Record<DataChannel, number>>;
}

/** 空间分析报告 */
export interface SpatialAnalysisReport {
  /** 井总数 */
  totalWells: number;
  /** 活跃井数 */
  activeWells: number;
  /** 覆盖城市 */
  cities: string[];
  /** 含水层分组 */
  aquiferGroups: AquiferGroupStats[];
  /** 城市分组 */
  cityGroups: CityGroupStats[];
  /** 平均最近邻距离（km） */
  avgNearestDistance: number;
  /** 最小井间距（km） */
  minPairDistance: number;
  /** 最大井间距（km） */
  maxPairDistance: number;
}
