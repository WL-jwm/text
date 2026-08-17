// @vitest-environment jsdom
/**
 * Q-05 ErrorBoundary 组件渲染测试
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { ErrorBoundary } from '../ErrorBoundary';

// 模拟 console.error 避免测试输出污染
const originalError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});
afterEach(() => {
  console.error = originalError;
});

describe('ErrorBoundary', () => {
  it('正常渲染子组件', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">正常内容</div>
      </ErrorBoundary>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('正常内容')).toBeInTheDocument();
  });

  it('捕获错误并显示错误信息', () => {
    const ThrowError = () => {
      throw new Error('测试错误');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('页面渲染异常')).toBeInTheDocument();
    expect(screen.getByText('测试错误')).toBeInTheDocument();
  });

  it('显示重试按钮', () => {
    const ThrowError = () => {
      throw new Error('测试错误');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('使用自定义 fallback', () => {
    const ThrowError = () => {
      throw new Error('测试错误');
    };

    render(
      <ErrorBoundary fallback={<div data-testid="custom-fallback">自定义错误页</div>}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.getByText('自定义错误页')).toBeInTheDocument();
  });

  it('正常组件不显示错误信息', () => {
    render(
      <ErrorBoundary>
        <div data-testid="normal">正常运行</div>
      </ErrorBoundary>
    );

    expect(screen.getByTestId('normal')).toBeInTheDocument();
    expect(screen.queryByText(/出错了/)).not.toBeInTheDocument();
  });
});