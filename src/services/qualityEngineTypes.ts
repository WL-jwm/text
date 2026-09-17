/**
 * 数据质量引擎 (G-15) — 类型定义
 * 拆分自 qualityEngine.ts：质量等级/规则类型/违规/读数质量/通道报告/规则配置
 */

import type { DataChannel } from './realtimeDataService';
export type QualityGrade = 'excellent' | 'good' | 'fair' | 'poor' | 'invalid';

/** 检测规则类型 */
export type RuleType = 'range' | 'rate' | 'stuck' | 'missing' | 'consistency';

/** 异常详情 */
export interface QualityViolation {
  ruleType: RuleType;
  /** 规则名称 */
  ruleName: string;
  /** 严重程度 0-100 */
  severity: number;
  /** 违规描述 */
  message: string;
  /** 关联站点 ID */
  stationId?: string;
  /** 关联读数时间戳 */
  timestamp?: number;
  /** 当前值 */
  currentValue?: number;
  /** 期望值或阈值 */
  expectedValue?: number;
}

/** 单条读数的质量评估结果 */
export interface ReadingQuality {
  stationId: string;
  stationName: string;
  channel: DataChannel;
  timestamp: number;
  value: number;
  /** 综合评分 0-100 */
  score: number;
  /** 评分等级 */
  grade: QualityGrade;
  /** 违规详情 */
  violations: QualityViolation[];
}

/** 通道整体质量报告 */
export interface ChannelQualityReport {
  channel: DataChannel;
  /** 评估时间范围 */
  timeRange: { start: number; end: number };
  /** 评估读数总数 */
  totalReadings: number;
  /** 平均评分 */
  averageScore: number;
  /** 评分等级 */
  grade: QualityGrade;
  /** 各站点评分 */
  stationScores: Array<{
    stationId: string;
    stationName: string;
    count: number;
    averageScore: number;
    grade: QualityGrade;
  }>;
  /** 违规统计 */
  violationSummary: Record<RuleType, number>;
  /** 详细违规列表 */
  violations: QualityViolation[];
}

// ============================================================
// 规则配置类型
// ============================================================
export interface RangeRuleConfig {
  /** 通道名称 */
  channel: DataChannel;
  /** 合理最小值 */
  min: number;
  /** 合理最大值 */
  max: number;
  /** 严重程度权重 */
  weight: number;
}

export interface RateRuleConfig {
  channel: DataChannel;
  /** 最大允许变化率（绝对值/次） */
  maxRate: number;
  weight: number;
}

export interface StuckRuleConfig {
  channel: DataChannel;
  /** 连续相同值最大允许次数 */
  maxConsecutive: number;
  weight: number;
}

export interface MissingRuleConfig {
  channel: DataChannel;
  /** 最大允许间隔（毫秒） */
  maxIntervalMs: number;
  weight: number;
}

/** 各通道校验规则默认配置 */
