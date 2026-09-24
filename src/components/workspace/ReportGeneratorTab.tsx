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
 * 主组件（面板已拆分至 reportPanels/ 子目录）
 */

import { useEffect, useMemo } from 'react';
import { FileText } from 'lucide-react';
import { TechCard, StatCard, DataSourceNote } from '../UI';
import { useReportGeneratorStore, getSelectedTemplate } from '../../store/reportGeneratorStore';
import { useExportCenterStore } from '../../store/exportCenterStore';
import { TemplateSelector } from './reportPanels/TemplateSelector';
import { ReportMetaForm } from './reportPanels/ReportMetaForm';
import { ChapterEditor } from './reportPanels/ChapterEditor';
import { ReportPreview } from './reportPanels/ReportPreview';
import { GenerateBar } from './reportPanels/GenerateBar';

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
