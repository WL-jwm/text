/**
 * B-12 地面沉降与降落漏斗分析 Tab
 *
 * 4大面板：
 *  1. 漏斗计算器 — 水文地质参数输入→漏斗半径/降深/体积
 *  2. 沉降估算 — 土层参数→分层沉降量+总沉降
 *  3. 趋势分析 — 历史沉降趋势+预测
 *  4. 沉降风险 — 河北典型沉降区+风险分区
 * 共享常量与类型（拆分自 SubsidenceTab.tsx）
 */
import { ArrowDown, BookOpen, TrendingUp, Droplets } from 'lucide-react';

export const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
};
export const SUB_TABS = [
  { key: 'cone', label: '漏斗计算', icon: Droplets },
  { key: 'subsidence', label: '沉降估算', icon: ArrowDown },
  { key: 'trend', label: '趋势分析', icon: TrendingUp },
  { key: 'ref', label: '风险参考', icon: BookOpen },
] as const;
export type SubTabKey = typeof SUB_TABS[number]['key'];
