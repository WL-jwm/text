/**
 * F-03 可视化数据导出 — 统一导出工具栏
 *
 * 可嵌入任意可视化面板，提供统一的导出入口：
 *   - PNG导出（SVG→Canvas→PNG，2x清晰度）
 *   - SVG源文件导出
 *   - Excel数据导出（多Sheet）
 *   - CSV数据导出
 *
 * 用法：
 * <VizExportBar
 *   panelId="groundwater-age"
 *   panelTitle="地下水年龄可视化"
 *   svgRef={svgRef}
 *   dataSheets={[{ name: '14C年龄', headers: [...], rows: [...] }]}
 * />
 */

import { useState, useRef, type RefObject } from 'react';
import { Download, Image, FileCode, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react';
import { exportSVGToPNG, exportSVGFile, exportVizDataExcel, exportVizDataCSV, type VizExportSheet } from '../../utils/vizExportUtils';

interface VizExportBarProps {
  /** 面板唯一标识，用于文件名 */
  panelId: string;
  /** 面板标题，用于文件名前缀 */
  panelTitle: string;
  /** SVG元素的ref（可为null，此时禁用PNG/SVG导出） */
  svgRef?: RefObject<SVGSVGElement | null>;
  /** Excel/CSV导出的数据表（可为空，此时禁用数据导出） */
  dataSheets?: VizExportSheet[];
  /** 额外className */
  className?: string;
  /** 紧凑模式（移动端） */
  compact?: boolean;
}

type ExportFormat = 'png' | 'svg' | 'excel' | 'csv';

export function VizExportBar({
  panelId,
  panelTitle: _panelTitle,
  svgRef,
  dataSheets,
  className = '',
  compact = false,
}: VizExportBarProps) {
  const [expanded, setExpanded] = useState(false);
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const hasSVG = svgRef?.current != null;
  const hasData = dataSheets != null && dataSheets.length > 0;

  const safeFilename = `${panelId || 'visualization'}-${new Date().toISOString().slice(0, 10)}`;

  const handleExport = async (format: ExportFormat) => {
    setExporting(format);
    setExpanded(false);

    try {
      switch (format) {
        case 'png': {
          if (svgRef?.current) {
            await exportSVGToPNG(svgRef.current, `${safeFilename}-chart`, 2, '#0f172a');
          }
          break;
        }
        case 'svg': {
          if (svgRef?.current) {
            exportSVGFile(svgRef.current, `${safeFilename}-chart`);
          }
          break;
        }
        case 'excel': {
          if (dataSheets && dataSheets.length > 0) {
            exportVizDataExcel(dataSheets, `${safeFilename}-data`);
          }
          break;
        }
        case 'csv': {
          if (dataSheets && dataSheets.length > 0) {
            const first = dataSheets[0];
            exportVizDataCSV(first.headers, first.rows, `${safeFilename}-data`);
          }
          break;
        }
      }
    } catch (err) {
      console.error(`Export ${format} failed:`, err);
    } finally {
      setExporting(null);
    }
  };

  // 紧凑模式：下拉菜单
  if (compact) {
    return (
      <div ref={dropdownRef} className={`relative ${className}`}>
        <button
          onClick={() => setExpanded(!expanded)}
          disabled={exporting !== null}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] bg-gw-surface/60 text-gw-muted hover:text-gw-cyan border border-gw-border/40 hover:border-gw-cyan/30 transition-all disabled:opacity-50"
        >
          <Download size={11} />
          <span>{exporting ? '导出中...' : '导出'}</span>
          <ChevronDown size={10} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
        {expanded && (
          <div className="absolute right-0 top-full mt-1 z-20 rounded-lg bg-gw-card border border-gw-border/40 shadow-xl py-1 min-w-[120px]">
            <ExportMenuItem icon={Image} label="PNG图片" disabled={!hasSVG} onClick={() => handleExport('png')} />
            <ExportMenuItem icon={FileCode} label="SVG源文件" disabled={!hasSVG} onClick={() => handleExport('svg')} />
            <ExportMenuItem icon={FileSpreadsheet} label="Excel数据" disabled={!hasData} onClick={() => handleExport('excel')} />
            <ExportMenuItem icon={FileText} label="CSV数据" disabled={!hasData} onClick={() => handleExport('csv')} />
          </div>
        )}
      </div>
    );
  }

  // 完整模式：按钮组
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <span className="text-[10px] text-gw-muted/60 hidden sm:inline mr-1">导出:</span>
      <ExportButton
        icon={Image}
        label="PNG"
        disabled={!hasSVG || exporting !== null}
        loading={exporting === 'png'}
        onClick={() => handleExport('png')}
      />
      <ExportButton
        icon={FileCode}
        label="SVG"
        disabled={!hasSVG || exporting !== null}
        loading={exporting === 'svg'}
        onClick={() => handleExport('svg')}
      />
      <ExportButton
        icon={FileSpreadsheet}
        label="Excel"
        disabled={!hasData || exporting !== null}
        loading={exporting === 'excel'}
        onClick={() => handleExport('excel')}
      />
      <ExportButton
        icon={FileText}
        label="CSV"
        disabled={!hasData || exporting !== null}
        loading={exporting === 'csv'}
        onClick={() => handleExport('csv')}
      />
    </div>
  );
}

// ── 子组件 ──

function ExportButton({
  icon: Icon,
  label,
  disabled,
  loading,
  onClick,
}: {
  icon: typeof Download;
  label: string;
  disabled: boolean;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] bg-gw-surface/60 text-gw-muted hover:text-gw-cyan border border-gw-border/40 hover:border-gw-cyan/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <Icon size={11} className={loading ? 'animate-spin' : ''} />
      <span>{loading ? '...' : label}</span>
    </button>
  );
}

function ExportMenuItem({
  icon: Icon,
  label,
  disabled,
  onClick,
}: {
  icon: typeof Download;
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2 w-full px-3 py-1.5 text-[10px] text-gw-text hover:bg-gw-blue/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-left"
    >
      <Icon size={11} />
      <span>{label}</span>
    </button>
  );
}
