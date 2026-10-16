/**
 * G-08 数据质量治理 — 质量面板
 *
 * 展示实时数据流的质量评估结果：
 *   1. 总体质量评分（环形进度条 + 等级标签）
 *   2. 各通道质量卡片（评分 + 违规数 + 趋势）
 *   3. 违规列表（按规则类型/严重程度筛选）
 *   4. 质量报告摘要
 * 面板: ChannelQualityCard（拆分自 QualityPanel.tsx）
 */
import type { QualityGrade, QualityViolation, RuleType } from '../../../services/qualityEngine';
import type { RealtimeReading, DataChannel } from '../../../services/realtimeDataService';
import { useMemo } from 'react';
import { CHANNEL_COLORS, CHANNEL_LABELS, GRADE_CONFIG, RULE_TYPE_COLORS, RULE_TYPE_LABELS } from './qualityConstants';

export function ChannelQualityCard({ channel, readings, grade, score, violations,}: { channel: DataChannel; readings: RealtimeReading[]; grade: QualityGrade; score: number; violations: QualityViolation[];}) {
  const color = CHANNEL_COLORS[channel];
  const label = CHANNEL_LABELS[channel];
  const gradeConfig = GRADE_CONFIG[grade];
  const GradeIcon = gradeConfig.icon;

  // 各类型违规统计
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const v of violations) {
      counts[v.ruleType] = (counts[v.ruleType] ?? 0) + 1;
    }
    return counts;
  }, [violations]);

  return (
    <div
      className={`px-3 py-2.5 rounded-lg border ${gradeConfig.bg} ${gradeConfig.border}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-[11px] font-medium text-gw-text">{label}</span>
          <span className="text-[9px] text-gw-muted/60">{readings.length}条</span>
        </div>
        <div className="flex items-center gap-1">
          <GradeIcon size={12} style={{ color: gradeConfig.color }} />
          <span className="text-[10px] font-mono font-medium" style={{ color: gradeConfig.color }}>
            {score.toFixed(0)}
          </span>
        </div>
      </div>

      {/* 违规类型标签 */}
      {violations.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1">
          {(Object.entries(typeCounts) as [RuleType, number][]).map(([type, count]) => (
            <span
              key={type}
              className="text-[8px] px-1 py-0.5 rounded"
              style={{
                backgroundColor: `${RULE_TYPE_COLORS[type]}15`,
                color: RULE_TYPE_COLORS[type],
              }}
            >
              {RULE_TYPE_LABELS[type].short}×{count}
            </span>
          ))}
        </div>
      )}

      {/* 迷你违规条 */}
      <div className="flex items-center gap-1.5">
        <div className="flex-1 h-1 rounded-full bg-gw-border/20 overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min(100, violations.length * 8)}%`,
              backgroundColor: color,
              opacity: violations.length > 0 ? 0.6 : 0.1,
            }}
          />
        </div>
        {violations.length > 0 && (
          <span className="text-[9px] text-gw-muted/60">{violations.length}违规</span>
        )}
      </div>
    </div>
  );
}
