/**
 * 监测井网络服务 (G-13) — 服务核心
 * 拆分自 wellNetwork.ts：WellNetworkService（井 CRUD 与空间分析）
 */

import { AQUIFER_LABELS, DEFAULT_WELLS } from './wellNetworkConstants';
import type { DataChannel } from './realtimeDataService';
import type {
  AquiferGroupStats,
  AquiferType,
  BufferResult,
  CityGroupStats,
  NearestNeighborResult,
  SpatialAnalysisReport,
  Well,
  WellDistance,
  WellStatus,
} from './wellNetworkTypes';
import { haversineDistance } from './wellNetworkUtils';
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

export const wellNetworkService = new WellNetworkService();
