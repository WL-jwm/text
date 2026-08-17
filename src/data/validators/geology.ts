/* eslint-disable @typescript-eslint/no-explicit-any */
/* 自动拆分生成：geology 域交叉校验函数 */
import type { ValidationIssue } from '../dataValidation';

import { deepCones2024, shallowCones2024 } from '../environment';
import { majorFaults, tectonicUnits } from '../geology';
import { cityOverdraftZones } from '../groundwaterFunction';
import { aquiferGroups, lithologyMu, permeability } from '../hydroParams';
import { karstRechargeFeatures, karstSprings } from '../karstWater';
import { importantWaterSources } from '../waterSource';
import { systemZones } from '../zoneParams';

export function validateConeAreas(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const cone of shallowCones2024) {
    if (cone.waterLevel < 0) {
      issues.push({
        level: 'warning',
        category: 'range',
        title: `${cone.name}水位埋深异常`,
        message: `水位埋深 ${cone.waterLevel}m 为负值（应>0）`,
        affectedModules: ['environment'],
        blocking: false,
        fixSuggestion: `将${cone.name}的waterLevel取绝对值，或核实原始监测数据`,
        canAutoFix: true,
      });
    }
    if (cone.area < 0) {
      issues.push({
        level: 'error',
        category: 'range',
        title: `${cone.name}漏斗面积异常`,
        message: `面积 ${cone.area}km² 为负值`,
        affectedModules: ['environment'],
        blocking: true,
        fixSuggestion: `将${cone.name}的area取绝对值`,
        canAutoFix: true,
      });
    }
  }

  for (const cone of deepCones2024) {
    if (cone.waterLevel < 0) {
      issues.push({
        level: 'warning',
        category: 'range',
        title: `${cone.name}深层水位埋深异常`,
        message: `水位埋深 ${cone.waterLevel}m 为负值（应>0）`,
        affectedModules: ['environment'],
        blocking: false,
        fixSuggestion: `将${cone.name}的waterLevel取绝对值，或核实原始监测数据`,
        canAutoFix: true,
      });
    }
  }

  return issues;
}

export function validateHydroParamsRange(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const p of lithologyMu) {
    if ((p as any).value !== undefined && ((p as any).value < 0 || (p as any).value > 0.4)) {
      issues.push({
        level: 'warning',
        category: 'range',
        title: `给水度异常: ${(p as any).lith || (p as any).name}`,
        message: `μ = ${(p as any).value}，典型范围0~0.35`,
        affectedModules: ['hydroParams'],
        blocking: false,
        fixSuggestion: `将${(p as any).lith || (p as any).name}的μ值${(p as any).value}修正至0~0.35范围内`,
        canAutoFix: false,
      });
    }
  }

  for (const p of permeability) {
    const v = (p as any).K || (p as any).value;
    if (v !== undefined && (v < 0.001 || v > 1000)) {
      issues.push({
        level: 'warning',
        category: 'range',
        title: `渗透系数异常: ${(p as any).lith || (p as any).name}`,
        message: `K = ${v} m/d，典型范围0.01~500 m/d`,
        affectedModules: ['hydroParams'],
        blocking: false,
        fixSuggestion: `将${(p as any).lith || (p as any).name}的K值${v}修正至0.01~500 m/d范围内`,
        canAutoFix: false,
      });
    }
  }

  return issues;
}

export function validateGeologyParams(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const unit of tectonicUnits) {
    const u = unit as any;
    if (u.area !== undefined && u.area < 0) {
      issues.push({
        level: 'error',
        category: 'range',
        title: `构造单元面积异常: ${u.name}`,
        message: `面积 ${u.area} 为负值`,
        affectedModules: ['geology'],
        blocking: true,
        fixSuggestion: `将${u.name}的area取绝对值`,
        canAutoFix: true,
      });
    }
  }

  for (const fault of majorFaults) {
    const f = fault as any;
    if (f.length !== undefined && f.length < 0) {
      issues.push({
        level: 'error',
        category: 'range',
        title: `断裂长度异常: ${f.name}`,
        message: `长度 ${f.length}km 为负值`,
        affectedModules: ['geology'],
        blocking: true,
        fixSuggestion: `将${f.name}的length取绝对值`,
        canAutoFix: true,
      });
    }
  }

  return issues;
}

export function validateWaterSourceCoordinates(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const ws of importantWaterSources) {
    const item = ws as any;
    if (item.lng !== undefined && (item.lng < 113 || item.lng > 120)) {
      issues.push({
        level: 'warning',
        category: 'range',
        title: `水源地坐标异常: ${item.name}`,
        message: `经度 ${item.lng}° 超出河北省范围(113~120°)`,
        affectedModules: ['waterSource'],
        blocking: false,
        fixSuggestion: `核实${item.name}的经度(${item.lng}°)，河北省范围113~120°`,
        canAutoFix: false,
      });
    }
    if (item.lat !== undefined && (item.lat < 36 || item.lat > 43)) {
      issues.push({
        level: 'warning',
        category: 'range',
        title: `水源地坐标异常: ${item.name}`,
        message: `纬度 ${item.lat}° 超出河北省范围(36~43°)`,
        affectedModules: ['waterSource'],
        blocking: false,
        fixSuggestion: `核实${item.name}的纬度(${item.lat}°)，河北省范围36~43°`,
        canAutoFix: false,
      });
    }
  }

  return issues;
}

