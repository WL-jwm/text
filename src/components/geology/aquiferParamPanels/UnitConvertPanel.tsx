/**
 * 面板: UnitConvertPanel（拆分自 AquiferParamTab.tsx）
 */
import { fmtVal, convertUnit } from '../../../utils/aquiferParamCalculator';
import { TechCard } from '../../UI';
import { ArrowRightLeft } from 'lucide-react';
import { useMemo, useState } from 'react';
import { NumInput } from './NumInput';

export function UnitConvertPanel() {
  const [inputVal, setInputVal] = useState(10);
  const [fromUnit, setFromUnit] = useState('m/d');
  const [toUnit, setToUnit] = useState('m/s');

  const converted = useMemo(() => convertUnit(inputVal, fromUnit, toUnit), [inputVal, fromUnit, toUnit]);

  const unitGroups = [
    { label: '\u6e17\u900f\u7cfb\u6570', units: ['m/d', 'm/s', 'cm/s'] },
    { label: '\u6d41\u91cf', units: ['m\u00b3/d', 'm\u00b3/h', 'L/s'] },
  ];

  return (
    <TechCard icon={ArrowRightLeft} badge={'\u5355\u4f4d\u6362\u7b97'}>
      <div className="flex flex-wrap items-end gap-3">
        <NumInput label={'\u8f93\u5165\u503c'} value={inputVal} onChange={setInputVal} />
        {unitGroups.map(g => (
          <div key={g.label} className="flex flex-col gap-0.5">
            <label className="text-[10px] text-gw-muted">{g.label}</label>
            <div className="flex gap-1">
              {g.units.map(u => (
                <button key={u}
                  onClick={() => { setFromUnit(u); }}
                  className={`px-2 py-1 rounded text-[10px] transition-all ${fromUnit === u ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30' : 'bg-gw-surface text-gw-muted border border-gw-border/20 hover:bg-gw-border/20'}`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        ))}
        <div className="flex flex-col gap-0.5">
          <label className="text-[10px] text-gw-muted">{'\u8f6c\u6362\u4e3a'}</label>
          <div className="flex gap-1">
            {unitGroups.flatMap(g => g.units).map(u => (
              <button key={u}
                onClick={() => { setToUnit(u); }}
                className={`px-2 py-1 rounded text-[10px] transition-all ${toUnit === u ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-gw-surface text-gw-muted border border-gw-border/20 hover:bg-gw-border/20'}`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-2 p-2 rounded-lg bg-gw-surface/30">
        <span className="text-xs text-gw-muted">{fmtVal(inputVal)} {fromUnit} = </span>
        <span className="text-sm font-mono font-medium text-gw-highlight"> {fmtVal(converted)} {toUnit}</span>
      </div>
    </TechCard>
  );
}
