/**
 * F-05 多语言支持 — 中英双语翻译字典
 *
 * 命名空间:
 *   nav.*       — 导航分组与页面标签
 *   viz.*       — 可视化中心Tab标签与描述
 *   common.*    — 通用UI文本（按钮/表头/状态等）
 *   realtime.*  — 实时数据面板
 *   export.*    — 导出工具栏
 *   settings.*  — 设置面板
 */

import { zhCN } from './localeZhCN';
import { en } from './localeEn';
import type { Language, Dict } from './translationsTypes';
export type { Language, Dict } from './translationsTypes';

export const translations: Record<Language, Dict> = {
  'zh-CN': zhCN,
  en,
};
