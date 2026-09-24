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
 * 面板组件：ChapterEditor（拆分自 ReportGeneratorTab.tsx）
 */

import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Trash2, Plus, Eye, CheckCircle2, RefreshCw, Layers } from 'lucide-react';
import { TechCard } from '../../UI';
import { useReportGeneratorStore, MODULE_LABELS } from '../../../store/reportGeneratorStore';
import { useExportCenterStore } from '../../../store/exportCenterStore';

// ============================================================
// 章节编辑器
// ============================================================
export function ChapterEditor() {
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
