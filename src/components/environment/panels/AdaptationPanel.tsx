/**
 * B-37 气候变化对地下水影响评估器 Tab
 *
 * 5大面板：
 *  1. 气候降尺度 — 历史气候数据+GCM降尺度+降水/气温趋势
 *  2. 补给量预测 — 降水-补给关系+多情景补给变化
 *  3. 干旱指数 — SPI/SPEI计算+干旱分级+传导滞后
 *  4. 适应策略 — 策略库+情景匹配+优先级排序
 *  5. 参考说明 — 降尺度方法+补给公式+干旱指数+GCM情景
 * 面板组件：AdaptationPanel（拆分自 ClimateImpactTab.tsx）
 */

import { useState, useMemo } from 'react';
import { Tooltip, ResponsiveContainer, Cell, Legend, PieChart, Pie } from 'recharts';
import { Shield } from 'lucide-react';
import { TechCard } from '../../UI';
import { SCENARIO_PARAMS, CATEGORY_LABELS, ADAPTATION_STRATEGIES } from '../../../utils/climateImpactCalculator';
import { TOOLTIP_STYLE } from './climateImpactConstants';

// ── 面板4: 适应策略 ──
export function AdaptationPanel() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredStrategies = useMemo(() => {
    if (selectedCategory === 'all') return ADAPTATION_STRATEGIES;
    return ADAPTATION_STRATEGIES.filter(s => s.category === selectedCategory);
  }, [selectedCategory]);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    ADAPTATION_STRATEGIES.forEach(s => {
      counts[s.category] = (counts[s.category] ?? 0) + 1;
    });
    return Object.entries(counts).map(([cat, count]) => ({
      name: CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS],
      value: count,
      color: { supply: '#06b6d4', demand: '#10b981', ecology: '#84cc16', monitoring: '#f59e0b', governance: '#8b5cf6' }[cat],
    }));
  }, []);

  const costLabels: Record<string, string> = { low: '低', medium: '中', high: '高' };
  const timeLabels: Record<string, string> = { short: '短期', medium: '中期', long: '长期' };

  return (
    <div className="space-y-4">
      <TechCard>
        <div className="flex items-center gap-2 mb-3">
          <Shield size={16} className="text-green-400" />
          <h4 className="text-sm font-semibold text-gw-text">适应策略库</h4>
        </div>
        <div className="flex gap-1 flex-wrap mb-3">
          <button onClick={() => setSelectedCategory('all')}
            className={`px-2 py-1 text-[10px] rounded ${selectedCategory === 'all' ? 'bg-gw-blue/20 text-gw-highlight' : 'bg-gw-surface text-gw-muted'}`}>
            全部 ({ADAPTATION_STRATEGIES.length})
          </button>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <button key={key} onClick={() => setSelectedCategory(key)}
              className={`px-2 py-1 text-[10px] rounded ${selectedCategory === key ? 'bg-gw-blue/20 text-gw-highlight' : 'bg-gw-surface text-gw-muted'}`}>
              {label} ({ADAPTATION_STRATEGIES.filter(s => s.category === key).length})
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filteredStrategies.map(s => (
            <div key={s.id} className="p-3 bg-gw-surface rounded-lg border border-gw-border">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded ${s.priority === 'high' ? 'bg-red-500/20 text-red-400' : s.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'}`}>
                    {s.priority === 'high' ? '高优先' : s.priority === 'medium' ? '中优先' : '低优先'}
                  </span>
                  <span className="text-xs font-medium text-gw-text">{s.name}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gw-muted">
                  <span>成本: {costLabels[s.cost]}</span>
                  <span>周期: {timeLabels[s.implementationTime]}</span>
                </div>
              </div>
              <p className="text-[11px] text-gw-muted">{s.description}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] text-gw-muted">适用情景:</span>
                {s.applicableScenario.map(sc => (
                  <span key={sc} className="text-[9px] px-1.5 py-0.5 bg-gw-border/50 rounded text-gw-text">{SCENARIO_PARAMS[sc].label}</span>
                ))}
              </div>
              <div className="mt-1 text-[10px] text-green-400">
                预期效益: {s.expectedBenefit}
              </div>
            </div>
          ))}
        </div>
      </TechCard>

      <TechCard>
        <h5 className="text-xs font-medium text-gw-text mb-3">策略分类分布</h5>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={{ fontSize: 10 }}>
              {categoryData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
            </Pie>
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
          </PieChart>
        </ResponsiveContainer>
      </TechCard>
    </div>
  );
}
