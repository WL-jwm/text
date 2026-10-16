/**
 * B-19 岩溶泉流量衰减分析 Tab
 *
 * 4大面板：
 *  1. 衰减分析 — Maillet指数衰减模型 + 衰减曲线
 *  2. 滞后相关 — 降水-泉流量滞后相关分析
 *  3. 调蓄评价 — 系统调蓄功能评价
 *  4. 预设泉域 — 6个河北岩溶大泉对比 + 衰减系数参考表
 * 面板: RegulationPanel（拆分自 SpringDecayTab.tsx）
 */
import { type RegulationInput, calcRegulation, ALPHA_REF_TABLE } from '../../../utils/springDecayCalculator';
import { FilterableTechTable } from '../../FilterableTechTable';
import { TechCard, StatCard } from '../../UI';
import { Waves } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AMPLITUDE_COLORS, REGULATION_COLORS } from './springDecayConstants';

export function RegulationPanel() {
  const [name, setName] = useState('威州泉');
  const [alpha, setAlpha] = useState(0.008);
  const [rechargeQ, setRechargeQ] = useState(12.0);
  const [decayQ, setDecayQ] = useState(3.5);
  const [decayDays, setDecayDays] = useState(180);
  const [rechargeDays, setRechargeDays] = useState(185);
  const [amplitudeRatio, setAmplitudeRatio] = useState(2.1);

  const input: RegulationInput = { name, alpha, rechargeQ, decayQ, decayDays, rechargeDays, amplitudeRatio };
  const result = useMemo(() => calcRegulation(input), [input]);

  return (
    <div className="space-y-4">
      <TechCard title="系统调蓄功能评价参数" icon={Waves}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="col-span-2">
            <label className="text-xs text-gw-muted block mb-1">泉域名称</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">衰减系数 α (1/d)</label>
            <input type="number" step="0.001" value={alpha} onChange={e => setAlpha(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">补给期均值 (m³/s)</label>
            <input type="number" step="0.1" value={rechargeQ} onChange={e => setRechargeQ(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">衰减期均值 (m³/s)</label>
            <input type="number" step="0.1" value={decayQ} onChange={e => setDecayQ(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">衰减期天数</label>
            <input type="number" value={decayDays} onChange={e => setDecayDays(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">补给期天数</label>
            <input type="number" value={rechargeDays} onChange={e => setRechargeDays(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">流量变幅比 Qmax/Qmin</label>
            <input type="number" step="0.1" value={amplitudeRatio} onChange={e => setAmplitudeRatio(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
        </div>
      </TechCard>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="调蓄系数 K" value={result.regulationCoeff} accent={REGULATION_COLORS[result.regulation]} subtitle="衰减/补给" />
        <StatCard title="年调节量" value={result.annualRegulation} unit="万m³" accent="text-cyan-400" />
        <div className="bg-gw-card-alt rounded-lg p-3 flex flex-col justify-center items-center">
          <span className="text-xs text-gw-muted mb-1">流量变幅</span>
          <span className="text-lg font-bold" style={{ color: AMPLITUDE_COLORS[result.amplitudeGrade] }}>
            {result.amplitudeGrade}
          </span>
        </div>
        <div className="bg-gw-card-alt rounded-lg p-3 flex flex-col justify-center items-center">
          <span className="text-xs text-gw-muted mb-1">调蓄能力</span>
          <span className="text-xl font-bold" style={{ color: REGULATION_COLORS[result.regulation] }}>
            {result.regulation}
          </span>
        </div>
      </div>

      <div className="bg-gw-card-alt rounded-lg p-4">
        <p className="text-sm text-gw-text leading-relaxed mb-2">
          <strong>评价结论：</strong>{result.conclusion}
        </p>
        <p className="text-xs text-gw-muted leading-relaxed">
          <strong className="text-gw-text">储水特征：</strong>{result.storageDesc}
        </p>
      </div>

      <div className="bg-gw-card-alt rounded-lg p-3">
        <p className="text-xs text-gw-muted leading-relaxed">
          <strong className="text-gw-text">调蓄系数K：</strong>
          {' '}K = 衰减期平均流量 / 补给期平均流量，反映岩溶系统对降水的缓冲调节能力。
          {' '}K越接近1，系统调蓄能力越强（流量稳定）；K越接近0，系统调蓄能力越弱（流量变幅大）。
          {' '}年调节量反映系统在年内储存和释放的水量规模。
        </p>
      </div>

      <FilterableTechTable
        headers={['α范围', '调蓄能力', '储水类型', '说明']}
        rows={ALPHA_REF_TABLE.map(a => [a.range, a.regulation, a.storageType, a.description])}
      />
    </div>
  );
}
