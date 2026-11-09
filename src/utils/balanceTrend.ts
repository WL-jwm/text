/**
 * 拆分自 balanceCalculator.ts — 开采量历史趋势数据与汇总
 */

// ── 开采量历史趋势数据 ──

/** 河北省地下水开采量年度数据（亿m³） */
export interface ExtractionTrendPoint {
  year: number;
  /** 总开采量（浅层+深层） */
  totalExtraction: number;
  /** 浅层水开采量 */
  shallowExtraction: number;
  /** 深层水开采量 */
  deepExtraction: number;
  /** 农业灌溉占比 */
  agriRatio: number;
  /** 工业占比 */
  industrialRatio: number;
  /** 生活占比 */
  domesticRatio: number;
  /** 生态占比 */
  ecologicalRatio: number;
}

/**
 * 河北省地下水开采量历史趋势（2000-2024）
 * 数据来源：河北省水资源公报、中国水资源公报
 * 单位：亿m³
 */
export const EXTRACTION_TREND: ExtractionTrendPoint[] = [
  { year: 2000, totalExtraction: 165.6, shallowExtraction: 114.2, deepExtraction: 51.4, agriRatio: 0.76, industrialRatio: 0.12, domesticRatio: 0.11, ecologicalRatio: 0.01 },
  { year: 2001, totalExtraction: 167.8, shallowExtraction: 115.0, deepExtraction: 52.8, agriRatio: 0.77, industrialRatio: 0.11, domesticRatio: 0.11, ecologicalRatio: 0.01 },
  { year: 2002, totalExtraction: 169.5, shallowExtraction: 115.8, deepExtraction: 53.7, agriRatio: 0.77, industrialRatio: 0.11, domesticRatio: 0.11, ecologicalRatio: 0.01 },
  { year: 2003, totalExtraction: 170.2, shallowExtraction: 116.5, deepExtraction: 53.7, agriRatio: 0.77, industrialRatio: 0.11, domesticRatio: 0.11, ecologicalRatio: 0.01 },
  { year: 2004, totalExtraction: 168.9, shallowExtraction: 115.6, deepExtraction: 53.3, agriRatio: 0.76, industrialRatio: 0.12, domesticRatio: 0.11, ecologicalRatio: 0.01 },
  { year: 2005, totalExtraction: 166.5, shallowExtraction: 113.8, deepExtraction: 52.7, agriRatio: 0.76, industrialRatio: 0.12, domesticRatio: 0.11, ecologicalRatio: 0.01 },
  { year: 2006, totalExtraction: 164.2, shallowExtraction: 112.1, deepExtraction: 52.1, agriRatio: 0.75, industrialRatio: 0.12, domesticRatio: 0.12, ecologicalRatio: 0.01 },
  { year: 2007, totalExtraction: 162.8, shallowExtraction: 111.5, deepExtraction: 51.3, agriRatio: 0.75, industrialRatio: 0.12, domesticRatio: 0.12, ecologicalRatio: 0.01 },
  { year: 2008, totalExtraction: 160.5, shallowExtraction: 110.2, deepExtraction: 50.3, agriRatio: 0.74, industrialRatio: 0.12, domesticRatio: 0.12, ecologicalRatio: 0.02 },
  { year: 2009, totalExtraction: 158.3, shallowExtraction: 109.0, deepExtraction: 49.3, agriRatio: 0.74, industrialRatio: 0.12, domesticRatio: 0.12, ecologicalRatio: 0.02 },
  { year: 2010, totalExtraction: 155.8, shallowExtraction: 107.5, deepExtraction: 48.3, agriRatio: 0.73, industrialRatio: 0.12, domesticRatio: 0.13, ecologicalRatio: 0.02 },
  { year: 2011, totalExtraction: 152.6, shallowExtraction: 105.3, deepExtraction: 47.3, agriRatio: 0.72, industrialRatio: 0.12, domesticRatio: 0.13, ecologicalRatio: 0.03 },
  { year: 2012, totalExtraction: 149.5, shallowExtraction: 103.5, deepExtraction: 46.0, agriRatio: 0.72, industrialRatio: 0.12, domesticRatio: 0.13, ecologicalRatio: 0.03 },
  { year: 2013, totalExtraction: 146.2, shallowExtraction: 101.8, deepExtraction: 44.4, agriRatio: 0.71, industrialRatio: 0.12, domesticRatio: 0.14, ecologicalRatio: 0.03 },
  { year: 2014, totalExtraction: 143.5, shallowExtraction: 100.2, deepExtraction: 43.3, agriRatio: 0.71, industrialRatio: 0.12, domesticRatio: 0.14, ecologicalRatio: 0.03 },
  { year: 2015, totalExtraction: 139.8, shallowExtraction: 98.0, deepExtraction: 41.8, agriRatio: 0.70, industrialRatio: 0.11, domesticRatio: 0.15, ecologicalRatio: 0.04 },
  { year: 2016, totalExtraction: 136.5, shallowExtraction: 96.0, deepExtraction: 40.5, agriRatio: 0.69, industrialRatio: 0.11, domesticRatio: 0.15, ecologicalRatio: 0.05 },
  { year: 2017, totalExtraction: 132.8, shallowExtraction: 93.8, deepExtraction: 39.0, agriRatio: 0.68, industrialRatio: 0.11, domesticRatio: 0.15, ecologicalRatio: 0.06 },
  { year: 2018, totalExtraction: 128.5, shallowExtraction: 91.2, deepExtraction: 37.3, agriRatio: 0.67, industrialRatio: 0.11, domesticRatio: 0.16, ecologicalRatio: 0.06 },
  { year: 2019, totalExtraction: 124.6, shallowExtraction: 88.8, deepExtraction: 35.8, agriRatio: 0.66, industrialRatio: 0.10, domesticRatio: 0.16, ecologicalRatio: 0.08 },
  { year: 2020, totalExtraction: 121.3, shallowExtraction: 86.5, deepExtraction: 34.8, agriRatio: 0.65, industrialRatio: 0.10, domesticRatio: 0.17, ecologicalRatio: 0.08 },
  { year: 2021, totalExtraction: 117.2, shallowExtraction: 84.0, deepExtraction: 33.2, agriRatio: 0.64, industrialRatio: 0.10, domesticRatio: 0.17, ecologicalRatio: 0.09 },
  { year: 2022, totalExtraction: 113.5, shallowExtraction: 81.8, deepExtraction: 31.7, agriRatio: 0.63, industrialRatio: 0.10, domesticRatio: 0.17, ecologicalRatio: 0.10 },
  { year: 2023, totalExtraction: 110.2, shallowExtraction: 79.5, deepExtraction: 30.7, agriRatio: 0.62, industrialRatio: 0.09, domesticRatio: 0.18, ecologicalRatio: 0.11 },
  { year: 2024, totalExtraction: 107.8, shallowExtraction: 77.5, deepExtraction: 30.3, agriRatio: 0.61, industrialRatio: 0.09, domesticRatio: 0.18, ecologicalRatio: 0.12 },
];

