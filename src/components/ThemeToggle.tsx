import React, { useState, useEffect, useCallback } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

type ThemeMode = 'dark' | 'light' | 'system';

// ── 主题切换组件（紧凑图标按钮） ──
export function ThemeToggle({ className = '' }: { className?: string }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem('gw-theme') as ThemeMode) || 'dark';
  });

  const applyTheme = useCallback((newMode: ThemeMode) => {
    const isDark = newMode === 'dark' || (newMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('gw-theme', newMode);
    setMode(newMode);
  }, []);

  useEffect(() => {
    applyTheme(mode);

    // 监听系统主题变化
    if (mode === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme('system');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [mode, applyTheme]);

  const cycleMode = () => {
    const next: ThemeMode = mode === 'dark' ? 'light' : mode === 'light' ? 'system' : 'dark';
    applyTheme(next);
  };

  const icon = mode === 'dark' ? Moon : mode === 'light' ? Sun : Monitor;
  const title = mode === 'dark' ? '暗色主题' : mode === 'light' ? '亮色主题' : '跟随系统';

  return (
    <button
      onClick={cycleMode}
      className={`p-1.5 rounded-lg text-gw-muted hover:text-gw-text hover:bg-gw-surface/50 border border-transparent hover:border-gw-border transition-all ${className}`}
      title={title}
    >
      {React.createElement(icon, { size: 16 })}
    </button>
  );
}
