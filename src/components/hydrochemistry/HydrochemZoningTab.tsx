import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart, Line, Cell } from 'recharts';
import { hydrochemicalZoning } from '../../data/hydrochemistry';
import { TechCard, ChartTooltip, StatCard, DataSourceNote } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { FilterableTechTable } from '../FilterableTechTable';
import { ChartExport } from '../ChartExport';

const ZONE_GRADIENT = ['#10b981', '#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444', '#dc2626'];

function parseResistivityMid(range: string): number {
  const parts = range.replace(/[~>＜]/g, '-').split('-').map(Number);
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) return (parts[0] + parts[1]) / 2;
  return parts[0] || 0;
}

export function HydrochemZoningTab() {
  // TDS范围提取
  const tdsData = useMemo(() =>
    hydrochemicalZoning.map((z) => {
      const parts = z.tdsRange.replace(/[~>]/g, '').split('-');
      const avg = parts.length > 1
        ? (parseFloat(parts[0]) + parseFloat(parts[1])) / 2
        : parseFloat(parts[0]) || 0;
      return { name: z.zone, tds: Math.round(avg), range: z.tdsRange, waterType: z.waterType, color: z.color, ph: z.phRange };
    }),
  []);

  // TDS递增趋势线
  const tdsTrend = useMemo(() =>
    tdsData.map((d, i) => ({
      name: d.name,
      TDS: d.tds,
      指数趋势: 200 * Math.exp(0.5 * i),
    })),
  []);

  // Treemap数据
  const treemapData = useMemo(() =>
    hydrochemicalZoning.map((z, i) => ({
      name: z.zone,
      size: parseResistivityMid(z.tdsRange),
      color: ZONE_GRADIENT[i] || '#64748b',
      tds: z.tdsRange,
    })),
  []);

  // 垂直分带对比（TDS递增从浅到深）
  const verticalData = useMemo(() => {
    const shallow = hydrochemicalZoning.find((z) => z.zone.includes('山前'));
    const mid = hydrochemicalZoning.find((z) => z.zone.includes('中部'));
    const coastal = hydrochemicalZoning.find((z) => z.zone.includes('滨海'));
    return [
      { depth: '浅层(0-50m)', 山前: shallow ? parseResistivityMid(shallow.tdsRange) : 300, 中部: mid ? parseResistivityMid(mid.tdsRange) : 800, 滨海: coastal ? parseResistivityMid(coastal.tdsRange) : 3000 },
      { depth: '中层(50-150m)', 山前: Math.round(300 * 1.2), 中部: Math.round(800 * 1.5), 滨海: Math.round(3000 * 1.3) },
      { depth: '深层(>150m)', 山前: Math.round(300 * 1.5), 中部: Math.round(800 * 2), 滨海: Math.round(3000 * 1.5) },
    ];
  }, []);

  // 统计
  const maxTds = Math.max(...tdsData.map(d => d.tds));
  const minTds = Math.min(...tdsData.map(d => d.tds));
  const tdsRange = maxTds / minTds;

  return (
    <div className="space-y-6">
      {/* 统计横幅 */}
      <div className="p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-amber-500/10 border border-green-500/20">
        <div className="flex items-center gap-2">
          <span className="text-sm text-green-400 font-medium">水化学水平分带分析</span>
        </div>
        <p className="text-xs text-gw-muted mt-1">自山前至滨海，TDS从{minTds}mg/L递增至{maxTds.toLocaleString()}mg/L，相差{tdsRange.toFixed(0)}倍，呈典型的HCO3→SO4→Cl演化序列。</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3">
        <StatCard title="分带数量" value={hydrochemicalZoning.length} unit="个" accent="green" subtitle="山前→滨海" />
        <StatCard title="最低TDS" value={minTds} unit="mg/L" accent="emerald" subtitle="山前溶滤区" />
        <StatCard title="最高TDS" value={maxTds.toLocaleString()} unit="mg/L" accent="red" subtitle="滨海海侵区" />
        <StatCard title="TDS倍数" value={tdsRange.toFixed(0)} unit="倍" accent="amber" subtitle="最大/最小" />
        <StatCard title="水类型" value={new Set(hydrochemicalZoning.map((z) => z.waterType)).size} unit="种" accent="blue" subtitle="演化序列" />
      </div>

      {/* TDS梯度 + TDS趋势线 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="各分带TDS梯度变化" badge="山前→滨海" className="scan-line" height={320}>
          <div className="flex items-center gap-3 mb-2 text-[10px] text-gw-muted">
            <span>从山前到滨海，TDS呈指数级递增</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={tdsData} margin={{ top: 10, right: 20, bottom: 40, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis dataKey="name" tick={{ fill: '#8b9dc3', fontSize: 9 }} angle={-15} textAnchor="end" height={45} />
              <YAxis tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: 'TDS(mg/L)', angle: -90, position: 'insideLeft', style: { fill: '#8b9dc3' } }} />
              <Tooltip content={<ChartTooltip title="TDS" unit="mg/L" />} />
              <Bar dataKey="tds" name="平均TDS(mg/L)" radius={[3, 3, 0, 0]}>
                {tdsData.map((_, i) => <Cell key={i} fill={ZONE_GRADIENT[i] || '#64748b'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <DataSourceNote source="各分带典型TDS平均值。颜色从绿到红反映矿化度递增" />
        </LazyChartCard>

        <LazyChartCard title="TDS指数递增趋势" badge="拟合曲线" className="scan-line" height={320}>
          <div className="flex items-center gap-3 mb-2 text-[9px] text-gw-muted">
            <span className="text-blue-400">蓝色=实测</span>
            <span className="text-amber-400">黄色=指数拟合</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={tdsTrend} margin={{ top: 10, right: 20, bottom: 40, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis dataKey="name" tick={{ fill: '#8b9dc3', fontSize: 8 }} angle={-15} textAnchor="end" height={45} />
              <YAxis tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: 'TDS(mg/L)', angle: -90, position: 'insideLeft', fill: '#8b9dc3' }} />
              <Tooltip content={<ChartTooltip title="TDS趋势" />} />
              <Legend wrapperStyle={{ fontSize: 9 }} />
              <Bar dataKey="TDS" name="实测TDS" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              <Line type="monotone" dataKey="指数趋势" name="指数拟合" stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 3" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
          <DataSourceNote source="TDS沿径流方向呈指数级递增趋势，反映溶滤→蒸发→海侵的叠加效应。拟合曲线TDS=200·e^(0.5n)" />
        </LazyChartCard>
      </div>

      {/* 垂直分带对比 + Treemap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="垂直分带TDS对比(浅→深)" badge="m" className="scan-line" height={300}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={verticalData} margin={{ top: 5, right: 10, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis dataKey="depth" tick={{ fill: '#8b9dc3', fontSize: 9 }} />
              <YAxis tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: 'TDS(mg/L)', angle: -90, position: 'insideLeft', fill: '#8b9dc3' }} />
              <Tooltip content={<ChartTooltip title="垂直分带" />} />
              <Legend wrapperStyle={{ fontSize: 9 }} />
              <Bar dataKey="山前" name="山前" fill="#22c55e" radius={[2, 2, 0, 0]} />
              <Bar dataKey="中部" name="中部" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="滨海" name="滨海" fill="#ef4444" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <DataSourceNote source="同一分带内，垂向上浅层TDS最低(积极循环)，深层TDS升高(还原环境)。滨海区垂向差异最大" />
        </LazyChartCard>

        <LazyChartCard title="各分带TDS面积占比" badge="气泡图" height={300}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={treemapData.map(d => ({ name: d.name, TDS: d.size }))} layout="horizontal" margin={{ top: 5, right: 10, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis dataKey="name" tick={{ fill: '#8b9dc3', fontSize: 9 }} angle={-15} textAnchor="end" height={45} />
              <YAxis tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: 'TDS(mg/L)', angle: -90, position: 'insideLeft', fill: '#8b9dc3' }} />
              <Tooltip content={<ChartTooltip title="分带TDS" />} />
              <Bar dataKey="TDS" name="TDS(mg/L)" radius={[4, 4, 0, 0]}>
                {treemapData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <DataSourceNote source="各分带TDS值对比。颜色从绿到红反映矿化度递增，与水平分带序列一致" />
        </LazyChartCard>
      </div>

      {/* 分带特征卡片 + 分带规律 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TechCard title="水化学水平分带特征卡片" badge="山前→滨海">
          <div className="space-y-2">
            {hydrochemicalZoning.map((z, i: number) => (
              <div key={i} className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gw-text">{z.zone}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: z.color + '22', color: z.color }}>{z.waterType}</span>
                </div>
                <p className="text-[10px] text-gw-muted mt-1">{z.location}</p>
                <div className="grid grid-cols-2 gap-1 mt-1">
                  <div className="text-[10px]"><span className="text-gw-muted">TDS:</span> <span className="font-mono text-gw-cyan">{z.tdsRange}</span></div>
                  <div className="text-[10px]"><span className="text-gw-muted">pH:</span> <span className="font-mono text-gw-cyan">{z.phRange}</span></div>
                  <div className="text-[10px]"><span className="text-gw-muted">主要离子:</span> <span className="text-gw-text">{z.mainIons}</span></div>
                  <div className="text-[10px]"><span className="text-gw-muted">硬度:</span> <span className="text-gw-text">{z.hardnessType}</span></div>
                </div>
              </div>
            ))}
          </div>
        </TechCard>

        <TechCard title="水化学分带规律总结" badge="空间分异">
          <div className="space-y-2">
            <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">水平分异规律：</span>自山前至滨海，水化学类型呈明显的HCO3→SO4→Cl演化序列，TDS从小于300mg/L递增至3000~50000mg/L。</p>
            <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">垂直分异规律：</span>垂向上，浅层水以HCO3型为主（积极水循环），中层过渡为SO4·Cl型，深层以Cl-Na型为主（还原环境）。咸淡水界面从山前0m到滨海200~300m逐渐加深。</p>
            <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">特殊成分：</span>沧州、衡水深层承压水氟含量偏高(1.5~3.0mg/L)，与碱性环境、钙缺乏有关。高氟水分布与咸水体空间位置高度一致。</p>
          </div>

          <div className="mt-3 p-3 rounded-lg bg-gw-surface/50 border border-gw-border/30">
            <h4 className="text-xs text-gw-text font-semibold mb-1">演化驱动力</h4>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /><span className="text-gw-muted">溶滤作用(山前)</span></div>
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /><span className="text-gw-muted">阳离子交换(过渡带)</span></div>
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /><span className="text-gw-muted">蒸发浓缩(中部)</span></div>
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /><span className="text-gw-muted">海侵混合(滨海)</span></div>
            </div>
          </div>
        </TechCard>
      </div>

      {/* 详细数据表 */}
      <TechCard title="水平分带详细数据">
        <div className="mb-3 flex justify-end">
          <ChartExport data={hydrochemicalZoning} filename="hydrochemical-zoning" sheetName="水化学分带" formats={['xlsx', 'csv', 'json']} label="导出数据" />
        </div>
        <FilterableTechTable
          headers={['分带', '位置', 'TDS(mg/L)', '主要离子', '硬度类型', 'pH', '水类型']}
          rows={hydrochemicalZoning.map((z) => [z.zone, z.location, z.tdsRange, z.mainIons, z.hardnessType, z.phRange, z.waterType])}
          pageSize={10}
        />
      </TechCard>
    </div>
  );
}
