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
 * 面板组件：TemplateSelector（拆分自 ReportGeneratorTab.tsx）
 */

import { CheckCircle2, BookOpen } from 'lucide-react';
import { TechCard } from '../../UI';
import { useReportGeneratorStore } from '../../../store/reportGeneratorStore';

// ============================================================
// 模板选择器
// ============================================================
export function TemplateSelector() {
  const { templates, selectedTemplateId, selectTemplate } = useReportGeneratorStore();

  return (
    <TechCard title="报告模板" icon={BookOpen}>
      <div className="space-y-2">
        {templates.map(t => {
          const active = t.id === selectedTemplateId;
          return (
            <button
              key={t.id}
              onClick={() => selectTemplate(t.id)}
              className={`w-full text-left p-3 rounded-lg border transition-all ${
                active
                  ? 'bg-gw-blue/10 border-gw-blue/30'
                  : 'bg-gw-surface/30 border-gw-border/20 hover:border-gw-border'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-medium ${active ? 'text-gw-highlight' : 'text-gw-text'}`}>
                  {t.name}
                </span>
                {active && <CheckCircle2 size={14} className="text-gw-highlight" />}
              </div>
              <p className="text-[10px] text-gw-muted leading-relaxed">{t.description}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-gw-surface/60 text-gw-muted">
                  {t.scenario}
                </span>
                <span className="text-[9px] text-gw-muted/60">
                  {t.chapters.length}个章节 + {t.autoChapters.length}个自动章节
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </TechCard>
  );
}
