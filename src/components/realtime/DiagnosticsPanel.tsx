/**
 * G-01b 诊断增强面板
 *
 * 实时展示所有数据源的连接诊断信息：
 *   1. 连接状态总览（4 通道 × 状态/类型/指标）
 *   2. WebSocket 详细诊断（URL/重连/消息数/字节数/错误/最后消息时间）
 *   3. 连接日志实时流（带级别过滤+通道过滤）
 *   4. 性能指标（消息速率/延迟/丢消息估算）
 */

import { useState, useEffect, useRef } from 'react';
import { realtimeService } from '../../services/realtimeDataService';
import { connectionLogger, getDataSource, type LogEntry, type WsConnectionState } from '../../services/realtimeDataSource';
import type { DataChannel } from '../../services/realtimeDataService';

const CHANNELS: DataChannel[] = ['waterLevel', 'waterQuality', 'subsidence', 'extraction'];

const CHANNEL_LABELS: Record<DataChannel, string> = {
  waterLevel: '水位埋深',
  waterQuality: '水质达标率',
  subsidence: '沉降速率',
  extraction: '开采量',
};

const STATE_COLORS: Record<WsConnectionState, string> = {
  idle: 'text-slate-500',
  connecting: 'text-yellow-400',
  open: 'text-emerald-400',
  closing: 'text-orange-400',
  closed: 'text-slate-400',
  error: 'text-red-400',
};

const STATE_LABELS: Record<WsConnectionState, string> = {
  idle: '未连接',
  connecting: '连接中',
  open: '已连接',
  closing: '关闭中',
  closed: '已关闭',
  error: '错误',
};

const LOG_COLORS: Record<string, string> = {
  info: 'text-blue-400',
  warn: 'text-yellow-400',
  error: 'text-red-400',
  debug: 'text-slate-500',
};