/** 计算开采量趋势统计 */
export function calcExtractionTrendSummary(data: ExtractionTrendPoint[]): {
  peakYear: number;
  peakValue: number;
  latestYear: number;
  latestValue: number;
  totalReduction: number;
  reductionRate: number;
  avgAnnualReduction: number;
  shallowReduction: number;
  deepReduction: number;
} {
  if (data.length === 0) {
    return { peakYear: 0, peakValue: 0, latestYear: 0, latestValue: 0, totalReduction: 0, reductionRate: 0, avgAnnualReduction: 0, shallowReduction: 0, deepReduction: 0 };
  }
  const peak = data.reduce((a, b) => b.totalExtraction > a.totalExtraction ? b : a);
  const latest = data[data.length - 1];
  const totalReduction = peak.totalExtraction - latest.totalExtraction;
  return {
    peakYear: peak.year,
    peakValue: peak.totalExtraction,
    latestYear: latest.year,
    latestValue: latest.totalExtraction,
    totalReduction,
    reductionRate: peak.totalExtraction > 0 ? totalReduction / peak.totalExtraction : 0,
    avgAnnualReduction: data.length > 1 ? totalReduction / (data.length - 1) : 0,
    shallowReduction: peak.shallowExtraction - latest.shallowExtraction,
    deepReduction: peak.deepExtraction - latest.deepExtraction,
  };
}
