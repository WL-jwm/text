/**
 * 数值输入控件（自 GwSwInteractionTab.tsx 拆分）
 */

export function NumInput({ label, value, onChange, unit, step = 1 }: {
  label: string; value: number; onChange: (v: number) => void; unit?: string; step?: number;
}) {
  return (
    <div>
      <label className="block text-[10px] text-gw-muted mb-0.5">{label}{unit ? ` (${unit})` : ''}</label>
      <input type="number" step={step} value={value}
        onChange={e => onChange(+e.target.value)}
        className="w-full px-2 py-1 text-xs bg-gw-surface border border-gw-border rounded text-gw-text focus:border-gw-blue focus:outline-none"
      />
    </div>
  );
}
