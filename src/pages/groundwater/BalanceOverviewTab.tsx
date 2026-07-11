import React from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from 'recharts';
import { TechCard, ChartTooltip } from '../../components/UI';
import { LazyChartCard } from '../../components/LazyChartCard';
import { plainWaterBalance, hydrogeologicalParams } from '../../data/groundwaterResources';

const BALANCE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

interface BalanceOverviewTabProps {
  rechargePie: { name: string; value: number }[];
  dischargePie: { name: string; value: number }[];
}

export function BalanceOverviewTab({ rechargePie, dischargePie }: BalanceOverviewTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="补给项构成" className="scan-line" height={320}>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie data={rechargePie} cx="50%" cy="50%" innerRadius={50} outerRadius={100}
                dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}>
                {rechargePie.map((_, i) => <Cell key={i} fill={BALANCE_COLORS[i % BALANCE_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<ChartTooltip unit="亿m³/a" title="补给量" />} />
            </PieChart>
          </ResponsiveContainer>
        </LazyChartCard>
        <LazyChartCard title="排泄项构成" className="scan-line" height={320}>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie data={dischargePie} cx="50%" cy="50%" innerRadius={50} outerRadius={100}
                dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}>
                {dischargePie.map((_, i) => <Cell key={i} fill={BALANCE_COLORS.slice(2)[i % BALANCE_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<ChartTooltip unit="亿m³/a" title="排泄量" />} />
            </PieChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>

      <TechCard title="河北平原区水均衡总表" badge={`${plainWaterBalance.period} 年均值`}>
        <p className="text-xs text-gw-muted mb-3">
          总补给 {plainWaterBalance.totalRecharge} 亿m³/a，总排泄 {plainWaterBalance.totalDischarge} 亿m³/a，
          均衡差 <span className="text-red-400 font-bold">{plainWaterBalance.balance} 亿m³/a</span>（超采），
          储存量变化 <span className="text-red-400 font-bold">{plainWaterBalance.storageChange} 亿m³/a</span>。
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] text-gw-cyan font-semibold mb-1">补给项（总计 {plainWaterBalance.totalRecharge} 亿m³/a）</p>
            <table className="w-full text-[11px]">
              <thead><tr className="border-b border-gw-border">
                <th className="text-left text-gw-muted py-1 px-2">项目</th>
                <th className="text-gw-muted py-1 px-2">水量(亿m³/a)</th>
                <th className="text-gw-muted py-1 px-2">占比(%)</th>
              </tr></thead>
              <tbody>
                {plainWaterBalance.rechargeBreakdown.map((r, i) => (
                  <tr key={i} className="border-b border-gw-border/20">
                    <td className="py-1 px-2 text-gw-text">{r.item}</td>
                    <td className="py-1 px-2 font-mono text-center">{r.value}</td>
                    <td className="py-1 px-2 font-mono text-center">{r.percent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <p className="text-[10px] text-gw-cyan font-semibold mb-1">排泄项（总计 {plainWaterBalance.totalDischarge} 亿m³/a）</p>
            <table className="w-full text-[11px]">
              <thead><tr className="border-b border-gw-border">
                <th className="text-left text-gw-muted py-1 px-2">项目</th>
                <th className="text-gw-muted py-1 px-2">水量(亿m³/a)</th>
                <th className="text-gw-muted py-1 px-2">占比(%)</th>
              </tr></thead>
              <tbody>
                {plainWaterBalance.dischargeBreakdown.map((d, i) => (
                  <tr key={i} className="border-b border-gw-border/20">
                    <td className="py-1 px-2 text-gw-text">{d.item}</td>
                    <td className="py-1 px-2 font-mono text-center">{d.value}</td>
                    <td className="py-1 px-2 font-mono text-center">{d.percent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </TechCard>

      <TechCard title="水文地质参数">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(hydrogeologicalParams).map(([key, val]) => (
            <div key={key} className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
              <p className="text-[10px] text-gw-cyan font-semibold mb-1">
                {key === 'rainfallInfiltration' ? '降水入渗系数' :
                 key === 'permeability' ? '渗透系数' :
                 key === 'specificYield' ? '给水度' :
                 key === 'storageCoefficient' ? '释水系数' :
                 '潜水蒸发极限深度'}
              </p>
              <p className="text-[10px] text-gw-muted">{val}</p>
            </div>
          ))}
        </div>
      </TechCard>
    </div>
  );
}
