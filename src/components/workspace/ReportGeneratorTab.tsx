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
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  FileText, ChevronUp, ChevronDown, Trash2, Plus, Eye, EyeOff,
  Loader2, CheckCircle2, AlertCircle, RefreshCw, BookOpen,
  Building2, User, Calendar, Type as TypeIcon, Layers,
} from 'lucide-react';
import { TechCard, StatCard, DataSourceNote } from '../UI';
import { useToast } from '../Toast';
import {
  useReportGeneratorStore, getSelectedTemplate,
  generateReportFilename, MODULE_LABELS,
} from '../../store/reportGeneratorStore';
import { composeReport, type ComposeResult } from '../../utils/reportComposer';
import { useExportCenterStore } from '../../store/exportCenterStore';

export function ReportGeneratorTab() {
  const store = useReportGeneratorStore();
  const exportStore = useExportCenterStore();
  const { init: initExport } = exportStore;

  useEffect(() => { initExport(); }, [initExport]);

  const template = useMemo(() => getSelectedTemplate(store), [store]);
  const enabledCount = store.chapters.filter(c => c.enabled).length;
  const readyCount = store.chapters.filter(c => c.enabled && exportStore.sources.find(s => s.id === c.moduleId)?.isReady).length;

  return (
    <div className="space-y-4">
      {/* 标题卡 */}
      <TechCard>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-semibold text-gw-text flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            报告生成器
          </h2>
          <span className="text-xs text-gw-muted">D-03</span>
        </div>
        <p className="text-xs text-gw-muted">
          选择报告模板 → 编排章节顺序 → 配置报告信息 → 生成完整 Word 报告。
          报告包含封面、目录、摘要、编号正文章节、结论和参考文献。
        </p>
      </TechCard>

      {/* 统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="报告模板" value={store.templates.length} unit="套" accent="cyan" />
        <StatCard title="章节数" value={enabledCount} unit={`/${store.chapters.length}`} accent="blue" />
        <StatCard title="已就绪" value={readyCount} unit="章" accent="green" />
        <StatCard title="当前模板" value={template?.name.substring(0, 6) ?? '—'} accent="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 左列：模板选择 + 报告信息 */}
        <div className="lg:col-span-1 space-y-4">
          <TemplateSelector />
          <ReportMetaForm />
        </div>

        {/* 右列：章节编排 / 预览 */}
        <div className="lg:col-span-2 space-y-4">
          {store.previewMode ? (
            <ReportPreview />
          ) : (
            <ChapterEditor />
          )}
          <GenerateBar />
        </div>
      </div>

      <DataSourceNote source="基于各模块预采集缓存数据，复用reportGenerator报告生成引擎+docx库" version="D-03" />
    </div>
  );
}

// ============================================================
// 模板选择器
// ============================================================

