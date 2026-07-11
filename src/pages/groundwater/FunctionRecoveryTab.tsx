import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts';
import { TechCard, ChartTooltip } from '../../components/UI';
import { LazyChartCard } from '../../components/LazyChartCard';
import { ChartExport } from '../../components/ChartExport';
import { waterLevelRecovery, overdraftControlResults } from '../../data/groundwaterFunction';

interface FunctionRecoveryTabProps {
  recoveryChartData: {
    year: string;
    shallowDepth: number;
    deepDepth: number;
    shallowRise: number;
    deepRise: number;
  }[];
  recoveryExportData: Record<string, number | string>[];
}

export function FunctionRecoveryTab({
  recoveryChartData,
  recoveryExportData,
}: FunctionRecoveryTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="浅层与深层水位埋深变化（2019-2023）" className="scan-line" height={300}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={recoveryChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
              <XAxis dataKey="year" stroke="#64748b" fontSize={10} />
              <YAxis
                yAxisId="left"
                stroke="#64748b"
                fontSize={10}
                label={{ value: '埋深(m)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }}
              />
              <Tooltip content={<ChartTooltip unit="m" title="水位埋深" />} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="shallowDepth"
                name="浅层埋深"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.15}
                strokeWidth={2}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="deepDepth"
                name="深层埋深"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </LazyChartCard>
        <LazyChartCard title="水位累计回升量（2019-2023）" className="scan-line" height={300}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={recoveryChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
              <XAxis dataKey="year" stroke="#64748b" fontSize={10} />
              <YAxis
                stroke="#64748b"
                fontSize={10}
                label={{ value: '回升(m)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }}
              />
              <Tooltip content={<ChartTooltip unit="m" title="回升量" />} />
              <Bar dataKey="shallowRise" name="浅层回升" fill="#10b981" radius={[2, 2, 0, 0]} />
              <Bar dataKey="deepRise" name="深层回升" fill="#3b82f6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>

      <TechCard title="水位回升动态数据" badge="2019-2023">
        <div className="mb-3 flex justify-end">
          <ChartExport
            data={recoveryExportData}
            filename="水位回升动态"
            sheetName="水位回升"
            formats={['xlsx', 'csv', 'json']}
            label="导出数据"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gw-border">
                <th className="text-left text-gw-muted py-2 px-2">年份</th>
                <th className="text-gw-muted py-2 px-2">浅层埋深(m)</th>
                <th className="text-gw-muted py-2 px-2">深层埋深(m)</th>
                <th className="text-gw-muted py-2 px-2">浅层回升(m)</th>
                <th className="text-gw-muted py-2 px-2">深层回升(m)</th>
                <th className="text-left text-gw-muted py-2 px-2">备注</th>
              </tr>
            </thead>
            <tbody>
              {waterLevelRecovery.annualData.map((d, i) => (
                <tr key={i} className="border-b border-gw-border/30 data-row">
                  <td className="py-2 px-2 font-mono text-gw-text">{d.year}</td>
                  <td className="py-2 px-2 font-mono">{d.shallowDepth}</td>
                  <td className="py-2 px-2 font-mono">{d.deepDepth}</td>
                  <td className={`py-2 px-2 font-mono ${d.shallowRise > 0 ? 'text-emerald-400' : ''}`}>
                    {d.shallowRise > 0 ? `+${d.shallowRise}` : '-'}
                  </td>
                  <td className={`py-2 px-2 font-mono ${d.deepRise > 0 ? 'text-emerald-400' : ''}`}>
                    {d.deepRise > 0 ? `+${d.deepRise}` : '-'}
                  </td>
                  <td className="py-2 px-2 text-gw-muted text-[10px]">{d.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[9px] text-gw-muted/60 mt-2">数据来源：{waterLevelRecovery.dataSource}</p>
      </TechCard>

      <TechCard title="超采治理成效">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30 text-center">
            <p className="text-[10px] text-gw-muted">浅层水位回升县</p>
            <p className="text-2xl font-bold text-emerald-400">{overdraftControlResults.shallowRiseCounties}</p>
            <p className="text-[9px] text-gw-muted">占{overdraftControlResults.shallowRisePercent}%</p>
          </div>
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30 text-center">
            <p className="text-[10px] text-gw-muted">深层水位回升县</p>
            <p className="text-2xl font-bold text-blue-400">{overdraftControlResults.deepRiseCounties}</p>
            <p className="text-[9px] text-gw-muted">占{overdraftControlResults.deepRisePercent}%</p>
          </div>
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30 text-center">
            <p className="text-[10px] text-gw-muted">浅层基准埋深</p>
            <p className="text-2xl font-bold text-amber-400">{overdraftControlResults.shallowBaseDepth}</p>
            <p className="text-[9px] text-gw-muted">m</p>
          </div>
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30 text-center">
            <p className="text-[10px] text-gw-muted">深层基准埋深</p>
            <p className="text-2xl font-bold text-red-400">{overdraftControlResults.deepBaseDepth}</p>
            <p className="text-[9px] text-gw-muted">m</p>
          </div>
        </div>
        <p className="text-[9px] text-gw-muted/60 mt-2">数据来源：{overdraftControlResults.source}</p>
      </TechCard>
    </div>
  );
}
