/**
 * B-07增强 地下水均衡计算器 Tab
 * 主组件：状态管理 + 图表数据准备 + 输入/结果表格 + JSX 编排
 * 子组件与常量见 balanceCharts.tsx / balanceConstants.ts
 */
import React, { useState, useMemo } from 'react';
import { Calculator, Droplets, Activity } from 'lucide-react';
import { TechCard } from '../UI';
import { PipelinePanel } from '../PipelinePanel';
import { usePipeline } from '../../hooks/usePipeline';
import {
  type BalanceInput,
  calcBalance, calcBalanceSummary,
  getPresetBalanceData, fmt,
  getBalanceStatusLabel, getOverdraftStatusLabel,
} from '../../utils/balanceCalculator';
import { BALANCE_STATUS_BG, OVERDRAFT_STATUS_BG, emptyInput, FIELDS } from './balanceConstants';
import {
  SummaryCards, EditCell,
  ExtractionTrendChart,
  RechargeDischargeBarChart, BalanceDiffChart,
  RechargePieChart, DischargePieChart,
  ExploitCoeffChart, ModulusScatterChart,
  OverdraftRankChart, RechargeHeatmapTable,
} from './balanceCharts';

export function BalanceCalculatorTab() {
  const [_usePreset, _setUsePreset] = useState(true);
  const [inputs, setInputs] = useState<BalanceInput[]>(() => getPresetBalanceData());

  // 计算结果
  const results = useMemo(() => inputs.map(calcBalance), [inputs]);
  const { publishData } = usePipeline('balance');
  const summary = useMemo(() => calcBalanceSummary(results), [results]);

  // 更新单个字段
  const updateField = (rowIdx: number, key: keyof BalanceInput, value: number | string) => {
    setInputs(prev => {
      const next = [...prev];
      next[rowIdx] = { ...next[rowIdx], [key]: value };
      return next;
    });
  };

  const addRow = () => {
    setInputs(prev => [...prev, { ...emptyInput, city: `新增${prev.length + 1}` }]);
  };

  const removeRow = (idx: number) => {
    setInputs(prev => prev.filter((_, i) => i !== idx));
  };

  // ── 图表数据准备 ──

  // 柱状图数据
  const barChartData = useMemo(() =>
    results.filter(r => r.city).map(r => ({
      name: r.city,
      补给量: r.totalRecharge,
      排泄量: r.totalDischarge,
      均衡差: r.balance,
    })),
    [results],
  );

  // 饼图数据
  const rechargePieData = useMemo(() =>
    summary.rechargeBreakdown.filter(r => r.value > 0),
    [summary],
  );
  const dischargePieData = useMemo(() =>
    summary.dischargeBreakdown.filter(r => r.value > 0),
    [summary],
  );

  // 开采系数分布数据（按系数排序）
  const coeffData = useMemo(() =>
    results.filter(r => r.city)
      .map(r => ({ name: r.city, 开采系数: r.exploitationCoefficient, status: r.overdraftStatus }))
      .sort((a, b) => b.开采系数 - a.开采系数),
    [results],
  );

  // 开采/补给模数散点数据
  const scatterData = useMemo(() =>
    results.filter(r => r.city && r.area > 0)
      .map(r => ({
        name: r.city,
        开采模数: r.exploitationModulus,
        补给模数: r.rechargeModulus,
        area: r.area,
        status: r.overdraftStatus,
      })),
    [results],
  );

  // 超采量排名数据（仅超采城市）
  const overdraftData = useMemo(() =>
    results.filter(r => r.city && r.overdraftAmount > 0)
      .map(r => ({
        name: r.city,
        超采量: Math.abs(r.overdraftAmount),
        开采系数: r.exploitationCoefficient,
      }))
      .sort((a, b) => b.超采量 - a.超采量),
    [results],
  );

  return (
    <div className="space-y-4">
      {/* 公式说明 */}
      <TechCard icon={Calculator} badge="计算引擎">
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gw-muted">
          <span>{"\u0394W = \u03a3补给 - \u03a3排泄"}</span>
          <span>{"\u03b1 = Q开采 / Q补给"}</span>
          <span>{"M = Q开采 / F (万m\u00b3/km\u00b2\u00b7a)"}</span>
          <span>{"Mr = Q补给 / F (万m\u00b3/km\u00b2\u00b7a)"}</span>
          <span className="text-gw-muted/60">单位: 补给/排泄为 亿m\u00b3/a, 面积为 km\u00b2</span>
        </div>
      </TechCard>

      {/* 汇总卡片 */}
      <SummaryCards summary={summary} />

      {/* 输入表 */}
      <TechCard icon={Droplets} badge="输入参数">
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
              {inputs.map((row, rowIdx) => (
                <tr key={rowIdx} className="border-b border-gw-border/15 hover:bg-gw-surface/40">
                  <td className="sticky left-0 bg-gw-card z-10 px-2 py-1 text-gw-muted">{rowIdx + 1}</td>
                  {FIELDS.map(f => (
                    <td key={f.key} className={`px-1 py-1 text-center ${f.key === 'city' ? 'sticky left-8 bg-gw-card z-10' : ''}`}>
                      {f.key === 'city' ? (
                        <input
                          type="text"
                          value={row.city}
                          onChange={e => updateField(rowIdx, 'city', e.target.value)}
                          className="w-20 bg-transparent border border-gw-border/30 rounded px-1 py-0.5 text-xs text-center focus:border-gw-blue/50 focus:outline-none"
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
                      title="删除此行"
                    >
                      {"\u00d7"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-2 flex gap-2">
          <button
            onClick={addRow}
            className="px-3 py-1 rounded text-xs bg-gw-blue/15 text-gw-highlight border border-gw-blue/30 hover:bg-gw-blue/25 transition-all"
          >
            + 添加行
          </button>
          <button
            onClick={() => setInputs(getPresetBalanceData())}
            className="px-3 py-1 rounded text-xs bg-gw-surface text-gw-muted border border-gw-border/30 hover:bg-gw-border/30 transition-all"
          >
            恢复预设
          </button>
        </div>
      </TechCard>

      {/* 计算结果表 */}
      <TechCard icon={Activity} badge="计算结果">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gw-border/30">
                <th className="px-2 py-1.5 text-gw-muted font-medium text-left sticky left-0 bg-gw-card z-10">城市</th>
                <th className="px-2 py-1.5 text-gw-muted font-medium text-center text-blue-400">补给量</th>
                <th className="px-2 py-1.5 text-gw-muted font-medium text-center text-red-400">排泄量</th>
                <th className="px-2 py-1.5 text-gw-muted font-medium text-center">均衡差</th>
                <th className="px-2 py-1.5 text-gw-muted font-medium text-center">均衡状态</th>
                <th className="px-2 py-1.5 text-gw-muted font-medium text-center">开采系数</th>
                <th className="px-2 py-1.5 text-gw-muted font-medium text-center">超采状态</th>
                <th className="px-2 py-1.5 text-gw-muted font-medium text-center">开采模数</th>
                <th className="px-2 py-1.5 text-gw-muted font-medium text-center">补给模数</th>
                <th className="px-2 py-1.5 text-gw-muted font-medium text-center">超采量</th>
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
                  <td className="px-2 py-1.5 text-center font-mono">{fmt(r.exploitationCoefficient)}</td>
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

      {/* ═══════════════════════ 图表区域 ═══════════════════════ */}
      <div className="space-y-4">
        {/* 开采量趋势（独立宽幅） */}
        <ExtractionTrendChart />

        {/* 第一行: 补排对比 + 均衡差 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RechargeDischargeBarChart barData={barChartData} />
          <BalanceDiffChart barData={barChartData} />
        </div>

        {/* 第二行: 补给饼图 + 排泄饼图 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RechargePieChart pieData={rechargePieData} />
          <DischargePieChart pieData={dischargePieData} />
        </div>

        {/* 第三行: 开采系数分布(新增) + 开采模数散点(新增) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ExploitCoeffChart coeffData={coeffData} />
          <ModulusScatterChart scatterData={scatterData} />
        </div>

        {/* 第四行: 超采量排名(新增) */}
        <OverdraftRankChart overdraftData={overdraftData} />

        {/* 第五行: 补给结构热力表(新增) */}
        <RechargeHeatmapTable results={results} />
      </div>
      <PipelinePanel moduleId="balance" onPublish={() => {
        if (results.length > 0) {
          const totalRecharge = results.reduce((s, r) => s + (r.totalRecharge || 0), 0);
          const totalDischarge = results.reduce((s, r) => s + (r.totalDischarge || 0), 0);
          const balance = totalRecharge - totalDischarge;
          publishData('balanceResult', `均衡计算(${results.length}个分区)`, {
            recharge: Math.round(totalRecharge * 100) / 100,
            discharge: Math.round(totalDischarge * 100) / 100,
            balance: Math.round(balance * 100) / 100,
            zoneCount: results.length,
          }, `${results.length}个分区`);
        }
      }} />
    </div>
  );
}
