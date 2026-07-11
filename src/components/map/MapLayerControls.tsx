import React from 'react';
import { LAYER_DEFS } from '../../pages/mapConstants';

interface MapLayerControlsProps {
  activeLayers: Set<string>;
  activeLayerCount: number;
  onToggleLayer: (key: string) => void;
  onResetLayers: () => void;
}

export function MapLayerControls({ activeLayers, activeLayerCount, onToggleLayer, onResetLayers }: MapLayerControlsProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {LAYER_DEFS.map(layerDef => {
        const IconComp = layerDef.icon;
        const isActive = activeLayers.has(layerDef.key);
        return (
          <button
            key={layerDef.key}
            onClick={() => onToggleLayer(layerDef.key)}
            className={'flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all border ' +
              (isActive
                ? 'border-opacity-30 shadow-[0_0_8px_rgba(255,255,255,0.05)]'
                : 'text-gw-muted hover:text-gw-text bg-gw-surface/30 border-gw-border/30 hover:border-gw-border/60'
              )
            }
            style={isActive ? {
              borderColor: layerDef.color + '40',
              backgroundColor: layerDef.color + '15',
              color: layerDef.color,
            } : {}}
          >
            <IconComp size={14} />
            {layerDef.label}
            <span className="text-[10px] opacity-60 hidden sm:inline">{layerDef.desc}</span>
          </button>
        );
      })}
      <div className="flex items-center px-2 text-[10px] text-gw-muted ml-1">
        已激活 {activeLayerCount} 个图层
        {activeLayerCount > 1 && (
          <button onClick={onResetLayers}
            className="ml-2 px-1.5 py-0.5 rounded bg-gw-surface/50 border border-gw-border/30 text-gw-muted hover:text-gw-text text-[10px]">
            重置
          </button>
        )}
      </div>
    </div>
  );
}
