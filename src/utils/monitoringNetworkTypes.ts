/**
 * 监测网优化 — 类型定义（自 monitoringNetworkCalculator 拆分）
 */

export interface MonitoringWell {
  id: string;
  name: string;
  row: number;       // 网格行号
  col: number;       // 网格列号
  x: number;         // 实际x坐标 (m)
  y: number;         // 实际y坐标 (m)
  aquiferType: 'shallow' | 'deep' | 'karst';
  frequency: number;  // 当前监测频率 (次/年)
  startDate: number;  // 监测起始年份
  type: 'national' | 'provincial' | 'municipal' | 'enterprise';
}

export interface MonitoringArea {
  id: string;
  name: string;
  area: number;            // 面积 (km²)
  aquiferType: 'shallow' | 'deep' | 'karst';
  cellSize: number;        // 网格间距 (m)
  rows: number;
  cols: number;
  wells: MonitoringWell[];
  // 监测井水位历史数据（用于频率优化）
  wellHistory?: Record<string, number[]>; // wellId -> 月度水位序列
}

export interface DensityResult {
  area: number;              // 面积 (km²)
  wellCount: number;         // 实际井数
  requiredCount: number;     // 推荐井数
  actualDensity: number;     // 实际密度 (口/km²)
  requiredDensity: number;   // 推荐密度 (口/km²)
  coverageRatio: number;     // 覆盖率 (%)
  gap: number;               // 缺口 (口)
  status: 'excellent' | 'adequate' | 'insufficient' | 'severe';
  message: string;
}

export interface CoverageResult {
  totalArea: number;          // 总面积 (km²)
  coveredArea: number;        // 覆盖面积 (km²)
  uncoveredArea: number;      // 未覆盖面积 (km²)
  coveragePercent: number;    // 覆盖率 (%)
  avgControlArea: number;     // 平均控制面积 (km²/口)
  maxControlArea: number;     // 最大控制面积 (km²/口)
  minControlArea: number;     // 最小控制面积 (km²/口)
  blankZones: { row: number; col: number; x: number; y: number; distance: number }[]; // 覆盖空白
  uniformityIndex: number;    // 均匀度指数 (0~1)
}

export interface FrequencyResult {
  wellId: string;
  wellName: string;
  currentFrequency: number;    // 当前频率 (次/年)
  optimalFrequency: number;    // 推荐频率 (次/年)
  autocorrelationLag1: number; // 一阶自相关系数
  redundancyIndex: number;     // 冗余指数 (0~1)
  nuggetRatio: number;         // 块金效应比
  recommendation: string;
  status: 'optimal' | 'over-sampled' | 'under-sampled';
}

export interface EffectivenessResult {
  totalWells: number;
  totalEntropy: number;        // 总信息熵
  avgEntropy: number;          // 平均信息熵
  redundancyPairs: { wellA: string; wellB: string; correlation: number; redundancy: number }[];
  redundantWells: string[];    // 冗余井列表
  essentialWells: string[];    // 关键井列表
  efficiencyScore: number;     // 监测效率评分 (0~100)
  recommendation: string;
}

export interface ComprehensiveResult {
  density: DensityResult;
  coverage: CoverageResult;
  frequency: FrequencyResult[];
  effectiveness: EffectivenessResult;
  overallScore: number;        // 综合评分 (0~100)
  grade: string;               // 等级 (优/良/中/差)
  suggestions: string[];
}
