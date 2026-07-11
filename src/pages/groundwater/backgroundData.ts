export const ZONE_COLORS = ['#3b82f6', '#f59e0b', '#ef4444'];

export const ZONE_LABELS: Record<string, string> = {
  '山前平原': '山前平原',
  '中部平原': '中部平原',
  '滨海平原': '滨海平原',
  '山前平原深层': '山前深层',
  '中部平原深层': '中部深层',
  '滨海平原深层': '滨海深层',
};

export const RADAR_INDICATORS = ['TDS', '总硬度', 'Cl', 'SO4', 'Na', 'Ca', 'Mg', 'F'];

export function parseRange(range: string): number {
  const parts = range.replace(/[<>]/g, '').split('~');
  const vals = parts.map(Number).filter(n => !isNaN(n));
  return vals.length > 0 ? vals[vals.length - 1] : 0;
}

export interface RadarDataPoint {
  indicator: string;
  [key: string]: string | number;
}

export interface IndicatorComparePoint {
  name: string;
  [key: string]: string | number;
}
