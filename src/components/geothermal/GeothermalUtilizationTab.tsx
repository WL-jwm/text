import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Flame, Thermometer, Zap, TrendingUp, Leaf } from 'lucide-react';
import { geothermalUtilization, geothermalResources } from '../../data/geothermal';
import { TechCard, ChartTooltip, StatCard, DataSourceNote } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { ChartExport } from '../ChartExport';
import { FilterableTechTable } from '../FilterableTechTable';
import type { BarItem, GeothermalUtilization } from '../../types/geothermal';

interface Props {
  utilizationBar: BarItem[];
}

export function GeothermalUtilizationTab({ utilizationBar }: Props) {
  // CCER减排估算(供暖替代标煤)
  const coalReplace = useMemo(() => {
    const m = geothermalResources.annualReplaceable.match(/([\d.]+)/);
    return m ? parseFloat(m[1]) : 500;
  }, []);

  const co2Reduce = (coalReplace * 2.6).toFixed(0);
  const _heatingPotential = useMemo(() => {
    const m = geothermalResources.heatingPotential.match(/([\d.]+)/);
    return m ? parseFloat(m[1]) : 2.0;
  }, []);

  // 利用效率数据
  const effData = useMemo(() =>
    geothermalUtilization.map(u => {
      const eff = u.efficiency.match(/([\d.]+)/);
      return { name: u.use, '效率(%)': eff ? parseFloat(eff[1]) : 0 };
    }),
  []);

  return (
    <div className="space-y-4">
      {/* ── 5格统计卡片 ── */}
      <div className="grid grid-cols-5 gap-3">
        <StatCard title="供暖面积" value="4500" unit="万m2" icon={Thermometer} subtitle="全国领先" accent="emerald" />
        <StatCard title="年替代标煤" value={coalReplace} unit="万t" icon={Flame} subtitle="清洁能源" accent="red" />
        <StatCard title="年减排CO2" value={Number(co2Reduce)} unit="万t" icon={Leaf} subtitle="碳减排贡献" accent="cyan" />
        <StatCard title="温泉/洗浴" value="120" unit="处" icon={Zap} subtitle="旅游产业" accent="amber" />
        <StatCard title="发电试验" value="2" unit="处" icon={TrendingUp} subtitle="双工质技术" accent="violet" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* ── 利用方式占比饼图 ── */}
        <LazyChartCard title="利用方式占比" className="scan-line" height={280}>
          <div className="mb-2 flex justify-end">
            <ChartExport data={utilizationBar} filename="利用方式占比" sheetName="利用方式占比" formats={['xlsx', 'csv', 'json']} label="导出数据" />
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={utilizationBar} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
                {utilizationBar.map((e: BarItem, i: number) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip content={<ChartTooltip unit="%" title="利用方式占比" />} />
            </PieChart>
          </ResponsiveContainer>
        </LazyChartCard>

        {/* ── 资源量统计 ── */}
        <TechCard title="地热资源量统计" badge="资源评价">
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-lg bg-gw-surface/50 border border-gw-border/40">
              <span className="text-gw-muted">总储量: </span><span className="text-gw-highlight font-bold">{geothermalResources.totalReserves}</span>
            </div>
            <div className="p-3 rounded-lg bg-gw-surface/50 border border-gw-border/40">
              <span className="text-gw-muted">可采量: </span><span className="text-gw-cyan font-bold">{geothermalResources.recoverable}</span>
            </div>
            <div className="p-3 rounded-lg bg-gw-surface/50 border border-gw-border/40">
              <span className="text-gw-muted">等效标煤: </span><span className="text-amber-400 font-bold">{geothermalResources.equivalentCoal}</span>
            </div>
            <div className="p-3 rounded-lg bg-gw-surface/50 border border-gw-border/40">
              <span className="text-gw-muted">年替代: </span><span className="text-emerald-400 font-bold">{geothermalResources.annualReplaceable}</span>
            </div>
            <div className="p-3 rounded-lg bg-gw-surface/50 border border-gw-border/40">
              <span className="text-gw-muted">供暖潜力: </span><span className="text-gw-highlight font-bold">{geothermalResources.heatingPotential}</span>
            </div>
            <div className="p-3 rounded-lg bg-gw-surface/50 border border-gw-border/40">
              <span className="text-gw-muted">资源类型: </span><span className="text-gw-muted">{geothermalResources.basinType}</span>
            </div>
          </div>
        </TechCard>
      </div>

      {/* ── 利用效率对比 ── */}
      <LazyChartCard title="各利用方式COP/效率对比" badge="%" height={220}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={effData} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
            <XAxis dataKey="name" tick={{ fill: '#8b9dc3', fontSize: 9 }} angle={-10} textAnchor="end" height={35} />
            <YAxis tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: '%', angle: -90, position: 'insideLeft', fill: '#8b9dc3' }} />
            <Tooltip content={<ChartTooltip unit="%" title="COP/效率" />} />
            <Bar dataKey="效率(%)" name="COP/效率" fill="#06b6d4" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <DataSourceNote source="热泵辅助供暖COP 3.5-4.5，发电效率10-15%(需90C以上)" />
      </LazyChartCard>

      {/* ── 利用方式详情表 ── */}
      <TechCard title="利用方式详情">
        <FilterableTechTable filterPlaceholder="搜索利用方式..." headers={['用途', '规模', '占比(%)', '说明', '效率']}
          rows={geothermalUtilization.map((u: GeothermalUtilization) => [u.use, u.scale, u.proportion, u.description, u.efficiency])}
        />
      </TechCard>

      {/* ── CCER碳减排潜力 + 典型模式 ── */}
      <div className="grid grid-cols-2 gap-4">
        <TechCard title="地热CCER碳减排潜力" badge="碳中和贡献">
          <div className="space-y-2">
            <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">供暖替代标煤：</span>年替代{geothermalResources.annualReplaceable}，按标煤CO2排放系数2.6t/t估算，年减排CO2约{co2Reduce}万吨。</p>
            <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">供暖潜力：</span>{geothermalResources.heatingPotential}，目前开发率约22.5%，仍有约1.5亿m²增长空间。</p>
            <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">CCER适用性：</span>地热供暖属可再生能源项目，符合CCER方法学要求。雄安新区地热供暖可作为CCER项目开发，预计年减排量10-15万吨CO2当量。</p>
            <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">高阳纺织CBAM协同：</span>地热替代燃煤可为高阳纺织产业集群提供清洁热源，降低碳足迹，间接助力CBAM合规。</p>
          </div>
        </TechCard>
        <TechCard title="地热开发利用典型模式" badge="应用案例">
          <div className="space-y-3">
            <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
              <p className="text-xs font-semibold text-gw-text">雄县模式：地热供暖无烟城</p>
              <p className="text-[10px] text-gw-muted mt-1">全国首例地热供暖全覆盖县城，42口地热井（22生产+20回灌），供暖面积600万m2，回灌率95%以上，实现取热不耗水可持续开发模式。</p>
              <p className="text-[10px] text-gw-highlight mt-1">COP 3.5~4.5（热泵辅助），年替代标煤12万吨</p>
            </div>
            <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
              <p className="text-xs font-semibold text-gw-text">平山模式：温泉旅游疗养</p>
              <p className="text-[10px] text-gw-muted mt-1">温塘镇温泉开发历史悠久，以断裂构造型热储为主，水温58~72C。已形成温泉度假、康复疗养、休闲旅游综合产业，年接待游客超50万人次。</p>
              <p className="text-[10px] text-gw-highlight mt-1">直接利用，尾水梯级利用</p>
            </div>
          </div>
        </TechCard>
      </div>
    </div>
  );
}
