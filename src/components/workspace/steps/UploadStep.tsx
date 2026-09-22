/**
 * 自定义数据接入 — 上传步骤（自 CustomDataTab.tsx 拆分）
 */
import { useState, useCallback } from 'react';
import { Upload } from 'lucide-react';
import { TechCard } from '../../UI';
import { useToast } from '../../Toast';
import type { DataTemplate } from '../../../store/customDataStore';
import { parseCSV, parseJSON } from '../customDataUtils';

export function UploadStep({ template, fileName, datasetName, onNameChange, onFile, onBack }: {
  template: DataTemplate;
  fileName: string;
  datasetName: string;
  onNameChange: (name: string) => void;
  onFile: (name: string, headers: string[], rows: Record<string, unknown>[]) => void;
  onBack: () => void;
}) {
  const { error: toastError } = useToast();
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    const name = file.name;
    try {
      const text = await file.text();
      let parsed: { headers: string[]; rows: Record<string, unknown>[] };

      if (name.endsWith('.json')) {
        parsed = parseJSON(text);
      } else {
        parsed = parseCSV(text);
      }

      if (parsed.headers.length === 0 || parsed.rows.length === 0) {
        toastError('文件解析失败：未找到有效数据');
        return;
      }

      onFile(name, parsed.headers, parsed.rows);
    } catch {
      toastError('文件读取失败，请检查文件格式');
    }
  }, [onFile, toastError]);

  // 下载模板
  const downloadTemplate = () => {
    const headers = template.fields.map(f => f.label);
    const sampleRow = template.fields.map(f => {
      if (f.defaultValue !== undefined) return String(f.defaultValue);
      if (f.type === 'number') return '0';
      return '示例';
    });
    const csv = [headers.join(','), sampleRow.join(',')].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name}_模板.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <TechCard title={`上传文件 — ${template.name}`} icon={Upload}>
      <div className="space-y-3">
        {/* 模板字段预览 */}
        <div className="p-3 rounded-lg bg-gw-surface/30 border border-gw-border/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-gw-muted">模板字段（{template.fields.filter(f => f.required).length} 必填 / {template.fields.length} 总计）</span>
            <button onClick={downloadTemplate} className="text-[10px] px-2 py-0.5 rounded bg-gw-surface text-gw-muted hover:text-gw-text border border-gw-border/30 transition-all">
              下载模板
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {template.fields.map(f => (
              <span key={f.name} className={`text-[9px] px-1.5 py-0.5 rounded border ${
                f.required
                  ? 'bg-gw-blue/10 text-gw-highlight border-gw-blue/20'
                  : 'bg-gw-surface/40 text-gw-muted border-gw-border/20'
              }`}>
                {f.required ? '*' : ''}{f.label}
                {f.unit && <span className="text-gw-muted/50 ml-0.5">({f.unit})</span>}
              </span>
            ))}
          </div>
        </div>

        {/* 数据集名称 */}
        <div>
          <label className="text-[10px] text-gw-muted mb-1 block">数据集名称</label>
          <input
            type="text"
            value={datasetName}
            onChange={e => onNameChange(e.target.value)}
            placeholder="（默认使用文件名）"
            className="w-full bg-transparent border border-gw-border/30 rounded px-2 py-1.5 text-xs text-gw-text focus:border-gw-blue/50 focus:outline-none"
          />
        </div>

        {/* 拖拽上传区 */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
          }}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragOver ? 'border-gw-blue/50 bg-gw-blue/5' : 'border-gw-border/30 hover:border-gw-border/50'
          }`}
          onClick={() => document.getElementById('custom-data-file-input')?.click()}
        >
          <Upload size={32} className="mx-auto text-gw-muted/40 mb-2" />
          <p className="text-xs text-gw-muted">
            {fileName ? fileName : '点击或拖拽文件到此处'}
          </p>
          <p className="text-[10px] text-gw-muted/60 mt-1">支持 CSV / JSON 格式</p>
          <input
            id="custom-data-file-input"
            type="file"
            accept=".csv,.json,.txt"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>

        <div className="flex justify-between">
          <button onClick={onBack} className="px-3 py-1.5 rounded text-xs bg-gw-surface text-gw-muted hover:text-gw-text border border-gw-border/30 transition-all">
            返回
          </button>
        </div>
      </div>
    </TechCard>
  );
}
