/**
 * B-09 地下水污染预警模块 UI
 *
 * 5大面板：
 *  1. 预警概览 - 5级统计卡片 + 预警摘要
 *  2. 单因子预警 - 输入监测值/标准值 → 预警等级 + Pi柱状图
 *  3. 水样预警 - 多因子组合 → 综合预警 + 因子热力图
 *  4. 区域风险 - 6大分区风险评分 + 风险雷达
 *  5. 趋势预测 - 2014-2030水质改善趋势 + 预测区间
 * 共享常量与类型（拆分自 PollutionAlertTab.tsx）
 */

import { AlertTriangle, ShieldAlert, TrendingUp, Thermometer, MapPin } from 'lucide-react';

export const SUB_TABS = [
  { key: 'overview', label: '预警概览', icon: AlertTriangle },
  { key: 'factor', label: '单因子预警', icon: Thermometer },
  { key: 'sample', label: '水样预警', icon: ShieldAlert },
  { key: 'region', label: '区域风险', icon: MapPin },
  { key: 'trend', label: '趋势预测', icon: TrendingUp },
] as const;
export type SubTabKey = typeof SUB_TABS[number]['key'];
