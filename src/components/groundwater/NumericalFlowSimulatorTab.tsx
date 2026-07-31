/**
 * B-35 地下水数值模拟与校准器 Tab
 *
 * 5大面板：
 *  1. 模型设置 — 预设区域选择+网格/含水层/边界/井参数
 *  2. 流场模拟 — 稳定流/非稳定流+水头热力图+降深图+水量平衡
 *  3. 反演校准 — 观测点输入+参数反演+误差统计+散点图
 *  4. 情景预测 — 5种开采方案对比+降深统计+影响半径
 *  5. 参考说明 — 有限差分原理+边界条件+校准方法
 */
import React, { useState, useMemo, useCallback } from 'react';
import {
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, ZAxis, ReferenceLine, Legend, ComposedChart,
} from 'recharts';
import {
  Grid3x3, Waves, Crosshair, BookOpen,
  Play, Settings, TrendingDown,
  Activity, Droplets, Gauge, MapPin, ArrowRight, Layers,
} from 'lucide-react';
import { TechCard, DataSourceNote, CollapsiblePanel } from '../UI';
import { FilterableTechTable } from '../FilterableTechTable';
import {
  PRESET_MODEL_AREAS, PRESET_OBSERVATION_POINTS, PRESET_SCENARIOS,
  solveSteadyFlow, solveTransientFlow, calibrateParameters, predictScenarios,
  calcDrawdownStats, calcVelocityStats,
  type SimulationConfig, type SimulationResult, type AquiferType, type BoundaryType,
  type PumpingWell, type ObservationPoint, type CalibrationResult,
} from '../../utils/numericalFlowSimulator';

const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#e2e8f0' },
};

const HEAT_COLORS = [
  '#1e3a5f', '#1e4d7b', '#2563eb', '#3b82f6', '#60a5fa',
  '#7dd3fc', '#fde68a', '#fbbf24', '#f59e0b', '#ea580c', '#dc2626',
];

function getHeatColor(value: number, min: number, max: number): string {
  if (max === min) return HEAT_COLORS[5];
  const normalized = (value - min) / (max - min);
  const idx = Math.min(HEAT_COLORS.length - 1, Math.max(0, Math.floor(normalized * HEAT_COLORS.length)));
  return HEAT_COLORS[idx];
}

const AQUIFER_TYPE_LABEL: Record<AquiferType, string> = {
  confined: '承压水',
  unconfined: '潜水',
  leaky: '越流含水层',
};

// ── 输入控件 ──
function NumInput({
  label, value, onChange, unit, step = 1, min,
}: {
  label: string; value: number; onChange: (v: number) => void; unit?: string; step?: number; min?: number;
}) {
  return (
    <div>
      <label className="block text-[10px] text-gw-muted mb-0.5">{label}{unit ? ` (${unit})` : ''}</label>
      <input
        type="number" step={step} value={value} min={min}
        onChange={e => onChange(+e.target.value)}
        className="w-full px-2 py-1 text-xs bg-gw-surface border border-gw-border rounded text-gw-text focus:border-gw-blue focus:outline-none"
      />
    </div>
  );
}

function SelectInput<T extends string>({
  label, value, onChange, options,
}: {
  label: string; value: T; onChange: (v: T) => void; options: { value: T; label: string }[];
}) {
  return (
    <div>
      <label className="block text-[10px] text-gw-muted mb-0.5">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value as T)}
        className="w-full px-2 py-1 text-xs bg-gw-surface border border-gw-border rounded text-gw-text focus:border-gw-blue focus:outline-none"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ── 水头热力图（Canvas渲染）──
function HeadHeatmap({ result, rows, cols }: { result: SimulationResult; rows: number; cols: number }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cellW = w / cols;
    const cellH = h / rows;

    let min = Infinity, max = -Infinity;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (result.head[i][j] < min) min = result.head[i][j];
        if (result.head[i][j] > max) max = result.head[i][j];
      }
    }

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        ctx.fillStyle = getHeatColor(result.head[i][j], min, max);
        ctx.fillRect(j * cellW, i * cellH, cellW + 1, cellH + 1);
      }
    }
  }, [result, rows, cols]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} width={600} height={400} className="w-full rounded-lg border border-gw-border" />
      <div className="flex items-center justify-between mt-2 text-[10px] text-gw-muted">
        <span>低水位</span>
        <div className="flex h-3 rounded overflow-hidden flex-1 mx-2">
          {HEAT_COLORS.map(c => <div key={c} className="flex-1" style={{ background: c }} />)}
        </div>
        <span>高水位</span>
      </div>
    </div>
  );
}

// ── 降深热力图 ──
function DrawdownHeatmap({ drawdown, rows, cols }: { drawdown: number[][]; rows: number; cols: number }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cellW = w / cols;
    const cellH = h / rows;

    let max = 0;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (Math.abs(drawdown[i][j]) > max) max = Math.abs(drawdown[i][j]);
      }
    }
    if (max === 0) max = 1;

    const colors = ['#0f172a', '#1e3a5f', '#3b82f6', '#fbbf24', '#ea580c', '#dc2626'];
    const thresholds = [0.05, 0.2, 0.4, 0.6, 0.8, 1.0];

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const ratio = Math.abs(drawdown[i][j]) / max;
        let color = colors[0];
        for (let t = 0; t < thresholds.length; t++) {
          if (ratio <= thresholds[t]) { color = colors[t]; break; }
          color = colors[colors.length - 1];
        }
        ctx.fillStyle = color;
        ctx.fillRect(j * cellW, i * cellH, cellW + 1, cellH + 1);
      }
    }
  }, [drawdown, rows, cols]);

  return (
    <canvas ref={canvasRef} width={600} height={400} className="w-full rounded-lg border border-gw-border" />
  );
}

