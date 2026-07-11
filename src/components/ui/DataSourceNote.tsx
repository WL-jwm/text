import React from 'react';

export function DataSourceNote({ source, version }: { source: string; version?: string }) {
  return (
    <div className="text-[10px] text-gw-muted/30 flex items-center gap-2 mt-4">
      <span>数据来源: {source}</span>
      {version && <span className="px-1.5 py-0.5 rounded bg-gw-surface/40 text-gw-muted/40 font-mono">{version}</span>}
    </div>
  );
}
