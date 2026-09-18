/**
 * 地热资源计算 (G-17) — 物理常量与标准数据
 * 拆分自 geothermalCalculator.ts：物理常量/岩性物性/预设地热田/回收率表
 */

import type {
  GeothermalFieldPreset,
  RecoveryFactorRef,
  RockProperty,
  RockType,
} from './geothermalTypes';
export const RHO_WATER = 1000;
/** 水的比热容 (kJ/(kg·°C)) */
export const C_WATER = 4.18;
/** 热功换算系数 1 kWh = 3600 kJ */
export const KJ_TO_KWH = 1 / 3600;
/** 标煤热值 (kJ/kg) */
export const COAL_HEAT_VALUE = 29307;

// ============================================================
// 岩性物性表
// ============================================================
export const ROCK_PROPERTIES: Record<RockType, RockProperty> = {
  sandstone: { type: '砂岩', density: 2650, specificHeat: 0.92, thermalConductivity: 2.5, typicalSetting: '孔隙型热储，华北平原馆陶组/明化镇组' },
  limestone: { type: '灰岩', density: 2700, specificHeat: 0.84, thermalConductivity: 2.8, typicalSetting: '岩溶裂隙型热储，蓟县系雾迷山组' },
  basalt: { type: '玄武岩', density: 2900, specificHeat: 0.88, thermalConductivity: 2.0, typicalSetting: '裂隙型热储，新生代火山岩' },
  granite: { type: '花岗岩', density: 2650, specificHeat: 0.79, thermalConductivity: 3.2, typicalSetting: '裂隙型热储，基底岩体' },
  conglomerate: { type: '砾岩', density: 2600, specificHeat: 0.90, thermalConductivity: 2.3, typicalSetting: '孔隙型热储，冲积扇相' },
};

// ============================================================
// 预设地热田
// ============================================================
export const PRESET_FIELDS: GeothermalFieldPreset[] = [
  { name: '雄县地热田', location: '保定雄县', area: 320, reservoirThickness: 350, reservoirTemp: 82, referenceTemp: 25, porosity: 0.05, rockType: 'limestone', yield: 2400, wellheadTemp: 78, gradient: 3.8, status: '规模化开发' },
  { name: '牛驼镇地热田', location: '廊坊固安', area: 280, reservoirThickness: 280, reservoirTemp: 75, referenceTemp: 25, porosity: 0.04, rockType: 'limestone', yield: 1800, wellheadTemp: 72, gradient: 3.5, status: '开发利用' },
  { name: '容城地热田', location: '保定容城', area: 195, reservoirThickness: 300, reservoirTemp: 78, referenceTemp: 25, porosity: 0.05, rockType: 'limestone', yield: 2000, wellheadTemp: 75, gradient: 3.6, status: '规模化开发' },
  { name: '河间地热田', location: '沧州河间', area: 350, reservoirThickness: 200, reservoirTemp: 65, referenceTemp: 25, porosity: 0.08, rockType: 'sandstone', yield: 1500, wellheadTemp: 62, gradient: 3.2, status: '开发利用' },
  { name: '辛集地热田', location: '石家庄辛集', area: 220, reservoirThickness: 220, reservoirTemp: 60, referenceTemp: 25, porosity: 0.10, rockType: 'sandstone', yield: 1200, wellheadTemp: 58, gradient: 3.0, status: '勘查阶段' },
  { name: '深州地热田', location: '衡水深州', area: 280, reservoirThickness: 250, reservoirTemp: 68, referenceTemp: 25, porosity: 0.07, rockType: 'sandstone', yield: 1600, wellheadTemp: 65, gradient: 3.3, status: '开发利用' },
  { name: '武清地热田', location: '天津武清(冀域)', area: 180, reservoirThickness: 320, reservoirTemp: 85, referenceTemp: 25, porosity: 0.06, rockType: 'limestone', yield: 2200, wellheadTemp: 80, gradient: 4.0, status: '规模化开发' },
  { name: '冀东地热田', location: '唐山曹妃甸', area: 250, reservoirThickness: 260, reservoirTemp: 72, referenceTemp: 25, porosity: 0.08, rockType: 'sandstone', yield: 1700, wellheadTemp: 68, gradient: 3.4, status: '开发利用' },
];

// ============================================================
// 回收率参考表
// ============================================================
export const RECOVERY_FACTOR_TABLE: RecoveryFactorRef[] = [
  { reservoirType: '孔隙型（砂岩）', range: '0.10~0.20', recommended: 0.15, condition: '孔隙发育，渗透性中等' },
  { reservoirType: '裂隙型（灰岩）', range: '0.15~0.25', recommended: 0.20, condition: '裂隙发育，连通性好' },
  { reservoirType: '岩溶型', range: '0.20~0.30', recommended: 0.25, condition: '岩溶发育，储水性强' },
  { reservoirType: '低孔低渗型', range: '0.05~0.10', recommended: 0.08, condition: '致密层，连通性差' },
  { reservoirType: '高回灌率型', range: '0.25~0.40', recommended: 0.30, condition: '回灌率>80%，可持续开发' },
];

// ═══════════════════════════════════════════════════════
// 核心计算函数
// ═══════════════════════════════════════════════════════

/**
 * 热储法储量计算
 * V = F × M (面积×厚度)
 * Q = [ρw·cw·φ + ρr·cr·(1-φ)] × V × (T - T0)
 * 其中φ为孔隙度，w为水，r为岩石
 */
