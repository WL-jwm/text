/**
 * B-12 地面沉降与降落漏斗分析 Tab
 *
 * 4大面板：
 *  1. 漏斗计算器 — 水文地质参数输入→漏斗半径/降深/体积
 *  2. 沉降估算 — 土层参数→分层沉降量+总沉降
 *  3. 趋势分析 — 历史沉降趋势+预测
 *  4. 沉降风险 — 河北典型沉降区+风险分区
 * 面板: SubsidenceCalcPanel（拆分自 SubsidenceTab.tsx）
 */
import { type SubsidenceInput, LAYER_TYPES, calcSubsidence } from '../../../utils/subsidenceCalculator';
import { TechCard } from '../../UI';
import { ArrowDown } from 'lucide-react';
import { useMemo, useState } from 'react';

export function SubsidenceCalcPanel() {
  const [layerCount, setLayerCount] = useState(3);
  const [b, _setB] = useState(80);
  const [deltaH, _setDeltaH] = useState(15);
  const [e0, _setE0] = useState(0.8);
  const [Cc, _setCc] = useState(0.15);
  const [sigma0, _setSigma0] = useState(200);
  const [Ss, _setSs] = useState(0.0005);

  const [layerTypes, setLayerTypes] = useState(['粉质黏土', '黏土', '粉土']);
  const [layerThicks, setLayerThicks] = useState([30, 25, 25]);
  const [layerSs, setLayerSs] = useState([0.0005, 0.0008, 0.0003]);
  const [layerDhs, setLayerDhs] = useState([12, 15, 18]);

  const input: SubsidenceInput = {
    b, Ss, deltaH, e0, Cc, sigma0, layerCount,
    layerThicknesses: layerThicks, layerSs, layerDeltaH: layerDhs,
  };
  const result = useMemo(() => calcSubsidence(input), [b, Ss, deltaH, e0, Cc, sigma0, layerCount, ...layerThicks, ...layerSs, ...layerDhs]);

  const updateLayer = (idx: number, type: string) => {
    const info = LAYER_TYPES.find(l => l.name === type);
    if (!info) return;
    const newTypes = [...layerTypes];
    newTypes[idx] = type;
    setLayerTypes(newTypes);
    const newSs = [...layerSs];
    newSs[idx] = info.Ss;
    setLayerSs(newSs);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TechCard icon={ArrowDown} title="土层参数输入" badge="分层估算">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs text-gw-muted">土层数量</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setLayerCount(n)}
                    className={`w-6 h-6 rounded text-xs ${layerCount === n ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30' : 'bg-gw-surface text-gw-muted border border-gw-border/30'}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            {Array.from({ length: layerCount }, (_, i) => (
              <div key={i} className="p-2 rounded-lg bg-gw-surface space-y-1.5">
                <div className="text-[10px] text-gw-muted">第{i + 1}层</div>
                <div className="grid grid-cols-3 gap-1.5">
                  <select value={layerTypes[i] || '粉质黏土'} onChange={e => updateLayer(i, e.target.value)}
                    className="px-2 py-1 rounded bg-gw-bg border border-gw-border/30 text-gw-text text-[10px]">
                    {LAYER_TYPES.map(l => <option key={l.name} value={l.name}>{l.name}</option>)}
                  </select>
                  <input type="number" step="any" value={layerThicks[i] || 0} onChange={e => {
                    const n = [...layerThicks]; n[i] = Number(e.target.value) || 0; setLayerThicks(n);
                  }} className="px-2 py-1 rounded bg-gw-bg border border-gw-border/30 text-gw-text text-[10px]" placeholder="厚(m)" />
                  <input type="number" step="any" value={layerDhs[i] || 0} onChange={e => {
                    const n = [...layerDhs]; n[i] = Number(e.target.value) || 0; setLayerDhs(n);
                  }} className="px-2 py-1 rounded bg-gw-bg border border-gw-border/30 text-gw-text text-[10px]" placeholder="Δh(m)" />
                </div>
              </div>
            ))}
          </div>
        </TechCard>

        <TechCard icon={ArrowDown} title="沉降估算结果" badge={`${result.riskLevel}风险`}>
          <div className="flex flex-col items-center py-4">
            <div className="text-5xl font-bold" style={{ color: result.riskColor }}>{result.totalSubsidence}<span className="text-lg ml-1">mm</span></div>
            <div className="text-sm mt-2 font-semibold" style={{ color: result.riskColor }}>{result.riskLevel}风险</div>
            <div className="text-xs text-gw-muted mt-1 text-center max-w-xs">{result.description}</div>
          </div>
          {result.layerSubsidence.length > 0 && (
            <div className="space-y-1 mt-2">
              {result.layerSubsidence.map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="text-gw-muted w-12">第{i + 1}层</span>
                  <div className="flex-1 h-3 rounded-full bg-gw-surface overflow-hidden">
                    <div className="h-full rounded-full" style={{
                      width: `${Math.min(100, s / Math.max(...result.layerSubsidence) * 100)}%`,
                      backgroundColor: s > 50 ? '#ef4444' : '#3b82f6',
                    }} />
                  </div>
                  <span className="font-mono text-gw-text w-16 text-right">{s}mm</span>
                </div>
              ))}
            </div>
          )}
        </TechCard>
      </div>
    </div>
  );
}
