/**
 * 空间地图 - 基础图层渲染 hook
 * 将 MapView 中除等值线外的 8 类图层渲染 useEffect 封装于此：
 * 标注、区划面、省界、县级数据覆盖、超采区、资源量分级、重要水源地POI、岩溶大泉POI。
 */
import { useEffect } from 'react';
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

/** 基础图层渲染 hook */
export function useMapLayers(p: MapLayersParams) {
  const { mapInstanceRef, layerRefs } = p;

  // ── 标注图层（markers图层） ──
  useEffect(() => {
    const L: LNamespace = window.L;
    if (!mapInstanceRef.current || !layerRefs.layerGroup.current) return;

    layerRefs.layerGroup.current.clearLayers();
    if (!p.activeLayers.has('markers')) { p.onMarkerCountChange(0); return; }

    const markers = getVisibleMarkers(p.visibleLayers);
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

      const marker = L.marker([m.lat, m.lng], { icon })
        .addTo(layerRefs.layerGroup.current)
        .bindPopup(buildMarkerPopup(m), { maxWidth: 280, className: 'gw-popup' });

      marker.on('click', () => p.onSelectMarker(m));
    });

    p.onMarkerCountChange(markers.length);
     
  }, [p.visibleLayers, p.activeLayers, mapInstanceRef, layerRefs.layerGroup]);

  // ── 区划面 ──
  useEffect(() => {
    const L: LNamespace = window.L;
    if (!mapInstanceRef.current || !layerRefs.zone.current) return;

    layerRefs.zone.current.clearLayers();
    if (!p.showZones || !p.activeLayers.has('markers')) return;

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

    if (p.activeLayers.has('markers') && p.showZones) {
      layerRefs.zone.current.addTo(mapInstanceRef.current);
    } else {
      layerRefs.zone.current.remove();
    }
     
  }, [p.showZones, p.activeLayers, mapInstanceRef, layerRefs.zone]);

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
    if (!p.showCountyCoverage || !p.activeLayers.has('markers')) {
      layerRefs.countyCoverage.current.remove();
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

      L.marker([center.lat, center.lng], { icon })
        .addTo(layerRefs.countyCoverage.current)
        .bindPopup(popupHtml, { maxWidth: 280, className: 'gw-popup' });
    });

    layerRefs.countyCoverage.current.addTo(mapInstanceRef.current);
     
  }, [p.showCountyCoverage, p.activeLayers, mapInstanceRef, layerRefs.countyCoverage]);

  // ── 超采区图层 ──
  useEffect(() => {
    const L: LNamespace = window.L;
    if (!mapInstanceRef.current || !layerRefs.overdraft.current) return;

    layerRefs.overdraft.current.clearLayers();
    if (!p.activeLayers.has('overdraft') || !p.showOverdraft) {
      layerRefs.overdraft.current.remove();
      return;
    }

    overdraftPolygons
      .filter(po => p.overdraftFilter.has(po.type))
      .forEach(po => {
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
     
  }, [p.activeLayers, p.showOverdraft, p.overdraftFilter, mapInstanceRef, layerRefs.overdraft]);

  // ── 资源量分级图层 ──
  useEffect(() => {
    const L: LNamespace = window.L;
    if (!mapInstanceRef.current || !layerRefs.resource.current || !layerRefs.cityBoundary.current) return;

    layerRefs.resource.current.clearLayers();
    layerRefs.cityBoundary.current.clearLayers();

    if (!p.activeLayers.has('resource')) {
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
    p.cityGrades.forEach(g => {
      const iconHtml = createGradeBubble(g.grade, g.city, g.groundResource);
      const size = 18 + (5 - g.grade) * 4;
      const icon = L.divIcon({
        html: iconHtml,
        className: '',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker(g.center, { icon });
      marker.on('click', () => { p.onCityDetail(g.city); });
      marker.addTo(layerRefs.resource.current);
    });

    layerRefs.resource.current.addTo(mapInstanceRef.current);
    layerRefs.cityBoundary.current.addTo(mapInstanceRef.current);
     
  }, [p.activeLayers, p.showCityBoundary, p.cityGrades, mapInstanceRef, layerRefs.resource, layerRefs.cityBoundary]);

  // ── 重要水源地POI图层 ──
  useEffect(() => {
    const L: LNamespace = window.L;
    if (!mapInstanceRef.current || !layerRefs.waterSourcePOI.current) return;

    layerRefs.waterSourcePOI.current.clearLayers();
    if (!p.activeLayers.has('waterSourcePOI')) {
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
     
  }, [p.activeLayers, mapInstanceRef, layerRefs.waterSourcePOI]);

  // ── 岩溶大泉POI图层 ──
  useEffect(() => {
    const L: LNamespace = window.L;
    if (!mapInstanceRef.current || !layerRefs.karstSpringPOI.current) return;

    layerRefs.karstSpringPOI.current.clearLayers();
    if (!p.activeLayers.has('karstSpringPOI')) {
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
     
  }, [p.activeLayers, mapInstanceRef, layerRefs.karstSpringPOI]);
}
