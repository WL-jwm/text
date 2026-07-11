import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis } from 'recharts';
import { MapPin, Flame, Thermometer, Target, Zap } from 'lucide-react';
import { cityGeothermalPotential, reinjectionDataExtended, geothermalResourceByZone } from '../../data/geothermal';
import { TechCard, ChartTooltip, StatCard, DataSourceNote } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { ChartExport } from '../ChartExport';
import { FilterableTechTable } from '../FilterableTechTable';

const PRIORITY_COLORS: Record<string, string> = { '极高': '#ef4444', '高': '#f59e0b', '中高': '#eab308', '中': '#3b82f6', '中低': '#06b6d4', '低': '#64748b' };

export function GeothermalPotentialTab() {
  const highPriority = cityGeothermalPotential.filter(c => c.priority === '极高' || c.priority === '高').length;
  const _midPriority = cityGeothermalPotential.filter(c => c.priority === '中' || c.priority === '中高').length;

  // 供暖面积数据(提取数字)
  const heatingData = useMemo(() =>
    cityGeothermalPotential.map(c => {
      const m = c.heatingArea.match(/([\d.]+)/);
      return { name: c.city.replace(/（.*?）/, ''), '供暖潜力(万m2)': m ? parseFloat(m[1]) : 0, '优先级': c.priority };
    }).sort((a, b) => b['供暖潜力(万m2)'] - a['供暖潜力(万m2)']),
  []);

  // 优先级分级饼图
  const priorityPie = useMemo(() => {
    const m: Record<string, number> = {};
    cityGeothermalPotential.forEach(c => { const p = c.priority; m[p] = (m[p] || 0) + 1; });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, []);

  // 梯度-热流散点(数值近似)
  const gradientHeatFlowData = useMemo(() =>
    cityGeothermalPotential.map(c => {
      const gMin = c.gradient.split('~')[0]; const gVal = parseFloat(gMin) || 2.5;
      const hMin = c.heatFlow.split('~')[0]; const hVal = parseFloat(hMin) || 50;
      return { name: c.city.replace(/（.*?）/, ''), '梯度(C/100m)': gVal, '热流(mW/m2)': hVal, '优先级': c.priority };
    }),
  []);

  // 分区资源量柱状图(数值近似)
  const _zoneBar = useMemo(() =>
    geothermalResourceByZone.map(z => ({
      name: z.zone,
      '面积(km2)': z.area,
      '等级': z.grade === 'I类' ? 3 : z.grade === 'II类' ? 2 : 1,
    })),
  []);

  return (
    <div className="space-y-4">
      {/* ── 5格统计卡片 ── */}
      <div className="grid grid-cols-5 gap-3">
        <StatCard title="评价城市" value={cityGeothermalPotential.length} unit="市" icon={MapPin} subtitle="全省覆盖" accent="blue" />
        <StatCard title="高优先级" value={highPriority} unit="市" icon={Flame} subtitle="极高+高" accent="red" />
        <StatCard title="总供暖潜力" value="1.86" unit="亿m2" icon={Thermometer} subtitle="理论上限" accent="emerald" />
        <StatCard title="I类资源区" value={2} unit="个" icon={Target} subtitle="冀中+沧县" accent="amber" />
        <StatCard title="国家级示范" value="1" unit="处" icon={Zap} subtitle="雄安新区" accent="violet" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* ── 各市供暖潜力柱状图 ── */}
        <LazyChartCard title="各市供暖潜力排名" badge="万m2" height={280}>
          <div className="mb-2 flex justify-end">
            <ChartExport data={heatingData} filename="各市供暖潜力" sheetName="供暖潜力" formats={['xlsx', 'csv', 'json']} label="导出数据" />
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={heatingData} layout="vertical" margin={{ top: 5, right: 20, bottom: 20, left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis type="number" tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: '万m2', position: 'insideBottom', fill: '#8b9dc3' }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#8b9dc3', fontSize: 9 }} width={75} />
              <Tooltip content={<ChartTooltip unit="万m2" title="供暖潜力" />} />
              <Bar dataKey="供暖潜力(万m2)" name="供暖潜力" radius={[0, 4, 4, 0]}>
                {heatingData.map((entry, i: number) => <Cell key={i} fill={PRIORITY_COLORS[entry['优先级']] || '#64748b'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>

        {/* ── 优先级分级饼图 ── */}
        <LazyChartCard title="开发优先级分级" badge={cityGeothermalPotential.length + '市'} height={280}>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={priorityPie} cx="50%" cy="50%" innerRadius={45} outerRadius={80} dataKey="value" label={({ name, value }) => `${name} ${value}市`}>
                {priorityPie.map((entry, i: number) => <Cell key={i} fill={PRIORITY_COLORS[entry.name] || '#64748b'} />)}
              </Pie>
              <Tooltip content={<ChartTooltip title="优先级" />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>

      {/* ── 各市潜力评估详细表 ── */}
      <TechCard title="各市地热资源潜力评估" badge="潜力排序">
        <div className="mb-2 flex justify-end">
          <ChartExport data={cityGeothermalPotential} filename="各市地热潜力评估" sheetName="潜力评估" formats={['xlsx', 'csv', 'json']} label="导出数据" />
        </div>
        <FilterableTechTable
          headers={['城市/区域', '梯度(C/100m)', '热流(mW/m2)', '可采资源', '供暖面积', '开发规模', '优先级', '备注']}
          rows={cityGeothermalPotential.map(c => [c.city, c.gradient, c.heatFlow, c.recoverable, c.heatingArea, c.development, c.priority, c.note])}
          filterPlaceholder="搜索城市..."
        />
      </TechCard>

      {/* ── 分区统计 + 回灌扩展 ── */}
      <div className="grid grid-cols-2 gap-4">
        <TechCard title="地热资源量分区统计" badge="6区">
          <div className="mb-2 flex justify-end">
            <ChartExport data={geothermalResourceByZone} filename="分区资源统计" sheetName="分区资源" formats={['xlsx', 'csv', 'json']} label="导出数据" />
          </div>
          <FilterableTechTable
            headers={['分区', '面积(km2)', '储量', '可采量', '标煤当量', '供暖面积', '等级']}
            rows={geothermalResourceByZone.map(z => [z.zone, z.area, z.reserves, z.recoverable, z.equivalentCoal, z.heatingArea, z.grade])}
            filterPlaceholder="搜索分区..."
          />
        </TechCard>
        <TechCard title="回灌数据扩展" badge="5地热田">
          <FilterableTechTable
            headers={['地热田', '回灌率(%)', '总井', '生产/回灌', '水位变化', '起始年', '备注']}
            rows={reinjectionDataExtended.map(r => [r.field, r.reinjectionRate + '%', r.wells, r.production + '/' + r.reinjection, r.pressureChange, r.startYear, r.note])}
            filterPlaceholder="搜索地热田..."
          />
        </TechCard>
      </div>

      {/* ── 梯度-热流散点 + 开发建议 ── */}
      <div className="grid grid-cols-2 gap-4">
        <LazyChartCard title="梯度-热流关系散点" badge="mW/m2 vs C/100m" height={260}>
          <ResponsiveContainer width="100%" height={240}>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
              <XAxis dataKey="梯度(C/100m)" type="number" name="地温梯度" tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: 'C/100m', position: 'insideBottom', fill: '#8b9dc3' }} />
              <YAxis dataKey="热流(mW/m2)" type="number" name="大地热流" tick={{ fill: '#8b9dc3', fontSize: 10 }} label={{ value: 'mW/m2', angle: -90, position: 'insideLeft', fill: '#8b9dc3' }} />
              <ZAxis dataKey="供暖潜力(万m2)" range={[40, 200]} name="供暖潜力" />
              <Tooltip content={<ChartTooltip title="梯度-热流" />} cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={gradientHeatFlowData} fill="#8b5cf6" fillOpacity={0.7} />
            </ScatterChart>
          </ResponsiveContainer>
          <DataSourceNote source="气泡大小=供暖潜力；梯度与热流呈正相关，冀中坳陷异常高值" />
        </LazyChartCard>

        <TechCard title="开发建议">
          <div className="space-y-2">
            <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/15">
              <p className="text-xs font-semibold text-red-400">极高优先级：雄安新区</p>
              <p className="text-[10px] text-gw-muted mt-1">国家级地热示范区，梯度3.5-4.5 C/100m，供暖潜力5000万m2，建议CCER项目开发</p>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/15">
              <p className="text-xs font-semibold text-amber-400">高优先级：廊坊/沧州</p>
              <p className="text-[10px] text-gw-muted mt-1">牛驼镇凸起延伸区/沧县隆起区，供暖潜力3000+2500万m2，建议纳入清洁供暖规划</p>
            </div>
            <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/15">
              <p className="text-xs font-semibold text-blue-400">中优先级：邢台/邯郸/保定</p>
              <p className="text-[10px] text-gw-muted mt-1">临清坳陷/冀中坳陷南缘，供暖潜力1500-2000万m2/市，中等热流条件</p>
            </div>
          </div>
        </TechCard>
      </div>
    </div>
  );
}
