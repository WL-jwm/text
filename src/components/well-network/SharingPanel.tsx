/**
 * H-01 井网面板 - 数据共享与对接面板（自 WellNetworkPanel 拆分）
 */
import { useState, useEffect } from 'react';
import { RefreshCw, ChevronDown, CircleDot, Upload, Layers } from 'lucide-react';
import { DataSourceConfigManager, DEFAULT_CHANNELS, testConnection } from '../../services/dataSourceConfigManager';
import type { DataSourceConfig } from '../../services/dataSourceConfigManager';
import type { ImportPreviewRow } from '../../services/dataImporter';
import { previewImport, importWells } from '../../services/dataImporter';
import type { Well } from '../../services/wellNetwork';

export interface SharingPanelProps {
  open: boolean;
  onToggle: () => void;
  addWell: (well: Omit<Well, 'id'>) => Well | null;
}

export function SharingPanel(props: SharingPanelProps) {
  const { open, onToggle, addWell } = props;
  const [configMgr] = useState(() => new DataSourceConfigManager());
  const [dsConfigs, setDsConfigs] = useState<DataSourceConfig[]>([]);
  const [showAddDs, setShowAddDs] = useState(false);
  const [dsName, setDsName] = useState('');
  const [dsType, setDsType] = useState<'http' | 'ws'>('http');
  const [dsEndpoint, setDsEndpoint] = useState('');
  const [dsTestResult, setDsTestResult] = useState<string | null>(null);
  const [dsTesting, setDsTesting] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [importPreview, setImportPreview] = useState<{ headers: string[]; previewRows: ImportPreviewRow[]; error?: string } | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  useEffect(() => {
    setDsConfigs(configMgr.getAll());
    const unsub = configMgr.subscribe(() => setDsConfigs([...configMgr.getAll()]));
    return unsub;
  }, [configMgr]);

  return (
        <div className="border-t border-gw-border/10 pt-2 mt-2">
          <div className="flex items-center justify-between mb-1">
            <button
              onClick={onToggle}
              className="flex items-center gap-1 text-[10px] text-gw-muted hover:text-gw-text transition-colors"
            >
              <RefreshCw size={11} className="text-gw-muted/60" />
              <span>数据共享与对接</span>
              <span className="text-[8px] font-mono px-1 rounded bg-gw-surface/30 text-gw-muted">
                {dsConfigs.length} 数据源
              </span>
              <ChevronDown size={9} className={`transition-transform ml-auto ${open ? 'rotate-0' : '-rotate-90'}`} />
            </button>
          </div>

          {open && (
            <div className="space-y-2">
              {/* 数据源配置 */}
              <div className="px-1.5 py-1 rounded-lg bg-gw-surface/20 border border-gw-border/10">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <CircleDot size={10} className="text-gw-cyan" />
                    <span className="text-[9px] font-medium text-gw-muted">外部数据源</span>
                  </div>
                  <button
                    onClick={() => setShowAddDs(!showAddDs)}
                    className="text-[8px] px-1.5 py-0.5 rounded bg-gw-cyan/20 text-gw-cyan hover:bg-gw-cyan/30 transition-colors"
                  >
                    + 添加
                  </button>
                </div>

                {/* 添加数据源表单 */}
                {showAddDs && (
                  <div className="space-y-1.5 mb-2 p-1.5 rounded bg-gw-surface/30 border border-gw-border/10">
                    <input
                      value={dsName}
                      onChange={e => setDsName(e.target.value)}
                      placeholder="数据源名称"
                      className="w-full text-[8px] bg-gw-surface/40 border border-gw-border/30 rounded px-1.5 py-1 text-gw-text focus:outline-none"
                    />
                    <div className="flex items-center gap-1">
                      <select
                        value={dsType}
                        onChange={e => setDsType(e.target.value as 'http' | 'ws')}
                        className="text-[8px] bg-gw-surface/40 border border-gw-border/30 rounded px-1.5 py-1 text-gw-text focus:outline-none"
                      >
                        <option value="http">HTTP</option>
                        <option value="ws">WebSocket</option>
                      </select>
                      <input
                        value={dsEndpoint}
                        onChange={e => setDsEndpoint(e.target.value)}
                        placeholder="端点 URL"
                        className="flex-1 text-[8px] bg-gw-surface/40 border border-gw-border/30 rounded px-1.5 py-1 text-gw-text focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={async () => {
                          setDsTesting(true);
                          setDsTestResult(null);
                          const config = new DataSourceConfigManager().add({ name: dsName, type: dsType, endpoint: dsEndpoint });
                          const result = await testConnection({
                            ...config,
                            channels: DEFAULT_CHANNELS,
                            enabled: true,
                            status: 'untested',
                            createdAt: '',
                            updatedAt: '',
                          });
                          setDsTestResult(result.message);
                          setDsTesting(false);
                        }}
                        disabled={dsTesting || !dsEndpoint}
                        className="text-[8px] px-1.5 py-0.5 rounded bg-gw-surface/40 text-gw-muted hover:text-gw-text transition-colors disabled:opacity-50"
                      >
                        {dsTesting ? '测试中...' : '测试连接'}
                      </button>
                      <button
                        onClick={() => {
                          if (!dsName || !dsEndpoint) return;
                          configMgr.add({ name: dsName, type: dsType, endpoint: dsEndpoint });
                          setDsName('');
                          setDsEndpoint('');
                          setDsTestResult(null);
                          setShowAddDs(false);
                        }}
                        disabled={!dsName || !dsEndpoint}
                        className="text-[8px] px-1.5 py-0.5 rounded bg-gw-cyan/20 text-gw-cyan hover:bg-gw-cyan/30 transition-colors disabled:opacity-50 ml-auto"
                      >
                        保存
                      </button>
                    </div>
                    {dsTestResult && (
                      <div className="text-[7px] text-gw-muted/60">{dsTestResult}</div>
                    )}
                  </div>
                )}

                {/* 数据源列表 */}
                {dsConfigs.length === 0 ? (
                  <div className="text-[8px] text-gw-muted/50 text-center py-1">暂无配置，点击"+ 添加"添加数据源</div>
                ) : (
                  <div className="space-y-0.5 max-h-32 overflow-y-auto">
                    {dsConfigs.map(cfg => (
                      <div key={cfg.id} className="flex items-center gap-1 px-1 py-0.5 rounded text-[8px] bg-gw-surface/10 border border-gw-border/10">
                        <span className={`w-1 h-1 rounded-full ${cfg.status === 'connected' ? 'bg-emerald-400' : cfg.status === 'error' ? 'bg-red-400' : 'bg-gw-muted/40'}`} />
                        <span className="w-12 truncate text-gw-text">{cfg.name}</span>
                        <span className="text-gw-muted/50">{cfg.type.toUpperCase()}</span>
                        <span className="flex-1 truncate text-gw-muted/40">{cfg.endpoint}</span>
                        <button
                          onClick={() => configMgr.toggleEnabled(cfg.id)}
                          className={`text-[7px] px-1 rounded ${cfg.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gw-surface/30 text-gw-muted/50'}`}
                        >
                          {cfg.enabled ? '启用' : '禁用'}
                        </button>
                        <button
                          onClick={() => configMgr.remove(cfg.id)}
                          className="text-[7px] px-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20"
                        >
                          删除
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CSV 导入 */}
              <div className="px-1.5 py-1 rounded-lg bg-gw-surface/20 border border-gw-border/10">
                <div className="flex items-center gap-1 mb-1">
                  <Upload size={10} className="text-gw-cyan" />
                  <span className="text-[9px] font-medium text-gw-muted">导入监测井台账</span>
                </div>

                <textarea
                  value={csvText}
                  onChange={e => {
                    setCsvText(e.target.value);
                    setImportPreview(null);
                    setImportStatus(null);
                  }}
                  placeholder="粘贴 CSV 数据（第一行为表头，支持中文列名：名称,城市,经度,纬度,井深,含水层,监测指标,状态）"
                  className="w-full h-16 text-[8px] bg-gw-surface/40 border border-gw-border/30 rounded px-1.5 py-1 text-gw-text focus:outline-none resize-none"
                />

                <div className="flex items-center gap-1 mt-1">
                  <button
                    onClick={() => {
                      if (!csvText.trim()) return;
                      const result = previewImport(csvText);
                      setImportPreview(result);
                      setImportStatus(null);
                    }}
                    disabled={!csvText.trim()}
                    className="text-[8px] px-1.5 py-0.5 rounded bg-gw-cyan/20 text-gw-cyan hover:bg-gw-cyan/30 transition-colors disabled:opacity-50"
                  >
                    预览
                  </button>
                  <button
                    onClick={() => {
                      if (!importPreview || importPreview.previewRows.length === 0) return;
                      const result = importWells(importPreview.previewRows, (well) => addWell(well));
                      setImportStatus(`导入完成: ${result.importedCount} 成功, ${result.failedCount} 失败`);
                      setCsvText('');
                      setImportPreview(null);
                    }}
                    disabled={!importPreview || importPreview.previewRows.filter(r => r.valid).length === 0}
                    className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                  >
                    确认导入
                  </button>
                  {importStatus && <span className="text-[8px] text-gw-muted/60">{importStatus}</span>}
                </div>

                {/* 预览结果 */}
                {importPreview && (
                  <div className="mt-1 space-y-0.5">
                    <div className="text-[7px] text-gw-muted/50">
                      识别到 {importPreview.headers.length} 列 · {importPreview.previewRows.length} 行
                      · 有效 {importPreview.previewRows.filter(r => r.valid).length} 行
                      · 无效 {importPreview.previewRows.filter(r => !r.valid).length} 行
                      {importPreview.error && <span className="text-red-400"> · {importPreview.error}</span>}
                    </div>
                    <div className="max-h-24 overflow-y-auto space-y-0.5">
                      {importPreview.previewRows.slice(0, 10).map(row => (
                        <div key={row.rowNum} className={`flex items-center gap-1 px-1 py-0.5 rounded text-[7px] ${row.valid ? 'bg-emerald-500/5' : 'bg-red-500/10'}`}>
                          <span className="w-6 text-gw-muted/50">L{row.rowNum}</span>
                          <span className={`w-1 h-1 rounded-full ${row.valid ? 'bg-emerald-400' : 'bg-red-400'}`} />
                          <span className="text-gw-text">{row.well?.name ?? row.raw.name ?? '—'}</span>
                          <span className="text-gw-muted/50">{row.well?.city ?? row.raw.city ?? '—'}</span>
                          {!row.valid && <span className="text-red-400 ml-auto">{row.errors[0]}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 共享接口说明 */}
              <div className="px-1.5 py-1 rounded-lg bg-gw-surface/20 border border-gw-border/10">
                <div className="flex items-center gap-1 mb-0.5">
                  <Layers size={10} className="text-gw-muted/60" />
                  <span className="text-[9px] font-medium text-gw-muted">数据共享接口</span>
                </div>
                <div className="text-[7px] text-gw-muted/50 space-y-0.5">
                  <p>• 导出: 点击上方"导出数据"按钮，选择 Excel/CSV/JSON 格式</p>
                  <p>• 导入: 粘贴 CSV 格式的监测井台账数据，支持自动列映射</p>
                  <p>• 数据源: 配置 HTTP/WebSocket 数据源，对接外部监测系统</p>
                  <p>• 标准格式: 导出数据遵循地下水监测数据交换标准格式</p>
                </div>
              </div>
            </div>
          )}
        </div>

  );
}
