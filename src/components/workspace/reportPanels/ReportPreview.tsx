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
 * 面板组件：ReportPreview（拆分自 ReportGeneratorTab.tsx）
 */

import { Eye, EyeOff } from 'lucide-react';
import { TechCard } from '../../UI';
import { useReportGeneratorStore } from '../../../store/reportGeneratorStore';
import { numberToChinesePreview } from './reportUtils';
import { PreviewSection } from './PreviewSection';

// ============================================================
// 报告预览
// ============================================================
export function ReportPreview() {
  const { chapters, meta, togglePreview, templates, selectedTemplateId } = useReportGeneratorStore();
  const template = templates.find(t => t.id === selectedTemplateId);
  const enabledChapters = chapters.filter(c => c.enabled);

  return (
    <TechCard
      title="报告大纲预览"
      icon={Eye}
    >
      <div className="flex justify-end mb-2">
        <button
          onClick={() => togglePreview()}
          className="text-[10px] px-2 py-1 rounded bg-gw-surface text-gw-muted hover:text-gw-text border border-gw-border/30 transition-all flex items-center gap-1"
        >
          <EyeOff size={10} />
          关闭预览
        </button>
      </div>
      <div className="space-y-2 text-xs">
        {/* 封面预览 */}
        {template?.autoChapters.includes('cover') && (
          <PreviewSection type="auto" title="【封面】">
            <p className="text-[11px] font-bold text-gw-text">{meta.title}</p>
            {meta.subtitle && <p className="text-[10px] text-gw-muted">{meta.subtitle}</p>}
            <p className="text-[10px] text-gw-muted/70">{meta.organization} · {meta.date}</p>
          </PreviewSection>
        )}

        {/* 目录 */}
        {template?.autoChapters.includes('toc') && (
          <PreviewSection type="auto" title="【目录】">
            {enabledChapters.map((ch, i) => (
              <p key={ch.id} className="text-[10px] text-gw-muted">
                第{numberToChinesePreview(i + 1)}章  {ch.title} .......... {i * 3 + 5}
              </p>
            ))}
          </PreviewSection>
        )}

        {/* 摘要 */}
        {template?.autoChapters.includes('summary') && (
          <PreviewSection type="auto" title="【摘要】">
            <p className="text-[10px] text-gw-muted leading-relaxed">
              本报告综合分析了{enabledChapters.map(c => c.title).join('、')}等{enabledChapters.length}个方面的内容...
            </p>
          </PreviewSection>
        )}

        {/* 正文章节 */}
        {enabledChapters.map((ch, i) => (
          <PreviewSection key={ch.id} type="chapter" title={`第${numberToChinesePreview(i + 1)}章  ${ch.title}`}>
            <p className="text-[10px] text-gw-muted/70">
              来源模块：{ch.moduleLabel} · {ch.reportType}
            </p>
          </PreviewSection>
        ))}

        {/* 结论 */}
        {template?.autoChapters.includes('conclusion') && (
          <PreviewSection type="auto" title="【结论】">
            <p className="text-[10px] text-gw-muted leading-relaxed">
              {template?.conclusionTemplate}
            </p>
          </PreviewSection>
        )}

        {/* 参考文献 */}
        {template?.autoChapters.includes('references') && (
          <PreviewSection type="auto" title="【参考文献】">
            <p className="text-[10px] text-gw-muted/70">[1] GB/T 14848-2017《地下水质量标准》</p>
            <p className="text-[10px] text-gw-muted/70">[2] HJ 610-2016《环境影响评价技术导则 地下水环境》</p>
            <p className="text-[10px] text-gw-muted/70">[3] ...</p>
          </PreviewSection>
        )}
      </div>
    </TechCard>
  );
}
