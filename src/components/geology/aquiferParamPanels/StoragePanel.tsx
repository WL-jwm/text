/**
 * 面板: StoragePanel（拆分自 AquiferParamTab.tsx）
 */
import { calcStorage, fmtVal } from '../../../utils/aquiferParamCalculator';
import { StatCard, TechCard } from '../../UI';
import { Database } from 'lucide-react';
import { useMemo, useState } from 'react';
import { NumInput } from './NumInput';

export function StoragePanel() {
  const [mu, setMu] = useState(0.15);
  const [f, setF] = useState(1000);
  const [dh, setDh] = useState(1);

  const result = useMemo(() =>
    calcStorage({ specificYield: mu, area: f, waterLevelChange: dh }),
    [mu, f, dh],
  );

  return (
    <TechCard icon={Database} badge={'\u50a8\u5b58\u91cf\u8ba1\u7b97'}>
      <p className="text-[10px] text-gw-muted mb-3">{'V = \u03bc \u00b7 F \u00b7 \u0394h \u2014 \u7ed9\u6c34\u5ea6\u00d7\u9762\u79ef\u00d7\u6c34\u4f4d\u53d8\u5e45'}</p>
      <div className="grid grid-cols-3 gap-3 mb-3">
        <NumInput label={'\u7ed9\u6c34\u5ea6 \u03bc'} value={mu} onChange={setMu} unit="" placeholder="0.15" />
        <NumInput label={'\u9762\u79ef F'} value={f} onChange={setF} unit="km\u00b2" placeholder="1000" />
        <NumInput label={'\u6c34\u4f4d\u53d8\u5e45 \u0394h'} value={dh} onChange={setDh} unit="m" placeholder="1" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <StatCard title={'\u50a8\u5b58\u53d8\u5316\u91cf'} value={fmtVal(result.storageVolume)} unit={'\u4e07m\u00b3'} accent="blue" subtitle={'\u03bc\u00d7F\u00d7\u0394h\u00d7100'} />
        <StatCard title={'\u50a8\u5b58\u53d8\u5316\u91cf'} value={fmtVal(result.storageInYi)} unit={'\u4ebam\u00b3'} accent="cyan" />
      </div>
    </TechCard>
  );
}
