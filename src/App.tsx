import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { GlobalSearchEnhanced } from './components/GlobalSearchEnhanced';
import { PrintFooter, PrintButton } from './components/PrintFooter';
import { useKeyboardShortcuts, ShortcutHelpPanel } from './components/KeyboardShortcuts';
import { PrintPageHeader } from './components/PrintPageHeader';
import { ThemeToggle } from './components/ThemeToggle';
import { LanguageToggle } from './components/LanguageToggle';
import { useI18n } from './hooks/useI18n';
import { ToastProvider } from './components/Toast';
import OfflineBanner from './components/OfflineBanner';
import InstallPrompt from './components/InstallPrompt';
import { useServiceWorker } from './hooks/useServiceWorker';
import { useScrollMemory } from './hooks/useScrollMemory';
import { useStoreInit } from './hooks/useStoreInit';
import { preloadCommonReportGenerators } from './services/reportGeneratorLoader';
import { PageTransition, PageLoader, preloadRoute } from './components/PageTransition';
import { ScrollProgress, BackToTop } from './components/ScrollProgress';
import { Breadcrumbs } from './components/Breadcrumbs';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Database, Droplets, FlaskConical, AlertTriangle, Wrench, Waves, Mountain, Layers, History, Thermometer, Gem, MapPin, PanelLeftClose, PanelLeft, Clock, Menu, X, BarChart3, Briefcase, Ban, Scale, TrendingDown } from 'lucide-react';
import { MobileBottomNav } from './components/mobile/MobileBottomNav';
import { version as pkgVersion } from '../package.json';

// ── Route lazy loading：19个页面组件按需加载 ──
const Overview = React.lazy(() => import('./pages/Overview').then(m => ({ default: m.Overview })));
const Resources = React.lazy(() => import('./pages/Resources').then(m => ({ default: m.Resources })));
const WaterQuality = React.lazy(() => import('./pages/WaterQuality').then(m => ({ default: m.WaterQuality })));
const Environment = React.lazy(() => import('./pages/Environment').then(m => ({ default: m.Environment })));
const Exploitation = React.lazy(() => import('./pages/Exploitation').then(m => ({ default: m.Exploitation })));
const Hydrochemistry = React.lazy(() => import('./pages/Hydrochemistry').then(m => ({ default: m.Hydrochemistry })));
const Geology = React.lazy(() => import('./pages/Geology').then(m => ({ default: m.Geology })));
const HydroZoneParams = React.lazy(() => import('./pages/HydroZoneParams').then(m => ({ default: m.HydroZoneParams })));
const WaterSource = React.lazy(() => import('./pages/WaterSource').then(m => ({ default: m.WaterSource })));
const Geothermal = React.lazy(() => import('./pages/Geothermal').then(m => ({ default: m.Geothermal })));
const MineralWater = React.lazy(() => import('./pages/MineralWater').then(m => ({ default: m.MineralWater })));
const SalineWater = React.lazy(() => import('./pages/SalineWater').then(m => ({ default: m.SalineWater })));
const SalineSoil = React.lazy(() => import('./pages/SalineSoil').then(m => ({ default: m.SalineSoil })));
const MineHydrogeology = React.lazy(() => import('./pages/MineHydrogeology').then(m => ({ default: m.MineHydrogeology })));
const KarstWater = React.lazy(() => import('./pages/KarstWater').then(m => ({ default: m.KarstWater })));
const FractureWater = React.lazy(() => import('./pages/FractureWater').then(m => ({ default: m.FractureWater })));
const SystemZoning = React.lazy(() => import('./pages/SystemZoning').then(m => ({ default: m.SystemZoning })));
const Changelog = React.lazy(() => import('./pages/Changelog').then(m => ({ default: m.Changelog })));
const NotFound = React.lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));
const MapView = React.lazy(() => import('./pages/MapView').then(m => ({ default: m.MapView })));
const DataInsight = React.lazy(() => import('./pages/DataInsight').then(m => ({ default: m.DataInsight })));
const Workspace = React.lazy(() => import('./pages/Workspace').then(m => ({ default: m.Workspace })));
const CountyWaterCompare = React.lazy(() => import('./pages/CountyWaterCompare').then(m => ({ default: m.CountyWaterCompare })));
const GroundwaterFunction = React.lazy(() => import('./pages/GroundwaterFunction').then(m => ({ default: m.GroundwaterFunction })));
const HydrogeologyHistorical = React.lazy(() => import('./pages/HydrogeologyHistorical').then(m => ({ default: m.HydrogeologyHistorical })));
const GroundwaterBalance = React.lazy(() => import('./pages/GroundwaterBalance').then(m => ({ default: m.GroundwaterBalance })));
const GroundwaterBackground = React.lazy(() => import('./pages/GroundwaterBackground').then(m => ({ default: m.GroundwaterBackground })));
const TimeSeriesAnalysis = React.lazy(() => import('./pages/TimeSeriesAnalysis').then(m => ({ default: m.TimeSeriesAnalysis })));
const SpatialAnalysis = React.lazy(() => import('./pages/SpatialAnalysis').then(m => ({ default: m.SpatialAnalysis })));
const Visualization = React.lazy(() => import('./pages/Visualization').then(m => ({ default: m.Visualization })));

