
export function TrendSparkline({ readings, color }: { readings: { timestamp: number; value: number }[]; color: string }) {
  if (readings.length < 2) return null;

  const values = readings.map(r => r.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const w = 120, h = 28;
  const points = readings.map((r, i) => {
    const x = (i / (readings.length - 1)) * w;
    const y = h - ((r.value - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  });

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="flex-shrink-0">
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── 新增井表单 ──

