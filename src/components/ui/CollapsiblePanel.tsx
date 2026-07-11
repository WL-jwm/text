import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function CollapsiblePanel({ title, children, defaultOpen = false, icon, badge, className = '' }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
  icon?: React.ElementType; badge?: string; className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const IconComp = icon;
  return (
    <div className={`rounded-xl bg-gw-card/80 backdrop-blur-sm border border-gw-border/60 overflow-hidden ${className}`}>
      <button onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 flex items-center justify-between text-sm text-gw-text hover:bg-gw-surface/40 transition-colors group">
        <span className="flex items-center gap-2 font-medium">
          {IconComp && <IconComp size={15} className="text-gw-cyan/70" />}
          {title}
          {badge && <span className="px-1.5 py-0.5 rounded text-[10px] bg-gw-blue/15 text-gw-highlight border border-gw-blue/20">{badge}</span>}
        </span>
        <ChevronDown size={16} className={`text-gw-muted fold-toggle ${open ? '' : 'fold-closed'}`} />
      </button>
      <div className={`collapse-content ${open ? 'collapse-open' : 'collapse-closed'}`}>
        <div className="px-4 pb-4 space-y-3">{children}</div>
      </div>
    </div>
  );
}
