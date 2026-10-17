/**
 * 拆分自 DecisionSupportTab.tsx
 */

import { AlertTriangle, TrendingDown, Droplets, Activity, Shield } from 'lucide-react';
import { TechCard } from '../../UI';
import { InputCell, WarningBadge } from '../decisionSupportUI';
import { WARNING_COLORS, WARNING_GRADIENTS } from '../decisionSupportConstants';
import type { WarningInput, WarningResult } from '../../../utils/decisionSupportCalculator';

export function WarningPanel({ warningInput, onWarningInputChange, warningResult }: { warningInput: WarningInput; onWarningInputChange: (v: WarningInput) => void; warningResult: WarningResult }) {
  return (
    <>
    {/* ═══ Panel 4: 风险预警决策 ═══ */}
    <TechCard title="风险预警决策" badge="预警" icon={AlertTriangle} className="border-amber-500/20">
    
      {/* —— 第一行：全宽预警信号横幅 —— */}
      <div
        className="p-4 rounded-xl border-2 relative overflow-hidden mb-4"
        style={{
          background: `linear-gradient(135deg, ${WARNING_GRADIENTS[warningResult.overallWarning]?.[0] ?? '#1e293b'} 0%, ${WARNING_GRADIENTS[warningResult.overallWarning]?.[1] ?? '#0f172a'} 100%)`,
          borderColor: `${WARNING_COLORS[warningResult.overallWarning]}60`,
          boxShadow: `0 0 24px ${WARNING_COLORS[warningResult.overallWarning]}15, inset 0 1px 0 ${WARNING_COLORS[warningResult.overallWarning]}20`,
        }}
      >
        <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ background: WARNING_COLORS[warningResult.overallWarning] }} />
        <div className="grid grid-cols-[auto_1fr_auto] gap-4 items-center pl-2">
          {/* 左：图标 */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${WARNING_COLORS[warningResult.overallWarning]}20`, border: `1px solid ${WARNING_COLORS[warningResult.overallWarning]}40` }}
          >
            <AlertTriangle className="w-6 h-6" style={{ color: WARNING_COLORS[warningResult.overallWarning] }} />
          </div>
          {/* 中：信号文字 */}
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <WarningBadge level={warningResult.overallWarning} />
              <span className="text-[10px] text-gw-muted">综合预警</span>
            </div>
            <p className="text-[11px] text-gw-muted">{warningResult.warningSignal}</p>
          </div>
          {/* 右：水位+水质子预警竖排 */}
          <div className="flex gap-2">
            <div
              className="px-3 py-1.5 rounded-lg border-l-2 border-y border-r border-gw-border/20 text-center min-w-[72px]"
              style={{ borderLeftColor: WARNING_COLORS[warningResult.waterLevelWarning], background: `${WARNING_COLORS[warningResult.waterLevelWarning]}0a` }}
            >
              <p className="text-[9px] text-gw-muted">水位</p>
              <p className="text-xs font-bold" style={{ color: WARNING_COLORS[warningResult.waterLevelWarning] }}>{warningResult.waterLevelWarning}</p>
            </div>
            <div
              className="px-3 py-1.5 rounded-lg border-l-2 border-y border-r border-gw-border/20 text-center min-w-[72px]"
              style={{ borderLeftColor: WARNING_COLORS[warningResult.waterQualityWarning], background: `${WARNING_COLORS[warningResult.waterQualityWarning]}0a` }}
            >
              <p className="text-[9px] text-gw-muted">水质</p>
              <p className="text-xs font-bold" style={{ color: WARNING_COLORS[warningResult.waterQualityWarning] }}>{warningResult.waterQualityWarning}</p>
            </div>
          </div>
        </div>
      </div>
    
      {/* —— 第二行：左输入 / 右水位标尺 —— */}
      <div className="grid grid-cols-[1fr_1fr] gap-4 mb-4">
        {/* 左：输入区分组卡片 */}
        <div className="space-y-3">
          {/* 水位参数组 */}
          <div className="p-3 rounded-xl bg-gw-surface/30 border border-gw-border/15">
            <p className="text-[11px] font-semibold text-gw-text mb-2 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-amber-400" /> 水位预警参数
            </p>
            <div className="grid grid-cols-2 gap-2">
              <InputCell label="当前水位埋深" value={warningInput.currentDepth} onChange={v => onWarningInputChange({ ...warningInput, currentDepth: v })} unit="m" step={0.1} />
              <InputCell label="月变化率" value={warningInput.monthlyChangeRate} onChange={v => onWarningInputChange({ ...warningInput, monthlyChangeRate: v })} unit="m/月" step={0.1} />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <InputCell label="黄色警戒" value={warningInput.yellowThreshold} onChange={v => onWarningInputChange({ ...warningInput, yellowThreshold: v })} unit="m" />
              <InputCell label="红色预警" value={warningInput.redThreshold} onChange={v => onWarningInputChange({ ...warningInput, redThreshold: v })} unit="m" />
              <InputCell label="极限水位" value={warningInput.emergencyThreshold} onChange={v => onWarningInputChange({ ...warningInput, emergencyThreshold: v })} unit="m" />
            </div>
          </div>
          {/* 水质与开采组 */}
          <div className="p-3 rounded-xl bg-gw-surface/30 border border-gw-border/15">
            <p className="text-[11px] font-semibold text-gw-text mb-2 flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-amber-400" /> 水质与开采
            </p>
            <div className="grid grid-cols-2 gap-2">
              <InputCell label="Cl⁻浓度" value={warningInput.chloride} onChange={v => onWarningInputChange({ ...warningInput, chloride: v })} unit="mg/L" />
              <InputCell label="Cl⁻月变化率" value={warningInput.chlorideRate} onChange={v => onWarningInputChange({ ...warningInput, chlorideRate: v })} unit="mg/L/月" step={0.1} />
            </div>
            <div className="mt-2">
              <label className="block text-[10px] text-gw-muted mb-0.5">区域开采状态</label>
              <select value={warningInput.extractionStatus} onChange={e => onWarningInputChange({ ...warningInput, extractionStatus: e.target.value as WarningInput['extractionStatus'] })}
                className="w-full px-2.5 py-1.5 rounded-lg bg-gw-surface border border-gw-border/30 text-xs text-gw-text focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-colors">
                <option value="正常">正常</option>
                <option value="超采">超采</option>
                <option value="严重超采">严重超采</option>
              </select>
            </div>
          </div>
        </div>
    
        {/* 右：水位阈值标尺可视化 */}
        <div className="p-3 rounded-xl bg-gw-surface/30 border border-gw-border/15">
          <p className="text-[11px] font-semibold text-gw-text mb-2 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-amber-400" /> 水位阈值标尺
          </p>
          {(() => {
            const vals = [warningInput.yellowThreshold, warningInput.redThreshold, warningInput.emergencyThreshold, warningInput.currentDepth];
            const minVal = Math.min(...vals) * 0.8;
            const maxVal = Math.max(...vals) * 1.1;
            const range = maxVal - minVal;
            const pct = (v: number) => Math.max(0, Math.min(100, ((v - minVal) / range) * 100));
            const currentPct = pct(warningInput.currentDepth);
            const thresholds = [
              { label: '黄色警戒', value: warningInput.yellowThreshold, color: WARNING_COLORS['黄色'] },
              { label: '红色预警', value: warningInput.redThreshold, color: WARNING_COLORS['橙色'] },
              { label: '极限水位', value: warningInput.emergencyThreshold, color: WARNING_COLORS['红色'] },
            ];
            return (
              <div className="relative pt-2 pb-8">
                {/* 标尺轨道 */}
                <div className="relative h-8 rounded-lg overflow-hidden" style={{ background: 'linear-gradient(90deg, #1e3a5f 0%, #422006 35%, #431407 65%, #450a0a 100%)' }}>
                  {/* 阈值标记线 */}
                  {thresholds.map((t, i) => (
                    <div key={i} className="absolute top-0 bottom-0" style={{ left: `${pct(t.value)}%` }}>
                      <div className="h-full w-0.5" style={{ background: t.color }} />
                      <div className="absolute -top-0.5 -translate-x-1/2 w-2 h-2 rounded-full border" style={{ background: t.color, borderColor: `${t.color}80` }} />
                    </div>
                  ))}
                  {/* 当前水位指针 */}
                  <div className="absolute top-0 bottom-0 z-10" style={{ left: `${currentPct}%` }}>
                    <div className="h-full w-0.5 bg-white shadow-lg" />
                    <div className="absolute -top-1 -translate-x-1/2 px-1.5 py-0.5 rounded text-[9px] font-bold text-white whitespace-nowrap" style={{ background: WARNING_COLORS[warningResult.waterLevelWarning] }}>
                      当前 {warningInput.currentDepth}m
                    </div>
                  </div>
                </div>
                {/* 阈值标签 */}
                <div className="relative h-5 mt-1">
                  {thresholds.map((t, i) => (
                    <div key={i} className="absolute -translate-x-1/2 text-[9px] text-gw-muted whitespace-nowrap" style={{ left: `${pct(t.value)}%` }}>
                      {t.label}<br /><span style={{ color: t.color }}>{t.value}m</span>
                    </div>
                  ))}
                </div>
                {/* 区域标注 */}
                <div className="flex justify-between mt-2 text-[9px] text-gw-muted/60">
                  <span>← 安全</span>
                  <span>危险 →</span>
                </div>
              </div>
            );
          })()}
          {/* 预警指标速览 */}
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {warningResult.details.map((d, i) => (
              <div key={i} className="px-2 py-1 rounded-lg border-l-2 border-y border-r border-gw-border/15" style={{ borderLeftColor: WARNING_COLORS[d.warning] ?? '#64748b' }}>
                <p className="text-[9px] text-gw-muted truncate">{d.indicator}</p>
                <p className="text-[10px] font-semibold" style={{ color: WARNING_COLORS[d.warning] ?? '#94a3b8' }}>{d.warning}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    
      {/* —— 第三行：全宽响应措施矩阵 —— */}
      <div className="p-3 rounded-xl bg-gw-surface/20 border border-gw-border/15">
        <p className="text-[11px] font-semibold text-gw-text mb-2 flex items-center gap-1">
          <Shield className="w-3.5 h-3.5 text-amber-400" /> 响应措施矩阵
        </p>
        <div className="grid grid-cols-3 gap-2">
          {warningResult.responseMeasures.map((m, i) => {
            const mColor = WARNING_COLORS[m.level] ?? '#64748b';
            return (
              <div key={i} className="p-2.5 rounded-lg border-l-2 border-y border-r border-gw-border/15" style={{ borderLeftColor: mColor, background: `${mColor}06` }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: mColor }} />
                  <span className="text-[10px] font-bold" style={{ color: mColor }}>{m.level}</span>
                  <span className="text-[9px] text-gw-muted ml-auto">{m.timeline}</span>
                </div>
                <p className="text-[10px] text-gw-text mb-1">{m.measure}</p>
                <p className="text-[9px] text-gw-muted">责任: {m.responsible}</p>
              </div>
            );
          })}
        </div>
      </div>
    </TechCard>
    
    </>
  );
}
