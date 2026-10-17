/**
 * 面板: WellPanel（拆分自 AquiferParamTab.tsx）
 */
import { fmtVal, calcWellParams } from '../../../utils/aquiferParamCalculator';
import { TechCard, StatCard } from '../../UI';
import { Activity } from 'lucide-react';
import { useMemo, useState } from 'react';
import { NumInput } from './NumInput';

export function WellPanel() {
  const [q, setQ] = useState(1200);
  const [s, setS] = useState(5);
  const [m, setM] = useState(20);
  const [k, setK] = useState(15);

  const result = useMemo(() =>
    calcWellParams({ dischargeQ: q, drawdownS: s, aquiferThicknessM: m, hydraulicK: k }),
    [q, s, m, k],
  );

  return (
    <TechCard icon={Activity} badge={'\u4e95\u53c2\u6570\u8ba1\u7b97'}>
      <p className="text-[10px] text-gw-muted mb-3">{'T = K\u00b7M, q = Q/(s\u00b7M), R \u2248 2s\u00b7\u221a(K\u00b7M)'}</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <NumInput label={'\u51fa\u6c34\u91cf Q'} value={q} onChange={setQ} unit="m\u00b3/d" />
        <NumInput label={'\u964d\u6df1 s'} value={s} onChange={setS} unit="m" />
        <NumInput label={'\u542b\u6c34\u5c42\u539a\u5ea6 M'} value={m} onChange={setM} unit="m" />
        <NumInput label={'\u6e17\u900f\u7cfb\u6570 K'} value={k} onChange={setK} unit="m/d" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title={'\u5bfc\u6c34\u7cfb\u6570 T'} value={fmtVal(result.transmissivityT)} unit="m\u00b2/d" accent="blue" subtitle="K \u00d7 M" />
        <StatCard title={'\u5355\u4f4d\u6d8c\u6c34\u91cf q'} value={fmtVal(result.specificDischarge)} unit="m\u00b3/h\u00b7m\u00b7m" accent="cyan" subtitle="Q/(24\u00b7s\u00b7M)" />
        <StatCard title={'\u5f71\u54cd\u534a\u5f84 R'} value={fmtVal(result.influenceRadiusR)} unit="m" accent="purple" subtitle="2s\u00b7\u221a(K\u00b7M)" />
        <StatCard title={'\u5bcc\u6c34\u6027\u8bc4\u4ef7'} value={result.wellEfficiency} accent="emerald" subtitle={'q = ' + fmtVal(result.specificDischarge)} />
      </div>
    </TechCard>
  );
}
