/**
 * ExportProgressDialog — 导出进度对话框
 * 
 * 点击"导出报告"后弹出，显示生成进度，完成后自动下载。
 */
import { useState, useCallback } from 'react';
import { FileText, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { loadReportGenerator } from '../services/reportGeneratorLoader';

interface ExportProgressDialogProps {
  /** 对话框是否可见 */
  open: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 报告类型 */
  reportType: string;
  /** 报告显示名称 */
  reportLabel: string;
  /** 报告数据（从缓存读取） */
  data: Record<string, unknown> | null;
  /** 数据是否正在加载 */
  dataLoading?: boolean;
  /** 章节选择（可选） */
  chapters?: string[];
  /** 所有可选章节 */
  availableChapters?: Array<{ key: string; label: string }>;
}

type ExportStatus = 'idle' | 'generating' | 'success' | 'error';

export function ExportProgressDialog({
  open,
  onClose,
  reportType,
  reportLabel,
  data,
  dataLoading = false,
  chapters,
  availableChapters,
}: ExportProgressDialogProps) {
  const [status, setStatus] = useState<ExportStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedChapters, setSelectedChapters] = useState<string[]>(chapters || []);

  // 初始化章节选择
  useState(() => {
    if (!chapters && availableChapters) {
      setSelectedChapters(availableChapters.map(c => c.key));
    }
  });

  const handleGenerate = useCallback(async () => {
    if (!data) {
      setStatus('error');
      setErrorMsg('数据未就绪，请稍后再试');
      return;
    }

    setStatus('generating');
    setProgress(0);

    try {
      // 动态加载报告生成器核心库（docx + file-saver，~357KB）
      const { generateTypedReport } = await import('../services/reportGenerator');
      // 动态加载具体报告生成器
      await loadReportGenerator(reportType);
      await generateTypedReport(reportType, data, (pct) => {
        setProgress(pct);
      });
      setStatus('success');
      setProgress(100);
      // 成功后自动关闭
      setTimeout(() => {
        onClose();
        setStatus('idle');
        setProgress(0);
      }, 1500);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : '生成失败');
    }
  }, [data, reportType, onClose]);

  // 重置状态
  const handleClose = useCallback(() => {
    if (status === 'generating') return; // 生成中不允许关闭
    setStatus('idle');
    setProgress(0);
    setErrorMsg('');
    onClose();
  }, [status, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}>

        {/* 头部 */}
        <div className="px-6 pt-5 pb-3 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
              <FileText size={20} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">导出报告</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{reportLabel}</p>
            </div>
          </div>
        </div>

        {/* 章节选择（仅 idle 状态显示） */}
        {status === 'idle' && availableChapters && availableChapters.length > 0 && (
          <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">选择导出章节：</p>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {availableChapters.map(ch => (
                <label key={ch.key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedChapters.includes(ch.key)}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedChapters(prev => [...prev, ch.key]);
                      } else {
                        setSelectedChapters(prev => prev.filter(k => k !== ch.key));
                      }
                    }}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-gray-700 dark:text-gray-300">{ch.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* 进度/状态区域 */}
        <div className="px-6 py-5">
          {status === 'idle' && (
            <div className="text-center">
              {dataLoading ? (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Loader2 size={16} className="animate-spin" />
                  数据采集中...
                </div>
              ) : data ? (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  数据已就绪，点击下方按钮开始生成
                </p>
              ) : (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  数据尚未采集完成，请稍后再试
                </p>
              )}
            </div>
          )}

          {status === 'generating' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>正在生成报告...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center">
                {progress < 50 ? '正在构建文档...' : '正在打包下载...'}
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center py-2">
              <CheckCircle size={36} className="mx-auto text-emerald-500 mb-2" />
              <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">生成完成</p>
              <p className="text-xs text-gray-500 mt-1">文件已开始下载</p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-2">
              <XCircle size={36} className="mx-auto text-red-500 mb-2" />
              <p className="text-sm text-red-700 dark:text-red-400 font-medium">生成失败</p>
              <p className="text-xs text-gray-500 mt-1">{errorMsg}</p>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
          {status === 'idle' && (
            <>
              <button onClick={handleClose}
                className="px-4 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                取消
              </button>
              <button onClick={handleGenerate}
                disabled={!data || dataLoading}
                className="px-4 py-1.5 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                生成并下载
              </button>
            </>
          )}
          {status === 'generating' && (
            <button disabled
              className="px-4 py-1.5 text-xs bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed">
              生成中...
            </button>
          )}
          {status === 'success' && (
            <button onClick={handleClose}
              className="px-4 py-1.5 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
              完成
            </button>
          )}
          {status === 'error' && (
            <>
              <button onClick={handleClose}
                className="px-4 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                关闭
              </button>
              <button onClick={handleGenerate}
                className="px-4 py-1.5 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                重试
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
