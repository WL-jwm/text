/**
 * G-08 数据质量治理 — 质量面板
 *
 * 展示实时数据流的质量评估结果：
 *   1. 总体质量评分（环形进度条 + 等级标签）
 *   2. 各通道质量卡片（评分 + 违规数 + 趋势）
 *   3. 违规列表（按规则类型/严重程度筛选）
 *   4. 质量报告摘要
 */

import { useState, useMemo } from 'react';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Filter,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Bug,
} from 'lucide-react';
import { TechCard } from '../UI';
import { useQualityEvaluation } from '../../hooks/useQuality';
import type { QualityViolation, QualityGrade, RuleType } from '../../services/qualityEngine';
import type { RealtimeReading, DataChannel } from '../../services/realtimeDataService';

// ── 类型定义 ──

interface QualityPanelProps {
  readings: RealtimeReading[];
  enabled?: boolean;
}

// ── 常量 ──

const CHANNEL_LABELS: Record<DataChannel, string> = {
  waterLevel: '水位埋深',
  waterQuality: '水质达标率',
  subsidence: '沉降速率',
  extraction: '开采量',
};

const CHANNEL_COLORS: Record<DataChannel, string> = {
  waterLevel: '#06b6d4',
  waterQuality: '#10b981',
  subsidence: '#ef4444',
  extraction: '#f59e0b',
};

const GRADE_CONFIG: Record<QualityGrade, { label: string; color: string; bg: string; border: string; icon: typeof CheckCircle }> = {
  excellent: { label: '优秀', color: '#10b981', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: CheckCircle },
  good: { label: '良好', color: '#06b6d4', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', icon: CheckCircle },
  fair: { label: '一般', color: '#f59e0b', bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: AlertCircle },
  poor: { label: '较差', color: '#f97316', bg: 'bg-orange-500/10', border: 'border-orange-500/30', icon: AlertTriangle },
  invalid: { label: '无效', color: '#ef4444', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: XCircle },
};

const RULE_TYPE_LABELS: Record<RuleType, { label: string; short: string }> = {
  range: { label: '范围检查', short: '范围' },
  rate: { label: '变化率检查', short: '变化率' },
  stuck: { label: '恒值检测', short: '恒值' },
  missing: { label: '缺失检测', short: '缺失' },
  consistency: { label: '站点一致性', short: '一致性' },
};

const RULE_TYPE_COLORS: Record<RuleType, string> = {
  range: '#f59e0b',
  rate: '#06b6d4',
  stuck: '#ef4444',
  missing: '#8b5cf6',
  consistency: '#10b981',
};

// ── 环形进度条 ──

function RingProgress({
  score,
  size = 80,
  strokeWidth = 6,
  color,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const grade = (() => {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 50) return 'fair';
    if (score >= 25) return 'poor';
    return 'invalid';
  })();

  const strokeColor = color ?? GRADE_CONFIG[grade].color;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gw-border/20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <span className="absolute text-sm font-bold font-mono" style={{ color: strokeColor }}>
        {score}
      </span>
    </div>
  );
}

// ── 违规列表项 ──

function ViolationItem({ violation }: { violation: QualityViolation }) {
  const ruleConfig = RULE_TYPE_LABELS[violation.ruleType];
  const color = RULE_TYPE_COLORS[violation.ruleType];

  const severityLabel = violation.severity >= 80 ? '高危'
    : violation.severity >= 50 ? '中危'
    : '低危';

  const severityColor = violation.severity >= 80 ? '#ef4444'
    : violation.severity >= 50 ? '#f59e0b'
    : '#06b6d4';

  return (
    <div className="flex items-start gap-2 px-2 py-1.5 rounded border border-gw-border/20 hover:bg-gw-surface/30 transition-colors">
      {/* 规则类型指示器 */}
      <div
        className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
        style={{ backgroundColor: color }}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-medium text-gw-text">{ruleConfig.label}</span>
          <span
            className="text-[9px] px-1 rounded font-mono"
            style={{
              backgroundColor: `${severityColor}20`,
              color: severityColor,
            }}
          >
            {severityLabel}
          </span>
        </div>
        <p className="text-[10px] text-gw-muted mt-0.5 leading-relaxed">{violation.message}</p>
        <div className="flex items-center gap-2 mt-0.5 text-[9px] text-gw-muted/60">
          {violation.stationId && <span>{violation.stationId}</span>}
          {violation.currentValue !== undefined && (
            <span>当前: {violation.currentValue.toFixed(2)}</span>
          )}
          {violation.expectedValue !== undefined && (
            <span>阈值: {violation.expectedValue.toFixed(2)}</span>
          )}
        </div>
      </div>

      {/* 严重程度条 */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <div className="w-12 h-1 rounded-full bg-gw-border/20 overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${violation.severity}%`,
              backgroundColor: severityColor,
            }}
          />
        </div>
        <span className="text-[9px] font-mono text-gw-muted w-6 text-right">{violation.severity}</span>
      </div>
    </div>
  );
}

