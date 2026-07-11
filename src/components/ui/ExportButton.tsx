import React from 'react';

export function ExportButton({ onClick, label = '导出' }: { onClick: () => void; label?: string }) {
  return (
    <button onClick={onClick} className="px-3 py-1.5 rounded-lg text-xs bg-gw-surface/60 text-gw-muted hover:text-gw-cyan border border-gw-border/50 hover:border-gw-cyan/30 transition-all">
      {label}
    </button>
  );
}
