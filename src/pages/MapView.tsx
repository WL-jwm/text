import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  MapPin, Layers, Eye, EyeOff, Search,
  Maximize2, Navigation,
  Droplets, Flame, Waves, GlassWater, HardHat, Database,
  AlertTriangle, BarChart3, X
} from 'lucide-react';
import { TechCard, DataSourceNote, ExportButton } from '../components/UI';
import { cityBulletin2024 } from '../data/resources';
import { exportExcel } from '../utils/exportUtils';
import { CrossLinkPanel } from '../components/CrossLink';
import {
  mapLayerConfigs, mapZones, springMarkers, geothermalMarkers,
  salineMarkers, waterSourceMarkers, mineMarkers,
  allMarkers, hebeiBoundary, cityCenters, getVisibleMarkers,
  type MapMarker, type MapLayerConfig as _MapLayerConfig } from '../data/mapData';
import {
  cityBounds, overdraftPolygons, overdraftLegend,
  getCityResourceGrades, getCityAggregatedInfo,
  gradeColors, gradeLabels,
  type CityResourceGrade as _CityResourceGrade } from '../data/mapDataEnhanced';
import { importantWaterSources } from '../data/waterSource';
import { karstSprings } from '../data/karstWater';
import { useToast } from '../components/Toast';
import type { CountyDataItem } from '../types/county';
import type { LMap, LLayerGroup, LNamespace } from '../types/leaflet';
import { useReportData } from '../hooks/useReportData';
import { ExportProgressDialog } from '../components/ExportProgressDialog';
import { contourDatasets, getContourDataset } from '../data/contourData';
import { idwInterpolate, gridToCanvas, COLOR_SCHEMES } from '../utils/idwInterpolation';
const TIAN_DI_TOKEN = '174705aebfe31b79b3587279e211cb9a';

// ═══════════════════════════════════════════════════════════
// v4.3.0: 可叠加图层系统（替代Tab单选模式）
// ═══════════════════════════════════════════════════════════

/** 图层定义 */
const LAYER_DEFS = [
  { key: 'markers', label: '标注分布', icon: MapPin, desc: '泉域/地热/咸水/水源/矿区', color: '#06b6d4' },
  { key: 'resource', label: '资源量分级', icon: Droplets, desc: '地下水资源量分级着色', color: '#3b82f6' },
  { key: 'overdraft', label: '超采区划', icon: AlertTriangle, desc: '浅层/深层超采区范围', color: '#ef4444' },
  { key: 'waterSourcePOI', label: '重要水源地', icon: GlassWater, desc: '城市集中供水水源地', color: '#22d3ee' },
  { key: 'karstSpringPOI', label: '岩溶大泉', icon: Waves, desc: '岩溶泉域分布与特征', color: '#10b981' },
  { key: 'contour', label: '等值线', icon: BarChart3, desc: '水位埋深/水质/地温梯度IDW插值', color: '#8b5cf6' },
] as const;

/** 图层icon映射 */
const LAYER_ICONS: Record<string, React.ElementType> = {
  Layers, Droplets, Flame, Waves, GlassWater, HardHat,
};

/** 标注颜色映射 */
const CATEGORY_COLORS: Record<string, string> = {
  spring: '#10b981',
  geothermal: '#ef4444',
  saline: '#f59e0b',
  waterSource: '#06b6d4',
  mine: '#8b5cf6',
};

/** 创建圆形标注图标HTML */
function createCircleIcon(color: string, size = 12): string {
  return '<div style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:' + color + ';border:2px solid rgba(255,255,255,0.9);box-shadow:0 0 6px ' + color + '80;cursor:pointer;"></div>';
}

/** 创建脉冲标注图标HTML */
function createPulseIcon(color: string): string {
  return '<div style="position:relative;">' +
    '<div style="width:14px;height:14px;border-radius:50%;background:' + color + ';border:2px solid rgba(255,255,255,0.9);box-shadow:0 0 8px ' + color + ';"></div>' +
    '<div style="position:absolute;top:-4px;left:-4px;width:22px;height:22px;border-radius:50%;background:' + color + '30;animation:pulse 2s infinite;"></div>' +
    '</div>' +
    '<style>@keyframes pulse{0%{transform:scale(1);opacity:0.7}100%{transform:scale(2);opacity:0}}</style>';
}

