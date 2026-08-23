/**
 * 全局搜索 — 对外 Props 类型
 */

export interface GlobalSearchEnhancedProps {
  placeholder?: string;
  onSelect?: () => void;
  onSearch?: (query: string) => void;
}
