import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,  Cell,  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart, Scatter, ReferenceLine,
} from 'recharts';
import { Activity, AlertTriangle, Check, Droplets, TrendingDown, Users } from 'lucide-react';
import { TechCard, ChartTooltip, StatCard, CHART_COLORS, DataSourceNote } from '../UI';
import { CrossLinkPanel } from '../CrossLink';
import { cityBulletin2024 } from '../../data/resources';
import type { CountyAnalysisData, CountyAnalysisItem, IrrigationEfficiencyItem, SelectableCountyItem, GwDepRankItem } from '../../types/county';

interface CountyAnalysisTabProps {
  gwDepRank: GwDepRankItem[];
  countyAnalysisData: CountyAnalysisData;
  irrigationEfficiency: IrrigationEfficiencyItem[];
  radarCompareData: Record<string, unknown>[];
  selectableCounties: SelectableCountyItem[];
  selectedCounties: Set<string>;
  toggleCountySelect: (name: string) => void;
  exportCountyData: () => void;
  activeKey: string | null;
  setActiveKey: (key: string | null) => void;
  highlight: (key: string | null) => void;
}

export function CountyAnalysisTab({  countyAnalysisData, irrigationEfficiency, radarCompareData, selectableCounties, selectedCounties, toggleCountySelect, exportCountyData, activeKey, setActiveKey}: CountyAnalysisTabProps) {
  return (
    <>
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <StatCard title="分析县区" value={countyAnalysisData.stats.total} unit="个" subtitle={`${countyAnalysisData.stats.cities}个市`} icon={Users} accent="blue" />
          <StatCard title="县级总用水" value={countyAnalysisData.stats.totalUse} unit="亿m³" subtitle="2024年" icon={Droplets} accent="cyan" />
          <StatCard title="平均地下水占比" value={countyAnalysisData.stats.avgGwRatio} unit="%" subtitle="县级口径" icon={Activity} accent="amber" />
          <StatCard title="地下水开采" value={countyAnalysisData.stats.totalGwUse} unit="亿m³" subtitle="5市县级合计" icon={TrendingDown} accent="red" />
          <StatCard title="最高依赖度" value={countyAnalysisData.gwDepRank[0]?.gwRatio || 0} unit="%" subtitle={countyAnalysisData.gwDepRank[0]?.name || ''} icon={AlertTriangle} accent="red" />
        </div>

        {/* 用水量Top20 */}
        <TechCard title="县级用水总量排名(Top20)" className="scan-line">
          <div className="flex justify-end mb-3">
            <button onClick={exportCountyData} className="text-[10px] text-gw-cyan/60 hover:text-gw-cyan flex items-center gap-1 transition-colors">
              导出全部县级数据 <span className="ml-1 opacity-60">&darr;</span>
            </button>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={countyAnalysisData.topByUse} layout="vertical" margin={{ left: 80 }}
              onClick={(data) => { if (data?.activePayload?.[0]) setActiveKey(data.activePayload[0].payload.name); }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} unit="亿m³" />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9 }} width={75} />
              <Tooltip content={<ChartTooltip title="县级用水总量" />} />
              <Bar dataKey="agri" name="农业" stackId="a" fill="#f59e0b" />
              <Bar dataKey="industry" name="工业" stackId="a" fill="#8b5cf6" />
              <Bar dataKey="domestic" name="生活" stackId="a" fill="#3b82f6" />
              <Bar dataKey="eco" name="生态" stackId="a" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </TechCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 地下水依赖度排名 */}
          <TechCard title="县级地下水依赖度排名" className="scan-line" badge={`${countyAnalysisData.gwDepRank.length}县`}>
            <div className="max-h-[400px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-gw-card">
                  <tr className="text-gw-muted border-b border-gw-border/30">
                    <th className="py-1.5 px-2 text-left">排名</th>
                    <th className="py-1.5 px-2 text-left">县区</th>
                    <th className="py-1.5 px-2 text-left">城市</th>
                    <th className="py-1.5 px-2 text-right">总用水(亿m³)</th>
                    <th className="py-1.5 px-2 text-right">地下水占比</th>
                    <th className="py-1.5 px-2 text-right">农业占比</th>
                  </tr>
                </thead>
                <tbody>
                  {countyAnalysisData.gwDepRank.slice(0, 30).map((c: CountyAnalysisItem, i: number) => (
                    <tr key={c.name} className={`border-b border-gw-border/10 hover:bg-gw-surface/30 ${
                      activeKey === c.name ? 'bg-gw-blue/10' : ''
                    }`} onClick={() => setActiveKey(c.name)}>
                      <td className="py-1.5 px-2 font-mono text-gw-muted">{i + 1}</td>
                      <td className="py-1.5 px-2 text-gw-text">{c.name}</td>
                      <td className="py-1.5 px-2 text-gw-muted">{c.city.replace('市', '')}</td>
                      <td className="py-1.5 px-2 text-right font-mono">{c.totalUse?.toFixed(4) || '--'}</td>
                      <td className="py-1.5 px-2 text-right">
                        <span className={`font-mono font-bold ${c.gwRatio >= 80 ? 'text-red-400' : c.gwRatio >= 60 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {c.gwRatio}%
                        </span>
                      </td>
                      <td className="py-1.5 px-2 text-right font-mono">{c.agriRatio != null ? c.agriRatio + '%' : '--'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TechCard>

          {/* 各市县级平均地下水占比 */}
          <TechCard title="各市县级平均地下水依赖度" className="scan-line">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={countyAnalysisData.cityGwAvg} margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} unit="%" />
                <Tooltip content={<ChartTooltip unit="%" title="各市县级平均" />} />
                <Bar dataKey="平均地下水占比" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 p-2 bg-gw-surface/50 rounded-lg">
              <p className="text-[10px] text-gw-muted">
                各市下辖县区地下水依赖度算术平均值。红圈({'>='}80%)为严重依赖地下水的城市，
                橙圈({'>='}60%)为较高依赖。治理重点应聚焦高依赖度城市的农业节水。
              </p>
            </div>
          </TechCard>
        </div>

        {/* 降水-用水关联散点 */}
        {countyAnalysisData.precipUseCorr.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TechCard title="降水量与地下水依赖度关联" className="scan-line" badge={`${countyAnalysisData.precipUseCorr.length}县`}>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={countyAnalysisData.precipUseCorr} margin={{ left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="降水" tick={{ fill: '#94a3b8', fontSize: 10 }} unit="mm" name="降水量" />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} unit="%" name="地下水占比" />
                  <Tooltip content={<ChartTooltip unit="%" title="降水-依赖度" />} />
                  <Scatter dataKey="地下水占比" fill="#3b82f6" />
                </ComposedChart>
              </ResponsiveContainer>
              <p className="text-[10px] text-gw-muted mt-2">
                降水量较少的县区往往地下水依赖度更高(山前平原农业区)，
                降水量丰富的山区县地下水依赖度普遍较低。
              </p>
            </TechCard>

            <TechCard title="农业用水占比排名(前15)" className="scan-line">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={countyAnalysisData.agriRank.slice(0, 15)} layout="vertical" margin={{ left: 70 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} unit="%" />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9 }} width={65} />
                  <Tooltip content={<ChartTooltip unit="%" title="农业用水占比" />} />
                  <Bar dataKey="agriRatio" name="农业占比" fill="#f59e0b" radius={[0, 4, 4, 0]}>
                    {countyAnalysisData.agriRank.slice(0, 15).map((entry: CountyAnalysisItem, index: number) => (
                      <Cell key={index} fill={entry.agriRatio >= 70 ? '#ef4444' : entry.agriRatio >= 50 ? '#f59e0b' : '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-[10px] text-gw-muted mt-2">
                农业用水占比是地下水超采治理的核心指标。
                红色({'>='}70%)为高农业用水县，需重点推进节水灌溉和种植结构调整。
              </p>
            </TechCard>
          </div>
        )}

        {/* 用水部门结构对比 */}
        <TechCard title="各县用水部门结构(前20)" className="scan-line">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={countyAnalysisData.topByUse} margin={{ left: 40, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 8 }} angle={-45} textAnchor="end" height={60} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} unit="亿m³" />
              <Tooltip content={<ChartTooltip title="用水部门结构" />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="agri" name="农业" fill="#f59e0b" stackId="s" />
              <Bar dataKey="industry" name="工业" fill="#8b5cf6" stackId="s" />
              <Bar dataKey="domestic" name="生活" fill="#3b82f6" stackId="s" />
              <Bar dataKey="eco" name="生态" fill="#10b981" stackId="s" />
            </BarChart>
          </ResponsiveContainer>
        </TechCard>

        {/* 县级多维雷达图对比 */}
        <TechCard title="县级多维对比(选择2-6个县区)" className="scan-line" badge={`${selectedCounties.size}/6`}>
          <div className="mb-3 p-2 bg-gw-surface/50 rounded-lg max-h-32 overflow-y-auto">
            <p className="text-[10px] text-gw-muted mb-1.5">点击选择县区进行雷达图对比:</p>
            <div className="flex flex-wrap gap-1">
              {selectableCounties.map(c => {
                const isSelected = selectedCounties.has(c.name);
                return (
                  <button key={c.name} onClick={() => toggleCountySelect(c.name)}
                    className={`px-1.5 py-0.5 rounded text-[9px] transition-all border ${
                      isSelected
                        ? 'bg-gw-blue/20 border-gw-blue/40 text-gw-highlight'
                        : 'border-gw-border/20 text-gw-muted hover:text-gw-text hover:border-gw-border/40'
                    }`}>
                    {c.name}
                    {isSelected && <Check size={8} className="inline ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>
          {radarCompareData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart data={radarCompareData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="dimension" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 8 }} />
                {Array.from(selectedCounties).map((name: string, i) => (
                  <Radar key={name} name={name} dataKey={name}
                    stroke={CHART_COLORS[i % CHART_COLORS.length]}
                    fill={CHART_COLORS[i % CHART_COLORS.length]}
                    fillOpacity={0.15} strokeWidth={2} />
                ))}
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Tooltip content={<ChartTooltip title="多维对比" />} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-40 text-gw-muted/50 text-xs">
              {selectedCounties.size < 2 ? '请至少选择2个县区' : selectedCounties.size > 6 ? '最多选择6个县区' : '加载中...'}
            </div>
          )}
        </TechCard>

        {/* 灌溉效率与降水关联 */}
        {irrigationEfficiency.length > 0 && (
          <TechCard title="灌溉需水强度排名" className="scan-line" badge={`${irrigationEfficiency.length}县`}>
            <p className="text-[10px] text-gw-muted mb-2">
              灌溉需水强度 = 农业用水量 / 年降水量，反映单位降水补给下的灌溉需求。
              高值县区需重点关注节水灌溉和种植结构调整。
            </p>
            <div className="max-h-[350px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-gw-card">
                  <tr className="text-gw-muted border-b border-gw-border/30">
                    <th className="py-1.5 px-2 text-left">排名</th>
                    <th className="py-1.5 px-2 text-left">县区</th>
                    <th className="py-1.5 px-2 text-left">城市</th>
                    <th className="py-1.5 px-2 text-right">降水(mm)</th>
                    <th className="py-1.5 px-2 text-right">农业用水(亿m³)</th>
                    <th className="py-1.5 px-2 text-right">农业占比</th>
                    <th className="py-1.5 px-2 text-right">灌溉强度</th>
                  </tr>
                </thead>
                <tbody>
                  {irrigationEfficiency.slice(0, 30).map((c: IrrigationEfficiencyItem, i: number) => (
                    <tr key={c.name} className="border-b border-gw-border/10 hover:bg-gw-surface/30">
                      <td className="py-1.5 px-2 font-mono text-gw-muted">{i + 1}</td>
                      <td className="py-1.5 px-2 text-gw-text">{c.name}</td>
                      <td className="py-1.5 px-2 text-gw-muted">{c.city}</td>
                      <td className="py-1.5 px-2 text-right font-mono">{c.precip}</td>
                      <td className="py-1.5 px-2 text-right font-mono">{c.agriUse.toFixed(4)}</td>
                      <td className="py-1.5 px-2 text-right">
                        <span className={`font-mono ${c.agriRatio >= 70 ? 'text-red-400' : c.agriRatio >= 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {c.agriRatio}%
                        </span>
                      </td>
                      <td className="py-1.5 px-2 text-right font-mono text-gw-cyan">{c.irrigPerMm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TechCard>
        )}

        {/* D-18: 县级用水总量 vs 地下水占比散点图 */}
        {countyAnalysisData.precipUseCorr.length > 0 && (
          <TechCard title="县级用水总量 vs 地下水占比" badge={`${countyAnalysisData.precipUseCorr.length}县`} className="scan-line">
            <div className="flex items-center gap-3 mb-2 text-[10px] text-gw-muted">
              <span>X轴: 总用水量(亿m³)</span>
              <span>Y轴: 地下水占比(%)</span>
              <span>颜色=城市</span>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={(() => {
                const cityColors: Record<string, string> = {
                  '石家庄': '#06b6d4', '唐山': '#3b82f6', '秦皇岛': '#8b5cf6',
                  '邯郸': '#ef4444', '邢台': '#f59e0b', '保定': '#10b981',
                  '张家口': '#64748b', '承德': '#22c55e', '沧州': '#a855f7',
                  '廊坊': '#eab308', '衡水': '#ec4899',
                };
                const allData: Array<{ name: string; totalUse: number; gwRatio: number; city: string; fill: string }> = [];
                (cityBulletin2024 as Array<{ city: string; counties?: Array<{ name: string; totalUse?: number; gwUse?: number }> }>).forEach(b => {
                  const shortCity = b.city.replace('市', '');
                  (b.counties || []).forEach(c => {
                    if ((c.totalUse ?? 0) > 0) {
                      allData.push({
                        name: c.name,
                        totalUse: c.totalUse ?? 0,
                        gwRatio: Math.round(((c.gwUse ?? 0) / (c.totalUse ?? 0)) * 100),
                        city: shortCity,
                        fill: cityColors[shortCity] || '#64748b',
                      });
                    }
                  });
                });
                return allData;
              })()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" dataKey="totalUse" tick={{ fill: '#94a3b8', fontSize: 10 }} unit="亿m³" name="总用水量" />
                <YAxis type="number" dataKey="gwRatio" tick={{ fill: '#94a3b8', fontSize: 10 }} unit="%" name="地下水占比" domain={[0, 100]} />
                <Tooltip content={<ChartTooltip title="用水总量 vs 地下水占比" />} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                {(() => {
                  const cityColors: Record<string, string> = {
                    '石家庄': '#06b6d4', '唐山': '#3b82f6', '秦皇岛': '#8b5cf6',
                    '邯郸': '#ef4444', '邢台': '#f59e0b', '保定': '#10b981',
                    '张家口': '#64748b', '承德': '#22c55e', '沧州': '#a855f7',
                    '廊坊': '#eab308', '衡水': '#ec4899',
                  };
                  const allData: Array<{ name: string; totalUse: number; gwRatio: number; city: string; fill: string }> = [];
                  (cityBulletin2024 as Array<{ city: string; counties?: Array<{ name: string; totalUse?: number; gwUse?: number }> }>).forEach(b => {
                    const shortCity = b.city.replace('市', '');
                    (b.counties || []).forEach(c => {
                      if ((c.totalUse ?? 0) > 0) {
                        allData.push({
                          name: c.name,
                          totalUse: c.totalUse ?? 0,
                          gwRatio: Math.round(((c.gwUse ?? 0) / (c.totalUse ?? 0)) * 100),
                          city: shortCity,
                          fill: cityColors[shortCity] || '#64748b',
                        });
                      }
                    });
                  });
                  const cities = [...new Set(allData.map(d => d.city))];
                  return cities.map(city => {
                    const cityData = allData.filter(d => d.city === city);
                    return <Scatter key={city} name={city} data={cityData} fill={cityColors[city] || '#64748b'} fillOpacity={0.7} />;
                  });
                })()}
                <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="5 3" strokeOpacity={0.3} />
                <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="5 3" strokeOpacity={0.3} />
              </ComposedChart>
            </ResponsiveContainer>
            <DataSourceNote source="各色点代表不同城市的县区 | 红线=70%高依赖 | 黄线=50%中依赖 | 左下角为低用水低依赖县区" />
          </TechCard>
        )}

        <CrossLinkPanel currentPath="/data-insight" />
      </div>
    </>
  );
}
