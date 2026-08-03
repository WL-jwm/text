/**
 * G-08 数据质量治理 — React Hooks
 *
 * 提供质量引擎的 React 封装，支持：
 *   1. useQualityEngine — 单例引擎访问
 *   2. useQualityEvaluation — 实时数据流质量评估
 *   3. useChannelQualityReport — 通道质量报告
 *   4. useQualityTrend — 质量评分趋势追踪
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { qualityEngine, QualityEngine } from '../services/qualityEngine';
import type {
  ReadingQuality,
  ChannelQualityReport,
  QualityViolation,
  QualityGrade,
  RuleType,
} from '../services/qualityEngine';
import type { RealtimeReading, DataChannel } from '../services/realtimeDataService';

// ============================================================
// useQualityEngine
// ============================================================

/**
 * 访问单例 QualityEngine，支持重置和自定义规则配置
 */
export function useQualityEngine() {
  const reset = useCallback(() => {
    qualityEngine.reset();
  }, []);

  const setRules = useCallback(
    (rules: ReturnType<QualityEngine['getRules']>) => {
      qualityEngine.setRules(rules);
    },
    [],
  );

  const getRules = useCallback(() => {
    return qualityEngine.getRules();
  }, []);

  return { engine: qualityEngine, reset, setRules, getRules };
}

// ============================================================
// useQualityEvaluation
// ============================================================

/**
 * 对实时数据流进行质量评估，返回各读数的质量评分和违规详情
 *
 * @param readings — 实时数据流（全部通道）
 * @param enabled — 是否启用评估（默认 true）
 */
export function useQualityEvaluation(
  readings: RealtimeReading[],
  enabled = true,
) {
  const [qualityMap, setQualityMap] = useState<Map<string, ReadingQuality>>(new Map());
  const [violations, setViolations] = useState<QualityViolation[]>([]);
  const [overallScore, setOverallScore] = useState(100);
  const [overallGrade, setOverallGrade] = useState<QualityGrade>('excellent');
  const [recentScore, setRecentScore] = useState<number[]>([]);
  const engineRef = useRef(qualityEngine);

  // 记录上次评估的读数 ID 集合，避免重复评估
  const lastIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled || readings.length === 0) return;

    const engine = engineRef.current;
    const newQualityMap = new Map(qualityMap);
    const newViolations: QualityViolation[] = [];
    let totalScore = 0;
    let newCount = 0;

    for (const reading of readings) {
      const id = `${reading.stationId}-${reading.channel}-${reading.timestamp}`;
      if (lastIdsRef.current.has(id)) {
        // 已有评估结果，复用
        const existing = newQualityMap.get(id);
        if (existing) {
          totalScore += existing.score;
          newCount++;
          newViolations.push(...existing.violations);
        }
        continue;
      }

      const result = engine.evaluate(reading);
      newQualityMap.set(id, result);
      totalScore += result.score;
      newCount++;
      newViolations.push(...result.violations);
      lastIdsRef.current.add(id);
    }

    // 限制 qualityMap 大小
    const MAX_ENTRIES = 5000;
    if (newQualityMap.size > MAX_ENTRIES) {
      const keys = Array.from(newQualityMap.keys());
      const toDelete = keys.slice(0, newQualityMap.size - MAX_ENTRIES);
      for (const key of toDelete) {
        newQualityMap.delete(key);
        lastIdsRef.current.delete(key);
      }
    }

    setQualityMap(newQualityMap);
    setViolations(newViolations);
    setOverallScore(newCount > 0 ? Math.round(totalScore / newCount) : 100);
    setOverallGrade(
      newCount > 0
        ? (totalScore / newCount >= 90 ? 'excellent'
          : totalScore / newCount >= 75 ? 'good'
          : totalScore / newCount >= 50 ? 'fair'
          : totalScore / newCount >= 25 ? 'poor'
          : 'invalid')
        : 'excellent',
    );
  }, [readings, enabled, qualityMap]);

  // 记录最近评分趋势（最多 20 个点）
  useEffect(() => {
    if (readings.length > 0) {
      setRecentScore(prev => {
        const next = [...prev, overallScore];
        if (next.length > 20) next.splice(0, next.length - 20);
        return next;
      });
    }
  }, [overallScore, readings.length]);

  const clear = useCallback(() => {
    engineRef.current.reset();
    setQualityMap(new Map());
    setViolations([]);
    setOverallScore(100);
    setOverallGrade('excellent');
    setRecentScore([]);
    lastIdsRef.current.clear();
  }, []);

  return {
    qualityMap,
    violations,
    overallScore,
    overallGrade,
    recentScore,
    clear,
    violationCount: violations.length,
  };
}

// ============================================================
// useChannelQualityReport
// ============================================================

/**
 * 生成指定通道的质量报告
 *
 * @param channel — 目标通道
 * @param readings — 该通道的实时读数
 * @param enabled — 是否启用
 */
export function useChannelQualityReport(
  channel: DataChannel,
  readings: RealtimeReading[],
  enabled = true,
) {
  const [report, setReport] = useState<ChannelQualityReport | null>(null);

  useEffect(() => {
    if (!enabled || readings.length === 0) {
      setReport(null);
      return;
    }

    const qualityResults = qualityEngine.evaluateBatch(readings);
    const channelReport = qualityEngine.generateReport(channel, qualityResults);
    setReport(channelReport);
  }, [channel, readings, enabled]);

  return report;
}

// ============================================================
// useQualityTrend
// ============================================================

/**
 * 追踪质量评分趋势，返回历史评分数据
 *
 * @param maxPoints — 最大追踪点数（默认 20）
 */
export function useQualityTrend(maxPoints = 20) {
  const [history, setHistory] = useState<Array<{
    timestamp: number;
    score: number;
    grade: QualityGrade;
  }>>([]);

  const push = useCallback(
    (score: number, grade: QualityGrade) => {
      setHistory(prev => {
        const next = [...prev, { timestamp: Date.now(), score, grade }];
        if (next.length > maxPoints) next.splice(0, next.length - maxPoints);
        return next;
      });
    },
    [maxPoints],
  );

  const clear = useCallback(() => {
    setHistory([]);
  }, []);

  // 计算趋势方向
  const trend = history.length >= 2
    ? history[history.length - 1]!.score - history[0]!.score
    : 0;

  const averageScore = history.length > 0
    ? Math.round(history.reduce((s, h) => s + h.score, 0) / history.length)
    : 100;

  return { history, push, clear, trend, averageScore };
}

// ============================================================
// 类型导出（方便组件使用）
// ============================================================

export type { ReadingQuality, ChannelQualityReport, QualityViolation, QualityGrade, RuleType };