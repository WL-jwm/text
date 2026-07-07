/**
 * useMobile — 移动端检测 Hook
 *
 * 响应式断点：768px (md)
 * 用于条件渲染、触摸优化、侧栏行为控制
 */
import { useState, useEffect, useCallback } from 'react';

const MOBILE_BREAKPOINT = 768;

export function useMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < MOBILE_BREAKPOINT;
  });

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches);
    };
    handler(mql);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return isMobile;
}

/**
 * useReducedMotion — 检测用户是否偏好减少动画
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent | MediaQueryList) => setReduced(e.matches);
    handler(mql);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return reduced;
}

/**
 * useKeyboardNavigation — 键盘导航支持
 *
 * 为列表/网格元素添加方向键导航
 *
 * 用法：
 *   const { containerRef, focusedIndex } = useKeyboardNavigation(items.length);
 *   <div ref={containerRef}>
 *     {items.map((item, i) => (
 *       <div tabIndex={i === focusedIndex ? 0 : -1} ... />
 *     ))}
 *   </div>
 */
export function useKeyboardNavigation(itemCount: number) {
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        setFocusedIndex(prev => (prev + 1) % itemCount);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        setFocusedIndex(prev => (prev <= 0 ? itemCount - 1 : prev - 1));
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(itemCount - 1);
        break;
    }
  }, [itemCount]);

  const containerRef = useCallback((node: HTMLElement | null) => {
    if (!node) return;
    node.addEventListener('keydown', handleKeyDown as unknown as EventListener);
    return () => node.removeEventListener('keydown', handleKeyDown as unknown as EventListener);
  }, [handleKeyDown]);

  return { containerRef, focusedIndex, setFocusedIndex };
}
