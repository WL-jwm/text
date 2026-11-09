/**
 * 拆分自 subsidenceCalculator.ts — 地面沉降常量与预设数据
 */

import type { RiskZone, TrendPoint, SubsidenceRisk, ConeInput } from './subsidenceTypes';

// ═══════════════════════════════════════════════════════
// 常量
// ═══════════════════════════════════════════════════════

export const SUBSIDENCE_RISK_META: Record<SubsidenceRisk, { color: string; bgColor: string }> = {
  '低': { color: '#10b981', bgColor: 'bg-emerald-500/15' },
  '中': { color: '#3b82f6', bgColor: 'bg-blue-500/15' },
  '较高': { color: '#f59e0b', bgColor: 'bg-amber-500/15' },
  '高': { color: '#f97316', bgColor: 'bg-orange-500/15' },
  '严重': { color: '#ef4444', bgColor: 'bg-red-500/15' },
};

export const RISK_ZONES: RiskZone[] = [
  { name: '低风险', range: '<50mm', color: '#10b981', description: '累计沉降量<50mm，年速率<5mm/a', measure: '常规监测' },
  { name: '中风险', range: '50~200mm', color: '#3b82f6', description: '累计沉降50~200mm，年速率5~15mm/a', measure: '控制开采+加密监测' },
  { name: '较高风险', range: '200~500mm', color: '#f59e0b', description: '累计沉降200~500mm，年速率15~30mm/a', measure: '限采+回灌+地面设施防护' },
  { name: '高风险', range: '500~1000mm', color: '#f97316', description: '累计沉降500~1000mm，年速率30~50mm/a', measure: '禁采+回灌+建筑物加固' },
  { name: '严重', range: '>1000mm', color: '#ef4444', description: '累计沉降>1000mm，年速率>50mm/a', measure: '应急措施+深部禁采+替代水源' },
];

export const LAYER_TYPES = [
  { name: '粉质黏土', Ss: 0.0005, e0: 0.8, Cc: 0.15 },
  { name: '黏土', Ss: 0.0008, e0: 1.0, Cc: 0.20 },
  { name: '粉土', Ss: 0.0003, e0: 0.6, Cc: 0.10 },
  { name: '粉细砂', Ss: 0.0002, e0: 0.5, Cc: 0.05 },
  { name: '中粗砂', Ss: 0.0001, e0: 0.4, Cc: 0.03 },
  { name: '砾砂', Ss: 0.00005, e0: 0.3, Cc: 0.02 },
];

// ═══════════════════════════════════════════════════════
// 预设数据
// ═══════════════════════════════════════════════════════

/** 河北典型地面沉降监测数据（历史数据 + 预测） */
export const SUBSIDENCE_TREND: TrendPoint[] = [
  { year: 1990, cumulative: 30, rate: 5, predicted: false },
  { year: 1995, cumulative: 60, rate: 6, predicted: false },
  { year: 2000, cumulative: 110, rate: 10, predicted: false },
  { year: 2005, cumulative: 190, rate: 16, predicted: false },
  { year: 2010, cumulative: 310, rate: 24, predicted: false },
  { year: 2015, cumulative: 450, rate: 28, predicted: false },
  { year: 2020, cumulative: 570, rate: 24, predicted: false },
  { year: 2024, cumulative: 660, rate: 18, predicted: false },
  { year: 2025, cumulative: 680, rate: 16, predicted: true },
  { year: 2026, cumulative: 700, rate: 14, predicted: true },
  { year: 2028, cumulative: 730, rate: 12, predicted: true },
  { year: 2030, cumulative: 755, rate: 10, predicted: true },
];

/** 典型漏斗输入预设 */
export const TYPICAL_CONE_INPUTS: Array<{ name: string; input: ConeInput }> = [
  { name: '浅层开采井', input: { Q: 3000, T: 500, S: 0.1, M: 40, rw: 0.3, t: 365, K: 12.5, model: 'Dupuit' } },
  { name: '深层开采井', input: { Q: 5000, T: 800, S: 0.001, M: 80, rw: 0.3, t: 365, K: 10, model: 'Dupuit' } },
  { name: '降水疏干井', input: { Q: 1000, T: 300, S: 0.15, M: 20, rw: 0.3, t: 90, K: 15, model: 'Theis' } },
  { name: '基岩开采井', input: { Q: 2000, T: 200, S: 0.005, M: 100, rw: 0.3, t: 365, K: 2, model: 'Dupuit' } },
  { name: '水源地开采井', input: { Q: 8000, T: 1200, S: 0.08, M: 60, rw: 0.4, t: 365, K: 20, model: 'Theis' } },
];

/** 河北典型沉降区 */
export const SUBSIDENCE_ZONES = [
  { name: '沧州城区', cumulative: 1050, rate: 25, risk: '严重' as SubsidenceRisk },
  { name: '任丘油田区', cumulative: 880, rate: 20, risk: '高' as SubsidenceRisk },
  { name: '廊坊城区', cumulative: 620, rate: 18, risk: '高' as SubsidenceRisk },
  { name: '衡水城区', cumulative: 550, rate: 15, risk: '较高' as SubsidenceRisk },
  { name: '唐山丰南', cumulative: 480, rate: 12, risk: '较高' as SubsidenceRisk },
  { name: '邯郸东部', cumulative: 350, rate: 10, risk: '中' as SubsidenceRisk },
  { name: '保定北部', cumulative: 180, rate: 6, risk: '中' as SubsidenceRisk },
  { name: '石家庄市区', cumulative: 120, rate: 4, risk: '低' as SubsidenceRisk },
];
