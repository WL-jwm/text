/**
 * F-01 实时数据接入框架 — 实时监测仪表盘
 *
 * 汇总展示所有通道的实时读数：
 *   1. 顶部状态栏：连接状态 + 自动刷新控制
 *   2. 通道卡片网格：4通道 × 各站点实时读数
 *   3. 实时数据流：滚动展示最新读数
 *   4. 预警面板：基于阈值的实时告警
 */

import { useState, useEffect, useRef } from 'react';
import { Activity, Droplets, Gauge, TrendingDown, Waves, AlertTriangle, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { TechCard } from '../UI';
import { MobileSVGContainer } from '../mobile/MobileSVGContainer';
import { MobileKpiCard, MobileKpiGrid } from '../mobile/MobileKpiCard';
import {
  realtimeService,
  getAlertLevel,
  formatTimestamp,
  ALERT_THRESHOLDS,
  type RealtimeReading,
  type DataChannel,
} from '../../services/realtimeDataService';
import { useRealtimeAll, useConnectionStatus } from '../../hooks/useRealtimeData';
import { RealtimeStatusBadge, AutoRefreshControl, ChannelStatusGrid } from './RealtimeStatus';
import { DataSourcePanel } from './DataSourcePanel';
import { OfflineAnalysisPanel } from './OfflineAnalysisPanel';
import { DiagnosticsPanel } from './DiagnosticsPanel';
import { useAutoCache } from '../../hooks/useRealtimeCache';

// ── 通道图标映射 ──

const CHANNEL_ICONS: Record<DataChannel, typeof Activity> = {
  waterLevel: Droplets,
  waterQuality: Waves,
  subsidence: TrendingDown,
  extraction: Gauge,
};

const CHANNEL_COLORS: Record<DataChannel, string> = {
  waterLevel: '#06b6d4',
  waterQuality: '#10b981',
  subsidence: '#ef4444',
  extraction: '#f59e0b',
};

const CHANNEL_LABELS: Record<DataChannel, string> = {
  waterLevel: '水位埋深',
  waterQuality: '水质达标率',
  subsidence: '沉降速率',
  extraction: '开采量',
};

const ALERT_STYLES: Record<'normal' | 'warning' | 'critical', { bg: string; border: string; text: string }> = {
  normal: { bg: 'bg-gw-surface/40', border: 'border-gw-border/30', text: 'text-gw-text' },
  warning: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
  critical: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
};

// ── 趋势指示器 ──

function TrendIndicator({ current, previous }: { current: number; previous: number | undefined }) {
  if (previous === undefined) return <Minus size={10} className="text-gw-muted/50" />;
  const diff = current - previous;
  if (Math.abs(diff) < 0.01) return <Minus size={10} className="text-gw-muted/50" />;
  return diff > 0
    ? <ArrowUp size={10} className="text-red-400" />
    : <ArrowDown size={10} className="text-green-400" />;
}

// ── 通道卡片 ──

function ChannelCard({
  channel,
  readings,
}: {
  channel: DataChannel;
  readings: RealtimeReading[];
}) {
  const Icon = CHANNEL_ICONS[channel];
  const color = CHANNEL_COLORS[channel];
  const label = CHANNEL_LABELS[channel];
  const config = realtimeService.getChannelConfig(channel);
  const threshold = ALERT_THRESHOLDS[channel];

  if (readings.length === 0) {
    return (
      <TechCard title={label} icon={Icon} badge={`${config.stations.length}站`}>
        <div className="text-center text-[11px] text-gw-muted py-4">等待数据接入...</div>
      </TechCard>
    );
  }

  const avg = readings.reduce((s, r) => s + r.value, 0) / readings.length;
  const alertCount = readings.filter(r => getAlertLevel(r) !== 'normal').length;

  // 迷你趋势条（最近值与基准值比较）
  const maxVal = Math.max(...readings.map(r => r.value));
  const minVal = Math.min(...readings.map(r => r.value));
  const range = maxVal - minVal || 1;

  return (
    <TechCard title={label} icon={Icon} badge={`${config.stations.length}站 · ${config.unit}`}>
      {/* 汇总行 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold" style={{ color }}>{avg.toFixed(2)}</span>
          <span className="text-[10px] text-gw-muted">{config.unit}</span>
          <span className="text-[10px] text-gw-muted/60">均值</span>
        </div>
        {alertCount > 0 && (
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20">
            <AlertTriangle size={10} className="text-red-400" />
            <span className="text-[10px] text-red-400">{alertCount}预警</span>
          </div>
        )}
      </div>

      {/* 阈值参考线 */}
      <div className="flex items-center gap-2 text-[9px] text-gw-muted/60 mb-2">
        <span>预警: {threshold.warning}{config.unit}</span>
        <span>|</span>
        <span>临界: {threshold.critical}{config.unit}</span>
      </div>

      {/* 站点列表 */}
      <div className="space-y-1.5">
        {readings.map(r => {
          const level = getAlertLevel(r);
          const style = ALERT_STYLES[level];
          const barWidth = ((r.value - minVal) / range) * 100;

          return (
            <div
              key={r.stationId}
              className={`flex items-center gap-2 px-2 py-1.5 rounded border ${style.bg} ${style.border}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-medium text-gw-text truncate">{r.stationName}</span>
                  <TrendIndicator current={r.value} previous={undefined} />
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="flex-1 h-1 rounded-full bg-gw-border/20 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.max(5, barWidth)}%`, backgroundColor: color }}
                    />
                  </div>
                  <span className={`text-[11px] font-mono font-medium ${style.text}`}>
                    {r.value.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="text-[9px] text-gw-muted/50 text-right">
                <div>{formatTimestamp(r.timestamp).slice(0, 5)}</div>
                <div className={`uppercase ${style.text}`}>{r.quality}</div>
              </div>
            </div>
          );
        })}
      </div>
    </TechCard>
  );
}

// ── 实时数据流 ──

function DataStream({ readings }: { readings: RealtimeReading[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [stream, setStream] = useState<{ reading: RealtimeReading; id: string }[]>([]);

  useEffect(() => {
    if (readings.length === 0) return;
    const latest = readings[readings.length - 1];
    const id = `${latest.stationId}-${latest.timestamp}-${Math.random()}`;
    setStream(prev => [{ reading: latest, id }, ...prev].slice(0, 30));
  }, [readings]);

  return (
    <TechCard title="实时数据流" icon={Activity} badge={`${stream.length}条`}>
      <div ref={scrollRef} className="max-h-64 overflow-y-auto space-y-1 pr-1">
        {stream.length === 0 ? (
          <div className="text-center text-[11px] text-gw-muted py-4">等待数据流入...</div>
        ) : (
          stream.map(({ reading: r, id }) => {
            const level = getAlertLevel(r);
            const style = ALERT_STYLES[level];
            const color = CHANNEL_COLORS[r.channel];

            return (
              <div
                key={id}
                className={`flex items-center gap-2 px-2 py-1 rounded border ${style.bg} ${style.border} animate-[fadeIn_0.3s_ease-out]`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-[10px] text-gw-muted w-14 flex-shrink-0">
                  {formatTimestamp(r.timestamp)}
                </span>
                <span className="text-[10px] text-gw-text flex-1 truncate">
                  {r.stationName}
                </span>
                <span className="text-[10px] text-gw-muted hidden sm:inline">
                  {CHANNEL_LABELS[r.channel]}
                </span>
                <span className={`text-[11px] font-mono font-medium ${style.text}`}>
                  {r.value.toFixed(2)}
                </span>
                <span className="text-[9px] text-gw-muted/50">{r.unit}</span>
              </div>
            );
          })
        )}
      </div>
    </TechCard>
  );
}

// ── 预警面板 ──

function AlertPanel({ readings }: { readings: RealtimeReading[] }) {
  const alerts = readings
    .map(r => ({ reading: r, level: getAlertLevel(r) }))
    .filter(a => a.level !== 'normal')
    .sort((a, b) => {
      if (a.level === 'critical' && b.level === 'warning') return -1;
      if (a.level === 'warning' && b.level === 'critical') return 1;
      return 0;
    });

  return (
    <TechCard title="实时预警" icon={AlertTriangle} badge={`${alerts.length}条`} glow={alerts.some(a => a.level === 'critical')}>
      {alerts.length === 0 ? (
        <div className="flex items-center gap-2 text-[11px] text-green-400 py-2">
          <Minus size={12} />
          <span>所有指标正常</span>
        </div>
      ) : (
        <div className="space-y-1.5">
          {alerts.map((a, i) => {
            const style = ALERT_STYLES[a.level];
            const Icon = a.level === 'critical' ? AlertTriangle : AlertTriangle;
            return (
              <div
                key={`${a.reading.stationId}-${i}`}
                className={`flex items-center gap-2 px-2 py-1.5 rounded border ${style.bg} ${style.border}`}
              >
                <Icon size={12} className={style.text} />
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-medium text-gw-text truncate">
                    {a.reading.stationName} · {CHANNEL_LABELS[a.reading.channel]}
                  </div>
                  <div className="text-[9px] text-gw-muted">
                    {a.level === 'critical' ? '超过临界值' : '超过预警值'}: {a.reading.value.toFixed(2)}{a.reading.unit}
                  </div>
                </div>
                <span className={`text-[10px] font-mono ${style.text}`}>
                  {ALERT_THRESHOLDS[a.reading.channel][a.level]}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </TechCard>
  );
}

// ── 移动端KPI概览 ──

function MobileRealtimeKpis({ readings }: { readings: RealtimeReading[] }) {
  const channels: DataChannel[] = ['waterLevel', 'waterQuality', 'subsidence', 'extraction'];

  return (
    <MobileKpiGrid>
      {channels.map(ch => {
        const chReadings = readings.filter(r => r.channel === ch);
        const avg = chReadings.length > 0
          ? chReadings.reduce((s, r) => s + r.value, 0) / chReadings.length
          : 0;
        const alertCount = chReadings.filter(r => getAlertLevel(r) !== 'normal').length;
        const Icon = CHANNEL_ICONS[ch];
        const color = CHANNEL_COLORS[ch];

        return (
          <MobileKpiCard
            key={ch}
            label={CHANNEL_LABELS[ch]}
            value={avg.toFixed(2)}
            unit={realtimeService.getChannelConfig(ch).unit}
            icon={<Icon size={14} />}
            color={color}
            trend={alertCount > 0 ? -alertCount : 0}
            trendLabel={alertCount > 0 ? `${alertCount}预警` : '正常'}
            sparkline={chReadings.map(r => r.value)}
          >
            {chReadings.map(r => (
              <div key={r.stationId} className="flex justify-between">
                <span>{r.stationName}</span>
                <span className="font-mono">{r.value.toFixed(2)}</span>
              </div>
            ))}
          </MobileKpiCard>
        );
      })}
    </MobileKpiGrid>
  );
}

// ── 主组件 ──

export function RealtimeDashboard() {
  const { allReadings, refreshAll } = useRealtimeAll();
  const status = useConnectionStatus();
  const { cachedCount } = useAutoCache(allReadings, status === 'connected');

  const channels: DataChannel[] = ['waterLevel', 'waterQuality', 'subsidence', 'extraction'];

  return (
    <div className="space-y-4">
      {/* 顶部控制栏 */}
      <TechCard>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <RealtimeStatusBadge />
            <span className="text-[11px] text-gw-muted">
              共 {allReadings.length} 条实时读数
            </span>
            {cachedCount > 0 && (
              <span className="text-[11px] text-emerald-400">
                已缓存 {cachedCount} 条
              </span>
            )}
          </div>
          <AutoRefreshControl intervalMs={30000} />
        </div>
      </TechCard>

      {/* 移动端KPI概览 */}
      <MobileRealtimeKpis readings={allReadings} />

      {/* 通道卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {channels.map(ch => {
          const chReadings = allReadings.filter(r => r.channel === ch);
          return (
            <ChannelCard key={ch} channel={ch} readings={chReadings} />
          );
        })}
      </div>

      {/* 底部：数据流 + 预警 + 通道状态 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2">
          <MobileSVGContainer svgWidth={600} svgHeight={400}>
            <DataStream readings={allReadings} />
          </MobileSVGContainer>
        </div>
        <div className="space-y-3">
          <AlertPanel readings={allReadings} />
          <ChannelStatusGrid />
        </div>
      </div>

      {/* 手动刷新按钮 */}
      <div className="flex justify-center">
        <button
          onClick={refreshAll}
          disabled={status === 'connecting'}
          className="px-4 py-2 rounded-lg text-xs bg-gw-blue/15 text-gw-cyan border border-gw-blue/30 hover:bg-gw-blue/25 transition-all disabled:opacity-50"
        >
          手动刷新全部通道
        </button>
      </div>

      {/* G-01a: 数据源管理面板 */}
      <DataSourcePanel />

      {/* G-02: 离线分析面板 */}
      <OfflineAnalysisPanel />

      {/* G-01b: 诊断增强面板 */}
      <DiagnosticsPanel />
    </div>
  );
}
