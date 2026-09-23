/**
 * B-37 气候变化对地下水影响评估器 Tab
 *
 * 5大面板：
 *  1. 气候降尺度 — 历史气候数据+GCM降尺度+降水/气温趋势
 *  2. 补给量预测 — 降水-补给关系+多情景补给变化
 *  3. 干旱指数 — SPI/SPEI计算+干旱分级+传导滞后
 *  4. 适应策略 — 策略库+情景匹配+优先级排序
 *  5. 参考说明 — 降尺度方法+补给公式+干旱指数+GCM情景
 * 面板组件：DroughtPanel（拆分自 ClimateImpactTab.tsx）
 */

import { useMemo } from 'react';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend, ComposedChart } from 'recharts';
import { TechCard } from '../../UI';
import { FilterableTechTable } from '../../FilterableTechTable';
import { generateHistoricalClimate, DROUGHT_CLASS_LABELS, DROUGHT_CLASS_COLORS, calcSPEI } from '../../../utils/climateImpactCalculator';
import { TOOLTIP_STYLE } from './climateImpactConstants';

// ── 面板3: 干旱指数 ──
export function DroughtPanel() {
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
