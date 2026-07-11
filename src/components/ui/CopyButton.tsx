import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function CopyButton({ text, label = '复制' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={handleCopy} className="flex items-center gap-1 px-2 py-1 rounded text-[10px] text-gw-muted hover:text-gw-cyan transition-colors">
      {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
      {copied ? '已复制' : label}
    </button>
  );
}
