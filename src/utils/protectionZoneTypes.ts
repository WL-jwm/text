/**
 * 水源地保护区计算 (G-16) — 类型定义
 * 拆分自 protectionZoneCalculator.ts：水源类型/保护区级别/解析与经验输入/结果
 */
export type SourceType = '孔隙水-潜水' | '孔隙水-承压' | '岩溶水' | '裂隙水';

/** 保护区级别 */
export type ZoneLevel = '一级' | '二级' | '准保护区';

/** 保护区级别元数据 */
export interface ZoneLevelMeta {
  level: ZoneLevel;
  color: string;
  bgColor: string;
  description: string;
}

/** 解析法输入参数 */
export interface AnalyticInput {
  /** 渗透系数 K (m/d) */
  K: number;
  /** 水力坡度 I (无量纲) */
  I: number;
  /** 有效孔隙度 n_e (无量纲) */
  ne: number;
  /** 含水层厚度 M (m) */
  M: number;
  /** 开采量 Q (m³/d) */
  Q: number;
  /** 井半径 r_w (m) */
  rw: number;
}

/** 经验法输入参数 */
export interface EmpiricalInput {
  /** 水源地类型 */
  sourceType: SourceType;
  /** 水源地规模 */
  scale: '小型' | '中型' | '大型' | '特大型';
  /** 含水层介质 */
  medium: string;
}

/** 保护区计算结果 */
export interface ZoneResult {
  level: ZoneLevel;
  /** 保护区半径 R (m) */
  radius: number;
  /** 保护区面积 A (km²) */
  area: number;
  /** 划分方法 */
  method: string;
  /** 计算依据/说明 */
  description: string;
  /** 颜色 */
  color: string;
}

/** 综合划分结果 */
export interface ProtectionZoneResult {
  sourceName: string;
  sourceType: SourceType;
  zones: ZoneResult[];
  /** 一级保护区半径 */
  primaryRadius: number;
  /** 二级保护区半径 */
  secondaryRadius: number;
  /** 总保护区面积 */
  totalArea: number;
  /** 划分方法概述 */
  methodSummary: string;
}

// ═══════════════════════════════════════════════════════
// 常量
// ═══════════════════════════════════════════════════════

/** 保护区级别元数据 */

// ============================================================
// 预设水源地类型
// ============================================================
export interface PresetSource {
  name: string;
  type: SourceType;
  scale: '小型' | '中型' | '大型' | '特大型';
  medium: string;
  K: number;
  I: number;
  ne: number;
  M: number;
  Q: number;
  rw: number;
  location: string;
  note: string;
}
