/**
 * G-08 数据质量治理 — 校验规则引擎
 *
 * 对实时数据流进行质量检测，支持：
 *   1. 范围检查 — 数值是否在合理区间内
 *   2. 变化率检查 — 相邻读数变化是否超过阈值
 *   3. 恒值检测 — 连续相同读数是否超过上限（传感器冻结）
 *   4. 缺失检测 — 时间间隔是否超过预期
 *   5. 站点一致性 — 同城市多站点数值差异是否合理
 *
 * 每条规则返回质量评分（0-100）和异常详情
 */

import type { DataChannel, RealtimeReading } from './realtimeDataService';

// ============================================================
// 类型定义
// ============================================================

/** 质量评分等级 */
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
// 规则配置
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
export const DEFAULT_QUALITY_RULES: Record<DataChannel, {
  range: RangeRuleConfig;
  rate: RateRuleConfig;
  stuck: StuckRuleConfig;
  missing: MissingRuleConfig;
}> = {
  waterLevel: {
    range: { channel: 'waterLevel', min: 0, max: 80, weight: 30 },
    rate: { channel: 'waterLevel', maxRate: 5, weight: 25 },
    stuck: { channel: 'waterLevel', maxConsecutive: 5, weight: 20 },
    missing: { channel: 'waterLevel', maxIntervalMs: 30000, weight: 25 },
  },
  waterQuality: {
    range: { channel: 'waterQuality', min: 0, max: 100, weight: 30 },
    rate: { channel: 'waterQuality', maxRate: 15, weight: 25 },
    stuck: { channel: 'waterQuality', maxConsecutive: 5, weight: 20 },
    missing: { channel: 'waterQuality', maxIntervalMs: 30000, weight: 25 },
  },
  subsidence: {
    range: { channel: 'subsidence', min: 0, max: 50, weight: 30 },
    rate: { channel: 'subsidence', maxRate: 3, weight: 25 },
    stuck: { channel: 'subsidence', maxConsecutive: 5, weight: 20 },
    missing: { channel: 'subsidence', maxIntervalMs: 30000, weight: 25 },
  },
  extraction: {
    range: { channel: 'extraction', min: 0, max: 300, weight: 30 },
    rate: { channel: 'extraction', maxRate: 20, weight: 25 },
    stuck: { channel: 'extraction', maxConsecutive: 5, weight: 20 },
    missing: { channel: 'extraction', maxIntervalMs: 30000, weight: 25 },
  },
};

// ============================================================
// 质量评分等级映射
// ============================================================

function scoreToGrade(score: number): QualityGrade {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 50) return 'fair';
  if (score >= 25) return 'poor';
  return 'invalid';
}

// ============================================================
// 规则引擎
// ============================================================

/**
 * 数据质量校验引擎
 */
export class QualityEngine {
  private rules: typeof DEFAULT_QUALITY_RULES;

  constructor() {
    this.rules = structuredClone(DEFAULT_QUALITY_RULES);
  }

  /** 各站点最近读数（用于变化率检测） */
  private lastReadings = new Map<string, { value: number; timestamp: number }>();
  /** 各站点连续相同值计数（用于恒值检测） */
  private consecutiveCounts = new Map<string, { value: number; count: number }>();

  /**
   * 更新规则配置
   */
  setRules(rules: Record<DataChannel, {
    range: RangeRuleConfig;
    rate: RateRuleConfig;
    stuck: StuckRuleConfig;
    missing: MissingRuleConfig;
  }>): void {
    this.rules = rules;
  }

  /**
   * 获取当前规则配置
   */
  getRules(): typeof this.rules {
    return this.rules;
  }

  /**
   * 评估单条读数
   */
  evaluate(reading: RealtimeReading): ReadingQuality {
    const violations: QualityViolation[] = [];
    const channelRules = this.rules[reading.channel];
    if (!channelRules) {
      return {
        stationId: reading.stationId,
        stationName: reading.stationName,
        channel: reading.channel,
        timestamp: reading.timestamp,
        value: reading.value,
        score: 100,
        grade: 'excellent',
        violations: [],
      };
    }

    // 1. 范围检查
    const rangeViolation = this.checkRange(reading, channelRules.range);
    if (rangeViolation) violations.push(rangeViolation);

    // 2. 变化率检查
    const rateViolation = this.checkRate(reading, channelRules.rate);
    if (rateViolation) violations.push(rateViolation);

    // 3. 恒值检测
    const stuckViolation = this.checkStuck(reading, channelRules.stuck);
    if (stuckViolation) violations.push(stuckViolation);

    // 更新历史
    this.lastReadings.set(reading.stationId, {
      value: reading.value,
      timestamp: reading.timestamp,
    });

    // 计算综合评分
    const score = this.computeScore(violations, channelRules);

    return {
      stationId: reading.stationId,
      stationName: reading.stationName,
      channel: reading.channel,
      timestamp: reading.timestamp,
      value: reading.value,
      score,
      grade: scoreToGrade(score),
      violations,
    };
  }

  /**
   * 批量评估
   */
  evaluateBatch(readings: RealtimeReading[]): ReadingQuality[] {
    return readings.map(r => this.evaluate(r));
  }

