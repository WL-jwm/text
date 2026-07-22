/**
 * B-16 地下水脆弱性评价引擎（DRASTIC模型）
 *
 * 功能：
 *  1. DRASTIC七参数评分系统（Depth/Slope/Aquifer media/Soil/Topography/Impact vadose/Conductivity）
 *  2. 加权综合评分 → 脆弱性等级（低/中/高/极高）
 *  3. 分区评价结果汇总
 *  4. 污染源叠加风险分析
 *  5. 预设区域参数库（河北平原典型水文地质分区）
 */

// ═══════════════════════════════════════════════════════
// 类型定义
// ═══════════════════════════════════════════════════════

export interface DrasticInput {
  /** 评价区名称 */
  name: string;
  /** D — 地下水埋深 (m) */
  depth: number;
  /** R — 净补给量 (mm/a) */
  recharge: number;
  /** A — 含水层介质 (类型代码) */
  aquiferMedia: AquiferMediaType;
  /** S — 土壤介质 (类型代码) */
  soilMedia: SoilMediaType;
  /** T — 地形坡度 (%) */
  topography: number;
  /** I — 非饱和带介质 (类型代码) */
  vadoseMedia: VadoseMediaType;
  /** C — 渗透系数 (m/d) */
  conductivity: number;
}

export type AquiferMediaType = ' massive' | 'karst' | 'sand_gravel' | 'bedded' | 'limestone' | 'sandstone' | 'basalt' | 'schist';

export type SoilMediaType = 'thin_absent' | 'gravel' | 'sand' | 'loam' | 'clay_loam' | 'silt' | 'clay' | 'shrink';

export type VadoseMediaType = 'confining' | 'silt' | 'limestone' | 'sandstone' | 'sand_gravel' | 'metamorphic' | 'karst' | 'basalt';

export interface DrasticParameterResult {
  /** 参数名称 */
  name: string;
  /** 原始值 */
  rawValue: number | string;
  /** 评分 (1~10) */
  rating: number;
  /** 权重 */
  weight: number;
  /** 加权评分 = rating × weight */
  weightedScore: number;
}

export interface DrasticResult {
  name: string;
  /** DRASTIC综合指数 */
  drasticIndex: number;
  /** 脆弱性等级 */
  vulnerability: '低' | '中等' | '高' | '极高';
  /** 各参数详细评分 */
  parameters: DrasticParameterResult[];
  /** 评价面积 (km²) — 可选 */
  area?: number;
}

export interface PollutionRiskInput {
  /** 区域名称 */
  name: string;
  /** DRASTIC指数 */
  drasticIndex: number;
  /** 污染源类型 */
  pollutionSource: PollutionSourceType;
  /** 污染源距离 (m) */
  distance: number;
  /** 污染源持续时间 (a) */
  duration: number;
}

export type PollutionSourceType = '工业' | '农业' | '生活' | '垃圾填埋场' | '加油站' | '矿山' | '污水处理';

export interface PollutionRiskResult {
  name: string;
  /** 污染源风险评分 (1~10) */
  sourceRisk: number;
  /** 距离修正系数 */
  distanceFactor: number;
  /** 持续时间修正系数 */
  durationFactor: number;
  /** 综合风险评分 */
  compositeRisk: number;
  /** 风险等级 */
  riskLevel: '低风险' | '中等风险' | '高风险' | '极高风险';
  /** 建议措施 */
  recommendation: string;
}

// ═══════════════════════════════════════════════════════
// DRASTIC权重表（标准DRASTIC权重）
// ═══════════════════════════════════════════════════════

export const DRASTIC_WEIGHTS = {
  D: 5, // 地下水埋深
  R: 4, // 净补给量
  A: 3, // 含水层介质
  S: 2, // 土壤介质
  T: 1, // 地形坡度
  I: 5, // 非饱和带影响
  C: 3, // 渗透系数
} as const;

export const DRASTIC_MAX_INDEX = 10 * (5 + 4 + 3 + 2 + 1 + 5 + 3); // 230

// ═══════════════════════════════════════════════════════
// D — 地下水埋深评分表
// ═══════════════════════════════════════════════════════

