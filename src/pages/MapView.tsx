import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Layers, Maximize2, X } from 'lucide-react';
import { TechCard, DataSourceNote } from '../components/UI';
import { cityBulletin2024 } from '../data/resources';
import { exportExcel } from '../utils/exportUtils';
import { CrossLinkPanel } from '../components/CrossLink';
import {
  mapZones, springMarkers, geothermalMarkers,
  salineMarkers, waterSourceMarkers, mineMarkers,
  allMarkers, hebeiBoundary, cityCenters, getVisibleMarkers,
  type MapMarker, type MapLayerConfig as _MapLayerConfig } from '../data/mapData';
import {
  cityBounds, overdraftPolygons,
  getCityResourceGrades,
  gradeColors, gradeLabels,
  type CityResourceGrade as _CityResourceGrade } from '../data/mapDataEnhanced';
import { importantWaterSources } from '../data/waterSource';
import { karstSprings } from '../data/karstWater';
import { useToast } from '../components/Toast';
import type { CountyDataItem } from '../types/county';
import type { LMap, LLayerGroup, LNamespace, LImageOverlay } from '../types/leaflet';
import { useReportData } from '../hooks/useReportData';
import { ExportProgressDialog } from '../components/ExportProgressDialog';
import { getContourDataset } from '../data/contourData';
import { idwInterpolate, gridToCanvas, COLOR_SCHEMES } from '../utils/idwInterpolation';
import {
  TIAN_DI_TOKEN, CATEGORY_COLORS,
  createCircleIcon, createPulseIcon, createGradeBubble,
  WATER_SOURCE_COORDS, KARST_SPRING_COORDS,
  createWaterSourceIcon, createKarstSpringIcon,
} from './mapConstants';
import { MapSidebar } from './MapSidebar';
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
  const mapInstanceRef = useRef<LMap | null>(null);
  const layerGroupRef = useRef<LLayerGroup | null>(null);
  const zoneLayerRef = useRef<LLayerGroup | null>(null);
  const boundaryLayerRef = useRef<LLayerGroup | null>(null);
  const countyCoverageLayerRef = useRef<LLayerGroup | null>(null);
  const overdraftLayerRef = useRef<LLayerGroup | null>(null);
  const resourceLayerRef = useRef<LLayerGroup | null>(null);
  const cityBoundaryLayerRef = useRef<LLayerGroup | null>(null);
  const waterSourcePOILayerRef = useRef<LLayerGroup | null>(null);
  const karstSpringPOILayerRef = useRef<LLayerGroup | null>(null);
  const contourLayerRef = useRef<LImageOverlay | null>(null); // L.imageOverlay

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
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [, ] = useState<string | null>(null);
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

  /** 加载Leaflet */
  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window === 'undefined') return;
      if (window.L) {
        initMap();
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => initMap();
      document.head.appendChild(script);
    };
    loadLeaflet();
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  /** 初始化地图 */
  const initMap = useCallback(() => {
    const L: LNamespace = window.L;
    if (!L || !mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [activeCenter.lat, activeCenter.lng],
      zoom: activeCenter.zoom,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // 天地图矢量底图
    L.tileLayer(
      'https://t{s}.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}&tk=' + TIAN_DI_TOKEN,
      { subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'], maxZoom: 18, attribution: '&copy; 天地图' }
    ).addTo(map);

    // 天地图矢量注记
    L.tileLayer(
      'https://t{s}.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}&tk=' + TIAN_DI_TOKEN,
      { subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'], maxZoom: 18 }
    ).addTo(map);

    // 图层组
    layerGroupRef.current = L.layerGroup().addTo(map);
    zoneLayerRef.current = L.layerGroup();
    boundaryLayerRef.current = L.layerGroup().addTo(map);
    countyCoverageLayerRef.current = L.layerGroup();
    overdraftLayerRef.current = L.layerGroup();
    resourceLayerRef.current = L.layerGroup();
    cityBoundaryLayerRef.current = L.layerGroup();
    waterSourcePOILayerRef.current = L.layerGroup();
    karstSpringPOILayerRef.current = L.layerGroup();
    contourLayerRef.current = null;

    mapInstanceRef.current = map;
    setMapLoaded(true);
  }, [activeCenter]);

  /** 定位到城市 */
  useEffect(() => {
    if (mapInstanceRef.current && activeCenter) {
      mapInstanceRef.current.setView([activeCenter.lat, activeCenter.lng], activeCenter.zoom, { animate: true });
    }
  }, [activeCenter]);

  // ═══════════════════════════════════════════════════════════
  // 标注图层（markers图层）
  // ═══════════════════════════════════════════════════════════

  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;
    const L: LNamespace = window.L;

    layerGroupRef.current.clearLayers();
    if (!activeLayers.has('markers')) { setMarkerCount(0); return; }

    const markers = getVisibleMarkers(visibleLayers);
    markers.forEach(m => {
      const color = CATEGORY_COLORS[m.category] || '#3b82f6';
      const isSpring = m.category === 'spring';
      const iconHtml = isSpring ? createPulseIcon(color) : createCircleIcon(color);

      const icon = L.divIcon({
        html: iconHtml,
        className: '',
        iconSize: [isSpring ? 22 : 12, isSpring ? 22 : 12],
        iconAnchor: [isSpring ? 11 : 6, isSpring ? 11 : 6],
      });

      const popupContent = buildPopupContent(m);
      const marker = L.marker([m.lat, m.lng], { icon })
        .addTo(layerGroupRef.current)
        .bindPopup(popupContent, { maxWidth: 280, className: 'gw-popup' });

      marker.on('click', () => setSelectedMarker(m));
    });

    setMarkerCount(markers.length);
  }, [visibleLayers, activeLayers]);

  /** 更新区划面 */
  useEffect(() => {
    if (!mapInstanceRef.current || !zoneLayerRef.current) return;
    const L: LNamespace = window.L;

    zoneLayerRef.current.clearLayers();
    if (!showZones || !activeLayers.has('markers')) return;

    mapZones.forEach(zone => {
      const rect = L.rectangle(zone.bounds, {
        color: zone.color,
        weight: 1.5,
        fillColor: zone.fillColor,
        fillOpacity: 0.5,
        dashArray: '4 3',
      });
      rect.bindTooltip(
        '<div style="font-size:12px;"><b>' + zone.code + ' ' + zone.name + '</b><br/>' + zone.info + '</div>',
        { sticky: true, className: 'gw-tooltip' }
      );
      rect.addTo(zoneLayerRef.current);
    });

    if (activeLayers.has('markers') && showZones) {
      zoneLayerRef.current.addTo(mapInstanceRef.current);
    } else {
      zoneLayerRef.current.remove();
    }
  }, [showZones, activeLayers]);

  /** 更新省界 */
  useEffect(() => {
    if (!mapInstanceRef.current || !boundaryLayerRef.current) return;
    const L: LNamespace = window.L;

    boundaryLayerRef.current.clearLayers();
    if (!showBoundary) return;

    const polygon = L.polygon(hebeiBoundary, {
      color: '#3b82f6',
      weight: 2.5,
      fillColor: 'transparent',
      fillOpacity: 0,
      dashArray: '',
    });
    polygon.addTo(boundaryLayerRef.current);
  }, [showBoundary]);

  /** 更新县级数据覆盖标注 */
  useEffect(() => {
    if (!mapInstanceRef.current || !countyCoverageLayerRef.current) return;
    const L: LNamespace = window.L;

    countyCoverageLayerRef.current.clearLayers();
    if (!showCountyCoverage || !activeLayers.has('markers')) {
      countyCoverageLayerRef.current.remove();
      return;
    }

    cityBulletin2024.forEach(city => {
      const cityName = city.city.replace('市', '');
      const center = cityCenters.find(c => c.name === cityName);
      if (!center) return;

      const hasCounties = city.counties && city.counties.length > 0;
      const hasData = hasCounties && (city.counties as CountyDataItem[]).some((c: CountyDataItem) => c.precip != null);
      const countyCount = hasCounties ? city.counties.length : 0;
      const dataCount = hasCounties ? (city.counties as CountyDataItem[]).filter((c: CountyDataItem) => c.precip != null).length : 0;

      let color: string, label: string, size: number;
      if (!hasCounties) {
        color = '#6b7280'; label = '无数据'; size = 8;
      } else if (hasData) {
        color = '#10b981'; label = dataCount + '/' + countyCount + '县'; size = 14;
      } else {
        color = '#f59e0b'; label = countyCount + '县(待补)'; size = 10;
      }

      const iconHtml = '<div style="position:relative;width:' + size + 'px;height:' + size + 'px;">' +
        '<div style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:' + color + ';border:2px solid rgba(255,255,255,0.9);box-shadow:0 0 8px ' + color + '80;"></div></div>';

      const icon = L.divIcon({
        html: iconHtml,
        className: '',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const popupHtml = '<div style="background:#1f2937;color:#e5e7eb;font-family:system-ui;padding:10px;border-radius:8px;min-width:200px;">' +
        '<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">' +
        '<div style="width:10px;height:10px;border-radius:50%;background:' + color + ';"></div>' +
        '<span style="font-weight:600;font-size:13px;">' + city.city + '</span></div>' +
        '<div style="font-size:11px;color:#9ca3af;">' +
        '<div>状态: <span style="color:' + color + ';">' + label + '</span></div>' +
        (hasCounties ? '<div>县区总数: ' + countyCount + '</div>' : '') +
        (hasData ? '<div>有降水数据: ' + dataCount + '县</div>' : '') +
        (city.precipitation ? '<div>全市降水: ' + city.precipitation + ' mm</div>' : '') +
        '</div></div>';

      L.marker([center.lat, center.lng], { icon })
        .addTo(countyCoverageLayerRef.current)
        .bindPopup(popupHtml, { maxWidth: 280, className: 'gw-popup' });
    });

    countyCoverageLayerRef.current.addTo(mapInstanceRef.current);
  }, [showCountyCoverage, activeLayers]);

  // ═══════════════════════════════════════════════════════════
  // 超采区图层（overdraft图层）
  // ═══════════════════════════════════════════════════════════

  useEffect(() => {
    if (!mapInstanceRef.current || !overdraftLayerRef.current) return;
    const L: LNamespace = window.L;

    overdraftLayerRef.current.clearLayers();
    if (!activeLayers.has('overdraft') || !showOverdraft) {
      overdraftLayerRef.current.remove();
      return;
    }

    overdraftPolygons
      .filter(p => overdraftFilter.has(p.type))
      .forEach(p => {
        const rect = L.rectangle(p.bounds, {
          color: p.color,
          weight: 1.5,
          fillColor: p.fillColor,
          fillOpacity: 0.6,
          dashArray: p.type === 'deep-severe' ? '' : '6 3',
        });
        rect.bindTooltip(
          '<div style="font-size:12px;"><b>' + p.label + '</b><br/>' + p.info + '</div>',
          { sticky: true, className: 'gw-tooltip' }
        );
        rect.addTo(overdraftLayerRef.current);
      });

    overdraftLayerRef.current.addTo(mapInstanceRef.current);
  }, [activeLayers, showOverdraft, overdraftFilter]);

  // ═══════════════════════════════════════════════════════════
  // 资源量分级图层（resource图层）
  // ═══════════════════════════════════════════════════════════

  const cityGrades = useMemo(() => getCityResourceGrades(), []);

  useEffect(() => {
    if (!mapInstanceRef.current || !resourceLayerRef.current || !cityBoundaryLayerRef.current) return;
    const L: LNamespace = window.L;

    resourceLayerRef.current.clearLayers();
    cityBoundaryLayerRef.current.clearLayers();

    if (!activeLayers.has('resource')) {
      resourceLayerRef.current.remove();
      cityBoundaryLayerRef.current.remove();
      return;
    }

    // 城市边界着色
    if (showCityBoundary) {
      cityBounds.forEach(cb => {
        const grade = cityGrades.find(g => g.city === cb.city);
        const color = grade ? gradeColors[grade.grade] : '#6b7280';
        const polygon = L.rectangle(cb.bounds, {
          color: color,
          weight: 1.5,
          fillColor: color,
          fillOpacity: 0.15,
          dashArray: '',
        });
        polygon.bindTooltip(
          '<div style="font-size:12px;"><b>' + cb.city + '</b><br/>地下水资源量: ' + (grade ? grade.groundResource.toFixed(2) + '亿m³' : '-') + '<br/>等级: ' + (grade ? gradeLabels[grade.grade] : '-') + '</div>',
          { sticky: true, className: 'gw-tooltip' }
        );
        polygon.addTo(cityBoundaryLayerRef.current);
      });
    }

    // 资源量气泡标注 — 点击弹出详情面板
    cityGrades.forEach(g => {
      const iconHtml = createGradeBubble(g.grade, g.city, g.groundResource);
      const size = 18 + (5 - g.grade) * 4;
      const icon = L.divIcon({
        html: iconHtml,
        className: '',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker(g.center, { icon });
      marker.on('click', () => {
        setCityDetailPanel(g.city);
      });
      marker.addTo(resourceLayerRef.current);
    });

    resourceLayerRef.current.addTo(mapInstanceRef.current);
    cityBoundaryLayerRef.current.addTo(mapInstanceRef.current);
  }, [activeLayers, showCityBoundary, cityGrades]);

  // ═══════════════════════════════════════════════════════════
  // v4.3.0: 重要水源地POI图层
  // ═══════════════════════════════════════════════════════════

  useEffect(() => {
    if (!mapInstanceRef.current || !waterSourcePOILayerRef.current) return;
    const L: LNamespace = window.L;

    waterSourcePOILayerRef.current.clearLayers();
    if (!activeLayers.has('waterSourcePOI')) {
      waterSourcePOILayerRef.current.remove();
      return;
    }

    importantWaterSources.forEach(ws => {
      const coords = WATER_SOURCE_COORDS[ws.name];
      if (!coords) return;

      const iconHtml = createWaterSourceIcon();
      const icon = L.divIcon({
        html: iconHtml,
        className: '',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      const popupHtml = '<div style="background:linear-gradient(135deg,#1e293b,#0f172a);color:#e5e7eb;font-family:system-ui;padding:10px;border-radius:8px;min-width:220px;border:1px solid rgba(34,211,238,0.2);">' +
        '<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">' +
        '<div style="width:8px;height:8px;border-radius:50%;background:#22d3ee;"></div>' +
        '<span style="font-weight:600;font-size:13px;color:#22d3ee;">' + ws.name + '</span></div>' +
        '<div style="font-size:11px;color:#9ca3af;margin-bottom:4px;">' + ws.type + '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;">' +
        '<div style="padding:4px 6px;background:rgba(34,211,238,0.08);border:1px solid rgba(34,211,238,0.15);border-radius:4px;">' +
        '<div style="font-size:9px;color:#9ca3af;">供水量</div>' +
        '<div style="font-size:12px;font-weight:700;color:#22d3ee;">' + ws.supply + ' ' + ws.unit + '</div></div>' +
        '<div style="padding:4px 6px;background:rgba(34,211,238,0.08);border:1px solid rgba(34,211,238,0.15);border-radius:4px;">' +
        '<div style="font-size:9px;color:#9ca3af;">含水层</div>' +
        '<div style="font-size:10px;color:#e5e7eb;word-break:break-all;">' + ws.aquifer + '</div></div></div>' +
        '<div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:4px;margin-top:4px;">' +
        '<div style="font-size:10px;color:#9ca3af;">状态: <span style="color:' + (ws.status.includes('替代') ? '#f59e0b' : '#10b981') + ';">' + ws.status + '</span></div>' +
        '<div style="font-size:10px;color:#9ca3af;">保护区: ' + ws.protection + '</div></div></div>';

      L.marker(coords, { icon })
        .addTo(waterSourcePOILayerRef.current)
        .bindPopup(popupHtml, { maxWidth: 280, className: 'gw-popup' });
    });

    waterSourcePOILayerRef.current.addTo(mapInstanceRef.current);
  }, [activeLayers]);

  // ═══════════════════════════════════════════════════════════
  // v4.3.0: 岩溶大泉POI图层
  // ═══════════════════════════════════════════════════════════

  useEffect(() => {
    if (!mapInstanceRef.current || !karstSpringPOILayerRef.current) return;
    const L: LNamespace = window.L;

    karstSpringPOILayerRef.current.clearLayers();
    if (!activeLayers.has('karstSpringPOI')) {
      karstSpringPOILayerRef.current.remove();
      return;
    }

    karstSprings.forEach(ks => {
      const coords = KARST_SPRING_COORDS[ks.name];
      if (!coords) return;

      const iconHtml = createKarstSpringIcon();
      const icon = L.divIcon({
        html: iconHtml,
        className: '',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      const popupHtml = '<div style="background:linear-gradient(135deg,#1e293b,#0f172a);color:#e5e7eb;font-family:system-ui;padding:10px;border-radius:8px;min-width:240px;border:1px solid rgba(16,185,129,0.2);">' +
        '<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">' +
        '<span style="font-size:14px;">&#9733;</span>' +
        '<span style="font-weight:600;font-size:13px;color:#10b981;">' + ks.name + '</span></div>' +
        '<div style="font-size:11px;color:#9ca3af;margin-bottom:4px;">' + ks.location + ' · ' + ks.type + '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;">' +
        '<div style="padding:4px 6px;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.15);border-radius:4px;">' +
        '<div style="font-size:9px;color:#9ca3af;">流量</div>' +
        '<div style="font-size:12px;font-weight:700;color:#10b981;">' + ks.discharge + ' ' + ks.unit + '</div></div>' +
        '<div style="padding:4px 6px;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.15);border-radius:4px;">' +
        '<div style="font-size:9px;color:#9ca3af;">泉域面积</div>' +
        '<div style="font-size:12px;font-weight:700;color:#10b981;">' + ks.area + ' km²</div></div>' +
        '<div style="padding:4px 6px;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.15);border-radius:4px;">' +
        '<div style="font-size:9px;color:#9ca3af;">补给面积</div>' +
        '<div style="font-size:11px;color:#e5e7eb;">' + ks.rechargeArea + ' km²</div></div>' +
        '<div style="padding:4px 6px;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.15);border-radius:4px;">' +
        '<div style="font-size:9px;color:#9ca3af;">TDS</div>' +
        '<div style="font-size:11px;color:#e5e7eb;">' + ks.tds + ' g/L</div></div></div>' +
        '<div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:4px;margin-top:4px;">' +
        '<div style="font-size:10px;color:#9ca3af;">岩性: ' + ks.lithology + '</div>' +
        '<div style="font-size:10px;color:#9ca3af;">特征: ' + ks.features + '</div></div></div>';

      L.marker(coords, { icon })
        .addTo(karstSpringPOILayerRef.current)
        .bindPopup(popupHtml, { maxWidth: 280, className: 'gw-popup' });
    });

    karstSpringPOILayerRef.current.addTo(mapInstanceRef.current);
  }, [activeLayers]);

  // ═══════════════════════════════════════════════════════════
  // v4.5.0: 等值线图层(IDW插值)
  // ═══════════════════════════════════════════════════════════

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !activeLayers.has('contour')) {
      if (contourLayerRef.current) { contourLayerRef.current.remove(); contourLayerRef.current = null; }
      return;
    }

    const dataset = getContourDataset(activeContour);
    if (!dataset) return;

    const L: LNamespace = window.L;

    // 移除旧图层
    if (contourLayerRef.current) { contourLayerRef.current.remove(); contourLayerRef.current = null; }

    // IDW 插值
    const grid = idwInterpolate(
      dataset.points.map(p => ({ x: p.lng, y: p.lat, value: p.value })),
      undefined,
      { power: 2, resolution: 0.08, searchRadius: 1.5, minPoints: 2, maxPoints: 10 }
    );

    // 生成Canvas
    const colorStops = COLOR_SCHEMES[dataset.colorScheme] || COLOR_SCHEMES.waterLevel;
    const { canvas } = gridToCanvas(grid, [...colorStops]);
    const imageUrl = canvas.toDataURL();

    // 创建 imageOverlay
    const sw: [number, number] = [grid.bounds.minLat, grid.bounds.minLng];
    const ne: [number, number] = [grid.bounds.maxLat, grid.bounds.maxLng];
    const overlay = L.imageOverlay(imageUrl, [sw, ne], { opacity: contourOpacity, interactive: false });
    overlay.addTo(map);
    contourLayerRef.current = overlay;

    return () => {
      if (contourLayerRef.current) { contourLayerRef.current.remove(); contourLayerRef.current = null; }
    };
  }, [activeLayers, activeContour, contourOpacity]);

  // ═══════════════════════════════════════════════════════════
  // 交互方法
  // ═══════════════════════════════════════════════════════════

  /** 构建标注弹窗内容 */
  const buildPopupContent = (m: MapMarker): string => {
    const color = CATEGORY_COLORS[m.category] || '#3b82f6';
    let detailRows = '';
    if (m.detail) {
      detailRows = Object.entries(m.detail)
        .map(function(entry) { return '<tr><td style="color:#9ca3af;padding:2px 8px 2px 0;white-space:nowrap;">' + entry[0] + '</td><td style="color:#e5e7eb;">' + entry[1] + '</td></tr>'; })
        .join('');
    }
    return '<div style="background:#1f2937;color:#e5e7eb;font-family:system-ui;padding:8px;border-radius:8px;min-width:180px;">' +
      '<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">' +
      '<div style="width:8px;height:8px;border-radius:50%;background:' + color + ';"></div>' +
      '<span style="font-weight:600;font-size:13px;">' + m.name + '</span></div>' +
      '<div style="font-size:11px;color:#9ca3af;margin-bottom:2px;">' + m.type + ' | ' + m.description + '</div>' +
      (detailRows ? '<table style="margin-top:6px;font-size:11px;border-collapse:collapse;">' + detailRows + '</table>' : '') +
      '</div>';
  };

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
