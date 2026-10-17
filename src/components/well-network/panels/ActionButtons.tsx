/**
 * 拆分自 WellNetworkPanel.tsx — 操作按钮区（新增井/重置/空间分析/井列表/报告/导出）
 */

import { Plus, RefreshCw, Layers, ChevronDown, Crosshair, FileDown, Download } from 'lucide-react';
import type { ExportFormat } from '../../../services/dataExporter';

export function ActionButtons({
  showAdd,
  onToggleAdd,
  onReset,
  showSpatial,
  onToggleSpatial,
  showTable,
  onToggleTable,
  displayWellsCount,
  onGenerateReport,
  reportFormat,
  reportStatus,
  showReportFormatMenu,
  onToggleFormatMenu,
  onSelectFormat,
  showExportMenu,
  onToggleExportMenu,
  exportStatus,
  onExport,
}: {
  showAdd: boolean;
  onToggleAdd: (v: boolean) => void;
  onReset: () => void;
  showSpatial: boolean;
  onToggleSpatial: (v: boolean) => void;
  showTable: boolean;
  onToggleTable: (v: boolean) => void;
  displayWellsCount: number;
  onGenerateReport: (format: 'docx' | 'pdf' | 'xlsx') => void;
  reportFormat: 'docx' | 'pdf' | 'xlsx';
  reportStatus: 'idle' | 'generating' | 'done' | 'error';
  showReportFormatMenu: boolean;
  onToggleFormatMenu: (v: boolean) => void;
  onSelectFormat: (fmt: 'docx' | 'pdf' | 'xlsx') => void;
  showExportMenu: boolean;
  onToggleExportMenu: (v: boolean) => void;
  exportStatus: 'idle' | 'exporting' | 'done';
  onExport: (format: ExportFormat) => void;
}) {
  return (
    <>
        {/* 操作按钮 */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button onClick={() => onToggleAdd(!showAdd)} className="flex items-center gap-1 px-2 py-1 text-[9px] font-medium bg-gw-cyan/20 text-gw-cyan rounded hover:bg-gw-cyan/30 transition-colors">
            <Plus size={11} />新增井
          </button>
          <button onClick={onReset} className="flex items-center gap-1 px-2 py-1 text-[9px] text-gw-muted hover:text-gw-text transition-colors">
            <RefreshCw size={11} />重置
          </button>
          <button onClick={() => onToggleSpatial(!showSpatial)} className="flex items-center gap-1 px-2 py-1 text-[9px] text-gw-muted hover:text-gw-text transition-colors">
            <Layers size={11} />空间分析
            <ChevronDown size={9} className={`transition-transform ${showSpatial ? 'rotate-0' : '-rotate-90'}`} />
          </button>
          <button onClick={() => onToggleTable(!showTable)} className="flex items-center gap-1 px-2 py-1 text-[9px] text-gw-muted hover:text-gw-text transition-colors">
            <Crosshair size={11} />井列表({displayWellsCount})
            <ChevronDown size={9} className={`transition-transform ${showTable ? 'rotate-0' : '-rotate-90'}`} />
          </button>
          <div className="relative">
            <button
              onClick={() => {
                onGenerateReport(reportFormat);
              }}
              disabled={reportStatus === 'generating'}
              className="flex items-center gap-1 px-2 py-1 text-[9px] font-medium bg-gw-cyan/20 text-gw-cyan rounded hover:bg-gw-cyan/30 transition-colors disabled:opacity-50"
              title="生成并下载报告"
            >
              <FileDown size={11} />
              {reportStatus === 'generating' ? '生成中...' : '生成报告'}
            </button>
            <button
              onClick={() => onToggleFormatMenu(!showReportFormatMenu)}
              className="px-1 py-1 text-[9px] font-medium bg-gw-cyan/20 text-gw-cyan rounded hover:bg-gw-cyan/30 transition-colors"
              title="选择格式"
            >
              <ChevronDown size={9} />
            </button>

            {showReportFormatMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => onToggleFormatMenu(false)} />
                <div className="absolute right-0 top-full mt-1 z-50 bg-gw-surface border border-gw-border/30 rounded-lg shadow-lg overflow-hidden min-w-[100px]">
                  {(['docx', 'pdf', 'xlsx'] as const).map(fmt => (
                    <button
                      key={fmt}
                      onClick={() => {
                        onSelectFormat(fmt);
                        onToggleFormatMenu(false);
                        onGenerateReport(fmt);
                      }}
                      className={`flex items-center gap-2 w-full px-3 py-2 text-[10px] transition-colors ${
                        reportFormat === fmt ? 'text-gw-cyan bg-gw-cyan/10' : 'text-gw-muted hover:text-gw-text hover:bg-gw-surface/30'
                      }`}
                    >
                      <span className="text-[8px] font-mono px-1 rounded bg-gw-surface/30">{fmt.toUpperCase()}</span>
                      <span>{fmt === 'docx' ? 'Word 文档' : fmt === 'pdf' ? 'PDF 文档' : 'Excel 表格'}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* 数据导出按钮 */}
          <div className="relative">
            <button
              onClick={() => onToggleExportMenu(!showExportMenu)}
              disabled={exportStatus === 'exporting'}
              className="flex items-center gap-1 px-2 py-1 text-[9px] font-medium bg-gw-surface/40 text-gw-muted rounded hover:text-gw-text hover:bg-gw-surface/60 transition-colors disabled:opacity-50"
              title="导出数据 (Excel/CSV/JSON)"
            >
              <Download size={11} />
              {exportStatus === 'exporting' ? '导出中...' : '导出数据'}
            </button>

            {showExportMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => onToggleExportMenu(false)} />
                <div className="absolute right-0 top-full mt-1 z-50 bg-gw-surface border border-gw-border/30 rounded-lg shadow-lg overflow-hidden min-w-[120px]">
                  {(['xlsx', 'csv', 'json'] as ExportFormat[]).map(fmt => (
                    <button
                      key={fmt}
                      onClick={() => onExport(fmt)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-[10px] text-gw-muted hover:text-gw-text hover:bg-gw-surface/30 transition-colors"
                    >
                      <span className="text-[8px] font-mono px-1 rounded bg-gw-surface/30">{fmt.toUpperCase()}</span>
                      <span>{fmt === 'xlsx' ? 'Excel 多标签页' : fmt === 'csv' ? 'CSV 文本' : 'JSON 结构化'}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
    </>
  );
}