export function DiagnosticsPanel(): React.ReactElement {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [, setWsMetrics] = useState<Record<string, ReturnType<typeof getWsMetrics>>>({});
  const [logLevelFilter, setLogLevelFilter] = useState<string>('all');
  const [logChannelFilter, setLogChannelFilter] = useState<DataChannel | 'all'>('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const logEndRef = useRef<HTMLDivElement>(null);
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  function getWsMetrics(channel: DataChannel) {
    const wsSource = getDataSource('ws') as import('../../services/realtimeDataSource').WebSocketDataSource;
    return wsSource.getMetrics(channel);
  }

  function getWsDiagnostics() {
    const wsSource = getDataSource('ws') as import('../../services/realtimeDataSource').WebSocketDataSource;
    return wsSource.getDiagnostics();
  }

  // 订阅日志
  useEffect(() => {
    const unsub = connectionLogger.subscribe(newLogs => setLogs([...newLogs]));
    return unsub;
  }, []);

  // 定期刷新 WS 指标
  useEffect(() => {
    const updateMetrics = () => {
      const metrics: Record<string, ReturnType<typeof getWsMetrics>> = {};
      for (const ch of CHANNELS) {
        metrics[ch] = getWsMetrics(ch);
      }
      setWsMetrics(metrics);
    };

    updateMetrics();
    refreshTimer.current = setInterval(updateMetrics, 2000);

    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
    };
  }, []);

  // 自动滚动
  useEffect(() => {
    if (autoScroll && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  // 过滤日志
  const filteredLogs = logs.filter(log => {
    if (logLevelFilter !== 'all' && log.level !== logLevelFilter) return false;
    if (logChannelFilter !== 'all' && log.channel !== logChannelFilter) return false;
    return true;
  });

  const wsDiagnostics = getWsDiagnostics();

  // 统计信息
  const totalLogs = logs.length;
  const errorCount = logs.filter(l => l.level === 'error').length;
  const warnCount = logs.filter(l => l.level === 'warn').length;
  const wsConnected = wsDiagnostics.filter(d => d.state === 'open').length;

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* 诊断概览 */}
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200">连接诊断概览</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3">
          <div className="text-center rounded border border-slate-700 bg-slate-900/50 p-2">
            <div className="text-xs text-slate-500">WS 已连接</div>
            <div className="text-lg font-bold text-emerald-400">{wsConnected}</div>
            <div className="text-[10px] text-slate-600">/ {CHANNELS.length} 通道</div>
          </div>
          <div className="text-center rounded border border-slate-700 bg-slate-900/50 p-2">
            <div className="text-xs text-slate-500">日志总数</div>
            <div className="text-lg font-bold text-blue-400">{totalLogs}</div>
            <div className="text-[10px] text-slate-600">条</div>
          </div>
          <div className="text-center rounded border border-slate-700 bg-slate-900/50 p-2">
            <div className="text-xs text-slate-500">警告</div>
            <div className="text-lg font-bold text-yellow-400">{warnCount}</div>
            <div className="text-[10px] text-slate-600">条</div>
          </div>
          <div className="text-center rounded border border-slate-700 bg-slate-900/50 p-2">
            <div className="text-xs text-slate-500">错误</div>
            <div className="text-lg font-bold text-red-400">{errorCount}</div>
            <div className="text-[10px] text-slate-600">条</div>
          </div>
        </div>
      </div>

      {/* WebSocket 诊断详情 */}
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200">WebSocket 诊断详情</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-800/60 text-slate-400">
              <tr>
                <th className="px-3 py-2 text-left">通道</th>
                <th className="px-3 py-2 text-left">状态</th>
                <th className="px-3 py-2 text-left">URL</th>
                <th className="px-3 py-2 text-right">重连</th>
                <th className="px-3 py-2 text-right">消息数</th>
                <th className="px-3 py-2 text-right">字节</th>
                <th className="px-3 py-2 text-right">错误</th>
                <th className="px-3 py-2 text-right">最后消息</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {wsDiagnostics.map(d => (
                <tr key={d.channel} className="hover:bg-slate-700/30">
                  <td className="px-3 py-2 text-slate-300">{CHANNEL_LABELS[d.channel]}</td>
                  <td className={`px-3 py-2 ${STATE_COLORS[d.state]}`}>
                    {STATE_LABELS[d.state]}
                  </td>
                  <td className="px-3 py-2 text-slate-500 truncate max-w-[200px]" title={d.url}>
                    {d.url}
                  </td>
                  <td className="px-3 py-2 text-right text-slate-400">{d.reconnectCount}</td>
                  <td className="px-3 py-2 text-right text-slate-400">{d.messagesReceived}</td>
                  <td className="px-3 py-2 text-right text-slate-400">{formatBytes(d.bytesReceived)}</td>
                  <td className="px-3 py-2 text-right text-red-400">{d.errors}</td>
                  <td className="px-3 py-2 text-right text-slate-500">{d.lastMessageAgo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 当前数据源类型 */}
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200">通道数据源类型</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3">
          {CHANNELS.map(ch => {
            const type = realtimeService.getDataSourceType(ch);
            const error = realtimeService.getChannelError(ch);
            const typeColors: Record<string, string> = {
              mock: 'text-emerald-400',
              http: 'text-blue-400',
              ws: 'text-purple-400',
            };
            return (
              <div key={ch} className="rounded border border-slate-700 bg-slate-900/50 p-2">
                <div className="text-xs text-slate-400">{CHANNEL_LABELS[ch]}</div>
                <div className={`text-sm font-semibold mt-0.5 ${typeColors[type] ?? 'text-slate-300'}`}>
                  {type.toUpperCase()}
                </div>
                {error && (
                  <div className="text-[10px] text-red-400 mt-1 truncate" title={error}>
                    {error}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 连接日志流 */}
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/80 flex items-center gap-3 flex-wrap">
          <h3 className="text-sm font-semibold text-slate-200">连接日志流</h3>
          <select
            value={logLevelFilter}
            onChange={e => setLogLevelFilter(e.target.value)}
            className="text-xs bg-slate-700 text-slate-200 rounded px-2 py-0.5 border border-slate-600"
          >
            <option value="all">全部级别</option>
            <option value="info">INFO</option>
            <option value="warn">WARN</option>
            <option value="error">ERROR</option>
            <option value="debug">DEBUG</option>
          </select>
          <select
            value={logChannelFilter}
            onChange={e => setLogChannelFilter(e.target.value as DataChannel | 'all')}
            className="text-xs bg-slate-700 text-slate-200 rounded px-2 py-0.5 border border-slate-600"
          >
            <option value="all">全部通道</option>
            <option value="waterLevel">水位</option>
            <option value="waterQuality">水质</option>
            <option value="subsidence">沉降</option>
            <option value="extraction">开采</option>
          </select>
          <label className="text-xs text-slate-400 flex items-center gap-1">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={e => setAutoScroll(e.target.checked)}
              className="accent-blue-400"
            />
            自动滚动
          </label>
          <button
            onClick={() => realtimeService.clearLogs()}
            className="text-xs px-2 py-0.5 rounded border border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            清除日志
          </button>
          <span className="text-xs text-slate-500 ml-auto">{filteredLogs.length} / {totalLogs} 条</span>
        </div>
        <div className="max-h-80 overflow-y-auto p-3 font-mono text-xs space-y-0.5">
          {filteredLogs.length === 0 ? (
            <div className="text-slate-600 text-center py-4">暂无日志</div>
          ) : (
            filteredLogs.slice(-500).map((log, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="text-slate-600 shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString('zh-CN', { hour12: false })}
                </span>
                <span className={`shrink-0 w-14 ${LOG_COLORS[log.level] ?? 'text-slate-400'}`}>
                  [{log.level.toUpperCase()}]
                </span>
                <span className="text-slate-500 shrink-0 w-8">{log.sourceType}</span>
                <span className="text-slate-500 shrink-0">{CHANNEL_LABELS[log.channel]}</span>
                <span className="text-slate-300">{log.message}</span>
                {log.detail && <span className="text-slate-600">— {log.detail}</span>}
              </div>
            ))
          )}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
}
