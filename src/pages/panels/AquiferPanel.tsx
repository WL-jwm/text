/**
 * AquiferPanel — 历史水文地质参数展示面板（自 HydrogeologyHistorical.tsx 拆分）
 */
import { TechCard } from '../../components/UI';
import {
  aquiferYieldRate, kValueByZone, deepWaterParams, regionSpecificYield,
} from '../../data/hydrogeologyHistorical';

export function AquiferPanel() {
  return (
        <div className="space-y-4">
          <TechCard title="含水层出水率经验值" badge="m³/h·m³">
            <p className="text-[10px] text-gw-muted mb-2">单位：厚度1m砂层水位降低1m时的出水量</p>
            <div className="overflow-x-auto max-h-[350px] overflow-y-auto scrollbar-thin">
              <table className="w-full text-[11px]">
                <thead className="sticky top-0 bg-gw-card"><tr className="border-b border-gw-border">
                  <th className="text-left text-gw-muted py-1.5 px-2">岩性</th>
                  <th className="text-gw-muted py-1.5 px-2">含水组</th>
                  <th className="text-left text-gw-muted py-1.5 px-2">分区</th>
                  <th className="text-gw-muted py-1.5 px-2">出水率</th>
                </tr></thead>
                <tbody>
                  {aquiferYieldRate.map((a, i) => (
                    <tr key={i} className="border-b border-gw-border/20 data-row">
                      <td className="py-1.5 px-2 font-medium text-gw-text">{a.lithology}</td>
                      <td className="py-1.5 px-2 text-center font-mono">{a.aquiferGroup}</td>
                      <td className="py-1.5 px-2 text-gw-muted text-[10px]">{a.region}</td>
                      <td className="py-1.5 px-2 font-mono text-center">{a.range}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TechCard>

          <TechCard title="渗透系数K值分区统计" badge="m/d">
            <p className="text-[10px] text-gw-muted mb-2">第I含水组各平原分区渗透系数对比</p>
            <div className="overflow-x-auto max-h-[350px] overflow-y-auto scrollbar-thin">
              <table className="w-full text-[11px]">
                <thead className="sticky top-0 bg-gw-card"><tr className="border-b border-gw-border">
                  <th className="text-left text-gw-muted py-1.5 px-2">岩性</th>
                  <th className="text-gw-muted py-1.5 px-2">含水组</th>
                  <th className="text-left text-gw-muted py-1.5 px-2">平原分区</th>
                  <th className="text-gw-muted py-1.5 px-2">K值(m/d)</th>
                </tr></thead>
                <tbody>
                  {kValueByZone.map((k, i) => (
                    <tr key={i} className="border-b border-gw-border/20 data-row">
                      <td className="py-1.5 px-2 font-medium text-gw-text">{k.lithology}</td>
                      <td className="py-1.5 px-2 text-center font-mono">{k.aquiferGroup}</td>
                      <td className="py-1.5 px-2 text-gw-muted text-[10px]">{k.plainZone}</td>
                      <td className="py-1.5 px-2 font-mono text-center">{k.range}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TechCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TechCard title="深层水参数" badge="沧州/衡水/邢台">
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead><tr className="border-b border-gw-border">
                    <th className="text-left text-gw-muted py-1.5 px-2">地区</th>
                    <th className="text-gw-muted py-1.5 px-2">弹性释放系数S</th>
                    <th className="text-gw-muted py-1.5 px-2">越流补给系数e</th>
                  </tr></thead>
                  <tbody>
                    {deepWaterParams.map((d, i) => (
                      <tr key={i} className="border-b border-gw-border/20">
                        <td className="py-1.5 px-2 font-medium text-gw-text">{d.region}</td>
                        <td className="py-1.5 px-2 font-mono text-center">{d.elasticReleaseCoeff}</td>
                        <td className="py-1.5 px-2 font-mono text-center">{d.leakageRechargeCoeff}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TechCard>
            <TechCard title="各市给水度与砂层厚度">
              <div className="overflow-x-auto max-h-[250px] overflow-y-auto scrollbar-thin">
                <table className="w-full text-[11px]">
                  <thead className="sticky top-0 bg-gw-card"><tr className="border-b border-gw-border">
                    <th className="text-left text-gw-muted py-1.5 px-2">地区</th>
                    <th className="text-gw-muted py-1.5 px-2">砂厚(m)</th>
                    <th className="text-gw-muted py-1.5 px-2">给水度</th>
                    <th className="text-gw-muted py-1.5 px-2">静储量(亿m³)</th>
                  </tr></thead>
                  <tbody>
                    {regionSpecificYield.map((r, i) => (
                      <tr key={i} className="border-b border-gw-border/20">
                        <td className="py-1.5 px-2 font-medium text-gw-text">{r.region}</td>
                        <td className="py-1.5 px-2 font-mono text-center">{r.sandThickness}</td>
                        <td className="py-1.5 px-2 font-mono text-center">{r.specificYield}</td>
                        <td className="py-1.5 px-2 font-mono text-center">{r.staticReserve}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TechCard>
          </div>
        </div>
  );
}
