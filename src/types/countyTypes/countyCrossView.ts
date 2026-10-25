/**
 * 拆分自 types/county.ts — CountyCrossView 类型
 */

// ── CountyCrossView 类型 ──

export interface CitySummaryItem {
  city: string;
  countyCount: number;
  totalUse: number;
  totalGw: number;
  gwRatio: number;
  totalAgri: number;
  totalIndustry: number;
  totalDomestic: number;
  totalEco: number;
  agriRatio: number;
}

export interface CrossCityItem {
  city: string;
  county: string;
  totalUse: number;
  gwUse: number;
  agri: number;
  industry: number;
  domestic: number;
  eco: number;
  gwRatio: number;
  agriRatio: number;
  precip: number | null;
}

export interface CityDistributionItem {
  city: string;
  minAgri: number;
  maxAgri: number;
  avgAgri: number;
  minGw: number;
  maxGw: number;
  avgGw: number;
  avgPrecip: number;
  minPrecip: number;
  maxPrecip: number;
  countyCount: number;
}

export interface ScatterByCityItem {
  city: string;
  color: string;
  data: Array<{ x: number; y: number; z: number; county: string; cityName: string }>;
}
