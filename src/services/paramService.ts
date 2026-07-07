/**
 * 参数共享微服务 — 前端 API 封装层
 * 
 * 提供从微服务获取水文地质参数的接口，
 * 失败时自动降级到本地 TS 数据。
 */
import {
  aquiferGroups as localAquiferGroups,
  lithologyMu as localLithologyMu,
  infiltrationCoeff as localInfiltrationCoeff,
  permeability as localPermeability,
  dispersivity as localDispersivity,
} from '../data/hydroParams';

// ============================================================
// 配置
// ============================================================
const API_BASE = 'http://localhost:5200/api/v1';

// 服务状态
export type ServiceStatus = 'remote' | 'local' | 'loading' | 'error';

let status: ServiceStatus = 'loading';
let statusListeners: Array<(s: ServiceStatus) => void> = [];

export function getServiceStatus(): ServiceStatus {
  return status;
}

export function onStatusChange(listener: (s: ServiceStatus) => void) {
  statusListeners.push(listener);
  return () => {
    statusListeners = statusListeners.filter(l => l !== listener);
  };
}

function setStatus(s: ServiceStatus) {
  status = s;
  statusListeners.forEach(l => l(s));
}

// ============================================================
// 通用请求封装
// ============================================================

async function fetchAPI<T>(path: string, params?: Record<string, string>): Promise<T | null> {
  const url = new URL(`${API_BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v) url.searchParams.set(k, v);
    });
  }
  try {
    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ============================================================
// 参数查询接口
// ============================================================

export interface ParamItem {
  id: string;
  category: string;
  name: string;
  value: string;
  unit: string;
  lithology: string;
  aquifer_group: string;
  zone: string;
  region: string;
  source: string;
  reliability: string;
  reference: string;
  metadata: Record<string, unknown>;
}

export interface PaginatedResult {
  items: ParamItem[];
  total: number;
  page: number;
  size: number;
  total_pages: number;
}

export interface CategoryStat {
  category: string;
  count: number;
  regions: number;
  lithologies: number;
}

export interface ServiceStats {
  total: number;
  categories: number;
  regions: number;
  sources: number;
  by_category: Record<string, number>;
}

/**
 * 多条件查询参数
 */
export async function queryParams(opts: {
  category?: string;
  region?: string;
  lithology?: string;
  aquifer_group?: string;
  keyword?: string;
  page?: number;
  size?: number;
}): Promise<PaginatedResult | null> {
  const params: Record<string, string> = {};
  if (opts.category) params.category = opts.category;
  if (opts.region) params.region = opts.region;
  if (opts.lithology) params.lithology = opts.lithology;
  if (opts.aquifer_group) params.aquifer_group = opts.aquifer_group;
  if (opts.keyword) params.keyword = opts.keyword;
  if (opts.page) params.page = String(opts.page);
  if (opts.size) params.size = String(opts.size);
  return fetchAPI<PaginatedResult>('/params', params);
}

/**
 * 获取参数详情
 */
export async function getParamById(id: string): Promise<ParamItem | null> {
  return fetchAPI<ParamItem>(`/params/${id}`);
}

/**
 * 获取类别列表
 */
export async function getCategories(): Promise<CategoryStat[] | null> {
  return fetchAPI<CategoryStat[]>('/categories');
}

/**
 * 获取地区列表
 */
export async function getRegions(): Promise<string[] | null> {
  return fetchAPI<string[]>('/regions');
}

/**
 * 获取统计信息
 */
export async function getStats(): Promise<ServiceStats | null> {
  return fetchAPI<ServiceStats>('/stats');
}

// ============================================================
// 健康检查 & 自动降级
// ============================================================

let healthChecked = false;

/**
 * 检查微服务是否可用，自动切换状态
 */
export async function checkServiceHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE.replace('/api/v1', '')}/health`, {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      setStatus('remote');
      healthChecked = true;
      return true;
    }
  } catch {
    // 服务不可用
  }
  setStatus('local');
  healthChecked = true;
  return false;
}

// ============================================================
// 本地数据降级接口
// ============================================================

/**
 * 获取渗透系数数据（优先远程，失败降级到本地）
 */
export async function getPermeabilityData() {
  if (!healthChecked) await checkServiceHealth();
  
  if (status === 'remote') {
    const result = await queryParams({ category: 'K', size: 50 });
    if (result && result.items.length > 0) {
      return {
        data: result.items.map(item => ({
          lithology: item.name.replace(' 渗透系数', ''),
          Kh: item.value,
          Kv: item.metadata?.Kv || '',
          ratio: item.metadata?.KhKvRatio || '',
          source: item.source,
        })),
        source: 'remote' as const,
      };
    }
  }
  
  return {
    data: localPermeability,
    source: 'local' as const,
  };
}

/**
 * 获取给水度数据
 */
export async function getLithologyMuData() {
  if (!healthChecked) await checkServiceHealth();
  
  if (status === 'remote') {
    const result = await queryParams({ category: 'mu', size: 50 });
    if (result && result.items.length > 0) {
      return {
        data: result.items.map(item => ({
          lithology: item.name.replace(' 给水度', ''),
          mu: item.value,
          category: item.metadata?.category || '',
          K: item.metadata?.K || '',
          ne: item.metadata?.ne || '',
          source: item.source,
        })),
        source: 'remote' as const,
      };
    }
  }
  
  return {
    data: localLithologyMu,
    source: 'local' as const,
  };
}

/**
 * 获取含水层组数据
 */
export async function getAquiferGroupsData() {
  if (!healthChecked) await checkServiceHealth();
  
  if (status === 'remote') {
    const result = await queryParams({ category: 'aquifer_group', size: 50 });
    if (result && result.items.length > 0) {
      return {
        data: result.items.map(item => ({
          group: item.name,
          era: item.metadata?.era || '',
          property: item.metadata?.property || '',
          depth: item.metadata?.depth || '',
          lithology: item.lithology,
          K: item.metadata?.K || '',
          T: item.metadata?.T || '',
          mu: item.metadata?.mu || '',
          salinity: item.metadata?.salinity || '',
          note: item.reference,
        })),
        source: 'remote' as const,
      };
    }
  }
  
  return {
    data: localAquiferGroups,
    source: 'local' as const,
  };
}

/**
 * 获取降水入渗系数
 */
export async function getInfiltrationData() {
  if (!healthChecked) await checkServiceHealth();
  
  if (status === 'remote') {
    const result = await queryParams({ category: 'infiltration', size: 50 });
    if (result && result.items.length > 0) {
      return {
        data: result.items.map(item => ({
          lithology: item.name.replace(' 降水入渗系数', ''),
          plain: item.value,
          basin: item.metadata?.basin || '',
          mountain: item.metadata?.mountain || '',
          optDepth: item.metadata?.optDepth || '',
          note: item.reference,
        })),
        source: 'remote' as const,
      };
    }
  }
  
  return {
    data: localInfiltrationCoeff,
    source: 'local' as const,
  };
}

/**
 * 获取弥散度数据
 */
export async function getDispersivityData() {
  if (!healthChecked) await checkServiceHealth();
  
  if (status === 'remote') {
    const result = await queryParams({ category: 'dispersivity', size: 50 });
    if (result && result.items.length > 0) {
      return {
        data: result.items.map(item => ({
          medium: item.name.replace(' 弥散度', ''),
          aL: item.metadata?.aL || '',
          aT: item.metadata?.aT || '',
          note: item.reference,
        })),
        source: 'remote' as const,
      };
    }
  }
  
  return {
    data: localDispersivity,
    source: 'local' as const,
  };
}
