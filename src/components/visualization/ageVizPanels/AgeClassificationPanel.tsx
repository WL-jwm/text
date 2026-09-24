/**
 * GroundwaterAgeViz — E-01 地下水年龄可视化模块
 *
 * 融合同位素测年数据，提供多维度地下水年龄分析：
 *   1. 14C年龄-深度剖面（对数坐标，含含水层组标注）
 *   2. δD-δ18O同位素散点图（大气降水线 + 蒸发线 + 分区着色）
 *   3. 沿径流路径的氚含量衰减曲线（浅层 vs 深层）
 *   4. 水样类型筛选（潜水/中层/深层/岩溶）+ hover详情
 *   5. 年龄分级统计面板
 * 面板组件：AgeClassificationPanel（拆分自 GroundwaterAgeViz.tsx）
 */

import { useMemo } from 'react';
import { Hourglass, Mountain } from 'lucide-react';
import { TechCard } from '../../UI';
import { isotopeSamples } from '../../../data/hydrochemistry';

// ── 子组件：年龄分级统计面板 ──
export function AgeClassificationPanel() {
  const stats = useMemo(() => {
    const groups = [
      { label: '现代水', range: '< 50年', color: '#22c55e', samples: isotopeSamples.filter(s => s.tritium > 10), desc: '含大量核试验后氚，活跃补给' },
      { label: '次现代水', range: '50~500年', color: '#3b82f6', samples: isotopeSamples.filter(s => s.tritium > 3 && s.tritium <= 10), desc: '少量氚检出，混合补给' },
      { label: '古水(全新世)', range: '500~10000年', color: '#f59e0b', samples: isotopeSamples.filter(s => s.tritium > 0.5 && s.tritium <= 3), desc: '氚接近检出限，缓慢循环' },
      { label: '古水(晚更新世)', range: '> 10000年', color: '#ef4444', samples: isotopeSamples.filter(s => s.tritium <= 0.5), desc: '无氚，末次冰期入渗' },
    ];
    return groups.map(g => ({
      ...g,
      count: g.samples.length,
      pct: (g.samples.length / isotopeSamples.length) * 100,
      locations: g.samples.map(s => s.location).slice(0, 4),
    }));
  }, []);

  const totalAgeRange = useMemo(() => {
    const deepSamples = isotopeSamples.filter(s => s.type === 'deep');
    const maxAge = Math.max(...deepSamples.map(s => {
      const m = s.age.match(/(\d+)/);
      return m ? parseInt(m[1], 10) : 0;
    }));
    return maxAge;
  }, []);

  return (
    <TechCard>
      <h3 className="text-sm font-semibold text-gw-text flex items-center gap-2 mb-3">
        <Hourglass size={14} className="text-cyan-400" />
        地下水年龄分级
      </h3>
      <div className="space-y-2">
        {stats.map((s, i) => (
          <div key={i} className="p-2 rounded-lg border border-gw-border/20">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ background: s.color, opacity: 0.6 }} />
                <span className="text-[11px] text-gw-text font-medium">{s.label}</span>
                <span className="text-[9px] text-gw-muted">{s.range}</span>
              </div>
              <span className="text-[10px] text-gw-text font-mono">{s.count}个 ({s.pct.toFixed(0)}%)</span>
            </div>
            <div className="h-1.5 rounded-full bg-gw-surface/60 overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${s.pct}%`, background: s.color }} />
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-[9px] text-gw-muted">{s.desc}</span>
              <span className="text-[8px] text-gw-muted/60">{s.locations.join('、')}{s.count > 4 ? '...' : ''}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 p-2 rounded-lg bg-gw-surface/60 border border-gw-border/20">
        <div className="text-[10px] text-gw-text font-medium mb-1 flex items-center gap-1">
          <Mountain size={10} className="text-cyan-400" />
          测年方法适用范围
        </div>
        <div className="grid grid-cols-3 gap-2 text-[9px]">
          <div className="text-center p-1.5 rounded bg-gw-card/60">
            <div className="text-green-400 font-bold">³H</div>
            <div className="text-gw-muted">氚法</div>
            <div className="text-gw-muted/50">1950s以来</div>
          </div>
          <div className="text-center p-1.5 rounded bg-gw-card/60">
            <div className="text-blue-400 font-bold">³H/³He</div>
            <div className="text-gw-muted">氚-氦法</div>
            <div className="text-gw-muted/50">~50年</div>
          </div>
          <div className="text-center p-1.5 rounded bg-gw-card/60">
            <div className="text-amber-400 font-bold">¹⁴C</div>
            <div className="text-gw-muted">碳-14法</div>
            <div className="text-gw-muted/50">500~50k年</div>
          </div>
        </div>
        <div className="mt-2 text-center text-[9px] text-gw-muted">
          河北平原深层承压水最大14C表观年龄: <span className="text-amber-400 font-bold">~{totalAgeRange}年</span>
        </div>
      </div>
    </TechCard>
  );
}
