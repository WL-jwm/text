/**
 * G-07 性能监控 — 性能面板
 *
 * 展示系统性能指标：
 *   1. 总体健康评分（环形进度条）
 *   2. 各通道延迟卡片（实时耗时 + 趋势）
 *   3. Worker 处理统计
 *   4. 缓存命中率
 *   5. 实时事件流
 *
 * 常量与子组件已拆分至 perfPanelConstants.ts / perfPanelParts.tsx
 */

import { useState, useMemo } from 'react';
import {
  Activity,
  Gauge,
  Zap,
  Database,
  Cpu,
  RefreshCw,
  ChevronDown,
  Filter,
} from 'lucide-react';
import { TechCard } from '../UI';
import { usePerfDashboard } from '../../hooks/usePerfMonitor';
import { perfMonitor, type MetricType } from '../../services/perfMonitor';
import type { DataChannel } from '../../services/realtimeDataService';
import { CHANNEL_LABELS, METRIC_LABELS } from './perfPanelConstants';
import { RingProgress, ChannelLatencyCard } from './perfPanelParts';

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