/** 创建菱形水源地标注图标 */
function createWaterSourceIcon(): string {
  return '<div style="width:16px;height:16px;background:#22d3ee;border:2px solid rgba(255,255,255,0.95);transform:rotate(45deg);box-shadow:0 0 6px #22d3ee80;cursor:pointer;"></div>';
}

/** 创建星形岩溶泉标注图标 */
function createKarstSpringIcon(): string {
  return '<div style="font-size:18px;line-height:1;filter:drop-shadow(0 0 4px #10b98180);cursor:pointer;">&#9733;</div>';
}

/** 创建资源量分级气泡 */
function createGradeBubble(grade: number, city: string, value: number): string {
  const color = gradeColors[grade] || '#3b82f6';
  const size = 18 + (5 - grade) * 4;
  return '<div style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:' + color + ';border:2px solid rgba(255,255,255,0.9);box-shadow:0 0 10px ' + color + '60;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,0.5);cursor:pointer;">' + value.toFixed(1) + '</div>';
}

/** 构建城市聚合数据弹窗HTML */
function _buildCityPopupHtml(info: ReturnType<typeof getCityAggregatedInfo>): string {
  if (!info) return '';
  const overdraftColor = function(t: string) {
    if (t === '严重超采区') return '#ef4444';
    if (t === '一般超采区') return '#f59e0b';
    return '#6b7280';
  };
  return '<div style="background:linear-gradient(135deg,#1e293b,#0f172a);color:#e5e7eb;font-family:system-ui;padding:12px;border-radius:10px;min-width:260px;border:1px solid rgba(255,255,255,0.08);">' +
    '<div style="font-size:15px;font-weight:700;margin-bottom:8px;color:#fff;display:flex;align-items:center;gap:6px;">' +
    '<div style="width:8px;height:8px;border-radius:50%;background:#06b6d4;"></div>' +
    info.city + '市 · 地下水概览</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px;">' +
    '<div style="padding:6px 8px;background:rgba(6,182,212,0.1);border:1px solid rgba(6,182,212,0.2);border-radius:6px;">' +
    '<div style="font-size:10px;color:#9ca3af;">地下水资源量</div>' +
    '<div style="font-size:13px;font-weight:700;color:#06b6d4;">' + info.groundResource.toFixed(2) + ' <span style="font-size:10px;font-weight:400;color:#9ca3af;">亿m³</span></div></div>' +
    '<div style="padding:6px 8px;background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.2);border-radius:6px;">' +
    '<div style="font-size:10px;color:#9ca3af;">地下水供水量</div>' +
    '<div style="font-size:13px;font-weight:700;color:#3b82f6;">' + info.gwSupply.toFixed(2) + ' <span style="font-size:10px;font-weight:400;color:#9ca3af;">亿m³</span></div></div>' +
    '<div style="padding:6px 8px;background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.2);border-radius:6px;">' +
    '<div style="font-size:10px;color:#9ca3af;">供水占比</div>' +
    '<div style="font-size:13px;font-weight:700;color:#8b5cf6;">' + info.gwRatio.toFixed(1) + '%</div></div>' +
    '<div style="padding:6px 8px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.2);border-radius:6px;">' +
    '<div style="font-size:10px;color:#9ca3af;">降水量</div>' +
    '<div style="font-size:13px;font-weight:700;color:#10b981;">' + (info.precipitation > 0 ? info.precipitation.toFixed(0) + ' mm' : '-') + '</div></div></div>' +
    '<div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:6px;">' +
    '<div style="font-size:11px;margin-bottom:4px;color:#9ca3af;">超采区类型</div>' +
    '<div style="display:flex;gap:6px;">' +
    '<span style="padding:2px 8px;border-radius:4px;font-size:10px;background:' + overdraftColor(info.shallowType) + '20;color:' + overdraftColor(info.shallowType) + ';font-weight:600;">浅层: ' + info.shallowType + '</span>' +
    '<span style="padding:2px 8px;border-radius:4px;font-size:10px;background:' + overdraftColor(info.deepType) + '20;color:' + overdraftColor(info.deepType) + ';font-weight:600;">深层: ' + info.deepType + '</span></div>' +
    (info.hasCone ? '<div style="font-size:10px;color:#9ca3af;margin-top:4px;">漏斗: ' + info.coneInfo + '</div>' : '') +
    '</div></div>';
}

