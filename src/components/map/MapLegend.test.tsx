// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MapLegend } from './MapLegend';

describe('MapLegend', () => {
  const categoryStats = [
    { key: 'spring', label: '泉域', color: '#10b981' },
    { key: 'geothermal', label: '地热田', color: '#ef4444' },
  ];

  it('renders legend title', () => {
    render(<MapLegend activeLayers={new Set(['markers'])} categoryStats={categoryStats} />);
    expect(screen.getByText('图例')).toBeInTheDocument();
  });

  it('renders marker category legend when markers layer is active', () => {
    render(<MapLegend activeLayers={new Set(['markers'])} categoryStats={categoryStats} />);
    expect(screen.getByText('标注分类')).toBeInTheDocument();
    expect(screen.getByText('泉域')).toBeInTheDocument();
    expect(screen.getByText('地热田')).toBeInTheDocument();
  });

  it('hides marker legend when markers layer is not active', () => {
    render(<MapLegend activeLayers={new Set()} categoryStats={categoryStats} />);
    expect(screen.queryByText('标注分类')).not.toBeInTheDocument();
  });

  it('renders resource grade legend when resource layer is active', () => {
    render(<MapLegend activeLayers={new Set(['resource'])} categoryStats={categoryStats} />);
    expect(screen.getByText('资源量等级')).toBeInTheDocument();
  });

  it('renders overdraft legend when overdraft layer is active', () => {
    render(<MapLegend activeLayers={new Set(['overdraft'])} categoryStats={categoryStats} />);
    expect(screen.getByText('超采区类型')).toBeInTheDocument();
  });

  it('renders waterSourcePOI legend when waterSourcePOI layer is active', () => {
    render(<MapLegend activeLayers={new Set(['waterSourcePOI'])} categoryStats={categoryStats} />);
    expect(screen.getByText('水源地')).toBeInTheDocument();
    expect(screen.getByText('重要水源地')).toBeInTheDocument();
  });

  it('renders karstSpringPOI legend when karstSpringPOI layer is active', () => {
    render(<MapLegend activeLayers={new Set(['karstSpringPOI'])} categoryStats={categoryStats} />);
    expect(screen.getByText('岩溶泉')).toBeInTheDocument();
    expect(screen.getByText('岩溶大泉')).toBeInTheDocument();
  });

  it('hides all legends when no layers are active', () => {
    render(<MapLegend activeLayers={new Set()} categoryStats={categoryStats} />);
    // Only "图例" header should be visible
    expect(screen.getByText('图例')).toBeInTheDocument();
    expect(screen.queryByText('标注分类')).not.toBeInTheDocument();
    expect(screen.queryByText('资源量等级')).not.toBeInTheDocument();
    expect(screen.queryByText('超采区类型')).not.toBeInTheDocument();
  });

  it('has absolute positioning for map overlay', () => {
    const { container } = render(<MapLegend activeLayers={new Set(['markers'])} categoryStats={categoryStats} />);
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain('absolute');
    expect(root.className).toContain('top-3');
    expect(root.className).toContain('right-3');
  });
});
