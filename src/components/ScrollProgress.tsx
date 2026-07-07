import React, { useState, useEffect } from 'react';

/**
 * ScrollProgress - 页面滚动进度条
 * 显示当前页面滚动百分比，在顶部显示细进度条
 */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setProgress(Math.min(100, (scrollTop / docHeight) * 100));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] h-[2px] pointer-events-none"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="页面滚动进度"
    >
      <div
        className="h-full bg-gradient-to-r from-gw-blue via-gw-cyan to-gw-blue transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%`, opacity: progress > 0 && progress < 100 ? 0.8 : 0 }}
      />
    </div>
  );
}

/**
 * BackToTop - 回到顶部按钮
 * 滚动超过一屏时显示
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.8);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-50 w-9 h-9 rounded-lg bg-gw-card/90 border border-gw-border/60 shadow-lg backdrop-blur-sm flex items-center justify-center text-gw-muted hover:text-gw-cyan hover:border-gw-blue/30 transition-all opacity-0 translate-y-2 animate-fade-in-up"
      title="回到顶部"
      aria-label="回到顶部"
      style={{ animation: 'fade-in-up 0.3s ease forwards', animationDelay: '0s' }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 15l-6-6-6 6"/>
      </svg>
    </button>
  );
}
