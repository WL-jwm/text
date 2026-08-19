// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  useMapLayers, buildMarkerSpecs, buildCountyCoverageSpecs,
  type MapLayersParams,
} from '../pages/useMapLayers';
import type { MapLayerRefs } from '../pages/useMapSetup';
import type { LMap } from '../types/leaflet';
import type { MapMarker } from '../data/mapData';

/** 可链式调用的 Leaflet 图层 mock */
function makeLayerChain() {
  return {
    clearLayers: vi.fn(),
    addTo: vi.fn(function (this: unknown) { return this; }),
    remove: vi.fn(function (this: unknown) { return this; }),
    bindPopup: vi.fn(function (this: unknown) { return this; }),
    bindTooltip: vi.fn(function (this: unknown) { return this; }),
    on: vi.fn(function (this: unknown) { return this; }),
  };
}
type LayerChain = ReturnType<typeof makeLayerChain>;

function setupLeafletMock() {
  const L = {
    divIcon: vi.fn(() => ({})),
    marker: vi.fn(() => makeLayerChain()),
    rectangle: vi.fn(() => makeLayerChain()),
    polygon: vi.fn(() => makeLayerChain()),
  };
  (globalThis as { L?: unknown }).L = L;
  return L;
}

/** 构造 refs，并单独返回标注图层组 mock 以便断言 */
function makeRefs(): { refs: MapLayerRefs; group: LayerChain } {
  const group = makeLayerChain();
  const refs = {
    layerGroup: { current: group },
    zone: { current: makeLayerChain() },
    boundary: { current: makeLayerChain() },
    countyCoverage: { current: makeLayerChain() },
    overdraft: { current: makeLayerChain() },
    resource: { current: makeLayerChain() },
    cityBoundary: { current: makeLayerChain() },
    waterSourcePOI: { current: makeLayerChain() },
    karstSpringPOI: { current: makeLayerChain() },
    contour: { current: null },
  } as unknown as MapLayerRefs;
  return { refs, group };
}

function makeParams(overrides: Partial<MapLayersParams> = {}): MapLayersParams {
  const { refs } = makeRefs();
  return {
    mapInstanceRef: { current: {} as unknown as LMap },
    layerRefs: refs,
    activeLayers: new Set(['markers']),
    visibleLayers: new Set(['spring']),
    showZones: true,
    showBoundary: true,
    showCountyCoverage: false,
    showOverdraft: true,
    overdraftFilter: new Set(['shallow-general', 'deep-general', 'deep-severe']),
    showCityBoundary: true,
    cityGrades: [],
    onMarkerCountChange: vi.fn(),
    onSelectMarker: vi.fn(),
    onCityDetail: vi.fn(),
    ...overrides,
  };
}

describe('buildMarkerSpecs 纯函数', () => {
  it('为每个标注生成含 color/isSpring/iconHtml/popupHtml 的规格', () => {
    const markers: MapMarker[] = [
      { id: '1', name: '泉1', category: 'spring', lat: 1, lng: 2, type: '泉', description: 'd' },
      { id: '2', name: '地热1', category: 'geothermal', lat: 3, lng: 4, type: '地热', description: 'd' },
    ];
    const specs = buildMarkerSpecs(markers);
    expect(specs).toHaveLength(2);
    expect(specs[0].isSpring).toBe(true);
    expect(specs[0].popupHtml).toContain('泉1');
    expect(specs[0].iconHtml).toContain('pulse');
    expect(specs[1].isSpring).toBe(false);
    expect(specs[1].iconHtml).not.toContain('pulse');
  });
});

describe('buildCountyCoverageSpecs 纯函数', () => {
  it('返回非空且每项含经纬度与 popupHtml', () => {
    const specs = buildCountyCoverageSpecs();
    expect(specs.length).toBeGreaterThan(0);
    expect(typeof specs[0].lat).toBe('number');
    expect(specs[0].popupHtml).toContain('</div>');
  });
});

describe('useMapLayers 图层重建优化', () => {
  beforeEach(() => {
    setupLeafletMock();
  });

  it('切换无关图层时不重建标注图层（依赖拆细）', () => {
    const { refs, group } = makeRefs();
    const params = makeParams({ layerRefs: refs });
    const { rerender } = renderHook((p: MapLayersParams) => useMapLayers(p), { initialProps: params });

    expect(group.clearLayers.mock.calls.length).toBe(1);

    // 切换「超采区」开关：activeLayers 变化但 markersVisible 不变
    rerender(makeParams({ ...params, layerRefs: refs, activeLayers: new Set(['markers', 'overdraft']) }));

    expect(group.clearLayers.mock.calls.length).toBe(1);
  });

  it('关闭标注图层时触发一次重建', () => {
    const { refs, group } = makeRefs();
    const params = makeParams({ layerRefs: refs });
    const { rerender } = renderHook((p: MapLayersParams) => useMapLayers(p), { initialProps: params });
    const before = group.clearLayers.mock.calls.length;

    rerender(makeParams({ ...params, layerRefs: refs, activeLayers: new Set([]) }));

    expect(group.clearLayers.mock.calls.length).toBe(before + 1);
    expect(params.onMarkerCountChange).toHaveBeenCalledWith(0);
  });

  it('仅 visibleLayers 变化时才重建标注图层', () => {
    const { refs, group } = makeRefs();
    const params = makeParams({ layerRefs: refs });
    const { rerender } = renderHook((p: MapLayersParams) => useMapLayers(p), { initialProps: params });
    const before = group.clearLayers.mock.calls.length;

    // 仅改无关状态（showBoundary）不触发标注重建
    rerender(makeParams({ ...params, layerRefs: refs, showBoundary: false }));
    expect(group.clearLayers.mock.calls.length).toBe(before);

    // 改变 visibleLayers 才触发标注重建
    rerender(makeParams({ ...params, layerRefs: refs, visibleLayers: new Set(['spring', 'saline']) }));
    expect(group.clearLayers.mock.calls.length).toBe(before + 1);
  });

  it('创建标注图层时设置点击回调与 marker 数量', () => {
    const L = setupLeafletMock();
    const params = makeParams({ visibleLayers: new Set(['spring', 'geothermal', 'saline', 'waterSource', 'mine']) });
    renderHook((p: MapLayersParams) => useMapLayers(p), { initialProps: params });

    expect(L.marker).toHaveBeenCalled();
    expect(params.onMarkerCountChange).toHaveBeenCalled();
  });
});
