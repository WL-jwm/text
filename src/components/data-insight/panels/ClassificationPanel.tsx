/**
 * ClassificationPanel — 交互分析面板（自 GwSwInteractionTab.tsx 拆分）
 */
import { useMemo } from 'react';
import { Waves, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { TechCard } from '../../UI';
import { PRESET_RIVERS, INTERACTION_TYPE_COLORS, calcExchangeFlux, classifyInteraction } from '../../../utils/gwSwInteractionCalculator';

// ── 面板4: 交互分类 ──
export function ClassificationPanel({ riverId }: { riverId: string }) {
  const river = PRESET_RIVERS.find(r => r.id === riverId)!;
  const result = useMemo(() => {
    const exchange = calcExchangeFlux(river.points as typeof river.points, river.segmentLength);
    return classifyInteraction(exchange, river.points as typeof river.points);
  }, [river]);

  const color = INTERACTION_TYPE_COLORS[result.type];

  return (
    <div className="space-y-4">
      <TechCard>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
            <Waves size={24} style={{ color }} />
          </div>
          <div>
            <h4 className="text-sm font-semibold" style={{ color }}>{result.description}</h4>
            <p className="text-[10px] text-gw-muted mt-0.5">{river.name}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h5 className="text-xs font-medium text-gw-text mb-1">主要特征</h5>
            <ul className="space-y-1">
              {result.characteristics.map((c, idx) => (
                <li key={idx} className="flex items-start gap-2 text-[11px] text-gw-muted">
                  <CheckCircle2 size={12} className="text-green-400 mt-0.5 flex-shrink-0" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3 bg-gw-surface rounded-lg">
            <h5 className="text-xs font-medium text-gw-text mb-1">生态意义</h5>
            <p className="text-[11px] text-gw-muted leading-relaxed">{result.ecologicalImplications}</p>
          </div>

          <div>
            <h5 className="text-xs font-medium text-gw-text mb-1">管理建议</h5>
            <div className="space-y-2">
              {result.managementSuggestions.map((s, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <AlertTriangle size={12} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  <span className="text-[11px] text-gw-text">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </TechCard>

      <TechCard>
        <h5 className="text-xs font-medium text-gw-text mb-3">年水量平衡</h5>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="text-center p-3 bg-gw-surface rounded-lg">
            <div className="text-[10px] text-gw-muted">基流贡献</div>
            <div className="text-lg font-bold text-green-400">{((river.area * 1000000 * 0.1) / 1000).toFixed(0)}</div>
            <div className="text-[9px] text-gw-muted">万m³/a</div>
          </div>
          <div className="text-center p-3 bg-gw-surface rounded-lg">
            <div className="text-[10px] text-gw-muted">河流渗漏</div>
            <div className="text-lg font-bold text-red-400">{((river.area * 1000000 * 0.05) / 1000).toFixed(0)}</div>
            <div className="text-[9px] text-gw-muted">万m³/a</div>
          </div>
          <div className="text-center p-3 bg-gw-surface rounded-lg">
            <div className="text-[10px] text-gw-muted">地下水排泄</div>
            <div className="text-lg font-bold text-cyan-400">{((river.area * 1000000 * 0.08) / 1000).toFixed(0)}</div>
            <div className="text-[9px] text-gw-muted">万m³/a</div>
          </div>
          <div className="text-center p-3 bg-gw-surface rounded-lg">
            <div className="text-[10px] text-gw-muted">净交换量</div>
            <div className="text-lg font-bold text-purple-400">{((river.area * 1000000 * 0.03) / 1000).toFixed(0)}</div>
            <div className="text-[9px] text-gw-muted">万m³/a</div>
          </div>
        </div>
      </TechCard>
    </div>
  );
}
