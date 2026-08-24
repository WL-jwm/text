/**
 * 土壤盐渍化计算 — 分级标准/质地参数/预设区
 */

import type { SalinizationInput, SaltGradeStandard, pHGradeStandard, TextureCapillaryParam } from './soilSalinizationTypes';

export const SALT_GRADE_STANDARDS: SaltGradeStandard[] = [
  { grade: '无盐渍化', description: '土壤无盐渍化，作物生长正常', color: 'emerald', saltMax: 1.0, ecMax: 2.0 },
  { grade: '轻度盐渍化', description: '轻微影响作物生长，耐盐作物可正常生长', color: 'cyan', saltMax: 2.0, ecMax: 4.0 },
  { grade: '中度盐渍化', description: '明显影响作物生长，需选耐盐品种', color: 'amber', saltMax: 4.0, ecMax: 8.0 },
  { grade: '重度盐渍化', description: '严重影响作物生长，仅耐盐植物可存活', color: 'orange', saltMax: 6.0, ecMax: 16.0 },
  { grade: '极重度盐渍化', description: '盐荒地或盐结壳，基本无作物生长', color: 'red', saltMax: Infinity, ecMax: Infinity },
];

// pH 碱化分级

export const PH_GRADE_STANDARDS: pHGradeStandard[] = [
  { grade: '非碱化', description: 'pH正常，无碱化问题', color: 'emerald', phMin: 0, phMax: 8.5 },
  { grade: '轻度碱化', description: 'pH略偏高，轻微碱化', color: 'amber', phMin: 8.5, phMax: 9.0 },
  { grade: '中度碱化', description: 'pH偏高，明显碱化，影响养分吸收', color: 'orange', phMin: 9.0, phMax: 9.5 },
  { grade: '重度碱化', description: 'pH过高，严重碱化，需改良', color: 'red', phMin: 9.5, phMax: Infinity },
];

// ═══════════════════════════════════════════════════════
// 土壤质地毛细参数
// ═══════════════════════════════════════════════════════


export const TEXTURE_PARAMS: TextureCapillaryParam[] = [
  { texture: '砂土', capillaryRise: 1.0, criticalExtra: 0.3, permeability: 1.5 },
  { texture: '砂壤', capillaryRise: 1.5, criticalExtra: 0.5, permeability: 0.8 },
  { texture: '轻壤', capillaryRise: 2.0, criticalExtra: 0.7, permeability: 0.5 },
  { texture: '中壤', capillaryRise: 2.5, criticalExtra: 0.8, permeability: 0.3 },
  { texture: '重壤', capillaryRise: 3.0, criticalExtra: 1.0, permeability: 0.15 },
  { texture: '黏土', capillaryRise: 3.5, criticalExtra: 1.2, permeability: 0.08 },
];


export function getTextureParam(texture: string): TextureCapillaryParam {
  const found = TEXTURE_PARAMS.find(t => t.texture === texture);
  return found ?? TEXTURE_PARAMS[3]; // 默认中壤
}

// ═══════════════════════════════════════════════════════
// 预设数据：河北平原8个盐渍化分区
// ═══════════════════════════════════════════════════════


export const PRESET_ZONES: SalinizationInput[] = [
  {
    name: '沧州滨海区', totalSalt: 5.2, ecE: 14.5, ph: 8.2,
    chloride: 6.8, sulfate: 3.2, bicarbonate: 0.5, carbonate: 0,
    sodium: 7.5, calcium: 1.8, magnesium: 1.2,
    gwMineralization: 8.5, gwDepth: 1.2, soilTexture: '中壤',
    irrigationEC: 1.2, cropThreshold: 4.0,
  },
  {
    name: '唐山南部区', totalSalt: 3.8, ecE: 10.2, ph: 8.4,
    chloride: 4.5, sulfate: 2.8, bicarbonate: 0.6, carbonate: 0,
    sodium: 5.2, calcium: 1.5, magnesium: 1.0,
    gwMineralization: 5.2, gwDepth: 1.8, soilTexture: '轻壤',
    irrigationEC: 0.8, cropThreshold: 4.0,
  },
  {
    name: '衡水西北区', totalSalt: 2.5, ecE: 6.8, ph: 8.6,
    chloride: 2.0, sulfate: 3.5, bicarbonate: 0.8, carbonate: 0,
    sodium: 3.8, calcium: 1.2, magnesium: 1.3,
    gwMineralization: 3.2, gwDepth: 2.5, soilTexture: '中壤',
    irrigationEC: 1.0, cropThreshold: 4.0,
  },
  {
    name: '邢台东部区', totalSalt: 1.8, ecE: 4.5, ph: 8.5,
    chloride: 1.2, sulfate: 2.5, bicarbonate: 0.9, carbonate: 0,
    sodium: 2.5, calcium: 1.0, magnesium: 1.1,
    gwMineralization: 2.5, gwDepth: 3.0, soilTexture: '轻壤',
    irrigationEC: 0.7, cropThreshold: 4.0,
  },
  {
    name: '邯郸东部区', totalSalt: 1.5, ecE: 3.8, ph: 8.7,
    chloride: 0.8, sulfate: 2.2, bicarbonate: 1.0, carbonate: 0.1,
    sodium: 2.0, calcium: 0.9, magnesium: 1.2,
    gwMineralization: 2.0, gwDepth: 3.5, soilTexture: '砂壤',
    irrigationEC: 0.6, cropThreshold: 4.0,
  },
  {
    name: '廊坊南部区', totalSalt: 2.2, ecE: 5.5, ph: 8.3,
    chloride: 1.8, sulfate: 2.8, bicarbonate: 0.7, carbonate: 0,
    sodium: 3.2, calcium: 1.1, magnesium: 1.0,
    gwMineralization: 2.8, gwDepth: 2.8, soilTexture: '中壤',
    irrigationEC: 0.9, cropThreshold: 4.0,
  },
  {
    name: '保定东部区', totalSalt: 1.2, ecE: 3.2, ph: 8.4,
    chloride: 0.6, sulfate: 1.8, bicarbonate: 0.8, carbonate: 0,
    sodium: 1.5, calcium: 0.8, magnesium: 0.9,
    gwMineralization: 1.8, gwDepth: 4.0, soilTexture: '砂壤',
    irrigationEC: 0.5, cropThreshold: 4.0,
  },
  {
    name: '沧州内陆区', totalSalt: 3.5, ecE: 9.0, ph: 8.5,
    chloride: 3.8, sulfate: 3.0, bicarbonate: 0.6, carbonate: 0,
    sodium: 4.5, calcium: 1.4, magnesium: 1.5,
    gwMineralization: 4.5, gwDepth: 1.5, soilTexture: '重壤',
    irrigationEC: 1.1, cropThreshold: 4.0,
  },
];

// ═══════════════════════════════════════════════════════
// 核心计算函数
// ═══════════════════════════════════════════════════════

/**
 * 盐分分级评价
 */
