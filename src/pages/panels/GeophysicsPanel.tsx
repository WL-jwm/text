/**
 * GeophysicsPanel — 历史水文地质参数展示面板（自 HydrogeologyHistorical.tsx 拆分）
 */
import { TechCard } from '../../components/UI';
import {
  resistivitySalinityRelation, plainResistivityZones, lithologyResistivity, ionMobility,
} from '../../data/hydrogeologyHistorical';

export function GeophysicsPanel() {
  return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TechCard title="电阻率与矿化度对应关系">
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead><tr className="border-b border-gw-border">
                    <th className="text-gw-muted py-1.5 px-2">电阻率(Ω·m)</th>
                    <th className="text-gw-muted py-1.5 px-2">矿化度(g/L)</th>
                    <th className="text-left text-gw-muted py-1.5 px-2">水类型</th>
                  </tr></thead>
                  <tbody>
                    {resistivitySalinityRelation.map((r, i) => (
                      <tr key={i} className="border-b border-gw-border/20">
                        <td className="py-1.5 px-2 font-mono text-center">{r.resistivityRange}</td>
                        <td className="py-1.5 px-2 font-mono text-center">{r.salinityRange}</td>
                        <td className="py-1.5 px-2 text-gw-text">{r.waterType}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TechCard>
            <TechCard title="河北平原电阻率分区">
              <div className="overflow-x-auto">
                <table className="w-full text-[10px]">
                  <thead><tr className="border-b border-gw-border">
                    <th className="text-left text-gw-muted py-1.5 px-1.5">分区</th>
                    <th className="text-gw-muted py-1.5 px-1.5">砂层</th>
                    <th className="text-gw-muted py-1.5 px-1.5">亚砂土</th>
                    <th className="text-gw-muted py-1.5 px-1.5">亚粘土</th>
                    <th className="text-gw-muted py-1.5 px-1.5">粘土</th>
                  </tr></thead>
                  <tbody>
                    {plainResistivityZones.map((p, i) => (
                      <tr key={i} className="border-b border-gw-border/20">
                        <td className="py-1.5 px-1.5 font-medium text-gw-text">{p.hydroZone}</td>
                        <td className="py-1.5 px-1.5 font-mono text-center">{p.sand}</td>
                        <td className="py-1.5 px-1.5 font-mono text-center">{p.siltySand}</td>
                        <td className="py-1.5 px-1.5 font-mono text-center">{p.siltyClay}</td>
                        <td className="py-1.5 px-1.5 font-mono text-center">{p.clay}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TechCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TechCard title="岩性电阻率参数" badge="钓鱼台水库">
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead><tr className="border-b border-gw-border">
                    <th className="text-left text-gw-muted py-1.5 px-2">岩性</th>
                    <th className="text-gw-muted py-1.5 px-2">电阻率(Ω·m)</th>
                  </tr></thead>
                  <tbody>
                    {lithologyResistivity.map((l, i) => (
                      <tr key={i} className="border-b border-gw-border/20">
                        <td className="py-1.5 px-2 font-medium text-gw-text">{l.lithology}</td>
                        <td className="py-1.5 px-2 font-mono text-center">{l.resistivity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TechCard>
            <TechCard title="离子迁移率(18°C)">
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead><tr className="border-b border-gw-border">
                    <th className="text-left text-gw-muted py-1.5 px-2">离子</th>
                    <th className="text-gw-muted py-1.5 px-2">迁移率(×10⁻⁶ cm²/(s·V))</th>
                    <th className="text-left text-gw-muted py-1.5 px-2">类型</th>
                  </tr></thead>
                  <tbody>
                    {ionMobility.map((ion, i) => (
                      <tr key={i} className="border-b border-gw-border/20">
                        <td className="py-1.5 px-2 font-medium text-gw-text font-mono">{ion.ion}</td>
                        <td className="py-1.5 px-2 font-mono text-center">{ion.mobility}</td>
                        <td className="py-1.5 px-2 text-gw-muted text-[10px]">{ion.ionType}</td>
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
