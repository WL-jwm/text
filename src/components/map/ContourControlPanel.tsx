import React from 'react';
import { TechCard } from '../UI';
import { contourDatasets, getContourDataset } from '../../data/contourData';

interface ContourControlPanelProps {
  activeContour: string;
  contourOpacity: number;
  onSetActiveContour: (key: string) => void;
  onSetContourOpacity: (val: number) => void;
}

export function ContourControlPanel({
  activeContour, contourOpacity,
  onSetActiveContour, onSetContourOpacity,
}: ContourControlPanelProps) {
  return (
    <TechCard title="等值线图层控制" badge="IDW插值">
      <div className="space-y-3">
        <div>
          <div className="text-[10px] text-gw-muted mb-1">数据图层</div>
          <div className="flex flex-wrap gap-1.5">
            {contourDatasets.map(ds => (
              <button
                key={ds.key}
                onClick={() => onSetActiveContour(ds.key)}
                className={'px-2.5 py-1 rounded text-[10px] font-medium transition-all ' +
                  (activeContour === ds.key ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-gw-surface/50 text-gw-muted border border-gw-border/30 hover:border-purple-500/20')}
              >
                {ds.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-gw-muted mb-1">透明度: {(contourOpacity * 100).toFixed(0)}%</div>
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.1}
            value={contourOpacity}
            onChange={e => onSetContourOpacity(parseFloat(e.target.value))}
            className="w-full h-1 bg-gw-border/30 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>
        {(() => {
          const ds = getContourDataset(activeContour);
          if (!ds) return null;
          return (
            <div className="grid grid-cols-3 gap-1.5">
              <div className="px-2 py-1.5 rounded border text-center" style={{ borderColor: '#8b5cf650', backgroundColor: '#8b5cf615' }}>
                <div className="text-[9px] text-gw-muted">数据点</div>
                <div className="text-xs font-bold text-purple-400">{ds.points.length}</div>
              </div>
              <div className="px-2 py-1.5 rounded border text-center" style={{ borderColor: '#8b5cf650', backgroundColor: '#8b5cf615' }}>
                <div className="text-[9px] text-gw-muted">单位</div>
                <div className="text-xs font-bold text-purple-400">{ds.unit}</div>
              </div>
              <div className="px-2 py-1.5 rounded border text-center" style={{ borderColor: '#8b5cf650', backgroundColor: '#8b5cf615' }}>
                <div className="text-[9px] text-gw-muted">范围</div>
                <div className="text-xs font-bold text-purple-400">{ds.minVal}~{ds.maxVal}</div>
              </div>
            </div>
          );
        })()}
        <div className="text-[10px] text-gw-muted">{getContourDataset(activeContour)?.description}</div>
        {/* 色带图例 */}
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-gw-muted">低</span>
          <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{
            background: 'linear-gradient(to right, #3b82f6, #22c55e, #eab308, #f97316, #ef4444)'
          }} />
          <span className="text-[9px] text-gw-muted">高</span>
        </div>
      </div>
    </TechCard>
  );
}
