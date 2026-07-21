/**
 * B-10 水源地保护区划分计算引擎
 *
 * 基于 HJ/T 338-2007《饮用水水源保护区划分技术规范》
 *
 * 功能：
 *  1. 孔隙水水源地保护区半径计算（经验公式法 + 解析法）
 *  2. 岩溶水水源地保护区划分（泉域+补给区）
 *  3. 承压水水源地保护区划分
 *  4. 保护区面积计算
 *  5. 预设水源地参数库
 */

// ═══════════════════════════════════════════════════════
// 类型定义
// ═══════════════════════════════════════════════════════

/** 水源地类型 */
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
export function calcRadiusAnalytic(
  K: number,
  I: number,
  ne: number,
  T: number,
): number {
  if (K <= 0 || I <= 0 || ne <= 0 || T <= 0) return 0;
  return Math.round((K * I * T) / ne);
}

/**
 * 经验法计算保护区半径
 *
 * 基于水源地类型和规模查表确定半径
 * 参考：HJ/T 338-2007 附录A
 */
export function calcRadiusEmpirical(
  sourceType: SourceType,
  scale: '小型' | '中型' | '大型' | '特大型',
): { primary: number; secondary: number; note: string } {
  const table = EMPIRICAL_RADII[sourceType];
  if (!table || !table[scale]) {
    return { primary: 100, secondary: 500, note: '默认值，请核查参数' };
  }
  return table[scale];
}

/**
 * 计算保护区面积（圆形）
 * A = π × R²
 * 返回 km²
 */
export function calcZoneArea(radiusM: number): number {
  return Math.round((Math.PI * radiusM * radiusM) / 1_000_000 * 100) / 100;
}

/**
 * 承压水保护区半径计算
 *
 * 承压水的一级保护区通常取经验值（较小），
 * 二级保护区至含水层补给区边界或越流补给区
 */
export function calcConfinedRadius(
  K: number,
  I: number,
  ne: number,
  scale: '小型' | '中型' | '大型' | '特大型',
): { primary: number; secondary: number; method: string } {
  // 一级用经验值
  const empirical = calcRadiusEmpirical('孔隙水-承压', scale);
  // 二级用解析法（T=1000天），但不小于经验值
  const analyticSecondary = calcRadiusAnalytic(K, I, ne, TRAVEL_TIMES.secondaryDays);
  const secondary = Math.max(analyticSecondary, empirical.secondary);
  return {
    primary: empirical.primary,
    secondary,
    method: '经验法(一级)+解析法(二级)',
  };
}

/**
 * 岩溶水保护区半径计算
 *
 * 岩溶水一级保护区取泉口/井群外围经验距离
 * 二级保护区至泉域补给区边界
 */
export function calcKarstRadius(
  K: number,
  scale: '小型' | '中型' | '大型' | '特大型',
): { primary: number; secondary: number; method: string } {
  const empirical = calcRadiusEmpirical('岩溶水', scale);
  // 岩溶水迁移速度快，二级保护区范围通常很大
  // 实际以泉域边界为准，这里给一个参考值
  const secondaryRef = Math.max(empirical.secondary, K * 10);
  return {
    primary: empirical.primary,
    secondary: secondaryRef,
    method: '经验法(一级)+泉域边界(二级)',
  };
}

/**
 * 综合保护区划分计算
 */
