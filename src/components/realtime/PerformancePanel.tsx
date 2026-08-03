/**
 * G-07 性能监控 — 性能面板
 *
 * 展示系统性能指标：
 *   1. 总体健康评分（环形进度条）
 *   2. 各通道延迟卡片（实时耗时 + 趋势）
 *   3. Worker 处理统计
 *   4. 缓存命中率
 *   5. 实时事件流
 */

import { useState, useMemo } from 'react';
import {
  Activity,
  Gauge,
  Zap,
  Database,
  Cpu,
  Clock,
  RefreshCw,
  ChevronDown,
  Filter,
} from 'lucide-react';
import { TechCard } from '../UI';
import { usePerfDashboard } from '../../hooks/usePerfMonitor';
import { perfMonitor, type MetricType } from '../../services/perfMonitor';
import type { DataChannel } from '../../services/realtimeDataService';

// ── 常量 ──

const CHANNEL_LABELS: Record<DataChannel, string> = {
  waterLevel: '水位埋深',
  waterQuality: '水质达标率',
  subsidence: '沉降速率',
  extraction: '开采量',
};

const CHANNEL_COLORS: Record<DataChannel, string> = {
  waterLevel: '#06b6d4',
  waterQuality: '#10b981',
  subsidence: '#ef4444',
  extraction: '#f59e0b',
};