export interface DepthRating {
  range: string;
  min: number;
  max: number;
  rating: number;
}

export const DEPTH_RATINGS: DepthRating[] = [
  { range: '0~1.5', min: 0, max: 1.5, rating: 10 },
  { range: '1.5~3.0', min: 1.5, max: 3.0, rating: 9 },
  { range: '3.0~4.5', min: 3.0, max: 4.5, rating: 8 },
  { range: '4.5~9.0', min: 4.5, max: 9.0, rating: 7 },
  { range: '9.0~15.0', min: 9.0, max: 15.0, rating: 5 },
  { range: '15.0~22.5', min: 15.0, max: 22.5, rating: 3 },
  { range: '22.5~30.0', min: 22.5, max: 30.0, rating: 2 },
  { range: '>30.0', min: 30.0, max: Infinity, rating: 1 },
];

// ═══════════════════════════════════════════════════════
// R — 净补给量评分表
// ═══════════════════════════════════════════════════════

export const RECHARGE_RATINGS: DepthRating[] = [
  { range: '0~50', min: 0, max: 50, rating: 1 },
  { range: '50~100', min: 50, max: 100, rating: 3 },
  { range: '100~178', min: 100, max: 178, rating: 6 },
  { range: '178~254', min: 178, max: 254, rating: 8 },
  { range: '>254', min: 254, max: Infinity, rating: 9 },
];

// ═══════════════════════════════════════════════════════
// A — 含水层介质评分表
// ═══════════════════════════════════════════════════════

export const AQUIFER_MEDIA_RATINGS: Record<AquiferMediaType, { label: string; rating: number; typical: string }> = {
  ' massive': { label: '块状页岩/变质岩', rating: 2, typical: '低渗透，裂隙不发育' },
  'karst': { label: '岩溶灰岩', rating: 10, typical: '岩溶发育，渗透性极强' },
  'sand_gravel': { label: '砂砾石', rating: 8, typical: '冲洪积扇主流相' },
  'bedded': { label: '层状砂岩/灰岩', rating: 6, typical: '层间裂隙中等发育' },
  'limestone': { label: '灰岩/白云岩', rating: 7, typical: '裂隙发育中等' },
  'sandstone': { label: '砂岩', rating: 6, typical: '孔隙-裂隙含水层' },
  'basalt': { label: '玄武岩', rating: 9, typical: '柱状节理发育' },
  'schist': { label: '片岩', rating: 3, typical: '低渗透变质岩' },
};

// ═══════════════════════════════════════════════════════
// S — 土壤介质评分表
// ═══════════════════════════════════════════════════════

export const SOIL_MEDIA_RATINGS: Record<SoilMediaType, { label: string; rating: number }> = {
  'thin_absent': { label: '薄层/缺失', rating: 10 },
  'gravel': { label: '砾石', rating: 10 },
  'sand': { label: '砂土', rating: 9 },
  'loam': { label: '壤土', rating: 5 },
  'clay_loam': { label: '粘壤土', rating: 3 },
  'silt': { label: '粉砂土', rating: 6 },
  'clay': { label: '粘土', rating: 2 },
  'shrink': { label: '胀缩粘土', rating: 1 },
};

// ═══════════════════════════════════════════════════════
// T — 地形坡度评分表
// ═══════════════════════════════════════════════════════

export const TOPOGRAPHY_RATINGS: DepthRating[] = [
  { range: '0~2', min: 0, max: 2, rating: 10 },
  { range: '2~6', min: 2, max: 6, rating: 9 },
  { range: '6~12', min: 6, max: 12, rating: 5 },
  { range: '12~18', min: 12, max: 18, rating: 3 },
  { range: '>18', min: 18, max: Infinity, rating: 1 },
];

// ═══════════════════════════════════════════════════════
// I — 非饱和带介质评分表
// ═══════════════════════════════════════════════════════

