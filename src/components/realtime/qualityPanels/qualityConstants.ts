/**
 * G-08 数据质量治理 — 质量面板
 *
 * 展示实时数据流的质量评估结果：
 *   1. 总体质量评分（环形进度条 + 等级标签）
 *   2. 各通道质量卡片（评分 + 违规数 + 趋势）
 *   3. 违规列表（按规则类型/严重程度筛选）
 *   4. 质量报告摘要
 * 共享常量与类型（拆分自 QualityPanel.tsx）
 */
import type { QualityGrade, RuleType } from '../../../services/qualityEngine';
import type { RealtimeReading, DataChannel } from '../../../services/realtimeDataService';
import { AlertCircle, XCircle, CheckCircle, AlertTriangle } from 'lucide-react';

export interface QualityPanelProps {
  readings: RealtimeReading[];
  enabled?: boolean;
}

export const CHANNEL_LABELS: Record<DataChannel, string> = {
  waterLevel: '水位埋深',
  waterQuality: '水质达标率',
  subsidence: '沉降速率',
  extraction: '开采量',
};
export const CHANNEL_COLORS: Record<DataChannel, string> = {
  waterLevel: '#06b6d4',
  waterQuality: '#10b981',
  subsidence: '#ef4444',
  extraction: '#f59e0b',
};
export const GRADE_CONFIG: Record<QualityGrade, { label: string; color: string; bg: string; border: string; icon: typeof CheckCircle }> = {
  excellent: { label: '优秀', color: '#10b981', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: CheckCircle },
  good: { label: '良好', color: '#06b6d4', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', icon: CheckCircle },
  fair: { label: '一般', color: '#f59e0b', bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: AlertCircle },
  poor: { label: '较差', color: '#f97316', bg: 'bg-orange-500/10', border: 'border-orange-500/30', icon: AlertTriangle },
  invalid: { label: '无效', color: '#ef4444', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: XCircle },
};
export const RULE_TYPE_LABELS: Record<RuleType, { label: string; short: string }> = {
  range: { label: '范围检查', short: '范围' },
  rate: { label: '变化率检查', short: '变化率' },
  stuck: { label: '恒值检测', short: '恒值' },
  missing: { label: '缺失检测', short: '缺失' },
  consistency: { label: '站点一致性', short: '一致性' },
};
export const RULE_TYPE_COLORS: Record<RuleType, string> = {
  range: '#f59e0b',
  rate: '#06b6d4',
  stuck: '#ef4444',
  missing: '#8b5cf6',
  consistency: '#10b981',
};
