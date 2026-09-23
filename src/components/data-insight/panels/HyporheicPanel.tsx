/**
 * HyporheicPanel — 交互分析面板（自 GwSwInteractionTab.tsx 拆分）
 */
import { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { Thermometer } from 'lucide-react';
import { TechCard } from '../../UI';
import { calcHyporheicExchange } from '../../../utils/gwSwInteractionCalculator';
import { TOOLTIP_STYLE } from '../gwSwConstants';
import { NumInput } from './NumInput';

// ── 面板3: 河岸带分析 ──
export function HyporheicPanel({ riverId: _riverId }: { riverId: string }) {
  const [riverAmp, setRiverAmp] = useState(5.0);
  const [sedAmp, setSedAmp] = useState(2.5);
  const [depth, setDepth] = useState(0.3);
  const [period, setPeriod] = useState(24);

  const result = useMemo(() =>
    calcHyporheicExchange(riverAmp, sedAmp, depth, period, 0.3, 2.0, 2.5e6),
  [riverAmp, sedAmp, depth, period]);

  const attenuationData = useMemo(() => {
    const data: { depth: number; amplitude: number; phase: number }[] = [];
    for (let z = 0; z <= 2; z += 0.05) {
      const amp = riverAmp * Math.exp(-z / result.dampingDepth);
      const phase = (z / result.dampingDepth) * (period / (2 * Math.PI));
      data.push({ depth: Number(z.toFixed(2)), amplitude: Number(amp.toFixed(3)), phase: Number(phase.toFixed(2)) });
    }
    return data;
  }, [riverAmp, result.dampingDepth, period]);

  return (
    <div className="space-y-4">
      <TechCard>
        <div className="flex items-center gap-2 mb-3">
          <Thermometer size={16} className="text-orange-400" />
          <h4 className="text-sm font-semibold text-gw-text">河岸带温度示踪参数</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <NumInput label="河水温度振幅" value={riverAmp} onChange={setRiverAmp} unit="℃" step={0.5} />
          <NumInput label="沉积物温度振幅" value={sedAmp} onChange={setSedAmp} unit="℃" step={0.5} />
          <NumInput label="测量深度" value={depth} onChange={setDepth} unit="m" step={0.05} />
          <NumInput label="波动周期" value={period} onChange={setPeriod} unit="h" step={1} />
        </div>
      </TechCard>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="text-center p-3 bg-gw-surface rounded-lg">
          <div className="text-[10px] text-gw-muted">振幅衰减比</div>
          <div className="text-lg font-bold text-cyan-400">{result.amplitudeRatio.toFixed(3)}</div>
        </div>
        <div className="text-center p-3 bg-gw-surface rounded-lg">
          <div className="text-[10px] text-gw-muted">相位滞后</div>
          <div className="text-lg font-bold text-purple-400">{result.phaseShift.toFixed(2)}</div>
          <div className="text-[9px] text-gw-muted">h</div>
        </div>
        <div className="text-center p-3 bg-gw-surface rounded-lg">
          <div className="text-[10px] text-gw-muted">阻尼深度</div>
          <div className="text-lg font-bold text-amber-400">{result.dampingDepth.toFixed(3)}</div>
          <div className="text-[9px] text-gw-muted">m</div>
        </div>
        <div className="text-center p-3 bg-gw-surface rounded-lg">
          <div className="text-[10px] text-gw-muted">停留时间</div>
          <div className="text-lg font-bold text-green-400">{result.residenceTime.toFixed(1)}</div>
          <div className="text-[9px] text-gw-muted">h</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <TechCard>
          <h5 className="text-xs font-medium text-gw-text mb-3">温度振幅随深度衰减</h5>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={attenuationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="depth" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '深度 (m)', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 10 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '振幅 (℃)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="amplitude" stroke="#ea580c" strokeWidth={2} dot={false} />
              <ReferenceLine x={depth} stroke="#06b6d4" strokeDasharray="3 3" label={{ value: '测量点', fill: '#06b6d4', fontSize: 9 }} />
            </LineChart>
          </ResponsiveContainer>
        </TechCard>

        <TechCard>
          <h5 className="text-xs font-medium text-gw-text mb-3">相位滞后随深度变化</h5>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={attenuationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="depth" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '深度 (m)', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 10 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '相位 (h)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="phase" stroke="#8b5cf6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </TechCard>
      </div>

      <TechCard>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="p-2 bg-gw-surface rounded">
            <div className="text-[10px] text-gw-muted">热扩散系数</div>
            <div className="text-sm font-bold text-gw-text">{result.thermalDiffusivity}</div>
            <div className="text-[9px] text-gw-muted">m²/s</div>
          </div>
          <div className="p-2 bg-gw-surface rounded">
            <div className="text-[10px] text-gw-muted">交换速率</div>
            <div className="text-sm font-bold text-cyan-400">{result.exchangeRate}</div>
            <div className="text-[9px] text-gw-muted">m/d</div>
          </div>
          <div className="p-2 bg-gw-surface rounded">
            <div className="text-[10px] text-gw-muted">河岸带宽度</div>
            <div className="text-sm font-bold text-purple-400">{result.hyporheicZoneWidth}</div>
            <div className="text-[9px] text-gw-muted">m</div>
          </div>
        </div>
      </TechCard>
    </div>
  );
}