export const VADOSE_MEDIA_RATINGS: Record<VadoseMediaType, { label: string; rating: number }> = {
  'confining': { label: '隔水层/承压', rating: 1 },
  'silt': { label: '粉砂', rating: 3 },
  'limestone': { label: '灰岩', rating: 6 },
  'sandstone': { label: '砂岩', rating: 6 },
  'sand_gravel': { label: '砂砾石', rating: 8 },
  'metamorphic': { label: '变质岩', rating: 4 },
  'karst': { label: '岩溶', rating: 9 },
  'basalt': { label: '玄武岩', rating: 9 },
};

// ═══════════════════════════════════════════════════════
// C — 渗透系数评分表
// ═══════════════════════════════════════════════════════

export const CONDUCTIVITY_RATINGS: DepthRating[] = [
  { range: '0~4.1', min: 0, max: 4.1, rating: 1 },
  { range: '4.1~12.3', min: 4.1, max: 12.3, rating: 2 },
  { range: '12.3~28.7', min: 12.3, max: 28.7, rating: 4 },
  { range: '28.7~41.0', min: 28.7, max: 41.0, rating: 6 },
  { range: '41.0~81.5', min: 41.0, max: 81.5, rating: 8 },
  { range: '>81.5', min: 81.5, max: Infinity, rating: 10 },
];

// ═══════════════════════════════════════════════════════
// 污染源风险评分表
// ═══════════════════════════════════════════════════════

export const POLLUTION_SOURCE_RISK: Record<PollutionSourceType, { rating: number; desc: string }> = {
  '工业': { rating: 8, desc: '工业废水/重金属/有机溶剂' },
  '农业': { rating: 6, desc: '化肥/农药/畜禽粪便' },
  '生活': { rating: 5, desc: '生活污水/化粪池渗漏' },
  '垃圾填埋场': { rating: 9, desc: '渗滤液含多种污染物' },
  '加油站': { rating: 7, desc: '石油烃/MTBE等' },
  '矿山': { rating: 8, desc: '酸性矿山排水/重金属' },
  '污水处理': { rating: 6, desc: '处理不达标/管道渗漏' },
};

// ═══════════════════════════════════════════════════════
// 核心计算函数
// ═══════════════════════════════════════════════════════

function getRatingFromTable(value: number, table: DepthRating[]): number {
  for (const row of table) {
    if (value >= row.min && value < row.max) return row.rating;
  }
  return 1;
}

function getVulnerabilityLevel(index: number): DrasticResult['vulnerability'] {
  if (index < 100) return '低';
  if (index < 150) return '中等';
  if (index < 180) return '高';
  return '极高';
}

/**
 * DRASTIC综合评价
 */
export function calcDrastic(input: DrasticInput): DrasticResult {
  const dRating = getRatingFromTable(input.depth, DEPTH_RATINGS);
  const rRating = getRatingFromTable(input.recharge, RECHARGE_RATINGS);
  const aInfo = AQUIFER_MEDIA_RATINGS[input.aquiferMedia];
  const sInfo = SOIL_MEDIA_RATINGS[input.soilMedia];
  const tRating = getRatingFromTable(input.topography, TOPOGRAPHY_RATINGS);
  const iInfo = VADOSE_MEDIA_RATINGS[input.vadoseMedia];
  const cRating = getRatingFromTable(input.conductivity, CONDUCTIVITY_RATINGS);

  const parameters: DrasticParameterResult[] = [
    { name: 'D 地下水埋深', rawValue: `${input.depth} m`, rating: dRating, weight: DRASTIC_WEIGHTS.D, weightedScore: dRating * DRASTIC_WEIGHTS.D },
    { name: 'R 净补给量', rawValue: `${input.recharge} mm/a`, rating: rRating, weight: DRASTIC_WEIGHTS.R, weightedScore: rRating * DRASTIC_WEIGHTS.R },
    { name: 'A 含水层介质', rawValue: aInfo.label, rating: aInfo.rating, weight: DRASTIC_WEIGHTS.A, weightedScore: aInfo.rating * DRASTIC_WEIGHTS.A },
    { name: 'S 土壤介质', rawValue: sInfo.label, rating: sInfo.rating, weight: DRASTIC_WEIGHTS.S, weightedScore: sInfo.rating * DRASTIC_WEIGHTS.S },
    { name: 'T 地形坡度', rawValue: `${input.topography} %`, rating: tRating, weight: DRASTIC_WEIGHTS.T, weightedScore: tRating * DRASTIC_WEIGHTS.T },
    { name: 'I 非饱和带', rawValue: iInfo.label, rating: iInfo.rating, weight: DRASTIC_WEIGHTS.I, weightedScore: iInfo.rating * DRASTIC_WEIGHTS.I },
    { name: 'C 渗透系数', rawValue: `${input.conductivity} m/d`, rating: cRating, weight: DRASTIC_WEIGHTS.C, weightedScore: cRating * DRASTIC_WEIGHTS.C },
  ];

  const drasticIndex = parameters.reduce((sum, p) => sum + p.weightedScore, 0);
  const vulnerability = getVulnerabilityLevel(drasticIndex);

  return { name: input.name, drasticIndex, vulnerability, parameters };
}