const HEALTH_CONFIG = {
  healthy: { label: '健康', color: '#10b981', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  degraded: { label: '降级', color: '#f59e0b', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  unhealthy: { label: '异常', color: '#ef4444', bg: 'bg-red-500/10', border: 'border-red-500/30' },
} as const;

const METRIC_LABELS: Record<MetricType, string> = {
  dataFetch: '数据获取',
  workerProcess: 'Worker处理',
  renderCycle: '渲染周期',
  cacheHit: '缓存命中',
  evaluation: '质量评估',
};

// ── 迷你趋势图 ──

function MiniTrend({ values, color }: { values: number[]; color: string }) {
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

function RingProgress({
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

function ChannelLatencyCard({
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

// ── 主组件 ──

export function PerformancePanel() {
  const { dashboard, liveEntries } = usePerfDashboard(5000);
  const [showEvents, setShowEvents] = useState(false);
  const [eventFilter, setEventFilter] = useState<MetricType | 'all'>('all');

  // 过滤事件
  const filteredEntries = useMemo(() => {
    if (eventFilter === 'all') return liveEntries;
    return liveEntries.filter(e => e.type === eventFilter);
  }, [liveEntries, eventFilter]);

  if (!dashboard) {
    return (
      <TechCard title="性能监控" icon={Gauge} badge="等待数据">
        <div className="text-center text-[11px] text-gw-muted py-4">正在采集性能数据...</div>
      </TechCard>
    );
  }

  const { overallHealth, channels, workerStats, renderStats, cacheHitRate } = dashboard;

  return (
    <TechCard
      title="性能监控"
      icon={Gauge}
      badge={`${overallHealth >= 80 ? '健康' : overallHealth >= 50 ? '降级' : '异常'}`}
      glow={overallHealth < 50}
    >
      <div className="space-y-3">
        {/* 顶部：总体健康评分 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RingProgress score={overallHealth} size={52} strokeWidth={4} />
            <div>
              <div className="text-[11px] font-medium text-gw-text">系统健康度</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-gw-muted">{overallHealth}/100</span>
                {overallHealth >= 80 ? (
                  <span className="text-[9px] text-emerald-400">● 健康</span>
                ) : overallHealth >= 50 ? (
                  <span className="text-[9px] text-amber-400">● 降级</span>
                ) : (
                  <span className="text-[9px] text-red-400">● 异常</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 缓存命中率 */}
            <div className="text-center px-2 py-1 rounded bg-gw-surface/20 border border-gw-border/10">
              <div className="flex items-center gap-1 justify-center">
                <Database size={10} className="text-gw-muted/60" />
                <span className="text-[9px] text-gw-muted">缓存</span>
              </div>
              <span className="text-[11px] font-mono font-bold text-emerald-400">
                {(cacheHitRate * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* 通道延迟网格 */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Zap size={11} className="text-gw-muted/60" />
            <span className="text-[9px] font-medium text-gw-muted">通道延迟</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5">
            {(Object.keys(CHANNEL_LABELS) as DataChannel[]).map(ch => {
              const report = channels[ch];
              return (
                <ChannelLatencyCard
                  key={ch}
                  channel={ch}
                  report={report}
                />
              );
            })}
          </div>
        </div>

        {/* 系统统计 */}
        <div className="grid grid-cols-3 gap-1.5">
          <div className="text-center px-1.5 py-1.5 rounded bg-gw-surface/20 border border-gw-border/10">
            <div className="flex items-center gap-1 justify-center">
              <Cpu size={10} className="text-gw-muted/60" />
              <span className="text-[8px] text-gw-muted/70">Worker</span>
            </div>
            <span className="text-[11px] font-mono font-bold text-gw-cyan">
              {workerStats ? `${workerStats.count}次` : '-'}
            </span>
            {workerStats && (
              <div className="text-[8px] text-gw-muted/50">{workerStats.avgMs.toFixed(0)}ms</div>
            )}
          </div>
          <div className="text-center px-1.5 py-1.5 rounded bg-gw-surface/20 border border-gw-border/10">
            <div className="flex items-center gap-1 justify-center">
              <Activity size={10} className="text-gw-muted/60" />
              <span className="text-[8px] text-gw-muted/70">渲染</span>
            </div>
            <span className="text-[11px] font-mono font-bold text-gw-cyan">
              {renderStats ? `${renderStats.count}次` : '-'}
            </span>
            {renderStats && (
              <div className="text-[8px] text-gw-muted/50">{renderStats.avgMs.toFixed(0)}ms</div>
            )}
          </div>
          <div className="text-center px-1.5 py-1.5 rounded bg-gw-surface/20 border border-gw-border/10">
            <div className="flex items-center gap-1 justify-center">
              <Database size={10} className="text-gw-muted/60" />
              <span className="text-[8px] text-gw-muted/70">记录数</span>
            </div>
            <span className="text-[11px] font-mono font-bold text-gw-cyan">
              {liveEntries.length}
            </span>
            <div className="text-[8px] text-gw-muted/50">实时事件</div>
          </div>
        </div>

        {/* 实时事件流 */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <button
              onClick={() => setShowEvents(!showEvents)}
              className="flex items-center gap-1 text-[10px] text-gw-muted hover:text-gw-text transition-colors"
            >
              <Activity size={11} />
              <span>实时事件 ({liveEntries.length})</span>
              <ChevronDown
                size={9}
                className={`transition-transform ${showEvents ? 'rotate-0' : '-rotate-90'}`}
              />
            </button>

            {showEvents && liveEntries.length > 0 && (
              <div className="flex items-center gap-1">
                <Filter size={9} className="text-gw-muted" />
                <select
                  value={eventFilter}
                  onChange={e => setEventFilter(e.target.value as MetricType | 'all')}
                  className="text-[8px] bg-gw-surface/60 border border-gw-border/30 rounded px-1 py-0.5 text-gw-muted focus:outline-none focus:border-gw-cyan/50"
                >
                  <option value="all">全部</option>
                  {(Object.keys(METRIC_LABELS) as MetricType[]).map(type => (
                    <option key={type} value={type}>{METRIC_LABELS[type]}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {showEvents && (
            <div className="max-h-36 overflow-y-auto space-y-0.5 pr-1">
              {filteredEntries.length === 0 ? (
                <div className="text-center text-[9px] text-gw-muted/50 py-2">暂无事件</div>
              ) : (
                filteredEntries.slice(0, 30).map((entry, i) => {
                  const typeColor = entry.type === 'dataFetch' ? '#06b6d4'
                    : entry.type === 'workerProcess' ? '#8b5cf6'
                    : entry.type === 'renderCycle' ? '#10b981'
                    : entry.type === 'cacheHit' ? '#f59e0b'
                    : '#6b7280';

                  return (
                    <div
                      key={`${entry.timestamp}-${i}`}
                      className="flex items-center gap-1.5 px-1.5 py-1 rounded bg-gw-surface/20 border border-gw-border/10"
                    >
                      <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: typeColor }} />
                      <span className="text-[8px] text-gw-muted/50 font-mono w-12 flex-shrink-0">
                        {new Date(entry.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      <span className="text-[8px] text-gw-muted/70 w-14 flex-shrink-0">
                        {METRIC_LABELS[entry.type]}
                      </span>
                      <span className="text-[9px] font-mono flex-1 text-right" style={{ color: entry.success ? '#10b981' : '#ef4444' }}>
                        {entry.durationMs.toFixed(1)}ms
                      </span>
                      {entry.label && (
                        <span className="text-[7px] text-gw-muted/40 hidden sm:inline">{entry.label}</span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* 底部提示 */}
        <div className="flex items-center justify-between text-[8px] text-gw-muted/40">
          <span>数据每 5s 刷新</span>
          <button
            onClick={() => perfMonitor.clear(60000)}
            className="flex items-center gap-0.5 hover:text-gw-muted/70 transition-colors"
          >
            <RefreshCw size={8} />
            清除历史
          </button>
        </div>
      </div>
    </TechCard>
  );
}

