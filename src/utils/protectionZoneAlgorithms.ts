/**
 * 水源地保护区计算 (G-16) — 算法核心
 * 拆分自 protectionZoneCalculator.ts：解析法/经验法/面积/承压/岩溶/主计算
 */

import { EMPIRICAL_RADII, TRAVEL_TIMES, ZONE_LEVELS } from './protectionZoneConstants';
import type {
  AnalyticInput,
  ProtectionZoneResult,
  SourceType,
  ZoneResult,
} from './protectionZoneTypes';
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
