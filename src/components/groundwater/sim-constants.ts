import type { AquiferType } from '../../utils/numericalFlowSimulator';

export const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#e2e8f0' },
};

export const HEAT_COLORS = [
  '#1e3a5f', '#1e4d7b', '#2563eb', '#3b82f6', '#60a5fa',
  '#7dd3fc', '#fde68a', '#fbbf24', '#f59e0b', '#ea580c', '#dc2626',
];

export function getHeatColor(value: number, min: number, max: number): string {
  if (max === min) return HEAT_COLORS[5];
  const normalized = (value - min) / (max - min);
  const idx = Math.min(HEAT_COLORS.length - 1, Math.max(0, Math.floor(normalized * HEAT_COLORS.length)));
  return HEAT_COLORS[idx];
}

export const AQUIFER_TYPE_LABEL: Record<AquiferType, string> = {
  confined: '承压水',
  unconfined: '潜水',
  leaky: '越流含水层',
};
