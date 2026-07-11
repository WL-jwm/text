import React from 'react';
import {
  overdraftLegend,
  gradeColors, gradeLabels,
} from '../../data/mapDataEnhanced';

interface MapLegendProps {
  activeLayers: Set<string>;
  categoryStats: { key: string; label: string; color: string }[];
}

export function MapLegend({ activeLayers, categoryStats }: MapLegendProps) {
  return (
    <div className="absolute top-3 right-3 z-[1000] px-3 py-2 rounded-lg text-[10px] bg-gw-surface/90 border border-gw-border/40 backdrop-blur-sm max-h-[320px] overflow-y-auto scrollbar-none">
      <p className="font-medium text-gw-text mb-1.5">图例</p>

      {/* 标注图例 */}
      {activeLayers.has('markers') && (
        <div className="mb-2">
          <p className="text-gw-muted text-[9px] mb-0.5">标注分类</p>
          {categoryStats.map(s => (
            <div key={s.key} className="flex items-center gap-2 py-0.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-gw-muted">{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* 资源量图例 */}
      {activeLayers.has('resource') && (
        <div className="mb-2">
          <p className="text-gw-muted text-[9px] mb-0.5">资源量等级</p>
          {([5, 4, 3, 2, 1] as const).map(grade => (
            <div key={grade} className="flex items-center gap-2 py-0.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: gradeColors[grade] }} />
              <span className="text-gw-muted">{gradeLabels[grade]}</span>
            </div>
          ))}
        </div>
      )}

      {/* 超采区图例 */}
      {activeLayers.has('overdraft') && (
        <div className="mb-2">
          <p className="text-gw-muted text-[9px] mb-0.5">超采区类型</p>
          {overdraftLegend.map(item => (
            <div key={item.type} className="flex items-center gap-2 py-0.5">
              <div className="w-3 h-3 rounded-sm border" style={{ borderColor: item.color, backgroundColor: item.fill, borderStyle: item.type === 'deep-severe' ? 'solid' : 'dashed' }} />
              <span className="text-gw-muted">{item.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* 水源地POI图例 */}
      {activeLayers.has('waterSourcePOI') && (
        <div className="mb-2">
          <p className="text-gw-muted text-[9px] mb-0.5">水源地</p>
          <div className="flex items-center gap-2 py-0.5">
            <div className="w-3 h-3 bg-cyan-300 border border-white rotate-45" style={{ transform: 'rotate(45deg)', width: 10, height: 10 }} />
            <span className="text-gw-muted">重要水源地</span>
          </div>
        </div>
      )}

      {/* 岩溶泉POI图例 */}
      {activeLayers.has('karstSpringPOI') && (
        <div className="mb-2">
          <p className="text-gw-muted text-[9px] mb-0.5">岩溶泉</p>
          <div className="flex items-center gap-2 py-0.5">
            <span className="text-emerald-400 text-xs">&#9733;</span>
            <span className="text-gw-muted">岩溶大泉</span>
          </div>
        </div>
      )}
    </div>
  );
}
