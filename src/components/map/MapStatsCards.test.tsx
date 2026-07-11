// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MapStatsCards } from './MapStatsCards';

describe('MapStatsCards', () => {
  const defaultProps = {
    activeLayers: new Set(['markers']),
    visibleLayers: new Set(['spring', 'geothermal']),
    overdraftFilter: new Set(['shallow-general', 'deep-general']),
    cityGrades: [
      { city: '石家庄', grade: 2, groundResource: 15.3 },
      { city: '保定', grade: 3, groundResource: 12.1 },
    ],
    onToggleMarkerCategory: vi.fn(),
    onToggleOverdraftType: vi.fn(),
  };

  it('renders marker category stats when markers layer is active', () => {
    render(<MapStatsCards {...defaultProps} />);
    expect(screen.getByText('泉域')).toBeInTheDocument();
    expect(screen.getByText('地热田')).toBeInTheDocument();
    expect(screen.getByText('咸水区')).toBeInTheDocument();
    expect(screen.getByText('水源地')).toBeInTheDocument();
    expect(screen.getByText('矿区')).toBeInTheDocument();
  });

  it('renders in grid layout for marker stats', () => {
    const { container } = render(<MapStatsCards {...defaultProps} />);
    const grid = container.querySelector('.grid-cols-2');
    expect(grid).toBeInTheDocument();
  });

  it('hides marker stats when markers layer is not active', () => {
    render(<MapStatsCards {...defaultProps} activeLayers={new Set(['resource'])} />);
    expect(screen.queryByText('泉域')).not.toBeInTheDocument();
  });

  it('calls onToggleMarkerCategory when a marker card is clicked', () => {
    render(<MapStatsCards {...defaultProps} />);
    fireEvent.click(screen.getByText('泉域'));
    expect(defaultProps.onToggleMarkerCategory).toHaveBeenCalledWith('spring');
  });

  it('renders resource grade stats when resource layer is active', () => {
    render(<MapStatsCards {...defaultProps} activeLayers={new Set(['resource'])} />);
    // Should show grade labels from mapDataEnhanced (split on '(')
    expect(screen.getByText('丰富')).toBeInTheDocument();
    expect(screen.getByText('较丰富')).toBeInTheDocument();
  });

  it('shows correct city count per grade', () => {
    render(<MapStatsCards {...defaultProps} activeLayers={new Set(['resource'])} />);
    // grade 2 has 1 city, grade 3 has 1 city — multiple grades may have 1市
    const oneCityCards = screen.getAllByText('1市');
    expect(oneCityCards.length).toBeGreaterThanOrEqual(1);
  });

  it('hides resource stats when resource layer is not active', () => {
    render(<MapStatsCards {...defaultProps} activeLayers={new Set(['markers'])} />);
    expect(screen.queryByText('丰富')).not.toBeInTheDocument();
  });

  it('renders overdraft stats when overdraft layer is active', () => {
    render(<MapStatsCards {...defaultProps} activeLayers={new Set(['overdraft'])} />);
    expect(screen.getByText('总面积')).toBeInTheDocument();
    expect(screen.getByText('69,693 km²')).toBeInTheDocument();
  });

  it('calls onToggleOverdraftType when an overdraft card is clicked', () => {
    render(<MapStatsCards {...defaultProps} activeLayers={new Set(['overdraft'])} />);
    // Click the first overdraft legend card
    const cards = screen.getAllByText(/个$/);
    fireEvent.click(cards[0].closest('[class*="cursor-pointer"]')!);
    expect(defaultProps.onToggleOverdraftType).toHaveBeenCalled();
  });

  it('renders waterSourcePOI stats when waterSourcePOI layer is active', () => {
    render(<MapStatsCards {...defaultProps} activeLayers={new Set(['waterSourcePOI'])} />);
    expect(screen.getByText('水源地数量')).toBeInTheDocument();
    expect(screen.getByText('已替代')).toBeInTheDocument();
    expect(screen.getByText('正常开采')).toBeInTheDocument();
    expect(screen.getByText('总供水规模')).toBeInTheDocument();
  });

  it('renders karstSpringPOI stats when karstSpringPOI layer is active', () => {
    render(<MapStatsCards {...defaultProps} activeLayers={new Set(['karstSpringPOI'])} />);
    expect(screen.getByText('岩溶泉数量')).toBeInTheDocument();
    expect(screen.getByText('有流量数据')).toBeInTheDocument();
    expect(screen.getByText('总泉域面积')).toBeInTheDocument();
    expect(screen.getByText('全排型')).toBeInTheDocument();
  });

  it('renders nothing when no layers are active', () => {
    const { container } = render(<MapStatsCards {...defaultProps} activeLayers={new Set()} />);
    expect(container.innerHTML).toBe('');
  });
});