// PageLoader 已提取到 PageTransition 组件中

const navGroups = [
  {
    label: '基础数据',
    items: [
      { path: '/', label: '总览', icon: Database, description: '数据驾驶舱 / KPI看板' },
      { path: '/system-zoning', label: '系统区划', icon: Layers, description: '地下水系统 / 含水系统 / 流动系统' },
      { path: '/geology', label: '基础地质', icon: Mountain, description: '地质构造 / 地层岩性' },
      { path: '/map', label: '空间地图', icon: MapPin, description: '天地图 / 系统区划 / 泉域 / 地热田' },
    ],
  },
  {
    label: '水文地质',
    items: [
      { path: '/hydro-zone-params', label: '水文地质参数', icon: Layers, description: '含水层组 / 渗透系数 / 给水度' },
      { path: '/water-source', label: '水源地蓄水构造', icon: Droplets, description: '岩溶盆地 / 山间盆地 / 冲洪积扇 / 古河道' },
      { path: '/karst-water', label: '岩溶水', icon: Waves, description: '泉域 / 岩溶分区' },
      { path: '/fracture-water', label: '裂隙水', icon: Mountain, description: '风化带 / 构造 / 层间裂隙水' },
    ],
  },
  {
    label: '资源与环境',
    items: [
      { path: '/resources', label: '水资源量', icon: Droplets, description: '供水结构 / 资源时序 / 各市排名' },
      { path: '/county-compare', label: '县级数据对比', icon: MapPin, description: '5市85县用水结构 / 供水分析 / 跨市排行' },
      { path: '/water-quality', label: '水质评价', icon: FlaskConical, description: '国考水质 / 污染程度 / 工业用水评价' },
      { path: '/environment', label: '环境地质', icon: AlertTriangle, description: '地下水漏斗 / 地面沉降' },
      { path: '/exploitation', label: '开采管理', icon: Wrench, description: '超采治理 / 开采量控制' },
      { path: '/groundwater-function', label: '超采区划', icon: Ban, description: '超采区分布 / 功能区划 / 禁采限采' },
      { path: '/hydrogeology-historical', label: '历史参数', icon: Database, description: '泉水数据库 / 含水层参数 / 工程地质' },
      { path: '/groundwater-balance', label: '地下水均衡', icon: Scale, description: '水均衡 / 开采潜力 / 水质污染评价' },
      { path: '/groundwater-background', label: '环境背景值', icon: FlaskConical, description: '分区背景值 / 超标因子 / 标准对照' },
      { path: '/hydrochemistry', label: '水化学/咸水', icon: Waves, description: '水化学特征 / 咸水分布' },
    ],
  },
  {
    label: '专题资源',
    items: [
      { path: '/geothermal', label: '地热资源', icon: Thermometer, description: '地热田 / 利用现状 / 热流值' },
      { path: '/mineral-water', label: '矿泉水', icon: Gem, description: '产地 / 水质类型 / 开发状况' },
      { path: '/saline-soil', label: '盐碱土', icon: MapPin, description: '分布 / 类型 / 改良措施' },
      { path: '/mine-hydrogeology', label: '矿床水文地质', icon: Mountain, description: '矿区涌水 / 充水水源' },
    ],
  },
  {
    label: '综合分析',
    items: [
      { path: '/data-insight', label: '数据洞察', icon: BarChart3, description: '跨模块关联分析 / 区域对比' },
      { path: '/time-series', label: '时间序列', icon: TrendingDown, description: '2014-2024年多维度变化趋势' },
      { path: '/spatial', label: '空间分析', icon: Layers, description: '多维度自相关 / 分区特征 / 异常检测' },
      { path: '/visualization', label: '可视化中心', icon: BarChart3, description: '交互地图 / 含水层剖面 / Piper三线图 / 仪表盘' },
    ],
  },
  {
    label: '系统',
    items: [
      { path: '/workspace', label: '个人工作台', icon: Briefcase, description: '数据导入 / 标注 / 收藏 / 校验' },
      { path: '/changelog', label: '变更日志', icon: History, description: '版本记录 / 数据来源' },
    ],
  },
];

