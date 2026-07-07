import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart, PieChart, Pie, Cell } from 'recharts';
import { Flame, MapPin, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';
import { geothermalFields, geothermalGradient } from '../../data/geothermal';
import { TechCard, ChartTooltip, StatCard, DataSourceNote } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { ChartExport } from '../ChartExport';
import { FilterableTechTable } from '../FilterableTechTable';
import type { TempBarItem, AreaBarItem, GradientDepthItem, GeothermalField, GeothermalGradient } from '../../types/geothermal';

interface Props {
  tempBarData: TempBarItem[];
  areaBarData: AreaBarItem[];
  gradientDepthData: GradientDepthItem[];
}

export function GeothermalFieldsTab({ tempBarData, areaBarData, gradientDepthData }: Props) {
  const totalArea = geothermalFields.reduce((s, f) => s + parseInt(String(f.area)), 0);
  const largeScale = geothermalFields.filter(f => f.status === '大规模开发').length;
  const scaleDev = geothermalFields.filter(f => f.status === '规模开发').length;
  const initial = geothermalFields.filter(f => f.status === '初期开发').length;

  // 开发状态饼图
  const statusPie = useMemo(() => [
    { name: '大规模开发', value: largeScale },
    { name: '规模开发', value: scaleDev },
    { name: '初期开发', value: initial },
  ], []);

  // 温度中值排名
  const _tempRankData = useMemo(() =>
    geothermalFields.map(f => {
      const temps = f.temperature.split('~').map(Number);
      const mid = temps.length === 2 ? (temps[0] + temps[1]) / 2 : temps[0];
      return { name: f.name.replace('地热田', ''), '温度中值(C)': mid, '面积(km2)': parseInt(String(f.area)) };
    }).sort((a: any, b: any) => b['温度中值(C)'] - a['温度中值(C)']),
  []);

  // 储量面积对比
  const _reserveAreaData = useMemo(() =>
    geothermalFields.map(f => {
      const reserve = f.provenReserves.match(/([\d.]+)/);
      return { name: f.name.replace('地热田', ''), '面积(km2)': parseInt(String(f.area)), '储量系数': reserve ? parseFloat(reserve[1]) : 0 };
    }),
  []);

  return (
    <div className="space-y-4">
      {/* ── 5格统计卡片 ── */}
      <div className="grid grid-cols-5 gap-3">
        <StatCard title="地热田数" value={geothermalFields.length} unit="处" icon={Flame as any} subtitle="全省主要" accent="red" />
        <StatCard title="总面积" value={totalArea} unit="km2" icon={MapPin as any} subtitle="探明范围" accent="blue" />
        <StatCard title="大规模开发" value={largeScale} unit="处" icon={CheckCircle2 as any} subtitle="雄县/牛驼镇" accent="emerald" />
        <StatCard title="规模开发" value={scaleDev} unit="处" icon={TrendingUp as any} subtitle="新河/宁晋/蠡县/平山" accent="amber" />
        <StatCard title="初期开发" value={initial} unit="处" icon={AlertTriangle as any} subtitle="阳原/赤城" accent="orange" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* ── 温度范围对比 ── */}
        <LazyChartCard title="地热田温度范围对比" className="scan-line" height={280}>
          <div className="mb-2 flex justify-end">
            <ChartExport data={tempBarData} filename="地热田温度范围对比" sheetName="温度" formats={['xlsx', 'csv', 'json']} label="导出数据" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tempBarData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis type="number" stroke="#64748b" fontSize={10} label={{ value: 'C', position: 'insideBottom', fontSize: 10, fill: '#8b9dc3' }} />
              <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={10} width={65} tick={{ fill: '#8b9dc3' }} />
              <Tooltip content={<ChartTooltip unit="C" title="地热田温度范围" />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="minT" name="最低温度(C)" fill="#3b82f6" radius={[0, 2, 2, 0]} />
              <Bar dataKey="maxT" name="最高温度(C)" fill="#ef4444" radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>

        {/* ── 开发状态饼图 ── */}
        <LazyChartCard title="开发状态分布" badge={geothermalFields.length + '处'} height={280}>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={statusPie} cx="50%" cy="50%" innerRadius={45} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                <Cell fill="#22c55e" />
                <Cell fill="#f59e0b" />
                <Cell fill="#3b82f6" />
              </Pie>
              <Tooltip content={<ChartTooltip title="开发状态" />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
          <DataSourceNote source="大规模开发占比25%，初期开发25%有较大增长空间" />
        </LazyChartCard>
      </div>

      {/* ── 地热田一览表 ── */}
      <TechCard title="地热田一览">
        <div className="mb-2 flex justify-end">
          <ChartExport data={geothermalFields} filename="地热田一览" sheetName="地热田" formats={['xlsx', 'csv', 'json']} label="导出数据" />
        </div>
        <FilterableTechTable filterPlaceholder="搜索地热田..." headers={['名称', '位置', '类型', '热储层', '温度(C)', '深度(m)', '面积(km2)', '探明储量', '利用方式', '状态']}
          rows={geothermalFields.map((f: GeothermalField) => [f.name, f.location, f.type, f.reservoir, f.temperature, f.depth, f.area, f.provenReserves, f.utilization, f.status])}
        />
      </TechCard>

      {/* ── 面积分布+深度温度 ── */}
      <div className="grid grid-cols-2 gap-4">
        <LazyChartCard title="地热田面积分布" className="scan-line" height={260}>
          <div className="mb-2 flex justify-end">
            <ChartExport data={areaBarData} filename="地热田面积分布" sheetName="面积" formats={['xlsx', 'csv', 'json']} label="导出数据" />
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={areaBarData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis type="number" tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: 'km2', position: 'insideBottom', fill: '#8b9dc3' }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#8b9dc3', fontSize: 10 }} width={65} />
              <Tooltip content={<ChartTooltip unit="km2" title="面积" />} />
              <Bar dataKey="area" name="面积(km2)" fill="#f59e0b" radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <LazyChartCard title="地温梯度与不同深度温度" className="scan-line" height={260}>
          <div className="mb-2 flex justify-end">
            <ChartExport data={gradientDepthData} filename="地温梯度与深度温度" sheetName="深度温度" formats={['xlsx', 'csv', 'json']} label="导出数据" />
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={gradientDepthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis dataKey="name" tick={{ fill: '#8b9dc3', fontSize: 10 }} />
              <YAxis tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: 'C', angle: -90, position: 'insideLeft', fill: '#8b9dc3' }} />
              <Tooltip content={<ChartTooltip title="地温数据" />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="d1000" name="1000m温度" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="d2000" name="2000m温度" fill="#f59e0b" radius={[2, 2, 0, 0]} />
              <Bar dataKey="d3000" name="3000m温度" fill="#ef4444" radius={[2, 2, 0, 0]} />
            </ComposedChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>

      {/* ── 地温梯度详细数据 ── */}
      <TechCard title="地温梯度详细数据">
        <FilterableTechTable filterPlaceholder="搜索地温梯度..." headers={['地区', '梯度(C/100m)', '1000m', '2000m', '3000m', '类别']}
          rows={geothermalGradient.map((g: GeothermalGradient) => [g.region, g.gradient, g.depth1000m, g.depth2000m, g.depth3000m, g.category])}
        />
      </TechCard>
    </div>
  );
}
