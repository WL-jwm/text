/**
 * B-37 气候变化对地下水影响评估器 Tab
 *
 * 5大面板：
 *  1. 气候降尺度 — 历史气候数据+GCM降尺度+降水/气温趋势
 *  2. 补给量预测 — 降水-补给关系+多情景补给变化
 *  3. 干旱指数 — SPI/SPEI计算+干旱分级+传导滞后
 *  4. 适应策略 — 策略库+情景匹配+优先级排序
 *  5. 参考说明 — 降尺度方法+补给公式+干旱指数+GCM情景
 */
import React, { useState, useMemo} from 'react';
import {
  LineChart, Line, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, ReferenceLine, Legend, ComposedChart, PieChart, Pie,
} from 'recharts';
import {
  CloudRain, Thermometer, Droplets, Shield, BookOpen,
  Sun,
} from 'lucide-react';
import { TechCard, DataSourceNote, CollapsiblePanel } from '../UI';
import { FilterableTechTable } from '../FilterableTechTable';
import {
  generateHistoricalClimate, SCENARIO_PARAMS,
  DROUGHT_CLASS_LABELS, DROUGHT_CLASS_COLORS,
  RISK_LEVEL_LABELS, RISK_LEVEL_COLORS, CATEGORY_LABELS,
  ADAPTATION_STRATEGIES,
  downscaleDelta, calcRechargeBredenkamp, calcRechargeWaterBalance,
  calcSPEI, calcComprehensiveClimate,
  type ClimateScenario,
} from '../../utils/climateImpactCalculator';

const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#e2e8f0' },
};

