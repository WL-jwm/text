import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Zap, Activity, TrendingUp } from 'lucide-react';
import { ionMobility } from '../../data/hydrogeologyHistorical';
import { StatCard, TechCard, ChartTooltip, DataSourceNote } from '../UI';
import { LazyChartCard } from '../LazyChartCard';

export function HydrochemIonMobilityTab() {
  // 离子迁移率柱图数据
  const chartData = React.useMemo(() => {
    const cations = ionMobility.filter((i) => i.ionType === '阳离子').map((i) => ({
      name: i.ion,
      mobility: parseFloat(i.mobility) || 0,
      type: '阳离子',
    }));
    const anions = ionMobility.filter((i) => i.ionType === '阴离子').map((i) => ({
      name: i.ion,
      mobility: parseFloat(i.mobility) || 0,
      type: '阴离子',
    }));
    return [...cations, ...anions].sort((a, b) => b.mobility - a.mobility);
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="离子总数" value={String(ionMobility.length)} unit="种" icon={Zap} accent="blue" />
        <StatCard title="阳离子" value={String(ionMobility.filter((i) => i.ionType === '阳离子').length)} unit="种" icon={Activity} accent="cyan" />
        <StatCard title="阴离子" value={String(ionMobility.filter((i) => i.ionType === '阴离子').length)} unit="种" icon={Activity} accent="green" />
        <StatCard title="最高迁移率" value="H⁺" unit="324.2" icon={TrendingUp} accent="amber" />
      </div>

      <LazyChartCard title="离子迁移率对比" badge="10⁻⁸ m²·s⁻¹·V⁻¹" className="scan-line" height={320}>
        <div className="flex items-center gap-3 mb-2 text-[10px] text-gw-muted">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" />阳离子</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" />阴离子</span>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 10, right: 20, bottom: 40, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
            <XAxis dataKey="name" tick={{ fill: '#8b9dc3', fontSize: 10 }} />
            <YAxis tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: '迁移率', angle: -90, position: 'insideLeft', style: { fill: '#8b9dc3', fontSize: 10 } }} />
            <Tooltip content={<ChartTooltip title="离子迁移率" />} />
            <Bar dataKey="mobility" name="迁移率" radius={[3, 3, 0, 0]}>
              {chartData.map((d, i: number) => (
                <rect key={i} fill={d.type === '阳离子' ? '#3b82f6' : '#f59e0b'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <TechCard title="地下水常见离子迁移率" icon={Zap}>
        <p className="text-[10px] text-gw-muted mb-3">
          离子迁移率(10⁻⁸ m²·s⁻¹·V⁻¹)，反映离子在电场中的运动能力，与地下水化学演化、弥散和电极化效应密切相关
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-gw-border">
              <th className="px-2 py-1.5 text-left text-gw-muted font-medium">离子</th>
              <th className="px-2 py-1.5 text-left text-gw-muted font-medium">迁移率</th>
              <th className="px-2 py-1.5 text-left text-gw-muted font-medium">类型</th>
            </tr></thead>
            <tbody>
              {ionMobility.map((ion, i: number) => (
                <tr key={i} className={`border-b border-gw-border/50 hover:bg-gw-surface/50 ${ion.ionType === '阳离子' ? '' : 'bg-gw-surface/20'}`}>
                  <td className="px-2 py-1 text-gw-text font-medium">{ion.ion}</td>
                  <td className="px-2 py-1 font-mono text-gw-highlight">{ion.mobility}</td>
                  <td className="px-2 py-1">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${ion.ionType === '阳离子' ? 'bg-blue-500/15 text-blue-400' : 'bg-amber-500/15 text-amber-400'}`}>{ion.ionType}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>

      <DataSourceNote source="《河北省水文地质工程地质》| 离子迁移率参数" version="水化学参数" />
    </div>
  );
}
