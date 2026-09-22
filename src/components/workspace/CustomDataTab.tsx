/**
 * CustomDataTab — 用户自定义数据接入 (D-04)
 *
 * 工作台第 10 个 Tab，提供用户自有监测数据的导入、映射、验证和管理。
 * 工作流：选择模板 → 上传文件 → 列名映射 → 数据验证 → 激活使用
 *
 * 各模块通过 useCustomData hook 读取激活的数据集
 * （步骤组件与解析工具已拆分为独立文件）
 */
import { Fragment, useState, useEffect } from 'react';
import { ChevronRight, Database } from 'lucide-react';
import { TechCard, StatCard, DataSourceNote } from '../UI';
import {
  useCustomDataStore, DATA_TEMPLATES, getTemplate, autoMapColumns,
  type DataTemplateType, type ColumnMapping,
} from '../../store/customDataStore';
import { TemplateSelector } from './steps/TemplateSelector';
import { UploadStep } from './steps/UploadStep';
import { MappingStep } from './steps/MappingStep';
import { ValidationStep } from './steps/ValidationStep';
import { DatasetList } from './steps/DatasetList';

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
              <Fragment key={s.key}>
                <span className={`px-2 py-1 rounded ${
                  isActive ? 'bg-gw-blue/15 text-gw-highlight' :
                  isDone ? 'text-emerald-400' : 'text-gw-muted/40'
                }`}>
                  {isDone && '✓ '}{s.label}
                </span>
                {i < STEPS.length - 1 && <ChevronRight size={12} className="text-gw-muted/30" />}
              </Fragment>
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
