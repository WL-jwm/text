
import React, { useRef, useEffect, useState } from 'react';

/**
 * ContourMap - 等值线/等值面图 (Canvas 2D)
 * 
 * 基于监测点数据绘制地下水位/矿化度等值线
 * 使用反距离加权(IDW)插值 + Marching Squares算法
 * 
 * 数据来源: shallowCones2024 / deepCones2024 / salineTypes
 */

interface ContourPoint {
  name: string;
  value: number;
  x: number;  // 归一化坐标 0~1
  y: number;  // 归一化坐标 0~1
}

interface ContourMapProps {
  title: string;
  subtitle?: string;
  data: ContourPoint[];
  colorScale?: [number, string][];  // [value, color] 断点
  unit?: string;
  width?: number;
  height?: number;
  className?: string;
}

const DEFAULT_COLORS: [number, string][] = [
  [0, '#22c55e'],     // 良好
  [20, '#eab308'],    // 轻度
  [40, '#f97316'],    // 中度
  [60, '#ef4444'],    // 重度
  [80, '#7c2d12'],    // 严重
];

function interpolateColor(value: number, scale: [number, string][]): string {
  if (value <= scale[0][0]) return scale[0][1];
  if (value >= scale[scale.length - 1][0]) return scale[scale.length - 1][1];
  
  for (let i = 0; i < scale.length - 1; i++) {
    if (value >= scale[i][0] && value <= scale[i + 1][0]) {
      const t = (value - scale[i][0]) / (scale[i + 1][0] - scale[i][0]);
      return lerpColor(scale[i][1], scale[i + 1][1], t);
    }
  }
  return scale[0][1];
}

function lerpColor(c1: string, c2: string, t: number): string {
  const r1 = parseInt(c1.slice(1, 3), 16);
  const g1 = parseInt(c1.slice(3, 5), 16);
  const b1 = parseInt(c1.slice(5, 7), 16);
  const r2 = parseInt(c2.slice(1, 3), 16);
  const g2 = parseInt(c2.slice(3, 5), 16);
  const b2 = parseInt(c2.slice(5, 7), 16);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function ContourMap({
  title,
  subtitle,
  data,
  colorScale = DEFAULT_COLORS,
  unit = '',
  width = 400,
  height = 320,
  className = '',
}: ContourMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<ContourPoint | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const margin = { top: 20, right: 20, bottom: 30, left: 20 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;
  const gridRes = 30; // 插值网格分辨率

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length < 3) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // 清空
    ctx.clearRect(0, 0, width, height);

    // IDW插值生成网格
    const grid: number[][] = [];
    for (let gy = 0; gy < gridRes; gy++) {
      grid[gy] = [];
      for (let gx = 0; gx < gridRes; gx++) {
        const px = (gx + 0.5) / gridRes;
        const py = (gy + 0.5) / gridRes;
        
        // IDW插值
        let weightedSum = 0;
        let weightSum = 0;
        for (const pt of data) {
          const dx = px - pt.x;
          const dy = py - pt.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 0.001) {
            weightedSum = pt.value;
            weightSum = 1;
            break;
          }
          const w = 1 / (dist * dist);
          weightedSum += pt.value * w;
          weightSum += w;
        }
        grid[gy][gx] = weightSum > 0 ? weightedSum / weightSum : 0;
      }
    }

    // 绘制等值面
    const cellW = plotW / gridRes;
    const cellH = plotH / gridRes;
    for (let gy = 0; gy < gridRes; gy++) {
      for (let gx = 0; gx < gridRes; gx++) {
        const val = grid[gy][gx];
        const color = interpolateColor(val, colorScale);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.4;
        ctx.fillRect(
          margin.left + gx * cellW,
          margin.top + gy * cellH,
          cellW + 0.5,
          cellH + 0.5
        );
      }
    }
    ctx.globalAlpha = 1;

    // 绘制等值线
    const contourLevels = [10, 20, 30, 40, 50, 60, 70];
    for (const level of contourLevels) {
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([3, 3]);
      
      // Marching Squares简化版
      for (let gy = 0; gy < gridRes - 1; gy++) {
        for (let gx = 0; gx < gridRes - 1; gx++) {
          const v00 = grid[gy][gx];
          const v10 = grid[gy][gx + 1];
          const v01 = grid[gy + 1][gx];
          const v11 = grid[gy + 1][gx + 1];
          
          const x0 = margin.left + gx * cellW;
          const y0 = margin.top + gy * cellH;
          const x1 = x0 + cellW;
          const y1 = y0 + cellH;
          
          // 线性插值找等值点
          const edges: { x: number; y: number }[] = [];
          
          if ((v00 - level) * (v10 - level) < 0) {
            const t = (level - v00) / (v10 - v00);
            edges.push({ x: x0 + t * cellW, y: y0 });
          }
          if ((v10 - level) * (v11 - level) < 0) {
            const t = (level - v10) / (v11 - v10);
            edges.push({ x: x1, y: y0 + t * cellH });
          }
          if ((v11 - level) * (v01 - level) < 0) {
            const t = (level - v01) / (v11 - v01);
            edges.push({ x: x0 + t * cellW, y: y1 });
          }
          if ((v01 - level) * (v00 - level) < 0) {
            const t = (level - v00) / (v01 - v00);
            edges.push({ x: x0, y: y0 + t * cellH });
          }
          
          if (edges.length === 2) {
            ctx.beginPath();
            ctx.moveTo(edges[0].x, edges[0].y);
            ctx.lineTo(edges[1].x, edges[1].y);
            ctx.stroke();
          }
        }
      }
    }
    ctx.setLineDash([]);

    // 绘制数据点
    for (const pt of data) {
      const px = margin.left + pt.x * plotW;
      const py = margin.top + pt.y * plotH;
      
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // 标注
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(pt.name, px, py - 8);
    }

    // 边框
    ctx.strokeStyle = 'rgba(100,116,139,0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(margin.left, margin.top, plotW, plotH);

  }, [data, width, height, colorScale]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left - margin.left) / plotW;
    const my = (e.clientY - rect.top - margin.top) / plotH;
    
    // 找最近的数据点
    let nearest: ContourPoint | null = null;
    let minDist = Infinity;
    for (const pt of data) {
      const dx = mx - pt.x;
      const dy = my - pt.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist && dist < 0.15) {
        minDist = dist;
        nearest = pt;
      }
    }
    setHoveredPoint(nearest);
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-[11px] font-medium text-gw-text">{title}</p>
          {subtitle && <p className="text-[9px] text-gw-muted">{subtitle}</p>}
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          style={{ width, height }}
          className="rounded-lg cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredPoint(null)}
        />

        {/* Tooltip */}
        {hoveredPoint && (
          <div className="absolute pointer-events-none bg-gw-card/95 border border-gw-border/40 rounded-lg p-2 shadow-lg text-[10px] z-10"
            style={{ left: mousePos.x + 12, top: mousePos.y - 20 }}>
            <p className="font-medium text-gw-text">{hoveredPoint.name}</p>
            <p className="text-gw-cyan font-mono">{hoveredPoint.value}{unit}</p>
          </div>
        )}
      </div>

      {/* 色标 */}
      <div className="flex items-center gap-1 mt-2">
        {colorScale.map(([val, color], i) => (
          <div key={i} className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: color, opacity: 0.6 }} />
            <span className="text-[8px] text-gw-muted font-mono">{val}{unit}</span>
            {i < colorScale.length - 1 && <span className="text-gw-muted/30">-</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
