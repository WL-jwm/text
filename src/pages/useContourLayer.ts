/**
 * 空间地图 - 等值线图层 hook
 * 封装 v4.5.0 IDW 插值等值线渲染逻辑。
 */
import { useEffect } from 'react';
import type { LMap, LNamespace, LImageOverlay } from '../types/leaflet';
import { getContourDataset } from '../data/contourData';
import { idwInterpolate, gridToCanvas, COLOR_SCHEMES } from '../utils/idwInterpolation';

/** 等值线图层 hook 参数 */
export interface ContourLayerParams {
  mapInstanceRef: { current: LMap | null };
  contourRef: { current: LImageOverlay | null };
  activeLayers: Set<string>;
  activeContour: string;
  contourOpacity: number;
}

/** 等值线渲染 hook */
export function useContourLayer(p: ContourLayerParams) {
  useEffect(() => {
    const map = p.mapInstanceRef.current;
    if (!map || !p.activeLayers.has('contour')) {
      if (p.contourRef.current) {
        p.contourRef.current.remove();
        p.contourRef.current = null;
      }
      return;
    }

    const dataset = getContourDataset(p.activeContour);
    if (!dataset) return;

    const L: LNamespace = window.L;

    // 移除旧图层
    if (p.contourRef.current) {
      p.contourRef.current.remove();
      p.contourRef.current = null;
    }

    // IDW 插值
    const grid = idwInterpolate(
      dataset.points.map(pt => ({ x: pt.lng, y: pt.lat, value: pt.value })),
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
    const overlay = L.imageOverlay(imageUrl, [sw, ne], { opacity: p.contourOpacity, interactive: false });
    overlay.addTo(map);
    p.contourRef.current = overlay;

    return () => {
      if (p.contourRef.current) {
        p.contourRef.current.remove();
        p.contourRef.current = null;
      }
    };
     
  }, [p.activeLayers, p.activeContour, p.contourOpacity, p.mapInstanceRef, p.contourRef]);
}
