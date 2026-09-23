/**
 * B-37 气候变化对地下水影响评估器 Tab
 *
 * 5大面板：
 *  1. 气候降尺度 — 历史气候数据+GCM降尺度+降水/气温趋势
 *  2. 补给量预测 — 降水-补给关系+多情景补给变化
 *  3. 干旱指数 — SPI/SPEI计算+干旱分级+传导滞后
 *  4. 适应策略 — 策略库+情景匹配+优先级排序
 *  5. 参考说明 — 降尺度方法+补给公式+干旱指数+GCM情景
 * 面板组件：DownscalingPanel（拆分自 ClimateImpactTab.tsx）
 */

import { useState, useMemo } from 'react';
import { LineChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart } from 'recharts';
import { CloudRain } from 'lucide-react';
import { TechCard } from '../../UI';
import { generateHistoricalClimate, SCENARIO_PARAMS, downscaleDelta, type ClimateScenario } from '../../../utils/climateImpactCalculator';
import { TOOLTIP_STYLE } from './climateImpactConstants';

// ── 面板1: 气候降尺度 ──
export function DownscalingPanel() {
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
