/**
 * 拆分自 types/county.ts — CountyAnalysisTab 类型
 */

// ── CountyAnalysisTab 类型 ──

export interface CountyAnalysisItem {
  name: string;
  city: string;
  totalUse: number;
  gwUse: number;
  agri: number;
  industry: number;
  domestic: number;
  eco: number;
  precip: number | null;
  gwRatio: number;
  agriRatio: number;
}

export interface CityGwAvgItem {
  name: string;
  '平均地下水占比': number;
}

export interface PrecipUseCorrItem {
  name: string;
  降水: number | null;
  '地下水占比': number;
}

export interface CountyAnalysisStats {
  total: number;
  cities: number;
  totalUse: number;
  avgGwRatio: number;
  totalGwUse: number;
}

export interface CountyAnalysisData {
  stats: CountyAnalysisStats;
  gwDepRank: CountyAnalysisItem[];
  cityGwAvg: CityGwAvgItem[];
  topByUse: CountyAnalysisItem[];
  agriRank: CountyAnalysisItem[];
  precipUseCorr: PrecipUseCorrItem[];
}

export interface IrrigationEfficiencyItem extends CountyAnalysisItem {
  agriUse: number;
  irrigPerMm: string;
}

export interface SelectableCountyItem {
  name: string;
  city: string;
}
