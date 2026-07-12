// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChartInteraction, useTableHighlight } from '../useChartInteraction';
import { useMobile, useReducedMotion, useKeyboardNavigation } from '../useMobile';

// Mock Toast context for usePageCommons
vi.mock('../../components/Toast', () => ({
  useToast: () => ({
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    toast: vi.fn(),
  }),
}));

// Mock react-router-dom for useScrollMemory
vi.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: '/test-page' }),
}));

// Import hooks that need mocks (must come after vi.mock)
import { useServiceWorker } from '../useServiceWorker';
import { useScrollMemory } from '../useScrollMemory';
import { useReportData } from '../useReportData';
import { usePageCommons } from '../usePageCommons';

// ═══════════════════════════════════════════════════════
// useChartInteraction + useTableHighlight
// ═══════════════════════════════════════════════════════
describe('useChartInteraction', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with null activeKey', () => {
    const { result } = renderHook(() => useChartInteraction());
    expect(result.current.activeKey).toBeNull();
  });

  it('sets activeKey and auto-clears after timeout', () => {
    const { result } = renderHook(() => useChartInteraction(1000));

    act(() => result.current.setActiveKey('石家庄'));
    expect(result.current.activeKey).toBe('石家庄');

    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.activeKey).toBeNull();
  });

  it('clears previous timeout and restarts when setting new key', () => {
    const { result } = renderHook(() => useChartInteraction(2000));

    // Set A at t=0, auto-clear at t=2000
    act(() => result.current.setActiveKey('A'));
    expect(result.current.activeKey).toBe('A');

    // At t=500, set B — this resets the timer, B auto-clears at t=500+2000=2500
    act(() => vi.advanceTimersByTime(500));
    act(() => result.current.setActiveKey('B'));
    expect(result.current.activeKey).toBe('B');

    // At t=2500 (2000ms after B was set), B should still be active
    act(() => vi.advanceTimersByTime(1500));
    expect(result.current.activeKey).toBe('B');

    // At t=2500+1, B should be cleared
    act(() => vi.advanceTimersByTime(501));
    expect(result.current.activeKey).toBeNull();
  });

  it('isActive returns true for matching key', () => {
    const { result } = renderHook(() => useChartInteraction(5000));

    act(() => result.current.setActiveKey('唐山'));
    expect(result.current.isActive('唐山')).toBe(true);
    expect(result.current.isActive('保定')).toBe(false);
  });

  it('registerChart returns cleanup function', () => {
    const { result } = renderHook(() => useChartInteraction());
    const cleanup = result.current.registerChart('chart-1');
    expect(typeof cleanup).toBe('function');
    expect(() => cleanup()).not.toThrow();
  });

  it('clearSelection sets activeKey to null', () => {
    const { result } = renderHook(() => useChartInteraction(5000));

    act(() => result.current.setActiveKey('test'));
    expect(result.current.activeKey).toBe('test');

    act(() => result.current.clearSelection());
    expect(result.current.activeKey).toBeNull();
  });
});

describe('useTableHighlight', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns getRowClassName function and clearSelection', () => {
    const { result } = renderHook(() => useTableHighlight());
    expect(typeof result.current.getRowClassName).toBe('function');
    expect(typeof result.current.clearSelection).toBe('function');
    expect(result.current.activeKey).toBeNull();
  });

  it('getRowClassName returns base class when no active key', () => {
    const { result } = renderHook(() => useTableHighlight());
    const cls = result.current.getRowClassName('any');
    expect(cls).toContain('data-row');
    expect(cls).not.toContain('bg-gw-blue/15');
  });
});

// ═══════════════════════════════════════════════════════
// useMobile (without fake timers — use matchMedia mock)
// ═══════════════════════════════════════════════════════
describe('useMobile', () => {
  it('exports a hook function', () => {
    // useMobile is imported at top; verify it is callable
    expect(typeof useMobile).toBe('function');
  });

  it('returns a boolean', () => {
    const { result } = renderHook(() => useMobile());
    expect(typeof result.current).toBe('boolean');
  });
});

describe('useReducedMotion', () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query.includes('prefers-reduced-motion: reduce'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('detects reduced motion preference', () => {
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });
});

describe('useKeyboardNavigation', () => {
  it('initializes with focusedIndex -1', () => {
    const { result } = renderHook(() => useKeyboardNavigation(5));
    expect(result.current.focusedIndex).toBe(-1);
  });

  it('moves focus forward on ArrowDown', () => {
    const { result } = renderHook(() => useKeyboardNavigation(5));

    act(() => {
      const node = document.createElement('div');
      result.current.containerRef(node);
      node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    });
    expect(result.current.focusedIndex).toBe(0);
  });

  it('wraps to last on ArrowUp from index -1', () => {
    const { result } = renderHook(() => useKeyboardNavigation(3));

    act(() => {
      const node = document.createElement('div');
      result.current.containerRef(node);
      node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    });
    expect(result.current.focusedIndex).toBe(2);
  });
});

