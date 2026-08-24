/**
 * 地下水-地表水相互作用 — 类型定义
 */

export type InteractionType = 'gaining' | 'losing' | 'flow-through' | 'perched';

export type RiverSegment = 'upstream' | 'midstream' | 'downstream';


export interface RiverPoint {
  id: string;
  name: string;
  x: number;              // 沿河距离 (km)
  riverStage: number;     // 河水位 (m)
  groundwaterHead: number; // 近岸地下水水位 (m)
  riverbedConductance: number; // 河床导水系数 (m²/d)
  riverbedThickness: number;   // 河床沉积物厚度 (m)
  riverbedK: number;          // 河床渗透系数 (m/d)
  riverWidth: number;         // 河流宽度 (m)
  segment: RiverSegment;
  flowRate: number;           // 河流流量 (m³/s)
  temperature?: { river: number; groundwater: number }; // 温度(℃)
}


export interface BaseflowResult {
  totalRunoff: number;       // 总径流量 (mm)
  baseflow: number;          // 基流量 (mm)
  surfaceRunoff: number;     // 地表径流量 (mm)
  baseflowIndex: number;     // BFI 基流指数 (0~1)
  method: string;            // 使用的方法
  dailySeries: { day: number; total: number; baseflow: number; surface: number }[];
}


export interface ExchangeFluxResult {
  totalExchange: number;     // 总交换量 (m³/d)，正=河流补给地下水，负=地下水排泄到河流
  exchangePerMeter: number;  // 单位河长交换量 (m³/d/m)
  fluxDirection: InteractionType;
  points: {
    id: string;
    name: string;
    hydraulicGradient: number;  // 水力梯度
    flux: number;               // 交换通量 (m³/d)
    fluxPerArea: number;        // 通量密度 (m/d)
    direction: 'infiltration' | 'exfiltration';
  }[];
  totalInfiltration: number;  // 总下渗量 (m³/d)
  totalExfiltration: number;  // 总排泄量 (m³/d)
  netExchange: number;        // 净交换量 (m³/d)
}


export interface HyporheicResult {
  hyporheicZoneWidth: number;  // 河岸带宽度 (m)
  exchangeRate: number;         // 交换速率 (m/d)
  residenceTime: number;        // 停留时间 (h)
  amplitudeRatio: number;       // 温度振幅衰减比
  phaseShift: number;           // 相位滞后 (h)
  thermalDiffusivity: number;   // 热扩散系数 (m²/s)
  dampingDepth: number;         // 阻尼深度 (m)
}


export interface InteractionClassification {
  type: InteractionType;
  description: string;
  characteristics: string[];
  ecologicalImplications: string;
  managementSuggestions: string[];
}


export interface ComprehensiveInteractionResult {
  baseflow: BaseflowResult;
  exchange: ExchangeFluxResult;
  hyporheic: HyporheicResult;
  classification: InteractionClassification;
  annualWaterBudget: {
    baseflowContribution: number;  // 基流对河流的贡献 (m³/a)
    riverSeepage: number;          // 河流渗漏补给地下水 (m³/a)
    groundwaterDischarge: number;  // 地下水排泄到河流 (m³/a)
    netExchange: number;           // 净交换量 (m³/a)
  };
}

// ── 1. 基流分割 ──

/**
 * 数字滤波法基流分割
 *
 * 方法1: BFI (Base Flow Index) — 英国水文研究所法
 * 方法2: Chapman (1999) — 改进数字滤波
 * 方法3: Eckhardt (2005) — 递归数字滤波，考虑含水层退水常数
 *
 * Chapman滤波器: b[k] = α * b[k-1] + (1-α)/2 * (q[k] + q[k-1])
 * Eckhardt滤波器: b[k] = ((1-BFI_max) * α * b[k-1] + (1-α) * BFI_max * q[k]) /
 *                        (1 - α * BFI_max)
 */
