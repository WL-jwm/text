import React, { Suspense } from 'react';

const DataInsightInner = React.lazy(() => import('./DataInsightInner').then(m => ({ default: m.DataInsightInner })));

export function DataInsight() {
  return (
    <Suspense fallback={
      <div className="p-3 md:p-6 max-w-[1440px] mx-auto space-y-4 animate-pulse">
        <div className="h-6 bg-gw-border/30 rounded w-40 mb-2" />
        <div className="h-4 bg-gw-border/20 rounded w-60 mb-4" />
        <div className="flex gap-2 mb-4">
          {[120, 100, 90, 80, 100].map((w, i) => (
            <div key={i} className="h-8 bg-gw-border/20 rounded-lg" style={{ width: w }} />
          ))}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-gw-card/60 border border-gw-border/30 rounded-xl p-4">
              <div className="h-3 bg-gw-border/30 rounded w-16 mb-3" />
              <div className="h-6 bg-gw-border/20 rounded w-20" />
            </div>
          ))}
        </div>
        <div className="bg-gw-card/60 border border-gw-border/30 rounded-xl p-4">
          <div className="h-3 bg-gw-border/30 rounded w-1/3 mb-4" />
          <div className="flex items-end justify-around gap-2" style={{ height: 200 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex-1 bg-gw-border/20 rounded-t-sm" style={{ height: `${30 + Math.sin(i * 0.8) * 25 + Math.cos(i * 1.3) * 15}%` }} />
            ))}
          </div>
        </div>
      </div>
    }>
      <DataInsightInner />
    </Suspense>
  );
}
