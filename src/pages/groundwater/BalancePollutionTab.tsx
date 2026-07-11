import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TechCard, ChartTooltip } from '../../components/UI';
import { LazyChartCard } from '../../components/LazyChartCard';
import { cityGroundwaterPollution, pollutantDetectionRates } from '../../data/groundwaterResources';

interface BalancePollutionTabProps {
  pollutionChart: { name: string; unpol: number; light: number; moderate: number; heavy: number; severe: number }[];
}

export function BalancePollutionTab({ pollutionChart }: BalancePollutionTabProps) {
  return (
    <div className="space-y-4">
      <LazyChartCard title="各市地下水污染面积分布" className="scan-line" height={350}>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={pollutionChart}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
            <YAxis stroke="#64748b" fontSize={10} label={{ value: 'km²', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
            <Tooltip content={<ChartTooltip unit="km²" title="面积" />} />
            <Bar dataKey="unpol" name="未污染" fill="#10b981" stackId="a" />
            <Bar dataKey="light" name="轻污染" fill="#f59e0b" stackId="a" />
            <Bar dataKey="moderate" name="中污染" fill="#f97316" stackId="a" />
            <Bar dataKey="heavy" name="重污染" fill="#ef4444" stackId="a" />
            <Bar dataKey="severe" name="严重污染" fill="#7f1d1d" stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TechCard title="主要污染物检出率与超标率">
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead><tr className="border-b border-gw-border">
                <th className="text-left text-gw-muted py-1.5 px-2">污染物</th>
                <th className="text-gw-muted py-1.5 px-2">检出率(%)</th>
                <th className="text-gw-muted py-1.5 px-2">超标率(%)</th>
              </tr></thead>
              <tbody>
                {pollutantDetectionRates.map((p, i) => (
                  <tr key={i} className="border-b border-gw-border/20">
                    <td className="py-1.5 px-2 text-gw-text">{p.pollutant}</td>
                    <td className="py-1.5 px-2 font-mono text-center">{p.detection}</td>
                    <td className="py-1.5 px-2 font-mono text-center">{p.exceedance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TechCard>
        <TechCard title="各市地下水污染趋势">
          <div className="overflow-x-auto max-h-[300px] overflow-y-auto scrollbar-thin">
            <table className="w-full text-[10px]">
              <thead className="sticky top-0 bg-gw-card"><tr className="border-b border-gw-border">
                <th className="text-left text-gw-muted py-1.5 px-1.5">城市</th>
                <th className="text-left text-gw-muted py-1.5 px-1.5">主要污染物</th>
                <th className="text-gw-muted py-1.5 px-1.5">趋势</th>
              </tr></thead>
              <tbody>
                {cityGroundwaterPollution.map((c, i) => (
                  <tr key={i} className="border-b border-gw-border/20">
                    <td className="py-1.5 px-1.5 font-medium text-gw-text">{c.city}</td>
                    <td className="py-1.5 px-1.5 text-gw-muted text-[9px]">{c.mainPollutants}</td>
                    <td className="py-1.5 px-1.5">
                      <span className={`px-1 py-0.5 rounded text-[9px] ${
                        c.trend === '减缓' ? 'bg-emerald-500/15 text-emerald-400' :
                        c.trend === '加重' || c.trend === '变差' ? 'bg-red-500/15 text-red-400' :
                        'bg-amber-500/15 text-amber-400'
                      }`}>{c.trend}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TechCard>
      </div>
    </div>
  );
}
