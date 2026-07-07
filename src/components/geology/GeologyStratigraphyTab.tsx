import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Layers, MapPin, Mountain, Droplets } from 'lucide-react';
import { stratigraphyAquifer, quaternaryStratigraphy } from '../../data/geology';
import { historicalStratigraphy } from '../../data/hydrogeologyHistorical';
import { TechCard, StatCard, ChartTooltip, CHART_COLORS } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { HydroProfile } from '../HydroProfile';
import { DataSourceNote } from '../UI';

export function GeologyStratigraphyTab() {
  const stratBarData = useMemo(() => stratigraphyAquifer.map(s => ({
    name: s.era,
    area: parseFloat(s.areaPercent) || 5,
  })), []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="地层时代" value="6" unit="个界" icon={Layers} accent="blue" />
        <StatCard title="第四系覆盖" value="47" unit="%" icon={MapPin} accent="cyan" />
        <StatCard title="碳酸盐岩" value="30" unit="%" icon={Mountain} accent="green" />
        <StatCard title="高产区占比" value="25" unit="%" icon={Droplets} accent="amber" />
      </div>

      <LazyChartCard title="各时代地层出露面积分布" className="scan-line" height={280}>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={stratBarData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
            <XAxis type="number" stroke="#64748b" fontSize={10} label={{ value: '%', position: 'insideBottom', fontSize: 10, fill: '#64748b' }} />
            <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={10} width={60} />
            <Tooltip content={<ChartTooltip unit="%" title="" />} />
            <Bar dataKey="area" name="面积占比(%)" fill="#3b82f6" radius={[0, 2, 2, 0]}>
              {stratBarData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <TechCard title="地层与含水介质关系总表">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gw-border">
              <th className="text-left text-gw-muted py-2 px-2 text-xs">地层界</th>
              <th className="text-gw-muted py-2 px-2 text-xs">地层系</th>
              <th className="text-gw-muted py-2 px-2 text-xs">厚度</th>
              <th className="text-gw-muted py-2 px-2 text-xs">含水介质</th>
              <th className="text-gw-muted py-2 px-2 text-xs">分布</th>
              <th className="text-gw-muted py-2 px-2 text-xs">占比</th>
              <th className="text-gw-muted py-2 px-2 text-xs">富水性</th>
              <th className="text-gw-muted py-2 px-2 text-xs">主要城市</th>
            </tr></thead>
            <tbody>
              {stratigraphyAquifer.map((s, i) => (
                <tr key={i} className="border-b border-gw-border/30 data-row">
                  <td className="py-2 px-2 text-xs font-medium text-gw-text">{s.era}</td>
                  <td className="py-2 px-2 text-xs">{s.period}</td>
                  <td className="py-2 px-2 font-mono text-xs text-gw-cyan">{s.thickness}</td>
                  <td className="py-2 px-2 text-xs">{s.aquiferType}</td>
                  <td className="py-2 px-2 text-xs">{s.distribution}</td>
                  <td className="py-2 px-2 font-mono text-xs">{s.areaPercent}</td>
                  <td className="py-2 px-2 text-xs">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${s.productivity === '高' ? 'bg-emerald-500/15 text-emerald-400' : s.productivity === '中' ? 'bg-amber-500/15 text-amber-400' : 'bg-red-500/15 text-red-400'}`}>{s.productivity}</span>
                  </td>
                  <td className="py-2 px-2 text-xs text-gw-muted">{s.mainCity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>

      <TechCard title="主要含水介质水文地质特征" badge="岩性">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <p className="text-xs font-semibold text-gw-text">孔隙水含水介质</p>
            <p className="text-[10px] text-gw-muted mt-1">第四系/新近系松散沉积物。砂砾石、中细砂、粉砂多层结构。水平分带性明显：山前冲洪积扇（粗粒、高渗透）→中部平原（中细砂、中等渗透）→滨海平原（粉砂、低渗透）。垂向上自上而下粒度变细、渗透性降低。</p>
            <p className="text-[10px] text-gw-highlight mt-1">富水性：高（平原区）</p>
          </div>
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <p className="text-xs font-semibold text-gw-text">岩溶水含水介质</p>
            <p className="text-[10px] text-gw-muted mt-1">寒武-奥陶系碳酸盐岩（石灰岩、白云岩）。岩溶发育受构造和地下水动力控制。太行山区以层间岩溶和暗河为主，燕山区以溶孔溶隙为主。蓟县系碳酸盐岩以溶隙型为主。岩溶发育深度一般150~400m。</p>
            <p className="text-[10px] text-gw-highlight mt-1">富水性：高（山区主要供水水源）</p>
          </div>
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <p className="text-xs font-semibold text-gw-text">裂隙水含水介质</p>
            <p className="text-[10px] text-gw-muted mt-1">变质岩、火成岩、碎屑岩风化-构造裂隙。风化带深度一般20~50m，构造裂隙带可达100m以上。裂隙率一般0.5~3%。泉水流量0.1~5L/s，大型断裂带泉流量可达10~50L/s。侏罗-白垩系砂岩裂隙水在蔚县盆地具供水意义。</p>
            <p className="text-[10px] text-gw-highlight mt-1">富水性：低-中（山区分散供水）</p>
          </div>
        </div>
      </TechCard>

      <TechCard title="第四系地层系统" badge="Q">
        <p className="text-[10px] text-gw-muted mb-3">{quaternaryStratigraphy.summary}</p>
        <div className="space-y-3">
          {(quaternaryStratigraphy as unknown as { units: { system: string; groups: { name: string; thickness: string; depth: string; lithology: string; typeSection: string }[] }[] }).units.map((unit: { system: string; groups: { name: string; thickness: string; depth: string; lithology: string; typeSection: string }[] }, i: number) => (
            <div key={i} className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
              <p className="text-xs font-semibold text-gw-text mb-2">{unit.system}</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="border-b border-gw-border">
                    <th className="px-2 py-1 text-left text-gw-muted font-medium">组</th>
                    <th className="px-2 py-1 text-left text-gw-muted font-medium">厚度</th>
                    <th className="px-2 py-1 text-left text-gw-muted font-medium">深度</th>
                    <th className="px-2 py-1 text-left text-gw-muted font-medium">岩性描述</th>
                    <th className="px-2 py-1 text-left text-gw-muted font-medium">标准剖面</th>
                  </tr></thead>
                  <tbody>
                    {unit.groups.map((g: { name: string; thickness: string; depth: string; lithology: string; typeSection: string }, j: number) => (
                      <tr key={j} className="border-b border-gw-border/20">
                        <td className="px-2 py-1 text-xs font-medium text-gw-text">{g.name}</td>
                        <td className="px-2 py-1 text-xs font-mono text-gw-cyan">{g.thickness}</td>
                        <td className="px-2 py-1 text-xs font-mono text-gw-highlight">{g.depth}</td>
                        <td className="px-2 py-1 text-xs text-gw-muted">{g.lithology}</td>
                        <td className="px-2 py-1 text-xs text-gw-muted/70">{g.typeSection}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </TechCard>

      <TechCard title="地层综合特征（含水层与岩性详表）" badge="详表">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gw-border">
              <th className="text-left text-gw-muted py-2 px-2 text-xs">界</th>
              <th className="text-left text-gw-muted py-2 px-2 text-xs">系</th>
              <th className="text-gw-muted py-2 px-2 text-xs">统</th>
              <th className="text-gw-muted py-2 px-2 text-xs">组</th>
              <th className="text-gw-muted py-2 px-2 text-xs">厚度</th>
              <th className="text-gw-muted py-2 px-2 text-xs">主要岩性</th>
              <th className="text-gw-muted py-2 px-2 text-xs">含水层特征</th>
            </tr></thead>
            <tbody>
              {historicalStratigraphy.map((s, i) => (
                <tr key={i} className="border-b border-gw-border/30 data-row">
                  <td className="py-1.5 px-2 text-xs font-medium text-gw-text">{s.era}</td>
                  <td className="py-1.5 px-2 text-xs">{s.system}</td>
                  <td className="py-1.5 px-2 text-xs">{s.series}</td>
                  <td className="py-1.5 px-2 text-xs">{s.group}</td>
                  <td className="py-1.5 px-2 font-mono text-xs text-gw-cyan">{s.thickness}</td>
                  <td className="py-1.5 px-2 text-xs">{s.mainLithology}</td>
                  <td className="py-1.5 px-2 text-xs text-gw-muted">{s.aquiferNote}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>

      <TechCard title="河北平原典型水文地质剖面" badge="SVG示意">
        <HydroProfile />
        <DataSourceNote source="基于第四系地层数据和含水层组概念模型绘制，深度0~600m，展示山前-中部-滨海三带结构" />
      </TechCard>
    </div>
  );
}
