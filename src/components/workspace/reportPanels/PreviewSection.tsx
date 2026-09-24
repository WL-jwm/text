/**
 * ReportGeneratorTab — 报告生成器 (D-03)
 *
 * 工作台第 9 个 Tab，提供结构化完整 Word 报告生成能力。
 * 与 D-02 批量导出不同，D-03 专注于：
 *   - 报告模板选择（环评/水源地/区域评价/修复/自定义）
 *   - 章节编排（拖拽排序/启用禁用/重命名）
 *   - 报告元信息配置（标题/副标题/编制单位/作者）
 *   - 报告预览（章节大纲）
 *   - 一键生成完整 Word 报告（封面+目录+摘要+正文+结论+参考文献）
 * 面板组件：PreviewSection（拆分自 ReportGeneratorTab.tsx）
 */

import React from 'react';

export function PreviewSection({ type, title, children }: {
  type: 'auto' | 'chapter';
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`p-2 rounded border ${
      type === 'auto'
        ? 'bg-gw-surface/20 border-gw-border/10'
        : 'bg-gw-blue/5 border-gw-blue/15'
    }`}>
      <p className={`text-xs font-medium ${type === 'auto' ? 'text-gw-muted' : 'text-gw-text'}`}>
        {title}
      </p>
      <div className="mt-1">{children}</div>
    </div>
  );
}
