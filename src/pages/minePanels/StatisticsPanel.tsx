/**
 * 面板（拆分自 MineHydrogeology.tsx）
 */
import { LazyChartCard } from '../../components/LazyChartCard';
import { ChartTooltip, TechTable, TechCard } from '../../components/UI';
import { YAxis, ResponsiveContainer, XAxis, Tooltip, Cell, Pie, BarChart, PieChart, CartesianGrid, Bar } from 'recharts';
import { UTILIZATION_COLORS } from './mineHydrogenConstants';
import { mineDrainageStatistics } from '../../data/mineHydrogeology';

export function StatisticsPanel() {
  const utilizationPie = mineDrainageStatistics.utilizationBreakdown.map((u, i) => ({
    name: u.purpose,
    value: u.percent,
    color: UTILIZATION_COLORS[i % UTILIZATION_COLORS.length] }));

  return (
        <div className="space-y-4">
          {/* 总量KPI */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            <div className="p-4 rounded-lg bg-gw-surface/50 border border-gw-border/40 text-center">
              <div className="text-xs text-gw-muted">年排水总量</div>
              <div className="text-lg font-bold text-gw-highlight mt-1">{mineDrainageStatistics.totalAnnualDrainage}</div>
            </div>
            <div className="p-4 rounded-lg bg-gw-surface/50 border border-gw-border/40 text-center">
              <div className="text-xs text-gw-muted">综合利用量</div>
              <div className="text-lg font-bold text-emerald-400 mt-1">{mineDrainageStatistics.totalUtilization}</div>
            </div>
            <div className="p-4 rounded-lg bg-gw-surface/50 border border-gw-border/40 text-center">
              <div className="text-xs text-gw-muted">煤矿占比</div>
              <div className="text-lg font-bold text-amber-400 mt-1">{mineDrainageStatistics.coalMinesShare}</div>
            </div>
            <div className="p-4 rounded-lg bg-gw-surface/50 border border-gw-border/40 text-center">
              <div className="text-xs text-gw-muted">铁矿占比</div>
              <div className="text-lg font-bold text-blue-400 mt-1">{mineDrainageStatistics.ironMinesShare}</div>
            </div>
          </div>

          {/* 利用结构饼图 + 利用明细表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LazyChartCard title="矿井水利用结构" height={280}>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={utilizationPie} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {utilizationPie.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip unit="%" title="矿井水利用结构" />} />
                </PieChart>
              </ResponsiveContainer>
            </LazyChartCard>
            <TechCard title="利用途径明细">
              <TechTable headers={['利用途径', '占比(%)', '利用量']}
                rows={mineDrainageStatistics.utilizationBreakdown.map(u => [u.purpose, u.percent, u.volume])}
          />
            </TechCard>
          </div>

          {/* 政策目标 */}
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-xs text-blue-400"><span className="font-medium">政策目标:</span> {mineDrainageStatistics.policyTarget}</p>
            <p className="text-xs text-gw-muted mt-1"><span className="text-gw-text font-medium">依据:</span> {mineDrainageStatistics.keyPolicy}</p>
          </div>

          {/* 利用结构柱状图 */}
          <LazyChartCard title="各利用途径占比对比" height={280}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={mineDrainageStatistics.utilizationBreakdown.map(u => ({
                name: u.purpose.length > 6 ? u.purpose.substring(0, 6) + '...' : u.purpose,
                value: u.percent }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} unit="%" />
                <Tooltip content={<ChartTooltip unit="%" title="占比数据" />} />
                <Bar dataKey="value" name="占比(%)" radius={[2, 2, 0, 0]}>
                  {mineDrainageStatistics.utilizationBreakdown.map((_, i) => <Cell key={i} fill={UTILIZATION_COLORS[i % UTILIZATION_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </LazyChartCard>
        </div>
  );
}
