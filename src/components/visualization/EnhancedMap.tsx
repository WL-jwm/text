/**
 * EnhancedMap — V-01 交互式地图增强组件
 *
 * 基于现有 Leaflet CDN 加载方式，增加：
 *   - 图层控制器（多图层切换/透明度）
 *   - 数据点点击详情面板
 *   - 等值线图例
 *   - 城市资源评级着色
 *   - 全屏模式
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { Maximize2, Minimize2, Layers, Eye, EyeOff, MapPin } from 'lucide-react';
import { TechCard } from '../UI';
import { cityCenters, hebeiBoundary } from '../../data/mapData';
import { waterLevelContour, waterQualityContour, geothermalContour } from '../../data/contourData';
import { idwInterpolate, gridToCanvas, COLOR_SCHEMES } from '../../utils/idwInterpolation';
import type { ColorStop } from '../../utils/idwInterpolation';
import type { LMap, LNamespace, LLayerGroup } from '../../types/leaflet';

// ── 类型 ──

interface LayerConfig {
  key: string;
  label: string;
  visible: boolean;
  opacity: number;
}

interface MapPointDetail {
  city: string;
  lng: number;
  lat: number;
  waterLevel: number;
  waterQuality: number;
  geothermal: number;
}

// ── 默认图层配置 ──

const DEFAULT_LAYERS: LayerConfig[] = [
  { key: 'base', label: '基础地图', visible: true, opacity: 1 },
  { key: 'boundary', label: '省界', visible: true, opacity: 0.6 },
  { key: 'waterLevel', label: '水位等值线', visible: true, opacity: 0.7 },
  { key: 'waterQuality', label: '水质等值线', visible: false, opacity: 0.7 },
  { key: 'geothermal', label: '地温等值线', visible: false, opacity: 0.7 },
  { key: 'markers', label: '城市标注', visible: true, opacity: 1 },
];

const COLOR_SCHEME_MAP: Record<string, keyof typeof COLOR_SCHEMES> = {
  waterLevel: 'waterLevel',
  waterQuality: 'waterQuality',
  geothermal: 'geothermal',
};

/** 获取城市详情（水位/水质/地温） */
function getCityDetail(city: string): { waterLevel: number; waterQuality: number; geothermal: number } {
  const wl = waterLevelContour.points.find(p => p.city === city);
  const wq = waterQualityContour.points.find(p => p.city === city);
  const gt = geothermalContour.points.find(p => p.city === city);
  return {
    waterLevel: wl?.value ?? 0,
    waterQuality: wq?.value ?? 0,
    geothermal: gt?.value ?? 0,
  };
}

/** 将 ColorStop 数组转为 CSS 颜色字符串 */
function colorToCss(c: ColorStop): string {
  return `rgb(${c.color[0]}, ${c.color[1]}, ${c.color[2]})`;
}

