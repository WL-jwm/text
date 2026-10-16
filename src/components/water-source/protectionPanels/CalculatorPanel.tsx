/**
 * B-10 水源地保护区划分 Tab
 *
 * 5大面板：
 *  1. 计算器 — 输入水文地质参数 → 计算保护区半径/面积
 *  2. 同心圆图 — 保护区可视化（一级/二级/准保护区嵌套）
 *  3. 预设水源地 — 8个河北重要水源地保护区一览
 *  4. 经验值参考表 — HJ/T 338-2007附录A查表
 *  5. 介质参数参考 — 有效孔隙度/渗透系数
 * 面板: CalculatorPanel（拆分自 ProtectionZoneTab.tsx）
 */
import { type AnalyticInput, type SourceType, calcProtectionZone, MEDIUM_POROSITY } from '../../../utils/protectionZoneCalculator';
import { PipelinePanel } from '../../PipelinePanel';
import { TechCard, StatCard } from '../../UI';
import { Calculator, Shield, Layers } from 'lucide-react';
import { useState, useMemo } from 'react';
import { MEDIUM_NAMES, SCALES, SOURCE_TYPES } from './protectionConstants';
import { ZoneConcentricSVG } from './ZoneConcentricSVG';

export function CalculatorPanel() {
  const [sourceName, setSourceName] = useState('自定义水源地');
  const [sourceType, setSourceType] = useState<SourceType>('孔隙水-潜水');
  const [scale, setScale] = useState<typeof SCALES[number]>('大型');
  const [medium, setMedium] = useState('砾石卵石');
  const [K, setK] = useState(150);
  const [I, setI] = useState(0.003);
  const [ne, setNe] = useState(0.25);
  const [M, setM] = useState(50);
  const [Q, setQ] = useState(12000);
  const [rw, setRw] = useState(0.3);

  const onMediumChange = (name: string) => {
    setMedium(name);
    const info = MEDIUM_POROSITY[name];
    if (info) {
      setK(info.K);
      setNe(info.ne);
    }
  };

  const result = useMemo(() => {
    const input: AnalyticInput = { K, I, ne, M, Q, rw };
    return calcProtectionZone(sourceName, sourceType, input, scale);
  }, [sourceName, sourceType, K, I, ne, M, Q, rw, scale]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 输入区 */}
        <TechCard icon={Calculator} title="保护区划分参数" badge="输入">
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gw-muted">水源地名称</label>
              <input type="text" value={sourceName} onChange={e => setSourceName(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gw-muted">水源地类型</label>
                <select value={sourceType} onChange={e => setSourceType(e.target.value as SourceType)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm">
                  {SOURCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gw-muted">规模</label>
                <select value={scale} onChange={e => setScale(e.target.value as typeof SCALES[number])}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm">
                  {SCALES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-gw-muted">含水层介质（选择后自动填充K和n_e）</label>
              <select value={medium} onChange={e => onMediumChange(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm">
                {MEDIUM_NAMES.map(m => <option key={m} value={m}>{m}（K={MEDIUM_POROSITY[m].K} m/d, ne={MEDIUM_POROSITY[m].ne}）</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gw-muted">渗透系数 K (m/d)</label>
                <input type="number" step="any" value={K} onChange={e => setK(Number(e.target.value) || 0)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm" />
              </div>
              <div>
                <label className="text-xs text-gw-muted">水力坡度 I</label>
                <input type="number" step="any" value={I} onChange={e => setI(Number(e.target.value) || 0)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm" />
              </div>
              <div>
                <label className="text-xs text-gw-muted">有效孔隙度 n_e</label>
                <input type="number" step="any" value={ne} onChange={e => setNe(Number(e.target.value) || 0)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm" />
              </div>
              <div>
                <label className="text-xs text-gw-muted">含水层厚度 M (m)</label>
                <input type="number" step="any" value={M} onChange={e => setM(Number(e.target.value) || 0)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm" />
              </div>
              <div>
                <label className="text-xs text-gw-muted">开采量 Q (m³/d)</label>
                <input type="number" step="any" value={Q} onChange={e => setQ(Number(e.target.value) || 0)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm" />
              </div>
              <div>
                <label className="text-xs text-gw-muted">井半径 r_w (m)</label>
                <input type="number" step="any" value={rw} onChange={e => setRw(Number(e.target.value) || 0)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-gw-surface border border-gw-border text-gw-text text-sm" />
              </div>
            </div>
          </div>
        </TechCard>

        {/* 同心圆可视化 */}
        <TechCard icon={Shield} title="保护区同心圆示意图">
          <ZoneConcentricSVG result={result} />
        </TechCard>
      </div>

      {/* 结果表 */}
      <TechCard icon={Layers} title="保护区划分结果" badge={result.methodSummary}>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <StatCard title="一级保护区" value={`${result.primaryRadius}`} unit="m" subtitle={`面积 ${result.zones[0]?.area || 0} km²`} accent="red" />
          <StatCard title="二级保护区" value={`${result.secondaryRadius}`} unit="m" subtitle={`面积 ${result.zones[1]?.area || 0} km²`} accent="amber" />
          <StatCard title="总保护区面积" value={`${result.totalArea}`} unit="km²" subtitle="含准保护区" accent="blue" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gw-border">
                <th className="text-left p-2 text-gw-muted">保护区级别</th>
                <th className="text-right p-2 text-gw-muted">半径 (m)</th>
                <th className="text-right p-2 text-gw-muted">面积 (km²)</th>
                <th className="text-left p-2 text-gw-muted">划分方法</th>
                <th className="text-left p-2 text-gw-muted">计算依据</th>
              </tr>
            </thead>
            <tbody>
              {result.zones.map(z => (
                <tr key={z.level} className="border-b border-gw-border/50 hover:bg-gw-surface/50">
                  <td className="p-2">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: z.color }} />
                      <span className="font-medium" style={{ color: z.color }}>{z.level}保护区</span>
                    </span>
                  </td>
                  <td className="p-2 text-right font-mono text-gw-text">{z.radius}</td>
                  <td className="p-2 text-right font-mono text-gw-text">{z.area}</td>
                  <td className="p-2 text-gw-muted">{z.method}</td>
                  <td className="p-2 text-gw-muted text-[11px]">{z.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TechCard>
      <PipelinePanel moduleId="protectionZone" onReceive={(dataType, payload) => {
        if (dataType === 'aquiferParams') {
          const parts: string[] = [];
          if (payload.hydraulicConductivity) parts.push(`K=${payload.hydraulicConductivity} m/d`);
          if (payload.hydraulicGradient) parts.push(`I=${payload.hydraulicGradient}`);
          if (parts.length > 0) alert(`已接收含水层参数:\n${parts.join(', ')}\n\n请手动更新保护区划分参数。`);
        }
      }} />
    </div>
  );
}
