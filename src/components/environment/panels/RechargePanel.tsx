/**
 * B-37 气候变化对地下水影响评估器 Tab
 *
 * 5大面板：
 *  1. 气候降尺度 — 历史气候数据+GCM降尺度+降水/气温趋势
 *  2. 补给量预测 — 降水-补给关系+多情景补给变化
 *  3. 干旱指数 — SPI/SPEI计算+干旱分级+传导滞后
 *  4. 适应策略 — 策略库+情景匹配+优先级排序
 *  5. 参考说明 — 降尺度方法+补给公式+干旱指数+GCM情景
 * 面板组件：RechargePanel（拆分自 ClimateImpactTab.tsx）
 */

import { useMemo } from 'react';
import { LineChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart } from 'recharts';
import { Droplets } from 'lucide-react';
import { TechCard } from '../../UI';
import { generateHistoricalClimate, SCENARIO_PARAMS, downscaleDelta, calcRechargeBredenkamp, calcRechargeWaterBalance, type ClimateScenario } from '../../../utils/climateImpactCalculator';
import { TOOLTIP_STYLE } from './climateImpactConstants';

// ── 面板2: 补给量预测 ──
export function RechargePanel() {
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
