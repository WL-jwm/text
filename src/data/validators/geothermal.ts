/* eslint-disable @typescript-eslint/no-explicit-any */
/* 自动拆分生成：geothermal 域交叉校验函数 */
import type { ValidationIssue } from '../dataValidation';

import { groundwaterExploitation2024 } from '../exploitation';
import { geothermalFields, geothermalFluidChemistry, geothermalGradient, geothermalResources, reinjectionDataExtended } from '../geothermal';
import { mineralWaterSites } from '../mineralWater';
import { citySalineArea } from '../salineWater';
import { importantWaterSources } from '../waterSource';

export function validateGeothermalGradient(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const g of geothermalGradient) {
    // 解析梯度范围字符串如 "3.5~4.2"
    const parts = g.gradient.split('~');
    if (parts.length === 2) {
      const minVal = parseFloat(parts[0]);
      const maxVal = parseFloat(parts[1]);
      if (isNaN(minVal) || isNaN(maxVal)) continue;

      if (minVal < 1.5 || maxVal > 6.0) {
        issues.push({
          level: 'warning',
          category: 'range',
          title: `${g.region}地热梯度异常`,
          message: `梯度 ${g.gradient}°C/100m，典型范围1.5~6.0°C/100m`,
          affectedModules: ['geothermal'],
          blocking: false,
          fixSuggestion: `核实${g.region}地热梯度${g.gradient}°C/100m，确认是否为特殊地质条件导致`,
          canAutoFix: false,
        });
      }
    }
  }

  return issues;
}

export function validateGeothermalMineralOverlap(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const field of geothermalFields) {
    const f = field as any;
    if (!f.lng || !f.lat) continue;
    for (const site of mineralWaterSites) {
      const s = site as any;
      if (!s.lng || !s.lat) continue;
      const dist = Math.sqrt((f.lng - s.lng) ** 2 + (f.lat - s.lat) ** 2);
      if (dist < 0.05) {
        issues.push({
          level: 'info', category: 'business',
          title: `${f.name}地热田与${s.name}矿泉水产地重叠`,
          message: `距离约${(dist * 111).toFixed(0)}km，地热与矿泉水开采层位应不同`,
          affectedModules: ['geothermal', 'mineralWater'], blocking: false,
          fixSuggestion: `核实${f.name}和${s.name}的开采层位，确认是否存在层位冲突`,
          canAutoFix: false,
        });
      }
    }
  }
  return issues;
}

export function validateGeothermalWellTemp(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const field of geothermalFields) {
    const f = field as any;
    if (f.temperature == null) continue;
    if (f.temperature < 25) {
      issues.push({
        level: 'warning', category: 'range',
        title: `${f.name}井口水温偏低`,
        message: `温度${f.temperature}°C，河北地热田典型井口温度≥30°C`,
        affectedModules: ['geothermal'], blocking: false,
        fixSuggestion: `核实${f.name}是否为低温地热资源或温泉`,
        canAutoFix: false,
      });
    }
    if (f.temperature > 150) {
      issues.push({
        level: 'warning', category: 'range',
        title: `${f.name}井口水温异常偏高`,
        message: `温度${f.temperature}°C，河北地热田典型井口温度30~120°C`,
        affectedModules: ['geothermal'], blocking: false,
        fixSuggestion: `核实${f.name}测温数据或是否为深层干热岩资源`,
        canAutoFix: false,
      });
    }
  }
  return issues;
}

export function validateGeothermalAreaReserve(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const entries = Array.isArray(geothermalResources) ? geothermalResources : Object.entries(geothermalResources).map(([, v]) => v as any);
  for (const res of entries) {
    const r = res as any;
    if (!r.area || !r.thermalReserve) continue;
    const unitReserve = r.thermalReserve / r.area;
    if (unitReserve > 500) {
      issues.push({
        level: 'info', category: 'consistency',
        title: `${r.name}单位面积热储量偏高`,
        message: `${unitReserve.toFixed(0)}万t标煤/km²，典型范围5~500`,
        affectedModules: ['geothermal'], blocking: false,
        fixSuggestion: `核实${r.name}热储量计算参数（厚度、温度、比热容等）`,
        canAutoFix: false,
      });
    }
  }
  return issues;
}

