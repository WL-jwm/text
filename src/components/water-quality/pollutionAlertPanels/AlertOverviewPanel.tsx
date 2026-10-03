/**
 * B-09 地下水污染预警模块 UI
 *
 * 5大面板：
 *  1. 预警概览 - 5级统计卡片 + 预警摘要
 *  2. 单因子预警 - 输入监测值/标准值 → 预警等级 + Pi柱状图
 *  3. 水样预警 - 多因子组合 → 综合预警 + 因子热力图
 *  4. 区域风险 - 6大分区风险评分 + 风险雷达
 *  5. 趋势预测 - 2014-2030水质改善趋势 + 预测区间
 * 面板组件：AlertOverviewPanel（拆分自 PollutionAlertTab.tsx）
 */

import { TechCard, StatCard } from '../../UI';
import { ALERT_LEVELS, calcAlertSummary } from '../../../utils/pollutionAlertEngine';

export function AlertOverviewPanel({ summary }: { summary: ReturnType<typeof calcAlertSummary> }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3">
        {(['安全', '关注', '预警', '警告', '严重'] as const).map(level => {
          const meta = ALERT_LEVELS[level];
          const countMap: Record<string, number> = {
            '安全': summary.safeCount,
            '关注': summary.cautionCount,
            '预警': summary.warningCount,
            '警告': summary.alertCount,
            '严重': summary.severeCount,
          };
          return (
            <StatCard
              key={level}
              title={level}
              value={countMap[level]}
              unit="个"
              accent={meta.color === '#10b981' ? 'emerald' : meta.color === '#3b82f6' ? 'blue' : meta.color === '#f59e0b' ? 'amber' : meta.color === '#f97316' ? 'orange' : 'red'}
              subtitle={`${summary.totalSamples > 0 ? (countMap[level] / summary.totalSamples * 100).toFixed(1) : 0}%`}
            />
          );
        })}
      </div>
      <TechCard title="预警摘要">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gw-muted text-xs">总体预警等级</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: ALERT_LEVELS[summary.overallLevel].color }} />
              <span className="font-semibold" style={{ color: ALERT_LEVELS[summary.overallLevel].color }}>{summary.overallLevel}</span>
            </div>
          </div>
          <div>
            <span className="text-gw-muted text-xs">超标率</span>
            <p className="font-semibold text-gw-text mt-1">{(summary.exceededRate * 100).toFixed(1)}%</p>
          </div>
          <div className="col-span-2">
            <span className="text-gw-muted text-xs">最常见超标因子</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {summary.topExceededFactors.length > 0
                ? summary.topExceededFactors.map(f => (
                  <span key={f} className="px-2 py-0.5 rounded text-[10px] bg-red-500/15 text-red-400 border border-red-500/20">{f}</span>
                ))
                : <span className="text-gw-muted text-xs">无超标因子</span>}
            </div>
          </div>
        </div>
      </TechCard>
    </div>
  );
}
