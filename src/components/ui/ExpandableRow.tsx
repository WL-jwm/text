import React, { useState } from 'react';

export function ExpandableRow({
  label,
  summary,
  detail,
  defaultExpanded = false,
}: {
  label: string;
  summary: string;
  detail: React.ReactNode;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="border border-gw-border/30 rounded-lg mb-2 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gw-surface/50 hover:bg-gw-accent/5 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className={`text-gw-accent transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}>
            ▶
          </span>
          <span className="font-medium text-gw-text">{label}</span>
          <span className="text-xs text-gw-muted">{summary}</span>
        </div>
      </button>
      {expanded && (
        <div className="px-4 py-3 border-t border-gw-border/20 bg-gw-surface/30 animate-fadeIn">
          {detail}
        </div>
      )}
    </div>
  );
}
