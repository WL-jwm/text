/**
 * 拆分自 UncertaintyAnalysisTab.tsx
 */
import { useState, useMemo } from 'react';
import { CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from 'recharts';
import { Filter } from 'lucide-react';
import { TechCard } from '../../UI';
import { FilterableTechTable } from '../../FilterableTechTable';
import { runMorrisScreening, type ModelFunction, type UncertainParameter } from '../../../utils/uncertaintyAnalyzer';
import { NumInput } from './NumInput';
import { TOOLTIP_STYLE } from './uncertaintyConstants';

export function MorrisPanel({ model, parameters }: { model: ModelFunction; parameters: UncertainParameter[] }) {
  const [r, setR] = useState(10);
  const [result, setResult] = useState<ReturnType<typeof runMorrisScreening> | null>(null);
  const [running, setRunning] = useState(false);

  const run = () => {
    setRunning(true);
    setTimeout(() => {
      const res = runMorrisScreening(parameters, model, r, 4, 42);
      setResult(res);
      setRunning(false);
    }, 50);
  };

  const scatterData = useMemo(() => {
    if (!result) return [];
    return result.elementaryEffects.map(ee => ({
      name: ee.parameter,
      muStar: ee.muStar,
      sigma: ee.sigma,
    }));
  }, [result]);

  const tableRows = useMemo(() => {
    if (!result) return [];
    return result.elementaryEffects.map(ee => {
      const rank = result.ranking.find(r => r.parameter === ee.parameter);
      return [
        ee.parameter,
        ee.mu.toFixed(4),
        ee.muStar.toFixed(4),
        ee.sigma.toFixed(4),
        rank?.influence === 'high' ? '高影响' : rank?.influence === 'medium' ? '中等影响' : '低影响',
      ];
    });
  }, [result]);

  return (
    <div className="space-y-4">
      <TechCard>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-amber-400" />
            <h4 className="text-sm font-semibold text-gw-text">Morris筛选法</h4>
          </div>
          <div className="flex items-center gap-2">
            <NumInput label="轨迹数r" value={r} onChange={setR} step={5} />
            <button onClick={run} disabled={running}
              className="px-4 py-1.5 text-xs bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30 hover:bg-amber-500/30 disabled:opacity-50 mt-4">
              {running ? '计算中...' : '运行'}
            </button>
          </div>
        </div>
      </TechCard>

      {result && (
        <>
          <TechCard>
            <h5 className="text-xs font-medium text-gw-text mb-3">μ* vs σ 散点图（影响-交互诊断）</h5>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" dataKey="muStar" name="μ*" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: 'μ*（影响大小）', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 10 }} />
                <YAxis type="number" dataKey="sigma" name="σ" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: 'σ（非线性/交互）', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
                <ZAxis range={[80, 80]} />
                <Tooltip {...TOOLTIP_STYLE} cursor={{ strokeDasharray: '3 3' }} />
                <Scatter data={scatterData} fill="#f59e0b" />
              </ScatterChart>
            </ResponsiveContainer>
            <div className="text-[10px] text-gw-muted mt-1">
              右上角：高影响+高交互 | 右下角：高影响+低交互(线性) | 左侧：低影响
            </div>
          </TechCard>

          <TechCard>
            <h5 className="text-xs font-medium text-gw-text mb-2">Morris基本效应统计</h5>
            <FilterableTechTable
              headers={['参数', 'μ（均值）', 'μ*（绝对均值）', 'σ（标准差）', '影响等级']}
              rows={tableRows}
            />
          </TechCard>
        </>
      )}
    </div>
  );
}
