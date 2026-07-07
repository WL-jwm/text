
import React, { useState } from 'react';

/**
 * HydroProfile - 水文地质剖面图 (SVG)
 * 
 * 绘制河北平原典型水文地质剖面（山前冲洪积扇 → 中部平原 → 滨海平原）
 * 展示第四系含水层组结构、岩性、深度、水位
 * 
 * 数据来源: quaternaryStratigraphy + 含水层组概念模型
 */

interface Layer {
  name: string;
  depth: number;      // 底部深度(m)
  color: string;
  lithology: string;
  opacity?: number;
  pattern?: 'sand' | 'clay' | 'gravel' | 'bedrock';
}

interface ProfileSection {
  label: string;
  x: number;          // SVG x坐标百分比
  layers: Layer[];
  waterLevel?: number; // 水位埋深(m)
}

const PROFILE_SECTIONS: ProfileSection[] = [
  {
    label: '山前冲洪积扇',
    x: 10,
    waterLevel: 30,
    layers: [
      { name: 'Q₄ 全新统', depth: 40, color: '#fbbf24', lithology: '冲积砂砾石、卵石', pattern: 'gravel' },
      { name: 'Q₃ 上更新统', depth: 120, color: '#f59e0b', lithology: '冰水-冲积砂砾石', pattern: 'sand' },
      { name: 'Q₂ 中更新统', depth: 300, color: '#d97706', lithology: '冰碛-冲积含泥砂砾石', pattern: 'sand' },
      { name: 'Q₁ 下更新统', depth: 500, color: '#b45309', lithology: '冰碛-冲积粘土砾石', pattern: 'clay' },
      { name: 'N 新近系', depth: 600, color: '#78716c', lithology: '泥岩、砂岩互层', pattern: 'bedrock' },
    ],
  },
  {
    label: '中部平原',
    x: 45,
    waterLevel: 15,
    layers: [
      { name: 'Q₄ 全新统', depth: 35, color: '#fde68a', lithology: '冲积-湖积亚砂土、粉细砂', pattern: 'sand' },
      { name: 'Q₃ 上更新统', depth: 100, color: '#fcd34d', lithology: '冲积-湖积中细砂、亚粘土', pattern: 'clay' },
      { name: 'Q₂ 中更新统', depth: 280, color: '#fbbf24', lithology: '冲积-湖积中砂、亚粘土互层', pattern: 'sand' },
      { name: 'Q₁ 下更新统', depth: 450, color: '#d97706', lithology: '冲积-湖积粘土、砂层', pattern: 'clay' },
      { name: 'N 新近系', depth: 600, color: '#78716c', lithology: '泥岩、砂岩互层', pattern: 'bedrock' },
    ],
  },
  {
    label: '滨海平原',
    x: 80,
    waterLevel: 5,
    layers: [
      { name: 'Q₄ 全新统', depth: 30, color: '#fde68a', lithology: '海积-冲积淤泥质粘土、粉砂', pattern: 'clay' },
      { name: 'Q₃ 上更新统', depth: 90, color: '#fcd34d', lithology: '海陆交互相亚砂土、中细砂', pattern: 'sand' },
      { name: 'Q₂ 中更新统', depth: 250, color: '#fbbf24', lithology: '冲积-湖积中砂、亚粘土', pattern: 'clay' },
      { name: 'Q₁ 下更新统', depth: 400, color: '#d97706', lithology: '冲积-湖积粘土、砂层', pattern: 'sand' },
      { name: 'N 新近系', depth: 600, color: '#78716c', lithology: '泥岩、砂岩互层', pattern: 'bedrock' },
    ],
  },
];

const LITHOLOGY_PATTERNS: Record<string, string> = {
  sand: 'url(#sandPattern)',
  clay: 'url(#clayPattern)',
  gravel: 'url(#gravelPattern)',
  bedrock: 'url(#bedrockPattern)',
};

const _LITHOLOGY_LABELS: Record<string, string> = {
  sand: '砂层',
  clay: '粘土层',
  gravel: '砂砾石层',
  bedrock: '基岩',
};

