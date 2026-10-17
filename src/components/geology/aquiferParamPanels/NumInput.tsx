/**
 * 面板: NumInput（拆分自 AquiferParamTab.tsx）
 */
export function NumInput({ label, value, onChange, unit, placeholder,}: { label: string; value: number; onChange: (v: number) => void; unit?: string; placeholder?: string;}) {
  return (
    <div className="flex flex-col gap-0.5">
      <label className="text-[10px] text-gw-muted">{label}</label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          step="any"
          value={value || ''}
          onChange={e => onChange(Number(e.target.value) || 0)}
          placeholder={placeholder ?? '0'}
          className="w-28 bg-transparent border border-gw-border/30 rounded px-2 py-1 text-sm text-gw-text
            focus:border-gw-blue/50 focus:outline-none focus:ring-1 focus:ring-gw-blue/30"
        />
        {unit && <span className="text-[10px] text-gw-muted whitespace-nowrap">{unit}</span>}
      </div>
    </div>
  );
}
