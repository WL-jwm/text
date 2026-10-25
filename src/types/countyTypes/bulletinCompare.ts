/**
 * 拆分自 types/county.ts — Bulletin 对比类型
 */

// ── Bulletin 对比类型 ──

/** 跨市对比图表数据项 */
export interface BulletinCompareItem {
  name: string;
  降水量: number;
  地表水: number;
  地下水: number;
  水资源总量: number;
  总供水: number;
  地下水供水: number;
  降水总量: number;
}

/** 公报排序表格行 */
export interface BulletinTableRow {
  name: string;
  降水: number;
  地表水: number;
  地下水: number;
  总量: number;
  供水: number;
  地下水供水比: number;
  浅层埋深: number;
  浅层变化: number;
  县级数据: number;
}

/** 地下水依赖度排名项（简化版，用于 SupplyStructureTab） */
export interface GwDepRankItem {
  name: string;
  rate: number;
}

/** 供水结构数据项 */
export interface SupplyStructureItem {
  name: string;
  地下水: number;
  地表水: number;
}

/** 各市水资源量对比项（用于 DataInsightInner） */
export interface RegionalCompareItem {
  name: string;
  '浅层变化': number;
  '深层变化': number;
}

/** 区域列数据项 */
export interface RegionalColumnItem {
  name: string;
  '总供水(亿m³)': number;
  '地下水占比(%)': number;
  '地表水占比(%)': number;
  '水位变化(m)': number;
}
