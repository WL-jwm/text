/**
 * F-04 移动端深度适配 — 响应式可视化适配层
 *
 * 提供可视化面板的移动端适配能力，无需修改各组件内部代码：
 *   - ResponsiveVizPanel: 自动检测SVG并包裹MobileSVGContainer
 *   - MobileVizLayout: 响应式网格布局（移动端1列/桌面端2列）
 *   - useSVGElements: 批量检测页面内SVG元素的hook
 *   - VizPanelHeader: 带导出按钮的面板标题栏
 */

import { useState, useEffect, useRef, type ReactNode } from 'react';
import { MobileSVGContainer } from '../mobile/MobileSVGContainer';
import { useIsMobile, useContainerWidth } from '../../hooks/useMediaQuery';

// ============================================================
// ResponsiveVizPanel — 单面板响应式适配
// ============================================================

interface ResponsiveVizPanelProps {
  children: ReactNode;
  /** 默认SVG宽度（当无法自动检测时使用） */
  defaultSvgWidth?: number;
  /** 默认SVG高度 */
  defaultSvgHeight?: number;
  className?: string;
}

/**
 * 自动检测容器内的SVG元素，在移动端用MobileSVGContainer包裹
 *
 * 策略：
 * - 桌面端：直接渲染children，不影响原有布局
 * - 移动端：查找children中的svg元素，用MobileSVGContainer包裹
 */
export function ResponsiveVizPanel({
  children,
  defaultSvgWidth = 520,
  defaultSvgHeight = 400,
  className = '',
}: ResponsiveVizPanelProps) {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgDimensions, setSvgDimensions] = useState<{ w: number; h: number }>({
    w: defaultSvgWidth,
    h: defaultSvgHeight,
  });

  useEffect(() => {
    if (!isMobile || !containerRef.current) return;

    // 查找容器内的SVG元素
    const svg = containerRef.current.querySelector('svg');
    if (svg) {
      const w = svg.viewBox.baseVal.width || svg.getBoundingClientRect().width || defaultSvgWidth;
      const h = svg.viewBox.baseVal.height || svg.getBoundingClientRect().height || defaultSvgHeight;
      setSvgDimensions({ w, h });
    }
  }, [isMobile, defaultSvgWidth, defaultSvgHeight, children]);

  if (!isMobile) {
    return <div className={className}>{children}</div>;
  }

  // 移动端：用MobileSVGContainer包裹
  return (
    <div ref={containerRef} className={className}>
      {/* 为每个SVG面板提供触摸交互 */}
      <MobileSVGContainer
        svgWidth={svgDimensions.w}
        svgHeight={svgDimensions.h}
        minScale={0.5}
        maxScale={3}
      >
        <div style={{ width: svgDimensions.w }}>
          {children}
        </div>
      </MobileSVGContainer>
    </div>
  );
}

// ============================================================
// MobileVizLayout — 响应式网格布局
// ============================================================

interface MobileVizLayoutProps {
  children: ReactNode;
  /** 桌面端列数 */
  desktopCols?: 1 | 2 | 3;
  className?: string;
}

/**
 * 响应式网格：
 * - 移动端：1列纵向排列
 * - 平板：2列
 * - 桌面端：指定列数
 */
export function MobileVizLayout({
  children,
  desktopCols = 2,
  className = '',
}: MobileVizLayoutProps) {
  const gridClass = desktopCols === 1
    ? 'grid-cols-1'
    : desktopCols === 3
    ? 'md:grid-cols-2 lg:grid-cols-3'
    : 'md:grid-cols-2';

  return (
    <div className={`grid grid-cols-1 ${gridClass} gap-3 ${className}`}>
      {children}
    </div>
  );
}

// ============================================================
// VizPanelHeader — 面板标题栏（带导出按钮）
// ============================================================

interface VizPanelHeaderProps {
  title: string;
  icon?: ReactNode;
  description?: string;
  /** 导出按钮区域 */
  exportSlot?: ReactNode;
}

export function VizPanelHeader({
  title,
  icon,
  description,
  exportSlot,
}: VizPanelHeaderProps) {
  const isMobile = useIsMobile();

  return (
    <div className="flex items-center justify-between gap-2 flex-wrap">
      <div className="flex items-center gap-2 min-w-0">
        {icon && <span className="text-gw-cyan flex-shrink-0">{icon}</span>}
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-gw-text truncate">{title}</h3>
          {description && !isMobile && (
            <p className="text-[10px] text-gw-muted truncate">{description}</p>
          )}
        </div>
      </div>
      {exportSlot && <div className="flex-shrink-0">{exportSlot}</div>}
    </div>
  );
}

// ============================================================
// useResponsiveGrid — 响应式网格列数hook
// ============================================================

export function useResponsiveGrid(): {
  containerRef: React.RefObject<HTMLDivElement | null>;
  cols: number;
  isMobile: boolean;
} {
  const [ref, width] = useContainerWidth<HTMLDivElement>();
  const isMobile = useIsMobile();
  void width;

  let cols = 1;
  if (!isMobile) {
    if (width >= 1024) cols = 3;
    else if (width >= 640) cols = 2;
    else cols = 1;
  }

  return { containerRef: ref, cols, isMobile };
}

// ============================================================
// SVGAutoScale — 自动缩放SVG以适应容器宽度
// ============================================================

interface SVGAutoScaleProps {
  children: ReactNode;
  /** SVG原始宽度 */
  svgWidth: number;
  /** SVG原始高度 */
  svgHeight: number;
  className?: string;
}

/**
 * 根据容器宽度自动缩放SVG（保持宽高比）
 * 用于桌面端面板内的SVG响应式适配
 */
export function SVGAutoScale({
  children,
  svgWidth,
  svgHeight,
  className = '',
}: SVGAutoScaleProps) {
  const [ref, containerWidth] = useContainerWidth<HTMLDivElement>();
  const isMobile = useIsMobile();
  const containerWidthVal = containerWidth;

  // 计算缩放比例
  const scale = containerWidthVal > 0 && containerWidthVal < svgWidth
    ? containerWidth / svgWidth
    : 1;

  if (isMobile) {
    // 移动端使用MobileSVGContainer
    return (
      <div ref={ref as React.RefObject<HTMLDivElement>} className={className}>
        <MobileSVGContainer svgWidth={svgWidth} svgHeight={svgHeight}>
          {children}
        </MobileSVGContainer>
      </div>
    );
  }

  // 桌面端：如果容器够宽，直接渲染；否则缩放
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={`overflow-x-auto ${className}`}>
      <div
        style={{
          width: svgWidth * scale,
          height: svgHeight * scale,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: svgWidth,
            height: svgHeight,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
