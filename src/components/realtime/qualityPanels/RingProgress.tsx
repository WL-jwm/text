/**
 * G-08 数据质量治理 — 质量面板
 *
 * 展示实时数据流的质量评估结果：
 *   1. 总体质量评分（环形进度条 + 等级标签）
 *   2. 各通道质量卡片（评分 + 违规数 + 趋势）
 *   3. 违规列表（按规则类型/严重程度筛选）
 *   4. 质量报告摘要
 * 面板: RingProgress（拆分自 QualityPanel.tsx）
 */
import { GRADE_CONFIG } from './qualityConstants';

export function RingProgress({ score, size = 80, strokeWidth = 6, color,}: { score: number; size?: number; strokeWidth?: number; color?: string;}) {
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