// ── 面板1: 气候降尺度 ──
function DownscalingPanel() {
  const historical = useMemo(() => generateHistoricalClimate(), []);
  const [selectedScenarios, setSelectedScenarios] = useState<ClimateScenario[]>(['rcp45', 'rcp85', 'ssp585']);

  const projections = useMemo(() => {
    return selectedScenarios.map(sc => {
      const params = SCENARIO_PARAMS[sc];
      return downscaleDelta(historical, params.deltaTemp, params.deltaPrecip, 2025, 2075, sc);
    });
  }, [historical, selectedScenarios]);

  // 历史数据图表
  const historicalData = useMemo(() =>
    historical.filter((_, i) => i % 2 === 0).map(d => ({
      year: d.year,
      precip: d.annualPrecip,
      temp: d.annualTemp,
      pet: d.pet,
    })),
  [historical]);

  // 未来降水投影
  const precipProjectionData = useMemo(() => {
    const maxLen = Math.max(...projections.map(p => p.years.length));
    const data: Record<string, number>[] = [];
    for (let i = 0; i < maxLen; i++) {
      const row: Record<string, number> = { year: projections[0]?.years[i] ?? 2025 + i };
      projections.forEach(p => {
        if (p.precipitation[i] !== undefined) {
          row[p.scenario] = p.precipitation[i];
        }
      });
      data.push(row);
    }
    return data;
  }, [projections]);

  // 未来气温投影
  const tempProjectionData = useMemo(() => {
    const maxLen = Math.max(...projections.map(p => p.years.length));
    const data: Record<string, number>[] = [];
    for (let i = 0; i < maxLen; i++) {
      const row: Record<string, number> = { year: projections[0]?.years[i] ?? 2025 + i };
      projections.forEach(p => {
        if (p.temperature[i] !== undefined) {
          row[p.scenario] = p.temperature[i];
        }
      });
      data.push(row);
    }
    return data;
  }, [projections]);

  const scenarioButtons: ClimateScenario[] = ['rcp45', 'rcp85', 'ssp245', 'ssp585'];

  return (
    <div className="space-y-4">
      <TechCard>
        <div className="flex items-center gap-2 mb-3">
          <CloudRain size={16} className="text-cyan-400" />
          <h4 className="text-sm font-semibold text-gw-text">气候情景选择</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {scenarioButtons.map(sc => {
            const params = SCENARIO_PARAMS[sc];
            const selected = selectedScenarios.includes(sc);
            return (
              <button key={sc} onClick={() => {
                setSelectedScenarios(selected
                  ? selectedScenarios.filter(s => s !== sc)
                  : [...selectedScenarios, sc]);
              }} className={`p-2 rounded-lg text-left transition-all ${
                selected ? 'bg-gw-blue/20 border border-gw-blue/40' : 'bg-gw-surface border border-gw-border'
              }`}>
                <div className="text-xs font-medium" style={{ color: selected ? params.color : undefined }}>{params.label}</div>
                <div className="text-[10px] text-gw-muted mt-0.5">+{params.deltaTemp}℃ / {params.deltaPrecip > 0 ? '+' : ''}{params.deltaPrecip}%</div>
              </button>
            );
          })}
        </div>
      </TechCard>

      <div className="grid md:grid-cols-2 gap-4">
        <TechCard>
          <h5 className="text-xs font-medium text-gw-text mb-3">历史降水与气温趋势 (1961-2024)</h5>
          <ResponsiveContainer width="100%" height={250}>
            <ComposedChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 9 }} />
              <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '降水(mm)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '气温(℃)', angle: 90, position: 'insideRight', fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar yAxisId="left" dataKey="precip" name="年降水" fill="#06b6d4" fillOpacity={0.5} barSize={3} />
              <Line yAxisId="right" type="monotone" dataKey="temp" name="年均温" stroke="#ef4444" strokeWidth={1.5} dot={false} />
              <Line yAxisId="left" type="monotone" dataKey="pet" name="PET" stroke="#f59e0b" strokeWidth={1} dot={false} strokeDasharray="3 3" />
            </ComposedChart>
          </ResponsiveContainer>
        </TechCard>

        <TechCard>
          <h5 className="text-xs font-medium text-gw-text mb-3">未来降水投影 (2025-2075)</h5>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={precipProjectionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 9 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '降水(mm)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              {projections.map(p => (
                <Line key={p.scenario} type="monotone" dataKey={p.scenario} name={SCENARIO_PARAMS[p.scenario].label} stroke={SCENARIO_PARAMS[p.scenario].color} strokeWidth={1.5} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </TechCard>
      </div>

      <TechCard>
        <h5 className="text-xs font-medium text-gw-text mb-3">未来气温投影 (2025-2075)</h5>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={tempProjectionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 9 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '气温(℃)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            {projections.map(p => (
              <Line key={p.scenario} type="monotone" dataKey={p.scenario} name={SCENARIO_PARAMS[p.scenario].label} stroke={SCENARIO_PARAMS[p.scenario].color} strokeWidth={1.5} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </TechCard>

      <TechCard>
        <h5 className="text-xs font-medium text-gw-text mb-2">各情景变化量总结</h5>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gw-muted text-[10px] border-b border-gw-border">
                <th className="text-left py-1 px-2">情景</th>
                <th className="text-center py-1 px-2">降水变化</th>
                <th className="text-center py-1 px-2">升温幅度</th>
                <th className="text-center py-1 px-2">补给量变化</th>
              </tr>
            </thead>
            <tbody className="text-gw-text">
              {projections.map(p => (
                <tr key={p.scenario} className="border-b border-gw-border/50">
                  <td className="py-1 px-2" style={{ color: SCENARIO_PARAMS[p.scenario].color }}>{SCENARIO_PARAMS[p.scenario].label}</td>
                  <td className="py-1 px-2 text-center" style={{ color: p.deltaPrecip > 0 ? '#10b981' : '#ef4444' }}>{p.deltaPrecip > 0 ? '+' : ''}{p.deltaPrecip}%</td>
                  <td className="py-1 px-2 text-center text-red-400">+{p.deltaTemp}℃</td>
                  <td className="py-1 px-2 text-center" style={{ color: p.deltaRecharge > 0 ? '#10b981' : '#ef4444' }}>{p.deltaRecharge > 0 ? '+' : ''}{p.deltaRecharge}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>
    </div>
  );
}

// ── 面板2: 补给量预测 ──
function RechargePanel() {
  const historical = useMemo(() => generateHistoricalClimate(), []);
  const projections = useMemo(() => {
    const scenarios: ClimateScenario[] = ['rcp45', 'rcp85', 'ssp585'];
    return scenarios.map(sc => {
      const params = SCENARIO_PARAMS[sc];
      return downscaleDelta(historical, params.deltaTemp, params.deltaPrecip, 2025, 2075, sc);
    });
  }, [historical]);

  const rechargeHistoryData = useMemo(() =>
    historical.filter((_, i) => i % 2 === 0).map(d => ({
      year: d.year,
      precip: d.annualPrecip,
      recharge: calcRechargeBredenkamp(d.annualPrecip, d.pet),
    })),
  [historical]);

  const rechargeProjectionData = useMemo(() => {
    const maxLen = Math.max(...projections.map(p => p.years.length));
    const data: Record<string, number>[] = [];
    for (let i = 0; i < maxLen; i++) {
      const row: Record<string, number> = { year: projections[0]?.years[i] ?? 2025 + i };
      projections.forEach(p => {
        if (p.recharge[i] !== undefined) row[p.scenario] = p.recharge[i];
      });
      data.push(row);
    }
    return data;
  }, [projections]);

  // Budyko法示例
  const budykoExample = useMemo(() => {
    const precip = 550;
    const pet = 800;
    return calcRechargeWaterBalance(precip, pet);
  }, []);

  return (
    <div className="space-y-4">
      <TechCard>
        <div className="flex items-center gap-2 mb-3">
          <Droplets size={16} className="text-blue-400" />
          <h4 className="text-sm font-semibold text-gw-text">降水-补给关系</h4>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <ComposedChart data={rechargeHistoryData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 9 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: 'mm', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="precip" name="年降水" fill="#06b6d4" fillOpacity={0.4} barSize={3} />
            <Line type="monotone" dataKey="recharge" name="地下水补给" stroke="#10b981" strokeWidth={1.5} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </TechCard>

      <TechCard>
        <h5 className="text-xs font-medium text-gw-text mb-3">多情景补给量预测 (2025-2075)</h5>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={rechargeProjectionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 9 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '补给量(mm)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            {projections.map(p => (
              <Line key={p.scenario} type="monotone" dataKey={p.scenario} name={SCENARIO_PARAMS[p.scenario].label} stroke={SCENARIO_PARAMS[p.scenario].color} strokeWidth={1.5} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </TechCard>

      <TechCard>
        <h5 className="text-xs font-medium text-gw-text mb-3">补给估算方法对比（示例：P=550mm, PET=800mm）</h5>
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-gw-surface rounded-lg">
            <div className="text-[10px] text-gw-muted">Bredenkamp法</div>
            <div className="text-lg font-bold text-cyan-400">{calcRechargeBredenkamp(550, 800).toFixed(1)}</div>
            <div className="text-[9px] text-gw-muted">mm/a (α=0.25)</div>
          </div>
          <div className="p-3 bg-gw-surface rounded-lg">
            <div className="text-[10px] text-gw-muted">Budyko水分平衡</div>
            <div className="text-lg font-bold text-green-400">{budykoExample.recharge.toFixed(1)}</div>
            <div className="text-[9px] text-gw-muted">mm/a (30%盈余)</div>
          </div>
          <div className="p-3 bg-gw-surface rounded-lg">
            <div className="text-[10px] text-gw-muted">补给系数</div>
            <div className="text-lg font-bold text-amber-400">{budykoExample.rechargeRate.toFixed(3)}</div>
            <div className="text-[9px] text-gw-muted">R/P</div>
          </div>
        </div>
      </TechCard>
    </div>
  );
}

// ── 面板3: 干旱指数 ──
function DroughtPanel() {
  const historical = useMemo(() => generateHistoricalClimate(), []);
  const droughtIndices = useMemo(() => calcSPEI(
    historical.map(d => d.annualPrecip),
    historical.map(d => d.pet),
  ), [historical]);

  const chartData = useMemo(() =>
    droughtIndices.map(d => ({
      year: d.year,
      spi: d.spi,
      spei: d.spei,
      class: DROUGHT_CLASS_LABELS[d.droughtClass],
    })),
  [droughtIndices]);

  const droughtStats = useMemo(() => {
    const none = droughtIndices.filter(d => d.droughtClass === 'none').length;
    const mild = droughtIndices.filter(d => d.droughtClass === 'mild').length;
    const moderate = droughtIndices.filter(d => d.droughtClass === 'moderate').length;
    const severe = droughtIndices.filter(d => d.droughtClass === 'severe').length;
    const extreme = droughtIndices.filter(d => d.droughtClass === 'extreme').length;
    return [
      { name: '无干旱', count: none, color: DROUGHT_CLASS_COLORS.none },
      { name: '轻微', count: mild, color: DROUGHT_CLASS_COLORS.mild },
      { name: '中等', count: moderate, color: DROUGHT_CLASS_COLORS.moderate },
      { name: '严重', count: severe, color: DROUGHT_CLASS_COLORS.severe },
      { name: '极端', count: extreme, color: DROUGHT_CLASS_COLORS.extreme },
    ];
  }, [droughtIndices]);

  const tableRows = useMemo(() =>
    droughtIndices.filter(d => d.droughtClass !== 'none').map(d => [
      String(d.year),
      d.spi.toFixed(2),
      d.spei.toFixed(2),
      DROUGHT_CLASS_LABELS[d.droughtClass],
      d.droughtType === 'hydrological' ? '水文干旱' : d.droughtType === 'meteorological' ? '气象干旱' : '-',
    ]),
  [droughtIndices]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
        {droughtStats.map(s => (
          <div key={s.name} className="text-center p-2 bg-gw-surface rounded">
            <div className="text-[10px] text-gw-muted">{s.name}</div>
            <div className="text-lg font-bold" style={{ color: s.color }}>{s.count}</div>
            <div className="text-[9px] text-gw-muted">年</div>
          </div>
        ))}
      </div>

      <TechCard>
        <h5 className="text-xs font-medium text-gw-text mb-3">SPI/SPEI时间序列 (1961-2024)</h5>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 9 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} domain={[-3, 3]} label={{ value: '指数', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <ReferenceLine y={0} stroke="#64748b" />
            <ReferenceLine y={-1} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: '轻微', fill: '#f59e0b', fontSize: 9 }} />
            <ReferenceLine y={-2} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '严重', fill: '#ef4444', fontSize: 9 }} />
            <Line type="monotone" dataKey="spi" name="SPI" stroke="#06b6d4" strokeWidth={1} dot={false} />
            <Line type="monotone" dataKey="spei" name="SPEI" stroke="#8b5cf6" strokeWidth={1} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </TechCard>

      <TechCard>
        <h5 className="text-xs font-medium text-gw-text mb-2">干旱年份明细</h5>
        {tableRows.length > 0 ? (
          <FilterableTechTable
            headers={['年份', 'SPI', 'SPEI', '干旱等级', '干旱类型']}
            rows={tableRows}
          />
        ) : (
          <div className="text-xs text-gw-muted p-4 text-center">无干旱年份</div>
        )}
      </TechCard>
    </div>
  );
}

// ── 面板4: 适应策略 ──
function AdaptationPanel() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredStrategies = useMemo(() => {
    if (selectedCategory === 'all') return ADAPTATION_STRATEGIES;
    return ADAPTATION_STRATEGIES.filter(s => s.category === selectedCategory);
  }, [selectedCategory]);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    ADAPTATION_STRATEGIES.forEach(s => {
      counts[s.category] = (counts[s.category] ?? 0) + 1;
    });
    return Object.entries(counts).map(([cat, count]) => ({
      name: CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS],
      value: count,
      color: { supply: '#06b6d4', demand: '#10b981', ecology: '#84cc16', monitoring: '#f59e0b', governance: '#8b5cf6' }[cat],
    }));
  }, []);

  const costLabels: Record<string, string> = { low: '低', medium: '中', high: '高' };
  const timeLabels: Record<string, string> = { short: '短期', medium: '中期', long: '长期' };

  return (
    <div className="space-y-4">
      <TechCard>
        <div className="flex items-center gap-2 mb-3">
          <Shield size={16} className="text-green-400" />
          <h4 className="text-sm font-semibold text-gw-text">适应策略库</h4>
        </div>
        <div className="flex gap-1 flex-wrap mb-3">
          <button onClick={() => setSelectedCategory('all')}
            className={`px-2 py-1 text-[10px] rounded ${selectedCategory === 'all' ? 'bg-gw-blue/20 text-gw-highlight' : 'bg-gw-surface text-gw-muted'}`}>
            全部 ({ADAPTATION_STRATEGIES.length})
          </button>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <button key={key} onClick={() => setSelectedCategory(key)}
              className={`px-2 py-1 text-[10px] rounded ${selectedCategory === key ? 'bg-gw-blue/20 text-gw-highlight' : 'bg-gw-surface text-gw-muted'}`}>
              {label} ({ADAPTATION_STRATEGIES.filter(s => s.category === key).length})
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filteredStrategies.map(s => (
            <div key={s.id} className="p-3 bg-gw-surface rounded-lg border border-gw-border">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded ${s.priority === 'high' ? 'bg-red-500/20 text-red-400' : s.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'}`}>
                    {s.priority === 'high' ? '高优先' : s.priority === 'medium' ? '中优先' : '低优先'}
                  </span>
                  <span className="text-xs font-medium text-gw-text">{s.name}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gw-muted">
                  <span>成本: {costLabels[s.cost]}</span>
                  <span>周期: {timeLabels[s.implementationTime]}</span>
                </div>
              </div>
              <p className="text-[11px] text-gw-muted">{s.description}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] text-gw-muted">适用情景:</span>
                {s.applicableScenario.map(sc => (
                  <span key={sc} className="text-[9px] px-1.5 py-0.5 bg-gw-border/50 rounded text-gw-text">{SCENARIO_PARAMS[sc].label}</span>
                ))}
              </div>
              <div className="mt-1 text-[10px] text-green-400">
                预期效益: {s.expectedBenefit}
              </div>
            </div>
          ))}
        </div>
      </TechCard>

      <TechCard>
        <h5 className="text-xs font-medium text-gw-text mb-3">策略分类分布</h5>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={{ fontSize: 10 }}>
              {categoryData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
            </Pie>
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
          </PieChart>
        </ResponsiveContainer>
      </TechCard>
    </div>
  );
}

