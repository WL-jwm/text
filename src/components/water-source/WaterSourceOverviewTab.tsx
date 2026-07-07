import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { storageStructureSummary } from '../../data/waterSource';
import { TechCard, TechTable, ChartTooltip, CHART_COLORS } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { ChartExport } from '../ChartExport';
import type { PieItem, BarItem, StorageStructureSummary } from '../../types/waterSource';

interface Props {
  summaryPie: PieItem[];
  structureBarData: BarItem[];
  sourceTypePie: PieItem[];
}

export function WaterSourceOverviewTab({ summaryPie, structureBarData, sourceTypePie }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="蓄水构造类型数量分布" className="scan-line" height={280}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={summaryPie} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="value" label={({ name, value }: { name: string; value: number }) => `${name} ${value}处`}>
                {summaryPie.map((e: PieItem, i: number) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip content={<ChartTooltip percentDigits={1} title="类型分布" />} />
            </PieChart>
          </ResponsiveContainer>
        </LazyChartCard>
        <LazyChartCard title="各类型蓄水构造数量对比" className="scan-line" height={280}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={structureBarData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} angle={-15} textAnchor="end" height={35} />
              <YAxis stroke="#64748b" fontSize={10} />
              <Tooltip content={<ChartTooltip percentDigits={1} title="类型分布" />} />
              <Bar dataKey="count" name="数量(处)" fill="#3b82f6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>

      <TechCard title="蓄水构造总览表">
        <div className="mb-3 flex justify-end">
          <ChartExport data={storageStructureSummary} filename="storage-structure-summary" sheetName="蓄水构造" formats={['xlsx','csv','json']} label="导出数据" />
        </div>
        <TechTable title={`${storageStructureSummary.length} 个类型`}
          headers={['类型', '数量', '面积(km²)', '代表']}
          rows={storageStructureSummary.map((s: StorageStructureSummary) => [s.type, String(s.count), s.totalArea, s.representative])}
          pageSize={10}
        />
      </TechCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="重要水源地类型分布" height={280}>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={sourceTypePie} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`} fontSize={10}>
                {sourceTypePie.map((_: PieItem, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<ChartTooltip unit="处" title="水源地类型" />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </LazyChartCard>
        <TechCard title="蓄水构造基本概念" badge="水文地质基础">
          <div className="space-y-2">
            <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">定义：</span>蓄水构造是指能够储存和运移地下水的地质构造单元，由含水层、隔水层和补给/排泄边界组成。</p>
            <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">分类原则：</span>按含水介质类型（孔隙/裂隙/岩溶）和地质构造条件（盆地/扇体/古河道等）综合分类。</p>
            <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">供水意义：</span>蓄水构造是集中供水水源地的地质基础。河北省已建重要水源地均分布在冲洪积扇、岩溶盆地等大型蓄水构造中。</p>
            <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">保护要求：</span>水源地保护区划定需基于蓄水构造边界条件。一级保护区为开采井周围一定范围，二级和准保护区需覆盖整个补给区。</p>
          </div>
        </TechCard>
      </div>
    </div>
  );
}
