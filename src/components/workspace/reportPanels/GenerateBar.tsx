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
 * 面板组件：GenerateBar（拆分自 ReportGeneratorTab.tsx）
 */

import { useState, useCallback } from 'react';
import { FileText, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { TechCard } from '../../UI';
import { useToast } from '../../Toast';
import { useReportGeneratorStore, generateReportFilename } from '../../../store/reportGeneratorStore';
import { composeReport, type ComposeResult } from '../../../utils/reportComposer';
import { useExportCenterStore } from '../../../store/exportCenterStore';

// ============================================================
// 生成栏
// ============================================================
export function GenerateBar() {
  const { chapters, meta, templates, selectedTemplateId, isGenerating, progress, setGenerating } = useReportGeneratorStore();
  const { sources, markReady } = useExportCenterStore();
  const { success: toastSuccess, error: toastError } = useToast();
  const [result, setResult] = useState<ComposeResult | null>(null);

  const template = templates.find(t => t.id === selectedTemplateId);
  const enabledChapters = chapters.filter(c => c.enabled);
  const filename = generateReportFilename(meta);

  const handleGenerate = useCallback(async () => {
    if (enabledChapters.length === 0) {
      toastError('请至少启用一个章节');
      return;
    }

    setGenerating(true, { current: 0, total: enabledChapters.length });
    setResult(null);

    const composeResult = await composeReport(
      {
        meta,
        template: template!,
        chapters,
        filename,
      },
      (pct) => {
        setGenerating(true, { current: Math.round((pct / 100) * enabledChapters.length), total: enabledChapters.length });
      },
    );

    // 标记就绪
    for (const ch of enabledChapters) {
      const source = sources.find(s => s.id === ch.moduleId);
      if (source && !source.isReady) {
        // 检查是否有缓存数据
        markReady(ch.moduleId);
      }
    }

    setGenerating(false);
    setResult(composeResult);

    if (composeResult.success) {
      toastSuccess(`报告生成成功：${filename}`);
    } else {
      toastError(`报告生成失败：${composeResult.errorMsg}`);
    }
  }, [enabledChapters, meta, template, chapters, filename, setGenerating, sources, markReady, toastSuccess, toastError]);

  return (
    <TechCard>
      {isGenerating ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-gw-muted">
            <span className="flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-gw-highlight" />
              正在生成报告...
            </span>
            <span>{progress.current} / {progress.total}</span>
          </div>
          <div className="w-full h-2 bg-gw-surface rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* 生成结果 */}
          {result && (
            <div className={`p-3 rounded-lg border ${
              result.success
                ? 'bg-emerald-500/10 border-emerald-500/20'
                : 'bg-red-500/10 border-red-500/20'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                {result.success ? (
                  <CheckCircle2 size={14} className="text-emerald-400" />
                ) : (
                  <AlertCircle size={14} className="text-red-400" />
                )}
                <span className={`text-xs font-medium ${result.success ? 'text-emerald-400' : 'text-red-400'}`}>
                  {result.success ? '生成成功' : '生成失败'}
                </span>
                {result.fileSize > 0 && (
                  <span className="text-[10px] text-gw-muted ml-auto">
                    {result.fileSize > 1024 * 1024
                      ? `${(result.fileSize / 1024 / 1024).toFixed(1)} MB`
                      : `${Math.round(result.fileSize / 1024)} KB`}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-gw-muted">{result.filename}</p>
              {result.errorMsg && (
                <p className="text-[10px] text-red-400 mt-1">{result.errorMsg}</p>
              )}
              {result.chapterSummary.length > 0 && (
                <div className="mt-2 space-y-0.5">
                  {result.chapterSummary.map((cs, i) => (
                    <div key={i} className="flex items-center gap-2 text-[9px]">
                      <span className={cs.hasData ? 'text-emerald-400' : 'text-gw-muted/50'}>
                        {cs.hasData ? '✓' : '○'}
                      </span>
                      <span className="text-gw-muted">{cs.title}</span>
                      {cs.hasData && (
                        <span className="text-gw-muted/50">{cs.sectionCount}节</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 生成按钮 */}
          <div className="flex items-center justify-between">
            <div className="text-[10px] text-gw-muted">
              {enabledChapters.length} 个章节 · 文件名：{filename}
            </div>
            <button
              onClick={handleGenerate}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm font-medium hover:from-cyan-500 hover:to-blue-500 transition-all flex items-center gap-2"
            >
              <FileText size={16} />
              生成完整报告
            </button>
          </div>
        </div>
      )}
    </TechCard>
  );
}