// ── 面板5: 参考说明 ──
function ReferencePanel() {
  return (
    <div className="space-y-4">
      <CollapsiblePanel title="Delta降尺度方法" defaultOpen icon={CloudRain}>
        <div className="text-xs text-gw-muted space-y-2 leading-relaxed">
          <p><strong className="text-gw-text">原理</strong>：将GCM网格的气候变化信号(Delta)叠加到历史观测数据上。未来降水 = 历史降水 x (1 + dP%)，未来气温 = 历史气温 + dT。</p>
          <p><strong className="text-gw-text">优势</strong>：简单直观，保留了历史数据的自然变率特征，适用于区域尺度影响评估。</p>
          <p><strong className="text-gw-text">局限</strong>：假设未来气候变率与历史一致，无法捕捉极端事件频率的变化。</p>
        </div>
      </CollapsiblePanel>

      <CollapsiblePanel title="补给量估算方法" icon={Droplets}>
        <div className="text-xs text-gw-muted space-y-2 leading-relaxed">
          <p><strong className="text-gw-text">Bredenkamp法</strong>：R = alpha x (P - beta x PET)，alpha和beta根据含水层类型确定。松散岩类alpha=0.25, beta=0.5。</p>
          <p><strong className="text-gw-text">Chaturvedi法</strong>：R = 1.35 x (P - 14)^0.5，适用于半干旱区，P大于14mm时才有补给。</p>
          <p><strong className="text-gw-text">Budyko框架</strong>：基于水量平衡，AET = PET x f(P/PET)，补给量 = 30%的水分盈余。</p>
        </div>
      </CollapsiblePanel>

      <CollapsiblePanel title="干旱指数(SPI/SPEI)" icon={Sun}>
        <div className="text-xs text-gw-muted space-y-2 leading-relaxed">
          <p><strong className="text-gw-text">SPI</strong>：标准降水指数，将降水序列拟合Gamma分布后转换为标准正态变量。SPI &lt; -1为干旱，&lt; -2为极端干旱。</p>
          <p><strong className="text-gw-text">SPEI</strong>：标准降水蒸散指数，在SPI基础上引入蒸散发（水分平衡P-PET），更能反映变暖条件下的干旱加剧。</p>
          <p><strong className="text-gw-text">干旱传导</strong>：气象干旱(SPI)→土壤水分干旱→水文干旱(SPEI)通常滞后3-6个月。</p>
        </div>
      </CollapsiblePanel>

      <CollapsiblePanel title="CMIP气候情景" icon={Thermometer}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gw-muted text-[10px] border-b border-gw-border">
                <th className="text-left py-1 px-2">情景</th>
                <th className="text-center py-1 px-2">升温(℃)</th>
                <th className="text-center py-1 px-2">降水变化</th>
                <th className="text-left py-1 px-2">描述</th>
              </tr>
            </thead>
            <tbody className="text-gw-text">
              {Object.entries(SCENARIO_PARAMS).filter(([k]) => k !== 'historical').map(([key, val]) => (
                <tr key={key} className="border-b border-gw-border/50">
                  <td className="py-1 px-2" style={{ color: val.color }}>{val.label}</td>
                  <td className="py-1 px-2 text-center text-red-400">+{val.deltaTemp}</td>
                  <td className="py-1 px-2 text-center">{val.deltaPrecip > 0 ? '+' : ''}{val.deltaPrecip}%</td>
                  <td className="py-1 px-2 text-[10px]">{key.startsWith('rcp') ? 'CMIP5代表性浓度路径' : 'CMIP6共享社会经济路径'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsiblePanel>

      <DataSourceNote source="IPCC AR6 (2021) Working Group I | CMIP6数据计划 | 中国气象局国家气候中心 | 河北省气候变化监测公报(2023) | Bredenkamp (1970) | McKee et al. (1993) SPI | Vicente-Serrano et al. (2010) SPEI" />
    </div>
  );
}

// ── 主组件 ──
export function ClimateImpactTab() {
  const [activePanel, setActivePanel] = useState<number>(0);

  const comprehensive = useMemo(() => {
    const historical = generateHistoricalClimate();
    const projections = (['rcp45', 'rcp85', 'ssp585'] as ClimateScenario[]).map(sc => {
      const params = SCENARIO_PARAMS[sc];
      return downscaleDelta(historical, params.deltaTemp, params.deltaPrecip, 2025, 2075, sc);
    });
    const droughtIndices = calcSPEI(
      historical.map(d => d.annualPrecip),
      historical.map(d => d.pet),
    );
    return calcComprehensiveClimate(historical, projections, droughtIndices);
  }, []);

  const panels = [
    { key: 0, label: '气候降尺度', icon: CloudRain },
    { key: 1, label: '补给量预测', icon: Droplets },
    { key: 2, label: '干旱指数', icon: Sun },
    { key: 3, label: '适应策略', icon: Shield },
    { key: 4, label: '参考说明', icon: BookOpen },
  ];

  return (
    <div className="space-y-4">
      {/* 综合评估卡片 */}
      <TechCard>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-3 bg-gw-surface rounded-lg">
            <div className="text-[10px] text-gw-muted">风险等级</div>
            <div className="text-xl font-bold" style={{ color: RISK_LEVEL_COLORS[comprehensive.riskLevel] }}>
              {RISK_LEVEL_LABELS[comprehensive.riskLevel]}
            </div>
          </div>
          <div className="text-center p-3 bg-gw-surface rounded-lg">
            <div className="text-[10px] text-gw-muted">最坏情景升温</div>
            <div className="text-xl font-bold text-red-400">+4.5℃</div>
            <div className="text-[9px] text-gw-muted">SSP5-8.5</div>
          </div>
          <div className="text-center p-3 bg-gw-surface rounded-lg">
            <div className="text-[10px] text-gw-muted">补给量最大降幅</div>
            <div className="text-xl font-bold text-amber-400">-15%</div>
            <div className="text-[9px] text-gw-muted">SSP5-8.5</div>
          </div>
          <div className="text-center p-3 bg-gw-surface rounded-lg">
            <div className="text-[10px] text-gw-muted">适应策略数</div>
            <div className="text-xl font-bold text-green-400">{comprehensive.strategies.length}</div>
            <div className="text-[9px] text-gw-muted">5大类</div>
          </div>
        </div>

        <div className="mt-3 space-y-1">
          <div className="text-[10px] text-gw-muted mb-1">关键发现：</div>
          {comprehensive.keyFindings.slice(0, 5).map((f, idx) => (
            <div key={idx} className="flex items-start gap-2 text-[11px] text-gw-text">
              <span className="text-gw-blue mt-0.5">{idx + 1}.</span>
              <span>{f}</span>
            </div>
          ))}
        </div>
      </TechCard>

      {/* 面板切换 */}
      <div className="flex gap-1 bg-gw-surface rounded-lg p-1 overflow-x-auto scrollbar-none">
        {panels.map(p => (
          <button key={p.key} onClick={() => setActivePanel(p.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs transition-all whitespace-nowrap ${
              activePanel === p.key
                ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30'
                : 'text-gw-muted hover:text-gw-text'
            }`}
          >
            <p.icon size={14} />
            {p.label}
          </button>
        ))}
      </div>

      {activePanel === 0 && <DownscalingPanel />}
      {activePanel === 1 && <RechargePanel />}
      {activePanel === 2 && <DroughtPanel />}
      {activePanel === 3 && <AdaptationPanel />}
      {activePanel === 4 && <ReferencePanel />}
    </div>
  );
}
