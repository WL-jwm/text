// CollapsiblePanel — 可折叠面板容器
// 默认折叠，点击标题展开；支持 badge 和 className 透传

import React, { useState } from 'react';

interface Props {
  title: string;
  badge?: string;
  children: React.ReactNode;
  className?: string;
}

export function CollapsiblePanel({ title, badge, children, className = '' }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`rounded-xl border border-gw-surface/60 overflow-hidden ${className}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium
                   bg-gw-surface/40 hover:bg-gw-surface/70 transition-colors"
      >
        <span className="flex items-center gap-2">
          <svg
            className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-90' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gw-fg">{title}</span>
          {badge && (
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-gw-cyan/10 text-gw-cyan border border-gw-cyan/20">
              {badge}
            </span>
          )}
        </span>
        <span className="text-gw-muted text-[10px]">{open ? '收起' : '展开'}</span>
      </button>
      {open && (
        <div className="px-4 py-3 border-t border-gw-surface/40">
          {children}
        </div>
      )}
    </div>
  );
}
