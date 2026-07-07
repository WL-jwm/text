/**
 * VirtualizedTable — 虚拟滚动表格组件
 *
 * 针对大数据量表格的渲染优化，仅渲染可视区域内的行。
 * 使用 IntersectionObserver 检测滚动位置，动态渲染可见行。
 *
 * 适用场景：500+ 行的大表格，如历史水文地质参数、泉域数据等
 *
 * 用法：
 *   <VirtualizedTable
 *     rows={data}
 *     rowHeight={32}
 *     visibleRows={15}
 *     renderRow={(item, index) => <tr>...</tr>}
 *     renderHeader={() => <thead>...</thead>}
 *   />
 */
import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';

interface VirtualizedTableProps<T> {
  /** 数据行 */
  rows: T[];
  /** 每行高度（px），默认 32 */
  rowHeight?: number;
  /** 可视区域行数，默认 15 */
  visibleRows?: number;
  /** 渲染表头 */
  renderHeader: () => React.ReactNode;
  /** 渲染单行 */
  renderRow: (item: T, index: number) => React.ReactNode;
  /** 额外类名 */
  className?: string;
  /** 容器最大高度 */
  maxHeight?: number;
  /** 行 key 提取函数 */
  rowKey?: (item: T, index: number) => string;
  /** 是否启用虚拟滚动（行数少时自动禁用） */
  enabled?: boolean;
  /** 最小启用行数，默认 50 */
  minRows?: number;
}

function VirtualizedTableInner<T>({
  rows,
  rowHeight = 32,
  visibleRows = 15,
  renderHeader,
  renderRow,
  className = '',
  maxHeight,
  rowKey,
  enabled: forceEnabled,
  minRows = 50,
}: VirtualizedTableProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(maxHeight || rowHeight * visibleRows);

  // 是否启用虚拟滚动
  const shouldVirtualize = forceEnabled ?? (rows.length >= minRows);

  // 监听滚动
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  // 监听容器高度变化
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 计算可见范围
  const { startIndex, endIndex, paddingTop, paddingBottom } = useMemo(() => {
    if (!shouldVirtualize) {
      return { startIndex: 0, endIndex: rows.length, paddingTop: 0, paddingBottom: 0 };
    }

    const buffer = 3; // 上下额外缓冲行数
    const start = Math.max(0, Math.floor(scrollTop / rowHeight) - buffer);
    const end = Math.min(rows.length, Math.ceil((scrollTop + containerHeight) / rowHeight) + buffer);
    const topPad = start * rowHeight;
    const bottomPad = (rows.length - end) * rowHeight;

    return { startIndex: start, endIndex: end, paddingTop: topPad, paddingBottom: bottomPad };
  }, [rows.length, scrollTop, containerHeight, rowHeight, shouldVirtualize]);

  // 可见行
  const visibleItems = useMemo(
    () => rows.slice(startIndex, endIndex),
    [rows, startIndex, endIndex]
  );

  if (!shouldVirtualize) {
    // 小数据量：直接渲染
    return (
      <div className={`overflow-x-auto overflow-y-auto ${className}`} style={{ maxHeight }}>
        <table className="w-full text-xs">
          {renderHeader()}
          <tbody>
            {rows.map((item, index) => (
              <React.Fragment key={rowKey?.(item, index) ?? index}>
                {renderRow(item, index)}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`overflow-x-auto overflow-y-auto scrollbar-thin ${className}`}
      style={{ maxHeight: maxHeight || rowHeight * visibleRows }}
      onScroll={handleScroll}
    >
      <table className="w-full text-xs">
        {renderHeader()}
        <tbody>
          {/* 顶部填充 */}
          {paddingTop > 0 && (
            <tr>
              <td style={{ height: paddingTop, border: 'none' }} />
            </tr>
          )}
          {/* 可见行 */}
          {visibleItems.map((item, index) => (
            <React.Fragment key={rowKey?.(item, startIndex + index) ?? startIndex + index}>
              {renderRow(item, startIndex + index)}
            </React.Fragment>
          ))}
          {/* 底部填充 */}
          {paddingBottom > 0 && (
            <tr>
              <td style={{ height: paddingBottom, border: 'none' }} />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/**
 * 带 React.memo 的虚拟滚动表格
 * 仅当 rows 引用变化时重新渲染
 */
export const VirtualizedTable = React.memo(VirtualizedTableInner) as typeof VirtualizedTableInner;

/**
 * useVirtualizedData — 大数据集分页渲染 Hook
 *
 * 适用于不需要滚动容器的场景（如图表数据），
 * 将大数据集分页，逐步渲染。
 *
 * 用法：
 *   const { page, setPage, pageData, hasMore } = useVirtualizedData(data, 50);
 */
export function useVirtualizedData<T>(data: T[], pageSize = 50) {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(data.length / pageSize);
  const pageData = useMemo(() => data.slice(0, page * pageSize), [data, page, pageSize]);
  const hasMore = page < totalPages;

  const loadMore = useCallback(() => {
    if (hasMore) setPage(p => p + 1);
  }, [hasMore]);

  const reset = useCallback(() => setPage(1), []);

  return { page, setPage, pageData, hasMore, loadMore, reset, totalPages, total: data.length };
}

/**
 * useDeferredRender — 延迟渲染 Hook
 *
 * 适用于首次渲染时避免同时渲染大量图表，
 * 将非首屏内容延迟到空闲时渲染。
 *
 * 用法：
 *   const shouldRender = useDeferredRender(200);
 *   {shouldRender && <ExpensiveChart />}
 */
export function useDeferredRender(delayMs = 100): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof requestIdleCallback === 'function') {
      const id = requestIdleCallback(() => setReady(true), { timeout: delayMs });
      return () => cancelIdleCallback(id);
    } else {
      const id = window.setTimeout(() => setReady(true), delayMs);
      return () => window.clearTimeout(id);
    }
  }, [delayMs]);

  return ready;
}
