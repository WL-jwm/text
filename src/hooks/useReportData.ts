/**
 * useReportData — 报告数据预采集 Hook
 * 
 * 页面挂载时自动采集报告所需数据并缓存，
 * 导出时直接从缓存读取，无需等待。
 * 
 * 用法：
 *   const { getData, collect, isLoading } = useReportData({
 *     pageName: 'water-quality',
 *     collector: async () => ({ evaluation, pollution, ... }),
 *     deps: [selectedYear],
 *   });
 *   
 *   // 导出时
 *   const data = getData();
 *   if (data) generateReport(data);
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { useReportCacheStore, buildCacheKey, simpleHash } from '../stores/reportCacheStore';

interface ReportDataOptions {
  /** 页面名称，用于缓存 key */
  pageName: string;
  /** 数据采集函数，返回 { sectionName: data } 格式 */
  collector: () => Promise<Record<string, unknown>>;
  /** 依赖项变化时重新采集 */
  deps?: unknown[];
  /** 缓存有效期（毫秒），默认 5 分钟 */
  maxAge?: number;
  /** 是否在挂载时自动采集，默认 true */
  autoCollect?: boolean;
}

interface ReportDataResult {
  /** 获取缓存数据（导出时调用，0 等待） */
  getData: <T = Record<string, unknown>>() => T | null;
  /** 手动触发采集 */
  collect: () => Promise<void>;
  /** 是否正在采集 */
  isLoading: boolean;
  /** 是否已采集完成 */
  isReady: boolean;
  /** 缓存是否有效 */
  isValid: boolean;
}

export function useReportData(options: ReportDataOptions): ReportDataResult {
  const {
    pageName,
    collector,
    deps = [],
    maxAge,
    autoCollect = true,
  } = options;

  const {getCache, setCache} = useReportCacheStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [, setIsValid] = useState(true);
  const mountedRef = useRef(true);
  const collectingRef = useRef(false);

  const cacheKey = buildCacheKey(pageName);

  // 检查缓存是否有效
  const checkCache = useCallback(() => {
    const cached = getCache(cacheKey, maxAge);
    return cached !== null;
  }, [cacheKey, getCache, maxAge]);

  // 采集数据
  const collect = useCallback(async () => {
    if (collectingRef.current) return; // 防止重复采集
    collectingRef.current = true;
    setIsLoading(true);

    try {
      const data = await collector();
      if (!mountedRef.current) return;

      const hash = simpleHash(JSON.stringify(data));
      setCache(cacheKey, data, hash);
      setIsReady(true);
      setIsValid(true);
    } catch (err) {
      console.error(`[useReportData] ${pageName} 数据采集失败:`, err);
    } finally {
      if (mountedRef.current) setIsLoading(false);
      collectingRef.current = false;
    }
  }, [cacheKey, collector, pageName, setCache]);

  // 获取缓存数据
  const getData = useCallback(<T = Record<string, unknown>>(): T | null => {
    return getCache<T>(cacheKey, maxAge);
  }, [cacheKey, getCache, maxAge]);

  // 挂载时自动采集
  useEffect(() => {
    mountedRef.current = true;

    if (autoCollect) {
      const cached = getCache(cacheKey, maxAge);
      if (cached) {
        // 缓存有效，直接标记就绪
        setIsReady(true);
        setIsValid(true);
      } else {
        // 无缓存，开始采集
        collect();
      }
    }

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // deps 变化时重新采集
  useEffect(() => {
    if (!autoCollect) return;

    // 首次挂载时已采集，跳过
    const isFirstMount = !isReady;
    if (isFirstMount) return;

    collect();
  }, deps);

  return {
    getData,
    collect,
    isLoading,
    isReady,
    isValid: checkCache(),
  };
}
