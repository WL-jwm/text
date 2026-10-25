/**
 * 拆分自 App.tsx — 应用级副作用管理组件
 */

import React from 'react';
import { useLocation } from 'react-router-dom';
import { useKeyboardShortcuts, ShortcutHelpPanel } from '../components/KeyboardShortcuts';
import { useServiceWorker } from '../hooks/useServiceWorker';
import { useScrollMemory } from '../hooks/useScrollMemory';
import { useStoreInit } from '../hooks/useStoreInit';
import { preloadCommonReportGenerators } from '../services/reportGeneratorLoader';
import { preloadRoute } from '../components/PageTransition';

export function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

export function ShortcutHelper() {
  const { helpOpen, setHelpOpen } = useKeyboardShortcuts();
  useScrollMemory();
  useStoreInit();
  return <ShortcutHelpPanel open={helpOpen} onClose={() => setHelpOpen(false)} />;
}

export function PWAManager() {
  const sw = useServiceWorker();
  // SW lifecycle managed silently; updateAvailable can trigger UI later
  React.useEffect(() => {
    if (sw.updateAvailable) {
      sw.applyUpdate();
    }
  }, [sw.updateAvailable]);
  return null;
}

export function PreloadManager() {
  React.useEffect(() => {
    // 空闲时预加载常用报告生成器
    preloadCommonReportGenerators();
    // 空闲时预加载常用路由组件
    const commonRoutes: Array<{ path: string; loader: () => Promise<unknown> }> = [
      { path: '/resources', loader: () => import('../pages/Resources') },
      { path: '/water-quality', loader: () => import('../pages/WaterQuality') },
      { path: '/environment', loader: () => import('../pages/Environment') },
      { path: '/exploitation', loader: () => import('../pages/Exploitation') },
    ];
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(() => {
        commonRoutes.forEach(r => preloadRoute(r.path, r.loader));
      }, { timeout: 3000 });
    }
  }, []);
  return null;
}
