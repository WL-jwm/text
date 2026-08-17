import { TechCard } from '../UI';
import { MapPin, Layers, Grid3x3, Droplets } from 'lucide-react';
import { PRESET_MODEL_AREAS, type SimulationConfig, type BoundaryType, type PumpingWell } from '../../utils/numericalFlowSimulator';
import { NumInput, SelectInput } from './sim-widgets';

export function ModelSetupPanel({
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
