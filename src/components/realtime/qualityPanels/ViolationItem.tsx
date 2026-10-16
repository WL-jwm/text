/**
 * G-08 数据质量治理 — 质量面板
 *
 * 展示实时数据流的质量评估结果：
 *   1. 总体质量评分（环形进度条 + 等级标签）
 *   2. 各通道质量卡片（评分 + 违规数 + 趋势）
 *   3. 违规列表（按规则类型/严重程度筛选）
 *   4. 质量报告摘要
 * 面板: ViolationItem（拆分自 QualityPanel.tsx）
 */
import type { QualityViolation } from '../../../services/qualityEngine';
import { RULE_TYPE_COLORS, RULE_TYPE_LABELS } from './qualityConstants';

export function ViolationItem({ violation }: { violation: QualityViolation }) {
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
