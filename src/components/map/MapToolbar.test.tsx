// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MapToolbar } from './MapToolbar';

describe('MapToolbar', () => {
  const defaultProps = {
    activeLayers: new Set(['markers']),
    activeLayerCount: 1,
    onExportMarkers: vi.fn(),
    onExportVisible: vi.fn(),
    onExportOverdraft: vi.fn(),
    onExportResource: vi.fn(),
    onExportWaterSourcePOI: vi.fn(),
    onExportKarstSpringPOI: vi.fn(),
  };

  it('renders layer count', () => {
    render(<MapToolbar {...defaultProps} />);
    expect(screen.getByText('1 图层')).toBeInTheDocument();
  });

  it('renders marker export buttons when markers layer is active', () => {
    render(<MapToolbar {...defaultProps} />);
    expect(screen.getByText('全部')).toBeInTheDocument();
    expect(screen.getByText('已选')).toBeInTheDocument();
  });

  it('hides marker export buttons when markers layer is not active', () => {
    render(<MapToolbar {...defaultProps} activeLayers={new Set(['overdraft'])} />);
    expect(screen.queryByText('全部')).not.toBeInTheDocument();
    expect(screen.queryByText('已选')).not.toBeInTheDocument();
  });

  it('renders overdraft export button when overdraft layer is active', () => {
    render(<MapToolbar {...defaultProps} activeLayers={new Set(['overdraft'])} />);
    expect(screen.getByText('超采区')).toBeInTheDocument();
  });

  it('renders resource export button when resource layer is active', () => {
    render(<MapToolbar {...defaultProps} activeLayers={new Set(['resource'])} />);
    expect(screen.getByText('资源')).toBeInTheDocument();
  });

  it('renders waterSourcePOI export button when waterSourcePOI layer is active', () => {
    render(<MapToolbar {...defaultProps} activeLayers={new Set(['waterSourcePOI'])} />);
    expect(screen.getByText('水源地')).toBeInTheDocument();
  });

  it('renders karstSpringPOI export button when karstSpringPOI layer is active', () => {
    render(<MapToolbar {...defaultProps} activeLayers={new Set(['karstSpringPOI'])} />);
    expect(screen.getByText('岩溶泉')).toBeInTheDocument();
  });

  it('renders multiple export buttons when multiple layers are active', () => {
    render(<MapToolbar {...defaultProps} activeLayers={new Set(['markers', 'overdraft', 'resource'])} />);
    expect(screen.getByText('全部')).toBeInTheDocument();
    expect(screen.getByText('超采区')).toBeInTheDocument();
    expect(screen.getByText('资源')).toBeInTheDocument();
  });

  it('has absolute positioning for map overlay', () => {
    const { container } = render(<MapToolbar {...defaultProps} />);
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain('absolute');
    expect(root.className).toContain('top-3');
    expect(root.className).toContain('left-3');
  });
});
