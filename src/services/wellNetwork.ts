/**
 * H-01 监测井网与空间分析 — 服务层
 *
 * 提供监测井的数据模型、CRUD 操作和空间分析能力：
 *   1. 井网数据模型（Well 接口 + 预置数据）
 *   2. 井网 CRUD（新增/查询/编辑/删除）
 *   3. 空间分析引擎：
 *      - 井间距计算（Haversine）
 *      - 最近邻分析
 *      - 缓冲区分析（指定半径内井）
 *      - 含水层分组统计
 *      - 空间分布统计（按城市/含水层）
 */

import type { DataChannel } from './realtimeDataService';

// ============================================================
// 类型定义
// ============================================================

/** 含水层类型 */
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

// ============================================================
// 常量
// ============================================================

export const AQUIFER_LABELS: Record<AquiferType, string> = {
  shallowPorous: '浅层孔隙水',
  deepPorous: '深层孔隙水',
  karst: '岩溶水',
  fracture: '裂隙水',
};

export const WELL_STATUS_LABELS: Record<WellStatus, string> = {
  active: '运行中',
  maintenance: '维护中',
  inactive: '停用',
};

// ============================================================
// 预置井网数据（基于现有实时站点补充空间属性）
// ============================================================

export const DEFAULT_WELLS: Well[] = [
  // ── 水位监测井 ──
  { id: 'WL-CZ-01', name: '沧州监测站', city: '沧州', latitude: 38.31, longitude: 116.84, aquiferType: 'deepPorous', depth: 220, indicators: ['waterLevel'], status: 'active', builtYear: 2012, district: '运河区' },
  { id: 'WL-HS-01', name: '衡水监测站', city: '衡水', latitude: 37.74, longitude: 115.67, aquiferType: 'deepPorous', depth: 260, indicators: ['waterLevel'], status: 'active', builtYear: 2010, district: '桃城区' },
  { id: 'WL-XT-01', name: '邢台监测站', city: '邢台', latitude: 37.07, longitude: 114.50, aquiferType: 'shallowPorous', depth: 120, indicators: ['waterLevel'], status: 'active', builtYear: 2013, district: '襄都区' },
  { id: 'WL-SJZ-01', name: '石家庄监测站', city: '石家庄', latitude: 38.04, longitude: 114.51, aquiferType: 'karst', depth: 180, indicators: ['waterLevel'], status: 'active', builtYear: 2009, district: '长安区' },
  { id: 'WL-BD-01', name: '保定监测站', city: '保定', latitude: 38.87, longitude: 115.46, aquiferType: 'fracture', depth: 150, indicators: ['waterLevel'], status: 'active', builtYear: 2011, district: '竞秀区' },
  { id: 'WL-LF-01', name: '廊坊监测站', city: '廊坊', latitude: 39.52, longitude: 116.70, aquiferType: 'shallowPorous', depth: 90, indicators: ['waterLevel'], status: 'active', builtYear: 2014, district: '广阳区' },

  // ── 水质监测井 ──
  { id: 'WQ-CZ-01', name: '沧州水质站', city: '沧州', latitude: 38.35, longitude: 116.89, aquiferType: 'deepPorous', depth: 200, indicators: ['waterQuality'], status: 'active', builtYear: 2013, district: '新华区' },
  { id: 'WQ-HS-01', name: '衡水水质站', city: '衡水', latitude: 37.70, longitude: 115.72, aquiferType: 'deepPorous', depth: 240, indicators: ['waterQuality'], status: 'active', builtYear: 2012, district: '冀州区' },
  { id: 'WQ-SJZ-01', name: '石家庄水质站', city: '石家庄', latitude: 38.08, longitude: 114.55, aquiferType: 'karst', depth: 170, indicators: ['waterQuality'], status: 'active', builtYear: 2010, district: '裕华区' },
  { id: 'WQ-BD-01', name: '保定水质站', city: '保定', latitude: 38.90, longitude: 115.50, aquiferType: 'fracture', depth: 140, indicators: ['waterQuality'], status: 'active', builtYear: 2012, district: '莲池区' },
  { id: 'WQ-QHD-01', name: '秦皇岛水质站', city: '秦皇岛', latitude: 39.94, longitude: 119.60, aquiferType: 'karst', depth: 160, indicators: ['waterQuality'], status: 'active', builtYear: 2011, district: '海港区' },

  // ── 沉降监测井 ──
  { id: 'SUB-CZ-01', name: '沧州沉降点', city: '沧州', latitude: 38.28, longitude: 116.80, aquiferType: 'shallowPorous', depth: 60, indicators: ['subsidence'], status: 'active', builtYear: 2015, district: '任丘市' },
  { id: 'SUB-HS-01', name: '衡水沉降点', city: '衡水', latitude: 37.78, longitude: 115.62, aquiferType: 'shallowPorous', depth: 55, indicators: ['subsidence'], status: 'active', builtYear: 2015, district: '景县' },
  { id: 'SUB-LF-01', name: '廊坊沉降点', city: '廊坊', latitude: 39.48, longitude: 116.65, aquiferType: 'shallowPorous', depth: 50, indicators: ['subsidence'], status: 'maintenance', builtYear: 2016, district: '安次区' },
  { id: 'SUB-HD-01', name: '邯郸沉降点', city: '邯郸', latitude: 36.62, longitude: 114.50, aquiferType: 'shallowPorous', depth: 65, indicators: ['subsidence'], status: 'active', builtYear: 2014, district: '丛台区' },

  // ── 开采量监测区 ──
  { id: 'EXT-SJZ-01', name: '石家庄开采区', city: '石家庄', latitude: 38.00, longitude: 114.45, aquiferType: 'deepPorous', depth: 250, indicators: ['extraction'], status: 'active', builtYear: 2008, district: '井陉县' },
  { id: 'EXT-BD-01', name: '保定开采区', city: '保定', latitude: 38.83, longitude: 115.40, aquiferType: 'fracture', depth: 160, indicators: ['extraction'], status: 'active', builtYear: 2010, district: '涿州市' },
  { id: 'EXT-HS-01', name: '衡水开采区', city: '衡水', latitude: 37.68, longitude: 115.60, aquiferType: 'deepPorous', depth: 230, indicators: ['extraction'], status: 'active', builtYear: 2009, district: '枣强县' },
  { id: 'EXT-CZ-01', name: '沧州开采区', city: '沧州', latitude: 38.26, longitude: 116.78, aquiferType: 'deepPorous', depth: 240, indicators: ['extraction'], status: 'active', builtYear: 2011, district: '沧县' },
  { id: 'EXT-HD-01', name: '邯郸开采区', city: '邯郸', latitude: 36.58, longitude: 114.45, aquiferType: 'shallowPorous', depth: 110, indicators: ['extraction'], status: 'active', builtYear: 2012, district: '磁县' },
];

