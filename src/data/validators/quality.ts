/* eslint-disable @typescript-eslint/no-explicit-any */
/* 自动拆分生成：quality 域交叉校验函数 */
import type { ValidationIssue } from '../dataValidation';

import { groundwaterExploitation2024 } from '../exploitation';
import { cityQualityYearly, cityWaterLevelYearly } from '../historicalTimeSeries';
import { mineralWaterSites } from '../mineralWater';
import { cityGroundwaterQuality2024, qualityLevelTrend2020_2024 } from '../waterQuality';
import { importantWaterSources } from '../waterSource';

export function validateQualityExploitationMatch(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const q of cityGroundwaterQuality2024) {
    const exploit = groundwaterExploitation2024.find((e: any) => e.city === q.city);
    if (!exploit) continue;

    // 水质优良率>50%且深层开采占比>15% → 可能不合理
    const deepRatio = exploit.total > 0 ? (exploit.deep / exploit.total) * 100 : 0;
    if (q.rate > 50 && deepRatio > 15) {
      issues.push({
        level: 'info',
        category: 'consistency',
        title: `${q.city}水质优良但深层开采占比偏高`,
        message: `水质优良率${q.rate}%，深层开采占比${deepRatio.toFixed(1)}%，建议核实深层水用途`,
        affectedModules: ['waterQuality', 'exploitation'],
        blocking: false,
        fixSuggestion: `核实${q.city}深层水是否用于非饮用用途（工业/农业），或确认深层水质数据`,
        canAutoFix: false,
      });
    }

    // 水质优良率<20%且浅层开采占比>80% → 浅层水质差却大量开采
    const shallowRatio = exploit.total > 0 ? (exploit.shallow / exploit.total) * 100 : 0;
    if (q.rate < 20 && shallowRatio > 80) {
      issues.push({
        level: 'info',
        category: 'business',
        title: `${q.city}水质差但浅层开采占比高`,
        message: `水质优良率仅${q.rate}%，浅层开采占比${shallowRatio.toFixed(1)}%，浅层水主要用于农业灌溉，深层水供生活/工业`,
        affectedModules: ['waterQuality', 'exploitation'],
        blocking: false,
        fixSuggestion: `核实${q.city}浅层水是否经处理后用于农业灌溉（通常合理），或浅层开采井是否位于淡水透镜体区域`,
        canAutoFix: false,
      });
    }
  }

  return issues;
}

export function validateWaterQualityFunctionMatch(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // 检查水质较差城市是否有重要水源地
  const poorQualityCities = cityGroundwaterQuality2024
    .filter(q => q.rate < 30)
    .map(q => q.city);

  for (const ws of importantWaterSources) {
    const item = ws as any;
    if (item.city && poorQualityCities.includes(item.city)) {
      issues.push({
        level: 'warning', category: 'business',
        title: `${item.name}所在城市水质优良率偏低`,
        message: `${item.city}水质优良率<30%，但${item.name}为重要水源地，建议关注保护状况`,
        affectedModules: ['waterQuality', 'waterSource'], blocking: false,
        fixSuggestion: `核实${item.name}水源地保护措施是否到位，或更新水质监测数据`,
        canAutoFix: false,
      });
    }
  }
  return issues;
}

