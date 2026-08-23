/**
 * 实时监测可视化 — 监测站网总览
 */

import { Radio } from 'lucide-react';
import { TechCard } from '../UI';
import { monitoringNetwork } from '../../data/exploitation';

export function MonitoringNetworkOverview() {
  const { totalStations, byType, byAquifer, automation } = monitoringNetwork;
  const autoPct = automation.automatedPercent;

  // 仪表盘参数
  const GAUGE_W = 160, GAUGE_H = 100;
  const CX = 80, CY = 80, R = 60;
  const startAngle = Math.PI * 0.8;
  const endAngle = Math.PI * 2.2;
  const angleRange = endAngle - startAngle;
  const needleAngle = startAngle + (autoPct / 100) * angleRange;

  // 仪表盘弧
  const arcPath = (from: number, to: number, color: string) => {
    const x1 = CX + R * Math.cos(from);
    const y1 = CY + R * Math.sin(from);
    const x2 = CX + R * Math.cos(to);
    const y2 = CY + R * Math.sin(to);
    return { path: `M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`, color };
  };

  const bgArc = arcPath(startAngle, endAngle, '#1e293b');
  const fillArc = arcPath(startAngle, needleAngle, '#06b6d4');
  const needleX = CX + (R - 8) * Math.cos(needleAngle);
  const needleY = CY + (R - 8) * Math.sin(needleAngle);

  return (
    <TechCard>
      <h3 className="text-sm font-semibold text-gw-text flex items-center gap-2 mb-3">
        <Radio size={14} className="text-cyan-400" />
        监测站网总览
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 左侧：站网数量 + 仪表盘 */}
        <div className="flex flex-col items-center">
          <div className="text-center mb-2">
            <div className="text-3xl font-bold text-cyan-400">{totalStations}</div>
            <div className="text-[10px] text-gw-muted">监测站总数</div>
          </div>
          <svg width={GAUGE_W} height={GAUGE_H}>
            <path d={bgArc.path} fill="none" stroke={bgArc.color} strokeWidth="8" strokeLinecap="round" />
            <path d={fillArc.path} fill="none" stroke={fillArc.color} strokeWidth="8" strokeLinecap="round" />
            <line x1={CX} y1={CY} x2={needleX} y2={needleY} stroke="#06b6d4" strokeWidth="2" />
            <circle cx={CX} cy={CY} r="4" fill="#06b6d4" />
            <text x={CX} y={CY - 15} fontSize="16" fill="#06b6d4" textAnchor="middle" fontWeight="bold">{autoPct}%</text>
            <text x={CX} y={CY - 3} fontSize="7" fill="#64748b" textAnchor="middle">自动化率</text>
          </svg>
          <div className="text-[9px] text-gw-muted text-center mt-1">
            <div>自动传输: {automation.automatedCount}站</div>
            <div>{automation.realtimeTransmission}</div>
            <div>频率: {automation.monitoringFrequency}</div>
          </div>
        </div>

        {/* 中间：按行政级别 */}
        <div>
          <div className="text-[10px] text-gw-muted mb-1">按行政级别</div>
          <div className="space-y-1.5">
            {byType.map((t, i) => {
              const pct = (t.count / totalStations) * 100;
              const colors = ['#06b6d4', '#3b82f6', '#8b5cf6', '#64748b'];
              return (
                <div key={i}>
                  <div className="flex items-center justify-between text-[9px] mb-0.5">
                    <span className="text-gw-text">{t.type}</span>
                    <span className="text-gw-muted">{t.count}个 ({pct.toFixed(1)}%)</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gw-surface/60 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: colors[i] }} />
                  </div>
                  <div className="text-[8px] text-gw-muted/50">{t.note}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 右侧：按含水层 */}
        <div>
          <div className="text-[10px] text-gw-muted mb-1">按含水层</div>
          <div className="space-y-1.5">
            {byAquifer.map((a, i) => {
              const colors = ['#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b'];
              return (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ background: colors[i], opacity: 0.6 }} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-[9px]">
                      <span className="text-gw-text">{a.aquifer}</span>
                      <span className="text-gw-muted">{a.count}个</span>
                    </div>
                    <div className="h-1 rounded-full bg-gw-surface/60 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${a.percent}%`, background: colors[i] }} />
                    </div>
                  </div>
                  <span className="text-[9px] text-gw-muted w-8 text-right">{a.percent}%</span>
                </div>
              );
            })}
          </div>
          <div className="mt-2 text-[8px] text-gw-muted/50">
            平台: {monitoringNetwork.realTimePlatform}
          </div>
        </div>
      </div>
    </TechCard>
  );
}

// ── 子组件2：多城市水位动态时序 ──

