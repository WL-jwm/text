/**
 * 拆分自 subsidenceCalculator.ts — 地面沉降/漏斗类型定义
 */

// 类型定义
// ═══════════════════════════════════════════════════════

export type FlowModel = 'Theis' | 'Dupuit' | '经验公式';

export type SubsidenceRisk = '低' | '中' | '较高' | '高' | '严重';

export interface ConeInput {
  /** 开采量 Q (m³/d) */
  Q: number;
  /** 导水系数 T (m²/d) */
  T: number;
  /** 储水系数 S (无量纲) */
  S: number;
  /** 含水层厚度 M (m) */
  M: number;
  /** 井半径 rw (m) */
  rw: number;
  /** 抽水时间 t (d) */
  t: number;
  /** 渗透系数 K (m/d) */
  K: number;
  /** 计算模型 */
  model: FlowModel;
  /** 影响半径经验系数（仅经验公式） */
  expCoeff?: number;
}

export interface ConeResult {
  /** 井中降深 (m) */
  drawdown: number;
  /** 影响半径 R (m) */
  influenceRadius: number;
  /** 漏斗体积 (m³) */
  coneVolume: number;
  /** 漏斗面积 (km²) */
  coneArea: number;
  /** 各距离降深 */
  drawdownProfile: Array<{ distance: number; drawdown: number }>;
  /** 计算模型说明 */
  modelNote: string;
}

export interface SubsidenceInput {
  /** 含水层厚度 b (m) */
  b: number;
  /** 储水率 Ss (1/m) */
  Ss: number;
  /** 水位降深 Δh (m) */
  deltaH: number;
  /** 孔隙比 e0 */
  e0: number;
  /** 压缩指数 Cc */
  Cc: number;
  /** 初始有效应力 σ0' (kPa) */
  sigma0: number;
  /** 土层数 */
  layerCount: number;
  /** 各土层厚度 (m) */
  layerThicknesses: number[];
  /** 各土层Ss (1/m) */
  layerSs: number[];
  /** 各土层Δh (m) */
  layerDeltaH: number[];
}

export interface SubsidenceResult {
  /** 总沉降量 (mm) */
  totalSubsidence: number;
  /** 各层沉降量 (mm) */
  layerSubsidence: number[];
  /** 分层压缩量 (mm) */
  compression: number;
  /** 沉降风险等级 */
  riskLevel: SubsidenceRisk;
  /** 风险颜色 */
  riskColor: string;
  /** 评估描述 */
  description: string;
}

export interface TrendPoint {
  year: number;
  /** 累计沉降量 (mm) */
  cumulative: number;
  /** 年沉降速率 (mm/a) */
  rate: number;
  /** 是否为预测值 */
  predicted: boolean;
}

export interface RiskZone {
  name: string;
  range: string;
  color: string;
  description: string;
  measure: string;
}
