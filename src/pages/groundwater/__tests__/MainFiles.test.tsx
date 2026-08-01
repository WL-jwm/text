// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// ═══════════════════════════════════════════════════════
// Mocks (hoisted by vitest)
// ═══════════════════════════════════════════════════════

vi.mock('recharts', () => {
  const names = [
    'PieChart', 'Pie', 'Cell', 'ResponsiveContainer', 'Tooltip',
    'BarChart', 'Bar', 'XAxis', 'YAxis', 'CartesianGrid',
    'AreaChart', 'Area', 'Legend',
    'RadarChart', 'Radar', 'PolarGrid', 'PolarAngleAxis', 'PolarRadiusAxis',
    'LineChart', 'Line',
  ];
  type MockFC = React.FC<{ children?: React.ReactNode }>;
  const m: Record<string, MockFC> = {};
  for (const n of names) m[n] = ({ children }) => <>{children}</>;
  return m;
});

vi.mock('../../../components/UI', () => ({
  SectionTitle: ({ children }: { children?: React.ReactNode }) => <h2>{children}</h2>,
  StatCard: ({ label, value }: { label?: string; value?: string | number }) => <div><span>{label}</span><span>{String(value)}</span></div>,
  DataSourceNote: ({ children }: { children?: React.ReactNode }) => <div>数据来源：{children}</div>,
  TechCard: ({ title, children }: { title?: string; children?: React.ReactNode }) => <div><h3>{String(title ?? '')}</h3>{children}</div>,
  ChartTooltip: () => null,
}));

vi.mock('../../../components/LazyChartCard', () => ({
  LazyChartCard: ({ title, children }: { title?: string; children?: React.ReactNode }) => <div><h4>{title}</h4>{children}</div>,
}));

vi.mock('../../../components/ChartExport', () => ({
  ChartExport: () => null,
}));

vi.mock('../../../components/ExportProgressDialog', () => ({
  ExportProgressDialog: () => null,
}));

vi.mock('../../../components/CrossLink', () => ({
  CrossLinkPanel: () => <div>跨页导航</div>,
}));

vi.mock('../../../hooks/usePageCommons', () => ({
  usePageCommons: () => ({
    exportOpen: false,
    setExportOpen: vi.fn(),
    handleExport: vi.fn(),
    handleDataExport: vi.fn(),
    loading: false,
    getData: vi.fn().mockReturnValue([]),
    dataLoading: false,
  }),
}));

vi.mock('lucide-react', () => {
  const names = [
    'Activity', 'AlertCircle', 'AlertTriangle', 'ArrowDown', 'ArrowDownRight', 'ArrowDownToLine', 'ArrowLeft', 'ArrowLeftRight',
    'ArrowRight', 'ArrowRightLeft', 'ArrowUpDown', 'ArrowUpRight', 'Atom', 'Award', 'Ban', 'BarChart3',
    'BarChartHorizontal', 'Beaker', 'BellRing', 'BookMarked', 'BookOpen', 'Bookmark', 'Briefcase', 'Building',
    'Building2', 'Calculator', 'Calendar', 'CalendarDays', 'Check', 'CheckCircle', 'CheckCircle2', 'ChevronDown',
    'ChevronRight', 'ChevronUp', 'ClipboardList', 'Clock', 'CloudRain', 'Compass', 'Copy', 'CornerDownLeft',
    'Crosshair', 'Database', 'Dice5', 'Download', 'Drill', 'Droplets', 'ExternalLink', 'Eye',
    'EyeOff', 'Factory', 'FileCheck', 'FileSpreadsheet', 'FileText', 'FileWarning', 'Filter', 'Fish',
    'Flame', 'FlaskConical', 'FolderOpen', 'Gauge', 'Gem', 'GitBranch', 'GitCompare', 'GitFork',
    'GlassWater', 'Globe', 'Grid3X3', 'Grid3x3', 'HardHat', 'History', 'Home', 'Image',
    'Info', 'Keyboard', 'Layers', 'LayoutGrid', 'Leaf', 'Loader2', 'Lock', 'Map',
    'MapIcon', 'MapPin', 'Maximize2', 'Menu', 'MessageSquare', 'Minus', 'MinusCircle', 'Monitor',
    'Moon', 'Mountain', 'Navigation', 'PanelLeft', 'PanelLeftClose', 'PieChart', 'Play', 'Plus',
    'Radar', 'Radio', 'Recycle', 'RefreshCw', 'RotateCcw', 'Satellite', 'Save', 'Scale',
    'Search', 'Settings', 'Shield', 'ShieldAlert', 'ShieldCheck', 'Sliders', 'Sparkles', 'Sprout',
    'Sun', 'Table', 'Tag', 'Target', 'Thermometer', 'Timer', 'Trash2', 'TrendingDown',
    'TrendingUp', 'Trophy', 'Upload', 'Users', 'Waves', 'Wheat', 'Wifi', 'WifiOff',
    'Wind', 'Wrench', 'X', 'XCircle', 'Zap',
  ];
  const m: Record<string, () => null> = {};
  for (const n of names) m[n] = () => null;
  return m;
});

