/**
 * B-13 咸水入侵风险评价 Tab
 *
 * 4大面板：
 *  1. 风险计算器 — Cl⁻输入+界面参数→综合评分
 *  2. 监测井预警 — 预设8个监测井风险排名
 *  3. 预测趋势 — Cl⁻浓度线性外推预测
 *  4. 防治参考 — 风险等级对应措施
 * 面板: PredictPanel（拆分自 IntrusionRiskTab.tsx）
 */
import { predictChloride, CL_STANDARD_III } from '../../../utils/intrusionRiskCalculator';
import { ChartExport } from '../../ChartExport';
import { LazyChartCard } from '../../LazyChartCard';
import { TechCard } from '../../UI';
import { TrendingUp } from 'lucide-react';
import { useState, useMemo } from 'react';
import { YAxis, XAxis, CartesianGrid, Legend, Bar, Tooltip, ResponsiveContainer, BarChart, Cell } from 'recharts';
import { TOOLTIP_STYLE } from './intrusionConstants';

export function PredictPanel() {
  const [baseCl, setBaseCl] = useState(85);
  const [rateCl, setRateCl] = useState(15);
  const [predictYears, setPredictYears] = useState(5);
  const startYear = 2024;

  const predictData = useMemo(() => predictChloride(baseCl, rateCl, predictYears, startYear), [baseCl, rateCl, predictYears]);

  return (
    <div className="space-y-4">
      <TechCard icon={TrendingUp} title="Cl⁻浓度变化预测" badge="线性外推">
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div>
            <label className="text-xs text-gw-muted">基准Cl⁻ (mg/L)</label>
            <input type="number" step="any" value={baseCl} onChange={e => setBaseCl(Number(e.target.value) || 0)}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm" />
          </div>
          <div>
            <label className="text-xs text-gw-muted">年均变化率 (mg/L/a)</label>
            <input type="number" step="any" value={rateCl} onChange={e => setRateCl(Number(e.target.value) || 0)}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm" />
          </div>
          <div>
            <label className="text-xs text-gw-muted">预测年数</label>
            <input type="number" step="1" value={predictYears} onChange={e => setPredictYears(Number(e.target.value) || 1)}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm" />
          </div>
        </div>
      </TechCard>

      <LazyChartCard title="Cl⁻浓度预测趋势" height={360}>
        <div className="mb-2 flex justify-end">
          <ChartExport data={predictData} filename="Cl浓度预测" sheetName="预测" formats={['xlsx', 'csv', 'json']} label="导出数据" />
        </div>
        <ResponsiveContainer width="100%" height={290}>
          <BarChart data={predictData} margin={{ top: 5, right: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#9ca3af' }} />
            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} unit=" mg/L" />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="clValue" name="Cl⁻ (mg/L)" radius={[2, 2, 0, 0]}>
              {predictData.map((entry, idx) => (
                <Cell key={idx} fill={entry.isPredicted ? '#f59e0b' : '#3b82f6'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-4 mt-1 text-[10px] text-gw-muted">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500 inline-block" />实际数据</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500 inline-block" />预测数据</span>
          <span>III类标准线: {CL_STANDARD_III}mg/L</span>
        </div>
      </LazyChartCard>
    </div>
  );
}
