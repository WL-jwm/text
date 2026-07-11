// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { CollapsiblePanel } from './CollapsiblePanel';

describe('CollapsiblePanel', () => {
  it('renders title text', () => {
    render(<CollapsiblePanel title="测试面板">内容</CollapsiblePanel>);
    expect(screen.getByText('测试面板')).toBeInTheDocument();
  });

  it('is collapsed by default and hides children', () => {
    render(<CollapsiblePanel title="面板">隐藏内容</CollapsiblePanel>);
    expect(screen.queryByText('隐藏内容')).not.toBeInTheDocument();
    expect(screen.getByText('展开')).toBeInTheDocument();
  });

  it('toggles to expanded on click and shows children', () => {
    render(<CollapsiblePanel title="面板">显示内容</CollapsiblePanel>);
    fireEvent.click(screen.getByText('面板'));
    expect(screen.getByText('显示内容')).toBeInTheDocument();
    expect(screen.getByText('收起')).toBeInTheDocument();
  });

  it('toggles back to collapsed on second click', () => {
    render(<CollapsiblePanel title="面板">内容</CollapsiblePanel>);
    fireEvent.click(screen.getByText('面板'));
    fireEvent.click(screen.getByText('面板'));
    expect(screen.queryByText('内容')).not.toBeInTheDocument();
    expect(screen.getByText('展开')).toBeInTheDocument();
  });

  it('renders badge when provided', () => {
    render(<CollapsiblePanel title="面板" badge="3项">内容</CollapsiblePanel>);
    expect(screen.getByText('3项')).toBeInTheDocument();
  });

  it('does not render badge when not provided', () => {
    const { container } = render(<CollapsiblePanel title="面板">内容</CollapsiblePanel>);
    const badgeEl = container.querySelector('[class*="bg-gw-cyan"]');
    expect(badgeEl).toBeNull();
  });

  it('applies custom className', () => {
    const { container } = render(
      <CollapsiblePanel title="面板" className="my-custom-class">内容</CollapsiblePanel>
    );
    expect((container.firstChild as HTMLElement).className).toContain('my-custom-class');
  });

  it('has a clickable button for the header', () => {
    render(<CollapsiblePanel title="面板">内容</CollapsiblePanel>);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button.className).toContain('w-full');
  });
});
