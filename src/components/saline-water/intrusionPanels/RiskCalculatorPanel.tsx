/**
 * B-13 咸水入侵风险评价 Tab
 *
 * 4大面板：
 *  1. 风险计算器 — Cl⁻输入+界面参数→综合评分
 *  2. 监测井预警 — 预设8个监测井风险排名
 *  3. 预测趋势 — Cl⁻浓度线性外推预测
 *  4. 防治参考 — 风险等级对应措施
 * 面板: RiskCalculatorPanel（拆分自 IntrusionRiskTab.tsx）
 */
import { type ChlorideInput, calcChlorideChange, calcInterfaceAnalysis, calcRiskEvaluation } from '../../../utils/intrusionRiskCalculator';
import { TechCard } from '../../UI';
import { Shield, AlertTriangle, MapPin } from 'lucide-react';
import { useState, useMemo } from 'react';

export function RiskCalculatorPanel() {
  const [wellName, setWellName] = useState('监测井-01');
  const [initialCl, setInitialCl] = useState(85);
  const [currentCl, setCurrentCl] = useState(320);
  const [years, setYears] = useState(5);
  const [distanceToCoast, setDistanceToCoast] = useState(10);
  const [initialDepth, setInitialDepth] = useState(50);
  const [currentDepth, setCurrentDepth] = useState(65);
  const [freshwaterHead, setFreshwaterHead] = useState(15);
  const [K, setK] = useState(10);
  const [ne, _setNe] = useState(0.2);

  const clInput: ChlorideInput = { wellName, initialCl, currentCl, years, waterType: '孔隙水', distanceToCoast };
  const ifInput = { initialDepth, currentDepth, years, aquiferType: '浅层' as const, K, ne, freshwaterHead, seawaterDensity: 1025, freshwaterDensity: 1000 };

  const clResult = useMemo(() => calcChlorideChange(clInput), [wellName, initialCl, currentCl, years, distanceToCoast]);
  const ifResult = useMemo(() => calcInterfaceAnalysis(ifInput), [initialDepth, currentDepth, years, K, ne, freshwaterHead]);
  const riskEval = useMemo(() => calcRiskEvaluation(clResult, ifResult), [clResult, ifResult]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 输入区 */}
        <TechCard icon={Shield} title="监测参数输入" badge="Cl⁻+界面">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-gw-muted">监测井名称</label>
              <input type="text" value={wellName} onChange={e => setWellName(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm" />
            </div>
            <div>
              <label className="text-xs text-gw-muted">初始Cl⁻ (mg/L)</label>
              <input type="number" step="any" value={initialCl} onChange={e => setInitialCl(Number(e.target.value) || 0)}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm" />
            </div>
            <div>
              <label className="text-xs text-gw-muted">当前Cl⁻ (mg/L)</label>
              <input type="number" step="any" value={currentCl} onChange={e => setCurrentCl(Number(e.target.value) || 0)}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm" />
            </div>
            <div>
              <label className="text-xs text-gw-muted">间隔年数</label>
              <input type="number" step="1" value={years} onChange={e => setYears(Number(e.target.value) || 1)}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm" />
            </div>
            <div>
              <label className="text-xs text-gw-muted">距海岸线 (km)</label>
              <input type="number" step="any" value={distanceToCoast} onChange={e => setDistanceToCoast(Number(e.target.value) || 0)}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm" />
            </div>
            <div>
              <label className="text-xs text-gw-muted">初始界面深度 (m)</label>
              <input type="number" step="any" value={initialDepth} onChange={e => setInitialDepth(Number(e.target.value) || 0)}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm" />
            </div>
            <div>
              <label className="text-xs text-gw-muted">当前界面深度 (m)</label>
              <input type="number" step="any" value={currentDepth} onChange={e => setCurrentDepth(Number(e.target.value) || 0)}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm" />
            </div>
            <div>
              <label className="text-xs text-gw-muted">淡水位标高 (m)</label>
              <input type="number" step="any" value={freshwaterHead} onChange={e => setFreshwaterHead(Number(e.target.value) || 0)}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm" />
            </div>
            <div>
              <label className="text-xs text-gw-muted">渗透系数 K (m/d)</label>
              <input type="number" step="any" value={K} onChange={e => setK(Number(e.target.value) || 0)}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm" />
            </div>
          </div>
        </TechCard>

        {/* 风险评分仪表 */}
        <TechCard icon={AlertTriangle} title="综合风险评价" badge={riskEval.riskLevel}>
          <div className="flex flex-col items-center py-4">
            {/* 仪表盘 */}
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                <circle cx="60" cy="60" r="50" fill="none" stroke={riskEval.color} strokeWidth="8"
                  strokeDasharray={`${riskEval.totalScore * 3.14} 314`}
                  strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.5s ease' }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold" style={{ color: riskEval.color }}>{riskEval.totalScore}</span>
                <span className="text-xs text-gw-muted">/ 100</span>
              </div>
            </div>
            <div className="mt-2 text-center">
              <span className="text-sm font-semibold" style={{ color: riskEval.color }}>{riskEval.riskLevel}</span>
              <span className="text-xs text-gw-muted ml-2">| {riskEval.intrusionType}</span>
            </div>
          </div>

          {/* 维度评分 */}
          <div className="space-y-2 mt-2">
            {riskEval.dimensions.map(d => (
              <div key={d.name}>
                <div className="flex justify-between text-xs text-gw-muted mb-0.5">
                  <span>{d.name} ({(d.weight * 100).toFixed(0)}%)</span>
                  <span>{d.score.toFixed(0)}分 — {d.description}</span>
                </div>
                <div className="h-2 rounded-full bg-gw-surface overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{
                    width: `${d.score}%`,
                    backgroundColor: d.score > 30 ? riskEval.color : '#10b981',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </TechCard>
      </div>

      {/* Cl⁻+界面结果 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TechCard icon={MapPin} title="氯离子变化" badge={clResult.riskLevel}>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gw-muted">初始Cl⁻</span>
              <p className="text-gw-text font-mono font-semibold mt-0.5">{clResult.initialCl} mg/L</p>
            </div>
            <div>
              <span className="text-gw-muted">当前Cl⁻</span>
              <p className="font-mono font-semibold mt-0.5" style={{ color: clResult.color }}>{clResult.currentCl} mg/L</p>
            </div>
            <div>
              <span className="text-gw-muted">变化量</span>
              <p className={`font-mono font-semibold mt-0.5 ${clResult.deltaCl > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {clResult.deltaCl > 0 ? '+' : ''}{clResult.deltaCl} mg/L
              </p>
            </div>
            <div>
              <span className="text-gw-muted">变化率</span>
              <p className={`font-mono font-semibold mt-0.5 ${clResult.rateCl > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {clResult.rateCl > 0 ? '+' : ''}{clResult.rateCl} mg/L/a
              </p>
            </div>
          </div>
        </TechCard>

        <TechCard icon={MapPin} title="咸淡水界面变化" badge={ifResult.riskLevel}>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gw-muted">初始界面深度</span>
              <p className="text-gw-text font-mono font-semibold mt-0.5">{ifResult.initialDepth} m</p>
            </div>
            <div>
              <span className="text-gw-muted">当前界面深度</span>
              <p className="font-mono font-semibold mt-0.5" style={{ color: ifResult.color }}>{ifResult.currentDepth} m</p>
            </div>
            <div>
              <span className="text-gw-muted">G-H理论深度</span>
              <p className="text-gw-text font-mono mt-0.5">{ifResult.ghDepth} m</p>
            </div>
            <div>
              <span className="text-gw-muted">变化速率</span>
              <p className={`font-mono font-semibold mt-0.5 ${ifResult.deltaDepth > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {ifResult.deltaDepth > 0 ? '下移' : '回升'} {Math.abs(ifResult.deltaDepth)}m / {ifResult.rateDepth}m/a
              </p>
            </div>
          </div>
        </TechCard>
      </div>

      {/* 建议措施 */}
      <TechCard icon={Shield} title="防治建议">
        <ul className="space-y-1 text-xs">
          {riskEval.suggestions.map((s, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-gw-blue mt-0.5">▸</span>
              <span className="text-gw-text">{s}</span>
            </li>
          ))}
        </ul>
      </TechCard>
    </div>
  );
}
