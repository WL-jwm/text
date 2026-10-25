import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Droplets } from 'lucide-react';
import { useI18n } from './hooks/useI18n';
import { version as pkgVersion } from './appVersion';
import { navGroups, NAV_I18N_KEYS, NAV_GROUP_KEYS, TOTAL_PAGES } from './appParts/appNav';
import { TopBar, MobileNavDrawer } from './appParts/appLayout';
import { ScrollToTop, ShortcutHelper, PWAManager, PreloadManager } from './appParts/appManagers';
import {
  Overview, Resources, WaterQuality, Environment, Exploitation, Hydrochemistry,
  Geology, HydroZoneParams, WaterSource, Geothermal, MineralWater, SalineWater,
  SalineSoil, MineHydrogeology, KarstWater, FractureWater, SystemZoning, Changelog,
  NotFound, MapView, DataInsight, Workspace, CountyWaterCompare, GroundwaterFunction,
  HydrogeologyHistorical, GroundwaterBalance, GroundwaterBackground, TimeSeriesAnalysis,
  SpatialAnalysis, Visualization,
} from './appParts/appRoutes';
import { PrintFooter } from './components/PrintFooter';
import { PrintPageHeader } from './components/PrintPageHeader';
import { ToastProvider } from './components/Toast';
import OfflineBanner from './components/OfflineBanner';
import InstallPrompt from './components/InstallPrompt';
import { PageTransition, PageLoader } from './components/PageTransition';
import { ScrollProgress, BackToTop } from './components/ScrollProgress';
import { ErrorBoundary } from './components/ErrorBoundary';
import { MobileBottomNav } from './components/mobile/MobileBottomNav';

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
