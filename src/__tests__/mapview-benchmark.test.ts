// @vitest-environment jsdom
/**
 * 性能基准：useMapLayers 图层渲染优化前后对比
 *
 * 覆盖场景：
 * - S0 综合场景：10 次图层切换
 * - S1 极端·单图层高频开关：markers 开关 20 次（验证 popup 缓存复用）
 * - S2 极端·可见标注类别高频切换：visibleLayers 变化 20 次
 * - S3 极端·超采区过滤高频切换：overdraftFilter 变化 20 次（验证依赖拆细避免连锁重建）
 * - S4 极端·全图层极速开关：activeLayers 全开/全关交替 20 次
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

type MutatableFields = 'activeLayers' | 'visibleLayers' | 'overdraftFilter';

function runScenario(
  useMapLayers: (p: MapLayersParams) => void,
  initial: Partial<MapLayersParams>,
  steps: Array<(toggle: (f: MutatableFields, k: string, on: boolean) => void) => void>,
): BenchResult {
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
    ...initial,
  };

  const { rerender } = renderHook((p: MapLayersParams) => useMapLayers(p), { initialProps: params });

  const toggle = (f: MutatableFields, key: string, on: boolean) => {
    const next = new Set(params[f]);
    if (on) next.add(key);
    else next.delete(key);
    params[f] = next;
  };

  steps.forEach(step => {
    step(toggle);
    rerender(params);
  });

  const clearLayers: Record<string, number> = {};
  Object.entries(chains).forEach(([k, ch]) => { clearLayers[k] = ch.clearLayers.mock.calls.length; });

  return {
    clearLayers,
    totalClear: Object.values(clearLayers).reduce((a, b) => a + b, 0),
    buildMarkerPopup: counters.buildMarkerPopup,
    getVisibleMarkers: counters.getVisibleMarkers,
  };
}

/** 将两个实现的场景结果渲染为对比表 */
function printScenario(name: string, legacy: BenchResult, optimized: BenchResult) {
  console.log('\n── ' + name + ' ──');
  console.log('  ' + ['图层', '优化前', '优化后', '↓'].join('\t'));
  const order: LayerName[] = ['layerGroup', 'zone', 'boundary', 'countyCoverage', 'overdraft', 'resource', 'cityBoundary', 'waterSourcePOI', 'karstSpringPOI'];
  order.forEach(k => {
    const l = legacy.clearLayers[k];
    const o = optimized.clearLayers[k];
    console.log('  ' + [k, l, o, (l - o) + ''].join('\t'));
  });
  console.log('  合计重建   : 优化前 ' + legacy.totalClear + ' → 优化后 ' + optimized.totalClear + '  (↓ ' + Math.round((1 - optimized.totalClear / legacy.totalClear) * 100) + '%)');
  console.log('  popup拼接  : 优化前 ' + legacy.buildMarkerPopup + ' → 优化后 ' + optimized.buildMarkerPopup + '  (↓ ' + Math.round((1 - optimized.buildMarkerPopup / legacy.buildMarkerPopup) * 100) + '%)');
  console.log('  可见计算   : 优化前 ' + legacy.getVisibleMarkers + ' → 优化后 ' + optimized.getVisibleMarkers + '  (↓ ' + Math.round((1 - optimized.getVisibleMarkers / legacy.getVisibleMarkers) * 100) + '%)');
}

/** 无回归断言：优化后各项不劣于优化前（用于必要重建场景 S2/S3） */
function assertNoRegression(legacy: BenchResult, optimized: BenchResult) {
  expect(optimized.totalClear).toBeLessThanOrEqual(legacy.totalClear);
  expect(optimized.buildMarkerPopup).toBeLessThanOrEqual(legacy.buildMarkerPopup);
  expect(optimized.getVisibleMarkers).toBeLessThanOrEqual(legacy.getVisibleMarkers);
}

/** 显著提升断言：整层重建总次数严格减少（用于体现优化价值的场景 S0/S1/S4） */
function assertImproved(legacy: BenchResult, optimized: BenchResult) {
  assertNoRegression(legacy, optimized);
  expect(optimized.totalClear).toBeLessThan(legacy.totalClear);
}

describe('useMapLayers 图层渲染性能基准（优化前 vs 优化后）', () => {
  it('S0 综合场景：10 次图层切换', () => {
    const steps = [
      (t: (f: MutatableFields, k: string, on: boolean) => void) => t('activeLayers', 'overdraft', true),
      (t) => t('activeLayers', 'waterSourcePOI', true),
      (t) => t('activeLayers', 'karstSpringPOI', true),
      (t) => t('activeLayers', 'resource', true),
      (t) => t('activeLayers', 'overdraft', false),
      (t) => t('activeLayers', 'contour', true),
      (t) => t('activeLayers', 'markers', false),
      (t) => t('activeLayers', 'markers', true),
      (t) => t('visibleLayers', 'spring', false),
      (t) => t('activeLayers', 'waterSourcePOI', false),
    ];
    const legacy = runScenario(useMapLayersLegacy, {}, steps);
    const optimized = runScenario(useMapLayersOptimized, {}, steps);
    printScenario('S0 综合·10次图层切换', legacy, optimized);
    assertImproved(legacy, optimized);
  });

  it('S1 极端·单图层(markers)高频开关 20 次', () => {
    const steps = Array.from({ length: 20 }, (_, i) =>
      (t: (f: MutatableFields, k: string, on: boolean) => void) => t('activeLayers', 'markers', i % 2 === 1),
    );
    const legacy = runScenario(useMapLayersLegacy, {}, steps);
    const optimized = runScenario(useMapLayersOptimized, {}, steps);
    printScenario('S1 极端·markers开关×20', legacy, optimized);
    assertImproved(legacy, optimized);
  });

  it('S2 极端·可见标注类别高频切换 20 次', () => {
    const steps = Array.from({ length: 20 }, (_, i) =>
      (t: (f: MutatableFields, k: string, on: boolean) => void) => t('visibleLayers', i % 2 === 0 ? 'spring' : 'saline', i % 4 < 2),
    );
    const legacy = runScenario(useMapLayersLegacy, {}, steps);
    const optimized = runScenario(useMapLayersOptimized, {}, steps);
    printScenario('S2 极端·可见类别切换×20', legacy, optimized);
    assertNoRegression(legacy, optimized);
  });

  it('S3 极端·超采区过滤高频切换 20 次', () => {
    const types = ['shallow-general', 'deep-general', 'deep-severe'];
    const steps = Array.from({ length: 20 }, (_, i) =>
      (t: (f: MutatableFields, k: string, on: boolean) => void) => t('overdraftFilter', types[i % 3], i % 2 === 1),
    );
    const legacy = runScenario(useMapLayersLegacy, {}, steps);
    const optimized = runScenario(useMapLayersOptimized, {}, steps);
    printScenario('S3 极端·超采区过滤切换×20', legacy, optimized);
    assertNoRegression(legacy, optimized);
  });

  it('S4 极端·全图层极速开关 20 次', () => {
    const allLayers = ['overdraft', 'resource', 'waterSourcePOI', 'karstSpringPOI'];
    const steps = Array.from({ length: 20 }, (_, i) => {
      const on = i % 2 === 1;
      return (t: (f: MutatableFields, k: string, on: boolean) => void) => {
        allLayers.forEach(k => t('activeLayers', k, on));
      };
    });
    const legacy = runScenario(useMapLayersLegacy, {}, steps);
    const optimized = runScenario(useMapLayersOptimized, {}, steps);
    printScenario('S4 极端·全图层开关×20', legacy, optimized);
    assertImproved(legacy, optimized);
  });
});
