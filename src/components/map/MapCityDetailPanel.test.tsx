// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MapCityDetailPanel } from './MapCityDetailPanel';

// Use real data from mapDataEnhanced — import the grade data
import { getCityResourceGrades } from '../../data/mapDataEnhanced';

describe('MapCityDetailPanel', () => {
  const cityGrades = getCityResourceGrades();

  const defaultProps = {
    cityName: null as string | null,
    cityGrades,
    onClose: vi.fn(),
  };

  it('renders nothing when cityName is null', () => {
    const { container } = render(<MapCityDetailPanel {...defaultProps} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders city name with 市 suffix', () => {
    // 石家庄 should be in the dataset
    render(<MapCityDetailPanel {...defaultProps} cityName="石家庄" />);
    expect(screen.getByText('石家庄市')).toBeInTheDocument();
  });

  it('renders subtitle', () => {
    render(<MapCityDetailPanel {...defaultProps} cityName="石家庄" />);
    expect(screen.getByText('地下水概览')).toBeInTheDocument();
  });

  it('renders key metric labels', () => {
    render(<MapCityDetailPanel {...defaultProps} cityName="石家庄" />);
    expect(screen.getByText('地下水资源量')).toBeInTheDocument();
    expect(screen.getByText('地下水供水')).toBeInTheDocument();
    expect(screen.getByText('供水占比')).toBeInTheDocument();
    expect(screen.getByText('地表水资源量')).toBeInTheDocument();
    expect(screen.getByText('降水量')).toBeInTheDocument();
    expect(screen.getByText('总供水量')).toBeInTheDocument();
  });

  it('renders unit labels', () => {
    render(<MapCityDetailPanel {...defaultProps} cityName="石家庄" />);
    const units = screen.getAllByText('亿m³');
    expect(units.length).toBeGreaterThanOrEqual(2);
  });

  it('calls onClose when close button is clicked', () => {
    render(<MapCityDetailPanel {...defaultProps} cityName="石家庄" />);
    const closeBtn = screen.getByRole('button');
    fireEvent.click(closeBtn);
    expect(defaultProps.onClose).toHaveBeenCalledOnce();
  });

  it('renders overdraft section', () => {
    render(<MapCityDetailPanel {...defaultProps} cityName="石家庄" />);
    expect(screen.getByText('超采区类型')).toBeInTheDocument();
  });

  it('renders shallow and deep overdraft labels', () => {
    render(<MapCityDetailPanel {...defaultProps} cityName="石家庄" />);
    // Should contain 浅层: and 深层: labels
    const panel = screen.getByText('石家庄市').closest('[class*="absolute"]');
    expect(panel?.textContent).toContain('浅层:');
    expect(panel?.textContent).toContain('深层:');
  });

  it('has absolute positioning for map overlay', () => {
    render(<MapCityDetailPanel {...defaultProps} cityName="石家庄" />);
    const panel = screen.getByText('石家庄市').closest('[class*="absolute"]');
    expect(panel?.className).toContain('bottom-3');
    expect(panel?.className).toContain('left-3');
  });

  it('renders grade circle with number', () => {
    render(<MapCityDetailPanel {...defaultProps} cityName="石家庄" />);
    const grade = cityGrades.find(g => g.city === '石家庄');
    if (grade) {
      expect(screen.getByText(String(grade.grade))).toBeInTheDocument();
    }
  });

  it('renders nothing for unknown city name', () => {
    const { container } = render(<MapCityDetailPanel {...defaultProps} cityName="不存在的城市" />);
    expect(container.innerHTML).toBe('');
  });
});
