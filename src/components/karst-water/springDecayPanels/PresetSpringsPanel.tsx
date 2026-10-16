/**
 * B-19 岩溶泉流量衰减分析 Tab
 *
 * 4大面板：
 *  1. 衰减分析 — Maillet指数衰减模型 + 衰减曲线
 *  2. 滞后相关 — 降水-泉流量滞后相关分析
 *  3. 调蓄评价 — 系统调蓄功能评价
 *  4. 预设泉域 — 6个河北岩溶大泉对比 + 衰减系数参考表
 * 面板: PresetSpringsPanel（拆分自 SpringDecayTab.tsx）
 */
import { ALPHA_REF_TABLE, calcAllPresetSprings, calcSpringSummary, PRESET_SPRINGS } from '../../../utils/springDecayCalculator';
import { ChartExport } from '../../ChartExport';
import { FilterableTechTable } from '../../FilterableTechTable';
import { LazyChartCard } from '../../LazyChartCard';
import { StatCard } from '../../UI';
import { useMemo } from 'react';
import { Legend, BarChart, ResponsiveContainer, Tooltip, CartesianGrid, Bar, XAxis, YAxis } from 'recharts';
import { REGULATION_COLORS, TOOLTIP_STYLE } from './springDecayConstants';

export function PresetSpringsPanel() {
  const results = useMemo(() => calcAllPresetSprings(), []);
  const summary = useMemo(() => calcSpringSummary(), []);

  const compareData = useMemo(() => PRESET_SPRINGS.map((s, i) => ({
    name: s.name,
    初始流量: s.Q0,
    期末流量: results[i].Qt,
    衰减率: results[i].decayRate,
    fill: REGULATION_COLORS[results[i].regulation] ?? '#6b7280',
  })), [results]);

  const alphaData = useMemo(() => PRESET_SPRINGS.map((s, i) => ({
    name: s.name,
    衰减系数: s.alpha * 1000,
    半衰期: results[i].halfLife,
    变幅比: s.amplitudeRatio,
  })), [results]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="岩溶大泉数" value={summary.springCount} unit="个" accent="text-cyan-400" />
        <StatCard title="总衰减期排泄量" value={summary.totalDischarge} unit="万m³" accent="text-blue-400" />
        <StatCard title="平均衰减系数" value={summary.avgAlpha} unit="1/d" accent="text-amber-400" />
        <StatCard title="强调蓄泉域" value={summary.strongRegulation} unit="个" accent="text-emerald-400" subtitle="强/极强" />
      </div>

      <LazyChartCard title="各泉域初始流量 vs 期末流量">
        <ChartExport data={compareData} filename="岩溶泉流量衰减对比" />
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={compareData} margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-25} textAnchor="end" height={70} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'm³/s', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="初始流量" fill="#3b82f6" radius={[3, 3, 0, 0]} />
            <Bar dataKey="期末流量" fill="#ef4444" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <LazyChartCard title="各泉域衰减系数与半衰期">
        <ChartExport data={alphaData} filename="衰减系数对比" />
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={alphaData} margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-25} textAnchor="end" height={70} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: '×10⁻³/d', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="衰减系数" name="衰减系数(×10⁻³/d)" fill="#f59e0b" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <FilterableTechTable
        headers={['泉域', '位置', '初始流量(m³/s)', '衰减系数(1/d)', '半衰期', '期末流量(m³/s)', '衰减率(%)', '调蓄能力', '储水量(万m³)', '状态', '备注']}
        rows={PRESET_SPRINGS.map((s, i) => [s.name, s.location, s.Q0, s.alpha, results[i].halfLife, results[i].Qt, results[i].decayRate, results[i].regulation, results[i].storageEstimate, s.status, s.note])}
      />

      <FilterableTechTable
        headers={['α范围', '调蓄能力', '储水类型', '说明']}
        rows={ALPHA_REF_TABLE.map(a => [a.range, a.regulation, a.storageType, a.description])}
      />

      <div className="bg-gw-card-alt rounded-lg p-4">
        <p className="text-xs text-gw-muted leading-relaxed">
          <strong className="text-gw-text">河北岩溶泉域特征：</strong>
          {' '}河北省岩溶大泉主要分布在太行山前和燕山南麓，含水层以中奥陶统灰岩为主。
          {' '}威州泉、黑龙江洞泉、百泉为三大岩溶水系统，衰减系数α=0.008~0.012/d，属强调蓄型。
          {' '}2021年黑龙洞泉和百泉相继复涌，标志着超采治理取得显著成效。
          {' '}衰减系数是评价岩溶水系统调蓄能力的核心参数，α越小表明储水空间越大、调蓄能力越强。
        </p>
      </div>
    </div>
  );
}
