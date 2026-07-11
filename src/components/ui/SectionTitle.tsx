import React from 'react';

export function SectionTitle({ children, icon: Icon, badge }: { children: React.ReactNode; icon?: React.ElementType; badge?: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {Icon && <Icon size={18} className="text-gw-cyan" />}
      <h2 className="text-lg font-bold text-gw-text">{children}</h2>
      {badge && <span className="px-2 py-0.5 rounded text-[10px] bg-gw-blue/15 text-gw-cyan border border-gw-blue/20">{badge}</span>}
    </div>
  );
}
