/**
 * B-25 地下水数值模拟参数估算引擎
 *
 * 功能：
 *  1. 水力参数转换（K↔T、S↔给水度、各向异性比）
 *  2. 网格参数估算（最优网格尺寸、层数、节点总数）
 *  3. 数值稳定性判断（Peclet数/Courant数/网格Peclet数）
 *  4. 时间步长估算（显式/隐式格式、收敛准则）
 *  5. 模型校准指标（NSE/RMSE/MAE/R²/MAPE）
 *  6. 预设数据：河北省6个典型数值模拟区参数
 */

// ═══════════════════════════════════════════════════════
// 类型定义
// ═══════════════════════════════════════════════════════

export interface HydraulicParamInput {
  /** 渗透系数 K (m/d) */
  k: number;
  /** 含水层厚度 M (m) */
  thickness: number;
  /** 贮水系数 S（承压）或给水度 μ（潜水） */
  storage: number;
  /** 水力梯度 i */
  gradient: number;
  /** 孔隙率 n */
  porosity: number;
  /** 纵向弥散度 αL (m) */
  alphaL: number;
  /** 是否承压含水层 */
  isConfined: boolean;
}

export interface HydraulicParamResult {
  /** 导水系数 T = K × M (m²/d) */
  transmissivity: number;
  /** 渗透系数 K (m/d) */
  k: number;
  /** 贮水/给水 */
  storage: number;
  /** 达西流速 v = K × i / n (m/d) */
  darcyVelocity: number;
  /** 实际流速 va = K × i / n (m/d) */
  actualVelocity: number;
  /** 水力扩散系数 D = T / S (m²/d) */
  diffusivity: number;
  /** 特征长度 L (m) — 模型区域特征尺度 */
  note: string;
}

export interface GridParamInput {
  /** 模拟区域长度 (m) */
  domainLength: number;
  /** 模拟区域宽度 (m) */
  domainWidth: number;
  /** 含水层层数 */
  layers: number;
  /** 水力参数 */
  hydraulic: HydraulicParamInput;
  /** 目标网格分辨率等级 (1~5，越大网格越密) */
  resolutionLevel: number;
}

export interface GridParamResult {
  /** 建议网格尺寸 Δx (m) */
  dx: number;
  /** 建议网格尺寸 Δy (m) */
  dy: number;
  /** x方向网格数 */
  nx: number;
  /** y方向网格数 */
  ny: number;
  /** 总节点数 */
  totalNodes: number;
  /** 总单元数 */
  totalCells: number;
  /** 网格质量评价 */
  quality: string;
  /** 内存估算 (MB) */
  estimatedMemory: number;
  /** 建议 */
  suggestion: string;
}

export interface StabilityInput {
  /** 网格尺寸 Δx (m) */
  dx: number;
  /** 渗透系数 K (m/d) */
  k: number;
  /** 含水层厚度 M (m) */
  thickness: number;
  /** 贮水系数 S */
  storage: number;
  /** 孔隙率 n */
  porosity: number;
  /** 水力梯度 i */
  gradient: number;
  /** 纵向弥散度 αL (m) */
  alphaL: number;
  /** 时间步长 Δt (d) */
  dt: number;
  /** 是否显式格式 */
  isExplicit: boolean;
}

export interface StabilityResult {
  /** Courant数 Cr = v × Δt / Δx */
  courant: number;
  /** 网格Peclet数 Pe = v × Δx / D */
  peclet: number;
  /** 弥散Peclet数 Pe_d = v × Δx / (αL × v) = Δx / αL */
  pecletD: number;
  /** 数值稳定性判断 */
  isStable: boolean;
  /** 不稳定原因 */
  instabilityReason: string;
  /** 最大允许时间步长 Δt_max (d) */
  maxDt: number;
  /** 最大允许网格尺寸 Δx_max (m) */
  maxDx: number;
  /** 建议 */
  suggestion: string;
}

