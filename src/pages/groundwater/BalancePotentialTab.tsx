import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TechCard, ChartTooltip } from '../../components/UI';
import { LazyChartCard } from '../../components/LazyChartCard';
import { cityExploitationPotential, potentialZoneSummary } from '../../data/groundwaterResources';

interface BalancePotentialTabProps {
  potentialChart: { name: string; resource: number; extraction: number; surplus: number }[];
}

export function BalancePotentialTab({ potentialChart }: BalancePotentialTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="各市开采潜力对比" className="scan-line" height={350}>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={potentialChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} label={{ value: '亿m³/a', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
              <Tooltip content={<ChartTooltip unit="亿m³/a" title="水量" />} />
              <Bar dataKey="resource" name="可开采资源" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="extraction" name="实际开采(2000)" fill="#ef4444" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>
        <TechCard title="开采潜力分区统计">
          <div className="space-y-3">
            {potentialZoneSummary.zones.map((z, i) => (
              <div key={i} className="p-3 rounded-lg border border-gw-border/30 bg-gw-surface/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gw-text">{z.zone}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                    i === 0 ? 'bg-emerald-500/15 text-emerald-400' :
                    i === 1 ? 'bg-blue-500/15 text-blue-400' : 'bg-red-500/15 text-red-400'
                  }`}>{z.percent}%</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div><span className="text-gw-muted">面积</span> <span className="font-mono">{z.area}km²</span></div>
                  <div><span className="text-gw-muted">资源</span> <span className="font-mono">{z.resource}亿m³</span></div>
                  <div><span className="text-gw-muted">开采</span> <span className="font-mono">{z.extraction}亿m³</span></div>
                </div>
                <p className="text-[9px] text-gw-muted mt-1">潜力指数 {z.piRange}，盈余 {z.surplus} 亿m³/a</p>
              </div>
            ))}
          </div>
        </TechCard>
      </div>

      <TechCard title="各市开采潜力明细" badge="2000年基准">
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead><tr className="border-b border-gw-border">
              <th className="text-left text-gw-muted py-1.5 px-1.5">城市</th>
              <th className="text-gw-muted py-1.5 px-1.5">面积(km²)</th>
              <th className="text-gw-muted py-1.5 px-1.5">可采资源</th>
              <th className="text-gw-muted py-1.5 px-1.5">实际开采</th>
              <th className="text-gw-muted py-1.5 px-1.5">潜力指数</th>
              <th className="text-gw-muted py-1.5 px-1.5">盈余/超采</th>
              <th className="text-gw-muted py-1.5 px-1.5">超采率(%)</th>
              <th className="text-left text-gw-muted py-1.5 px-1.5">状态</th>
            </tr></thead>
            <tbody>
              {cityExploitationPotential.map((c, i) => (
                <tr key={i} className="border-b border-gw-border/20 data-row">
                  <td className="py-1.5 px-1.5 font-medium text-gw-text">{c.city}</td>
                  <td className="py-1.5 px-1.5 font-mono text-center">{c.area}</td>
                  <td className="py-1.5 px-1.5 font-mono text-center">{c.resource}</td>
                  <td className="py-1.5 px-1.5 font-mono text-center">{c.extraction2000}</td>
                  <td className="py-1.5 px-1.5 font-mono text-center">{c.potentialIndex}</td>
                  <td className={`py-1.5 px-1.5 font-mono text-center ${c.surplus < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {c.surplus > 0 ? '+' : ''}{c.surplus.toFixed(4)}
                  </td>
                  <td className="py-1.5 px-1.5 font-mono text-center">{c.surplusPercent.toFixed(2)}</td>
                  <td className="py-1.5 px-1.5">
                    <span className={`px-1 py-0.5 rounded text-[9px] ${
                      c.note === '严重超采' ? 'bg-red-500/15 text-red-400' :
                      c.note === '超采' ? 'bg-amber-500/15 text-amber-400' : 'bg-emerald-500/15 text-emerald-400'
                    }`}>{c.note}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>

      <TechCard title="开采潜力增量措施">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {potentialZoneSummary.potentialIncrease.map((p, i) => (
            <div key={i} className="p-2.5 rounded-lg border border-gw-border/30 bg-gw-surface/30 text-center">
              <p className="text-[9px] text-gw-muted">{p.measure}</p>
              <p className="text-lg font-bold text-gw-highlight">{p.amount}</p>
              <p className="text-[9px] text-gw-muted">亿m³/a</p>
            </div>
          ))}
        </div>
      </TechCard>
    </div>
  );
}
