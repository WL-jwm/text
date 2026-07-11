import React, { useMemo } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ScatterChart, Scatter, ZAxis, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, Thermometer, Flame, MapPin, Zap } from 'lucide-react';
import { geothermalGradientZoning, geothermalTempProfile, geothermalHistory } from '../../data/geothermal';
import { StatCard, TechCard, ChartTooltip, DataSourceNote } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { ChartExport } from '../ChartExport';
import { FilterableTechTable } from '../FilterableTechTable';

export function GeothermalGradientTab() {
  const maxGradient = '5.0';
  const maxHeatFlow = 95;
  const avgHeatFlow = useMemo(() => {
    const vals = geothermalGradientZoning.map(z => { const m = z.heatFlow.match(/([\d]+)/); return m ? parseInt(m[1]) : 50; });
    return Math.round(vals.reduce((a, b) => a + b) / vals.length);
  }, []);

  // 热流-梯度散点
  const scatterData = useMemo(() =>
    geothermalGradientZoning.map(z => {
      const gMin = z.gradient.split('~')[0]; const gVal = parseFloat(gMin) || 2.5;
      const gMax = z.gradient.split('~')[1]; const gVal2 = parseFloat(gMax.replace(/[^\d.]/g, '')) || gVal;
      const hMin = z.heatFlow.match(/([\d]+)/); const hVal = hMin ? parseInt(hMin[1]) : 50;
      return { name: z.zone, '梯度下限(C/100m)': gVal, '梯度上限(C/100m)': gVal2, '热流(mW/m2)': hVal, '分布': z.distribution };
    }),
  []);

  // 温度剖面面积图数据(取中值)
  const profileData = useMemo(() =>
    geothermalTempProfile.map(t => {
      const parse = (s: string) => { if (s === '-') return 0; const parts = s.split('~'); return parts.length === 2 ? Math.round((parseFloat(parts[0]) + parseFloat(parts[1])) / 2) : parseFloat(parts[0]) || 0; };
      return { name: t.field, '500m': parse(t.depth500), '1000m': parse(t.depth1000), '1500m': parse(t.depth1500), '2000m': parse(t.depth2000), '2500m': parse(t.depth2500), '3000m': parse(t.depth3000) };
    }),
  []);

  // 梯度分类饼图
  const catPie = useMemo(() => {
    const m: Record<string, number> = {};
    geothermalGradientZoning.forEach(z => { const cat = z.feature.includes('高') ? '高热流' : z.feature.includes('低') ? '低热流' : '中热流'; m[cat] = (m[cat] || 0) + 1; });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, []);

  return (
    <div className="space-y-4">
      {/* ── 5格统计卡片 ── */}
      <div className="grid grid-cols-5 gap-3">
        <StatCard title="地温分区" value={geothermalGradientZoning.length} unit="个" icon={BarChart3} subtitle="全省覆盖" accent="red" />
        <StatCard title="最高梯度" value={maxGradient} unit="C/100m" icon={Thermometer} subtitle="牛驼镇凸起" accent="amber" />
        <StatCard title="最高热流" value={maxHeatFlow} unit="mW/m2" icon={Flame} subtitle="冀中坳陷" accent="orange" />
        <StatCard title="平均热流" value={avgHeatFlow} unit="mW/m2" icon={Zap} subtitle="6分区均值" accent="cyan" />
        <StatCard title="核心区" value="冀中坳陷" unit="" icon={MapPin} subtitle="开发核心" accent="emerald" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* ── 热流-梯度散点 ── */}
        <LazyChartCard title="地温梯度-大地热流关系" badge="正相关" height={280}>
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis dataKey="梯度下限(C/100m)" type="number" name="地温梯度" tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: 'C/100m', position: 'insideBottom', fill: '#8b9dc3' }} />
              <YAxis dataKey="热流(mW/m2)" type="number" name="大地热流" tick={{ fill: '#8b9dc3', fontSize: 10 }} domain={[30, 100]} label={{ value: 'mW/m2', angle: -90, position: 'insideLeft', fill: '#8b9dc3' }} />
              <ZAxis dataKey="梯度上限(C/100m)" range={[50, 250]} name="梯度上限" />
              <Tooltip content={<ChartTooltip title="梯度-热流" />} cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={scatterData} fill="#ef4444" fillOpacity={0.7} />
            </ScatterChart>
          </ResponsiveContainer>
          <DataSourceNote source="气泡大小=梯度上限范围；梯度与热流正相关，基低隆起区异常高值" />
        </LazyChartCard>

        {/* ── 梯度分类饼图 ── */}
        <LazyChartCard title="热流等级分布" badge={catPie.length + '类'} height={280}>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={catPie} cx="50%" cy="50%" innerRadius={45} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {catPie.map((entry, i: number) => <Cell key={i} fill={entry.name === '高热流' ? '#ef4444' : entry.name === '中热流' ? '#f59e0b' : '#3b82f6'} />)}
              </Pie>
              <Tooltip content={<ChartTooltip title="热流等级" />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>

      {/* ── 温度剖面面积图 ── */}
      <LazyChartCard title="地热井温度垂向分布(中值)" badge="C" height={300}>
        <div className="mb-2 flex justify-end">
          <ChartExport data={profileData} filename="温度垂向分布" sheetName="温度剖面" formats={['xlsx', 'csv', 'json']} label="导出数据" />
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={profileData} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
            <XAxis dataKey="name" tick={{ fill: '#8b9dc3', fontSize: 10 }} />
            <YAxis tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: 'C', angle: -90, position: 'insideLeft', fill: '#8b9dc3' }} />
            <Tooltip content={<ChartTooltip unit="C" title="温度剖面" />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Area type="monotone" dataKey="500m" name="500m" stackId="s" fill="#3b82f6" stroke="#3b82f6" fillOpacity={0.4} />
            <Area type="monotone" dataKey="1000m" name="1000m" stackId="s" fill="#22c55e" stroke="#22c55e" fillOpacity={0.4} />
            <Area type="monotone" dataKey="1500m" name="1500m" stackId="s" fill="#f59e0b" stroke="#f59e0b" fillOpacity={0.4} />
            <Area type="monotone" dataKey="2000m" name="2000m" stackId="s" fill="#f97316" stroke="#f97316" fillOpacity={0.4} />
            <Area type="monotone" dataKey="2500m" name="2500m" stackId="s" fill="#ef4444" stroke="#ef4444" fillOpacity={0.4} />
            <Area type="monotone" dataKey="3000m" name="3000m" stackId="s" fill="#8b5cf6" stroke="#8b5cf6" fillOpacity={0.4} />
          </AreaChart>
        </ResponsiveContainer>
      </LazyChartCard>

      {/* ── 梯度分区详细 + 温度垂向表 ── */}
      <div className="grid grid-cols-2 gap-4">
        <TechCard title="地温梯度分区详细">
          <div className="mb-2 flex justify-end">
            <ChartExport data={geothermalGradientZoning} filename="地温梯度分区" sheetName="梯度分区" formats={['xlsx', 'csv', 'json']} label="导出数据" />
          </div>
          <FilterableTechTable
            headers={['分区', '梯度(C/100m)', '热流(mW/m2)', '分布', '特征', '代表']}
            rows={geothermalGradientZoning.map(z => [z.zone, z.gradient, z.heatFlow, z.distribution, z.feature, z.representative])}
            filterPlaceholder="搜索分区..."
          />
        </TechCard>
        <TechCard title="温度垂向分布详细">
          <FilterableTechTable
            headers={['地热田', '500m', '1000m', '1500m', '2000m', '2500m', '3000m', '热储层']}
            rows={geothermalTempProfile.map(t => [t.field, t.depth500, t.depth1000, t.depth1500, t.depth2000, t.depth2500, t.depth3000, t.reservoir])}
            filterPlaceholder="搜索地热田..."
          />
        </TechCard>
      </div>

      {/* ── 历史沿革 ── */}
      <TechCard title="地热开发历史沿革" badge="6阶段">
        <div className="relative">
          <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gw-border/30" />
          <div className="space-y-2 pl-6">
            {geothermalHistory.map((h: { period: string; event: string; milestone: string }, i: number) => (
              <div key={i} className="relative">
                <div className={'absolute -left-[18px] top-1 w-2.5 h-2.5 rounded-full border-2 ' + (i >= 4 ? 'bg-emerald-500/30 border-emerald-500' : 'bg-amber-500/30 border-amber-500')} />
                <div className="p-2 bg-gw-surface/50 rounded border border-gw-border/20">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[9px] font-mono text-gw-cyan bg-gw-cyan/10 px-1 py-0.5 rounded">{h.period}</span>
                    <span className="text-[8px] text-gw-muted">{h.milestone}</span>
                  </div>
                  <p className="text-[10px] text-gw-text">{h.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </TechCard>
    </div>
  );
}
