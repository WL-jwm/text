import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Flame, Droplets, Activity, Zap, ShieldAlert } from 'lucide-react';
import { geothermalFluidChemistry } from '../../data/geothermal';
import { TechCard, ChartTooltip, StatCard, DataSourceNote } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { ChartExport } from '../ChartExport';
import { FilterableTechTable } from '../FilterableTechTable';

const CHEM_COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#06b6d4'];

export function GeothermalChemistryTab() {
  const avgTDS = useMemo(() => {
    const vals = geothermalFluidChemistry.map(c => { const m = c.TDS.match(/(\d+)/); return m ? parseInt(m[1]) : 0; });
    return Math.round(vals.reduce((a, b) => a + b) / vals.length);
  }, []);

  const avgF = useMemo(() => {
    const vals = geothermalFluidChemistry.map(c => { const m = c.F.match(/(\d+)/); return m ? parseInt(m[1]) : 0; });
    return (vals.reduce((a, b) => a + b) / vals.length).toFixed(1);
  }, []);

  const highFCount = useMemo(() => geothermalFluidChemistry.filter(c => { const m = c.F.match(/(\d+)/); return m && parseInt(m[1]) > 4; }).length, []);
  const scalingRisk = useMemo(() => geothermalFluidChemistry.filter(c => c.scaling.includes('严重')).length, []);

  // TDS-温度(中值)散点
  const _tdsTempData = useMemo(() =>
    geothermalFluidChemistry.map(c => {
      const tds = c.TDS.match(/(\d+)/); const tdsVal = tds ? parseInt(tds[1]) : 500;
      return { name: c.field.replace('地热田', ''), 'TDS(mg/L)': tdsVal, '氟含量(mg/L)': parseInt(c.F.match(/(\d+)/)?.[1] || '2'), 'pH(中值)': parseInt(c.pH.split('~')[0]) };
    }),
  []);

  // 氟含量排名
  const fRankData = useMemo(() =>
    [...geothermalFluidChemistry]
      .map(c => ({ name: c.field.replace('地热田', ''), '氟(mg/L)': parseInt(c.F.match(/(\d+)/)?.[1] || '2') }))
      .sort((a, b) => b['氟(mg/L)'] - a['氟(mg/L)']),
  []);

  // 水化学类型分布
  const waterTypePie = useMemo(() => {
    const typeMap: Record<string, number> = {};
    geothermalFluidChemistry.forEach(c => {
      const t = c.waterType.split('-')[0];
      typeMap[t] = (typeMap[t] || 0) + 1;
    });
    return Object.entries(typeMap).map(([name, value],_i) => ({ name, value }));
  }, []);

  // 结垢/腐蚀风险矩阵
  const riskMatrix = useMemo(() =>
    geothermalFluidChemistry.map(c => ({
      name: c.field.replace('地热田', ''),
      '结垢风险': c.scaling.includes('严重') ? '高' : c.scaling.includes('中等') ? '中' : '低',
      '腐蚀风险': c.corrosion.includes('中等') ? '中' : '低',
      '水质评价': c.note,
    })),
  []);

  return (
    <div className="space-y-4">
      {/* ── 5格统计卡片 ── */}
      <div className="grid grid-cols-5 gap-3">
        <StatCard title="地热田数" value={geothermalFluidChemistry.length} unit="处" icon={Flame} subtitle="全部已评价" accent="red" />
        <StatCard title="平均TDS" value={avgTDS} unit="mg/L" icon={Droplets} subtitle="矿化度中等" accent="blue" />
        <StatCard title="平均氟含量" value={avgF} unit="mg/L" icon={Zap} subtitle="部分超标需脱氟" accent="amber" />
        <StatCard title="高氟地热田" value={highFCount} unit="处" icon={ShieldAlert} subtitle="F&gt;4mg/L" accent="orange" />
        <StatCard title="严重结垢" value={scalingRisk} unit="处" icon={Activity} subtitle="需预处理" accent="red" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* ── 氟含量排名柱状图 ── */}
        <LazyChartCard title="各地热田氟含量排名" badge="mg/L" height={260}>
          <div className="mb-2 flex justify-end">
            <ChartExport data={fRankData} filename="地热田氟含量排名" sheetName="氟含量" formats={['xlsx', 'csv', 'json']} label="导出数据" />
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={fRankData} margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis dataKey="name" tick={{ fill: '#8b9dc3', fontSize: 9 }} angle={-15} textAnchor="end" height={40} />
              <YAxis tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: 'mg/L', angle: -90, position: 'insideLeft', fill: '#8b9dc3' }} />
              <Tooltip content={<ChartTooltip unit="mg/L" title="氟含量" />} />
              <Bar dataKey="氟(mg/L)" name="氟含量" radius={[4, 4, 0, 0]}>
                {fRankData.map((entry: any, i: number) => (
                  <Cell key={i} fill={entry['氟(mg/L)'] > 6 ? '#ef4444' : entry['氟(mg/L)'] > 4 ? '#f59e0b' : '#22c55e'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>

        {/* ── 水化学类型分布饼图 ── */}
        <LazyChartCard title="水化学类型分布" badge="主要类型" height={260}>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={waterTypePie} cx="50%" cy="50%" innerRadius={45} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {waterTypePie.map((e: any, i: number) => <Cell key={i} fill={CHEM_COLORS[i % CHEM_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<ChartTooltip title="水化学类型" />} />
            </PieChart>
          </ResponsiveContainer>
          <DataSourceNote source="Cl-Na型与HCO3-Na型为主，反映深层热储溶滤特征" />
        </LazyChartCard>
      </div>

      {/* ── 化学特征详细表 ── */}
      <TechCard title="地热流体化学特征详细">
        <div className="mb-2 flex justify-end">
          <ChartExport data={geothermalFluidChemistry} filename="地热流体化学特征" sheetName="化学特征" formats={['xlsx', 'csv', 'json']} label="导出数据" />
        </div>
        <FilterableTechTable
          headers={['地热田', '水化学类型', 'TDS(mg/L)', 'pH', 'F(mg/L)', 'SiO2(mg/L)', 'H2S(mg/L)', '结垢', '腐蚀', '备注']}
          rows={geothermalFluidChemistry.map(c => [c.field, c.waterType, c.TDS, c.pH, c.F, c.SiO2, c.H2S, c.scaling, c.corrosion, c.note])}
          filterPlaceholder="搜索地热田..."
        />
      </TechCard>

      {/* ── 结垢/腐蚀风险矩阵 ── */}
      <div className="grid grid-cols-2 gap-4">
        <TechCard title="结垢/腐蚀风险矩阵" badge="预处理建议">
          <FilterableTechTable
            headers={['地热田', '结垢风险', '腐蚀风险', '水质评价']}
            rows={riskMatrix.map(r => [r.name, r['结垢风险'], r['腐蚀风险'], r['水质评价']])}
          />
        </TechCard>
        <TechCard title="地热流体化学知识">
          <div className="space-y-2">
            <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">地热流体特征：</span>河北省地热田以中低温热水为主，矿化度500~3500mg/L，水化学类型以Cl-Na型和HCO3-Na型为主，反映深层碳酸盐岩热储的溶滤作用。</p>
            <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">氟超标问题：</span>多数地热田氟含量1~12mg/L，超过饮用水标准(1.0mg/L)和灌溉水标准(2.0mg/L)。雄县/牛驼镇需脱氟处理后排放。</p>
            <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">结垢防治：</span>牛驼镇地热田SO4含量高，中等-严重结垢。常用防治方法：加阻垢剂、调节pH、定期酸洗。</p>
          </div>
        </TechCard>
      </div>
    </div>
  );
}
