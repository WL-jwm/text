import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { MapPin, Droplets, Activity, ArrowDownToLine } from 'lucide-react';
import { geology } from '../../data/geology';
import { TechCard, StatCard, ChartTooltip, CHART_COLORS } from '../UI';
import { LazyChartCard } from '../LazyChartCard';

export function GeologyOverviewTab() {
  const aquiferSystemPie = useMemo(() => geology.aquiferSystems.map((a, i) => ({
    name: a.name,
    value: a.areaKm2,
    color: CHART_COLORS[i % CHART_COLORS.length],
  })), []);

  const systemBarData = useMemo(() => geology.systems.map(s => ({
    name: s.name.length > 6 ? s.name.slice(0, 6) : s.name,
    recharge: s.recharge,
    exploitable: s.exploitable,
    rate: ((s.exploitable / s.recharge) * 100).toFixed(1),
  })), []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="评价面积" value="18.88" unit="万km²" icon={MapPin} accent="blue" />
        <StatCard title="可开采量" value="146.87" unit="亿m³/a" icon={Droplets} accent="cyan" />
        <StatCard title="补给总量" value="185.52" unit="亿m³/a" icon={Activity} accent="green" />
        <StatCard title="含水层总厚" value="0~550" unit="m" icon={ArrowDownToLine} accent="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TechCard title="河北省地质概况" className="hud-corners">
          <div className="space-y-2">
            <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">地理位置：</span>华北平原北部，东临渤海，北靠燕山，西依太行山</p>
            <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">地形地貌：</span>西北高、东南低，山地高原~平原~滨海三级阶梯</p>
            <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">地层发育：</span>太古宇-新生界齐全，以元古宇碳酸盐岩和新生界松散沉积为主</p>
            <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">构造特征：</span>华北克拉通内部，多期构造叠加，NE向断裂控制盆地格局</p>
            <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">水文地质分区：</span>6个水资源分区（滦河冀东/海河北系/海河南系/徒骇马颊/辽河/内陆河）</p>
          </div>
        </TechCard>
        <LazyChartCard title="含水系统类型分布" className="scan-line" height={280}>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={aquiferSystemPie} cx="50%" cy="50%" innerRadius={40} outerRadius={75} paddingAngle={3} dataKey="value" stroke="none" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {aquiferSystemPie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip content={<ChartTooltip percentDigits={1} title="类型分布" />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {geology.aquiferSystems.map((a, i) => (
              <div key={i} className="text-center p-2 bg-gw-surface/50 rounded">
                <div className="text-[10px] text-gw-muted">{a.name}</div>
                <div className="text-sm font-mono text-gw-highlight">{a.areaKm2.toLocaleString()}</div>
                <div className="text-[10px] text-gw-muted">km²</div>
              </div>
            ))}
          </div>
        </LazyChartCard>
      </div>

      <LazyChartCard title="各分区补给量与可开采量对比" className="scan-line" height={280}>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={systemBarData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
            <YAxis stroke="#64748b" fontSize={10} label={{ value: '亿m³/a', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
            <Tooltip content={<ChartTooltip title="开采数据" />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="recharge" name="补给量" fill="#3b82f6" radius={[2, 2, 0, 0]} />
            <Bar dataKey="exploitable" name="可开采量" fill="#06b6d4" radius={[2, 2, 0, 0]} />
            <Line type="monotone" dataKey="rate" name="开采系数(%)" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <TechCard title="含水系统特征总表">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gw-border">
              <th className="text-left text-gw-muted py-2 px-2 text-xs">含水系统</th>
              <th className="text-gw-muted py-2 px-2 text-xs">分布范围</th>
              <th className="text-gw-muted py-2 px-2 text-xs">面积(km²)</th>
              <th className="text-gw-muted py-2 px-2 text-xs">占比</th>
              <th className="text-gw-muted py-2 px-2 text-xs">特征</th>
            </tr></thead>
            <tbody>
              {geology.aquiferSystems.map((a, i) => (
                <tr key={i} className="border-b border-gw-border/30 data-row">
                  <td className="py-2 px-2 text-xs font-medium text-gw-text">{a.name}</td>
                  <td className="py-2 px-2 text-xs">{a.area}</td>
                  <td className="py-2 px-2 font-mono text-xs text-gw-cyan">{a.areaKm2.toLocaleString()}</td>
                  <td className="py-2 px-2 font-mono text-xs">{a.proportion}</td>
                  <td className="py-2 px-2 text-xs text-gw-muted">{a.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>
    </div>
  );
}
