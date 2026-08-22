/**
 * B-35 地下水数值模拟 — 预设模型区域/观测点/情景（自 numericalFlowSimulator 拆分）
 */
import type { ObservationPoint, AquiferType, BoundaryType, PumpingWell } from './numericalFlowTypes';

export const PRESET_MODEL_AREAS = [
  {
    id: 'taihang-piedmont',
    name: '太行山前冲洪积扇（保定平原）',
    description: '第四系松散岩类孔隙水，冲洪积扇中上部，含水层厚30-80m',
    grid: { rows: 20, cols: 25, cellSize: 500 },
    aquifer: {
      type: 'unconfined' as AquiferType,
      kx: 25, ky: 20, thickness: 45,
      specificYield: 0.18, specificStorage: 1e-5,
      porosity: 0.28, rechargeRate: 120,
    },
    boundary: {
      north: 'fixed-head' as BoundaryType, northValue: 45,
      south: 'fixed-head' as BoundaryType, southValue: 28,
      east: 'no-flow' as BoundaryType,
      west: 'no-flow' as BoundaryType,
    },
    initialHead: 36,
    wells: [
      { row: 10, col: 8, rate: -800, label: '水源地A' },
      { row: 12, col: 14, rate: -600, label: '水源地B' },
      { row: 8, col: 18, rate: -500, label: '水源地C' },
    ] as PumpingWell[],
  },
  {
    id: 'hebei-plain-central',
    name: '河北平原中部（衡水深层水）',
    description: '深层承压水，第三系明化镇组，含水层厚60-120m，超采严重',
    grid: { rows: 18, cols: 22, cellSize: 800 },
    aquifer: {
      type: 'confined' as AquiferType,
      kx: 8, ky: 6, thickness: 85,
      specificYield: 0.0001, specificStorage: 5e-6,
      porosity: 0.22, rechargeRate: 5,
    },
    boundary: {
      north: 'fixed-head' as BoundaryType, northValue: 0,
      south: 'no-flow' as BoundaryType,
      east: 'no-flow' as BoundaryType,
      west: 'fixed-head' as BoundaryType, westValue: -5,
    },
    initialHead: -15,
    wells: [
      { row: 9, col: 10, rate: -2000, label: '集中开采区' },
      { row: 6, col: 5, rate: -1200, label: '工业水源' },
      { row: 12, col: 16, rate: -1500, label: '农业水源' },
    ] as PumpingWell[],
  },
  {
    id: 'coastal-cangzhou',
    name: '滨海平原（沧州沿海）',
    description: '浅层微咸水-咸水，海侵风险区，含水层厚15-40m',
    grid: { rows: 15, cols: 20, cellSize: 600 },
    aquifer: {
      type: 'unconfined' as AquiferType,
      kx: 5, ky: 4, thickness: 25,
      specificYield: 0.12, specificStorage: 1e-5,
      porosity: 0.35, rechargeRate: 80,
    },
    boundary: {
      north: 'no-flow' as BoundaryType,
      south: 'fixed-head' as BoundaryType, southValue: 2,
      east: 'fixed-head' as BoundaryType, eastValue: 0,
      west: 'no-flow' as BoundaryType,
    },
    initialHead: 3,
    wells: [
      { row: 7, col: 10, rate: -400, label: '渔区供水' },
    ] as PumpingWell[],
  },
  {
    id: 'karst-baoding-west',
    name: '岩溶山区（保定西部涞源）',
    description: '碳酸盐岩裂隙溶洞水，非均质性强，泉域系统',
    grid: { rows: 16, cols: 18, cellSize: 400 },
    aquifer: {
      type: 'confined' as AquiferType,
      kx: 15, ky: 10, thickness: 60,
      specificYield: 0.05, specificStorage: 1e-5,
      porosity: 0.08, rechargeRate: 200,
    },
    boundary: {
      north: 'no-flow' as BoundaryType,
      south: 'fixed-head' as BoundaryType, southValue: 520,
      east: 'no-flow' as BoundaryType,
      west: 'no-flow' as BoundaryType,
    },
    initialHead: 540,
    wells: [
      { row: 8, col: 9, rate: -300, label: '岩溶水源' },
    ] as PumpingWell[],
  },
  {
    id: 'zhangbei-basin',
    name: '坝上高原（张家口张北盆地）',
    description: '内陆闭流盆地，浅层地下水，蒸发排泄为主',
    grid: { rows: 14, cols: 16, cellSize: 500 },
    aquifer: {
      type: 'unconfined' as AquiferType,
      kx: 10, ky: 8, thickness: 20,
      specificYield: 0.15, specificStorage: 1e-5,
      porosity: 0.30, rechargeRate: 60,
    },
    boundary: {
      north: 'no-flow' as BoundaryType,
      south: 'no-flow' as BoundaryType,
      east: 'no-flow' as BoundaryType,
      west: 'no-flow' as BoundaryType,
    },
    initialHead: 1380,
    wells: [
      { row: 7, col: 8, rate: -300, label: '农业井' },
    ] as PumpingWell[],
  },
  {
    id: 'handan-east',
    name: '邯郸东部平原（黑龙江港流域）',
    description: '浅层咸水与深层淡水叠置，超采漏斗区',
    grid: { rows: 18, cols: 20, cellSize: 700 },
    aquifer: {
      type: 'confined' as AquiferType,
      kx: 6, ky: 5, thickness: 50,
      specificYield: 0.0001, specificStorage: 8e-6,
      porosity: 0.25, rechargeRate: 10,
    },
    boundary: {
      north: 'fixed-head' as BoundaryType, northValue: 30,
      south: 'no-flow' as BoundaryType,
      east: 'no-flow' as BoundaryType,
      west: 'fixed-head' as BoundaryType, westValue: 32,
    },
    initialHead: 25,
    wells: [
      { row: 9, col: 10, rate: -1800, label: '漏斗中心' },
      { row: 6, col: 6, rate: -800, label: '工业井' },
    ] as PumpingWell[],
  },
] as const;

