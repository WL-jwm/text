/**
 * 拆分自 useMapLayers.ts — 地图渲染规格类型与纯函数
 * marker/县级覆盖/资源气泡的渲染规格预计算逻辑（纯函数，供测试与复用）。
 */

import type { CountyDataItem } from '../../types/county';
import { cityCenters, type MapMarker } from '../../data/mapData';
import { cityBulletin2024 } from '../../data/resources';
import { CATEGORY_COLORS, createCircleIcon, createPulseIcon } from '../mapConstants';
import { buildMarkerPopup, buildCityCoveragePopup } from '../mapPopupTemplates';

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
