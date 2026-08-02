/**
 * CustomDataTab — 用户自定义数据接入 (D-04)
 *
 * 工作台第 10 个 Tab，提供用户自有监测数据的导入、映射、验证和管理。
 * 工作流：选择模板 → 上传文件 → 列名映射 → 数据验证 → 激活使用
 *
 * 各模块通过 useCustomData hook 读取激活的数据集
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Trash2,
  Beaker, FlaskConical, Scale, MapPin, Table, ChevronRight,
  ChevronDown, ArrowRight, RefreshCw, Database, Power,
} from 'lucide-react';
import { TechCard, StatCard, DataSourceNote } from '../UI';
import { useToast } from '../Toast';
import {
  useCustomDataStore,
  DATA_TEMPLATES, getTemplate,
  autoMapColumns, applyMapping, validateData,
  type DataTemplateType, type ColumnMapping, type CustomDataset, type DataTemplate,
} from '../../store/customDataStore';

/** CSV解析 */
function parseCSV(text: string): { headers: string[]; rows: Record<string, unknown>[] } {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };
  const delimiter = lines[0].includes('\t') ? '\t' : lines[0].includes(';') ? ';' : ',';
  const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
  const rows: Record<string, unknown>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(delimiter).map(v => v.trim().replace(/^"|"$/g, ''));
    if (values.length < headers.length * 0.5) continue;
    const row: Record<string, unknown> = {};
    headers.forEach((h, idx) => { row[h] = values[idx] ?? ''; });
    rows.push(row);
  }
  return { headers, rows };
}

/** JSON解析 */
function parseJSON(text: string): { headers: string[]; rows: Record<string, unknown>[] } {
  const parsed = JSON.parse(text);
  const arr = Array.isArray(parsed) ? parsed : [parsed];
  if (arr.length === 0) return { headers: [], rows: [] };
  const headers = Object.keys(arr[0]);
  return { headers, rows: arr };
}

/** 模板图标映射 */
const TEMPLATE_ICONS: Record<string, React.ElementType> = {
  waterQuality: Beaker,
  hydrochemistry: FlaskConical,
  balance: Scale,
  monitoringWell: MapPin,
  generic: Table,
};

type Step = 'select' | 'upload' | 'mapping' | 'validation' | 'done';

const STEPS: { key: Step; label: string }[] = [
  { key: 'select', label: '选择模板' },
  { key: 'upload', label: '上传文件' },
  { key: 'mapping', label: '列名映射' },
  { key: 'validation', label: '验证' },
  { key: 'done', label: '完成' },
];

