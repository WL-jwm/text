/**
 * B-18 矿坑涌水量预测计算器 Tab
 *
 * 4大面板：
 *  1. 大井法 — 稳定流涌水量计算（潜水/承压/承压转无压）
 *  2. 疏干排水 — 非稳定流Theis修正 + 时间-涌水量曲线
 *  3. 影响半径 — Kusakin/Sichardt/修正公式
 *  4. 预设矿区 — 6个河北典型矿区对比 + 涌水量分级
 * 面板: RadiusPanel（拆分自 MineInflowTab.tsx）
 */
import { type RadiusInput, RADIUS_METHODS, calcInfluenceRadius } from '../../../utils/mineInflowCalculator';
import { ChartExport } from '../../ChartExport';
import { FilterableTechTable } from '../../FilterableTechTable';
import { LazyChartCard } from '../../LazyChartCard';
import { StatCard, TechCard } from '../../UI';
import { Mountain } from 'lucide-react';
import { useMemo, useState } from 'react';
import { BarChart, XAxis, CartesianGrid, Tooltip, YAxis, Bar, ResponsiveContainer } from 'recharts';
import { TOOLTIP_STYLE } from './mineInflowConstants';

export function RadiusPanel() {
  const [K, setK] = useState(0.85);
  const [drawdown, setDrawdown] = useState(150);
  const [equivalentRadius, setEquivalentRadius] = useState(800);
  const [method, setMethod] = useState<RadiusInput['method']>('kusakin_modified');

  const input: RadiusInput = { K, drawdown, equivalentRadius, method };
  const result = useMemo(() => calcInfluenceRadius(input), [input]);

  // 多方法对比
  const compareData = useMemo(() => {
    const methods: RadiusInput['method'][] = ['kusakin', 'sichardt', 'kusakin_modified'];
    return methods.map(m => {
      const r = calcInfluenceRadius({ K, drawdown, equivalentRadius, method: m });
      return { method: r.description, 影响半径: r.R, 公式: r.formula };
    });
  }, [K, drawdown, equivalentRadius]);

  return (
    <div className="space-y-4">
      <TechCard title="影响半径计算" icon={Mountain}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div>
            <label className="text-xs text-gw-muted block mb-1">渗透系数 K (m/d)</label>
            <input type="number" step="0.01" value={K} onChange={e => setK(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">降深 s (m)</label>
            <input type="number" value={drawdown} onChange={e => setDrawdown(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">等效半径 r0 (m)</label>
            <input type="number" value={equivalentRadius} onChange={e => setEquivalentRadius(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">计算方法</label>
            <select value={method} onChange={e => setMethod(e.target.value as RadiusInput['method'])}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text">
              <option value="kusakin">Kusakin (库萨金)</option>
              <option value="sichardt">Sichardt (席哈尔)</option>
              <option value="kusakin_modified">修正库萨金 (含r0)</option>
            </select>
          </div>
        </div>
      </TechCard>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard title="影响半径 R" value={result.R} unit="m" accent="text-amber-400" />
        <StatCard title="采用公式" value={result.formula} accent="text-blue-400" />
        <StatCard title="方法说明" value={result.description} accent="text-violet-400" />
      </div>

      <LazyChartCard title="三种方法影响半径对比">
        <ChartExport data={compareData} filename="影响半径方法对比" />
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={compareData} margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="method" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-15} textAnchor="end" height={60} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'm', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Bar dataKey="影响半径" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <FilterableTechTable
        headers={['方法', '公式', '适用条件', '说明']}
        rows={RADIUS_METHODS.map(r => [r.method, r.formula, r.applicable, r.description])}
      />

      <div className="bg-gw-card-alt rounded-lg p-4">
        <p className="text-xs text-gw-muted leading-relaxed">
          <strong className="text-gw-text">影响半径的工程意义：</strong>
          {' '}影响半径R是矿坑排水后水位下降漏斗的外边界，直接影响涌水量计算结果。
          {' '}库萨金公式适用于潜水或承压水，席哈尔公式主要用于承压含水层。
          {' '}修正库萨金公式考虑了矿坑系统本身的半径r0，更符合矿坑排水实际情况。
          {' '}实际工程中应结合抽水试验观测数据校核经验公式计算结果。
        </p>
      </div>
    </div>
  );
}