export function EnhancedMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LMap | null>(null);
  const LRef = useRef<LNamespace | null>(null);
  const layerGroupRef = useRef<LLayerGroup | null>(null);
  const contourLayerRef = useRef<{ remove: () => void } | null>(null);
  const boundaryLayerRef = useRef<LLayerGroup | null>(null);
  const markerLayerRef = useRef<LLayerGroup | null>(null);

  const [layers, setLayers] = useState<LayerConfig[]>(DEFAULT_LAYERS);
  const [fullscreen, setFullscreen] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<MapPointDetail | null>(null);
  const [showLayerPanel, setShowLayerPanel] = useState(true);

  // 加载 Leaflet
  useEffect(() => {
    const loadLeaflet = async () => {
      const w = window as unknown as Record<string, unknown>;
      if (w.L) {
        LRef.current = w.L as LNamespace;
        initMap();
        return;
      }
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        const w2 = window as unknown as Record<string, unknown>;
        LRef.current = w2.L as LNamespace;
        initMap();
      };
      document.head.appendChild(script);
    };
    loadLeaflet();
     
  }, []);

  const initMap = useCallback(() => {
    const L = LRef.current;
    if (!L || !mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [38.5, 115.5],
      zoom: 7,
      minZoom: 6,
      maxZoom: 14,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    // 河北省界
    const boundaryGroup = L.layerGroup().addTo(map);
    if (hebeiBoundary) {
      const polygon = (L as unknown as Record<string, unknown>).polygon as unknown as
        (latlngs: unknown, options: Record<string, unknown>) => { addTo: (g: LLayerGroup) => void };
      polygon(hebeiBoundary, {
        color: '#06b6d4', weight: 2, fillOpacity: 0.05, dashArray: '5 5',
      }).addTo(boundaryGroup);
    }
    boundaryLayerRef.current = boundaryGroup;

    // 标注图层
    const markerGroup = L.layerGroup().addTo(map);
    markerLayerRef.current = markerGroup;

    // 城市标注
    interface MarkerInstance {
      addTo: (g: LLayerGroup) => MarkerInstance;
      bindPopup: (s: string) => MarkerInstance;
      on: (e: string, fn: () => void) => MarkerInstance;
    }
    const marker = (L as unknown as Record<string, unknown>).marker as unknown as
      (latlng: [number, number]) => MarkerInstance;

    for (const [city, coord] of Object.entries(cityCenters)) {
      const lat = coord[0];
      const lng = coord[1];
      const detail = getCityDetail(city);
      const m = marker([lat, lng]).addTo(markerGroup);
      m.bindPopup(`<div style="font-size:12px;">
        <strong>${city}</strong><br/>
        水位埋深: ${detail.waterLevel}m<br/>
        水质等级: ${detail.waterQuality}<br/>
        地温梯度: ${detail.geothermal}°C/100m
      </div>`);
      m.on('click', () => setSelectedPoint({ city, lng, lat, ...detail }));
    }

    // 等值线图层组
    const contourGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = contourGroup;

    mapRef.current = map;

    // 初始渲染等值线
    renderContours();
     
  }, []);

  const renderContours = useCallback(() => {
    const L = LRef.current;
    if (!L || !mapRef.current || !layerGroupRef.current) return;

    // 清除旧等值线
    if (contourLayerRef.current) {
      contourLayerRef.current.remove();
      contourLayerRef.current = null;
    }
    layerGroupRef.current.clearLayers();

    // 渲染可见的等值线图层
    const visibleContourLayers = layers.filter(l =>
      l.visible && ['waterLevel', 'waterQuality', 'geothermal'].includes(l.key)
    );

    for (const layer of visibleContourLayers) {
      const dataset = layer.key === 'waterLevel' ? waterLevelContour :
        layer.key === 'waterQuality' ? waterQualityContour : geothermalContour;

      const schemeKey = COLOR_SCHEME_MAP[layer.key];
      const points = dataset.points.map(p => ({ x: p.lng, y: p.lat, value: p.value }));

      if (points.length < 3) continue;

      const grid = idwInterpolate(points, undefined, {
        resolution: 0.1,
        power: 2,
        minPoints: 3,
        maxPoints: 8,
      });

      const colorStops: ColorStop[] = [...COLOR_SCHEMES[schemeKey]];
      const canvasResult = gridToCanvas(grid, colorStops);

      if (canvasResult) {
        const imageOverlay = (L as unknown as Record<string, unknown>).imageOverlay as unknown as
          (url: string, bounds: [[number, number], [number, number]], options: Record<string, unknown>) =>
            { addTo: (g: LLayerGroup) => void; setOpacity: (o: number) => void };
        const overlay = imageOverlay(
          canvasResult.canvas.toDataURL(),
          [[grid.bounds.minLat, grid.bounds.minLng], [grid.bounds.maxLat, grid.bounds.maxLng]],
          { opacity: layer.opacity }
        );
        overlay.addTo(layerGroupRef.current);
        contourLayerRef.current = { remove: () => overlay.setOpacity(0) };
      }
    }
  }, [layers]);

  // 图层变化时重新渲染
  useEffect(() => {
    if (mapRef.current) renderContours();
  }, [layers, renderContours]);

  // 全屏切换
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current?.setView([38.5, 115.5], fullscreen ? 8 : 7);
      }, 100);
    }
  }, [fullscreen]);

  const toggleLayer = (key: string) => {
    setLayers(prev => prev.map(l => l.key === key ? { ...l, visible: !l.visible } : l));
  };

  const setLayerOpacity = (key: string, opacity: number) => {
    setLayers(prev => prev.map(l => l.key === key ? { ...l, opacity } : l));
  };

  return (
    <div className={`relative ${fullscreen ? 'fixed inset-0 z-50 bg-gw-bg' : ''}`}>
      <TechCard className={fullscreen ? 'h-full' : ''}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gw-text flex items-center gap-2">
            <MapPin size={16} className="text-cyan-400" />
            交互式地下水地图
          </h3>
          <button
            onClick={() => setFullscreen(!fullscreen)}
            className="p-1.5 rounded bg-gw-surface/60 text-gw-muted hover:text-gw-text border border-gw-border/30 transition-all"
          >
            {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>

        <div className={`relative ${fullscreen ? 'h-[calc(100%-40px)]' : 'h-[500px]'} rounded-lg overflow-hidden border border-gw-border/20`}>
          <div ref={mapContainerRef} className="w-full h-full" style={{ background: '#1a2332' }} />

          {/* 图层控制面板 */}
          {showLayerPanel && (
            <div className="absolute top-3 right-3 bg-gw-card/95 backdrop-blur border border-gw-border/30 rounded-lg p-3 shadow-lg z-[1000] min-w-[180px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-medium text-gw-text flex items-center gap-1">
                  <Layers size={10} />
                  图层控制
                </span>
                <button onClick={() => setShowLayerPanel(false)} className="text-gw-muted/50 hover:text-gw-text">
                  <EyeOff size={10} />
                </button>
              </div>
              <div className="space-y-1.5">
                {layers.map(l => (
                  <div key={l.key} className="flex items-center gap-2">
                    <button
                      onClick={() => toggleLayer(l.key)}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        l.visible ? 'bg-gw-blue/20 border-gw-blue/40' : 'border-gw-border/30'
                      }`}
                    >
                      {l.visible && <Eye size={8} className="text-gw-highlight" />}
                    </button>
                    <span className="text-[10px] text-gw-muted flex-1">{l.label}</span>
                    {l.visible && l.key !== 'base' && l.key !== 'markers' && (
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.1"
                        value={l.opacity}
                        onChange={e => setLayerOpacity(l.key, parseFloat(e.target.value))}
                        className="w-12 h-1"
                      />
                    )}
                  </div>
                ))}
              </div>
              {/* 图例 */}
              <div className="mt-2 pt-2 border-t border-gw-border/20">
                <div className="text-[9px] text-gw-muted mb-1">水位图例 (m)</div>
                <div className="flex h-3 rounded overflow-hidden">
                  {COLOR_SCHEMES.waterLevel.map((c, i) => (
                    <div key={i} className="flex-1" style={{ background: colorToCss(c) }} title={`${Math.round((i / (COLOR_SCHEMES.waterLevel.length - 1)) * 80)}m`} />
                  ))}
                </div>
                <div className="flex justify-between text-[8px] text-gw-muted/50 mt-0.5">
                  <span>0m</span><span>40m</span><span>80m</span>
                </div>
              </div>
            </div>
          )}

          {!showLayerPanel && (
            <button
              onClick={() => setShowLayerPanel(true)}
              className="absolute top-3 right-3 p-2 rounded bg-gw-card/95 border border-gw-border/30 z-[1000]"
            >
              <Layers size={14} className="text-gw-muted" />
            </button>
          )}

          {/* 点击详情面板 */}
          {selectedPoint && (
            <div className="absolute bottom-3 left-3 bg-gw-card/95 backdrop-blur border border-gw-border/30 rounded-lg p-3 shadow-lg z-[1000] min-w-[200px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gw-text">{selectedPoint.city}</span>
                <button onClick={() => setSelectedPoint(null)} className="text-gw-muted/50 hover:text-gw-text">
                  <EyeOff size={10} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div className="text-center">
                  <div className="text-gw-muted">水位埋深</div>
                  <div className="text-gw-text font-mono">{selectedPoint.waterLevel}m</div>
                </div>
                <div className="text-center">
                  <div className="text-gw-muted">水质等级</div>
                  <div className="text-gw-text font-mono">{selectedPoint.waterQuality}</div>
                </div>
                <div className="text-center">
                  <div className="text-gw-muted">地温梯度</div>
                  <div className="text-gw-text font-mono">{selectedPoint.geothermal}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </TechCard>
    </div>
  );
}