// ============================================================
// 空间分析工具函数
// ============================================================

/**
 * 计算两井之间的球面距离（Haversine 公式，单位 km）
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // 地球半径（km）
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

// ============================================================
// 监测井网服务
// ============================================================

export class WellNetworkService {
  private wells: Well[];

  constructor(initialWells: Well[] = DEFAULT_WELLS) {
    this.wells = initialWells.map(w => ({ ...w, indicators: [...w.indicators] }));
  }

  // ============================================================
  // CRUD 操作
  // ============================================================

  /** 获取所有井 */
  getWells(): Well[] {
    return this.wells.map(w => ({ ...w, indicators: [...w.indicators] }));
  }

  /** 按 ID 查询井 */
  getWellById(id: string): Well | undefined {
    const well = this.wells.find(w => w.id === id);
    return well ? { ...well, indicators: [...well.indicators] } : undefined;
  }

  /** 新增井 */
  addWell(well: Omit<Well, 'id'>): Well {
    // 生成唯一 ID（基于名称 + 时间戳）
    const id = `${well.name.replace(/\s+/g, '-')}-${Date.now().toString(36)}`;
    const newWell: Well = {
      ...well,
      id,
      indicators: [...well.indicators],
    };
    this.wells.push(newWell);
    return { ...newWell, indicators: [...newWell.indicators] };
  }

  /** 更新井（部分字段） */
  updateWell(id: string, patch: Partial<Omit<Well, 'id'>>): Well | undefined {
    const index = this.wells.findIndex(w => w.id === id);
    if (index === -1) return undefined;

    const updated: Well = {
      ...this.wells[index]!,
      ...patch,
      indicators: patch.indicators ? [...patch.indicators] : [...this.wells[index]!.indicators],
    };
    this.wells[index] = updated;
    return { ...updated, indicators: [...updated.indicators] };
  }

  /** 删除井 */
  deleteWell(id: string): boolean {
    const index = this.wells.findIndex(w => w.id === id);
    if (index === -1) return false;
    this.wells.splice(index, 1);
    return true;
  }

  /** 批量替换井网 */
  setWells(wells: Well[]): void {
    this.wells = wells.map(w => ({ ...w, indicators: [...w.indicators] }));
  }

  /** 按条件筛选井 */
  filterWells(filter: {
    city?: string;
    aquiferType?: AquiferType;
    status?: WellStatus;
    indicator?: DataChannel;
    keyword?: string;
  }): Well[] {
    return this.wells.filter(w => {
      if (filter.city && w.city !== filter.city) return false;
      if (filter.aquiferType && w.aquiferType !== filter.aquiferType) return false;
      if (filter.status && w.status !== filter.status) return false;
      if (filter.indicator && !w.indicators.includes(filter.indicator)) return false;
      if (filter.keyword) {
        const kw = filter.keyword.toLowerCase();
        const match = w.name.toLowerCase().includes(kw) ||
          w.id.toLowerCase().includes(kw) ||
          (w.district ?? '').toLowerCase().includes(kw);
        if (!match) return false;
      }
      return true;
    });
  }

  // ============================================================
  // 空间分析
  // ============================================================

  /** 计算某井到其他所有井的距离 */
  getWellDistances(wellId: string): WellDistance[] {
    const well = this.wells.find(w => w.id === wellId);
    if (!well) return [];

    return this.wells
      .filter(w => w.id !== wellId)
      .map(w => ({
        wellId: w.id,
        wellName: w.name,
        distanceKm: Math.round(haversineDistance(well.latitude, well.longitude, w.latitude, w.longitude) * 100) / 100,
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }

  /** 计算每口井的最近邻 */
  getNearestNeighbors(): NearestNeighborResult[] {
    return this.wells.map(well => {
      let nearest: Well | null = null;
      let minDist = Infinity;

      for (const other of this.wells) {
        if (other.id === well.id) continue;
        const dist = haversineDistance(well.latitude, well.longitude, other.latitude, other.longitude);
        if (dist < minDist) {
          minDist = dist;
          nearest = other;
        }
      }

      return {
        wellId: well.id,
        wellName: well.name,
        city: well.city,
        nearestId: nearest?.id ?? '',
        nearestName: nearest?.name ?? '',
        nearestDistanceKm: Math.round(minDist * 100) / 100,
        aquiferType: well.aquiferType,
      };
    });
  }

  /** 缓冲区分析：查找以某井为中心、指定半径内的所有井 */
  getWellsWithinRadius(centerId: string, radiusKm: number): BufferResult {
    const center = this.wells.find(w => w.id === centerId);
    if (!center) {
      return { centerId, centerName: '', radiusKm, wellsWithin: [] };
    }

    const within = this.wells.filter(w => {
      if (w.id === centerId) return false;
      const dist = haversineDistance(center.latitude, center.longitude, w.latitude, w.longitude);
      return dist <= radiusKm;
    });

    return {
      centerId,
      centerName: center.name,
      radiusKm,
      wellsWithin: within.map(w => ({ ...w, indicators: [...w.indicators] })),
    };
  }

  /** 含水层分组统计 */
  getAquiferGroupStats(): AquiferGroupStats[] {
    const groups = new Map<AquiferType, { wells: Well[] }>();

    for (const well of this.wells) {
      const key = well.aquiferType;
      const group = groups.get(key);
      if (group) {
        group.wells.push(well);
      } else {
        groups.set(key, { wells: [well] });
      }
    }

    return (Object.keys(AQUIFER_LABELS) as AquiferType[])
      .filter(type => groups.has(type))
      .map(type => {
        const wells = groups.get(type)!.wells;
        const avgDepth = wells.reduce((s, w) => s + w.depth, 0) / wells.length;
        const activeCount = wells.filter(w => w.status === 'active').length;
        const cities = Array.from(new Set(wells.map(w => w.city)));
        return {
          aquiferType: type,
          count: wells.length,
          avgDepth: Math.round(avgDepth * 10) / 10,
          activeCount,
          cities,
        };
      });
  }

  /** 城市分组统计 */
  getCityGroupStats(): CityGroupStats[] {
    const groups = new Map<string, { wells: Well[] }>();

    for (const well of this.wells) {
      const key = well.city;
      const group = groups.get(key);
      if (group) {
        group.wells.push(well);
      } else {
        groups.set(key, { wells: [well] });
      }
    }

    return Array.from(groups.entries())
      .map(([city, { wells }]) => {
        const aquiferDistribution: Partial<Record<AquiferType, number>> = {};
        const indicatorDistribution: Partial<Record<DataChannel, number>> = {};

        for (const well of wells) {
          aquiferDistribution[well.aquiferType] = (aquiferDistribution[well.aquiferType] ?? 0) + 1;
          for (const ind of well.indicators) {
            indicatorDistribution[ind] = (indicatorDistribution[ind] ?? 0) + 1;
          }
        }

        return { city, count: wells.length, aquiferDistribution, indicatorDistribution };
      })
      .sort((a, b) => b.count - a.count);
  }

  /** 生成空间分析报告 */
  generateSpatialReport(): SpatialAnalysisReport {
    const totalWells = this.wells.length;
    const activeWells = this.wells.filter(w => w.status === 'active').length;
    const cities = Array.from(new Set(this.wells.map(w => w.city)));
    const aquiferGroups = this.getAquiferGroupStats();
    const cityGroups = this.getCityGroupStats();

    // 计算平均最近邻距离
    const neighbors = this.getNearestNeighbors();
    const avgNearestDistance = neighbors.length > 0
      ? Math.round((neighbors.reduce((s, n) => s + n.nearestDistanceKm, 0) / neighbors.length) * 100) / 100
      : 0;

    // 计算所有井对的最小/最大间距
    let minPair = Infinity;
    let maxPair = 0;
    for (let i = 0; i < this.wells.length; i++) {
      for (let j = i + 1; j < this.wells.length; j++) {
        const a = this.wells[i]!;
        const b = this.wells[j]!;
        const dist = haversineDistance(a.latitude, a.longitude, b.latitude, b.longitude);
        if (dist < minPair) minPair = dist;
        if (dist > maxPair) maxPair = dist;
      }
    }

    return {
      totalWells,
      activeWells,
      cities,
      aquiferGroups,
      cityGroups,
      avgNearestDistance,
      minPairDistance: Number.isFinite(minPair) ? Math.round(minPair * 100) / 100 : 0,
      maxPairDistance: Number.isFinite(maxPair) ? Math.round(maxPair * 100) / 100 : 0,
    };
  }

  /** 重置为默认井网 */
  reset(): void {
    this.wells = DEFAULT_WELLS.map(w => ({ ...w, indicators: [...w.indicators] }));
  }
}

// 单例导出
export const wellNetworkService = new WellNetworkService();