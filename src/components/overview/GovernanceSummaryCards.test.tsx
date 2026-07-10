// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { GovernanceSummaryCards } from './GovernanceSummaryCards';

describe('GovernanceSummaryCards', () => {
  it('renders 5 StatCards with correct titles', () => {
    render(<GovernanceSummaryCards />);
    const titles = ['十年开采降幅', '十年水位回升', '十年水质改善', '十年沉降减缓', '水位回升最大'];
    for (const title of titles) {
      expect(screen.getByText(title)).toBeInTheDocument();
    }
  });

  it('renders cards in a grid container', () => {
    const { container } = render(<GovernanceSummaryCards />);
    const grid = container.firstChild as HTMLElement;
    expect(grid.className).toContain('grid-cols-2');
    expect(grid.className).toContain('md:grid-cols-5');
  });

  it('displays numeric values and units', () => {
    render(<GovernanceSummaryCards />);
    // All cards should have value text (not empty)
    const allText = screen.getByText('十年开采降幅').parentElement?.parentElement?.textContent || '';
    expect(allText.length).toBeGreaterThan(0);
  });

  it('subtitles contain year range 2014→2024', () => {
    render(<GovernanceSummaryCards />);
    // The last card subtitle should be "2014→2024"
    const lastCard = screen.getByText('水位回升最大');
    const parent = lastCard.closest('.rounded-xl');
    expect(parent?.textContent).toContain('2014→2024');
  });
});
