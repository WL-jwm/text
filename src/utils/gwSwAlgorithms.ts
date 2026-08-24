/**
 * 地下水-地表水相互作用 — 核心算法
 *  基流分割 / 交换通量 / 潜流带交换 / 类型判定 / 综合评估
 */

import type { RiverPoint, BaseflowResult, ExchangeFluxResult, HyporheicResult, InteractionClassification, ComprehensiveInteractionResult, InteractionType } from './gwSwTypes';

export function calcBaseflowSeparation(
  dailyFlow: number[],  // 日径流序列 (m³/s)
  method: 'bfi' | 'chapman' | 'eckhardt' = 'eckhardt',
  params?: { alpha?: number; bfiMax?: number; area?: number },
): BaseflowResult {
  const n = dailyFlow.length;
  const alpha = params?.alpha ?? 0.925;       // 退水常数
  const bfiMax = params?.bfiMax ?? 0.80;       // 最大BFI（承压水0.8~0.9，潜水0.5~0.8）
  const area = params?.area ?? 1000;           // 流域面积 (km²)

  const baseflowSeries = new Array(n).fill(0);
  const surfaceSeries = new Array(n).fill(0);

  if (method === 'bfi') {
    // BFI法：滑块最小值法
    const blockSize = 5; // 5天块
    const minValues: number[] = [];

    for (let i = 0; i < n; i += blockSize) {
      const block = dailyFlow.slice(i, Math.min(i + blockSize, n));
      const minVal = Math.min(...block);
      minValues.push(minVal);
    }

    // 平滑并插值
    for (let i = 0; i < n; i++) {
      const blockIdx = Math.floor(i / blockSize);
      const nextBlockIdx = Math.min(blockIdx + 1, minValues.length - 1);
      const fraction = (i % blockSize) / blockSize;
      const bf = minValues[blockIdx] * (1 - fraction) + minValues[nextBlockIdx] * fraction;
      baseflowSeries[i] = Math.min(bf, dailyFlow[i]);
      surfaceSeries[i] = dailyFlow[i] - baseflowSeries[i];
    }
  } else if (method === 'chapman') {
    // Chapman滤波器
    baseflowSeries[0] = dailyFlow[0] * 0.5;
    for (let k = 1; k < n; k++) {
      const bf = alpha * baseflowSeries[k - 1] + (1 - alpha) / 2 * (dailyFlow[k] + dailyFlow[k - 1]);
      baseflowSeries[k] = Math.min(bf, dailyFlow[k]);
      surfaceSeries[k] = dailyFlow[k] - baseflowSeries[k];
    }
  } else {
    // Eckhardt滤波器
    baseflowSeries[0] = dailyFlow[0] * bfiMax;
    for (let k = 1; k < n; k++) {
      const bf = ((1 - bfiMax) * alpha * baseflowSeries[k - 1] + (1 - alpha) * bfiMax * dailyFlow[k]) /
                 (1 - alpha * bfiMax);
      baseflowSeries[k] = Math.min(bf, dailyFlow[k]);
      surfaceSeries[k] = dailyFlow[k] - baseflowSeries[k];
    }
  }

  // 计算总量（m³/s → mm）
  const avgFlow = dailyFlow.reduce((s, v) => s + v, 0) / n;
  const avgBaseflow = baseflowSeries.reduce((s, v) => s + v, 0) / n;


  // 转换为 mm: Q(m³/s) × 86400(s/d) × 365(d) / (Area × 10⁶) × 1000 = mm
  const totalRunoff = (avgFlow * 86400 * 365) / (area * 1e6) * 1000;
  const baseflow = (avgBaseflow * 86400 * 365) / (area * 1e6) * 1000;
  const surfaceRunoff = totalRunoff - baseflow;
  const baseflowIndex = totalRunoff > 0 ? baseflow / totalRunoff : 0;

  // 采样返回（避免数据过多）
  const sampleStep = Math.max(1, Math.floor(n / 60));
  const dailySeries: { day: number; total: number; baseflow: number; surface: number }[] = [];
  for (let i = 0; i < n; i += sampleStep) {
    dailySeries.push({
      day: i + 1,
      total: Number(dailyFlow[i].toFixed(2)),
      baseflow: Number(baseflowSeries[i].toFixed(2)),
      surface: Number(surfaceSeries[i].toFixed(2)),
    });
  }

  const methodLabel = method === 'bfi' ? 'BFI法(滑块最小值)' :
                      method === 'chapman' ? 'Chapman滤波(α=' + alpha + ')' :
                      'Eckhardt滤波(α=' + alpha + ', BFI_max=' + bfiMax + ')';

  return {
    totalRunoff: Number(totalRunoff.toFixed(1)),
    baseflow: Number(baseflow.toFixed(1)),
    surfaceRunoff: Number(surfaceRunoff.toFixed(1)),
    baseflowIndex: Number(baseflowIndex.toFixed(3)),
    method: methodLabel,
    dailySeries,
  };
}

