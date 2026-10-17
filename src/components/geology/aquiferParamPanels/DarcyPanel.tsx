/**
 * 面板: DarcyPanel（拆分自 AquiferParamTab.tsx）
 */
import { usePipeline } from '../../../hooks/usePipeline';
import { fmtVal, calcDarcy } from '../../../utils/aquiferParamCalculator';
import { PipelinePanel } from '../../PipelinePanel';
import { TechCard } from '../../UI';
import { Droplets } from 'lucide-react';
import { useMemo, useState } from 'react';

export function DarcyPanel() {
  const { publishData } = usePipeline('aquiferParam');
  const [q, setQ] = useState(0);
  const [k, setK] = useState(10);
  const [i, setI] = useState(0.01);
  const [a, setA] = useState(100);

  const result = useMemo(() =>
    calcDarcy({ flowRateQ: q || undefined, hydraulicK: k || undefined, hydraulicGradientI: i || undefined, crossSectionA: a || undefined }),
    [q, k, i, a],
  );

  const fields: { key: string; label: string; value: number; unit: string; editable: boolean; onChange: (v: number) => void; highlight?: boolean }[] = [
    { key: 'Q', label: '\u6e17\u900f\u6d41\u91cf Q', value: q, unit: 'm\u00b3/d', editable: true, onChange: setQ, highlight: result?.calculatedField === 'flowRateQ' },
    { key: 'K', label: '\u6e17\u900f\u7cfb\u6570 K', value: k, unit: 'm/d', editable: true, onChange: setK, highlight: result?.calculatedField === 'hydraulicK' },
    { key: 'I', label: '\u6c34\u529b\u5761\u5ea6 I', value: i, unit: '', editable: true, onChange: setI, highlight: result?.calculatedField === 'hydraulicGradientI' },
    { key: 'A', label: '\u8fc7\u6c34\u65ad\u9762 A', value: a, unit: 'm\u00b2', editable: true, onChange: setA, highlight: result?.calculatedField === 'crossSectionA' },
  ];

  return (
    <TechCard icon={Droplets} badge={'\u8fbe\u897f\u516c\u5f0f'}>
      <p className="text-[10px] text-gw-muted mb-3">{'Q = K \u00b7 I \u00b7 A \u2014 \u586b\u51653\u4e2a\u5df2\u77e5\u503c\uff0c\u7b2c4\u4e2a\u81ea\u52a8\u8ba1\u7b97'}</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {fields.map(f => (
          <div key={f.key} className={`p-2 rounded-lg border ${f.highlight ? 'border-gw-blue/40 bg-gw-blue/10' : 'border-gw-border/20 bg-gw-surface/30'}`}>
            <div className="text-[10px] text-gw-muted mb-1">{f.label}</div>
            {f.editable ? (
              <input
                type="number"
                step="any"
                value={f.value || ''}
                onChange={e => f.onChange(Number(e.target.value) || 0)}
                className={`w-full bg-transparent border-b ${f.highlight ? 'border-gw-blue/50 text-gw-highlight' : 'border-gw-border/30'} rounded-none px-0 py-0.5 text-sm font-mono
                  focus:outline-none`}
              />
            ) : (
              <div className="text-sm font-mono font-medium text-gw-highlight">{fmtVal(f.value)}</div>
            )}
            <div className="text-[9px] text-gw-muted mt-0.5">{f.unit}</div>
          </div>
        ))}
      </div>
      {!result && (
        <p className="text-[10px] text-amber-400 mt-2">{'\u8bf7\u586b\u5165\u81f3\u5c113\u4e2a\u975e\u96f6\u503c'}</p>
      )}
      {result && (
        <div className="mt-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <span className="text-[10px] text-emerald-400">{'\u8ba1\u7b97\u7ed3\u679c: Q = '}{fmtVal(result.flowRateQ)}{' m\u00b3/d | K = '}{fmtVal(result.hydraulicK)}{' m/d | I = '}{fmtVal(result.hydraulicGradientI)}{' | A = '}{fmtVal(result.crossSectionA)}{' m\u00b2'}</span>
        </div>
      )}
      <PipelinePanel moduleId="aquiferParam" onPublish={() => {
        const params: Record<string, unknown> = {};
        if (result?.hydraulicK) params.hydraulicConductivity = result.hydraulicK;
        if (k) params.hydraulicConductivity = k;
        if (result?.hydraulicGradientI) params.hydraulicGradient = result.hydraulicGradientI;
        if (i) params.hydraulicGradient = i;
        if (result?.crossSectionA) params.crossSectionArea = result.crossSectionA;
        if (Object.keys(params).length > 0) {
          publishData('aquiferParams', `含水层参数(K=${params.hydraulicConductivity ?? 'N/A'})`, params, '达西公式面板');
        }
      }} />
    </TechCard>
  );
}
