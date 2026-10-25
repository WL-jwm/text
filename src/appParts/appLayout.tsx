/**
 * 拆分自 App.tsx — 应用布局组件（侧栏 / 顶栏 / 移动端抽屉）
 */

import React from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import { Droplets, Menu, X, PanelLeft, PanelLeftClose, Clock } from 'lucide-react';
import { GlobalSearchEnhanced } from '../components/GlobalSearchEnhanced';
import { PrintButton } from '../components/PrintFooter';
import { ThemeToggle } from '../components/ThemeToggle';
import { LanguageToggle } from '../components/LanguageToggle';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { useI18n } from '../hooks/useI18n';
import { version as pkgVersion } from '../appVersion';
import { navGroups, NAV_I18N_KEYS, NAV_GROUP_KEYS, TOTAL_PAGES } from './appNav';

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
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

export function TopBar({ collapsed, onToggleCollapse, onOpenMobileNav }: { collapsed: boolean; onToggleCollapse: () => void; onOpenMobileNav: () => void }) {
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

export function MobileNavDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {

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
