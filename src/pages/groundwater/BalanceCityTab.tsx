import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TechCard, ChartTooltip } from '../../components/UI';
import { LazyChartCard } from '../../components/LazyChartCard';
import { cityWaterBalance, cityGroundwaterExtraction2000 } from '../../data/groundwaterResources';

interface BalanceCityTabProps {
  cityBalanceChart: { name: string; recharge: number; discharge: number; balance: number }[];
}

export function BalanceCityTab({ cityBalanceChart }: BalanceCityTabProps) {
  return (
    <div className="space-y-4">
      <LazyChartCard title="各市潜水-微承压水均衡对比" className="scan-line" height={350}>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={cityBalanceChart}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
            <YAxis stroke="#64748b" fontSize={10} label={{ value: '亿m³/a', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
            <Tooltip content={<ChartTooltip unit="亿m³/a" title="水量" />} />
            <Bar dataKey="recharge" name="补给量" fill="#3b82f6" radius={[2, 2, 0, 0]} />
            <Bar dataKey="discharge" name="排泄量" fill="#ef4444" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <TechCard title="各市均衡明细" badge="1991-2000年均值">
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto scrollbar-thin">
          <table className="w-full text-[10px]">
            <thead className="sticky top-0 bg-gw-card z-10"><tr className="border-b border-gw-border">
              <th className="text-left text-gw-muted py-1.5 px-1.5">城市</th>
              <th className="text-left text-gw-muted py-1.5 px-1.5">矿化度</th>
              <th className="text-gw-muted py-1.5 px-1.5">面积(km²)</th>
              <th className="text-gw-muted py-1.5 px-1.5">补给量</th>
              <th className="text-gw-muted py-1.5 px-1.5">排泄量</th>
              <th className="text-gw-muted py-1.5 px-1.5">均衡差</th>
            </tr></thead>
            <tbody>
              {cityWaterBalance.map(c =>
                c.units.map((u, i) => (
                  <tr key={`${c.city}-${i}`} className="border-b border-gw-border/20 data-row">
                    {i === 0 && <td className="py-1.5 px-1.5 font-medium text-gw-text" rowSpan={c.units.length}>{c.city}</td>}
                    <td className="py-1.5 px-1.5 text-gw-muted">{u.salinity}</td>
                    <td className="py-1.5 px-1.5 font-mono text-center">{u.area}</td>
                    <td className="py-1.5 px-1.5 font-mono text-center">{u.recharge}</td>
                    <td className="py-1.5 px-1.5 font-mono text-center">{u.discharge}</td>
                    <td className={`py-1.5 px-1.5 font-mono text-center ${u.balance < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {u.balance > 0 ? '+' : ''}{u.balance.toFixed(4)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </TechCard>

      <TechCard title="各市地下水开采量（2000年，按用途）">
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead><tr className="border-b border-gw-border">
              <th className="text-left text-gw-muted py-1.5 px-1.5">城市</th>
              <th className="text-gw-muted py-1.5 px-1.5">浅层</th>
              <th className="text-gw-muted py-1.5 px-1.5">深层</th>
              <th className="text-gw-muted py-1.5 px-1.5">微咸水</th>
              <th className="text-gw-muted py-1.5 px-1.5">总计</th>
              <th className="text-gw-muted py-1.5 px-1.5">农业</th>
              <th className="text-gw-muted py-1.5 px-1.5">工业</th>
              <th className="text-gw-muted py-1.5 px-1.5">生活</th>
            </tr></thead>
            <tbody>
              {cityGroundwaterExtraction2000.map((c, i) => (
                <tr key={i} className="border-b border-gw-border/20 data-row">
                  <td className="py-1.5 px-1.5 font-medium text-gw-text">{c.city}</td>
                  <td className="py-1.5 px-1.5 font-mono text-center">{c.shallow}</td>
                  <td className="py-1.5 px-1.5 font-mono text-center">{c.deep}</td>
                  <td className="py-1.5 px-1.5 font-mono text-center">{c.brackish}</td>
                  <td className="py-1.5 px-1.5 font-mono text-center font-bold">{c.total}</td>
                  <td className="py-1.5 px-1.5 font-mono text-center">{c.agriculture}</td>
                  <td className="py-1.5 px-1.5 font-mono text-center">{c.industry}</td>
                  <td className="py-1.5 px-1.5 font-mono text-center">{c.domestic}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>
    </div>
  );
}
