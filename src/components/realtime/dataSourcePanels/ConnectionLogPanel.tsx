/**
 * 连接日志面板（拆分自 DataSourcePanel.tsx）
 */
import { useI18n } from '../../../hooks/useI18n';
import type { LogEntry } from '../../../services/realtimeDataSource';
import { CHANNEL_LABELS, LOG_LEVEL_COLORS } from './dataSourceConstants';

interface ConnectionLogPanelProps {
  filteredLogs: LogEntry[];
  logFilter: 'all' | 'waterLevel' | 'waterQuality' | 'subsidence' | 'extraction';
  onFilterChange: (f: 'all' | 'waterLevel' | 'waterQuality' | 'subsidence' | 'extraction') => void;
  autoScroll: boolean;
  onAutoScrollChange: (v: boolean) => void;
  onClear: () => void;
  logEndRef: React.RefObject<HTMLDivElement>;
}

export function ConnectionLogPanel({ filteredLogs, logFilter, onFilterChange, autoScroll, onAutoScrollChange, onClear, logEndRef }: ConnectionLogPanelProps) {
  const { t } = useI18n();
  return (
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/80 flex items-center gap-3">
          <h3 className="text-sm font-semibold text-slate-200">
            {t('settings.connectionLogs') || '连接日志'}
          </h3>
          <select
            value={logFilter}
            onChange={e => onFilterChange(e.target.value as 'all' | 'waterLevel' | 'waterQuality' | 'subsidence' | 'extraction')}
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
              onChange={e => onAutoScrollChange(e.target.checked)}
              className="accent-blue-400"
            />
            自动滚动
          </label>
          <button
            onClick={onClear}
            className="text-xs px-2 py-0.5 rounded border border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            清除
          </button>
          <span className="text-xs text-slate-500 ml-auto">{filteredLogs.length} 条</span>
        </div>
        <div className="max-h-64 overflow-y-auto p-3 font-mono text-xs space-y-0.5">
          {filteredLogs.length === 0 ? (
            <div className="text-slate-600 text-center py-4">暂无日志</div>
          ) : (
            filteredLogs.map((log, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="text-slate-600 shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString('zh-CN', { hour12: false })}
                </span>
                <span className={`shrink-0 ${LOG_LEVEL_COLORS[log.level] ?? 'text-slate-400'}`}>
                  [{log.level.toUpperCase()}]
                </span>
                <span className="text-slate-500 shrink-0">{log.sourceType}:</span>
                <span className="text-slate-500 shrink-0">{CHANNEL_LABELS[log.channel]}</span>
                <span className="text-slate-300">{log.message}</span>
                {log.detail && <span className="text-slate-600">— {log.detail}</span>}
              </div>
            ))
          )}
          <div ref={logEndRef} />
        </div>
      </div>
  );
}
