/**
 * G-02 IDB 缓存与离线分析面板
 *
 * 提供可视化 UI：
 *   1. 缓存概览：各通道缓存条数 + 总大小
 *   2. 离线分析：通道选择 → 统计摘要 + 站点对比 + 小时热力图
 *   3. 缓存管理：清理通道/全部清理/过期清理/数据导出
 *   4. 日统计：预聚合统计表格
 */

import { useState, useEffect, useMemo } from 'react';
import {
  realtimeCache,
  type OfflineAnalysisResult,
} from '../../services/realtimeCache';
import {
  useRealtimeCache,
  useCacheManager,
  useChannelStats,
} from '../../hooks/useRealtimeCache';
import type { DataChannel } from '../../services/realtimeDataService';
import { useI18n } from '../../hooks/useI18n';

import { CHANNELS, CHANNEL_LABELS, CHANNEL_COLORS } from './offlineAnalysisConstants';
import { OfflineAnalysisResultPanel } from './OfflineAnalysisResultPanel';
export function OfflineAnalysisPanel(): React.ReactElement {
  const { t } = useI18n();
  const { ready, counts, cacheSize, refresh: refreshCache } = useRealtimeCache();
  const { clearChannel, clearAll, cleanup, exportChannel } = useCacheManager();

  const [selectedChannel, setSelectedChannel] = useState<DataChannel>('waterLevel');
  const [analysis, setAnalysis] = useState<OfflineAnalysisResult | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<string | null>(null);

  // 日统计
  const { stats, loading: statsLoading } = useChannelStats(selectedChannel, 7);

  // 执行离线分析
  useEffect(() => {
    if (!ready) return;
    setAnalysisLoading(true);
    realtimeCache.analyzeChannel(selectedChannel).then(result => {
      setAnalysis(result);
      setAnalysisLoading(false);
    });
  }, [selectedChannel, ready]);

  // 导出数据
  const handleExport = async (channel: DataChannel, format: 'csv' | 'json') => {
    const data = await exportChannel(channel, format);
    const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `realtime-${channel}-${Date.now()}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 清理通道
  const handleClearChannel = async (channel: DataChannel) => {
    const deleted = await clearChannel(channel);
    setCleanupResult(`已清除 ${CHANNEL_LABELS[channel]} 缓存 ${deleted} 条`);
    refreshCache();
    setTimeout(() => setCleanupResult(null), 3000);
  };

  // 清理全部
  const handleClearAll = async () => {
    await clearAll();
    setCleanupResult('已清除全部缓存');
    refreshCache();
    setTimeout(() => setCleanupResult(null), 3000);
  };

  // 过期清理
  const handleCleanup = async () => {
    const result = await cleanup();
    setCleanupResult(`过期清理: 删除 ${result.readingsDeleted} 条（${new Date(result.expiredBefore).toLocaleString('zh-CN')} 之前）`);
    refreshCache();
    setTimeout(() => setCleanupResult(null), 5000);
  };

  // 格式化大小
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const totalCached = useMemo(() =>
    Object.values(counts).reduce((s, v) => s + v, 0),
  [counts]);


  return (
    <div className="space-y-4">
      {/* 缓存概览 */}
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/80 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200">
            {t('realtime.cacheOverview') || '缓存概览'}
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">
              总计 {totalCached} 条 · {formatSize(cacheSize)}
            </span>
            <button
              onClick={refreshCache}
              className="text-xs px-2 py-0.5 rounded border border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              刷新
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3">
          {CHANNELS.map(ch => (
            <div
              key={ch}
              className="rounded border border-slate-700 bg-slate-900/50 p-2 text-center"
            >
              <div className="text-xs text-slate-400">{CHANNEL_LABELS[ch]}</div>
              <div
                className="text-lg font-bold mt-1"
                style={{ color: CHANNEL_COLORS[ch] }}
              >
                {counts[ch]}
              </div>
              <div className="text-[10px] text-slate-600">条缓存</div>
            </div>
          ))}
        </div>
      </div>

      {/* 离线分析 */}
      <OfflineAnalysisResultPanel
        analysis={analysis}
        analysisLoading={analysisLoading}
        selectedChannel={selectedChannel}
        onChannelChange={setSelectedChannel}
      />

      {/* 日统计表 */}
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200">
            {t('realtime.dailyStats') || '日统计（最近7天）'}
          </h3>
        </div>
        {statsLoading ? (
          <div className="p-4 text-center text-slate-500 text-sm">加载中...</div>
        ) : stats.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-800/60 text-slate-400">
                <tr>
                  <th className="px-3 py-2 text-left">日期</th>
                  <th className="px-3 py-2 text-right">样本数</th>
                  <th className="px-3 py-2 text-right">均值</th>
                  <th className="px-3 py-2 text-right">最小</th>
                  <th className="px-3 py-2 text-right">最大</th>
                  <th className="px-3 py-2 text-right">标准差</th>
                  <th className="px-3 py-2 text-right">中位数</th>
                  <th className="px-3 py-2 text-right">P25</th>
                  <th className="px-3 py-2 text-right">P75</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {stats.map(s => (
                  <tr key={s.id} className="hover:bg-slate-700/30">
                    <td className="px-3 py-2 text-slate-300">{s.date}</td>
                    <td className="px-3 py-2 text-right text-slate-400">{s.count}</td>
                    <td className="px-3 py-2 text-right text-slate-200">{s.mean.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right text-slate-400">{s.min.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right text-slate-400">{s.max.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right text-slate-400">{s.std.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right text-slate-400">{s.median.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right text-slate-400">{s.p25.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right text-slate-400">{s.p75.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 text-center text-slate-500 text-sm">暂无统计数据</div>
        )}
      </div>

      {/* 缓存管理 */}
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200">
            {t('realtime.cacheManagement') || '缓存管理'}
          </h3>
        </div>
        <div className="p-3 space-y-2">
          {/* 通道操作 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {CHANNELS.map(ch => (
              <div key={ch} className="flex items-center gap-2 p-2 rounded border border-slate-700">
                <span className="text-xs text-slate-300 flex-1">{CHANNEL_LABELS[ch]}</span>
                <button
                  onClick={() => handleExport(ch, 'csv')}
                  className="text-[10px] px-2 py-0.5 rounded border border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  CSV
                </button>
                <button
                  onClick={() => handleExport(ch, 'json')}
                  className="text-[10px] px-2 py-0.5 rounded border border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  JSON
                </button>
                <button
                  onClick={() => handleClearChannel(ch)}
                  className="text-[10px] px-2 py-0.5 rounded border border-red-900/50 text-red-400 hover:bg-red-900/20"
                >
                  清除
                </button>
              </div>
            ))}
          </div>

          {/* 全局操作 */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-700/50">
            <button
              onClick={handleCleanup}
              className="text-xs px-3 py-1 rounded border border-yellow-900/50 text-yellow-400 hover:bg-yellow-900/20"
            >
              过期清理
            </button>
            <button
              onClick={handleClearAll}
              className="text-xs px-3 py-1 rounded border border-red-900/50 text-red-400 hover:bg-red-900/20"
            >
              清除全部缓存
            </button>
          </div>

          {cleanupResult && (
            <div className="text-xs text-blue-400 bg-blue-900/20 rounded px-3 py-2">
              {cleanupResult}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
