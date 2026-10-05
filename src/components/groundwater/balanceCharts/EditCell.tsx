/*
 * 组件：EditCell（拆分自 balanceCharts.tsx）
 */


export function EditCell({
  value, onChange, width,
}: {
  value: number | undefined;
  onChange: (v: number) => void;
  width?: string;
}) {
  return (
    <input
      type="number"
      step="0.01"
      value={value ?? 0}
      onChange={e => onChange(Number(e.target.value) || 0)}
      className={`w-full bg-transparent border border-gw-border/30 rounded px-1.5 py-0.5 text-xs text-center
        focus:border-gw-blue/50 focus:outline-none focus:ring-1 focus:ring-gw-blue/30
        ${width ?? 'w-24'}`}
    />
  );
}
