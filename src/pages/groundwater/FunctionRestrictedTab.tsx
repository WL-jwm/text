import React from 'react';
import { TechCard } from '../../components/UI';
import { restrictedZones } from '../../data/groundwaterFunction';

export function FunctionRestrictedTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TechCard title="禁止开采区" badge={`${restrictedZones.forbidden.length}区`}>
          <div className="space-y-2">
            {restrictedZones.forbidden.map((z, i) => (
              <div key={i} className="p-3 bg-red-500/5 rounded-lg border border-red-500/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gw-text">{z.city}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">{z.status}</span>
                </div>
                <p className="text-[10px] text-gw-muted">{z.scope}</p>
                <p className="text-[9px] text-gw-muted/70 mt-0.5">{z.reason}</p>
              </div>
            ))}
          </div>
        </TechCard>
        <TechCard title="限制开采区" badge={`${restrictedZones.limited.length}区`}>
          <div className="space-y-2">
            {restrictedZones.limited.map((z, i) => (
              <div key={i} className="p-3 bg-amber-500/5 rounded-lg border border-amber-500/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gw-text">{z.city}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">{z.status}</span>
                </div>
                <p className="text-[10px] text-gw-muted">{z.scope}</p>
                <p className="text-[9px] text-gw-muted/70 mt-0.5">{z.reason}</p>
              </div>
            ))}
          </div>
        </TechCard>
      </div>

      <TechCard title="禁采/限采区管理政策" badge="政策依据">
        <div className="space-y-2">
          <p className="text-xs text-gw-muted">
            <span className="text-gw-text font-semibold">禁止开采区：</span>在禁止开采区内，除应急供水外严禁开凿新井，
            已有的取水许可证到期后不再延续。沧州、衡水、廊坊三市深层承压水已全域划入禁采区。
          </p>
          <p className="text-xs text-gw-muted">
            <span className="text-gw-text font-semibold">限制开采区：</span>在限制开采区内，严格控制新增取水许可，
            逐步压减现有开采量。石家庄、邢台、邯郸等市浅层地下水超采区已实施限采管理。
          </p>
          <p className="text-xs text-gw-muted">
            <span className="text-gw-text font-semibold">水源替代：</span>禁采区和限采区的水源替代主要依靠南水北调中线工程、
            引黄入冀补淀工程和当地地表水联合调度。2024年全省地下水供水量已压减至94.5亿m³。
          </p>
        </div>
      </TechCard>
    </div>
  );
}