export function validateQualityImprovementCorrelation(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  // 使用qualityLevelTrend2020_2024数据检查III类以上比例趋势
  const validData = qualityLevelTrend2020_2024.filter(q => q.IIIplus !== undefined);
  if (validData.length < 3) return issues;

  // 检查2020-2024年改善是否持续
  for (let i = 1; i < validData.length; i++) {
    const prev = validData[i - 1];
    const curr = validData[i];
    if (curr.IIIplus < prev.IIIplus) {
      issues.push({
        level: 'warning', category: 'statistical',
        title: `${curr.year}年水质优良率下降`,
        message: `III类以上比例从${prev.IIIplus}%降至${curr.IIIplus}%，较${prev.year}年下降${(prev.IIIplus - curr.IIIplus).toFixed(1)}个百分点`,
        affectedModules: ['waterQuality'], blocking: false,
        fixSuggestion: `核实${curr.year}年水质数据，确认下降原因（监测点变化/污染事件/数据错误）`,
        canAutoFix: false,
      });
    }
  }

  // 检查水位回升与水质改善的同步性
  const shallowRiseData = validData.filter(d => d.shallowRise !== undefined && d.IIIplus !== undefined);
  if (shallowRiseData.length >= 3) {
    // 简单检查：水位回升年份水质也应改善
    for (let i = 1; i < shallowRiseData.length; i++) {
      const prev = shallowRiseData[i - 1];
      const curr = shallowRiseData[i];
      if (curr.shallowRise > prev.shallowRise && curr.IIIplus < prev.IIIplus) {
        issues.push({
          level: 'info', category: 'statistical',
          title: `${curr.year}年水位回升但水质未同步改善`,
          message: `水位回升${curr.shallowRise}m（较${prev.year}年+${(curr.shallowRise - prev.shallowRise).toFixed(2)}m），但III类以上比例下降${(prev.IIIplus - curr.IIIplus).toFixed(1)}个百分点`,
          affectedModules: ['waterQuality', 'groundwaterFunction'], blocking: false,
          fixSuggestion: `核实${curr.year}年水质监测数据，水位回升通常伴随水质改善`,
          canAutoFix: false,
        });
      }
    }
  }
  return issues;
}

export function validateWaterLevelQualitySpatial(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const city of Object.keys(cityWaterLevelYearly)) {
    const wl = cityWaterLevelYearly[city]?.[2024];
    const q = cityQualityYearly[city]?.[2024];
    if (wl == null || q == null) continue;
    if (wl > 25 && q > 60) {
      issues.push({
        level: 'info', category: 'consistency',
        title: `${city}水位深但水质优良`,
        message: `埋深${wl}m，达标率${q}%，深埋深通常伴随水质恶化`,
        affectedModules: ['hydrogeologyHistorical', 'waterQuality'], blocking: false,
        fixSuggestion: `核实${city}监测井深度和含水层位，深井可能开采深层优质水`,
        canAutoFix: false,
      });
    }
    if (wl < 5 && q < 20) {
      issues.push({
        level: 'info', category: 'consistency',
        title: `${city}水位浅但水质差`,
        message: `埋深${wl}m，达标率${q}%，浅层水易受污染`,
        affectedModules: ['hydrogeologyHistorical', 'waterQuality'], blocking: false,
        fixSuggestion: `核实${city}浅层水污染来源（农业面源/工业排放/生活污水）`,
        canAutoFix: false,
      });
    }
  }
  return issues;
}

export function validateMineralWaterQuality(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const site of mineralWaterSites) {
    const s = site as any;
    const type = s.type || '';

    // 偏硅酸型应检查SiO2
    if (type.includes('偏硅酸') && s.siO2 !== undefined) {
      const siO2 = parseFloat(s.siO2);
      if (!isNaN(siO2) && siO2 < 25) {
        issues.push({
          level: 'warning',
          category: 'range',
          title: `${s.name}偏硅酸未达界限指标`,
          message: `SiO₂=${s.siO2}mg/L，标准≥25mg/L（${s.status}）`,
          affectedModules: ['mineralWater'],
          blocking: false,
          fixSuggestion: `核实${s.name}的SiO₂数据(${s.siO2}mg/L)，若数据正确则标注为"未达标"`,
          canAutoFix: false,
        });
      }
    }

    // 锶型应检查锶
    if (type.includes('锶') && s.strontium !== undefined) {
      const sr = parseFloat(s.strontium);
      if (!isNaN(sr) && sr < 0.2) {
        issues.push({
          level: 'warning',
          category: 'range',
          title: `${s.name}锶含量未达界限指标`,
          message: `Sr=${s.strontium}mg/L，标准≥0.20mg/L（${s.status}）`,
          affectedModules: ['mineralWater'],
          blocking: false,
          fixSuggestion: `核实${s.name}的锶含量数据(${s.strontium}mg/L)，若数据正确则标注为"未达标"`,
          canAutoFix: false,
        });
      }
    }
  }

  return issues;
}
