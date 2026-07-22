/**
 * B-12 地面沉降与降落漏斗分析 Tab
 *
 * 4大面板：
 *  1. 漏斗计算器 — 水文地质参数输入→漏斗半径/降深/体积
 *  2. 沉降估算 — 土层参数→分层沉降量+总沉降
 *  3. 趋势分析 — 历史沉降趋势+预测
 *  4. 沉降风险 — 河北典型沉降区+风险分区
 */
import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend,
} from 'recharts';
import { ArrowDown, Calculator, TrendingUp, MapPin, BookOpen, Droplets } from 'lucide-react';
import { TechCard, DataSourceNote } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { ChartExport } from '../ChartExport';
import { FilterableTechTable } from '../FilterableTechTable';
import {
  RISK_ZONES,
  LAYER_TYPES,
  SUBSIDENCE_TREND,
  TYPICAL_CONE_INPUTS,
  SUBSIDENCE_ZONES,
  type ConeInput,
  type SubsidenceInput,
  type FlowModel,
  calcCone,
  calcSubsidence,
  getSubsidenceRisk,
} from '../../utils/subsidenceCalculator';

const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
};

// ── 面板1: 漏斗计算器 ──

function ConeCalculatorPanel() {
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

// ── 面板2: 沉降估算 ──

function SubsidenceCalcPanel() {
  const [layerCount, setLayerCount] = useState(3);
  const [b, _setB] = useState(80);
  const [deltaH, _setDeltaH] = useState(15);
  const [e0, _setE0] = useState(0.8);
  const [Cc, _setCc] = useState(0.15);
  const [sigma0, _setSigma0] = useState(200);
  const [Ss, _setSs] = useState(0.0005);

  const [layerTypes, setLayerTypes] = useState(['粉质黏土', '黏土', '粉土']);
  const [layerThicks, setLayerThicks] = useState([30, 25, 25]);
  const [layerSs, setLayerSs] = useState([0.0005, 0.0008, 0.0003]);
  const [layerDhs, setLayerDhs] = useState([12, 15, 18]);

  const input: SubsidenceInput = {
    b, Ss, deltaH, e0, Cc, sigma0, layerCount,
    layerThicknesses: layerThicks, layerSs, layerDeltaH: layerDhs,
  };
  const result = useMemo(() => calcSubsidence(input), [b, Ss, deltaH, e0, Cc, sigma0, layerCount, ...layerThicks, ...layerSs, ...layerDhs]);

  const updateLayer = (idx: number, type: string) => {
    const info = LAYER_TYPES.find(l => l.name === type);
    if (!info) return;
    const newTypes = [...layerTypes];
    newTypes[idx] = type;
    setLayerTypes(newTypes);
    const newSs = [...layerSs];
    newSs[idx] = info.Ss;
    setLayerSs(newSs);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TechCard icon={ArrowDown} title="土层参数输入" badge="分层估算">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs text-gw-muted">土层数量</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setLayerCount(n)}
                    className={`w-6 h-6 rounded text-xs ${layerCount === n ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30' : 'bg-gw-surface text-gw-muted border border-gw-border/30'}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            {Array.from({ length: layerCount }, (_, i) => (
              <div key={i} className="p-2 rounded-lg bg-gw-surface space-y-1.5">
                <div className="text-[10px] text-gw-muted">第{i + 1}层</div>
                <div className="grid grid-cols-3 gap-1.5">
                  <select value={layerTypes[i] || '粉质黏土'} onChange={e => updateLayer(i, e.target.value)}
                    className="px-2 py-1 rounded bg-gw-bg border border-gw-border/30 text-gw-text text-[10px]">
                    {LAYER_TYPES.map(l => <option key={l.name} value={l.name}>{l.name}</option>)}
                  </select>
                  <input type="number" step="any" value={layerThicks[i] || 0} onChange={e => {
                    const n = [...layerThicks]; n[i] = Number(e.target.value) || 0; setLayerThicks(n);
                  }} className="px-2 py-1 rounded bg-gw-bg border border-gw-border/30 text-gw-text text-[10px]" placeholder="厚(m)" />
                  <input type="number" step="any" value={layerDhs[i] || 0} onChange={e => {
                    const n = [...layerDhs]; n[i] = Number(e.target.value) || 0; setLayerDhs(n);
                  }} className="px-2 py-1 rounded bg-gw-bg border border-gw-border/30 text-gw-text text-[10px]" placeholder="Δh(m)" />
                </div>
              </div>
            ))}
          </div>
        </TechCard>

        <TechCard icon={ArrowDown} title="沉降估算结果" badge={`${result.riskLevel}风险`}>
          <div className="flex flex-col items-center py-4">
            <div className="text-5xl font-bold" style={{ color: result.riskColor }}>{result.totalSubsidence}<span className="text-lg ml-1">mm</span></div>
            <div className="text-sm mt-2 font-semibold" style={{ color: result.riskColor }}>{result.riskLevel}风险</div>
            <div className="text-xs text-gw-muted mt-1 text-center max-w-xs">{result.description}</div>
          </div>
          {result.layerSubsidence.length > 0 && (
            <div className="space-y-1 mt-2">
              {result.layerSubsidence.map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="text-gw-muted w-12">第{i + 1}层</span>
                  <div className="flex-1 h-3 rounded-full bg-gw-surface overflow-hidden">
                    <div className="h-full rounded-full" style={{
                      width: `${Math.min(100, s / Math.max(...result.layerSubsidence) * 100)}%`,
                      backgroundColor: s > 50 ? '#ef4444' : '#3b82f6',
                    }} />
                  </div>
                  <span className="font-mono text-gw-text w-16 text-right">{s}mm</span>
                </div>
              ))}
            </div>
          )}
        </TechCard>
      </div>
    </div>
  );
}

// ── 面板3: 趋势分析 ──

function TrendPanel() {
  const combinedData = SUBSIDENCE_TREND;

  // 累计沉降柱状图
  const barData = useMemo(() =>
    combinedData.map(d => ({
      year: d.year,
      '累计沉降': d.cumulative,
      '年速率': d.rate,
      predicted: d.predicted,
    })),
    [],
  );

  // 沉降区排名
  const sortedZones = [...SUBSIDENCE_ZONES].sort((a, b) => b.cumulative - a.cumulative);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="累计沉降量趋势（1990-2030）" height={360}>
          <div className="mb-2 flex justify-end">
            <ChartExport data={barData} filename="累计沉降趋势" sheetName="沉降趋势" formats={['xlsx', 'csv', 'json']} label="导出数据" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} margin={{ top: 5, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} unit=" mm" />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="累计沉降" name="累计沉降(mm)" radius={[2, 2, 0, 0]}>
                {barData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.predicted ? '#f59e0b' : '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-1 text-[10px] text-gw-muted">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500 inline-block" />实际</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500 inline-block" />预测</span>
          </div>
        </LazyChartCard>

        <LazyChartCard title="年沉降速率变化" height={360}>
          <div className="mb-2 flex justify-end">
            <ChartExport data={barData} filename="年沉降速率" sheetName="沉降速率" formats={['xlsx', 'csv', 'json']} label="导出数据" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} margin={{ top: 5, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} unit=" mm/a" />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="年速率" name="年速率(mm/a)" radius={[2, 2, 0, 0]}>
                {barData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.年速率 > 25 ? '#ef4444' : entry.年速率 > 15 ? '#f59e0b' : '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>

      <TechCard icon={MapPin} title="河北典型沉降区" badge="风险排名">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gw-border">
                <th className="text-left p-2 text-gw-muted">区域</th>
                <th className="text-right p-2 text-gw-muted">累计沉降(mm)</th>
                <th className="text-right p-2 text-gw-muted">年速率(mm/a)</th>
                <th className="text-left p-2 text-gw-muted">风险等级</th>
              </tr>
            </thead>
            <tbody>
              {sortedZones.map(z => {
                const meta = getSubsidenceRisk(z.cumulative);
                return (
                  <tr key={z.name} className="border-b border-gw-border/50 hover:bg-gw-surface/50">
                    <td className="p-2 font-medium text-gw-text">{z.name}</td>
                    <td className="p-2 text-right font-mono font-semibold" style={{ color: meta.riskColor }}>{z.cumulative}</td>
                    <td className="p-2 text-right font-mono text-gw-muted">{z.rate}</td>
                    <td className="p-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: meta.riskColor + '20', color: meta.riskColor }}>
                        {meta.riskLevel}风险
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </TechCard>
    </div>
  );
}

// ── 面板4: 风险参考 ──

function RiskReferencePanel() {
  return (
    <div className="space-y-4">
      <TechCard icon={BookOpen} title="地面沉降风险分区标准">
        <FilterableTechTable
          headers={['风险等级', '累计沉降范围', '特征描述', '防治措施']}
          rows={RISK_ZONES.map(r => [r.name, r.range, r.description, r.measure])}
          filterPlaceholder="搜索等级或措施..."
        />
      </TechCard>

      <TechCard icon={BookOpen} title="土层压缩参数参考">
        <FilterableTechTable
          headers={['土层类型', '储水率Ss(1/m)', '孔隙比e0', '压缩指数Cc']}
          rows={LAYER_TYPES.map(l => [l.name, String(l.Ss), String(l.e0), String(l.Cc)])}
          filterPlaceholder="搜索土层..."
        />
      </TechCard>

      <TechCard icon={Calculator} title="公式说明">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-gw-surface">
            <p className="font-medium text-gw-text mb-1">Dupuit稳定流</p>
            <p className="text-blue-400 font-mono">s = Q/(2πT)·ln(R/r)</p>
            <p className="text-gw-muted mt-1">适用于长期开采稳定状态</p>
          </div>
          <div className="p-3 rounded-lg bg-gw-surface">
            <p className="font-medium text-gw-text mb-1">Theis非稳定流</p>
            <p className="text-blue-400 font-mono">s = Q/(4πT)·W(u)</p>
            <p className="text-gw-muted mt-1">u = r²S/(4Tt)，W(u)为井函数</p>
          </div>
          <div className="p-3 rounded-lg bg-gw-surface">
            <p className="font-medium text-gw-text mb-1">地面沉降（储水率法）</p>
            <p className="text-blue-400 font-mono">ΔH = Ss·b·Δh</p>
            <p className="text-gw-muted mt-1">Ss为储水率，b为厚度，Δh为水头变化</p>
          </div>
          <div className="p-3 rounded-lg bg-gw-surface">
            <p className="font-medium text-gw-text mb-1">地面沉降（压缩指数法）</p>
            <p className="text-blue-400 font-mono">ΔH = Cc·H₀/(1+e₀)·lg(σ/σ₀)</p>
            <p className="text-gw-muted mt-1">Cc为压缩指数，e₀为孔隙比</p>
          </div>
        </div>
      </TechCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 主组件
// ═══════════════════════════════════════════════════════

const SUB_TABS = [
  { key: 'cone', label: '漏斗计算', icon: Droplets },
  { key: 'subsidence', label: '沉降估算', icon: ArrowDown },
  { key: 'trend', label: '趋势分析', icon: TrendingUp },
  { key: 'ref', label: '风险参考', icon: BookOpen },
] as const;

type SubTabKey = typeof SUB_TABS[number]['key'];

export function SubsidenceTab() {
  const [activeSubTab, setActiveSubTab] = useState<SubTabKey>('cone');

  return (
    <div className="space-y-6">
      <div className="p-3 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
        <div className="flex items-center gap-2">
          <ArrowDown size={16} className="text-orange-400" />
          <span className="text-sm text-orange-400 font-medium">地面沉降与降落漏斗分析</span>
        </div>
        <p className="text-xs text-gw-muted mt-1">支持Dupuit/Theis/经验公式三种模型计算降落漏斗，基于有效应力原理估算地面沉降量，服务于环评疏干排水影响预测</p>
      </div>

      <div className="flex gap-1 bg-gw-surface rounded-lg p-1 overflow-x-auto scrollbar-none flex-wrap">
        {SUB_TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveSubTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs transition-all whitespace-nowrap ${activeSubTab === tab.key ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30' : 'text-gw-muted hover:text-gw-text'}`}>
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeSubTab === 'cone' && <ConeCalculatorPanel />}
      {activeSubTab === 'subsidence' && <SubsidenceCalcPanel />}
      {activeSubTab === 'trend' && <TrendPanel />}
      {activeSubTab === 'ref' && <RiskReferencePanel />}

      <DataSourceNote source="Theis(1935) | Dupuit | Terzaghi有效应力原理 | 河北省地面沉降监测资料" />
    </div>
  );
}