export function validateParamSpatialConsistency(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (let i = 0; i < aquiferGroups.length; i++) {
    for (let j = i + 1; j < aquiferGroups.length; j++) {
      const a = aquiferGroups[i] as any;
      const b = aquiferGroups[j] as any;
      if (!a.K || !b.K) continue;
      const ratio = Math.max(a.K, b.K) / Math.min(a.K, b.K);
      if (ratio > 10) {
        issues.push({
          level: 'info', category: 'statistical',
          title: `${a.name}与${b.name}渗透系数差异大`,
          message: `K比值=${ratio.toFixed(1)}倍（${a.K} vs ${b.K} m/d），建议核实`,
          affectedModules: ['hydroParams'], blocking: false,
          fixSuggestion: `核实${a.name}和${b.name}的渗透系数，确认是否因岩性差异导致`,
          canAutoFix: false,
        });
      }
    }
  }
  return issues;
}

export function validateSpringRechargeConsistency(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const rf of karstRechargeFeatures) {
    if (rf.rechargeArea > 0 && rf.totalRecharge > 0) {
      const unitRecharge = (rf.totalRecharge * 10000) / rf.rechargeArea; // 万m³/km²

      if (unitRecharge < 5) {
        issues.push({
          level: 'info',
          category: 'range',
          title: `${rf.spring}单位面积补给量偏低`,
          message: `${unitRecharge.toFixed(2)}万m³/km²·a，典型范围5~15`,
          affectedModules: ['karstWater'],
          blocking: false,
          fixSuggestion: `核实${rf.spring}的补给面积(${rf.rechargeArea}km²)或总补给量(${rf.totalRecharge}万m³/a)数据`,
          canAutoFix: false,
        });
      }
      if (unitRecharge > 15) {
        issues.push({
          level: 'info',
          category: 'range',
          title: `${rf.spring}单位面积补给量偏高`,
          message: `${unitRecharge.toFixed(2)}万m³/km²·a，典型范围5~15`,
          affectedModules: ['karstWater'],
          blocking: false,
          fixSuggestion: `核实${rf.spring}的补给面积(${rf.rechargeArea}km²)或总补给量(${rf.totalRecharge}万m³/a)数据`,
          canAutoFix: false,
        });
      }
    }

    // 入渗系数合理性
    if (rf.infiltrationCoeff < 0.1 || rf.infiltrationCoeff > 0.5) {
      issues.push({
        level: 'info',
        category: 'range',
        title: `${rf.spring}入渗系数异常`,
        message: `α=${rf.infiltrationCoeff}，典型范围0.1~0.5`,
        affectedModules: ['karstWater'],
        blocking: false,
        fixSuggestion: `核实${rf.spring}的入渗系数(${rf.infiltrationCoeff})，确认是否为特殊岩溶条件`,
        canAutoFix: false,
      });
    }
  }

  return issues;
}

export function validateSpringFlowVariation(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const spring of karstSprings) {
    const s = spring as any;
    if (!s.flow || !s.historicalFlow) continue;
    const change = Math.abs(s.flow - s.historicalFlow) / s.historicalFlow * 100;
    if (change > 50) {
      issues.push({
        level: 'warning', category: 'statistical',
        title: `${s.name}流量年际变化大`,
        message: `当前${s.flow}m³/s，历史${s.historicalFlow}m³/s，变化${change.toFixed(0)}%`,
        affectedModules: ['karstWater'], blocking: false,
        fixSuggestion: `核实${s.name}流量数据，确认是否因气候/开采条件变化导致`,
        canAutoFix: false,
      });
    }
  }
  return issues;
}

export function validateZoneOverdraftMatch(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const zoneNames = new Set(systemZones.map(z => z.name));
  for (const zone of cityOverdraftZones) {
    const z = zone as any;
    if (z.systemZone && !zoneNames.has(z.systemZone)) {
      issues.push({
        level: 'warning', category: 'consistency',
        title: `${z.city}超采区系统区划不匹配`,
        message: `标注的系统区划"${z.systemZone}"不在已注册的系统区划列表中`,
        affectedModules: ['groundwaterFunction', 'zoneParams'], blocking: false,
        fixSuggestion: `将${z.city}的systemZone修正为已注册的系统区划名称`,
        canAutoFix: false,
      });
    }
  }
  return issues;
}
