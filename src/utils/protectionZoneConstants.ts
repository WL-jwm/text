/**
 * 水源地保护区计算 (G-16) — 标准常量
 * 拆分自 protectionZoneCalculator.ts：级别/经验半径/迁移时间/孔隙度/预设水源地
 */

import type { PresetSource, SourceType, ZoneLevel, ZoneLevelMeta } from './protectionZoneTypes';
export const ZONE_LEVELS: Record<ZoneLevel, ZoneLevelMeta> = {
  '一级': { level: '一级', color: '#ef4444', bgColor: 'bg-red-500/15', description: '取水口周边，严密保护，禁止一切可能污染水质的活动' },
  '二级': { level: '二级', color: '#f59e0b', bgColor: 'bg-amber-500/15', description: '一级外围，防止病原菌污染和有毒物质进入，限制开发活动' },
  '准保护区': { level: '准保护区', color: '#3b82f6', bgColor: 'bg-blue-500/15', description: '二级外围至补给区边界，预防性保护，控制面源污染' },
};

/** 各类型水源地经验半径参考值（HJ/T 338-2007 附录A） */
export const EMPIRICAL_RADII: Record<SourceType, Record<string, { primary: number; secondary: number; note: string }>> = {
  '孔隙水-潜水': {
    '小型': { primary: 50, secondary: 300, note: '井群外围50m为一级，外扩至300m为二级' },
    '中型': { primary: 100, secondary: 500, note: '井群外围100m为一级，外扩至500m为二级' },
    '大型': { primary: 200, secondary: 1000, note: '井群外围200m为一级，外扩至1000m为二级' },
    '特大型': { primary: 300, secondary: 1500, note: '井群外围300m为一级，外扩至1500m为二级' },
  },
  '孔隙水-承压': {
    '小型': { primary: 30, secondary: 150, note: '承压水一级区可适当缩小，二级至补给区边界' },
    '中型': { primary: 50, secondary: 300, note: '承压水一级区50m，二级至含水层补给边界' },
    '大型': { primary: 100, secondary: 500, note: '承压水一级区100m，二级至补给区或越流补给区' },
    '特大型': { primary: 150, secondary: 800, note: '承压水一级区150m，二级至补给区边界' },
  },
  '岩溶水': {
    '小型': { primary: 100, secondary: 500, note: '泉口/井群外围100m为一级，泉域补给区为二级' },
    '中型': { primary: 200, secondary: 1000, note: '泉口/井群外围200m为一级，泉域补给区为二级' },
    '大型': { primary: 300, secondary: 2000, note: '泉口/井群外围300m为一级，泉域补给区为二级' },
    '特大型': { primary: 500, secondary: 3000, note: '泉口/井群外围500m为一级，整个泉域为二级+准保护区' },
  },
  '裂隙水': {
    '小型': { primary: 50, secondary: 300, note: '井群外围50m为一级，补给区为二级' },
    '中型': { primary: 100, secondary: 500, note: '井群外围100m为一级，补给区为二级' },
    '大型': { primary: 150, secondary: 800, note: '井群外围150m为一级，补给区为二级' },
    '特大型': { primary: 200, secondary: 1000, note: '井群外围200m为一级，补给区为二级' },
  },
};

/** 解析法时间标准（HJ/T 338-2007） */
export const TRAVEL_TIMES = {
  /** 一级保护区迁移时间 T₁ (天) — 孔隙水潜水100天 */
  primaryDays: 100,
  /** 二级保护区迁移时间 T₂ (天) — 孔隙水潜水1000天 */
  secondaryDays: 1000,
} as const;

