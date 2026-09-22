/**
 * B-33 地下水监测网优化评估器 Tab
 *
 * 5大面板：
 *  1. 密度分析 — 监测井密度评价+标准对照+缺口识别
 *  2. 空间覆盖 — 泰森多边形控制面积+覆盖空白+均匀度
 *  3. 频率优化 — 自相关分析+推荐频率+冗余指数
 *  4. 有效性评价 — 信息熵+冗余度+效率评分
 *  5. 参考说明 — 密度标准+评价方法+优化建议
 */
import { useState, useMemo } from 'react';
import {
  Grid3x3, MapPin, Activity, Gauge, BookOpen, Target,
} from 'lucide-react';
import { TechCard } from '../UI';
import {
  PRESET_MONITORING_AREAS, AQUIFER_LABELS, calcComprehensiveAssessment,
} from '../../utils/monitoringNetworkCalculator';
import { DensityPanel } from './panels/DensityPanel';
import { CoveragePanel } from './panels/CoveragePanel';
import { FrequencyPanel } from './panels/FrequencyPanel';
import { EffectivenessPanel } from './panels/EffectivenessPanel';
import { ReferencePanel } from './panels/ReferencePanel';

// ── 主组件 ──
export function MonitoringNetworkTab() {
  const [activePanel, setActivePanel] = useState<number>(0);
  const [areaId, setAreaId] = useState<string>(PRESET_MONITORING_AREAS[0].id);

  const area = useMemo(
    () => PRESET_MONITORING_AREAS.find(a => a.id === areaId) ?? PRESET_MONITORING_AREAS[0],
    [areaId],
  );

  const comprehensive = useMemo(() => calcComprehensiveAssessment(area), [area]);

  const panels = [
    { key: 0, label: '密度分析', icon: Grid3x3 },
    { key: 1, label: '空间覆盖', icon: MapPin },
    { key: 2, label: '频率优化', icon: Activity },
    { key: 3, label: '有效性评价', icon: Gauge },
    { key: 4, label: '参考说明', icon: BookOpen },
  ];

  return (
    <div className="space-y-4">
      {/* 预设区域选择 */}
      <TechCard>
        <div className="flex items-center gap-2 mb-3">
          <Target size={16} className="text-gw-blue" />
          <h4 className="text-sm font-semibold text-gw-text">选择监测区域</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {PRESET_MONITORING_AREAS.map(a => (
            <button
              key={a.id}
              onClick={() => setAreaId(a.id)}
              className={`p-2 rounded-lg text-left transition-all ${
                areaId === a.id
                  ? 'bg-gw-blue/20 border border-gw-blue/40 text-gw-highlight'
                  : 'bg-gw-surface border border-gw-border text-gw-muted hover:border-gw-blue/20'
              }`}
            >
              <div className="text-xs font-medium">{a.name}</div>
              <div className="text-[10px] mt-0.5 opacity-70">
                {AQUIFER_LABELS[a.aquiferType]} · {a.wells.length}口
              </div>
            </button>
          ))}
        </div>
      </TechCard>

      {/* 综合评分 */}
      <TechCard>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <div className="text-center p-3 bg-gw-surface rounded-lg">
            <div className="text-[10px] text-gw-muted">综合评分</div>
            <div className={`text-2xl font-bold ${comprehensive.overallScore >= 80 ? 'text-green-400' : comprehensive.overallScore >= 65 ? 'text-cyan-400' : comprehensive.overallScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
              {comprehensive.overallScore}
            </div>
            <div className="text-[10px] text-gw-muted">/ 100</div>
          </div>
          <div className="text-center p-3 bg-gw-surface rounded-lg">
            <div className="text-[10px] text-gw-muted">评价等级</div>
            <div className={`text-2xl font-bold ${comprehensive.grade === '优' ? 'text-green-400' : comprehensive.grade === '良' ? 'text-cyan-400' : comprehensive.grade === '中' ? 'text-amber-400' : 'text-red-400'}`}>
              {comprehensive.grade}
            </div>
          </div>
          <div className="text-center p-3 bg-gw-surface rounded-lg">
            <div className="text-[10px] text-gw-muted">密度覆盖率</div>
            <div className="text-lg font-bold text-cyan-400">{comprehensive.density.coverageRatio.toFixed(0)}%</div>
          </div>
          <div className="text-center p-3 bg-gw-surface rounded-lg">
            <div className="text-[10px] text-gw-muted">空间覆盖率</div>
            <div className="text-lg font-bold text-purple-400">{comprehensive.coverage.coveragePercent.toFixed(0)}%</div>
          </div>
          <div className="text-center p-3 bg-gw-surface rounded-lg">
            <div className="text-[10px] text-gw-muted">效率评分</div>
            <div className="text-lg font-bold text-amber-400">{comprehensive.effectiveness.efficiencyScore}</div>
          </div>
        </div>

        {comprehensive.suggestions.length > 0 && (
          <div className="mt-3 space-y-1">
            <div className="text-[10px] text-gw-muted mb-1">优化建议：</div>
            {comprehensive.suggestions.map((s, idx) => (
              <div key={idx} className="flex items-start gap-2 text-[11px] text-gw-text">
                <span className="text-gw-blue mt-0.5">{idx + 1}.</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
        )}
      </TechCard>

      {/* 面板切换 */}
      <div className="flex gap-1 bg-gw-surface rounded-lg p-1 overflow-x-auto scrollbar-none">
        {panels.map(p => (
          <button
            key={p.key}
            onClick={() => setActivePanel(p.key)}
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

      {/* 面板内容 */}
      {activePanel === 0 && <DensityPanel area={area} />}
      {activePanel === 1 && <CoveragePanel area={area} />}
      {activePanel === 2 && <FrequencyPanel area={area} />}
      {activePanel === 3 && <EffectivenessPanel area={area} />}
      {activePanel === 4 && <ReferencePanel />}
    </div>
  );
}