// ── 通道质量卡片 ──

function ChannelQualityCard({
  channel,
  readings,
  grade,
  score,
  violations,
}: {
  channel: DataChannel;
  readings: RealtimeReading[];
  grade: QualityGrade;
  score: number;
  violations: QualityViolation[];
}) {
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

// ── 主组件 ──

export function QualityPanel({ readings, enabled = true }: QualityPanelProps) {
  const {
    overallScore,
    overallGrade,
    violations,
    recentScore,
    clear,
    violationCount,
  } = useQualityEvaluation(readings, enabled);

  const [filterType, setFilterType] = useState<RuleType | 'all'>('all');
  const [showViolations, setShowViolations] = useState(true);

  // 按通道分组违规
  const channelViolations = useMemo(() => {
    const map = new Map<DataChannel, QualityViolation[]>();
    const channels: DataChannel[] = ['waterLevel', 'waterQuality', 'subsidence', 'extraction'];
    for (const ch of channels) map.set(ch, []);

    for (const v of violations) {
      const ch = v.stationId?.startsWith('WL-') ? 'waterLevel'
        : v.stationId?.startsWith('WQ-') ? 'waterQuality'
        : v.stationId?.startsWith('SUB-') ? 'subsidence'
        : v.stationId?.startsWith('EXT-') ? 'extraction'
        : null;
      if (ch) map.get(ch)?.push(v);
    }
    return map;
  }, [violations]);

  // 按通道分组读数
  const channelReadings = useMemo(() => {
    const map = new Map<DataChannel, RealtimeReading[]>();
    const channels: DataChannel[] = ['waterLevel', 'waterQuality', 'subsidence', 'extraction'];
    for (const ch of channels) {
      map.set(ch, readings.filter(r => r.channel === ch));
    }
    return map;
  }, [readings]);

  // 过滤后的违规
  const filteredViolations = useMemo(() => {
    if (filterType === 'all') return violations;
    return violations.filter(v => v.ruleType === filterType);
  }, [violations, filterType]);

  // 通道评分
  const channelScores = useMemo(() => {
    const scores: Record<DataChannel, { score: number; grade: QualityGrade }> = {
      waterLevel: { score: 100, grade: 'excellent' },
      waterQuality: { score: 100, grade: 'excellent' },
      subsidence: { score: 100, grade: 'excellent' },
      extraction: { score: 100, grade: 'excellent' },
    };

    for (const [ch, chV] of channelViolations.entries()) {
      if (chV.length === 0) continue;
      const totalSeverity = chV.reduce((s, v) => s + v.severity, 0);
      const avgSeverity = totalSeverity / chV.length;
      scores[ch] = {
        score: Math.max(0, 100 - avgSeverity),
        grade: avgSeverity <= 10 ? 'excellent'
          : avgSeverity <= 25 ? 'good'
          : avgSeverity <= 50 ? 'fair'
          : avgSeverity <= 75 ? 'poor'
          : 'invalid',
      };
    }

    return scores;
  }, [channelViolations]);

  const gradeConfig = GRADE_CONFIG[overallGrade];
  const GradeIcon = gradeConfig.icon;

  // 趋势方向
  const trend = recentScore.length >= 2
    ? recentScore[recentScore.length - 1]! - recentScore[0]!
    : 0;

  return (
    <TechCard
      title="数据质量评估"
      icon={Shield}
      badge={`${violationCount}违规`}
      glow={overallGrade === 'poor' || overallGrade === 'invalid'}
    >
      <div className="space-y-3">
        {/* 顶部：总体评分 + 控制 */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <RingProgress score={overallScore} size={64} strokeWidth={5} />
            <div>
              <div className="flex items-center gap-1.5">
                <GradeIcon size={14} style={{ color: gradeConfig.color }} />
                <span className="text-sm font-medium" style={{ color: gradeConfig.color }}>
                  {gradeConfig.label}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-gw-muted">
                  评分 {overallScore}/100
                </span>
                {trend !== 0 && (
                  <span className={`flex items-center gap-0.5 text-[10px] ${trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {trend > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {Math.abs(trend).toFixed(0)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={clear}
              className="px-2 py-1 rounded text-[9px] text-gw-muted hover:text-gw-text hover:bg-gw-surface/30 transition-colors"
              title="重置质量引擎"
            >
              <RefreshCw size={12} />
            </button>
          </div>
        </div>

        {/* 通道质量卡片 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {(Object.keys(CHANNEL_LABELS) as DataChannel[]).map(ch => {
            const chReads = channelReadings.get(ch) ?? [];
            const chVios = channelViolations.get(ch) ?? [];
            const score = channelScores[ch];
            return (
              <ChannelQualityCard
                key={ch}
                channel={ch}
                readings={chReads}
                grade={score.grade}
                score={score.score}
                violations={chVios}
              />
            );
          })}
        </div>

        {/* 违规列表 */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <button
              onClick={() => setShowViolations(!showViolations)}
              className="flex items-center gap-1 text-[10px] text-gw-muted hover:text-gw-text transition-colors"
            >
              <Bug size={12} />
              <span>违规详情 ({violationCount})</span>
              <ChevronDown
                size={10}
                className={`transition-transform ${showViolations ? 'rotate-0' : '-rotate-90'}`}
              />
            </button>

            {/* 规则类型过滤器 */}
            {showViolations && violationCount > 0 && (
              <div className="flex items-center gap-1">
                <Filter size={10} className="text-gw-muted" />
                <select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value as RuleType | 'all')}
                  className="text-[9px] bg-gw-surface/60 border border-gw-border/30 rounded px-1 py-0.5 text-gw-muted focus:outline-none focus:border-gw-cyan/50"
                >
                  <option value="all">全部类型</option>
                  {(Object.keys(RULE_TYPE_LABELS) as RuleType[]).map(type => (
                    <option key={type} value={type}>{RULE_TYPE_LABELS[type].label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {showViolations && (
            <div className="space-y-0.5 max-h-48 overflow-y-auto pr-1">
              {filteredViolations.length === 0 ? (
                <div className="text-center text-[10px] text-gw-muted/60 py-3">
                  {violationCount === 0
                    ? '暂无违规，数据质量良好'
                    : '当前筛选条件下无违规'}
                </div>
              ) : (
                filteredViolations.slice(0, 50).map((v, i) => (
                  <ViolationItem key={`${v.stationId}-${v.ruleType}-${v.timestamp ?? ''}-${i}`} violation={v} />
                ))
              )}
              {filteredViolations.length > 50 && (
                <div className="text-center text-[9px] text-gw-muted/50 py-1">
                  仅显示前 50 条违规（共 {filteredViolations.length} 条）
                </div>
              )}
            </div>
          )}
        </div>

        {/* 统计摘要 */}
        <div className="grid grid-cols-4 gap-1.5">
          {(Object.keys(RULE_TYPE_LABELS) as RuleType[]).map(type => {
            const count = violations.filter(v => v.ruleType === type).length;
            const color = RULE_TYPE_COLORS[type];
            return (
              <div
                key={type}
                className="text-center px-1 py-1.5 rounded bg-gw-surface/20 border border-gw-border/10"
              >
                <div className="text-[9px] text-gw-muted/70">{RULE_TYPE_LABELS[type].short}</div>
                <div className="text-[13px] font-mono font-bold" style={{ color: count > 0 ? color : undefined }}>
                  {count > 0 ? count : '-'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </TechCard>
  );
}