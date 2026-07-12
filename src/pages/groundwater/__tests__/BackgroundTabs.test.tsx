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
  const mocks: Record<string, React.FC<any>> = {};
  for (const name of components) {
    mocks[name] = ({ children }: any) => <>{children}</>;
  }
  return mocks;
});

vi.mock('../../../components/UI', () => ({
  TechCard: ({ title, children }: any) => (
    <div data-testid="tech-card">
      <h3>{String(title ?? '')}</h3>
      {children}
    </div>
  ),
  ChartTooltip: () => null,
}));

vi.mock('../../../components/LazyChartCard', () => ({
  LazyChartCard: ({ title, children }: any) => (
    <div data-testid="lazy-chart-card">
      <h4>{title}</h4>
      {children}
    </div>
  ),
}));

vi.mock('../../../components/ChartExport', () => ({
  ChartExport: () => null,
}));

vi.mock('lucide-react', () => ({
  Search: () => <span data-testid="icon-search">S</span>,
}));

// ── Imports ─────────────────────────────────────────────
import { BackgroundQueryTab } from '../BackgroundQueryTab';
import { BackgroundCompareTab } from '../BackgroundCompareTab';
import { BackgroundExceedTab } from '../BackgroundExceedTab';
import { BackgroundStandardTab } from '../BackgroundStandardTab';

// ═══════════════════════════════════════════════════════
// BackgroundQueryTab
// ═══════════════════════════════════════════════════════
describe('BackgroundQueryTab', () => {
  const defaultProps = {
    selectedZone: '山前平原',
    selectedLayer: 'shallow' as const,
    setSelectedZone: vi.fn(),
    setSelectedLayer: vi.fn(),
    currentZoneData: {
      zone: '山前平原',
      waterType: 'HCO₃-Ca·Mg',
      pH: '7.2-7.8',
      TDS: '<500',
      totalHardness: '150-300',
      Cl: '<50',
      SO4: '<50',
      HCO3: '200-400',
      Na: '<30',
      Ca: '40-80',
      Mg: '15-40',
      NO3: '<10',
      NO2: '<0.01',
      NH4: '<0.05',
      F: '<1.0',
      Fe: '<0.3',
      Mn: '<0.1',
      As: '-',
      Cr6: '-',
      cities: '石家庄、保定',
      note: '良好水质区',
    },
  };

  it('renders layer selector buttons', () => {
    render(<BackgroundQueryTab {...defaultProps} />);
    expect(screen.getByText('浅层水')).toBeInTheDocument();
    expect(screen.getByText('深层水')).toBeInTheDocument();
  });

  it('renders zone selector with zone name', () => {
    render(<BackgroundQueryTab {...defaultProps} />);
    expect(screen.getAllByText('山前平原').length).toBeGreaterThan(0);
  });

  it('renders current zone detail card with title', () => {
    render(<BackgroundQueryTab {...defaultProps} />);
    expect(screen.getAllByText(/山前平原/).length).toBeGreaterThan(0);
  });

  it('renders comparison card title', () => {
    render(<BackgroundQueryTab {...defaultProps} />);
    expect(screen.getByText('其他分区同层对比')).toBeInTheDocument();
  });

  it('renders water chemistry card', () => {
    render(<BackgroundQueryTab {...defaultProps} />);
    expect(screen.getByText('水化学类型与特征')).toBeInTheDocument();
  });

  it('renders nothing extra when no zone data', () => {
    render(<BackgroundQueryTab {...defaultProps} currentZoneData={undefined} />);
    expect(screen.getByText('浅层水')).toBeInTheDocument();
    expect(screen.queryByText('其他分区同层对比')).not.toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════
// BackgroundCompareTab
// ═══════════════════════════════════════════════════════
describe('BackgroundCompareTab', () => {
  const sampleRadarData = [
    { indicator: 'TDS', shallow: 450, deep: 850 },
    { indicator: '总硬度', shallow: 280, deep: 520 },
  ];

  const sampleIndicatorCompare = [
    { indicator: 'pH', shallow: 7.5, deep: 7.8, diff: 0.3 },
    { indicator: 'TDS', shallow: 450, deep: 850, diff: 400 },
  ];

  it('renders indicator comparison chart card', () => {
    render(
      <BackgroundCompareTab
        radarData={sampleRadarData}
        indicatorCompare={sampleIndicatorCompare}
        selectedLayer="shallow"
      />
    );
    expect(screen.getByText('主要指标分区对比（上限值）')).toBeInTheDocument();
  });

  it('renders radar chart card', () => {
    render(
      <BackgroundCompareTab
        radarData={sampleRadarData}
        indicatorCompare={sampleIndicatorCompare}
        selectedLayer="shallow"
      />
    );
    expect(screen.getByText('指标分布雷达图')).toBeInTheDocument();
  });

  it('renders shallow vs deep comparison card', () => {
    render(
      <BackgroundCompareTab
        radarData={sampleRadarData}
        indicatorCompare={sampleIndicatorCompare}
        selectedLayer="shallow"
      />
    );
    expect(screen.getByText('浅层 vs 深层背景值对比')).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════
// BackgroundExceedTab
// ═══════════════════════════════════════════════════════
describe('BackgroundExceedTab', () => {
  const sampleCities = [
    { city: '石家庄', factors: ['TDS', 'F'], exceedCount: 2 },
    { city: '保定', factors: ['NO3'], exceedCount: 1 },
  ];

  it('renders exceed factor table card', () => {
    render(
      <BackgroundExceedTab
        filteredCities={sampleCities}
        citySearch=""
        expandedCity={null}
        setExpandedCity={vi.fn()}
      />
    );
    expect(screen.getByText('各市地下水主要超标因子')).toBeInTheDocument();
  });

  it('renders city names from data', () => {
    render(
      <BackgroundExceedTab
        filteredCities={sampleCities}
        citySearch=""
        expandedCity={null}
        setExpandedCity={vi.fn()}
      />
    );
    expect(screen.getByText('石家庄')).toBeInTheDocument();
    expect(screen.getByText('保定')).toBeInTheDocument();
  });

  it('renders zone analysis card', () => {
    render(
      <BackgroundExceedTab
        filteredCities={sampleCities}
        citySearch=""
        expandedCity={null}
        setExpandedCity={vi.fn()}
      />
    );
    expect(screen.getByText('超标因子区域特征分析')).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════
// BackgroundStandardTab
// ═══════════════════════════════════════════════════════
describe('BackgroundStandardTab', () => {
  it('renders standard reference card', () => {
    render(<BackgroundStandardTab />);
    expect(screen.getByText('地下水质量标准限值对照')).toBeInTheDocument();
  });

  it('renders quality classification card', () => {
    render(<BackgroundStandardTab />);
    expect(screen.getByText('质量分类说明')).toBeInTheDocument();
  });
});
