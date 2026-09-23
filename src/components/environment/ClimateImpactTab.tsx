/**
 * B-37 气候变化对地下水影响评估器 Tab
 *
 * 5大面板：
 *  1. 气候降尺度 — 历史气候数据+GCM降尺度+降水/气温趋势
 *  2. 补给量预测 — 降水-补给关系+多情景补给变化
 *  3. 干旱指数 — SPI/SPEI计算+干旱分级+传导滞后
 *  4. 适应策略 — 策略库+情景匹配+优先级排序
 *  5. 参考说明 — 降尺度方法+补给公式+干旱指数+GCM情景
 * 主组件（面板已拆分至 panels/ 子目录）
 */

import { useState, useMemo } from 'react';
import { CloudRain, Droplets, Sun, Shield, BookOpen } from 'lucide-react';
import { TechCard } from '../UI';
import { generateHistoricalClimate, SCENARIO_PARAMS, downscaleDelta, calcSPEI, calcComprehensiveClimate, RISK_LEVEL_LABELS, RISK_LEVEL_COLORS, type ClimateScenario } from '../../utils/climateImpactCalculator';
import { DownscalingPanel } from './panels/DownscalingPanel';
import { RechargePanel } from './panels/RechargePanel';
import { DroughtPanel } from './panels/DroughtPanel';
import { AdaptationPanel } from './panels/AdaptationPanel';
import { ClimateReferencePanel } from './panels/ClimateReferencePanel';

export function ClimateImpactTab() {
  const [activePanel, setActivePanel] = useState<number>(0);

  const comprehensive = useMemo(() => {
    const historical = generateHistoricalClimate();
    const projections = (['rcp45', 'rcp85', 'ssp585'] as ClimateScenario[]).map(sc => {
      const params = SCENARIO_PARAMS[sc];
      return downscaleDelta(historical, params.deltaTemp, params.deltaPrecip, 2025, 2075, sc);
    });
    const droughtIndices = calcSPEI(
      historical.map(d => d.annualPrecip),
      historical.map(d => d.pet),
    );
    return calcComprehensiveClimate(historical, projections, droughtIndices);
  }, []);

  const panels = [
    { key: 0, label: '气候降尺度', icon: CloudRain },
    { key: 1, label: '补给量预测', icon: Droplets },
    { key: 2, label: '干旱指数', icon: Sun },
    { key: 3, label: '适应策略', icon: Shield },
    { key: 4, label: '参考说明', icon: BookOpen },
  ];

  return (
    <div className="space-y-4">
      {/* 综合评估卡片 */}
      <TechCard>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-3 bg-gw-surface rounded-lg">
            <div className="text-[10px] text-gw-muted">风险等级</div>
            <div className="text-xl font-bold" style={{ color: RISK_LEVEL_COLORS[comprehensive.riskLevel] }}>
              {RISK_LEVEL_LABELS[comprehensive.riskLevel]}
            </div>
          </div>
          <div className="text-center p-3 bg-gw-surface rounded-lg">
            <div className="text-[10px] text-gw-muted">最坏情景升温</div>
            <div className="text-xl font-bold text-red-400">+4.5℃</div>
            <div className="text-[9px] text-gw-muted">SSP5-8.5</div>
          </div>
          <div className="text-center p-3 bg-gw-surface rounded-lg">
            <div className="text-[10px] text-gw-muted">补给量最大降幅</div>
            <div className="text-xl font-bold text-amber-400">-15%</div>
            <div className="text-[9px] text-gw-muted">SSP5-8.5</div>
          </div>
          <div className="text-center p-3 bg-gw-surface rounded-lg">
            <div className="text-[10px] text-gw-muted">适应策略数</div>
            <div className="text-xl font-bold text-green-400">{comprehensive.strategies.length}</div>
            <div className="text-[9px] text-gw-muted">5大类</div>
          </div>
        </div>

        <div className="mt-3 space-y-1">
          <div className="text-[10px] text-gw-muted mb-1">关键发现：</div>
          {comprehensive.keyFindings.slice(0, 5).map((f, idx) => (
            <div key={idx} className="flex items-start gap-2 text-[11px] text-gw-text">
              <span className="text-gw-blue mt-0.5">{idx + 1}.</span>
              <span>{f}</span>
            </div>
          ))}
        </div>
      </TechCard>

      {/* 面板切换 */}
      <div className="flex gap-1 bg-gw-surface rounded-lg p-1 overflow-x-auto scrollbar-none">
        {panels.map(p => (
          <button key={p.key} onClick={() => setActivePanel(p.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs transition-all whitespace-nowrap ${
              activePanel === p.key
                ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30'
                : 'text-gw-muted hover:text-gw-text'
            }`}
          >
            <p.icon size={14} />
            {p.label}
          </button>
        ))}
      </div>

      {activePanel === 0 && <DownscalingPanel />}
      {activePanel === 1 && <RechargePanel />}
      {activePanel === 2 && <DroughtPanel />}
      {activePanel === 3 && <AdaptationPanel />}
      {activePanel === 4 && <ClimateReferencePanel />}
    </div>
  );
}
