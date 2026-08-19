// @vitest-environment jsdom
/**
 * 性能基准：useMapLayers 图层渲染优化前后对比
 *
 * 场景：模拟用户连续 10 次图层切换，统计每个图层的整层重建（clearLayers）
 * 次数、popup HTML 拼接（buildMarkerPopup）次数与可见标注计算（getVisibleMarkers）次数。
 *
 * - 优化前实现：src/__tests__/bench/useMapLayers.legacy.ts（提取自 git 72f09a5^）
 * - 优化后实现：src/pages/useMapLayers.ts
 */
import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { MapLayersParams } from '../pages/useMapLayers';
import type { MapLayerRefs } from '../pages/useMapSetup';
import type { LMap } from '../types/leaflet';
import type { MapMarker } from '../data/mapData';
import { useMapLayers as useMapLayersOptimized } from '../pages/useMapLayers';
import { useMapLayers as useMapLayersLegacy } from './bench/useMapLayers.legacy';

const counters = vi.hoisted(() => ({ buildMarkerPopup: 0, getVisibleMarkers: 0 }));

vi.mock('../pages/mapPopupTemplates', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../pages/mapPopupTemplates')>();
  return {
    ...mod,
    buildMarkerPopup: (m: MapMarker) => {
      counters.buildMarkerPopup++;
      return mod.buildMarkerPopup(m);
    },
  };
});
vi.mock('../data/mapData', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../data/mapData')>();
  return {
    ...mod,
    getVisibleMarkers: (v: Set<string>) => {
      counters.getVisibleMarkers++;
      return mod.getVisibleMarkers(v);
    },
  };
});

type LayerName = 'layerGroup' | 'zone' | 'boundary' | 'countyCoverage' | 'overdraft' | 'resource' | 'cityBoundary' | 'waterSourcePOI' | 'karstSpringPOI';

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

function makeRefs() {
  const chains: Record<string, LayerChain> = {};
  const refs = {} as unknown as MapLayerRefs;
  (['layerGroup', 'zone', 'boundary', 'countyCoverage', 'overdraft', 'resource', 'cityBoundary', 'waterSourcePOI', 'karstSpringPOI'] as LayerName[]).forEach(k => {
    chains[k] = makeLayerChain();
    (refs as unknown as Record<string, { current: unknown }>)[k] = { current: chains[k] };
  });
  (refs as unknown as Record<string, { current: unknown }>).contour = { current: null };
  return { refs, chains };
}

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

interface BenchResult {
  clearLayers: Record<string, number>;
  totalClear: number;
  buildMarkerPopup: number;
  getVisibleMarkers: number;
}

function runSequence(useMapLayers: (p: MapLayersParams) => void): BenchResult {
  setupLeafletMock();
  const { refs, chains } = makeRefs();
  counters.buildMarkerPopup = 0;
  counters.getVisibleMarkers = 0;

  const params: MapLayersParams = {
    mapInstanceRef: { current: {} as unknown as LMap },
    layerRefs: refs,
    activeLayers: new Set(['markers']),
    visibleLayers: new Set(['spring', 'geothermal', 'saline', 'waterSource', 'mine']),
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
  };

  const { rerender } = renderHook((p: MapLayersParams) => useMapLayers(p), { initialProps: params });

  const toggle = (set: Set<string>, key: string, on: boolean) => {
    const next = new Set(set);
    if (on) next.add(key);
    else next.delete(key);
    return next;
  };

  // 模拟 10 次图层切换
  const steps: Array<() => void> = [
    () => { params.activeLayers = toggle(params.activeLayers, 'overdraft', true); },
    () => { params.activeLayers = toggle(params.activeLayers, 'waterSourcePOI', true); },
    () => { params.activeLayers = toggle(params.activeLayers, 'karstSpringPOI', true); },
    () => { params.activeLayers = toggle(params.activeLayers, 'resource', true); },
    () => { params.activeLayers = toggle(params.activeLayers, 'overdraft', false); },
    () => { params.activeLayers = toggle(params.activeLayers, 'contour', true); },
    () => { params.activeLayers = toggle(params.activeLayers, 'markers', false); },
    () => { params.activeLayers = toggle(params.activeLayers, 'markers', true); },
    () => { params.visibleLayers = toggle(params.visibleLayers, 'spring', false); },
    () => { params.activeLayers = toggle(params.activeLayers, 'waterSourcePOI', false); },
  ];
  steps.forEach(step => { step(); rerender(params); });

  const clearLayers: Record<string, number> = {};
  Object.entries(chains).forEach(([k, ch]) => { clearLayers[k] = ch.clearLayers.mock.calls.length; });

  return {
    clearLayers,
    totalClear: Object.values(clearLayers).reduce((a, b) => a + b, 0),
    buildMarkerPopup: counters.buildMarkerPopup,
    getVisibleMarkers: counters.getVisibleMarkers,
  };
}

describe('useMapLayers 图层渲染性能基准（优化前 vs 优化后）', () => {
  it('10次图层切换下优化后重建次数显著低于优化前', () => {
    const legacy = runSequence(useMapLayersLegacy);
    const optimized = runSequence(useMapLayersOptimized);

    console.log('\n========== 性能基准（10次图层切换） ==========');
    console.log('【优化前】');
    console.log('  各图层 clearLayers 重建次数: ', legacy.clearLayers);
    console.log('  合计重建次数: ', legacy.totalClear);
    console.log('  buildMarkerPopup(popup拼接): ', legacy.buildMarkerPopup);
    console.log('  getVisibleMarkers(可见标注计算): ', legacy.getVisibleMarkers);
    console.log('【优化后】');
    console.log('  各图层 clearLayers 重建次数: ', optimized.clearLayers);
    console.log('  合计重建次数: ', optimized.totalClear);
    console.log('  buildMarkerPopup(popup拼接): ', optimized.buildMarkerPopup);
    console.log('  getVisibleMarkers(可见标注计算): ', optimized.getVisibleMarkers);
    console.log('============================================');

    // 优化后整层重建总次数必须显著更低
    expect(optimized.totalClear).toBeLessThan(legacy.totalClear);
    // popup HTML 拼接次数必须不高于优化前
    expect(optimized.buildMarkerPopup).toBeLessThanOrEqual(legacy.buildMarkerPopup);
    // 可见标注计算次数必须不高于优化前
    expect(optimized.getVisibleMarkers).toBeLessThanOrEqual(legacy.getVisibleMarkers);
    // 最关键的标注图层（markers）重建次数必须显著减少
    expect(optimized.clearLayers.layerGroup).toBeLessThan(legacy.clearLayers.layerGroup);
  });
});
