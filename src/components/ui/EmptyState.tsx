import React from 'react';
import { AlertTriangle } from 'lucide-react';

export function EmptyState({ message = '暂无数据' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gw-muted/40">
      <AlertTriangle size={32} className="mb-2" />
      <span className="text-sm">{message}</span>
    </div>
  );
}
