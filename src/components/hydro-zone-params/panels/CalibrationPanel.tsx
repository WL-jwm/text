/**
 * B-25 地下水数值模拟参数估算器 Tab
 *
 * 4大面板：
 *  1. 计算器 — 水力参数转换+网格估算+稳定性判断+时间步长
 *  2. 模型校准 — 观测/模拟数据对比+NSE/RMSE/R²等指标
 *  3. 预设分区 — 6个河北典型数值模拟区参数对比
 *  4. 参考方法 — 数值方法+稳定性准则+校准标准
 * 面板组件：CalibrationPanel（拆分自 NumericalModelCalculatorTab.tsx）
 */

import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell, ScatterChart, Scatter } from 'recharts';
import { Calculator, Gauge, BookOpen } from 'lucide-react';
import { TechCard, ChartTooltip } from '../../UI';
import { LazyChartCard } from '../../LazyChartCard';
import { calcCalibration } from '../../../utils/numericalModelCalculator';
import { TOOLTIP_STYLE, GRADE_COLORS } from './numericalModelConstants';

// ── 面板2: 模型校准 ──
export function CalibrationPanel() {
  const [obsText, setObsText] = useState('32.1, 31.8, 31.5, 31.2, 30.9, 30.5, 30.2, 29.8, 29.5, 29.1');
  const [simText, setSimText] = useState('32.3, 31.6, 31.7, 31.0, 31.1, 30.3, 30.4, 29.6, 29.7, 28.9');

  const parseNumbers = (text: string): number[] => {
    return text.split(/[,，\s]+/).map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
  };

  const observed = useMemo(() => parseNumbers(obsText), [obsText]);
  const simulated = useMemo(() => parseNumbers(simText), [simText]);
  const result = useMemo(() => calcCalibration({ observed, simulated }), [observed, simulated]);

  const scatterData = observed.map((o, i) => ({ obs: o, sim: simulated[i] ?? 0, idx: i + 1 }));

  // 1:1线范围
  const minVal = Math.min(...observed, ...simulated, 0);
  const maxVal = Math.max(...observed, ...simulated, 0);

  // 残差图数据
  const residualData = observed.map((o, i) => ({ idx: i + 1, residual: o - (simulated[i] ?? 0) }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TechCard title="校准数据输入" badge="观测 vs 模拟" icon={Calculator}>
          <div className="space-y-2">
            <div>
              <label className="text-[10px] text-gw-muted">观测值序列（逗号或空格分隔）</label>
              <textarea value={obsText} onChange={e => setObsText(e.target.value)} rows={3}
                className="w-full px-2 py-1.5 bg-gw-surface border border-gw-border/50 rounded text-xs text-gw-text font-mono resize-none" />
            </div>
            <div>
              <label className="text-[10px] text-gw-muted">模拟值序列（逗号或空格分隔）</label>
              <textarea value={simText} onChange={e => setSimText(e.target.value)} rows={3}
                className="w-full px-2 py-1.5 bg-gw-surface border border-gw-border/50 rounded text-xs text-gw-text font-mono resize-none" />
            </div>
            <div className="text-[10px] text-gw-muted">数据对数：{result.n} | 观测范围：{observed.length > 0 ? `${Math.min(...observed).toFixed(1)}~${Math.max(...observed).toFixed(1)}` : '—'}</div>
          </div>
        </TechCard>

        <TechCard title="校准指标" badge={result.grade} icon={Gauge}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <div className="p-2 bg-gw-surface/50 rounded text-center">
              <div className="text-[10px] text-gw-muted">NSE</div>
              <div className="text-base font-mono" style={{ color: GRADE_COLORS[result.grade] ?? '#64748b' }}>{result.nse.toFixed(3)}</div>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded text-center">
              <div className="text-[10px] text-gw-muted">R²</div>
              <div className="text-base font-mono text-gw-highlight">{result.r2.toFixed(3)}</div>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded text-center">
              <div className="text-[10px] text-gw-muted">RMSE</div>
              <div className="text-base font-mono text-amber-400">{result.rmse.toFixed(4)}</div>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded text-center">
              <div className="text-[10px] text-gw-muted">MAE</div>
              <div className="text-base font-mono text-gw-cyan">{result.mae.toFixed(4)}</div>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded text-center">
              <div className="text-[10px] text-gw-muted">MAPE(%)</div>
              <div className="text-base font-mono text-gw-text">{result.mape.toFixed(2)}</div>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded text-center">
              <div className="text-[10px] text-gw-muted">PBIAS(%)</div>
              <div className={`text-base font-mono ${Math.abs(result.pbias) > 10 ? 'text-amber-400' : 'text-emerald-400'}`}>{result.pbias.toFixed(2)}</div>
            </div>
          </div>
          <div className="mt-3 p-2 bg-gw-surface/50 rounded">
            <div className="text-[10px] text-gw-muted">评价等级</div>
            <div className="text-sm" style={{ color: GRADE_COLORS[result.grade] ?? '#64748b' }}>{result.grade}</div>
          </div>
          <p className="text-[10px] text-gw-muted mt-2">{result.suggestion}</p>
        </TechCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="观测 vs 模拟散点图（1:1线）" height={300}>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
              <XAxis type="number" dataKey="obs" name="观测值" stroke="#64748b" fontSize={10} domain={[minVal - 1, maxVal + 1]} />
              <YAxis type="number" dataKey="sim" name="模拟值" stroke="#64748b" fontSize={10} domain={[minVal - 1, maxVal + 1]} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Scatter data={scatterData} fill="#06b6d4" />
              <ReferenceLine segment={[{ x: minVal, y: minVal }, { x: maxVal, y: maxVal }]} stroke="#10b981" strokeDasharray="5 5" label={{ value: '1:1', fill: '#10b981', fontSize: 10 }} />
            </ScatterChart>
          </ResponsiveContainer>
        </LazyChartCard>

        <LazyChartCard title="残差分布图" height={300}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={residualData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
              <XAxis dataKey="idx" stroke="#64748b" fontSize={10} label={{ value: '序号', position: 'insideBottom', fontSize: 10, fill: '#64748b' }} />
              <YAxis stroke="#64748b" fontSize={10} label={{ value: '残差', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
              <Tooltip content={<ChartTooltip title="残差" />} />
              <ReferenceLine y={0} stroke="#64748b" />
              <Bar dataKey="residual" name="残差" radius={[2, 2, 0, 0]}>
                {residualData.map((d, i) => <Cell key={i} fill={d.residual >= 0 ? '#06b6d4' : '#ef4444'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>
      </div>

      <TechCard title="校准指标说明" icon={BookOpen}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="p-2 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-highlight">NSE (Nash-Sutcliffe效率系数)</div>
            <div className="text-[10px] text-gw-muted mt-1">≥0.90优秀 | ≥0.80良好 | ≥0.65合格 | ≥0.50勉强 | &lt;0.50不合格。1为完美拟合，0等同于观测均值。</div>
          </div>
          <div className="p-2 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-highlight">R² (决定系数)</div>
            <div className="text-[10px] text-gw-muted mt-1">衡量线性相关程度，0~1。≥0.9为优，≥0.7为良，≥0.5为合格。</div>
          </div>
          <div className="p-2 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-highlight">RMSE (均方根误差)</div>
            <div className="text-[10px] text-gw-muted mt-1">越小说明拟合越好，单位与原始数据一致。对大偏差敏感。</div>
          </div>
          <div className="p-2 bg-gw-surface/50 rounded-lg border border-gw-border/30">
            <div className="text-xs font-semibold text-gw-highlight">PBIAS (相对偏差)</div>
            <div className="text-[10px] text-gw-muted mt-1">正值表示模拟偏高，负值偏低。|PBIAS|&lt;10%为优，&lt;15%为良，&lt;25%为合格。</div>
          </div>
        </div>
      </TechCard>
    </div>
  );
}