/**
 * 污染源叠加风险分析
 */
export function calcPollutionRisk(input: PollutionRiskInput): PollutionRiskResult {
  const sourceInfo = POLLUTION_SOURCE_RISK[input.pollutionSource];

  // 距离修正：近距离放大风险
  let distanceFactor: number;
  if (input.distance < 100) distanceFactor = 1.5;
  else if (input.distance < 500) distanceFactor = 1.2;
  else if (input.distance < 1000) distanceFactor = 1.0;
  else if (input.distance < 2000) distanceFactor = 0.7;
  else distanceFactor = 0.4;

  // 持续时间修正：长期污染源风险更高
  let durationFactor: number;
  if (input.duration < 1) durationFactor = 0.6;
  else if (input.duration < 5) durationFactor = 0.8;
  else if (input.duration < 10) durationFactor = 1.0;
  else if (input.duration < 20) durationFactor = 1.2;
  else durationFactor = 1.5;

  // DRASTIC脆弱性修正（0~1）
  const vulnerabilityFactor = Math.min(1, input.drasticIndex / 200);

  // 综合风险 = 污染源风险 × 距离修正 × 时间修正 × 脆弱性修正
  const compositeRisk = Math.min(10, Math.round(
    sourceInfo.rating * distanceFactor * durationFactor * (0.5 + 0.5 * vulnerabilityFactor) * 10
  ) / 10);

  let riskLevel: PollutionRiskResult['riskLevel'];
  let recommendation: string;

  if (compositeRisk < 3) {
    riskLevel = '低风险';
    recommendation = '定期监测水质，保持现有防护措施';
  } else if (compositeRisk < 5) {
    riskLevel = '中等风险';
    recommendation = '加强监测频率，设置预警指标，制定应急预案';
  } else if (compositeRisk < 7.5) {
    riskLevel = '高风险';
    recommendation = '立即采取防护措施，加密监测井网，污染源截渗处理';
  } else {
    riskLevel = '极高风险';
    recommendation = '紧急启动地下水修复工程，关闭或迁移污染源，建立健康监测';
  }

  return {
    name: input.name,
    sourceRisk: sourceInfo.rating,
    distanceFactor,
    durationFactor,
    compositeRisk,
    riskLevel,
    recommendation,
  };
}

// ═══════════════════════════════════════════════════════
// 河北平原典型分区预设参数
// ═══════════════════════════════════════════════════════

export interface DrasticPresetZone {
  name: string;
  region: string;
  depth: number;
  recharge: number;
  aquiferMedia: AquiferMediaType;
  soilMedia: SoilMediaType;
  topography: number;
  vadoseMedia: VadoseMediaType;
  conductivity: number;
  area: number;
  note: string;
}

