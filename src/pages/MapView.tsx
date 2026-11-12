import { CrossLinkPanel } from '../components/CrossLink';
import { ExportProgressDialog } from '../components/ExportProgressDialog';
import { useToast } from '../components/Toast';
import { DataSourceNote } from '../components/UI';
import { ContourControlPanel } from '../components/map/ContourControlPanel';
import { MapLayerControls } from '../components/map/MapLayerControls';
import { MapStatsCards } from '../components/map/MapStatsCards';
import { type MapMarker, mapZones, cityCenters, allMarkers } from '../data/mapData';
import { type CityResourceGrade, overdraftPolygons, getCityResourceGrades } from '../data/mapDataEnhanced';
import { buildCategoryStats, filterMarkersByKeyword, buildMapExportHandlers } from './mapViewParts/mapExportHandlers';
import { useReportData } from '../hooks/useReportData';
import { MapSidebar } from './MapSidebar';
import { useContourLayer } from './useContourLayer';
import { useMapLayers } from './useMapLayers';
import { useMapSetup } from './useMapSetup';
import { Maximize2, Layers } from 'lucide-react';
import React, { useCallback, useMemo, useEffect, useRef, useState } from 'react';
import { MapCanvasPanel } from './mapViewParts/MapCanvasPanel';

export function MapView() {
  const { success } = useToast();
  const mapRef = useRef<HTMLDivElement>(null);

  // ═══════ v4.3.0: 可叠加图层状态 ═══════
  const [activeLayers, setActiveLayers] = useState<Set<string>>(
    new Set(['markers'])
  );

  // 标注子图层
  const [visibleLayers, setVisibleLayers] = useState<Set<string>>(
    new Set(['spring', 'geothermal', 'saline', 'waterSource', 'mine'])
  );
  const [showZones, setShowZones] = useState(true);
  const [showBoundary, setShowBoundary] = useState(true);
  const [showCountyCoverage, setShowCountyCoverage] = useState(false);

  // 超采区子状态
  const [showOverdraft, setShowOverdraft] = useState(true);
  const [overdraftFilter, setOverdraftFilter] = useState<Set<string>>(
    new Set(['shallow-general', 'deep-general', 'deep-severe'])
  );

  // 资源量子状态
  const [showCityBoundary, setShowCityBoundary] = useState(true);

  // 等值线图层状态
  const [activeContour, setActiveContour] = useState('waterLevel');
  const [contourOpacity, setContourOpacity] = useState(0.6);

  // 通用状态
  const [activeCenter, setActiveCenter] = useState(cityCenters[0]);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [searchText, setSearchText] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [, setMarkerCount] = useState(0);
  const [cityDetailPanel, setCityDetailPanel] = useState<string | null>(null);

  // 报告导出
  const [exportOpen, setExportOpen] = useState(false);
  const mapViewData = useMemo(() => ({
    markers: allMarkers(),
    zones: mapZones,
    overdraftPolygons,
    cityGrades: getCityResourceGrades(),
  }), []);

  const { getData, isLoading: dataLoading } = useReportData({
    pageName: 'mapView',
    collector: useCallback(async () => mapViewData, [mapViewData]),
  });

  // 地图实例与图层引用（初始化 + 图层 refs）
  const { mapInstanceRef, mapLoaded, layerRefs } = useMapSetup(mapRef, activeCenter);

  const cityGrades: CityResourceGrade[] = useMemo(() => getCityResourceGrades(), []);

  // 各图层渲染
  useMapLayers({
    mapInstanceRef,
    layerRefs,
    activeLayers,
    visibleLayers,
    showZones,
    showBoundary,
    showCountyCoverage,
    showOverdraft,
    overdraftFilter,
    showCityBoundary,
    cityGrades,
    onMarkerCountChange: setMarkerCount,
    onSelectMarker: setSelectedMarker,
    onCityDetail: setCityDetailPanel,
  });

  // 等值线渲染
  useContourLayer({
    mapInstanceRef,
    contourRef: layerRefs.contour,
    activeLayers,
    activeContour,
    contourOpacity,
  });

  /** 切换图层 */
  const toggleLayer = (layerKey: string) => {
    setActiveLayers(prev => {
      const next = new Set(prev);
      if (next.has(layerKey)) next.delete(layerKey);
      else next.add(layerKey);
      return next;
    });
  };

  /** 切换标注子图层 */
  const toggleMarkerCategory = (category: string) => {
    setVisibleLayers(prev => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  /** 切换超采区类型过滤 */
  const toggleOverdraftType = (type: string) => {
    setOverdraftFilter(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  /** 重置图层到默认 */
  const resetLayers = () => setActiveLayers(new Set(['markers']));

  /** 定位到城市（跟随 activeCenter 变化） */
  useEffect(() => {
    if (mapInstanceRef.current && activeCenter) {
      mapInstanceRef.current.setView([activeCenter.lat, activeCenter.lng], activeCenter.zoom, { animate: true });
    }
  }, [activeCenter, mapInstanceRef]);

  /** 全屏 */
  const toggleFullscreen = () => {
    if (mapRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        mapRef.current.requestFullscreen();
      }
    }
  };

  /** 过滤搜索 */
  const filteredMarkers = useMemo(() => filterMarkersByKeyword(searchText), [searchText]);

  /** 定位到标注点 */
  const flyToMarker = (m: MapMarker) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([m.lat, m.lng], 11, { duration: 1 });
      setSelectedMarker(m);
    }
  };

  /** 定位到城市 */
  const flyToCity = (cityName: string) => {
    const center = cityCenters.find(c => c.name === cityName);
    if (center && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([center.lat, center.lng], 10, { duration: 1 });
      setCityDetailPanel(cityName);
    }
  };

  /** 分类统计 */
  const categoryStats = useMemo(() => buildCategoryStats(), []);

  // 导出处理函数（下沉至 mapViewParts/mapExportHandlers）
  const {
    handleExportMarkers,
    handleExportVisible,
    handleExportOverdraft,
    handleExportResource,
    handleExportWaterSourcePOI,
    handleExportKarstSpringPOI,
  } = useMemo(() => buildMapExportHandlers({ notify: success, visibleLayers, cityGrades }), [visibleLayers, cityGrades]);

  /** 当前活跃图层的统计信息 */
  const activeLayerCount = activeLayers.size;

  return (
    <div className="p-3 md:p-6 max-w-[1440px] mx-auto space-y-4">
      {/* 标题栏 */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-gw-text">空间地图</h1>
          <p className="text-xs text-gw-muted mt-1">天地图底图 | 多图层叠加 | 城市数据聚合 | v4.3.0</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExportOpen(true)}
            className="px-2 py-1.5 rounded-lg text-xs bg-gw-surface/60 border border-gw-border/40 text-gw-muted hover:text-gw-text transition-colors"
          >
            导出报告
          </button>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="px-2 py-1.5 rounded-lg text-xs bg-gw-surface/60 border border-gw-border/40 text-gw-muted hover:text-gw-text transition-colors">
            <Layers size={14} className="inline mr-1" />
            {sidebarOpen ? '隐藏面板' : '显示面板'}
          </button>
          <button onClick={toggleFullscreen}
            className="px-2 py-1.5 rounded-lg text-xs bg-gw-surface/60 border border-gw-border/40 text-gw-muted hover:text-gw-text transition-colors">
            <Maximize2 size={14} className="inline mr-1" />
            全屏
          </button>
        </div>
      </div>

      {/* 图层切换按钮 */}
      <MapLayerControls
        activeLayers={activeLayers}
        activeLayerCount={activeLayerCount}
        onToggleLayer={toggleLayer}
        onResetLayers={resetLayers}
      />

      {/* 统计卡片 */}
      <MapStatsCards
        activeLayers={activeLayers}
        visibleLayers={visibleLayers}
        overdraftFilter={overdraftFilter}
        cityGrades={cityGrades}
        onToggleMarkerCategory={toggleMarkerCategory}
        onToggleOverdraftType={toggleOverdraftType}
      />

      {/* 等值线图层控制面板 */}
      {activeLayers.has('contour') && (
        <ContourControlPanel
          activeContour={activeContour}
          contourOpacity={contourOpacity}
          onSetActiveContour={setActiveContour}
          onSetContourOpacity={setContourOpacity}
        />
      )}

      {/* 主体：地图 + 侧边栏 */}
      <div className={'grid gap-4 ' + (sidebarOpen ? 'grid-cols-1 lg:grid-cols-[1fr_300px]' : 'grid-cols-1')}>
        {/* 地图区域 */}
      <MapCanvasPanel mapRef={mapRef} mapLoaded={mapLoaded} activeLayers={activeLayers} activeLayerCount={activeLayerCount} categoryStats={categoryStats} selectedMarker={selectedMarker} onCloseMarker={() => setSelectedMarker(null)} cityDetailPanel={cityDetailPanel} cityGrades={cityGrades} onCloseCityDetail={() => setCityDetailPanel(null)} onExportMarkers={handleExportMarkers} onExportVisible={handleExportVisible} onExportOverdraft={handleExportOverdraft} onExportResource={handleExportResource} onExportWaterSourcePOI={handleExportWaterSourcePOI} onExportKarstSpringPOI={handleExportKarstSpringPOI} />

        {sidebarOpen && (
          <MapSidebar
            searchText={searchText}
            onSearchTextChange={setSearchText}
            filteredMarkers={filteredMarkers}
            onFlyToMarker={flyToMarker}
            activeLayers={activeLayers}
            visibleLayers={visibleLayers}
            onToggleMarkerCategory={toggleMarkerCategory}
            showZones={showZones}
            onToggleZones={() => setShowZones(!showZones)}
            showCountyCoverage={showCountyCoverage}
            onToggleCountyCoverage={() => setShowCountyCoverage(!showCountyCoverage)}
            showBoundary={showBoundary}
            onToggleBoundary={() => setShowBoundary(!showBoundary)}
            showCityBoundary={showCityBoundary}
            onToggleCityBoundary={() => setShowCityBoundary(!showCityBoundary)}
            showOverdraft={showOverdraft}
            onToggleOverdraft={() => setShowOverdraft(!showOverdraft)}
            overdraftFilter={overdraftFilter}
            onToggleOverdraftType={toggleOverdraftType}
            activeCenter={activeCenter}
            onSetActiveCenter={setActiveCenter}
            cityDetailPanel={cityDetailPanel}
            onFlyToCity={flyToCity}
            cityGrades={cityGrades}
            selectedMarker={selectedMarker}
          />
        )}
      </div>

      <DataSourceNote source="天地图 WMTS 服务 | 河北省地下水系统区划(1999) | 超采区通知(2022) | 水资源公报(2024)" version="v3.0" />
      <CrossLinkPanel currentPath="/map" />

      {/* 报告导出对话框 */}
      <ExportProgressDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        reportType="mapView"
        reportLabel="河北省地下水空间地图综合报告"
        data={getData()}
        dataLoading={dataLoading}
      />
    </div>
  );
}
