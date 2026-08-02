/**
 * AquiferProfile3D — V-02 3D含水层水头剖面可视化
 *
 * 基于 SVG 绘制含水层剖面图，展示：
 *   - 多层含水层结构（第四系四组）
 *   - 各层水头线（测压管曲线）
 *   - 地表/隔水层/基岩界面
 *   - 城市剖面切换（山前→滨海）
 *   - 深度刻度/岩性标注
 */

import { useState, useMemo } from 'react';
import { Layers3, Mountain, Waves, ChevronRight } from 'lucide-react';
import { TechCard } from '../UI';
import { quaternaryAquiferGroups } from '../../data/geology';

// ── 类型 ──

interface AquiferLayer {
  name: string;
  topDepth: number;
  bottomDepth: number;
  lithology: string;
  K: string;
  waterType: string;
  color: string;
  pattern: string;
}

interface ProfileStation {
  city: string;
  distance: number; // km from start
  surfaceElev: number; // m
  waterLevels: number[]; // 各层水头标高 m
  note: string;
}

// ── 含水层定义 ──

const AQUIFER_LAYERS: AquiferLayer[] = [
  { name: '第I含水组', topDepth: 0, bottomDepth: 50, lithology: '砂砾石/中细砂', K: '10~50 m/d', waterType: '潜水-微承压', color: '#22c55e', pattern: 'dots' },
  { name: '第II含水组', topDepth: 50, bottomDepth: 150, lithology: '中细砂/粉细砂', K: '5~20 m/d', waterType: '承压水', color: '#3b82f6', pattern: 'lines' },
  { name: '第III含水组', topDepth: 150, bottomDepth: 350, lithology: '细砂/粉砂', K: '2~8 m/d', waterType: '承压水', color: '#8b5cf6', pattern: 'cross' },
  { name: '第IV含水组', topDepth: 350, bottomDepth: 550, lithology: '粉砂/含砾细砂', K: '0.5~3 m/d', waterType: '深层承压水', color: '#f59e0b', pattern: 'grid' },
];

// ── 剖面线数据（山前平原→滨海平原） ──

const PROFILE_STATIONS: ProfileStation[] = [
  { city: '石家庄', distance: 0, surfaceElev: 85, waterLevels: [82, 75, 68, 60], note: '山前冲洪积扇' },
  { city: '保定', distance: 80, surfaceElev: 65, waterLevels: [60, 52, 45, 38], note: '冲积平原上部' },
  { city: '廊坊', distance: 160, surfaceElev: 45, waterLevels: [40, 33, 26, 18], note: '冲积平原中部' },
  { city: '沧州', distance: 240, surfaceElev: 30, waterLevels: [26, 18, 8, -5], note: '滨海平原' },
  { city: '唐山', distance: 300, surfaceElev: 40, waterLevels: [36, 29, 22, 15], note: '滨海过渡带' },
];

// ── SVG 参数 ──

const SVG_W = 800;
const SVG_H = 420;
const MARGIN = { left: 60, right: 140, top: 30, bottom: 50 };
const PLOT_W = SVG_W - MARGIN.left - MARGIN.right;
const PLOT_H = SVG_H - MARGIN.top - MARGIN.bottom;
const MAX_DEPTH = 600;
const MIN_ELEV = -20;

function elevToY(elev: number): number {
  const range = MAX_DEPTH - MIN_ELEV;
  return MARGIN.top + ((MAX_DEPTH - elev) / range) * PLOT_H;
}

function distToX(dist: number, maxDist: number): number {
  return MARGIN.left + (dist / maxDist) * PLOT_W;
}

