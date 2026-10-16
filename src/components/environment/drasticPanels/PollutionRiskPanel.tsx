/**
 * B-16 地下水脆弱性评价（DRASTIC模型）Tab
 *
 * 4大面板：
 *  1. 计算器 — 输入7参数 → DRASTIC指数/脆弱性等级/参数分解
 *  2. 分区评价 — 8预设分区对比 + 面积统计
 *  3. 污染风险 — 污染源叠加风险分析
 *  4. 参数参考 — 7参数评分表查表
 * 面板: PollutionRiskPanel（拆分自 DrasticVulnerabilityTab.tsx）
 */
import { type PollutionSourceType, calcPollutionRisk, POLLUTION_SOURCE_RISK } from '../../../utils/drasticCalculator';
import { FilterableTechTable } from '../../FilterableTechTable';
import { TechCard, StatCard } from '../../UI';
import { AlertTriangle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { RISK_COLORS } from './drasticConstants';

export function PollutionRiskPanel() {
  const [zoneName, setZoneName] = useState('山前冲洪积扇顶部');
  const [drasticIndex, setDrasticIndex] = useState(165);
  const [pollutionSource, setPollutionSource] = useState<PollutionSourceType>('工业');
  const [distance, setDistance] = useState(300);
  const [duration, setDuration] = useState(10);

  const riskResult = useMemo(() => calcPollutionRisk({
    name: zoneName, drasticIndex, pollutionSource, distance, duration,
  }), [zoneName, drasticIndex, pollutionSource, distance, duration]);

  const sourceData = useMemo(() =>
    Object.entries(POLLUTION_SOURCE_RISK).map(([k, v]) => ({
      name: k,
      风险评分: v.rating,
      desc: v.desc,
    })),
  []);

  return (
    <div className="space-y-4">
      <TechCard title="污染源叠加风险分析" icon={AlertTriangle}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="col-span-2">
            <label className="text-xs text-gw-muted block mb-1">评价区域名称</label>
            <input value={zoneName} onChange={e => setZoneName(e.target.value)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">DRASTIC指数</label>
            <input type="number" value={drasticIndex} onChange={e => setDrasticIndex(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">污染源类型</label>
            <select value={pollutionSource} onChange={e => setPollutionSource(e.target.value as PollutionSourceType)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text">
              {Object.entries(POLLUTION_SOURCE_RISK).map(([k]) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">距污染源距离 (m)</label>
            <input type="number" value={distance} onChange={e => setDistance(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
          <div>
            <label className="text-xs text-gw-muted block mb-1">持续时间 (a)</label>
            <input type="number" value={duration} onChange={e => setDuration(parseFloat(e.target.value) || 0)}
              className="w-full bg-gw-card-alt border border-gw-border rounded px-2 py-1.5 text-sm text-gw-text" />
          </div>
        </div>
      </TechCard>

      {/* 风险结果 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="污染源风险评分" value={riskResult.sourceRisk} accent="text-orange-400" subtitle="1~10" />
        <StatCard title="距离修正系数" value={riskResult.distanceFactor} accent="text-blue-400" />
        <StatCard title="时间修正系数" value={riskResult.durationFactor} accent="text-violet-400" />
        <div className="bg-gw-card-alt rounded-lg p-3 flex flex-col justify-center items-center">
          <span className="text-xs text-gw-muted mb-1">综合风险等级</span>
          <span className="text-xl font-bold" style={{ color: RISK_COLORS[riskResult.riskLevel] }}>
            {riskResult.riskLevel}
          </span>
          <span className="text-sm text-gw-text mt-1">评分 {riskResult.compositeRisk}</span>
        </div>
      </div>

      <TechCard title="风险评价结论">
        <div className="bg-gw-card-alt rounded-lg p-3">
          <p className="text-sm text-gw-text leading-relaxed">
            <span className="text-gw-muted">区域：</span>{zoneName}
            {' '}<span className="text-gw-muted">DRASTIC指数：</span>{drasticIndex}
            {' '}<span className="text-gw-muted">污染源：</span>{pollutionSource}（{POLLUTION_SOURCE_RISK[pollutionSource].desc}）
          </p>
          <p className="text-sm mt-2" style={{ color: RISK_COLORS[riskResult.riskLevel] }}>
            <strong>综合风险评分：{riskResult.compositeRisk}</strong>
            {' '}— {riskResult.riskLevel}
          </p>
          <p className="text-xs text-gw-muted mt-2 leading-relaxed">
            <strong className="text-gw-text">建议措施：</strong>{riskResult.recommendation}
          </p>
        </div>
      </TechCard>

      {/* 污染源风险评分表 */}
      <FilterableTechTable
        headers={['污染源类型', '基础风险评分', '主要污染物']}
        rows={sourceData.map(s => [s.name, s['风险评分'], s.desc])}
      />

      <div className="bg-gw-card-alt rounded-lg p-4">
        <p className="text-xs text-gw-muted leading-relaxed">
          <strong className="text-gw-text">综合风险计算方法：</strong>
          {' '}综合风险 = 污染源基础评分 &times; 距离修正系数 &times; 持续时间修正系数 &times; (0.5 + 0.5 &times; DRASTIC/200)。
          {' '}距离越近、持续时间越长、含水层越脆弱，综合风险越高。
          {' '}距离修正：&lt;100m 乘1.5，100~500m 乘1.2，500~1000m 乘1.0，1~2km 乘0.7，&gt;2km 乘0.4。
        </p>
      </div>
    </div>
  );
}
