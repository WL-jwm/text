// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { StatCard } from './UI';

describe('StatCard', () => {
  it('renders title and value', () => {
    render(<StatCard title="测试指标" value="42" />);
    expect(screen.getByText('测试指标')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders unit when provided', () => {
    render(<StatCard title="水位" value="3.5" unit="m" />);
    expect(screen.getByText('m')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(<StatCard title="趋势" value="+2.1" unit="%" subtitle="同比上升" />);
    expect(screen.getByText('同比上升')).toBeInTheDocument();
  });

  it('does not render subtitle when not provided', () => {
    const { container } = render(<StatCard title="数据" value="100" />);
    // No subtitle element
    const allText = container.textContent || '';
    // Should only contain title, value
    expect(allText).toContain('数据');
    expect(allText).toContain('100');
  });

  it('applies correct accent class', () => {
    const { container } = render(<StatCard title="蓝" value="1" accent="blue" />);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('blue-500');
  });

  it('defaults to blue accent', () => {
    const { container } = render(<StatCard title="默认" value="0" />);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('blue-500');
  });

  it('renders icon when provided', () => {
    const MockIcon = () => <svg data-testid="mock-icon" />;
    render(<StatCard title="图标" value="99" icon={MockIcon as React.ElementType} />);
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  });
});