/** 生成含水层填充pattern */
function LayerPattern({ layer, id }: { layer: AquiferLayer; id: string }) {
  if (layer.pattern === 'dots') {
    return (
      <pattern id={id} width="8" height="8" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" fill={layer.color} fillOpacity={0.12} />
        <circle cx="4" cy="4" r="1" fill={layer.color} fillOpacity={0.5} />
      </pattern>
    );
  }
  if (layer.pattern === 'lines') {
    return (
      <pattern id={id} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="8" height="8" fill={layer.color} fillOpacity={0.12} />
        <line x1="0" y1="0" x2="0" y2="8" stroke={layer.color} strokeWidth="1" strokeOpacity={0.4} />
      </pattern>
    );
  }
  if (layer.pattern === 'cross') {
    return (
      <pattern id={id} width="10" height="10" patternUnits="userSpaceOnUse">
        <rect width="10" height="10" fill={layer.color} fillOpacity={0.1} />
        <line x1="0" y1="0" x2="10" y2="10" stroke={layer.color} strokeWidth="0.5" strokeOpacity={0.3} />
        <line x1="10" y1="0" x2="0" y2="10" stroke={layer.color} strokeWidth="0.5" strokeOpacity={0.3} />
      </pattern>
    );
  }
  return (
    <pattern id={id} width="10" height="10" patternUnits="userSpaceOnUse">
      <rect width="10" height="10" fill={layer.color} fillOpacity={0.1} />
      <line x1="0" y1="5" x2="10" y2="5" stroke={layer.color} strokeWidth="0.5" strokeOpacity={0.3} />
      <line x1="5" y1="0" x2="5" y2="10" stroke={layer.color} strokeWidth="0.5" strokeOpacity={0.3} />
    </pattern>
  );
}