// Flat lookup for breadcrumb
const pageMeta: Record<string, { label: string; group: string }> = {};
navGroups.forEach(g => g.items.forEach(i => {
  pageMeta[i.path] = { label: i.label, group: g.label };
}));

// navGroups 28 + saline-water(1) + NotFound(1) = 30 pages
const TOTAL_PAGES = navGroups.reduce((n, g) => n + g.items.length, 0) + 2;

// ── i18n 导航键映射（path → i18n key）──
const NAV_I18N_KEYS: Record<string, { label: string; desc: string }> = {
  '/': { label: 'nav.page.overview', desc: 'nav.page.overview.desc' },
  '/system-zoning': { label: 'nav.page.system-zoning', desc: 'nav.page.system-zoning.desc' },
  '/geology': { label: 'nav.page.geology', desc: 'nav.page.geology.desc' },
  '/map': { label: 'nav.page.map', desc: 'nav.page.map.desc' },
  '/hydro-zone-params': { label: 'nav.page.hydro-zone-params', desc: 'nav.page.hydro-zone-params.desc' },
  '/water-source': { label: 'nav.page.water-source', desc: 'nav.page.water-source.desc' },
  '/karst-water': { label: 'nav.page.karst-water', desc: 'nav.page.karst-water.desc' },
  '/fracture-water': { label: 'nav.page.fracture-water', desc: 'nav.page.fracture-water.desc' },
  '/resources': { label: 'nav.page.resources', desc: 'nav.page.resources.desc' },
  '/county-compare': { label: 'nav.page.county-compare', desc: 'nav.page.county-compare.desc' },
  '/water-quality': { label: 'nav.page.water-quality', desc: 'nav.page.water-quality.desc' },
  '/environment': { label: 'nav.page.environment', desc: 'nav.page.environment.desc' },
  '/exploitation': { label: 'nav.page.exploitation', desc: 'nav.page.exploitation.desc' },
  '/groundwater-function': { label: 'nav.page.groundwater-function', desc: 'nav.page.groundwater-function.desc' },
  '/hydrogeology-historical': { label: 'nav.page.hydrogeology-historical', desc: 'nav.page.hydrogeology-historical.desc' },
  '/groundwater-balance': { label: 'nav.page.groundwater-balance', desc: 'nav.page.groundwater-balance.desc' },
  '/groundwater-background': { label: 'nav.page.groundwater-background', desc: 'nav.page.groundwater-background.desc' },
  '/hydrochemistry': { label: 'nav.page.hydrochemistry', desc: 'nav.page.hydrochemistry.desc' },
  '/geothermal': { label: 'nav.page.geothermal', desc: 'nav.page.geothermal.desc' },
  '/mineral-water': { label: 'nav.page.mineral-water', desc: 'nav.page.mineral-water.desc' },
  '/saline-soil': { label: 'nav.page.saline-soil', desc: 'nav.page.saline-soil.desc' },
  '/mine-hydrogeology': { label: 'nav.page.mine-hydrogeology', desc: 'nav.page.mine-hydrogeology.desc' },
  '/data-insight': { label: 'nav.page.data-insight', desc: 'nav.page.data-insight.desc' },
  '/time-series': { label: 'nav.page.time-series', desc: 'nav.page.time-series.desc' },
  '/spatial': { label: 'nav.page.spatial', desc: 'nav.page.spatial.desc' },
  '/visualization': { label: 'nav.page.visualization', desc: 'nav.page.visualization.desc' },
  '/workspace': { label: 'nav.page.workspace', desc: 'nav.page.workspace.desc' },
  '/changelog': { label: 'nav.page.changelog', desc: 'nav.page.changelog.desc' },
};

const NAV_GROUP_KEYS: Record<number, string> = {
  0: 'nav.group.basic',
  1: 'nav.group.hydro',
  2: 'nav.group.resource',
  3: 'nav.group.special',
  4: 'nav.group.analysis',
  5: 'nav.group.system',
};