export function CustomDataTab() {
  const store = useCustomDataStore();
  const { init } = store;

  useEffect(() => { init(); }, [init]);

  const [step, setStep] = useState<Step>('select');
  const [selectedTemplate, setSelectedTemplate] = useState<DataTemplateType | null>(null);
  const [rawData, setRawData] = useState<{ headers: string[]; rows: Record<string, unknown>[] } | null>(null);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [fileName, setFileName] = useState('');
  const [datasetName, setDatasetName] = useState('');

  const activeCount = store.datasets.filter(d => d.active).length;

  const reset = () => {
    setStep('select');
    setSelectedTemplate(null);
    setRawData(null);
    setMappings([]);
    setFileName('');
    setDatasetName('');
  };

  return (
    <div className="space-y-4">
      {/* 标题卡 */}
      <TechCard>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-semibold text-gw-text flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            自定义数据接入
          </h2>
          <span className="text-xs text-gw-muted">D-04</span>
        </div>
        <p className="text-xs text-gw-muted">
          导入监测井 Excel/CSV 数据，自动映射为标准格式，经验证后各计算模块可直接使用。
          支持水质、水化学、均衡、监测井 4 种数据模板。
        </p>
      </TechCard>

      {/* 统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="数据模板" value={DATA_TEMPLATES.length} unit="种" accent="cyan" />
        <StatCard title="已导入" value={store.datasets.length} unit="个" accent="blue" />
        <StatCard title="已激活" value={activeCount} unit="个" accent="green" />
        <StatCard title="当前步骤" value={STEPS.find(s => s.key === step)?.label ?? '—'} accent="amber" />
      </div>

      {/* 步骤指示器 */}
      {step !== 'select' && (
        <div className="flex items-center gap-1 text-xs">
          {STEPS.map((s, i) => {
            const currentIdx = STEPS.findIndex(x => x.key === step);
            const isActive = i === currentIdx;
            const isDone = i < currentIdx;
            return (
              <React.Fragment key={s.key}>
                <span className={`px-2 py-1 rounded ${
                  isActive ? 'bg-gw-blue/15 text-gw-highlight' :
                  isDone ? 'text-emerald-400' : 'text-gw-muted/40'
                }`}>
                  {isDone && '✓ '}{s.label}
                </span>
                {i < STEPS.length - 1 && <ChevronRight size={12} className="text-gw-muted/30" />}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* 步骤内容 */}
      <div>
        {step === 'select' && (
          <>
            <TemplateSelector onSelect={(type) => { setSelectedTemplate(type); setStep('upload'); }} />
            <DatasetList />
          </>
        )}

        {step === 'upload' && selectedTemplate && (
          <UploadStep
            template={getTemplate(selectedTemplate)!}
            fileName={fileName}
            datasetName={datasetName}
            onNameChange={setDatasetName}
            onFile={(_, headers, rows) => {
              setRawData({ headers, rows });
              const template = getTemplate(selectedTemplate)!;
              setMappings(autoMapColumns(headers, template));
              setStep('mapping');
            }}
            onBack={reset}
          />
        )}

        {step === 'mapping' && rawData && selectedTemplate && (
          <MappingStep
            headers={rawData.headers}
            mappings={mappings}
            onMappingChange={setMappings}
            template={getTemplate(selectedTemplate)!}
            onNext={() => setStep('validation')}
            onBack={() => setStep('upload')}
          />
        )}

        {step === 'validation' && rawData && selectedTemplate && (
          <ValidationStep
            rawData={rawData}
            mappings={mappings}
            template={getTemplate(selectedTemplate)!}
            datasetName={datasetName || fileName}
            fileName={fileName}
            onComplete={reset}
            onBack={() => setStep('mapping')}
          />
        )}
      </div>

      <DataSourceNote source="用户上传数据存储于IndexedDB(hebei-gw-custom-data)，各模块通过useCustomData hook读取" version="D-04" />
    </div>
  );
}

// ============================================================
// 模板选择
// ============================================================

function TemplateSelector({ onSelect }: { onSelect: (type: DataTemplateType) => void }) {
  return (
    <TechCard title="选择数据模板" icon={FileSpreadsheet}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {DATA_TEMPLATES.filter(t => t.type !== 'generic').map(t => {
          const Icon = TEMPLATE_ICONS[t.type] ?? Table;
          return (
            <button
              key={t.type}
              onClick={() => onSelect(t.type)}
              className="p-4 rounded-lg border border-gw-border/20 hover:border-gw-blue/30 bg-gw-surface/30 hover:bg-gw-surface/50 transition-all text-left group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-gw-blue/10 flex items-center justify-center group-hover:bg-gw-blue/20 transition-colors">
                  <Icon size={18} className="text-gw-highlight" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gw-text">{t.name}</p>
                  <p className="text-[10px] text-gw-muted">{t.fields.length} 个字段 ({t.fields.filter(f => f.required).length} 必填)</p>
                </div>
              </div>
              <p className="text-[10px] text-gw-muted leading-relaxed">{t.description}</p>
            </button>
          );
        })}
      </div>
    </TechCard>
  );
}

// ============================================================
// 文件上传
// ============================================================

function UploadStep({ template, fileName, datasetName, onNameChange, onFile, onBack }: {
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

// ============================================================
// 列名映射
// ============================================================

function MappingStep({ headers, mappings, onMappingChange, template, onNext, onBack }: {
  headers: string[];
  mappings: ColumnMapping[];
  onMappingChange: (m: ColumnMapping[]) => void;
  template: DataTemplate;
  onNext: () => void;
  onBack: () => void;
}) {
  const [expandedPreview, setExpandedPreview] = useState(false);

  const updateMapping = (idx: number, targetField: string) => {
    const field = template.fields.find(f => f.name === targetField);
    const next = [...mappings];
    next[idx] = {
      ...next[idx],
      targetField,
      type: field?.type ?? 'string',
    };
    onMappingChange(next);
  };

  const autoMap = () => {
    onMappingChange(autoMapColumns(headers, template));
  };

  const mappedCount = mappings.filter(m => m.targetField).length;
  const requiredMapped = template.fields.filter(f => f.required && mappings.some(m => m.targetField === f.name)).length;
  const requiredTotal = template.fields.filter(f => f.required).length;

  return (
    <TechCard title="列名映射" icon={ArrowRight}>
      <div className="space-y-3">
        {/* 映射统计 */}
        <div className="flex items-center gap-4 text-[10px]">
          <span className="text-gw-muted">
            已映射: <span className="text-gw-highlight">{mappedCount}</span> / {headers.length}
          </span>
          <span className={requiredMapped === requiredTotal ? 'text-emerald-400' : 'text-amber-400'}>
            必填: {requiredMapped} / {requiredTotal}
          </span>
          <button onClick={autoMap} className="px-2 py-0.5 rounded bg-gw-surface text-gw-muted hover:text-gw-text border border-gw-border/30 transition-all flex items-center gap-1">
            <RefreshCw size={10} />
            重新自动映射
          </button>
        </div>

        {/* 映射表 */}
        <div className="space-y-1.5">
          {mappings.map((m, idx) => {
            const field = template.fields.find(f => f.name === m.targetField);
            return (
              <div key={idx} className="flex items-center gap-2 p-2 rounded bg-gw-surface/30 border border-gw-border/15">
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-gw-text">{m.sourceColumn}</span>
                  {field?.required && m.targetField && (
                    <span className="text-[9px] text-gw-blue/60 ml-1">必填</span>
                  )}
                </div>
                <ArrowRight size={12} className="text-gw-muted/40" />
                <select
                  value={m.targetField}
                  onChange={e => updateMapping(idx, e.target.value)}
                  className="flex-1 bg-gw-surface border border-gw-border/30 rounded px-2 py-1 text-xs text-gw-text focus:border-gw-blue/50 focus:outline-none"
                >
                  <option value="">— 不映射 —</option>
                  {template.fields.map(f => (
                    <option key={f.name} value={f.name}>
                      {f.label}{f.required ? ' *' : ''}{f.unit ? ` (${f.unit})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>

        {/* 预览 */}
        <button
          onClick={() => setExpandedPreview(!expandedPreview)}
          className="flex items-center gap-1 text-[10px] text-gw-muted hover:text-gw-text transition-colors"
        >
          {expandedPreview ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          数据预览
        </button>
        {expandedPreview && (
          <div className="overflow-x-auto max-h-48 border border-gw-border/20 rounded">
            <table className="w-full text-[10px]">
              <thead className="sticky top-0 bg-gw-card">
                <tr>
                  {headers.map(h => (
                    <th key={h} className="px-2 py-1 text-gw-muted font-medium text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: Math.min(5, headers.length > 0 ? 3 : 0) }).map((_, i) => (
                  <tr key={i} className="border-t border-gw-border/10">
                    {headers.map(h => (
                      <td key={h} className="px-2 py-1 text-gw-muted/70 whitespace-nowrap">—</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 按钮 */}
        <div className="flex justify-between">
          <button onClick={onBack} className="px-3 py-1.5 rounded text-xs bg-gw-surface text-gw-muted hover:text-gw-text border border-gw-border/30 transition-all">
            返回
          </button>
          <button
            onClick={onNext}
            disabled={requiredMapped < requiredTotal}
            className="px-4 py-1.5 rounded text-xs bg-gw-blue/15 text-gw-highlight border border-gw-blue/30 hover:bg-gw-blue/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            下一步: 验证
          </button>
        </div>
      </div>
    </TechCard>
  );
}

// ============================================================
// 验证与导入
// ============================================================

function ValidationStep({ rawData, mappings, template, datasetName, fileName, onComplete, onBack }: {
  rawData: { headers: string[]; rows: Record<string, unknown>[] };
  mappings: ColumnMapping[];
  template: DataTemplate;
  datasetName: string;
  fileName: string;
  onComplete: () => void;
  onBack: () => void;
}) {
  const { addDataset, activateDataset } = useCustomDataStore();
  const { success: toastSuccess, error: toastError } = useToast();
  const [importing, setImporting] = useState(false);

  const standardized = useMemo(() => applyMapping(rawData.rows, mappings, template), [rawData, mappings, template]);
  const validation = useMemo(() => validateData(standardized, template), [standardized, template]);

  const handleImport = async () => {
    setImporting(true);
    try {
      const dataset: CustomDataset = {
        id: `cd-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: datasetName,
        templateType: template.type,
        sourceFile: fileName,
        importedAt: new Date().toISOString(),
        originalColumns: rawData.headers,
        mappings,
        rows: standardized,
        rowCount: standardized.length,
        validation,
        active: true,
      };

      await addDataset(dataset);
      await activateDataset(dataset.id);
      toastSuccess(`数据集「${datasetName}」导入成功，已激活`);
      onComplete();
    } catch {
      toastError('导入失败');
    } finally {
      setImporting(false);
    }
  };

  return (
    <TechCard title="数据验证" icon={CheckCircle2}>
      <div className="space-y-3">
        {/* 验证结果摘要 */}
        <div className={`p-3 rounded-lg border ${
          validation.passed
            ? 'bg-emerald-500/10 border-emerald-500/20'
            : 'bg-amber-500/10 border-amber-500/20'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {validation.passed ? (
              <CheckCircle2 size={16} className="text-emerald-400" />
            ) : (
              <AlertCircle size={16} className="text-amber-400" />
            )}
            <span className={`text-xs font-medium ${validation.passed ? 'text-emerald-400' : 'text-amber-400'}`}>
              {validation.passed ? '验证通过' : '验证警告'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="text-gw-muted">总行数: <span className="text-gw-text">{validation.rowCount}</span></div>
            <div className="text-gw-muted">有效行: <span className="text-emerald-400">{validation.validRowCount}</span></div>
            {validation.missingFields.length > 0 && (
              <div className="col-span-2 text-amber-400">缺失字段: {validation.missingFields.join(', ')}</div>
            )}
          </div>
        </div>

        {/* 错误列表 */}
        {validation.errors.length > 0 && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-[10px] text-red-400 font-medium mb-1">错误</p>
            {validation.errors.map((e, i) => (
              <p key={i} className="text-[10px] text-red-400/70">{e}</p>
            ))}
          </div>
        )}

        {/* 警告列表 */}
        {validation.warnings.length > 0 && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-[10px] text-amber-400 font-medium mb-1">
              警告 ({validation.warnings.length})
            </p>
            <div className="max-h-32 overflow-y-auto">
              {validation.warnings.slice(0, 20).map((w, i) => (
                <p key={i} className="text-[10px] text-amber-400/70">{w}</p>
              ))}
              {validation.warnings.length > 20 && (
                <p className="text-[10px] text-amber-400/50">...还有 {validation.warnings.length - 20} 条</p>
              )}
            </div>
          </div>
        )}

        {/* 标准化数据预览 */}
        <div>
          <p className="text-[10px] text-gw-muted mb-1">标准化数据预览（前5行）</p>
          <div className="overflow-x-auto max-h-48 border border-gw-border/20 rounded">
            <table className="w-full text-[10px]">
              <thead className="sticky top-0 bg-gw-card">
                <tr>
                  {Object.keys(standardized[0] ?? {}).map(k => (
                    <th key={k} className="px-2 py-1 text-gw-muted font-medium text-left whitespace-nowrap">
                      {template.fields.find(f => f.name === k)?.label ?? k}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {standardized.slice(0, 5).map((row, i) => (
                  <tr key={i} className="border-t border-gw-border/10">
                    {Object.keys(standardized[0] ?? {}).map(k => (
                      <td key={k} className="px-2 py-1 text-gw-muted/70 whitespace-nowrap">
                        {String(row[k] ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 按钮 */}
        <div className="flex justify-between">
          <button onClick={onBack} className="px-3 py-1.5 rounded text-xs bg-gw-surface text-gw-muted hover:text-gw-text border border-gw-border/30 transition-all">
            返回修改
          </button>
          <button
            onClick={handleImport}
            disabled={importing || validation.validRowCount === 0}
            className="px-4 py-1.5 rounded text-xs bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
          >
            {importing ? <RefreshCw size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
            确认导入并激活
          </button>
        </div>
      </div>
    </TechCard>
  );
}

// ============================================================
// 已导入数据集列表
// ============================================================

function DatasetList() {
  const { datasets, deleteDataset, activateDataset } = useCustomDataStore();
  const [expanded, setExpanded] = useState<string | null>(null);

  // 按类型分组
  const grouped = useMemo(() => {
    const g: Record<string, CustomDataset[]> = {};
    for (const d of datasets) {
      if (!g[d.templateType]) g[d.templateType] = [];
      g[d.templateType].push(d);
    }
    return g;
  }, [datasets]);

  if (datasets.length === 0) {
    return (
      <TechCard>
        <div className="flex flex-col items-center py-6 text-center">
          <Database size={28} className="text-gw-muted/30 mb-2" />
          <p className="text-xs text-gw-muted">暂无已导入数据集</p>
          <p className="text-[10px] text-gw-muted/60 mt-1">选择上方模板开始导入数据</p>
        </div>
      </TechCard>
    );
  }

  return (
    <div className="space-y-3 mt-4">
      <p className="text-xs text-gw-muted">已导入数据集（按类型分组）</p>
      {Object.entries(grouped).map(([type, items]) => {
        const template = getTemplate(type as DataTemplateType);
        const Icon = TEMPLATE_ICONS[type] ?? Table;
        return (
          <TechCard key={type}>
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} className="text-gw-highlight" />
              <span className="text-xs font-medium text-gw-text">{template?.name ?? type}</span>
              <span className="text-[10px] text-gw-muted">({items.length}个)</span>
            </div>
            <div className="space-y-1.5">
              {items.map(d => (
                <div key={d.id}>
                  <div className={`flex items-center gap-2 p-2 rounded border transition-all ${
                    d.active ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-gw-surface/20 border-gw-border/15'
                  }`}>
                    <button
                      onClick={() => setExpanded(expanded === d.id ? null : d.id)}
                      className="p-0.5 text-gw-muted/40 hover:text-gw-text transition-colors"
                    >
                      {expanded === d.id ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gw-text truncate">{d.name}</span>
                        {d.active && (
                          <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-500/15 text-emerald-400 flex items-center gap-0.5">
                            <Power size={8} /> 激活
                          </span>
                        )}
                      </div>
                      <div className="text-[9px] text-gw-muted">
                        {d.rowCount}行 · {new Date(d.importedAt).toLocaleDateString('zh-CN')}
                        {d.validation.warnings.length > 0 && ` · ${d.validation.warnings.length}个警告`}
                      </div>
                    </div>
                    {!d.active && (
                      <button
                        onClick={() => activateDataset(d.id)}
                        className="text-[9px] px-2 py-0.5 rounded bg-gw-surface text-gw-muted hover:text-emerald-400 border border-gw-border/30 transition-all"
                      >
                        激活
                      </button>
                    )}
                    <button
                      onClick={() => deleteDataset(d.id)}
                      className="p-0.5 text-gw-muted/40 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  {expanded === d.id && (
                    <div className="p-2 ml-6 mt-1 rounded bg-gw-surface/20 border border-gw-border/10">
                      <div className="text-[9px] text-gw-muted space-y-0.5">
                        <p>来源文件: {d.sourceFile}</p>
                        <p>字段映射: {d.mappings.filter(m => m.targetField).length} / {d.originalColumns.length} 列已映射</p>
                        <p>验证: {d.validation.passed ? '通过' : '有警告'} · 有效{d.validation.validRowCount}行</p>
                        <p>字段: {d.mappings.filter(m => m.targetField).map(m => m.targetField).join(', ')}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TechCard>
        );
      })}
    </div>
  );
}
