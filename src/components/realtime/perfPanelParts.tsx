/**
 * 拆分自 PerformancePanel.tsx — 性能面板子组件（迷你趋势图/环形进度条/通道延迟卡片）
 */

import { Clock } from 'lucide-react';
import type { DataChannel } from '../../services/realtimeDataService';
import { CHANNEL_LABELS, CHANNEL_COLORS, HEALTH_CONFIG } from './perfPanelConstants';

// ── 迷你趋势图 ──

export function MiniTrend({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null;

  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const w = 60;
  const h = 20;
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 2) - 1;
    return `${x},${y}`;
  });

  return (
    <svg width={w} height={h} className="flex-shrink-0">
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.7}
      />
    </svg>
  );
}

// ── 环形进度条 ──

export function RingProgress({
  score,
  size = 56,
  strokeWidth = 5,
  color,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const strokeColor = color ?? (
    score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'
  );

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gw-border/20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <span className="absolute text-xs font-bold font-mono" style={{ color: strokeColor }}>
        {score}
      </span>
    </div>
  );
}

// ── 通道延迟卡片 ──

export function ChannelLatencyCard({
  channel,
  report,
}: {
  channel: DataChannel;
  report: { healthScore: number; health: 'healthy' | 'degraded' | 'unhealthy'; recentLatencies: number[]; fetchLatency: { avgMs: number; p95Ms: number; maxMs: number } | null };
}) {
  const color = CHANNEL_COLORS[channel];
  const label = CHANNEL_LABELS[channel];
  const healthConfig = HEALTH_CONFIG[report.health];
  const avgLatency = report.fetchLatency?.avgMs ?? 0;
  const p95Latency = report.fetchLatency?.p95Ms ?? 0;
  const maxLatency = report.fetchLatency?.maxMs ?? 0;

  return (
    <div
      className={`px-2.5 py-2 rounded-lg border ${healthConfig.bg} ${healthConfig.border}`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-[10px] font-medium text-gw-text">{label}</span>
        </div>
        <span className="text-[9px] px-1.5 py-0.5 rounded font-mono" style={{ backgroundColor: `${healthConfig.color}20`, color: healthConfig.color }}>
          {healthConfig.label}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <Clock size={10} className="text-gw-muted/60" />
            <span className="text-[11px] font-mono font-medium" style={{ color: healthConfig.color }}>
              {avgLatency.toFixed(0)}ms
            </span>
            <span className="text-[8px] text-gw-muted/50">平均</span>
          </div>
          <div className="flex items-center gap-2 text-[8px] text-gw-muted/50">
            <span>P95: {p95Latency.toFixed(0)}ms</span>
            <span>峰值: {maxLatency.toFixed(0)}ms</span>
          </div>
        </div>
        <MiniTrend values={report.recentLatencies} color={healthConfig.color} />
      </div>
    </div>
  );
}
