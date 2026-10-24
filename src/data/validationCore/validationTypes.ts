/**
 * 拆分自 dataValidation.ts — 校验核心类型
 */

export interface ValidationIssue {
  level: 'error' | 'warning' | 'info';
  category: 'consistency' | 'completeness' | 'range' | 'freshness' | 'statistical' | 'business';
  title: string;
  message: string;
  affectedModules: string[];
  /** 是否阻塞发布 */
  blocking: boolean;
  /** 自动修复建议（文本描述） */
  fixSuggestion?: string;
  /** 是否可自动修复 */
  canAutoFix?: boolean;
}

export interface ModuleScanResult {
  module: string;
  label: string;
  category: string;
  totalRecords: number;
  emptyFields: string[];
  issues: ValidationIssue[];
  status: 'ok' | 'warning' | 'error';
}
