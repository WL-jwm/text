import type { AquiferType, WellStatus } from '../../services/wellNetwork';
import type { WellRealtimeStatus } from '../../services/wellRealtime';
import type { DataChannel } from '../../services/realtimeDataService';

// ── 共享常量（井网面板子组件共用）──
export const CHANNEL_LABELS: Record<DataChannel, string> = {
  waterLevel: '水位',
  waterQuality: '水质',
  subsidence: '沉降',
  extraction: '开采量',
};

export const AQUIFER_COLORS: Record<AquiferType, string> = {
  shallowPorous: '#06b6d4',
  deepPorous: '#2563eb',
  karst: '#10b981',
  fracture: '#f59e0b',
};

export const AQUIFER_TYPES: AquiferType[] = ['shallowPorous', 'deepPorous', 'karst', 'fracture'];
export const STATUSES: WellStatus[] = ['active', 'maintenance', 'inactive'];
export const CHANNELS: DataChannel[] = ['waterLevel', 'waterQuality', 'subsidence', 'extraction'];
export const RT_STATUSES: WellRealtimeStatus[] = ['normal', 'warning', 'critical', 'stale'];
