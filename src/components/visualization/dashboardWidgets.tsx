/**
 * 拆分自 ComprehensiveDashboard.tsx — 仪表盘共享 widget
 * 迷你趋势图 Sparkline、多维雷达图、进度条（纯 SVG widget）与指标类型。
 */

import { Droplets, TrendingUp, TrendingDown } from 'lucide-react';

// ── 类型 ──

export interface MetricCard {
  key: string;
  label: string;
  value: string;
  unit: string;
  trend: number;
  trendLabel: string;
  icon: typeof Droplets;
  color: string;
  sparkline: number[];
}

export interface CityMetric {
  city: string;
  waterLevel: number;
  waterQuality: number;
  riskScore: number;
  extraction: number;
}

// ── 辅助函数 ──

export function Sparkline({ data, color, width = 80, height = 24 }: { data: number[]; color: string; width?: number; height?: number }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((v - min) / range) * height,
  }));
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${path} L ${width} ${height} L 0 ${height} Z`;
  const trendUp = data[data.length - 1] >= data[0];
  return (
    <svg width={width} height={height} className="overflow-visible">
      <path d={areaPath} fill={color} fillOpacity="0.1" />
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" />
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="2" fill={color} />
      {trendUp ? (
        <TrendingUp size={10} className="text-emerald-400" x={width + 2} y={height / 2 - 5} />
      ) : (
        <TrendingDown size={10} className="text-red-400" x={width + 2} y={height / 2 - 5} />
      )}
    </svg>
  );
}

export function RadarChart({ data, size = 200 }: { data: { label: string; value: number; max: number }[]; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.38;
  const n = data.length;
  const angleStep = (2 * Math.PI) / n;

  const grid = [0.25, 0.5, 0.75, 1.0];

  const pointAt = (i: number, r: number) => ({
    x: cx + r * Math.cos(-Math.PI / 2 + i * angleStep),
    y: cy + r * Math.sin(-Math.PI / 2 + i * angleStep),
  });

  const dataPoints = data.map((d, i) => {
    const ratio = d.value / d.max;
    return pointAt(i, radius * Math.max(0.05, Math.min(1, ratio)));
  });

  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') + ' Z';

  return (
    <svg width={size} height={size}>
      {/* 网格 */}
      {grid.map((g, gi) => {
        const pts = data.map((_, i) => pointAt(i, radius * g));
        return (
          <polygon
            key={gi}
            points={pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}
            fill="none"
            stroke="#1e293b"
            strokeWidth="0.5"
          />
        );
      })}
      {/* 轴线 */}
      {data.map((_, i) => {
        const p = pointAt(i, radius);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#1e293b" strokeWidth="0.5" />;
      })}
      {/* 数据多边形 */}
      <path d={dataPath} fill="rgba(6,182,212,0.15)" stroke="#06b6d4" strokeWidth="1.5" />
      {/* 数据点 */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#06b6d4" stroke="#fff" strokeWidth="0.5" />
      ))}
      {/* 标签 */}
      {data.map((d, i) => {
        const p = pointAt(i, radius + 18);
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            fontSize="9"
            fill="#94a3b8"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}

export function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="h-1.5 rounded-full bg-gw-surface/60 overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}
