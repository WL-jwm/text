// @vitest-environment jsdom
/**
 * Q-05 Toast 组件渲染测试
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { ToastProvider, useToast } from '../Toast';

// 模拟 setTimeout
beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

/** 测试辅助组件 - 触发所有 toast 类型 */
function ToastTrigger() {
  const toast = useToast();
  return (
    <div>
      <button onClick={() => toast.success('操作成功')}>success</button>
      <button onClick={() => toast.error('操作失败')}>error</button>
      <button onClick={() => toast.info('信息提示')}>info</button>
      <button onClick={() => toast.warning('警告信息')}>warning</button>
    </div>
  );
}

describe('ToastProvider', () => {
  it('渲染子组件', () => {
    render(
      <ToastProvider>
        <div data-testid="child">内容</div>
      </ToastProvider>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('触发 success toast', () => {
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    );

    act(() => {
      screen.getByText('success').click();
    });

    expect(screen.getByText('操作成功')).toBeInTheDocument();
  });

  it('触发 error toast', () => {
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    );

    act(() => {
      screen.getByText('error').click();
    });

    expect(screen.getByText('操作失败')).toBeInTheDocument();
  });

  it('触发 info toast', () => {
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    );

    act(() => {
      screen.getByText('info').click();
    });

    expect(screen.getByText('信息提示')).toBeInTheDocument();
  });

  it('触发 warning toast', () => {
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    );

    act(() => {
      screen.getByText('warning').click();
    });

    expect(screen.getByText('警告信息')).toBeInTheDocument();
  });

  it('toast 超时后自动消失', () => {
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    );

    act(() => {
      screen.getByText('success').click();
    });

    expect(screen.getByText('操作成功')).toBeInTheDocument();

    // 快进到超时后
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.queryByText('操作成功')).not.toBeInTheDocument();
  });
});