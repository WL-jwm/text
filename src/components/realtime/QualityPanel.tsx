/**
 * G-08 数据质量治理 — 质量面板
 *
 * 展示实时数据流的质量评估结果：
 *   1. 总体质量评分（环形进度条 + 等级标签）
 *   2. 各通道质量卡片（评分 + 违规数 + 趋势）
 *   3. 违规列表（按规则类型/严重程度筛选）
 *   4. 质量报告摘要
 * 主组件（面板已拆分至 qualityPanels/ 子目录）
 */
import { useQualityEvaluation } from '../../hooks/useQuality';
import type { QualityGrade, QualityViolation, RuleType } from '../../services/qualityEngine';
import type { RealtimeReading, DataChannel } from '../../services/realtimeDataService';
import { TechCard } from '../UI';
import { RefreshCw, ChevronDown, Filter, TrendingDown, Shield, TrendingUp, Bug } from 'lucide-react';
import { useState, useMemo } from 'react';
import { CHANNEL_LABELS, GRADE_CONFIG, type QualityPanelProps, RULE_TYPE_COLORS, RULE_TYPE_LABELS } from './qualityPanels/qualityConstants';
import { ChannelQualityCard } from './qualityPanels/ChannelQualityCard';
import { RingProgress } from './qualityPanels/RingProgress';
import { ViolationItem } from './qualityPanels/ViolationItem';

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
