import React from 'react';

export function TechCard({ title, children, badge, className = '', icon: CardIcon, glow }: { title?: string; children: React.ReactNode; badge?: string; className?: string; icon?: React.ElementType; glow?: boolean }) {
  return (
    <div className={`rounded-xl bg-gw-card/80 backdrop-blur-sm border border-gw-border/60 p-4 md:p-5 space-y-3 ${glow ? 'card-glow' : ''} ${className}`}>
      {(title || badge || CardIcon) && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {CardIcon && <CardIcon size={16} className="text-gw-cyan flex-shrink-0" />}
            {title && <h3 className="text-sm font-medium text-gw-text">{title}</h3>}
          </div>
          {badge && <span className="px-2 py-0.5 rounded text-[10px] bg-gw-blue/15 text-gw-cyan border border-gw-blue/20">{badge}</span>}
        </div>
      )}
      {children}
    </div>
  );
}
