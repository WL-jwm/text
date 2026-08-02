/**
 * MobilePullRefresh — 移动端下拉刷新组件
 *
 * 在移动端提供原生风格的下拉刷新交互：
 *   - 下拉超过阈值触发onRefresh
 *   - 旋转加载动画
 *   - 释放回弹动画
 */

import { useState, useRef, type ReactNode } from 'react';
import { RefreshCw, ArrowDown } from 'lucide-react';

interface MobilePullRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void> | void;
  threshold?: number;
}

export function MobilePullRefresh({ children, onRefresh, threshold = 60 }: MobilePullRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (refreshing) return;
    if (window.scrollY <= 0) {
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!pulling.current || refreshing) return;
    const diff = e.touches[0].clientY - startY.current;
    if (diff > 0) {
      e.preventDefault();
      // 阻尼效果
      const dampened = Math.min(diff * 0.4, threshold * 1.5);
      setPullDistance(dampened);
    }
  };

  const handleTouchEnd = async () => {
    if (!pulling.current) return;
    pulling.current = false;

    if (pullDistance >= threshold) {
      setRefreshing(true);
      setPullDistance(threshold * 0.6);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  const progress = Math.min(1, pullDistance / threshold);
  const isReady = pullDistance >= threshold;

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative md:static"
    >
      {/* 下拉指示器 */}
      {(pullDistance > 0 || refreshing) && (
        <div
          className="absolute left-0 right-0 flex items-center justify-center overflow-hidden md:hidden"
          style={{ height: `${pullDistance}px`, top: `-${pullDistance}px` }}
        >
          <div
            className="flex items-center gap-2 text-gw-muted transition-all"
            style={{ transform: `translateY(${pullDistance}px)` }}
          >
            {refreshing ? (
              <RefreshCw size={16} className="animate-spin text-gw-blue" />
            ) : (
              <ArrowDown
                size={16}
                className={`transition-transform ${isReady ? 'rotate-180' : ''}`}
                style={{ opacity: progress }}
              />
            )}
            <span className="text-[10px]">
              {refreshing ? '刷新中...' : isReady ? '释放刷新' : '下拉刷新'}
            </span>
          </div>
        </div>
      )}

      {/* 内容区 */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: pulling.current ? 'none' : 'transform 0.2s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
}
