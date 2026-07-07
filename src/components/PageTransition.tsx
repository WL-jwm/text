import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

/**
 * PageTransition - 路由切换过渡动画 (framer-motion)
 * 路由切换时淡入+微上滑，120ms退出 + 300ms进入
 */
const pageVariants: Record<string, any> = {
  initial: { opacity: 0, y: 8 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, transition: { duration: 0.12, ease: 'easeOut' } },
};

export function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * ChartSkeleton - 图表加载骨架屏
 * 匹配 ResponsiveContainer 的外观，在图表加载时显示脉冲动画
 */
export function ChartSkeleton({ height = 300, rows = 3 }: { height?: number; rows?: number }) {
  return (
    <div className="animate-pulse" style={{ height }}>
      {/* 模拟坐标轴 */}
      <div className="flex h-full gap-1">
        <div className="w-8 flex flex-col justify-between py-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-px bg-gw-border/30 w-full" />
          ))}
        </div>
        <div className="flex-1 flex flex-col gap-2 p-2">
          {/* 模拟图表区域 */}
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className="rounded bg-gw-border/10"
              style={{
                height: `${100 / rows - 4}%`,
                width: `${60 + Math.random() * 35}%`,
              }}
            />
          ))}
          {/* 模拟X轴 */}
          <div className="flex justify-between mt-auto">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-8 h-2 bg-gw-border/15 rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * TableSkeleton - 表格加载骨架屏
 */
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="animate-pulse space-y-2">
      {/* Header */}
      <div className="flex gap-3 pb-2 border-b border-gw-border/30">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-3 bg-gw-border/20 rounded w-20" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-3 py-1.5">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-2.5 bg-gw-border/10 rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * CardSkeleton - 卡片加载骨架屏
 */
export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="animate-pulse p-4 rounded-lg border border-gw-border/20 bg-gw-surface/30">
      <div className="h-4 bg-gw-border/15 rounded w-1/3 mb-3" />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-2.5 bg-gw-border/10 rounded mb-2"
          style={{ width: `${70 + Math.random() * 25}%` }}
        />
      ))}
    </div>
  );
}

/**
 * PageLoader - 页面级加载骨架屏
 * 作为 React.lazy 的 Suspense fallback 使用
 */
export function PageLoader() {
  return (
    <div className="p-3 md:p-6 max-w-[1440px] mx-auto space-y-4 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-6 bg-gw-border/30 rounded w-40" />
        <div className="h-4 bg-gw-border/20 rounded w-60" />
      </div>
      {/* Tabs skeleton */}
      <div className="flex gap-2">
        {[120, 100, 90, 80].map((w, i) => (
          <div key={i} className="h-8 bg-gw-border/20 rounded-lg" style={{ width: w }} />
        ))}
      </div>
      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-gw-card/60 border border-gw-border/30 rounded-xl p-4">
            <div className="h-3 bg-gw-border/30 rounded w-16 mb-3" />
            <div className="h-6 bg-gw-border/20 rounded w-20" />
          </div>
        ))}
      </div>
      {/* Chart skeleton */}
      <div className="bg-gw-card/60 border border-gw-border/30 rounded-xl p-4">
        <div className="h-3 bg-gw-border/30 rounded w-1/3 mb-4" />
        <div className="flex items-end justify-around gap-2" style={{ height: 200 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 bg-gw-border/20 rounded-t-sm"
              style={{ height: `${30 + Math.sin(i * 0.8) * 25 + Math.cos(i * 1.3) * 15}%` }}
            />
          ))}
        </div>
      </div>
      {/* Table skeleton */}
      <div className="bg-gw-card/60 border border-gw-border/30 rounded-xl p-4">
        <div className="h-3 bg-gw-border/30 rounded w-1/4 mb-3" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4 py-2">
            {[0.3, 0.2, 0.25, 0.15].map((w, j) => (
              <div key={j} className="h-3 bg-gw-border/15 rounded flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * RoutePreloader - 路由级预加载
 * 
 * 在侧栏导航链接进入视口时预加载对应页面组件，
 * 利用 IntersectionObserver 检测可见性，仅在空闲时触发。
 * 
 * 用法：
 *   <RoutePreloader path="/resources" loader={() => import('./pages/Resources')} />
 */
import { useEffect, useRef } from 'react';

interface PreloadEntry {
  path: string;
  loader: () => Promise<unknown>;
}

// 已预加载的路由缓存
const preloadedRoutes = new Set<string>();

/**
 * 预加载单个路由组件
 */
export function preloadRoute(path: string, loader: () => Promise<unknown>): void {
  if (preloadedRoutes.has(path)) return;
  preloadedRoutes.add(path);
  // 使用 requestIdleCallback 在空闲时加载
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(() => { loader(); }, { timeout: 2000 });
  } else {
    setTimeout(loader, 200);
  }
}

/**
 * RoutePreloader 组件 - 绑定到 DOM 元素，进入视口时预加载
 */
export function RoutePreloader({ path, loader }: PreloadEntry) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          preloadRoute(path, loader);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [path, loader]);

  return <div ref={ref} className="hidden" />;
}

/**
 * 批量预加载常用路由（应用启动时调用）
 */
export function preloadCommonRoutes(): void {
  const commonPaths = ['/resources', '/water-quality', '/environment', '/exploitation'];
  // 这些页面由 App.tsx 中的 PreloadManager 触发
  commonPaths.forEach(path => {
    // 实际 loader 由 App.tsx 提供
    window.dispatchEvent(new CustomEvent('preload-route', { detail: path }));
  });
}
