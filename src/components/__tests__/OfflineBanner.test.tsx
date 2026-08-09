// @vitest-environment jsdom
/**
 * Q-05 OfflineBanner 组件渲染测试
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import OfflineBanner from '../OfflineBanner';

describe('OfflineBanner', () => {
  beforeEach(() => {
    // 默认模拟在线状态
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('在线状态不显示', () => {
    render(<OfflineBanner />);
    expect(screen.queryByText(/离线/)).not.toBeInTheDocument();
    expect(screen.queryByText(/网络已恢复/)).not.toBeInTheDocument();
  });

  it('离线时显示提示', () => {
    render(<OfflineBanner />);

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(screen.getByText(/当前处于离线状态/)).toBeInTheDocument();
  });

  it('网络恢复后显示恢复提示', () => {
    render(<OfflineBanner />);

    // 先离线
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    // 再恢复
    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    expect(screen.getByText(/网络已恢复/)).toBeInTheDocument();
  });

  it('恢复提示3秒后自动消失', () => {
    render(<OfflineBanner />);

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    expect(screen.getByText(/网络已恢复/)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.queryByText(/网络已恢复/)).not.toBeInTheDocument();
  });

  it('离线时显示刷新按钮', () => {
    render(<OfflineBanner />);

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});