// ── 2. 交换通量估算 ──

/**
 * 基于Darcy定律计算河岸带地下水-地表水交换通量
 *
 * Q = K' × W × L × (h_river - h_gw) / b'
 *
 * 其中 K' 为河床渗透系数, W 为河流宽度, L 为河段长度,
 * h_river 为河水位, h_gw 为地下水水位, b' 为河床沉积物厚度
 */

export function calcExchangeFlux(riverPoints: RiverPoint[], segmentLength: number): ExchangeFluxResult {
  const points = riverPoints.map(rp => {
    const hydraulicGradient = (rp.riverStage - rp.groundwaterHead) / rp.riverbedThickness;
    const fluxPerArea = rp.riverbedK * hydraulicGradient; // m/d
    const flux = fluxPerArea * rp.riverWidth * segmentLength; // m³/d

    const direction: 'infiltration' | 'exfiltration' =
      rp.riverStage > rp.groundwaterHead ? 'infiltration' : 'exfiltration';

    return {
      id: rp.id,
      name: rp.name,
      hydraulicGradient: Number(hydraulicGradient.toFixed(5)),
      flux: Number(flux.toFixed(1)),
      fluxPerArea: Number(fluxPerArea.toFixed(5)),
      direction,
    };
  });

  const totalInfiltration = points
    .filter(p => p.direction === 'infiltration')
    .reduce((s, p) => s + p.flux, 0);
  const totalExfiltration = points
    .filter(p => p.direction === 'exfiltration')
    .reduce((s, p) => s + Math.abs(p.flux), 0);
  const netExchange = totalInfiltration - totalExfiltration;
  const totalExchange = totalInfiltration + totalExfiltration;
  const exchangePerMeter = totalExchange / (riverPoints.length * segmentLength);

  // 交互类型判定
  let fluxDirection: InteractionType;
  if (totalExfiltration > totalInfiltration * 3) {
    fluxDirection = 'gaining'; // 地下水补给河流（增益河）
  } else if (totalInfiltration > totalExfiltration * 3) {
    fluxDirection = 'losing'; // 河流补给地下水（失水河）
  } else if (Math.abs(netExchange) < totalExchange * 0.1) {
    fluxDirection = 'flow-through'; // 穿越型
  } else {
    fluxDirection = totalInfiltration > totalExfiltration ? 'losing' : 'gaining';
  }

  return {
    totalExchange: Number(totalExchange.toFixed(1)),
    exchangePerMeter: Number(exchangePerMeter.toFixed(3)),
    fluxDirection,
    points,
    totalInfiltration: Number(totalInfiltration.toFixed(1)),
    totalExfiltration: Number(totalExfiltration.toFixed(1)),
    netExchange: Number(netExchange.toFixed(1)),
  };
}

// ── 3. 河岸带分析 ──