export const PRESET_OBSERVATION_POINTS: Record<string, ObservationPoint[]> = {
  'taihang-piedmont': [
    { row: 5, col: 5, observedHead: 42, label: '观测井OW-01' },
    { row: 8, col: 10, observedHead: 38, label: '观测井OW-02' },
    { row: 12, col: 15, observedHead: 33, label: '观测井OW-03' },
    { row: 15, col: 20, observedHead: 30, label: '观测井OW-04' },
    { row: 10, col: 8, observedHead: 35, label: '水源地A' },
  ],
  'hebei-plain-central': [
    { row: 4, col: 5, observedHead: -8, label: '深层观测井DW-01' },
    { row: 9, col: 10, observedHead: -22, label: '漏斗中心DW-02' },
    { row: 14, col: 15, observedHead: -12, label: '深层观测井DW-03' },
  ],
  'coastal-cangzhou': [
    { row: 3, col: 5, observedHead: 4, label: '沿海监测井CW-01' },
    { row: 7, col: 10, observedHead: 2, label: '开采井CW-02' },
    { row: 12, col: 15, observedHead: 1, label: '近海井CW-03' },
  ],
  'karst-baoding-west': [
    { row: 4, col: 5, observedHead: 545, label: '岩溶泉KA-01' },
    { row: 8, col: 9, observedHead: 538, label: '开采井KA-02' },
    { row: 12, col: 13, observedHead: 528, label: '观测孔KA-03' },
  ],
  'zhangbei-basin': [
    { row: 3, col: 4, observedHead: 1382, label: '盆地北ZB-01' },
    { row: 7, col: 8, observedHead: 1378, label: '开采井ZB-02' },
    { row: 11, col: 12, observedHead: 1375, label: '盆地南ZB-03' },
  ],
  'handan-east': [
    { row: 4, col: 5, observedHead: 28, label: '上游井HD-01' },
    { row: 9, col: 10, observedHead: 18, label: '漏斗中心HD-02' },
    { row: 14, col: 15, observedHead: 23, label: '下游井HD-03' },
  ],
};

export const PRESET_SCENARIOS = [
  {
    name: '现状开采',
    description: '维持当前开采量不变',
    wellMultiplier: 1.0,
    rechargeMultiplier: 1.0,
  },
  {
    name: '增量开采(+50%)',
    description: '开采量增加50%',
    wellMultiplier: 1.5,
    rechargeMultiplier: 1.0,
  },
  {
    name: '压采(-30%)',
    description: '开采量减少30%',
    wellMultiplier: 0.7,
    rechargeMultiplier: 1.0,
  },
  {
    name: '压采+丰水年',
    description: '开采量减少30%且补给增加50%',
    wellMultiplier: 0.7,
    rechargeMultiplier: 1.5,
  },
  {
    name: '全面禁采',
    description: '关闭所有开采井',
    wellMultiplier: 0.0,
    rechargeMultiplier: 1.0,
  },
] as const;

// ── 辅助函数 ──

/** 水头矩阵转热力图数据 */
