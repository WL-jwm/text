import React from 'react';
import { Navigation } from 'lucide-react';
import { ExportButton } from '../UI';

interface MapToolbarProps {
  activeLayers: Set<string>;
  activeLayerCount: number;
  onExportMarkers: () => void;
  onExportVisible: () => void;
  onExportOverdraft: () => void;
  onExportResource: () => void;
  onExportWaterSourcePOI: () => void;
  onExportKarstSpringPOI: () => void;
}

export function MapToolbar({
  activeLayers, activeLayerCount,
  onExportMarkers, onExportVisible, onExportOverdraft,
  onExportResource, onExportWaterSourcePOI, onExportKarstSpringPOI,
}: MapToolbarProps) {
  return (
    <div className="absolute top-3 left-3 z-[1000] flex items-center px-2 py-1 rounded-lg text-[10px] bg-gw-surface/80 border border-gw-border/40 text-gw-muted backdrop-blur-sm gap-2">
      <Navigation size={11} className="inline" />
      {activeLayerCount} 图层
      <div className="flex items-center gap-1 ml-2">
        {activeLayers.has('markers') && (
          <>
            <ExportButton onClick={onExportMarkers} label="全部" />
            <ExportButton onClick={onExportVisible} label="已选" />
          </>
        )}
        {activeLayers.has('overdraft') && (
          <ExportButton onClick={onExportOverdraft} label="超采区" />
        )}
        {activeLayers.has('resource') && (
          <ExportButton onClick={onExportResource} label="资源" />
        )}
        {activeLayers.has('waterSourcePOI') && (
          <ExportButton onClick={onExportWaterSourcePOI} label="水源地" />
        )}
        {activeLayers.has('karstSpringPOI') && (
          <ExportButton onClick={onExportKarstSpringPOI} label="岩溶泉" />
        )}
      </div>
    </div>
  );
}
