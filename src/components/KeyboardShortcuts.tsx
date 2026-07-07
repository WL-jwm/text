import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Keyboard, X, Search, Bookmark, Info, ChevronRight } from 'lucide-react';

// ── 快捷键定义 ──
interface _ShortcutDef {
  keys: string;       // 显示文本，如 "Ctrl+K"
  description: string;
  category: string;   // 分类
  action: () => void;
  global?: boolean;   // 是否全局监听（默认true）
}

// ── 分类图标映射 ──
const categoryIcons: Record<string, React.ReactNode> = {
  '导航': <ChevronRight size={12} />,
  '搜索': <Search size={12} />,
  '视图': <Info size={12} />,
  '工具': <Bookmark size={12} />,
};

// ── 快捷键帮助面板 ──
function ShortcutHelpPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      {/* 面板 */}
      <div
        ref={panelRef}
        className="relative bg-gw-card border border-gw-border rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gw-border/60">
          <div className="flex items-center gap-2">
            <Keyboard size={16} className="text-gw-blue" />
            <h3 className="text-sm font-semibold text-gw-text">键盘快捷键</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-gw-muted hover:text-gw-text transition-colors">
            <X size={16} />
          </button>
        </div>
        {/* 快捷键列表 */}
        <div className="px-5 py-3 overflow-y-auto max-h-[60vh] scrollbar-thin">
          {/* 全局快捷键（硬编码列表，不执行action） */}
          {renderCategory('导航', [
            { keys: 'Ctrl+K / ⌘+K', desc: '聚焦搜索框' },
            { keys: 'Alt+Home', desc: '回到总览页' },
            { keys: 'Alt+←', desc: '后退一页' },
            { keys: 'Alt+→', desc: '前进一页' },
            { keys: 'Escape', desc: '关闭弹窗/抽屉' },
          ])}
          {renderCategory('搜索', [
            { keys: '↑ / ↓', desc: '搜索结果中导航' },
            { keys: 'Enter', desc: '跳转到选中结果' },
          ])}
          {renderCategory('视图', [
            { keys: 'Ctrl+B / ⌘+B', desc: '切换侧栏折叠' },
            { keys: 'Ctrl+/ / ⌘+/', desc: '显示此帮助面板' },
            { keys: 'Ctrl+P / ⌘+P', desc: '打印当前页面' },
          ])}
          {renderCategory('工具', [
            { keys: 'Ctrl+E / ⌘+E', desc: '导出当前页面数据' },
          ])}
        </div>
        {/* 底部提示 */}
        <div className="px-5 py-3 border-t border-gw-border/40 bg-gw-surface/30">
          <p className="text-[10px] text-gw-muted/50 text-center">
            按 <kbd className="px-1 py-0.5 rounded bg-gw-surface border border-gw-border/50 text-[9px] font-mono">?</kbd> 或 <kbd className="px-1 py-0.5 rounded bg-gw-surface border border-gw-border/50 text-[9px] font-mono">Ctrl+/</kbd> 随时打开此面板
          </p>
        </div>
      </div>
    </div>
  );
}

function renderCategory(category: string, items: { keys: string; desc: string }[]) {
  return (
    <div className="mb-4 last:mb-0" key={category}>
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-gw-blue">{categoryIcons[category]}</span>
        <span className="text-[10px] text-gw-muted/60 uppercase tracking-wider font-medium">{category}</span>
      </div>
      <div className="space-y-1">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-gw-surface/50 transition-colors">
            <span className="text-xs text-gw-text">{item.desc}</span>
            <div className="flex items-center gap-1 flex-shrink-0 ml-3">
              {item.keys.split(' / ').map((k, j) => (
                <React.Fragment key={j}>
                  {j > 0 && <span className="text-[9px] text-gw-muted/30 mx-0.5">/</span>}
                  <KbdDisplay keys={k} />
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function KbdDisplay({ keys }: { keys: string }) {
  const parts = keys.split('+').map(k => k.trim());
  return (
    <div className="flex items-center gap-0.5">
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="text-[8px] text-gw-muted/40">+</span>}
          <kbd className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded bg-gw-surface border border-gw-border/50 text-[9px] text-gw-muted font-mono shadow-[0_1px_0_1px_rgba(0,0,0,0.1)]">
            {part}
          </kbd>
        </React.Fragment>
      ))}
    </div>
  );
}

// ── 全局快捷键钩子 ──
export function useKeyboardShortcuts() {
  const [helpOpen, setHelpOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    // 查找侧栏折叠按钮并触发点击
    const btn = document.querySelector('[title="展开侧栏"], [title="收起侧栏"]') as HTMLElement;
    btn?.click();
  }, []);

  const triggerExport = useCallback(() => {
    // 查找页面中的导出按钮并触发点击
    const exportBtn = document.querySelector('[title*="导出"], [data-export]') as HTMLElement;
    if (exportBtn) {
      exportBtn.click();
    } else {
      // 触发自定义事件，页面组件可监听
      window.dispatchEvent(new CustomEvent('keyboard-export'));
    }
  }, []);

  const goHome = useCallback(() => {
    (window as any).__navigate?.('/');
  }, []);

  const goBack = useCallback(() => {
    window.history.back();
  }, []);

  const goForward = useCallback(() => {
    window.history.forward();
  }, []);

  const printPage = useCallback(() => {
    window.print();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      const target = e.target as HTMLElement;
      // 排除输入框中的快捷键（除特定组合外）
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // Ctrl+/ 或 ? — 帮助面板（始终有效）
      if (ctrl && e.key === '/') {
        e.preventDefault();
        setHelpOpen(prev => !prev);
        return;
      }
      if (!isInput && e.key === '?') {
        e.preventDefault();
        setHelpOpen(prev => !prev);
        return;
      }

      // Escape — 关闭帮助面板
      if (e.key === 'Escape' && helpOpen) {
        setHelpOpen(false);
        return;
      }

      // 输入框中只响应 Escape
      if (isInput) return;

      // Ctrl+B — 切换侧栏
      if (ctrl && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
        return;
      }

      // Alt+Home — 回总览
      if (e.altKey && e.key === 'Home') {
        e.preventDefault();
        goHome();
        return;
      }

      // Alt+← — 后退
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        goBack();
        return;
      }

      // Alt+→ — 前进
      if (e.altKey && e.key === 'ArrowRight') {
        e.preventDefault();
        goForward();
        return;
      }

      // Ctrl+E — 导出
      if (ctrl && e.key === 'e') {
        e.preventDefault();
        triggerExport();
        return;
      }

      // Ctrl+P — 打印
      if (ctrl && e.key === 'p') {
        e.preventDefault();
        printPage();
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [helpOpen, toggleSidebar, goHome, goBack, goForward, triggerExport, printPage]);

  return { helpOpen, setHelpOpen };
}

// ── 导出帮助面板和hook ──
export { ShortcutHelpPanel, KbdDisplay };
