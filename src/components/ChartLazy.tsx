import React, { useState, useEffect, useRef } from 'react';

/**
 * ChartLazy - 图表懒加载/视口触发渲染
 * 当图表容器进入视口时才渲染实际图表内容，
 * 未进入视口时显示骨架屏，减少首屏渲染负担
 * 
 * Usage:
 *   <ChartLazy height={300} placeholder="图表加载中...">
 *     <ResponsiveContainer width="100%" height={300}>
 *       <BarChart data={data}>...</BarChart>
 *     </ResponsiveContainer>
 *   </ChartLazy>
 */
export function ChartLazy({
  children,
  height = 300,
  threshold = 0.1,
  rootMargin = '100px',
  className = '',
}: {
  children: React.ReactNode;
  height?: number;
  threshold?: number;
  rootMargin?: string;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Check if IntersectionObserver is available
    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(el);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return (
    <div ref={containerRef} className={className} style={{ minHeight: height }}>
      {isVisible ? (
        children
      ) : (
        <div className="animate-pulse" style={{ height }}>
          <div className="flex items-center justify-between mb-4 px-2">
            {[0.3, 0.2, 0.25].map((w, i) => (
              <div key={i} className="h-2.5 bg-gw-border/30 rounded" style={{ width: `${w * 100}%` }} />
            ))}
          </div>
          <div className="flex items-end justify-around gap-2 px-4" style={{ height: `calc(100% - 40px)` }}>
            {Array.from({ length: 8 }).map((_, i) => {
              const h = 30 + Math.sin(i * 0.8) * 25 + Math.cos(i * 1.3) * 15;
              return (
                <div
                  key={i}
                  className="flex-1 bg-gw-border/20 rounded-t-sm"
                  style={{ height: `${h}%` }}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