/** 贝塞尔曲线生成器（平滑插值） */
function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cx = (prev.x + curr.x) / 2;
    d += ` C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  return d;
}

export function AquiferProfile3D() {
  const [hoverStation, setHoverStation] = useState<number | null>(null);
  const [showWaterLevel, setShowWaterLevel] = useState(true);
  const [selectedLayer, setSelectedLayer] = useState<number | null>(null);

  const maxDist = useMemo(() => Math.max(...PROFILE_STATIONS.map(s => s.distance)), []);

  // 构建地表线点
  const surfacePoints = PROFILE_STATIONS.map(s => ({
    x: distToX(s.distance, maxDist),
    y: elevToY(s.surfaceElev),
  }));

  // 构建各含水层底界线
  const layerBottoms = AQUIFER_LAYERS.map((layer, layerIdx) => {
    const bottomElev = (s: ProfileStation) => s.surfaceElev - layer.bottomDepth;
    return PROFILE_STATIONS.map(s => ({
      x: distToX(s.distance, maxDist),
      y: elevToY(bottomElev(s)),
      layerIdx,
    }));
  });

  // 构建各含水层水头线
  const waterHeadLines = AQUIFER_LAYERS.map((layer, layerIdx) => {
    return PROFILE_STATIONS.map(s => ({
      x: distToX(s.distance, maxDist),
      y: elevToY(s.waterLevels[layerIdx] ?? 0),
      layerIdx,
    }));
  });

  // 深度刻度
  const depthTicks = [0, 50, 100, 150, 200, 300, 400, 500, 600];

  return (
    <TechCard>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gw-text flex items-center gap-2">
          <Layers3 size={16} className="text-cyan-400" />
          含水层剖面与水头分布
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowWaterLevel(!showWaterLevel)}
            className={`px-2 py-1 rounded text-[10px] border transition-all ${
              showWaterLevel ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400' : 'border-gw-border/30 text-gw-muted'
            }`}
          >
            <Waves size={10} className="inline mr-1" />
            水头线
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg width={SVG_W} height={SVG_H} className="max-w-none">
          <defs>
            {AQUIFER_LAYERS.map((layer, i) => (
              <LayerPattern key={i} layer={layer} id={`layer-pattern-${i}`} />
            ))}
            <linearGradient id="surface-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b6f47" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#5a4a32" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="bedrock-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4a3a2a" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#2a1f15" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* 背景 */}
          <rect x={MARGIN.left} y={MARGIN.top} width={PLOT_W} height={PLOT_H} fill="#0f1720" />

          {/* 深度刻度 */}
          {depthTicks.map(depth => {
            const actualY = MARGIN.top + (depth / MAX_DEPTH) * PLOT_H;
            return (
              <g key={depth}>
                <line x1={MARGIN.left} y1={actualY} x2={MARGIN.left + PLOT_W} y2={actualY} stroke="#1e293b" strokeWidth="0.5" />
                <text x={MARGIN.left - 5} y={actualY + 3} fontSize="9" fill="#64748b" textAnchor="end">
                  {depth}m
                </text>
              </g>
            );
          })}

          {/* 基岩区域（最底部） */}
          <path
            d={`${smoothPath(layerBottoms[3])} L ${distToX(maxDist, maxDist)} ${SVG_H - MARGIN.bottom} L ${MARGIN.left} ${SVG_H - MARGIN.bottom} Z`}
            fill="url(#bedrock-gradient)"
            stroke="#4a3a2a"
            strokeWidth="1"
          />
          <text x={SVG_W / 2} y={SVG_H - MARGIN.bottom + 20} fontSize="10" fill="#64748b" textAnchor="middle">
            基岩（前第四系）
          </text>

          {/* 各含水层区域 */}
          {AQUIFER_LAYERS.map((layer, i) => {
            const topLine = i === 0 ? surfacePoints : layerBottoms[i - 1];
            const bottomLine = layerBottoms[i];
            const pathData = `${smoothPath(topLine)} L ${bottomLine[bottomLine.length - 1].x} ${bottomLine[bottomLine.length - 1].y} ${smoothPath([...bottomLine].reverse()).replace('M', 'L')} Z`;

            const isDimmed = selectedLayer !== null && selectedLayer !== i;
            return (
              <g key={i} opacity={isDimmed ? 0.2 : 1} onClick={() => setSelectedLayer(selectedLayer === i ? null : i)} className="cursor-pointer">
                <path d={pathData} fill={`url(#layer-pattern-${i})`} stroke={layer.color} strokeWidth="0.5" strokeOpacity="0.4" />
                {/* 层标签 */}
                <text
                  x={distToX(maxDist * 0.5, maxDist)}
                  y={elevToY(PROFILE_STATIONS[2].surfaceElev - (layer.topDepth + layer.bottomDepth) / 2)}
                  fontSize="9"
                  fill={layer.color}
                  textAnchor="middle"
                  fontWeight="bold"
                  opacity="0.7"
                >
                  {layer.name}
                </text>
              </g>
            );
          })}

          {/* 地表线 */}
          <path d={smoothPath(surfacePoints)} fill="none" stroke="#8b6f47" strokeWidth="2" />
          <path
            d={`${smoothPath(surfacePoints)} L ${surfacePoints[surfacePoints.length - 1].x} ${SVG_H - MARGIN.bottom} L ${surfacePoints[0].x} ${SVG_H - MARGIN.bottom} Z`}
            fill="url(#surface-gradient)"
            opacity="0.3"
          />

          {/* 水头线 */}
          {showWaterLevel && AQUIFER_LAYERS.map((layer, i) => {
            const points = waterHeadLines[i];
            const isDimmed = selectedLayer !== null && selectedLayer !== i;
            return (
              <g key={`wh-${i}`} opacity={isDimmed ? 0.15 : 1}>
                <path d={smoothPath(points)} fill="none" stroke={layer.color} strokeWidth="2" strokeDasharray="4 2" />
                {points.map((p, pi) => (
                  <g key={pi}>
                    <circle cx={p.x} cy={p.y} r="3" fill={layer.color} stroke="#fff" strokeWidth="0.5" />
                  </g>
                ))}
              </g>
            );
          })}

          {/* 钻孔标记 */}
          {PROFILE_STATIONS.map((s, i) => {
            const x = distToX(s.distance, maxDist);
            const isHover = hoverStation === i;
            return (
              <g key={i}
                onMouseEnter={() => setHoverStation(i)}
                onMouseLeave={() => setHoverStation(null)}
                className="cursor-pointer"
              >
                {/* 钻孔竖线 */}
                <line
                  x1={x} y1={elevToY(s.surfaceElev)}
                  x2={x} y2={SVG_H - MARGIN.bottom}
                  stroke={isHover ? '#06b6d4' : '#334155'}
                  strokeWidth={isHover ? 2 : 1}
                  strokeDasharray="3 3"
                />
                {/* 地表标记 */}
                <circle cx={x} cy={elevToY(s.surfaceElev)} r={isHover ? 6 : 4} fill="#06b6d4" stroke="#fff" strokeWidth="1" />
                {/* 城市名 */}
                <text x={x} y={MARGIN.top - 8} fontSize="10" fill={isHover ? '#06b6d4' : '#94a3b8'} textAnchor="middle" fontWeight={isHover ? 'bold' : 'normal'}>
                  {s.city}
                </text>
                <text x={x} y={MARGIN.top - 20} fontSize="8" fill="#475569" textAnchor="middle">
                  {s.distance}km
                </text>

                {/* Hover详情 */}
                {isHover && (
                  <g>
                    <rect x={x + 10} y={elevToY(s.surfaceElev) - 5} width="130" height="85" fill="#1e293b" stroke="#06b6d4" strokeWidth="0.5" rx="4" opacity="0.95" />
                    <text x={x + 18} y={elevToY(s.surfaceElev) + 8} fontSize="9" fill="#06b6d4" fontWeight="bold">{s.city}</text>
                    <text x={x + 18} y={elevToY(s.surfaceElev) + 20} fontSize="8" fill="#94a3b8">地表: {s.surfaceElev}m</text>
                    <text x={x + 18} y={elevToY(s.surfaceElev) + 32} fontSize="8" fill="#22c55e">I层水头: {s.waterLevels[0]}m</text>
                    <text x={x + 18} y={elevToY(s.surfaceElev) + 44} fontSize="8" fill="#3b82f6">II层水头: {s.waterLevels[1]}m</text>
                    <text x={x + 18} y={elevToY(s.surfaceElev) + 56} fontSize="8" fill="#8b5cf6">III层水头: {s.waterLevels[2]}m</text>
                    <text x={x + 18} y={elevToY(s.surfaceElev) + 68} fontSize="8" fill="#f59e0b">IV层水头: {s.waterLevels[3]}m</text>
                    <text x={x + 18} y={elevToY(s.surfaceElev) + 80} fontSize="7" fill="#64748b">{s.note}</text>
                  </g>
                )}
              </g>
            );
          })}

          {/* X轴 */}
          <line x1={MARGIN.left} y1={SVG_H - MARGIN.bottom} x2={MARGIN.left + PLOT_W} y2={SVG_H - MARGIN.bottom} stroke="#334155" strokeWidth="1" />
          <text x={MARGIN.left + PLOT_W / 2} y={SVG_H - 10} fontSize="10" fill="#64748b" textAnchor="middle">
            距离 (km) — 山前 → 滨海
          </text>
        </svg>
      </div>

      {/* 含水层图例 */}
      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
        {AQUIFER_LAYERS.map((layer, i) => (
          <div
            key={i}
            onClick={() => setSelectedLayer(selectedLayer === i ? null : i)}
            className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-all ${
              selectedLayer === i ? 'border-gw-blue/40 bg-gw-blue/10' : 'border-gw-border/20'
            }`}
          >
            <div className="w-3 h-3 rounded" style={{ background: layer.color, opacity: 0.5 }} />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-gw-text font-medium truncate">{layer.name}</div>
              <div className="text-[8px] text-gw-muted truncate">{layer.topDepth}~{layer.bottomDepth}m | K: {layer.K}</div>
            </div>
            {selectedLayer === i && <ChevronRight size={10} className="text-gw-blue" />}
          </div>
        ))}
      </div>

      {/* 选中层详情 */}
      {selectedLayer !== null && (
        <div className="mt-2 p-3 rounded-lg bg-gw-surface/60 border border-gw-border/30 text-xs space-y-1">
          <div className="flex items-center gap-2">
            <Mountain size={12} style={{ color: AQUIFER_LAYERS[selectedLayer].color }} />
            <span className="text-gw-text font-medium">{AQUIFER_LAYERS[selectedLayer].name}</span>
            <span className="text-gw-muted">| {AQUIFER_LAYERS[selectedLayer].lithology}</span>
          </div>
          <div className="text-gw-muted">
            深度范围: {AQUIFER_LAYERS[selectedLayer].topDepth}~{AQUIFER_LAYERS[selectedLayer].bottomDepth}m |
            渗透系数: {AQUIFER_LAYERS[selectedLayer].K} |
            地下水类型: {AQUIFER_LAYERS[selectedLayer].waterType}
          </div>
          <div className="text-gw-muted">
            {quaternaryAquiferGroups[selectedLayer]?.rechargeSource ?? '—'}
          </div>
        </div>
      )}

      <div className="mt-2 flex items-center gap-3 text-[9px] text-gw-muted">
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 border-t-2 border-dashed border-cyan-400 inline-block" />水头线</span>
        <span className="flex items-center gap-1"><Mountain size={8} /> 钻孔位置</span>
        <span>剖面方向: 石家庄(山前) → 沧州(滨海) → 唐山</span>
        <span className="text-gw-muted/50">数据来源: 河北省水文地质普查</span>
      </div>
    </TechCard>
  );
}
