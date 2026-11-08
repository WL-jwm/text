/**
 * 拆分自 SystemZoning.tsx — 补给排泄 Tab 面板
 */

import { zoneRechargeDischarge } from '../../data/systemZoning';
import { TechCard } from '../../components/UI';

export function RechargeTab() {
  return (
        <div className="space-y-4">
          <TechCard title="系统区补给排泄特征总表">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gw-border">
                  <th className="text-left text-gw-muted py-2 px-2 text-xs">编号</th>
                  <th className="text-left text-gw-muted py-2 px-2 text-xs">名称</th>
                  <th className="text-gw-muted py-2 px-2 text-xs">降水入渗</th>
                  <th className="text-gw-muted py-2 px-2 text-xs">河流渗漏</th>
                  <th className="text-gw-muted py-2 px-2 text-xs">侧向补给</th>
                  <th className="text-gw-muted py-2 px-2 text-xs">灌溉回渗</th>
                  <th className="text-gw-muted py-2 px-2 text-xs">蒸发排泄</th>
                  <th className="text-gw-muted py-2 px-2 text-xs">人工开采</th>
                  <th className="text-gw-muted py-2 px-2 text-xs">泉水排泄</th>
                  <th className="text-gw-muted py-2 px-2 text-xs">流出方向</th>
                </tr></thead>
                <tbody>
                  {zoneRechargeDischarge.map((r, i) => (
                    <tr key={i} className="border-b border-gw-border/30 data-row">
                      <td className="py-2 px-2 text-xs font-mono text-gw-highlight">{r.code}</td>
                      <td className="py-2 px-2 text-xs text-gw-text">{r.name}</td>
                      <td className="py-2 px-2 text-[10px] text-gw-muted">{r.rainfallInfiltration}</td>
                      <td className="py-2 px-2 text-[10px] text-gw-muted">{r.riverLeakage}</td>
                      <td className="py-2 px-2 text-[10px] text-gw-muted">{r.lateralInflow}</td>
                      <td className="py-2 px-2 text-[10px] text-gw-muted">{r.irrigationReturn}</td>
                      <td className="py-2 px-2 text-[10px] text-gw-muted">{r.evaporation}</td>
                      <td className="py-2 px-2 text-[10px] text-gw-muted">{r.artificialExtraction}</td>
                      <td className="py-2 px-2 text-[10px] text-gw-muted">{r.springDischarge}</td>
                      <td className="py-2 px-2 text-[10px] text-gw-muted">{r.outflow}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TechCard>

          <TechCard title="补给排泄特征分析" badge="水均衡">
            <div className="space-y-2">
              <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">补给模式：</span>山前区以大气降水入渗为主（补给模数10~25万m³/km²·a），山间盆地有河流渗漏补给，平原区还有灌溉回渗和渠系渗漏等人工补给途径。</p>
              <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">排泄演变：</span>天然状态下以泉水排泄和潜水蒸发为主，20世纪70年代后人工开采成为主要排泄方式。1980-2015年深层超采导致天然排泄大幅减少。</p>
              <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">南水北调影响：</span>2015年通水后，受水区（沧州、衡水、邢台等）地下水开采量大幅压减，水均衡逐步向天然状态恢复。</p>
            </div>
          </TechCard>
        </div>
  );
}
