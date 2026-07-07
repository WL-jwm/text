// ── 图表增强组件：参考线、标注点、趋势箭头 ──
import React from 'react';
import { ReferenceLine, ReferenceDot } from 'recharts';

/** 参考线配置 */
export interface RefLineConfig {
  y?: number;
  x?: string | number;
  stroke?: string;
  strokeDasharray?: string;
  label?: string;
  position?: 'top' | 'middle' | 'bottom';
  fontSize?: number;
}

/** 参考点配置 */
export interface RefDotConfig {
  x?: string | number;
  y?: number;
  r?: number;
  fill?: string;
  stroke?: string;
  label?: string;
}

/** 图表参考线组合 — 一次添加多条ReferenceLine */
export function ChartRefLines({ lines }: { lines: RefLineConfig[] }) {
  return (
    <>
      {lines.map((l, i) => (
        <ReferenceLine
          key={i}
          y={l.y}
          x={l.x}
          stroke={l.stroke || '#ef4444'}
          strokeDasharray={l.strokeDasharray || '6 3'}
          label={
            l.label ? {
              value: l.label,
              position: (l.position || 'top') as 'top' | 'middle' | 'bottom',
              fill: l.stroke || '#ef4444',
              fontSize: l.fontSize || 11,
            } : undefined
          }
        />
      ))}
    </>
  );
}

/** 图表参考点 — 高亮数据点 */
export function ChartRefDots({ dots }: { dots: RefDotConfig[] }) {
  return (
    <>
      {dots.map((d, i) => (
        <ReferenceDot
          key={i}
          x={d.x}
          y={d.y}
          r={d.r || 5}
          fill={d.fill || '#f59e0b'}
          stroke={d.stroke || '#fff'}
          strokeWidth={2}
          label={
            d.label
              ? { value: d.label, position: 'top', fill: '#f59e0b', fontSize: 11, offset: 8 }
              : undefined
          }
        />
      ))}
    </>
  );
}

/** 趋势徽章 — 用于StatCard或数据标注 */
export function TrendBadge({ value, suffix = '' }: { value: number; suffix?: string }) {
  const isUp = value > 0;
  const isNeutral = value === 0;
  if (isNeutral) return <span className="text-gw-muted text-xs">—</span>;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
      <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
        <path d={isUp ? 'M2 8L6 4L10 8' : 'M2 4L6 8L10 4'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {Math.abs(value).toFixed(1)}{suffix}
    </span>
  );
}

/** 迷你趋势线 — SVG sparkline */
export function SparkLine({ data, width = 80, height = 24, color = '#06b6d4', showDots = false }: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showDots?: boolean;
}) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });
  const pathD = `M${pts.join(' L')}`;
  // Area fill
  const areaD = `${pathD} L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height} className="inline-block">
      <defs>
        <linearGradient id={`spark-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#spark-${color.replace('#','')})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {showDots && data.map((v, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((v - min) / range) * (height - 4) - 2;
        return <circle key={i} cx={x} cy={y} r={2} fill={color} />;
      })}
    </svg>
  );
}
