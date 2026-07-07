import React from 'react';
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, Line, AreaChart, Area } from 'recharts';
import { shallowCones2024, shallowTotal2024 } from '../../data/environment';
import { TechCard, TechTable, ChartTooltip, DataSourceNote, CHART_COLORS } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { ContourMap } from '../ContourMap';

interface Props {
  shallowBar: { name: string; currentArea: number; prevArea: number; change: number }[];
  shallowPieData: { name: string; value: number }[];
}

export function EnvironmentShallowTab({ shallowBar, shallowPieData }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="浅层地下水漏斗面积对比(2023/2024)" className="scan-line" height={280}>
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={shallowBar}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} angle={-20} textAnchor="end" height={40} />
              <YAxis stroke="#64748b" fontSize={10} label={{ value: 'km²', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
              <Tooltip content={<ChartTooltip unit="km²" title="漏斗面积变化" />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="prevArea" name="2023年" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="currentArea" name="2024年" fill="#06b6d4" radius={[2, 2, 0, 0]} />
              <Line type="monotone" dataKey="change" name="变化(km²)" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </LazyChartCard>
        <LazyChartCard title="浅层漏斗面积占比分布" height={280}>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie data={shallowPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: '#475569', strokeWidth: 1 }} fontSize={10}>
                {shallowPieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<ChartTooltip unit="km²" title="漏斗面积" />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>

      <TechCard title="浅层漏斗详细数据">
        <TechTable
          title={`${shallowCones2024.length} 个浅层漏斗`}
          headers={['漏斗名称', '中心', '水位(m)', '面积(km²)', '上年', '变化']}
          rows={shallowCones2024.map(c => [c.name, c.center, c.waterLevel, c.area.toLocaleString(), c.prevArea.toLocaleString(), c.areaChange])}
          pageSize={10}
        />
      </TechCard>

      <LazyChartCard title="各漏斗面积年际变化" className="scan-line" height={280}>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={shallowBar}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={10} angle={-20} textAnchor="end" height={40} />
            <YAxis stroke="#64748b" fontSize={10} label={{ value: 'km²', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
            <Tooltip content={<ChartTooltip unit="km²" />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Area type="monotone" dataKey="prevArea" name="2023年" fill="#3b82f6" fillOpacity={0.3} stroke="#3b82f6" strokeWidth={2} />
            <Area type="monotone" dataKey="currentArea" name="2024年" fill="#06b6d4" fillOpacity={0.3} stroke="#06b6d4" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <TechCard title="浅层漏斗演变分析" badge="趋势解读">
        <div className="space-y-2">
          <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">整体趋势：</span>2024年河北省浅层地下水漏斗总面积{shallowTotal2024.totalArea.toLocaleString()}km²，较上年变化{shallowTotal2024.areaChange}km²。大部分漏斗面积持续缩小，反映超采治理成效。</p>
          <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">典型变化：</span>保定/石家庄/邢台等山前平原漏斗受南水北调补水影响，水位持续回升，漏斗面积显著缩小。沧州/衡水等中部平原浅层漏斗受深层水压减开采和农业节水双重影响。</p>
          <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">季节波动：</span>浅层漏斗面积存在明显的季节性变化——汛后（10-11月）水位回升、漏斗面积缩小；枯水期末（5-6月）水位下降、面积扩大。上述数据为年末统测值。</p>
        </div>
      </TechCard>

      <TechCard title="浅层漏斗分布等值线" badge="IDW插值" className="lg:col-span-2">
        <ContourMap
          title="浅层地下水位埋深等值线"
          subtitle="2024年数据，单位: m"
          data={shallowCones2024.map(c => ({
            name: c.name,
            value: Math.abs(c.waterLevel),
            x: 0.1 + Math.random() * 0.8,
            y: 0.1 + Math.random() * 0.8,
          }))}
          colorScale={[[0, '#22c55e'], [15, '#eab308'], [30, '#f97316'], [45, '#ef4444'], [60, '#7c2d12']]}
          unit="m"
        />
        <DataSourceNote source="基于2024年各漏斗中心水位埋深数据IDW插值生成，位置为示意分布" />
      </TechCard>
    </div>
  );
}
