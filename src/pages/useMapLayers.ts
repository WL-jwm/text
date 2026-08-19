/**
 * 空间地图 - 基础图层渲染 hook
 * 将 MapView 中除等值线外的 8 类图层渲染 useEffect 封装于此。
 *
 * 性能优化策略：
 * 1. 依赖拆细 —— 各 effect 依赖由「整个 activeLayers Set」改为「关心的布尔派生值」，
 *    切换无关图层时不再触发该图层整层重建（避免连锁重建）。
 * 2. 数据 useMemo 缓存 —— getVisibleMarkers / overdraftPolygons.filter / 县级覆盖计算
 *    等结果仅在其真实输入变化时重算。
 * 3. popup HTML 与图标预计算 —— marker 的 divIcon/popup 在数据不变时复用缓存，
 *    避免图层反复开关时重复拼接 HTML 与创建 DOM。
 */
import { useEffect, useMemo } from 'react';
import type { LMap, LNamespace } from '../types/leaflet';
import type { CountyDataItem } from '../types/county';
import {
  mapZones, hebeiBoundary, cityCenters,
  getVisibleMarkers, type MapMarker,
} from '../data/mapData';
import {
  cityBounds, overdraftPolygons,
  gradeColors, type CityResourceGrade,
} from '../data/mapDataEnhanced';
import { cityBulletin2024 } from '../data/resources';
import { importantWaterSources } from '../data/waterSource';
import { karstSprings } from '../data/karstWater';
import { CATEGORY_COLORS, createCircleIcon, createPulseIcon, createGradeBubble, createWaterSourceIcon, createKarstSpringIcon, WATER_SOURCE_COORDS, KARST_SPRING_COORDS } from './mapConstants';
import {
  buildMarkerPopup, buildZoneTooltip, buildOverdraftTooltip,
  buildResourceTooltip, buildWaterSourcePopup, buildKarstPopup,
  buildCityCoveragePopup,
} from './mapPopupTemplates';
import type { MapLayerRefs } from './useMapSetup';

/** 图层渲染 hook 参数 */
export interface MapLayersParams {
  mapInstanceRef: { current: LMap | null };
  layerRefs: MapLayerRefs;
  activeLayers: Set<string>;
  visibleLayers: Set<string>;
  showZones: boolean;
  showBoundary: boolean;
  showCountyCoverage: boolean;
  showOverdraft: boolean;
  overdraftFilter: Set<string>;
  showCityBoundary: boolean;
  cityGrades: CityResourceGrade[];
  onMarkerCountChange: (count: number) => void;
  onSelectMarker: (m: MapMarker | null) => void;
  onCityDetail: (city: string) => void;
}

/** 标注渲染规格（预计算产物） */
export interface MarkerSpec {
  m: MapMarker;
  color: string;
  isSpring: boolean;
  iconHtml: string;
  popupHtml: string;
}

/** 县级覆盖渲染规格 */
export interface CountyCoverageSpec {
  lat: number;
  lng: number;
  iconHtml: string;
  popupHtml: string;
}

/** 资源量气泡渲染规格 */
export interface ResourceSpec {
  center: [number, number];
  size: number;
  iconHtml: string;
  city: string;
}

/**
 * 构建标注渲染规格（纯函数，供测试）
 * 将 marker 的图标与 popup HTML 预计算，避免每次重建时重复拼接。
 */
export function buildMarkerSpecs(markers: MapMarker[]): MarkerSpec[] {
  return markers.map(m => {
    const color = CATEGORY_COLORS[m.category] || '#3b82f6';
    const isSpring = m.category === 'spring';
    return {
      m,
      color,
      isSpring,
      iconHtml: isSpring ? createPulseIcon(color) : createCircleIcon(color),
      popupHtml: buildMarkerPopup(m),
    };
  });
}

/**
 * 构建县级数据覆盖渲染规格（纯函数，供测试）
 * 静态数据：mount 时计算一次并缓存，图层开关/切图时不重复计算。
 */
export function buildCountyCoverageSpecs(): CountyCoverageSpec[] {
  return cityBulletin2024.reduce<CountyCoverageSpec[]>((acc, city) => {
    const cityName = city.city.replace('市', '');
    const center = cityCenters.find(c => c.name === cityName);
    if (!center) return acc;

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

    const popupHtml = buildCityCoveragePopup({
      city: city.city,
      color,
      label,
      countyCount,
      hasCounties: !!hasCounties,
      hasData: !!hasData,
      dataCount,
      precipitation: city.precipitation,
    });

    acc.push({ lat: center.lat, lng: center.lng, iconHtml, popupHtml });
    return acc;
  }, []);
}

