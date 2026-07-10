// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { RadarComparePanel } from './RadarComparePanel';
import { ALL_CITIES } from './timeSeriesUtils';

describe('RadarComparePanel', () => {
  const allSelected = new Set(ALL_CITIES);

  it('renders without crashing', () => {
    const { container } = render(<RadarComparePanel selected={allSelected} />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders title containing radar/雷达', () => {
    render(<RadarComparePanel selected={allSelected} />);
    // The panel should have some title text
    const matches = screen.getAllByText(/雷达/);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });
});
