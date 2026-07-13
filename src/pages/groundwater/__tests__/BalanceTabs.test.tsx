// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// ── Mocks ──────────────────────────────────────────────
// Mock recharts: render children as-is
vi.mock('recharts', () => {
  const components = [
    'PieChart', 'Pie', 'Cell', 'ResponsiveContainer', 'Tooltip',
    'BarChart', 'Bar', 'XAxis', 'YAxis', 'CartesianGrid',
    'AreaChart', 'Area', 'Legend',
    'RadarChart', 'Radar', 'PolarGrid', 'PolarAngleAxis', 'PolarRadiusAxis',
  ];
  const mocks: Record<string, React.FC<{ children?: React.ReactNode }>> = {};
  for (const name of components) {
    mocks[name] = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
  }
  return mocks;
});

// Mock UI components — render title as heading
vi.mock('../../../components/UI', () => ({
  TechCard: ({ title, children }: { title?: string; children?: React.ReactNode }) => (
    <div data-testid="tech-card">
      <h3>{title}</h3>
      {children}
    </div>
  ),
  ChartTooltip: () => null,
}));

vi.mock('../../../components/LazyChartCard', () => ({
  LazyChartCard: ({ title, children }: { title?: string; children?: React.ReactNode }) => (
    <div data-testid="lazy-chart-card">
      <h4>{title}</h4>
      {children}
    </div>
  ),
}));

// ── Imports (after mocks) ──────────────────────────────
import { BalanceOverviewTab } from '../BalanceOverviewTab';
import { BalanceCityTab } from '../BalanceCityTab';
import { BalancePotentialTab } from '../BalancePotentialTab';
import { BalanceQualityTab } from '../BalanceQualityTab';
import { BalancePollutionTab } from '../BalancePollutionTab';

// ═══════════════════════════════════════════════════════
// Test data
// ═══════════════════════════════════════════════════════
const samplePie = [
  { name: '降水入渗', value: 40.5 },
  { name: '侧向流入', value: 12.3 },
];

const sampleCityChart = [
  { city: '石家庄', recharge: 20.1, discharge: 25.3 },
  { city: '保定', recharge: 15.2, discharge: 18.7 },
];

const samplePotential = [
  { name: '山前平原', value: 5.2 },
  { name: '中部平原', value: 2.1 },
];

const samplePollution = [
  { city: '石家庄', area: 1200 },
  { city: '保定', area: 800 },
];

// ═══════════════════════════════════════════════════════
// BalanceOverviewTab
// ═══════════════════════════════════════════════════════
describe('BalanceOverviewTab', () => {
  it('renders recharge and discharge chart titles', () => {
    render(
      <BalanceOverviewTab
        rechargePie={samplePie}
        dischargePie={samplePie}
      />
    );
    expect(screen.getByText('补给项构成')).toBeInTheDocument();
    expect(screen.getByText('排泄项构成')).toBeInTheDocument();
  });

  it('renders water balance summary table', () => {
    render(
      <BalanceOverviewTab
        rechargePie={samplePie}
        dischargePie={samplePie}
      />
    );
    expect(screen.getByText('河北平原区水均衡总表')).toBeInTheDocument();
  });

  it('renders hydrogeological parameters card', () => {
    render(
      <BalanceOverviewTab
        rechargePie={samplePie}
        dischargePie={samplePie}
      />
    );
    expect(screen.getByText('水文地质参数')).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════
// BalanceCityTab
// ═══════════════════════════════════════════════════════
describe('BalanceCityTab', () => {
  it('renders city balance chart card', () => {
    render(<BalanceCityTab cityBalanceChart={sampleCityChart} />);
    expect(screen.getByText('各市潜水-微承压水均衡对比')).toBeInTheDocument();
  });

  it('renders balance detail table', () => {
    render(<BalanceCityTab cityBalanceChart={sampleCityChart} />);
    expect(screen.getByText('各市均衡明细')).toBeInTheDocument();
    expect(screen.getAllByText('城市').length).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════
// BalancePotentialTab
// ═══════════════════════════════════════════════════════
describe('BalancePotentialTab', () => {
  it('renders potential chart card', () => {
    render(<BalancePotentialTab potentialChart={samplePotential} />);
    expect(screen.getByText('各市开采潜力对比')).toBeInTheDocument();
  });

  it('renders zone names from data', () => {
    render(<BalancePotentialTab potentialChart={samplePotential} />);
    expect(screen.getByText('开采潜力分区统计')).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════
// BalanceQualityTab
// ═══════════════════════════════════════════════════════
describe('BalanceQualityTab', () => {
  it('renders without crashing', () => {
    const { container } = render(<BalanceQualityTab />);
    expect(container).toBeTruthy();
  });

  it('renders quality card', () => {
    render(<BalanceQualityTab />);
    expect(screen.getByText('浅层地下水质量分类')).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════
// BalancePollutionTab
// ═══════════════════════════════════════════════════════
describe('BalancePollutionTab', () => {
  it('renders pollution chart card', () => {
    render(<BalancePollutionTab pollutionChart={samplePollution} />);
    expect(screen.getByText('各市地下水污染面积分布')).toBeInTheDocument();
  });

  it('renders city names from data', () => {
    render(<BalancePollutionTab pollutionChart={samplePollution} />);
    expect(screen.getByText('主要污染物检出率与超标率')).toBeInTheDocument();
  });
});
