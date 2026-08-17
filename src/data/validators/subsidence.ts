/* eslint-disable @typescript-eslint/no-explicit-any */
/* 自动拆分生成：subsidence 域交叉校验函数 */
import type { ValidationIssue } from '../dataValidation';

import { groundwaterExploitation2024 } from '../exploitation';
import { TS_FULL_YEARS, citySubsidenceYearly, cityWaterLevelYearly } from '../historicalTimeSeries';

export function validateSubsidenceRange(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const [city, data] of Object.entries(citySubsidenceYearly)) {
    for (const year of TS_FULL_YEARS) {
      const val = data[year];
      if (val == null) continue;
      if (val < 0) {
        issues.push({
          level: 'error', category: 'range',
          title: `${city}${year}年沉降速率为负`,
          message: `速率${val}mm/a不应为负值（正值=地面下沉）`,
          affectedModules: ['hydrogeologyHistorical'], blocking: true,
          fixSuggestion: `将${city}${year}年沉降速率取绝对值`,
          canAutoFix: true,
        });
      }
      if (val > 200) {
        issues.push({
          level: 'warning', category: 'range',
          title: `${city}${year}年沉降速率异常偏大`,
          message: `速率${val}mm/a，河北平原典型范围0~200mm/a`,
          affectedModules: ['hydrogeologyHistorical'], blocking: false,
          fixSuggestion: `核实${city}${year}年沉降监测数据，确认是否为局部沉降漏斗中心数据`,
          canAutoFix: false,
        });
      }
    }
  }
  return issues;
}

export function validateSubsidenceAbruptChange(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const [city, data] of Object.entries(citySubsidenceYearly)) {
    for (let i = 1; i < TS_FULL_YEARS.length; i++) {
      const prev = data[TS_FULL_YEARS[i - 1]];
      const curr = data[TS_FULL_YEARS[i]];
      if (prev == null || curr == null) continue;
      const change = Math.abs(curr - prev);
      if (change > 15) {
        issues.push({
          level: 'warning', category: 'range',
          title: `${city}${TS_FULL_YEARS[i]}年沉降速率突变`,
          message: `${TS_FULL_YEARS[i - 1]}年${prev}→${TS_FULL_YEARS[i]}年${curr}mm/a，变化${change.toFixed(1)}mm/a`,
          affectedModules: ['hydrogeologyHistorical'], blocking: false,
          fixSuggestion: `核实${city}${TS_FULL_YEARS[i]}年InSAR/水准测量数据`,
          canAutoFix: false,
        });
      }
    }
  }
  return issues;
}

export function validateSubsidenceDeceleration(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const [city, data] of Object.entries(citySubsidenceYearly)) {
    const v2018 = data[2018];
    const v2024 = data[2024];
    if (v2018 == null || v2024 == null) continue;
    if (v2024 > v2018 + 2) {
      issues.push({
        level: 'warning', category: 'business',
        title: `${city}沉降速率近年反弹`,
        message: `2018年${v2018}→2024年${v2024}mm/a，速率增大${(v2024 - v2018).toFixed(1)}mm/a`,
        affectedModules: ['hydrogeologyHistorical'], blocking: false,
        fixSuggestion: `核实${city}2020年后开采量变化，沉降反弹可能与局部工程活动或含水层蠕变有关`,
        canAutoFix: false,
      });
    }
  }
  return issues;
}

export function validateSubsidenceWaterLevelLag(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const [city, wlData] of Object.entries(cityWaterLevelYearly)) {
    const subData = citySubsidenceYearly[city];
    if (!subData) continue;
    const wl14 = wlData[2014], wl24 = wlData[2024];
    const sub14 = subData[2014], sub24 = subData[2024];
    if (wl14 == null || wl24 == null || sub14 == null || sub24 == null) continue;
    const wlRecovery = wl14 - wl24;
    const subReduction = sub14 > 0 ? (sub14 - sub24) / sub14 * 100 : 0;
    if (wlRecovery > 2 && subReduction < 10) {
      issues.push({
        level: 'info', category: 'consistency',
        title: `${city}水位回升但沉降减缓不明显`,
        message: `水位回升${wlRecovery.toFixed(1)}m，沉降仅减缓${subReduction.toFixed(1)}%，含水层蠕变滞后效应`,
        affectedModules: ['hydrogeologyHistorical'], blocking: false,
        fixSuggestion: `含水层黏性土蠕变导致沉降滞后于水位回升1~3年，属正常现象，持续监测`,
        canAutoFix: false,
      });
    }
  }
  return issues;
}

export function validateExploitationSubsidenceSpatial(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const city of Object.keys(citySubsidenceYearly)) {
    const sub = citySubsidenceYearly[city]?.[2024];
    const exp = groundwaterExploitation2024.find((e: any) => e.city === city);
    if (sub == null || !exp) continue;
    const deepRatio = exp.total > 0 ? (exp.deep / exp.total) * 100 : 0;
    if (deepRatio > 40 && sub < 5) {
      issues.push({
        level: 'info', category: 'consistency',
        title: `${city}深层开采多但沉降轻微`,
        message: `深层占比${deepRatio.toFixed(1)}%，沉降${sub}mm/a`,
        affectedModules: ['exploitation', 'hydrogeologyHistorical'], blocking: false,
        fixSuggestion: `核实${city}深层含水层压缩性参数或沉降监测精度`,
        canAutoFix: false,
      });
    }
  }
  return issues;
}

export function validateWaterLevelExploitationCorrelation(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const [city, data] of Object.entries(cityWaterLevelYearly)) {
    const wl14 = data[2014], wl24 = data[2024];
    const exp = groundwaterExploitation2024.find((e: any) => e.city === city);
    if (!exp || wl14 == null || wl24 == null) continue;
    if ((exp.reductionVs2014 ?? 0) > 10 && wl24 > wl14) {
      issues.push({
        level: 'info', category: 'consistency',
        title: `${city}开采减少但水位未回升`,
        message: `开采降幅${exp.reductionVs2014}%，但埋深${wl14}→${wl24}m（增大${(wl24 - wl14).toFixed(1)}m）`,
        affectedModules: ['hydrogeologyHistorical', 'exploitation'], blocking: false,
        fixSuggestion: `水位回升滞后于开采削减，核实${city}含水层补给条件或监测井代表性`,
        canAutoFix: false,
      });
    }
  }
  return issues;
}
