import React, { useState, useCallback, createContext, useContext } from 'react';
import { CheckCircle, XCircle, Info, X, AlertTriangle } from 'lucide-react';

// ── Toast类型 ──
type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
  duration?: number;
}

// ── Toast上下文 ──
interface ToastContextValue {
  toast: (type: ToastType, message: string, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

// ── Toast图标映射 ──
const toastIcons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={14} className="text-gw-green" />,
  error: <XCircle size={14} className="text-gw-red" />,
  info: <Info size={14} className="text-gw-blue" />,
  warning: <AlertTriangle size={14} className="text-gw-amber" />,
};

const toastBorderColors: Record<ToastType, string> = {
  success: 'border-l-gw-green',
  error: 'border-l-gw-red',
  info: 'border-l-gw-blue',
  warning: 'border-l-gw-amber',
};

// ── Toast Provider ──
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  let nextId = 0;

  const addToast = useCallback((type: ToastType, message: string, duration = 3000) => {
    const id = ++nextId;
    setToasts(prev => [...prev, { id, type, message, duration }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const ctxValue: ToastContextValue = {
    toast: addToast,
    success: (msg) => addToast('success', msg),
    error: (msg) => addToast('error', msg, 5000),
    info: (msg) => addToast('info', msg),
    warning: (msg) => addToast('warning', msg, 4000),
  };

  return (
    <ToastContext.Provider value={ctxValue}>
      {children}
      {/* Toast容器 */}
      <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-lg bg-gw-card border border-gw-border/60 border-l-[3px] ${toastBorderColors[t.type]} shadow-lg animate-in fade-in slide-in-from-right-5 duration-200 max-w-sm`}
            role="alert"
          >
            {toastIcons[t.type]}
            <span className="text-xs text-gw-text flex-1">{t.message}</span>
            <button onClick={() => removeToast(t.id)} className="p-0.5 rounded text-gw-muted/50 hover:text-gw-text transition-colors flex-shrink-0">
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
