/**
 * B-21 裂隙水涌水量估算计算器 Tab
 *
 * 4大面板：
 *  1. 大井法 — 完整井/非完整井，承压/潜水公式
 *  2. 裂隙率法 — Kf估算 + Q = Kf×I×F
 *  3. 径流模数法 — 经验公式按岩性分区
 *  4. 预设岩性 — 6种岩性对比 + 干扰分析 + 参考表
 * 面板: PresetPanel（拆分自 FractureWaterCalculatorTab.tsx）
 */
import { type InterferenceInput, calcFractureSummary, calcAllPresetBigWell, PRESET_LITHOLOGIES, calcInterference, calcAllPresetRunoff } from '../../../utils/fractureWaterCalculator';
import { ChartExport } from '../../ChartExport';
import { FilterableTechTable } from '../../FilterableTechTable';
import { LazyChartCard } from '../../LazyChartCard';
import { TechCard, StatCard } from '../../UI';
import { GitBranch } from 'lucide-react';
import { useState, useMemo } from 'react';
import { BarChart, Tooltip, ResponsiveContainer, Bar, Legend, CartesianGrid, XAxis, YAxis } from 'recharts';
import { GRADE_COLORS, TOOLTIP_STYLE } from './fractureConstants';

export function PresetPanel() {
  const [showInterference, setShowInterference] = useState(false);
  const [wellCount, setWellCount] = useState(5);
  const [singleWellQ, setSingleWellQ] = useState(300);
  const [wellSpacing, setWellSpacing] = useState(500);
  const [singleRadius, setSingleRadius] = useState(1500);
  const [K, setK] = useState(0.25);
  const [M, setM] = useState(80);

  const bigWellResults = useMemo(() => calcAllPresetBigWell(), []);
  const summary = useMemo(() => calcFractureSummary(), []);

  const interferenceInput: InterferenceInput = {
    name: '群孔干扰分析', wellCount, singleWellQ, wellSpacing, singleRadius, K, M,
  };
  const interferenceResult = useMemo(() => calcInterference(interferenceInput), [interferenceInput]);

  const compareData = useMemo(() => PRESET_LITHOLOGIES.map((l, i) => ({
    name: l.rockType,
    大井法: bigWellResults[i].Qh,
    径流模数法: calcAllPresetRunoff()[i].Qh,
    fill: GRADE_COLORS[bigWellResults[i].grade] ?? '#6b7280',
  })), [bigWellResults]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="岩性类型数" value={summary.lithologyCount} unit="种" accent="text-blue-400" />
        <StatCard title="大井法总涌水量" value={summary.totalBigWell} unit="m³/h" accent="text-cyan-400" />
        <StatCard title="径流模数法总涌水量" value={summary.totalRunoff} unit="m³/h" accent="text-amber-400" />
        <StatCard title="高涌水量岩性" value={summary.highYieldCount} unit="种" accent="text-red-400" subtitle="大/极大" />
      </div>

      <LazyChartCard title="各岩性大井法 vs 径流模数法涌水量对比">
        <ChartExport data={compareData} filename="岩性涌水量对比" />
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={compareData} margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-25} textAnchor="end" height={70} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'm³/h', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="大井法" fill="#3b82f6" radius={[3, 3, 0, 0]} />
            <Bar dataKey="径流模数法" fill="#f59e0b" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <FilterableTechTable
        headers={['岩性', '位置', 'Kf(m/d)', 'M(m)', '裂隙率(%)', '开度', '密度(条/m)', '径流模数', '大井法Q(m³/h)', '等级', '备注']}
        rows={PRESET_LITHOLOGIES.map((l, i) => [
          l.rockType, l.location, l.Kf, l.M, (l.fractureRatio * 100).toFixed(2),
          l.fractureAperture, l.fractureDensity, l.runoffModulus,
          bigWellResults[i].Qh, bigWellResults[i].grade, l.note,
        ])}
      />

      {/* 群孔干扰分析 */}
      <TechCard title="群孔干扰降深预测" icon={GitBranch}>
        <button
          onClick={() => setShowInterference(!showInterference)}
          className="mb-3 px-3 py-1.5 rounded-lg text-sm bg-gw-card-alt text-gw-muted hover:text-gw-text"
        >
          {showInterference ? '收起干扰分析' : '展开干扰分析'}
        </button>
        {showInterference && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <div>
                <label className="text-xs text-gw-muted block mb-1">群孔数量</label>
                <input type="number" value={wellCount} onChange={e => setWellCount(parseInt(e.target.value) || 0)}
                  className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
              </div>
              <div>
                <label className="text-xs text-gw-muted block mb-1">单孔涌水量 (m³/d)</label>
                <input type="number" value={singleWellQ} onChange={e => setSingleWellQ(parseFloat(e.target.value) || 0)}
                  className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
              </div>
              <div>
                <label className="text-xs text-gw-muted block mb-1">孔间距 d (m)</label>
                <input type="number" value={wellSpacing} onChange={e => setWellSpacing(parseFloat(e.target.value) || 0)}
                  className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
              </div>
              <div>
                <label className="text-xs text-gw-muted block mb-1">单孔影响半径 R (m)</label>
                <input type="number" value={singleRadius} onChange={e => setSingleRadius(parseFloat(e.target.value) || 0)}
                  className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
              </div>
              <div>
                <label className="text-xs text-gw-muted block mb-1">渗透系数 K (m/d)</label>
                <input type="number" step="0.01" value={K} onChange={e => setK(parseFloat(e.target.value) || 0)}
                  className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
              </div>
              <div>
                <label className="text-xs text-gw-muted block mb-1">含水层厚度 M (m)</label>
                <input type="number" value={M} onChange={e => setM(parseFloat(e.target.value) || 0)}
                  className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard title="理论总量" value={interferenceResult.theoreticalQ} unit="m³/d" accent="text-gray-400" />
              <StatCard title="实际总量" value={interferenceResult.totalQ} unit="m³/d" accent="text-blue-400" />
              <StatCard title="折减系数" value={interferenceResult.reductionFactor} accent="text-amber-400" />
              <div className="bg-gw-card-alt rounded-lg p-3 flex flex-col justify-center items-center">
                <span className="text-xs text-gw-muted mb-1">干扰评价</span>
                <span className="text-sm font-bold text-orange-400">{interferenceResult.interferenceLevel}</span>
              </div>
            </div>

            <div className="bg-gw-card-alt rounded-lg p-3 mt-2">
              <p className="text-xs text-gw-muted leading-relaxed">{interferenceResult.note}</p>
            </div>
          </>
        )}
      </TechCard>
    </div>
  );
}
