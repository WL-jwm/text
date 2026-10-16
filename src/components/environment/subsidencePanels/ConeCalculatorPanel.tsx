/**
 * B-12 地面沉降与降落漏斗分析 Tab
 *
 * 4大面板：
 *  1. 漏斗计算器 — 水文地质参数输入→漏斗半径/降深/体积
 *  2. 沉降估算 — 土层参数→分层沉降量+总沉降
 *  3. 趋势分析 — 历史沉降趋势+预测
 *  4. 沉降风险 — 河北典型沉降区+风险分区
 * 面板: ConeCalculatorPanel（拆分自 SubsidenceTab.tsx）
 */
import { type ConeInput, type FlowModel, calcCone, TYPICAL_CONE_INPUTS } from '../../../utils/subsidenceCalculator';
import { LazyChartCard } from '../../LazyChartCard';
import { TechCard } from '../../UI';
import { Droplets, Calculator } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CartesianGrid, BarChart, Bar, Tooltip, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { TOOLTIP_STYLE } from './subsidenceConstants';

export function ConeCalculatorPanel() {
  const [Q, setQ] = useState(3000);
  const [K, setK] = useState(12.5);
  const [M, setM] = useState(40);
  const [S, setS] = useState(0.1);
  const [rw, setRw] = useState(0.3);
  const [t, setT] = useState(365);
  const [model, setModel] = useState<FlowModel>('Dupuit');

  const T = K * M;
  const input: ConeInput = { Q, T, S, M, rw, t, K, model };
  const result = useMemo(() => calcCone(input), [Q, K, M, S, rw, t, model, T]);

  const presetOptions = TYPICAL_CONE_INPUTS;

  const loadPreset = (preset: typeof presetOptions[number]) => {
    setQ(preset.input.Q);
    setK(preset.input.K);
    setM(preset.input.M);
    setS(preset.input.S);
    setRw(preset.input.rw);
    setT(preset.input.t);
    setModel(preset.input.model);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TechCard icon={Droplets} title="漏斗计算参数" badge="输入">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs text-gw-muted">开采量 Q (m³/d)</label>
              <input type="number" step="any" value={Q} onChange={e => setQ(Number(e.target.value) || 0)}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm" />
            </div>
            <div>
              <label className="text-xs text-gw-muted">渗透系数 K (m/d)</label>
              <input type="number" step="any" value={K} onChange={e => setK(Number(e.target.value) || 0)}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm" />
            </div>
            <div>
              <label className="text-xs text-gw-muted">含水层厚 M (m)</label>
              <input type="number" step="any" value={M} onChange={e => setM(Number(e.target.value) || 0)}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm" />
            </div>
            <div>
              <label className="text-xs text-gw-muted">储水系数 S</label>
              <input type="number" step="any" value={S} onChange={e => setS(Number(e.target.value) || 0)}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm" />
            </div>
            <div>
              <label className="text-xs text-gw-muted">井半径 rw (m)</label>
              <input type="number" step="any" value={rw} onChange={e => setRw(Number(e.target.value) || 0)}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm" />
            </div>
            <div>
              <label className="text-xs text-gw-muted">抽水时间 t (d)</label>
              <input type="number" step="any" value={t} onChange={e => setT(Number(e.target.value) || 0)}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gw-muted">计算模型</label>
            <select value={model} onChange={e => setModel(e.target.value as FlowModel)}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm">
              <option value="Dupuit">Dupuit稳定流（长期开采）</option>
              <option value="Theis">Theis非稳定流（短期/初始）</option>
              <option value="经验公式">经验公式法（初步估算）</option>
            </select>
          </div>
          <div className="mt-2">
            <span className="text-xs text-gw-muted">导水系数 T = K×M = {T.toLocaleString()} m²/d</span>
          </div>
          {/* 预设快捷加载 */}
          <div className="mt-2">
            <label className="text-xs text-gw-muted">快捷加载预设</label>
            <div className="flex flex-wrap gap-1 mt-1">
              {presetOptions.map(p => (
                <button key={p.name} onClick={() => loadPreset(p)}
                  className="px-2 py-1 rounded text-[10px] bg-gw-surface border border-gw-border/30 text-gw-muted hover:bg-gw-border/30 transition-all">
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </TechCard>

        {/* 结果区 */}
        <TechCard icon={Calculator} title="漏斗计算结果" badge={result.modelNote}>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="p-3 rounded-lg bg-gw-surface">
              <div className="text-xs text-gw-muted">井中降深</div>
              <div className="text-2xl font-bold text-blue-400 mt-1">{result.drawdown}<span className="text-xs ml-1">m</span></div>
            </div>
            <div className="p-3 rounded-lg bg-gw-surface">
              <div className="text-xs text-gw-muted">影响半径</div>
              <div className="text-2xl font-bold text-amber-400 mt-1">{result.influenceRadius.toLocaleString()}<span className="text-xs ml-1">m</span></div>
            </div>
            <div className="p-3 rounded-lg bg-gw-surface">
              <div className="text-xs text-gw-muted">漏斗体积</div>
              <div className="text-lg font-bold text-violet-400 mt-1">{result.coneVolume.toLocaleString()}<span className="text-xs ml-1">m³</span></div>
            </div>
            <div className="p-3 rounded-lg bg-gw-surface">
              <div className="text-xs text-gw-muted">漏斗面积</div>
              <div className="text-lg font-bold text-red-400 mt-1">{result.coneArea}<span className="text-xs ml-1">km²</span></div>
            </div>
          </div>
        </TechCard>
      </div>

      {/* 降深剖面图 */}
      <LazyChartCard title="降深-距离剖面" height={320}>
        <ResponsiveContainer width="100%" height={270}>
          <BarChart data={result.drawdownProfile.filter(d => d.drawdown > 0)} margin={{ top: 5, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="distance" tick={{ fontSize: 10, fill: '#9ca3af' }} label={{ value: '距离 (m)', position: 'bottom', offset: -5, fontSize: 10, fill: '#9ca3af' }} />
            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} label={{ value: '降深 (m)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#9ca3af' }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Bar dataKey="drawdown" name="降深" radius={[2, 2, 0, 0]}>
              {result.drawdownProfile.filter(d => d.drawdown > 0).map((entry, idx) => (
                <Cell key={idx} fill={idx === 0 ? '#3b82f6' : '#f59e0b'} opacity={Math.max(0.3, 1 - idx * 0.08)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </LazyChartCard>
    </div>
  );
}