export interface CalibrationData {
  /** 观测值序列 */
  observed: number[];
  /** 模拟值序列 */
  simulated: number[];
}

export interface CalibrationResult {
  /** 样本数 n */
  n: number;
  /** 均方根误差 RMSE */
  rmse: number;
  /** 平均绝对误差 MAE */
  mae: number;
  /** 平均绝对百分比误差 MAPE (%) */
  mape: number;
  /** 决定系数 R² */
  r2: number;
  /** Nash-Sutcliffe效率系数 NSE */
  nse: number;
  /** 相对偏差 PBIAS (%) */
  pbias: number;
  /** 模型评价等级 */
  grade: string;
  /** 建议 */
  suggestion: string;
}

export interface TimeStepInput {
  /** 导水系数 T (m²/d) */
  transmissivity: number;
  /** 贮水系数 S */
  storage: number;
  /** 网格尺寸 Δx (m) */
  dx: number;
  /** 总模拟时间 (d) */
  totalTime: number;
  /** 求解方法（显式/隐式/Crank-Nicolson） */
  method: 'explicit' | 'implicit' | 'crank-nicolson';
}

export interface TimeStepResult {
  /** 最大稳定时间步长 Δt_max (d) */
  maxDt: number;
  /** 建议时间步长 Δt (d) */
  suggestedDt: number;
  /** 总时间步数 */
  totalSteps: number;
  /** 收敛准则（残差） */
  convergenceCriterion: number;
  /** 最大迭代次数 */
  maxIterations: number;
  /** 松弛因子 ω（SOR法） */
  relaxationFactor: number;
  /** 建议 */
  suggestion: string;
}

// ═══════════════════════════════════════════════════════
// 1. 水力参数转换
// ═══════════════════════════════════════════════════════

export function calcHydraulicParams(input: HydraulicParamInput): HydraulicParamResult {
  const { k, thickness, storage, gradient, porosity } = input;

  const transmissivity = k * thickness; // T = K × M
  const darcyVelocity = k * gradient; // v_darcy = K × i
  const actualVelocity = porosity > 0 ? darcyVelocity / porosity : 0; // va = K × i / n
  const diffusivity = storage > 0 ? transmissivity / storage : 0; // D = T / S

  const note = `导水系数 T=K×M=${k}×${thickness}=${transmissivity.toFixed(2)} m²/d。`
    + ` 实际流速 va=K×i/n=${darcyVelocity.toFixed(4)}/${porosity}=${actualVelocity.toFixed(4)} m/d。`
    + ` 水力扩散系数 D=T/S=${transmissivity.toFixed(2)}/${storage}=${diffusivity.toFixed(2)} m²/d。`
    + (input.isConfined ? ' 承压含水层，S为弹性贮水系数。' : ' 潜水含水层，μ为给水度。');

  return {
    transmissivity: Math.round(transmissivity * 100) / 100,
    k,
    storage,
    darcyVelocity: Math.round(darcyVelocity * 10000) / 10000,
    actualVelocity: Math.round(actualVelocity * 10000) / 10000,
    diffusivity: Math.round(diffusivity * 100) / 100,
    note,
  };
}

// ═══════════════════════════════════════════════════════
// 2. 网格参数估算
// ═══════════════════════════════════════════════════════

