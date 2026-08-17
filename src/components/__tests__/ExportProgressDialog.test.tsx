// @vitest-environment jsdom
/**
 * Q-05 ExportProgressDialog 组件渲染测试
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { ExportProgressDialog } from '../ExportProgressDialog';

// 模拟 reportGeneratorLoader
vi.mock('../services/reportGeneratorLoader', () => ({
  loadReportGenerator: vi.fn().mockReturnValue({
    generate: vi.fn().mockResolvedValue(undefined),
  }),
}));

describe('ExportProgressDialog', () => {
  const baseProps = {
    open: true,
    onClose: vi.fn(),
    reportType: 'pdf',
    reportLabel: 'PDF报告',
    data: { key: 'value' },
  };

  it('关闭状态下不渲染', () => {
    const { container } = render(<ExportProgressDialog {...baseProps} open={false} />);
    expect(container.innerHTML).toBe('');
  });

  it('打开状态下显示标题', () => {
    render(<ExportProgressDialog {...baseProps} />);
    expect(screen.getByText(/导出/)).toBeInTheDocument();
    expect(screen.getByText(/PDF报告/)).toBeInTheDocument();
  });

  it('数据加载中显示加载状态', () => {
    render(<ExportProgressDialog {...baseProps} dataLoading={true} />);
    expect(screen.getByText('数据采集中...')).toBeInTheDocument();
  });

  it('无数据时生成按钮为禁用状态', () => {
    render(<ExportProgressDialog {...baseProps} data={null} />);
    expect(screen.getByRole('button', { name: '生成并下载' })).toBeDisabled();
  });

  it('显示取消按钮', () => {
    render(<ExportProgressDialog {...baseProps} />);
    expect(screen.getByRole('button', { name: '取消' })).toBeInTheDocument();
  });

  it('显示生成按钮', () => {
    render(<ExportProgressDialog {...baseProps} />);
    expect(screen.getByRole('button', { name: '生成并下载' })).toBeInTheDocument();
  });
});