import React, { useState, useMemo } from 'react';
import {
  Calculator, Droplets, Activity,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts';
import { TechCard, StatCard } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import {
  type BalanceInput, type BalanceSummary,
  calcBalance, calcBalanceSummary,
  getPresetBalanceData, fmt,
  getBalanceStatusLabel, getOverdraftStatusLabel,
} from '../../utils/balanceCalculator';

// ── 样式常量 ──

const BALANCE_STATUS_BG: Record<string, string> = {
  surplus: 'bg-emerald-500/15 text-emerald-400',
  balanced: 'bg-blue-500/15 text-blue-400',
  deficit: 'bg-amber-500/15 text-amber-400',
  severe: 'bg-red-500/15 text-red-400',
};

const OVERDRAFT_STATUS_BG: Record<string, string> = {
  safe: 'bg-emerald-500/15 text-emerald-400',
  warning: 'bg-amber-500/15 text-amber-400',
  over: 'bg-orange-500/15 text-orange-400',
  critical: 'bg-red-500/15 text-red-400',
};

const CHART_COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899', '#6366f1', '#ef4444', '#14b8a6', '#f97316', '#8b5cf6'];

// ── 空输入模板 ──

const emptyInput: BalanceInput = {
  city: '', area: 0,
  precipitationInfiltration: 0, lateralRecharge: 0, riverLeakage: 0,
  canalLeakage: 0, irrigationRecharge: 0, crossFlowRecharge: 0, otherRecharge: 0,
  extraction: 0, evaporation: 0, crossFlowDischarge: 0,
  lateralDischarge: 0, springDischarge: 0,
};

// ── 可编辑字段定义 ──

interface FieldDef {
  key: keyof BalanceInput;
  label: string;
  group: 'info' | 'recharge' | 'discharge';
  width?: string;
}

const FIELDS: FieldDef[] = [
  { key: 'city', label: '城市', group: 'info', width: 'w-20' },
  { key: 'area', label: '面积(km\u00b2)', group: 'info', width: 'w-20' },
  // 补给项
  { key: 'precipitationInfiltration', label: '降水入渗', group: 'recharge' },
  { key: 'lateralRecharge', label: '侧向径流', group: 'recharge' },
  { key: 'riverLeakage', label: '河道渗漏', group: 'recharge' },
  { key: 'canalLeakage', label: '渠系渗漏', group: 'recharge' },
  { key: 'irrigationRecharge', label: '灌溉入渗', group: 'recharge' },
  { key: 'crossFlowRecharge', label: '越流补给', group: 'recharge' },
  { key: 'otherRecharge', label: '其他补给', group: 'recharge' },
  // 排泄项
  { key: 'extraction', label: '人工开采', group: 'discharge' },
  { key: 'evaporation', label: '潜水蒸发', group: 'discharge' },
  { key: 'crossFlowDischarge', label: '越流排泄', group: 'discharge' },
  { key: 'lateralDischarge', label: '侧向排泄', group: 'discharge' },
  { key: 'springDischarge', label: '泉排泄', group: 'discharge' },
  { key: 'allowableExtraction', label: '允许开采', group: 'discharge' },
];

// ── 可编辑单元格 ──

function EditCell({
  value, onChange, width,
}: {
  value: number | undefined;
  onChange: (v: number) => void;
  width?: string;
}) {
  return (
    <input
      type="number"
      step="0.01"
      value={value ?? 0}
      onChange={e => onChange(Number(e.target.value) || 0)}
      className={`w-full bg-transparent border border-gw-border/30 rounded px-1.5 py-0.5 text-xs text-center
        focus:border-gw-blue/50 focus:outline-none focus:ring-1 focus:ring-gw-blue/30
        ${width ?? 'w-24'}`}
    />
  );
}

// ── 汇总卡片 ──

function SummaryCards({ summary }: { summary: BalanceSummary }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      <StatCard
        title={'\u603b\u8865\u7ed9\u91cf'}
        value={`${fmt(summary.totalRecharge)}`}
        unit={'\u4ebam\u00b3/a'}
        subtitle={`\u5408\u8ba1${summary.totalArea.toLocaleString()} km\u00b2`}
        accent="blue"
      />
      <StatCard
        title={'\u603b\u6392\u6cc4\u91cf'}
        value={`${fmt(summary.totalDischarge)}`}
        unit={'\u4ebam\u00b3/a'}
        subtitle={`\u5747\u8861\u5dee ${fmt(summary.totalBalance)}`}
        accent="red"
      />
      <StatCard
        title={'\u5747\u8861\u72b6\u6001'}
        value={`${summary.totalSurplusCities + summary.totalBalancedCities} / ${summary.totalSurplusCities + summary.totalBalancedCities + summary.totalOverdraftCities}`}
        subtitle={'\u76c8\u4f59/\u5747\u8861 / \u4e8f\u635f'}
        accent="cyan"
      />
      <StatCard
        title={'\u5e73\u5747\u5f00\u91c7\u7cfb\u6570'}
        value={fmt(summary.avgExploitationCoeff)}
        subtitle={summary.avgExploitationCoeff > 1 ? '\u5f00\u91c7\u91cf > \u8865\u7ed9\u91cf' : '\u5f00\u91c7\u91cf < \u8865\u7ed9\u91cf'}
        accent={summary.avgExploitationCoeff > 1 ? 'red' : 'green'}
      />
      <StatCard
        title={'\u7701\u7ea7\u5747\u8861\u5dee'}
        value={`${fmt(summary.totalBalance)}`}
        unit={'\u4ebam\u00b3/a'}
        subtitle={summary.totalBalance >= 0 ? '\u91c7\u8865\u5e73\u8861' : '\u8d85\u91c7'}
        accent={summary.totalBalance >= 0 ? 'emerald' : 'orange'}
      />
    </div>
  );
}

