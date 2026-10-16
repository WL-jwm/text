/**
 * B-10 水源地保护区划分 Tab
 *
 * 5大面板：
 *  1. 计算器 — 输入水文地质参数 → 计算保护区半径/面积
 *  2. 同心圆图 — 保护区可视化（一级/二级/准保护区嵌套）
 *  3. 预设水源地 — 8个河北重要水源地保护区一览
 *  4. 经验值参考表 — HJ/T 338-2007附录A查表
 *  5. 介质参数参考 — 有效孔隙度/渗透系数
 * 面板: ZoneConcentricSVG（拆分自 ProtectionZoneTab.tsx）
 */
import { type ProtectionZoneResult, ZONE_LEVELS } from '../../../utils/protectionZoneCalculator';
import { PipelinePanel } from '../../PipelinePanel';

export function ZoneConcentricSVG({ result }: { result: ProtectionZoneResult | null }) {
  if (!result) {
    return (
      <div className="flex items-center justify-center h-[400px] text-gw-muted text-sm">
        请先计算保护区参数
      </div>
    );
  }

  const maxRadius = result.zones[result.zones.length - 1].radius;
  const svgSize = 400;
  const center = svgSize / 2;
  const maxDisplayR = 170;
  const scale = maxDisplayR / maxRadius;

  return (
    <div className="flex flex-col items-center">
      <svg width={svgSize} height={svgSize} className="max-w-full">
        {/* 准保护区（最外圈） */}
        {result.zones[2] && (
          <circle
            cx={center} cy={center}
            r={result.zones[2].radius * scale}
            fill={ZONE_LEVELS['准保护区'].color + '15'}
            stroke={ZONE_LEVELS['准保护区'].color}
            strokeWidth={1.5}
            strokeDasharray="4 2"
          />
        )}
        {/* 二级保护区 */}
        {result.zones[1] && (
          <circle
            cx={center} cy={center}
            r={result.zones[1].radius * scale}
            fill={ZONE_LEVELS['二级'].color + '20'}
            stroke={ZONE_LEVELS['二级'].color}
            strokeWidth={1.5}
          />
        )}
        {/* 一级保护区 */}
        {result.zones[0] && (
          <circle
            cx={center} cy={center}
            r={Math.max(result.zones[0].radius * scale, 8)}
            fill={ZONE_LEVELS['一级'].color + '30'}
            stroke={ZONE_LEVELS['一级'].color}
            strokeWidth={2}
          />
        )}
        {/* 取水井 */}
        <circle cx={center} cy={center} r={4} fill="#fff" stroke="#1e293b" strokeWidth={1} />
        <text x={center + 8} y={center - 4} fontSize={9} fill="#9ca3af">取水井</text>

        {/* 半径标注线 */}
        {result.zones.map((zone, i) => {
          const r = zone.radius * scale;
          if (r < 12) return null;
          const angle = -45 - i * 25;
          const rad = (angle * Math.PI) / 180;
          const x2 = center + r * Math.cos(rad);
          const y2 = center + r * Math.sin(rad);
          return (
            <g key={i}>
              <line x1={center} y1={center} x2={x2} y2={y2} stroke={zone.color} strokeWidth={1} strokeDasharray="2 2" />
              <text x={x2 + 4} y={y2 + 4} fontSize={9} fill={zone.color} fontWeight="bold">
                {zone.level}: {zone.radius}m
              </text>
            </g>
          );
        })}
      </svg>
      {/* 图例 */}
      <div className="flex gap-4 mt-2 text-xs">
        {result.zones.map(z => (
          <span key={z.level} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: z.color }} />
            <span style={{ color: z.color }}>{z.level}</span>
            <span className="text-gw-muted">R={z.radius}m A={z.area}km²</span>
          </span>
        ))}
      </div>
      <PipelinePanel moduleId="protectionZone" onReceive={(dataType, payload) => {
        if (dataType === 'aquiferParams') {
          const parts: string[] = [];
          if (payload.hydraulicConductivity) parts.push(`K=${payload.hydraulicConductivity} m/d`);
          if (payload.hydraulicGradient) parts.push(`I=${payload.hydraulicGradient}`);
          if (parts.length > 0) alert(`已接收含水层参数:\n${parts.join(', ')}\n\n请手动更新保护区划分参数。`);
        }
      }} />
    </div>
  );
}