// ── 面板1: 模型设置 ──
function ModelSetupPanel({
  areaId, setAreaId, config, setConfig, wells, setWells,
}: {
  areaId: string; setAreaId: (v: string) => void;
  config: SimulationConfig; setConfig: (c: SimulationConfig) => void;
  wells: PumpingWell[]; setWells: (w: PumpingWell[]) => void;
}) {
  const updateAquifer = (patch: Partial<SimulationConfig['aquifer']>) => {
    setConfig({ ...config, aquifer: { ...config.aquifer, ...patch } });
  };

  const updateBoundary = (edge: 'north' | 'south' | 'east' | 'west', field: 'type' | 'value', val: BoundaryType | number) => {
    const boundary = { ...config.boundary };
    if (field === 'type') {
      boundary[edge] = val as BoundaryType;
    } else {
      (boundary as Record<string, unknown>)[`${edge}Value`] = val;
    }
    setConfig({ ...config, boundary });
  };

  const updateWell = (idx: number, patch: Partial<PumpingWell>) => {
    const next = [...wells];
    next[idx] = { ...next[idx], ...patch };
    setWells(next);
  };

  const addWell = () => {
    setWells([...wells, { row: Math.floor(config.grid.rows / 2), col: Math.floor(config.grid.cols / 2), rate: -500, label: `井${wells.length + 1}` }]);
  };

  const removeWell = (idx: number) => {
    setWells(wells.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-4">
      <TechCard>
        <div className="flex items-center gap-2 mb-3">
          <MapPin size={16} className="text-gw-blue" />
          <h4 className="text-sm font-semibold text-gw-text">预设研究区域</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {PRESET_MODEL_AREAS.map(a => (
            <button
              key={a.id}
              onClick={() => {
                setAreaId(a.id);
                const newConfig: SimulationConfig = {
                  grid: { ...a.grid },
                  aquifer: { ...a.aquifer },
                  boundary: { ...a.boundary },
                  wells: [...a.wells],
                  initialHead: a.initialHead,
                  isTransient: false,
                  maxIterations: 500,
                  convergenceTolerance: 0.01,
                  sorFactor: 1.5,
                };
                setConfig(newConfig);
                setWells([...a.wells]);
              }}
              className={`p-2 rounded-lg text-left transition-all ${
                areaId === a.id
                  ? 'bg-gw-blue/20 border border-gw-blue/40 text-gw-highlight'
                  : 'bg-gw-surface border border-gw-border text-gw-muted hover:border-gw-blue/20'
              }`}
            >
              <div className="text-xs font-medium">{a.name}</div>
              <div className="text-[10px] mt-0.5 opacity-70">{a.description}</div>
            </button>
          ))}
        </div>
      </TechCard>

      <div className="grid md:grid-cols-2 gap-4">
        <TechCard>
          <div className="flex items-center gap-2 mb-3">
            <Grid3x3 size={16} className="text-cyan-400" />
            <h4 className="text-sm font-semibold text-gw-text">网格与含水层参数</h4>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <NumInput label="行数" value={config.grid.rows} onChange={v => setConfig({ ...config, grid: { ...config.grid, rows: v } })} min={5} />
            <NumInput label="列数" value={config.grid.cols} onChange={v => setConfig({ ...config, grid: { ...config.grid, cols: v } })} min={5} />
            <NumInput label="网格间距" value={config.grid.cellSize} onChange={v => setConfig({ ...config, grid: { ...config.grid, cellSize: v } })} unit="m" step={50} />
            <SelectInput
              label="含水层类型"
              value={config.aquifer.type}
              onChange={v => updateAquifer({ type: v })}
              options={[
                { value: 'confined', label: '承压水' },
                { value: 'unconfined', label: '潜水' },
              ]}
            />
            <NumInput label="Kx" value={config.aquifer.kx} onChange={v => updateAquifer({ kx: v })} unit="m/d" step={0.5} />
            <NumInput label="Ky" value={config.aquifer.ky} onChange={v => updateAquifer({ ky: v })} unit="m/d" step={0.5} />
            <NumInput label="厚度" value={config.aquifer.thickness} onChange={v => updateAquifer({ thickness: v })} unit="m" />
            <NumInput label="给水度" value={config.aquifer.specificYield} onChange={v => updateAquifer({ specificYield: v })} step={0.01} />
            <NumInput label="补给强度" value={config.aquifer.rechargeRate} onChange={v => updateAquifer({ rechargeRate: v })} unit="mm/a" step={5} />
            <NumInput label="初始水位" value={config.initialHead} onChange={v => setConfig({ ...config, initialHead: v })} unit="m" step={0.5} />
            <NumInput label="收敛容差" value={config.convergenceTolerance} onChange={v => setConfig({ ...config, convergenceTolerance: v })} unit="m" step={0.001} />
            <NumInput label="SOR因子" value={config.sorFactor ?? 1.5} onChange={v => setConfig({ ...config, sorFactor: v })} step={0.05} />
          </div>
        </TechCard>

        <TechCard>
          <div className="flex items-center gap-2 mb-3">
            <Layers size={16} className="text-purple-400" />
            <h4 className="text-sm font-semibold text-gw-text">边界条件</h4>
          </div>
          <div className="space-y-2">
            {(['north', 'south', 'east', 'west'] as const).map(edge => {
              const edgeLabel: Record<typeof edge, string> = {
                north: '北边界', south: '南边界', east: '东边界', west: '西边界',
              };
              return (
                <div key={edge} className="flex items-center gap-2">
                  <span className="text-[10px] text-gw-muted w-12">{edgeLabel[edge]}</span>
                  <select
                    value={config.boundary[edge]}
                    onChange={e => updateBoundary(edge, 'type', e.target.value as BoundaryType)}
                    className="flex-1 px-2 py-1 text-[10px] bg-gw-surface border border-gw-border rounded text-gw-text"
                  >
                    <option value="fixed-head">定水头</option>
                    <option value="no-flow">隔水边界</option>
                    <option value="general-head">通用水头</option>
                    <option value="recharge">补给边界</option>
                  </select>
                  {config.boundary[edge] === 'fixed-head' && (
                    <input
                      type="number"
                      value={(config.boundary as Record<string, unknown>)[`${edge}Value`] as number ?? 0}
                      onChange={e => updateBoundary(edge, 'value', +e.target.value)}
                      className="w-16 px-1 py-1 text-[10px] bg-gw-surface border border-gw-border rounded text-gw-text"
                      step={0.5}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-gw-border">
            <SelectInput
              label="模拟类型"
              value={config.isTransient ? 'transient' : 'steady'}
              onChange={v => setConfig({ ...config, isTransient: v === 'transient' })}
              options={[
                { value: 'steady', label: '稳定流' },
                { value: 'transient', label: '非稳定流' },
              ]}
            />
            {config.isTransient && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <NumInput label="时间步数" value={config.timeSteps ?? 12} onChange={v => setConfig({ ...config, timeSteps: v })} />
                <NumInput label="步长" value={config.dt ?? 30} onChange={v => setConfig({ ...config, dt: v })} unit="d" step={5} />
              </div>
            )}
          </div>
        </TechCard>
      </div>

      <TechCard>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Droplets size={16} className="text-blue-400" />
            <h4 className="text-sm font-semibold text-gw-text">开采井设置</h4>
          </div>
          <button onClick={addWell} className="px-2 py-1 text-[10px] bg-gw-blue/15 text-gw-highlight rounded border border-gw-blue/30 hover:bg-gw-blue/25">
            + 添加井
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gw-muted text-[10px] border-b border-gw-border">
                <th className="text-left py-1 px-2">标签</th>
                <th className="text-center py-1 px-2">行</th>
                <th className="text-center py-1 px-2">列</th>
                <th className="text-center py-1 px-2">开采量 (m³/d)</th>
                <th className="text-center py-1 px-2">操作</th>
              </tr>
            </thead>
            <tbody>
              {wells.map((w, idx) => (
                <tr key={idx} className="border-b border-gw-border/50">
                  <td className="py-1 px-2">
                    <input value={w.label ?? ''} onChange={e => updateWell(idx, { label: e.target.value })} className="w-full px-1 py-0.5 text-xs bg-gw-surface border border-gw-border rounded" />
                  </td>
                  <td className="py-1 px-2 text-center">
                    <input type="number" value={w.row} onChange={e => updateWell(idx, { row: +e.target.value })} className="w-12 px-1 py-0.5 text-xs bg-gw-surface border border-gw-border rounded text-center" />
                  </td>
                  <td className="py-1 px-2 text-center">
                    <input type="number" value={w.col} onChange={e => updateWell(idx, { col: +e.target.value })} className="w-12 px-1 py-0.5 text-xs bg-gw-surface border border-gw-border rounded text-center" />
                  </td>
                  <td className="py-1 px-2 text-center">
                    <input type="number" value={w.rate} onChange={e => updateWell(idx, { rate: +e.target.value })} className="w-20 px-1 py-0.5 text-xs bg-gw-surface border border-gw-border rounded text-center" step={100} />
                  </td>
                  <td className="py-1 px-2 text-center">
                    <button onClick={() => removeWell(idx)} className="text-red-400 hover:text-red-300 text-[10px]">删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>
    </div>
  );
}

// ── 面板2: 流场模拟 ──
function FlowSimulationPanel({ config, wells }: { config: SimulationConfig; wells: PumpingWell[] }) {
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [running, setRunning] = useState(false);

  const runSimulation = useCallback(() => {
    setRunning(true);
    setTimeout(() => {
      const simConfig = { ...config, wells };
      const res = config.isTransient ? solveTransientFlow(simConfig) : solveSteadyFlow(simConfig);
      setResult(res);
      setRunning(false);
    }, 50);
  }, [config, wells]);

  const drawdownStats = useMemo(() => {
    if (!result) return null;
    return calcDrawdownStats(result.drawdown, config.grid.rows, config.grid.cols);
  }, [result, config.grid]);

  const velocityStats = useMemo(() => {
    if (!result) return null;
    return calcVelocityStats(result.velocity, config.grid.rows, config.grid.cols);
  }, [result, config.grid]);

  const budgetData = useMemo(() => {
    if (!result) return [];
    return [
      { name: '补给量', value: Number(result.totalRecharge.toFixed(1)), color: '#10b981' },
      { name: '边界流入', value: Number((result.budgetIn - result.totalRecharge).toFixed(1)), color: '#06b6d4' },
      { name: '开采量', value: -Number(result.totalPumping.toFixed(1)), color: '#ef4444' },
      { name: '边界流出', value: -Number((result.budgetOut - result.totalPumping).toFixed(1)), color: '#f59e0b' },
    ];
  }, [result]);

  const timeSeriesData = useMemo(() => {
    if (!result?.timeSeries || result.timeSeries.length === 0) return [];
    const centerRow = Math.floor(config.grid.rows / 2);
    const centerCol = Math.floor(config.grid.cols / 2);
    return result.timeSeries.map((step, idx) => ({
      step: idx + 1,
      head: step[centerRow][centerCol],
    }));
  }, [result, config.grid]);

  return (
    <div className="space-y-4">
      <TechCard>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Play size={16} className="text-green-400" />
            <h4 className="text-sm font-semibold text-gw-text">
              {config.isTransient ? '非稳定流模拟' : '稳定流模拟'}
            </h4>
            {result && (
              <span className={`text-[10px] px-2 py-0.5 rounded ${result.converged ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {result.converged ? '已收敛' : '未收敛'}
              </span>
            )}
          </div>
          <button
            onClick={runSimulation}
            disabled={running}
            className="px-4 py-1.5 text-xs bg-gw-blue/20 text-gw-highlight rounded-lg border border-gw-blue/30 hover:bg-gw-blue/30 disabled:opacity-50"
          >
            {running ? '计算中...' : '运行模拟'}
          </button>
        </div>
        {result && (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-3">
            <div className="text-center p-2 bg-gw-surface rounded">
              <div className="text-[10px] text-gw-muted">迭代次数</div>
              <div className="text-sm font-bold text-gw-text">{result.iterations}</div>
            </div>
            <div className="text-center p-2 bg-gw-surface rounded">
              <div className="text-[10px] text-gw-muted">总开采量</div>
              <div className="text-sm font-bold text-blue-400">{result.totalPumping.toFixed(0)}</div>
            </div>
            <div className="text-center p-2 bg-gw-surface rounded">
              <div className="text-[10px] text-gw-muted">总补给量</div>
              <div className="text-sm font-bold text-green-400">{result.totalRecharge.toFixed(0)}</div>
            </div>
            <div className="text-center p-2 bg-gw-surface rounded">
              <div className="text-[10px] text-gw-muted">平衡误差</div>
              <div className="text-sm font-bold text-gw-text">{result.massBalanceError.toFixed(2)}%</div>
            </div>
            {drawdownStats && (
              <>
                <div className="text-center p-2 bg-gw-surface rounded">
                  <div className="text-[10px] text-gw-muted">最大降深</div>
                  <div className="text-sm font-bold text-orange-400">{drawdownStats.maxDrawdown.toFixed(2)}m</div>
                </div>
                <div className="text-center p-2 bg-gw-surface rounded">
                  <div className="text-[10px] text-gw-muted">平均降深</div>
                  <div className="text-sm font-bold text-amber-400">{drawdownStats.avgDrawdown.toFixed(2)}m</div>
                </div>
              </>
            )}
          </div>
        )}
      </TechCard>

      {result && (
        <>
          <div className="grid md:grid-cols-2 gap-4">
            <TechCard>
              <div className="flex items-center gap-2 mb-3">
                <Waves size={16} className="text-cyan-400" />
                <h4 className="text-sm font-semibold text-gw-text">水头分布热力图</h4>
              </div>
              <HeadHeatmap result={result} rows={config.grid.rows} cols={config.grid.cols} />
              <div className="mt-2 text-[10px] text-gw-muted">
                网格 {config.grid.rows}x{config.grid.cols}，间距 {config.grid.cellSize}m，总面积 {(config.grid.rows * config.grid.cols * config.grid.cellSize * config.grid.cellSize / 1_000_000).toFixed(1)} km²
              </div>
            </TechCard>

            <TechCard>
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown size={16} className="text-orange-400" />
                <h4 className="text-sm font-semibold text-gw-text">降深分布图</h4>
              </div>
              <DrawdownHeatmap drawdown={result.drawdown} rows={config.grid.rows} cols={config.grid.cols} />
              {drawdownStats && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div className="text-center text-[10px]">
                    <span className="text-blue-400">{drawdownStats.above1mPercent.toFixed(1)}%</span>
                    <span className="text-gw-muted"> &gt;1m</span>
                  </div>
                  <div className="text-center text-[10px]">
                    <span className="text-amber-400">{drawdownStats.above5mPercent.toFixed(1)}%</span>
                    <span className="text-gw-muted"> &gt;5m</span>
                  </div>
                  <div className="text-center text-[10px]">
                    <span className="text-red-400">{drawdownStats.above10mPercent.toFixed(1)}%</span>
                    <span className="text-gw-muted"> &gt;10m</span>
                  </div>
                </div>
              )}
            </TechCard>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <TechCard>
              <div className="flex items-center gap-2 mb-3">
                <Activity size={16} className="text-green-400" />
                <h4 className="text-sm font-semibold text-gw-text">水量平衡</h4>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={budgetData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} width={60} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {budgetData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="text-[10px] text-gw-muted mt-1">正值为流入，负值为流出 (m³/d)</div>
            </TechCard>

            {timeSeriesData.length > 0 && (
              <TechCard>
                <div className="flex items-center gap-2 mb-3">
                  <Gauge size={16} className="text-purple-400" />
                  <h4 className="text-sm font-semibold text-gw-text">中心点水位变化（非稳定流）</h4>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="step" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '时间步', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '水头 (m)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
                    <Tooltip {...TOOLTIP_STYLE} />
                    <Line type="monotone" dataKey="head" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </TechCard>
            )}
          </div>

          {velocityStats && (
            <TechCard>
              <div className="flex items-center gap-2 mb-3">
                <ArrowRight size={16} className="text-cyan-400" />
                <h4 className="text-sm font-semibold text-gw-text">达西流速统计</h4>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gw-surface rounded-lg">
                  <div className="text-[10px] text-gw-muted">最大流速</div>
                  <div className="text-lg font-bold text-cyan-400">{velocityStats.maxVelocity.toFixed(4)}</div>
                  <div className="text-[10px] text-gw-muted">m/d</div>
                </div>
                <div className="p-3 bg-gw-surface rounded-lg">
                  <div className="text-[10px] text-gw-muted">平均流速</div>
                  <div className="text-lg font-bold text-blue-400">{velocityStats.avgVelocity.toFixed(4)}</div>
                  <div className="text-[10px] text-gw-muted">m/d</div>
                </div>
              </div>
            </TechCard>
          )}
        </>
      )}
    </div>
  );
}

// ── 面板3: 反演校准 ──
function CalibrationPanel({ config, areaId }: { config: SimulationConfig; areaId: string }) {
  const [observations, setObservations] = useState<ObservationPoint[]>(
    PRESET_OBSERVATION_POINTS[areaId] ?? []
  );
  const [result, setResult] = useState<CalibrationResult | null>(null);
  const [running, setRunning] = useState(false);

  const runCalibration = useCallback(() => {
    setRunning(true);
    setTimeout(() => {
      const res = calibrateParameters(config, observations, 30);
      setResult(res);
      setRunning(false);
    }, 50);
  }, [config, observations]);

  const scatterData = useMemo(() => {
    if (!result) return [];
    return result.observedVsComputed.map(oc => ({
      observed: oc.observed,
      computed: oc.computed,
      label: oc.label,
    }));
  }, [result]);

  const scatterRange = useMemo(() => {
    if (scatterData.length === 0) return { min: 0, max: 1 };
    const all = scatterData.flatMap(d => [d.observed, d.computed]);
    return { min: Math.min(...all) - 2, max: Math.max(...all) + 2 };
  }, [scatterData]);

  const obsTableRows = useMemo(() => {
    if (!result) return [];
    return result.observedVsComputed.map((oc, idx) => [
      oc.label ?? `观测点${idx + 1}`,
      oc.observed.toFixed(2),
      oc.computed.toFixed(2),
      oc.residual.toFixed(2),
      Math.abs(oc.residual) < 1 ? '优' : Math.abs(oc.residual) < 3 ? '良' : '差',
    ]);
  }, [result]);

  return (
    <div className="space-y-4">
      <TechCard>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Crosshair size={16} className="text-amber-400" />
            <h4 className="text-sm font-semibold text-gw-text">观测点设置</h4>
          </div>
          <button
            onClick={() => setObservations([...observations, { row: 5, col: 5, observedHead: 30, label: `观测点${observations.length + 1}` }])}
            className="px-2 py-1 text-[10px] bg-amber-500/15 text-amber-400 rounded border border-amber-500/30 hover:bg-amber-500/25"
          >
            + 添加观测点
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gw-muted text-[10px] border-b border-gw-border">
                <th className="text-left py-1 px-2">标签</th>
                <th className="text-center py-1 px-2">行</th>
                <th className="text-center py-1 px-2">列</th>
                <th className="text-center py-1 px-2">观测水位 (m)</th>
                <th className="text-center py-1 px-2">操作</th>
              </tr>
            </thead>
            <tbody>
              {observations.map((obs, idx) => (
                <tr key={idx} className="border-b border-gw-border/50">
                  <td className="py-1 px-2">
                    <input value={obs.label ?? ''} onChange={e => {
                      const next = [...observations]; next[idx] = { ...obs, label: e.target.value }; setObservations(next);
                    }} className="w-full px-1 py-0.5 text-xs bg-gw-surface border border-gw-border rounded" />
                  </td>
                  <td className="py-1 px-2 text-center">
                    <input type="number" value={obs.row} onChange={e => {
                      const next = [...observations]; next[idx] = { ...obs, row: +e.target.value }; setObservations(next);
                    }} className="w-12 px-1 py-0.5 text-xs bg-gw-surface border border-gw-border rounded text-center" />
                  </td>
                  <td className="py-1 px-2 text-center">
                    <input type="number" value={obs.col} onChange={e => {
                      const next = [...observations]; next[idx] = { ...obs, col: +e.target.value }; setObservations(next);
                    }} className="w-12 px-1 py-0.5 text-xs bg-gw-surface border border-gw-border rounded text-center" />
                  </td>
                  <td className="py-1 px-2 text-center">
                    <input type="number" value={obs.observedHead} onChange={e => {
                      const next = [...observations]; next[idx] = { ...obs, observedHead: +e.target.value }; setObservations(next);
                    }} className="w-20 px-1 py-0.5 text-xs bg-gw-surface border border-gw-border rounded text-center" step={0.5} />
                  </td>
                  <td className="py-1 px-2 text-center">
                    <button onClick={() => setObservations(observations.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-300 text-[10px]">删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>

      <TechCard>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Settings size={16} className="text-blue-400" />
            <h4 className="text-sm font-semibold text-gw-text">参数反演校准</h4>
            {result && (
              <span className={`text-[10px] px-2 py-0.5 rounded ${result.converged ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                {result.converged ? '已收敛' : '未完全收敛'}
              </span>
            )}
          </div>
          <button
            onClick={runCalibration}
            disabled={running}
            className="px-4 py-1.5 text-xs bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 disabled:opacity-50"
          >
            {running ? '校准中...' : '运行校准'}
          </button>
        </div>

        {result && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <div className="text-center p-2 bg-gw-surface rounded">
                <div className="text-[10px] text-gw-muted">校准Kx</div>
                <div className="text-sm font-bold text-cyan-400">{result.calibratedKx.toFixed(2)}</div>
                <div className="text-[9px] text-gw-muted">m/d</div>
              </div>
              <div className="text-center p-2 bg-gw-surface rounded">
                <div className="text-[10px] text-gw-muted">校准Ky</div>
                <div className="text-sm font-bold text-blue-400">{result.calibratedKy.toFixed(2)}</div>
                <div className="text-[9px] text-gw-muted">m/d</div>
              </div>
              <div className="text-center p-2 bg-gw-surface rounded">
                <div className="text-[10px] text-gw-muted">校准补给</div>
                <div className="text-sm font-bold text-green-400">{result.calibratedRecharge.toFixed(1)}</div>
                <div className="text-[9px] text-gw-muted">mm/a</div>
              </div>
              <div className="text-center p-2 bg-gw-surface rounded">
                <div className="text-[10px] text-gw-muted">RMSE</div>
                <div className={`text-sm font-bold ${result.rmse < 1 ? 'text-green-400' : result.rmse < 3 ? 'text-amber-400' : 'text-red-400'}`}>
                  {result.rmse.toFixed(3)}
                </div>
                <div className="text-[9px] text-gw-muted">m</div>
              </div>
              <div className="text-center p-2 bg-gw-surface rounded">
                <div className="text-[10px] text-gw-muted">R²</div>
                <div className={`text-sm font-bold ${result.rSquared > 0.9 ? 'text-green-400' : result.rSquared > 0.7 ? 'text-amber-400' : 'text-red-400'}`}>
                  {result.rSquared.toFixed(4)}
                </div>
                <div className="text-[9px] text-gw-muted">决定系数</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <h5 className="text-xs font-medium text-gw-text mb-2">观测值 vs 计算值散点图</h5>
                <ResponsiveContainer width="100%" height={250}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      type="number"
                      dataKey="observed"
                      domain={[scatterRange.min, scatterRange.max]}
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      label={{ value: '观测水位 (m)', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 10 }}
                    />
                    <YAxis
                      type="number"
                      dataKey="computed"
                      domain={[scatterRange.min, scatterRange.max]}
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      label={{ value: '计算水位 (m)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }}
                    />
                    <ZAxis range={[60, 60]} />
                    <Tooltip {...TOOLTIP_STYLE} cursor={{ strokeDasharray: '3 3' }} />
                    <ReferenceLine
                      segment={[{ x: scatterRange.min, y: scatterRange.min }, { x: scatterRange.max, y: scatterRange.max }]}
                      stroke="#10b981"
                      strokeWidth={1.5}
                      strokeDasharray="5 5"
                    />
                    <Scatter data={scatterData} fill="#06b6d4" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h5 className="text-xs font-medium text-gw-text mb-2">残差分布</h5>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={result.observedVsComputed.map((oc, idx) => ({ name: oc.label ?? `点${idx + 1}`, residual: oc.residual }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9 }} angle={-30} textAnchor="end" height={50} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '残差 (m)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
                    <Tooltip {...TOOLTIP_STYLE} />
                    <ReferenceLine y={0} stroke="#64748b" />
                    <Bar dataKey="residual" radius={[2, 2, 0, 0]}>
                      {result.observedVsComputed.map((oc, idx) => (
                        <Cell key={idx} fill={Math.abs(oc.residual) < 1 ? '#10b981' : Math.abs(oc.residual) < 3 ? '#f59e0b' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {obsTableRows.length > 0 && (
              <div className="mt-4">
                <h5 className="text-xs font-medium text-gw-text mb-2">观测点校准结果明细</h5>
                <FilterableTechTable
                  headers={['观测点', '观测值(m)', '计算值(m)', '残差(m)', '评级']}
                  rows={obsTableRows}
                />
              </div>
            )}
          </>
        )}
      </TechCard>
    </div>
  );
}

// ── 面板4: 情景预测 ──
function ScenarioPanel({ config, wells }: { config: SimulationConfig; wells: PumpingWell[] }) {
  const [results, setResults] = useState<ReturnType<typeof predictScenarios> | null>(null);
  const [running, setRunning] = useState(false);

  const runScenarios = useCallback(() => {
    setRunning(true);
    setTimeout(() => {
      const scenarios = PRESET_SCENARIOS.map(s => ({
        name: s.name,
        description: s.description,
        wells: wells.map(w => ({ ...w, rate: w.rate * s.wellMultiplier })),
        rechargeRate: config.aquifer.rechargeRate * s.rechargeMultiplier,
      }));
      const res = predictScenarios(config, scenarios);
      setResults(res);
      setRunning(false);
    }, 50);
  }, [config, wells]);

  const compareData = useMemo(() => {
    if (!results) return [];
    return results.map(r => ({
      name: r.scenarioName,
      maxDrawdown: Number(r.maxDrawdown.toFixed(2)),
      avgDrawdown: Number(r.avgDrawdown.toFixed(2)),
      drawdownArea: Number(r.drawdownArea.toFixed(1)),
      influenceRadius: Number(r.coneOfInfluence.toFixed(0)),
    }));
  }, [results]);

  return (
    <div className="space-y-4">
      <TechCard>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-purple-400" />
            <h4 className="text-sm font-semibold text-gw-text">情景预测方案</h4>
          </div>
          <button
            onClick={runScenarios}
            disabled={running}
            className="px-4 py-1.5 text-xs bg-purple-500/20 text-purple-400 rounded-lg border border-purple-500/30 hover:bg-purple-500/30 disabled:opacity-50"
          >
            {running ? '计算中...' : '运行情景预测'}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          {PRESET_SCENARIOS.map(s => (
            <div key={s.name} className="p-2 bg-gw-surface rounded-lg border border-gw-border">
              <div className="text-xs font-medium text-gw-text">{s.name}</div>
              <div className="text-[10px] text-gw-muted mt-0.5">{s.description}</div>
            </div>
          ))}
        </div>
      </TechCard>

      {results && (
        <>
          <TechCard>
            <h4 className="text-sm font-semibold text-gw-text mb-3">方案对比 — 降深与影响范围</h4>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={compareData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
                <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '降深 (m)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '面积 (km²)', angle: 90, position: 'insideRight', fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar yAxisId="left" dataKey="maxDrawdown" name="最大降深" fill="#ef4444" radius={[3, 3, 0, 0]} barSize={20} />
                <Bar yAxisId="left" dataKey="avgDrawdown" name="平均降深" fill="#f59e0b" radius={[3, 3, 0, 0]} barSize={20} />
                <Line yAxisId="right" type="monotone" dataKey="drawdownArea" name="影响面积" stroke="#06b6d4" strokeWidth={2} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </TechCard>

          <div className="grid md:grid-cols-2 gap-4">
            {results.map((r, idx) => (
              <TechCard key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-medium text-gw-text">{r.scenarioName}</h5>
                  <span className={`text-[10px] px-2 py-0.5 rounded ${
                    r.maxDrawdown > 10 ? 'bg-red-500/20 text-red-400' :
                    r.maxDrawdown > 5 ? 'bg-orange-500/20 text-orange-400' :
                    r.maxDrawdown > 1 ? 'bg-amber-500/20 text-amber-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    最大降深 {r.maxDrawdown.toFixed(2)}m
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center p-1.5 bg-gw-surface rounded">
                    <div className="text-[10px] text-gw-muted">平均降深</div>
                    <div className="text-sm font-bold text-amber-400">{r.avgDrawdown.toFixed(2)}m</div>
                  </div>
                  <div className="text-center p-1.5 bg-gw-surface rounded">
                    <div className="text-[10px] text-gw-muted">影响面积</div>
                    <div className="text-sm font-bold text-cyan-400">{r.drawdownArea.toFixed(1)}km²</div>
                  </div>
                  <div className="text-center p-1.5 bg-gw-surface rounded">
                    <div className="text-[10px] text-gw-muted">影响半径</div>
                    <div className="text-sm font-bold text-purple-400">{r.coneOfInfluence.toFixed(0)}m</div>
                  </div>
                  <div className="text-center p-1.5 bg-gw-surface rounded">
                    <div className="text-[10px] text-gw-muted">井间干扰</div>
                    <div className="text-sm font-bold text-blue-400">{r.wellInterference.toFixed(2)}m</div>
                  </div>
                </div>
                <DrawdownHeatmap drawdown={r.result.drawdown} rows={config.grid.rows} cols={config.grid.cols} />
              </TechCard>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── 面板5: 参考说明 ──
function ReferencePanel() {
  return (
    <div className="space-y-4">
      <CollapsiblePanel title="有限差分法原理" defaultOpen icon={BookOpen}>
        <div className="text-xs text-gw-muted space-y-2 leading-relaxed">
          <p><strong className="text-gw-text">控制方程</strong>（二维承压含水层非稳定流）：</p>
          <div className="bg-gw-surface p-3 rounded font-mono text-[11px] text-gw-text">
            d/dx(T_x . dh/dx) + d/dy(T_y . dh/dy) + W = S . dh/dt
          </div>
          <p>其中 T 为导水系数 (m²/d)，h 为水头 (m)，W 为源汇项 (m³/d/m²)，S 为储水系数。</p>
          <p><strong className="text-gw-text">离散化</strong>：对每个网格节点 (i,j)，将偏微分方程替换为差分方程，得到线性方程组。采用中心差分格式，二阶精度。</p>
          <p><strong className="text-gw-text">迭代求解</strong>：Gauss-Seidel 迭代 + SOR (Successive Over-Relaxation) 加速。SOR 因子 范围 [1.0, 2.0]，默认 1.5。收敛条件为最大水头变化量小于容差。</p>
        </div>
      </CollapsiblePanel>

      <CollapsiblePanel title="边界条件类型" icon={Layers}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gw-muted text-[10px] border-b border-gw-border">
                <th className="text-left py-1 px-2">类型</th>
                <th className="text-left py-1 px-2">物理含义</th>
                <th className="text-left py-1 px-2">数学表达</th>
              </tr>
            </thead>
            <tbody className="text-gw-text">
              <tr className="border-b border-gw-border/50">
                <td className="py-1 px-2 text-cyan-400">定水头</td>
                <td className="py-1 px-2">边界水位恒定（河流/湖泊）</td>
                <td className="py-1 px-2 font-mono">h = h0</td>
              </tr>
              <tr className="border-b border-gw-border/50">
                <td className="py-1 px-2 text-purple-400">隔水边界</td>
                <td className="py-1 px-2">无流量通过（基岩/断层）</td>
                <td className="py-1 px-2 font-mono">dh/dn = 0</td>
              </tr>
              <tr className="border-b border-gw-border/50">
                <td className="py-1 px-2 text-blue-400">通用水头</td>
                <td className="py-1 px-2">远场水头+导水阻力</td>
                <td className="py-1 px-2 font-mono">Q = C.(h_ext - h)</td>
              </tr>
              <tr>
                <td className="py-1 px-2 text-green-400">补给边界</td>
                <td className="py-1 px-2">面状补给（降雨入渗）</td>
                <td className="py-1 px-2 font-mono">W = R . dx . dy</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CollapsiblePanel>

      <CollapsiblePanel title="参数校准方法" icon={Settings}>
        <div className="text-xs text-gw-muted space-y-2 leading-relaxed">
          <p><strong className="text-gw-text">校准目标</strong>：调整渗透系数 K 和补给量 R，使模拟水头与观测水头偏差最小化。</p>
          <p><strong className="text-gw-text">优化方法</strong>：基于梯度的迭代修正（Gauss-Marquardt 简化版）。每步对三个参数（Kx, Ky, Recharge）进行扰动，计算目标函数（RMSE）对每个参数的敏感度，沿最陡下降方向更新。</p>
          <p><strong className="text-gw-text">评价指标</strong>：</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong className="text-gw-text">RMSE</strong>（均方根误差）：小于 1m 为优，1-3m 为良，大于 3m 需改进</li>
            <li><strong className="text-gw-text">MAE</strong>（平均绝对误差）：反映整体偏差水平</li>
            <li><strong className="text-gw-text">R²</strong>（决定系数）：大于 0.9 为优，0.7-0.9 为良，小于 0.7 需改进</li>
          </ul>
          <p><strong className="text-gw-text">步长衰减</strong>：每轮迭代步长乘以 0.95，确保后期精细搜索。收敛容差 0.5m。</p>
        </div>
      </CollapsiblePanel>

      <CollapsiblePanel title="预设研究区域说明" icon={MapPin}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gw-muted text-[10px] border-b border-gw-border">
                <th className="text-left py-1 px-2">区域</th>
                <th className="text-center py-1 px-2">含水层类型</th>
                <th className="text-center py-1 px-2">Kx (m/d)</th>
                <th className="text-center py-1 px-2">厚度 (m)</th>
                <th className="text-center py-1 px-2">补给 (mm/a)</th>
                <th className="text-center py-1 px-2">网格</th>
              </tr>
            </thead>
            <tbody className="text-gw-text">
              {PRESET_MODEL_AREAS.map(a => (
                <tr key={a.id} className="border-b border-gw-border/50">
                  <td className="py-1 px-2">{a.name}</td>
                  <td className="py-1 px-2 text-center">{AQUIFER_TYPE_LABEL[a.aquifer.type]}</td>
                  <td className="py-1 px-2 text-center">{a.aquifer.kx}</td>
                  <td className="py-1 px-2 text-center">{a.aquifer.thickness}</td>
                  <td className="py-1 px-2 text-center">{a.aquifer.rechargeRate}</td>
                  <td className="py-1 px-2 text-center text-[10px]">{a.grid.rows}x{a.grid.cols}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsiblePanel>

      <DataSourceNote source="MODFLOW 2005 用户指南 | 薛禹群《地下水数值模拟》| 河北省水文地质图集 | 河北省地下水超采区评价报告(2022)" />
    </div>
  );
}

// ── 主组件 ──
export function NumericalFlowSimulatorTab() {
  const [activePanel, setActivePanel] = useState<number>(0);

  const [areaId, setAreaId] = useState<string>('taihang-piedmont');
  const initialArea = PRESET_MODEL_AREAS[0];
  const [config, setConfig] = useState<SimulationConfig>({
    grid: { ...initialArea.grid },
    aquifer: { ...initialArea.aquifer },
    boundary: { ...initialArea.boundary },
    wells: [...initialArea.wells],
    initialHead: initialArea.initialHead,
    isTransient: false,
    maxIterations: 500,
    convergenceTolerance: 0.01,
    sorFactor: 1.5,
  });
  const [wells, setWells] = useState<PumpingWell[]>([...initialArea.wells]);

  const panels = [
    { key: 0, label: '模型设置', icon: Settings },
    { key: 1, label: '流场模拟', icon: Waves },
    { key: 2, label: '反演校准', icon: Crosshair },
    { key: 3, label: '情景预测', icon: BookOpen },
    { key: 4, label: '参考说明', icon: Layers },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-gw-surface rounded-lg p-1 overflow-x-auto scrollbar-none">
        {panels.map(p => (
          <button
            key={p.key}
            onClick={() => setActivePanel(p.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs transition-all whitespace-nowrap ${
              activePanel === p.key
                ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30'
                : 'text-gw-muted hover:text-gw-text'
            }`}
          >
            <p.icon size={14} />
            {p.label}
          </button>
        ))}
      </div>

      {activePanel === 0 && (
        <ModelSetupPanel
          areaId={areaId}
          setAreaId={setAreaId}
          config={config}
          setConfig={setConfig}
          wells={wells}
          setWells={setWells}
        />
      )}
      {activePanel === 1 && <FlowSimulationPanel config={config} wells={wells} />}
      {activePanel === 2 && <CalibrationPanel config={config} areaId={areaId} />}
      {activePanel === 3 && <ScenarioPanel config={config} wells={wells} />}
      {activePanel === 4 && <ReferencePanel />}
    </div>
  );
}
