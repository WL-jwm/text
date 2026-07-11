// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MapLayerControls } from './MapLayerControls';

describe('MapLayerControls', () => {
  const defaultProps = {
    activeLayers: new Set(['markers']),
    activeLayerCount: 1,
    onToggleLayer: vi.fn(),
    onResetLayers: vi.fn(),
  };

  it('renders layer count text', () => {
    render(<MapLayerControls {...defaultProps} />);
    expect(screen.getByText(/已激活 1 个图层/)).toBeInTheDocument();
  });

  it('renders all LAYER_DEFS buttons', () => {
    render(<MapLayerControls {...defaultProps} />);
    // Should have buttons for: 标注分布, 资源量分级, 超采区划, 重要水源地, 岩溶大泉, 等值线
    expect(screen.getByText('标注分布')).toBeInTheDocument();
    expect(screen.getByText('资源量分级')).toBeInTheDocument();
    expect(screen.getByText('超采区划')).toBeInTheDocument();
  });

  it('calls onToggleLayer when a layer button is clicked', () => {
    render(<MapLayerControls {...defaultProps} />);
    fireEvent.click(screen.getByText('资源量分级'));
    expect(defaultProps.onToggleLayer).toHaveBeenCalledWith('resource');
  });

  it('does not show reset button when only 1 layer is active', () => {
    render(<MapLayerControls {...defaultProps} />);
    expect(screen.queryByText('重置')).not.toBeInTheDocument();
  });

  it('shows reset button when multiple layers are active', () => {
    render(<MapLayerControls {...defaultProps} activeLayerCount={3} />);
    expect(screen.getByText('重置')).toBeInTheDocument();
  });

  it('calls onResetLayers when reset button is clicked', () => {
    render(<MapLayerControls {...defaultProps} activeLayerCount={3} />);
    fireEvent.click(screen.getByText('重置'));
    expect(defaultProps.onResetLayers).toHaveBeenCalledOnce();
  });

  it('renders in a flex-wrap container', () => {
    const { container } = render(<MapLayerControls {...defaultProps} />);
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain('flex');
    expect(root.className).toContain('flex-wrap');
  });
});