function TemplateSelector() {
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

// ============================================================
// 报告元信息表单
// ============================================================

function ReportMetaForm() {
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

function FormField({ icon: Icon, label, children }: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[10px] text-gw-muted mb-1">
        <Icon size={10} />
        {label}
      </label>
      {children}
    </div>
  );
}

// ============================================================
// 章节编辑器
// ============================================================

function ChapterEditor() {
  const { chapters, toggleChapter, moveChapter, removeChapter, updateChapterTitle, addChapter, resetToTemplate, togglePreview } = useReportGeneratorStore();
  const { sources } = useExportCenterStore();
  const [showAddPanel, setShowAddPanel] = useState(false);

  // 可添加的模块（不在当前章节列表中的）
  const availableModules = useMemo(() => {
    const usedIds = new Set(chapters.map(c => c.moduleId));
    return Object.entries(MODULE_LABELS)
      .filter(([id]) => !usedIds.has(id))
      .map(([id, label]) => ({ id, label, ready: sources.find(s => s.id === id)?.isReady ?? false }));
  }, [chapters, sources]);

  return (
    <TechCard
      title={`章节编排（${chapters.filter(c => c.enabled).length}/${chapters.length}）`}
      icon={Layers}
    >
      <div className="flex gap-1 mb-2 justify-end">
        <button
          onClick={resetToTemplate}
          className="text-[10px] px-2 py-1 rounded bg-gw-surface text-gw-muted hover:text-gw-text border border-gw-border/30 transition-all flex items-center gap-1"
          title="重置为模板默认"
        >
          <RefreshCw size={10} />
          重置
        </button>
        <button
          onClick={() => togglePreview()}
          className="text-[10px] px-2 py-1 rounded bg-gw-surface text-gw-muted hover:text-gw-text border border-gw-border/30 transition-all flex items-center gap-1"
        >
          <Eye size={10} />
          预览
        </button>
      </div>
      <div className="space-y-1.5">
        {chapters.length === 0 && (
          <div className="text-center py-6">
            <p className="text-xs text-gw-muted">暂无章节，请点击下方按钮添加</p>
          </div>
        )}

        {chapters.map((ch, idx) => {
          const source = sources.find(s => s.id === ch.moduleId);
          return (
            <div
              key={ch.id}
              className={`flex items-center gap-2 p-2 rounded border transition-all ${
                ch.enabled ? 'bg-gw-surface/30 border-gw-border/20' : 'bg-gw-surface/10 border-gw-border/10 opacity-50'
              }`}
            >
              {/* 序号 */}
              <span className="text-[10px] text-gw-muted/60 font-mono w-5 text-center">
                {idx + 1}
              </span>

              {/* 启用/禁用 */}
              <button
                onClick={() => toggleChapter(ch.id)}
                className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                  ch.enabled
                    ? 'bg-gw-blue/20 border-gw-blue/40 text-gw-highlight'
                    : 'border-gw-border/30 text-transparent'
                }`}
              >
                <CheckCircle2 size={10} />
              </button>

              {/* 标题（可编辑） */}
              <input
                type="text"
                value={ch.title}
                onChange={e => updateChapterTitle(ch.id, e.target.value)}
                className="flex-1 bg-transparent border border-transparent hover:border-gw-border/30 rounded px-1.5 py-0.5 text-xs text-gw-text focus:border-gw-blue/40 focus:outline-none"
              />

              {/* 数据状态 */}
              {source?.isReady ? (
                <span className="text-[9px] text-emerald-400 flex items-center gap-0.5">
                  <CheckCircle2 size={8} /> 就绪
                </span>
              ) : (
                <span className="text-[9px] text-gw-muted/40">未采集</span>
              )}

              {/* 上移/下移/删除 */}
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => moveChapter(ch.id, 'up')}
                  disabled={idx === 0}
                  className="p-0.5 text-gw-muted/40 hover:text-gw-text disabled:opacity-20 transition-colors"
                >
                  <ChevronUp size={12} />
                </button>
                <button
                  onClick={() => moveChapter(ch.id, 'down')}
                  disabled={idx === chapters.length - 1}
                  className="p-0.5 text-gw-muted/40 hover:text-gw-text disabled:opacity-20 transition-colors"
                >
                  <ChevronDown size={12} />
                </button>
                <button
                  onClick={() => removeChapter(ch.id)}
                  className="p-0.5 text-gw-muted/40 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 添加章节 */}
      {showAddPanel && (
        <div className="mt-3 p-3 rounded-lg bg-gw-surface/40 border border-gw-border/20">
          <p className="text-[10px] text-gw-muted mb-2">选择要添加的模块：</p>
          <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
            {availableModules.map(m => (
              <button
                key={m.id}
                onClick={() => { addChapter(m.id); setShowAddPanel(false); }}
                className="text-[10px] px-2 py-1 rounded bg-gw-surface text-gw-muted hover:text-gw-text border border-gw-border/30 transition-all flex items-center gap-1"
              >
                {m.ready && <CheckCircle2 size={8} className="text-emerald-400" />}
                {m.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => setShowAddPanel(!showAddPanel)}
        className="mt-2 w-full py-1.5 rounded text-xs bg-gw-surface/40 text-gw-muted hover:text-gw-text border border-gw-border/20 border-dashed transition-all flex items-center justify-center gap-1"
      >
        <Plus size={12} />
        添加章节
      </button>
    </TechCard>
  );
}

// ============================================================
// 报告预览
// ============================================================

function ReportPreview() {
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

function PreviewSection({ type, title, children }: {
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

/** 预览用数字转中文 */
function numberToChinesePreview(num: number): string {
  const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  if (num < 10) return digits[num];
  if (num < 20) return '十' + (num % 10 === 0 ? '' : digits[num % 10]);
  const tens = Math.floor(num / 10);
  const ones = num % 10;
  return digits[tens] + '十' + (ones === 0 ? '' : digits[ones]);
}

// ============================================================
// 生成栏
// ============================================================

function GenerateBar() {
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
