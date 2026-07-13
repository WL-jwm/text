// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// ── Mocks ──────────────────────────────────────────────
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

// TechCard mock: only render title as plain string (no badge splitting)
vi.mock('../../../components/UI', () => ({
  TechCard: ({ title, children }: { title?: string; children?: React.ReactNode }) => (
    <div data-testid="tech-card">
      <h3 data-testid="tech-card-title">{String(title ?? '')}</h3>
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

vi.mock('../../../components/ChartExport', () => ({
  ChartExport: () => null,
}));

// ── Imports ─────────────────────────────────────────────
import { FunctionOverviewTab } from '../FunctionOverviewTab';
import { FunctionCityTab } from '../FunctionCityTab';
import { FunctionRecoveryTab } from '../FunctionRecoveryTab';
import { FunctionRestrictedTab } from '../FunctionRestrictedTab';
import { FunctionZonesTab } from '../FunctionZonesTab';

// ═══════════════════════════════════════════════════════
// Test data
// ═══════════════════════════════════════════════════════
const sampleTypePie = [
  { name: '浅层超采区', value: 39480, color: '#f59e0b' },
  { name: '深层超采区', value: 42634, color: '#ef4444' },
];

const sampleCityType = [
  { name: '石家庄', shallow: 3200, deep: 4100, severeDeep: 800 },
  { name: '保定', shallow: 2500, deep: 3800, severeDeep: 1200 },
];

const sampleRecoveryChart = [
  { year: '2019', shallow: 25.3, deep: 45.2 },
  { year: '2020', shallow: 24.8, deep: 44.1 },
];

const sampleRecoveryExport = [
  { city: '石家庄', shallowRecovery: 1.2, deepRecovery: 2.5 },
  { city: '保定', shallowRecovery: 0.8, deepRecovery: 1.9 },
];

const sampleZoneRadar = [
  { indicator: '水质保护', score: 85 },
  { indicator: '水量维持', score: 72 },
];

// ═══════════════════════════════════════════════════════
// FunctionOverviewTab
// ═══════════════════════════════════════════════════════
describe('FunctionOverviewTab', () => {
  it('renders overdraft pie chart card', () => {
    render(
      <FunctionOverviewTab
        typePieData={sampleTypePie}
        cityTypeData={sampleCityType}
      />
    );
    expect(screen.getByText('超采区面积构成')).toBeInTheDocument();
  });

  it('renders overdraft overview card', () => {
    render(
      <FunctionOverviewTab
        typePieData={sampleTypePie}
        cityTypeData={sampleCityType}
      />
    );
    expect(screen.getByText('超采区概况')).toBeInTheDocument();
  });

  it('renders city overdraft type statistics', () => {
    render(
      <FunctionOverviewTab
        typePieData={sampleTypePie}
        cityTypeData={sampleCityType}
      />
    );
    expect(screen.getByText('各市超采类型统计')).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════
// FunctionCityTab
// ═══════════════════════════════════════════════════════
describe('FunctionCityTab', () => {
  it('renders city overdraft type card', () => {
    render(<FunctionCityTab cityExportData={[]} />);
    expect(screen.getByText('各市超采区类型与分布')).toBeInTheDocument();
  });

  it('renders shallow detail table', () => {
    render(<FunctionCityTab cityExportData={[]} />);
    expect(screen.getByText('浅层超采区范围明细')).toBeInTheDocument();
  });

  it('renders deep detail table', () => {
    render(<FunctionCityTab cityExportData={[]} />);
    expect(screen.getByText('深层超采区范围明细')).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════
// FunctionRecoveryTab
// ═══════════════════════════════════════════════════════
describe('FunctionRecoveryTab', () => {
  it('renders depth change chart card', () => {
    render(
      <FunctionRecoveryTab
        recoveryChartData={sampleRecoveryChart}
        recoveryExportData={sampleRecoveryExport}
      />
    );
    expect(screen.getByText('浅层与深层水位埋深变化（2019-2023）')).toBeInTheDocument();
  });

  it('renders recovery bar chart card', () => {
    render(
      <FunctionRecoveryTab
        recoveryChartData={sampleRecoveryChart}
        recoveryExportData={sampleRecoveryExport}
      />
    );
    expect(screen.getByText('水位累计回升量（2019-2023）')).toBeInTheDocument();
  });

  it('renders governance effectiveness card', () => {
    render(
      <FunctionRecoveryTab
        recoveryChartData={sampleRecoveryChart}
        recoveryExportData={sampleRecoveryExport}
      />
    );
    expect(screen.getByText('超采治理成效')).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════
// FunctionRestrictedTab
// ═══════════════════════════════════════════════════════
describe('FunctionRestrictedTab', () => {
  it('renders forbidden zone card', () => {
    render(<FunctionRestrictedTab />);
    expect(screen.getByText('禁止开采区')).toBeInTheDocument();
  });

  it('renders limited zone card', () => {
    render(<FunctionRestrictedTab />);
    expect(screen.getByText('限制开采区')).toBeInTheDocument();
  });

  it('renders policy card', () => {
    render(<FunctionRestrictedTab />);
    expect(screen.getByText('禁采/限采区管理政策')).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════
// FunctionZonesTab
// ═══════════════════════════════════════════════════════
describe('FunctionZonesTab', () => {
  it('renders zone classification card', () => {
    render(<FunctionZonesTab funcZoneRadar={sampleZoneRadar} />);
    expect(screen.getByText('地下水功能区划')).toBeInTheDocument();
  });

  it('renders radar chart card', () => {
    render(<FunctionZonesTab funcZoneRadar={sampleZoneRadar} />);
    expect(screen.getByText('功能区保护目标雷达')).toBeInTheDocument();
  });

  it('renders management principles card', () => {
    render(<FunctionZonesTab funcZoneRadar={sampleZoneRadar} />);
    expect(screen.getByText('功能分区管理原则')).toBeInTheDocument();
  });
});
