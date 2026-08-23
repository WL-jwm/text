/**
 * 实时监测可视化 — 监测预警面板
 */

import { useMemo } from 'react';
import { AlertTriangle, Bell, MapPin, Activity } from 'lucide-react';
import { TechCard } from '../UI';
import { cityWaterLevelYearly, citySubsidenceYearly, cityQualityYearly, waterLevelYearlySummary, subsidenceYearlySummary, TS_FULL_YEARS } from '../../data/historicalTimeSeries';

export function MonitoringAlertPanel() {
  // 基于最新年份数据生成预警
  const latestYear = TS_FULL_YEARS[TS_FULL_YEARS.length - 1];
  const prevYear = TS_FULL_YEARS[TS_FULL_YEARS.length - 2];

  const alerts = useMemo(() => {
    const list: { city: string; type: 'waterLevel' | 'subsidence' | 'quality'; level: 'warning' | 'critical' | 'info'; message: string; value: string }[] = [];

    // 水位预警
    Object.entries(cityWaterLevelYearly).forEach(([city, data]) => {
      const latest = data[latestYear];
      const prev = data[prevYear];
      if (latest !== undefined && prev !== undefined) {
        if (latest > 35) {
          list.push({ city, type: 'waterLevel', level: 'warning', message: '水位埋深超过35m', value: `${latest}m` });
        }
        if (latest < prev) {
          list.push({ city, type: 'waterLevel', level: 'info', message: '水位回升中', value: `+${(prev - latest).toFixed(1)}m` });
        }
      }
    });

    // 沉降预警
    Object.entries(citySubsidenceYearly).forEach(([city, data]) => {
      const latest = data[latestYear];
      if (latest !== undefined && latest > 10) {
        list.push({ city, type: 'subsidence', level: latest > 15 ? 'critical' : 'warning', message: `沉降速率${latest}mm/a`, value: `${latest}mm/a` });
      }
    });

    // 水质预警
    Object.entries(cityQualityYearly).forEach(([city, data]) => {
      const latest = data[latestYear];
      if (latest !== undefined && latest < 60) {
        list.push({ city, type: 'quality', level: latest < 55 ? 'warning' : 'info', message: `达标率${latest}%`, value: `${latest}%` });
      }
    });

    return list.sort((a, b) => {
      const order = { critical: 0, warning: 1, info: 2 };
      return order[a.level] - order[b.level];
    });
  }, [latestYear, prevYear]);

  const levelConfig = {
    critical: { color: '#ef4444', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: AlertTriangle, label: '严重' },
    warning: { color: '#f59e0b', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Bell, label: '预警' },
    info: { color: '#22c55e', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: Activity, label: '正常' },
  };

  const typeLabels: Record<string, string> = {
    waterLevel: '水位',
    subsidence: '沉降',
    quality: '水质',
  };

  const stats = {
    critical: alerts.filter(a => a.level === 'critical').length,
    warning: alerts.filter(a => a.level === 'warning').length,
    info: alerts.filter(a => a.level === 'info').length,
  };

  return (
    <TechCard>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gw-text flex items-center gap-2">
          <Bell size={14} className="text-cyan-400" />
          监测预警面板
        </h3>
        <span className="text-[9px] text-gw-muted">数据年份: {latestYear}</span>
      </div>

      {/* 预警统计 */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className={`p-2 rounded-lg ${levelConfig.critical.bg} border ${levelConfig.critical.border} text-center`}>
          <div className="text-lg font-bold" style={{ color: levelConfig.critical.color }}>{stats.critical}</div>
          <div className="text-[9px]" style={{ color: levelConfig.critical.color }}>严重</div>
        </div>
        <div className={`p-2 rounded-lg ${levelConfig.warning.bg} border ${levelConfig.warning.border} text-center`}>
          <div className="text-lg font-bold" style={{ color: levelConfig.warning.color }}>{stats.warning}</div>
          <div className="text-[9px]" style={{ color: levelConfig.warning.color }}>预警</div>
        </div>
        <div className={`p-2 rounded-lg ${levelConfig.info.bg} border ${levelConfig.info.border} text-center`}>
          <div className="text-lg font-bold" style={{ color: levelConfig.info.color }}>{stats.info}</div>
          <div className="text-[9px]" style={{ color: levelConfig.info.color }}>正常</div>
        </div>
      </div>

      {/* 预警列表 */}
      <div className="space-y-1 max-h-[280px] overflow-y-auto">
        {alerts.map((alert, i) => {
          const cfg = levelConfig[alert.level];
          const Icon = cfg.icon;
          return (
            <div key={i} className={`flex items-center gap-2 p-1.5 rounded border ${cfg.border} ${cfg.bg}`}>
              <Icon size={12} style={{ color: cfg.color }} />
              <span className="text-[10px] text-gw-text font-medium w-12">{alert.city}</span>
              <span className="text-[8px] text-gw-muted px-1 py-0.5 rounded bg-gw-surface/60">{typeLabels[alert.type]}</span>
              <span className="text-[9px] text-gw-muted flex-1">{alert.message}</span>
              <span className="text-[9px] font-mono" style={{ color: cfg.color }}>{alert.value}</span>
              <span className="text-[8px] px-1 rounded" style={{ color: cfg.color, background: `${cfg.color}20` }}>{cfg.label}</span>
            </div>
          );
        })}
      </div>

      {/* 关键指标卡片 */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="p-2 rounded-lg bg-gw-surface/60 border border-gw-border/20">
          <div className="flex items-center gap-1 text-[9px] text-gw-muted mb-1">
            <MapPin size={9} /> 全省水位均值
          </div>
          <div className="text-cyan-400 font-bold text-sm">
            {waterLevelYearlySummary[waterLevelYearlySummary.length - 1].avgDepth}m
            <span className="text-[9px] text-emerald-400 ml-1">
              ↓{(waterLevelYearlySummary[waterLevelYearlySummary.length - 1].avgDepth - waterLevelYearlySummary[0].avgDepth).toFixed(1)}m
            </span>
          </div>
        </div>
        <div className="p-2 rounded-lg bg-gw-surface/60 border border-gw-border/20">
          <div className="flex items-center gap-1 text-[9px] text-gw-muted mb-1">
            <Activity size={9} /> 全省沉降均值
          </div>
          <div className="text-amber-400 font-bold text-sm">
            {subsidenceYearlySummary[subsidenceYearlySummary.length - 1].avgRate}mm/a
            <span className="text-[9px] text-emerald-400 ml-1">
              ↓{((subsidenceYearlySummary[0].avgRate - subsidenceYearlySummary[subsidenceYearlySummary.length - 1].avgRate) / subsidenceYearlySummary[0].avgRate * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
    </TechCard>
  );
}

// ── 主组件 ──