export function calcGridParams(input: GridParamInput): GridParamResult {
  const { domainLength, domainWidth, layers, resolutionLevel } = input;

  // 根据分辨率等级确定网格密度
  // 等级1: 粗网格(~200m), 2: 中粗(~100m), 3: 中等(~50m), 4: 中细(~25m), 5: 细网格(~10m)
  const baseSizes = [200, 100, 50, 25, 10];
  const baseSize = baseSizes[Math.min(4, Math.max(0, resolutionLevel - 1))];

  // 水力扩散系数（用于微调参考）
  const _diffusivity = input.hydraulic.storage > 0
    ? (input.hydraulic.k * input.hydraulic.thickness) / input.hydraulic.storage
    : 100;
  void _diffusivity;

  // 网格尺寸应满足 Pe = Δx / αL < 2 的准则
  const maxDxByPeclet = input.hydraulic.alphaL > 0 ? input.hydraulic.alphaL * 2 : baseSize;
  const dx = Math.min(baseSize, Math.round(maxDxByPeclet));

  const nx = Math.ceil(domainLength / dx);
  const ny = Math.ceil(domainWidth / dx);
  const totalNodes = nx * ny * layers;
  const totalCells = (nx - 1) * (ny - 1) * layers;

  // 内存估算：每节点约7个变量(水头+参数)×8字节
  const estimatedMemory = Math.round((totalNodes * 7 * 8) / (1024 * 1024) * 100) / 100;

  let quality: string;
  if (totalNodes < 10000) quality = '粗网格';
  else if (totalNodes < 100000) quality = '中等网格';
  else if (totalNodes < 500000) quality = '精细网格';
  else if (totalNodes < 2000000) quality = '高精度网格';
  else quality = '超大规模网格';

  let suggestion: string;
  if (totalNodes < 10000) {
    suggestion = `网格规模小(${totalNodes}节点)，计算速度快，适合初步建模和概念验证。建议先用粗网格调试模型。`;
  } else if (totalNodes < 100000) {
    suggestion = `网格规模适中(${totalNodes}节点)，兼顾精度和效率，适合常规生产项目。`;
  } else if (totalNodes < 500000) {
    suggestion = `网格规模较大(${totalNodes}节点)，需要较多计算资源，建议使用并行求解器。`;
  } else {
    suggestion = `网格规模超大(${totalNodes}节点)，需要高性能计算环境，建议分区并行或降粗网格。`;
  }

  return {
    dx,
    dy: dx,
    nx,
    ny,
    totalNodes,
    totalCells,
    quality,
    estimatedMemory,
    suggestion,
  };
}

// ═══════════════════════════════════════════════════════
// 3. 数值稳定性判断
// ═══════════════════════════════════════════════════════

export function calcStability(input: StabilityInput): StabilityResult {
  const { dx, k, thickness, storage, porosity, gradient, alphaL, dt, isExplicit } = input;

  const transmissivity = k * thickness;
  const darcyVelocity = k * gradient;
  const actualVelocity = porosity > 0 ? darcyVelocity / porosity : 0;
  // 弥散系数 D = αL × v（用于参考，稳定性判断使用pecletD）
  const _dispersion = alphaL * actualVelocity;
  void _dispersion;

  // Courant数: Cr = v × Δt / Δx
  const courant = dx > 0 ? (actualVelocity * dt) / dx : 0;

  // 网格Peclet数: Pe = v × Δx / D (D为水力扩散系数)
  const hydraulicDiffusivity = storage > 0 ? transmissivity / storage : 0;
  const peclet = hydraulicDiffusivity > 0 ? (actualVelocity * dx) / hydraulicDiffusivity : 0;

  // 弥散Peclet数: Pe_d = Δx / αL
  const pecletD = alphaL > 0 ? dx / alphaL : 0;

  // 稳定性判断
  let isStable = true;
  const reasons: string[] = [];

  if (isExplicit) {
    // 显式格式: Cr ≤ 1 且 Pe ≤ 2
    if (courant > 1) {
      isStable = false;
      reasons.push(`Courant数=${courant.toFixed(3)}>1，显式格式不稳定`);
    }
    if (pecletD > 2) {
      isStable = false;
      reasons.push(`弥散Peclet数=${pecletD.toFixed(1)}>2，存在数值振荡`);
    }
  } else {
    // 隐式格式: 无条件稳定，但 Pe_d 仍影响精度
    if (pecletD > 2) {
      reasons.push(`弥散Peclet数=${pecletD.toFixed(1)}>2，虽稳定但存在数值弥散`);
    }
  }

  // 最大允许时间步长（显式格式）
  const maxDt = actualVelocity > 0 ? dx / actualVelocity : 999;

  // 最大允许网格尺寸（基于弥散Peclet准则）
  const maxDx = alphaL > 0 ? alphaL * 2 : 999;

  const instabilityReason = reasons.length > 0 ? reasons.join('；') : '满足所有稳定性准则';
  const suggestion = isStable
    ? `数值计算稳定。${reasons.length > 0 ? '注意：' + reasons[0] + '。' : '当前参数组合满足稳定性条件。'}`
    : `数值计算不稳定！建议：${courant > 1 ? `减小时间步长至≤${maxDt.toFixed(2)}d，或改用隐式格式。` : ''}${pecletD > 2 ? `减小网格尺寸至≤${maxDx.toFixed(1)}m。` : ''}`;

  return {
    courant: Math.round(courant * 1000) / 1000,
    peclet: Math.round(peclet * 1000) / 1000,
    pecletD: Math.round(pecletD * 100) / 100,
    isStable,
    instabilityReason,
    maxDt: Math.round(maxDt * 100) / 100,
    maxDx: Math.round(maxDx * 100) / 100,
    suggestion,
  };
}

