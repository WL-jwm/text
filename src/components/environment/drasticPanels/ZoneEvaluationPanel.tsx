/**
 * B-16 地下水脆弱性评价（DRASTIC模型）Tab
 *
 * 4大面板：
 *  1. 计算器 — 输入7参数 → DRASTIC指数/脆弱性等级/参数分解
 *  2. 分区评价 — 8预设分区对比 + 面积统计
 *  3. 污染风险 — 污染源叠加风险分析
 *  4. 参数参考 — 7参数评分表查表
 * 面板: ZoneEvaluationPanel（拆分自 DrasticVulnerabilityTab.tsx）
 */
import { calcDrasticSummary, PRESET_ZONES, calcAllPresetZones } from '../../../utils/drasticCalculator';
import { ChartExport } from '../../ChartExport';
import { FilterableTechTable } from '../../FilterableTechTable';
import { LazyChartCard } from '../../LazyChartCard';
import { StatCard } from '../../UI';
import { useMemo } from 'react';
import { BarChart, Cell, ResponsiveContainer, Tooltip, CartesianGrid, Bar, XAxis, YAxis, ReferenceLine } from 'recharts';
import { TOOLTIP_STYLE, VULN_COLORS } from './drasticConstants';

export function ZoneEvaluationPanel() {
  const results = useMemo(() => calcAllPresetZones(), []);
  const summary = useMemo(() => calcDrasticSummary(), []);

  const compareData = useMemo(() => results.map(r => ({
    name: r.name,
    DRASTIC: r.drasticIndex,
    fill: VULN_COLORS[r.vulnerability] ?? '#6b7280',
  })), [results]);

  const areaData = useMemo(() => [
    { name: '低', value: summary.areaByLevel['低'], fill: VULN_COLORS['低'] },
    { name: '中等', value: summary.areaByLevel['中等'], fill: VULN_COLORS['中等'] },
    { name: '高', value: summary.areaByLevel['高'], fill: VULN_COLORS['高'] },
    { name: '极高', value: summary.areaByLevel['极高'], fill: VULN_COLORS['极高'] },
  ], [summary]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="评价分区数" value={summary.zoneCount} accent="text-blue-400" />
        <StatCard title="评价总面积" value={summary.totalArea} unit="km²" accent="text-cyan-400" />
        <StatCard title="平均DRASTIC指数" value={summary.avgIndex} accent="text-amber-400" />
        <StatCard title="指数范围" value={`${summary.minIndex}~${summary.maxIndex}`} accent="text-violet-400" />
      </div>

      <LazyChartCard title="各分区DRASTIC指数对比">
        <ChartExport data={compareData} filename="DRASTIC分区对比" />
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={compareData} margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-25} textAnchor="end" height={70} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'DRASTIC指数', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <ReferenceLine y={100} stroke="#10b981" strokeDasharray="5 5" label={{ value: '低/中', fill: '#10b981', fontSize: 10 }} />
            <ReferenceLine y={150} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: '中/高', fill: '#f59e0b', fontSize: 10 }} />
            <ReferenceLine y={180} stroke="#ef4444" strokeDasharray="5 5" label={{ value: '高/极高', fill: '#ef4444', fontSize: 10 }} />
            <Bar dataKey="DRASTIC" radius={[4, 4, 0, 0]}>
              {compareData.map((entry, idx) => (
                <Cell key={idx} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <LazyChartCard title="脆弱性等级面积分布">
        <ChartExport data={areaData} filename="脆弱性面积分布" />
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={areaData} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'km²', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Bar dataKey="value" name="面积(km²)" radius={[4, 4, 0, 0]}>
              {areaData.map((entry, idx) => (
                <Cell key={idx} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <FilterableTechTable
        headers={['分区名称', '所在区域', '面积(km²)', 'DRASTIC指数', '脆弱性等级', '备注']}
        rows={PRESET_ZONES.map((z, i) => [z.name, z.region, z.area, results[i].drasticIndex, results[i].vulnerability, z.note])}
      />
    </div>
  );
}
