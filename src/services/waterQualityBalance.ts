/**
 * H-06 均衡-水质联动分析
 * 整合水均衡和水质评价数据，提供交叉分析与综合视图
 */
import type { CityBalanceResult } from './waterBalance';
import type { CityWaterQualityStats, WaterQualityClass } from './waterQuality';

// ============ 数据模型 ============

/** 城市综合状态（均衡+水质联动） */
export interface CityIntegratedStats {
  /** 城市 */
  city: string;
  /** 均衡数据 */
  balance: CityBalanceResult | null;
  /** 水质数据 */
  quality: CityWaterQualityStats | null;
  /** 综合象限（1:双差, 2:盈余+差水质, 3:超采+好水质, 4:双优, 0:数据不足） */
  quadrant: 0 | 1 | 2 | 3 | 4;
  /** 象限标签 */
  quadrantLabel: string;
  /** 象限颜色 */
  quadrantColor: string;
  /** 综合得分（0-100，越高越好） */
  compositeScore: number;
  /** 建议 */
  suggestion: string;
}

/** 交叉分析统计 */
export interface CrossAnalysisSummary {
  /** 总城市数 */
  totalCities: number;
  /** 双差城市数（超采+水质差） */
  dualPoor: number;
  /** 双优城市数（盈余+水质好） */
  dualGood: number;
  /** 超采但水质好 */
  overdraftGoodQuality: number;
  /** 盈余但水质差 */
  surplusPoorQuality: number;
  /** 综合得分最高城市 */
  bestCity: string | null;
  /** 综合得分最低城市 */
  worstCity: string | null;
  /** 主要超采区水质特征 */
  overdraftQualityPattern: string;
  /** 主要建议 */
  keyRecommendations: string[];
}

/** 城市综合排名项 */
export interface CityRanking {
  rank: number;
  city: string;
  compositeScore: number;
  /** 均衡得分（越高越好） */
  balanceScore: number;
  /** 水质得分（越高越好） */
  qualityScore: number;
  isOverdrafted: boolean;
  qualityClass: WaterQualityClass;
  quadrant: number;
}

/** 综合分析完整结果 */
export interface IntegratedAnalysis {
  /** 城市综合数据 */
  cities: CityIntegratedStats[];
  /** 交叉统计 */
  summary: CrossAnalysisSummary;
  /** 综合排名 */
  ranking: CityRanking[];
  /** 双差城市预警 */
  alertCities: CityIntegratedStats[];
  /** 主要建议 */
  recommendations: string[];
  /** 数据是否充足 */
  hasData: boolean;
}

// ============ 象限配置 ============

const QUADRANT_CONFIG: Record<number, { label: string; color: string; suggestion: string }> = {
  0: { label: '数据不足', color: '#6b7280', suggestion: '补充监测数据' },
  1: { label: '双差·超采+差水质', color: '#ef4444', suggestion: '优先治理，需控采+水质修复' },
  2: { label: '盈余·差水质', color: '#f97316', suggestion: '水质修复为主，控制污染源' },
  3: { label: '超采·好水质', color: '#f59e0b', suggestion: '控采限采，保护水质' },
  4: { label: '双优·盈余+好水质', color: '#10b981', suggestion: '维持现状，加强监测' },
};

// ============ 核心分析引擎 ============

/**
 * 计算城市综合得分（0-100）
 * 均衡得分：balance 盈余为正，亏损为负，映射到0-50
 * 水质得分：平均水质类别映射到0-50（Ⅰ类=50, Ⅴ类=0）
 * 纯函数，可测试
 */
export function calcCompositeScore(
  balance: CityBalanceResult | null,
  quality: CityWaterQualityStats | null,
): number {
  let balanceScore = 25; // 默认中值
  if (balance) {
    // balance 范围 -20~20 亿m³，映射到 0-50
    // 亏损最多 -20 => 0 分，盈余 +20 => 50 分
    const raw = (balance.balance + 20) / 40 * 50;
    balanceScore = Math.max(0, Math.min(50, parseFloat(raw.toFixed(1))));
  }

  let qualityScore = 25; // 默认中值
  if (quality) {
    // 平均水质类别 1~5，映射到 0-50
    // Ⅰ类(1) => 50 分，Ⅴ类(5) => 0 分
    const raw = (5 - quality.averageClass) / 4 * 50;
    qualityScore = Math.max(0, Math.min(50, parseFloat(raw.toFixed(1))));
  }

  return parseFloat((balanceScore + qualityScore).toFixed(1));
}

/**
 * 计算均衡得分（仅均衡维度）
 */
export function calcBalanceScore(balance: CityBalanceResult | null): number {
  if (!balance) return 0;
  const raw = (balance.balance + 20) / 40 * 100;
  return Math.max(0, Math.min(100, parseFloat(raw.toFixed(1))));
}

/**
 * 计算水质得分（仅水质维度）
 */
export function calcQualityScore(quality: CityWaterQualityStats | null): number {
  if (!quality) return 0;
  const raw = (5 - quality.averageClass) / 4 * 100;
  return Math.max(0, Math.min(100, parseFloat(raw.toFixed(1))));
}

/**
 * 判断城市综合象限
 */
export function determineQuadrant(
  balance: CityBalanceResult | null,
  quality: CityWaterQualityStats | null,
): 0 | 1 | 2 | 3 | 4 {
  if (!balance || !quality) return 0;

  const isOverdrafted = balance.isOverdrafted;
  const isPoorQuality = quality.averageClass >= 3.5; // 平均水质 ≥ Ⅳ类

  if (isOverdrafted && isPoorQuality) return 1;  // 双差
  if (!isOverdrafted && isPoorQuality) return 2;  // 盈余+差水质
  if (isOverdrafted && !isPoorQuality) return 3;  // 超采+好水质
  return 4; // 双优
}