// ═══════════════════════════════════════════════════════
// Imports
// ═══════════════════════════════════════════════════════
import { GroundwaterBalance } from '../../GroundwaterBalance';
import { GroundwaterFunction } from '../../GroundwaterFunction';
import { GroundwaterBackground } from '../../GroundwaterBackground';

// ═══════════════════════════════════════════════════════
// GroundwaterBalance
// ═══════════════════════════════════════════════════════
describe('GroundwaterBalance 主文件集成', () => {
  it('renders all 6 tab buttons', () => {
    render(<GroundwaterBalance />);
    expect(screen.getByText('均衡总览')).toBeInTheDocument();
    expect(screen.getByText('各市均衡')).toBeInTheDocument();
    expect(screen.getByText('开采潜力')).toBeInTheDocument();
    expect(screen.getByText('水质评价')).toBeInTheDocument();
    expect(screen.getByText('污染评价')).toBeInTheDocument();
    expect(screen.getByText('均衡计算')).toBeInTheDocument();
  });

  it('shows overview tab by default', () => {
    render(<GroundwaterBalance />);
    expect(screen.getByText('补给项构成')).toBeInTheDocument();
    expect(screen.getByText('排泄项构成')).toBeInTheDocument();
  });

  it('switches to city tab on click', () => {
    render(<GroundwaterBalance />);
    fireEvent.click(screen.getByText('各市均衡'));
    expect(screen.getByText('各市潜水-微承压水均衡对比')).toBeInTheDocument();
  });

  it('switches to pollution tab on click', () => {
    render(<GroundwaterBalance />);
    fireEvent.click(screen.getByText('污染评价'));
    expect(screen.getByText('各市地下水污染面积分布')).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════
// GroundwaterFunction
// ═══════════════════════════════════════════════════════
describe('GroundwaterFunction 主文件集成', () => {
  it('renders all 5 tab buttons', () => {
    render(<GroundwaterFunction />);
    expect(screen.getByText('超采总览')).toBeInTheDocument();
    expect(screen.getByText('各市分布')).toBeInTheDocument();
    expect(screen.getByText('功能区划')).toBeInTheDocument();
    expect(screen.getByText('水位回升')).toBeInTheDocument();
    expect(screen.getByText('禁采/限采')).toBeInTheDocument();
  });

  it('shows overview tab by default', () => {
    render(<GroundwaterFunction />);
    expect(screen.getByText('超采区面积构成')).toBeInTheDocument();
  });

  it('switches to recovery tab on click', () => {
    render(<GroundwaterFunction />);
    fireEvent.click(screen.getByText('水位回升'));
    expect(screen.getByText('浅层与深层水位埋深变化（2019-2023）')).toBeInTheDocument();
  });

  it('switches to restricted tab on click', () => {
    render(<GroundwaterFunction />);
    fireEvent.click(screen.getByText('禁采/限采'));
    expect(screen.getByText('禁止开采区')).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════
// GroundwaterBackground
// ═══════════════════════════════════════════════════════
describe('GroundwaterBackground 主文件集成', () => {
  it('renders all 4 tab buttons', () => {
    render(<GroundwaterBackground />);
    expect(screen.getByText('背景值查询')).toBeInTheDocument();
    expect(screen.getByText('分区对比')).toBeInTheDocument();
    expect(screen.getByText('超标因子')).toBeInTheDocument();
    expect(screen.getByText('标准对照')).toBeInTheDocument();
  });

  it('shows query tab by default', () => {
    render(<GroundwaterBackground />);
    expect(screen.getByText('浅层水')).toBeInTheDocument();
    expect(screen.getByText('深层水')).toBeInTheDocument();
  });

  it('switches to standard tab on click', () => {
    render(<GroundwaterBackground />);
    fireEvent.click(screen.getByText('标准对照'));
    expect(screen.getByText('地下水质量标准限值对照')).toBeInTheDocument();
  });

  it('switches to exceed tab on click', () => {
    render(<GroundwaterBackground />);
    fireEvent.click(screen.getByText('超标因子'));
    expect(screen.getByText('各市地下水主要超标因子')).toBeInTheDocument();
  });
});
