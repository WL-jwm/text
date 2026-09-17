/**
 * 水质评价服务 (G-11) — 工具函数
 * 拆分自 waterQuality.ts：水质类别对应的颜色/标签/描述
 */

import { WATER_CLASS_LABELS } from './waterQualityConstants';
import type { WaterQualityClass } from './waterQualityTypes';
export function getClassColor(wqClass: WaterQualityClass): string {
  return WATER_CLASS_LABELS[wqClass]?.color ?? '#6b7280';
}

/**
 * 获取水质等级标签
 */
export function getClassLabel(wqClass: WaterQualityClass): string {
  return WATER_CLASS_LABELS[wqClass]?.label ?? '未知';
}

/**
 * 获取水质等级描述
 */
export function getClassDescription(wqClass: WaterQualityClass): string {
  return WATER_CLASS_LABELS[wqClass]?.description ?? '未知';
}
