/**
 * 地下水修复方案评估器 (B-38) — 技术对比表（自 remediationEvaluator 拆分）
 */

export interface TechComparison {
  metric: string;
  prb: string;
  pat: string;
  mna: string;
  bio: string;
  as: string;
}

export const TECH_COMPARISON_TABLE: TechComparison[] = [
  { metric: '适用污染物', prb: '重金属/有机物', pat: '广谱', mna: '可降解有机物', bio: '有机物/部分无机', as: '挥发性有机物' },
  { metric: '含水层渗透性要求', prb: '中-高', pat: '中-高', mna: '不限', bio: '中-高', as: '高' },
  { metric: '修复时间', prb: '实时处理', pat: '5-20年', mna: '10-30年', bio: '3-15年', as: '1-5年' },
  { metric: '建设成本', prb: '高', pat: '中', mna: '低', bio: '中', as: '中' },
  { metric: '运维成本', prb: '低', pat: '高', mna: '低', bio: '中', as: '中' },
  { metric: '二次污染风险', prb: '低', pat: '中(废水)', mna: '无', bio: '低', as: '中(废气)' },
  { metric: '技术成熟度', prb: '成熟', pat: '成熟', mna: '成熟', bio: '较成熟', as: '成熟' },
  { metric: '监测要求', prb: '常规', pat: '高', mna: '极高', bio: '高', as: '中' },
];