export function validateGeothermalFluidChemistry(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!Array.isArray(geothermalFluidChemistry)) return issues;
  for (const sample of geothermalFluidChemistry) {
    const s = sample as any;
    if (s.tds == null) continue;
    if (s.tds < 0.3) {
      issues.push({
        level: 'info', category: 'range',
        title: `${s.field || s.name || '未命名'}地热流体矿化度偏低`,
        message: `TDS=${s.tds}g/L，河北地热流体典型范围0.5~15g/L`,
        affectedModules: ['geothermal'], blocking: false,
        fixSuggestion: `核实矿化度数据或确认是否为大气降水补给型低温地热`,
        canAutoFix: false,
      });
    }
    if (s.tds > 20) {
      issues.push({
        level: 'warning', category: 'range',
        title: `${s.field || s.name || '未命名'}地热流体矿化度偏高`,
        message: `TDS=${s.tds}g/L，可能为古封存卤水`,
        affectedModules: ['geothermal'], blocking: false,
        fixSuggestion: `核实矿化度数据，高TDS地热流体不宜直接用于供暖回灌`,
        canAutoFix: false,
      });
    }
  }
  return issues;
}

export function validateGeothermalReinjectionRate(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!Array.isArray(reinjectionDataExtended)) return issues;
  for (const item of reinjectionDataExtended) {
    const r = item as any;
    if (r.rate == null) continue;
    if (r.rate < 70) {
      issues.push({
        level: 'warning', category: 'business',
        title: `${r.field || r.name || '未命名'}回灌率偏低`,
        message: `回灌率${r.rate}%，河北省要求≥80%`,
        affectedModules: ['geothermal'], blocking: false,
        fixSuggestion: `提高${r.field || r.name}回灌率至80%以上，防止地热田压力下降`,
        canAutoFix: false,
      });
    }
  }
  return issues;
}

export function validateMineralWaterSourceOverlap(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const site of mineralWaterSites) {
    const s = site as any;
    if (!s.lng || !s.lat) continue;
    for (const ws of importantWaterSources) {
      const w = ws as any;
      if (!w.lng || !w.lat) continue;
      const dist = Math.sqrt((s.lng - w.lng) ** 2 + (s.lat - w.lat) ** 2);
      if (dist < 0.05) {
        issues.push({
          level: 'info', category: 'business',
          title: `${s.name}与水源地${w.name}空间重叠`,
          message: `距离约${(dist * 111).toFixed(0)}km，建议核实是否相互影响`,
          affectedModules: ['mineralWater', 'waterSource'], blocking: false,
          fixSuggestion: `核实${s.name}与${w.name}的空间关系，确认开采层位是否冲突`,
          canAutoFix: false,
        });
      }
    }
  }
  return issues;
}

export function validateSalineExploitationConflict(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const sa of citySalineArea) {
    const s = sa as any;
    if (!s.city || !s.area) continue;
    const exploit = groundwaterExploitation2024.find((e: any) => e.city === s.city);
    if (!exploit) continue;
    const shallowRatio = exploit.total > 0 ? (exploit.shallow / exploit.total) * 100 : 0;
    if (s.area > 500 && shallowRatio > 60) {
      issues.push({
        level: 'warning', category: 'business',
        title: `${s.city}咸水面积大但浅层开采占比高`,
        message: `咸水分布${s.area}km²，浅层开采占比${shallowRatio.toFixed(1)}%，存在咸水入侵风险`,
        affectedModules: ['salineWater', 'exploitation'], blocking: false,
        fixSuggestion: `建议${s.city}控制浅层开采量，增加深层水或地表水替代`,
        canAutoFix: false,
      });
    }
  }
  return issues;
}
