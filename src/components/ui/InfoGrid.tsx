import React from 'react';

export function InfoGrid({
  items,
  columns = 2,
}: {
  items: { label: string; value: React.ReactNode; highlight?: boolean }[];
  columns?: 2 | 3 | 4;
}) {
  const gridCols = columns === 4 ? 'grid-cols-4' : columns === 3 ? 'grid-cols-3' : 'grid-cols-2';
  return (
    <div className={`grid ${gridCols} gap-x-6 gap-y-2`}>
      {items.map((item, i) => (
        <div key={i}>
          <div className="text-[10px] text-gw-muted">{item.label}</div>
          <div className={`text-sm ${item.highlight ? 'text-gw-accent font-medium' : 'text-gw-text'}`}>
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}