export const PRESET_ZONES: DrasticPresetZone[] = [
  {
    name: '山前冲洪积扇顶部',
    region: '保定-石家庄山前',
    depth: 8, recharge: 220, aquiferMedia: 'sand_gravel', soilMedia: 'gravel',
    topography: 3, vadoseMedia: 'sand_gravel', conductivity: 65, area: 3200,
    note: '含水层渗透性强，脆弱性高',
  },
  {
    name: '冲洪积扇前缘',
    region: '邢台-邯郸中部',
    depth: 5, recharge: 180, aquiferMedia: 'sand_gravel', soilMedia: 'loam',
    topography: 1, vadoseMedia: 'sand_gravel', conductivity: 35, area: 4500,
    note: '含水层较厚，过渡带',
  },
  {
    name: '冲积平原中部',
    region: '衡水-沧州中部',
    depth: 6, recharge: 130, aquiferMedia: 'bedded', soilMedia: 'clay_loam',
    topography: 0.5, vadoseMedia: 'silt', conductivity: 15, area: 8800,
    note: '多层结构，粘性土层发育',
  },
  {
    name: '滨海平原',
    region: '沧州东部-唐山南部',
    depth: 3, recharge: 90, aquiferMedia: 'bedded', soilMedia: 'clay',
    topography: 0.3, vadoseMedia: 'silt', conductivity: 8, area: 5600,
    note: '粘性土厚层，但埋深浅',
  },
  {
    name: '山间盆地',
    region: '张家口-承德盆地',
    depth: 12, recharge: 160, aquiferMedia: 'sandstone', soilMedia: 'loam',
    topography: 8, vadoseMedia: 'sandstone', conductivity: 20, area: 6500,
    note: '盆地汇水，含水层中等',
  },
  {
    name: '岩溶山区',
    region: '邢台-邯郸西部山区',
    depth: 25, recharge: 140, aquiferMedia: 'karst', soilMedia: 'thin_absent',
    topography: 25, vadoseMedia: 'karst', conductivity: 50, area: 4200,
    note: '岩溶发育，污染快速通道',
  },
  {
    name: '滨海低平原深层水',
    region: '廊坊-沧州深层',
    depth: 30, recharge: 60, aquiferMedia: 'bedded', soilMedia: 'clay',
    topography: 0.5, vadoseMedia: 'confining', conductivity: 5, area: 7800,
    note: '承压水，隔水顶板保护',
  },
  {
    name: '城市建成区',
    region: '石家庄-唐山城区',
    depth: 15, recharge: 110, aquiferMedia: 'sand_gravel', soilMedia: 'thin_absent',
    topography: 1, vadoseMedia: 'sand_gravel', conductivity: 40, area: 1200,
    note: '人工扰动大，地面硬化',
  },
];

/**
 * 批量计算预设分区
 */
export function calcAllPresetZones(): DrasticResult[] {
  return PRESET_ZONES.map(z => {
    const input: DrasticInput = {
      name: z.name,
      depth: z.depth,
      recharge: z.recharge,
      aquiferMedia: z.aquiferMedia,
      soilMedia: z.soilMedia,
      topography: z.topography,
      vadoseMedia: z.vadoseMedia,
      conductivity: z.conductivity,
    };
    const result = calcDrastic(input);
    return { ...result, area: z.area };
  });
}

/**
 * 汇总统计
 */
export function calcDrasticSummary() {
  const results = calcAllPresetZones();
  const totalArea = results.reduce((s, r) => s + (r.area ?? 0), 0);

  const byLevel = {
    '低': results.filter(r => r.vulnerability === '低'),
    '中等': results.filter(r => r.vulnerability === '中等'),
    '高': results.filter(r => r.vulnerability === '高'),
    '极高': results.filter(r => r.vulnerability === '极高'),
  };

  const areaByLevel = {
    '低': byLevel['低'].reduce((s, r) => s + (r.area ?? 0), 0),
    '中等': byLevel['中等'].reduce((s, r) => s + (r.area ?? 0), 0),
    '高': byLevel['高'].reduce((s, r) => s + (r.area ?? 0), 0),
    '极高': byLevel['极高'].reduce((s, r) => s + (r.area ?? 0), 0),
  };

  const avgIndex = results.reduce((s, r) => s + r.drasticIndex, 0) / results.length;
  const maxIndex = Math.max(...results.map(r => r.drasticIndex));
  const minIndex = Math.min(...results.map(r => r.drasticIndex));

  return {
    totalArea,
    areaByLevel,
    avgIndex: Math.round(avgIndex * 10) / 10,
    maxIndex: Math.round(maxIndex * 10) / 10,
    minIndex: Math.round(minIndex * 10) / 10,
    zoneCount: results.length,
    results,
  };
}