interface HydroProfileProps {
  width?: number;
  height?: number;
  className?: string;
}

export function HydroProfile({ width = 700, height = 420, className = '' }: HydroProfileProps) {
  const [hoveredSection, setHoveredSection] = useState<number | null>(null);
  const [hoveredLayer, setHoveredLayer] = useState<number | null>(null);

  const margin = { top: 30, right: 30, bottom: 40, left: 50 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;
  const maxDepth = 600;

  const yScale = (depth: number) => margin.top + (depth / maxDepth) * plotH;
  const sectionSpacing = plotW / (PROFILE_SECTIONS.length + 1);

  return (
    <div className={`relative ${className}`}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <defs>
          {/* 砂层图案 */}
          <pattern id="sandPattern" width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill="rgba(255,255,255,0.25)" />
            <circle cx="6" cy="6" r="1" fill="rgba(255,255,255,0.15)" />
          </pattern>
          {/* 粘土层图案 */}
          <pattern id="clayPattern" width="6" height="6" patternUnits="userSpaceOnUse">
            <rect width="6" height="6" fill="rgba(255,255,255,0.08)" />
            <line x1="0" y1="3" x2="6" y2="3" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          </pattern>
          {/* 砂砾石层图案 */}
          <pattern id="gravelPattern" width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="2" fill="rgba(255,255,255,0.2)" />
            <circle cx="8" cy="7" r="1.5" fill="rgba(255,255,255,0.15)" />
          </pattern>
          {/* 基岩图案 */}
          <pattern id="bedrockPattern" width="12" height="12" patternUnits="userSpaceOnUse">
            <path d="M0 6L6 0L12 6L6 12Z" fill="rgba(255,255,255,0.08)" />
            <path d="M0 12L12 0" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
          </pattern>
          {/* 水位线渐变 */}
          <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* 标题 */}
        <text x={width / 2} y={16} textAnchor="middle" className="fill-gw-text text-[11px] font-medium">
          河北平原典型水文地质剖面示意图
        </text>

        {/* Y轴刻度 - 深度 */}
        {[0, 100, 200, 300, 400, 500, 600].map(d => (
          <g key={d}>
            <text x={margin.left - 8} y={yScale(d) + 3} textAnchor="end" className="fill-gw-muted text-[9px] font-mono">
              {d > 0 ? d : ''}
            </text>
            <line x1={margin.left} y1={yScale(d)} x2={width - margin.right} y2={yScale(d)}
              stroke="rgba(100,116,139,0.15)" strokeWidth="0.5" strokeDasharray="3,3" />
          </g>
        ))}
        <text x={12} y={margin.top + plotH / 2} textAnchor="middle" transform={`rotate(-90, 12, ${margin.top + plotH / 2})`}
          className="fill-gw-muted text-[9px]">深度 (m)</text>

        {/* 各剖面柱状图 */}
        {PROFILE_SECTIONS.map((section, si) => {
          const cx = margin.left + sectionSpacing * (si + 1);
          const colW = sectionSpacing * 0.6;
          const isHovered = hoveredSection === si;

          return (
            <g key={si}
              onMouseEnter={() => setHoveredSection(si)}
              onMouseLeave={() => { setHoveredSection(null); setHoveredLayer(null); }}
              className="cursor-pointer"
            >
              {/* 柱体背景 */}
              <rect x={cx - colW / 2} y={margin.top} width={colW} height={plotH}
                fill="rgba(15,23,42,0.3)" rx="2" />

              {/* 各层 */}
              {section.layers.map((layer, li) => {
                const prevDepth = li > 0 ? section.layers[li - 1].depth : 0;
                const yTop = yScale(prevDepth);
                const yBot = yScale(layer.depth);
                const layerH = yBot - yTop;
                const isLayerHovered = hoveredSection === si && hoveredLayer === li;

                return (
                  <g key={li}
                    onMouseEnter={() => { setHoveredSection(si); setHoveredLayer(li); }}
                    onMouseLeave={() => setHoveredLayer(null)}
                  >
                    <rect x={cx - colW / 2} y={yTop} width={colW} height={layerH}
                      fill={layer.color}
                      fillOpacity={isLayerHovered ? 0.9 : 0.75}
                      stroke="rgba(0,0,0,0.2)"
                      strokeWidth={isLayerHovered ? 1.5 : 0.5}
                      rx="1"
                    />
                    <rect x={cx - colW / 2} y={yTop} width={colW} height={layerH}
                      fill={LITHOLOGY_PATTERNS[layer.pattern || 'sand']}
                      rx="1"
                    />
                    {/* 层名标注 */}
                    {layerH > 25 && (
                      <text x={cx} y={yTop + layerH / 2 + 3} textAnchor="middle"
                        className="fill-white text-[8px] font-medium" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                        {layer.name}
                      </text>
                    )}
                    {/* 分界线标注 */}
                    {li < section.layers.length - 1 && (
                      <text x={cx + colW / 2 + 4} y={yTop + 3} textAnchor="start"
                        className="fill-gw-muted text-[7px] font-mono">
                        {prevDepth}m
                      </text>
                    )}
                  </g>
                );
              })}

              {/* 水位线 */}
              {section.waterLevel && (
                <>
                  <line x1={cx - colW / 2 - 5} y1={yScale(section.waterLevel)}
                    x2={cx + colW / 2 + 5} y2={yScale(section.waterLevel)}
                    stroke="#06b6d4" strokeWidth="2" strokeDasharray="4,2" />
                  <rect x={cx - colW / 2} y={yScale(section.waterLevel)} width={colW}
                    height={yScale(0) - yScale(section.waterLevel)} fill="url(#waterGradient)" />
                  <text x={cx + colW / 2 + 8} y={yScale(section.waterLevel) + 3}
                    className="fill-cyan-400 text-[8px] font-mono">
                    ~{section.waterLevel}m
                  </text>
                </>
              )}

              {/* 底部标注 */}
              <text x={cx} y={margin.top + plotH + 15} textAnchor="middle"
                className={`text-[10px] transition-colors ${isHovered ? 'fill-gw-cyan' : 'fill-gw-muted'}`}>
                {section.label}
              </text>
            </g>
          );
        })}

        {/* 连接线 - 层界面 */}
        {[0, 1, 2, 3, 4].map(li => (
          <polyline key={li}
            points={PROFILE_SECTIONS.map((s, si) => {
              const cx = margin.left + sectionSpacing * (si + 1);
              const prevDepth = li > 0 ? s.layers[li - 1].depth : 0;
              return `${cx},${yScale(prevDepth)}`;
            }).join(' ')}
            fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" strokeDasharray="3,2"
          />
        ))}
      </svg>

      {/* 图例 */}
      <div className="flex flex-wrap gap-3 mt-2 px-2">
        {['砂层', '粘土层', '砂砾石层', '基岩'].map(label => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-gw-surface border border-gw-border/30" />
            <span className="text-[10px] text-gw-muted">{label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 rounded bg-cyan-400" style={{ borderTop: '2px dashed #06b6d4' }} />
          <span className="text-[10px] text-gw-muted">地下水位</span>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredSection !== null && hoveredLayer !== null && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-gw-card/95 border border-gw-border/40 rounded-lg p-2.5 shadow-lg text-[10px] z-10 whitespace-nowrap">
          <p className="font-medium text-gw-text mb-1">{PROFILE_SECTIONS[hoveredSection].label} — {PROFILE_SECTIONS[hoveredSection].layers[hoveredLayer].name}</p>
          <p className="text-gw-muted">岩性: {PROFILE_SECTIONS[hoveredSection].layers[hoveredLayer].lithology}</p>
          <p className="text-gw-muted">深度: {hoveredLayer > 0 ? PROFILE_SECTIONS[hoveredSection].layers[hoveredLayer - 1].depth : 0}~{PROFILE_SECTIONS[hoveredSection].layers[hoveredLayer].depth}m</p>
        </div>
      )}
    </div>
  );
}
