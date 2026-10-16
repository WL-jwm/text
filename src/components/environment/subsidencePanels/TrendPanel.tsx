/**
 * B-12 地面沉降与降落漏斗分析 Tab
 *
 * 4大面板：
 *  1. 漏斗计算器 — 水文地质参数输入→漏斗半径/降深/体积
 *  2. 沉降估算 — 土层参数→分层沉降量+总沉降
 *  3. 趋势分析 — 历史沉降趋势+预测
 *  4. 沉降风险 — 河北典型沉降区+风险分区
 * 面板: TrendPanel（拆分自 SubsidenceTab.tsx）
 */
import { getSubsidenceRisk, SUBSIDENCE_ZONES, SUBSIDENCE_TREND } from '../../../utils/subsidenceCalculator';
import { ChartExport } from '../../ChartExport';
import { LazyChartCard } from '../../LazyChartCard';
import { TechCard } from '../../UI';
import { MapPin } from 'lucide-react';
import { useMemo } from 'react';
import { CartesianGrid, Legend, BarChart, Bar, Tooltip, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { TOOLTIP_STYLE } from './subsidenceConstants';

export function TrendPanel() {
  const combinedData = SUBSIDENCE_TREND;

  // 累计沉降柱状图
  const barData = useMemo(() =>
    combinedData.map(d => ({
      year: d.year,
      '累计沉降': d.cumulative,
      '年速率': d.rate,
      predicted: d.predicted,
    })),
    [],
  );

  // 沉降区排名
  const sortedZones = [...SUBSIDENCE_ZONES].sort((a, b) => b.cumulative - a.cumulative);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="累计沉降量趋势（1990-2030）" height={360}>
          <div className="mb-2 flex justify-end">
            <ChartExport data={barData} filename="累计沉降趋势" sheetName="沉降趋势" formats={['xlsx', 'csv', 'json']} label="导出数据" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} margin={{ top: 5, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} unit=" mm" />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="累计沉降" name="累计沉降(mm)" radius={[2, 2, 0, 0]}>
                {barData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.predicted ? '#f59e0b' : '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-1 text-[10px] text-gw-muted">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500 inline-block" />实际</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500 inline-block" />预测</span>
          </div>
        </LazyChartCard>

        <LazyChartCard title="年沉降速率变化" height={360}>
          <div className="mb-2 flex justify-end">
            <ChartExport data={barData} filename="年沉降速率" sheetName="沉降速率" formats={['xlsx', 'csv', 'json']} label="导出数据" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} margin={{ top: 5, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} unit=" mm/a" />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="年速率" name="年速率(mm/a)" radius={[2, 2, 0, 0]}>
                {barData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.年速率 > 25 ? '#ef4444' : entry.年速率 > 15 ? '#f59e0b' : '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>

      <TechCard icon={MapPin} title="河北典型沉降区" badge="风险排名">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gw-border">
                <th className="text-left p-2 text-gw-muted">区域</th>
                <th className="text-right p-2 text-gw-muted">累计沉降(mm)</th>
                <th className="text-right p-2 text-gw-muted">年速率(mm/a)</th>
                <th className="text-left p-2 text-gw-muted">风险等级</th>
              </tr>
            </thead>
            <tbody>
              {sortedZones.map(z => {
                const meta = getSubsidenceRisk(z.cumulative);
                return (
                  <tr key={z.name} className="border-b border-gw-border/50 hover:bg-gw-surface/50">
                    <td className="p-2 font-medium text-gw-text">{z.name}</td>
                    <td className="p-2 text-right font-mono font-semibold" style={{ color: meta.riskColor }}>{z.cumulative}</td>
                    <td className="p-2 text-right font-mono text-gw-muted">{z.rate}</td>
                    <td className="p-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: meta.riskColor + '20', color: meta.riskColor }}>
                        {meta.riskLevel}风险
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </TechCard>
    </div>
  );
}
