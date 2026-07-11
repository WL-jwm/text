// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { ContourControlPanel } from './ContourControlPanel';

describe('ContourControlPanel', () => {
  const defaultProps = {
    activeContour: 'waterLevel',
    contourOpacity: 0.6,
    onSetActiveContour: vi.fn(),
    onSetContourOpacity: vi.fn(),
  };

  it('renders panel title', () => {
    render(<ContourControlPanel {...defaultProps} />);
    expect(screen.getByText('等值线图层控制')).toBeInTheDocument();
  });

  it('renders IDW badge', () => {
    render(<ContourControlPanel {...defaultProps} />);
    expect(screen.getByText('IDW插值')).toBeInTheDocument();
  });

  it('renders opacity percentage', () => {
    render(<ContourControlPanel {...defaultProps} />);
    expect(screen.getByText('透明度: 60%')).toBeInTheDocument();
  });

  it('renders dataset selection buttons', () => {
    render(<ContourControlPanel {...defaultProps} />);
    // contourDatasets should have at least 'waterLevel'
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it('calls onSetActiveContour when a dataset button is clicked', () => {
    render(<ContourControlPanel {...defaultProps} />);
    const buttons = screen.getAllByRole('button');
    // First button should be the waterLevel button
    fireEvent.click(buttons[0]);
    expect(defaultProps.onSetActiveContour).toHaveBeenCalled();
  });

  it('renders info cards for data points, unit, and range', () => {
    render(<ContourControlPanel {...defaultProps} />);
    expect(screen.getByText('数据点')).toBeInTheDocument();
    expect(screen.getByText('单位')).toBeInTheDocument();
    expect(screen.getByText('范围')).toBeInTheDocument();
  });

  it('renders color bar legend with low/high labels', () => {
    render(<ContourControlPanel {...defaultProps} />);
    expect(screen.getByText('低')).toBeInTheDocument();
    expect(screen.getByText('高')).toBeInTheDocument();
  });

  it('renders dataset description', () => {
    render(<ContourControlPanel {...defaultProps} />);
    // waterLevel dataset description starts with '基于2024年'
    expect(screen.getByText(/基于2024年/)).toBeInTheDocument();
  });

  it('has an opacity range input', () => {
    const { container } = render(<ContourControlPanel {...defaultProps} />);
    const rangeInput = container.querySelector('input[type="range"]') as HTMLInputElement;
    expect(rangeInput).toBeInTheDocument();
    expect(rangeInput.value).toBe('0.6');
  });

  it('calls onSetContourOpacity when range input changes', () => {
    const { container } = render(<ContourControlPanel {...defaultProps} />);
    const rangeInput = container.querySelector('input[type="range"]') as HTMLInputElement;
    fireEvent.change(rangeInput, { target: { value: '0.8' } });
    expect(defaultProps.onSetContourOpacity).toHaveBeenCalledWith(0.8);
  });

  it('updates opacity display with different value', () => {
    render(<ContourControlPanel {...defaultProps} contourOpacity={0.3} />);
    expect(screen.getByText('透明度: 30%')).toBeInTheDocument();
  });
});
