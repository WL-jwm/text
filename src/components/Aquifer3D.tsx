
import React, { useState } from 'react';

/**
 * Aquifer3D - 含水层三维示意 (CSS 3D Transform)
 * 
 * 展示河北平原第四系含水层三维结构
 * 使用 CSS 3D transform 实现立体效果
 * 支持鼠标拖拽旋转
 */

interface AquiferLayer {
  name: string;
  color: string;
  height: number;      // 相对高度(px)
  lithology: string;
  depth: string;       // 实际深度范围
  kRange: string;      // 渗透系数范围
}

const AQUIFER_LAYERS: AquiferLayer[] = [
  { name: '第一含水层组(Q₄)', color: '#fbbf24', height: 40, lithology: '冲积砂砾石、卵石', depth: '0~40m', kRange: '20~80m/d' },
  { name: '第二含水层组(Q₃)', color: '#f59e0b', height: 60, lithology: '冲积-冰碛砂砾石', depth: '40~120m', kRange: '10~50m/d' },
  { name: '第三含水层组(Q₂)', color: '#d97706', height: 80, lithology: '冲积-湖积中砂', depth: '120~300m', kRange: '5~25m/d' },
  { name: '第四含水层组(Q₁)', color: '#b45309', height: 100, lithology: '冲积-湖积粘土砂层', depth: '300~500m', kRange: '1~10m/d' },
  { name: '新近系(N)', color: '#78716c', height: 60, lithology: '泥岩、砂岩互层', depth: '500~600m+', kRange: '<1m/d' },
];

interface Aquifer3DProps {
  className?: string;
}

export function Aquifer3D({ className = '' }: Aquifer3DProps) {
  const [rotation, setRotation] = useState({ x: 20, y: -30 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedLayer, setSelectedLayer] = useState<number | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setRotation(prev => ({
      x: Math.max(-60, Math.min(60, prev.x + dy * 0.5)),
      y: prev.y + dx * 0.5,
    }));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  const totalHeight = AQUIFER_LAYERS.reduce((s, l) => s + l.height, 0);
  const width = 200;
  const depth = 120;

  // 计算各层的累积偏移
  let cumHeight = 0;
  const layerOffsets = AQUIFER_LAYERS.map(l => {
    const offset = cumHeight;
    cumHeight += l.height;
    return offset;
  });

  return (
    <div className={`relative ${className}`}>
      {/* 3D场景容器 */}
      <div className="relative w-full h-[320px] perspective-[800px]"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {/* 3D立方体 */}
        <div className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transformStyle: 'preserve-3d',
            transition: isDragging ? 'none' : 'transform 0.3s ease',
          }}
        >
          {/* 各层 */}
          {AQUIFER_LAYERS.map((layer, i) => {
            const yOffset = totalHeight / 2 - layerOffsets[i] - layer.height / 2;
            const isSelected = selectedLayer === i;

            return (
              <div key={i}
                className="absolute cursor-pointer"
                style={{
                  width: `${width}px`,
                  height: `${layer.height}px`,
                  transform: `translateY(${yOffset}px) translateZ(${depth / 2}px)`,
                  transformStyle: 'preserve-3d',
                }}
                onClick={() => setSelectedLayer(isSelected ? null : i)}
              >
                {/* 顶面 */}
                <div className="absolute inset-0"
                  style={{
                    backgroundColor: layer.color,
                    opacity: isSelected ? 0.9 : 0.7,
                    border: `1px solid ${isSelected ? '#06b6d4' : 'rgba(255,255,255,0.15)'}`,
                    transform: `translateZ(${depth / 2}px)`,
                    boxShadow: isSelected ? '0 0 12px rgba(6,182,212,0.4)' : 'none',
                  }}
                />
                {/* 前面 */}
                <div className="absolute inset-0"
                  style={{
                    backgroundColor: layer.color,
                    opacity: isSelected ? 0.8 : 0.5,
                    border: `1px solid ${isSelected ? '#06b6d4' : 'rgba(255,255,255,0.1)'}`,
                    transform: `rotateX(90deg) translateZ(${-depth / 2}px)`,
                    height: `${depth}px`,
                    top: `-${depth / 2 - layer.height / 2}px`,
                  }}
                />
                {/* 侧面 */}
                <div className="absolute inset-0"
                  style={{
                    backgroundColor: layer.color,
                    opacity: isSelected ? 0.7 : 0.4,
                    border: `1px solid ${isSelected ? '#06b6d4' : 'rgba(255,255,255,0.1)'}`,
                    transform: `rotateY(-90deg) translateZ(${-width / 2}px)`,
                    width: `${depth}px`,
                    left: `${width / 2 - depth / 2}px`,
                  }}
                />
                {/* 层名标注 */}
                <div className="absolute inset-0 flex items-center justify-center"
                  style={{ transform: `translateZ(${depth / 2 + 2}px)` }}>
                  <span className="text-[9px] font-medium text-white/90 whitespace-nowrap"
                    style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                    {layer.name}
                  </span>
                </div>
              </div>
            );
          })}

          {/* 底部基座 */}
          <div className="absolute"
            style={{
              width: `${width + 20}px`,
              height: '8px',
              backgroundColor: '#44403c',
              transform: `translateY(${totalHeight / 2 + 4}px) translateZ(${depth / 2}px)`,
              borderRadius: '2px',
            }}
          />
        </div>

        {/* 操作提示 */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] text-gw-muted/50">
          拖拽旋转 · 点击查看详情
        </div>
      </div>

      {/* 图例 */}
      <div className="flex flex-wrap gap-2 mt-1 px-2">
        {AQUIFER_LAYERS.map((layer, i) => (
          <button key={i}
            onClick={() => setSelectedLayer(selectedLayer === i ? null : i)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all text-[10px] ${
              selectedLayer === i
                ? 'bg-gw-cyan/15 border border-gw-cyan/30 text-gw-cyan'
                : 'bg-gw-surface/50 border border-gw-border/20 text-gw-muted hover:text-gw-text'
            }`}
          >
            <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: layer.color }} />
            {layer.name}
          </button>
        ))}
      </div>

      {/* 详情面板 */}
      {selectedLayer !== null && (
        <div className="mt-3 p-3 rounded-lg bg-gw-card/80 border border-gw-cyan/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: AQUIFER_LAYERS[selectedLayer].color }} />
            <span className="text-xs font-medium text-gw-text">{AQUIFER_LAYERS[selectedLayer].name}</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-[10px]">
            <div>
              <p className="text-gw-muted">岩性</p>
              <p className="text-gw-text">{AQUIFER_LAYERS[selectedLayer].lithology}</p>
            </div>
            <div>
              <p className="text-gw-muted">深度范围</p>
              <p className="text-gw-text font-mono">{AQUIFER_LAYERS[selectedLayer].depth}</p>
            </div>
            <div>
              <p className="text-gw-muted">渗透系数</p>
              <p className="text-gw-text font-mono">{AQUIFER_LAYERS[selectedLayer].kRange}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
