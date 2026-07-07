import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ScatterChart, Scatter, Cell, ZAxis, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Database, Layers, MapPin } from 'lucide-react';
import { resistivitySalinityRelation, lithologyResistivity, plainResistivityZones } from '../../data/hydrogeologyHistorical';
import { StatCard, TechCard, ChartTooltip, DataSourceNote, CHART_COLORS } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { FilterableTechTable } from '../FilterableTechTable';
import { ChartExport } from '../ChartExport';

// 岩性电阻率中值提取
function parseResistivityMid(range: string): number {
  const parts = range.replace(/[~>＜]/g, '-').split('-').map(Number);
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) return (parts[0] + parts[1]) / 2;
  return parts[0] || 0;
}

const ZONE_COLORS = ['#22c55e', '#3b82f6', '#f59e0b'];
const ZONE_LABELS = ['山前', '中部', '滨海'];

export function HydrochemResistivityTab() {
  // 矿化度-电阻率关系散点数据
  const salinityScatter = useMemo(() =>
    resistivitySalinityRelation.map((r,_i) => {
      const salMid = parseResistivityMid(r.salinityRange);
      const resMid = parseResistivityMid(r.resistivityRange);
      return {
        x: resMid,
        y: salMid,
        z: salMid * 20,
        name: r.waterType,
        resistivity: r.resistivityRange,
        salinity: r.salinityRange,
      };
    }),
  []);

  // 岩性电阻率柱状图（中值排序）
  const lithologyData = useMemo(() =>
    [...lithologyResistivity]
      .map(l => ({ name: l.lithology, 电阻率中值: parseResistivityMid(l.resistivity), note: l.note, range: l.resistivity }))
      .sort((a, b) => b['电阻率中值'] - a['电阻率中值']),
  []);

  // 分区雷达图（归一化到0-100）
  const zoneRadarData = useMemo(() => {
    const lithologies = ['砂层', '亚砂土', '亚粘土', '粘土'];
    const maxVals = [120, 30, 24, 16]; // 各岩性最大值
    return lithologies.map((lit, i) => ({
      lithology: lit,
      ...Object.fromEntries(plainResistivityZones.map((z, zi) => {
        const vals = [z.sand, z.siltySand, z.siltyClay, z.clay];
        const mid = parseResistivityMid(vals[i]);
        return [ZONE_LABELS[zi], Math.round(mid / maxVals[i] * 100)];
      })),
    }));
  }, []);

  return (
    <div className="space-y-6">
      {/* 统计横幅 */}
      <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-blue-400" />
          <span className="text-sm text-blue-400 font-medium">视电阻率物探参数库</span>
        </div>
        <p className="text-xs text-gw-muted mt-1">涵盖{resistivitySalinityRelation.length}级矿化度分级、{lithologyResistivity.length}种岩性参数、{plainResistivityZones.length}个水文分区电阻率特征。用于物探解译与水质判别。</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3">
        <StatCard title="矿化度分级" value={resistivitySalinityRelation.length} unit="级" accent="blue" subtitle="淡水~高咸水" />
        <StatCard title="岩性类型" value={lithologyResistivity.length} unit="种" accent="cyan" subtitle="覆盖第四纪松散层" />
        <StatCard title="水文分区" value={plainResistivityZones.length} unit="个" accent="green" subtitle="山前/中部/滨海" />
        <StatCard title="淡/咸分界" value="14~20" unit="Omega·m" accent="amber" subtitle="临界电阻率" />
        <StatCard title="最高电阻率" value="2000" unit="Omega·m" accent="emerald" subtitle="新鲜花岗岩" />
      </div>

      {/* 矿化度-电阻率关系 + 岩性电阻率排名 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="矿化度与视电阻率关系" badge="散点图" className="scan-line" height={320}>
          <div className="flex items-center gap-3 mb-2 text-[9px] text-gw-muted">
            <span>X轴=电阻率，Y轴=矿化度</span>
            <span className="text-amber-400">气泡大小=矿化度</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis dataKey="x" type="number" tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: '电阻率(Ω·m)', position: 'insideBottom', fill: '#8b9dc3' }} />
              <YAxis dataKey="y" type="number" tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: '矿化度(g/L)', angle: -90, position: 'insideLeft', fill: '#8b9dc3' }} />
              <ZAxis dataKey="z" range={[40, 200]} />
              <Tooltip content={<ChartTooltip title="矿化度-电阻率" />} />
              <Scatter data={salinityScatter} fill="#3b82f6">
                {salinityScatter.map((entry, i) => (
                  <Cell key={i} fill={['#22c55e', '#06b6d4', '#f59e0b', '#f97316', '#ef4444'][i]} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <DataSourceNote source="矿化度与视电阻率呈负指数关系。淡水(>20Ω·m)至高咸水(<8Ω·m)的电阻率判别标准" />
        </LazyChartCard>

        <LazyChartCard title="岩性电阻率中值排名" badge="Ω·m" className="scan-line" height={320}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={lithologyData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 90 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis type="number" tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: 'Ω·m', position: 'insideBottom', fill: '#8b9dc3' }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#8b9dc3', fontSize: 10 }} width={80} />
              <Tooltip content={<ChartTooltip title="岩性电阻率" />} />
              <Bar dataKey="电阻率中值" name="电阻率中值(Ω·m)" radius={[0, 4, 4, 0]}>
                {lithologyData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <DataSourceNote source="第四纪松散层及基岩电阻率典型值（钓鱼台水库等实测数据）。风化程度对花岗岩类影响显著" />
        </LazyChartCard>
      </div>

      {/* 分区雷达图 + 分区对比柱状图 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="平原分区电阻率特征雷达图" badge="归一化" className="scan-line" height={300}>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={zoneRadarData} cx="50%" cy="50%" outerRadius="65%">
              <PolarGrid stroke="rgba(6,182,212,0.15)" />
              <PolarAngleAxis dataKey="lithology" tick={{ fill: '#8b9dc3', fontSize: 9 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 8 }} />
              <Radar name="山前平原" dataKey="山前" stroke="#22c55e" fill="#22c55e" fillOpacity={0.15} strokeWidth={2} />
              <Radar name="中部平原" dataKey="中部" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
              <Radar name="滨海平原" dataKey="滨海" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} strokeWidth={2} />
              <Legend wrapperStyle={{ fontSize: 9 }} />
            </RadarChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <LazyChartCard title="分区各岩性电阻率范围" badge="Ω·m" className="scan-line" height={300}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={plainResistivityZones.flatMap((z, zi) =>
              ['砂层', '亚砂土', '亚粘土', '粘土'].map((lit, li) => {
                const vals = [z.sand, z.siltySand, z.siltyClay, z.clay];
                return { name: `${ZONE_LABELS[zi]}-${lit}`, mid: parseResistivityMid(vals[li]), zone: z.hydroZone };
              })
            )} margin={{ top: 5, right: 10, bottom: 40, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis dataKey="name" tick={{ fill: '#8b9dc3', fontSize: 8 }} angle={-25} textAnchor="end" height={50} />
              <YAxis tick={{ fill: '#8b9dc3', fontSize: 9 }} label={{ value: 'Ω·m', angle: -90, position: 'insideLeft', fill: '#8b9dc3' }} />
              <Tooltip content={<ChartTooltip title="分区电阻率" />} />
              <Bar dataKey="mid" name="电阻率中值" radius={[3, 3, 0, 0]}>
                {plainResistivityZones.flatMap((_, zi) =>
                  Array(4).fill(0).map((_, li) => <Cell key={`${zi}-${li}`} fill={ZONE_COLORS[zi]} />)
                )}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>

      {/* 综合表 + 岩性表 + 分区表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TechCard title="视电阻率与矿化度分级关系" icon={Database}>
          <div className="mb-3 flex justify-end">
            <ChartExport data={resistivitySalinityRelation} filename="resistivity-salinity" sheetName="电阻率矿化度" formats={['xlsx', 'csv', 'json']} label="导出数据" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-gw-border">
                <th className="px-2 py-1.5 text-left text-gw-muted font-medium">视电阻率(Ω·m)</th>
                <th className="px-2 py-1.5 text-left text-gw-muted font-medium">矿化度(g/L)</th>
                <th className="px-2 py-1.5 text-left text-gw-muted font-medium">水质类型</th>
              </tr></thead>
              <tbody>
                {resistivitySalinityRelation.map((r, i) => (
                  <tr key={i} className={`border-b border-gw-border/50 hover:bg-gw-surface/50 ${
                    r.waterType.includes('淡') ? 'bg-emerald-500/5' :
                    r.waterType.includes('微') ? 'bg-cyan-500/5' :
                    r.waterType.includes('半') ? 'bg-amber-500/5' :
                    'bg-red-500/5'
                  }`}>
                    <td className="px-2 py-1 font-mono text-gw-highlight">{r.resistivityRange}</td>
                    <td className="px-2 py-1 font-mono text-gw-highlight">{r.salinityRange}</td>
                    <td className="px-2 py-1">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        r.waterType.includes('淡') ? 'bg-emerald-500/20 text-emerald-400' :
                        r.waterType.includes('微') ? 'bg-cyan-500/20 text-cyan-400' :
                        r.waterType.includes('半') ? 'bg-amber-500/20 text-amber-400' :
                        r.waterType.includes('咸') && !r.waterType.includes('高') ? 'bg-orange-500/20 text-orange-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>{r.waterType}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TechCard>

        <TechCard title="岩性电阻率参数" icon={Layers}>
          <div className="mb-3 flex justify-end">
            <ChartExport data={lithologyData} filename="lithology-resistivity" sheetName="岩性电阻率" formats={['xlsx', 'csv', 'json']} label="导出数据" />
          </div>
          <FilterableTechTable
            headers={['岩性', '电阻率(Ω·m)', '中值(Ω·m)']}
            rows={lithologyData.map(l => [l.name, l.range, String(l['电阻率中值'])])}
            pageSize={8}
          />
        </TechCard>
      </div>

      <TechCard title="河北平原油性电阻率分区" icon={MapPin}>
        <div className="mb-3 flex justify-end">
          <ChartExport data={plainResistivityZones} filename="plain-resistivity-zones" sheetName="电阻率分区" formats={['xlsx', 'csv', 'json']} label="导出数据" />
        </div>
        <FilterableTechTable
          headers={['水文分区', '砂层(Ω·m)', '亚砂土(Ω·m)', '亚粘土(Ω·m)', '粘土(Ω·m)']}
          rows={plainResistivityZones.map(z => [z.hydroZone, z.sand, z.siltySand, z.siltyClay, z.clay])}
          pageSize={5}
        />
        <div className="mt-3 p-3 rounded-lg bg-gw-surface/50 border border-gw-border/30">
          <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">应用说明：</span>视电阻率物探成果用于划分咸淡水界面(&gt;14~20Ω·m为淡水)、识别含水层岩性、圈定高矿化水体分布。从山前到滨海，同种岩性电阻率呈降低趋势，与矿化度升高一致。</p>
        </div>
      </TechCard>
    </div>
  );
}
