/**
 * 共享输入/统计控件（自 RemediationTab.tsx 拆分）
 */

export function NumberField({ label, value, onChange, unit, step = 0.01 }: {
  label: string; value: number; onChange: (v: number) => void; unit?: string; step?: number;
}) {
  return (
    <div>
      <label className="text-xs text-slate-400 block mb-1">{label}{unit ? ` (${unit})` : ''}</label>
      <input
        type="number"
        value={value}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full bg-slate-800/60 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
      />
    </div>
  );
}

export function StatBox({ label, value, unit, color }: { label: string; value: string | number; unit?: string; color?: string }) {
  return (
    <div className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/50">
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className="text-lg font-semibold" style={{ color: color || '#06b6d4' }}>
        {value}{unit && <span className="text-xs ml-1 text-slate-500">{unit}</span>}
      </div>
    </div>
  );
}
