/**
 * B-27 地下水背景值统计分析器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 单因子背景值确定（3种方法对比）
 *  2. 分区对比 — 3个分区6项因子背景值差异分析
 *  3. 超标统计 — 各因子超标率/超标倍数/污染指数
 *  4. 趋势检测 — 多年背景值变化趋势+偏移判断
 * 面板: ExceedancePanel（拆分自 BackgroundValueCalculatorTab.tsx）
 */
import { calcAllExceedance } from '../../../utils/backgroundValueCalculator';
import { FilterableTechTable } from '../../FilterableTechTable';
import { LazyChartCard } from '../../LazyChartCard';
import { TechCard, ChartTooltip, StatCard } from '../../UI';
import { TrendingDown, AlertTriangle } from 'lucide-react';
import { useMemo } from 'react';
import { YAxis, XAxis, CartesianGrid, Legend, Bar, Tooltip, ResponsiveContainer, BarChart } from 'recharts';
import { EXCEED_COLORS } from './backgroundConstants';

export function ExceedancePanel() {
  const results = useMemo(() => calcAllExceedance(), []);

  const exceedBarData = results.map(r => ({
    factor: r.factor,
    exceedRate: r.exceedRate,
    maxMultiple: r.maxExceedMultiple,
    PI: r.pollutionIndex,
    color: EXCEED_COLORS[r.grade] ?? '#64748b',
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="评价因子" value={results.length} unit="项" icon={AlertTriangle} accent="red" />
        <StatCard title="超标因子" value={results.filter(r => r.exceedCount > 0).length} unit={`/${results.length}`} icon={AlertTriangle} accent="amber" />
        <StatCard title="最大超标率" value={Math.max(...results.map(r => r.exceedRate))} unit="%" icon={TrendingDown} accent="orange" />
        <StatCard title="最大超标倍数" value={Math.max(...results.map(r => r.maxExceedMultiple))} unit="倍" icon={AlertTriangle} accent="red" />
      </div>

      <LazyChartCard title="各因子超标率与污染指数" height={300}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={exceedBarData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
            <XAxis dataKey="factor" stroke="#64748b" fontSize={11} />
            <YAxis yAxisId="left" stroke="#64748b" fontSize={10} unit="%" />
            <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={10} />
            <Tooltip content={<ChartTooltip title="超标统计" />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar yAxisId="left" dataKey="exceedRate" name="超标率(%)" fill="#ef4444" radius={[2, 2, 0, 0]} />
            <Bar yAxisId="right" dataKey="PI" name="污染指数PI" fill="#f59e0b" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <TechCard title="各因子超标评价详情">
        <FilterableTechTable
          headers={['因子', '标准(mg/L)', '样本数', '超标数', '超标率(%)', '平均超标倍数', '最大超标倍数', '最大值', 'PI', '等级']}
          rows={results.map(r => [
            r.factor, String(r.standard), String(r.n), String(r.exceedCount),
            String(r.exceedRate), String(r.avgExceedMultiple), String(r.maxExceedMultiple),
            String(r.maxValue), String(r.pollutionIndex), r.grade,
          ])}
          filterPlaceholder="搜索因子..."
        />
      </TechCard>

      <TechCard title="超标评价说明">
        <div className="space-y-2">
          {results.filter(r => r.exceedCount > 0).map((r, i) => (
            <div key={i} className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gw-text">{r.factor}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: (EXCEED_COLORS[r.grade] ?? '#64748b') + '20', color: EXCEED_COLORS[r.grade] ?? '#64748b' }}>{r.grade}</span>
              </div>
              <p className="text-[10px] text-gw-muted mt-1">{r.note}</p>
            </div>
          ))}
          {results.filter(r => r.exceedCount > 0).length === 0 && (
            <div className="text-xs text-gw-muted text-center py-4">所有因子均无超标</div>
          )}
        </div>
      </TechCard>
    </div>
  );
}
