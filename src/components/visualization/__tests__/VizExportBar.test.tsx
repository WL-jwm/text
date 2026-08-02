// @vitest-environment jsdom
/**
 * F-03 VizExportBar 组件测试
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VizExportBar } from '../VizExportBar';

describe('VizExportBar', () => {
  it('renders compact mode with dropdown', () => {
    render(
      <VizExportBar panelId="test" panelTitle="测试面板" compact />,
    );

    expect(screen.getByText('导出')).toBeDefined();
  });

  it('renders full mode with export buttons', () => {
    render(
      <VizExportBar panelId="test" panelTitle="测试面板" />,
    );

    expect(screen.getByText('PNG')).toBeDefined();
    expect(screen.getByText('SVG')).toBeDefined();
    expect(screen.getByText('Excel')).toBeDefined();
    expect(screen.getByText('CSV')).toBeDefined();
  });

  it('disables PNG/SVG when no svgRef provided', () => {
    render(
      <VizExportBar panelId="test" panelTitle="测试面板" />,
    );

    const pngBtn = screen.getByText('PNG').closest('button');
    const svgBtn = screen.getByText('SVG').closest('button');

    expect(pngBtn?.disabled).toBe(true);
    expect(svgBtn?.disabled).toBe(true);
  });

  it('disables Excel/CSV when no dataSheets provided', () => {
    render(
      <VizExportBar panelId="test" panelTitle="测试面板" />,
    );

    const excelBtn = screen.getByText('Excel').closest('button');
    const csvBtn = screen.getByText('CSV').closest('button');

    expect(excelBtn?.disabled).toBe(true);
    expect(csvBtn?.disabled).toBe(true);
  });

  it('expands dropdown in compact mode', () => {
    render(
      <VizExportBar panelId="test" panelTitle="测试面板" compact />,
    );

    const button = screen.getByText('导出').closest('button')!;
    fireEvent.click(button);

    expect(screen.getByText('PNG图片')).toBeDefined();
    expect(screen.getByText('SVG源文件')).toBeDefined();
    expect(screen.getByText('Excel数据')).toBeDefined();
    expect(screen.getByText('CSV数据')).toBeDefined();
  });

  it('enables Excel when dataSheets provided', () => {
    render(
      <VizExportBar
        panelId="test"
        panelTitle="测试面板"
        dataSheets={[{ name: 'Sheet1', headers: ['A', 'B'], rows: [[1, 2]] }]}
      />,
    );

    const excelBtn = screen.getByText('Excel').closest('button');
    const csvBtn = screen.getByText('CSV').closest('button');

    expect(excelBtn?.disabled).toBe(false);
    expect(csvBtn?.disabled).toBe(false);
  });
});
