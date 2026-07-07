import React, { useState, useCallback } from 'react';

/**
 * useHighlightState - 图表联动高亮状态管理
 * 多个图表共享高亮状态，点击某图表数据点时其他图表对应数据高亮
 */
export function useHighlightState<T extends string = string>() {
  const [highlighted, setHighlighted] = useState<T | null>(null);

  const highlight = useCallback((key: T | null) => {
    setHighlighted(prev => prev === key ? null : key);
  }, []);

  const clear = useCallback(() => setHighlighted(null), []);

  return { highlighted, highlight, clear };
}

/**
 * HighlightableCell - 可高亮的表格单元格
 * 当 highlightedKey 匹配时添加高亮样式
 */
export function HighlightableCell({
  value,
  highlightedKey,
  cellKey,
  className = '',
}: {
  value: React.ReactNode;
  highlightedKey: string | null;
  cellKey: string;
  className?: string;
}) {
  const isActive = highlightedKey && String(highlightedKey) === String(cellKey);
  return (
    <span className={`${className} transition-all duration-200 ${isActive ? 'bg-gw-blue/20 text-gw-highlight rounded px-1 font-medium' : ''}`}>
      {value}
    </span>
  );
}

/**
 * useActiveRow - 表格行点击高亮
 * 用于在 TechTable 上模拟行选择
 */
export function useActiveRow() {
  const [activeRowIndex, setActiveRowIndex] = useState<number | null>(null);

  const handleRowClick = useCallback((index: number) => {
    setActiveRowIndex(prev => prev === index ? null : index);
  }, []);

  const rowClassName = useCallback((index: number) => {
    return activeRowIndex === index
      ? 'bg-gw-blue/10 border-l-2 border-gw-blue/40'
      : 'hover:bg-gw-surface/30';
  }, [activeRowIndex]);

  return { activeRowIndex, handleRowClick, rowClassName, clear: () => setActiveRowIndex(null) };
}

/**
 * TabTransition - Tab切换过渡组件
 * 替代条件渲染，添加淡入动画
 */
export function TabTransition({ active, children }: { active: boolean; children: React.ReactNode }) {
  if (!active) return null;
  return (
    <div className="tab-enter">
      {children}
    </div>
  );
}
