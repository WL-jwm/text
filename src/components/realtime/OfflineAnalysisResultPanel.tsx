/**
 * 拆分自 OfflineAnalysisPanel.tsx — 离线分析结果面板
 * （通道选择 + 统计摘要 + 时间范围 + 站点对比 + 24h 热力图）
 */

import type { OfflineAnalysisResult } from '../../services/realtimeCache';
import type { DataChannel } from '../../services/realtimeDataService';
import { useI18n } from '../../hooks/useI18n';
import { CHANNELS, CHANNEL_LABELS, CHANNEL_COLORS } from './offlineAnalysisConstants';

export function OfflineAnalysisResultPanel({
  analysis,
  analysisLoading,
  selectedChannel,
  onChannelChange,
}: {
  analysis: OfflineAnalysisResult | null;
  analysisLoading: boolean;
  selectedChannel: DataChannel;
  onChannelChange: (ch: DataChannel) => void;
}) {
  const { t } = useI18n();
  const maxHourly = analysis ? Math.max(...analysis.hourlyAverages, 1) : 1;

  const getHeatColor = (value: number, max: number): string => {
    if (max === 0) return 'bg-slate-800';
    const ratio = value / max;
    if (ratio > 0.75) return 'bg-red-500';
    if (ratio > 0.5) return 'bg-orange-500';
    if (ratio > 0.25) return 'bg-yellow-500';
    if (ratio > 0) return 'bg-green-500';
    return 'bg-slate-800';
  };


  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/50 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/80 flex items-center gap-3">
        <h3 className="text-sm font-semibold text-slate-200">
          {t('realtime.offlineAnalysis') || '离线分析'}
        </h3>
        <select
          value={selectedChannel}
          onChange={e => onChannelChange(e.target.value as DataChannel)}
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
  );
}
