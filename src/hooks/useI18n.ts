/**
 * F-05 多语言支持 — i18n Hook
 *
 * 轻量级国际化方案（无外部依赖）：
 *   - useI18n(): 获取当前语言 + t() 翻译函数
 *   - useLanguage(): 获取语言 + 切换函数
 *   - t(key, fallback?): 翻译键查找
 *
 * 语言状态存储在 useAppStore.settings.language，
 * 切换时通过 updateSettings 持久化到 IndexedDB。
 */

import { useCallback, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { translations, type Language } from '../i18n/translations';

type TKey = string;

// ── 翻译函数类型 ──
export type TFunction = (key: TKey, fallback?: string) => string;

// ── i18n 主hook ──

export function useI18n(): {
  lang: Language;
  t: TFunction;
  isEn: boolean;
  isZh: boolean;
} {
  const settings = useAppStore(s => s.settings);

  const lang: Language = settings.language === 'en' ? 'en' : 'zh-CN';

  const t = useCallback<TFunction>((key: TKey, fallback?: string) => {
    const dict = translations[lang];
    const value = dict[key];
    if (value !== undefined && value !== null) return String(value);
    // 回退到中文
    const zhDict = translations['zh-CN'];
    const zhValue = zhDict[key];
    if (zhValue !== undefined && zhValue !== null) return String(zhValue);
    // 最后回退到 key 本身或 fallback
    return fallback ?? key;
  }, [lang]);

  return useMemo(() => ({
    lang,
    t,
    isEn: lang === 'en',
    isZh: lang === 'zh-CN',
  }), [lang, t]);
}

// ── 语言切换hook ──

export function useLanguage(): {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  toggle: () => Promise<void>;
} {
  const settings = useAppStore(s => s.settings);
  const updateSettings = useAppStore(s => s.updateSettings);

  const language: Language = settings.language === 'en' ? 'en' : 'zh-CN';

  const setLanguage = useCallback(async (lang: Language) => {
    await updateSettings({ language: lang });
  }, [updateSettings]);

  const toggle = useCallback(async () => {
    const next: Language = language === 'zh-CN' ? 'en' : 'zh-CN';
    await updateSettings({ language: next });
  }, [language, updateSettings]);

  return { language, setLanguage, toggle };
}
