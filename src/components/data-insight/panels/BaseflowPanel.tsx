/**
 * BaseflowPanel — 交互分析面板（自 GwSwInteractionTab.tsx 拆分）
 */
import { useState, useMemo } from 'react';
import {
  ComposedChart, Line, Bar, BarChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Droplets } from 'lucide-react';
import { TechCard } from '../../UI';
import { PRESET_RIVERS, calcBaseflowSeparation } from '../../../utils/gwSwInteractionCalculator';
import { TOOLTIP_STYLE } from '../gwSwConstants';
import { NumInput } from './NumInput';

// ── 面板1: 基流分割 ──
export function BaseflowPanel({ riverId }: { riverId: string }) {
  const river = PRESET_RIVERS.find(r => r.id === riverId)!;
  const [method, setMethod] = useState<'bfi' | 'chapman' | 'eckhardt'>( 'eckhardt');
  const [alpha, setAlpha] = useState(0.925);
  const [bfiMax, setBfiMax] = useState(0.80);

  const result = useMemo(() =>
    calcBaseflowSeparation(river.dailyFlow, method, { alpha, bfiMax, area: river.area }),
  [river, method, alpha, bfiMax]);

  // 多方法对比
  const allResults = useMemo(() => ({
    bfi: calcBaseflowSeparation(river.dailyFlow, 'bfi', { area: river.area }),
    chapman: calcBaseflowSeparation(river.dailyFlow, 'chapman', { alpha, area: river.area }),
    eckhardt: calcBaseflowSeparation(river.dailyFlow, 'eckhardt', { alpha, bfiMax, area: river.area }),
  }), [river, alpha, bfiMax]);

  const compareData = useMemo(() => [
    { method: 'BFI法', baseflow: allResults.bfi.baseflow, index: Number((allResults.bfi.baseflowIndex * 100).toFixed(1)) },
    { method: 'Chapman', baseflow: allResults.chapman.baseflow, index: Number((allResults.chapman.baseflowIndex * 100).toFixed(1)) },
    { method: 'Eckhardt', baseflow: allResults.eckhardt.baseflow, index: Number((allResults.eckhardt.baseflowIndex * 100).toFixed(1)) },
  ], [allResults]);

  return (
    <div className="space-y-4">
      <TechCard>
        <div className="flex items-center gap-2 mb-3">
          <Droplets size={16} className="text-cyan-400" />
          <h4 className="text-sm font-semibold text-gw-text">基流分割参数</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div>
            <label className="block text-[10px] text-gw-muted mb-0.5">分割方法</label>
            <select value={method} onChange={e => setMethod(e.target.value as 'bfi' | 'chapman' | 'eckhardt')}
              className="w-full px-2 py-1 text-xs bg-gw-surface border border-gw-border rounded text-gw-text">
              <option value="bfi">BFI法（滑块最小值）</option>
              <option value="chapman">Chapman滤波</option>
              <option value="eckhardt">Eckhardt滤波</option>
            </select>
          </div>
          <NumInput label="退水常数 α" value={alpha} onChange={setAlpha} step={0.01} />
          <NumInput label="最大BFI" value={bfiMax} onChange={setBfiMax} step={0.05} />
          <NumInput label="流域面积" value={river.area} onChange={() => {}} unit="km²" />
        </div>
      </TechCard>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="text-center p-3 bg-gw-surface rounded-lg">
          <div className="text-[10px] text-gw-muted">总径流</div>
          <div className="text-lg font-bold text-gw-text">{result.totalRunoff}</div>
          <div className="text-[9px] text-gw-muted">mm</div>
        </div>
        <div className="text-center p-3 bg-gw-surface rounded-lg">
          <div className="text-[10px] text-gw-muted">基流量</div>
          <div className="text-lg font-bold text-cyan-400">{result.baseflow}</div>
          <div className="text-[9px] text-gw-muted">mm</div>
        </div>
        <div className="text-center p-3 bg-gw-surface rounded-lg">
          <div className="text-[10px] text-gw-muted">地表径流</div>
          <div className="text-lg font-bold text-blue-400">{result.surfaceRunoff}</div>
          <div className="text-[9px] text-gw-muted">mm</div>
        </div>
        <div className="text-center p-3 bg-gw-surface rounded-lg">
          <div className="text-[10px] text-gw-muted">基流指数BFI</div>
          <div className="text-lg font-bold text-green-400">{(result.baseflowIndex * 100).toFixed(1)}%</div>
        </div>
      </div>

      <TechCard>
        <h5 className="text-xs font-medium text-gw-text mb-3">径流过程线与基流分割</h5>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={result.dailySeries}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '天', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 10 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '流量 (m³/s)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Area dataKey="total" name="总径流" fill="#1e3a5f" stroke="#06b6d4" strokeWidth={1} fillOpacity={0.3} />
            <Area dataKey="baseflow" name="基流" fill="#10b981" stroke="#10b981" strokeWidth={2} fillOpacity={0.3} />
            <Line dataKey="surface" name="地表径流" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </TechCard>

      <TechCard>
        <h5 className="text-xs font-medium text-gw-text mb-3">三种方法对比</h5>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={compareData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="method" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '基流量(mm)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: 'BFI(%)', angle: 90, position: 'insideRight', fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar yAxisId="left" dataKey="baseflow" name="基流量" fill="#06b6d4" radius={[3, 3, 0, 0]} barSize={30} />
            <Bar yAxisId="right" dataKey="index" name="BFI(%)" fill="#10b981" radius={[3, 3, 0, 0]} barSize={30} />
          </BarChart>
        </ResponsiveContainer>
        <div className="text-[10px] text-gw-muted mt-1">当前方法: {result.method}</div>
      </TechCard>
    </div>
  );
}
