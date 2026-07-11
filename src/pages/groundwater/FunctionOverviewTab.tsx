import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { TechCard, ChartTooltip } from '../../components/UI';
import { LazyChartCard } from '../../components/LazyChartCard';
import { overdraftOverview, cityOverdraftZones, waterLevelRecovery } from '../../data/groundwaterFunction';

interface FunctionOverviewTabProps {
  typePieData: { name: string; value: number; color: string }[];
  cityTypeData: { name: string; shallow: number; deep: number; severeDeep: number }[];
}

export function FunctionOverviewTab({ typePieData, cityTypeData }: FunctionOverviewTabProps) {
  const shallowCities = cityOverdraftZones.filter(c => c.shallowType !== '—');
  const deepCities = cityOverdraftZones.filter(c => c.deepType !== '—');
  const severeDeepCities = cityOverdraftZones.filter(c => c.deepType === '严重超采区');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="超采区面积构成" className="scan-line" height={300}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={typePieData} cx="50%" cy="50%" innerRadius={50} outerRadius={100}
                dataKey="value" label={({ name, value }) => `${name} ${value.toLocaleString()}km²`}>
                {typePieData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip content={<ChartTooltip unit="km²" title="超采面积" />} />
            </PieChart>
          </ResponsiveContainer>
        </LazyChartCard>
        <TechCard title="超采区概况" badge="2022年公布">
          <div className="space-y-3">
            <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
              <p className="text-xs text-gw-muted">
                依据河北省人民政府《关于公布地下水超采区和禁止开采区、限制开采区范围的通知》(2022)，全省超采区总面积
                <span className="text-gw-highlight font-bold"> {overdraftOverview.totalArea.toLocaleString()} km²</span>。
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-amber-500/5 rounded-lg border border-amber-500/20">
                <p className="text-[10px] text-gw-muted">浅层超采面积</p>
                <p className="text-lg font-bold text-amber-400">{overdraftOverview.shallowOverdraft.toLocaleString()}</p>
                <p className="text-[9px] text-gw-muted">km²</p>
              </div>
              <div className="p-2.5 bg-red-500/5 rounded-lg border border-red-500/20">
                <p className="text-[10px] text-gw-muted">深层超采面积</p>
                <p className="text-lg font-bold text-red-400">{overdraftOverview.deepOverdraft.toLocaleString()}</p>
                <p className="text-[9px] text-gw-muted">km²</p>
              </div>
            </div>
            <div className="p-2.5 bg-purple-500/5 rounded-lg border border-purple-500/20">
              <p className="text-[10px] text-gw-muted">浅层与深层重叠面积</p>
              <p className="text-lg font-bold text-purple-400">{overdraftOverview.overlapArea.toLocaleString()} km²</p>
            </div>
            <p className="text-[9px] text-gw-muted/60">数据来源：{overdraftOverview.source} | 更新日期：{overdraftOverview.updateDate}</p>
          </div>
        </TechCard>
      </div>

      <TechCard title="各市超采类型统计">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LazyChartCard title="各市超采类型分布" height={280}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={cityTypeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
                <XAxis type="number" stroke="#64748b" fontSize={10} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} width={50} />
                <Tooltip content={<ChartTooltip title="超采类型" />} />
                <Bar dataKey="shallow" name="浅层超采" fill="#f59e0b" stackId="a" radius={[0, 2, 2, 0]} />
                <Bar dataKey="deep" name="深层超采" fill="#3b82f6" stackId="a" />
                <Bar dataKey="severeDeep" name="严重超采" fill="#ef4444" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </LazyChartCard>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-gw-surface/30 rounded-lg">
              <span className="text-xs text-gw-text">有浅层超采的市</span>
              <span className="text-lg font-bold text-amber-400">{shallowCities.length}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gw-surface/30 rounded-lg">
              <span className="text-xs text-gw-text">有深层超采的市</span>
              <span className="text-lg font-bold text-blue-400">{deepCities.length}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gw-surface/30 rounded-lg">
              <span className="text-xs text-gw-text">深层严重超采的市</span>
              <span className="text-lg font-bold text-red-400">{severeDeepCities.length}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gw-surface/30 rounded-lg">
              <span className="text-xs text-gw-text">超采治理成效</span>
              <span className="text-sm font-bold text-emerald-400">深层水位回升{waterLevelRecovery.deepRecovery}m</span>
            </div>
          </div>
        </div>
      </TechCard>
    </div>
  );
}
