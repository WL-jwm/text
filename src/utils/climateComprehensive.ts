/**
 * 气候变化影响评估 — 综合评估与历史序列生成
 */

import type { ComprehensiveClimateResult, ClimateData, DroughtIndex, ClimateProjection, Season } from './climateTypes';
import { calcPET, calcRechargeBredenkamp } from './climateCalculators';
import { ADAPTATION_STRATEGIES } from './climatePresets';

export function calcComprehensiveClimate(
  historical: ClimateData[],
  projections: ClimateProjection[],
  droughtIndices: DroughtIndex[],
): ComprehensiveClimateResult {
  // 补给量历史序列
  const rechargeHistory = historical.map(d => ({
    year: d.year,
    precipitation: d.annualPrecip,
    recharge: calcRechargeBredenkamp(d.annualPrecip, d.pet),
    rechargeRate: d.annualPrecip > 0
      ? Number((calcRechargeBredenkamp(d.annualPrecip, d.pet) / d.annualPrecip).toFixed(4))
      : 0,
    method: 'Bredenkamp法',
    aet: Number((d.pet * 0.6).toFixed(1)),
    waterSurplus: Number((d.annualPrecip - d.pet * 0.6).toFixed(1)),
  }));

  // 关键发现
  const keyFindings: string[] = [];

  // 历史趋势
  const histPrecipTrend = (historical[historical.length - 1].annualPrecip - historical[0].annualPrecip) / historical.length;
  const histTempTrend = (historical[historical.length - 1].annualTemp - historical[0].annualTemp) / historical.length;
  keyFindings.push(`历史期(1961-2024)年均降水变化趋势: ${histPrecipTrend > 0 ? '+' : ''}${histPrecipTrend.toFixed(1)} mm/10a`);
  keyFindings.push(`历史期年均气温变化趋势: ${histTempTrend > 0 ? '+' : ''}${histTempTrend.toFixed(2)} ℃/10a`);

  // 未来变化
  for (const proj of projections) {
    if (proj.scenario === 'historical') continue;
    keyFindings.push(`${proj.description}: 降水变化${proj.deltaPrecip > 0 ? '+' : ''}${proj.deltaPrecip}%，升温${proj.deltaTemp}℃，补给量变化${proj.deltaRecharge > 0 ? '+' : ''}${proj.deltaRecharge}%`);
  }

  // 干旱分析
  const droughtYears = droughtIndices.filter(d => d.droughtClass !== 'none');
  const severeDroughts = droughtIndices.filter(d => d.droughtClass === 'severe' || d.droughtClass === 'extreme');
  keyFindings.push(`历史期共发生干旱${droughtYears.length}年，其中严重/极端干旱${severeDroughts.length}年`);

  // 风险等级
  const worstCase = projections.find(p => p.scenario === 'ssp585' || p.scenario === 'rcp85');
  let riskLevel: 'low' | 'medium' | 'high' | 'very-high';
  if (worstCase) {
    const rechargeLoss = Math.abs(Math.min(0, worstCase.deltaRecharge));
    if (rechargeLoss > 30 || worstCase.deltaTemp > 4) riskLevel = 'very-high';
    else if (rechargeLoss > 15 || worstCase.deltaTemp > 2.5) riskLevel = 'high';
    else if (rechargeLoss > 5) riskLevel = 'medium';
    else riskLevel = 'low';
  } else {
    riskLevel = 'medium';
  }

  return {
    historical,
    projections,
    rechargeHistory,
    droughtIndices,
    strategies: ADAPTATION_STRATEGIES,
    keyFindings,
    riskLevel,
  };
}

// ── 预设数据 ──

/** 生成河北省1961-2024年气候数据 */

export function generateHistoricalClimate(): ClimateData[] {
  const data: ClimateData[] = [];
  const basePrecip = 500;
  const baseTemp = 12.5;
  const precipTrend = -0.5; // mm/a 降水略减
  const tempTrend = 0.025;  // ℃/a 升温

  for (let year = 1961; year <= 2024; year++) {
    const idx = year - 1961;
    // 自然变率（多频率叠加）
    const var1 = Math.sin(idx * 0.15) * 60;  // ~42年周期
    const var2 = Math.sin(idx * 0.5) * 40;   // ~12年周期
    const var3 = Math.sin(idx * 2.3 + 1.5) * 25; // ~3年周期
    const noise = (Math.sin(idx * 7.7) + Math.cos(idx * 3.3)) * 15;

    const annualPrecip = Math.max(200, basePrecip + precipTrend * idx + var1 + var2 + var3 + noise);
    const annualTemp = baseTemp + tempTrend * idx + Math.sin(idx * 0.3) * 0.3 + Math.sin(idx * 5.1) * 0.2;

    const pet = calcPET(annualTemp, annualPrecip);

    // 季节分配
    const seasonalPrecip: Record<Season, number> = {
      spring: annualPrecip * 0.12 + Math.sin(idx * 2) * 10,
      summer: annualPrecip * 0.65 + Math.sin(idx * 1.5) * 30,
      autumn: annualPrecip * 0.17 + Math.sin(idx * 3) * 8,
      winter: annualPrecip * 0.06 + Math.sin(idx * 4) * 3,
    };
    const seasonalTemp: Record<Season, number> = {
      spring: annualTemp + 8,
      summer: annualTemp + 15,
      autumn: annualTemp + 3,
      winter: annualTemp - 12,
    };

    data.push({
      year,
      annualPrecip: Number(annualPrecip.toFixed(1)),
      annualTemp: Number(annualTemp.toFixed(2)),
      seasonalPrecip: {
        spring: Number(seasonalPrecip.spring.toFixed(1)),
        summer: Number(seasonalPrecip.summer.toFixed(1)),
        autumn: Number(seasonalPrecip.autumn.toFixed(1)),
        winter: Number(seasonalPrecip.winter.toFixed(1)),
      },
      seasonalTemp: {
        spring: Number(seasonalTemp.spring.toFixed(2)),
        summer: Number(seasonalTemp.summer.toFixed(2)),
        autumn: Number(seasonalTemp.autumn.toFixed(2)),
        winter: Number(seasonalTemp.winter.toFixed(2)),
      },
      pet: Number(pet.toFixed(1)),
    });
  }

  return data;
}

