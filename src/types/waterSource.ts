// ── 水源地相关类型定义 ──

/** 蓄水构造摘要 */
export interface StorageStructureSummary {
  type: string;
  count: number;
  code: string;
  description: string;
  totalArea: string;
  representative: string;
}

/** 饼图数据项 */
export interface PieItem {
  name: string;
  value: number;
  color: string;
}

/** 柱状图数据项 */
export interface BarItem {
  name: string;
  count: number;
}
