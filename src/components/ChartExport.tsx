/**
 * ChartExport 组件 (C6 图表数据导出)
 * 增强版导出按钮，支持Recharts图表关联数据一键导出为Excel/CSV
 * 核心能力：
 *   - 接收data数组 → 一键导出为xlsx/csv
 *   - 接收SVG ref → 一键导出为PNG（图表截图）
 *   - 与ExportButton保持视觉一致
 */

import { useState } from 'react';
import { Download, FileText, FileSpreadsheet, Image as ImageIcon } from 'lucide-react';
import { useToast } from './Toast';

export type ExportFormat = 'xlsx' | 'csv' | 'json' | 'png';

interface ChartExportProps {
  /** 要导出的数据（数组或对象） */
  /** 要导出的数据（数组或对象） */
  data?: unknown[] | Record<string, unknown>;
  /** 数据对应的文件名（不含后缀） */
  filename?: string;
  /** Sheet名称（xlsx格式时） */
  sheetName?: string;
  /** 当前图表的SVG ref（用于PNG导出） */
  svgRef?: React.RefObject<SVGSVGElement | null>;
  /** 仅显示指定格式 */
  formats?: ExportFormat[];
  /** 自定义样式 */
  className?: string;
  /** 按钮label */
  label?: string;
  /** 导出成功回调 */
  onSuccess?: (format: ExportFormat) => void;
}

/** 将数据转为CSV字符串 */
function dataToCSV(data: unknown[] | Record<string, unknown>): string {
  if (Array.isArray(data)) {
    if (data.length === 0) return '';
    // 提取所有key
    const keys = Array.from(new Set(data.flatMap(item =>
      typeof item === 'object' && item !== null ? Object.keys(item) : []
    )));
    const header = keys.join(',');
    const rows = data.map(item => {
      if (typeof item !== 'object' || item === null) return String(item);
      const obj = item as Record<string, unknown>;
      return keys.map(k => {
        const v = obj[k];
        if (v == null) return '';
        // 处理逗号和引号
        const s = String(v).replace(/"/g, '""');
        return /[,"\n]/.test(s) ? `"${s}"` : s;
      }).join(',');
    });
    return [header, ...rows].join('\n');
  } else {
    // 对象转成两列：key,value
    return Object.entries(data).map(([k, v]) => `${k},${v}`).join('\n');
  }
}

/** 下载文本文件 */
function downloadText(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  triggerDownload(blob, filename);
}

/** 触发浏览器下载 */
function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/** SVG转PNG（图表截图导出） */
async function svgToPNG(svg: SVGSVGElement, filename: string) {
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svg);
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  return new Promise<void>((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = 2; // 高清
      canvas.width = svg.clientWidth * scale || 800;
      canvas.height = svg.clientHeight * scale || 600;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Canvas context unavailable'));
        return;
      }
      // 白底
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => {
        if (blob) {
          triggerDownload(blob, filename);
          URL.revokeObjectURL(url);
          resolve();
        } else {
          URL.revokeObjectURL(url);
          reject(new Error('Canvas toBlob failed'));
        }
      }, 'image/png');
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('SVG image load failed'));
    };
    img.src = url;
  });
}

/** 生成xlsx格式（简化版，使用CSV+TSV的混合策略） */
function generateXLSX(data: unknown[] | Record<string, unknown>, _sheetName = 'Sheet1'): Blob {
  // 由于不引入xlsx库（避免增加包体积），使用TSV格式+特殊header让Excel识别为表格
  // 真正的xlsx需要zip+xml，本方案通过纯TSV让Excel正常打开
  let content = '';
  if (Array.isArray(data)) {
    if (data.length === 0) {
      content = '';
    } else {
      const keys = Array.from(new Set(data.flatMap(item =>
        typeof item === 'object' && item !== null ? Object.keys(item) : []
      )));
      content = keys.join('\t') + '\n';
      content += data.map(item => {
        if (typeof item !== 'object' || item === null) return String(item);
        const obj = item as Record<string, unknown>;
        return keys.map(k => {
          const v = obj[k];
          return v == null ? '' : String(v).replace(/\t/g, ' ').replace(/\n/g, ' ');
        }).join('\t');
      }).join('\n');
    }
  } else {
    content = Object.entries(data).map(([k, v]) => `${k}\t${v}`).join('\n');
  }
  // BOM让Excel识别UTF-8
  const bom = '\uFEFF';
  return new Blob([bom + content], { type: 'application/vnd.ms-excel;charset=utf-8' });
}

export function ChartExport({
  data,
  filename = 'chart-data',
  sheetName = 'Sheet1',
  svgRef,
  formats = ['xlsx', 'csv', 'png'],
  className = '',
  label = '导出',
  onSuccess,
}: ChartExportProps) {
  const [showMenu, setShowMenu] = useState(false);
  const { success } = useToast();

  const handleExport = async (format: ExportFormat) => {
    setShowMenu(false);
    try {
      const baseName = filename.replace(/\.[^.]+$/, '');

      if (format === 'xlsx' && data) {
        const blob = generateXLSX(data, sheetName);
        triggerDownload(blob, `${baseName}.xlsx`);
        success('Excel导出成功');
      } else if (format === 'csv' && data) {
        const csv = dataToCSV(data);
        // BOM让Excel识别UTF-8
        downloadText('\uFEFF' + csv, `${baseName}.csv`, 'text/csv');
        success('CSV导出成功');
      } else if (format === 'json' && data) {
        const json = JSON.stringify(data, null, 2);
        downloadText(json, `${baseName}.json`, 'application/json');
        success('JSON导出成功');
      } else if (format === 'png' && svgRef?.current) {
        await svgToPNG(svgRef.current, `${baseName}.png`);
        success('PNG导出成功');
      } else {
        success('当前格式暂不支持');
        return;
      }
      onSuccess?.(format);
    } catch (err) {
      console.error('Export failed:', err);
      success('导出失败：' + (err instanceof Error ? err.message : '未知错误'));
    }
  };

  // 如果只支持单一格式，直接显示按钮
  if (formats.length === 1) {
    const format = formats[0];
    return (
      <button
        onClick={() => handleExport(format)}
        className={`px-3 py-1.5 rounded-lg text-xs bg-gw-surface/60 text-gw-muted hover:text-gw-cyan border border-gw-border/50 hover:border-gw-cyan/30 transition-all flex items-center gap-1.5 ${className}`}
        title={`导出为${format.toUpperCase()}`}
      >
        <Download size={12} />
        {label}
      </button>
    );
  }

  // 多格式下拉
  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={`px-3 py-1.5 rounded-lg text-xs bg-gw-surface/60 text-gw-muted hover:text-gw-cyan border border-gw-border/50 hover:border-gw-cyan/30 transition-all flex items-center gap-1.5 ${className}`}
      >
        <Download size={12} />
        {label}
      </button>
      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-1 z-50 bg-gw-card border border-gw-border rounded-lg shadow-lg overflow-hidden min-w-[140px]">
            {formats.map(f => (
              <button
                key={f}
                onClick={() => handleExport(f)}
                className="w-full px-3 py-2 text-xs text-gw-text hover:bg-gw-surface flex items-center gap-2 transition-colors"
              >
                {f === 'xlsx' && <FileSpreadsheet size={12} />}
                {f === 'csv' && <FileText size={12} />}
                {f === 'json' && <FileText size={12} />}
                {f === 'png' && <ImageIcon size={12} />}
                导出为{f.toUpperCase()}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
