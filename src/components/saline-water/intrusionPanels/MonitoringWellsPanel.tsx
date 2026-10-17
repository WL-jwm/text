/**
 * B-13 咸水入侵风险评价 Tab
 *
 * 4大面板：
 *  1. 风险计算器 — Cl⁻输入+界面参数→综合评分
 *  2. 监测井预警 — 预设8个监测井风险排名
 *  3. 预测趋势 — Cl⁻浓度线性外推预测
 *  4. 防治参考 — 风险等级对应措施
 * 面板: MonitoringWellsPanel（拆分自 IntrusionRiskTab.tsx）
 */
import { RISK_LEVELS, calcChlorideChange, PRESET_MONITORING_WELLS } from '../../../utils/intrusionRiskCalculator';
import { ChartExport } from '../../ChartExport';
import { LazyChartCard } from '../../LazyChartCard';
import { TechCard } from '../../UI';
import { MapPin } from 'lucide-react';
import { useMemo } from 'react';
import { YAxis, XAxis, CartesianGrid, Bar, Tooltip, ResponsiveContainer, BarChart, Cell } from 'recharts';
import { TOOLTIP_STYLE } from './intrusionConstants';

export function MonitoringWellsPanel() {
  const results = useMemo(() => PRESET_MONITORING_WELLS.map(w => calcChlorideChange(w)), []);

  const sortedByCl = useMemo(() => [...results].sort((a, b) => b.currentCl - a.currentCl), [results]);
  const sortedByRate = useMemo(() => [...results].sort((a, b) => Math.abs(b.rateCl) - Math.abs(a.rateCl)), [results]);

  return (
    <div className="space-y-4">
      <TechCard icon={MapPin} title="监测井Cl⁻浓度预警" badge={`${results.length}口井`}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gw-border">
                <th className="text-left p-2 text-gw-muted">监测井</th>
                <th className="text-right p-2 text-gw-muted">初始Cl⁻</th>
                <th className="text-right p-2 text-gw-muted">当前Cl⁻</th>
                <th className="text-right p-2 text-gw-muted">变化率(mg/L/a)</th>
                <th className="text-right p-2 text-gw-muted">超标倍数</th>
                <th className="text-left p-2 text-gw-muted">风险等级</th>
                <th className="text-left p-2 text-gw-muted">入侵类型</th>
                <th className="text-left p-2 text-gw-muted">距海岸(km)</th>
              </tr>
            </thead>
            <tbody>
              {sortedByCl.map(r => (
                <tr key={r.wellName} className="border-b border-gw-border/50 hover:bg-gw-surface/50">
                  <td className="p-2 font-medium text-gw-text">{r.wellName}</td>
                  <td className="p-2 text-right font-mono text-gw-muted">{r.initialCl}</td>
                  <td className="p-2 text-right font-mono font-semibold" style={{ color: r.color }}>{r.currentCl}</td>
                  <td className={`p-2 text-right font-mono ${r.rateCl > 2 ? 'text-red-400' : 'text-gw-muted'}`}>{r.rateCl > 0 ? '+' : ''}{r.rateCl}</td>
                  <td className="p-2 text-right font-mono">{r.exceedRatio ? `${r.exceedRatio}×` : '-'}</td>
                  <td className="p-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${RISK_LEVELS[r.riskLevel].bgColor}`} style={{ color: RISK_LEVELS[r.riskLevel].color }}>
                      {r.riskLevel}
                    </span>
                  </td>
                  <td className="p-2 text-gw-muted">{r.intrusionType}</td>
                  <td className="p-2 text-right text-gw-muted">{r.distanceToCoast}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="各监测井Cl⁻浓度排名" height={350}>
          <div className="mb-2 flex justify-end">
            <ChartExport data={sortedByCl} filename="监测井Cl浓度排名" sheetName="Cl排名" formats={['xlsx', 'csv', 'json']} label="导出数据" />
          </div>
          <ResponsiveContainer width="100%" height={290}>
            <BarChart data={sortedByCl} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <YAxis dataKey="wellName" type="category" tick={{ fontSize: 10, fill: '#9ca3af' }} width={85} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="currentCl" name="当前Cl⁻ (mg/L)" radius={[0, 3, 3, 0]} barSize={14}>
                {sortedByCl.map(entry => (
                  <Cell key={entry.wellName} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <LazyChartCard title="Cl⁻变化率对比" height={350}>
          <div className="mb-2 flex justify-end">
            <ChartExport data={sortedByRate} filename="Cl变化率对比" sheetName="变化率" formats={['xlsx', 'csv', 'json']} label="导出数据" />
          </div>
          <ResponsiveContainer width="100%" height={290}>
            <BarChart data={sortedByRate} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <YAxis dataKey="wellName" type="category" tick={{ fontSize: 10, fill: '#9ca3af' }} width={85} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="rateCl" name="变化率 (mg/L/a)" radius={[0, 3, 3, 0]} barSize={14}>
                {sortedByRate.map(entry => (
                  <Cell key={entry.wellName} fill={entry.rateCl > 2 ? '#ef4444' : '#f59e0b'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>
    </div>
  );
}
