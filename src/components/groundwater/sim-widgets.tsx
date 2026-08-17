import React from 'react';
import type { SimulationResult } from '../../utils/numericalFlowSimulator';
import { getHeatColor, HEAT_COLORS } from './sim-constants';

export function NumInput({
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

export function SelectInput<T extends string>({
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

export function HeadHeatmap({ result, rows, cols }: { result: SimulationResult; rows: number; cols: number }) {
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

export function DrawdownHeatmap({ drawdown, rows, cols }: { drawdown: number[][]; rows: number; cols: number }) {
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
