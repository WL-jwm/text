/**
 * B-25 地下水数值模拟参数估算器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 水力参数转换+网格估算+稳定性判断+时间步长
 *  2. 模型校准 — 观测/模拟数据对比+NSE/RMSE/R²等指标
 *  3. 预设分区 — 6个河北典型数值模拟区参数对比
 *  4. 参考方法 — 数值方法+稳定性准则+校准标准
 */
import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter, Legend,
} from 'recharts';
import { Calculator, Gauge, MapPin, BookOpen } from 'lucide-react';
import { TechCard, StatCard, ChartTooltip, DataSourceNote } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { ChartExport } from '../ChartExport';
import { FilterableTechTable } from '../FilterableTechTable';
import {
  PRESET_MODEL_ZONES,
  calcHydraulicParams,
  calcGridParams,
  calcStability,
  calcTimeStep,
  calcCalibration,
  calcAllPresetZones,
  type HydraulicParamInput,
  type StabilityInput,
  type TimeStepInput,
} from '../../utils/numericalModelCalculator';

const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
};

const GRADE_COLORS: Record<string, string> = {
  '优秀': '#10b981', '良好': '#06b6d4', '合格': '#f59e0b',
  '勉强': '#f97316', '不合格': '#ef4444', '数据不足': '#64748b',
};

// ── 面板1: 计算器 ──

