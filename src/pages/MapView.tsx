import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Layers, Maximize2, X } from 'lucide-react';
import { TechCard, DataSourceNote } from '../components/UI';
import { exportExcel } from '../utils/exportUtils';
import { CrossLinkPanel } from '../components/CrossLink';
import {
  mapZones, springMarkers, geothermalMarkers, salineMarkers,
  waterSourceMarkers, mineMarkers, allMarkers, cityCenters, getVisibleMarkers,
  type MapMarker } from '../data/mapData';
import {
  overdraftPolygons, getCityResourceGrades,
  gradeLabels,
  type CityResourceGrade } from '../data/mapDataEnhanced';
import { importantWaterSources } from '../data/waterSource';
import { karstSprings } from '../data/karstWater';
import { useToast } from '../components/Toast';
import { useReportData } from '../hooks/useReportData';
import { ExportProgressDialog } from '../components/ExportProgressDialog';
import { CATEGORY_COLORS } from './mapConstants';
import { MapSidebar } from './MapSidebar';
import { useMapSetup } from './useMapSetup';
import { useMapLayers } from './useMapLayers';
import { useContourLayer } from './useContourLayer';
// Extracted sub-components
import { MapLayerControls } from '../components/map/MapLayerControls';
import { MapLegend } from '../components/map/MapLegend';
import { MapToolbar } from '../components/map/MapToolbar';
import { MapStatsCards } from '../components/map/MapStatsCards';
import { ContourControlPanel } from '../components/map/ContourControlPanel';
import { MapCityDetailPanel } from '../components/map/MapCityDetailPanel';

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
  const filteredMarkers = searchText.length > 0
    ? allMarkers().filter(m =>
        m.name.includes(searchText) ||
        m.type.includes(searchText) ||
        m.description.includes(searchText) ||
        m.category.includes(searchText)
      )
    : allMarkers();

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
  const categoryStats = [
    { label: '泉域', count: springMarkers.length, color: '#10b981', key: 'spring' },
    { label: '地热田', count: geothermalMarkers().length, color: '#ef4444', key: 'geothermal' },
    { label: '咸水区', count: salineMarkers.length, color: '#f59e0b', key: 'saline' },
    { label: '水源地', count: waterSourceMarkers.length, color: '#06b6d4', key: 'waterSource' },
    { label: '矿区', count: mineMarkers.length, color: '#8b5cf6', key: 'mine' },
  ];

  /** 导出标注数据 */
  const handleExportMarkers = () => {
    exportExcel(
      ['名称', '类型', '分类', '纬度', '经度', '描述'],
      allMarkers().map(m => [m.name, m.type, m.category, m.lat.toFixed(4), m.lng.toFixed(4), m.description]),
      '河北地下水地图标注',
      '标注数据'
    );
    success('标注数据已导出');
  };

  /** 导出当前可见标注 */
  const handleExportVisible = () => {
    const visible = getVisibleMarkers(visibleLayers);
    exportExcel(
      ['名称', '类型', '分类', '纬度', '经度', '描述'],
      visible.map(m => [m.name, m.type, m.category, m.lat.toFixed(4), m.lng.toFixed(4), m.description]),
      '河北地下水地图标注_已选' + visible.length + '个',
      '可见标注'
    );
    success('标注数据已导出');
  };

  /** 导出超采区数据 */
  const handleExportOverdraft = () => {
    exportExcel(
      ['城市', '超采类型', '标签', '说明', '南界纬度', '西界经度', '北界纬度', '东界经度'],
      overdraftPolygons.map(p => [p.city, p.type, p.label, p.info, p.bounds[0][0], p.bounds[0][1], p.bounds[1][0], p.bounds[1][1]]),
      '河北省超采区划数据',
      '超采区'
    );
    success('超采区数据已导出');
  };

  /** 导出资源量分级数据 */
  const handleExportResource = () => {
    exportExcel(
      ['城市', '地下水资源量(亿m³)', '地下水供水量(亿m³)', '供水占比(%)', '总供水量(亿m³)', '资源等级'],
      cityGrades.map(g => [g.city, g.groundResource, g.gwSupply, g.gwRatio, g.totalSupply, gradeLabels[g.grade]]),
      '河北省城市地下水资源量分级',
      '资源分级'
    );
    success('资源量分级数据已导出');
  };

  /** 导出水源地POI数据 */
  const handleExportWaterSourcePOI = () => {
    exportExcel(
      ['名称', '类型', '供水量', '单位', '状态', '含水层', '保护区'],
      importantWaterSources.map(ws => [ws.name, ws.type, ws.supply, ws.unit, ws.status, ws.aquifer, ws.protection]),
      '河北省重要水源地',
      '水源地'
    );
    success('水源地数据已导出');
  };

  /** 导出岩溶泉POI数据 */
  const handleExportKarstSpringPOI = () => {
    exportExcel(
      ['名称', '位置', '流量(m³/s)', '类型', '面积(km²)', '补给面积(km²)', '岩性', 'TDS(g/L)'],
      karstSprings.map(ks => [ks.name, ks.location, ks.discharge, ks.type, ks.area, ks.rechargeArea, ks.lithology, ks.tds]),
      '河北省岩溶大泉',
      '岩溶泉'
    );
    success('岩溶泉数据已导出');
  };

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
              onExportMarkers={handleExportMarkers}
              onExportVisible={handleExportVisible}
              onExportOverdraft={handleExportOverdraft}
              onExportResource={handleExportResource}
              onExportWaterSourcePOI={handleExportWaterSourcePOI}
              onExportKarstSpringPOI={handleExportKarstSpringPOI}
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
          {selectedMarker && activeLayers.has('markers') && (
            <div className="absolute bottom-3 left-3 right-3 z-[1000] px-3 py-2 rounded-lg bg-gw-surface/90 border border-gw-border/40 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: CATEGORY_COLORS[selectedMarker.category] }} />
                  <div>
                    <span className="text-xs font-medium text-gw-text">{selectedMarker.name}</span>
                    <span className="text-[10px] text-gw-muted ml-2">{selectedMarker.type} | {selectedMarker.description}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedMarker(null)} className="text-gw-muted hover:text-gw-text">
                  <X size={12} />
                </button>
              </div>
            </div>
          )}

          {/* 城市详情面板 */}
          {cityDetailPanel && (
            <MapCityDetailPanel
              cityName={cityDetailPanel}
              cityGrades={cityGrades}
              onClose={() => setCityDetailPanel(null)}
            />
          )}
        </TechCard>

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
