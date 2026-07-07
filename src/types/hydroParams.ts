// ── 水文地质参数相关类型定义 ──

/** 含水层组 */
export interface AquiferGroup {
  group: string;
  era: string;
  property: string;
  depth: string;
  lithology: string;
  K: string;
  T: string;
  mu: string;
  salinity: string;
  note: string;
}

/** 释水系数 */
export interface StorageCoeff {
  era: string;
  lithology: string;
  mu_e: string;
  note: string;
}

/** 岩溶水参数 */
export interface KarstParam {
  type: string;
  K: string;
  T: string;
  mu: string;
  area: string;
  note: string;
}

/** 裂隙水参数 */
export interface FractureParam {
  type: string;
  lithology: string;
  K: string;
  springFlow: string;
  modulus: string;
}

/** 弥散度 */
export interface DispersivityItem {
  medium: string;
  aL: string;
  aT: string;
  note: string;
}

/** 渗透系数图表数据项 */
export interface PermBarItem {
  name: string;
  Kh: number;
  Kv: number;
}

/** 给水度图表数据项 */
export interface MuBarItem {
  name: string;
  mu: number;
  K: number;
}

/** 入渗系数图表数据项 */
export interface InfiltrationBarItem {
  name: string;
  平原区: number;
  山区: number;
}

/** 弥散度散点数据项 */
export interface DispersivityScatterItem {
  name: string;
  aL: number;
  aT: number;
}
