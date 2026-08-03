/**
 * F-05 多语言支持 — 语言切换按钮
 *
 * 与 ThemeToggle 风格一致的紧凑图标按钮：
 *   - 中文(zh-CN) 显示 "EN" 切换到英文
 *   - 英文(en) 显示 "中" 切换到中文
 */

import { Languages } from 'lucide-react';
import { useLanguage } from '../hooks/useI18n';

export function LanguageToggle({ className = '' }: { className?: string }) {
  const { language, toggle } = useLanguage();

  return (
    <button
      onClick={toggle}
      className={`flex items-center justify-center w-8 h-8 rounded-lg text-gw-muted hover:text-gw-blue transition-colors ${className}`}
      title={language === 'zh-CN' ? 'Switch to English' : '切换到中文'}
      aria-label="Toggle language"
    >
      {language === 'zh-CN' ? (
        <span className="text-[10px] font-bold">EN</span>
      ) : (
        <span className="text-[10px] font-bold">中</span>
      )}
    </button>
  );
}

/**
 * 带下拉菜单的完整语言选择器
 */
export function LanguageSelector({ className = '' }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Languages size={12} className="text-gw-muted" />
      <button
        onClick={() => setLanguage('zh-CN')}
        className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
          language === 'zh-CN'
            ? 'bg-gw-blue/15 text-gw-blue'
            : 'text-gw-muted hover:text-gw-text'
        }`}
      >
        中文
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
          language === 'en'
            ? 'bg-gw-blue/15 text-gw-blue'
            : 'text-gw-muted hover:text-gw-text'
        }`}
      >
        EN
      </button>
    </div>
  );
}
