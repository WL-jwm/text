/**
 * 空间地图画布（拆分自 MapView.tsx）
 */
import { TechCard } from '../../components/UI';
import { MapToolbar } from '../../components/map/MapToolbar';
import { MapLegend } from '../../components/map/MapLegend';
import { SelectedMarkerBar } from './SelectedMarkerBar';
import { MapCityDetailPanel } from '../../components/map/MapCityDetailPanel';
import type { MapMarker } from '../../data/mapData';
import type { CityResourceGrade } from '../../data/mapDataEnhanced';

interface MapCanvasPanelProps {
  mapRef: React.RefObject<HTMLDivElement>;
  mapLoaded: boolean;
  activeLayers: Set<string>;
  activeLayerCount: number;
  categoryStats: { key: string; label: string; count: number; color: string }[];
  selectedMarker: MapMarker | null;
  onCloseMarker: () => void;
  cityDetailPanel: string | null;
  cityGrades: CityResourceGrade[];
  onCloseCityDetail: () => void;
  onExportMarkers: () => void;
  onExportVisible: () => void;
  onExportOverdraft: () => void;
  onExportResource: () => void;
  onExportWaterSourcePOI: () => void;
  onExportKarstSpringPOI: () => void;
}

export function MapCanvasPanel({ mapRef, mapLoaded, activeLayers, activeLayerCount, categoryStats, selectedMarker, onCloseMarker, cityDetailPanel, cityGrades, onCloseCityDetail, onExportMarkers, onExportVisible, onExportOverdraft, onExportResource, onExportWaterSourcePOI, onExportKarstSpringPOI }: MapCanvasPanelProps) {
  return (
        <TechCard title={'空间地图'} className="!p-0 overflow-hidden relative">
          <div ref={mapRef} className="w-full" style={{ height: '600px' }} />
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gw-surface/80 z-10">
              <div className="text-gw-muted text-sm animate-pulse">加载地图...</div>
            </div>
          )}

          {/* 地图顶部工具栏 */}
          {mapLoaded && (
            <MapToolbar
              activeLayers={activeLayers}
              activeLayerCount={activeLayerCount}
              onExportMarkers={onExportMarkers}
              onExportVisible={onExportVisible}
              onExportOverdraft={onExportOverdraft}
              onExportResource={onExportResource}
              onExportWaterSourcePOI={onExportWaterSourcePOI}
              onExportKarstSpringPOI={onExportKarstSpringPOI}
            />
          )}

          {/* 自适应图例 */}
          {mapLoaded && activeLayerCount > 0 && (
            <MapLegend
              activeLayers={activeLayers}
              categoryStats={categoryStats}
            />
          )}

          {/* 选中标注信息条 */}
          {selectedMarker && activeLayers.has('markers') && <SelectedMarkerBar marker={selectedMarker} onClose={() => onCloseMarker()} />}

          {/* 城市详情面板 */}
          {cityDetailPanel && (
            <MapCityDetailPanel
              cityName={cityDetailPanel}
              cityGrades={cityGrades}
              onClose={() => onCloseCityDetail()}
            />
          )}
        </TechCard>
  );
}
