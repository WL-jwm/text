/**
 * 数据质量仪表盘 — 状态/级别图标工具（拆分自 DataQualityDashboard.tsx）
 */

import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

export   const statusIcon = (status: string) => {
    if (status === 'ok') return <CheckCircle size={14} className="text-emerald-400" />;
    if (status === 'warning') return <AlertTriangle size={14} className="text-amber-400" />;
    return <XCircle size={14} className="text-red-400" />;
  };

export   const levelIcon = (level: string) => {
    if (level === 'error') return <XCircle size={14} className="text-red-400" />;
    if (level === 'warning') return <AlertTriangle size={14} className="text-amber-400" />;
    return <Info size={14} className="text-blue-400" />;
  };

export   const levelColor = (level: string) => {
    if (level === 'error') return 'text-red-400';
    if (level === 'warning') return 'text-amber-400';
    return 'text-blue-400';
  };

export   const levelBg = (level: string) => {
    if (level === 'error') return 'bg-red-500/5 border-red-500/10';
    if (level === 'warning') return 'bg-amber-500/5 border-amber-500/10';
    return 'bg-blue-500/5 border-blue-500/10';
  };
