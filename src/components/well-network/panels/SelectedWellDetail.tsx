/**
 * 监测井网 — 选中井详情面板（自 WellNetworkPanel.tsx 拆分）
 */
import { CircleDot, Clock } from 'lucide-react';
import { RealtimeStatusBadge } from '../RealtimeStatusBadge';
import { TrendSparkline } from '../TrendSparkline';
import { CHANNEL_LABELS } from '../constants';
import { WELL_REALTIME_STATUS_CONFIG, type WellWithData } from '../../../services/wellRealtime';
import { AQUIFER_LABELS, type WellDistance } from '../../../services/wellNetwork';

interface SelectedWellDetailProps {
  selectedWithData: WellWithData | null;
  liveTrend: { timestamp: number; value: number }[];
  historyTrend: {
    count: number;
    points: { timestamp: number; value: number }[];
    mean: number;
    min: number;
    max: number;
    delta: number | null;
    trendDirection: -1 | 0 | 1;
    hasCritical: boolean;
  } | null;
  historyLoading: boolean;
  distances: WellDistance[];
  onClear: () => void;
}

export function SelectedWellDetail({ selectedWithData, liveTrend, historyTrend, historyLoading, distances, onClear }: SelectedWellDetailProps) {
  if (!selectedWithData) return null;
  return (
          <div className="border border-gw-cyan/30 rounded-lg bg-gw-surface/10 p-2 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <CircleDot size={12} className="text-gw-cyan" />
                <span className="text-[11px] font-medium text-gw-text">{selectedWithData.name}</span>
                <span className="text-[8px] text-gw-muted/50 font-mono">{selectedWithData.id}</span>
                <RealtimeStatusBadge status={selectedWithData.realtime.status} />
              </div>
              <button onClick={onClear} className="text-[8px] text-gw-muted/50 hover:text-gw-text">关闭</button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 text-[8px] text-gw-muted">
              <div>城市: <span className="text-gw-text">{selectedWithData.city}</span></div>
              <div>含水层: <span className="text-gw-text">{AQUIFER_LABELS[selectedWithData.aquiferType]}</span></div>
              <div>井深: <span className="text-gw-text font-mono">{selectedWithData.depth}m</span></div>
              <div>坐标: <span className="text-gw-text font-mono">{selectedWithData.latitude},{selectedWithData.longitude}</span></div>
            </div>

            {/* 实时值详情 */}
            {selectedWithData.realtime.reading ? (
              <div className="flex items-center gap-3">
                <div className="text-[16px] font-bold font-mono" style={{ color: WELL_REALTIME_STATUS_CONFIG[selectedWithData.realtime.status].color }}>
                  {selectedWithData.realtime.value?.toFixed(2)}{selectedWithData.realtime.unit}
                </div>
                <div className="text-[8px] text-gw-muted/60">
                  <div>通道: {CHANNEL_LABELS[selectedWithData.realtime.reading.channel]}</div>
                  <div>质量: {selectedWithData.realtime.quality}</div>
                </div>
              </div>
            ) : (
              <div className="text-[9px] text-gw-muted/50">暂无实时数据</div>
            )}

            {/* 实时趋势（会话内） */}
            {liveTrend.length >= 2 && (
              <div className="flex items-center gap-2">
                <TrendSparkline readings={liveTrend} color={WELL_REALTIME_STATUS_CONFIG[selectedWithData.realtime.status].color} />
                <div className="text-[8px] text-gw-muted/50">
                  <div>实时 {liveTrend.length} 点</div>
                  <div>当前 {selectedWithData.realtime.value?.toFixed(2)}{selectedWithData.realtime.unit}</div>
                </div>
              </div>
            )}

            {/* 历史趋势（缓存持久化 24h） */}
            {historyLoading ? (
              <div className="text-[8px] text-gw-muted/50">正在加载历史趋势...</div>
            ) : historyTrend && historyTrend.count >= 2 ? (
              <div className="border-t border-gw-border/10 pt-1.5 mt-1">
                <div className="flex items-center gap-1 mb-1">
                  <Clock size={10} className="text-gw-muted/60" />
                  <span className="text-[8px] font-medium text-gw-muted">历史趋势 (24h · {historyTrend.count}点)</span>
                  {historyTrend.trendDirection === 1 && <span className="text-[8px] text-red-400">↑ 上升</span>}
                  {historyTrend.trendDirection === -1 && <span className="text-[8px] text-cyan-400">↓ 下降</span>}
                  {historyTrend.trendDirection === 0 && <span className="text-[8px] text-gw-muted/50">→ 平稳</span>}
                  {historyTrend.hasCritical && <span className="text-[8px] px-1 rounded bg-red-500/20 text-red-400">含超标</span>}
                </div>
                <div className="flex items-center gap-2">
                  <TrendSparkline readings={historyTrend.points} color={WELL_REALTIME_STATUS_CONFIG[selectedWithData.realtime.status].color} />
                  <div className="text-[8px] text-gw-muted/50 leading-relaxed">
                    <div>均值 {historyTrend.mean}{selectedWithData.realtime.unit}</div>
                    <div>范围 {historyTrend.min}~{historyTrend.max}{selectedWithData.realtime.unit}</div>
                    {historyTrend.delta !== null && <div>变化 {historyTrend.delta > 0 ? '+' : ''}{historyTrend.delta}{selectedWithData.realtime.unit}</div>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-[8px] text-gw-muted/40">暂无历史数据</div>
            )}

            {distances.length > 0 && (
              <div className="mt-1">
                <div className="text-[8px] text-gw-muted/60 mb-0.5">最近邻井：</div>
                <div className="flex flex-wrap gap-1">
                  {distances.slice(0, 5).map(d => (
                    <span key={d.wellId} className="text-[8px] px-1.5 py-0.5 rounded bg-gw-surface/30 border border-gw-border/20 text-gw-muted">
                      {d.wellName} <span className="font-mono text-gw-cyan">{d.distanceKm}km</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
  );
}
