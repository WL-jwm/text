/**
 * B-29 地下水空间统计分析器 Tab
 *
 * 4大面板：
 *  1. Moran's I — 全局空间自相关+LISA局部热点/冷点
 *  2. 半变异函数 — 实验+理论模型拟合(球状/指数/高斯)
 *  3. 交叉验证 — 克里金插值精度评估(留一法)
 *  4. 参考 — 空间统计方法与判据说明
 * 面板: MoranIPanel（拆分自 SpatialStatsCalculatorTab.tsx）
 */
import { calcLocalMoran, calcMoranI, PRESET_REGIONS } from '../../../utils/spatialStatsCalculator';
import { FilterableTechTable } from '../../FilterableTechTable';
import { LazyChartCard } from '../../LazyChartCard';
import { StatCard, TechCard } from '../../UI';
import { Globe, BookOpen, Calculator, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CartesianGrid, ScatterChart, Scatter, Tooltip, ZAxis, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { PATTERN_COLORS, QUADRANT_COLORS, TOOLTIP_STYLE } from './spatialStatsConstants';

export function MoranIPanel() {
  const [regionIdx, setRegionIdx] = useState(0);
  const [weightType, setWeightType] = useState<'inverse' | 'distance' | 'binary'>('inverse');
  const [distanceBand, setDistanceBand] = useState(50);

  const region = PRESET_REGIONS[regionIdx];
  const moranInput = { points: region.points, weightType, distanceBand };
  const globalResult = useMemo(() => calcMoranI(moranInput), [regionIdx, weightType, distanceBand]);
  const localResults = useMemo(() => calcLocalMoran(moranInput), [regionIdx, weightType, distanceBand]);

  const scatterData = localResults.map(r => ({
    name: r.name,
    x: r.x,
    y: r.y,
    value: r.value,
    localI: r.localI,
    z: Math.abs(r.zScore),
    quadrant: r.quadrant,
    color: QUADRANT_COLORS[r.quadrant] ?? '#64748b',
  }));

  const quadrantCounts: Record<string, number> = {};
  localResults.forEach(r => {
    const key = r.quadrant.split('（')[0];
    quadrantCounts[key] = (quadrantCounts[key] || 0) + 1;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1 items-center">
        {PRESET_REGIONS.map((r, i) => (
          <button key={i} onClick={() => setRegionIdx(i)}
            className={`px-2 py-1 rounded text-[10px] transition-all ${regionIdx === i ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-gw-surface/50 text-gw-muted hover:text-gw-text border border-transparent'}`}>
            {r.name.length > 10 ? r.name.substring(0, 10) + '...' : r.name}
          </button>
        ))}
        <select value={weightType} onChange={e => setWeightType(e.target.value as 'inverse' | 'distance' | 'binary')}
          className="px-2 py-1 bg-gw-surface border border-gw-border/50 rounded text-[10px] text-gw-text ml-2">
          <option value="inverse">反距离权重</option>
          <option value="distance">反距离平方权重</option>
          <option value="binary">二值邻接权重</option>
        </select>
        {weightType === 'binary' && (
          <input type="number" value={distanceBand} onChange={e => setDistanceBand(parseFloat(e.target.value) || 50)}
            className="w-16 px-2 py-1 bg-gw-surface border border-gw-border/50 rounded text-[10px] text-gw-text font-mono" />
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="Moran's I" value={globalResult.moranI} unit="" icon={Globe} accent="blue" />
        <StatCard title="Z得分" value={globalResult.zScore} unit="" icon={TrendingUp} accent="cyan" />
        <StatCard title="p值" value={globalResult.pValue} unit="" icon={Calculator} accent="amber" />
        <StatCard title="分布模式" value={globalResult.pattern} unit="" icon={BookOpen} accent={globalResult.pattern === '聚集' ? 'red' : globalResult.pattern === '离散' ? 'cyan' : 'blue'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TechCard title="全局Moran's I 检验结果" badge={globalResult.significant ? '显著' : '不显著'}>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-gw-surface/50 rounded">
              <span className="text-gw-muted">观测I值: </span>
              <span className="font-mono text-gw-highlight">{globalResult.moranI}</span>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded">
              <span className="text-gw-muted">期望E[I]: </span>
              <span className="font-mono text-gw-text">{globalResult.expectedI}</span>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded">
              <span className="text-gw-muted">方差: </span>
              <span className="font-mono text-gw-text">{globalResult.variance}</span>
            </div>
            <div className="p-2 bg-gw-surface/50 rounded">
              <span className="text-gw-muted">模式: </span>
              <span className="font-mono" style={{ color: PATTERN_COLORS[globalResult.pattern] ?? '#64748b' }}>{globalResult.pattern}</span>
            </div>
          </div>
          <p className="text-[10px] text-gw-muted mt-2">{globalResult.note}</p>
        </TechCard>

        <TechCard title="LISA象限分布" badge="局部空间自相关">
          <div className="grid grid-cols-2 gap-2">
            {(['HH', 'LL', 'HL', 'LH'] as const).map(q => {
              const count = quadrantCounts[q] || 0;
              const fullKey = Object.keys(QUADRANT_COLORS).find(k => k.startsWith(q));
              return (
                <div key={q} className="p-2 bg-gw-surface/50 rounded text-center">
                  <div className="text-[10px] text-gw-muted">{q}</div>
                  <div className="text-lg font-mono" style={{ color: QUADRANT_COLORS[fullKey ?? ''] ?? '#64748b' }}>{count}</div>
                </div>
              );
            })}
          </div>
        </TechCard>
      </div>

      <LazyChartCard title="LISA空间分布（气泡大小=|Z|，颜色=象限）" height={320}>
        <ResponsiveContainer width="100%" height={320}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
            <XAxis type="number" dataKey="x" name="经度" stroke="#64748b" fontSize={10} />
            <YAxis type="number" dataKey="y" name="纬度" stroke="#64748b" fontSize={10} />
            <ZAxis type="number" dataKey="z" range={[50, 400]} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Scatter data={scatterData}>
              {scatterData.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </LazyChartCard>

      <TechCard title="局部Moran's I 明细">
        <FilterableTechTable
          headers={['点名称', '局部I', 'Z得分', '象限', '显著', '值']}
          rows={localResults.map(r => [
            r.name, String(r.localI), String(r.zScore),
            r.quadrant, r.significant ? '是' : '否', String(r.value),
          ])}
          filterPlaceholder="搜索..."
        />
      </TechCard>
    </div>
  );
}
