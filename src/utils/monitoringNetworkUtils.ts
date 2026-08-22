/**
 * 监测网优化 — 内部工具（自 monitoringNetworkCalculator 拆分）
 */
import type { MonitoringWell } from './monitoringNetworkTypes';

export function calcEntropy(values: number[]): number {
  if (values.length === 0) return 0;

  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return 0;

  // 离散化为10个区间
  const bins = 10;
  const binSize = (max - min) / bins;
  const counts = new Array(bins).fill(0);

  for (const v of values) {
    const idx = Math.min(bins - 1, Math.floor((v - min) / binSize));
    counts[idx]++;
  }

  const n = values.length;
  let entropy = 0;
  for (const count of counts) {
    if (count > 0) {
      const p = count / n;
      entropy -= p * Math.log2(p);
    }
  }

  return entropy;
}

/** 皮尔逊相关系数 */
export function calcPearsonCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 2) return 0;

  const meanX = x.slice(0, n).reduce((s, v) => s + v, 0) / n;
  const meanY = y.slice(0, n).reduce((s, v) => s + v, 0) / n;

  let numerator = 0, denomX = 0, denomY = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    numerator += dx * dy;
    denomX += dx * dx;
    denomY += dy * dy;
  }

  const denom = Math.sqrt(denomX * denomY);
  return denom > 0 ? numerator / denom : 0;
}

/** 生成合成历史数据（用于无实际数据时的演示） */
export function generateSyntheticHistory(well: MonitoringWell): number[] {
  const months = 24; // 2年月度数据
  const history: number[] = [];
  const baseLevel = well.aquiferType === 'deep' ? -15 : well.aquiferType === 'karst' ? 540 : 35;
  const seasonalAmplitude = well.aquiferType === 'deep' ? 2 : 5;
  const trend = well.aquiferType === 'deep' ? -0.3 : -0.1;

  // 基于井位置生成不同相位
  const phaseOffset = (well.row + well.col) * 0.3;

  for (let m = 0; m < months; m++) {
    const seasonal = seasonalAmplitude * Math.sin((m / 12) * 2 * Math.PI + phaseOffset);
    const trendComponent = trend * m;
    const noise = (Math.sin(m * 7.3 + well.row * 3.1) * 0.5 + Math.sin(m * 2.1 + well.col * 1.7) * 0.3) * 1.5;
    history.push(baseLevel + seasonal + trendComponent + noise);
  }

  return history;
}

// ── 预设数据 ──

