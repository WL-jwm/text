/**
 * 共享常量与类型（拆分自 RiskAssessmentTab.tsx）
 */
import type { AquiferMedia, SoilMedia, VadoseZone, LandUse } from '../../../utils/riskAssessmentCalculator';

export const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
};

export const RISK_COLORS: Record<string, string> = {
  '极低': '#10b981', '低': '#3b82f6', '中等': '#f59e0b', '高': '#f97316', '极高': '#ef4444',
};

export const AQUIFER_OPTIONS: AquiferMedia[] = ['页岩', '变质岩', '砂岩', '灰岩', '砂砾石', '玄武岩'];

export const SOIL_OPTIONS: SoilMedia[] = ['黏土', '粉质黏土', '粉土', '砂土', '砾石', '薄层/缺失'];

export const VADOSE_OPTIONS: VadoseZone[] = ['黏土', '粉质黏土', '粉土', '砂', '砂砾', '灰岩', '砂岩'];

export const LANDUSE_OPTIONS: LandUse[] = ['林地', '草地', '耕地', '建设用地', '工业区', '垃圾填埋场'];

export type RiskLevel = '极低' | '低' | '中等' | '高' | '极高';

export const RISK_SCORES_MAP: Record<string, number> = { '极低': 1, '低': 2, '中等': 3, '高': 4, '极高': 5 };

export const LANDUSE_FACTOR_MAP: Record<string, number> = { '林地': 0.7, '草地': 0.8, '耕地': 1.2, '建设用地': 1.5, '工业区': 2.0, '垃圾填埋场': 2.5 };
