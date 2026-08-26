/**
 * 裂隙水计算 — 岩性/径流模数/裂隙K/涌水量分级参考
 */

import type { LithologyPreset, RunoffModulusRef, FractureKRef, InflowGradeRef } from './fractureWaterTypes';

export const PRESET_LITHOLOGIES: LithologyPreset[] = [
  { name: '花岗岩裂隙水', rockType: '花岗岩', location: '承德-张家口', Kf: 0.15, M: 60, fractureRatio: 0.008, fractureAperture: 0.3, fractureDensity: 2.5, runoffModulus: 2.5, connectivity: 0.6, r0: 200, s0: 30, H: 60, R: 1200, note: '风化裂隙为主，深度30~80m' },
  { name: '片麻岩裂隙水', rockType: '片麻岩', location: '秦皇岛-唐山', Kf: 0.20, M: 50, fractureRatio: 0.010, fractureAperture: 0.4, fractureDensity: 3.0, runoffModulus: 3.0, connectivity: 0.65, r0: 180, s0: 25, H: 50, R: 1100, note: '构造裂隙发育，风化带厚' },
  { name: '砂岩裂隙水', rockType: '砂岩', location: '承德-张家口', Kf: 0.25, M: 80, fractureRatio: 0.012, fractureAperture: 0.5, fractureDensity: 3.5, runoffModulus: 3.5, connectivity: 0.7, r0: 250, s0: 40, H: 80, R: 1500, note: '层间裂隙含水，砂岩孔隙-裂隙双重介质' },
  { name: '灰岩裂隙水', rockType: '灰岩', location: '邢台-邯郸西部', Kf: 0.50, M: 120, fractureRatio: 0.015, fractureAperture: 0.8, fractureDensity: 4.0, runoffModulus: 5.0, connectivity: 0.75, r0: 300, s0: 50, H: 120, R: 2000, note: '岩溶裂隙发育，富水性强' },
  { name: '火山岩裂隙水', rockType: '火山岩', location: '张家口-承德', Kf: 0.10, M: 45, fractureRatio: 0.006, fractureAperture: 0.2, fractureDensity: 2.0, runoffModulus: 1.5, connectivity: 0.5, r0: 150, s0: 20, H: 45, R: 800, note: '柱状节理发育，连通性较差' },
  { name: '变质岩裂隙水', rockType: '变质岩', location: '保定-石家庄西部', Kf: 0.12, M: 55, fractureRatio: 0.007, fractureAperture: 0.25, fractureDensity: 2.2, runoffModulus: 2.0, connectivity: 0.55, r0: 170, s0: 25, H: 55, R: 1000, note: '片理/劈理发育，低渗透性' },
];

// ═══════════════════════════════════════════════════════
// 径流模数参考表
// ═══════════════════════════════════════════════════════


export const RUNOFF_MODULUS_REF: RunoffModulusRef[] = [
  { rockType: '花岗岩类', range: '1~4', avg: 2.5, grade: '较贫乏', distribution: '承德北部、张家口北部' },
  { rockType: '片麻岩类', range: '2~5', avg: 3.0, grade: '中等', distribution: '秦皇岛、唐山北部' },
  { rockType: '砂岩类', range: '2~6', avg: 3.5, grade: '中等', distribution: '承德、张家口中生界' },
  { rockType: '灰岩类', range: '3~10', avg: 5.0, grade: '较丰富', distribution: '太行山前寒武系-奥陶系' },
  { rockType: '火山岩类', range: '0.5~3', avg: 1.5, grade: '贫乏', distribution: '张家口、承德侏罗-白垩系' },
  { rockType: '变质岩类', range: '1~3', avg: 2.0, grade: '较贫乏', distribution: '保定、石家庄五台群' },
];

// ═══════════════════════════════════════════════════════
// 裂隙渗透系数参考表
// ═══════════════════════════════════════════════════════


export const FRACTURE_K_REF: FractureKRef[] = [
  { fractureGrade: '极弱', apertureRange: '<0.1mm', KfRange: '<0.05', KfAvg: 0.03, typical: '微裂隙，闭合状，几乎不透水' },
  { fractureGrade: '弱', apertureRange: '0.1~0.3mm', KfRange: '0.05~0.15', KfAvg: 0.10, typical: '细裂隙，弱透水' },
  { fractureGrade: '中等', apertureRange: '0.3~0.5mm', KfRange: '0.15~0.35', KfAvg: 0.25, typical: '中等裂隙，构造裂隙带' },
  { fractureGrade: '强', apertureRange: '0.5~1.0mm', KfRange: '0.35~0.80', KfAvg: 0.50, typical: '宽大裂隙，岩溶裂隙发育' },
  { fractureGrade: '极强', apertureRange: '>1.0mm', KfRange: '>0.80', KfAvg: 1.20, typical: '溶蚀裂隙，岩溶管道发育' },
];

// ═══════════════════════════════════════════════════════
// 涌水量分级标准
// ═══════════════════════════════════════════════════════


export const INFLOW_GRADES: InflowGradeRef[] = [
  { grade: '极小', range: '<50', min: 0, max: 50, measure: '仅可满足小型供水' },
  { grade: '小', range: '50~200', min: 50, max: 200, measure: '可满足村镇供水' },
  { grade: '中等', range: '200~500', min: 200, max: 500, measure: '可满足乡镇供水' },
  { grade: '大', range: '500~1000', min: 500, max: 1000, measure: '可满足县城供水' },
  { grade: '极大', range: '≥1000', min: 1000, max: Infinity, measure: '可满足城市供水' },
];

// ═══════════════════════════════════════════════════════
// 核心计算函数
// ═══════════════════════════════════════════════════════