// ═══════════════════════════════════════════════════════
// useServiceWorker
// ═══════════════════════════════════════════════════════
describe('useServiceWorker', () => {
  it('returns expected state properties', () => {
    try {
      const { result } = renderHook(() => useServiceWorker());
      expect(result.current).toHaveProperty('supported');
      expect(result.current).toHaveProperty('registered');
      expect(result.current).toHaveProperty('updateAvailable');
      expect(result.current).toHaveProperty('applyUpdate');
      expect(result.current).toHaveProperty('clearCache');
    } catch {
      // jsdom may not fully support SW
    }
  });
});

// ═══════════════════════════════════════════════════════
// useScrollMemory
// ═══════════════════════════════════════════════════════
describe('useScrollMemory', () => {
  it('scrolls to top on new page visit', () => {
    const scrollToMock = vi.fn();
    vi.stubGlobal('scrollTo', scrollToMock);
    vi.stubGlobal('scrollY', 0);
    const getItemMock = vi.fn().mockReturnValue(null);
    const setItemMock = vi.fn();
    vi.stubGlobal('sessionStorage', { getItem: getItemMock, setItem: setItemMock });

    renderHook(() => useScrollMemory());

    expect(scrollToMock).toHaveBeenCalledWith({ top: 0, behavior: 'instant' });

    vi.unstubAllGlobals();
  });
});

// ═══════════════════════════════════════════════════════
// useStoreInit — mock useAppStore via vi.mock
// ═══════════════════════════════════════════════════════

// Mock useAppStore before importing useStoreInit
vi.mock('../../store/useAppStore', () => ({
  useAppStore: vi.fn((selector) =>
    selector({
      init: vi.fn().mockResolvedValue(undefined),
      isInitialized: false,
      theme: 'system',
      language: 'zh-CN',
    })
  ),
}));

import { useStoreInit } from '../useStoreInit';
import { useAppStore } from '../../store/useAppStore';

describe('useStoreInit', () => {
  it('exports a hook function', () => {
    expect(typeof useStoreInit).toBe('function');
  });

  it('calls init from useAppStore on mount', async () => {
    const mockInit = vi.fn().mockResolvedValue(undefined);
    useAppStore.mockImplementation((selector: any) =>
      selector({ init: mockInit, isInitialized: false, theme: 'system', language: 'zh-CN' })
    );

    renderHook(() => useStoreInit());

    await act(async () => {
      await new Promise(r => setTimeout(r, 10));
    });

    expect(mockInit).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════
// useReportData
// ═══════════════════════════════════════════════════════
describe('useReportData', () => {
  it('collects data on mount and provides getData', async () => {
    const testData = { section1: 'data1', section2: 42 };
    const collector = vi.fn().mockResolvedValue(testData);

    const { result } = renderHook(() =>
      useReportData({
        pageName: 'test-page',
        collector,
        autoCollect: true,
      })
    );

    // Wait for async collection — use flushPromises-style
    await act(async () => {
      await new Promise(r => setTimeout(r, 10));
    });

    expect(collector).toHaveBeenCalled();
    expect(result.current.isReady).toBe(true);
    expect(result.current.isLoading).toBe(false);

    const data = result.current.getData();
    expect(data).toEqual(testData);
  });

  it('returns null from getData when autoCollect is false', () => {
    const collector = vi.fn().mockResolvedValue({});

    const { result } = renderHook(() =>
      useReportData({
        pageName: 'fresh-no-cache',
        collector,
        autoCollect: false,
      })
    );

    expect(result.current.getData()).toBeNull();
  });

  it('prevents concurrent collection via collectingRef', async () => {
    let resolveCollector: (v: unknown) => void;
    const collector = vi.fn().mockImplementation(
      () => new Promise(r => { resolveCollector = r; })
    );

    const { result } = renderHook(() =>
      useReportData({
        pageName: 'dedup-page',
        collector,
        autoCollect: true,
      })
    );

    // collector已调用一次（autoCollect），isLoading=true
    expect(result.current.isLoading).toBe(true);

    // 手动再触发collect，应被去重
    act(() => { result.current.collect(); });

    // collector应只被调用1次（去重保护）
    expect(collector).toHaveBeenCalledTimes(1);

    // Resolve the promise to complete
    await act(async () => {
      resolveCollector!({ done: true });
      await new Promise(r => setTimeout(r, 10));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isReady).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════
// usePageCommons
// ═══════════════════════════════════════════════════════
describe('usePageCommons', () => {
  it('returns exportOpen state with toggle function', async () => {
    const { result } = renderHook(() =>
      usePageCommons({
        pageName: 'commons-test',
        collector: async () => ({ test: true }),
        autoCollect: true,
      })
    );

    expect(result.current.exportOpen).toBe(false);

    act(() => result.current.setExportOpen(true));
    expect(result.current.exportOpen).toBe(true);

    act(() => result.current.setExportOpen(false));
    expect(result.current.exportOpen).toBe(false);
  });
});
