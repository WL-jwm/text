/*
 * 组件：SummaryCards（拆分自 balanceCharts.tsx）
 */

import { StatCard } from '../../UI';
import { fmt, type BalanceSummary } from '../../../utils/balanceCalculator';

export function SummaryCards({ summary }: { summary: BalanceSummary }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      <StatCard
        title="总补给量"
        value={`${fmt(summary.totalRecharge)}`}
        unit="亿m\u00b3/a"
        subtitle={`合计${summary.totalArea.toLocaleString()} km\u00b2`}
        accent="blue"
      />
      <StatCard
        title="总排泄量"
        value={`${fmt(summary.totalDischarge)}`}
        unit="亿m\u00b3/a"
        subtitle={`均衡差 ${fmt(summary.totalBalance)}`}
        accent="red"
      />
      <StatCard
        title="均衡状态"
        value={`${summary.totalSurplusCities + summary.totalBalancedCities} / ${summary.totalSurplusCities + summary.totalBalancedCities + summary.totalOverdraftCities}`}
        subtitle="盈余/均衡 / 亏损"
        accent="cyan"
      />
      <StatCard
        title="平均开采系数"
        value={fmt(summary.avgExploitationCoeff)}
        subtitle={summary.avgExploitationCoeff > 1 ? '开采量 > 补给量' : '开采量 < 补给量'}
        accent={summary.avgExploitationCoeff > 1 ? 'red' : 'green'}
      />
      <StatCard
        title="省级均衡差"
        value={`${fmt(summary.totalBalance)}`}
        unit="亿m\u00b3/a"
        subtitle={summary.totalBalance >= 0 ? '采补平衡' : '超采'}
        accent={summary.totalBalance >= 0 ? 'emerald' : 'orange'}
      />
    </div>
  );
}
