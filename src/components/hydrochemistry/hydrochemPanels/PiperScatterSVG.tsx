/**
 * B-11 水化学分析计算器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 输入6大离子浓度 → 自动分类+评价
 *  2. Piper三线图 — SVG绘制阳离子/阴离子三角形+菱形
 *  3. 预设水样 — 8个河北典型水样对比
 *  4. 离子换算参考 — 毫摩尔换算表+评价标准
 * 面板: PiperScatterSVG（拆分自 HydrochemCalculatorTab.tsx）
 */
export function PiperScatterSVG({ points }: { points: Array<{ name: string; x: number; y: number; type: string; color: string }>;}) {
  const W = 360, H = 320;
  const margin = 40;
  const plotW = W - margin * 2;
  const plotH = H - margin * 2;

  return (
    <svg width={W} height={H} className="max-w-full">
      {/* 菱形边框 */}
      <polygon
        points={`${W / 2},${margin} ${W - margin},${H / 2} ${W / 2},${H - margin} ${margin},${H / 2}`}
        fill="rgba(139,92,246,0.05)" stroke="#8b5cf6" strokeWidth={1}
      />
      {/* 轴标签 */}
      <text x={margin - 5} y={H / 2} fontSize={9} fill="#9ca3af" textAnchor="end">Ca+Mg</text>
      <text x={W - margin + 5} y={H / 2} fontSize={9} fill="#9ca3af" textAnchor="start">Na+K</text>
      <text x={W / 2} y={margin - 5} fontSize={9} fill="#9ca3af" textAnchor="middle">SO4+Cl</text>
      <text x={W / 2} y={H - margin + 12} fontSize={9} fill="#9ca3af" textAnchor="middle">HCO3</text>
      {/* 网格 */}
      <line x1={W / 2} y1={margin} x2={W / 2} y2={H - margin} stroke="rgba(255,255,255,0.05)" />
      <line x1={margin} y1={H / 2} x2={W - margin} y2={H / 2} stroke="rgba(255,255,255,0.05)" />
      {/* 数据点 */}
      {points.map(p => {
        const x = margin + (p.x / 100) * plotW;
        const y = H - margin - (p.y / 100) * plotH;
        return (
          <g key={p.name}>
            <circle cx={x} cy={y} r={5} fill={p.color} stroke="#fff" strokeWidth={1} opacity={0.85} />
            <text x={x + 7} y={y + 3} fontSize={9} fill="#9ca3af">{p.name}</text>
          </g>
        );
      })}
    </svg>
  );
}
