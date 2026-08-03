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

const CHANNEL_LABELS: Record<DataChannel, string> = {
  waterLevel: '水位埋深',
  waterQuality: '水质达标率',
  subsidence: '沉降速率',
  extraction: '开采量',
};

const CHANNEL_COLORS: Record<DataChannel, string> = {
  waterLevel: '#06b6d4',
  waterQuality: '#10b981',
  subsidence: '#ef4444',
  extraction: '#f59e0b',
};

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

  // 小时热力图颜色
  const getHeatColor = (value: number, max: number): string => {
    if (max === 0) return 'bg-slate-800';
    const ratio = value / max;
    if (ratio > 0.75) return 'bg-red-500';
    if (ratio > 0.5) return 'bg-orange-500';
    if (ratio > 0.25) return 'bg-yellow-500';
    if (ratio > 0) return 'bg-green-500';
    return 'bg-slate-800';
  };

  const totalCached = useMemo(() =>
    Object.values(counts).reduce((s, v) => s + v, 0),
  [counts]);

  const maxHourly = analysis ? Math.max(...analysis.hourlyAverages, 1) : 1;

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
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/80 flex items-center gap-3">
          <h3 className="text-sm font-semibold text-slate-200">
            {t('realtime.offlineAnalysis') || '离线分析'}
          </h3>
          <select
            value={selectedChannel}
            onChange={e => setSelectedChannel(e.target.value as DataChannel)}
            className="text-xs bg-slate-700 text-slate-200 rounded px-2 py-1 border border-slate-600"
          >
            {CHANNELS.map(ch => (
              <option key={ch} value={ch}>{CHANNEL_LABELS[ch]}</option>
            ))}
          </select>
        </div>

        {analysisLoading ? (
          <div className="p-8 text-center text-slate-500 text-sm">分析中...</div>
        ) : analysis && analysis.totalReadings > 0 ? (
          <div className="p-4 space-y-4">
            {/* 统计摘要 */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {[
                { label: '样本数', value: analysis.totalReadings },
                { label: '站点数', value: analysis.stationCount },
                { label: '均值', value: analysis.stats.mean.toFixed(2) },
                { label: '最小值', value: analysis.stats.min.toFixed(2) },
                { label: '最大值', value: analysis.stats.max.toFixed(2) },
                { label: '标准差', value: analysis.stats.std.toFixed(2) },
              ].map(item => (
                <div key={item.label} className="text-center">
                  <div className="text-xs text-slate-500">{item.label}</div>
                  <div className="text-sm font-semibold text-slate-200 mt-0.5">{item.value}</div>
                </div>
              ))}
            </div>

            {/* 时间范围 */}
            {analysis.timeRange && (
              <div className="text-xs text-slate-500 text-center">
                数据时间范围: {new Date(analysis.timeRange.start).toLocaleString('zh-CN')}
                {' → '}
                {new Date(analysis.timeRange.end).toLocaleString('zh-CN')}
              </div>
            )}

            {/* 站点对比 */}
            <div>
              <div className="text-xs text-slate-400 mb-2">站点对比</div>
              <div className="space-y-1">
                {analysis.byStation
                  .sort((a, b) => a.mean - b.mean)
                  .map(station => {
                    const range = analysis.stats.max - analysis.stats.min || 1;
                    const widthPercent = ((station.mean - analysis.stats.min) / range) * 100;
                    return (
                      <div key={station.stationId} className="flex items-center gap-2 text-xs">
                        <span className="w-20 text-slate-400 truncate">{station.stationName}</span>
                        <div className="flex-1 bg-slate-900 rounded h-5 relative overflow-hidden">
                          <div
                            className="h-full rounded transition-all"
                            style={{
                              width: `${Math.max(widthPercent, 5)}%`,
                              backgroundColor: CHANNEL_COLORS[selectedChannel],
                            }}
                          />
                        </div>
                        <span className="w-12 text-right text-slate-300">
                          {station.mean.toFixed(2)}
                        </span>
                        <span className="w-16 text-right text-slate-600">
                          ({station.count}条)
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* 小时热力图 */}
            <div>
              <div className="text-xs text-slate-400 mb-2">24h 均值热力图</div>
              <div className="grid grid-cols-12 md:grid-cols-24 gap-0.5">
                {analysis.hourlyAverages.map((val, hour) => (
                  <div
                    key={hour}
                    className={`h-8 rounded-sm flex items-center justify-center text-[9px] ${getHeatColor(val, maxHourly)}`}
                    title={`${hour}:00 — 均值 ${val.toFixed(2)}`}
                  >
                    {val > 0 ? val.toFixed(1) : ''}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[9px] text-slate-600 mt-1">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>23:00</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 text-sm">
            该通道暂无缓存数据，请等待实时数据采集
          </div>
        )}
      </div>

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
