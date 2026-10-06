/**
 * B-20 地下水同位素年龄估算 Tab
 *
 * 5大面板：
 *  1. ³H年龄 — 活塞流/指数模型衰变年龄
 *  2. ¹⁴C年龄 — δ¹³C校正/稀释校正
 *  3. ⁴He年龄 — He累积法定年
 *  4. 补给温度 — δ²H-δ¹⁸O关系估算补给温度/高程
 *  5. 预设监测点 — 8组河北平原同位素数据对比
 * 面板: Carbon14Panel（拆分自 IsotopeAgeTab.tsx）
 */
import { type Carbon14Input, calcCarbon14Age } from '../../../utils/isotopeAgeCalculator';
import { ChartExport } from '../../ChartExport';
import { LazyChartCard } from '../../LazyChartCard';
import { TechCard, StatCard } from '../../UI';
import { Calculator } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Cell, XAxis, CartesianGrid, YAxis, Tooltip, BarChart, ResponsiveContainer, Bar } from 'recharts';
import { AGE_COLORS, TOOLTIP_STYLE } from './isotopeAgeConstants';

export function Carbon14Panel() {
  const [name, setName] = useState('自定义监测点');
  const [measuredPMC, setMeasuredPMC] = useState(15);
  const [initialPMC, setInitialPMC] = useState(100);
  const [delta13C, setDelta13C] = useState(-6);
  const [rechargeDelta13C, setRechargeDelta13C] = useState(-13);
  const [dilutionFactor, setDilutionFactor] = useState(0.15);

  const input: Carbon14Input = { name, measuredPMC, initialPMC, delta13C, rechargeDelta13C, dilutionFactor };
  const result = useMemo(() => calcCarbon14Age(input), [input]);

  const ageData = useMemo(() => [
    { name: '未校正', 年龄: result.rawAge, fill: '#6b7280' },
    { name: 'δ¹³C校正', 年龄: result.correctedAge, fill: '#3b82f6' },
    { name: '稀释校正', 年龄: result.dilutionCorrectedAge, fill: '#f59e0b' },
    { name: '推荐年龄', 年龄: result.recommendedAge, fill: '#10b981' },
  ], [result]);

  return (
    <div className="space-y-4">
      <TechCard title="¹⁴C年龄校正计算" icon={Calculator}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="col-span-2">
            <label className="text-xs text-gw-muted block mb-1">监测点名称</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">实测¹⁴C (pmc)</label>
            <input type="number" value={measuredPMC} onChange={e => setMeasuredPMC(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">初始¹⁴C A₀ (pmc)</label>
            <input type="number" value={initialPMC} onChange={e => setInitialPMC(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">实测δ¹³C (‰)</label>
            <input type="number" value={delta13C} onChange={e => setDelta13C(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">补给区δ¹³C (‰)</label>
            <input type="number" value={rechargeDelta13C} onChange={e => setRechargeDelta13C(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">碳酸盐稀释系数</label>
            <input type="number" step="0.01" value={dilutionFactor} onChange={e => setDilutionFactor(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
        </div>
      </TechCard>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="未校正年龄" value={result.rawAge} unit="a BP" accent="text-gray-400" />
        <StatCard title="δ¹³C校正年龄" value={result.correctedAge} unit="a BP" accent="text-blue-400" />
        <StatCard title="稀释校正年龄" value={result.dilutionCorrectedAge} unit="a BP" accent="text-amber-400" />
        <div className="bg-gw-card-alt rounded-lg p-3 flex flex-col justify-center items-center">
          <span className="text-xs text-gw-muted mb-1">推荐年龄/分级</span>
          <span className="text-lg font-bold text-emerald-400">{result.recommendedAge}</span>
          <span className="text-xs" style={{ color: AGE_COLORS[result.ageGrade] ?? '#6b7280' }}>{result.ageGrade}</span>
        </div>
      </div>

      <LazyChartCard title="不同校正方法年龄对比">
        <ChartExport data={ageData} filename="14C年龄校正对比" />
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={ageData} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'a BP', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Bar dataKey="年龄" radius={[4, 4, 0, 0]}>
              {ageData.map((entry, idx) => (
                <Cell key={idx} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <div className="bg-gw-card-alt rounded-lg p-3">
        <p className="text-xs text-gw-muted leading-relaxed">
          <strong className="text-gw-text">校正说明：</strong>
          {' '}{result.note}
          {' '}¹⁴C半衰期5730a，适用于500~50000a范围的地下水定年。
          {' '}δ¹³C校正用于消除碳酸盐溶解对¹⁴C稀释的影响；
          {' '}稀释校正扣除死碳（无放射性碳的碳酸盐）的贡献。
          {' '}实际应用中应结合水文地质条件选择适当的校正方法。
        </p>
      </div>
    </div>
  );
}
