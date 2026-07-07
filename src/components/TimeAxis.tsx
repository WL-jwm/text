
import React, { useState, useEffect, useRef } from 'react';

/**
 * TimeAxis - 动态时间轴 (Canvas 2D Animation)
 * 
 * 展示1990-2024年地下水资源/水位/超采面积时间轴动画
 * 支持播放/暂停/拖拽进度
 */

interface TimeFrame {
  year: number;
  label: string;
  data: Record<string, number>;
  note?: string;
}

interface TimeAxisProps {
  title: string;
  frames: TimeFrame[];
  metrics: { key: string; label: string; color: string }[];
  width?: number;
  height?: number;
  className?: string;
  unit?: string;
}

export function TimeAxis({
  title,
  frames,
  metrics,
  width = 600,
  height = 300,
  className = '',
  unit = '',
}: TimeAxisProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const margin = { top: 20, right: 20, bottom: 40, left: 50 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;

  // 计算数据范围
  const allValues = frames.flatMap(f => metrics.map(m => f.data[m.key] ?? 0));
  const maxVal = Math.max(...allValues) * 1.15 || 1;
  const minVal = Math.min(...allValues) * 0.85 || 0;

  // 播放逻辑
  useEffect(() => {
    if (!isPlaying) return;
    lastTimeRef.current = performance.now();

    const animate = (time: number) => {
      const dt = time - lastTimeRef.current;
      if (dt > 1000 / speed) {
        setCurrentIndex(prev => {
          const next = prev + 1;
          if (next >= frames.length) {
            setIsPlaying(false);
            return frames.length - 1;
          }
          return next;
        });
        lastTimeRef.current = time;
      }
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying, speed, frames.length]);

  // 绘制
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || frames.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const frame = frames[currentIndex];
    if (!frame) return;

    // 背景
    ctx.fillStyle = 'rgba(15,23,42,0.3)';
    if (ctx.roundRect) ctx.roundRect(margin.left, margin.top, plotW, plotH, 4);
    else ctx.rect(margin.left, margin.top, plotW, plotH);
    ctx.fill();

    // 网格线
    ctx.strokeStyle = 'rgba(100,116,139,0.1)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const y = margin.top + (plotH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + plotW, y);
      ctx.stroke();
    }

    // Y轴刻度
    ctx.fillStyle = 'rgba(148,163,184,0.6)';
    ctx.font = '9px monospace';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const val = minVal + (maxVal - minVal) * (1 - i / 4);
      const y = margin.top + (plotH / 4) * i;
      ctx.fillText(val.toFixed(1), margin.left - 5, y + 3);
    }

    // 绘制柱状图
    const barW = Math.min(plotW / metrics.length * 0.6, 40);
    const barGap = plotW / metrics.length;

    metrics.forEach((metric, i) => {
      const value = frame.data[metric.key] ?? 0;
      const barH = ((value - minVal) / (maxVal - minVal)) * plotH;
      const x = margin.left + barGap * i + (barGap - barW) / 2;
      const y = margin.top + plotH - barH;

      // 柱体
      const grad = ctx.createLinearGradient(x, y, x, margin.top + plotH);
      grad.addColorStop(0, metric.color);
      grad.addColorStop(1, metric.color + '40');
      ctx.fillStyle = grad;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, y, barW, barH, [2, 2, 0, 0]);
      else ctx.rect(x, y, barW, barH);
      ctx.fill();

      // 数值
      ctx.fillStyle = metric.color;
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${value}${unit}`, x + barW / 2, y - 5);

      // 标签
      ctx.fillStyle = 'rgba(148,163,184,0.8)';
      ctx.font = '9px sans-serif';
      ctx.fillText(metric.label, x + barW / 2, margin.top + plotH + 15);
    });

    // 年份标注
    ctx.fillStyle = '#06b6d4';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(String(frame.year), margin.left + plotW / 2, margin.top + plotH + 32);

    // 备注
    if (frame.note) {
      ctx.fillStyle = 'rgba(148,163,184,0.6)';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(frame.note, margin.left + plotW / 2, margin.top - 5);
    }

  }, [currentIndex, frames, metrics, width, height, minVal, maxVal, plotW, plotH, margin, unit]);

  const handlePrev = () => setCurrentIndex(prev => Math.max(0, prev - 1));
  const handleNext = () => setCurrentIndex(prev => Math.min(frames.length - 1, prev + 1));
  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentIndex(Number(e.target.value));
    setIsPlaying(false);
  };

  if (frames.length === 0) return null;

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-medium text-gw-text">{title}</p>
        <div className="flex items-center gap-1">
          <button onClick={() => setSpeed(s => Math.max(0.5, s - 0.5))}
            className="px-1.5 py-0.5 text-[9px] bg-gw-surface/50 rounded border border-gw-border/20 text-gw-muted hover:text-gw-text">
            慢
          </button>
          <span className="text-[9px] text-gw-muted font-mono w-6 text-center">{speed}x</span>
          <button onClick={() => setSpeed(s => Math.min(4, s + 0.5))}
            className="px-1.5 py-0.5 text-[9px] bg-gw-surface/50 rounded border border-gw-border/20 text-gw-muted hover:text-gw-text">
            快
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        style={{ width, height }}
        className="rounded-lg"
      />

      {/* 控制栏 */}
      <div className="flex items-center gap-2 mt-2">
        <button onClick={handlePrev}
          className="p-1 rounded bg-gw-surface/50 border border-gw-border/20 text-gw-muted hover:text-gw-text transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button onClick={() => setIsPlaying(!isPlaying)}
          className="p-1 rounded bg-gw-cyan/15 border border-gw-cyan/30 text-gw-cyan hover:bg-gw-cyan/25 transition-colors">
          {isPlaying ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </button>
        <button onClick={handleNext}
          className="p-1 rounded bg-gw-surface/50 border border-gw-border/20 text-gw-muted hover:text-gw-text transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* 进度条 */}
        <input
          type="range"
          min={0}
          max={frames.length - 1}
          value={currentIndex}
          onChange={handleSlider}
          className="flex-1 h-1 appearance-none bg-gw-border/30 rounded-full cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gw-cyan [&::-webkit-slider-thumb]:shadow-glow-cyan"
        />

        <span className="text-[9px] text-gw-muted font-mono whitespace-nowrap">
          {frames[currentIndex].year} / {frames[frames.length - 1].year}
        </span>
      </div>
    </div>
  );
}
