import React, { useMemo } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis,
} from 'recharts';
import {
  TrendingUp, BarChart3, Droplets, Target,
} from 'lucide-react';
import { TechCard, ChartTooltip, StatCard, DataSourceNote } from '../../components/UI';
import { LazyChartCard } from '../../components/LazyChartCard';
import { FilterableTechTable } from '../../components/FilterableTechTable';
import { SPATIAL_DATA, getZone } from './spatialData';

/** Tab 1: 空间自相关分析 */
export function CorrelationTab() {
  // 水位-开采量散点
  const scatter1 = useMemo(() =>
    SPATIAL_DATA.map(d => ({
      name: d.city, '开采量(亿m3)': d.extraction, '水位埋深(m)': d.waterLevel,
      '分区': getZone(d.city),
    })),
  []);

  // 沉降-开采量散点
  const scatter2 = useMemo(() =>
    SPATIAL_DATA.map(d => ({
      name: d.city, '开采量(亿m3)': d.extraction, '沉降(mm/a)': d.subsidence,
    })),
  []);

  // 水质-地温梯度散点
  const scatter3 = useMemo(() =>
    SPATIAL_DATA.map(d => ({
      name: d.city, '地温梯度(C/100m)': d.gradient, '水质指数': d.quality,
    })),
  []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-3">
        <StatCard title="相关系数r" value="0.85" unit="" icon={TrendingUp} subtitle="水位-开采正相关" accent="emerald" />
        <StatCard title="相关系数r" value="0.78" unit="" icon={TrendingUp} subtitle="沉降-开采正相关" accent="amber" />
        <StatCard title="相关系数r" value="0.65" unit="" icon={BarChart3} subtitle="水质-梯度正相关" accent="cyan" />
        <StatCard title="山区水质" value="1.9" unit="类" icon={Droplets} subtitle="优于山前平原" accent="blue" />
        <StatCard title="滨海沉降" value="55.4" unit="mm/a" icon={Target} subtitle="沧州/衡水最高" accent="red" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <LazyChartCard title="水位埋深 vs 开采量" badge="r=0.85" height={260}>
          <ResponsiveContainer width="100%" height={240}>
            <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis dataKey="开采量(亿m3)" type="number" tick={{ fill: '#8b9dc3', fontSize: 9 }} label={{ value: '亿m³', position: 'insideBottom', fill: '#8b9dc3', fontSize: 9 }} />
              <YAxis dataKey="水位埋深(m)" type="number" tick={{ fill: '#8b9dc3', fontSize: 9 }} domain={[0, 45]} />
              <ZAxis dataKey="沉降(mm/a)" range={[30, 120]} name="沉降速率" />
              <Tooltip content={<ChartTooltip title="水位-开采" />} cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={scatter1} fill="#22c55e" fillOpacity={0.7} />
            </ScatterChart>
          </ResponsiveContainer>
          <DataSourceNote source="气泡大小=沉降速率；开采量越大水位越深，呈显著正相关" />
        </LazyChartCard>

        <LazyChartCard title="沉降速率 vs 开采量" badge="r=0.78" height={260}>
          <ResponsiveContainer width="100%" height={240}>
            <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis dataKey="开采量(亿m3)" type="number" tick={{ fill: '#8b9dc3', fontSize: 9 }} label={{ value: '亿m³', position: 'insideBottom', fill: '#8b9dc3', fontSize: 9 }} />
              <YAxis dataKey="沉降(mm/a)" type="number" tick={{ fill: '#8b9dc3', fontSize: 9 }} domain={[0, 70]} />
              <ZAxis dataKey="水位埋深(m)" range={[40, 150]} name="水位埋深" />
              <Tooltip content={<ChartTooltip title="沉降-开采" />} cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={scatter2} fill="#f59e0b" fillOpacity={0.7} />
            </ScatterChart>
          </ResponsiveContainer>
          <DataSourceNote source="气泡大小=水位埋深；开采引起地层压密沉降" />
        </LazyChartCard>

        <LazyChartCard title="水质指数 vs 地温梯度" badge="r=0.65" height={260}>
          <ResponsiveContainer width="100%" height={240}>
            <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis dataKey="地温梯度(C/100m)" type="number" tick={{ fill: '#8b9dc3', fontSize: 9 }} label={{ value: 'C/100m', position: 'insideBottom', fill: '#8b9dc3', fontSize: 9 }} />
              <YAxis dataKey="水质指数" type="number" tick={{ fill: '#8b9dc3', fontSize: 9 }} domain={[1, 5]} />
              <ZAxis dataKey="开采量(亿m3)" range={[30, 120]} name="开采量" />
              <Tooltip content={<ChartTooltip title="水质-梯度" />} cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={scatter3} fill="#3b82f6" fillOpacity={0.7} />
            </ScatterChart>
          </ResponsiveContainer>
          <DataSourceNote source="气泡大小=开采量；高梯度区水质差(溶滤作用强)" />
        </LazyChartCard>
      </div>

      {/* 相关矩阵 */}
      <TechCard title="空间自相关系数矩阵(11市Pearson相关)">
        <FilterableTechTable
          headers={['指标对', '相关系数r', '显著性p', '解释', '结论']}
          rows={[
            ['水位埋深 - 开采量', '0.85', '&lt;0.01', '开采越大埋深越深', '显著正相关'],
            ['沉降速率 - 开采量', '0.78', '&lt;0.01', '开采引起地层压密', '显著正相关'],
            ['沉降速率 - 水位埋深', '0.72', '&lt;0.01', '水位下降加剧沉降', '显著正相关'],
            ['水质指数 - 地温梯度', '0.65', '&lt;0.05', '高温区溶滤强', '中等正相关'],
            ['水质指数 - 水位埋深', '0.58', '&lt;0.05', '深水区蒸发浓缩', '中等正相关'],
            ['地温梯度 - 沉降速率', '0.45', '&gt;0.05', '部分滨海区叠加', '弱正相关'],
            ['监测井数 - 开采量', '0.82', '&lt;0.01', '重点城市监测密', '显著正相关'],
          ]}
          filterPlaceholder="搜索指标对..."
        />
      </TechCard>
    </div>
  );
}
