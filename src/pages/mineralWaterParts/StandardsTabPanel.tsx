/**
 * 拆分自 MineralWater.tsx — 标准对比面板（界限指标 / 感官要求 / 污染物限量）
 */

import { Shield, Beaker, Gauge } from 'lucide-react';
import { TechCard, TechTable, DataSourceNote } from '../../components/UI';
import { mineralWaterStandards } from '../../data/mineralWater';
import { CrossLinkPanel } from '../../components/CrossLink';

export function StandardsTabPanel() {
  return (
    <div className="space-y-4">
      <div className="p-3 rounded-lg bg-gw-blue/10 border border-gw-blue/20">
        <p className="text-xs text-gw-text font-medium">{mineralWaterStandards.nationalStandard}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TechCard title="界限指标" icon={Shield}>
          <TechTable
            headers={['指标', '限值', '单位', '备注']}
            rows={mineralWaterStandards.limits.map(l => [l.indicator, l.threshold, l.unit, l.note])}
          />
        </TechCard>

        <TechCard title="感官要求" icon={Beaker}>
          <TechTable
            headers={['指标', '限值', '备注']}
            rows={mineralWaterStandards.sensoryLimits.map(l => [l.indicator, l.limit, l.note])}
          />
        </TechCard>

        <TechCard title="污染物限量" icon={Gauge} className="lg:col-span-2">
          <TechTable
            headers={['指标', '限值']}
            rows={mineralWaterStandards.contaminantLimits.map(l => [l.indicator, l.limit])}
          />
        </TechCard>
      </div>      <CrossLinkPanel currentPath="/mineral-water" />
  <DataSourceNote source="GB 8537-2018 饮用天然矿泉水" version="国标限值" />
    </div>
  );
}
