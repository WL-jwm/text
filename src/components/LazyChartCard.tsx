import React from 'react';
import { TechCard } from './UI';
import { ChartLazy } from './ChartLazy';

/**
 * LazyChartCard - 带懒加载的TechCard
 * 当卡片进入视口时才渲染内容，未进入时显示骨架屏
 * 适用于图表密集页面的性能优化
 * 
 * Usage (drop-in replacement for TechCard when wrapping charts):
 *   <LazyChartCard title="标题" height={300}>
 *     <ResponsiveContainer ...>...</ResponsiveContainer>
 *   </LazyChartCard>
 * 
 * vs original:
 *   <TechCard title="标题">
 *     <ResponsiveContainer ...>...</ResponsiveContainer>
 *   </TechCard>
 */
export function LazyChartCard({
  title,
  children,
  height = 300,
  threshold = 0.05,
  badge,
  className,
  subtitle: _subtitle,
  icon,
}: {
  title: string;
  children: React.ReactNode;
  height?: number;
  threshold?: number;
  badge?: string;
  className?: string;
  subtitle?: string;
  icon?: React.ElementType;
}) {
  return (
    <TechCard title={title} badge={badge} className={className} icon={icon as any}>
      <ChartLazy height={height} threshold={threshold}>
        {children}
      </ChartLazy>
    </TechCard>
  );
}