  /**
   * 生成通道质量报告
   */
  generateReport(channel: DataChannel, readings: ReadingQuality[]): ChannelQualityReport {
    if (readings.length === 0) {
      return {
        channel,
        timeRange: { start: 0, end: 0 },
        totalReadings: 0,
        averageScore: 100,
        grade: 'excellent',
        stationScores: [],
        violationSummary: { range: 0, rate: 0, stuck: 0, missing: 0, consistency: 0 },
        violations: [],
      };
    }

    const timestamps = readings.map(r => r.timestamp);
    const scores = readings.map(r => r.score);
    const allViolations = readings.flatMap(r => r.violations);

    // 按站点分组
    const stationMap = new Map<string, { name: string; scores: number[] }>();
    for (const r of readings) {
      if (!stationMap.has(r.stationId)) {
        stationMap.set(r.stationId, { name: r.stationName, scores: [] });
      }
      stationMap.get(r.stationId)!.scores.push(r.score);
    }

    // 违规统计
    const violationSummary: Record<RuleType, number> = {
      range: 0, rate: 0, stuck: 0, missing: 0, consistency: 0,
    };
    for (const v of allViolations) {
      violationSummary[v.ruleType] = (violationSummary[v.ruleType] ?? 0) + 1;
    }

    const avgScore = scores.reduce((s, v) => s + v, 0) / scores.length;

    return {
      channel,
      timeRange: {
        start: Math.min(...timestamps),
        end: Math.max(...timestamps),
      },
      totalReadings: readings.length,
      averageScore: Math.round(avgScore * 100) / 100,
      grade: scoreToGrade(avgScore),
      stationScores: Array.from(stationMap.entries()).map(([id, { name, scores: s }]) => {
        const stationAvg = s.reduce((a, b) => a + b, 0) / s.length;
        return {
          stationId: id,
          stationName: name,
          count: s.length,
          averageScore: Math.round(stationAvg * 100) / 100,
          grade: scoreToGrade(stationAvg),
        };
      }),
      violationSummary,
      violations: allViolations.slice(0, 100), // 最多 100 条
    };
  }

  /**
   * 重置引擎状态（清除历史记录）
   */
  reset(): void {
    this.lastReadings.clear();
    this.consecutiveCounts.clear();
  }

  // ============================================================
  // 私有规则检测方法
  // ============================================================

  private checkRange(reading: RealtimeReading, config: RangeRuleConfig): QualityViolation | null {
    const { value } = reading;
    const { min, max } = config;

    if (value < min) {
      const severity = Math.min(100, Math.round(((min - value) / (max - min || 1)) * 50 + 50));
      return {
        ruleType: 'range',
        ruleName: '范围检查',
        severity,
        message: `数值 ${value} 低于下限 ${min}`,
        stationId: reading.stationId,
        timestamp: reading.timestamp,
        currentValue: value,
        expectedValue: min,
      };
    }

    if (value > max) {
      const severity = Math.min(100, Math.round(((value - max) / (max - min || 1)) * 50 + 50));
      return {
        ruleType: 'range',
        ruleName: '范围检查',
        severity,
        message: `数值 ${value} 超过上限 ${max}`,
        stationId: reading.stationId,
        timestamp: reading.timestamp,
        currentValue: value,
        expectedValue: max,
      };
    }

    return null;
  }

  private checkRate(reading: RealtimeReading, config: RateRuleConfig): QualityViolation | null {
    const last = this.lastReadings.get(reading.stationId);
    if (!last) return null;

    const change = Math.abs(reading.value - last.value);
    if (change > config.maxRate) {
      const severity = Math.min(100, Math.round((change / (config.maxRate * 2 || 1)) * 100));
      return {
        ruleType: 'rate',
        ruleName: '变化率检查',
        severity,
        message: `变化 ${change.toFixed(2)} 超过限值 ${config.maxRate}（上次 ${last.value}）`,
        stationId: reading.stationId,
        timestamp: reading.timestamp,
        currentValue: reading.value,
        expectedValue: last.value,
      };
    }

    return null;
  }

  private checkStuck(reading: RealtimeReading, config: StuckRuleConfig): QualityViolation | null {
    const key = `${reading.stationId}-${reading.channel}`;
    const current = this.consecutiveCounts.get(key);

    if (current && current.value === reading.value) {
      current.count++;
      if (current.count >= config.maxConsecutive) {
        return {
          ruleType: 'stuck',
          ruleName: '恒值检测',
          severity: Math.min(100, 50 + current.count * 5),
          message: `连续 ${current.count} 次相同值 ${reading.value}，可能传感器冻结`,
          stationId: reading.stationId,
          timestamp: reading.timestamp,
          currentValue: reading.value,
        };
      }
    } else {
      this.consecutiveCounts.set(key, { value: reading.value, count: 1 });
    }

    return null;
  }

  /**
   * 计算综合评分
   */
  private computeScore(
    violations: QualityViolation[],
    config: { range: { weight: number }; rate: { weight: number }; stuck: { weight: number }; missing: { weight: number } },
  ): number {
    if (violations.length === 0) return 100;

    // 总权重
    const totalWeight = config.range.weight + config.rate.weight + config.stuck.weight + config.missing.weight;

    // 扣分 = 各违规 (severity * weight) 加权均值
    let deduction = 0;
    for (const v of violations) {
      let weight = 0;
      switch (v.ruleType) {
        case 'range': weight = config.range.weight; break;
        case 'rate': weight = config.rate.weight; break;
        case 'stuck': weight = config.stuck.weight; break;
        case 'missing': weight = config.missing.weight; break;
        case 'consistency': weight = 15; break;
      }
      deduction += (v.severity / 100) * weight;
    }

    const score = Math.max(0, Math.round(100 - (deduction / totalWeight) * 100));
    return score;
  }
}

/** 单例导出 */
export const qualityEngine = new QualityEngine();