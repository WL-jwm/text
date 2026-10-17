/**
 * 拆分自 WellNetworkPanel.tsx
 */

import { TriangleAlert, ChevronDown, Bell } from 'lucide-react';
import { ALERT_SEVERITY_CONFIG, formatAlertThreshold } from '../../../services/wellAlerts';
import { CHANNEL_LABELS } from '../constants';
import type { AlertSeverity, WellAlert, WellAlertSummary } from '../../../services/wellAlerts';

export function AlertsPanel({ showAlerts, onToggleAlerts, alertSummary, showNotifyConfig, onToggleNotifyConfig, notifyEnabled, severityFilter, onSeverityFilterChange, alerts, onSelectWell }: { showAlerts: boolean; onToggleAlerts: (v: boolean) => void; alertSummary: WellAlertSummary; showNotifyConfig: boolean; onToggleNotifyConfig: (v: boolean) => void; notifyEnabled: boolean; severityFilter: AlertSeverity | 'all'; onSeverityFilterChange: (s: AlertSeverity | 'all') => void; alerts: WellAlert[]; onSelectWell: (wellId: string) => void }) {
  return (
    <>
    {/* 告警列表 */}
    <div>
      <div className="flex items-center justify-between mb-1">
        <button
          onClick={() => onToggleAlerts(!showAlerts)}
          className="flex items-center gap-1 text-[10px] text-gw-muted hover:text-gw-text transition-colors"
        >
          <TriangleAlert size={11} className={alertSummary.total > 0 ? 'text-amber-400' : 'text-gw-muted/60'} />
          <span>实时告警 ({alertSummary.total})</span>
          <ChevronDown size={9} className={`transition-transform ${showAlerts ? 'rotate-0' : '-rotate-90'}`} />
        </button>
        {showAlerts && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleNotifyConfig(!showNotifyConfig)}
              className={`text-[7px] px-1 py-0.5 rounded transition-colors ${notifyEnabled ? 'bg-gw-cyan/20 text-gw-cyan' : 'bg-gw-surface/30 text-gw-muted/50'}`}
              title="通知设置"
            >
              <Bell size={9} />
            </button>
            <select
              value={severityFilter}
              onChange={e => onSeverityFilterChange(e.target.value as AlertSeverity | 'all')}
              className="text-[8px] bg-gw-surface/40 border border-gw-border/30 rounded px-1 py-0.5 text-gw-muted focus:outline-none"
            >
              <option value="all">全部级别</option>
              <option value="critical">超标 ({alertSummary.critical})</option>
              <option value="warning">预警 ({alertSummary.warning})</option>
              <option value="stale">过期 ({alertSummary.stale})</option>
            </select>
          </div>
        )}
      </div>
      {showAlerts && (
        <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
          {alertSummary.total === 0 ? (
            <div className="text-center text-[10px] text-gw-muted/50 py-2">暂无告警，数据质量正常</div>
          ) : (
            alerts.map(a => {
              const cfg = ALERT_SEVERITY_CONFIG[a.severity];
              return (
                <button
                  key={`${a.wellId}-${a.channel}-${a.timestamp}`}
                  onClick={() => onSelectWell(a.wellId)}
                  className={`w-full text-left px-2 py-1.5 rounded border ${cfg.bg} ${cfg.border} hover:brightness-110 transition-all`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-[8px] px-1 rounded font-medium" style={{ backgroundColor: cfg.color, color: '#fff' }}>{cfg.label}</span>
                    <span className="text-[10px] font-medium text-gw-text">{a.wellName}</span>
                    <span className="text-[8px] text-gw-muted/50">{a.city}</span>
                    <span className="text-[8px] text-gw-muted/40 font-mono ml-auto">{CHANNEL_LABELS[a.channel]}</span>
                  </div>
                  <div className="text-[8px] text-gw-muted/70 mt-0.5 pl-1">
                    {a.severity === 'stale' ? '数据过期，无最新读数' : formatAlertThreshold(a)}
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
    </>
  );
}
