/**
 * B-20 地下水同位素年龄估算 Tab
 *
 * 5大面板：
 *  1. ³H年龄 — 活塞流/指数模型衰变年龄
 *  2. ¹⁴C年龄 — δ¹³C校正/稀释校正
 *  3. ⁴He年龄 — He累积法定年
 *  4. 补给温度 — δ²H-δ¹⁸O关系估算补给温度/高程
 *  5. 预设监测点 — 8组河北平原同位素数据对比
 * 面板: PresetSitesPanel（拆分自 IsotopeAgeTab.tsx）
 */
import { calcAllPresetSites, PRESET_SITES, calcIsotopeSummary } from '../../../utils/isotopeAgeCalculator';
import { ChartExport } from '../../ChartExport';
import { FilterableTechTable } from '../../FilterableTechTable';
import { LazyChartCard } from '../../LazyChartCard';
import { StatCard } from '../../UI';
import { useMemo } from 'react';
import { XAxis, Tooltip, CartesianGrid, Bar, Legend, YAxis, ResponsiveContainer, BarChart } from 'recharts';
import { TOOLTIP_STYLE } from './isotopeAgeConstants';

export function PresetSitesPanel() {
  const results = useMemo(() => calcAllPresetSites(), []);
  const summary = useMemo(() => calcIsotopeSummary(), []);

  const ageCompare = useMemo(() => results.map(r => ({
    name: r.site.name,
    '³H年龄': r.tritiumResult.apparentAge,
    '¹⁴C年龄': r.c14Result.recommendedAge,
    '⁴He年龄': r.he4Result.estimatedAge,
    fill: r.site.aquiferType === '潜水' ? '#3b82f6' : r.site.aquiferType === '岩溶水' ? '#10b981' : '#f59e0b',
  })), [results]);

  const tempData = useMemo(() => results.map(r => ({
    name: r.site.name,
    补给温度: r.tempResult.rechargeTemp,
    氘盈余: r.tempResult.dExcess,
  })), [results]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="监测点数" value={summary.siteCount} unit="组" accent="text-blue-400" />
        <StatCard title="现代水比例" value={`${summary.modernCount}/${summary.siteCount}`} accent="text-emerald-400" />
        <StatCard title="平均¹⁴C年龄" value={summary.avgC14Age} unit="a BP" accent="text-amber-400" />
        <StatCard title="平均补给温度" value={summary.avgRechargeTemp} unit="°C" accent="text-orange-400" />
      </div>

      <LazyChartCard title="各监测点多种同位素年龄对比（对数刻度）">
        <ChartExport data={ageCompare} filename="同位素年龄对比" />
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={ageCompare} margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-25} textAnchor="end" height={70} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} scale="log" domain={[1, 1000000]} label={{ value: 'a', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="³H年龄" fill="#10b981" radius={[2, 2, 0, 0]} />
            <Bar dataKey="¹⁴C年龄" fill="#f59e0b" radius={[2, 2, 0, 0]} />
            <Bar dataKey="⁴He年龄" fill="#ef4444" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <LazyChartCard title="各监测点补给温度与氘盈余">
        <ChartExport data={tempData} filename="补给温度对比" />
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={tempData} margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-25} textAnchor="end" height={70} />
            <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: '°C', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: '‰', angle: 90, position: 'insideRight', fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar yAxisId="left" dataKey="补给温度" fill="#f59e0b" radius={[3, 3, 0, 0]} />
            <Bar yAxisId="right" dataKey="氘盈余" fill="#3b82f6" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <FilterableTechTable
        headers={['监测点', '位置', '含水层', '深度', '³H(TU)', '³H年龄', '¹⁴C(pmc)', '¹⁴C年龄', '⁴He年龄', 'δ¹⁸O(‰)', '补给温度(°C)', '备注']}
        rows={PRESET_SITES.map((s, i) => [
          s.name, s.location, s.aquiferType, s.depth,
          s.tritium, results[i].tritiumResult.apparentAge,
          s.c14, results[i].c14Result.recommendedAge,
          results[i].he4Result.estimatedAge,
          s.delta18O, results[i].tempResult.rechargeTemp,
          s.note,
        ])}
      />

      <div className="bg-gw-card-alt rounded-lg p-4">
        <p className="text-xs text-gw-muted leading-relaxed">
          <strong className="text-gw-text">河北平原地下水同位素特征：</strong>
          {' '}河北平原地下水同位素呈现明显的深度分带性：
          {' '}浅层水（&lt;50m）³H含量高（10~25TU），为现代水；中层水（50~200m）³H降低（1~5TU），为次现代-现代混合；
          {' '}深层水（&gt;200m）³H极低（&lt;1TU），¹⁴C为5~30pmc，年龄千年~万年级。
          {' '}δ¹⁸O随深度变负（-8‰→-10‰），反映从暖期到冷期的气候变化信号。
          {' '}深层水的古水特征对地下水可持续开发具有重要指示意义。
        </p>
      </div>
    </div>
  );
}
