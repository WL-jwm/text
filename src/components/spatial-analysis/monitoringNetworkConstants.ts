/**
 * 监测网优化 — 面板共享常量（自 MonitoringNetworkTab.tsx 拆分）
 */

export const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#e2e8f0' },
};

export const STATUS_COLORS: Record<string, string> = {
  excellent: '#10b981',
  adequate: '#06b6d4',
  insufficient: '#f59e0b',
  severe: '#ef4444',
  optimal: '#10b981',
  'over-sampled': '#06b6d4',
  'under-sampled': '#ef4444',
};

export const STATUS_LABELS: Record<string, string> = {
  excellent: '优秀',
  adequate: '充足',
  insufficient: '不足',
  severe: '严重不足',
  optimal: '合理',
  'over-sampled': '过密',
  'under-sampled': '不足',
};

export const WELL_TYPE_COLORS: Record<string, string> = {
  national: '#ef4444',
  provincial: '#f59e0b',
  municipal: '#06b6d4',
  enterprise: '#8b5cf6',
};
