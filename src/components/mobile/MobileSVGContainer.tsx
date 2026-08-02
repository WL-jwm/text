/**
 * MobileSVGContainer — 触摸优化SVG容器
 *
 * 为可视化组件中的SVG图表提供移动端适配：
 *   - 自动检测容器宽度并缩放SVG
 *   - 双指捏合缩放（pinch-to-zoom）
 *   - 单指拖拽平移
 *   - 双击重置
 *   - 桌面端正常显示无影响
 */

import { useState, useRef, useEffect, type ReactNode } from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useIsMobile } from '../../hooks/useMediaQuery';

interface MobileSVGContainerProps {
  children: ReactNode;
  /** SVG原始宽度 */
  svgWidth: number;
  /** SVG原始高度 */
  svgHeight: number;
  /** 最小缩放比例 */
  minScale?: number;
  /** 最大缩放比例 */
  maxScale?: number;
  className?: string;
}

export function MobileSVGContainer({
  children,
  svgWidth,
  svgHeight,
  minScale = 0.5,
  maxScale = 3,
  className = '',
}: MobileSVGContainerProps) {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [containerWidth, setContainerWidth] = useState(0);

  // 触摸手势状态
  const touchState = useRef<{
    mode: 'none' | 'pan' | 'pinch';
    startX: number;
    startY: number;
    startTranslateX: number;
    startTranslateY: number;
    startDist: number;
    startScale: number;
  }>({
    mode: 'none',
    startX: 0,
    startY: 0,
    startTranslateX: 0,
    startTranslateY: 0,
    startDist: 0,
    startScale: 1,
  });

  // 检测容器宽度
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // 移动端自动适配：如果SVG宽度大于容器，自动缩小到容器宽度
  useEffect(() => {
    if (isMobile && containerWidth > 0 && svgWidth > containerWidth) {
      const fitScale = containerWidth / svgWidth;
      setScale(Math.max(minScale, fitScale));
    } else {
      setScale(1);
    }
  }, [isMobile, containerWidth, svgWidth, minScale]);

  // 触摸事件处理
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    if (e.touches.length === 1) {
      touchState.current = {
        mode: 'pan',
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        startTranslateX: translate.x,
        startTranslateY: translate.y,
        startDist: 0,
        startScale: scale,
      };
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      touchState.current = {
        mode: 'pinch',
        startX: 0,
        startY: 0,
        startTranslateX: translate.x,
        startTranslateY: translate.y,
        startDist: dist,
        startScale: scale,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || touchState.current.mode === 'none') return;
    e.preventDefault();

    if (touchState.current.mode === 'pan' && e.touches.length === 1) {
      const dx = e.touches[0].clientX - touchState.current.startX;
      const dy = e.touches[0].clientY - touchState.current.startY;
      setTranslate({
        x: touchState.current.startTranslateX + dx,
        y: touchState.current.startTranslateY + dy,
      });
    } else if (touchState.current.mode === 'pinch' && e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (touchState.current.startDist > 0) {
        const newScale = Math.max(minScale, Math.min(maxScale, touchState.current.startScale * (dist / touchState.current.startDist)));
        setScale(newScale);
      }
    }
  };

  const handleTouchEnd = () => {
    touchState.current.mode = 'none';
  };

  // 双击重置
  const lastTap = useRef(0);
  const handleTouchTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      setScale(1);
      setTranslate({ x: 0, y: 0 });
    }
    lastTap.current = now;
  };

  const resetView = () => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleTouchTap}
    >
      <div
        style={{
          transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
          transformOrigin: 'center center',
          transition: touchState.current.mode === 'none' ? 'transform 0.2s ease-out' : 'none',
          width: svgWidth,
          height: svgHeight,
        }}
      >
        {children}
      </div>

      {/* 缩放控制按钮（仅移动端+缩放后显示） */}
      {isMobile && scale !== 1 && (
        <div className="absolute bottom-2 right-2 flex flex-col gap-1 z-10">
          <button
            onClick={(e) => { e.stopPropagation(); setScale(s => Math.min(maxScale, s + 0.2)); }}
            className="w-8 h-8 rounded-lg bg-gw-card/90 border border-gw-border/40 flex items-center justify-center text-gw-text"
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setScale(s => Math.max(minScale, s - 0.2)); }}
            className="w-8 h-8 rounded-lg bg-gw-card/90 border border-gw-border/40 flex items-center justify-center text-gw-text"
          >
            <ZoomOut size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); resetView(); }}
            className="w-8 h-8 rounded-lg bg-gw-card/90 border border-gw-border/40 flex items-center justify-center text-gw-text"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
