/**
 * B-21 裂隙水涌水量估算计算器 Tab
 *
 * 4大面板：
 *  1. 大井法 — 完整井/非完整井，承压/潜水公式
 *  2. 裂隙率法 — Kf估算 + Q = Kf×I×F
 *  3. 径流模数法 — 经验公式按岩性分区
 *  4. 预设岩性 — 6种岩性对比 + 干扰分析 + 参考表
 * 面板: RunoffPanel（拆分自 FractureWaterCalculatorTab.tsx）
 */
import { type RunoffModulusInput, PRESET_LITHOLOGIES, calcAllPresetRunoff, calcRunoffModulus, RUNOFF_MODULUS_REF } from '../../../utils/fractureWaterCalculator';
import { ChartExport } from '../../ChartExport';
import { FilterableTechTable } from '../../FilterableTechTable';
import { LazyChartCard } from '../../LazyChartCard';
import { TechCard, StatCard } from '../../UI';
import { Activity } from 'lucide-react';
import { useState, useMemo } from 'react';
import { BarChart, Tooltip, ResponsiveContainer, Bar, Legend, CartesianGrid, XAxis, YAxis } from 'recharts';
import { FRACTURE_COLORS, TOOLTIP_STYLE } from './fractureConstants';

export function RunoffPanel() {
  const [name, setName] = useState('自定义评价区');
  const [lithology, setLithology] = useState('砂岩类');
  const [runoffModulus, setRunoffModulus] = useState(3.5);
  const [area, setArea] = useState(100);
  const [guaranteeFactor, setGuaranteeFactor] = useState(0.75);

  const input: RunoffModulusInput = { name, lithology, runoffModulus, area, guaranteeFactor };
  const result = useMemo(() => calcRunoffModulus(input), [input]);

  const presets = useMemo(() => calcAllPresetRunoff(), []);
  const compareData = useMemo(() => PRESET_LITHOLOGIES.map((l, i) => ({
    name: l.rockType,
    径流模数: l.runoffModulus,
    涌水量: presets[i].Qh,
    fill: FRACTURE_COLORS[
      l.runoffModulus < 1 ? '极弱' :
      l.runoffModulus < 3 ? '弱' :
      l.runoffModulus < 5 ? '中等' :
      l.runoffModulus < 8 ? '强' : '极强'
    ] ?? '#6b7280',
  })), [presets]);

  return (
    <div className="space-y-4">
      <TechCard title="经验径流模数法参数" icon={Activity}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="col-span-2">
            <label className="text-xs text-gw-muted block mb-1">评价区名称</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">岩性类型</label>
            <select value={lithology} onChange={e => setLithology(e.target.value)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text">
              {RUNOFF_MODULUS_REF.map(r => (
                <option key={r.rockType} value={r.rockType}>{r.rockType} (M={r.avg})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">径流模数 M (L/s·km²)</label>
            <input type="number" step="0.1" value={runoffModulus} onChange={e => setRunoffModulus(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">汇水面积 F (km²)</label>
            <input type="number" value={area} onChange={e => setArea(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">保证率修正系数</label>
            <input type="number" step="0.05" value={guaranteeFactor} onChange={e => setGuaranteeFactor(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
        </div>
      </TechCard>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="涌水量 Q" value={result.Q} unit="m³/d" accent="text-blue-400" />
        <StatCard title="涌水量 Q" value={result.Qh} unit="m³/h" accent="text-cyan-400" />
        <StatCard title="年总资源量" value={result.annualResource} unit="万m³/a" accent="text-amber-400" />
        <div className="bg-gw-card-alt rounded-lg p-3 flex flex-col justify-center items-center">
          <span className="text-xs text-gw-muted mb-1">模数等级</span>
          <span className="text-sm font-bold text-blue-400">{result.modulusGrade}</span>
        </div>
      </div>

      <div className="bg-gw-card-alt rounded-lg p-3">
        <p className="text-xs text-gw-muted leading-relaxed">
          <strong className="text-gw-text">计算公式：</strong>
          {' '}Q = M × F × β，其中M为径流模数(L/s·km²)，F为汇水面积(km²)，β为保证率修正系数。
          {' '}径流模数法适用于缺少抽水试验资料的基岩山区，通过经验统计获得不同岩性的产水能力。
        </p>
      </div>

      <LazyChartCard title="各岩性径流模数与涌水量对比">
        <ChartExport data={compareData} filename="岩性径流模数对比" />
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={compareData} margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-25} textAnchor="end" height={70} />
            <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'L/s·km²', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'm³/h', angle: 90, position: 'insideRight', fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar yAxisId="left" dataKey="径流模数" fill="#3b82f6" radius={[3, 3, 0, 0]} />
            <Bar yAxisId="right" dataKey="涌水量" fill="#f59e0b" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <FilterableTechTable
        headers={['岩性类型', '径流模数范围', '均值', '等级', '分布区域']}
        rows={RUNOFF_MODULUS_REF.map(r => [r.rockType, r.range, r.avg, r.grade, r.distribution])}
      />
    </div>
  );
}