// ═══════════════════════════════════════════════════════
// 4. 时间步长估算
// ═══════════════════════════════════════════════════════

export function calcTimeStep(input: TimeStepInput): TimeStepResult {
  const { transmissivity, storage, dx, totalTime, method } = input;

  // 水力扩散系数
  const diffusivity = storage > 0 ? transmissivity / storage : 0;

  // 显式格式的稳定条件: D × Δt / Δx² ≤ 1/4 (二维)
  // → Δt ≤ Δx² / (4 × D)
  const maxDtExplicit = diffusivity > 0 ? (dx * dx) / (4 * diffusivity) : 999;

  let maxDt: number;
  let suggestedDt: number;
  let convergenceCriterion: number;
  let maxIterations: number;
  let relaxationFactor: number;

  switch (method) {
    case 'explicit':
      maxDt = maxDtExplicit;
      suggestedDt = Math.min(maxDt * 0.9, totalTime / 100); // 取90%安全裕度
      convergenceCriterion = 1e-4;
      maxIterations = 1; // 显式无需迭代
      relaxationFactor = 1.0;
      break;
    case 'implicit':
      maxDt = 999; // 无条件稳定
      suggestedDt = Math.min(totalTime / 50, dx * dx / diffusivity * 10);
      convergenceCriterion = 1e-5;
      maxIterations = 500;
      relaxationFactor = 1.0; // 标准Gauss-Seidel
      break;
    case 'crank-nicolson':
      maxDt = 999; // 无条件稳定
      suggestedDt = Math.min(totalTime / 30, dx * dx / diffusivity * 20);
      convergenceCriterion = 1e-6;
      maxIterations = 1000;
      relaxationFactor = 1.8; // SOR超松弛
      break;
  }

  // 确保至少1步
  suggestedDt = Math.max(0.001, Math.min(suggestedDt, totalTime));
  const totalSteps = Math.ceil(totalTime / suggestedDt);

  // 限制最大步数
  if (totalSteps > 10000) {
    suggestedDt = totalTime / 10000;
  }

  const finalSteps = Math.ceil(totalTime / suggestedDt);

  const methodNames = {
    'explicit': '显式差分',
    'implicit': '隐式差分',
    'crank-nicolson': 'Crank-Nicolson',
  };

  const suggestion = `${methodNames[method]}格式：建议时间步长Δt=${suggestedDt.toFixed(3)}d，`
    + `总步数${finalSteps}步。`
    + (method === 'explicit' ? ` 显式格式需满足Δt≤${maxDt.toFixed(3)}d，已取90%安全裕度。` : '')
    + ` 收敛准则ε=${convergenceCriterion}，最大迭代${maxIterations}次。`
    + (method === 'crank-nicolson' ? ` SOR松弛因子ω=${relaxationFactor}，加速收敛。` : '');

  return {
    maxDt: Math.round(maxDt * 1000) / 1000,
    suggestedDt: Math.round(suggestedDt * 1000) / 1000,
    totalSteps: finalSteps,
    convergenceCriterion,
    maxIterations,
    relaxationFactor,
    suggestion,
  };
}

