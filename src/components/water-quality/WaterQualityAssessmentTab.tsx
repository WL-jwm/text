import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie } from 'recharts';
import { shallowGroundwaterQuality2024, typicalPollutants, pollutantRegionalMatrix } from '../../data/waterQuality';
import { TechCard, ChartTooltip, StatCard, DataSourceNote } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { ChartExport } from '../ChartExport';
import { FilterableTechTable } from '../FilterableTechTable';


interface Props {
  shallowBarData: Record<string, unknown>[];
}

export function WaterQualityAssessmentTab({ shallowBarData }: Props) {
  // 各市III类及以上达标率排名
  const complianceData = useMemo(() =>
    [...shallowGroundwaterQuality2024]
      .map(d => ({
        city: d.region,
        'III类及以上(%)': Math.round(d.I + d.II + d.III),
        'IV+V类(%)': Math.round(d.IV + d.V),
        stations: d.stations,
      }))
      .sort((a, b) => b['III类及以上(%)'] - a['III类及以上(%)']),
  []);

  // 达标率分布饼图
  const compliancePie = useMemo(() => {
    const good = shallowGroundwaterQuality2024.filter(d => d.I + d.II + d.III >= 50).length;
    const medium = shallowGroundwaterQuality2024.filter(d => d.I + d.II + d.III >= 35 && d.I + d.II + d.III < 50).length;
    const poor = shallowGroundwaterQuality2024.filter(d => d.I + d.II + d.III < 35).length;
    return [
      { name: '达标较好(>=50%)', value: good, color: '#22c55e' },
      { name: '中等(35-50%)', value: medium, color: '#f59e0b' },
      { name: '较差(<35%)', value: poor, color: '#ef4444' },
    ];
  }, []);

  // 水质雷达图（取主要6市）
  const qualityRadar = useMemo(() => {
    const cities = ['承德', '张家口', '秦皇岛', '保定', '石家庄', '沧州'];
    return cities.map(city => {
      const d = shallowGroundwaterQuality2024.find(r => r.region === city)!;
      return {
        city,
        'I+II': Math.round(d.I + d.II),
        III: Math.round(d.III),
        IV: Math.round(d.IV),
        V: Math.round(d.V),
      };
    });
  }, []);

  // 统计
  const avgIIIPlus = Math.round(shallowGroundwaterQuality2024.reduce((s, d) => s + d.I + d.II + d.III, 0) / shallowGroundwaterQuality2024.length);
  const avgV = Math.round(shallowGroundwaterQuality2024.reduce((s, d) => s + d.V, 0) / shallowGroundwaterQuality2024.length);
  const bestCity = complianceData[0];
  const worstCity = complianceData[complianceData.length - 1];
  const totalStations = shallowGroundwaterQuality2024.reduce((s, d) => s + d.stations, 0);

  return (
    <div className="space-y-6">
      {/* 状态横幅 */}
      <div className="p-3 rounded-lg bg-gradient-to-r from-cyan-500/10 to-amber-500/10 border border-cyan-500/20">
        <div className="flex items-center gap-2">
          <span className="text-sm text-cyan-400 font-medium">2024年浅层地下水质量评价</span>
        </div>
        <p className="text-xs text-gw-muted mt-1">{shallowGroundwaterQuality2024.length}个市{totalStations}眼监测井，平均III类及以上{avgIIIPlus}%。承德最优({bestCity?.['III类及以上(%)']}%)，沧州最差({worstCity?.['III类及以上(%)']}%)。</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3">
        <StatCard title="监测城市" value={shallowGroundwaterQuality2024.length} unit="个" accent="blue" subtitle="覆盖全省" />
        <StatCard title="监测井数" value={totalStations} unit="眼" accent="cyan" subtitle="2024年度" />
        <StatCard title="平均III+" value={avgIIIPlus} unit="%" accent="emerald" subtitle="全省均值" />
        <StatCard title="平均V类" value={avgV} unit="%" accent="red" subtitle="需要改善" />
        <StatCard title="最优城市" value={bestCity?.['III类及以上(%)']} unit="%" accent="green" subtitle={bestCity?.city} />
      </div>

      {/* 堆叠柱状图 + 达标率排名 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="2024年浅层地下水质量评价(%)" height={340}>
          <div className="mb-2 flex justify-end">
            <ChartExport data={shallowBarData} filename="2024浅层地下水质量评价" sheetName="2024浅层地下水质量评价" formats={['xlsx', 'csv', 'json']} label="导出数据" />
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={shallowBarData} margin={{ top: 10, right: 20, bottom: 40, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis dataKey="region" tick={{ fill: '#8b9dc3', fontSize: 9 }} angle={-15} textAnchor="end" height={40} />
              <YAxis tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: '%', angle: -90, position: 'insideLeft', style: { fill: '#8b9dc3', fontSize: 10 } }} />
              <Tooltip content={<ChartTooltip unit="%" title="水质评价" />} />
              <Legend wrapperStyle={{ fontSize: 9 }} />
              <Bar dataKey="I+II" name="I+II类" stackId="a" fill="#22c55e" />
              <Bar dataKey="III" name="III类" stackId="a" fill="#eab308" />
              <Bar dataKey="IV" name="IV类" stackId="a" fill="#f97316" />
              <Bar dataKey="V" name="V类" stackId="a" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
          <DataSourceNote source="GB/T 14848-2017地下水质量标准评价。III类及以上为达标水质，可用于集中式饮用水源" />
        </LazyChartCard>

        <LazyChartCard title="各市III类及以上达标率排名" badge="2024" className="scan-line" height={340}>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={complianceData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis type="number" tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: '%', position: 'insideBottom', fill: '#8b9dc3' }} />
              <YAxis type="category" dataKey="city" tick={{ fill: '#8b9dc3', fontSize: 9 }} width={55} />
              <Tooltip content={<ChartTooltip unit="%" title="达标率" />} />
              <Bar dataKey="III类及以上(%)" name="III类及以上" radius={[0, 4, 4, 0]}>
                {complianceData.map((entry, i) => (
                  <Cell key={i} fill={entry['III类及以上(%)'] >= 70 ? '#22c55e' : entry['III类及以上(%)'] >= 50 ? '#3b82f6' : entry['III类及以上(%)'] >= 35 ? '#f59e0b' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <DataSourceNote source="达标率=I+II+III类占比。承德(87.0%)最优，沧州(23.8%)最差。颜色从绿到红反映达标水平" />
        </LazyChartCard>
      </div>

      {/* 达标率分类饼图 + 水质雷达 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="城市达标率分级分布" height={280}>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={compliancePie} cx="50%" cy="50%" innerRadius={35} outerRadius={65} dataKey="value" label={({ name, value }) => `${name}: ${value}市`}>
                {compliancePie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip content={<ChartTooltip title="达标分级" />} />
              <Legend wrapperStyle={{ fontSize: 9 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-3 text-[9px] text-gw-muted">
            <span>达标较好(&gt;=50%): {compliancePie[0]?.value}市</span>
            <span>中等(35-50%): {compliancePie[1]?.value}市</span>
            <span>较差(&lt;35%): {compliancePie[2]?.value}市</span>
          </div>
        </LazyChartCard>

        <LazyChartCard title="代表城市水质类别构成雷达" height={280}>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={qualityRadar} cx="50%" cy="50%" outerRadius="60%">
              <PolarGrid stroke="rgba(6,182,212,0.15)" />
              <PolarAngleAxis dataKey="city" tick={{ fill: '#8b9dc3', fontSize: 9 }} />
              <PolarRadiusAxis angle={30} domain={[0, 60]} tick={{ fill: '#64748b', fontSize: 8 }} />
              <Radar name="I+II类" dataKey="I+II" stroke="#22c55e" fill="#22c55e" fillOpacity={0.15} />
              <Radar name="III类" dataKey="III" stroke="#eab308" fill="#eab308" fillOpacity={0.15} />
              <Radar name="IV类" dataKey="IV" stroke="#f97316" fill="#f97316" fillOpacity={0.15} />
              <Radar name="V类" dataKey="V" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} />
              <Legend wrapperStyle={{ fontSize: 8 }} />
            </RadarChart>
          </ResponsiveContainer>
          <DataSourceNote source="从承德(最优)到沧州(最差)的6个代表城市。承德V类仅3.5%，沧州V类达37.7%" />
        </LazyChartCard>
      </div>

      {/* 评价明细表 */}
      <TechCard title="各市浅层水质评价明细(2024)">
        <FilterableTechTable
          headers={['地区', '监测站', 'I+II(%)', 'III(%)', 'IV(%)', 'V(%)', '达标率(%)', '主要污染物']}
          rows={shallowGroundwaterQuality2024.map(d => [
            d.region, String(d.stations),
            (d.I + d.II).toFixed(1), d.III.toFixed(1), d.IV.toFixed(1), d.V.toFixed(1),
            (d.I + d.II + d.III).toFixed(1),
            d.mainPollutants,
          ])}
          filterPlaceholder="搜索..."
        />
      </TechCard>

      {/* 典型污染物 */}
      {typicalPollutants && (
        <TechCard title="典型污染物分布特征" badge={`${typicalPollutants.length}项`}>
          <div className="space-y-3">
            {typicalPollutants.map((p: typeof typicalPollutants[number], i: number) => (
              <div key={i} className="p-3 rounded-lg bg-gw-surface/40 border border-gw-border/20">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm text-gw-text font-medium">{p.pollutant}</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/15 text-red-400 border border-red-500/20">超标率 {p.exceedance}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gw-muted">
                  <p>标准限值: <span className="text-gw-text">{p.standardLimit}</span></p>
                  <p>健康影响: <span className="text-amber-400">{p.healthEffect}</span></p>
                  <p className="col-span-2">分布: {p.background}</p>
                  <p className="col-span-2">治理: <span className="text-cyan-400">{p.remediation}</span></p>
                </div>
              </div>
            ))}
          </div>
        </TechCard>
      )}

      {/* 污染因子区域矩阵 */}
      {pollutantRegionalMatrix && (
        <TechCard title="污染因子区域分布矩阵">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gw-border">
                  <th className="text-left py-2 px-3 text-gw-muted">区域</th>
                  <th className="text-left py-2 px-3 text-gw-muted">覆盖地区</th>
                  <th className="text-center py-2 px-2 text-gw-muted">氟化物</th>
                  <th className="text-center py-2 px-2 text-gw-muted">总硬度</th>
                  <th className="text-center py-2 px-2 text-gw-muted">硝酸盐</th>
                  <th className="text-center py-2 px-2 text-gw-muted">铁锰</th>
                  <th className="text-center py-2 px-2 text-gw-muted">氨氮</th>
                  <th className="text-center py-2 px-2 text-gw-muted">TDS</th>
                </tr>
              </thead>
              <tbody>
                {pollutantRegionalMatrix.map((r: typeof pollutantRegionalMatrix[number], i: number) => {
                  const levelColor: Record<string, string> = { '高': 'text-red-400', '中高': 'text-orange-400', '中': 'text-amber-400', '中低': 'text-blue-400', '低': 'text-emerald-400' };
                  return (
                    <tr key={i} className="border-b border-gw-border/20 data-row">
                      <td className="py-2 px-3 text-gw-text font-medium">{r.region}</td>
                      <td className="py-2 px-3 text-gw-muted">{r.area}</td>
                      {[r.fluoride, r.hardness, r.nitrate, r.ironManganese, r.ammoniaNitrogen, r.tds].map((v: string, j: number) => (
                        <td key={j} className={`py-2 px-2 text-center font-medium ${levelColor[v] || ''}`}>{v}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TechCard>
      )}
    </div>
  );
}
