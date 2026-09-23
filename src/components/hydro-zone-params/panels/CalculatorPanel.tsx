/**
 * B-25 地下水数值模拟参数估算器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 水力参数转换+网格估算+稳定性判断+时间步长
 *  2. 模型校准 — 观测/模拟数据对比+NSE/RMSE/R²等指标
 *  3. 预设分区 — 6个河北典型数值模拟区参数对比
 *  4. 参考方法 — 数值方法+稳定性准则+校准标准
 * 面板组件：CalculatorPanel（拆分自 NumericalModelCalculatorTab.tsx）
 */

import { useState, useMemo } from 'react';
import { Calculator, Gauge, MapPin } from 'lucide-react';
import { TechCard } from '../../UI';
import { calcHydraulicParams, calcGridParams, calcStability, calcTimeStep, type HydraulicParamInput, type StabilityInput, type TimeStepInput } from '../../../utils/numericalModelCalculator';

// ── 面板1: 计算器 ──
export function CalculatorPanel() {
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
