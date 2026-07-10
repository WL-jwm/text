// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { SupplyStructurePanel } from './SupplyStructurePanel';
import { ALL_CITIES } from './timeSeriesUtils';

describe('SupplyStructurePanel', () => {
  const allSelected = new Set(ALL_CITIES);

  it('renders without crashing with all cities selected', () => {
    const { container } = render(<SupplyStructurePanel selected={allSelected} />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders total supply StatCard', () => {
    render(<SupplyStructurePanel selected={allSelected} />);
    expect(screen.getByText('总供水量')).toBeInTheDocument();
  });

  it('renders groundwater ratio StatCard', () => {
    render(<SupplyStructurePanel selected={allSelected} />);
    expect(screen.getByText('地下水占比')).toBeInTheDocument();
  });

  it('renders surface water ratio StatCard', () => {
    render(<SupplyStructurePanel selected={allSelected} />);
    expect(screen.getByText('地表水+外调占比')).toBeInTheDocument();
  });

  it('renders without crashing with single city', () => {
    const { container } = render(<SupplyStructurePanel selected={new Set(['石家庄'])} />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders without crashing with empty selection', () => {
    const { container } = render(<SupplyStructurePanel selected={new Set()} />);
    expect(container.firstChild).toBeTruthy();
  });
});