/**
 * 生成城市建议
 */
export function generateSuggestion(
  quadrant: number,
  balance: CityBalanceResult | null,
  quality: CityWaterQualityStats | null,
): string {
  if (quadrant === 0) return '补充监测数据';
  if (quadrant === 1) {
    const factors = quality?.mainFactors ?? [];
    const factorStr = factors.length > 0 ? `（主要超标：${factors.slice(0, 3).join('、')}）` : '';
    return `优先治理，需控采+水质修复${factorStr}`;
  }
  if (quadrant === 2) {
    const factors = quality?.mainFactors ?? [];
    const factorStr = factors.length > 0 ? `（主要超标：${factors.slice(0, 3).join('、')}）` : '';
    return `水质修复为主，控制污染源${factorStr}`;
  }
  if (quadrant === 3) {
    return `控采限采，保护水质（当前水质良好，超采 ${Math.abs(balance?.balance ?? 0).toFixed(1)}亿m³）`;
  }
  return '维持现状，加强监测';
}

/**
 * 构建完整综合联动分析
 * 纯函数，可测试
 */
export function buildIntegratedAnalysis(
  cityBalances: CityBalanceResult[],
  qualityCityStats: CityWaterQualityStats[],
): IntegratedAnalysis {
  // 按城市合并
  const cityMap = new Map<string, { balance: CityBalanceResult | null; quality: CityWaterQualityStats | null }>();

  for (const cb of cityBalances) {
    cityMap.set(cb.city, { balance: cb, quality: null });
  }
  for (const qc of qualityCityStats) {
    const existing = cityMap.get(qc.city) ?? { balance: null, quality: null };
    existing.quality = qc;
    cityMap.set(qc.city, existing);
  }

  // 构建综合城市数据
  const cities: CityIntegratedStats[] = [];
  for (const [city, data] of cityMap) {
    const quadrant = determineQuadrant(data.balance, data.quality);
    const config = QUADRANT_CONFIG[quadrant];
    const score = calcCompositeScore(data.balance, data.quality);
    const suggestion = generateSuggestion(quadrant, data.balance, data.quality);

    cities.push({
      city,
      balance: data.balance,
      quality: data.quality,
      quadrant,
      quadrantLabel: config.label,
      quadrantColor: config.color,
      compositeScore: score,
      suggestion,
    });
  }

  // 综合排名
  const ranking: CityRanking[] = cities
    .sort((a, b) => b.compositeScore - a.compositeScore)
    .map((c, i) => ({
      rank: i + 1,
      city: c.city,
      compositeScore: c.compositeScore,
      balanceScore: calcBalanceScore(c.balance),
      qualityScore: calcQualityScore(c.quality),
      isOverdrafted: c.balance?.isOverdrafted ?? false,
      qualityClass: c.quality?.averageClass as WaterQualityClass ?? 3,
      quadrant: c.quadrant,
    }));

  // 交叉统计
  const dualPoor = cities.filter(c => c.quadrant === 1);
  const dualGood = cities.filter(c => c.quadrant === 4);
  const overdraftGood = cities.filter(c => c.quadrant === 3);
  const surplusPoor = cities.filter(c => c.quadrant === 2);

  const bestCity = ranking.length > 0 ? ranking[0].city : null;
  const worstCity = ranking.length > 0 ? ranking[ranking.length - 1].city : null;

  // 超采区水质特征
  const overdraftCities = cities.filter(c => c.balance?.isOverdrafted);
  const overdraftPoorQuality = overdraftCities.filter(c => c.quadrant === 1).length;
  const overdraftQualityPattern = overdraftCities.length > 0
    ? `超采区${overdraftCities.length}市中${overdraftPoorQuality}市水质较差（占比${((overdraftPoorQuality / overdraftCities.length) * 100).toFixed(0)}%）`
    : '无超采城市';

  // 主要建议
  const keyRecommendations: string[] = [];
  if (dualPoor.length > 0) {
    keyRecommendations.push(`优先治理 ${dualPoor.length} 个双差城市（${dualPoor.map(c => c.city).join('、')}）：控采限采+水质修复同步推进`);
  }
  if (surplusPoor.length > 0) {
    keyRecommendations.push(`关注 ${surplusPoor.length} 个盈余但水质差的城市（${surplusPoor.map(c => c.city).join('、')}）：控制污染源`);
  }
  if (overdraftGood.length > 0) {
    keyRecommendations.push(`超采但水质好的 ${overdraftGood.length} 市（${overdraftGood.map(c => c.city).join('、')}）：预防性控采，保护水质`);
  }
  keyRecommendations.push(`综合得分最高: ${bestCity ?? '—'}，最低: ${worstCity ?? '—'}`);

  const hasData = cities.length > 0;

  return {
    cities,
    summary: {
      totalCities: cities.length,
      dualPoor: dualPoor.length,
      dualGood: dualGood.length,
      overdraftGoodQuality: overdraftGood.length,
      surplusPoorQuality: surplusPoor.length,
      bestCity,
      worstCity,
      overdraftQualityPattern,
      keyRecommendations,
    },
    ranking,
    alertCities: dualPoor.sort((a, b) => a.compositeScore - b.compositeScore),
    recommendations: keyRecommendations,
    hasData,
  };
}