// ── 主组件 ──

export function BalanceCalculatorTab() {
  const [_usePreset, _setUsePreset] = useState(true);
  const [inputs, setInputs] = useState<BalanceInput[]>(() => getPresetBalanceData());

  // 计算结果
  const results = useMemo(
    () => inputs.map(calcBalance),
    [inputs],
  );

  const summary = useMemo(
    () => calcBalanceSummary(results),
    [results],
  );

  // 更新单个字段
  const updateField = (rowIdx: number, key: keyof BalanceInput, value: number | string) => {
    setInputs(prev => {
      const next = [...prev];
      next[rowIdx] = { ...next[rowIdx], [key]: value };
      return next;
    });
  };

  // 添加空行
  const addRow = () => {
    setInputs(prev => [...prev, { ...emptyInput, city: `\u65b0\u589e${prev.length + 1}` }]);
  };

  // 删除行
  const removeRow = (idx: number) => {
    setInputs(prev => prev.filter((_, i) => i !== idx));
  };

  // 柱状图数据（补给 vs 排泄 vs 均衡差）
  const barChartData = useMemo(() =>
    results.filter(r => r.city).map(r => ({
      name: r.city,
      '\u8865\u7ed9\u91cf': r.totalRecharge,
      '\u6392\u6cc4\u91cf': r.totalDischarge,
      '\u5747\u8861\u5dee': r.balance,
    })),
    [results],
  );

  // 补给结构饼图
  const rechargePieData = useMemo(() =>
    summary.rechargeBreakdown.filter(r => r.value > 0),
    [summary],
  );

  // 排泄结构饼图
  const dischargePieData = useMemo(() =>
    summary.dischargeBreakdown.filter(r => r.value > 0),
    [summary],
  );

  return (
    <div className="space-y-4">
      {/* 公式说明 */}
      <TechCard icon={Calculator} badge={'\u8ba1\u7b97\u5f15\u64ce'}>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gw-muted">
          <span>{'\u2206W = \u03a3\u8865\u7ed9 - \u03a3\u6392\u6cc4'}</span>
          <span>{'\u03b1 = Q\u5f00\u91c7 / Q\u8865\u7ed9'}</span>
          <span>{'M = Q\u5f00\u91c7 / F (\u4e07m\u00b3/km\u00b2\u00b7a)'}</span>
          <span>{'Mr = Q\u8865\u7ed9 / F (\u4e07m\u00b3/km\u00b2\u00b7a)'}</span>
          <span className="text-gw-muted/60">{'\u5355\u4f4d: \u8865\u7ed9/\u6392\u6cc4\u4e3a \u4ebam\u00b3/a, \u9762\u79ef\u4e3a km\u00b2'}</span>
        </div>
      </TechCard>

      {/* 汇总卡片 */}
      <SummaryCards summary={summary} />

      {/* 输入表 */}
      <TechCard icon={Droplets} badge={'\u8f93\u5165\u53c2\u6570'}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gw-border/30">
                <th className="sticky left-0 bg-gw-card z-10 px-2 py-1.5 text-gw-muted font-medium" />
                {FIELDS.map(f => (
                  <th key={f.key} className={`px-1.5 py-1.5 text-gw-muted font-medium text-center ${f.key === 'city' ? 'sticky left-8 bg-gw-card z-10' : ''}`}>
                    <div className={f.group === 'recharge' ? 'text-blue-400' : f.group === 'discharge' ? 'text-red-400' : 'text-gw-muted'}>
                      {f.label}
                    </div>
                  </th>
                ))}
                <th className="px-1.5 py-1.5" />
              </tr>
            </thead>
            <tbody>
              {inputs.map((row, rowIdx) => {
                return (
                  <tr key={rowIdx} className="border-b border-gw-border/15 hover:bg-gw-surface/40">
                    <td className="sticky left-0 bg-gw-card z-10 px-2 py-1 text-gw-muted">{rowIdx + 1}</td>
                    {FIELDS.map(f => (
                      <td key={f.key} className={`px-1 py-1 text-center ${f.key === 'city' ? 'sticky left-8 bg-gw-card z-10' : ''}`}>
                        {f.key === 'city' ? (
                          <input
                            type="text"
                            value={row.city}
                            onChange={e => updateField(rowIdx, 'city', e.target.value)}
                            className="w-20 bg-transparent border border-gw-border/30 rounded px-1 py-0.5 text-xs text-center
                              focus:border-gw-blue/50 focus:outline-none"
                          />
                        ) : (
                          <EditCell
                            value={row[f.key] as number | undefined}
                            onChange={v => updateField(rowIdx, f.key, v)}
                          />
                        )}
                      </td>
                    ))}
                    <td className="px-1 py-1">
                      <button
                        onClick={() => removeRow(rowIdx)}
                        className="text-gw-muted/40 hover:text-red-400 transition-colors"
                        title={'\u5220\u9664\u6b64\u884c'}
                      >
                        {'\u00d7'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-2 flex gap-2">
          <button
            onClick={addRow}
            className="px-3 py-1 rounded text-xs bg-gw-blue/15 text-gw-highlight border border-gw-blue/30 hover:bg-gw-blue/25 transition-all"
          >
            + \u6dfb\u52a0\u884c
          </button>
          <button
            onClick={() => setInputs(getPresetBalanceData())}
            className="px-3 py-1 rounded text-xs bg-gw-surface text-gw-muted border border-gw-border/30 hover:bg-gw-border/30 transition-all"
          >
            \u6062\u590d\u9884\u8bbe
          </button>
        </div>
      </TechCard>

      {/* 计算结果表 */}
      <TechCard icon={Activity} badge={'\u8ba1\u7b97\u7ed3\u679c'}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gw-border/30">
                <th className="px-2 py-1.5 text-gw-muted font-medium text-left sticky left-0 bg-gw-card z-10">{'\u57ce\u5e02'}</th>
                <th className="px-2 py-1.5 text-gw-muted font-medium text-center text-blue-400">{'\u8865\u7ed9\u91cf'}</th>
                <th className="px-2 py-1.5 text-gw-muted font-medium text-center text-red-400">{'\u6392\u6cc4\u91cf'}</th>
                <th className="px-2 py-1.5 text-gw-muted font-medium text-center">{'\u5747\u8861\u5dee'}</th>
                <th className="px-2 py-1.5 text-gw-muted font-medium text-center">{'\u5747\u8861\u72b6\u6001'}</th>
                <th className="px-2 py-1.5 text-gw-muted font-medium text-center">{'\u5f00\u91c7\u7cfb\u6570'}</th>
                <th className="px-2 py-1.5 text-gw-muted font-medium text-center">{'\u8d85\u91c7\u72b6\u6001'}</th>
                <th className="px-2 py-1.5 text-gw-muted font-medium text-center">{'\u5f00\u91c7\u6a21\u6570'}</th>
                <th className="px-2 py-1.5 text-gw-muted font-medium text-center">{'\u8865\u7ed9\u6a21\u6570'}</th>
                <th className="px-2 py-1.5 text-gw-muted font-medium text-center">{'\u8d85\u91c7\u91cf'}</th>
              </tr>
            </thead>
            <tbody>
              {results.filter(r => r.city).map((r, i) => (
                <tr key={i} className="border-b border-gw-border/15 hover:bg-gw-surface/40">
                  <td className="px-2 py-1.5 font-medium text-left sticky left-0 bg-gw-card z-10">{r.city}</td>
                  <td className="px-2 py-1.5 text-center text-blue-400">{fmt(r.totalRecharge)}</td>
                  <td className="px-2 py-1.5 text-center text-red-400">{fmt(r.totalDischarge)}</td>
                  <td className={`px-2 py-1.5 text-center font-medium ${r.balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {r.balance >= 0 ? '+' : ''}{fmt(r.balance)}
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${BALANCE_STATUS_BG[r.balanceStatus]}`}>
                      {getBalanceStatusLabel(r.balanceStatus)}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 text-center">{fmt(r.exploitationCoefficient)}</td>
                  <td className="px-2 py-1.5 text-center">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${OVERDRAFT_STATUS_BG[r.overdraftStatus]}`}>
                      {getOverdraftStatusLabel(r.overdraftStatus)}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 text-center">{fmt(r.exploitationModulus, 1)}</td>
                  <td className="px-2 py-1.5 text-center">{fmt(r.rechargeModulus, 1)}</td>
                  <td className={`px-2 py-1.5 text-center ${r.overdraftAmount > 0 ? 'text-red-400 font-medium' : 'text-emerald-400'}`}>
                    {r.overdraftAmount > 0 ? '+' : ''}{fmt(r.overdraftAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>

      {/* 图表区 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 补排对比柱状图 */}
        <LazyChartCard title={'\u5404\u5e02\u8865\u6392\u5747\u8861\u5bf9\u6bd4'}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} angle={-30} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey={'\u8865\u7ed9\u91cf'} fill="#3b82f6" radius={[2, 2, 0, 0]} />
              <Bar dataKey={'\u6392\u6cc4\u91cf'} fill="#ef4444" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>

        {/* 均衡差柱状图（正负） */}
        <LazyChartCard title={'\u5404\u5e02\u5747\u8861\u5dee'}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} angle={-30} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey={'\u5747\u8861\u5dee'}>
                {barChartData.map((entry, idx) => (
                  <Cell key={idx} fill={entry['\u5747\u8861\u5dee'] >= 0 ? '#10b981' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>

        {/* 补给结构饼图 */}
        <LazyChartCard title={'\u8865\u7ed9\u9879\u7ed3\u6784'}>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={rechargePieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                labelLine={{ stroke: '#6b7280' }}
              >
                {rechargePieData.map((_, idx) => (
                  <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                formatter={(value: number) => [`${fmt(value)} \u4ebam\u00b3/a`, '']}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
            </PieChart>
          </ResponsiveContainer>
        </LazyChartCard>

        {/* 排泄结构饼图 */}
        <LazyChartCard title={'\u6392\u6cc4\u9879\u7ed3\u6784'}>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={dischargePieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                labelLine={{ stroke: '#6b7280' }}
              >
                {dischargePieData.map((_, idx) => (
                  <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                formatter={(value: number) => [`${fmt(value)} \u4ebam\u00b3/a`, '']}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
            </PieChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>
    </div>
  );
}
