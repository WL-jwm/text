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
 * 面板组件：ReportMetaForm（拆分自 ReportGeneratorTab.tsx）
 */

import { Building2, User, Calendar, TypeIcon, Layers } from 'lucide-react';
import { TechCard } from '../../UI';
import { useReportGeneratorStore } from '../../../store/reportGeneratorStore';
import { FormField } from './FormField';

// ============================================================
// 报告元信息表单
// ============================================================
export function ReportMetaForm() {
  const { meta, updateMeta } = useReportGeneratorStore();

  return (
    <TechCard title="报告信息" icon={TypeIcon}>
      <div className="space-y-3">
        <FormField icon={TypeIcon} label="报告标题">
          <input
            type="text"
            value={meta.title}
            onChange={e => updateMeta({ title: e.target.value })}
            className="w-full bg-transparent border border-gw-border/30 rounded px-2 py-1 text-xs text-gw-text focus:border-gw-blue/50 focus:outline-none"
          />
        </FormField>
        <FormField icon={Layers} label="副标题">
          <input
            type="text"
            value={meta.subtitle}
            onChange={e => updateMeta({ subtitle: e.target.value })}
            placeholder="（可选）"
            className="w-full bg-transparent border border-gw-border/30 rounded px-2 py-1 text-xs text-gw-text focus:border-gw-blue/50 focus:outline-none"
          />
        </FormField>
        <FormField icon={Building2} label="编制单位">
          <input
            type="text"
            value={meta.organization}
            onChange={e => updateMeta({ organization: e.target.value })}
            className="w-full bg-transparent border border-gw-border/30 rounded px-2 py-1 text-xs text-gw-text focus:border-gw-blue/50 focus:outline-none"
          />
        </FormField>
        <FormField icon={User} label="编制人">
          <input
            type="text"
            value={meta.author}
            onChange={e => updateMeta({ author: e.target.value })}
            placeholder="（可选）"
            className="w-full bg-transparent border border-gw-border/30 rounded px-2 py-1 text-xs text-gw-text focus:border-gw-blue/50 focus:outline-none"
          />
        </FormField>
        <FormField icon={Calendar} label="日期">
          <input
            type="date"
            value={meta.date}
            onChange={e => updateMeta({ date: e.target.value })}
            className="w-full bg-transparent border border-gw-border/30 rounded px-2 py-1 text-xs text-gw-text focus:border-gw-blue/50 focus:outline-none"
          />
        </FormField>
      </div>
    </TechCard>
  );
}
