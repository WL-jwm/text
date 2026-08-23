/**
 * 包气带入渗可视化 — 岩性类型与区间解析工具
 */

export type LithCategory = 'all' | '碳酸盐岩' | '岩浆岩和变质岩' | '碎屑岩';

export function parseRange(str: string): { min: number; max: number } {
  const m = str.match(/([\d.]+)\s*[~～-]\s*([\d.]+)/);
  if (m) return { min: parseFloat(m[1]), max: parseFloat(m[2]) };
  const single = str.match(/([\d.]+)/);
  if (single) return { min: parseFloat(single[1]), max: parseFloat(single[1]) };
  return { min: 0, max: 0 };
}

export function avgRange(str: string): number {
  const { min, max } = parseRange(str);
  return (min + max) / 2;
}

// ── 子组件1：包气带剖面示意图 ──