/**
 * 温度示踪法分析河岸带交换
 *
 * 原理：河流温度日/季节波动在沉积物中衰减
 * 振幅比: A(z)/A(0) = exp(-z/d)
 * 相位滞后: Δφ = z/d
 * 其中 d = sqrt(2*α/ω) 为阻尼深度, ω = 2π/T 为角频率
 *
 * 热扩散方程: ∂T/∂t = α * ∂²T/∂z²
 */

export function calcHyporheicExchange(
  riverTempAmplitude: number,   // 河流温度日振幅 (℃)
  sedimentTempAmplitude: number, // 沉积物中温度振幅 (℃)
  sedimentDepth: number,         // 测量深度 (m)
  period: number,                // 温度波动周期 (h)，日波动=24
  sedimentPorosity: number,      // 沉积物孔隙度
  thermalConductivity: number,   // 沉积物热导率 (W/m/℃)
  heatCapacity: number,          // 体积热容 (J/m³/℃)
): HyporheicResult {
  // 热扩散系数
  const thermalDiffusivity = thermalConductivity / heatCapacity; // m²/s

  // 角频率
  const omega = (2 * Math.PI) / (period * 3600); // rad/s

  // 阻尼深度
  const dampingDepth = Math.sqrt(2 * thermalDiffusivity / omega); // m

  // 振幅衰减比
  const amplitudeRatio = sedimentTempAmplitude / riverTempAmplitude;

  // 相位滞后
  const phaseShift = sedimentDepth / dampingDepth * (period / (2 * Math.PI)); // h

  // 基于振幅衰减推断地下水流速
  // Hatch (2006): v = (α_th / z) * ln(A0/Az) (简化)
  // 正值=下行流(河流→地下水), 负值=上行流
  const verticalFlux = sedimentDepth > 0
    ? (thermalDiffusivity * 86400 / sedimentDepth) * Math.log(riverTempAmplitude / Math.max(sedimentTempAmplitude, 0.01))
    : 0;

  // 河岸带宽度（基于交换速率和达西流速）
  const exchangeRate = Math.abs(verticalFlux);
  const residenceTime = sedimentDepth > 0 && exchangeRate > 0
    ? (sedimentDepth / exchangeRate) * 24  // h
    : 0;

  // 河岸带宽度估算（简化：基于水平渗透系数和梯度）
  const hyporheicZoneWidth = Math.sqrt(dampingDepth * 100); // 简化估算

  return {
    hyporheicZoneWidth: Number(hyporheicZoneWidth.toFixed(2)),
    exchangeRate: Number(exchangeRate.toFixed(6)),
    residenceTime: Number(residenceTime.toFixed(1)),
    amplitudeRatio: Number(amplitudeRatio.toFixed(3)),
    phaseShift: Number(phaseShift.toFixed(2)),
    thermalDiffusivity: Number(thermalDiffusivity.toExponential(3)),
    dampingDepth: Number(dampingDepth.toFixed(3)),
  };
}

// ── 4. 交互类型判定 ──