/** 水源地名称到坐标的映射 */
const WATER_SOURCE_COORDS: Record<string, [number, number]> = {
  '石家庄水源地': [38.04, 114.51],
  '保定水源地': [38.87, 115.46],
  '唐山水源地': [39.63, 118.18],
  '邯郸水源地': [36.56, 114.47],
  '邢台水源地': [37.05, 114.50],
  '张家口水源地': [40.78, 114.88],
  '承德水源地': [40.95, 117.97],
  '沧州水源地': [38.30, 116.85],
};

/** 岩溶泉名称到坐标的映射 */
const KARST_SPRING_COORDS: Record<string, [number, number]> = {
  '黑龙洞泉群': [36.55, 114.20],
  '邢台百泉': [37.05, 114.50],
  '威州泉': [38.35, 114.05],
  '东风湖泉': [36.15, 114.05],
  '涞源泉': [39.38, 114.68],
  '水磨槽泉群': [38.55, 114.60],
  '十股泉': [37.30, 114.55],
  '白鹿泉': [38.15, 114.30],
  '南焦泉': [37.80, 114.25],
  '龙潭泉': [40.63, 115.50],
};

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
  const contourLayerRef = useRef<any>(null); // L.imageOverlay

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

      {/* ═══════ v4.3.0: 图层切换按钮（可叠加） ═══════ */}
      <div className="flex gap-2 flex-wrap">
        {LAYER_DEFS.map(layerDef => {
          const IconComp = layerDef.icon;
          const isActive = activeLayers.has(layerDef.key);
          return (
            <button
              key={layerDef.key}
              onClick={() => toggleLayer(layerDef.key)}
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
            <button onClick={() => setActiveLayers(new Set(['markers']))}
              className="ml-2 px-1.5 py-0.5 rounded bg-gw-surface/50 border border-gw-border/30 text-gw-muted hover:text-gw-text text-[10px]">
              重置
            </button>
          )}
        </div>
      </div>

      {/* 统计卡片 — 根据活跃图层动态显示 */}
      {activeLayers.has('markers') && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {categoryStats.map(s => (
            <div
              key={s.key}
              onClick={() => toggleMarkerCategory(s.key)}
              className={'px-3 py-2 rounded-lg border cursor-pointer transition-all ' +
                (visibleLayers.has(s.key) ? 'border-opacity-30 bg-opacity-10' : 'border-gw-border/30 bg-gw-surface/30 opacity-50')
              }
              style={visibleLayers.has(s.key) ? {
                borderColor: s.color + '50',
                backgroundColor: s.color + '15',
              } : {}}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gw-muted">{s.label}</span>
                <span className="text-sm font-bold" style={{ color: visibleLayers.has(s.key) ? s.color : '#6b7280' }}>{s.count}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeLayers.has('resource') && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {([5, 4, 3, 2, 1] as const).map(grade => {
            const cities = cityGrades.filter(g => g.grade === grade);
            return (
              <div key={grade} className="px-3 py-2 rounded-lg border cursor-default transition-all"
                style={{ borderColor: gradeColors[grade] + '50', backgroundColor: gradeColors[grade] + '15' }}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gw-muted">{gradeLabels[grade].split('(')[0]}</span>
                  <span className="text-sm font-bold" style={{ color: gradeColors[grade] }}>{cities.length}市</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeLayers.has('overdraft') && (
        <div className="grid grid-cols-3 gap-2">
          {overdraftLegend.map(item => (
            <div key={item.type}
              onClick={() => toggleOverdraftType(item.type)}
              className={'px-3 py-2 rounded-lg border cursor-pointer transition-all ' +
                (overdraftFilter.has(item.type) ? 'opacity-100' : 'opacity-40')
              }
              style={{ borderColor: item.color + '50', backgroundColor: item.fill }}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gw-muted">{item.label}</span>
                <span className="text-sm font-bold" style={{ color: item.color }}>
                  {overdraftPolygons.filter(p => p.type === item.type).length}个
                </span>
              </div>
            </div>
          ))}
          <div className="px-3 py-2 rounded-lg border border-gw-border/30 bg-gw-surface/30">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gw-muted">总面积</span>
              <span className="text-sm font-bold text-gw-text">69,693 km²</span>
            </div>
          </div>
        </div>
      )}

      {activeLayers.has('waterSourcePOI') && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="px-3 py-2 rounded-lg border" style={{ borderColor: '#22d3ee50', backgroundColor: '#22d3ee15' }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gw-muted">水源地数量</span>
              <span className="text-sm font-bold text-cyan-300">{importantWaterSources.length}个</span>
            </div>
          </div>
          <div className="px-3 py-2 rounded-lg border" style={{ borderColor: '#22d3ee50', backgroundColor: '#22d3ee15' }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gw-muted">已替代</span>
              <span className="text-sm font-bold text-amber-400">{importantWaterSources.filter(w => w.status.includes('替代')).length}个</span>
            </div>
          </div>
          <div className="px-3 py-2 rounded-lg border" style={{ borderColor: '#22d3ee50', backgroundColor: '#22d3ee15' }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gw-muted">正常开采</span>
              <span className="text-sm font-bold text-emerald-400">{importantWaterSources.filter(w => w.status.includes('正常')).length}个</span>
            </div>
          </div>
          <div className="px-3 py-2 rounded-lg border" style={{ borderColor: '#22d3ee50', backgroundColor: '#22d3ee15' }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gw-muted">总供水规模</span>
              <span className="text-sm font-bold text-cyan-300">{importantWaterSources.reduce((s, w) => s + parseFloat(w.supply), 0).toFixed(0)} 万m³/d</span>
            </div>
          </div>
        </div>
      )}

      {activeLayers.has('karstSpringPOI') && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="px-3 py-2 rounded-lg border" style={{ borderColor: '#10b98150', backgroundColor: '#10b98115' }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gw-muted">岩溶泉数量</span>
              <span className="text-sm font-bold text-emerald-400">{karstSprings.length}个</span>
            </div>
          </div>
          <div className="px-3 py-2 rounded-lg border" style={{ borderColor: '#10b98150', backgroundColor: '#10b98115' }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gw-muted">有流量数据</span>
              <span className="text-sm font-bold text-emerald-400">{karstSprings.filter(k => k.discharge !== '-').length}个</span>
            </div>
          </div>
          <div className="px-3 py-2 rounded-lg border" style={{ borderColor: '#10b98150', backgroundColor: '#10b98115' }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gw-muted">总泉域面积</span>
              <span className="text-sm font-bold text-emerald-400">{karstSprings.reduce((s, k) => s + parseFloat(k.area || '0'), 0).toLocaleString()} km²</span>
            </div>
          </div>
          <div className="px-3 py-2 rounded-lg border" style={{ borderColor: '#10b98150', backgroundColor: '#10b98115' }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gw-muted">全排型</span>
              <span className="text-sm font-bold text-emerald-400">{karstSprings.filter(k => k.type === '全排型').length}个</span>
            </div>
          </div>
        </div>
      )}

      {/* 等值线图层控制面板 */}
      {activeLayers.has('contour') && (
        <TechCard title="等值线图层控制" badge="IDW插值">
          <div className="space-y-3">
            <div>
              <div className="text-[10px] text-gw-muted mb-1">数据图层</div>
              <div className="flex flex-wrap gap-1.5">
                {contourDatasets.map(ds => (
                  <button
                    key={ds.key}
                    onClick={() => setActiveContour(ds.key)}
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
                onChange={e => setContourOpacity(parseFloat(e.target.value))}
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

          {/* 地图顶部操作条 */}
          {mapLoaded && (
            <div className="absolute top-3 left-3 z-[1000] flex items-center px-2 py-1 rounded-lg text-[10px] bg-gw-surface/80 border border-gw-border/40 text-gw-muted backdrop-blur-sm gap-2">
              <Navigation size={11} className="inline" />
              {activeLayerCount} 图层
              <div className="flex items-center gap-1 ml-2">
                {activeLayers.has('markers') && (
                  <>
                    <ExportButton onClick={handleExportMarkers} label="全部" />
                    <ExportButton onClick={handleExportVisible} label="已选" />
                  </>
                )}
                {activeLayers.has('overdraft') && (
                  <ExportButton onClick={handleExportOverdraft} label="超采区" />
                )}
                {activeLayers.has('resource') && (
                  <ExportButton onClick={handleExportResource} label="资源" />
                )}
                {activeLayers.has('waterSourcePOI') && (
                  <ExportButton onClick={handleExportWaterSourcePOI} label="水源地" />
                )}
                {activeLayers.has('karstSpringPOI') && (
                  <ExportButton onClick={handleExportKarstSpringPOI} label="岩溶泉" />
                )}
              </div>
            </div>
          )}

          {/* ═══════ v4.3.0: 自适应图例 — 根据活跃图层动态显示 ═══════ */}
          {mapLoaded && activeLayerCount > 0 && (
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

          {/* ═══════ v4.3.0: 点击城市详情面板（替代底部信息条） ═══════ */}
          {cityDetailPanel && (() => {
            const info = getCityAggregatedInfo(cityDetailPanel);
            const grade = cityGrades.find(g => g.city === cityDetailPanel);
            if (!info || !grade) return null;
            const shallowColor = info.shallowType === '一般超采区' ? '#f59e0b' : '#6b7280';
            const deepColor = info.deepType === '严重超采区' ? '#ef4444' : info.deepType === '一般超采区' ? '#3b82f6' : '#6b7280';
            return (
              <div className="absolute bottom-3 left-3 z-[1000] w-[300px] rounded-lg bg-gw-surface/95 border border-gw-border/40 backdrop-blur-sm shadow-lg">
                {/* 头部 */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-gw-border/30">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] text-white font-bold" style={{ background: gradeColors[grade.grade] }}>{grade.grade}</div>
                    <span className="text-sm font-bold text-gw-text">{cityDetailPanel}市</span>
                    <span className="text-[10px] text-gw-muted">地下水概览</span>
                  </div>
                  <button onClick={() => setCityDetailPanel(null)} className="text-gw-muted hover:text-gw-text">
                    <X size={12} />
                  </button>
                </div>
                {/* 核心指标 */}
                <div className="px-3 py-2 grid grid-cols-2 gap-1.5">
                  <div className="p-1.5 rounded bg-cyan-500/5 border border-cyan-500/10">
                    <p className="text-[9px] text-gw-muted">地下水资源量</p>
                    <p className="text-xs font-mono font-bold text-cyan-400">{info.groundResource.toFixed(2)} <span className="text-gw-muted font-normal text-[9px]">亿m³</span></p>
                  </div>
                  <div className="p-1.5 rounded bg-blue-500/5 border border-blue-500/10">
                    <p className="text-[9px] text-gw-muted">地下水供水</p>
                    <p className="text-xs font-mono font-bold text-blue-400">{info.gwSupply.toFixed(2)} <span className="text-gw-muted font-normal text-[9px]">亿m³</span></p>
                  </div>
                  <div className="p-1.5 rounded bg-purple-500/5 border border-purple-500/10">
                    <p className="text-[9px] text-gw-muted">供水占比</p>
                    <p className="text-xs font-mono font-bold text-purple-400">{info.gwRatio.toFixed(1)}%</p>
                  </div>
                  <div className="p-1.5 rounded bg-emerald-500/5 border border-emerald-500/10">
                    <p className="text-[9px] text-gw-muted">地表水资源量</p>
                    <p className="text-xs font-mono font-bold text-emerald-400">{info.surfaceResource.toFixed(2)} <span className="text-gw-muted font-normal text-[9px]">亿m³</span></p>
                  </div>
                  <div className="p-1.5 rounded bg-amber-500/5 border border-amber-500/10">
                    <p className="text-[9px] text-gw-muted">降水量</p>
                    <p className="text-xs font-mono font-bold text-amber-400">{info.precipitation > 0 ? info.precipitation.toFixed(0) + ' mm' : '-'}</p>
                  </div>
                  <div className="p-1.5 rounded bg-slate-500/5 border border-slate-500/10">
                    <p className="text-[9px] text-gw-muted">总供水量</p>
                    <p className="text-xs font-mono font-bold text-slate-300">{info.totalSupply.toFixed(2)} <span className="text-gw-muted font-normal text-[9px]">亿m³</span></p>
                  </div>
                </div>
                {/* 超采区 */}
                <div className="px-3 pb-2">
                  <p className="text-[9px] text-gw-muted mb-1">超采区类型</p>
                  <div className="flex gap-1.5">
                    <span className="px-1.5 py-0.5 rounded text-[10px]" style={{ backgroundColor: shallowColor + '20', color: shallowColor }}>浅层: {info.shallowType}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px]" style={{ backgroundColor: deepColor + '20', color: deepColor }}>深层: {info.deepType}</span>
                  </div>
                  {info.hasCone && (
                    <p className="text-[9px] text-gw-muted mt-1">漏斗: {info.coneInfo}</p>
                  )}
                </div>
              </div>
            );
          })()}
        </TechCard>

        {/* 侧边栏 */}
        {sidebarOpen && (
          <div className="space-y-3">
            {/* 搜索 */}
            <TechCard title="标注搜索">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gw-muted" />
                <input
                  type="text"
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  placeholder="搜索泉域、地热田、水源地..."
                  className="w-full pl-8 pr-3 py-2 rounded-lg text-xs bg-gw-bg border border-gw-border/40 text-gw-text placeholder-gw-muted focus:outline-none focus:border-gw-blue/50"
                />
              </div>
              {searchText.length > 0 && (
                <div className="mt-2 max-h-40 overflow-y-auto space-y-1 scrollbar-none">
                  {filteredMarkers.slice(0, 15).map(m => (
                    <button key={m.id} onClick={() => flyToMarker(m)}
                      className="w-full text-left px-2 py-1.5 rounded text-xs hover:bg-gw-surface/50 transition-colors flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS[m.category] }} />
                      <div className="truncate">
                        <span className="text-gw-text">{m.name}</span>
                        <span className="text-gw-muted ml-1">{m.type}</span>
                      </div>
                    </button>
                  ))}
                  {filteredMarkers.length === 0 && (
                    <div className="text-[10px] text-gw-muted text-center py-2">未找到匹配结果</div>
                  )}
                </div>
              )}
            </TechCard>

            {/* ═══════ v4.3.0: 统一图层控制面板 ═══════ */}
            <TechCard title="图层控制">
              <div className="space-y-1.5">
                {/* 标注子图层 */}
                {activeLayers.has('markers') && (
                  <>
                    {mapLayerConfigs.map(layer => {
                      const IconComp = LAYER_ICONS[layer.icon] || Layers;
                      const isVisible = visibleLayers.has(layer.categories[0]);
                      return (
                        <button key={layer.key} onClick={() => toggleMarkerCategory(layer.categories[0])}
                          className={'w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-all border ' +
                            (isVisible ? 'border-opacity-30 bg-opacity-10' : 'border-gw-border/30 text-gw-muted hover:text-gw-text')
                          }
                          style={isVisible ? {
                            borderColor: layer.color + '30',
                            backgroundColor: layer.color + '10',
                            color: '#e5e7eb',
                          } : {}}
                        >
                          <span className="flex items-center gap-2">
                            <IconComp size={13} style={isVisible ? { color: layer.color } : {}} />
                            {layer.label}
                          </span>
                          {isVisible ? <Eye size={13} style={{ color: layer.color }} /> : <EyeOff size={13} />}
                        </button>
                      );
                    })}
                    <div className="border-t border-gw-border/30 pt-1.5 mt-1.5 space-y-1.5">
                      <button onClick={() => setShowZones(!showZones)}
                        className={'w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-all border ' +
                          (showZones ? 'border-blue-500/30 bg-blue-500/10 text-gw-text' : 'border-gw-border/30 text-gw-muted hover:text-gw-text')
                        }>
                        <span className="flex items-center gap-2">
                          <Layers size={13} style={showZones ? { color: '#3b82f6' } : {}} />
                          系统区划面
                        </span>
                        {showZones ? <Eye size={13} className="text-blue-400" /> : <EyeOff size={13} />}
                      </button>
                      <button onClick={() => setShowCountyCoverage(!showCountyCoverage)}
                        className={'w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-all border ' +
                          (showCountyCoverage ? 'border-emerald-500/30 bg-emerald-500/10 text-gw-text' : 'border-gw-border/30 text-gw-muted hover:text-gw-text')
                        }>
                        <span className="flex items-center gap-2">
                          <Database size={13} style={showCountyCoverage ? { color: '#10b981' } : {}} />
                          县级数据覆盖
                        </span>
                        {showCountyCoverage ? <Eye size={13} className="text-emerald-400" /> : <EyeOff size={13} />}
                      </button>
                    </div>
                  </>
                )}

                {/* 资源量子图层 */}
                {activeLayers.has('resource') && (
                  <div className={activeLayers.has('markers') ? 'border-t border-gw-border/30 pt-1.5 mt-1.5' : ''}>
                    <button onClick={() => setShowCityBoundary(!showCityBoundary)}
                      className={'w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-all border ' +
                        (showCityBoundary ? 'border-cyan-500/30 bg-cyan-500/10 text-gw-text' : 'border-gw-border/30 text-gw-muted hover:text-gw-text')
                      }>
                      <span className="flex items-center gap-2">
                        <Droplets size={13} style={showCityBoundary ? { color: '#06b6d4' } : {}} />
                        市界分级着色
                      </span>
                      {showCityBoundary ? <Eye size={13} className="text-cyan-400" /> : <EyeOff size={13} />}
                    </button>
                  </div>
                )}

                {/* 超采区子图层 */}
                {activeLayers.has('overdraft') && (
                  <div className={(activeLayers.has('markers') || activeLayers.has('resource')) ? 'border-t border-gw-border/30 pt-1.5 mt-1.5' : ''}>
                    <button onClick={() => setShowOverdraft(!showOverdraft)}
                      className={'w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-all border mb-1.5 ' +
                        (showOverdraft ? 'border-red-500/30 bg-red-500/10 text-gw-text' : 'border-gw-border/30 text-gw-muted hover:text-gw-text')
                      }>
                      <span className="flex items-center gap-2">
                        <AlertTriangle size={13} style={showOverdraft ? { color: '#ef4444' } : {}} />
                        超采区范围
                      </span>
                      {showOverdraft ? <Eye size={13} className="text-red-400" /> : <EyeOff size={13} />}
                    </button>
                    {overdraftLegend.map(item => (
                      <button key={item.type} onClick={() => toggleOverdraftType(item.type)}
                        className={'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all border mb-1 ' +
                          (overdraftFilter.has(item.type) ? 'opacity-100' : 'opacity-40 border-gw-border/30')
                        }
                        style={overdraftFilter.has(item.type) ? { borderColor: item.color + '30', backgroundColor: item.fill } : {}}>
                        <span className="flex items-center gap-2 text-gw-text">
                          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: item.color }} />
                          {item.label}
                        </span>
                        {overdraftFilter.has(item.type) ? <Eye size={13} style={{ color: item.color }} /> : <EyeOff size={13} />}
                      </button>
                    ))}
                  </div>
                )}

                {/* 省界边界 — 始终可用 */}
                <div className={activeLayers.size > 0 ? 'border-t border-gw-border/30 pt-1.5 mt-1.5' : ''}>
                  <button onClick={() => setShowBoundary(!showBoundary)}
                    className={'w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-all border ' +
                      (showBoundary ? 'border-blue-500/30 bg-blue-500/10 text-gw-text' : 'border-gw-border/30 text-gw-muted hover:text-gw-text')
                    }>
                    <span className="flex items-center gap-2">
                      <MapPin size={13} style={showBoundary ? { color: '#3b82f6' } : {}} />
                      省界边界
                    </span>
                    {showBoundary ? <Eye size={13} className="text-blue-400" /> : <EyeOff size={13} />}
                  </button>
                </div>
              </div>
            </TechCard>

            {/* 城市定位 */}
            <TechCard title="城市定位">
              <div className="space-y-0.5 max-h-48 overflow-y-auto scrollbar-none">
                {cityCenters.filter(c => c.name !== '全省').map(c => {
                  const isSelected = cityDetailPanel === c.name;
                  return (
                    <button key={c.name} onClick={() => flyToCity(c.name)}
                      className={'w-full text-left px-2.5 py-1.5 rounded text-xs transition-all flex items-center gap-2 ' +
                        (isSelected ? 'bg-gw-blue/20 text-gw-highlight' : 'text-gw-muted hover:text-gw-text hover:bg-gw-surface/50')
                      }>
                      <MapPin size={12} />
                      {c.name}
                      {activeLayers.has('resource') && (() => {
                        const g = cityGrades.find(gr => gr.city === c.name);
                        if (!g) return null;
                        return (
                          <span className="ml-auto text-[10px] font-mono" style={{ color: gradeColors[g.grade] }}>
                            {g.groundResource.toFixed(1)}
                          </span>
                        );
                      })()}
                    </button>
                  );
                })}
              </div>
            </TechCard>

            {/* 快速定位 */}
            <TechCard title="快速定位">
              <div className="space-y-0.5 max-h-48 overflow-y-auto scrollbar-none">
                {cityCenters.map(c => (
                  <button key={c.name} onClick={() => setActiveCenter(c)}
                    className={'w-full text-left px-2.5 py-1.5 rounded text-xs transition-all flex items-center gap-2 ' +
                      (activeCenter.name === c.name ? 'bg-gw-blue/20 text-gw-highlight' : 'text-gw-muted hover:text-gw-text hover:bg-gw-surface/50')
                    }>
                    <MapPin size={12} />
                    {c.name}
                  </button>
                ))}
              </div>
            </TechCard>

            {/* 选中城市水文概况摘要 */}
            {activeCenter && (() => {
              const bulletin = cityBulletin2024.find(function(b) { return b.city === activeCenter.name + '市' || b.city === activeCenter.name; });
              if (!bulletin) return null;
              const bulletinCounties = bulletin.counties as CountyDataItem[] | undefined;
              const hasCounties = !!bulletinCounties && bulletinCounties.length > 0;
              const dataCounties = hasCounties ? bulletinCounties!.filter(function(c: CountyDataItem) { return c.precip != null; }).length : 0;
              return (
                <TechCard title={bulletin.city + ' 水文概况'} badge="2024年公报">
                  <div className="space-y-2 text-[10px]">
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="p-1.5 rounded bg-blue-500/5 border border-blue-500/10">
                        <p className="text-gw-muted">降水量</p>
                        <p className="font-mono text-blue-400 text-xs font-bold">{bulletin.precipTotal ?? '-'}</p>
                      </div>
                      <div className="p-1.5 rounded bg-emerald-500/5 border border-emerald-500/10">
                        <p className="text-gw-muted">水资源总量</p>
                        <p className="font-mono text-emerald-400 text-xs font-bold">{bulletin.totalWater?.toFixed(2) ?? '-'} <span className="text-gw-muted font-normal">亿m³</span></p>
                      </div>
                      <div className="p-1.5 rounded bg-cyan-500/5 border border-cyan-500/10">
                        <p className="text-gw-muted">总供水量</p>
                        <p className="font-mono text-cyan-400 text-xs font-bold">{bulletin.totalSupply?.toFixed(2) ?? '-'}</p>
                      </div>
                      <div className="p-1.5 rounded bg-purple-500/5 border border-purple-500/10">
                        <p className="text-gw-muted">地下水占比</p>
                        <p className="font-mono text-purple-400 text-xs font-bold">{bulletin.totalSupply > 0 ? (bulletin.groundSupply / bulletin.totalSupply * 100).toFixed(1) + '%' : '-'}</p>
                      </div>
                    </div>
                    {hasCounties && (
                      <div className="pt-1 border-t border-gw-border/20">
                        <div className="flex items-center justify-between">
                          <span className="text-gw-muted">县级数据覆盖</span>
                          <span className="text-gw-text">{dataCounties}/{bulletinCounties!.length}</span>
                        </div>
                        <div className="w-full h-1.5 mt-1 rounded-full bg-gw-bg/80 overflow-hidden">
                          <div className="h-full rounded-full" style={{
                            width: (bulletinCounties!.length > 0 ? Math.round(dataCounties / bulletinCounties!.length * 100) : 0) + '%',
                            backgroundColor: dataCounties === bulletinCounties!.length ? '#10b981' : dataCounties > 0 ? '#f59e0b' : '#6b7280'
                          }} />
                        </div>
                      </div>
                    )}
                  </div>
                </TechCard>
              );
            })()}

            {/* 选中标注详情 */}
            {selectedMarker && (
              <TechCard title="标注详情" badge={selectedMarker.type}>
                <div className="space-y-2">
                  <div>
                    <h3 className="text-sm font-medium text-gw-text">{selectedMarker.name}</h3>
                    <p className="text-[10px] text-gw-muted mt-0.5">{selectedMarker.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-gw-muted">
                    <span className="px-1.5 py-0.5 rounded" style={{
                      backgroundColor: (CATEGORY_COLORS[selectedMarker.category] || '#3b82f6') + '20',
                      color: CATEGORY_COLORS[selectedMarker.category] || '#3b82f6',
                    }}>
                      {selectedMarker.category}
                    </span>
                    <span>{selectedMarker.lat.toFixed(2)}°N, {selectedMarker.lng.toFixed(2)}°E</span>
                  </div>
                  {selectedMarker.detail && Object.keys(selectedMarker.detail).length > 0 && (
                    <div className="space-y-1 pt-1 border-t border-gw-border/30">
                      {Object.entries(selectedMarker.detail).map(function(entry) {
                        return (
                          <div key={entry[0]} className="flex justify-between text-[10px]">
                            <span className="text-gw-muted">{entry[0]}</span>
                            <span className="text-gw-text">{entry[1]}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </TechCard>
            )}
          </div>
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
