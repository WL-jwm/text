// ── 地质构造类型定义 ──

/** 构造单元（三级） */
export interface TectonicUnitItem {
  level: string;
  name: string;
  code: string;
  description: string;
  boundary?: string;
  width?: string;
  features?: string;
  subUnits?: TectonicUnitItem[];
}