// ═══════════════════════════════════════════════════════
// 5. 模型校准指标
// ═══════════════════════════════════════════════════════

export function calcCalibration(data: CalibrationData): CalibrationResult {
  const { observed, simulated } = data;
  const n = Math.min(observed.length, simulated.length);

  if (n < 2) {
    return {
      n,
      rmse: 0, mae: 0, mape: 0, r2: 0, nse: -999,
      pbias: 0, grade: '数据不足', suggestion: '至少需要2组观测-模拟数据对。',
    };
  }

  const obs = observed.slice(0, n);
  const sim = simulated.slice(0, n);

  // RMSE
  const sqErr = obs.map((o, i) => Math.pow(o - sim[i], 2));
  const rmse = Math.sqrt(sqErr.reduce((a, b) => a + b, 0) / n);

  // MAE
  const absErr = obs.map((o, i) => Math.abs(o - sim[i]));
  const mae = absErr.reduce((a, b) => a + b, 0) / n;

  // MAPE
  const absPctErr = obs.map((o, i) => o !== 0 ? Math.abs((o - sim[i]) / o) * 100 : 0);
  const mape = absPctErr.reduce((a, b) => a + b, 0) / n;

  // R²
  const meanObs = obs.reduce((a, b) => a + b, 0) / n;
  const ssTot = obs.reduce((s, o) => s + Math.pow(o - meanObs, 2), 0);
  const ssRes = obs.reduce((s, o, i) => s + Math.pow(o - sim[i], 2), 0);
  const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0;

  // NSE
  const nse = ssTot > 0 ? 1 - ssRes / ssTot : -999;

  // PBIAS
  const sumObs = obs.reduce((a, b) => a + b, 0);
  const sumSim = sim.reduce((a, b) => a + b, 0);
  const pbias = sumObs > 0 ? 100 * (sumSim - sumObs) / sumObs : 0;

  // 评价等级（基于NSE）
  let grade: string;
  if (nse >= 0.90) grade = '优秀';
  else if (nse >= 0.80) grade = '良好';
  else if (nse >= 0.65) grade = '合格';
  else if (nse >= 0.50) grade = '勉强';
  else grade = '不合格';

  let suggestion: string;
  if (nse >= 0.80) {
    suggestion = `模型校准效果${grade}(NSE=${nse.toFixed(3)})，可用于预测。`;
  } else if (nse >= 0.65) {
    suggestion = `模型校准${grade}(NSE=${nse.toFixed(3)})，建议优化参数提高精度。`;
  } else {
    suggestion = `模型校准${grade}(NSE=${nse.toFixed(3)})，需重新调参或检查概念模型。`
      + (Math.abs(pbias) > 20 ? ` 存在明显系统偏差(PBIAS=${pbias.toFixed(1)}%)。` : '');
  }

  return {
    n,
    rmse: Math.round(rmse * 10000) / 10000,
    mae: Math.round(mae * 10000) / 10000,
    mape: Math.round(mape * 100) / 100,
    r2: Math.round(r2 * 10000) / 10000,
    nse: Math.round(nse * 10000) / 10000,
    pbias: Math.round(pbias * 100) / 100,
    grade,
    suggestion,
  };
}

// ═══════════════════════════════════════════════════════
// 6. 预设数据：河北省6个典型数值模拟区
// ═══════════════════════════════════════════════════════

export interface PresetModelZone {
  name: string;
  description: string;
  hydraulic: HydraulicParamInput;
  domain: { length: number; width: number; layers: number };
  totalTime: number;
  method: 'explicit' | 'implicit' | 'crank-nicolson';
}

