/**
 * 面板（拆分自 FractureWater.tsx）
 */
import { CHART_COLORS, TechCard, ChartTooltip } from '../../components/UI';
import { fractureWaterUtilization } from '../../data/fractureWater';
import { Tooltip, Pie, Legend, Cell, PieChart, ResponsiveContainer } from 'recharts';

export function UtilizationPanel() {
  return (
      <TechCard title="裂隙水开发利用现状" badge="开发利用">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gw-muted mb-2">按用途分布(估算)</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={fractureWaterUtilization.byPurpose.map(p => ({ name: p.purpose, value: p.percent }))} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">
                  {fractureWaterUtilization.byPurpose.map((_, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<ChartTooltip unit="%" percentDigits={1} title="用途分布" />} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-2 bg-blue-500/10 rounded-lg border border-blue-500/15">
                <p className="text-[10px] text-gw-muted">机井总数</p>
                <p className="text-sm font-mono font-bold text-blue-400">{fractureWaterUtilization.wellStatistics.totalWells}</p>
              </div>
              <div className="text-center p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/15">
                <p className="text-[10px] text-gw-muted">平均井深</p>
                <p className="text-sm font-mono font-bold text-cyan-400">{fractureWaterUtilization.wellStatistics.avgWellDepth}</p>
              </div>
              <div className="text-center p-2 bg-amber-500/10 rounded-lg border border-amber-500/15">
                <p className="text-[10px] text-gw-muted">平均出水量</p>
                <p className="text-sm font-mono font-bold text-amber-400">{fractureWaterUtilization.wellStatistics.avgYield}</p>
              </div>
              <div className="text-center p-2 bg-red-500/10 rounded-lg border border-red-500/15">
                <p className="text-[10px] text-gw-muted">废井率</p>
                <p className="text-sm font-mono font-bold text-red-400">{fractureWaterUtilization.wellStatistics.failureRate}</p>
              </div>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded-lg border border-gw-border/30">
              <p className="text-[10px] text-gw-muted mb-1">重点工程</p>
              {fractureWaterUtilization.keyProjects.map((p: { name: string; period: string; wells: number; servicePop: number; unit: string }) => (
                <p key={p.name} className="text-[10px] text-gw-text leading-relaxed">
                  <span className="text-gw-cyan">{p.name}</span>({p.period}): {p.wells}眼井，服务{p.servicePop}{p.unit}
                </p>
              ))}
            </div>
          </div>
        </div>
      </TechCard>
  );
}
