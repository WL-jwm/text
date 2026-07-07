import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * useChartInteraction - 图表联动筛选Hook
 * 当用户点击某图表数据点时，关联图表自动高亮对应数据
 * 
 * Usage:
 *   const { activeKey, setActiveKey, isActive, registerChart } = useChartInteraction();
 *   
 *   // 在图表A的点击回调中:
 *   <BarChart onClick={(data) => setActiveKey(data.name)}>
 *     <Bar fill={isActive('石家庄') ? '#22c55e' : '#3b82f6'} />
 *   </BarChart>
 *   
 *   // 在关联图表B中使用:
 *   <BarChart>
 *     <Bar fill={({ name }) => isActive(name) ? '#22c55e' : '#3b82f6'} />
 *   </BarChart>
 */
export function useChartInteraction<T = string>(defaultTimeout = 3000) {
  const [activeKey, setActiveKeyState] = useState<T | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chartIdsRef = useRef<Set<string>>(new Set());

  const setActiveKey = useCallback((key: T | null) => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setActiveKeyState(key);
    
    // Auto-clear after timeout
    if (key !== null) {
      timeoutRef.current = setTimeout(() => {
        setActiveKeyState(null);
        timeoutRef.current = null;
      }, defaultTimeout);
    }
  }, [defaultTimeout]);

  // Check if a key is currently active
  const isActive = useCallback((key: T) => activeKey === key, [activeKey]);

  // Register a chart for interaction tracking (for future extension)
  const registerChart = useCallback((id: string) => {
    chartIdsRef.current.add(id);
    return () => {
      chartIdsRef.current.delete(id);
    };
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    activeKey,
    setActiveKey,
    isActive,
    registerChart,
    /** Clear active selection manually */
    clearSelection: () => setActiveKey(null),
  };
}

/**
 * useTableHighlight - 表格行高亮联动
 * 与useChartInteraction配合，当图表选中某数据时，表格对应行高亮
 */
export function useTableHighlight<T = string>() {
  const { activeKey, isActive, clearSelection } = useChartInteraction<T>();

  /** 获取行的className */
  const getRowClassName = useCallback((key: T) => {
    const base = 'border-b border-gw-border/30 transition-colors data-row';
    return isActive(key)
      ? base + ' bg-gw-blue/15 border-l-2 border-l-gw-cyan'
      : base + ' hover:bg-gw-surface/30';
  }, [isActive]);

  return {
    activeKey,
    isActive,
    clearSelection,
    getRowClassName,
  };
}
