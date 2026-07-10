// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { OverviewWaterPressure, computeCityPressure } from './OverviewWaterPressure';

describe('computeCityPressure', () => {
  it('returns an array sorted by pressureIndex descending', () => {
    const data = computeCityPressure();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    // Verify sorted descending
    for (let i = 1; i < data.length; i++) {
      expect(data[i - 1].pressureIndex).toBeGreaterThanOrEqual(data[i].pressureIndex);
    }
  });

  it('each entry has required fields', () => {
    const data = computeCityPressure();
    for (const city of data) {
      expect(city).toHaveProperty('name');
      expect(city).toHaveProperty('pressureIndex');
      expect(city).toHaveProperty('avgPrecip');
      expect(city).toHaveProperty('totalUse');
      expect(city).toHaveProperty('countyCount');
      expect(city).toHaveProperty('pressureLevel');
      expect(city).toHaveProperty('pressureColor');
    }
  });

  it('pressureLevel is one of the 4 valid levels', () => {
    const data = computeCityPressure();
    const validLevels = ['极缺水', '缺水', '一般', '丰水'];
    for (const city of data) {
      expect(validLevels).toContain(city.pressureLevel);
    }
  });

  it('pressureColor is a valid hex color', () => {
    const data = computeCityPressure();
    const hexPattern = /^#[0-9a-f]{6}$/;
    for (const city of data) {
      expect(city.pressureColor).toMatch(hexPattern);
    }
  });
});

describe('OverviewWaterPressure', () => {
  it('renders without crashing', () => {
    const { container } = render(<OverviewWaterPressure dataCounties={100} />);
    expect(container.firstChild).toBeTruthy();
  });

  it('contains the panel title', () => {
    render(<OverviewWaterPressure dataCounties={100} />);
    const titleEl = screen.queryByText(/水资源丰缺/);
    expect(titleEl).toBeTruthy();
  });

  it('displays dataCounties in subtitle', () => {
    render(<OverviewWaterPressure dataCounties={85} />);
    const text = screen.queryByText(/85/);
    expect(text).toBeTruthy();
  });
});