export const PRESET_MODEL_ZONES: PresetModelZone[] = [
  {
    name: '太行山前冲洪积扇（保定-石家庄）',
    description: '第四系孔隙含水层，K较高，适合区域模型',
    hydraulic: { k: 15, thickness: 40, storage: 0.0008, gradient: 0.002, porosity: 0.25, alphaL: 50, isConfined: true },
    domain: { length: 50000, width: 30000, layers: 3 },
    totalTime: 3650,
    method: 'implicit',
  },
  {
    name: '河北平原中部（衡水深层水）',
    description: '深层承压水超采区，地面沉降重点模拟区',
    hydraulic: { k: 5, thickness: 60, storage: 0.0005, gradient: 0.001, porosity: 0.15, alphaL: 30, isConfined: true },
    domain: { length: 80000, width: 60000, layers: 5 },
    totalTime: 7300,
    method: 'crank-nicolson',
  },
  {
    name: '沧州滨海区（海水入侵）',
    description: '滨海区咸淡水界面运移模拟，需耦合溶质运移',
    hydraulic: { k: 8, thickness: 30, storage: 0.001, gradient: 0.0005, porosity: 0.20, alphaL: 20, isConfined: false },
    domain: { length: 30000, width: 20000, layers: 4 },
    totalTime: 3650,
    method: 'crank-nicolson',
  },
  {
    name: '燕山山区岩溶水（承德）',
    description: '岩溶裂隙含水层，非均质性强，等效多孔介质',
    hydraulic: { k: 3, thickness: 20, storage: 0.005, gradient: 0.005, porosity: 0.08, alphaL: 15, isConfined: false },
    domain: { length: 20000, width: 15000, layers: 2 },
    totalTime: 1825,
    method: 'implicit',
  },
  {
    name: '邢台东部平原（限采区）',
    description: '浅层潜水-微承压水，农业开采影响',
    hydraulic: { k: 10, thickness: 25, storage: 0.12, gradient: 0.0015, porosity: 0.22, alphaL: 40, isConfined: false },
    domain: { length: 40000, width: 35000, layers: 2 },
    totalTime: 3650,
    method: 'implicit',
  },
  {
    name: '张家口坝上高原（生态脆弱区）',
    description: '薄层含水层，生态水位敏感区',
    hydraulic: { k: 2, thickness: 15, storage: 0.08, gradient: 0.003, porosity: 0.15, alphaL: 10, isConfined: false },
    domain: { length: 25000, width: 20000, layers: 1 },
    totalTime: 1825,
    method: 'explicit',
  },
];

// ═══════════════════════════════════════════════════════
// 批量计算与汇总
// ═══════════════════════════════════════════════════════

export function calcAllPresetZones() {
  return PRESET_MODEL_ZONES.map(zone => {
    const hydraulicResult = calcHydraulicParams(zone.hydraulic);
    const gridResult = calcGridParams({
      domainLength: zone.domain.length,
      domainWidth: zone.domain.width,
      layers: zone.domain.layers,
      hydraulic: zone.hydraulic,
      resolutionLevel: 3,
    });
    const timeStepResult = calcTimeStep({
      transmissivity: hydraulicResult.transmissivity,
      storage: zone.hydraulic.storage,
      dx: gridResult.dx,
      totalTime: zone.totalTime,
      method: zone.method,
    });
    const stabilityResult = calcStability({
      dx: gridResult.dx,
      k: zone.hydraulic.k,
      thickness: zone.hydraulic.thickness,
      storage: zone.hydraulic.storage,
      porosity: zone.hydraulic.porosity,
      gradient: zone.hydraulic.gradient,
      alphaL: zone.hydraulic.alphaL,
      dt: timeStepResult.suggestedDt,
      isExplicit: zone.method === 'explicit',
    });
    return { zone, hydraulicResult, gridResult, timeStepResult, stabilityResult };
  });
}
