/**
 * 修复方案评估器 共享常量（自 RemediationTab.tsx 拆分）
 */
import { FlaskConical, Droplets, GitBranch, Sprout, Wind, Scale, BookOpen } from 'lucide-react';
import type { PRBInput, PATInput, MNAInput, BioInput, ASInput, MCDAInput } from '../../utils/remediationEvaluator';

export const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#e2e8f0' },
  itemStyle: { color: '#94a3b8' },
};

export const TABS = [
  { key: 'prb', label: 'PRB反应墙', icon: FlaskConical },
  { key: 'pat', label: '抽出处理', icon: Droplets },
  { key: 'mna', label: '自然衰减', icon: GitBranch },
  { key: 'bio', label: '生物修复', icon: Sprout },
  { key: 'as', label: '气相抽提', icon: Wind },
  { key: 'mcda', label: '方案比选', icon: Scale },
  { key: 'ref', label: '参考说明', icon: BookOpen },
] as const;

export type TabKey = typeof TABS[number]['key'];

// 默认参数
export const DEFAULT_PRB: PRBInput = {
  aquiferThickness: 10, hydraulicGradient: 0.003, hydraulicConductivity: 5,
  porosity: 0.25, plumeWidth: 80, initialConcentration: 5.0,
  targetConcentration: 0.05, mediaHalfLife: 3650, reactionRateConstant: 0.5,
  designLife: 20,
};

export const DEFAULT_PAT: PATInput = {
  hydraulicConductivity: 5, aquiferThickness: 10, hydraulicGradient: 0.003,
  porosity: 0.25, plumeArea: 2000, initialConcentration: 5.0,
  targetConcentration: 0.05, pumpingRate: 25, wellRadius: 0.1,
  storageCoefficient: 0.001, designPeriod: 15,
};

export const DEFAULT_MNA: MNAInput = {
  initialConcentration: 5.0, targetConcentration: 0.05, decayRate: 0.001,
  groundwaterVelocity: 0.06, sourceDistance: 200, porosity: 0.25,
  aquiferThickness: 10, hydraulicConductivity: 5, hydraulicGradient: 0.003,
  monitoringWells: 8, designPeriod: 30,
};

export const DEFAULT_BIO: BioInput = {
  initialConcentration: 5.0, targetConcentration: 0.05, temperature: 16,
  pH: 7.2, dissolvedOxygen: 2.0, nitrate: 5.0, sulfate: 50, fe3: 10,
  toc: 5, microbialCount: 10000, hydraulicConductivity: 5, porosity: 0.25,
  plumeVolume: 20000, designPeriod: 20,
};

export const DEFAULT_AS: ASInput = {
  initialConcentration: 5.0, targetConcentration: 0.05, henryConstant: 0.01,
  aquiferThickness: 10, hydraulicConductivity: 5, porosity: 0.25,
  saturation: 1.0, plumeArea: 2000, depthToWater: 5, designPeriod: 10,
};

// 默认MCDA方案
export const DEFAULT_MCDA: MCDAInput = {
  alternatives: [
    { id: 'prb', name: 'PRB反应墙', cost: 80, remediationTime: 0, scores: { efficiency: 90, cost: 50, time: 95, feasibility: 75, risk: 85, sustainability: 80 } },
    { id: 'pat', name: '抽出处理', cost: 120, remediationTime: 12, scores: { efficiency: 85, cost: 40, time: 55, feasibility: 90, risk: 60, sustainability: 50 } },
    { id: 'mna', name: '自然衰减', cost: 30, remediationTime: 25, scores: { efficiency: 55, cost: 95, time: 20, feasibility: 80, risk: 90, sustainability: 95 } },
    { id: 'bio', name: '生物修复', cost: 60, remediationTime: 8, scores: { efficiency: 70, cost: 75, time: 65, feasibility: 60, risk: 80, sustainability: 90 } },
    { id: 'as', name: '气相抽提', cost: 70, remediationTime: 4, scores: { efficiency: 75, cost: 70, time: 80, feasibility: 65, risk: 65, sustainability: 70 } },
  ],
  weights: { efficiency: 0.30, cost: 0.20, time: 0.20, feasibility: 0.15, risk: 0.10, sustainability: 0.05 },
  criteriaLabels: { efficiency: '去除效率', cost: '经济性', time: '修复速度', feasibility: '技术可行性', risk: '二次污染风险', sustainability: '可持续性' },
};
