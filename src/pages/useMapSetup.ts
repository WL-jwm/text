/**
 * 空间地图 - 地图实例与图层引用管理 hook
 * 负责加载 Leaflet、初始化地图底图、创建各图层组，并返回地图实例、图层引用与加载状态。
 */
import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import type { LMap, LLayerGroup, LNamespace, LImageOverlay } from '../types/leaflet';
import { TIAN_DI_TOKEN } from './mapConstants';
import { cityCenters } from '../data/mapData';

/** 城市中心点类型（与 cityCenters 元素一致） */
export type CityCenter = typeof cityCenters[number];

/** 各图层组引用集合 */
export interface MapLayerRefs {
  layerGroup: RefObject<LLayerGroup | null>;
  zone: RefObject<LLayerGroup | null>;
  boundary: RefObject<LLayerGroup | null>;
  countyCoverage: RefObject<LLayerGroup | null>;
  overdraft: RefObject<LLayerGroup | null>;
  resource: RefObject<LLayerGroup | null>;
  cityBoundary: RefObject<LLayerGroup | null>;
  waterSourcePOI: RefObject<LLayerGroup | null>;
  karstSpringPOI: RefObject<LLayerGroup | null>;
  contour: RefObject<LImageOverlay | null>;
}

/**
 * 地图实例与图层引用 hook
 * @param mapRef 地图容器 div 的引用
 * @param activeCenter 当前激活中心（用于初始化视图）
 */
export function useMapSetup(
  mapRef: RefObject<HTMLDivElement | null>,
  activeCenter: CityCenter,
) {
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
  const contourLayerRef = useRef<LImageOverlay | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  /** 初始化地图 */
  const initMap = () => {
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
  };

  /** 加载 Leaflet */
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

  const layerRefs: MapLayerRefs = {
    layerGroup: layerGroupRef,
    zone: zoneLayerRef,
    boundary: boundaryLayerRef,
    countyCoverage: countyCoverageLayerRef,
    overdraft: overdraftLayerRef,
    resource: resourceLayerRef,
    cityBoundary: cityBoundaryLayerRef,
    waterSourcePOI: waterSourcePOILayerRef,
    karstSpringPOI: karstSpringPOILayerRef,
    contour: contourLayerRef,
  };

  return { mapInstanceRef, mapLoaded, layerRefs };
}
