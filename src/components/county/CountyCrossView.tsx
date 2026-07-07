import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ScatterChart, Scatter, ZAxis, ComposedChart, Line, Legend, type TooltipProps } from 'recharts';
import { MapPin, Layers, Droplets, Activity } from 'lucide-react';
import { StatCard, ChartTooltip, CHART_COLORS, ExportButton, ProgressBadge, DataSourceNote } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { ChartExport } from '../ChartExport';
import { TechCard } from '../UI';
import type { CitySummaryItem, CrossCityItem, CityDistributionItem, ScatterByCityItem, CityBulletinBrief } from '../../types/county';

const USE_COLORS = ['#f59e0b', '#ef4444', '#3b82f6', '#10b981'];
const CITY_COLORS: Record<string, string> = { '石家庄市': '#06b6d4', '邢台市': '#3b82f6', '沧州市': '#8b5cf6', '承德市': '#10b981', '保定市': '#f59e0b' };

interface Props {
  citiesWithCounties: CityBulletinBrief[];
  citySummary: CitySummaryItem[];
  crossCityAll: CrossCityItem[];
  cityDistribution: CityDistributionItem[];
  scatterByCity: ScatterByCityItem[];
  handleExportCross: () => void;
}

export function CountyCrossView({ citiesWithCounties, citySummary, crossCityAll, cityDistribution, scatterByCity, handleExportCross }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard title="覆盖城市" value={citiesWithCounties.length} unit="个" icon={MapPin} accent="blue" subtitle="含县级数据" />
        <StatCard title="区县总量" value={citiesWithCounties.reduce((s: number, b: CityBulletinBrief) => s + (b.counties?.length ?? 0), 0)} unit="个" icon={Layers} accent="cyan" />
        <StatCard title="总用水量" value={citySummary.reduce((s: number, c: CitySummaryItem) => s + c.totalUse, 0).toFixed(2)} unit="亿m³" icon={Droplets} accent="blue" subtitle="5市县级合计" />
        <StatCard title="地下水总量" value={citySummary.reduce((s: number, c: CitySummaryItem) => s + c.totalGw, 0).toFixed(2)} unit="亿m³" icon={Activity} accent="emerald"
          subtitle={`占比${(citySummary.reduce((s: number, c: CitySummaryItem) => s + c.totalGw, 0) / citySummary.reduce((s: number, c: CitySummaryItem) => s + c.totalUse, 0) * 100).toFixed(1)}%`} />
      </div>

      <div className="flex justify-end">
        <ExportButton onClick={handleExportCross} label="导出85县数据" />
      </div>

      <LazyChartCard title="各市县级用水总量对比" badge="按城市分组">
        <div className="mb-2 flex justify-end">
          <ChartExport data={citySummary} filename="各市县级用水总量对比" sheetName="各市用水" formats={['xlsx', 'csv', 'json']} label="导出数据" />
        </div>
        <ResponsiveContainer width="100%" height={380}>
          <BarChart data={citySummary} margin={{ top: 5, right: 20, left: 10, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="city" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <YAxis tick={{ fill: '#94a3b8' }} label={{ value: '亿m³', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
            <Tooltip content={<ChartTooltip title="各市用水总量" unit="亿m³" />} />
            <Legend />
            <Bar dataKey="totalAgri" name="农业" stackId="cs" fill={USE_COLORS[0]} />
            <Bar dataKey="totalIndustry" name="工业" stackId="cs" fill={USE_COLORS[1]} />
            <Bar dataKey="totalDomestic" name="生活" stackId="cs" fill={USE_COLORS[2]} />
            <Bar dataKey="totalEco" name="生态" stackId="cs" fill={USE_COLORS[3]} />
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="各市地下水用水占比" badge="地下水用水 / 总用水">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={citySummary.map((c: CitySummaryItem) => ({ name: c.city, 地下水占比: c.gwRatio, 区县数: c.countyCount }))} margin={{ top: 5, right: 20, left: 10, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="city" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis tick={{ fill: '#94a3b8' }} domain={[0, 100]} label={{ value: '%', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
              <Tooltip content={<ChartTooltip title="地下水占比" unit="%" />} />
              <Bar dataKey="地下水占比" radius={[4, 4, 0, 0]}>
                {citySummary.map((c: CitySummaryItem, i: number) => (<Cell key={i} fill={c.gwRatio > 70 ? '#ef4444' : c.gwRatio > 50 ? '#f59e0b' : '#10b981'} />))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <LazyChartCard title="各市农业用水占比" badge="农业用水 / 总用水">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={citySummary.map((c: CitySummaryItem) => ({ name: c.city, 农业占比: c.agriRatio }))} margin={{ top: 5, right: 20, left: 10, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="city" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis tick={{ fill: '#94a3b8' }} domain={[0, 100]} label={{ value: '%', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
              <Tooltip content={<ChartTooltip title="农业占比" unit="%" />} />
              <Bar dataKey="农业占比" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="全省85县用水量 vs 地下水依赖度" badge="气泡=城市分组">
          <ResponsiveContainer width="100%" height={520}>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" dataKey="x" name="总用水量" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '总用水量(亿m³)', fill: '#94a3b8', fontSize: 10 }} />
              <YAxis type="number" dataKey="y" name="地下水占比" tick={{ fill: '#94a3b8', fontSize: 10 }} domain={[0, 100]} label={{ value: '地下水占比(%)', fill: '#94a3b8', fontSize: 10, angle: -90, position: 'insideLeft' }} />
              <ZAxis type="number" dataKey="z" range={[40, 300]} />
              <Tooltip content={({ active, payload }: TooltipProps<number, string>) => {
                if (!active || !payload?.[0]) return null;
                const d = payload[0].payload as { county: string; cityName: string; x: number; y: number };
                return (<div className="bg-gw-card border border-gw-border rounded-lg p-3 text-xs shadow-xl">
                  <p className="font-bold text-gw-text">{d.county}（{d.cityName}）</p>
                  <p className="text-gw-muted">总用水: <span className="text-cyan-400">{d.x.toFixed(4)} 亿m³</span></p>
                  <p className="text-gw-muted">地下水占比: <span className="text-emerald-400">{d.y.toFixed(1)}%</span></p>
                </div>);
              }} />
              {scatterByCity.map((d: ScatterByCityItem) => (<Scatter key={d.city} name={d.city} data={d.data} fill={d.color} fillOpacity={0.7} />))}
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </ScatterChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <LazyChartCard title="各市县级农业用水占比分布" badge="Min-Max-Avg范围">
          <ResponsiveContainer width="100%" height={520}>
            <ComposedChart data={cityDistribution} margin={{ top: 5, right: 20, left: 50, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="city" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} domain={[0, 100]} label={{ value: '%', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
              <Tooltip content={({ active, payload }: TooltipProps<number, string>) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload as { name: string; countyCount: number; minAgri: number; maxAgri: number; avgAgri: number; minGw: number; maxGw: number; avgGw: number };
                return (<div className="bg-gw-card border border-gw-border rounded-lg p-3 text-xs shadow-xl">
                  <p className="font-bold text-gw-text">{d.name}（{d.countyCount}县）</p>
                  <p className="text-amber-400">农业占比: {d.minAgri}% ~ {d.maxAgri}% (均{d.avgAgri}%)</p>
                  <p className="text-cyan-400">地下水占比: {d.minGw}% ~ {d.maxGw}% (均{d.avgGw}%)</p>
                </div>);
              }} />
              <Legend />
              <Bar dataKey="minAgri" name="农业占比最小" fill="#fbbf24" fillOpacity={0.4} />
              <Bar dataKey="avgAgri" name="农业占比均值" fill="#f59e0b" />
              <Bar dataKey="maxAgri" name="农业占比最大" fill="#d97706" />
              <Line dataKey="avgGw" name="地下水占比均值" stroke="#06b6d4" strokeWidth={2} dot={{ r: 4, fill: '#06b6d4' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>

      <LazyChartCard title="各市县级平均降水量" badge="有数据的城市" height={320}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={cityDistribution.filter((d: CityDistributionItem) => d.avgPrecip > 0)} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="city" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <YAxis tick={{ fill: '#94a3b8' }} label={{ value: 'mm', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
            <Tooltip content={({ active, payload }: TooltipProps<number, string>) => {
              if (!active || !payload?.[0]) return null;
              const d = payload[0].payload as { city: string; avgPrecip: number; minPrecip: number; maxPrecip: number };
              return (<div className="bg-gw-card border border-gw-border rounded-lg p-3 text-xs shadow-xl">
                <p className="font-bold text-gw-text mb-1">{d.city}</p>
                <p className="text-gw-muted">县级平均: <span className="text-blue-400">{d.avgPrecip} mm</span></p>
                <p className="text-gw-muted">范围: <span className="text-gw-highlight">{d.minPrecip} ~ {d.maxPrecip} mm</span></p>
              </div>);
            }} />
            <Bar dataKey="avgPrecip" name="平均降水量(mm)" radius={[4, 4, 0, 0]}>
              {cityDistribution.filter((d: CityDistributionItem) => d.avgPrecip > 0).map((d: CityDistributionItem, i: number) => (<Cell key={i} fill={CITY_COLORS[d.city] || '#3b82f6'} fillOpacity={0.7} />))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <LazyChartCard title="全省县级用水总量排行" badge={`${crossCityAll.length}县`}>
        <div className="mb-2 flex justify-end">
          <ChartExport data={crossCityAll} filename="全省县级用水总量排行" sheetName="全省用水" formats={['xlsx', 'csv', 'json']} label="导出数据" />
        </div>
        <ResponsiveContainer width="100%" height={Math.max(500, crossCityAll.length * 26)}>
          <BarChart data={crossCityAll} layout="vertical" margin={{ top: 5, right: 20, left: 120, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '亿m³', position: 'insideBottom', fill: '#94a3b8' }} />
            <YAxis type="category" dataKey="county" tick={{ fill: '#94a3b8', fontSize: 8 }} width={115} />
            <Tooltip content={({ active, payload }: TooltipProps<number, string>) => {
              if (!active || !payload?.[0]) return null;
              const d = payload[0].payload as { county: string; city: string; totalUse: number; gwUse: number; gwRatio: number; agri: number; industry: number; domestic: number; eco: number };
              return (<div className="bg-gw-card border border-gw-border rounded-lg p-3 text-xs shadow-xl">
                <p className="font-bold text-gw-text">{d.county}（{d.city}）</p>
                <p className="text-gw-muted">总用水: <span className="text-cyan-400">{d.totalUse.toFixed(4)} 亿m³</span></p>
                <p className="text-gw-muted">地下水: <span className="text-emerald-400">{d.gwUse.toFixed(4)} 亿m³</span> ({d.gwRatio}%)</p>
                <p className="text-gw-muted">农业: {d.agri.toFixed(4)} | 工业: {d.industry.toFixed(4)} | 生活: {d.domestic.toFixed(4)} | 生态: {d.eco.toFixed(4)}</p>
              </div>);
            }} />
            <Bar dataKey="totalUse" name="总用水量" radius={[0, 4, 4, 0]}>
              {crossCityAll.map((c: CrossCityItem, i: number) => (<Cell key={i} fill={CITY_COLORS[c.city] || CHART_COLORS[i % CHART_COLORS.length]} />))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <TechCard title="全省县级用水明细" badge={`${crossCityAll.length}个区县`}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-gw-border/50">
              {[{ key: 'city', label: '所属市' }, { key: 'county', label: '区县' }, { key: 'precip', label: '降水(mm)' }, { key: 'totalUse', label: '总用水(亿m³)' }, { key: 'gwUse', label: '地下水(亿m³)' }, { key: 'gwRatio', label: '地下水占比' }, { key: 'agri', label: '农业(亿m³)' }, { key: 'industry', label: '工业(亿m³)' }, { key: 'domestic', label: '生活(亿m³)' }, { key: 'eco', label: '生态(亿m³)' }].map(col => (
                <th key={col.key} className="py-2 px-2 text-left text-gw-muted whitespace-nowrap">{col.label}</th>
              ))}
            </tr></thead>
            <tbody>
              {crossCityAll.map((c: CrossCityItem, _i: number) => (
                <tr key={`${c.city}-${c.county}`} className="border-b border-gw-border/20 hover:bg-gw-surface/30 transition-colors">
                  <td className="py-1.5 px-2"><span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: CITY_COLORS[c.city] || '#06b6d4' }} />{c.city.replace('市', '')}</span></td>
                  <td className="py-1.5 px-2 font-medium text-gw-text">{c.county}</td>
                  <td className="py-1.5 px-2 text-gw-highlight">{c.precip != null && c.precip > 0 ? c.precip.toFixed(1) : '-'}</td>
                  <td className="py-1.5 px-2 text-blue-400">{c.totalUse.toFixed(4)}</td>
                  <td className="py-1.5 px-2 text-cyan-400">{c.gwUse.toFixed(4)}</td>
                  <td className="py-1.5 px-2"><ProgressBadge value={c.gwRatio} max={100} size="sm" color={c.gwRatio > 80 ? '#ef4444' : c.gwRatio > 60 ? '#f59e0b' : '#10b981'} /></td>
                  <td className="py-1.5 px-2 text-amber-400">{c.agri.toFixed(4)}</td>
                  <td className="py-1.5 px-2 text-red-400">{c.industry.toFixed(4)}</td>
                  <td className="py-1.5 px-2 text-blue-400">{c.domestic.toFixed(4)}</td>
                  <td className="py-1.5 px-2 text-emerald-400">{c.eco.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>


      {/* 用水效率综合分析 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TechCard title="各市地下水依赖度排名" badge="地下水占比排序">
          <div className="space-y-2">
            {[...citySummary].sort((a: CitySummaryItem, b: CitySummaryItem) => b.gwRatio - a.gwRatio).map((c: CitySummaryItem, i: number) => (
              <div key={c.city} className="flex items-center gap-2 text-xs">
                <span className="w-5 text-center font-bold" style={{ color: c.gwRatio > 70 ? '#ef4444' : c.gwRatio > 50 ? '#f59e0b' : '#10b981' }}>{i + 1}</span>
                <span className="w-16 text-gw-text">{c.city.replace('市', '')}</span>
                <div className="flex-1 h-3 bg-gw-surface/50 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(c.gwRatio, 100)}%`, backgroundColor: c.gwRatio > 70 ? '#ef4444' : c.gwRatio > 50 ? '#f59e0b' : '#10b981' }} />
                </div>
                <span className="w-12 text-right font-mono" style={{ color: c.gwRatio > 70 ? '#ef4444' : c.gwRatio > 50 ? '#f59e0b' : '#10b981' }}>{c.gwRatio}%</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gw-muted mt-2">地下水占比&gt;70%为高依赖(红色)，50-70%为中等依赖(橙色)，&lt;50%为低依赖(绿色)</p>
        </TechCard>

        <TechCard title="各市用水结构合理性评估" badge="多元化指数">
          <div className="space-y-2">
            {[...citySummary].map((c: CitySummaryItem) => {
              const total = c.totalAgri + c.totalIndustry + c.totalDomestic + c.totalEco;
              const ratios = total > 0 ? [c.totalAgri / total, c.totalIndustry / total, c.totalDomestic / total, c.totalEco / total] : [0, 0, 0, 0];
              // Shannon diversity index (normalized to 0-100)
              const entropy = ratios.reduce((s: number, r: number) => s + (r > 0 ? -r * Math.log2(r) : 0), 0);
              const maxEntropy = Math.log2(4); // 4 categories
              const diversityIndex = maxEntropy > 0 ? Math.round((entropy / maxEntropy) * 100) : 0;
              const level = diversityIndex >= 60 ? { label: '均衡', color: '#10b981' } : diversityIndex >= 40 ? { label: '中等', color: '#f59e0b' } : { label: '单一', color: '#ef4444' };
              return (
                <div key={c.city} className="flex items-center gap-2 text-xs">
                  <span className="w-16 text-gw-text">{c.city.replace('市', '')}</span>
                  <div className="flex-1 h-3 bg-gw-surface/50 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${diversityIndex}%`, backgroundColor: level.color }} />
                  </div>
                  <span className="w-14 text-right font-mono" style={{ color: level.color }}>{diversityIndex}</span>
                  <span className="w-8 text-right text-gw-muted">{level.label}</span>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-gw-muted mt-2">Shannon多样性指数(归一化): &gt;=60均衡(绿), 40-60中等(橙), &lt;40单一(红). 农业占比过高会降低结构合理性</p>
        </TechCard>
      </div>

      <DataSourceNote source="2024年各市水资源公报（石家庄/邢台/沧州/承德/保定）" version="v3.5" />
    </div>
  );
}