function CalculatorPanel() {
  // 水力参数输入
  const [k, setK] = useState(8);
  const [thickness, setThickness] = useState(30);
  const [storage, setStorage] = useState(0.001);
  const [gradient, setGradient] = useState(0.002);
  const [porosity, setPorosity] = useState(0.20);
  const [alphaL, setAlphaL] = useState(30);
  const [isConfined, setIsConfined] = useState(true);

  // 网格参数输入
  const [domainLength, setDomainLength] = useState(40000);
  const [domainWidth, setDomainWidth] = useState(30000);
  const [layers, setLayers] = useState(3);
  const [resolutionLevel, setResolutionLevel] = useState(3);

  // 时间步长输入
  const [totalTime, setTotalTime] = useState(3650);
  const [method, setMethod] = useState<'explicit' | 'implicit' | 'crank-nicolson'>('implicit');

  const hydraulicInput: HydraulicParamInput = { k, thickness, storage, gradient, porosity, alphaL, isConfined };
  const hydraulicResult = useMemo(() => calcHydraulicParams(hydraulicInput), [k, thickness, storage, gradient, porosity, alphaL, isConfined]);
  const gridResult = useMemo(() => calcGridParams({ domainLength, domainWidth, layers, hydraulic: hydraulicInput, resolutionLevel }), [domainLength, domainWidth, layers, hydraulicInput, resolutionLevel]);

  const timeStepInput: TimeStepInput = {
    transmissivity: hydraulicResult.transmissivity,
    storage,
    dx: gridResult.dx,
    totalTime,
    method,
  };
  const timeStepResult = useMemo(() => calcTimeStep(timeStepInput), [hydraulicResult.transmissivity, storage, gridResult.dx, totalTime, method]);

  const stabilityInput: StabilityInput = {
    dx: gridResult.dx,
    k, thickness, storage, porosity, gradient, alphaL,
    dt: timeStepResult.suggestedDt,
    isExplicit: method === 'explicit',
  };
  const stabilityResult = useMemo(() => calcStability(stabilityInput), [gridResult.dx, k, thickness, storage, porosity, gradient, alphaL, timeStepResult.suggestedDt, method]);

  const numField = (label: string, value: number, setter: (v: number) => void, step?: string) => (
    <div className="flex flex-col gap-0.5">
      <label className="text-[10px] text-gw-muted">{label}</label>
      <input type="number" step={step ?? 'any'} value={value}
        onChange={e => setter(parseFloat(e.target.value) || 0)}
        className="px-2 py-1 bg-gw-surface border border-gw-border/50 rounded text-xs text-gw-text font-mono" />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 输入面板 */}
        <TechCard title="模型参数输入" badge="基本参数" icon={Calculator}>
          <div className="space-y-3">
            <div>
              <div className="text-[10px] text-gw-muted mb-1 font-semibold">水力参数</div>
              <div className="grid grid-cols-2 gap-2">
                {numField('渗透系数 K (m/d)', k, setK, '0.1')}
                {numField('含水层厚度 M (m)', thickness, setThickness, '1')}
                {numField('贮水系数/给水度 S', storage, setStorage, '0.001')}
                {numField('水力梯度 i', gradient, setGradient, '0.0001')}
                {numField('孔隙率 n', porosity, setPorosity, '0.01')}
                {numField('纵向弥散度 αL (m)', alphaL, setAlphaL, '1')}
              </div>
              <label className="flex items-center gap-1.5 mt-2 text-[10px] text-gw-muted cursor-pointer">
                <input type="checkbox" checked={isConfined} onChange={e => setIsConfined(e.target.checked)} className="accent-gw-blue" />
                承压含水层（取消勾选为潜水）
              </label>
            </div>
            <div>
              <div className="text-[10px] text-gw-muted mb-1 font-semibold">网格与时间参数</div>
              <div className="grid grid-cols-2 gap-2">
                {numField('区域长度 (m)', domainLength, setDomainLength, '1000')}
                {numField('区域宽度 (m)', domainWidth, setDomainWidth, '1000')}
                {numField('含水层层数', layers, setLayers, '1')}
                {numField('总模拟时间 (d)', totalTime, setTotalTime, '100')}
              </div>
              <div className="flex gap-2 mt-2">
                <select value={resolutionLevel} onChange={e => setResolutionLevel(parseInt(e.target.value))}
                  className="px-2 py-1 bg-gw-surface border border-gw-border/50 rounded text-xs text-gw-text">
                  <option value={1}>粗网格(~200m)</option>
                  <option value={2}>中粗(~100m)</option>
                  <option value={3}>中等(~50m)</option>
                  <option value={4}>中细(~25m)</option>
                  <option value={5}>细网格(~10m)</option>
                </select>
                <select value={method} onChange={e => setMethod(e.target.value as 'explicit' | 'implicit' | 'crank-nicolson')}
                  className="px-2 py-1 bg-gw-surface border border-gw-border/50 rounded text-xs text-gw-text">
                  <option value="explicit">显式差分</option>
                  <option value="implicit">隐式差分</option>
                  <option value="crank-nicolson">Crank-Nicolson</option>
                </select>
              </div>
            </div>
          </div>
        </TechCard>

        {/* 结果面板 */}
        <div className="space-y-3">
          <TechCard title="水力参数转换" badge="推导参数" icon={Gauge}>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-gw-surface/50 rounded text-center">
                <div className="text-[10px] text-gw-muted">导水系数 T</div>
                <div className="text-lg font-mono text-gw-highlight">{hydraulicResult.transmissivity} m²/d</div>
              </div>
              <div className="p-2 bg-gw-surface/50 rounded text-center">
                <div className="text-[10px] text-gw-muted">达西流速</div>
                <div className="text-lg font-mono text-gw-cyan">{hydraulicResult.darcyVelocity} m/d</div>
              </div>
              <div className="p-2 bg-gw-surface/50 rounded text-center">
                <div className="text-[10px] text-gw-muted">实际流速</div>
                <div className="text-lg font-mono text-amber-400">{hydraulicResult.actualVelocity} m/d</div>
              </div>
              <div className="p-2 bg-gw-surface/50 rounded text-center">
                <div className="text-[10px] text-gw-muted">扩散系数 D</div>
                <div className="text-lg font-mono text-emerald-400">{hydraulicResult.diffusivity} m²/d</div>
              </div>
            </div>
            <p className="text-[10px] text-gw-muted mt-2 leading-tight">{hydraulicResult.note}</p>
          </TechCard>

          <TechCard title="网格参数估算" badge={gridResult.quality} icon={MapPin}>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 bg-gw-surface/50 rounded text-center">
                <div className="text-[10px] text-gw-muted">网格尺寸</div>
                <div className="text-sm font-mono text-gw-text">{gridResult.dx}m</div>
              </div>
              <div className="p-2 bg-gw-surface/50 rounded text-center">
                <div className="text-[10px] text-gw-muted">网格数</div>
                <div className="text-sm font-mono text-gw-text">{gridResult.nx}×{gridResult.ny}</div>
              </div>
              <div className="p-2 bg-gw-surface/50 rounded text-center">
                <div className="text-[10px] text-gw-muted">总节点</div>
                <div className="text-sm font-mono text-gw-highlight">{gridResult.totalNodes.toLocaleString()}</div>
              </div>
              <div className="p-2 bg-gw-surface/50 rounded text-center">
                <div className="text-[10px] text-gw-muted">总单元</div>
                <div className="text-sm font-mono text-gw-text">{gridResult.totalCells.toLocaleString()}</div>
              </div>
              <div className="p-2 bg-gw-surface/50 rounded text-center">
                <div className="text-[10px] text-gw-muted">内存估算</div>
                <div className="text-sm font-mono text-gw-cyan">{gridResult.estimatedMemory} MB</div>
              </div>
              <div className="p-2 bg-gw-surface/50 rounded text-center">
                <div className="text-[10px] text-gw-muted">质量评价</div>
                <div className="text-sm text-gw-highlight">{gridResult.quality}</div>
              </div>
            </div>
            <p className="text-[10px] text-gw-muted mt-2">{gridResult.suggestion}</p>
          </TechCard>
        </div>
      </div>

      {/* 稳定性与时间步长 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TechCard title="数值稳定性判断" badge={stabilityResult.isStable ? '稳定' : '不稳定'} icon={Gauge}>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="p-2 bg-gw-surface/50 rounded text-center">
              <div className="text-[10px] text-gw-muted">Courant数</div>
              <div className={`text-base font-mono ${stabilityResult.courant > 1 ? 'text-red-400' : 'text-emerald-400'}`}>{stabilityResult.courant}</div>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded text-center">
              <div className="text-[10px] text-gw-muted">网格Peclet</div>
              <div className={`text-base font-mono ${stabilityResult.peclet > 2 ? 'text-amber-400' : 'text-emerald-400'}`}>{stabilityResult.peclet}</div>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded text-center">
              <div className="text-[10px] text-gw-muted">弥散Peclet</div>
              <div className={`text-base font-mono ${stabilityResult.pecletD > 2 ? 'text-amber-400' : 'text-emerald-400'}`}>{stabilityResult.pecletD}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs mb-2">
            <div className="p-2 bg-gw-surface/50 rounded">
              <span className="text-gw-muted">最大Δt: </span>
              <span className="font-mono text-gw-cyan">{stabilityResult.maxDt} d</span>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded">
              <span className="text-gw-muted">最大Δx: </span>
              <span className="font-mono text-gw-cyan">{stabilityResult.maxDx} m</span>
            </div>
          </div>
          <div className={`p-2 rounded text-[10px] ${stabilityResult.isStable ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            {stabilityResult.suggestion}
          </div>
        </TechCard>

        <TechCard title="时间步长估算" badge={`${timeStepResult.totalSteps}步`} icon={Calculator}>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="p-2 bg-gw-surface/50 rounded text-center">
              <div className="text-[10px] text-gw-muted">最大Δt</div>
              <div className="text-base font-mono text-gw-text">{timeStepResult.maxDt} d</div>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded text-center">
              <div className="text-[10px] text-gw-muted">建议Δt</div>
              <div className="text-base font-mono text-gw-highlight">{timeStepResult.suggestedDt} d</div>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded text-center">
              <div className="text-[10px] text-gw-muted">总步数</div>
              <div className="text-base font-mono text-gw-cyan">{timeStepResult.totalSteps}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs mb-2">
            <div className="p-2 bg-gw-surface/50 rounded">
              <div className="text-[9px] text-gw-muted">收敛准则</div>
              <div className="font-mono text-gw-text">{timeStepResult.convergenceCriterion}</div>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded">
              <div className="text-[9px] text-gw-muted">最大迭代</div>
              <div className="font-mono text-gw-text">{timeStepResult.maxIterations}</div>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded">
              <div className="text-[9px] text-gw-muted">松弛因子ω</div>
              <div className="font-mono text-gw-text">{timeStepResult.relaxationFactor}</div>
            </div>
          </div>
          <p className="text-[10px] text-gw-muted">{timeStepResult.suggestion}</p>
        </TechCard>
      </div>
    </div>
  );
}

// ── 面板2: 模型校准 ──

function CalibrationPanel() {
  const [obsText, setObsText] = useState('32.1, 31.8, 31.5, 31.2, 30.9, 30.5, 30.2, 29.8, 29.5, 29.1');
  const [simText, setSimText] = useState('32.3, 31.6, 31.7, 31.0, 31.1, 30.3, 30.4, 29.6, 29.7, 28.9');

  const parseNumbers = (text: string): number[] => {
    return text.split(/[,，\s]+/).map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
  };

  const observed = useMemo(() => parseNumbers(obsText), [obsText]);
  const simulated = useMemo(() => parseNumbers(simText), [simText]);
  const result = useMemo(() => calcCalibration({ observed, simulated }), [observed, simulated]);

  const scatterData = observed.map((o, i) => ({ obs: o, sim: simulated[i] ?? 0, idx: i + 1 }));

  // 1:1线范围
  const minVal = Math.min(...observed, ...simulated, 0);
  const maxVal = Math.max(...observed, ...simulated, 0);

  // 残差图数据
  const residualData = observed.map((o, i) => ({ idx: i + 1, residual: o - (simulated[i] ?? 0) }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TechCard title="校准数据输入" badge="观测 vs 模拟" icon={Calculator}>
          <div className="space-y-2">
            <div>
              <label className="text-[10px] text-gw-muted">观测值序列（逗号或空格分隔）</label>
              <textarea value={obsText} onChange={e => setObsText(e.target.value)} rows={3}
                className="w-full px-2 py-1.5 bg-gw-surface border border-gw-border/50 rounded text-xs text-gw-text font-mono resize-none" />
            </div>
            <div>
              <label className="text-[10px] text-gw-muted">模拟值序列（逗号或空格分隔）</label>
              <textarea value={simText} onChange={e => setSimText(e.target.value)} rows={3}
                className="w-full px-2 py-1.5 bg-gw-surface border border-gw-border/50 rounded text-xs text-gw-text font-mono resize-none" />
            </div>
            <div className="text-[10px] text-gw-muted">数据对数：{result.n} | 观测范围：{observed.length > 0 ? `${Math.min(...observed).toFixed(1)}~${Math.max(...observed).toFixed(1)}` : '—'}</div>
          </div>
        </TechCard>

        <TechCard title="校准指标" badge={result.grade} icon={Gauge}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <div className="p-2 bg-gw-surface/50 rounded text-center">
              <div className="text-[10px] text-gw-muted">NSE</div>
              <div className="text-base font-mono" style={{ color: GRADE_COLORS[result.grade] ?? '#64748b' }}>{result.nse.toFixed(3)}</div>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded text-center">
              <div className="text-[10px] text-gw-muted">R²</div>
              <div className="text-base font-mono text-gw-highlight">{result.r2.toFixed(3)}</div>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded text-center">
              <div className="text-[10px] text-gw-muted">RMSE</div>
              <div className="text-base font-mono text-amber-400">{result.rmse.toFixed(4)}</div>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded text-center">
              <div className="text-[10px] text-gw-muted">MAE</div>
              <div className="text-base font-mono text-gw-cyan">{result.mae.toFixed(4)}</div>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded text-center">
              <div className="text-[10px] text-gw-muted">MAPE(%)</div>
              <div className="text-base font-mono text-gw-text">{result.mape.toFixed(2)}</div>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded text-center">
              <div className="text-[10px] text-gw-muted">PBIAS(%)</div>
              <div className={`text-base font-mono ${Math.abs(result.pbias) > 10 ? 'text-amber-400' : 'text-emerald-400'}`}>{result.pbias.toFixed(2)}</div>
            </div>
          </div>
          <div className="mt-3 p-2 bg-gw-surface/50 rounded">
            <div className="text-[10px] text-gw-muted">评价等级</div>
            <div className="text-sm" style={{ color: GRADE_COLORS[result.grade] ?? '#64748b' }}>{result.grade}</div>
          </div>
          <p className="text-[10px] text-gw-muted mt-2">{result.suggestion}</p>
        </TechCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="观测 vs 模拟散点图（1:1线）" height={300}>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
              <XAxis type="number" dataKey="obs" name="观测值" stroke="#64748b" fontSize={10} domain={[minVal - 1, maxVal + 1]} />
              <YAxis type="number" dataKey="sim" name="模拟值" stroke="#64748b" fontSize={10} domain={[minVal - 1, maxVal + 1]} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Scatter data={scatterData} fill="#06b6d4" />
              <ReferenceLine segment={[{ x: minVal, y: minVal }, { x: maxVal, y: maxVal }]} stroke="#10b981" strokeDasharray="5 5" label={{ value: '1:1', fill: '#10b981', fontSize: 10 }} />
            </ScatterChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <LazyChartCard title="残差分布图" height={300}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={residualData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
              <XAxis dataKey="idx" stroke="#64748b" fontSize={10} label={{ value: '序号', position: 'insideBottom', fontSize: 10, fill: '#64748b' }} />
              <YAxis stroke="#64748b" fontSize={10} label={{ value: '残差', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
              <Tooltip content={<ChartTooltip title="残差" />} />
              <ReferenceLine y={0} stroke="#64748b" />
              <Bar dataKey="residual" name="残差" radius={[2, 2, 0, 0]}>
                {residualData.map((d, i) => <Cell key={i} fill={d.residual >= 0 ? '#06b6d4' : '#ef4444'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>

      <TechCard title="校准指标说明" icon={BookOpen}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="p-2 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-highlight">NSE (Nash-Sutcliffe效率系数)</div>
            <div className="text-[10px] text-gw-muted mt-1">≥0.90优秀 | ≥0.80良好 | ≥0.65合格 | ≥0.50勉强 | &lt;0.50不合格。1为完美拟合，0等同于观测均值。</div>
          </div>
          <div className="p-2 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-highlight">R² (决定系数)</div>
            <div className="text-[10px] text-gw-muted mt-1">衡量线性相关程度，0~1。≥0.9为优，≥0.7为良，≥0.5为合格。</div>
          </div>
          <div className="p-2 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-highlight">RMSE (均方根误差)</div>
            <div className="text-[10px] text-gw-muted mt-1">越小说明拟合越好，单位与原始数据一致。对大偏差敏感。</div>
          </div>
          <div className="p-2 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-highlight">PBIAS (相对偏差)</div>
            <div className="text-[10px] text-gw-muted mt-1">正值表示模拟偏高，负值偏低。|PBIAS|&lt;10%为优，&lt;15%为良，&lt;25%为合格。</div>
          </div>
        </div>
      </TechCard>
    </div>
  );
}

// ── 面板3: 预设分区 ──

function PresetZonesPanel() {
  const results = useMemo(() => calcAllPresetZones(), []);

  const nodeBarData = results.map(r => ({
    name: r.zone.name.length > 8 ? r.zone.name.substring(0, 8) + '...' : r.zone.name,
    nodes: r.gridResult.totalNodes,
    steps: r.timeStepResult.totalSteps,
  }));

  const radarData = results.map(r => ({
    name: r.zone.name.length > 6 ? r.zone.name.substring(0, 6) + '...' : r.zone.name,
    T: Math.min(100, r.hydraulicResult.transmissivity),
    v: Math.min(100, r.hydraulicResult.actualVelocity * 10000),
    D: Math.min(100, r.hydraulicResult.diffusivity / 100),
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="预设模拟区" value={PRESET_MODEL_ZONES.length} unit="个" icon={MapPin} accent="blue" />
        <StatCard title="平均节点数" value={Math.round(results.reduce((s, r) => s + r.gridResult.totalNodes, 0) / results.length).toLocaleString()} unit="" icon={Calculator} accent="cyan" />
        <StatCard title="平均步数" value={Math.round(results.reduce((s, r) => s + r.timeStepResult.totalSteps, 0) / results.length)} unit="步" icon={Gauge} accent="amber" />
        <StatCard title="稳定区域" value={results.filter(r => r.stabilityResult.isStable).length} unit={`/${results.length}`} icon={BookOpen} accent="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="各分区节点数与时间步数对比" height={300}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={nodeBarData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={9} angle={-30} textAnchor="end" height={50} />
              <YAxis yAxisId="left" stroke="#64748b" fontSize={10} />
              <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={10} />
              <Tooltip content={<ChartTooltip title="对比" />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar yAxisId="left" dataKey="nodes" name="总节点数" fill="#06b6d4" radius={[2, 2, 0, 0]} />
              <Bar yAxisId="right" dataKey="steps" name="时间步数" fill="#f59e0b" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <LazyChartCard title="各分区水力参数雷达图" height={300}>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData} outerRadius={90}>
              <PolarGrid stroke="#1a2d4d" />
              <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9 }} />
              <PolarRadiusAxis tick={{ fill: '#64748b', fontSize: 8 }} />
              <Radar dataKey="T" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} />
              <Radar dataKey="v" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
              <Radar dataKey="D" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Tooltip {...TOOLTIP_STYLE} />
            </RadarChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>

      <TechCard title="各分区参数估算汇总">
        <div className="mb-3 flex justify-end">
          <ChartExport data={results.map(r => ({
            分区: r.zone.name,
            渗透系数: r.zone.hydraulic.k,
            导水系数: r.hydraulicResult.transmissivity,
            实际流速: r.hydraulicResult.actualVelocity,
            扩散系数: r.hydraulicResult.diffusivity,
            网格尺寸m: r.gridResult.dx,
            总节点: r.gridResult.totalNodes,
            时间步长d: r.timeStepResult.suggestedDt,
            总步数: r.timeStepResult.totalSteps,
            Courant数: r.stabilityResult.courant,
            弥散Peclet: r.stabilityResult.pecletD,
            稳定性: r.stabilityResult.isStable ? '稳定' : '不稳定',
            求解方法: r.zone.method,
          }))} filename="numerical-model-params" sheetName="数值模拟参数" formats={['xlsx', 'csv', 'json']} label="导出参数表" />
        </div>
        <FilterableTechTable
          headers={['分区', 'K(m/d)', 'T(m²/d)', 'Δx(m)', '节点数', 'Δt(d)', '步数', 'Courant', 'Pe_d', '稳定性', '方法']}
          rows={results.map(r => [
            r.zone.name.length > 12 ? r.zone.name.substring(0, 12) + '...' : r.zone.name,
            String(r.zone.hydraulic.k),
            String(r.hydraulicResult.transmissivity),
            String(r.gridResult.dx),
            r.gridResult.totalNodes.toLocaleString(),
            String(r.timeStepResult.suggestedDt),
            String(r.timeStepResult.totalSteps),
            String(r.stabilityResult.courant),
            String(r.stabilityResult.pecletD),
            r.stabilityResult.isStable ? '稳定' : '不稳定',
            r.zone.method,
          ])}
          filterPlaceholder="搜索分区..."
        />
      </TechCard>
    </div>
  );
}

// ── 面板4: 参考方法 ──

function ReferencePanel() {
  return (
    <div className="space-y-4">
      <TechCard title="数值方法对比" badge="3种格式">
        <FilterableTechTable
          headers={['方法', '稳定性', '精度', '计算量', '适用场景', '时间步长限制']}
          rows={[
            ['显式差分(FTCS)', '条件稳定(Cr≤1)', '一阶O(Δt)', '最小', '简单问题/教学', 'Δt≤Δx²/(4D)'],
            ['隐式差分(BTCS)', '无条件稳定', '一阶O(Δt)', '中等', '生产项目', '无限制'],
            ['Crank-Nicolson', '无条件稳定', '二阶O(Δt²)', '较大', '高精度要求', '无限制'],
          ]}
          filterPlaceholder="搜索..."
        />
      </TechCard>

      <TechCard title="数值稳定性准则" badge="关键判据">
        <div className="space-y-2">
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-highlight">Courant数准则</div>
            <div className="text-sm font-mono text-gw-cyan mt-1">Cr = v × Δt / Δx ≤ 1</div>
            <div className="text-[10px] text-gw-muted mt-1">显式格式必须满足，否则数值不稳定。v为实际渗流速度，Δt为时间步长，Δx为网格尺寸。</div>
          </div>
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-highlight">网格Peclet数准则</div>
            <div className="text-sm font-mono text-gw-cyan mt-1">Pe = Δx / αL ≤ 2</div>
            <div className="text-[10px] text-gw-muted mt-1">溶质运移模拟中避免数值振荡的关键条件。αL为纵向弥散度，Δx为网格尺寸。Pe&gt;2时产生数值弥散和振荡。</div>
          </div>
          <div className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-highlight">Neumann稳定性（扩散方程）</div>
            <div className="text-sm font-mono text-gw-cyan mt-1">D × Δt / Δx² ≤ 1/4 (二维)</div>
            <div className="text-[10px] text-gw-muted mt-1">显式格式求解地下水流的稳定条件。D=T/S为水力扩散系数。</div>
          </div>
        </div>
      </TechCard>

      <TechCard title="模型校准评价标准" badge="NSE分级">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          {[
            { grade: '优秀', range: 'NSE≥0.90', color: '#10b981', desc: '模型可信度高，可直接用于预测' },
            { grade: '良好', range: '0.80≤NSE<0.90', color: '#06b6d4', desc: '模型较可靠，可用于情景预测' },
            { grade: '合格', range: '0.65≤NSE<0.80', color: '#f59e0b', desc: '基本可用，需注意不确定性' },
            { grade: '勉强', range: '0.50≤NSE<0.65', color: '#f97316', desc: '精度偏低，需进一步校准' },
            { grade: '不合格', range: 'NSE<0.50', color: '#ef4444', desc: '模型不可用，需重新构建' },
          ].map(g => (
            <div key={g.grade} className="p-3 bg-gw-surface/50 rounded-lg border border-gw-border/30 text-center">
              <div className="text-sm font-semibold" style={{ color: g.color }}>{g.grade}</div>
              <div className="text-[10px] font-mono text-gw-text mt-0.5">{g.range}</div>
              <div className="text-[9px] text-gw-muted mt-1 leading-tight">{g.desc}</div>
            </div>
          ))}
        </div>
      </TechCard>

      <TechCard title="网格密度参考标准" badge="5级">
        <FilterableTechTable
          headers={['等级', '网格尺寸', '适用场景', '计算资源', '总节点量级']}
          rows={[
            ['粗网格', '~200m', '初步建模/概念验证', '普通PC', '<1万'],
            ['中粗网格', '~100m', '区域尺度模拟', '普通PC', '1~5万'],
            ['中等网格', '~50m', '常规生产项目', '工作站', '5~50万'],
            ['中细网格', '~25m', '重点区域精细模拟', '高性能工作站', '50~200万'],
            ['细网格', '~10m', '局部高精度模拟', '高性能集群', '>200万'],
          ]}
          filterPlaceholder="搜索..."
        />
      </TechCard>

      <DataSourceNote source="《地下水数值模拟》薛禹群 | MODFLOW/MT3DMS技术手册 | Anderson & Woessner(2015)" version="B-25" />
    </div>
  );
}

// ── 主组件 ──

export function NumericalModelCalculatorTab() {
  const [activePanel, setActivePanel] = useState<'calculator' | 'calibration' | 'zones' | 'reference'>('calculator');

  const panels = [
    { key: 'calculator' as const, label: '计算器', icon: Calculator },
    { key: 'calibration' as const, label: '模型校准', icon: Gauge },
    { key: 'zones' as const, label: '预设分区', icon: MapPin },
    { key: 'reference' as const, label: '参考方法', icon: BookOpen },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-gw-surface rounded-lg p-1 overflow-x-auto scrollbar-none">
        {panels.map(p => (
          <button key={p.key} onClick={() => setActivePanel(p.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs transition-all ${activePanel === p.key ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30' : 'text-gw-muted hover:text-gw-text'}`}>
            <p.icon size={14} />
            {p.label}
          </button>
        ))}
      </div>

      {activePanel === 'calculator' && <CalculatorPanel />}
      {activePanel === 'calibration' && <CalibrationPanel />}
      {activePanel === 'zones' && <PresetZonesPanel />}
      {activePanel === 'reference' && <ReferencePanel />}
    </div>
  );
}