// ── 侧栏导航内容（桌面+移动端复用） ──
function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useI18n();
  return (
    <>
      <div className="p-4 border-b border-gw-border/60 flex items-center gap-3 h-14">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gw-blue to-gw-cyan flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
          <Droplets size={18} className="text-white" />
        </div>
        <div className="overflow-hidden">
          <h1 className="text-sm font-bold text-gw-text truncate">河北地下水</h1>
          <p className="text-[10px] text-gw-muted truncate">基础资料数据库</p>
        </div>
      </div>

      <nav aria-label="移动端导航" className="flex-1 py-2 px-2 space-y-3 overflow-y-auto scrollbar-thin">
        {navGroups.map((group, gi) => {
          const groupKey = NAV_GROUP_KEYS[gi];
          return (
          <div key={group.label}>
            <p className="text-[10px] text-gw-muted/50 uppercase tracking-wider px-3 mb-1.5 font-medium">
              {groupKey ? t(groupKey, group.label) : group.label}
            </p>
            {group.items.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all duration-200 group ${
                    isActive
                      ? 'bg-gw-blue/15 text-gw-highlight border border-gw-blue/30 shadow-[0_0_8px_rgba(59,130,246,0.1)]'
                      : 'text-gw-muted hover:text-gw-text hover:bg-gw-surface/50 border border-transparent'
                  }`
                }
              >
                <item.icon size={16} className="flex-shrink-0" />
                <span className="truncate">{NAV_I18N_KEYS[item.path] ? t(NAV_I18N_KEYS[item.path].label, item.label) : item.label}</span>
              </NavLink>
            ))}
          </div>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-gw-border/40 text-[10px] text-gw-muted/40 font-mono">
        {`v${pkgVersion} | ${TOTAL_PAGES} Pages | PWA`}
      </div>
    </>
  );
}

// ── 顶部栏组件 ──
function TopBar({ collapsed, onToggleCollapse, onOpenMobileNav }: { collapsed: boolean; onToggleCollapse: () => void; onOpenMobileNav: () => void }) {
  const _location = useLocation();
  const now = new Date();
  const timeStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return (
    <header role="banner" className="sticky top-0 z-40 bg-gw-card/80 backdrop-blur-md border-b border-gw-border/60">
      <div className="flex items-center gap-2 sm:gap-4 px-3 sm:px-5 py-3">
        {/* 移动端汉堡菜单 */}
        <button onClick={onOpenMobileNav} className="p-1.5 rounded-lg text-gw-muted hover:text-gw-text hover:bg-gw-surface/50 border border-transparent hover:border-gw-border transition-all md:hidden" title="打开导航">
          <Menu size={18} />
        </button>

        {/* 桌面端折叠按钮 */}
        <button onClick={onToggleCollapse} className="hidden md:block p-1.5 rounded-lg text-gw-muted hover:text-gw-text hover:bg-gw-surface/50 border border-transparent hover:border-gw-border transition-all" title={collapsed ? '展开侧栏' : '收起侧栏'}>
          {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </button>

        {/* 面包屑 */}
        <Breadcrumbs />

        {/* 弹性空间 */}
        <div className="flex-1" />

        {/* 搜索框 - 桌面端 */}
        <div className="w-72 hidden md:block">
          <GlobalSearchEnhanced placeholder="搜索参数、区域、指标... (Ctrl+K)" />
        </div>

        {/* 语言 + 主题切换 - 移动端 */}
        <div className="md:hidden flex items-center gap-1">
          <LanguageToggle />
          <ThemeToggle />
        </div>

        {/* 移动端搜索按钮 - 点击触发搜索面板 */}
        <button onClick={() => {
          const event = new CustomEvent('open-mobile-search');
          window.dispatchEvent(event);
        }} className="md:hidden p-1.5 rounded-lg text-gw-muted hover:text-gw-text transition-colors" title="搜索" aria-label="打开搜索">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </button>

        {/* 语言 + 主题切换 - 桌面端 */}
        <div className="hidden lg:flex items-center gap-1">
          <LanguageToggle />
          <ThemeToggle />
        </div>

        {/* 时间 + 打印 - 桌面端 */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[10px] text-gw-muted/40 font-mono">
            <Clock size={11} />
            {timeStr}
          </div>
          <PrintButton />
        </div>
      </div>
    </header>
  );
}

// ── 移动端导航抽屉 ──
function MobileNavDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {

  if (!open) return null;

  const handleNavigate = () => {
    onClose();
  };

  return (
    <div className="md:hidden" role="dialog" aria-modal="true" aria-label="导航菜单">
      {/* 遮罩层 */}
      <div className="mobile-nav-overlay" onClick={onClose} />
      {/* 抽屉 */}
      <div className="mobile-nav-drawer">
        {/* 关闭按钮 */}
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg text-gw-muted hover:text-gw-text z-10">
          <X size={18} />
        </button>
        <SidebarNav onNavigate={handleNavigate} />
      </div>
    </div>
  );
}


// ── ScrollToTop: 路由切换时自动滚动到顶部 ──
function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}
// ── 快捷键帮助面板 ──
function ShortcutHelper() {
  const { helpOpen, setHelpOpen } = useKeyboardShortcuts();
  useScrollMemory();
  useStoreInit();
  return <ShortcutHelpPanel open={helpOpen} onClose={() => setHelpOpen(false)} />;
}

// ── PWA状态管理 ──
function PWAManager() {
  const sw = useServiceWorker();
  // SW lifecycle managed silently; updateAvailable can trigger UI later
  React.useEffect(() => {
    if (sw.updateAvailable) {
      sw.applyUpdate();
    }
  }, [sw.updateAvailable]);
  return null;
}

// ── 空闲时预加载常用报告生成器 ──
function PreloadManager() {
  React.useEffect(() => {
    // 空闲时预加载常用报告生成器
    preloadCommonReportGenerators();
    // 空闲时预加载常用路由组件
    const commonRoutes: Array<{ path: string; loader: () => Promise<unknown> }> = [
      { path: '/resources', loader: () => import('./pages/Resources') },
      { path: '/water-quality', loader: () => import('./pages/WaterQuality') },
      { path: '/environment', loader: () => import('./pages/Environment') },
      { path: '/exploitation', loader: () => import('./pages/Exploitation') },
    ];
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(() => {
        commonRoutes.forEach(r => preloadRoute(r.path, r.loader));
      }, { timeout: 3000 });
    }
  }, []);
  return null;
}

export default function App() {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const { t } = useI18n();

  return (
    <BrowserRouter>
      <ToastProvider>
            <ScrollToTop />
      <ShortcutHelper />
      <PWAManager />
      <PreloadManager />
      <ScrollProgress />
      <OfflineBanner />
      <InstallPrompt />
      <BackToTop />
      <div className="water-bg" />
      {/* 跳过导航 - 无障碍 */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-gw-blue focus:text-white focus:text-sm focus:shadow-lg focus:outline-none">
        跳转到主内容
      </a>
      <div className="relative z-10 flex min-h-screen">
        {/* 桌面端侧栏 */}
        <aside role="navigation" aria-label="主导航" className={`hidden md:flex sticky top-0 h-screen bg-gw-card/90 backdrop-blur-md border-r border-gw-border/60 flex-col transition-all duration-300 ${collapsed ? 'w-14' : 'w-56'}`}>
          {collapsed ? (
            <div className="p-4 border-b border-gw-border/60 flex items-center justify-center h-14">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gw-blue to-gw-cyan flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                <Droplets size={18} className="text-white" />
              </div>
            </div>
          ) : (
            <div className="p-4 border-b border-gw-border/60 flex items-center gap-3 h-14">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gw-blue to-gw-cyan flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                <Droplets size={18} className="text-white" />
              </div>
              <div className="overflow-hidden">
                <h1 className="text-sm font-bold text-gw-text truncate">河北地下水</h1>
                <p className="text-[10px] text-gw-muted truncate">基础资料数据库</p>
              </div>
            </div>
          )}

          <nav aria-label="侧栏导航" className="flex-1 py-2 px-2 space-y-3 overflow-y-auto scrollbar-thin">
            {navGroups.map((group, gi) => (
              <div key={group.label}>
                {!collapsed && (
                  <p className="text-[10px] text-gw-muted/50 uppercase tracking-wider px-3 mb-1.5 font-medium">
                    {NAV_GROUP_KEYS[gi] ? t(NAV_GROUP_KEYS[gi], group.label) : group.label}
                  </p>
                )}
                {group.items.map(item => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    title={collapsed ? (NAV_I18N_KEYS[item.path] ? t(NAV_I18N_KEYS[item.path].label, item.label) : item.label) : undefined}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all duration-200 group ${
                        isActive
                          ? 'bg-gw-blue/15 text-gw-highlight border border-gw-blue/30 shadow-[0_0_8px_rgba(59,130,246,0.1)]'
                          : 'text-gw-muted hover:text-gw-text hover:bg-gw-surface/50 border border-transparent'
                      }`
                    }
                  >
                    <item.icon size={16} className="flex-shrink-0" />
                    {!collapsed && <span className="truncate">{NAV_I18N_KEYS[item.path] ? t(NAV_I18N_KEYS[item.path].label, item.label) : item.label}</span>}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>

          {!collapsed && (
            <div className="px-4 py-3 border-t border-gw-border/40 text-[10px] text-gw-muted/40 font-mono">
              {`v${pkgVersion} | ${TOTAL_PAGES} Pages | PWA`}
            </div>
          )}
        </aside>

        {/* 移动端导航抽屉 */}
        <MobileNavDrawer open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

        {/* 主内容区 */}
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed(!collapsed)}
            onOpenMobileNav={() => setMobileNavOpen(true)}
          />
    

      <main id="main-content" role="main" className="flex-1 min-w-0">
            <PrintPageHeader />
            <PageTransition>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<ErrorBoundary><Overview /></ErrorBoundary>} />
                  <Route path="/resources" element={<ErrorBoundary><Resources /></ErrorBoundary>} />
                  <Route path="/water-quality" element={<ErrorBoundary><WaterQuality /></ErrorBoundary>} />
                  <Route path="/environment" element={<ErrorBoundary><Environment /></ErrorBoundary>} />
                  <Route path="/exploitation" element={<ErrorBoundary><Exploitation /></ErrorBoundary>} />
                  <Route path="/groundwater-function" element={<ErrorBoundary><GroundwaterFunction /></ErrorBoundary>} />
                  <Route path="/hydrogeology-historical" element={<ErrorBoundary><HydrogeologyHistorical /></ErrorBoundary>} />
                  <Route path="/groundwater-balance" element={<ErrorBoundary><GroundwaterBalance /></ErrorBoundary>} />
                  <Route path="/groundwater-background" element={<ErrorBoundary><GroundwaterBackground /></ErrorBoundary>} />
                  <Route path="/hydrochemistry" element={<ErrorBoundary><Hydrochemistry /></ErrorBoundary>} />
                  <Route path="/geology" element={<ErrorBoundary><Geology /></ErrorBoundary>} />
                  <Route path="/hydro-zone-params" element={<ErrorBoundary><HydroZoneParams /></ErrorBoundary>} />
                  <Route path="/water-source" element={<ErrorBoundary><WaterSource /></ErrorBoundary>} />
                  <Route path="/geothermal" element={<ErrorBoundary><Geothermal /></ErrorBoundary>} />
                  <Route path="/mineral-water" element={<ErrorBoundary><MineralWater /></ErrorBoundary>} />
                  <Route path="/saline-water" element={<ErrorBoundary><SalineWater /></ErrorBoundary>} />
                  <Route path="/saline-soil" element={<ErrorBoundary><SalineSoil /></ErrorBoundary>} />
                  <Route path="/mine-hydrogeology" element={<ErrorBoundary><MineHydrogeology /></ErrorBoundary>} />
                  <Route path="/karst-water" element={<ErrorBoundary><KarstWater /></ErrorBoundary>} />
                  <Route path="/fracture-water" element={<ErrorBoundary><FractureWater /></ErrorBoundary>} />
                  <Route path="/map" element={<ErrorBoundary><MapView /></ErrorBoundary>} />
                  <Route path="/data-insight" element={<ErrorBoundary><DataInsight /></ErrorBoundary>} />
                  <Route path="/time-series" element={<ErrorBoundary><TimeSeriesAnalysis /></ErrorBoundary>} />
                  <Route path="/spatial" element={<ErrorBoundary><SpatialAnalysis /></ErrorBoundary>} />
                  <Route path="/visualization" element={<ErrorBoundary><Visualization /></ErrorBoundary>} />
                  <Route path="/system-zoning" element={<ErrorBoundary><SystemZoning /></ErrorBoundary>} />
                  <Route path="/workspace" element={<ErrorBoundary><Workspace /></ErrorBoundary>} />
                  <Route path="/county-compare" element={<ErrorBoundary><CountyWaterCompare /></ErrorBoundary>} />
                  <Route path="/changelog" element={<ErrorBoundary><Changelog /></ErrorBoundary>} />
                  <Route path="*" element={<ErrorBoundary><NotFound /></ErrorBoundary>} />
                </Routes>
              </Suspense>
            </PageTransition>
          </main>
          <PrintFooter />
        </div>
      </div>
      <MobileBottomNav />
      </ToastProvider>
    </BrowserRouter>
  );
}