/** 基础图层渲染 hook */
export function useMapLayers(p: MapLayersParams) {
  const { mapInstanceRef, layerRefs } = p;

  // ── 派生图层可见性（避免整个 activeLayers Set 触发连锁重建）──
  const markersVisible = p.activeLayers.has('markers');
  const overdraftVisible = p.activeLayers.has('overdraft');
  const resourceVisible = p.activeLayers.has('resource');
  const wsVisible = p.activeLayers.has('waterSourcePOI');
  const ksVisible = p.activeLayers.has('karstSpringPOI');

  // ── 数据与渲染规格缓存 ──
  const visibleMarkers = useMemo(() => getVisibleMarkers(p.visibleLayers), [p.visibleLayers]);
  const markerSpecs = useMemo(() => buildMarkerSpecs(visibleMarkers), [visibleMarkers]);

  const filteredOverdraft = useMemo(
    () => overdraftPolygons.filter(po => p.overdraftFilter.has(po.type)),
    [p.overdraftFilter]
  );

  const countySpecs = useMemo(() => buildCountyCoverageSpecs(), []);

  const resourceSpecs = useMemo<ResourceSpec[]>(() => {
    return p.cityGrades.map(g => {
      const iconHtml = createGradeBubble(g.grade, g.city, g.groundResource);
      const size = 18 + (5 - g.grade) * 4;
      return { center: g.center, size, iconHtml, city: g.city };
    });
  }, [p.cityGrades]);

  // ── 标注图层（markers图层） ──
  useEffect(() => {
    const L: LNamespace = window.L;
    if (!mapInstanceRef.current || !layerRefs.layerGroup.current) return;

    layerRefs.layerGroup.current.clearLayers();
    if (!markersVisible) { p.onMarkerCountChange(0); return; }

    markerSpecs.forEach(spec => {
      const icon = L.divIcon({
        html: spec.iconHtml,
        className: '',
        iconSize: [spec.isSpring ? 22 : 12, spec.isSpring ? 22 : 12],
        iconAnchor: [spec.isSpring ? 11 : 6, spec.isSpring ? 11 : 6],
      });

      const marker = L.marker([spec.m.lat, spec.m.lng], { icon })
        .addTo(layerRefs.layerGroup.current)
        .bindPopup(spec.popupHtml, { maxWidth: 280, className: 'gw-popup' });

      marker.on('click', () => p.onSelectMarker(spec.m));
    });

    p.onMarkerCountChange(markerSpecs.length);
  }, [markersVisible, markerSpecs, mapInstanceRef, layerRefs.layerGroup, p.onMarkerCountChange, p.onSelectMarker]);

  // ── 区划面 ──
  useEffect(() => {
    const L: LNamespace = window.L;
    if (!mapInstanceRef.current || !layerRefs.zone.current) return;

    layerRefs.zone.current.clearLayers();
    if (!p.showZones || !markersVisible) return;

    mapZones.forEach(zone => {
      const rect = L.rectangle(zone.bounds, {
        color: zone.color,
        weight: 1.5,
        fillColor: zone.fillColor,
        fillOpacity: 0.5,
        dashArray: '4 3',
      });
      rect.bindTooltip(buildZoneTooltip(zone), { sticky: true, className: 'gw-tooltip' });
      rect.addTo(layerRefs.zone.current);
    });

    if (markersVisible && p.showZones) {
      layerRefs.zone.current.addTo(mapInstanceRef.current);
    } else {
      layerRefs.zone.current.remove();
    }
  }, [p.showZones, markersVisible, mapInstanceRef, layerRefs.zone]);

  // ── 省界 ──
  useEffect(() => {
    const L: LNamespace = window.L;
    if (!mapInstanceRef.current || !layerRefs.boundary.current) return;

    layerRefs.boundary.current.clearLayers();
    if (!p.showBoundary) return;

    const polygon = L.polygon(hebeiBoundary, {
      color: '#3b82f6',
      weight: 2.5,
      fillColor: 'transparent',
      fillOpacity: 0,
      dashArray: '',
    });
    polygon.addTo(layerRefs.boundary.current);
  }, [p.showBoundary, mapInstanceRef, layerRefs.boundary]);

  // ── 县级数据覆盖标注 ──
  useEffect(() => {
    const L: LNamespace = window.L;
    if (!mapInstanceRef.current || !layerRefs.countyCoverage.current) return;

    layerRefs.countyCoverage.current.clearLayers();
    if (!p.showCountyCoverage || !markersVisible) {
      layerRefs.countyCoverage.current.remove();
      return;
    }

    countySpecs.forEach(spec => {
      const icon = L.divIcon({
        html: spec.iconHtml,
        className: '',
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      L.marker([spec.lat, spec.lng], { icon })
        .addTo(layerRefs.countyCoverage.current)
        .bindPopup(spec.popupHtml, { maxWidth: 280, className: 'gw-popup' });
    });

    layerRefs.countyCoverage.current.addTo(mapInstanceRef.current);
  }, [p.showCountyCoverage, markersVisible, countySpecs, mapInstanceRef, layerRefs.countyCoverage]);

  // ── 超采区图层 ──
  useEffect(() => {
    const L: LNamespace = window.L;
    if (!mapInstanceRef.current || !layerRefs.overdraft.current) return;

    layerRefs.overdraft.current.clearLayers();
    if (!overdraftVisible || !p.showOverdraft) {
      layerRefs.overdraft.current.remove();
      return;
    }

    filteredOverdraft.forEach(po => {
      const rect = L.rectangle(po.bounds, {
        color: po.color,
        weight: 1.5,
        fillColor: po.fillColor,
        fillOpacity: 0.6,
        dashArray: po.type === 'deep-severe' ? '' : '6 3',
      });
      rect.bindTooltip(buildOverdraftTooltip(po), { sticky: true, className: 'gw-tooltip' });
      rect.addTo(layerRefs.overdraft.current);
    });

    layerRefs.overdraft.current.addTo(mapInstanceRef.current);
  }, [overdraftVisible, p.showOverdraft, filteredOverdraft, mapInstanceRef, layerRefs.overdraft]);

  // ── 资源量分级图层 ──
  useEffect(() => {
    const L: LNamespace = window.L;
    if (!mapInstanceRef.current || !layerRefs.resource.current || !layerRefs.cityBoundary.current) return;

    layerRefs.resource.current.clearLayers();
    layerRefs.cityBoundary.current.clearLayers();

    if (!resourceVisible) {
      layerRefs.resource.current.remove();
      layerRefs.cityBoundary.current.remove();
      return;
    }

    // 城市边界着色
    if (p.showCityBoundary) {
      cityBounds.forEach(cb => {
        const grade = p.cityGrades.find(g => g.city === cb.city);
        const color = grade ? gradeColors[grade.grade] : '#6b7280';
        const polygon = L.rectangle(cb.bounds, {
          color: color,
          weight: 1.5,
          fillColor: color,
          fillOpacity: 0.15,
          dashArray: '',
        });
        polygon.bindTooltip(buildResourceTooltip(cb, grade), { sticky: true, className: 'gw-tooltip' });
        polygon.addTo(layerRefs.cityBoundary.current);
      });
    }

    // 资源量气泡标注 — 点击弹出详情面板
    resourceSpecs.forEach(spec => {
      const icon = L.divIcon({
        html: spec.iconHtml,
        className: '',
        iconSize: [spec.size, spec.size],
        iconAnchor: [spec.size / 2, spec.size / 2],
      });

      const marker = L.marker(spec.center, { icon });
      marker.on('click', () => { p.onCityDetail(spec.city); });
      marker.addTo(layerRefs.resource.current);
    });

    layerRefs.resource.current.addTo(mapInstanceRef.current);
    layerRefs.cityBoundary.current.addTo(mapInstanceRef.current);
  }, [resourceVisible, p.showCityBoundary, p.cityGrades, resourceSpecs, mapInstanceRef, layerRefs.resource, layerRefs.cityBoundary, p.onCityDetail]);

  // ── 重要水源地POI图层 ──
  useEffect(() => {
    const L: LNamespace = window.L;
    if (!mapInstanceRef.current || !layerRefs.waterSourcePOI.current) return;

    layerRefs.waterSourcePOI.current.clearLayers();
    if (!wsVisible) {
      layerRefs.waterSourcePOI.current.remove();
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

      L.marker(coords, { icon })
        .addTo(layerRefs.waterSourcePOI.current)
        .bindPopup(buildWaterSourcePopup(ws), { maxWidth: 280, className: 'gw-popup' });
    });

    layerRefs.waterSourcePOI.current.addTo(mapInstanceRef.current);
  }, [wsVisible, mapInstanceRef, layerRefs.waterSourcePOI]);

  // ── 岩溶大泉POI图层 ──
  useEffect(() => {
    const L: LNamespace = window.L;
    if (!mapInstanceRef.current || !layerRefs.karstSpringPOI.current) return;

    layerRefs.karstSpringPOI.current.clearLayers();
    if (!ksVisible) {
      layerRefs.karstSpringPOI.current.remove();
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

      L.marker(coords, { icon })
        .addTo(layerRefs.karstSpringPOI.current)
        .bindPopup(buildKarstPopup(ks), { maxWidth: 280, className: 'gw-popup' });
    });

    layerRefs.karstSpringPOI.current.addTo(mapInstanceRef.current);
  }, [ksVisible, mapInstanceRef, layerRefs.karstSpringPOI]);
}
