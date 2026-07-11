import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ComposedChart, Line, Legend } from 'recharts';
import { Gauge, ArrowRight, Compass } from 'lucide-react';
import { karstSystemZones, karstExploitation } from '../../data/karstWater';
import { TechCard, ChartTooltip, ExportButton } from '../UI';
import { TechTable } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { ChartExport } from '../ChartExport';

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tBarData: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  exploitationBarData: any[];
  handleExportZones: () => void;
}

export function KarstSystemTab({ tBarData, exploitationBarData, handleExportZones }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="导水系数对比" icon={Gauge} height={280}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={tBarData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--gw-border, #1a2d4d)" />
              <XAxis type="number" tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 10 }} />
              <YAxis dataKey="name" type="category" tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 10 }} width={80} />
              <ChartTooltip unit="m²/d" />
              <Bar dataKey="T_max" fill="var(--gw-cyan, #06b6d4)" name="T_max" radius={[0, 4, 4, 0]} />
              <Bar dataKey="T_min" fill="var(--gw-blue, #3b82f6)" name="T_min" radius={[0, 4, 4, 0]} />
              <Legend wrapperStyle={{ fontSize: 10, color: 'var(--gw-muted, #64748b)' }} />
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <LazyChartCard title="补给系数与降雨量" icon={ArrowRight} height={280}>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={karstSystemZones.map(z => ({
              name: z.zone,
              补给系数: parseFloat(String(z.rechargeCoeff).split('~').pop() || '0') * 100,
              降雨量mm: parseFloat(String(z.rainfall).split('~').pop() || '0'),
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--gw-border, #1a2d4d)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 10 }} />
              <YAxis yAxisId="left" tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 10 }} />
              <ChartTooltip />
              <Bar yAxisId="left" dataKey="补给系数" fill="var(--gw-green, #10b981)" name="补给系数(%)" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="降雨量mm" stroke="var(--gw-amber, #f59e0b)" name="降雨量(mm)" strokeWidth={2} dot={{ r: 3 }} />
              <Legend wrapperStyle={{ fontSize: 10, color: 'var(--gw-muted, #64748b)' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <LazyChartCard title="开采程度统计" icon={Gauge} height={280}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={exploitationBarData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--gw-border, #1a2d4d)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 10 }} />
              <YAxis tick={{ fill: 'var(--gw-muted, #64748b)', fontSize: 10 }} />
              <ChartTooltip unit="m³/s" />
              <Bar dataKey="可开采量" fill="var(--gw-green, #10b981)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="当前开采" fill="var(--gw-amber, #f59e0b)" radius={[4, 4, 0, 0]} />
              <Legend wrapperStyle={{ fontSize: 10, color: 'var(--gw-muted, #64748b)' }} />
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <TechCard title="开发状态一览" icon={Compass}>
          <div className="mb-3 flex justify-end">
            <ChartExport data={karstExploitation} filename="karst-exploitation" sheetName="开发状态" formats={['xlsx','csv','json']} label="导出数据" />
          </div>
          <TechTable
            headers={['分区', '可开采量(m³/s)', '当前开采(m³/s)', '开采率', '状态']}
            rows={karstExploitation.map(e => [e.zone, e.totalAllowable, e.currentExtraction, e.overExploitRatio, e.status])}
          />
        </TechCard>
      </div>

      <div className="flex items-center gap-2">
        <ExportButton onClick={handleExportZones} label="导出系统分区数据" />
      </div>
    </div>
  );
}