/** 含水层介质有效孔隙度参考 */
export const MEDIUM_POROSITY: Record<string, { ne: number; K: number; description: string }> = {
  '砾石卵石': { ne: 0.25, K: 100, description: '冲洪积扇上部，高渗透性' },
  '砾石含粗砂': { ne: 0.22, K: 50, description: '冲洪积扇中部，强渗透性' },
  '中粗砂': { ne: 0.20, K: 20, description: '冲洪积扇下部/平原区，中等渗透性' },
  '中细砂': { ne: 0.18, K: 10, description: '平原区浅层水，中等渗透性' },
  '细粉砂': { ne: 0.15, K: 5, description: '平原古河道/滨海区，弱渗透性' },
  '岩溶灰岩': { ne: 0.05, K: 200, description: '奥陶系灰岩，岩溶发育，高渗透性' },
  '岩溶白云岩': { ne: 0.04, K: 100, description: '中上元古界白云岩，岩溶较发育' },
  '砂岩裂隙': { ne: 0.10, K: 5, description: '碎屑岩裂隙水，弱-中等渗透性' },
  '花岗岩裂隙': { ne: 0.08, K: 3, description: '结晶岩风化裂隙水，弱渗透性' },
};

/** 预设水源地参数 */

// ============================================================
// 预设水源地
// ============================================================
export const PRESET_SOURCES: PresetSource[] = [
  { name: '石家庄水源地', type: '孔隙水-潜水', scale: '特大型', medium: '砾石卵石', K: 150, I: 0.003, ne: 0.25, M: 50, Q: 12000, rw: 0.3, location: '滹沱河冲洪积扇', note: '南水北调替代后限采' },
  { name: '保定水源地', type: '孔隙水-潜水', scale: '大型', medium: '砾石含粗砂', K: 80, I: 0.0025, ne: 0.22, M: 40, Q: 8500, rw: 0.3, location: '唐河-大沙河冲洪积扇', note: '限采+外调水替代' },
  { name: '邯郸水源地', type: '岩溶水', scale: '大型', medium: '岩溶灰岩', K: 200, I: 0.005, ne: 0.05, M: 200, Q: 5500, rw: 0.3, location: '黑龙洞泉域', note: '南水北调替代' },
  { name: '邢台水源地', type: '岩溶水', scale: '中型', medium: '岩溶灰岩', K: 180, I: 0.004, ne: 0.05, M: 150, Q: 4200, rw: 0.3, location: '百泉泉域', note: '南水北调替代' },
  { name: '张家口水源地', type: '孔隙水-潜水', scale: '中型', medium: '砾石含粗砂', K: 60, I: 0.004, ne: 0.22, M: 30, Q: 2800, rw: 0.3, location: '张家口盆地', note: '正常开采' },
  { name: '沧州水源地', type: '孔隙水-承压', scale: '中型', medium: '中细砂', K: 8, I: 0.001, ne: 0.18, M: 60, Q: 1500, rw: 0.3, location: '深层承压水', note: '禁采+南水北调' },
  { name: '唐山水源地', type: '岩溶水', scale: '大型', medium: '岩溶灰岩', K: 150, I: 0.003, ne: 0.05, M: 180, Q: 9500, rw: 0.3, location: '开平向斜', note: '部分替代' },
  { name: '承德水源地', type: '孔隙水-潜水', scale: '中型', medium: '砾石含粗砂', K: 40, I: 0.005, ne: 0.20, M: 25, Q: 1800, rw: 0.3, location: '武烈河河谷', note: '正常开采' },
];

// ═══════════════════════════════════════════════════════
// 核心计算函数
// ═══════════════════════════════════════════════════════

/**
 * 解析法计算保护区半径（孔隙水潜水）
 *
 * 基于水质点迁移时间法（advection transport）：
 *   R = (K × I × T) / n_e
 *
 * 其中：
 *   K  — 渗透系数 (m/d)
 *   I  — 水力坡度 (无量纲)
 *   T  — 迁移时间 (d)，一级100天，二级1000天
 *   n_e — 有效孔隙度 (无量纲)
 *
 * 参考：HJ/T 338-2007 第6.1.2条
 */