export function calcProtectionZone(
  sourceName: string,
  sourceType: SourceType,
  input: AnalyticInput,
  scale: '小型' | '中型' | '大型' | '特大型',
): ProtectionZoneResult {
  const zones: ZoneResult[] = [];

  if (sourceType === '孔隙水-潜水') {
    // 解析法
    const r1 = calcRadiusAnalytic(input.K, input.I, input.ne, TRAVEL_TIMES.primaryDays);
    const r2 = calcRadiusAnalytic(input.K, input.I, input.ne, TRAVEL_TIMES.secondaryDays);
    const r3 = r2 * 2; // 准保护区约为二级的2倍

    zones.push({
      level: '一级', radius: r1, area: calcZoneArea(r1),
      method: '解析法 T=100d', color: ZONE_LEVELS['一级'].color,
      description: `R = K·I·T/n_e = ${input.K}×${input.I}×100/${input.ne} = ${r1}m`,
    });
    zones.push({
      level: '二级', radius: r2, area: calcZoneArea(r2),
      method: '解析法 T=1000d', color: ZONE_LEVELS['二级'].color,
      description: `R = K·I·T/n_e = ${input.K}×${input.I}×1000/${input.ne} = ${r2}m`,
    });
    zones.push({
      level: '准保护区', radius: r3, area: calcZoneArea(r3),
      method: '经验延伸', color: ZONE_LEVELS['准保护区'].color,
      description: `二级外扩至补给区边界，参考半径 ${r3}m`,
    });

    return {
      sourceName, sourceType, zones,
      primaryRadius: r1, secondaryRadius: r2,
      totalArea: calcZoneArea(r3),
      methodSummary: '解析法（水质点迁移时间法），基于达西定律和100/1000天迁移时间标准',
    };

  } else if (sourceType === '孔隙水-承压') {
    const result = calcConfinedRadius(input.K, input.I, input.ne, scale);
    const r3 = result.secondary * 2;

    zones.push({
      level: '一级', radius: result.primary, area: calcZoneArea(result.primary),
      method: '经验法', color: ZONE_LEVELS['一级'].color,
      description: `承压水一级区取经验值 ${result.primary}m`,
    });
    zones.push({
      level: '二级', radius: result.secondary, area: calcZoneArea(result.secondary),
      method: '经验法+解析法', color: ZONE_LEVELS['二级'].color,
      description: `解析法R=${calcRadiusAnalytic(input.K, input.I, input.ne, TRAVEL_TIMES.secondaryDays)}m，取大值${result.secondary}m`,
    });
    zones.push({
      level: '准保护区', radius: r3, area: calcZoneArea(r3),
      method: '经验延伸', color: ZONE_LEVELS['准保护区'].color,
      description: `至含水层补给区边界，参考半径 ${r3}m`,
    });

    return {
      sourceName, sourceType, zones,
      primaryRadius: result.primary, secondaryRadius: result.secondary,
      totalArea: calcZoneArea(r3),
      methodSummary: result.method + '，承压水一级区取经验值，二级区结合解析法和补给区边界',
    };

  } else if (sourceType === '岩溶水') {
    const result = calcKarstRadius(input.K, scale);
    const r3 = result.secondary * 2;

    zones.push({
      level: '一级', radius: result.primary, area: calcZoneArea(result.primary),
      method: '经验法', color: ZONE_LEVELS['一级'].color,
      description: `泉口/井群外围 ${result.primary}m`,
    });
    zones.push({
      level: '二级', radius: result.secondary, area: calcZoneArea(result.secondary),
      method: '泉域边界', color: ZONE_LEVELS['二级'].color,
      description: `至泉域补给区边界，参考半径 ${result.secondary}m`,
    });
    zones.push({
      level: '准保护区', radius: r3, area: calcZoneArea(r3),
      method: '泉域补给区', color: ZONE_LEVELS['准保护区'].color,
      description: `整个泉域补给区，参考半径 ${r3}m`,
    });

    return {
      sourceName, sourceType, zones,
      primaryRadius: result.primary, secondaryRadius: result.secondary,
      totalArea: calcZoneArea(r3),
      methodSummary: result.method + '，岩溶水以泉域边界为主要划分依据',
    };

  } else {
    // 裂隙水
    const empirical = calcRadiusEmpirical('裂隙水', scale);
    const r3 = empirical.secondary * 2;

    zones.push({
      level: '一级', radius: empirical.primary, area: calcZoneArea(empirical.primary),
      method: '经验法', color: ZONE_LEVELS['一级'].color,
      description: `井群外围 ${empirical.primary}m`,
    });
    zones.push({
      level: '二级', radius: empirical.secondary, area: calcZoneArea(empirical.secondary),
      method: '经验法', color: ZONE_LEVELS['二级'].color,
      description: `至补给区边界，参考半径 ${empirical.secondary}m`,
    });
    zones.push({
      level: '准保护区', radius: r3, area: calcZoneArea(r3),
      method: '经验延伸', color: ZONE_LEVELS['准保护区'].color,
      description: `补给区外延，参考半径 ${r3}m`,
    });

    return {
      sourceName, sourceType, zones,
      primaryRadius: empirical.primary, secondaryRadius: empirical.secondary,
      totalArea: calcZoneArea(r3),
      methodSummary: '经验法，裂隙水以补给区边界为主要划分依据',
    };
  }
}

/**
 * 从预设水源地计算保护区
 */
export function calcFromPreset(preset: PresetSource): ProtectionZoneResult {
  const input: AnalyticInput = {
    K: preset.K, I: preset.I, ne: preset.ne,
    M: preset.M, Q: preset.Q, rw: preset.rw,
  };
  return calcProtectionZone(preset.name, preset.type, input, preset.scale);
}

/**
 * 批量计算预设水源地保护区
 */
export function calcAllPresets(): ProtectionZoneResult[] {
  return PRESET_SOURCES.map(calcFromPreset);
}
