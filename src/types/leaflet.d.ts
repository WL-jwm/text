// ── 最小 Leaflet 类型声明（CDN 加载，无 npm 类型包） ──

/** Leaflet Map 实例 */
export interface LMap {
  setView(center: [number, number], zoom: number, options?: Record<string, unknown>): this;
  flyTo(center: [number, number], zoom: number, options?: Record<string, unknown>): this;
  remove(): void;
  addControl(control: unknown): this;
  on(type: string, fn: (...args: unknown[]) => void): this;
}

/** Leaflet LayerGroup 实例 */
export interface LLayerGroup {
  addTo(map: LMap): LLayerGroup;
  remove(): LLayerGroup;
  clearLayers(): void;
}

/** Leaflet 标注 */
export interface LMarker {
  addTo(group: LLayerGroup | null): LMarker;
  bindPopup(content: string, options?: Record<string, unknown>): LMarker;
  on(event: string, handler: (...args: unknown[]) => void): void;
  bindTooltip(content: string, options?: Record<string, unknown>): LMarker;
}

/** Leaflet 命名空间 */
export interface LNamespace {
  map(element: HTMLElement, options?: Record<string, unknown>): LMap;
  tileLayer(url: string, options?: Record<string, unknown>): LTileLayer;
  layerGroup(): LLayerGroup;
  rectangle(bounds: [[number, number], [number, number]], options?: Record<string, unknown>): LMarker;
  polygon(coords: [number, number][], options?: Record<string, unknown>): LMarker;
  divIcon(options: Record<string, unknown>): LMarker;
  marker(latlng: [number, number], options?: Record<string, unknown>): LMarker;
  control: { zoom(options?: Record<string, unknown>): { addTo(map: LMap): void } };
  imageOverlay(imageUrl: string, bounds: [[number, number], [number, number]], options?: Record<string, unknown>): LImageOverlay;
}

/** Leaflet ImageOverlay 实例 */
export interface LImageOverlay {
  addTo(map: LMap): LImageOverlay;
  remove(): LImageOverlay;
  setOpacity(opacity: number): LImageOverlay;
}

/** Leaflet TileLayer 实例 */
export interface LTileLayer {
  addTo(map: LMap): LTileLayer;
}

declare global {
  interface Window {
    L: LNamespace;
  }
}

export {};