export function classifyInteraction(
  exchange: ExchangeFluxResult,
  _riverPoints: RiverPoint[],
): InteractionClassification {
  const type = exchange.fluxDirection;

  const classifications: Record<InteractionType, InteractionClassification> = {
    gaining: {
      type: 'gaining',
      description: '增益型河流（地下水排泄到河流）',
      characteristics: [
        '河水位低于近岸地下水位',
        '河流流量沿程增加',
        '枯水期仍有基流维持',
        '河水化学成分受地下水影响显著',
      ],
      ecologicalImplications: '地下水为河流提供稳定的基流补给，维持枯水期生态需水，水质受地下水化学特征影响',
      managementSuggestions: [
        '保护河岸带补给区，限制开采近岸地下水',
        '监测地下水水质，防止污染物流入河流',
        '枯水期优先保障生态基流',
        '建立河岸带缓冲区(50-100m)',
      ],
    },
    losing: {
      type: 'losing',
      description: '失水型河流（河水补给地下水）',
      characteristics: [
        '河水位高于近岸地下水位',
        '河流流量沿程减少',
        '河岸带形成含水层补给带',
        '洪水期补给量显著增加',
      ],
      ecologicalImplications: '河流补给地下水，可能形成河岸带含水层，是地下水的重要补给来源，需关注河水水质对地下水的影响',
      managementSuggestions: [
        '保护河流水质，防止污染物下渗补给地下水',
        '合理利用河岸带补给功能，建设人工补给设施',
        '洪水期加强水质监测',
        '控制河道采砂，保护河床沉积层',
      ],
    },
    'flow-through': {
      type: 'flow-through',
      description: '穿越型河流（交换方向季节性交替）',
      characteristics: [
        '河水位与地下水位季节性交替',
        '丰水期河水补给地下水，枯水期反向',
        '交换方向受降雨和开采影响',
        '河岸带水文过程复杂',
      ],
      ecologicalImplications: '交换方向季节性转换，河岸带生态系统适应性强，生物多样性通常较高',
      managementSuggestions: [
        '分季节制定管理策略',
        '丰水期关注河水水质保护，枯水期关注地下水开采',
        '建立动态监测系统',
        '保护河岸带湿地生态系统',
      ],
    },
    perched: {
      type: 'perched',
      description: '悬托型河流（河床高于地下水位）',
      characteristics: [
        '河床底板高于区域地下水位',
        '河水通过河床沉积物下渗',
        '地下水与河流水力联系不直接',
        '常出现在山前冲洪积扇上段',
      ],
      ecologicalImplications: '河流通过河床渗漏补给地下水，是地下水的重要补给途径，河水水质直接影响地下水',
      managementSuggestions: [
        '重点保护河床渗漏区水质',
        '合理规划河床开采活动',
        '建立河水-地下水联合监测',
        '丰水期充分利用渗漏补给',
      ],
    },
  };

  return classifications[type];
}

// ── 综合分析 ──


export function calcComprehensiveInteraction(
  dailyFlow: number[],
  riverPoints: RiverPoint[],
  segmentLength: number,
  area: number,
  hyporheicParams?: {
    riverTempAmplitude: number;
    sedimentTempAmplitude: number;
    sedimentDepth: number;
    period: number;
    sedimentPorosity: number;
    thermalConductivity: number;
    heatCapacity: number;
  },
): ComprehensiveInteractionResult {
  const baseflow = calcBaseflowSeparation(dailyFlow, 'eckhardt', { area });
  const exchange = calcExchangeFlux(riverPoints, segmentLength);
  const classification = classifyInteraction(exchange, riverPoints);

  const hyporheic = hyporheicParams
    ? calcHyporheicExchange(
        hyporheicParams.riverTempAmplitude,
        hyporheicParams.sedimentTempAmplitude,
        hyporheicParams.sedimentDepth,
        hyporheicParams.period,
        hyporheicParams.sedimentPorosity,
        hyporheicParams.thermalConductivity,
        hyporheicParams.heatCapacity,
      )
    : calcHyporheicExchange(5.0, 2.5, 0.3, 24, 0.3, 2.0, 2.5e6); // 默认值

  // 年水量平衡
  const baseflowContribution = exchange.totalExfiltration * 365; // m³/a
  const riverSeepage = exchange.totalInfiltration * 365; // m³/a
  const groundwaterDischarge = baseflowContribution;
  const netExchange = (exchange.netExchange) * 365;

  return {
    baseflow,
    exchange,
    hyporheic,
    classification,
    annualWaterBudget: {
      baseflowContribution: Number(baseflowContribution.toFixed(0)),
      riverSeepage: Number(riverSeepage.toFixed(0)),
      groundwaterDischarge: Number(groundwaterDischarge.toFixed(0)),
      netExchange: Number(netExchange.toFixed(0)),
    },
  };
}

// ── 预设数据 ──

